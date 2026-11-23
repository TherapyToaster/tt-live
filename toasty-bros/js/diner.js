// World 4: TOASTER CARDS — original procedural pixel art for a grimy 24-hour diner at 3 a.m. (lore: lore/cards.md).
// Palette: gold #ffd400 / #f5c400, cream #f2ecd6, void #05070d, warm black #14110a, cyan #00edff, magenta #ff37cf,
// signal red #c8142a (accents), hazard stripes. Jam is always grape purple #b54e8c. No real brands, no money, no gore.
'use strict';
const DIN = { Y: '#ffd400', Y2: '#f5c400', CR: '#f2ecd6', V: '#05070d', K: '#14110a', C: '#00edff', M: '#ff37cf', R: '#c8142a',
  JAM: '#b54e8c', JAM2: '#7e2f60', JAM3: '#d97ab2', CH: '#c9d2dc', CH2: '#8e98a6', CH3: '#eef4fa', VIN: '#a8162c', VIN2: '#d8344a',
  CRUST: '#8a4a1c', TOAST: '#e0a040', TOAST2: '#f4c860', MOLD: '#6f8f58', MOLD2: '#3f5a3a', GREASE: '#c89a2a', GREASE2: '#6a4a12' };
function dCv(w, h, fn){ const c = mkCanvas(w, h), x = c.getContext('2d'); fn(x); return c; }
function dR(x, c, a, b, w, h){ x.fillStyle = c; x.fillRect(a, b, w, h); }
function dStripes(x, X, Y, w, h, a, b, s){ // hazard stripes clipped to a box
  x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip(); dR(x, a || DIN.Y, X, Y, w, h); x.fillStyle = b || DIN.K;
  s = s || 4; for (let i = -h; i < w + h; i += s * 2){ x.beginPath(); x.moveTo(X + i, Y + h); x.lineTo(X + i + s, Y + h); x.lineTo(X + i + s + h, Y); x.lineTo(X + i + h, Y); x.closePath(); x.fill(); }
  x.restore();
}
function dOut(src, col){ return typeof pitOutline === 'function' ? pitOutline(src, col || DIN.V) : src; }
function dGrime(x, seed, n){ const r = rng(seed); for (let i = 0; i < (n || 8); i++){ x.fillStyle = r() < 0.6 ? 'rgba(20,17,10,0.28)' : 'rgba(255,240,200,0.06)'; x.fillRect((r() * 16) | 0, (r() * 16) | 0, 1 + ((r() * 2) | 0), 1); } }

// ---------------- tiles ----------------
function dinerTiles(ts, th){
  const kind = th.bg, acc = (th.dinCol || {}).a || DIN.C, acc2 = (th.dinCol || {}).b || DIN.M;
  const floor = (top, i) => dCv(16, 16, x => {
    if (kind === 'kitchen'){ // diamond-plate steel
      dR(x, '#5a626c', 0, 0, 16, 16); for (let j = 0; j < 16; j += 4) for (let k = (j / 4) % 2 * 2; k < 16; k += 4){ dR(x, '#8e98a6', k, j + 1, 2, 1); dR(x, '#3a4048', k + 1, j + 2, 2, 1); }
      dR(x, '#2a3038', 0, 15, 16, 1); dGrime(x, 50 + i, 10); if (top){ dR(x, DIN.V, 0, 0, 16, 1); dR(x, DIN.CH3, 0, 1, 16, 1); dR(x, DIN.GREASE, (i * 5) % 12, 2, 4, 1); }
    } else if (kind === 'repair'){ // worn plank floor, oil spots
      dR(x, '#3a2a1e', 0, 0, 16, 16); for (let j = 0; j < 16; j += 5) dR(x, '#24180e', 0, j, 16, 1); dR(x, '#4a3626', 0, 2, 16, 1); dR(x, '#24180e', (i * 7) % 16, 0, 1, 16);
      dGrime(x, 70 + i, 12); if (top){ dR(x, DIN.V, 0, 0, 16, 1); dStripes(x, 0, 1, 16, 2, DIN.Y, DIN.K, 2); }
    } else { // black-and-cream checker linoleum (booth: oxblood + cream)
      const a = kind === 'booth' ? '#3a0e16' : DIN.K, b = kind === 'booth' ? '#c8b89a' : '#d8cfb4';
      for (let j = 0; j < 16; j += 8) for (let k = 0; k < 16; k += 8) dR(x, ((j + k) / 8) % 2 ? a : b, k, j, 8, 8);
      dGrime(x, 90 + i * 3, 14); if (top){ dR(x, DIN.V, 0, 0, 16, 1); dR(x, DIN.CH3, 0, 1, 16, 1); dR(x, DIN.CH2, 0, 2, 16, 1); dR(x, i % 2 ? acc : acc2, 0, 3, 16, 1); }
    }
  });
  ts.groundTop = [0, 1, 2, 3].map(i => floor(true, i));
  ts.ground = [0, 1, 2, 3].map(i => dCv(16, 16, x => { x.drawImage(floor(false, i), 0, 0); dR(x, 'rgba(5,7,13,0.35)', 0, 0, 16, 16); }));
  ts.brick = dCv(16, 16, x => { // subway tile / pegboard (repair)
    if (kind === 'repair'){ dR(x, '#7a5a3a', 0, 0, 16, 16); for (let j = 2; j < 16; j += 4) for (let k = 2; k < 16; k += 4) dR(x, '#3a2a1a', k, j, 1, 1); dR(x, DIN.V, 0, 15, 16, 1); dR(x, DIN.V, 15, 0, 1, 16); return; }
    const t = kind === 'kitchen' ? '#e8eef0' : DIN.CR, gr = kind === 'kitchen' ? '#9aa4aa' : '#9a8e70';
    dR(x, gr, 0, 0, 16, 16); for (const [a, b, w] of [[0, 0, 7], [8, 0, 8], [0, 8, 3], [4, 8, 8], [13, 8, 3]]){ dR(x, t, a, b, w, 7); dR(x, '#ffffff', a, b, w, 1); }
    dGrime(x, kind === 'kitchen' ? 41 : 42, 10); if (kind === 'kitchen'){ dR(x, DIN.GREASE, 3, 9, 2, 3); dR(x, DIN.GREASE2, 3, 12, 1, 2); }
  });
  ts.solid = dCv(16, 16, x => { // chrome counter block with a hazard band
    dR(x, DIN.V, 0, 0, 16, 16); dR(x, DIN.CH2, 1, 1, 14, 14); dR(x, DIN.CH, 1, 1, 14, 5); dR(x, DIN.CH3, 1, 1, 14, 1); dR(x, '#5a626c', 1, 14, 14, 1);
    if (kind === 'repair' || kind === 'kitchen') dStripes(x, 1, 8, 14, 4, DIN.Y, DIN.K, 2); else { dR(x, DIN.VIN, 1, 8, 14, 4); dR(x, DIN.VIN2, 1, 8, 14, 1); }
  });
  ts.plank = dCv(16, 16, x => { // chrome stool top / table edge (one-way): red vinyl cushion on a chrome rim
    dR(x, DIN.V, 0, 0, 16, 6); dR(x, DIN.VIN, 1, 0, 14, 3); dR(x, DIN.VIN2, 2, 0, 12, 1); dR(x, DIN.CH, 0, 3, 16, 2); dR(x, DIN.CH3, 0, 3, 16, 1);
  });
  ts.stone = dCv(16, 16, x => { // booth seat block: tufted red vinyl, chrome trim
    dR(x, DIN.V, 0, 0, 16, 16); dR(x, DIN.VIN, 1, 1, 14, 13); dR(x, DIN.VIN2, 1, 1, 14, 2); for (const [a, b] of [[4, 6], [11, 6], [7, 10]]){ dR(x, '#6a0c1a', a, b, 2, 2); dR(x, DIN.VIN2, a, b - 1, 2, 1); }
    dR(x, DIN.CH, 0, 14, 16, 2); dR(x, DIN.CH3, 0, 14, 16, 1);
  });
  ts.acid = [0, 1, 2, 3].map(f => dCv(16, 16, x => { // grease vat: bubbling amber fryer oil in a steel tub
    dR(x, '#2a3038', 0, 0, 16, 16); dR(x, DIN.GREASE2, 0, 6, 16, 10); dR(x, DIN.GREASE, 0, 6, 16, 3); dR(x, '#ffe08a', 0, 6, 16, 1);
    const r = rng(10 + f); for (let i = 0; i < 4; i++){ const bx = (r() * 14) | 0, by = 9 + ((r() * 5) | 0); dR(x, '#ffe08a', bx, by, 2, 1); dR(x, DIN.GREASE, bx, by + 1, 2, 1); }
    dR(x, DIN.CH2, 0, 4, 16, 2); dR(x, DIN.CH3, 0, 4, 16, 1); dR(x, (f >> 1) ? '#ff7a2a' : DIN.Y, (f * 4) % 16, 7, 2, 1);
  }));
  ts.crumble = dCv(16, 16, x => { // soggy waffle block (crumbles)
    dR(x, DIN.V, 0, 0, 16, 16); dR(x, '#c88a3a', 1, 1, 14, 14); for (let j = 3; j < 15; j += 4) for (let k = 3; k < 15; k += 4) dR(x, '#8a5a1a', k, j, 2, 2); dR(x, '#f0c070', 1, 1, 14, 1); dR(x, DIN.JAM, 9, 1, 4, 2); dR(x, DIN.JAM2, 10, 3, 2, 2);
  });
  ts.toaster = [0, 1].map(f => dCv(16, 16, x => { // Pop-Up toaster slot block (solid): chrome, two slots, glowing when loaded
    dR(x, DIN.V, 0, 0, 16, 16); dR(x, DIN.CH, 1, 2, 14, 13); dR(x, DIN.CH3, 1, 2, 14, 1); dR(x, DIN.CH2, 1, 11, 14, 4);
    dR(x, DIN.V, 3, 1, 4, 3); dR(x, DIN.V, 9, 1, 4, 3); if (f){ dR(x, '#ff7a2a', 4, 2, 2, 1); dR(x, '#ff7a2a', 10, 2, 2, 1); }
    dR(x, DIN.K, 14, 6, 2, 3); dR(x, DIN.R, 12, 7, 2, 1); dStripes(x, 1, 12, 14, 2, DIN.Y, DIN.K, 2);
  }));
  ts.diner = true;
  return ts;
}

