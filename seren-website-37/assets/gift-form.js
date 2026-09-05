/* Seren — Gift or Offer Declaration.
 *
 * Shared by the standalone /staff page and the website chat widget.
 * Supports Gifts and Legacies Policy v2.0 and the build spec of Sept 2026.
 *
 * All worker-facing copy lives in STRINGS so a Welsh version is a
 * translation job rather than a rebuild.
 */
(function (w) {
  "use strict";
  if (w.SerenGift) return;

  var K_DRAFT = "seren_gift_draft";
  var open = false;

  /* ── Copy. Taken word for word from the build spec, section 6. ── */
  var STRINGS = {
    opening: "Someone offered you something? Thanks for telling us. This takes about two minutes and it's not a complaint about you. Seren staff don't accept gifts, and logging what was offered protects you as much as it protects the person you support. Ready?",
    why: "Because if it's written down, nobody can suggest later that something was hidden. Workers who declare are doing exactly what the policy asks.",
    beforeValue: "A rough idea is fine. Nobody is going to hold you to it.",
    accepted: "That's alright, thanks for being straight with us. Most of these are easily sorted. What made you accept it?",
    will: "Thanks for flagging this. Wills are one thing we're strict about: don't help write one, don't witness one, and don't agree to be an executor. Your care manager and the Director of Care will pick this up with you. Keep going and finish the log.",
    legal: "Thanks for telling us. Staff can't act as someone's attorney, deputy, appointee or executor. Nothing for you to do now beyond finishing this log, and the Director of Care will be in touch.",
    concern: "Last one. Is there anything about this that doesn't sit right with you? There's no wrong answer, and it doesn't have to be about the gift.",
    review: "Here's what I've got. Have a read and tell me if anything's off.",
    supplier: "If this came from a supplier, a contractor or a commissioner rather than someone we support, it's handled under the Anti-Bribery Policy in the Employee Handbook and needs your line manager's prior written approval. Carry on and log it here as well.",

    startBtn: "Start",
    whyBtn: "Why am I doing this?",
    backBtn: "Back",
    nextBtn: "Next",
    skipBtn: "Skip this",
    submitBtn: "Send declaration",
    changeBtn: "Change",
    cancelBtn: "Cancel this declaration",
    cancelConfirm: "Throw this declaration away?",
    cancelled: "No problem — that's been cleared."
  };

  var BRANCHES = ["Cardiff", "Port Talbot", "Caerphilly", "Bridgend", "Blaenau Gwent"];
  /* These must stay in step with the option lists in the edge function */
  var OPTS = {
    offer_from: ["The person themselves", "A family member", "A representative or advocate", "Someone else"],
    offer_location: ["In their home", "At the door", "On the phone or online", "Somewhere else"],
    witnesses: ["No, just us", "Yes, a family member", "Yes, a colleague", "Yes, someone else"],
    offer_type: ["Cash", "Gift card or voucher", "An item or gift", "Food or drink",
                 "A loan of something", "To pay for something", "Something about a will",
                 "To act for them legally", "Something else"],
    offer_value: ["Under £10", "£10 to £25", "£25 to £50", "Over £50", "No idea"],
    offer_outcome: ["I said no", "I took it", "I left it in the house", "Something else"],
    item_location_now: ["Still with the person", "I have it", "It's at the office", "Not applicable"],
    worker_concern: ["No", "Yes"]
  };

  var CSS = ""
    + ".sgf{background:#fff;border:1.5px solid #E2E7EE;border-radius:16px;padding:18px;margin:8px 0 4px;"
    + "font-family:inherit;color:#0E2C53;line-height:1.5;box-sizing:border-box;width:100%;}"
    + ".sgf *{box-sizing:border-box;}"
    + ".sgf-prog{font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:#5B6B80;margin:0 0 10px;}"
    + ".sgf-q{font-size:16.5px;font-weight:600;margin:0 0 4px;color:#0E2C53;}"
    + ".sgf-hint{font-size:13px;color:#5B6B80;margin:0 0 14px;}"
    + ".sgf-intro{font-size:14.5px;color:#0E2C53;margin:0 0 16px;}"
    + ".sgf-note{font-size:13px;color:#5A4300;background:#FDF6E3;border-left:3px solid #FBBD1E;"
    + "border-radius:7px;padding:12px 14px;margin:0 0 14px;}"
    + ".sgf-opt{display:block;width:100%;min-height:50px;text-align:left;padding:13px 16px;margin-bottom:8px;"
    + "background:#fff;border:1.5px solid #E2E7EE;border-radius:12px;font-family:inherit;font-size:15.5px;"
    + "font-weight:500;color:#0E2C53;cursor:pointer;transition:border-color .15s,background .15s;}"
    + ".sgf-opt:hover{border-color:#0E2C53;background:#FAFBFD;}"
    + ".sgf input[type=text],.sgf input[type=date],.sgf textarea,.sgf select{width:100%;min-height:48px;"
    + "font-family:inherit;font-size:16px;padding:11px 13px;border:1.5px solid #E2E7EE;border-radius:11px;"
    + "outline:none;color:#0E2C53;background:#fff;margin-bottom:12px;}"
    + ".sgf textarea{min-height:96px;resize:vertical;line-height:1.5;}"
    + ".sgf input:focus,.sgf textarea:focus,.sgf select:focus{border-color:#0E2C53;}"
    + ".sgf-acts{display:flex;gap:9px;align-items:center;flex-wrap:wrap;}"
    + ".sgf-btn{min-height:50px;padding:0 24px;border-radius:11px;font-family:inherit;font-size:15px;"
    + "font-weight:600;cursor:pointer;border:none;background:#0E2C53;color:#fff;flex:1 1 auto;}"
    + ".sgf-btn:hover{background:#14386a;}.sgf-btn:disabled{opacity:.5;cursor:not-allowed;}"
    + ".sgf-link{background:none;border:none;color:#5B6B80;font-family:inherit;font-size:13.5px;"
    + "cursor:pointer;min-height:44px;text-decoration:underline;padding:0 6px;}"
    + ".sgf-link:hover{color:#0E2C53;}"
    + ".sgf-err{color:#B3261E;font-size:13.5px;font-weight:500;margin:10px 0 0;min-height:19px;}"
    + ".sgf-rev{border:1.5px solid #E2E7EE;border-radius:12px;padding:4px 14px;margin-bottom:14px;}"
    + ".sgf-rev-row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;"
    + "padding:11px 0;border-bottom:1px solid #F1F4F8;}"
    + ".sgf-rev-row:last-child{border-bottom:none;}"
    + ".sgf-rev-k{font-size:12.5px;color:#5B6B80;flex:0 0 42%;}"
    + ".sgf-rev-v{font-size:13.5px;color:#0E2C53;font-weight:500;flex:1 1 auto;word-break:break-word;}"
    + ".sgf-rev-b{background:none;border:none;color:#1B4176;font-family:inherit;font-size:12.5px;"
    + "cursor:pointer;text-decoration:underline;flex:0 0 auto;padding:0;min-height:24px;}";

  function injectCss() {
    if (document.getElementById("seren-gift-css")) return;
    var s = document.createElement("style");
    s.id = "seren-gift-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escA(s) { return esc(s).replace(/"/g, "&quot;"); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function yesterday() {
    var d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(K_DRAFT) || "null"); } catch (e) { return null; }
  }
  function saveDraft(d) { try { localStorage.setItem(K_DRAFT, JSON.stringify(d)); } catch (e) {} }
  function clearDraft() { try { localStorage.removeItem(K_DRAFT); } catch (e) {} }

  function openForm(o) {
    if (open || !o || !o.mount) return;
    open = true;
    injectCss();

    var a = loadDraft() || {};
    var box = document.createElement("div");
    box.className = "sgf";
    o.mount.appendChild(box);

    var scroll = o.scroll || function () {
      try { o.mount.scrollTop = o.mount.scrollHeight; } catch (e) {}
    };

    /* ── The questions, in order. `when` hides a step unless it applies. ── */
    var STEPS = [
      { id: "intro", kind: "intro" },
      { id: "branch", kind: "select", q: "Which branch do you work from?", opts: BRANCHES },
      { id: "individual_name", kind: "text", q: "Who do you support, where this happened?",
        hint: "First initial and surname, so the office knows who you mean. For example, J Williams.",
        placeholder: "e.g. J Williams" },
      { id: "offer_from", kind: "buttons", q: "Who offered it to you?", opts: OPTS.offer_from },
      { id: "offer_from_other", kind: "text", q: "Who was it?", placeholder: "e.g. a neighbour, a supplier",
        when: function (v) { return v.offer_from === "Someone else"; },
        note: STRINGS.supplier },
      { id: "offer_date", kind: "date", q: "When was this offered?" },
      { id: "offer_location", kind: "buttons", q: "Where were you?", opts: OPTS.offer_location },
      { id: "witnesses", kind: "buttons", q: "Was anyone else there?", opts: OPTS.witnesses },
      { id: "witnesses_detail", kind: "text", q: "Who was that?", placeholder: "Optional", optional: true,
        when: function (v) { return v.witnesses === "Yes, someone else"; } },
      { id: "offer_type", kind: "buttons", q: "What was it?", opts: OPTS.offer_type },
      { id: "offer_description", kind: "textarea", q: "Tell us in your own words what was offered.",
        placeholder: "A sentence or two is plenty." },
      { id: "offer_value", kind: "buttons", q: "Roughly what do you think it was worth?",
        opts: OPTS.offer_value, hint: STRINGS.beforeValue },
      { id: "offer_outcome", kind: "buttons", q: "What happened in the end?", opts: OPTS.offer_outcome },
      { id: "accept_reason", kind: "textarea", q: "What made you accept it?", intro: STRINGS.accepted,
        when: function (v) { return v.offer_outcome === "I took it"; } },
      { id: "item_location_now", kind: "buttons", q: "Where is it now?", opts: OPTS.item_location_now,
        when: function (v) { return v.offer_outcome === "I took it" || v.offer_outcome === "I left it in the house"; } },
      { id: "worker_concern", kind: "buttons", q: "Is there anything about this that doesn't sit right with you?",
        opts: OPTS.worker_concern, intro: STRINGS.concern },
      { id: "worker_concern_detail", kind: "textarea", q: "What's worrying you?",
        hint: "Say as much or as little as you want.",
        when: function (v) { return v.worker_concern === "Yes"; } },
      { id: "anything_else", kind: "textarea", q: "Anything else we should know?", optional: true },
      { id: "review", kind: "review" }
    ];

    var vals = a.vals || {};
    var i = a.step || 0;
    var editingFrom = null;   // set when jumping back from the review step

    function visible() {
      return STEPS.filter(function (s) { return !s.when || s.when(vals); });
    }
    function persist() { saveDraft({ vals: vals, step: i }); }

    function labelFor(id) {
      var map = {
        branch: "Branch", individual_name: "Person supported", offer_from: "Offered by",
        offer_from_other: "Who", offer_date: "Date", offer_location: "Where",
        witnesses: "Anyone else there", witnesses_detail: "Who else", offer_type: "What was offered",
        offer_description: "In your words", offer_value: "Rough value", offer_outcome: "What happened",
        accept_reason: "Why you accepted", item_location_now: "Where it is now",
        worker_concern: "Anything not right", worker_concern_detail: "What's worrying you",
        anything_else: "Anything else"
      };
      return map[id] || id;
    }

    /* Holding messages that appear once, after certain answers */
    function noteAfter(step) {
      if (step.id !== "offer_type") return "";
      if (vals.offer_type === "Something about a will") return STRINGS.will;
      if (vals.offer_type === "To act for them legally") return STRINGS.legal;
      return "";
    }

    function go(n) {
      i = n; persist(); draw();
    }

    function next() {
      var list = visible();
      var here = list[i];
      if (editingFrom !== null) {
        // came from the review step, so go straight back to it
        var revIdx = list.length - 1;
        editingFrom = null;
        go(revIdx);
        return;
      }
      go(Math.min(i + 1, visible().length - 1));
    }

    function draw() {
      var list = visible();
      if (i >= list.length) i = list.length - 1;
      var s = list[i];
      var qNum = i, qTotal = list.length - 2; // exclude intro and review

      var head = s.kind === "intro" || s.kind === "review"
        ? ""
        : '<p class="sgf-prog">Question ' + qNum + " of " + qTotal + "</p>";

      var body = "";

      if (s.kind === "intro") {
        body = '<p class="sgf-intro">' + esc(STRINGS.opening) + "</p>"
             + '<div class="sgf-acts"><button type="button" class="sgf-btn" data-go="start">'
             + esc(STRINGS.startBtn) + '</button>'
             + '<button type="button" class="sgf-link" data-go="why">' + esc(STRINGS.whyBtn) + "</button></div>"
             + '<div id="sgf-why"></div>';

      } else if (s.kind === "review") {
        var rows = list.filter(function (x) {
          return x.kind !== "intro" && x.kind !== "review";
        }).map(function (x) {
          var v = vals[x.id];
          if (!v && x.optional) v = "—";
          return '<div class="sgf-rev-row"><span class="sgf-rev-k">' + esc(labelFor(x.id)) + "</span>"
            + '<span class="sgf-rev-v">' + esc(v || "—") + "</span>"
            + '<button type="button" class="sgf-rev-b" data-edit="' + escA(x.id) + '">'
            + esc(STRINGS.changeBtn) + "</button></div>";
        }).join("");
        body = '<p class="sgf-intro">' + esc(STRINGS.review) + "</p>"
             + '<div class="sgf-rev">' + rows + "</div>"
             + '<div class="sgf-acts"><button type="button" class="sgf-btn" id="sgf-send">'
             + esc(STRINGS.submitBtn) + "</button></div>";

      } else {
        if (s.intro) body += '<p class="sgf-intro">' + esc(s.intro) + "</p>";
        if (s.note) body += '<div class="sgf-note">' + esc(s.note) + "</div>";
        body += '<p class="sgf-q">' + esc(s.q) + "</p>";
        if (s.hint) body += '<p class="sgf-hint">' + esc(s.hint) + "</p>";

        if (s.kind === "buttons" || s.kind === "select") {
          body += s.opts.map(function (opt) {
            return '<button type="button" class="sgf-opt" data-pick="' + escA(opt) + '">' + esc(opt) + "</button>";
          }).join("");
        } else if (s.kind === "text") {
          body += '<input type="text" id="sgf-in" value="' + escA(vals[s.id] || "")
                + '" placeholder="' + escA(s.placeholder || "") + '" />';
        } else if (s.kind === "textarea") {
          body += '<textarea id="sgf-in" placeholder="' + escA(s.placeholder || "") + '">'
                + esc(vals[s.id] || "") + "</textarea>";
        } else if (s.kind === "date") {
          body += '<button type="button" class="sgf-opt" data-date="' + today() + '">Today</button>'
                + '<button type="button" class="sgf-opt" data-date="' + yesterday() + '">Yesterday</button>'
                + '<input type="date" id="sgf-in" max="' + today() + '" value="' + escA(vals[s.id] || "") + '" />';
        }

        var needsNext = s.kind === "text" || s.kind === "textarea" || s.kind === "date";
        body += '<div class="sgf-acts">';
        if (needsNext) {
          body += '<button type="button" class="sgf-btn" id="sgf-next">' + esc(STRINGS.nextBtn) + "</button>";
        }
        if (s.optional) {
          body += '<button type="button" class="sgf-link" id="sgf-skip">' + esc(STRINGS.skipBtn) + "</button>";
        }
        if (i > 1) {
          body += '<button type="button" class="sgf-link" id="sgf-back">' + esc(STRINGS.backBtn) + "</button>";
        }
        body += "</div>";
      }

      box.innerHTML = head + body + '<p class="sgf-err" id="sgf-err"></p>'
        + '<div style="text-align:center"><button type="button" class="sgf-link" id="sgf-cancel">'
        + esc(STRINGS.cancelBtn) + "</button></div>";

      wire(s);
      scroll();
    }

    function commit(id, value) {
      vals[id] = value;
      var extra = noteAfter({ id: id });
      persist();
      if (extra && o.onBot) o.onBot(extra);
      next();
    }

    function wire(s) {
      var err = box.querySelector("#sgf-err");

      box.querySelectorAll("[data-pick]").forEach(function (b) {
        b.addEventListener("click", function () {
          commit(s.id, this.getAttribute("data-pick"));
        });
      });

      box.querySelectorAll("[data-date]").forEach(function (b) {
        b.addEventListener("click", function () {
          commit(s.id, this.getAttribute("data-date"));
        });
      });

      var start = box.querySelector('[data-go="start"]');
      if (start) start.addEventListener("click", function () { go(1); });

      var why = box.querySelector('[data-go="why"]');
      if (why) why.addEventListener("click", function () {
        box.querySelector("#sgf-why").innerHTML = '<div class="sgf-note">' + esc(STRINGS.why) + "</div>";
      });

      var nx = box.querySelector("#sgf-next");
      if (nx) nx.addEventListener("click", function () {
        var el = box.querySelector("#sgf-in");
        var v = (el && el.value || "").trim();
        if (!v && !s.optional) { err.textContent = "This one's needed."; return; }
        commit(s.id, v);
      });

      var skip = box.querySelector("#sgf-skip");
      if (skip) skip.addEventListener("click", function () { commit(s.id, ""); });

      var back = box.querySelector("#sgf-back");
      if (back) back.addEventListener("click", function () { go(Math.max(1, i - 1)); });

      box.querySelectorAll("[data-edit]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = this.getAttribute("data-edit");
          var list = visible();
          for (var k = 0; k < list.length; k++) {
            if (list[k].id === id) { editingFrom = i; go(k); return; }
          }
        });
      });

      var send = box.querySelector("#sgf-send");
      if (send) send.addEventListener("click", submit);

      var cancel = box.querySelector("#sgf-cancel");
      if (cancel) cancel.addEventListener("click", function () {
        if (!confirm(STRINGS.cancelConfirm)) return;
        clearDraft(); open = false; box.remove();
        if (o.onBot) o.onBot(STRINGS.cancelled);
      });
    }

    function submit() {
      var err = box.querySelector("#sgf-err");
      var t = o.getToken ? o.getToken() : null;
      if (!t) { open = false; box.remove(); if (o.onExpired) o.onExpired(); return; }

      var btn = box.querySelector("#sgf-send");
      btn.disabled = true; btn.textContent = "Sending…";

      o.call({ action: "submit_gift", token: t, declaration: vals })
        .then(function (res) {
          if (res && res.ok) {
            clearDraft(); open = false; box.remove();
            if (o.onBot) {
              o.onBot("Logged. Your reference is **" + res.reference + "**. Your care manager will look at it "
                + "within five working days and come back to you. Thanks for doing this properly.");
            }
          } else if (res && res.code === "AUTH") {
            open = false; box.remove();
            if (o.onExpired) o.onExpired();
          } else {
            err.textContent = (res && res.error) || "That didn't send. Try again in a moment.";
            btn.disabled = false; btn.textContent = STRINGS.submitBtn;
          }
        })
        .catch(function () {
          err.textContent = "Something's gone wrong at our end, but I've saved what you've told me. "
            + "Try again when you have signal. If it's urgent, ring your care manager.";
          btn.disabled = false; btn.textContent = STRINGS.submitBtn;
        });
    }

    draw();
  }

  /* Recognise a gift declaration request without relying on the model */
  function wants(text) {
    var t = String(text).toLowerCase();
    if (/\bgift\b|\bgifts\b|\bpresent\b|\btip\b|\btips\b|\bmoney\b|\bcash\b|\bvoucher\b|\bbequest\b|\blegacy\b|\bwill\b|£\s?\d/.test(t)
        && /declar|log|report|offer|left me|gave me|given me|form/.test(t)) return true;
    if (/someone offered me|client offered me|offered me a|tried to give me|wants to leave me/.test(t)) return true;
    if (/declare a gift|gift declaration|declare an offer/.test(t)) return true;
    return false;
  }

  w.SerenGift = {
    open: openForm,
    wants: wants,
    isOpen: function () { return open; },
    close: function () { open = false; }
  };
})(window);
