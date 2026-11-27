/* Toaster Town v3 — a dense, always-busy crumb ecosystem for Therapy Toaster.
   Official logo is composited from the PNG, never redrawn.
   Visible social label is "Twitter", never "X". No chat features.
*/
(function () {
  "use strict";

  const YELLOW = "#FFD400";
  const LOGO_SRC = "assets/mr-toasty-neon-logo-official.png";
  const FEED_LOCAL = "feed.json";
  const FEED_PUBLIC = [
    "https://therapytoaster.github.io/tt-live/posts.json",
    "https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@main/posts.json"
  ];
  const TRACKS_SRC = "radio-tracks.json";
  const SITE = "https://www.therapytoaster.com";
  const TAU = Math.PI * 2;

  const canvas = document.getElementById("town");
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const $ = function (id) { return document.getElementById(id); };
  const elClock = $("clock"), elShift = $("shift"), elCensus = $("census"), elHint = $("hint");
  const elTrack = $("ticker-track"), elVisits = $("visits"), elLog = $("log"), elPlace = $("place-label");
  const elRadio = $("radio-btn"), elNow = $("now-playing"), elSound = $("sound-btn");

  const Q = new URLSearchParams(location.search);
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const forcedShift = (function () { const q = Q.get("shift"); return q && /^(breakfast|lunch|golden|night)$/.test(q) ? q : null; })();
  const forcedHour = Q.has("hour") ? parseFloat(Q.get("hour")) : (forcedShift ? ({ breakfast: 7, lunch: 13, golden: 18.4, night: 23 })[forcedShift] : null);
  const forcedEvent = Q.get("event");
  const quiet = Q.get("quiet") === "1"; /* no random events (testing) */

  let w = 0, h = 0, dpr = 1, isMobile = false;
  let running = false, hidden = document.hidden, last = 0, time = 0, frame = 0;
  let hintFaded = false;
  let L = null; /* layout */

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function irand(a, b) { return (a + Math.random() * (b - a + 1)) | 0; }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function chance(p) { return Math.random() < p; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function dist(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
  function rgba(c, a) { return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + a + ")"; }
  function mix(c1, c2, t) { return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]; }

  /* ---------- offscreen helpers (baked at dpr, drawn in CSS px) ---------- */
  function bake(cw, ch, draw, scale) {
    const s = scale || dpr;
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(cw * s)); c.height = Math.max(1, Math.ceil(ch * s));
    const g = c.getContext("2d");
    g.scale(s, s);
    draw(g, cw, ch);
    c.cw = cw; c.ch = ch;
    return c;
  }
  function roundRect(g, x, y, ww, hh, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + ww, y, x + ww, y + hh, r);
    g.arcTo(x + ww, y + hh, x, y + hh, r);
    g.arcTo(x, y + hh, x, y, r);
    g.arcTo(x, y, x + ww, y, r);
    g.closePath();
  }
  function blit(img, x, y, ww, hh) { ctx.drawImage(img, x, y, ww === undefined ? img.cw : ww, hh === undefined ? img.ch : hh); }
  function blitC(img, x, y, sc) { const ww = img.cw * (sc || 1), hh = img.ch * (sc || 1); ctx.drawImage(img, x - ww / 2, y - hh / 2, ww, hh); }

  /* ---------- logo (official PNG, background punched to transparent) ---------- */
  const logo = new Image();
  let logoReady = false, logoSprite = null;
  logo.onload = function () { try { logoSprite = punchLogoBackground(logo); } catch (e) { logoSprite = null; } logoReady = true; };
  logo.src = LOGO_SRC;
  function punchLogoBackground(img) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = iw; c.height = ih;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const data = g.getImageData(0, 0, iw, ih);
    const px = data.data;
    const seen = new Uint8Array(iw * ih), qx = new Int32Array(iw * ih), qy = new Int32Array(iw * ih);
    let qh = 0;
    function tryPush(x, y) {
      if (x < 0 || y < 0 || x >= iw || y >= ih) return;
      const i = y * iw + x;
      if (seen[i]) return;
      const o = i * 4;
      if (Math.max(px[o], px[o + 1], px[o + 2]) > 12) return;
      seen[i] = 1; qx[qh] = x; qy[qh] = y; qh++;
    }
    tryPush(0, 0); tryPush(iw - 1, 0); tryPush(0, ih - 1); tryPush(iw - 1, ih - 1);
    let qi = 0;
    while (qi < qh) {
      const x = qx[qi], y = qy[qi]; qi++;
      px[(y * iw + x) * 4 + 3] = 0;
      tryPush(x + 1, y); tryPush(x - 1, y); tryPush(x, y + 1); tryPush(x, y - 1);
    }
    g.putImageData(data, 0, 0);
    return c;
  }
  function logoImg() { return logoSprite || logo; }

  /* ---------- New York time ---------- */
  function nyParts(date) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    }).formatToParts(date || new Date());
    const g = {};
    for (let i = 0; i < parts.length; i++) g[parts[i].type] = parts[i].value;
    return g;
  }
  function nyHour(parts) {
    if (forcedHour !== null && !isNaN(forcedHour)) return forcedHour;
    return (parseInt(parts.hour, 10) || 0) + (parseInt(parts.minute, 10) || 0) / 60 + (parseInt(parts.second, 10) || 0) / 3600;
  }
  function shiftFor(hr) {
    const id = forcedShift || (hr >= 5 && hr < 10 ? "breakfast" : hr >= 10 && hr < 16 ? "lunch" : hr >= 16 && hr < 21 ? "golden" : "night");
    return {
      breakfast: { id: "breakfast", name: "BREAKFAST RUSH", busy: 1.25 },
      lunch: { id: "lunch", name: "LUNCH SERVICE", busy: 1.0 },
      golden: { id: "golden", name: "GOLDEN CRUMBS", busy: 1.1 },
      night: { id: "night", name: "NIGHT WATCH", busy: 0.85 }
    }[id];
  }
  /* sky keyframes: [hour, top, bottom, stars, lights, label] */
  const SKY = [
    [0, [2, 2, 9], [12, 7, 16], 1, 0.85, "NIGHT"],
    [4.8, [3, 3, 12], [16, 9, 20], 1, 0.8, "NIGHT"],
    [6.2, [26, 16, 46], [120, 58, 26], 0.45, 0.6, "DAWN"],
    [7.6, [24, 26, 48], [96, 76, 34], 0.08, 0.35, "MORNING"],
    [12, [20, 26, 40], [74, 66, 34], 0.03, 0.25, "DAY"],
    [16.2, [26, 22, 38], [98, 70, 24], 0.05, 0.35, "AFTERNOON"],
    [18.2, [42, 14, 34], [160, 72, 10], 0.3, 0.6, "DUSK"],
    [19.6, [12, 6, 24], [52, 22, 14], 0.8, 0.8, "EVENING"],
    [22, [3, 3, 10], [14, 8, 12], 1, 0.85, "NIGHT"],
    [24, [2, 2, 9], [12, 7, 16], 1, 0.85, "NIGHT"]
  ];
  function skyAt(hr) {
    hr = ((hr % 24) + 24) % 24;
    for (let i = 0; i < SKY.length - 1; i++) {
      const a = SKY[i], b = SKY[i + 1];
      if (hr >= a[0] && hr <= b[0]) {
        const t = (hr - a[0]) / (b[0] - a[0] || 1);
        const e = t * t * (3 - 2 * t);
        return { top: mix(a[1], b[1], e), bot: mix(a[2], b[2], e), stars: lerp(a[3], b[3], e), lights: lerp(a[4], b[4], e), label: t < 0.5 ? a[5] : b[5], hour: hr };
      }
    }
    return { top: SKY[0][1], bot: SKY[0][2], stars: 1, lights: 0.85, label: "NIGHT", hour: hr };
  }

  /* ---------- state ---------- */
  const citizens = [], crumbs = [], sparks = [], trucks = [], smoke = [], drops = [], bubbles = [], rings = [], hearts = [], stars2 = [], clouds = [];
  const S = {}; /* baked sprites */
  let skyNow = skyAt(12), shiftNow = shiftFor(12);
  let pointer = { x: -999, y: -999, on: false, still: 0, lastMove: 0 };
  let parX = 0, parTarget = 0;
  let logoPulse = 0;
  let census = { inside: 0 };

  const CIT_SIZE = 30; /* base body px */
  const TYPES = {
    toast: { col: "#E7B34A", crust: "#8A4A12", eyes: [[-6, -1], [6, -1]], skull: false },
    golden: { col: "#FFD24A", crust: "#C07A10", eyes: [[-6, -1], [6, -1]], skull: false, glow: true },
    burnt: { col: "#6E3A12", crust: "#2a1204", eyes: [[-6, -1], [6, -1]], skull: false },
    helmet: { col: "#E7B34A", crust: "#8A4A12", eyes: [[-6, 1], [6, 1]], skull: false, hat: "helmet" },
    shades: { col: "#E9B850", crust: "#8A4A12", eyes: null, skull: false, hat: "shades" },
    cap: { col: "#E1AA42", crust: "#7f4210", eyes: [[-6, 0], [6, 0]], skull: false, hat: "cap" },
    skull: { col: "#F3E6B8", crust: null, eyes: [[-6, -3], [6, -3]], skull: true },
    skullcap: { col: "#F0E2B0", crust: null, eyes: [[-6, -2], [6, -2]], skull: true, hat: "bandana" },
    mom: { col: "#F0BE56", crust: "#8A4A12", eyes: [[-6, -1], [6, -1]], skull: false, hat: "bow" },
    dad: { col: "#E7B34A", crust: "#8A4A12", eyes: [[-6, 1], [6, 1]], skull: false, hat: "helmet" }
  };

  function bakeCitizen(type) {
    const T = TYPES[type];
    return bake(44, 44, function (g) {
      const cx = 22, cy = 24;
      g.save();
      if (T.skull) {
        g.shadowColor = "rgba(255,212,0,0.55)"; g.shadowBlur = 6;
        g.fillStyle = T.col;
        g.beginPath(); g.ellipse(cx, cy - 4, 12.5, 11.5, 0, 0, TAU); g.fill();
        g.fillRect(cx - 7.5, cy + 4, 15, 8);
        g.shadowBlur = 0;
        g.strokeStyle = YELLOW; g.lineWidth = 1.2;
        g.beginPath(); g.ellipse(cx, cy - 4, 12.5, 11.5, 0, 0, TAU); g.stroke();
        g.fillStyle = "#0a0a00";
        g.beginPath();
        g.ellipse(cx - 6, cy - 3, 3.8, 4.4, -0.15, 0, TAU);
        g.ellipse(cx + 6, cy - 3, 3.8, 4.4, 0.15, 0, TAU);
        g.fill();
        g.beginPath(); g.moveTo(cx, cy + 1); g.lineTo(cx - 2, cy + 5); g.lineTo(cx + 2, cy + 5); g.closePath(); g.fill();
        g.strokeStyle = "#0a0a00"; g.lineWidth = 1;
        for (let i = 0; i < 4; i++) { const x = cx - 5 + i * 3.4; g.beginPath(); g.moveTo(x, cy + 7); g.lineTo(x, cy + 11.5); g.stroke(); }
      } else {
        g.shadowColor = T.glow ? "rgba(255,212,0,1)" : "rgba(255,212,0,0.5)"; g.shadowBlur = T.glow ? 12 : 5;
        g.fillStyle = T.col;
        /* loaf shape */
        g.beginPath();
        g.moveTo(cx - 13, cy + 12);
        g.lineTo(cx - 13, cy - 6);
        g.arc(cx - 6.5, cy - 7, 7, Math.PI, 1.5 * Math.PI + 0.3);
        g.arc(cx + 6.5, cy - 7, 7, 1.5 * Math.PI - 0.3, 0);
        g.lineTo(cx + 13, cy + 12);
        g.closePath();
        g.fill();
        g.shadowBlur = 0;
        g.strokeStyle = T.crust; g.lineWidth = 2.6; g.stroke();
        g.strokeStyle = YELLOW; g.lineWidth = 0.9; g.stroke();
        g.fillStyle = "rgba(255,240,180,0.18)";
        g.fillRect(cx - 9, cy - 5, 18, 14);
        if (T.eyes) {
          g.fillStyle = "#fff8e0";
          for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(cx + T.eyes[i][0], cy + T.eyes[i][1], 3, 0, TAU); g.fill(); }
        }
        g.strokeStyle = "#2a1000"; g.lineWidth = 1.3;
        g.beginPath(); g.arc(cx, cy + 5, 4, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
        g.fillStyle = "rgba(255,90,90,0.35)";
        g.fillRect(cx - 11, cy + 3, 4, 2); g.fillRect(cx + 7, cy + 3, 4, 2);
      }
      /* hats */
      if (T.hat === "helmet") {
        g.fillStyle = "#4b5320"; g.strokeStyle = "#222b10"; g.lineWidth = 1;
        g.beginPath(); g.ellipse(cx, cy - 9, 15, 9, 0, Math.PI, TAU); g.closePath(); g.fill(); g.stroke();
        g.fillRect(cx - 16, cy - 10, 32, 3);
        g.fillStyle = YELLOW;
        star(g, cx, cy - 14, 3.2);
      } else if (T.hat === "shades") {
        g.fillStyle = "#050505"; g.strokeStyle = YELLOW; g.lineWidth = 0.8;
        g.fillRect(cx - 11, cy - 4, 9, 5); g.fillRect(cx + 2, cy - 4, 9, 5);
        g.strokeRect(cx - 11, cy - 4, 9, 5); g.strokeRect(cx + 2, cy - 4, 9, 5);
        g.fillRect(cx - 2, cy - 3, 4, 1.4);
      } else if (T.hat === "cap") {
        g.fillStyle = "#111"; g.strokeStyle = YELLOW; g.lineWidth = 1;
        g.beginPath(); g.ellipse(cx, cy - 11, 11, 6, 0, Math.PI, TAU); g.closePath(); g.fill(); g.stroke();
        g.fillRect(cx, cy - 12, 15, 2.6);
        g.fillStyle = YELLOW; g.font = "700 5px monospace"; g.textAlign = "center"; g.fillText("TT", cx, cy - 13);
      } else if (T.hat === "bandana") {
        g.fillStyle = YELLOW;
        g.beginPath(); g.ellipse(cx, cy - 10, 13, 6, 0, Math.PI, TAU); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(cx + 11, cy - 11); g.lineTo(cx + 18, cy - 14); g.lineTo(cx + 17, cy - 8); g.closePath(); g.fill();
      } else if (T.hat === "bow") {
        g.fillStyle = "#ff5fa2"; g.strokeStyle = YELLOW; g.lineWidth = 0.8;
        g.beginPath(); g.moveTo(cx + 6, cy - 13); g.lineTo(cx - 1, cy - 18); g.lineTo(cx - 1, cy - 8); g.closePath(); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(cx + 6, cy - 13); g.lineTo(cx + 13, cy - 18); g.lineTo(cx + 13, cy - 8); g.closePath(); g.fill(); g.stroke();
        g.beginPath(); g.arc(cx + 6, cy - 13, 2, 0, TAU); g.fill();
      }
      g.restore();
    }, dpr * 1.5);
  }
  function star(g, x, y, r) {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath(); g.fill();
  }
  function heartPath(g, x, y, s) {
    g.beginPath();
    g.moveTo(x, y + s * 0.35);
    g.bezierCurveTo(x, y, x - s * 0.5, y - s * 0.1, x - s * 0.5, y + s * 0.3);
    g.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
    g.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
    g.bezierCurveTo(x + s * 0.5, y - s * 0.1, x, y, x, y + s * 0.35);
    g.closePath();
  }
  function radial(size, stops) {
    return bake(size, size, function (g) {
      const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      for (let i = 0; i < stops.length; i++) gr.addColorStop(stops[i][0], stops[i][1]);
      g.fillStyle = gr; g.fillRect(0, 0, size, size);
    }, 1);
  }
  function neonText(text, size, opts) {
    opts = opts || {};
    const font = (opts.weight || "800") + " " + size + "px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    const m = document.createElement("canvas").getContext("2d");
    m.font = font;
    const tw = Math.ceil(m.measureText(text).width) + size * 1.4;
    const th = Math.ceil(size * 2.1);
    return bake(tw, th, function (g) {
      g.font = font; g.textAlign = "center"; g.textBaseline = "middle";
      const col = opts.color || YELLOW;
      g.shadowColor = col; g.shadowBlur = size * 0.7;
      g.fillStyle = col; g.fillText(text, tw / 2, th / 2);
      g.shadowBlur = size * 0.25; g.fillText(text, tw / 2, th / 2);
      g.shadowBlur = 0; g.fillStyle = opts.core || "#FFF6C2"; g.globalAlpha = 0.85; g.fillText(text, tw / 2, th / 2);
    }, dpr * 1.25);
  }
  function bakeTruck(dir, parade) {
    return bake(120, 56, function (g) {
      g.save();
      if (dir < 0) { g.translate(120, 0); g.scale(-1, 1); }
      const by = 44;
      g.fillStyle = "#B9BEC6";
      g.beginPath();
      g.moveTo(8, by - 6); g.lineTo(10, by - 20); g.lineTo(58, by - 33); g.lineTo(112, by - 20); g.lineTo(114, by - 6); g.closePath();
      g.fill();
      const sh = g.createLinearGradient(0, by - 33, 0, by);
      sh.addColorStop(0, "rgba(255,255,255,0.35)"); sh.addColorStop(1, "rgba(0,0,0,0.35)");
      g.fillStyle = sh; g.fill();
      g.strokeStyle = YELLOW; g.lineWidth = 1.2; g.stroke();
      g.fillStyle = "rgba(8,10,14,0.92)";
      g.beginPath(); g.moveTo(52, by - 30); g.lineTo(88, by - 22); g.lineTo(88, by - 16); g.lineTo(50, by - 17); g.closePath(); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 0.8;
      g.beginPath(); g.moveTo(14, by - 12); g.lineTo(110, by - 12); g.stroke();
      g.fillStyle = "#FFF6C2"; g.shadowColor = YELLOW; g.shadowBlur = 8;
      g.fillRect(104, by - 20, 9, 2.4);
      g.fillStyle = "#ff3b3b"; g.shadowColor = "#ff3b3b"; g.fillRect(9, by - 19, 5, 2.4);
      g.shadowBlur = 0;
      g.fillStyle = "#0a0a0a"; g.strokeStyle = YELLOW; g.lineWidth = 1.2;
      g.beginPath(); g.arc(30, by - 4, 8, 0, TAU); g.fill(); g.stroke();
      g.beginPath(); g.arc(92, by - 4, 8, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = "#444"; g.beginPath(); g.arc(30, by - 4, 3, 0, TAU); g.arc(92, by - 4, 3, 0, TAU); g.fill();
      if (parade) {
        g.strokeStyle = "#ddd"; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(40, by - 26); g.lineTo(40, by - 50); g.stroke();
        g.fillStyle = YELLOW;
        g.beginPath(); g.moveTo(40, by - 50); g.lineTo(66, by - 45); g.lineTo(40, by - 40); g.closePath(); g.fill();
      }
      g.restore();
    });
  }
  function bakeAllSprites() {
    for (const k in TYPES) S["cit_" + k] = bakeCitizen(k);
    S.crumb = bake(10, 10, function (g) {
      g.fillStyle = "#E8C15A"; g.strokeStyle = YELLOW; g.lineWidth = 0.7;
      g.beginPath(); g.moveTo(2, 7); g.lineTo(3.5, 2); g.lineTo(8, 2.6); g.lineTo(8.6, 6.6); g.closePath(); g.fill(); g.stroke();
    }, dpr * 1.5);
    S.glow = radial(64, [[0, "rgba(255,212,0,0.9)"], [0.35, "rgba(255,212,0,0.28)"], [1, "rgba(255,212,0,0)"]]);
    S.warm = radial(64, [[0, "rgba(255,190,90,0.85)"], [0.4, "rgba(255,150,40,0.22)"], [1, "rgba(255,150,40,0)"]]);
    S.white = radial(32, [[0, "rgba(255,255,255,1)"], [0.3, "rgba(255,250,220,0.5)"], [1, "rgba(255,250,220,0)"]]);
    S.pink = radial(64, [[0, "rgba(255,95,162,0.8)"], [0.4, "rgba(255,95,162,0.22)"], [1, "rgba(255,95,162,0)"]]);
    S.puff = radial(48, [[0, "rgba(190,180,160,0.55)"], [0.6, "rgba(140,130,110,0.18)"], [1, "rgba(120,110,90,0)"]]);
    S.shadow = radial(32, [[0, "rgba(0,0,0,0.6)"], [1, "rgba(0,0,0,0)"]]);
    S.cloud = [0, 1, 2].map(function (v) {
      return bake(260, 90, function (g) {
        for (let i = 0; i < 9; i++) {
          const x = 40 + Math.random() * 180, y = 40 + Math.random() * 22, r = 18 + Math.random() * 26;
          const gr = g.createRadialGradient(x, y, 0, x, y, r);
          gr.addColorStop(0, "rgba(255,240,200,0.10)"); gr.addColorStop(1, "rgba(255,240,200,0)");
          g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
        }
      }, 1);
    });
    S.cone = bake(160, 60, function (g) {
      const gr = g.createLinearGradient(0, 0, 160, 0);
      gr.addColorStop(0, "rgba(255,240,170,0.55)"); gr.addColorStop(1, "rgba(255,240,170,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, 26); g.lineTo(160, 0); g.lineTo(160, 60); g.lineTo(0, 34); g.closePath(); g.fill();
    }, 1);
    S.beam = bake(80, 400, function (g) {
      const gr = g.createLinearGradient(0, 400, 0, 0);
      gr.addColorStop(0, "rgba(255,212,0,0.55)"); gr.addColorStop(1, "rgba(255,212,0,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(36, 400); g.lineTo(44, 400); g.lineTo(80, 0); g.lineTo(0, 0); g.closePath(); g.fill();
    }, 1);
    S.truckR = bakeTruck(1, false); S.truckL = bakeTruck(-1, false);
    S.paradeR = bakeTruck(1, true); S.paradeL = bakeTruck(-1, true);
    S.heart = bake(40, 40, function (g) {
      g.shadowColor = "#ff5fa2"; g.shadowBlur = 8;
      g.fillStyle = YELLOW; heartPath(g, 20, 6, 28); g.fill();
      g.shadowBlur = 0; g.strokeStyle = "#ff5fa2"; g.lineWidth = 1.4; g.stroke();
    }, dpr * 1.5);
    S.shirt = bake(40, 40, function (g) {
      g.fillStyle = "#0b0b0b"; g.strokeStyle = YELLOW; g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(12, 6); g.lineTo(4, 12); g.lineTo(8, 18); g.lineTo(11, 16); g.lineTo(11, 36); g.lineTo(29, 36); g.lineTo(29, 16); g.lineTo(32, 18); g.lineTo(36, 12); g.lineTo(28, 6);
      g.quadraticCurveTo(20, 12, 12, 6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = YELLOW; g.font = "800 6px monospace"; g.textAlign = "center"; g.fillText("TOASTY", 20, 24);
      g.beginPath(); g.arc(20, 30, 2.4, 0, TAU); g.fill();
    }, dpr * 1.5);
    S.neon = {
      hq: neonText("THERAPY TOASTER", 13), artcade: neonText("ARTCADE", 20), merch: neonText("MERCH", 15),
      radio: neonText("TOASTER RADIO", 10), vet: neonText("VET HALL", 11), home: neonText("TOASTY HOME", 8),
      newdrop: neonText("NEW DROP", 7), onair: neonText("ON AIR", 8, { color: "#ff4d4d", core: "#ffd6d6" }),
      party: neonText("SKULL BLOCK PARTY", 14), ooak: neonText("MY ONE OF A KIND", 13, { color: "#ff8cc0", core: "#fff0f6" }),
      family: neonText("THE TOASTY FAMILY", 9), parade: neonText("CYBERTRUCK PARADE", 13), storm: neonText("GLITCH STORM", 16, { color: "#ff3bd4", core: "#fff" }),
      fresh: neonText("FRESH TOAST", 9), open: neonText("OPEN 24/7", 7)
    };
    S.scan = bake(4, 4, function (g) { g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(0, 2, 4, 1.2); }, 1);
  }

  /* ---------- layout ---------- */
  function computeLayout() {
    const m = isMobile;
    const hz = m ? h * 0.33 : h * 0.47;
    const by0 = hz + (m ? 26 : 34);
    const by1 = m ? h * 0.60 : by0;
    const ry = m ? h * 0.735 : h * 0.80;
    const bottom = h - 70;
    const k = m ? clamp(w / 560, 0.55, 0.85) : clamp(w / 1440, 0.62, 1.12);
    const defs = m ? [
      ["hq", 0.16, 0], ["artcade", 0.53, 0], ["radio", 0.885, 0],
      ["merch", 0.22, 1], ["home", 0.55, 1], ["vet", 0.83, 1]
    ] : [
      ["hq", 0.085, 0], ["artcade", 0.235, 0], ["home", 0.385, 0],
      ["merch", 0.63, 0], ["vet", 0.765, 0], ["radio", 0.905, 0]
    ];
    const plaza = m ? { x: w * 0.5, y: by0 + Math.min(62, (by1 - by0) * 0.32) } : { x: w * 0.5, y: by0 + (ry - by0) * 0.38 };
    const regions = m ? [
      { x0: 12, x1: w - 12, y0: by0 + 8, y1: ry - 32 },
      { x0: 12, x1: w - 12, y0: ry + 32, y1: bottom - 14 }
    ] : [
      { x0: 14, x1: w - 14, y0: by0 + 10, y1: ry - 32 },
      { x0: 14, x1: w - 14, y0: ry + 32, y1: bottom - 12 }
    ];
    return { hz: hz, by0: by0, by1: by1, ry: ry, bottom: bottom, k: k, defs: defs, plaza: plaza, regions: regions, mobile: m };
  }

  /* building specs in unit coords: origin bottom-center, up is negative y */
  const BSPEC = {
    hq: { w: 170, h: 150, top: 200, door: 0, label: "TOASTER HQ", tap: "pop" },
    artcade: { w: 240, h: 172, top: 180, door: 0, label: "ARTCADE" },
    home: { w: 124, h: 96, top: 160, door: 0, label: "TOASTY HOME", tap: "family" },
    merch: { w: 152, h: 132, top: 170, door: 44, label: "MERCH · SHOP", href: "/shop" },
    vet: { w: 112, h: 110, top: 175, door: -14, label: "VET HALL", tap: "salute" },
    radio: { w: 100, h: 54, top: 265, door: 0, label: "TOASTER RADIO · MUSIC", href: "/music" }
  };
  const buildings = [];
  let places = [];

  function bakeBuilding(id) {
    const B = BSPEC[id];
    const cw = B.w + 60, ch = B.top + 10;
    return bake(cw, ch, function (g) {
      g.translate(cw / 2, ch - 4);
      g.lineJoin = "round";
      BDRAW[id](g, B);
    });
  }
  function stroke(g, col, lw) { g.strokeStyle = col || YELLOW; g.lineWidth = lw || 1.4; g.stroke(); }
  const BDRAW = {
    hq: function (g, B) {
      g.fillStyle = "#121214"; g.fillRect(-62, -182, 18, 60); g.strokeStyle = YELLOW; g.lineWidth = 1.2; g.strokeRect(-62, -182, 18, 60);
      g.fillStyle = "#1d1d20"; g.fillRect(-65, -186, 24, 6); g.strokeRect(-65, -186, 24, 6);
      const gr = g.createLinearGradient(-80, 0, 80, 0);
      gr.addColorStop(0, "#0b0b0d"); gr.addColorStop(0.3, "#2a2a30"); gr.addColorStop(0.55, "#16161a"); gr.addColorStop(1, "#08080a");
      g.fillStyle = gr; roundRect(g, -80, -142, 160, 138, 24); g.fill(); stroke(g, YELLOW, 2);
      g.fillStyle = "#000"; roundRect(g, -54, -148, 40, 10, 4); g.fill(); stroke(g, YELLOW, 1.2);
      roundRect(g, 14, -148, 40, 10, 4); g.fill(); stroke(g, YELLOW, 1.2);
      g.fillStyle = "#1a1a1e"; g.fillRect(80, -100, 8, 50); g.strokeRect(80, -100, 8, 50);
      g.fillStyle = "#0c0c0e"; g.fillRect(-74, -4, 20, 6); g.fillRect(54, -4, 20, 6);
      g.fillStyle = "rgba(255,255,255,0.06)"; roundRect(g, -70, -136, 30, 120, 14); g.fill();
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
        g.fillStyle = "#050505"; g.fillRect(-62 + c * 34, -96 + r * 24, 18, 13); g.strokeStyle = "rgba(255,212,0,0.45)"; g.lineWidth = 0.8; g.strokeRect(-62 + c * 34, -96 + r * 24, 18, 13);
      }
      g.fillStyle = "#050505"; g.beginPath(); g.moveTo(-13, 0); g.lineTo(-13, -30); g.arc(0, -30, 13, Math.PI, 0); g.lineTo(13, 0); g.closePath(); g.fill(); stroke(g, YELLOW, 1.4);
      g.fillStyle = "#222"; g.beginPath(); g.arc(60, -30, 7, 0, TAU); g.fill(); stroke(g, YELLOW, 1);
    },
    artcade: function (g, B) {
      g.fillStyle = "#0b0b0e"; g.fillRect(-120, -172, 240, 172); stroke(g, YELLOW, 2); g.strokeRect(-120, -172, 240, 172);
      g.fillStyle = "#000"; g.fillRect(-112, -168, 224, 36); g.strokeStyle = "rgba(255,212,0,0.6)"; g.lineWidth = 1; g.strokeRect(-112, -168, 224, 36);
      for (let i = 0; i < 24; i++) { g.fillStyle = i % 2 ? "#000" : YELLOW; g.fillRect(-120 + i * 10, -132, 10, 6); }
      g.fillStyle = "#030303"; g.fillRect(-108, -124, 216, 124);
      const fl = g.createLinearGradient(0, -40, 0, 0); fl.addColorStop(0, "rgba(255,212,0,0)"); fl.addColorStop(1, "rgba(255,212,0,0.12)");
      g.fillStyle = fl; g.fillRect(-108, -40, 216, 40);
      const names = ["ART", "CADE", "SKULLZ"];
      for (let i = 0; i < 3; i++) {
        const x = -68 + i * 68;
        g.fillStyle = "#111014";
        g.beginPath(); g.moveTo(x - 24, 0); g.lineTo(x - 24, -78); g.lineTo(x - 20, -96); g.lineTo(x + 20, -96); g.lineTo(x + 24, -78); g.lineTo(x + 24, 0); g.closePath(); g.fill(); stroke(g, YELLOW, 1.3);
        g.fillStyle = "#000"; g.fillRect(x - 18, -88, 36, 8); g.fillStyle = YELLOW; g.font = "800 7px monospace"; g.textAlign = "center"; g.fillText(names[i], x, -82);
        g.fillStyle = "#000"; g.fillRect(x - 18, -76, 36, 30); g.strokeStyle = "rgba(255,212,0,0.7)"; g.lineWidth = 1; g.strokeRect(x - 18, -76, 36, 30);
        g.fillStyle = "#1a1a1a"; g.beginPath(); g.moveTo(x - 22, -42); g.lineTo(x + 22, -42); g.lineTo(x + 24, -32); g.lineTo(x - 24, -32); g.closePath(); g.fill(); stroke(g, YELLOW, 1);
        g.fillStyle = "#ff3b3b"; g.beginPath(); g.arc(x - 10, -37, 2.2, 0, TAU); g.fill();
        g.fillStyle = YELLOW; g.beginPath(); g.arc(x + 4, -37, 2.2, 0, TAU); g.arc(x + 11, -37, 2.2, 0, TAU); g.fill();
      }
    },
    home: function (g, B) {
      g.fillStyle = "#121212"; g.fillRect(28, -140, 14, 40); g.strokeStyle = YELLOW; g.lineWidth = 1; g.strokeRect(28, -140, 14, 40);
      g.fillStyle = "#0d0b09"; g.fillRect(-58, -92, 116, 92); stroke(g, YELLOW, 1.6); g.strokeRect(-58, -92, 116, 92);
      g.fillStyle = "#16120a"; g.beginPath(); g.moveTo(-68, -90); g.lineTo(0, -138); g.lineTo(68, -90); g.closePath(); g.fill(); stroke(g, YELLOW, 1.8);
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
        if (r === 1 && c === 1) continue;
        g.fillStyle = "#050505"; g.fillRect(-46 + c * 34, -80 + r * 34, 22, 18); g.strokeStyle = "rgba(255,212,0,0.6)"; g.lineWidth = 0.8; g.strokeRect(-46 + c * 34, -80 + r * 34, 22, 18);
      }
      g.fillStyle = "#050505"; g.beginPath(); g.arc(0, -114, 8, 0, TAU); g.fill(); g.strokeStyle = "rgba(255,212,0,0.6)"; g.stroke();
      g.fillStyle = "#1a0f06"; g.fillRect(-11, -34, 22, 34); stroke(g, YELLOW, 1.2); g.strokeRect(-11, -34, 22, 34);
      g.fillStyle = "#ff5fa2"; heartPath(g, 0, -28, 9); g.fill();
      g.strokeStyle = "rgba(255,212,0,0.5)"; g.lineWidth = 1; g.beginPath();
      for (let i = -56; i <= 56; i += 8) { g.moveTo(i, 0); g.lineTo(i, -8); } g.moveTo(-60, -6); g.lineTo(60, -6); g.stroke();
    },
    merch: function (g, B) {
      g.fillStyle = "#0b0b0c"; g.fillRect(-76, -132, 152, 132); stroke(g, YELLOW, 1.8); g.strokeRect(-76, -132, 152, 132);
      g.fillStyle = "#000"; g.fillRect(-70, -128, 140, 24); g.strokeStyle = "rgba(255,212,0,0.5)"; g.lineWidth = 1; g.strokeRect(-70, -128, 140, 24);
      for (let i = 0; i < 10; i++) {
        g.fillStyle = i % 2 ? "#000" : YELLOW;
        g.beginPath(); g.moveTo(-80 + i * 16, -102); g.lineTo(-64 + i * 16, -102); g.lineTo(-64 + i * 16, -90); g.arc(-72 + i * 16, -90, 8, 0, Math.PI); g.closePath(); g.fill();
      }
      g.strokeStyle = YELLOW; g.lineWidth = 1; g.strokeRect(-80, -102, 160, 12);
      g.fillStyle = "#030303"; g.fillRect(-66, -78, 86, 66); g.strokeStyle = YELLOW; g.lineWidth = 1.4; g.strokeRect(-66, -78, 86, 66);
      g.fillStyle = "#070707"; g.fillRect(31, -62, 28, 62); g.strokeRect(31, -62, 28, 62);
      g.fillStyle = YELLOW; g.beginPath(); g.arc(53, -30, 2, 0, TAU); g.fill();
      g.strokeStyle = "rgba(255,212,0,0.5)"; g.beginPath(); g.moveTo(-23, -76); g.lineTo(-23, -68); g.stroke();
    },
    vet: function (g, B) {
      g.strokeStyle = "#cfcfcf"; g.lineWidth = 2; g.beginPath(); g.moveTo(66, 0); g.lineTo(66, -170); g.stroke();
      g.fillStyle = YELLOW; g.beginPath(); g.arc(66, -172, 3, 0, TAU); g.fill();
      g.fillStyle = "#0d0c0b"; g.fillRect(-56, -110, 112, 110); stroke(g, YELLOW, 1.6); g.strokeRect(-56, -110, 112, 110);
      g.strokeStyle = "rgba(255,212,0,0.09)"; g.lineWidth = 1; g.beginPath();
      for (let y = -104; y < 0; y += 8) { g.moveTo(-56, y); g.lineTo(56, y); const off = ((y / 8) | 0) % 2 ? 0 : 7; for (let x = -56 + off; x < 56; x += 14) { g.moveTo(x, y); g.lineTo(x, y + 8); } }
      g.stroke();
      g.fillStyle = "#000"; g.fillRect(-50, -104, 100, 22); g.strokeStyle = "rgba(255,212,0,0.6)"; g.strokeRect(-50, -104, 100, 22);
      g.fillStyle = YELLOW; star(g, 0, -62, 11);
      g.fillStyle = "#050505"; g.fillRect(-46, -48, 18, 16); g.fillRect(28, -48, 18, 16);
      g.strokeStyle = "rgba(255,212,0,0.5)"; g.strokeRect(-46, -48, 18, 16); g.strokeRect(28, -48, 18, 16);
      g.fillStyle = "#120c06"; g.fillRect(-28, -36, 28, 36); stroke(g, YELLOW, 1.2); g.strokeRect(-28, -36, 28, 36);
      g.beginPath(); g.moveTo(-14, -36); g.lineTo(-14, 0); g.stroke();
    },
    radio: function (g, B) {
      g.strokeStyle = YELLOW; g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(-26, -50); g.lineTo(0, -255); g.lineTo(26, -50);
      const lv = 9;
      for (let i = 0; i < lv; i++) {
        const t0 = i / lv, t1 = (i + 1) / lv;
        const y0 = -50 - t0 * 205, y1 = -50 - t1 * 205;
        const x0 = 26 * (1 - t0), x1 = 26 * (1 - t1);
        g.moveTo(-x0, y0); g.lineTo(x1, y1); g.moveTo(x0, y0); g.lineTo(-x1, y1); g.moveTo(-x1, y1); g.lineTo(x1, y1);
      }
      g.stroke();
      g.fillStyle = "#0c0c0e"; g.fillRect(-48, -54, 96, 54); stroke(g, YELLOW, 1.6); g.strokeRect(-48, -54, 96, 54);
      g.fillStyle = "#000"; g.fillRect(-42, -30, 52, 24); g.strokeStyle = "rgba(255,212,0,0.5)"; g.lineWidth = 1; g.strokeRect(-42, -30, 52, 24);
      g.fillStyle = "#070707"; g.fillRect(18, -32, 20, 32); g.strokeStyle = YELLOW; g.strokeRect(18, -32, 20, 32);
    }
  };

  function buildWorld() {
    L = computeLayout();
    buildings.length = 0;
    for (let i = 0; i < L.defs.length; i++) {
      const d = L.defs[i], id = d[0], B = BSPEC[id];
      const by = d[2] === 0 ? L.by0 : L.by1;
      const b = {
        id: id, spec: B, x: w * d[1], by: by, k: L.k, row: d[2], body: bakeBuilding(id), inside: 0, t: rand(0, 10),
        windows: [], flash: 0, pop: 0
      };
      b.doorX = b.x + B.door * L.k; b.doorY = by + 5;
      b.x0 = b.x - (B.w / 2) * L.k; b.x1 = b.x + (B.w / 2) * L.k; b.y0 = by - B.h * L.k;
      makeWindows(b);
      buildings.push(b);
    }
    /* places (clickable) */
    places = [];
    const ac = byId("artcade");
    if (ac) {
      const ids = [["art", "ART · GLITCH ART", "/glitch-art"], ["cade", "CADE · ARCADE", "/arcade"], ["skullz", "SKULLZ", "/skullz"]];
      for (let i = 0; i < 3; i++) {
        const cx = ac.x + (-68 + i * 68) * ac.k;
        places.push({ id: ids[i][0], label: ids[i][1], href: SITE + ids[i][2], x: cx - 28 * ac.k, y: ac.by - 100 * ac.k, w: 56 * ac.k, h: 100 * ac.k, b: ac, cab: i });
      }
    }
    const me = byId("merch");
    if (me) places.push({ id: "merch", label: "MERCH · SHOP", href: SITE + "/shop", x: me.x0, y: me.by - 160 * me.k, w: me.x1 - me.x0, h: 160 * me.k, b: me });
    const ra = byId("radio");
    if (ra) places.push({ id: "radio", label: "TOASTER RADIO · MUSIC", href: SITE + "/music", x: ra.x - 50 * ra.k, y: ra.by - 265 * ra.k, w: 100 * ra.k, h: 265 * ra.k, b: ra });
    /* arcade player spots, merch queue */
    bakeBackdrops();
    initSkyBits();
    bgDirty = true;
  }
  function byId(id) { for (let i = 0; i < buildings.length; i++) if (buildings[i].id === id) return buildings[i]; return null; }
  function makeWindows(b) {
    const W2 = [];
    const add = function (x, y, ww, hh) { W2.push({ x: x, y: y, w: ww, h: hh, lit: Math.random() < 0.6, next: rand(0.5, 8), warm: Math.random() < 0.5 }); };
    if (b.id === "hq") { for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) add(-62 + c * 34, -96 + r * 24, 18, 13); }
    else if (b.id === "home") { for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { if (r === 1 && c === 1) continue; add(-46 + c * 34, -80 + r * 34, 22, 18); } }
    else if (b.id === "vet") { add(-46, -48, 18, 16); add(28, -48, 18, 16); }
    else if (b.id === "merch") { add(31, -62, 28, 62); }
    else if (b.id === "radio") { add(18, -32, 20, 32); }
    b.windows = W2;
  }

  /* ---------- backdrops: stars, skyline layers, ground ---------- */
  let starCanvas = null, farCanvas = null, midCanvas = null, groundCanvas = null, scanCanvas = null;
  let antennas = [];
  const PARALLAX_PAD = 80;
  function bakeBackdrops() {
    const hz = L.hz;
    starCanvas = bake(w, hz, function (g) {
      const n = Math.round(w * hz / 2600);
      for (let i = 0; i < n; i++) {
        const a = Math.random();
        g.fillStyle = a < 0.15 ? "rgba(255,212,0," + rand(0.4, 0.9) + ")" : "rgba(255,250,230," + rand(0.15, 0.7) + ")";
        const s = Math.random() < 0.08 ? 1.6 : 0.9;
        g.fillRect(Math.random() * w, Math.random() * hz * 0.95, s, s);
      }
    }, Math.min(dpr, 1.5));
    antennas = [];
    function skyline(layer) {
      const cw = w + PARALLAX_PAD * 2;
      const maxH = layer === 0 ? (isMobile ? 120 : 210) : (isMobile ? 80 : 150);
      return bake(cw, maxH + 30, function (g, ww, hh) {
        let x = -10;
        const base = hh;
        while (x < cw) {
          const bw = layer === 0 ? rand(18, 46) : rand(26, 64);
          const bh = rand(maxH * 0.25, maxH) * (Math.random() < 0.15 ? 1 : 0.75);
          g.fillStyle = layer === 0 ? "#0c0b10" : "#050507";
          g.fillRect(x, base - bh, bw, bh);
          g.strokeStyle = layer === 0 ? "rgba(255,212,0,0.07)" : "rgba(255,212,0,0.16)";
          g.lineWidth = 1; g.strokeRect(x + 0.5, base - bh + 0.5, bw - 1, bh);
          if (Math.random() < 0.3) {
            const ah = rand(8, 26);
            g.strokeStyle = layer === 0 ? "rgba(255,212,0,0.15)" : "rgba(255,212,0,0.35)";
            g.beginPath(); g.moveTo(x + bw / 2, base - bh); g.lineTo(x + bw / 2, base - bh - ah); g.stroke();
            antennas.push({ layer: layer, x: x + bw / 2, y: base - bh - ah, hh: hh, ph: rand(0, TAU), sp: rand(1.2, 2.4) });
          }
          const ws = layer === 0 ? 2 : 3, gap = layer === 0 ? 5 : 7;
          for (let wy = base - bh + 6; wy < base - 4; wy += gap) {
            for (let wx = x + 4; wx < x + bw - 4; wx += gap) {
              if (Math.random() < (layer === 0 ? 0.22 : 0.18)) {
                g.fillStyle = Math.random() < 0.7 ? "rgba(255,212,0," + rand(0.25, 0.8) + ")" : "rgba(255,240,210," + rand(0.2, 0.6) + ")";
                g.fillRect(wx, wy, ws, ws);
              }
            }
          }
          if (layer === 1 && Math.random() < 0.12) {
            g.fillStyle = YELLOW; g.globalAlpha = 0.6; g.fillRect(x + 3, base - bh - 3, bw - 6, 2); g.globalAlpha = 1;
          }
          x += bw + (layer === 0 ? rand(0, 6) : rand(2, 14));
        }
      }, Math.min(dpr, 1.5));
    }
    farCanvas = skyline(0);
    midCanvas = skyline(1);
    groundCanvas = bake(w, h - hz, function (g, ww, hh) {
      g.fillStyle = "#050400"; g.fillRect(0, 0, ww, hh);
      const gr = g.createLinearGradient(0, 0, 0, hh);
      gr.addColorStop(0, "rgba(255,212,0,0.07)"); gr.addColorStop(0.3, "rgba(255,212,0,0.02)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr; g.fillRect(0, 0, ww, hh);
      g.strokeStyle = "rgba(255,212,0,0.13)"; g.lineWidth = 0.8;
      const vpx = ww / 2, vpy = -30, cols = isMobile ? 12 : 26;
      for (let i = -cols; i <= cols; i++) { g.beginPath(); g.moveTo(vpx + i * (ww / cols) * 1.4, hh); g.lineTo(vpx, vpy); g.stroke(); }
      for (let k = 1; k <= 18; k++) { const t = k / 18, y = Math.pow(t, 1.6) * hh; g.globalAlpha = 0.25 + t * 0.6; g.beginPath(); g.moveTo(0, y); g.lineTo(ww, y); g.stroke(); }
      g.globalAlpha = 1;
      /* sidewalk strip along building rows */
      const sw = function (y) { g.fillStyle = "rgba(255,212,0,0.05)"; g.fillRect(0, y - hz - 2, ww, 10); g.fillStyle = "rgba(255,212,0,0.25)"; g.fillRect(0, y - hz + 8, ww, 1); };
      sw(L.by0); if (L.by1 !== L.by0) sw(L.by1);
      /* plaza */
      g.save(); g.translate(L.plaza.x, L.plaza.y - hz); g.scale(1, 0.3);
      const pr = isMobile ? 90 : 170;
      g.strokeStyle = "rgba(255,212,0,0.5)"; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, pr, 0, TAU); g.stroke();
      g.strokeStyle = "rgba(255,212,0,0.22)"; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, pr * 0.72, 0, TAU); g.stroke();
      g.beginPath(); g.arc(0, 0, pr * 0.2, 0, TAU); g.fillStyle = "rgba(255,212,0,0.1)"; g.fill(); g.stroke();
      g.restore();
      /* road */
      const ry = L.ry - hz;
      g.fillStyle = "#0e0e0c"; g.fillRect(0, ry - 26, ww, 52);
      g.fillStyle = "rgba(255,212,0,0.28)"; g.fillRect(0, ry - 26, ww, 2); g.fillRect(0, ry + 24, ww, 2);
      /* crosswalk */
      const cx = L.plaza.x;
      g.fillStyle = "rgba(255,255,255,0.12)";
      for (let i = 0; i < 6; i++) g.fillRect(cx - 40 + i * 14, ry - 22, 8, 44);
      /* charge pad */
      const px = isMobile ? w * 0.18 : w * 0.18;
      g.setLineDash([5, 4]); g.strokeStyle = "rgba(255,212,0,0.6)"; g.lineWidth = 1.2; g.strokeRect(px - 44, ry - 22, 88, 20); g.setLineDash([]);
      g.fillStyle = YELLOW; g.font = "700 8px ui-monospace, monospace"; g.textAlign = "center"; g.fillText("⚡ CHARGE", px, ry - 30);
    }, Math.min(dpr, 1.5));
    L.chargeX = w * 0.18;
    scanCanvas = bake(w, h, function (g, ww, hh) {
      g.fillStyle = "rgba(0,0,0,0.16)";
      for (let y = 0; y < hh; y += 3) g.fillRect(0, y, ww, 1);
      const v = g.createRadialGradient(ww / 2, hh / 2, Math.min(ww, hh) * 0.35, ww / 2, hh / 2, Math.max(ww, hh) * 0.75);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
      g.fillStyle = v; g.fillRect(0, 0, ww, hh);
    }, 1);
  }
  function initSkyBits() {
    clouds.length = 0;
    const n = isMobile ? 4 : 7;
    for (let i = 0; i < n; i++) clouds.push({ x: rand(-200, w), y: rand(L.hz * 0.12, L.hz * 0.75), sc: rand(0.8, 1.9), sp: rand(4, 14), img: pick(S.cloud) });
    stars2.length = 0;
    for (let i = 0; i < (isMobile ? 24 : 50); i++) stars2.push({ x: rand(0, w), y: rand(0, L.hz * 0.9), ph: rand(0, TAU), sp: rand(1, 4), s: rand(1, 2.2) });
  }

  /* ---------- audio-driven levels ---------- */
  let lvl = 0, bass = 0, beat = 0, bins = null; /* filled by audio part */
  let party = 0; /* 0..1 block party intensity */

  /* ---------- sky ---------- */
  const shooting = [];
  let bgCanvas = null, bgCtx = null, bgAge = 99, bgPar = 0, bgDirty = true;
  function skylineOffsets(px) { return { fx: -PARALLAX_PAD + px * 18, mx: -PARALLAX_PAD + px * 40 }; }
  function paintBackdrop() {
    const cw = Math.floor(w * dpr), ch = Math.floor(h * dpr);
    if (!bgCanvas || bgCanvas.width !== cw || bgCanvas.height !== ch) { bgCanvas = document.createElement("canvas"); bgCanvas.width = cw; bgCanvas.height = ch; bgCtx = bgCanvas.getContext("2d", { alpha: false }); }
    const g = bgCtx, sk = skyNow, hz = L.hz;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gr = g.createLinearGradient(0, 0, 0, hz);
    gr.addColorStop(0, rgba(sk.top, 1)); gr.addColorStop(1, rgba(sk.bot, 1));
    g.fillStyle = gr; g.fillRect(0, 0, w, hz + 2);
    const hr = sk.hour;
    if (hr > 6 && hr < 19.5) {
      const p = (hr - 6) / 13.5;
      const sx = w * (0.1 + 0.8 * p), sy = hz * (0.9 - Math.sin(p * Math.PI) * 0.75);
      g.globalCompositeOperation = "lighter";
      g.globalAlpha = 0.55; g.drawImage(S.warm, sx - 102, sy - 102, 204, 204);
      g.globalAlpha = 0.9; g.drawImage(S.glow, sx - 29, sy - 29, 58, 58);
      g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
      g.fillStyle = "#FFE680"; g.beginPath(); g.arc(sx, sy, 16, 0, TAU); g.fill();
    } else {
      const hh = hr < 12 ? hr + 24 : hr;
      const p = clamp((hh - 19.5) / 10.5, 0, 1);
      const mx = w * (0.85 - 0.7 * p), my = hz * (0.75 - Math.sin(p * Math.PI) * 0.55);
      g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35; g.drawImage(S.white, mx - 51, my - 51, 102, 102); g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
      g.fillStyle = "#F5EDCF"; g.beginPath(); g.arc(mx, my, 13, 0, TAU); g.fill();
      g.fillStyle = rgba(sk.top, 1); g.beginPath(); g.arc(mx + 6, my - 3, 11, 0, TAU); g.fill();
    }
    if (sk.stars > 0.02) { g.globalAlpha = sk.stars; g.drawImage(starCanvas, 0, 0, w, hz); g.globalAlpha = 1; }
    const o = skylineOffsets(parX);
    g.drawImage(farCanvas, o.fx, hz - farCanvas.ch, farCanvas.cw, farCanvas.ch);
    g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.18 + sk.lights * 0.25;
    g.drawImage(S.glow, -w * 0.2, hz - 90, w * 1.4, 180);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    g.drawImage(midCanvas, o.mx, hz - midCanvas.ch, midCanvas.cw, midCanvas.ch);
    g.drawImage(groundCanvas, 0, hz, w, h - hz);
    g.fillStyle = "rgba(255,212,0,0.5)";
    for (let x = 0; x < w; x += 34) g.fillRect(x, L.ry - 1, 18, 2);
    g.drawImage(scanCanvas, 0, 0, w, h);
    bgAge = 0; bgPar = parX; bgDirty = false;
  }
  function drawSky(t, dt) {
    const sk = skyNow, hz = L.hz;
    bgAge += dt;
    if (bgDirty || bgAge > 3 || Math.abs(parX - bgPar) > 0.035) paintBackdrop();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bgCanvas, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (sk.stars > 0.02) {
      for (let i = 0; i < stars2.length; i++) {
        const s = stars2[i]; const a = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
        ctx.globalAlpha = sk.stars * a; ctx.fillStyle = i % 5 ? "#FFF6D8" : YELLOW; ctx.fillRect(s.x, s.y, s.s, s.s);
      }
      ctx.globalAlpha = 1;
    }
    if (!reduced && sk.stars > 0.3 && Math.random() < dt * 0.09) spawnShootingStar();
    for (let i = shooting.length - 1; i >= 0; i--) {
      const s = shooting[i]; s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.life <= 0) { shooting.splice(i, 1); continue; }
      const a = Math.min(1, s.life * 2);
      const gr = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 0.12, s.y - s.vy * 0.12);
      gr.addColorStop(0, "rgba(255,246,200," + a + ")"); gr.addColorStop(1, "rgba(255,212,0,0)");
      ctx.strokeStyle = gr; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 0.12, s.y - s.vy * 0.12); ctx.stroke();
    }
    ctx.globalAlpha = Math.min(1, 0.5 + (1 - sk.stars) * 0.9);
    for (let i = 0; i < clouds.length; i++) {
      const c = clouds[i]; c.x += c.sp * dt * (weather.kind === "rain" ? 2.2 : 1);
      if (c.x > w + 40) { c.x = -c.img.cw * c.sc - 40; c.y = rand(hz * 0.1, hz * 0.6); }
      ctx.drawImage(c.img, c.x, c.y, c.img.cw * c.sc, c.img.ch * c.sc);
    }
    ctx.globalAlpha = 1;
    const o = skylineOffsets(bgPar);
    for (let i = 0; i < antennas.length; i++) {
      const a = antennas[i];
      if (Math.sin(t * a.sp + a.ph) <= 0.75) continue;
      const ox = a.layer === 0 ? o.fx : o.mx, cvs = a.layer === 0 ? farCanvas : midCanvas;
      const ax = ox + a.x, ay = hz - cvs.ch + a.y;
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a.layer ? 0.9 : 0.5; ctx.drawImage(S.glow, ax - 7, ay - 7, 14, 14); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      ctx.fillStyle = "#FFF3B0"; ctx.fillRect(ax - 0.8, ay - 0.8, 1.6, 1.6);
    }
    if (lvl > 0.05) {
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = Math.min(0.5, lvl * 0.4);
      ctx.drawImage(S.glow, w * 0.1, hz - 50, w * 0.8, 100);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = 0.3 + (weather.kind === "rain" ? 0.3 : 0);
    const fo = (t * 10) % (w + 400);
    ctx.drawImage(S.cloud[0], fo - 400, hz - 40, 600, 70);
    ctx.globalAlpha = 1;
  }
  function spawnShootingStar() {
    const dir = chance(0.5) ? 1 : -1;
    shooting.push({ x: rand(w * 0.1, w * 0.9), y: rand(10, L.hz * 0.4), vx: dir * rand(380, 620), vy: rand(120, 220), life: rand(0.5, 0.9) });
  }

  /* ---------- logo sign (official PNG) ---------- */
  let logoGlitch = 0, holo = 0;
  function logoRect() {
    const img = logoImg();
    const ratio = img && img.naturalWidth ? img.naturalHeight / img.naturalWidth : (img && img.width ? img.height / img.width : 0.356);
    const lw = isMobile ? Math.min(w * 0.74, 320) : Math.min(520, w * 0.36);
    const lh = lw * (ratio || 0.356);
    const lx = (w - lw) / 2, ly = isMobile ? 70 : 62;
    return { x: lx, y: ly, w: lw, h: lh };
  }
  function drawLogoAt(x, y, lw, lh, glitch, alpha) {
    const img = logoImg();
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    ctx.globalAlpha = alpha;
    if (glitch > 0.01) {
      const slices = 7;
      for (let i = 0; i < slices; i++) {
        const sy = (ih / slices) * i, sh = ih / slices;
        const off = (Math.random() < glitch ? rand(-1, 1) * 22 * glitch : 0);
        ctx.drawImage(img, 0, sy, iw, sh, x + off, y + (lh / slices) * i, lw, lh / slices);
      }
      if (Math.random() < glitch) {
        ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = alpha * 0.35;
        ctx.drawImage(img, x + 4, y, lw, lh);
        ctx.globalCompositeOperation = "source-over";
      }
    } else {
      ctx.drawImage(img, x, y, lw, lh);
    }
    ctx.globalAlpha = 1;
  }
  function drawLogoSign(t) {
    if (!logoReady) return;
    const r = logoRect();
    const bob = Math.sin(t * 0.9) * 3;
    ctx.strokeStyle = "rgba(255,212,0,0.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(r.x + r.w * 0.14, 0); ctx.lineTo(r.x + r.w * 0.14, r.y + bob + 6); ctx.moveTo(r.x + r.w * 0.86, 0); ctx.lineTo(r.x + r.w * 0.86, r.y + bob + 6); ctx.stroke();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.28 + 0.14 * Math.sin(t * 2) + logoPulse * 0.4 + lvl * 0.35;
    ctx.drawImage(S.glow, r.x - r.w * 0.15, r.y - r.h * 0.4 + bob, r.w * 1.3, r.h * 1.8);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    if (Math.random() < 0.004) logoGlitch = Math.max(logoGlitch, 0.6);
    const flick = holo > 0 && Math.random() < 0.12 ? 0.35 : 1;
    drawLogoAt(r.x, r.y + bob, r.w, r.h, logoGlitch, flick);
  }
  function drawHologram(t) {
    if (holo <= 0 || !logoReady) return;
    const a = Math.min(1, holo) * (0.55 + 0.25 * Math.sin(t * 30) * (Math.random() < 0.3 ? 1 : 0.2));
    const px = L.plaza.x, py = L.plaza.y;
    const hw = isMobile ? Math.min(w * 0.7, 280) : Math.min(420, w * 0.3);
    const img = logoImg(), ratio = (img.naturalHeight || img.height) / (img.naturalWidth || img.width) || 0.356;
    const hh = hw * ratio;
    const top = py - hh - (isMobile ? 40 : 70);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = a * 0.6;
    ctx.drawImage(S.beam, px - hw / 2, top + hh * 0.5, hw, py - top - hh * 0.5);
    ctx.globalAlpha = a * 0.8;
    drawLogoAt(px - hw / 2, top + Math.sin(t * 3) * 3, hw, hh, 0.25 + Math.random() * 0.3, a * 0.85);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    for (let y = top; y < top + hh; y += 3) ctx.fillRect(px - hw / 2, y, hw, 1);
    ctx.globalAlpha = 1;
    ctx.fillStyle = YELLOW; ctx.beginPath(); ctx.ellipse(px, py, 16, 5, 0, 0, TAU); ctx.fill();
  }

  /* ---------- buildings ---------- */
  function signFlicker(b, t) {
    if (b.dropout > 0) { b.dropout -= 1 / 60; return 0.18; }
    if (Math.random() < 0.003) b.dropout = rand(0.05, 0.35);
    return 0.82 + 0.18 * Math.sin(t * 40 + b.t) * (Math.random() < 0.5 ? 1 : 0.3);
  }
  function drawSign(img, x, y, a, glitch) {
    ctx.globalAlpha = a;
    const dx = glitch ? rand(-6, 6) : 0;
    ctx.drawImage(img, x - img.cw / 2 + dx, y - img.ch / 2, img.cw, img.ch);
    if (glitch && Math.random() < 0.5) {
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a * 0.5;
      ctx.drawImage(img, x - img.cw / 2 - dx * 1.5, y - img.ch / 2 + 1, img.cw, img.ch);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.globalAlpha = 1;
  }
  function drawBuilding(b, t, dt) {
    const k = b.k, B = b.spec;
    ctx.drawImage(b.body, b.x - (b.body.cw / 2) * k, b.by + 4 * k - b.body.ch * k, b.body.cw * k, b.body.ch * k);
    ctx.save();
    ctx.translate(b.x, b.by); ctx.scale(k, k);
    const glitchy = storm > 0 && Math.random() < 0.25;
    const sa = signFlicker(b, t);
    b.flash = Math.max(0, b.flash - dt * 3);
    /* windows */
    const pLit = clamp(0.2 + skyNow.lights * 0.55 + b.inside * 0.06, 0, 0.95);
    for (let i = 0; i < b.windows.length; i++) {
      const wd = b.windows[i];
      wd.next -= dt;
      if (wd.next <= 0) { wd.lit = Math.random() < pLit; wd.next = rand(1.5, 9); wd.flick = Math.random() < 0.12 ? rand(0.3, 1.2) : 0; }
      let on = wd.lit || b.flash > 0.3;
      if (wd.flick > 0) { wd.flick -= dt; on = on && Math.random() < 0.55; }
      if (!on) continue;
      ctx.fillStyle = wd.warm ? "rgba(255,190,90,0.82)" : "rgba(255,212,0,0.78)";
      ctx.fillRect(wd.x + 1, wd.y + 1, wd.w - 2, wd.h - 2);
      if ((skyNow.lights > 0.5 || b.flash > 0.3) && quality < 2) {
        ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.35;
        ctx.drawImage(S.warm, wd.x - wd.w, wd.y - wd.h, wd.w * 3, wd.h * 3);
        ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      }
    }
    const fn = BDYN[b.id];
    if (fn) fn(b, t, dt, sa, glitchy);
    ctx.restore();
  }
  function toWorld(b, ux, uy) { return { x: b.x + ux * b.k, y: b.by + uy * b.k }; }
  const BDYN = {
    hq: function (b, t, dt, sa, gl) {
      drawSign(S.neon.hq, 0, -120, sa, gl);
      const heat = 0.35 + 0.25 * Math.sin(t * 3) + b.pop * 0.5;
      ctx.fillStyle = "rgba(255,120,20," + heat + ")"; ctx.fillRect(-51, -146, 34, 5); ctx.fillRect(17, -146, 34, 5);
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = heat * 0.6;
      ctx.drawImage(S.warm, -60, -170, 50, 40); ctx.drawImage(S.warm, 8, -170, 50, 40);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      /* popping toast */
      if (b.pop > 0) {
        b.pop -= dt * 0.8;
        const p = 1 - b.pop; const yy = -146 - Math.sin(clamp(p, 0, 1) * Math.PI) * 70;
        ctx.drawImage(S.cit_toast, -34 - 22, yy - 26, 44, 44);
        ctx.drawImage(S.cit_golden, 34 - 22, yy - 20 + Math.sin(p * 9) * 3, 44, 44);
      }
      const lev = b.pop > 0 ? -58 : -96;
      ctx.fillStyle = "#333"; ctx.fillRect(84, lev, 16, 7); ctx.strokeStyle = YELLOW; ctx.lineWidth = 1; ctx.strokeRect(84, lev, 16, 7);
      /* dial */
      ctx.strokeStyle = YELLOW; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(60, -30); ctx.lineTo(60 + Math.cos(t * 0.7) * 6, -30 + Math.sin(t * 0.7) * 6); ctx.stroke();
      b.smokeT = (b.smokeT || 0) - dt;
      if (b.smokeT <= 0) { b.smokeT = reduced ? 0.8 : (b.pop > 0 ? 0.08 : 0.22); const p = toWorld(b, -53, -188); emitSmoke(p.x, p.y, b.k, b.pop > 0); }
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t * 2);
      ctx.drawImage(S.neon.open, -S.neon.open.cw / 2, -46 - S.neon.open.ch / 2, S.neon.open.cw, S.neon.open.ch);
      ctx.globalAlpha = 1;
    },
    artcade: function (b, t, dt, sa, gl) {
      drawSign(S.neon.artcade, 0, -150, sa, gl);
      const n = 26, step = Math.floor(t * 9);
      for (let i = 0; i < n; i++) {
        const on = (i + step) % 3 === 0;
        const px = i < 13 ? -108 + i * 18 : -108 + (i - 13) * 18;
        const py = i < 13 ? -170 : -130;
        ctx.fillStyle = on ? "#FFF6C2" : "rgba(255,212,0,0.25)"; ctx.fillRect(px, py, 3, 3);
      }
      for (let i = 0; i < 3; i++) {
        const x = -68 + i * 68, sx = x - 17, sy = -75, sw = 34, sh = 28;
        ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
        ctx.fillStyle = "#020202"; ctx.fillRect(sx, sy, sw, sh);
        if (i === 0) {
          const cols = [YELLOW, "#ff3bd4", "#29e7ff", "#fff"];
          for (let r = 0; r < 9; r++) {
            const yy = sy + ((r * 3.3 + t * 18) % sh);
            ctx.fillStyle = cols[(r + ((t * 7) | 0)) % 4]; ctx.globalAlpha = 0.85;
            ctx.fillRect(sx + Math.sin(t * 13 + r * 1.7) * 10 + 8, yy, 6 + ((Math.sin(t * 5 + r) + 1) * 9), 2);
          }
          ctx.globalAlpha = 1;
        } else if (i === 1) {
          const bx = sx + 3 + Math.abs(((t * 22) % 56) - 28), byy = sy + 3 + Math.abs(((t * 17) % 44) - 22);
          ctx.fillStyle = YELLOW; ctx.fillRect(bx, byy, 2.5, 2.5);
          ctx.fillRect(sx + 1, clamp(byy - 4, sy, sy + sh - 9), 2, 9); ctx.fillRect(sx + sw - 3, clamp(byy - 5 + Math.sin(t * 3) * 3, sy, sy + sh - 9), 2, 9);
          ctx.fillStyle = "rgba(255,212,0,0.35)"; for (let yy = sy; yy < sy + sh; yy += 4) ctx.fillRect(sx + sw / 2, yy, 1, 2);
        } else {
          const blink = Math.sin(t * 4) > 0.9;
          ctx.drawImage(S.cit_skull, sx + 4, sy - 1 + Math.sin(t * 2) * 1.5, 28, 28);
          if (blink) { ctx.fillStyle = YELLOW; ctx.fillRect(sx + 9, sy + 11, 18, 3); }
          ctx.fillStyle = "rgba(255,212,0,0.6)";
          for (let d = 0; d < 5; d++) ctx.fillRect(sx + ((d * 7 + 3) % sw), sy + ((t * 30 + d * 9) % sh), 1.5, 3);
        }
        ctx.restore();
        ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 9 + i);
        ctx.drawImage(S.glow, x - 34, -90, 68, 60);
        ctx.globalAlpha = 0.22; ctx.drawImage(S.glow, x - 40, -14, 80, 24);
        ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
        if (hoverPlace && hoverPlace.b === b && hoverPlace.cab === i) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(x - 25, -97, 50, 97); }
      }
    },
    home: function (b, t, dt, sa, gl) {
      drawSign(S.neon.home, 0, -98, sa * 0.9, gl);
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 2.4);
      ctx.drawImage(S.pink, -16, -36, 32, 26);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      if (skyNow.lights > 0.4) { ctx.fillStyle = "rgba(255,190,90,0.7)"; ctx.beginPath(); ctx.arc(0, -114, 6.5, 0, TAU); ctx.fill(); }
      b.smokeT = (b.smokeT || 0) - dt;
      if (b.smokeT <= 0) { b.smokeT = reduced ? 1.4 : 0.5; const p = toWorld(b, 35, -142); emitSmoke(p.x, p.y, b.k * 0.7, false); }
    },
    merch: function (b, t, dt, sa, gl) {
      drawSign(S.neon.merch, 0, -116, sa, gl);
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.5; ctx.drawImage(S.glow, -60, -80, 74, 70); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      const c = Math.cos(t * 1.8);
      ctx.save(); ctx.translate(-23, -44); ctx.scale(Math.abs(c) < 0.06 ? 0.06 : c, 1);
      ctx.drawImage(S.shirt, -24, -24, 48, 48);
      ctx.restore();
      if (Math.sin(t * 3) > -0.2) ctx.drawImage(S.neon.newdrop, -23 - S.neon.newdrop.cw / 2, -72 - S.neon.newdrop.ch / 2, S.neon.newdrop.cw, S.neon.newdrop.ch);
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 2.2);
      ctx.drawImage(S.neon.open, 45 - S.neon.open.cw / 2, -74 - S.neon.open.ch / 2, S.neon.open.cw, S.neon.open.ch);
      ctx.globalAlpha = 1;
      if (hoverPlace && hoverPlace.b === b) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(-78, -134, 156, 134); }
    },
    vet: function (b, t, dt, sa, gl) {
      drawSign(S.neon.vet, 0, -93, sa, gl);
      const fx = 66, fy = -168, fw = 46, fh = 28, segs = 10;
      ctx.beginPath();
      for (let i = 0; i <= segs; i++) { const u = i / segs; ctx.lineTo(fx + u * fw, fy + Math.sin(t * 5 - u * 5) * 3.5 * u); }
      for (let i = segs; i >= 0; i--) { const u = i / segs; ctx.lineTo(fx + u * fw, fy + fh + Math.sin(t * 5 - u * 5) * 3.5 * u); }
      ctx.closePath(); ctx.fillStyle = "#0a0a0a"; ctx.fill(); ctx.strokeStyle = YELLOW; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = YELLOW; star(ctx, fx + fw * 0.45, fy + fh / 2 + Math.sin(t * 5 - 2.2) * 1.6, 7);
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * 1.5);
      ctx.drawImage(S.glow, -30, -92, 60, 60);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    },
    radio: function (b, t, dt, sa, gl) {
      drawSign(S.neon.radio, 0, -66, sa, gl);
      const on = radioOn;
      ctx.globalAlpha = on ? 0.75 + 0.25 * Math.sin(t * 6) : 0.18;
      ctx.drawImage(S.neon.onair, 28 - S.neon.onair.cw / 2, -42 - S.neon.onair.ch / 2, S.neon.onair.cw, S.neon.onair.ch);
      ctx.globalAlpha = 1;
      for (let i = 0; i < 8; i++) {
        let v;
        if (bins && on) v = bins[2 + i * 3] / 255;
        else if (party > 0) v = Math.abs(Math.sin(t * 8 + i * 0.9)) * party;
        else v = 0.15 + 0.15 * Math.abs(Math.sin(t * 1.3 + i));
        const bh = 2 + v * 20;
        ctx.fillStyle = i > 5 ? "#fff" : YELLOW; ctx.fillRect(-40 + i * 6.2, -8 - bh, 4.2, bh);
      }
      const e = on ? lvl : (party > 0 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 8)) : 0.25 + 0.15 * Math.sin(t * 2));
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.5 + e * 0.5;
      const gs = 26 + e * 70;
      ctx.drawImage(S.glow, -gs / 2, -257 - gs / 2, gs, gs);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      ctx.fillStyle = Math.sin(t * 3) > 0 || on ? "#FFF6C2" : YELLOW; ctx.beginPath(); ctx.arc(0, -257, 3.4, 0, TAU); ctx.fill();
      ctx.strokeStyle = "rgba(255,212,0," + (0.25 + e * 0.6) + ")"; ctx.lineWidth = 1.2;
      for (let r = 0; r < 3; r++) {
        const rr = ((t * (on ? 60 : 26) + r * 30) % 90) + 8;
        ctx.globalAlpha = 1 - rr / 98; ctx.beginPath(); ctx.arc(0, -257, rr * (1 + e * 0.6), 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (hoverPlace && hoverPlace.b === b) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(-50, -262, 100, 262); }
    }
  };

  function emitSmoke(x, y, k, heavy) {
    if (smoke.length > (isMobile ? 40 : 80)) return;
    smoke.push({ x: x + rand(-2, 2), y: y, vx: rand(4, 14) * (weather.kind === "rain" ? 2 : 1), vy: -rand(14, 26), s: (heavy ? 0.8 : 0.5) * k, life: rand(2.6, 4.2), max: 4.2, gold: heavy });
  }
  function updateDrawSmoke(dt) {
    for (let i = smoke.length - 1; i >= 0; i--) {
      const p = smoke[i]; p.life -= dt; if (p.life <= 0) { smoke.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy *= 0.995; p.s += dt * 0.55;
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1) * 0.85;
      const sz = 48 * p.s;
      ctx.drawImage(p.gold ? S.warm : S.puff, p.x - sz / 2, p.y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- lines ---------- */
  const LINES = {
    toast: ["Stay toasty!", "Golden brown, baby", "Butter side up!", "Four handles, one toaster", "Pop it up!", "Hooah!", "Army strong, toast stronger", "Crumbs > problems", "Therapy is toast", "Keep moving, keep breathing", "Toaster Radio slaps", "Saw it on Twitter", "Cybertruck gang", "Glitch it up!", "Lightly toasted, heavily blessed", "Dad of 4 energy", "Proudly Veteran-Owned", "Warm & crispy", "Fresh outta the slot", "Rise and grind", "Little headlights!", "Who's got jam?", "Mr. Toasty said hi", "Crispy edges only"],
    skull: ["Rattle rattle", "Bone appétit", "Skullz on the wall", "No body to love", "Spooky but sweet", "Grave vibes only", "Got a bone to pick", "Dead serious", "Block party later?", "Zero Skulls given", "Glitch me, baby"],
    rain: ["Soggy toast!", "I'm bread, not a boat", "Get inside!", "Crumbs everywhere"],
    snow: ["CRUMB SNOW!", "It's snowing breakfast", "Catch it!"],
    radio: ["This my jam!", "Turn it UP", "Toaster Radio!!", "Dance break!"],
    queue: ["Is this the line?", "New drop!", "I need that tee", "Hurry up, rye"],
    merchOut: ["New drip!", "Fresh tee!", "Look at this fit"],
    arcade: ["High score!", "One more game", "Boss Rush time", "Insert crumb"],
    fight: ["MY CRUMB!", "Back off, rye!", "I saw it first!", "Crumb is MINE"],
    hi5: ["UP TOP!", "Toasty five!", "Yeah!"],
    pointer: ["Hi!", "Who's that?", "A visitor!", "Hey you!", "Welcome to town!"],
    tap: ["Hey!", "Toasted!", "Wheee!", "Boop!", "Hooah!", "That tickles"],
    parade: ["HONK HONK", "Cybertrucks!!", "Steel squad!", "Woooo!"],
    party: ["BLOCK PARTY!", "Shake them bones", "Skullz up!", "Rattle it!"],
    storm: ["GLITCH!", "My pixels!", "Whoa whoa whoa"],
    inside: ["Brb", "Grabbing coffee", "Inside for a sec"]
  };

  /* ---------- bubbles ---------- */
  function maxBubbles() { return isMobile ? 5 : 9; }
  function say(c, text, life, force) {
    if (!text) return;
    if (c && c.bubble && c.bubble.life > 0.4 && !force) return;
    if (bubbles.length >= maxBubbles() && !force) return;
    if (bubbles.length >= maxBubbles() + 3) bubbles.shift();
    if (!force && c) {
      for (let i = 0; i < bubbles.length; i++) { const o = bubbles[i]; const ox = o.c ? o.c.x : o.x, oy = o.c ? o.c.y : o.y; if (Math.abs(ox - c.x) < 90 && Math.abs(oy - c.y) < 34) return; }
    }
    ctx.font = "700 10px ui-monospace, Menlo, Consolas, monospace";
    const b = { c: c, x: c ? c.x : 0, y: c ? c.y : 0, text: text, life: life || 2.6, max: life || 2.6, w: ctx.measureText(text).width + 12 };
    if (c) { if (c.bubble) removeBubble(c.bubble); c.bubble = b; }
    bubbles.push(b);
    return b;
  }
  function sayAt(x, y, text, life) { const b = say(null, text, life, true); if (b) { b.x = x; b.y = y; } return b; }
  function removeBubble(b) { const i = bubbles.indexOf(b); if (i >= 0) bubbles.splice(i, 1); }
  function drawBubbles(dt) {
    ctx.font = "700 10px ui-monospace, Menlo, Consolas, monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.life -= dt;
      if (b.life <= 0 || (b.c && b.c.state === "inside")) { if (b.c && b.c.bubble === b) b.c.bubble = null; bubbles.splice(i, 1); continue; }
      let x = b.x, y = b.y;
      if (b.c) { x = b.c.x; y = b.c.y - 46 * b.c.sc - b.c.z - 6; }
      const a = Math.min(1, b.life * 3, (b.max - b.life) * 8);
      const bw = b.w, bh = 18;
      x = clamp(x, bw / 2 + 4, w - bw / 2 - 4);
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(0,0,0,0.85)"; roundRect(ctx, x - bw / 2, y - bh, bw, bh, 4); ctx.fill();
      ctx.strokeStyle = YELLOW; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 4, y - 0.5); ctx.lineTo(x, y + 5); ctx.lineTo(x + 4, y - 0.5); ctx.fillStyle = "#000"; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x, y + 5); ctx.lineTo(x + 4, y); ctx.stroke();
      ctx.fillStyle = YELLOW; ctx.fillText(b.text, x, y - bh / 2 + 0.5);
    }
    ctx.globalAlpha = 1; ctx.textBaseline = "alphabetic";
  }

  /* ---------- citizens ---------- */
  function depthScale(y) { return (isMobile ? 0.62 : 0.72) + (isMobile ? 0.42 : 0.5) * clamp((y - L.by0) / (h - L.by0), 0, 1); }
  function randomSpot(region) {
    const r = region || (Math.random() < (isMobile ? 0.6 : 0.72) ? L.regions[0] : L.regions[1]);
    return { x: rand(r.x0, r.x1), y: rand(r.y0, r.y1) };
  }
  function regionOf(y) { return y > L.ry ? 1 : 0; }
  function pickType() {
    const r = Math.random();
    return r < 0.3 ? "toast" : r < 0.42 ? "helmet" : r < 0.52 ? "cap" : r < 0.6 ? "shades" : r < 0.66 ? "burnt" : r < 0.86 ? "skull" : "skullcap";
  }
  function spawnCitizen(type, x, y, opts) {
    const p = (x === undefined) ? randomSpot() : { x: x, y: y };
    const c = {
      type: type || pickType(), x: p.x, y: p.y, tx: p.x, ty: p.y, state: "idle", timer: rand(0.2, 3), speed: rand(24, 42),
      phase: rand(0, TAU), z: 0, vz: 0, sc: 1, size: 1, look: { x: 0, y: 0 }, bubble: null, goal: null, b: null, cool: rand(2, 8),
      spin: 0, alpha: 1, arms: 0, carry: null, carryT: 0, family: false, follow: 0, region: regionOf(p.y), id: Math.random()
    };
    c.skull = TYPES[c.type].skull;
    if (opts) for (const k in opts) c[k] = opts[k];
    citizens.push(c);
    return c;
  }
  function popTarget() { return Math.round((isMobile ? (w > 600 ? 42 : 30) : 58) * (quality >= 2 ? 0.7 : 1)); }
  function populate() {
    citizens.length = 0; crumbs.length = 0; trucks.length = 0; bubbles.length = 0; smoke.length = 0;
    const n = reduced ? Math.round(popTarget() * 0.6) : popTarget();
    for (let i = 0; i < n; i++) {
      const c = spawnCitizen();
      if (Math.random() < 0.18) { const b = pick(buildings.filter(enterable)); if (b) { c.state = "inside"; c.b = b; b.inside++; c.timer = rand(1, 12); c.x = b.doorX; c.y = b.doorY; } }
    }
    if (Math.random() < 0.6) spawnCitizen("golden");
    const nt = isMobile ? 2 : 4;
    for (let i = 0; i < nt; i++) spawnTruck(false, rand(0, w));
    for (let i = 0; i < 14; i++) dropCrumb(rand(30, w - 30), rand(L.regions[0].y0, L.regions[0].y1), 0, 0);
  }
  function enterable(b) { return b.id !== "artcade"; }
  function walkTo(c, x, y, goal) { c.tx = x; c.ty = y; c.state = "walk"; c.goal = goal || "wander"; }

  function arcadeSpot(i) { const ac = byId("artcade"); return ac ? { x: ac.x + (-68 + i * 68) * ac.k, y: ac.by + 8 } : null; }
  const arcadeBusy = [null, null, null];
  function queueSpot(i) { const m = byId("merch"); return { x: m.doorX - 4 - i * 15 * Math.max(0.8, m.k), y: m.doorY + 10 + (i % 2) * 2 }; }
  const queue = [];

  function decide(c) {
    if (c.family) return;
    const busy = shiftNow.busy;
    const rain = weather.kind === "rain";
    const r = Math.random() * 100;
    /* crumbs nearby */
    const cr = nearestCrumb(c.x, c.y, 150);
    if (cr && Math.random() < 0.6) { walkTo(c, cr.x, cr.y, "crumb"); c.crumb = cr; return; }
    if ((radioOn || party > 0.2) && r < (c.skull && party > 0.2 ? 75 : 40)) {
      const p = danceSpot(); walkTo(c, p.x, p.y, "dance"); return;
    }
    if (rain && r < 55) { const b = nearestBuilding(c); if (b) { walkTo(c, b.doorX, b.doorY, "door"); c.b = b; if (chance(0.4)) say(c, pick(LINES.rain)); return; } }
    if (r < 22 * busy) { const b = pick(buildings.filter(enterable)); walkTo(c, b.doorX + rand(-3, 3), b.doorY, "door"); c.b = b; return; }
    if (r < 32 && byId("merch") && queue.length < 6) { queue.push(c); const q = queueSpot(queue.length - 1); walkTo(c, q.x, q.y, "queue"); return; }
    if (r < 42) { for (let i = 0; i < 3; i++) if (!arcadeBusy[i]) { arcadeBusy[i] = c; const s = arcadeSpot(i); walkTo(c, s.x, s.y, "arcade"); c.cab = i; return; } }
    if (r < 50) { const o = nearestCitizen(c, 160, true); if (o) { walkTo(c, o.x + (o.x < c.x ? 18 : -18), o.y + rand(-2, 2), "chat"); c.partner = o; return; } }
    if (r < 56) { const p = L.plaza; walkTo(c, p.x + rand(-90, 90) * (isMobile ? 0.5 : 1), p.y + rand(-16, 16), "hang"); return; }
    if (r < 60 && !c.skull) { /* cross the street */
      const p = L.plaza; const dir = c.region === 0 ? 1 : -1;
      walkTo(c, p.x + rand(-28, 28), L.ry - dir * 30, "cross"); return;
    }
    const s = randomSpot(L.regions[c.region]);
    walkTo(c, s.x, s.y, "wander");
  }
  function danceSpot() {
    if (party > 0.2 || Math.random() < 0.6) { const p = L.plaza; const a = rand(0, TAU), r = rand(10, isMobile ? 70 : 150); return { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r * 0.3 }; }
    const ra = byId("radio"); return { x: clamp(ra.x + rand(-70, 30), 10, w - 10), y: ra.by + rand(12, 50) };
  }
  function nearestBuilding(c) {
    let best = null, bd = 1e9;
    for (let i = 0; i < buildings.length; i++) { const b = buildings[i]; if (!enterable(b)) continue; const d = dist(c.x, c.y, b.doorX, b.doorY); if (d < bd) { bd = d; best = b; } }
    return best;
  }
  function nearestCitizen(c, maxD, idleOnly) {
    let best = null, bd = maxD;
    for (let i = 0; i < citizens.length; i++) {
      const o = citizens[i]; if (o === c || o.state === "inside" || o.family) continue;
      if (idleOnly && !(o.state === "idle" || (o.state === "walk" && o.goal === "wander"))) continue;
      const d = dist(c.x, c.y, o.x, o.y); if (d < bd) { bd = d; best = o; }
    }
    return best;
  }
  function leaveQueue(c) { const i = queue.indexOf(c); if (i >= 0) queue.splice(i, 1); }
  function releaseArcade(c) { for (let i = 0; i < 3; i++) if (arcadeBusy[i] === c) arcadeBusy[i] = null; }

  function arrive(c) {
    switch (c.goal) {
      case "door":
        c.state = "enter"; c.timer = 0.45; if (chance(0.15)) say(c, pick(LINES.inside), 1.4); break;
      case "queue": c.state = "queue"; c.timer = rand(2, 4); if (chance(0.3)) say(c, pick(LINES.queue)); break;
      case "arcade": c.state = "play"; c.timer = rand(5, 11); break;
      case "dance": c.state = "dance"; c.timer = rand(5, 12); if (chance(0.25)) say(c, pick(party > 0.2 && c.skull ? LINES.party : LINES.radio)); break;
      case "crumb": tryEat(c); break;
      case "chat":
        if (c.partner && c.partner.state !== "inside" && dist(c.x, c.y, c.partner.x, c.partner.y) < 40) {
          c.state = "chat"; c.timer = rand(2.5, 5); const o = c.partner;
          if (o.state === "idle" || o.state === "walk") { o.state = "chat"; o.timer = c.timer; o.partner = c; }
          say(c, pick(LINES[c.skull ? "skull" : "toast"]), 2.4);
          setTimeout(function () { if (o.state === "chat") say(o, pick(LINES[o.skull ? "skull" : "toast"]), 2.4); }, 1200);
        } else { c.state = "idle"; c.timer = rand(0.5, 2); }
        break;
      case "cross": {
        const p = L.plaza; const toB = c.region === 0;
        walkTo(c, p.x + rand(-28, 28), toB ? L.ry + 34 : L.ry - 34, "crossing"); c.crossing = true; break;
      }
      case "crossing": c.crossing = false; c.region = regionOf(c.y); c.state = "idle"; c.timer = rand(0.3, 1.5); break;
      case "cheer": c.state = "cheer"; c.timer = rand(3, 6); break;
      default: c.state = "idle"; c.timer = rand(0.6, 3.5) / shiftNow.busy; if (chance(0.06)) say(c, pick(LINES[c.skull ? "skull" : "toast"]));
    }
  }

  function updateCitizens(dt) {
    census.inside = 0;
    for (let i = 0; i < buildings.length; i++) buildings[i].inside = 0;
    const px = pointer.x, py = pointer.y, pOn = pointer.on && time - pointer.lastMove < 6;
    for (let i = citizens.length - 1; i >= 0; i--) {
      const c = citizens[i];
      c.cool -= dt;
      if (c.vz || c.z > 0) { c.vz -= 900 * dt; c.z += c.vz * dt; if (c.z <= 0) { c.z = 0; c.vz = 0; } }
      if (c.spin > 0) c.spin = Math.max(0, c.spin - dt * 2.2);
      if (c.carryT > 0) { c.carryT -= dt; if (c.carryT <= 0) c.carry = null; }
      if (c.family) { c.sc = depthScale(c.y) * c.size; continue; }
      if (c.state === "inside") {
        census.inside++; if (c.b) c.b.inside++;
        c.timer -= dt;
        if (c.timer <= 0) {
          if (c.remove) { citizens.splice(i, 1); continue; }
          c.state = "exit"; c.timer = 0.45; c.alpha = 0; c.x = c.b.doorX + rand(-4, 4); c.y = c.b.doorY + 2;
          if (c.b.id === "merch") { c.carry = "shirt"; c.carryT = 12; if (chance(0.7)) say(c, pick(LINES.merchOut)); }
        }
        continue;
      }
      c.sc = depthScale(c.y) * c.size;
      c.timer -= dt;
      const sp = c.speed * c.sc * (weather.kind === "rain" ? 1.35 : 1) * (c.goal === "dance" ? 1.2 : 1);
      switch (c.state) {
        case "walk": {
          const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.sqrt(dx * dx + dy * dy);
          if (c.goal === "crumb" && (!c.crumb || c.crumb.eaten)) { c.state = "idle"; c.timer = 0.3; break; }
          if (c.goal === "follow") { c.tx = px + (c.x < px ? -30 : 30); c.ty = clamp(py + 10, L.regions[0].y0, L.regions[1].y1); if (!pOn) { c.state = "idle"; c.timer = 1; } }
          if (d < 3) { c.x = c.tx; c.y = c.ty; arrive(c); break; }
          c.x += (dx / d) * sp * dt; c.y += (dy / d) * sp * dt * 0.8;
          c.phase += dt * sp * 0.32;
          break;
        }
        case "idle":
          if (c.timer <= 0) decide(c);
          break;
        case "enter":
          c.alpha = Math.max(0, c.timer / 0.45);
          if (c.timer <= 0) { c.state = "inside"; c.timer = rand(3, 14); c.alpha = 1; if (c.b) c.b.flash = 0.6; leaveQueue(c); }
          break;
        case "exit":
          c.alpha = 1 - Math.max(0, c.timer / 0.45);
          c.y += dt * 14;
          if (c.timer <= 0) { c.alpha = 1; c.region = regionOf(c.y); c.state = "idle"; c.timer = rand(0.2, 1.2); }
          break;
        case "queue": {
          const qi = queue.indexOf(c);
          if (qi < 0) { c.state = "idle"; c.timer = 0.5; break; }
          const q = queueSpot(qi);
          if (dist(c.x, c.y, q.x, q.y) > 2) { c.x += (q.x - c.x) * Math.min(1, dt * 3); c.y += (q.y - c.y) * Math.min(1, dt * 3); c.phase += dt * 6; }
          if (qi === 0 && c.timer <= 0) { const m = byId("merch"); c.b = m; walkTo(c, m.doorX, m.doorY, "door"); }
          break;
        }
        case "play":
          c.phase += dt * 18;
          if (c.timer <= 0) { releaseArcade(c); if (chance(0.4)) say(c, pick(LINES.arcade)); c.state = "idle"; c.timer = 0.6; }
          else if (chance(dt * 0.12)) say(c, pick(LINES.arcade));
          break;
        case "dance":
          if (c.timer <= 0 || (!radioOn && party <= 0.05)) { c.state = "idle"; c.timer = 0.5; break; }
          if (beat > 0.6 && c.z === 0 && chance(0.5)) c.vz = rand(120, 220) * c.sc;
          else if (!radioOn && c.z === 0 && Math.sin(time * 8 + c.id * 9) > 0.96) c.vz = 160 * c.sc;
          c.phase += dt * 10;
          break;
        case "chat": case "cheer": case "hi5": case "fight": case "salute": case "wave":
          if (c.state === "cheer" && c.z === 0 && chance(dt * 2)) c.vz = rand(100, 180) * c.sc;
          if (c.state === "fight") { c.x += rand(-1.5, 1.5); }
          if (c.timer <= 0) {
            if (c.state === "fight" && c.crumb && !c.crumb.eaten && c.winner) { eatCrumb(c.crumb); burst(c.x, c.y - 20 * c.sc, 8, YELLOW); }
            c.state = "idle"; c.timer = rand(0.4, 1.5); c.partner = null; c.winner = false;
          }
          break;
      }
      /* hi-fives when two walkers pass */
      if (c.state === "walk" && c.goal === "wander" && c.cool <= 0 && !reduced) {
        const o = nearestCitizen(c, 22 * c.sc, false);
        if (o && o.state === "walk" && o.goal === "wander" && o.cool <= 0 && chance(0.5)) {
          c.state = o.state = "hi5"; c.timer = o.timer = 1.1; c.cool = o.cool = rand(10, 20);
          c.partner = o; o.partner = c;
          burst((c.x + o.x) / 2, (c.y + o.y) / 2 - 34 * c.sc, 10, "#fff");
          say(c, pick(LINES.hi5), 1.4); sfx("hi5");
        } else c.cool = 1;
      }
      /* pointer attraction */
      if (pOn && c.state !== "enter" && c.state !== "exit" && !c.family) {
        const d = dist(c.x, c.y, px, py);
        if (pointer.still > 1.2 && d < 220 && d > 40 && (c.state === "idle" || (c.state === "walk" && c.goal === "wander")) && countFollowers() < (isMobile ? 4 : 7)) {
          walkTo(c, px, py, "follow"); c.follow = 1;
          if (chance(0.35)) say(c, pick(LINES.pointer), 1.8);
        }
        if (c.goal === "follow" && c.state === "walk" && d < 34) { c.state = "idle"; c.timer = rand(1.5, 3); if (c.z === 0 && chance(0.4)) c.vz = 140 * c.sc; }
      }
      /* storm reactions */
      if (storm > 0 && chance(dt * 0.15)) { c.vz = c.z === 0 ? 120 : c.vz; if (chance(0.15)) say(c, pick(LINES.storm), 1.2); }
    }
    /* keep population near target */
    const active = citizens.length;
    if (active < popTarget() * (reduced ? 0.6 : 1) && chance(dt * 0.25)) {
      const b = pick(buildings.filter(enterable));
      const c = spawnCitizen(undefined, b.doorX, b.doorY); c.state = "exit"; c.timer = 0.45; c.alpha = 0; c.b = b;
    }
  }
  function countFollowers() { let n = 0; for (let i = 0; i < citizens.length; i++) if (citizens[i].goal === "follow" && citizens[i].state === "walk") n++; return n; }

  function drawCitizen(c, t) {
    if (c.state === "inside") return;
    const sc = c.sc, img = S["cit_" + c.type];
    const x = c.x, y = c.y - c.z;
    ctx.globalAlpha = c.alpha;
    ctx.drawImage(S.shadow, x - 11 * sc, c.y - 3 * sc, 22 * sc, 6 * sc);
    /* legs */
    const walking = c.state === "walk" || c.state === "queue" && false;
    const sw = walking ? Math.sin(c.phase) * 4 * sc : (c.state === "dance" ? Math.sin(c.phase) * 3 * sc : 0);
    ctx.strokeStyle = c.skull ? "#E9DDB0" : "#5a3010"; ctx.lineWidth = 1.8 * sc; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 4.5 * sc, y - 8 * sc); ctx.lineTo(x - 4.5 * sc + sw, y - (c.z > 0 ? 3 * sc : 0));
    ctx.moveTo(x + 4.5 * sc, y - 8 * sc); ctx.lineTo(x + 4.5 * sc - sw, y - (c.z > 0 ? 3 * sc : 0));
    /* arms */
    let armUp = c.state === "dance" || c.state === "cheer" || c.state === "hi5" || c.goal === "follow" && c.state === "idle";
    const ay = y - 18 * sc;
    if (c.state === "play") {
      ctx.moveTo(x - 12 * sc, ay); ctx.lineTo(x - 6 * sc, ay - 6 * sc + Math.sin(c.phase) * 1.5 * sc);
      ctx.moveTo(x + 12 * sc, ay); ctx.lineTo(x + 6 * sc, ay - 6 * sc + Math.cos(c.phase) * 1.5 * sc);
    } else if (c.state === "salute") {
      ctx.moveTo(x + 12 * sc, ay); ctx.lineTo(x + 7 * sc, ay - 16 * sc);
      ctx.moveTo(x - 12 * sc, ay); ctx.lineTo(x - 14 * sc, ay + 6 * sc);
    } else if (c.state === "wave") {
      ctx.moveTo(x + 12 * sc, ay); ctx.lineTo(x + 18 * sc + Math.sin(t * 14) * 3 * sc, ay - 12 * sc);
      ctx.moveTo(x - 12 * sc, ay); ctx.lineTo(x - 14 * sc, ay + 6 * sc);
    } else if (armUp) {
      const wv = Math.sin(c.phase * 1.3) * 3 * sc;
      ctx.moveTo(x - 12 * sc, ay); ctx.lineTo(x - 17 * sc + wv, ay - 12 * sc);
      ctx.moveTo(x + 12 * sc, ay); ctx.lineTo(x + 17 * sc - wv, ay - 12 * sc);
    } else if (c.state === "fight") {
      ctx.moveTo(x - 12 * sc, ay); ctx.lineTo(x - 18 * sc + rand(-3, 3) * sc, ay - rand(0, 8) * sc);
      ctx.moveTo(x + 12 * sc, ay); ctx.lineTo(x + 18 * sc + rand(-3, 3) * sc, ay - rand(0, 8) * sc);
    } else {
      ctx.moveTo(x - 12.5 * sc, ay); ctx.lineTo(x - 14 * sc - sw * 0.5, ay + 7 * sc);
      ctx.moveTo(x + 12.5 * sc, ay); ctx.lineTo(x + 14 * sc + sw * 0.5, ay + 7 * sc);
    }
    ctx.stroke();
    /* body */
    const bob = walking ? Math.abs(Math.sin(c.phase)) * 1.5 * sc : 0;
    const by = y - 43 * sc - bob;
    if (c.spin > 0 || c.state === "dance" || c.state === "fight") {
      const rot = c.spin > 0 ? c.spin * TAU : (c.state === "fight" ? rand(-0.2, 0.2) : Math.sin(c.phase * 0.5) * 0.18);
      ctx.save(); ctx.translate(x, by + 24 * sc); ctx.rotate(rot); ctx.drawImage(img, -22 * sc, -24 * sc, 44 * sc, 44 * sc); ctx.restore();
    } else {
      ctx.drawImage(img, x - 22 * sc, by, 44 * sc, 44 * sc);
    }
    /* pupils: look at pointer / partner / direction */
    const E = TYPES[c.type].eyes;
    if (E && c.spin <= 0) {
      let lx = 0, ly = 0;
      if (pointer.on && time - pointer.lastMove < 6 && dist(x, y, pointer.x, pointer.y) < 320) { lx = pointer.x - x; ly = pointer.y - (by + 20 * sc); }
      else if (c.partner) { lx = c.partner.x - x; ly = 0; }
      else if (c.state === "walk") { lx = c.tx - x; ly = c.ty - c.y; }
      else if (c.state === "play") { lx = 0; ly = -1; }
      const ll = Math.sqrt(lx * lx + ly * ly) || 1;
      const ox = (lx / ll) * 1.5 * sc, oy = (ly / ll) * 1.3 * sc;
      ctx.fillStyle = c.skull ? YELLOW : "#1a0a00";
      const ps = (c.skull ? 1.8 : 2.2) * sc;
      for (let e = 0; e < 2; e++) ctx.fillRect(x + E[e][0] * sc + ox - ps / 2, by + (24 + E[e][1]) * sc + oy - ps / 2, ps, ps);
    }
    if (c.carry === "shirt") ctx.drawImage(S.shirt, x + 8 * sc, by + 14 * sc, 18 * sc, 18 * sc);
    if (c.state === "fight") {
      ctx.globalAlpha = 0.6 * c.alpha; ctx.drawImage(S.puff, x - 20 * sc, by + 6 * sc, 40 * sc, 34 * sc);
      ctx.fillStyle = YELLOW; ctx.globalAlpha = c.alpha;
      for (let s = 0; s < 3; s++) { const a = t * 6 + s * 2.1; star(ctx, x + Math.cos(a) * 14 * sc, by + 4 * sc + Math.sin(a) * 4 * sc, 3 * sc); }
    }
    if (c.type === "golden") { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.35; ctx.drawImage(S.glow, x - 26 * sc, by - 4 * sc, 52 * sc, 52 * sc); ctx.globalCompositeOperation = "source-over"; }
    ctx.globalAlpha = 1; ctx.lineCap = "butt";
  }

  /* ---------- crumbs ---------- */
  function dropCrumb(x, y, z, vz) {
    if (crumbs.length > (isMobile ? 70 : 130)) crumbs.shift();
    crumbs.push({ x: x, y: y, z: z || 0, vz: vz || 0, rot: rand(0, TAU), life: rand(14, 26), eaten: false });
  }
  function nearestCrumb(x, y, maxD) {
    let best = null, bd = maxD;
    for (let i = 0; i < crumbs.length; i++) { const c = crumbs[i]; if (c.eaten || c.z > 0) continue; const d = dist(x, y, c.x, c.y); if (d < bd) { bd = d; best = c; } }
    return best;
  }
  function eatCrumb(cr) { cr.eaten = true; const i = crumbs.indexOf(cr); if (i >= 0) crumbs.splice(i, 1); }
  function tryEat(c) {
    const cr = c.crumb;
    c.state = "idle"; c.timer = rand(0.3, 1);
    if (!cr || cr.eaten) return;
    /* rival? */
    for (let i = 0; i < citizens.length; i++) {
      const o = citizens[i];
      if (o !== c && o.crumb === cr && o.state === "walk" && dist(o.x, o.y, cr.x, cr.y) < 28 && !reduced) {
        c.state = o.state = "fight"; c.timer = o.timer = 1.7; c.winner = chance(0.5); o.winner = !c.winner; o.crumb = cr;
        o.x = c.x + 14 * c.sc; o.y = c.y;
        say(chance(0.5) ? c : o, pick(LINES.fight), 1.6, true); sfx("fight");
        return;
      }
    }
    eatCrumb(cr); c.crumb = null;
    burst(c.x, c.y - 20 * c.sc, 5, YELLOW);
    if (c.z === 0) c.vz = 90 * c.sc;
  }
  function updateDrawCrumbs(dt) {
    for (let i = crumbs.length - 1; i >= 0; i--) {
      const c = crumbs[i];
      if (c.z > 0 || c.vz) { c.vz -= 600 * dt; c.z += c.vz * dt; c.rot += dt * 6; if (c.z <= 0) { c.z = 0; c.vz = 0; } }
      c.life -= dt; if (c.life <= 0) { crumbs.splice(i, 1); continue; }
      const sc = depthScale(c.y) * 1.2;
      ctx.globalAlpha = Math.min(1, c.life);
      ctx.save(); ctx.translate(c.x, c.y - c.z); ctx.rotate(c.rot); ctx.drawImage(S.crumb, -5 * sc, -5 * sc, 10 * sc, 10 * sc); ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  function sprinkleAt(x, y, n) {
    n = n || 6;
    for (let i = 0; i < n; i++) dropCrumb(x + rand(-14, 14), clamp(y + rand(-8, 8), L.regions[0].y0, L.regions[1].y1), rand(20, 60), rand(80, 200));
    fadeHint();
  }

  /* ---------- particles ---------- */
  function burst(x, y, n, col) {
    if (sparks.length > (isMobile ? 120 : 260)) return;
    for (let i = 0; i < n; i++) { const a = rand(0, TAU), s = rand(40, 160); sparks.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: rand(0.4, 0.9), col: col || YELLOW }); }
  }
  function updateDrawSparks(dt) {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i]; p.life -= dt; if (p.life <= 0) { sparks.splice(i, 1); continue; }
      p.vy += 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.col; ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.4, 2.4);
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.life -= dt; if (r.life <= 0) { rings.splice(i, 1); continue; }
      r.r += dt * (r.sp || 220);
      ctx.globalAlpha = r.life / r.max; ctx.strokeStyle = r.col || YELLOW; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * (r.flat === false ? 1 : 0.32), 0, 0, TAU); ctx.stroke();
    }
    for (let i = hearts.length - 1; i >= 0; i--) {
      const p = hearts[i]; p.life -= dt; if (p.life <= 0) { hearts.splice(i, 1); continue; }
      p.y += p.vy * dt; p.x += Math.sin(time * 3 + p.ph) * 12 * dt;
      ctx.globalAlpha = Math.min(1, p.life); const s = p.s;
      ctx.drawImage(S.heart, p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Cybertrucks ---------- */
  function laneY(dir) { return dir > 0 ? L.ry + 12 : L.ry - 10; }
  function spawnTruck(parade, x, dir) {
    dir = dir || (chance(0.5) ? 1 : -1);
    const tr = { dir: dir, x: x !== undefined ? x : (dir > 0 ? -140 : w + 140), y: laneY(dir), speed: parade ? 70 : rand(90, 170), parade: !!parade, stop: 0, charged: false, honk: rand(3, 10) };
    trucks.push(tr); return tr;
  }
  function truckScale() { return isMobile ? 0.62 : clamp(L.k, 0.7, 1); }
  function updateTrucks(dt) {
    const want = isMobile ? 2 : 4;
    let normal = 0;
    for (let i = trucks.length - 1; i >= 0; i--) {
      const tr = trucks[i];
      if (!tr.parade) normal++;
      let v = tr.speed;
      /* stop for crossers */
      for (let j = 0; j < citizens.length; j++) { const c = citizens[j]; if (c.crossing && Math.abs(c.y - tr.y) < 26 && (c.x - tr.x) * tr.dir > 0 && (c.x - tr.x) * tr.dir < 120) { v = 0; break; } }
      /* charge pad */
      if (!tr.parade && tr.dir < 0 && !tr.charged && Math.abs(tr.x - L.chargeX) < 4 && chance(0.6)) { tr.stop = rand(3, 6); tr.charged = true; sayAt(tr.x, tr.y - 40, "CHARGING", 2); }
      if (!tr.parade && tr.dir < 0 && Math.abs(tr.x - L.chargeX) < 4) tr.charged = true;
      if (tr.stop > 0) { tr.stop -= dt; v = 0; if (chance(dt * 10)) burst(tr.x + rand(-20, 20), tr.y - 20, 2, "#fff"); }
      /* follow distance */
      for (let j = 0; j < trucks.length; j++) { const o = trucks[j]; if (o !== tr && o.dir === tr.dir) { const gap = (o.x - tr.x) * tr.dir; if (gap > 0 && gap < 115 * truckScale()) v = Math.min(v, o.stop > 0 ? 0 : o.speed * 0.9); } }
      tr.x += tr.dir * v * dt;
      tr.honk -= dt;
      if (tr.parade && tr.honk <= 0) { tr.honk = rand(1.5, 4); if (tr.x > 20 && tr.x < w - 20) sayAt(tr.x, tr.y - 40 * truckScale(), "HONK", 1); sfx("honk"); }
      if ((tr.dir > 0 && tr.x > w + 160) || (tr.dir < 0 && tr.x < -160)) trucks.splice(i, 1);
    }
    if (normal < want && chance(dt * 0.6)) spawnTruck(false);
  }
  function drawTruck(tr, t) {
    const s = truckScale();
    const img = tr.parade ? (tr.dir > 0 ? S.paradeR : S.paradeL) : (tr.dir > 0 ? S.truckR : S.truckL);
    const ww = 120 * s, hh = 56 * s;
    if (skyNow.lights > 0.45 || weather.kind) {
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.55;
      if (tr.dir > 0) ctx.drawImage(S.cone, tr.x + ww * 0.45, tr.y - 22 * s, 130 * s, 40 * s);
      else { ctx.save(); ctx.translate(tr.x - ww * 0.45, tr.y - 22 * s); ctx.scale(-1, 1); ctx.drawImage(S.cone, 0, 0, 130 * s, 40 * s); ctx.restore(); }
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
    ctx.drawImage(S.shadow, tr.x - ww * 0.45, tr.y - 4 * s, ww * 0.9, 10 * s);
    ctx.drawImage(img, tr.x - ww / 2, tr.y - hh + 4 * s, ww, hh);
    if (tr.parade) { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 10 + tr.x * 0.05); ctx.drawImage(S.glow, tr.x - 30 * s, tr.y - 30 * s, 60 * s, 40 * s); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; }
    if (tr.stop > 0) { ctx.strokeStyle = YELLOW; ctx.lineWidth = 1.5; ctx.beginPath(); const bx = tr.x, byy = tr.y - 34 * s; ctx.moveTo(bx - 3, byy - 8); ctx.lineTo(bx + 2, byy - 1); ctx.lineTo(bx - 2, byy - 1); ctx.lineTo(bx + 3, byy + 7); ctx.stroke(); }
  }

  /* ---------- weather ---------- */
  let weather = { kind: null, t: 0, dur: 0 };
  let storm = 0, flashA = 0, sweep = -1;
  function startWeather(kind, dur) {
    weather = { kind: kind, t: 0, dur: dur || rand(14, 22) };
    drops.length = 0;
    logEvent(kind === "rain" ? "Rain rolling into Toaster Town" : "Crumb snow is falling");
    setBanner(null);
    for (let i = 0; i < 6; i++) { const c = pick(citizens); if (c && c.state !== "inside") say(c, pick(kind === "rain" ? LINES.rain : LINES.snow), 2.2); }
  }
  function updateDrawWeather(dt) {
    if (!weather.kind) return;
    weather.t += dt;
    const fade = Math.min(1, weather.t / 2, (weather.dur - weather.t) / 2);
    if (weather.t > weather.dur) { weather.kind = null; drops.length = 0; return; }
    const target = (weather.kind === "rain" ? (isMobile ? 110 : 240) : (isMobile ? 60 : 130)) * Math.max(0, fade) * (reduced ? 0.4 : 1);
    while (drops.length < target) drops.push({ x: rand(-40, w + 40), y: rand(-h * 0.3, 0), vy: weather.kind === "rain" ? rand(520, 820) : rand(40, 80), gy: rand(L.hz, h - 70), ph: rand(0, TAU), rot: rand(0, TAU) });
    if (drops.length > target + 4) drops.length = Math.floor(target);
    if (weather.kind === "rain") {
      ctx.strokeStyle = "rgba(200,210,255,0.35)"; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]; d.y += d.vy * dt; d.x -= 60 * dt;
        if (d.y > d.gy) { if (chance(0.25)) rings.push({ x: d.x, y: d.gy, r: 1, life: 0.35, max: 0.35, sp: 30, col: "rgba(200,210,255,0.8)" }); d.y = rand(-60, 0); d.x = rand(-40, w + 40); d.gy = rand(L.hz, h - 70); }
        ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + 3, d.y - 14);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(10,14,30," + (0.18 * fade) + ")"; ctx.fillRect(0, 0, w, h);
      if (chance(dt * 0.12)) flashA = 0.5;
    } else {
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]; d.y += d.vy * dt; d.x += Math.sin(time * 1.5 + d.ph) * 20 * dt; d.rot += dt * 2;
        if (d.y > d.gy) {
          if (d.gy > L.regions[0].y0 && chance(0.35)) dropCrumb(d.x, d.gy, 0, 0);
          d.y = rand(-40, 0); d.x = rand(-20, w + 20); d.gy = rand(L.hz, h - 70);
        }
        ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.drawImage(S.crumb, -4, -4, 8, 8); ctx.restore();
      }
    }
  }

  /* ---------- banners ---------- */
  let banner = null;
  function setBanner(img, dur) { banner = img ? { img: img, life: dur || 6, max: dur || 6 } : banner; }
  function drawBanner(dt, t) {
    if (!banner) return;
    banner.life -= dt; if (banner.life <= 0) { banner = null; return; }
    const r = logoRect();
    const y = isMobile ? L.by0 + 16 : r.y + r.h + 22;
    const a = Math.min(1, banner.life * 2, (banner.max - banner.life) * 4) * (Math.random() < 0.06 ? 0.3 : 1);
    const sc = isMobile ? 0.85 : 1.15;
    ctx.globalAlpha = a;
    ctx.drawImage(banner.img, w / 2 - banner.img.cw * sc / 2, y - banner.img.ch * sc / 2, banner.img.cw * sc, banner.img.ch * sc);
    ctx.globalAlpha = 1;
  }

  /* ---------- events ---------- */
  let nextEvent = 9, nextPop = 6, nextSmall = 4;
  let partyT = 0, partyDur = 0, holoT = 0, showerT = 0;
  let fam = null;
  let lastEventName = "";
  const EVENTS = {
    rain: function () { if (!weather.kind) startWeather("rain"); },
    snow: function () { if (!weather.kind) startWeather("snow"); },
    parade: function () {
      const dir = chance(0.5) ? 1 : -1, n = isMobile ? 5 : 7, s = truckScale();
      for (let i = 0; i < n; i++) spawnTruck(true, dir > 0 ? -140 - i * 112 * s : w + 140 + i * 112 * s, dir);
      setBanner(S.neon.parade, 8); logEvent("Cybertruck parade on Main Street"); sfx("honk");
      for (let i = 0; i < citizens.length; i++) {
        const c = citizens[i]; if (c.state === "inside" || c.family || c.crossing) continue;
        if (Math.abs(c.y - L.ry) < (isMobile ? 120 : 170) && chance(0.7)) {
          const side = c.y < L.ry ? -1 : 1;
          walkTo(c, clamp(c.x + rand(-30, 30), 10, w - 10), L.ry + side * rand(32, 44), "cheer"); leaveQueue(c); releaseArcade(c);
          if (chance(0.2)) say(c, pick(LINES.parade));
        }
      }
    },
    party: function () {
      partyT = 0; partyDur = rand(16, 22);
      setBanner(S.neon.party, 7); logEvent("Skull block party at the plaza"); 
      const extra = isMobile ? 4 : 8;
      for (let i = 0; i < extra; i++) {
        const b = pick(buildings.filter(enterable));
        const c = spawnCitizen(chance(0.5) ? "skull" : "skullcap", b.doorX, b.doorY);
        c.state = "exit"; c.timer = 0.45; c.alpha = 0; c.b = b; c.partyGuest = true;
      }
      for (let i = 0; i < citizens.length; i++) { const c = citizens[i]; if (c.skull && c.state !== "inside" && chance(0.85)) { leaveQueue(c); releaseArcade(c); const p = danceSpot(); walkTo(c, p.x, p.y, "dance"); } }
    },
    storm: function () { storm = reduced ? 1.5 : rand(5, 7); setBanner(S.neon.storm, 4); logEvent("Glitch storm!"); sfx("glitch"); logoGlitch = 1; },
    holo: function () { holoT = rand(7, 10); logEvent("Mr. Toasty hologram online"); logoPulse = 1; sfx("ding"); },
    family: function () { startFamily(chance(0.5)); },
    heart: function () { startFamily(2); },
    pop: function () { toasterPop(); },
    shower: function () { showerT = 3; logEvent("Shooting stars over town"); },
    golden: function () { if (!citizens.some(function (c) { return c.type === "golden"; })) { const c = spawnCitizen("golden"); c.alpha = 1; logEvent("A golden toast appeared"); burst(c.x, c.y - 20, 18, YELLOW); } }
  };
  function trigger(name) {
    const fn = EVENTS[name]; if (!fn) return false;
    lastEventName = name; fn(); return true;
  }
  function scheduleEvents(dt) {
    if (quiet) return;
    nextEvent -= dt * shiftNow.busy;
    if (nextEvent <= 0) {
      nextEvent = rand(14, 24);
      const pool = [["parade", 3], ["party", 3], ["storm", 2], ["holo", 2], ["family", 3], ["heart", 1.4], ["shower", skyNow.stars > 0.4 ? 1.5 : 0], ["golden", 1]];
      if (!weather.kind) { pool.push(["rain", 1.8]); pool.push(["snow", 1.8]); }
      let tot = 0; for (let i = 0; i < pool.length; i++) if (pool[i][0] !== lastEventName && !(fam && (pool[i][0] === "family" || pool[i][0] === "heart")) && !(partyT < partyDur && pool[i][0] === "party")) tot += pool[i][1];
      let r = Math.random() * tot;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i]; if (p[0] === lastEventName || (fam && (p[0] === "family" || p[0] === "heart")) || (partyT < partyDur && p[0] === "party")) continue;
        r -= p[1]; if (r <= 0) { trigger(p[0]); break; }
      }
    }
    nextPop -= dt; if (nextPop <= 0) { nextPop = rand(10, 18); toasterPop(); }
    nextSmall -= dt;
    if (nextSmall <= 0) {
      nextSmall = rand(2, 5);
      const c = pick(citizens);
      if (c && c.state !== "inside" && !c.bubble && !c.family) say(c, pick(weather.kind === "rain" ? LINES.rain : weather.kind === "snow" ? LINES.snow : radioOn && chance(0.5) ? LINES.radio : LINES[c.skull ? "skull" : "toast"]));
      if (chance(0.25)) dropCrumb(w / 2 + rand(-120, 120), L.plaza.y + rand(-20, 30), rand(160, 260), 0);
    }
  }
  function updateEvents(dt, t) {
    /* party */
    if (partyT < partyDur) {
      partyT += dt; party = Math.min(1, party + dt * 0.6);
      if (partyT >= partyDur) {
        for (let i = 0; i < citizens.length; i++) { const c = citizens[i]; if (c.partyGuest) { const b = pick(buildings.filter(enterable)); c.b = b; c.remove = true; walkTo(c, b.doorX, b.doorY, "door"); } }
      }
      if (chance(dt * 1.6)) { const p = L.plaza; rings.push({ x: p.x, y: p.y, r: 10, life: 0.9, max: 0.9, sp: isMobile ? 120 : 230 }); }
    } else party = Math.max(0, party - dt * 0.5);
    /* hologram */
    if (holoT > 0) { holoT -= dt; holo = Math.min(1, holo + dt * 1.5); } else holo = Math.max(0, holo - dt * 1.5);
    if (storm > 0) { storm -= dt; if (chance(dt * 2.5)) flashA = rand(0.2, 0.6); logoGlitch = Math.max(logoGlitch, 0.5); }
    logoGlitch = Math.max(0, logoGlitch - dt * 1.2);
    flashA = Math.max(0, flashA - dt * 2.5);
    logoPulse = Math.max(0, logoPulse - dt * 0.7);
    if (showerT > 0) { showerT -= dt; if (chance(dt * 4)) spawnShootingStar(); }
    if (sweep < 0 && chance(dt * 0.05)) sweep = 0;
    updateFamily(dt, t);
  }
  function drawPartyFloor(t) {
    if (party <= 0.01) return;
    const p = L.plaza, R = isMobile ? 80 : 170;
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      const a = t * (0.9 + i * 0.25) + i * 1.6;
      ctx.save(); ctx.translate(p.x + (i - 1) * R * 0.6, p.y + 6); ctx.rotate(Math.sin(a) * 0.7 + Math.PI);
      ctx.globalAlpha = party * 0.32; ctx.drawImage(S.beam, -40 * (isMobile ? 0.6 : 1), 0, 80 * (isMobile ? 0.6 : 1), (isMobile ? 260 : 420));
      ctx.restore();
    }
    const tiles = 8;
    for (let i = 0; i < tiles; i++) {
      const on = ((i + Math.floor(t * 6)) % 3) === 0 || beat > 0.6;
      if (!on) continue;
      const ang = (i / tiles) * TAU;
      ctx.globalAlpha = party * 0.4;
      ctx.drawImage(S.glow, p.x + Math.cos(ang) * R * 0.6 - 30, p.y + Math.sin(ang) * R * 0.18 - 10, 60, 20);
    }
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
  }
  function toasterPop() {
    const hq = byId("hq"); if (!hq) return;
    hq.pop = 1; sfx("ding");
    setTimeout(function () {
      const k = hq.k, n = chance(0.3) ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const gy = clamp(hq.by + rand(30, 110), L.regions[0].y0, L.regions[0].y1);
        const c = spawnCitizen(chance(0.2) ? "golden" : "toast", hq.x + rand(-20, 60) * k + i * 30, gy);
        c.z = gy - (hq.by - 150 * k); c.vz = rand(150, 260); c.state = "idle"; c.timer = 1.2;
        if (i === 0) say(c, chance(0.5) ? "Fresh outta the slot!" : "I'm toast!", 2);
      }
      burst(hq.x, hq.by - 150 * k, 14, YELLOW);
      /* keep the head count steady */
      if (citizens.length > popTarget() + 6) { const c = pick(citizens.filter(function (o) { return o.state === "idle" && !o.family; })); if (c) { const b = nearestBuilding(c); c.b = b; c.remove = true; walkTo(c, b.doorX, b.doorY, "door"); } }
    }, 650);
  }

  /* ---------- the Toasty Family (6) + One of a Kind moment ---------- */
  function startFamily(withHeart) {
    if (fam) return;
    const home = byId("home"); if (!home) return;
    const m = [
      spawnCitizen("dad", home.doorX, home.doorY, { size: 1.08, family: true }),
      spawnCitizen("mom", home.doorX, home.doorY, { size: 1.0, family: true }),
      spawnCitizen("cap", home.doorX, home.doorY, { size: 0.76, family: true }),
      spawnCitizen("toast", home.doorX, home.doorY, { size: 0.68, family: true }),
      spawnCitizen("helmet", home.doorX, home.doorY, { size: 0.6, family: true }),
      spawnCitizen("golden", home.doorX, home.doorY, { size: 0.52, family: true })
    ];
    const region = L.regions[isMobile ? 1 : 0];
    const laneY = isMobile ? (region.y0 + region.y1) / 2 : home.by + (L.ry - home.by) * 0.62;
    const goRight = home.x < w / 2;
    const farX = goRight ? w * 0.86 : w * 0.14;
    const path = [{ x: home.doorX, y: home.doorY + 14 }, { x: home.doorX + (goRight ? 30 : -30), y: laneY }];
    if (isMobile) { path.push({ x: L.plaza.x, y: L.ry - 34 }); path.push({ x: L.plaza.x, y: laneY }); }
    path.push({ x: farX, y: laneY + 8 }, { x: farX, y: laneY - 20 });
    const back = path.slice(0, -1).reverse();
    for (let i = 0; i < back.length; i++) path.push({ x: back[i].x, y: back[i].y + (i < back.length - 1 ? 22 : 0) });
    fam = { m: m, path: path, seg: 0, x: path[0].x, y: path[0].y, hist: [], heart: withHeart, heartAt: withHeart === 2 ? 0.1 : 0.2 + Math.random() * 0.12, heartT: -1, done: false, prog: 0, total: 0, said: 0 };
    let tot = 0; for (let i = 1; i < path.length; i++) tot += dist(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y); fam.total = tot;
    for (let i = 0; i < m.length; i++) { m[i].state = "fam"; m[i].alpha = 1; }
    setBanner(S.neon.family, 6);
    logEvent("The Toasty Family is out for a walk");
    say(m[0], "Family walk!", 2.4, true);
    setTimeout(function () { if (fam) say(m[4], "Are we there yet?", 2.2, true); }, 3200);
  }
  function updateFamily(dt, t) {
    if (!fam) return;
    const f = fam, m = f.m;
    if (f.heartT >= 0) {
      f.heartT += dt;
      if (!f.heartSaid) { f.heartSaid = true; setBanner(S.neon.ooak, 5.5); logEvent("One of a Kind"); sfx("heart"); say(m[1], "My One of a Kind", 3, true); setTimeout(function () { if (fam) say(m[0], "Love you, babe", 2.5, true); }, 1300); }
      if (chance(dt * 9)) hearts.push({ x: (m[0].x + m[1].x) / 2 + rand(-20, 20), y: m[0].y - 40 * m[0].sc, vy: -rand(30, 60), life: rand(1.6, 2.6), s: rand(10, 20), ph: rand(0, 6) });
      for (let i = 2; i < m.length; i++) { if (m[i].z === 0 && chance(dt * 1.5)) m[i].vz = 120 * m[i].sc; m[i].state = "fam"; }
      m[0].partner = m[1]; m[1].partner = m[0];
      if (f.heartT > 4.5) { f.heartT = -2; m[0].partner = m[1].partner = null; }
      return;
    }
    const sp = 36 * depthScale(f.y);
    let move = sp * dt;
    while (move > 0 && f.seg < f.path.length - 1) {
      const a = f.path[f.seg + 1];
      const d = dist(f.x, f.y, a.x, a.y);
      if (d <= move) { f.x = a.x; f.y = a.y; f.seg++; move -= d; f.prog += d; }
      else { f.x += (a.x - f.x) / d * move; f.y += (a.y - f.y) / d * move; f.prog += move; move = 0; }
    }
    f.hist.unshift({ x: f.x, y: f.y });
    const gap = Math.round(isMobile ? 9 : 8);
    if (f.hist.length > gap * 7) f.hist.length = gap * 7;
    for (let i = 0; i < m.length; i++) {
      const p = f.hist[Math.min(f.hist.length - 1, i * gap)];
      const c = m[i];
      const ox = c.x, oy = c.y;
      c.x = p.x; c.y = p.y + (i % 2 ? 3 : 0);
      c.tx = c.x + (c.x - ox) * 30; c.ty = c.y + (c.y - oy) * 30;
      c.state = dist(c.x, c.y, ox, oy) > 0.05 ? "walk" : "fam";
      c.phase += dt * 9;
    }
    if (f.heart && f.heartT === -1 && f.prog / f.total > f.heartAt) f.heartT = 0;
    if (f.seg >= f.path.length - 1) {
      for (let i = 0; i < m.length; i++) { const c = m[i]; c.family = false; c.b = byId("home"); c.remove = true; c.state = "enter"; c.timer = 0.45 + i * 0.05; }
      fam = null;
    }
  }
  function drawFamilyExtras(t) {
    if (!fam) return;
    const m = fam.m;
    ctx.strokeStyle = "rgba(255,212,0,0.8)"; ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < m.length - 1; i++) {
      const a = m[i], b = m[i + 1];
      if (dist(a.x, a.y, b.x, b.y) > 40) continue;
      ctx.moveTo(a.x + (b.x < a.x ? -1 : 1) * 13 * a.sc, a.y - 12 * a.sc - a.z);
      ctx.lineTo(b.x + (b.x < a.x ? 1 : -1) * 13 * b.sc, b.y - 12 * b.sc - b.z);
    }
    ctx.stroke();
    if (fam.heartT >= 0) {
      const p = Math.min(1, fam.heartT / 0.8);
      const cx = (m[0].x + m[1].x) / 2, cy = m[0].y - 70 * m[0].sc - p * 30;
      const s = (isMobile ? 46 : 70) * (0.6 + 0.4 * p) * (1 + 0.08 * Math.sin(t * 8));
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.6 * p; ctx.drawImage(S.pink, cx - s, cy - s, s * 2, s * 2); ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = p; ctx.drawImage(S.heart, cx - s / 2, cy - s / 2, s, s); ctx.globalAlpha = 1;
    }
  }

  /* ---------- glitch storm post-fx ---------- */
  function drawGlitchFx() {
    if (storm <= 0 && logoGlitch < 0.8) return;
    if (storm > 0) {
      const n = (frame % 3) ? 0 : (isMobile || quality > 0 ? 2 : 3);
      for (let i = 0; i < n; i++) {
        const y = rand(0, h - 40), hh = rand(4, 26), off = rand(-30, 30);
        try { ctx.drawImage(canvas, 0, Math.floor(y * dpr), canvas.width, Math.floor(hh * dpr), off, y, w, hh); } catch (e) {}
      }
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 3; i++) { ctx.fillStyle = pick(["rgba(255,59,212,0.18)", "rgba(41,231,255,0.16)", "rgba(255,212,0,0.18)"]); ctx.fillRect(0, rand(0, h), w, rand(2, 18)); }
      ctx.globalCompositeOperation = "source-over";
    }
  }

  /* ---------- audio: radio analyser + ambient synth (off by default) ---------- */
  const FALLBACK_TRACKS = [
    { id: "9ce7aece-669c-4791-bdd2-ff7ccf2d44a3", title: "Four Handles, One Toaster", by: "TherapyToaster", audio: "https://cdn1.suno.ai/9ce7aece-669c-4791-bdd2-ff7ccf2d44a3.mp4" },
    { id: "fe6d232e-248e-4ae7-9b90-e95d844c60a4", title: "Therapy Toaster", by: "TherapyToaster", audio: "https://cdn1.suno.ai/fe6d232e-248e-4ae7-9b90-e95d844c60a4.mp4" },
    { id: "8e1e4a48-c646-488f-8bf1-e1072dd63411", title: "Zero Skulls", by: "TherapyToaster", audio: "https://cdn1.suno.ai/8e1e4a48-c646-488f-8bf1-e1072dd63411.mp4" },
    { id: "84fd6396-19c8-4f32-b16f-384a0d306c17", title: "Little Headlights", by: "TherapyToaster", audio: "https://cdn1.suno.ai/84fd6396-19c8-4f32-b16f-384a0d306c17.mp4" },
    { id: "5ce09690-4c09-4053-b237-c96f4a3e8d4e", title: "Keep Moving, Keep Breathing", by: "TherapyToaster", audio: "https://cdn1.suno.ai/5ce09690-4c09-4053-b237-c96f4a3e8d4e.mp4" }
  ];
  let tracks = [], trackIndex = 0, audio = null, radioOn = false;
  let actx = null, analyser = null, mediaSrc = null, noAnalyser = false, zeroT = 0, lastCT = 0;
  let amb = null, soundOn = false;
  let bassAvg = 0.2, beatCool = 0;
  function ensureCtx() {
    if (actx) { if (actx.state === "suspended") actx.resume().catch(function () {}); return actx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { actx = new AC(); } catch (e) { actx = null; }
    return actx;
  }
  function hookAnalyser(a) {
    if (noAnalyser || mediaSrc || !ensureCtx()) return;
    try {
      mediaSrc = actx.createMediaElementSource(a);
      analyser = actx.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.72;
      mediaSrc.connect(analyser); analyser.connect(actx.destination);
      bins = new Uint8Array(analyser.frequencyBinCount);
    } catch (e) { mediaSrc = null; analyser = null; noAnalyser = true; }
  }
  function updateAudioLevels(dt) {
    beatCool -= dt; beat = Math.max(0, beat - dt * 3);
    if (radioOn && analyser && bins) {
      analyser.getByteFrequencyData(bins);
      let s = 0, all = 0;
      for (let i = 1; i < 7; i++) s += bins[i];
      for (let i = 0; i < bins.length; i++) all += bins[i];
      bass = s / (6 * 255);
      lvl = lerp(lvl, all / (bins.length * 255) * 2.2, 0.3);
      bassAvg = lerp(bassAvg, bass, 0.04);
      if (bass > bassAvg * 1.18 && bass > 0.3 && beatCool <= 0) { onBeat(); }
      /* tainted/silent media guard: data stays zero while the track advances */
      if (all === 0 && audio && !audio.paused && audio.currentTime > lastCT) { zeroT += dt; if (zeroT > 4) fallbackPlainAudio(); } else zeroT = 0;
      if (audio) lastCT = audio.currentTime;
    } else if (radioOn) {
      /* no analyser: fake a groove so the tower still pulses */
      const ph = time * 2.1 * Math.PI;
      lvl = lerp(lvl, 0.35 + 0.25 * Math.abs(Math.sin(ph)), 0.2);
      if (beatCool <= 0 && Math.sin(ph) > 0.95) onBeat();
    } else {
      lvl = lerp(lvl, party > 0 ? 0.3 * party : 0, 0.05);
      if (party > 0.3 && beatCool <= 0 && Math.sin(time * 8) > 0.97) onBeat();
    }
  }
  function onBeat() {
    beat = 1; beatCool = 0.28;
    const ra = byId("radio");
    if (ra) { ra.flash = 1; rings.push({ x: ra.x, y: ra.by - 257 * ra.k, r: 6, life: 0.9, max: 0.9, sp: 160, flat: false }); }
    if (chance(0.35)) { const b = pick(buildings); b.flash = 0.8; }
    if (party > 0.2 && soundOn && !radioOn) sfx("kick");
  }
  function fallbackPlainAudio() {
    noAnalyser = true; zeroT = 0;
    const t = audio ? audio.currentTime : 0;
    if (audio) { try { audio.pause(); } catch (e) {} }
    audio = null; mediaSrc = null; analyser = null; bins = null;
    const a = ensureAudio(); a.src = currentTrack().audio;
    a.addEventListener("loadedmetadata", function once() { a.removeEventListener("loadedmetadata", once); try { a.currentTime = t; } catch (e) {} });
    a.play().catch(function () {});
  }
  function loadTracks() {
    tracks = FALLBACK_TRACKS.slice();
    return fetch(TRACKS_SRC, { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && j.tracks && j.tracks.length) tracks = j.tracks; }).catch(function () {});
  }
  function currentTrack() { return tracks[trackIndex] || FALLBACK_TRACKS[0]; }
  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = "none";
    if (!noAnalyser) audio.crossOrigin = "anonymous";
    audio.addEventListener("ended", function () { trackIndex = (trackIndex + 1) % tracks.length; playTrack(true); });
    audio.addEventListener("error", function () { if (!radioOn) return; logEvent("Radio skipped a track"); trackIndex = (trackIndex + 1) % tracks.length; playTrack(true); });
    return audio;
  }
  function playTrack(auto) {
    const t = currentTrack(); if (!t) return;
    const a = ensureAudio();
    if (!noAnalyser) hookAnalyser(a);
    a.src = t.audio;
    a.play().then(function () {
      radioOn = true; elRadio.classList.add("on"); elRadio.setAttribute("aria-pressed", "true"); elRadio.textContent = "⏸ Radio";
      if (elNow) elNow.textContent = t.title + " · " + (t.by || "TherapyToaster");
      if (!auto) { logEvent("Toaster Radio: " + t.title); for (let i = 0; i < 5; i++) { const c = pick(citizens); if (c && c.state !== "inside" && !c.family) { const p = danceSpot(); walkTo(c, p.x, p.y, "dance"); leaveQueue(c); releaseArcade(c); } } }
      ambGain();
    }).catch(function () { radioOn = false; logEvent("Tap Radio again to play"); });
  }
  function toggleRadio() {
    ensureCtx();
    if (radioOn && audio && !audio.paused) {
      audio.pause(); radioOn = false;
      elRadio.classList.remove("on"); elRadio.setAttribute("aria-pressed", "false"); elRadio.textContent = "▶ Radio";
      if (elNow) elNow.textContent = ""; ambGain(); return;
    }
    if (!tracks.length) tracks = FALLBACK_TRACKS.slice();
    playTrack(false);
  }
  if (elRadio) elRadio.addEventListener("click", function (e) { e.stopPropagation(); toggleRadio(); });

  function noiseBuffer(c, secs, brown) {
    const len = Math.floor(c.sampleRate * secs), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    let lastv = 0;
    for (let i = 0; i < len; i++) { const wv = Math.random() * 2 - 1; if (brown) { lastv = (lastv + 0.02 * wv) / 1.02; d[i] = lastv * 3.5; } else d[i] = wv; }
    return buf;
  }
  function startAmbient() {
    const c = ensureCtx(); if (!c) return false;
    if (amb) return true;
    const master = c.createGain(); master.gain.value = 0; master.connect(c.destination);
    const nb = c.createBufferSource(); nb.buffer = noiseBuffer(c, 3, true); nb.loop = true;
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
    const hum = c.createGain(); hum.gain.value = 0.5;
    nb.connect(lp); lp.connect(hum); hum.connect(master);
    const wn = c.createBufferSource(); wn.buffer = noiseBuffer(c, 2, false); wn.loop = true;
    const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1500;
    const rainG = c.createGain(); rainG.gain.value = 0;
    wn.connect(hp); hp.connect(rainG); rainG.connect(master);
    const o1 = c.createOscillator(); o1.type = "sine"; o1.frequency.value = 55;
    const o2 = c.createOscillator(); o2.type = "triangle"; o2.frequency.value = 82.4;
    const dg = c.createGain(); dg.gain.value = 0.05;
    o1.connect(dg); o2.connect(dg); dg.connect(master);
    nb.start(); wn.start(); o1.start(); o2.start();
    amb = { master: master, rainG: rainG, next: 0 };
    ambGain();
    return true;
  }
  function ambGain() {
    if (!amb || !actx) return;
    const v = soundOn ? (radioOn ? 0.12 : 0.32) : 0;
    amb.master.gain.setTargetAtTime(v, actx.currentTime, 0.4);
  }
  function updateAmbient(dt) {
    if (!amb || !soundOn) return;
    amb.rainG.gain.setTargetAtTime(weather.kind === "rain" ? 0.35 : 0, actx.currentTime, 0.8);
    amb.next -= dt;
    if (amb.next <= 0) { amb.next = rand(0.25, 1.1) / shiftNow.busy; sfx("chatter"); }
  }
  function tone(type, f0, f1, dur, vol, delay) {
    const c = actx; const t0 = c.currentTime + (delay || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(amb.master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function sfx(name) {
    if (!soundOn || !amb || !actx) return;
    try {
      if (name === "chatter") { const f = rand(500, 1300); tone("sine", f, f * rand(0.8, 1.3), rand(0.05, 0.12), 0.04); if (chance(0.5)) tone("sine", f * 1.2, f, 0.07, 0.03, 0.09); }
      else if (name === "pop") tone("triangle", 600, 1400, 0.12, 0.25);
      else if (name === "hi5") { tone("square", 1800, 1200, 0.05, 0.12); tone("sine", 2400, 0, 0.1, 0.1, 0.03); }
      else if (name === "fight") { for (let i = 0; i < 4; i++) tone("square", rand(120, 260), rand(80, 120), 0.08, 0.08, i * 0.09); }
      else if (name === "honk") { tone("sawtooth", 233, 0, 0.22, 0.08); tone("sawtooth", 294, 0, 0.22, 0.06); }
      else if (name === "heart") { [523, 659, 784, 1047].forEach(function (f, i) { tone("sine", f, 0, 0.5, 0.14, i * 0.12); }); }
      else if (name === "ding") tone("sine", 1320, 0, 0.9, 0.16);
      else if (name === "glitch") { for (let i = 0; i < 8; i++) tone("square", rand(80, 2000), rand(80, 2000), 0.05, 0.07, i * 0.06); }
      else if (name === "kick") tone("sine", 150, 45, 0.25, 0.4);
      else if (name === "crumb") tone("triangle", rand(900, 1500), 0, 0.06, 0.08);
    } catch (e) {}
  }
  function toggleSound() {
    soundOn = !soundOn;
    if (soundOn) { if (!startAmbient()) { soundOn = false; return; } ensureCtx(); logEvent("Town sounds on"); }
    ambGain();
    if (elSound) { elSound.classList.toggle("on", soundOn); elSound.setAttribute("aria-pressed", soundOn ? "true" : "false"); elSound.textContent = soundOn ? "♪ Sound on" : "♪ Sound"; }
  }
  if (elSound) elSound.addEventListener("click", function (e) { e.stopPropagation(); toggleSound(); });

  /* ---------- Twitter ticker (visible label: Twitter) ---------- */
  let feed = { posts: [], handle: "@TherapyToaster" }, lastPostId = null;
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function cleanPost(p) {
    const text = String((p && (p.text || p.full_text)) || "").replace(/https:\/\/t\.co\/\S+/g, "").replace(/\s+/g, " ").trim();
    return { id: String((p && (p.id || p.id_str)) || ""), text: text };
  }
  function normalizeFeed(j) {
    const posts = ((j && j.posts) || []).map(cleanPost).filter(function (p) { return p.text; });
    posts.sort(function (a, b) { return (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0); });
    return { handle: "@" + (((j && j.user && j.user.username) || (j && j.handle) || "TherapyToaster").replace(/^@/, "")), posts: posts };
  }
  function refreshTicker() {
    const posts = feed.posts || [], handle = feed.handle || "@TherapyToaster";
    if (!posts.length) { elTrack.textContent = "Twitter · " + handle + " · feed warming up…"; return; }
    const bits = [];
    for (let r = 0; r < 3; r++) for (let i = 0; i < posts.length; i++) bits.push("<b>Twitter</b> " + handle + "  —  " + escapeHtml(posts[i].text));
    elTrack.innerHTML = bits.join("<span class='dot'>●</span>");
  }
  function broadcastPulse() {
    logoPulse = 1;
    const r = logoRect();
    rings.push({ x: w / 2, y: r.y + r.h, r: 20, life: 1.4, max: 1.4, sp: 260 });
    for (let i = 0; i < citizens.length; i++) { const c = citizens[i]; if (c.state !== "inside" && c.z === 0 && chance(0.5)) c.vz = 150 * c.sc; }
    const c = pick(citizens); if (c && c.state !== "inside") say(c, "New post on Twitter!", 2.4, true);
  }
  function applyFeed(j) {
    const next = normalizeFeed(j); if (!next.posts.length) return false;
    const newest = next.posts[0].id, isNew = lastPostId && newest && newest !== lastPostId;
    feed = next; refreshTicker();
    if (isNew) { broadcastPulse(); logEvent("New post on Twitter"); }
    lastPostId = newest; return true;
  }
  function fetchJson(url) {
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 5000) : null;
    return fetch(url, { cache: "no-store", signal: ctrl ? ctrl.signal : undefined }).then(function (r) { if (timer) clearTimeout(timer); if (!r.ok) throw new Error("bad"); return r.json(); })
      .catch(function (err) { if (timer) clearTimeout(timer); throw err; });
  }
  function loadFeed() {
    if (window.TT_TOWN_FEED && window.TT_TOWN_FEED.posts) { applyFeed(window.TT_TOWN_FEED); return Promise.resolve(); }
    const urls = (Q.get("localfeed") === "1" ? [] : FEED_PUBLIC).concat([FEED_LOCAL]);
    let chain = Promise.reject();
    urls.forEach(function (u) { chain = chain.catch(function () { return fetchJson(u).then(function (j) { if (!applyFeed(j)) throw new Error("empty"); }); }); });
    return chain.catch(function () { applyFeed({ handle: "@TherapyToaster", posts: [{ id: "0", text: "Stay toasty, Toaster Town." }] }); });
  }

  /* ---------- visits ---------- */
  let visits = 1;
  function loadVisits() {
    let siteVisits = null;
    try { const s = JSON.parse(localStorage.getItem("ttdgStreak") || "null"); if (s && typeof s.visits === "number" && s.visits > 0) siteVisits = s.visits; } catch (e) {}
    try { const n = parseInt(localStorage.getItem("tt-town-visits") || "0", 10) || 0; visits = n + 1; localStorage.setItem("tt-town-visits", String(visits)); } catch (e) { visits = 1; }
    elVisits.textContent = siteVisits ? "Visits " + siteVisits : "Visit " + visits;
  }

  /* ---------- log / hint ---------- */
  function logEvent(text) {
    if (!elLog) return;
    const el = document.createElement("div"); el.className = "msg"; el.textContent = text;
    elLog.appendChild(el);
    while (elLog.children.length > (isMobile ? 2 : 3)) elLog.removeChild(elLog.firstChild);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 5200);
  }
  function fadeHint() { if (hintFaded) return; hintFaded = true; if (elHint) elHint.classList.add("fade"); }
  setTimeout(fadeHint, 14000);

  /* ---------- input ---------- */
  let pointerDown = false, downX = 0, downY = 0, dragged = false, downPlace = null, hoverPlace = null, lastSprinkle = 0;
  function placeAt(x, y) {
    for (let i = 0; i < places.length; i++) { const p = places[i]; if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return p; }
    return null;
  }
  function openPlace(href) { fadeHint(); try { window.top.location.href = href; } catch (e) { window.location.href = href; } }
  function citizenAt(x, y) {
    let best = null, bd = 1e9;
    for (let i = 0; i < citizens.length; i++) {
      const c = citizens[i]; if (c.state === "inside") continue;
      const cx = c.x, cy = c.y - 22 * c.sc - c.z;
      const d = dist(x, y, cx, cy); if (d < 22 * c.sc + 6 && d < bd) { bd = d; best = c; }
    }
    return best;
  }
  function buildingAt(x, y) {
    for (let i = 0; i < buildings.length; i++) { const b = buildings[i]; if (x >= b.x0 && x <= b.x1 && y >= b.by - b.spec.top * b.k && y <= b.by + 4) return b; }
    return null;
  }
  let famCool = 0;
  function tapAt(x, y) {
    fadeHint();
    const c = citizenAt(x, y);
    if (c) {
      if (c.z === 0) c.vz = 230 * c.sc; c.spin = 1;
      say(c, c.family && c.type === "dad" ? "Hooah! Dad of 4!" : c.family && c.type === "mom" ? "Hi! I'm his One of a Kind" : pick(c.skull ? ["Rattle!", "Boo!", "Bone-jour!", "Ow, my skull"] : LINES.tap), 1.8, true);
      burst(x, y, 12, c.type === "golden" ? "#fff" : YELLOW); sfx("pop");
      if (c.type === "golden") { for (let i = 0; i < 10; i++) dropCrumb(c.x + rand(-30, 30), c.y + rand(-10, 10), rand(30, 80), rand(100, 200)); }
      return;
    }
    const r = logoRect();
    if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) { logoGlitch = 1; logoPulse = 1; if (holoT <= 0) holoT = 3; sfx("glitch"); return; }
    const b = buildingAt(x, y);
    if (b) {
      if (b.id === "hq") { toasterPop(); return; }
      if (b.id === "home") { if (!fam && time > famCool) { famCool = time + 25; startFamily(chance(0.5)); } else { b.flash = 1; } return; }
      if (b.id === "vet") {
        b.flash = 1;
        for (let i = 0; i < citizens.length; i++) { const o = citizens[i]; if (o.state !== "inside" && !o.family && dist(o.x, o.y, b.doorX, b.doorY) < 220 && (o.state === "idle" || o.state === "walk")) { o.state = "salute"; o.timer = 2; } }
        sayAt(b.doorX, b.y0 - 10, "HOOAH!", 1.8); sfx("hi5"); return;
      }
    }
    if (y < L.hz) { spawnShootingStar(); rings.push({ x: x, y: y, r: 4, life: 0.6, max: 0.6, sp: 120, flat: false }); return; }
    sprinkleAt(x, y, 7); sfx("crumb");
    rings.push({ x: x, y: y, r: 6, life: 0.7, max: 0.7, sp: 200 });
    for (let i = 0; i < citizens.length; i++) { const o = citizens[i]; if (o.state !== "inside" && o.z === 0 && dist(o.x, o.y, x, y) < 90) o.vz = 120 * o.sc; }
  }
  function eventPos(e) {
    const r = canvas.getBoundingClientRect();
    const src = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  }
  function movePointer(p) {
    if (Math.abs(p.x - pointer.x) + Math.abs(p.y - pointer.y) > 6) { pointer.still = 0; pointer.lastMove = time; }
    pointer.x = p.x; pointer.y = p.y; pointer.on = true;
    parTarget = clamp((p.x / Math.max(1, w)) * 2 - 1, -1, 1);
  }
  function onDown(e) {
    e.preventDefault();
    const p = eventPos(e); movePointer(p); pointer.lastMove = time;
    pointerDown = true; dragged = false; downX = p.x; downY = p.y;
    downPlace = placeAt(p.x, p.y); hoverPlace = downPlace;
  }
  function onMove(e) {
    const p = eventPos(e); movePointer(p);
    if (!pointerDown) hoverPlace = placeAt(p.x, p.y);
    else if (Math.hypot(p.x - downX, p.y - downY) > 12) dragged = true;
  }
  function onUp(e) {
    if (!pointerDown) return;
    pointerDown = false;
    if (downPlace && !dragged) openPlace(downPlace.href);
    else if (!dragged) tapAt(downX, downY);
    downPlace = null;
    if (e && e.changedTouches) { hoverPlace = null; } else hoverPlace = placeAt(pointer.x, pointer.y);
  }
  canvas.addEventListener("mousedown", onDown);
  canvas.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("touchstart", onDown, { passive: false });
  canvas.addEventListener("touchmove", function (e) { if (pointerDown) e.preventDefault(); onMove(e); }, { passive: false });
  canvas.addEventListener("touchend", onUp);
  canvas.addEventListener("touchcancel", onUp);
  canvas.addEventListener("mouseleave", function () { if (!pointerDown) { hoverPlace = null; pointer.on = false; } });

  /* ---------- HUD ---------- */
  let hudAcc = 0;
  function updateHud(dt, parts) {
    hudAcc += dt; if (hudAcc < 0.25) return; hudAcc = 0;
    elClock.textContent = parts.weekday.toUpperCase() + "  " + parts.hour + ":" + parts.minute + ":" + parts.second + "  NY";
    const extra = storm > 0 ? " · GLITCH STORM" : weather.kind === "rain" ? " · RAIN" : weather.kind === "snow" ? " · CRUMB SNOW" : party > 0.2 ? " · BLOCK PARTY" : radioOn ? " · ON AIR" : "";
    elShift.textContent = shiftNow.name + " · " + skyNow.label + extra;
    const out = citizens.length - census.inside;
    elCensus.textContent = isMobile
      ? citizens.length + " CITIZENS · " + census.inside + " INSIDE"
      : citizens.length + " CITIZENS  ·  " + out + " OUT  ·  " + census.inside + " INSIDE  ·  " + trucks.length + " CYBERTRUCKS  ·  " + crumbs.length + " CRUMBS";
    if (elPlace) { if (hoverPlace) { elPlace.textContent = hoverPlace.label; elPlace.classList.add("on"); } else elPlace.classList.remove("on"); }
    canvas.style.cursor = hoverPlace ? "pointer" : "crosshair";
  }

  /* ---------- frame ---------- */
  const drawList = [];
  let quality = 0;
  function trimCitizens() {
    const keep = Math.round(popTarget());
    for (let i = citizens.length - 1; i >= 0 && citizens.length > keep; i--) { const c = citizens[i]; if (!c.family && c.state !== "queue" && c.state !== "play") { if (c.bubble) removeBubble(c.bubble); leaveQueue(c); releaseArcade(c); citizens.splice(i, 1); } }
  }
  let fpsAcc = 0, fpsN = 0, fps = 60;
  function render(now) {
    if (hidden) { running = false; return; }
    running = true;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now; time += dt; frame++;
    fpsAcc += dt; fpsN++;
    if (fpsAcc >= 2) {
      fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0;
      /* adaptive quality: step down resolution / extras if the device struggles */
      if (time > 5 && fps < 46 && quality < 2 && !Q.has("hq")) { quality++; resize(); buildWorld(); if (quality === 2) trimCitizens(); }
    }
    const parts = nyParts();
    const hr = nyHour(parts);
    skyNow = skyAt(hr); shiftNow = shiftFor(hr);
    if (pointer.on) pointer.still += dt;
    parX = lerp(parX, parTarget, Math.min(1, dt * 2));
    if (pointerDown && !downPlace && dragged && now - lastSprinkle > 90) { lastSprinkle = now; sprinkleAt(pointer.x, pointer.y, 2); }

    updateAudioLevels(dt);
    updateAmbient(dt);
    scheduleEvents(dt);
    updateEvents(dt, time);
    updateCitizens(dt);
    updateTrucks(dt);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawSky(time, dt);
    drawLogoSign(time);
    drawPartyFloor(time);
    updateDrawCrumbs(dt);
    drawList.length = 0;
    for (let i = 0; i < buildings.length; i++) { buildings[i].sortY = buildings[i].by; drawList.push(buildings[i]); }
    for (let i = 0; i < citizens.length; i++) { const c = citizens[i]; if (c.state !== "inside") { c.sortY = c.y; drawList.push(c); } }
    for (let i = 0; i < trucks.length; i++) { trucks[i].sortY = trucks[i].y; trucks[i].isTruck = true; drawList.push(trucks[i]); }
    drawList.sort(function (a, b) { return a.sortY - b.sortY; });
    for (let i = 0; i < drawList.length; i++) {
      const o = drawList[i];
      if (o.body) drawBuilding(o, time, dt); else if (o.isTruck) drawTruck(o, time); else drawCitizen(o, time);
    }
    drawFamilyExtras(time);
    updateDrawSmoke(dt);
    drawHologram(time);
    updateDrawSparks(dt);
    updateDrawWeather(dt);
    drawBubbles(dt);
    drawBanner(dt, time);
    drawGlitchFx();
    if (flashA > 0.01) { ctx.fillStyle = "rgba(255,250,220," + flashA * 0.35 + ")"; ctx.fillRect(0, 0, w, h); }
    if (sweep >= 0) {
      sweep += dt * 0.6;
      const sy = sweep * (h + 80) - 40;
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.12; ctx.fillStyle = YELLOW; ctx.fillRect(0, sy, w, 3); ctx.globalAlpha = 0.05; ctx.fillRect(0, sy - 30, w, 30);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      if (sweep > 1) sweep = -1;
    }
    updateHud(dt, parts);
    requestAnimationFrame(render);
  }
  function startLoop() { if (running || hidden) return; last = performance.now(); running = true; requestAnimationFrame(render); }

  function resize() {
    isMobile = window.innerWidth < 700 || (window.innerWidth < 1000 && window.innerHeight > window.innerWidth * 1.15);
    const lowPower = isMobile || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 1.75, quality === 1 ? 1.25 : quality === 2 ? 1 : 9);
    w = Math.max(2, window.innerWidth); h = Math.max(2, window.innerHeight);
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
  }
  let resizeT = null, lastMobile = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      const oldW = w, oldH = h;
      resize();
      if (lastMobile !== isMobile) { lastMobile = isMobile; bakeAllSprites(); buildWorld(); populate(); return; }
      buildWorld();
      for (let i = 0; i < citizens.length; i++) { const c = citizens[i]; c.x = c.x / oldW * w; c.y = c.y / oldH * h; c.tx = c.x; c.ty = c.y; if (c.state === "walk" && !c.family) { c.state = "idle"; c.timer = 0.3; } }
      for (let i = 0; i < trucks.length; i++) trucks[i].y = laneY(trucks[i].dir);
      queue.length = 0; arcadeBusy[0] = arcadeBusy[1] = arcadeBusy[2] = null;
    }, 120);
  });
  document.addEventListener("visibilitychange", function () {
    hidden = document.hidden;
    if (hidden) { running = false; if (audio && radioOn && !audio.paused) audio.pause(); if (actx && soundOn) actx.suspend().catch(function () {}); }
    else { if (radioOn && audio) audio.play().catch(function () {}); if (actx && soundOn) actx.resume().catch(function () {}); startLoop(); }
  });

  /* ---------- boot ---------- */
  resize(); lastMobile = isMobile;
  bakeAllSprites();
  buildWorld();
  loadVisits();
  populate();
  loadTracks();
  loadFeed();
  setInterval(loadFeed, 60000);
  window.addEventListener("load", startLoop);
  startLoop();
  if (forcedEvent) setTimeout(function () { forcedEvent.split(",").forEach(function (n) { trigger(n); }); }, 600);

  window.ToasterTown = {
    trigger: trigger,
    sprinkleAt: function (x, y) { sprinkleAt(x, y, 8); },
    tap: tapAt,
    broadcast: function (text) { if (text) { feed.posts = [{ id: String(Date.now()), text: text }].concat(feed.posts || []); lastPostId = feed.posts[0].id; refreshTicker(); } broadcastPulse(); logEvent("New post on Twitter"); },
    play: toggleRadio,
    places: function () { return places.map(function (p) { return { id: p.id, href: p.href, x: p.x + p.w / 2, y: p.y + p.h * 0.6 }; }); },
    sound: toggleSound,
    stats: function () { return { fps: Math.round(fps), quality: quality, citizens: citizens.length, inside: census.inside, trucks: trucks.length, crumbs: crumbs.length, bubbles: bubbles.length, w: w, h: h, dpr: dpr, mobile: isMobile }; },
    pause: function () { hidden = true; running = false; if (audio) audio.pause(); },
    resume: function () { hidden = false; startLoop(); }
  };
})();
