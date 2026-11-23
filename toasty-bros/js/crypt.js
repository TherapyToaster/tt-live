// World 6: MR. TOASTY'S CRYPT — original procedural pixel art for a haunted glitch crypt under Toast Town, half tomb and
// half busted server room (lore: lore/crypt.md). Crisp pixels, RGB split, scanlines, CRT glow. Skull portraits, CRTs,
// a gold vending machine (decor only), smoke and static. Dark-funny toast puns. Jam is always grape purple (#b54e8c).
// Palette: ink #0b0a0f, bone #f4f1e8, ash #b9b2a2, toast gold #ffd400, crust #c8862a, burnt #8a5a12, magenta #ff2bd6,
// cyan #00f0ff, alarm red #ff2045, deep crimson #8a0f25. No real brands, no money, no gore.
'use strict';
const CRY = { I: '#0b0a0f', BN: '#f4f1e8', AS: '#b9b2a2', Y: '#ffd400', CR: '#c8862a', BR: '#8a5a12', M: '#ff2bd6', C: '#00f0ff', R: '#ff2045', DR: '#8a0f25',
  JAM: '#b54e8c', JAM2: '#7e2f60', JAM3: '#d97ab2', ST: '#221e2a', ST2: '#36303f', ST3: '#544c60', ST4: '#7a7088',
  Q: '#ffb0e0', Q2: '#ffe4f4', Q3: '#c070a8', SK: '#8a8094', SK2: '#b4aabb', SK3: '#5e566a', BU: '#f4d35e', BU2: '#c8a02a', MG: '#ff6a1a', MG2: '#ffb347' };
function cCv(w, h, fn){ const c = mkCanvas(w, h), x = c.getContext('2d'); fn(x); return c; }
function cR(x, c, a, b, w, h){ x.fillStyle = c; x.fillRect(a, b, w, h); }
function cInk(src){ return typeof pitOutline === 'function' ? pitOutline(src, CRY.I) : src; }
function cRGB(src){ // crisp RGB-split ghost: magenta left, cyan right, then the sprite on top
  const w = src.width, h = src.height, c = mkCanvas(w + 2, h), x = c.getContext('2d');
  const tint = (col) => cCv(w, h, t => { t.drawImage(src, 0, 0); t.globalCompositeOperation = 'source-in'; t.fillStyle = col; t.fillRect(0, 0, w, h); });
  x.globalAlpha = 0.45; x.drawImage(tint(CRY.M), 0, 0); x.drawImage(tint(CRY.C), 2, 0); x.globalAlpha = 1; x.drawImage(src, 1, 0); return c;
}