// ---------------- sprites ----------------
function buildDinerSprites(){
  const D = {};
  const pair = (w, h, fn) => { const a = [dOut(dCv(w, h, x => fn(x, 0))), dOut(dCv(w, h, x => fn(x, 1)))]; return { R: a, L: a.map(flipH) }; };
  // Crumb Rat: a scurrying critter of crust and crumbs
  D.rat = pair(16, 10, (x, f) => {
    dR(x, DIN.CRUST, 3, 3, 9, 5); dR(x, '#a8622a', 4, 2, 7, 2); dR(x, DIN.CRUST, 11, 4, 3, 3); dR(x, '#5a2e0c', 14, 5, 1, 1); // body + snout
    dR(x, '#a8622a', 9, 1, 2, 2); dR(x, DIN.CR, 12, 4, 1, 1); dR(x, '#e8c27a', 5, 4, 1, 1); dR(x, '#e8c27a', 8, 5, 1, 1); dR(x, '#e8c27a', 6, 6, 1, 1);
    dR(x, '#5a2e0c', 0, f ? 4 : 5, 3, 1); dR(x, '#5a2e0c', 0, f ? 3 : 6, 1, 1); // tail
    dR(x, '#5a2e0c', f ? 4 : 5, 8, 1, 2); dR(x, '#5a2e0c', f ? 10 : 9, 8, 1, 2);
  });
  D.ratSq = dOut(dCv(16, 10, x => { dR(x, DIN.CRUST, 2, 7, 12, 3); dR(x, '#e8c27a', 4, 7, 1, 1); dR(x, '#e8c27a', 9, 8, 1, 1); }));
  // Crouton (splits into three crumbits)
  const crouton = (x, s, f, big) => { const o = f ? 1 : 0;
    dR(x, '#b8742a', 1, 1 + o, s - 2, s - 2 - o); dR(x, DIN.TOAST2, 1, 1 + o, s - 2, 2); dR(x, '#7a3e10', 1, s - 2, s - 2, 1);
    if (big){ dR(x, '#e8c27a', 3, 6 + o, 1, 1); dR(x, '#e8c27a', 9, 9, 1, 1); dR(x, DIN.V, 3, 4 + o, 2, 2); dR(x, DIN.V, 8, 4 + o, 2, 2); dR(x, DIN.R, 4, 4 + o, 1, 1); dR(x, DIN.R, 9, 4 + o, 1, 1); dR(x, DIN.V, 3, 3 + o, 3, 1); dR(x, DIN.V, 7, 3 + o, 3, 1); }
    else { dR(x, DIN.V, 2, 3 + o, 1, 1); dR(x, DIN.V, 5, 3 + o, 1, 1); } };
  D.crouton = pair(14, 13, (x, f) => crouton(x, 13, f, true));
  D.crumbit = pair(9, 8, (x, f) => crouton(x, 8, f, false));
  // Moldy Loaf: slow, droopy, leaves mold behind
  D.mold = pair(18, 13, (x, f) => { const o = f ? 1 : 0;
    dR(x, '#d8c8a0', 1, 3 + o, 16, 10 - o); dR(x, '#e8dcb8', 2, 1 + o, 14, 3); dR(x, '#b8a47a', 1, 11, 16, 2);
    for (const [a, b, w] of [[3, 2, 4], [11, 4, 3], [5, 8, 3], [13, 9, 2], [9, 1, 2]]){ dR(x, DIN.MOLD, a, b + o, w, 2); dR(x, DIN.MOLD2, a + 1, b + 1 + o, 1, 1); }
    dR(x, DIN.V, 5, 6 + o, 2, 1); dR(x, DIN.V, 11, 6 + o, 2, 1); dR(x, DIN.V, 6, 7 + o, 1, 1); dR(x, DIN.V, 12, 7 + o, 1, 1); dR(x, DIN.V, 8, 10, 3, 1);
  });
  // Pop-Up: an angry slice that springs out of a toaster slot
  D.popper = pair(12, 14, (x, f) => {
    dR(x, DIN.CRUST, 1, 0, 10, 11); dR(x, DIN.TOAST, 2, 1, 8, 9); dR(x, DIN.TOAST2, 2, 1, 8, 2); dR(x, '#c88a3a', 3, 8, 6, 1);
    dR(x, DIN.V, 3, 4, 2, 2); dR(x, DIN.V, 7, 4, 2, 2); dR(x, DIN.CR, 3, 4, 1, 1); dR(x, DIN.CR, 7, 4, 1, 1); dR(x, DIN.V, 4, 7, 4, 1);
    if (f){ dR(x, DIN.CH, 4, 11, 4, 1); dR(x, DIN.CH2, 5, 12, 2, 1); dR(x, DIN.CH, 4, 13, 4, 1); } else { dR(x, DIN.K, 3, 11, 1, 3); dR(x, DIN.K, 8, 11, 1, 3); }
  });
  // Toast Ghost: a pale slice with a wavy hem (comes back once)
  const ghost = (x, f, back) => { const b = back ? '#bff6ff' : '#f2ecd6', b2 = back ? DIN.C : '#c8bfa4';
    dR(x, b, 2, 1, 10, 10); dR(x, b, 1, 3, 12, 8); dR(x, '#ffffff', 3, 1, 8, 1); for (let i = 0; i < 12; i += 4){ dR(x, b, 1 + i, 11, 2, f ? 2 : 3); dR(x, b, 3 + i, 11, 2, f ? 3 : 2); }
    dR(x, b2, 1, 9, 12, 1); dR(x, DIN.V, 4, 4, 2, 3); dR(x, DIN.V, 8, 4, 2, 3); dR(x, DIN.V, 6, 8, 2, 1); if (back){ dR(x, DIN.M, 4, 5, 1, 1); dR(x, DIN.M, 8, 5, 1, 1); } };
  D.ghost = pair(14, 15, (x, f) => ghost(x, f, false));
  D.ghostBack = pair(14, 15, (x, f) => ghost(x, f, true));
  // Rye Knight: a dark rye slice in a pot-lid helmet with a crust shield (blocks shots for its neighbours)
  const knight = (x, f, shield) => {
    dR(x, '#4a2e18', 2, 4, 9, 11); dR(x, '#6a4428', 3, 5, 7, 8); for (const [a, b] of [[4, 7], [8, 9], [5, 11], [7, 6]]) dR(x, '#d8c8a0', a, b, 1, 1); // caraway seeds
    dR(x, DIN.CH2, 1, 1, 11, 4); dR(x, DIN.CH, 2, 1, 9, 2); dR(x, DIN.CH3, 3, 1, 5, 1); dR(x, DIN.V, 6, 0, 2, 1); dR(x, DIN.V, 2, 4, 9, 1); dR(x, DIN.Y, 4, 5, 1, 1); dR(x, DIN.Y, 8, 5, 1, 1);
    dR(x, '#2a1a0c', f ? 3 : 4, 15, 2, 2); dR(x, '#2a1a0c', f ? 8 : 7, 15, 2, 2);
    if (shield){ dR(x, DIN.V, 10, 3, 6, 13); dR(x, '#b8742a', 11, 4, 4, 11); dR(x, DIN.TOAST2, 11, 4, 4, 2); dStripes(x, 11, 9, 4, 3, DIN.Y, DIN.K, 2); dR(x, '#7a3e10', 11, 14, 4, 1); }
    else { dR(x, DIN.CH, 11, 9, 3, 1); } };
  D.knight = pair(16, 17, (x, f) => knight(x, f, true));
  D.knightBare = pair(16, 17, (x, f) => knight(x, f, false));
  // Burnt Bagel: a charred kamikaze ring with a sizzling fuse
  D.bagel = pair(14, 13, (x, f) => {
    dR(x, '#2a1a10', 1, 4, 12, 8); dR(x, '#2a1a10', 3, 3, 8, 10); dR(x, '#4a2c18', 3, 4, 8, 2); dR(x, DIN.V, 6, 7, 2, 2); // ring + hole
    dR(x, '#ff7a2a', 3, 8, 1, 1); dR(x, '#ff7a2a', 10, 8, 1, 1); dR(x, '#7a3e10', 9, 5, 2, 1);
    dR(x, DIN.CH2, 6, 1, 1, 3); dR(x, f ? DIN.Y : '#ff7a2a', 6, 0, 2, 1); dR(x, '#ffffff', f ? 7 : 5, 0, 1, 1); // fuse spark
    dR(x, '#5a5a62', 0, f ? 5 : 6, 2, 2); dR(x, '#5a5a62', 12, f ? 6 : 5, 2, 2); // little stubby wings (smoke puffs)
  });
  // Short-Order Cook: paper hat, apron, a grease-pellet spatula launcher (W4 gun enemy)
  D.cook = pair(16, 16, (x, f) => {
    dR(x, '#ffffff', 3, 0, 8, 3); dR(x, '#d8dee4', 3, 2, 8, 1); dR(x, DIN.CRUST, 3, 3, 8, 5); dR(x, DIN.TOAST, 4, 4, 6, 3); dR(x, DIN.V, 5, 5, 1, 1); dR(x, DIN.V, 8, 5, 1, 1); dR(x, DIN.V, 5, 4, 2, 1);
    dR(x, DIN.CR, 3, 8, 8, 6); dR(x, DIN.R, 3, 8, 8, 1); dR(x, '#d8cfb4', 4, 12, 6, 1);
    dR(x, DIN.CH2, 10, 9, 5, 2); dR(x, DIN.CH3, 10, 9, 5, 1); dR(x, DIN.K, 14, 8, 2, 4); // launcher
    dR(x, DIN.K, f ? 4 : 5, 14, 2, 2); dR(x, DIN.K, f ? 8 : 7, 14, 2, 2);
  });
  // Fuse Box (mini-boss): wall-mounted, sparking, hazard-framed
  const fuse = (x, f, hurt) => {
    dStripes(x, 0, 0, 32, 40, DIN.Y, DIN.K, 3); dR(x, DIN.V, 2, 2, 28, 36); dR(x, '#3a4048', 3, 3, 26, 34); dR(x, '#5a626c', 3, 3, 26, 2);
    dR(x, DIN.V, 6, 7, 20, 7); const ledC = hurt ? DIN.Y : (f ? DIN.R : '#ff5a5a'); dR(x, ledC, 8, 9, 5, 3); dR(x, ledC, 19, 9, 5, 3); dR(x, '#ffffff', 9, 9, 1, 1); dR(x, '#ffffff', 20, 9, 1, 1); // angry LED eyes
    dR(x, DIN.V, 6, 7, 8, 1); dR(x, DIN.V, 18, 7, 8, 1);
    for (let i = 0; i < 4; i++){ const on = hurt || ((f + i) % 3); dR(x, DIN.V, 6 + i * 5, 18, 4, 10); dR(x, on ? (i % 2 ? DIN.Y : DIN.R) : '#4a3a3a', 7 + i * 5, 19, 2, 8); dR(x, DIN.CH3, 7 + i * 5, 19, 2, 1); } // fuses
    dR(x, DIN.CH, 12, 30, 8, 4); dR(x, DIN.V, 15, 26, 2, 5); dR(x, DIN.R, 14, 24, 4, 3); // lever
    drawTiny(x, 'FUSE', 9, 34, DIN.Y);
  };
  D.fuse = [0, 1].map(f => dOut(dCv(32, 40, x => fuse(x, f, false))));
  D.fuseHurt = dOut(dCv(32, 40, x => fuse(x, 0, true)));
  // pickups
  D.jam = dOut(dCv(14, 16, x => { // Jam Packet: a grape portion cup with a peel lid
    dR(x, DIN.JAM2, 2, 5, 10, 9); dR(x, DIN.JAM, 2, 5, 10, 7); dR(x, DIN.JAM3, 3, 6, 2, 4); dR(x, DIN.CR, 1, 3, 12, 3); dR(x, '#ffffff', 1, 3, 12, 1); dR(x, DIN.CR, 11, 1, 3, 3);
    drawTiny(x, 'JAM', 2, 8, DIN.CR); dR(x, DIN.JAM2, 3, 14, 8, 1);
  }));
  D.bell = dOut(dCv(14, 16, x => { // Diner Bell: chrome service bell
    dR(x, DIN.CH2, 1, 12, 12, 3); dR(x, DIN.CH3, 1, 12, 12, 1); dR(x, DIN.Y, 2, 6, 10, 6); dR(x, DIN.Y2, 3, 5, 8, 1); dR(x, '#fff3a0', 3, 7, 2, 3); dR(x, '#c9a400', 9, 8, 2, 4); dR(x, DIN.CH, 6, 3, 2, 2); dR(x, DIN.CH3, 6, 3, 1, 1);
  }));
  // wrench (boss projectile; rotated at runtime)
  D.wrench = dOut(dCv(14, 8, x => { dR(x, DIN.CH, 2, 3, 9, 2); dR(x, DIN.CH3, 2, 3, 9, 1); dR(x, DIN.CH, 10, 1, 3, 6); dR(x, DIN.V, 12, 3, 2, 2); dR(x, DIN.CH, 0, 2, 3, 4); dR(x, DIN.V, 1, 3, 1, 2); }));
  // small thrown cards (boss): back + reveal
  D.cardBackS = dOut(dCv(10, 14, x => { dR(x, DIN.CR, 0, 0, 10, 14); dStripes(x, 1, 1, 8, 12, DIN.K, DIN.Y, 2); dR(x, DIN.V, 3, 5, 4, 4); dR(x, DIN.Y, 4, 6, 2, 2); }));
  D.cardZapS = dOut(dCv(10, 14, x => { dR(x, DIN.CR, 0, 0, 10, 14); dR(x, DIN.R, 4, 2, 3, 4); dR(x, DIN.R, 3, 6, 4, 2); dR(x, DIN.R, 3, 8, 3, 4); drawTiny(x, '!', 1, 1, DIN.R); }));
  D.cardDudS = dOut(dCv(10, 14, x => { dR(x, DIN.CR, 0, 0, 10, 14); dR(x, DIN.TOAST, 2, 4, 6, 6); dR(x, DIN.CRUST, 2, 4, 6, 1); drawTiny(x, '0', 1, 1, DIN.K); }));
  // Cal's Evil Rerun (boss): CRT head (face drawn live), overalls with a CAL patch, tool belt, wrench. 32x48
  const cal = (x, pose) => {
    const lean = pose === 'lean', thr = pose === 'throw';
    dR(x, '#22262e', 10, 46, 6, 2); dR(x, '#22262e', 18, 46, 6, 2); // boots
    dR(x, '#1e3e7a', 10, 34, 5, 12); dR(x, '#1e3e7a', 18, 34, 5, 12); dR(x, '#2e5aa8', 11, 34, 3, 11); dR(x, '#2e5aa8', 19, 34, 3, 11); // legs
    dR(x, '#e2a77c', 6, 24, 4, 8); dR(x, '#e2a77c', 23, thr ? 14 : 24, 4, thr ? 10 : 8); // arms (skin) — a work shirt underneath
    dR(x, '#5a6a7a', 8, 21, 17, 13); dR(x, '#2e5aa8', 10, 23, 13, 12); dR(x, '#4a7ad0', 11, 23, 11, 1); // overalls bib
    dR(x, DIN.Y, 11, 22, 2, 2); dR(x, DIN.Y, 20, 22, 2, 2); // buckles
    dR(x, '#f2ecd6', 13, 26, 8, 5); dR(x, DIN.R, 13, 26, 8, 1); drawTiny(x, 'CAL', 13, 27, '#1e3e7a'); // name patch
    dR(x, '#7a4a1e', 8, 33, 17, 3); dR(x, '#a8682a', 8, 33, 17, 1); dR(x, DIN.CH, 10, 35, 2, 4); dR(x, DIN.Y, 14, 35, 2, 3); dR(x, DIN.R, 21, 35, 2, 4); // tool belt + tools
    dR(x, DIN.CH, thr ? 24 : 26, thr ? 8 : 28, 3, 9); dR(x, DIN.CH3, thr ? 24 : 26, thr ? 8 : 28, 1, 9); dR(x, DIN.CH, thr ? 22 : 24, thr ? 6 : 36, 7, 3); // wrench in hand
    dR(x, '#2a2e36', 3, 0, 26, 21); dR(x, '#5a6270', 4, 1, 24, 19); dR(x, '#8a929c', 4, 1, 24, 1); // CRT casing
    dR(x, DIN.V, 6, 3, 20, 14); dR(x, '#6a7080', 22, 18, 3, 2); dR(x, '#6a7080', 7, 18, 3, 2); // screen hole + knobs
    dR(x, '#3a3f4a', 9, -1 + 1, 1, 1); dR(x, DIN.V, 10, 0, 1, 1); // antenna stubs
    if (lean){ dR(x, 'rgba(0,0,0,0)', 0, 0, 1, 1); }
  };
  D.cal = { idle: dOut(dCv(32, 48, x => cal(x, 'idle'))), throw: dOut(dCv(32, 48, x => cal(x, 'throw'))) };
  D.cal.idle_L = flipH(D.cal.idle); D.cal.throw_L = flipH(D.cal.throw);
  return D;
}

