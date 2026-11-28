/*! tt-home-tiles v1 for therapytoaster.com Home (phones/tablets, <1024px).
   1) Wordmark gap: the plaza (tile sign rail) used to start a few px above the bottom of the
      caution-striped "〽️®️ Ƭᴏᴀsᴛʏ🎭" frame and painted over its lower edge (clipping the R, M tail
      and masks). The plaza is pushed down by exactly the measured overlap (+6px). Desktop untouched.
   2) The eight neon tiles under the wordmark are painted on the skyline canvas (pointer-events:none),
      so they did nothing. This layer places real tap targets over them (positions come from
      ttHsDebug.signs()) and adds idle neon motion + a fun action per tile.
   prefers-reduced-motion: no idle motion, flat flashes only, navigation is immediate.
   No chat widgets. Visible text says "Twitter", never "X". */
(function (W, D) {
  'use strict';
  if (W.ttTilesRun) return;
  W.ttTilesRun = 1;

  var P = (location.pathname || '/').replace(/\/+$/, '');
  if (P !== '' && P !== '/home' && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

  var SRC = (D.currentScript && D.currentScript.src) || 'https://therapytoaster.github.io/tt-live/home-tiles/tiles.js';
  var LOGO;
  try { LOGO = new URL('../home-skyline/mr-toasty-neon-logo-official.png', SRC).href; }
  catch (e) { LOGO = 'https://therapytoaster.github.io/tt-live/home-skyline/mr-toasty-neon-logo-official.png'; }

  var BO_URL = (W.ttTilesBoUrl) || '/arcade#burnt-offerings';
  var ARC_URL = '/arcade';
  var TW_URL = 'https://x.com/TherapyToaster';

  var mqDesk = W.matchMedia('(min-width:1024px)');
  var mqRM = W.matchMedia('(prefers-reduced-motion: reduce)');
  function reduced() { return !!mqRM.matches; }

  /* ---------- CSS ---------- */
  var CSS =
    '#tt-hs-plaza{transition:none}' +
    '#tt-tiles{position:absolute;left:0;top:0;width:100%;height:0;z-index:5;pointer-events:none;-webkit-tap-highlight-color:transparent}' +
    '#tt-tiles .tt-tile{position:absolute;display:block;margin:0;padding:0;border:0;background:transparent;border-radius:4px;pointer-events:auto;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;outline:0;color:inherit;font:inherit;text-decoration:none}' +
    '#tt-tiles .tt-tile:focus-visible{outline:2px solid #FFD400;outline-offset:2px}' +
    '#tt-tiles .tt-rim{position:absolute;inset:0;border-radius:4px;overflow:hidden;pointer-events:none;--c:255,212,0}' +
    '#tt-tiles .tt-tile[data-c="cy"] .tt-rim{--c:0,229,255}' +
    '#tt-tiles .tt-tile[data-c="rd"] .tt-rim{--c:255,70,50}' +
    '#tt-tiles .tt-rim:before{content:"";position:absolute;inset:0;border-radius:4px;box-shadow:0 0 0 1px rgba(var(--c),.0),0 0 10px rgba(var(--c),.0),inset 0 0 10px rgba(var(--c),.0)}' +
    '#tt-tiles .tt-rim:after{content:"";position:absolute;top:-20%;bottom:-20%;left:-60%;width:40%;background:linear-gradient(100deg,transparent,rgba(var(--c),.0) 20%,rgba(255,255,255,.34) 50%,rgba(var(--c),.0) 80%,transparent);transform:translateX(0) skewX(-16deg);opacity:0}' +
    '#tt-tiles.on .tt-rim:before{animation:ttTilePulse 3.6s ease-in-out infinite;animation-delay:var(--d,0s)}' +
    '#tt-tiles.on .tt-tile[data-id="skull"] .tt-rim:before{animation:ttTileFlick 4.4s linear infinite;animation-delay:var(--d,0s)}' +
    '#tt-tiles.on .tt-rim:after{animation:ttTileSweep 7.5s ease-in-out infinite;animation-delay:var(--d,0s)}' +
    '@keyframes ttTilePulse{0%,100%{box-shadow:0 0 0 1px rgba(var(--c),.10),0 0 6px rgba(var(--c),.10),inset 0 0 8px rgba(var(--c),.06)}50%{box-shadow:0 0 0 1px rgba(var(--c),.55),0 0 16px rgba(var(--c),.45),inset 0 0 14px rgba(var(--c),.22)}}' +
    '@keyframes ttTileFlick{0%,100%{box-shadow:0 0 0 1px rgba(var(--c),.25),0 0 10px rgba(var(--c),.30)}6%{box-shadow:0 0 0 1px rgba(var(--c),.04),0 0 2px rgba(var(--c),.04)}8%{box-shadow:0 0 0 1px rgba(var(--c),.5),0 0 14px rgba(var(--c),.5)}12%{box-shadow:0 0 0 1px rgba(var(--c),.05),0 0 2px rgba(var(--c),.05)}15%{box-shadow:0 0 0 1px rgba(var(--c),.3),0 0 10px rgba(var(--c),.3)}62%{box-shadow:0 0 0 1px rgba(255,40,60,.5),0 0 14px rgba(255,40,60,.4)}64%{box-shadow:0 0 0 1px rgba(0,229,255,.5),0 0 14px rgba(0,229,255,.4)}66%{box-shadow:0 0 0 1px rgba(var(--c),.25),0 0 10px rgba(var(--c),.3)}}' +
    '@keyframes ttTileSweep{0%,78%{transform:translateX(0) skewX(-16deg);opacity:0}80%{opacity:1}96%{opacity:1}100%{transform:translateX(560%) skewX(-16deg);opacity:0}}' +
    /* idle sprites */
    '#tt-tiles .tt-sp{position:absolute;pointer-events:none;opacity:0;font-style:normal;line-height:1}' +
    '#tt-tiles.on .tt-wisp{left:50%;top:18%;width:5px;height:5px;margin-left:-9px;border-radius:50%;background:rgba(255,255,255,.55);filter:blur(1.5px);animation:ttWisp 3.2s ease-out infinite}' +
    '#tt-tiles.on .tt-wisp.b{margin-left:5px;animation-delay:1.4s}' +
    '@keyframes ttWisp{0%{opacity:0;transform:translateY(8px) scale(.6)}20%{opacity:.7}100%{opacity:0;transform:translateY(-16px) scale(1.8)}}' +
    '#tt-tiles.on .tt-ember{width:3px;height:3px;border-radius:50%;background:#ff7a1a;box-shadow:0 0 6px #ff4a1a;bottom:14%;animation:ttEmber 2.6s ease-out infinite}' +
    '#tt-tiles.on .tt-ember.e1{left:28%}#tt-tiles.on .tt-ember.e2{left:50%;animation-delay:.9s}#tt-tiles.on .tt-ember.e3{left:72%;animation-delay:1.7s}' +
    '@keyframes ttEmber{0%{opacity:0;transform:translateY(0)}15%{opacity:1}100%{opacity:0;transform:translateY(-26px) translateX(5px)}}' +
    '#tt-tiles.on .tt-star{color:#FFD400;font-size:9px;text-shadow:0 0 6px #FFD400;animation:ttStar 4s ease-in-out infinite}' +
    '#tt-tiles.on .tt-star.s1{left:6%;top:12%}#tt-tiles.on .tt-star.s2{right:6%;bottom:12%;animation-delay:2s}' +
    '@keyframes ttStar{0%,100%{opacity:0;transform:scale(.4) rotate(0)}50%{opacity:1;transform:scale(1.1) rotate(90deg)}}' +
    /* press feedback */
    '#tt-tiles .tt-tile:active .tt-rim:before{box-shadow:0 0 0 2px rgba(var(--c),.9),0 0 22px rgba(var(--c),.8),inset 0 0 18px rgba(var(--c),.45);animation:none}' +
    /* action layers */
    '#tt-tiles .tt-fx{position:absolute;pointer-events:none;z-index:2}' +
    '#tt-tiles .fx-logo{inset:3px;background:#07070b;display:flex;align-items:center;justify-content:center;border-radius:3px;animation:ttLogoSpin 1s cubic-bezier(.3,.1,.2,1) both}' +
    '#tt-tiles .fx-logo img{max-width:94%;max-height:92%;display:block;filter:drop-shadow(2px 0 0 rgba(255,40,60,.7)) drop-shadow(-2px 0 0 rgba(0,229,255,.7))}' +
    '@keyframes ttLogoSpin{0%{transform:perspective(420px) rotateY(0) scale(1);filter:none}30%{transform:perspective(420px) rotateY(300deg) scale(1.18);filter:hue-rotate(80deg) saturate(1.8)}60%{transform:perspective(420px) rotateY(560deg) scale(1.1);filter:hue-rotate(-60deg)}80%{transform:perspective(420px) rotateY(690deg) scale(1.04) translateX(3px);filter:none}86%{transform:perspective(420px) rotateY(720deg) translateX(-3px)}100%{transform:perspective(420px) rotateY(720deg) scale(1);opacity:1}}' +
    '#tt-tiles .fx-slices{inset:0;overflow:hidden;border-radius:4px}' +
    '#tt-tiles .fx-slices i{position:absolute;left:0;right:0;height:5px;background:rgba(255,40,60,.5);mix-blend-mode:screen;animation:ttSlice .5s steps(2) both}' +
    '#tt-tiles .fx-slices i:nth-child(2){background:rgba(0,229,255,.5);animation-delay:.05s}#tt-tiles .fx-slices i:nth-child(3){background:rgba(255,212,0,.5);animation-delay:.1s}' +
    '@keyframes ttSlice{0%{opacity:0;transform:translateX(-30px)}30%{opacity:1;transform:translateX(18px)}60%{opacity:1;transform:translateX(-12px)}100%{opacity:0;transform:translateX(0)}}' +
    '#tt-tiles .fx-flash{inset:0;border-radius:4px;animation:ttFlash .6s ease-out both}' +
    '@keyframes ttFlash{0%{box-shadow:inset 0 0 0 2px rgba(255,255,255,.9),inset 0 0 26px rgba(255,255,255,.7),0 0 26px rgba(255,212,0,.9);background:rgba(255,255,255,.18)}100%{box-shadow:inset 0 0 0 0 rgba(255,255,255,0),inset 0 0 0 rgba(255,255,255,0),0 0 0 rgba(255,212,0,0);background:rgba(255,255,255,0)}}' +
    '#tt-tiles .fx-flash.cy{animation-name:ttFlashC}#tt-tiles .fx-flash.rd{animation-name:ttFlashR}' +
    '@keyframes ttFlashC{0%{box-shadow:inset 0 0 0 2px rgba(180,255,255,.95),inset 0 0 26px rgba(0,229,255,.7),0 0 26px rgba(0,229,255,.9);background:rgba(0,229,255,.16)}100%{box-shadow:inset 0 0 0 0 transparent,0 0 0 transparent;background:transparent}}' +
    '@keyframes ttFlashR{0%{box-shadow:inset 0 0 0 2px rgba(255,200,180,.95),inset 0 0 26px rgba(255,70,50,.7),0 0 26px rgba(255,70,50,.9);background:rgba(255,70,50,.18)}100%{box-shadow:inset 0 0 0 0 transparent,0 0 0 transparent;background:transparent}}' +
    '#tt-tiles .fx-shim{inset:0;border-radius:4px;overflow:hidden}' +
    '#tt-tiles .fx-shim:before{content:"";position:absolute;top:-10%;bottom:-10%;left:-40%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,236,150,.85),transparent);transform:skewX(-18deg);animation:ttShim .9s ease-in-out 2 both}' +
    '@keyframes ttShim{0%{left:-40%}100%{left:120%}}' +
    '#tt-tiles .fx-emoji{font-size:28px;left:50%;top:50%;margin:-16px 0 0 -16px;width:32px;height:32px;text-align:center;line-height:32px;animation:ttEmoji 1.1s ease-out both;filter:drop-shadow(0 0 8px rgba(255,212,0,.9))}' +
    '@keyframes ttEmoji{0%{transform:translateY(8px) scale(.2) rotate(-20deg);opacity:0}25%{transform:translateY(-10px) scale(1.5) rotate(8deg);opacity:1}70%{transform:translateY(-14px) scale(1.2) rotate(-4deg);opacity:1}100%{transform:translateY(-34px) scale(1) rotate(0);opacity:0}}' +
    '#tt-tiles .fx-skull{font-size:34px;left:50%;top:50%;margin:-20px 0 0 -20px;width:40px;height:40px;line-height:40px;text-align:center;text-shadow:3px 0 rgba(255,40,60,.85),-3px 0 rgba(0,229,255,.85),0 0 14px rgba(255,212,0,.9);animation:ttSkull 1s cubic-bezier(.2,1.6,.4,1) both}' +
    '@keyframes ttSkull{0%{transform:scale(.2) rotate(0);opacity:0}18%{transform:scale(1.9) rotate(-12deg);opacity:1}30%{transform:scale(1.5) rotate(10deg)}42%{transform:scale(1.8) rotate(-8deg)}54%{transform:scale(1.5) rotate(7deg)}80%{transform:scale(1.6) rotate(0);opacity:1}100%{transform:scale(2.4) rotate(0);opacity:0}}' +
    '#tt-tiles .fx-toast{font-size:24px;left:50%;bottom:55%;margin-left:-14px;width:28px;height:28px;line-height:28px;text-align:center;animation:ttToast 1.05s cubic-bezier(.2,.8,.3,1) both;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6))}' +
    '#tt-tiles .fx-toast.burnt{filter:grayscale(1) brightness(.35) drop-shadow(0 0 5px rgba(255,90,20,.9))}' +
    '@keyframes ttToast{0%{transform:translateY(22px) rotate(0) scale(.7);opacity:0}12%{opacity:1}42%{transform:translateY(-62px) rotate(200deg) scale(1.35);opacity:1}72%{transform:translateY(-30px) rotate(330deg) scale(1.1);opacity:1}100%{transform:translateY(-4px) rotate(360deg) scale(.85);opacity:0}}' +
    '#tt-tiles .fx-puff{width:16px;height:16px;border-radius:50%;background:radial-gradient(circle,rgba(210,210,210,.85),rgba(90,90,90,.45) 60%,transparent 70%);filter:blur(2px);left:50%;bottom:30%;margin-left:-8px;animation:ttPuff 1s ease-out both;animation-delay:var(--pd,0s)}' +
    '@keyframes ttPuff{0%{transform:translate(0,0) scale(.4);opacity:0}20%{opacity:.95}100%{transform:translate(var(--px,0),-60px) scale(3.2);opacity:0}}' +
    '#tt-tiles .fx-coin{font-size:22px;left:50%;top:-6px;margin-left:-13px;width:26px;height:26px;line-height:26px;text-align:center;animation:ttCoin .6s ease-in both}' +
    '@keyframes ttCoin{0%{transform:translateY(-14px) rotateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(34px) rotateY(900deg);opacity:1}}' +
    /* bubbles */
    '#tt-tiles .tt-bub{position:absolute;max-width:230px;min-width:70px;padding:8px 11px;border-radius:10px;background:#0b0b0f;color:#FFD400;border:2px solid #FFD400;box-shadow:0 0 0 2px #000,0 0 18px rgba(255,212,0,.55),3px 0 0 rgba(255,40,60,.5),-3px 0 0 rgba(0,229,255,.4);font:700 13px/1.25 "Courier New",ui-monospace,monospace;letter-spacing:.2px;text-align:center;pointer-events:none;z-index:9;transform-origin:50% 100%;animation:ttBubIn .28s cubic-bezier(.2,1.5,.4,1) both}' +
    '#tt-tiles .tt-bub.cy{color:#9ff;border-color:#00E5FF;box-shadow:0 0 0 2px #000,0 0 18px rgba(0,229,255,.55),3px 0 0 rgba(255,40,60,.4)}' +
    '#tt-tiles .tt-bub.rd{color:#ffb199;border-color:#ff4632;box-shadow:0 0 0 2px #000,0 0 18px rgba(255,70,50,.55)}' +
    '#tt-tiles .tt-bub.out{animation:ttBubOut .35s ease-in both}' +
    '#tt-tiles .tt-bub:after{content:"";position:absolute;left:var(--ax,50%);width:10px;height:10px;margin-left:-5px;background:inherit;border:inherit;transform:rotate(45deg);box-shadow:none}' +
    '#tt-tiles .tt-bub.up:after{bottom:-7px;border-top:0;border-left:0}#tt-tiles .tt-bub.dn:after{top:-7px;border-bottom:0;border-right:0}' +
    '@keyframes ttBubIn{0%{opacity:0;transform:scale(.4) translateY(8px)}100%{opacity:1;transform:scale(1) translateY(0)}}' +
    '@keyframes ttBubOut{to{opacity:0;transform:translateY(-6px) scale(.9)}}' +
    '#tt-tiles .tt-bub.glitch{animation:ttBubIn .28s cubic-bezier(.2,1.5,.4,1) both,ttBubJit .5s steps(2) .1s 2}' +
    '@keyframes ttBubJit{0%{transform:translateX(-2px)}50%{transform:translateX(2px)}100%{transform:translateX(0)}}' +
    '#tt-tiles .tt-shake{animation:ttShake .5s steps(2) 1}' +
    '@keyframes ttShake{0%{transform:translate(-2px,1px)}25%{transform:translate(2px,-1px)}50%{transform:translate(-1px,-1px)}75%{transform:translate(1px,1px)}100%{transform:translate(0,0)}}' +
    /* wordmark: keep the R from touching the M tail on narrow phones */
    '@media (max-width:600px){h1[data-tt-gottem-box] .tt-gotr{margin-left:.05em;margin-right:.05em}}' +
    /* reduced motion: no idle motion, no big transforms */
    '@media (prefers-reduced-motion:reduce){#tt-tiles .tt-rim:before,#tt-tiles .tt-rim:after,#tt-tiles .tt-sp{animation:none!important}' +
    '#tt-tiles .fx-logo,#tt-tiles .fx-skull,#tt-tiles .fx-toast,#tt-tiles .fx-emoji,#tt-tiles .fx-puff,#tt-tiles .fx-coin,#tt-tiles .fx-shim:before,#tt-tiles .fx-slices i{animation:none!important;opacity:0!important}' +
    '#tt-tiles .tt-bub,#tt-tiles .tt-bub.glitch{animation:none!important}}';

  function css() {
    if (D.getElementById('tt-tiles-css')) return;
    var s = D.createElement('style'); s.id = 'tt-tiles-css'; s.textContent = CSS;
    (D.head || D.documentElement).appendChild(s);
  }

  /* ---------- tiny audio (only after a tap) ---------- */
  var ac = null;
  function audio() {
    try {
      if (!ac) { var A = W.AudioContext || W.webkitAudioContext; if (!A) return null; ac = new A(); }
      if (ac.state === 'suspended' && ac.resume) ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  function tone(f, t0, dur, type, vol, f2) {
    var a = audio(); if (!a) return;
    try {
      var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (t0 || 0);
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.03);
    } catch (e) {}
  }
  var SFX = {
    ding: function () { tone(1318, 0, 1.0, 'sine', 0.13); tone(2637, 0, 0.7, 'sine', 0.05); tone(1976, 0.02, 0.8, 'triangle', 0.04); },
    laugh: function () { for (var i = 0; i < 5; i++) tone(330 - i * 28, i * 0.11, 0.1, 'square', 0.06, 250 - i * 24); },
    zap: function () { tone(880, 0, 0.35, 'sawtooth', 0.05, 110); tone(220, 0.05, 0.3, 'square', 0.04, 1100); },
    coin: function () { tone(988, 0, 0.09, 'square', 0.06); tone(1319, 0.09, 0.32, 'square', 0.06); },
    whoosh: function () { tone(180, 0, 0.5, 'sawtooth', 0.035, 60); },
    chirp: function () { tone(1700, 0, 0.07, 'sine', 0.07); tone(2300, 0.08, 0.09, 'sine', 0.06); tone(1900, 0.18, 0.08, 'sine', 0.05); },
    pop: function () { tone(420, 0, 0.12, 'sine', 0.09, 160); },
    salute: function () { tone(523, 0, 0.16, 'triangle', 0.07); tone(659, 0.16, 0.16, 'triangle', 0.07); tone(784, 0.32, 0.4, 'triangle', 0.08); }
  };

  /* ---------- helpers ---------- */
  var layer = null, tiles = {}, sig = '', quipIx = -1;
  function plaza() { return D.getElementById('tt-hs-plaza'); }
  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function later(fn, ms) { return setTimeout(fn, ms); }
  function rm(node, ms) { later(function () { if (node && node.parentNode) node.parentNode.removeChild(node); }, ms); }
  function fx(tile, cls, html, ms, style) {
    var n = el('i', 'tt-fx ' + cls, html || '');
    if (style) n.setAttribute('style', style);
    tile.appendChild(n); rm(n, ms || 1000); return n;
  }

  var bubTimer = 0;
  function bubble(tile, text, kind, ms) {
    var old = layer.querySelectorAll('.tt-bub');
    for (var i = 0; i < old.length; i++) if (old[i].parentNode) old[i].parentNode.removeChild(old[i]);
    clearTimeout(bubTimer);
    var b = el('div', 'tt-bub glitch' + (kind ? ' ' + kind : ''));
    b.textContent = text;
    layer.appendChild(b);
    var pl = plaza(), pw = pl ? pl.clientWidth : 360;
    var tx = parseFloat(tile.style.left), ty = parseFloat(tile.style.top), tw = parseFloat(tile.style.width), th = parseFloat(tile.style.height);
    var bw = Math.min(b.offsetWidth, pw - 12), bh = b.offsetHeight;
    var cx = tx + tw / 2;
    var left = Math.max(6, Math.min(pw - bw - 6, cx - bw / 2));
    var below = ty < bh + 20; /* not enough room above (plaza clips at its top) */
    b.style.left = left + 'px';
    b.style.top = (below ? ty + th + 9 : ty - bh - 9) + 'px';
    b.style.setProperty('--ax', Math.max(14, Math.min(bw - 14, cx - left)) + 'px');
    b.classList.add(below ? 'dn' : 'up');
    if (reduced()) b.classList.remove('glitch');
    bubTimer = later(function () {
      b.classList.add('out'); rm(b, 380);
    }, ms || 3400);
  }

  var QUIPS = [
    "Today's prescription: one (1) crispy slice.",
    "I'm not burnt out. I'm lightly toasted.",
    "Breadwinner. Therapist. Fire hazard.",
    "Your crust issues are valid.",
    "Session's free. Toast is extra.",
    "Feelings are like bread. Better warm.",
    "Have you tried turning your feelings off and on again?",
    "Pop up. Cool down. Butter yourself.",
    "Set to medium-dark. Like my humor.",
    "Hot take: the toaster is always right.",
    "Breathe in. Pop. Breathe out.",
    "We don't judge. We just brown.",
    "Every crumb has a story.",
    "Stay golden. Avoid the smoke alarm."
  ];
  function quip() {
    var i; do { i = Math.floor(Math.random() * QUIPS.length); } while (i === quipIx && QUIPS.length > 1);
    quipIx = i; return QUIPS[i];
  }

  function nav(url, delay, blank) {
    if (blank) { try { W.open(url, '_blank', 'noopener'); } catch (e) { location.href = url; } return; }
    later(function () { location.assign(url); }, reduced() ? 120 : delay);
  }

  /* ---------- actions ---------- */
  var busy = {};
  function lock(id, ms) { if (busy[id]) return false; busy[id] = 1; later(function () { busy[id] = 0; }, ms); return true; }

  var ACT = {
    logo: function (t) {
      if (!lock('logo', 1100)) return;
      SFX.zap();
      if (!reduced()) {
        var f = fx(t, 'fx-logo', '<img alt="" src="' + LOGO + '">', 1050);
        fx(t, 'fx-slices', '<i style="top:22%"></i><i style="top:48%"></i><i style="top:74%"></i>', 700);
        layer.classList.add('tt-shake'); later(function () { layer.classList.remove('tt-shake'); }, 520);
      } else fx(t, 'fx-flash', '', 650);
    },
    therapy: function (t) {
      SFX.chirp();
      fx(t, 'fx-flash cy', '', 650);
      bubble(t, quip(), 'cy', 4200);
    },
    veteran: function (t) {
      if (!lock('veteran', 1900)) return;
      SFX.salute();
      if (!reduced()) { fx(t, 'fx-shim', '', 1900); fx(t, 'fx-emoji', '\uD83E\uDEE1', 1150); }
      else fx(t, 'fx-flash', '', 650);
      bubble(t, '\uD83E\uDEE1 Proudly Veteran-Owned', '', 3000);
    },
    burnt: function (t, e) {
      if (!lock('burnt', 1500)) return;
      SFX.whoosh();
      fx(t, 'fx-flash rd', '', 650);
      if (!reduced()) {
        var xs = [-16, -5, 6, 14, -10, 9];
        for (var i = 0; i < 6; i++) fx(t, 'fx-puff', '', 1300, '--pd:' + (i * 0.09).toFixed(2) + 's;--px:' + xs[i] + 'px;margin-left:' + (xs[i] * 0.7 - 8) + 'px');
      }
      bubble(t, '\uD83D\uDD25 Something\u2019s burning\u2026', 'rd', 1400);
      nav(BO_URL, 800);
    },
    toasted: function (t) {
      var n = 0;
      try { n = (parseInt(localStorage.getItem('tt-toasts') || '0', 10) || 0) + 1; localStorage.setItem('tt-toasts', String(n)); } catch (e) { n = (W.__ttToasts = (W.__ttToasts || 0) + 1); }
      var burnt = n % 7 === 0;
      SFX.ding();
      fx(t, 'fx-flash', '', 600);
      if (!reduced()) fx(t, 'fx-toast' + (burnt ? ' burnt' : ''), burnt ? '\uD83C\uDF5E' : '\uD83C\uDF5E', 1100);
      bubble(t, burnt ? 'DING! ...burnt. (#' + n + ')' : 'DING! Toast #' + n, burnt ? 'rd' : '', 1800);
    },
    skull: function (t) {
      if (!lock('skull', 1100)) return;
      SFX.laugh();
      if (!reduced()) {
        fx(t, 'fx-skull', '\uD83D\uDC80', 1050);
        fx(t, 'fx-slices', '<i style="top:15%"></i><i style="top:50%"></i><i style="top:80%"></i>', 700);
        layer.classList.add('tt-shake'); later(function () { layer.classList.remove('tt-shake'); }, 520);
      } else fx(t, 'fx-flash', '', 650);
      bubble(t, 'HA HA HA \uD83D\uDC80', '', 1700);
    },
    twitter: function (t, e) {
      SFX.chirp();
      fx(t, 'fx-flash cy', '', 650);
      bubble(t, 'Opening Twitter\u2026', 'cy', 1400);
      /* real <a target=_blank>: the browser opens it; nothing to do here */
    },
    artcade: function (t, e) {
      if (!lock('artcade', 1300)) return;
      SFX.coin();
      fx(t, 'fx-flash cy', '', 650);
      if (!reduced()) fx(t, 'fx-coin', '\uD83E\uDE99', 700);
      bubble(t, 'INSERT COIN', 'cy', 900);
      nav(ARC_URL, 650);
    }
  };

  var META = {
    logo:    { c: 'ye', label: 'Mr. Toasty logo: spin and glitch', tag: 'button' },
    therapy: { c: 'cy', label: 'Therapy Toaster: hear a toaster quip', tag: 'button' },
    veteran: { c: 'ye', label: 'Proudly Veteran-Owned', tag: 'button' },
    burnt:   { c: 'rd', label: 'Burnt Offerings: play the game', tag: 'a', href: BO_URL },
    toasted: { c: 'ye', label: 'Toasted: pop a toast', tag: 'button' },
    skull:   { c: 'ye', label: 'Skull: laugh', tag: 'button' },
    twitter: { c: 'cy', label: 'Twitter (opens in a new tab)', tag: 'a', href: TW_URL, blank: true },
    artcade: { c: 'cy', label: 'ARTcade', tag: 'a', href: ARC_URL }
  };

  var SPR = {
    toasted: '<i class="tt-sp tt-wisp"></i><i class="tt-sp tt-wisp b"></i>',
    burnt: '<i class="tt-sp tt-ember e1"></i><i class="tt-sp tt-ember e2"></i><i class="tt-sp tt-ember e3"></i>',
    veteran: '<i class="tt-sp tt-star s1">\u2605</i><i class="tt-sp tt-star s2">\u2605</i>'
  };

  function make(id, ix) {
    var m = META[id]; if (!m) return null;
    var a = el(m.tag, 'tt-tile');
    a.setAttribute('data-id', id); a.setAttribute('data-c', m.c === 'cy' ? 'cy' : m.c === 'rd' ? 'rd' : 'ye');
    a.setAttribute('aria-label', m.label);
    a.style.setProperty('--d', (-(ix * 0.7)).toFixed(2) + 's');
    if (m.tag === 'a') {
      a.setAttribute('href', m.href);
      if (m.blank) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
    } else a.setAttribute('type', 'button');
    a.innerHTML = '<i class="tt-rim"></i>' + (SPR[id] || '');
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      if (m.tag === 'a' && !m.blank) e.preventDefault(); /* animate, then navigate (nav() in the action) */
      try { ACT[id](a, e); } catch (err) {}
    });
    return a;
  }

  /* ---------- layer sync ---------- */
  function readSigns() {
    var d = W.ttHsDebug;
    if (!d || typeof d.signs !== 'function') return null;
    try { var l = d.signs(); return (l && l.length) ? l : null; } catch (e) { return null; }
  }
  function teardown() {
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    layer = null; tiles = {}; sig = '';
  }
  function sync() {
    var pl = plaza();
    if (mqDesk.matches || !pl) { teardown(); fixGap(); return; }
    var list = readSigns();
    if (!list) return;
    var pr = pl.getBoundingClientRect();
    var next = [];
    for (var i = 0; i < list.length; i++) {
      var b = list[i]; if (!b.page || !META[b.id]) continue;
      next.push({ id: b.id, l: Math.round(b.page.left - pr.left), t: Math.round(b.page.top - pr.top), w: Math.round(b.page.width), h: Math.round(b.page.height) });
    }
    if (!next.length) return;
    var s = next.map(function (n) { return [n.id, n.l, n.t, n.w, n.h].join(':'); }).join('|');
    if (layer && layer.parentNode === pl && s === sig) return;
    css();
    if (!layer || layer.parentNode !== pl) {
      teardown();
      layer = el('div'); layer.id = 'tt-tiles'; layer.setAttribute('role', 'group'); layer.setAttribute('aria-label', 'Mr. Toasty tiles');
      pl.appendChild(layer);
    }
    sig = s;
    var keep = {};
    next.forEach(function (n, ix) {
      var t = tiles[n.id];
      if (!t) { t = make(n.id, ix); if (!t) return; tiles[n.id] = t; layer.appendChild(t); }
      t.style.left = n.l + 'px'; t.style.top = n.t + 'px'; t.style.width = n.w + 'px'; t.style.height = n.h + 'px';
      keep[n.id] = 1;
    });
    Object.keys(tiles).forEach(function (k) { if (!keep[k]) { if (tiles[k].parentNode) tiles[k].parentNode.removeChild(tiles[k]); delete tiles[k]; } });
    layer.classList.toggle('on', !reduced());
  }

  /* ---------- wordmark gap ---------- */
  function wordmarkFrame() {
    var h = D.querySelector('h1[data-tt-gottem-box]') || D.querySelector('#block-ce8c64bf8e02f0133163 h1');
    if (!h) return null;
    return h.closest('.fe-block') || h.parentNode;
  }
  function fixGap() {
    var pl = plaza();
    if (!pl) return;
    if (mqDesk.matches) { if (pl.style.marginTop) pl.style.marginTop = ''; return; }
    var fe = wordmarkFrame(); if (!fe) return;
    var cur = parseFloat(pl.style.marginTop) || 0;
    var frameBottom = fe.getBoundingClientRect().bottom;
    var plazaTop = pl.getBoundingClientRect().top - cur;
    var need = Math.max(0, Math.ceil(frameBottom - plazaTop + 8));
    if (Math.abs(need - cur) >= 1) pl.style.marginTop = need + 'px';
  }

  /* ---------- boot ---------- */
  var tid = 0;
  function soon() { clearTimeout(tid); tid = later(function () { fixGap(); sync(); }, 260); }
  function init() {
    css();
    var tries = 0;
    var iv = setInterval(function () {
      tries++; fixGap(); sync();
      if (tries > 60) { clearInterval(iv); }
    }, 250);
    /* low-rate safety net: skyline rebuilds, font swaps, soft navigation */
    setInterval(function () { if (!D.hidden) { fixGap(); sync(); } }, 1800);
    W.addEventListener('resize', soon, { passive: true });
    W.addEventListener('orientationchange', soon, { passive: true });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(soon);
    W.addEventListener('load', soon);
    try { (mqRM.addEventListener ? mqRM.addEventListener('change', soon) : mqRM.addListener(soon)); } catch (e) {}
    W.ttTiles = { sync: sync, fixGap: fixGap };
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
