/*! tt-home-extras v1.1 (neon follows wall parallax) for therapytoaster.com Home: (a) shake/double-click glitch, (b) tilt + mouse parallax,
    (c) Toasty app icon (manifest, apple-touch-icon, theme-color, splash), (e) CRT mini-game, (f) phone dock. */
(function(){
  'use strict';
  if (window.ttHxRun) return; window.ttHxRun = 1;
  var D = document, HTML = D.documentElement;
  var BASE = window.ttHxBase || 'https://therapytoaster.github.io/tt-live/home-extras/';
  var FALLBACK = window.ttHxFallback || 'https://therapytoaster.github.io/tt-live/home-extras/';
  var mm = function(q){ return !!(window.matchMedia && matchMedia(q).matches); };
  var RM = mm('(prefers-reduced-motion: reduce)');
  var FINE = mm('(hover: hover) and (pointer: fine)');
  var IOS = /iPad|iPhone|iPod/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var IOS_PERM = IOS && typeof window.DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function';
  var LS = { get: function(k){ try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function(k, v){ try { localStorage.setItem(k, v); } catch (e) {} } };
  function el(tag, attrs, html){ var e = D.createElement(tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function ready(fn){ if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', fn); else fn(); }

  /* ================= (c) Toasty app icon / PWA ================= */
  function headLink(rel, href, extra){
    if (D.head.querySelector('link[rel="' + rel + '"]' + (extra && extra.media ? '[media="' + extra.media + '"]' : ''))) return;
    var l = el('link', { rel: rel, href: href }); if (extra) for (var k in extra) l.setAttribute(k, extra[k]); D.head.appendChild(l);
  }
  function headMeta(name, content){ if (D.head.querySelector('meta[name="' + name + '"]')) return; D.head.appendChild(el('meta', { name: name, content: content })); }
  function pwa(){
    if (!D.head) return;
    headLink('manifest', BASE + 'manifest.webmanifest');
    headLink('apple-touch-icon', BASE + 'icons/apple-touch-icon.png', { sizes: '180x180' });
    headMeta('theme-color', '#000000');
    headMeta('mobile-web-app-capable', 'yes');
    headMeta('apple-mobile-web-app-capable', 'yes');
    headMeta('apple-mobile-web-app-title', 'Toasty');
    headMeta('apple-mobile-web-app-status-bar-style', 'black');
    headMeta('application-name', 'Toasty');
    /* iOS launch images (portrait). w,h px; cw,ch css px; dpr */
    [[1320,2868,440,956,3],[1290,2796,430,932,3],[1206,2622,402,874,3],[1179,2556,393,852,3],[1284,2778,428,926,3],[1170,2532,390,844,3],[1125,2436,375,812,3],[1242,2688,414,896,3],[828,1792,414,896,2],[750,1334,375,667,2]].forEach(function(s){
      var media = '(device-width: ' + s[2] + 'px) and (device-height: ' + s[3] + 'px) and (-webkit-device-pixel-ratio: ' + s[4] + ') and (orientation: portrait)';
      headLink('apple-touch-startup-image', BASE + 'icons/splash-' + s[0] + 'x' + s[1] + '.png', { media: media });
    });
    window.addEventListener('beforeinstallprompt', function(e){ window.ttxInstallEvt = e; });
    window.ttxInstall = function(){ var e = window.ttxInstallEvt; if (e && e.prompt){ e.prompt(); return true; } return false; };
    var standalone = mm('(display-mode: standalone)') || navigator.standalone === true;
    if (standalone){
      HTML.classList.add('ttx-app');
      var seen = false; try { seen = sessionStorage.getItem('ttxSplash') === '1'; sessionStorage.setItem('ttxSplash', '1'); } catch (e) {}
      if (!seen) ready(function(){
        var sp = el('div', { id: 'ttx-splash', 'aria-hidden': 'true' }, '<img alt="" src="' + BASE + 'icons/logo-splash.png"><span>THERAPY TOASTER</span>');
        D.body.appendChild(sp);
        setTimeout(function(){ sp.classList.add('out'); setTimeout(function(){ if (sp.parentNode) sp.parentNode.removeChild(sp); }, 600); }, RM ? 300 : 1100);
      });
    }
  }

  /* ================= (a) Shake / double-click glitch ================= */
  var glitching = false, lastGlitch = 0;
  function glitch(src){
    if (RM || glitching) return;
    var now = Date.now(); if (now - lastGlitch < 1300) return;
    glitching = true; lastGlitch = now;
    var ov = el('div', { id: 'ttx-gl', 'aria-hidden': 'true' });
    var n = 7 + ((Math.random() * 4) | 0), h = '';
    for (var i = 0; i < n; i++){
      var top = (Math.random() * 96).toFixed(1), ht = (1 + Math.random() * 9).toFixed(1), cls = i % 4 === 1 ? 'y' : i % 4 === 3 ? 'c' : '';
      h += '<i class="' + cls + '" style="top:' + top + '%;height:' + ht + '%;animation-delay:-' + (Math.random() * .16).toFixed(2) + 's"></i>';
    }
    ov.innerHTML = h + '<b></b><s>GLITCHED</s>';
    D.body.appendChild(ov);
    HTML.classList.add('ttx-glitching');
    /* re-roll bands a few times so it looks alive */
    var rolls = 0, rt = setInterval(function(){
      var bands = ov.querySelectorAll('i');
      for (var j = 0; j < bands.length; j++){ bands[j].style.top = (Math.random() * 96).toFixed(1) + '%'; bands[j].style.height = (1 + Math.random() * 9).toFixed(1) + '%'; }
      if (++rolls > 6) clearInterval(rt);
    }, 130);
    try { if (navigator.vibrate) navigator.vibrate([45, 35, 70, 30, 40]); } catch (e) {}
    setTimeout(function(){
      clearInterval(rt);
      HTML.classList.remove('ttx-glitching');
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      glitching = false;
    }, 1000);
  }
  window.ttxGlitch = glitch;

  var INTERACTIVE = 'a,button,input,textarea,select,label,option,video,audio,iframe,canvas,img,svg,[role="button"],[role="link"],[role="slider"],[contenteditable],[tabindex]:not([tabindex="-1"]),.tt-crt-glass,#tt-vcr,#ttx-dock,#ttmp,#ttcl,.sqs-block-button,.ttpw-root';
  function hasOwnText(node){
    for (var c = node.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && /\S/.test(c.nodeValue)) return true;
    return false;
  }
  function desktopGlitch(){
    if (!FINE) return;
    D.addEventListener('dblclick', function(e){
      var t = e.target; if (!t || t.nodeType !== 1) return;
      if (t.closest(INTERACTIVE)) return;
      if (hasOwnText(t)) return; /* double-clicking words selects text; leave that alone */
      if (/^(P|H[1-6]|LI|SPAN|EM|STRONG|B|I|SMALL|BLOCKQUOTE|PRE|CODE|TD|TH|FIGCAPTION)$/.test(t.tagName)) return;
      try { var s = window.getSelection && getSelection(); if (s && s.removeAllRanges) s.removeAllRanges(); } catch (er) {}
      glitch('dblclick');
    });
  }

  var motionOn = false, peaks = [];
  function onMotion(e){
    var a = e.accelerationIncludingGravity || e.acceleration; if (!a) return;
    var x = a.x || 0, y = a.y || 0, z = a.z || 0;
    var lx = onMotion.lx, ly = onMotion.ly, lz = onMotion.lz;
    onMotion.lx = x; onMotion.ly = y; onMotion.lz = z;
    if (lx == null) return;
    var delta = Math.abs(x - lx) + Math.abs(y - ly) + Math.abs(z - lz);
    var now = Date.now();
    if (delta > 26){
      peaks = peaks.filter(function(t){ return now - t < 700; }); peaks.push(now);
      if (peaks.length >= 2){ peaks = []; glitch('shake'); }
    }
  }
  function startMotion(){
    if (motionOn || RM) return; motionOn = true;
    window.addEventListener('devicemotion', onMotion, { passive: true });
  }

  /* iOS 13+: motion + orientation need a tap to grant. Small chip, iOS only. */
  function iosChip(){
    if (!IOS_PERM || RM) return;
    var pref = LS.get('ttxMotion');
    if (pref === 'no') return;
    var chip = el('div', { id: 'ttx-chip', role: 'group', 'aria-label': 'Enable shake and tilt effects' },
      '<button type="button" class="ttx-chip-go">&#128243; Tap to enable shake + tilt</button><button type="button" class="ttx-chip-x" aria-label="No thanks">&#10005;</button>');
    function gone(){ if (chip.parentNode) chip.parentNode.removeChild(chip); }
    chip.querySelector('.ttx-chip-x').addEventListener('click', function(){ LS.set('ttxMotion', 'no'); gone(); });
    chip.querySelector('.ttx-chip-go').addEventListener('click', function(){
      var p1 = DeviceMotionEvent.requestPermission();
      var p2 = (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') ? DeviceOrientationEvent.requestPermission() : Promise.resolve('granted');
      Promise.all([p1, p2]).then(function(r){
        if (r[0] === 'granted') startMotion();
        if (r[1] === 'granted') startTilt();
        LS.set('ttxMotion', r[0] === 'granted' ? 'yes' : 'no');
        gone();
      }).catch(function(){ gone(); });
    });
    /* a previous grant does not carry across page loads on iOS, so the chip still shows but only until dismissed/used */
    D.body.appendChild(chip);
  }

  /* ================= (b) Tilt TV + mouse parallax ================= */
  var px = { tx: 0, ty: 0, x: 0, y: 0, raf: 0, on: false, tiltOn: false, base: null };
  var T = {};
  function grab(){
    T.wall = D.querySelector('#tt-topwall .tw-img');
    T.float = D.querySelector('#tt-float-layer > canvas');
    T.title = D.getElementById('site-title');
    T.crt = D.getElementById('tt-crt');
  }
  /* v1.1 neon lock. The Home neon overlay (#tt-neon, from header-bg.js) is a sibling of .tw-img, not a child, so the
     wall parallax (translate + scale 1.06) used to slide the wall away from the glow/tube layers: the neon no longer
     sat on the painted words. Here the neon layers get the transform that maps the box header-bg.js placed onto the
     box the wall picture really paints. Applied to .tn-glow/.tn-tube (not #tt-neon) so mix-blend-mode:screen keeps
     blending with the wall. Re-run after header-bg.js re-places the neon, and whenever it does so later. */
  var nl = { tx: 0, ty: 0, s: 1, raf: 0, mo: null, moEl: null };
  function nlSoon(){ if (!nl.raf) nl.raf = requestAnimationFrame(nlSync); }
  function nlSync(){
    nl.raf = 0;
    var W = T.wall, N = D.getElementById('tt-neon');
    if (!W || !N || !N.offsetWidth || !W.isConnected) return;
    if (nl.moEl !== N && window.MutationObserver){
      if (nl.mo) nl.mo.disconnect();
      nl.mo = new MutationObserver(nlSoon); nl.mo.observe(N, { attributes: true, attributeFilter: ['style'] }); nl.moEl = N;
    }
    var cs = getComputedStyle(W), sz = (cs.backgroundSize || '').split(',')[0].trim().split(/\s+/)[0] || '100%';
    var w0 = W.offsetWidth, h0 = W.offsetHeight;
    var bw = /%$/.test(sz) ? w0 * parseFloat(sz) / 100 : (parseFloat(sz) || w0), bh = bw / 3;
    var pxs = (cs.backgroundPositionX || '50%').split(',')[0].trim(), pys = (cs.backgroundPositionY || '50%').split(',')[0].trim();
    var bx = /%$/.test(pxs) ? (w0 - bw) * parseFloat(pxs) / 100 : (parseFloat(pxs) || 0);
    var by = /%$/.test(pys) ? (h0 - bh) * parseFloat(pys) / 100 : (parseFloat(pys) || 0);
    var cx = W.offsetLeft + w0 / 2, cy = W.offsetTop + h0 / 2, s = nl.s;
    var L = cx + (W.offsetLeft + bx - cx) * s + nl.tx, Tp = cy + (W.offsetTop + by - cy) * s + nl.ty;
    var k = (bw * s) / (N.offsetWidth || bw);
    for (var c = N.firstElementChild; c; c = c.nextElementSibling){
      c.style.transformOrigin = (-c.offsetLeft) + 'px ' + (-c.offsetTop) + 'px';
      c.style.translate = (L - N.offsetLeft).toFixed(2) + 'px ' + (Tp - N.offsetTop).toFixed(2) + 'px';
      c.style.scale = k.toFixed(5);
    }
  }
  function apply(){
    var x = px.x, y = px.y;
    if (!T.crt || !T.crt.isConnected || !T.wall || !T.float) grab();
    if (T.wall){ T.wall.style.translate = (-x * 14).toFixed(2) + 'px ' + (-y * 10).toFixed(2) + 'px'; T.wall.style.scale = '1.06'; }
    if (T.wall){ nl.tx = -x * 14; nl.ty = -y * 10; nl.s = 1.06; nlSoon(); }
    if (T.float){ T.float.style.translate = (x * 18).toFixed(2) + 'px ' + (y * 14).toFixed(2) + 'px'; T.float.style.scale = '1.05'; }
    if (T.title){ T.title.style.translate = (x * 6).toFixed(2) + 'px ' + (y * 4).toFixed(2) + 'px'; }
    if (T.crt && T.crt.classList.contains('tt-crt-tv')){
      var k = T.crt.classList.contains('ttx-gaming') ? 0.25 : 1;
      T.crt.style.transform = 'perspective(900px) rotateX(' + (-y * 5 * k).toFixed(2) + 'deg) rotateY(' + (x * 7 * k).toFixed(2) + 'deg) translate3d(' + (x * 4 * k).toFixed(2) + 'px,' + (y * 3 * k).toFixed(2) + 'px,0)';
    }
  }
  function tick(){
    px.raf = 0;
    px.x += (px.tx - px.x) * 0.09; px.y += (px.ty - px.y) * 0.09;
    apply();
    if (Math.abs(px.tx - px.x) > 0.001 || Math.abs(px.ty - px.y) > 0.001) px.raf = requestAnimationFrame(tick);
  }
  function setTarget(x, y){
    px.tx = Math.max(-1, Math.min(1, x)); px.ty = Math.max(-1, Math.min(1, y));
    if (!px.raf && !D.hidden) px.raf = requestAnimationFrame(tick);
  }
  window.ttxParallax = setTarget; /* handy for testing */
  function startMouse(){
    if (!FINE) return;
    HTML.classList.add('ttx-px');
    D.addEventListener('pointermove', function(e){
      if (e.pointerType && e.pointerType !== 'mouse') return;
      setTarget((e.clientX / (window.innerWidth || 1)) * 2 - 1, (e.clientY / (window.innerHeight || 1)) * 2 - 1);
    }, { passive: true });
    D.documentElement.addEventListener('mouseleave', function(){ setTarget(0, 0); });
  }
  function onOrient(e){
    if (e.beta == null || e.gamma == null) return;
    var land = Math.abs(window.orientation || (screen.orientation && screen.orientation.angle) || 0) === 90;
    var b = land ? e.gamma : e.beta, g = land ? e.beta : e.gamma;
    if (!px.base){ px.base = { b: b, g: g }; }
    /* slowly re-centre so holding the phone at any angle settles back */
    px.base.b += (b - px.base.b) * 0.01; px.base.g += (g - px.base.g) * 0.01;
    setTarget((g - px.base.g) / 18, (b - px.base.b) / 18);
  }
  function startTilt(){
    if (px.tiltOn || RM || FINE) return; px.tiltOn = true;
    HTML.classList.add('ttx-px');
    window.addEventListener('deviceorientation', onOrient, { passive: true });
  }

  /* ================= (e) CRT mini-game ================= */
  var gameState = { loading: false, inst: null, wasPlaying: false };
  function loadGame(cb){
    if (window.TTHXGame) return cb();
    if (gameState.loading) return; gameState.loading = true;
    var s = D.createElement('script'); s.src = BASE + 'mini-game.js'; s.async = true;
    s.onload = function(){ gameState.loading = false; cb(); };
    s.onerror = function(){
      var s2 = D.createElement('script'); s2.src = FALLBACK + 'mini-game.js'; s2.async = true;
      s2.onload = function(){ gameState.loading = false; cb(); };
      s2.onerror = function(){ gameState.loading = false; };
      D.head.appendChild(s2);
    };
    D.head.appendChild(s);
  }
  function openGame(){
    var crt = D.getElementById('tt-crt'), vcr = D.getElementById('tt-vcr');
    var glass = crt && crt.querySelector('.tt-crt-glass'); if (!glass || gameState.inst) return;
    var btnPlay = vcr && vcr.querySelector('[data-vcr="play"]');
    var gb = vcr && vcr.querySelector('.ttx-vcr-game');
    if (gb){ gb.setAttribute('aria-pressed', 'true'); gb.innerHTML = '&#9203; LOADING&hellip;'; }
    loadGame(function(){
      if (gameState.inst) return;
      gameState.wasPlaying = !!(vcr && vcr.classList.contains('vcr-playing'));
      if (gameState.wasPlaying && btnPlay) btnPlay.click(); /* pause trailer through its own VCR button so its state stays right */
      var vid = D.getElementById('tt-ht-vid'); if (vid && !vid.paused) try { vid.pause(); } catch (e) {}
      crt.classList.add('ttx-gaming');
      var ch = crt.querySelector('.tt-crt-ch');
      if (!glass.querySelector('.ttx-ch')) glass.appendChild(el('div', { 'class': 'ttx-ch', 'aria-hidden': 'true' }, 'AV2 &middot; GAME'));
      if (gb){ gb.innerHTML = '&#127918; PLAYING &middot; ESC / &#10005; TO EXIT'; }
      gameState.inst = window.TTHXGame.mount(glass, {
        duration: 30, fullUrl: 'https://www.therapytoaster.com/arcade',
        onExit: function(){
          gameState.inst = null;
          crt.classList.remove('ttx-gaming');
          if (gb){ gb.setAttribute('aria-pressed', 'false'); gb.innerHTML = gameLabel; }
          if (gameState.wasPlaying && btnPlay && !vcr.classList.contains('vcr-playing')) btnPlay.click(); /* back to the muted trailer */
          try { glass.focus({ preventScroll: true }); } catch (e) {}
        }
      });
    });
  }
  var gameLabel = '&#127918; PLAY GAME &middot; TOASTY BROS (30s)';
  function mountGameUI(){
    var crt = D.getElementById('tt-crt'), vcr = D.getElementById('tt-vcr');
    var glass = crt && crt.querySelector('.tt-crt-glass'), keys = vcr && vcr.querySelector('.vcr-keys');
    if (!glass || !keys) return false;
    if (!vcr.querySelector('.ttx-vcr-game')){
      var b = el('button', { type: 'button', 'class': 'ttx-vcr-game', 'aria-pressed': 'false', title: 'Play a 30 second Toasty Bros teaser on the TV' }, gameLabel);
      b.addEventListener('click', function(e){ e.stopPropagation(); if (gameState.inst) gameState.inst.exit(); else openGame(); });
      keys.parentNode.insertBefore(b, keys.nextSibling);
    }
    if (!glass.querySelector('.ttx-tv-game')){
      var t = el('button', { type: 'button', 'class': 'ttx-tv-game', 'aria-label': 'Play Toasty Bros on the TV' }, '&#127918; PLAY GAME');
      t.addEventListener('click', function(e){ e.stopPropagation(); e.preventDefault(); openGame(); });
      t.addEventListener('keydown', function(e){ e.stopPropagation(); });
      glass.appendChild(t);
    }
    return true;
  }
  function waitGameUI(){
    if (mountGameUI()) return;
    var n = 0, id = setInterval(function(){ if (mountGameUI() || ++n > 150) clearInterval(id); }, 200);
  }

  /* ================= (f) Phone bottom dock ================= */
  var ICON = {
    shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    arcade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 8h11A4.5 4.5 0 0 1 22 12.5v.5a4 4 0 0 1-7 2.6l-.6-.6H9.6l-.6.6A4 4 0 0 1 2 13v-.5A4.5 4.5 0 0 1 6.5 8z"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r=".9" fill="currentColor"/><circle cx="18" cy="13.5" r=".9" fill="currentColor"/></svg>',
    nfts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c-4.7 0-8 3.1-8 7.4 0 2.6 1.3 4.4 3 5.5V19a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3.1c1.7-1.1 3-2.9 3-5.5C20 6.1 16.7 3 12 3z"/><circle cx="9" cy="11" r="1.8" fill="currentColor"/><circle cx="15" cy="11" r="1.8" fill="currentColor"/><path d="M10 20v-2.5M14 20v-2.5M12 14.5l-.9 1.6h1.8z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 5.9c-.7.3-1.5.6-2.4.7.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-1.6-1.7-4.3-1.8-6-.2-1.1 1-1.5 2.6-1.2 4-3.3-.2-6.4-1.7-8.5-4.3-1.1 1.9-.5 4.3 1.3 5.5-.7 0-1.3-.2-1.9-.5 0 2 1.4 3.7 3.3 4.1-.6.2-1.2.2-1.9.1.5 1.7 2.1 2.9 3.9 2.9-1.7 1.3-3.8 2-6 2H2c2.2 1.4 4.7 2.1 7.3 2.1 8.8 0 13.6-7.3 13.6-13.6v-.6c.9-.7 1.6-1.5 2.2-2.4z"/></svg>'
  };
  function dock(){
    if (D.getElementById('ttx-dock')) return;
    var items = [
      ['https://www.therapytoaster.com/shop', 'Shop', ICON.shop, ''],
      ['https://www.therapytoaster.com/arcade', 'ARTcade', ICON.arcade, ''],
      ['https://www.therapytoaster.com/skullz', 'NFTs', ICON.nfts, ''],
      ['https://x.com/TherapyToaster', 'Twitter', ICON.twitter, ' target="_blank" rel="noopener"']
    ];
    var nav = el('nav', { id: 'ttx-dock', 'aria-label': 'Quick links' }, items.map(function(it){
      return '<a href="' + it[0] + '"' + it[3] + '>' + it[2] + '<span>' + it[1] + '</span></a>';
    }).join(''));
    D.body.appendChild(nav);
    HTML.classList.add('ttx-dock-on');
    /* hide dock while the Squarespace mobile menu is open */
    if (window.MutationObserver){
      var sync = function(){ HTML.classList.toggle('ttx-menu-open', !!(D.body.classList.contains('header--menu-open') || HTML.classList.contains('header--menu-open'))); };
      new MutationObserver(sync).observe(D.body, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /* ================= boot ================= */
  pwa();
  ready(function(){
    dock();
    waitGameUI();
    if (!RM){
      desktopGlitch();
      startMouse();
      if (!FINE){
        if (IOS_PERM){
          if (LS.get('ttxMotion') !== 'no') iosChip();
        } else { startMotion(); startTilt(); }
      }
    }
  });
})();