// live CRT face for Cal's Evil Rerun: static + glyph eyes. mode: 'smirk' | 'lean' | 'you' | 'hurt' | 'off'
function drawCalFace(g, X, Y, mode, frame, broImg){
  const r = rng(frame * 7 + 11);
  for (let j = 0; j < 14; j += 2) for (let i = 0; i < 20; i += 2){ const v = r(); g.fillStyle = mode === 'off' ? (v < 0.5 ? '#0a0c12' : '#1a1e26') : v < 0.45 ? '#20242c' : v < 0.8 ? '#5a6270' : v < 0.95 ? '#a9b3c1' : '#ffffff'; g.fillRect(X + i, Y + j, 2, 2); }
  if (mode === 'off'){ drawTiny(g, 'NO', X + 6, Y + 2, '#c9d2dc'); drawTiny(g, 'SIG', X + 4, Y + 8, '#c9d2dc'); return; }
  if (mode === 'you' && broImg){ g.save(); g.globalAlpha = 0.85; g.drawImage(broImg, 0, 0, 16, 9, X + 2, Y + 1, 16, 9); g.restore(); g.fillStyle = (frame >> 2) % 2 ? 'rgba(255,55,207,0.35)' : 'rgba(0,237,255,0.35)'; g.fillRect(X, Y + ((frame >> 1) % 14), 20, 2); return; }
  const e = mode === 'hurt' ? '#ffd400' : '#c8142a';
  if (mode === 'lean'){ g.fillStyle = e; g.fillRect(X + 3, Y + 5, 5, 1); g.fillRect(X + 12, Y + 4, 5, 1); g.fillRect(X + 5, Y + 10, 10, 1); g.fillRect(X + 14, Y + 9, 2, 1); }
  else if (mode === 'hurt'){ g.fillStyle = e; g.fillRect(X + 4, Y + 3, 1, 1); g.fillRect(X + 6, Y + 5, 1, 1); g.fillRect(X + 6, Y + 3, 1, 1); g.fillRect(X + 4, Y + 5, 1, 1); g.fillRect(X + 13, Y + 3, 1, 1); g.fillRect(X + 15, Y + 5, 1, 1); g.fillRect(X + 15, Y + 3, 1, 1); g.fillRect(X + 13, Y + 5, 1, 1); g.fillRect(X + 7, Y + 9, 6, 2); }
  else { g.fillStyle = e; g.fillRect(X + 4, Y + 3, 3, 3); g.fillRect(X + 13, Y + 3, 3, 3); g.fillStyle = '#ffffff'; g.fillRect(X + 4, Y + 3, 1, 1); g.fillRect(X + 13, Y + 3, 1, 1); g.fillStyle = e; g.fillRect(X + 5, Y + 9, 9, 1); g.fillRect(X + 13, Y + 8, 2, 1); }
}

