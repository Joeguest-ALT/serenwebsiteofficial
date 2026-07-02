// Seren staff chatbot — edge function
// Handles three actions: 'verify_pin', 'chat', 'logout'.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── CORS ─────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Hash helper (PINs are stored hashed) ──────────────────────
async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin + "seren-salt-v1");
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Knowledge base loader (cached in memory) ──────────────────
let knowledgeBaseCache: string | null = null;
async function getKnowledgeBase(): Promise<string> {
  if (knowledgeBaseCache) return knowledgeBaseCache;
  const { data, error } = await supabase.storage
    .from("chatbot-knowledge")
    .download("seren-staff-chatbot-knowledge-base.md");
  if (error) throw new Error(`KB load failed: ${error.message}`);
  knowledgeBaseCache = await data.text();
  return knowledgeBaseCache;
}

// ─── Session helpers ───────────────────────────────────────────
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getStaffFromToken(token: string) {
  const { data, error } = await supabase
    .from("staff_chat_sessions")
    .select("id, staff_member_id, expires_at, revoked, staff_members(full_name, role, staff_type, is_active)")
    .eq("token", token)
    .single();
  if (error || !data) return null;
  if (data.revoked) return null;
  if (new Date(data.expires_at) < new Date()) return null;
  if (!data.staff_members?.is_active) return null;
  return {
    sessionId: data.id,
    staffMemberId: data.staff_member_id,
    name: data.staff_members.full_name,
    role: data.staff_members.role,
    staffType: data.staff_members.staff_type,
  };
}

// ─── Action: verify_pin ────────────────────────────────────────
async function verifyPin(pin: string) {
  if (!pin || !/^\d{4,6}$/.test(pin)) {
    return { ok: false, error: "Invalid PIN format" };
  }
  const hash = await hashPin(pin);
  const { data: staff, error } = await supabase
    .from("staff_members")
    .select("id, full_name, role, staff_type, is_active")
    .eq("pin_hash", hash)
    .eq("is_active", true)
    .single();
  if (error || !staff) {
    return { ok: false, error: "PIN not recognised" };
  }

  // Issue session token, valid for 30 days
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { error: sessionError } = await supabase.from("staff_chat_sessions").insert({
    staff_member_id: staff.id,
    token,
    expires_at: expiresAt,
  });
  if (sessionError) {
    return { ok: false, error: "Session creation failed" };
  }

  // Update last_used_at on the staff record
  await supabase.from("staff_members").update({ last_used_at: new Date().toISOString() }).eq("id", staff.id);

  return {
    ok: true,
    token,
    expiresAt,
    staff: { name: staff.full_name, role: staff.role, staffType: staff.staff_type },
  };
}

// ─── Action: chat ──────────────────────────────────────────────
async function chat(token: string, question: string) {
  const staff = await getStaffFromToken(token);
  if (!staff) {
    return { ok: false, error: "Session expired — please re-enter your PIN", code: "AUTH" };
  }
  if (!question || question.length > 2000) {
    return { ok: false, error: "Question is empty or too long (max 2000 chars)" };
  }

  const kb = await getKnowledgeBase();
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const systemPrompt = `You are the Seren Support Services staff assistant. You are answering ${staff.name}, who works as ${staff.role} (${staff.staffType} staff).

Today's date is ${today}.

Below is your complete knowledge base. Answer ONLY from this content. If the question isn't covered, use the fallback message exactly as written. Do not invent details. Keep answers brief, plain, professional, warm.

When answering pay date questions, use ${staff.name}'s specific calendar: ${staff.staffType === "office" ? "office monthly cycle (13th–12th, paid 19th, next working day if weekend)" : "community 4-weekly cycle"}.

═══════════════════════════════════════════════════
KNOWLEDGE BASE
═══════════════════════════════════════════════════

${kb}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Anthropic error:", err);
    return { ok: false, error: "Sorry, I couldn't process that. Try again in a moment." };
  }

  const data = await response.json();
  const answer = data.content?.[0]?.text ?? "(no answer generated)";
  const tokensUsed = (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0);

  // Log the Q&A
  await supabase.from("staff_chat_log").insert({
    session_id: staff.sessionId,
    staff_member_id: staff.staffMemberId,
    question,
    answer,
    tokens_used: tokensUsed,
  });

  return { ok: true, answer, staff: { name: staff.name, role: staff.role } };
}

// ─── Action: logout ────────────────────────────────────────────
async function logout(token: string) {
  await supabase.from("staff_chat_sessions").update({ revoked: true }).eq("token", token);
  return { ok: true };
}

// ─── Main handler ──────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { action, pin, token, question } = await req.json();

    let result;
    if (action === "verify_pin") result = await verifyPin(pin);
    else if (action === "chat") result = await chat(token, question);
    else if (action === "logout") result = await logout(token);
    else result = { ok: false, error: "Unknown action" };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Handler error:", e);
    return new Response(JSON.stringify({ ok: false, error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
