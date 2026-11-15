/* TT ARTcade play counter
   One tag on the ARTcade Code block (append to the last line, after intro-hold.js):
     <script src="https://therapytoaster.github.io/tt-live/arcade/play-counter.js?c=SHA"></script>
   Finds every game card in #tt-arc, shows a scaled-down copy of the Home
   "SITE VISITS" counter (yellow skull, PLAYS label, boxed odometer) and
   increments that game's Abacus key when PLAY is pressed. At most once
   per game per visitor session (sessionStorage).
   Keys: namespace "therapytoaster", key "arcade-<slug>" (or "test-arcade-<slug>"
   when the script tag has data-prefix="test-"). Missing keys display as 0.
   If Abacus fails, the badge hides and nothing is logged to the console.
*/
(function(){
  if (window.__ttPlayCounter) return;
  window.__ttPlayCounter = 1;

  var SK1 = "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@ca8f8599458c7f338dea3c1a234d2e593feb8888/paste/0810/tt-vc-skull-v5.png";
  var SK2 = "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@ca8f8599458c7f338dea3c1a234d2e593feb8888/paste/0810/tt-vc-skull-v5-2x.png";

  var ATTR_SLUG = {
    sk: "skullz",
    crypt: "crypt",
    pit: "toaster-pit",
    kart: "kart",
    bo: "burnt-offerings",
    crumb: "crumb-dungeon",
    pf: "prize-floor"
  };

  var CFG = {
    base: "https://abacus.jasoncameron.dev",
    ns: "therapytoaster",
    keyHead: "arcade-",
    minDigits: 4,
    timeoutMs: 8000,
    skipAutomation: true
  };

  var me = document.currentScript;
  var prefix = "";
  try {
    if (window.__ttPlayCounterPrefix != null) prefix = String(window.__ttPlayCounterPrefix);
    else if (me && me.getAttribute("data-prefix")) prefix = me.getAttribute("data-prefix");
  } catch(e) {}
  var testMode = !!prefix;
  var storePrefix = "ttpc:" + (prefix || "live:") ;

  function injectStyle(){
    if (document.getElementById("tt-pc-css")) return;
    var st = document.createElement("style");
    st.id = "tt-pc-css";
    st.textContent =
      "#tt-arc .tt-pc{display:none;box-sizing:border-box;width:100%;margin:12px 0 0;padding:0;background:transparent;text-align:left;"+
        "font-family:\"Courier New\",Courier,monospace;color:#FFD400;line-height:1;position:relative;z-index:2;pointer-events:none}"+
      "#tt-arc .tt-pc.tt-pc-on{display:block}"+
      "#tt-arc .tt-pc *{box-sizing:border-box}"+
      "#tt-arc .tt-pc-in{display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:6px 8px;"+
        "padding:5px 8px;border:1px solid rgba(255,212,0,.45);background:linear-gradient(#0a0e1a,#05070d);"+
        "box-shadow:0 0 0 1px #000,0 0 10px rgba(255,212,0,.12),inset 0 0 10px rgba(0,0,0,.8);max-width:100%}"+
      "#tt-arc .tt-pc-grp{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}"+
      "#tt-arc .tt-pc-lbl{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;"+
        "text-shadow:-1px 0 rgba(255,40,60,.85),1px 0 rgba(0,220,255,.7)}"+
      "#tt-arc .tt-pc-odo{display:inline-flex;gap:1px;padding:2px;background:#000;border:1px solid #2a2410}"+
      "#tt-arc .tt-pc-d{position:relative;display:inline-block;width:13px;height:18px;overflow:hidden;"+
        "background:linear-gradient(#000 0%,#15130a 48%,#000 50%,#15130a 52%,#000 100%);"+
        "border:1px solid #3a3215;border-radius:2px}"+
      "#tt-arc .tt-pc-d::after{content:\"\";position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(0,0,0,.85)}"+
      "#tt-arc .tt-pc-strip{display:block;transform:translateY(0);transition:transform 1.1s cubic-bezier(.2,.8,.2,1)}"+
      "#tt-arc .tt-pc-strip span{display:block;height:16px;line-height:16px;font-size:13px;font-weight:700;text-align:center;"+
        "color:#FFD400;text-shadow:-1px 0 rgba(255,40,60,.75),1px 0 rgba(0,220,255,.6),0 0 6px rgba(255,212,0,.45)}"+
      "#tt-arc .tt-pc.tt-pc-glitch .tt-pc-in{animation:tt-pc-gl .22s steps(2,end) 1}"+
      "@keyframes tt-pc-gl{0%{transform:translate(0)}25%{transform:translate(-2px,0) skewX(-5deg)}"+
        "50%{transform:translate(2px,-1px)}75%{transform:translate(-1px,1px) skewX(4deg)}100%{transform:translate(0)}}"+
      "#tt-arc .tt-pc-sk{position:relative;display:inline-block;width:32px;height:34px;flex:0 0 auto;"+
        "animation:tt-pc-bob 2.8s ease-in-out infinite}"+
      "#tt-arc .tt-pc-sk-j{position:relative;display:block;width:100%;height:100%}"+
      "#tt-arc .tt-pc-sk img{display:block;width:100%;height:100%;object-fit:contain;position:relative;z-index:2;pointer-events:none}"+
      "#tt-arc .tt-pc-sk-j::before,#tt-arc .tt-pc-sk-j::after{"+
        "content:\"\";position:absolute;inset:0;z-index:3;pointer-events:none;opacity:0;"+
        "-webkit-mask-image:var(--tt-pc-sk);mask-image:var(--tt-pc-sk);"+
        "-webkit-mask-size:contain;mask-size:contain;"+
        "-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;"+
        "-webkit-mask-position:center;mask-position:center}"+
      "#tt-arc .tt-pc-sk-j::before{background:#ff0030}"+
      "#tt-arc .tt-pc-sk-j::after{background:#00e8ff}"+
      "#tt-arc .tt-pc-sl{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;"+
        "background-image:var(--tt-pc-sk);background-repeat:no-repeat;background-position:center;background-size:contain}"+
      "#tt-arc .tt-pc-sl1{clip-path:inset(0 0 68% 0)}"+
      "#tt-arc .tt-pc-sl2{clip-path:inset(32% 0 32% 0)}"+
      "#tt-arc .tt-pc-sl3{clip-path:inset(68% 0 0 0)}"+
      "#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sl1{opacity:1;animation:tt-pc-sl-a .28s steps(2,end) 2}"+
      "#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sl2{opacity:1;animation:tt-pc-sl-b .28s steps(2,end) 2}"+
      "#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sl3{opacity:1;animation:tt-pc-sl-c .28s steps(2,end) 2}"+
      "@keyframes tt-pc-sl-a{0%,100%{transform:translate(0,0)}25%{transform:translate(-5px,0)}50%{transform:translate(4px,0)}75%{transform:translate(-3px,1px)}}"+
      "@keyframes tt-pc-sl-b{0%,100%{transform:translate(0,0)}25%{transform:translate(5px,0)}50%{transform:translate(-6px,0)}75%{transform:translate(2px,-1px)}}"+
      "@keyframes tt-pc-sl-c{0%,100%{transform:translate(0,0)}25%{transform:translate(-4px,0)}50%{transform:translate(5px,1px)}75%{transform:translate(-3px,0)}}"+
      "#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sk-j{animation:tt-pc-jerk .24s steps(2,end) 1}"+
      "#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sk-j::before{animation:tt-pc-rgb-burst-r .28s steps(2,end) 2}"+
      "#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sk-j::after{animation:tt-pc-rgb-burst-c .28s steps(2,end) 2}"+
      "@keyframes tt-pc-rgb-burst-r{0%,100%{opacity:.25;transform:translate(-2px,0)}25%{opacity:.95;transform:translate(-5px,1px)}50%{opacity:.8;transform:translate(4px,-1px)}75%{opacity:.9;transform:translate(-4px,0)}}"+
      "@keyframes tt-pc-rgb-burst-c{0%,100%{opacity:.25;transform:translate(2px,0)}25%{opacity:.95;transform:translate(5px,-1px)}50%{opacity:.8;transform:translate(-4px,1px)}75%{opacity:.9;transform:translate(4px,0)}}"+
      "@keyframes tt-pc-jerk{0%{transform:translate(0,0) skewX(0)}20%{transform:translate(-4px,1px) skewX(-9deg)}50%{transform:translate(5px,-1px) skewX(7deg)}75%{transform:translate(-2px,1px) skewX(-4deg)}100%{transform:translate(0,0) skewX(0)}}"+
      "@keyframes tt-pc-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(2px)}}"+
      /* cabinets are tight: shrink the same chrome so 4 digits still fit, pin to the bottom of the cell */
      "#tt-arc .ta-cab:has(.tt-pc){padding-bottom:14px}"+
      "#tt-arc .ta-cab .tt-pc{margin:8px 0 0;text-align:center;margin-top:auto;padding-top:8px}"+
      "#tt-arc .ta-cab .tt-pc-in{justify-content:center;gap:4px 5px;padding:3px 5px}"+
      "#tt-arc .ta-cab .tt-pc-grp{gap:4px}"+
      "#tt-arc .ta-cab .tt-pc-lbl{font-size:7px;letter-spacing:.12em}"+
      "#tt-arc .ta-cab .tt-pc-odo{gap:1px;padding:1px}"+
      "#tt-arc .ta-cab .tt-pc-d{width:9px;height:13px;border-radius:1px}"+
      "#tt-arc .ta-cab .tt-pc-strip span{height:11px;line-height:11px;font-size:9px}"+
      "#tt-arc .ta-cab .tt-pc-sk{width:20px;height:21px}"+
      "#tt-arc .ta-cab.ta-on .tt-pc-in{box-shadow:0 0 0 1px #000,0 0 8px rgba(0,0,0,.35),inset 0 0 8px rgba(0,0,0,.8)}"+
      "@media (max-width:640px){"+
        "#tt-arc .tt-pc{margin-top:10px;text-align:center}"+
        "#tt-arc .tt-pc-in{justify-content:center}"+
        "#tt-arc .tt-ns .tt-pc-d{width:11px;height:16px}"+
        "#tt-arc .tt-ns .tt-pc-strip span{height:14px;line-height:14px;font-size:11px}"+
        "#tt-arc .tt-ns .tt-pc-sk{width:24px;height:26px}"+
        "#tt-arc .tt-ns .tt-pc-lbl{font-size:8px}"+
      "}"+
      "@media (prefers-reduced-motion:reduce){"+
        "#tt-arc .tt-pc-strip{transition:none}"+
        "#tt-arc .tt-pc.tt-pc-glitch .tt-pc-in{animation:none}"+
        "#tt-arc .tt-pc-sk,#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sk-j,"+
        "#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sl1,#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sl2,#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sl3{animation:none}"+
        "#tt-arc .tt-pc-sk-j::before,#tt-arc .tt-pc-sk-j::after{animation:none;opacity:0}"+
        "#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sl1,#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sl2,#tt-arc .tt-pc.tt-pc-glitch .tt-pc-sl3{opacity:0}"+
      "}";
    (document.head || document.documentElement).appendChild(st);
  }

  function slugify(s){
    return String(s || "").toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "game";
  }

  function slugFor(card){
    if (!card) return "game";
    var k = card.getAttribute("data-k");
    if (k) return slugify(k);
    var attrs = card.attributes || [];
    for (var i = 0; i < attrs.length; i++) {
      var m = /^data-([a-z0-9-]+)-card$/i.exec(attrs[i].name);
      if (m) return ATTR_SLUG[m[1].toLowerCase()] || slugify(m[1]);
    }
    var title = card.getAttribute("data-title") ||
      (card.querySelector(".tt-ns-t, .ta-t") && card.querySelector(".tt-ns-t, .ta-t").textContent) ||
      card.getAttribute("aria-label") || "";
    return slugify(title);
  }

  function keyFor(slug){
    return (prefix + CFG.keyHead + slug).slice(0, 64);
  }

  function seenStore(slug){ return storePrefix + "seen:" + slug; }

  function wasSeen(slug){
    try { return !!sessionStorage.getItem(seenStore(slug)); } catch(e) { return false; }
  }
  function markSeen(slug){
    try { sessionStorage.setItem(seenStore(slug), "1"); } catch(e) {}
  }

  function inEditor(){
    try { return window.self !== window.top; } catch(e) { return true; }
  }
  function isBot(){
    if (testMode) return false;
    if (!CFG.skipAutomation) return false;
    try { return !!(navigator.webdriver || /bot|crawl|spider|slurp|preview|lighthouse/i.test(navigator.userAgent || "")); }
    catch(e) { return false; }
  }

  function req(op, key){
    var url = CFG.base + "/" + op + "/" + CFG.ns + "/" + key;
    var ctl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function(){ try { if (ctl) ctl.abort(); } catch(e) {} }, CFG.timeoutMs);
    return fetch(url, { mode: "cors", cache: "no-store", credentials: "omit", signal: ctl ? ctl.signal : undefined })
      .then(function(r){
        clearTimeout(t);
        if (op === "get" && r.status === 404) return { value: 0 };
        if (!r.ok) throw new Error("bad");
        return r.json();
      })
      .then(function(j){
        var v = j && typeof j.value === "number" ? j.value : NaN;
        if (!isFinite(v) || v < 0) throw new Error("bad");
        return Math.floor(v);
      }, function(err){
        clearTimeout(t);
        throw err;
      });
  }
  function delay(ms){ return new Promise(function(res){ setTimeout(res, ms); }); }
  function getCount(key){
    return req("get", key).catch(function(){
      return delay(600).then(function(){ return req("get", key); });
    });
  }
  function hitCount(key){
    return req("hit", key).catch(function(){
      return delay(600).then(function(){ return req("hit", key); });
    });
  }

  function digits(n){
    var s = String(Math.max(0, Math.floor(n)));
    while (s.length < CFG.minDigits) s = "0" + s;
    return s;
  }
  function odoHtml(n){
    var s = digits(n), h = '<span class="tt-pc-odo" aria-hidden="true">';
    for (var i = 0; i < s.length; i++) {
      h += '<span class="tt-pc-d"><span class="tt-pc-strip" data-d="' + s.charAt(i) + '">';
      for (var k = 0; k <= 9; k++) h += "<span>" + k + "</span>";
      h += "</span></span>";
    }
    return h + "</span>";
  }
  function cellH(box){
    var strip = box.querySelector(".tt-pc-strip");
    var span = strip && strip.firstChild;
    return (span && span.offsetHeight) || 15;
  }
  function roll(box){
    var strips = box.querySelectorAll(".tt-pc-strip");
    var h = cellH(box);
    for (var i = 0; i < strips.length; i++)
      strips[i].style.transform = "translateY(-" + (parseInt(strips[i].getAttribute("data-d"), 10) * h) + "px)";
  }
  function paint(box, n){
    box.setAttribute("aria-label", "Plays: " + n);
    box.setAttribute("data-count", String(n));
    var s = digits(n);
    var strips = box.querySelectorAll(".tt-pc-strip");
    if (strips.length !== s.length) {
      var odoEl = box.querySelector(".tt-pc-odo");
      if (odoEl) odoEl.outerHTML = odoHtml(n);
    } else {
      for (var i = 0; i < strips.length; i++) strips[i].setAttribute("data-d", s.charAt(i));
    }
    roll(box);
  }

  function buildBadge(n){
    var box = document.createElement("span");
    box.className = "tt-pc";
    box.setAttribute("role", "status");
    box.setAttribute("aria-label", "Plays: " + n);
    box.style.setProperty("--tt-pc-sk", "url('" + SK2 + "')");
    box.innerHTML = '<span class="tt-pc-in">' +
      '<span class="tt-pc-sk" aria-hidden="true"><span class="tt-pc-sk-j">' +
        '<span class="tt-pc-sl tt-pc-sl1"></span><span class="tt-pc-sl tt-pc-sl2"></span><span class="tt-pc-sl tt-pc-sl3"></span>' +
        '<img alt="" width="122" height="128" src="' + SK1 + '" srcset="' + SK1 + ' 122w, ' + SK2 + ' 244w" sizes="28px">' +
      '</span></span>' +
      '<span class="tt-pc-grp"><span class="tt-pc-lbl">Plays</span>' + odoHtml(n) + "</span></span>";
    return box;
  }

  function placeBadge(card, box){
    if (card.classList.contains("ta-cab")) {
      card.appendChild(box);
      return;
    }
    var col = card.querySelector(":scope > div") || card;
    var keys = col.querySelector(".tt-ns-keys");
    var play = col.querySelector(".tt-ns-play");
    if (keys && keys.parentNode) keys.parentNode.insertBefore(box, keys.nextSibling);
    else if (play && play.parentNode) play.parentNode.insertBefore(box, play.nextSibling);
    else col.appendChild(box);
  }

  var glitchTimers = [];
  function armGlitch(box){
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    var offset = 700 + Math.floor(Math.random() * 1800);
    var t1 = setTimeout(function tick(){
      if (!document.body.contains(box)) return;
      if (!document.hidden) {
        box.classList.remove("tt-pc-glitch");
        void box.offsetWidth;
        box.classList.add("tt-pc-on", "tt-pc-glitch");
      }
      setTimeout(function(){ box.classList.remove("tt-pc-glitch"); box.classList.add("tt-pc-on"); }, 320);
    }, offset);
    var t2 = setInterval(function(){
      if (!document.body.contains(box)) { clearInterval(t2); return; }
      if (document.hidden) return;
      box.classList.remove("tt-pc-glitch");
      void box.offsetWidth;
      box.classList.add("tt-pc-on", "tt-pc-glitch");
      setTimeout(function(){ if (document.body.contains(box)) { box.classList.remove("tt-pc-glitch"); box.classList.add("tt-pc-on"); } }, 320);
    }, 3200 + Math.floor(Math.random() * 1600));
    glitchTimers.push(t1, t2);
  }

  function show(box, n){
    paint(box, n);
    box.classList.add("tt-pc-on");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { roll(box); return; }
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ roll(box); }); });
  }

  function hide(box){
    try {
      box.classList.remove("tt-pc-on", "tt-pc-glitch");
      if (box.parentNode) box.parentNode.removeChild(box);
    } catch(e) {}
  }

  var pending = {};
  var values = {};

  function attach(card){
    try {
      if (!card || card.querySelector(":scope > .tt-pc, .tt-pc")) return;
      try {
        var cs = window.getComputedStyle(card);
        if (cs && (cs.display === "none" || cs.visibility === "hidden")) return;
      } catch(e) {}
      var slug = slugFor(card);
      if (!slug) return;
      card.setAttribute("data-tt-plays-slug", slug);
      var box = buildBadge(0);
      box.setAttribute("data-slug", slug);
      placeBadge(card, box);
      if (!window.fetch || !window.Promise) { hide(box); return; }
      getCount(keyFor(slug)).then(function(v){
        if (!document.body.contains(box)) return;
        values[slug] = v;
        show(box, v);
        armGlitch(box);
      })["catch"](function(){ hide(box); });
    } catch(e) {}
  }

  function scan(root){
    root = root || document.getElementById("tt-arc");
    if (!root) return;
    var cards = root.querySelectorAll(".tt-ns, .ta-cab");
    for (var i = 0; i < cards.length; i++) attach(cards[i]);
  }

  function isPlayClick(target, card){
    if (!target || !card) return false;
    if (card.classList.contains("ta-cab")) {
      if (card.classList.contains("ta-on")) return false;
      if (target.closest && target.closest("a")) return false;
      return true;
    }
    if (target.closest && target.closest("a, .tt-pc")) return false;
    if (target.closest && target.closest(".tt-ns-play, .tt-ns-shot")) return true;
    var el = target;
    while (el && el !== card) {
      if (el.getAttribute) {
        var attrs = el.attributes;
        for (var i = 0; i < attrs.length; i++) {
          if (/^data-[a-z0-9-]+-play$/i.test(attrs[i].name)) return true;
        }
      }
      el = el.parentNode;
    }
    return false;
  }

  function onPlay(slug, box){
    if (!slug || pending[slug] || wasSeen(slug)) return;
    if (inEditor() || isBot()) return;
    pending[slug] = true;
    hitCount(keyFor(slug)).then(function(v){
      markSeen(slug);
      values[slug] = v;
      pending[slug] = false;
      if (box && document.body.contains(box)) show(box, v);
    })["catch"](function(){ pending[slug] = false; });
  }

  function onClick(e){
    try {
      var t = e.target;
      if (!t || !t.closest) return;
      var root = document.getElementById("tt-arc");
      if (!root || !root.contains(t)) return;
      var card = t.closest(".tt-ns, .ta-cab");
      if (!card || !root.contains(card)) return;
      if (!isPlayClick(t, card)) return;
      var slug = card.getAttribute("data-tt-plays-slug") || slugFor(card);
      var box = card.querySelector(".tt-pc");
      onPlay(slug, box);
    } catch(err) {}
  }

  function start(){
    injectStyle();
    scan();
    if (!window.__ttPlayCounterClick) {
      window.__ttPlayCounterClick = 1;
      document.addEventListener("click", onClick, true);
    }
    if (!window.__ttPlayCounterMo) {
      window.__ttPlayCounterMo = 1;
      try {
        new MutationObserver(function(){
          try { scan(); } catch(e) {}
        }).observe(document.documentElement, { childList: true, subtree: true });
      } catch(e) {}
    }
    try { window.addEventListener("mercury:load", function(){ scan(); }); } catch(e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