// ---------------- tiles ----------------
function cryptTiles(ts, th){
  const kind = th.bg;
  const K = kind === 'cryjam' ? { a: '#2c2228', b: '#43333c', c: '#5e4752', top: CRY.CR, top2: '#e0a24a', crack: CRY.JAM }
    : kind === 'cryframe' ? { a: '#141826', b: '#1f2638', c: '#2e3a52', top: CRY.C, top2: '#9af8ff', crack: CRY.M }
    : kind === 'crycore' ? { a: '#1c1414', b: '#2c1e1c', c: '#46302a', top: CRY.MG, top2: CRY.MG2, crack: CRY.MG }
    : { a: CRY.ST, b: CRY.ST2, c: CRY.ST3, top: CRY.AS, top2: CRY.BN, crack: CRY.M };
  const flag = (top, i) => cCv(16, 16, x => {
    cR(x, K.a, 0, 0, 16, 16); cR(x, K.b, 1, 1, 7, 6); cR(x, K.b, 9, 1, 6, 6); cR(x, K.b, 0, 9, 4, 6); cR(x, K.b, 5, 9, 10, 6);
    const r = rng(60 + i * 7); for (let k = 0; k < 6; k++) cR(x, K.c, (r() * 15) | 0, (r() * 15) | 0, 1, 1);
    if (kind === 'cryframe'){ cR(x, '#0a0d16', 0, 7, 16, 1); cR(x, '#0a0d16', 8, 0, 1, 16); if (i % 2) cR(x, i === 1 ? CRY.M : CRY.C, 3, 11, 2, 1); } // server floor panels with an LED
    if (kind === 'crycore' && i % 2 === 0){ cR(x, CRY.MG, 4 + i, 10, 1, 4); cR(x, CRY.MG2, 4 + i, 11, 1, 1); } // magma seam
    if (i === 3) { cR(x, K.crack, 10, 9, 1, 3); cR(x, K.crack, 11, 12, 1, 2); }
    if (top){ cR(x, CRY.I, 0, 0, 16, 1); cR(x, K.top, 0, 1, 16, 2); cR(x, K.top2, 0, 1, 16, 1); cR(x, K.a, 0, 3, 16, 1); cR(x, CRY.I, (i * 5) % 14, 1, 2, 1);
      if (kind === 'cryjam' && i % 2 === 0){ cR(x, CRY.JAM, 3 + i * 2, 3, 3, 2); cR(x, CRY.JAM2, 4 + i * 2, 5, 1, 2); } } // a grape-jam drip off the crust trim
  });
  ts.groundTop = [0, 1, 2, 3].map(i => flag(true, i));
  ts.ground = [0, 1, 2, 3].map(i => cCv(16, 16, x => { x.drawImage(flag(false, i), 0, 0); cR(x, 'rgba(5,4,8,0.35)', 0, 0, 16, 16); }));
  ts.brick = cCv(16, 16, x => { // cracked tomb brick (breakable)
    cR(x, CRY.I, 0, 0, 16, 16); cR(x, K.c, 1, 1, 14, 6); cR(x, K.c, 1, 9, 6, 6); cR(x, K.c, 9, 9, 6, 6); cR(x, K.top2, 1, 1, 14, 1); cR(x, K.top2, 1, 9, 6, 1); cR(x, K.top2, 9, 9, 6, 1);
    cR(x, CRY.I, 6, 2, 1, 3); cR(x, CRY.I, 7, 4, 2, 1); cR(x, K.crack, 12, 11, 1, 2);
  });
  ts.solid = cCv(16, 16, x => { // carved block with an embossed skull
    cR(x, CRY.I, 0, 0, 16, 16); cR(x, K.b, 1, 1, 14, 14); cR(x, K.c, 1, 1, 14, 1); cR(x, K.c, 1, 1, 1, 14); cR(x, K.a, 1, 14, 14, 1);
    cR(x, K.c, 4, 4, 8, 6); cR(x, K.c, 5, 10, 6, 2); cR(x, CRY.I, 5, 6, 2, 2); cR(x, CRY.I, 9, 6, 2, 2); cR(x, CRY.I, 7, 9, 2, 1);
  });
  ts.used = cCv(16, 16, x => { cR(x, CRY.I, 0, 0, 16, 16); cR(x, '#2a2630', 1, 1, 14, 14); cR(x, '#3a3442', 2, 2, 12, 9); cR(x, '#15131a', 3, 3, 10, 7); });
  ts.crt = [0, 1, 2, 3].map(f => cCv(16, 16, x => { // "?" block: a little CRT monitor with a glitching "?"
    cR(x, CRY.I, 0, 0, 16, 16); cR(x, '#3c3846', 1, 1, 14, 14); cR(x, '#0e1018', 2, 2, 12, 10); cR(x, '#24202c', 2, 13, 12, 2); cR(x, f % 2 ? CRY.R : CRY.Y, 12, 13, 2, 1);
    const ox = f === 1 ? 1 : f === 3 ? -1 : 0; drawText(x, '?', 5 + ox - 1, 4, CRY.M); drawText(x, '?', 5 + ox + 1, 4, CRY.C); drawText(x, '?', 5 + ox, 4, CRY.Y);
    for (let j = 3; j < 12; j += 2) cR(x, 'rgba(0,0,0,0.35)', 2, j, 12, 1);
  }));
  ts.mimicTell = ts.crt[0];
  ts.plank = cCv(16, 16, x => { cR(x, CRY.I, 0, 0, 16, 5); cR(x, CRY.AS, 0, 1, 16, 2); cR(x, CRY.BN, 0, 1, 16, 1); cR(x, '#7a7466', 0, 3, 16, 1); cR(x, CRY.I, 3, 5, 2, 3); cR(x, CRY.I, 11, 5, 2, 3); }); // bone shelf (one-way)
  ts.stone = cCv(16, 16, x => { // themed solid block: coffin end / server rack / coil block
    cR(x, CRY.I, 0, 0, 16, 16);
    if (kind === 'cryframe'){ cR(x, '#2a3244', 1, 1, 14, 14); for (let j = 2; j < 14; j += 3){ cR(x, '#141a26', 2, j, 12, 2); cR(x, (j >> 1) % 2 ? CRY.C : CRY.M, 11, j, 1, 1); cR(x, CRY.Y, 12, j, 1, 1); } }
    else if (kind === 'crycore'){ cR(x, '#3a2a26', 1, 1, 14, 14); for (let j = 3; j < 14; j += 3) cR(x, CRY.MG, 2, j, 12, 1); cR(x, CRY.MG2, 2, 3, 12, 1); }
    else if (kind === 'cryjam'){ cR(x, '#c8c4d0', 1, 1, 14, 14); cR(x, '#8a8696', 1, 12, 14, 3); cR(x, '#101016', 3, 2, 4, 1); cR(x, '#101016', 9, 2, 4, 1); cR(x, CRY.R, 12, 9, 2, 2); } // a toaster block
    else { cR(x, '#4a3a2c', 1, 1, 14, 14); cR(x, '#6a5440', 2, 2, 12, 2); cR(x, CRY.AS, 7, 5, 2, 8); cR(x, CRY.AS, 4, 7, 8, 2); } // coffin end with a cross plate
  });
  ts.acid = [0, 1, 2, 3].map(f => cCv(16, 16, x => { // hazard pool: grape jam (kitchen) or magma (core) or static goo
    const a = kind === 'crycore' ? [CRY.MG, CRY.MG2, '#a8320c'] : kind === 'cryjam' ? [CRY.JAM, CRY.JAM3, CRY.JAM2] : [CRY.M, '#ff9cec', '#7a1468'];
    cR(x, CRY.I, 0, 0, 16, 16); cR(x, a[2], 0, 5, 16, 11); cR(x, a[0], 0, 5, 16, 3); cR(x, a[1], 0, 5, 16, 1);
    const r = rng(80 + f); for (let i = 0; i < 4; i++){ const bx = (r() * 13) | 0, by = 8 + ((r() * 6) | 0); cR(x, a[1], bx, by, 2, 1); }
    cR(x, a[1], (f * 4) % 14, 4 + (f % 2), 3, 1);
  }));
  ts.crumble = cCv(16, 16, x => { cR(x, CRY.I, 0, 0, 16, 16); cR(x, K.b, 1, 1, 14, 14); cR(x, CRY.I, 4, 2, 1, 6); cR(x, CRY.I, 5, 8, 4, 1); cR(x, CRY.I, 10, 6, 1, 7); });
  // RGB switch blocks (6-3): magenta walls are solid until the switch is hit; cyan bridges are solid while the timer runs
  const rgbBlk = (col, hi, lo, on) => cCv(16, 16, x => {
    if (on){ cR(x, CRY.I, 0, 0, 16, 16); cR(x, col, 1, 1, 14, 14); cR(x, hi, 1, 1, 14, 2); cR(x, lo, 1, 13, 14, 2); cR(x, CRY.I, 4, 4, 8, 8); cR(x, hi, 5, 5, 6, 6); cR(x, col, 6, 6, 4, 4); }
    else { x.globalAlpha = 0.85; x.strokeStyle = col; x.setLineDash([2, 2]); x.lineWidth = 1; x.strokeRect(1.5, 1.5, 13, 13); x.setLineDash([]); cR(x, col, 7, 7, 2, 2); x.globalAlpha = 1; }
  });
  ts.rgbM = [rgbBlk(CRY.M, '#ff9cec', '#a8128c', true), rgbBlk(CRY.M, '#ff9cec', '#a8128c', false)];
  ts.rgbC = [rgbBlk(CRY.C, '#b4fcff', '#0890a0', true), rgbBlk(CRY.C, '#b4fcff', '#0890a0', false)];
  ts.rgbSwitch = [0, 1].map(s => cCv(16, 16, x => { // a pedestal with a big RGB button: magenta = ready, cyan = running
    cR(x, CRY.I, 1, 6, 14, 10); cR(x, '#3c3846', 2, 7, 12, 8); cR(x, '#24202c', 2, 13, 12, 2); cR(x, CRY.I, 3, 1, 10, 7); cR(x, s ? CRY.C : CRY.M, 4, 2, 8, 5); cR(x, s ? '#b4fcff' : '#ff9cec', 5, 2, 4, 2);
    drawTiny(x, 'RGB', 3, 9, CRY.Y);
  }));
  ts.crypt = true;
  return ts;
}

