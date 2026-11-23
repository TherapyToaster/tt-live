// World 7: TOASTY ARCADE — original procedural pixel art for Mr. Toasty's neon after-hours arcade (lore: lore/arcade.md).
// Carpet with neon confetti, chrome rails, mirror balls, light beams, CRT glow, token pushers and prize cabinets, a PA ticker
// with jokes. Cozy, slightly haunted, 3 AM. Arcade tokens and prize tickets only: no cash, no betting, no wallets.
// Palette: void black, toast gold #FFD400, chrome, magenta #ff00c8, cyan #00f0ff, carpet purple, neon confetti, warm bulb amber.
// Jam is always grape purple (#b54e8c). No real brands, no gore.
'use strict';
const ARC = { I: '#07060c', V: '#07060c', Y: '#FFD400', Y2: '#c89a00', Y3: '#fff3a0', CH: '#c8d0dc', CH2: '#8a94a6', CH3: '#eef2f8', CH4: '#5a6274',
  M: '#ff00c8', M2: '#a0007e', M3: '#ff8ae6', C: '#00f0ff', C2: '#0090a8', C3: '#a8fbff', P: '#3a1a5a', P2: '#24103a', P3: '#5a2a86', P4: '#7a46b0',
  AM: '#ffb347', AM2: '#ff8a1a', R: '#ff3050', GR: '#3aff7a', W: '#ffffff', CR: '#c8862a', CR2: '#e0a24a', BR: '#8a5a12', JAM: '#b54e8c' };
const ARC_CONFETTI = [ARC.M, ARC.C, ARC.Y, ARC.GR, ARC.AM];
function aCv(w, h, fn){ const c = mkCanvas(w, h), x = c.getContext('2d'); fn(x); return c; }
function aR(x, c, a, b, w, h){ x.fillStyle = c; x.fillRect(a, b, w, h); }
function aInk(src){ return typeof pitOutline === 'function' ? pitOutline(src, ARC.I) : src; }
// the arcade token: gold, a toast-slice stamp in the middle (lore: #FFD400 toast stamp)
function arcToken(x, ox, oy, r, edge){
  if (edge){ aR(x, ARC.I, ox + r - 2, oy, 4, r * 2); aR(x, ARC.Y2, ox + r - 1, oy + 1, 2, r * 2 - 2); aR(x, ARC.Y, ox + r - 1, oy + 2, 1, r * 2 - 4); return; }
  x.fillStyle = ARC.I; x.beginPath(); x.arc(ox + r, oy + r, r, 0, Math.PI * 2); x.fill();
  x.fillStyle = ARC.Y2; x.beginPath(); x.arc(ox + r, oy + r, r - 1, 0, Math.PI * 2); x.fill();
  x.fillStyle = ARC.Y; x.beginPath(); x.arc(ox + r - 0.5, oy + r - 0.5, r - 2, 0, Math.PI * 2); x.fill();
  const s = Math.max(2, Math.round(r * 0.45)); // toast-slice stamp
  aR(x, ARC.Y2, ox + r - s, oy + r - s + 1, s * 2, s * 2 - 1); aR(x, ARC.Y2, ox + r - s + 1, oy + r - s, s * 2 - 2, 1); aR(x, ARC.Y3, ox + r - s + 1, oy + r - s + 1, 1, 1);
}

