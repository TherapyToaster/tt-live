/*! tt-home-tiles v2 for therapytoaster.com Home.
   v2 adds DESKTOP (>=1024px): the 8 tiles hang as individual neon signs in the open side gutters beside
   sections (measured at runtime, hidden when they do not fit). Phones/tablets (<1024px) are unchanged from v1.
   --- v1 notes (phones/tablets, <1024px) ---
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


  var DCSS =
    '#tt-tiles.tt-desk{z-index:4}' +
    '#tt-tiles.tt-desk .tt-tile{border-radius:.4em;font-family:Anton,Impact,"Arial Narrow Bold",sans-serif;line-height:1.05;text-align:center}' +
    '#tt-tiles.tt-desk .tt-sw{position:absolute;inset:0;display:block;transform-origin:50% -1.3em;pointer-events:none}' +
    '#tt-tiles.tt-desk.on .tt-sw{animation:ttSway 6s ease-in-out infinite;animation-delay:var(--d,0s)}' +
    '@keyframes ttSway{0%,100%{transform:rotate(-1.3deg)}50%{transform:rotate(1.3deg)}}' +
    '#tt-tiles.tt-desk .tt-wire{position:absolute;top:-1.3em;height:1.3em;width:0;border-left:2px solid #55555e;pointer-events:none}' +
    '#tt-tiles.tt-desk .tt-wire.l{left:20%}#tt-tiles.tt-desk .tt-wire.r{right:20%}' +
    '#tt-tiles.tt-desk .tt-wire:before{content:"";position:absolute;left:-.32em;top:-.12em;width:.46em;height:.46em;border-radius:50%;background:#FFD400;box-shadow:0 0 .5em #FFD400}' +
    '#tt-tiles.tt-desk .tt-face{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;border-radius:.4em;overflow:hidden;background:linear-gradient(180deg,rgba(14,14,20,.94),rgba(4,4,7,.96));box-shadow:0 .5em 1.2em rgba(0,0,0,.65),inset 0 0 1em rgba(0,0,0,.8);transition:filter .18s,transform .18s}' +
    '#tt-tiles.tt-desk .tt-face:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 3px);pointer-events:none}' +
    '#tt-tiles.tt-desk .tt-face.cau{border:.3em solid transparent;background:linear-gradient(180deg,#0b0b10,#050507) padding-box,repeating-linear-gradient(-45deg,#FFD400 0 .55em,#000 .55em 1.1em) border-box}' +
    '#tt-tiles.tt-desk .tt-face.cyb{border:2px solid #00E5FF;box-shadow:0 .5em 1.2em rgba(0,0,0,.65),0 0 .9em rgba(0,229,255,.55),inset 0 0 .9em rgba(0,229,255,.25)}' +
    '#tt-tiles.tt-desk .tt-face.rdb{border:2px solid #ff4632;box-shadow:0 .5em 1.2em rgba(0,0,0,.65),0 0 .9em rgba(255,70,50,.5),inset 0 0 .9em rgba(255,70,50,.25)}' +
    '#tt-tiles.tt-desk .tt-face.yeb{border:2px solid #FFD400;box-shadow:0 .5em 1.2em rgba(0,0,0,.65),0 0 .9em rgba(255,212,0,.5),inset 0 0 .9em rgba(255,212,0,.22)}' +
    '#tt-tiles.tt-desk .tt-face img{display:block;width:92%;height:auto;max-height:92%;object-fit:contain;filter:drop-shadow(2px 0 0 rgba(255,40,60,.55)) drop-shadow(-2px 0 0 rgba(0,229,255,.45))}' +
    '#tt-tiles.tt-desk .tt-t{display:block;font-weight:400;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;color:#FFD400;text-shadow:0 0 .12em #FFD400,0 0 .5em rgba(255,212,0,.85),0 0 1em rgba(255,212,0,.45),.09em 0 0 rgba(255,40,60,.5)}' +
    '#tt-tiles.tt-desk .tt-t.sm{font-size:.82em;letter-spacing:.14em}#tt-tiles.tt-desk .tt-t.md{font-size:1.18em}#tt-tiles.tt-desk .tt-t.lg{font-size:1.45em}#tt-tiles.tt-desk .tt-t.xl{font-size:1.9em}' +
    '#tt-tiles.tt-desk .tt-t.cy{color:#c9ffff;text-shadow:0 0 .12em #fff,0 0 .5em rgba(0,229,255,.95),0 0 1em rgba(0,229,255,.55),.09em 0 0 rgba(255,40,60,.4)}' +
    '#tt-tiles.tt-desk .tt-t.rd{color:#ffb7a8;text-shadow:0 0 .12em #fff,0 0 .5em rgba(255,70,50,.95),0 0 1em rgba(255,70,50,.55)}' +
    '#tt-tiles.tt-desk .tt-t.tw{text-transform:none;letter-spacing:.03em}' +
    '#tt-tiles.tt-desk .tt-t i{font-style:normal}' +
    '#tt-tiles.tt-desk .tt-svg{display:block;width:auto;height:62%;filter:drop-shadow(0 0 .35em rgba(255,212,0,.9))}' +
    '#tt-tiles.tt-desk .tt-svg.sk{height:78%}' +
    '#tt-tiles.tt-desk .tt-tile:hover .tt-face{filter:brightness(1.3) saturate(1.2);transform:scale(1.04)}' +
    '#tt-tiles.tt-desk .tt-tile:hover .tt-rim:before{box-shadow:0 0 0 2px rgba(var(--c),.9),0 0 1.6em rgba(var(--c),.8),inset 0 0 1.2em rgba(var(--c),.4);animation:none}' +
    '#tt-tiles.tt-desk .tt-tile:active .tt-face{transform:scale(.97)}' +
    '#tt-tiles.tt-desk .tt-rim{border-radius:.4em}' +
    '#tt-tiles.tt-desk .tt-rim:before,#tt-tiles.tt-desk .tt-rim:after{border-radius:.4em}' +
    '#tt-tiles.tt-desk .tt-bub{font-size:14px;max-width:260px}' +
    '@media (prefers-reduced-motion:reduce){#tt-tiles.tt-desk .tt-sw{animation:none!important}#tt-tiles.tt-desk .tt-face{transition:none}}';


  /* ---------- bottom gap (>=768px): the Starship section keeps ~35 empty grid rows (11px gap each) ---------- */
  var BCSS =
    '@media (min-width:768px){' +
    'body.homepage .fe-6adc834996252a3a577d77d4{grid-template-rows:repeat(10,minmax(0,auto))!important}' +
    'body.homepage .fe-block-yui_3_17_2_1_1794554356092_3801{grid-area:10/2/11/6!important;align-self:start!important;height:0!important;min-height:0!important;overflow:visible!important;pointer-events:none!important}' +
    '}';

  function css() {
    if (D.getElementById('tt-tiles-css')) return;
    var s = D.createElement('style'); s.id = 'tt-tiles-css'; s.textContent = CSS + DCSS + BCSS;
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
    var host = layer.parentNode, pw = host ? host.clientWidth : 360;
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
  function shake(t) {
    var n = (layer && layer.classList.contains('tt-desk')) ? t : layer;
    if (!n) return;
    n.classList.add('tt-shake'); later(function () { n.classList.remove('tt-shake'); }, 520);
  }
  var busy = {};
  function lock(id, ms) { if (busy[id]) return false; busy[id] = 1; later(function () { busy[id] = 0; }, ms); return true; }

  var ACT = {
    logo: function (t) {
      if (!lock('logo', 1100)) return;
      SFX.zap();
      if (!reduced()) {
        var f = fx(t, 'fx-logo', '<img alt="" src="' + LOGO + '">', 1050);
        fx(t, 'fx-slices', '<i style="top:22%"></i><i style="top:48%"></i><i style="top:74%"></i>', 700);
        shake(t);
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
        shake(t);
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
    layer = null; tiles = {}; sig = ''; dsig = '';
  }
  function sync() {
    var pl = plaza();
    if (mqDesk.matches) { deskSync(); fixGap(); return; }
    if (!pl) { teardown(); fixGap(); return; }
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


  /* ---------- DESKTOP (>=1024px): signs hung in the open gutters ---------- */
  var DSZ = { logo: [188, 80], therapy: [168, 70], veteran: [190, 70], burnt: [170, 70], toasted: [112, 96], skull: [88, 88], twitter: [150, 58], artcade: [170, 58] };
  var ORDER = ['logo', 'therapy', 'veteran', 'burnt', 'toasted', 'skull', 'twitter', 'artcade'];
  var ANCH = { word: '#block-ce8c64bf8e02f0133163', crt: '#tt-crt', vcr: '#tt-vcr', ps: '#ttps', arcb: '#ttarcb', nt: '#ttnt', mb: '#ttmb-book', bk: '#ttbk-book', merch: '#ttmerch', art: '#tt-art', wall: '#ttwall', pw: '#ttpw-root', pop: '#ttpop-btn' };
  var PREF = {
    logo: ['word:L', 'word:R', 'crt:L'],
    therapy: ['word:R', 'crt:R', 'vcr:R'],
    veteran: ['vcr:L', 'crt:L', 'ps:L'],
    burnt: ['arcb:R', 'vcr:R', 'ps:R'],
    toasted: ['ps:L', 'arcb:L', 'ps:R'],
    skull: ['mb:R', 'bk:R', 'nt:R', 'merch:R', 'art:R'],
    twitter: ['nt:L', 'bk:L', 'mb:L', 'merch:L', 'art:L'],
    artcade: ['arcb:L', 'arcb:R', 'ps:R', 'ps:L']
  };
  var ANCH_ORDER = ['word', 'crt', 'vcr', 'ps', 'arcb', 'nt', 'mb', 'bk', 'merch', 'art', 'wall', 'pw', 'pop'];
  var GAP = 30, EDGE = 12, PADY = 14, MINS = 0.62, MAXS = 1.15;
  var dsig = '', dtimer = 0, dboxes = null;

  function dpage() { return D.getElementById('page'); }
  function docY() { return W.pageYOffset || D.documentElement.scrollTop || 0; }

  /* rectangles (document coords) of everything visible that must not be covered */
  function scanBoxes(root) {
    var vw = D.documentElement.clientWidth, sy = docY(), out = [];
    var all = root.getElementsByTagName('*');
    var rg = D.createRange();
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (layer && layer.contains(e)) continue;
      var tag = e.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'NOSCRIPT' || tag === 'SOURCE' || tag === 'PATH' || tag === 'DEFS' || tag === 'BR') continue;
      var r = e.getBoundingClientRect();
      if (r.width < 3 || r.height < 3) continue;
      var cs = W.getComputedStyle(e);
      if (cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) continue;
      var media = (tag === 'IMG' || tag === 'CANVAS' || tag === 'VIDEO' || tag === 'IFRAME' || tag === 'INPUT' || tag === 'BUTTON' || tag === 'SVG' || tag === 'TEXTAREA' || tag === 'SELECT');
      var hasBg = (cs.backgroundImage !== 'none') || (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') || (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') || (parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== 'none');
      if (media || hasBg) {
        if (!media && r.width >= vw * 0.97) { /* full-bleed band, not a card */ }
        else if (r.height < 4000) out.push([Math.max(0, r.left), r.top + sy, Math.min(vw, r.right), r.bottom + sy]);
      }
      /* text: use the real glyph extents, not the (often full-width) block box */
      for (var n = e.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3 && n.nodeValue.replace(/\s+/g, '').length) {
          try { rg.selectNodeContents(n); } catch (er) { continue; }
          var rects = rg.getClientRects();
          for (var k = 0; k < rects.length; k++) {
            var t = rects[k]; if (t.width < 2 || t.height < 2) continue;
            out.push([Math.max(0, t.left), t.top + sy, Math.min(vw, t.right), t.bottom + sy]);
          }
        }
      }
    }
    return out;
  }
  function anchorRect(key) {
    var e = D.querySelector(ANCH[key]); if (!e) return null;
    var r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 20) return null;
    var cs = W.getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return null;
    return { top: r.top + docY(), bottom: r.bottom + docY() };
  }
  function hits(a, b, pad) { return a[0] < b[2] + pad && a[2] > b[0] - pad && a[1] < b[3] + pad && a[3] > b[1] - pad; }

  function tryStation(id, st, boxes, placed, vw, minY, maxY) {
    var parts = st.split(':'), key = parts[0], side = parts[1];
    var ar = anchorRect(key); if (!ar) return null;
    var base = DSZ[id], mid = (ar.top + ar.bottom) / 2;
    var ys = [];
    for (var y = ar.top - 10; y <= ar.bottom - base[1] * MINS + 10; y += 14) ys.push(y);
    ys.sort(function (a, b) { return Math.abs(a + base[1] / 2 - mid) - Math.abs(b + base[1] / 2 - mid); });
    for (var yi = 0; yi < ys.length; yi++) {
      var y0 = Math.round(ys[yi]);
      if (y0 < minY) continue;
      /* extent of content in a band as tall as the sign */
      var lo = vw, hi = 0;
      var band = [0, y0 - PADY, vw, y0 + base[1] + PADY];
      for (var b = 0; b < boxes.length; b++) {
        var bx = boxes[b];
        if (bx[3] > band[1] && bx[1] < band[3]) { if (bx[0] < lo) lo = bx[0]; if (bx[2] > hi) hi = bx[2]; }
      }
      if (lo >= hi) continue; /* nothing to hang beside */
      var avail = side === 'L' ? lo - GAP - EDGE : vw - hi - GAP - EDGE;
      var sc = Math.min(MAXS, avail / base[0]);
      if (sc < MINS) continue;
      var w = Math.round(base[0] * sc), h = Math.round(base[1] * sc);
      if (y0 + h > maxY) continue;
      var x0 = side === 'L' ? Math.round(lo - GAP - w) : Math.round(hi + GAP);
      var rect = [x0, y0, x0 + w, y0 + h];
      /* wire + sway headroom above, a little glow room around */
      var ok = true;
      var chk = [rect[0] - 6, rect[1] - Math.round(1.4 * 16 * sc), rect[2] + 6, rect[3] + 6];
      for (var q = 0; q < boxes.length; q++) { if (hits(chk, boxes[q], 4)) { ok = false; break; } }
      if (!ok) continue;
      for (var p = 0; p < placed.length; p++) { if (hits(rect, placed[p].r, 18)) { ok = false; break; } }
      if (!ok) continue;
      return { id: id, st: st, r: rect, s: sc };
    }
    return null;
  }

  function placeAll(boxes, vw, docH) {
    var placed = [], used = {};
    var all = [];
    ANCH_ORDER.forEach(function (k) { all.push(k + ':L'); all.push(k + ':R'); });
    ORDER.forEach(function (id) {
      var tries = PREF[id].concat(all);
      for (var i = 0; i < tries.length; i++) {
        if (used[tries[i]] && i >= PREF[id].length) continue;
        var r = tryStation(id, tries[i], boxes, placed, vw, 1000, docH - 520);
        if (r) { placed.push(r); used[tries[i]] = 1; return; }
      }
    });
    return placed;
  }

  function dface(id) {
    var letters = function (txt) {
      var cols = ['#ffffff', '#00E5FF', '#FFD400', '#ff5aa0'], o = '';
      for (var i = 0; i < txt.length; i++) o += '<i style="color:' + cols[i % 4] + ';text-shadow:0 0 .12em currentColor,0 0 .5em currentColor,0 0 1em currentColor">' + txt.charAt(i) + '</i>';
      return o;
    };
    switch (id) {
      case 'logo': return '<span class="tt-face cau"><img alt="" src="' + LOGO + '"></span>';
      case 'therapy': return '<span class="tt-face cyb"><b class="tt-t lg">' + letters('THERAPY') + '</b><b class="tt-t lg">' + letters('TOASTER') + '</b></span>';
      case 'veteran': return '<span class="tt-face cau"><b class="tt-t sm">Proudly</b><b class="tt-t md">Veteran-Owned</b></span>';
      case 'burnt': return '<span class="tt-face cau"><b class="tt-t sm rd">Burnt</b><b class="tt-t lg">Offerings</b></span>';
      case 'toasted': return '<span class="tt-face yeb"><svg class="tt-svg" viewBox="0 0 64 44" fill="none" stroke="#FFD400" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="14" width="44" height="26" rx="6"/><path d="M14 14v-5h10v5M32 14v-5h10v5"/><path d="M50 22h7M57 22v8"/><path d="M14 26h28" opacity=".6"/></svg><b class="tt-t sm cy" style="margin-top:.2em">Toasted</b></span>';
      case 'skull': return '<span class="tt-face rdb"><svg class="tt-svg sk" viewBox="0 0 56 60" fill="none" stroke="#FFD400" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 28C10 12 18 5 28 5s18 7 18 23c0 6-2 9-6 12v8H16v-8c-4-3-6-6-6-12z"/><path d="M19 22l7 7M26 22l-7 7M30 22l7 7M37 22l-7 7"/><path d="M27 36l-2 4h6l-2-4M20 48v-6M28 48v-6M36 48v-6"/></svg></span>';
      case 'twitter': return '<span class="tt-face cyb"><b class="tt-t tw xl cy">Twitter</b></span>';
      case 'artcade': return '<span class="tt-face cyb"><b class="tt-t lg cy">ARTCADE</b></span>';
    }
    return '';
  }
  function makeDesk(id, ix) {
    var m = META[id]; if (!m) return null;
    var a = el(m.tag, 'tt-tile tt-d');
    a.setAttribute('data-id', id); a.setAttribute('data-c', m.c === 'cy' ? 'cy' : m.c === 'rd' ? 'rd' : 'ye');
    a.setAttribute('aria-label', m.label);
    a.style.setProperty('--d', (-(ix * 0.9)).toFixed(2) + 's');
    if (m.tag === 'a') {
      a.setAttribute('href', m.href);
      if (m.blank) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
    } else a.setAttribute('type', 'button');
    a.innerHTML = '<span class="tt-sw"><i class="tt-wire l"></i><i class="tt-wire r"></i>' + dface(id) + '<i class="tt-rim"></i>' + (SPR[id] || '') + '</span>';
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      if (m.tag === 'a' && !m.blank) e.preventDefault();
      try { ACT[id](a, e); } catch (err) {}
    });
    return a;
  }

  function deskSignature(page) {
    var parts = [D.documentElement.clientWidth, Math.round(D.documentElement.scrollHeight), Math.round(page.getBoundingClientRect().height)];
    for (var k in ANCH) { var r = anchorRect(k); parts.push(r ? Math.round(r.top) + ':' + Math.round(r.bottom) : '-'); }
    return parts.join('|');
  }
  function deskSync() {
    var page = dpage();
    if (!page) { teardown(); return; }
    if (layer && !layer.classList.contains('tt-desk')) teardown(); /* leftover phone layer */
    var s = deskSignature(page);
    if (layer && layer.parentNode === page && s === dsig) return;
    css();
    var created = false;
    if (!layer || layer.parentNode !== page) {
      teardown();
      layer = el('div'); layer.id = 'tt-tiles'; layer.className = 'tt-desk'; layer.setAttribute('role', 'group'); layer.setAttribute('aria-label', 'Mr. Toasty signs');
      page.appendChild(layer); created = true;
    }
    dsig = s;
    var vw = D.documentElement.clientWidth, docH = D.documentElement.scrollHeight;
    var boxes = scanBoxes(page);
    var placed = placeAll(boxes, vw, docH);
    var pr = page.getBoundingClientRect(), px = pr.left, py = pr.top + docY();
    var keep = {};
    placed.forEach(function (p) {
      var ix = ORDER.indexOf(p.id);
      var t = tiles[p.id];
      if (!t) { t = makeDesk(p.id, ix); if (!t) return; tiles[p.id] = t; layer.appendChild(t); }
      t.style.left = Math.round(p.r[0] - px) + 'px'; t.style.top = Math.round(p.r[1] - py) + 'px';
      t.style.width = (p.r[2] - p.r[0]) + 'px'; t.style.height = (p.r[3] - p.r[1]) + 'px';
      t.style.fontSize = (16 * p.s).toFixed(2) + 'px';
      t.setAttribute('data-st', p.st);
      keep[p.id] = 1;
    });
    Object.keys(tiles).forEach(function (k) { if (!keep[k]) { if (tiles[k].parentNode) tiles[k].parentNode.removeChild(tiles[k]); delete tiles[k]; } });
    layer.classList.toggle('on', !reduced());
    W.ttTilesDesk = placed.map(function (p) { return { id: p.id, st: p.st, x: p.r[0], y: p.r[1], w: p.r[2] - p.r[0], h: p.r[3] - p.r[1], s: +p.s.toFixed(2) }; });
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
