/*! tt-hero-fx v1 for therapytoaster.com Home hero.
    (1) neon flicker-on: CSS lives inline in MAIN (#tt-hero-fx-css), this file only adds nothing for it.
    (2) typewriter slogan line under the neon wall. (3) cursor spotlight replaces the wall mouse parallax. */
(function(){
  'use strict';
  if (window.ttHfxRun) return; window.ttHfxRun = 1;
  var P = (location.pathname || '/').replace(/\/+$/, '');
  if (P !== '' && P !== '/home') return;
  var D = document, H = D.documentElement;
  var mm = function(q){ return !!(window.matchMedia && matchMedia(q).matches); };
  var RM = mm('(prefers-reduced-motion: reduce)');
  var FINE = mm('(hover: hover) and (pointer: fine)');
  var SLOGAN = 'Art & a Toaster named Therapy. U.S Army Veteran and Father of 4. Married to my One of a Kind.';
  var t0 = Date.now();

  /* ---------- CSS ---------- */
  var css =
    '#tthf-slogan{position:absolute;left:0;right:0;z-index:1;margin:0;padding:0 14px;box-sizing:border-box;text-align:center;pointer-events:none;opacity:0;transition:opacity .4s}' +
    '#tthf-slogan.on{opacity:1}' +
    '#tthf-slogan .tthf-box{position:relative;display:inline-block;max-width:100%;padding:6px 14px 7px;background:rgba(0,0,0,.62);border-left:3px solid #FFD400;border-right:3px solid #FFD400;' +
      'font:700 clamp(11.5px,1.1vw,16px)/1.35 "Courier New",Courier,monospace;letter-spacing:.02em;color:#FFD400;text-align:left;white-space:pre-wrap;' +
      'text-shadow:0 0 8px rgba(255,212,0,.55),0 2px 0 #000}' +
    '#tthf-slogan .tthf-ghost{visibility:hidden}' +
    '#tthf-slogan .tthf-type{position:absolute;left:14px;right:14px;top:6px}' +
    '#tthf-slogan .tthf-type:after{content:"";display:inline-block;width:.55em;height:1.05em;margin-left:2px;vertical-align:-.15em;background:#FFD400;box-shadow:0 0 8px rgba(255,212,0,.8);animation:tthfBlink 1s steps(1) infinite}' +
    '@keyframes tthfBlink{0%,100%{opacity:1}50%{opacity:0}}' +
    '#tthf-spot{position:absolute;left:0;top:0;width:560px;height:560px;margin:-280px 0 0 -280px;border-radius:50%;pointer-events:none;opacity:0;transition:opacity .35s;will-change:transform,opacity;' +
      'mix-blend-mode:screen;background:radial-gradient(circle at 50% 50%,rgba(255,236,190,.6) 0,rgba(255,224,150,.36) 30%,rgba(255,212,0,.13) 55%,rgba(255,212,0,0) 72%)}' +
    '#tthf-spot.on{opacity:1}' +
    '@media (prefers-reduced-motion:reduce){#tthf-slogan{transition:none}#tthf-slogan .tthf-type:after{animation:none}}';
  var st = D.createElement('style'); st.id = 'tthf-css'; st.textContent = css; (D.head || H).appendChild(st);

  /* ---------- (3) kill the wall parallax cleanly ----------
     extras.js (pinned, untouched) sets style.translate / style.scale on '#tt-topwall .tw-img' on every mouse move / tilt.
     We shadow those two properties on that one element's inline style object so the writes are ignored.
     tt-neon-lock reads the same two properties, sees "no scale / no translate", and becomes a no-op. Nothing else
     (floating skulls, title, TV tilt) is changed. */
  var hooked = null;
  function hookWall(){
    var W = D.querySelector('#tt-topwall .tw-img');
    if (!W || W === hooked) return;
    try {
      ['translate', 'scale'].forEach(function(p){
        W.style.removeProperty(p);
        Object.defineProperty(W.style, p, { configurable: true, get: function(){ return ''; }, set: function(){} });
      });
      hooked = W; H.classList.add('tthf-nopx');
    } catch (e) {}
  }

  /* ---------- (2) typewriter ---------- */
  var S = null, typeEl = null, started = false, io = null;
  function build(){
    if (S && S.isConnected) return true;
    var sw = D.getElementById('siteWrapper'); if (!sw) return false;
    if (!S) {
      S = D.createElement('div'); S.id = 'tthf-slogan'; S.setAttribute('role', 'text'); S.setAttribute('aria-label', SLOGAN);
      S.innerHTML = '<span class="tthf-box"><span class="tthf-ghost" aria-hidden="true"></span><span class="tthf-type" aria-hidden="true"></span></span>';
      S.querySelector('.tthf-ghost').textContent = SLOGAN;
      typeEl = S.querySelector('.tthf-type');
      if (started) typeEl.textContent = SLOGAN;
    }
    sw.appendChild(S);
    return true;
  }
  function place(){
    if (!build()) return;
    var sw = D.getElementById('siteWrapper'), n = D.getElementById('tt-notice'), tw = D.getElementById('tt-topwall');
    if (!sw || !n || !tw || !H.classList.contains('tt-topwall')) { S.classList.remove('on'); return; }
    var box = n.querySelector('.ttdg-box') || n;
    var sr = sw.getBoundingClientRect(), br = box.getBoundingClientRect();
    var h = S.offsetHeight || 34;
    var top = Math.round(br.top - sr.top - h - 8);
    S.style.top = top + 'px';
    S.classList.add('on');
    if (!io && window.IntersectionObserver) {
      io = new IntersectionObserver(function(es){ if (es[es.length - 1].isIntersecting) go(); }, { threshold: .6 });
      io.observe(S);
    } else if (!window.IntersectionObserver) go();
  }
  function go(){
    if (started) return; started = true;
    if (RM) { typeEl.textContent = SLOGAN; return; }
    var wait = Math.max(0, 2300 - (Date.now() - t0)), i = 0;
    function step(){
      i++; typeEl.textContent = SLOGAN.slice(0, i);
      if (i >= SLOGAN.length) return;
      var c = SLOGAN.charAt(i - 1), d = 34 + Math.random() * 38;
      if (c === '.' ) d += 260; else if (c === ',') d += 120;
      setTimeout(step, d);
    }
    setTimeout(step, wait);
  }

  /* ---------- (3b) spotlight (desktop, fine pointer, no reduced motion) ---------- */
  var L = null, lx = 0, ly = 0, tx = 0, ty = 0, raf = 0, inside = false, lastCX = -1, lastCY = -1;
  function spotOn(){
    if (!FINE || RM) return;
    function ensure(){
      var tw = D.getElementById('tt-topwall'); if (!tw) return null;
      if (!L) { L = D.createElement('div'); L.id = 'tthf-spot'; L.setAttribute('aria-hidden', 'true'); }
      if (L.parentNode !== tw) {
        tw.insertBefore(L, D.getElementById('tt-neon') || null); /* above paint + shade, under the neon */
      }
      return tw;
    }
    function target(){
      var tw = ensure(); if (!tw) return;
      var r = tw.getBoundingClientRect();
      inside = lastCX >= 0 && lastCY >= r.top && lastCY <= r.bottom && lastCX >= r.left && lastCX <= r.right;
      if (inside) { tx = lastCX - r.left; ty = lastCY - r.top; if (!L.classList.contains('on')) { lx = tx; ly = ty; } }
      L.classList.toggle('on', inside);
      if (inside && !raf) raf = requestAnimationFrame(tick);
    }
    function tick(){
      raf = 0;
      lx += (tx - lx) * .2; ly += (ty - ly) * .2;
      if (L) L.style.transform = 'translate3d(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px,0)';
      if (inside && (Math.abs(tx - lx) > .3 || Math.abs(ty - ly) > .3)) raf = requestAnimationFrame(tick);
    }
    D.addEventListener('pointermove', function(e){
      if (e.pointerType && e.pointerType !== 'mouse') return;
      lastCX = e.clientX; lastCY = e.clientY; target();
    }, { passive: true });
    window.addEventListener('scroll', function(){ if (lastCX >= 0) target(); }, { passive: true });
    D.documentElement.addEventListener('mouseleave', function(){ lastCX = lastCY = -1; target(); });
  }

  function boot(){
    hookWall(); place(); spotOn();
    setInterval(function(){ hookWall(); place(); }, 400);
    window.addEventListener('resize', place); window.addEventListener('load', place);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
