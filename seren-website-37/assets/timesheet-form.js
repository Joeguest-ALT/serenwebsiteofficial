/* Seren — Supervisor & team leader timesheet.
 *
 * Shared by the standalone /staff page and the website chat widget.
 * One timesheet per person per 4-week period (Monday to Sunday, same
 * cycles as the mileage claim). Hours only — mileage has its own claim.
 * Breaks are unpaid: paid hours = care + branch - break.
 * Swept to payroll (CC care managers) after midnight on the final Sunday.
 */
(function (w) {
  "use strict";
  if (w.SerenTimesheet) return;

  var open = false;

  var CSS = ""
    + ".stf{background:#fff;border:1.5px solid #E2E7EE;border-radius:16px;padding:18px;margin:8px 0 4px;"
    + "font-family:inherit;color:#0E2C53;line-height:1.5;box-sizing:border-box;width:100%;}"
    + ".stf *{box-sizing:border-box;}"
    + ".stf-h{font-size:17px;font-weight:700;margin:0 0 4px;}"
    + ".stf-sub{font-size:12.5px;color:#5B6B80;margin:0 0 12px;}"
    + ".stf-who{background:#F1F4F8;border-radius:9px;padding:10px 12px;font-size:13px;margin:0 0 10px;}"
    + ".stf-period{background:#FDF6E3;border-left:3px solid #FBBD1E;border-radius:8px;padding:10px 13px;margin:0 0 14px;}"
    + ".stf-period b{display:block;font-size:13px;color:#5A4300;}"
    + ".stf-period span{font-size:12px;color:#5A4300;}"
    + ".stf-lab{font-size:11px;font-weight:700;letter-spacing:.06em;color:#5B6B80;margin:14px 0 8px;}"
    + ".stf-row{border:1.5px solid #E2E7EE;border-radius:11px;padding:10px;margin-bottom:8px;position:relative;}"
    + ".stf-grid{display:flex;gap:8px;}"
    + ".stf-f{flex:1;min-width:0;}"
    + ".stf-f label{display:block;font-size:11px;font-weight:600;color:#5B6B80;margin-bottom:3px;}"
    + ".stf input{width:100%;min-height:44px;font-family:inherit;font-size:15px;padding:9px 11px;"
    + "border:1.5px solid #E2E7EE;border-radius:9px;outline:none;color:#0E2C53;background:#fff;}"
    + ".stf input:focus{border-color:#0E2C53;}"
    + ".stf-x{position:absolute;top:8px;right:10px;background:none;border:none;color:#9EA8B6;"
    + "font-size:16px;cursor:pointer;min-height:24px;padding:0 4px;}"
    + ".stf-x:hover{color:#B3261E;}"
    + ".stf-add{display:block;width:100%;min-height:42px;border:1.5px solid #E2E7EE;border-radius:10px;"
    + "background:#fff;font-family:inherit;font-size:13.5px;font-weight:500;color:#0E2C53;cursor:pointer;margin:2px 0 4px;}"
    + ".stf-add:hover{border-color:#0E2C53;}"
    + ".stf-tot{background:#0E2C53;border-radius:12px;padding:12px 14px;margin:14px 0 12px;color:#fff;font-size:13px;}"
    + ".stf-tot .m{color:#BECBDD;font-size:12px;}"
    + ".stf-grand{display:flex;justify-content:space-between;margin-top:6px;padding-top:7px;"
    + "border-top:1px solid #284872;font-weight:700;font-size:14px;}"
    + ".stf-grand .v{color:#FBBD1E;font-size:17px;}"
    + ".stf-acts{display:flex;gap:9px;}"
    + ".stf-btn{flex:1;min-height:48px;border-radius:10px;font-family:inherit;font-size:14.5px;font-weight:700;"
    + "cursor:pointer;border:none;background:#0E2C53;color:#fff;}"
    + ".stf-btn:hover{background:#14386a;}.stf-btn:disabled{opacity:.5;cursor:not-allowed;}"
    + ".stf-btn2{flex:1;min-height:48px;border-radius:10px;font-family:inherit;font-size:14px;font-weight:500;"
    + "cursor:pointer;border:1.5px solid #E2E7EE;background:#fff;color:#0E2C53;}"
    + ".stf-btn2:hover{border-color:#0E2C53;}"
    + ".stf-save{font-size:12px;color:#5B6B80;text-align:right;min-height:16px;margin:6px 0 0;}"
    + ".stf-err{color:#B3261E;font-size:13px;font-weight:500;min-height:18px;margin:8px 0 0;}";

  function injectCss() {
    if (document.getElementById("seren-timesheet-css")) return;
    var s = document.createElement("style");
    s.id = "seren-timesheet-css";
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
    box.className = "stf";
    box.innerHTML = '<p class="stf-sub">Opening your timesheet…</p>';
    o.mount.appendChild(box);
    var scroll = o.scroll || function () {
      try { o.mount.scrollTop = o.mount.scrollHeight; } catch (e) {}
    };
    scroll();

    var st = { days: [], meta: null, status: "draft", ref: null };
    var saveTimer = null, saving = false;

    function fail(msg) {
      open = false; box.remove();
      if (o.onBot) o.onBot(msg);
    }

    var t = o.getToken ? o.getToken() : null;
    if (!t) { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }

    o.call({ action: "get_timesheet", token: t })
      .then(function (res) {
        if (res && res.code === "AUTH") { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }
        if (!res || !res.ok || !res.eligible) {
          fail((res && res.error) || "Couldn't open your timesheet. Try again in a moment.");
          return;
        }
        st.meta = res;
        if (res.claim) {
          st.days = (res.claim.days || []).slice();
          st.status = res.claim.status || "draft";
          st.ref = res.claim.claim_ref || null;
        }
        draw();
      })
      .catch(function () { fail("Couldn't open your timesheet. Check your signal and try again."); });

    function totals() {
      var c = 0, b = 0, k = 0;
      st.days.forEach(function (d) {
        c += parseFloat(d.care) || 0;
        b += parseFloat(d.branch) || 0;
        k += parseFloat(d.brk) || 0;
      });
      var paid = Math.max(0, c + b - k);
      var r = function (n) { return Math.round(n * 100) / 100; };
      return { c: r(c), b: r(b), k: r(k), paid: r(paid) };
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
    function niceDay(iso) {
      var p = iso.split("-");
      return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]))
        .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
    }

    function draw() {
      var tt = totals();
      var sent = st.status === "sent";
      var maxDate = today() < st.meta.period_end ? today() : st.meta.period_end;

      var html = '<p class="stf-h">Timesheet</p>'
        + '<p class="stf-sub">For team leaders and supervisors · hours only — mileage has its own claim.</p>'
        + '<div class="stf-who">Filling in as <b>' + esc(o.name || "you") + "</b></div>"
        + '<div class="stf-period"><b>Period: ' + esc(periodShort()) + "</b>"
        + "<span>" + (sent
            ? "Sent — you can still add to it until midnight on " + esc(deadline()) + "."
            : "Fill in as you go — it saves itself. Everything reaches payroll together after midnight on " + esc(deadline()) + ".")
        + " Breaks aren’t paid: enter yours and it comes off the total. Only out on care calls? Leave branch at 0, and the other way round.</span></div>";

      html += '<p class="stf-lab">DAYS' + (st.days.length ? " · " + st.days.length + " FILLED IN" : "") + "</p>";
      st.days.forEach(function (d, i) {
        html += '<div class="stf-row">'
          + '<button type="button" class="stf-x" data-del="' + i + '" aria-label="Remove">×</button>'
          + '<div class="stf-grid" style="margin-bottom:8px;">'
          + '<div class="stf-f"><label>Date' + (d.date ? " · " + esc(niceDay(d.date)) : "") + "</label>"
          + '<input type="date" data-i="' + i + '" data-f="date" min="' + escA(st.meta.period_start) + '" max="' + escA(maxDate) + '" value="' + escA(d.date || "") + '" /></div>'
          + "</div>"
          + '<div class="stf-grid">'
          + '<div class="stf-f"><label>Care hours</label><input type="number" inputmode="decimal" min="0" max="24" step="0.25" data-i="' + i + '" data-f="care" value="' + escA(d.care || "") + '" placeholder="0" /></div>'
          + '<div class="stf-f"><label>Branch hours</label><input type="number" inputmode="decimal" min="0" max="24" step="0.25" data-i="' + i + '" data-f="branch" value="' + escA(d.branch || "") + '" placeholder="0" /></div>'
          + '<div class="stf-f"><label>Break</label><input type="number" inputmode="decimal" min="0" max="24" step="0.25" data-i="' + i + '" data-f="brk" value="' + escA(d.brk || "") + '" placeholder="0.5" /></div>'
          + "</div>"
          + "</div>";
      });
      html += '<button type="button" class="stf-add" id="stf-add">+  Add a day</button>';

      html += '<div class="stf-tot">'
        + '<div class="m">Care ' + tt.c.toFixed(1) + " + Branch " + tt.b.toFixed(1) + " − Break " + tt.k.toFixed(1) + " (unpaid)</div>"
        + '<div class="stf-grand"><span>Paid hours this period</span><span class="v">' + tt.paid.toFixed(1) + "</span></div>"
        + "</div>"
        + '<div class="stf-acts">'
        + '<button type="button" class="stf-btn" id="stf-send">' + (sent ? "Send again" : "Send to payroll") + "</button>"
        + '<button type="button" class="stf-btn2" id="stf-close">Close — it’s saved</button>'
        + "</div>"
        + '<p class="stf-save" id="stf-save"></p>'
        + '<p class="stf-err" id="stf-err"></p>';

      box.innerHTML = html;
      wire();
      scroll();
    }

    function markDirty() {
      var el = box.querySelector("#stf-save");
      if (el) el.textContent = "";
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function () { save(false); }, 900);
    }

    function completeRows() {
      return st.days.filter(function (d) {
        var c = parseFloat(d.care) || 0, b = parseFloat(d.branch) || 0;
        return d.date && (c + b) > 0;
      }).map(function (d) {
        return { date: d.date,
                 care: parseFloat(d.care) || 0,
                 branch: parseFloat(d.branch) || 0,
                 brk: parseFloat(d.brk) || 0 };
      });
    }

    function save(isSend, btn) {
      if (saving && !isSend) return;
      var t2 = o.getToken ? o.getToken() : null;
      if (!t2) { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }
      var err = box.querySelector("#stf-err");
      var savedEl = box.querySelector("#stf-save");
      saving = true;

      o.call({ action: isSend ? "send_timesheet" : "save_timesheet", token: t2, timesheet: { days: completeRows() } })
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
              o.onBot("Sent. " + res.totals.paid.toFixed(1) + " paid hours across " + res.dayCount
                + (res.dayCount === 1 ? " day" : " days") + " — your reference is " + res.reference
                + ". It reaches payroll, with your care manager copied in, after midnight on " + res.period_end_nice
                + ". You can still add to it before then — just say “timesheet”.");
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
      box.querySelectorAll("input").forEach(function (inp) {
        inp.addEventListener("input", function () {
          var i = this.getAttribute("data-i"), fld = this.getAttribute("data-f");
          if (i === null) return;
          st.days[+i][fld] = this.value;
          if (fld !== "date") {
            var tt = totals();
            var m = box.querySelector(".stf-tot .m");
            if (m) m.textContent = "Care " + tt.c.toFixed(1) + " + Branch " + tt.b.toFixed(1) + " − Break " + tt.k.toFixed(1) + " (unpaid)";
            var g = box.querySelector(".stf-grand .v");
            if (g) g.textContent = tt.paid.toFixed(1);
          }
          markDirty();
        });
        inp.addEventListener("change", function () {
          if (this.getAttribute("data-f") === "date") draw();
        });
      });

      var add = box.querySelector("#stf-add");
      if (add) add.addEventListener("click", function () {
        var used = {};
        st.days.forEach(function (d) { if (d.date) used[d.date] = 1; });
        var start = today() < st.meta.period_end ? today() : st.meta.period_end;
        var pick = start;
        // walk backwards to the most recent day not yet filled in
        for (var i = 0; i < 28; i++) {
          if (!used[pick] && pick >= st.meta.period_start) break;
          var dt = new Date(pick + "T00:00:00Z");
          dt.setUTCDate(dt.getUTCDate() - 1);
          pick = dt.toISOString().slice(0, 10);
        }
        if (pick < st.meta.period_start) pick = "";
        st.days.push({ date: pick, care: "", branch: "", brk: "" });
        draw();
        var rows = box.querySelectorAll('[data-f="care"]');
        if (rows.length) rows[rows.length - 1].focus();
      });

      box.querySelectorAll("[data-del]").forEach(function (b) {
        b.addEventListener("click", function () {
          st.days.splice(+this.getAttribute("data-del"), 1);
          markDirty(); draw();
        });
      });

      var send = box.querySelector("#stf-send");
      if (send) send.addEventListener("click", function () {
        var rows = completeRows();
        if (rows.length === 0) {
          box.querySelector("#stf-err").textContent = "There are no days with hours on the timesheet yet.";
          return;
        }
        var incomplete = st.days.length - rows.length;
        if (incomplete > 0 && !confirm("Some days have no hours and won't be included. Send anyway?")) return;
        this.disabled = true; this.textContent = "Sending…";
        save(true, this);
      });

      var close = box.querySelector("#stf-close");
      if (close) close.addEventListener("click", function () {
        if (saveTimer) { clearTimeout(saveTimer); save(false); }
        open = false; box.remove();
        if (o.onBot) o.onBot("Saved. Open it again any time — just say “timesheet”.");
      });
    }
  }

  function wants(text) {
    var t = String(text).toLowerCase();
    if (/^\s*(what|which|how many|how much|how do|how does|why|when|where|who|am i|are|is|does|do i|can i|could i)\b/.test(t)) return false;
    if (/^\s*time\s?sheet\s*$/.test(t)) return true;
    if (/time\s?sheet/.test(t)) return true;
    if (/\bhours\b/.test(t) && /\b(log|submit|fill|enter|send|add|record|open)\b/.test(t)) return true;
    return false;
  }

  w.SerenTimesheet = {
    open: openForm,
    wants: wants,
    isOpen: function () { return open; },
    close: function () { open = false; }
  };
})(window);
