// World 10: THERAPYTOASTER TO MARS — original procedural pixel art for the final world (lore: lore/originals.md).
// A gulf-coast launch pad at dusk, a gray cratered Moon with a little base, the inside of a stainless ship stack,
// a rust-red Mars with an ice cap, and the Mars castle where YELLOW BLANKEY / CYBER_BOY waits.
// Generic hardware only: no agency or rocket-company names or logos, no real brands. Parody look, no gore, no wallets.
// Jam stays grape purple.
'use strict';

const M10 = {
  BG: '#07080c', BG2: '#12141a', BG3: '#1a1d26', IVORY: '#ece8e1', GRAY: '#8b909c', STEEL: '#2a2e38', SILVER: '#d7dbe3',
  GOLD: '#d7c36a', CHROME: '#c5c6cc', MOON: '#9a9ca2', MOON2: '#5a5c62', MOON3: '#c5c6cc',
  RUST: '#a85a36', RUST2: '#7a3a22', RUST3: '#d88a5a', DUST: '#e8a070', ICE: '#f0f4fa',
  SEA: '#2a5a7a', SEA2: '#3a7a9a', DUSK: '#e8a26a', DUSK2: '#2a3a5a', LEAF: '#3a7a4a',
  FLAME: '#ffb030', FLAME2: '#ff6a20', BLUE: '#6ac8ff', YEL: '#ffd21a', YEL2: '#e8b830', YEL3: '#fff08a',
  CYAN: '#00e5ff', CYAN2: '#0a8aa0', HOOD: '#1a1a22', HOOD2: '#2a2a36', RED: '#ff3a3a', JAM: '#b54e8c'
};

const MARS_DECOR = new Set(['tower10', 'rocket10', 'sign10', 'flag10', 'dish10', 'hab10', 'crater10', 'console10', 'window10', 'pad10', 'banner10', 'torch10', 'acid10', 'fuelTank10', 'lights10', 'icecap10']);

let MARS_SPR = null;
function buildMarsSprites(){
  const out = {};
  // SECURITY DRONE: little quad-rotor puck with one red eye (2 frames: rotor blur)
  out.drone10 = [0, 1].map(f => mkCanvas(14, 10, x => {
    x.fillStyle = M10.STEEL; x.fillRect(2, 4, 10, 5); x.fillStyle = M10.CHROME; x.fillRect(3, 4, 8, 2);
    x.fillStyle = M10.RED; x.fillRect(6, 6, 2, 2); x.fillStyle = '#ffffff'; x.fillRect(6, 6, 1, 1);
    x.fillStyle = M10.GRAY; x.fillRect(0, 2, 1, 3); x.fillRect(13, 2, 1, 3);
    x.fillStyle = f ? M10.SILVER : M10.GRAY; x.fillRect(f ? 0 : 1, 1, f ? 5 : 3, 1); x.fillRect(f ? 9 : 10, 1, f ? 5 : 3, 1);
  }));
  // CRATER CRAWLER: six-legged gray rover bug with a dish head (2 walk frames)
  out.crawl10 = [0, 1].map(f => mkCanvas(14, 10, x => {
    x.fillStyle = M10.MOON2; x.fillRect(2, 3, 10, 4); x.fillStyle = M10.MOON3; x.fillRect(3, 3, 8, 1);
    x.fillStyle = M10.GOLD; x.fillRect(1, 1, 3, 3); x.fillStyle = M10.BG; x.fillRect(2, 2, 1, 1);
    x.fillStyle = M10.STEEL; for (let i = 0; i < 3; i++){ x.fillRect(3 + i * 3 + (f ? 1 : 0), 7, 1, 3); }
    x.fillStyle = M10.CYAN; x.fillRect(10, 4, 1, 1);
  }));
  out.crawl10sq = mkCanvas(14, 6, x => { x.fillStyle = M10.MOON2; x.fillRect(1, 2, 12, 4); x.fillStyle = M10.STEEL; x.fillRect(0, 5, 14, 1); });
  // FUEL CAN: stainless jerry can with a gold band
  out.fuel = mkCanvas(10, 12, x => {
    x.fillStyle = M10.STEEL; x.fillRect(0, 2, 10, 10); x.fillStyle = M10.CHROME; x.fillRect(1, 3, 8, 8);
    x.fillStyle = M10.GOLD; x.fillRect(1, 6, 8, 2); x.fillStyle = M10.STEEL; x.fillRect(6, 0, 3, 2); x.fillRect(1, 0, 4, 1);
    x.fillStyle = '#ffffff'; x.fillRect(2, 4, 1, 1);
  });
  // falling hazards for the boss: a yellow pillow, a cyan data brick
  out.pillow = mkCanvas(12, 10, x => {
    x.fillStyle = M10.YEL2; x.fillRect(0, 1, 12, 8); x.fillStyle = M10.YEL; x.fillRect(1, 2, 10, 6); x.fillStyle = M10.YEL3; x.fillRect(2, 2, 5, 2);
    x.fillStyle = M10.YEL2; x.fillRect(0, 0, 2, 2); x.fillRect(10, 0, 2, 2); x.fillRect(0, 8, 2, 2); x.fillRect(10, 8, 2, 2);
  });
  out.databrick = mkCanvas(10, 10, x => {
    x.fillStyle = M10.CYAN2; x.fillRect(0, 0, 10, 10); x.fillStyle = M10.CYAN; x.fillRect(1, 1, 8, 8);
    x.fillStyle = M10.BG; x.fillRect(2, 3, 2, 1); x.fillRect(6, 3, 1, 1); x.fillRect(3, 6, 1, 1); x.fillRect(5, 6, 3, 1);
  });
  MARS_SPR = out;
  return out;
}
function marsSpr(){ return MARS_SPR || (typeof S !== 'undefined' && S.mars) || null; }

