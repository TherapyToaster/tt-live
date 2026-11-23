// World 5: SKULLZ BUMBO — original procedural pixel art for a haunted toaster-kitchen underworld staged as a cardboard
// puppet theater (lore: lore/bumbo.md). Hand-cut cardboard, thick scribbly marker outlines, sketchy shading, tape,
// corrugated edges, paper hinges that wobble. Spooky-goofy. Jam is always grape purple (#b54e8c) with seeds.
// Palette: kraft #c4a06a #e0c894, dark kraft #6a4a28, paper #f3ead4, ink #14100c, tape #dcc888, stage #100e0c,
// bone #e6d5b8, ember #c45e28 #e07830, highlight #FFD400. No real brands, no money, no gore.
'use strict';
const BUM = { K: '#c4a06a', K2: '#e0c894', DK: '#6a4a28', DK2: '#8a6a40', P: '#f3ead4', I: '#14100c', T: '#dcc888', ST: '#100e0c',
  BN: '#e6d5b8', E: '#c45e28', E2: '#e07830', Y: '#FFD400', JAM: '#b54e8c', JAM2: '#7e2f60', JAM3: '#d97ab2',
  BU: '#f4d35e', BU2: '#c8a02a', HO: '#f0a818', HO2: '#a86a08', CH: '#c9d2dc', CH2: '#8e98a6', CH3: '#f4f8fb', CU: '#7a1e22', CU2: '#a8302e' };
function bCv(w, h, fn){ const c = mkCanvas(w, h), x = c.getContext('2d'); fn(x); return c; }
function bR(x, c, a, b, w, h){ x.fillStyle = c; x.fillRect(a, b, w, h); }
// thick scribbly marker outline: a 1px ink ring plus a few doubled "wobbly" pixels
function bInk(src, seed){
  const o = typeof pitOutline === 'function' ? pitOutline(src, BUM.I) : src;
  const w = o.width, h = o.height, d = readPixels(o).data, c = mkCanvas(w, h), x = c.getContext('2d'); x.drawImage(o, 0, 0);
  const r = rng(seed || 7); x.fillStyle = BUM.I;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++){ const k = (j * w + i) * 4; if (d[k + 3] && d[k] < 40 && d[k + 1] < 40 && r() < 0.18){ const ni = i + (r() < 0.5 ? -1 : 1); if (ni >= 0 && ni < w && !d[(j * w + ni) * 4 + 3]) x.fillRect(ni, j, 1, 1); } }
  return c;
}
function bTape(x, X, Y, w, h){ x.globalAlpha = 0.75; bR(x, BUM.T, X, Y, w, h); x.globalAlpha = 1; bR(x, '#f0e2b0', X, Y, w, 1); }
function bCorr(x, X, Y, w, h, col){ for (let i = 0; i < w; i += 2) bR(x, col || BUM.DK2, X + i, Y + ((i >> 1) % 2), 1, h - 1); } // corrugated edge
function bSketch(x, seed, n, col){ const r = rng(seed); x.fillStyle = col || 'rgba(20,16,12,0.22)'; for (let i = 0; i < (n || 6); i++){ const a = (r() * 14) | 0, b = (r() * 14) | 0; for (let k = 0; k < 3; k++) x.fillRect(a + k, b + 2 - k, 1, 1); } } // hatching

