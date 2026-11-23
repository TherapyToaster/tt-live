// World 2 "Saturday-morning cartoon" art: thick navy outlines, flat bright colors, 3-step shading.
// All original, drawn from code. No real brands or logos anywhere.
'use strict';
const NAVY = '#1b2a4a';
// Draw fills with fn(ctx), then add a 1px navy outline around every opaque pixel (4-neighbours).
function toonSprite(w, h, fn, outline){
  const c = mkCanvas(w, h), x = c.getContext('2d');
  fn(x);
  const id = x.getImageData(0, 0, w, h), d = id.data, out = x.createImageData(w, h);
  out.data.set(d);
  const [r, gg, b] = hexRGB(outline || NAVY);
  const op = (i, j) => i >= 0 && j >= 0 && i < w && j < h && d[(j * w + i) * 4 + 3] > 0;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++){
    if (op(i, j)) continue;
    if (op(i - 1, j) || op(i + 1, j) || op(i, j - 1) || op(i, j + 1)){ const k = (j * w + i) * 4; out.data[k] = r; out.data[k + 1] = gg; out.data[k + 2] = b; out.data[k + 3] = 255; }
  }
  x.putImageData(out, 0, 0); return c;
}
function outlined(src){ return toonSprite(src.width + 2, src.height + 2, x => x.drawImage(src, 1, 1)); }
function R(x, c, a, b, w, h){ x.fillStyle = c; x.fillRect(a, b, w, h); }
// 3x5 plate font (only what plates need) so "THERAPY TOASTER" fits a truck plate
const PLATE_FONT = { T: [7, 2, 2, 2, 2], H: [5, 5, 7, 5, 5], E: [7, 4, 6, 4, 7], R: [6, 5, 6, 5, 5], A: [2, 5, 7, 5, 5], P: [6, 5, 6, 4, 4], Y: [5, 5, 2, 2, 2], O: [2, 5, 5, 5, 2], S: [3, 4, 2, 1, 6], ' ': [0, 0, 0, 0, 0] };
function plateText(x, str, X, Y, col){ x.fillStyle = col; let cx = X; for (const ch of str){ const gl = PLATE_FONT[ch] || PLATE_FONT[' ']; for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (gl[r] & (4 >> c)) x.fillRect(cx + c, Y + r, 1, 1); cx += ch === ' ' ? 2 : 4; } return cx - X; }
function plateWidth(str){ let w = 0; for (const ch of str) w += ch === ' ' ? 2 : 4; return w - 1; }
// the one and only plate text in the game
const PLATE = 'THERAPY TOASTER';
function drawPlate(x, cx, y){ const w = plateWidth(PLATE) + 4; const X = Math.round(cx - w / 2); R(x, NAVY, X - 1, y - 1, w + 2, 9); R(x, '#FFD400', X, y, w, 7); R(x, '#fff3a0', X, y, w, 1); plateText(x, PLATE, X + 2, y + 1, NAVY); return w; }

