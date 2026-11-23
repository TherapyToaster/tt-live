// World 3: TOASTER PIT — original procedural pixel art (grimy PS1-style basement translated to pixel art).
// Palette on black: #FFD400 #ff00c8 #00f0ff #ff0040 #e3b303 #cbbcd9 #ff5a00. Jam is always grape purple.
// No casino/cash imagery: the slot reels only ever show toast, skulls, jam, crumbs, spikes and springs.
'use strict';
const PIT = { Y: '#FFD400', M: '#ff00c8', C: '#00f0ff', R: '#ff0040', D: '#e3b303', L: '#cbbcd9', O: '#ff5a00', K: '#000000',
  JAM: '#8a3fd1', JAM2: '#5a2390', CRUST: '#8a4a1c', CRUMB: '#e8c27a', SMOKE: '#3a3440' };
function pitCv(w, h, fn){ const c = mkCanvas(w, h), x = c.getContext('2d'); fn(x); return c; }
function pR(x, c, a, b, w, h){ x.fillStyle = c; x.fillRect(a, b, w, h); }
function pitOutline(src, col){ // 1px dark outline around opaque pixels (PS1-ish crunchy edge)
  const w = src.width, h = src.height, c = mkCanvas(w, h), x = c.getContext('2d');
  const d = readPixels(src).data;
  x.fillStyle = col || '#05030a';
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++){
    if (d[(j * w + i) * 4 + 3]) continue;
    const n = (a, b) => a >= 0 && b >= 0 && a < w && b < h && d[(b * w + a) * 4 + 3];
    if (n(i - 1, j) || n(i + 1, j) || n(i, j - 1) || n(i, j + 1)) x.fillRect(i, j, 1, 1);
  }
  x.drawImage(src, 0, 0); return c;
}
// ---------------- tiles ----------------
function pitGrime(x, seed, base){
  const r = rng(seed);
  for (let i = 0; i < 10; i++){ x.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.05)'; x.fillRect((r() * 16) | 0, (r() * 16) | 0, 1 + ((r() * 2) | 0), 1); }
  if (r() < 0.5){ const dx = (r() * 14) | 0; x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(dx, 3, 1, 4 + ((r() * 8) | 0)); } // water stain drip
}
function pitTiles(ts, th){
  const P = th.pitCol || { a: PIT.M, b: PIT.C };
  // neon trim on the floor edge + grime
  ts.groundTop = ts.groundTop.map((t, i) => pitCv(16, 16, x => { x.drawImage(t, 0, 0); pitGrime(x, 300 + i * 7); pR(x, '#05030a', 0, 0, 16, 1); pR(x, i % 2 ? P.a : P.b, 0, 1, 16, 1); if (i === 2){ pR(x, PIT.JAM, 5, 2, 3, 1); pR(x, PIT.JAM2, 6, 3, 1, 2); } }));
  ts.ground = ts.ground.map((t, i) => pitCv(16, 16, x => { x.drawImage(t, 0, 0); pitGrime(x, 400 + i * 11); }));
  // cinder block with spray-paint specks
  ts.brick = pitCv(16, 16, x => { x.drawImage(ts.brick, 0, 0); pitGrime(x, 77); pR(x, P.a, 2, 4, 3, 1); pR(x, P.a, 3, 5, 1, 1); pR(x, P.b, 10, 11, 4, 1); pR(x, P.b, 13, 12, 1, 1); });
  // hot coil floor: off / warn / on (+ flicker)
  const coil = (st) => pitCv(16, 16, x => {
    pR(x, '#141016', 0, 0, 16, 16); pR(x, '#2a2228', 0, 4, 16, 12); pR(x, '#05030a', 0, 15, 16, 1);
    const cc = st === 'on' ? ['#fff3a0', '#FFD400', '#ff5a00'] : st === 'warn' ? ['#ffb060', '#ff5a00', '#8a2a10'] : ['#c87a3a', '#8a4a20', '#4a2410'];
    for (let i = 0; i < 4; i++){ const X = i * 4; pR(x, cc[2], X, 1, 3, 3); pR(x, cc[1], X, 0, 3, 3); pR(x, cc[0], X + 1, 0, 1, 1); pR(x, cc[2], X + 3, 2, 1, 1); }
    pR(x, '#3a3036', 1, 7, 14, 2); pR(x, '#1a1418', 1, 9, 14, 1);
    for (let i = 2; i < 14; i += 4) pR(x, st === 'off' ? '#4a3a3a' : PIT.O, i, 11, 2, 2);
  });
  ts.coil = { off: coil('off'), warn: coil('warn'), on: coil('on') };
  // wall outlet (with a fork stuck in it)
  ts.outlet = pitCv(16, 16, x => {
    pR(x, '#1c1820', 0, 0, 16, 16); pR(x, '#05030a', 2, 1, 12, 14); pR(x, PIT.L, 3, 2, 10, 12); pR(x, '#ffffff', 3, 2, 10, 1); pR(x, '#8a7ea0', 3, 13, 10, 1);
    pR(x, '#2a2232', 5, 4, 1, 3); pR(x, '#2a2232', 10, 4, 1, 3); pR(x, '#2a2232', 7, 9, 2, 2);
    pR(x, '#c0c8d0', 6, 0, 1, 5); pR(x, '#c0c8d0', 9, 0, 1, 5); pR(x, '#e8eef4', 6, 0, 4, 1); pR(x, '#8a929c', 7, 1, 2, 1); // fork tines
  });
  // mini fridge (explosive: grape jam + soda pressure)
  ts.fridge = pitCv(16, 16, x => {
    pR(x, '#05030a', 1, 0, 14, 16); pR(x, '#e6e0ee', 2, 1, 12, 14); pR(x, '#ffffff', 2, 1, 12, 1); pR(x, '#a89cbc', 2, 6, 12, 1);
    pR(x, '#8a7ea0', 12, 3, 1, 2); pR(x, '#8a7ea0', 12, 8, 1, 4); pR(x, PIT.M, 4, 9, 6, 3); pR(x, '#ffffff', 5, 10, 1, 1); pR(x, PIT.JAM, 4, 3, 3, 2);
    pR(x, '#05030a', 2, 15, 3, 1); pR(x, '#05030a', 11, 15, 3, 1);
  });
  return ts;
}
// ---------------- sprites ----------------
function pitSkull(x, body, shade, eye, ox, oy, sq){ // 12x11 skull, sq = squash (0 normal, 1 squashed, -1 stretched)
  const h = sq > 0 ? 8 : sq < 0 ? 12 : 10, w = sq > 0 ? 14 : sq < 0 ? 10 : 12, X = ox + (12 - w) / 2, Y = oy + (11 - h);
  pR(x, body, X + 1, Y, w - 2, h - 2); pR(x, body, X, Y + 1, w, h - 4); pR(x, shade, X + 1, Y + h - 3, w - 2, 1);
  pR(x, body, X + 2, Y + h - 2, w - 4, 2); pR(x, '#ffffff', X + 2, Y + 1, 2, 1);
  const ey = Y + Math.floor(h * 0.35);
  pR(x, '#05030a', X + 2, ey, 3, 3); pR(x, '#05030a', X + w - 5, ey, 3, 3); pR(x, eye, X + 3, ey + 1, 1, 1); pR(x, eye, X + w - 4, ey + 1, 1, 1);
  pR(x, '#05030a', X + w / 2 - 1, ey + 3, 2, 1);
  for (let i = X + 3; i < X + w - 3; i += 2) pR(x, '#05030a', i, Y + h - 1, 1, 1);
}
function buildPitSprites(){
  const S = {};
  const pair = (fn) => { const a = [pitOutline(pitCv(16, 16, x => fn(x, 0))), pitOutline(pitCv(16, 16, x => fn(x, 1)))]; return { R: a, L: a.map(flipH) }; };
  // Jam Skull: magenta hopper with grape-jam drips
  S.jamskull = pair((x, f) => { pitSkull(x, PIT.M, '#a0007f', PIT.Y, 2, f ? 2 : 4, f ? -1 : 0); pR(x, PIT.JAM, 4, f ? 2 : 4, 7, 1); pR(x, PIT.JAM, 5, f ? 3 : 5, 1, 2); pR(x, PIT.JAM2, 9, f ? 3 : 5, 1, 3); });
  S.jamskullSq = pitOutline(pitCv(16, 16, x => { pitSkull(x, PIT.M, '#a0007f', PIT.Y, 1, 5, 1); pR(x, PIT.JAM, 0, 14, 16, 2); }));
  // Butter Skull: cyan slider with a butter pat hat
  S.butterskull = pair((x, f) => { pitSkull(x, PIT.C, '#008aa0', PIT.R, 2, 5, 0); pR(x, '#ffe680', 5, 3, 6, 2); pR(x, '#fff8c8', 5, 3, 6, 1); if (f){ pR(x, '#a9f4ff', 0, 13, 3, 1); pR(x, '#a9f4ff', 0, 11, 2, 1); } });
  S.butterskullSq = pitOutline(pitCv(16, 16, x => { pitSkull(x, PIT.C, '#008aa0', PIT.R, 1, 5, 1); pR(x, '#ffe680', 3, 14, 10, 2); }));
  // Rubber Skull: squeaky red bouncer (normal / squashed on landing)
  S.rubber = pair((x, f) => { pitSkull(x, f ? '#ff3a6a' : PIT.R, '#a0002a', '#ffffff', 2, f ? 5 : 3, f ? 1 : -1); pR(x, '#ffb0c8', 4, f ? 7 : 4, 2, 1); });
  // Smoke Detector (ceiling): 16x8 disc, red LED
  S.smoke = [0, 1].map(f => pitOutline(pitCv(16, 10, x => { pR(x, '#8a8296', 3, 0, 10, 2); pR(x, '#e8e4ee', 1, 2, 14, 5); pR(x, '#ffffff', 2, 2, 12, 1); pR(x, '#a89cbc', 1, 6, 14, 1); pR(x, '#cbbcd9', 4, 4, 8, 1); pR(x, f ? PIT.R : '#5a1020', 7, 7, 2, 2); })));
  // Crust Goon: W3 gun enemy (hooded crust with a toaster blaster)
  S.goon = pair((x, f) => {
    pR(x, '#3a1a2a', 3, 1, 9, 12); pR(x, PIT.CRUST, 4, 1, 7, 1); pR(x, '#5a2a3a', 3, 2, 1, 10); pR(x, '#14080e', 5, 3, 5, 5);
    pR(x, PIT.M, 6, 5, 1, 1); pR(x, PIT.M, 8, 5, 1, 1); pR(x, PIT.CRUMB, 3, 0, 9, 1); pR(x, '#2a1220', 4, 13, 3, 3 - f); pR(x, '#2a1220', 8, 13, 3, 2 + f);
    pR(x, '#8a929c', 9, 8, 6, 3); pR(x, '#c0c8d0', 9, 8, 6, 1); pR(x, PIT.C, 14, 9, 1, 1); // toaster blaster
  });
  // Crumb Tray (W3 pickup: short skull magnet)
  S.tray = [0, 1].map(f => pitOutline(pitCv(16, 16, x => { pR(x, '#8a929c', 1, 8, 14, 5); pR(x, '#c0c8d0', 1, 8, 14, 1); pR(x, '#5c6370', 2, 12, 12, 1); for (let i = 3; i < 13; i += 3) pR(x, PIT.CRUMB, i, 6 + ((i + f) % 2), 2, 2); pR(x, f ? PIT.C : PIT.M, 6, 2, 4, 2); pR(x, f ? PIT.M : PIT.C, 7, 4, 2, 1); })));
  // IOU paper + burnt slice (boss projectiles)
  S.iou = pitOutline(pitCv(12, 8, x => { pR(x, '#f4efe0', 0, 0, 12, 8); pR(x, '#d8d0bc', 0, 7, 12, 1); drawText(x, 'IOU', 0, 1, PIT.R, 1); }));
  S.slice = [0, 1].map(f => pitOutline(pitCv(12, 12, x => { pR(x, '#1a0e08', 1, 1, 10, 10); pR(x, '#3a1e10', 2, 2, 8, 8); pR(x, '#2a160c', 0, 2, 1, 7); pR(x, f ? PIT.O : '#8a2a10', 3, 4, 2, 1); pR(x, f ? '#8a2a10' : PIT.O, 7, 7, 2, 1); pR(x, '#05030a', 4, 6, 1, 1); })));
  S.breadlord = buildBreadlord();
  return S;
}
// THE BREADLORD: a looming debt collector — loaf head with a crust crown, hollow neon eyes, hooded robe, long fingers
function buildBreadlord(){
  const mk = (mode) => pitOutline(pitCv(64, 60, x => {
    // robe / hood
    pR(x, '#1a0e1a', 8, 22, 48, 38); pR(x, '#2a1630', 10, 22, 44, 36); pR(x, '#3a2040', 12, 24, 4, 34); pR(x, '#3a2040', 48, 24, 4, 34);
    pR(x, '#120812', 14, 14, 36, 16); pR(x, '#2a1630', 12, 18, 40, 8);
    // loaf head
    const sh = mode === 'hurt' ? 2 : 0;
    pR(x, PIT.CRUST, 16 + sh, 6, 32, 22); pR(x, '#a8622a', 18 + sh, 4, 28, 4); pR(x, '#c8823a', 20 + sh, 3, 24, 2);
    pR(x, mode === 'dead' ? '#6a5a4a' : PIT.CRUMB, 19 + sh, 9, 26, 17); pR(x, '#f4dca0', 20 + sh, 9, 24, 2);
    for (const [a, b] of [[22, 13], [30, 20], [40, 12], [26, 22], [37, 23]]) pR(x, '#c8a060', a + sh, b, 2, 1);
    // crust crown (five crust points)
    for (let i = 0; i < 5; i++){ pR(x, '#6a3412', 18 + i * 6 + sh, 0, 4, 5); pR(x, PIT.D, 19 + i * 6 + sh, 0, 2, 1); }
    // eyes
    const eye = mode === 'dead' ? '#3a3440' : mode === 'angry' ? PIT.R : PIT.M;
    pR(x, '#05030a', 22 + sh, 13, 7, 6); pR(x, '#05030a', 35 + sh, 13, 7, 6); pR(x, eye, 24 + sh, 15, 3, 2); pR(x, eye, 37 + sh, 15, 3, 2);
    if (mode === 'angry'){ pR(x, '#05030a', 21 + sh, 11, 8, 2); pR(x, '#05030a', 35 + sh, 11, 8, 2); }
    // grin
    if (mode === 'dead'){ pR(x, '#05030a', 26, 22, 12, 1); }
    else { pR(x, '#05030a', 24 + sh, 21, 16, 4); for (let i = 25; i < 39; i += 3) pR(x, '#f4efe0', i + sh, 21, 2, 2); if (mode === 'throw' || mode === 'angry') pR(x, PIT.JAM, 26 + sh, 24, 12, 1); }
    // hands (long fingers) — throw pose raises one
    pR(x, PIT.CRUMB, 4, mode === 'throw' ? 18 : 46, 10, 6); for (let i = 0; i < 4; i++) pR(x, '#c8a060', 2 + i * 3, mode === 'throw' ? 14 : 52, 2, 5);
    pR(x, PIT.CRUMB, 50, 46, 10, 6); for (let i = 0; i < 4; i++) pR(x, '#c8a060', 51 + i * 3, 52, 2, 5);
  }));
  return { idle: mk('idle'), throw: mk('throw'), angry: mk('angry'), hurt: mk('hurt'), dead: mk('dead') };
}
// the debt table + ledger (drawn under the Breadlord), 80x26
function buildDebtTable(burn){
  return pitCv(80, 30, x => {
    pR(x, '#05030a', 0, 6, 80, 8); pR(x, '#3a2418', 1, 7, 78, 6); pR(x, '#5a3a24', 1, 7, 78, 1);
    pR(x, '#05030a', 6, 14, 6, 16); pR(x, '#2a180e', 7, 14, 4, 16); pR(x, '#05030a', 68, 14, 6, 16); pR(x, '#2a180e', 69, 14, 4, 16);
    pR(x, '#2a180e', 12, 14, 56, 3); drawText(x, 'LEDGER', 22, 18, '#5a3a24', 1);
    // ledger book
    pR(x, '#05030a', 26, 0, 28, 7); pR(x, burn ? '#3a1a10' : '#f4efe0', 27, 1, 12, 5); pR(x, burn ? '#3a1a10' : '#e8e0cc', 41, 1, 12, 5); pR(x, PIT.R, 39, 0, 2, 7);
    if (!burn) for (let i = 2; i < 6; i += 2){ pR(x, '#8a7ea0', 28, i, 10, 1); pR(x, '#8a7ea0', 42, i, 10, 1); }
    // candle
    pR(x, '#e8e0cc', 64, 1, 3, 5); pR(x, PIT.Y, 65, -1, 1, 2);
  });
}
// ---------------- backgrounds ----------------
function pitTag(x, text, X, Y, col, s, drip){ // spray-paint tag: chunky letters with a dark outline and paint drips
  drawText(x, text, X + 1, Y + 1, '#05030a', s); drawText(x, text, X - 1, Y, '#05030a', s); drawText(x, text, X, Y, col, s);
  if (drip){ const r = rng(X * 13 + Y); for (let i = 0; i < 4; i++){ const dx = X + ((r() * textWidth(text, s)) | 0); pR(x, col, dx, Y + 7 * s, 1, 3 + ((r() * 8) | 0)); } }
}
function pitPoster(x, X, Y, w, h, lines, bg, fg){
  pR(x, '#05030a', X - 1, Y - 1, w + 2, h + 2); pR(x, bg, X, Y, w, h); pR(x, 'rgba(0,0,0,0.25)', X, Y + h - 3, w, 3);
  lines.forEach((l, i) => drawText(x, l, X + Math.round((w - textWidth(l)) / 2), Y + 4 + i * 9, fg));
  pR(x, '#c0c8d0', X + 2, Y + 1, 1, 1); pR(x, '#c0c8d0', X + w - 3, Y + 1, 1, 1); // tacks
}
function pitLayers(kind, L, layer){
  if (kind === 'basement' || kind === 'fridge'){
    L.far = layer((x, r) => {
      for (let i = 0; i < 512; i += 32){ pR(x, (i / 32) % 2 ? '#1a1620' : '#17131c', i, 20, 32, 200); pR(x, '#0e0b12', i, 20, 1, 200); }
      for (let y = 30; y < 210; y += 16) pR(x, '#120f16', 0, y, 512, 1);
      pR(x, '#2a2230', 0, 40, 512, 4); pR(x, '#3a3040', 0, 40, 512, 1); pR(x, '#2a2230', 0, 54, 512, 2); // ceiling pipes
      for (let i = 0; i < 512; i += 96){ pR(x, '#2a2230', i + 40, 44, 3, 30); }
      for (let i = 0; i < 40; i++){ pR(x, 'rgba(0,0,0,0.35)', (r() * 512) | 0, 60 + ((r() * 140) | 0), 2 + ((r() * 6) | 0), 1 + ((r() * 14) | 0)); } // stains
    });
    L.mid = layer((x) => {
      pitTag(x, 'TOASTY', 14, 120, PIT.Y, 2, true); pitTag(x, 'PIT', 150, 96, PIT.M, 3, true); pitTag(x, 'CRUMBS', 250, 140, PIT.C, 2, true); pitTag(x, 'BREADLORD', 360, 104, PIT.R, 1, true);
      pitPoster(x, 86, 66, 60, 32, ['FEED', 'THE', 'BREADLORD'], '#f4efe0', '#3a1a2a');
      pitPoster(x, 300, 66, 52, 22, ['ITS ART', 'THERAPY'], PIT.M, '#05030a');
      pitPoster(x, 440, 80, 50, 22, ['FEED THE', 'BREADLORD'], PIT.Y, '#05030a');
      // skull + toast stencils
      for (const [sx, sy, c] of [[70, 160, PIT.L], [220, 76, PIT.C], [420, 150, PIT.M]]){ pR(x, c, sx, sy, 10, 8); pR(x, '#17131c', sx + 2, sy + 3, 2, 2); pR(x, '#17131c', sx + 6, sy + 3, 2, 2); pR(x, c, sx + 2, sy + 8, 6, 2); }
      for (const [sx, sy] of [[190, 170], [480, 60]]){ pR(x, PIT.D, sx, sy, 12, 10); pR(x, PIT.D, sx + 1, sy - 2, 10, 2); pR(x, '#17131c', sx + 3, sy + 3, 6, 4); }
      // bare bulbs
      for (const bx of [60, 250, 420]){ pR(x, '#3a3040', bx, 20, 1, 30); pR(x, PIT.Y, bx - 2, 50, 5, 5); x.globalAlpha = 0.07; x.fillStyle = PIT.Y; x.beginPath(); x.arc(bx, 54, 40, 0, Math.PI * 2); x.fill(); x.globalAlpha = 1; }
      if (kind === 'fridge'){ pitPoster(x, 200, 40, 70, 14, ['SNACK RUN'], PIT.C, '#05030a'); }
    });
  } else if (kind === 'wiring'){
    L.far = layer((x, r) => {
      pR(x, '#0c080a', 0, 0, 512, 240);
      for (let i = 0; i < 18; i++){ const y0 = 30 + ((r() * 170) | 0), c = r() < 0.33 ? '#3a1410' : r() < 0.5 ? '#14243a' : '#2a2a14'; x.strokeStyle = c; x.lineWidth = 2; x.beginPath(); x.moveTo(0, y0); for (let k = 0; k <= 8; k++) x.lineTo(k * 64, y0 + Math.sin(k * 1.3 + i) * 12); x.stroke(); }
      for (let i = 0; i < 512; i += 128){ // giant coil drums
        pR(x, '#1a1214', i + 30, 70, 50, 110); for (let y = 74; y < 178; y += 6){ pR(x, '#5a2a14', i + 28, y, 54, 3); pR(x, '#8a4a20', i + 28, y, 54, 1); }
        pR(x, '#2a2228', i + 24, 64, 62, 8); pR(x, '#2a2228', i + 24, 178, 62, 8);
      }
    });
    L.mid = layer((x, r) => {
      for (let i = 0; i < 512; i += 64){ pR(x, '#1a1418', i + 20, 0, 6, 240); pR(x, '#2a2228', i + 20, 0, 1, 240); }
      for (let i = 0; i < 7; i++){ const X = (r() * 480) | 0, Y = 50 + ((r() * 120) | 0); pR(x, '#05030a', X, Y, 18, 12); pR(x, '#2a2232', X + 1, Y + 1, 16, 10); pR(x, i % 2 ? PIT.C : PIT.O, X + 3, Y + 3, 3, 2); pR(x, '#5a5068', X + 9, Y + 3, 6, 6); }
      pitTag(x, 'DONT LICK', 40, 200, PIT.O, 1, false); pitTag(x, 'TOASTY', 300, 40, PIT.Y, 1, true);
    });
  } else if (kind === 'reels'){
    L.far = layer((x, r) => {
      pR(x, '#0a0610', 0, 0, 512, 240);
      for (let i = 0; i < 512; i += 64){ x.strokeStyle = '#1e1428'; x.lineWidth = 3; x.beginPath(); x.arc(i + 32, 260, 150, Math.PI, 0); x.stroke(); }
      // giant background reels (toast, skull, jam, crumbs — never money)
      for (let i = 0; i < 512; i += 170){
        pR(x, '#05030a', i + 20, 50, 46, 130); pR(x, '#1e1626', i + 22, 52, 42, 126);
        const sym = ['toast', 'skull', 'jam', 'crumb'];
        for (let k = 0; k < 4; k++) pitSymbol(x, sym[(k + i / 170) % 4], i + 33, 58 + k * 30, 0.6);
        pR(x, 'rgba(0,0,0,0.45)', i + 22, 52, 42, 30); pR(x, 'rgba(0,0,0,0.45)', i + 22, 148, 42, 30);
        pR(x, PIT.M, i + 18, 112, 50, 1); pR(x, PIT.M, i + 18, 116, 50, 1);
      }
    });
    L.mid = layer((x) => {
      for (let i = 0; i < 512; i += 32){ pR(x, (i >> 5) % 2 ? PIT.M : PIT.C, i, 28, 16, 2); }
      pitTag(x, 'SPIN IT', 120, 190, PIT.C, 1, true); pitTag(x, 'PIT', 380, 60, PIT.M, 2, true);
      pitPoster(x, 250, 150, 64, 22, ['NO TOAST', 'NO CRUMBS'], PIT.L, '#05030a');
    });
  } else if (kind === 'vault'){
    L.far = layer((x, r) => {
      pR(x, '#08060a', 0, 0, 512, 240);
      for (let i = 0; i < 512; i += 48){ pR(x, '#141016', i + 4, 20, 40, 200); pR(x, '#1e1820', i + 4, 20, 40, 2); for (let y = 30; y < 210; y += 12) pR(x, '#100c12', i + 6, y, 36, 1); }
      // crumb hoards
      for (let k = 0; k < 6; k++){ const cx = (r() * 512) | 0, w = 40 + ((r() * 40) | 0); for (let n = 0; n < w * 8; n++){ const a = r() * Math.PI, d = Math.sqrt(r()); pR(x, r() < 0.5 ? '#8a6a3a' : '#c8a060', (cx + Math.cos(a) * d * w / 2) | 0, (210 - Math.sin(a) * d * w * 0.35) | 0, 1, 1); } }
    });
    L.mid = layer((x) => {
      for (const [X, Y] of [[40, 70], [200, 60], [380, 80]]){ // hanging ledger pages + chains
        pR(x, '#3a3040', X + 10, 0, 1, Y); pR(x, '#f4efe0', X, Y, 22, 28); pR(x, '#05030a', X, Y, 22, 1); for (let i = Y + 5; i < Y + 26; i += 4) pR(x, '#8a7ea0', X + 3, i, 16, 1); pR(x, PIT.R, X + 14, Y + 20, 6, 3);
      }
      pitTag(x, 'DEBT', 110, 150, PIT.R, 2, true); pitTag(x, 'BREADLORD', 280, 170, PIT.M, 1, true); pitPoster(x, 450, 120, 46, 22, ['PAY IN', 'CRUMBS'], PIT.Y, '#05030a');
    });
  }
}
// reel symbols (also used by the boss reels). s = scale
function pitSymbol(x, sym, X, Y, s){
  s = s || 1; const q = (a, b, w, h, c) => pR(x, c, Math.round(X + a * s), Math.round(Y + b * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)));
  if (sym === 'toast'){ q(0, 2, 20, 18, '#1a0e08'); q(1, 0, 18, 4, '#2a160c'); q(3, 4, 14, 14, '#3a1e10'); q(5, 7, 3, 2, PIT.O); q(12, 11, 3, 2, PIT.O); q(6, 12, 2, 2, '#05030a'); q(12, 6, 2, 2, '#05030a'); }
  else if (sym === 'skull'){ q(2, 1, 16, 14, PIT.L); q(4, 15, 12, 4, PIT.L); q(5, 6, 4, 4, '#05030a'); q(11, 6, 4, 4, '#05030a'); q(9, 11, 2, 2, '#05030a'); q(6, 17, 1, 2, '#05030a'); q(9, 17, 1, 2, '#05030a'); q(12, 17, 1, 2, '#05030a'); }
  else if (sym === 'jam'){ q(5, 0, 10, 4, '#cbbcd9'); q(3, 4, 14, 16, PIT.JAM); q(5, 6, 3, 10, '#c27ae8'); q(4, 10, 12, 4, '#f4efe0'); q(6, 11, 8, 2, PIT.JAM2); }
  else if (sym === 'crumb'){ for (const [a, b] of [[2, 12], [8, 6], [13, 13], [6, 15], [14, 4], [3, 3]]){ q(a, b, 5, 4, '#c8a060'); q(a, b, 5, 1, '#f4dca0'); } }
  else if (sym === 'spike'){ for (let i = 0; i < 5; i++){ q(i * 4, 12, 4, 8, '#8a929c'); q(i * 4 + 1, 6, 2, 6, '#c0c8d0'); q(i * 4 + 1, 4, 2, 2, PIT.R); } }
  else if (sym === 'bounce'){ q(2, 14, 16, 4, '#5c6370'); for (let i = 0; i < 3; i++) q(4, 4 + i * 3, 12, 2, PIT.C); q(2, 0, 16, 4, PIT.C); q(4, 0, 12, 1, '#ffffff'); }
  else if (sym === 'safe'){ q(0, 6, 20, 8, '#2a2232'); q(1, 7, 18, 2, '#5a5068'); }
}