// a small stainless capsule (docking / landing). The bro rides in the window.
function drawCapsule(g, X, Y, o){
  o = o || {};
  if (o.flameUp){ const h = 4 + ((o.frame >> 1) % 3) * 2; g.fillStyle = M10.FLAME2; g.fillRect(X + 4, Y + 18, 6, h); g.fillStyle = M10.FLAME; g.fillRect(X + 5, Y + 18, 4, h - 2); g.fillStyle = '#ffffff'; g.fillRect(X + 6, Y + 18, 2, 2); }
  if (o.flameL){ g.fillStyle = M10.BLUE; g.fillRect(X + 15, Y + 9, 3 + (o.frame & 1), 2); }
  if (o.flameR){ g.fillStyle = M10.BLUE; g.fillRect(X - 4 - (o.frame & 1), Y + 9, 3 + (o.frame & 1), 2); }
  if (o.flameD){ g.fillStyle = M10.BLUE; g.fillRect(X + 6, Y - 4 - (o.frame & 1), 2, 3); }
  g.fillStyle = M10.STEEL; g.fillRect(X + 3, Y, 8, 2); g.fillRect(X + 1, Y + 2, 12, 14); g.fillRect(X, Y + 14, 14, 4);
  g.fillStyle = M10.CHROME; g.fillRect(X + 4, Y + 1, 6, 1); g.fillRect(X + 2, Y + 3, 10, 12); g.fillStyle = M10.SILVER; g.fillRect(X + 2, Y + 3, 2, 12);
  g.fillStyle = M10.BG3; g.fillRect(X + 4, Y + 5, 6, 6); g.fillStyle = M10.BLUE; g.fillRect(X + 4, Y + 5, 2, 1);
  if (o.bro){ g.save(); g.beginPath(); g.rect(X + 4, Y + 5, 6, 6); g.clip(); g.drawImage(o.bro, X + 7 - o.bro.width / 2, Y + 4); g.restore(); }
  g.fillStyle = M10.GOLD; g.fillRect(X + 1, Y + 13, 12, 1);
  g.fillStyle = M10.GRAY; g.fillRect(X, Y + 18, 2, 2); g.fillRect(X + 12, Y + 18, 2, 2); // legs
}