// ---------------- sprites ----------------
function buildCryptSprites(){
  const B = {};
  const pair = (w, h, fn) => { const a = [cInk(cCv(w, h, x => fn(x, 0))), cInk(cCv(w, h, x => fn(x, 1)))]; return { R: a, L: a.map(flipH) }; };
  // Rage Toaster (walker): a chrome toaster with angry brows; charges and pops toast at walls
  const toaster = (x, f, mad) => {
    cR(x, '#8e96a6', 1, 3, 14, 10); cR(x, '#cfd6e2', 2, 3, 12, 2); cR(x, '#5c6474', 1, 11, 14, 2); cR(x, CRY.I, 3, 2, 4, 1); cR(x, CRY.I, 9, 2, 4, 1); // slots
    cR(x, CRY.CR, 4, mad ? 0 : 1, 2, 2); cR(x, CRY.CR, 10, mad ? 0 : 1, 2, 2); // toast peeking out
    cR(x, CRY.I, 3, 6, 4, 1); cR(x, CRY.I, 9, 6, 4, 1); cR(x, CRY.I, 5, 5, 2, 1); cR(x, CRY.I, 9, 5, 2, 1); // furious brows
    cR(x, mad ? CRY.R : CRY.Y, 4, 7, 2, 2); cR(x, mad ? CRY.R : CRY.Y, 10, 7, 2, 2); cR(x, CRY.I, 6, 10, 4, 1); cR(x, CRY.R, 14, 8, 2, 2); // lever knob
    cR(x, CRY.I, f ? 2 : 3, 13, 3, 1); cR(x, CRY.I, f ? 11 : 10, 13, 3, 1);
  };
  B.rtoast = pair(16, 14, (x, f) => toaster(x, f, false));
  B.rtoastMad = pair(16, 14, (x, f) => toaster(x, f, true));
  B.toastShot = cInk(cCv(8, 7, x => { cR(x, CRY.CR, 1, 1, 6, 5); cR(x, '#e0a24a', 2, 2, 4, 3); cR(x, CRY.BR, 1, 1, 6, 1); }));
  // Burnt End: a charred crust chunk that splits into crumbs
  B.bend = pair(14, 12, (x, f) => { cR(x, '#3a2414', 1, 2 + f, 12, 9 - f); cR(x, CRY.BR, 2, 2 + f, 10, 2); cR(x, '#1a0e08', 3, 7, 8, 3); cR(x, CRY.MG, 3, 5 + f, 2, 1); cR(x, CRY.MG, 9, 5 + f, 2, 1); cR(x, CRY.MG2, 6, 9, 2, 1); });
  B.crumb = pair(7, 6, (x, f) => { cR(x, CRY.BR, 1, 1 + f, 5, 4 - f); cR(x, CRY.CR, 2, 1 + f, 2, 1); cR(x, CRY.MG2, 2, 3, 1, 1); cR(x, CRY.MG2, 4, 3, 1, 1); });
  // Butter Blob: slow, leaves a slippery trail
  B.bblob = pair(16, 11, (x, f) => { cR(x, CRY.BU2, 1, 4 - f, 14, 7 + f); cR(x, CRY.BU, 2, 3 - f, 12, 6 + f); cR(x, '#fff3a8', 3, 3 - f, 5, 2); cR(x, CRY.I, 4, 5, 2, 2); cR(x, CRY.I, 10, 5, 2, 2); cR(x, CRY.I, 6, 8, 4, 1); });
  // Static Skull: floats, static-blinks, fires a 3-shot RGB burst
  const sskull = (x, f, blink) => { cR(x, CRY.BN, 2, 1, 12, 10); cR(x, CRY.AS, 2, 9, 12, 2); cR(x, CRY.BN, 4, 11, 8, 3); cR(x, CRY.I, 4, 4, 3, 3); cR(x, CRY.I, 9, 4, 3, 3);
    cR(x, f ? CRY.M : CRY.C, 5, 5, 1, 1); cR(x, f ? CRY.C : CRY.M, 10, 5, 1, 1); cR(x, CRY.I, 7, 8, 2, 1); for (let k = 0; k < 4; k++) cR(x, CRY.I, 5 + k * 2, 12, 1, 2);
    if (blink){ const r = rng(5 + f); for (let i = 0; i < 40; i++) cR(x, r() < 0.5 ? CRY.M : CRY.C, (r() * 16) | 0, (r() * 14) | 0, 1, 1); } };
  B.sskull = pair(16, 14, (x, f) => sskull(x, f, false));
  B.sskullBlink = pair(16, 14, (x, f) => sskull(x, f, true));
  B.rgbShot = [CRY.R, '#3aff6a', CRY.C].map(c => cCv(6, 6, x => { cR(x, CRY.I, 0, 1, 6, 4); cR(x, CRY.I, 1, 0, 4, 6); cR(x, c, 1, 1, 4, 4); cR(x, '#ffffff', 2, 2, 1, 1); }));
  // Glitchling: a teleporting skull grunt
  B.glitchl = pair(12, 12, (x, f) => { cR(x, CRY.SK2, 1, 1, 10, 8); cR(x, CRY.SK, 1, 7, 10, 2); cR(x, CRY.SK2, 3, 9, 6, 2); cR(x, CRY.I, 3, 3, 2, 3); cR(x, CRY.I, 7, 3, 2, 3); cR(x, CRY.M, 3, 4, 1, 1); cR(x, CRY.C, 8, 4, 1, 1); cR(x, CRY.I, f ? 2 : 3, 11, 2, 1); cR(x, CRY.I, f ? 8 : 7, 11, 2, 1); });
  // Fuse Bun: a bun with a fuse; lights up and blows when you get close
  const bun = (x, f, lit) => { cR(x, CRY.CR, 1, 4, 12, 8); cR(x, '#e0a24a', 2, 4, 10, 3); cR(x, CRY.BR, 1, 10, 12, 2); for (let k = 0; k < 3; k++) cR(x, CRY.BN, 3 + k * 3, 5, 1, 1);
    cR(x, CRY.I, 4, 7, 2, 2); cR(x, CRY.I, 8, 7, 2, 2); cR(x, CRY.I, 6, 2, 1, 2); cR(x, CRY.I, 7, 1, 1, 1); if (lit){ cR(x, CRY.Y, 7, 0, 2, 1); cR(x, CRY.R, 8, 0, 1, 1); } cR(x, CRY.I, f ? 2 : 3, 12, 3, 1); cR(x, CRY.I, f ? 9 : 8, 12, 3, 1); };
  B.fbun = pair(14, 13, (x, f) => bun(x, f, false));
  B.fbunLit = pair(14, 13, (x, f) => bun(x, f, true));
  // Quartz shard (boss minion)
  B.shard = pair(10, 10, (x, f) => { cR(x, CRY.Q, 3, 1, 4, 8); cR(x, CRY.Q2, 4, 1, 1, 6); cR(x, CRY.Q3, 6, 3, 1, 6); cR(x, CRY.Q, f ? 1 : 0, 4, 3, 3); cR(x, CRY.Q, f ? 6 : 7, 4, 3, 3); cR(x, CRY.I, 4, 4, 1, 1); });
  // THE QUARTZ KING (boss): a weathered stone skull with a cluster crown of pink and clear quartz points. 48x48
  const king = (x, pose, crown) => {
    const slam = pose === 'slam', hurt = pose === 'hurt', st = hurt ? [CRY.SK2, '#d8cfe0', CRY.SK] : [CRY.SK, CRY.SK2, CRY.SK3];
    const pts = [[10, 14, 9], [16, 8, 15], [22, 4, 19], [28, 7, 16], [34, 12, 11], [38, 17, 7]];
    pts.slice(0, crown).forEach(([cx, top, h], i) => { cR(x, CRY.I, cx - 3, top - 1, 8, h + 2); cR(x, i % 2 ? CRY.Q : CRY.Q2, cx - 2, top, 6, h); cR(x, '#ffffff', cx - 1, top + 1, 1, h - 3); cR(x, CRY.Q3, cx + 2, top + 2, 1, h - 2); cR(x, i % 2 ? CRY.Q2 : CRY.Q, cx - 1, top - 1, 4, 2); });
    cR(x, CRY.I, 7, 18, 34, 24); cR(x, st[0], 8, 19, 32, 22); cR(x, st[1], 9, 19, 30, 3); cR(x, st[2], 8, 36, 32, 5); // cranium
    const r = rng(41); for (let i = 0; i < 26; i++) cR(x, r() < 0.5 ? st[2] : st[1], 9 + ((r() * 30) | 0), 21 + ((r() * 18) | 0), 1, 1); // weathering
    cR(x, CRY.I, 12, 25, 9, 8); cR(x, CRY.I, 27, 25, 9, 8); cR(x, slam ? CRY.R : CRY.Q, 15, 28, 3, 2); cR(x, slam ? CRY.R : CRY.Q, 30, 28, 3, 2); // eye sockets
    cR(x, CRY.I, 22, 32, 4, 4); // nose
    cR(x, CRY.I, 13, 39, 22, slam ? 8 : 6); for (let k = 0; k < 6; k++) cR(x, st[1], 14 + k * 3 + (k > 2 ? 1 : 0), 39, 2, slam ? 3 : 2); // jaw + teeth
    cR(x, CRY.I, 3, 34, 6, 10); cR(x, st[2], 4, 35, 4, 8); cR(x, CRY.I, 39, 34, 6, 10); cR(x, st[2], 40, 35, 4, 8); // stone knuckles
    cR(x, CRY.Q, 5, 33, 2, 3); cR(x, CRY.Q2, 41, 33, 2, 3);
  };
  B.king = { idle: cRGB(cInk(cCv(48, 48, x => king(x, 'idle', 6)))), slam: cRGB(cInk(cCv(48, 48, x => king(x, 'slam', 6)))), hurt: cRGB(cInk(cCv(48, 48, x => king(x, 'hurt', 6)))) };
  B.kingCrown = [0, 1, 2, 3, 4, 5, 6].map(n => ({ idle: cRGB(cInk(cCv(48, 48, x => king(x, 'idle', n)))), slam: cRGB(cInk(cCv(48, 48, x => king(x, 'slam', n)))), hurt: cRGB(cInk(cCv(48, 48, x => king(x, 'hurt', n)))) }));
  B.spike = cInk(cCv(12, 28, x => { cR(x, CRY.Q, 3, 4, 6, 24); cR(x, CRY.Q2, 4, 2, 3, 20); cR(x, '#ffffff', 4, 4, 1, 14); cR(x, CRY.Q3, 8, 8, 1, 20); cR(x, CRY.Q, 1, 14, 3, 14); cR(x, CRY.Q2, 9, 18, 3, 10); cR(x, CRY.Q2, 5, 0, 2, 3); }));
  // Hot Sauce (world pickup): a little red bottle with a flame label (no brand)
  B.sauce = cInk(cCv(10, 16, x => { cR(x, CRY.R, 2, 5, 6, 10); cR(x, '#ff7080', 3, 6, 2, 7); cR(x, CRY.DR, 2, 13, 6, 2); cR(x, CRY.BN, 4, 2, 2, 3); cR(x, CRY.Y, 3, 0, 4, 2); cR(x, CRY.Y, 4, 8, 2, 3); cR(x, CRY.MG, 4, 9, 2, 2); }));
  return B;
}

