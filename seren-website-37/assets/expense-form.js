/* Seren — Monthly expense claim (office staff).
 *
 * Shared by the standalone /staff page and the website chat widget.
 * The claim lives in the database, one per person per period (13th to
 * 12th), and builds up over the month: open, add, close, come back.
 * Everything is swept to payroll together on the 12th.
 */
(function (w) {
  "use strict";
  if (w.SerenExpense) return;

  var open = false;
  var RATE = 0.4;

  var CSS = ""
    + ".sxf{background:#fff;border:1.5px solid #E2E7EE;border-radius:16px;padding:18px;margin:8px 0 4px;"
    + "font-family:inherit;color:#0E2C53;line-height:1.5;box-sizing:border-box;width:100%;}"
    + ".sxf *{box-sizing:border-box;}"
    + ".sxf-h{font-size:17px;font-weight:700;margin:0 0 4px;}"
    + ".sxf-sub{font-size:12.5px;color:#5B6B80;margin:0 0 12px;}"
    + ".sxf-who{background:#F1F4F8;border-radius:9px;padding:10px 12px;font-size:13px;margin:0 0 10px;}"
    + ".sxf-period{background:#FDF6E3;border-left:3px solid #FBBD1E;border-radius:8px;padding:10px 13px;margin:0 0 14px;}"
    + ".sxf-period b{display:block;font-size:13px;color:#5A4300;}"
    + ".sxf-period span{font-size:12px;color:#5A4300;}"
    + ".sxf-lab{font-size:11px;font-weight:700;letter-spacing:.06em;color:#5B6B80;margin:14px 0 8px;}"
    + ".sxf-chips{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 4px;}"
    + ".sxf-chip{border:1.5px solid #E2E7EE;background:#fff;border-radius:14px;padding:7px 12px;"
    + "font-family:inherit;font-size:12.5px;font-weight:500;color:#0E2C53;cursor:pointer;min-height:34px;}"
    + ".sxf-chip:hover{border-color:#0E2C53;}"
    + ".sxf-row{border:1.5px solid #E2E7EE;border-radius:11px;padding:10px;margin-bottom:8px;position:relative;}"
    + ".sxf-grid{display:flex;gap:8px;margin-bottom:8px;}"
    + ".sxf-f{flex:1;min-width:0;}"
    + ".sxf-f label{display:block;font-size:11px;font-weight:600;color:#5B6B80;margin-bottom:3px;}"
    + ".sxf input{width:100%;min-height:44px;font-family:inherit;font-size:15px;padding:9px 11px;"
    + "border:1.5px solid #E2E7EE;border-radius:9px;outline:none;color:#0E2C53;background:#fff;}"
    + ".sxf input:focus{border-color:#0E2C53;}"
    + ".sxf-amt{position:absolute;right:12px;bottom:14px;font-size:14px;font-weight:700;}"
    + ".sxf-late{display:inline-block;background:#FDF6E3;color:#5A4300;font-size:11px;font-weight:500;"
    + "border-radius:8px;padding:3px 9px;margin-top:2px;}"
    + ".sxf-x{position:absolute;top:8px;right:10px;background:none;border:none;color:#9EA8B6;"
    + "font-size:16px;cursor:pointer;min-height:24px;padding:0 4px;}"
    + ".sxf-x:hover{color:#B3261E;}"
    + ".sxf-add{display:block;width:100%;min-height:42px;border:1.5px solid #E2E7EE;border-radius:10px;"
    + "background:#fff;font-family:inherit;font-size:13.5px;font-weight:500;color:#0E2C53;cursor:pointer;margin:2px 0 4px;}"
    + ".sxf-add:hover{border-color:#0E2C53;}"
    + ".sxf-tot{background:#0E2C53;border-radius:12px;padding:12px 14px;margin:14px 0 12px;color:#fff;font-size:13px;}"
    + ".sxf-tr{display:flex;justify-content:space-between;padding:2px 0;}"
    + ".sxf-tr .m{color:#BECBDD;}"
    + ".sxf-grand{border-top:1px solid #284872;margin-top:6px;padding-top:7px;font-weight:700;font-size:14px;}"
    + ".sxf-grand .v{color:#FBBD1E;font-size:17px;}"
    + ".sxf-acts{display:flex;gap:9px;}"
    + ".sxf-btn{flex:1;min-height:48px;border-radius:10px;font-family:inherit;font-size:14.5px;font-weight:700;"
    + "cursor:pointer;border:none;background:#0E2C53;color:#fff;}"
    + ".sxf-btn:hover{background:#14386a;}.sxf-btn:disabled{opacity:.5;cursor:not-allowed;}"
    + ".sxf-btn2{flex:1;min-height:48px;border-radius:10px;font-family:inherit;font-size:14px;font-weight:500;"
    + "cursor:pointer;border:1.5px solid #E2E7EE;background:#fff;color:#0E2C53;}"
    + ".sxf-btn2:hover{border-color:#0E2C53;}"
    + ".sxf-save{font-size:12px;color:#5B6B80;text-align:right;min-height:16px;margin:6px 0 0;}"
    + ".sxf-err{color:#B3261E;font-size:13px;font-weight:500;min-height:18px;margin:8px 0 0;}"
    + ".sxf-close{background:none;border:none;color:#5B6B80;font-family:inherit;font-size:13px;"
    + "cursor:pointer;min-height:40px;text-decoration:underline;display:block;margin:4px auto 0;}"
    + ".sxf-close:hover{color:#0E2C53;}";

  function injectCss() {
    if (document.getElementById("seren-expense-css")) return;
    var s = document.createElement("style");
    s.id = "seren-expense-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escA(s) { return esc(s).replace(/"/g, "&quot;"); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function money(n) { return "\u00a3" + (Math.round(n * 100) / 100).toFixed(2); }

  function openForm(o) {
    if (open || !o || !o.mount) return;
    open = true;
    injectCss();

    var box = document.createElement("div");
    box.className = "sxf";
    box.innerHTML = '<p class="sxf-sub">Opening your claim\u2026</p>';
    o.mount.appendChild(box);
    var scroll = o.scroll || function () {
      try { o.mount.scrollTop = o.mount.scrollHeight; } catch (e) {}
    };
    scroll();

    var st = { mileage: [], oncall: [], meta: null, status: "draft", ref: null, dirty: false };
    var saveTimer = null, saving = false;

    function fail(msg) {
      open = false; box.remove();
      if (o.onBot) o.onBot(msg);
    }

    var t = o.getToken ? o.getToken() : null;
    if (!t) { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }

    o.call({ action: "get_expense", token: t })
      .then(function (res) {
        if (res && res.code === "AUTH") { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }
        if (!res || !res.ok || !res.eligible) {
          fail((res && res.error) || "Couldn't open your claim. Try again in a moment.");
          return;
        }
        st.meta = res;
        if (res.claim) {
          st.mileage = (res.claim.mileage || []).slice();
          st.oncall = (res.claim.oncall || []).slice();
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

    function totals() {
      var m = 0, oc = 0;
      st.mileage.forEach(function (j) { var v = parseFloat(j.miles); if (v > 0) m += v * RATE; });
      st.oncall.forEach(function (wk) { var v = parseFloat(wk.amount); if (v > 0) oc += v; });
      return { m: m, o: oc, t: m + oc };
    }

    function chips() {
      var seen = {}, out = [];
      for (var i = st.mileage.length - 1; i >= 0 && out.length < 3; i--) {
        var j = st.mileage[i];
        if (!j.description || !parseFloat(j.miles)) continue;
        var key = j.description + "|" + j.miles;
        if (seen[key]) continue;
        seen[key] = 1;
        out.push({ description: j.description, miles: j.miles });
      }
      return out;
    }

    function periodShort() {
      return st.meta ? st.meta.period_label.replace(/ \d{4}/g, "") : "";
    }
    function deadline() {
      if (!st.meta) return "";
      var p = st.meta.period_end.split("-");
      return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]))
        .toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
    }

    function draw() {
      var tt = totals();
      var ch = chips();
      var sent = st.status === "sent";

      var html = '<p class="sxf-h">Monthly expense claim</p>'
        + '<p class="sxf-sub">Office staff only. Carers claim mileage with the mileage claim form.</p>'
        + '<div class="sxf-who">Claiming as <b>' + esc(o.name || "you") + "</b></div>"
        + '<div class="sxf-period"><b>Claim period: ' + esc(periodShort()) + "</b>"
        + "<span>" + (sent
            ? "Sent \u2014 you can still add to it until 11am on " + esc(deadline()) + "."
            : "It saves as you go. Get it in by 11am on " + esc(deadline()) + " \u2014 that\u2019s when everything goes to payroll. Later than that and it rolls to next month.")
        + "</span></div>";

      if (ch.length) {
        html += '<p class="sxf-lab">ADD AGAIN</p><div class="sxf-chips">'
          + ch.map(function (c, i) {
              return '<button type="button" class="sxf-chip" data-chip="' + i + '">'
                + esc(c.description) + " \u00b7 " + esc(c.miles) + " mi</button>";
            }).join("")
          + "</div>";
      }

      html += '<p class="sxf-lab">MILEAGE</p>';
      st.mileage.forEach(function (j, i) {
        html += '<div class="sxf-row">'
          + '<button type="button" class="sxf-x" data-del-m="' + i + '" aria-label="Remove">\u00d7</button>'
          + '<div class="sxf-grid">'
          + '<div class="sxf-f"><label>Date</label><input type="date" data-m="' + i + '" data-f="date" max="' + today() + '" value="' + escA(j.date || "") + '" /></div>'
          + '<div class="sxf-f"><label>Miles</label><input type="number" inputmode="decimal" min="0.1" max="500" step="0.1" data-m="' + i + '" data-f="miles" value="' + escA(j.miles || "") + '" /></div>'
          + "</div>"
          + '<div class="sxf-f" style="margin-right:74px;"><label>What was it for?</label>'
          + '<input type="text" maxlength="200" data-m="' + i + '" data-f="description" value="' + escA(j.description || "") + '" placeholder="e.g. Client visit \u2014 J Williams" /></div>'
          + '<span class="sxf-amt">' + money((parseFloat(j.miles) || 0) * RATE) + "</span>"
          + (isLate(j.date) ? '<span class="sxf-late">Outside this claim period \u2014 payroll will decide</span>' : "")
          + "</div>";
      });
      html += '<button type="button" class="sxf-add" id="sxf-addm">+  Add another journey</button>';

      html += '<p class="sxf-lab">ON-CALL</p>';
      st.oncall.forEach(function (wk, i) {
        html += '<div class="sxf-row">'
          + '<button type="button" class="sxf-x" data-del-o="' + i + '" aria-label="Remove">\u00d7</button>'
          + '<div class="sxf-grid" style="margin-bottom:0;">'
          + '<div class="sxf-f"><label>Week commencing</label><input type="date" data-o="' + i + '" data-f="week_commencing" value="' + escA(wk.week_commencing || "") + '" /></div>'
          + '<div class="sxf-f"><label>Amount (\u00a3)</label><input type="number" inputmode="decimal" min="1" max="1000" step="0.01" data-o="' + i + '" data-f="amount" value="' + escA(wk.amount || "") + '" placeholder="e.g. 140.00" /></div>'
          + "</div>"
          + (isLate(wk.week_commencing) ? '<span class="sxf-late">Outside this claim period \u2014 payroll will decide</span>' : "")
          + "</div>";
      });
      html += '<button type="button" class="sxf-add" id="sxf-addo">+  Add a week</button>';

      html += '<div class="sxf-tot">'
        + '<div class="sxf-tr"><span class="m">Mileage</span><span>' + money(tt.m) + "</span></div>"
        + '<div class="sxf-tr"><span class="m">On-call</span><span>' + money(tt.o) + "</span></div>"
        + '<div class="sxf-tr sxf-grand"><span>Total</span><span class="v">' + money(tt.t) + "</span></div>"
        + "</div>"
        + '<div class="sxf-acts">'
        + '<button type="button" class="sxf-btn" id="sxf-send">' + (sent ? "Send again" : "Send to payroll") + "</button>"
        + '<button type="button" class="sxf-btn2" id="sxf-csv">Download a copy</button>'
        + "</div>"
        + '<p class="sxf-save" id="sxf-save"></p>'
        + '<p class="sxf-err" id="sxf-err"></p>'
        + '<button type="button" class="sxf-close" id="sxf-close">Close \u2014 it\u2019s saved</button>';

      box.innerHTML = html;
      wire();
      scroll();
    }

    function markDirty() {
      st.dirty = true;
      var el = box.querySelector("#sxf-save");
      if (el) el.textContent = "";
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function () { save(false); }, 900);
    }

    function completeRows() {
      return {
        mileage: st.mileage.filter(function (j) {
          return j.date && parseFloat(j.miles) > 0 && String(j.description || "").trim();
        }).map(function (j) {
          return { date: j.date, miles: parseFloat(j.miles), description: String(j.description).trim() };
        }),
        oncall: st.oncall.filter(function (wk) {
          return wk.week_commencing && parseFloat(wk.amount) > 0;
        }).map(function (wk) {
          return { week_commencing: wk.week_commencing, amount: parseFloat(wk.amount) };
        })
      };
    }

    function save(isSend, btn) {
      if (saving) { if (!isSend) return; }
      var t2 = o.getToken ? o.getToken() : null;
      if (!t2) { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }
      var err = box.querySelector("#sxf-err");
      var savedEl = box.querySelector("#sxf-save");
      saving = true;

      o.call({ action: isSend ? "send_expense" : "save_expense", token: t2, expense: completeRows() })
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
          st.dirty = false;
          if (isSend) {
            open = false; box.remove();
            if (o.onBot) {
              var late = res.late > 0
                ? " " + res.late + (res.late === 1 ? " entry is" : " entries are") + " outside the claim period \u2014 flagged for payroll to decide."
                : "";
              o.onBot("Sent. " + money(res.totals.t) + " for this period \u2014 your reference is "
                + res.reference + "." + late + " Everything goes to payroll at 11am on "
                + res.period_end_nice + ". You can still add to it before then \u2014 just open the form again.");
            }
          } else if (savedEl) {
            savedEl.textContent = "Saved";
          }
        })
        .catch(function () {
          saving = false;
          if (isSend) {
            if (err) err.textContent = "That didn't send \u2014 but everything is saved. Try again when you have signal.";
            if (btn) { btn.disabled = false; btn.textContent = st.status === "sent" ? "Send again" : "Send to payroll"; }
          }
        });
    }

    function wire() {
      box.querySelectorAll("input").forEach(function (inp) {
        inp.addEventListener("input", function () {
          var mi = this.getAttribute("data-m"), oi = this.getAttribute("data-o");
          var fld = this.getAttribute("data-f");
          if (mi !== null) st.mileage[+mi][fld] = this.value;
          if (oi !== null) st.oncall[+oi][fld] = this.value;
          if (fld === "miles") {
            var amt = this.closest(".sxf-row").querySelector(".sxf-amt");
            if (amt) amt.textContent = money((parseFloat(this.value) || 0) * RATE);
            refreshTotals();
          }
          if (fld === "amount") refreshTotals();
          markDirty();
        });
        inp.addEventListener("change", function () {
          var fld = this.getAttribute("data-f");
          if (fld === "date" || fld === "week_commencing") draw();
        });
      });

      function refreshTotals() {
        var tt = totals();
        var rows = box.querySelectorAll(".sxf-tr span:last-child");
        if (rows.length >= 3) {
          rows[0].textContent = money(tt.m);
          rows[1].textContent = money(tt.o);
          rows[2].textContent = money(tt.t);
        }
      }

      box.querySelectorAll("[data-chip]").forEach(function (b) {
        b.addEventListener("click", function () {
          var c = chips()[+this.getAttribute("data-chip")];
          if (!c) return;
          st.mileage.push({ date: today(), miles: c.miles, description: c.description });
          markDirty(); draw();
        });
      });

      var addm = box.querySelector("#sxf-addm");
      if (addm) addm.addEventListener("click", function () {
        st.mileage.push({ date: today(), miles: "", description: "" });
        draw();
        var last = box.querySelectorAll('[data-f="miles"]');
        if (last.length) last[last.length - 1].focus();
      });

      var addo = box.querySelector("#sxf-addo");
      if (addo) addo.addEventListener("click", function () {
        st.oncall.push({ week_commencing: "", amount: "" });
        draw();
      });

      box.querySelectorAll("[data-del-m]").forEach(function (b) {
        b.addEventListener("click", function () {
          st.mileage.splice(+this.getAttribute("data-del-m"), 1);
          markDirty(); draw();
        });
      });
      box.querySelectorAll("[data-del-o]").forEach(function (b) {
        b.addEventListener("click", function () {
          st.oncall.splice(+this.getAttribute("data-del-o"), 1);
          markDirty(); draw();
        });
      });

      var send = box.querySelector("#sxf-send");
      if (send) send.addEventListener("click", function () {
        var rows = completeRows();
        if (rows.mileage.length + rows.oncall.length === 0) {
          box.querySelector("#sxf-err").textContent = "There's nothing on the claim yet.";
          return;
        }
        var incomplete = st.mileage.length - rows.mileage.length + st.oncall.length - rows.oncall.length;
        if (incomplete > 0 && !confirm("Some rows aren't finished and won't be included. Send anyway?")) return;
        this.disabled = true; this.textContent = "Sending\u2026";
        save(true, this);
      });

      var csv = box.querySelector("#sxf-csv");
      if (csv) csv.addEventListener("click", function () {
        var q = function (v) { v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
        var lines = ["Expense claim \u2014 " + (o.name || "") + (st.ref ? " \u2014 " + st.ref : ""),
          "Period," + (st.meta ? st.meta.period_label : ""), "",
          "Type,Date,Miles,Description,Amount"];
        var tt = totals();
        st.mileage.forEach(function (j) {
          lines.push(["Mileage", j.date, j.miles, j.description, ((parseFloat(j.miles) || 0) * RATE).toFixed(2)].map(q).join(","));
        });
        st.oncall.forEach(function (wk) {
          lines.push(["On-call", wk.week_commencing, "", "Week commencing", (parseFloat(wk.amount) || 0).toFixed(2)].map(q).join(","));
        });
        lines.push(",,,Total," + tt.t.toFixed(2));
        var blob = new Blob([lines.join("\n") + "\n"], { type: "text/csv" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "expense-claim-" + (st.meta ? st.meta.period_end : today()) + ".csv";
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      });

      var close = box.querySelector("#sxf-close");
      if (close) close.addEventListener("click", function () {
        if (saveTimer) { clearTimeout(saveTimer); save(false); }
        open = false; box.remove();
        if (o.onBot) o.onBot("Saved. Open it again any time \u2014 just ask for the expenses form.");
      });
    }
  }

  function wants(text) {
    var t = String(text).toLowerCase();
    if (/\bmileage\b/.test(t)) return false;
    if (/^\s*(what|which|how|why|when|where|who|am i|are|is|does|do i|can i|could i)\b/.test(t)) return false;
    if (/^\s*expenses?\s*$/.test(t)) return true;
    if (/\bexpenses?\b|\bon.?call\b/.test(t)
        && /form|claim|month|sheet|log|submit|add|send|open/.test(t)) return true;
    return false;
  }

  w.SerenExpense = {
    open: openForm,
    wants: wants,
    isOpen: function () { return open; },
    close: function () { open = false; }
  };
})(window);
