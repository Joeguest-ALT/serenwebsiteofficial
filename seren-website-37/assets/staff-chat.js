/* Seren staff chatbot — front-end layer
 * Attaches a "Staff login" flow to the existing Seren chatbot.
 * Communicates with the staff-chat Supabase Edge Function.
 */
(function () {
  "use strict";

  // ─── Config ─────────────────────────────────────────────────
  const SUPABASE_URL = "https://wwwfvgqgcwyudsaoszww.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3d2Z2Z3FnY3d5dWRzYW9zend3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzgwMjcsImV4cCI6MjA5NTMxNDAyN30.NZ7HAOUbw8Q2l5wUAAPLOV2XZ70tngVE-Aw6KeR9i80";
  const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/staff-chat`;
  const TOKEN_STORAGE_KEY = "seren_staff_token";
  const TOKEN_EXPIRY_KEY = "seren_staff_token_expires";
  const WELCOME =
    "Hi 👋 Ask me anything about Seren — policies, pay, who to contact. For anything urgent or person-specific, speak to your team leader.";

  // ─── Helpers ────────────────────────────────────────────────
  function $(sel, root) { return (root || document).querySelector(sel); }

  function callFunction(payload) {
    return fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(r => r.json());
  }

  function getStoredToken() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expires = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!token || !expires) return null;
    if (new Date(expires) < new Date()) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      return null;
    }
    return token;
  }

  function storeToken(token, expiresAt) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  // ─── Inject styles ──────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("seren-staff-styles")) return;
    const css = `
      .staff-login-link{display:block;text-align:center;margin-top:8px;font-size:11px;color:#888;text-decoration:none;cursor:pointer;padding:4px;}
      .staff-login-link:hover{color:#0E1B37;}
      .staff-pin-screen{padding:24px 20px;text-align:center;}
      .staff-pin-screen h3{margin:0 0 8px;color:#0E1B37;font-size:16px;}
      .staff-pin-screen p{margin:0 0 16px;color:#666;font-size:13px;}
      .staff-pin-input{width:140px;padding:12px;font-size:20px;text-align:center;letter-spacing:8px;border:2px solid #0E1B37;border-radius:8px;outline:none;-webkit-text-security:disc;text-security:disc;}
      .staff-pin-input:focus{border-color:#FBBD1E;}
      .staff-pin-submit{display:block;margin:12px auto 0;padding:10px 28px;background:#0E1B37;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;}
      .staff-pin-submit:hover{background:#1a2c54;}
      .staff-pin-submit:disabled{opacity:0.5;cursor:not-allowed;}
      .staff-pin-error{color:#c0392b;font-size:12px;margin-top:8px;min-height:16px;}
      .staff-pin-back{display:inline-block;margin-top:12px;font-size:12px;color:#888;text-decoration:underline;cursor:pointer;background:none;border:none;}
      .staff-msg{padding:10px 14px;border-radius:14px;margin:6px 0;max-width:85%;font-size:14px;line-height:1.45;word-wrap:break-word;white-space:pre-wrap;}
      .staff-msg-user{background:#0E1B37;color:#fff;margin-left:auto;border-bottom-right-radius:4px;}
      .staff-msg-bot{background:#f1f3f7;color:#0E1B37;border-bottom-left-radius:4px;}
      .staff-msg-bot strong{color:#0E1B37;}
      .staff-typing{display:inline-flex;gap:3px;padding:10px 14px;}
      .staff-typing span{width:6px;height:6px;background:#888;border-radius:50%;animation:staffTypingBounce 1.2s infinite ease-in-out;}
      .staff-typing span:nth-child(2){animation-delay:0.15s;}
      .staff-typing span:nth-child(3){animation-delay:0.3s;}
      @keyframes staffTypingBounce{0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-5px);opacity:1;}}
      .staff-logout{display:inline-block;font-size:11px;color:#888;text-decoration:underline;cursor:pointer;background:none;border:none;padding:4px;}
      .staff-logout:hover{color:#c0392b;}
    `;
    const tag = document.createElement("style");
    tag.id = "seren-staff-styles";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // ─── State ──────────────────────────────────────────────────
  let mode = "public"; // public | pin | staff
  let initialised = false;

  // ─── UI builders ────────────────────────────────────────────
  function addStaffLoginLink() {
    const footer = $("#chatbot-footer");
    if (!footer || $(".staff-login-link", footer)) return;
    const link = document.createElement("a");
    link.className = "staff-login-link";
    link.textContent = "Staff login";
    link.href = "#";
    link.onclick = (e) => { e.preventDefault(); enterPinMode(); };
    footer.appendChild(link);
  }

  function clearMessages() {
    const m = $("#chatbot-messages");
    if (m) m.innerHTML = "";
  }

  function hideOptions() {
    const o = $("#chatbot-options");
    if (o) o.style.display = "none";
  }

  function showOptions() {
    const o = $("#chatbot-options");
    if (o) o.style.display = "";
  }

  function hideTextInput() {
    const w = $("#chatbot-text-input-wrap");
    if (w) w.style.display = "none";
  }

  function showTextInput() {
    const w = $("#chatbot-text-input-wrap");
    if (w) w.style.display = "";
  }

  function enterPinMode() {
    mode = "pin";
    clearMessages();
    hideOptions();
    hideTextInput();
    const msgs = $("#chatbot-messages");
    if (!msgs) return;
    const screen = document.createElement("div");
    screen.className = "staff-pin-screen";
    screen.innerHTML = `
      <h3>Staff access</h3>
      <p>Enter your PIN to chat with the staff assistant.</p>
      <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" class="staff-pin-input" id="staff-pin-input" autocomplete="off" />
      <button class="staff-pin-submit" id="staff-pin-submit">Continue</button>
      <div class="staff-pin-error" id="staff-pin-error"></div>
      <button class="staff-pin-back" id="staff-pin-back">← Back to main menu</button>
    `;
    msgs.appendChild(screen);
    const input = $("#staff-pin-input");
    const submit = $("#staff-pin-submit");
    const back = $("#staff-pin-back");
    const errEl = $("#staff-pin-error");
    setTimeout(() => input?.focus(), 50);
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit?.click();
    });
    submit?.addEventListener("click", async () => {
      const pin = input.value.trim();
      errEl.textContent = "";
      if (!/^\d{4,6}$/.test(pin)) {
        errEl.textContent = "PIN must be 4–6 digits.";
        return;
      }
      submit.disabled = true;
      submit.textContent = "Checking…";
      try {
        const res = await callFunction({ action: "verify_pin", pin });
        if (res.ok) {
          storeToken(res.token, res.expiresAt);
          enterStaffMode();
        } else {
          errEl.textContent = res.error || "PIN not recognised.";
          submit.disabled = false;
          submit.textContent = "Continue";
        }
      } catch (e) {
        errEl.textContent = "Network error. Try again.";
        submit.disabled = false;
        submit.textContent = "Continue";
      }
    });
    back?.addEventListener("click", () => exitStaffMode());
  }

  function enterStaffMode() {
    mode = "staff";
    clearMessages();
    hideOptions();
    showTextInput();
    appendBotMessage(WELCOME);
    // Wire up the existing send button & input for our use
    const sendBtn = $("#chatbot-send");
    const txtInput = $("#chatbot-text-input");
    if (txtInput && !txtInput.dataset.staffWired) {
      txtInput.dataset.staffWired = "1";
      txtInput.addEventListener("keydown", (e) => {
        if (mode === "staff" && e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendStaffMessage();
        }
      });
    }
    if (sendBtn && !sendBtn.dataset.staffWired) {
      sendBtn.dataset.staffWired = "1";
      sendBtn.addEventListener("click", (e) => {
        if (mode === "staff") { e.preventDefault(); sendStaffMessage(); }
      });
    }
    // Add logout link
    const footer = $("#chatbot-footer");
    if (footer) {
      const existing = $(".staff-login-link", footer);
      if (existing) existing.remove();
      if (!$(".staff-logout", footer)) {
        const out = document.createElement("button");
        out.className = "staff-logout";
        out.textContent = "Log out of staff mode";
        out.onclick = () => logout();
        footer.appendChild(out);
      }
    }
    setTimeout(() => $("#chatbot-text-input")?.focus(), 100);
  }

  function exitStaffMode() {
    mode = "public";
    clearMessages();
    hideTextInput();
    showOptions();
    // Restore the staff login link, drop the logout
    const footer = $("#chatbot-footer");
    if (footer) {
      $(".staff-logout", footer)?.remove();
      addStaffLoginLink();
    }
  }

  async function logout() {
    const token = getStoredToken();
    if (token) {
      try { await callFunction({ action: "logout", token }); } catch {}
    }
    clearToken();
    exitStaffMode();
  }

  function appendUserMessage(text) {
    const msgs = $("#chatbot-messages");
    if (!msgs) return;
    const el = document.createElement("div");
    el.className = "staff-msg staff-msg-user";
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function appendBotMessage(text) {
    const msgs = $("#chatbot-messages");
    if (!msgs) return;
    const el = document.createElement("div");
    el.className = "staff-msg staff-msg-bot";
    // Render basic markdown: **bold** and line breaks
    const html = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
    el.innerHTML = html;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function appendTyping() {
    const msgs = $("#chatbot-messages");
    if (!msgs) return null;
    const el = document.createElement("div");
    el.className = "staff-msg staff-msg-bot staff-typing-wrap";
    el.innerHTML = `<div class="staff-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  async function sendStaffMessage() {
    const txtInput = $("#chatbot-text-input");
    if (!txtInput) return;
    const question = txtInput.value.trim();
    if (!question) return;
    const token = getStoredToken();
    if (!token) {
      enterPinMode();
      return;
    }
    txtInput.value = "";
    appendUserMessage(question);
    const typingEl = appendTyping();
    try {
      const res = await callFunction({ action: "chat", token, question });
      typingEl?.remove();
      if (res.ok) {
        appendBotMessage(res.answer);
      } else if (res.code === "AUTH") {
        appendBotMessage("Your session has expired — please log in again.");
        clearToken();
        setTimeout(() => enterPinMode(), 1200);
      } else {
        appendBotMessage(res.error || "Sorry, I couldn't process that. Try again in a moment.");
      }
    } catch (e) {
      typingEl?.remove();
      appendBotMessage("Network error. Please try again.");
    }
  }

  // ─── Boot ───────────────────────────────────────────────────
  function init() {
    if (initialised) return;
    if (!$("#seren-chatbot")) return; // chatbot not on this page
    initialised = true;
    injectStyles();
    addStaffLoginLink();
    // If a valid session already exists, the user can resume staff mode
    // by clicking the staff login link — we don't auto-enter on page load
    // because the chatbot is closed by default and we don't want to
    // pre-load content the user didn't ask for.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
