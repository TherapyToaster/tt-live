// v0.4 BRO ROSTER: eight original playable bros. Each one is data (stats, weapon, melee, special) + original pixel frames.
// Every sprite is hand-placed pixels drawn in code. No outside art.
'use strict';
const BRO_IDS = ['toasty', 'fatcoty', 'skelly', 'acid', 'breadlord', 'screamer', 'cal', 'skulrz', 'spaceacid', 'yblankey'];
// v1.3: two new bros. SPACE ACID (ACID in a plain white space suit, no patches or logos) frees from cages like the rest;
// YELLOW BLANKEY only joins the cage pool (and is unlocked outright) once the game is beaten.
const BRO_AFTER_BEATEN = ['yblankey'];
const BROS = {
  toasty: { name: 'MR. TOASTY', short: 'TOASTY', color: '#FFD400',
    stats: { speed: 1.0, jump: 1.0 },
    weapon: { kind: 'rocket', label: 'TOAST-ROCKET GUN', rate: 20, auto: true },
    melee: { kind: 'punch', label: 'TOASTER JAB' },
    special: { kind: 'crumbburst', label: 'CRUMB BURST' } },
  fatcoty: { name: 'FAT COTY', short: 'FAT COTY', color: '#ff2fb4',
    stats: { speed: 0.9, jump: 0.95 },
    weapon: { kind: 'snack', label: 'SNACK SPRAY', rate: 5, auto: true },
    melee: { kind: 'bite', label: 'BITE (HEALS)' },
    special: { kind: 'slam', label: 'BODY SLAM' } },
  skelly: { name: 'TOASTER TRUCK SKELETON', short: 'SKELLY', color: '#FFD400',
    stats: { speed: 1.05, jump: 1.0 },
    weapon: { kind: 'shotgun', label: 'BUTTER BLASTER', rate: 30, auto: true },
    melee: { kind: 'punch', label: 'BONY JAB' },
    special: { kind: 'ram', label: 'TRUCK-RAM DASH' } },
  acid: { name: 'ACID', short: 'ACID', color: '#e8c060',
    stats: { speed: 1.0, jump: 1.0 },
    weapon: { kind: 'sniper', label: 'LONG SHOT', rate: 34, auto: true },
    melee: { kind: 'punch', label: 'ELBOW' },
    special: { kind: 'jetpack', label: 'JETPACK HOVER' } },
  breadlord: { name: 'BREADLORD JR.', short: 'BREADLORD', color: '#b46cff',
    stats: { speed: 1.0, jump: 1.0 },
    weapon: { kind: 'iou', label: 'IOU SPREAD', rate: 18, auto: true },
    melee: { kind: 'punch', label: 'LOAF SLAP' },
    special: { kind: 'curse', label: 'DEBT CURSE' } },
  screamer: { name: 'CHROME SCREAMER', short: 'SCREAMER', color: '#a9f4ff',
    stats: { speed: 1.0, jump: 1.05 },
    weapon: { kind: 'shriek', label: 'SHRIEK CONE', rate: 26, auto: true },
    melee: { kind: 'punch', label: 'CRYSTAL BONK' },
    special: { kind: 'mirror', label: 'MIRROR SHIELD' } },
  cal: { name: 'CAL THE REPAIRMAN', short: 'CAL', color: '#7fd0ff',
    stats: { speed: 0.95, jump: 1.0 },
    weapon: { kind: 'zap', label: 'STATIC ZAPPER', rate: 12, auto: true },
    melee: { kind: 'wrench', label: 'WRENCH' },
    special: { kind: 'turret', label: 'TV TURRET' } },
  skulrz: { name: 'SKULRZ SKULL', short: 'SKULRZ', color: '#ff00c8',
    stats: { speed: 1.08, jump: 1.0 },
    weapon: { kind: 'roll', label: 'ROLL DASH', rate: 34, auto: true },
    melee: { kind: 'punch', label: 'HEADBUTT' },
    special: { kind: 'bonebomb', label: 'BONE BOMB' } },
  spaceacid: { name: 'SPACE ACID', short: 'SPACE ACID', color: '#eef0f4',
    stats: { speed: 1.0, jump: 1.0 },
    weapon: { kind: 'plasma', label: 'PLASMA PISTOL', rate: 14, auto: true },
    melee: { kind: 'punch', label: 'HELMET BONK' },
    special: { kind: 'hover', label: 'JETPACK HOVER' } },
  yblankey: { name: 'YELLOW BLANKEY', short: 'BLANKEY', color: '#FFD400', afterBeaten: true,
    stats: { speed: 1.0, jump: 1.0 },
    weapon: { kind: 'pillow', label: 'PILLOW TOSS', rate: 20, auto: true },
    melee: { kind: 'punch', label: 'BLANKET SNAP' },
    special: { kind: 'glide', label: 'BLANKET GLIDE' } },
};

