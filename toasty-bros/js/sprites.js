// Original procedural pixel art for Mr. Toasty: Toasty Bros. Every sprite is drawn from code/pixel arrays.
'use strict';
const PAL = {
  'K':'#000000','k':'#1a1a22','Y':'#FFD400','y':'#c9a400','O':'#c8741e','o':'#7a3e10','T':'#f4c860','t':'#e0a040',
  'W':'#f0ead8','G':'#3a3f4a','g':'#5c6370','C':'#a9b3c1','c':'#e4ebf3','R':'#ff2a3a','B':'#00e5ff','S':'#7d7d86',
  's':'#b9b9c2','P':'#8a3fd1','p':'#5a2390','N':'#2a1a10','n':'#4a2c18','E':'#ff6a00'
};
function hexRGB(h){ h = h.replace('#',''); return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
function mkCanvas(w, h, fn){ const c = document.createElement('canvas'); c.width = w; c.height = h; if (typeof fn === 'function') fn(c.getContext('2d')); return c; } // v1.1: optional draw callback (World 8/9 art modules pass one)
// v0.6: read pixels through a throwaway willReadFrequently canvas (no repeated GPU readbacks / console warnings)
function readPixels(src){ const c = mkCanvas(src.width, src.height), x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0); return x.getImageData(0, 0, src.width, src.height); }
function makeSprite(rows, over){
  const pal = Object.assign({}, PAL, over || {});
  const h = rows.length, w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) throw new Error('sprite row ' + i + ' len ' + r.length + ' != ' + w + ': ' + r); });
  const c = mkCanvas(w, h), x = c.getContext('2d'), img = x.createImageData(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++){
    const ch = rows[j][i]; const col = pal[ch];
    if (!col || ch === '.') continue;
    const [r, gg, b] = hexRGB(col); const k = (j * w + i) * 4;
    img.data[k] = r; img.data[k+1] = gg; img.data[k+2] = b; img.data[k+3] = 255;
  }
  x.putImageData(img, 0, 0); return c;
}
function flipH(src){ const c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0); return c; }
function flipV(src){ const c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.translate(0, src.height); x.scale(1, -1); x.drawImage(src, 0, 0); return c; }
const _tintCache = new Map();
function tinted(src, color){
  let m = _tintCache.get(src); if (!m){ m = {}; _tintCache.set(src, m); }
  if (m[color]) return m[color];
  const c = mkCanvas(src.width, src.height), x = c.getContext('2d');
  x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  m[color] = c; return c;
}
function rng(seed){ let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

// ---------- Mr. Toasty (toast-skull head, chrome toaster body, black sleeves, yellow gloves) ----------
const HEAD = [
  '....oooooooo....',
  '...oOOOOOOOOo...',
  '..oOTTTTTTTTOo..',
  '..oTTTTTTTTTTo..',
  '..oTKKKTTKKKTo..',
  '..oTKBKTTKRKTo..',
  '..oTKKKTTKKKTo..',
  '..oTTTTKKTTTTo..',
  '..oTTKWKWKWTTo..',
  '...oooooooooo...'];
const HEAD_DEAD = HEAD.slice(); HEAD_DEAD[4] = '..oTKTKTTKTKTo..'; HEAD_DEAD[5] = '..oTTKTTTTKTTo..'; HEAD_DEAD[6] = '..oTKTKTTKTKTo..';
const SM_BODY = {
  stand: ['..KGCCCCCCCCGK..', '.YKGCcGGGGcCGKY.', '.YKGCCCCCCCCGKY.', '...GGGGGGGGGG...', '...KKK....KKK...', '..KKKK....KKKK..'],
  walk1: ['..KGCCCCCCCCGK..', '.YKGCcGGGGcCGKY.', '.YKGCCCCCCCCGKY.', '...GGGGGGGGGG...', '..KKK.....KKK...', '.KKKK......KKK..'],
  walk2: ['..KGCCCCCCCCGK..', '..KGCcGGGGcCGKY.', '.YKGCCCCCCCCGKY.', '...GGGGGGGGGG...', '....KKK..KKK....', '...KKKK..KKKK...'],
  walk3: ['..KGCCCCCCCCGK..', '.YKGCcGGGGcCGK..', '.YKGCCCCCCCCGKY.', '...GGGGGGGGGG...', '...KKK...KKK....', '..KKKK...KKKK...'],
  skid:  ['..KGCCCCCCCCGKY.', '..KGCcGGGGcCGKY.', '.YKGCCCCCCCCGK..', '...GGGGGGGGGG...', '....KKK..KKK....', '..KKKK...KKKK...'],
  jump:  ['.YKGCCCCCCCCGKY.', '..KGCcGGGGcCGK..', '...GCCCCCCCCG...', '...GGGGGGGGGG...', '..KKK.....KKK...', '.KKK.......KKKK.'],
  // v1.3 animation sync: own frames for falling, wall-sliding, the pole climb and the hurt flinch (they used to reuse jump / stand)
  fall:  ['..KGCCCCCCCCGK..', 'YYKGCcGGGGcCGKYY', '...GCCCCCCCCG...', '...GGGGGGGGGG...', '....KKK..KKK....', '....KKK..KKK....'],
  wall:  ['..KGCCCCCCCCGKY.', '..KGCcGGGGcCGKY.', '..KGCCCCCCCCGK..', '...GGGGGGGGGG...', '...KKKK..KKK....', '...KKK....KKKK..'],
  climb: ['.YKGCCCCCCCCGK..', '..KGCcGGGGcCGKY.', '...GCCCCCCCCG...', '...GGGGGGGGGG...', '...KKK..KKK.....', '....KKK..KKK....'],
  hurt:  ['..KGCCCCCCCCGK..', 'Y.KGCcGGGGcCGK.Y', '.YKGCCCCCCCCGKY.', '...GGGGGGGGGG...', '..KKK......KKK..', '.KK..........KK.'],
};
const BIG_TORSO = [
  '...KKKKKKKKKK...',
  '..KKGCCCCCCGKK..',
  '.KKGCccccccCGKK.',
  '.KKGCcGGGGcCGKK.',
  '.KKGCcGKKGcCGKK.',
  '.YYGCcGGGGcCGYY.',
  '.YYGCCCCCCCCGYY.',
  '.YYGCCCYYCCCGYY.',
  '...GCCCCCCCCG...',
  '...GCCCCCCCCG...',
  '...GBRCCCCRBG...',
  '...GGGGGGGGGG...',
  '...KKKKKKKKKK...'];
const BIG_TORSO_UP = BIG_TORSO.slice();
BIG_TORSO_UP[1] = '.YKKGCCCCCCGKKY.'; BIG_TORSO_UP[2] = '.YKGCccccccCGKY.'; BIG_TORSO_UP[3] = '.YKGCcGGGGcCGKY.';
BIG_TORSO_UP[5] = '...GCcGGGGcCG...'; BIG_TORSO_UP[6] = '...GCCCCCCCCG...'; BIG_TORSO_UP[7] = '...GCCCYYCCCG...';
const BIG_LEGS = {
  stand: ['...KKKK..KKKK...','...KKK....KKK...','...GGG....GGG...','...GGG....GGG...','...KKK....KKK...','...KKK....KKK...','...KKK....KKK...','..KKKK....KKKK..','.KKKKK....KKKKK.'],
  walk1: ['...KKKK..KKKK...','..KKKK....KKKK..','..GGG......GGG..','..GGG......GGG..','.KKK........KKK.','.KKK........KKK.','.KKK........KKK.','KKKK........KKK.','KKKK........KKKK'],
  walk2: ['...KKKK..KKKK...','....KKK..KKK....','....GGG..GGG....','....GGG..GGG....','....KKK..KKK....','....KKK..KKK....','....KKK..KKK....','...KKKK..KKKK...','..KKKKK..KKKKK..'],
};
function buildHero(over){
  const out = { small: {}, big: {} };
  for (const k in SM_BODY) out.small[k] = makeSprite(HEAD.concat(SM_BODY[k]), over);
  out.small.die = makeSprite(HEAD_DEAD.concat(SM_BODY.jump), over);
  const big = (torso, legs) => makeSprite(HEAD.concat(torso, legs), over);
  out.big.stand = big(BIG_TORSO, BIG_LEGS.stand);
  out.big.walk1 = big(BIG_TORSO, BIG_LEGS.walk1);
  out.big.walk2 = big(BIG_TORSO, BIG_LEGS.walk2);
  out.big.walk3 = big(BIG_TORSO, BIG_LEGS.walk1.map(r => r.split('').reverse().join('')));
  out.big.jump = big(BIG_TORSO_UP, BIG_LEGS.walk1);
  out.big.skid = big(BIG_TORSO, BIG_LEGS.walk2);
  const crouchRows = Array(11).fill('................').concat(HEAD, [BIG_TORSO[0], BIG_TORSO[1], BIG_TORSO[3], BIG_TORSO[5], BIG_TORSO[6], BIG_TORSO[10], BIG_TORSO[11], BIG_TORSO[12], '..KKKK....KKKK..', '.KKKKK....KKKKK.', '................']);
  out.big.crouch = makeSprite(crouchRows.slice(0, 32), over);
  // pre-flip
  for (const sz of ['small','big']) for (const k of Object.keys(out[sz])) out[sz][k + '_L'] = flipH(out[sz][k]);
  return out;
}

// ---------- enemies ----------
const CRUMB = [
  '................','................','......oooo......','....ooTTTToo....','...oTTtTTTtTo...','..oTtTTTTTTTTo..',
  '..oTKKTTTTKKTo..','.oTTKBKTTKRKTTo.','.oTTTTTTTTTTTTo.','.oTtTTKKKKTTtTo.','.oTTTKTTTTKTTTo.','..oTTTTTtTTTTo..',
  '...oooooooooo...','...KKK....KKK...','..KKKK....KKKK..','................'];
const CRUMB2 = CRUMB.slice(); CRUMB2[13] = '....KKK..KKK....'; CRUMB2[14] = '...KKKK..KKKK...';
const CRUMB_SQ = Array(10).fill('................').concat(['...oooooooooo...','.ooTTKKTTKKTToo.','oTTTTTTTTTTTTTTo','oTtTKKKKKKKKTtTo','.oooooooooooooo.','..KK........KK..']);
const CRUMB_PAL = { T:'#d89a4a', t:'#b0702a', o:'#5a2e0c' };
const TOAST = [
  '....S.....S.....','.....S...S......','...nnnnnnnnnn...','..nNNNNNNNNNNn..','.nNNnNNNNNNnNNn.','.nNNNNNNNNNNNNn.',
  '.nNRRKNNNNKRRNn.','.nNNRRNNNNRRNNn.','.nNNNNNNNNNNNNn.','.nNNNKKKKKKNNNn.','.nNNKWKWKWKKNNn.','.nNNNKKKKKKNNNn.',
  '..nNNNNNNNNNNn..','...nnnnnnnnnn...','...KKK....KKK...','..KKKK....KKKK..'];
const TOAST2 = TOAST.slice(); TOAST2[0] = '..S..S...S..S...'; TOAST2[1] = '...S..S.S..S....'; TOAST2[14] = '..KKK......KKK..'; TOAST2[15] = '.KKKK......KKKK.';

// ---------- items ----------
const ARMOR = [
  '................','...oooooooooo...','..oOOOOOOOOOOo..','.oOYYYYYYYYYYOo.','.oOYWYYYYYYYYOo.','.oOYWYYYYYYYYOo.',
  '.oOYYYYYYYYYYOo.','..oOYYKYYKYYOo..','..oOYYKYYKYYOo..','..oOYYYYYYYYOo..','..oOYYYYYYYYOo..','..oOYYYYYYYYOo..',
  '..oOYYYYYYYYOo..','..oOOOOOOOOOOo..','...oooooooooo...','................'];
const LAUNCHER = [
  '................','................','................','................','....oo....oo....','...oTTo..oTTo...',
  '...oTTo..oTTo...','..GGGGGGGGGGGG..','.GCccccccccccCG.','.GCcKKKccKKKcCG.','.GCCCCCCCCCCCCG.','.GCCRCCCCCCBCCG.',
  '.GCCCCYYYYCCCCG.','.GCCCCCCCCCCCCG.','.GGGGGGGGGGGGGG.','..KK........KK..'];
const GLITCH = [
  '................','.......WW.......','......WBBW......','.....WBBBRW.....','....WBBBRRRW....','...WBBBRRRYYW...',
  '..WBBBRRRYYYYW..','.WBBBRRRYYYYPPW.','.WBBRRRYYYYPPPW.','..WRRRYYYYPPPW..','...WRYYYYPPPW...','....WYYYPPPW....',
  '.....WYPPPW.....','......WPPW......','.......WW.......','................'];
const CARD = [
  '................','...KKKKKKKKKK...','...KBBBBBBBBK...','...KBWWWWWWBK...','...KBWKWWKWBK...','...KBWWWWWWBK...',
  '...KBWWKKWWBK...','...KBBWBWBBBK...','...KBBBBBBBBK...','...KBYYYYYYBK...','...KBYKYKYYBK...','...KBYYYYYYBK...',
  '...KBBBBBBBBK...','...KKKKKKKKKK...','................','................'];
const COIN = ['..YYYY..','.YYyYYY.','YYYYYYyY','YKKYYKKY','YKKYYKKY','YYYKKYYY','.YYYYYY.','.YKYKYK.','..YYYY..','........'];
const ROCKET = ['..oooo..','.oTTTTo.','oTTtTTTo','oTTTTTTo','oTtTTtTo','oTTTTTTo','.oTTTTo.','..oooo..'];

// ---------- tiles (procedural, themed) ----------
function tileCanvas(fn){ const c = mkCanvas(16, 16); fn(c.getContext('2d')); return c; }
function px(x, X, Y, col){ x.fillStyle = col; x.fillRect(X, Y, 1, 1); }
function drawGround(x, top, seed, P){
  const r = rng(seed);
  x.fillStyle = P.base; x.fillRect(0, 0, 16, 16);
  x.fillStyle = P.mortar; x.fillRect(0, 7, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(7, 0, 1, 7); x.fillRect(15, 8, 1, 7); x.fillRect(3, 8, 1, 7);
  x.fillStyle = P.hi; x.fillRect(0, 0, 7, 1); x.fillRect(8, 0, 7, 1); x.fillRect(0, 8, 3, 1); x.fillRect(4, 8, 11, 1);
  for (let i = 0; i < 14; i++) px(x, (r() * 16) | 0, (r() * 16) | 0, r() < 0.5 ? P.speck[0] : P.speck[1]);
  if (top){
    x.fillStyle = P.top; x.fillRect(0, 0, 16, 2);
    for (let i = 0; i < 16; i++){ const v = r(); px(x, i, 2, v < 0.3 ? P.topNoise[0] : v < 0.6 ? P.topNoise[1] : v < 0.7 ? P.topNoise[2] : P.base); }
    for (let i = 0; i < 5; i++) px(x, (r() * 16) | 0, 0, '#e6ecf5');
  }
}
function drawBrick(x, P){
  x.fillStyle = P.base; x.fillRect(0, 0, 16, 16);
  x.fillStyle = P.mortar; x.fillRect(0, 0, 16, 1); x.fillRect(0, 8, 16, 1); x.fillRect(7, 1, 1, 7); x.fillRect(15, 1, 1, 7); x.fillRect(3, 9, 1, 7); x.fillRect(11, 9, 1, 7);
  x.fillStyle = P.hi; x.fillRect(0, 1, 7, 1); x.fillRect(8, 1, 7, 1); x.fillRect(0, 9, 3, 1); x.fillRect(4, 9, 7, 1); x.fillRect(12, 9, 4, 1);
  x.fillStyle = P.lo; x.fillRect(0, 7, 7, 1); x.fillRect(8, 7, 7, 1); x.fillRect(0, 15, 16, 1);
  [[2,3],[5,5],[10,4],[13,2],[1,12],[6,11],[9,13],[14,12]].forEach(([a, b], i) => px(x, a, b, i % 2 ? P.dots[0] : P.dots[1]));
}
function drawCRT(x, frame, used, seed, tell){
  x.fillStyle = '#000'; x.fillRect(0, 0, 16, 16);
  x.fillStyle = '#3a3f4a'; x.fillRect(1, 1, 14, 14);
  x.fillStyle = '#6c7482'; x.fillRect(1, 1, 14, 1); x.fillRect(1, 1, 1, 13);
  x.fillStyle = '#23262e'; x.fillRect(1, 14, 14, 1); x.fillRect(14, 2, 1, 12);
  x.fillStyle = '#000'; x.fillRect(2, 2, 12, 10);
  if (used){
    x.fillStyle = '#0c0e14'; x.fillRect(3, 3, 10, 8);
    x.fillStyle = '#1a3a44'; x.fillRect(5, 7, 6, 1); px(x, 8, 7, '#2f6a7a');
  } else {
    const r = rng(seed + frame * 977);
    const greys = ['#1c1c1c', '#4a4a4a', '#8c8c8c', '#cfcfcf'];
    for (let j = 3; j < 11; j++) for (let i = 3; i < 13; i++){ const v = r(); px(x, i, j, v < 0.04 ? '#00e5ff' : v < 0.07 ? '#ff2a3a' : greys[(r() * 4) | 0]); }
    const gl = FONT['?']; const col = frame === 3 ? '#ffffff' : '#FFD400';
    for (let rr = 0; rr < 7; rr++) for (let cc = 0; cc < 5; cc++) if (gl[rr] & (16 >> cc)){ px(x, 6 + cc, 4 + rr, '#000'); px(x, 5 + cc, 3 + rr, col); }
    if (tell){ for (let i = 3; i < 13; i += 2){ px(x, i, 10, '#f0ead8'); } }
  }
  for (let i = 3; i < 9; i += 2) px(x, i, 13, '#15171c');
  px(x, 12, 13, used ? '#401016' : (frame % 2 ? '#ff2a3a' : '#ff6a6a'));
}
function drawSolid(x, P){
  x.fillStyle = P.edge; x.fillRect(0, 0, 16, 16);
  x.fillStyle = P.base; x.fillRect(1, 1, 14, 14);
  x.fillStyle = P.hi; x.fillRect(1, 1, 14, 1); x.fillRect(1, 1, 1, 14);
  x.fillStyle = P.lo; x.fillRect(1, 14, 14, 1); x.fillRect(14, 1, 1, 14);
  x.fillStyle = P.mid; x.fillRect(4, 4, 8, 8);
  x.fillStyle = P.dark; x.fillRect(4, 11, 8, 1); x.fillRect(11, 4, 1, 8);
  [[3,3],[12,3],[3,12],[12,12]].forEach(([a, b]) => { px(x, a, b, P.edge); px(x, a - 1, b - 1, '#ffffff'); });
}
function drawWall(x, seed){
  const r = rng(seed);
  x.fillStyle = '#1c1f2a'; x.fillRect(0, 0, 16, 16);
  x.fillStyle = '#12141c'; x.fillRect(0, 7, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(7, 0, 1, 7); x.fillRect(15, 8, 1, 7);
  x.fillStyle = '#2a2e3e'; x.fillRect(0, 0, 7, 1); x.fillRect(8, 8, 7, 1);
  for (let i = 0; i < 6; i++) px(x, (r() * 16) | 0, (r() * 16) | 0, '#30354a');
}
function drawConveyor(x, f, dir){
  x.fillStyle = '#14161c'; x.fillRect(0, 0, 16, 16);
  x.fillStyle = '#2a2e38'; x.fillRect(0, 0, 16, 6);
  for (let i = -8; i < 24; i += 6){ const o = ((i + dir * f * 2) % 24 + 24) % 24 - 4;
    x.fillStyle = '#FFD400'; for (let k = 0; k < 3; k++){ const cx = o + (dir > 0 ? k : 2 - k); x.fillRect(cx, 1 + k, 1, 1); x.fillRect(cx, 5 - k - 1, 1, 1); } }
  x.fillStyle = '#000'; x.fillRect(0, 6, 16, 1);
  x.fillStyle = '#3a3f4a'; for (let i = 0; i < 2; i++){ x.fillRect(1 + i * 8, 8, 6, 6); }
  x.fillStyle = '#6c7482'; for (let i = 0; i < 2; i++){ const a = (f + i) % 4; x.fillRect(3 + i * 8 + (a % 2), 10 + (a >> 1), 2, 1); }
  x.fillStyle = '#000'; x.fillRect(0, 15, 16, 1);
}
function drawBarrel(x){
  x.fillStyle = '#000'; x.fillRect(1, 0, 14, 16);
  x.fillStyle = '#d8b830'; x.fillRect(2, 1, 12, 14);
  x.fillStyle = '#3a3f4a'; x.fillRect(2, 1, 12, 2); x.fillRect(2, 13, 12, 2);
  x.fillStyle = '#8a7020'; x.fillRect(2, 5, 12, 1); x.fillRect(2, 10, 12, 1);
  x.fillStyle = '#fff2a0'; x.fillRect(4, 3, 1, 10);
  x.fillStyle = '#f2ecd6'; x.fillRect(6, 6, 6, 4);
  x.fillStyle = '#c8741e'; x.fillRect(7, 7, 4, 2);
  x.fillStyle = '#ffe680'; x.fillRect(11, 15, 1, 1);
}
function drawAcid(x, f){
  const r = rng(31 + f * 7);
  x.fillStyle = '#1a6a2a'; x.fillRect(0, 9, 16, 7);
  x.fillStyle = '#39ff6a'; for (let i = 0; i < 16; i++){ const h = 8 + Math.round(Math.sin((i + f * 2) * 0.8)); x.fillRect(i, h, 1, 2); }
  x.fillStyle = '#b4ffc8'; for (let i = 0; i < 3; i++) x.fillRect((r() * 14) | 0, 10 + ((r() * 5) | 0), 1, 1);
  if (f % 2) { x.fillStyle = '#39ff6a'; x.fillRect((r() * 14) | 0, 5 + ((r() * 2) | 0), 1, 1); }
}
function drawBridge(x){
  x.fillStyle = '#05040a'; x.fillRect(0, 0, 16, 8);
  x.fillStyle = '#5a6270'; x.fillRect(0, 1, 16, 6);
  x.fillStyle = '#a9b3c1'; x.fillRect(0, 1, 16, 1);
  x.fillStyle = '#20232c'; for (let i = 1; i < 16; i += 4) x.fillRect(i, 3, 2, 2);
  x.fillStyle = '#ff00c8'; x.fillRect(0, 7, 16, 1);
}
const _tilesets = {};
function buildTileset(name){
  if (_tilesets[name]) return _tilesets[name];
  const th = Object.assign({}, THEMES.overworld, THEMES[name] || {});
  if (th.toon && typeof buildToonTileset === 'function') return (_tilesets[name] = buildToonTileset(name, th));
  const ts = {
    groundTop: [0,1,2,3].map(i => tileCanvas(x => drawGround(x, true, 11 + i * 31, th.ground))),
    ground: [0,1,2,3].map(i => tileCanvas(x => drawGround(x, false, 77 + i * 13, th.ground))),
    brick: tileCanvas(x => drawBrick(x, th.brick)),
    crt: [0,1,2,3].map(f => tileCanvas(x => drawCRT(x, f, false, 5))),
    mimicTell: tileCanvas(x => drawCRT(x, 1, false, 5, true)),
    used: tileCanvas(x => drawCRT(x, 0, true, 5)),
    solid: tileCanvas(x => drawSolid(x, th.solid)),
    wall: [0,1].map(i => tileCanvas(x => drawWall(x, 3 + i * 17))),
    convR: [0,1,2,3].map(f => tileCanvas(x => drawConveyor(x, f, 1))),
    convL: [0,1,2,3].map(f => tileCanvas(x => drawConveyor(x, f, -1))),
    barrel: tileCanvas(drawBarrel),
    acid: [0,1,2,3].map(f => tileCanvas(x => drawAcid(x, f))),
    bridge: tileCanvas(drawBridge),
  };
  if (th.pit && typeof pitTiles === 'function'){ pitTiles(ts, th); ts.pit = true; } // v0.5 World 3: grimy basement trim, coils, outlets, mini fridges
  if (th.diner && typeof dinerTiles === 'function') dinerTiles(ts, th); // v0.6 World 4: checker floors, chrome counters, stools, booths, grease vats, toaster slots
  if (th.bumbo && typeof bumboTiles === 'function') bumboTiles(ts, th); // v0.7 World 5: corrugated cardboard, tape, paper shelves, butter goo, Pop-Up Springs
  if (th.crypt && typeof cryptTiles === 'function') cryptTiles(ts, th); // v0.8 World 6: crypt flagstones, CRT blocks, RGB switch blocks, jam / magma pools
  if (th.arcade && typeof arcadeTiles === 'function') arcadeTiles(ts, th); // v0.9 World 7: confetti carpet, chrome rails, prize crates, capsule stacks, CRT platforms
  // World 8 uses theme tile colors (glossy steel / neon speckles); flag the tileset so inFeed() works.
  if (th.feed) ts.feed = true;
  if (th.bite) ts.bite = true; // v1.1 World 9: Final Bite (bite.js)
  if (th.mars) ts.mars = true; // v1.2 World 10: TherapyToaster to Mars (mars.js)
  return (_tilesets[name] = ts);
}
// ---------- new enemies ----------
const ANTENNA = ['.......R........','.......C........','......CCC.......','....WWWWWWWW....','...WWWWWWWWWW...','..WWWWWWWWWWWW..',
  '..WKKKWWWWKKKW..','..WKBKWWWWKRKW..','..WKKKWWWWKKKW..','..WWWWWKKWWWWW..','...WWWWWWWWWW...','....WKWKWKWKW...',
  '....WWWWWWWWW...','.....GGGGGG.....','....GCCCCCCG....','...GGGGGGGGGG...'];
const BOMBER = ['.sss........sss.','..sss..CC..sss..','....sCCCCCCs....','...KKKKKKKKKK...','..KyyyyyyyyyyK..','..KyKKyyyyKKyK..',
  '..KyKRyyyyKRyK..','..KyyyyyyyyyyK..','..KyyyKKKKyyyK..','..KCCCCCCCCCCK..','..KccCccCccCcK..','..KyyyyyyyyyyK..',
  '..KyyyyyyyyyyK..','...KKKKKKKKKK...','......yy........','.......y........'];
const MIMIC = ['................','................','KKKKKKKKKKKKKKKK','KGGGGGGGGGGGGGGK','KGKKKKKKKKKKKKGK','KGKRKKKKKKKKRKGK',
  'KGKRRKKKKKKRRKGK','KGKKKKKKKKKKKKGK','KGWKWKWKWKWKWKGK','KGKWKWKWKWKWKWGK','KGKKKKKKKKKKKKGK','KGGGGGGGGGGGGGGK',
  'KGGGGGGGGGGGGRGK','KKKKKKKKKKKKKKKK','..KK........KK..','.KKK........KKK.'];
function buildSprites(){
  const S = {};
  S.hero = buildHero();
  S.heroFire = buildHero({ C:'#ff7a3a', c:'#ffd6a8', G:'#7a1414', g:'#a02020' });
  S.heroStar = [
    buildHero({ C:'#00e5ff', c:'#c8fbff', G:'#00606e' }),
    buildHero({ C:'#ff2a3a', c:'#ffb0b8', G:'#6e0010' }),
    buildHero({ C:'#ffffff', c:'#ffffff', G:'#8a8a96', T:'#fff2a0' }),
  ];
  const c1 = makeSprite(CRUMB, CRUMB_PAL), c2 = makeSprite(CRUMB2, CRUMB_PAL);
  S.crumb = [c1, c2]; S.crumbSq = makeSprite(CRUMB_SQ, CRUMB_PAL); S.crumbFlip = flipV(c1);
  const t1 = makeSprite(TOAST), t2 = makeSprite(TOAST2), tw = makeSprite(TOAST, { R:'#ffee00' });
  S.toast = { walk: [t1, makeSprite(TOAST.slice(0, 14).concat(['....KKK..KKK....', '...KKKK..KKKK...']))], charge: [t2, makeSprite(TOAST2, { R:'#ffee00' })], wind: tw };
  for (const k of ['walk','charge']) S.toast[k + '_L'] = S.toast[k].map(flipH);
  S.toast.wind_L = flipH(tw); S.toastFlip = flipV(t1);
  S.armor = makeSprite(ARMOR); S.launcher = [makeSprite(LAUNCHER), makeSprite(LAUNCHER, { C:'#ffd27a', c:'#fff3c8', R:'#00e5ff', B:'#ff2a3a' })];
  const perms = [{}, { B:'#ff2a3a', R:'#FFD400', Y:'#8a3fd1', P:'#00e5ff' }, { B:'#FFD400', R:'#8a3fd1', Y:'#00e5ff', P:'#ff2a3a' }, { B:'#8a3fd1', R:'#00e5ff', Y:'#ff2a3a', P:'#FFD400' }];
  S.glitch = perms.map(p => makeSprite(GLITCH, p));
  S.card = makeSprite(CARD); S.coin = makeSprite(COIN); S.rocket = makeSprite(ROCKET);
  S.tiles = buildTileset('overworld');
  S.tileset = buildTileset;
  const aPal = { W: '#e6d5b8' };
  S.antenna = [makeSprite(ANTENNA, aPal), makeSprite(ANTENNA, Object.assign({ R: '#00e5ff', C: '#e4ebf3' }, aPal))];
  S.antenna_L = S.antenna.map(flipH); S.antennaFlip = flipV(S.antenna[0]);
  const bPal = { y: '#ffe680', s: '#c8ccd8' };
  const B2 = BOMBER.slice(); B2[0] = '................'; B2[1] = '.ssss..CC..ssss.';
  const BD = BOMBER.slice(); BD[0] = '................'; BD[1] = '....s..CC..s....';
  S.bomber = [makeSprite(BOMBER, bPal), makeSprite(B2, bPal)]; S.bomberDive = makeSprite(BD, bPal); S.bomberFlip = flipV(S.bomber[0]);
  const MO = MIMIC.slice(); MO[7] = 'KGWKWKWKWKWKWKGK'; MO[8] = 'KGppppppppppppGK'; MO[9] = 'KGppppppppppppGK'; MO[10] = 'KGKWKWKWKWKWKWGK';
  S.mimic = [makeSprite(MIMIC), makeSprite(MO)]; S.mimicFlip = flipV(S.mimic[0]);
  if (typeof buildToonSprites === 'function'){ S.toon = buildToonSprites(S); S.grand = buildGrandToaster(); }
  if (typeof buildDinerSprites === 'function') S.diner = buildDinerSprites(); // v0.6 World 4
  if (typeof buildBumboSprites === 'function') S.bumbo = buildBumboSprites(); // v0.7 World 5
  if (typeof buildCryptSprites === 'function') S.crypt = buildCryptSprites(); // v0.8 World 6
  if (typeof buildArcadeSprites === 'function') S.arcade = buildArcadeSprites(); // v0.9 World 7
  if (typeof buildFeedSprites === 'function') S.feed = buildFeedSprites(); // v1.0 World 8
  if (typeof buildBiteSprites === 'function') S.bite = buildBiteSprites(); // v1.1 World 9
  if (typeof buildMarsSprites === 'function') S.mars = buildMarsSprites(); // v1.2 World 10
  if (typeof buildPitSprites === 'function'){ S.pit = buildPitSprites(); S.debtTable = buildDebtTable(false); S.debtTableBurnt = buildDebtTable(true); }
  return S;
}