// ---------------- tiles ----------------
function arcadeTiles(ts, th){
  const kind = th.bg;
  const K = kind === 'arcprize' ? { a: '#2a1440', b: '#3a1a5a', top: ARC.CH, top2: ARC.CH3 }
    : kind === 'arcstatic' ? { a: '#12101c', b: '#1e1a2c', top: ARC.C2, top2: ARC.C }
    : kind === 'arcvault' ? { a: '#1c1408', b: '#2c2010', top: ARC.Y2, top2: ARC.Y }
    : { a: ARC.P2, b: ARC.P, top: ARC.CH, top2: ARC.CH3 };
  const carpet = (top, i) => aCv(16, 16, x => {
    aR(x, K.a, 0, 0, 16, 16);
    const r = rng(300 + i * 13); for (let k = 0; k < 9; k++){ x.fillStyle = r() < 0.5 ? K.b : ARC_CONFETTI[(r() * ARC_CONFETTI.length) | 0]; x.fillRect((r() * 15) | 0, (r() * 15) | 0, r() < 0.3 ? 2 : 1, 1); } // neon confetti carpet
    if (kind === 'arcvault'){ aR(x, '#3a2a10', 0, 7, 16, 1); aR(x, '#3a2a10', 7, 0, 1, 16); } // vault floor plates
    if (top){ aR(x, ARC.I, 0, 0, 16, 1); aR(x, K.top, 0, 1, 16, 2); aR(x, K.top2, 0, 1, 16, 1); aR(x, ARC.I, 0, 3, 16, 1); aR(x, i % 2 ? ARC.M : ARC.C, (i * 5 + 3) % 14, 2, 2, 1); } // chrome rail trim with a neon stud
  });
  ts.groundTop = [0, 1, 2, 3].map(i => carpet(true, i));
  ts.ground = [0, 1, 2, 3].map(i => aCv(16, 16, x => { x.drawImage(carpet(false, i), 0, 0); aR(x, 'rgba(5,4,8,0.3)', 0, 0, 16, 16); }));
  ts.brick = aCv(16, 16, x => { // a prize crate (breakable)
    aR(x, ARC.I, 0, 0, 16, 16); aR(x, ARC.CR, 1, 1, 14, 14); aR(x, ARC.CR2, 1, 1, 14, 2); aR(x, ARC.BR, 1, 13, 14, 2); aR(x, ARC.BR, 7, 1, 2, 14);
    aR(x, ARC.M, 3, 6, 3, 3); aR(x, ARC.C, 10, 6, 3, 3); aR(x, ARC.I, 1, 7, 14, 1);
  });
  ts.solid = aCv(16, 16, x => { // a chrome cabinet panel with a neon edge
    aR(x, ARC.I, 0, 0, 16, 16); aR(x, ARC.CH2, 1, 1, 14, 14); aR(x, ARC.CH, 1, 1, 14, 2); aR(x, ARC.CH4, 1, 13, 14, 2); aR(x, ARC.CH3, 2, 1, 6, 1);
    aR(x, ARC.I, 4, 5, 8, 5); aR(x, kind === 'arcvault' ? ARC.Y : ARC.M, 5, 6, 6, 1); aR(x, kind === 'arcvault' ? ARC.AM : ARC.C, 5, 8, 6, 1);
  });
  ts.used = aCv(16, 16, x => { aR(x, ARC.I, 0, 0, 16, 16); aR(x, '#2a2436', 1, 1, 14, 14); aR(x, '#3a3448', 2, 2, 12, 9); aR(x, '#151320', 3, 3, 10, 7); });
  ts.crt = [0, 1, 2, 3].map(f => aCv(16, 16, x => { // "?" block: a mini prize machine with a blinking "?"
    aR(x, ARC.I, 0, 0, 16, 16); aR(x, ARC.M2, 1, 1, 14, 14); aR(x, ARC.M, 1, 1, 14, 2); aR(x, '#10101a', 3, 3, 10, 8); aR(x, ARC.CH, 3, 12, 10, 2); aR(x, f % 2 ? ARC.Y : ARC.AM, 7, 12, 2, 2);
    drawText(x, '?', 5, 4, f === 1 ? ARC.C : ARC.Y);
  }));
  ts.mimicTell = ts.crt[0];
  ts.plank = aCv(16, 16, x => { aR(x, ARC.I, 0, 0, 16, 5); aR(x, ARC.CH, 0, 1, 16, 2); aR(x, ARC.CH3, 0, 1, 16, 1); aR(x, ARC.CH4, 0, 3, 16, 1); aR(x, ARC.I, 3, 5, 2, 3); aR(x, ARC.I, 11, 5, 2, 3); }); // chrome rail (one-way)
  ts.stone = aCv(16, 16, x => { // themed solid block
    aR(x, ARC.I, 0, 0, 16, 16);
    if (kind === 'arcprize'){ aR(x, '#1a0e2a', 1, 1, 14, 14); const cols = [[ARC.M, ARC.M3], [ARC.C, ARC.C3], [ARC.Y, ARC.Y3], [ARC.GR, '#b4ffd0']]; // a stack of prize capsules
      [[4, 4, 0], [11, 4, 1], [4, 11, 2], [11, 11, 3]].forEach(([cx, cy, k]) => { x.fillStyle = ARC.I; x.beginPath(); x.arc(cx, cy, 3.6, 0, Math.PI * 2); x.fill(); x.fillStyle = cols[k][0]; x.beginPath(); x.arc(cx, cy, 2.8, Math.PI, 0); x.fill(); x.fillStyle = ARC.CH3; x.beginPath(); x.arc(cx, cy, 2.8, 0, Math.PI); x.fill(); aR(x, cols[k][1], cx - 2, cy - 2, 1, 1); }); }
    else if (kind === 'arcstatic'){ aR(x, '#3a3646', 1, 1, 14, 14); aR(x, '#0c0e14', 2, 2, 12, 9); const r = rng(77); for (let k = 0; k < 14; k++) aR(x, r() < 0.5 ? '#c0c0c8' : '#50505a', 2 + ((r() * 12) | 0), 2 + ((r() * 9) | 0), 1, 1); aR(x, '#24202c', 2, 12, 12, 2); }
    else if (kind === 'arcvault'){ aR(x, '#6a5a3a', 1, 1, 14, 14); aR(x, '#8a7a52', 1, 1, 14, 2); x.fillStyle = ARC.I; for (const [a, b] of [[3, 4], [12, 4], [3, 12], [12, 12]]) x.fillRect(a, b, 1, 1); aR(x, ARC.Y2, 5, 6, 6, 4); aR(x, ARC.Y, 6, 7, 4, 2); }
    else { aR(x, ARC.P3, 1, 1, 14, 14); aR(x, ARC.P4, 1, 1, 14, 2); aR(x, '#0c0a14', 3, 4, 10, 6); aR(x, ARC.C, 4, 5, 3, 2); aR(x, ARC.M, 9, 7, 3, 2); aR(x, ARC.CH, 3, 12, 10, 1); } // cabinet side
  });
  ts.acid = [0, 1, 2, 3].map(f => aCv(16, 16, x => { // hazard: a tray of sparking static tokens
    aR(x, ARC.I, 0, 0, 16, 16); aR(x, '#3a2a08', 0, 5, 16, 11); aR(x, ARC.Y2, 0, 5, 16, 3); aR(x, ARC.Y, 0, 5, 16, 1);
    const r = rng(90 + f); for (let i = 0; i < 4; i++) aR(x, r() < 0.5 ? ARC.C : ARC.W, (r() * 14) | 0, 6 + ((r() * 8) | 0), 2, 1);
  }));
  ts.crumble = aCv(16, 16, x => { aR(x, ARC.I, 0, 0, 16, 16); aR(x, ARC.CR, 1, 1, 14, 14); aR(x, ARC.I, 4, 2, 1, 6); aR(x, ARC.I, 5, 8, 4, 1); aR(x, ARC.I, 10, 6, 1, 7); });
  // CRT platforms (7-3): a CRT screen lying on its back. on = glowing picture, off = dark glass with a dot
  const crtTile = (col, hi, on, warn) => aCv(16, 16, x => {
    aR(x, ARC.I, 0, 0, 16, 16); aR(x, '#4a4658', 1, 1, 14, 14); aR(x, '#6a667a', 1, 1, 14, 1); aR(x, '#2a2634', 1, 13, 14, 2);
    if (on){ aR(x, col, 2, 2, 12, 9); aR(x, hi, 2, 2, 12, 2); for (let j = 3; j < 11; j += 2) aR(x, 'rgba(0,0,0,0.25)', 2, j, 12, 1); aR(x, ARC.W, 5, 5, 2, 2); aR(x, ARC.W, 9, 5, 2, 2); aR(x, ARC.I, 5, 8, 6, 1); // a smiley test card
      if (warn){ const r = rng(5); for (let k = 0; k < 20; k++) aR(x, r() < 0.5 ? ARC.W : '#555', 2 + ((r() * 12) | 0), 2 + ((r() * 9) | 0), 1, 1); } }
    else { aR(x, '#0a0a10', 2, 2, 12, 9); aR(x, '#20202c', 7, 6, 2, 1); }
    aR(x, ARC.Y, 12, 12, 2, 1);
  });
  ts.crtA = [crtTile(ARC.M, ARC.M3, true), crtTile(ARC.M, ARC.M3, false), crtTile(ARC.M, ARC.M3, true, true)];
  ts.crtB = [crtTile(ARC.C, ARC.C3, true), crtTile(ARC.C, ARC.C3, false), crtTile(ARC.C, ARC.C3, true, true)];
  ts.arcade = true;
  return ts;
}

