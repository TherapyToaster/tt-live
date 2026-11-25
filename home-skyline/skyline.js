/*! tt-home-skyline v1 for therapytoaster.com Home.
   Futuristic neon city in the empty desktop gutters and background.
   Yellow #FFD400 on black, with red and cyan neon. Desktop only (>=1024px).
   One canvas, ~30fps, devicePixelRatio cap. Pauses when the tab is hidden.
   prefers-reduced-motion: a single static frame. Idempotent.
*/
(function (W, D) {
  if (W.ttHsRun) return;
  W.ttHsRun = 1;

  var YEL = '#FFD400', CYAN = '#00F0FF', RED = '#FF1E3C';
  var MIN_W = 1024, FPS = 30, STEP = 1000 / FPS, DPR_CAP = 1.5;
  var P = (location.pathname || '/').replace(/\/+$/, '');
  if (P !== '' && P !== '/home' && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

  var mqDesk = W.matchMedia('(min-width:' + MIN_W + 'px)');
  var mqReduce = W.matchMedia('(prefers-reduced-motion: reduce)');
  var cv = null, cx = null, base = null, bx = null;
  var vw = 0, vh = 0, dpr = 1;
  var raf = 0, lastTs = 0, t0 = 0, tAnim = 0, hidden = false, running = false;
  var city = null;
  var px = { x: 0, y: 0, tx: 0, ty: 0 };
  var frameMs = 0, frameAvg = 16, frameN = 0;
  var logoImg = null, logoOk = false, logoTried = false;
  var forceTruck = -1; /* -1 auto, else 0..1 progress across the screen */
  var rain = [], embers = [], toasts = [], cars = [];
  var truck = { on: false, p: 0, dir: 1, y: 0, wait: 7 };
  var glitch = { on: 0, x: 0, w: 0 };

  function $(id) { return D.getElementById(id); }

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  function mix(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, x) {
    var t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function injectCss() {
    if ($('tt-hs-css')) return;
    var s = D.createElement('style');
    s.id = 'tt-hs-css';
    s.textContent =
      '#tt-skyline{position:fixed;left:-4%;top:-4%;width:108%;height:108%;pointer-events:none;z-index:0;display:block;contain:strict;border:0;margin:0;padding:0}' +
      '@media (max-width:1023.98px){#tt-skyline{display:none!important}}';
    (D.head || D.documentElement).appendChild(s);
  }

  function mount() {
    if ($('tt-skyline')) { cv = $('tt-skyline'); cx = cv.getContext('2d', { alpha: true }); return; }
    cv = D.createElement('canvas');
    cv.id = 'tt-skyline';
    cv.setAttribute('aria-hidden', 'true');
    cv.setAttribute('role', 'presentation');
    cx = cv.getContext('2d', { alpha: true });
    var body = D.body || D.documentElement;
    var float = $('tt-float-layer');
    if (float && float.parentNode) float.parentNode.insertBefore(cv, float);
    else body.insertBefore(cv, body.firstChild || null);
  }

  function unmount() {
    stopLoop();
    if (cv && cv.parentNode) cv.parentNode.removeChild(cv);
    cv = cx = base = bx = city = null;
    vw = vh = 0;
  }

  function loadLogo() {
    if (logoTried) return;
    logoTried = true;
    var baseUrl = W.ttHsBase || '';
    var fallback = W.ttHsFallback || '';
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () { logoImg = img; logoOk = true; if (running) bake(); };
    img.onerror = function () {
      if (!fallback || img._fb) return;
      img._fb = 1;
      img.src = fallback + 'mr-toasty-neon-logo-official.png';
    };
    img.src = baseUrl + 'mr-toasty-neon-logo-official.png';
  }

  /* ---------- city construction (baked) ---------- */
  function size() {
    if (!cv) return false;
    var rw = W.innerWidth, rh = W.innerHeight;
    /* canvas is 108% of the viewport and offset -4% */
    var cssW = Math.max(1, Math.round(rw * 1.08));
    var cssH = Math.max(1, Math.round(rh * 1.08));
    var cap = rw >= 1600 ? 1.25 : DPR_CAP;
    var nd = Math.min(W.devicePixelRatio || 1, cap);
    if (cssW === vw && cssH === vh && nd === dpr && city) return false;
    vw = cssW; vh = cssH; dpr = nd;
    cv.width = Math.round(cssW * dpr);
    cv.height = Math.round(cssH * dpr);
    cv.style.width = cssW + 'px';
    cv.style.height = cssH + 'px';
    if (!base) base = D.createElement('canvas');
    base.width = cv.width; base.height = cv.height;
    bx = base.getContext('2d', { alpha: true });
    return true;
  }

  function buildCity() {
    var rand = rng(0x544F41 ^ ((vw * 13 + vh * 7) >>> 0));
    var w = vw, h = vh;
    var horizon = Math.round(h * 0.78);
    var buildings = [];
    var signs = [];

    function addSide(layer, side) {
      /* layer 0 far, 1 mid, 2 near. side -1 left, +1 right */
      var depth = [0.40, 0.30, 0.22][layer] * w;
      var minW = [16, 28, 42][layer], maxW = [52, 90, 140][layer];
      var minH = [h * 0.10, h * 0.20, h * 0.32][layer];
      var maxH = [h * 0.32, h * 0.55, h * 0.74][layer];
      var gapMin = [2, 3, 4][layer], gapMax = [10, 14, 16][layer];
      var x = side < 0 ? 8 : w - 8;
      var guard = 0;
      while (guard++ < 80) {
        var bw = mix(minW, maxW, rand() * rand() * 0.5 + rand() * 0.5);
        if ((side < 0 && x > depth) || (side > 0 && x < w - depth)) break;
        var bx0 = side < 0 ? x : x - bw;
        if (bx0 < -20 || bx0 + bw > w + 20) break;
        var bh = mix(minH, maxH, Math.pow(rand(), 0.7));
        /* taller near the actual edge */
        var edgeProx = side < 0 ? 1 - (bx0 + bw) / depth : 1 - (w - bx0) / depth;
        bh *= mix(0.72, 1, clamp(edgeProx, 0, 1));
        var by = horizon - bh;
        var tone = 6 + layer * 5 + (rand() * 6 | 0);
        var body = 'rgb(' + tone + ',' + (tone + 2) + ',' + (tone + 8) + ')';
        var windows = [];
        var cellW = layer === 0 ? 3 : layer === 1 ? 4 : 5;
        var cellH = cellW + (layer === 0 ? 1 : 2);
        var padX = 3 + layer, padY = 6 + layer * 2;
        for (var wy = by + padY; wy < horizon - 8; wy += cellH + 2 + (rand() * 3 | 0)) {
          for (var wx = bx0 + padX; wx < bx0 + bw - padX - cellW; wx += cellW + 2 + (rand() * 2 | 0)) {
            if (rand() < 0.28) continue;
            var on = rand() > 0.22;
            var kind = rand();
            var col = kind < 0.08 ? CYAN : kind < 0.14 ? RED : YEL;
            windows.push({
              x: wx, y: wy, w: cellW, h: Math.max(2, cellH - 1),
              on: on, col: col, ph: rand() * 6.28, rate: 0.2 + rand() * 1.4
            });
          }
        }
        var b = {
          layer: layer, x: bx0, y: by, w: bw, h: bh, body: body,
          windows: windows, antenna: rand() < 0.28 && bw > 22,
          dish: rand() < 0.12 && layer > 0, roofBar: rand() < 0.35,
          neon: layer === 2 && rand() < 0.45 ? (rand() < 0.5 ? YEL : (rand() < 0.5 ? CYAN : RED)) : null,
          spire: layer > 0 && rand() < 0.2 && bw > 24
        };
        buildings.push(b);
        x += side < 0 ? (bw + mix(gapMin, gapMax, rand())) : -(bw + mix(gapMin, gapMax, rand()));
      }
    }

    for (var layer = 0; layer < 3; layer++) {
      addSide(layer, -1);
      addSide(layer, 1);
    }

    /* Pick sign hosts: mid/near, wide enough, clearly in the gutters. */
    function inGutter(b) {
      var cxb = b.x + b.w / 2;
      return !(cxb > w * 0.34 && cxb < w * 0.66);
    }
    var hosts = buildings.filter(function (b) {
      return b.layer >= 1 && b.w >= 52 && b.h >= h * 0.28 && inGutter(b);
    });
    hosts.sort(function (a, c) { return c.w * c.h - a.w * a.h; });

    var catalog = [
      { kind: 'logo', text: '', col: YEL },
      { kind: 'text', text: 'THERAPY TOASTER', col: YEL, lines: ['THERAPY', 'TOASTER'] },
      { kind: 'text', text: 'Proudly Veteran-Owned', col: YEL, lines: ['Proudly', 'Veteran-Owned'] },
      { kind: 'toaster', text: 'TOASTER', col: YEL },
      { kind: 'skull', text: '', col: YEL },
      { kind: 'text', text: 'Twitter', col: CYAN },
      { kind: 'text', text: 'GLITCH', col: RED },
      { kind: 'text', text: 'BURNT', col: CYAN }
    ];
    var used = 0;
    for (var i = 0; i < hosts.length && used < catalog.length; i++) {
      var b = hosts[i];
      if (b.sign) continue;
      var spec = catalog[used];
      if (spec.kind === 'logo' && b.w < 90) continue;
      used++;
      b.sign = spec;
      signs.push({ b: b, spec: spec });
    }

    city = { horizon: horizon, buildings: buildings, signs: signs, w: w, h: h, sunX: w * 0.5, sunY: horizon, sunR: Math.min(w, h) * 0.13 };
    spawnActors();
  }

  function spawnActors() {
    var rand = rng(0xA11E11);
    var w = vw, h = vh, horizon = city.horizon;
    rain = [];
    for (var i = 0; i < 90; i++) {
      rain.push({
        x: rand() * w, y: rand() * h, vy: mix(280, 520, rand()),
        len: mix(8, 16, rand()), a: 0.12 + rand() * 0.2
      });
    }
    embers = [];
    for (i = 0; i < 40; i++) {
      embers.push({
        x: rand() * w, y: mix(horizon - 80, h, rand()),
        vy: -mix(18, 50, rand()), life: rand(),
        r: mix(1, 2.2, rand()), col: rand() < 0.3 ? RED : YEL
      });
    }
    toasts = [];
    for (i = 0; i < 3; i++) {
      var left = i !== 1;
      toasts.push({
        x: left ? mix(w * 0.06, w * 0.22, rand()) : mix(w * 0.78, w * 0.94, rand()),
        y: mix(h * 0.18, h * 0.42, rand()),
        s: mix(14, 22, rand()),
        ph: rand() * 6.28,
        spin: mix(0.15, 0.4, rand()) * (rand() < 0.5 ? -1 : 1)
      });
    }
    cars = [];
    for (i = 0; i < 3; i++) {
      cars.push({
        y: mix(h * 0.22, horizon - 80, rand()),
        x: rand() * w,
        v: mix(40, 90, rand()) * (i % 2 ? 1 : -1),
        col: i === 2 ? RED : (i === 1 ? CYAN : YEL),
        s: mix(10, 18, rand())
      });
    }
    truck.wait = 6 + rand() * 4;
    truck.on = false; truck.p = 0; truck.dir = 1;
    truck.y = mix(h * 0.20, h * 0.32, rand());
  }

  /* ---------- bake static city ---------- */
  function bake() {
    if (!bx || !city) return;
    var w = vw, h = vh, horizon = city.horizon;
    var sw = base.width, sh = base.height;
    bx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bx.clearRect(0, 0, w, h);

    /* sky */
    var sky = bx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#020309');
    sky.addColorStop(0.45, '#070814');
    sky.addColorStop(0.78, '#160b14');
    sky.addColorStop(1, '#2a1408');
    bx.fillStyle = sky;
    bx.fillRect(0, 0, w, horizon + 1);

    /* sparse stars */
    var sr = rng(0x5A18);
    bx.fillStyle = 'rgba(255,244,200,0.55)';
    for (var i = 0; i < 70; i++) {
      var sx = sr() * w, sy = sr() * (horizon * 0.7);
      var rr = sr() < 0.85 ? 0.7 : 1.3;
      bx.globalAlpha = 0.25 + sr() * 0.55;
      bx.fillRect(sx, sy, rr, rr);
    }
    bx.globalAlpha = 1;

    /* scanline sun */
    var sunX = city.sunX, sunY = city.sunY, sunR = city.sunR;
    bx.save();
    var halo = bx.createRadialGradient(sunX, sunY, sunR * 0.15, sunX, sunY, sunR * 2.2);
    halo.addColorStop(0, 'rgba(255,212,0,0.55)');
    halo.addColorStop(0.35, 'rgba(255,80,40,0.22)');
    halo.addColorStop(0.7, 'rgba(0,240,255,0.06)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    bx.fillStyle = halo;
    bx.fillRect(sunX - sunR * 2.2, sunY - sunR * 2.2, sunR * 4.4, sunR * 4.4);

    bx.beginPath();
    bx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    bx.fillStyle = YEL;
    bx.fill();
    /* red / cyan chromatic fringe */
    bx.globalCompositeOperation = 'screen';
    bx.beginPath(); bx.arc(sunX - 2, sunY, sunR * 0.98, 0, Math.PI * 2);
    bx.fillStyle = 'rgba(255,30,60,0.35)'; bx.fill();
    bx.beginPath(); bx.arc(sunX + 2, sunY, sunR * 0.98, 0, Math.PI * 2);
    bx.fillStyle = 'rgba(0,240,255,0.28)'; bx.fill();
    bx.globalCompositeOperation = 'source-over';
    /* scanlines cut the sun (only the upper half sits in the sky) */
    bx.save();
    bx.beginPath();
    bx.rect(0, 0, w, horizon);
    bx.clip();
    bx.beginPath();
    bx.arc(sunX, sunY, sunR + 1, 0, Math.PI * 2);
    bx.clip();
    bx.fillStyle = 'rgba(5,7,13,0.55)';
    var step = Math.max(3, sunR / 16);
    for (var ly = sunY - sunR; ly < sunY + sunR; ly += step) {
      bx.fillRect(sunX - sunR, ly, sunR * 2, 1.2);
    }
    bx.restore();
    bx.restore();

    /* ground + perspective grid */
    var ground = bx.createLinearGradient(0, horizon, 0, h);
    ground.addColorStop(0, '#0a0610');
    ground.addColorStop(1, '#000000');
    bx.fillStyle = ground;
    bx.fillRect(0, horizon, w, h - horizon + 2);

    var vpX = sunX, vpY = horizon;
    bx.lineWidth = 1;
    /* horizontals */
    var rows = 14;
    for (i = 1; i <= rows; i++) {
      var t = i / rows;
      var gy = horizon + Math.pow(t, 1.35) * (h - horizon);
      var a = 0.22 * (1 - t * 0.5);
      bx.strokeStyle = 'rgba(255,212,0,' + a.toFixed(3) + ')';
      bx.beginPath(); bx.moveTo(0, gy); bx.lineTo(w, gy); bx.stroke();
    }
    /* verticals converging to VP */
    var cols = 22;
    for (i = -cols; i <= cols; i++) {
      if (i === 0) continue;
      var gx = vpX + i * (w / (cols * 0.9));
      var a2 = 0.16 * (1 - Math.min(1, Math.abs(i) / cols));
      bx.strokeStyle = i % 5 === 0 ? 'rgba(0,240,255,' + (a2 * 0.9).toFixed(3) + ')' : 'rgba(255,212,0,' + a2.toFixed(3) + ')';
      bx.beginPath();
      bx.moveTo(vpX, vpY);
      bx.lineTo(gx, h + 8);
      bx.stroke();
    }
    /* horizon line */
    bx.strokeStyle = 'rgba(255,212,0,0.55)';
    bx.lineWidth = 1.4;
    bx.beginPath(); bx.moveTo(0, horizon + 0.5); bx.lineTo(w, horizon + 0.5); bx.stroke();
    bx.strokeStyle = 'rgba(0,240,255,0.25)';
    bx.lineWidth = 1;
    bx.beginPath(); bx.moveTo(0, horizon + 2.5); bx.lineTo(w, horizon + 2.5); bx.stroke();

    /* buildings back to front */
    var layers = [[], [], []];
    city.buildings.forEach(function (b) { layers[b.layer].push(b); });
    for (var L = 0; L < 3; L++) {
      layers[L].forEach(function (b) { drawBuilding(bx, b, false); });
    }

    /* soft center dim so mid-page headings stay readable; sides stay vivid.
       Weight is 1 at the far edges and ~0.12 in the middle third. */
    var mask = bx.createLinearGradient(0, 0, w, 0);
    mask.addColorStop(0, 'rgba(5,7,13,0)');
    mask.addColorStop(0.18, 'rgba(5,7,13,0)');
    mask.addColorStop(0.36, 'rgba(5,7,13,0.72)');
    mask.addColorStop(0.50, 'rgba(5,7,13,0.82)');
    mask.addColorStop(0.64, 'rgba(5,7,13,0.72)');
    mask.addColorStop(0.82, 'rgba(5,7,13,0)');
    mask.addColorStop(1, 'rgba(5,7,13,0)');
    bx.fillStyle = mask;
    bx.fillRect(0, 0, w, horizon);

    /* bottom vignette so the grid doesn't shout */
    var vig = bx.createLinearGradient(0, horizon, 0, h);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.35)');
    bx.fillStyle = vig;
    bx.fillRect(0, horizon, w, h - horizon);
  }

  function drawBuilding(g, b, flickerOnly) {
    if (!flickerOnly) {
      g.fillStyle = b.body;
      g.fillRect(b.x, b.y, b.w, b.h);
      /* left cyan / right red micro rim on nearer buildings */
      if (b.layer > 0) {
        g.fillStyle = 'rgba(0,240,255,0.18)';
        g.fillRect(b.x, b.y, 1, b.h);
        g.fillStyle = 'rgba(255,30,60,0.16)';
        g.fillRect(b.x + b.w - 1, b.y, 1, b.h);
      }
      /* roof */
      if (b.roofBar) {
        g.fillStyle = 'rgba(255,212,0,0.35)';
        g.fillRect(b.x + 2, b.y, b.w - 4, 1.5);
      }
      if (b.antenna) {
        var ax = b.x + b.w * 0.7;
        g.strokeStyle = 'rgba(200,210,230,0.7)';
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(ax, b.y); g.lineTo(ax, b.y - 16 - (b.layer * 6)); g.stroke();
        g.fillStyle = (b.layer === 2) ? RED : CYAN;
        g.fillRect(ax - 1, b.y - 16 - (b.layer * 6) - 2, 2, 2);
      }
      if (b.dish) {
        g.strokeStyle = 'rgba(0,240,255,0.5)';
        g.lineWidth = 1;
        g.beginPath();
        g.arc(b.x + 8, b.y + 2, 5, Math.PI, 0);
        g.stroke();
      }
      if (b.spire) {
        var sx = b.x + b.w * 0.5;
        g.fillStyle = 'rgba(180,200,230,0.8)';
        g.beginPath();
        g.moveTo(sx - 3, b.y); g.lineTo(sx, b.y - 22 - b.layer * 8); g.lineTo(sx + 3, b.y);
        g.fill();
        g.fillStyle = YEL;
        g.fillRect(sx - 1, b.y - 24 - b.layer * 8, 2, 2);
      }
      if (b.neon) {
        g.fillStyle = b.neon;
        g.globalAlpha = 0.7;
        g.fillRect(b.x + 2, b.y + 4, 2, b.h - 8);
        g.globalAlpha = 0.35;
        g.fillRect(b.x + 1, b.y + 4, 4, b.h - 8);
        g.globalAlpha = 1;
      }
      if (b.sign) drawSign(g, b, b.sign);
    }
    /* windows (static on-state baked; live flicker drawn later) */
    if (!flickerOnly) {
      var ws = b.windows;
      for (var i = 0; i < ws.length; i++) {
        var win = ws[i];
        if (!win.on) continue;
        g.fillStyle = win.col;
        g.globalAlpha = 0.7;
        g.fillRect(win.x, win.y, win.w, win.h);
      }
      g.globalAlpha = 1;
    }
  }

  function drawSign(g, b, spec) {
    var pad = 5;
    var sx = b.x + pad, sy = b.y + 10, sw = b.w - pad * 2;
    if (sw < 28) return;
    if (spec.kind === 'logo' && logoOk && logoImg) {
      var sh = Math.min(b.h * 0.36, sw * (logoImg.height / logoImg.width) + 12, 90);
      g.fillStyle = 'rgba(0,0,0,0.82)';
      g.fillRect(sx, sy, sw, sh);
      g.strokeStyle = YEL;
      g.lineWidth = 2;
      g.strokeRect(sx + 0.5, sy + 0.5, sw - 1, sh - 1);
      g.strokeStyle = 'rgba(0,240,255,0.7)';
      g.lineWidth = 1;
      g.strokeRect(sx + 3.5, sy + 3.5, sw - 7, sh - 7);
      var iw = sw - 12, ih = sh - 12;
      var ar = logoImg.width / logoImg.height;
      var dw = iw, dh = dw / ar;
      if (dh > ih) { dh = ih; dw = dh * ar; }
      g.drawImage(logoImg, sx + (sw - dw) / 2, sy + (sh - dh) / 2, dw, dh);
      return;
    }
    if (spec.kind === 'logo') {
      /* logo not loaded yet — placeholder, rebake on load */
      spec = { kind: 'text', text: 'MR. TOASTY', col: YEL, lines: ['MR. TOASTY'] };
    }
    if (spec.kind === 'toaster') {
      var tw = Math.min(sw - 6, 64), th = 30;
      var tx = sx + (sw - tw) / 2, ty = sy + 4;
      g.fillStyle = 'rgba(0,0,0,0.7)';
      g.fillRect(tx - 6, ty - 2, tw + 12, th + 22);
      g.strokeStyle = YEL;
      g.lineWidth = 2;
      g.strokeRect(tx, ty + 8, tw, th - 8);
      g.beginPath();
      g.moveTo(tx + 8, ty + 8); g.lineTo(tx + 8, ty + 2);
      g.moveTo(tx + tw - 8, ty + 8); g.lineTo(tx + tw - 8, ty + 2);
      g.stroke();
      g.strokeStyle = CYAN;
      g.beginPath();
      g.moveTo(tx + tw, ty + 16); g.lineTo(tx + tw + 7, ty + 16); g.stroke();
      neonText(g, 'TOASTER', sx + sw / 2, ty + th + 6, YEL, sw - 4, 13);
      return;
    }
    if (spec.kind === 'skull') {
      var cx0 = sx + sw / 2, cy0 = sy + 20;
      g.fillStyle = 'rgba(0,0,0,0.7)';
      g.fillRect(cx0 - 22, cy0 - 18, 44, 46);
      g.strokeStyle = YEL;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(cx0, cy0, 15, 13, 0, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = YEL;
      g.beginPath(); g.ellipse(cx0 - 6, cy0 - 1, 3, 3.4, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(cx0 + 6, cy0 - 1, 3, 3.4, 0, 0, Math.PI * 2); g.fill();
      g.beginPath();
      g.moveTo(cx0, cy0 + 3); g.lineTo(cx0 - 3, cy0 + 8); g.lineTo(cx0 + 3, cy0 + 8); g.closePath();
      g.fill();
      g.strokeStyle = CYAN;
      g.lineWidth = 1.4;
      for (var k = -2; k <= 2; k++) {
        g.beginPath(); g.moveTo(cx0 + k * 4, cy0 + 11); g.lineTo(cx0 + k * 4, cy0 + 16); g.stroke();
      }
      return;
    }
    /* neon text, maybe stacked */
    var lines = spec.lines || [spec.text];
    var size = sw > 130 ? 16 : sw > 90 ? 14 : sw > 60 ? 12 : 10;
    neonTextBlock(g, lines, sx + sw / 2, sy + 6, spec.col, sw - 4, size);
  }

  function neonText(g, label, x, y, col, maxW, size) {
    g.font = 'bold ' + size + 'px ui-monospace,SFMono-Regular,Menlo,monospace';
    g.textAlign = 'center';
    g.textBaseline = 'top';
    while (size > 8 && g.measureText(label).width > maxW) {
      size--; g.font = 'bold ' + size + 'px ui-monospace,SFMono-Regular,Menlo,monospace';
    }
    var tw2 = g.measureText(label).width + 10;
    g.fillStyle = 'rgba(0,0,0,0.7)';
    g.fillRect(x - tw2 / 2, y - 3, tw2, size + 8);
    g.fillStyle = col;
    g.globalAlpha = 0.4;
    g.fillText(label, x + 1, y);
    g.fillText(label, x - 1, y);
    g.globalAlpha = 1;
    g.fillText(label, x, y);
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
  }
  function neonTextBlock(g, lines, x, y, col, maxW, size) {
    for (var i = 0; i < lines.length; i++) {
      neonText(g, lines[i], x, y + i * (size + 5), col, maxW, size);
    }
  }

  /* ---------- per-frame actors ---------- */
  function drawFlicker(g, t) {
    var bs = city.buildings;
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (b.layer === 0) continue;
      var ws = b.windows;
      for (var j = 0; j < ws.length; j++) {
        var win = ws[j];
        var pulse = 0.5 + 0.5 * Math.sin(t * win.rate + win.ph);
        var lit = win.on ? (pulse > 0.08) : (pulse > 0.93);
        if (!lit) continue;
        g.fillStyle = win.col;
        g.globalAlpha = win.on ? (0.35 + pulse * 0.5) : 0.7;
        g.fillRect(win.x, win.y, win.w, win.h);
      }
    }
    g.globalAlpha = 1;
  }

  function drawToast(g, o, t) {
    var x = o.x, y = o.y + Math.sin(t * 0.6 + o.ph) * 8;
    var s = o.s;
    g.save();
    g.translate(x, y);
    g.rotate(o.ph + t * o.spin);
    g.globalAlpha = 0.72;
    g.strokeStyle = CYAN;
    g.lineWidth = 1.2;
    g.beginPath();
    /* slice with a bite */
    g.moveTo(-s, -s * 0.7);
    g.lineTo(s * 0.4, -s * 0.7);
    g.arc(s * 0.55, -s * 0.15, s * 0.4, -1.2, 1.2);
    g.lineTo(s, s * 0.7);
    g.lineTo(-s, s * 0.7);
    g.closePath();
    g.stroke();
    g.strokeStyle = YEL;
    g.globalAlpha = 0.45;
    g.stroke();
    /* scanlines */
    g.clip();
    g.strokeStyle = 'rgba(0,240,255,0.35)';
    g.lineWidth = 1;
    for (var i = -s; i < s; i += 3) {
      g.beginPath(); g.moveTo(-s, i); g.lineTo(s, i); g.stroke();
    }
    g.restore();
  }

  function drawCar(g, c) {
    var x = c.x, y = c.y, s = c.s, dir = c.v > 0 ? 1 : -1;
    g.save();
    g.translate(x, y);
    g.scale(dir, 1);
    g.globalAlpha = 0.85;
    /* body */
    g.fillStyle = c.col;
    g.beginPath();
    g.moveTo(-s, 0); g.lineTo(-s * 0.4, -s * 0.35); g.lineTo(s * 0.5, -s * 0.35); g.lineTo(s, 0);
    g.lineTo(s * 0.7, s * 0.15); g.lineTo(-s * 0.7, s * 0.15);
    g.closePath();
    g.fill();
    /* headlight */
    g.fillStyle = '#fff';
    g.globalAlpha = 0.9;
    g.fillRect(s - 1, -2, 3, 2);
    /* trail */
    var grad = g.createLinearGradient(-s * 3, 0, -s, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, c.col);
    g.globalAlpha = 0.35;
    g.fillStyle = grad;
    g.fillRect(-s * 3, -1.5, s * 2, 3);
    g.restore();
  }

  function drawCybertruck(g, p, dir, y) {
    var w = vw;
    var x = dir > 0 ? mix(-160, w + 160, p) : mix(w + 160, -160, p);
    var sc = Math.max(1.35, Math.min(1.85, (w / 1440) * 1.5));
    g.save();
    g.translate(x, y);
    g.scale(dir * sc, sc);
    /* glitch trail */
    var trail = g.createLinearGradient(-180, 0, -40, 0);
    trail.addColorStop(0, 'rgba(255,212,0,0)');
    trail.addColorStop(0.6, 'rgba(255,212,0,0.18)');
    trail.addColorStop(1, 'rgba(0,240,255,0.28)');
    g.fillStyle = trail;
    g.fillRect(-180, -10, 140, 20);
    /* chromatic afterimages */
    g.globalAlpha = 0.35;
    g.fillStyle = RED;
    g.beginPath();
    pathTruck(g, -6, 1); g.fill();
    g.fillStyle = CYAN;
    g.beginPath();
    pathTruck(g, 5, 1); g.fill();
    g.globalAlpha = 1;
    /* body */
    g.fillStyle = '#1a1d24';
    g.beginPath(); pathTruck(g, 0, 1); g.fill();
    g.strokeStyle = YEL;
    g.lineWidth = 1.4;
    g.beginPath(); pathTruck(g, 0, 1); g.stroke();
    /* canopy slash */
    g.strokeStyle = CYAN;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(8, -16); g.lineTo(38, -16); g.stroke();
    /* headlights */
    g.fillStyle = '#e8ffff';
    g.fillRect(62, -6, 8, 3);
    g.fillStyle = CYAN;
    g.globalAlpha = 0.7;
    g.fillRect(62, -6, 14, 3);
    /* taillights */
    g.globalAlpha = 1;
    g.fillStyle = RED;
    g.fillRect(-68, -6, 7, 3);
    /* underglow */
    g.globalAlpha = 0.55;
    g.fillStyle = YEL;
    g.fillRect(-50, 10, 100, 2);
    g.restore();
  }
  function pathTruck(g, ox, s) {
    /* angular Cybertruck silhouette, pointing +x */
    g.moveTo(ox - 70 * s, 8 * s);
    g.lineTo(ox - 70 * s, -4 * s);
    g.lineTo(ox - 10 * s, -10 * s);
    g.lineTo(ox + 8 * s, -22 * s);
    g.lineTo(ox + 44 * s, -22 * s);
    g.lineTo(ox + 70 * s, -4 * s);
    g.lineTo(ox + 70 * s, 8 * s);
    g.lineTo(ox + 58 * s, 12 * s);
    g.lineTo(ox + 46 * s, 8 * s);
    g.lineTo(ox - 46 * s, 8 * s);
    g.lineTo(ox - 58 * s, 12 * s);
    g.closePath();
  }

  function stepActors(dt, t) {
    var w = vw, h = vh, horizon = city.horizon;
    var i, o;
    for (i = 0; i < rain.length; i++) {
      o = rain[i];
      o.y += o.vy * dt;
      o.x += 18 * dt;
      if (o.y > h + 20) { o.y = -10; o.x = (o.x % w + w) % w; }
      if (o.x > w) o.x -= w;
    }
    for (i = 0; i < embers.length; i++) {
      o = embers[i];
      o.y += o.vy * dt;
      o.life += dt * 0.25;
      if (o.y < horizon * 0.35 || o.life > 1) {
        o.y = mix(horizon - 40, h, Math.random());
        o.x = Math.random() * w;
        o.life = 0;
      }
    }
    for (i = 0; i < cars.length; i++) {
      o = cars[i];
      o.x += o.v * dt;
      if (o.v > 0 && o.x > w + 40) o.x = -40;
      if (o.v < 0 && o.x < -40) o.x = w + 40;
    }
    /* truck schedule */
    if (forceTruck >= 0) {
      truck.on = true; truck.p = forceTruck;
    } else {
      if (truck.on) {
        truck.p += dt / 3.2;
        if (truck.p >= 1) { truck.on = false; truck.p = 0; truck.wait = 12 + Math.random() * 10; truck.dir *= -1; }
      } else {
        truck.wait -= dt;
        if (truck.wait <= 0) { truck.on = true; truck.p = 0; }
      }
    }
    /* rare glitch */
    if (glitch.on > 0) glitch.on -= dt;
    else if (Math.random() < dt * 0.12) {
      glitch.on = 0.08 + Math.random() * 0.08;
      glitch.x = Math.random() * w * 0.3;
      if (Math.random() < 0.5) glitch.x = w * 0.7 + Math.random() * w * 0.3;
      glitch.w = 16 + Math.random() * 50;
    }
  }

  function drawActors(g, t) {
    var i, o;
    /* rain */
    g.lineWidth = 1;
    for (i = 0; i < rain.length; i++) {
      o = rain[i];
      g.strokeStyle = 'rgba(0,240,255,' + o.a.toFixed(3) + ')';
      g.beginPath(); g.moveTo(o.x, o.y); g.lineTo(o.x - 1.2, o.y + o.len); g.stroke();
    }
    /* embers */
    for (i = 0; i < embers.length; i++) {
      o = embers[i];
      g.globalAlpha = 0.25 + 0.55 * Math.sin(o.life * 3.14);
      g.fillStyle = o.col;
      g.fillRect(o.x, o.y, o.r, o.r);
    }
    g.globalAlpha = 1;
    for (i = 0; i < toasts.length; i++) drawToast(g, toasts[i], t);
    for (i = 0; i < cars.length; i++) drawCar(g, cars[i]);
    if (truck.on) drawCybertruck(g, truck.p, truck.dir, truck.y);
  }

  function drawGlitch(g) {
    if (glitch.on <= 0) return;
    var x = glitch.x, ww = glitch.w, h = vh;
    g.save();
    g.globalCompositeOperation = 'screen';
    g.fillStyle = 'rgba(255,30,60,0.18)';
    g.fillRect(x - 4, 0, ww, h);
    g.fillStyle = 'rgba(0,240,255,0.16)';
    g.fillRect(x + 4, 0, ww, h);
    g.restore();
  }

  /* ---------- frame / loop ---------- */
  function protectText(g) {
    var nodes = D.querySelectorAll('h1,h2,h3,h4,h5');
    if (!nodes.length) return;
    var ox = W.innerWidth * 0.04, oy = W.innerHeight * 0.04;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > W.innerHeight || r.right < 0 || r.left > W.innerWidth) continue;
      if (r.width < 12 || r.height < 8) continue;
      var x = r.x + ox - 18, y = r.y + oy - 10, rw = r.width + 36, rh = r.height + 20;
      g.fillStyle = 'rgba(5,7,13,0.55)';
      g.fillRect(x - 8, y - 6, rw + 16, rh + 12);
      g.fillStyle = 'rgba(5,7,13,0.82)';
      g.fillRect(x, y, rw, rh);
    }
  }

  function render(t, moving) {
    if (!cx || !base || !city) return;
    var t0s = performance.now();
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, vw, vh);
    cx.drawImage(base, 0, 0, vw, vh);
    if (moving) {
      drawFlicker(cx, t);
      drawActors(cx, t);
      drawGlitch(cx);
    }
    protectText(cx);
    var ms = performance.now() - t0s;
    frameMs = ms;
    frameN++;
    frameAvg = frameAvg * 0.9 + ms * 0.1;
  }

  function loop(ts) {
    raf = 0;
    if (!running || hidden || !mqDesk.matches) return;
    if (!t0) t0 = ts;
    if (!lastTs) lastTs = ts;
    var dt = Math.min(0.08, (ts - lastTs) / 1000);
    lastTs = ts;
    /* cap ~30fps */
    if (ts - (loop._lastDraw || 0) < STEP - 1) {
      raf = W.requestAnimationFrame(loop);
      return;
    }
    loop._lastDraw = ts;
    tAnim += dt;
    /* ease parallax */
    px.x += (px.tx - px.x) * 0.08;
    px.y += (px.ty - px.y) * 0.08;
    if (cv) cv.style.transform = 'translate3d(' + (-px.x * 10).toFixed(2) + 'px,' + (-px.y * 7).toFixed(2) + 'px,0)';
    stepActors(dt, tAnim);
    render(tAnim, true);
    raf = W.requestAnimationFrame(loop);
  }

  function startLoop() {
    if (running) return;
    running = true;
    hidden = !!D.hidden;
    lastTs = 0; t0 = 0; loop._lastDraw = 0;
    render(0, !mqReduce.matches && !hidden);
    if (mqReduce.matches) return;
    if (!hidden) raf = W.requestAnimationFrame(loop);
  }
  function stopLoop() {
    running = false;
    if (raf) { W.cancelAnimationFrame(raf); raf = 0; }
  }

  function rebuild() {
    if (!mqDesk.matches) { unmount(); return; }
    injectCss();
    mount();
    loadLogo();
    if (size() || !city) {
      buildCity();
      bake();
    }
    if (mqReduce.matches) {
      stopLoop();
      running = true;
      render(0, false);
    } else {
      render(tAnim || 0, true);
      if (!running) startLoop();
      else if (!raf && !hidden) raf = W.requestAnimationFrame(loop);
    }
  }

  var resizeTid = 0;
  function onResize() {
    clearTimeout(resizeTid);
    resizeTid = setTimeout(rebuild, 120);
  }

  function onMouse(e) {
    if (!running || mqReduce.matches) return;
    if (e.pointerType && e.pointerType !== 'mouse') return;
    var rw = W.innerWidth, rh = W.innerHeight;
    px.tx = (e.clientX / rw) * 2 - 1;
    px.ty = (e.clientY / rh) * 2 - 1;
  }
  function onLeave() { px.tx = 0; px.ty = 0; }

  function onVis() {
    hidden = !!D.hidden;
    if (hidden) {
      if (raf) { W.cancelAnimationFrame(raf); raf = 0; }
    } else if (running && mqDesk.matches && !mqReduce.matches) {
      lastTs = 0; loop._lastDraw = 0;
      raf = W.requestAnimationFrame(loop);
    }
  }

  function bind() {
    W.addEventListener('resize', onResize, { passive: true });
    D.addEventListener('visibilitychange', onVis);
    D.addEventListener('pointermove', onMouse, { passive: true });
    D.documentElement.addEventListener('mouseleave', onLeave);
    if (mqDesk.addEventListener) mqDesk.addEventListener('change', rebuild);
    else mqDesk.addListener(rebuild);
    if (mqReduce.addEventListener) mqReduce.addEventListener('change', rebuild);
    else mqReduce.addListener(rebuild);
  }

  W.ttHsDebug = {
    truck: function (p) { forceTruck = (p == null) ? 0.5 : +p; truck.on = forceTruck >= 0; truck.p = forceTruck; if (cx) render(tAnim, !mqReduce.matches); },
    clearTruck: function () { forceTruck = -1; },
    stats: function () { return { frameMs: +frameMs.toFixed(2), avgMs: +frameAvg.toFixed(2), frames: frameN, w: vw, h: vh, dpr: dpr, reduced: mqReduce.matches, desk: mqDesk.matches, truck: truck, logo: logoOk }; },
    bake: function () { bake(); render(tAnim, !mqReduce.matches); }
  };

  function boot() {
    bind();
    if (mqDesk.matches) rebuild();
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
