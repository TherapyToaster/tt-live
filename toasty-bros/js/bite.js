// World 9: FINAL BITE — original procedural pixel art for an old-school street brawl on toast avenue
// (lore: lore/originals.md, "Bake & Rise"). Night brick shops with neon toast, a pink-neon diner kitchen,
// a cracked toaster lot under a purple storm sky. Punks (toast-head thugs) and Butter Bruisers.
// The boss is THE THERAPY TOASTER: a silver angular pickup with a toaster in the bed. Parody look only:
// no real brands, no logos, no gore, no wallets. Jam stays grape purple.
'use strict';

const B9 = {
  BG: '#1a1018', BG2: '#2a1824', BG3: '#3d2433', IVORY: '#f7efe3', DARK: '#12080f',
  NEON: '#ff2d8a', GOLD: '#f5c14a', SILVER: '#d7c3c8', TOAST: '#e7a15a', CRUST: '#a8622a',
  BURNT: '#4a2a16', BURNT2: '#2a160c', CHEESE: '#ffd23a', BUTTER: '#ffe68a', BUTTER2: '#f2c85a',
  FOIL: '#c9ccd4', FOIL2: '#8e93a0', BOOT: '#6a3a1c', PANTS: '#16101a', ICE: '#bfe6ff', ICE2: '#7ab8e8',
  CHROME: '#dfe3ea', CHROME2: '#9aa0ac', CHROME3: '#5e6470', GLASS: '#2a1824', GLOW: '#ff8a3a',
  STORM: '#3a1a52', STORM2: '#5a2a7a', BOLT: '#f4e8ff', BRICK: '#4a2026', BRICK2: '#5e2a30', JAM: '#b54e8c',
  CAP: '#141014', SHADE: '#ff2d8a'
};

const BITE_DECOR = new Set(['neon9', 'shop9', 'winToaster9', 'lamp9', 'fence9', 'cone9', 'crate9', 'goldstack9', 'grillhood9', 'burger9', 'banner9', 'trash9', 'puddle9', 'lotTruck9']);