// ---------------- tiles ----------------
function bumboTiles(ts, th){
  const kind = th.bg;
  const kraft = kind === 'drain' ? ['#b8945e', '#d4bc88', '#5e4224'] : kind === 'cutlery' ? ['#a88a5c', '#c8b080', '#4e3a20'] : kind === 'chrome' ? ['#9aa2ac', '#d8dee4', '#4a5058'] : [BUM.K, BUM.K2, BUM.DK];
  const floor = (top, i) => bCv(16, 16, x => {
    bR(x, kraft[0], 0, 0, 16, 16); bSketch(x, 30 + i * 7, 5); bR(x, kraft[2], 0, 15, 16, 1);
    if (kind === 'chrome'){ for (let j = 3; j < 16; j += 5) bR(x, '#b8c0c8', 0, j, 16, 1); bR(x, '#6a7078', (i * 5) % 16, 0, 1, 16); } // foil over cardboard
    else for (let j = 4; j < 15; j += 5) bR(x, 'rgba(106,74,40,0.35)', 0, j, 16, 1);
    if (top){ bR(x, BUM.I, 0, 0, 16, 2); bR(x, kraft[1], 0, 2, 16, 3); bCorr(x, 0, 2, 16, 3, kraft[2]); bR(x, BUM.I, (i * 3) % 7, 1, 2, 2);
      if (i === 1) bTape(x, 4, 5, 7, 3); if (kind === 'drain' && i % 2 === 0){ bR(x, BUM.BU, 3 + i, 2, 5, 2); bR(x, BUM.BU2, 4 + i, 4, 2, 2); } }
  });
  ts.groundTop = [0, 1, 2, 3].map(i => floor(true, i));
  ts.ground = [0, 1, 2, 3].map(i => bCv(16, 16, x => { x.drawImage(floor(false, i), 0, 0); bR(x, 'rgba(16,14,12,0.38)', 0, 0, 16, 16); }));
  ts.brick = bCv(16, 16, x => { // taped cardboard box (breakable)
    bR(x, BUM.I, 0, 0, 16, 16); bR(x, kraft[0], 1, 1, 14, 14); bR(x, kraft[1], 1, 1, 14, 2); bR(x, kraft[2], 1, 13, 14, 2); bSketch(x, 11, 4);
    bTape(x, 6, 1, 4, 14); bR(x, kraft[2], 2, 8, 3, 1); bR(x, BUM.I, 11, 5, 2, 1);
  });
  ts.solid = bCv(16, 16, x => { // stacked thick cardboard with a marker X brace
    bR(x, BUM.I, 0, 0, 16, 16); bR(x, kraft[2], 1, 1, 14, 14); bCorr(x, 1, 1, 14, 14, kind === 'chrome' ? '#6a7078' : '#4a3218');
    x.strokeStyle = BUM.I; x.lineWidth = 1.5; x.beginPath(); x.moveTo(2, 2); x.lineTo(14, 14); x.moveTo(14, 2); x.lineTo(2, 14); x.stroke(); bR(x, kraft[1], 1, 1, 14, 1);
  });
  ts.used = bCv(16, 16, x => { bR(x, BUM.I, 0, 0, 16, 16); bR(x, BUM.DK, 1, 1, 14, 14); bSketch(x, 4, 6, 'rgba(0,0,0,0.3)'); bTape(x, 1, 6, 14, 3); });
  ts.crt = [0, 1, 2, 3].map(f => bCv(16, 16, x => { // "?" prize box: a paper gift box with a wobbly marker "?"
    bR(x, BUM.I, 0, 0, 16, 16); bR(x, BUM.P, 1, 1, 14, 14); bR(x, f % 2 ? BUM.Y : BUM.E2, 1, 1, 14, 3); bR(x, BUM.JAM, 7, 1, 2, 14);
    drawText(x, '?', 4 + (f === 2 ? 1 : 0), 5 + (f === 1 ? -1 : 0), BUM.I); bSketch(x, 20 + f, 3);
  }));
  ts.plank = bCv(16, 16, x => { // paper strip shelf (one-way) on a little tab
    bR(x, BUM.I, 0, 0, 16, 5); bR(x, BUM.P, 0, 1, 16, 3); bR(x, '#d8ccb0', 0, 3, 16, 1); bR(x, BUM.I, 7, 5, 2, 3); bTape(x, 1, 0, 4, 2);
  });
  ts.stone = bCv(16, 16, x => { // cardboard crate
    bR(x, BUM.I, 0, 0, 16, 16); bR(x, kraft[0], 1, 1, 14, 14); bR(x, BUM.I, 1, 7, 14, 1); bR(x, BUM.I, 7, 1, 1, 14); bR(x, kraft[1], 1, 1, 14, 1); bTape(x, 3, 3, 3, 3); drawTiny(x, 'UP', 9, 9, BUM.I);
  });
  ts.acid = [0, 1, 2, 3].map(f => bCv(16, 16, x => { // melted butter goo (hurts)
    bR(x, BUM.ST, 0, 0, 16, 16); bR(x, BUM.BU2, 0, 5, 16, 11); bR(x, BUM.BU, 0, 5, 16, 3); bR(x, '#fff3a8', 0, 5, 16, 1);
    const r = rng(40 + f); for (let i = 0; i < 4; i++){ const bx = (r() * 13) | 0, by = 8 + ((r() * 6) | 0); bR(x, '#fff3a8', bx, by, 2, 1); bR(x, BUM.I, bx, by + 1, 2, 1); }
    bR(x, BUM.I, 0, 4, 16, 1); bR(x, '#fff3a8', (f * 4) % 14, 4 + (f % 2), 3, 1);
  }));
  ts.crumble = bCv(16, 16, x => { // soggy cardboard (drops after you stand on it)
    bR(x, BUM.I, 0, 0, 16, 16); bR(x, '#8a6a40', 1, 1, 14, 14); bR(x, '#a88a5a', 1, 1, 14, 2); for (const [a, b] of [[3, 5], [9, 8], [5, 11], [12, 4]]) bR(x, '#5a4224', a, b, 2, 2); bR(x, BUM.I, 4, 7, 6, 1);
  });
  ts.spring = [0, 1].map(f => bCv(16, 16, x => { // Pop-Up Spring: a paper-plate pad on a zigzag coil, in a cardboard cup
    bR(x, BUM.I, 1, 10, 14, 6); bR(x, kraft[0], 2, 11, 12, 4); bR(x, BUM.E, 2, 11, 12, 1); drawTiny(x, 'POP', 3, 12, BUM.I);
    const top = f ? 6 : 1; x.strokeStyle = BUM.I; x.lineWidth = 1.5; x.beginPath(); x.moveTo(8, 10); for (let k = 0; k < 4; k++) x.lineTo(k % 2 ? 4 : 12, 10 - (k + 1) * (10 - top - 2) / 4); x.stroke();
    bR(x, BUM.I, 0, top - 1, 16, 4); bR(x, BUM.P, 1, top, 14, 2); bR(x, BUM.Y, 3, top, 10, 1);
  }));
  ts.bumbo = true;
  return ts;
}

