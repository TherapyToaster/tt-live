/*! tt-home-skyline v2 for therapytoaster.com Home.
   High-detail futuristic neon city in the desktop gutters, styled to match
   Home's graffiti neon wall, caution-stripe cards, and RGB glitch aesthetic.
   Desktop only (>=1024px), single visible canvas, pre-rendered parallax layers,
   ~30fps cap, DPR cap, pauses when hidden, static frame for reduced motion.
*/
(function (W, D) {
  if (W.ttHsRun) return;
  W.ttHsRun = 1;

  var YEL = '#FFD400', CYAN = '#00F0FF', RED = '#FF1E3C', AMB = '#FF8A00';
  var MIN_W = 1024, FPS = 30, STEP = 1000 / FPS, DPR_CAP = 1.5;
  var P = (location.pathname || '/').replace(/\/+$/, '');
  if (P !== '' && P !== '/home' && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

  var mqDesk = W.matchMedia('(min-width:' + MIN_W + 'px)');
  var mqReduce = W.matchMedia('(prefers-reduced-motion: reduce)');

  var cv = null, cx = null;
  var cFar = null, xFar = null;
  var cMid = null, xMid = null;
  var cNear = null, xNear = null;
  var brickPat = null;

  var vw = 0, vh = 0, dpr = 1;
  var raf = 0, lastTs = 0, tAnim = 0, hidden = false, running = false;
  var city = null;
  var px = { x: 0, y: 0, tx: 0, ty: 0 };
  var frameMs = 0, frameAvg = 4, frameN = 0;
  var logoImg = null, logoOk = false, logoTried = false;
  var forceTruck = -1;

  var rain = [], embers = [], steam = [], cars = [], holos = [];
  var truck = { on: false, p: 0, dir: 1, y: 0, wait: 6 };
  var glitch = { on: 0, x: 0, y: 0, w: 0, h: 0, dx: 0 };

  function $(id) { return D.getElementById(id); }
  function mix(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function injectCss() {
    if ($('tt-hs-css')) return;
    var s = D.createElement('style');
    s.id = 'tt-hs-css';
    s.textContent =
      '#tt-skyline{position:fixed;left:-3%;top:-3%;width:106%;height:106%;pointer-events:none;z-index:0;display:block;contain:strict;border:0;margin:0;padding:0}' +
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
    var fl = $('tt-float-layer');
    if (fl && fl.parentNode) fl.parentNode.insertBefore(cv, fl);
    else body.insertBefore(cv, body.firstChild || null);
  }

  function unmount() {
    stopLoop();
    if (cv && cv.parentNode) cv.parentNode.removeChild(cv);
    cv = cx = cFar = xFar = cMid = xMid = cNear = xNear = city = null;
    vw = vh = 0;
  }

  function loadLogo() {
    if (logoTried) return;
    logoTried = true;
    var baseUrl = W.ttHsBase || '';
    var fallback = W.ttHsFallback || '';
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () { logoImg = img; logoOk = true; if (running) { bake(); render(tAnim, !mqReduce.matches); } };
    img.onerror = function () {
      if (!fallback || img._fb) return;
      img._fb = 1;
      img.src = fallback + 'mr-toasty-neon-logo-official.png';
    };
    img.src = baseUrl + 'mr-toasty-neon-logo-official.png';
  }

  function makeBrickPattern() {
    if (brickPat) return brickPat;
    var bc = D.createElement('canvas');
    bc.width = 32; bc.height = 16;
    var bg = bc.getContext('2d');
    bg.fillStyle = 'rgba(255,255,255,0.035)';
    bg.fillRect(0, 0, 32, 1);
    bg.fillRect(0, 8, 32, 1);
    bg.fillRect(0, 0, 1, 8);
    bg.fillRect(16, 8, 1, 8);
    bg.fillStyle = 'rgba(0,0,0,0.22)';
    bg.fillRect(2, 2, 12, 5);
    bg.fillRect(18, 10, 12, 5);
    brickPat = cx.createPattern(bc, 'repeat');
    return brickPat;
  }

  function allocLayer(c, w, h) {
    if (!c) c = D.createElement('canvas');
    c.width = w; c.height = h;
    return [c, c.getContext('2d', { alpha: true })];
  }

  function size() {
    if (!cv) return false;
    var rw = W.innerWidth, rh = W.innerHeight;
    var cssW = Math.max(1, Math.round(rw * 1.06));
    var cssH = Math.max(1, Math.round(rh * 1.06));
    var cap = rw >= 1600 ? 1.25 : DPR_CAP;
    var nd = Math.min(W.devicePixelRatio || 1, cap);
    if (cssW === vw && cssH === vh && nd === dpr && city) return false;
    vw = cssW; vh = cssH; dpr = nd;
    var pw = Math.round(cssW * dpr), ph = Math.round(cssH * dpr);
    cv.width = pw; cv.height = ph;
    cv.style.width = cssW + 'px';
    cv.style.height = cssH + 'px';
    var p;
    p = allocLayer(cFar, pw, ph); cFar = p[0]; xFar = p[1];
    p = allocLayer(cMid, pw, ph); cMid = p[0]; xMid = p[1];
    p = allocLayer(cNear, pw, ph); cNear = p[0]; xNear = p[1];
    return true;
  }

  /* ---------- architectural generation ---------- */
  function buildCity() {
    var rand = rng(0x544F4132 ^ ((vw * 17 + vh * 11) >>> 0));
    var w = vw, h = vh;
    var horizon = Math.round(h * 0.78);
    var buildings = [];
    var flickers = [];
    var vents = [];
    var holoSpots = [];

    function genWindows(b, style) {
      var x = b.x, y = b.y, bw = b.w, bh = b.h;
      var padX = b.layer === 0 ? 4 : b.layer === 1 ? 6 : 8;
      var padY = b.layer === 0 ? 8 : 12;
      var cols = Math.max(2, Math.floor((bw - padX * 2) / (b.layer === 0 ? 6 : b.layer === 1 ? 9 : 12)));
      var cellStepX = (bw - padX * 2) / cols;
      var cellW = Math.max(2, cellStepX * (style === 'glass' ? 0.78 : 0.56));
      var rowStepY = b.layer === 0 ? 6 : b.layer === 1 ? 9 : 13;
      var cellH = Math.max(2.5, rowStepY * 0.54);
      var list = [];
      var bandOff = (rand() * 4) | 0;
      var floorIdx = 0;

      for (var wy = y + padY; wy < horizon - 14; wy += rowStepY) {
        floorIdx++;
        /* mechanical dark louver floor every 7-9 floors */
        var mech = b.layer > 0 && (floorIdx + bandOff) % 8 === 0;
        if (mech) {
          b.mechBands.push(wy);
          continue;
        }
        /* cluster lit rooms across a floor rather than pure noise */
        var floorBias = rand();
        var clusterLit = floorBias > 0.35;
        var span = 0;
        var spanCol = YEL;
        for (var ci = 0; ci < cols; ci++) {
          var wx = x + padX + ci * cellStepX + (cellStepX - cellW) * 0.5;
          if (span <= 0) {
            span = 1 + ((rand() * 3) | 0);
            var ck = rand();
            spanCol = ck < 0.14 ? CYAN : ck < 0.22 ? RED : (ck < 0.36 ? AMB : YEL);
            clusterLit = rand() < (b.layer === 0 ? 0.34 : 0.44);
          }
          span--;
          var lit = clusterLit && rand() > 0.18;
          /* skip window if covered by sign zone */
          var wobj = {
            x: wx, y: wy, w: cellW, h: cellH,
            lit: lit, col: spanCol,
            warm: 0.35 + rand() * 0.55,
            blinds: b.layer === 2 && lit && rand() < 0.35,
            desk: b.layer === 2 && lit && spanCol === CYAN && rand() < 0.45,
            ph: rand() * 6.28, rate: 0.4 + rand() * 1.4,
            flick: lit && rand() < 0.14
          };
          list.push(wobj);
          if (wobj.flick && b.layer > 0) {
            flickers.push({ layer: b.layer, win: wobj });
          }
        }
      }
      return list;
    }

    function addSide(layer, side) {
      /* depth keeps middle third clear of heavy foreground */
      var depth = [0.39, 0.31, 0.23][layer] * w;
      var minW = [28, 52, 74][layer], maxW = [64, 118, 165][layer];
      var minH = [h * 0.16, h * 0.26, h * 0.38][layer];
      var maxH = [h * 0.38, h * 0.58, h * 0.74][layer];
      var bleed = Math.round(w * 0.036);
      var x = side < 0 ? bleed : w - bleed;
      var guard = 0;
      var styles = ['glass', 'brick', 'deco', 'brutal'];
      while (guard++ < 40) {
        var bw = mix(minW, maxW, rand() * 0.65 + rand() * 0.35);
        if ((side < 0 && x > depth) || (side > 0 && x < w - depth)) break;
        var bx0 = side < 0 ? x : x - bw;
        if (bx0 < bleed - 8 || bx0 + bw > w - bleed + 8) break;
        var edgeProx = side < 0 ? 1 - (bx0 + bw) / depth : 1 - (w - bx0) / depth;
        var bh = mix(minH, maxH, Math.pow(rand(), 0.72)) * mix(0.75, 1.02, clamp(edgeProx, 0, 1));
        var by = horizon - bh;
        var style = styles[(rand() * styles.length) | 0];
        if (layer === 2 && rand() < 0.45) style = 'brick';
        var baseTone = layer === 0 ? 10 : layer === 1 ? 14 : 17;
        var rT = baseTone + (style === 'brick' ? 7 : 0) + ((rand() * 5) | 0);
        var gT = baseTone + (style === 'glass' ? 3 : 1) + ((rand() * 4) | 0);
        var bT = baseTone + (style === 'glass' ? 12 : 6) + ((rand() * 6) | 0);

        /* architectural setbacks */
        var setback = null;
        if (bw > 48 && bh > h * 0.24 && rand() < 0.58) {
          var sbW = bw * mix(0.46, 0.68, rand());
          var sbH = mix(18, Math.min(54, bh * 0.2), rand());
          var sbX = bx0 + (bw - sbW) * (rand() < 0.5 ? 0.5 : (side < 0 ? 0.25 : 0.75));
          setback = { x: sbX, y: by - sbH, w: sbW, h: sbH };
        }
        var roofTopY = setback ? setback.y : by;
        var roofX = setback ? setback.x : bx0;
        var roofW = setback ? setback.w : bw;

        var b = {
          layer: layer, side: side, style: style,
          x: bx0, y: by, w: bw, h: bh,
          body: 'rgb(' + rT + ',' + gT + ',' + bT + ')',
          setback: setback,
          mechBands: [],
          waterTank: layer >= 1 && bw > 56 && rand() < 0.38,
          hvac: layer >= 1 && bw > 48 && rand() < 0.62,
          fireEscape: layer === 2 && style === 'brick' && bw > 70 && rand() < 0.75,
          spire: layer > 0 && rand() < 0.34,
          antenna: rand() < 0.45,
          dish: layer >= 1 && rand() < 0.26,
          rimCol: side < 0 ? CYAN : CYAN,
          outerRim: RED,
          roofTrim: rand() < 0.55 ? (rand() < 0.7 ? YEL : CYAN) : null,
          graffiti: layer === 2 && style === 'brick' && bw > 74 && rand() < 0.7,
          roofTopY: roofTopY, roofX: roofX, roofW: roofW,
          sign: null,
          windows: []
        };
        b.windows = genWindows(b, style);
        buildings.push(b);

        if (b.layer >= 1 && rand() < 0.45) {
          vents.push({ layer: layer, x: roofX + roofW * mix(0.25, 0.75, rand()), y: roofTopY });
        }
        if (b.layer === 2 && holoSpots.length < 2 && bx0 > 10 && bx0 + bw < w - 10) {
          holoSpots.push({ x: roofX + roofW * 0.5, y: roofTopY });
        }

        var stepGap = mix([2, 4, 6][layer], [10, 14, 18][layer], rand());
        x += side < 0 ? (bw + stepGap) : -(bw + stepGap);
      }
    }

    for (var L = 0; L < 3; L++) {
      addSide(L, -1);
      addSide(L, 1);
    }

    /* Assign Home-style billboards & neon tube signs in unobstructed side gutters */
    function inSideGutter(b) {
      var cxb = b.x + b.w / 2;
      return cxb < w * 0.33 || cxb > w * 0.67;
    }
    /* keep signs out of bottom-most 190px where Radio / Chipotle cards sit */
    var hosts = buildings.filter(function (b) {
      return b.layer >= 1 && b.w >= 62 && b.h >= h * 0.26 && b.y < horizon - 140 && inSideGutter(b);
    });
    hosts.sort(function (a, c) {
      /* prefer near layer and wider facades, alternating sides */
      return (c.layer * 10000 + c.w * 80 + c.h) - (a.layer * 10000 + a.w * 80 + a.h);
    });

    var leftHosts = hosts.filter(function (b) { return b.side < 0; });
    var rightHosts = hosts.filter(function (b) { return b.side > 0; });

    var leftCatalog = [
      { kind: 'logo-card', col: YEL },
      { kind: 'caution-card', title: 'PROUDLY', sub: 'VETERAN-OWNED', col: YEL },
      { kind: 'toaster-tube', col: YEL },
      { kind: 'neon-text', lines: ['Twitter'], col: CYAN }
    ];
    var rightCatalog = [
      { kind: 'therapy-tubes', col: YEL },
      { kind: 'skull-tube', col: YEL },
      { kind: 'caution-card', title: 'BURNT', sub: 'OFFERINGS', col: RED },
      { kind: 'neon-text', lines: ['ARTCADE'], col: CYAN }
    ];

    function assignList(list, cat) {
      var ui = 0;
      for (var i = 0; i < list.length && ui < cat.length; i++) {
        var b = list[i];
        var spec = cat[ui];
        if ((spec.kind === 'logo-card' || spec.kind === 'therapy-tubes') && b.w < 84) continue;
        b.sign = spec;
        ui++;
      }
    }
    assignList(leftHosts, leftCatalog);
    assignList(rightHosts, rightCatalog);

    city = {
      w: w, h: h, horizon: horizon,
      sunX: w * 0.5, sunY: horizon, sunR: Math.min(w, h) * 0.14,
      buildings: buildings, flickers: flickers, vents: vents, holoSpots: holoSpots
    };
    spawnActors();
  }

  function spawnActors() {
    var rand = rng(0xB4D70A57);
    var w = vw, h = vh, horizon = city.horizon;
    rain = [];
    for (var i = 0; i < 110; i++) {
      rain.push({
        x: rand() * w, y: rand() * h,
        vy: mix(320, 580, rand()), len: mix(10, 20, rand()),
        col: rand() < 0.72 ? CYAN : YEL, a: 0.10 + rand() * 0.22
      });
    }
    embers = [];
    for (i = 0; i < 42; i++) {
      embers.push({
        x: rand() * w, y: mix(horizon - 90, h, rand()),
        vy: -mix(18, 48, rand()), vx: mix(-6, 6, rand()),
        life: rand(), r: mix(1.2, 2.5, rand()),
        col: rand() < 0.28 ? RED : (rand() < 0.5 ? AMB : YEL)
      });
    }
    steam = [];
    city.vents.forEach(function (v, idx) {
      for (var k = 0; k < 3; k++) {
        steam.push({
          ox: v.x, oy: v.y, x: v.x, y: v.y - k * 14,
          r: 4 + k * 4, life: (k / 3 + idx * 0.17) % 1,
          vx: mix(6, 14, rand()), vy: -mix(16, 28, rand())
        });
      }
    });
    cars = [];
    for (i = 0; i < 5; i++) {
      cars.push({
        y: mix(h * 0.16, horizon - 110, rand()),
        x: rand() * w,
        v: mix(45, 115, rand()) * (i % 2 ? 1 : -1),
        col: i % 3 === 0 ? YEL : (i % 3 === 1 ? CYAN : RED),
        s: mix(10, 18, rand())
      });
    }
    holos = [];
    if (city.holoSpots.length) {
      city.holoSpots.forEach(function (sp, idx) {
        holos.push({ x: sp.x, y: sp.y - 46, baseY: sp.y, s: 19, ph: idx * 2.1 });
      });
    } else {
      holos.push({ x: w * 0.17, y: h * 0.34, baseY: h * 0.42, s: 20, ph: 0 });
      holos.push({ x: w * 0.83, y: h * 0.32, baseY: h * 0.40, s: 20, ph: 1.7 });
    }
    truck.wait = 5 + rand() * 3;
    truck.on = false; truck.p = 0; truck.dir = 1;
    truck.y = mix(h * 0.19, h * 0.30, rand());
  }

  /* ---------- Neon Tube & Card Helpers ---------- */
  function neonStroke(g, drawPath, col, w, alpha) {
    g.save();
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.globalCompositeOperation = 'screen';
    /* wide outer glow */
    g.strokeStyle = col;
    g.globalAlpha = (alpha || 1) * 0.24;
    g.lineWidth = w * 4.2;
    g.beginPath(); drawPath(g); g.stroke();
    /* inner saturated halo */
    g.globalAlpha = (alpha || 1) * 0.58;
    g.lineWidth = w * 2.0;
    g.beginPath(); drawPath(g); g.stroke();
    /* hot tube core */
    g.strokeStyle = col === YEL ? '#FFF7B8' : (col === CYAN ? '#DFFFFF' : '#FFD4DA');
    g.globalAlpha = (alpha || 1) * 0.95;
    g.lineWidth = Math.max(1, w * 0.72);
    g.beginPath(); drawPath(g); g.stroke();
    g.restore();
  }

  function drawCautionBar(g, x, y, w, h) {
    g.save();
    g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = '#070709';
    g.fillRect(x, y, w, h);
    g.fillStyle = YEL;
    var step = 10;
    for (var sx = x - h; sx < x + w + h; sx += step) {
      g.beginPath();
      g.moveTo(sx, y + h);
      g.lineTo(sx + 5, y + h);
      g.lineTo(sx + 5 + h, y);
      g.lineTo(sx + h, y);
      g.closePath();
      g.fill();
    }
    g.restore();
  }

  function drawChunkyFrame(g, x, y, w, h, cautionH) {
    /* RGB offset drop rims matching Home cards */
    g.save();
    g.strokeStyle = RED; g.lineWidth = 1.6;
    g.strokeRect(x - 2, y, w, h);
    g.strokeStyle = CYAN; g.lineWidth = 1.6;
    g.strokeRect(x + 2, y, w, h);
    /* dark CRT fill */
    g.fillStyle = '#040509';
    g.fillRect(x, y, w, h);
    /* subtle scanlines */
    g.fillStyle = 'rgba(255,212,0,0.045)';
    for (var sy = y + 2; sy < y + h - 2; sy += 3) {
      g.fillRect(x + 1, sy, w - 2, 1);
    }
    if (cautionH > 0) {
      drawCautionBar(g, x + 2, y + 2, w - 4, cautionH);
      drawCautionBar(g, x + 2, y + h - cautionH - 2, w - 4, cautionH);
    }
    /* main yellow border */
    g.strokeStyle = YEL; g.lineWidth = 2;
    g.strokeRect(x, y, w, h);
    g.restore();
  }

  function neonTubeText(g, text, cx0, y, size, col, maxW) {
    g.save();
    g.font = '900 ' + size + 'px "Arial Black",Impact,ui-sans-serif,system-ui,sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'top';
    while (size > 7 && g.measureText(text).width > maxW) {
      size--;
      g.font = '900 ' + size + 'px "Arial Black",Impact,ui-sans-serif,system-ui,sans-serif';
    }
    g.globalCompositeOperation = 'screen';
    /* outer glow */
    g.fillStyle = col;
    g.shadowColor = col;
    g.shadowBlur = 14;
    g.globalAlpha = 0.65;
    g.fillText(text, cx0, y);
    /* crisp neon stroke + bright core */
    g.shadowBlur = 6;
    g.globalAlpha = 0.92;
    g.lineWidth = 2.2;
    g.strokeStyle = col;
    g.strokeText(text, cx0, y);
    g.shadowBlur = 0;
    g.fillStyle = col === YEL ? '#FFF6B0' : (col === CYAN ? '#D8FFFF' : '#FFD6DC');
    g.globalAlpha = 0.95;
    g.fillText(text, cx0, y);
    g.restore();
    return size;
  }

  /* ---------- Building Architectural Details ---------- */
  function drawBuilding(g, b) {
    var x = b.x, y = b.y, w = b.w, h = b.h;
    var horizon = y + h;

    /* setback crown */
    if (b.setback) {
      var sb = b.setback;
      g.fillStyle = b.body;
      g.fillRect(sb.x, sb.y, sb.w, sb.h + 2);
      if (b.layer === 2 && brickPat) {
        g.fillStyle = brickPat;
        g.fillRect(sb.x, sb.y, sb.w, sb.h);
      }
      g.fillStyle = 'rgba(255,212,0,0.22)';
      g.fillRect(sb.x, sb.y, sb.w, 1.5);
    }

    /* main body */
    g.fillStyle = b.body;
    g.fillRect(x, y, w, h);

    /* facade texture */
    if (b.style === 'brick' && b.layer >= 1) {
      var pat = makeBrickPattern();
      if (pat) {
        g.fillStyle = pat;
        g.fillRect(x, y, w, h);
      }
      /* subtle pilaster vertical brick columns */
      g.fillStyle = 'rgba(0,0,0,0.26)';
      g.fillRect(x + 3, y, 3, h);
      g.fillRect(x + w - 6, y, 3, h);
    } else if (b.style === 'glass') {
      /* vertical curtain-wall sheen & mullions */
      var gg = g.createLinearGradient(x, y, x + w, y + h * 0.6);
      gg.addColorStop(0, 'rgba(0,240,255,0.06)');
      gg.addColorStop(0.5, 'rgba(255,255,255,0.02)');
      gg.addColorStop(1, 'rgba(255,30,60,0.04)');
      g.fillStyle = gg;
      g.fillRect(x, y, w, h);
      g.fillStyle = 'rgba(0,0,0,0.34)';
      var mull = b.layer === 0 ? 8 : 12;
      for (var mx = x + mull; mx < x + w - 4; mx += mull) {
        g.fillRect(mx, y + 6, 1, h - 6);
      }
    } else if (b.style === 'deco') {
      /* art-deco vertical fluting */
      g.fillStyle = 'rgba(255,212,0,0.04)';
      for (var fx = x + 6; fx < x + w - 6; fx += 9) {
        g.fillRect(fx, y + 8, 2, h - 8);
      }
    }

    /* horizontal cornice & mechanical louver bands */
    g.fillStyle = 'rgba(255,255,255,0.07)';
    g.fillRect(x, y, w, 2);
    if (b.mechBands.length) {
      g.fillStyle = 'rgba(0,0,0,0.48)';
      for (var mi = 0; mi < b.mechBands.length; mi++) {
        var my = b.mechBands[mi];
        g.fillRect(x + 2, my, w - 4, 6);
        g.fillStyle = 'rgba(0,240,255,0.12)';
        g.fillRect(x + 2, my, w - 4, 1);
        g.fillStyle = 'rgba(0,0,0,0.48)';
      }
    }

    /* windows */
    for (var wi = 0; wi < b.windows.length; wi++) {
      var win = b.windows[wi];
      if (!win.lit) {
        /* dark glass pane with faint sky reflection */
        g.fillStyle = b.style === 'glass' ? 'rgba(18,28,46,0.62)' : 'rgba(4,5,10,0.75)';
        g.fillRect(win.x, win.y, win.w, win.h);
        if (b.layer >= 1) {
          g.fillStyle = 'rgba(120,170,220,0.08)';
          g.fillRect(win.x, win.y, win.w, 1);
        }
        continue;
      }
      g.save();
      g.fillStyle = win.col;
      g.globalAlpha = win.warm * (b.layer === 0 ? 0.55 : 0.78);
      g.fillRect(win.x, win.y, win.w, win.h);
      if (win.blinds) {
        g.fillStyle = 'rgba(0,0,0,0.45)';
        g.globalAlpha = 0.6;
        g.fillRect(win.x, win.y, win.w, win.h * 0.45);
        g.fillRect(win.x, win.y + win.h * 0.65, win.w, 1);
      }
      if (win.desk) {
        /* little dark monitor/person silhouette inside lit cyan room */
        g.fillStyle = 'rgba(5,7,14,0.85)';
        g.globalAlpha = 0.85;
        g.fillRect(win.x + win.w * 0.25, win.y + win.h * 0.45, win.w * 0.4, win.h * 0.55);
      }
      g.restore();
    }

    /* edge rim-lighting (cyan inner edge, red/amber outer edge) */
    if (b.layer >= 1) {
      var innerX = b.side < 0 ? x + w - 1.5 : x;
      var outerX = b.side < 0 ? x : x + w - 1.5;
      g.fillStyle = 'rgba(0,240,255,0.36)';
      g.fillRect(innerX, y, 1.5, h);
      g.fillStyle = 'rgba(255,30,60,0.22)';
      g.fillRect(outerX, y, 1.5, h);
    }

    /* rooftop details */
    var rx = b.roofX, ry = b.roofTopY, rw = b.roofW;
    if (b.roofTrim) {
      g.fillStyle = b.roofTrim;
      g.globalAlpha = 0.65;
      g.fillRect(rx + 2, ry, rw - 4, 2);
      g.globalAlpha = 1;
    }
    if (b.hvac) {
      var hw = Math.min(18, rw * 0.28), hh = 8;
      var hx = rx + rw * 0.18;
      g.fillStyle = '#181c26';
      g.fillRect(hx, ry - hh, hw, hh);
      g.strokeStyle = 'rgba(0,240,255,0.35)';
      g.lineWidth = 1;
      g.strokeRect(hx, ry - hh, hw, hh);
      /* louver ticks */
      g.fillStyle = '#07080d';
      g.fillRect(hx + 3, ry - hh + 2, hw - 6, 2);
      g.fillRect(hx + 3, ry - hh + 5, hw - 6, 1.5);
    }
    if (b.waterTank) {
      var tx = rx + rw * 0.64, tw = 16, th = 16;
      /* steel stilts */
      g.strokeStyle = 'rgba(130,145,170,0.65)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(tx + 2, ry); g.lineTo(tx + 4, ry - 9);
      g.moveTo(tx + tw - 2, ry); g.lineTo(tx + tw - 4, ry - 9);
      g.moveTo(tx + 3, ry - 5); g.lineTo(tx + tw - 3, ry - 5);
      g.stroke();
      /* barrel + cone roof */
      g.fillStyle = '#241b17';
      g.fillRect(tx, ry - 9 - th, tw, th);
      g.strokeStyle = 'rgba(255,212,0,0.45)';
      g.strokeRect(tx, ry - 9 - th, tw, 1);
      g.strokeRect(tx, ry - 9 - th * 0.45, tw, 1);
      g.fillStyle = '#191c24';
      g.beginPath();
      g.moveTo(tx - 2, ry - 9 - th);
      g.lineTo(tx + tw * 0.5, ry - 15 - th);
      g.lineTo(tx + tw + 2, ry - 9 - th);
      g.closePath();
      g.fill();
    }
    if (b.spire) {
      var sx = rx + rw * 0.5;
      var sh = 24 + b.layer * 10;
      g.fillStyle = '#1b202c';
      g.beginPath();
      g.moveTo(sx - 5, ry); g.lineTo(sx, ry - sh); g.lineTo(sx + 5, ry);
      g.closePath();
      g.fill();
      g.fillStyle = RED;
      g.fillRect(sx - 1.5, ry - sh - 3, 3, 3);
      g.fillStyle = 'rgba(255,30,60,0.35)';
      g.beginPath(); g.arc(sx, ry - sh - 1.5, 6, 0, Math.PI * 2); g.fill();
    } else if (b.antenna) {
      var ax = rx + rw * 0.72;
      var ah = 14 + b.layer * 6;
      g.strokeStyle = 'rgba(180,200,225,0.65)';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(ax, ry); g.lineTo(ax, ry - ah); g.stroke();
      g.fillStyle = CYAN;
      g.fillRect(ax - 1, ry - ah - 2, 2, 2);
    }
    if (b.dish) {
      var dx = rx + rw * 0.36;
      g.strokeStyle = 'rgba(0,240,255,0.55)';
      g.lineWidth = 1.2;
      g.beginPath(); g.arc(dx, ry - 2, 6, Math.PI, 0); g.stroke();
      g.beginPath(); g.moveTo(dx, ry - 2); g.lineTo(dx + 2, ry - 9); g.stroke();
    }

    /* zigzag fire escape on foreground brick buildings */
    if (b.fireEscape) {
      drawFireEscape(g, b);
    }

    /* spray graffiti tag on lower foreground wall */
    if (b.graffiti) {
      drawWallGraffiti(g, b);
    }

    /* signage */
    if (b.sign) {
      drawSign(g, b, b.sign);
    }
  }

  function drawFireEscape(g, b) {
    var fx = b.side < 0 ? b.x + b.w - 30 : b.x + 8;
    var fw = 22;
    g.save();
    var startY = b.y + 68;
    var endY = b.y + b.h - 26;
    var dir = 1;
    for (var ly = startY; ly < endY; ly += 26) {
      /* railing + cyan rim */
      g.fillStyle = 'rgba(8,10,15,0.75)';
      g.fillRect(fx, ly, fw, 7);
      g.strokeStyle = 'rgba(120,145,175,0.52)';
      g.lineWidth = 1.2;
      g.strokeRect(fx, ly, fw, 7);
      /* vertical pickets */
      g.beginPath();
      for (var px0 = fx + 4; px0 < fx + fw - 2; px0 += 4) {
        g.moveTo(px0, ly); g.lineTo(px0, ly + 7);
      }
      g.stroke();
      /* zigzag stair */
      if (ly + 26 < endY) {
        g.strokeStyle = 'rgba(0,240,255,0.38)';
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(dir > 0 ? fx + 3 : fx + fw - 3, ly + 7);
        g.lineTo(dir > 0 ? fx + fw - 3 : fx + 3, ly + 26);
        g.stroke();
      }
      dir *= -1;
    }
    g.restore();
  }

  function drawWallGraffiti(g, b) {
    var gx = b.x + 12, gy = b.y + b.h - 68, gw = Math.min(b.w - 24, 96);
    if (gw < 46) return;
    g.save();
    /* dark sprayed under-blob */
    g.fillStyle = 'rgba(0,0,0,0.45)';
    g.fillRect(gx - 4, gy - 6, gw + 8, 36);
    /* halo swoosh like top wall */
    neonStroke(g, function (c) {
      c.ellipse(gx + gw * 0.5, gy + 3, gw * 0.34, 5, -0.1, 0, Math.PI * 2);
    }, YEL, 1.4, 0.72);
    /* spray tag */
    g.font = 'italic 900 13px Impact,"Arial Black",sans-serif';
    g.textAlign = 'center';
    g.globalAlpha = 0.78;
    var tagWord = (Math.round(b.x) % 2 === 0) ? 'MR.TOASTY' : 'TOASTED';
    g.fillStyle = CYAN;
    g.fillText(tagWord, gx + gw * 0.5 - 1, gy + 21);
    g.fillStyle = RED;
    g.fillText(tagWord, gx + gw * 0.5 + 1, gy + 21);
    g.fillStyle = YEL;
    g.fillText(tagWord, gx + gw * 0.5, gy + 21);
    /* spray drips */
    g.fillStyle = YEL;
    g.globalAlpha = 0.5;
    g.fillRect(gx + 14, gy + 22, 1.5, 11);
    g.fillRect(gx + gw - 18, gy + 22, 1.5, 8);
    g.restore();
  }

  /* ---------- Signage (Home Style: Neon Tubes + Caution Cards + Official Logo) ---------- */
  function drawSign(g, b, spec) {
    var pad = 6;
    var sx = b.x + pad, sy = b.y + 14, sw = b.w - pad * 2;
    if (sw < 42) return;

    /* mounting struts */
    g.fillStyle = '#090b10';
    g.fillRect(sx + 6, sy - 4, 3, 6);
    g.fillRect(sx + sw - 9, sy - 4, 3, 6);

    if (spec.kind === 'logo-card') {
      var cw = Math.max(sw, 118);
      var bleedM = Math.round(vw * 0.036) + 4;
      var cx0 = b.side < 0 ? Math.max(bleedM, sx - (cw - sw) * 0.25) : Math.min(vw - cw - bleedM, sx - (cw - sw) * 0.75);
      var ch = logoOk && logoImg ? Math.round(cw * (logoImg.height / logoImg.width)) + 26 : 64;
      drawChunkyFrame(g, cx0, sy, cw, ch, 5);
      if (logoOk && logoImg) {
        var iw = cw - 14, ih = ch - 20;
        var ar = logoImg.width / logoImg.height;
        var dw = iw, dh = dw / ar;
        if (dh > ih) { dh = ih; dw = dh * ar; }
        g.drawImage(logoImg, cx0 + (cw - dw) * 0.5, sy + (ch - dh) * 0.5, dw, dh);
      } else {
        neonTubeText(g, 'MR. TOASTY', cx0 + cw * 0.5, sy + 20, 15, YEL, cw - 12);
      }
      return;
    }

    if (spec.kind === 'caution-card') {
      var bleedM = Math.round(vw * 0.036) + 4;
      var bw = Math.max(sw, 118);
      var bx0 = b.side < 0 ? Math.max(bleedM, sx - (bw - sw) * 0.2) : Math.min(vw - bw - bleedM, sx - (bw - sw) * 0.8);
      var bh = 54;
      drawChunkyFrame(g, bx0, sy, bw, bh, 5);
      neonTubeText(g, spec.title, bx0 + bw * 0.5, sy + 12, 11, spec.col, bw - 16);
      neonTubeText(g, spec.sub, bx0 + bw * 0.5, sy + 28, 10, YEL, bw - 16);
      return;
    }

    if (spec.kind === 'therapy-tubes') {
      /* matches header graffiti wall alternating blue/red/yellow neon tubes */
      var tw = Math.max(sw, 120);
      var bleedM2 = Math.round(vw * 0.036) + 4;
      var tx0 = b.side < 0 ? Math.max(bleedM2, sx - (tw - sw) * 0.2) : Math.min(vw - tw - bleedM2, sx - (tw - sw) * 0.8);
      g.fillStyle = 'rgba(4,6,12,0.86)';
      g.fillRect(tx0, sy, tw, 46);
      g.strokeStyle = 'rgba(0,240,255,0.45)';
      g.lineWidth = 1.2;
      g.strokeRect(tx0, sy, tw, 46);
      drawTubeWord(g, 'THERAPY', tx0 + tw * 0.5, sy + 6, 15, [CYAN, RED, YEL, CYAN, CYAN, RED, CYAN]);
      drawTubeWord(g, 'TOASTER', tx0 + tw * 0.5, sy + 24, 15, [CYAN, CYAN, RED, CYAN, YEL, RED, CYAN]);
      return;
    }

    if (spec.kind === 'toaster-tube') {
      var ttw = Math.min(sw, 76), tth = 54;
      var ttx = sx + (sw - ttw) * 0.5;
      g.fillStyle = 'rgba(4,5,10,0.82)';
      g.fillRect(ttx - 6, sy, ttw + 12, tth);
      g.strokeStyle = 'rgba(255,212,0,0.4)';
      g.strokeRect(ttx - 6, sy, ttw + 12, tth);
      /* glowing neon toaster outline + toast slices + lever */
      neonStroke(g, function (c) {
        var bx = ttx + 10, by = sy + 16, w0 = ttw - 20, h0 = 20;
        c.roundRect ? c.roundRect(bx, by, w0, h0, 4) : c.rect(bx, by, w0, h0);
        c.moveTo(bx + 7, by); c.lineTo(bx + 7, by - 7); c.lineTo(bx + 17, by - 7); c.lineTo(bx + 17, by);
        c.moveTo(bx + w0 - 17, by); c.lineTo(bx + w0 - 17, by - 7); c.lineTo(bx + w0 - 7, by - 7); c.lineTo(bx + w0 - 7, by);
      }, YEL, 1.5, 0.95);
      neonStroke(g, function (c) {
        var bx = ttx + 10, by = sy + 16, w0 = ttw - 20;
        c.moveTo(bx + w0, by + 9); c.lineTo(bx + w0 + 7, by + 9);
      }, CYAN, 1.4, 0.95);
      neonTubeText(g, 'TOASTED', sx + sw * 0.5, sy + 40, 9, CYAN, ttw + 6);
      return;
    }

    if (spec.kind === 'skull-tube') {
      var cx1 = sx + sw * 0.5, cy1 = sy + 24;
      g.fillStyle = 'rgba(4,5,10,0.82)';
      g.fillRect(cx1 - 26, sy, 52, 50);
      g.strokeStyle = 'rgba(255,30,60,0.5)';
      g.strokeRect(cx1 - 26, sy, 52, 50);
      neonStroke(g, function (c) {
        c.ellipse(cx1, cy1, 15, 13, 0, 0, Math.PI * 2);
        c.moveTo(cx1 - 9, cy1 + 12); c.lineTo(cx1 - 9, cy1 + 19); c.lineTo(cx1 + 9, cy1 + 19); c.lineTo(cx1 + 9, cy1 + 12);
      }, YEL, 1.6, 0.95);
      /* x_x eyes */
      neonStroke(g, function (c) {
        c.moveTo(cx1 - 8, cy1 - 4); c.lineTo(cx1 - 3, cy1 + 1);
        c.moveTo(cx1 - 3, cy1 - 4); c.lineTo(cx1 - 8, cy1 + 1);
        c.moveTo(cx1 + 3, cy1 - 4); c.lineTo(cx1 + 8, cy1 + 1);
        c.moveTo(cx1 + 8, cy1 - 4); c.lineTo(cx1 + 3, cy1 + 1);
      }, CYAN, 1.2, 0.95);
      return;
    }

    /* neon text sign */
    var lines = spec.lines || ['Twitter'];
    var nw = Math.max(sw, 76);
    var nx = sx + (sw - nw) * 0.5;
    g.fillStyle = 'rgba(4,5,10,0.84)';
    g.fillRect(nx, sy, nw, 26);
    g.strokeStyle = spec.col;
    g.lineWidth = 1.4;
    g.strokeRect(nx, sy, nw, 26);
    neonTubeText(g, lines[0], nx + nw * 0.5, sy + 6, 13, spec.col, nw - 8);
  }

  function drawTubeWord(g, word, cx0, y, size, palette) {
    g.save();
    g.font = '900 ' + size + 'px "Arial Black",Impact,sans-serif';
    g.textBaseline = 'top';
    var total = g.measureText(word).width + (word.length - 1) * 1.2;
    var x = cx0 - total * 0.5;
    g.globalCompositeOperation = 'screen';
    for (var i = 0; i < word.length; i++) {
      var ch = word[i];
      var col = palette[i % palette.length];
      var cw = g.measureText(ch).width;
      g.shadowColor = col; g.shadowBlur = 10;
      g.strokeStyle = col; g.lineWidth = 2.1; g.globalAlpha = 0.88;
      g.strokeText(ch, x, y);
      g.shadowBlur = 0;
      g.fillStyle = col === YEL ? '#FFF7BF' : (col === CYAN ? '#D8FFFF' : '#FFD4DA');
      g.globalAlpha = 0.95;
      g.fillText(ch, x, y);
      x += cw + 1.2;
    }
    g.restore();
  }

  /* ---------- Pre-render 3 Parallax Layers ---------- */
  function bake() {
    if (!xFar || !xMid || !xNear || !city) return;
    var w = vw, h = vh, horizon = city.horizon;

    /* ----- LAYER 0: Sky + Stars + Scanline Sun + Far Buildings + Far Fog ----- */
    xFar.setTransform(dpr, 0, 0, dpr, 0, 0);
    xFar.clearRect(0, 0, w, h);

    var sky = xFar.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#020308');
    sky.addColorStop(0.42, '#060714');
    sky.addColorStop(0.78, '#150915');
    sky.addColorStop(1, '#291208');
    xFar.fillStyle = sky;
    xFar.fillRect(0, 0, w, horizon + 2);

    var sr = rng(0x5A1899);
    for (var i = 0; i < 85; i++) {
      var stx = sr() * w, sty = sr() * (horizon * 0.68);
      xFar.fillStyle = sr() < 0.2 ? CYAN : '#FFF4C8';
      xFar.globalAlpha = 0.2 + sr() * 0.55;
      var sz = sr() < 0.85 ? 0.9 : 1.5;
      xFar.fillRect(stx, sty, sz, sz);
    }
    xFar.globalAlpha = 1;

    /* scanline sun */
    var sunX = city.sunX, sunY = city.sunY, sunR = city.sunR;
    var halo = xFar.createRadialGradient(sunX, sunY, sunR * 0.15, sunX, sunY, sunR * 2.5);
    halo.addColorStop(0, 'rgba(255,212,0,0.62)');
    halo.addColorStop(0.32, 'rgba(255,60,30,0.26)');
    halo.addColorStop(0.68, 'rgba(0,240,255,0.08)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    xFar.fillStyle = halo;
    xFar.fillRect(sunX - sunR * 2.5, sunY - sunR * 2.5, sunR * 5, sunR * 5);

    xFar.save();
    xFar.beginPath(); xFar.rect(0, 0, w, horizon); xFar.clip();
    var sg = xFar.createLinearGradient(0, sunY - sunR, 0, sunY);
    sg.addColorStop(0, '#FFE84D'); sg.addColorStop(0.6, '#FFD400'); sg.addColorStop(1, '#FF3E24');
    xFar.fillStyle = sg;
    xFar.beginPath(); xFar.arc(sunX, sunY, sunR, 0, Math.PI * 2); xFar.fill();
    /* RGB edge fringe */
    xFar.globalCompositeOperation = 'screen';
    xFar.fillStyle = 'rgba(255,30,60,0.32)';
    xFar.beginPath(); xFar.arc(sunX - 2.5, sunY, sunR * 0.98, 0, Math.PI * 2); xFar.fill();
    xFar.fillStyle = 'rgba(0,240,255,0.26)';
    xFar.beginPath(); xFar.arc(sunX + 2.5, sunY, sunR * 0.98, 0, Math.PI * 2); xFar.fill();
    xFar.globalCompositeOperation = 'source-over';
    /* scanlines */
    xFar.fillStyle = 'rgba(8,6,14,0.58)';
    var step = Math.max(3, sunR / 15);
    for (var ly = sunY - sunR; ly < horizon; ly += step) {
      xFar.fillRect(sunX - sunR - 4, ly, sunR * 2 + 8, 1.3);
    }
    xFar.restore();

    /* far buildings */
    city.buildings.forEach(function (b) { if (b.layer === 0) drawBuilding(xFar, b); });

    /* atmospheric haze over far layer */
    var fog0 = xFar.createLinearGradient(0, horizon * 0.35, 0, horizon);
    fog0.addColorStop(0, 'rgba(12,10,24,0.22)');
    fog0.addColorStop(1, 'rgba(26,14,22,0.48)');
    xFar.fillStyle = fog0;
    xFar.fillRect(0, horizon * 0.35, w, horizon * 0.65);

    /* ----- LAYER 1: Mid Buildings + Mid Fog ----- */
    xMid.setTransform(dpr, 0, 0, dpr, 0, 0);
    xMid.clearRect(0, 0, w, h);
    city.buildings.forEach(function (b) { if (b.layer === 1) drawBuilding(xMid, b); });

    var fog1 = xMid.createLinearGradient(0, horizon - 140, 0, horizon);
    fog1.addColorStop(0, 'rgba(0,0,0,0)');
    fog1.addColorStop(1, 'rgba(18,12,26,0.36)');
    xMid.fillStyle = fog1;
    xMid.fillRect(0, horizon - 140, w, 140);

    /* ----- LAYER 2: Near Buildings + Wet Street + Reflections + Center Mask ----- */
    xNear.setTransform(dpr, 0, 0, dpr, 0, 0);
    xNear.clearRect(0, 0, w, h);
    city.buildings.forEach(function (b) { if (b.layer === 2) drawBuilding(xNear, b); });

    /* wet-street floor below horizon */
    var ground = xNear.createLinearGradient(0, horizon, 0, h);
    ground.addColorStop(0, '#0c0814');
    ground.addColorStop(0.5, '#040409');
    ground.addColorStop(1, '#000000');
    xNear.fillStyle = ground;
    xNear.fillRect(0, horizon, w, h - horizon + 2);

    /* baked wet-street neon reflections from Mid + Near above horizon */
    xNear.save();
    xNear.beginPath(); xNear.rect(0, horizon, w, h - horizon); xNear.clip();
    xNear.translate(0, horizon * 2);
    xNear.scale(1, -0.45);
    xNear.globalAlpha = 0.24;
    xNear.drawImage(cMid, 0, 0, w, h);
    xNear.globalAlpha = 0.34;
    xNear.drawImage(cNear, 0, 0, w, h);
    xNear.restore();

    /* dark wet-puddle streaks over reflection */
    xNear.fillStyle = 'rgba(3,4,9,0.52)';
    for (var py = horizon + 3; py < h; py += 5) {
      xNear.fillRect(0, py, w, 2.4);
    }

    /* perspective grid on top of wet asphalt */
    var vpX = sunX, vpY = horizon;
    xNear.lineWidth = 1;
    var rows = 14;
    for (i = 1; i <= rows; i++) {
      var t = i / rows;
      var gy = horizon + Math.pow(t, 1.35) * (h - horizon);
      var a = 0.22 * (1 - t * 0.45);
      xNear.strokeStyle = 'rgba(255,212,0,' + a.toFixed(3) + ')';
      xNear.beginPath(); xNear.moveTo(0, gy); xNear.lineTo(w, gy); xNear.stroke();
    }
    var cols = 22;
    for (i = -cols; i <= cols; i++) {
      if (i === 0) continue;
      var gx = vpX + i * (w / (cols * 0.9));
      var a2 = 0.16 * (1 - Math.min(1, Math.abs(i) / cols));
      xNear.strokeStyle = i % 5 === 0 ? 'rgba(0,240,255,' + a2.toFixed(3) + ')' : 'rgba(255,212,0,' + a2.toFixed(3) + ')';
      xNear.beginPath(); xNear.moveTo(vpX, vpY); xNear.lineTo(gx, h + 8); xNear.stroke();
    }
    /* horizon neon edge */
    xNear.strokeStyle = 'rgba(255,212,0,0.6)';
    xNear.lineWidth = 1.6;
    xNear.beginPath(); xNear.moveTo(0, horizon + 0.5); xNear.lineTo(w, horizon + 0.5); xNear.stroke();
    xNear.strokeStyle = 'rgba(0,240,255,0.28)';
    xNear.lineWidth = 1;
    xNear.beginPath(); xNear.moveTo(0, horizon + 2.5); xNear.lineTo(w, horizon + 2.5); xNear.stroke();

    /* center dimming mask across mid+near so central cards/headings stay dominant */
    [xMid, xNear].forEach(function (g) {
      var mask = g.createLinearGradient(0, 0, w, 0);
      mask.addColorStop(0, 'rgba(5,7,13,0)');
      mask.addColorStop(0.24, 'rgba(5,7,13,0)');
      mask.addColorStop(0.38, 'rgba(5,7,13,0.68)');
      mask.addColorStop(0.50, 'rgba(5,7,13,0.82)');
      mask.addColorStop(0.62, 'rgba(5,7,13,0.68)');
      mask.addColorStop(0.76, 'rgba(5,7,13,0)');
      mask.addColorStop(1, 'rgba(5,7,13,0)');
      g.fillStyle = mask;
      g.fillRect(0, 0, w, h);
    });
  }

  /* ---------- Animated Actors ---------- */
  function drawFlickers(g, t) {
    var fs = city.flickers;
    for (var i = 0; i < fs.length; i++) {
      var f = fs[i], win = f.win;
      var s = 0.5 + 0.5 * Math.sin(t * win.rate + win.ph);
      if (s < 0.25) {
        g.fillStyle = 'rgba(4,5,10,0.75)';
        g.fillRect(win.x, win.y, win.w, win.h);
      } else if (s > 0.9) {
        g.fillStyle = win.col;
        g.globalAlpha = 0.85;
        g.fillRect(win.x, win.y, win.w, win.h);
      }
    }
    g.globalAlpha = 1;
  }

  function drawSteam(g) {
    g.save();
    for (var i = 0; i < steam.length; i++) {
      var st = steam[i];
      var a = Math.sin(st.life * Math.PI) * 0.14;
      if (a <= 0.01) continue;
      g.fillStyle = i % 2 ? 'rgba(180,220,255,' + a.toFixed(3) + ')' : 'rgba(255,230,170,' + a.toFixed(3) + ')';
      g.beginPath();
      g.arc(st.x, st.y, st.r + st.life * 10, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  function drawHoloToast(g, o, t) {
    var bob = Math.sin(t * 1.4 + o.ph) * 6;
    var y = o.y + bob, x = o.x, s = o.s;
    g.save();
    /* rooftop projector pad */
    g.fillStyle = '#18202c';
    g.fillRect(x - 7, o.baseY - 3, 14, 3);
    g.fillStyle = CYAN;
    g.fillRect(x - 4, o.baseY - 4, 8, 1.5);
    /* projector cone from roof */
    var cone = g.createLinearGradient(x, o.baseY - 4, x, y - s * 1.05);
    cone.addColorStop(0, 'rgba(0,240,255,0.34)');
    cone.addColorStop(0.55, 'rgba(0,240,255,0.12)');
    cone.addColorStop(1, 'rgba(0,240,255,0.02)');
    g.fillStyle = cone;
    g.beginPath();
    g.moveTo(x - 5, o.baseY - 4);
    g.lineTo(x - s * 1.45, y - s * 0.9);
    g.lineTo(x + s * 1.45, y - s * 0.9);
    g.lineTo(x + 5, o.baseY - 4);
    g.closePath();
    g.fill();

    /* classic two-lobe rounded-top toast slice */
    g.translate(x, y);
    g.rotate(Math.sin(t * 0.7 + o.ph) * 0.14);
    function toastPath(c) {
      c.moveTo(-s * 0.62, s * 0.72);
      c.lineTo(-s * 0.68, -s * 0.15);
      c.bezierCurveTo(-s * 0.98, -s * 0.35, -s * 0.85, -s * 0.85, -s * 0.32, -s * 0.82);
      c.quadraticCurveTo(0, -s * 0.72, s * 0.32, -s * 0.82);
      c.bezierCurveTo(s * 0.85, -s * 0.85, s * 0.98, -s * 0.35, s * 0.68, -s * 0.15);
      c.lineTo(s * 0.62, s * 0.72);
      c.closePath();
    }
    g.fillStyle = 'rgba(0,240,255,0.10)';
    g.beginPath(); toastPath(g); g.fill();
    neonStroke(g, toastPath, CYAN, 1.4, 0.9);

    /* melting yellow butter pat + crust rim */
    g.fillStyle = 'rgba(255,212,0,0.62)';
    g.strokeStyle = YEL;
    g.lineWidth = 1;
    g.save();
    g.translate(0, -s * 0.05);
    g.rotate(0.18);
    g.fillRect(-s * 0.24, -s * 0.2, s * 0.48, s * 0.4);
    g.strokeRect(-s * 0.24, -s * 0.2, s * 0.48, s * 0.4);
    g.restore();

    /* holo scanlines clipped inside toast */
    g.save();
    g.beginPath(); toastPath(g); g.clip();
    g.strokeStyle = 'rgba(0,240,255,0.34)';
    g.lineWidth = 1;
    for (var sy = -s * 0.9; sy <= s * 0.8; sy += 3.5) {
      g.beginPath(); g.moveTo(-s, sy); g.lineTo(s, sy); g.stroke();
    }
    g.restore();
    g.restore();
  }

  function drawCar(g, c) {
    var x = c.x, y = c.y, s = c.s, dir = c.v > 0 ? 1 : -1;
    g.save();
    g.translate(x, y);
    g.scale(dir, 1);
    var grad = g.createLinearGradient(-s * 4, 0, -s * 0.5, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, c.col);
    g.globalAlpha = 0.42;
    g.fillStyle = grad;
    g.fillRect(-s * 4, -1.5, s * 3.5, 3);
    g.globalAlpha = 0.92;
    g.fillStyle = '#151822';
    g.beginPath();
    g.moveTo(-s, 0); g.lineTo(-s * 0.35, -s * 0.28); g.lineTo(s * 0.55, -s * 0.28); g.lineTo(s, 0);
    g.lineTo(s * 0.7, s * 0.18); g.lineTo(-s * 0.7, s * 0.18);
    g.closePath();
    g.fill();
    g.strokeStyle = c.col; g.lineWidth = 1; g.stroke();
    g.fillStyle = '#ffffff';
    g.fillRect(s - 1, -2, 3, 2);
    g.fillStyle = RED;
    g.fillRect(-s - 1, -2, 3, 2);
    g.restore();
  }

  function pathTruck(g, ox) {
    g.moveTo(ox - 78, 9);
    g.lineTo(ox - 76, -5);
    g.lineTo(ox - 12, -11);
    g.lineTo(ox + 10, -25);
    g.lineTo(ox + 48, -25);
    g.lineTo(ox + 76, -4);
    g.lineTo(ox + 76, 9);
    g.lineTo(ox + 60, 14);
    g.lineTo(ox + 48, 9);
    g.lineTo(ox - 48, 9);
    g.lineTo(ox - 60, 14);
    g.closePath();
  }

  function drawCybertruck(g, p, dir, y) {
    var w = vw;
    var x = dir > 0 ? mix(-200, w + 200, p) : mix(w + 200, -200, p);
    var sc = Math.max(1.25, Math.min(1.75, (w / 1440) * 1.38));
    g.save();
    g.translate(x, y);
    g.scale(dir * sc, sc);

    /* volumetric cyan headlight beam cone */
    var beam = g.createLinearGradient(74, -4, 240, 10);
    beam.addColorStop(0, 'rgba(0,240,255,0.42)');
    beam.addColorStop(0.5, 'rgba(0,240,255,0.12)');
    beam.addColorStop(1, 'rgba(0,240,255,0)');
    g.fillStyle = beam;
    g.beginPath();
    g.moveTo(74, -6); g.lineTo(240, -26); g.lineTo(240, 26); g.lineTo(74, -1);
    g.closePath();
    g.fill();

    /* yellow / cyan glitch trail */
    var trail = g.createLinearGradient(-220, 0, -50, 0);
    trail.addColorStop(0, 'rgba(255,212,0,0)');
    trail.addColorStop(0.5, 'rgba(255,30,60,0.22)');
    trail.addColorStop(1, 'rgba(255,212,0,0.34)');
    g.fillStyle = trail;
    g.fillRect(-220, -10, 160, 20);

    /* RGB chromatic echoes */
    g.globalAlpha = 0.38;
    g.fillStyle = RED; g.beginPath(); pathTruck(g, -6); g.fill();
    g.fillStyle = CYAN; g.beginPath(); pathTruck(g, 5); g.fill();
    g.globalAlpha = 1;

    /* stainless dark body gradient */
    var bg = g.createLinearGradient(0, -25, 0, 14);
    bg.addColorStop(0, '#363d4d');
    bg.addColorStop(0.45, '#191d26');
    bg.addColorStop(1, '#090b10');
    g.fillStyle = bg;
    g.beginPath(); pathTruck(g, 0); g.fill();

    /* glowing yellow contour */
    neonStroke(g, function (c) { pathTruck(c, 0); }, YEL, 1.3, 0.9);

    /* cabin side window + metallic crease */
    g.fillStyle = 'rgba(0,240,255,0.25)';
    g.beginPath();
    g.moveTo(-2, -10); g.lineTo(12, -21); g.lineTo(44, -21); g.lineTo(58, -10);
    g.closePath();
    g.fill();
    g.strokeStyle = CYAN; g.lineWidth = 1; g.stroke();

    /* wheel arches & neon wheel rims */
    [-54, 54].forEach(function (wx) {
      g.fillStyle = '#07090e';
      g.beginPath(); g.arc(wx, 10, 11, 0, Math.PI * 2); g.fill();
      g.strokeStyle = YEL; g.lineWidth = 1.6;
      g.beginPath(); g.arc(wx, 10, 9, 0, Math.PI * 2); g.stroke();
      g.fillStyle = CYAN;
      g.beginPath(); g.arc(wx, 10, 2.5, 0, Math.PI * 2); g.fill();
    });

    /* full-width cyan lightbar + red rear lightbar */
    g.fillStyle = '#E8FFFF';
    g.fillRect(67, -7, 11, 4);
    g.fillStyle = RED;
    g.fillRect(-77, -7, 9, 4);

    /* underglow */
    g.fillStyle = 'rgba(255,212,0,0.6)';
    g.fillRect(-44, 12, 88, 2.5);
    g.restore();
  }

  function stepActors(dt) {
    var w = vw, h = vh, horizon = city.horizon, i, o;
    for (i = 0; i < rain.length; i++) {
      o = rain[i];
      o.y += o.vy * dt; o.x += 22 * dt;
      if (o.y > h + 20) { o.y = -12; o.x = (o.x % w + w) % w; }
      if (o.x > w) o.x -= w;
    }
    for (i = 0; i < embers.length; i++) {
      o = embers[i];
      o.y += o.vy * dt; o.x += o.vx * dt; o.life += dt * 0.28;
      if (o.y < horizon * 0.35 || o.life > 1) {
        o.y = mix(horizon - 50, h, Math.random());
        o.x = Math.random() * w;
        o.life = 0;
      }
    }
    for (i = 0; i < steam.length; i++) {
      o = steam[i];
      o.life += dt * 0.35;
      o.x += o.vx * dt; o.y += o.vy * dt;
      if (o.life >= 1) { o.life = 0; o.x = o.ox; o.y = o.oy; }
    }
    for (i = 0; i < cars.length; i++) {
      o = cars[i];
      o.x += o.v * dt;
      if (o.v > 0 && o.x > w + 50) o.x = -50;
      if (o.v < 0 && o.x < -50) o.x = w + 50;
    }
    if (forceTruck >= 0) {
      truck.on = true; truck.p = forceTruck;
    } else if (truck.on) {
      truck.p += dt / 3.4;
      if (truck.p >= 1) { truck.on = false; truck.p = 0; truck.wait = 11 + Math.random() * 9; truck.dir *= -1; }
    } else {
      truck.wait -= dt;
      if (truck.wait <= 0) { truck.on = true; truck.p = 0; }
    }
    if (glitch.on > 0) glitch.on -= dt;
    else if (Math.random() < dt * 0.16) {
      glitch.on = 0.08 + Math.random() * 0.09;
      glitch.x = Math.random() < 0.5 ? Math.random() * w * 0.25 : w * 0.72 + Math.random() * w * 0.24;
      glitch.y = Math.random() * horizon * 0.8;
      glitch.w = 30 + Math.random() * 120;
      glitch.h = 18 + Math.random() * 70;
      glitch.dx = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 8);
    }
  }

  function drawActors(g, t) {
    drawFlickers(g, t);
    drawSteam(g);
    var i;
    for (i = 0; i < holos.length; i++) drawHoloToast(g, holos[i], t);
    for (i = 0; i < cars.length; i++) drawCar(g, cars[i]);
    if (truck.on) drawCybertruck(g, truck.p, truck.dir, truck.y);

    /* wet-street subtle horizontal shimmer ripples */
    var horizon = city.horizon;
    g.save();
    g.globalAlpha = 0.16;
    for (i = 0; i < 6; i++) {
      var ry = horizon + 12 + ((i * 29 + t * 14) % Math.max(40, vh - horizon - 16));
      var rx = ((i * 197 + Math.sin(t + i) * 30) % (vw * 0.28));
      g.fillStyle = i % 2 ? CYAN : YEL;
      g.fillRect(rx, ry, 28, 1.2);
      g.fillRect(vw - rx - 30, ry + 4, 28, 1.2);
    }
    g.restore();

    /* rain */
    g.lineWidth = 1;
    for (i = 0; i < rain.length; i++) {
      var r = rain[i];
      g.strokeStyle = r.col;
      g.globalAlpha = r.a;
      g.beginPath(); g.moveTo(r.x, r.y); g.lineTo(r.x - 1.5, r.y + r.len); g.stroke();
    }
    /* embers */
    for (i = 0; i < embers.length; i++) {
      var e = embers[i];
      g.globalAlpha = 0.25 + 0.6 * Math.sin(e.life * 3.14);
      g.fillStyle = e.col;
      g.fillRect(e.x, e.y, e.r, e.r);
    }
    g.globalAlpha = 1;

    /* brief RGB glitch slice */
    if (glitch.on > 0) {
      g.save();
      g.globalCompositeOperation = 'screen';
      g.fillStyle = 'rgba(255,30,60,0.22)';
      g.fillRect(glitch.x + glitch.dx, glitch.y, glitch.w, glitch.h);
      g.fillStyle = 'rgba(0,240,255,0.20)';
      g.fillRect(glitch.x - glitch.dx, glitch.y + 2, glitch.w, glitch.h);
      g.restore();
    }
  }

  function protectText(g) {
    var nodes = D.querySelectorAll('h1,h2,h3,h4,h5');
    if (!nodes.length) return;
    var ox = W.innerWidth * 0.03, oy = W.innerHeight * 0.03;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i], r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > W.innerHeight || r.right < 0 || r.left > W.innerWidth) continue;
      if (r.width < 12 || r.height < 8) continue;
      var x = r.x + ox - 18, y = r.y + oy - 10, rw = r.width + 36, rh = r.height + 20;
      g.fillStyle = 'rgba(4,5,10,0.6)';
      g.fillRect(x - 8, y - 6, rw + 16, rh + 12);
      g.fillStyle = 'rgba(4,5,10,0.86)';
      g.fillRect(x, y, rw, rh);
    }
  }

  /* ---------- Render & Loop ---------- */
  function render(t, moving) {
    if (!cx || !cFar || !cMid || !cNear || !city) return;
    var t0s = performance.now();
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, vw, vh);

    /* multi-layer mouse parallax */
    var p0x = -px.x * 3, p0y = -px.y * 2;
    var p1x = -px.x * 7, p1y = -px.y * 4.5;
    var p2x = -px.x * 12, p2y = -px.y * 7;

    cx.drawImage(cFar, p0x, p0y, vw, vh);
    cx.drawImage(cMid, p1x, p1y, vw, vh);
    cx.drawImage(cNear, p2x, p2y, vw, vh);

    if (moving) {
      cx.save();
      cx.translate(p2x * 0.6, p2y * 0.6);
      drawActors(cx, t);
      cx.restore();
    } else {
      /* reduced-motion: static holo toast so scene still features it */
      for (var i = 0; i < holos.length; i++) drawHoloToast(cx, holos[i], 0);
    }

    protectText(cx);
    var ms = performance.now() - t0s;
    frameMs = ms; frameN++; frameAvg = frameAvg * 0.9 + ms * 0.1;
  }

  function loop(ts) {
    raf = 0;
    if (!running || hidden || !mqDesk.matches) return;
    if (!lastTs) lastTs = ts;
    var dt = Math.min(0.08, (ts - lastTs) / 1000);
    lastTs = ts;
    if (ts - (loop._lastDraw || 0) < STEP - 1) {
      raf = W.requestAnimationFrame(loop);
      return;
    }
    loop._lastDraw = ts;
    tAnim += dt;
    px.x += (px.tx - px.x) * 0.08;
    px.y += (px.ty - px.y) * 0.08;
    stepActors(dt);
    render(tAnim, true);
    raf = W.requestAnimationFrame(loop);
  }

  function startLoop() {
    if (running) return;
    running = true;
    hidden = !!D.hidden;
    lastTs = 0; loop._lastDraw = 0;
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
  function onResize() { clearTimeout(resizeTid); resizeTid = setTimeout(rebuild, 120); }
  function onMouse(e) {
    if (!running || mqReduce.matches) return;
    if (e.pointerType && e.pointerType !== 'mouse') return;
    px.tx = (e.clientX / W.innerWidth) * 2 - 1;
    px.ty = (e.clientY / W.innerHeight) * 2 - 1;
  }
  function onLeave() { px.tx = 0; px.ty = 0; }
  function onVis() {
    hidden = !!D.hidden;
    if (hidden) { if (raf) { W.cancelAnimationFrame(raf); raf = 0; } }
    else if (running && mqDesk.matches && !mqReduce.matches) {
      lastTs = 0; loop._lastDraw = 0; raf = W.requestAnimationFrame(loop);
    }
  }

  function bind() {
    W.addEventListener('resize', onResize, { passive: true });
    D.addEventListener('visibilitychange', onVis);
    D.addEventListener('pointermove', onMouse, { passive: true });
    D.documentElement.addEventListener('mouseleave', onLeave);
    if (mqDesk.addEventListener) mqDesk.addEventListener('change', rebuild); else mqDesk.addListener(rebuild);
    if (mqReduce.addEventListener) mqReduce.addEventListener('change', rebuild); else mqReduce.addListener(rebuild);
  }

  W.ttHsDebug = {
    truck: function (p) { forceTruck = (p == null) ? 0.22 : +p; truck.on = forceTruck >= 0; truck.p = forceTruck; if (cx) render(tAnim, !mqReduce.matches); },
    clearTruck: function () { forceTruck = -1; },
    stats: function () { return { frameMs: +frameMs.toFixed(2), avgMs: +frameAvg.toFixed(2), frames: frameN, w: vw, h: vh, dpr: dpr, reduced: mqReduce.matches, desk: mqDesk.matches, truck: truck, logo: logoOk }; },
    bake: function () { bake(); render(tAnim, !mqReduce.matches); }
  };

  function boot() { bind(); if (mqDesk.matches) rebuild(); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
