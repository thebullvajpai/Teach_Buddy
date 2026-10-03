/* =====================================================================
 * TeachBuddy · shared site chrome
 * ---------------------------------------------------------------------
 * Injected on every page:
 *   - Google fonts + animated aurora / floating-letter background
 *   - Sticky glass navbar (desktop + mobile) with active-page highlight
 *   - Floating "AI Coach" launcher + slide-in chat drawer (Level 3
 *     reachable from anywhere, no navigation away from the page)
 *   - Scroll-reveal observer, reading progress bar, confetti helper
 *
 * Usage (last thing before </body>):
 *   <script src="<root>js/site.js" data-root="<root>" data-page="notes"></script>
 * `data-root` is the relative path back to the project root ("./", "../", "../../").
 * ===================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- *
   * Config
   * ---------------------------------------------------------------- */
  var thisScript =
    document.currentScript ||
    (function () {
      var all = document.getElementsByTagName("script");
      for (var i = all.length - 1; i >= 0; i--) {
        if (/site\.js(\?|$)/.test(all[i].src)) return all[i];
      }
      return null;
    })();

  var ROOT = (thisScript && thisScript.getAttribute("data-root")) || "./";
  var PAGE = (thisScript && thisScript.getAttribute("data-page")) || "";
  var TOPIC = (thisScript && thisScript.getAttribute("data-topic")) || "";

  if (ROOT && ROOT.slice(-1) !== "/") ROOT += "/";

  var NAV = [
    { id: "home", label: "Home", icon: "", href: "index.html" },
    { id: "notes", label: "Notes", icon: "", href: "level1/notes.html", sub: "Level 1" },
    { id: "practice", label: "Topic Practice", icon: "", href: "level1/practice.html", sub: "Level 1" },
    { id: "mixed", label: "Mixed Practice", icon: "", href: "level2/level2_dashboard.html", sub: "Level 2" },
    { id: "coach", label: "AI Coach", icon: "", href: "level3/communication.html", sub: "Level 3" }
  ];

  /** The 11 grammar topics, in the order the notes were written. */
  var TOPICS = [
    { id: "noun", title: "Noun", note: "Noun.html", icon: "", tint: "tb-i-violet", blurb: "Names of people, places, things, animals and ideas." },
    { id: "pronoun", title: "Pronoun", note: "Pronoun.html", icon: "", tint: "tb-i-sky", blurb: "Words that stand in for nouns: I, you, he, she, it." },
    { id: "verb", title: "Verb", note: "Verb.html", icon: "", tint: "tb-i-emerald", blurb: "Action and state words: the core of every sentence." },
    { id: "adjective", title: "Adjective", note: "Adjective.html", icon: "", tint: "tb-i-pink", blurb: "Describing words that add detail to nouns." },
    { id: "adverb", title: "Adverb", note: "Adverb.html", icon: "", tint: "tb-i-amber", blurb: "How, when and where an action happens." },
    { id: "preposition", title: "Preposition", note: "Preposition.html", icon: "", tint: "tb-i-cyan", blurb: "Words of place, time and direction: in, on, at." },
    { id: "article", title: "Article", note: "Article.html", icon: "", tint: "tb-i-orange", blurb: "The words that define specificity: a, an, the." },
    // The existing files use the spelling "conjuction" (missing 'n').
    { id: "conjuction", title: "Conjunction", note: "Conjuction.html", icon: "", tint: "tb-i-indigo", blurb: "Joining words that link ideas: and, but, because." },
    { id: "interjection", title: "Interjection", note: "Interjection.html", icon: "", tint: "tb-i-rose", blurb: "Words expressing sudden emotion: wow, oh, alas." },
    { id: "sentence_formation", title: "Sentence Formation", note: "Sentence_formation.html", icon: "", tint: "tb-i-lime", blurb: "Structuring words into clear, coherent sentences." },
    { id: "tense", title: "Tense", note: "Tense.html", icon: "", tint: "tb-i-fuchsia", blurb: "Past, present and future: all twelve primary forms." }
  ];

  var LOCAL_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "teachbuddy.onrender.com"];

  function chatEndpoint() {
    if (window.TB_CHAT_ENDPOINT) return window.TB_CHAT_ENDPOINT;
    if (location.protocol !== "file:" && LOCAL_HOSTS.indexOf(location.hostname) !== -1) {
      return "/chat";
    }
    return "https://teachbuddy.onrender.com/chat";
  }

  /* ---------------------------------------------------------------- *
   * Small helpers
   * ---------------------------------------------------------------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function store(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* private mode — ignore */
    }
  }

  function coins() {
    var n = parseInt(store("coins", "0"), 10);
    return isNaN(n) ? 0 : n;
  }

  function addCoins(n) {
    var total = coins() + n;
    save("coins", String(total));
    document.querySelectorAll("[data-tb-coins]").forEach(function (node) {
      node.textContent = String(total);
    });
    return total;
  }

  /**
   * The old build gated topics behind a 70% score. Those keys no longer mean
   * anything, so clear them out of returning learners' browsers.
   */
  function dropLegacyLockState() {
    try {
      localStorage.removeItem("unlockedIndex");
      localStorage.removeItem("level1_completed");
      Object.keys(localStorage).forEach(function (key) {
        if (key.indexOf("progress_") === 0) localStorage.removeItem(key);
      });
    } catch (e) {
      /* private mode — nothing to clean */
    }
  }

  /* ---------------------------------------------------------------- *
   * Animated background
   * ---------------------------------------------------------------- *
   * Note: the web fonts are linked directly from each page's <head> so the
   * browser can start fetching them during HTML parse. Injecting that link
   * from here would delay it until this script runs.
   */
  function injectBackground() {
    var aurora = el(
      "div",
      "tb-aurora",
      '<span class="tb-b1"></span><span class="tb-b2"></span><span class="tb-b3"></span><span class="tb-b4"></span>'
    );
    aurora.setAttribute("aria-hidden", "true");

    var grid = el("div", "tb-grid-lines");
    grid.setAttribute("aria-hidden", "true");

    document.body.appendChild(aurora);
    document.body.appendChild(grid);

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var glyphs = ["A", "B", "C", "a", "e", "i", "?", "!", "Aa", "Th", "ing", "ed", ",", "."];
    var layer = el("div", "tb-letters");
    layer.setAttribute("aria-hidden", "true");

    for (var i = 0; i < 16; i++) {
      var g = el("i", null, glyphs[Math.floor(Math.random() * glyphs.length)]);
      g.style.left = Math.random() * 100 + "%";
      g.style.fontSize = 14 + Math.random() * 40 + "px";
      g.style.animationDuration = 18 + Math.random() * 26 + "s";
      g.style.animationDelay = "-" + Math.random() * 34 + "s";
      layer.appendChild(g);
    }
    document.body.appendChild(layer);
  }

  /* ---------------------------------------------------------------- *
   * Navbar
   * ---------------------------------------------------------------- */
  function injectNav() {
    var desktop = "";
    var mobile = "";

    NAV.forEach(function (item) {
      if (item.id === "coach") return; // coach gets the CTA treatment
      var active = item.id === PAGE ? " is-active" : "";
      desktop +=
        '<a class="tb-nav-link' + active + '" href="' + ROOT + item.href + '">' + item.label + "</a>";
      mobile +=
        '<a class="' +
        (item.id === PAGE ? "is-active" : "") +
        '" href="' +
        ROOT +
        item.href +
        '"><span>' +
        item.label +
        (item.sub ? ' <span class="opacity-60">· ' + item.sub + "</span>" : "") +
        "</span></a>";
    });

    var nav = el("nav", "tb-nav");
    nav.innerHTML =
      '<div class="tb-nav-inner">' +
      '<a class="tb-logo" href="' +
      ROOT +
      'index.html">' +
      '<span class="tb-logo-mark">TB</span>' +
      "<span><span class=\"tb-logo-text\">Teach<span class='tb-gradient-text'>Buddy</span></span>" +
      '<span class="tb-logo-sub">Learn English</span></span></a>' +
      '<div class="tb-nav-links">' +
      desktop +
      "</div>" +
      '<div class="flex items-center gap-2">' +
      '<a class="tb-btn tb-nav-cta" href="' +
      ROOT +
      'level3/communication.html">AI Coach</a>' +
      '<button class="tb-nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>' +
      "</div>" +
      "</div>";

    var menu = el("div", "tb-mobile-menu");
    menu.innerHTML =
      mobile +
      '<a class="' +
      (PAGE === "coach" ? "is-active" : "") +
      '" href="' +
      ROOT +
      'level3/communication.html"><span></span><span>AI Coach <span class="opacity-60">· Level 3</span></span></a>';

    document.body.insertBefore(menu, document.body.firstChild);
    document.body.insertBefore(nav, document.body.firstChild);

    var toggle = nav.querySelector(".tb-nav-toggle");
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.innerHTML = open ? "✕" : "☰";
      if (open) confirmVisible(menu);
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("is-open");
        toggle.innerHTML = "☰";
      }
    });

    var onScroll = function () {
      nav.classList.toggle("tb-nav-scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------- *
   * Chat rendering (shared by drawer + Level 3 page)
   * ---------------------------------------------------------------- */
  var CORRECTION_MARKERS = ["Small improvement:", "Correction:", "Improvement:"];

  function splitReply(fullText) {
    for (var i = 0; i < CORRECTION_MARKERS.length; i++) {
      var marker = CORRECTION_MARKERS[i];
      var at = fullText.indexOf(marker);
      if (at !== -1) {
        return {
          reply: fullText.slice(0, at).trim(),
          correction: fullText.slice(at + marker.length).trim()
        };
      }
    }
    return { reply: fullText.trim(), correction: "" };
  }

  /**
   * Wires a chat UI. Returns { send, addMessage } so pages can drive it.
   * @param {object} opts { box, input, sendBtn, onCoins }
   */
  function createChat(opts) {
    var box = opts.box;
    var input = opts.input;
    var busy = false;

    function addMessage(text, type) {
      var div = el("div", "message " + type);
      div.textContent = text;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
      return div;
    }

    function typing(on) {
      var existing = box.querySelector(".tb-typing");
      if (on) {
        if (existing) return;
        var t = el("div", "tb-typing", "<i></i><i></i><i></i>");
        box.appendChild(t);
        box.scrollTop = box.scrollHeight;
      } else if (existing) {
        existing.remove();
      }
    }

    async function send(preset) {
      if (busy) return;
      var message = (preset != null ? preset : input.value).trim();
      if (!message) return;

      addMessage(message, "user");
      if (preset == null) input.value = "";
      busy = true;
      if (opts.sendBtn) opts.sendBtn.disabled = true;
      typing(true);

      try {
        var response = await fetch(chatEndpoint(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: message })
        });

        if (!response.ok) throw new Error("HTTP " + response.status);

        var data = await response.json();
        typing(false);

        var parts = splitReply(String(data.reply || ""));
        if (parts.reply) addMessage(parts.reply, "ai");
        if (parts.correction) addMessage("Small improvement: " + parts.correction, "correction");
      } catch (error) {
        typing(false);
        addMessage("Could not reach the AI coach right now. Please check your connection and try again.", "correction");
        console.error(error);
      } finally {
        busy = false;
        if (opts.sendBtn) opts.sendBtn.disabled = false;
        if (input) input.focus();
      }
    }

    if (opts.sendBtn) opts.sendBtn.addEventListener("click", function () { send(); });
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      });
    }

    return { send: send, addMessage: addMessage };
  }

  var STARTERS = [
    "Hi! How are you?",
    "Help me introduce myself",
    "Check: I am go to market.",
    "Practise a job interview",
    "Explain past tense simply"
  ];

  /* ---------------------------------------------------------------- *
   * Floating AI coach drawer
   * ---------------------------------------------------------------- */
  function injectCoach() {
    if (PAGE === "coach") return; // the page itself is the coach

    var fab = el("button", "tb-fab");
    fab.type = "button";
    fab.setAttribute("aria-label", "Open the AI communication coach");
    fab.innerHTML = '<span class="relative" style="font-size:1.4rem">AI</span><span class="tb-fab-tip">Ask the AI coach</span>';

    var backdrop = el("div", "tb-drawer-backdrop");

    var drawer = el("div", "tb-drawer");
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-label", "AI communication coach");
    drawer.innerHTML =
      '<div class="tb-drawer-head">' +
      '<span class="grid h-10 w-10 place-items-center text-sm font-extrabold" style="border-radius:10px;background:var(--tb-accent);color:#fff">AI</span>' +
      '<div class="min-w-0 flex-1">' +
      '<div class="text-sm font-extrabold leading-tight">AI Coach</div>' +
      '<div class="text-[11px] font-semibold" style="color:var(--tb-ink-soft)">Level 3</div>' +
      "</div>" +
      '<button class="tb-iconbtn" type="button" data-tb-expand title="Open full screen">⛶</button>' +
      '<button class="tb-iconbtn" type="button" data-tb-close title="Close">✕</button>' +
      "</div>" +
      '<div class="tb-drawer-body" data-tb-chatbox></div>' +
      '<div class="tb-starter-row" data-tb-starters></div>' +
      '<div class="tb-drawer-foot">' +
      '<input class="tb-input py-2.5" type="text" placeholder="Type in English…" data-tb-chatinput />' +
      '<button class="tb-btn shrink-0 px-4 py-2.5" type="button" data-tb-chatsend>Send</button>' +
      "</div>";

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
    document.body.appendChild(fab);

    var box = drawer.querySelector("[data-tb-chatbox]");
    var chat = createChat({
      box: box,
      input: drawer.querySelector("[data-tb-chatinput]"),
      sendBtn: drawer.querySelector("[data-tb-chatsend]")
    });

    chat.addMessage(
      "Hi! I'm your English coach. Say anything in English and I'll reply and gently correct your mistakes.",
      "ai"
    );

    var starters = drawer.querySelector("[data-tb-starters]");
    STARTERS.forEach(function (s) {
      var b = el("button", "tb-suggest", s);
      b.type = "button";
      b.addEventListener("click", function () { chat.send(s); });
      starters.appendChild(b);
    });



    function open() {
      drawer.classList.add("is-open");
      backdrop.classList.add("is-open");
      confirmVisible(drawer);
      fab.style.opacity = "0";
      fab.style.pointerEvents = "none";
      setTimeout(function () {
        var i = drawer.querySelector("[data-tb-chatinput]");
        if (i) i.focus();
      }, 260);
    }

    function close() {
      drawer.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      fab.style.opacity = "";
      fab.style.pointerEvents = "";
    }

    fab.addEventListener("click", open);
    backdrop.addEventListener("click", close);
    drawer.querySelector("[data-tb-close]").addEventListener("click", close);
    drawer.querySelector("[data-tb-expand]").addEventListener("click", function () {
      window.location.href = ROOT + "level3/communication.html";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
    });

    window.TB_openCoach = open;
  }

  /* ---------------------------------------------------------------- *
   * Scroll reveal + reading progress
   * ---------------------------------------------------------------- */
  var revealWatchdog = null;

  /**
   * Drop the reveal effect for the rest of the session and show everything.
   * Content visibility always wins over the animation.
   */
  function showEverything() {
    document.documentElement.classList.add("tb-no-anim");
  }

  /**
   * After opening a panel, make sure it actually became visible. If its
   * transition is frozen it would stay at opacity 0 and the learner would be
   * stuck — so drop the animations for the rest of the session.
   */
  function confirmVisible(node) {
    setTimeout(function () {
      if (parseFloat(window.getComputedStyle(node).opacity) < 0.9) showEverything();
    }, 400);
  }

  /**
   * Some embedded browsers and throttled webviews freeze CSS transitions or
   * never deliver IntersectionObserver callbacks, which would leave the lesson
   * stuck at opacity 0. If anything that is actually on screen is still
   * invisible shortly after load, bin the effect rather than the content.
   */
  function armRevealWatchdog() {
    clearTimeout(revealWatchdog);
    revealWatchdog = setTimeout(function () {
      var vh = window.innerHeight || 0;
      var stuck = false;

      document.querySelectorAll(".tb-reveal").forEach(function (n) {
        var box = n.getBoundingClientRect();
        var onScreen = box.top < vh && box.bottom > 0;
        if (onScreen && parseFloat(window.getComputedStyle(n).opacity) < 0.9) stuck = true;
      });

      if (stuck) showEverything();
    }, 1600);
  }

  function initReveal() {
    var targets = document.querySelectorAll(".tb-reveal:not(.tb-in)");
    if (!targets.length) return;

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      showEverything();
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var delay = parseInt(entry.target.getAttribute("data-delay") || "0", 10);
          setTimeout(function () { entry.target.classList.add("tb-in"); }, delay);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    targets.forEach(function (t) { io.observe(t); });
    armRevealWatchdog();
  }

  function initReadingBar() {
    if (PAGE !== "note") return;

    var bar = el("div", "tb-readbar");
    document.body.appendChild(bar);

    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, pct)) + ")";
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /** Toolbar above a topic's notes: back to library + jump to its practice. */
  function initNoteBar() {
    if (PAGE !== "note") return;

    var container = document.querySelector(".tb-notes .container");
    if (!container) return;

    var meta = null;
    for (var i = 0; i < TOPICS.length; i++) {
      if (TOPICS[i].id === TOPIC) meta = TOPICS[i];
    }

    var bar = el("div", "tb-notes-bar");
    bar.innerHTML =
      '<a class="tb-back" href="' + ROOT + 'level1/notes.html">← All notes</a>' +
      '<div class="flex items-center gap-2">' +
      (meta ? '<span class="tb-chip">' + meta.title + " · Level 1</span>" : "") +
      '<a class="tb-btn-soft" href="' +
      ROOT +
      "level1/all_quiz.html?topic=" +
      encodeURIComponent(TOPIC || "noun") +
      '">Practise this topic</a>' +
      "</div>";

    container.parentNode.insertBefore(bar, container);
  }

  /* ---------------------------------------------------------------- *
   * Confetti
   * ---------------------------------------------------------------- */
  function confetti(count) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var colors = ["#7c3aed", "#d946ef", "#f59e0b", "#10b981", "#38bdf8", "#fb7185"];
    var layer = el("div", "tb-confetti");
    document.body.appendChild(layer);

    var n = count || 90;
    for (var i = 0; i < n; i++) {
      var p = el("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.setProperty("--tb-x", (Math.random() * 260 - 130).toFixed(0) + "px");
      p.style.setProperty("--tb-r", (Math.random() * 1080 - 360).toFixed(0) + "deg");
      p.style.animationDuration = 2.2 + Math.random() * 1.8 + "s";
      p.style.animationDelay = Math.random() * 0.5 + "s";
      layer.appendChild(p);
    }

    setTimeout(function () { layer.remove(); }, 5200);
  }

  /* ---------------------------------------------------------------- *
   * Footer
   * ---------------------------------------------------------------- */
  function injectFooter() {
    if (PAGE === "coach" || document.querySelector(".tb-footer")) return;

    var links = NAV.map(function (item) {
      return '<a class="font-semibold no-underline" href="' + ROOT + item.href + '">' + item.label + "</a>";
    }).join('<span style="color:var(--tb-border-hover)">·</span>');

    var footer = el("footer", "tb-footer");
    footer.innerHTML =
      '<div class="tb-footer-inner">' +
      '<div class="flex flex-wrap items-center justify-center gap-3 text-sm">' +
      links +
      "</div>" +
      '<p class="tb-muted">TeachBuddy. Learn English step by step.</p>' +
      "</div>";

    document.body.appendChild(footer);
  }

  /* ---------------------------------------------------------------- *
   * Boot
   * ---------------------------------------------------------------- */
  function boot() {
    dropLegacyLockState();
    injectBackground();
    injectNav();
    initNoteBar();
    initReadingBar();
    injectFooter();
    injectCoach();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* Public API used by the individual pages. */
  window.TB = {
    root: ROOT,
    topics: TOPICS,
    confetti: confetti,
    coins: coins,
    addCoins: addCoins,
    createChat: createChat,
    splitReply: splitReply,
    chatEndpoint: chatEndpoint,
    starters: STARTERS,
    reveal: initReveal,
    store: store,
    save: save
  };
})();