let BITE_SPR = null;
function buildBiteSprites(){
  const out = {};
  // PUNK: toast-head thug, cheese drips, yellow arms, black pants and boots (2 walk frames). burnt = darker toast.
  const punk = (f, burnt) => mkCanvas(12, 16, x => {
    const head = burnt ? B9.BURNT : B9.TOAST, crust = burnt ? B9.BURNT2 : B9.CRUST;
    x.fillStyle = crust; x.fillRect(1, 0, 10, 8); x.fillStyle = head; x.fillRect(2, 1, 8, 6);
    x.fillStyle = burnt ? '#ff5a2a' : B9.DARK; x.fillRect(3, 3, 2, 1); x.fillRect(7, 3, 2, 1); // angry brows / eyes
    x.fillStyle = B9.DARK; x.fillRect(4, 5, 4, 1);
    x.fillStyle = B9.CHEESE; x.fillRect(2, 7, 8, 1); x.fillRect(3, 8, 1, 1 + f); x.fillRect(8, 8, 1, 2 - f); // cheese drips
    x.fillStyle = '#2a2430'; x.fillRect(3, 8, 6, 4); // tank top
    x.fillStyle = B9.CHEESE; x.fillRect(1, 8 + f, 2, 3); x.fillRect(9, 9 - f, 2, 3); // yellow arms
    x.fillStyle = B9.PANTS; x.fillRect(3, 12, 6, 2);
    x.fillStyle = '#000000'; x.fillRect(2 + f, 14, 3, 2); x.fillRect(7 - f, 14, 3, 2); // boots
  });
  out.punk = [0, 1].map(f => punk(f, false)); out.bpunk = [0, 1].map(f => punk(f, true));
  out.punkSq = mkCanvas(12, 6, x => { x.fillStyle = B9.CRUST; x.fillRect(1, 1, 10, 5); x.fillStyle = B9.TOAST; x.fillRect(2, 2, 8, 3); x.fillStyle = B9.CHEESE; x.fillRect(0, 5, 12, 1); });
  // BUTTER BRUISER: big butter-stick bruiser, foil sash, brown boots (2 frames). frozen = icy butter.
  const butter = (f, frozen) => mkCanvas(16, 20, x => {
    const body = frozen ? B9.ICE : B9.BUTTER, side = frozen ? B9.ICE2 : B9.BUTTER2;
    x.fillStyle = side; x.fillRect(2, 0, 12, 16); x.fillStyle = body; x.fillRect(3, 1, 10, 14);
    x.fillStyle = '#ffffff'; x.fillRect(4, 2, 3, 1);
    x.fillStyle = B9.DARK; x.fillRect(5, 4, 2, 2); x.fillRect(9, 4, 2, 2); x.fillRect(5, 3, 2, 1); x.fillRect(9, 3, 2, 1); x.fillRect(6, 8, 4, 1);
    for (let i = 0; i < 10; i++){ x.fillStyle = i % 3 ? B9.FOIL : B9.FOIL2; x.fillRect(3 + i, 6 + i, 2, 2); } // foil sash
    x.fillStyle = side; x.fillRect(0, 7 + f, 3, 5); x.fillRect(13, 8 - f, 3, 5); // fists
    if (frozen){ x.fillStyle = '#ffffff'; x.fillRect(3, 0, 2, 1); x.fillRect(10, 0, 3, 1); x.fillRect(12, 12, 1, 2); }
    x.fillStyle = B9.BOOT; x.fillRect(3 + f, 16, 4, 4); x.fillRect(9 - f, 16, 4, 4);
  });
  out.butter = [0, 1].map(f => butter(f, false)); out.fbutter = [0, 1].map(f => butter(f, true));
  // gold pat and gold bar pickups
  out.pat = mkCanvas(10, 8, x => { x.fillStyle = '#a87a1a'; x.fillRect(0, 2, 10, 6); x.fillStyle = B9.GOLD; x.fillRect(1, 1, 8, 5); x.fillStyle = '#fff2b0'; x.fillRect(2, 2, 3, 1); });
  out.bar = mkCanvas(12, 8, x => { x.fillStyle = '#a87a1a'; x.fillRect(0, 3, 12, 5); x.fillStyle = B9.GOLD; x.fillRect(2, 1, 8, 5); x.fillStyle = '#fff2b0'; x.fillRect(3, 2, 4, 1); x.fillStyle = B9.JAM; x.fillRect(5, 4, 2, 1); });
  // a glowing toast slice the truck pops out of its bed
  out.slice = mkCanvas(10, 10, x => { x.fillStyle = B9.CRUST; x.fillRect(0, 1, 10, 9); x.fillRect(1, 0, 8, 1); x.fillStyle = B9.TOAST; x.fillRect(1, 2, 8, 7); x.fillStyle = B9.GLOW; x.fillRect(2, 3, 6, 1); x.fillRect(2, 6, 6, 1); });
  out.drip = mkCanvas(8, 10, x => { x.fillStyle = B9.BUTTER2; x.fillRect(2, 0, 4, 6); x.fillRect(1, 5, 6, 4); x.fillStyle = B9.BUTTER; x.fillRect(3, 1, 2, 6); x.fillRect(2, 6, 3, 2); });
  return (BITE_SPR = out);
}
function biteSpr(){ return BITE_SPR || (typeof S !== 'undefined' && S.bite) || null; }