// giant playing-card platform (32 wide): face-up = solid, face-down = you fall through. k = flip progress 0..1 (0 = flat)
function drawBigCard(g, X, Y, up, k, warn, frame, suit){
  const w = Math.max(2, Math.round(32 * Math.abs(Math.cos(k * Math.PI)))), ox = X + ((32 - w) >> 1), H = 22;
  const showUp = k < 0.5 ? up : !up;
  g.fillStyle = DIN.V; g.fillRect(ox - 1, Y - 1, w + 2, H + 2);
  if (showUp){
    g.fillStyle = DIN.CR; g.fillRect(ox, Y, w, H); g.fillStyle = DIN.Y; g.fillRect(ox, Y, w, 2); g.fillRect(ox, Y + H - 1, w, 1);
    if (w > 20){ const cx = ox + w / 2; drawCardSuit(g, suit || 0, cx - 5, Y + 6); drawTiny(g, 'A', ox + 2, Y + 3, DIN.R); drawTiny(g, 'A', ox + w - 5, Y + H - 7, DIN.R); }
  } else {
    g.fillStyle = DIN.K; g.fillRect(ox, Y, w, H);
    if (w > 6){ g.save(); g.beginPath(); g.rect(ox + 1, Y + 1, w - 2, H - 2); g.clip(); g.fillStyle = 'rgba(255,212,0,0.55)'; for (let i = -H; i < w + H; i += 6){ g.beginPath(); g.moveTo(ox + i, Y + H); g.lineTo(ox + i + 3, Y + H); g.lineTo(ox + i + 3 + H, Y); g.lineTo(ox + i + H, Y); g.closePath(); g.fill(); } g.restore();
      if (w > 20){ g.fillStyle = DIN.V; g.fillRect(ox + w / 2 - 5, Y + 6, 10, 10); g.fillStyle = DIN.M; g.fillRect(ox + w / 2 - 3, Y + 8, 6, 6); g.fillStyle = DIN.V; g.fillRect(ox + w / 2 - 2, Y + 10, 1, 1); g.fillRect(ox + w / 2 + 1, Y + 10, 1, 1); } }
  }
  if (warn && (frame >> 2) % 2){ g.fillStyle = DIN.M; g.fillRect(ox - 1, Y - 2, w + 2, 1); g.fillStyle = DIN.C; g.fillRect(ox - 1, Y + H + 1, w + 2, 1); }
}
function drawCardSuit(g, s, X, Y){ // original suits: toast, fork, jam drop, bolt
  if (s === 0){ g.fillStyle = DIN.CRUST; g.fillRect(X, Y, 10, 10); g.fillStyle = DIN.TOAST; g.fillRect(X + 1, Y + 2, 8, 7); g.fillStyle = DIN.CRUST; g.fillRect(X + 1, Y, 3, 2); g.fillRect(X + 6, Y, 3, 2); }
  else if (s === 1){ g.fillStyle = DIN.CH2; for (let i = 0; i < 4; i++) g.fillRect(X + 2 + i * 2, Y, 1, 4); g.fillRect(X + 2, Y + 4, 7, 2); g.fillRect(X + 5, Y + 6, 2, 4); }
  else if (s === 2){ g.fillStyle = DIN.JAM; g.fillRect(X + 4, Y, 2, 2); g.fillRect(X + 3, Y + 2, 4, 2); g.fillRect(X + 2, Y + 4, 6, 4); g.fillRect(X + 3, Y + 8, 4, 2); g.fillStyle = DIN.JAM3; g.fillRect(X + 3, Y + 4, 1, 2); }
  else { g.fillStyle = DIN.R; g.fillRect(X + 5, Y, 3, 4); g.fillRect(X + 3, Y + 4, 5, 2); g.fillRect(X + 2, Y + 6, 3, 4); }
}