// ---------------- toon tiles ----------------
function toonGround(x, top, seed, P){
  const r = rng(seed);
  if (P.planks){ // boardwalk deck + pilings over marsh water
    if (top){
      R(x, NAVY, 0, 0, 16, 16); R(x, P.top, 0, 1, 16, 6); R(x, P.topLight, 0, 1, 16, 1); R(x, P.topDark, 0, 6, 16, 1);
      R(x, NAVY, (seed % 2) ? 7 : 3, 1, 1, 6); R(x, NAVY, (seed % 2) ? 15 : 11, 1, 1, 6);
      R(x, P.topDark, 2, 3, 1, 1); R(x, P.topDark, 13, 4, 1, 1);
      R(x, NAVY, 0, 7, 16, 1); R(x, P.base, 0, 8, 16, 3); R(x, P.light, 0, 8, 16, 1); R(x, NAVY, 0, 11, 16, 1);
      R(x, '#2f7fd8', 0, 12, 16, 4); R(x, NAVY, 2, 12, 4, 4); R(x, P.base, 3, 12, 2, 4); R(x, NAVY, 10, 12, 4, 4); R(x, P.dark, 11, 12, 2, 4);
    } else {
      R(x, '#2f7fd8', 0, 0, 16, 16); R(x, '#5aa8f0', 0, (seed % 5) + 2, 5, 1); R(x, '#1f5fb0', 8, (seed % 7) + 6, 6, 1);
      R(x, NAVY, 2, 0, 4, 16); R(x, P.base, 3, 0, 2, 16); R(x, NAVY, 10, 0, 4, 16); R(x, P.dark, 11, 0, 2, 16);
    }
    return;
  }
  if (P.steel){ // bridge deck plates + girder truss
    if (top){
      R(x, NAVY, 0, 0, 16, 16); R(x, P.top, 0, 1, 16, 5); R(x, P.topLight, 0, 1, 16, 1); R(x, P.topDark, 0, 5, 16, 1);
      R(x, NAVY, 0, 6, 16, 1); for (let i = 0; i < 16; i += 4){ R(x, i % 8 ? NAVY : '#FFD400', i, 7, 4, 2); }
      R(x, NAVY, 0, 9, 16, 1); R(x, P.base, 0, 10, 16, 6); R(x, P.light, 0, 10, 16, 1);
      R(x, NAVY, 3, 3, 1, 1); R(x, NAVY, 12, 3, 1, 1); R(x, NAVY, 7, 12, 2, 2);
    } else {
      R(x, P.dark, 0, 0, 16, 16); R(x, P.base, 1, 1, 14, 14);
      for (let i = 0; i < 16; i++){ R(x, NAVY, i, i, 1, 1); R(x, NAVY, 15 - i, i, 1, 1); }
      R(x, NAVY, 0, 0, 16, 1); R(x, NAVY, 0, 15, 16, 1); R(x, P.light, 1, 1, 14, 1);
    }
    return;
  }
  if (top){
    R(x, NAVY, 0, 0, 16, 16);
    R(x, P.top, 0, 1, 16, 4); R(x, P.topLight, 0, 1, 16, 1);
    for (let i = 0; i < 16; i += 4){ R(x, P.topDark, i + 1, 4, 2, 1); R(x, P.top, i + 1, 5, 2, 1); R(x, NAVY, i + 1, 6, 2, 1); R(x, NAVY, i + 3, 5, 2, 1); }
    R(x, NAVY, 0, 5, 1, 1);
    R(x, P.base, 0, 7, 16, 9); for (let i = 0; i < 16; i += 4) R(x, P.base, i + 3, 6, 2, 1);
    R(x, P.light, (seed % 9) + 1, 10, 3, 2); R(x, P.dark, (seed % 7) + 6, 13, 3, 2); R(x, NAVY, (seed % 7) + 6, 15, 3, 1);
  } else {
    R(x, P.base, 0, 0, 16, 16);
    R(x, P.light, r() * 12 | 0, r() * 12 | 0, 3, 2); R(x, P.dark, r() * 12 | 0, r() * 12 | 0, 3, 2);
    const a = r() * 12 | 0, b = r() * 12 | 0; R(x, P.dark, a, b, 4, 3); R(x, NAVY, a, b + 3, 4, 1); R(x, P.light, a, b, 4, 1);
  }
}
function toonBrick(x, P){
  R(x, NAVY, 0, 0, 16, 16);
  const br = (a, b, w, h) => { R(x, P.base, a, b, w, h); R(x, P.light, a, b, w, 1); R(x, P.light, a, b, 1, h); R(x, P.dark, a, b + h - 1, w, 1); R(x, P.dark, a + w - 1, b, 1, h); };
  br(1, 1, 14, 6); br(-7, 9, 14, 6); br(9, 9, 14, 6);
}
function toonSolid(x, P){
  R(x, NAVY, 0, 0, 16, 16);
  R(x, P.base, 1, 1, 14, 14); R(x, P.light, 1, 1, 14, 2); R(x, P.light, 1, 1, 2, 14); R(x, P.dark, 1, 13, 14, 2); R(x, P.dark, 13, 1, 2, 14);
  R(x, '#ffffff', 3, 3, 2, 1); R(x, NAVY, 0, 0, 1, 1); R(x, NAVY, 15, 0, 1, 1);
}
function toonQ(x, f, used){
  R(x, NAVY, 0, 0, 16, 16);
  if (used){ R(x, '#c8a878', 1, 1, 14, 14); R(x, '#e8c898', 1, 1, 14, 1); R(x, '#9a7a50', 1, 14, 14, 1); [[3, 3], [12, 3], [3, 12], [12, 12]].forEach(([a, b]) => R(x, NAVY, a, b, 1, 1)); return; }
  const base = f === 3 ? '#ffe680' : '#FFD400';
  R(x, base, 1, 1, 14, 14); R(x, '#fff3a0', 1, 1, 14, 2); R(x, '#fff3a0', 1, 1, 2, 14); R(x, '#d8a800', 1, 13, 14, 2); R(x, '#d8a800', 13, 1, 2, 14);
  const gl = FONT['?']; for (let rr = 0; rr < 7; rr++) for (let cc = 0; cc < 5; cc++) if (gl[rr] & (16 >> cc)){ R(x, '#d8a800', 6 + cc, 5 + rr, 1, 1); R(x, NAVY, 5 + cc, 4 + rr, 1, 1); }
  [[3, 3], [12, 3], [3, 12], [12, 12]].forEach(([a, b]) => R(x, NAVY, a, b, 1, 1));
}
function toonPlank(x, crumble, P){
  const top = crumble ? '#f0a860' : P.top, lt = crumble ? '#ffd090' : P.topLight, dk = crumble ? '#b86a30' : P.topDark;
  R(x, NAVY, 0, 0, 16, 8); R(x, top, 0, 1, 16, 5); R(x, lt, 0, 1, 16, 1); R(x, dk, 0, 5, 16, 1);
  R(x, NAVY, 7, 1, 1, 5); R(x, '#d8e0ec', 3, 3, 1, 1); R(x, '#d8e0ec', 12, 3, 1, 1);
  if (crumble){ R(x, NAVY, 3, 2, 1, 1); R(x, NAVY, 4, 3, 1, 1); R(x, NAVY, 5, 4, 1, 1); R(x, NAVY, 11, 1, 1, 1); R(x, NAVY, 10, 2, 1, 2); R(x, NAVY, 13, 4, 1, 1); }
  R(x, NAVY, 3, 8, 2, 3); R(x, NAVY, 11, 8, 2, 3);
}
function toonStone(x, grave){
  if (grave){ // cartoon headstone
    R(x, NAVY, 2, 1, 12, 15); R(x, NAVY, 1, 3, 14, 13);
    R(x, '#b4a8d0', 3, 2, 10, 14); R(x, '#b4a8d0', 2, 4, 12, 12); R(x, '#dcd4f0', 3, 2, 10, 1); R(x, '#dcd4f0', 2, 4, 1, 11);
    R(x, '#7e70a0', 13, 4, 1, 11); R(x, '#7e70a0', 2, 14, 12, 1);
    R(x, NAVY, 7, 5, 2, 6); R(x, NAVY, 5, 7, 6, 2); // a plus mark
    R(x, '#5ac85a', 1, 15, 14, 1);
  } else { // crushed junk cube (generic, no brand)
    R(x, NAVY, 0, 0, 16, 16); R(x, '#4a8ad8', 1, 1, 14, 6); R(x, '#e86a4a', 1, 8, 14, 7);
    R(x, '#8ac0ff', 1, 1, 14, 1); R(x, '#ff9a7a', 1, 8, 14, 1); R(x, '#a84a32', 1, 14, 14, 1);
    R(x, NAVY, 0, 7, 16, 1); R(x, '#d8f0ff', 3, 3, 4, 2); R(x, NAVY, 9, 10, 4, 2); R(x, '#b8c6d8', 11, 3, 3, 3);
  }
}
function buildToonTileset(name, th){
  const P = th.ground;
  const ts = buildTileset('overworld'); // shared pieces (conveyors, barrels, acid…) from the base set
  const out = Object.assign({}, ts, {
    groundTop: [0, 1, 2, 3].map(i => tileCanvas(x => toonGround(x, true, 11 + i * 31, P))),
    ground: [0, 1, 2, 3].map(i => tileCanvas(x => toonGround(x, false, 77 + i * 13, P))),
    brick: tileCanvas(x => toonBrick(x, th.brick)),
    solid: tileCanvas(x => toonSolid(x, th.solid)),
    crt: [0, 1, 2, 3].map(f => tileCanvas(x => toonQ(x, f, false))),
    mimicTell: tileCanvas(x => toonQ(x, 1, false)),
    used: tileCanvas(x => toonQ(x, 0, true)),
    plank: tileCanvas(x => toonPlank(x, false, P.planks || P.steel ? P : { top: '#d8a868', topLight: '#f0c888', topDark: '#a87a48' })),
    crumble: tileCanvas(x => toonPlank(x, true, P)),
    stone: tileCanvas(x => toonStone(x, name === 'grave')),
    toon: true,
  });
  return out;
}