// ---------------- sprites ----------------
function buildBumboSprites(){
  const B = {};
  const pair = (w, h, fn, seed) => { const a = [bInk(bCv(w, h, x => fn(x, 0)), seed), bInk(bCv(w, h, x => fn(x, 1)), (seed || 3) + 1)]; return { R: a, L: a.map(flipH) }; };
  const eyes = (x, a, b, c) => { bR(x, BUM.I, a, b, 3, 3); bR(x, BUM.I, a + 5, b, 3, 3); bR(x, c || BUM.Y, a + 1, b + 1, 1, 1); bR(x, c || BUM.Y, a + 6, b + 1, 1, 1); };
  // Crust Gremlin (walker): a crust-heel goblin with paper ears
  B.gremlin = pair(16, 14, (x, f) => {
    bR(x, BUM.DK, 2, 3, 12, 9); bR(x, BUM.E, 3, 4, 10, 6); bR(x, BUM.K2, 4, 5, 8, 4); bR(x, BUM.DK, 0, 2, 3, 3); bR(x, BUM.DK, 13, 2, 3, 3); // ears
    eyes(x, 4, 5, BUM.Y); bR(x, BUM.I, 6, 9, 4, 1); bR(x, BUM.P, 6, 9, 1, 1); bR(x, BUM.P, 9, 9, 1, 1); bSketch(x, 5, 3);
    bR(x, BUM.I, f ? 3 : 4, 12, 3, 2); bR(x, BUM.I, f ? 10 : 9, 12, 3, 2);
  }, 11);
  // Butter Slime: a wobbly pat of melted butter that lobs globs
  const slime = (x, f, lob) => { const s = lob ? 2 : f;
    bR(x, BUM.BU2, 1, 5 - s, 14, 7 + s); bR(x, BUM.BU, 2, 4 - s, 12, 6 + s); bR(x, '#fff3a8', 3, 4 - s, 6, 2); bR(x, BUM.BU2, 0, 11, 16, 1);
    eyes(x, 3, 6 - s, BUM.I); bR(x, BUM.P, 4, 7 - s, 1, 1); bR(x, BUM.P, 9, 7 - s, 1, 1); bR(x, BUM.I, 6, 10 - s, lob ? 4 : 3, lob ? 2 : 1); };
  B.slime = pair(16, 12, (x, f) => slime(x, f, false), 13);
  B.slimeLob = pair(16, 12, (x, f) => slime(x, f, true), 15);
  B.glob = bInk(bCv(7, 7, x => { bR(x, BUM.BU, 1, 1, 5, 5); bR(x, '#fff3a8', 2, 1, 2, 2); bR(x, BUM.BU2, 1, 5, 5, 1); }), 3);
  // Fork Ghoul: a paper ghost clutching a big cardboard fork (lunges)
  const ghoul = (x, f, lunge) => {
    bR(x, BUM.P, 2, 1, 10, 12); bR(x, BUM.P, 1, 4, 12, 9); for (let i = 0; i < 12; i += 4){ bR(x, BUM.P, 1 + i, 13, 2, f ? 2 : 3); }
    bR(x, '#d8ccb0', 1, 11, 12, 1); bR(x, BUM.I, 4, 4, 2, 3); bR(x, BUM.I, 8, 4, 2, 3); bR(x, BUM.I, 5, 9, 4, lunge ? 2 : 1);
    const fx = lunge ? 11 : 10; bR(x, BUM.CH2, fx, 8, 7, 2); bR(x, BUM.CH3, fx, 8, 7, 1); for (let k = 0; k < 3; k++) bR(x, BUM.CH2, fx + 7, 6 + k * 2, 3, 1); };
  B.ghoul = pair(20, 16, (x, f) => ghoul(x, f, false), 17);
  B.ghoulLunge = pair(20, 16, (x, f) => ghoul(x, f, true), 19);
  // Burnt Bagel Bat (flyer): a charred bagel with cardboard bat wings on paper hinges
  B.bbat = pair(18, 12, (x, f) => {
    bR(x, '#2a1a10', 5, 3, 8, 8); bR(x, '#4a2c18', 6, 3, 6, 2); bR(x, BUM.ST, 8, 6, 2, 2); bR(x, BUM.E2, 6, 5, 1, 1); bR(x, BUM.E2, 11, 5, 1, 1);
    const wy = f ? 1 : 5; bR(x, BUM.DK, 0, wy, 5, 3); bR(x, BUM.DK, 13, wy, 5, 3); bR(x, BUM.K, 1, wy, 3, 1); bR(x, BUM.K, 14, wy, 3, 1); bR(x, BUM.T, 4, 5, 2, 2); bR(x, BUM.T, 12, 5, 2, 2);
  }, 21);
  // Cord Snake: a frayed toaster cord with a plug head (slithers, zaps)
  B.snake = pair(22, 9, (x, f) => {
    for (let i = 0; i < 16; i++){ const y = 4 + Math.round(Math.sin((i + f * 3) * 0.7) * 2); bR(x, '#2a2a30', i, y, 1, 3); bR(x, '#5a5a66', i, y, 1, 1); }
    bR(x, BUM.CH2, 15, 2, 6, 6); bR(x, BUM.CH3, 15, 2, 6, 1); bR(x, BUM.Y, 21, 3, 1, 1); bR(x, BUM.Y, 21, 6, 1, 1); bR(x, BUM.I, 17, 4, 1, 1); bR(x, BUM.I, 19, 4, 1, 1); bR(x, '#ff5a3a', 17, 4, 1, 1);
  }, 23);
  // Buzz Crumb (boss minion): a honey-glazed crumb with paper wings
  B.buzz = pair(10, 8, (x, f) => { bR(x, BUM.HO, 2, 3, 6, 4); bR(x, BUM.I, 3, 4, 1, 3); bR(x, BUM.I, 6, 4, 1, 3); bR(x, BUM.P, f ? 2 : 1, 0, 3, 3); bR(x, BUM.P, f ? 5 : 6, 0, 3, 3); bR(x, BUM.I, 8, 4, 2, 1); }, 25);
  // Chrome Screamer (FOIL PUPPET) — the Hive's string-puppet knockoff of the bro: a tinfoil skull mask on a cardboard body
  const foil = (x, f, scream) => {
    bR(x, BUM.CH2, 6, 18, 20, 16); bR(x, BUM.CH, 7, 19, 18, 14); for (let j = 21; j < 33; j += 3) bR(x, '#b8c0c8', 7, j, 18, 1); // foil body
    bR(x, BUM.DK, 9, 33, 4, 3); bR(x, BUM.DK, 19, 33, 4, 3); bTape(x, 8, 20, 5, 2); bTape(x, 20, 28, 4, 2);
    bR(x, BUM.CH2, 4, 2, 24, 17); bR(x, BUM.CH3, 5, 3, 22, 14); for (let k = 0; k < 6; k++) bR(x, BUM.CH2, 6 + k * 4, 0, 2, 3); // crinkled crown
    bR(x, BUM.I, 8, 7, 6, 5); bR(x, BUM.I, 18, 7, 6, 5); bR(x, '#00e5ff', 10, 9, 2, 2); bR(x, '#00e5ff', 20, 9, 2, 2);
    if (scream){ bR(x, BUM.I, 11, 13, 10, 6); bR(x, BUM.CU2, 13, 15, 6, 3); } else { bR(x, BUM.I, 12, 14, 8, 2); for (let k = 0; k < 4; k++) bR(x, BUM.CH3, 13 + k * 2, 14, 1, 1); }
    bR(x, BUM.CH2, f ? 0 : 1, 20, 6, 3); bR(x, BUM.CH2, f ? 26 : 25, 20, 6, 3); // arms (paper hinges)
    drawTiny(x, 'FOIL', 9, 27, BUM.I); };
  B.foil = [0, 1].map(f => bInk(bCv(32, 36, x => foil(x, f, false)), 27 + f));
  B.foilScream = bInk(bCv(32, 36, x => foil(x, 0, true)), 29);
  B.foilCrumpled = bInk(bCv(32, 14, x => { bR(x, BUM.CH2, 2, 4, 28, 10); bR(x, BUM.CH, 4, 3, 10, 6); bR(x, BUM.CH3, 16, 5, 8, 5); bR(x, BUM.I, 9, 6, 3, 2); bR(x, BUM.DK, 22, 9, 6, 4); }), 31);
  // HIVE SKULL (boss): a honeycomb skull in yellow/black, dripping honey. 44x44
  const hive = (x, pose) => {
    const slam = pose === 'slam', hurt = pose === 'hurt';
    bR(x, BUM.I, 6, 2, 32, 30); bR(x, hurt ? '#fff3a8' : BUM.Y, 7, 3, 30, 28);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++){ const cx = 9 + i * 6 + (j % 2) * 3, cy = 4 + j * 6; bR(x, BUM.I, cx, cy, 5, 4); bR(x, j % 2 === i % 2 ? BUM.HO : BUM.HO2, cx + 1, cy + 1, 3, 2); } // honeycomb cells
    bR(x, BUM.BN, 9, 14, 26, 14); bR(x, BUM.P, 10, 15, 24, 2); // skull face plate
    bR(x, BUM.I, 12, 17, 8, 6); bR(x, BUM.I, 24, 17, 8, 6); bR(x, slam ? BUM.E2 : BUM.Y, 14, 19, 3, 2); bR(x, slam ? BUM.E2 : BUM.Y, 26, 19, 3, 2); // eye sockets
    bR(x, BUM.I, 20, 23, 4, 3); // nose
    bR(x, BUM.I, 11, 27, 22, slam ? 8 : 5); for (let k = 0; k < 6; k++) bR(x, BUM.BN, 12 + k * 4, 27, 2, slam ? 3 : 2); // teeth
    bR(x, BUM.I, 8, 34, 28, 6); bR(x, BUM.DK, 9, 35, 26, 4); bCorr(x, 9, 35, 26, 4, '#4a3218'); // cardboard collar
    bR(x, BUM.I, 2, 30, 6, 10); bR(x, BUM.DK2, 3, 31, 4, 8); bR(x, BUM.I, 36, 30, 6, 10); bR(x, BUM.DK2, 37, 31, 4, 8); // paper-hinge claws
    for (const [a, b] of [[7, 30], [33, 31], [18, 40]]){ bR(x, BUM.HO, a, b, 3, 3); bR(x, BUM.HO2, a + 1, b + 3, 1, 2); } // honey drips
    bTape(x, 30, 4, 6, 3);
  };
  B.hive = { idle: bInk(bCv(44, 44, x => hive(x, 'idle')), 33), slam: bInk(bCv(44, 44, x => hive(x, 'slam')), 34), hurt: bInk(bCv(44, 44, x => hive(x, 'hurt')), 35) };
  B.honey = bInk(bCv(6, 8, x => { bR(x, BUM.HO, 1, 2, 4, 5); bR(x, BUM.HO, 2, 0, 2, 2); bR(x, '#ffe08a', 2, 3, 1, 2); }), 5);
  // Oven Mitt (world pickup): blocks one hit
  B.mitt = bInk(bCv(14, 16, x => { bR(x, BUM.E, 2, 3, 9, 11); bR(x, BUM.E2, 3, 4, 7, 4); bR(x, BUM.E, 9, 6, 4, 4); bR(x, BUM.P, 2, 12, 10, 3); bR(x, '#d8ccb0', 2, 14, 10, 1); for (let k = 0; k < 3; k++) bR(x, BUM.Y, 4 + k * 2, 9, 1, 1); bR(x, BUM.I, 5, 0, 3, 3); bR(x, BUM.T, 5, 1, 1, 1); }), 7);
  return B;
}

