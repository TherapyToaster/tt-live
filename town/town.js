/* Toaster Town v2 — living crumb ecosystem for Therapy Toaster.
   Official logo is composited from the PNG, never redrawn.
   Visible social label is "Twitter", never "X".
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

  const canvas = document.getElementById("town");
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const elClock = document.getElementById("clock");
  const elShift = document.getElementById("shift");
  const elCensus = document.getElementById("census");
  const elHint = document.getElementById("hint");
  const elTrack = document.getElementById("ticker-track");
  const elVisits = document.getElementById("visits");
  const elLog = document.getElementById("log");
  const elPlace = document.getElementById("place-label");
  const elRadio = document.getElementById("radio-btn");
  const elNow = document.getElementById("now-playing");

  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const forcedShift = (function () {
    const q = new URLSearchParams(location.search).get("shift");
    return q && /^(breakfast|lunch|golden|night)$/.test(q) ? q : null;
  })();

  let W = 0, H = 0, dpr = 1;
  let isMobile = false;
  let running = false;
  let hidden = document.hidden;
  let last = 0;
  let time = 0;
  let hintFaded = false;
  let floorCanvas = null;
  let floorW = 0, floorH = 0;

  const logo = new Image();
  logo.src = LOGO_SRC;
  let logoReady = false;
  let logoSprite = null;
  logo.onload = function () {
    logoSprite = punchLogoBackground(logo);
    logoReady = true;
  };

  const sprites = { toast: null, skull: null, truckL: null, truckR: null, crumb: null };

  const crumbs = [];
  const toasts = [];
  const skulls = [];
  const trucks = [];
  const sparks = [];

  let visits = 1;
  let siteVisits = null;
  let feed = { posts: [], source: "Twitter", handle: "@TherapyToaster" };
  let feedSource = "fallback";
  let lastPostId = null;
  let logoPulse = 0;
  let pointerDown = false;
  let pointerX = 0, pointerY = 0;
  let lastSprinkle = 0;
  let downX = 0, downY = 0, dragged = false;
  let downPlace = null;
  let hoverPlace = null;
  let lastShiftId = null;

  let weather = { kind: null, t: 0, dur: 0 };
  let walkby = null;
  let nextWeather = 18;
  let nextRare = 22;
  let nextWalk = 28;

  let tracks = [];
  let trackIndex = 0;
  let audio = null;
  let radioOn = false;
  let radioPhase = 0;

  const FALLBACK_TRACKS = [
    { id: "9ce7aece-669c-4791-bdd2-ff7ccf2d44a3", title: "Four Handles, One Toaster", by: "TherapyToaster", audio: "https://cdn1.suno.ai/9ce7aece-669c-4791-bdd2-ff7ccf2d44a3.mp4", main: true },
    { id: "50f5db74-1ba7-41eb-b29f-83f8b721bfbf", title: "Toasty Afternoon (It’s not a phase mom!)", by: "BlueSfaira", audio: "https://cdn1.suno.ai/50f5db74-1ba7-41eb-b29f-83f8b721bfbf.mp4" },
    { id: "f571e962-64ba-40b9-8c98-a52c7e81ea18", title: "Toasty Afternoon", by: "BlueSfaira", audio: "https://cdn1.suno.ai/f571e962-64ba-40b9-8c98-a52c7e81ea18.mp4" },
    { id: "fe6d232e-248e-4ae7-9b90-e95d844c60a4", title: "Therapy Toaster", by: "TherapyToaster", audio: "https://cdn1.suno.ai/fe6d232e-248e-4ae7-9b90-e95d844c60a4.mp4" },
    { id: "6a2f3959-4d51-4aa7-b144-e4edc106a335", title: "Unreal Beach Days", by: "TherapyToaster", audio: "https://cdn1.suno.ai/6a2f3959-4d51-4aa7-b144-e4edc106a335.mp4" },
    { id: "c24b5081-4a7d-4cc1-bad2-456b87e16178", title: "Therapy Toaster (Pop It Up)", by: "TherapyToaster", audio: "https://cdn1.suno.ai/c24b5081-4a7d-4cc1-bad2-456b87e16178.mp4" },
    { id: "52049d72-5d62-4945-98a1-03648deb5ff4", title: "Four Handles, One Toaster", by: "TherapyToaster", audio: "https://cdn1.suno.ai/52049d72-5d62-4945-98a1-03648deb5ff4.mp4" },
    { id: "8e1e4a48-c646-488f-8bf1-e1072dd63411", title: "Zero Skulls", by: "TherapyToaster", audio: "https://cdn1.suno.ai/8e1e4a48-c646-488f-8bf1-e1072dd63411.mp4" },
    { id: "0bd51395-55a7-468f-8ef6-4cd03af5647f", title: "Toaster at the Tavern", by: "TherapyToaster", audio: "https://cdn1.suno.ai/0bd51395-55a7-468f-8ef6-4cd03af5647f.mp4" },
    { id: "2603d8ab-fb50-4968-823d-7437e03aba64", title: "Therapy Toaster", by: "TherapyToaster", audio: "https://cdn1.suno.ai/2603d8ab-fb50-4968-823d-7437e03aba64.mp4" },
    { id: "427e0f31-b29f-4aa1-8ff5-c0f45a27342a", title: "Four Handles, One Toaster", by: "TherapyToaster", audio: "https://cdn1.suno.ai/427e0f31-b29f-4aa1-8ff5-c0f45a27342a.mp4" },
    { id: "ef163208-5ea1-4385-8f13-ef65cc2d5205", title: "Chains on the ground, speed square in the sky", by: "TherapyToaster", audio: "https://cdn1.suno.ai/ef163208-5ea1-4385-8f13-ef65cc2d5205.mp4" },
    { id: "84fd6396-19c8-4f32-b16f-384a0d306c17", title: "Little Headlights", by: "TherapyToaster", audio: "https://cdn1.suno.ai/84fd6396-19c8-4f32-b16f-384a0d306c17.mp4" },
    { id: "5ce09690-4c09-4053-b237-c96f4a3e8d4e", title: "Keep Moving, Keep Breathing", by: "TherapyToaster", audio: "https://cdn1.suno.ai/5ce09690-4c09-4053-b237-c96f4a3e8d4e.mp4" }
  ];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function punchLogoBackground(img) {
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const data = g.getImageData(0, 0, w, h);
    const px = data.data;
    const thresh = 12;
    const seen = new Uint8Array(w * h);
    const qx = new Int32Array(w * h);
    const qy = new Int32Array(w * h);
    let qh = 0;
    function tryPush(x, y) {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const i = y * w + x;
      if (seen[i]) return;
      const o = i * 4;
      if (Math.max(px[o], px[o + 1], px[o + 2]) > thresh) return;
      seen[i] = 1;
      qx[qh] = x; qy[qh] = y; qh++;
    }
    tryPush(0, 0); tryPush(w - 1, 0); tryPush(0, h - 1); tryPush(w - 1, h - 1);
    let qi = 0;
    while (qi < qh) {
      const x = qx[qi], y = qy[qi]; qi++;
      px[(y * w + x) * 4 + 3] = 0;
      tryPush(x + 1, y); tryPush(x - 1, y); tryPush(x, y + 1); tryPush(x, y - 1);
    }
    g.putImageData(data, 0, 0);
    return c;
  }

  function nyParts(date) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date || new Date());
    const g = {};
    for (let i = 0; i < parts.length; i++) g[parts[i].type] = parts[i].value;
    return g;
  }

  function currentShift(hour, forced) {
    const id = forced || (
      hour >= 5 && hour < 10 ? "breakfast" :
      hour >= 10 && hour < 16 ? "lunch" :
      hour >= 16 && hour < 21 ? "golden" : "night"
    );
    const map = {
      breakfast: { id: "breakfast", name: "BREAKFAST RUSH", skyTop: [18, 8, 28], skyBot: [28, 14, 8], ambient: 0.22, neon: 0.85, crumbRate: 1.55, skullMood: 0.6, toastMood: 1.25 },
      lunch: { id: "lunch", name: "LUNCH SERVICE", skyTop: [10, 10, 12], skyBot: [16, 12, 4], ambient: 0.28, neon: 0.7, crumbRate: 1.0, skullMood: 0.8, toastMood: 1.0 },
      golden: { id: "golden", name: "GOLDEN CRUMBS", skyTop: [28, 10, 4], skyBot: [20, 8, 0], ambient: 0.18, neon: 1.0, crumbRate: 1.2, skullMood: 1.0, toastMood: 1.05 },
      night: { id: "night", name: "NIGHT WATCH", skyTop: [2, 2, 6], skyBot: [6, 4, 0], ambient: 0.08, neon: 1.2, crumbRate: 0.7, skullMood: 1.4, toastMood: 0.85 }
    };
    return map[id] || map.lunch;
  }

  function bakeSprite(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    return c;
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function bakeAll() {
    sprites.toast = bakeSprite(96, 96, function (g, w, h) {
      const cx = w / 2, cy = h / 2 + 2;
      g.save();
      g.shadowColor = "rgba(255,212,0,0.9)";
      g.shadowBlur = 12;
      g.fillStyle = "#E7B34A";
      roundRect(g, cx - 26, cy - 26, 52, 52, 8);
      g.fill();
      g.shadowBlur = 0;
      g.strokeStyle = "#8A4A12";
      g.lineWidth = 4;
      g.stroke();
      g.strokeStyle = YELLOW;
      g.lineWidth = 1.6;
      g.stroke();
      g.fillStyle = "rgba(140,70,16,0.18)";
      roundRect(g, cx - 22, cy - 22, 44, 44, 6);
      g.fill();
      g.fillStyle = "#FFE566";
      g.fillRect(cx - 6, cy - 8, 14, 10);
      g.strokeStyle = "rgba(255,212,0,0.9)";
      g.lineWidth = 1;
      g.strokeRect(cx - 6, cy - 8, 14, 10);
      g.fillStyle = "#1a0a00";
      g.beginPath();
      g.arc(cx - 9, cy + 6, 3.1, 0, Math.PI * 2);
      g.arc(cx + 10, cy + 6, 3.1, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = YELLOW;
      g.beginPath();
      g.arc(cx - 8, cy + 5, 1.1, 0, Math.PI * 2);
      g.arc(cx + 11, cy + 5, 1.1, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#1a0a00";
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(cx + 1, cy + 12, 7, 0.15 * Math.PI, 0.85 * Math.PI);
      g.stroke();
      g.restore();
    });
    sprites.skull = bakeSprite(96, 96, function (g, w, h) {
      const cx = w / 2, cy = h / 2;
      g.save();
      g.shadowColor = "rgba(255,212,0,0.75)";
      g.shadowBlur = 12;
      g.fillStyle = "#F3E6B8";
      g.beginPath();
      g.ellipse(cx, cy - 6, 20, 18, 0, 0, Math.PI * 2);
      g.fill();
      g.fillRect(cx - 12, cy + 6, 24, 12);
      g.shadowBlur = 0;
      g.strokeStyle = YELLOW;
      g.lineWidth = 1.7;
      g.beginPath();
      g.ellipse(cx, cy - 6, 20, 18, 0, 0, Math.PI * 2);
      g.stroke();
      g.strokeRect(cx - 12, cy + 6, 24, 12);
      g.fillStyle = "#0a0a00";
      g.beginPath();
      g.ellipse(cx - 8, cy - 6, 5.2, 6, -0.15, 0, Math.PI * 2);
      g.ellipse(cx + 8, cy - 6, 5.2, 6, 0.15, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = YELLOW;
      g.globalAlpha = 0.85;
      g.beginPath();
      g.arc(cx - 8, cy - 6, 1.4, 0, Math.PI * 2);
      g.arc(cx + 8, cy - 6, 1.4, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      g.fillStyle = "#0a0a00";
      g.beginPath();
      g.moveTo(cx, cy + 1);
      g.lineTo(cx - 3, cy + 7);
      g.lineTo(cx + 3, cy + 7);
      g.closePath();
      g.fill();
      g.strokeStyle = "#0a0a00";
      g.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) {
        const x = cx - 8 + i * 5.2;
        g.beginPath(); g.moveTo(x, cy + 10); g.lineTo(x, cy + 16); g.stroke();
      }
      g.restore();
    });
    function truck(g, w, h, dir) {
      const cx = w / 2, cy = h / 2 + 4;
      g.save();
      if (dir < 0) { g.translate(w, 0); g.scale(-1, 1); }
      g.shadowColor = "rgba(255,212,0,0.55)";
      g.shadowBlur = 10;
      g.fillStyle = "#C9CED4";
      g.beginPath();
      g.moveTo(cx - 44, cy + 8);
      g.lineTo(cx - 40, cy - 6);
      g.lineTo(cx + 8, cy - 14);
      g.lineTo(cx + 42, cy - 6);
      g.lineTo(cx + 46, cy + 8);
      g.closePath();
      g.fill();
      g.shadowBlur = 0;
      g.strokeStyle = YELLOW; g.lineWidth = 1.5; g.stroke();
      g.fillStyle = "rgba(10,12,16,0.85)";
      g.beginPath();
      g.moveTo(cx + 6, cy - 11);
      g.lineTo(cx + 28, cy - 8);
      g.lineTo(cx + 30, cy - 1);
      g.lineTo(cx + 6, cy - 2);
      g.closePath();
      g.fill();
      g.fillStyle = YELLOW;
      g.shadowColor = YELLOW; g.shadowBlur = 8;
      g.fillRect(cx + 34, cy - 4, 10, 4);
      g.shadowBlur = 0;
      g.fillStyle = "#111"; g.strokeStyle = YELLOW; g.lineWidth = 1.2;
      g.beginPath();
      g.rect(cx - 28, cy + 6, 14, 10);
      g.rect(cx + 16, cy + 6, 14, 10);
      g.fill(); g.stroke();
      g.restore();
    }
    sprites.truckR = bakeSprite(160, 80, function (g, w, h) { truck(g, w, h, 1); });
    sprites.truckL = bakeSprite(160, 80, function (g, w, h) { truck(g, w, h, -1); });
    sprites.crumb = bakeSprite(28, 28, function (g, w, h) {
      const cx = w / 2, cy = h / 2;
      g.save();
      g.shadowColor = "rgba(255,212,0,0.9)";
      g.shadowBlur = 6;
      g.fillStyle = "#E8C15A";
      g.beginPath();
      g.moveTo(cx - 4, cy + 3); g.lineTo(cx - 2, cy - 4); g.lineTo(cx + 4, cy - 3); g.lineTo(cx + 5, cy + 2);
      g.closePath(); g.fill();
      g.strokeStyle = YELLOW; g.lineWidth = 1; g.stroke();
      g.restore();
    });
  }

  function horizonY() { return H * 0.36; }
  function roadY() { return H * 0.72; }
  function groundMin() { return horizonY() + 24 * dpr; }
  function groundMax() { return H - 78 * dpr; }

  function layout() {
    const s = dpr;
    const hz = horizonY();
    const ry = roadY();
    const arcadeX = isMobile ? 132 * s : W * 0.16;
    const arcadeY = hz + (isMobile ? 86 : 70) * s;
    const cabW = 56 * s, cabH = 78 * s;
    const defs = [
      { id: "art", label: "ART · GLITCH ART", href: SITE + "/glitch-art", dx: -70 },
      { id: "cade", label: "CADE · ARCADE", href: SITE + "/arcade", dx: 0 },
      { id: "skullz", label: "SKULLZ", href: SITE + "/skullz", dx: 70 }
    ];
    const cabs = defs.map(function (c) {
      const cx = arcadeX + c.dx * s;
      return { id: c.id, label: c.label, href: c.href, x: cx - cabW / 2, y: arcadeY, w: cabW, h: cabH, cx: cx, cy: arcadeY + 20 * s };
    });
    const merchX = (isMobile ? W * 0.70 : W * 0.62);
    const merchY = ry - 90 * s;
    const merch = { id: "merch", label: "MERCH · SHOP", href: SITE + "/shop", x: merchX - 44 * s, y: merchY - 16 * s, w: 88 * s, h: 60 * s, cx: merchX, cy: merchY + 16 * s };
    const radio = { id: "radio", label: "TOASTER RADIO · MUSIC", href: SITE + "/music", x: W * 0.84 - 44 * s, y: hz + 8 * s, w: 88 * s, h: 130 * s, cx: W * 0.84, cy: hz + 18 * s };
    const charge = { x: W * 0.20, y: ry, w: 80 * s };
    return { arcadeX: arcadeX, arcadeY: arcadeY, cabs: cabs, merch: merch, radio: radio, places: cabs.concat([merch, radio]), charge: charge, hz: hz, ry: ry };
  }

  function resize() {
    isMobile = window.innerWidth < 700 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    W = Math.max(2, Math.floor(window.innerWidth * dpr));
    H = Math.max(2, Math.floor(window.innerHeight * dpr));
    canvas.width = W; canvas.height = H;
    floorCanvas = null;
  }

  function paintFloor() {
    floorCanvas = document.createElement("canvas");
    floorCanvas.width = W; floorCanvas.height = H;
    floorW = W; floorH = H;
    const g = floorCanvas.getContext("2d");
    const L = layout();
    const hz = L.hz;
    const vpX = W / 2, vpY = hz - 8 * dpr;
    g.fillStyle = "#050500";
    g.fillRect(0, hz, W, H - hz);
    const grd = g.createLinearGradient(0, hz, 0, H);
    grd.addColorStop(0, "rgba(255,212,0,0.03)");
    grd.addColorStop(1, "rgba(0,0,0,0.0)");
    g.fillStyle = grd;
    g.fillRect(0, hz, W, H - hz);
    g.save();
    g.beginPath(); g.rect(0, hz, W, H - hz); g.clip();
    g.strokeStyle = "rgba(255,212,0,0.16)";
    g.lineWidth = Math.max(1, dpr * 0.7);
    const cols = isMobile ? 14 : 22;
    for (let i = -cols; i <= cols; i++) {
      const x = W / 2 + i * (W / (cols * 0.9));
      g.beginPath(); g.moveTo(x, H); g.lineTo(vpX, vpY); g.stroke();
    }
    for (let k = 1; k <= 16; k++) {
      const t = k / 16;
      const y = hz + Math.pow(t, 1.55) * (H - hz);
      g.globalAlpha = 0.08 + t * 0.16;
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    }
    g.restore(); g.globalAlpha = 1;

    const px = W / 2, py = hz + (L.ry - hz) * 0.42;
    g.save();
    g.translate(px, py); g.scale(1, 0.32);
    g.strokeStyle = "rgba(255,212,0,0.55)"; g.lineWidth = 2 * dpr;
    g.beginPath(); g.arc(0, 0, 160 * dpr, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1 * dpr; g.strokeStyle = "rgba(255,212,0,0.25)";
    g.beginPath(); g.arc(0, 0, 118 * dpr, 0, Math.PI * 2); g.stroke();
    g.restore();

    drawArcadeRow(g, L);
    drawStall(g, L.merch);
    // charge pad
    g.save();
    g.strokeStyle = "rgba(255,212,0,0.45)";
    g.lineWidth = 1.5 * dpr;
    g.strokeRect(L.charge.x - L.charge.w / 2, L.ry - 20 * dpr, L.charge.w, 40 * dpr);
    g.fillStyle = YELLOW;
    g.font = "600 " + (8 * dpr) + "px ui-monospace, monospace";
    g.textAlign = "center";
    g.fillText("CHARGE", L.charge.x, L.ry - 26 * dpr);
    g.restore();

    g.fillStyle = "rgba(20,20,16,0.92)";
    g.fillRect(0, L.ry - 22 * dpr, W, 44 * dpr);
    g.fillStyle = "rgba(255,212,0,0.18)";
    g.fillRect(0, L.ry - 22 * dpr, W, 2 * dpr);
    g.fillRect(0, L.ry + 20 * dpr, W, 2 * dpr);
    // redraw pad lines over the road
    g.strokeStyle = "rgba(255,212,0,0.55)";
    g.lineWidth = 1.5 * dpr;
    g.setLineDash([6 * dpr, 5 * dpr]);
    g.strokeRect(L.charge.x - L.charge.w / 2, L.ry - 20 * dpr, L.charge.w, 40 * dpr);
    g.setLineDash([]);
    g.fillStyle = YELLOW;
    g.font = "600 " + (8 * dpr) + "px ui-monospace, monospace";
    g.textAlign = "center";
    g.fillText("CHARGE", L.charge.x, L.ry - 26 * dpr);
  }

  function drawArcadeRow(g, L) {
    const s = dpr;
    g.save();
    g.font = "600 " + (8 * s) + "px ui-monospace, monospace";
    g.textAlign = "center";
    const cols = ["#FFD400", "#FF4AD2", "#7CFF5A"];
    const names = ["ART", "CADE", "SKULLZ"];
    for (let i = 0; i < L.cabs.length; i++) {
      const c = L.cabs[i];
      g.fillStyle = "#0b0b0b";
      g.strokeStyle = hoverPlace && hoverPlace.id === c.id ? "#fff" : YELLOW;
      g.lineWidth = (hoverPlace && hoverPlace.id === c.id ? 2.4 : 1.4) * s;
      roundRect(g, c.x, c.y, c.w, c.h, 3 * s);
      g.fill(); g.stroke();
      g.fillStyle = "#111";
      g.fillRect(c.cx - 20 * s, c.y + 8 * s, 40 * s, 28 * s);
      g.fillStyle = cols[i];
      g.globalAlpha = 0.35;
      g.fillRect(c.cx - 20 * s, c.y + 8 * s, 40 * s, 28 * s);
      g.globalAlpha = 1;
      g.fillStyle = YELLOW;
      g.fillText(names[i], c.cx, c.y + 52 * s);
      g.beginPath();
      g.arc(c.cx - 10 * s, c.y + 64 * s, 3 * s, 0, Math.PI * 2);
      g.arc(c.cx + 8 * s, c.y + 64 * s, 3 * s, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = YELLOW; g.globalAlpha = 0.8;
    g.font = "600 " + (9 * s) + "px ui-monospace, monospace";
    g.fillText("ARTCADE", L.arcadeX, L.arcadeY - 8 * s);
    g.restore();
  }

  function drawStall(g, merch) {
    const s = dpr;
    const on = hoverPlace && hoverPlace.id === "merch";
    g.save();
    g.translate(merch.cx, merch.cy);
    g.fillStyle = "#0b0b0b";
    g.strokeStyle = on ? "#fff" : YELLOW;
    g.lineWidth = (on ? 2.4 : 1.4) * s;
    g.fillRect(-36 * s, 8 * s, 72 * s, 36 * s);
    g.strokeRect(-36 * s, 8 * s, 72 * s, 36 * s);
    g.beginPath();
    g.moveTo(-44 * s, 8 * s); g.lineTo(0, -16 * s); g.lineTo(44 * s, 8 * s); g.closePath();
    g.fillStyle = "#1a1200"; g.fill(); g.stroke();
    g.fillStyle = YELLOW;
    g.font = "600 " + (8 * s) + "px ui-monospace, monospace";
    g.textAlign = "center";
    g.fillText("MERCH", 0, 30 * s);
    g.restore();
  }

  function drawRadioTower(g, radio, live, t) {
    const s = dpr;
    const on = hoverPlace && hoverPlace.id === "radio";
    g.save();
    g.translate(radio.cx, radio.cy);
    g.strokeStyle = on ? "#fff" : YELLOW;
    g.lineWidth = (on ? 2.2 : 1.5) * s;
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(-16 * s, 110 * s);
    g.moveTo(0, 0); g.lineTo(16 * s, 110 * s);
    g.moveTo(-10 * s, 40 * s); g.lineTo(10 * s, 40 * s);
    g.moveTo(-13 * s, 75 * s); g.lineTo(13 * s, 75 * s);
    g.stroke();
    g.fillStyle = YELLOW;
    g.beginPath(); g.arc(0, 0, 3.2 * s, 0, Math.PI * 2); g.fill();
    if (live) {
      const beat = radioOn ? 0.55 + 0.45 * Math.abs(Math.sin(radioPhase)) : 0.35 + 0.25 * Math.sin(t * 2.2);
      const pulse = (10 * s + Math.abs(Math.sin(radioOn ? radioPhase : t * 2.2)) * (radioOn ? 36 : 22) * s);
      g.strokeStyle = "rgba(255,212,0," + beat + ")";
      g.lineWidth = (radioOn ? 2 : 1) * s;
      g.beginPath(); g.arc(0, 0, pulse, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.arc(0, 0, pulse * 0.6, 0, Math.PI * 2); g.stroke();
    }
    g.fillStyle = YELLOW;
    g.font = "600 " + (9 * s) + "px ui-monospace, monospace";
    g.textAlign = "center";
    g.fillText("TOASTER RADIO", 0, 126 * s);
    g.restore();
  }

  function caps() {
    return isMobile
      ? { toast: 10, skull: 4, truck: 2, crumb: 70, spark: 60 }
      : { toast: 16, skull: 6, truck: 3, crumb: 120, spark: 110 };
  }

  function populate() {
    toasts.length = 0; skulls.length = 0; trucks.length = 0; crumbs.length = 0; sparks.length = 0;
    const C = caps();
    const bonus = Math.min(4, Math.max(0, visits - 1));
    const nToast = Math.min(C.toast, (isMobile ? 7 : 11) + Math.min(3, bonus));
    const nSkull = Math.min(C.skull, (isMobile ? 3 : 5) + Math.min(1, bonus >> 1));
    const nTruck = C.truck;
    for (let i = 0; i < nToast; i++) spawnToast(rand(W * 0.15, W * 0.85), rand(groundMin() + 20, groundMax() - 10));
    for (let i = 0; i < nSkull; i++) spawnSkull(rand(W * 0.1, W * 0.9), rand(groundMin(), roadY() - 20));
    for (let i = 0; i < nTruck; i++) spawnTruck();
    for (let i = 0; i < (isMobile ? 10 : 18); i++) dropCrumb(W / 2 + rand(-140, 140) * dpr, horizonY() + rand(50, 160) * dpr, 0);
  }

  function spawnToast(x, y, scale, golden) {
    const C = caps();
    if (toasts.length >= C.toast && !golden) return null;
    const t = {
      kind: "toast", x: x, y: y,
      vx: rand(-28, 28), vy: rand(-16, 16),
      r: 16, scale: scale || rand(0.75, 1.1),
      rot: rand(-0.2, 0.2), rv: rand(-0.4, 0.4),
      hunger: rand(0.3, 0.8), eaten: 0, age: rand(0, 10),
      energy: rand(0.4, 1), spook: 0, state: "wander",
      napT: 0, chase: null, golden: !!golden
    };
    if (golden) { t.scale = 1.35; t.energy = 1; }
    toasts.push(t);
    return t;
  }

  function spawnSkull(x, y) {
    const C = caps();
    if (skulls.length >= C.skull) return;
    skulls.push({
      kind: "skull", x: x, y: y,
      vx: rand(-40, 40), vy: rand(-24, 24),
      r: 16, scale: rand(0.7, 1.15),
      rot: 0, bob: rand(0, Math.PI * 2),
      hunger: rand(0.2, 0.7), age: 0, glitch: 0,
      haunt: (Math.random() * 3) | 0, lamp: rand(0, Math.PI * 2)
    });
  }

  function spawnTruck() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    trucks.push({
      kind: "truck",
      x: dir > 0 ? -80 * dpr : W + 80 * dpr,
      y: roadY() + rand(-4, 4) * dpr,
      vx: dir * rand(55, 90) * dpr,
      dir: dir, scale: isMobile ? 0.95 : 1.15,
      dropIn: rand(1.5, 5), state: "drive", chargeT: 0, nextCharge: rand(8, 18)
    });
  }

  function dropCrumb(x, y, vy) {
    const C = caps();
    if (crumbs.length >= C.crumb) crumbs.shift();
    crumbs.push({
      x: x, y: y,
      vx: rand(-18, 18) * dpr, vy: vy != null ? vy : rand(-10, 4) * dpr,
      r: rand(3, 5) * dpr, life: rand(14, 28), rot: rand(0, 6), grounded: false
    });
  }

  function burst(x, y, n, col) {
    const C = caps();
    for (let i = 0; i < n; i++) {
      if (sparks.length >= C.spark) sparks.shift();
      sparks.push({ x: x, y: y, vx: rand(-70, 70) * dpr, vy: rand(-90, 20) * dpr, life: rand(0.25, 0.7), age: 0, col: col || YELLOW });
    }
  }

  function nearestCrumb(x, y, maxD) {
    let best = null, bestD = maxD;
    for (let i = 0; i < crumbs.length; i++) {
      const c = crumbs[i];
      const d = Math.hypot(c.x - x, c.y - y);
      if (d < bestD) { bestD = d; best = c; }
    }
    return best;
  }
  function eatCrumb(c) {
    const i = crumbs.indexOf(c);
    if (i >= 0) crumbs.splice(i, 1);
    burst(c.x, c.y, isMobile ? 4 : 7);
  }
  function sprinkleAt(cx, cy, n) {
    const count = n || (isMobile ? 6 : 10);
    for (let i = 0; i < count; i++) dropCrumb(cx + rand(-18, 18) * dpr, cy + rand(-10, 10) * dpr, rand(-40, -8) * dpr);
    burst(cx, cy, 4);
    fadeHint();
  }
  function fadeHint() {
    if (!hintFaded) { hintFaded = true; elHint.classList.add("fade"); }
  }
  function broadcast() {
    logoPulse = 1;
    const n = isMobile ? 14 : 24;
    const lx = W / 2, ly = horizonY() - 10 * dpr;
    for (let i = 0; i < n; i++) dropCrumb(lx + rand(-90, 90) * dpr, ly + rand(0, 20) * dpr, rand(10, 80) * dpr);
    burst(lx, ly + 20 * dpr, 12);
  }

  function logEvent(text) {
    if (!elLog) return;
    const el = document.createElement("div");
    el.className = "msg";
    el.textContent = text;
    elLog.appendChild(el);
    while (elLog.children.length > 3) elLog.removeChild(elLog.firstChild);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 5200);
  }

  function placeAt(x, y) {
    const L = layout();
    for (let i = 0; i < L.places.length; i++) {
      const p = L.places[i];
      if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return p;
    }
    return null;
  }
  function openPlace(href) {
    try { window.top.location.assign(href); }
    catch (e) { window.location.assign(href); }
  }

  function startWeather(kind) {
    weather.kind = kind;
    weather.t = 0;
    weather.dur = kind === "storm" ? rand(7, 11) : rand(9, 14);
    if (kind === "storm") logEvent("Glitch storm rolling in");
    else logEvent("Crumb snow is falling");
  }
  function startWalkby() {
    if (walkby) return;
    const dir = Math.random() < 0.5 ? 1 : -1;
    walkby = {
      x: dir > 0 ? -220 * dpr : W + 220 * dpr,
      y: horizonY() + 48 * dpr,
      dir: dir,
      speed: rand(90, 130) * dpr,
      w: Math.min(W * 0.42, 380 * dpr)
    };
    logEvent("Mr. Toasty is walking through town");
  }
  function spawnGolden() {
    if (toasts.some(function (t) { return t.golden; })) return;
    const g = spawnToast(rand(W * 0.3, W * 0.7), groundMin() + 40 * dpr, 1.35, true);
    if (g) {
      logEvent("A golden toast appeared");
      burst(g.x, g.y, 16, "#FFE566");
    }
  }

  function updateEvents(dt, shift) {
    if (lastShiftId !== shift.id) {
      lastShiftId = shift.id;
      if (shift.id === "breakfast") { logEvent("Breakfast rush — crumbs are falling"); broadcast(); }
      else if (shift.id === "lunch") logEvent("Lunch service is on");
      else if (shift.id === "golden") logEvent("Golden hour — the plaza warms up");
      else if (shift.id === "night") logEvent("Night watch — flashlights are out");
    }
    if (weather.kind) {
      weather.t += dt;
      if (weather.kind === "snow") {
        const n = isMobile ? 2 : 4;
        for (let i = 0; i < n; i++) {
          if (Math.random() < 0.7) dropCrumb(rand(0, W), -8 * dpr, rand(20, 70) * dpr);
        }
      } else if (weather.kind === "storm") {
        if (Math.random() < dt * 8) burst(rand(0, W), rand(horizonY(), H * 0.7), isMobile ? 5 : 9, pick([YELLOW, "#FF4AD2", "#7CFF5A"]));
        skulls.forEach(function (s) { if (Math.random() < 0.05) s.glitch = 0.5; });
      }
      if (weather.t >= weather.dur) weather.kind = null;
    } else {
      nextWeather -= dt;
      if (nextWeather <= 0) {
        startWeather(Math.random() < 0.5 ? "snow" : "storm");
        nextWeather = rand(40, 75);
      }
    }
    nextRare -= dt;
    if (nextRare <= 0) {
      if (Math.random() < 0.55) spawnGolden();
      nextRare = rand(35, 70);
    }
    nextWalk -= dt;
    if (nextWalk <= 0) {
      startWalkby();
      nextWalk = rand(55, 95);
    }
    if (walkby) {
      walkby.x += walkby.dir * walkby.speed * dt;
      if (Math.random() < dt * 8) dropCrumb(walkby.x, walkby.y + 20 * dpr, 30 * dpr);
      if ((walkby.dir > 0 && walkby.x > W + 260 * dpr) || (walkby.dir < 0 && walkby.x < -260 * dpr)) walkby = null;
    }
  }

  function updateCreatures(dt, shift) {
    const gmin = groundMin();
    const gmax = groundMax();
    const L = layout();
    const toastSpeed = 46 * shift.toastMood;
    const skullSpeed = 58 * shift.skullMood;
    const dancing = radioOn && !reduced;

    for (let i = 0; i < toasts.length; i++) {
      const t = toasts[i];
      t.age += dt;
      t.hunger = Math.min(1, t.hunger + dt * 0.04);
      t.spook = Math.max(0, t.spook - dt);
      if (t.golden) t.energy = 1;
      else t.energy = clamp(t.energy - dt * 0.035, 0, 1);

      if (dancing) t.state = "dance";
      else if (t.state === "nap") {
        t.napT -= dt;
        t.energy = Math.min(1, t.energy + dt * 0.25);
        if (t.napT <= 0) t.state = "wander";
      } else if (t.energy < 0.12 && t.hunger < 0.7 && !t.golden) {
        t.state = "nap"; t.napT = rand(3, 6.5); t.vx *= 0.2; t.vy *= 0.2;
      } else {
        const food = nearestCrumb(t.x, t.y, (t.golden ? 220 : 160) * dpr);
        if (food && t.hunger > 0.15) {
          t.state = "seek";
          const dx = food.x - t.x, dy = food.y - t.y;
          const d = Math.hypot(dx, dy) || 1;
          t.vx += (dx / d) * 90 * dt;
          t.vy += (dy / d) * 90 * dt;
          if (d < 16 * t.scale * dpr) {
            eatCrumb(food);
            t.hunger = Math.max(0, t.hunger - 0.45);
            t.eaten++; t.energy = Math.min(1, t.energy + 0.2);
            t.scale = Math.min(t.golden ? 1.6 : 1.45, t.scale + 0.06);
            if (!t.golden && t.eaten >= 5 && toasts.length < caps().toast) {
              t.eaten = 0; t.scale *= 0.72;
              spawnToast(t.x + rand(-12, 12), t.y + rand(-12, 12), t.scale);
              burst(t.x, t.y, 10);
              logEvent("A toast split and evolved");
            }
          }
        } else if (t.state === "chase" && t.chase && toasts.indexOf(t.chase) >= 0) {
          const dx = t.chase.x - t.x, dy = t.chase.y - t.y;
          const d = Math.hypot(dx, dy) || 1;
          t.vx += (dx / d) * 110 * dt;
          t.vy += (dy / d) * 110 * dt;
          if (d < 22 * dpr || Math.random() < dt * 0.4) { t.state = "wander"; t.chase = null; }
        } else if (Math.random() < dt * 0.08) {
          const other = pick(toasts);
          if (other && other !== t) { t.state = "chase"; t.chase = other; }
        } else {
          t.state = "flock";
          let ax = 0, ay = 0, cx = 0, cy = 0, n = 0;
          for (let j = 0; j < toasts.length; j++) {
            if (j === i) continue;
            const o = toasts[j];
            const d = Math.hypot(o.x - t.x, o.y - t.y);
            if (d < 90 * dpr && d > 1) {
              ax += o.vx; ay += o.vy; cx += o.x; cy += o.y; n++;
              if (d < 30 * dpr) { t.vx -= (o.x - t.x) / d * 40 * dt; t.vy -= (o.y - t.y) / d * 40 * dt; }
            }
          }
          if (n) {
            t.vx += ((ax / n) - t.vx) * 0.8 * dt + ((cx / n) - t.x) * 0.4 * dt;
            t.vy += ((ay / n) - t.vy) * 0.8 * dt + ((cy / n) - t.y) * 0.4 * dt;
          } else {
            t.vx += Math.sin(t.age * 0.7 + i) * 20 * dt;
            t.vy += Math.cos(t.age * 0.5 + i * 0.4) * 16 * dt;
          }
        }
      }

      for (let s = 0; s < skulls.length; s++) {
        const dx = t.x - skulls[s].x, dy = t.y - skulls[s].y;
        const d = Math.hypot(dx, dy);
        if (d < 50 * dpr && d > 1) {
          t.vx += (dx / d) * 70 * dt; t.vy += (dy / d) * 70 * dt; t.spook = 0.5;
        }
      }
      for (let j = i + 1; j < toasts.length; j++) {
        const o = toasts[j];
        const dx = t.x - o.x, dy = t.y - o.y;
        const d = Math.hypot(dx, dy);
        const min = 28 * dpr * ((t.scale + o.scale) * 0.5);
        if (d < min && d > 0.1) {
          const p = (min - d) * 0.5;
          t.x += (dx / d) * p; t.y += (dy / d) * p;
          o.x -= (dx / d) * p; o.y -= (dy / d) * p;
        }
      }
      if (t.state !== "nap") {
        const sp = Math.hypot(t.vx, t.vy);
        const maxs = toastSpeed * dpr * (t.golden ? 1.2 : 1) * (t.state === "dance" ? 0.6 : 1);
        if (sp > maxs) { t.vx *= maxs / sp; t.vy *= maxs / sp; }
        t.x += t.vx * dt; t.y += t.vy * dt;
        t.vx *= 0.96; t.vy *= 0.96;
        t.rot += t.rv * dt * 0.4;
      }
      if (t.x < 20) { t.x = 20; t.vx *= -0.6; }
      if (t.x > W - 20) { t.x = W - 20; t.vx *= -0.6; }
      if (t.y < gmin) { t.y = gmin; t.vy *= -0.6; }
      if (t.y > gmax) { t.y = gmax; t.vy *= -0.6; }
    }

    for (let i = 0; i < skulls.length; i++) {
      const s = skulls[i];
      s.age += dt; s.bob += dt * 2.2;
      s.lamp += dt * (0.6 + shift.skullMood * 0.3);
      s.hunger = Math.min(1, s.hunger + dt * 0.03);
      if (Math.random() < 0.006) s.glitch = 0.35;
      s.glitch = Math.max(0, s.glitch - dt);
      const cab = L.cabs[s.haunt % L.cabs.length];
      const food = nearestCrumb(s.x, s.y, 120 * dpr);
      if (food && s.hunger > 0.7) {
        const dx = food.x - s.x, dy = food.y - s.y;
        const d = Math.hypot(dx, dy) || 1;
        s.vx += (dx / d) * 100 * dt; s.vy += (dy / d) * 80 * dt;
        if (d < 14 * dpr) eatCrumb(food);
      } else {
        // haunt the ARTcade cabinets
        const tx = cab.cx + Math.sin(s.age * 0.8 + i) * 28 * dpr;
        const ty = cab.cy + 40 * dpr + Math.cos(s.age * 0.6) * 16 * dpr;
        const dx = tx - s.x, dy = ty - s.y;
        const d = Math.hypot(dx, dy) || 1;
        s.vx += (dx / d) * 70 * dt; s.vy += (dy / d) * 70 * dt;
        if (d < 18 * dpr && Math.random() < dt * 0.3) s.haunt = (s.haunt + 1 + ((Math.random() * 2) | 0)) % L.cabs.length;
      }
      const sp = Math.hypot(s.vx, s.vy);
      const maxs = skullSpeed * dpr;
      if (sp > maxs) { s.vx *= maxs / sp; s.vy *= maxs / sp; }
      s.x += s.vx * dt; s.y += s.vy * dt;
      s.vx *= 0.97; s.vy *= 0.97;
      if (s.x < 20) { s.x = 20; s.vx *= -0.7; }
      if (s.x > W - 20) { s.x = W - 20; s.vx *= -0.7; }
      if (s.y < gmin) { s.y = gmin; s.vy *= -0.7; }
      if (s.y > gmax - 10) { s.y = gmax - 10; s.vy *= -0.7; }
    }

    for (let i = 0; i < trucks.length; i++) {
      const tr = trucks[i];
      tr.nextCharge -= dt;
      if (tr.state === "drive" && tr.nextCharge <= 0) {
        tr.state = "approach";
      }
      if (tr.state === "approach") {
        const tx = L.charge.x;
        const dx = tx - tr.x;
        tr.dir = dx >= 0 ? 1 : -1;
        tr.vx = tr.dir * Math.min(80 * dpr, Math.abs(dx) * 2 + 20 * dpr);
        tr.x += tr.vx * dt;
        if (Math.abs(dx) < 8 * dpr) { tr.state = "charge"; tr.chargeT = rand(3.5, 6); tr.vx = 0; logEvent("A Cybertruck pulled in to charge"); }
      } else if (tr.state === "charge") {
        tr.chargeT -= dt; tr.vx = 0; tr.x += (L.charge.x - tr.x) * 0.08;
        if (tr.chargeT <= 0) {
          tr.state = "drive";
          tr.dir = Math.random() < 0.5 ? 1 : -1;
          tr.vx = tr.dir * rand(55, 90) * dpr;
          tr.nextCharge = rand(14, 28);
        }
      } else {
        tr.x += tr.vx * dt;
        tr.dropIn -= dt;
        if (tr.dropIn <= 0) {
          tr.dropIn = rand(3.5, 7);
          dropCrumb(tr.x, tr.y - 10 * dpr, 20 * dpr);
          dropCrumb(tr.x + 8 * dpr, tr.y - 6 * dpr, 10 * dpr);
        }
        if (tr.dir > 0 && tr.x > W + 100 * dpr) tr.x = -100 * dpr;
        if (tr.dir < 0 && tr.x < -100 * dpr) tr.x = W + 100 * dpr;
      }
    }
  }

  function updateCrumbs(dt) {
    const gmax = groundMax();
    const floor = roadY() + 28 * dpr;
    for (let i = crumbs.length - 1; i >= 0; i--) {
      const c = crumbs[i];
      c.life -= dt;
      if (c.life <= 0) { crumbs.splice(i, 1); continue; }
      if (!c.grounded) {
        c.vy += 140 * dpr * dt;
        c.x += c.vx * dt; c.y += c.vy * dt; c.vx *= 0.99;
        if (c.y >= Math.min(floor, gmax) && c.vy > 0) {
          c.y = Math.min(floor, gmax);
          c.vy *= -0.25; c.vx *= 0.6;
          if (Math.abs(c.vy) < 8 * dpr) { c.grounded = true; c.vy = 0; c.vx = 0; }
        }
        if (c.x < 4) { c.x = 4; c.vx *= -0.4; }
        if (c.x > W - 4) { c.x = W - 4; c.vx *= -0.4; }
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.age += dt;
      if (s.age >= s.life) { sparks.splice(i, 1); continue; }
      s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 80 * dpr * dt;
    }
  }

  function drawSky(shift, t) {
    const top = shift.skyTop, bot = shift.skyBot;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgb(" + top[0] + "," + top[1] + "," + top[2] + ")");
    g.addColorStop(0.42, "rgb(" + bot[0] + "," + bot[1] + "," + bot[2] + ")");
    g.addColorStop(1, "#000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (shift.id === "golden") {
      ctx.fillStyle = "rgba(255,140,20,0.08)";
      ctx.fillRect(0, 0, W, H);
    }
    const n = (shift.id === "night" ? (isMobile ? 40 : 70) : (isMobile ? 14 : 28));
    ctx.fillStyle = YELLOW;
    for (let i = 0; i < n; i++) {
      const sx = ((i * 137.5) % 1000) / 1000 * W;
      const sy = ((i * 89.3) % 1000) / 1000 * horizonY();
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.4 + i));
      ctx.globalAlpha = tw * (shift.id === "night" ? 0.7 : 0.28);
      ctx.fillRect(sx, sy, Math.max(1, dpr), Math.max(1, dpr));
    }
    ctx.globalAlpha = 1;
    if (weather.kind === "storm") {
      ctx.fillStyle = "rgba(180,40,255,0.06)";
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawRoadDashes(t) {
    const ry = roadY();
    ctx.save();
    ctx.fillStyle = YELLOW;
    ctx.globalAlpha = 0.7;
    const period = 36 * dpr;
    const off = (t * 70 * dpr) % period;
    for (let x = -period + off; x < W + period; x += period) ctx.fillRect(x, ry - 1.2 * dpr, 18 * dpr, 2.2 * dpr);
    ctx.restore();
  }

  function drawCabinetFlicker(t, L) {
    const s = dpr;
    for (let i = 0; i < L.cabs.length; i++) {
      const c = L.cabs[i];
      const flicker = 0.35 + 0.35 * Math.abs(Math.sin(t * (3 + i) + i));
      ctx.globalAlpha = flicker;
      ctx.fillStyle = i === 1 ? "#FF4AD2" : i === 2 ? "#7CFF5A" : YELLOW;
      ctx.fillRect(c.cx - 20 * s, c.y + 8 * s, 40 * s, 28 * s);
      ctx.fillStyle = "#000";
      ctx.globalAlpha = 0.35;
      const bar = ((t * 40 + i * 13) % 24);
      ctx.fillRect(c.cx - 20 * s, c.y + 8 * s + bar * s, 40 * s, 3 * s);
    }
    ctx.globalAlpha = 1;
  }

  function drawHover(L) {
    if (!hoverPlace) {
      if (elPlace) elPlace.classList.remove("on");
      canvas.style.cursor = pointerDown ? "crosshair" : "crosshair";
      return;
    }
    canvas.style.cursor = "pointer";
    const p = hoverPlace;
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2 * dpr;
    ctx.strokeRect(p.x - 3 * dpr, p.y - 3 * dpr, p.w + 6 * dpr, p.h + 6 * dpr);
    ctx.restore();
    if (elPlace) { elPlace.textContent = p.label; elPlace.classList.add("on"); }
  }

  function drawLogoSign(t, pulse) {
    const y = Math.max(56 * dpr, horizonY() - (isMobile ? 90 : 118) * dpr);
    const maxW = Math.min(W * (isMobile ? 0.78 : 0.56), (isMobile ? 420 : 560) * dpr);
    let dw, dh;
    if (logoReady && logo.naturalWidth) {
      const ratio = logo.naturalHeight / logo.naturalWidth;
      dw = maxW; dh = maxW * ratio;
    } else { dw = maxW; dh = maxW * 0.28; }
    const x = (W - dw) / 2;
    const bob = Math.sin(t * 0.9) * 3 * dpr;
    ctx.save();
    ctx.strokeStyle = "rgba(255,212,0,0.35)";
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(x + dw * 0.12, 0); ctx.lineTo(x + dw * 0.12, y + bob + 4);
    ctx.moveTo(x + dw * 0.88, 0); ctx.lineTo(x + dw * 0.88, y + bob + 4);
    ctx.stroke();
    const glow = 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(t * 2)) + pulse * 0.5;
    ctx.globalAlpha = glow;
    const g = ctx.createRadialGradient(W / 2, y + dh * 0.55 + bob, 10 * dpr, W / 2, y + dh * 0.55 + bob, dw * 0.62);
    g.addColorStop(0, "rgba(255,212,0,0.45)");
    g.addColorStop(1, "rgba(255,212,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - 40 * dpr, y + bob - 20 * dpr, dw + 80 * dpr, dh + 50 * dpr);
    ctx.globalAlpha = 1;
    if (logoReady) ctx.drawImage(logoSprite || logo, x, y + bob, dw, dh);
    ctx.restore();
    return { x: W / 2, y: y + dh + bob + 6 * dpr };
  }

  function drawSprite(img, x, y, scale, rot) {
    const dw = img.width * scale, dh = img.height * scale;
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }

  function drawWalkby() {
    if (!walkby || !logoReady) return;
    const img = logoSprite || logo;
    const ratio = (img.naturalHeight || img.height) / (img.naturalWidth || img.width) || 0.356;
    const dw = walkby.w, dh = dw * ratio;
    const bob = Math.sin(time * 5) * 4 * dpr;
    ctx.save();
    ctx.globalAlpha = 0.35;
    const g = ctx.createRadialGradient(walkby.x, walkby.y + bob, 8 * dpr, walkby.x, walkby.y + bob, dw * 0.6);
    g.addColorStop(0, "rgba(255,212,0,0.55)");
    g.addColorStop(1, "rgba(255,212,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(walkby.x - dw, walkby.y - dh, dw * 2, dh * 2);
    ctx.globalAlpha = 1;
    ctx.drawImage(img, walkby.x - dw / 2, walkby.y - dh / 2 + bob, dw, dh);
    ctx.restore();
  }

  function drawEntities(t, shift) {
    for (let i = 0; i < crumbs.length; i++) {
      const c = crumbs[i];
      const sc = (c.r / (4 * dpr)) * (0.7 + 0.3 * Math.min(1, c.life / 4));
      ctx.globalAlpha = Math.min(1, c.life / 2);
      drawSprite(sprites.crumb, c.x, c.y, sc * (0.45 * dpr), c.rot);
    }
    ctx.globalAlpha = 1;

    const L = layout();
    for (let i = 0; i < trucks.length; i++) {
      const tr = trucks[i];
      const img = tr.dir >= 0 ? sprites.truckR : sprites.truckL;
      drawSprite(img, tr.x, tr.y, tr.scale * (0.55 * dpr / 1), 0);
      ctx.save();
      ctx.globalAlpha = tr.state === "charge" ? 0.2 : 0.12;
      ctx.fillStyle = YELLOW;
      const dir = tr.dir;
      ctx.beginPath();
      ctx.moveTo(tr.x + dir * 40 * dpr * tr.scale, tr.y - 4 * dpr);
      ctx.lineTo(tr.x + dir * 130 * dpr * tr.scale, tr.y - 16 * dpr);
      ctx.lineTo(tr.x + dir * 130 * dpr * tr.scale, tr.y + 16 * dpr);
      ctx.closePath();
      ctx.fill();
      if (tr.state === "charge") {
        ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 8);
        ctx.strokeStyle = YELLOW;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, 28 * dpr, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    const folks = toasts.concat(skulls);
    folks.sort(function (a, b) { return a.y - b.y; });
    for (let i = 0; i < folks.length; i++) {
      const e = folks[i];
      const sc = e.scale * (0.55 * dpr);
      if (e.kind === "toast") {
        const dance = e.state === "dance" ? Math.sin(radioPhase + i) * 6 * dpr : 0;
        const nap = e.state === "nap";
        const wob = nap ? 0 : Math.sin(e.age * 8) * 0.08 * (Math.hypot(e.vx, e.vy) > 8 ? 1 : 0.2);
        ctx.save();
        if (e.golden) {
          ctx.shadowColor = "#FFE566";
          ctx.shadowBlur = 16 * dpr;
          ctx.globalAlpha = 0.95 + 0.05 * Math.sin(t * 6);
        }
        if (nap) {
          ctx.translate(e.x, e.y);
          ctx.rotate(0.6);
          ctx.scale(1, 0.72);
          ctx.drawImage(sprites.toast, -(sprites.toast.width * sc) / 2, -(sprites.toast.height * sc) / 2, sprites.toast.width * sc, sprites.toast.height * sc);
        } else {
          drawSprite(sprites.toast, e.x, e.y + dance, sc, e.rot + wob + (e.state === "dance" ? Math.sin(radioPhase) * 0.2 : 0));
        }
        ctx.restore();
        if (nap) {
          ctx.fillStyle = YELLOW;
          ctx.globalAlpha = 0.8;
          ctx.font = "700 " + (10 * dpr) + "px ui-monospace, monospace";
          ctx.fillText("z", e.x + 12 * dpr, e.y - 14 * dpr - Math.sin(t * 3) * 2 * dpr);
          ctx.globalAlpha = 1;
        }
        if (e.spook > 0) {
          ctx.globalAlpha = e.spook * 0.5;
          ctx.strokeStyle = YELLOW; ctx.lineWidth = 1 * dpr;
          ctx.beginPath(); ctx.arc(e.x, e.y, 20 * e.scale * dpr, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      } else {
        const by = e.y + Math.sin(e.bob) * 5 * dpr;
        if (shift.id === "night") {
          ctx.save();
          ctx.globalAlpha = 0.16;
          ctx.fillStyle = YELLOW;
          const ang = e.lamp;
          ctx.beginPath();
          ctx.moveTo(e.x, by);
          ctx.arc(e.x, by, 70 * dpr, ang - 0.35, ang + 0.35);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        if (e.glitch > 0 || weather.kind === "storm") {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = 0.5;
          drawSprite(sprites.skull, e.x - 3 * dpr, by, sc, 0);
          ctx.globalAlpha = 0.4;
          drawSprite(sprites.skull, e.x + 3 * dpr, by, sc, 0);
          ctx.restore();
          ctx.globalAlpha = 0.85;
          drawSprite(sprites.skull, e.x, by, sc, Math.sin(e.bob) * 0.08);
          ctx.globalAlpha = 1;
        } else {
          drawSprite(sprites.skull, e.x, by, sc, Math.sin(e.bob) * 0.08);
        }
      }
    }
    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i];
      ctx.globalAlpha = 1 - s.age / s.life;
      ctx.fillStyle = s.col;
      ctx.fillRect(s.x, s.y, 2 * dpr, 2 * dpr);
    }
    ctx.globalAlpha = 1;
  }

  function drawScanlines() {
    if (isMobile) return;
    ctx.save();
    ctx.globalAlpha = weather.kind === "storm" ? 0.12 : 0.05;
    ctx.fillStyle = "#000";
    for (let y = 0; y < H; y += 3 * dpr) ctx.fillRect(0, y, W, dpr);
    if (weather.kind === "storm") {
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#ff2bd6";
      ctx.fillRect(2 * dpr, 0, W, H);
      ctx.fillStyle = "#00e8ff";
      ctx.fillRect(-2 * dpr, 0, W, H);
    }
    ctx.restore();
  }

  let hudAcc = 0;
  function updateHud(dt, shift, parts) {
    hudAcc += dt;
    if (hudAcc < 0.2) return;
    hudAcc = 0;
    elClock.textContent = parts.weekday.toUpperCase() + "  " + parts.hour + ":" + parts.minute + ":" + parts.second + "  NY";
    elShift.textContent = shift.name + (weather.kind === "storm" ? " · STORM" : weather.kind === "snow" ? " · CRUMB SNOW" : "");
    elCensus.textContent = isMobile
      ? toasts.length + " TOAST  ·  " + skulls.length + " SKULLZ  ·  " + trucks.length + " TRUCKS  ·  " + crumbs.length + " CRUMBS"
      : toasts.length + " TOAST  ·  " + skulls.length + " SKULLZ  ·  " + trucks.length + " CYBERTRUCKS  ·  " + crumbs.length + " CRUMBS";
  }

  function render(now) {
    if (hidden) { running = false; return; }
    running = true;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    time += dt;
    if (radioOn) radioPhase += dt * 8;

    const parts = nyParts();
    const hour = parseInt(parts.hour, 10) || 0;
    const shift = currentShift(hour, forcedShift);
    logoPulse = Math.max(0, logoPulse - dt * 0.8);

    if (!floorCanvas || floorW !== W || floorH !== H) paintFloor();

    if (!reduced && Math.random() < dt * 0.35 * shift.crumbRate) {
      dropCrumb(W / 2 + rand(-80, 80) * dpr, horizonY() - 8 * dpr, rand(8, 50) * dpr);
    }

    if (pointerDown && !downPlace && now - lastSprinkle > 90) {
      lastSprinkle = now;
      sprinkleAt(pointerX, pointerY, 3);
    }

    updateEvents(dt, shift);
    updateCrumbs(dt);
    updateCreatures(dt, shift);

    const L = layout();
    drawSky(shift, time);
    ctx.drawImage(floorCanvas, 0, 0);
    drawRoadDashes(time);
    drawCabinetFlicker(time, L);
    // live merch/arcade outlines when hovered are drawn on top of the static floor
    if (hoverPlace) {
      if (hoverPlace.id === "merch") drawStall(ctx, L.merch);
      if (hoverPlace.id === "art" || hoverPlace.id === "cade" || hoverPlace.id === "skullz") drawArcadeRow(ctx, L);
    }
    drawRadioTower(ctx, L.radio, true, time);
    const sign = drawLogoSign(time, logoPulse);
    if (logoPulse > 0.05) {
      ctx.save();
      ctx.globalAlpha = logoPulse * 0.5;
      ctx.strokeStyle = YELLOW; ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.ellipse(sign.x, sign.y + 20 * dpr, 90 * dpr, 22 * dpr, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    drawEntities(time, shift);
    drawWalkby();
    drawHover(L);
    drawScanlines();
    updateHud(dt, shift, parts);
    requestAnimationFrame(render);
  }

  function startLoop() {
    if (running || hidden) return;
    last = performance.now();
    running = true;
    requestAnimationFrame(render);
  }

  function eventPos(e) {
    const r = canvas.getBoundingClientRect();
    const src = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x: (src.clientX - r.left) * dpr, y: (src.clientY - r.top) * dpr };
  }

  function onDown(e) {
    e.preventDefault();
    const p = eventPos(e);
    pointerDown = true; dragged = false;
    pointerX = downX = p.x; pointerY = downY = p.y;
    downPlace = placeAt(p.x, p.y);
    hoverPlace = downPlace;
    if (!downPlace) sprinkleAt(p.x, p.y);
  }
  function onMove(e) {
    const p = eventPos(e);
    pointerX = p.x; pointerY = p.y;
    if (!pointerDown) hoverPlace = placeAt(p.x, p.y);
    else if (Math.hypot(p.x - downX, p.y - downY) > 12 * dpr) dragged = true;
  }
  function onUp(e) {
    if (!pointerDown) return;
    pointerDown = false;
    if (downPlace && !dragged) openPlace(downPlace.href);
    downPlace = null;
    if (e && e.changedTouches) hoverPlace = null;
    else hoverPlace = placeAt(pointerX, pointerY);
  }

  canvas.addEventListener("mousedown", onDown);
  canvas.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("touchstart", onDown, { passive: false });
  canvas.addEventListener("touchmove", function (e) { if (pointerDown) e.preventDefault(); onMove(e); }, { passive: false });
  canvas.addEventListener("touchend", onUp);
  canvas.addEventListener("touchcancel", onUp);
  canvas.addEventListener("mouseleave", function () { if (!pointerDown) hoverPlace = null; });

  document.addEventListener("visibilitychange", function () {
    hidden = document.hidden;
    if (hidden) {
      running = false;
      if (audio && radioOn && !audio.paused) audio.pause();
    } else {
      if (radioOn && audio) audio.play().catch(function () {});
      startLoop();
    }
  });
  window.addEventListener("resize", function () {
    resize();
    const gmin = groundMin(), gmax = groundMax();
    function fix(e) { e.x = clamp(e.x, 20, W - 20); e.y = clamp(e.y, gmin, gmax); }
    toasts.forEach(fix); skulls.forEach(fix);
    trucks.forEach(function (tr) { tr.y = roadY(); });
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function cleanPost(p) {
    const text = String((p && (p.text || p.full_text)) || "").replace(/https:\/\/t\.co\/\S+/g, "").replace(/\s+/g, " ").trim();
    return { id: String((p && (p.id || p.id_str)) || ""), created_at: (p && p.created_at) || "", text: text };
  }
  function normalizeFeed(j) {
    const posts = ((j && j.posts) || []).map(cleanPost).filter(function (p) { return p.text; });
    posts.sort(function (a, b) { return (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0); });
    return {
      source: "Twitter",
      handle: "@" + (((j && j.user && j.user.username) || (j && j.handle) || "TherapyToaster").replace(/^@/, "")),
      posts: posts
    };
  }
  function refreshTicker() {
    const posts = feed.posts || [];
    const handle = feed.handle || "@TherapyToaster";
    if (!posts.length) { elTrack.textContent = "Twitter · " + handle + " · feed warming up…"; return; }
    const bits = [];
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < posts.length; i++) bits.push("<b>Twitter</b> " + handle + "  —  " + escapeHtml(posts[i].text));
    }
    elTrack.innerHTML = bits.join("<span class='dot'>●</span>");
  }
  function applyFeed(j, src) {
    const next = normalizeFeed(j);
    if (!next.posts.length) return false;
    const newest = next.posts[0].id;
    const isNew = lastPostId && newest && newest !== lastPostId;
    feed = next;
    feedSource = src;
    refreshTicker();
    if (isNew) {
      broadcast();
      logEvent("New post on Twitter");
    }
    lastPostId = newest;
    return true;
  }
  function fetchJson(url) {
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 5000) : null;
    return fetch(url, { cache: "no-store", signal: ctrl ? ctrl.signal : undefined }).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error("bad");
      return r.json();
    }).catch(function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }
  function loadFeed() {
    if (window.TT_TOWN_FEED && window.TT_TOWN_FEED.posts) {
      applyFeed(window.TT_TOWN_FEED, "hook");
      return Promise.resolve();
    }
    const urls = FEED_PUBLIC.concat([FEED_LOCAL]);
    let chain = Promise.reject();
    urls.forEach(function (u) {
      chain = chain.catch(function () { return fetchJson(u).then(function (j) { if (!applyFeed(j, u)) throw new Error("empty"); }); });
    });
    return chain.catch(function () {
      applyFeed({ handle: "@TherapyToaster", posts: [
        { id: "0", text: "Anyone else use @manifoldxyz?" }
      ] }, "builtin");
    });
  }
  function pollFeed() { loadFeed(); }

  function loadTracks() {
    tracks = FALLBACK_TRACKS.slice();
    return fetch(TRACKS_SRC, { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (j && j.tracks && j.tracks.length) tracks = j.tracks;
    }).catch(function () {});
  }
  function currentTrack() { return tracks[trackIndex] || FALLBACK_TRACKS[0]; }
  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = "none";
    audio.crossOrigin = "anonymous";
    audio.addEventListener("ended", function () {
      trackIndex = (trackIndex + 1) % tracks.length;
      playTrack(true);
    });
    audio.addEventListener("error", function () {
      logEvent("Radio skipped a track");
      trackIndex = (trackIndex + 1) % tracks.length;
      playTrack(true);
    });
    return audio;
  }
  function playTrack(auto) {
    const t = currentTrack();
    if (!t) return;
    const a = ensureAudio();
    a.src = t.audio;
    a.play().then(function () {
      radioOn = true;
      elRadio.classList.add("on");
      elRadio.setAttribute("aria-pressed", "true");
      elRadio.textContent = "⏸ Radio";
      if (elNow) elNow.textContent = t.title + " · " + (t.by || "TherapyToaster");
      if (!auto) logEvent("Toaster Radio: " + t.title);
    }).catch(function () {
      radioOn = false;
      logEvent("Tap Radio again to play");
    });
  }
  function toggleRadio() {
    if (radioOn && audio && !audio.paused) {
      audio.pause();
      radioOn = false;
      elRadio.classList.remove("on");
      elRadio.setAttribute("aria-pressed", "false");
      elRadio.textContent = "▶ Radio";
      if (elNow) elNow.textContent = "";
      return;
    }
    if (!tracks.length) tracks = FALLBACK_TRACKS.slice();
    playTrack(false);
  }
  if (elRadio) elRadio.addEventListener("click", function (e) { e.stopPropagation(); toggleRadio(); });

  function loadVisits() {
    try {
      const s = JSON.parse(localStorage.getItem("ttdgStreak") || "null");
      if (s && typeof s.visits === "number" && s.visits > 0) siteVisits = s.visits;
    } catch (e) {}
    try {
      const n = parseInt(localStorage.getItem("tt-town-visits") || "0", 10) || 0;
      visits = n + 1;
      localStorage.setItem("tt-town-visits", String(visits));
    } catch (e) { visits = 1; }
    if (siteVisits) elVisits.textContent = "Visits " + siteVisits;
    else elVisits.textContent = "Visit " + visits;
  }

  bakeAll();
  resize();
  loadVisits();
  populate();
  loadTracks();
  loadFeed().then(function () { /* ticker ready */ });
  setInterval(pollFeed, 60000);
  window.addEventListener("load", startLoop);
  startLoop();

  window.ToasterTown = {
    sprinkleAt: function (x, y) { sprinkleAt(x * dpr, y * dpr); },
    broadcast: function (text) {
      if (text) {
        feed.posts = [{ id: String(Date.now()), text: text }].concat(feed.posts || []);
        lastPostId = feed.posts[0].id;
        refreshTicker();
      }
      broadcast();
      logEvent("New post on Twitter");
    },
    trigger: function (name) {
      if (name === "snow" || name === "storm") startWeather(name);
      else if (name === "walkby") startWalkby();
      else if (name === "golden") spawnGolden();
      else if (name === "broadcast") broadcast();
    },
    play: toggleRadio,
    pause: function () { hidden = true; running = false; if (audio) audio.pause(); },
    resume: function () { hidden = false; startLoop(); }
  };
})();
