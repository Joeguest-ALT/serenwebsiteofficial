/* Seren staff chatbot — front-end layer v2
 * Injects "Staff login" as a matching chatbot-option button in the main menu.
 * Uses MutationObserver to keep it pinned even when the chatbot re-renders.
 */
(function () {
  "use strict";

  // ─── Config ─────────────────────────────────────────────────
  const SUPABASE_URL = "https://wwwfvgqgcwyudsaoszww.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3d2Z2Z3FnY3d5dWRzYW9zend3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzgwMjcsImV4cCI6MjA5NTMxNDAyN30.NZ7HAOUbw8Q2l5wUAAPLOV2XZ70tngVE-Aw6KeR9i80";
  const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/staff-chat`;
  const TOKEN_STORAGE_KEY = "seren_staff_token";
  const TOKEN_EXPIRY_KEY = "seren_staff_token_expires";
  function welcomeFor(name) {
    const first = (name || "").split(/\s+/)[0] || "";
    const greet = first ? `Hi ${first} 👋` : "Hi 👋";
    return `${greet} Ask me anything about Seren — policies, pay, who to contact. For anything urgent or person-specific, speak to your team leader.`;
  }
  const STAFF_BTN_FLAG = "data-staff-login-btn";

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
    localStorage.removeItem("seren_staff_name");
  }

  function injectStyles() {
    if (document.getElementById("seren-staff-styles")) return;
    const css = `
      .staff-pin-screen{padding:24px 20px;text-align:center;}
      .staff-pin-screen h3{margin:0 0 8px;color:#0E2C53;font-size:16px;}
      .staff-pin-screen p{margin:0 0 16px;color:#666;font-size:13px;}
      .staff-pin-input{width:140px;padding:12px;font-size:20px;text-align:center;letter-spacing:8px;border:2px solid #0E2C53;border-radius:8px;outline:none;-webkit-text-security:disc;text-security:disc;}
      .staff-pin-input:focus{border-color:#FBBD1E;}
      .staff-pin-submit{display:block;margin:12px auto 0;padding:10px 28px;background:#0E2C53;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;}
      .staff-pin-submit:hover{background:#1a3a6b;}
      .staff-pin-submit:disabled{opacity:0.5;cursor:not-allowed;}
      .staff-pin-error{color:#c0392b;font-size:12px;margin-top:8px;min-height:16px;}
      .staff-pin-back{display:inline-block;margin-top:12px;font-size:12px;color:#888;text-decoration:underline;cursor:pointer;background:none;border:none;}
      .staff-msg{padding:10px 14px;border-radius:14px;margin:6px 0;max-width:85%;font-size:14px;line-height:1.45;word-wrap:break-word;white-space:pre-wrap;}
      .staff-msg-user{background:#0E2C53;color:#fff;margin-left:auto;border-bottom-right-radius:4px;}
      .staff-msg-bot{background:#f1f3f7;color:#0E2C53;border-bottom-left-radius:4px;}
      .staff-msg-bot strong{color:#0E2C53;}
      .staff-typing{display:inline-flex;gap:3px;padding:10px 14px;}
      .staff-typing span{width:6px;height:6px;background:#888;border-radius:50%;animation:staffTypingBounce 1.2s infinite ease-in-out;}
      .staff-typing span:nth-child(2){animation-delay:0.15s;}
      .staff-typing span:nth-child(3){animation-delay:0.3s;}
      @keyframes staffTypingBounce{0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-5px);opacity:1;}}
      .staff-logout{display:block;margin:8px auto 0;font-size:11px;color:#888;text-decoration:underline;cursor:pointer;background:none;border:none;padding:4px;}
      .staff-logout:hover{color:#c0392b;}
    `;
    const tag = document.createElement("style");
    tag.id = "seren-staff-styles";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  let mode = "public"; // public | pin | staff
  let observerStarted = false;

  function isMainMenuShowing() {
    const opts = $("#chatbot-options");
    if (!opts) return false;
    const buttons = opts.querySelectorAll("button.chatbot-option");
    for (const b of buttons) {
      if (/just browsing/i.test(b.textContent)) return true;
    }
    return false;
  }

  function injectStaffButton() {
    if (mode !== "public") return;
    const opts = $("#chatbot-options");
    if (!opts) return;
    if (opts.querySelector(`[${STAFF_BTN_FLAG}]`)) return;
    if (!isMainMenuShowing()) return;

    const btn = document.createElement("button");
    btn.className = "chatbot-option";
    btn.setAttribute(STAFF_BTN_FLAG, "1");
    btn.innerHTML = `<span class="chatbot-option-emoji">🔒</span> Staff login`;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      enterPinMode();
    });
    opts.appendChild(btn);
  }

  function startObserver() {
    if (observerStarted) return;
    const opts = $("#chatbot-options");
    if (!opts) return;
    observerStarted = true;
    const observer = new MutationObserver(() => injectStaffButton());
    observer.observe(opts, { childList: true, subtree: false });
    injectStaffButton();
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
    if (w) w.style.display = "flex";
  }

  function enterPinMode() {
    if (getStoredToken()) {
      enterStaffMode();
      return;
    }
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
      <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" minlength="2" class="staff-pin-input" id="staff-pin-input" autocomplete="off" />
      <button class="staff-pin-submit" id="staff-pin-submit">Continue</button>
      <div class="staff-pin-error" id="staff-pin-error"></div>
      <button class="staff-pin-back" id="staff-pin-back">← Back to main menu</button>
    `;
    msgs.appendChild(screen);
    setTimeout(() => $("#staff-pin-input")?.focus(), 50);
    $("#staff-pin-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("#staff-pin-submit")?.click();
    });
    $("#staff-pin-submit")?.addEventListener("click", async () => {
      const input = $("#staff-pin-input");
      const submit = $("#staff-pin-submit");
      const errEl = $("#staff-pin-error");
      const pin = input.value.trim();
      errEl.textContent = "";
      if (!/^\d{2,6}$/.test(pin)) {
        errEl.textContent = "PIN must be 2–6 digits.";
        return;
      }
      submit.disabled = true;
      submit.textContent = "Checking…";
      try {
        const res = await callFunction({ action: "verify_pin", pin });
        if (res.ok) {
          storeToken(res.token, res.expiresAt);
          localStorage.setItem("seren_staff_name", res.staff?.name || "");
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
    $("#staff-pin-back")?.addEventListener("click", () => exitStaffMode());
  }

  function enterStaffMode() {
    mode = "staff";
    clearMessages();
    hideOptions();
    showTextInput();
    appendBotMessage(welcomeFor(localStorage.getItem("seren_staff_name")));
    const sendBtn = $("#chatbot-send");
    const txtInput = $("#chatbot-text-input");
    if (txtInput && !txtInput.dataset.staffWired) {
      txtInput.dataset.staffWired = "1";
      txtInput.addEventListener("keydown", (e) => {
        if (mode === "staff" && e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          e.stopImmediatePropagation();
          sendStaffMessage();
        }
      }, true);
    }
    if (sendBtn && !sendBtn.dataset.staffWired) {
      sendBtn.dataset.staffWired = "1";
      sendBtn.addEventListener("click", (e) => {
        if (mode === "staff") { e.preventDefault(); e.stopImmediatePropagation(); sendStaffMessage(); }
      }, true);
    }
    const msgs = $("#chatbot-messages");
    if (msgs && msgs.parentElement && !msgs.parentElement.querySelector(".staff-logout")) {
      const out = document.createElement("button");
      out.className = "staff-logout";
      out.textContent = "Log out of staff mode";
      out.onclick = () => logout();
      msgs.parentElement.insertBefore(out, msgs.nextSibling);
    }
    setTimeout(() => $("#chatbot-text-input")?.focus(), 100);
  }

  function exitStaffMode() {
    mode = "public";
    clearMessages();
    hideTextInput();
    showOptions();
    document.querySelectorAll(".staff-logout").forEach(el => el.remove());
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

  function init() {
    if (!$("#seren-chatbot")) return;
    injectStyles();
    startObserver();
    document.querySelectorAll(".staff-login-link").forEach(el => el.remove());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