// ---------------- decor ----------------
const CRYPT_DECOR = new Set(['portrait', 'crts', 'vend', 'cobweb', 'candles', 'server', 'cables', 'jamjar', 'coilglow', 'banner6', 'chains']);
function drawCryptDecor(g, d, X, Y, frame){
  switch (d.kind){
    case 'portrait': { // a framed pixel skull portrait (shades, a crown or a party hat), gold frame
      const v = (d.v || 0) % 4; g.fillStyle = CRY.I; g.fillRect(X - 1, Y - 1, 26, 30); g.fillStyle = CRY.Y; g.fillRect(X, Y, 24, 28); g.fillStyle = CRY.BR; g.fillRect(X + 1, Y + 26, 22, 1);
      g.fillStyle = ['#2a1440', '#0e2a34', '#3a1010', '#1a2a14'][v]; g.fillRect(X + 2, Y + 2, 20, 24);
      g.fillStyle = CRY.BN; g.fillRect(X + 6, Y + 8, 12, 10); g.fillRect(X + 8, Y + 18, 8, 4); g.fillStyle = CRY.I; g.fillRect(X + 8, Y + 11, 3, 3); g.fillRect(X + 13, Y + 11, 3, 3); g.fillRect(X + 11, Y + 16, 2, 1);
      if (v === 0){ g.fillStyle = CRY.I; g.fillRect(X + 7, Y + 11, 10, 2); g.fillStyle = CRY.M; g.fillRect(X + 8, Y + 11, 3, 1); g.fillStyle = CRY.C; g.fillRect(X + 13, Y + 11, 3, 1); } // shades
      if (v === 1){ g.fillStyle = CRY.Y; g.fillRect(X + 7, Y + 5, 10, 3); g.fillRect(X + 7, Y + 3, 2, 2); g.fillRect(X + 11, Y + 3, 2, 2); g.fillRect(X + 15, Y + 3, 2, 2); } // crown
      if (v === 2){ g.fillStyle = CRY.M; g.beginPath(); g.moveTo(X + 12, Y + 1); g.lineTo(X + 8, Y + 8); g.lineTo(X + 16, Y + 8); g.fill(); } // party hat
      if (v === 3){ g.fillStyle = CRY.CR; g.fillRect(X + 5, Y + 6, 14, 3); } // toast hat
      if ((frame + d.tx * 9) % 200 < 6){ g.fillStyle = 'rgba(0,240,255,0.5)'; g.fillRect(X + 2, Y + 10 + ((frame >> 1) % 10), 20, 2); } // the eyes follow you (a glitch line)
      break; }
    case 'crts': { // a stack of CRTs flickering static and a skull
      for (let i = 0; i < (d.n || 3); i++){ const cx = X + (i % 2) * 18, cy = Y - 18 - (i >> 1) * 18 + (i === 2 ? 0 : 0); g.fillStyle = CRY.I; g.fillRect(cx - 1, cy - 1, 20, 18); g.fillStyle = '#4a4656'; g.fillRect(cx, cy, 18, 16); g.fillStyle = '#0c0e14'; g.fillRect(cx + 2, cy + 2, 14, 10);
        const r = rng(((frame >> 2) + i * 31 + d.tx) | 0); for (let k = 0; k < 18; k++){ g.fillStyle = r() < 0.4 ? CRY.M : r() < 0.7 ? CRY.C : '#d0d0d0'; g.fillRect(cx + 2 + ((r() * 14) | 0), cy + 2 + ((r() * 10) | 0), 1, 1); }
        if ((frame >> 5) % 3 === i){ g.fillStyle = CRY.BN; g.fillRect(cx + 6, cy + 4, 6, 5); g.fillStyle = CRY.I; g.fillRect(cx + 7, cy + 5, 1, 2); g.fillRect(cx + 10, cy + 5, 1, 2); } }
      break; }
    case 'vend': { // the Toast-O-Matic: a gold vending machine full of toast (decor; it's out of order)
      g.fillStyle = CRY.I; g.fillRect(X - 1, Y - 47, 30, 48); g.fillStyle = CRY.Y; g.fillRect(X, Y - 46, 28, 46); g.fillStyle = CRY.BR; g.fillRect(X, Y - 4, 28, 4);
      g.fillStyle = '#1a1420'; g.fillRect(X + 3, Y - 40, 16, 28); for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++){ g.fillStyle = CRY.CR; g.fillRect(X + 5 + i * 7, Y - 38 + j * 7, 5, 4); g.fillStyle = '#e0a24a'; g.fillRect(X + 6 + i * 7, Y - 37 + j * 7, 3, 2); }
      g.fillStyle = CRY.I; g.fillRect(X + 21, Y - 40, 5, 12); g.fillStyle = (frame >> 4) % 2 ? CRY.R : '#4a0a14'; g.fillRect(X + 22, Y - 39, 3, 2); g.fillStyle = CRY.I; g.fillRect(X + 4, Y - 10, 14, 4);
      drawTiny(g, 'TOAST', X + 2, Y - 45, CRY.I); drawTiny(g, 'O-MATIC', X + 1, Y - 9 + 0, CRY.BR); if ((frame >> 5) % 2) drawTiny(g, 'OUT OF ORDER', X - 6, Y - 54, CRY.R);
      break; }
    case 'cobweb': { g.strokeStyle = 'rgba(244,241,232,0.35)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= 4; i++){ const a = i / 4 * Math.PI / 2; g.moveTo(X, Y); g.lineTo(X + Math.cos(a) * 24, Y + Math.sin(a) * 24); } for (const rr of [8, 15, 22]){ g.moveTo(X + rr, Y); for (let i = 1; i <= 4; i++){ const a = i / 4 * Math.PI / 2; g.lineTo(X + Math.cos(a) * rr, Y + Math.sin(a) * rr); } } g.stroke(); break; }
    case 'candles': { for (let i = 0; i < 3; i++){ const cx = X + i * 7, h = 8 + (i % 2) * 4; g.fillStyle = CRY.I; g.fillRect(cx - 1, Y - h - 1, 5, h + 1); g.fillStyle = CRY.BN; g.fillRect(cx, Y - h, 3, h); const fl = Math.sin(frame * 0.3 + i * 2) > 0 ? 1 : 0; g.fillStyle = CRY.Y; g.fillRect(cx + 1, Y - h - 4 - fl, 1, 3); g.fillStyle = CRY.MG; g.fillRect(cx + 1, Y - h - 2, 1, 1);
        g.globalAlpha = 0.08; g.fillStyle = CRY.Y; g.beginPath(); g.arc(cx + 1, Y - h - 3, 12, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } break; }
    case 'server': { // a server tower with blinking LEDs
      const h = (d.h || 4) * 16; g.fillStyle = CRY.I; g.fillRect(X - 1, Y - h - 1, 22, h + 1); g.fillStyle = '#1e2434'; g.fillRect(X, Y - h, 20, h);
      for (let j = 4; j < h - 2; j += 6){ g.fillStyle = '#10141e'; g.fillRect(X + 2, Y - h + j, 16, 4); const on = ((frame >> 3) + j + d.tx) % 5; g.fillStyle = on === 0 ? CRY.R : on < 3 ? CRY.C : CRY.M; g.fillRect(X + 14, Y - h + j + 1, 2, 2); g.fillStyle = CRY.Y; if (on === 1) g.fillRect(X + 11, Y - h + j + 1, 2, 2); }
      break; }
    case 'cables': { g.strokeStyle = CRY.I; g.lineWidth = 2; for (let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(X + i * 14, 0); g.quadraticCurveTo(X + i * 14 + 20, Y + 30 + i * 6, X + i * 14 + 40, 0); g.stroke(); }
      g.lineWidth = 1; g.strokeStyle = (frame >> 3) % 2 ? CRY.M : CRY.C; g.beginPath(); g.moveTo(X + 6, 0); g.quadraticCurveTo(X + 26, Y + 34, X + 46, 0); g.stroke(); break; }
    case 'jamjar': { // a giant grape-jam jar (with seeds)
      g.fillStyle = CRY.I; g.fillRect(X - 1, Y - 31, 24, 32); g.fillStyle = 'rgba(244,241,232,0.35)'; g.fillRect(X, Y - 30, 22, 30); g.fillStyle = CRY.JAM; g.fillRect(X + 1, Y - 22, 20, 21); g.fillStyle = CRY.JAM3; g.fillRect(X + 3, Y - 22, 3, 12); g.fillStyle = CRY.JAM2; g.fillRect(X + 1, Y - 4, 20, 3);
      g.fillStyle = CRY.BN; for (const [a, b] of [[8, 16], [14, 12], [11, 8], [16, 18]]) g.fillRect(X + a, Y - b, 1, 1); g.fillStyle = CRY.Y; g.fillRect(X - 1, Y - 35, 24, 5); g.fillStyle = CRY.I; g.fillRect(X + 3, Y - 26, 16, 1); drawTiny(g, 'JAM', X + 5, Y - 20, CRY.BN); break; }
    case 'coilglow': { const k = 0.5 + Math.sin(frame * 0.08 + d.tx) * 0.5; g.fillStyle = CRY.I; g.fillRect(X - 1, Y - 30, 18, 30); for (let j = 0; j < 6; j++){ g.fillStyle = k > 0.5 ? CRY.MG : '#a8320c'; g.fillRect(X + 1, Y - 28 + j * 5, 14, 2); } g.globalAlpha = 0.1 + k * 0.12; g.fillStyle = CRY.MG; g.fillRect(X - 10, Y - 40, 36, 40); g.globalAlpha = 1; break; }
    case 'banner6': { const w = d.w || 72; g.fillStyle = CRY.I; g.fillRect(X - 2, Y - 2, w + 4, 16); g.fillStyle = CRY.DR; g.fillRect(X, Y, w, 12); g.fillStyle = CRY.Y; g.fillRect(X, Y, w, 1); g.fillRect(X, Y + 11, w, 1); drawTextC(g, d.text || 'MR. TOASTY', X + w / 2, Y + 3, CRY.Y); break; }
    case 'chains': { g.fillStyle = '#3a3442'; for (let y = 0; y < Y; y += 5){ g.fillRect(X + ((y / 5) % 2 ? 1 : 0), y, 3, 4); } g.fillStyle = CRY.I; g.fillRect(X - 2, Y, 7, 4); break; }
  }
}
// The world exit: Mr. Toasty's mausoleum door (a stone vault with a CRT keystone). Walk in through the door.
function drawCryptGate(g, bx, by, door, frame, onAir){
  g.fillStyle = CRY.I; g.fillRect(bx - 2, by - 14, 100, 96); g.fillStyle = CRY.ST2; g.fillRect(bx, by - 12, 96, 92);
  for (let j = 0; j < 92; j += 8) for (let i = (j / 8) % 2 ? 0 : 8; i < 96; i += 16){ g.fillStyle = CRY.ST3; g.fillRect(bx + i, by - 12 + j, 15, 1); g.fillRect(bx + i, by - 12 + j, 1, 7); }
  g.fillStyle = CRY.I; g.fillRect(bx - 6, by - 20, 108, 8); g.fillStyle = CRY.ST4; g.fillRect(bx - 4, by - 18, 104, 3);
  const sx = door - 14, sw = 40; g.fillStyle = CRY.I; g.fillRect(sx - 3, by + 14, sw + 6, 66); g.beginPath(); g.arc(sx + sw / 2, by + 16, sw / 2 + 3, Math.PI, 0); g.fill();
  const r = rng((frame >> 1) * 7 + bx); for (let j = 0; j < 62; j += 3) for (let i = 0; i < sw; i += 3){ const v = r(); g.fillStyle = onAir ? (v < 0.5 ? '#3a2a10' : CRY.Y) : v < 0.5 ? '#120e18' : v < 0.8 ? '#3a1a4a' : (v < 0.9 ? CRY.M : CRY.C); g.fillRect(sx + i, by + 17 + j, 3, 3); }
  g.fillStyle = CRY.I; g.fillRect(bx + 36, by - 10, 24, 20); g.fillStyle = '#4a4656'; g.fillRect(bx + 37, by - 9, 22, 18); g.fillStyle = '#0c0e14'; g.fillRect(bx + 39, by - 7, 18, 12); // CRT keystone
  g.fillStyle = CRY.BN; g.fillRect(bx + 44, by - 6, 8, 7); g.fillStyle = CRY.I; g.fillRect(bx + 45, by - 4, 2, 2); g.fillRect(bx + 49, by - 4, 2, 2); g.fillStyle = (frame >> 4) % 2 ? CRY.M : CRY.C; g.fillRect(bx + 39, by - 7 + ((frame >> 2) % 12), 18, 1);
  drawTiny(g, 'MR', bx + 8, by + 24, CRY.Y); drawTiny(g, 'TOASTY', bx + 4, by + 32, CRY.Y); drawTiny(g, onAir ? 'OPEN' : 'CRYPT', bx + 72, by + 28, onAir ? CRY.Y : CRY.AS);
  for (const cx of [bx + 10, bx + 80]){ g.fillStyle = CRY.BN; g.fillRect(cx, by + 60, 3, 8); g.fillStyle = Math.sin(frame * 0.3 + cx) > 0 ? CRY.Y : CRY.MG; g.fillRect(cx + 1, by + 56, 1, 3); }
}

// ---------------- backgrounds ----------------
function cryptLayers(kind, L, layer){
  const backdrop = (x, r, top, bot) => { const gr = x.createLinearGradient(0, 0, 0, 240); gr.addColorStop(0, top); gr.addColorStop(1, bot); x.fillStyle = gr; x.fillRect(0, 0, 512, 240);
    for (let i = 0; i < 90; i++){ x.fillStyle = r() < 0.5 ? 'rgba(255,43,214,0.05)' : 'rgba(0,240,255,0.05)'; x.fillRect((r() * 512) | 0, (r() * 240) | 0, 1 + ((r() * 4) | 0), 1); } }; // static specks
  if (kind === 'cryhall'){ // crypt halls: tomb arches, skull niches, candle glow
    L.far = layer((x, r) => { backdrop(x, r, '#120e18', '#06050a');
      for (let i = 0; i < 512; i += 64){ x.fillStyle = '#1c1824'; x.fillRect(i + 6, 40, 52, 180); x.fillStyle = '#0a080e'; x.fillRect(i + 14, 70, 36, 150); x.beginPath(); x.arc(i + 32, 70, 18, Math.PI, 0); x.fill();
        for (let k = 0; k < 3; k++){ x.fillStyle = '#2a2632'; x.fillRect(i + 22, 96 + k * 34, 20, 14); x.fillStyle = '#5a5468'; x.fillRect(i + 27, 99 + k * 34, 10, 8); x.fillStyle = '#0a080e'; x.fillRect(i + 28, 101 + k * 34, 3, 2); x.fillRect(i + 33, 101 + k * 34, 3, 2); } } });
    L.mid = layer((x, r) => { for (let i = 0; i < 512; i += 96){ x.fillStyle = '#16121c'; x.fillRect(i + 10, 120, 18, 100); x.fillStyle = '#26202e'; x.fillRect(i + 8, 116, 22, 6); x.globalAlpha = 0.12; x.fillStyle = CRY.Y; x.beginPath(); x.arc(i + 60, 150, 22, 0, Math.PI * 2); x.fill(); x.globalAlpha = 1; x.fillStyle = CRY.BN; x.fillRect(i + 59, 152, 3, 8); x.fillStyle = CRY.Y; x.fillRect(i + 60, 148, 1, 3); } });
  } else if (kind === 'cryjam'){ // butter + jam kitchen pits: giant toaster silhouettes, jam pipes, drips
    L.far = layer((x, r) => { backdrop(x, r, '#1e1018', '#08050a');
      for (let i = 0; i < 512; i += 128){ x.fillStyle = '#2a1c26'; x.fillRect(i + 10, 90, 100, 120); x.fillStyle = '#140c12'; x.fillRect(i + 26, 84, 26, 10); x.fillRect(i + 68, 84, 26, 10); x.fillStyle = 'rgba(255,106,26,0.18)'; x.fillRect(i + 28, 94, 22, 40); x.fillRect(i + 70, 94, 22, 40); }
      for (let i = 0; i < 512; i += 40){ x.fillStyle = 'rgba(181,78,140,0.35)'; x.fillRect(i + ((r() * 30) | 0), 0, 3, 20 + ((r() * 60) | 0)); } });
    L.mid = layer((x, r) => { for (let i = 0; i < 512; i += 80){ x.fillStyle = '#3a2a32'; x.fillRect(i, 60, 80, 6); x.fillStyle = CRY.JAM2; x.fillRect(i + 10, 66, 6, 30 + ((r() * 40) | 0)); x.fillStyle = CRY.JAM; x.fillRect(i + 11, 66, 3, 24); } });
  } else if (kind === 'cryframe'){ // glitch / RGB mainframe: server towers, a perspective RGB grid, CRT wall
    L.far = layer((x, r) => { backdrop(x, r, '#070a14', '#020308');
      x.strokeStyle = 'rgba(255,43,214,0.35)'; x.lineWidth = 1; for (let k = 0; k < 10; k++){ const y = 150 + k * k * 1.2; x.beginPath(); x.moveTo(0, y); x.lineTo(512, y); x.stroke(); }
      x.strokeStyle = 'rgba(0,240,255,0.3)'; for (let i = -256; i < 768; i += 32){ x.beginPath(); x.moveTo(256 + (i - 256) * 0.2, 150); x.lineTo(i, 240); x.stroke(); }
      for (let i = 0; i < 512; i += 48){ const h = 60 + ((r() * 50) | 0); x.fillStyle = '#121828'; x.fillRect(i + 8, 150 - h, 30, h); for (let j = 6; j < h; j += 7){ x.fillStyle = r() < 0.3 ? CRY.M : r() < 0.6 ? CRY.C : '#2a3448'; x.fillRect(i + 30, 150 - h + j, 3, 2); } } });
    L.mid = layer((x, r) => { for (let i = 0; i < 512; i += 64){ x.fillStyle = '#0c0f18'; x.fillRect(i + 4, 40, 28, 22); x.fillStyle = r() < 0.5 ? 'rgba(255,43,214,0.4)' : 'rgba(0,240,255,0.4)'; x.fillRect(i + 7, 43, 22, 14); } });
  } else { // crycore: magma toaster-core castle: glowing coil pillars, heat haze, chains
    L.far = layer((x, r) => { backdrop(x, r, '#1a0a08', '#3a1006');
      for (let i = 0; i < 512; i += 72){ x.fillStyle = '#120806'; x.fillRect(i + 10, 30, 34, 200); for (let j = 40; j < 220; j += 10){ x.fillStyle = j % 20 ? 'rgba(255,106,26,0.55)' : 'rgba(255,179,71,0.5)'; x.fillRect(i + 14, j, 26, 2); } }
      x.fillStyle = 'rgba(255,106,26,0.25)'; x.fillRect(0, 200, 512, 40); });
    L.mid = layer((x, r) => { for (let i = 0; i < 512; i += 90){ x.fillStyle = '#2a1410'; for (let y = 0; y < 90; y += 6) x.fillRect(i + 20 + ((y / 6) % 2), y, 3, 5); x.fillStyle = '#1a0c0a'; x.fillRect(i + 12, 90, 20, 10); } });
  }
}
// ---------------- post-fx: scanlines, CRT glow, a vignette, rare glitch bands ----------------
let cryScan = null;
function cryptPostFx(g, W, H, frame, kind, buf){
  if (!cryScan){ cryScan = cCv(W, H, x => { x.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < H; y += 2) x.fillRect(0, y, W, 1);
    const v = x.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(6,2,10,0.5)'); x.fillStyle = v; x.fillRect(0, 0, W, H); }); }
  if (buf && (frame >> 1) % 2 === 0){ g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.07; g.drawImage(buf, -1, 0); g.drawImage(buf, 1, 0); g.restore(); } // soft RGB-split glow
  g.fillStyle = kind === 'crycore' ? 'rgba(255,90,20,0.05)' : kind === 'cryjam' ? 'rgba(181,78,140,0.04)' : kind === 'cryframe' ? 'rgba(0,240,255,0.04)' : 'rgba(255,43,214,0.03)'; g.fillRect(0, 0, W, H);
  g.drawImage(cryScan, 0, 0);
  if (frame % 240 < 4){ const y = (frame * 37) % (H - 12); g.globalAlpha = 0.25; g.fillStyle = CRY.M; g.fillRect(0, y, W, 2); g.fillStyle = CRY.C; g.fillRect(0, y + 3, W, 1); g.globalAlpha = 1; }
}