// ---------------- toon sprites ----------------
function buildToonSprites(S){
  const T = {};
  // Rival truck (generic cartoon pickup, no brand). Faces right. 36x22
  const truck = (body, frame, angry) => toonSprite(36, 23, x => {
    const [lt, bs, dk] = body;
    // bed + body
    R(x, bs, 2, 9, 32, 7); R(x, lt, 2, 9, 32, 1); R(x, dk, 2, 15, 32, 2);
    R(x, bs, 2, 6, 14, 3); R(x, lt, 2, 6, 14, 1); R(x, NAVY, 4, 8, 11, 1);
    // cab
    R(x, bs, 17, 2, 11, 7); R(x, lt, 17, 2, 11, 1); R(x, bs, 28, 4, 2, 5); R(x, bs, 30, 6, 2, 3);
    R(x, '#a8e0ff', 19, 3, 7, 5); R(x, '#e8f8ff', 19, 3, 2, 2); R(x, '#a8e0ff', 27, 5, 2, 3); R(x, '#a8e0ff', 29, 7, 2, 1);
    // angry cartoon eyes on the windshield
    R(x, '#ffffff', 21, 5, 2, 2); R(x, '#ffffff', 24, 5, 2, 2); R(x, NAVY, 22, 6, 1, 1); R(x, NAVY, 25, 6, 1, 1);
    if (angry){ R(x, NAVY, 20, 4, 3, 1); R(x, NAVY, 24, 4, 3, 1); }
    R(x, NAVY, 17, 9, 1, 6); R(x, NAVY, 27, 10, 1, 5); R(x, dk, 24, 11, 2, 1);
    // headlight, grille, bumper
    R(x, '#FFD400', 33, 10, 2, 2); R(x, '#fff3a0', 33, 10, 1, 1); R(x, '#b8c6d8', 31, 13, 4, 3); R(x, '#e8f0fa', 31, 13, 4, 1);
    R(x, '#b8c6d8', 1, 13, 2, 3);
    // wheels
    for (const wx of [5, 23]){ R(x, '#2a2e3a', wx, 14, 8, 8); R(x, '#2a2e3a', wx - 1, 15, 10, 6); R(x, '#b8c6d8', wx + 2, 16, 4, 4); R(x, '#e8f0fa', wx + 2, 16, 2, 1); R(x, NAVY, wx + 3 + (frame ? 1 : 0), 17 + (frame ? 1 : 0), 1, 1); }
  });
  const bodies = { red: ['#ff7a5a', '#e8402a', '#a82818'], green: ['#8ee07a', '#4ab04a', '#2a7a32'], blue: ['#8ac0ff', '#3a7ad8', '#24508e'] };
  T.truck = {};
  for (const k in bodies){
    const R0 = [truck(bodies[k], 0, false), truck(bodies[k], 1, false)], A0 = [truck(bodies[k], 0, true), truck(bodies[k], 1, true)];
    T.truck[k] = { R: R0, L: R0.map(flipH), aR: A0, aL: A0.map(flipH) };
    T.truck[k].flat = toonSprite(36, 23, x => { const [lt, bs, dk] = bodies[k]; R(x, bs, 2, 15, 32, 4); R(x, lt, 2, 15, 32, 1); R(x, dk, 2, 18, 32, 1); R(x, '#a8e0ff', 18, 13, 9, 2); for (const wx of [5, 23]) R(x, '#2a2e3a', wx - 1, 19, 10, 3); });
  }
  // Graveyard skeleton (cartoon, goofy, no gore). 14x18, faces right
  const skel = (frame) => toonSprite(16, 19, x => {
    const B = '#f4f1e8', b = '#dcd6c8', d = '#a8a090';
    R(x, B, 4, 1, 9, 7); R(x, B, 3, 2, 11, 5); R(x, d, 4, 7, 9, 1); R(x, '#ffffff', 5, 2, 3, 1);
    R(x, NAVY, 6, 3, 2, 2); R(x, NAVY, 10, 3, 2, 2); R(x, NAVY, 9, 6, 1, 1); R(x, NAVY, 11, 6, 1, 1); R(x, NAVY, 7, 6, 1, 1);
    R(x, '#FFD400', 4, 8, 9, 2); R(x, '#d8a800', 4, 9, 9, 1); // yellow bandana
    R(x, b, 7, 10, 3, 4); R(x, B, 5, 11, 7, 1); R(x, B, 5, 13, 7, 1); R(x, d, 7, 13, 3, 1);
    const sw = frame ? 1 : -1;
    R(x, B, 3, 10 + (frame ? 1 : 0), 2, 4); R(x, B, 12, 10 + (frame ? 0 : 1), 2, 4);
    R(x, b, 6, 14, 5, 1);
    R(x, B, 6 + sw, 15, 2, 3); R(x, B, 9 - sw, 15, 2, 3); R(x, b, 5 + sw, 17, 3, 1); R(x, b, 9 - sw, 17, 3, 1);
  });
  const s1 = skel(0), s2 = skel(1);
  T.skel = { R: [s1, s2], L: [flipH(s1), flipH(s2)] };
  T.bones = toonSprite(16, 9, x => { const B = '#f4f1e8', d = '#a8a090'; R(x, B, 1, 6, 6, 2); R(x, B, 9, 5, 6, 2); R(x, d, 5, 7, 6, 1); R(x, B, 5, 1, 6, 5); R(x, NAVY, 6, 2, 1, 1); R(x, NAVY, 9, 2, 1, 1); R(x, '#FFD400', 4, 6, 3, 2); });
  T.crumb = S.crumb.map(outlined); T.crumbSq = outlined(S.crumbSq); T.crumbFlip = flipV(T.crumb[0]);
  // Toast Rocket launcher turret (chrome toaster on a post). 16x18, barrel drawn separately in-game
  T.launcherBase = toonSprite(18, 18, x => {
    R(x, '#7e8ea6', 6, 11, 6, 6); R(x, '#b8c6d8', 7, 11, 2, 6);
    R(x, '#b8c6d8', 2, 2, 14, 9); R(x, '#e8f0fa', 2, 2, 14, 2); R(x, '#7e8ea6', 2, 9, 14, 2); R(x, '#ffffff', 4, 3, 2, 1);
    R(x, NAVY, 5, 1, 3, 2); R(x, NAVY, 10, 1, 3, 2); // slots
    R(x, '#ff6a5a', 14, 5, 2, 2); R(x, '#2a2e3a', 1, 16, 16, 2);
  });
  // homing toast rocket (faces right) 12x8
  T.hrocket = toonSprite(13, 9, x => { R(x, '#f4c860', 3, 1, 8, 7); R(x, '#fff0b0', 3, 1, 8, 1); R(x, '#c8741e', 3, 6, 8, 1); R(x, '#c8741e', 10, 2, 2, 5); R(x, '#e8402a', 1, 3, 2, 3); R(x, NAVY, 7, 3, 1, 1); R(x, NAVY, 9, 3, 1, 1); });
  T.hrocketR = toonSprite(13, 9, x => { R(x, '#c8a0ff', 3, 1, 8, 7); R(x, '#efe0ff', 3, 1, 8, 1); R(x, '#8a3fd1', 3, 6, 8, 1); R(x, '#8a3fd1', 10, 2, 2, 5); R(x, '#00e5ff', 1, 3, 2, 3); });
  // flaming toast (boss) 12x12
  T.ftoast = [0, 1].map(f => toonSprite(13, 14, x => { R(x, '#ff6a00', 2, 1 + f, 3, 3); R(x, '#FFD400', 6, 0 + (1 - f), 2, 4); R(x, '#ff6a00', 9, 1 + f, 2, 3); R(x, '#f4c860', 2, 4, 9, 8); R(x, '#fff0b0', 2, 4, 9, 1); R(x, '#c8741e', 2, 11, 9, 1); R(x, '#8a5a2a', 5, 7, 1, 1); R(x, '#8a5a2a', 8, 8, 1, 1); }));
  // 850HP Lightbar item 16x12
  T.lightbar = [0, 1].map(f => toonSprite(16, 12, x => { R(x, '#b8c6d8', 2, 6, 12, 3); R(x, '#e8f0fa', 2, 6, 12, 1); R(x, '#7e8ea6', 3, 9, 2, 2); R(x, '#7e8ea6', 11, 9, 2, 2);
    const cols = f ? ['#ffffff', '#FFD400', '#ffffff', '#FFD400', '#ffffff'] : ['#FFD400', '#ffffff', '#FFD400', '#ffffff', '#FFD400']; cols.forEach((c, i) => R(x, c, 1 + i * 3, 2, 2, 3)); R(x, '#1b2a4a', 0, 1, 1, 1); }));
  // Coty's parked Toaster Truck (original wedge pickup; stainless, tonneau, roof rails, lightbar, flag sticker, THERAPY TOASTER plate). 124x48
  T.toasterTruck = toonSprite(124, 50, x => {
    const L = '#e8f0fa', M = '#b8c6d8', D = '#7e8ea6';
    // wedge body: rising windshield to a peak at x=58, long sloped roof to the tail
    for (let i = 0; i < 120; i++){
      const top = i < 58 ? Math.round(30 - (i - 4) * 0.38) : Math.round(10 + (i - 58) * 0.16);
      const yt = Math.max(9, Math.min(30, top)); R(x, M, 2 + i, yt, 1, 38 - yt);
      R(x, L, 2 + i, yt, 1, 1);
    }
    R(x, D, 2, 36, 120, 4); R(x, L, 2, 26, 120, 1); R(x, D, 2, 30, 120, 1);
    // glass
    for (let i = 0; i < 36; i++){ const top = Math.round(29 - (i + 20) * 0.38); R(x, '#4a5a78', 24 + i, top + 2, 1, Math.max(1, 25 - top - 1)); }
    for (let i = 0; i < 18; i++){ const top = Math.round(10 + i * 0.16); R(x, '#4a5a78', 60 + i, top + 2, 1, 14 - top); }
    R(x, '#8aa0c8', 30, 22, 8, 1); R(x, NAVY, 59, 11, 1, 15);
    // tonneau + roof rails + lightbar
    R(x, D, 80, 12, 38, 2); R(x, NAVY, 82, 10, 1, 2); R(x, NAVY, 114, 15, 1, 2);
    R(x, NAVY, 40, 14, 34, 1); for (let i = 0; i < 6; i++) R(x, i % 2 ? '#ffffff' : '#FFD400', 44 + i * 4, 12, 3, 2);
    // headlight bar (front at left)
    R(x, '#ffffff', 3, 27, 22, 1); R(x, '#FFD400', 3, 28, 4, 1);
    // flag sticker (stripes + star field, generic)
    R(x, '#ffffff', 88, 22, 10, 6); for (let k = 0; k < 3; k++) R(x, '#e8402a', 88, 22 + k * 2, 10, 1); R(x, '#3a5aa8', 88, 22, 4, 3);
    // wheels
    for (const wx of [14, 92]){ R(x, '#2a2e3a', wx, 34, 18, 14); R(x, '#2a2e3a', wx - 2, 36, 22, 10); R(x, D, wx + 4, 37, 10, 8); R(x, L, wx + 5, 38, 4, 2); R(x, NAVY, wx + 8, 40, 2, 2); }
    // plate on the rear
    drawPlate(x, 99, 28);
  });
  // tiny driver wave: skeleton head in yellow jacket (drawn through the glass)
  T.driver = toonSprite(10, 12, x => { R(x, '#f4f1e8', 2, 1, 6, 5); R(x, NAVY, 3, 3, 1, 1); R(x, NAVY, 6, 3, 1, 1); R(x, '#FFD400', 1, 7, 8, 4); R(x, '#d8a800', 1, 10, 8, 1); });
  // boost pad (on top of the floor) 16x5, two frames
  T.boost = [0, 1].map(f => toonSprite(16, 6, x => { R(x, '#2a2e3a', 0, 1, 16, 5); for (let i = 0; i < 3; i++){ const c = (i + f) % 2 ? '#FFD400' : '#ff9a3a'; R(x, c, 2 + i * 5, 2, 2, 3); R(x, c, 4 + i * 5, 3, 1, 1); } }));
  return T;
}
// THE GRAND TOASTER: giant chrome toaster-truck. Drawn facing left (face/grille on the left). 84x56
function buildGrandToaster(){
  const make = (lever, angry, lights, hurt) => toonSprite(86, 58, x => {
    const L = '#f4f8ff', M = '#b8c6d8', D = '#7e8ea6', DD = '#5a6a80';
    // lever (top middle)
    const ly = lever ? 2 : 10;
    R(x, DD, 41, ly + 6, 4, 14 - ly); R(x, '#FFD400', 37, ly, 12, 6); R(x, '#fff3a0', 37, ly, 12, 1); R(x, '#d8a800', 37, ly + 5, 12, 1);
    // body
    R(x, M, 4, 16, 78, 30); R(x, M, 6, 14, 74, 2); R(x, L, 6, 14, 74, 2); R(x, L, 4, 16, 3, 28); R(x, D, 4, 42, 78, 4); R(x, D, 79, 16, 3, 28);
    R(x, L, 18, 18, 4, 22); R(x, '#ffffff', 19, 18, 1, 20); R(x, L, 60, 18, 2, 22); // reflections
    // bread slots on top
    R(x, NAVY, 14, 14, 18, 3); R(x, NAVY, 54, 14, 18, 3); if (lights){ R(x, '#ff6a00', 15, 15, 16, 1); R(x, '#ff6a00', 55, 15, 16, 1); }
    // roof lightbar
    for (let i = 0; i < 6; i++) R(x, lights ? (i % 2 ? '#ffffff' : '#FFD400') : '#8a96a8', 8 + i * 3, 11, 2, 3);
    // face: headlight eyes + grille mouth
    R(x, angry ? '#ff6a00' : '#FFD400', 8, 22, 9, 7); R(x, '#fff3a0', 8, 22, 9, 2); R(x, NAVY, 11, 24, 3, 3);
    R(x, NAVY, 6, angry ? 19 : 20, 13, 2);
    R(x, DD, 6, 32, 20, 9); for (let i = 0; i < 5; i++) R(x, L, 7 + i * 4, 33, 2, 7);
    if (hurt){ R(x, NAVY, 10, 23, 5, 1); R(x, NAVY, 10, 27, 5, 1); }
    // plate
    drawPlate(x, 55, 34);
    // bumper + wheels
    R(x, '#e8f0fa', 2, 44, 10, 3); R(x, '#e8f0fa', 76, 44, 8, 3);
    for (const wx of [12, 58]){ R(x, '#2a2e3a', wx, 42, 16, 14); R(x, '#2a2e3a', wx - 2, 44, 20, 10); R(x, D, wx + 4, 45, 8, 8); R(x, L, wx + 5, 46, 3, 2); }
  });
  const G = { idle: make(true, false, false, false), angry: make(true, true, true, false), down: make(false, true, false, true), ram: make(true, true, true, false) };
  for (const k of Object.keys(G)) G[k + '_R'] = flipH(G[k]);
  return G;
}
