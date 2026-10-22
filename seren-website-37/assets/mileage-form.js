/* Seren — Carer mileage claim v2.
 *
 * Shared by the standalone /staff page and the website chat widget.
 * One claim per carer per 4-week period (Monday to Sunday, anchored to
 * Monday 12 October 2026). It lives in the database against the carer's
 * sign-in and builds up through the period: open, add, close, come back.
 * Everything is swept to payroll together after midnight on the final
 * Sunday. For journeys that aren't on the rota — rota travel is Birdie's.
 */
(function (w) {
  "use strict";
  if (w.SerenMileage) return;

  var open = false;

  var REASONS = [
    "Double run",
    "Shopping or outing with a client",
    "Medication pick-up",
    "Appointment or hospital visit",
    "Short-notice cover",
    "Office, training or meeting",
    "Other"
  ];

  var CSS = ""
    + ".smf{background:#fff;border:1.5px solid #E2E7EE;border-radius:16px;padding:18px;margin:8px 0 4px;"
    + "font-family:inherit;color:#0E2C53;line-height:1.5;box-sizing:border-box;width:100%;}"
    + ".smf *{box-sizing:border-box;}"
    + ".smf-h{font-size:17px;font-weight:700;margin:0 0 4px;}"
    + ".smf-sub{font-size:12.5px;color:#5B6B80;margin:0 0 12px;}"
    + ".smf-who{background:#F1F4F8;border-radius:9px;padding:10px 12px;font-size:13px;margin:0 0 10px;}"
    + ".smf-period{background:#FDF6E3;border-left:3px solid #FBBD1E;border-radius:8px;padding:10px 13px;margin:0 0 10px;}"
    + ".smf-period b{display:block;font-size:13px;color:#5A4300;}"
    + ".smf-period span{font-size:12px;color:#5A4300;}"
    + ".smf-rule{background:#F1F4F8;border-radius:8px;padding:10px 13px;margin:0 0 14px;}"
    + ".smf-rule b{display:block;font-size:12.5px;color:#0E2C53;}"
    + ".smf-rule span{font-size:11.5px;color:#5B6B80;}"
    + ".smf-lab{font-size:11px;font-weight:700;letter-spacing:.06em;color:#5B6B80;margin:14px 0 8px;}"
    + ".smf-chips{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 4px;}"
    + ".smf-chip{border:1.5px solid #E2E7EE;background:#fff;border-radius:14px;padding:7px 12px;"
    + "font-family:inherit;font-size:12.5px;font-weight:500;color:#0E2C53;cursor:pointer;min-height:34px;}"
    + ".smf-chip:hover{border-color:#0E2C53;}"
    + ".smf-row{border:1.5px solid #E2E7EE;border-radius:11px;padding:10px;margin-bottom:8px;position:relative;}"
    + ".smf-grid{display:flex;gap:8px;margin-bottom:8px;}"
    + ".smf-f{flex:1;min-width:0;}"
    + ".smf-f label{display:block;font-size:11px;font-weight:600;color:#5B6B80;margin-bottom:3px;}"
    + ".smf input,.smf select{width:100%;min-height:44px;font-family:inherit;font-size:15px;padding:9px 11px;"
    + "border:1.5px solid #E2E7EE;border-radius:9px;outline:none;color:#0E2C53;background:#fff;}"
    + ".smf input:focus,.smf select:focus{border-color:#0E2C53;}"
    + ".smf select:invalid{color:#9EA8B6;}"
    + ".smf-late{display:inline-block;background:#FDF6E3;color:#5A4300;font-size:11px;font-weight:500;"
    + "border-radius:8px;padding:3px 9px;margin-top:6px;}"
    + ".smf-x{position:absolute;top:8px;right:10px;background:none;border:none;color:#9EA8B6;"
    + "font-size:16px;cursor:pointer;min-height:24px;padding:0 4px;}"
    + ".smf-x:hover{color:#B3261E;}"
    + ".smf-add{display:block;width:100%;min-height:42px;border:1.5px solid #E2E7EE;border-radius:10px;"
    + "background:#fff;font-family:inherit;font-size:13.5px;font-weight:500;color:#0E2C53;cursor:pointer;margin:2px 0 4px;}"
    + ".smf-add:hover{border-color:#0E2C53;}"
    + ".smf-tot{background:#0E2C53;border-radius:12px;padding:12px 14px;margin:14px 0 12px;color:#fff;"
    + "display:flex;justify-content:space-between;align-items:center;font-size:13px;}"
    + ".smf-tot .v{color:#FBBD1E;font-size:17px;font-weight:700;}"
    + ".smf-acts{display:flex;gap:9px;}"
    + ".smf-btn{flex:1;min-height:48px;border-radius:10px;font-family:inherit;font-size:14.5px;font-weight:700;"
    + "cursor:pointer;border:none;background:#0E2C53;color:#fff;}"
    + ".smf-btn:hover{background:#14386a;}.smf-btn:disabled{opacity:.5;cursor:not-allowed;}"
    + ".smf-btn2{flex:1;min-height:48px;border-radius:10px;font-family:inherit;font-size:14px;font-weight:500;"
    + "cursor:pointer;border:1.5px solid #E2E7EE;background:#fff;color:#0E2C53;}"
    + ".smf-btn2:hover{border-color:#0E2C53;}"
    + ".smf-save{font-size:12px;color:#5B6B80;text-align:right;min-height:16px;margin:6px 0 0;}"
    + ".smf-err{color:#B3261E;font-size:13px;font-weight:500;min-height:18px;margin:8px 0 0;}";

  function injectCss() {
    if (document.getElementById("seren-mileage-css")) return;
    var s = document.createElement("style");
    s.id = "seren-mileage-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escA(s) { return esc(s).replace(/"/g, "&quot;"); }
  function today() { return new Date().toISOString().slice(0, 10); }

  function openForm(o) {
    if (open || !o || !o.mount) return;
    open = true;
    injectCss();

    var box = document.createElement("div");
    box.className = "smf";
    box.innerHTML = '<p class="smf-sub">Opening your claim…</p>';
    o.mount.appendChild(box);
    var scroll = o.scroll || function () {
      try { o.mount.scrollTop = o.mount.scrollHeight; } catch (e) {}
    };
    scroll();

    var st = { journeys: [], meta: null, status: "draft", ref: null };
    var saveTimer = null, saving = false;

    function fail(msg) {
      open = false; box.remove();
      if (o.onBot) o.onBot(msg);
    }

    var t = o.getToken ? o.getToken() : null;
    if (!t) { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }

    o.call({ action: "get_mileage", token: t })
      .then(function (res) {
        if (res && res.code === "AUTH") { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }
        if (!res || !res.ok || !res.eligible) {
          fail((res && res.error) || "Couldn't open your claim. Try again in a moment.");
          return;
        }
        st.meta = res;
        if (res.claim) {
          st.journeys = (res.claim.journeys || []).slice();
          st.status = res.claim.status || "draft";
          st.ref = res.claim.claim_ref || null;
        }
        draw();
      })
      .catch(function () { fail("Couldn't open your claim. Check your signal and try again."); });

    function isLate(dateStr) {
      return dateStr && st.meta
        && (dateStr < st.meta.period_start || dateStr > st.meta.period_end);
    }

    function totalMiles() {
      var m = 0;
      st.journeys.forEach(function (j) { var v = parseFloat(j.miles); if (v > 0) m += v; });
      return Math.round(m * 10) / 10;
    }

    function chips() {
      var seen = {}, out = [];
      for (var i = st.journeys.length - 1; i >= 0 && out.length < 3; i--) {
        var j = st.journeys[i];
        if (!j.from || !j.to || !parseFloat(j.miles) || !j.reason) continue;
        var key = j.from + "|" + j.to + "|" + j.miles;
        if (seen[key]) continue;
        seen[key] = 1;
        out.push({ from: j.from, to: j.to, miles: j.miles, reason: j.reason });
      }
      return out;
    }

    function shortPlace(s) {
      s = String(s || "");
      return s.length > 20 ? s.slice(0, 19) + "…" : s;
    }

    function deadline() {
      if (!st.meta) return "";
      var p = st.meta.period_end.split("-");
      return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]))
        .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
    }

    function periodShort() {
      return st.meta ? st.meta.period_label.replace(/ \d{4}/g, "") : "";
    }

    function reasonOptions(sel) {
      var h = '<option value="" disabled' + (sel ? "" : " selected") + ' hidden>Pick a reason</option>';
      REASONS.forEach(function (r) {
        h += '<option value="' + escA(r) + '"' + (sel === r ? " selected" : "") + ">" + esc(r) + "</option>";
      });
      return h;
    }

    function draw() {
      var sent = st.status === "sent";
      var html = '<p class="smf-h">Mileage claim</p>'
        + '<p class="smf-sub">For carers · journeys that aren’t on your rota.</p>'
        + '<div class="smf-who">Claiming as <b>' + esc(o.name || "you") + "</b></div>"
        + '<div class="smf-period"><b>Claim period: ' + esc(periodShort()) + "</b>"
        + "<span>" + (sent
            ? "Sent — you can still add to it until midnight on " + esc(deadline()) + "."
            : "It saves as you go. Everything goes to payroll together after midnight on " + esc(deadline()) + ". Anything later rolls to the next period.")
        + "</span></div>"
        + '<div class="smf-rule"><b>Not for rota travel.</b>'
        + "<span>Rota journeys are handled through Birdie. Claim here for extras — medication pick-ups, shopping with a client, hospital visits. Home to your first call, and your last call home, is your commute and doesn’t count.</span></div>";

      var ch = chips();
      if (ch.length) {
        html += '<p class="smf-lab">ADD AGAIN</p><div class="smf-chips">'
          + ch.map(function (c, i) {
              return '<button type="button" class="smf-chip" data-chip="' + i + '">'
                + esc(shortPlace(c.from)) + " – " + esc(shortPlace(c.to)) + " · " + esc(c.miles) + " mi</button>";
            }).join("")
          + "</div>";
      }

      html += '<p class="smf-lab">JOURNEYS' + (st.journeys.length ? " · " + st.journeys.length + " SAVED" : "") + "</p>";
      st.journeys.forEach(function (j, i) {
        html += '<div class="smf-row">'
          + '<button type="button" class="smf-x" data-del="' + i + '" aria-label="Remove">×</button>'
          + '<div class="smf-grid">'
          + '<div class="smf-f"><label>Date</label><input type="date" data-i="' + i + '" data-f="date" max="' + today() + '" value="' + escA(j.date || "") + '" /></div>'
          + '<div class="smf-f"><label>Miles</label><input type="number" inputmode="decimal" min="0.1" max="500" step="0.1" data-i="' + i + '" data-f="miles" value="' + escA(j.miles || "") + '" /></div>'
          + "</div>"
          + '<div class="smf-f" style="margin-bottom:8px;"><label>From</label>'
          + '<input type="text" maxlength="140" data-i="' + i + '" data-f="from" value="' + escA(j.from || "") + '" placeholder="e.g. Client’s home, CF23 9AH" /></div>'
          + '<div class="smf-f" style="margin-bottom:8px;"><label>To</label>'
          + '<input type="text" maxlength="140" data-i="' + i + '" data-f="to" value="' + escA(j.to || "") + '" placeholder="e.g. Boots, Albany Road" /></div>'
          + '<div class="smf-f" style="margin-bottom:8px;"><label>What was it for?</label>'
          + '<select data-i="' + i + '" data-f="reason" required>' + reasonOptions(j.reason || "") + "</select></div>"
          + '<div class="smf-f"><label>Note' + (j.reason === "Other" ? " · needed for Other" : " · optional") + "</label>"
          + '<input type="text" maxlength="200" data-i="' + i + '" data-f="note" value="' + escA(j.note || "") + '" /></div>'
          + (isLate(j.date) ? '<span class="smf-late">Outside this claim period — payroll will decide</span>' : "")
          + "</div>";
      });
      html += '<button type="button" class="smf-add" id="smf-add">+  Add a journey</button>';

      html += '<div class="smf-tot"><span>Total this period</span><span class="v">' + totalMiles().toFixed(1) + " miles</span></div>"
        + '<div class="smf-acts">'
        + '<button type="button" class="smf-btn" id="smf-send">' + (sent ? "Send again" : "Send to payroll") + "</button>"
        + '<button type="button" class="smf-btn2" id="smf-close">Close — it’s saved</button>'
        + "</div>"
        + '<p class="smf-save" id="smf-save"></p>'
        + '<p class="smf-err" id="smf-err"></p>';

      box.innerHTML = html;
      wire();
      scroll();
    }

    function markDirty() {
      var el = box.querySelector("#smf-save");
      if (el) el.textContent = "";
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function () { save(false); }, 900);
    }

    function completeRows() {
      return st.journeys.filter(function (j) {
        if (!j.date || !String(j.from || "").trim() || !String(j.to || "").trim()) return false;
        if (!(parseFloat(j.miles) > 0) || !j.reason) return false;
        if (j.reason === "Other" && !String(j.note || "").trim()) return false;
        return true;
      }).map(function (j) {
        return { date: j.date, from: String(j.from).trim(), to: String(j.to).trim(),
                 miles: parseFloat(j.miles), reason: j.reason, note: String(j.note || "").trim() };
      });
    }

    function save(isSend, btn) {
      if (saving && !isSend) return;
      var t2 = o.getToken ? o.getToken() : null;
      if (!t2) { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }
      var err = box.querySelector("#smf-err");
      var savedEl = box.querySelector("#smf-save");
      saving = true;

      o.call({ action: isSend ? "send_mileage" : "save_mileage", token: t2, mileage: { journeys: completeRows() } })
        .then(function (res) {
          saving = false;
          if (res && res.code === "AUTH") { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }
          if (!res || !res.ok) {
            if (isSend) {
              if (err) err.textContent = (res && res.error) || "That didn't send. Try again in a moment.";
              if (btn) { btn.disabled = false; btn.textContent = st.status === "sent" ? "Send again" : "Send to payroll"; }
            }
            return;
          }
          st.ref = res.reference || st.ref;
          if (isSend) {
            open = false; box.remove();
            if (o.onBot) {
              var late = res.late > 0
                ? " " + res.late + (res.late === 1 ? " journey is" : " journeys are") + " outside the claim period — flagged for payroll to decide."
                : "";
              o.onBot("Sent. " + res.total.toFixed(1) + " miles — " + res.journeys
                + (res.journeys === 1 ? " journey" : " journeys") + " — your reference is " + res.reference + "."
                + late + " Everything goes to payroll together after midnight on " + res.period_end_nice
                + ". You can still add to it before then — just say “mileage”.");
            }
          } else if (savedEl) {
            savedEl.textContent = "Saved";
          }
        })
        .catch(function () {
          saving = false;
          if (isSend) {
            if (err) err.textContent = "That didn't send — but everything is saved. Try again when you have signal.";
            if (btn) { btn.disabled = false; btn.textContent = st.status === "sent" ? "Send again" : "Send to payroll"; }
          }
        });
    }

    function wire() {
      box.querySelectorAll("input,select").forEach(function (inp) {
        inp.addEventListener("input", function () {
          var i = this.getAttribute("data-i"), fld = this.getAttribute("data-f");
          if (i === null) return;
          st.journeys[+i][fld] = this.value;
          if (fld === "miles") {
            var tot = box.querySelector(".smf-tot .v");
            if (tot) tot.textContent = totalMiles().toFixed(1) + " miles";
          }
          markDirty();
        });
        inp.addEventListener("change", function () {
          var fld = this.getAttribute("data-f");
          if (fld === "date" || fld === "reason") draw();
        });
      });

      box.querySelectorAll("[data-chip]").forEach(function (b) {
        b.addEventListener("click", function () {
          var c = chips()[+this.getAttribute("data-chip")];
          if (!c) return;
          st.journeys.push({ date: today(), from: c.from, to: c.to, miles: c.miles, reason: c.reason, note: "" });
          markDirty(); draw();
        });
      });

      var add = box.querySelector("#smf-add");
      if (add) add.addEventListener("click", function () {
        st.journeys.push({ date: today(), from: "", to: "", miles: "", reason: "", note: "" });
        draw();
        var rows = box.querySelectorAll('[data-f="from"]');
        if (rows.length) rows[rows.length - 1].focus();
      });

      box.querySelectorAll("[data-del]").forEach(function (b) {
        b.addEventListener("click", function () {
          st.journeys.splice(+this.getAttribute("data-del"), 1);
          markDirty(); draw();
        });
      });

      var send = box.querySelector("#smf-send");
      if (send) send.addEventListener("click", function () {
        var rows = completeRows();
        if (rows.length === 0) {
          box.querySelector("#smf-err").textContent = "There are no finished journeys on the claim yet.";
          return;
        }
        var incomplete = st.journeys.length - rows.length;
        if (incomplete > 0 && !confirm("Some journeys aren't finished and won't be included. Send anyway?")) return;
        this.disabled = true; this.textContent = "Sending…";
        save(true, this);
      });

      var close = box.querySelector("#smf-close");
      if (close) close.addEventListener("click", function () {
        if (saveTimer) { clearTimeout(saveTimer); save(false); }
        open = false; box.remove();
        if (o.onBot) o.onBot("Saved. Open it again any time — just say “mileage”.");
      });
    }
  }

  function wants(text) {
    var t = String(text).toLowerCase();
    if (/^\s*(what|which|how much|how do|how does|why|when|where|who|am i|are|is|does|do i|can i|could i)\b/.test(t)) return false;
    if (/^\s*mil(e)?age\s*$/.test(t)) return true;
    if (!/mileage|milage|miles|petrol|fuel/.test(t)) return false;
    return /form|claim|expense|submit|fill|sheet|log|put in|send|add|open/.test(t);
  }

  w.SerenMileage = {
    open: openForm,
    wants: wants,
    isOpen: function () { return open; },
    close: function () { open = false; }
  };
})(window);