// ---------------- sprites ----------------
function buildArcadeSprites(){
  const B = {};
  const pair = (w, h, fn) => { const a = [aInk(aCv(w, h, x => fn(x, 0))), aInk(aCv(w, h, x => fn(x, 1)))]; return { R: a, L: a.map(flipH) }; };
  // Tilt Token: a big rolling token with angry eyes; 4 roll frames, toppled = flat
  B.ttoken = [0, 1, 2, 3].map(f => aInk(aCv(14, 14, x => {
    if (f === 2){ arcToken(x, 0, 0, 7, true); return; }
    if (f === 0){ arcToken(x, 0, 0, 7); } else { x.save(); x.translate(7, 0); x.scale(f === 1 ? 0.6 : -0.6, 1); x.translate(-7, 0); arcToken(x, 0, 0, 7); x.restore(); }
    aR(x, ARC.I, 4, 4, 2, 2); aR(x, ARC.I, 8, 4, 2, 2); aR(x, ARC.I, 4, 3, 2, 1); aR(x, ARC.I, 8, 3, 2, 1);
  })));
  B.ttokenFlat = aInk(aCv(16, 5, x => { aR(x, ARC.Y2, 0, 1, 16, 4); aR(x, ARC.Y, 1, 1, 14, 2); aR(x, ARC.I, 5, 2, 2, 1); aR(x, ARC.I, 9, 2, 2, 1); }));
  // Capsule Crab: a prize capsule (magenta top, clear bottom) on crab legs, claws up; opens to let a mini figure out
  const crab = (x, f, open) => {
    if (!open){ x.fillStyle = ARC.M; x.beginPath(); x.arc(8, 7, 6, Math.PI, 0); x.fill(); aR(x, ARC.M3, 4, 3, 2, 2); }
    else { aR(x, ARC.M, 1, 0, 6, 3); aR(x, ARC.M, 10, 0, 5, 3); }
    aR(x, 'rgba(200,240,255,0.65)', 2, 7, 12, 4); aR(x, ARC.CH, 2, 7, 12, 1); if (!open){ aR(x, ARC.CR, 6, 8, 4, 3); aR(x, ARC.I, 7, 9, 1, 1); }
    aR(x, ARC.I, 4, 5, 2, 2); aR(x, ARC.I, 10, 5, 2, 2); aR(x, ARC.W, 4, 5, 1, 1); aR(x, ARC.W, 10, 5, 1, 1);
    aR(x, ARC.R, 0, 4 - f, 2, 3); aR(x, ARC.R, 14, 4 - f, 2, 3); // claws
    for (let k = 0; k < 3; k++){ aR(x, ARC.R, 3 + k * 2 + (f ? 1 : 0), 11, 1, 2); aR(x, ARC.R, 10 + k * 2 - (f ? 1 : 0), 11, 1, 2); }
  };
  B.ccrab = pair(16, 13, (x, f) => crab(x, f, false));
  B.ccrabOpen = pair(16, 13, (x, f) => crab(x, f, true));
  // Mini figure: a tiny toast figurine that hops out of a capsule
  B.minifig = pair(8, 10, (x, f) => { aR(x, ARC.CR, 1, 0, 6, 6); aR(x, ARC.CR2, 2, 1, 4, 4); aR(x, ARC.I, 2, 2, 1, 1); aR(x, ARC.I, 5, 2, 1, 1); aR(x, ARC.I, 3, 4, 2, 1); aR(x, ARC.M, 2, 6, 4, 2); aR(x, ARC.I, f ? 1 : 2, 8, 2, 2); aR(x, ARC.I, f ? 5 : 4, 8, 2, 2); });
  // Claw Drop: a crane claw on a cable; grabs you and lifts you back to the start of the section
  const claw = (x, closed) => { aR(x, ARC.CH, 5, 0, 6, 5); aR(x, ARC.CH3, 6, 0, 2, 4); aR(x, ARC.R, 6, 5, 4, 2);
    const o = closed ? 0 : 3; aR(x, ARC.CH2, 3 - o, 6, 3, 2); aR(x, ARC.CH2, 10 + o, 6, 3, 2); aR(x, ARC.CH, 2 - o, 8, 2, 6); aR(x, ARC.CH, 12 + o, 8, 2, 6); aR(x, ARC.CH, 4 - o + (closed ? 1 : 0), 13, 2, 2); aR(x, ARC.CH, 10 + o - (closed ? 1 : 0), 13, 2, 2); };
  B.claw = aInk(aCv(22, 16, x => { x.translate(3, 0); claw(x, false); }));
  B.clawShut = aInk(aCv(22, 16, x => { x.translate(3, 0); claw(x, true); }));
  // Static Ghost: a CRT-static ghost (only exists while the CRTs are on)
  B.sghost = [0, 1].map(f => aCv(16, 16, x => { x.fillStyle = 'rgba(220,230,255,0.75)'; x.beginPath(); x.arc(8, 7, 6, Math.PI, 0); x.fill(); x.fillRect(2, 7, 12, 6);
    for (let k = 0; k < 4; k++) aR(x, 'rgba(220,230,255,0.75)', 2 + k * 3 + (f ? 1 : 0), 13, 2, 2);
    const r = rng(11 + f); for (let k = 0; k < 26; k++) aR(x, r() < 0.4 ? ARC.M : r() < 0.7 ? ARC.C : '#60607a', 2 + ((r() * 12) | 0), 2 + ((r() * 12) | 0), 1, 1);
    aR(x, ARC.I, 5, 6, 2, 3); aR(x, ARC.I, 9, 6, 2, 3); aR(x, ARC.I, 7, 10, 2, 1); }));
  // Ticket Snake: a strip of prize tickets with a face; lives in a cabinet slot and whips out
  B.tsHead = pair(12, 9, (x, f) => { aR(x, ARC.AM, 0, 1, 11, 7); aR(x, '#ffd090', 1, 1, 9, 2); aR(x, ARC.AM2, 0, 6, 11, 2); aR(x, ARC.I, 7, 2, 2, 2); aR(x, ARC.W, 7, 2, 1, 1); aR(x, ARC.R, 10, f ? 4 : 5, 2, 1); for (let k = 1; k < 7; k += 2) aR(x, ARC.I, 0, k, 1, 1); });
  B.tsSeg = aCv(8, 7, x => { aR(x, ARC.I, 0, 0, 8, 7); aR(x, ARC.AM, 0, 1, 8, 5); aR(x, ARC.AM2, 0, 4, 8, 2); aR(x, ARC.I, 3, 2, 2, 1); aR(x, ARC.I, 7, 1, 1, 5); });
  B.tsBox = aInk(aCv(18, 22, x => { aR(x, ARC.P3, 0, 0, 18, 22); aR(x, ARC.P4, 0, 0, 18, 3); aR(x, ARC.I, 2, 6, 14, 3); aR(x, ARC.AM, 3, 7, 12, 1); drawTiny(x, 'TIX', 3, 12, ARC.Y); aR(x, ARC.CH, 0, 19, 18, 3); }));
  // pickups: token, prize tickets, mini figure capsule, Hot Streak
  B.token = aCv(10, 10, x => arcToken(x, 0, 0, 5));
  B.ticket = aInk(aCv(12, 7, x => { aR(x, ARC.AM, 0, 0, 12, 7); aR(x, '#ffd090', 1, 1, 10, 2); aR(x, ARC.R, 0, 3, 1, 1); aR(x, ARC.R, 11, 3, 1, 1); drawTiny(x, 'TIX', 1, 1, ARC.I); }));
  B.figcap = [0, 1].map(f => aInk(aCv(12, 14, x => { x.fillStyle = f ? ARC.C : ARC.M; x.beginPath(); x.arc(6, 6, 5, Math.PI, 0); x.fill(); x.fillStyle = 'rgba(220,245,255,0.8)'; x.beginPath(); x.arc(6, 6, 5, 0, Math.PI); x.fill(); aR(x, ARC.CH3, 1, 6, 10, 1); aR(x, ARC.CR, 4, 7, 4, 3); aR(x, ARC.I, 5, 8, 1, 1); aR(x, ARC.W, 3, 2, 2, 1); })));
  B.streak = [0, 1].map(f => aInk(aCv(14, 16, x => { aR(x, ARC.AM2, 3, 0 + f, 3, 4); aR(x, ARC.R, 7, 1 - f + 1, 3, 4); aR(x, ARC.Y, 5, 2, 3, 3); arcToken(x, 0, 3, 7); aR(x, ARC.R, 3, 8, 8, 2); aR(x, ARC.AM2, 4, 8, 6, 1); })));
  B.orbit = aCv(9, 9, x => { arcToken(x, 0, 0, 4.5); });
  // THE JACKPOT VAULT (boss body): an overgrown token pusher, 64x84, chrome cabinet, marquee, pusher deck, token chute, ticket slot.
  // The CRT face and the payout button are drawn live on top (they react).
  B.vault = aInk(aCv(64, 84, x => {
    aR(x, ARC.CH4, 2, 6, 60, 78); aR(x, ARC.CH2, 4, 8, 56, 74); aR(x, ARC.CH, 4, 8, 56, 3); aR(x, ARC.CH3, 6, 9, 20, 1); // cabinet
    aR(x, ARC.M2, 0, 0, 64, 9); aR(x, ARC.M, 1, 1, 62, 7); drawTiny(x, 'JACKPOT VAULT', 5, 2, ARC.Y); // marquee
    for (let i = 0; i < 8; i++) aR(x, i % 2 ? ARC.AM : ARC.Y, 3 + i * 8, 10, 3, 2); // bulbs
    aR(x, ARC.I, 9, 13, 46, 26); // CRT bezel (face drawn live)
    aR(x, '#2a2236', 6, 42, 52, 18); aR(x, ARC.I, 6, 42, 52, 1); // pusher window
    const r = rng(7); for (let i = 0; i < 26; i++){ const tx = 8 + ((r() * 46) | 0), ty = 50 + ((r() * 8) | 0); arcToken(x, tx - 2, ty - 2, 2.5); } // a heap of tokens on the deck
    aR(x, ARC.CH3, 8, 44, 48, 4); aR(x, ARC.CH, 8, 48, 48, 1); // the pusher bar
    aR(x, ARC.I, 6, 62, 52, 20); aR(x, '#3a3448', 7, 63, 50, 18); aR(x, ARC.I, 36, 66, 18, 4); aR(x, ARC.AM, 37, 67, 16, 2); drawTiny(x, 'TICKETS', 34, 72, ARC.AM); // ticket slot
    aR(x, ARC.I, 10, 76, 22, 6); aR(x, '#18141e', 11, 77, 20, 4); // token tray
  }));
  B.armClaw = aInk(aCv(20, 18, x => { aR(x, ARC.CH, 7, 0, 6, 5); aR(x, ARC.R, 8, 5, 4, 2); aR(x, ARC.CH2, 3, 6, 14, 2); aR(x, ARC.CH, 2, 8, 3, 8); aR(x, ARC.CH, 15, 8, 3, 8); aR(x, ARC.CH3, 4, 15, 3, 2); aR(x, ARC.CH3, 13, 15, 3, 2); }));
  B.tokWave = aInk(aCv(12, 12, x => { arcToken(x, 0, 0, 6); aR(x, ARC.I, 3, 4, 2, 2); aR(x, ARC.I, 7, 4, 2, 2); }));
  return B;
}