function biteLayers(kind, L, tileableLayer){
  const sky = (a, b, stars) => tileableLayer((x, r) => {
    const grd = x.createLinearGradient(0, 0, 0, 170); grd.addColorStop(0, a); grd.addColorStop(1, b);
    x.fillStyle = grd; x.fillRect(0, 0, 512, 240);
    if (stars) for (let i = 0; i < 40; i++){ x.fillStyle = r() < 0.5 ? '#f7efe3' : '#ff8ac4'; x.fillRect((r() * 512) | 0, (r() * 90) | 0, 1, 1); }
  });
  const stormClouds = () => tileableLayer((x, r) => {
    for (let i = 0; i < 512; i += 64){ const y = 18 + ((r() * 30) | 0);
      x.fillStyle = B9.STORM; x.beginPath(); x.ellipse(i + 32, y, 40, 12, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = B9.STORM2; x.beginPath(); x.ellipse(i + 26, y - 4, 26, 7, 0, 0, Math.PI * 2); x.fill(); }
  });
  // night brick shops: bakery / pizza / toast signs (generic words, no brands), toasters in the windows
  const shops = () => tileableLayer((x, r) => {
    const names = ['BAKERY', 'PIZZA', 'TOAST', 'BAGELS'];
    for (let i = 0; i < 512; i += 128){
      x.fillStyle = B9.BRICK; x.fillRect(i, 70, 124, 110);
      for (let y = 72; y < 180; y += 6) for (let k = (y / 6) % 2 ? 0 : 6; k < 124; k += 12){ x.fillStyle = B9.BRICK2; x.fillRect(i + k, y, 11, 5); }
      x.fillStyle = B9.DARK; x.fillRect(i + 10, 116, 104, 50); x.fillStyle = '#3a1830'; x.fillRect(i + 12, 118, 100, 46);
      x.fillStyle = 'rgba(255,45,138,0.18)'; x.fillRect(i + 12, 118, 100, 46);
      // a toaster in the window
      x.fillStyle = B9.CHROME2; x.fillRect(i + 48, 146, 28, 18); x.fillStyle = B9.CHROME; x.fillRect(i + 49, 147, 26, 4);
      x.fillStyle = B9.DARK; x.fillRect(i + 53, 147, 6, 2); x.fillRect(i + 65, 147, 6, 2); x.fillStyle = B9.TOAST; x.fillRect(i + 54, 142, 4, 5); x.fillRect(i + 66, 142, 4, 5);
      // neon sign
      const n = names[(i / 128) % names.length]; x.fillStyle = B9.DARK; x.fillRect(i + 22, 84, 80, 18);
      x.fillStyle = (i / 128) % 2 ? B9.GOLD : B9.NEON; x.font = 'bold 12px monospace'; x.textAlign = 'center'; x.fillText(n, i + 62, 98);
    }
  });
  const kitchenWall = () => tileableLayer((x, r) => {
    x.fillStyle = '#2a1a22'; x.fillRect(0, 60, 512, 130);
    for (let y = 64; y < 190; y += 10) for (let k = 0; k < 512; k += 10){ x.fillStyle = ((y + k) / 10) % 2 ? '#3a2430' : '#322028'; x.fillRect(k, y, 9, 9); }
    x.fillStyle = B9.NEON; x.fillRect(0, 96, 512, 2); x.fillStyle = 'rgba(255,45,138,0.2)'; x.fillRect(0, 92, 512, 10);
    for (let i = 0; i < 512; i += 96){ x.fillStyle = B9.CHROME3; x.fillRect(i + 20, 60, 56, 26); x.fillStyle = B9.CHROME2; x.fillRect(i + 22, 62, 52, 4); // hood
      x.fillStyle = '#a87a1a'; x.fillRect(i + 30, 150, 10, 5); x.fillRect(i + 42, 150, 10, 5); x.fillStyle = B9.GOLD; x.fillRect(i + 36, 145, 10, 5); } // gold bars on the shelf
  });
  const fence = () => tileableLayer((x, r) => {
    x.strokeStyle = 'rgba(160,150,170,0.45)'; x.lineWidth = 1;
    for (let k = -120; k < 512 + 120; k += 8){ x.beginPath(); x.moveTo(k, 120); x.lineTo(k + 60, 196); x.stroke(); x.beginPath(); x.moveTo(k + 60, 120); x.lineTo(k, 196); x.stroke(); }
    x.fillStyle = '#5a5060'; for (let i = 0; i < 512; i += 64) x.fillRect(i, 116, 3, 84); x.fillRect(0, 116, 512, 2);
  });
  const lotTrucks = () => tileableLayer((x, r) => {
    for (let i = 0; i < 512; i += 170){ // distant silver angular pickups (silhouettes, unbranded)
      x.fillStyle = '#4a4458'; x.beginPath(); x.moveTo(i + 20, 112); x.lineTo(i + 52, 92); x.lineTo(i + 80, 90); x.lineTo(i + 120, 104); x.lineTo(i + 120, 116); x.lineTo(i + 20, 116); x.fill();
      x.fillStyle = '#1a1018'; x.beginPath(); x.arc(i + 38, 116, 7, 0, Math.PI * 2); x.arc(i + 102, 116, 7, 0, Math.PI * 2); x.fill();
    }
  });
  const cracked = () => tileableLayer((x, r) => {
    x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(0, 200, 512, 24);
    x.strokeStyle = 'rgba(20,8,16,0.5)'; for (let i = 0; i < 12; i++){ const sx = (r() * 512) | 0; x.beginPath(); x.moveTo(sx, 202); x.lineTo(sx + 10, 210); x.lineTo(sx + 4, 222); x.stroke(); }
  });
  const neonStreet = () => tileableLayer(x => { x.fillStyle = 'rgba(255,45,138,0.10)'; x.fillRect(0, 196, 512, 10); x.fillStyle = 'rgba(245,193,74,0.08)'; x.fillRect(0, 206, 512, 6); });

  if (kind === 'bitestreet'){ L.far = sky('#120a14', B9.BG2, true); L.clouds = stormClouds(); L.mid = shops(); L.near = neonStreet(); L.floor = cracked(); }
  else if (kind === 'bitediner'){ L.far = sky('#140a10', '#2a1420', false); L.clouds = tileableLayer(x => { x.fillStyle = 'rgba(255,45,138,0.15)'; x.fillRect(0, 40, 512, 4); }); L.mid = kitchenWall(); L.near = neonStreet(); L.floor = tileableLayer(x => { x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(0, 200, 512, 20); }); }
  else if (kind === 'biteave'){ L.far = sky('#1a0c22', B9.STORM, true); L.clouds = stormClouds(); L.mid = shops(); L.near = fence(); L.floor = cracked(); }
  else { /* bitelot (boss) */ L.far = sky('#1a0c26', B9.STORM2, false); L.clouds = stormClouds(); L.mid = lotTrucks(); L.near = fence(); L.floor = cracked(); }
}

function drawBiteDecor(g, d, X, Y, frame){
  switch (d.kind){
    case 'neon9': {
      const t = d.text || 'TOAST', col = d.col || B9.NEON, on = (frame + (d.tx || 0) * 11) % 170 > 7;
      g.globalAlpha = on ? 0.28 : 0.1; g.fillStyle = col; g.fillRect(X - 4, Y - 3, textWidth(t, 1) + 8, 13); g.globalAlpha = 1;
      drawText(g, t, X, Y, on ? col : '#3a1828'); if (on) drawText(g, t, X, Y - 1, B9.IVORY);
      // a little neon toast icon
      g.strokeStyle = on ? B9.GOLD : '#3a2a10'; g.lineWidth = 1; g.strokeRect(X - 14, Y - 2, 9, 9);
      break;
    }
    case 'shop9': {
      const w = d.w || 64, t = d.text || 'BAKERY';
      g.fillStyle = B9.BRICK; g.fillRect(X, Y - 40, w, 56); g.fillStyle = B9.DARK; g.fillRect(X + 6, Y - 18, w - 12, 34);
      g.fillStyle = 'rgba(255,45,138,0.25)'; g.fillRect(X + 7, Y - 17, w - 14, 32);
      g.fillStyle = B9.NEON; g.fillRect(X, Y - 40, w, 3); for (let i = 0; i < w; i += 8){ g.fillStyle = (i / 8) % 2 ? B9.NEON : B9.IVORY; g.fillRect(X + i, Y - 26, 8, 4); } // awning
      drawTextC(g, t, X + w / 2, Y - 35, B9.GOLD);
      break;
    }
    case 'winToaster9': {
      g.fillStyle = B9.CHROME2; g.fillRect(X, Y, 20, 12); g.fillStyle = B9.CHROME; g.fillRect(X + 1, Y + 1, 18, 3);
      g.fillStyle = B9.DARK; g.fillRect(X + 3, Y + 1, 5, 2); g.fillRect(X + 12, Y + 1, 5, 2);
      const up = (frame >> 5) % 3 === 0 ? 3 : 0; g.fillStyle = B9.TOAST; g.fillRect(X + 4, Y - 3 - up, 3, 4); g.fillRect(X + 13, Y - 3 - up, 3, 4);
      break;
    }
    case 'lamp9': {
      g.fillStyle = '#3a3040'; g.fillRect(X + 6, Y - 40, 3, 56); g.fillRect(X + 2, Y - 42, 14, 3);
      g.fillStyle = B9.GOLD; g.fillRect(X + 12, Y - 39, 4, 3); g.fillStyle = 'rgba(245,193,74,0.12)'; g.beginPath(); g.moveTo(X + 13, Y - 36); g.lineTo(X - 6, Y + 16); g.lineTo(X + 34, Y + 16); g.fill();
      break;
    }
    case 'fence9': {
      const w = d.w || 48; g.strokeStyle = 'rgba(190,180,200,0.6)'; g.lineWidth = 1;
      for (let k = 0; k < w; k += 6){ g.beginPath(); g.moveTo(X + k, Y - 24); g.lineTo(X + k + 6, Y + 16); g.stroke(); g.beginPath(); g.moveTo(X + k + 6, Y - 24); g.lineTo(X + k, Y + 16); g.stroke(); }
      g.fillStyle = '#6a6070'; g.fillRect(X, Y - 26, w, 2); g.fillRect(X, Y - 26, 2, 42); g.fillRect(X + w - 2, Y - 26, 2, 42);
      break;
    }
    case 'cone9': { g.fillStyle = B9.NEON; g.beginPath(); g.moveTo(X + 6, Y + 2); g.lineTo(X + 1, Y + 16); g.lineTo(X + 11, Y + 16); g.fill(); g.fillStyle = B9.IVORY; g.fillRect(X + 3, Y + 9, 6, 2); break; }
    case 'crate9': { g.fillStyle = '#6a4a2a'; g.fillRect(X, Y, 16, 16); g.fillStyle = '#8a643a'; g.fillRect(X + 1, Y + 1, 14, 14); g.fillStyle = '#4a3018'; g.fillRect(X + 1, Y + 7, 14, 2); drawTiny(g, 'BREAD', X + 1, Y + 2, B9.IVORY); break; }
    case 'goldstack9': { for (let i = 0; i < 3; i++){ g.fillStyle = '#a87a1a'; g.fillRect(X + i * 6, Y + 10, 8, 6); g.fillStyle = B9.GOLD; g.fillRect(X + 1 + i * 6, Y + 9, 6, 4); } g.fillStyle = B9.GOLD; g.fillRect(X + 4, Y + 4, 8, 5); break; }
    case 'grillhood9': { g.fillStyle = B9.CHROME3; g.fillRect(X, Y, d.w || 48, 14); g.fillStyle = B9.CHROME2; g.fillRect(X + 2, Y + 2, (d.w || 48) - 4, 3); g.fillStyle = B9.NEON; g.fillRect(X, Y + 13, d.w || 48, 1); break; }
    case 'burger9': { g.fillStyle = '#e0a04a'; g.fillRect(X, Y + 2, 14, 4); g.fillStyle = '#6a3a18'; g.fillRect(X, Y + 6, 14, 3); g.fillStyle = B9.CHEESE; g.fillRect(X - 1, Y + 9, 16, 1); g.fillStyle = '#e0a04a'; g.fillRect(X, Y + 10, 14, 3); break; }
    case 'banner9': {
      const w = d.w || 80; g.fillStyle = B9.DARK; g.fillRect(X - 2, Y - 2, w + 4, 16); g.fillStyle = B9.BG3; g.fillRect(X, Y, w, 12);
      g.fillStyle = B9.NEON; g.fillRect(X, Y, w, 1); g.fillRect(X, Y + 11, w, 1);
      drawTextC(g, d.text || 'FINAL BITE', X + w / 2, Y + 3, B9.GOLD);
      break;
    }
    case 'trash9': { g.fillStyle = B9.CHROME3; g.fillRect(X + 1, Y + 2, 12, 14); g.fillStyle = B9.CHROME2; g.fillRect(X, Y, 14, 3); g.fillStyle = B9.DARK; g.fillRect(X + 4, Y + 5, 1, 9); g.fillRect(X + 9, Y + 5, 1, 9); break; }
    case 'puddle9': { g.fillStyle = 'rgba(255,45,138,0.25)'; g.beginPath(); g.ellipse(X + 12, Y + 14, 14, 2, 0, 0, Math.PI * 2); g.fill(); break; }
    case 'lotTruck9': { drawTherapyTruck(g, X, Y - 16, frame, { parked: true }); break; }
  }
}

function drawBiteGold(g, kind, x, y, frame){
  const sp = biteSpr(), img = sp && (kind === 'bar' ? sp.bar : sp.pat);
  const a = 0.3 + Math.sin(frame * 0.2) * 0.15; g.globalAlpha = a; g.fillStyle = B9.GOLD; g.fillRect(x - 2, y - 2, kind === 'bar' ? 16 : 14, 12); g.globalAlpha = 1;
  if (img) g.drawImage(img, x, y); else { g.fillStyle = B9.GOLD; g.fillRect(x, y, 10, 6); }
}

// THE THERAPY TOASTER: a silver angular pickup (front on the left), a cap on the cab, a big toaster in the bed
// with two glowing slices, butter dripping off the tailgate. 64x32 box at (X, Y). Original parody art, no marks.
function drawTherapyTruck(g, X, Y, frame, o){
  o = o || {};
  const right = o.facing > 0;
  g.save();
  if (right){ g.translate(X + 64, Y); g.scale(-1, 1); } else g.translate(X, Y);
  const bites = o.bites || 0; // chomp marks while it gets eaten: clip the back off with a scalloped bite edge
  if (bites > 0){ const cut = 66 - bites * 8; g.beginPath(); g.moveTo(-60, -20); g.lineTo(cut, -20);
    for (let yy = -20; yy < 40; yy += 8){ g.lineTo(cut, yy); g.arc(cut, yy + 4, 4, -Math.PI / 2, Math.PI / 2, true); }
    g.lineTo(cut, 44); g.lineTo(-60, 44); g.closePath(); g.clip(); }
  // shadow
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(4, 30, 58, 3);
  // lower body
  g.fillStyle = B9.CHROME3; g.fillRect(2, 17, 60, 9);
  g.fillStyle = B9.CHROME2; g.fillRect(2, 17, 60, 2);
  // angular cab wedge
  g.fillStyle = B9.CHROME; g.beginPath(); g.moveTo(2, 19); g.lineTo(20, 7); g.lineTo(36, 6); g.lineTo(38, 19); g.closePath(); g.fill();
  g.fillStyle = B9.CHROME2; g.beginPath(); g.moveTo(2, 19); g.lineTo(20, 7); g.lineTo(21, 9); g.lineTo(5, 19); g.closePath(); g.fill();
  // windshield
  g.fillStyle = B9.GLASS; g.beginPath(); g.moveTo(9, 16); g.lineTo(20, 10); g.lineTo(32, 9); g.lineTo(33, 15); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,45,138,0.55)'; g.fillRect(22, 11, 6, 1);
  // a cap on the cab (black, brim forward)
  g.fillStyle = B9.CAP; g.beginPath(); g.ellipse(28, 6, 7, 4, 0, Math.PI, 0); g.fill(); g.fillRect(15, 5, 8, 2);
  g.fillStyle = B9.SHADE; g.fillRect(27, 3, 2, 1);
  // bed rail
  g.fillStyle = B9.CHROME2; g.fillRect(38, 13, 24, 5); g.fillStyle = B9.CHROME; g.fillRect(38, 13, 24, 1);
  // toaster in the bed
  g.fillStyle = B9.CHROME2; g.fillRect(41, 4, 19, 10); g.fillStyle = B9.CHROME; g.fillRect(42, 5, 17, 2);
  g.fillStyle = B9.DARK; g.fillRect(44, 4, 5, 2); g.fillRect(52, 4, 5, 2);
  const pop = o.pop || 0, glow = (frame >> 2) % 2 ? B9.GLOW : B9.GOLD;
  g.fillStyle = B9.CRUST; g.fillRect(44, -1 - pop, 5, 6); g.fillRect(52, -1 - pop, 5, 6);
  g.fillStyle = B9.TOAST; g.fillRect(45, 0 - pop, 3, 4); g.fillRect(53, 0 - pop, 3, 4);
  g.fillStyle = glow; g.fillRect(45, 1 - pop, 3, 1); g.fillRect(53, 1 - pop, 3, 1); // glowing slices
  g.fillStyle = B9.NEON; g.fillRect(58, 9, 1, 3); // toaster lever
  // butter dripping off the tailgate
  const dl = 2 + ((frame >> 3) % 4);
  g.fillStyle = B9.BUTTER2; g.fillRect(60, 17, 2, dl); g.fillStyle = B9.BUTTER; g.fillRect(60, 17, 1, Math.max(1, dl - 1));
  // headlight (flashes on the telegraph)
  g.fillStyle = o.lights ? ((frame >> 1) % 2 ? '#ffffff' : B9.GOLD) : '#8a7a50'; g.fillRect(2, 19, 4, 2);
  if (o.lights){ g.globalAlpha = 0.25; g.fillStyle = B9.GOLD; g.beginPath(); g.moveTo(2, 20); g.lineTo(-40, 12); g.lineTo(-40, 30); g.fill(); g.globalAlpha = 1; }
  g.fillStyle = B9.NEON; g.fillRect(58, 19, 4, 2); // tail light
  // wheels
  for (const wx of [14, 50]){ g.fillStyle = '#0c080a'; g.beginPath(); g.arc(wx, 26, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = B9.CHROME2; g.beginPath(); g.arc(wx, 26, 2.5, 0, Math.PI * 2); g.fill();
    if (o.moving){ g.fillStyle = B9.CHROME3; g.fillRect(wx - 1 + ((frame >> 1) % 3) - 1, 23, 1, 6); } }
  g.restore();
}
