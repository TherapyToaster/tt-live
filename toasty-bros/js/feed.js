// World 8: FEED FAT COTY — original procedural pixel art for a futuristic neon diner
// (lore: lore/originals.md). White curved walls, red neon, stainless kitchen, oval windows,
// glossy floor, round blue LED ceiling. No real brands, no gore, no wallets. Jam stays grape purple.
// Fat Coty keeps his existing bro look (goatee, gold-mirror shades, black ACID cap, black tee
// with a blue streak, silver chains) — this file only scales that look up for the 8-4 boss.
'use strict';

const F8 = {
  BG: '#1a1410', BG2: '#2a211c', CREAM: '#f4e4c1', IVORY: '#f7efe3', DARK: '#140c12',
  NEON: '#ff3d9a', GOLD: '#ffc43a', STEEL: '#cbbba8', STEEL2: '#9aa08e', STEEL3: '#e8e4d4',
  PINK: '#ff8ac4', BLUE: '#3a8cff', LED: '#5ad0ff', LIME: '#b8e04a', GOO: '#d4b03a',
  SKIN: '#e8b48a', CAP: '#141414', TEE: '#161616', STREAK: '#3a64b0', SHADE: '#e8c44a',
  CHAIN: '#d8d8e0', JAM: '#b54e8c', WARM: '#ff7a3a', COOL: '#7ad0ff', WHITE: '#f4f0ea'
};

// 16 unbranded snacks (lore list). Ids only; no real-brand marks or logos.
const SNACKS = [
  { id: 'burger', name: 'CHEESEBURGER' }, { id: 'pizza', name: 'PIZZA' }, { id: 'taco', name: 'TACO' },
  { id: 'donut', name: 'DONUT' }, { id: 'fries', name: 'FRIES' }, { id: 'soda', name: 'SODA' },
  { id: 'ice', name: 'ICE CREAM' }, { id: 'chk', name: 'FRIED CHICKEN' }, { id: 'dog', name: 'HOT DOG' },
  { id: 'cake', name: 'CAKE' }, { id: 'chips', name: 'CHIPS' }, { id: 'shake', name: 'MILKSHAKE' },
  { id: 'wrap', name: 'BURRITO' }, { id: 'cookie', name: 'COOKIE' }, { id: 'pretzel', name: 'PRETZEL' },
  { id: 'rings', name: 'ONION RINGS' }
];

const FEED_DECOR = new Set(['ovalwin', 'neon8', 'booth8', 'ledring', 'counter8', 'griddle', 'fridge8', 'sign8', 'banner8', 'lamp8', 'stool8', 'traystack', 'vents8']);

function snackById(id){ return SNACKS.find(s => s.id === id) || SNACKS[0]; }

