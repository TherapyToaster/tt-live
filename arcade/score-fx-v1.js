/* TT ARTcade score FX v1 — motion for the PLAYS and HIGH SCORE badges.
   One tag, appended after play-counter.js / card-clips-v1.js on the ARTcade Code block:
     <script src="https://therapytoaster.github.io/tt-live/arcade/score-fx-v1.js?c=SHA"></script>
   Presentation only: no network, no score writes, no click handling. It reads the data-count
   attribute that play-counter.js / high-score-v1.js already set and animates their own reels.
   - PLAYS: slot-reel spin when the number arrives, slow neon breathe, "+1 PLAY" pop when it goes up.
   - HIGH SCORE: crown, gold shimmer sweep, slot-reel count-up, "NEW HIGH SCORE!" burst + sparkles.
   Existing glitch flicker from the badge scripts is left as is. Respects prefers-reduced-motion.
   Safe to load twice. One debounced, filtered MutationObserver (data-count / new badges only). */
(function () {
  'use strict';
  if (window.__ttScoreFX) return;
  window.__ttScoreFX = 1;
  if (!window.WeakMap || !document.querySelectorAll) return;

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var states = new WeakMap();
  var queued = false;
  var CROWN = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 18'%3E%3Cpath d='M2 16h20l1-11-6 5-5-8-5 8-6-5z' fill='%23FFD400' stroke='%23000' stroke-width='1.4' stroke-linejoin='round'/%3E%3C/svg%3E";

  function reduced() { return !!mq.matches; }

  function injectStyle() {
    if (document.getElementById('tt-sfx-css')) return;
    var st = document.createElement('style');
    st.id = 'tt-sfx-css';
    st.textContent =
      '#tt-arc .tt-sfx .tt-pc-in,#tt-arc .tt-sfx .tt-hs-in{position:relative;animation:tt-sfx-breathe 4.6s ease-in-out infinite}' +
      '#tt-arc .tt-sfx.tt-pc-glitch .tt-pc-in{animation:tt-pc-gl .22s steps(2,end) 1,tt-sfx-breathe 4.6s ease-in-out infinite}' +
      '#tt-arc .tt-sfx.tt-hs-glitch .tt-hs-in{animation:tt-hs-gl .22s steps(2,end) 1,tt-sfx-breathe 4.6s ease-in-out infinite}' +
      /* gold shimmer sweep across the HIGH SCORE box */
      '#tt-arc .tt-sfx .tt-hs-in{animation-delay:-2.3s}' +
      '#tt-arc .tt-sfx .tt-hs-in::before{content:"";position:absolute;inset:0;z-index:6;pointer-events:none;mix-blend-mode:screen;' +
        'background:linear-gradient(105deg,transparent 35%,rgba(255,236,140,.42) 50%,transparent 65%) no-repeat;background-size:300% 100%;' +
        'background-position:100% 0;animation:tt-sfx-sweep 5.5s ease-in-out infinite}' +
      /* crown on the HIGH SCORE skull */
      '#tt-arc .tt-sfx .tt-hs-sk::after{content:"";position:absolute;z-index:7;right:-5px;top:-7px;width:15px;height:11px;pointer-events:none;' +
        'background:url("' + CROWN + '") center/contain no-repeat;filter:drop-shadow(0 0 3px rgba(255,212,0,.85));' +
        'transform:rotate(14deg);animation:tt-sfx-crown 2.8s ease-in-out infinite}' +
      '#tt-arc .ta-cab .tt-sfx .tt-hs-sk::after{width:10px;height:8px;right:-3px;top:-5px}' +
      /* pop label + sparkles */
      '#tt-arc .tt-sfx-fl{position:absolute;left:50%;top:-6px;z-index:9;pointer-events:none;opacity:0;white-space:nowrap;' +
        'transform:translate(-50%,0);font:700 11px/1 "Courier New",Courier,monospace;letter-spacing:.12em;color:#000;background:#FFD400;' +
        'padding:4px 7px;border:1px solid #000;box-shadow:0 0 0 1px #FFD400,0 0 14px rgba(255,212,0,.8);' +
        'text-shadow:none}' +
      '#tt-arc .tt-hs .tt-sfx-fl{background:#000;color:#FFD400;box-shadow:0 0 0 1px #FFD400,0 0 16px rgba(255,212,0,.85);' +
        'text-shadow:-1px 0 rgba(255,40,60,.85),1px 0 rgba(0,220,255,.7)}' +
      '#tt-arc .ta-cab .tt-sfx-fl{font-size:8px;letter-spacing:.06em;padding:3px 4px}' +
      '#tt-arc .tt-sfx-sp{position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;z-index:8;pointer-events:none;opacity:0;' +
        'background:#FFD400;transform:rotate(45deg);box-shadow:0 0 6px #FFD400}' +
      '#tt-arc .tt-sfx-sp:nth-child(odd){background:#fff6c2}' +
      '@keyframes tt-sfx-breathe{0%,100%{box-shadow:0 0 0 1px #000,0 0 8px rgba(255,212,0,.10),inset 0 0 10px rgba(0,0,0,.8);border-color:rgba(255,212,0,.40)}' +
        '50%{box-shadow:0 0 0 1px #000,0 0 16px rgba(255,212,0,.38),inset 0 0 12px rgba(255,212,0,.06);border-color:rgba(255,212,0,.85)}}' +
      '@keyframes tt-sfx-sweep{0%,55%{background-position:100% 0}85%,100%{background-position:0% 0}}' +
      '@keyframes tt-sfx-crown{0%,100%{transform:rotate(14deg) translateY(0)}50%{transform:rotate(8deg) translateY(-1.5px)}}' +
      '@media (prefers-reduced-motion:reduce){' +
        '#tt-arc .tt-sfx .tt-pc-in,#tt-arc .tt-sfx .tt-hs-in,#tt-arc .tt-sfx .tt-hs-in::before,#tt-arc .tt-sfx .tt-hs-sk::after{animation:none!important}' +
        '#tt-arc .tt-sfx .tt-hs-in::before{display:none}' +
        '#tt-arc .tt-sfx-fl,#tt-arc .tt-sfx-sp{display:none!important}' +
      '}';
    (document.head || document.documentElement).appendChild(st);
  }

  function isHigh(box) { return box.classList.contains('tt-hs'); }
  function isOn(box) { return box.classList.contains('tt-pc-on') || box.classList.contains('tt-hs-on'); }

  function stopAll(s) {
    for (var i = 0; i < s.anims.length; i++) { try { s.anims[i].cancel(); } catch (e) {} }
    s.anims = [];
  }
  function anim(s, el, frames, opts) {
    if (!el || !el.animate || reduced()) return null;
    try {
      var a = el.animate(frames, opts);
      s.anims.push(a);
      a.onfinish = function () {
        try { a.cancel(); } catch (e) {}
        var i = s.anims.indexOf(a); if (i >= 0) s.anims.splice(i, 1);
      };
      return a;
    } catch (e) { return null; }
  }
  function pad(n, len) { var t = String(n); while (t.length < len) t = '0' + t; return t; }

  /* slot-reel: each digit strip rolls forward (9 wraps to 0, like an odometer), staggered left to right.
     On the first value it spins one full extra turn. The reel's own inline transform stays the final state. */
  function spin(box, s, from, to) {
    var strips = box.querySelectorAll(isHigh(box) ? '.tt-hs-strip' : '.tt-pc-strip');
    if (!strips.length) return;
    var a = from == null ? null : pad(from, strips.length);
    var same = !!a && a.length === strips.length && pad(to, strips.length).length === strips.length;
    for (var i = 0; i < strips.length; i++) {
      var d = parseInt(strips[i].getAttribute('data-d'), 10);
      if (!(d >= 0)) continue;
      var p = same ? parseInt(a.charAt(i), 10) : 0;
      if (same && p === d) continue;
      var cell = strips[i].firstElementChild;
      var h = (cell && cell.offsetHeight) || 0;
      if (!h) continue;
      var turns = (from == null ? 1 : 0) + (d < p ? 1 : 0);
      var travel = turns * 10 + d - p;            /* cells travelled, counting a wrap as one cell */
      var pos = p, done = 0, fr = [{ transform: 'translateY(' + (-p * h) + 'px)', offset: 0 }];
      for (var t = 0; t < turns; t++) {
        done += 9 - pos;
        fr.push({ transform: 'translateY(' + (-9 * h) + 'px)', offset: done / travel });
        fr.push({ transform: 'translateY(' + h + 'px)', offset: done / travel });  /* snap above 0 */
        done += 1; pos = 0;
        fr.push({ transform: 'translateY(0px)', offset: done / travel });
      }
      fr.push({ transform: 'translateY(' + (-d * h) + 'px)', offset: 1 });
      anim(s, strips[i], fr, { duration: 750 + Math.min(travel, 20) * 45 + i * 130, easing: 'cubic-bezier(.3,.6,.25,1)' });
    }
  }

  function burst(box, s, from, to) {
    var high = isHigh(box);
    s.fl.textContent = high ? 'NEW HIGH SCORE!' : '+' + (to - from > 1 ? (to - from) : 1) + ' PLAY';
    anim(s, s.fl, [
      { opacity: 0, transform: 'translate(-50%,6px) scale(.6)' },
      { opacity: 1, transform: 'translate(-50%,-16px) scale(1.08)', offset: .18 },
      { opacity: 1, transform: 'translate(-50%,-20px) scale(1)', offset: .7 },
      { opacity: 0, transform: 'translate(-50%,-34px) scale(.95)' }
    ], { duration: high ? 2400 : 1500, easing: 'ease-out' });
    var inner = box.querySelector(high ? '.tt-hs-in' : '.tt-pc-in');
    anim(s, inner, [
      { transform: 'scale(1)', filter: 'brightness(1)' },
      { transform: 'scale(1.07)', filter: 'brightness(1.6)', offset: .25 },
      { transform: 'scale(.98)', filter: 'brightness(1.1)', offset: .55 },
      { transform: 'scale(1)', filter: 'brightness(1)' }
    ], { duration: high ? 700 : 520, easing: 'ease-out', iterations: high ? 2 : 1 });
    var sp = s.sp;
    for (var i = 0; i < sp.length; i++) {
      var ang = (i / sp.length) * Math.PI * 2 + (high ? 0.3 : 0);
      var r = (high ? 46 : 30) + (i % 2) * 10;
      var x = Math.round(Math.cos(ang) * r), y = Math.round(Math.sin(ang) * r * 0.55);
      anim(s, sp[i], [
        { opacity: 1, transform: 'translate(0,0) rotate(45deg) scale(1.2)' },
        { opacity: 0, transform: 'translate(' + x + 'px,' + y + 'px) rotate(225deg) scale(.3)' }
      ], { duration: 650 + (i % 3) * 120, easing: 'cubic-bezier(.1,.8,.3,1)', delay: high ? (i % 2) * 220 : 0 });
    }
  }

  function setup(box) {
    var s = { v: null, anims: [], fl: null, sp: [] };
    states.set(box, s);
    box.classList.add('tt-sfx');
    var host = box.querySelector('.tt-pc-in, .tt-hs-in') || box;
    var fl = document.createElement('span');
    fl.className = 'tt-sfx-fl';
    fl.setAttribute('aria-hidden', 'true');
    host.appendChild(fl);
    var n = isHigh(box) ? 10 : 6;
    for (var i = 0; i < n; i++) {
      var p = document.createElement('span');
      p.className = 'tt-sfx-sp';
      p.setAttribute('aria-hidden', 'true');
      host.appendChild(p);
      s.sp.push(p);
    }
    s.fl = fl;
    return s;
  }

  function update(box) {
    if (!isOn(box) || !box.hasAttribute('data-count')) return; /* hidden badge or "—" dash: nothing to animate */
    var v = parseInt(box.getAttribute('data-count'), 10);
    if (!(v >= 0)) return;
    var s = states.get(box) || setup(box);
    if (s.v === v) return;
    var from = s.v;
    s.v = v;
    if (reduced() || document.hidden) return;
    stopAll(s);
    spin(box, s, from, v);
    if (from != null && v > from) burst(box, s, from, v);
  }

  function scan() {
    queued = false;
    try {
      var root = document.getElementById('tt-arc');
      if (!root) return;
      var boxes = root.querySelectorAll('.tt-pc, .tt-hs');
      for (var i = 0; i < boxes.length; i++) update(boxes[i]);
    } catch (e) {}
  }
  function later() {
    if (queued) return;
    queued = true;
    setTimeout(function () { (window.requestAnimationFrame || setTimeout)(scan); }, 60);
  }

  function relevant(n) {
    if (!n || n.nodeType !== 1) return false;
    if (n.matches && n.matches('.tt-pc, .tt-hs, #tt-arc')) return true;
    return !!(n.querySelector && n.querySelector('.tt-pc, .tt-hs'));
  }

  function start() {
    injectStyle();
    scan();
    try {
      new MutationObserver(function (ms) {
        for (var i = 0; i < ms.length; i++) {
          var m = ms[i];
          if (m.type === 'attributes') {
            var t = m.target;
            if (t.classList && (t.classList.contains('tt-pc') || t.classList.contains('tt-hs'))) { later(); return; }
            continue;
          }
          for (var j = 0; j < m.addedNodes.length; j++) if (relevant(m.addedNodes[j])) { later(); return; }
        }
      }).observe(document.body || document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-count'] });
    } catch (e) {}
    try { window.addEventListener('mercury:load', later); } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