// ---- pixel frames (16x16, facing right). Rows 13-15 are legs and get swapped for the run / jump frames. ----
const BRO_ART = {
  fatcoty: { pal: { h: '#e8b48a', M: '#ff2fb4', m: '#a8127a', g: '#7d828c', J: '#3a64b0', j: '#26467e', n: '#5a3a22', W: '#f4f4f4' },
    legs: ['J', 'W'], wide: true, rows: [
    '................',
    '....KKKKKKK.....',
    '...KKKKKKKKK....',
    '...KKKKKKKKKKKK.',
    '...hhhhhhhhh....',
    '...hMMMhMMMh....',
    '...hmMMhmMMh....',
    '...hhhhhhhhh....',
    '...hhnnnnnhh....',
    '..ggggggggggg...',
    '.hgggKKKKggggh..',
    '.hggggggggggggh.',
    '.hgggggggggggh..',
    '..JJJJJJJJJJJ...',
    '..JJJJ...JJJJ...',
    '..WWWW...WWWW...'] },
  skelly: { pal: { W: '#f4f1e8', w: '#cfc8b8', Y: '#FFD400', y: '#c9a400', G: '#3a3f4a' },
    legs: ['G', 'K'], rows: [
    '................',
    '.....WWWWW......',
    '....WWWWWWW.....',
    '....WKKWKKW.....',
    '....WKKWKKw.....',
    '....WWWKWWw.....',
    '.....WKWKw......',
    '......WWW.......',
    '....YYYYYYY.....',
    '...YYYKYYYyY....',
    '...WYYKYYYyW....',
    '...WYYKYYYyW....',
    '....YYYYYYy.....',
    '....GGG.GGG.....',
    '....GGG.GGG.....',
    '...KKKK.KKKK....'] },
  acid: { pal: { h: '#e2a77c', Y: '#ffd21a', D: '#e8b830', b: '#d8c49a', B: '#b8a070', R: '#d8282e', J: '#4a5468' },
    legs: ['J', 'K'], rows: [
    '................',
    '.....KKKKKK.....',
    '....KKKKKKKKK...',
    '...YhhhhhhhY....',
    '...YDDDhDDDY....',
    '...YhhhhhhhY....',
    '....hhhhhhh.....',
    '.....hhhhh......',
    '....bbRRRbb.....',
    '...bbbRYRbbb....',
    '..hbbbRRRbbBh...',
    '..hbbbRRRbbBh...',
    '...bbbbbbbbB....',
    '....JJJ.JJJ.....',
    '....JJJ.JJJ.....',
    '...KKKK.KKKK....'] },
  breadlord: { pal: { Y: '#FFD400', t: '#a8642a', T: '#f0c070', P: '#7a32c8', p: '#4e1e88', W: '#f0ead8' },
    legs: ['p', 'K'], rows: [
    '.....Y.Y.Y......',
    '.....YYYYY......',
    '...ttttttttt....',
    '..tTTTTTTTTTt...',
    '..tTKKTTTKKTt...',
    '..tTTTTTTTTTt...',
    '..tTTKKKKKTTt...',
    '...ttttttttt....',
    '....PPPPPPP.....',
    '...PPPWYWPPP....',
    '..TPPPWYWPPPT...',
    '..TPPPPYPPPPT...',
    '...PPPPPPPPP....',
    '....ppp.ppp.....',
    '....ppp.ppp.....',
    '...KKKK.KKKK....'] },
  screamer: { pal: { c: '#e8fbff', C: '#a9dcef', s: '#5a8ea8', B: '#00e5ff', G: '#2c3340', g: '#48526a' },
    legs: ['G', 'K'], rows: [
    '.....c...c......',
    '....cCc.cCc.....',
    '...cCCCcCCCc....',
    '..cCCsCCCsCCc...',
    '..cCKKCCCKKCc...',
    '..cCKBCCCKBCc...',
    '..sCCCCKCCCCs...',
    '...sCKKKKKCs....',
    '....sCKKKCs.....',
    '.....sCCCs......',
    '....GGGGGGG.....',
    '...cGGgggGGc....',
    '...cGGGGGGGc....',
    '....GGG.GGG.....',
    '....GGG.GGG.....',
    '...KKKK.KKKK....'] },
  cal: { pal: { G: '#3a3f4a', g: '#6a7080', c: '#cfe6ee', W: '#ffffff', B: '#00e5ff', h: '#e2a77c', U: '#2e5aa8', Y: '#FFD400', O: '#7a4a1e' },
    legs: ['U', 'K'], rows: [
    '....K.....K.....',
    '.....K...K......',
    '..GGGGGGGGGGG...',
    '..GccWccWcccG...',
    '..GcWcccccWgG...',
    '..GcBBcccBBgG...',
    '..GccccccccgG...',
    '..GcccKKKccgG...',
    '..GGGGGGGGGGG...',
    '...hUUUUUUUh....',
    '...hUUYYYUUh....',
    '....UUUUUUU.....',
    '....OOOOOOO.....',
    '....UUU.UUU.....',
    '....UUU.UUU.....',
    '...KKKK.KKKK....'] },
  skulrz: { pal: { W: '#f0ead8', s: '#b8b0a0', M: '#ff00c8', P: '#5a2390', p: '#8a3fd1' },
    legs: ['P', 'K'], rows: [
    '................',
    '....WWWWWWW.....',
    '...WWWWWWWWW....',
    '..WWWWWWWWWWW...',
    '..WWKKKWKKKWW...',
    '..WWKMKWKMKWW...',
    '..WWKKKWKKKWW...',
    '..WWWWWKWWWWW...',
    '...WWWKKKWWW....',
    '...sWKWKWKWs....',
    '....sWWWWWs.....',
    '....PPPPPPP.....',
    '...pPPPPPPPp....',
    '....PPP.PPP.....',
    '....PPP.PPP.....',
    '...KKKK.KKKK....'] },
  // v1.3 SPACE ACID: white suit, bubble helmet (shades on, no cigarette), a backpack jetpack, a plain grape-jam shoulder square
  spaceacid: { pal: { W: '#eef0f4', w: '#b8bec8', c: '#9adcff', h: '#e2a77c', D: '#2a2c32', g: '#7d828c', J: '#b54e8c', o: '#ff8a2a' },
    legs: ['W', 'g'], rows: [
    '.....WWWWWW.....',
    '....WccccccW....',
    '...WcchhhhccW...',
    '...WcDDhDDhcW...',
    '...WchhhhhhcW...',
    '...WcchhhhccW...',
    '....WccccccW....',
    '...wWWWWWWWWw...',
    'gg.WWWJWWWWWW...',
    'ggwWWWWWWWWWWw..',
    'ggwWWWWWWWWWWw..',
    'gg.WWooooooWW...',
    '...WWWWWWWWWW...'] },
  // v1.3 YELLOW BLANKEY: the final boss's blanket form, bro-sized: a yellow blanket hood with two cyan eyes
  yblankey: { pal: { Y: '#FFD400', y: '#c9a400', f: '#1a1d26', B: '#00e5ff', J: '#b54e8c' },
    legs: ['y', 'G'], rows: [
    '......YYY.......',
    '....YYYYYYY.....',
    '...YYYYYYYYYy...',
    '..YYyffffffYy...',
    '..YYfBffBfffYy..',
    '..YYffffffffYy..',
    '..YYyffffffyYy..',
    '..yYYYYYYYYYYy..',
    '.YYYYyYYYJYYYYy.',
    '.YYYyYYYYYYYYYy.',
    '.yYYYYYyYYYYYYy.',
    '..yYYYYYYYYYYy..',
    '..yyYYYYYYYYyy..'],
    glide: [
    '......YYY.......',
    '....YYYYYYY.....',
    '...YYYYYYYYYy...',
    '..YYyffffffYy...',
    '..YYfBffBfffYy..',
    '..YYffffffffYy..',
    '..YYyffffffyYy..',
    'yYYYYYYYYYYYYYYy',
    'YYYyYYYYYJYYYyYY',
    '.YYYYyYYYYYyYYY.',
    '..YYYYYYYYYYYY..',
    '....yYYYYYYy....',
    '.....YYYYYY.....'] },
};
// SkulRz Skull also has a rolling ball frame (used by its roll-dash)
const SKULL_ROLL = [
  '................',
  '................',
  '.....WWWWWW.....',
  '...WWWWWWWWWW...',
  '..WWWKKWWKKWWW..',
  '..WWKMKWWKMKWW..',
  '.WWWWKKWWKKWWWW.',
  '.WWWWWWKKWWWWWW.',
  '.WWWWWKKKKWWWWW.',
  '.WWWsWKWWKWsWWW.',
  '..WWWWWWWWWWWW..',
  '..WWWWWWWWWWWW..',
  '...WWWWWWWWWW...',
  '....sWWWWWWs....',
  '.....ssssss.....',
  '................'];