// ---------------- decor ----------------
const ARCADE_DECOR = new Set(['cabinet', 'pusherbox', 'mirrorball', 'ticker', 'prizeshelf', 'neon7', 'gacha', 'crtwall', 'banner7', 'beams', 'bulbs']);
const ARC_TICKER = ['NOW SERVING: TOAST', 'LOST AND FOUND: ONE (1) CRUST', 'PLEASE DO NOT FEED THE CLAW', 'TICKETS NEVER EXPIRE. THEY JUST GET STALE',
  'THE ARCADE CLOSES AT 3 AM. IT IS 3 AM.', 'MR. TOASTY SAYS: NO RUNNING (UNLESS CHASED)', 'HIGH SCORE: MR. TOASTY. AGAIN.', 'IF YOU SEE A GHOST IN A SCREEN, WAVE'];
function drawArcadeDecor(g, d, X, Y, frame){
  switch (d.kind){
    case 'cabinet': { // an arcade cabinet playing a little toast game
      const v = (d.v || 0) % 3, body = [ARC.P3, ARC.M2, ARC.C2][v];
      g.fillStyle = ARC.I; g.fillRect(X - 1, Y - 49, 26, 50); g.fillStyle = body; g.fillRect(X, Y - 48, 24, 48); g.fillStyle = ARC.I; g.fillRect(X + 3, Y - 44, 18, 6); g.fillStyle = [ARC.Y, ARC.C, ARC.M][v]; g.fillRect(X + 4, Y - 43, 16, 4);
      g.fillStyle = ARC.I; g.fillRect(X + 3, Y - 36, 18, 14); g.fillStyle = '#0a0c16'; g.fillRect(X + 4, Y - 35, 16, 12);
      const t = (frame + d.tx * 13) % 64; g.fillStyle = ARC.CR; g.fillRect(X + 5 + (t >> 2) % 12, Y - 28, 3, 3); g.fillStyle = ARC.Y; g.fillRect(X + 4 + ((t * 3) >> 2) % 14, Y - 33, 1, 1); g.fillStyle = ARC.M; g.fillRect(X + 16 - ((t >> 3) % 10), Y - 31, 2, 2);
      g.fillStyle = ARC.CH; g.fillRect(X + 1, Y - 20, 22, 5); g.fillStyle = ARC.R; g.fillRect(X + 5, Y - 19, 3, 3); g.fillStyle = ARC.Y; g.fillRect(X + 12, Y - 19, 2, 2); g.fillRect(X + 16, Y - 19, 2, 2); g.fillStyle = ARC.I; g.fillRect(X + 6, Y - 22, 1, 3);
      g.fillStyle = ARC.I; g.fillRect(X + 9, Y - 10, 6, 3); g.fillStyle = ARC.Y; g.fillRect(X + 10, Y - 9, 4, 1);
      g.globalAlpha = 0.12; g.fillStyle = [ARC.Y, ARC.C, ARC.M][v]; g.fillRect(X - 6, Y - 40, 36, 30); g.globalAlpha = 1; break; }
    case 'pusherbox': { // a token pusher machine (decor): tokens slide on a moving deck behind glass
      g.fillStyle = ARC.I; g.fillRect(X - 1, Y - 41, 34, 42); g.fillStyle = ARC.CH2; g.fillRect(X, Y - 40, 32, 40); g.fillStyle = ARC.M; g.fillRect(X, Y - 40, 32, 5); drawTiny(g, 'PUSHER', X + 4, Y - 39, ARC.Y);
      g.fillStyle = '#1e1a2a'; g.fillRect(X + 2, Y - 32, 28, 16); const px = Math.round(Math.sin(frame * 0.05 + d.tx) * 4); g.fillStyle = ARC.CH3; g.fillRect(X + 4 + px, Y - 30, 10, 3);
      for (let i = 0; i < 7; i++){ g.fillStyle = i % 2 ? ARC.Y : ARC.Y2; g.fillRect(X + 4 + i * 3 + (i > 3 ? px >> 1 : 0), Y - 22 - (i % 3), 3, 2); }
      g.fillStyle = ARC.I; g.fillRect(X + 2, Y - 12, 28, 6); g.fillStyle = (frame >> 4) % 2 ? ARC.AM : ARC.AM2; g.fillRect(X + 3, Y - 11, 26, 4); break; }
    case 'mirrorball': { // a mirror ball on a chain, throwing little lights
      g.fillStyle = '#3a3448'; g.fillRect(X + 7, 0, 2, Y - 8); const r = 8; g.fillStyle = ARC.I; g.beginPath(); g.arc(X + 8, Y, r + 1, 0, Math.PI * 2); g.fill();
      for (let j = -r; j < r; j += 3) for (let i = -r; i < r; i += 3){ if (i * i + j * j > r * r) continue; const k = ((i + j + (frame >> 3)) % 4 + 4) % 4; g.fillStyle = [ARC.CH3, ARC.CH, ARC.CH2, ARC.C3][k]; g.fillRect(X + 8 + i, Y + j, 2, 2); }
      for (let k = 0; k < 5; k++){ const a = frame * 0.02 + k * 1.26 + d.tx, dd = 40 + (k * 17) % 50; g.fillStyle = ARC_CONFETTI[k]; g.globalAlpha = 0.5; g.fillRect(Math.round(X + 8 + Math.cos(a) * dd * 1.6), Math.round(Y + 30 + Math.sin(a) * dd * 0.5 + 40), 2, 2); g.globalAlpha = 1; } break; }
    case 'beams': { // sweeping light beams from the ceiling
      for (let k = 0; k < 2; k++){ const a = Math.sin(frame * 0.015 + k * 2 + d.tx) * 0.5; g.save(); g.translate(X + k * 30, 0); g.rotate(a); g.globalAlpha = 0.08; g.fillStyle = k ? ARC.C : ARC.M; g.beginPath(); g.moveTo(-3, 0); g.lineTo(3, 0); g.lineTo(26, 220); g.lineTo(-26, 220); g.fill(); g.restore(); g.globalAlpha = 1; } break; }
    case 'ticker': { // the PA ticker: scrolling jokes
      const w = d.w || 120, msg = ARC_TICKER[(d.v || 0) % ARC_TICKER.length] + '   *   ' + ARC_TICKER[((d.v || 0) + 3) % ARC_TICKER.length] + '   *   ';
      g.fillStyle = ARC.I; g.fillRect(X - 2, Y - 2, w + 4, 13); g.fillStyle = '#140808'; g.fillRect(X, Y, w, 9);
      g.save(); g.beginPath(); g.rect(X, Y, w, 9); g.clip(); const tw = textWidth(msg, 1), off = (frame * 0.6) % tw; drawText(g, msg, Math.round(X + w - off), Y + 1, ARC.AM); drawText(g, msg, Math.round(X + w - off + tw), Y + 1, ARC.AM); g.restore();
      g.fillStyle = 'rgba(0,0,0,0.3)'; for (let i = 0; i < w; i += 2) g.fillRect(X + i, Y, 1, 9); break; }
    case 'prizeshelf': { // shelves of plush toast prizes
      const w = d.w || 48; for (let s = 0; s < 3; s++){ const yy = Y - s * 20; g.fillStyle = ARC.I; g.fillRect(X - 1, yy - 1, w + 2, 4); g.fillStyle = ARC.CH; g.fillRect(X, yy, w, 2);
        for (let i = 0; i < w - 10; i += 12){ const k = (i / 12 + s + d.tx) % 4; g.fillStyle = ARC.I; g.fillRect(X + i + 1, yy - 12, 11, 12); g.fillStyle = [ARC.CR2, ARC.M3, ARC.C3, ARC.Y][k]; g.fillRect(X + i + 2, yy - 11, 9, 10); g.fillStyle = ARC.I; g.fillRect(X + i + 4, yy - 8, 1, 2); g.fillRect(X + i + 8, yy - 8, 1, 2); g.fillRect(X + i + 5, yy - 5, 3, 1); } } break; }
    case 'neon7': { const t = d.text || 'TOASTY ARCADE', col = d.col || ARC.M, on = (frame + d.tx * 7) % 180 > 6; g.globalAlpha = on ? 0.25 : 0.08; g.fillStyle = col; g.fillRect(X - 4, Y - 3, textWidth(t, 1) + 8, 13); g.globalAlpha = 1; drawText(g, t, X, Y, on ? col : '#3a2040'); if (on) drawText(g, t, X, Y - 1, ARC.W); g.globalAlpha = 1; if (on){ drawText(g, t, X, Y, col); } break; }
    case 'gacha': { // a capsule vending machine (decor)
      g.fillStyle = ARC.I; g.fillRect(X - 1, Y - 45, 22, 46); g.fillStyle = ARC.R; g.fillRect(X, Y - 20, 20, 20); g.fillStyle = 'rgba(200,240,255,0.5)'; g.beginPath(); g.arc(X + 10, Y - 32, 10, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 6; i++){ g.fillStyle = ARC_CONFETTI[i % 5]; g.fillRect(X + 4 + (i % 3) * 5, Y - 36 + (i >> 1) * 4 - (i % 2) * 2, 4, 4); }
      g.fillStyle = ARC.CH; g.fillRect(X + 6, Y - 16, 8, 8); g.fillStyle = ARC.I; g.fillRect(X + 9, Y - 15, 2, 6); g.fillStyle = ARC.I; g.fillRect(X + 6, Y - 6, 8, 4); break; }
    case 'crtwall': { // a wall of CRTs showing static (7-3); they all flicker together with the hall's power
      const n = d.n || 3, on = typeof crtOn === 'function' ? crtOn(0) : true;
      for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++){ const cx = X + i * 18, cy = Y - 18 - j * 17; g.fillStyle = ARC.I; g.fillRect(cx - 1, cy - 1, 19, 17); g.fillStyle = '#4a4658'; g.fillRect(cx, cy, 17, 15); g.fillStyle = '#0a0a10'; g.fillRect(cx + 2, cy + 2, 13, 9);
        if (on){ const r = rng(((frame >> 2) + i * 7 + j * 3 + d.tx) | 0); for (let k = 0; k < 16; k++){ g.fillStyle = r() < 0.5 ? '#c8c8d4' : r() < 0.75 ? ARC.M : ARC.C; g.fillRect(cx + 2 + ((r() * 13) | 0), cy + 2 + ((r() * 9) | 0), 1, 1); } } }
      break; }
    case 'banner7': { const w = d.w || 72; g.fillStyle = ARC.I; g.fillRect(X - 2, Y - 2, w + 4, 16); g.fillStyle = ARC.M2; g.fillRect(X, Y, w, 12); g.fillStyle = ARC.Y; g.fillRect(X, Y, w, 1); g.fillRect(X, Y + 11, w, 1); for (let i = 0; i < w; i += 8){ g.fillStyle = ((frame >> 3) + i / 8) % 2 ? ARC.AM : ARC.Y; g.fillRect(X + i + 2, Y - 3, 2, 2); } drawTextC(g, d.text || 'TOASTY ARCADE', X + w / 2, Y + 3, ARC.Y); break; }
    case 'bulbs': { const w = d.w || 64; for (let i = 0; i < w; i += 6){ const on = ((frame >> 3) + i / 6) % 3 !== 0; g.fillStyle = ARC.I; g.fillRect(X + i - 1, Y - 1, 5, 5); g.fillStyle = on ? ARC.AM : '#5a3a10'; g.fillRect(X + i, Y, 3, 3); if (on){ g.globalAlpha = 0.15; g.fillStyle = ARC.AM; g.fillRect(X + i - 3, Y - 3, 9, 9); g.globalAlpha = 1; } } break; }
  }
}
// The world exit: the PRIZE COUNTER (a neon booth). Walk in through the door.
function drawArcadeGate(g, bx, by, door, frame, onAir){
  g.fillStyle = ARC.I; g.fillRect(bx - 2, by - 14, 100, 96); g.fillStyle = ARC.P3; g.fillRect(bx, by - 12, 96, 92); g.fillStyle = ARC.P4; g.fillRect(bx, by - 12, 96, 3);
  for (let i = 0; i < 96; i += 8){ const on = ((frame >> 3) + i / 8) % 2; g.fillStyle = on ? ARC.AM : ARC.Y; g.fillRect(bx + i + 2, by - 18, 3, 3); }
  g.fillStyle = ARC.I; g.fillRect(bx + 6, by - 6, 84, 16); g.fillStyle = '#140818'; g.fillRect(bx + 7, by - 5, 82, 14); drawTextC(g, 'PRIZE COUNTER', bx + 48, by - 1, (frame >> 4) % 2 ? ARC.M : ARC.C);
  for (let s = 0; s < 2; s++){ g.fillStyle = ARC.CH; g.fillRect(bx + 4, by + 24 + s * 18, 26, 2); g.fillRect(bx + 66, by + 24 + s * 18, 26, 2); for (let i = 0; i < 3; i++){ g.fillStyle = [ARC.CR2, ARC.M3, ARC.C3][(i + s) % 3]; g.fillRect(bx + 6 + i * 8, by + 16 + s * 18, 6, 8); g.fillRect(bx + 68 + i * 8, by + 16 + s * 18, 6, 8); } }
  const sx = door - 14, sw = 40; g.fillStyle = ARC.I; g.fillRect(sx - 3, by + 14, sw + 6, 66);
  const r = rng((frame >> 1) * 7 + bx); for (let j = 0; j < 62; j += 3) for (let i = 0; i < sw; i += 3){ const v = r(); g.fillStyle = onAir ? (v < 0.5 ? '#3a2a10' : ARC.Y) : v < 0.55 ? '#1a1024' : v < 0.85 ? ARC.P : (v < 0.93 ? ARC.M : ARC.C); g.fillRect(sx + i, by + 17 + j, 3, 3); }
  drawTiny(g, onAir ? 'OPEN' : 'EXIT', sx + 12, by + 8, onAir ? ARC.Y : ARC.CH);
}

