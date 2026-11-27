/*! tt-hero-fx v1.1 for therapytoaster.com Home hero.
    (1) neon flicker-on CSS is inline in MAIN (#tt-hero-fx-css).
    (2) typewriter slogan under the neon wall, wraps to stay clear of fixed widgets.
    (3) cursor spotlight replaces the wall mouse parallax. */
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

  var css =
    '#tthf-slogan{position:absolute;left:0;right:0;z-index:1;margin:0;padding:0 16px;box-sizing:border-box;text-align:center;pointer-events:none;opacity:0;transition:opacity .4s}' +
    '#tthf-slogan.on{opacity:1}' +
    '#tthf-slogan .tthf-box{position:relative;display:inline-block;max-width:100%;padding:7px 16px 8px;background:rgba(0,0,0,.72);border-left:3px solid #FFD400;border-right:3px solid #FFD400;' +
      'font:700 clamp(12px,1.05vw,15px)/1.4 "Courier New",Courier,monospace;letter-spacing:.015em;color:#FFD400;text-align:center;white-space:pre-wrap;overflow-wrap:break-word;' +
      'text-shadow:0 0 8px rgba(255,212,0,.55),0 2px 0 #000}' +
    '#tthf-slogan .tthf-ghost{visibility:hidden}' +
    '#tthf-slogan .tthf-type{position:absolute;left:16px;right:16px;top:7px}' +
    '#tthf-slogan .tthf-type:after{content:"";display:inline-block;width:.55em;height:1.05em;margin-left:2px;vertical-align:-.15em;background:#FFD400;box-shadow:0 0 8px rgba(255,212,0,.8);animation:tthfBlink 1s steps(1) infinite}' +
    '@keyframes tthfBlink{0%,100%{opacity:1}50%{opacity:0}}' +
    '#tthf-spot{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .3s;will-change:opacity;' +
      'background:radial-gradient(circle 250px at var(--sx,50%) var(--sy,50%),rgba(255,236,200,.38) 0,rgba(255,220,150,.18) 32%,rgba(255,200,80,.05) 52%,rgba(0,0,0,0) 64%,rgba(0,0,0,.2) 100%)}' +
    '#tthf-spot.on{opacity:1}' +
    '@media (prefers-reduced-motion:reduce){#tthf-slogan{transition:none}#tthf-slogan .tthf-type:after{animation:none}}';
  var st = D.createElement('style'); st.id = 'tthf-css'; st.textContent = css; (D.head || H).appendChild(st);

  /* extras.js (pinned, untouched) writes translate/scale on '#tt-topwall .tw-img'.
     Shadow those two properties so the writes are ignored. tt-neon-lock then no-ops. */
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

  function typed(n){
    var i=SLOGAN.indexOf('. ');
    if(i<0||n<=i+1) return SLOGAN.slice(0,n);
    return SLOGAN.slice(0,i+1)+'\n'+SLOGAN.slice(i+2,n);
  }
  var S = null, typeEl = null, started = false, io = null;
  function build(){
    if (S && S.isConnected) return true;
    var sw = D.getElementById('siteWrapper'); if (!sw) return false;
    if (!S) {
      S = D.createElement('div'); S.id = 'tthf-slogan'; S.setAttribute('role', 'text'); S.setAttribute('aria-label', SLOGAN);
      S.innerHTML = '<span class="tthf-box"><span class="tthf-ghost" aria-hidden="true"></span><span class="tthf-type" aria-hidden="true"></span></span>';
      /* Break after the first sentence so the box is two centered lines, clear of side widgets. */
      S.querySelector('.tthf-ghost').textContent = typed(SLOGAN.length);
      typeEl = S.querySelector('.tthf-type');
      if (started) typeEl.textContent = typed(SLOGAN.length);
    }
    sw.appendChild(S);
    return true;
  }
  /* Keep the pre-sized box inside the gap between fixed widgets (#ttcl Chipotle, #ttmp radio) when they cover the slogan band. */
  function clearWidgets(){
    /* First lay the box out centered, then only inset if a widget would actually cover it. */
    S.style.paddingLeft = S.style.paddingRight = '16px';
    var box = S.querySelector('.tthf-box'), br = box && box.getBoundingClientRect();
    if (!br || br.height < 8) {
      var n = D.getElementById('tt-notice'), dg = n && (n.querySelector('.ttdg-box') || n);
      if (dg) { var d = dg.getBoundingClientRect(); br = { left: br && br.left || 0, right: br && br.right || 0, top: d.top - 80, bottom: d.top - 8, width: br && br.width || 0 }; }
    }
    if (!br) return;
    var padL = 16, padR = 16, vw = window.innerWidth || 0;
    ['ttcl', 'ttmp', 'tt-crt', 'tt-crt-col'].forEach(function(id){
      var e = D.getElementById(id); if (!e) return;
      var r = e.getBoundingClientRect();
      if (r.width < 40 || r.bottom < br.top - 16 || r.top > br.bottom + 16) return;
      if (r.left < br.right + 12 && r.right > br.left - 12) {
        if (r.left > vw * .45) padR = Math.max(padR, Math.round(vw - r.left + 12));
        else padL = Math.max(padL, Math.round(r.right + 12));
      }
    });
    S.style.paddingLeft = padL + 'px';
    S.style.paddingRight = padR + 'px';
  }
  function place(){
    if (!build()) return;
    var sw = D.getElementById('siteWrapper'), n = D.getElementById('tt-notice'), tw = D.getElementById('tt-topwall');
    if (!sw || !n || !tw || !H.classList.contains('tt-topwall')) { S.classList.remove('on'); return; }
    var box = n.querySelector('.ttdg-box') || n;
    var sr = sw.getBoundingClientRect(), br = box.getBoundingClientRect();
    clearWidgets();
    var h = S.offsetHeight || 40;
    S.style.top = Math.round(br.top - sr.top - h - 8) + 'px';
    clearWidgets();
    h = S.offsetHeight || h;
    S.style.top = Math.round(br.top - sr.top - h - 8) + 'px';
    S.classList.add('on');
    if (!io && window.IntersectionObserver) {
      io = new IntersectionObserver(function(es){ if (es[es.length - 1].isIntersecting) go(); }, { threshold: .45 });
      io.observe(S);
    } else if (!window.IntersectionObserver) go();
  }
  function go(){
    if (started) return; started = true;
    if (RM) { typeEl.textContent = typed(SLOGAN.length); return; }
    var wait = Math.max(0, 2300 - (Date.now() - t0)), i = 0;
    function step(){
      i++; typeEl.textContent = typed(i);
      if (i >= SLOGAN.length) return;
      var c = SLOGAN.charAt(i - 1), d = 34 + Math.random() * 38;
      if (c === '.') d += 260; else if (c === ',') d += 120;
      setTimeout(step, d);
    }
    setTimeout(step, wait);
  }

  var L = null, lx = 0, ly = 0, tx = 0, ty = 0, raf = 0, inside = false, lastCX = -1, lastCY = -1;
  function spotOn(){
    if (!FINE || RM) return;
    function ensure(){
      var tw = D.getElementById('tt-topwall'); if (!tw) return null;
      if (!L) { L = D.createElement('div'); L.id = 'tthf-spot'; L.setAttribute('aria-hidden', 'true'); }
      if (L.parentNode !== tw) tw.insertBefore(L, D.getElementById('tt-neon') || null);
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
      lx += (tx - lx) * .22; ly += (ty - ly) * .22;
      if (L){ L.style.setProperty('--sx', lx.toFixed(1)+'px'); L.style.setProperty('--sy', ly.toFixed(1)+'px'); }
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
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('load', place);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
