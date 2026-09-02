/* Seren — mileage expense claim form.
 *
 * Shared by the standalone /staff page and the website chat widget, so the
 * form only ever has to be fixed in one place.
 *
 * Host supplies an adapter:
 *   SerenMileage.open({
 *     mount,            // element to append the form to
 *     name,             // staff name for the "claiming as" line
 *     getToken,         // () => session token or null
 *     call,             // (payload) => Promise<json>
 *     onBot,            // (text) => void   — write a bot message
 *     onExpired,        // () => void       — session died
 *     scroll            // optional () => void
 *   })
 */
(function (w) {
  "use strict";
  if (w.SerenMileage) return;

  var K_DRAFT = "seren_mileage_draft";
  var BRANCHES = ["Cardiff", "Port Talbot", "Caerphilly", "Bridgend", "Blaenau Gwent"];
  /* Must stay in step with REASONS in the staff-chat edge function */
  var REASONS = [
    "Double run",
    "Shopping or outing with a client",
    "Appointment or hospital visit",
    "Short-notice cover",
    "Office, training or meeting",
    "Other"
  ];
  var open = false;

  var CSS = ""
    + ".smf{background:#fff;border:1.5px solid #E2E7EE;border-radius:16px;padding:18px;margin:8px 0 4px;"
    + "font-family:inherit;color:#0E2C53;line-height:1.5;box-sizing:border-box;width:100%;}"
    + ".smf *{box-sizing:border-box;}"
    + ".smf h3{margin:0 0 3px;font-size:17px;font-weight:600;letter-spacing:-0.01em;color:#0E2C53;}"
    + ".smf-sub{margin:0 0 16px;font-size:13px;color:#5B6B80;}"
    + ".smf-who{background:#F1F4F8;border-radius:10px;padding:10px 13px;font-size:13.5px;margin-bottom:14px;}"
    + ".smf-f{margin-bottom:13px;}"
    + ".smf-f label{display:block;font-size:13px;font-weight:500;margin-bottom:5px;color:#0E2C53;}"
    + ".smf-f select,.smf-f input{width:100%;min-height:46px;font-family:inherit;font-size:16px;padding:10px 12px;"
    + "border:1.5px solid #E2E7EE;border-radius:10px;outline:none;color:#0E2C53;background:#fff;}"
    + ".smf-f select:focus,.smf-f input:focus{border-color:#0E2C53;}"
    + ".smf-row{border:1.5px solid #E2E7EE;border-radius:12px;padding:13px;margin-bottom:10px;}"
    + ".smf-rh{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;}"
    + ".smf-rn{font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:#5B6B80;}"
    + ".smf-del{background:none;border:none;color:#5B6B80;font-size:13px;cursor:pointer;font-family:inherit;"
    + "min-height:32px;padding:0 4px;text-decoration:underline;}"
    + ".smf-del:hover{color:#B3261E;}"
    + ".smf-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;}"
    + ".smf-grid .smf-f{margin-bottom:0;}.smf-grid .smf-wide{grid-column:1 / -1;}"
    + ".smf-add{width:100%;min-height:46px;background:#fff;border:1.5px dashed #E2E7EE;border-radius:11px;"
    + "font-family:inherit;font-size:14.5px;font-weight:500;color:#0E2C53;cursor:pointer;margin-bottom:14px;}"
    + ".smf-add:hover{border-color:#0E2C53;background:#FAFBFD;}"
    + ".smf-tot{display:flex;justify-content:space-between;align-items:center;background:#0E2C53;"
    + "border-radius:12px;padding:14px 16px;margin-bottom:14px;}"
    + ".smf-tot span{color:rgba(255,255,255,.75);font-size:13.5px;}"
    + ".smf-tot strong{color:#FBBD1E;font-size:22px;font-weight:600;}"
    + ".smf-note{font-size:12px;color:#5B6B80;background:#FDF6E3;border-left:3px solid #FBBD1E;"
    + "border-radius:7px;padding:11px 13px;margin-bottom:14px;}"
    + ".smf-note b{color:#5A4300;}"
    + ".smf-acts{display:flex;gap:9px;flex-wrap:wrap;}"
    + ".smf-btn{flex:1 1 auto;min-height:50px;border-radius:11px;font-family:inherit;font-size:15px;"
    + "font-weight:600;cursor:pointer;border:none;}"
    + ".smf-go{background:#0E2C53;color:#fff;}.smf-go:hover{background:#14386a;}"
    + ".smf-go:disabled{opacity:.5;cursor:not-allowed;}"
    + ".smf-alt{background:#fff;border:1.5px solid #E2E7EE;color:#0E2C53;}.smf-alt:hover{border-color:#0E2C53;}"
    + ".smf-cancel{background:none;border:none;color:#5B6B80;font-family:inherit;font-size:13.5px;"
    + "cursor:pointer;min-height:44px;text-decoration:underline;}"
    + ".smf-err{color:#B3261E;font-size:13.5px;font-weight:500;margin:11px 0 0;min-height:19px;}";

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
  function thisFriday() {
    var d = new Date();
    d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7));
    return d.toISOString().slice(0, 10);
  }

  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(K_DRAFT) || "null"); } catch (e) { return null; }
  }
  function saveDraft(d) { try { localStorage.setItem(K_DRAFT, JSON.stringify(d)); } catch (e) {} }
  function clearDraft() { try { localStorage.removeItem(K_DRAFT); } catch (e) {} }

  function openForm(o) {
    if (open) return;
    if (!o || !o.mount) return;
    open = true;
    injectCss();

    var d = loadDraft() || {};
    var st = {
      branch: d.branch || "",
      weekEnding: d.weekEnding || thisFriday(),
      journeys: (d.journeys && d.journeys.length)
        ? d.journeys : [{ date: today(), from: "", to: "", miles: "", reason: "", note: "" }]
    };

    var box = document.createElement("div");
    box.className = "smf";
    o.mount.appendChild(box);

    var scroll = o.scroll || function () {
      try { o.mount.scrollTop = o.mount.scrollHeight; } catch (e) {}
    };

    function total() {
      return st.journeys.reduce(function (t, j) {
        var m = parseFloat(j.miles);
        return t + (isFinite(m) && m > 0 ? m : 0);
      }, 0);
    }
    function persist() { saveDraft(st); }

    function draw() {
      var opts = ['<option value="">Choose your branch…</option>'].concat(
        BRANCHES.map(function (b) {
          return '<option value="' + b + '"' + (st.branch === b ? " selected" : "") + ">" + b + "</option>";
        })).join("");

      var rows = st.journeys.map(function (j, i) {
        return '<div class="smf-row" data-i="' + i + '">'
          + '<div class="smf-rh"><span class="smf-rn">Journey ' + (i + 1) + "</span>"
          + (st.journeys.length > 1 ? '<button type="button" class="smf-del" data-del="' + i + '">Remove</button>' : "")
          + "</div><div class=\"smf-grid\">"
          + '<div class="smf-f"><label>Date</label><input type="date" data-f="date" value="' + escA(j.date) + '" /></div>'
          + '<div class="smf-f"><label>Miles</label><input type="text" inputmode="decimal" data-f="miles" value="'
          + escA(j.miles) + '" placeholder="e.g. 3.4" /></div>'
          + '<div class="smf-f smf-wide"><label>From</label><input type="text" data-f="from" value="'
          + escA(j.from) + '" placeholder="Client initials, address, postcode" /></div>'
          + '<div class="smf-f smf-wide"><label>To</label><input type="text" data-f="to" value="'
          + escA(j.to) + '" placeholder="Client initials, address, postcode" /></div>'
          + '<div class="smf-f smf-wide"><label>Why was this journey needed?</label>'
          + '<select data-f="reason">'
          + ['<option value="">Choose a reason…</option>'].concat(REASONS.map(function (r) {
              return '<option value="' + escA(r) + '"' + (j.reason === r ? " selected" : "") + ">" + esc(r) + "</option>";
            })).join("")
          + "</select></div>"
          + '<div class="smf-f smf-wide"><label>Anything else Tyler should know?'
          + '<span style="font-weight:400;color:#5B6B80"> (optional)</span></label>'
          + '<input type="text" data-f="note" value="' + escA(j.note)
          + '" maxlength="200" placeholder="e.g. covered NC\u2019s round at short notice" /></div>'
          + "</div></div>";
      }).join("");

      box.innerHTML =
          "<h3>Mileage expense claim</h3>"
        + '<p class="smf-sub">For extra mileage Birdie hasn\u2019t picked up \u2014 double runs, shopping trips, outings and short-notice cover.</p>'
        + '<div class="smf-who">Claiming as <strong>' + esc(o.name || "you") + "</strong></div>"
        + '<div class="smf-f"><label>Branch</label><select id="smf-branch">' + opts + "</select></div>"
        + '<div class="smf-f"><label>Week ending (Friday)</label><input type="date" id="smf-week" value="'
        + escA(st.weekEnding) + '" /></div>'
        + rows
        + '<button type="button" class="smf-add" id="smf-add">+ Add another journey</button>'
        + '<div class="smf-tot"><span>Total miles</span><strong id="smf-total">' + total().toFixed(1) + "</strong></div>"
        + '<div class="smf-note"><b>Only from your first appointment onwards.</b> Home to your first call, and your '
        + "last call back home, counts as your commute. Get claims in by <b>Friday</b> \u2014 they\u2019re paid every second Monday.</div>"
        + '<div class="smf-acts"><button type="button" class="smf-btn smf-go" id="smf-send">Send to Tyler</button>'
        + '<button type="button" class="smf-btn smf-alt" id="smf-dl">Download a copy</button></div>'
        + '<p class="smf-err" id="smf-err"></p>'
        + '<div style="text-align:center"><button type="button" class="smf-cancel" id="smf-cancel">Cancel this claim</button></div>';

      wire();
      scroll();
    }

    function wire() {
      box.querySelector("#smf-branch").addEventListener("change", function () {
        st.branch = this.value; persist();
      });
      box.querySelector("#smf-week").addEventListener("change", function () {
        st.weekEnding = this.value; persist();
      });

      Array.prototype.forEach.call(box.querySelectorAll(".smf-row"), function (row) {
        var i = parseInt(row.getAttribute("data-i"), 10);
        Array.prototype.forEach.call(row.querySelectorAll("[data-f]"), function (inp) {
          var ev = inp.tagName === "SELECT" ? "change" : "input";
          inp.addEventListener(ev, function () {
            st.journeys[i][this.getAttribute("data-f")] = this.value;
            box.querySelector("#smf-total").textContent = total().toFixed(1);
            persist();
          });
        });
      });

      Array.prototype.forEach.call(box.querySelectorAll("[data-del]"), function (b) {
        b.addEventListener("click", function () {
          st.journeys.splice(parseInt(this.getAttribute("data-del"), 10), 1);
          persist(); draw();
        });
      });

      box.querySelector("#smf-add").addEventListener("click", function () {
        var last = st.journeys[st.journeys.length - 1] || {};
        /* Journeys chain, so the next From is the last To — same as on paper */
        st.journeys.push({ date: last.date || today(), from: last.to || "", to: "", miles: "", reason: last.reason || "", note: "" });
        persist(); draw();
        var rows = box.querySelectorAll(".smf-row");
        var el = rows[rows.length - 1];
        if (el) el.querySelector('[data-f="to"]').focus();
      });

      box.querySelector("#smf-dl").addEventListener("click", download);
      box.querySelector("#smf-send").addEventListener("click", submit);
      box.querySelector("#smf-cancel").addEventListener("click", function () {
        if (!confirm("Throw this claim away?")) return;
        clearDraft(); open = false; box.remove();
        if (o.onBot) o.onBot("No problem \u2014 that claim's been cleared.");
      });
    }

    function validate() {
      if (!st.branch) return "Choose which branch you work from.";
      if (!st.weekEnding) return "Choose the week ending date.";
      for (var i = 0; i < st.journeys.length; i++) {
        var j = st.journeys[i], n = i + 1;
        if (!j.date) return "Journey " + n + " needs a date.";
        if (!String(j.from).trim()) return "Journey " + n + " needs a From.";
        if (!String(j.to).trim()) return "Journey " + n + " needs a To.";
        var m = parseFloat(j.miles);
        if (!isFinite(m) || m <= 0) return "Journey " + n + " needs the miles.";
        if (m > 500) return "Journey " + n + " looks too far \u2014 check the miles.";
        if (!j.reason) return "Journey " + n + " needs a reason.";
        if (j.reason === "Other" && !String(j.note).trim()) {
          return "Journey " + n + " is marked Other \u2014 say briefly what it was for.";
        }
      }
      return null;
    }

    function cleaned() {
      return st.journeys.map(function (j) {
        return {
          date: j.date,
          from: String(j.from).trim(),
          to: String(j.to).trim(),
          miles: Math.round(parseFloat(j.miles) * 10) / 10,
          reason: String(j.reason || "").trim(),
          note: String(j.note || "").trim()
        };
      });
    }

    function download() {
      var err = validate();
      var errEl = box.querySelector("#smf-err");
      if (err) { errEl.textContent = err; return; }
      errEl.textContent = "";
      var q = function (v) {
        v = String(v);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      };
      var lines = ["Employee,Branch,Week ending",
        [o.name || "", st.branch, st.weekEnding].map(q).join(","),
        "", "Date,From,To,Miles,Reason,Note"];
      cleaned().forEach(function (j) { lines.push([j.date, j.from, j.to, j.miles, j.reason, j.note].map(q).join(",")); });
      lines.push(",,Total," + total().toFixed(1) + ",,");
      var blob = new Blob([lines.join("\n")], { type: "text/csv" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mileage-" + st.weekEnding + ".csv";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    }

    function submit() {
      var errEl = box.querySelector("#smf-err");
      var err = validate();
      if (err) { errEl.textContent = err; return; }
      errEl.textContent = "";

      var t = o.getToken ? o.getToken() : null;
      if (!t) { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }

      var btn = box.querySelector("#smf-send");
      btn.disabled = true; btn.textContent = "Sending\u2026";

      o.call({
        action: "submit_mileage",
        token: t,
        claim: { branch: st.branch, weekEnding: st.weekEnding, journeys: cleaned() }
      }).then(function (res) {
        if (res && res.ok) {
          clearDraft(); open = false; box.remove();
          if (o.onBot) {
            o.onBot("Sent. **" + res.totalMiles + " miles** across " + res.journeys
              + (res.journeys === 1 ? " journey" : " journeys") + ", week ending " + res.weekEnding
              + ", has gone to Tyler.\n\nYour reference is " + String(res.reference).slice(0, 8)
              + ". Claims in by Friday are paid the following second Monday.");
          }
        } else if (res && res.code === "AUTH") {
          open = false; box.remove();
          if (o.onExpired) o.onExpired();
        } else {
          errEl.textContent = (res && res.error) || "That didn't send. Try again in a moment.";
          btn.disabled = false; btn.textContent = "Send to Tyler";
        }
      }).catch(function () {
        errEl.textContent = "No connection. Your claim is saved on this device \u2014 try again when you have signal.";
        btn.disabled = false; btn.textContent = "Send to Tyler";
      });
    }

    draw();
  }

  /* Recognise a mileage request without relying on the model to spot it */
  function wants(text) {
    var t = String(text).toLowerCase();
    if (!/mileage|milage|miles|petrol|fuel/.test(t)) return false;
    return /form|claim|expense|submit|fill|sheet|log|put in|send/.test(t);
  }

  w.SerenMileage = {
    open: openForm,
    wants: wants,
    isOpen: function () { return open; },
    close: function () { open = false; }
  };
})(window);