// ---------------- backgrounds ----------------
function arcadeLayers(kind, L, layer){
  const backdrop = (x, r, top, bot) => { const gr = x.createLinearGradient(0, 0, 0, 240); gr.addColorStop(0, top); gr.addColorStop(1, bot); x.fillStyle = gr; x.fillRect(0, 0, 512, 240);
    for (let i = 0; i < 70; i++){ x.fillStyle = ARC_CONFETTI[(r() * 5) | 0]; x.globalAlpha = 0.18; x.fillRect((r() * 512) | 0, (r() * 240) | 0, 1, 1); x.globalAlpha = 1; } };
  if (kind === 'arclobby'){ // the lobby: rows of glowing cabinets, a big neon arch, light beams
    L.far = layer((x, r) => { backdrop(x, r, '#160a24', '#07060c');
      for (let i = 0; i < 512; i += 40){ const h = 70 + ((r() * 20) | 0); x.fillStyle = '#1e1030'; x.fillRect(i + 6, 200 - h, 28, h); x.fillStyle = r() < 0.5 ? 'rgba(255,0,200,0.35)' : 'rgba(0,240,255,0.35)'; x.fillRect(i + 10, 200 - h + 10, 20, 14); x.fillStyle = 'rgba(255,212,0,0.25)'; x.fillRect(i + 10, 200 - h + 3, 20, 4); }
      x.strokeStyle = 'rgba(255,0,200,0.35)'; x.lineWidth = 3; x.beginPath(); x.arc(256, 150, 120, Math.PI, 0); x.stroke(); x.strokeStyle = 'rgba(0,240,255,0.3)'; x.beginPath(); x.arc(256, 150, 112, Math.PI, 0); x.stroke(); });
    L.mid = layer((x, r) => { for (let i = 0; i < 512; i += 64){ x.globalAlpha = 0.06; x.fillStyle = i % 128 ? '#ff00c8' : '#00f0ff'; x.beginPath(); x.moveTo(i + 30, 0); x.lineTo(i + 60, 200); x.lineTo(i, 200); x.fill(); x.globalAlpha = 1; x.fillStyle = '#c8d0dc'; x.fillRect(i + 28, 0, 4, 6); } });
  } else if (kind === 'arcprize'){ // prize shelves: tall shelves of plush toast prizes and capsule towers
    L.far = layer((x, r) => { backdrop(x, r, '#1a0c2c', '#08060e');
      for (let i = 0; i < 512; i += 96){ x.fillStyle = '#24123a'; x.fillRect(i + 8, 40, 80, 170); for (let s = 0; s < 6; s++){ x.fillStyle = '#5a6274'; x.fillRect(i + 8, 60 + s * 26, 80, 2); for (let k = 0; k < 6; k++){ x.fillStyle = ['rgba(224,162,74,0.5)', 'rgba(255,138,230,0.45)', 'rgba(168,251,255,0.45)', 'rgba(255,212,0,0.45)'][(k + s) % 4]; x.fillRect(i + 12 + k * 13, 48 + s * 26, 10, 12); } } } });
    L.mid = layer((x, r) => { for (let i = 0; i < 512; i += 128){ x.strokeStyle = '#8a94a6'; x.lineWidth = 2; x.beginPath(); x.moveTo(i, 30); x.lineTo(i + 128, 30); x.stroke(); x.fillStyle = '#c8d0dc'; x.fillRect(i + 50, 30, 2, 20 + ((r() * 30) | 0)); } });
  } else if (kind === 'arcstatic'){ // No Signal Hall: a maze of dead CRTs, static snow, a test card
    L.far = layer((x, r) => { backdrop(x, r, '#0c0c16', '#040408');
      for (let i = 0; i < 512; i += 36) for (let j = 30; j < 200; j += 30){ x.fillStyle = '#16161f'; x.fillRect(i + 2, j, 32, 26); x.fillStyle = '#0a0a10'; x.fillRect(i + 5, j + 3, 26, 18); for (let k = 0; k < 10; k++){ x.fillStyle = r() < 0.5 ? 'rgba(200,200,212,0.25)' : 'rgba(0,240,255,0.2)'; x.fillRect(i + 5 + ((r() * 26) | 0), j + 3 + ((r() * 18) | 0), 1, 1); } }
      const bars = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0']; bars.forEach((c, k) => { x.globalAlpha = 0.25; x.fillStyle = c; x.fillRect(200 + k * 16, 60, 16, 60); x.globalAlpha = 1; }); });
    L.mid = layer((x, r) => { for (let i = 0; i < 512; i += 80){ x.fillStyle = '#121220'; x.fillRect(i + 20, 0, 8, 50 + ((r() * 40) | 0)); } });
  } else { // arcvault: the Jackpot Vault's castle: a giant token pusher, mountains of tokens, amber bulbs
    L.far = layer((x, r) => { backdrop(x, r, '#1a1206', '#07060c');
      for (let i = 0; i < 512; i += 4){ const h = 30 + Math.sin(i * 0.03) * 14 + Math.sin(i * 0.11) * 6; x.fillStyle = (i >> 2) % 2 ? 'rgba(200,154,0,0.45)' : 'rgba(255,212,0,0.35)'; x.fillRect(i, 210 - h, 4, h); }
      for (let i = 0; i < 512; i += 128){ x.fillStyle = '#2a2010'; x.fillRect(i + 20, 50, 90, 12); x.fillStyle = 'rgba(238,242,248,0.35)'; x.fillRect(i + 24 + ((r() * 20) | 0), 52, 60, 6); } });
    L.mid = layer((x, r) => { for (let i = 0; i < 512; i += 48){ x.fillStyle = '#2a2010'; x.fillRect(i, 18, 48, 4); x.fillStyle = (i / 48) % 2 ? '#ffb347' : '#ff8a1a'; x.fillRect(i + 22, 22, 4, 4); } });
  }
}
// ---------------- post-fx: scanlines, light RGB split, warm bulb glow, confetti sparkle ----------------
let arcScan = null;
function arcadePostFx(g, W, H, frame, kind, buf){
  if (!arcScan){ arcScan = aCv(W, H, x => { x.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < H; y += 2) x.fillRect(0, y, W, 1);
    const v = x.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, 200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,4,16,0.45)'); x.fillStyle = v; x.fillRect(0, 0, W, H); }); }
  if (buf && (frame >> 1) % 3 === 0){ g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.05; g.drawImage(buf, -1, 0); g.drawImage(buf, 1, 0); g.restore(); }
  g.fillStyle = kind === 'arcvault' ? 'rgba(255,179,71,0.06)' : kind === 'arcstatic' ? 'rgba(0,240,255,0.03)' : 'rgba(255,0,200,0.03)'; g.fillRect(0, 0, W, H);
  g.drawImage(arcScan, 0, 0);
}