// YELLOW BLANKEY / CYBER_BOY (the final boss, original design): a hooded figure wrapped in a huge yellow blanket
// (phase 1), a slim cyber kid in a black hoodie with a cyan visor on jet boots (phase 2), and both at once:
// the blanket worn as a cape over the cyber suit (phase 3). 28 x 36.
function drawBlankey(g, X, Y, frame, o){
  o = o || {};
  const form = o.form || 'blankey', bob = Math.round(Math.sin(frame * 0.08) * 2);
  Y += bob;
  if (o.hover && form !== 'blankey'){ const h = 3 + ((frame >> 1) % 3); g.fillStyle = M10.CYAN; g.fillRect(X + 8, Y + 36, 4, h); g.fillRect(X + 16, Y + 36, 4, h); g.fillStyle = '#ffffff'; g.fillRect(X + 9, Y + 36, 2, 1); g.fillRect(X + 17, Y + 36, 2, 1); }
  if (form === 'blankey'){
    // a big lumpy blanket bundle with a hood, two glowing eyes, little feet
    g.fillStyle = M10.YEL2; g.beginPath(); g.moveTo(X + 14, Y); g.quadraticCurveTo(X + 30, Y + 6, X + 28, Y + 34); g.lineTo(X, Y + 34); g.quadraticCurveTo(X - 2, Y + 6, X + 14, Y); g.fill();
    g.fillStyle = M10.YEL; g.beginPath(); g.moveTo(X + 14, Y + 2); g.quadraticCurveTo(X + 27, Y + 8, X + 25, Y + 32); g.lineTo(X + 3, Y + 32); g.quadraticCurveTo(X + 1, Y + 8, X + 14, Y + 2); g.fill();
    g.fillStyle = M10.YEL3; g.fillRect(X + 6, Y + 6, 4, 10); g.fillRect(X + 8, Y + 20, 10, 2);
    g.fillStyle = M10.YEL2; for (let i = 0; i < 5; i++) g.fillRect(X + 3 + i * 5, Y + 31 + (i % 2), 4, 3); // fringe
    g.fillStyle = M10.HOOD; g.beginPath(); g.ellipse(X + 14, Y + 11, 7, 5, 0, 0, Math.PI * 2); g.fill();
    const sleepy = o.open; g.fillStyle = o.tell ? M10.RED : M10.CYAN;
    if (sleepy){ g.fillRect(X + 10, Y + 11, 3, 1); g.fillRect(X + 15, Y + 11, 3, 1); }
    else { g.fillRect(X + 10, Y + 9, 3, 3); g.fillRect(X + 15, Y + 9, 3, 3); g.fillStyle = '#ffffff'; g.fillRect(X + 10, Y + 9, 1, 1); g.fillRect(X + 15, Y + 9, 1, 1); }
    g.fillStyle = M10.HOOD2; g.fillRect(X + 8, Y + 34, 4, 2); g.fillRect(X + 16, Y + 34, 4, 2);
    if (sleepy){ drawText(g, 'Z', X + 26, Y - 6 - ((frame >> 3) % 4), M10.IVORY); }
    return;
  }
  // cyber body (phase 2 and 3)
  if (form === 'final'){ // the blanket worn as a cape, flapping behind
    const fl = Math.round(Math.sin(frame * 0.2) * 3);
    g.fillStyle = M10.YEL2; g.beginPath(); g.moveTo(X + 6, Y + 8); g.lineTo(X + 24, Y + 8); g.lineTo(X + 30 + fl, Y + 34); g.lineTo(X - 2 - fl, Y + 34); g.closePath(); g.fill();
    g.fillStyle = M10.YEL; g.beginPath(); g.moveTo(X + 8, Y + 9); g.lineTo(X + 22, Y + 9); g.lineTo(X + 27 + fl, Y + 32); g.lineTo(X + 1 - fl, Y + 32); g.closePath(); g.fill();
  }
  g.fillStyle = M10.HOOD; g.fillRect(X + 8, Y + 10, 12, 16); g.fillStyle = M10.HOOD2; g.fillRect(X + 9, Y + 11, 10, 14);
  g.fillStyle = M10.CYAN2; g.fillRect(X + 10, Y + 14, 1, 8); g.fillRect(X + 10, Y + 21, 5, 1); g.fillRect(X + 17, Y + 13, 1, 6); // circuit lines
  g.fillStyle = M10.HOOD; g.fillRect(X + 5, Y + 12, 3, 10); g.fillRect(X + 20, Y + 12, 3, 10); // arms
  g.fillStyle = M10.CYAN; g.fillRect(X + 5, Y + 21, 3, 2); g.fillRect(X + 20, Y + 21, 3, 2); // glove lights
  g.fillStyle = M10.HOOD; g.fillRect(X + 9, Y + 26, 4, 8); g.fillRect(X + 15, Y + 26, 4, 8); // legs
  g.fillStyle = M10.STEEL; g.fillRect(X + 8, Y + 32, 5, 4); g.fillRect(X + 15, Y + 32, 5, 4); // jet boots
  // hooded head with a wraparound visor; the visor charges brighter before a laser
  g.fillStyle = M10.HOOD; g.fillRect(X + 8, Y, 12, 11); g.fillRect(X + 7, Y + 2, 14, 8); g.fillStyle = '#e2a77c'; g.fillRect(X + 10, Y + 4, 8, 6);
  const ch = Math.max(0, Math.min(1, o.charge || 0));
  g.fillStyle = ch > 0 ? (((frame >> 1) % 2) ? M10.RED : '#ffffff') : M10.CYAN; g.fillRect(X + 8, Y + 4, 12, 3);
  if (ch > 0){ g.globalAlpha = 0.25 + ch * 0.5; g.fillStyle = M10.RED; g.fillRect(X + 4, Y + 2, 20, 7); g.globalAlpha = 1; }
  g.fillStyle = '#ffffff'; g.fillRect(X + 9, Y + 4, 2, 1);
  if (o.open){ g.fillStyle = M10.YEL3; drawTiny(g, 'REBOOT', X - 2, Y - 8, M10.CYAN); }
}