let FEED_SPR = null;
function buildFeedSprites(){
  const out = { snacks: {} };
  // snack pest: a little crawling bun-bug (original, not a branded mascot)
  out.pest = [0, 1].map(f => mkCanvas(14, 12, x => {
    x.fillStyle = F8.CREAM; x.fillRect(2, 3 + f, 10, 7); x.fillStyle = '#d4a878'; x.fillRect(2, 3 + f, 10, 2);
    x.fillStyle = '#8a5a32'; x.fillRect(3, 5 + f, 8, 1);
    x.fillStyle = F8.LIME; x.fillRect(4, 6 + f, 2, 2); x.fillRect(8, 6 + f, 2, 2);
    x.fillStyle = F8.DARK; x.fillRect(4, 6 + f, 1, 1); x.fillRect(8, 6 + f, 1, 1);
    x.fillStyle = '#6a3a18'; x.fillRect(1 + f, 10, 3, 2); x.fillRect(6, 10, 3, 2); x.fillRect(10 - f, 10, 3, 2);
  }));
  out.pestSq = mkCanvas(14, 8, x => { x.fillStyle = F8.CREAM; x.fillRect(1, 2, 12, 5); x.fillStyle = F8.LIME; x.fillRect(4, 3, 2, 2); x.fillRect(8, 3, 2, 2); });
  // goo blob
  out.goo = mkCanvas(16, 8, x => {
    x.fillStyle = F8.LIME; x.fillRect(2, 3, 12, 5); x.fillRect(1, 5, 14, 3); x.fillStyle = F8.GOO; x.fillRect(4, 2, 8, 3); x.fillStyle = '#f4f0a0'; x.fillRect(6, 3, 2, 1);
  });
  // cooled-off plate: warm vs cool
  out.plateW = mkCanvas(16, 6, x => { x.fillStyle = F8.STEEL; x.fillRect(1, 1, 14, 4); x.fillStyle = F8.WARM; x.fillRect(2, 2, 12, 2); x.fillStyle = '#ffd4a0'; x.fillRect(3, 2, 4, 1); });
  out.plateC = mkCanvas(16, 6, x => { x.fillStyle = F8.STEEL; x.fillRect(1, 1, 14, 4); x.fillStyle = F8.COOL; x.fillRect(2, 2, 12, 2); x.fillStyle = '#e8ffff'; x.fillRect(3, 2, 4, 1); });
  out.plateN = mkCanvas(16, 6, x => { x.fillStyle = F8.STEEL; x.fillRect(1, 1, 14, 4); x.fillStyle = F8.GOLD; x.fillRect(2, 2, 12, 2); });
  // flying plate hazard
  out.toss = mkCanvas(10, 10, x => { x.fillStyle = F8.STEEL3; x.beginPath(); x.ellipse(5, 5, 5, 3, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = F8.STEEL; x.beginPath(); x.ellipse(5, 5, 3, 1.5, 0, 0, Math.PI * 2); x.fill(); });

  const drawSnack = (x, id) => {
    const cx = 4, cy = 4;
    if (id === 'burger'){ x.fillStyle = '#e0a04a'; x.fillRect(1, 2, 6, 2); x.fillStyle = '#6a3a18'; x.fillRect(1, 4, 6, 2); x.fillStyle = '#e0a04a'; x.fillRect(1, 6, 6, 2); x.fillStyle = F8.LIME; x.fillRect(2, 5, 4, 1); }
    else if (id === 'pizza'){ x.fillStyle = F8.GOLD; x.fillRect(1, 2, 6, 5); x.fillStyle = '#ff6a3a'; x.fillRect(2, 3, 4, 3); x.fillStyle = '#ffd4a0'; x.fillRect(3, 4, 1, 1); }
    else if (id === 'taco'){ x.fillStyle = F8.GOLD; x.fillRect(1, 3, 6, 4); x.fillStyle = '#6a3a18'; x.fillRect(2, 4, 4, 2); x.fillStyle = F8.LIME; x.fillRect(3, 5, 2, 1); }
    else if (id === 'donut'){ x.fillStyle = F8.PINK; x.fillRect(1, 2, 6, 5); x.fillStyle = F8.GOLD; x.fillRect(3, 4, 2, 2); x.fillStyle = F8.DARK; x.fillRect(3, 4, 2, 2); }
    else if (id === 'fries'){ x.fillStyle = F8.GOLD; x.fillRect(2, 1, 1, 6); x.fillRect(4, 1, 1, 6); x.fillRect(6, 2, 1, 5); x.fillStyle = '#c87820'; x.fillRect(1, 6, 6, 2); }
    else if (id === 'soda'){ x.fillStyle = F8.NEON; x.fillRect(2, 1, 4, 7); x.fillStyle = F8.WHITE; x.fillRect(3, 2, 2, 2); x.fillStyle = F8.STEEL; x.fillRect(2, 0, 4, 1); }
    else if (id === 'ice'){ x.fillStyle = F8.PINK; x.fillRect(3, 1, 2, 2); x.fillStyle = F8.CREAM; x.fillRect(2, 3, 4, 3); x.fillStyle = '#8a5a32'; x.fillRect(2, 6, 4, 2); }
    else if (id === 'chk'){ x.fillStyle = '#c87820'; x.fillRect(1, 2, 6, 5); x.fillStyle = F8.GOLD; x.fillRect(2, 3, 4, 3); }
    else if (id === 'dog'){ x.fillStyle = '#e8c49a'; x.fillRect(1, 3, 6, 3); x.fillStyle = '#c85020'; x.fillRect(2, 4, 4, 1); }
    else if (id === 'cake'){ x.fillStyle = F8.PINK; x.fillRect(1, 3, 6, 4); x.fillStyle = F8.CREAM; x.fillRect(1, 5, 6, 2); x.fillStyle = F8.NEON; x.fillRect(4, 1, 1, 2); }
    else if (id === 'chips'){ x.fillStyle = F8.GOLD; x.fillRect(1, 2, 2, 3); x.fillRect(4, 3, 3, 3); x.fillRect(2, 5, 3, 2); }
    else if (id === 'shake'){ x.fillStyle = F8.PINK; x.fillRect(2, 2, 4, 6); x.fillStyle = F8.WHITE; x.fillRect(3, 1, 2, 2); x.fillStyle = F8.STEEL; x.fillRect(2, 7, 4, 1); }
    else if (id === 'wrap'){ x.fillStyle = '#c8a060'; x.fillRect(1, 2, 6, 5); x.fillStyle = F8.LIME; x.fillRect(2, 3, 4, 1); x.fillStyle = '#6a3a18'; x.fillRect(2, 5, 4, 1); }
    else if (id === 'cookie'){ x.fillStyle = '#b87430'; x.fillRect(1, 2, 6, 5); x.fillStyle = '#5a3010'; x.fillRect(3, 3, 1, 1); x.fillRect(5, 5, 1, 1); x.fillRect(2, 5, 1, 1); }
    else if (id === 'pretzel'){ x.fillStyle = '#c87820'; x.fillRect(2, 1, 4, 2); x.fillRect(1, 3, 2, 4); x.fillRect(5, 3, 2, 4); x.fillRect(3, 4, 2, 2); }
    else { // rings
      x.fillStyle = F8.GOLD; x.fillRect(2, 2, 4, 4); x.fillStyle = F8.DARK; x.fillRect(3, 3, 2, 2); x.fillStyle = F8.GOLD; x.fillRect(1, 5, 3, 2);
    }
  };
  SNACKS.forEach(s => { out.snacks[s.id] = mkCanvas(8, 8, x => drawSnack(x, s.id)); });
  return (FEED_SPR = out);
}

function feedLayers(kind, L, tileableLayer){
  const sky = (a, b) => tileableLayer(x => {
    x.fillStyle = a; x.fillRect(0, 0, 512, 240);
    const grd = x.createLinearGradient(0, 0, 0, 160); grd.addColorStop(0, a); grd.addColorStop(1, b);
    x.fillStyle = grd; x.fillRect(0, 0, 512, 160);
  });
  // oval windows + red neon trim, glossy floor reflection band
  const windows = (col) => tileableLayer(x => {
    for (let i = 0; i < 512; i += 96){
      x.fillStyle = '#2a2430'; x.beginPath(); x.ellipse(i + 40, 58, 22, 16, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = col; x.beginPath(); x.ellipse(i + 40, 58, 18, 12, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.25)'; x.beginPath(); x.ellipse(i + 34, 52, 6, 4, 0, 0, Math.PI * 2); x.fill();
    }
  });
  const neonTrim = () => tileableLayer(x => {
    x.fillStyle = F8.NEON; x.fillRect(0, 88, 512, 2); x.fillStyle = F8.PINK; x.fillRect(0, 90, 512, 1);
    x.fillStyle = 'rgba(255,61,154,0.18)'; x.fillRect(0, 84, 512, 10);
  });
  const ledRing = () => tileableLayer(x => {
    for (let i = 0; i < 512; i += 128){
      x.strokeStyle = F8.LED; x.lineWidth = 2; x.beginPath(); x.ellipse(i + 64, 22, 28, 8, 0, 0, Math.PI * 2); x.stroke();
      x.fillStyle = F8.BLUE; x.fillRect(i + 62, 20, 4, 4);
    }
  });
  const steelWall = () => tileableLayer(x => {
    x.fillStyle = '#3a3a42'; x.fillRect(0, 96, 512, 80);
    for (let i = 0; i < 512; i += 32){ x.fillStyle = F8.STEEL2; x.fillRect(i + 1, 98, 30, 76); x.fillStyle = F8.STEEL3; x.fillRect(i + 1, 98, 30, 2); x.fillStyle = '#6a7068'; x.fillRect(i + 30, 98, 1, 76); }
  });
  const gloss = () => tileableLayer(x => {
    x.fillStyle = 'rgba(255,255,255,0.06)'; x.fillRect(0, 200, 512, 20);
    x.fillStyle = 'rgba(255,61,154,0.08)'; x.fillRect(0, 208, 512, 4);
  });

  if (kind === 'feedfront'){
    L.far = sky('#241820', F8.BG);
    L.clouds = ledRing();
    L.mid = windows('#3a2048');
    L.near = neonTrim();
    L.floor = gloss();
  } else if (kind === 'feedkitchen'){
    L.far = sky('#1c1818', '#121014');
    L.clouds = ledRing();
    L.mid = steelWall();
    L.near = neonTrim();
    L.floor = gloss();
  } else if (kind === 'feedline'){
    L.far = sky('#201018', F8.DARK);
    L.clouds = ledRing();
    L.mid = windows('#4a1830');
    L.near = neonTrim();
    L.floor = gloss();
  } else if (kind === 'feedbooth'){
    L.far = sky('#1a1014', '#0c080a');
    L.clouds = ledRing();
    L.mid = windows('#5a1028');
    L.near = neonTrim();
    L.floor = gloss();
  }
}

function drawFeedDecor(g, d, X, Y, frame){
  switch (d.kind){
    case 'ovalwin': {
      g.fillStyle = '#2a2430'; g.beginPath(); g.ellipse(X + 16, Y + 10, 18, 12, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3a3060'; g.beginPath(); g.ellipse(X + 16, Y + 10, 14, 9, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.ellipse(X + 12, Y + 7, 4, 3, 0, 0, Math.PI * 2); g.fill();
      break;
    }
    case 'neon8': {
      const t = d.text || 'FEED FAT COTY', col = d.col || F8.NEON, on = (frame + (d.tx || 0) * 7) % 160 > 8;
      g.globalAlpha = on ? 0.28 : 0.1; g.fillStyle = col; g.fillRect(X - 4, Y - 3, textWidth(t, 1) + 8, 13); g.globalAlpha = 1;
      drawText(g, t, X, Y, on ? col : '#3a1828'); if (on) drawText(g, t, X, Y - 1, F8.WHITE);
      break;
    }
    case 'banner8': {
      const w = d.w || 80; g.fillStyle = F8.DARK; g.fillRect(X - 2, Y - 2, w + 4, 16); g.fillStyle = F8.NEON; g.fillRect(X, Y, w, 12);
      g.fillStyle = F8.GOLD; g.fillRect(X, Y, w, 1); g.fillRect(X, Y + 11, w, 1);
      for (let i = 0; i < w; i += 8){ g.fillStyle = ((frame >> 3) + i / 8) % 2 ? F8.GOLD : F8.PINK; g.fillRect(X + i + 2, Y - 3, 2, 2); }
      drawTextC(g, d.text || 'FEED FAT COTY', X + w / 2, Y + 3, F8.GOLD);
      break;
    }
    case 'ledring': {
      const on = ((frame >> 3) + (d.tx || 0)) % 6 !== 0;
      g.strokeStyle = on ? F8.LED : '#245070'; g.lineWidth = 2; g.beginPath(); g.ellipse(X + 16, Y + 6, 16, 6, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = on ? F8.BLUE : '#1a3048'; g.fillRect(X + 14, Y + 4, 4, 4);
      break;
    }
    case 'counter8': {
      const w = d.w || 48; g.fillStyle = F8.STEEL2; g.fillRect(X, Y, w, 16); g.fillStyle = F8.STEEL3; g.fillRect(X, Y, w, 3); g.fillStyle = F8.DARK; g.fillRect(X, Y + 15, w, 1);
      g.fillStyle = F8.NEON; g.fillRect(X, Y + 4, w, 1);
      break;
    }
    case 'griddle': {
      g.fillStyle = F8.STEEL; g.fillRect(X, Y, 32, 14); g.fillStyle = '#3a3a40'; g.fillRect(X + 2, Y + 2, 28, 8); g.fillStyle = F8.WARM; g.fillRect(X + 4, Y + 4, 24, 2);
      break;
    }
    case 'fridge8': {
      g.fillStyle = F8.STEEL3; g.fillRect(X, Y - 28, 18, 44); g.fillStyle = F8.STEEL; g.fillRect(X + 1, Y - 27, 16, 42); g.fillStyle = F8.LED; g.fillRect(X + 14, Y - 20, 2, 4); g.fillStyle = F8.DARK; g.fillRect(X + 13, Y - 8, 3, 8);
      break;
    }
    case 'lamp8': {
      g.fillStyle = F8.STEEL; g.fillRect(X + 6, Y - 20, 2, 16); g.fillStyle = F8.GOLD; g.fillRect(X + 2, Y - 6, 10, 4); g.fillStyle = 'rgba(255,196,58,0.2)'; g.fillRect(X, Y - 2, 14, 18);
      break;
    }
    case 'stool8': {
      g.fillStyle = F8.NEON; g.beginPath(); g.ellipse(X + 6, Y + 2, 6, 3, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = F8.STEEL; g.fillRect(X + 5, Y + 4, 2, 10); g.fillRect(X + 2, Y + 13, 8, 2);
      break;
    }
    case 'booth8': {
      g.fillStyle = F8.NEON; g.fillRect(X, Y - 20, 28, 36); g.fillStyle = '#4a1028'; g.fillRect(X + 2, Y - 18, 24, 32); g.fillStyle = F8.CREAM; g.fillRect(X + 2, Y + 4, 24, 8);
      break;
    }
    case 'traystack': {
      for (let i = 0; i < 3; i++){ g.fillStyle = F8.STEEL3; g.fillRect(X + 1, Y + 4 - i * 4, 14, 3); g.fillStyle = F8.STEEL; g.fillRect(X + 2, Y + 5 - i * 4, 12, 1); }
      break;
    }
    case 'vents8': {
      g.fillStyle = F8.STEEL2; g.fillRect(X, Y, 24, 10); for (let i = 0; i < 5; i++){ g.fillStyle = F8.DARK; g.fillRect(X + 2 + i * 4, Y + 2, 2, 6); }
      break;
    }
    case 'sign8': break; // drawn as a regular sign via T.sign
  }
}

function drawFeedSnack(g, kind, x, y, frame, glow){
  const bag = FEED_SPR || (typeof S !== "undefined" && S.feed);
  const spr = bag && bag.snacks && bag.snacks[kind];
  if (glow){ const a = 0.35 + Math.sin(frame * 0.2) * 0.2; g.globalAlpha = a; g.fillStyle = F8.GOLD; g.fillRect(x - 2, y - 2, 12, 12); g.globalAlpha = 1; }
  if (spr) g.drawImage(spr, x, y);
  else { g.fillStyle = F8.GOLD; g.fillRect(x, y, 8, 8); }
}