// ---------------- decor ----------------
const BUMBO_DECOR = new Set(['bunting', 'jars', 'stagelamp', 'curtain', 'cutout', 'forkrack', 'tvcut', 'drainpipe', 'clock5', 'puppetsign', 'combs']);
function drawBumboDecor(g, d, X, Y, frame){
  const wob = Math.sin(frame * 0.05 + d.tx) * 0.5;
  switch (d.kind){
    case 'bunting': { // pennant string (paper triangles) across d.w tiles
      const w = (d.w || 8) * 16, cols = [BUM.Y, BUM.JAM, BUM.P, BUM.E2, '#7ec0c8'];
      g.strokeStyle = BUM.I; g.lineWidth = 1; g.beginPath(); g.moveTo(X, Y); g.quadraticCurveTo(X + w / 2, Y + 10, X + w, Y); g.stroke();
      for (let i = 6; i < w - 4; i += 12){ const t = i / w, yy = Y + 10 * 4 * t * (1 - t) * 0.5 + Math.sin(frame * 0.06 + i) * 0.6; g.fillStyle = BUM.I; g.beginPath(); g.moveTo(X + i - 4, yy); g.lineTo(X + i + 4, yy); g.lineTo(X + i, yy + 8); g.fill(); g.fillStyle = cols[(i / 12 | 0) % 5]; g.beginPath(); g.moveTo(X + i - 3, yy + 1); g.lineTo(X + i + 3, yy + 1); g.lineTo(X + i, yy + 6); g.fill(); }
      break; }
    case 'jars': { // a shelf of jars: grape jam (with seeds), butter, honey, crumbs
      g.fillStyle = BUM.I; g.fillRect(X - 1, Y - 2, 60, 5); g.fillStyle = BUM.DK2; g.fillRect(X, Y - 1, 58, 3);
      const cs = [[BUM.JAM, BUM.JAM3], [BUM.BU, '#fff3a8'], [BUM.HO, '#ffe08a'], [BUM.K, BUM.K2]];
      for (let i = 0; i < 4; i++){ const jx = X + 2 + i * 14; g.fillStyle = BUM.I; g.fillRect(jx - 1, Y - 18, 12, 16); g.fillStyle = 'rgba(243,234,212,0.55)'; g.fillRect(jx, Y - 17, 10, 14); g.fillStyle = cs[i][0]; g.fillRect(jx + 1, Y - 12, 8, 9); g.fillStyle = cs[i][1]; g.fillRect(jx + 2, Y - 12, 2, 4); g.fillStyle = BUM.E; g.fillRect(jx, Y - 20, 10, 3);
        if (i === 0){ g.fillStyle = BUM.P; g.fillRect(jx + 5, Y - 9, 1, 1); g.fillRect(jx + 3, Y - 6, 1, 1); g.fillRect(jx + 7, Y - 5, 1, 1); } }
      break; }
    case 'stagelamp': { // spotlight can on a bracket, with a warm cone
      g.fillStyle = BUM.I; g.fillRect(X + 6, Y - 4, 2, 8); g.fillRect(X, Y + 4, 14, 10); g.fillStyle = '#3a3430'; g.fillRect(X + 1, Y + 5, 12, 8); g.fillStyle = BUM.Y; g.fillRect(X + 3, Y + 13, 8, 2);
      g.globalAlpha = 0.07; g.fillStyle = '#fff3c8'; g.beginPath(); g.moveTo(X + 3, Y + 14); g.lineTo(X - 30, 208); g.lineTo(X + 44, 208); g.lineTo(X + 11, Y + 14); g.fill(); g.globalAlpha = 1;
      break; }
    case 'curtain': { // red stage curtain hanging from the top, d.side 'l'|'r'
      const w = 30; g.fillStyle = BUM.I; g.fillRect(X - 1, 0, w + 2, Y + 2); for (let i = 0; i < w; i += 6){ g.fillStyle = (i / 6) % 2 ? BUM.CU : BUM.CU2; g.fillRect(X + i, 0, 6, Y + Math.round(Math.sin(i + frame * 0.03) * 1.5)); }
      g.fillStyle = BUM.Y; g.fillRect(X, Y - 26, w, 3); break; }
    case 'cutout': { // a cardboard cutout (spooky tree / ghost / toaster) propped on a stand, wobbling on its hinge
      g.save(); g.translate(X + 16, Y); g.rotate(wob * 0.06);
      g.fillStyle = BUM.I; g.fillRect(-2, -10, 4, 10); g.fillStyle = BUM.DK; g.fillRect(-1, -10, 2, 10);
      const v = d.v || 0;
      if (v === 0){ g.fillStyle = BUM.I; g.fillRect(-15, -54, 30, 44); g.fillStyle = '#4e5a3a'; g.fillRect(-14, -53, 28, 30); g.fillStyle = BUM.DK; g.fillRect(-3, -24, 6, 14); for (const [a, b] of [[-8, -44], [3, -38], [-4, -32]]){ g.fillStyle = BUM.I; g.fillRect(a, b, 3, 3); } } // spooky tree
      else if (v === 1){ g.fillStyle = BUM.I; g.fillRect(-11, -42, 22, 32); g.fillStyle = BUM.P; g.fillRect(-10, -41, 20, 30); g.fillStyle = BUM.I; g.fillRect(-6, -34, 4, 5); g.fillRect(2, -34, 4, 5); g.fillRect(-3, -24, 6, 3); } // ghost
      else { g.fillStyle = BUM.I; g.fillRect(-14, -36, 28, 26); g.fillStyle = BUM.CH2; g.fillRect(-13, -35, 26, 24); g.fillStyle = BUM.I; g.fillRect(-9, -36, 6, 3); g.fillRect(3, -36, 6, 3); g.fillStyle = BUM.E2; g.fillRect(-8, -26, 3, 3); g.fillRect(5, -26, 3, 3); } // grumpy toaster
      g.fillStyle = 'rgba(220,200,136,0.75)'; g.fillRect(-6, -12, 12, 3); g.restore(); break; }
    case 'forkrack': { // giant cardboard forks and knives stuck in the floor like crypt railings
      for (let i = 0; i < (d.n || 3); i++){ const fx = X + i * 14; g.fillStyle = BUM.I; g.fillRect(fx - 1, Y - 46, 8, 46); g.fillStyle = BUM.CH2; g.fillRect(fx, Y - 45, 6, 45); g.fillStyle = BUM.CH3; g.fillRect(fx, Y - 45, 1, 45);
        if (i % 2 === 0){ g.fillStyle = BUM.I; g.fillRect(fx - 3, Y - 56, 12, 12); g.fillStyle = BUM.CH2; for (let k = 0; k < 3; k++) g.fillRect(fx - 2 + k * 4, Y - 55, 2, 11); } else { g.fillStyle = BUM.I; g.fillRect(fx - 1, Y - 58, 8, 14); g.fillStyle = BUM.CH3; g.fillRect(fx, Y - 57, 6, 12); } }
      break; }
    case 'tvcut': { // little cardboard TV with live static
      g.fillStyle = BUM.I; g.fillRect(X - 1, Y - 25, 30, 25); g.fillStyle = BUM.K; g.fillRect(X, Y - 24, 28, 23); g.fillStyle = BUM.ST; g.fillRect(X + 3, Y - 21, 18, 14);
      const r = rng(frame * 7 + d.tx); for (let j = 0; j < 14; j += 2) for (let i = 0; i < 18; i += 2){ const v = r(); g.fillStyle = v < 0.5 ? '#2a2620' : v < 0.85 ? '#8a8270' : BUM.P; g.fillRect(X + 3 + i, Y - 21 + j, 2, 2); }
      g.fillStyle = BUM.I; g.fillRect(X + 23, Y - 20, 3, 3); g.fillRect(X + 23, Y - 14, 3, 3); g.fillRect(X + 8, Y - 32, 1, 8); g.fillRect(X + 18, Y - 32, 1, 8); break; }
    case 'drainpipe': { // paper-tube drain pipe dripping butter
      g.fillStyle = BUM.I; g.fillRect(X + 4, 0, 12, Y + 2); g.fillStyle = '#8a8270'; g.fillRect(X + 5, 0, 10, Y); g.fillStyle = '#b8b0a0'; g.fillRect(X + 6, 0, 2, Y); bTapeG(g, X + 3, Y - 30, 14, 3);
      const k = (frame + d.tx * 9) % 60; g.fillStyle = BUM.BU; g.fillRect(X + 9, Y + 2 + k * 1.6, 2, 3); break; }
    case 'clock5': { // tick-tock wall clock cutout (boss room)
      g.fillStyle = BUM.I; g.beginPath(); g.arc(X + 10, Y + 10, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = BUM.P; g.beginPath(); g.arc(X + 10, Y + 10, 9, 0, Math.PI * 2); g.fill();
      const a = ((frame >> 5) % 12) * Math.PI / 6; g.strokeStyle = BUM.I; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X + 10, Y + 10); g.lineTo(X + 10 + Math.sin(a) * 7, Y + 10 - Math.cos(a) * 7); g.moveTo(X + 10, Y + 10); g.lineTo(X + 10, Y + 5); g.stroke();
      g.fillStyle = BUM.I; g.fillRect(X + 9, Y + 21, 2, 8); g.fillStyle = BUM.Y; g.fillRect(X + 6 + Math.round(Math.sin(frame * 0.1) * 4), Y + 28, 6, 4); break; }
    case 'puppetsign': { // hand-lettered cardboard sign on two strings
      const w = d.w || 72; g.strokeStyle = BUM.I; g.lineWidth = 1; g.beginPath(); g.moveTo(X + 8, 0); g.lineTo(X + 8, Y); g.moveTo(X + w - 8, 0); g.lineTo(X + w - 8, Y); g.stroke();
      g.save(); g.translate(X + w / 2, Y); g.rotate(wob * 0.04); g.fillStyle = BUM.I; g.fillRect(-w / 2 - 1, -1, w + 2, 16); g.fillStyle = BUM.K2; g.fillRect(-w / 2, 0, w, 14); drawTiny(g, d.text || 'BUMBO', -w / 2 + 4, 5, BUM.I); g.restore(); break; }
    case 'combs': { // honeycomb panels (boss arena)
      for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++){ const cx = X + i * 12 + (j % 2) * 6, cy = Y + j * 10; g.fillStyle = BUM.I; g.fillRect(cx, cy, 11, 9); g.fillStyle = (i + j) % 3 ? BUM.HO2 : BUM.HO; g.fillRect(cx + 1, cy + 1, 9, 7); }
      if ((frame >> 4) % 3 === 0){ g.fillStyle = BUM.HO; g.fillRect(X + 20, Y + 30 + ((frame >> 2) % 10), 2, 3); } break; }
  }
}
function bTapeG(g, X, Y, w, h){ g.globalAlpha = 0.75; g.fillStyle = BUM.T; g.fillRect(X, Y, w, h); g.globalAlpha = 1; }
// the level-end giant static TV (you walk into its screen)
function drawBumboTV(g, bx, by, door, frame, onAir){
  g.fillStyle = BUM.I; g.fillRect(bx - 2, by - 2, 100, 84); g.fillStyle = BUM.K; g.fillRect(bx, by, 96, 80); bCorrG(g, bx, by, 96, 4);
  g.fillStyle = BUM.DK; g.fillRect(bx, by + 76, 96, 4); g.fillStyle = BUM.I; g.fillRect(bx + 20, by - 26, 2, 24); g.fillRect(bx + 74, by - 26, 2, 24); g.fillRect(bx + 18, by - 28, 6, 3); g.fillRect(bx + 72, by - 28, 6, 3);
  const sx = door - 14, sw = 44; g.fillStyle = BUM.I; g.fillRect(sx - 3, by + 10, sw + 6, 70); // screen bezel
  const r = rng((frame >> 1) * 11 + bx); for (let j = 0; j < 66; j += 3) for (let i = 0; i < sw; i += 3){ const v = r(); g.fillStyle = onAir ? (v < 0.5 ? '#3a2a10' : BUM.Y) : v < 0.45 ? '#2a2620' : v < 0.8 ? '#8a8270' : BUM.P; g.fillRect(sx + i, by + 12 + j, 3, 3); }
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(sx, by + 12 + ((frame >> 1) % 66), sw, 2);
  g.fillStyle = BUM.I; g.fillRect(bx + 83, by + 18, 10, 10); g.fillStyle = BUM.E2; g.fillRect(bx + 85, by + 20, 6, 6); g.fillStyle = BUM.I; g.fillRect(bx + 83, by + 34, 10, 10); g.fillStyle = BUM.Y; g.fillRect(bx + 85, by + 36, 6, 6);
  bTapeG(g, bx + 4, by + 6, 10, 4); bTapeG(g, bx + 82, by + 66, 10, 4); drawTiny(g, 'NEXT', bx + 8, by + 40, BUM.I); drawTiny(g, 'ROOM', bx + 8, by + 48, BUM.I); drawTiny(g, onAir ? 'ON AIR' : 'TV', bx + 6, by + 20, onAir ? BUM.E : BUM.DK);
}
function bCorrG(g, X, Y, w, h){ for (let i = 0; i < w; i += 2){ g.fillStyle = BUM.DK2; g.fillRect(X + i, Y + ((i >> 1) % 2), 1, h - 1); } }