// ---------------- decor props (drawn behind the tiles) ----------------
const DINER_DECOR = new Set(['neon24', 'jukebox', 'crumbomat', 'payphone', 'stool', 'mop', 'norefunds', 'window', 'clock', 'cert', 'crts', 'bench', 'boothback', 'fryer', 'ticket', 'lamp']);
function drawDinerDecor(g, d, X, Y, frame){
  const on = (k) => ((frame + k) % 211) > 5 && ((frame + k) % 97) > 2;
  switch (d.kind){
    case 'neon24': { // OPEN 24 HRS / TOAST neon
      const lit = on(d.tx * 13);
      g.fillStyle = DIN.V; g.fillRect(X - 2, Y - 70, 84, 40); g.fillStyle = '#10141c'; g.fillRect(X - 1, Y - 69, 82, 38);
      g.fillStyle = '#3a3f4a'; g.fillRect(X + 10, Y - 30, 2, 30); g.fillRect(X + 68, Y - 30, 2, 30);
      if (lit){ g.globalAlpha = 0.18; g.fillStyle = DIN.M; g.fillRect(X - 8, Y - 76, 96, 52); g.globalAlpha = 1; }
      drawTextC(g, 'OPEN 24 HRS', X + 40, Y - 64, lit ? DIN.M : '#5a2048');
      drawTextC(g, 'TOAST', X + 40, Y - 52, lit ? DIN.Y : '#5a4a10', 2);
      if (lit && (frame >> 3) % 8 === 0){ g.fillStyle = '#10141c'; g.fillRect(X + 44, Y - 52, 12, 14); } // one dead letter flickers
      break; }
    case 'jukebox': { // TOAST TUNES
      g.fillStyle = DIN.V; g.fillRect(X - 1, Y - 41, 30, 41); g.fillStyle = '#5a1020'; g.fillRect(X, Y - 40, 28, 40);
      g.fillStyle = DIN.Y; g.beginPath(); g.arc(X + 14, Y - 28, 12, Math.PI, 0); g.fill(); g.fillStyle = '#5a1020'; g.beginPath(); g.arc(X + 14, Y - 28, 9, Math.PI, 0); g.fill();
      for (let i = 0; i < 5; i++){ g.fillStyle = (i + (frame >> 3)) % 5 === 0 ? DIN.C : ['#ff37cf', '#ffd400', '#00edff', '#ff7a2a', '#b54e8c'][i]; g.fillRect(X + 4 + i * 4, Y - 26, 3, 10); }
      g.fillStyle = DIN.CH; g.fillRect(X + 2, Y - 14, 24, 2); drawTiny(g, 'TOAST', X + 5, Y - 11, DIN.CR); drawTiny(g, 'TUNES', X + 5, Y - 5, DIN.Y);
      if ((frame >> 4) % 2){ g.fillStyle = DIN.Y; g.fillRect(X + 30, Y - 36 - ((frame >> 2) % 8), 2, 2); g.fillRect(X + 32, Y - 38 - ((frame >> 2) % 8), 1, 4); }
      break; }
    case 'crumbomat': { // CRUMB-O-MAT
      g.fillStyle = DIN.V; g.fillRect(X - 1, Y - 45, 26, 45); g.fillStyle = '#2a6a7a'; g.fillRect(X, Y - 44, 24, 44); g.fillStyle = '#4aa0b0'; g.fillRect(X, Y - 44, 24, 2);
      g.fillStyle = '#10141c'; g.fillRect(X + 3, Y - 38, 18, 20); for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++){ g.fillStyle = (i + j) % 2 ? DIN.TOAST : DIN.CRUST; g.fillRect(X + 5 + i * 6, Y - 36 + j * 6, 4, 4); }
      drawTiny(g, 'CRUMB', X + 2, Y - 15, DIN.Y); drawTiny(g, 'O-MAT', X + 2, Y - 9, DIN.CR); g.fillStyle = DIN.V; g.fillRect(X + 8, Y - 3, 8, 3);
      break; }
    case 'payphone': {
      g.fillStyle = DIN.V; g.fillRect(X + 1, Y - 44, 16, 26); g.fillStyle = DIN.CH2; g.fillRect(X + 2, Y - 43, 14, 24); g.fillStyle = DIN.CH3; g.fillRect(X + 2, Y - 43, 14, 1);
      g.fillStyle = DIN.K; g.fillRect(X + 3, Y - 40, 3, 12); g.fillRect(X + 4, Y - 28, 1, 14); g.fillRect(X + 4, Y - 14, 6, 1); // handset + cord
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++){ g.fillStyle = DIN.CR; g.fillRect(X + 8 + i * 2, Y - 38 + j * 3, 1, 2); }
      drawTiny(g, 'CALL', X + 7, Y - 26, DIN.Y);
      break; }
    case 'stool': { // chrome stool post under a '=' seat
      g.fillStyle = DIN.CH2; g.fillRect(X + 7, Y - 28, 2, 26); g.fillStyle = DIN.CH3; g.fillRect(X + 7, Y - 28, 1, 26); g.fillStyle = DIN.CH; g.fillRect(X + 3, Y - 3, 10, 3);
      break; }
    case 'mop': {
      g.fillStyle = DIN.V; g.fillRect(X, Y - 12, 16, 12); g.fillStyle = DIN.Y; g.fillRect(X + 1, Y - 11, 14, 10); g.fillStyle = '#6aa0a8'; g.fillRect(X + 2, Y - 11, 12, 2);
      g.fillStyle = '#a8742a'; g.fillRect(X + 10, Y - 34, 2, 24); g.fillStyle = '#d8cfb4'; g.fillRect(X + 8, Y - 12, 6, 3);
      g.fillStyle = DIN.Y; g.beginPath(); g.moveTo(X + 20, Y); g.lineTo(X + 26, Y - 20); g.lineTo(X + 32, Y); g.closePath(); g.fill(); drawTiny(g, '!', X + 25, Y - 10, DIN.K);
      break; }
    case 'norefunds': {
      g.fillStyle = DIN.V; g.fillRect(X - 1, Y - 1, 52, 14); dStripes(g, X, Y, 50, 12, DIN.Y, DIN.K, 3); g.fillStyle = DIN.CR; g.fillRect(X + 3, Y + 2, 44, 8);
      drawTiny(g, 'NO REFUNDS', X + 6, Y + 4, DIN.R);
      break; }
    case 'window': { // night window with half-drawn blinds
      g.fillStyle = DIN.V; g.fillRect(X - 1, Y - 1, 50, 38); g.fillStyle = '#0a1430'; g.fillRect(X, Y, 48, 36);
      g.fillStyle = '#1a2a5a'; g.fillRect(X, Y + 26, 48, 10); g.fillStyle = DIN.Y; g.fillRect(X + 8, Y + 22, 1, 1); g.fillRect(X + 30, Y + 18, 1, 1); g.fillStyle = DIN.C; g.fillRect(X + 40, Y + 24, 1, 1);
      for (let j = 0; j < 14; j += 2){ g.fillStyle = '#c8bfa4'; g.fillRect(X, Y + j, 48, 1); }
      g.fillStyle = '#8a8270'; g.fillRect(X + 44, Y, 1, 16 + ((frame >> 5) % 2));
      g.fillStyle = DIN.CH; g.fillRect(X - 1, Y + 17, 50, 1); g.fillRect(X + 23, Y, 2, 36);
      break; }
    case 'clock': { // wall clock stuck at 3:00
      g.fillStyle = DIN.V; g.beginPath(); g.arc(X + 8, Y + 8, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = DIN.CR; g.beginPath(); g.arc(X + 8, Y + 8, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = DIN.K; g.fillRect(X + 8, Y + 3, 1, 5); g.fillRect(X + 8, Y + 8, 4, 1); g.fillStyle = DIN.R; if ((frame >> 5) % 2) g.fillRect(X + 8, Y + 8, 1, 6);
      break; }
    case 'cert': { // health certificate: D+
      g.fillStyle = DIN.V; g.fillRect(X - 1, Y - 1, 22, 26); g.fillStyle = DIN.CR; g.fillRect(X, Y, 20, 24); g.fillStyle = DIN.Y; g.fillRect(X, Y, 20, 2);
      drawText(g, 'D+', X + 4, Y + 8, DIN.R); g.fillStyle = '#9a8e70'; g.fillRect(X + 3, Y + 18, 14, 1); g.fillRect(X + 3, Y + 20, 10, 1);
      break; }
    case 'crts': { // stacked CRTs (repair shop), live static
      const n = d.n || 3;
      for (let k = 0; k < n; k++){ const yy = Y - 18 * (k + 1), xx = X + ((k * 5) % 8);
        g.fillStyle = DIN.V; g.fillRect(xx - 1, yy - 1, 26, 19); g.fillStyle = k % 2 ? '#5a6270' : '#3a3f4a'; g.fillRect(xx, yy, 24, 17); g.fillStyle = '#05070d'; g.fillRect(xx + 2, yy + 2, 16, 12);
        const r = rng(frame * 3 + k * 17 + d.tx); for (let j = 0; j < 12; j += 2) for (let i = 0; i < 16; i += 2){ const v = r(); g.fillStyle = v < 0.5 ? '#20242c' : v < 0.85 ? '#5a6270' : '#c9d2dc'; g.fillRect(xx + 2 + i, yy + 2 + j, 2, 2); }
        g.fillStyle = DIN.C; g.globalAlpha = 0.25; g.fillRect(xx + 2, yy + 2 + ((frame + k * 5) % 12), 16, 1); g.globalAlpha = 1; g.fillStyle = '#8a929c'; g.fillRect(xx + 20, yy + 4, 2, 2); g.fillRect(xx + 20, yy + 9, 2, 2); }
      break; }
    case 'bench': { // repair workbench with a soldering lamp
      g.fillStyle = DIN.V; g.fillRect(X - 1, Y - 18, 66, 4); g.fillStyle = '#7a4a1e'; g.fillRect(X, Y - 17, 64, 2); g.fillStyle = '#3a2a1a'; g.fillRect(X + 2, Y - 14, 3, 14); g.fillRect(X + 59, Y - 14, 3, 14);
      g.fillStyle = DIN.CH; g.fillRect(X + 10, Y - 21, 10, 3); g.fillStyle = DIN.R; g.fillRect(X + 26, Y - 20, 6, 2); g.fillStyle = DIN.Y; g.fillRect(X + 40, Y - 36, 2, 18); g.fillRect(X + 40, Y - 36, 10, 2); g.fillRect(X + 48, Y - 36, 4, 4);
      g.globalAlpha = 0.12; g.fillStyle = DIN.Y; g.beginPath(); g.moveTo(X + 50, Y - 32); g.lineTo(X + 36, Y - 18); g.lineTo(X + 64, Y - 18); g.closePath(); g.fill(); g.globalAlpha = 1;
      break; }
    case 'boothback': { // tall booth back (vinyl) behind a table
      g.fillStyle = DIN.V; g.fillRect(X - 1, Y - 34, 18, 34); g.fillStyle = DIN.VIN; g.fillRect(X, Y - 33, 16, 33); g.fillStyle = DIN.VIN2; g.fillRect(X, Y - 33, 16, 2); g.fillStyle = '#6a0c1a'; for (let j = Y - 26; j < Y; j += 8) g.fillRect(X + 2, j, 12, 1);
      break; }
    case 'fryer': { // fryer basket rack (kitchen)
      g.fillStyle = DIN.V; g.fillRect(X - 1, Y - 30, 34, 30); g.fillStyle = DIN.CH2; g.fillRect(X, Y - 29, 32, 29); g.fillStyle = DIN.CH3; g.fillRect(X, Y - 29, 32, 1); dStripes(g, X, Y - 8, 32, 4, DIN.Y, DIN.K, 2);
      g.fillStyle = (frame >> 3) % 2 ? '#ff7a2a' : DIN.R; g.fillRect(X + 4, Y - 24, 3, 3); drawTiny(g, 'HOT', X + 12, Y - 24, DIN.R);
      break; }
    case 'ticket': { // order rail with tickets
      g.fillStyle = DIN.CH; g.fillRect(X, Y, 64, 2); for (let i = 0; i < 5; i++){ const sw = Math.sin(frame / 20 + i) > 0.95 ? 1 : 0; g.fillStyle = DIN.CR; g.fillRect(X + 3 + i * 12 + sw, Y + 2, 9, 13); g.fillStyle = '#8a8270'; g.fillRect(X + 4 + i * 12 + sw, Y + 5, 7, 1); g.fillRect(X + 4 + i * 12 + sw, Y + 8, 5, 1); g.fillStyle = DIN.R; g.fillRect(X + 4 + i * 12 + sw, Y + 3, 3, 1); }
      break; }
    case 'lamp': { // hanging fluorescent tube (flickers with the level)
      g.fillStyle = '#3a3f4a'; g.fillRect(X + 4, 0, 1, Y); g.fillRect(X + 28, 0, 1, Y); g.fillStyle = DIN.V; g.fillRect(X - 1, Y, 34, 5); g.fillStyle = d.lit ? '#f4fbff' : '#4a5058'; g.fillRect(X, Y + 1, 32, 3);
      break; }
  }
}