function broLegs(L, F, wide, k){
  const n = { stand: ['....LLL.LLL.....', '....LLL.LLL.....', '...FFFF.FFFF....'],
    walk1: ['...LLL...LLL....', '..LLL.....LLL...', '.FFFF.....FFFF..'],
    walk2: ['....LLL.LLL.....', '.....LLLLL......', '....FFFFFF......'],
    walk3: ['.....LLLLL......', '....LLL.LLL.....', '...FFF...FFF....'],
    jump: ['...LLLL.LLL.....', '..LLL.....LL....', '..FFF.....FFF...'],
    // v1.3 animation sync poses
    fall: ['.....LL.LL......', '.....LL.LL......', '.....FF.FFF.....'],
    skid: ['...LLL.LLL......', '..LLL.....LLL...', '.FFF.......FFFF.'],
    wall: ['....LLLLLL......', '....LL...LL.....', '....FF....FFF...'],
    climb: ['....LLL.LLL.....', '....LLL..LL.....', '...FFFF..FF.....'],
    hurt: ['..LLL.....LLL...', '.LL.........LL..', 'FF...........FF.'] };
  const w = { stand: ['..LLLLLLLLLLL...', '..LLLL...LLLL...', '..FFFF...FFFF...'],
    walk1: ['..LLLLLLLLLLL...', '.LLLL.....LLLL..', 'FFFF.......FFFF.'],
    walk2: ['..LLLLLLLLLLL...', '...LLLL.LLLL....', '...FFFF.FFFF....'],
    walk3: ['..LLLLLLLLLLL...', '..LLLL..LLLL....', '.FFFF....FFFF...'],
    jump: ['..LLLLLLLLLLL...', '.LLLL....LLLL...', '.FFF......FFF...'],
    fall: ['..LLLLLLLLLLL...', '...LLLL..LLLL...', '...FFFF..FFFF...'],
    skid: ['..LLLLLLLLLLL...', '.LLLL.....LLLL..', 'FFF.........FFFF'],
    wall: ['..LLLLLLLLLLL...', '..LLLL...LLLLL..', '..FFFF....FFFF..'],
    climb: ['..LLLLLLLLLLL...', '..LLLL..LLLL....', '.FFFFF..FFFF....'],
    hurt: ['.LLLLL...LLLLL..', 'LLLL.......LLLL.', 'FF...........FF.'] };
  return (wide ? w : n)[k].map(r => r.replace(/L/g, L).replace(/F/g, F));
}
// Auto outline (dark navy) around every opaque pixel, so each bro reads on any background.
function broOutline(src, col){
  const w = src.width, h = src.height, d = readPixels(src).data;
  const c = mkCanvas(w, h), y = c.getContext('2d');
  y.fillStyle = col || '#10121e';
  const op = (i, j) => i >= 0 && j >= 0 && i < w && j < h && d[(j * w + i) * 4 + 3] > 0;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (!op(i, j) && (op(i - 1, j) || op(i + 1, j) || op(i, j - 1) || op(i, j + 1))) y.fillRect(i, j, 1, 1);
  y.drawImage(src, 0, 0); return c;
}
function broSquash(src){ const c = mkCanvas(16, 16), x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0, 16, 16, -1, 3, 18, 13); return c; }
function buildBroSprites(hero){
  const out = {};
  for (const id of BRO_IDS){
    const set = {};
    if (id === 'toasty'){ // Mr. Toasty keeps his original v0.1 frames
      for (const k of ['stand', 'walk1', 'walk2', 'walk3', 'jump', 'skid', 'fall', 'wall', 'climb', 'hurt']) set[k] = hero.small[k];
      set.die = hero.small.die || hero.small.stand;
    } else {
      const a = BRO_ART[id];
      for (const k of ['stand', 'walk1', 'walk2', 'walk3', 'jump', 'fall', 'skid', 'wall', 'climb']) set[k] = broOutline(makeSprite(a.rows.slice(0, 13).concat(broLegs(a.legs[0], a.legs[1], a.wide, k)), a.pal));
      // v1.3 hurt flinch: the body snaps back a pixel and the legs splay
      set.hurt = broOutline(makeSprite(a.rows.slice(0, 13).map(r => r.slice(1) + '.').concat(broLegs(a.legs[0], a.legs[1], a.wide, 'hurt')), a.pal));
      set.die = flipV(set.hurt); // v1.3 a real KO frame (it used to be the stand frame)
      if (id === 'skulrz') set.roll = broOutline(makeSprite(SKULL_ROLL, a.pal));
      if (a.glide) set.glide = broOutline(makeSprite(a.glide.concat(broLegs(a.legs[0], a.legs[1], a.wide, 'fall')), a.pal));
    }
    set.land = broSquash(set.stand); // v1.3 landing squash (generic: the stand frame, 2 px shorter and 1 px wider)
    for (const k of Object.keys(set)) set[k + '_L'] = flipH(set[k]);
    // portrait: the head (top 10 rows) on a dark plate, 16x12
    const pc = mkCanvas(18, 13), px = pc.getContext('2d');
    px.fillStyle = '#10121e'; px.fillRect(0, 0, 18, 13); px.fillStyle = BROS[id].color; px.fillRect(1, 1, 16, 11); px.fillStyle = '#10121e'; px.fillRect(2, 2, 14, 9);
    px.save(); px.beginPath(); px.rect(2, 2, 14, 9); px.clip(); px.drawImage(set.stand, 1, id === 'toasty' ? 2 : 1); px.restore();
    set.portrait = pc;
    out[id] = set;
  }
  // rescue cage (16x16 + prisoner drawn inside), turret, ammo crate
  out.cage = makeSprite([
    'KKKKKKKKKKKKKKKK',
    'KssssssssssssssK',
    'Ks.s..s..s..s.sK',
    'Ks.s..s..s..s.sK',
    'Ks.s..s..s..s.sK',
    'Ks.s..s..s..s.sK',
    'Ks.s..s..s..s.sK',
    'Ks.s..s..s..s.sK',
    'Ks.s..s..s..s.sK',
    'Ks.s..s..s..s.sK',
    'Ks.s..s..s..s.sK',
    'Ks.s..s..s..s.sK',
    'Ks.s..s..s..s.sK',
    'Ks.s..s..s..s.sK',
    'KssssssssssssssK',
    'KKKKKKKKKKKKKKKK'], { s: '#9aa4b4' });
  out.turret = broOutline(makeSprite([
    '................',
    '....GGGGGGGG....',
    '....GccccccG....',
    '....GcBccBcGKKKK',
    '....GccccccGKKKK',
    '....GGGGGGGG....',
    '......KKKK......',
    '.....KKKKKK.....',
    '....KK....KK....',
    '...KK......KK...'], { G: '#3a3f4a', c: '#cfe6ee', B: '#00e5ff' }));
  out.ammo = broOutline(makeSprite([
    '..............',
    '.OOOOOOOOOOOO.',
    '.OooooooooooO.',
    '.OoYYYooYYYoO.',
    '.OoYKYooYKYoO.',
    '.OoYYYooYYYoO.',
    '.OooooooooooO.',
    '.OOOOOOOOOOOO.',
    '.OoooYYYYoooO.',
    '.OoooYooYoooO.',
    '.OOOOOOOOOOOO.'], { O: '#7a4a1e', o: '#b8783a', Y: '#FFD400' }));
  // toaster tank (chrome pressure tank with a hazard band) and gas can (red jerry can): both explode
  out.tank = makeSprite([
    '....KKKKKKKK....',
    '...KccccccccK...',
    '..KcwwcccccccK..',
    '.KcwccccccccmmK.',
    '.KcwccccccccmmK.',
    '.KYKYKYKYKYKYKK.',
    '.KKYKYKYKYKYKYK.',
    '.KcwccccccccmmK.',
    '.KcwccccccccmmK.',
    '.KcwcccRRcccmmK.',
    '.KcwccRwRRccmmK.',
    '.KcwccRRRRccmmK.',
    '.KcwcccRRcccmmK.',
    '..KcccccccccmK..',
    '...KKKKKKKKKK...',
    '..KKK......KKK..'], { c: '#d7dbe3', w: '#ffffff', m: '#8b909c', Y: '#FFD400', R: '#e8402a' });
  out.gas = makeSprite([
    '................',
    '.....KKKK.......',
    '.....KwwK.KKKK..',
    '...KKKKKKKKrrK..',
    '..KrrrrrrrrrrK..',
    '.KrwwrrrrrrrrdK.',
    '.KrwrrrrrrrrrdK.',
    '.KrwrKKKKKKrrdK.',
    '.KrwrKYYYYKrrdK.',
    '.KrwrKYKKYKrrdK.',
    '.KrwrKYYYYKrrdK.',
    '.KrwrKKKKKKrrdK.',
    '.KrwrrrrrrrrrdK.',
    '.KrrrrrrrrrrddK.',
    '..KddddddddddK..',
    '...KKKKKKKKKK...'], { r: '#e8402a', w: '#ff9a7a', d: '#9a1e14', Y: '#FFD400' });
  return out;
}
