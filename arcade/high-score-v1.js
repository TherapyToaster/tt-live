/* TT ARTcade HIGH SCORE badges v1 (replaces play-counter.js on the ARTcade Code block)
   One tag:  <script src="https://therapytoaster.github.io/tt-live/arcade/high-score-v1.js"></script>
   Same look as the PLAYS badge (yellow skull + boxed flip digits), label HIGH SCORE.
   Value = shared best score for that game: Abacus counter therapytoaster/hiscore-<slug>
   ("test-hiscore-<slug>" when the tag has data-prefix="test-"). Games write it themselves through
   tt-live/arcade/hs-report-v1.js; this script only reads, plus it watches Toaster Tanks (same-origin
   /toaster-tanks frame in the player) and submits the higher player score at GAME OVER.
   Games with no score (Stickdeath reel, CyberToaster Kart race) show HIGH SCORE "—".
   When a game frame posts {tt:"hiscore"} the badge refreshes and glitches. Abacus down = badge hidden.
*/
(function(){
  if (window.__ttHighScore) return;
  window.__ttHighScore = 1;

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

  /* no score to keep: show a dash */
  var NONE = { stickdeath: 1, kart: 1 };

  var CFG = {
    base: "https://abacus.jasoncameron.dev",
    ns: "therapytoaster",
    keyHead: "hiscore-",
    minDigits: 4,
    timeoutMs: 12000,
    skipAutomation: true
  };

  var me = document.currentScript;
  var prefix = "";
  try {
    if (window.__ttHighScorePrefix != null) prefix = String(window.__ttHighScorePrefix);
    else if (me && me.getAttribute("data-prefix")) prefix = me.getAttribute("data-prefix");
  } catch(e) {}
  var testMode = !!prefix;

  function injectStyle(){
    if (document.getElementById("tt-hs-css")) return;
    var st = document.createElement("style");
    st.id = "tt-hs-css";
    st.textContent =
      "#tt-arc .tt-hs{display:none;box-sizing:border-box;width:100%;margin:12px 0 0;padding:0;background:transparent;text-align:left;"+
        "font-family:\"Courier New\",Courier,monospace;color:#FFD400;line-height:1;position:relative;z-index:2;pointer-events:none}"+
      "#tt-arc .tt-hs.tt-hs-on{display:block}"+
      "#tt-arc .tt-hs *{box-sizing:border-box}"+
      "#tt-arc .tt-hs-dash{display:inline-block;min-width:22px;padding:0 6px;font-size:13px;font-weight:700;line-height:18px;text-align:center;background:#000;border:1px solid #3a3215;color:#FFD400}"+
      "#tt-arc .ta-cab .tt-hs-dash{font-size:10px;line-height:13px;min-width:18px;padding:0 4px}"+
      "#tt-arc .tt-hs-in{display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:6px 8px;"+
        "padding:5px 8px;border:1px solid rgba(255,212,0,.45);background:linear-gradient(#0a0e1a,#05070d);"+
        "box-shadow:0 0 0 1px #000,0 0 10px rgba(255,212,0,.12),inset 0 0 10px rgba(0,0,0,.8);max-width:100%}"+
      "#tt-arc .tt-hs-grp{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}"+
      "#tt-arc .tt-hs-lbl{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;"+
        "text-shadow:-1px 0 rgba(255,40,60,.85),1px 0 rgba(0,220,255,.7)}"+
      "#tt-arc .tt-hs-odo{display:inline-flex;gap:1px;padding:2px;background:#000;border:1px solid #2a2410}"+
      "#tt-arc .tt-hs-d{position:relative;display:inline-block;width:13px;height:18px;overflow:hidden;"+
        "background:linear-gradient(#000 0%,#15130a 48%,#000 50%,#15130a 52%,#000 100%);"+
        "border:1px solid #3a3215;border-radius:2px}"+
      "#tt-arc .tt-hs-d::after{content:\"\";position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(0,0,0,.85)}"+
      "#tt-arc .tt-hs-strip{display:block;transform:translateY(0);transition:transform 1.1s cubic-bezier(.2,.8,.2,1)}"+
      "#tt-arc .tt-hs-strip span{display:block;height:16px;line-height:16px;font-size:13px;font-weight:700;text-align:center;"+
        "color:#FFD400;text-shadow:-1px 0 rgba(255,40,60,.75),1px 0 rgba(0,220,255,.6),0 0 6px rgba(255,212,0,.45)}"+
      "#tt-arc .tt-hs.tt-hs-glitch .tt-hs-in{animation:tt-hs-gl .22s steps(2,end) 1}"+
      "@keyframes tt-hs-gl{0%{transform:translate(0)}25%{transform:translate(-2px,0) skewX(-5deg)}"+
        "50%{transform:translate(2px,-1px)}75%{transform:translate(-1px,1px) skewX(4deg)}100%{transform:translate(0)}}"+
      "#tt-arc .tt-hs-sk{position:relative;display:inline-block;width:32px;height:34px;flex:0 0 auto;"+
        "animation:tt-hs-bob 2.8s ease-in-out infinite}"+
      "#tt-arc .tt-hs-sk-j{position:relative;display:block;width:100%;height:100%}"+
      "#tt-arc .tt-hs-sk img{display:block;width:100%;height:100%;object-fit:contain;position:relative;z-index:2;pointer-events:none}"+
      "#tt-arc .tt-hs-sk-j::before,#tt-arc .tt-hs-sk-j::after{"+
        "content:\"\";position:absolute;inset:0;z-index:3;pointer-events:none;opacity:0;"+
        "-webkit-mask-image:var(--tt-hs-sk);mask-image:var(--tt-hs-sk);"+
        "-webkit-mask-size:contain;mask-size:contain;"+
        "-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;"+
        "-webkit-mask-position:center;mask-position:center}"+
      "#tt-arc .tt-hs-sk-j::before{background:#ff0030}"+
      "#tt-arc .tt-hs-sk-j::after{background:#00e8ff}"+
      "#tt-arc .tt-hs-sl{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;"+
        "background-image:var(--tt-hs-sk);background-repeat:no-repeat;background-position:center;background-size:contain}"+
      "#tt-arc .tt-hs-sl1{clip-path:inset(0 0 68% 0)}"+
      "#tt-arc .tt-hs-sl2{clip-path:inset(32% 0 32% 0)}"+
      "#tt-arc .tt-hs-sl3{clip-path:inset(68% 0 0 0)}"+
      "#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sl1{opacity:1;animation:tt-hs-sl-a .28s steps(2,end) 2}"+
      "#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sl2{opacity:1;animation:tt-hs-sl-b .28s steps(2,end) 2}"+
      "#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sl3{opacity:1;animation:tt-hs-sl-c .28s steps(2,end) 2}"+
      "@keyframes tt-hs-sl-a{0%,100%{transform:translate(0,0)}25%{transform:translate(-5px,0)}50%{transform:translate(4px,0)}75%{transform:translate(-3px,1px)}}"+
      "@keyframes tt-hs-sl-b{0%,100%{transform:translate(0,0)}25%{transform:translate(5px,0)}50%{transform:translate(-6px,0)}75%{transform:translate(2px,-1px)}}"+
      "@keyframes tt-hs-sl-c{0%,100%{transform:translate(0,0)}25%{transform:translate(-4px,0)}50%{transform:translate(5px,1px)}75%{transform:translate(-3px,0)}}"+
      "#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sk-j{animation:tt-hs-jerk .24s steps(2,end) 1}"+
      "#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sk-j::before{animation:tt-hs-rgb-burst-r .28s steps(2,end) 2}"+
      "#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sk-j::after{animation:tt-hs-rgb-burst-c .28s steps(2,end) 2}"+
      "@keyframes tt-hs-rgb-burst-r{0%,100%{opacity:.25;transform:translate(-2px,0)}25%{opacity:.95;transform:translate(-5px,1px)}50%{opacity:.8;transform:translate(4px,-1px)}75%{opacity:.9;transform:translate(-4px,0)}}"+
      "@keyframes tt-hs-rgb-burst-c{0%,100%{opacity:.25;transform:translate(2px,0)}25%{opacity:.95;transform:translate(5px,-1px)}50%{opacity:.8;transform:translate(-4px,1px)}75%{opacity:.9;transform:translate(4px,0)}}"+
      "@keyframes tt-hs-jerk{0%{transform:translate(0,0) skewX(0)}20%{transform:translate(-4px,1px) skewX(-9deg)}50%{transform:translate(5px,-1px) skewX(7deg)}75%{transform:translate(-2px,1px) skewX(-4deg)}100%{transform:translate(0,0) skewX(0)}}"+
      "@keyframes tt-hs-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(2px)}}"+
      /* cabinets are tight: shrink the same chrome so 4 digits still fit, pin to the bottom of the cell */
      "#tt-arc .ta-cab:has(.tt-hs){padding-bottom:14px}"+
      "#tt-arc .ta-cab .tt-hs{margin:8px 0 0;text-align:center;margin-top:auto;padding-top:8px}"+
      "#tt-arc .ta-cab .tt-hs-in{justify-content:center;gap:4px 5px;padding:3px 5px}"+
      "#tt-arc .ta-cab .tt-hs-grp{gap:4px}"+
      "#tt-arc .ta-cab .tt-hs-lbl{font-size:7px;letter-spacing:.12em}"+
      "#tt-arc .ta-cab .tt-hs-odo{gap:1px;padding:1px}"+
      "#tt-arc .ta-cab .tt-hs-d{width:9px;height:13px;border-radius:1px}"+
      "#tt-arc .ta-cab .tt-hs-strip span{height:11px;line-height:11px;font-size:9px}"+
      "#tt-arc .ta-cab .tt-hs-sk{width:20px;height:21px}"+
      "#tt-arc .ta-cab.ta-on .tt-hs-in{box-shadow:0 0 0 1px #000,0 0 8px rgba(0,0,0,.35),inset 0 0 8px rgba(0,0,0,.8)}"+
      "@media (max-width:640px){"+
        "#tt-arc .tt-hs{margin-top:10px;text-align:center}"+
        "#tt-arc .tt-hs-in{justify-content:center}"+
        "#tt-arc .tt-ns .tt-hs-d{width:11px;height:16px}"+
        "#tt-arc .tt-ns .tt-hs-strip span{height:14px;line-height:14px;font-size:11px}"+
        "#tt-arc .tt-ns .tt-hs-sk{width:24px;height:26px}"+
        "#tt-arc .tt-ns .tt-hs-lbl{font-size:8px}"+
      "}"+
      "@media (prefers-reduced-motion:reduce){"+
        "#tt-arc .tt-hs-strip{transition:none}"+
        "#tt-arc .tt-hs.tt-hs-glitch .tt-hs-in{animation:none}"+
        "#tt-arc .tt-hs-sk,#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sk-j,"+
        "#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sl1,#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sl2,#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sl3{animation:none}"+
        "#tt-arc .tt-hs-sk-j::before,#tt-arc .tt-hs-sk-j::after{animation:none;opacity:0}"+
        "#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sl1,#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sl2,#tt-arc .tt-hs.tt-hs-glitch .tt-hs-sl3{opacity:0}"+
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
      return delay(800).then(function(){ return req("get", key); });
    }).catch(function(){
      return delay(2500).then(function(){ return req("get", key); });
    });
  }

  function digits(n){
    var s = String(Math.max(0, Math.floor(n)));
    while (s.length < CFG.minDigits) s = "0" + s;
    return s;
  }
  function odoHtml(n){
    var s = digits(n), h = '<span class="tt-hs-odo" aria-hidden="true">';
    for (var i = 0; i < s.length; i++) {
      h += '<span class="tt-hs-d"><span class="tt-hs-strip" data-d="' + s.charAt(i) + '">';
      for (var k = 0; k <= 9; k++) h += "<span>" + k + "</span>";
      h += "</span></span>";
    }
    return h + "</span>";
  }
  function cellH(box){
    var strip = box.querySelector(".tt-hs-strip");
    var span = strip && strip.firstChild;
    return (span && span.offsetHeight) || 15;
  }
  function roll(box){
    var strips = box.querySelectorAll(".tt-hs-strip");
    var h = cellH(box);
    for (var i = 0; i < strips.length; i++)
      strips[i].style.transform = "translateY(-" + (parseInt(strips[i].getAttribute("data-d"), 10) * h) + "px)";
  }
  function paint(box, n){
    box.setAttribute("aria-label", "High score: " + n);
    box.setAttribute("data-count", String(n));
    var s = digits(n);
    var strips = box.querySelectorAll(".tt-hs-strip");
    if (strips.length !== s.length) {
      var odoEl = box.querySelector(".tt-hs-odo");
      if (odoEl) odoEl.outerHTML = odoHtml(n);
    } else {
      for (var i = 0; i < strips.length; i++) strips[i].setAttribute("data-d", s.charAt(i));
    }
    roll(box);
  }

  function buildBadge(n){
    var box = document.createElement("span");
    box.className = "tt-hs";
    box.setAttribute("role", "status");
    box.setAttribute("aria-label", "High score: " + n);
    box.style.setProperty("--tt-hs-sk", "url('" + SK2 + "')");
    box.innerHTML = '<span class="tt-hs-in">' +
      '<span class="tt-hs-sk" aria-hidden="true"><span class="tt-hs-sk-j">' +
        '<span class="tt-hs-sl tt-hs-sl1"></span><span class="tt-hs-sl tt-hs-sl2"></span><span class="tt-hs-sl tt-hs-sl3"></span>' +
        '<img alt="" width="122" height="128" src="' + SK1 + '" srcset="' + SK1 + ' 122w, ' + SK2 + ' 244w" sizes="28px">' +
      '</span></span>' +
      '<span class="tt-hs-grp"><span class="tt-hs-lbl">High score</span>' + odoHtml(n) + "</span></span>";
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
        box.classList.remove("tt-hs-glitch");
        void box.offsetWidth;
        box.classList.add("tt-hs-on", "tt-hs-glitch");
      }
      setTimeout(function(){ box.classList.remove("tt-hs-glitch"); box.classList.add("tt-hs-on"); }, 320);
    }, offset);
    var t2 = setInterval(function(){
      if (!document.body.contains(box)) { clearInterval(t2); return; }
      if (document.hidden) return;
      box.classList.remove("tt-hs-glitch");
      void box.offsetWidth;
      box.classList.add("tt-hs-on", "tt-hs-glitch");
      setTimeout(function(){ if (document.body.contains(box)) { box.classList.remove("tt-hs-glitch"); box.classList.add("tt-hs-on"); } }, 320);
    }, 3200 + Math.floor(Math.random() * 1600));
    glitchTimers.push(t1, t2);
  }

  function show(box, n){
    paint(box, n);
    box.classList.add("tt-hs-on");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { roll(box); return; }
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ roll(box); }); });
  }

  function hide(box){
    try {
      box.classList.remove("tt-hs-on", "tt-hs-glitch");
      if (box.parentNode) box.parentNode.removeChild(box);
    } catch(e) {}
  }

  var pending = {};
  var values = {};

  function attach(card){
    try {
      if (!card || card.querySelector(":scope > .tt-hs, .tt-hs")) return;
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
      if (NONE[slug]) {
        var odo = box.querySelector(".tt-hs-odo");
        if (odo) odo.outerHTML = '<span class="tt-hs-dash" aria-hidden="true">&mdash;</span>';
        box.setAttribute("aria-label", "High score: none for this game");
        box.classList.add("tt-hs-on");
        armGlitch(box);
        return;
      }
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





  function boxFor(slug){
    var root = document.getElementById("tt-arc");
    return root ? root.querySelector('.tt-hs[data-slug="' + slug + '"]') : null;
  }
  function bump(slug, v, glitch){
    if (NONE[slug]) return;
    v = Math.floor(Number(v));
    if (!isFinite(v) || v < 0) return;
    if (values[slug] != null && v <= values[slug]) return;
    values[slug] = v;
    var box = boxFor(slug);
    if (!box) return;
    show(box, v);
    if (glitch) {
      box.classList.remove("tt-hs-glitch"); void box.offsetWidth; box.classList.add("tt-hs-glitch");
      setTimeout(function(){ box.classList.remove("tt-hs-glitch"); }, 360);
    }
  }
  function refresh(slug){
    if (NONE[slug] || pending[slug]) return;
    pending[slug] = true;
    getCount(keyFor(slug)).then(function(v){ pending[slug] = false; bump(slug, v, true); }, function(){ pending[slug] = false; });
  }

  /* game frames (therapytoaster.github.io) post {tt:"hiscore", slug, score} after a write */
  function onMsg(e){
    try {
      var o = e.origin || "";
      if (o !== "https://therapytoaster.github.io" && o !== location.origin) return;
      var d = e.data;
      if (!d || d.tt !== "hiscore" || typeof d.slug !== "string") return;
      var slug = d.slug.replace(/[^a-z0-9-]/g, "").slice(0, 40);
      if (!slug) return;
      if (typeof d.score === "number") bump(slug, d.score, true);
      setTimeout(function(){ refresh(slug); }, 1200);
    } catch(err) {}
  }

  /* Toaster Tanks: same-origin /toaster-tanks page inside the player frame. At GAME OVER its status
     line reads "<name> wins! Press New Game to play again." (or "Draw! ..."): submit the higher score. */
  var TANKS_TOK = testMode ? "71d9f17f-1346-4614-a2f0-b49fe949b1fb" : "801b262a-c503-41be-9ad0-d3392b6e99da";
  var tanksDone = "";
  function setRecord(slug, score){
    var key = keyFor(slug);
    return getCount(key).then(function(cur){
      if (score <= cur) return cur;
      var url = CFG.base + "/set/" + CFG.ns + "/" + key + "?value=" + score + "&token=" + encodeURIComponent(TANKS_TOK);
      return fetch(url, { method: "POST", mode: "cors", cache: "no-store", credentials: "omit" })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .then(function(j){ return (j && typeof j.value === "number") ? j.value : score; });
    });
  }
  function watchTanks(){
    try {
      var fr = document.querySelectorAll("#tt-arc .ta-stage iframe");
      for (var i = 0; i < fr.length; i++) {
        if (!/toaster-tanks/.test(fr[i].getAttribute("src") || "")) continue;
        var doc = null;
        try { doc = fr[i].contentDocument; } catch(e) { doc = null; }
        if (!doc) continue;
        var st = doc.querySelector("#toaster-tanks .tt-status");
        var txt = st ? (st.textContent || "") : "";
        if (!/Press New Game to play again/i.test(txt)) { tanksDone = ""; continue; }
        var sc = doc.querySelectorAll("#toaster-tanks .tt-sc"), top = 0, sig = txt;
        for (var k = 0; k < sc.length; k++) {
          var m = /Score\s+(\d+)/.exec(sc[k].textContent || "");
          if (m) { top = Math.max(top, parseInt(m[1], 10)); sig += "|" + m[1]; }
        }
        if (sig === tanksDone) continue;
        tanksDone = sig;
        if (top > 0 && top < 100000) setRecord("tanks", top).then(function(v){ bump("tanks", v, true); }, function(){});
      }
    } catch(e) {}
  }

  function start(){
    injectStyle();
    scan();
    if (!window.__ttHighScoreMsg) {
      window.__ttHighScoreMsg = 1;
      window.addEventListener("message", onMsg);
      setInterval(watchTanks, 1000);
    }
    if (!window.__ttHighScoreMo) {
      window.__ttHighScoreMo = 1;
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