// ---------------- parallax backgrounds ----------------
function dinerLayers(kind, L, layer){
  if (kind === 'diner'){
    L.far = layer((x, r) => {
      dR(x, '#14110a', 0, 0, 512, 240); dR(x, '#2a2418', 0, 40, 512, 120); // wall
      for (let i = 0; i < 512; i += 8){ dR(x, '#d8cfb4', i, 160, 7, 7); dR(x, '#1e1a12', i, 167, 8, 1); } // tile band
      for (let i = 0; i < 512; i += 16) dR(x, '#20190e', i, 40, 1, 120); dR(x, DIN.R, 0, 156, 512, 2);
      for (const wx of [30, 160, 290, 420]){ // night windows with blinds
        dR(x, DIN.V, wx - 2, 60, 68, 70); dR(x, '#08102a', wx, 62, 64, 66); dR(x, '#141e44', wx, 110, 64, 18);
        for (let k = 0; k < 6; k++){ dR(x, r() < 0.5 ? DIN.Y : DIN.C, wx + ((r() * 60) | 0), 96 + ((r() * 28) | 0), 1, 1); }
        for (let j = 62; j < 92; j += 3) dR(x, '#8a8270', wx, j, 64, 1); dR(x, '#5a5446', wx + 31, 62, 2, 66); dR(x, '#5a5446', wx, 92, 64, 1);
      }
      for (let i = 0; i < 30; i++) dR(x, 'rgba(0,0,0,0.3)', (r() * 512) | 0, 44 + ((r() * 110) | 0), 1 + ((r() * 3) | 0), 2 + ((r() * 10) | 0)); // drips/stains
    });
    L.mid = layer((x, r) => {
      for (const bx of [10, 200, 380]){ // booths silhouettes + counter
        dR(x, '#3a0a14', bx, 176, 70, 32); dR(x, '#5a1020', bx, 176, 70, 3); dR(x, '#5a6270', bx + 18, 186, 34, 3); dR(x, '#8a929c', bx + 18, 186, 34, 1); dR(x, '#2a2e36', bx + 33, 189, 4, 19);
      }
      dR(x, '#5a6270', 100, 168, 90, 4); dR(x, '#c9d2dc', 100, 168, 90, 1); dR(x, '#2a1e14', 100, 172, 90, 36); for (let i = 104; i < 190; i += 10) dR(x, DIN.R, i, 180, 6, 1);
      // pie case + coffee pots
      dR(x, '#0a0c12', 120, 146, 30, 22); dR(x, 'rgba(0,237,255,0.25)', 121, 147, 28, 20); dR(x, DIN.TOAST, 125, 158, 8, 4); dR(x, DIN.JAM, 136, 158, 8, 4);
      dR(x, '#3a3f4a', 160, 158, 8, 10); dR(x, '#14110a', 161, 162, 6, 5); dR(x, '#3a3f4a', 172, 158, 8, 10); dR(x, '#7a3e10', 173, 162, 6, 5);
      // pendant fluorescent tubes
      for (const lx of [60, 230, 400]){ dR(x, '#3a3f4a', lx, 0, 1, 30); dR(x, '#3a3f4a', lx + 40, 0, 1, 30); dR(x, '#c9d2dc', lx - 2, 30, 44, 3); x.globalAlpha = 0.06; x.fillStyle = '#e8f4ff'; x.beginPath(); x.moveTo(lx, 33); x.lineTo(lx - 30, 140); x.lineTo(lx + 70, 140); x.lineTo(lx + 40, 33); x.closePath(); x.fill(); x.globalAlpha = 1; }
      drawTextC(x, 'MENU', 300, 48, DIN.Y); dR(x, '#0a0c12', 270, 58, 60, 40); for (let j = 62; j < 96; j += 6){ dR(x, DIN.CR, 274, j, 30, 2); dR(x, DIN.CR, 318, j, 8, 2); }
    });
  } else if (kind === 'kitchen'){
    L.far = layer((x, r) => {
      dR(x, '#1a1e24', 0, 0, 512, 240); for (let j = 40; j < 210; j += 8) for (let i = (j / 8 % 2) * 8; i < 512; i += 16) dR(x, '#242a32', i, j, 15, 7);
      for (const hx of [40, 220, 400]){ dR(x, '#3a4048', hx, 30, 90, 30); dR(x, '#5a626c', hx, 30, 90, 3); for (let i = hx + 6; i < hx + 86; i += 6) dR(x, '#14181e', i, 40, 3, 14); dR(x, '#3a4048', hx + 40, 0, 10, 30); } // hoods
      for (let i = 0; i < 26; i++) dR(x, 'rgba(200,154,42,0.12)', (r() * 512) | 0, 60 + ((r() * 140) | 0), 2, 6 + ((r() * 18) | 0)); // grease streaks
    });
    L.mid = layer((x, r) => {
      for (const sx of [0, 256]){ dR(x, '#5a626c', sx + 20, 100, 120, 3); dR(x, '#5a626c', sx + 20, 130, 120, 3); // shelves of loaves
        for (let i = 0; i < 6; i++){ dR(x, '#c88a3a', sx + 26 + i * 19, 88, 14, 12); dR(x, '#e8b060', sx + 26 + i * 19, 88, 14, 3); dR(x, i % 2 ? '#d8cfb4' : DIN.JAM, sx + 26 + i * 18, 120, 10, 10); } }
      for (const tx of [170, 420]){ dR(x, '#c9d2dc', tx, 70, 60, 2); for (let i = 0; i < 4; i++){ dR(x, DIN.CR, tx + 3 + i * 14, 72, 10, 14); dR(x, '#8a8270', tx + 5 + i * 14, 76, 6, 1); } }
      dR(x, '#2a3038', 0, 176, 512, 32); for (let i = 0; i < 512; i += 40){ dR(x, '#5a626c', i + 4, 176, 32, 3); dR(x, '#ff7a2a', i + 10, 186, 3, 3); }
    });
  } else if (kind === 'booth'){
    L.far = layer((x, r) => {
      dR(x, '#0e0408', 0, 0, 512, 240); for (let i = 0; i < 512; i += 24) for (let j = 30; j < 200; j += 24){ dR(x, '#2a0a12', i + 4, j + 4, 8, 8); dR(x, '#1a060c', i + 16, j + 16, 6, 6); } // wallpaper
      for (const cx of [60, 300]){ // giant card mural (back side)
        dR(x, DIN.V, cx - 2, 50, 84, 116); dR(x, '#14110a', cx, 52, 80, 112); x.globalAlpha = 0.5; dStripes(x, cx + 4, 56, 72, 104, '#3a2a00', '#14110a', 6); x.globalAlpha = 1; dR(x, '#5a1a40', cx + 30, 96, 20, 20); }
    });
    L.mid = layer((x, r) => {
      for (const bx of [150, 410]){ dR(x, '#5a1020', bx, 150, 80, 58); dR(x, '#8a1a30', bx, 150, 80, 4); dR(x, '#5a6270', bx + 20, 176, 40, 4); dR(x, '#c9d2dc', bx + 20, 176, 40, 1); // the last booth
        dR(x, '#3a3f4a', bx + 40, 0, 1, 120); dR(x, DIN.Y, bx + 34, 120, 13, 6); x.globalAlpha = 0.08; x.fillStyle = DIN.Y; x.beginPath(); x.moveTo(bx + 36, 126); x.lineTo(bx + 4, 200); x.lineTo(bx + 76, 200); x.lineTo(bx + 46, 126); x.closePath(); x.fill(); x.globalAlpha = 1; }
      for (let i = 0; i < 7; i++){ const cx = (r() * 480) | 0, cy = 60 + ((r() * 80) | 0); dR(x, DIN.CR, cx, cy, 8, 11); dR(x, i % 2 ? DIN.R : DIN.K, cx + 2, cy + 3, 4, 4); } // tacked-up cards
    });
  } else { // repair: back-room repair shop full of CRTs
    L.far = layer((x, r) => {
      dR(x, '#120e0a', 0, 0, 512, 240); for (let j = 30; j < 200; j += 6) for (let i = (j / 6 % 2) * 3; i < 512; i += 6) dR(x, '#2a2016', i, j, 1, 1); // pegboard
      for (let i = 0; i < 512; i += 128){ dR(x, '#3a2a1a', i + 10, 110, 100, 4); dR(x, '#3a2a1a', i + 10, 60, 100, 4);
        for (let k = 0; k < 4; k++){ dR(x, '#2a2e36', i + 14 + k * 24, 88, 20, 22); dR(x, '#0a0c12', i + 17 + k * 24, 91, 14, 14); dR(x, r() < 0.5 ? '#1e4a50' : '#3a1a40', i + 18 + k * 24, 92, 12, 12); dR(x, '#2a2e36', i + 14 + k * 24, 40, 20, 20); dR(x, '#0a0c12', i + 17 + k * 24, 43, 14, 13); } }
      for (let i = 0; i < 12; i++){ const tx = (r() * 500) | 0, ty = 130 + ((r() * 40) | 0); dR(x, '#5a626c', tx, ty, 2, 12); dR(x, '#5a626c', tx - 2, ty, 6, 2); } // hanging tools
    });
    L.mid = layer((x, r) => {
      dStripes(x, 0, 200, 512, 8, '#3a3000', '#120e0a', 4);
      for (const sx of [40, 300]){ dR(x, '#0a0c12', sx, 120, 70, 50); dR(x, '#14110a', sx + 2, 122, 66, 46); drawTextC(x, 'NO REFUNDS', sx + 35, 128, DIN.R); drawTextC(x, 'NO RERUNS', sx + 35, 140, DIN.Y); drawTextC(x, 'NO SIGNAL', sx + 35, 152, '#8b909c'); }
      for (let i = 0; i < 4; i++){ x.strokeStyle = i % 2 ? '#2a1e14' : '#3a2416'; x.lineWidth = 2; x.beginPath(); x.moveTo(i * 130, 30); x.quadraticCurveTo(i * 130 + 60, 80 + i * 6, i * 130 + 128, 34); x.stroke(); } // dangling cables
    });
  }
}