// ---------------- parallax backgrounds: a puppet stage ----------------
function bumboLayers(kind, L, layer){
  const backdrop = (x, r, top, bot) => { const gr = x.createLinearGradient(0, 0, 0, 240); gr.addColorStop(0, top); gr.addColorStop(1, bot); x.fillStyle = gr; x.fillRect(0, 0, 512, 240);
    for (let i = 0; i < 120; i++){ x.fillStyle = r() < 0.5 ? 'rgba(243,234,212,0.04)' : 'rgba(16,14,12,0.12)'; x.fillRect((r() * 512) | 0, (r() * 240) | 0, 1 + ((r() * 6) | 0), 1); } }; // painted-board grain
  const proscenium = (x) => { x.fillStyle = BUM.I; x.fillRect(0, 0, 512, 22); x.fillStyle = BUM.CU; x.fillRect(0, 0, 512, 19); for (let i = 0; i < 512; i += 16){ x.fillStyle = BUM.CU2; x.fillRect(i, 0, 8, 19); x.fillStyle = BUM.CU; x.beginPath(); x.arc(i + 8, 19, 8, 0, Math.PI); x.fill(); } x.fillStyle = BUM.Y; x.fillRect(0, 2, 512, 1); };
  if (kind === 'hatch'){ // haunted toaster-kitchen underworld: painted cardboard flats of ovens, shelves, crooked chimneys
    L.far = layer((x, r) => { backdrop(x, r, '#2a2018', '#100e0c');
      for (let i = 0; i < 512; i += 64){ const h = 70 + ((r() * 50) | 0); x.fillStyle = BUM.I; x.fillRect(i + 4, 210 - h, 52, h); x.fillStyle = '#3a2c1e'; x.fillRect(i + 6, 212 - h, 48, h - 4); x.fillStyle = '#5a4630'; x.fillRect(i + 14, 230 - h, 30, 18); x.fillStyle = (r() < 0.5) ? '#c45e28' : '#6a3a18'; x.fillRect(i + 18, 234 - h, 22, 10); } // painted ovens
      for (let i = 0; i < 6; i++){ const cx = (r() * 500) | 0; x.fillStyle = 'rgba(243,234,212,0.08)'; x.beginPath(); x.arc(cx, 40 + ((r() * 30) | 0), 14, 0, Math.PI * 2); x.fill(); } proscenium(x); });
    L.mid = layer((x, r) => { for (const sx of [30, 210, 380]){ x.fillStyle = BUM.I; x.fillRect(sx, 120, 90, 4); x.fillStyle = BUM.DK2; x.fillRect(sx + 1, 121, 88, 2); for (let k = 0; k < 5; k++){ x.fillStyle = BUM.I; x.fillRect(sx + 4 + k * 17, 104, 13, 16); x.fillStyle = [BUM.JAM, BUM.BU, BUM.HO, BUM.K, BUM.P][k]; x.fillRect(sx + 5 + k * 17, 108, 11, 11); } }
      x.strokeStyle = BUM.I; x.lineWidth = 1; for (let i = 0; i < 512; i += 128){ x.beginPath(); x.moveTo(i, 30); x.quadraticCurveTo(i + 64, 44, i + 128, 30); x.stroke(); for (let k = 8; k < 128; k += 12){ x.fillStyle = [BUM.Y, BUM.JAM, BUM.P, BUM.E2][(k / 12 | 0) % 4]; x.beginPath(); x.moveTo(i + k - 3, 33 + 7 * Math.sin(k / 128 * Math.PI)); x.lineTo(i + k + 3, 33 + 7 * Math.sin(k / 128 * Math.PI)); x.lineTo(i + k, 40 + 7 * Math.sin(k / 128 * Math.PI)); x.fill(); } } });
  } else if (kind === 'drain'){ // the butter drain: paper-tube pipes, butter drips, a wavy painted sewer
    L.far = layer((x, r) => { backdrop(x, r, '#1e1a12', '#0c0a08');
      for (let i = 0; i < 512; i += 96){ x.fillStyle = BUM.I; x.fillRect(i + 10, 30, 22, 190); x.fillStyle = '#6a6250'; x.fillRect(i + 12, 30, 18, 190); x.fillStyle = '#8a8270'; x.fillRect(i + 14, 30, 3, 190); x.fillStyle = BUM.I; x.fillRect(i + 8, 90, 26, 6); x.fillRect(i + 8, 160, 26, 6); }
      for (let i = 0; i < 18; i++){ const dx = (r() * 512) | 0; x.fillStyle = 'rgba(244,211,94,0.18)'; x.fillRect(dx, 30, 2, 20 + ((r() * 90) | 0)); } proscenium(x); });
    L.mid = layer((x, r) => { for (let i = 0; i < 512; i += 64){ x.fillStyle = BUM.I; x.beginPath(); x.arc(i + 32, 190, 26, Math.PI, 0); x.fill(); x.fillStyle = '#2a2418'; x.beginPath(); x.arc(i + 32, 190, 23, Math.PI, 0); x.fill(); x.fillStyle = 'rgba(244,211,94,0.25)'; x.fillRect(i + 12, 180, 40, 10); } });
  } else if (kind === 'cutlery'){ // cutlery crypt: tombstones cut from cereal boxes, giant fork/knife silhouettes, cobweb string
    L.far = layer((x, r) => { backdrop(x, r, '#1a1622', '#0c0a0e');
      for (let i = 0; i < 512; i += 40){ const h = 90 + ((r() * 70) | 0); x.fillStyle = '#2a2632'; x.fillRect(i + 16, 220 - h, 8, h); if (r() < 0.5){ for (let k = 0; k < 3; k++) x.fillRect(i + 12 + k * 6, 210 - h, 3, 14); } else { x.beginPath(); x.ellipse(i + 20, 216 - h, 8, 14, 0, 0, Math.PI * 2); x.fill(); } }
      x.fillStyle = 'rgba(243,234,212,0.10)'; x.beginPath(); x.arc(400, 60, 22, 0, Math.PI * 2); x.fill(); proscenium(x); });
    L.mid = layer((x, r) => { for (let i = 0; i < 512; i += 72){ x.fillStyle = BUM.I; x.fillRect(i + 8, 166, 28, 42); x.beginPath(); x.arc(i + 22, 166, 14, Math.PI, 0); x.fill(); x.fillStyle = r() < 0.5 ? '#8a7a5a' : '#6a5a40'; x.fillRect(i + 10, 168, 24, 40); x.beginPath(); x.arc(i + 22, 167, 12, Math.PI, 0); x.fill(); x.fillStyle = BUM.I; x.fillRect(i + 16, 178, 12, 2); x.fillRect(i + 21, 174, 2, 10); }
      x.strokeStyle = 'rgba(243,234,212,0.25)'; x.lineWidth = 1; for (let i = 0; i < 512; i += 100){ x.beginPath(); x.moveTo(i, 22); x.lineTo(i + 30, 60); x.lineTo(i + 60, 22); x.moveTo(i + 30, 22); x.lineTo(i + 30, 60); x.stroke(); } });
  } else { // chrome: the Chrome Hall / Hive Broadcast — foil-wrapped flats, honeycomb panels, a giant static backdrop TV
    L.far = layer((x, r) => { backdrop(x, r, '#22201c', '#0c0b0a');
      for (let i = 0; i < 512; i += 32){ x.fillStyle = (i / 32) % 2 ? '#3a3e44' : '#2c3036'; x.fillRect(i, 30, 30, 180); x.fillStyle = 'rgba(244,248,251,0.10)'; x.fillRect(i + 2, 30, 2, 180); for (let j = 40; j < 210; j += 14) x.fillRect(i + 4 + ((r() * 20) | 0), j, 6, 1); }
      for (let j = 0; j < 4; j++) for (let i = 0; i < 9; i++){ const cx = 300 + i * 14 + (j % 2) * 7, cy = 60 + j * 12; x.fillStyle = BUM.I; x.fillRect(cx, cy, 13, 11); x.fillStyle = (i + j) % 3 ? '#6a4a08' : '#a86a08'; x.fillRect(cx + 1, cy + 1, 11, 9); } proscenium(x); });
    L.mid = layer((x, r) => { x.fillStyle = BUM.I; x.fillRect(60, 70, 120, 92); x.fillStyle = BUM.K; x.fillRect(62, 72, 116, 88); x.fillStyle = BUM.ST; x.fillRect(70, 80, 84, 70);
      for (let j = 0; j < 70; j += 3) for (let i = 0; i < 84; i += 3){ const v = r(); x.fillStyle = v < 0.5 ? '#24201a' : v < 0.85 ? '#5a5446' : '#8a8270'; x.fillRect(70 + i, 80 + j, 3, 3); } drawTiny(x, 'HIVE TV', 74, 152, BUM.I);
      x.strokeStyle = BUM.I; x.lineWidth = 1; for (let i = 256; i < 512; i += 64){ x.beginPath(); x.moveTo(i, 22); x.lineTo(i, 70 + ((r() * 30) | 0)); x.stroke(); } });
  }
}
// ---------------- post-fx: paper grain, warm stage light, dust motes, vignette ----------------
let bumGrain = null;
function bumboPostFx(g, W, H, frame, spot){
  if (!bumGrain){ bumGrain = bCv(W, H, x => { const r = rng(99); for (let i = 0; i < 2400; i++){ x.fillStyle = r() < 0.5 ? 'rgba(243,234,212,0.05)' : 'rgba(20,16,12,0.08)'; x.fillRect((r() * W) | 0, (r() * H) | 0, 1 + ((r() * 2) | 0), 1); }
    const v = x.createRadialGradient(W / 2, H / 2, 70, W / 2, H / 2, 190); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(16,10,4,0.55)'); x.fillStyle = v; x.fillRect(0, 0, W, H); }); }
  g.drawImage(bumGrain, ((frame >> 3) % 2) ? 1 : 0, 0);
  g.fillStyle = 'rgba(255,200,120,0.05)'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 10; i++){ const t = frame * 0.2 + i * 37; g.fillStyle = 'rgba(243,234,212,0.18)'; g.fillRect(((i * 53 + t * 0.4) % W) | 0, ((i * 29 + Math.sin(t * 0.03) * 20 + 40 + i * 14) % H) | 0, 1, 1); }
  if (spot){ // spotlight: the stage goes dark except one warm circle
    const c = bCv.spotC || (bCv.spotC = mkCanvas(W, H)), x = c.getContext('2d'); x.clearRect(0, 0, W, H); x.fillStyle = 'rgba(8,6,4,' + spot.a + ')'; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'destination-out'; const gr = x.createRadialGradient(spot.x, spot.y, spot.r * 0.6, spot.x, spot.y, spot.r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.beginPath(); x.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2); x.fill(); x.globalCompositeOperation = 'source-over';
    g.drawImage(c, 0, 0); g.globalAlpha = 0.12; g.fillStyle = '#fff3c8'; g.beginPath(); g.moveTo(spot.x - 6, 0); g.lineTo(spot.x - spot.r, spot.y + spot.r * 0.5); g.lineTo(spot.x + spot.r, spot.y + spot.r * 0.5); g.lineTo(spot.x + 6, 0); g.fill(); g.globalAlpha = 1;
  }
}