function marsLayers(kind, L, tileableLayer){
  const grad = (a, b, h) => tileableLayer((x, r) => { const grd = x.createLinearGradient(0, 0, 0, h || 200); grd.addColorStop(0, a); grd.addColorStop(1, b); x.fillStyle = grd; x.fillRect(0, 0, 512, 240); });
  const stars = (n, a, b) => tileableLayer((x, r) => { x.fillStyle = a; x.fillRect(0, 0, 512, 240); for (let i = 0; i < n; i++){ x.fillStyle = r() < 0.7 ? '#ece8e1' : (b || '#d7c36a'); x.fillRect((r() * 512) | 0, (r() * 200) | 0, 1, 1); } });
  // gulf coast launch pad at dusk: water, palm silhouettes, a far tower
  const gulf = () => tileableLayer((x, r) => {
    x.fillStyle = M10.SEA; x.fillRect(0, 150, 512, 60); x.fillStyle = M10.SEA2; for (let i = 0; i < 40; i++) x.fillRect((r() * 512) | 0, 152 + ((r() * 50) | 0), 8, 1);
    x.fillStyle = '#1a2a3a'; for (let i = 0; i < 512; i += 96){ x.fillRect(i + 20, 112, 3, 40); x.beginPath(); x.ellipse(i + 21, 112, 10, 3, -0.4, 0, Math.PI * 2); x.ellipse(i + 21, 112, 10, 3, 0.4, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = '#3a3e48'; x.fillRect(300, 60, 10, 92); for (let y = 62; y < 150; y += 8){ x.fillRect(296, y, 18, 1); }
    x.fillStyle = M10.CHROME; x.fillRect(318, 70, 10, 82); x.beginPath(); x.moveTo(318, 70); x.lineTo(323, 58); x.lineTo(328, 70); x.fill();
  });
  const fence = () => tileableLayer(x => { x.fillStyle = 'rgba(18,20,26,0.6)'; for (let i = 0; i < 512; i += 8){ x.fillRect(i, 178, 1, 30); } x.fillRect(0, 178, 512, 1); x.fillRect(0, 192, 512, 1); });
  // the Moon: black sky, a blue Earth, gray crater hills, base domes
  const earth = () => tileableLayer((x, r) => {
    x.fillStyle = '#2a5a9a'; x.beginPath(); x.arc(120, 52, 22, 0, Math.PI * 2); x.fill();
    x.fillStyle = M10.LEAF; x.beginPath(); x.ellipse(112, 46, 8, 5, 0.5, 0, Math.PI * 2); x.ellipse(128, 60, 6, 4, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.6)'; x.fillRect(104, 40, 14, 2); x.fillRect(118, 66, 10, 2);
    x.fillStyle = 'rgba(0,0,0,0.45)'; x.beginPath(); x.arc(128, 52, 22, -Math.PI / 2, Math.PI / 2); x.fill();
  });
  const moonHills = (hc, cc, rc) => tileableLayer((x, r) => {
    x.fillStyle = hc || M10.MOON2; x.beginPath(); x.moveTo(0, 200); for (let i = 0; i <= 512; i += 32) x.lineTo(i, 150 + Math.sin(i * 0.03) * 14 + ((r() * 8) | 0)); x.lineTo(512, 240); x.lineTo(0, 240); x.fill();
    for (let i = 0; i < 14; i++){ const cx = (r() * 512) | 0, cy = 170 + ((r() * 30) | 0), rr = 4 + ((r() * 10) | 0); x.fillStyle = cc || '#4a4c52'; x.beginPath(); x.ellipse(cx, cy, rr, rr * 0.35, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = rc || '#7a7c82'; x.fillRect(cx - rr, cy - 1, rr * 2, 1); }
  });
  const domes = () => tileableLayer((x, r) => {
    for (let i = 0; i < 512; i += 160){ x.fillStyle = M10.CHROME; x.beginPath(); x.arc(i + 60, 196, 22, Math.PI, 0); x.fill(); x.fillStyle = M10.SILVER; x.fillRect(i + 44, 182, 8, 2);
      x.fillStyle = M10.GOLD; x.fillRect(i + 38, 194, 44, 2); x.fillStyle = M10.GRAY; x.fillRect(i + 84, 186, 30, 10); x.fillRect(i + 96, 170, 2, 16); x.fillStyle = M10.RED; x.fillRect(i + 96, 168, 2, 2); }
  });
  // inside the ship: ribbed stainless walls, portholes full of stars
  const shipWall = () => tileableLayer((x, r) => {
    x.fillStyle = '#3a3e48'; x.fillRect(0, 30, 512, 180);
    for (let i = 0; i < 512; i += 16){ x.fillStyle = (i / 16) % 2 ? '#4a4e5a' : '#424652'; x.fillRect(i, 30, 15, 180); x.fillStyle = '#2a2e38'; x.fillRect(i + 15, 30, 1, 180); }
    for (let i = 24; i < 512; i += 128){ x.fillStyle = M10.STEEL; x.beginPath(); x.arc(i + 32, 90, 18, 0, Math.PI * 2); x.fill(); x.fillStyle = M10.BG; x.beginPath(); x.arc(i + 32, 90, 14, 0, Math.PI * 2); x.fill();
      for (let k = 0; k < 10; k++){ x.fillStyle = '#ece8e1'; x.fillRect(i + 22 + ((r() * 20) | 0), 80 + ((r() * 20) | 0), 1, 1); } }
    x.fillStyle = M10.GOLD; x.fillRect(0, 150, 512, 2); x.fillStyle = '#2a2e38'; x.fillRect(0, 40, 512, 4); x.fillRect(0, 160, 512, 3);
  });
  // orbit (docking): stars and a big blue curve at the bottom
  const orbitEarth = () => tileableLayer((x, r) => {
    x.fillStyle = '#1a4a8a'; x.beginPath(); x.ellipse(256, 420, 420, 220, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(106,200,255,0.35)'; x.beginPath(); x.ellipse(256, 420, 424, 224, 0, Math.PI, 0); x.lineTo(680, 420); x.fill();
    x.fillStyle = M10.LEAF; x.beginPath(); x.ellipse(120, 214, 40, 8, 0.1, 0, Math.PI * 2); x.ellipse(380, 222, 50, 10, -0.1, 0, Math.PI * 2); x.fill();
    x.fillStyle = M10.MOON; x.beginPath(); x.arc(440, 40, 9, 0, Math.PI * 2); x.fill();
  });
  // Mars: rust sky, the ice cap, dunes, a little base far off
  const marsSky = (a, b) => grad(a, b, 200);
  const marsCap = () => tileableLayer((x, r) => {
    x.fillStyle = M10.RUST2; x.beginPath(); x.arc(400, 40, 20, 0, Math.PI * 2); x.fill(); x.fillStyle = M10.ICE; x.beginPath(); x.arc(400, 28, 9, Math.PI, 0); x.fill(); x.fillRect(391, 27, 18, 3);
    x.fillStyle = 'rgba(240,244,250,0.6)'; x.fillRect(80, 30, 1, 1); x.fillRect(200, 18, 1, 1); x.fillRect(300, 50, 1, 1);
  });
  const dunes = () => tileableLayer((x, r) => {
    x.fillStyle = M10.RUST2; x.beginPath(); x.moveTo(0, 200); for (let i = 0; i <= 512; i += 16) x.lineTo(i, 160 + Math.sin(i * 0.02) * 16 + Math.sin(i * 0.07) * 4); x.lineTo(512, 240); x.lineTo(0, 240); x.fill();
    x.fillStyle = M10.RUST; x.beginPath(); x.moveTo(0, 210); for (let i = 0; i <= 512; i += 16) x.lineTo(i, 186 + Math.sin(i * 0.03 + 1) * 10); x.lineTo(512, 240); x.lineTo(0, 240); x.fill();
    x.fillStyle = M10.CHROME; x.beginPath(); x.arc(430, 172, 10, Math.PI, 0); x.fill(); x.fillRect(442, 166, 12, 6);
  });
  const castleWall = () => tileableLayer((x, r) => {
    x.fillStyle = '#3a1a12'; x.fillRect(0, 60, 512, 150);
    for (let y = 62; y < 210; y += 10) for (let k = (y / 10) % 2 ? 0 : 10; k < 512; k += 20){ x.fillStyle = '#4a2418'; x.fillRect(k, y, 19, 9); }
    for (let i = 0; i < 512; i += 32){ x.fillStyle = '#3a1a12'; x.fillRect(i, 50, 16, 12); }
    for (let i = 40; i < 512; i += 128){ x.fillStyle = M10.YEL2; x.fillRect(i, 80, 20, 44); x.fillStyle = M10.YEL; x.fillRect(i + 2, 80, 16, 40); x.fillStyle = M10.CYAN; x.fillRect(i + 6, 92, 8, 8); x.fillStyle = M10.BG; x.fillRect(i + 8, 94, 4, 4); }
  });
  const dust = () => tileableLayer((x, r) => { for (let i = 0; i < 60; i++){ x.fillStyle = 'rgba(232,160,112,0.25)'; x.fillRect((r() * 512) | 0, 100 + ((r() * 110) | 0), 2, 1); } });

  if (kind === 'mpad'){ L.far = grad(M10.DUSK2, M10.DUSK, 160); L.clouds = tileableLayer(x => { x.fillStyle = 'rgba(255,200,160,0.25)'; x.fillRect(40, 40, 120, 4); x.fillRect(260, 60, 160, 3); }); L.mid = gulf(); L.near = fence(); }
  else if (kind === 'mmoon'){ L.far = stars(120, M10.BG); L.clouds = earth(); L.mid = moonHills(); L.near = domes(); }
  else if (kind === 'mdark'){ L.far = stars(200, '#020206', '#b54e8c'); L.clouds = tileableLayer(() => {}); L.mid = moonHills('#17181e', '#0a0b10', '#2a2c32'); L.near = tileableLayer(() => {}); } // v1.3 the Dark Side: no Earth in the sky
  else if (kind === 'mship'){ L.far = stars(60, M10.BG); L.clouds = tileableLayer(() => {}); L.mid = shipWall(); L.near = tileableLayer(x => { x.fillStyle = 'rgba(215,195,106,0.08)'; x.fillRect(0, 196, 512, 12); }); }
  else if (kind === 'morbit'){ L.far = stars(160, M10.BG, '#6ac8ff'); L.clouds = tileableLayer(() => {}); L.mid = orbitEarth(); L.near = tileableLayer(() => {}); }
  else if (kind === 'mland'){ L.far = marsSky('#3a1a14', '#c86a3a'); L.clouds = marsCap(); L.mid = dunes(); L.near = dust(); }
  else { /* mcastle */ L.far = marsSky('#1a0a10', '#6a2a1a'); L.clouds = marsCap(); L.mid = castleWall(); L.near = dust(); }
}

function drawMarsDecor(g, d, X, Y, frame){
  switch (d.kind){
    case 'tower10': { // launch / catch tower: a lattice column with two arms
      const h = d.h || 150, top = Y + 16 - h;
      g.fillStyle = M10.STEEL; g.fillRect(X, top, 14, h); g.fillStyle = M10.GRAY;
      for (let y = top; y < Y + 16; y += 8){ g.fillRect(X, y, 14, 1); g.fillRect(X + ((y >> 3) % 2 ? 0 : 7), y, 7, 8); }
      g.fillStyle = M10.STEEL; g.fillRect(X + 1, top, 12, 2); g.fillRect(X + 14, top + 24, 26, 3); g.fillRect(X + 14, top + 34, 26, 3);
      g.fillStyle = M10.RED; if ((frame >> 5) % 2) g.fillRect(X + 6, top - 3, 2, 2);
      break;
    }
    case 'rocket10': { // stainless ship stack on the pad (generic, no markings)
      const h = d.h || 140, top = Y + 16 - h;
      g.fillStyle = M10.GRAY; g.fillRect(X, top + 20, 24, h - 20); g.fillStyle = M10.CHROME; g.fillRect(X + 2, top + 20, 14, h - 20); g.fillStyle = M10.SILVER; g.fillRect(X + 3, top + 20, 3, h - 20);
      g.fillStyle = M10.CHROME; g.beginPath(); g.moveTo(X, top + 20); g.quadraticCurveTo(X + 12, top - 6, X + 24, top + 20); g.fill();
      g.fillStyle = M10.STEEL; g.fillRect(X, top + Math.round(h * 0.55), 24, 2); // stage line
      g.fillStyle = M10.GRAY; g.fillRect(X - 4, Y + 4, 6, 12); g.fillRect(X + 22, Y + 4, 6, 12);
      if (d.steam){ g.globalAlpha = 0.35; g.fillStyle = '#ffffff'; g.fillRect(X - 6 - (frame % 20), Y + 8, 12, 6); g.fillRect(X + 20 + (frame % 20), Y + 8, 12, 6); g.globalAlpha = 1; }
      break;
    }
    case 'sign10': { // ACID's sign
      const t = d.text || 'MOON FIRST.', w = Math.max(48, textWidth(t, 1) + 10);
      g.fillStyle = M10.STEEL; g.fillRect(X + 4, Y - 6, 2, 22); g.fillRect(X + w - 6, Y - 6, 2, 22);
      g.fillStyle = M10.IVORY; g.fillRect(X, Y - 22, w, 16); g.fillStyle = M10.BG; g.fillRect(X + 1, Y - 21, w - 2, 14);
      drawText(g, t, X + 5, Y - 18, M10.GOLD);
      break;
    }
    case 'flag10': { // a toast flag (original): white field, a slice of toast, grape jam corner
      g.fillStyle = M10.GRAY; g.fillRect(X, Y - 20, 1, 36);
      const wv = Math.round(Math.sin(frame * 0.1) * 1);
      g.fillStyle = M10.IVORY; g.fillRect(X + 1, Y - 20 + wv, 16, 10); g.fillStyle = '#e7a15a'; g.fillRect(X + 6, Y - 18 + wv, 6, 6); g.fillStyle = '#a8622a'; g.fillRect(X + 6, Y - 18 + wv, 6, 1);
      g.fillStyle = M10.JAM; g.fillRect(X + 1, Y - 20 + wv, 3, 3);
      break;
    }
    case 'dish10': {
      g.fillStyle = M10.GRAY; g.fillRect(X + 7, Y, 2, 16); g.fillStyle = M10.CHROME; g.beginPath(); g.ellipse(X + 8, Y - 2, 9, 5, -0.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = M10.STEEL; g.fillRect(X + 8, Y - 6, 1, 4); if ((frame >> 4) % 2){ g.fillStyle = M10.RED; g.fillRect(X + 8, Y - 7, 1, 1); }
      break;
    }
    case 'hab10': {
      const w = d.w || 48; g.fillStyle = M10.CHROME; g.beginPath(); g.arc(X + w / 2, Y + 16, w / 2, Math.PI, 0); g.fill();
      g.fillStyle = M10.SILVER; g.fillRect(X + w / 2 - 10, Y + 16 - w / 2 + 6, 8, 2); g.fillStyle = M10.GOLD; g.fillRect(X + 2, Y + 12, w - 4, 2);
      g.fillStyle = M10.BG3; g.fillRect(X + w / 2 - 4, Y + 6, 8, 10); g.fillStyle = M10.BLUE; g.fillRect(X + w / 2 - 3, Y + 7, 6, 2);
      if (d.text) drawTextC(g, d.text, X + w / 2, Y - w / 2 + 6, M10.GOLD);
      break;
    }
    case 'crater10': { // a decoy crater on the ground: pretty, shallow, useless
      const w = d.w || 32; g.fillStyle = '#4a4c52'; g.beginPath(); g.ellipse(X + w / 2, Y + 17, w / 2, 4, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = M10.MOON3; g.fillRect(X + 2, Y + 14, w - 4, 1);
      break;
    }
    case 'console10': {
      g.fillStyle = M10.STEEL; g.fillRect(X, Y, 28, 16); g.fillStyle = M10.BG; g.fillRect(X + 2, Y + 2, 24, 8);
      for (let i = 0; i < 5; i++){ g.fillStyle = ((frame >> 3) + i) % 3 ? M10.GOLD : M10.BLUE; g.fillRect(X + 4 + i * 4, Y + 4 + (i % 2) * 2, 2, 2); }
      g.fillStyle = M10.RED; g.fillRect(X + 4, Y + 12, 3, 2); g.fillStyle = M10.LEAF; g.fillRect(X + 10, Y + 12, 3, 2);
      break;
    }
    case 'window10': {
      g.fillStyle = M10.STEEL; g.beginPath(); g.arc(X + 12, Y + 8, 12, 0, Math.PI * 2); g.fill(); g.fillStyle = M10.BG; g.beginPath(); g.arc(X + 12, Y + 8, 9, 0, Math.PI * 2); g.fill();
      g.fillStyle = d.view === 'mars' ? M10.RUST : '#2a5a9a'; g.beginPath(); g.arc(X + 16, Y + 12, 5, 0, Math.PI * 2); g.fill();
      g.fillStyle = M10.IVORY; g.fillRect(X + 6, Y + 4, 1, 1); g.fillRect(X + 10, Y + 2, 1, 1);
      break;
    }
    case 'pad10': { // landing pad marking (a big ring + H-free generic cross)
      const w = d.w || 48; g.fillStyle = M10.GRAY; g.fillRect(X, Y + 14, w, 2); g.fillStyle = M10.GOLD; g.fillRect(X + 2, Y + 14, w - 4, 1);
      for (let i = 0; i < w; i += 8){ g.fillStyle = ((frame >> 3) + i / 8) % 2 ? M10.GOLD : M10.IVORY; g.fillRect(X + i + 2, Y + 15, 2, 1); }
      break;
    }
    case 'banner10': {
      const w = d.w || 64, t = d.text || 'MARS'; g.fillStyle = M10.BG; g.fillRect(X, Y, w, 14); g.fillStyle = M10.STEEL; g.fillRect(X + 1, Y + 1, w - 2, 12);
      drawTextC(g, t, X + w / 2, Y + 3, M10.GOLD);
      break;
    }
    case 'torch10': { // cyan cyber torch on the castle wall
      g.fillStyle = M10.HOOD2; g.fillRect(X + 6, Y + 4, 4, 12); g.fillStyle = M10.CYAN; const f = (frame >> 2) % 3; g.fillRect(X + 5, Y - 2 - f, 6, 6 + f); g.fillStyle = '#ffffff'; g.fillRect(X + 7, Y + 1, 2, 2);
      break;
    }
    case 'acid10': { // ACID at a console (mission control). Shades, headphones, cap, beige jacket. No cigarette.
      const img = (typeof broFrame === 'function') ? broFrame('acid', 'stand', true) : null;
      g.fillStyle = M10.STEEL; g.fillRect(X + 14, Y + 6, 20, 10); g.fillStyle = M10.BG; g.fillRect(X + 16, Y + 7, 16, 5); g.fillStyle = M10.GOLD; g.fillRect(X + 18, Y + 8, 2, 2); g.fillStyle = M10.BLUE; g.fillRect(X + 24, Y + 9, 4, 1);
      if (img) g.drawImage(img, X, Y + 16 - img.height);
      break;
    }
    case 'fuelTank10': {
      g.fillStyle = M10.CHROME; g.fillRect(X, Y - 16, 20, 32); g.fillStyle = M10.SILVER; g.fillRect(X + 2, Y - 16, 3, 32); g.fillStyle = M10.STEEL; g.fillRect(X, Y - 18, 20, 2); g.fillRect(X, Y + 2, 20, 2);
      g.fillStyle = M10.GOLD; g.fillRect(X + 6, Y - 6, 8, 4);
      break;
    }
    case 'lights10': {
      const w = d.w || 64; for (let i = 0; i < w; i += 8){ g.fillStyle = ((frame >> 3) + i / 8) % 4 === 0 ? M10.RED : '#3a1010'; g.fillRect(X + i, Y + 14, 3, 2); }
      break;
    }
    case 'icecap10': {
      g.fillStyle = M10.ICE; g.beginPath(); g.ellipse(X + 24, Y + 16, 24, 6, 0, Math.PI, 0); g.fill(); g.fillStyle = '#c8d8e8'; g.fillRect(X + 6, Y + 14, 36, 2);
      break;
    }
  }
}

function drawMarsItem(g, kind, X, Y, frame){
  const sp = marsSpr(); const bob = Math.round(Math.sin(frame * 0.12) * 1);
  g.globalAlpha = 0.25 + Math.sin(frame * 0.2) * 0.1; g.fillStyle = M10.GOLD; g.fillRect(X - 1, Y + bob, 14, 14); g.globalAlpha = 1;
  if (sp && sp.fuel) g.drawImage(sp.fuel, X + 2, Y + 2 + bob); else { g.fillStyle = M10.CHROME; g.fillRect(X + 2, Y + 2 + bob, 10, 12); }
}
