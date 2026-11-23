// Mr. Toasty: Toasty Bros — engine (v0.4 BRO EDITION; v0.3: World 2 Toaster Kart). Original code; SMB used only as a mechanics reference.
'use strict';
(function(){
const W = 256, H = 240, TS = 16, STEP = 1000 / 60;
const params = new URLSearchParams(location.search);
const TEST = params.has('test'), AUTO = params.has('autoplay'), DEBUG = params.has('debug');
const screenC = document.getElementById('screen'), sctx = screenC.getContext('2d');
const buf = document.createElement('canvas'); buf.width = W; buf.height = H;
const g = buf.getContext('2d');
let scale = 3;
function resize(){
  // v0.5 mobile: touch devices get a safe-area-aware fit (landscape: screen centred between the thumb controls; portrait: screen on top,
  // controls below) with integer scaling when it is close, else quarter steps. Desktop keeps pure integer scaling.
  if (typeof TouchInput !== 'undefined' && TouchInput.active){ scale = TouchInput.fit(screenC, W, H); return; }
  const fit = Math.min(window.innerWidth / W, window.innerHeight / H);
  scale = Math.max(1, Math.floor(fit));
  screenC.width = Math.round(W * scale); screenC.height = Math.round(H * scale);
  screenC.style.width = screenC.width + 'px'; screenC.style.height = screenC.height + 'px';
}
window.addEventListener('resize', resize); window.addEventListener('orientationchange', () => { resize(); setTimeout(resize, 120); setTimeout(resize, 400); });
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
resize(); setTimeout(resize, 50);
const S = buildSprites();
S.bro = buildBroSprites(S.hero);
const A = AudioSys;

// ---------------- save data ----------------
const SAVE_KEY = 'toastyBros.save.v1';
function loadSave(){
  const d = () => ({ furthest: '1-1', hi: 0, worldsCleared: [], unlocked: ['toasty'], startBro: 'toasty' });
  let s; try { s = Object.assign(d(), JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) { s = d(); }
  if (!Array.isArray(s.unlocked) || !s.unlocked.length) s.unlocked = ['toasty'];
  s.unlocked = BRO_IDS.filter(id => s.unlocked.includes(id) || id === 'toasty');
  if (!s.unlocked.includes(s.startBro)) s.startBro = 'toasty';
  return s;
}
let save = loadSave();
function writeSave(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
function bumpHi(){ if (G.score > save.hi){ save.hi = G.score; } }
function reach(id){ if (LEVEL_ORDER.indexOf(id) > LEVEL_ORDER.indexOf(save.furthest)) save.furthest = id; writeSave(); }

// ---------------- input ----------------
const KEYMAP = {
  left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
  jump: ['KeyZ', 'Space', 'KeyK'], run: ['KeyX', 'ShiftLeft', 'ShiftRight', 'KeyJ'], start: ['Enter', 'NumpadEnter'],
  fire: ['KeyF'], special: ['KeyC', 'KeyL'], melee: ['KeyV', 'KeyI'],
};
const ALLCODES = new Set(Object.values(KEYMAP).flat());
const keys = {}, taps = {};
window.addEventListener('keydown', e => { if (ALLCODES.has(e.code)) e.preventDefault(); if (!e.repeat) taps[e.code] = true; keys[e.code] = true; A.unlock(); });
window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('pointerdown', () => A.unlock());
['touchend', 'click'].forEach(ev => window.addEventListener(ev, () => A.unlock(), { passive: true }));
function releaseAll(){ for (const k in keys) keys[k] = false; for (const k in taps) delete taps[k]; if (typeof TouchInput !== 'undefined') TouchInput.release(); }
window.addEventListener('blur', releaseAll);
// pause automatically when the tab / app is hidden, and drop every held key or touch so nothing sticks
function autoPause(){ releaseAll(); if (typeof G !== 'undefined' && G.state === 'play' && !G.paused && !G.dialog){ G.paused = true; G.autoPaused = true; A.pause(true); } }
document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause(); });
window.addEventListener('pagehide', autoPause);
let btn = {}, prev = {}, forced = null;
function readInput(){
  prev = btn;
  const b = {};
  for (const k in KEYMAP) b[k] = KEYMAP[k].some(c => keys[c] || taps[c]);
  for (const c in taps) delete taps[c];
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const gp of pads){
    if (!gp) continue;
    const B = i => gp.buttons[i] && gp.buttons[i].pressed;
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    if (B(14) || ax < -0.4) b.left = true;
    if (B(15) || ax > 0.4) b.right = true;
    if (B(12) || ay < -0.5) b.up = true;
    if (B(13) || ay > 0.5) b.down = true;
    if (B(0)) b.jump = true;
    if (B(1)) b.run = true;
    if (B(2)) b.special = true;
    if (B(3)) b.melee = true;
    if (B(9)) b.start = true;
    if (gp.buttons.some(x => x.pressed)) A.unlock();
  }
  if (typeof TouchInput !== 'undefined' && TouchInput.active){ const t = TouchInput.poll(); for (const k in t) if (t[k]) b[k] = true; }
  if (AUTO) Object.assign(b, botInput());
  if (forced) Object.assign(b, forced);
  btn = b;
}
const pressed = k => btn[k] && !prev[k];

// ---------------- game state ----------------
const G = { state: 'title', stateT: 0, frame: 0, lf: 0, score: 0, coins: 0, lives: 3, time: 300, timeT: 0, levelId: '1-1', carrySize: 0,
  checkpoint: false, paused: false, fade: 0, hurry: false, polePhase: 0, poleT: 0, pennant: 0, tvOn: false, endT: 0, onAir: false,
  menu: 0, sel: 0, selSize: 0, dialog: null, dialogDone: false, camLockX: null, unplugged: false, collapse: null, castleEnd: false, warpTo: 0, shake: 0, deaths: 0,
  flash: 0, nextWorldLevel: null, clearedWorld: 1, warpTarget: null,
  hitStop: 0, escape: null, bigText: null, broFlash: null, curBro: 'toasty', reserve: [], rescued: 0, kills: 0, curseT: 0 };
let grand = rng(1);
let LV = null, AREAS = null, lv = null, camX = 0, TSET = S.tiles;
let P = null, BOSS = null;
let enemies = [], items = [], rockets = [], parts = [], pops = [], coinpops = [], plats = [], patches = [], bolts = [], ftoasts = [];
let shots = [], booms = [], rings = [], turrets = [];
let POLE = null, BOOTH = null;
const PH = { walkMax: 1.5625, runMax: 2.5625, walkAcc: 0.0371, runAcc: 0.0557, rel: 0.0508, skid: 0.1016, maxFall: 4.5 };
function jumpParams(av){ if (av < 1.0) return [-4.0, 0.125, 0.4375]; if (av < 2.3) return [-4.0, 0.117, 0.375]; return [-5.0, 0.156, 0.5625]; }

const MAX_HP = 3; // v0.8.1: every bro takes 3 hits; Toast Armor / Oven Mitt are extra shields on top
function newPlayer(x, y){
  return { x, y, vx: 0, vy: 0, w: 12, h: 15, size: 0, facing: 1, onGround: true, jumpHeld: false, gHold: 0.125, gFall: 0.4375,
    airMax: PH.walkMax, skid: false, anim: 0, inv: 0, star: 0, crouch: false, dead: false, morph: 0, morphDir: 0, combo: 0, jumpBuf: 0,
    throwT: 0, ctrl: 'normal', ctrlT: 0, prevY: 0, plat: null, slick: false, boost: 0, dropT: 0,
    bro: G.curBro || 'toasty', spec: 3, cool: 0, mcool: 0, scool: 0, melT: 0, wall: 0, wallG: 0, wallD: 0, wjLock: 0,
    slam: 0, dash: 0, jet: 0, mirror: 0, roll: 0, armorFx: 0, dashHitBoss: false, hp: MAX_HP, hpFx: 0 };
}
function newGame(levelId){
  G.score = 0; G.coins = 0; G.lives = 3; G.carrySize = 0; G.checkpoint = false; G.levelId = levelId || '1-1'; G.deaths = 0;
  G.curBro = save.unlocked.includes(save.startBro) ? save.startBro : 'toasty'; G.reserve = []; G.rescued = 0; G.kills = 0;
  G.state = 'intro'; G.stateT = 0;
}

// ---------------- areas ----------------
function surfaceRow(tx){ let seenAir = false; for (let y = 2; y < 15; y++){ if (standable(tx, y)){ if (seenAir) return y; } else seenAir = true; } return 15; }
function enterArea(name){
  if (lv) lv.rt = { enemies, items, plats, patches, bolts, camX };
  lv = AREAS[name]; G.area = name; TSET = S.tileset(lv.theme);
  const r = lv.rt;
  if (r){ enemies = r.enemies; items = r.items; plats = r.plats; patches = r.patches; bolts = r.bolts; }
  else {
    enemies = []; items = []; bolts = []; lv.crumbles = {};
    patches = (lv.patchesInit || []).map(q => ({ kind: q.kind, x: q.a * TS, y: q.row * TS, w: (q.b - q.a + 1) * TS, t: Infinity }));
    plats = lv.plats.map(d => ({ kind: d.kind, x: d.tx * TS, y: d.ty * TS, w: d.w * TS, h: 8, x0: d.tx * TS, y0: d.ty * TS, axis: d.axis, range: (d.range || 0) * TS, speed: d.speed || 0, t: d.phase || 0, dx: 0, dy: 0, fallT: 0, vy: 0, stood: false, look: d.look, len: d.len, amp: d.amp, gz: d.gz, pz: d.pz, cz: d.cz })).concat(pitPlats(), dinerPlats());
  }
  magCoins = []; rockets = []; parts = []; coinpops = []; ftoasts = []; shots = []; booms = []; rings = []; turrets = [];
  if (!lv.cageBro){ lv.cageBro = {}; lv.dmg = {}; const locked = BRO_IDS.filter(id => !save.unlocked.includes(id)); let li = 0;
    for (let ty = 0; ty < lv.h; ty++) for (let tx = 0; tx < lv.w; tx++) if (lv.t[ty][tx] === 'C') lv.cageBro[tx + ',' + ty] = locked[li++] || BRO_IDS[(tx * 7 + ty) % BRO_IDS.length]; }
  POLE = lv.pole ? { x: lv.pole.tx * TS + 8, top: 48, base: surfaceRow(lv.pole.tx) * TS } : null;
  BOOTH = lv.booth ? { x: lv.booth.tx * TS, door: lv.booth.door * TS + 2, ground: surfaceRow(lv.booth.door) * TS } : null;
  const mus = lv.music || LV.music;
  if (G.state === 'play' && P && A.current() !== mus && !P.star) A.startMusic(mus);
}
function startLevel(){
  LV = LEVELS[G.levelId]; AREAS = LV.build(); lv = null; P = null;
  G.state = 'play'; G.stateT = 0; G.paused = false; G.lf = 0;
  enterArea(LV.start.area);
  let stx = (G.checkpoint && LV.checkpoint) ? LV.checkpoint - 2 : LV.start.tx;
  if (G.checkpoint && LV.checkpoint){ let k = stx; while (k > 1 && surfaceRow(k) >= 15) k--; if (surfaceRow(k) < 15) stx = k; } // v0.8.1: never respawn over a pit (1-3's checkpoint sat above falling platforms)
  const sy = surfaceRow(stx) * TS;
  grand = rng(7 + LEVEL_ORDER.indexOf(G.levelId) * 101 + G.deaths * 13 + G.rescued * 3);
  P = newPlayer(stx * TS + 2, sy - 15);
  if (G.carrySize > 0) P.size = 1; // Toast Armor = one extra hit (no growing in v0.4)
  camX = lv.camLock ? 0 : Math.max(0, Math.min(P.x - 40, lv.w * TS - W));
  for (const s of lv.spawns) if (s.x * TS < camX + 8 || (s.x >= stx && s.x <= stx + 6)) s.done = true;
  G.time = LV.time; G.timeT = 0; G.hurry = false; G.polePhase = 0; G.poleT = 0; G.pennant = 52; G.tvOn = false; G.endT = 0; G.onAir = false;
  G.dialog = null; G.dialogDone = false; G.camLockX = null; G.unplugged = false; G.collapse = null; G.castleEnd = false; G.shake = 0;
  G.hitStop = 0; G.escape = null; G.escaped = false; G.bigText = null; G.broFlash = null; G.curseT = 0;
  G.flipped = false; G.flipWarn = false; G.freezeT = 0; G.itsYou = false; G.fuseBlown = false; G.rerunCancelled = false;
  G.foilMet = false; G.foilCut = false; G.hiveDown = false; G.nameCard = null; G.curtain = null; G.springs = 0; G.tideY = null; G.tidePh = null; G.shrieks = 0; G.hiveSlams = 0; G.mittBlocks = 0; bumFx = [];
  G.portals = 0; G.portalSaid = false; G.geyserRides = 0; G.rgbHits = 0; G.sauces = 0; G.quartzDown = false; G.quartzSlams = 0; G.quartzHaz = 0; cryFx = []; // v0.8 World 6
  G.figs = 0; G.tix = 0; G.showers = 0; G.tokens7 = 0; G.shoves = 0; G.pushRides = 0; G.clawRides = 0; G.clawGrabs = 0; G.crtHops = 0; G.streaks = 0; G.vaultDown = false; G.vaultHits = 0; G.vaultWaves = 0; G.vaultHaz = 0; arcFx = []; arcToks = []; // v0.9 World 7
  BOSS = lv.boss ? makeBoss(lv.boss) : null;
  reach(G.levelId);
  A.startMusic(lv.music || LV.music);
}
function levelComplete(){
  G.carrySize = P.size; G.curBro = P.bro; bumpHi();
  const i = LEVEL_ORDER.indexOf(G.levelId), next = LEVEL_ORDER[i + 1];
  G.checkpoint = false;
  if (next && LEVELS[next].world === LV.world){ G.clearedId = G.levelId; G.levelId = next; reach(next); G.state = 'clear'; G.stateT = 0; }
  else {
    // last level of a world: World Clear card, then on to the next built world (score, lives and size carry over)
    if (!save.worldsCleared.includes(LV.world)) save.worldsCleared.push(LV.world);
    G.clearedWorld = LV.world; G.clearedId = G.levelId; G.nextWorldLevel = next || null;
    if (next){ G.levelId = next; reach(next); }
    writeSave(); G.state = 'worldclear'; G.stateT = 0; A.stopMusic(); A.sfx('worldclear');
  }
}

// ---------------- tiles / collision ----------------
function tileAt(tx, ty){ if (!lv || ty < 0 || ty >= lv.h || tx < 0 || tx >= lv.w) return '.'; return lv.t[ty][tx]; }
function isSolid(tx, ty){ if (tx < 0 || tx >= lv.w) return true; if (ty < 0 || ty >= lv.h) return false; const c = lv.t[ty][tx]; if (c === 'm') return !(lv.rgbT > 0); if (c === 'c') return lv.rgbT > 0; if (c === 'n') return crtOn(0); if (c === 'N') return crtOn(1); return SOLID_TILES.has(c); } // v0.8: RGB switch blocks
// '=' planks are one-way: you can stand on them, but walk / jump through them from the side or below
function standable(tx, ty){ return isSolid(tx, ty) || tileAt(tx, ty) === '='; }
const EPS = 0.01;
function collideX(e){
  const y0 = Math.floor(e.y / TS), y1 = Math.floor((e.y + e.h - EPS) / TS);
  if (e.vx > 0){
    const tx = Math.floor((e.x + e.w - EPS) / TS);
    for (let ty = y0; ty <= y1; ty++) if (isSolid(tx, ty)){ e.x = tx * TS - e.w; return 1; }
  } else if (e.vx < 0){
    const tx = Math.floor(e.x / TS);
    for (let ty = y0; ty <= y1; ty++) if (isSolid(tx, ty)){ e.x = (tx + 1) * TS; return -1; }
  }
  return 0;
}
function shove(e, dx){ const v = e.vx; e.vx = dx; e.x += dx; const h = collideX(e); e.vx = v; return h; }
function collideY(e){
  e.onGround = false;
  const x0 = Math.floor((e.x + 1) / TS), x1 = Math.floor((e.x + e.w - 1 - EPS) / TS);
  if (e.vy > 0){
    const ty = Math.floor((e.y + e.h - EPS) / TS);
    for (let tx = x0; tx <= x1; tx++) if (isSolid(tx, ty) || (tileAt(tx, ty) === '=' && e.y + e.h - e.vy <= ty * TS + 0.5)){ e.y = ty * TS - e.h; e.vy = 0; e.onGround = true; return 'floor'; }
  } else if (e.vy < 0){
    const ty = Math.floor(e.y / TS);
    for (let tx = x0; tx <= x1; tx++) if (isSolid(tx, ty)){ e.y = (ty + 1) * TS; e.vy = 0; return 'ceil'; }
  }
  return null;
}
function overlap(a, b){ return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function floorTile(e){ return tileAt(Math.floor((e.x + e.w / 2) / TS), Math.floor((e.y + e.h + 1) / TS)); }

// ---------------- scoring / fx ----------------
// v0.5 popups: identical labels close together merge into "xN", others stack upward instead of overlapping, and the list is capped
function popup(x, y, text, color){
  text = String(text);
  for (const q of pops){ if (!q.long && q.t < 14 && q.base === text && Math.abs(q.x - x) < 48 && Math.abs(q.y0 - y) < 24){ q.n = (q.n || 1) + 1; q.text = text + ' X' + q.n; q.t = Math.min(q.t, 4); return q; } }
  const w = textWidth(text); let yy = y;
  for (let k = 0; k < 6; k++){
    const hit = pops.some(q => !q.long && q.t < 30 && Math.abs((q.y - q.t * 0.6) - yy) < 9 && q.x < x + w + 3 && x < q.x + textWidth(q.text) + 3);
    if (!hit) break; yy -= 9;
  }
  while (pops.length >= 12) pops.shift();
  const q = { x, y: yy, y0: y, text, base: text, t: 0, color: color || '#ffffff' }; pops.push(q); return q;
}
function addScore(n, x, y){ G.score += n; if (x !== undefined) popup(x, y, n); }
function oneUp(x, y){ G.lives++; G.reserve.push(pickBro()); popup(x, y, '1UP', '#00e5ff'); A.sfx('oneup'); }
function addCoin(){ G.coins++; G.score += 200; A.sfx('coin'); if (G.coins >= 100){ G.coins -= 100; oneUp(P.x, P.y - 8); } }
function burst(x, y, n, colors, spd, life){
  for (let i = 0; i < n; i++){
    const a = Math.random() * Math.PI * 2, s = (Math.random() * 0.7 + 0.3) * (spd || 1.6);
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.2, g: 0.15, life: life || (24 + Math.random() * 16), color: colors[i % colors.length], size: Math.random() < 0.4 ? 2 : 1 });
  }
}
function smoke(x, y){ parts.push({ x, y, vx: (Math.random() - 0.5) * 0.4, vy: -0.4 - Math.random() * 0.3, g: -0.005, life: 26, color: Math.random() < 0.5 ? '#7d7d86' : '#4a4a52', size: 2 }); }
const STOMP_PTS = [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000];

// ---------------- blocks ----------------
function hitBlock(tx, ty){
  const c = tileAt(tx, ty), key = tx + ',' + ty, content = lv.contents[key];
  const bx = tx * TS, by = ty * TS;
  if (c === 'M'){ // Mimic: fake CRT block that bites
    lv.t[ty][tx] = '.';
    const m = spawnEnemy('mimic', bx + 1, by - 2); m.vy = -3; m.hopT = 30; m.facing = (P.x + P.w / 2 < bx + 8) ? -1 : 1;
    popup(bx - 4, by - 10, 'CHOMP!', '#ff2a3a'); A.sfx('bite');
    burst(bx + 8, by + 8, 6, ['#f0ead8', '#3a3f4a'], 1.4);
    if (overlap(P, m)) hurt();
    return;
  }
  if (c === '?' || c === 'H' || (c === 'B' && content)){
    lv.bumps[key] = 10;
    if ((c === '?' || c === 'H') && !TSET.toon) popup(bx - 10, by - 10, TSET.bumbo ? 'POP!' : 'NO SIGNAL', TSET.bumbo ? '#FFD400' : '#00e5ff');
    if (content === 'multi'){
      if (!lv.multi[key]) lv.multi[key] = { n: 0, t: 260 };
      const m = lv.multi[key]; m.n++;
      spawnCoinPop(bx, by);
      if (m.n >= 10 || m.t <= 0){ lv.t[ty][tx] = 'U'; delete lv.contents[key]; }
    } else {
      lv.t[ty][tx] = 'U'; delete lv.contents[key];
      if (!content || content === 'coin') spawnCoinPop(bx, by);
      else spawnItem(content === 'power' ? (P.size === 0 ? 'armor' : 'ammo') : content === 'star' ? 'glitch' : content === 'lightbar' ? 'lightbar' : content === 'tray' ? 'tray' : content === 'jam' ? 'jam' : content === 'bell' ? 'bell' : content === 'mitt' ? 'mitt' : content === 'sauce' ? 'sauce' : content === 'streak' ? 'streak' : 'card', bx, by);
    }
    A.sfx('bump');
  } else if (c === 'B'){
    if (P.size > 0){
      lv.t[ty][tx] = '.';
      const bc = (Object.assign({}, THEMES.overworld, THEMES[lv.theme] || {})).brick;
      for (let i = 0; i < 4; i++) parts.push({ x: bx + 4 + (i % 2) * 8, y: by + 4 + (i >> 1) * 8, vx: (i % 2 ? 1 : -1) * (1 + Math.random() * 0.4), vy: i < 2 ? -5 : -3.5, g: 0.3, life: 70, color: bc.base, size: 4, edge: bc.mortar || '#1b2a4a' });
      burst(bx + 8, by + 8, 6, [bc.dots ? bc.dots[0] : bc.dark, bc.hi || bc.light], 1.2);
      G.score += 50; A.sfx('brk');
    } else { lv.bumps[key] = 10; A.sfx('bump'); }
  } else { A.sfx('bump'); }
  for (const e of enemies){
    if (e.dead || e.fly) continue;
    if (Math.abs(e.y + e.h - by) < 3 && e.x + e.w > bx && e.x < bx + TS){ killFlip(e); addScore(100, e.x, e.y - 8); }
  }
  for (const it of items){ if (!it.emerge && Math.abs(it.y + it.h - by) < 3 && it.x + it.w > bx && it.x < bx + TS){ it.vy = -3.5; if (it.type !== 'launcher') it.vx = (it.x + it.w / 2 < bx + 8 ? -1 : 1) * Math.abs(it.vx || 1); } }
  if (tileAt(tx, ty - 1) === 'o'){ lv.t[ty - 1][tx] = '.'; spawnCoinPop(bx, by - TS); }
}
function spawnCoinPop(x, y){ coinpops.push({ x: x + 4, y: y - 8, vy: -5.2, t: 0 }); addCoin(); }
function spawnItem(type, x, y){
  const it = { type, x: x + 1, y: y, w: 14, h: 16, vx: 0, vy: 0, emerge: 16, onGround: false };
  if (type === 'glitch') it.vx = 1.1; else if (type !== 'launcher' && type !== 'ammo') it.vx = 1;
  items.push(it); A.sfx('appear'); return it;
}

// ---------------- player ----------------
function hurt(){
  if (P.inv > 0 || P.star > 0 || P.ctrl !== 'normal' || P.dead || P.dash > 0 || P.roll > 0 || P.slam) return;
  if (P.mitt){ P.mitt = false; P.inv = 100; G.mittBlocks = (G.mittBlocks || 0) + 1; A.sfx('mitt'); burst(P.x + 6, P.y + 6, 12, [BUM.E, BUM.E2, BUM.P], 2); popup(P.x - 24, P.y - 12, 'OVEN MITT: BLOCKED!', BUM.E2); return; } // v0.7 World 5 pickup
  if (P.size > 0){ P.size = 0; P.inv = 130; A.sfx('clang'); A.sfx('shrink'); burst(P.x + 6, P.y + 6, 12, ['#d7dbe3', '#ffffff', '#8b909c'], 2); popup(P.x - 10, P.y - 12, 'ARMOR!', '#d7dbe3'); return; }
  P.hp = Math.max(0, (P.hp === undefined ? MAX_HP : P.hp) - 1); P.hpFx = 40; G.hits = (G.hits || 0) + 1;
  if (P.hp <= 0){ die(); return; }
  // v0.8.1: lose a health pip: invulnerability flash + a small knockback hop (a caller's own bounce / shove still wins)
  P.inv = 120; A.sfx('shrink'); burst(P.x + 6, P.y + 6, 10, ['#ff2045', '#ffffff', '#ffb0bc'], 1.8);
  // knockback only from the ground: a mid-air hit keeps your jump arc, so a hit over a pit never shoves you into it
  if (P.onGround){ if (Math.abs(P.vx) <= 2) P.vx = -P.facing * 1.2; P.vy = Math.min(P.vy, -2); P.onGround = false; P.plat = null; }
}
function healFull(){ if (P){ P.hp = MAX_HP; P.hpFx = 40; } }
function grow(to){
  P.size = to > 0 ? 1 : 0; P.armorFx = 40; // v0.4: Toast Armor is an extra hit, the bro keeps its size
}
function die(){
  if (G.state === 'dying') return;
  if (DEBUG) G.deathCause = (new Error().stack || '').split('\n').slice(2, 5).map(l => l.trim().replace(/\(.*game\.js:/, '(').replace(/^at /, '')).join(' < ');
  G.state = 'dying'; G.stateT = 0; P.dead = true; P.hp = 0; P.star = 0; P.vx = 0; P.vy = 0; G.carrySize = 0; G.deaths++;
  A.stopMusic(); A.sfx('die'); bumpHi(); writeSave();
}
function onPatch(p){
  for (const b of patches) if (p.x + p.w > b.x && p.x < b.x + b.w && Math.abs(p.y + p.h - b.y) < 2) return b;
  return null;
}
function updatePlayer(){
  const p = P;
  if (p.inv > 0) p.inv--;
  if (p.star > 0){ p.star--; if (p.star === 0) A.setMode('normal'); }
  if (p.throwT > 0) p.throwT--;
  if (p.boost > 0) p.boost--;
  if (p.dropT > 0) p.dropT--;
  if (p.armorFx > 0) p.armorFx--; if (p.hpFx > 0) p.hpFx--;
  if (p.wjLock > 0) p.wjLock--;
  if (p.ctrl !== 'normal'){ p.prevY = p.y; return updateCtrl(); }
  // ride platforms
  if (p.plat){
    const pl = p.plat;
    if (pl.dead || (pl.kind === 'card' && !platSolid(pl)) || p.x + p.w <= pl.x || p.x >= pl.x + pl.w){ p.plat = null; }
    else { if (pl.dx) shove(p, pl.dx); p.y = pl.y - p.h; p.onGround = true; pl.stood = true; }
  }
  // conveyors
  if (p.onGround){ const ft = floorTile(p); if (ft === '>') shove(p, 0.75); else if (ft === '<') shove(p, -0.75); }
  p.prevY = p.y;
  const patch = p.onGround ? onPatch(p) : null;
  p.slick = !!patch; p.slickKind = patch ? (patch.kind || 'butter') : null;
  const k = patch ? (patch.kind === 'puddle' ? { acc: 0.35, rel: 0.06, skid: 0.25 } : { acc: 0.3, rel: 0.12, skid: 0.3 }) : { acc: 1, rel: 1, skid: 1 };
  if (patch && patch.kind === 'puddle' && Math.abs(p.vx) > 0.8 && G.frame % 4 === 0) parts.push({ x: p.x + 6, y: p.y + p.h - 1, vx: -p.vx * 0.3 + (Math.random() - 0.5), vy: -1.2, g: 0.12, life: 18, color: Math.random() < 0.5 ? '#8ac8ff' : '#e8f8ff', size: 1 });
  // boost pads (World 2): temporary run-speed burst
  if (p.onGround && lv.boosts.length){
    const feetRow = Math.round((p.y + p.h) / TS);
    for (const bp of lv.boosts) if (bp.row === feetRow && p.x + p.w > bp.tx * TS + 2 && p.x < bp.tx * TS + 14){ if (p.boost < 70){ A.sfx('boost'); popup(p.x - 8, p.y - 12, 'BOOST!', '#FFD400'); } p.boost = Math.max(p.boost, 90); p.vx = Math.max(p.vx, 3.2); p.facing = 1; }
  }
  // drop through a one-way plank
  if (p.onGround && pressed('down')){
    const fr = Math.floor((p.y + p.h + 1) / TS), a = tileAt(Math.floor((p.x + 1) / TS), fr), bb = tileAt(Math.floor((p.x + p.w - 1) / TS), fr);
    if ((a === '=' || a === '.') && (bb === '=' || bb === '.') && (a === '=' || bb === '=') && !p.plat){ p.dropT = 14; p.onGround = false; p.y += 2; p.jumpBuf = 0; }
  }
  let dir = (btn.right ? 1 : 0) - (btn.left ? 1 : 0);
  p.crouch = false;
  if (p.wjLock > 0 && dir === p.wallD) dir = 0; // just kicked off a wall: no steering back into it for a moment
  const bst = BROS[p.bro].stats;
  if (p.onGround){
    const run = !!btn.run || p.boost > 0, max = p.boost > 0 ? 3.6 : (run ? PH.runMax : PH.walkMax) * bst.speed;
    p.skid = false;
    if (dir !== 0){
      if (p.vx !== 0 && Math.sign(p.vx) !== dir){
        p.vx += dir * PH.skid * k.skid; p.skid = true;
        if (Math.sign(p.vx) === dir || p.vx === 0) p.facing = dir;
      } else {
        p.facing = dir;
        if (Math.abs(p.vx) < max) p.vx = dir * Math.min(max, Math.abs(p.vx) + (p.boost > 0 ? PH.runAcc * 2 : run ? PH.runAcc : PH.walkAcc) * k.acc);
        else p.vx = dir * Math.max(max, Math.abs(p.vx) - PH.rel * k.rel);
      }
    } else {
      const s = Math.sign(p.vx), a = Math.abs(p.vx) - PH.rel * k.rel;
      p.vx = a > 0 ? s * a : 0;
    }
    p.airMax = p.boost > 0 ? 3.6 : (Math.abs(p.vx) > PH.walkMax + 0.05 || run) ? Math.max(PH.runMax, Math.min(3.6, Math.abs(p.vx))) : PH.walkMax;
    p.gFall = 0.4375;
  } else if (dir !== 0){
    const acc = Math.abs(p.vx) > PH.walkMax ? PH.runAcc : PH.walkAcc;
    p.vx += dir * (Math.sign(p.vx) === -dir ? acc * 1.5 : acc);
    if (Math.abs(p.vx) > p.airMax) p.vx = Math.sign(p.vx) * p.airMax;
  }
  if (pressed('jump')) p.jumpBuf = 5; else if (p.jumpBuf > 0) p.jumpBuf--;
  if (p.onGround && p.jumpBuf > 0 && p.dash <= 0){
    p.jumpBuf = 0;
    const jp = jumpParams(Math.abs(p.vx));
    p.vy = jp[0] * bst.jump; p.gHold = jp[1]; p.gFall = jp[2]; p.jumpHeld = true; p.onGround = false; p.plat = null;
    A.sfx('jump', false);
  } else if (!p.onGround && p.jumpBuf > 0 && p.wallG > 0 && p.wallD && p.jet <= 0 && !p.slam){ // wall-jump
    p.jumpBuf = 0; p.vy = -4.4 * bst.jump; p.gHold = 0.117; p.gFall = 0.375; p.vx = -p.wallD * 2.3; p.facing = -p.wallD; p.wjLock = 10; p.jumpHeld = true; p.wallG = 0; p.wall = 0;
    A.sfx('wallkick'); for (let i = 0; i < 5; i++) parts.push({ x: p.wallD > 0 ? p.x + p.w : p.x, y: p.y + 4 + i * 2, vx: -p.wallD * (0.5 + i * 0.2), vy: -0.3, g: 0.02, life: 14, color: '#e8e8e8', size: 1 });
  }
  if (!btn.jump && !p.springUp) p.jumpHeld = false;
  if (p.springUp && (p.vy >= 0 || p.onGround)) p.springUp = false; // a Pop-Up Spring always gives the full bounce
  if (p.jet > 0){ if (btn.jump) p.vy = Math.max(p.vy - 0.42, -2.2); else p.vy = Math.min(p.vy + 0.14, 0.9); }
  else p.vy += (p.vy < 0 && p.jumpHeld) ? p.gHold : p.gFall;
  if (p.vy > PH.maxFall) p.vy = PH.maxFall;
  if (p.wall && p.vy > 1.1){ p.vy = 1.1; if (G.frame % 4 === 0) parts.push({ x: p.wall > 0 ? p.x + p.w : p.x, y: p.y + p.h - 3, vx: -p.wall * 0.4, vy: -0.2, g: 0, life: 12, color: '#cfcfcf', size: 1 }); } // wall-slide
  broActions(p);
  if (p.dash > 0){ p.vx = p.facing * 4.4; }
  if (p.roll > 0){ p.vx = p.facing * 4.0; }
  if (p.slam === 1 && p.vy >= -0.5) p.slam = 2;
  if (p.slam === 2){ p.vy = 7; p.vx *= 0.85; }
  p.x += p.vx;
  if (collideX(p)) p.vx = 0;
  if (!lv.camLock && p.x < camX){ p.x = camX; if (p.vx < 0) p.vx = 0; }
  p.y += p.vy;
  playerCollideY(p);
  broPost(p, dir);
  if (p.onGround && TSET.bumbo) bumboSpring(p); // v0.7 Pop-Up Springs
  if (TSET.crypt) cryptPlayer(p); // v0.8 Glitch Doors, the RGB switch, Hot Sauce
  if (TSET.arcade) arcadePlayer(p); // v0.9 pusher shoves, CRT power, Hot Streak
  if (p.onGround) p.combo = 0;
  if (p.onGround && !p.plat){ const fr = Math.floor((p.y + p.h + 1) / TS); for (const tx of [Math.floor((p.x + 1) / TS), Math.floor((p.x + p.w - 1) / TS)]) if (tileAt(tx, fr) === 'K') startCrumble(tx, fr); }
  if (p.boost > 0 && G.frame % 2 === 0) parts.push({ x: p.x + (p.facing > 0 ? 0 : p.w), y: p.y + 4 + Math.random() * (p.h - 6), vx: -p.facing * 1.5, vy: 0, g: 0, life: 10, color: (G.frame >> 2) % 2 ? '#FFD400' : '#ffffff', size: 1 });
  p.anim += Math.abs(p.vx) * 0.16;
  const tx0 = Math.floor(p.x / TS), tx1 = Math.floor((p.x + p.w - EPS) / TS), ty0 = Math.floor(p.y / TS), ty1 = Math.floor((p.y + p.h - EPS) / TS);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++){
    const c = tileAt(tx, ty);
    if ((c === 'g' || c === 'k') && arcTilePickup(c, tx, ty)) continue;
    if (c === 'o'){ lv.t[ty][tx] = '.'; addCoin(); burst(tx * TS + 8, ty * TS + 8, 4, ['#FFD400', '#ffffff'], 1); }
    else if (c === 'A' && p.y + p.h > ty * TS + 9){ if (P.inv <= 0 && P.star <= 0){ hurt(); if (G.state === 'play'){ p.vy = -3.5; burst(p.x + 6, p.y + p.h, 6, ['#39ff6a', '#b4ffc8'], 1.2); } } }
  }
  // pipes
  if (btn.down && p.onGround){
    for (const pp of lv.pipes){
      if (!pp.enter || pp.dir !== 'up') continue;
      const top = pp.y * TS;
      if (Math.abs(p.y + p.h - top) < 0.5 && p.x >= pp.x * TS + 1 && p.x + p.w <= pp.x * TS + 31){
        p.ctrl = 'pipeDown'; p.ctrlT = 0; p.vx = 0; p.crouch = false; p.pipe = pp; p.dash = 0; p.roll = 0; p.jet = 0; p.slam = 0; A.sfx('pipe');
      }
    }
  }
  if (btn.right && p.onGround){
    for (const pp of lv.pipes){
      if (pp.dir !== 'left') continue;
      if (p.x + p.w >= pp.x * TS - 0.5 && Math.abs(p.y + p.h - (pp.y + 2) * TS) < 0.5){ p.ctrl = 'pipeSide'; p.ctrlT = 0; p.vx = 0; p.pipe = pp; A.sfx('pipe'); }
    }
  }
  if (p.y > H + 16){ if (lv.waterFloor) A.sfx('splash'); die(); }
}
function startCrumble(tx, ty){ const k = tx + ',' + ty; if (!lv.crumbles[k]) lv.crumbles[k] = { tx, ty, t: 0 }; }
function updateCrumbles(){
  for (const k in lv.crumbles){
    const c = lv.crumbles[k]; c.t++;
    if (c.t === 1) A.sfx('plank');
    if (c.t === 30){ lv.t[c.ty][c.tx] = '.'; A.sfx('crumble'); for (let i = 0; i < 3; i++) parts.push({ x: c.tx * TS + 2 + i * 5, y: c.ty * TS + 2, vx: (Math.random() - 0.5) * 0.6, vy: 0.5, g: 0.2, life: 60, color: '#f0a860', size: 4, edge: '#1b2a4a' }); }
    if (c.t > 400){
      const box = { x: c.tx * TS, y: c.ty * TS - 2, w: TS, h: TS };
      if (!overlap(P, box) && !enemies.some(e => !e.dead && overlap(e, box))){ lv.t[c.ty][c.tx] = 'K'; delete lv.crumbles[k]; }
    }
  }
}
function playerCollideY(p){
  p.onGround = false;
  const lx = Math.floor((p.x + 1) / TS), rx = Math.floor((p.x + p.w - 1 - EPS) / TS);
  if (p.vy > 0){
    const ty = Math.floor((p.y + p.h - EPS) / TS);
    const oneWay = tx => p.dropT <= 0 && tileAt(tx, ty) === '=' && p.prevY + p.h <= ty * TS + 0.5;
    if (isSolid(lx, ty) || isSolid(rx, ty) || oneWay(lx) || oneWay(rx)){ p.y = ty * TS - p.h; p.vy = 0; p.onGround = true; p.plat = null; return; }
    for (const pl of plats){
      if (pl.dead || (pl.kind === 'card' && !platSolid(pl)) || (pl.axis === 'geyser' && pl.y > H - 10)) continue; // v0.8: a sunk geyser is just jam
      if (p.x + p.w > pl.x + 1 && p.x < pl.x + pl.w - 1 && p.prevY + p.h <= pl.y + 1.5 + (pl.dy < 0 ? -pl.dy : 0) && p.y + p.h >= pl.y){
        if (pl.kind === 'bosstop' && bossTopLand()) return;
        if (pl.kind === 'reel' && reelLand(pl)) return;
        p.y = pl.y - p.h; p.vy = 0; p.onGround = true; p.plat = pl; pl.stood = true; return;
      }
    }
  } else if (p.vy < 0){
    p.plat = null;
    const ty = Math.floor(p.y / TS);
    const crossed = p.prevY >= (ty + 1) * TS - 0.001;
    const hs = tx => isSolid(tx, ty) || (crossed && tileAt(tx, ty) === 'H');
    const cx = Math.floor((p.x + p.w / 2) / TS);
    const sL = hs(lx), sR = hs(rx), sC = hs(cx);
    if (sL || sR){
      if (!sC){
        if (sL && !sR){ const ov = (lx + 1) * TS - p.x; if (ov <= 5 && !isSolid(rx + 1, ty)){ p.x = (lx + 1) * TS; return; } }
        if (sR && !sL){ const ov = p.x + p.w - rx * TS; if (ov <= 5){ p.x = rx * TS - p.w; return; } }
      }
      const hitX = sC ? cx : (sL ? lx : rx);
      p.y = (ty + 1) * TS; p.vy = 1; p.jumpHeld = false;
      hitBlock(hitX, ty);
    }
  }
}
function updateCtrl(){
  const p = P;
  switch (p.ctrl){
    case 'claw': arcadeClawCarry(); break; // v0.9 a Claw Drop carries you back
    case 'pipeDown':
      p.y += 1; p.ctrlT++;
      if (p.ctrlT >= p.h + 4){
        const pp = p.pipe;
        if (pp.warp){ G.warpTo = pp.warp; G.carrySize = p.size; G.warpTarget = WORLDS[pp.warp].built ? WORLDS[pp.warp].levels[0] : latestWorldStart(); G.state = 'warpcard'; G.stateT = 0; A.stopMusic(); A.sfx('warp'); }
        else pipeTravel(pp.to);
      }
      break;
    case 'pipeSide':
      p.x += 1; p.ctrlT++; p.anim += 0.12;
      if (p.ctrlT >= 22) pipeTravel(p.pipe.to);
      break;
    case 'pipeUp':
      p.y -= 1;
      if (p.y + p.h <= p.pipeTop){ p.y = p.pipeTop - p.h; p.ctrl = 'normal'; p.onGround = true; }
      break;
    case 'pole': updatePole(); break;
    case 'walkoff':
      p.vx = 1.25; p.facing = 1; p.vy = Math.min(p.vy + 0.4375, PH.maxFall);
      p.x += p.vx; collideX(p); p.y += p.vy; collideY(p); p.anim += 0.2;
      if (BOOTH && p.x >= BOOTH.door){ p.ctrl = 'gone'; G.onAir = true; }
      break;
    case 'gone': case 'wait':
      if (p.ctrl === 'wait' && !G.castleEnd) break;
      if (G.time > 0){ const d = Math.min(G.time, 2); G.time -= d; G.score += 50 * d; if (G.frame % 3 === 0) A.sfx('tick'); }
      else if (++G.endT > 70){
        if (p.ctrl === 'wait'){ levelComplete(); }
        else { G.state = 'transition'; G.stateT = 0; A.sfx('statics', 2.6); }
      }
      break;
  }
}
function latestWorldStart(){ let id = '1-1'; for (let w = 1; w <= 10; w++) if (WORLDS[w].built) id = WORLDS[w].levels[0]; return id; }
function pipeTravel(to){
  G.fade = 14;
  enterArea(to.area);
  P.vx = 0; P.vy = 0; P.plat = null; P.facing = 1;
  if (to.mode === 'drop'){
    P.ctrl = 'normal'; P.x = to.tx * TS + 2; P.y = 3 * TS; P.onGround = false;
  } else {
    P.x = to.tx * TS + 16 - P.w / 2; P.pipeTop = to.ty * TS; P.y = P.pipeTop + 2; P.ctrl = 'pipeUp'; A.sfx('pipe');
  }
  camX = lv.camLock ? 0 : Math.max(0, Math.min(P.x - 96, lv.w * TS - W));
  for (const s of lv.spawns) if (s.x * TS < camX + 32 && !s.done && s.x * TS < P.x - 40) s.done = true;
}

// ---------------- channel pole ----------------
function checkPole(){
  if (!POLE || P.ctrl !== 'normal') return;
  if (P.x + P.w >= POLE.x - 3){
    P.ctrl = 'pole'; P.vx = 0; P.vy = 0; P.star = 0; P.crouch = false; P.plat = null;
    P.x = POLE.x - P.w + 2;
    if (P.y + P.h > POLE.base) P.y = POLE.base - P.h;
    const rel = P.y - POLE.top, span = POLE.base - POLE.top;
    const pts = rel < span * 0.06 ? 5000 : rel < span * 0.27 ? 2000 : rel < span * 0.48 ? 800 : rel < span * 0.69 ? 400 : 100;
    G.poleScore = pts; G.score += pts;
    pops.push({ x: POLE.x + 14, y: Math.max(52, P.y), text: String(pts), t: 0, color: pts >= 5000 ? '#FFD400' : '#ffffff', long: true });
    if (pts >= 5000) popup(POLE.x - 40, 56, 'TOP SIGNAL!', '#FFD400');
    G.polePhase = 0; G.poleT = 0; G.tvOn = true;
    A.stopMusic(); A.sfx('pole');
  }
}
function updatePole(){
  const p = P; G.poleT++;
  if (G.polePhase === 0){
    let done = true;
    if (p.y + p.h < POLE.base){ p.y = Math.min(p.y + 2, POLE.base - p.h); done = false; }
    if (G.pennant < POLE.base - 10){ G.pennant += 2; done = false; }
    if (done && G.poleT > 30){ G.polePhase = 1; G.poleT = 0; p.x = POLE.x - 1; p.facing = -1; }
  } else if (G.polePhase === 1){
    if (G.poleT > 20){ p.ctrl = 'walkoff'; p.facing = 1; p.vy = 0; A.sfx('clear'); }
  }
}

// ---------------- enemies ----------------
const EDEF = { crumb: { w: 12, h: 11, hp: 1 }, toast: { w: 13, h: 14, hp: 3 }, antenna: { w: 12, h: 15, hp: 2 }, bomber: { w: 12, h: 13, fly: true, hp: 1 }, mimic: { w: 14, h: 12, hp: 2 },
  truck: { w: 30, h: 20, hp: 5 }, skel: { w: 12, h: 17, hp: 2 }, rlaunch: { w: 16, h: 16, hp: 3 }, rifle: { w: 12, h: 15, hp: 3 }, gunner: { w: 30, h: 24, hp: 6 },
  jamskull: { w: 12, h: 11, hp: 2 }, butterskull: { w: 12, h: 11, hp: 2 }, rubber: { w: 12, h: 11, hp: 2 }, smoke: { w: 16, h: 10, hp: 2, fly: true }, goon: { w: 12, h: 15, hp: 3 } };
const PIT_TYPES = new Set(['jamskull', 'butterskull', 'rubber', 'smoke', 'goon']);
const TRUCK_COLORS = ['red', 'green', 'blue'];
function spawnEnemy(type, x, y){
  const d = EDEF[type];
  const e = { type, x, y, w: d.w, h: d.h, vx: 0, vy: 0, facing: -1, dead: false, anim: 0, onGround: false, fly: !!d.fly, state: 'walk', cool: 40, t: 0, hp: d.hp || 1, hitT: 0, kb: 0 };
  enemies.push(e); return e;
}
function spawnEnemies(){
  for (const s of lv.spawns){
    if (s.done) continue;
    if (lv.camLock || s.x * TS < camX + W + 16){
      s.done = true;
      const d = EDEF[s.type];
      const e = spawnEnemy(s.type, s.x * TS + 2, (s.y + 1) * TS - d.h);
      if (e.fly){ e.homeX = e.x; e.homeY = e.y; e.state = 'patrol'; }
      if (s.type === 'antenna') e.cool = 60;
      if (s.type === 'rifle') e.cool = 50;
      if (s.type === 'gunner'){ e.color = TRUCK_COLORS[(s.x + 1) % 3]; e.state = 'idle'; e.cool = 50; }
      if (s.type === 'truck'){ e.color = TRUCK_COLORS[s.x % 3]; e.state = 'idle'; e.cool = 30; }
      if (s.type === 'rlaunch'){ e.cool = 70; e.aim = Math.PI; }
      if (s.type === 'smoke'){ e.y = s.y * TS; e.state = 'idle'; e.cool = 30 + (s.x % 3) * 20; }
      if (s.type === 'goon') e.cool = 50;
      if (s.type === 'jamskull') e.hopT = 20 + (s.x % 4) * 8;
      if (DINER_TYPES.has(s.type)) dinerInit(e, s); // v0.6 World 4
      if (BUMBO_TYPES.has(s.type)) bumboInit(e, s); // v0.7 World 5
      if (CRYPT_TYPES.has(s.type)) cryptInit(e, s); // v0.8 World 6
      if (ARCADE_TYPES.has(s.type)) arcadeInit(e, s); // v0.9 World 7
    }
  }
}
function killFlip(e){ e.dead = 'flip'; e.vy = -3.2; e.vx = (e.x + e.w / 2 < P.x + P.w / 2 ? -0.6 : 0.6); A.sfx('kick'); }
function stomp(e){
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (pitStomp(e)){ A.sfx('stomp'); return; }
  if (dinerStomp(e)){ A.sfx('stomp'); return; }
  if (bumboStomp(e)){ A.sfx('stomp'); return; }
  if (cryptStomp(e)){ A.sfx('stomp'); return; }
  if (arcadeStomp(e)){ A.sfx('stomp'); return; }
  if (e.type === 'crumb'){ e.dead = 'squash'; e.t = 30; burst(cx, cy, 10, ['#d89a4a', '#b0702a', '#f4c860', '#5a2e0c'], 1.8); }
  else if (e.type === 'toast'){ e.dead = 'squash'; e.t = 26; burst(cx, cy, 10, ['#2a1a10', '#4a2c18', '#7d7d86', '#000000'], 1.8); for (let i = 0; i < 4; i++) smoke(cx, e.y); }
  else if (e.type === 'bomber'){ e.remove = true; burst(cx, cy, 12, ['#ffe680', '#c8ccd8', '#fff2a0'], 1.8); }
  else if (e.type === 'rifle'){ e.remove = true; burst(cx, cy, 12, ['#e6d5b8', '#a9b3c1', '#ff2a3a'], 1.8); const it = spawnItem('ammo', e.x, e.y); it.emerge = 0; it.vy = -3; }
  else if (e.type === 'gunner'){ e.dead = 'squash'; e.t = 50; G.shake = 6; burst(cx, e.y + 4, 12, ['#b8c6d8', '#FFD400', '#ffffff', '#1b2a4a'], 2); popup(e.x, e.y - 14, 'TOWED!', '#FFD400'); A.sfx('honk'); const it = spawnItem('ammo', e.x + 8, e.y); it.emerge = 0; it.vy = -3; }
  else if (e.type === 'antenna'){ e.remove = true; burst(cx, cy, 12, ['#e6d5b8', '#a9b3c1', '#00e5ff'], 1.8); }
  else if (e.type === 'truck'){ e.dead = 'squash'; e.t = 50; G.shake = 6; burst(cx, e.y + 4, 12, ['#b8c6d8', '#FFD400', '#ffffff', '#1b2a4a'], 2); popup(e.x, e.y - 14, 'TOWED!', '#FFD400'); A.sfx('honk'); }
  else if (e.type === 'skel'){ e.state = 'bones'; e.t = 260; const b = e.y + e.h; e.h = 8; e.y = b - 8; e.vx = 0; burst(cx, cy, 8, ['#f4f1e8', '#dcd6c8', '#FFD400'], 1.6); A.sfx('bone'); return; }
  else { e.remove = true; burst(cx, cy, 12, ['#3a3f4a', '#f0ead8', '#ff2a3a'], 1.8); }
  A.sfx('stomp');
}
function fireBolt(x, y, ang, spd){ bolts.push({ x: x - 3, y: y - 3, w: 6, h: 6, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, t: 0 }); }
function updateEnemy(e){
  if (e.dead === 'squash'){ if (--e.t <= 0) e.remove = true; return; }
  if (e.dead === 'flip'){ e.vy += 0.25; e.x += e.vx; e.y += e.vy; if (e.y > H + 32) e.remove = true; return; }
  const dx = (P.x + P.w / 2) - (e.x + e.w / 2), dy = (P.y + P.h) - (e.y + e.h);
  e.anim++;
  if (e.hitT > 0) e.hitT--;
  if (e.kb){ const ox = e.x; e.x += e.kb; if (collideX(e)) e.kb = 0; e.kb *= 0.78; if (Math.abs(e.kb) < 0.15) e.kb = 0; if (e.x === ox) e.kb = 0; }
  if (e.type === 'bomber'){ updateBomber(e, dx, dy); return; }
  if (PIT_TYPES.has(e.type)){ updatePitEnemy(e, dx, dy); return; }
  if (DINER_TYPES.has(e.type)){ updateDinerEnemy(e, dx, dy); return; }
  if (BUMBO_TYPES.has(e.type)){ updateBumboEnemy(e, dx, dy); return; }
  if (CRYPT_TYPES.has(e.type)){ updateCryptEnemy(e, dx, dy); return; }
  if (ARCADE_TYPES.has(e.type)){ updateArcadeEnemy(e, dx, dy); return; }
  if (e.type === 'toast' && inPit() && e.anim % 3 === 0){ (e.trail = e.trail || []).push({ x: e.x, y: e.y }); if (e.trail.length > 5) e.trail.shift(); }
  if (e.type === 'truck' || e.type === 'skel' || e.type === 'rlaunch' || e.type === 'gunner'){ updateW2Enemy(e, dx, dy); return; }
  if (e.type === 'rifle'){ updateRifle(e, dx, dy); }
  if (e.type === 'toast'){
    switch (e.state){
      case 'walk':
        e.vx = 0.45 * e.facing;
        if (e.cool > 0) e.cool--;
        else if (Math.abs(dx) < 104 && Math.abs(dy) < 24 && e.onGround && !P.dead && P.ctrl === 'normal'){ e.facing = Math.sign(dx) || -1; e.state = 'wind'; e.t = 30; A.sfx('rev'); }
        break;
      case 'wind': e.vx = 0; if (G.frame % 3 === 0) smoke(e.x + 6, e.y + 2); if (--e.t <= 0){ e.state = 'charge'; e.t = 110; } break;
      case 'charge': e.vx = 2.3 * e.facing; if (G.frame % 4 === 0) smoke(e.x + (e.facing > 0 ? 0 : e.w), e.y + 8); if (--e.t <= 0){ e.state = 'walk'; e.cool = 90; } break;
      case 'daze': e.vx = 0; if (--e.t <= 0){ e.state = 'walk'; e.cool = 80; } break;
    }
  } else if (e.type === 'rifle'){ /* handled in updateRifle */
  } else if (e.type === 'antenna'){
    e.vx = 0; e.facing = dx < 0 ? -1 : 1;
    if (e.state === 'aim'){ if (--e.t <= 0){ const ang = Math.atan2((P.y + P.h / 2) - (e.y + 1), dx); fireBolt(e.x + e.w / 2, e.y + 1, ang, 1.1); A.sfx('bolt'); e.state = 'walk'; e.cool = 150; } }
    else if (--e.cool <= 0 && Math.abs(dx) < 190 && e.x > camX - 8 && e.x < camX + W && !P.dead){ e.state = 'aim'; e.t = 26; }
  } else if (e.type === 'mimic'){
    if (e.onGround){ e.vx *= 0.8; if (--e.hopT <= 0){ e.facing = dx < 0 ? -1 : 1; e.vy = -4; e.vx = 1.2 * e.facing; e.hopT = 36; A.sfx('bite'); } }
  } else e.vx = 0.5 * e.facing;
  e.vy = Math.min(e.vy + 0.3, 4);
  if (e.type !== 'mimic' || !e.onGround){
    e.x += e.vx;
    if (collideX(e)){
      e.facing = -e.facing; if (e.type === 'mimic') e.vx = -e.vx;
      if (e.type === 'toast' && e.state === 'charge'){ e.state = 'daze'; e.t = 45; burst(e.x + 6, e.y + 4, 5, ['#FFD400', '#ffffff'], 1.2); A.sfx('bump'); }
    }
  } else { e.x += e.vx; collideX(e); }
  e.y += e.vy; collideY(e);
  if (e.onGround){ const ft = floorTile(e); if (ft === '>') shove(e, 0.75); else if (ft === '<') shove(e, -0.75); }
  if (e.y > H + 16 || (!lv.camLock && (e.x < camX - 64 || e.x > camX + W + 160))) e.remove = true;
}
function updateRifle(e, dx, dy){
  // Antenna Skull rifleman: patrols, then plants, aims (laser sight) and fires a 3-round burst
  const onScreen = e.x > camX - 8 && e.x < camX + W && !P.dead && P.ctrl === 'normal';
  if (e.state === 'walk'){
    e.vx = 0.3 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
    if (e.cool > 0) e.cool--;
    else if (onScreen && Math.abs(dx) < 180 && Math.abs(dy) < 40){ e.state = 'aim'; e.t = 34; e.facing = dx < 0 ? -1 : 1; A.sfx('rifle'); }
  } else if (e.state === 'aim'){ e.vx = 0; e.facing = dx < 0 ? -1 : 1; if (--e.t <= 0){ e.state = 'fire'; e.t = 0; e.n = 0; } }
  else if (e.state === 'fire'){ e.vx = 0; e.t++; if (e.t % 7 === 1 && e.n < 3){ fireBullet(e.x + (e.facing > 0 ? e.w : 0), e.y + 7, e.facing, 2.6); e.n++; A.sfx('shot'); } if (e.t > 26){ e.state = 'walk'; e.cool = 110; } }
}
function aheadSupported(e){ const fx = e.facing > 0 ? e.x + e.w + 2 : e.x - 2; return standable(Math.floor(fx / TS), Math.floor((e.y + e.h + 2) / TS)); }
function updateW2Enemy(e, dx, dy){
  if (e.type === 'truck'){
    switch (e.state){
      case 'idle':
        e.vx = 0.35 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
        if (e.cool > 0) e.cool--;
        else if (Math.abs(dx) < 150 && Math.abs(dy) < 30 && e.onGround && !P.dead && P.ctrl === 'normal' && e.x > camX - 8 && e.x < camX + W){ e.facing = Math.sign(dx) || -1; e.state = 'rev'; e.t = 42; A.sfx('honk'); }
        break;
      case 'rev': e.vx = 0; if (G.frame % 3 === 0) smoke(e.facing > 0 ? e.x - 2 : e.x + e.w + 2, e.y + 12); if (--e.t <= 0){ e.state = 'charge'; e.t = 150; A.sfx('rev'); } break;
      case 'charge': e.vx = 3.0 * e.facing; if (G.frame % 3 === 0) smoke(e.facing > 0 ? e.x - 2 : e.x + e.w + 2, e.y + 14); if (--e.t <= 0){ e.state = 'idle'; e.cool = 120; } break;
      case 'stun': e.vx = 0; if (--e.t <= 0){ e.state = 'idle'; e.cool = 100; e.facing = -e.facing; } break;
    }
  } else if (e.type === 'gunner'){
    const onScreen = e.x > camX - 8 && e.x + e.w < camX + W + 8 && !P.dead && P.ctrl === 'normal';
    if (e.state === 'idle'){
      e.vx = 0.3 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.cool > 0) e.cool--;
      else if (onScreen && Math.abs(dx) < 190 && Math.abs(dy) < 48){ e.state = 'aim'; e.t = 36; e.facing = dx < 0 ? -1 : 1; A.sfx('honk'); }
    } else if (e.state === 'aim'){ e.vx = 0; e.facing = dx < 0 ? -1 : 1; if (--e.t <= 0){ e.state = 'fire'; e.t = 0; e.n = 0; } }
    else if (e.state === 'fire'){ e.vx = 0; e.t++; if (e.t % 8 === 1 && e.n < 4){ fireBullet(e.x + (e.facing > 0 ? e.w : 0), e.y + 5, e.facing, 2.8); e.n++; A.sfx('shot'); smoke(e.x + (e.facing > 0 ? e.w : 0), e.y + 5); } if (e.t > 40){ e.state = 'idle'; e.cool = 120; } }
  } else if (e.type === 'skel'){
    if (e.state === 'bones'){
      e.vx = 0;
      if (--e.t <= 0){ e.state = 'walk'; const b = e.y + e.h; e.h = 17; e.y = b - 17; e.facing = dx < 0 ? -1 : 1; A.sfx('bone'); }
    } else {
      e.vx = 0.45 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.onGround && e.anim % 150 === 75 && Math.abs(dx) < 120) e.vy = -3.2; // goofy hop
    }
  } else { // Toast Rocket launcher (fixed turret)
    e.vx = 0; e.facing = dx < 0 ? -1 : 1;
    e.aim = Math.atan2((P.y + P.h / 2) - (e.y + 4), dx);
    if (--e.cool <= 0 && Math.abs(dx) < 230 && Math.abs(dx) > 44 && e.x > camX - 8 && e.x < camX + W && !P.dead && P.ctrl === 'normal'){
      e.cool = 220; launchHoming(e.x + 8 + Math.cos(e.aim) * 10, e.y + 4 + Math.sin(e.aim) * 10, e.aim, 1.3, false);
    }
  }
  e.vy = Math.min(e.vy + 0.3, 4);
  e.x += e.vx;
  if (collideX(e)){
    if (e.type === 'truck' && e.state === 'charge'){ e.state = 'stun'; e.t = 50; G.shake = 5; burst(e.x + (e.facing > 0 ? e.w : 0), e.y + 8, 8, ['#FFD400', '#ffffff', '#b8c6d8'], 1.6); A.sfx('bump'); }
    else e.facing = -e.facing;
  }
  e.y += e.vy; collideY(e);
  if (e.y > H + 16 || (!lv.camLock && (e.x < camX - 80 || e.x > camX + W + 160))) e.remove = true;
}
function launchHoming(x, y, ang, spd, fromBoss){
  bolts.push({ homing: true, fromBoss, x: x - 5, y: y - 4, w: 10, h: 8, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, spd, t: 0 });
  A.sfx('launch'); for (let i = 0; i < 4; i++) smoke(x, y);
}
function updateBomber(e, dx, dy){
  if (e.state === 'patrol'){
    e.t++;
    const tx = e.homeX + Math.sin(e.t * 0.018) * 44;
    e.vx = Math.max(-0.8, Math.min(0.8, tx - e.x)); e.x += e.vx; e.facing = e.vx < 0 ? -1 : 1;
    e.y = e.homeY + Math.sin(e.t * 0.08) * 3;
    if (Math.abs(dx) < 22 && dy > 20 && !P.dead && P.ctrl === 'normal'){ e.state = 'dive'; e.vy = 0.5; A.sfx('dive'); }
  } else {
    e.vy = Math.min(e.vy + 0.22, 5); e.x += Math.sign(dx) * 0.3;
    e.y += e.vy;
    const c = collideY(e);
    if (c === 'floor'){
      patches.push({ x: e.x + e.w / 2 - 20, y: e.y + e.h, w: 40, t: 540 });
      burst(e.x + 6, e.y + e.h - 2, 14, ['#ffe680', '#fff2a0', '#c8a040'], 2);
      A.sfx('splat'); e.remove = true;
    }
    if (e.y > H + 16) e.remove = true;
  }
  if (!lv.camLock && e.x < camX - 64) e.remove = true;
}
function enemyPairs(){
  for (let i = 0; i < enemies.length; i++) for (let j = i + 1; j < enemies.length; j++){
    const a = enemies[i], b = enemies[j];
    if (a.dead || b.dead || a.fly || b.fly || !overlap(a, b)) continue;
    if (a.type === 'rlaunch' || b.type === 'rlaunch' || a.state === 'bones' || b.state === 'bones') continue;
    const tr = a.type === 'truck' && a.state === 'charge' ? a : b.type === 'truck' && b.state === 'charge' ? b : null;
    if (tr){ const o = tr === a ? b : a; if (o.type !== 'truck'){ killFlip(o); addScore(100, o.x, o.y - 8); continue; } }
    const s = a.x < b.x ? -1 : 1;
    a.facing = s; b.facing = -s;
    for (const e of [a, b]) if (e.type === 'toast' && e.state === 'charge'){ e.state = 'daze'; e.t = 30; }
  }
}
function playerVsEnemies(){
  if (P.ctrl !== 'normal' || P.dead) return;
  for (const e of enemies){
    if (e.dead || e.remove || !overlap(P, e)) continue;
    if (e.type === 'ghost' && e.state === 'gone') continue;
    if (e.type === 'reflect' && e.t < 40) continue; // Reflections fade in before they can touch you
    if (e.type === 'fusebox' && !(P.vy > 0 && P.prevY + P.h <= e.y + 7)){ P.vx = -2.2; P.x = Math.min(P.x, e.x - P.w - 1); P.inv = Math.max(P.inv, 0); sfxOnce('clang'); burst(e.x, P.y + 8, 3, [DIN.Y, '#ffffff'], 1, 8); continue; } // mounted box: it shoves you off, the sparks are what hurt
    if (CRYPT_TYPES.has(e.type) && cryptContact(e)) continue; // v0.8: static passes through you
    if (ARCADE_TYPES.has(e.type) && arcadeContact(e)) continue; // v0.9
    if (BUMBO_TYPES.has(e.type) && bumboContact(e)) continue; // v0.7: the foil puppet shoves, a zapping Cord Snake burns
    if (P.star > 0){ if (DINER_TYPES.has(e.type) && dinerDeath(e, {})) continue; killFlip(e); addScore(200, e.x, e.y - 8); continue; }
    const prevBottom = P.prevY + P.h;
    if (e.type === 'skel' && e.state === 'bones'){
      if (P.vy > 0 && prevBottom <= e.y + 5){ e.t = 260; A.sfx('bone'); P.y = e.y - P.h; P.vy = btn.jump ? -5.0 : -3.4; P.jumpHeld = !!btn.jump; }
      continue;
    }
    if (e.type === 'smoke'){ if (P.vy < 0 && P.y > e.y + 4){ damageEnemy(e, 2, 0); P.vy = 1; } continue; } // ceiling fixture: bonk it from below
    if (e.type === 'rlaunch' && P.vy > 0 && prevBottom <= e.y + 6){ // bounce off the turret cap
      P.y = e.y - P.h; P.vy = btn.jump ? -5.0 : -3.6; P.jumpHeld = !!btn.jump; A.sfx('bump'); continue;
    }
    if ((P.vy > 0 || (e.fly && e.state === 'dive')) && prevBottom <= e.y + 7){
      stomp(e);
      const pts = P.combo < STOMP_PTS.length ? STOMP_PTS[P.combo] : 0;
      if (pts) addScore(pts, e.x, e.y - 8); else oneUp(e.x, e.y - 8);
      P.combo++;
      P.y = e.y - P.h; P.vy = btn.jump ? -5.0 : -3.4; P.jumpHeld = !!btn.jump; P.gHold = 0.125; P.gFall = 0.4375; P.plat = null;
    } else hurt();
  }
  for (const b of bolts){
    if (b.remove || b.reflected || b.mine || !overlap(P, b)) continue;
    if (P.mirror > 0){ // Mirror Shield: send it back
      if (b.homing){ if (b.fromBoss && BOSS && !BOSS.dying && !BOSS.dead){ b.reflected = true; b.t = 0; b.spd = 2.6; } else { b.remove = true; burst(b.x + 5, b.y + 4, 6, ['#cfe6ee', '#ffffff'], 1.4); } }
      else { b.mine = true; b.vx = -b.vx * 1.4 || P.facing * 2.5; b.vy = -b.vy; }
      A.sfx('clang'); G.reflects = (G.reflects || 0) + 1; continue;
    }
    if (b.homing && (P.vy > 0 || P.star > 0) && P.prevY + P.h <= b.y + 5){ // stomp a Toast Rocket: pops it (or sends a boss rocket back)
      P.y = b.y - P.h; P.vy = btn.jump ? -5.0 : -3.6; P.jumpHeld = !!btn.jump;
      if (b.fromBoss && BOSS && !BOSS.dying && !BOSS.dead){ b.reflected = true; b.homing = true; b.t = 0; b.spd = 2.6; const ang = Math.atan2(BOSS.y + 16 - b.y, BOSS.x + BOSS.w / 2 - b.x); b.vx = Math.cos(ang) * 2.6; b.vy = Math.sin(ang) * 2.6; popup(b.x - 20, b.y - 12, 'RETURN TO SENDER!', '#00e5ff'); A.sfx('kick'); }
      else { b.remove = true; addScore(200, b.x, b.y - 8); burst(b.x + 5, b.y + 4, 8, ['#f4c860', '#ff6a00', '#ffffff'], 1.5); A.sfx('kick'); }
      continue;
    }
    b.remove = true; if (P.star <= 0) hurt();
  }
}
function updateBolts(){
  for (const b of bolts){
    if (b.homing){ updateHoming(b); continue; }
    if (!b.mine && (b.kind === 'shock' || b.kind === 'gwave' || b.kind === 'iou')){ updatePitBolt(b); continue; }
    if (!b.mine && CRYPT_BOLTS.has(b.kind)){ updateCryptBolt(b); continue; } // v0.8 toast slices, RGB shots
    if (!b.mine && b.kind === 'glob'){ updateBumboBolt(b); continue; } // v0.7 butter globs
    if (!b.mine && b.kind === 'wrench'){ if (!BOSS || BOSS.kind !== 'repairman') b.remove = true; continue; } // flown by updateRepairman
    b.t++;
    if (b.kind === 'bullet' || b.mine){
      b.x += b.vx; b.y += b.vy;
      if (isSolid(Math.floor((b.x + b.w / 2) / TS), Math.floor((b.y + b.h / 2) / TS))){ b.remove = true; burst(b.x, b.y, 3, ['#ffffff', '#FFD400'], 0.8, 8); continue; }
      if (b.mine){
        for (const e of enemies) if (!e.dead && overlap(b, e)){ damageEnemy(e, 3, Math.sign(b.vx) * 2); b.remove = true; break; }
        if (!b.remove && BOSS && BOSS.active && !BOSS.dying && !BOSS.dead && overlap(b, BOSS)){ bossChip(3); b.remove = true; }
      }
      if (b.t > 200 || (!lv.camLock && (b.x < camX - 32 || b.x > camX + W + 32))) b.remove = true;
      continue;
    }
    b.x += b.vx + Math.sin(b.t * 0.4) * 0.3; b.y += b.vy;
    if (b.t > 420 || b.y > H + 8 || b.y < -16 || (!lv.camLock && (b.x < camX - 32 || b.x > camX + W + 32))) b.remove = true;
    if (b.t % 3 === 0) parts.push({ x: b.x + 3, y: b.y + 3, vx: 0, vy: 0, g: 0, life: 10, color: b.t % 6 ? '#00e5ff' : '#ff00c8', size: 1 });
  }
}
function updateHoming(b){
  b.t++;
  let tx, ty;
  if (b.reflected){ if (!BOSS || BOSS.dead){ b.remove = true; return; } tx = BOSS.x + BOSS.w / 2; ty = BOSS.y + 18; }
  else { tx = P.x + P.w / 2; ty = P.y + P.h / 2; }
  const cur = Math.atan2(b.vy, b.vx), want = Math.atan2(ty - (b.y + 4), tx - (b.x + 5));
  let d = want - cur; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
  const turn = b.reflected ? 0.2 : (b.t < 150 ? 0.03 : 0);
  const a = cur + Math.max(-turn, Math.min(turn, d));
  b.vx = Math.cos(a) * b.spd; b.vy = Math.sin(a) * b.spd; b.ang = a;
  b.x += b.vx; b.y += b.vy;
  if (b.t % 2 === 0) parts.push({ x: b.x + 5 - b.vx * 3, y: b.y + 4 - b.vy * 3, vx: 0, vy: 0, g: -0.01, life: 12, color: b.reflected ? '#00e5ff' : (b.t % 4 ? '#ff6a00' : '#FFD400'), size: 1 });
  const solid = isSolid(Math.floor((b.x + 5) / TS), Math.floor((b.y + 4) / TS));
  if (b.reflected){
    for (const e of enemies) if (!e.dead && overlap(b, e)){ killFlip(e); addScore(200, e.x, e.y - 8); }
    if (BOSS && BOSS.kind === 'toaster' && !BOSS.dying && overlap(b, BOSS)){ b.remove = true; toasterDamage('reflect'); burst(b.x, b.y, 10, ['#00e5ff', '#ffffff'], 2); return; }
  }
  if (solid || b.t > 330 || b.y > H + 8 || b.y < -24 || (!lv.camLock && (b.x < camX - 40 || b.x > camX + W + 40))){ b.remove = true; burst(b.x + 5, b.y + 4, 6, ['#f4c860', '#7d7d86'], 1.2); }
}
function updatePlats(){
  for (const pl of plats){
    if (pl.dead || pl.kind === 'bosstop') continue;
    const ox = pl.x, oy = pl.y;
    if (pl.kind === 'move'){
      pl.t += pl.speed;
      const off = pl.range * (1 - Math.cos(pl.t)) / 2;
      if (pl.axis === 'pusher'){ pl.t -= pl.speed; pl.t++; pl.x = pusherState(pl).x; } // v0.9 pusher shelf
      else if (pl.axis === 'claw'){ pl.t -= pl.speed; pl.t++; const cs = clawState(pl); pl.x = cs.x; pl.y = cs.y; pl.cph = cs.ph; } // v0.9 claw crane tray
      else if (pl.axis === 'geyser'){ pl.t -= pl.speed; pl.t++; const gs = geyserState(pl); pl.y = gs.y; pl.gph = gs.ph; } // v0.8 jam geyser: rises, holds, sinks on a cycle
      else if (pl.axis === 'swing'){ const th = pl.amp * Math.sin(pl.t); pl.th = th; pl.x = pl.x0 + pl.len * Math.sin(th); pl.y = pl.y0 - pl.len * (1 - Math.cos(th)); } // v0.7 puppet-string pendulum
      else if (pl.axis === 'x') pl.x = pl.x0 + off; else pl.y = pl.y0 - off;
    } else if (pl.kind === 'fall'){
      if (pl.stood || pl.fallT > 0) pl.fallT++;
      if (pl.fallT > 0 && pl.fallT < 26) pl.shake = (pl.fallT >> 1) % 2 ? 1 : -1; else pl.shake = 0;
      if (pl.fallT === 1) A.sfx('crumble');
      if (pl.fallT >= 26){ pl.vy = Math.min(pl.vy + 0.18, 4); pl.y += pl.vy; }
      if (pl.y > H + 24) pl.dead = true;
    }
    pl.dx = pl.x - ox; pl.dy = pl.y - oy; pl.stood = false;
  }
}
function updatePatches(){ for (const b of patches) b.t--; patches = patches.filter(b => b.t > 0); }
function firebarOrbs(fb){
  const a = fb.phase + fb.speed * G.lf, cx = fb.tx * TS + 8, cy = fb.ty * TS + 8, out = [];
  for (let i = 0; i < fb.len; i++) out.push([cx + Math.cos(a) * i * 8, cy + Math.sin(a) * i * 8]);
  return out;
}
function beamState(bm, f){ const t = ((f === undefined ? G.lf : f) + bm.phase) % bm.period; const half = bm.period / 2; return t < half ? 'on' : (t > bm.period - 28 ? 'warn' : 'off'); }
function hazards(){
  if (P.ctrl !== 'normal' || P.dead) return;
  for (const fb of lv.firebars){
    for (const [ox, oy] of firebarOrbs(fb)){
      const nx = Math.max(P.x, Math.min(ox, P.x + P.w)), ny = Math.max(P.y, Math.min(oy, P.y + P.h));
      if ((nx - ox) ** 2 + (ny - oy) ** 2 < 9){ hurt(); return; }
    }
  }
  for (const bm of lv.beams){
    if (beamState(bm) !== 'on') continue;
    const x0 = bm.tx * TS + 5, x1 = bm.tx * TS + 11;
    if (P.x < x1 && P.x + P.w > x0 && P.y < (bm.y1 + 1) * TS && P.y + P.h > bm.y0 * TS){ hurt(); return; }
  }
  pitHazards();
  if (inDiner()) dinerHazards();
  if (inBumbo()) bumboHazards();
  if (inCrypt()) cryptHazards();
  if (inArcade()) arcadeHazards();
}

// ---------------- items & rockets ----------------
function updateItem(it){
  if (it.emerge > 0){ it.y -= 0.5; it.emerge -= 0.5; return; }
  if (it.type === 'launcher' || it.type === 'ammo'){ it.vy = Math.min(it.vy + 0.3, 4); it.y += it.vy; collideY(it); }
  else {
    it.vy = Math.min(it.vy + (it.type === 'glitch' ? 0.2 : 0.3), 4);
    it.x += it.vx; if (collideX(it)) it.vx = -it.vx;
    it.y += it.vy; const c = collideY(it);
    if (c === 'floor' && it.type === 'glitch') it.vy = -4.2;
  }
  if (it.y > H + 16 || (!lv.camLock && it.x < camX - 48)) it.remove = true;
  if (P.ctrl === 'normal' && !P.dead && overlap(P, it)){
    it.remove = true;
    const cx = it.x, cy = it.y - 8;
    if (it.type === 'armor'){ if (P.size === 0) grow(1); addScore(1000, cx, cy); A.sfx('power'); }
    else if (it.type === 'launcher' || it.type === 'ammo'){ P.spec = 3; addScore(1000, cx, cy); A.sfx('ammo'); popup(cx - 30, cy - 10, 'SPECIALS FULL', '#FFD400'); }
    else if (it.type === 'glitch'){ P.star = 600; A.setMode('star'); addScore(1000, cx, cy); A.sfx(inArcade() ? 'siren7' : 'power'); popup(cx - 20, cy - 10, inArcade() ? 'JACKPOT STAR' : 'GLITCH FILTER', '#ff00c8'); }
    else if (it.type === 'card'){ oneUp(cx, cy); }
    else if (it.type === 'streak'){ P.streak = STREAK_TIME; G.lastPickup = 'streak'; G.streaks = (G.streaks || 0) + 1; addScore(1000, cx, cy); A.sfx('streak7'); popup(cx - 40, cy - 10, 'HOT STREAK: TOKENS SPIN!', ARC.AM); burst(cx + 6, cy + 8, 10, [ARC.Y, ARC.AM2, ARC.R], 1.6); }
    else if (it.type === 'sauce'){ P.sauce = 600; G.lastPickup = 'sauce'; G.sauces = (G.sauces || 0) + 1; addScore(1000, cx, cy); A.sfx('sauce'); popup(cx - 34, cy - 10, 'HOT SAUCE: FIRE RATE UP', CRY.MG); burst(cx + 6, cy + 8, 10, [CRY.R, CRY.MG, CRY.Y], 1.6); }
    else if (it.type === 'jam'){ if (P.size === 0){ grow(1); popup(cx - 30, cy - 10, 'JAM PACKET: +ARMOR', '#b54e8c'); } else { P.spec = Math.min(3, P.spec + 1); addScore(1000, cx, cy); popup(cx - 30, cy - 10, 'JAM PACKET: +SPECIAL', '#b54e8c'); } A.sfx('jam'); burst(cx + 6, cy + 8, 8, DJAM, 1.4); }
    else if (it.type === 'mitt'){ P.mitt = true; addScore(1000, cx, cy); A.sfx('mitt'); popup(cx - 34, cy - 10, 'OVEN MITT: BLOCKS 1 HIT', BUM.E2); burst(cx + 6, cy + 8, 8, [BUM.E, BUM.E2, BUM.P], 1.4); }
    else if (it.type === 'bell'){ G.freezeT = 180; addScore(1000, cx, cy); A.sfx('ding'); popup(cx - 30, cy - 10, 'DINER BELL: FREEZE!', '#00edff'); }
    else if (it.type === 'tray'){ P.magnet = 540; addScore(1000, cx, cy); A.sfx('magnet'); popup(cx - 30, cy - 10, 'CRUMB TRAY: MAGNET', '#00f0ff'); }
    else if (it.type === 'lightbar'){ P.boost = 300; G.flash = 12; addScore(1000, cx, cy); A.sfx('lightbar'); popup(cx - 30, cy - 10, '850HP LIGHTBAR!', '#FFD400'); }
    G.lastPickup = it.type;
  }
}
function updateRocket(r){
  r.t++;
  r.vy = Math.min(r.vy + 0.35, 4);
  r.x += r.vx;
  if (collideX(r)){ explode(r); return; }
  r.y += r.vy;
  const c = collideY(r);
  if (c === 'floor') r.vy = -2.8;
  if (r.t % 2 === 0) parts.push({ x: r.x + 4 - Math.sign(r.vx) * 4, y: r.y + 4, vx: 0, vy: 0.1, g: 0.02, life: 14, color: Math.random() < 0.5 ? '#f4c860' : '#c8741e', size: 1 });
  for (const e of enemies){ if (!e.dead && !e.remove && overlap(r, e)){ killFlip(e); addScore(e.type === 'toast' ? 200 : 100, e.x, e.y - 8); explode(r); return; } }
  for (const b of bolts){ if (!b.remove && !b.reflected && overlap(r, b)){ b.remove = true; explode(r); return; } }
  for (const f of ftoasts){ if (!f.remove && overlap(r, f)){ f.remove = true; explode(r); return; } }
  if (BOSS && BOSS.active && !BOSS.dying && overlap(r, BOSS)){ explode(r); hitBoss(); return; }
  if ((!lv.camLock && (r.x < camX - 16 || r.x > camX + W + 16)) || r.y > H || r.x < -16 || r.x > lv.w * TS) r.remove = true;
}
function explode(r){
  r.remove = true;
  burst(r.x + 4, r.y + 4, 8, ['#8a3fd1', '#b54e8c', '#5a2390'], 1.5, 22); // grape jam splat
  burst(r.x + 4, r.y + 4, 4, ['#f4c860', '#c8741e'], 1.2, 18);
  A.sfx('splat');
}


// =====================================================================================================
// v0.4 BRO SYSTEM: roster bros, run-and-gun weapons, melee, specials, destructible terrain, explosions,
// rescue cages and the castle escape. All original.
// =====================================================================================================
const TILE_HP = { G: 3, B: 2, X: 4, R: 1, T: 1, F: 1, C: 1, M: 1, W: 1 };
const EXPLOSIVE = { R: { r: 30, label: 'BUTTER BARREL' }, T: { r: 40, label: 'TOASTER TANK' }, F: { r: 34, label: 'GAS CAN' }, W: { r: 36, label: 'MINI FRIDGE' } };
const JAM = ['#8a3fd1', '#b54e8c', '#5a2390', '#c27ae8']; // grape purple, always
function pickBro(not){ const pool = save.unlocked.filter(id => id !== not); const list = pool.length ? pool : save.unlocked; return list[Math.floor(grand() * list.length) % list.length]; }
let sfxThrottle = {};
function sfxOnce(name){ if (sfxThrottle[name] === G.frame) return; sfxThrottle[name] = G.frame; A.sfx(name); }
// ---- terrain ----
function canBreak(tx, ty, c){
  if (TILE_HP[c] === undefined) return false;
  if (tx <= 0 || tx >= lv.w - 1 || ty <= 2 || ty >= 14) return false; // bedrock floor, ceiling band and the level borders never break
  if (lv.pole && tx >= lv.pole.tx - 1) return false;                    // keep the Channel Pole run-out intact
  if (lv.boss && lv.boss.bounds && tx >= lv.boss.bounds[0] - 2 && tx <= lv.boss.bounds[1] + 2) return false; // boss arena stays intact
  return true;
}
function damageTile(tx, ty, power, only){
  const c = tileAt(tx, ty);
  if (c === 'Z'){ rgbHit(tx, ty); return true; } // v0.8 RGB switch
  if (c === '?' || (c === 'B' && lv.contents[tx + ',' + ty]) || c === 'M'){ if (!lv.bumps[tx + ',' + ty]) hitBlock(tx, ty); return true; }
  if (!canBreak(tx, ty, c)) return false;
  if (only && !only.includes(c)) return false;
  if (c === 'C'){ freeCage(tx, ty); return true; }
  const k = tx + ',' + ty, hp = TILE_HP[c];
  lv.dmg[k] = (lv.dmg[k] || 0) + power;
  if (lv.dmg[k] >= hp){ breakTile(tx, ty, c); return true; }
  for (let i = 0; i < 2; i++) parts.push({ x: tx * TS + 4 + grand() * 8, y: ty * TS + 4 + grand() * 8, vx: (grand() - 0.5) * 1.5, vy: -1.5, g: 0.2, life: 20, color: tileColor(c), size: 2 });
  return true;
}
function tileColor(c){
  const th = Object.assign({}, THEMES.overworld, THEMES[lv.theme] || {});
  if (c === 'B') return th.brick ? th.brick.base : '#c8741e';
  if (c === 'X') return '#8b909c';
  if (c === 'R') return '#ffe680';
  if (c === 'T') return '#d7dbe3';
  if (c === 'F') return '#e8402a';
  if (c === 'W') return '#e6e0ee';
  const gr = th.ground || {}; return gr.hi || gr.base || '#a0643a';
}
function breakTile(tx, ty, c){
  lv.t[ty][tx] = '.'; delete lv.dmg[tx + ',' + ty];
  const col = tileColor(c), bx = tx * TS, by = ty * TS;
  for (let i = 0; i < 4; i++) parts.push({ x: bx + 4 + (i % 2) * 8, y: by + 4 + (i >> 1) * 8, vx: (i % 2 ? 1 : -1) * (0.8 + grand() * 0.8), vy: -2.5 - grand() * 2.5, g: 0.3, life: 60, color: col, size: 4, edge: '#10121e' });
  burst(bx + 8, by + 8, 5, [col, '#7d7d86'], 1.2);
  G.score += 50; sfxOnce('brk'); lv.broken = (lv.broken || 0) + 1; G.tilesBroken = (G.tilesBroken || 0) + 1;
  if (EXPLOSIVE[c]){ G.chains = (G.chains || 0) + 1; boom(bx + 8, by + 8, EXPLOSIVE[c].r, { power: 2, dmg: 6, owner: 'env', delay: 6 + Math.floor(grand() * 4), kind: c }); const cp = G.chainPop; // one label per chain: "TANK!" then "CHAIN X2", "CHAIN X3"... (rate-limited, never stacked)
    if (cp && G.frame - cp.f < 45 && Math.abs(cp.x - bx) < 120 && pops.includes(cp.q)){ cp.n++; cp.f = G.frame; cp.q.text = 'CHAIN X' + cp.n; cp.q.base = cp.q.text; cp.q.t = Math.min(cp.q.t, 8); }
    else G.chainPop = { f: G.frame, x: bx, n: 1, q: popup(bx - 10, by - 8, c === 'T' ? 'TANK!' : c === 'F' ? 'GAS!' : c === 'W' ? 'FRIDGE!' : 'BUTTER!', '#ff6a00') }; }
  if (tileAt(tx, ty - 1) === 'o'){ lv.t[ty - 1][tx] = '.'; spawnCoinPop(bx, by - TS); }
}
// ---- explosions: one radius system for tiles, enemies, the player and bosses ----
function boom(x, y, r, o){ o = o || {}; booms.push({ x, y, r, power: o.power || 1, dmg: o.dmg || 3, owner: o.owner || 'p', delay: o.delay || 0, kind: o.kind || null }); }
function processBooms(){
  const due = []; for (const b of booms){ if (b.delay > 0) b.delay--; else due.push(b); }
  if (!due.length) return;
  booms = booms.filter(b => b.delay > 0 || !due.includes(b));
  for (const b of due) detonate(b);
}
function detonate(b){
  G.booms = (G.booms || 0) + 1;
  rings.push({ x: b.x, y: b.y, r: b.r, t: 0 });
  const n = Math.round(b.r / 2);
  burst(b.x, b.y, n, ['#ffffff', '#FFD400', '#ff6a00', '#fff3a0'], 2.6, 26);             // sparks
  burst(b.x, b.y, Math.round(n / 2), ['#c8741e', '#f4c860', '#7a3e10'], 2.0, 34);            // crumbs
  burst(b.x, b.y, 6, JAM, 1.8, 30);                                                         // grape-purple jam
  for (let i = 0; i < 6; i++) smoke(b.x + (grand() - 0.5) * b.r, b.y + (grand() - 0.5) * b.r * 0.6);
  G.shake = Math.max(G.shake, Math.min(18, 6 + Math.round(b.r / 5))); G.hitStop = Math.max(G.hitStop, b.r >= 30 ? 3 : 1);
  sfxOnce(b.r >= 34 ? 'bigboom' : 'boom');
  if (b.owner === 'fx') return; // v0.7: a boss's death-throes pops are just for show
  const r2 = b.r * b.r, tx0 = Math.floor((b.x - b.r) / TS), tx1 = Math.floor((b.x + b.r) / TS), ty0 = Math.floor((b.y - b.r) / TS), ty1 = Math.floor((b.y + b.r) / TS);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++){
    const dx = tx * TS + 8 - b.x, dy = ty * TS + 8 - b.y, d2 = dx * dx + dy * dy;
    if (d2 > r2) continue;
    damageTile(tx, ty, d2 < r2 * 0.3 ? b.power : Math.max(1, b.power - 1));
  }
  for (const e of enemies){
    if (e.dead) continue;
    const dx = e.x + e.w / 2 - b.x, dy = e.y + e.h / 2 - b.y;
    if (dx * dx + dy * dy <= (b.r + 6) * (b.r + 6)) damageEnemy(e, b.dmg, Math.sign(dx || 1) * 3, { boom: true });
  }
  for (const o of bolts){ if (!o.reflected && !o.mine && Math.hypot(o.x - b.x, o.y - b.y) < b.r) o.remove = true; }
  if (P && !P.dead && P.ctrl === 'normal' && b.owner !== 'p'){
    const dx = P.x + P.w / 2 - b.x, dy = P.y + P.h / 2 - b.y;
    if (dx * dx + dy * dy <= r2 * 0.75){ P.vx += Math.sign(dx || 1) * 2; P.vy = Math.min(P.vy, -3); P.onGround = false; P.plat = null; hurt(); }
  }
  if (BOSS && BOSS.active && !BOSS.dying && !BOSS.dead && b.owner !== 'boss'){
    const dx = BOSS.x + BOSS.w / 2 - b.x, dy = BOSS.y + BOSS.h / 2 - b.y;
    if (Math.abs(dx) < b.r + BOSS.w / 2 && Math.abs(dy) < b.r + BOSS.h / 2) bossChip(b.dmg);
  }
}
function bossChip(dmg){
  const b = BOSS; if (!b || !b.active || b.dying || b.dead) return;
  if (b.kind === 'vault' && !(b.open > 0)){ vaultClink(); return; } // v0.9 the Vault only takes hits while its payout button glows
  const need = b.kind === 'glitch' ? 6 : 5;
  if (b.flash > 0){ b.chip = Math.min(need - 0.01, (b.chip || 0) + dmg * 0.25); return; }
  b.chip = (b.chip || 0) + dmg;
  if (b.chip >= need){ b.chip -= need; hitBoss(); }
}
// ---- enemies: hit points, hit flash, knockback ----
function damageEnemy(e, dmg, kb, src){
  if (e.dead || e.remove) return false;
  src = src || {};
  if (e.type === 'skel' && e.state === 'bones' && !src.boom) return false; // bullets can't hurt a bone pile; explosions can
  if (inDiner() && dinerBlock(e, kb, src)) return false; // v0.6 Rye Knight shields
  if (ARCADE_TYPES.has(e.type) && arcadeBlock(e, src)) return false; // v0.9 hidden Ticket Snake / powered-off Static Ghost
  if (CRYPT_TYPES.has(e.type) && cryptBlock(e, src)) return false; // v0.8 a blinking Static Skull is pure static
  e.hp = (e.hp === undefined ? (EDEF[e.type].hp || 1) : e.hp) - dmg; e.hitT = 6;
  const heavy = e.type === 'truck' || e.type === 'gunner';
  if (e.type !== 'rlaunch' && !e.fly) e.kb = (e.kb || 0) + kb * (heavy ? 0.35 : 1);
  if (src.boom && !heavy && e.type !== 'rlaunch') e.vy = Math.min(e.vy, -2.4);
  sfxOnce('hit');
  burst(e.x + e.w / 2, e.y + e.h / 2, 3, ['#ffffff', '#FFD400'], 1.2, 12);
  if (e.hp > 0) return false;
  if (e.type === 'skel' && !src.boom){ stomp(e); e.hp = EDEF.skel.hp; return true; }
  if (DINER_TYPES.has(e.type) && dinerDeath(e, src)) return true;
  if (BUMBO_TYPES.has(e.type) && bumboDeath(e, src)) return true;
  if (CRYPT_TYPES.has(e.type) && cryptDeath(e, src)) return true;
  killFlip(e); G.kills++; if (DINER_TYPES.has(e.type)) dinerKill(e); if (BUMBO_TYPES.has(e.type)) bumboKill(e); if (CRYPT_TYPES.has(e.type)) cryptKill(e); if (ARCADE_TYPES.has(e.type)) arcadeKill(e);
  addScore(e.type === 'gunner' || e.type === 'truck' ? 500 : e.type === 'rifle' || e.type === 'toast' ? 300 : 100, e.x, e.y - 8);
  burst(e.x + e.w / 2, e.y + e.h / 2, 8, JAM, 1.8, 26); burst(e.x + e.w / 2, e.y + e.h / 2, 5, ['#c8741e', '#f4c860'], 1.5, 22);
  if (e.type === 'rifle' || e.type === 'gunner' || e.type === 'goon'){ const it = spawnItem('ammo', e.x, e.y - 4); it.emerge = 0; it.vy = -3; }
  if (src.heal){ if (P.size === 0){ grow(1); popup(P.x - 18, P.y - 14, 'NOM! +ARMOR', '#ff2fb4'); } else { addScore(500, P.x, P.y - 14); } A.sfx('chomp'); }
  return true;
}
function fireBullet(x, y, dir, spd){ bolts.push({ kind: 'bullet', x: x - 2, y: y - 1, w: 5, h: 3, vx: dir * spd, vy: 0, t: 0 }); }
// ---- player actions ----
function broActions(p){
  const B = BROS[p.bro];
  if (p.cool > 0) p.cool--; if (p.mcool > 0) p.mcool--; if (p.scool > 0) p.scool--; if (p.melT > 0) p.melT--;
  if (p.dash > 0){ p.dash--; dashHit(p); }
  if (p.roll > 0){ p.roll--; rollHit(p); }
  if (p.jet > 0){ p.jet--; if (G.frame % 2 === 0) parts.push({ x: p.x + (p.facing > 0 ? 1 : p.w - 3), y: p.y + p.h - 2, vx: (grand() - 0.5) * 0.6, vy: 1.6, g: 0, life: 12, color: (G.frame >> 1) % 2 ? '#ff6a00' : '#FFD400', size: 2 }); }
  if (p.mirror > 0) p.mirror--;
  const fire = AUTO ? !!btn.fire : (btn.run || btn.fire); // the autopilot aims on purpose (it never sprays at a gas can)
  if (fire && p.cool <= 0 && p.dash <= 0 && p.roll <= 0 && !p.slam){ const n0 = shots.length; fireWeapon(p, B.weapon.kind); if (p.sauce > 0) cryptSauce(p, n0); if (p.streak > 0) arcadeStreakShots(p, n0); } // v0.8 Hot Sauce: faster, hotter shots
  if (pressed('melee') && p.mcool <= 0) doMelee(p, B.melee.kind);
  if (pressed('special') && p.scool <= 0) doSpecial(p, B.special.kind);
}
function shot(kind, x, y, vx, vy, o){ const s = Object.assign({ kind, x, y, vx, vy, w: 4, h: 4, t: 0, life: 40, dmg: 1, kb: 1.5, pierce: 0, terrain: 0, only: null, grav: 0, owner: 'p' }, o || {}); shots.push(s); return s; }
function fireWeapon(p, kind){
  const f = p.facing, mx = f > 0 ? p.x + p.w : p.x - 4, my = p.y + 7;
  p.throwT = 8; G.shotsFired = (G.shotsFired || 0) + 1;
  switch (kind){
    case 'rocket': shot('rocket', mx - (f < 0 ? 3 : 0), my - 2, f * 4.2, 0, { w: 7, h: 4, life: 80, dmg: 3, boom: 18 }); p.cool = 20; A.sfx('fire'); smoke(mx, my); break;
    case 'snack': shot('snack', mx, my - 1, f * (2.8 + grand() * 0.8), (grand() - 0.5) * 0.9, { w: 4, h: 4, life: 14 + Math.floor(grand() * 4), dmg: 0.7, kb: 0.8, col: ['#ff8a2a', '#ffd23a', '#ff5ab4', '#8ad85a'][G.frame % 4] }); p.cool = 5; if (G.frame % 2 === 0) A.sfx('spray'); break;
    case 'shotgun': for (let i = -2; i <= 2; i++){ const a = i * 0.11; shot('pellet', mx, my - 1, Math.cos(a) * f * 4.2, Math.sin(a) * 4.2, { w: 3, h: 3, life: 17, dmg: 1, kb: 2.4, terrain: 1, only: ['B', 'C'] }); } p.cool = 30; p.vx -= f * 0.7; A.sfx('shotgun'); burst(mx, my, 4, ['#ffe680', '#ffffff'], 1, 10); break;
    case 'sniper': shot('snipe', mx, my - 1, f * 9, 0, { w: 8, h: 2, life: 32, dmg: 4, kb: 2, pierce: 3, terrain: 1, only: ['B', 'C', 'X'] }); p.cool = 34; A.sfx('snipe'); break;
    case 'iou': for (let i = -1; i <= 1; i++){ const a = i * 0.3; shot('iou', mx, my - 2, Math.cos(a) * f * 2.7, Math.sin(a) * 2.7, { w: 6, h: 4, life: 46, dmg: 1.2, kb: 1 }); } p.cool = 18; A.sfx('paper'); break;
    case 'shriek': shot('wave', f > 0 ? p.x + p.w : p.x - 8, p.y - 3, f * 2.8, 0, { w: 8, h: 21, life: 22, dmg: 2, kb: 2.5, pierce: 99, terrain: 1, only: ['B', 'X', 'C', 'R', 'T', 'F'], hitSet: new Set(), tileSet: new Set() }); p.cool = 26; A.sfx('shriek'); break;
    case 'zap': shot('zap', mx, my - 1, f * 5, 0, { w: 6, h: 3, life: 26, dmg: 1, kb: 1 }); p.cool = 12; A.sfx('zap'); break;
    case 'roll': if (p.onGround){ p.roll = 18; p.cool = 34; A.sfx('roll'); } else p.cool = 4; break;
  }
}
function shotBox(s){ return s; }
function updateShots(){
  for (const s of shots){
    s.t++; s.life--;
    if (s.grav) s.vy += s.grav;
    s.x += s.vx; s.y += s.vy + (s.kind === 'iou' ? Math.sin(s.t * 0.35) * 0.7 : 0);
    if (s.kind === 'wave'){ s.h = Math.min(30, s.h + 0.5); s.y -= 0.25; }
    if (s.kind === 'rocket' && s.t % 2 === 0) parts.push({ x: s.x + (s.vx > 0 ? 0 : s.w), y: s.y + 2, vx: 0, vy: 0.1, g: 0.02, life: 14, color: grand() < 0.5 ? '#f4c860' : '#c8741e', size: 1 });
    if (s.kind === 'bomb'){
      if (s.t % 3 === 0) parts.push({ x: s.x + 4, y: s.y, vx: 0, vy: -0.3, g: 0, life: 10, color: '#ff6a00', size: 1 });
      const c = collideY(s); if (c === 'floor'){ s.vy = s.bounce-- > 0 ? -2.4 : 0; s.vx *= 0.6; }
      if (collideX(s)) s.vx = -s.vx * 0.5;
      if (s.life <= 0 || enemies.some(e => !e.dead && overlap(s, e)) || (BOSS && BOSS.active && !BOSS.dying && overlap(s, BOSS))){ s.remove = true; boom(s.x + 4, s.y + 4, 44, { power: 2, dmg: 7, owner: 'p' }); }
      continue;
    }
    // tiles
    const pts = s.kind === 'wave' ? [[s.x + s.w / 2, s.y + 3], [s.x + s.w / 2, s.y + s.h / 2], [s.x + s.w / 2, s.y + s.h - 3]] : [[s.x + s.w / 2, s.y + s.h / 2]];
    let stop = false;
    for (const pt of pts){
      const qx = pt[0], qy = pt[1], tx = Math.floor(qx / TS), ty = Math.floor(qy / TS);
      if (!isSolid(tx, ty)) continue;
      if (tileAt(tx, ty) === 'Z') rgbHit(tx, ty); // v0.8 shoot the RGB switch
      if (s.kind === 'wave'){ const mid = pt === pts[1]; const k = tx + ',' + ty; if (!s.tileSet.has(k)){ s.tileSet.add(k); const c = tileAt(tx, ty); if (c === 'C' || c === '?' || c === 'M' || (s.only.includes(c) && canBreak(tx, ty, c))){ damageTile(tx, ty, 2); } else if (mid) stop = true; } else if (mid && isSolid(tx, ty) && !s.only.includes(tileAt(tx, ty))) stop = true; continue; }
      const c = tileAt(tx, ty);
      if (s.kind === 'rocket'){ s.remove = true; boom(s.x + 3, s.y + 2, s.boom, { power: 1, dmg: s.dmg, owner: 'p' }); stop = true; break; }
      if (c === 'C') freeCage(tx, ty);
      else if ((c === '?' || c === 'M') && s.kind !== 'snack') damageTile(tx, ty, 1);
      else if (s.terrain && s.only && s.only.includes(c)) damageTile(tx, ty, s.terrain);
      stop = true; break;
    }
    if (stop){ s.remove = true; if (s.kind !== 'wave') burst(s.x, s.y, 2, ['#ffffff', '#c8c8c8'], 0.8, 8); continue; }
    // enemies
    for (const e of enemies){
      if (e.dead || s.remove || !overlap(s, e)) continue;
      if (s.hitSet){ if (s.hitSet.has(e)) continue; s.hitSet.add(e); }
      if (s.kind === 'rocket'){ s.remove = true; boom(s.x + 3, s.y + 2, s.boom, { power: 1, dmg: s.dmg, owner: 'p' }); break; }
      damageEnemy(e, s.dmg, Math.sign(s.vx || 1) * s.kb, s);
      if (s.pierce > 0) s.pierce--; else { s.remove = true; break; }
    }
    if (s.remove) continue;
    // enemy shots and flaming toast
    if (s.kind === 'rocket' || s.kind === 'wave' || s.kind === 'snipe'){
      for (const o of bolts){ if (!o.remove && !o.reflected && !o.mine && overlap(s, o)){ o.remove = true; burst(o.x, o.y, 4, ['#ffffff', '#ff6a00'], 1, 10); if (s.kind === 'rocket'){ s.remove = true; boom(s.x + 3, s.y + 2, s.boom, { power: 1, dmg: s.dmg, owner: 'p' }); break; } } }
      for (const f of ftoasts){ if (!f.remove && overlap(s, f)){ f.remove = true; burst(f.x + 5, f.y + 5, 6, ['#ff6a00', '#FFD400'], 1.2); } }
    }
    if (s.remove) continue;
    // bosses
    if (BOSS && BOSS.active && !BOSS.dying && !BOSS.dead){
      const bb = BOSS.kind === 'toaster' ? { x: BOSS.x + 4, y: BOSS.y + 4, w: BOSS.w - 8, h: BOSS.h - 4 } : BOSS;
      if (overlap(s, bb) && (!s.hitSet || !s.hitSet.has(BOSS))){
        if (s.hitSet) s.hitSet.add(BOSS);
        if (s.kind === 'rocket'){ s.remove = true; boom(s.x + 3, s.y + 2, s.boom, { power: 1, dmg: s.dmg, owner: 'p' }); continue; }
        bossChip(s.dmg); burst(s.x, s.y, 3, ['#ffffff', '#b8c6d8'], 1, 10);
        if (s.kind !== 'wave' && s.kind !== 'snipe') s.remove = true;
      }
    }
    if (s.life <= 0 || s.y > H + 8 || s.y < -24 || (!lv.camLock && (s.x < camX - 24 || s.x > camX + W + 24))) s.remove = true;
  }
  shots = shots.filter(s => !s.remove);
}
function meleeBox(p, w){ return { x: p.facing > 0 ? p.x + p.w - 2 : p.x - w + 2, y: p.y - 3, w, h: p.h + 5 }; }
function doMelee(p, kind){
  p.mcool = 18; p.melT = 10;
  const box = meleeBox(p, kind === 'wrench' ? 16 : 14);
  const dmg = kind === 'wrench' ? 6 : kind === 'bite' ? 4 : 3;
  A.sfx(kind === 'bite' ? 'chomp' : 'melee');
  let hitAny = false;
  for (const e of enemies){ if (!e.dead && overlap(box, e)){ damageEnemy(e, dmg, p.facing * (kind === 'wrench' ? 4 : 3), { heal: kind === 'bite' }); hitAny = true; } }
  for (const o of bolts){ if (!o.reflected && !o.mine && overlap(box, o)){ o.remove = true; hitAny = true; } }
  const tx = Math.floor((p.facing > 0 ? box.x + box.w - 2 : box.x + 2) / TS);
  for (const ty of [Math.floor((p.y + 2) / TS), Math.floor((p.y + p.h - 2) / TS)]){
    const c = tileAt(tx, ty);
    if (c === 'C') freeCage(tx, ty);
    else if (c === 'B' || c === 'X' || (kind === 'wrench' && c === 'G')) damageTile(tx, ty, kind === 'wrench' ? 2 : 1);
  }
  if (BOSS && BOSS.active && !BOSS.dying && overlap(box, BOSS)) bossChip(dmg);
  burst(box.x + box.w / 2, box.y + box.h / 2, hitAny ? 6 : 2, ['#ffffff', '#FFD400'], 1.2, 10);
}
function doSpecial(p, kind){
  if (p.spec <= 0){ popup(p.x - 14, p.y - 12, 'NO SPECIAL', '#8b909c'); A.sfx('bump'); p.scool = 20; return; }
  p.spec--; p.scool = 30; G.specialsUsed = (G.specialsUsed || 0) + 1;
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  popup(p.x - 20, p.y - 16, BROS[p.bro].special.label + '!', BROS[p.bro].color);
  switch (kind){
    case 'crumbburst':
      for (let i = 0; i < 14; i++){ const a = i / 14 * Math.PI * 2; shot('crumb', cx - 2, cy - 2, Math.cos(a) * 3.4, Math.sin(a) * 3.4, { w: 4, h: 4, life: 26, dmg: 2, kb: 2, terrain: 1, only: ['B', 'C'] }); }
      boom(cx, cy, 24, { power: 1, dmg: 3, owner: 'p' }); break;
    case 'slam': if (p.onGround){ p.vy = -5.2; p.onGround = false; p.plat = null; p.slam = 1; } else p.slam = 2; A.sfx('jump'); break;
    case 'ram': p.dash = 34; p.dashHitBoss = false; A.sfx('dash'); A.sfx('honk'); break;
    case 'jetpack': p.jet = 170; A.sfx('boost'); break;
    case 'curse':
      G.curseT = 40; A.sfx('curse');
      for (const e of enemies){ if (!e.dead && e.x + e.w > camX && e.x < camX + W) damageEnemy(e, 12, 0, { boom: true }); }
      for (const o of bolts){ if (!o.reflected && !o.mine) o.remove = true; }
      if (BOSS && BOSS.active) bossChip(8);
      break;
    case 'mirror': p.mirror = 240; A.sfx('lightbar'); break;
    case 'turret': turrets.push({ x: p.x + p.w / 2 - 8 + p.facing * 6, y: p.y + p.h - 10, t: 600, cool: 12, face: p.facing }); A.sfx('turret'); break;
    case 'bonebomb': shot('bomb', cx - 4, p.y, p.facing * 2.6, -3.6, { w: 8, h: 8, life: 70, grav: 0.22, bounce: 1 }); A.sfx('launch'); break;
  }
}
function broPost(p, dir){
  if (p.slam === 2 && p.onGround){
    p.slam = 0; G.shake = 12; A.sfx('slam');
    boom(p.x + p.w / 2, p.y + p.h, 40, { power: 2, dmg: 6, owner: 'p' });
    burst(p.x + 6, p.y + p.h, 14, ['#c8c8c8', '#f4c860', '#ffffff'], 2.2);
  }
  // wall-slide / wall-jump detection (pressing into a wall while airborne)
  p.wall = 0;
  if (!p.onGround && p.jet <= 0 && !p.slam && p.dash <= 0 && dir !== 0){
    const x = dir > 0 ? p.x + p.w + 0.5 : p.x - 0.5, tx = Math.floor(x / TS);
    let hit = false; for (let ty = Math.floor((p.y + 3) / TS); ty <= Math.floor((p.y + p.h - 3) / TS); ty++) if (isSolid(tx, ty) && tx >= 0 && tx < lv.w) hit = true;
    if (hit){ p.wall = dir; p.wallD = dir; p.wallG = 8; if (p.vy > 0) G.wallSlides = (G.wallSlides || 0) + 1;
      // ledge pop: feet just below the lip of the wall -> step up onto it (keeps wall play from feeling sticky)
      let fr = Math.floor((p.y + p.h - 1) / TS); while (fr > 0 && isSolid(tx, fr - 1) && isSolid(tx, fr)) fr--;
      const top = fr * TS;
      if (p.vy >= -0.5 && tileAt(tx, fr) !== 'p' && isSolid(tx, fr) && !isSolid(tx, fr - 1) && !isSolid(tx, fr - 2) && (p.y + p.h) - top <= 18 && (p.y + p.h) - top >= 0){
        p.y = top - p.h; p.vy = 0; p.x = dir > 0 ? tx * TS - p.w + 3 : (tx + 1) * TS - 3; p.wall = 0; p.wallG = 0; G.ledgePops = (G.ledgePops || 0) + 1;
      } }
  }
  if (!p.wall && p.wallG > 0) p.wallG--;
  if (p.onGround){ p.wallG = 0; }
}
function dashHit(p){
  const front = p.facing > 0 ? p.x + p.w + 2 : p.x - 2, tx = Math.floor(front / TS);
  for (let ty = Math.floor(p.y / TS); ty <= Math.floor((p.y + p.h - 1) / TS); ty++){ const c = tileAt(tx, ty); if (c !== '.' && canBreak(tx, ty, c)) damageTile(tx, ty, 9); else if (c === '?' || c === 'C') damageTile(tx, ty, 9); }
  const box = { x: p.x - 4, y: p.y - 2, w: p.w + 8, h: p.h + 2 };
  for (const e of enemies) if (!e.dead && overlap(box, e)) damageEnemy(e, 8, p.facing * 5, { boom: true });
  for (const o of bolts) if (!o.mine && overlap(box, o)) o.remove = true;
  if (!p.dashHitBoss && BOSS && BOSS.active && !BOSS.dying && overlap(box, BOSS)){ p.dashHitBoss = true; bossChip(6); p.dash = Math.min(p.dash, 3); p.vx = -p.facing * 2; }
  if (G.frame % 2 === 0) parts.push({ x: p.facing > 0 ? p.x - 2 : p.x + p.w + 2, y: p.y + 3 + grand() * 10, vx: -p.facing * 2, vy: 0, g: 0, life: 10, color: '#FFD400', size: 2 });
}
function rollHit(p){
  const box = { x: p.x - 2, y: p.y, w: p.w + 4, h: p.h };
  for (const e of enemies) if (!e.dead && overlap(box, e)){ damageEnemy(e, 4, p.facing * 5); p.roll = 0; p.vx = -p.facing * 1.6; p.vy = -2.8; p.onGround = false; p.plat = null; p.inv = Math.max(p.inv, 24); A.sfx('kick'); return; } // bonk: hit once and hop off
  const tx = Math.floor((p.facing > 0 ? p.x + p.w + 1 : p.x - 1) / TS), ty = Math.floor((p.y + p.h / 2) / TS);
  const c = tileAt(tx, ty); if (c === 'C') freeCage(tx, ty); else if (c === 'B') damageTile(tx, ty, 1);
  if (BOSS && (BOSS.kind === 'hive' || BOSS.kind === 'quartz' || BOSS.kind === 'vault') && BOSS.active && !BOSS.dying && overlap(box, BOSS)){ bossChip(5); p.roll = 0; p.vx = -p.facing * 2.2; p.vy = -3.2; p.onGround = false; p.plat = null; p.inv = Math.max(p.inv, 40); A.sfx('kick'); return; } // v0.7: bonk off the Hive
  if (BOSS && BOSS.active && !BOSS.dying && overlap(box, BOSS) && p.roll % 6 === 0) bossChip(2);
}
function updateTurrets(){
  for (const t of turrets){
    t.t--; if (t.cool > 0) t.cool--;
    if (t.cool <= 0){
      let best = null, bd = 1e9;
      for (const e of enemies){ if (e.dead) continue; const dx = e.x + e.w / 2 - (t.x + 8), dy = e.y + e.h / 2 - (t.y + 3); const d = Math.abs(dx) + Math.abs(dy) * 1.5; if (Math.abs(dx) < 170 && Math.abs(dy) < 70 && d < bd){ bd = d; best = { dx, dy }; } }
      if (!best && BOSS && BOSS.active && !BOSS.dying && !BOSS.dead){ const dx = BOSS.x + BOSS.w / 2 - (t.x + 8), dy = BOSS.y + BOSS.h / 2 - (t.y + 3); if (Math.abs(dx) < 200) best = { dx, dy }; }
      if (best){ const a = Math.atan2(best.dy, best.dx); t.face = best.dx < 0 ? -1 : 1; shot('zap', t.x + 8 + Math.cos(a) * 8, t.y + 3, Math.cos(a) * 4.6, Math.sin(a) * 4.6, { w: 5, h: 3, life: 40, dmg: 1, kb: 1, owner: 'turret' }); t.cool = 14; A.sfx('turret'); }
    }
    if (t.t <= 0){ t.remove = true; burst(t.x + 8, t.y + 4, 8, ['#cfe6ee', '#3a3f4a', '#00e5ff'], 1.5); }
  }
  turrets = turrets.filter(t => !t.remove);
}
// ---- rescue cages ----
function freeCage(tx, ty){
  if (tileAt(tx, ty) !== 'C') return;
  lv.t[ty][tx] = '.';
  const key = tx + ',' + ty, bx = tx * TS, by = ty * TS;
  for (let i = 0; i < 6; i++) parts.push({ x: bx + 2 + i * 2, y: by + 2, vx: (i - 2.5) * 0.6, vy: -3 - grand() * 2, g: 0.3, life: 50, color: '#9aa4b4', size: 2, edge: '#10121e' });
  burst(bx + 8, by + 8, 16, ['#FFD400', '#ffffff', '#00e5ff', '#ff00c8'], 2.2);
  const locked = BRO_IDS.filter(id => !save.unlocked.includes(id));
  let isNew = null;
  if (locked.length){ const want = lv.cageBro[key]; isNew = locked.includes(want) ? want : locked[0]; save.unlocked.push(isNew); save.unlocked = BRO_IDS.filter(id => save.unlocked.includes(id)); writeSave(); }
  G.rescued++; G.lives++; G.reserve.push(pickBro()); healFull();
  const to = pickBro(save.unlocked.length > 1 ? P.bro : null);
  swapBro(to);
  G.broFlash = { t: 0, name: BROS[to].name, isNew: isNew ? BROS[isNew].name : null };
  addScore(1000, bx - 8, by - 12); A.sfx('freed');
}
function swapBro(id){
  pops = pops.filter(q => !q.persona || q.persona === id); // a bro's own persona line leaves with that bro
  const p = P; p.bro = id; G.curBro = id; p.spec = 3; p.dash = 0; p.roll = 0; p.jet = 0; p.slam = 0; p.mirror = 0; p.cool = 10;
  p.inv = Math.max(p.inv, 60);
  burst(p.x + 6, p.y + 8, 14, ['#ffffff', BROS[id].color, '#FFD400'], 2);
}
// ---- castle escape ("TOASTED!") ----
function startEscape(){
  if (G.escape) return;
  G.escape = { t: 0, front: Math.max(camX - 16, P.x - 130), speed: 1.3 }; G.bigText = { text: 'TOASTED!', t: 0 };
  G.camLockX = null; lv.escapeOpen = true; P.ctrl = 'normal'; P.vx = 0;
  const wl = lv.escapeWall;
  if (wl){ let d = 0; for (let tx = wl.x0; tx <= wl.x1; tx++) for (let ty = wl.y0; ty <= wl.y1; ty++){ if (lv.t[ty][tx] !== '.'){ lv.t[ty][tx] = '.'; if ((tx + ty) % 2 === 0) boom(tx * TS + 8, ty * TS + 8, 14, { power: 0, dmg: 0, owner: 'p', delay: d++ }); } } }
  A.sfx('alarm'); A.startMusic((WORLDS[LV.world].music || {}).boss || 'w1_boss'); A.setTempo(1.35);
}
function updateEscape(){
  const e = G.escape; if (!e) return;
  e.t++;
  if (e.t > 40) e.front += e.speed;
  if (e.t % 6 === 0){
    const x = e.front - 8 + grand() * 24, y = (4 + grand() * 9) * TS;
    boom(x, y, 22, { power: 9, dmg: 0, owner: 'esc' });
  }
  if (e.t % 40 === 0) A.sfx('alarm');
  if (P && !P.dead && P.ctrl === 'normal' && P.x + P.w < e.front + 10){ P.size = 0; P.mitt = false; die(); } // TOASTED! stays an instant loss
  if (lv.exitTx && P.ctrl === 'normal' && P.x >= lv.exitTx * TS){
    G.escape = null; G.escaped = true; G.castleEnd = true; G.endT = 0; P.ctrl = 'wait'; P.vx = 0; A.stopMusic(); A.setTempo(1); A.sfx('clear');
    for (let i = 0; i < 6; i++) boom(lv.exitTx * TS - 40 - i * 24, (6 + (i % 3) * 2) * TS, 26, { power: 0, dmg: 0, owner: 'p', delay: i * 5 });
  }
}

// ================= v0.5 WORLD 3: TOASTER PIT =================
// hot coil floors, Fork in the Outlet sparks, slot-reel platforms, basement enemies, the Crumb Tray and THE BREADLORD.
const PITC = { M: '#ff00c8', C: '#00f0ff', Y: '#FFD400', R: '#ff0040', O: '#ff5a00', L: '#cbbcd9' };
let magCoins = [];
function inPit(){ return !!(TSET && TSET.pit); }
function cyc(f, phase, per){ const t = ((f === undefined ? G.lf : f) + phase) % per; return t < 0 ? t + per : t; }
function coilState(run, f){ const per = run.period, t = cyc(f, run.phase, per); return t >= per - 70 ? 'on' : t >= per - 104 ? 'warn' : 'off'; }
function coilAt(tx, ty){ if (!lv.coils) return null; for (const c of lv.coils) if (ty === c.row && tx >= c.a && tx <= c.b) return c; return null; }
function forkSpark(fk, f){ // rests in one outlet, then jumps to the other (40 frames), rests, jumps back
  const per = fk.period, jump = 40, t = cyc(f, fk.phase, per * 2);
  const ax = fk.ax * TS + 8, ay = fk.ay * TS + 8, bx = fk.bx * TS + 8, by = fk.by * TS + 8;
  let fx = ax, fy = ay, tx = bx, ty = by, tt = t;
  if (t >= per){ fx = bx; fy = by; tx = ax; ty = ay; tt = t - per; }
  if (tt < per - jump) return { x: fx, y: fy, rest: true, warn: tt > per - jump - 34, tx, ty };
  const k = (tt - (per - jump)) / jump, e = k * k * (3 - 2 * k), arc = fy === ty ? Math.sin(k * Math.PI) * 10 : 0;
  return { x: fx + (tx - fx) * e, y: fy + (ty - fy) * e - arc, rest: false, k, fx, fy, tx, ty };
}
function reelState(r, f){
  const spin = 40, cy = r.show + spin, n = r.faces.length, t = cyc(f, r.phase, cy * n), i = Math.floor(t / cy), tt = t % cy;
  return tt < r.show ? { face: r.faces[i], spin: false, left: r.show - tt, next: r.faces[(i + 1) % n] } : { face: 'safe', spin: true, k: (tt - r.show) / spin, from: r.faces[i], next: r.faces[(i + 1) % n] };
}
function reelLand(pl){ // called from playerCollideY when landing on a reel; true = handled (bounced off)
  const st = reelState(pl.reel); if (st.spin) return false;
  if (st.face === 'bounce'){ P.y = pl.y - P.h; P.vy = btn.jump ? -7.4 : -6.2; P.jumpHeld = !!btn.jump; P.onGround = false; P.plat = null; P.gHold = 0.125; pl.squish = 8; A.sfx('boing'); burst(P.x + 6, pl.y, 5, [PITC.C, '#ffffff'], 1.2); return true; }
  if (st.face === 'spike'){ reelSpike(pl); return true; }
  return false;
}
function reelSpike(pl){ P.y = pl.y - P.h; P.vy = -4.2; P.onGround = false; P.plat = null; if (P.inv <= 0 && P.star <= 0) hurt(); }
function pitPlats(){ return (lv.reels || []).map(r => ({ kind: 'reel', reel: r, x: r.tx * TS, y: r.ty * TS, w: 32, h: 16, x0: r.tx * TS, y0: r.ty * TS, dx: 0, dy: 0, t: 0, fallT: 0, vy: 0, stood: false })); }
function pitHazards(){
  if (P.ctrl !== 'normal' || P.dead) return;
  if (P.onGround && !P.plat && lv.coils && lv.coils.length){
    const fr = Math.floor((P.y + P.h + 1) / TS);
    for (const tx of [Math.floor((P.x + 2) / TS), Math.floor((P.x + P.w - 2) / TS)]){
      const run = tileAt(tx, fr) === 'Q' && coilAt(tx, fr);
      if (run && coilState(run) === 'on'){ burst(P.x + 6, P.y + P.h, 6, [PITC.O, PITC.Y, '#ffffff'], 1.4); A.sfx('sizzle'); hurt(); if (G.state === 'play' && !P.dead){ P.vy = -4; P.onGround = false; } return; }
    }
  }
  for (const fk of lv.forks || []){
    const s = forkSpark(fk); if (s.rest) continue;
    const nx = Math.max(P.x, Math.min(s.x, P.x + P.w)), ny = Math.max(P.y, Math.min(s.y, P.y + P.h));
    if ((nx - s.x) ** 2 + (ny - s.y) ** 2 < 36){ hurt(); return; }
  }
  for (const pl of plats){ if (pl.kind === 'reel' && P.plat === pl){ const st = reelState(pl.reel); if (!st.spin && st.face === 'spike'){ reelSpike(pl); return; } } }
}
function pitUpdate(){
  // fork spark sounds
  for (const fk of lv.forks || []){ const s = forkSpark(fk); if (!s.rest && s.k < 0.03 && Math.abs(s.x - (P.x + 6)) < 200) sfxOnce('spark'); }
  for (const pl of plats) if (pl.kind === 'reel'){ if (pl.squish > 0) pl.squish--; const st = reelState(pl.reel); if (st.spin && st.k < 0.03 && Math.abs(pl.x - P.x) < 200) sfxOnce('reel'); }
  // Crumb Tray: skullz within reach fly to the bro
  const cx = P.x + P.w / 2, cy = P.y + P.h / 2;
  if (P.magnet > 0){
    P.magnet--;
    const tx0 = Math.max(0, Math.floor((cx - 88) / TS)), tx1 = Math.min(lv.w - 1, Math.floor((cx + 88) / TS)), ty0 = Math.max(0, Math.floor((cy - 72) / TS)), ty1 = Math.min(14, Math.floor((cy + 72) / TS));
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (lv.t[ty][tx] === 'o'){ lv.t[ty][tx] = '.'; magCoins.push({ x: tx * TS + 4, y: ty * TS + 3, t: 0 }); }
    if (P.magnet % 12 === 0) parts.push({ x: cx + Math.cos(G.frame) * 14, y: cy + Math.sin(G.frame) * 14, vx: 0, vy: 0, g: 0, life: 12, color: G.frame % 24 ? PITC.C : PITC.M, size: 1 });
    if (P.magnet === 90) popup(P.x - 16, P.y - 14, 'TRAY FADING', PITC.L);
  }
  for (const m of magCoins){ const dx = cx - (m.x + 4), dy = cy - (m.y + 5), d = Math.hypot(dx, dy) || 1, sp = Math.min(6, 1.4 + m.t * 0.18); m.t++; m.x += dx / d * sp; m.y += dy / d * sp; if (d < 8 || m.t > 90){ m.done = true; addCoin(); } }
  magCoins = magCoins.filter(m => !m.done);
}
function updatePitBolt(b){
  b.t++;
  if (b.kind === 'shock'){ // smoke-detector shockwave falling to the floor, then two ground waves
    b.y += b.vy; b.vy = Math.min(b.vy + 0.12, 4);
    const tx = Math.floor((b.x + b.w / 2) / TS), ty = Math.floor((b.y + b.h) / TS);
    if (isSolid(tx, ty)){ b.remove = true; const fy = ty * TS; A.sfx('slam'); burst(b.x + 6, fy, 8, ['#cbbcd9', '#7d7d86', '#ffffff'], 1.4);
      for (const d of [-1, 1]) bolts.push({ kind: 'gwave', x: b.x + 1, y: fy - 9, w: 10, h: 9, vx: d * 1.3, vy: 0, t: 0 }); }
    if (b.y > H + 8) b.remove = true; return;
  }
  if (b.kind === 'gwave'){
    b.x += b.vx;
    const ahead = Math.floor((b.vx > 0 ? b.x + b.w : b.x) / TS), row = Math.floor((b.y + b.h + 2) / TS);
    if (isSolid(ahead, Math.floor((b.y + 4) / TS)) || !standable(ahead, row) || b.t > (b.boss ? 150 : 70)){ b.remove = true; burst(b.x + 5, b.y + 6, 4, ['#cbbcd9', '#7d7d86'], 1); }
    if (b.t % 3 === 0) smoke(b.x + 5, b.y + 6);
    return;
  }
  if (b.kind === 'iou'){ // fluttering IOU paper (boss): readable heights, shootable
    b.x += b.vx; b.y = b.y0 + Math.sin(b.t * 0.12) * 2.5;
    for (const s of shots){ if (!s.remove && overlap(s, b)){ b.remove = true; if (s.kind !== 'wave' && s.kind !== 'snipe') s.remove = true; burst(b.x + 6, b.y + 4, 6, ['#f4efe0', PITC.R], 1.2); A.sfx('paper'); G.score += 50; break; } }
    if (b.t > 400 || (lv.boss && b.x < lv.boss.bounds[0] * TS - 20)) b.remove = true;
  }
}
// ---- basement enemies ----
function updatePitEnemy(e, dx, dy){
  const near = Math.abs(dx) < 170 && !P.dead && P.ctrl === 'normal';
  if (e.type === 'jamskull'){
    if (e.onGround){ e.vx *= 0.7; if (--e.hopT <= 0){ if (near) e.facing = dx < 0 ? -1 : 1; e.vy = -4.4; e.vx = 1.25 * e.facing; e.hopT = 44 + (e.x % 3) * 6; if (near) A.sfx('squeak'); } }
    if (e.anim % 9 === 0) parts.push({ x: e.x + 3 + Math.random() * 6, y: e.y + e.h - 2, vx: 0, vy: 0.4, g: 0.05, life: 18, color: JAM[(e.anim >> 3) % JAM.length], size: 1 });
  } else if (e.type === 'butterskull'){
    const want = 1.55 * e.facing; e.vx += (want - e.vx) * 0.05;
    if (e.onGround && !aheadSupported(e)){ e.facing = -e.facing; e.vx = 0.3 * e.facing; }
    if (e.onGround && e.anim % 100 === 50) patches.push({ x: e.x - 6, y: e.y + e.h, w: 24, t: 220 });
    if (e.anim % 6 === 0) parts.push({ x: e.x + (e.facing > 0 ? 0 : e.w), y: e.y + e.h - 1, vx: -e.facing * 0.4, vy: -0.2, g: 0.02, life: 10, color: '#ffe680', size: 1 });
  } else if (e.type === 'rubber'){
    if (e.land > 0) e.land--;
    if (e.onGround){ e.land = 6; e.vy = near && Math.abs(dx) < 90 ? -5.6 : -4.6; e.vx = (near ? (dx < 0 ? -1 : 1) : e.facing) * 0.8; e.facing = e.vx < 0 ? -1 : 1; if (near) sfxOnce('squeak'); }
  } else if (e.type === 'smoke'){
    e.vx = 0; e.vy = 0;
    if (e.state === 'beep'){ if (e.t % 8 === 0) A.sfx('beep'); if (--e.t <= 0){ bolts.push({ kind: 'shock', x: e.x + 2, y: e.y + e.h, w: 12, h: 6, vx: 0, vy: 1.2, t: 0 }); e.state = 'idle'; e.cool = 130; } }
    else if (e.cool > 0) e.cool--;
    else if (Math.abs(dx) < 54 && dy > 0 && near){ e.state = 'beep'; e.t = 30; }
    return; // fixed to the ceiling
  } else if (e.type === 'goon'){ // Crust Goon: W3 gun enemy, 3-way spread
    const onScreen = e.x > camX - 8 && e.x < camX + W && near;
    if (e.state === 'walk'){
      e.vx = 0.32 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.cool > 0) e.cool--;
      else if (onScreen && Math.abs(dx) < 170 && Math.abs(dy) < 40){ e.state = 'aim'; e.t = 38; e.facing = dx < 0 ? -1 : 1; A.sfx('rifle'); }
    } else if (e.state === 'aim'){ e.vx = 0; e.facing = dx < 0 ? -1 : 1; if (--e.t <= 0){ e.state = 'fire'; e.t = 0; e.n = 0; } }
    else if (e.state === 'fire'){ e.vx = 0; e.t++;
      if (e.t % 16 === 1 && e.n < 2){ for (const vy of [-0.5, 0, 0.5]){ fireBullet(e.x + (e.facing > 0 ? e.w : 0), e.y + 9, e.facing, 2.0); bolts[bolts.length - 1].vy = vy; } e.n++; A.sfx('shot'); }
      if (e.t > 36){ e.state = 'walk'; e.cool = 120; } }
  }
  e.vy = Math.min(e.vy + (e.type === 'rubber' ? 0.24 : 0.3), 4.5);
  e.x += e.vx;
  if (collideX(e)){ e.facing = -e.facing; if (e.type === 'rubber' || e.type === 'butterskull') e.vx = -e.vx; }
  e.y += e.vy; collideY(e);
  if (e.y > H + 16 || (!lv.camLock && (e.x < camX - 80 || e.x > camX + W + 160))) e.remove = true;
}
function pitStomp(e){ // returns true if handled
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (e.type === 'jamskull'){ e.dead = 'squash'; e.t = 30; burst(cx, cy, 12, JAM, 1.8); A.sfx('splat'); return true; }
  if (e.type === 'butterskull'){ e.dead = 'squash'; e.t = 30; burst(cx, cy, 10, ['#00f0ff', '#ffe680', '#fff8c8'], 1.8); return true; }
  if (e.type === 'rubber'){ e.dead = 'squash'; e.t = 26; burst(cx, cy, 10, ['#ff0040', '#ffb0c8', '#ffffff'], 1.8); A.sfx('squeak'); return true; }
  if (e.type === 'goon'){ e.remove = true; burst(cx, cy, 12, ['#3a1a2a', PITC.M, '#c8a060'], 1.8); const it = spawnItem('ammo', e.x, e.y); it.emerge = 0; it.vy = -3; return true; }
  return false;
}
function drawPitEnemy(e, X){
  const SP = S.pit; if (!SP) return false;
  const Y = Math.round(e.y), side = e.facing > 0 ? 'R' : 'L';
  let img = null, ox = -2, oy = e.h - 16;
  if (e.type === 'jamskull') img = e.dead === 'squash' ? SP.jamskullSq : SP.jamskull[side][e.onGround ? 0 : 1];
  else if (e.type === 'butterskull') img = e.dead === 'squash' ? SP.butterskullSq : SP.butterskull[side][(e.anim >> 3) & 1];
  else if (e.type === 'rubber') img = e.dead === 'squash' ? SP.rubber[side][1] : SP.rubber[side][e.land > 0 ? 1 : 0];
  else if (e.type === 'goon') img = SP.goon[side][(e.anim >> 3) & 1];
  else if (e.type === 'smoke'){ img = SP.smoke[e.state === 'beep' ? ((e.t >> 2) & 1) : ((G.frame % 90) < 6 ? 1 : 0)]; ox = 0; oy = 0; }
  else return false;
  if (e.hitT > 0 && (G.frame & 1)) g.globalAlpha = 0.5;
  if (e.dead === 'flip'){ g.save(); g.translate(X + ox, Y + oy + 16); g.scale(1, -1); g.drawImage(img, 0, 0); g.restore(); }
  else g.drawImage(img, X + ox, Y + oy);
  g.globalAlpha = 1;
  if (e.type === 'smoke' && e.state === 'beep'){ g.fillStyle = PITC.R; for (let i = 0; i < 3; i++) g.fillRect(X + 8 + (i - 1) * 6, Y + 12 + ((G.frame >> 2) + i) % 4, 1, 2); }
  if (e.type === 'goon' && e.state === 'aim' && (G.frame >> 1) % 2){ g.fillStyle = 'rgba(255,0,200,0.7)'; const sx = e.facing > 0 ? X + 14 : X - 2; g.fillRect(e.facing > 0 ? sx : sx - 110, Y + 9, 110, 1); }
  return true;
}
function drawGlitchTrail(e){ // World 3 Burnt Toast walkers leave magenta / cyan ghost copies
  if (!e.trail) return;
  e.trail.forEach((q, i) => { const X = Math.round(q.x - camX), Y = Math.round(q.y); g.globalAlpha = 0.12 + i * 0.05; g.fillStyle = i % 2 ? PITC.M : PITC.C; g.fillRect(X + (i % 2 ? 2 : -2), Y + 2, e.w, e.h - 3); g.fillRect(X - 3, Y + 4 + ((G.frame + i * 3) % 8), e.w + 6, 1); });
  g.globalAlpha = 1;
}
// ---- drawing: coils glow, sparks, reels ----
function drawPitHazards(){
  for (const run of lv.coils || []){
    const st = coilState(run); if (st === 'off') continue;
    const X0 = Math.round(run.a * TS - camX), X1 = Math.round((run.b + 1) * TS - camX); if (X1 < 0 || X0 > W) continue;
    const Y = run.row * TS;
    g.globalAlpha = st === 'on' ? 0.35 + 0.1 * Math.sin(G.frame * 0.5) : 0.15; g.fillStyle = st === 'on' ? PITC.O : '#8a2a10'; g.fillRect(X0, Y - 6, X1 - X0, 6); g.globalAlpha = 1;
    if (st === 'on' && G.frame % 3 === 0) parts.push({ x: run.a * TS + Math.random() * (run.b - run.a + 1) * TS, y: Y - 1, vx: 0, vy: -0.5, g: -0.01, life: 14, color: Math.random() < 0.5 ? PITC.O : PITC.Y, size: 1 });
  }
  for (const fk of lv.forks || []){
    const s = forkSpark(fk), X = Math.round(s.x - camX), Y = Math.round(s.y); if (X < -40 || X > W + 40) continue;
    const r = rng(G.frame * 3 + fk.ax);
    if (s.rest){
      const n = s.warn ? 4 : 2;
      for (let i = 0; i < n; i++){ g.fillStyle = r() < 0.5 ? PITC.C : '#ffffff'; const a = r() * Math.PI * 2, d = 3 + r() * (s.warn ? 7 : 4); g.fillRect(X + Math.round(Math.cos(a) * d), Y - 8 + Math.round(Math.sin(a) * d), 1, 1); }
      if (s.warn){ g.globalAlpha = 0.35; g.strokeStyle = PITC.C; g.beginPath(); g.moveTo(X, Y - 8); g.lineTo(Math.round(s.tx - camX), Math.round(s.ty) - 8); g.stroke(); g.globalAlpha = 1; }
    } else {
      g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.beginPath(); g.moveTo(Math.round(s.fx - camX), Math.round(s.fy) - 4);
      const steps = 6; for (let i = 1; i <= steps; i++){ const k = i / steps; g.lineTo(Math.round(s.fx + (X + camX - s.fx) * k - camX + (r() - 0.5) * 6), Math.round(s.fy + (Y - s.fy) * k + (r() - 0.5) * 6)); } g.stroke();
      g.fillStyle = PITC.C; g.beginPath(); g.arc(X, Y, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(X, Y, 3, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 4; i++){ g.fillStyle = r() < 0.5 ? PITC.M : PITC.C; g.fillRect(X + Math.round((r() - 0.5) * 14), Y + Math.round((r() - 0.5) * 14), 1, 1); }
    }
  }
  for (const b of bolts){
    if (b.mine) continue;
    const X = Math.round(b.x - camX), Y = Math.round(b.y);
    if (b.kind === 'shock'){ g.strokeStyle = '#ffffff'; g.globalAlpha = 0.8; g.beginPath(); g.ellipse(X + 6, Y + 3, 6 + (b.t % 6), 3, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    else if (b.kind === 'gwave' && !b.vault){ g.fillStyle = 'rgba(203,188,217,0.75)'; const h = 6 + ((b.t >> 1) % 3); g.beginPath(); g.moveTo(X, Y + 9); g.lineTo(X + 5, Y + 9 - h); g.lineTo(X + 10, Y + 9); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(X + 4, Y + 9 - h, 2, 2); }
    else if (b.kind === 'iou' && S.pit){ g.drawImage(S.pit.iou, X, Y); }
  }
  for (const m of magCoins) g.drawImage(S.coin, Math.round(m.x - camX), Math.round(m.y), 8, 10);
}
function drawReel(pl){
  const X = Math.round(pl.x - camX), Y = Math.round(pl.y); if (X > W || X + 32 < 0) return;
  const st = reelState(pl.reel);
  g.fillStyle = '#05030a'; g.fillRect(X, Y, 32, 16); g.fillStyle = '#2a1e36'; g.fillRect(X + 1, Y + 1, 30, 14);
  g.save(); g.beginPath(); g.rect(X + 2, Y + 1, 28, 14); g.clip();
  if (st.spin){ const o = Math.round(st.k * 64) % 16; for (let i = -1; i < 2; i++){ const sym = ['toast', 'skull', 'jam', 'crumb'][(Math.floor(st.k * 4) + i + 4) % 4]; const c = mkSym(sym); g.drawImage(c, X + 6, Y + i * 16 + o - 2); } }
  else { const sq = pl.squish > 0 ? 2 : 0; g.drawImage(mkSym(st.face), X + 6, Y - 2 + sq); }
  g.restore();
  if (st.spin){ g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(X + 2, Y + 1, 28, 3); g.fillRect(X + 2, Y + 12, 28, 3); }
  const warn = !st.spin && st.left < 30 && (G.frame >> 2) % 2;
  g.fillStyle = st.face === 'spike' && !st.spin ? PITC.R : st.face === 'bounce' && !st.spin ? PITC.C : PITC.M; g.fillRect(X, Y, 32, 1); if (warn){ g.fillStyle = '#ffffff'; g.fillRect(X, Y, 32, 1); }
  g.fillStyle = '#05030a'; g.fillRect(X + 15, Y + 16, 2, Math.max(0, 14 * TS - Y - 16)); // the reel's support post
}
const SYMC = {};
function mkSym(sym){ if (SYMC[sym]) return SYMC[sym]; const c = mkCanvas(20, 20), x = c.getContext('2d'); pitSymbol(x, sym, 0, 0, 1); return (SYMC[sym] = c); }
// ---- post-fx: neon bloom, glitch bands, scanlines, vignette ----
let bloomC = null, scanC = null;
function pitPostFx(){
  if (!inPit()) return;
  if (!bloomC){ bloomC = mkCanvas(W / 2, H / 2); scanC = mkCanvas(W, H); const sx = scanC.getContext('2d'); sx.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < H; y += 2) sx.fillRect(0, y, W, 1); }
  const bx = bloomC.getContext('2d'); bx.clearRect(0, 0, W / 2, H / 2); bx.drawImage(buf, 0, 0, W / 2, H / 2);
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.2; g.filter = 'blur(2px)'; g.drawImage(bloomC, 0, 0, W, H); g.restore();
  const curse = BOSS && BOSS.kind === 'breadlord' && BOSS.curse ? BOSS.curse : null;
  const gl = curse ? 4 : ((G.frame % 240) < 8 ? 2 : 0);
  if (gl){ const r = rng(G.frame * 13 + 5); for (let i = 0; i < gl; i++){ const y = (r() * (H - 12)) | 0, h = 2 + ((r() * 8) | 0), dx = ((r() - 0.5) * (curse ? 14 : 8)) | 0; g.drawImage(buf, 0, y, W, h, dx, y, W, h); g.fillStyle = r() < 0.5 ? 'rgba(255,0,200,0.25)' : 'rgba(0,240,255,0.25)'; g.fillRect(0, y, W, 1); } }
  g.drawImage(scanC, 0, 0);
  const vg = g.createRadialGradient(W / 2, H / 2, 70, W / 2, H / 2, 190); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, curse ? 'rgba(200,0,30,0.55)' : 'rgba(0,0,0,0.4)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------------- THE BREADLORD (World 3 boss) ----------------
// A looming debt collector at a table. Phase 1: burnt slices, IOU papers, table slams. Phase 2 (HP <= 3): slot reels spin above the
// arena; skull = a Jam Skull drops in, jam = a grape-jam blob, crumbs = free skullz, toast = a slice. Three Burnt Toasts in a row = CURSE.
function makeBreadlord(spec){
  const deck = spec.deckRow * TS, tx = spec.tx * TS;
  return { kind: 'breadlord', spec, tableX: tx, deck, x: tx + 10, y: deck - 74, w: 60, h: 74, vx: 0, vy: 0, hp: 6, flash: 0, state: 'dormant', t: 0, n: 0,
    active: false, dying: false, dead: false, dt: 0, by: null, phase: 1, cyc: 0, spins: 0, reels: null, curse: null, slices: [], blobs: [], chip: 0, onGround: true, pose: 'idle' };
}
function breadDamage(src){
  const b = BOSS; if (!b || b.dying || b.dead || b.flash > 0) return;
  b.hp--; b.flash = 60; G.shake = 10; A.sfx('bosshit'); b.pose = 'hurt';
  burst(b.x + b.w / 2, b.y + 20, 16, ['#ffffff', '#c8a060', '#f4dca0', PITC.M], 2.4);
  if (b.hp <= 0){ breadDie(src); return; }
  popup(b.x, b.y - 12, 'HP ' + b.hp, PITC.M);
  if (b.hp <= 3 && b.phase === 1){ b.phase = 2; b.state = 'idle'; b.t = 0; b.cyc = 0; b.spins = 0; b.reels = null; popup(b.tableX - 70, 40, 'THE REELS ARE SPINNING', PITC.Y).long = true; A.sfx('curse'); }
}
function breadDie(by){
  const b = BOSS; b.dying = true; b.by = by; b.dt = 0; b.reels = null; b.curse = null; A.stopMusic(); A.sfx('powerdown'); addScore(5000, b.x, b.y - 18);
  bolts.forEach(o => o.remove = true); b.slices = []; b.blobs = [];
  G.bigText = { text: 'DEBT PAID', t: 0 }; G.debtPaid = true;
}
function breadThrowSlice(b, tx){
  const x0 = b.tableX + 6, y0 = b.deck - 62, vy = -4.4, gr = 0.18, dy = b.deck - 12 - y0;
  const T = (-vy + Math.sqrt(vy * vy + 2 * gr * dy)) / gr;
  const ax0 = b.spec.bounds[0] * TS + 4, aim = Math.max(ax0, Math.min(b.tableX - 16, tx));
  b.slices.push({ x: x0, y: y0, w: 12, h: 12, vx: (aim - x0) / T, vy, gr, bounce: 0, t: 0 }); A.sfx('launch');
}
function updateBreadlord(){
  const b = BOSS, ax0 = b.spec.bounds[0] * TS, deck = b.deck, pcx = P.x + P.w / 2;
  if (b.flash > 0) b.flash--;
  if (b.dying){
    b.dt++;
    if (b.dt % 3 === 0) parts.push({ x: b.tableX + 28 + Math.random() * 24, y: deck - 30, vx: (Math.random() - 0.5) * 0.4, vy: -0.8 - Math.random(), g: -0.01, life: 26, color: Math.random() < 0.5 ? PITC.O : PITC.Y, size: 2 }); // the ledger burns
    if (b.dt % 7 === 0) parts.push({ x: b.tableX + 40, y: deck - 32, vx: (Math.random() - 0.5) * 2, vy: -2 - Math.random() * 1.5, g: 0.04, life: 60, color: '#f4efe0', size: 2, edge: '#3a1a10' }); // pages
    if (b.dt % 5 === 0) burst(b.x + Math.random() * b.w, b.y + Math.random() * 40, 3, ['#c8a060', '#f4dca0', '#6a5a4a'], 1.6, 30); // crumbles to crumbs
    if (b.dt % 4 === 0) smoke(b.x + Math.random() * b.w, b.y + 10 + Math.random() * 30);
    if (b.dt === 30) A.sfx('burn');
    if (b.dt > 230){ b.dead = true; b.active = false; if (lv.escapeWall) startEscape(); else { G.castleEnd = true; G.endT = 0; A.sfx('clear'); } }
    return;
  }
  if (!b.active) return;
  b.t++;
  const fast = b.phase === 2 ? 0.8 : 1;
  switch (b.state){
    case 'idle': {
      b.pose = b.flash > 30 ? 'hurt' : 'idle';
      if (b.t > 56 * fast){
        const p1 = ['slices', 'iou', 'slam'], p2 = ['reels', 'slices', 'iou', 'reels', 'slam'];
        const seq = b.phase === 2 ? p2 : p1; b.state = seq[b.cyc % seq.length]; b.cyc++; b.t = 0; b.n = 0;
        if (b.state === 'reels'){ const k = b.spins++, triple = k % 3 === 0; /* first spin of phase 2 (and every third after): three Burnt Toasts */ let syms;
          if (triple) syms = ['toast', 'toast', 'toast'];
          else { const pool = ['skull', 'jam', 'crumb', 'toast']; syms = [0, 1, 2].map(() => pool[Math.floor(grand() * 4) % 4]); if (syms.every(s => s === 'toast')) syms[1] = 'crumb'; }
          b.reels = { t: 0, syms, stops: [46, 60, 74] }; A.sfx('reel'); }
      }
      break; }
    case 'slices':
      b.pose = 'throw';
      if ((b.t === 18 || b.t === 40 || (b.phase === 2 && b.t === 62)) ) breadThrowSlice(b, pcx + P.vx * 26 + (b.n++ % 2 ? 22 : -10));
      if (b.t > (b.phase === 2 ? 96 : 76)){ b.state = 'idle'; b.t = 0; }
      break;
    case 'iou':
      b.pose = 'throw';
      if (b.t % 22 === 10 && b.n < 4){ const low = b.n % 2 === 0; bolts.push({ kind: 'iou', x: b.tableX - 4, y: 0, y0: low ? deck - 11 : deck - 40, w: 12, h: 8, vx: -1.15, vy: 0, t: 0 }); b.n++; A.sfx('paper'); }
      if (b.t > 120){ b.state = 'idle'; b.t = 0; }
      break;
    case 'slam':
      b.pose = 'angry';
      if (b.t < 30 && b.t % 6 === 0) G.shake = 2;
      if (b.t === 30 || (b.phase === 2 && b.t === 70)){ G.shake = 10; A.sfx('slam'); bolts.push({ kind: 'gwave', boss: true, x: b.tableX - 12, y: deck - 9, w: 10, h: 9, vx: -2.0, vy: 0, t: 0 }); burst(b.tableX + 40, deck - 30, 10, ['#5a3a24', '#c8a060', '#ffffff'], 2); }
      if (b.t > (b.phase === 2 ? 104 : 70)){ b.state = 'idle'; b.t = 0; }
      break;
    case 'reels': {
      b.pose = 'idle';
      const R = b.reels; R.t++;
      for (const s of R.stops) if (R.t === s) A.sfx('reelstop');
      if (R.t === R.stops[2] + 22){
        if (R.syms.every(s => s === 'toast')) startCurse(b);
        else for (let i = 0; i < 3; i++) reelEffect(b, R.syms[i], i);
      }
      if (R.t > R.stops[2] + 40){ b.reels = null; b.state = 'idle'; b.t = 0; }
      break; }
  }
  // slices: arc, bounce once, crumble on the second landing
  for (const s of b.slices){
    s.t++; s.vy = Math.min(s.vy + s.gr, 4.5); s.x += s.vx; s.y += s.vy;
    if (s.y + s.h >= deck){ s.y = deck - s.h; if (s.bounce++ === 0 && !s.straight){ s.vy = -2.2; s.vx *= 0.45; A.sfx('bump'); } else { s.dead = true; burst(s.x + 6, s.y + 8, 8, ['#2a160c', '#c8a060', '#7d7d86'], 1.4); smoke(s.x + 6, s.y); } }
    if (s.x < ax0 - 16) s.dead = true;
    if (!s.dead && P.ctrl === 'normal' && !P.dead && overlap(P, { x: s.x + 1, y: s.y + 1, w: 10, h: 10 })){ if (P.mirror > 0){ s.dead = true; A.sfx('clang'); } else if (P.star <= 0) hurt(); }
  }
  b.slices = b.slices.filter(s => !s.dead);
  // jam blobs (telegraphed shadow, then a grape-jam splat)
  for (const j of b.blobs){
    j.t++; if (j.t > 34){ j.vy = Math.min((j.vy || 0) + 0.3, 6); j.y += j.vy; }
    if (j.y + 10 >= deck){ j.dead = true; burst(j.x, deck - 4, 14, JAM, 2); A.sfx('splat'); if (P.ctrl === 'normal' && !P.dead && Math.abs(pcx - j.x) < 14 && P.y + P.h > deck - 24) hurt(); }
    else if (j.t > 34 && P.ctrl === 'normal' && !P.dead && overlap(P, { x: j.x - 6, y: j.y, w: 12, h: 10 })) hurt();
  }
  b.blobs = b.blobs.filter(j => !j.dead);
  // CURSE: smoke, red vignette, glitch, and telegraphed burnt-toast columns with safe lanes
  if (b.curse){
    const c = b.curse; c.t++;
    if (c.t % 2 === 0) smoke(ax0 + Math.random() * (b.tableX - ax0), 60 + Math.random() * 120);
    for (const w of c.waves){ if (c.t === w.at){ for (const lane of w.lanes) for (const o of [4, 18]){ b.slices.push({ x: ax0 + lane * 32 + o - 2, y: 30, w: 12, h: 12, vx: 0, vy: 2.5, gr: 0.1, bounce: 1, straight: true, t: 0 }); } A.sfx('launch'); } }
    if (c.t > 170) b.curse = null;
  }
  // body contact: the Breadlord looms over his table
  if (P.ctrl === 'normal' && !P.dead && overlap(P, { x: b.x + 4, y: b.y + 8, w: b.w - 8, h: b.h - 8 })){ if (P.star > 0){ if (!b.flash) breadDamage('star'); } else { hurt(); } P.x = Math.min(P.x, b.x - P.w); P.vx = -2; }
}
function startCurse(b){
  const lanes = Math.floor((b.tableX - b.spec.bounds[0] * TS) / 32); // 32px lanes between the arena wall and the table
  const all = [...Array(lanes).keys()], A1 = all.filter(i => i % 2 === 0), B1 = all.filter(i => i % 2 === 1);
  b.curse = { t: 0, lanes, waves: [{ at: 56, lanes: A1 }, { at: 120, lanes: B1 }] };
  popup(b.tableX - 92, 44, 'BURNT x3: CURSED!', PITC.R).long = true; A.sfx('curse'); G.shake = 8;
}
function reelEffect(b, sym, i){
  const ax0 = b.spec.bounds[0] * TS, span = b.tableX - ax0;
  if (sym === 'skull'){ const e = spawnEnemy('jamskull', ax0 + 24 + i * (span / 3), 40); e.hopT = 30; e.facing = -1; }
  else if (sym === 'jam'){ b.blobs.push({ x: Math.max(ax0 + 8, Math.min(b.tableX - 8, P.x + P.w / 2 + (i - 1) * 6)), y: 30, t: 0 }); }
  else if (sym === 'crumb'){ for (let k = 0; k < 2; k++) spawnCoinPop(ax0 + 20 + (i * 3 + k) * (span / 7), b.deck - 60); }
  else if (sym === 'toast'){ breadThrowSlice(b, P.x + P.w / 2); }
}
function drawBreadlord(){
  const b = BOSS, X = Math.round(b.tableX - camX), deck = b.deck;
  if (X < -100 || X > W + 20) return;
  const SP = S.pit;
  // phase 2 / curse: reels above the arena
  if (b.reels){
    const R = b.reels, cx = Math.round((b.spec.bounds[0] * TS + b.tableX) / 2 - camX), y = 34;
    g.fillStyle = '#05030a'; g.fillRect(cx - 40, y - 4, 80, 32); g.fillStyle = PITC.M; g.fillRect(cx - 40, y - 4, 80, 1); g.fillRect(cx - 40, y + 27, 80, 1);
    for (let i = 0; i < 3; i++){
      const wx = cx - 36 + i * 25, stopped = R.t >= R.stops[i];
      g.fillStyle = '#1e1626'; g.fillRect(wx, y, 22, 24);
      g.save(); g.beginPath(); g.rect(wx, y, 22, 24); g.clip();
      if (stopped) g.drawImage(mkSym(R.syms[i]), wx + 1, y + 2);
      else { const o = (R.t * 5 + i * 7) % 24; const pool = ['toast', 'skull', 'jam', 'crumb']; for (let k = -1; k < 2; k++) g.drawImage(mkSym(pool[(Math.floor(R.t / 5) + k + i + 8) % 4]), wx + 1, y + k * 24 + o); }
      g.restore();
    }
  }
  // the Breadlord, then the table in front of him
  if (SP){
    const pose = b.dead || b.dying ? 'dead' : b.flash > 0 && (G.frame >> 1) % 2 ? 'hurt' : b.curse ? 'angry' : b.pose;
    const sink = b.dying ? Math.min(40, b.dt * 0.2) : 0, bob = b.dying ? 0 : Math.round(Math.sin(G.frame * 0.05) * 1.5);
    if (!b.dead){ g.save(); g.beginPath(); g.rect(X - 10, 0, 100, deck - 18); g.clip(); if (b.dying) g.globalAlpha = Math.max(0, 1 - b.dt / 230); g.drawImage(SP.breadlord[pose] || SP.breadlord.idle, X + 8, Math.round(b.y + sink + bob)); g.restore(); g.globalAlpha = 1; }
    g.drawImage(b.dying || b.dead ? S.debtTableBurnt : S.debtTable, X, deck - 30);
    if (!b.dying && !b.dead && (G.frame >> 3) % 2) { g.fillStyle = PITC.Y; g.fillRect(X + 65, deck - 32, 1, 2); }
    if (b.dying){ const fl = rng(G.frame); for (let i = 0; i < 8; i++){ g.fillStyle = fl() < 0.5 ? PITC.O : PITC.Y; g.fillRect(X + 27 + ((fl() * 26) | 0), deck - 31 - ((fl() * 8) | 0), 2, 2); } }
  }
  // slices + blobs + curse lane telegraphs
  for (const s of b.slices) if (SP) g.drawImage(SP.slice[(G.frame >> 2) & 1], Math.round(s.x - camX), Math.round(s.y));
  for (const j of b.blobs){
    const jx = Math.round(j.x - camX);
    g.fillStyle = 'rgba(0,0,0,0.45)'; const sw = 6 + Math.min(8, j.t / 4); g.fillRect(jx - sw, deck - 2, sw * 2, 2);
    g.fillStyle = JAM[0]; g.beginPath(); g.arc(jx, Math.round(j.y) + 5, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#c27ae8'; g.fillRect(jx - 2, Math.round(j.y) + 2, 2, 2);
  }
  if (b.curse){
    const c = b.curse, ax0 = b.spec.bounds[0] * TS;
    for (const w of c.waves){ if (c.t < w.at && c.t > w.at - 50 && (G.frame >> 2) % 2) for (const lane of w.lanes){ const lx = Math.round(ax0 + lane * 32 - camX); g.fillStyle = 'rgba(255,0,64,0.35)'; g.fillRect(lx + 2, 48, 28, deck - 48); g.fillStyle = PITC.R; g.fillRect(lx + 2, deck - 3, 28, 3); } }
  }
  // HP pips
  if (b.active && !b.dying && !b.dead){ drawText(g, 'BREADLORD', X - 2, deck - 92, PITC.Y, 1, '#000'); for (let i = 0; i < 6; i++){ g.fillStyle = '#000'; g.fillRect(X + 56 + i * 5, deck - 92, 4, 6); g.fillStyle = i < b.hp ? PITC.M : '#2a2032'; g.fillRect(X + 57 + i * 5, deck - 91, 2, 4); } }
}
// ---- bot strategy for the Breadlord ----
function botBread(b, grounded, feet){
  const p = P, B = BOSS, px = p.x + p.w / 2, ax0 = B.spec.bounds[0] * TS;
  b.right = false; b.left = false; b.run = false;
  if (B.dead || B.dying){ botJump(b, false); return; }
  const range = BOT_RANGE[BROS[p.bro].weapon.kind] || 60;
  const front = B.x; // hitbox front
  let goal = Math.max(ax0 + 20, Math.min(front - 12, front - Math.min(range, 140) + 10));
  if (B.curse){ // stand in the middle of a safe lane for the next wave
    const c = B.curse, w = c.waves.find(q => c.t < q.at + 30); if (w){ let best = null; for (let i = 0; i < c.lanes; i++){ if (w.lanes.includes(i)) continue; const cx = ax0 + i * 32 + 16; if (best === null || Math.abs(cx - px) < Math.abs(best - px)) best = cx; } if (best !== null) goal = best; }
  }
  // dodge slices: move away from where an airborne slice will land
  for (const s of B.slices){ if (s.straight) continue; let x = s.x + 6, y = s.y, vy = s.vy; while (y + s.h < B.deck){ vy = Math.min(vy + s.gr, 4.5); y += vy; x += s.vx; } if (Math.abs(x - px) < 20) goal = x > px ? Math.max(ax0 + 10, x - 34) : Math.min(front - 14, x + 34); }
  for (const j of B.blobs) if (Math.abs(j.x - px) < 22) goal = j.x > px ? Math.max(ax0 + 10, j.x - 32) : Math.min(front - 14, j.x + 32);
  if (px < goal - 3) b.right = true; else if (px > goal + 3) b.left = true;
  // face the boss when idle at the goal so the gun points at him
  if (!b.left && !b.right && p.facing < 0 && G.frame % 6 === 0) b.right = true;
  // jumps: low IOUs and ground waves
  let want = false;
  for (const o of bolts){ if (o.mine || o.reflected) continue; const d = o.x - px;
    if ((o.kind === 'gwave' || (o.kind === 'iou' && o.y0 > B.deck - 20)) && d > -6 && d < 34 + Math.abs(o.vx) * 6) want = true; }
  botJump(b, want && !B.curse, 20);
}

// ================= v0.6 WORLD 4: TOASTER CARDS =================
// A grimy 24-hour diner at 3 a.m.: flickering fluorescents, grease vats, Pop-Up toaster slots, flipping giant cards,
// The Fuse Box (flips the picture left/right) and THE REPAIRMAN: CAL'S EVIL RERUN. Jam is always grape purple (#b54e8c).
const DJAM = ['#b54e8c', '#7e2f60', '#d97ab2'];
Object.assign(EDEF, { rat: { w: 13, h: 9, hp: 1 }, crouton: { w: 12, h: 12, hp: 2 }, crumbit: { w: 8, h: 7, hp: 1 }, mold: { w: 16, h: 12, hp: 3 },
  popper: { w: 10, h: 13, hp: 1 }, ghost: { w: 12, h: 13, hp: 2, fly: true }, knight: { w: 12, h: 16, hp: 3 }, slice: { w: 12, h: 14, hp: 2 },
  bagel: { w: 12, h: 11, hp: 1, fly: true }, cook: { w: 12, h: 15, hp: 3 }, fusebox: { w: 28, h: 38, hp: 24, fly: true }, reflect: { w: 12, h: 15, hp: 1 } });
const DINER_TYPES = new Set(['rat', 'crouton', 'crumbit', 'mold', 'popper', 'ghost', 'knight', 'slice', 'bagel', 'cook', 'fusebox', 'reflect']);
let molds = [];
function inDiner(){ return !!(TSET && TSET.diner); }
function dinerInit(e, s){
  if (s.gate) e.gate = s.gate;
  if (e.type === 'rat'){ e.facing = -1; }
  if (e.type === 'crouton'){ e.hopT = 16 + (s.x % 3) * 10; }
  if (e.type === 'mold'){ e.dropT = 40; }
  if (e.type === 'ghost'){ e.state = 'float'; e.homeY = e.y; e.lives = 1; }
  if (e.type === 'knight'){ e.shield = 6; e.cool = 0; }
  if (e.type === 'slice'){ e.cool = 90 + (s.x % 4) * 15; }
  if (e.type === 'bagel'){ e.state = 'hover'; e.homeX = e.x; e.homeY = e.y; }
  if (e.type === 'cook'){ e.cool = 60; }
  if (e.type === 'fusebox'){ e.state = 'idle'; e.cool = 80; e.flipT = 0; e.x = s.x * TS + 2; }
}
// ---- giant playing cards ----
const CARD_FLIP = 16;
function cardState(c, f){
  const t = cyc(f, c.phase, c.period), up = c.up, dn = c.period - CARD_FLIP;
  if (t < up) return { solid: true, up: true, k: 0, left: up - t, warn: up - t < 36 };
  if (t < up + CARD_FLIP) return { solid: false, up: true, k: (t - up) / CARD_FLIP, left: 0 };
  if (t < dn) return { solid: false, up: false, k: 0, left: dn - t, warn: dn - t < 24 };
  return { solid: false, up: false, k: (t - dn) / CARD_FLIP, left: 0, rising: true };
}
function dinerPlats(){ molds = []; return (lv.cards || []).map(c => ({ kind: 'card', card: c, x: c.tx * TS - 4, y: c.ty * TS, w: 40, h: 8, x0: c.tx * TS - 4, y0: c.ty * TS, dx: 0, dy: 0, t: 0, fallT: 0, vy: 0, stood: false })); }
function platSolid(pl){ return pl.kind !== 'card' || cardState(pl.card).solid; }
function dinerPrePlats(){ // the autopilot only trusts a card that is face-up and will stay up for a while
  for (const pl of plats) if (pl.kind === 'card'){ const st = cardState(pl.card); pl.gone = !(st.solid && st.left > 44); if (st.k > 0 && st.k < 0.07 && Math.abs(pl.x - P.x) < 200) sfxOnce('cardflip'); }
}
// ---- fluorescent flicker (4-1) ----
function flickerDark(f){
  const fl = lv.flicker; if (!fl) return 0;
  const t = cyc(f, 0, fl.period), d0 = fl.period - fl.dark;
  if (t >= d0) return (t - d0 < 6 || (t > fl.period - 10 && (t >> 1) % 2)) ? 0.5 : 1;
  if (t >= d0 - 40) return ((t >> 2) % 3 === 0) ? 0.75 : 0; // stutter before the lights die
  return 0;
}
// ---- enemies ----
function updateDinerEnemy(e, dx, dy){
  const near = Math.abs(dx) < 170 && !P.dead && P.ctrl === 'normal', pcx = P.x + P.w / 2;
  let grav = true;
  switch (e.type){
    case 'rat': e.vx = 1.05 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing; if (near && e.anim % 50 === 0 && e.onGround && Math.abs(dx) < 90) e.facing = dx < 0 ? -1 : 1; break;
    case 'crouton': case 'crumbit':
      if (e.onGround){ e.vx *= 0.6; if (--e.hopT <= 0){ if (near) e.facing = dx < 0 ? -1 : 1; e.vy = e.type === 'crumbit' ? -3.2 : -3.8; e.vx = (e.type === 'crumbit' ? 1.1 : 0.8) * e.facing; e.hopT = (e.type === 'crumbit' ? 26 : 40) + (e.anim % 3) * 6; } }
      break;
    case 'mold':
      e.vx = 0.22 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.onGround && --e.dropT <= 0){ e.dropT = 64; const mx = e.x - 4; if (!molds.some(m => Math.abs(m.x - mx) < 10 && m.y === e.y + e.h)) molds.push({ x: mx, y: e.y + e.h, w: 24, t: 0, life: 420 }); }
      break;
    case 'popper':
      if (e.state === 'air'){ if (e.onGround && e.vy >= 0){ e.state = 'walk'; e.t = 0; } }
      else { e.vx = 0.6 * e.facing; if (near && e.anim % 40 === 0) e.facing = dx < 0 ? -1 : 1; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing; if (++e.t > 600) e.remove = true; }
      break;
    case 'ghost':
      grav = false;
      if (e.state === 'gone'){ e.vx = 0; e.vy = 0; if (--e.t <= 0){ e.state = 'float'; e.back = true; e.hp = 2; e.hitT = 0; burst(e.x + 6, e.y + 6, 10, ['#bff6ff', DIN.C, DIN.M], 1.6); popup(e.x - 8, e.y - 10, 'BOO-RERUN!', DIN.C); A.sfx('ghost'); } e.anim--; break; }
      if (near && Math.abs(dx) < 150){ const ty = P.y - 2 + Math.sin(e.anim * 0.06) * 10, sp = e.back ? 0.62 : 0.45; e.facing = dx < 0 ? -1 : 1; e.vx += (Math.sign(dx) * sp - e.vx) * 0.05; e.vy += (Math.sign(ty - e.y) * 0.4 - e.vy) * 0.06; }
      else { e.vx *= 0.9; e.vy = Math.sin(e.anim * 0.05) * 0.3; }
      e.x += e.vx; e.y += e.vy; if (e.y > 13 * TS - e.h) e.y = 13 * TS - e.h;
      break;
    case 'knight':
      if (near && Math.abs(dx) < 140) e.facing = dx < 0 ? -1 : 1;
      e.vx = (near && Math.abs(dx) > 30 ? 0.25 : 0) * e.facing; if (e.onGround && !aheadSupported(e)) e.vx = 0;
      break;
    case 'slice':
      if (e.state === 'tele'){ e.vx = 0; if (--e.t <= 0){ burst(e.x + 6, e.y + 7, 8, [DIN.C, DIN.M, '#ffffff'], 1.4); e.x = e.tx; e.y = e.ty; e.state = 'walk'; e.cool = 150; e.facing = pcx < e.x ? -1 : 1; burst(e.x + 6, e.y + 7, 8, [DIN.C, DIN.M, '#ffffff'], 1.4); sfxOnce('static'); } break; }
      e.vx = 0.3 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.cool > 0) e.cool--;
      else if (near && e.onGround && Math.abs(dx) < 150 && Math.abs(dy) < 40){ // pick a spot near the bro (never on top of them)
        const side = dx > 0 ? -1 : 1; let spot = null;
        for (const off of [64, 80, 52]){ for (const sd of [side, -side]){ const x = pcx + sd * off, tx = Math.floor(x / TS), gy = groundBelow(tx, Math.floor(P.y / TS)); const gy2 = groundBelow(Math.floor((x + 11) / TS), Math.floor(P.y / TS)); if (gy > 0 && gy === gy2 && Math.abs(gy * TS - (P.y + P.h)) <= 32 && x > camX + 8 && x < camX + W - 20){ spot = { x: x - 6, y: gy * TS - e.h }; break; } } if (spot) break; }
        if (spot){ e.state = 'tele'; e.t = 36; e.tx = spot.x; e.ty = spot.y; } else e.cool = 40;
      }
      break;
    case 'bagel':
      grav = false;
      if (e.state === 'hover'){ e.x = e.homeX + Math.sin(e.anim * 0.04) * 10; e.y = e.homeY + Math.sin(e.anim * 0.09) * 3; e.facing = dx < 0 ? -1 : 1;
        if (near && Math.abs(dx) < 96 && e.x > camX && e.x < camX + W - 8 && P.y > e.y){ e.state = 'aim'; e.t = 40; A.sfx('fuse'); } }
      else if (e.state === 'aim'){ e.x += (G.frame & 1) ? 1 : -1; if (G.frame % 3 === 0) smoke(e.x + 6, e.y); if (--e.t <= 0){ const ang = Math.atan2(P.y + P.h - 4 - (e.y + 5), pcx - (e.x + 6)); e.vx = Math.cos(ang) * 2.1; e.vy = Math.sin(ang) * 2.1; e.state = 'dive'; e.t = 0; } }
      else if (e.state === 'dive'){ e.x += e.vx; e.y += e.vy; e.t++; if (e.t % 2 === 0) smoke(e.x + 6, e.y + 4);
        if (isSolid(Math.floor((e.x + 6) / TS), Math.floor((e.y + e.h) / TS)) || e.y > 13 * TS - e.h || e.t > 140 || (overlap(P, e) && P.ctrl === 'normal')){ bagelBoom(e, 'env'); } }
      break;
    case 'cook': { // Short-Order Cook: two grease pellets
      const onScreen = e.x > camX - 8 && e.x < camX + W && near;
      if (e.state === 'walk'){ e.vx = 0.3 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing; if (e.cool > 0) e.cool--; else if (onScreen && Math.abs(dx) < 160 && Math.abs(dy) < 36){ e.state = 'aim'; e.t = 36; e.facing = dx < 0 ? -1 : 1; A.sfx('rifle'); } }
      else if (e.state === 'aim'){ e.vx = 0; e.facing = dx < 0 ? -1 : 1; if (--e.t <= 0){ e.state = 'fire'; e.t = 0; e.n = 0; } }
      else if (e.state === 'fire'){ e.vx = 0; e.t++; if (e.t % 14 === 1 && e.n < 2){ fireBullet(e.x + (e.facing > 0 ? e.w : 0), e.y + 9, e.facing, 2.1); bolts[bolts.length - 1].grease = true; e.n++; A.sfx('shot'); } if (e.t > 34){ e.state = 'walk'; e.cool = 110; } }
      break; }
    case 'fusebox': updateFuseBox(e, dx, dy); return;
    case 'reflect': updateReflection(e); return;
  }
  if (grav){ e.vy = Math.min(e.vy + 0.3, 4.5); e.x += e.vx; if (collideX(e)) e.facing = -e.facing; e.y += e.vy; collideY(e); }
  if (e.y > H + 16 || (!lv.camLock && (e.x < camX - 80 || e.x > camX + W + 160))) e.remove = true;
}
function bagelBoom(e, owner){ if (e.dead || e.remove) return; e.remove = true; boom(e.x + 6, e.y + 6, 20, { power: 1, dmg: 2, owner }); burst(e.x + 6, e.y + 6, 6, DJAM, 1.6, 24); }
function dinerStomp(e){ // returns true if handled
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (!DINER_TYPES.has(e.type)) return false;
  if (e.type === 'rat'){ e.dead = 'squash'; e.t = 26; burst(cx, cy, 8, ['#8a4a1c', '#e8c27a', '#f4c860'], 1.6); return true; }
  if (e.type === 'crouton'){ e.remove = true; croutonSplit(e); return true; }
  if (e.type === 'crumbit' || e.type === 'popper'){ e.remove = true; burst(cx, cy, 8, ['#e0a040', '#f4c860', '#7a3e10'], 1.5); return true; }
  if (e.type === 'mold'){ if (--e.hp <= 0){ e.remove = true; burst(cx, cy, 12, ['#d8c8a0', DIN.MOLD, DIN.MOLD2], 1.8); } else { e.hitT = 10; burst(cx, e.y, 5, [DIN.MOLD, '#d8c8a0'], 1.2); } return true; }
  if (e.type === 'ghost'){ ghostDown(e); return true; }
  if (e.type === 'knight'){ e.remove = true; burst(cx, cy, 12, ['#4a2e18', '#d8c8a0', DIN.CH], 1.8); return true; }
  if (e.type === 'slice'){ e.remove = true; burst(cx, cy, 12, [DIN.C, DIN.M, '#ffffff'], 1.8); return true; }
  if (e.type === 'bagel'){ bagelBoom(e, 'p'); return true; }
  if (e.type === 'cook'){ e.remove = true; burst(cx, cy, 12, ['#ffffff', DIN.R, DIN.TOAST], 1.8); const it = spawnItem('ammo', e.x, e.y); it.emerge = 0; it.vy = -3; return true; }
  if (e.type === 'fusebox'){ damageEnemy(e, 3, 0, { stomp: true }); return true; }
  if (e.type === 'reflect'){ e.remove = true; burst(cx, cy, 12, [DIN.C, DIN.M, '#ffffff'], 1.8); popup(e.x - 10, e.y - 10, 'NOT YOU', DIN.M); return true; }
  return false;
}
function croutonSplit(e){ // one big crouton -> three crumbits
  const cx = e.x + e.w / 2; burst(cx, e.y + 6, 8, ['#e0a040', '#f4c860', '#7a3e10'], 1.6); A.sfx('crunch');
  for (const d of [-1, 0, 1]){ const c = spawnEnemy('crumbit', cx - 4 + d * 6, e.y + 4); c.vy = -3 - Math.abs(d) * 0.4; c.vx = d * 1.2; c.facing = d || (P.x < cx ? -1 : 1); c.hopT = 30 + (d + 1) * 8; c.onGround = false; }
}
function ghostDown(e){ // a Toast Ghost comes back once
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (!e.back){ e.state = 'gone'; e.t = 130; e.hp = 99; e.vx = 0; e.vy = 0; burst(cx, cy, 10, ['#f2ecd6', '#ffffff', '#c8bfa4'], 1.6); popup(e.x - 4, e.y - 10, '...', '#f2ecd6'); A.sfx('ghost'); return; }
  e.remove = true; burst(cx, cy, 14, ['#bff6ff', DIN.C, DIN.M, '#ffffff'], 2); addScore(400, e.x, e.y - 8);
}
// Rye Knight shields: shots from the front are blocked for the knight and anyone right behind it. Explosions and stomps get through.
function dinerBlock(e, kb, src){
  if (e.type === 'ghost' && e.state === 'gone') return true;
  if (!src || src.boom || src.stomp) return false;
  const dir = Math.sign(src.vx || kb || 0); if (!dir) return false;
  for (const k of enemies){
    if (k.type !== 'knight' || k.dead || k.remove || k.shield <= 0 || k.state === 'tele') continue;
    if (Math.abs((k.y + k.h) - (e.y + e.h)) > 18 || dir !== -k.facing) continue;
    const behind = (e.x + e.w / 2 - (k.x + k.w / 2)) * -k.facing; // 0 = the knight itself, >0 behind its back
    if (e !== k && (behind < 0 || behind > 44)) continue;
    k.shield -= src.melee ? 2 : 1; k.hitT = 4; A.sfx('clang'); burst(k.x + (k.facing > 0 ? k.w + 2 : -2), k.y + 9, 4, [DIN.Y, '#ffffff', DIN.TOAST], 1.2, 10);
    if (k.shield <= 0){ popup(k.x - 10, k.y - 12, 'SHIELD CRUMBLED', DIN.Y); burst(k.x + 6, k.y + 8, 10, ['#b8742a', DIN.TOAST2, DIN.Y], 1.8); A.sfx('crunch'); }
    else if (e !== k) popup(k.x - 6, k.y - 12, 'GUARDED', DIN.Y);
    return true;
  }
  return false;
}
function dinerDeath(e, src){ // before killFlip; true = handled
  if (e.type === 'ghost'){ ghostDown(e); G.kills++; return true; }
  if (e.type === 'bagel'){ bagelBoom(e, 'p'); G.kills++; addScore(200, e.x, e.y - 8); return true; }
  if (e.type === 'fusebox'){ fuseBlown(e); return true; }
  if (e.type === 'reflect'){ e.remove = true; burst(e.x + 6, e.y + 7, 12, [DIN.C, DIN.M, '#ffffff'], 1.8); popup(e.x - 10, e.y - 10, 'NOT YOU', DIN.M); return true; }
  return false;
}
function dinerKill(e){ if (e.type === 'crouton') croutonSplit(e); if (e.type === 'cook'){ const it = spawnItem('ammo', e.x, e.y - 4); it.emerge = 0; it.vy = -3; } }
// ---- THE FUSE BOX (mini-boss): sparks, and while it lives the picture flips left/right on a timer ----
const FLIP_PER = 400, FLIP_ON = 150, FLIP_WARN = 60;
function updateFuseBox(e, dx, dy){
  e.vx = 0; e.vy = 0; e.facing = -1;
  const engaged = !P.dead && Math.abs(dx) < 230 && e.x < camX + W + 8;
  if (!engaged){ G.flipped = false; G.flipWarn = false; return; }
  if (!e.met){ e.met = true; popup(e.x - 40, e.y - 16, 'THE FUSE BOX', DIN.Y).long = true; A.sfx('alarm'); }
  e.flipT++; const t = e.flipT % FLIP_PER;
  G.flipWarn = (t >= FLIP_ON - FLIP_WARN && t < FLIP_ON) || t >= FLIP_PER - 24;
  const was = G.flipped; G.flipped = t >= FLIP_ON;
  if (was !== G.flipped){ A.sfx('flip'); G.flash = 6; G.flips = (G.flips || 0) + (G.flipped ? 1 : 0); }
  if (--e.cool <= 0){ e.cool = e.hp <= 10 ? 70 : 100;
    fireBolt(e.x + 2, e.y + e.h - 7, Math.PI, e.hp <= 10 ? 1.25 : 1.05); bolts[bolts.length - 1].fuse = true; A.sfx('bolt'); } // low sparks along the floor: hop them
  if (G.frame % 5 === 0) parts.push({ x: e.x + 4 + Math.random() * 20, y: e.y + 18 + Math.random() * 10, vx: (Math.random() - 0.5) * 1.5, vy: -1 - Math.random(), g: 0.1, life: 14, color: Math.random() < 0.5 ? DIN.Y : '#ffffff', size: 1 });
}
function fuseBlown(e){
  e.dead = 'squash'; e.t = 60; G.flipped = false; G.flipWarn = false; G.fuseBlown = true; G.kills++;
  addScore(3000, e.x, e.y - 12); G.bigText = { text: 'FUSE BLOWN!', t: 0 }; G.shake = 12; A.sfx('powerdown');
  for (let i = 0; i < 5; i++) boom(e.x + 14 + (i - 2) * 6, e.y + 8 + i * 6, 16, { power: 0, dmg: 0, owner: 'p', delay: i * 4 });
  const gt = e.gate; if (gt){ let d = 0; for (let tx = gt.x0; tx <= gt.x1; tx++) for (let ty = gt.y0; ty <= gt.y1; ty++){ if (lv.t[ty][tx] !== '.'){ lv.t[ty][tx] = '.'; if ((tx + ty) % 3 === 0) boom(tx * TS + 8, ty * TS + 8, 12, { power: 0, dmg: 0, owner: 'p', delay: 10 + d++ * 2 }); } } }
}
// ---- Reflections (boss phase 3): mirror copies of the current bro ----
function updateReflection(e){
  const b = BOSS, cx = b ? (b.spec.bounds[0] * TS + (b.spec.bounds[1] + 1) * TS) / 2 : e.x;
  e.t++;
  const tx = 2 * cx - (P.x + P.w / 2) - e.w / 2 + (e.off || 0), ty = P.y + P.h - e.h;
  e.x += Math.max(-1.8, Math.min(1.8, tx - e.x)) * (e.t < 30 ? 0.3 : 1); e.y += (ty - e.y) * 0.25; e.facing = -P.facing;
  if (b){ e.x = Math.max(b.spec.bounds[0] * TS + 2, Math.min((b.spec.bounds[1] + 1) * TS - e.w - 2, e.x)); }
  if (e.t > 720 || !b || b.dying || b.dead){ e.remove = true; burst(e.x + 6, e.y + 7, 10, [DIN.C, DIN.M], 1.4); }
}
// ---- hazards: mold patches drain you, card zap columns ----
function dinerUpdate(){
  if (G.freezeT > 0){ G.freezeT--; if (G.freezeT === 0) popup(P.x - 16, P.y - 14, 'ORDER UP!', DIN.Y); }
  for (const m of molds){ m.t++; if (m.t > m.life - 120){ const k = 1 - (m.t - (m.life - 120)) / 120; const nw = Math.max(0, 24 * k); m.x += (m.w - nw) / 2; m.w = nw; } }
  molds = molds.filter(m => m.t < m.life && m.w > 2);
  for (const ts of lv.toasters || []){
    const x = ts.tx * TS + 8, t = cyc(G.lf, ts.phase, ts.period);
    ts.warn = t > ts.period - 36;
    if (t === 0 && Math.abs(x - (P.x + 6)) < 150 && Math.abs(x - (P.x + 6)) > 30 && enemies.filter(e => e.type === 'popper' && e.from === ts && !e.dead).length < 2 && G.freezeT <= 0){
      const e = spawnEnemy('popper', ts.tx * TS + 3, ts.ty * TS - 13); e.from = ts; e.state = 'air'; e.vy = -6; e.facing = P.x < x ? -1 : 1; e.vx = 0.9 * e.facing; e.t = 0; A.sfx('boing'); burst(x, ts.ty * TS, 6, ['#ff7a2a', DIN.Y], 1.2);
    }
  }
}
function dinerHazards(){
  if (P.ctrl !== 'normal' || P.dead) return;
  // mold: slows you down; stand in it too long and it drains a hit
  let inMold = false;
  if (P.onGround) for (const m of molds) if (P.x + P.w > m.x + 2 && P.x < m.x + m.w - 2 && Math.abs(P.y + P.h - m.y) < 2) inMold = true;
  if (inMold){ P.vx = Math.max(-0.85, Math.min(0.85, P.vx)); P.moldT = (P.moldT || 0) + 1; if (P.moldT % 10 === 0) parts.push({ x: P.x + 6, y: P.y + P.h - 2, vx: 0, vy: -0.3, g: -0.01, life: 14, color: DIN.MOLD, size: 1 }); if (P.moldT >= 55){ P.moldT = 0; popup(P.x - 12, P.y - 14, 'MOLDY!', DIN.MOLD); hurt(); } }
  else P.moldT = 0;
  // boss: card zap columns
  const b = BOSS; if (b && b.kind === 'repairman' && b.cards){
    for (const c of b.cards){ if (c.state === 'zap' && P.x + P.w > c.x && P.x < c.x + 10 && P.y + P.h > c.y - 60){ hurt(); return; } }
  }
}
// ---- drawing ----
function drawDinerEnemy(e, X){
  const D = S.diner; if (!D || !DINER_TYPES.has(e.type)) return false;
  const Y = Math.round(e.y), side = e.facing > 0 ? 'R' : 'L', f = (e.anim >> 3) & 1;
  let img = null, ox = -2, oy = 0, rgb = false;
  switch (e.type){
    case 'rat': img = e.dead === 'squash' ? D.ratSq : D.rat[side][(e.anim >> 2) & 1]; ox = -1; oy = e.h - 10; break;
    case 'crouton': img = D.crouton[side][e.onGround ? 0 : 1]; ox = -1; oy = e.h - 13; break;
    case 'crumbit': img = D.crumbit[side][e.onGround ? 0 : 1]; ox = 0; oy = e.h - 8; break;
    case 'mold': img = D.mold[side][(e.anim >> 4) & 1]; ox = -1; oy = e.h - 13; break;
    case 'popper': img = D.popper[side][e.state === 'air' ? 1 : 0]; ox = -1; oy = e.h - 14; break;
    case 'ghost':
      if (e.state === 'gone'){ if ((G.frame >> 2) % 2){ g.globalAlpha = 0.25; g.drawImage(D.ghost[side][0], X, Y - 2); g.globalAlpha = 1; } drawTiny(g, String(Math.ceil(e.t / 30)), X + 5, Y - 8, '#f2ecd6'); return true; }
      img = (e.back ? D.ghostBack : D.ghost)[side][f]; ox = -1; oy = -2; g.globalAlpha = 0.78; rgb = !!e.back; break;
    case 'knight': img = (e.shield > 0 ? D.knight : D.knightBare)[side][(e.anim >> 4) & 1]; ox = e.facing > 0 ? -2 : -2; oy = e.h - 17; break;
    case 'slice':
      if (e.state === 'tele' && (G.frame >> 1) % 2){ g.globalAlpha = 0.5; drawStatic(Math.round(e.tx - camX), Math.round(e.ty), 12, 14, e.t); g.globalAlpha = 1; }
      drawStatic(X + 2, Y, 12, 14, e.anim, true); rgb = true; img = null; break;
    case 'bagel': img = D.bagel[side][(G.frame >> 2) & 1]; ox = -1; oy = -1; if (e.state === 'aim' && (G.frame >> 1) % 2) g.filter = 'brightness(1.8)'; break;
    case 'cook': img = D.cook[side][(e.anim >> 3) & 1]; ox = -2; oy = e.h - 16; break;
    case 'fusebox': img = e.dead === 'squash' ? D.fuseHurt : (e.hitT > 0 ? D.fuseHurt : D.fuse[(G.frame >> 3) & 1]); ox = -2; oy = -1;
      if (e.dead === 'squash'){ g.globalAlpha = Math.max(0, e.t / 60); } break;
    case 'reflect': {
      const fr = broFrame(P.bro, P.onGround ? ((P.anim >> 3) % 2 ? 'run1' : 'stand') : 'jump', e.facing < 0);
      g.globalAlpha = 0.45; g.drawImage(tinted(fr, DIN.M), X - 1, Y - 1); g.drawImage(tinted(fr, DIN.C), X + 1, Y - 1); g.globalAlpha = 0.85; g.drawImage(fr, X, Y - 1); g.globalAlpha = 1;
      if ((G.frame >> 2) % 3 === 0){ g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(X - 2, Y + ((G.frame >> 1) % 15), 18, 1); }
      return true; }
  }
  if (img){
    if (e.dead === 'flip'){ g.save(); g.translate(X + ox, Y + oy + img.height); g.scale(1, -1); g.drawImage(img, 0, 0); g.restore(); }
    else { if (rgb){ const a = g.globalAlpha; g.globalAlpha = a * 0.5; g.drawImage(tinted(img, DIN.M), X + ox - 1, Y + oy); g.drawImage(tinted(img, DIN.C), X + ox + 1, Y + oy); g.globalAlpha = a; } g.drawImage(img, X + ox, Y + oy); }
  }
  g.globalAlpha = 1; g.filter = 'none';
  if (e.type === 'cook' && e.state === 'aim' && (G.frame >> 1) % 2){ g.fillStyle = 'rgba(255,212,0,0.7)'; const sx = e.facing > 0 ? X + 14 : X - 2; g.fillRect(e.facing > 0 ? sx : sx - 110, Y + 9, 110, 1); }
  if (e.type === 'knight' && e.shield > 0 && e.hitT > 0){ g.fillStyle = '#ffffff'; g.fillRect(e.facing > 0 ? X + 12 : X - 3, Y + 3, 2, 12); }
  return true;
}
function drawStatic(X, Y, w, h, seed, slice){ // TV-static slice of toast
  const r = rng(seed * 31 + 7);
  if (slice){ g.fillStyle = DIN.V; g.fillRect(X - 1, Y - 1, w + 2, h + 2); g.fillStyle = DIN.V; }
  for (let j = 0; j < h; j += 2) for (let i = 0; i < w; i += 2){ const v = r(); g.fillStyle = v < 0.4 ? '#20242c' : v < 0.75 ? '#8e98a6' : v < 0.9 ? '#eef4fa' : (v < 0.95 ? DIN.C : DIN.M); g.fillRect(X + i, Y + j, 2, 2); }
  if (slice){ g.fillStyle = DIN.V; g.fillRect(X + 2, Y + 4, 3, 3); g.fillRect(X + 7, Y + 4, 3, 3); g.fillStyle = '#ffffff'; g.fillRect(X + 3, Y + 5, 1, 1); g.fillRect(X + 8, Y + 5, 1, 1); g.fillStyle = DIN.CRUST; g.fillRect(X - 1, Y - 1, w + 2, 1); g.fillRect(X - 1, Y - 1, 1, h + 2); g.fillRect(X + w, Y - 1, 1, h + 2); }
}
function drawDinerHazards(){
  if (!inDiner()) return;
  for (const m of molds){ const X = Math.round(m.x - camX); if (X > W || X + m.w < 0) continue; const a = Math.min(1, (m.life - m.t) / 60);
    g.globalAlpha = 0.9 * a; g.fillStyle = DIN.MOLD2; g.fillRect(X, m.y - 3, m.w, 3); g.fillStyle = DIN.MOLD; g.fillRect(X + 1, m.y - 3, m.w - 2, 2); g.fillStyle = '#a8c890'; for (let i = 2; i < m.w - 2; i += 5) g.fillRect(X + i, m.y - 4 - ((i + (G.frame >> 4)) % 2), 2, 1); g.globalAlpha = 1; }
  for (const pt of patches) if (pt.kind === 'grease'){ const X = Math.round(pt.x - camX); if (X > W || X + pt.w < 0) continue; g.fillStyle = DIN.GREASE2; g.fillRect(X - 1, pt.y - 2, pt.w + 2, 2); g.fillStyle = DIN.GREASE; g.fillRect(X, pt.y - 2, pt.w, 1); g.fillStyle = '#ffe08a'; for (let i = 3 + ((G.frame >> 3) % 5); i < pt.w - 2; i += 9) g.fillRect(X + i, pt.y - 2, 2, 1); }
  for (const ts of lv.toasters || []){ if (!ts.warn) continue; const X = Math.round(ts.tx * TS - camX); if (X < -16 || X > W) continue; g.globalAlpha = 0.35 + 0.25 * ((G.frame >> 2) & 1); g.fillStyle = '#ff7a2a'; g.fillRect(X + 2, ts.ty * TS - 4, 12, 4); g.globalAlpha = 1; }
  for (const b of bolts){ if (b.kind === 'wrench'){ const X = Math.round(b.x - camX), Y = Math.round(b.y); g.save(); g.translate(X + 7, Y + 4); g.rotate(Math.floor(b.t / 3) * Math.PI / 4 * Math.sign(b.vx0 || 1)); g.drawImage(S.diner.wrench, -7, -4); g.restore(); } }
  if (G.freezeT > 0){ for (const e of enemies){ if (e.dead) continue; const X = Math.round(e.x - camX); if (X < -16 || X > W) continue; g.fillStyle = 'rgba(0,237,255,0.35)'; g.fillRect(X - 1, Math.round(e.y) - 1, e.w + 2, e.h + 2); } }
}
function drawBasket(pl){ // fryer basket: wire mesh, long handle
  const X = Math.round(pl.x - camX), Y = Math.round(pl.y); if (X > W || X + pl.w < 0) return;
  g.fillStyle = '#05070d'; g.fillRect(X, Y, pl.w, 9); g.fillStyle = '#8e98a6'; g.fillRect(X + 1, Y + 1, pl.w - 2, 7); g.fillStyle = '#eef4fa'; g.fillRect(X + 1, Y + 1, pl.w - 2, 1);
  g.fillStyle = '#3a4048'; for (let i = 3; i < pl.w - 2; i += 3) g.fillRect(X + i, Y + 2, 1, 6); for (let j = Y + 4; j < Y + 8; j += 3) g.fillRect(X + 1, j, pl.w - 2, 1);
  g.fillStyle = '#c8142a'; g.fillRect(X + pl.w / 2 - 1, Y - 20, 2, 20); g.fillRect(X + pl.w / 2 - 3, Y - 22, 6, 3);
  if (G.frame % 6 === 0 && pl.y > pl.y0 - 8) parts.push({ x: pl.x + Math.random() * pl.w, y: pl.y + 9, vx: 0, vy: -0.4, g: -0.01, life: 12, color: Math.random() < 0.5 ? '#ffe08a' : '#c89a2a', size: 1 });
}
function drawCardPlat(pl){
  const X = Math.round(pl.x + 4 - camX), Y = Math.round(pl.y); if (X > W || X + 32 < 0) return; // collision box overhangs the art by 4px a side (forgiving landings)
  const st = cardState(pl.card);
  g.fillStyle = '#05070d'; g.globalAlpha = 0.6; g.fillRect(X + 15, Y + 22, 2, Math.max(0, 13 * TS - Y - 22)); g.globalAlpha = 1;
  if (!st.solid && !st.k){ g.globalAlpha = 0.4; drawBigCard(g, X, Y, false, 0, st.warn, G.frame, pl.card.suit); g.globalAlpha = 1;
    if ((G.frame >> 2) % 2){ g.globalAlpha = 0.3; g.drawImage(buf, X, Y, 32, 22, X + 2, Y, 32, 22); g.globalAlpha = 1; } return; }
  drawBigCard(g, X, Y, st.up, st.k, st.warn, G.frame, pl.card.suit);
  if (st.warn || st.k){ g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; g.fillStyle = DIN.M; g.fillRect(X - 2, Y, 3, 22); g.fillStyle = DIN.C; g.fillRect(X + 31, Y, 3, 22); g.restore(); }
}
// ---- post-fx: lo-fi bloom, flicker darkness, scanlines, glitch, and the Fuse Box mirror ----
let darkC = null, flipC = null;
function dinerPostFx(){
  if (!inDiner()) return;
  if (!bloomC){ bloomC = mkCanvas(W / 2, H / 2); scanC = mkCanvas(W, H); const sx = scanC.getContext('2d'); sx.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < H; y += 2) sx.fillRect(0, y, W, 1); }
  const bx = bloomC.getContext('2d'); bx.clearRect(0, 0, W / 2, H / 2); bx.drawImage(buf, 0, 0, W / 2, H / 2);
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.16; g.filter = 'blur(2px)'; g.drawImage(bloomC, 0, 0, W, H); g.restore();
  // fluorescent flicker: the room drops dark, a little light stays around the bro and the neon
  const dk = flickerDark(G.lf);
  if (dk > 0 && P){
    if (!darkC) darkC = mkCanvas(W, H);
    const d = darkC.getContext('2d'); d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, W, H); d.fillStyle = 'rgba(5,7,13,' + (0.84 * dk).toFixed(2) + ')'; d.fillRect(0, 0, W, H);
    d.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a) => { const gr = d.createRadialGradient(x, y, 2, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,' + a + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = gr; d.fillRect(x - r, y - r, r * 2, r * 2); };
    hole(P.x - camX + 6, P.y + 8, 58, 1);
    for (const dd of lv.decor){ if (dd.kind === 'neon24' || dd.kind === 'jukebox' || dd.kind === 'crumbomat'){ const x = dd.tx * TS - camX + 30; if (x > -60 && x < W + 60) hole(x, dd.row * TS - 40, 50, 0.8); } }
    for (const e of enemies){ if (e.dead) continue; const x = e.x - camX + e.w / 2; if (x > -10 && x < W + 10) hole(x, e.y + 4, 10, 0.5); }
    g.drawImage(darkC, 0, 0);
    for (const e of enemies){ if (e.dead || e.type === 'fusebox') continue; const x = Math.round(e.x - camX + e.w / 2); if (x < 0 || x > W) continue; g.fillStyle = DIN.R; g.fillRect(x - 3, Math.round(e.y) + 4, 2, 1); g.fillRect(x + 1, Math.round(e.y) + 4, 2, 1); } // eyes in the dark
    if (lv.flicker && cyc(G.lf, 0, lv.flicker.period) === lv.flicker.period - lv.flicker.dark) sfxOnce('buzz');
  }
  // occasional RGB-split glitch band
  const gl = (G.frame % 300) < 6 ? 2 : (G.flipWarn ? 3 : 0);
  if (gl){ const r = rng(G.frame * 17 + 3); for (let i = 0; i < gl; i++){ const y = (r() * (H - 12)) | 0, h = 2 + ((r() * 8) | 0), dx = ((r() - 0.5) * 10) | 0; g.drawImage(buf, 0, y, W, h, dx, y, W, h); g.fillStyle = r() < 0.5 ? 'rgba(255,55,207,0.25)' : 'rgba(0,237,255,0.25)'; g.fillRect(0, y, W, 1); } }
  g.drawImage(scanC, 0, 0);
  // tape hiss shimmer
  if (G.frame % 3 === 0){ const r = rng(G.frame); g.fillStyle = 'rgba(242,236,214,0.05)'; for (let i = 0; i < 40; i++) g.fillRect((r() * W) | 0, (r() * H) | 0, 1, 1); }
  const vg = g.createRadialGradient(W / 2, H / 2, 70, W / 2, H / 2, 190); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(5,7,13,0.45)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // the Fuse Box flips the picture (controls stay put)
  if (G.flipped){ if (!flipC) flipC = mkCanvas(W, H); const fx = flipC.getContext('2d'); fx.clearRect(0, 0, W, H); fx.drawImage(buf, 0, 0); g.save(); g.translate(W, 0); g.scale(-1, 1); g.drawImage(flipC, 0, 0); g.restore();
    g.globalAlpha = 0.12; g.fillStyle = DIN.M; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  if (G.flipWarn && (G.frame >> 3) % 2) drawTextC(g, G.flipped ? 'UNFLIP!' : 'FLIP!', 128, 40, DIN.Y, 2, '#000');
  if (G.flipped) drawTextC(g, 'PICTURE FLIPPED: CONTROLS DID NOT', 128, 226, DIN.C, 1, '#000');
  if (G.freezeT > 0){ g.fillStyle = 'rgba(0,237,255,0.08)'; g.fillRect(0, 0, W, H); if ((G.frame >> 3) % 2) drawTextC(g, 'DING! ORDER FROZEN', 128, 40, DIN.C, 1, '#000'); }
}

// ---------------- THE REPAIRMAN: CAL'S EVIL RERUN (World 4 boss) ----------------
// A static clone of Cal off a rerun tape (the real Cal was on break). Phase 1: wrenches + face-down cards that flip into
// zap columns. Phase 2 "THE LEAN" (HP <= 6): faster, double attacks. Phase 3 "IT'S YOU" (HP <= 3): spawns Reflections.
function makeRepairman(spec){
  const deck = spec.deckRow * TS;
  spec.baseLine1 = spec.baseLine1 || spec.line1; spec.baseLine2 = spec.baseLine2 || spec.line2;
  return { kind: 'repairman', spec, deck, x: spec.tx * TS, y: deck - 46, w: 22, h: 46, vx: 0, vy: 0, hp: 9, flash: 0, state: 'dormant', t: 0, n: 0, dir: -1,
    active: false, dying: false, dead: false, dt: 0, by: null, phase: 1, cyc: 0, cards: [], chip: 0, onGround: true, pose: 'idle', reflT: 0 };
}
function calDamage(src){
  const b = BOSS; if (!b || b.dying || b.dead || b.flash > 0) return;
  b.hp--; b.flash = 50; G.shake = 9; A.sfx('bosshit'); b.pose = 'hurt';
  burst(b.x + b.w / 2, b.y + 10, 16, ['#ffffff', '#8e98a6', DIN.C, DIN.M], 2.4);
  if (b.hp <= 0){ calDie(src); return; }
  popup(b.x - 4, b.y - 12, 'HP ' + b.hp, DIN.C);
  if (b.hp <= 6 && b.phase === 1){ b.phase = 2; b.state = 'idle'; b.t = 0; G.bigText = { text: 'THE LEAN', t: 0 }; A.sfx('curse'); A.setTempo(1.15); }
  else if (b.hp <= 3 && b.phase === 2){ b.phase = 3; b.state = 'idle'; b.t = 0; b.reflT = 20; G.bigText = { text: "IT'S YOU", t: 0 }; G.itsYou = true; A.sfx('curse'); A.setTempo(1.3); }
}
function calDie(by){
  const b = BOSS; b.dying = true; b.by = by; b.dt = 0; b.cards = []; A.stopMusic(); A.sfx('powerdown'); addScore(5000, b.x, b.y - 18);
  bolts.forEach(o => o.remove = true); for (const e of enemies) if (e.type === 'reflect') e.remove = true;
  G.bigText = { text: 'CANCELLED', t: 0 }; G.rerunCancelled = true;
}
function calWrench(b, high){
  const pdx = (P.x + P.w / 2) - (b.x + b.w / 2), dir = pdx < 0 ? -1 : 1, spd = b.phase >= 2 ? 2.5 : 2.1;
  bolts.push({ kind: 'wrench', x: b.x + (dir > 0 ? b.w : -14), y: high ? b.deck - 44 : b.deck - 11, w: 12, h: 7, vx: dir * spd, vx0: dir * spd, vy: 0, t: 0, x0: b.x, back: false, high, spin: 0 });
  b.pose = 'throw'; b.poseT = 14; A.sfx('whoosh');
}
function calCards(b, n){ // face-down cards slide out and stop; some flip into zap columns
  const ax0 = b.spec.bounds[0] * TS + 6, ax1 = b.x - 14, pcx = P.x + P.w / 2;
  const spots = []; const base = Math.max(ax0, Math.min(ax1, pcx - 4));
  for (let i = 0; i < n; i++){ spots.push(Math.max(ax0, Math.min(ax1, base + (i - (n - 1) / 2) * 50))); }
  for (let i = 1; i < spots.length; i++) if (spots[i] - spots[i - 1] < 40) spots[i] = Math.min(ax1, spots[i - 1] + 40);
  const dud = Math.floor(G.lf / 7) % n;
  spots.forEach((sx, i) => b.cards.push({ x: b.x, y: b.deck - 14, tx: sx, state: 'slide', t: 0, zap: i !== dud || n === 1, w: 10, h: 14 }));
  b.pose = 'throw'; b.poseT = 16; A.sfx('cardflip');
}
function updateRepairman(){
  const b = BOSS, [bx0, bx1] = b.spec.bounds, ax0 = bx0 * TS, ax1 = (bx1 + 1) * TS, deck = b.deck, pcx = P.x + P.w / 2;
  if (!G.dialogDone){ const cal = P && P.bro === 'cal'; b.spec.line1 = cal ? b.spec.calLine1 : b.spec.baseLine1; b.spec.line2 = cal ? b.spec.calLine2 : b.spec.baseLine2; }
  if (b.flash > 0) b.flash--; if (b.poseT > 0 && --b.poseT === 0) b.pose = 'idle'; if (b.flash === 0 && b.pose === 'hurt') b.pose = 'idle';
  // wrenches: boomerang out ~120px, then come back to his hand
  for (const o of bolts){ if (o.kind !== 'wrench' || o.mine) continue; o.t++;
    if (!o.back && Math.abs(o.x - o.x0) > 118){ o.back = true; }
    if (o.back){ o.vx += -Math.sign(o.vx0) * 0.12; o.vx = Math.max(-2.8, Math.min(2.8, o.vx)); }
    o.x += o.vx; if (o.t % 6 === 0) A.sfx('whir');
    if ((o.back && Math.sign(o.vx) !== Math.sign(o.vx0) && Math.abs(o.x - (b.x + b.w / 2)) < 10) || o.t > 260 || o.x < ax0 - 16 || o.x > ax1 + 16) o.remove = true; }
  for (const c of b.cards){ c.t++;
    if (c.state === 'slide'){ c.x += (c.tx - c.x) * 0.12; if (Math.abs(c.x - c.tx) < 1){ c.x = c.tx; c.state = 'down'; c.t = 0; } }
    else if (c.state === 'down'){ if (c.t > (b.phase >= 2 ? 50 : 66)){ c.state = c.zap ? 'zap' : 'dud'; c.t = 0; if (c.zap) A.sfx('zapcol'); else popup(c.x - 6, c.y - 10, 'DUD', DIN.CR); } }
    else if (c.state === 'zap'){ if (c.t > 42) c.remove = true; }
    else if (c.state === 'dud'){ if (c.t > 30) c.remove = true; } }
  b.cards = b.cards.filter(c => !c.remove);
  if (b.dying){
    b.dt++; b.vx = 0;
    if (b.dt % 4 === 0) burst(b.x + Math.random() * b.w, b.y + Math.random() * 20, 3, ['#ffffff', '#8e98a6', DIN.C, DIN.M], 2.4, 30);
    if (b.dt % 18 === 0) boom(b.x + Math.random() * b.w, b.y + 6 + Math.random() * 30, 14, { power: 0, dmg: 0, owner: 'fx' });
    if (b.dt > 220){ b.dead = true; b.active = false; if (lv.escapeWall) startEscape(); else { G.castleEnd = true; G.endT = 0; A.sfx('clear'); } }
    return;
  }
  if (!b.active) return;
  const sp = b.phase >= 2 ? 1.4 : 1;
  b.t++;
  // phase 3: keep up to two Reflections of the current bro in the arena
  if (b.phase === 3 && --b.reflT <= 0){ const n = enemies.filter(e => e.type === 'reflect' && !e.dead && !e.remove).length; b.reflT = 330;
    if (n < 2){ const cx = (ax0 + ax1) / 2, e = spawnEnemy('reflect', 2 * cx - pcx - 6, P.y); e.t = 0; e.off = n ? 18 : 0; burst(e.x + 6, e.y + 7, 14, [DIN.C, DIN.M, '#ffffff'], 2); popup(Math.max(camX + 2, Math.min(camX + W - 68, e.x - 14)), e.y - 14, "IT'S YOU", DIN.M); A.sfx('static'); } }
  switch (b.state){
    case 'idle': b.vx = 0; if (b.t > 40 / sp){ b.cyc++; const pick = b.cyc % 3; b.state = pick === 1 ? 'cards' : pick === 2 ? 'walk' : 'wrench'; b.t = 0; b.n = 0; } break;
    case 'wrench': b.vx = 0;
      if (b.t === 10) calWrench(b, b.cyc % 2 === 0 && b.phase >= 2 ? true : false);
      if (b.phase >= 2 && b.t === 10 + Math.round(34 / sp)) calWrench(b, b.cyc % 2 !== 0);
      if (b.t > 90) { b.state = 'idle'; b.t = 0; } break;
    case 'cards': b.vx = 0;
      if (b.t === 12) calCards(b, 3);
      if (b.phase >= 2 && b.t === 70) calCards(b, 2);
      if (b.t > (b.phase >= 2 ? 150 : 120)){ b.state = 'idle'; b.t = 0; } break;
    case 'walk': { // The Lean: he leans in and shuffles toward you, then back to his bench
      const goal = b.n === 0 ? Math.max(ax0 + 60, Math.min(ax1 - 30, pcx + 46)) : ax1 - b.w - 22;
      b.vx = Math.sign(goal - b.x) * 0.7 * sp; if (Math.abs(goal - b.x) < 2){ b.vx = 0; b.n++; if (b.n > 1){ b.state = 'idle'; b.t = 0; } }
      if (b.t > 260){ b.state = 'idle'; b.t = 0; } break; }
  }
  b.x += b.vx; b.x = Math.max(ax0 + 40, Math.min(ax1 - b.w - 4, b.x)); b.dir = pcx < b.x + b.w / 2 ? -1 : 1;
  if (P.ctrl === 'normal' && !P.dead && overlap(P, { x: b.x + 3, y: b.y + 4, w: b.w - 6, h: b.h - 4 })){ if (P.star > 0){ if (!b.flash) calDamage('star'); } else hurt(); }
}
function drawRepairman(){
  const b = BOSS; if (!b || b.dead) return;
  const X = Math.round(b.x - camX) - 5, Y = Math.round(b.y) - 2, D = S.diner;
  for (const c of b.cards){ const cx = Math.round(c.x - camX), cy = Math.round(c.y);
    if (c.state === 'zap'){ const r = rng(G.frame * 5 + cx); g.globalAlpha = 0.85; for (let y = cy + 14; y > cy - 60; y -= 3){ g.fillStyle = r() < 0.4 ? '#ffffff' : r() < 0.7 ? DIN.C : DIN.M; g.fillRect(cx + 2 + ((r() * 6) | 0) - 1, y, 6, 3); } g.globalAlpha = 0.2; g.fillStyle = DIN.C; g.fillRect(cx - 3, cy - 60, 16, 74); g.globalAlpha = 1; g.drawImage(D.cardZapS, cx, cy); }
    else if (c.state === 'dud') g.drawImage(D.cardDudS, cx, cy);
    else { const warn = c.state === 'down' && c.t > (b.phase >= 2 ? 30 : 44); g.drawImage(D.cardBackS, cx + (warn ? ((G.frame & 1) ? 1 : -1) : 0), cy); if (warn && (G.frame >> 2) % 2){ g.fillStyle = 'rgba(255,55,207,0.5)'; g.fillRect(cx + 4, cy - 50, 2, 50); } } }
  if (b.flash > 0 && (G.frame & 2)) g.filter = 'brightness(2.2)';
  const left = b.dir < 0, img = (b.pose === 'throw' ? D.cal.throw : D.cal.idle);
  const lean = (b.phase >= 2 && !b.dying) ? (left ? -0.18 : 0.18) : 0;
  g.save(); g.translate(X + 16, Y + 48); if (lean) g.rotate(lean + Math.sin(G.frame * 0.1) * 0.03); if (left){ g.scale(-1, 1); }
  if (b.phase === 3 && !b.dying){ g.globalAlpha = 0.5; g.drawImage(tinted(img, DIN.M), -17, -48); g.drawImage(tinted(img, DIN.C), -15, -48); g.globalAlpha = 1; }
  g.drawImage(img, -16, -48);
  const mode = b.dying ? 'off' : b.pose === 'hurt' ? 'hurt' : b.phase === 3 ? 'you' : b.phase === 2 ? 'lean' : 'smirk';
  g.scale(left ? -1 : 1, 1); // the face reads the right way round
  drawCalFace(g, -10, -45, mode, G.frame, P ? broFrame(P.bro, 'stand') : null);
  g.restore(); g.filter = 'none';
  if (b.dying && (G.frame >> 2) % 2){ g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(X + 6, Y + 3, 20, 14); }
  if (G.dialog) drawTextC(g, "THE REPAIRMAN: CAL'S EVIL RERUN", 128, 138, (G.frame >> 3) % 2 ? DIN.C : DIN.M, 1, '#000');
  if (G.dialogDone && !b.dying){ g.fillStyle = '#000'; g.fillRect(70, 26, 116, 6); g.fillStyle = b.phase === 3 ? DIN.M : b.phase === 2 ? DIN.Y : DIN.C; g.fillRect(71, 27, Math.round(114 * b.hp / 9), 4); drawTextC(g, 'CAL (RERUN)', 128, 34, '#ffffff', 1, '#000'); }
}
function botCal(b, grounded, feet){
  const p = P, B = BOSS, px = p.x + p.w / 2, ax0 = B.spec.bounds[0] * TS, cx = (ax0 + (B.spec.bounds[1] + 1) * TS) / 2;
  b.right = false; b.left = false; b.run = false;
  if (B.dead || B.dying){ botJump(b, false); return; }
  const range = BOT_RANGE[BROS[p.bro].weapon.kind] || 60, front = B.x;
  let goal = Math.max(ax0 + 14, Math.min(front - 40, front - Math.min(range, 120) + 6));
  if (B.phase === 3) goal = Math.min(goal, cx - 26); // stay left of centre: the Reflections mirror you onto Cal's side, into your line of fire
  // stay out of card columns that are about to zap or zapping
  const bad = x => B.cards.some(c => (c.state === 'zap' || c.state === 'slide' || c.state === 'down') && x + 8 > (c.state === 'slide' ? c.tx : c.x) && x - 8 < (c.state === 'slide' ? c.tx : c.x) + 10);
  if (bad(goal)){ for (let d = 8; d < 160; d += 6){ if (!bad(goal - d) && goal - d > ax0 + 8){ goal -= d; break; } if (!bad(goal + d) && goal + d < front - 24){ goal += d; break; } } }
  if (bad(px)){ let best = null; for (let d = 3; d < 120; d += 3){ for (const s of [-1, 1]){ const x = px + s * d; if (x > ax0 + 8 && x < front - 20 && !bad(x)){ best = x; break; } } if (best !== null) break; } if (best !== null) goal = best; }
  if (px < goal - 2) b.right = true; else if (px > goal + 2) b.left = true;
  if (Math.abs(px - goal) > 24 || bad(px)) b.run = true;
  if (!b.left && !b.right && p.facing < 0 && G.frame % 6 === 0) b.right = true;
  let want = false;
  for (const o of bolts){ if (o.mine || o.kind !== 'wrench' || o.high) continue; const d = (o.x + 6) - px, closing = Math.sign(-d) === Math.sign(o.vx) || Math.abs(d) < 10; if (closing && Math.abs(d) < 22 + Math.abs(o.vx) * 5) want = true; }
  for (const e of enemies){ if (e.type === 'reflect' && !e.dead && Math.abs(e.x + 6 - px) < 30){ if (e.x + 6 > px){ b.left = true; b.right = false; } else { b.right = true; b.left = false; } } }
  botJump(b, want, 8);
}

// ================= v0.7 WORLD 5: SKULLZ BUMBO =================
// A haunted toaster-kitchen underworld staged as a cardboard puppet theater (lore: lore/bumbo.md). Pop-Up Springs (5-1),
// a melted-butter tide (5-2), puppet-string swing planks (5-3), CHROME SCREAMER (FOIL PUPPET) and THE HIVE SKULL (5-4).
// World pickup: the Oven Mitt (blocks one hit). Jam is always grape purple (#b54e8c). Kid-safe, all original.
Object.assign(EDEF, { gremlin: { w: 12, h: 12, hp: 2 }, slime: { w: 14, h: 11, hp: 2 }, ghoul: { w: 12, h: 15, hp: 2 }, bbat: { w: 14, h: 9, hp: 1, fly: true },
  snake: { w: 18, h: 8, hp: 2 }, foil: { w: 26, h: 34, hp: 22, fly: true }, buzz: { w: 8, h: 7, hp: 1, fly: true } });
const BUMBO_TYPES = new Set(['gremlin', 'slime', 'ghoul', 'bbat', 'snake', 'foil', 'buzz']);
let bumFx = [];
function inBumbo(){ return !!(TSET && TSET.bumbo); }
function bumboInit(e, s){
  if (s.gate) e.gate = s.gate;
  if (e.type === 'gremlin'){ e.facing = -1; e.hopT = 60 + (s.x % 4) * 15; }
  if (e.type === 'slime'){ e.cool = 70 + (s.x % 3) * 20; }
  if (e.type === 'ghoul'){ e.cool = 40; }
  if (e.type === 'bbat'){ e.state = 'hover'; e.homeX = e.x; e.homeY = e.y; e.cool = 60; }
  if (e.type === 'snake'){ e.facing = -1; e.cool = 90 + (s.x % 4) * 20; }
  if (e.type === 'foil'){ e.x = s.x * TS; e.homeY = 4 * TS + 6; e.deck = 13 * TS; e.y = e.homeY; e.state = 'hover'; e.t = 0; e.cyc = 0; e.met = false; }
}
// ---- melted-butter tide (5-2) ----
function tideState(f){
  const td = lv.tide; if (!td) return null;
  const t = cyc(f, td.phase, td.period), lo = td.low * TS, hi = td.high * TS, a = td.calm, b = a + td.warn, c = b + td.rise, d = c + td.hold;
  if (t < a) return { y: lo, ph: 'calm', left: a - t };
  if (t < b) return { y: lo, ph: 'warn', left: b - t };
  if (t < c) return { y: lo + (hi - lo) * (t - b) / td.rise, ph: 'rise', left: c - t };
  if (t < d) return { y: hi, ph: 'high', left: d - t };
  return { y: hi + (lo - hi) * Math.min(1, (t - d) / Math.max(1, td.period - d)), ph: 'fall', left: td.period - t };
}
function tidePerches(){ // columns whose standing surface stays above the high tide line
  const td = lv.tide; if (!td) return []; if (td.perches) return td.perches;
  const out = []; let cur = null;
  for (let tx = 0; tx < lv.w; tx++){ let top = -1; for (let y = 14; y >= 3 && isSolid(tx, y); y--) top = y; // top of the stack standing on the floor
    const ok = top > 0 && top * TS <= td.high * TS - 4 && top >= 8;
    if (ok){ if (cur && cur.b === tx - 1 && cur.top === top) cur.b = tx; else { cur = { a: tx, b: tx, top }; out.push(cur); } } else cur = null; }
  return (td.perches = out);
}
// ---- Pop-Up Springs (5-1) ----
function bumboSpring(p){
  const fr = Math.floor((p.y + p.h + 1) / TS);
  for (const tx of [Math.floor((p.x + 2) / TS), Math.floor((p.x + p.w - 2) / TS)]){
    if (tileAt(tx, fr) !== 'J') continue;
    p.vy = -6.6; p.gHold = 0.21; p.gFall = 0.4375; p.jumpHeld = true; p.springUp = true; p.onGround = false; p.plat = null; p.jumpBuf = 0;
    (lv.springT = lv.springT || {})[tx + ',' + fr] = 10; G.springs = (G.springs || 0) + 1; A.sfx('boing');
    burst(tx * TS + 8, fr * TS, 6, [BUM.Y, BUM.P, BUM.E2], 1.3); return true;
  }
  return false;
}
// ---- enemies ----
function updateBumboEnemy(e, dx, dy){
  const near = Math.abs(dx) < 170 && !P.dead && P.ctrl === 'normal', pcx = P.x + P.w / 2, ecx = e.x + e.w / 2;
  const onScreen = e.x > camX - 8 && e.x < camX + W - 4;
  let grav = true;
  switch (e.type){
    case 'gremlin': // Crust Gremlin: scurries, hops at you now and then
      if (e.onGround){ e.vx = 0.7 * e.facing; if (!aheadSupported(e)) e.facing = -e.facing;
        if (--e.hopT <= 0){ e.hopT = 70 + (e.anim % 3) * 12; if (near && Math.abs(dx) < 110){ e.facing = dx < 0 ? -1 : 1; e.vy = -3.4; e.vx = 1.1 * e.facing; sfxOnce('squeak'); } } }
      break;
    case 'slime': // Butter Slime: oozes, lobs arcing butter globs that leave a slick
      if (e.state === 'lob'){ e.vx = 0; if (--e.t <= 0){ e.state = 'walk'; e.cool = 120 + (e.anim % 3) * 20;
          const T = 46, gr = 0.2, sx = ecx, sy = e.y + 2, tx = pcx + P.vx * 12, ty = P.y + P.h - 3;
          bolts.push({ kind: 'glob', x: sx - 3, y: sy - 3, w: 6, h: 6, vx: Math.max(-2.4, Math.min(2.4, (tx - sx) / T)), vy: (ty - sy) / T - 0.5 * gr * T, g: gr, t: 0 }); A.sfx('splat'); }
        break; }
      e.vx = 0.25 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.cool > 0) e.cool--; else if (near && onScreen && Math.abs(dx) < 136 && Math.abs(dx) > 20 && e.onGround && Math.abs((P.y + P.h) - (e.y + e.h)) < 26){ e.state = 'lob'; e.t = 22; e.facing = dx < 0 ? -1 : 1; }
      break;
    case 'ghoul': // Fork Ghoul: winds up its cardboard fork, then lunges
      if (e.state === 'wind'){ e.vx = 0; if (--e.t <= 0){ e.state = 'lunge'; e.t = 22; A.sfx('whoosh'); } break; }
      if (e.state === 'lunge'){ e.vx = 2.8 * e.facing; if (e.onGround && !aheadSupported(e)) e.vx = 0; if (--e.t <= 0){ e.state = 'rest'; e.t = 50; } break; }
      if (e.state === 'rest'){ e.vx = 0; if (--e.t <= 0) e.state = 'walk'; break; }
      e.vx = 0.35 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.cool > 0) e.cool--; else if (near && onScreen && Math.abs(dx) < 92 && Math.abs(dy) < 20 && e.onGround){ e.state = 'wind'; e.t = 30; e.facing = dx < 0 ? -1 : 1; e.cool = 60; sfxOnce('ghost'); }
      break;
    case 'bbat': // Burnt Bagel Bat: flutters on paper hinges, swoops down at you
      grav = false; e.facing = dx < 0 ? -1 : 1;
      if (e.state === 'hover'){ e.x = e.homeX + Math.sin(e.anim * 0.03) * 22; e.y = e.homeY + Math.sin(e.anim * 0.08) * 4;
        if (e.cool > 0) e.cool--; else if (near && onScreen && Math.abs(dx) < 80 && P.y > e.y + 10){ e.state = 'swoop'; e.t = 0; e.tx = pcx; e.ty = P.y + 2; A.sfx('dive'); } }
      else if (e.state === 'swoop'){ e.t++; const k = Math.min(1, e.t / 34); e.x += (e.tx - ecx) * 0.06 * (1 - k * 0.5); e.y += 2.2 * (1 - k) + 0.2;
        if (e.t > 34 || e.y + e.h > 13 * TS - 2){ e.state = 'back'; e.t = 0; } }
      else { e.y += (e.homeY - e.y) * 0.05; e.x += (e.homeX - e.x) * 0.02; if (Math.abs(e.y - e.homeY) < 2){ e.state = 'hover'; e.cool = 90; } }
      break;
    case 'snake': // Cord Snake: slithers; every so often it sparks up, then zaps a ring around itself
      if (e.state === 'warn'){ e.vx = 0; if (--e.t <= 0){ e.state = 'zap'; e.t = 40; A.sfx('zap'); } if (G.frame % 4 === 0) parts.push({ x: ecx + (Math.random() - 0.5) * 16, y: e.y + Math.random() * 6, vx: 0, vy: -0.6, g: 0, life: 10, color: BUM.Y, size: 1 }); break; }
      if (e.state === 'zap'){ e.vx = 0; if (--e.t <= 0){ e.state = 'walk'; e.cool = 150; } break; }
      e.vx = 0.5 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.cool > 0) e.cool--; else if (near && onScreen && Math.abs(dx) < 120){ e.state = 'warn'; e.t = 34; sfxOnce('fuse'); }
      break;
    case 'buzz': // Buzz Crumb (Hive Skull minion): drifts at you
      grav = false; e.t++; { const ty = P.y + 3 + Math.sin(e.t * 0.06) * 5; e.facing = dx < 0 ? -1 : 1; e.vx += (Math.sign(dx) * 0.6 - e.vx) * 0.04; e.vy += (Math.sign(ty - e.y) * 0.6 - e.vy) * 0.06; e.x += e.vx; e.y += e.vy; if (e.y > 13 * TS - e.h) e.y = 13 * TS - e.h; }
      if (e.t % 16 === 0) sfxOnce('buzz');
      if (e.t > 720 || !BOSS || BOSS.dying || BOSS.dead){ e.remove = true; burst(ecx, e.y + 3, 6, [BUM.HO, BUM.P], 1.2); }
      return;
    case 'foil': updateFoil(e, dx, dy); return;
  }
  if (grav){ e.vy = Math.min(e.vy + 0.3, 4.5); e.x += e.vx; if (collideX(e)) e.facing = -e.facing; e.y += e.vy; collideY(e); }
  if (e.y > H + 16 || (!lv.camLock && (e.x < camX - 80 || e.x > camX + W + 160))) e.remove = true;
}
function updateBumboBolt(b){ // butter globs: arc under gravity, splat into a slick butter patch
  b.t++; b.vy = Math.min(b.vy + (b.g || 0.2), 4.5); b.x += b.vx; b.y += b.vy;
  const tx = Math.floor((b.x + 3) / TS), ty = Math.floor((b.y + 6) / TS);
  if (isSolid(tx, ty) || tileAt(tx, ty) === '='){ b.remove = true; burst(b.x + 3, b.y + 3, 5, [BUM.BU, '#fff3a8', BUM.BU2], 1.2); A.sfx('splat');
    if (b.vy > 0 && !isSolid(tx, ty - 1)) patches.push({ kind: 'butter', x: b.x - 7, y: ty * TS, w: 20, t: 300 }); }
  if (b.t > 200 || b.y > H + 8) b.remove = true;
}
function bumboStomp(e){
  if (!BUMBO_TYPES.has(e.type)) return false;
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (e.type === 'gremlin'){ e.dead = 'squash'; e.t = 24; burst(cx, cy, 10, [BUM.E, BUM.K2, BUM.DK], 1.6); return true; }
  if (e.type === 'slime'){ e.remove = true; burst(cx, cy, 12, [BUM.BU, '#fff3a8', BUM.BU2], 1.8); patches.push({ kind: 'butter', x: e.x - 3, y: e.y + e.h, w: 20, t: 240 }); return true; }
  if (e.type === 'ghoul'){ e.remove = true; burst(cx, cy, 12, [BUM.P, '#d8ccb0', BUM.CH2], 1.8); popup(e.x - 4, e.y - 10, 'RIP', BUM.P); return true; } // a torn paper ghost
  if (e.type === 'bbat' || e.type === 'buzz'){ e.remove = true; burst(cx, cy, 10, [BUM.DK, '#2a1a10', BUM.E2], 1.6); return true; }
  if (e.type === 'snake'){ e.remove = true; burst(cx, cy, 10, ['#5a5a66', BUM.CH, BUM.Y], 1.6); return true; }
  if (e.type === 'foil'){ damageEnemy(e, 3, 0, { stomp: true }); return true; }
  return false;
}
function bumboContact(e){ // true = handled (no stomp / hurt from the generic code)
  if (e.type === 'foil'){
    if (e.state === 'shriek' && P.vy > 0 && P.prevY + P.h <= e.y + 8) return false; // stomp the puppet while it's down on the boards
    P.vx = P.x + P.w / 2 < e.x + e.w / 2 ? -2.2 : 2.2; P.x = P.vx < 0 ? Math.min(P.x, e.x - P.w - 1) : Math.max(P.x, e.x + e.w + 1); sfxOnce('clang'); return true; // a string puppet: it shoves you off, the shrieks hurt
  }
  if (e.type === 'snake' && e.state === 'zap'){ hurt(); return true; }
  return false;
}
function bumboDeath(e, src){
  if (e.type === 'foil'){ stringsCut(e); return true; }
  return false;
}
function bumboKill(e){ if (e.type === 'slime') patches.push({ kind: 'butter', x: e.x - 3, y: Math.round((e.y + e.h) / TS) * TS, w: 20, t: 240 }); }
// ---- CHROME SCREAMER (FOIL PUPPET), mid-boss: dangles on strings, drops to the boards to SHRIEK (ground waves both ways) ----
function updateFoil(e, dx, dy){
  e.vx = 0; e.vy = 0; e.facing = dx < 0 ? -1 : 1;
  const engaged = !P.dead && Math.abs(dx) < 210 && e.x < camX + W + 8;
  if (!engaged) return;
  if (!e.met){ e.met = true; G.foilMet = true; A.sfx('shriek');
    { const q = popup(e.x - 46, e.y - 14, P.bro === 'screamer' ? "THAT'S A FOIL KNOCKOFF OF ME!" : 'CHROME SCREAMER?! NO: A FOIL PUPPET', BUM.CH3); q.long = true; if (P.bro === 'screamer') q.persona = 'screamer'; }
    G.bigText = { text: 'FOIL PUPPET', t: 0 }; }
  const fast = e.hp <= 11; e.t++;
  const floorY = e.deck - e.h;
  switch (e.state){
    case 'hover': e.y = e.homeY + Math.sin(e.t * 0.08) * 4; e.x += Math.sin(e.t * 0.04) * 0.3; if (e.t > (fast ? 70 : 96)){ e.state = 'drop'; e.t = 0; A.sfx('whoosh'); } break;
    case 'drop': e.y = Math.min(floorY, e.y + 2 + e.t * 0.35); if (e.y >= floorY){ e.y = floorY; e.state = 'shriek'; e.t = 0; G.shake = 6; burst(e.x + 13, e.deck, 8, [BUM.CH, BUM.K, BUM.P], 1.4); } break;
    case 'shriek': {
      const wave = (k) => { for (const d of [-1, 1]) bolts.push({ kind: 'gwave', boss: true, foil: true, x: e.x + 8 + d * 12, y: e.deck - 9, w: 10, h: 9, vx: d * (fast ? 1.7 : 1.45), vy: 0, t: 0 });
        bumFx.push({ kind: 'ring', x: e.x + 13, y: e.y + 12, t: 0 }); A.sfx('shriek'); G.shake = Math.max(G.shake, 5); G.shrieks = (G.shrieks || 0) + 1; };
      if (e.t === 14) wave(0); if (fast && e.t === 44) wave(1);
      if (e.t > (fast ? 84 : 72)){ e.state = 'rise'; e.t = 0; } break; }
    case 'rise': e.y = Math.max(e.homeY, e.y - 2.4); if (e.y <= e.homeY){ e.state = 'hover'; e.t = 0; e.cyc++; } break;
  }
  if (G.frame % 7 === 0) parts.push({ x: e.x + 4 + Math.random() * 18, y: e.y + 4, vx: 0, vy: -0.3, g: 0, life: 12, color: Math.random() < 0.5 ? BUM.CH3 : BUM.Y, size: 1 });
}
function stringsCut(e){
  e.dead = 'squash'; e.t = 70; G.foilCut = true; G.kills++; addScore(3000, e.x, e.y - 12);
  G.bigText = { text: 'STRINGS CUT!', t: 0 }; G.shake = 12; A.sfx('snip'); A.sfx('powerdown');
  e.y = e.deck - 14; e.h = 14; // crumples into a foil heap on the boards
  burst(e.x + 13, e.y, 18, [BUM.CH, BUM.CH3, BUM.CH2, BUM.K], 2);
  { const q = popup(e.x - 30, e.y - 24, P.bro === 'screamer' ? 'ACCEPT NO SUBSTITUTES' : 'JUST FOIL AND TAPE', BUM.CH3); if (P.bro === 'screamer') q.persona = 'screamer'; }
  const gt = e.gate; if (gt){ let d = 0; for (let tx = gt.x0; tx <= gt.x1; tx++) for (let ty = gt.y0; ty <= gt.y1; ty++){ if (lv.t[ty][tx] !== '.'){ lv.t[ty][tx] = '.'; if ((tx + ty) % 3 === 0) boom(tx * TS + 8, ty * TS + 8, 12, { power: 0, dmg: 0, owner: 'p', delay: 10 + d++ * 2 }); } } }
}
// ---- per-frame world update + hazards ----
function bumboUpdate(){
  if (lv.springT) for (const k in lv.springT){ if (--lv.springT[k] <= 0) delete lv.springT[k]; }
  for (const f of bumFx) f.t++; bumFx = bumFx.filter(f => f.t < 30);
  const ts = tideState(); if (ts){ G.tideY = ts.y; G.tidePh = ts.ph; if (ts.ph === 'warn' && ts.left === lv.tide.warn - 1){ sfxOnce('alarm'); } if (ts.ph === 'warn' && G.frame % 20 === 0) sfxOnce('drip'); }
  const b = BOSS; if (b && b.kind === 'hive') hiveUpdateDrips(b);
}
function bumboHazards(){
  if (P.ctrl !== 'normal' || P.dead) return;
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2;
  // Cord Snake zap rings
  for (const e of enemies){ if (e.type === 'snake' && e.state === 'zap' && !e.dead){ const ex = e.x + e.w / 2, ey = e.y + e.h / 2; if (Math.hypot(pcx - ex, pcy - ey) < 24){ hurt(); return; } } }
  // butter tide
  const ts = tideState();
  if (ts && P.y + P.h > ts.y + 3 && P.inv <= 0){ hurt(); if (G.state === 'play' && !P.dead){ P.vy = -5.4; P.onGround = false; P.plat = null; popup(P.x - 14, P.y - 14, 'BUTTERED!', BUM.BU); burst(pcx, ts.y, 10, [BUM.BU, '#fff3a8'], 1.6); } return; }
  // honey puddles (boss): sticky, slows you right down
  const b = BOSS; let sticky = false;
  if (b && b.kind === 'hive' && P.onGround) for (const h of b.puddles) if (P.x + P.w > h.x + 2 && P.x < h.x + h.w - 2 && Math.abs(P.y + P.h - h.y) < 2) sticky = true;
  if (sticky){ P.vx = Math.max(-0.8, Math.min(0.8, P.vx)); P.honey = true; if (G.frame % 8 === 0) parts.push({ x: pcx, y: P.y + P.h - 1, vx: 0, vy: -0.2, g: 0.02, life: 12, color: BUM.HO, size: 1 }); } else P.honey = false;
}
// ---------------- THE HIVE SKULL (World 5 boss) ----------------
// A honeycomb skull in yellow and black: floor-slam shockwaves, honey drips that leave sticky puddles.
// Phase 1: one slam, two drips. Phase 2 "THE HIVE STIRS" (HP <= 6): double slams + Buzz Crumbs. Phase 3 "SWARM TIME!" (HP <= 3): triple slams, three drips.
function makeHive(spec){
  const deck = spec.deckRow * TS;
  spec.baseLine1 = spec.baseLine1 || spec.line1; spec.baseLine2 = spec.baseLine2 || spec.line2;
  return { kind: 'hive', spec, deck, x: spec.tx * TS, y: deck - 40, w: 34, h: 40, vx: 0, vy: 0, hp: 9, flash: 0, state: 'dormant', t: 0, n: 0, dir: -1,
    active: false, dying: false, dead: false, dt: 0, by: null, phase: 1, cyc: 0, drips: [], puddles: [], chip: 0, onGround: true, pose: 'idle', slams: 0, buzzT: 120, carded: false };
}
function hiveDamage(src){
  const b = BOSS; if (!b || b.dying || b.dead || b.flash > 0) return;
  b.hp--; b.flash = 50; G.shake = 9; A.sfx('bosshit'); b.pose = 'hurt';
  burst(b.x + b.w / 2, b.y + 14, 16, [BUM.Y, BUM.HO, BUM.I, '#ffffff'], 2.4);
  if (b.hp <= 0){ hiveDie(src); return; }
  popup(b.x - 4, b.y - 12, 'HP ' + b.hp, BUM.Y);
  if (b.hp <= 6 && b.phase === 1){ b.phase = 2; b.state = 'idle'; b.t = 0; b.buzzT = 30; G.bigText = { text: 'THE HIVE STIRS', t: 0 }; A.sfx('curse'); A.setTempo(1.12); }
  else if (b.hp <= 3 && b.phase === 2){ b.phase = 3; b.state = 'idle'; b.t = 0; b.buzzT = 20; G.bigText = { text: 'SWARM TIME!', t: 0 }; A.sfx('curse'); A.setTempo(1.25); }
}
function hiveDie(by){
  const b = BOSS; b.dying = true; b.by = by; b.dt = 0; b.drips = []; b.vx = 0; A.stopMusic(); A.sfx('powerdown'); addScore(5000, b.x, b.y - 18);
  bolts.forEach(o => o.remove = true); for (const e of enemies) if (e.type === 'buzz') e.remove = true;
  G.hiveDown = true;
}
function hiveDrip(b, x){ const ax0 = b.spec.bounds[0] * TS + 8, ax1 = (b.spec.bounds[1] + 1) * TS - 8; b.drips.push({ x: Math.max(ax0, Math.min(ax1, x)), y: 3 * TS, vy: 0, state: 'warn', t: 0 }); }
function hiveUpdateDrips(b){
  for (const d of b.drips){ d.t++;
    if (d.state === 'warn'){ if (d.t > (b.phase === 3 ? 34 : 44)){ d.state = 'fall'; d.t = 0; A.sfx('drip'); } }
    else { d.vy = Math.min(d.vy + 0.25, 5); d.y += d.vy;
      if (P.ctrl === 'normal' && !P.dead && Math.abs(d.x - (P.x + P.w / 2)) < 8 && d.y + 8 > P.y && d.y < P.y + P.h){ d.remove = true; hurt(); burst(d.x, d.y + 4, 8, [BUM.HO, '#ffe08a'], 1.4); continue; }
      if (d.y + 8 >= b.deck){ d.remove = true; b.puddles.push({ x: d.x - 13, y: b.deck, w: 26, t: 0, life: 360 }); burst(d.x, b.deck - 2, 8, [BUM.HO, '#ffe08a', BUM.HO2], 1.4); A.sfx('splat'); } } }
  b.drips = b.drips.filter(d => !d.remove);
  for (const h of b.puddles) h.t++; b.puddles = b.puddles.filter(h => h.t < h.life);
}
function hiveSlam(b){
  const sp = b.phase === 3 ? 2.1 : b.phase === 2 ? 1.9 : 1.7;
  for (const d of [-1, 1]) bolts.push({ kind: 'gwave', boss: true, hive: true, x: b.x + b.w / 2 - 5 + d * 18, y: b.deck - 9, w: 10, h: 9, vx: d * sp, vy: 0, t: 0 });
  G.shake = 12; A.sfx('hiveslam'); b.slams++; G.hiveSlams = (G.hiveSlams || 0) + 1;
  burst(b.x + b.w / 2, b.deck - 2, 14, [BUM.HO, BUM.Y, BUM.K, BUM.I], 2.2);
  if (Math.random() < 0.5 || b.phase >= 2) b.puddles.push({ x: b.x + b.w / 2 - 13 + (Math.random() - 0.5) * 30, y: b.deck, w: 26, t: 0, life: 240 });
}
function updateHive(){
  const b = BOSS, [bx0, bx1] = b.spec.bounds, ax0 = bx0 * TS, ax1 = (bx1 + 1) * TS, pcx = P.x + P.w / 2;
  if (!G.dialogDone){ const scr = P && P.bro === 'screamer'; b.spec.line1 = scr ? b.spec.scrLine1 : b.spec.baseLine1; b.spec.line2 = scr ? b.spec.scrLine2 : b.spec.baseLine2; }
  if (b.flash > 0) b.flash--; if (b.flash === 0 && b.pose === 'hurt') b.pose = 'idle';
  if (b.dying){
    b.dt++; b.vy = Math.min(b.vy + 0.3, 4); b.y += b.vy; collideY(b);
    if (b.dt % 4 === 0) burst(b.x + Math.random() * b.w, b.y + Math.random() * 30, 3, [BUM.Y, BUM.HO, BUM.I, BUM.P], 2.4, 30);
    if (b.dt % 18 === 0) boom(b.x + Math.random() * b.w, b.y + 6 + Math.random() * 30, 14, { power: 0, dmg: 0, owner: 'fx' });
    if (b.dt === 30){ G.bigText = { text: 'CURTAIN!', t: 0 }; A.sfx('curtain'); G.curtain = { t: 0 }; }
    if (b.dt > 220){ b.dead = true; b.active = false; G.curtain = null; if (lv.escapeWall) startEscape(); else { G.castleEnd = true; G.endT = 0; A.sfx('clear'); } }
    return;
  }
  if (!b.active) return;
  if (!b.carded){ b.carded = true; G.nameCard = { text: 'HIVE SKULL', t: 0 }; A.sfx('hiveslam'); G.shake = 10; }
  const sp = b.phase === 3 ? 1.3 : b.phase === 2 ? 1.15 : 1;
  b.t++;
  // phase 2+: keep a few Buzz Crumbs in the air
  if (b.phase >= 2 && --b.buzzT <= 0){ b.buzzT = b.phase === 3 ? 220 : 280; const n = enemies.filter(e => e.type === 'buzz' && !e.dead && !e.remove).length;
    if (n < (b.phase === 3 ? 2 : 1)){ const e = spawnEnemy('buzz', b.x + b.w / 2 - 4, b.y + 6); e.t = 0; e.vx = -0.5; e.vy = -1; burst(e.x + 4, e.y + 3, 8, [BUM.HO, BUM.Y], 1.4); A.sfx('buzz'); } }
  switch (b.state){
    case 'idle': b.vx = 0; if (b.t > 46 / sp){ b.cyc++; b.state = b.cyc % 2 === 1 ? 'hop' : 'drip'; b.t = 0; b.slams = 0; } break;
    case 'hop':
      if (b.t === 8 && b.onGround){ // jump toward you, but land short of you: the slam waves are the danger, not a squish
        const goalC = pcx < b.x + b.w / 2 ? Math.max(pcx + 58, ax0 + 60) : Math.min(pcx - 58, ax1 - 60);
        const goal = Math.max(ax0 + 6, Math.min(ax1 - b.w - 6, goalC - b.w / 2));
        b.vy = -6.2; b.vx = Math.max(-2.2, Math.min(2.2, (goal - b.x) / 41)); b.pose = 'slam'; A.sfx('roar'); }
      if (b.t > 12 && b.onGround){ b.vx = 0; hiveSlam(b); b.state = 'land'; b.t = 0; }
      if (b.t > 120){ b.state = 'idle'; b.t = 0; }
      break;
    case 'land': b.vx = 0; if (b.t > 22 / sp){ b.pose = 'idle'; if (b.slams < Math.min(2, b.phase)){ b.state = 'hop'; b.t = 0; } else { b.state = 'recover'; b.t = 0; } } break;
    case 'recover': b.vx = 0; if (b.t > 40 / sp){ b.state = 'idle'; b.t = 0; } break;
    case 'drip': b.vx = 0;
      if (b.t === 10){ const n = b.phase === 3 ? 3 : 2; hiveDrip(b, pcx + P.vx * 10); if (n >= 2) hiveDrip(b, pcx + (pcx < (ax0 + ax1) / 2 ? 52 : -52)); if (n >= 3) hiveDrip(b, pcx + (pcx < (ax0 + ax1) / 2 ? -64 : 64)); b.pose = 'slam'; A.sfx('roar'); }
      if (b.t === 24) b.pose = 'idle';
      if (b.t > 80 / sp){ b.state = 'idle'; b.t = 0; } break;
  }
  b.vy = Math.min(b.vy + 0.3, 5); b.x += b.vx; b.x = Math.max(ax0 + 4, Math.min(ax1 - b.w - 4, b.x)); b.y += b.vy; collideY(b);
  b.dir = pcx < b.x + b.w / 2 ? -1 : 1;
  if (P.ctrl === 'normal' && !P.dead && overlap(P, { x: b.x + 4, y: b.y + 6, w: b.w - 8, h: b.h - 6 })){ if (P.star > 0){ if (!b.flash) hiveDamage('star'); } else hurt(); }
}
function drawHive(){
  const b = BOSS; if (!b || b.dead) return;
  const X = Math.round(b.x - camX) - 5, Y = Math.round(b.y) - 4, B5 = S.bumbo;
  for (const d of b.drips){ const dx = Math.round(d.x - camX);
    if (d.state === 'warn'){ const k = d.t / 44; g.drawImage(B5.honey, dx - 3, 3 * TS - 2 + Math.round(k * 4)); if ((G.frame >> 2) % 2){ g.fillStyle = 'rgba(240,168,24,0.45)'; for (let y = 3 * TS + 10; y < b.deck - 4; y += 8) g.fillRect(dx - 1, y, 2, 4); g.fillStyle = 'rgba(240,168,24,0.35)'; g.fillRect(dx - 10, b.deck - 2, 20, 2); } }
    else g.drawImage(B5.honey, dx - 3, Math.round(d.y)); }
  if (b.flash > 0 && (G.frame & 2)) g.filter = 'brightness(1.8)';
  const img = b.pose === 'hurt' ? B5.hive.hurt : (b.pose === 'slam' || !b.onGround) ? B5.hive.slam : B5.hive.idle;
  const wob = b.dying ? Math.sin(b.dt * 0.3) * 0.2 : Math.sin(G.frame * 0.09) * 0.05; // paper hinge wobble
  g.save(); g.translate(X + 22, Y + 44); g.rotate(wob); if (b.dir > 0) g.scale(-1, 1); g.drawImage(img, -22, -44); g.restore(); g.filter = 'none';
  // strings: it's a puppet too, worked from the flies
  if (!b.dying){ g.strokeStyle = 'rgba(243,234,212,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X + 12, Y + 6); g.lineTo(X + 12, 3 * TS); g.moveTo(X + 32, Y + 6); g.lineTo(X + 32, 3 * TS); g.stroke(); }
  if (G.dialog) drawTextC(g, 'THE HIVE SKULL', 128, 138, (G.frame >> 3) % 2 ? BUM.Y : BUM.P, 1, '#000');
  if (G.dialogDone && !b.dying){ g.fillStyle = BUM.I; g.fillRect(70, 26, 116, 6); g.fillStyle = b.phase === 3 ? BUM.E2 : b.phase === 2 ? BUM.HO : BUM.Y; g.fillRect(71, 27, Math.round(114 * b.hp / 9), 4); drawTextC(g, 'HIVE SKULL', 128, 34, '#ffffff', 1, '#000'); }
}
// ---- drawing ----
function drawBumboEnemy(e, X){
  const B5 = S.bumbo; if (!B5 || !BUMBO_TYPES.has(e.type)) return false;
  const Y = Math.round(e.y), side = e.facing > 0 ? 'R' : 'L', f = (e.anim >> 3) & 1;
  let img = null, ox = -1, oy = 0;
  switch (e.type){
    case 'gremlin': img = B5.gremlin[side][e.onGround ? (e.anim >> 3) & 1 : 1]; ox = -2; oy = e.h - 14; break;
    case 'slime': img = (e.state === 'lob' ? B5.slimeLob : B5.slime)[side][f]; ox = -1; oy = e.h - 12; break;
    case 'ghoul': img = (e.state === 'lunge' || e.state === 'wind' ? B5.ghoulLunge : B5.ghoul)[side][f]; ox = e.facing > 0 ? -2 : -6; oy = e.h - 16; if (e.state === 'wind'){ ox += (G.frame & 1) ? 1 : -1; } g.globalAlpha = 0.92; break;
    case 'bbat': img = B5.bbat[side][(G.frame >> 2) & 1]; ox = -2; oy = -2; break;
    case 'snake': img = B5.snake[side][(e.anim >> 3) & 1]; ox = -2; oy = e.h - 9;
      if (e.state === 'zap' || e.state === 'warn'){ const cx = X + 2 + e.w / 2, cy = Y + e.h / 2, r = rng(G.frame * 3 + e.x); g.strokeStyle = e.state === 'zap' ? BUM.Y : 'rgba(255,212,0,0.4)'; g.lineWidth = 1;
        g.beginPath(); for (let i = 0; i <= 12; i++){ const a = i / 12 * Math.PI * 2, rr = (e.state === 'zap' ? 22 : 12) + (r() - 0.5) * 6; const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * 0.8; if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke();
        if (e.state === 'zap'){ g.globalAlpha = 0.15; g.fillStyle = BUM.Y; g.beginPath(); g.arc(cx, cy, 22, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } } break;
    case 'buzz': img = B5.buzz[side][(G.frame >> 1) & 1]; ox = -1; oy = -1; break;
    case 'foil': {
      const fx = X + 2, top = 3 * TS;
      if (e.dead !== 'squash'){ g.strokeStyle = 'rgba(243,234,212,0.75)'; g.lineWidth = 1; g.beginPath(); for (const sx of [3, 13, 23]){ g.moveTo(fx + sx, top); g.lineTo(fx + sx + Math.sin(e.t * 0.08 + sx) * 1.5, Y + (sx === 13 ? 2 : 20)); } g.stroke(); // puppet strings
        g.fillStyle = BUM.DK; g.fillRect(fx - 4, top, 34, 4); g.fillStyle = BUM.I; g.fillRect(fx - 4, top + 3, 34, 1); } // the control bar
      if (e.dead === 'squash'){ g.globalAlpha = Math.max(0, Math.min(1, e.t / 40)); g.drawImage(B5.foilCrumpled, fx - 3, Y - 1); g.globalAlpha = 1; return true; }
      const scream = e.state === 'shriek' && e.t > 8 && e.t < 40;
      img = scream ? B5.foilScream : B5.foil[(G.frame >> 3) & 1]; ox = -3; oy = -2;
      g.save(); g.translate(fx + 13, Y + 34); g.rotate(Math.sin(e.t * 0.07) * (e.state === 'hover' ? 0.08 : 0.03)); if (e.facing > 0) g.scale(-1, 1);
      if (e.hitT > 0 && (e.hitT & 2)) g.filter = 'brightness(2)'; g.drawImage(img, -16, -36); g.restore(); g.filter = 'none';
      return true; }
  }
  if (img){
    if (e.dead === 'flip'){ g.save(); g.translate(X + ox, Y + oy + img.height); g.scale(1, -1); g.drawImage(img, 0, 0); g.restore(); }
    else if (e.dead === 'squash'){ g.drawImage(img, 0, img.height / 2, img.width, img.height / 2, X + ox, Y + oy + img.height / 2, img.width, img.height / 2); }
    else { const w = Math.sin(e.anim * 0.18) * 0.07; g.save(); g.translate(X + ox + img.width / 2, Y + oy + img.height); g.rotate(w); g.drawImage(img, -img.width / 2, -img.height); g.restore(); } // paper hinge wobble
  }
  g.globalAlpha = 1;
  return true;
}
function drawSwingPlat(pl){
  const X = Math.round(pl.x - camX), Y = Math.round(pl.y); if (X > W + 80 || X + pl.w < -80) return;
  const pvx = Math.round(pl.x0 + pl.w / 2 - camX), pvy = Math.round(pl.y0 - pl.len);
  g.strokeStyle = 'rgba(243,234,212,0.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(pvx, pvy); g.lineTo(X + 3, Y); g.moveTo(pvx, pvy); g.lineTo(X + pl.w - 3, Y); g.stroke(); // puppet strings
  g.fillStyle = BUM.I; g.fillRect(pvx - 9, pvy - 3, 18, 5); g.fillStyle = BUM.DK; g.fillRect(pvx - 8, pvy - 2, 16, 3); g.fillStyle = BUM.Y; g.fillRect(pvx - 1, pvy - 1, 2, 2); // hand-held control bar
  g.fillStyle = BUM.I; g.fillRect(X - 1, Y - 1, pl.w + 2, 9); g.fillStyle = BUM.K; g.fillRect(X, Y, pl.w, 7); g.fillStyle = BUM.K2; g.fillRect(X, Y, pl.w, 2); bCorrG(g, X + 1, Y + 3, pl.w - 2, 3);
  bTapeG(g, X + 2, Y + 1, 5, 3); bTapeG(g, X + pl.w - 7, Y + 1, 5, 3);
}
function drawBumboHazards(){
  if (!inBumbo()) return;
  for (const o of bolts){ if (o.kind === 'glob' && !o.mine) g.drawImage(S.bumbo.glob, Math.round(o.x - camX) - 1, Math.round(o.y) - 1); }
  for (const f of bumFx){ if (f.kind === 'ring'){ const X = Math.round(f.x - camX), r = 8 + f.t * 3; g.globalAlpha = Math.max(0, 1 - f.t / 30); g.strokeStyle = BUM.CH3; g.lineWidth = 2; g.beginPath(); g.ellipse(X, f.y, r, r * 0.6, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = BUM.I; g.lineWidth = 1; g.beginPath(); g.ellipse(X, f.y, r + 3, (r + 3) * 0.6, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } }
  const b = BOSS;
  if (b && b.kind === 'hive') for (const h of b.puddles){ const X = Math.round(h.x - camX), a = Math.min(1, (h.life - h.t) / 60); g.globalAlpha = a; g.fillStyle = BUM.I; g.fillRect(X - 1, h.y - 4, h.w + 2, 4); g.fillStyle = BUM.HO2; g.fillRect(X, h.y - 3, h.w, 3); g.fillStyle = BUM.HO; g.fillRect(X + 1, h.y - 3, h.w - 2, 1); g.fillStyle = '#ffe08a'; g.fillRect(X + 4 + ((G.frame >> 4) % 3) * 5, h.y - 3, 2, 1); g.globalAlpha = 1; }
  // butter tide: a wobbly sheet of melted butter across the screen
  const ts = tideState();
  if (ts){
    if (ts.ph === 'warn'){ const k = (G.frame >> 2) % 2; g.globalAlpha = 0.5 + 0.3 * k; g.fillStyle = BUM.BU; for (let x = (G.frame * 2) % 24; x < W; x += 24) g.fillRect(x, H - 6 - ((x + G.frame) % 5), 3, 6); g.globalAlpha = 1; }
    if (ts.y < H){ const y0 = Math.round(ts.y);
      g.globalAlpha = 0.82; g.fillStyle = BUM.BU2; g.fillRect(0, y0 + 2, W, H - y0); g.fillStyle = BUM.BU; for (let x = 0; x < W; x += 4){ const yy = y0 + Math.round(Math.sin((x + camX) * 0.08 + G.frame * 0.1) * 1.5); g.fillRect(x, yy, 4, 4); }
      g.fillStyle = '#fff3a8'; for (let x = ((-camX * 0.5) % 18 + 18) % 18; x < W; x += 18) g.fillRect(Math.round(x), y0 + 1 + ((x >> 3) % 2), 5, 1);
      g.globalAlpha = 1; g.fillStyle = BUM.I; for (let x = 0; x < W; x += 4) g.fillRect(x, y0 - 1 + Math.round(Math.sin((x + camX) * 0.08 + G.frame * 0.1) * 1.5), 4, 1); }
  }
}
function bumboPostFxAll(){
  if (!inBumbo()) return;
  const b = BOSS; let spot = null;
  if (b && b.kind === 'hive' && !b.dead && (G.dialog || (!G.dialogDone && P && P.x >= b.spec.trigger * TS - 8))) spot = { x: b.x + b.w / 2 - camX, y: b.y + 20, r: 48, a: 0.8 };
  bumboPostFx(g, W, H, G.frame, spot);
  const ts = tideState();
  if (ts && (ts.ph === 'warn' || ts.ph === 'rise') && (G.frame >> 3) % 2) drawTextC(g, ts.ph === 'warn' ? 'BUTTER RISING! CLIMB!' : 'BUTTER TIDE!', 128, 40, BUM.BU, 1, BUM.I);
  if (G.nameCard){ const n = G.nameCard; const t = n.t, drop = t < 10 ? -60 + t * 7 : t < 14 ? 10 - (t - 10) * 2 : t > 110 ? (t - 110) * -16 : 0, y = 44 + drop; // the name card slams down on its strings
    g.strokeStyle = BUM.P; g.lineWidth = 1; g.beginPath(); g.moveTo(84, 0); g.lineTo(84, y); g.moveTo(172, 0); g.lineTo(172, y); g.stroke();
    g.fillStyle = BUM.I; g.fillRect(62, y - 2, 132, 26); g.fillStyle = BUM.K2; g.fillRect(64, y, 128, 22); bCorrG(g, 64, y, 128, 3); bTapeG(g, 66, y + 2, 10, 4); bTapeG(g, 180, y + 16, 10, 4);
    drawTextC(g, n.text, 128, y + 8, BUM.I, 1); drawTextC(g, n.text, 128 + 1, y + 8, BUM.I, 1); g.fillStyle = BUM.Y; g.fillRect(70, y + 18, 116, 2);
  }
  if (G.curtain){ const t = ++G.curtain.t, k = t < 60 ? t / 60 : t < 150 ? 1 : Math.max(0, 1 - (t - 150) / 40), w = Math.round(W / 2 * k);
    for (const side of [0, 1]){ const x0 = side ? W - w : 0; g.fillStyle = BUM.I; g.fillRect(side ? x0 - 2 : x0, 0, w + 2, H); for (let i = 0; i < w; i += 8){ g.fillStyle = (i >> 3) % 2 ? BUM.CU : BUM.CU2; g.fillRect(side ? x0 + i : x0 + w - i - 8, 0, 8, H); } g.fillStyle = BUM.Y; g.fillRect(side ? x0 : x0, 18, w, 2); } }
}
// ---- the autopilot in World 5: springs are walked into, the tide is waited out on a crate, swings are timed ----
function botBumbo(b, grounded, feet, fx, want, hold){
  const p = P, px = p.x + p.w / 2, feetRow = Math.floor((feet - EPS) / TS);
  // Pop-Up Springs: hop onto the spring (don't leap at the wall behind it); ride the bounce forward
  { let spr = -1; for (let d = -4; d <= 60; d += 4){ const tx = Math.floor((fx + d) / TS); if (tileAt(tx, feetRow) === 'J'){ spr = tx; break; } }
    if (spr >= 0 && grounded && !p.plat){ const d = spr * TS - fx; b.right = true; b.left = false; b.run = false; want = d < 12; hold = 8; }
    if (!grounded && (p.springUp || (p.vy < 1 && tileAt(Math.floor(px / TS), Math.floor((feet + 4) / TS)) === 'J'))){ b.right = true; b.left = false; } }
  // butter tide: get onto a perch before it floods, wait there until it drains
  const ts = tideState();
  if (ts){
    const td = lv.tide, safeY = td.high * TS - 4, onPerch = grounded && feet <= safeY;
    const danger = ts.ph === 'warn' || ts.ph === 'rise' || ts.ph === 'high' || (ts.ph === 'calm' && ts.left < 70) || (ts.ph === 'fall' && ts.y < td.high * TS + 40);
    if (danger){
      if (onPerch){ b.right = false; b.left = false; b.run = false; want = false;
        const pr = tidePerches().find(q => px >= q.a * TS - 2 && px <= (q.b + 1) * TS + 2);
        if (pr){ const lo = pr.a * TS + 1, hi = (pr.b + 1) * TS - 1;
          if (p.x < lo) b.right = true; else if (p.x + p.w > hi) b.left = true;
          else { // sit tight: turn to face the nearest threat (so we shoot it), side-step a butter glob coming down on us
            let ne = null, nd = 1e9; for (const e of enemies){ if (e.dead) continue; const d = e.x + e.w / 2 - px; if (Math.abs(d) < 150 && Math.abs((e.y + e.h) - feet) < 48 && Math.abs(d) < nd){ nd = Math.abs(d); ne = d; } }
            if (ne !== null && Math.sign(ne) !== p.facing && G.frame % 4 === 0){ if (ne < 0) b.left = true; else b.right = true; }
          } } }
      else { let best = null, bd = 1e9;
        for (const q of tidePerches()){ const cx = (q.a + q.b + 1) * TS / 2, d = cx - px, cost = d >= 0 ? d : -d + 40; if (cost < bd){ bd = cost; best = { q, cx, d }; } }
        if (best){ b.left = best.d < -4; b.right = best.d > 4; b.run = Math.abs(best.d) > 30;
          if (grounded && Math.abs(best.d) < 30 + Math.abs(p.vx) * 4 && feet > best.q.top * TS){ want = true; hold = 26; }
          if (!grounded){ b.left = best.d < -2; b.right = best.d > 2; } } }
    }
  }
  // butter globs: step out from under one that's coming down on us (decide once per glob, stay on a perch)
  if (grounded){ for (const o of bolts){ if (o.kind !== 'glob' || o.mine) continue; let x = o.x + 3, y = o.y + 3, vy = o.vy, f = 0;
      while (y < feet - 6 && f < 70){ vy = Math.min(vy + (o.g || 0.2), 4.5); y += vy; x += o.vx; f++; }
      if (f < 46 && Math.abs(x - px) < 13){
        if (!o.dodge){ let dir = x >= px ? -1 : 1; const pr = tidePerches().find(q => feet <= q.top * TS + 2 && px >= q.a * TS - 2 && px <= (q.b + 1) * TS + 2);
          if (pr){ const lo = pr.a * TS, hi = (pr.b + 1) * TS; dir = (p.x - lo) > (hi - p.x - p.w) ? -1 : 1; }
          else if (!isSolid(Math.floor((px + dir * 20) / TS), feetRow + 1)) dir = -dir;
          o.dodge = dir; }
        b.left = o.dodge < 0; b.right = o.dodge > 0; b.run = false; want = false; break; } } }
  // hot butter puddles: any hop taken near one is a full one
  if (grounded && want){ for (let d = 0; d <= 64; d += 8){ const tx = Math.floor((fx + d) / TS); if (tileAt(tx, feetRow + 1) === 'A' || tileAt(tx, feetRow) === 'A'){ hold = Math.max(hold, 40); b.run = true; break; } } }
  // Cord Snakes: don't walk into a sparking / zapping snake
  for (const e of enemies){ if (e.type !== 'snake' || e.dead || (e.state !== 'warn' && e.state !== 'zap')) continue; const d = e.x + e.w / 2 - px;
    if (d > -30 && d < 56 && Math.abs((e.y + e.h) - feet) < 24){ b.right = false; b.run = false; want = false; if (d < 36) b.left = true; } }
  // Fork Ghoul winding up right in front: back off a step
  for (const e of enemies){ if (e.type !== 'ghoul' || e.dead || e.state !== 'wind') continue; const d = e.x - fx; if (d > -8 && d < 40 && Math.abs((e.y + e.h) - feet) < 20 && grounded){ want = true; hold = 30; } }
  // swing planks
  const sw = plats.filter(q => q.axis === 'swing');
  if (sw.length){
    if (p.plat && p.plat.axis === 'swing'){
      const pl = p.plat, mov = Math.cos(pl.t) * pl.speed * pl.amp; // >0: swinging right
      b.left = false; b.right = false; b.run = false; want = false;
      const cx = pl.x + pl.w / 2; if (px < cx - 6) b.right = true; else if (px > cx + 6) b.left = true;
      // what's past the right end of the plank: ground or the next plank
      const edge = pl.x + pl.w; let gap = null;
      for (let d = 0; d < 7 * TS; d += 4){ const tx = Math.floor((edge + d) / TS); const gy = groundBelow(tx, Math.max(2, feetRow - 2)); if (gy >= 0 && gy <= feetRow + 4){ gap = d; break; } }
      const nx = sw.find(q => q !== pl && q.x > pl.x + 8 && q.x - edge < 60); if (nx){ const g2 = nx.x - edge, nmov = Math.cos(nx.t) * nx.speed * nx.amp; if (g2 < 22 && nmov <= 0.0005 && (gap === null || g2 < gap)) gap = g2; else if (gap === null || g2 < gap) gap = null; }
      if (gap !== null && gap < 64 && mov > 0.002){ b.left = false; b.right = p.x + p.w < edge - 1; b.run = true; } // build up speed toward the far end as it swings over
      if (gap !== null && ((mov >= -0.0004 && (gap < 34 || (gap < 46 && p.x + p.w >= edge - 4))) || (gap < 70 && p.x + p.w >= edge - 3 && p.vx > 0.8))){ b.left = false; b.right = true; b.run = true; want = true; hold = 30; bot.swOff = 50; }
    } else if (grounded){
      // a swing pit ahead: walk (don't leap early) to the lip, then wait for the plank to swing close and hop on
      let pitX = -1; for (let d = 0; d <= 136; d += 4){ const tx = Math.floor((fx + d) / TS); if (!standable(tx, feetRow + 1) && groundBelow(tx, feetRow + 1) < 0){ pitX = tx * TS; break; } }
      const pl = pitX >= 0 ? sw.filter(q => q.x0 + q.w / 2 > pitX && q.x0 - pitX < 150).sort((u, v) => u.x0 - v.x0)[0] : null;
      const blk = (() => { for (let d = 2; d <= 20; d += 6){ const tx = Math.floor((fx + d) / TS); if (isSolid(tx, feetRow) || isSolid(tx, feetRow - 1)) return true; } return false; })();
      if (pl && blk && pitX - fx > 24){ b.left = false; b.right = true; b.run = false; want = true; hold = 12; } // short hop over the obstacle, no flying leap at the pit
      else if (pl){
        const lip = pitX - fx, mov = Math.cos(pl.t) * pl.speed * pl.amp, gapL = pl.x - pitX;
        b.left = false; b.run = false; want = false;
        if (lip > 3){ b.right = true; if (lip < 10 && p.vx > 0.6) b.right = false; }
        else { b.right = false; if (p.vx > 0.2) b.left = true;
          let ne = null, nd = 1e9; for (const e of enemies){ if (e.dead) continue; const d = e.x + e.w / 2 - px; if (Math.abs(d) < 110 && Math.abs((e.y + e.h) - feet) < 40 && Math.abs(d) < nd){ nd = Math.abs(d); ne = d; } }
          if (ne !== null && ne < 0 && p.facing > 0 && G.frame % 4 === 0){ b.left = true; } // turn and deal with whatever is creeping up behind
          if (gapL < 30 && mov <= 0.0003){ b.left = false; b.right = true; want = true; hold = 18; bot.swOn = 50; } }
      }
    } else if (!grounded && bot.swOff > 0){ bot.swOff--; b.left = false; b.right = true; b.run = true; // leapt off a plank: commit to the far side
    } else if (!grounded && !((bot.swOn = Math.max(0, (bot.swOn || 0) - 1)) > 0) && (() => { const tx0 = Math.floor(px / TS); if (groundBelow(tx0, Math.max(0, feetRow)) < 0) return false; for (let d = 1; d <= 7; d++){ if (groundBelow(tx0 + d, Math.max(0, feetRow)) < 0) return sw.some(q => Math.abs(q.x0 - (tx0 + d) * TS) < 150); } return false; })()){
      b.right = false; b.run = false; if (p.vx > 0.9) b.left = true; // coming down short of a swing pit: kill the momentum so we don't skid off the lip
    } else if (!grounded && p.vy > -2){ // in the air over a pit: aim for the plank under us
      const pl = sw.find(q => Math.abs(q.x + q.w / 2 - px) < 40 && q.y >= feet - 4 && q.y < feet + 60);
      if (pl){ const cx = pl.x + pl.w / 2; b.right = px < cx - 4; b.left = px > cx + 4; b.run = false; }
    }
  }
  // the foil puppet (mid-boss): hold at range and shoot it while it's down on the boards; hop its shriek waves
  const fo = enemies.find(e => e.type === 'foil' && !e.dead && e.x - fx < 150 && e.x - fx > -40);
  if (fo){
    const rg = Math.min(84, (BOT_RANGE[BROS[p.bro].weapon.kind] || 60) - 8), dC = fo.x + fo.w / 2 - px;
    const goal = fo.state === 'shriek' || fo.state === 'drop' ? Math.max(18, rg - 14) : Math.max(64, rg);
    b.run = false; want = false;
    if (dC > goal + 6){ b.right = true; b.left = false; } else if (dC < goal - 10){ b.right = false; b.left = true; } else { b.right = false; b.left = false; if (p.facing < 0 && G.frame % 6 === 0) b.right = true; }
    for (const o of bolts){ if (o.kind !== 'gwave' || o.mine) continue; const d = o.x + 5 - px; if (Math.sign(-d) === Math.sign(o.vx) && Math.abs(d) < 26 + Math.abs(o.vx) * 4){ want = true; hold = 16; } }
  }
  return { want, hold };
}
function botHive(b, grounded, feet){
  const p = P, B = BOSS, px = p.x + p.w / 2, ax0 = B.spec.bounds[0] * TS, ax1 = (B.spec.bounds[1] + 1) * TS;
  b.right = false; b.left = false; b.run = false;
  if (B.dead || B.dying){ botJump(b, false); return; }
  const range = BOT_RANGE[BROS[p.bro].weapon.kind] || 60, bc = B.x + B.w / 2, side = px < bc ? -1 : 1;
  let goal = bc + side * Math.max(B.w / 2 + 34, Math.min(range, 110) - 8);
  if (goal < ax0 + 14 || goal > ax1 - 14){ goal = bc - side * Math.max(B.w / 2 + 34, Math.min(range, 110) - 8); }
  goal = Math.max(ax0 + 14, Math.min(ax1 - 14, goal));
  if (B.state === 'hop' && !B.onGround){ const land = B.x + B.vx * 20 + B.w / 2; if (Math.abs(land - px) < 44) goal = land < px ? Math.min(ax1 - 14, land + 70) : Math.max(ax0 + 14, land - 70); }
  const bad = x => B.drips.some(d => Math.abs(d.x - x) < 14) || B.puddles.some(h => x > h.x - 4 && x < h.x + h.w + 4);
  const clear = x => Math.abs(x - bc) > B.w / 2 + 34 && x > ax0 + 10 && x < ax1 - 10;
  if (bad(goal)){ for (let d = 8; d < 120; d += 6){ if (!bad(goal - d) && clear(goal - d)){ goal -= d; break; } if (!bad(goal + d) && clear(goal + d)){ goal += d; break; } } }
  if (B.drips.some(d => Math.abs(d.x - px) < 16)){
    const okX = x => x > ax0 + 16 && x < ax1 - 16 && !B.drips.some(q => Math.abs(q.x - x) < 18) && Math.abs(x - bc) > B.w / 2 + 12;
    if (bot.dripEsc == null || !okX(bot.dripEsc)){ bot.dripEsc = null; for (let d = 8; d < 120 && bot.dripEsc == null; d += 4){ for (const sd of [-1, 1]){ const x = Math.round(px) + sd * d; if (okX(x)){ bot.dripEsc = x; break; } } } }
    if (bot.dripEsc != null) goal = bot.dripEsc;
  } else bot.dripEsc = null;
  if (px < goal - 3) b.right = true; else if (px > goal + 3) b.left = true;
  if (Math.abs(px - goal) > 24) b.run = true;
  if (!b.left && !b.right && G.frame % 6 === 0){ if (side < 0 && p.facing < 0) b.right = true; else if (side > 0 && p.facing > 0) b.left = true; }
  { const toward = Math.sign(bc - px); if (Math.sign(p.vx) === toward && Math.abs(px - bc) < B.w / 2 + 30 + Math.abs(p.vx) * 12){ b.run = false; if (Math.abs(p.vx) > 0.6){ b.left = toward > 0; b.right = toward < 0; } } } // brake before we skid into it
  if (B.onGround && Math.abs(px - bc) < B.w / 2 + 14){ const away = px < bc ? -1 : 1; if ((away < 0 && px > ax0 + 12) || (away > 0 && px < ax1 - 12)){ b.left = away < 0; b.right = away > 0; } } // never walk into it
  let want = false;
  for (const o of bolts){ if (o.mine || o.kind !== 'gwave') continue; const d = (o.x + 5) - px; if ((Math.sign(-d) === Math.sign(o.vx) || Math.abs(d) < 8) && Math.abs(d) < 24 + Math.abs(o.vx) * 6){ want = true; } }
  if (want && grounded){ const hopBad = B.drips.some(d => d.state === 'fall' && Math.abs(d.x - px) < 18); if (hopBad) want = false; }
  // a Buzz Crumb sneaking up behind: turn and shoot it (when no slam wave is coming)
  { const bz = enemies.filter(e => (e.type === 'buzz' || e.type === 'shard') && !e.dead && Math.abs(e.x + 4 - px) < 80 && Math.abs(e.y - p.y) < 30).sort((u, v) => Math.abs(u.x - px) - Math.abs(v.x - px))[0];
    if (bz && !bolts.some(o => !o.mine && o.kind === 'gwave' && Math.abs(o.x + 5 - px) < 70) && !B.drips.some(d => Math.abs(d.x - px) < 26)){ const d = bz.x + 4 - px;
      if (Math.abs(d) < 22){ const away = d > 0 ? -1 : 1; if ((away < 0 && px > ax0 + 14) || (away > 0 && px < ax1 - 14)){ b.left = away < 0; b.right = away > 0; b.run = false; } } // back off and shoot
      else if (Math.sign(d) !== p.facing && G.frame % 3 === 0){ b.left = d < 0; b.right = d > 0; } } }
  // hop the slam waves straight up (drifting along with a wave is how you land on it); only step away if we're right up against the Hive
  const waveNear = bolts.some(o => !o.mine && o.kind === 'gwave' && Math.abs(o.x + 5 - px) < 44);
  if (want || (!grounded && waveNear)){ b.left = false; b.right = false; b.run = false;
    const wv = bolts.find(o => !o.mine && o.kind === 'gwave' && Math.abs(o.x + 5 - px) < 44); if (wv && Math.sign(p.vx) === Math.sign(wv.vx) && Math.abs(p.vx) > 0.2){ b.left = wv.vx > 0; b.right = wv.vx < 0; } // don't drift along with it
    if (Math.abs(px - bc) < B.w / 2 + 26){ const away = px < bc ? -1 : 1; if ((away < 0 && px > ax0 + 14) || (away > 0 && px < ax1 - 14)){ b.left = away < 0; b.right = away > 0; } } }
  bot.hiveLock = B.drips.some(d => Math.abs(d.x - px) < 18) || bolts.some(o => !o.mine && o.kind === 'gwave' && Math.abs(o.x + 5 - px) < 44) ? { l: b.left, r: b.right } : null; // botCombat mustn't turn us back under a drip
  botJump(b, want, 18);
}

// ================= v0.8 WORLD 6: MR. TOASTY'S CRYPT =================
// A haunted glitch crypt under Toast Town, half tomb and half busted server room (lore: lore/crypt.md). Glitch Doors (6-1),
// jam geysers in the butter-and-jam kitchen pits (6-2), the RGB switch in the glitch mainframe (6-3), and THE QUARTZ KING
// in the magma toaster-core castle (6-4). World pickup: Hot Sauce (faster, hotter shots for a while). Jam is always grape purple (#b54e8c).
Object.assign(EDEF, { rtoast: { w: 14, h: 13, hp: 3 }, bend: { w: 12, h: 11, hp: 2 }, crumb6: { w: 7, h: 9, hp: 1 }, bblob: { w: 14, h: 10, hp: 3 },
  sskull: { w: 14, h: 13, hp: 2, fly: true }, glitchl: { w: 10, h: 11, hp: 1 }, fbun: { w: 12, h: 12, hp: 2 }, shard: { w: 8, h: 9, hp: 1, fly: true } });
const CRYPT_TYPES = new Set(['rtoast', 'bend', 'crumb6', 'bblob', 'sskull', 'glitchl', 'fbun', 'shard']);
const CRYPT_BOLTS = new Set(['toast6', 'rgb6']);
const RGB_TIME = 480;
let cryFx = [];
function inCrypt(){ return !!(TSET && TSET.crypt); }
function cryptInit(e, s){
  if (e.type === 'rtoast'){ e.facing = -1; e.cool = 40 + (s.x % 3) * 20; }
  if (e.type === 'bend' || e.type === 'crumb6'){ e.facing = -1; }
  if (e.type === 'bblob'){ e.facing = -1; e.trailT = 0; }
  if (e.type === 'sskull'){ e.state = 'float'; e.homeX = e.x; e.homeY = e.y; e.t = (s.x % 4) * 20; }
  if (e.type === 'glitchl'){ e.facing = -1; e.cool = 80 + (s.x % 3) * 25; }
  if (e.type === 'fbun'){ e.facing = -1; }
}
// ---- Glitch Doors (6-1): step into the magenta door, come out of the cyan one ----
function portalRows(pt){ if (pt.ra === undefined){ pt.ra = surfaceRow(pt.ax); pt.rb = pt.by !== undefined ? pt.by + 1 : surfaceRow(pt.bx); } return pt; }
function cryptPortals(p){
  if (!lv.portals || !lv.portals.length || p.ctrl !== 'normal' || p.dead) return;
  if (p.portalCD > 0){ p.portalCD--; return; }
  const cx = p.x + p.w / 2, feet = p.y + p.h;
  for (const pt of lv.portals){ portalRows(pt);
    if (cx < pt.ax * TS || cx > pt.ax * TS + 16 || feet < (pt.ra - 3) * TS || feet > pt.ra * TS + 1) continue;
    cryFx.push({ kind: 'ring', x: pt.ax * TS + 8, y: (pt.ra - 1) * TS, t: 0, col: CRY.M });
    p.x = pt.bx * TS + 18; p.y = pt.rb * TS - p.h; p.vy = 0; p.vx = Math.min(Math.abs(p.vx), 1.2); p.facing = 1; p.plat = null; p.portalCD = 30; p.inv = Math.max(p.inv, 20);
    camX = Math.max(0, Math.min(p.x - 100, lv.w * TS - W)); if (G.camLockX !== null) camX = Math.min(camX, G.camLockX);
    for (const s of lv.spawns) if (s.x * TS < camX) s.done = true; enemies = enemies.filter(e => e.x > camX - 24 || e === BOSS);
    cryFx.push({ kind: 'ring', x: pt.bx * TS + 8, y: (pt.rb - 1) * TS, t: 0, col: CRY.C });
    G.portals = (G.portals || 0) + 1; A.sfx('portal'); if (!G.portalSaid){ G.portalSaid = true; popup(p.x - 20, p.y - 14, 'GLITCH DOOR!', CRY.C); }
    return;
  }
}
// ---- jam geysers (6-2): a column of grape jam erupts on a cycle and carries you over the pit ----
function geyserState(pl, f){
  const z = pl.gz, t = (((f === undefined ? pl.t : f) % z.period) + z.period) % z.period, low = H + 24, top = pl.y0;
  const a = z.idle, b = a + z.warn, c = b + z.rise, d = c + z.hold, e = d + z.sink;
  if (t < a) return { y: low, ph: 'idle', left: a - t };
  if (t < b) return { y: low, ph: 'warn', left: b - t };
  if (t < c) return { y: low + (top - low) * (t - b) / z.rise, ph: 'rise', left: c - t };
  if (t < d) return { y: top, ph: 'hold', left: d - t };
  if (t < e) return { y: top + (low - top) * (t - d) / z.sink, ph: 'sink', left: e - t };
  return { y: low, ph: 'idle', left: z.period - t };
}
// ---- RGB switch (6-3): hit it and the cyan bridges switch on and the magenta walls drop, for a few seconds ----
function rgbHit(tx, ty){
  if (!lv) return;
  const was = lv.rgbT || 0;
  if (was > RGB_TIME - 24) return;
  lv.rgbT = RGB_TIME; G.rgbHits = (G.rgbHits || 0) + 1; lv.bumps[tx + ',' + ty] = 10;
  A.sfx('rgb'); burst(tx * TS + 8, ty * TS + 4, 10, [CRY.M, CRY.C, CRY.Y], 1.6);
  if (was <= 0){ popup(tx * TS - 18, ty * TS - 12, 'RGB SWITCH!', CRY.C); G.flash = Math.max(G.flash || 0, 6); }
}
function rgbPushOut(){ // a block switched on around you: pop up out of it instead of getting stuck
  if (!P || P.dead) return;
  const inSolid = () => { const x0 = Math.floor(P.x / TS), x1 = Math.floor((P.x + P.w - EPS) / TS), y0 = Math.floor(P.y / TS), y1 = Math.floor((P.y + P.h - EPS) / TS); for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (isSolid(tx, ty)) return true; return false; };
  const y0 = P.y; for (let k = 0; k < 48 && inSolid(); k++) P.y -= 1;
  if (inSolid()){ P.y = y0; const x0 = P.x; for (let d = 1; d <= 24; d++){ P.x = x0 + d; if (!inSolid()) return; P.x = x0 - d; if (!inSolid()) return; } P.x = x0; } // walled in: step sideways out of it
}
function cryptPlayer(p){
  cryptPortals(p);
  if (p.plat && p.plat.axis === 'geyser' && p.plat.y > H - 10){ p.plat = null; p.onGround = false; } // rode it down into the jam
  // bump the RGB switch: walk into it, land on it or butt it from below
  if (lv.rgbZones || lv.hasSwitch){ const x0 = Math.floor((p.x - 1) / TS), x1 = Math.floor((p.x + p.w + 1) / TS), y0 = Math.floor((p.y - 1) / TS), y1 = Math.floor((p.y + p.h + 1) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (tileAt(tx, ty) === 'Z') rgbHit(tx, ty); }
  if (p.sauce > 0){ p.sauce--; if (G.frame % 3 === 0) parts.push({ x: p.x + 2 + Math.random() * (p.w - 4), y: p.y + 2, vx: 0, vy: -0.8, g: -0.01, life: 12, color: Math.random() < 0.5 ? CRY.MG : CRY.Y, size: 1 }); if (p.sauce === 0) popup(p.x - 16, p.y - 12, 'SAUCE WORE OFF', CRY.AS); }
}
// ---- enemies ----
function crySpawnCrumbs(e){ for (let i = 0; i < 2; i++){ const c = spawnEnemy('crumb6', e.x + 2 + i * 4, e.y + e.h - 9); c.facing = i ? 1 : -1; c.vy = -2.6; c.vx = (i ? 1 : -1) * 0.8; burst(c.x + 3, c.y + 2, 4, [CRY.BR, CRY.CR], 1); } }
function cryGlitchSpot(e){
  const ptx = Math.floor((P.x + P.w / 2) / TS);
  for (const d of (Math.random() < 0.5 ? [3, -3, 4, -4] : [-3, 3, -4, 4])){ const tx = ptx + d; if (tx * TS < camX + 8 || tx * TS > camX + W - 24) continue;
    const row = surfaceRow(tx); if (row >= 15 || isSolid(tx, row - 1)) continue; if (Math.abs(row * TS - (P.y + P.h)) > 40) continue; return { x: tx * TS + 3, y: row * TS - e.h }; }
  return null;
}
function updateCryptEnemy(e, dx, dy){
  const near = Math.abs(dx) < 170 && !P.dead && P.ctrl === 'normal', pcx = P.x + P.w / 2, ecx = e.x + e.w / 2;
  const onScreen = e.x > camX - 8 && e.x < camX + W - 4;
  let grav = true;
  switch (e.type){
    case 'rtoast': // Rage Toaster: revs up, charges, slams walls and pops toast
      if (e.state === 'rev'){ e.vx = 0; if (G.frame % 3 === 0) smoke(ecx, e.y); if (--e.t <= 0){ e.state = 'charge'; e.t = 80; A.sfx('whoosh'); } break; }
      if (e.state === 'charge'){ e.vx = 2.4 * e.facing; if (e.onGround && !aheadSupported(e)){ e.vx = 0; e.state = 'pop'; e.t = 26; }
        if (--e.t <= 0){ e.state = 'pop'; e.t = 26; } break; }
      if (e.state === 'pop'){ e.vx = 0; if (e.t === 20){ for (const k of [-1, 1]) bolts.push({ kind: 'toast6', x: ecx - 4, y: e.y - 4, w: 7, h: 6, vx: (dx < 0 ? -1 : 1) * (0.8 + (k > 0 ? 0.7 : 0)), vy: -3.6 - (k > 0 ? 0.4 : 0), g: 0.18, t: 0 }); A.sfx('pop6'); }
        if (--e.t <= 0){ e.state = 'walk'; e.cool = 110; } break; }
      if (near && onScreen && e.onGround && Math.abs(dy) < 24 && Math.abs(dx) < 150) e.facing = dx < 0 ? -1 : 1; // it has seen you
      e.vx = 0.5 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.cool > 0) e.cool--; else if (near && onScreen && Math.abs(dx) < 140 && Math.abs(dy) < 24 && e.onGround){ e.state = 'rev'; e.t = 30; e.facing = dx < 0 ? -1 : 1; sfxOnce('rev6'); }
      break;
    case 'bend': e.vx = 0.45 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing; if (G.frame % 20 === 0) smoke(ecx, e.y); break;
    case 'crumb6': if (++e.t > 300){ e.remove = true; burst(ecx, e.y + 6, 5, [CRY.BR, CRY.CR], 1); break; } if (e.onGround){ e.vx = 0.9 * e.facing; if (!aheadSupported(e)) e.facing = -e.facing; if (e.anim % 50 === 0){ e.vy = -2.4; e.facing = dx < 0 ? -1 : 1; } } break;
    case 'bblob': e.vx = 0.25 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.onGround && ++e.trailT >= 26){ e.trailT = 0; const y = Math.round((e.y + e.h) / TS) * TS; if (patches.filter(q => q.blob).length < 14) patches.push({ kind: 'butter', blob: true, x: e.x - 2, y, w: 18, t: 360 }); } break;
    case 'sskull': grav = false; e.t++; e.facing = dx < 0 ? -1 : 1;
      if (e.state === 'float'){ e.x = e.homeX + Math.sin(e.t * 0.03) * 16; e.y = e.homeY + Math.sin(e.t * 0.07) * 4; if (e.t > 120 && near && onScreen){ e.state = 'blink'; e.t = 0; A.sfx('static'); } }
      else if (e.state === 'blink'){ if (e.t === 20){ const nx = Math.max(camX + 16, Math.min(camX + W - 32, pcx + (Math.random() < 0.5 ? -1 : 1) * (50 + Math.random() * 30))); e.homeX = nx; e.x = nx; e.homeY = Math.max(4 * TS, Math.min(9 * TS, P.y - 40)); e.y = e.homeY; }
        if (e.t > 40){ e.state = 'aim'; e.t = 0; } }
      else if (e.state === 'aim'){ if (e.t > 18){ e.state = 'burst'; e.t = 0; e.n = 0; } }
      else if (e.state === 'burst'){ if (e.t % 9 === 1 && e.n < 3){ const a = Math.atan2(P.y + 8 - (e.y + 7), pcx - ecx); bolts.push({ kind: 'rgb6', c: e.n, x: ecx - 3, y: e.y + 4, w: 5, h: 5, vx: Math.cos(a) * 1.8, vy: Math.sin(a) * 1.8, t: 0 }); e.n++; A.sfx('zap'); } if (e.t > 30){ e.state = 'float'; e.t = 0; } }
      break;
    case 'glitchl': // Glitchling: a skull grunt that teleports next to you
      if (e.state === 'glitch'){ e.vx = 0; if (--e.t <= 0){ const sp = cryGlitchSpot(e); if (sp){ burst(ecx, e.y + 5, 6, [CRY.M, CRY.C], 1.2); e.x = sp.x; e.y = sp.y; e.vy = 0; burst(e.x + 5, e.y + 5, 6, [CRY.M, CRY.C], 1.2); A.sfx('portal'); } e.state = 'stun'; e.t = 26; e.facing = P.x + P.w / 2 < e.x + 5 ? -1 : 1; } break; }
      if (e.state === 'stun'){ e.vx = 0; if (--e.t <= 0){ e.state = 'walk'; e.cool = 130; } break; }
      if (near && onScreen && e.onGround && Math.abs(dx) < 150) e.facing = dx < 0 ? -1 : 1;
      e.vx = 0.6 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.cool > 0) e.cool--; else if (near && onScreen && Math.abs(dx) < 150 && Math.abs(dx) > 40 && e.onGround){ e.state = 'glitch'; e.t = 18; sfxOnce('static'); }
      break;
    case 'fbun': // Fuse Bun: waddles at you, lights its fuse up close, then pops
      if (e.state === 'lit'){ e.vx = 0; if (G.frame % 3 === 0) parts.push({ x: ecx + 1, y: e.y, vx: (Math.random() - 0.5) * 0.8, vy: -1, g: 0.05, life: 10, color: Math.random() < 0.5 ? CRY.Y : CRY.R, size: 1 }); if (e.t % 12 === 0) sfxOnce('fuse'); if (--e.t <= 0){ e.remove = true; boom(ecx, e.y + 6, 30, { power: 1, dmg: 3, owner: 'e' }); } break; }
      e.vx = (near && Math.abs(dx) < 100 ? 0.65 : 0.4) * e.facing; if (near && Math.abs(dx) < 100 && e.onGround) e.facing = dx < 0 ? -1 : 1; if (e.onGround && !aheadSupported(e)){ e.facing = -e.facing; e.vx = 0; }
      if (near && Math.abs(dx) < 30 && Math.abs(dy) < 18){ e.state = 'lit'; e.t = 60; A.sfx('fuse'); }
      break;
    case 'shard': // Quartz shard (Quartz King minion): drifts at you
      grav = false; e.t++; { const ty = P.y + 3 + Math.sin(e.t * 0.06) * 5; e.facing = dx < 0 ? -1 : 1; e.vx += (Math.sign(dx) * 0.6 - e.vx) * 0.04; e.vy += (Math.sign(ty - e.y) * 0.6 - e.vy) * 0.06; e.x += e.vx; e.y += e.vy; if (e.y > 13 * TS - e.h) e.y = 13 * TS - e.h; }
      if (e.t % 20 === 0) sfxOnce('crystal');
      if (e.t > 720 || !BOSS || BOSS.dying || BOSS.dead){ e.remove = true; burst(ecx, e.y + 3, 6, [CRY.Q, CRY.Q2], 1.2); }
      return;
  }
  if (grav){ e.vy = Math.min(e.vy + 0.3, 4.5); e.x += e.vx; if (collideX(e)){ if (e.type === 'rtoast' && e.state === 'charge'){ e.state = 'pop'; e.t = 26; G.shake = Math.max(G.shake, 4); A.sfx('clang'); burst(e.facing > 0 ? e.x + e.w : e.x, e.y + 6, 6, ['#cfd6e2', CRY.Y], 1.4); } e.facing = -e.facing; } e.y += e.vy; collideY(e); }
  if (e.y > H + 16 || (!lv.camLock && (e.x < camX - 80 || e.x > camX + W + 160))) e.remove = true;
}
function updateCryptBolt(b){
  b.t++;
  if (b.kind === 'toast6'){ b.vy = Math.min(b.vy + (b.g || 0.18), 4.5); b.x += b.vx; b.y += b.vy; if (b.vy > 0 && isSolid(Math.floor((b.x + 3) / TS), Math.floor((b.y + 6) / TS))){ b.remove = true; burst(b.x + 3, b.y + 3, 4, [CRY.CR, '#e0a24a'], 1); } }
  else { b.x += b.vx; b.y += b.vy; if (isSolid(Math.floor((b.x + 2) / TS), Math.floor((b.y + 2) / TS))){ b.remove = true; burst(b.x + 2, b.y + 2, 3, [CRY.M, CRY.C], 0.8); } if (b.t % 3 === 0) parts.push({ x: b.x + 2, y: b.y + 2, vx: 0, vy: 0, g: 0, life: 8, color: [CRY.R, '#3aff6a', CRY.C][b.c || 0], size: 1 }); }
  if (b.t > 260 || b.y > H + 8 || (!lv.camLock && (b.x < camX - 32 || b.x > camX + W + 32))) b.remove = true;
}
function cryptStomp(e){
  if (!CRYPT_TYPES.has(e.type)) return false;
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (e.type === 'bend'){ e.remove = true; burst(cx, cy, 10, [CRY.BR, '#3a2414', CRY.MG], 1.6); crySpawnCrumbs(e); G.kills++; return true; }
  if (e.type === 'fbun'){ e.remove = true; boom(cx, cy, 26, { power: 1, dmg: 3, owner: 'p' }); G.kills++; return true; } // stomped: it pops under you, harmlessly for you
  if (e.type === 'rtoast'){ e.dead = 'squash'; e.t = 26; burst(cx, cy, 10, ['#cfd6e2', '#8e96a6', CRY.CR], 1.6); return true; }
  if (e.type === 'bblob'){ e.remove = true; burst(cx, cy, 12, [CRY.BU, '#fff3a8', CRY.BU2], 1.8); patches.push({ kind: 'butter', blob: true, x: e.x - 3, y: e.y + e.h, w: 20, t: 240 }); return true; }
  if (e.type === 'sskull' || e.type === 'glitchl' || e.type === 'shard' || e.type === 'crumb6'){ e.remove = true; burst(cx, cy, 10, [CRY.M, CRY.C, CRY.BN, CRY.Q], 1.6); return true; }
  return false;
}
function cryptContact(e){ // true = handled (no hurt / stomp from the generic code)
  if (e.type === 'sskull' && e.state === 'blink') return true; // pure static: passes through you
  if (e.type === 'glitchl' && e.state === 'glitch' && e.t < 10) return true;
  if (e.type === 'crumb6' && e.t < 24) return true; // still tumbling out of the split
  return false;
}
function cryptBlock(e, src){ return (e.type === 'sskull' && e.state === 'blink') || (e.type === 'crumb6' && e.t < 12); } // fresh crumbs outlive the blast that split them; // can't shoot static
function cryptDeath(e, src){
  if (e.type === 'fbun'){ e.remove = true; G.kills++; addScore(200, e.x, e.y - 8); boom(e.x + 6, e.y + 6, 30, { power: 1, dmg: 3, owner: 'p' }); return true; } // shot: it blows up where it stands
  return false;
}
function cryptKill(e){ if (e.type === 'bend') crySpawnCrumbs(e); }
// ---- per-frame world update + hazards ----
function cryptUpdate(){
  for (const f of cryFx) f.t++; cryFx = cryFx.filter(f => f.t < 30);
  if (lv.rgbT > 0){ lv.rgbT--; if (lv.rgbT < 120 && lv.rgbT % 20 === 0) A.sfx('tick6'); if (lv.rgbT === 0){ A.sfx('rgboff'); rgbPushOut(); } }
  for (const pl of plats) if (pl.axis === 'geyser'){ const gs = geyserState(pl); if (gs.ph === 'warn' && gs.left === pl.gz.warn - 1 && Math.abs(pl.x - camX - 128) < 200) sfxOnce('bubble'); if (gs.ph === 'rise' && gs.left === pl.gz.rise - 1 && Math.abs(pl.x - camX - 128) < 200) sfxOnce('geyser'); G.geyserRides = G.geyserRides || 0; if (P && P.plat === pl && !pl.ridden){ pl.ridden = true; G.geyserRides++; } if (gs.ph === 'idle') pl.ridden = false; }
  const b = BOSS; if (b && b.kind === 'quartz') quartzUpdateHazards(b);
}
function cryptHazards(){
  if (P.ctrl !== 'normal' || P.dead) return;
  const b = BOSS; if (b && b.kind === 'quartz') quartzHurtCheck(b);
}
// ---------------- THE QUARTZ KING (World 6 boss) ----------------
// A weathered stone skull with a cluster crown of pink and clear quartz points (from Coty's real skull shelf).
// Phase 1: hop + floor slam (crystal shock waves both ways), quartz spikes erupt from the floor where you stand.
// Phase 2 "PRISM MODE" (HP <= 6): double slams, prism beams from the ceiling, a quartz shard minion.
// Phase 3 "FULL FACET" (HP <= 3): faster, three spikes / beams at a time, two shards. At 0 HP: "CROWNLESS!", then TOASTED!
function makeQuartz(spec){
  const deck = spec.deckRow * TS;
  spec.baseLine1 = spec.baseLine1 || spec.line1; spec.baseLine2 = spec.baseLine2 || spec.line2;
  return { kind: 'quartz', spec, deck, x: spec.tx * TS, y: deck - 40, w: 34, h: 40, vx: 0, vy: 0, hp: 9, flash: 0, state: 'dormant', t: 0, dir: -1,
    active: false, dying: false, dead: false, dt: 0, by: null, phase: 1, cyc: 0, drips: [], puddles: [], chip: 0, onGround: true, pose: 'idle', slams: 0, buzzT: 120, carded: false };
}
function quartzCrown(b){ return Math.max(0, Math.min(6, Math.ceil(b.hp * 6 / 9))); }
function quartzDamage(src){
  const b = BOSS; if (!b || b.dying || b.dead || b.flash > 0) return;
  const c0 = quartzCrown(b); b.hp--; b.flash = 50; G.shake = 9; A.sfx('bosshit'); b.pose = 'hurt';
  burst(b.x + b.w / 2, b.y + 10, 16, [CRY.Q, CRY.Q2, '#ffffff', CRY.SK2], 2.4);
  if (quartzCrown(b) < c0){ A.sfx('crystal'); for (let i = 0; i < 6; i++) parts.push({ x: b.x + 8 + Math.random() * 20, y: b.y - 4, vx: (Math.random() - 0.5) * 2.4, vy: -2.5 - Math.random() * 2, g: 0.2, life: 40, color: i % 2 ? CRY.Q : CRY.Q2, size: 2 }); } // a crown point snaps off
  if (b.hp <= 0){ quartzDie(src); return; }
  popup(b.x - 4, b.y - 12, 'HP ' + b.hp, CRY.Q);
  if (b.hp <= 6 && b.phase === 1){ b.phase = 2; b.state = 'idle'; b.t = 0; b.buzzT = 30; G.bigText = { text: 'PRISM MODE', t: 0 }; A.sfx('curse'); A.setTempo(1.12); }
  else if (b.hp <= 3 && b.phase === 2){ b.phase = 3; b.state = 'idle'; b.t = 0; b.buzzT = 20; G.bigText = { text: 'FULL FACET', t: 0 }; A.sfx('curse'); A.setTempo(1.25); }
}
function quartzDie(by){
  const b = BOSS; b.dying = true; b.by = by; b.dt = 0; b.drips = []; b.vx = 0; A.stopMusic(); A.sfx('powerdown'); addScore(5000, b.x, b.y - 18);
  bolts.forEach(o => o.remove = true); for (const e of enemies) if (e.type === 'shard') e.remove = true;
  G.quartzDown = true;
}
function quartzHazard(b, x, kind){ const ax0 = b.spec.bounds[0] * TS + 8, ax1 = (b.spec.bounds[1] + 1) * TS - 8; b.drips.push({ x: Math.max(ax0, Math.min(ax1, x)), kind, state: 'warn', t: 0 }); }
function quartzUpdateHazards(b){
  for (const d of b.drips){ d.t++;
    if (d.state === 'warn'){ if (d.t > (b.phase === 3 ? 34 : 46)){ d.state = 'fall'; d.t = 0; A.sfx(d.kind === 'beam' ? 'beam6' : 'spike6'); if (d.kind === 'spike') burst(d.x, b.deck - 2, 6, [CRY.Q, CRY.Q2], 1.4); G.quartzHaz = (G.quartzHaz || 0) + 1; } }
    else if (d.t > (d.kind === 'beam' ? 26 : 40)) d.remove = true; }
  b.drips = b.drips.filter(d => !d.remove);
}
function spikeH(d){ return d.t < 6 ? d.t * 5 : d.t > 30 ? Math.max(0, 28 - (d.t - 30) * 3) : 28; }
function quartzHurtCheck(b){
  const pcx = P.x + P.w / 2;
  for (const d of b.drips){ if (d.state !== 'fall') continue;
    if (d.kind === 'beam' && Math.abs(pcx - d.x) < 7 && d.t > 2){ hurt(); return; }
    if (d.kind === 'spike' && Math.abs(pcx - d.x) < 7 && P.y + P.h > b.deck - spikeH(d) + 2){ hurt(); if (G.state === 'play' && !P.dead){ P.vy = -4; P.onGround = false; } return; } }
}
function quartzSlam(b){
  const sp = b.phase === 3 ? 2.1 : b.phase === 2 ? 1.9 : 1.7;
  for (const d of [-1, 1]) bolts.push({ kind: 'gwave', boss: true, quartz: true, x: b.x + b.w / 2 - 5 + d * 18, y: b.deck - 9, w: 10, h: 9, vx: d * sp, vy: 0, t: 0 });
  G.shake = 12; A.sfx('hiveslam'); A.sfx('crystal'); b.slams++; G.quartzSlams = (G.quartzSlams || 0) + 1;
  burst(b.x + b.w / 2, b.deck - 2, 14, [CRY.Q, CRY.Q2, CRY.SK2, '#ffffff'], 2.2);
}
function updateQuartz(){
  const b = BOSS, [bx0, bx1] = b.spec.bounds, ax0 = bx0 * TS, ax1 = (bx1 + 1) * TS, pcx = P.x + P.w / 2;
  if (!G.dialogDone){ const fc = P && P.bro === 'fatcoty'; b.spec.line1 = fc ? b.spec.fcLine1 : b.spec.baseLine1; b.spec.line2 = fc ? b.spec.fcLine2 : b.spec.baseLine2; }
  if (b.flash > 0) b.flash--; if (b.flash === 0 && b.pose === 'hurt') b.pose = 'idle';
  if (b.dying){
    b.dt++; b.vy = Math.min(b.vy + 0.3, 4); b.y += b.vy; collideY(b);
    if (b.dt % 4 === 0) burst(b.x + Math.random() * b.w, b.y + Math.random() * 30, 3, [CRY.Q, CRY.Q2, CRY.SK2, CRY.M, CRY.C], 2.4, 30);
    if (b.dt % 18 === 0) boom(b.x + Math.random() * b.w, b.y + 6 + Math.random() * 30, 14, { power: 0, dmg: 0, owner: 'fx' });
    if (b.dt === 30){ G.bigText = { text: 'CROWNLESS!', t: 0 }; A.sfx('crystal'); }
    if (b.dt > 200){ b.dead = true; b.active = false; if (lv.escapeWall) startEscape(); else { G.castleEnd = true; G.endT = 0; A.sfx('clear'); } }
    return;
  }
  if (!b.active) return;
  if (!b.carded){ b.carded = true; G.nameCard = { text: 'QUARTZ KING', t: 0 }; A.sfx('crystal'); G.shake = 10; }
  const sp = b.phase === 3 ? 1.3 : b.phase === 2 ? 1.15 : 1;
  b.t++;
  if (b.phase >= 2 && --b.buzzT <= 0){ b.buzzT = b.phase === 3 ? 220 : 280; const n = enemies.filter(e => e.type === 'shard' && !e.dead && !e.remove).length;
    if (n < (b.phase === 3 ? 2 : 1)){ const e = spawnEnemy('shard', b.x + b.w / 2 - 4, b.y + 2); e.t = 0; e.vx = -0.5; e.vy = -1; burst(e.x + 4, e.y + 3, 8, [CRY.Q, CRY.Q2], 1.4); A.sfx('crystal'); } }
  switch (b.state){
    case 'idle': b.vx = 0; if (b.t > 46 / sp){ b.cyc++; b.state = b.cyc % 2 === 1 ? 'hop' : 'cast'; b.t = 0; b.slams = 0; } break;
    case 'hop':
      if (b.t === 8 && b.onGround){ const goalC = pcx < b.x + b.w / 2 ? Math.max(pcx + 58, ax0 + 60) : Math.min(pcx - 58, ax1 - 60);
        const goal = Math.max(ax0 + 6, Math.min(ax1 - b.w - 6, goalC - b.w / 2)); b.vy = -6.2; b.vx = Math.max(-2.2, Math.min(2.2, (goal - b.x) / 41)); b.pose = 'slam'; A.sfx('roar'); }
      if (b.t > 12 && b.onGround){ b.vx = 0; quartzSlam(b); b.state = 'land'; b.t = 0; }
      if (b.t > 120){ b.state = 'idle'; b.t = 0; }
      break;
    case 'land': b.vx = 0; if (b.t > 22 / sp){ b.pose = 'idle'; if (b.slams < Math.min(2, b.phase)){ b.state = 'hop'; b.t = 0; } else { b.state = 'recover'; b.t = 0; } } break;
    case 'recover': b.vx = 0; if (b.t > 40 / sp){ b.state = 'idle'; b.t = 0; } break;
    case 'cast': b.vx = 0; // crown glows, then spikes (and in phase 2+, prism beams) come for you
      if (b.t === 10){ const n = b.phase === 3 ? 3 : 2, beam = b.phase >= 2 && (b.cyc % 4 === 0), k = beam ? 'beam' : 'spike', mid = (ax0 + ax1) / 2;
        quartzHazard(b, pcx + P.vx * 10, k); if (n >= 2) quartzHazard(b, pcx + (pcx < mid ? 52 : -52), k); if (n >= 3) quartzHazard(b, pcx + (pcx < mid ? -64 : 64), k); b.pose = 'slam'; A.sfx('roar'); }
      if (b.t === 24) b.pose = 'idle';
      if (b.t > 80 / sp){ b.state = 'idle'; b.t = 0; } break;
  }
  b.vy = Math.min(b.vy + 0.3, 5); b.x += b.vx; b.x = Math.max(ax0 + 4, Math.min(ax1 - b.w - 4, b.x)); b.y += b.vy; collideY(b);
  b.dir = pcx < b.x + b.w / 2 ? -1 : 1;
  if (P.ctrl === 'normal' && !P.dead && overlap(P, { x: b.x + 4, y: b.y + 6, w: b.w - 8, h: b.h - 6 })){ if (P.star > 0){ if (!b.flash) quartzDamage('star'); } else hurt(); }
}
function drawQuartz(){
  const b = BOSS; if (!b || b.dead) return;
  const C6 = S.crypt, X = Math.round(b.x - camX) - 7, Y = Math.round(b.y) - 8;
  if (b.flash > 0 && (G.frame & 2)) g.filter = 'brightness(1.8)';
  const set = C6.kingCrown[quartzCrown(b)], img = b.pose === 'hurt' ? set.hurt : (b.pose === 'slam' || !b.onGround) ? set.slam : set.idle;
  const wob = b.dying ? Math.sin(b.dt * 0.4) * 0.15 : 0;
  g.save(); g.translate(X + 25, Y + 48); g.rotate(wob); if (b.dir > 0) g.scale(-1, 1); g.drawImage(img, -25, -48); g.restore(); g.filter = 'none';
  if (b.state === 'cast' && b.t < 24 && !b.dying){ g.globalAlpha = 0.35 + 0.25 * Math.sin(G.frame * 0.6); g.fillStyle = CRY.Q2; g.beginPath(); g.arc(X + 25, Y + 10, 20, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } // crown glow
  if (G.dialog) drawTextC(g, 'THE QUARTZ KING', 128, 138, (G.frame >> 3) % 2 ? CRY.Q : CRY.C, 1, '#000');
  if (G.dialogDone && !b.dying){ g.fillStyle = CRY.I; g.fillRect(70, 26, 116, 6); g.fillStyle = b.phase === 3 ? CRY.R : b.phase === 2 ? CRY.M : CRY.Q; g.fillRect(71, 27, Math.round(114 * b.hp / 9), 4); drawTextC(g, 'QUARTZ KING', 128, 34, '#ffffff', 1, '#000'); }
}
// ---- drawing ----
function drawCryptEnemy(e, X){
  const C6 = S.crypt; if (!C6 || !CRYPT_TYPES.has(e.type)) return false;
  const Y = Math.round(e.y), side = e.facing > 0 ? 'R' : 'L', f = (e.anim >> 3) & 1;
  let img = null, ox = -1, oy = 0;
  switch (e.type){
    case 'rtoast': img = (e.state === 'rev' || e.state === 'charge' ? C6.rtoastMad : C6.rtoast)[side][f]; ox = -1; oy = e.h - 14; if (e.state === 'rev') ox += (G.frame & 1) ? 1 : -1; break;
    case 'bend': img = C6.bend[side][f]; ox = -1; oy = e.h - 12; break;
    case 'crumb6': img = C6.crumb[side][f]; ox = 0; oy = e.h - 6; break;
    case 'bblob': img = C6.bblob[side][f]; ox = -1; oy = e.h - 11; break;
    case 'sskull': if (e.state === 'blink' && (G.frame & 1)) return true; img = (e.state === 'blink' ? C6.sskullBlink : C6.sskull)[side][(G.frame >> 3) & 1]; ox = -1; oy = -1; if (e.state === 'aim'){ g.globalAlpha = 0.5; g.strokeStyle = CRY.R; g.beginPath(); g.arc(X + 8, Y + 6, 10 - e.t * 0.3, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } break;
    case 'glitchl': if (e.state === 'glitch' && (G.frame >> 1) % 2) return true; img = C6.glitchl[side][f]; ox = -1; oy = e.h - 12; break;
    case 'fbun': img = (e.state === 'lit' ? C6.fbunLit : C6.fbun)[side][f]; ox = -1; oy = e.h - 13; if (e.state === 'lit' && (e.t >> 2) % 2) g.filter = 'brightness(1.8)'; break;
    case 'shard': img = C6.shard[side][(G.frame >> 2) & 1]; ox = -1; oy = -1; break;
  }
  if (img){
    if (e.hitT > 0 && (e.hitT & 2)) g.filter = 'brightness(2)';
    if (e.dead === 'flip'){ g.save(); g.translate(X + ox, Y + oy + img.height); g.scale(1, -1); g.drawImage(img, 0, 0); g.restore(); }
    else if (e.dead === 'squash'){ g.drawImage(img, 0, img.height / 2, img.width, img.height / 2, X + ox, Y + oy + img.height / 2, img.width, img.height / 2); }
    else g.drawImage(img, X + ox, Y + oy);
    g.filter = 'none';
  }
  return true;
}
function drawGeyser(pl){
  const gs = geyserState(pl), X = Math.round(pl.x - camX); if (X > W + 40 || X + pl.w < -40) return;
  const core = TSET.bg === 'crycore', c0 = core ? CRY.MG : CRY.JAM, c1 = core ? CRY.MG2 : CRY.JAM3, c2 = core ? '#a8320c' : CRY.JAM2;
  if (gs.ph === 'warn' || gs.ph === 'idle'){ const k = gs.ph === 'warn' ? 1 : 0.3; g.globalAlpha = k; for (let i = 0; i < 5; i++){ const bx = X + 4 + ((i * 11 + G.frame) % (pl.w - 8)), by = H - 6 - ((G.frame * 1.5 + i * 13) % 14); g.fillStyle = i % 2 ? c1 : c0; g.fillRect(bx, by, 3, 3); } g.globalAlpha = 1; if (gs.ph === 'warn' && (G.frame >> 2) % 2){ g.fillStyle = c1; g.fillRect(X + 2, H - 3, pl.w - 4, 2); } return; }
  const y = Math.round(pl.y);
  g.fillStyle = CRY.I; g.fillRect(X - 1, y, pl.w + 2, H - y); g.fillStyle = c2; g.fillRect(X, y + 2, pl.w, H - y); g.fillStyle = c0; g.fillRect(X + 3, y + 2, pl.w - 6, H - y);
  g.fillStyle = c1; for (let j = y + 6; j < H; j += 9) g.fillRect(X + 5 + ((j + G.frame * 2) % (pl.w - 12)), j, 3, 2);
  g.fillStyle = CRY.I; g.fillRect(X - 2, y - 1, pl.w + 4, 4); g.fillStyle = c0; g.fillRect(X - 1, y, pl.w + 2, 3); g.fillStyle = c1; for (let i = 0; i < pl.w; i += 5) g.fillRect(X + i, y - 1 + ((i + (G.frame >> 2)) % 2), 3, 1); // bubbling crest
  if (!core){ g.fillStyle = CRY.BN; g.fillRect(X + 6, y + 8, 1, 1); g.fillRect(X + pl.w - 9, y + 14, 1, 1); } // jam seeds
  if (gs.ph === 'hold' && gs.left < 40 && (G.frame >> 2) % 2){ g.fillStyle = CRY.Y; g.fillRect(X + pl.w / 2 - 1, y - 8, 2, 4); g.fillRect(X + pl.w / 2 - 1, y - 3, 2, 1); } // about to sink: !
}
function drawCryptHazards(){
  if (!inCrypt()) return;
  // jam (or magma) at the bottom of every pit
  if (lv.pitFill){ const core = TSET.bg === 'crycore', c0 = core ? CRY.MG : CRY.JAM, c1 = core ? CRY.MG2 : CRY.JAM3; const x0 = Math.max(0, Math.floor(camX / TS)), x1 = Math.min(lv.w - 1, x0 + 17);
    for (let tx = x0; tx <= x1; tx++){ if (isSolid(tx, 14) || tileAt(tx, 14) === 'A') continue; const X = Math.round(tx * TS - camX), wy = H - 10 + Math.round(Math.sin(tx * 0.9 + G.frame * 0.08) * 1.5); g.fillStyle = CRY.I; g.fillRect(X, wy - 1, 16, 1); g.fillStyle = c0; g.fillRect(X, wy, 16, H - wy); g.fillStyle = c1; g.fillRect(X + ((tx * 5 + (G.frame >> 3)) % 12), wy + 1, 3, 1); } }
  // glitch doors
  for (const pt of lv.portals || []){ portalRows(pt);
    for (const [tx, row, col, col2] of [[pt.ax, pt.ra, CRY.M, '#ff9cec'], [pt.bx, pt.rb, CRY.C, '#b4fcff']]){ const X = Math.round(tx * TS - camX), Y = (row - 2) * TS; if (X < -20 || X > W + 4) continue;
      g.fillStyle = CRY.I; g.fillRect(X - 1, Y - 5, 18, 37); g.beginPath(); g.arc(X + 8, Y, 9, Math.PI, 0); g.fill(); g.fillStyle = '#16121c'; g.fillRect(X + 1, Y - 2, 14, 34);
      const r = rng((G.frame >> 1) * 5 + tx); for (let j = 0; j < 30; j += 2) for (let i = 0; i < 12; i += 2){ const v = r(); if (v < 0.45){ g.fillStyle = v < 0.2 ? col : v < 0.35 ? col2 : '#ffffff'; g.fillRect(X + 2 + i, Y + j, 2, 2); } }
      g.strokeStyle = col; g.lineWidth = 1; g.strokeRect(X + 0.5, Y - 1.5, 15, 33); drawTiny(g, col === CRY.M ? 'IN' : 'OUT', X + (col === CRY.M ? 4 : 2), Y - 9, col); } }
  for (const o of bolts){ if (o.mine) continue; const X = Math.round(o.x - camX), Y = Math.round(o.y);
    if (o.kind === 'toast6') g.drawImage(S.crypt.toastShot, X, Y);
    else if (o.kind === 'rgb6') g.drawImage(S.crypt.rgbShot[o.c || 0], X, Y);
    else if (o.kind === 'gwave' && o.quartz){ g.fillStyle = CRY.Q; g.fillRect(X + 2, Y + 2, 6, 7); g.fillStyle = CRY.Q2; g.fillRect(X + 3, Y, 3, 6); g.fillStyle = '#ffffff'; g.fillRect(X + 4, Y + 1, 1, 3); } }
  for (const f of cryFx){ if (f.kind === 'ring'){ const X = Math.round(f.x - camX), r = 4 + f.t * 2; g.globalAlpha = Math.max(0, 1 - f.t / 30); g.strokeStyle = f.col || CRY.M; g.lineWidth = 2; g.beginPath(); g.ellipse(X, f.y, r * 0.6, r, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } }
  const b = BOSS;
  if (b && b.kind === 'quartz') for (const d of b.drips){ const X = Math.round(d.x - camX);
    if (d.kind === 'spike'){ if (d.state === 'warn'){ if ((G.frame >> 2) % 2){ g.fillStyle = CRY.Q2; for (const ox of [-6, -1, 4]) g.fillRect(X + ox, b.deck - 3, 2, 2); g.fillStyle = 'rgba(255,176,224,0.4)'; g.fillRect(X - 9, b.deck - 1, 18, 1); } }
      else { const h = spikeH(d); if (h > 0) g.drawImage(S.crypt.spike, 0, 0, 12, h, X - 6, b.deck - h, 12, h); } }
    else { if (d.state === 'warn'){ if ((G.frame >> 2) % 2){ g.fillStyle = 'rgba(255,43,214,0.5)'; g.fillRect(X - 1, 3 * TS, 1, b.deck - 3 * TS); g.fillStyle = 'rgba(0,240,255,0.5)'; g.fillRect(X + 1, 3 * TS, 1, b.deck - 3 * TS); } g.fillStyle = CRY.Q2; g.fillRect(X - 3, 3 * TS, 6, 3); }
      else { const w = d.t < 4 ? d.t * 2 : d.t > 20 ? Math.max(1, 12 - (d.t - 20) * 2) : 12; g.globalAlpha = 0.9; g.fillStyle = CRY.M; g.fillRect(X - w / 2 - 2, 3 * TS, w, b.deck - 3 * TS); g.fillStyle = CRY.C; g.fillRect(X - w / 2 + 2, 3 * TS, w, b.deck - 3 * TS); g.fillStyle = '#ffffff'; g.fillRect(X - w / 4, 3 * TS, w / 2, b.deck - 3 * TS); g.globalAlpha = 1; } } }
  // Hot Sauce timer (bottom-left), RGB switch timer (top, under the HUD)
  if (P && P.sauce > 0){ g.fillStyle = CRY.I; g.fillRect(6, 226, 58, 9); g.fillStyle = CRY.DR; g.fillRect(7, 227, 56, 7); g.fillStyle = CRY.R; g.fillRect(7, 227, Math.round(56 * P.sauce / 600), 7); drawTiny(g, 'HOT SAUCE', 10, 228, CRY.Y); }
  if (lv.rgbT > 0 && !(b && b.active)){ const w = Math.round(100 * lv.rgbT / RGB_TIME); g.fillStyle = CRY.I; g.fillRect(77, 226, 102, 9); g.fillStyle = '#1a2030'; g.fillRect(78, 227, 100, 7); g.fillStyle = (lv.rgbT < 120 && (G.frame >> 2) % 2) ? CRY.M : CRY.C; g.fillRect(78, 227, w, 7); drawTiny(g, 'RGB SWITCH', 109, 228, CRY.I); }
}
function cryptPostFxAll(){
  if (!inCrypt()) return;
  cryptPostFx(g, W, H, G.frame, TSET.bg);
  if (G.nameCard && BOSS && BOSS.kind === 'quartz'){ const n = G.nameCard, t = n.t, drop = t < 10 ? -60 + t * 7 : t < 14 ? 10 - (t - 10) * 2 : t > 110 ? (t - 110) * -16 : 0, y = 44 + drop; // the name card drops in on two chains
    g.fillStyle = '#3a3442'; for (let yy = 0; yy < y; yy += 5){ g.fillRect(83, yy, 3, 4); g.fillRect(170, yy, 3, 4); }
    g.fillStyle = CRY.I; g.fillRect(62, y - 2, 132, 26); g.fillStyle = CRY.ST2; g.fillRect(64, y, 128, 22); g.fillStyle = CRY.Q; g.fillRect(64, y, 128, 2); g.fillStyle = CRY.Q3; g.fillRect(64, y + 20, 128, 2);
    drawTextC(g, n.text, 127, y + 8, CRY.M, 1); drawTextC(g, n.text, 129, y + 8, CRY.C, 1); drawTextC(g, n.text, 128, y + 8, CRY.Q2, 1); }
}
// ---- autopilot helpers for World 6 ----
function botCrypt(b, grounded, feet, fx, want, hold){
  const p = P, px = p.x + p.w / 2, ptx = Math.floor(px / TS);
  // the RGB switch: never walk into a cyan / magenta zone unless the timer will last; go bump the switch first
  if (lv.rgbZones){
    const zone = lv.rgbZones.find(z => z.b >= ptx && ptx >= Math.min(z.sw, z.a) - 5);
    if (zone && ptx < zone.a){
      const need = ((zone.b + 1) * TS - px) / 1.5 + 40;
      if ((lv.rgbT || 0) < need){
        const sw = zone.sw;
        if (sw >= ptx){ b.right = true; b.left = false; b.run = false; want = false; const fr = Math.floor((feet - EPS) / TS), ah = Math.floor((fx + 3) / TS); if (grounded && ah < sw && isSolid(ah, fr)){ want = true; hold = 20; } } // walk into the switch ahead (hop anything else in the way)
        else { b.right = false; b.left = true; b.run = false; want = false; } // back to the switch behind us
        bot.rgbWait = true;
        return { want, hold };
      }
    }
    if (zone && ptx >= zone.a){ b.run = true; }
    bot.rgbWait = false;
  }
  // jam geysers: wait at the lip for the jam to be up, hop on, hop off to the far side
  const gz = plats.filter(q => q.axis === 'geyser');
  if (gz.length){
    const on = p.plat && p.plat.axis === 'geyser' ? p.plat : (grounded || p.vy >= 0) ? gz.find(q => px > q.x - 2 && px < q.x + q.w + 2 && Math.abs(q.y - feet) < 5 && q.y < H - 10) : null;
    if (on){ if (on === bot.gzT) bot.gzT = null;
      const nx = gz.filter(q => q.x0 > on.x0 + 8 && q.x0 - (on.x0 + on.w) < 72).sort((u, v) => u.x0 - v.x0)[0];
      const gapEnd = Math.floor((on.x0 + on.w) / TS); let ground = -1; for (let d = 0; d <= 4; d++){ const gb = groundBelow(gapEnd + d, 10); if (gb >= 0 && gb <= 13){ ground = gapEnd + d; break; } }
      const gsOn = geyserState(on);
      b.left = false; b.run = true; want = false;
      if (ground >= 0 && (!nx || ground * TS < nx.x0)){ b.right = true; if (px > on.x + on.w / 2 - 8){ want = true; hold = 30; } }
      else if (nx){ const gn = geyserState(nx); b.right = false; b.run = false; const ws = on.x + on.w - 10; if (px < ws - 4) b.right = true; else if (px > ws + 2 || p.vx > 0.5) b.left = true; if ((gn.ph === 'hold' && gn.left > 50) || (gn.ph === 'rise' && gn.left < 8)){ want = true; hold = 30; b.right = true; b.left = false; b.run = true; bot.gzT = nx; } else if (gsOn.ph === 'sink' || (gsOn.ph === 'hold' && gsOn.left < 12)){ want = true; hold = 30; b.right = false; b.left = true; } }
      else { b.right = true; want = true; }
      return { want, hold };
    }
    if (grounded && gz.some(q => q.x0 > fx && q.x0 - fx < 330)) b.run = false; // walk (short hops) on the way to a geyser pit: a running hop over a cage lands in the jam
    if (grounded){
      const g0 = gz.filter(q => q.x0 + q.w > fx && q.x0 - fx < 70).sort((u, v) => u.x0 - v.x0)[0];
      let pc = -1; for (let c = Math.floor(px / TS); c <= Math.floor(px / TS) + 4; c++) if (groundBelow(c, Math.floor(feet / TS)) < 0){ pc = c; break; }
      if (g0 && pc >= 0 && g0.x0 > fx){
        const lip = (pc * TS - 5) - p.x, gs = geyserState(g0); // > 0: still that far from the last safe spot at the lip
        b.run = false; want = false;
        const stopD = p.vx > 0 ? p.vx * p.vx * 7 : 0; if (lip > 3 + stopD){ b.right = true; b.left = false; } else if (lip > 3 && p.vx > 0.3){ b.right = false; b.left = true; }
        else { b.right = false; if (p.vx > 0.3) b.left = true;
          const behind = enemies.find(e => !e.dead && !e.remove && e.x + e.w < px && px - e.x < 90 && Math.abs(e.y + e.h - feet) < 20); if (behind && p.facing > 0) b.left = true; // waiting at the lip: turn and deal with whatever walks up behind us
          if ((gs.ph === 'hold' && gs.left > 70) || (gs.ph === 'rise' && gs.left < 6)){ b.left = false; b.right = true; b.run = false; want = true; hold = 40; bot.gzT = g0; } }
        return { want, hold };
      }
    } else if (p.vy > -2){ // in the air over a jam pit: steer onto a geyser that's up, or the far lip
      const tgt = (bot.gzT && geyserState(bot.gzT).ph !== 'sink' && geyserState(bot.gzT).ph !== 'idle') ? bot.gzT : gz.find(q => q.x + q.w > px - 40 && q.x < px + 60 && q.y > feet - 6 && q.y < feet + 70 && geyserState(q).ph === 'hold');
      if (tgt){ const cx = tgt.x + tgt.w / 2; b.right = px < cx - 4; b.left = px > cx + 4; b.run = false; }
      else if (p.vy > 0 && gz.some(q => Math.abs(q.x + q.w / 2 - px) < 90) && groundBelow(Math.floor((px + p.vx * 10) / TS), Math.floor(feet / TS)) < 0){ b.right = false; b.left = true; b.run = false; } // no jam up to land on: back to the lip
    }
  }
  // a lit Fuse Bun nearby: back off and let it pop
  const fb = enemies.find(e => e.type === 'fbun' && e.state === 'lit' && !e.dead && Math.abs(e.x + 6 - px) < 52 && Math.abs((e.y + e.h) - feet) < 24);
  if (fb && grounded){ const away = fb.x + 6 > px ? -1 : 1; b.left = away < 0; b.right = away > 0; b.run = true; want = false; }
  return { want, hold };
}
function cryptSauce(p, n0){ p.cool = Math.max(3, Math.round(p.cool * 0.55)); for (let i = n0; i < shots.length; i++){ shots[i].dmg = (shots[i].dmg || 1) * 1.4; shots[i].sauce = true; } }

// ================= v0.9 WORLD 7: TOASTY ARCADE =================
// Mr. Toasty's neon after-hours arcade (lore: lore/arcade.md). Pusher shelves in the Lobby (7-1), claw cranes as moving platforms
// on the Prize Shelves (7-2), flickering CRT platforms in the No Signal Hall (7-3), and THE JACKPOT VAULT in the castle (7-4).
// World pickup: Hot Streak (spinning tokens + hotter shots). Tokens and prize tickets are score only: no cash, no betting, no wallets.
// Jam is always grape purple (#b54e8c).
Object.assign(EDEF, { ttoken: { w: 12, h: 13, hp: 2 }, ccrab: { w: 14, h: 12, hp: 2 }, minifig: { w: 7, h: 9, hp: 1 }, clawd: { w: 14, h: 14, hp: 3, fly: true },
  sghost: { w: 13, h: 14, hp: 2, fly: true }, tsnake: { w: 16, h: 20, hp: 2 } });
const ARCADE_TYPES = new Set(['ttoken', 'ccrab', 'minifig', 'clawd', 'sghost', 'tsnake']);
const CRT_PERIOD = 260, STREAK_TIME = 720;
let arcFx = [], arcToks = [];
function inArcade(){ return !!(TSET && TSET.arcade); }
function arcadeInit(e, s){
  if (e.type === 'ttoken'){ e.facing = -1; e.roll = 0; e.state = 'roll'; }
  if (e.type === 'ccrab'){ e.facing = -1; e.cool = 40 + (s.x % 3) * 15; e.state = 'walk'; }
  if (e.type === 'minifig'){ e.facing = -1; e.t = 0; }
  if (e.type === 'clawd'){ e.state = 'hang'; e.homeY = e.y; e.homeX = e.x; e.t = 0; e.cool = 0; e.back = s.back !== undefined ? s.back : Math.max(2, s.x - 10); }
  if (e.type === 'sghost'){ e.state = 'float'; e.homeX = e.x; e.homeY = e.y; e.t = (s.x % 5) * 17; }
  if (e.type === 'tsnake'){ e.state = 'hide'; e.cool = 0; e.t = 0; e.lash = 0; e.facing = -1; }
}
// ---- pusher shelves (7-1) and claw cranes (7-2): platforms that carry you on a timed path ----
const ease3 = k => k * k * (3 - 2 * k);
function pusherState(pl, f){
  const z = pl.pz, t = ((((f === undefined ? pl.t : f)) % z.period) + z.period) % z.period;
  if (t < z.dwell) return { x: pl.x0, ph: 'left', left: z.dwell - t };
  if (t < z.dwell + z.move) return { x: pl.x0 + z.travel * ease3((t - z.dwell) / z.move), ph: 'out', left: z.dwell + z.move - t };
  const t2 = t - z.dwell - z.move;
  if (t2 < z.dwell) return { x: pl.x0 + z.travel, ph: 'right', left: z.dwell - t2 };
  return { x: pl.x0 + z.travel * (1 - ease3((t2 - z.dwell) / z.move)), ph: 'in', left: z.move - (t2 - z.dwell) };
}
function clawState(pl, f){
  const z = pl.cz, t = ((((f === undefined ? pl.t : f)) % z.period) + z.period) % z.period, half = z.period / 2;
  const leg = (tt, from) => { // one direction: dwell, up, move, down
    if (tt < z.dwell) return { dx: from, dy: 0, ph: 'dwell', left: z.dwell - tt };
    let u = tt - z.dwell; if (u < z.up) return { dx: from, dy: -z.lift * ease3(u / z.up), ph: 'up', left: z.up - u };
    u -= z.up; if (u < z.move){ const k = ease3(u / z.move); return { dx: from === 0 ? z.travel * k : z.travel * (1 - k), dy: -z.lift, ph: 'move', left: z.move - u }; }
    u -= z.move; return { dx: from === 0 ? z.travel : 0, dy: -z.lift * (1 - ease3(u / z.down)), ph: 'down', left: z.down - u };
  };
  const a = t < half ? leg(t, 0) : leg(t - half, z.travel), atA = t < half;
  const ph = a.ph === 'dwell' ? (atA ? 'A' : 'B') : a.ph === 'up' ? (atA ? 'upA' : 'upB') : a.ph === 'move' ? (atA ? 'go' : 'back') : (atA ? 'downB' : 'downA');
  return { x: pl.x0 + a.dx, y: pl.y0 + a.dy, ph, left: a.left };
}
function rideEnds(pl){ // the autopilot's view: is it waiting at the start (A) or at the far end (B), and for how long
  if (pl.axis === 'pusher'){ const s = pusherState(pl); return { atA: s.ph === 'left', atB: s.ph === 'right', left: s.left, ph: s.ph }; }
  const s = clawState(pl); return { atA: s.ph === 'A', atB: s.ph === 'B', left: s.left, ph: s.ph };
}
// ---- CRT platforms (7-3): group 0 (magenta) and group 1 (cyan) take turns; they overlap for 45 frames each swap ----
function crtPhase(grp, f){
  const t = ((((f === undefined ? (lv ? lv.crtT || 0 : 0) : f)) % CRT_PERIOD) + CRT_PERIOD) % CRT_PERIOD;
  if (!grp) return t < 175 ? { on: true, left: 175 - t } : { on: false, left: CRT_PERIOD - t };
  if (t >= 130) return { on: true, left: CRT_PERIOD - t + 45 };
  return t < 45 ? { on: true, left: 45 - t } : { on: false, left: 130 - t };
}
function crtOn(grp){ if (!lv || !lv.hasCrt) return true; return crtPhase(grp).on; }
window.crtOn = crtOn; // the CRT wall decor (arcade.js) flickers in sync
function crtSegs(){ // contiguous runs of CRT tiles: { x0, x1, row, grp }
  if (lv._crtSegs) return lv._crtSegs;
  const out = [];
  for (let ty = 3; ty < 15; ty++){ let run = null; for (let tx = 0; tx <= lv.w; tx++){ const c = tx < lv.w ? lv.t[ty][tx] : '.', gp = c === 'n' ? 0 : c === 'N' ? 1 : -1;
    if (run && (gp !== run.grp)){ out.push(run); run = null; } if (gp >= 0 && !run) run = { x0: tx, x1: tx, row: ty, grp: gp }; else if (run) run.x1 = tx; } }
  return (lv._crtSegs = out.sort((a, b) => a.x0 - b.x0));
}
// ---- the player in the arcade: shoves, CRT power, pickups, the claw, Hot Streak ----
function arcadePlayer(p){
  // pusher shelves shove you out of their way (and squash you if there's a wall behind you)
  for (const pl of plats){ if (pl.axis !== 'pusher' || p.plat === pl) continue;
    if (p.x + p.w > pl.x && p.x < pl.x + pl.w && p.y + p.h > pl.y + 3 && p.y < pl.y + 10){
      const dir = pl.dx > 0.05 ? 1 : pl.dx < -0.05 ? -1 : (p.x + p.w / 2 < pl.x + pl.w / 2 ? -1 : 1), x0 = p.x;
      p.x = dir > 0 ? pl.x + pl.w + 0.5 : pl.x - p.w - 0.5; if (collideX(p)){ p.x = x0; hurt(); }
      else if (!p.shoveFx){ p.shoveFx = 20; G.shoves = (G.shoves || 0) + 1; sfxOnce('push7'); popup(p.x - 10, p.y - 12, 'SHOVED!', ARC.CH3); }
    } }
  if (p.shoveFx > 0) p.shoveFx--;
  // Hot Streak: three tokens orbit you and bash whatever they touch; shots run hot
  if (p.streak > 0){ p.streak--;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    for (let k = 0; k < 3; k++){ const a = G.frame * 0.12 + k * 2.094, ox = cx + Math.cos(a) * 20, oy = cy + Math.sin(a) * 15, box = { x: ox - 4, y: oy - 4, w: 8, h: 8 };
      for (const e of enemies){ if (e.dead || e.remove || e === BOSS || !overlap(box, e) || G.frame - (e.stkF || -99) < 18) continue; e.stkF = G.frame; damageEnemy(e, 2, Math.sign(e.x - cx || 1) * 2, { streak: true }); sfxOnce('ding7'); }
      for (const o of bolts){ if (!o.mine && !o.boss && overlap(box, o)){ o.remove = true; burst(ox, oy, 3, [ARC.Y, ARC.W], 1); } }
      if (BOSS && BOSS.active && !BOSS.dying && overlap(box, BOSS) && G.frame % 12 === 0) bossChip(1.5); }
    if (G.frame % 3 === 0) parts.push({ x: p.x + 2 + Math.random() * (p.w - 4), y: p.y + p.h - 2, vx: 0, vy: -0.9, g: -0.01, life: 12, color: Math.random() < 0.5 ? ARC.AM2 : ARC.Y, size: 1 });
    if (p.streak === 0) popup(p.x - 16, p.y - 12, 'STREAK OVER', ARC.CH); }
  // CRT platforms: landing on one counts a hop
  if (lv.hasCrt){ const ft = p.onGround ? floorTile(p) : null, onCrt = ft === 'n' || ft === 'N'; if (onCrt && !p.onCrt) G.crtHops = (G.crtHops || 0) + 1; p.onCrt = onCrt; }
}
function arcTilePickup(c, tx, ty){ // mini figure capsules and prize tickets
  if (c === 'g'){ lv.t[ty][tx] = '.'; G.figs = (G.figs || 0) + 1; lv.figsGot = (lv.figsGot || 0) + 1; addScore(1000, tx * TS, ty * TS - 8); A.sfx('ding7'); popup(tx * TS - 30, ty * TS - 14, 'MINI FIGURE ' + lv.figsGot + '/3', ARC.M3); burst(tx * TS + 8, ty * TS + 8, 8, [ARC.M, ARC.C, ARC.Y], 1.4); return true; }
  if (c === 'k'){ lv.t[ty][tx] = '.'; G.tix = (G.tix || 0) + 1; G.score += 100; sfxOnce('ding7'); burst(tx * TS + 8, ty * TS + 8, 3, [ARC.AM, ARC.W], 1); return true; }
  return false;
}
// the claw has you: up you go, then back to the start of the section (no damage)
function arcadeClawCarry(){
  const p = P, e = p.claw;
  if (!e || e.dead || e.remove){ p.ctrl = 'normal'; p.claw = null; return; }
  e.y -= 2.2; p.x = e.x + e.w / 2 - p.w / 2; p.y = e.y + e.h - 3; p.vx = 0; p.vy = 0;
  if (e.y <= e.homeY - 4){
    const tx = e.back, row = surfaceRow(tx);
    p.x = tx * TS + 2; p.y = row * TS - p.h; p.ctrl = 'normal'; p.claw = null; p.inv = Math.max(p.inv, 60); p.onGround = false; p.plat = null;
    camX = Math.max(0, Math.min(p.x - 100, lv.w * TS - W)); if (G.camLockX !== null) camX = Math.min(camX, G.camLockX);
    e.state = 'rise'; e.cool = 120; G.clawGrabs = (G.clawGrabs || 0) + 1; A.sfx('claw7');
    popup(p.x - 24, p.y - 14, 'BACK TO THE START!', ARC.C); arcFx.push({ kind: 'ring', x: p.x + p.w / 2, y: p.y + 8, t: 0, col: ARC.C });
  }
}
// ---- enemies ----
function arcSpawnFig(e){ const m = spawnEnemy('minifig', e.x + e.w / 2 - 3, e.y + e.h - 9); m.vy = -2.8; m.facing = e.facing; m.t = 0; burst(m.x + 3, m.y + 3, 8, [ARC.M, ARC.C3, ARC.CR], 1.4); A.sfx('pop6'); }
function updateArcadeEnemy(e, dx, dy){
  const near = Math.abs(dx) < 170 && !P.dead && P.ctrl === 'normal', ecx = e.x + e.w / 2;
  const onScreen = e.x > camX - 8 && e.x < camX + W - 4;
  let grav = true;
  switch (e.type){
    case 'ttoken': // Tilt Token: a big token rolling along; stomp it and it topples flat
      if (e.state === 'flat'){ e.vx = 0; if (--e.t <= 0){ e.remove = true; burst(ecx, e.y + 2, 6, [ARC.Y, ARC.Y2], 1.2); } break; }
      e.vx = 1.05 * e.facing; e.roll += e.vx; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing; break;
    case 'ccrab': // Capsule Crab: scuttles sideways, snaps forward when you're close
      if (e.state === 'snap'){ e.vx = 1.6 * e.facing; if (e.onGround && !aheadSupported(e)){ e.vx = 0; e.facing = -e.facing; } if (--e.t <= 0){ e.state = 'walk'; e.cool = 90; } break; }
      e.vx = 0.5 * e.facing; if (e.onGround && !aheadSupported(e)) e.facing = -e.facing;
      if (e.cool > 0) e.cool--; else if (near && onScreen && Math.abs(dx) < 70 && Math.abs(dy) < 20 && e.onGround){ e.state = 'snap'; e.t = 26; e.facing = dx < 0 ? -1 : 1; sfxOnce('claw7'); }
      break;
    case 'minifig': // a mini figure that hopped out of a capsule
      e.t++; if (e.onGround){ e.vx *= 0.8; if (e.t % 40 === 20){ e.facing = dx < 0 ? -1 : 1; e.vy = -2.6; e.vx = 0.9 * e.facing; } }
      if (e.t > 600){ e.remove = true; burst(ecx, e.y + 4, 5, [ARC.CR, ARC.M], 1); } break;
    case 'clawd': // Claw Drop: hangs from the ceiling rail, drops on you, lifts you back to the start of the section
      grav = false; e.t++;
      if (e.state === 'grab'){ e.vx = 0; return; }
      if (e.state === 'hang'){ e.y = e.homeY + Math.sin(e.t * 0.05) * 1.5; if (e.cool > 0) e.cool--; else if (near && Math.abs(dx) < 16 && P.y > e.y){ e.state = 'shake'; e.t = 0; sfxOnce('claw7'); } }
      else if (e.state === 'shake'){ e.x = e.homeX + ((e.t >> 1) % 2 ? 1 : -1); if (e.t > 14){ e.x = e.homeX; e.state = 'drop'; e.vy = 0; } }
      else if (e.state === 'drop'){ e.vy = Math.min(e.vy + 0.5, 5); e.y += e.vy;
        if (P.ctrl === 'normal' && !P.dead && P.inv <= 0 && P.star <= 0 && overlap(P, { x: e.x + 2, y: e.y + 4, w: e.w - 4, h: e.h - 4 })){ e.state = 'grab'; P.ctrl = 'claw'; P.claw = e; P.vx = 0; P.vy = 0; P.plat = null; A.sfx('claw7'); popup(P.x - 18, P.y - 14, 'CLAW DROP!', ARC.R); return; }
        if (isSolid(Math.floor(ecx / TS), Math.floor((e.y + e.h + 1) / TS)) || e.y > 12 * TS){ e.state = 'rise'; A.sfx('clang'); G.shake = Math.max(G.shake, 2); } }
      else if (e.state === 'rise'){ e.y -= 1.6; if (e.y <= e.homeY){ e.y = e.homeY; e.state = 'hang'; e.cool = Math.max(e.cool, 70); } }
      return;
    case 'sghost': // Static Ghost: drifts after you, but only exists while the CRTs are on
      grav = false; e.t++; e.off = !crtOn(0);
      if (!e.off && near){ e.facing = dx < 0 ? -1 : 1; e.vx += (Math.sign(dx) * 0.45 - e.vx) * 0.03; const ty = P.y - 2 + Math.sin(e.t * 0.07) * 6; e.vy += (Math.sign(ty - e.y) * 0.4 - e.vy) * 0.05; }
      else { e.vx *= 0.9; e.vy = Math.sin(e.t * 0.05) * 0.2; }
      e.x += e.vx; e.y += e.vy; if (e.y > 12 * TS - e.h) e.y = 12 * TS - e.h; if (e.y < 3 * TS) e.y = 3 * TS;
      if (e.off !== e.wasOff && onScreen){ sfxOnce('static'); burst(ecx, e.y + 7, 5, [ARC.M, ARC.C, ARC.W], 1); } e.wasOff = e.off;
      return;
    case 'tsnake': // Ticket Snake: lives in a ticket cabinet, whips out a strip of tickets when you come close
      e.vx = 0;
      if (e.state === 'hide'){ e.lash = 0; if (e.cool > 0) e.cool--; else if (near && Math.abs(dx) < 76 && Math.abs(dy) < 26){ e.state = 'warn'; e.t = 0; e.facing = dx < 0 ? -1 : 1; sfxOnce('ticket7'); } }
      else if (e.state === 'warn'){ e.lash = 0; if (++e.t > 24){ e.state = 'out'; e.t = 0; A.sfx('whip7'); } } // the head pokes out and rattles first
      else { e.t++; e.lash = e.t < 12 ? e.t / 12 * 38 : e.t < 32 ? 38 : Math.max(0, 38 - (e.t - 32) * 3); if (e.t > 50){ e.state = 'hide'; e.cool = 70; }
        const lx = e.facing > 0 ? ecx : ecx - e.lash, box = { x: lx, y: e.y + 2, w: e.lash, h: 8 }; if (e.lash > 4 && P.ctrl === 'normal' && !P.dead && overlap(P, box)) hurt(); }
      break;
  }
  if (grav){ e.vy = Math.min(e.vy + 0.3, 4.5); e.x += e.vx; if (collideX(e)) e.facing = -e.facing; e.y += e.vy; collideY(e); }
  if (e.y > H + 16 || (!lv.camLock && (e.x < camX - 80 || e.x > camX + W + 160))) e.remove = true;
}
function arcadeStomp(e){
  if (!ARCADE_TYPES.has(e.type)) return false;
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (e.type === 'ttoken'){ if (e.state === 'flat') return true; e.state = 'flat'; e.t = 160; const b = e.y + e.h; e.h = 5; e.y = b - 5; e.vx = 0; burst(cx, cy, 8, [ARC.Y, ARC.Y3, ARC.W], 1.4); popup(e.x - 4, e.y - 12, 'TILT!', ARC.Y); G.kills++; return true; }
  if (e.type === 'ccrab'){ e.remove = true; burst(cx, cy, 10, [ARC.M, ARC.C3, ARC.R], 1.6); arcSpawnFig(e); G.kills++; return true; }
  if (e.type === 'minifig' || e.type === 'sghost'){ e.remove = true; burst(cx, cy, 10, [ARC.M, ARC.C, ARC.W, ARC.CR], 1.6); return true; }
  return false;
}
function arcadeContact(e){ // true = handled (no hurt / stomp)
  if (e.type === 'ttoken' && e.state === 'flat') return true;
  if (e.type === 'sghost' && e.off) return true;
  if (e.type === 'clawd' || e.type === 'tsnake') return true; // the claw grabs (see updateArcadeEnemy); the snake's lash is what hurts
  if (e.type === 'minifig' && e.t < 24) return true;
  return false;
}
function arcadeBlock(e, src){ return (e.type === 'tsnake' && e.state === 'hide' && e.cool > 0) || (e.type === 'sghost' && e.off) || (e.type === 'minifig' && e.t < 12); }
function arcadeKill(e){
  if (e.type === 'ccrab') arcSpawnFig(e);
  if (e.type === 'clawd' && P.claw === e){ P.ctrl = 'normal'; P.claw = null; P.vy = 0; }
  if (e.type === 'ttoken') for (let i = 0; i < 3; i++) arcToks.push({ x: e.x + 4, y: e.y, vx: (i - 1) * 0.8, vy: -2.5, t: 0 });
}
// ---- per-frame world update + hazards ----
function arcadeUpdate(){
  for (const f of arcFx) f.t++; arcFx = arcFx.filter(f => f.t < (f.life || 30));
  if (lv.hasCrt){ const was0 = crtPhase(0).on, was1 = crtPhase(1).on; lv.crtT = (lv.crtT || 0) + 1; const n0 = crtPhase(0).on, n1 = crtPhase(1).on;
    if ((n0 && !was0) || (n1 && !was1)){ rgbPushOut(); if (Math.abs(P.x - camX) < W) sfxOnce('crt7'); } if ((!n0 && was0) || (!n1 && was1)) sfxOnce('static'); }
  // token showers (7-1): tokens rain down when you pass the dispenser
  for (const s of lv.showers || []){ if (s.done || !P || P.x < s.tx * TS - 40) continue; s.done = true; G.showers = (G.showers || 0) + 1; A.sfx('ding7'); popup(s.tx * TS - 30, 40, 'TOKEN SHOWER!', ARC.Y);
    for (let i = 0; i < 12; i++) arcToks.push({ x: s.tx * TS - 40 + Math.random() * 130, y: -12 - i * 10, vx: (Math.random() - 0.5) * 0.6, vy: 0, t: 0 }); }
  for (const k of arcToks){ k.t++; k.vy = Math.min(k.vy + 0.15, 3.2); k.x += k.vx; k.y += k.vy;
    if (k.vy > 0 && isSolid(Math.floor((k.x + 4) / TS), Math.floor((k.y + 9) / TS))){ k.y = Math.floor((k.y + 9) / TS) * TS - 9; k.vy = Math.abs(k.vy) > 1 ? -k.vy * 0.4 : 0; k.vx *= 0.7; }
    if (P && P.ctrl === 'normal' && !P.dead && k.t > 6 && overlap(P, { x: k.x, y: k.y, w: 9, h: 9 })){ k.got = true; G.score += 50; G.tokens7 = (G.tokens7 || 0) + 1; sfxOnce('ding7'); burst(k.x + 4, k.y + 4, 3, [ARC.Y, ARC.W], 1); }
    if (k.t > 480 || k.y > H + 10) k.got = true; }
  arcToks = arcToks.filter(k => !k.got);
  // ride counters
  for (const pl of plats){ if (pl.axis !== 'pusher' && pl.axis !== 'claw') continue; const r = rideEnds(pl);
    if (P && P.plat === pl && !pl.ridden && !r.atA){ pl.ridden = true; if (pl.axis === 'pusher') G.pushRides = (G.pushRides || 0) + 1; else G.clawRides = (G.clawRides || 0) + 1; }
    if (r.atA && P.plat !== pl) pl.ridden = false;
    if (pl.axis === 'claw' && (r.ph === 'upA' || r.ph === 'upB') && r.left === (pl.cz.up - 1) && Math.abs(pl.x - camX - 128) < 200) sfxOnce('claw7');
    if (pl.axis === 'pusher' && (r.ph === 'out' || r.ph === 'in') && r.left === (pl.pz.move - 1) && Math.abs(pl.x - camX - 128) < 200) sfxOnce('push7'); }
  const b = BOSS; if (b && b.kind === 'vault') vaultUpdateHazards(b);
}
function arcadeHazards(){
  if (P.ctrl !== 'normal' || P.dead) return;
  const b = BOSS; if (b && b.kind === 'vault') vaultHurtCheck(b);
}
function arcadeStreakShots(p, n0){ for (let i = n0; i < shots.length; i++){ shots[i].dmg = (shots[i].dmg || 1) * 1.3; shots[i].streak = true; } }

// ---------------- THE JACKPOT VAULT (World 7 boss) ----------------
// An overgrown token pusher with a CRT face, stuck in the castle at the back of the arcade. Its payout button only glows after an
// attack run: hit the glowing button 3 times per phase. Token waves roll along the floor (hop them), claw arms slam down where a
// shadow marks the floor, ticket streams pour from the ceiling. Phase 2 "BONUS ROUND!" (HP <= 6), phase 3 "TILT MODE!" (HP <= 3).
// At 0 HP: "JACKPOT!": a shower of tokens and tickets, then the TOASTED! escape.
const VAULT_SEQ = { 1: ['wave', 'claw', 'wave', 'open'], 2: ['wave', 'claw', 'tickets', 'open'], 3: ['claw', 'wave', 'tickets', 'claw', 'open'] };
function makeVault(spec){
  const deck = spec.deckRow * TS;
  spec.baseLine1 = spec.baseLine1 || spec.line1; spec.baseLine2 = spec.baseLine2 || spec.line2;
  return { kind: 'vault', spec, deck, x: spec.tx * TS, y: deck - 84, w: 60, h: 84, vx: 0, vy: 0, hp: 9, flash: 0, state: 'dormant', t: 0, dir: -1,
    active: false, dying: false, dead: false, dt: 0, by: null, phase: 1, cyc: 0, seq: 0, drips: [], puddles: [], chip: 0, onGround: true, open: 0, phaseHits: 0, carded: false, face: 'idle', said: false };
}
function vaultDamage(src){
  const b = BOSS; if (!b || b.dying || b.dead || b.flash > 0) return;
  if (!(b.open > 0) && src !== 'test') return;
  b.hp--; b.phaseHits++; b.flash = 24; G.shake = 9; A.sfx('bosshit'); A.sfx('ding7'); b.face = 'hurt'; G.vaultHits = (G.vaultHits || 0) + 1;
  burst(b.x + 22, b.deck - 18, 14, [ARC.Y, ARC.Y3, ARC.W, ARC.AM], 2.4);
  for (let i = 0; i < 4; i++) arcToks.push({ x: b.x + 10 + i * 6, y: b.deck - 22, vx: -0.6 - Math.random() * 1.6, vy: -2 - Math.random() * 1.5, t: 0 }); // a few tokens spill out
  if (b.hp <= 0){ vaultDie(src); return; }
  popup(b.x - 10, b.y + 18, 'PAYOUT ' + Math.min(3, b.phaseHits) + '/3', ARC.Y);
  if (b.hp <= 6 && b.phase === 1){ b.phase = 2; vaultPhase(b, 'BONUS ROUND!', 1.12); }
  else if (b.hp <= 3 && b.phase === 2){ b.phase = 3; vaultPhase(b, 'TILT MODE!', 1.25); }
}
function vaultPhase(b, text, tempo){ b.state = 'idle'; b.t = 0; b.seq = 0; b.open = 0; b.phaseHits = 0; b.drips = []; G.bigText = { text, t: 0 }; A.sfx('siren7'); A.setTempo(tempo); }
function vaultDie(by){
  const b = BOSS; b.dying = true; b.by = by; b.dt = 0; b.drips = []; b.vx = 0; b.open = 0; A.stopMusic(); A.sfx('powerdown'); addScore(5000, b.x, b.y - 18);
  bolts.forEach(o => o.remove = true); G.vaultDown = true;
}
function vaultHazard(b, x, kind){ const ax0 = b.spec.bounds[0] * TS + 10, ax1 = b.x - 14; b.drips.push({ x: Math.max(ax0, Math.min(ax1, x)), kind, state: 'warn', t: 0 }); }
function vaultUpdateHazards(b){
  for (const d of b.drips){ d.t++;
    if (d.state === 'warn'){ if (d.t > (b.phase === 3 ? 38 : 50)){ d.state = 'fall'; d.t = 0; A.sfx(d.kind === 'claw' ? 'clang' : 'ticket7'); if (d.kind === 'claw'){ G.shake = Math.max(G.shake, 5); burst(d.x, b.deck - 2, 6, [ARC.CH, ARC.W], 1.4); } G.vaultHaz = (G.vaultHaz || 0) + 1; } }
    else if (d.t > (d.kind === 'claw' ? 40 : 34)) d.remove = true; }
  b.drips = b.drips.filter(d => !d.remove);
}
function clawArmY(d, deck){ if (d.state === 'warn') return 3 * TS; const t = d.t; return t < 8 ? 3 * TS + (deck - 18 - 3 * TS) * t / 8 : t < 24 ? deck - 18 : deck - 18 - (deck - 18 - 3 * TS) * Math.min(1, (t - 24) / 16); }
function vaultHurtCheck(b){
  const pcx = P.x + P.w / 2;
  for (const d of b.drips){ if (d.state !== 'fall') continue;
    if (d.kind === 'claw' && Math.abs(pcx - d.x) < 10 && P.y + P.h > clawArmY(d, b.deck) + 2 && P.y < clawArmY(d, b.deck) + 18){ hurt(); return; }
    if (d.kind === 'tickets' && Math.abs(pcx - d.x) < 8 && d.t > 2 && d.t < 30){ hurt(); return; } }
}
function vaultWave(b){
  const n = b.phase, sp = b.phase === 3 ? 2.1 : b.phase === 2 ? 1.9 : 1.7;
  for (let i = 0; i < n; i++) bolts.push({ kind: 'gwave', boss: true, vault: true, x: b.x - 14 + i * 40, y: b.deck - 12, w: 12, h: 12, vx: -sp, vy: 0, t: -i * 22, delay: i * 22 });
  G.vaultWaves = (G.vaultWaves || 0) + 1; A.sfx('push7'); b.face = 'shout'; G.shake = Math.max(G.shake, 4);
}
function updateVault(){
  const b = BOSS, [bx0] = b.spec.bounds, ax0 = bx0 * TS, pcx = P.x + P.w / 2;
  if (!G.dialogDone){ const c = P && P.bro === 'cal'; b.spec.line1 = c ? b.spec.calLine1 : b.spec.baseLine1; b.spec.line2 = c ? b.spec.calLine2 : b.spec.baseLine2; }
  if (b.flash > 0) b.flash--; if (b.flash === 0 && b.face === 'hurt') b.face = 'idle';
  for (const o of bolts) if (o.vault && o.delay > 0){ o.delay--; o.x -= o.vx; } // staggered waves wait in the chute
  if (b.dying){
    b.dt++;
    if (b.dt % 3 === 0) arcToks.push({ x: b.x + 8 + Math.random() * 44, y: b.y + 30, vx: -0.4 - Math.random() * 2.2, vy: -2.5 - Math.random() * 2, t: 0 });
    if (b.dt % 4 === 0) burst(b.x + Math.random() * b.w, b.y + Math.random() * 60, 3, [ARC.Y, ARC.AM, ARC.M, ARC.C, ARC.W], 2.4, 30);
    if (b.dt % 20 === 0) boom(b.x + Math.random() * b.w, b.y + 20 + Math.random() * 50, 14, { power: 0, dmg: 0, owner: 'fx' });
    if (b.dt === 30){ G.bigText = { text: 'JACKPOT!', t: 0 }; A.sfx('siren7'); for (let i = 0; i < 30; i++) arcFx.push({ kind: 'confetti', x: camX + Math.random() * W, y: -Math.random() * 80, vx: (Math.random() - 0.5) * 0.6, vy: 0.8 + Math.random(), c: ARC_CONFETTI[i % 5], t: 0, life: 200 }); }
    if (b.dt > 200){ b.dead = true; b.active = false; if (lv.escapeWall) startEscape(); else { G.castleEnd = true; G.endT = 0; A.sfx('clear'); } }
    return;
  }
  if (!b.active) return;
  if (!b.carded){ b.carded = true; G.nameCard = { text: 'JACKPOT VAULT', t: 0 }; A.sfx('siren7'); G.shake = 10; }
  const sp = b.phase === 3 ? 1.3 : b.phase === 2 ? 1.15 : 1;
  b.t++;
  if (b.open > 0){ b.open--; if (b.open === 0 && b.state === 'open'){ b.state = 'idle'; b.t = 0; b.face = 'idle'; } }
  switch (b.state){
    case 'idle': if (b.t > 40 / sp){ const seq = VAULT_SEQ[b.phase]; b.state = seq[b.seq % seq.length]; b.seq++; b.t = 0; b.cyc++; } break;
    case 'wave': if (b.t === 10) vaultWave(b); if (b.t === 30) b.face = 'idle'; if (b.t > 70 / sp){ b.state = 'idle'; b.t = 0; } break;
    case 'claw': if (b.t === 8){ const n = b.phase; vaultHazard(b, pcx + P.vx * 8, 'claw'); if (n >= 2) vaultHazard(b, pcx + (pcx < ax0 + 90 ? 50 : -50), 'claw'); if (n >= 3) vaultHazard(b, pcx + (pcx < ax0 + 90 ? 96 : -96), 'claw'); b.face = 'shout'; sfxOnce('claw7'); }
      if (b.t === 30) b.face = 'idle'; if (b.t > 96 / sp){ b.state = 'idle'; b.t = 0; } break;
    case 'tickets': if (b.t === 10){ vaultHazard(b, pcx, 'tickets'); vaultHazard(b, pcx + (pcx < ax0 + 90 ? 70 : -70), 'tickets'); if (b.phase === 3) vaultHazard(b, ax0 + 20 + Math.random() * 120, 'tickets'); b.face = 'shout'; A.sfx('ticket7'); }
      if (b.t === 30) b.face = 'idle'; if (b.t > 96 / sp){ b.state = 'idle'; b.t = 0; } break;
    case 'open': // jammed: the payout button glows. Hit it!
      if (b.t === 1){ b.open = b.phase === 3 ? 240 : 300; b.face = 'dizzy'; A.sfx('payout7'); if (!b.said){ b.said = true; popup(b.x - 52, b.y + 2, 'HIT THE PAYOUT BUTTON!', ARC.Y); } else popup(b.x - 12, b.y + 2, 'JAMMED!', ARC.AM); }
      if (b.phase === 3 && b.t === 80) vaultWave(b);
      if (b.phaseHits >= 3 && b.open > 0){ b.open = 0; b.state = 'idle'; b.t = 0; b.face = 'idle'; }
      break;
  }
  if (P.ctrl === 'normal' && !P.dead && overlap(P, { x: b.x + 4, y: b.y + 8, w: b.w - 4, h: b.h - 8 })){ if (P.star > 0){ if (!b.flash && b.open > 0) vaultDamage('star'); } else hurt(); if (!P.dead){ P.x = Math.min(P.x, b.x - P.w - 1); P.vx = -2; } }
}
function vaultClink(){ const b = BOSS; if (G.frame - (b.clinkF || -99) < 20) return; b.clinkF = G.frame; sfxOnce('clang'); burst(b.x + 2, b.deck - 20, 4, [ARC.CH3, ARC.W], 1.2, 10); }
function drawVault(){
  const b = BOSS; if (!b) return;
  const AS = S.arcade, X = Math.round(b.x - camX) - 2, Y = Math.round(b.y);
  if (b.dead){ g.globalAlpha = 0.85; g.filter = 'brightness(0.45)'; g.drawImage(AS.vault, X, Y); g.filter = 'none'; g.globalAlpha = 1; g.fillStyle = '#05060a'; g.fillRect(X + 10, Y + 14, 44, 24); drawTiny(g, 'GAME OVER', X + 13, Y + 22, (G.frame >> 4) % 2 ? ARC.M : ARC.C); return; }
  const shake = b.dying ? Math.round(Math.sin(b.dt * 0.9) * 2) : (b.state === 'wave' && b.t < 14 ? ((G.frame & 1) ? 1 : -1) : 0);
  if (b.flash > 0 && (G.frame & 2)) g.filter = 'brightness(1.8)';
  g.drawImage(AS.vault, X + shake, Y); g.filter = 'none';
  // the CRT face
  const fx = X + shake + 10, fy = Y + 14; g.fillStyle = '#05060a'; g.fillRect(fx, fy, 44, 24);
  const col = b.phase === 3 ? ARC.R : b.phase === 2 ? ARC.M : ARC.C, face = b.dying ? 'dizzy' : b.face;
  if (face === 'dizzy'){ drawText(g, 'X', fx + 9, fy + 6, ARC.Y); drawText(g, 'X', fx + 29, fy + 6, ARC.Y); g.fillStyle = ARC.Y; g.fillRect(fx + 16, fy + 17, 12, 2); }
  else { const ey = face === 'shout' ? fy + 4 : fy + 6; g.fillStyle = col; g.fillRect(fx + 8, ey, 8, face === 'hurt' ? 2 : 6); g.fillRect(fx + 28, ey, 8, face === 'hurt' ? 2 : 6);
    g.fillStyle = ARC.W; if (face !== 'hurt'){ g.fillRect(fx + 10 + (b.dir < 0 ? 0 : 3), ey + 2, 2, 2); g.fillRect(fx + 30 + (b.dir < 0 ? 0 : 3), ey + 2, 2, 2); }
    g.fillStyle = col; if (face === 'shout'){ g.fillRect(fx + 15, fy + 15, 14, 7); g.fillStyle = '#05060a'; g.fillRect(fx + 17, fy + 17, 10, 4); } else { g.fillRect(fx + 14, fy + 18, 16, 2); g.fillRect(fx + 12, fy + 16, 2, 2); g.fillRect(fx + 30, fy + 16, 2, 2); } }
  for (let j = 0; j < 24; j += 2){ g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(fx, fy + j, 44, 1); }
  // the payout button (front, at shooting height): glows when it's open
  const bx = X + shake - 4, by = b.deck - 28, lit = b.open > 0;
  g.fillStyle = ARC.I; g.fillRect(bx - 1, by - 1, 14, 18); g.fillStyle = ARC.CH2; g.fillRect(bx, by, 12, 16);
  g.fillStyle = lit ? ((G.frame >> 2) % 2 ? ARC.Y : ARC.Y3) : '#5a4a10'; g.fillRect(bx + 2, by + 3, 8, 10);
  if (lit){ g.globalAlpha = 0.25 + 0.15 * Math.sin(G.frame * 0.4); g.fillStyle = ARC.Y; g.beginPath(); g.arc(bx + 6, by + 8, 16, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; drawTiny(g, 'PAYOUT', bx - 10, by - 9, ARC.Y); }
  for (let i = 0; i < 3; i++){ g.fillStyle = i < b.phaseHits ? ARC.GR : '#2a3a2a'; g.fillRect(X + shake + 46 + i * 5, Y + 42, 3, 3); } // 3 hit lamps per phase
  if (G.dialog) drawTextC(g, 'THE JACKPOT VAULT', 128, 138, (G.frame >> 3) % 2 ? ARC.Y : ARC.M, 1, '#000');
  if (G.dialogDone && !b.dying){ g.fillStyle = ARC.I; g.fillRect(70, 26, 116, 6); g.fillStyle = b.phase === 3 ? ARC.R : b.phase === 2 ? ARC.M : ARC.Y; g.fillRect(71, 27, Math.round(114 * b.hp / 9), 4); drawTextC(g, 'JACKPOT VAULT', 128, 34, '#ffffff', 1, '#000'); }
}
// ---- drawing ----
function drawArcadeEnemy(e, X){
  const AS = S.arcade; if (!AS || !ARCADE_TYPES.has(e.type)) return false;
  const Y = Math.round(e.y), side = e.facing > 0 ? 'R' : 'L', f = (e.anim >> 3) & 1;
  let img = null, ox = -1, oy = 0;
  switch (e.type){
    case 'ttoken': if (e.state === 'flat'){ img = AS.ttokenFlat; ox = -2; oy = e.h - 5; break; } img = AS.ttoken[((Math.floor(Math.abs(e.roll || 0) / 5)) % 4)]; ox = -1; oy = e.h - 14; break;
    case 'ccrab': img = (e.state === 'snap' ? AS.ccrabOpen : AS.ccrab)[side][f]; ox = -1; oy = e.h - 13; break;
    case 'minifig': img = AS.minifig[side][f]; ox = 0; oy = e.h - 10; break;
    case 'clawd': { g.fillStyle = '#5a6274'; g.fillRect(X + 6, 2 * TS, 2, Math.max(0, Y - 2 * TS)); g.fillStyle = ARC.CH; g.fillRect(X - 4, 2 * TS - 3, 22, 3); img = (e.state === 'grab' || e.state === 'rise') ? AS.clawShut : AS.claw; ox = -4; oy = 0; break; }
    case 'sghost': if (e.off){ if ((G.frame >> 2) % 6 === 0){ g.globalAlpha = 0.15; g.drawImage(AS.sghost[0], X - 1, Y); g.globalAlpha = 1; } return true; } img = AS.sghost[(G.frame >> 3) & 1]; ox = -1; oy = -1; if ((G.frame & 7) === 0) ox += 1; break;
    case 'tsnake': { g.drawImage(AS.tsBox, X - 1, Y - 2); if (e.lash > 1){ const n = Math.ceil(e.lash / 7), hx = e.facing > 0 ? X + 8 + e.lash : X + 8 - e.lash; for (let i = 0; i < n; i++){ const sx = e.facing > 0 ? X + 8 + i * 7 : X + 8 - (i + 1) * 7; g.drawImage(AS.tsSeg, sx, Y + 3 + ((i + (G.frame >> 2)) % 2)); } g.drawImage(AS.tsHead[side][f], e.facing > 0 ? hx - 4 : hx - 8, Y + 2); }
      else { const w = e.state === 'warn'; g.drawImage(AS.tsHead[side][w ? (G.frame >> 1) & 1 : 0], X + 2 + (w ? ((G.frame >> 1) % 2 ? 1 : -1) : 0), Y + 4 - (w ? 4 : e.cool > 0 ? 0 : (G.frame >> 4) % 2)); }
      if (e.hitT > 0 && (e.hitT & 2)){ g.globalAlpha = 0.5; g.fillStyle = '#fff'; g.fillRect(X, Y, e.w, e.h); g.globalAlpha = 1; } return true; }
  }
  if (img){
    if (e.hitT > 0 && (e.hitT & 2)) g.filter = 'brightness(2)';
    if (e.dead === 'flip'){ g.save(); g.translate(X + ox, Y + oy + img.height); g.scale(1, -1); g.drawImage(img, 0, 0); g.restore(); }
    else if (e.dead === 'squash'){ g.drawImage(img, 0, img.height / 2, img.width, img.height / 2, X + ox, Y + oy + img.height / 2, img.width, img.height / 2); }
    else g.drawImage(img, X + ox, Y + oy);
    g.filter = 'none';
  }
  return true;
}
function drawPusher(pl){
  const X = Math.round(pl.x - camX), Y = Math.round(pl.y); if (X > W + 40 || X + pl.w < -80) return;
  const x0 = Math.round(pl.x0 - camX); if (X > x0){ g.fillStyle = ARC.I; g.fillRect(x0, Y + 3, X - x0, 4); g.fillStyle = ARC.CH2; g.fillRect(x0, Y + 4, X - x0, 2); } // the piston rod back to the cabinet
  g.fillStyle = ARC.I; g.fillRect(X - 1, Y - 1, pl.w + 2, 12); g.fillStyle = ARC.CH; g.fillRect(X, Y, pl.w, 10); g.fillStyle = ARC.CH3; g.fillRect(X, Y, pl.w, 2); g.fillStyle = ARC.CH4; g.fillRect(X, Y + 8, pl.w, 2);
  for (let i = 4; i < pl.w - 4; i += 8){ g.fillStyle = ((i >> 3) + (G.frame >> 3)) % 2 ? ARC.Y : ARC.I; g.fillRect(X + i, Y + 4, 4, 3); } // hazard stripes
  for (let i = 0; i < 4; i++){ g.fillStyle = i % 2 ? ARC.Y2 : ARC.Y; g.fillRect(X + 6 + i * 9, Y - 3, 6, 3); } // a few tokens riding on it
  g.fillStyle = ARC.I; g.fillRect(x0 - 6, Y - 6, 7, 24); g.fillStyle = ARC.P3; g.fillRect(x0 - 5, Y - 5, 5, 22); g.fillStyle = (G.frame >> 3) % 2 ? ARC.M : ARC.C; g.fillRect(x0 - 4, Y - 3, 3, 3); // its housing at the lip
  const ps = pusherState(pl); if ((ps.ph === 'left' || ps.ph === 'right') && ps.left < 24 && (G.frame >> 2) % 2){ g.fillStyle = ARC.Y; g.fillRect(X + pl.w / 2 - 1, Y - 12, 2, 5); g.fillRect(X + pl.w / 2 - 1, Y - 5, 2, 1); } // about to move: !
}
function drawClawPlat(pl){
  const X = Math.round(pl.x - camX), Y = Math.round(pl.y); if (X > W + 40 || X + pl.w < -40) return;
  const cx = X + pl.w / 2, railY = 2 * TS;
  g.fillStyle = ARC.I; g.fillRect(Math.round(pl.x0 - camX) - 8, railY - 3, pl.cz.travel + pl.w + 16, 5); g.fillStyle = ARC.CH2; g.fillRect(Math.round(pl.x0 - camX) - 7, railY - 2, pl.cz.travel + pl.w + 14, 3); // the gantry rail
  g.fillStyle = ARC.CH; g.fillRect(cx - 6, railY - 5, 12, 6); g.fillStyle = '#5a6274'; g.fillRect(cx - 1, railY, 2, Math.max(0, Y - railY - 12));
  g.drawImage(S.arcade.clawShut, cx - 11, Y - 14);
  g.fillStyle = ARC.I; g.fillRect(X - 1, Y - 1, pl.w + 2, 10); g.fillStyle = ARC.M2; g.fillRect(X, Y, pl.w, 8); g.fillStyle = ARC.M; g.fillRect(X, Y, pl.w, 2); // the prize tray
  for (let i = 3; i < pl.w - 6; i += 10){ g.fillStyle = [ARC.C3, ARC.Y, ARC.M3][(i / 10) % 3 | 0]; g.fillRect(X + i, Y + 3, 6, 3); }
  const cs = clawState(pl); if ((cs.ph === 'A' || cs.ph === 'B') && cs.left < 24 && (G.frame >> 2) % 2){ g.fillStyle = ARC.Y; g.fillRect(cx - 1, Y - 24, 2, 5); g.fillRect(cx - 1, Y - 17, 2, 1); }
}
function drawArcadeHazards(){
  if (!inArcade()) return;
  // the token glow at the bottom of the pusher pits
  if (lv.pitFill7){ const x0 = Math.max(0, Math.floor(camX / TS)), x1 = Math.min(lv.w - 1, x0 + 17);
    for (let tx = x0; tx <= x1; tx++){ if (isSolid(tx, 14) || tileAt(tx, 14) === 'A' || isSolid(tx, 13)) continue; const X = Math.round(tx * TS - camX), wy = H - 8; g.fillStyle = ARC.Y2; g.fillRect(X, wy, 16, 8); for (let i = 0; i < 4; i++){ g.fillStyle = (i + tx + (G.frame >> 4)) % 2 ? ARC.Y : ARC.Y3; g.fillRect(X + i * 4, wy - 1 + ((i + tx) % 2), 3, 2); } } }
  for (const o of bolts){ if (o.mine) continue; if (o.kind === 'gwave' && o.vault){ if (o.delay > 0) continue; const X = Math.round(o.x - camX), Y = Math.round(o.y); g.save(); g.translate(X + 6, Y + 6); g.rotate(-o.t * 0.25); g.drawImage(S.arcade.tokWave, -6, -6); g.restore(); } }
  for (const k of arcToks) g.drawImage(S.arcade.token, Math.round(k.x - camX), Math.round(k.y));
  for (const f of arcFx){ if (f.kind === 'ring'){ const X = Math.round(f.x - camX), r = 4 + f.t * 2; g.globalAlpha = Math.max(0, 1 - f.t / 30); g.strokeStyle = f.col || ARC.M; g.lineWidth = 2; g.beginPath(); g.ellipse(X, f.y, r * 0.6, r, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    else if (f.kind === 'confetti'){ f.x += f.vx; f.y += f.vy; g.fillStyle = f.c; g.fillRect(Math.round(f.x - camX), Math.round(f.y), 2, (f.t >> 2) % 2 ? 2 : 1); } }
  const b = BOSS;
  if (b && b.kind === 'vault') for (const d of b.drips){ const X = Math.round(d.x - camX);
    if (d.kind === 'claw'){ const y = clawArmY(d, b.deck);
      if (d.state === 'warn'){ if ((G.frame >> 2) % 2){ g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(X, b.deck - 1, 10, 2.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = ARC.R; g.fillRect(X - 1, b.deck - 6, 2, 3); } }
      g.fillStyle = '#5a6274'; g.fillRect(X - 1, 2 * TS, 2, y - 2 * TS); g.drawImage(S.arcade.armClaw, X - 10, y); }
    else { if (d.state === 'warn'){ if ((G.frame >> 2) % 2){ g.fillStyle = 'rgba(255,179,71,0.5)'; g.fillRect(X - 6, b.deck - 2, 12, 2); g.fillStyle = ARC.AM; g.fillRect(X - 4, 3 * TS, 8, 3); } }
      else if (d.t < 30){ for (let j = 3 * TS + ((d.t * 6) % 10); j < b.deck; j += 10){ g.drawImage(S.arcade.ticket, X - 6 + ((j >> 3) % 2 ? 1 : -1), j); } } } }
  // Hot Streak timer (bottom-left)
  if (P && P.streak > 0){ g.fillStyle = ARC.I; g.fillRect(6, 226, 58, 9); g.fillStyle = '#4a2a08'; g.fillRect(7, 227, 56, 7); g.fillStyle = ARC.AM2; g.fillRect(7, 227, Math.round(56 * P.streak / STREAK_TIME), 7); drawTiny(g, 'HOT STREAK', 9, 228, ARC.Y); }
  // Hot Streak orbiting tokens
  if (P && P.streak > 0 && !P.dead){ const cx = P.x + P.w / 2 - camX, cy = P.y + P.h / 2; for (let k = 0; k < 3; k++){ const a = G.frame * 0.12 + k * 2.094; g.drawImage(S.arcade.orbit, Math.round(cx + Math.cos(a) * 20 - 4), Math.round(cy + Math.sin(a) * 15 - 4)); } }
}
function arcadePostFxAll(){
  if (!inArcade()) return;
  arcadePostFx(g, W, H, G.frame, TSET.bg);
  if (G.nameCard && BOSS && BOSS.kind === 'vault'){ const n = G.nameCard, t = n.t, drop = t < 10 ? -60 + t * 7 : t < 14 ? 10 - (t - 10) * 2 : t > 110 ? (t - 110) * -16 : 0, y = 44 + drop; // a marquee drops in, bulbs chasing
    g.fillStyle = ARC.I; g.fillRect(56, y - 6, 144, 32); g.fillStyle = ARC.M2; g.fillRect(58, y - 4, 140, 28); g.fillStyle = ARC.M; g.fillRect(58, y - 4, 140, 2);
    for (let i = 0; i < 140; i += 7){ g.fillStyle = ((i / 7) + (t >> 2)) % 2 ? ARC.AM : ARC.Y; g.fillRect(59 + i, y - 3, 3, 3); g.fillRect(59 + i, y + 20, 3, 3); }
    drawTextC(g, n.text, 127, y + 7, ARC.M, 1); drawTextC(g, n.text, 129, y + 7, ARC.C, 1); drawTextC(g, n.text, 128, y + 7, ARC.Y, 1); }
}
// ---- autopilot helpers for World 7 ----
function botArcade(b, grounded, feet, fx, want, hold){
  const p = P, px = p.x + p.w / 2, ptx = Math.floor(px / TS);
  // 1. pusher shelves + claw cranes: wait at the start, hop on when it's parked there, ride it in the middle, step off at the far end
  const rides = plats.filter(q => q.axis === 'pusher' || q.axis === 'claw');
  if (rides.length){
    const on = p.plat && rides.includes(p.plat) ? p.plat : null;
    if (on){ const r = rideEnds(on); b.run = false; want = false; b.left = false; b.right = false;
      if (r.atB){ b.right = true; }
      else { const cx = on.x + on.w / 2; if (px < cx - 4) b.right = true; else if (px > cx + 4) b.left = true; }
      bot.rideT = null; return { want, hold }; }
    if (grounded){
      const q = rides.filter(q => q.x0 + 4 >= p.x && q.x0 - fx < 96).sort((u, v) => u.x0 - v.x0)[0];
      if (q){ const spot = q.x0 - 7, dist = spot - fx, r = rideEnds(q);
        b.run = false; want = false;
        const stopD = p.vx > 0 ? p.vx * p.vx * 7 : 0;
        if (dist > 3 + stopD){ b.right = true; b.left = false; } else if (dist > 3 && p.vx > 0.3){ b.right = false; b.left = true; }
        else if (dist < -6){ b.right = false; b.left = true; }
        else { b.right = false; b.left = p.vx > 0.3;
          const behind = enemies.find(e => !e.dead && !e.remove && e.x + e.w < px && px - e.x < 80 && Math.abs(e.y + e.h - feet) < 20); if (behind && p.facing > 0) b.left = true;
          if (r.atA && r.left > 26){ b.left = false; b.right = true; want = true; hold = q.axis === 'claw' ? 16 : 14; bot.rideT = q; } }
        return { want, hold }; }
    } else if (bot.rideT){ const q = bot.rideT, cx = q.x + q.w / 2; b.right = px < cx - 3; b.left = px > cx + 3; b.run = false; }
  }
  // 2. CRT platforms: only jump to a screen that's on (and staying on)
  if (lv.crtZones && lv.crtZones.some(z => ptx >= z.a - 3 && ptx <= z.b + 1)){
    const segs = crtSegs(), cur = grounded ? segs.find(s => px >= s.x0 * TS - 3 && px <= (s.x1 + 1) * TS + 3 && Math.abs(feet - s.row * TS) < 3) : null;
    const ahead = segs.filter(s => s.x0 * TS > (cur ? (cur.x1 + 1) * TS - 1 : px)).sort((u, v) => u.x0 - v.x0)[0];
    const zone = lv.crtZones.find(z => ptx >= z.a - 3 && ptx <= z.b + 1);
    const nextIsGround = !ahead || ahead.x0 > zone.b;
    if (grounded){
      const edge = cur ? (cur.x1 + 1) * TS - 2 : (ahead ? ahead.x0 * TS - TS - 2 : (zone.a) * TS - 2); // the last safe spot of whatever we stand on
      const dist = edge - fx;
      b.run = false; want = false;
      if (!cur && !ahead){ /* past the zone */ }
      else if (dist > 20 && !(cur && nextIsGround)){ b.right = true; b.left = false; if (dist < 28 && p.vx > 0.8) b.right = false; }
      else {
        const stopD = p.vx > 0 ? p.vx * p.vx * 7 : 0; b.right = dist > 2 + stopD; b.left = dist < 0 || (dist <= 2 + stopD && p.vx > 0.4);
        if (nextIsGround && cur){ want = dist < 10; hold = 18; b.right = true; b.left = false; }
        else if (ahead){ const ph = crtPhase(ahead.grp), mine = cur ? crtPhase(cur.grp) : null, up = feet - ahead.row * TS;
          if (dist < 12 && ph.on && (ph.left >= 28 || (mine && mine.left < 10))){ want = true; hold = up > 20 ? 34 : up > 4 ? 24 : 16; b.right = true; b.left = false; bot.crtT = ahead; } }
      }
      return { want, hold };
    } else if (p.vy > -2){ const t = bot.crtT; if (t && crtPhase(t.grp).on){ const cx = (t.x0 + t.x1 + 1) * TS / 2; b.right = px < cx - 3; b.left = px > cx + 3; b.run = false; } }
  }
  // 3. Claw Drops: never stand under one that's dropping
  const cd = enemies.find(e => e.type === 'clawd' && !e.dead && (e.state === 'shake' || e.state === 'drop') && Math.abs(e.x + 7 - px) < 24);
  if (cd && grounded){ b.right = true; b.left = false; b.run = true; want = false; }
  // 4. Ticket Snakes: bait the lash from just outside its reach, then run past while it reloads
  const sn = enemies.find(e => e.type === 'tsnake' && !e.dead && !e.remove && e.x + 8 - px > -20 && e.x + 8 - px < 110 && Math.abs(e.y + e.h - feet) < 28);
  if (sn && !grounded && sn.state !== 'hide' && sn.x + 8 - px > -10 && sn.x + 8 - px < 80){ b.right = false; b.left = true; } // in the air: drift back out of the lash
  if (sn && grounded){ const d = sn.x + 8 - px;
    if (sn.state === 'hide' && sn.cool > 20){ b.right = true; b.left = false; b.run = true; }
    else if (sn.state !== 'hide' && d > -10 && d < 72){ b.right = false; b.left = true; b.run = true; want = false; }
    else if (d > 0 && d < 100){ b.run = false; } } // creep up (and shoot): it pokes its head out first, then we back off out of reach
  return { want, hold };
}

// ---------------- THE GLITCH (World 1 boss) ----------------
function makeBoss(spec){
  if (spec.kind === 'toaster') return makeToaster(spec);
  if (spec.kind === 'breadlord') return makeBreadlord(spec);
  if (spec.kind === 'repairman') return makeRepairman(spec);
  if (spec.kind === 'hive') return makeHive(spec);
  if (spec.kind === 'quartz') return makeQuartz(spec);
  if (spec.kind === 'vault') return makeVault(spec);
  return { kind: 'glitch', spec, x: spec.tx * TS, y: spec.bridgeRow * TS - 28, w: 28, h: 28, vx: 0, vy: 0, hp: 5, flash: 0, state: 'dormant', t: 0, dir: -1, shots: 0,
    active: false, dying: false, dead: false, by: null, onGround: true, dt: 0 };
}
function hitBoss(){
  const b = BOSS; if (b.kind === 'toaster') return toasterDamage('rocket');
  if (b.kind === 'breadlord') return breadDamage('chip');
  if (b.kind === 'repairman') return calDamage('chip');
  if (b.kind === 'hive') return hiveDamage('chip');
  if (b.kind === 'quartz') return quartzDamage('chip');
  if (b.kind === 'vault') return vaultDamage('chip');
  if (b.flash > 0 || b.dying) return;
  b.hp--; b.flash = 36; A.sfx('bosshit'); G.shake = 8;
  burst(b.x + 14, b.y + 14, 14, ['#ffffff', '#00e5ff', '#ff0040', '#8a8a8a'], 2.2);
  popup(b.x, b.y - 10, b.hp > 0 ? 'HP ' + b.hp : 'SIGNAL LOST', '#ff00c8');
  if (b.hp <= 0) bossDie('rockets');
}
function bossDie(by){
  const b = BOSS; if (b.dying) return;
  b.dying = true; b.by = by; b.dt = 0; b.vx = 0; A.stopMusic(); A.sfx('powerdown'); addScore(5000, b.x, b.y - 18);
  bolts.forEach(o => o.remove = true);
}
function updateBoss(){
  const b = BOSS; if (!b || b.dead) return;
  if (b.kind === 'toaster') return updateToaster();
  if (b.kind === 'breadlord') return updateBreadlord();
  if (b.kind === 'repairman') return updateRepairman();
  if (b.kind === 'hive') return updateHive();
  if (b.kind === 'quartz') return updateQuartz();
  if (b.kind === 'vault') return updateVault();
  if (b.flash > 0) b.flash--;
  const [bx0, bx1] = b.spec.bounds;
  if (b.dying){
    b.dt++;
    if (b.dt % 3 === 0) burst(b.x + Math.random() * 28, b.y + Math.random() * 28, 3, ['#ffffff', '#00e5ff', '#ff0040', '#5c5c5c'], 2.5, 30);
    b.vy = Math.min(b.vy + 0.25, 4); b.y += b.vy; collideY(b);
    if (b.dt > 140 || b.y > H + 40){ b.dead = true; b.active = false; if (b.by === 'rockets') popup(b.spec.switchTx * TS - 24, b.spec.switchTy * TS - 24, 'UNPLUG IT!', '#FFD400'); }
    return;
  }
  if (!b.active) return;
  const enraged = b.hp <= 2, spd = enraged ? 1.45 : 1;
  const pdx = (P.x + P.w / 2) - (b.x + b.w / 2);
  b.t++;
  switch (b.state){
    case 'walk':
      b.vx = b.dir * 0.6 * spd;
      if (b.onGround && b.t % 48 === 0) b.vy = -3;
      if (b.t > 100 / spd){ b.state = 'charge'; b.t = 0; A.sfx('rev'); }
      break;
    case 'charge':
      b.vx = 0; if (b.t > 36 / spd){ b.state = 'volley'; b.t = 0; b.shots = 0; }
      break;
    case 'volley': {
      b.vx = 0; const n = enraged ? 5 : 3, gap = enraged ? 30 : 40;
      if (b.t % gap === 1 && b.shots < n){
        // readable pattern: LOW (jump it) / HIGH (duck or stay small) alternating, straight at Mr. Toasty
        const floorY = b.spec.bridgeRow * TS, high = b.shots % 2 === 1;
        const by = high ? floorY - 30 : floorY - 7, ang = pdx < 0 ? Math.PI : 0;
        fireBolt(b.x + (pdx < 0 ? 0 : b.w), by, ang, 1.4 * spd); b.shots++; A.sfx('bolt');
      }
      if (b.shots >= n && b.t > n * gap + 12){ b.state = 'leap'; b.t = 0; }
      break; }
    case 'leap':
      if (b.t === 1 && b.onGround){ b.vy = -6.2; b.vx = Math.sign(pdx || -1) * 1.3 * spd; A.sfx('roar'); }
      if (b.t > 8 && b.onGround){ b.state = 'recover'; b.t = 0; b.vx = 0; G.shake = 10; burst(b.x + 14, b.y + 28, 12, ['#00e5ff', '#ff00c8', '#ffffff'], 2); }
      break;
    case 'recover':
      b.vx = 0; if (b.t > 44 / spd){ b.state = 'walk'; b.t = 0; b.dir = pdx < 0 ? -1 : 1; }
      break;
  }
  b.vy = Math.min(b.vy + 0.25, 5);
  b.x += b.vx;
  if (b.x < bx0 * TS){ b.x = bx0 * TS; b.dir = 1; if (b.vx < 0) b.vx = 0; }
  if (b.x + b.w > (bx1 + 1) * TS){ b.x = (bx1 + 1) * TS - b.w; b.dir = -1; if (b.vx > 0) b.vx = 0; }
  b.y += b.vy; collideY(b);
  if (b.y > H + 40) bossDie('switch');
  if (P.ctrl === 'normal' && !P.dead && overlap(P, { x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 4 })){ if (P.star > 0){ if (!b.flash) hitBoss(); } else hurt(); }
}
function updateCastle(){
  if (!BOSS) return;
  const spec = BOSS.spec;
  // intro line when Mr. Toasty steps up to the bridge
  if (!G.dialogDone && !G.dialog && P.x >= spec.trigger * TS + 8 && P.ctrl === 'normal'){
    G.dialog = { t: 0 }; G.camLockX = (spec.lockTx !== undefined ? spec.lockTx : spec.bridge[0] - 1) * TS; A.stopMusic(); P.vx = 0;
  }
  if (BOSS.kind !== 'glitch'){ if (BOSS.dead && !lv.escapeWall && P.ctrl === 'normal' && P.onGround && !P.dead){ P.ctrl = 'wait'; P.vx = 0; } return; }
  // unplug switch
  const sw = { x: spec.switchTx * TS + 2, y: spec.switchTy * TS, w: 12, h: 32 };
  if (!G.unplugged && P.ctrl === 'normal' && !P.dead && overlap(P, sw)){
    G.unplugged = true; P.ctrl = 'wait'; P.vx = 0; P.vy = 0; A.stopMusic(); A.sfx('unplug');
    G.collapse = { x: spec.bridge[1], t: 0 };
    if (!BOSS.dying && !BOSS.dead){ BOSS.state = 'unplugged'; bossDie('switch'); }
    burst(sw.x + 6, sw.y + 6, 16, ['#FFD400', '#ffffff', '#00e5ff'], 2.4);
  }
  if (G.collapse){
    const c = G.collapse; c.t++;
    if (c.x >= spec.bridge[0] && c.t % 4 === 0){
      lv.t[spec.bridgeRow][c.x] = '.'; parts.push({ x: c.x * TS + 4, y: spec.bridgeRow * TS, vx: (Math.random() - 0.5), vy: -1, g: 0.25, life: 60, color: '#5a6270', size: 4, edge: '#05040a' });
      A.sfx('crumble'); c.x--;
    }
    if (c.x < spec.bridge[0] && (BOSS.dead) && !G.castleEnd && !G.escape){ if (lv.escapeWall && !G.escaped) startEscape(); else if (!lv.escapeWall){ G.castleEnd = true; G.endT = 0; A.sfx('clear'); } }
  }
  if (P.ctrl === 'wait' && P.onGround === false){ P.vy = Math.min(P.vy + 0.4375, 4); P.y += P.vy; collideY(P); }
}

// ---------------- THE GRAND TOASTER (World 2 boss) ----------------
// A giant chrome toaster-truck. Pops flaming toast, slicks the deck with butter, rams the lane.
// Beat it by bouncing on its lever 3 times, by stomping its Toast Rockets back at it, or with Toast Launcher fire (3 dents = 1 HP).
function makeToaster(spec){
  const deck = spec.deckRow * TS;
  const b = { kind: 'toaster', spec, x: spec.tx * TS, y: deck - 42, w: 80, h: 42, vx: 0, vy: 0, hp: 3, dents: 0, flash: 0, state: 'dormant', t: 0, dir: -1, cyc: 0,
    active: false, dying: false, dead: false, onGround: true, dt: 0, by: null, deck };
  b.top = { kind: 'bosstop', gone: true, x: b.x + 2, y: b.y, w: b.w - 4, h: 8, dx: 0, dy: 0, dead: false, stood: false }; // gone: not drawn, ignored by the bot's platform scan
  plats.push(b.top);
  return b;
}
function toasterLeverX(b){ return b.x + b.w / 2; }
// called from playerCollideY when Mr. Toasty lands on the boss's roof; returns true if it was a lever hit (bounce)
function bossTopLand(){
  const b = BOSS; if (!b || b.kind !== 'toaster' || b.dying || b.dead || !b.active) return false;
  const pcx = P.x + P.w / 2, lx = toasterLeverX(b);
  if (Math.abs(pcx - lx) <= 16 && b.flash <= 0 && b.state !== 'hurt'){
    P.y = b.y - P.h - 1; P.vy = -6; P.jumpHeld = false; P.onGround = false; P.plat = null; P.combo = 0;
    P.vx = (pcx < lx ? -1 : 1) * 2.6; // the lever springs back and flings Mr. Toasty off the roof
    A.sfx('lever'); toasterDamage('lever');
    return true;
  }
  return false;
}
function toasterDamage(src){
  const b = BOSS; if (!b || b.dying || b.dead) return;
  if (src === 'rocket'){
    if (b.flash > 0) return;
    b.dents++; burst(b.x + b.w / 2, b.y + 20, 6, ['#ffffff', '#b8c6d8', '#8a3fd1'], 1.6);
    popup(b.x + 20, b.y - 18, 'DENT ' + b.dents + '/3', '#b8c6d8');
    if (b.dents < 3) return;
    b.dents = 0;
  }
  if (b.flash > 0 && src !== 'reflect') return;
  b.hp--; b.flash = 80; G.shake = 10; A.sfx('bosshit');
  burst(b.x + b.w / 2, b.y + 4, 16, ['#ffffff', '#FFD400', '#b8c6d8', '#ff6a00'], 2.4);
  popup(b.x + 16, b.y - 22, b.hp > 0 ? (src === 'lever' ? 'DING! HP ' : 'BONK! HP ') + b.hp : 'DING!!!', '#FFD400');
  if (b.hp <= 0){ toasterDie(src); return; }
  b.state = 'hurt'; b.t = 0; b.vx = 0;
}
function toasterDie(by){
  const b = BOSS; b.dying = true; b.by = by; b.dt = 0; b.vx = 0; A.stopMusic(); A.sfx('powerdown'); addScore(5000, b.x + 20, b.y - 30);
  bolts.forEach(o => o.remove = true); ftoasts.forEach(f => f.remove = true);
  patches = patches.filter(q => q.t === Infinity);
}
function updateToaster(){
  const b = BOSS, [bx0, bx1] = b.spec.bounds, deck = b.deck;
  if (b.flash > 0) b.flash--;
  const ox = b.x;
  if (b.dying){
    b.dt++;
    if (b.dt % 4 === 0) smoke(b.x + Math.random() * b.w, b.y + Math.random() * 20);
    if (b.dt % 12 === 0){ parts.push({ x: b.x + 20 + Math.random() * 40, y: b.y, vx: (Math.random() - 0.5) * 3, vy: -5 - Math.random() * 2, g: 0.2, life: 70, color: '#f4c860', size: 4, edge: '#1b2a4a' }); A.sfx('kick'); }
    if (b.dt === 20) parts.push({ x: toasterLeverX(b), y: b.y - 12, vx: 1.6, vy: -6, g: 0.2, life: 90, color: '#FFD400', size: 5, edge: '#1b2a4a' });
    if (b.dt === 130){ A.sfx('ding'); popup(b.x - 6, b.y - 30, "DING! TOAST'S DONE", '#FFD400'); burst(b.x + b.w / 2, b.y + 10, 24, ['#ffffff', '#FFD400', '#b8c6d8'], 3); }
    if (b.dt > 130 && b.y < deck - 34){ b.y += 0.2; } // flat tires: it sinks onto its rims
    b.top.y = b.y;
    if (b.dt > 210){ b.dead = true; b.active = false; b.top.dead = true; if (lv.escapeWall) startEscape(); else { G.castleEnd = true; G.endT = 0; A.sfx('clear'); } }
    return;
  }
  if (!b.active) return;
  const enraged = b.hp <= 1, px = P.x + P.w / 2, cx = b.x + b.w / 2, pdx = px - cx;
  b.t++;
  switch (b.state){
    case 'idle':
      b.vx = 0; b.dir = pdx < 0 ? -1 : 1;
      if (enraged && b.t === 24 && b.cyc % 4 === 2) launchHoming(b.dir < 0 ? b.x + 8 : b.x + b.w - 8, b.y + 26, b.dir < 0 ? Math.PI : 0, 1.5, true);
      if (b.t > (enraged ? 50 : 70)){ const seq = ['pop', 'ram', 'butter', 'ram']; b.state = seq[b.cyc++ % 4]; b.t = 0; if (b.state === 'ram'){ b.state = 'rev'; A.sfx('honk'); } }
      break;
    case 'pop': {
      b.vx = 0; const n = enraged ? 3 : 2;
      if (b.t % 22 === 10 && b.t < 22 * n){
        const sx = b.x + (b.t % 44 < 22 ? 22 : 62), sy = b.y - 4;
        const fl = 64, vx = Math.max(-2.6, Math.min(2.6, (px - sx) / fl));
        ftoasts.push({ x: sx - 5, y: sy, w: 10, h: 10, vx, vy: -5.2, t: 0, landed: 0 }); A.sfx('launch');
        for (let i = 0; i < 4; i++) parts.push({ x: sx, y: sy, vx: (Math.random() - 0.5), vy: -1.5, g: 0.05, life: 16, color: '#ff6a00', size: 1 });
      }
      if (b.t > 22 * n + 30){ b.state = 'idle'; b.t = 0; }
      break; }
    case 'butter':
      b.vx = 0;
      if (b.t === 20 || b.t === 40){
        const at = b.t === 20 ? px : cx + b.dir * 60;
        const x0 = Math.max(bx0 * TS, Math.min((bx1 + 1) * TS - 48, at - 24));
        patches.push({ kind: 'butter', x: x0, y: deck, w: 48, t: 600 });
        A.sfx('splat'); burst(x0 + 24, deck - 2, 12, ['#ffe680', '#fff2a0', '#c8a040'], 2);
      }
      if (b.t > 70){ b.state = 'idle'; b.t = 0; }
      break;
    case 'rev':
      b.vx = 0; b.dir = pdx < 0 ? -1 : 1;
      if (G.frame % 2 === 0) smoke(b.dir < 0 ? b.x + b.w + 2 : b.x - 2, b.y + 36);
      if (b.t === 2) A.sfx('rev');
      if (b.t > (enraged ? 34 : 46)){ b.state = 'ram'; b.t = 0; A.sfx('roar'); }
      break;
    case 'ram':
      b.vx = b.dir * Math.min(enraged ? 3.6 : 3.0, 0.6 + b.t * 0.12); // revs up over ~20 frames
      if (G.frame % 2 === 0) smoke(b.dir < 0 ? b.x + b.w + 2 : b.x - 2, b.y + 38);
      if ((b.dir < 0 && b.x <= bx0 * TS + 0.5) || (b.dir > 0 && b.x + b.w >= (bx1 + 1) * TS - 0.5)){ b.state = 'dizzy'; b.t = 0; b.vx = 0; G.shake = 12; A.sfx('bump'); burst(b.dir < 0 ? b.x : b.x + b.w, b.y + 20, 14, ['#FFD400', '#ffffff', '#b8c6d8'], 2.2); }
      break;
    case 'dizzy': b.vx = 0; if (b.t > (enraged ? 50 : 70)){ b.state = 'idle'; b.t = 0; } break;
    case 'hurt':
      b.vx = 0; if (b.t % 5 === 0) smoke(b.x + 20 + Math.random() * 40, b.y);
      if (b.t > 50){ b.state = 'rev'; b.t = 0; b.dir = pdx < 0 ? -1 : 1; A.sfx('honk'); } // angry: straight into a ram
      break;
  }
  b.x += b.vx;
  b.x = Math.max(bx0 * TS, Math.min((bx1 + 1) * TS - b.w, b.x));
  b.top.dx = b.x - ox; b.top.x = b.x + 2; b.top.y = b.y;
  // flaming toast
  for (const f of ftoasts){
    f.t++;
    if (!f.landed){ f.vy = Math.min(f.vy + 0.16, 4); f.x += f.vx; f.y += f.vy; if (f.y + f.h >= deck){ f.y = deck - f.h; f.landed = 1; A.sfx('sizzle'); } }
    else { f.landed++; if (f.landed > 50) f.remove = true; }
    if (f.t % 3 === 0) parts.push({ x: f.x + 2 + Math.random() * 6, y: f.y, vx: 0, vy: -0.6, g: -0.01, life: 12, color: Math.random() < 0.5 ? '#ff6a00' : '#FFD400', size: 1 });
    if (f.x < bx0 * TS - 16 || f.x > (bx1 + 1) * TS + 16) f.remove = true;
    if (P.ctrl === 'normal' && !P.dead && overlap(P, { x: f.x + 1, y: f.y + 2, w: f.w - 2, h: f.h - 2 })){ if (P.mirror > 0){ f.remove = true; A.sfx('clang'); burst(f.x + 5, f.y + 5, 6, ['#cfe6ee', '#ff6a00'], 1.4); } else if (P.star <= 0) hurt(); }
  }
  ftoasts = ftoasts.filter(f => !f.remove);
  // body contact (the roof is safe to stand on)
  if (P.ctrl === 'normal' && !P.dead && P.plat !== b.top && overlap(P, { x: b.x + 6, y: b.y + 10, w: b.w - 12, h: b.h - 10 })){
    if (P.star > 0){ toasterDamage('rocket'); P.vx = (P.x < cx ? -2 : 2); }
    else hurt();
  }
  // riding on its roof while it pops toast: the slots are hot, it bucks you off
  if (P.plat === b.top && b.state === 'pop' && b.t % 22 === 9){ P.plat = null; P.onGround = false; P.vy = -4.5; P.vx = px < cx ? -2 : 2; popup(P.x, P.y - 10, 'HOT!', '#ff6a00'); }
}

// ---------------- menus ----------------
function titleMenu(){
  const m = [{ label: 'NEW GAME', act: () => newGame('1-1') }];
  if (save.furthest && save.furthest !== '1-1') m.push({ label: 'CONTINUE ' + save.furthest, act: () => newGame(save.furthest) });
  m.push({ label: 'BRO ROSTER', act: () => { G.state = 'roster'; G.stateT = 0; G.rsel = Math.max(0, BRO_IDS.indexOf(save.startBro)); } });
  if (DEBUG) m.push({ label: 'LEVEL SELECT', act: () => { G.state = 'select'; G.stateT = 0; G.sel = 0; } });
  return m;
}
function selectEntries(){
  const out = [];
  for (let w = 1; w <= 10; w++){
    const Wd = WORLDS[w];
    if (Wd.built) Wd.levels.forEach(id => out.push({ id, label: id + ' ' + LEVELS[id].name, ok: true }));
    else out.push({ label: w + '  ' + Wd.name + (Wd.name.length > 18 ? ' (SOON)' : ' - COMING SOON'), ok: false });
  }
  return out;
}

// ---------------- main update ----------------
function update(){
  G.frame++; G.stateT++;
  if (G.fade > 0) G.fade--;
  if (G.shake > 0) G.shake--;
  if (G.flash > 0) G.flash--;
  switch (G.state){
    case 'title': {
      const m = titleMenu(); if (G.menu >= m.length) G.menu = 0;
      if (pressed('down')){ G.menu = (G.menu + 1) % m.length; A.sfx('tick'); }
      if (pressed('up')){ G.menu = (G.menu + m.length - 1) % m.length; A.sfx('tick'); }
      if (pressed('start') || pressed('jump')){ A.unlock(); A.sfx('start'); m[G.menu].act(); }
      break; }
    case 'select': {
      const ents = selectEntries().filter(e => e.ok);
      if (pressed('down')) G.sel = (G.sel + 1) % ents.length;
      if (pressed('up')) G.sel = (G.sel + ents.length - 1) % ents.length;
      if (pressed('run')) G.selSize = (G.selSize + 1) % 3;
      if (pressed('left')){ G.state = 'title'; G.stateT = 0; }
      if ((pressed('start') || pressed('jump')) && G.stateT > 5){ newGame(ents[G.sel].id); G.carrySize = G.selSize; A.sfx('start'); }
      break; }
    case 'roster': {
      const n = BRO_IDS.length;
      if (pressed('right')){ G.rsel = (G.rsel + 1) % n; A.sfx('tick'); }
      if (pressed('left')){ G.rsel = (G.rsel + n - 1) % n; A.sfx('tick'); }
      if (pressed('down') || pressed('up')){ G.rsel = (G.rsel + 4) % n; A.sfx('tick'); }
      const id = BRO_IDS[G.rsel];
      if (pressed('jump') && G.stateT > 5){ if (save.unlocked.includes(id)){ save.startBro = id; writeSave(); A.sfx('coin'); } else A.sfx('bump'); }
      if ((pressed('start') || pressed('run')) && G.stateT > 5){ G.state = 'title'; G.stateT = 0; }
      break; }
    case 'intro':
      if (G.stateT > 150) startLevel();
      break;
    case 'play': updatePlay(); break;
    case 'dying':
      if (G.stateT === 32 && P.y < H) P.vy = -4.6;
      if (G.stateT > 32 && P.y < H + 40){ P.vy += 0.22; P.y += P.vy; }
      updateFx();
      if (G.stateT >= 200){
        G.lives--;
        if (G.lives <= 0){ G.state = 'gameover'; G.stateT = 0; A.sfx('gameover'); bumpHi(); writeSave(); }
        else { G.curBro = G.reserve.shift() || pickBro(); G.state = 'intro'; G.stateT = 0; }
      }
      break;
    case 'gameover':
      if (G.stateT > 260 || (G.stateT > 60 && pressed('start'))){ G.state = 'title'; G.stateT = 0; G.menu = 0; }
      break;
    case 'transition':
      if (G.stateT > 160) levelComplete();
      break;
    case 'clear':
      if (G.stateT > 170 || (G.stateT > 40 && (pressed('start') || pressed('jump')))){ G.state = 'intro'; G.stateT = 0; }
      break;
    case 'warpcard':
      if (G.stateT > (WORLDS[G.warpTo].built ? 170 : 230)){ G.levelId = G.warpTarget || latestWorldStart(); G.checkpoint = false; reach(G.levelId); G.state = 'intro'; G.stateT = 0; }
      break;
    case 'worldclear':
      if (G.stateT > 120 && (pressed('start') || pressed('jump'))){
        bumpHi(); writeSave();
        if (G.nextWorldLevel){ G.nextWorldLevel = null; G.checkpoint = false; G.state = 'intro'; G.stateT = 0; }
        else { G.state = 'title'; G.stateT = 0; G.menu = 0; }
      }
      break;
  }
}
function updatePlay(){
  if (pressed('start') && !G.dialog){ G.paused = !G.paused; A.pause(G.paused); A.sfx('pause'); }
  if (G.paused) return;
  if (G.dialog){
    G.dialog.t++;
    if (G.camLockX !== null && camX < G.camLockX) camX = Math.min(G.camLockX, camX + 3);
    if (G.dialog.t === 20) A.sfx('roar');
    if (G.dialog.t > 200 || (G.dialog.t > 60 && pressed('jump'))){ G.dialog = null; G.dialogDone = true; BOSS.active = true; BOSS.state = BOSS.kind === 'glitch' ? 'walk' : 'idle'; BOSS.t = 0; A.startMusic((WORLDS[LV.world].music || {}).boss || 'w1_boss'); }
    updateFx();
    return;
  }
  if (P.morph > 0){ P.morph--; return; }
  if (G.hitStop > 0){ G.hitStop--; updateFx(); return; }
  if (G.curseT > 0) G.curseT--;
  if (G.broFlash && !broFlashHeld()){ G.broFlash.t++; if (G.broFlash.t > 110) G.broFlash = null; }
  if (G.bigText){ G.bigText.t++; if (G.bigText.t > 120) G.bigText = null; }
  if (G.nameCard){ const n = G.nameCard; n.t++; if (n.t === 10) G.shake = 8; if (n.t > 116) G.nameCard = null; } // ticks in update so headless steps advance it too
  G.lf++;
  if (inDiner()) dinerPrePlats();
  updatePlats();
  updatePlayer();
  if (G.state !== 'play') return;
  checkPole();
  updateCastle();
  spawnEnemies();
  for (const e of enemies){ if (G.freezeT > 0 && !e.dead){ if (e.hitT > 0) e.hitT--; continue; } updateEnemy(e); } // Diner Bell: enemies freeze
  enemyPairs();
  for (const it of items) updateItem(it);
  pitUpdate(); if (inDiner()) dinerUpdate(); if (inBumbo()) bumboUpdate(); if (inCrypt()) cryptUpdate(); if (inArcade()) arcadeUpdate();
  for (const r of rockets) updateRocket(r);
  updateShots(); updateTurrets();
  updateBolts(); updateBoss(); updatePatches(); updateCrumbles();
  processBooms(); updateEscape();
  playerVsEnemies(); hazards();
  for (const r of rings) r.t++; rings = rings.filter(r => r.t < 14);
  enemies = enemies.filter(e => !e.remove); items = items.filter(i => !i.remove); rockets = rockets.filter(r => !r.remove); bolts = bolts.filter(b => !b.remove);
  for (const k in lv.bumps){ if (--lv.bumps[k] <= 0) delete lv.bumps[k]; }
  for (const k in lv.multi) lv.multi[k].t--;
  updateFx();
  if (!lv.camLock){
    const target = P.x + P.w / 2 - 112;
    if (target > camX) camX = Math.min(target, lv.w * TS - W);
    if (G.camLockX !== null) camX = Math.min(camX, G.camLockX);
    if (LV.checkpoint && G.area === 'main' && P.x > LV.checkpoint * TS) G.checkpoint = true;
  }
  if (P.ctrl === 'normal' || P.ctrl.startsWith('pipe')){
    if (++G.timeT >= 24){
      G.timeT = 0; G.time--;
      if (G.time === 100 && !G.hurry){ G.hurry = true; A.sfx('hurry'); A.setTempo(1.3); }
      if (G.time <= 0){ G.time = 0; die(); }
    }
  }
  bumpHi();
}
function updateFx(){
  for (const q of parts){ q.vx *= 0.98; q.vy += q.g; q.x += q.vx; q.y += q.vy; q.life--; }
  parts = parts.filter(q => q.life > 0);
  for (const q of pops) q.t++;
  pops = pops.filter(q => q.t < (q.long ? 140 : 44));
  for (const c of coinpops){ c.t++; c.vy += 0.32; c.y += c.vy; }
  coinpops = coinpops.filter(c => c.t < 30);
}

// ---------------- backgrounds ----------------
function lerpCol(a, b, t){ const A1 = hexRGB(a), B1 = hexRGB(b); return 'rgb(' + A1.map((v, i) => Math.round(v + (B1[i] - v) * t)).join(',') + ')'; }
function tileableLayer(fn, h){ const c = mkCanvas(512, h || 240), x = c.getContext('2d'); fn(x, rng(4242)); return c; }
const BGL = {};
function bgLayers(kind){
  if (BGL[kind]) return BGL[kind];
  let L = {};
  if (kind === 'city'){
    L.far = tileableLayer((fx, r) => {
      let x = 0;
      while (x < 512){
        const w = 22 + ((r() * 30) | 0), h = 40 + ((r() * 90) | 0), top = 208 - h;
        fx.fillStyle = r() < 0.5 ? '#121624' : '#161b2b'; fx.fillRect(x, top, w, h);
        for (let wy = top + 4; wy < 204; wy += 5) for (let wx = x + 3; wx < x + w - 3; wx += 4){ const v = r(); if (v < 0.22){ fx.fillStyle = v < 0.08 ? 'rgba(0,229,255,0.45)' : 'rgba(255,212,0,0.45)'; fx.fillRect(wx, wy, 2, 2); } }
        if (r() < 0.4){ fx.fillStyle = '#20263a'; fx.fillRect(x + (w >> 1), top - 14, 1, 14); fx.fillStyle = '#ff2a3a'; fx.fillRect(x + (w >> 1), top - 15, 1, 1); }
        x += w + ((r() * 8) | 0);
      }
    });
    L.mid = tileableLayer((mx) => {
      const skullHill = (cx, w, h) => { for (const off of [-512, 0, 512]){ const X = cx + off;
        mx.fillStyle = '#1c2030'; mx.beginPath(); mx.ellipse(X, 208, w / 2, h, 0, Math.PI, 0); mx.fill();
        mx.fillStyle = '#2a3046'; mx.fillRect(X - w * 0.22, 208 - h, w * 0.44, 1);
        mx.fillStyle = '#0d0f17'; const ey = 208 - h * 0.55, ew = Math.max(4, w * 0.09), eh = Math.max(4, h * 0.16);
        mx.beginPath(); mx.ellipse(X - w * 0.15, ey, ew, eh, 0, 0, Math.PI * 2); mx.fill();
        mx.beginPath(); mx.ellipse(X + w * 0.15, ey, ew, eh, 0, 0, Math.PI * 2); mx.fill();
        mx.fillRect(X - 2, ey + eh + 2, 4, 4); for (let i = -3; i <= 3; i++) mx.fillRect(X + i * 5 - 1, 208 - h * 0.18, 2, 5); } };
      skullHill(60, 120, 44); skullHill(210, 70, 26); skullHill(380, 150, 58);
      const bx = 280;
      mx.fillStyle = '#20263a'; mx.fillRect(bx + 28, 150, 4, 58);
      mx.fillStyle = '#000'; mx.fillRect(bx - 2, 104, 64, 48); mx.fillStyle = '#3a3f4a'; mx.fillRect(bx, 106, 60, 44);
      ['#c8c8c8', '#c8c800', '#00c8c8', '#00c800', '#c800c8', '#c80000', '#0000c8'].forEach((c, i) => { mx.fillStyle = c; mx.fillRect(bx + 2 + i * 8, 109, 8, 26); });
      mx.fillStyle = '#101010'; mx.fillRect(bx + 2, 135, 56, 12); drawTextC(mx, 'NO SIGNAL', bx + 30, 137, '#ffffff', 1);
      mx.globalAlpha = 0.25; mx.fillStyle = '#000'; for (let y = 106; y < 150; y += 2) mx.fillRect(bx, y, 60, 1); mx.globalAlpha = 1;
    });
    L.clouds = tileableLayer((cx, r) => {
      for (let i = 0; i < 7; i++){
        const X = (r() * 512) | 0, Y = 30 + ((r() * 60) | 0), w = 30 + ((r() * 30) | 0), h = 8 + ((r() * 6) | 0);
        for (let n = 0; n < w * h * 0.7; n++){ const a = r() * Math.PI * 2, d = Math.sqrt(r());
          const px = Math.round(X + Math.cos(a) * d * w / 2), py = Math.round(Y + Math.sin(a) * d * h / 2);
          const v = r(); cx.fillStyle = v < 0.5 ? 'rgba(160,165,180,0.35)' : v < 0.8 ? 'rgba(220,225,235,0.3)' : 'rgba(0,229,255,0.25)'; cx.fillRect(((px % 512) + 512) % 512, py, 1, 1); }
      }
    }, 120);
  } else if (kind === 'factory'){
    L.far = tileableLayer((x, r) => {
      x.fillStyle = '#100c0a'; for (let i = 0; i < 512; i += 32){ x.fillRect(i, 0, 30, 240); }
      x.fillStyle = '#1c1612'; for (let i = 0; i < 512; i += 32) x.fillRect(i + 30, 0, 2, 240);
      for (let i = 0; i < 6; i++){ const y = 60 + ((r() * 120) | 0); x.fillStyle = '#2a201a'; x.fillRect(0, y, 512, 6); x.fillStyle = '#3a2e24'; x.fillRect(0, y, 512, 1); }
      for (let i = 0; i < 5; i++){ const gx = (r() * 512) | 0, gy = 70 + ((r() * 100) | 0), rr = 14 + ((r() * 14) | 0);
        x.fillStyle = '#1e1814'; x.beginPath(); x.arc(gx, gy, rr, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#100c0a'; x.beginPath(); x.arc(gx, gy, rr * 0.35, 0, Math.PI * 2); x.fill();
        for (let k = 0; k < 8; k++){ const a = k * Math.PI / 4; x.fillStyle = '#1e1814'; x.fillRect(gx + Math.cos(a) * rr - 3, gy + Math.sin(a) * rr - 3, 6, 6); } }
    });
    L.mid = tileableLayer((x, r) => {
      for (let i = 0; i < 4; i++){ const px = 40 + i * 128;
        x.fillStyle = '#2a2420'; x.fillRect(px, 40, 4, 120); x.fillStyle = '#3a3028'; x.fillRect(px, 40, 1, 120);
        x.fillStyle = '#ff6a00'; x.globalAlpha = 0.6; x.fillRect(px - 6, 160, 16, 3); x.globalAlpha = 0.08; x.fillRect(px - 30, 163, 64, 45); x.globalAlpha = 1;
        x.fillStyle = '#3a3f4a'; x.fillRect(px - 8, 150, 20, 10); }
      // toast conveyor in the distance
      x.fillStyle = '#18120e'; x.fillRect(0, 120, 512, 8);
      for (let i = 0; i < 512; i += 24){ x.fillStyle = '#c8741e'; x.fillRect(i + 4, 112, 10, 8); x.fillStyle = '#7a3e10'; x.fillRect(i + 4, 112, 10, 1); }
    });
  } else if (kind === 'rooftop'){
    L.far = tileableLayer((x, r) => {
      let px = 0;
      while (px < 512){ const w = 18 + ((r() * 26) | 0), h = 60 + ((r() * 120) | 0), top = 230 - h;
        x.fillStyle = r() < 0.5 ? '#0e0a1a' : '#130d22'; x.fillRect(px, top, w, h);
        for (let wy = top + 4; wy < 228; wy += 6) for (let wx = px + 2; wx < px + w - 2; wx += 4){ const v = r(); if (v < 0.18){ x.fillStyle = v < 0.07 ? 'rgba(255,0,200,0.5)' : v < 0.12 ? 'rgba(0,240,255,0.45)' : 'rgba(57,255,106,0.35)'; x.fillRect(wx, wy, 2, 3); } }
        px += w + 2; }
    });
    L.mid = tileableLayer((x) => {
      const sign = (sx, sy, text, col) => { const w = textWidth(text) + 8; x.fillStyle = '#05030c'; x.fillRect(sx - 1, sy - 1, w + 2, 13); x.strokeStyle = col; x.lineWidth = 1; x.strokeRect(sx + 0.5, sy + 0.5, w - 1, 10); drawText(x, text, sx + 4, sy + 2, col); };
      sign(20, 60, 'TOAST 24H', '#ff00c8'); sign(170, 90, 'NO SIGNAL', '#00f0ff'); sign(300, 50, 'CRUMB CO.', '#FFD400'); sign(420, 100, 'ACID RAIN', '#39ff6a');
      x.fillStyle = '#1a1028'; for (let i = 0; i < 512; i += 64){ x.fillRect(i + 10, 150, 2, 80); x.fillRect(i + 4, 150, 14, 2); }
    });
  } else if (kind === 'tower'){
    L.far = tileableLayer((x, r) => {
      for (let i = 0; i < 512; i += 40){
        x.fillStyle = '#0c0a14'; x.fillRect(i + 4, 30, 32, 200); x.fillStyle = '#16122a'; x.fillRect(i + 4, 30, 32, 1);
        for (let y = 36; y < 220; y += 8){ x.fillStyle = '#05040a'; x.fillRect(i + 7, y, 26, 5); const v = r(); x.fillStyle = v < 0.3 ? '#00e5ff' : v < 0.5 ? '#ff00c8' : v < 0.6 ? '#39ff6a' : '#202030'; x.fillRect(i + 9, y + 2, 2, 1); x.fillRect(i + 13 + ((r() * 14) | 0), y + 2, 1, 1); }
      }
    });
    L.mid = tileableLayer((x, r) => {
      for (let i = 0; i < 512; i += 128){ x.fillStyle = '#000'; x.fillRect(i + 40, 70, 44, 34); x.fillStyle = '#2a2440'; x.fillRect(i + 42, 72, 40, 30);
        for (let k = 0; k < 400; k++){ const v = r(); x.fillStyle = v < 0.5 ? '#202020' : v < 0.85 ? '#707070' : '#d0d0d0'; x.fillRect(i + 44 + ((r() * 36) | 0), 74 + ((r() * 26) | 0), 1, 1); } }
    });
  }
  else if (typeof pitLayers === 'function' && ['basement', 'fridge', 'wiring', 'reels', 'vault'].includes(kind)) pitLayers(kind, L, tileableLayer);
  else if (typeof dinerLayers === 'function' && ['diner', 'kitchen', 'booth', 'repair'].includes(kind)) dinerLayers(kind, L, tileableLayer);
  else if (typeof bumboLayers === 'function' && ['hatch', 'drain', 'cutlery', 'chrome'].includes(kind)) bumboLayers(kind, L, tileableLayer);
  else if (typeof cryptLayers === 'function' && ['cryhall', 'cryjam', 'cryframe', 'crycore'].includes(kind)) cryptLayers(kind, L, tileableLayer);
  else if (typeof arcadeLayers === 'function' && ['arclobby', 'arcprize', 'arcstatic', 'arcvault'].includes(kind)) arcadeLayers(kind, L, tileableLayer);
  else toonLayers(kind, L);
  return (BGL[kind] = L);
}
// ---- World 2 toon backdrops: flat colors, navy outlines, 3-step shading ----
const NV = '#1b2a4a';
function oRect(x, X, Y, w, h, base, light, dark){ x.fillStyle = NV; x.fillRect(X - 1, Y - 1, w + 2, h + 2); x.fillStyle = base; x.fillRect(X, Y, w, h); if (light){ x.fillStyle = light; x.fillRect(X, Y, w, 1); x.fillRect(X, Y, 1, h); } if (dark){ x.fillStyle = dark; x.fillRect(X, Y + h - 2, w, 2); x.fillRect(X + w - 1, Y, 1, h); } }
function oEllipse(x, cx, cy, rx, ry, base, light, top){ for (const off of [-512, 0, 512]){ x.fillStyle = NV; x.beginPath(); x.ellipse(cx + off, cy, rx + 1.5, ry + 1.5, 0, top ? Math.PI : 0, Math.PI * 2); x.fill(); x.fillStyle = base; x.beginPath(); x.ellipse(cx + off, cy, rx, ry, 0, top ? Math.PI : 0, Math.PI * 2); x.fill(); if (light){ x.fillStyle = light; x.beginPath(); x.ellipse(cx + off - rx * 0.25, cy - ry * 0.35, rx * 0.4, ry * 0.25, 0, 0, Math.PI * 2); x.fill(); } } }
function toonCloud(x, X, Y, s){ oEllipse(x, X, Y, 14 * s, 8 * s, '#ffffff'); oEllipse(x, X + 12 * s, Y - 4 * s, 11 * s, 9 * s, '#ffffff'); oEllipse(x, X + 24 * s, Y, 12 * s, 7 * s, '#ffffff'); x.fillStyle = '#ffffff'; x.fillRect(X - 10 * s, Y - 2 * s, 44 * s, 8 * s); x.fillStyle = '#d8ecff'; x.fillRect(X - 10 * s, Y + 4 * s, 44 * s, 2 * s); x.fillStyle = NV; x.fillRect(X - 12 * s, Y + 6 * s, 48 * s, 1); }
function toonLayers(kind, L){
  if (kind === 'suburb'){
    L.clouds = tileableLayer((x) => { toonCloud(x, 40, 40, 1); toonCloud(x, 210, 62, 0.8); toonCloud(x, 380, 34, 1.1); }, 120);
    L.far = tileableLayer((x) => { oEllipse(x, 60, 208, 120, 50, '#7ad86a', '#a8f08a', true); oEllipse(x, 250, 208, 90, 36, '#6acb5a', '#a8f08a', true); oEllipse(x, 420, 208, 130, 58, '#7ad86a', '#a8f08a', true);
      for (const tx of [30, 150, 300, 470]){ x.fillStyle = NV; x.fillRect(tx + 5, 170, 6, 38); x.fillStyle = '#8a5e3a'; x.fillRect(tx + 6, 170, 4, 38); oEllipse(x, tx + 8, 162, 16, 14, '#3a9a4a', '#5ac85a'); } });
    L.mid = tileableLayer((x) => {
      const shops = ['CRUMB CORNER', 'JAM DROP CLEANERS', 'CRUST WASH', 'BUTTER UP BARBER'];
      const cols = [['#ffb3c8', '#ffd8e4', '#d888a0'], ['#a8f0d0', '#dafff0', '#6ac0a0'], ['#c8b4f0', '#e8dcff', '#9a84c8'], ['#ffcfa0', '#ffe8cc', '#d8a070']];
      for (let i = 0; i < 4; i++){
        const X = 12 + i * 128, w = 72, h = 46, Y = 208 - h, c = cols[i];
        oRect(x, X, Y, w, h, c[0], c[1], c[2]);
        x.fillStyle = NV; x.beginPath(); x.moveTo(X - 6, Y + 1); x.lineTo(X + w / 2, Y - 26); x.lineTo(X + w + 6, Y + 1); x.fill();
        x.fillStyle = i % 2 ? '#e8402a' : '#3a7ad8'; x.beginPath(); x.moveTo(X - 3, Y); x.lineTo(X + w / 2, Y - 23); x.lineTo(X + w + 3, Y); x.fill();
        oRect(x, X + 8, Y + 10, 14, 12, '#a8e0ff', '#e8f8ff'); oRect(x, X + w - 22, Y + 10, 14, 12, '#a8e0ff', '#e8f8ff'); oRect(x, X + w / 2 - 7, Y + 24, 14, 22, '#8a5e3a', '#a8784a');
        const sw = textWidth(shops[i]) + 6; oRect(x, X + w / 2 - sw / 2, Y - 8 + (i % 2) * 2 + 30 - 30, sw, 9, '#FFD400', '#fff3a0'); drawTextC(x, shops[i], X + w / 2, Y - 7 + (i % 2) * 2, NV);
        // picket fence
        for (let f = X + w + 8; f < X + 124; f += 6){ x.fillStyle = NV; x.fillRect(f - 1, 193, 5, 15); x.fillStyle = '#ffffff'; x.fillRect(f, 194, 3, 14); }
        x.fillStyle = NV; x.fillRect(X + w + 6, 198, 124 - w - 6, 3); x.fillStyle = '#ffffff'; x.fillRect(X + w + 6, 199, 124 - w - 6, 1);
      }
    });
  } else if (kind === 'tide'){
    L.clouds = tileableLayer((x) => { toonCloud(x, 60, 30, 0.9); toonCloud(x, 300, 50, 1); }, 120);
    L.far = tileableLayer((x) => {
      x.fillStyle = NV; x.fillRect(0, 139, 512, 1); x.fillStyle = '#2f7fd8'; x.fillRect(0, 140, 512, 70); x.fillStyle = '#5aa8f0'; x.fillRect(0, 140, 512, 3);
      for (let i = 0; i < 512; i += 22){ x.fillStyle = '#e8f8ff'; x.fillRect(i + ((i * 7) % 11), 150 + ((i * 13) % 40), 8, 1); }
      // Tide Tower (water tower, parody of the beach-town landmark)
      const tx = 380; x.fillStyle = NV; for (const lx of [tx - 14, tx + 12]) x.fillRect(lx, 96, 4, 96); x.fillRect(tx - 14, 140, 30, 2);
      oEllipse(x, tx, 86, 26, 18, '#a8f0d0', '#dafff0'); oRect(x, tx - 26, 84, 52, 6, '#a8f0d0'); drawTextC(x, 'TIDE TOWER', tx, 80, NV);
    });
    L.mid = tileableLayer((x) => {
      const cols = [['#ffb3c8', '#ffd8e4', '#d888a0'], ['#a8f0d0', '#dafff0', '#6ac0a0'], ['#c8b4f0', '#e8dcff', '#9a84c8'], ['#ffcfa0', '#ffe8cc', '#d8a070']];
      for (let i = 0; i < 4; i++){
        const X = 30 + i * 128, c = cols[i];
        for (const sx of [X + 4, X + 18, X + 32, X + 46]){ x.fillStyle = NV; x.fillRect(sx, 170, 4, 40); x.fillStyle = '#a8784a'; x.fillRect(sx + 1, 170, 2, 40); }
        oRect(x, X, 140, 54, 30, c[0], c[1], c[2]);
        x.fillStyle = NV; x.beginPath(); x.moveTo(X - 6, 141); x.lineTo(X + 27, 118); x.lineTo(X + 60, 141); x.fill(); x.fillStyle = '#7e8ea6'; x.beginPath(); x.moveTo(X - 3, 140); x.lineTo(X + 27, 121); x.lineTo(X + 57, 140); x.fill();
        oRect(x, X + 8, 148, 12, 10, '#a8e0ff', '#e8f8ff'); oRect(x, X + 34, 148, 12, 10, '#a8e0ff', '#e8f8ff');
        // marsh grass
        for (let gx = X + 60; gx < X + 120; gx += 5){ x.fillStyle = NV; x.fillRect(gx, 196, 3, 12); x.fillStyle = '#7ad86a'; x.fillRect(gx + 1, 197, 1, 11); }
      }
    });
  } else if (kind === 'pier'){
    L.far = tileableLayer((x) => { for (let i = 0; i < 512; i += 48){ x.fillStyle = '#0a1e30'; x.fillRect(i + 10, 30, 12, 200); x.fillStyle = '#16405a'; x.fillRect(i + 11, 30, 2, 200); } x.fillStyle = '#0a1e30'; x.fillRect(0, 40, 512, 6); });
    L.mid = tileableLayer((x) => { for (let i = 0; i < 512; i += 128){ x.globalAlpha = 0.12; x.fillStyle = '#fff3a0'; x.beginPath(); x.moveTo(i + 30, 40); x.lineTo(i + 50, 40); x.lineTo(i + 80, 210); x.lineTo(i + 40, 210); x.fill(); x.globalAlpha = 1;
      x.strokeStyle = '#3a6480'; x.lineWidth = 1; for (let k = 0; k < 6; k++){ x.beginPath(); x.moveTo(i + 70 + k * 6, 48); x.lineTo(i + 66 + k * 6, 90); x.stroke(); } for (let k = 0; k < 5; k++){ x.beginPath(); x.moveTo(i + 66, 56 + k * 8); x.lineTo(i + 104, 56 + k * 8); x.stroke(); } } });
  } else if (kind === 'grave'){
    L.far = tileableLayer((x) => { oEllipse(x, 80, 208, 140, 60, '#8a5ac8', '#b48ae8', true); oEllipse(x, 330, 208, 120, 44, '#7a4ab8', '#a47ad8', true);
      for (const tx of [40, 200, 420]){ x.fillStyle = NV; x.fillRect(tx, 130, 6, 60); x.fillRect(tx - 14, 140, 16, 4); x.fillRect(tx + 4, 150, 18, 4); x.fillStyle = '#5e3e84'; x.fillRect(tx + 1, 131, 4, 58); } });
    L.mid = tileableLayer((x) => { for (let i = 0; i < 512; i += 40){ const h = 16 + ((i * 7) % 10); x.fillStyle = NV; x.fillRect(i + 8, 208 - h - 1, 16, h + 1); x.beginPath(); x.arc(i + 16, 208 - h, 8, Math.PI, 0); x.fill(); x.fillStyle = '#9a8ab8'; x.fillRect(i + 9, 208 - h, 14, h); x.beginPath(); x.arc(i + 16, 208 - h, 7, Math.PI, 0); x.fill(); x.fillStyle = '#cabde6'; x.fillRect(i + 10, 208 - h - 2, 2, h); }
      for (let i = 0; i < 512; i += 6){ x.fillStyle = NV; x.fillRect(i, 186, 3, 22); x.fillStyle = '#4a2e6a'; x.fillRect(i + 1, 187, 1, 21); } x.fillStyle = NV; x.fillRect(0, 190, 512, 2); });
  } else if (kind === 'fortress'){
    L.far = tileableLayer((x) => { x.fillStyle = NV; x.fillRect(0, 169, 512, 1); x.fillStyle = '#2f7fd8'; x.fillRect(0, 170, 512, 40); x.fillStyle = '#5aa8f0'; x.fillRect(0, 170, 512, 2);
      for (const tx of [60, 316]){ oRect(x, tx, 40, 10, 130, '#8a96a8', '#c0cad8', '#5a6476'); oRect(x, tx + 26, 40, 10, 130, '#8a96a8', '#c0cad8', '#5a6476'); oRect(x, tx - 2, 60, 40, 6, '#8a96a8', '#c0cad8'); x.strokeStyle = NV; x.lineWidth = 1; x.beginPath(); x.moveTo(tx + 5, 42); x.quadraticCurveTo(tx + 130, 150, tx + 256, 42); x.stroke(); for (let k = 20; k < 240; k += 14){ x.beginPath(); x.moveTo(tx + 5 + k, 46 + Math.sin(k / 256 * Math.PI) * 60); x.lineTo(tx + 5 + k, 160); x.stroke(); } } });
    L.mid = tileableLayer((x) => {
      // toaster fortress (giant toaster castle with bread-slot battlements) + junk piles
      const fx = 300; oRect(x, fx, 100, 110, 108, '#b8c6d8', '#e8f0fa', '#7e8ea6'); x.fillStyle = NV; x.fillRect(fx + 18, 96, 30, 8); x.fillRect(fx + 62, 96, 30, 8);
      x.fillStyle = '#ff6a00'; x.fillRect(fx + 20, 98, 26, 2); x.fillRect(fx + 64, 98, 26, 2); oRect(x, fx + 46, 160, 18, 48, '#5a6a80'); oRect(x, fx + 112, 120, 8, 30, '#FFD400', '#fff3a0');
      for (const [jx, jw, jh] of [[20, 70, 30], [110, 50, 22], [180, 80, 36], [440, 60, 26]]){ x.fillStyle = NV; x.beginPath(); x.moveTo(jx, 208); x.lineTo(jx + jw * 0.3, 208 - jh); x.lineTo(jx + jw * 0.7, 208 - jh + 6); x.lineTo(jx + jw, 208); x.fill(); x.fillStyle = '#c86a3a'; x.beginPath(); x.moveTo(jx + 2, 208); x.lineTo(jx + jw * 0.3, 210 - jh); x.lineTo(jx + jw * 0.7, 214 - jh); x.lineTo(jx + jw - 2, 208); x.fill(); x.fillStyle = '#4a8ad8'; x.fillRect(jx + jw * 0.35, 214 - jh, 10, 6); x.fillStyle = '#2a2e3a'; x.fillRect(jx + jw * 0.6, 200, 8, 8); }
    });
  }
}
const DECOR = (() => { const r = rng(99), out = []; for (let x = 6; x < 300; x += 5 + ((r() * 9) | 0)) out.push({ x: x * TS + ((r() * 8) | 0), k: r() < 0.5 ? 'bones' : r() < 0.6 ? 'bush' : 'lamp' }); return out; })();
function drawBG(){
  const th = Object.assign({}, THEMES.overworld, THEMES[lv.theme] || {});
  if (th.bg === 'bonus'){
    for (let ty = 0; ty < 15; ty++) for (let tx = 0; tx < 16; tx++) g.drawImage(TSET.wall[(tx + ty) & 1], tx * TS, ty * TS);
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, W, H);
    if (lv.painting){
      g.fillStyle = '#c9a400'; g.fillRect(70, 34, 52, 40); g.fillStyle = '#1b2a7a'; g.fillRect(73, 37, 46, 34);
      g.drawImage(S.coin, 92, 46, 8, 10); g.fillStyle = '#ff00c8'; g.fillRect(78, 66, 36, 2);
      drawText(g, 'STAFF ONLY', 136, 40, (G.frame >> 4) % 2 ? '#ff00c8' : '#a0007f');
    }
    return;
  }
  let sky = th.sky;
  const prog = Math.max(0, Math.min(1, camX / Math.max(1, lv.w * TS - W)));
  if (th.skyLate) sky = [lerpCol(th.sky[0], th.skyLate[0], prog), lerpCol(th.sky[1], th.skyLate[1], prog)]; // 2-1: day drifts to sunset across the level
  const grd = g.createLinearGradient(0, 0, 0, 208); grd.addColorStop(0, sky[0]); grd.addColorStop(1, sky[1]);
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  const L = bgLayers(th.bg);
  const tile = (img, f, y) => { if (!img) return; const o = -(((camX * f) % 512) + 512) % 512; g.drawImage(img, Math.floor(o), y); g.drawImage(img, Math.floor(o) + 512, y); };
  if (th.toon){
    if (th.bg === 'suburb'){ const sy = Math.round(36 + prog * 110), sc = lerpCol('#FFD400', '#ff7a3a', prog); g.fillStyle = '#1b2a4a'; g.beginPath(); g.arc(206, sy, 15, 0, Math.PI * 2); g.fill(); g.fillStyle = sc; g.beginPath(); g.arc(206, sy, 13.5, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(200, sy - 8, 4, 3); }
    if (th.bg === 'grave'){ g.fillStyle = '#1b2a4a'; g.beginPath(); g.arc(196, 52, 22, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff4fa'; g.beginPath(); g.arc(196, 52, 20.5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffd0e8'; g.beginPath(); g.arc(203, 46, 5, 0, Math.PI * 2); g.arc(190, 60, 3, 0, Math.PI * 2); g.fill(); }
    if (th.bg === 'fortress'){ g.fillStyle = '#1b2a4a'; g.beginPath(); g.arc(70, 150, 26, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffb060'; g.beginPath(); g.arc(70, 150, 24.5, 0, Math.PI * 2); g.fill(); }
    tile(L.clouds, 0.1, 0); tile(L.far, 0.25, 0); tile(L.mid, 0.5, 0);
    if (th.bg === 'grave'){ const r = rng(5); for (let i = 0; i < 4; i++){ const bx = ((r() * 300 + G.frame * (0.3 + r() * 0.3) - camX * 0.4) % 300 + 300) % 300 - 20, by = 40 + r() * 60 + Math.sin(G.frame / 8 + i) * 4; g.fillStyle = '#1b2a4a'; const fl = (G.frame >> 3) % 2; g.fillRect(bx, by, 3, 2); g.fillRect(bx - 3, by - fl, 3, 1); g.fillRect(bx + 3, by - fl, 3, 1); } }
  } else if (th.bg === 'city'){
    const r = rng(7 + (G.frame >> 3));
    for (let i = 0; i < 18; i++){ const v = r(); g.fillStyle = v < 0.33 ? '#ff2a3a' : v < 0.66 ? '#00e5ff' : '#7dff7a'; g.fillRect((rng(i * 31 + 1)() * 256) | 0, ((rng(i * 17 + 5)() * 120) | 0) + 30, 1, 1); if (r() < 0.2) break; }
    tile(L.clouds, 0.15, 0); tile(L.far, 0.25, 0); tile(L.mid, 0.5, 0);
    for (const d of DECOR){
      const x = Math.round(d.x - camX); if (x < -24 || x > W + 8) continue;
      if (tileAt(Math.floor(d.x / TS), 13) !== 'G' || tileAt(Math.floor(d.x / TS), 12) !== '.') continue;
      if (d.k === 'bones'){
        g.fillStyle = '#cbbcd9'; g.fillRect(x, 204, 10, 2); g.fillRect(x + 3, 201, 8, 2); g.fillRect(x - 1, 203, 2, 4); g.fillRect(x + 9, 203, 2, 4);
        g.fillStyle = '#e6d5b8'; g.fillRect(x + 4, 196, 5, 5); g.fillStyle = '#000'; g.fillRect(x + 5, 198, 1, 1); g.fillRect(x + 7, 198, 1, 1);
      } else if (d.k === 'bush'){
        const rr = rng(d.x);
        for (let i = 0; i < 70; i++){ const a = rr() * Math.PI, dd = Math.sqrt(rr()); const px = x + 10 + Math.cos(a) * dd * 12, py = 208 - Math.sin(a) * dd * 9; g.fillStyle = rr() < 0.5 ? '#2c3a34' : ((G.frame >> 2) + i) % 9 === 0 ? '#8affc4' : '#3e5248'; g.fillRect(px | 0, py | 0, 1, 1); }
      } else {
        g.fillStyle = '#3a3f4a'; g.fillRect(x + 3, 176, 2, 32); g.fillRect(x, 206, 8, 2);
        const on = ((G.frame + d.x) % 97) > 6;
        g.fillStyle = on ? '#FFD400' : '#5a4a00'; g.fillRect(x + 1, 172, 6, 4);
        if (on){ g.globalAlpha = 0.12; g.fillStyle = '#FFD400'; g.fillRect(x - 6, 176, 20, 32); g.globalAlpha = 1; }
      }
    }
  } else {
    tile(L.far, 0.25, 0); tile(L.mid, 0.5, 0);
    if (th.bg === 'rooftop'){ // acid rain
      g.globalAlpha = 0.35; g.fillStyle = '#7dffb0';
      for (let i = 0; i < 70; i++){ const x = ((i * 53 + G.frame * 3 - camX * 0.8) % 270 + 270) % 270 - 7, y = ((i * 97 + G.frame * 7) % 250) - 10; g.fillRect(x | 0, y, 1, 4); }
      g.globalAlpha = 1;
    }
    if (th.bg === 'factory'){ g.fillStyle = 'rgba(255,106,0,0.05)'; g.fillRect(0, 150, W, 90); }
  }
  if (lv.waterFloor){ // sea / marsh water under the pier and the bridge
    g.fillStyle = '#1b2a4a'; g.fillRect(0, 219, W, 1); g.fillStyle = lv.theme === 'pier' ? '#16506e' : '#2f7fd8'; g.fillRect(0, 220, W, 20);
    g.fillStyle = lv.theme === 'pier' ? '#2a7090' : '#5aa8f0'; for (let i = 0; i < W + 32; i += 16){ const o = ((i - camX * 0.9 + G.frame * 0.3) % 272 + 272) % 272 - 16; g.fillRect(Math.round(o), 220 + ((i >> 4) % 2), 8, 1); }
    g.fillStyle = '#e8f8ff'; for (let i = 0; i < 6; i++){ const o = ((i * 47 - camX + G.frame * 0.5) % 270 + 270) % 270 - 8; g.fillRect(Math.round(o), 226 + (i % 3) * 4, 5, 1); }
  }
  if (lv.mistFloor){ g.fillStyle = 'rgba(255,158,196,0.55)'; g.fillRect(0, 222, W, 18); g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 8; i++) g.fillRect(((i * 41 - camX * 0.7 + G.frame * 0.2) % 270 + 270) % 270 - 10, 224 + (i % 3) * 5, 18, 2); }
  if (lv.voidFloor){ // glitch void at the bottom of the tower
    const r = rng(G.frame * 7 + 3);
    for (let y = 214; y < 240; y += 2) for (let x = 0; x < W; x += 2){ const v = r(); g.fillStyle = v < 0.5 ? '#0a0612' : v < 0.75 ? '#3a1a5a' : v < 0.88 ? '#ff00c8' : v < 0.96 ? '#00e5ff' : '#ffffff'; g.fillRect(x, y, 2, 2); }
    g.fillStyle = 'rgba(255,0,200,0.25)'; g.fillRect(0, 212, W, 2);
  }
}

// ---------------- world drawing ----------------
function drawTiles(){
  const x0 = Math.max(0, Math.floor(camX / TS)), x1 = Math.min(lv.w - 1, x0 + 17);
  const qf = (G.frame >> 3) % 4, cf = (G.frame >> 2) % 4;
  for (let ty = 0; ty < lv.h; ty++) for (let tx = x0; tx <= x1; tx++){
    const c = lv.t[ty][tx]; if (c === '.' || c === 'p' || c === 'H') continue;
    const bt = lv.bumps[tx + ',' + ty];
    const off = bt ? -[0, 1, 2, 4, 5, 6, 5, 4, 3, 2, 1][bt] || 0 : 0;
    const X = Math.round(tx * TS - camX), Y = ty * TS + off;
    let img = null;
    switch (c){
      case 'G': img = (SOLID_TILES.has(tileAt(tx, ty - 1)) && tileAt(tx, ty - 1) === 'G') ? TSET.ground[tx & 3] : TSET.groundTop[(tx * 7) & 3]; break;
      case 'B': img = TSET.brick; break;
      case '?': img = TSET.crt[qf]; break;
      case 'M': img = ((G.frame + tx * 13) % 150 < 8) ? TSET.mimicTell : TSET.crt[qf]; break;
      case 'U': img = TSET.used; break;
      case 'S': img = TSET.solid; break;
      case 'D': img = TSET.wall[(tx + ty) & 1]; break;
      case '>': img = TSET.convR[cf]; break;
      case '<': img = TSET.convL[cf]; break;
      case 'R': img = TSET.barrel; break;
      case 'A': img = TSET.acid[(G.frame >> 3) % 4]; break;
      case 'b': img = TSET.bridge; break;
      case '=': img = TSET.plank || S.tileset('tide').plank; break;
      case 'K': { const cr = lv.crumbles && lv.crumbles[tx + ',' + ty]; g.drawImage(TSET.crumble || S.tileset('tide').crumble, X + (cr ? ((G.frame >> 1) % 2 ? 1 : -1) : 0), Y + (cr ? Math.min(3, cr.t >> 3) : 0)); continue; }
      case 'X': img = TSET.stone || S.tileset('grave').stone; break;
      case 'Q': { const run = coilAt(tx, ty); img = (TSET.coil || S.tileset('wiring').coil)[run ? coilState(run) : 'off']; break; }
      case 'O': img = TSET.outlet || S.tileset('wiring').outlet; break;
      case 'W': img = TSET.fridge || S.tileset('basement').fridge; break;
      case 'Y': { const ts = (lv.toasters || []).find(q => q.tx === tx && q.ty === ty); img = (TSET.toaster || S.tileset('diner').toaster)[ts && ts.warn ? 1 : 0]; break; }
      case 'm': if (lv.rgbT > 0){ g.globalAlpha = 0.25; g.drawImage(TSET.rgbM[1], X, Y); g.globalAlpha = 1; continue; } img = TSET.rgbM[0]; break; // v0.8 magenta: solid until the switch runs
      case 'c': if (!(lv.rgbT > 0)){ g.globalAlpha = 0.35; g.drawImage(TSET.rgbC[1], X, Y); g.globalAlpha = 1; continue; } img = TSET.rgbC[0]; break; // cyan: solid only while it runs
      case 'Z': img = TSET.rgbSwitch[lv.rgbT > 0 ? 1 : 0]; break;
      case 'n': case 'N': { const ph = crtPhase(c === 'N' ? 1 : 0), set = c === 'N' ? TSET.crtB : TSET.crtA; if (!set) break; if (!ph.on){ g.globalAlpha = 0.3; g.drawImage(set[1], X, Y); g.globalAlpha = 1; continue; } img = ph.left < 30 && (G.frame >> 2) % 2 ? set[2] : set[0]; break; } // v0.9 CRT platform
      case 'g': if (S.arcade){ g.drawImage(S.arcade.figcap[(G.frame >> 4) & 1], X + 2, Y + 1 + ((G.frame >> 4) & 1)); } continue; // mini figure capsule
      case 'k': if (S.arcade){ g.drawImage(S.arcade.ticket, X + 2, Y + 4 + (((G.frame >> 3) + tx) % 2)); } continue; // prize ticket
      case 'J': img = (TSET.spring || S.tileset('hatch').spring)[lv.springT && lv.springT[tx + ',' + ty] ? 1 : 0]; break;
      case 'o': { const f = ((G.frame >> 3) + tx) % 4, ww = [8, 6, 2, 6][f]; g.drawImage(TSET.arcade && S.arcade ? S.arcade.token : S.coin, X + 8 - ww / 2, Y + 3, ww, 10); continue; }
    }
    if (img) g.drawImage(img, X, Y);
  }
  drawBroTiles();
}
const PIPE_COLS = ['#06222a', '#134b55', '#1d6e7c', '#3fb3c4', '#a9f4ff', '#6fd6e6', '#3fb3c4', '#3fb3c4', '#2a93a3', '#1d6e7c', '#134b55', '#06222a'];
function pipeColor(i, n){ if (i === 0 || i === n - 1) return '#06222a'; const t = i / (n - 1); return PIPE_COLS[Math.min(PIPE_COLS.length - 2, Math.max(1, Math.round(t * (PIPE_COLS.length - 1))))]; }
function vPipe(x, y, w, h){ for (let i = 0; i < w; i++){ g.fillStyle = pipeColor(i, w); g.fillRect(x + i, y, 1, h); } }
function hPipe(x, y, w, h){ for (let i = 0; i < h; i++){ g.fillStyle = pipeColor(i, h); g.fillRect(x, y + i, w, 1); } }
function drawPipes(){
  for (const pp of lv.pipes){
    const X = Math.round(pp.x * TS - camX), Y = pp.y * TS;
    if (pp.dir === 'up'){
      if (X < -40 || X > W + 8) continue;
      vPipe(X + 2, Y + 14, 28, pp.h * TS - 14);
      vPipe(X, Y, 32, 14); g.fillStyle = '#06222a'; g.fillRect(X, Y, 32, 1); g.fillRect(X, Y + 13, 32, 1);
      g.fillStyle = pp.warp ? '#ff00c8' : '#FFD400'; g.fillRect(X + 1, Y + 6, 30, 2);
      if (pp.enter && !pp.secret && (G.frame >> 4) % 2){ g.fillStyle = '#00e5ff'; g.fillRect(X + 13, Y + 3, 6, 1); }
      if (pp.warp){ drawTextC(g, String(pp.warp), X + 16, Y - 22, '#FFD400', 2, '#000'); }
    } else if (pp.dir === 'left'){
      if (X < -80 || X > W + 8) continue;
      vPipe(X + 32 + 2, pp.stub ? Y - 16 : 0, 28, pp.stub ? 18 : Y + 2);
      hPipe(X + 14, Y + 2, 48, 28);
      hPipe(X, Y, 14, 32); g.fillStyle = '#06222a'; g.fillRect(X, Y, 1, 32); g.fillRect(X + 13, Y, 1, 32);
      g.fillStyle = '#FFD400'; g.fillRect(X + 6, Y + 1, 2, 30);
    }
  }
}
function drawSigns(){
  for (const s of lv.signs){
    const X = Math.round(s.tx * TS - camX); if (X < -100 || X > W + 20) continue;
    drawTextC(g, s.text, X + 8, s.ty * TS, s.color || '#FFD400', 1, '#000');
  }
}
function drawPlats(){
  for (const pl of plats){
    if (pl.kind === 'card'){ drawCardPlat(pl); continue; }
    if (pl.gone) continue;
    if (pl.kind === 'reel'){ drawReel(pl); continue; }
    if (pl.look === 'basket'){ drawBasket(pl); continue; }
    if (pl.look === 'swing'){ drawSwingPlat(pl); continue; }
    if (pl.axis === 'pusher'){ drawPusher(pl); continue; } // v0.9
    if (pl.axis === 'claw'){ drawClawPlat(pl); continue; }
    if (pl.axis === 'geyser'){ drawGeyser(pl); continue; } // v0.8 jam geyser column
    const X = Math.round(pl.x - camX + (pl.fallT > 0 && pl.vy === 0 ? ((G.frame >> 1) % 2 ? 1 : -1) : 0)), Y = Math.round(pl.y);
    if (X > W || X + pl.w < 0) continue;
    const fall = pl.kind === 'fall';
    g.fillStyle = '#05040a'; g.fillRect(X, Y, pl.w, 8);
    g.fillStyle = fall ? '#8a5a2a' : '#5a6270'; g.fillRect(X + 1, Y + 1, pl.w - 2, 6);
    g.fillStyle = fall ? '#c88a4a' : '#c4ccd8'; g.fillRect(X + 1, Y + 1, pl.w - 2, 1);
    for (let i = 6; i < pl.w - 2; i += 10){ g.fillStyle = fall ? '#5a3a1a' : (G.frame >> 3) % 2 ? '#00e5ff' : '#ff00c8'; g.fillRect(X + i, Y + 4, 3, 2); }
  }
}
function drawHazards(){
  for (const fb of lv.firebars){
    const X = fb.tx * TS - camX; if (X < -140 || X > W + 140) continue;
    for (const [ox, oy] of firebarOrbs(fb)){
      const x = Math.round(ox - camX), y = Math.round(oy), r = rng(((ox * 7 + oy * 3) | 0) + G.frame);
      g.fillStyle = '#05040a'; g.fillRect(x - 4, y - 4, 8, 8);
      for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++){ const v = r(); g.fillStyle = v < 0.3 ? '#ffffff' : v < 0.55 ? '#00e5ff' : v < 0.7 ? '#ff00c8' : '#8a8a8a'; g.fillRect(x - 3 + i, y - 3 + j, 1, 1); }
    }
  }
  for (const bm of lv.beams){
    const X = Math.round(bm.tx * TS - camX); if (X < -16 || X > W) continue;
    if (lv.flameVents){ // toaster pop-up flame vents (World 2)
      const st = beamState(bm), base = (bm.y1 + 1) * TS;
      g.fillStyle = '#1b2a4a'; g.fillRect(X + 1, base - 4, 14, 5); g.fillStyle = '#7e8ea6'; g.fillRect(X + 2, base - 3, 12, 2); g.fillStyle = '#1b2a4a'; g.fillRect(X + 4, base - 3, 8, 1);
      if (st === 'on'){ const top = bm.y0 * TS; for (let y = top; y < base - 3; y += 3){ const w = 4 + Math.round(4 * (y - top) / (base - top)) + ((G.frame + y) % 3); g.fillStyle = '#1b2a4a'; g.fillRect(X + 8 - w / 2 - 1, y, w + 2, 3); g.fillStyle = (y + G.frame) % 6 < 3 ? '#ff6a00' : '#FFD400'; g.fillRect(X + 8 - w / 2, y, w, 3); g.fillStyle = '#fff3a0'; g.fillRect(X + 7, y, 2, 3); } }
      else if (st === 'warn' && (G.frame >> 2) % 2){ g.fillStyle = '#ff6a00'; g.fillRect(X + 6, base - 8, 4, 4); }
      continue;
    }
    g.fillStyle = '#3a3f4a'; g.fillRect(X + 2, bm.y0 * TS - 6, 12, 6); g.fillRect(X + 2, (bm.y1 + 1) * TS, 12, 4);
    const st = beamState(bm);
    if (st === 'on'){
      const r = rng(G.frame * 3 + bm.tx);
      for (let y = bm.y0 * TS; y < (bm.y1 + 1) * TS; y += 2){ const v = r(); g.fillStyle = v < 0.4 ? '#ffffff' : v < 0.75 ? '#00e5ff' : '#ff00c8'; g.fillRect(X + 5 + ((r() * 3) | 0) - 1, y, 6, 2); }
      g.globalAlpha = 0.2; g.fillStyle = '#00e5ff'; g.fillRect(X + 1, bm.y0 * TS, 14, (bm.y1 - bm.y0 + 1) * TS); g.globalAlpha = 1;
    } else if (st === 'warn' && (G.frame >> 2) % 2){ g.fillStyle = '#ff0040'; g.fillRect(X + 7, bm.y0 * TS, 2, (bm.y1 - bm.y0 + 1) * TS); }
  }
  for (const pt of patches){
    const X = Math.round(pt.x - camX), a = Math.min(1, pt.t / 60);
    if (X > W || X + pt.w < 0) continue;
    g.globalAlpha = a;
    if (pt.kind === 'puddle'){ // flat cartoon puddle: navy rim, 3-step blue
      g.fillStyle = '#1b2a4a'; g.fillRect(X - 1, pt.y - 3, pt.w + 2, 3);
      g.fillStyle = '#3a7ad8'; g.fillRect(X, pt.y - 2, pt.w, 2); g.fillStyle = '#8ac8ff'; g.fillRect(X + 1, pt.y - 2, pt.w - 2, 1);
      g.fillStyle = '#e8f8ff'; for (let i = 3 + ((G.frame >> 4) % 4); i < pt.w - 3; i += 11) g.fillRect(X + i, pt.y - 2, 3, 1);
    } else if (pt.kind === 'butter'){
      g.fillStyle = '#1b2a4a'; g.fillRect(X - 1, pt.y - 3, pt.w + 2, 3);
      g.fillStyle = '#e8c040'; g.fillRect(X, pt.y - 2, pt.w, 2); g.fillStyle = '#ffe680'; g.fillRect(X + 1, pt.y - 2, pt.w - 2, 1);
      g.fillStyle = '#fffbe0'; for (let i = 4; i < pt.w - 3; i += 9) g.fillRect(X + i, pt.y - 3, 2, 1);
    } else { g.fillStyle = '#ffe88a'; g.fillRect(X, pt.y - 2, pt.w, 2); g.fillStyle = '#fff6c8'; for (let i = 2; i < pt.w; i += 7) g.fillRect(X + i, pt.y - 3, 3, 1); }
    g.globalAlpha = 1;
  }
  for (const bp of lv.boosts){
    const X = Math.round(bp.tx * TS - camX); if (X < -16 || X > W) continue;
    g.drawImage(S.toon.boost[(G.frame >> 3) & 1], X, bp.row * TS - 5);
  }
  for (const f of ftoasts){
    const X = Math.round(f.x - camX - 1), Y = Math.round(f.y - 3);
    g.drawImage(S.toon.ftoast[(G.frame >> 2) & 1], X, Y);
    if (f.landed){ g.globalAlpha = 0.5; g.fillStyle = '#ff6a00'; g.fillRect(X - 2, Y + 10, 17, 3); g.globalAlpha = 1; }
  }
  for (const b of bolts){
    const X = Math.round(b.x - camX), Y = Math.round(b.y);
    if (b.homing){
      g.save(); g.translate(X + 5, Y + 4); g.rotate(Math.round((b.ang || Math.atan2(b.vy, b.vx)) / (Math.PI / 8)) * (Math.PI / 8));
      g.drawImage(b.reflected ? S.toon.hrocketR : S.toon.hrocket, -7, -5); g.restore(); continue;
    }
    if (b.kind === 'shock' || b.kind === 'gwave' || b.kind === 'iou' || b.kind === 'wrench' || (b.kind === 'glob' && !b.mine)) continue;
    g.fillStyle = '#05040a'; g.fillRect(X - 3, Y - 3, 6, 6);
    g.fillStyle = (G.frame >> 1) % 2 ? '#00e5ff' : '#ffffff'; g.fillRect(X - 2, Y - 2, 4, 4); g.fillStyle = '#ff00c8'; g.fillRect(X - 1, Y - 1, 2, 2);
  }
}
function drawToaster(){
  const b = BOSS, X = Math.round(b.x - camX) - 3, Y = Math.round(b.y) - 15;
  if (b.dead){ g.drawImage(S.grand.down, X, Y); return; }
  if (b.flash > 0 && !b.dying && (G.frame >> 1) % 2) return;
  const R = b.dir > 0 ? '_R' : '';
  let img = S.grand['idle' + R], sx = 0;
  if (b.dying) img = S.grand['down' + R];
  else if (b.state === 'hurt') img = S.grand['down' + R];
  else if (b.state === 'rev' || b.state === 'ram'){ img = S.grand['ram' + R]; sx = b.state === 'rev' ? ((G.frame >> 1) % 2 ? 1 : -1) : 0; }
  else if (b.hp <= 1 || b.state === 'pop') img = S.grand['angry' + R];
  g.drawImage(img, X + sx + (b.dying ? ((G.frame >> 1) % 2 ? 1 : -1) : 0), Y + (b.state === 'idle' && (G.frame >> 4) % 2 ? 1 : 0));
  if (b.state === 'dizzy'){ for (let i = 0; i < 3; i++){ const a = G.frame * 0.12 + i * 2.1; g.fillStyle = '#FFD400'; g.fillRect(X + 43 + Math.cos(a) * 14, Y + 2 + Math.sin(a) * 3, 3, 3); } }
  if (b.active && !b.dying){
    drawText(g, 'THE GRAND TOASTER', 60, 52, '#FFD400', 1, '#1b2a4a');
    for (let i = 0; i < 3; i++){ g.fillStyle = '#1b2a4a'; g.fillRect(166 + i * 9, 52, 8, 8); g.fillStyle = i < b.hp ? '#FFD400' : '#3a4a6a'; g.fillRect(167 + i * 9, 53, 6, 6); }
    for (let i = 0; i < b.dents; i++){ g.fillStyle = '#b8c6d8'; g.fillRect(167 + i * 4, 62, 3, 2); }
  }
}
function drawBoss(){
  if (BOSS && BOSS.kind === 'toaster') return drawToaster();
  if (BOSS && BOSS.kind === 'breadlord') return drawBreadlord();
  if (BOSS && BOSS.kind === 'repairman') return drawRepairman();
  if (BOSS && BOSS.kind === 'hive') return drawHive();
  if (BOSS && BOSS.kind === 'quartz') return drawQuartz();
  if (BOSS && BOSS.kind === 'vault') return drawVault();
  if (!BOSS || BOSS.dead) { if (BOSS) drawSwitch(); return; }
  drawSwitch();
  const b = BOSS, X = Math.round(b.x - camX), Y = Math.round(b.y);
  if (X < -40 || X > W + 10) return;
  if (b.flash > 0 && (G.frame >> 1) % 2) return;
  const t = G.frame, dying = b.dying;
  const squash = dying ? Math.max(0.05, 1 - b.dt / 120) : 1;
  const hh = Math.max(2, Math.round(28 * squash)), yy = Y + 28 - hh;
  const split = dying ? 3 + (b.dt >> 3) : (b.state === 'charge' ? 2 : 1);
  const body = (dx, col) => {
    g.fillStyle = col;
    g.fillRect(X + dx + 2, yy, 24, hh);          // CRT skull head
    g.fillRect(X + dx, yy + 4 * squash, 28, hh - 8 * squash);
  };
  body(-split, 'rgba(255,0,64,0.7)'); body(split, 'rgba(0,240,255,0.7)'); body(0, '#1a1a22');
  if (hh > 8){
    // static screen face
    const r = rng(t * 5 + 1);
    for (let j = 3; j < hh - 9; j += 2) for (let i = 4; i < 24; i += 2){ const v = r(); g.fillStyle = v < 0.5 ? '#2a2a2a' : v < 0.85 ? '#8c8c8c' : '#e0e0e0'; g.fillRect(X + i, yy + j, 2, 2); }
    // skull eyes + teeth
    const eye = b.state === 'charge' || b.state === 'volley' ? ((t >> 1) % 2 ? '#ff0040' : '#ffffff') : '#ff0040';
    g.fillStyle = '#000'; g.fillRect(X + 6, yy + 6, 6, 6); g.fillRect(X + 16, yy + 6, 6, 6);
    g.fillStyle = eye; g.fillRect(X + 8, yy + 8, 2, 2); g.fillRect(X + 18, yy + 8, 2, 2);
    g.fillStyle = '#000'; g.fillRect(X + 12, yy + 14, 4, 3);
    for (let i = 0; i < 5; i++){ g.fillStyle = '#e6e6e6'; g.fillRect(X + 6 + i * 4, yy + hh - 8, 3, 4); }
    // antennas
    g.fillStyle = '#c4ccd8'; for (let i = 0; i < 8; i++){ g.fillRect(X + 8 - i, yy - i, 1, 1); g.fillRect(X + 20 + i, yy - i, 1, 1); }
    g.fillStyle = '#ff0040'; g.fillRect(X - 1, yy - 9, 2, 2); g.fillStyle = '#00e5ff'; g.fillRect(X + 27, yy - 9, 2, 2);
  }
  if (b.active && !dying){ // HP bar
    drawText(g, 'THE GLITCH', 88, 52, '#ff00c8', 1, '#000');
    for (let i = 0; i < 5; i++){ g.fillStyle = '#000'; g.fillRect(150 + i * 8, 52, 7, 7); g.fillStyle = i < b.hp ? '#ff00c8' : '#2a2a2a'; g.fillRect(151 + i * 8, 53, 5, 5); }
  }
}
function drawSwitch(){
  const sp = BOSS.spec, X = Math.round(sp.switchTx * TS - camX), Y = sp.switchTy * TS;
  if (X < -20 || X > W + 4) return;
  g.fillStyle = '#05040a'; g.fillRect(X + 1, Y - 1, 14, 34);
  g.fillStyle = '#3a3f4a'; g.fillRect(X + 2, Y, 12, 32);
  g.fillStyle = '#5a6270'; g.fillRect(X + 4, Y + 4, 8, 10);
  if (!G.unplugged){
    g.fillStyle = '#FFD400'; g.fillRect(X + 6, Y + 6, 4, 6); // plug in socket
    g.fillStyle = '#111'; g.fillRect(X + 7, Y + 12, 2, 20); g.fillRect(X + 7, Y + 30, -40, 2);
    g.fillStyle = (G.frame >> 3) % 2 ? '#39ff6a' : '#0a3a1a'; g.fillRect(X + 5, Y + 18, 6, 3);
  } else {
    g.fillStyle = '#000'; g.fillRect(X + 6, Y + 7, 4, 4);
    g.fillStyle = '#FFD400'; g.fillRect(X + 14, Y + 20, 6, 4); g.fillStyle = '#111'; g.fillRect(X + 20, Y + 21, 10, 2);
    g.fillStyle = '#ff0040'; g.fillRect(X + 5, Y + 18, 6, 3);
  }
}
function drawPoleAndBooth(){
  if (POLE){
    const X = Math.round(POLE.x - camX);
    if (X > -40 && X < W + 40){
      g.fillStyle = '#5a6270'; g.fillRect(X - 1, POLE.top, 1, POLE.base - POLE.top);
      g.fillStyle = '#d7dbe3'; g.fillRect(X, POLE.top, 2, POLE.base - POLE.top);
      for (let y = POLE.top + 12; y < POLE.base; y += 24){ g.fillStyle = '#FFD400'; g.fillRect(X - 1, y, 4, 2); }
      const py = Math.round(G.pennant);
      g.fillStyle = '#FFD400';
      for (let r = 0; r < 9; r++){ const w = Math.max(1, Math.round(11 * (1 - Math.abs(r - 4) / 5))); g.fillRect(X - 1 - w, py + r, w, 1); }
      g.fillStyle = '#000'; g.fillRect(X - 7, py + 3, 2, 2); g.fillRect(X - 4, py + 3, 2, 2); g.fillRect(X - 6, py + 6, 3, 1);
      const tx = X - 7, ty = POLE.top - 16;
      g.fillStyle = '#c4ccd8'; for (let i = 0; i < 9; i++){ g.fillRect(tx + 7 - i, ty - i, 1, 1); g.fillRect(tx + 8 + i, ty - i, 1, 1); }
      g.fillStyle = '#ff2a3a'; g.fillRect(tx - 2, ty - 10, 2, 2); g.fillStyle = '#00e5ff'; g.fillRect(tx + 16, ty - 10, 2, 2);
      g.fillStyle = '#000'; g.fillRect(tx, ty, 16, 16); g.fillStyle = '#3a3f4a'; g.fillRect(tx + 1, ty + 1, 14, 14);
      if (G.tvOn){ g.fillStyle = '#05070d'; g.fillRect(tx + 2, ty + 2, 12, 10); g.drawImage(S.coin, tx + 4, ty + 2); }
      else { const r = rng(G.frame * 13 + 1); for (let j = 0; j < 10; j++) for (let i = 0; i < 12; i++){ const v = r(); g.fillStyle = v < 0.5 ? '#2a2a2a' : v < 0.85 ? '#8c8c8c' : '#e0e0e0'; g.fillRect(tx + 2 + i, ty + 2 + j, 1, 1); } }
    }
  }
  if (BOOTH){
    const bx = Math.round(BOOTH.x - camX);
    if (bx < W + 8 && bx > -120 && TSET.bumbo){ drawBumboTV(g, bx, BOOTH.ground - 80, Math.round(BOOTH.door - 2 - camX), G.frame, G.onAir); }
    else if (bx < W + 8 && bx > -120 && TSET.crypt && typeof drawCryptGate === 'function'){ drawCryptGate(g, bx, BOOTH.ground - 80, Math.round(BOOTH.door - 2 - camX), G.frame, G.onAir); } // v0.8 mausoleum gate
    else if (bx < W + 8 && bx > -120 && TSET.arcade && typeof drawArcadeGate === 'function'){ drawArcadeGate(g, bx, BOOTH.ground - 80, Math.round(BOOTH.door - 2 - camX), G.frame, G.onAir); } // v0.9 prize counter
    else if (bx < W + 8 && bx > -120){
      const by = BOOTH.ground - 80;
      g.fillStyle = '#000'; g.fillRect(bx - 1, by - 1, 98, 82);
      g.fillStyle = '#4c5260'; g.fillRect(bx, by, 96, 80);
      g.fillStyle = '#5c6370'; for (let y = by + 4; y < by + 80; y += 8) g.fillRect(bx, y, 96, 1);
      g.fillStyle = '#2a2e38'; g.fillRect(bx - 4, by - 6, 104, 8);
      g.fillStyle = '#20263a'; g.fillRect(bx + 70, by - 34, 2, 28); g.fillRect(bx + 62, by - 26, 18, 1);
      g.fillStyle = (G.frame >> 4) % 2 ? '#ff2a3a' : '#5a0010'; g.fillRect(bx + 70, by - 36, 2, 2);
      g.fillStyle = '#000'; g.fillRect(bx + 22, by + 8, 52, 13);
      g.fillStyle = G.onAir ? '#ff2a3a' : '#401016'; g.fillRect(bx + 23, by + 9, 50, 11);
      drawTextC(g, 'ON AIR', bx + 48, by + 11, G.onAir ? '#ffffff' : '#7a3040');
      for (const wx of [bx + 8, bx + 72]){ g.fillStyle = '#000'; g.fillRect(wx, by + 30, 16, 14); const r = rng(G.frame + wx); for (let j = 0; j < 10; j++) for (let i = 0; i < 12; i++){ g.fillStyle = r() < 0.5 ? '#333' : '#999'; g.fillRect(wx + 2 + i, by + 32 + j, 1, 1); } }
      const dx = Math.round(BOOTH.door - 2 - camX);
      g.fillStyle = '#FFD400'; g.fillRect(dx - 2, by + 46, 20, 34);
      g.fillStyle = '#05070d'; g.fillRect(dx, by + 48, 16, 32);
    }
  }
}
function heroSprite(){
  const p = P;
  if (S.bro && p.bro){
    let k = 'stand';
    if (p.dead) k = 'die';
    else if (p.roll > 0 && p.bro === 'skulrz') k = 'roll';
    else if (p.ctrl === 'pole') k = 'jump';
    else if (!p.onGround && p.ctrl === 'normal') k = 'jump';
    else if (p.skid) k = 'skid';
    else if (Math.abs(p.vx) > 0.05 || p.ctrl === 'pipeSide' || p.ctrl === 'walkoff') k = 'walk' + (1 + (Math.floor(p.anim) % 3));
    const img = broFrame(p.bro, k, p.facing < 0);
    return p.star > 0 ? img : img;
  }
  let set = S.hero;
  if (p.star > 0) set = S.heroStar[(G.frame >> 1) % 3]; else if (p.size === 2) set = S.heroFire;
  let big = p.size > 0;
  if (p.morph > 0){ const ph = (p.morph >> 2) & 1; if (p.morphDir === 1) big = !!ph; else if (p.morphDir === -1) big = !ph; }
  let k = 'stand';
  if (p.dead) { k = 'die'; big = false; }
  else if (p.ctrl === 'pole') k = 'jump';
  else if (p.crouch && big) k = 'crouch';
  else if (!p.onGround && p.ctrl === 'normal') k = 'jump';
  else if (p.skid) k = 'skid';
  else if (Math.abs(p.vx) > 0.05 || p.ctrl === 'pipeSide' || p.ctrl === 'walkoff') k = 'walk' + (1 + (Math.floor(p.anim) % 3));
  const sz = big ? set.big : set.small;
  return sz[k + (p.facing < 0 ? '_L' : '')] || sz.stand;
}
function drawPlayer(){
  const p = P;
  if (p.ctrl === 'gone') return;
  if (p.inv > 0 && !p.dead && (G.frame >> 1) % 2) return;
  const img = heroSprite();
  const X = Math.round(p.x - 2 - camX), Y = Math.round(p.y + p.h - img.height);
  if (p.wall && p.vy > 0 && !p.dead){ if (G.frame % 4 === 0) parts.push({ x: p.wall > 0 ? p.x + p.w : p.x, y: p.y + p.h - 4, vx: -p.wall * 0.3, vy: -0.3, g: 0, life: 10, color: '#c8c8c8', size: 1 }); }
  if (p.roll > 0 && p.bro === 'skulrz' && !p.dead){ g.save(); g.translate(X + 8, Y + 8); g.rotate(Math.floor(p.roll / 2) * Math.PI / 4 * p.facing); g.drawImage(img, -8, -8); g.restore(); return; }
  if (!p.dead && p.ctrl === 'normal' && p.bro) drawWeapon(p, X, Y);
  if (p.star > 0){ g.globalAlpha = 0.75; g.drawImage(tinted(img, '#ff0040'), X - 2, Y); g.drawImage(tinted(img, '#00f0ff'), X + 2, Y); g.globalAlpha = 1; }
  g.drawImage(img, X, Y);
  if (p.bro) drawBroExtras(p, X, Y, img);
  if (p.boost > 0 && !p.dead){ for (let i = 0; i < 4; i++){ g.fillStyle = (i + (G.frame >> 2)) % 2 ? '#FFD400' : '#ffffff'; g.fillRect(X + 2 + i * 3, Y - 3, 2, 2); } g.fillStyle = '#1b2a4a'; g.fillRect(X + 2, Y - 1, 12, 1); }
}
function drawDecor(){
  for (const d of lv.decor){
    const X = Math.round(d.tx * TS - camX), Y = d.row * TS;
    if (X < -140 || X > W + 8) continue;
    if (typeof ARCADE_DECOR !== 'undefined' && ARCADE_DECOR.has(d.kind)){ drawArcadeDecor(g, d, X, Y, G.frame); continue; }
    if (typeof CRYPT_DECOR !== 'undefined' && CRYPT_DECOR.has(d.kind)){ drawCryptDecor(g, d, X, Y, G.frame); continue; }
    if (typeof BUMBO_DECOR !== 'undefined' && BUMBO_DECOR.has(d.kind)){ drawBumboDecor(g, d, X, Y, G.frame); continue; }
    if (typeof DINER_DECOR !== 'undefined' && DINER_DECOR.has(d.kind)){ if (d.kind === 'lamp') d.lit = flickerDark(G.lf) < 0.5; drawDinerDecor(g, d, X, Y, G.frame); continue; }
    if (d.kind === 'truck'){ g.drawImage(S.toon.toasterTruck, X, Y - 50); g.drawImage(S.toon.driver, X + 44, Y - 38); }
    else if (d.kind === 'shack'){ // bait shack (parody name)
      g.fillStyle = '#1b2a4a'; g.fillRect(X - 1, Y - 47, 100, 47); g.fillStyle = '#ffcfa0'; g.fillRect(X, Y - 46, 98, 46); g.fillStyle = '#ffe4c8'; g.fillRect(X, Y - 46, 98, 2); g.fillStyle = '#d89a6a'; g.fillRect(X, Y - 4, 98, 4);
      for (let i = 6; i < 98; i += 8){ g.fillStyle = '#e8b888'; g.fillRect(X + i, Y - 40, 1, 36); }
      g.fillStyle = '#1b2a4a'; g.fillRect(X - 5, Y - 54, 108, 9); g.fillStyle = '#4a8ad8'; g.fillRect(X - 4, Y - 53, 106, 7); g.fillStyle = '#8ac0ff'; g.fillRect(X - 4, Y - 53, 106, 1);
      g.fillStyle = '#1b2a4a'; g.fillRect(X + 6, Y - 40, 88, 13); g.fillStyle = '#FFD400'; g.fillRect(X + 7, Y - 39, 86, 11);
      drawTextC(g, "BAIT 'N' TOAST", X + 50, Y - 37, '#1b2a4a');
      g.fillStyle = '#1b2a4a'; g.fillRect(X + 40, Y - 24, 18, 24); g.fillStyle = '#5a3e26'; g.fillRect(X + 41, Y - 23, 16, 23);
      g.fillStyle = '#1b2a4a'; g.fillRect(X + 10, Y - 22, 20, 12); g.fillRect(X + 68, Y - 22, 20, 12); g.fillStyle = '#a8e0ff'; g.fillRect(X + 11, Y - 21, 18, 10); g.fillRect(X + 69, Y - 21, 18, 10);
      drawTextC(g, 'LIVE WORMS', X + 78, Y - 8, '#1b2a4a');
    } else if (d.kind === 'sign'){
      const w = textWidth(d.text) + 8; g.fillStyle = '#1b2a4a'; g.fillRect(X + 7, Y - 14, 2, 14); g.fillRect(X - w / 2 + 8 - 1, Y - 27, w + 2, 13); g.fillStyle = d.color || '#FFD400'; g.fillRect(X - w / 2 + 8, Y - 26, w, 11); drawTextC(g, d.text, X + 8, Y - 24, '#1b2a4a');
    }
  }
}
function drawEnemies(){
  for (const e of enemies){
    const X0 = Math.round(e.x - 2 - camX);
    if (X0 < -40 || X0 > W + 4) continue;
    const flash = e.hitT > 0 && !e.dead && (e.hitT & 2);
    if (flash) g.filter = 'brightness(2.6)';
    drawEnemy(e, X0);
    if (flash) g.filter = 'none';
  }
}
function drawEnemy(e, X){
  if (e.type === 'toast' && e.trail && !e.dead) drawGlitchTrail(e);
  if (PIT_TYPES.has(e.type) && drawPitEnemy(e, X)) return;
  if (DINER_TYPES.has(e.type) && drawDinerEnemy(e, X)) return;
  if (BUMBO_TYPES.has(e.type) && drawBumboEnemy(e, X)) return;
  if (CRYPT_TYPES.has(e.type) && drawCryptEnemy(e, X)) return;
  if (ARCADE_TYPES.has(e.type) && drawArcadeEnemy(e, X)) return;
  {
    const L = e.facing < 0 ? '_L' : '', Yb = Math.round(e.y + e.h - 16);
    let img;
    if (e.type === 'rifle'){
      const left = e.facing < 0;
      img = e.dead === 'flip' ? S.antennaFlip : (left ? S.antenna_L : S.antenna)[e.state === 'aim' ? ((G.frame >> 2) & 1) : 0];
      g.drawImage(img, X, Yb);
      if (!e.dead){
        const gx = left ? X - 6 : X + 9, gy = Yb + 8;
        g.fillStyle = '#10121e'; g.fillRect(gx - 1, gy - 1, 12, 4); g.fillStyle = '#5c6370'; g.fillRect(gx, gy, 10, 2); g.fillStyle = '#7a4a1e'; g.fillRect(left ? gx + 7 : gx, gy, 3, 2);
        g.fillStyle = '#ff2a3a'; g.fillRect(X + 2, Yb - 2, 10, 1); // red beret band = rifleman
        if (e.state === 'aim'){ g.globalAlpha = 0.6; g.fillStyle = '#ff0040'; const lx = left ? gx - 150 : gx + 10; g.fillRect(lx, gy, 140, 1); g.globalAlpha = 1; }
        if (e.state === 'fire' && e.t % 7 < 3){ g.fillStyle = '#FFD400'; g.fillRect(left ? gx - 3 : gx + 10, gy - 1, 3, 4); }
      }
      return;
    }
    if (e.type === 'gunner'){
      const tk = S.toon.truck[e.color || 'blue'];
      if (e.dead === 'squash') img = tk.flat; else img = (e.facing < 0 ? tk.L : tk.R)[(e.anim >> 3) & 1];
      if (e.dead === 'flip'){ g.save(); g.translate(X + 18, Math.round(e.y + 12)); g.scale(1, -1); g.drawImage(img, -16, -11); g.restore(); return; }
      const ty = Math.round(e.y + e.h - 22);
      g.drawImage(img, X - 1, ty);
      if (e.dead) return;
      const left = e.facing < 0, mx = X + 12, my = ty - 3; // roof turret
      g.fillStyle = '#10121e'; g.fillRect(mx - 1, my - 1, 12, 7); g.fillStyle = '#3a3f4a'; g.fillRect(mx, my, 10, 5); g.fillStyle = '#8b909c'; g.fillRect(mx + 1, my + 1, 8, 1);
      g.fillStyle = '#10121e'; g.fillRect(left ? mx - 9 : mx + 10, my + 1, 10, 3); g.fillStyle = '#5c6370'; g.fillRect(left ? mx - 8 : mx + 10, my + 2, 9, 1);
      if (e.state === 'aim' && (G.frame >> 2) % 2){ g.fillStyle = '#ff2a3a'; g.fillRect(mx + 4, my - 3, 2, 2); }
      if (e.state === 'fire' && e.t % 8 < 3){ g.fillStyle = '#FFD400'; g.fillRect(left ? mx - 12 : mx + 19, my + 1, 3, 3); }
      return;
    }
    if (e.type === 'truck'){
      const tk = S.toon.truck[e.color || 'red'];
      if (e.dead === 'squash') img = tk.flat;
      else { const set = (e.state === 'rev' || e.state === 'charge') ? (e.facing < 0 ? tk.aL : tk.aR) : (e.facing < 0 ? tk.L : tk.R); img = set[(e.anim >> (e.state === 'charge' ? 1 : 3)) & 1]; }
      const sh = e.state === 'rev' ? ((G.frame >> 1) % 2 ? 1 : -1) : 0;
      if (e.dead === 'flip'){ g.save(); g.translate(X + 18, Math.round(e.y + 10)); g.scale(1, -1); g.drawImage(img, -16, -11); g.restore(); }
      else g.drawImage(img, X - 1 + sh, Math.round(e.y + e.h - 22));
      if (e.state === 'stun'){ for (let i = 0; i < 3; i++){ const a = G.frame * 0.15 + i * 2.1; g.fillStyle = '#FFD400'; g.fillRect(X + 16 + Math.cos(a) * 9, e.y - 4 + Math.sin(a) * 2, 2, 2); } }
      return;
    }
    if (e.type === 'skel'){
      if (e.state === 'bones' && !e.dead){ const sh = e.t < 50 ? ((G.frame >> 1) % 2 ? 1 : -1) : 0; g.drawImage(S.toon.bones, X + sh, Math.round(e.y + e.h - 9)); return; }
      img = (e.facing < 0 ? S.toon.skel.L : S.toon.skel.R)[(e.anim >> 3) & 1];
      if (e.dead === 'flip'){ g.save(); g.translate(X + 8, Math.round(e.y + 9)); g.scale(1, -1); g.drawImage(img, -8, -9); g.restore(); }
      else g.drawImage(img, X, Math.round(e.y + e.h - 19));
      return;
    }
    if (e.type === 'rlaunch'){
      const cx = Math.round(e.x + 8 - camX), cy = Math.round(e.y + 4);
      for (let i = 0; i < 11; i++){ const bx = Math.round(cx + Math.cos(e.aim) * i), by = Math.round(cy + Math.sin(e.aim) * i); g.fillStyle = '#1b2a4a'; g.fillRect(bx - 2, by - 2, 5, 5); }
      for (let i = 0; i < 11; i++){ const bx = Math.round(cx + Math.cos(e.aim) * i), by = Math.round(cy + Math.sin(e.aim) * i); g.fillStyle = i > 8 ? '#e8402a' : '#b8c6d8'; g.fillRect(bx - 1, by - 1, 3, 3); }
      if (e.dead === 'flip'){ g.save(); g.translate(X + 10, Math.round(e.y + 9)); g.scale(1, -1); g.drawImage(S.toon.launcherBase, -9, -9); g.restore(); }
      else g.drawImage(S.toon.launcherBase, X + 1, Math.round(e.y + e.h - 18));
      if (e.cool < 30 && (G.frame >> 2) % 2){ g.fillStyle = '#ff2a3a'; g.fillRect(X + 15, Math.round(e.y + 4), 2, 2); }
      return;
    }
    if (e.type === 'crumb' && TSET.toon){
      if (e.dead === 'squash') img = S.toon.crumbSq; else if (e.dead === 'flip') img = S.toon.crumbFlip; else img = S.toon.crumb[(e.anim >> 3) & 1];
      g.drawImage(img, X - 1, Yb - 1); return;
    }
    if (e.type === 'crumb'){
      if (e.dead === 'squash') img = S.crumbSq; else if (e.dead === 'flip') img = S.crumbFlip; else img = S.crumb[(e.anim >> 3) & 1];
      g.drawImage(img, X, Yb);
    } else if (e.type === 'toast'){
      if (e.dead === 'squash'){ g.drawImage(S.crumbSq, X, Yb); return; }
      if (e.dead === 'flip') img = S.toastFlip;
      else if (e.state === 'wind') img = S.toast['wind' + L];
      else if (e.state === 'charge') img = S.toast['charge' + L][(e.anim >> 2) & 1];
      else img = S.toast['walk' + L][(e.anim >> 3) & 1];
      const shake = e.state === 'wind' ? ((G.frame >> 1) % 2 ? 1 : -1) : 0;
      g.drawImage(img, X + shake, Yb);
      if (e.state === 'daze'){ for (let i = 0; i < 3; i++){ const a = G.frame * 0.15 + i * 2.1; g.fillStyle = '#FFD400'; g.fillRect(X + 7 + Math.cos(a) * 7, e.y - 4 + Math.sin(a) * 2, 2, 2); } }
    } else if (e.type === 'antenna'){
      if (e.dead === 'flip') img = S.antennaFlip;
      else img = (P && P.x < e.x ? S.antenna_L : S.antenna)[e.state === 'aim' ? ((G.frame >> 1) & 1) : 0];
      g.drawImage(img, X, Yb);
      if (e.state === 'aim'){ g.fillStyle = (G.frame >> 1) % 2 ? '#ff0040' : '#ffffff'; g.fillRect(X + 7, Yb - 3, 2, 2); }
    } else if (e.type === 'bomber'){
      if (e.dead === 'flip') img = S.bomberFlip; else if (e.state === 'dive') img = S.bomberDive; else img = S.bomber[(G.frame >> 2) & 1];
      g.drawImage(img, X, Math.round(e.y + e.h - img.height));
    } else if (e.type === 'mimic'){
      img = e.dead === 'flip' ? S.mimicFlip : S.mimic[e.onGround ? ((G.frame >> 3) & 1) : 1];
      g.drawImage(img, X, Yb);
    }
  }
}
function drawItems(emerging){
  for (const it of items){
    if (!!it.emerge !== emerging) continue;
    const X = Math.round(it.x - 1 - camX), Y = Math.round(it.y);
    let img = S.armor;
    if (it.type === 'launcher') img = S.launcher[(G.frame >> 3) & 1];
    else if (it.type === 'glitch') img = S.glitch[(G.frame >> 2) % 4];
    else if (it.type === 'card') img = S.card;
    else if (it.type === 'jam' && S.diner) img = S.diner.jam;
    else if (it.type === 'bell' && S.diner) img = S.diner.bell;
    else if (it.type === 'mitt' && S.bumbo) img = S.bumbo.mitt;
    else if (it.type === 'sauce' && S.crypt) img = S.crypt.sauce;
    else if (it.type === 'streak' && S.arcade) img = S.arcade.streak[(G.frame >> 3) & 1];
    else if (it.type === 'tray' && S.pit) img = S.pit.tray[(G.frame >> 3) & 1];
    else if (it.type === 'lightbar'){ img = S.toon.lightbar[(G.frame >> 3) & 1]; g.drawImage(img, X - 1, Y + 4); continue; }
    g.drawImage(img, X, Y);
  }
}
function drawFx(){
  for (const r of rockets){
    const X = Math.round(r.x - camX), Y = Math.round(r.y);
    g.save(); g.translate(X + 4, Y + 4); g.rotate(Math.floor(r.t / 3) * Math.PI / 2 * Math.sign(r.vx)); g.drawImage(S.rocket, -4, -4); g.restore();
  }
  for (const q of parts){
    const X = Math.round(q.x - camX), Y = Math.round(q.y);
    if (q.edge){ g.fillStyle = q.edge; g.fillRect(X - 1, Y - 1, q.size + 2, q.size + 2); }
    g.fillStyle = q.color; g.fillRect(X, Y, q.size, q.size);
  }
  for (const c of coinpops){ const f = (c.t >> 2) % 4, ww = [8, 6, 2, 6][f]; g.drawImage(S.coin, Math.round(c.x - camX + 4 - ww / 2), Math.round(c.y), ww, 10); }
  for (const q of pops){
    const y = q.long ? Math.max(q.y - Math.min(q.t, 60) * 1.2, 30) : q.y - q.t * 0.6;
    const col = (q.text === 'NO SIGNAL' || q.text === 'CHOMP!') ? ((q.t >> 1) % 2 ? '#00e5ff' : '#ff0040') : q.color;
    const X = Math.max(2, Math.min(W - textWidth(q.text) - 2, Math.round(q.x - camX))); // always fully on screen
    drawText(g, q.text, X, Math.max(26, Math.min(H - 10, Math.round(y))), col, 1, '#000');
  }
}
// ---------------- v0.4 bro drawing ----------------
function broFrame(id, k, left){ const set = S.bro[id] || S.bro.toasty; return set[k + (left ? '_L' : '')] || set[k] || set.stand; }
function drawCrack(X, Y, stage){
  g.fillStyle = 'rgba(10,8,16,0.85)';
  const pts = stage >= 2 ? [[3, 2], [4, 3], [5, 4], [6, 4], [7, 5], [7, 6], [8, 7], [10, 7], [11, 8], [12, 10], [9, 9], [8, 10], [7, 11], [6, 12], [4, 11], [3, 13], [12, 3], [11, 4], [13, 12]] : [[5, 4], [6, 5], [7, 6], [8, 7], [9, 7], [10, 8], [7, 8], [6, 9]];
  for (const [a, b] of pts) g.fillRect(X + a, Y + b, 1, 1);
}
function drawBroTiles(){
  const x0 = Math.max(0, Math.floor(camX / TS)), x1 = Math.min(lv.w - 1, x0 + 17);
  for (let ty = 0; ty < lv.h; ty++) for (let tx = x0; tx <= x1; tx++){
    const c = lv.t[ty][tx], X = Math.round(tx * TS - camX), Y = ty * TS;
    if (c === 'C'){
      const id = (lv.cageBro && lv.cageBro[tx + ',' + ty]) || 'toasty';
      g.fillStyle = '#0b0d16'; g.fillRect(X + 1, Y + 1, 14, 14);
      const fr = broFrame(id, (G.frame + tx * 7) % 90 < 10 ? 'jump' : 'stand', tx % 2);
      g.save(); g.beginPath(); g.rect(X + 1, Y + 1, 14, 14); g.clip(); g.drawImage(fr, X, Y + 1 + ((G.frame >> 4) + tx) % 2); g.restore();
      g.drawImage(S.bro.cage, X, Y);
      if ((G.frame >> 3) % 4 === 0){ g.fillStyle = '#FFD400'; g.fillRect(X + 7, Y - 5, 2, 3); g.fillRect(X + 7, Y - 1, 2, 1); } // "help!" blink
    } else if (c === 'T') g.drawImage(S.bro.tank, X, Y);
    else if (c === 'F') g.drawImage(S.bro.gas, X, Y);
    else if (c === 'G' && ty === 14){ g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(X, Y, 16, 16); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(X + ((tx * 5) & 7), Y + 3, 4, 1); g.fillRect(X + ((tx * 3 + 4) & 7) + 4, Y + 10, 3, 1); }
    const d = lv.dmg && lv.dmg[tx + ',' + ty];
    if (d && c !== '.'){ const hp = TILE_HP[c] || 2; drawCrack(X, Y, d / hp >= 0.6 ? 2 : 1); }
  }
  if (lv.exitTx){ const X = Math.round(lv.exitTx * TS - camX), Y = surfaceRow(lv.exitTx) * TS - 32;
    if (X > -20 && X < W + 4){ g.fillStyle = '#10121e'; g.fillRect(X - 2, Y - 2, 20, 34); g.fillStyle = '#0a3a1a'; g.fillRect(X, Y, 16, 32); g.fillStyle = (G.frame >> 3) % 2 ? '#00ff66' : '#9affc0'; g.fillRect(X + 2, Y + 2, 12, 2); g.fillRect(X + 11, Y + 16, 2, 3); g.fillStyle = '#145a2a'; g.fillRect(X + 2, Y + 6, 12, 24); } }
}
function drawWeapon(p, X, Y){
  const B = BROS[p.bro], f = p.facing, hx = f > 0 ? X + 11 : X + 4, hy = Y + 9;
  const R = (dx, dy, w, h, col) => { g.fillStyle = col; g.fillRect(f > 0 ? hx + dx : hx - dx - w, hy + dy, w, h); };
  switch (B.weapon.kind){
    case 'rocket': R(-1, -2, 9, 4, '#10121e'); R(0, -1, 7, 2, '#c8741e'); R(6, -1, 2, 2, '#f4c860'); break;
    case 'snack': R(-1, -1, 7, 4, '#10121e'); R(0, 0, 5, 2, '#ff5ab4'); R(5, -1, 2, 3, '#ffd23a'); break;
    case 'shotgun': R(-1, -1, 11, 4, '#10121e'); R(0, 0, 9, 1, '#ffe680'); R(0, 1, 4, 1, '#7a4a1e'); break;
    case 'sniper': R(-2, -1, 14, 3, '#10121e'); R(-1, 0, 12, 1, '#c9a400'); R(3, -2, 3, 1, '#10121e'); break;
    case 'iou': R(0, -2, 6, 5, '#10121e'); R(1, -1, 4, 3, '#f0ead8'); break;
    case 'zap': R(-1, -1, 7, 3, '#10121e'); R(0, 0, 5, 1, '#00e5ff'); break;
    default: break;
  }
  if (p.throwT > 5 && B.weapon.kind !== 'iou' && B.weapon.kind !== 'roll' && B.weapon.kind !== 'shriek'){ R(B.weapon.kind === 'sniper' ? 12 : 9, -2, 3, 4, '#ffffff'); R(B.weapon.kind === 'sniper' ? 15 : 12, -1, 2, 2, '#FFD400'); }
  if (B.weapon.kind === 'shriek' && p.throwT > 0){ g.fillStyle = '#ff5ab4'; g.fillRect(f > 0 ? X + 13 : X, Y + 5, 3, 1); }
}
function drawBroExtras(p, X, Y, img){
  if (p.dead) return;
  if (p.size > 0){ // Toast Armor: silver plate + pauldron (extra hit, no size change)
    g.globalAlpha = 0.9; g.fillStyle = '#10121e'; g.fillRect(X + 3, Y + 7, 10, 5);
    g.fillStyle = (G.frame >> 3) % 8 === 0 ? '#ffffff' : '#d7dbe3'; g.fillRect(X + 4, Y + 8, 8, 3); g.fillStyle = '#8b909c'; g.fillRect(X + 4, Y + 10, 8, 1);
    g.fillStyle = '#FFD400'; g.fillRect(X + 7, Y + 8, 2, 2); g.globalAlpha = 1;
  }
  if (p.armorFx > 0){ p.armorFx--; if ((p.armorFx >> 2) % 2) g.drawImage(tinted(img, '#ffffff'), X, Y); }
  if (p.jet > 0){ g.fillStyle = '#10121e'; g.fillRect(p.facing > 0 ? X : X + 12, Y + 6, 5, 7); g.fillStyle = '#c9a400'; g.fillRect(p.facing > 0 ? X + 1 : X + 13, Y + 7, 3, 5); }
  if (p.mirror > 0){ const mx = p.facing > 0 ? X + 15 : X - 3; g.fillStyle = '#10121e'; g.fillRect(mx - 1, Y - 2, 5, 19); g.fillStyle = (G.frame >> 2) % 2 ? '#ffffff' : '#cfe6ee'; g.fillRect(mx, Y - 1, 3, 17); g.fillStyle = '#9aa4b4'; g.fillRect(mx + 1, Y + 2, 1, 11); }
  if (p.melT > 0){ const B = BROS[p.bro], k = 10 - p.melT, f = p.facing, ax = f > 0 ? X + 14 : X - 10;
    g.fillStyle = B.melee.kind === 'bite' ? '#ff2fb4' : '#ffffff';
    for (let i = 0; i < 4; i++){ const a = -1.2 + (k * 0.25) + i * 0.35; g.fillRect(Math.round(ax + 6 + Math.cos(a) * 7 * f), Math.round(Y + 8 + Math.sin(a) * 8), 2, 2); }
    if (B.melee.kind === 'wrench'){ g.fillStyle = '#10121e'; g.fillRect(ax + (f > 0 ? 0 : 4), Y + 6, 8, 3); g.fillStyle = '#b9b9c2'; g.fillRect(ax + (f > 0 ? 1 : 5), Y + 7, 6, 1); }
    if (B.melee.kind === 'bite' && k < 5){ g.fillStyle = '#ffffff'; for (let i = 0; i < 3; i++){ g.fillRect(ax + 2 + i * 3, Y + 5, 2, 2); g.fillRect(ax + 2 + i * 3, Y + 12, 2, 2); } }
  }
  if (p.dash > 0){ g.globalAlpha = 0.4; g.drawImage(img, X - p.facing * 6, Y); g.drawImage(img, X - p.facing * 12, Y); g.globalAlpha = 1; }
}
function drawShots(){
  for (const t of turrets){
    const X = Math.round(t.x - camX), Y = Math.round(t.y);
    g.drawImage(t.face < 0 ? S.bro.turretL || (S.bro.turretL = flipH(S.bro.turret)) : S.bro.turret, X, Y);
    if (t.t < 120 && (G.frame >> 2) % 2){ g.fillStyle = '#ff2a3a'; g.fillRect(X + 7, Y, 2, 1); }
  }
  for (const s of shots){
    const X = Math.round(s.x - camX), Y = Math.round(s.y);
    switch (s.kind){
      case 'rocket': g.fillStyle = '#10121e'; g.fillRect(X - 1, Y - 1, 9, 6); g.fillStyle = '#f4c860'; g.fillRect(X, Y, 7, 4); g.fillStyle = '#c8741e'; g.fillRect(s.vx > 0 ? X : X + 4, Y, 3, 4); g.fillStyle = '#ff6a00'; g.fillRect(s.vx > 0 ? X - 3 : X + 7, Y + 1, 3, 2); break;
      case 'snack': g.fillStyle = '#10121e'; g.fillRect(X - 1, Y - 1, 5, 5); g.fillStyle = s.col; g.fillRect(X, Y, 3, 3); break;
      case 'pellet': g.fillStyle = '#ffe680'; g.fillRect(X, Y, 3, 2); g.fillStyle = '#ffffff'; g.fillRect(X + 1, Y, 1, 1); break;
      case 'snipe': g.fillStyle = '#ffffff'; g.fillRect(X, Y, 8, 2); g.fillStyle = 'rgba(255,212,0,0.5)'; g.fillRect(s.vx > 0 ? X - 14 : X + 8, Y, 14, 1); break;
      case 'iou': g.fillStyle = '#10121e'; g.fillRect(X - 1, Y - 1, 8, 6); g.fillStyle = '#f0ead8'; g.fillRect(X, Y, 6, 4); g.fillStyle = '#2e8b3a'; g.fillRect(X + 1, Y + 1, 4, 1); g.fillRect(X + 1, Y + 3, 2, 1); break;
      case 'wave': { g.globalAlpha = 0.75; const n = 3; for (let i = 0; i < n; i++){ g.fillStyle = i % 2 ? '#ff5ab4' : '#ffffff'; const xx = s.vx > 0 ? X + i * 3 : X + s.w - i * 3 - 2; g.fillRect(xx, Y + i * 2, 2, Math.max(2, Math.round(s.h) - i * 4)); } g.globalAlpha = 1; break; }
      case 'zap': g.fillStyle = '#00e5ff'; g.fillRect(X, Y, 6, 2); g.fillStyle = '#ffffff'; g.fillRect(X + 2, Y, 2, 2); break;
      case 'crumb': g.fillStyle = '#10121e'; g.fillRect(X - 1, Y - 1, 5, 5); g.fillStyle = (s.t >> 1) % 2 ? '#f4c860' : '#c8741e'; g.fillRect(X, Y, 3, 3); break;
      case 'bomb': { g.fillStyle = '#10121e'; g.fillRect(X - 1, Y - 1, 10, 10); g.fillStyle = '#f0ead8'; g.fillRect(X, Y, 8, 8); g.fillStyle = '#10121e'; g.fillRect(X + 2, Y + 2, 2, 2); g.fillRect(X + 5, Y + 2, 2, 2); g.fillRect(X + 3, Y + 5, 3, 1);
        g.fillStyle = s.life < 20 && (s.t >> 1) % 2 ? '#ff2a3a' : '#FFD400'; g.fillRect(X + 6, Y - 3, 2, 3); break; }
    }
  }
  for (const r of rings){
    const k = r.t / 14, rad = Math.round(r.r * (0.35 + k * 0.75)), X = Math.round(r.x - camX), Y = Math.round(r.y);
    g.globalAlpha = 1 - k; g.fillStyle = r.t < 3 ? '#ffffff' : '#FFD400';
    if (r.t < 3){ g.beginPath(); g.arc(X, Y, rad * 0.7, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = r.t < 6 ? '#fff3a0' : '#ff6a00'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y, rad, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
    g.globalAlpha = 1;
  }
  for (const b of bolts){
    if (b.kind !== 'bullet' && !b.mine) continue;
    const X = Math.round(b.x - camX), Y = Math.round(b.y);
    g.fillStyle = b.mine ? '#cfe6ee' : '#FFD400'; g.fillRect(X, Y, 5, 2); g.fillStyle = '#ffffff'; g.fillRect(b.vx > 0 ? X + 3 : X, Y, 2, 2);
    g.fillStyle = b.mine ? 'rgba(0,229,255,0.4)' : 'rgba(255,106,0,0.5)'; g.fillRect(b.vx > 0 ? X - 6 : X + 5, Y, 6, 1);
  }
}
function drawBroOverlays(){
  if (G.curseT > 0){ g.fillStyle = 'rgba(90,35,144,' + (G.curseT / 40 * 0.45).toFixed(2) + ')'; g.fillRect(0, 0, W, H); if (G.curseT > 20) drawTextC(g, 'IOU ALL OF YOU', 128, 96, '#f0ead8', 1, '#000'); }
  if (G.escape){
    const fx = Math.round(G.escape.front - camX);
    if (fx > -40){ const grd = g.createLinearGradient(Math.max(0, fx - 60), 0, fx + 10, 0); grd.addColorStop(0, 'rgba(255,106,0,0.45)'); grd.addColorStop(1, 'rgba(255,106,0,0)'); g.fillStyle = grd; g.fillRect(0, 0, Math.max(0, fx + 10), H); }
    if ((G.frame >> 3) % 2) drawTextC(g, 'RUN!  EXIT >>>', 128, 40, '#ff6a00', 1, '#000');
  }
  if (G.bigText){ const t = G.bigText.t, fit = Math.max(1, Math.floor(250 / (String(G.bigText.text).length * 6))), s = Math.min(fit, t < 8 ? 3 + (8 - t) * 0.4 : 3); if (t < 100 || (t >> 2) % 2) { const y = 72, sz = Math.round(s); g.fillStyle = 'rgba(6,4,10,0.72)'; g.fillRect(0, y - 6, W, sz * 7 + 12); g.fillStyle = 'rgba(255,212,0,0.5)'; g.fillRect(0, y - 6, W, 1); g.fillRect(0, y + sz * 7 + 5, W, 1); drawTextC(g, G.bigText.text, 128 + ((G.frame & 1) ? 1 : -1), y, '#ff6a00', Math.round(s), '#000'); drawTextC(g, G.bigText.text, 128, y, '#FFD400', Math.round(s)); } }
  if (G.broFlash && !broFlashHeld()){
    const f = G.broFlash, t = f.t;
    if (t < 6){ g.fillStyle = 'rgba(255,255,255,' + (0.6 - t * 0.1).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
    const y = 58, slide = Math.max(0, 40 - t * 6), L = broFlashLines(f), bh = 26 + L.length * 9;
    g.fillStyle = 'rgba(0,0,0,0.78)'; g.fillRect(0, y - 6, W, bh);
    g.fillStyle = '#FFD400'; g.fillRect(0, y - 6, W, 1); g.fillRect(0, y - 7 + bh, W, 1);
    const pr = S.bro[P.bro].portrait; g.drawImage(pr, 28 - slide, y + 6 + Math.max(0, (L.length - 2) * 4), 36, 26);
    logoAt('BRO FREED!', BF_CX + slide, y - 2, 2);
    L.forEach((ln, i) => drawTextC(g, ln.text, BF_CX, y + 17 + i * 9, ln.col, 1));
  }
}
// v0.9: the banner's text lines wrap to fit the box right of the portrait (x 72..250): 'NEW BRO UNLOCKED:' goes on its own line
// when the name is long, and a word that still doesn't fit is wrapped again
const BF_CX = 161, BF_MAXW = 2 * (BF_CX - 72);
function wrapFit(txt, maxW){
  if (textWidth(txt, 1) <= maxW) return [txt];
  const out = []; let cur = '';
  const cut = txt.indexOf(': '); const parts = cut > 0 ? [txt.slice(0, cut + 1), txt.slice(cut + 2)] : [txt];
  for (const part of parts){ cur = ''; for (const w of part.split(' ')){ const nx = cur ? cur + ' ' + w : w; if (textWidth(nx, 1) <= maxW || !cur) cur = nx; else { out.push(cur); cur = w; } } if (cur) out.push(cur); }
  return out;
}
function broFlashLines(f){
  const L = wrapFit('NOW PLAYING: ' + f.name, BF_MAXW).map(t => ({ text: t, col: '#ffffff' }));
  for (const t of wrapFit(f.isNew ? 'NEW BRO UNLOCKED: ' + f.isNew : '+1 BRO IN RESERVE', BF_MAXW)) L.push({ text: t, col: f.isNew ? '#00e5ff' : '#cbbcd9' });
  return L;
}
// a BRO FREED banner waits (queued, frozen at t=0) while boss dialog, a boss name card or a big title card is up, so it never covers one
function broFlashHeld(){ return !!(G.nameCard || G.bigText || G.dialog); }
function logoAt(txt, cx, y, s){ const x = Math.round(cx - textWidth(txt, s) / 2); drawText(g, txt, x + 2, y + 2, '#000', s); drawText(g, txt, x - 1, y, '#ff0040', s); drawText(g, txt, x + 1, y, '#00f0ff', s); drawText(g, txt, x, y, '#FFD400', s); }
function drawRoster(){
  g.fillStyle = '#05070d'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#0d1020'; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1);
  logo('BRO ROSTER', 12, 2);
  drawTextC(g, 'FREED ' + save.unlocked.length + ' OF ' + BRO_IDS.length + '  - BREAK CAGES TO FREE MORE', 128, 34, '#8b909c');
  BRO_IDS.forEach((id, i) => {
    const cx = 32 + (i % 4) * 64, cy = 50 + Math.floor(i / 4) * 64, sel = i === G.rsel, open = save.unlocked.includes(id), B = BROS[id];
    g.fillStyle = sel ? B.color : '#20263a'; g.fillRect(cx - 28, cy, 56, 58); g.fillStyle = '#0b0d16'; g.fillRect(cx - 26, cy + 2, 52, 54);
    if (open){
      const fr = broFrame(id, sel ? 'walk' + (1 + ((G.frame >> 3) % 3)) : 'stand');
      g.drawImage(fr, cx - 16, cy + 6, 32, 32);
      drawTextC(g, B.short, cx, cy + 42, sel ? '#FFD400' : '#ffffff');
      if (save.startBro === id) drawTextC(g, 'START', cx, cy + 50, '#00e5ff');
    } else {
      g.drawImage(tinted(broFrame(id, 'stand'), '#2a3046'), cx - 16, cy + 6, 32, 32);
      drawTextC(g, '???', cx, cy + 42, '#5c6370'); g.drawImage(S.bro.cage, cx - 8, cy + 14);
    }
  });
  const id = BRO_IDS[G.rsel], B = BROS[id], open = save.unlocked.includes(id);
  g.fillStyle = '#000'; g.fillRect(8, 182, 240, 50); g.strokeStyle = open ? B.color : '#5c6370'; g.strokeRect(8.5, 182.5, 239, 49);
  if (open){
    drawText(g, B.name, 14, 187, B.color);
    drawText(g, 'GUN: ' + B.weapon.label, 14, 198, '#ffffff');
    drawText(g, 'MELEE: ' + B.melee.label, 14, 208, '#ffffff');
    drawText(g, 'SPECIAL: ' + B.special.label + ' X3', 14, 218, '#FFD400');
    drawText(g, 'Z=SET START', 170, 187, '#5c6370');
  } else { drawTextC(g, 'LOCKED - STILL IN A CAGE SOMEWHERE', 128, 198, '#8b909c'); drawTextC(g, 'ENTER = BACK', 128, 214, '#5c6370'); }
}

function pad(n, l){ return String(Math.max(0, n | 0)).padStart(l, '0'); }
const HUD_NAME_W = 47; // name slot: x 24..71 (+1px shadow) ; SKULLZ label starts at x 76
function drawHUD(){
  const sh = '#000';
  const bro = (P && P.bro) || G.curBro || 'toasty', inPlay = (G.state === 'play' || G.state === 'dying') && P;
  g.drawImage(S.bro[bro].portrait, 4, 6);
  G.hudNameMode = drawFit(g, BROS[bro].short, 24, 6, HUD_NAME_W, BROS[bro].color, sh); // v0.6: fixed-width name slot (24..71), never reaches SKULLZ at 76
  drawText(g, pad(G.score, 6), 24, 15, '#ffffff', 1, sh);
  if (inPlay){ for (let i = 0; i < 3; i++){ const on = i < P.spec; g.fillStyle = '#000'; g.fillRect(4 + i * 6, 21, 5, 5); g.fillStyle = on ? BROS[bro].color : '#2a3046'; g.fillRect(5 + i * 6, 22, 3, 3); }
    if (P.size > 0){ g.fillStyle = '#000'; g.fillRect(23, 23, 7, 7); g.fillStyle = '#d7dbe3'; g.fillRect(24, 24, 5, 4); g.fillRect(25, 28, 3, 1); }
    drawHealth(4, 31);
    drawText(g, 'FREED ' + G.rescued, 32, 24, '#00e5ff', 1, sh); }
  drawText(g, 'SKULLZ', 76, 6, '#FFD400', 1, sh);
  g.drawImage(S.coin, 76, 14); drawText(g, 'X' + pad(G.coins, 2), 87, 15, '#ffffff', 1, sh);
  drawText(g, 'WORLD', 126, 6, '#FFD400', 1, sh); drawText(g, G.state === 'title' ? '' : (G.state === 'clear' ? G.clearedId : G.levelId) || '', 132, 15, '#ffffff', 1, sh);
  drawText(g, 'BROS', 172, 6, '#FFD400', 1, sh); drawText(g, 'X' + Math.max(0, G.lives), 176, 15, '#ffffff', 1, sh);
  drawText(g, 'TIME', 218, 6, '#FFD400', 1, sh);
  const tcol = G.state === 'play' && G.time <= 100 && (G.frame >> 4) % 2 ? '#ff0040' : '#ffffff';
  drawText(g, G.state === 'title' ? '' : pad(G.time, 3), 221, 15, tcol, 1, sh);
}
// v0.8.1 health: 3 little toast-red hearts under the special pips (x 4..26, y 31..37; clear of the name slot, FREED and the armor icon)
function drawHealth(x0, y0){
  const hp = P.dead ? 0 : (P.hp === undefined ? MAX_HP : P.hp), blink = P.hpFx > 0 && (P.hpFx >> 2) % 2;
  for (let i = 0; i < MAX_HP; i++){
    const x = x0 + i * 8, on = i < hp, lost = i === hp && blink;
    g.fillStyle = '#000'; g.fillRect(x, y0, 7, 7);
    g.fillStyle = lost ? '#ffffff' : on ? '#ff2045' : '#2a3046';
    g.fillRect(x + 1, y0 + 1, 2, 2); g.fillRect(x + 4, y0 + 1, 2, 2); g.fillRect(x + 1, y0 + 2, 5, 2); g.fillRect(x + 2, y0 + 4, 3, 1); g.fillRect(x + 3, y0 + 5, 1, 1);
    if (on && !lost){ g.fillStyle = '#ffb0bc'; g.fillRect(x + 1, y0 + 1, 1, 1); }
  }
}
function drawDialog(){
  const d = G.dialog; if (!d) return;
  const n = Math.min(40, Math.floor(d.t / 2));
  g.fillStyle = '#000'; g.fillRect(16, 150, 224, 48); g.strokeStyle = '#FFD400'; g.lineWidth = 1; g.strokeRect(16.5, 150.5, 223, 47);
  g.drawImage(broFrame(P ? P.bro : 'toasty', 'stand'), 24, 160);
  drawText(g, (P ? BROS[P.bro].name : 'MR. TOASTY') + ':', 46, 158, '#FFD400');
  const l1 = (BOSS && BOSS.spec.line1) || 'I AM THE INSIDER THREAT', l2 = (BOSS && BOSS.spec.line2) || 'TO THE GLITCH!!!';
  drawText(g, l1.slice(0, n), 46, 172, '#ffffff');
  if (n > l1.length) drawText(g, l2.slice(0, n - l1.length), 46, 184, (G.frame >> 2) % 2 ? '#ff00c8' : '#00e5ff');
}
function drawWorld(){
  const sx = G.shake > 0 ? ((G.frame & 1) ? 2 : -2) : 0;
  const cx = camX; camX = cx - sx;
  drawBG();
  drawSigns();
  drawDecor();
  drawItems(true);
  drawTiles();
  drawPlats();
  drawPoleAndBooth();
  drawHazards(); drawPitHazards(); drawDinerHazards(); drawBumboHazards(); drawCryptHazards(); drawArcadeHazards();
  drawItems(false);
  drawEnemies();
  drawBoss();
  if (P) drawPlayer();
  drawPipes();
  drawShots();
  drawFx();
  if (lv.theme === 'factory' || lv.theme === 'tower'){ // darker lighting
    const grd = g.createRadialGradient(P.x - camX + 6, P.y + 8, 30, P.x - camX + 6, P.y + 8, 190);
    grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, lv.theme === 'tower' ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.35)');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
  }
  pitPostFx(); dinerPostFx(); bumboPostFxAll(); cryptPostFxAll(); arcadePostFxAll();
  camX = cx;
  if (G.flash > 0){ g.fillStyle = 'rgba(255,255,255,' + (G.flash / 14).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
  drawBroOverlays();
  drawDialog();
}
let staticC = null, staticX = null, staticImg = null;
function staticFill(alpha, y0, y1){ // v0.8: TV snow drawn over the frame with alpha (no getImageData readback of the main buffer)
  if (!staticC){ staticC = mkCanvas(W, H); staticX = staticC.getContext('2d'); staticImg = staticX.createImageData(W, H); }
  const d = staticImg.data;
  for (let i = 0; i < d.length; i += 4){
    const v = Math.random() * 255 | 0, c = Math.random();
    d[i] = c < 0.02 ? 255 : v; d[i + 1] = c > 0.98 ? 240 : v; d[i + 2] = c > 0.96 && c <= 0.98 ? 255 : v; d[i + 3] = 255;
  }
  staticX.putImageData(staticImg, 0, 0);
  const ya = y0 || 0, yb = y1 || H;
  g.save(); g.globalAlpha = Math.max(0, Math.min(1, alpha)); g.drawImage(staticC, 0, ya, W, yb - ya, 0, ya, W, yb - ya); g.restore();
}
function glitchBands(n, amp){
  for (let i = 0; i < n; i++){
    const y = (Math.random() * H) | 0, h = 2 + ((Math.random() * 8) | 0), dx = ((Math.random() - 0.5) * amp) | 0;
    g.drawImage(buf, 0, y, W, h, dx, y, W, h);
  }
}
function logo(txt, y, s){
  const x = Math.round(W / 2 - textWidth(txt, s) / 2);
  drawText(g, txt, x + 2, y + 2, '#000', s); drawText(g, txt, x - 1, y, '#ff0040', s); drawText(g, txt, x + 1, y, '#00f0ff', s); drawText(g, txt, x, y, '#FFD400', s);
}
let titleArea = null;
function drawTitle(){
  if (!titleArea){ titleArea = LEVELS['1-1'].build().main; }
  const sl = lv, sc = camX, st = TSET; lv = titleArea; TSET = S.tiles; camX = (G.frame * 0.25) % (60 * TS);
  drawBG(); drawTiles(); drawPipes(); lv = sl; camX = sc; TSET = st;
  g.fillStyle = 'rgba(5,7,13,0.62)'; g.fillRect(0, 0, W, H);
  const t = G.frame;
  logo('MR. TOASTY:', 36, 2); logo('TOASTY BROS', 56, 3);
  drawTextC(g, 'NOW ON AIR: WORLDS 1-6  - BRO EDITION', 128, 86, '#cbbcd9', 1, '#000');
  BRO_IDS.forEach((id, i) => { const open = save.unlocked.includes(id), x = 24 + i * 26, hop = open && ((t >> 3) + i) % 16 === 0 ? -3 : 0;
    const fr = broFrame(id, open ? ((t >> 4) + i) % 2 ? 'stand' : 'walk2' : 'stand'); g.drawImage(open ? fr : tinted(fr, '#2a3046'), x, 100 + hop);
    if (!open) drawText(g, '?', x + 6, 104, '#5c6370'); });
  const m = titleMenu();
  m.forEach((it, i) => {
    const y = 124 + i * 11, sel = i === G.menu;
    drawTextC(g, it.label, 128, y, sel ? '#FFD400' : '#8b909c', 1, '#000');
    if (sel && (t >> 4) % 2 === 0) drawText(g, '>', 128 - textWidth(it.label) / 2 - 10, y, '#FFD400');
  });
  drawTextC(g, 'HI ' + pad(save.hi, 6), 128, 176, '#ffffff', 1, '#000');
  const tch = typeof TouchInput !== 'undefined' && TouchInput.active;
  drawTextC(g, tch ? 'D-PAD MOVE  A JUMP  B RUN+FIRE (HOLD)' : 'ARROWS MOVE  Z JUMP  X RUN+FIRE (HOLD)', 128, 190, '#8b909c');
  drawTextC(g, tch ? 'S SPECIAL  M MELEE  START PAUSE' : 'C SPECIAL  V MELEE  ENTER START', 128, 200, '#8b909c');
  drawTextC(g, 'PRESS INTO A WALL TO SLIDE, JUMP TO KICK', 128, 210, '#5c6370');
  drawTextC(g, 'AN ORIGINAL COTY LAKE GAME  2026', 128, 224, '#5c6370');
  if (t % 180 < 6) glitchBands(4, 12);
}
function drawSelect(){
  g.fillStyle = '#05070d'; g.fillRect(0, 0, W, H);
  drawTextC(g, 'LEVEL SELECT (DEBUG)', 128, 10, '#FFD400', 1);
  const all = selectEntries(); let k = 0, y = 22;
  for (const e of all){
    const col = e.ok ? (k === G.sel ? '#FFD400' : '#ffffff') : '#5c6370';
    if (e.ok && k === G.sel) drawText(g, '>', 6, y, '#FFD400');
    drawText(g, e.label.slice(0, 38), 14, y, col);
    if (e.ok) k++;
    y += 11;
  }
  drawText(g, 'START: ' + ['PLAIN', 'ARMOR', 'ARMOR'][G.selSize] + '  (X)', 20, 214, '#00e5ff');
  drawText(g, 'LEFT = BACK', 170, 214, '#8b909c');
}
function drawIntro(){
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const L = LEVELS[G.levelId];
  drawTextC(g, 'WORLD ' + G.levelId, 128, 72, '#ffffff', 2);
  drawTextC(g, L.name, 128, 96, '#00e5ff');
  drawTextC(g, WORLDS[L.world].name, 128, 108, '#5c6370');
  g.drawImage(broFrame(G.curBro || 'toasty', 'stand'), 100, 126);
  drawText(g, 'X ' + G.lives, 124, 131, '#ffffff', 1);
  drawTextC(g, BROS[G.curBro || 'toasty'].name, 128, 146, BROS[G.curBro || 'toasty'].color);
  if (G.reserve && G.reserve.length) { drawTextC(g, 'RESERVE', 128, 174, '#5c6370'); G.reserve.slice(0, 8).forEach((id, i) => g.drawImage(S.bro[id].portrait, 128 - Math.min(8, G.reserve.length) * 10 + i * 20, 184)); }
  if (G.checkpoint) drawTextC(g, 'CHECKPOINT', 128, 158, '#8b909c');
  if (G.stateT < 12) staticFill(1 - G.stateT / 12);
}
function drawTransition(){
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  staticFill(1);
  const roll = (G.stateT * 3) % (H + 40) - 20; g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, roll, W, 14);
  g.fillStyle = 'rgba(0,0,0,0.8)'; g.fillRect(28, 104, 200, 28);
  if ((G.stateT >> 3) % 4 !== 3) drawTextC(g, 'CHANGING CHANNEL...', 128, 114, '#FFD400', 1);
  glitchBands(5, 20);
}
function drawClear(){
  g.fillStyle = '#05070d'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#14110a'; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1);
  logo(G.clearedId + ' CLEAR', 56, 3);
  drawTextC(g, 'SIGNAL RESTORED', 128, 90, '#00e5ff');
  drawTextC(g, 'SCORE  ' + pad(G.score, 6), 128, 112, '#ffffff');
  drawTextC(g, 'SKULLZ X' + pad(G.coins, 2) + '   LIVES X' + G.lives, 128, 126, '#ffffff');
  drawTextC(g, 'POLE BONUS ' + (G.poleScore || 0), 128, 140, '#cbbcd9');
  g.drawImage(broFrame(G.curBro || 'toasty', 'jump'), 112, 150, 32, 32);
  drawTextC(g, 'NEXT: ' + G.levelId + ' ' + LEVELS[G.levelId].name, 128, 196, '#8b909c');
  if (G.stateT < 16) staticFill(1 - G.stateT / 16);
}
function drawWarpCard(){
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); staticFill(0.5);
  const Wd = WORLDS[G.warpTo];
  g.fillStyle = 'rgba(0,0,0,0.85)'; g.fillRect(16, 70, 224, 100);
  drawTextC(g, 'WARP ZONE', 128, 80, '#ff00c8', 2);
  drawTextC(g, 'CHANNEL ' + G.warpTo + ': ' + Wd.name, 128, 108, '#FFD400');
  if (Wd.built){ drawTextC(g, 'SIGNAL FOUND!', 128, 124, '#ffffff'); if ((G.stateT >> 3) % 4 !== 3) drawTextC(g, 'TUNING IN TO ' + G.warpTarget, 128, 150, '#00e5ff'); }
  else { drawTextC(g, 'COMING SOON', 128, 124, '#ffffff'); if ((G.stateT >> 3) % 4 !== 3) drawTextC(g, 'SIGNAL LOST - RETUNING TO ' + (G.warpTarget || latestWorldStart()), 128, 150, '#00e5ff'); }
  glitchBands(3, 16);
}
function drawWorldClear(){
  g.fillStyle = '#05070d'; g.fillRect(0, 0, W, H);
  const r = rng(77);
  for (let i = 0; i < 60; i++){ g.fillStyle = r() < 0.5 ? '#FFD400' : '#00e5ff'; g.fillRect((r() * W) | 0, ((r() * H + G.stateT * (0.5 + r())) % H) | 0, 1, 1); }
  const Wc = WORLDS[G.clearedWorld] || WORLDS[1], Wn = WORLDS[Wc.n + 1];
  logo('WORLD ' + Wc.n + ' CLEAR!', 34, 2);
  drawTextC(g, (Wc.clear || [])[0] || '', 128, 60, '#ff00c8');
  drawTextC(g, (Wc.clear || [])[1] || '', 128, 72, '#00e5ff');
  if (Wc.n === 2 && S.grand){ // the scrapped Grand Toaster (half size), smoking, next to a victorious Mr. Toasty
    g.drawImage(S.grand.down, 62, 89, 43, 29);
    for (let i = 0; i < 3; i++){ const k = (G.stateT + i * 20) % 60; g.fillStyle = k < 30 ? '#8b909c' : '#5c6370'; g.fillRect(80 + i * 6 + ((k >> 3) & 1), 86 - (k >> 2), 3, 3); }
    g.drawImage(broFrame(G.curBro || 'toasty', 'jump'), 124, 86, 32, 32);
  } else if (Wc.n === 3 && S.debtTableBurnt){ // the burnt ledger on the Breadlord's table, still smoking
    g.drawImage(S.debtTableBurnt, 50, 90);
    for (let i = 0; i < 3; i++){ const k = (G.stateT + i * 20) % 60; g.fillStyle = k < 30 ? '#8b909c' : '#5c6370'; g.fillRect(80 + i * 7 + ((k >> 3) & 1), 88 - (k >> 2), 3, 3); }
    drawText(g, 'PAID', 76, 104, '#ff0040', 1, '#000');
    g.drawImage(broFrame(G.curBro || 'toasty', 'jump'), 140, 86, 32, 32);
  } else if (Wc.n === 4 && S.diner){ // the rerun's CRT showing NO SIGNAL, and the real Cal back from his break with a coffee
    g.fillStyle = '#05070d'; g.fillRect(48, 86, 44, 34); g.fillStyle = '#5a6270'; g.fillRect(49, 87, 42, 32); drawCalFace(g, 60, 92, 'off', G.stateT, null);
    for (let i = 0; i < 3; i++){ const k = (G.stateT + i * 20) % 60; g.fillStyle = k < 30 ? '#8b909c' : '#5c6370'; g.fillRect(64 + i * 7 + ((k >> 3) & 1), 84 - (k >> 4), 2, 2); } // wisps stay below the caption
    g.drawImage(broFrame('cal', 'stand'), 104, 88, 32, 32); g.fillStyle = '#f2ecd6'; g.fillRect(134, 104, 6, 7); g.fillStyle = '#7a3e10'; g.fillRect(135, 105, 4, 2);
    g.drawImage(broFrame(G.curBro || 'toasty', 'jump'), 150, 86, 32, 32);
  } else if (Wc.n === 5 && S.bumbo){ // the Hive Skull takes a bow on its strings, a little static TV teases the next channel
    g.strokeStyle = '#f3ead4'; g.lineWidth = 1; g.beginPath(); g.moveTo(60, 78); g.lineTo(60, 92); g.moveTo(80, 78); g.lineTo(80, 92); g.stroke();
    g.save(); g.translate(70, 120); g.rotate(-0.35 + Math.sin(G.stateT * 0.05) * 0.05); g.drawImage(S.bumbo.hive.hurt, -16, -32, 32, 32); g.restore();
    g.drawImage(broFrame(G.curBro || 'toasty', 'jump'), 108, 86, 32, 32);
    g.fillStyle = BUM.I; g.fillRect(150, 84, 50, 36); g.fillStyle = BUM.K; g.fillRect(151, 85, 48, 34); g.fillStyle = BUM.ST; g.fillRect(155, 89, 32, 24); // a little cardboard TV: CHANNEL 6 coming in
    { const r = rng((G.stateT >> 1) * 7 + 3); for (let j = 0; j < 24; j += 2) for (let i = 0; i < 32; i += 2){ const v = r(); g.fillStyle = v < 0.5 ? '#2a2620' : v < 0.85 ? '#8a8270' : BUM.P; g.fillRect(155 + i, 89 + j, 2, 2); } }
    if ((G.stateT >> 4) % 2){ g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(155, 96, 32, 9); drawTiny(g, 'CH 6', 164, 98, BUM.Y); }
    g.fillStyle = BUM.I; g.fillRect(190, 92, 6, 6); g.fillRect(190, 102, 6, 6); g.fillStyle = BUM.E2; g.fillRect(191, 93, 4, 4); g.fillStyle = BUM.Y; g.fillRect(191, 103, 4, 4);
  } else if (Wc.n === 6 && S.crypt){ // the crownless Quartz King sulks on his slab; a little arcade cabinet blinks INSERT BRO for World 7
    g.fillStyle = CRY.I; g.fillRect(42, 116, 60, 6); g.fillStyle = CRY.ST2; g.fillRect(43, 117, 58, 4);
    g.save(); g.translate(72, 118); g.rotate(Math.sin(G.stateT * 0.04) * 0.04); g.drawImage(S.crypt.kingCrown[0].hurt, -16, -32, 32, 32); g.restore();
    for (let i = 0; i < 4; i++){ const k = (G.stateT + i * 15) % 60; g.fillStyle = i % 2 ? CRY.Q : CRY.Q2; g.fillRect(50 + i * 13, 112 + (k > 30 ? 0 : 0), 3, 3); } // the snapped crown points at his feet
    g.drawImage(broFrame(G.curBro || 'toasty', 'jump'), 108, 86, 32, 32);
    g.fillStyle = CRY.I; g.fillRect(154, 80, 40, 42); g.fillStyle = '#3a1a5a'; g.fillRect(155, 81, 38, 40); g.fillStyle = CRY.I; g.fillRect(159, 86, 30, 20); // a tiny arcade cabinet
    { const r = rng((G.stateT >> 2) * 5 + 9); g.fillStyle = '#05070d'; g.fillRect(160, 87, 28, 18); for (let i = 0; i < 6; i++){ g.fillStyle = r() < 0.5 ? CRY.Y : CRY.C; g.fillRect(162 + ((r() * 24) | 0), 89 + ((r() * 14) | 0), 2, 2); } }
    if ((G.stateT >> 4) % 2) drawTiny(g, 'CH 7', 166, 94, CRY.Y);
    g.fillStyle = CRY.M; g.fillRect(162, 110, 4, 4); g.fillStyle = CRY.C; g.fillRect(170, 110, 4, 4); g.fillStyle = CRY.Y; g.fillRect(180, 109, 2, 6); g.fillRect(178, 108, 6, 2);
  } else if (Wc.n === 7 && S.arcade){ // the switched-off Jackpot Vault shows GAME OVER on its CRT; a token shower; a lunchbox-shaped sign teases CH 8
    g.save(); g.translate(46, 76); g.scale(0.5, 0.5); g.filter = 'brightness(0.55)'; g.drawImage(S.arcade.vault, 0, 0); g.filter = 'none'; g.restore();
    g.fillStyle = '#05060a'; g.fillRect(51, 83, 22, 12); if ((G.stateT >> 4) % 2) drawTiny(g, 'GAME', 54, 84, ARC.M); drawTiny(g, 'OVER', 54, 90, ARC.C);
    for (let i = 0; i < 10; i++){ const k = (G.stateT * 1.5 + i * 23) % 70; g.drawImage(S.arcade.token, 40 + ((i * 37) % 170), 70 + k); }
    g.drawImage(broFrame(G.curBro || 'toasty', 'jump'), 108, 86, 32, 32);
    g.fillStyle = ARC.I; g.fillRect(154, 82, 44, 38); g.fillStyle = ARC.AM2; g.fillRect(155, 83, 42, 36); g.fillStyle = ARC.AM; g.fillRect(155, 83, 42, 6); g.fillStyle = ARC.I; g.fillRect(170, 79, 12, 4); // a lunchbox-shaped TV
    g.fillStyle = '#05070d'; g.fillRect(159, 92, 34, 22); { const r = rng((G.stateT >> 2) * 3 + 5); for (let i = 0; i < 8; i++){ g.fillStyle = r() < 0.5 ? ARC.Y : ARC.JAM; g.fillRect(161 + ((r() * 30) | 0), 94 + ((r() * 18) | 0), 2, 2); } }
    if ((G.stateT >> 4) % 2) drawTiny(g, 'CH 8', 168, 100, ARC.Y);
  } else g.drawImage(broFrame(G.curBro || 'toasty', 'jump'), 112, 86, 32, 32);
  drawTextC(g, 'SCORE  ' + pad(G.score, 6) + '   HI ' + pad(Math.max(save.hi, G.score), 6), 128, 124, '#ffffff');
  drawTextC(g, 'SKULLZ X' + pad(G.coins, 2) + '   LIVES X' + G.lives, 128, 136, '#ffffff');
  g.fillStyle = '#000'; g.fillRect(24, 154, 208, 44); g.strokeStyle = '#FFD400'; g.strokeRect(24.5, 154.5, 207, 43);
  drawTextC(g, Wc.tease || '', 128, 162, '#FFD400');
  drawTextC(g, Wn ? ('WORLD ' + Wn.n + (Wn.built ? ' - ' + Wn.name : ' - COMING SOON')) : 'THE END?', 128, 176, (G.stateT >> 4) % 2 ? '#ffffff' : '#8b909c');
  if (G.stateT > 120 && (G.stateT >> 5) % 2 === 0) drawTextC(g, G.nextWorldLevel ? 'PRESS START TO CHANGE CHANNEL' : 'PRESS START', 128, 212, '#ffffff');
  if (G.stateT < 20) staticFill(1 - G.stateT / 20);
}
function drawGameOver(){
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  staticFill(0.25);
  drawTextC(g, 'GAME OVER', 128, 100, '#ffffff', 2, '#ff0040');
  drawTextC(g, 'PLEASE STAND BY', 128, 128, '#8b909c');
  drawTextC(g, 'CONTINUE FROM ' + save.furthest + ' ON THE TITLE', 128, 146, '#5c6370');
}
function render(){
  switch (G.state){
    case 'title': drawTitle(); break;
    case 'select': drawSelect(); break;
    case 'roster': drawRoster(); break;
    case 'intro': drawIntro(); break;
    case 'play': case 'dying':
      drawWorld(); drawHUD();
      if (G.paused){ g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 0, W, H); drawTextC(g, 'PAUSED', 128, 112, '#FFD400', 2, '#000'); drawTextC(g, (typeof TouchInput !== 'undefined' && TouchInput.active) ? 'TAP START TO RESUME' : 'PRESS ENTER TO RESUME', 128, 134, '#ffffff', 1, '#000'); }
      if (G.fade > 0){ g.fillStyle = 'rgba(0,0,0,' + (G.fade / 14) + ')'; g.fillRect(0, 0, W, H); }
      if (P && P.star > 0 && G.frame % 40 < 2) glitchBands(3, 8);
      if (BOSS && BOSS.dying && G.frame % 6 < 2) glitchBands(3, 14);
      if (G.state === 'play' && !G.paused && G.frame % 600 > 594) glitchBands(2, 6);
      break;
    case 'transition': drawTransition(); break;
    case 'clear': drawClear(); break;
    case 'warpcard': drawWarpCard(); break;
    case 'worldclear': drawWorldClear(); break;
    case 'gameover': drawGameOver(); break;
  }
  if (G.state !== 'title' && G.state !== 'select' && G.state !== 'roster' && G.state !== 'play' && G.state !== 'dying' && G.state !== 'worldclear') drawHUD();
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(buf, 0, 0, screenC.width, screenC.height);
  if (scale >= 2){
    sctx.fillStyle = 'rgba(0,0,0,0.16)';
    const lh = Math.max(1, Math.floor(scale / 3));
    for (let y = 0; y < H; y++) sctx.fillRect(0, y * scale + scale - lh, W * scale, lh);
  }
}

// ---------------- autopilot (demo / tests: ?autoplay) ----------------
const bot = { lastJump: false, hold: 0, holdMax: 40, back: 0, stuck: 0, wait: 0 };
function platAt(px, py, slack){ // any platform whose top is near (px,py)
  for (const pl of plats){ if (pl.gone && !(pl.kind === 'card' && cardState(pl.card).solid)) continue; if (px >= pl.x - 2 && px <= pl.x + pl.w + 2 && Math.abs(pl.y - py) <= (slack || 6)) return pl; }
  return null;
}
function groundBelow(tx, fromRow){ for (let y = Math.max(0, fromRow); y < 15; y++){ const c = tileAt(tx, y); if (c === 'A') return -1; if (standable(tx, y)) return y; } return -1; }
function danger(x0, x1, y0, y1, ahead, at){ // will a firebar orb / beam cover this box within `ahead` frames (starting `at` frames from now)?
  const base = G.lf + (at || 0);
  for (const fb of lv.firebars){
    if (Math.abs(fb.tx * TS + 8 - (x0 + x1) / 2) > fb.len * 8 + 30) continue;
    for (let f = 0; f <= ahead; f += 3){
      const a = fb.phase + fb.speed * (base + f), cx = fb.tx * TS + 8, cy = fb.ty * TS + 8;
      for (let i = 0; i < fb.len; i++){ const ox = cx + Math.cos(a) * i * 8, oy = cy + Math.sin(a) * i * 8; if (ox > x0 - 6 && ox < x1 + 6 && oy > y0 - 6 && oy < y1 + 6) return true; }
    }
  }
  for (const bm of lv.beams){
    const bx = bm.tx * TS; if (bx + 12 < x0 || bx + 4 > x1) continue;
    if (y1 < bm.y0 * TS || y0 > (bm.y1 + 1) * TS) continue;
    for (let f = 0; f <= ahead; f += 3) if (beamState(bm, base + f) !== 'off') return true;
  }
  // v0.5 World 3: Fork in the Outlet sparks, hot coils, spike / bounce reels
  for (const fk of lv.forks || []){
    const lo = Math.min(fk.ax, fk.bx) * TS - 8, hi = (Math.max(fk.ax, fk.bx) + 1) * TS + 8; if (hi < x0 || lo > x1) continue;
    for (let f = 0; f <= ahead; f += 3){ const sp = forkSpark(fk, base + f); if (!sp.rest && sp.x > x0 - 7 && sp.x < x1 + 7 && sp.y > y0 - 7 && sp.y < y1 + 7) return true; }
  }
  for (const run of lv.coils || []){
    const top = run.row * TS; if (y1 < top - 1 || y0 > top + 2 || (run.b + 1) * TS < x0 || run.a * TS > x1) continue;
    for (let f = -8; f <= ahead + 10; f += 3) if (coilState(run, base + f) !== 'off') return true;
  }
  for (const pl of plats){
    if (pl.kind !== 'reel' || pl.x + pl.w < x0 || pl.x > x1 || y1 < pl.y - 1 || y0 > pl.y + 3) continue;
    for (let f = 0; f <= ahead + 6; f += 3){ const st = reelState(pl.reel, base + f); if (!st.spin && st.face !== 'safe') return true; }
  }
  return false;
}
function pitDangerOn(){ return (lv.forks && lv.forks.length) || (lv.coils && lv.coils.length) || plats.some(p => p.kind === 'reel'); }
function botToaster(b, grounded, feet){
  const p = P, B = BOSS, px = p.x + p.w / 2, lx = toasterLeverX(B);
  b.right = false; b.left = false; b.run = true;
  if (B.dead || B.dying){ b.run = false; botJump(b, false); return; }
  const onTop = p.plat === B.top;
  const left = px < B.x + B.w / 2;
  const gap = left ? B.x - (p.x + p.w) : p.x - (B.x + B.w);
  const steer = (tx, dead) => { if (px < tx - (dead || 2)) b.right = true; else if (px > tx + (dead || 2)) b.left = true; };
  const ax0 = B.spec.bounds[0] * TS, ax1 = (B.spec.bounds[1] + 1) * TS;
  let want = false, hold = 40;
  if (onTop){
    steer(lx, 3);
    if (B.flash <= 6 && B.state !== 'hurt' && Math.abs(px - lx) < 8){ want = true; hold = 4; }
  } else if (grounded){
    const coming = B.state === 'ram' && ((B.vx < 0 && left) || (B.vx > 0 && !left));
    const landing = ftoasts.filter(f => !f.landed).map(f => { let x = f.x + 5, y = f.y, vy = f.vy; while (y + f.h < B.deck){ vy = Math.min(vy + 0.16, 4); y += vy; x += f.vx; } return x; });
    const threat = landing.find(x => Math.abs(x - px) < 18);
    const fl = ftoasts.find(f => f.landed && Math.abs(f.x + 5 - px) < 20);
    const awayDir = left ? -1 : 1, roomBehind = left ? p.x - ax0 : ax1 - (p.x + p.w);
    const rk = bolts.find(o => o.homing && !o.reflected && Math.abs(o.x + o.w / 2 - px) < 40 && o.y > p.y - 20);
    const toastUp = ftoasts.some(f => !f.landed);
    if (rk && !coming && !toastUp){ want = Math.abs(rk.x + rk.w / 2 - px) < 26; hold = 40; }
    else if (rk && !coming){ const d = rk.x + rk.w / 2 >= px ? -1 : 1; d < 0 ? (b.left = true) : (b.right = true); b.run = true; }
    else if (coming){ if (gap < 54) want = true; }
    else if (threat !== undefined){ const d = threat >= px ? -1 : 1; if (d === awayDir || gap > 16) (d < 0 ? (b.left = true) : (b.right = true)); else (awayDir < 0 ? (b.left = true) : (b.right = true)); }
    else if (fl){ const d = (fl.x + 5 >= px) ? -1 : 1; if ((d === -awayDir && gap < 30) || (d === awayDir && roomBehind < 20)) { if (!ftoasts.some(f => !f.landed && Math.abs(f.x + 5 - px) < 30)){ want = true; hold = 30; } } else (d < 0 ? (b.left = true) : (b.right = true)); }
    else if (gap < 66 && roomBehind > 6){ awayDir < 0 ? (b.left = true) : (b.right = true); b.run = false; }
    else if (gap > 96){ steer(lx, 2); b.run = false; }
    if (gap < 14 && !want){ if (left) b.right = false; else b.left = false; }
  } else {
    const rk = !B.top || p.plat !== B.top ? bolts.find(o => o.homing && !o.reflected && o.y > p.y + 6 && Math.abs(o.x + o.w / 2 - px) < 60) : null;
    if (rk && p.vy > 0){ steer(rk.x + rk.w / 2, 1); }
    else if (feet < B.y + 2){ steer(lx, 2); }
    else if (gap < 8){ if (left){ b.left = true; b.right = false; } else { b.right = true; b.left = false; } }
  }
  botJump(b, want, hold);
}
function botJump(b, want, holdMax){
  const p = P;
  if (p.onGround || p.plat){ b.jump = bot.lastJump ? false : want; if (b.jump){ bot.hold = 0; bot.holdMax = holdMax || 40; } }
  else { bot.hold++; b.jump = bot.lastJump && p.vy < 0 && bot.hold < bot.holdMax; }
}
function botInput(){
  const b = botNav();
  if (G.state === 'play' && P && P.ctrl === 'normal' && !G.dialog && !P.dead) botCombat(b);
  if (bot.hiveLock && BOSS && (BOSS.kind === 'hive' || BOSS.kind === 'quartz' || BOSS.kind === 'vault') && BOSS.active){ b.left = bot.hiveLock.l; b.right = bot.hiveLock.r; }
  // v0.7: a rolling skull only rolls at the Hive while it's sitting on the boards (rolling under a hop means it lands on you)
  if (b.fire && BOSS && BOSS.kind === 'vault' && BOSS.active && P.bro === 'skulrz' && !(BOSS.open > 0)) b.fire = false; // v0.9 only roll at the Vault while the button glows
  if (b.fire && BOSS && (BOSS.kind === 'hive' || BOSS.kind === 'quartz') && BOSS.active && P.bro === 'skulrz' && (!BOSS.onGround || BOSS.state === 'hop' || Math.abs(P.x + P.w / 2 - (BOSS.x + BOSS.w / 2)) > 84)) b.fire = false;
  // v0.5: rising into a firebar sweep? cut the jump short (variable jump height) instead of flying into it
  if (G.state === 'play' && P && P.ctrl === 'normal' && !P.onGround && !P.plat && P.vy < -0.5 && b.jump && (lv.firebars.length || (lv.forks && lv.forks.length))){
    const vx = P.vx * 6;
    if (danger(P.x + Math.min(0, vx), P.x + P.w + Math.max(0, vx), P.y - 22, P.y + 4, 15)) { b.jump = false; bot.hold = 99; }
  }
  if (G.state === 'roster'){ b.start = G.frame % 40 === 0; }
  return b;
}
const BOT_RANGE = { rocket: 200, sniper: 260, zap: 130, iou: 120, shotgun: 72, snack: 46, shriek: 70, roll: 26 };
function botRanged(){ return (BOT_RANGE[BROS[P.bro].weapon.kind] || 0) >= 100; }
function botCombat(b){
  const p = P, B = BROS[p.bro], kind = B.weapon.kind, range = BOT_RANGE[kind] || 60;
  const grounded = p.onGround || !!p.plat, feet = p.y + p.h, px = p.x + p.w / 2;
  b.fire = false; b.melee = false; b.special = false;
  // escape run: just go
  if (G.escape){ b.left = false; b.right = true; b.run = true; return; }
  // explosives: never fire at one that is close, and wait for a chain reaction ahead to finish
  const my = p.y + 5, row = Math.floor(my / TS), dir = p.facing;
  let firstSolid = null;
  for (let d = 0; d < range + 16; d += 4){ const tx = Math.floor((px + dir * d) / TS); if (isSolid(tx, row)){ firstSolid = { c: tileAt(tx, row), d }; break; } }
  const boomAhead = booms.some(q => q.x > p.x - 40 && q.x < p.x + 110) || rings.some(r => r.t < 6 && Math.abs(r.x - px) < 70);
  if (boomAhead && grounded){ b.right = false; b.run = false; if (booms.some(q => Math.abs(q.x - px) < 60)){ b.left = true; } }
  const blasty = kind === 'rocket' || kind === 'shriek';
  let lineExplosive = false; // rockets/shrieks: any explosive in the line of fire within 150px means hold fire
  if (blasty) for (let d = 0; d < 150; d += 4){ const tx = Math.floor((px + dir * d) / TS); const c = tileAt(tx, row), c2 = tileAt(tx, Math.floor((p.y + 1) / TS)); if (EXPLOSIVE[c] || EXPLOSIVE[c2]){ lineExplosive = true; break; } if (isSolid(tx, row) && !EXPLOSIVE[c]) break; }
  const nearExplosive = (firstSolid && EXPLOSIVE[firstSolid.c] && firstSolid.d < 84) || lineExplosive;
  // after a pit wall-kick, keep drifting the kick direction until we land
  if (p.wjLock > 0){ bot.wjDir = p.facing; bot.wjT = 24; }
  if (grounded) bot.wjT = 0;
  if (bot.wjT > 0 && !grounded){ bot.wjT--; b.right = bot.wjDir > 0; b.left = bot.wjDir < 0; }
  // what's worth shooting
  let target = false;
  for (const e of enemies){
    if (e.dead) continue;
    const dx = (e.x + e.w / 2 - px) * dir, dy = (e.y + e.h / 2) - (p.y + p.h / 2);
    if (dx > -4 && dx < range && Math.abs(dy) < (kind === 'shriek' ? 22 : 14) + (e.h > 18 ? 6 : 0)) target = true;
    if (dx > -2 && dx < 16 && Math.abs(dy) < 14 && !bot.mel) b.melee = true;
  }
  if (firstSolid && firstSolid.c === 'C' && firstSolid.d < range) target = true;
  if (firstSolid && (firstSolid.c === 'C') && kind === 'roll' && firstSolid.d < 30) target = true;
  // bosses
  const bossOn = BOSS && G.dialogDone && BOSS.active && !BOSS.dying && !BOSS.dead;
  if (bossOn){
    const dx = (BOSS.x + BOSS.w / 2 - px) * dir;
    if (dx > 0 && dx < range + BOSS.w / 2 && Math.abs((BOSS.y + BOSS.h / 2) - (p.y + p.h / 2)) < BOSS.h / 2 + 10) target = true;
    if (BOSS.kind === 'glitch' && b.run && botRanged()) target = true;
  }
  // a cage dead ahead: stop and shoot it open instead of hopping over it
  if (firstSolid && firstSolid.c === 'C' && grounded && firstSolid.d < Math.max(40, Math.min(range, 90)) && !nearExplosive){
    const enemyNear = enemies.some(e => !e.dead && Math.abs(e.x - p.x) < 40 && Math.abs((e.y + e.h) - feet) < 24);
    if (!enemyNear){ b.jump = false; bot.lastJump = false; if (firstSolid.d < 24 && kind !== 'roll'){ b.right = false; b.run = false; } target = true;
      if (firstSolid.d < 12){ b.right = false; b.left = false; b.run = false; if (!bot.mel) b.melee = true; } } // point blank: punch it open
  }
  if (target && !nearExplosive && kind !== 'roll') b.fire = true;
  const hazAhead = lv.beams.some(bm => bm.tx * TS + 8 > p.x && bm.tx * TS - p.x < 110) || lv.firebars.some(fb => Math.abs(fb.tx * TS + 8 - px) < 24 + fb.len * 8) || enemies.some(e => !e.dead && e.type === 'rlaunch' && Math.abs(e.x - p.x) < 60);
  if (target && kind === 'roll' && grounded && !nearExplosive && !boomAhead && !hazAhead) b.fire = true;
  bot.mel = b.melee;
  // specials: only the safe ones, only when it matters
  const SAFE = { crumbburst: 1, curse: 1, turret: 1, mirror: 1, bonebomb: 1 };
  const crowd = enemies.filter(e => !e.dead && e.x + e.w > camX && e.x < camX + W && Math.abs(e.x - p.x) < 140).length;
  if (p.spec > 0 && SAFE[B.special.kind] && !nearExplosive && (bossOn || crowd >= 3)){
    if (!bot.specT || G.frame - bot.specT > (bossOn ? 150 : 240)){ b.special = true; bot.specT = G.frame; }
  }
  // v0.5: never back up into a firebar / beam sweep (combat retreats used to walk bros into them)
  if (b.left && grounded && danger(p.x - 26, p.x + p.w - 4, p.y, feet, 24)){ b.left = false; b.run = false; }
  // airborne toward a beam that will be live when we land: pull up short
  if (!grounded && !G.escape){
    for (const bm of lv.beams){
      const bx = bm.tx * TS + 5, gap = bx - (p.x + p.w);
      if (gap > -2 && gap < 16 + Math.max(0, p.vx) * 5 && p.vy > 0 && feet > bm.y0 * TS - 8){ let live = false; for (let f = 0; f <= 28; f += 4) if (beamState(bm, G.lf + f) !== 'off') live = true; if (live){ b.right = false; b.left = true; b.run = false; } }
    }
  }
  // wall-jump out of a pit
  if (!grounded && p.wallG > 0 && p.vy > 0 && p.wallD < 0){
    const tx = Math.floor(px / TS); let pit = true; for (let y = Math.floor(feet / TS); y < 15; y++) if (standable(tx, y)) pit = false;
    if (pit){ b.jump = !bot.lastJump; bot.lastJump = b.jump; }
  }
}
function botNav(){
  const b = { right: true, run: true, left: false, down: false, jump: false, start: false, up: false };
  if (G.state === 'title'){ b.right = false; b.run = false; b.start = G.frame % 40 === 0; return b; }
  if (G.state === 'worldclear'){ b.right = false; b.run = false; b.start = !!G.nextWorldLevel && G.stateT > 130 && G.frame % 40 === 0; return b; }
  if (G.state === 'clear' || G.state === 'select'){ b.start = G.frame % 40 === 0; b.right = false; b.run = false; return b; }
  if (G.state !== 'play' || !P || P.ctrl !== 'normal' || G.dialog){ bot.lastJump = false; b.right = false; return b; }
  const p = P, grounded = p.onGround || !!p.plat;
  const fx = p.x + p.w, feet = p.y + p.h, feetRow = Math.floor((feet - EPS) / TS);
  // --- THE GRAND TOASTER ---
  if (BOSS && BOSS.kind === 'toaster' && G.dialogDone && !(BOSS.dead && G.escape)){ botToaster(b, grounded, feet); bot.lastJump = b.jump; return b; }
  if (BOSS && BOSS.kind === 'breadlord' && G.dialogDone && !(BOSS.dead && G.escape)){ botBread(b, grounded, feet); bot.lastJump = b.jump; return b; }
  if (BOSS && BOSS.kind === 'repairman' && G.dialogDone && !(BOSS.dead && G.escape)){ botCal(b, grounded, feet); bot.lastJump = b.jump; return b; }
  if (BOSS && (BOSS.kind === 'hive' || BOSS.kind === 'quartz' || BOSS.kind === 'vault') && G.dialogDone && !(BOSS.dead && G.escape)){ botHive(b, grounded, feet); bot.lastJump = b.jump; return b; }
  // pipes the route needs (marked botDown in the level data)
  if (grounded){ for (const pp of lv.pipes){ if (pp.botDown && pp.dir === 'up' && Math.abs(feet - pp.y * TS) < 0.5 && p.x >= pp.x * TS + 1 && p.x + p.w <= pp.x * TS + 31){ b.down = true; b.right = false; b.run = false; bot.lastJump = false; return b; } } }
  // steer onto a route pipe ahead and stop there
  const rp = lv.pipes.find(pp => pp.botDown && pp.dir === 'up' && pp.x * TS + 30 > p.x && pp.x * TS - fx < 64);
  if (rp){
    const cx = rp.x * TS + 10, top = rp.y * TS;
    b.run = false; b.right = false; b.left = false;
    if (grounded && feet > top + 1){ if (rp.x * TS - fx < 18) { botJump(b, true, 40); b.right = true; bot.lastJump = b.jump; return b; } b.right = true; }
    else if (!grounded){ if (p.x < cx - 3) b.right = true; else if (p.x > cx + 3) b.left = true; }
    botJump(b, false); bot.lastJump = b.jump; return b;
  }
  // --- boss fight ---
  if (BOSS && BOSS.kind === 'glitch' && G.dialogDone && !G.unplugged){
    const B = BOSS, bx = B.x + B.w / 2, px = p.x + p.w / 2;
    b.run = false; b.right = false;
    const toward = o => Math.sign(px - o.x) === Math.sign(o.vx) || Math.abs(o.vx) < 0.1;
    const lowB = bolts.find(o => toward(o) && Math.abs(o.x - px) < 46 && o.y > p.y + p.h - 16 && o.vx < 0);
    const low = !!lowB && Math.abs(lowB.x - px) < 22;
    const hopOver = bolts.some(o => o.vx < 0 && o.x > px - 14 && o.x < px + 30 && o.y > p.y + p.h - 16) && !grounded;
    const high = bolts.some(o => toward(o) && Math.abs(o.x - px) < 40 && o.y > p.y - 4 && o.y < feet - 14);
    if (high && p.size > 0 && grounded && !low){ b.down = true; }
    const fwd = () => { if (hopOver || low){ b.right = true; b.left = false; } };
    if (!B.dead && !B.dying && botRanged()){
      if (px > bx - 72) b.left = true; else if (px < bx - 120) b.right = true;
      if (B.state === 'leap' && !B.onGround){ b.left = false; b.right = true; b.run = true; botJump(b, false); }
      else { if (G.frame % 18 < 2 && !b.down){ b.left = false; b.right = true; b.run = true; } botJump(b, low, 6); fwd(); }
      if (px > bx + 20){ b.right = true; b.left = false; b.run = true; }
    } else if (!B.dead && !B.dying){
      if (px > bx + 16){ b.right = true; b.run = true; botJump(b, low, 10); }
      else if (B.state === 'leap' && !B.onGround && B.y + B.h < p.y - 2){ b.right = true; b.run = true; botJump(b, false); }
      else { if (px > bx - 56) b.left = true; botJump(b, low, 6); fwd(); }
    } else { b.right = true; b.run = true; botJump(b, false); }
    bot.lastJump = b.jump; return b;
  }
  if (bot.back > 0){
    bot.back--; b.right = false; b.left = true; b.run = true;
    const threat = enemies.some(e => !e.dead && e.x + e.w > p.x - 30 && e.x < p.x + 4 && Math.abs((e.y + e.h) - feet) < 20);
    botJump(b, threat, 30); bot.lastJump = b.jump; return b;
  }
  if (Math.abs(p.vx) < 0.05 && !p.springUp && (isSolid(Math.floor((fx + 1) / TS), feetRow) || isSolid(Math.floor((fx + 1) / TS), feetRow - 1))){ if (++bot.stuck > 40){ bot.stuck = 0; bot.back = 56; } } else bot.stuck = 0;
  let want = false, hold = 40;
  // walls / steps ahead
  for (let d = 2; d <= 40; d += 3){
    const tx = Math.floor((fx + d) / TS);
    for (let k = 0; k < Math.ceil(p.h / TS) + 1; k++) if (isSolid(tx, feetRow - k)){ let y = feetRow - k; while (isSolid(tx, y - 1)) y--; const hgt = feetRow + 1 - y; if (d <= 12 + hgt * 9) want = true; }
  }
  // gaps / acid ahead
  let edgeWait = false, leap = false;
  if (grounded){
    const tx = Math.floor((fx + 6 + (inDiner() ? Math.max(0, p.vx) * 11 : 0)) / TS); // v0.6: look a step ahead at speed so card pits don't sneak up
    const below = tileAt(tx, feetRow) === 'A' || tileAt(tx + 1, feetRow) === 'A' ? -1 : groundBelow(tx, feetRow + 1);
    const supported = below === feetRow + 1 || platAt(fx + 6, feet, 4);
    let acidNear = false; for (let d = 0; d <= 4; d++) for (let y = feetRow; y < 15; y++) if (tileAt(tx + d, y) === 'A') acidNear = true;
    if (!supported && below > 0 && acidNear){ b.run = false; }  // drop toward acid: walk off, then hop the puddle
    else if (!supported && below > 0){ if (!p.plat) want = true; }  // a drop, not a pit: leap off the ledge
    else if (!supported){
      // a pit: look for a landing spot within reach
      let landing = null;
      for (let d = 1; d <= 6 && !landing; d++){
        const t2 = tx + d, gy = groundBelow(t2, Math.max(2, feetRow - 3));
        if (gy >= 0 && gy >= feetRow - 3) landing = { x: t2 * TS, d };
      }
      const pl = plats.find(q => !q.gone && q.y > feet - 56 && q.y < feet + 40 && q.x + q.w > fx + 4 && q.x < fx + 64);
      const plFar = plats.find(q => !q.gone && q.y > feet - 56 && q.y < feet + 60 && q.x + q.w > fx && q.x < fx + 200);
      if (landing && landing.d <= 5){ want = true; leap = true; }
      else if (pl){ want = true; if (pl.kind === 'card'){ hold = 14; b.run = false; } } // v0.6: short hops onto giant cards
      else if (plFar || !landing) edgeWait = true;
      else want = true;
    }
  }
  // riding a platform: hop off when ground ahead is reachable
  if (p.plat){
    const pl = p.plat;
    const ahead = Math.floor((pl.x + pl.w + 8) / TS);
    let land = false;
    for (let d = 0; d < 4; d++){ const gy = groundBelow(ahead + d, feetRow - 3); if (gy >= 0 && gy <= feetRow + 3) land = true; }
    const nextPl = plats.find(q => q !== pl && !q.gone && q.x > pl.x + 8 && q.x < pl.x + pl.w + 56 && Math.abs(q.y - pl.y) < 48);
    const nearEdge = fx > pl.x + pl.w - 10;
    if (nearEdge){ if (land || nextPl){ want = true; if (pl.kind === 'card'){ hold = 14; b.run = false; } } else { b.right = false; edgeWait = true; } }
    if (pl.kind === 'fall') { b.right = true; }
  }
  if (edgeWait){ b.right = false; b.run = false; if (p.vx > 0.3) b.left = true; }
  // v0.6 card pits: in the air, settle on the solid card below instead of sailing onto a face-down one
  if (!grounded && inDiner()){
    const cardAhead = plats.find(q => q.kind === 'card' && !q.gone && q.y > feet - 8 && q.y < feet + 64 && q.x + q.w > fx - 4 && q.x < fx + 56);
    if (cardAhead && p.vx > 1.5){ b.right = false; b.run = false; b.left = true; b.cardBrake = 1; }
  }
  if (!grounded && inDiner() && p.vy > -1.5){
    const cx = fx + 6, under = plats.find(q => q.kind === 'card' && q.y >= feet - 6 && q.y < feet + 48 && cx > q.x + 3 && cx < q.x + q.w - 3 && platSolid(q) && cardState(q.card).left > 26);
    if (under){
      const nx = plats.find(q => q.kind === 'card' && q !== under && q.x >= under.x + under.w - 4 && q.x < under.x + under.w + 24);
      const tAfter = Math.floor((under.x + under.w + 4) / TS), gy = groundBelow(tAfter, Math.max(2, feetRow - 3));
      const groundNext = gy >= 0 && gy * TS <= under.y + 40;
      if (p.vy > 0.6 || (nx ? nx.gone : !groundNext)){ b.right = false; b.run = false; if (p.vx > 0.9) b.left = true; }
    }
  }
  // enemies
  if (!want){
    for (const e of enemies){
      if (e.dead) continue;
      const dx = e.x - fx, dy = (e.y + e.h) - feet;
      if (e.type === 'skel' && e.state === 'bones') continue;
      let close = (e.type === 'toast' && e.state === 'charge' ? 52 : e.type === 'mimic' ? 30 : 22) + Math.max(0, p.vx) * 6;
      if (e.type === 'truck') close = (e.state === 'charge' && e.facing < 0 ? 66 : e.state === 'rev' ? 40 : 28) + Math.max(0, p.vx) * 7;
      if (e.type === 'rlaunch') close = 26 + Math.max(0, p.vx) * 6;
      if (e.type === 'gunner') close = 30 + Math.max(0, p.vx) * 7;
      if ((e.type === 'truck' || e.type === 'gunner') && dx > -6 && dx < close && Math.abs(dy) < 30){ want = true; hold = 40; continue; }
      if (grounded && (e.type === 'crumb' || e.type === 'skel') && dx > -4 && dx < 10 && Math.abs(dy) < 16 && e.vx <= 0){ b.right = false; b.left = true; b.run = true; bot.back = 10; continue; }
      if (e.type === 'jamskull' && !e.onGround && grounded && dx > -8 && dx < 44){ b.right = false; b.run = false; if (p.vx > 0.4 || dx < 14) b.left = true; continue; } // wait out a Jam Skull mid-hop, then hop it once it lands
      if (e.fly){ if (dx > -20 && dx < 40 && dy < 0 && dy > -70 && e.state === 'dive'){ b.right = false; b.left = true; } continue; }
      if (dx > -6 && dx < close && Math.abs(dy) < 24){ want = true; hold = 8; }
      else if (dx > -6 && dx < 72 && dy >= 24 && dy < 120){ want = true; }
    }
  }
  // diving Butter Bombers: back off and let them splat
  const diver = enemies.find(e => e.fly && !e.dead && e.state === 'dive' && Math.abs(e.x - p.x) < 44 && e.y < p.y);
  if (diver){ if (p.vx > 1.2 || diver.x + diver.w < p.x){ b.right = true; b.run = true; } else { b.right = false; b.left = true; b.run = true; } want = false; }
  // signal bolts
  if (bolts.some(o => !o.homing && o.x > p.x - 10 && o.x < fx + 30 && o.y > p.y - 6 && o.y < feet + 4 && o.vx < 0.4)){ want = true; hold = 14; }
  // rifle / gunner bullets: hop them early (they're fast)
  { const pcx = p.x + p.w / 2; const bl = bolts.find(o => o.kind === 'bullet' && !o.mine && Math.sign(pcx - o.x) === Math.sign(o.vx) && Math.abs(o.x - pcx) < 64 && o.y > p.y - 4 && o.y < feet + 2); if (bl){ const chase = Math.sign(bl.vx) === p.facing, d = Math.abs(bl.x - pcx);
      if (chase && Math.abs(p.vx) > 1.4 && Math.abs(bl.vx) < Math.abs(p.vx) + 0.4){ b.run = true; }       // outrun it
      else if (chase ? d < 16 : d < 40 + Math.abs(p.vx) * 4){ want = true; hold = 18; } } }
  // v0.5 World 3: hop ground shockwaves from either side; step out from under a falling smoke-detector pulse
  { const pcx = p.x + p.w / 2;
    for (const o of bolts){ if (o.kind !== 'gwave' || o.mine || Math.sign(pcx - (o.x + 5)) !== Math.sign(o.vx)) continue; const d = Math.abs(o.x + 5 - pcx);
      const facingIt = (o.vx < 0) === (p.vx >= 0); // it comes at our face: hop it; it chases us from behind: outrun it
      if (facingIt && d < 26 + Math.abs(p.vx) * 4){ want = true; hold = 16; }
      else if (!facingIt && d < 60){ if (o.vx > 0){ b.right = true; b.left = false; } else { b.left = true; b.right = false; } b.run = true; if (d < 12){ want = true; hold = 16; } } }
    const sh = bolts.find(o => o.kind === 'shock' && Math.abs(o.x + 6 - pcx) < 22 && o.y < p.y);
    if (sh && grounded){ const d = pcx >= sh.x + 6 ? 1 : -1; if (d > 0){ b.right = true; b.run = true; b.left = false; } else { b.right = false; b.left = true; } }
    const sm = enemies.find(e => e.type === 'smoke' && !e.dead && e.state === 'beep' && Math.abs(e.x + 8 - pcx) < 30);
    if (sm && grounded && !sh){ b.right = true; b.run = true; b.left = false; } }
  // homing Toast Rockets: hop when one closes in at body height (often stomping it)
  if (bolts.some(o => o.homing && !o.reflected && Math.abs(o.x + 5 - (p.x + p.w / 2)) < 34 && o.y + 8 > p.y - 4 && o.y < feet + 2)){ want = true; hold = 24; }
  // static hazards (firebars / beams): only go when the path ahead stays clear
  if (lv.firebars.length || lv.beams.length || pitDangerOn()){
    const hit = (bx, f) => danger(bx - 3, bx + p.w + 3, p.y - 3, feet + 2, 0, f);
    let pathBad = false, stayBad = false, backBad = false, vx = Math.max(0, p.vx), x = p.x;
    for (let f = 0; f <= 44; f += 2){ vx = Math.min(2.5625, vx + 0.11); x += vx * 2; if (hit(x, f)){ pathBad = true; break; } }
    for (let f = 0; f <= 44; f += 2) if (hit(p.x, f)){ stayBad = true; break; }
    if (pathBad && !leap){
      if (!stayBad){ b.right = false; b.run = false; want = false; if (p.vx > 0.2) b.left = true; }
      else { for (let f = 0, x2 = p.x; f <= 30; f += 2){ x2 -= 3; if (hit(x2, f)){ backBad = true; break; } }
        if (!backBad){ b.right = false; b.left = true; b.run = true; want = false; } }
    }
  }
  // v0.5: a ground shockwave about to hit wins over waiting for a hazard: hop it in place
  if (grounded && bolts.some(o => o.kind === 'gwave' && !o.mine && Math.sign((p.x + p.w / 2) - (o.x + 5)) === Math.sign(o.vx) && Math.abs(o.x + 5 - (p.x + p.w / 2)) < 16)){ want = true; hold = 14; if (b.right && edgeWait) b.right = false; }
  // mid-air: steer away from acid / pit landings (simple forward simulation)
  if (!grounded && p.vy > -1){
    const sim = (mode) => {
      let x = p.x + p.w / 2, y = feet, vx = p.vx, vy = p.vy;
      for (let f = 0; f < 90; f++){
        if (mode === 1) vx = Math.min(2.5625, vx + 0.0557); else if (mode === -1) vx = Math.max(-1.5, vx - 0.0557);
        vy = Math.min(4.5, vy + 0.4375); x += vx; y += vy;
        const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
        if (ty >= 15) return 'pit';
        const c = tileAt(tx, ty); if (c === 'A') return 'acid';
        if (vy > 0 && standable(tx, ty)) return 'ok';
        if (vy > 0 && platAt(x, y, 5)) return 'ok';
      }
      return 'pit';
    };
    if (sim(0) !== 'ok'){
      if (sim(1) === 'ok'){ b.right = true; b.run = true; b.left = false; }
      else if (sim(-1) === 'ok'){ b.right = false; b.left = true; }
    }
  }
  // mid-air: line up stomps on enemies we're coming down onto (instead of clipping their side)
  if (!grounded && p.vy > 0){
    const pcx = p.x + p.w / 2;
    const tgt = enemies.find(e => !e.dead && !e.fly && e.type !== 'rlaunch' && !(e.type === 'skel' && e.state === 'bones') && Math.abs(e.x + e.w / 2 - pcx) < 34 && e.y > feet - 2 && e.y - feet < 48);
    if (tgt){ const ecx = tgt.x + tgt.w / 2; if (ecx > pcx + 3){ b.right = true; b.left = false; } else if (ecx < pcx - 3){ b.right = false; b.left = true; } else { b.right = false; b.left = false; } }
  }
  // v0.6 World 4: hold position and shoot at the Fuse Box; hop mold patches instead of wading through
  if (inDiner()){
    const fb = enemies.find(e => e.type === 'fusebox' && !e.dead && e.x - fx < 64 && e.x - fx > -40);
    const rg = Math.min(84, (BOT_RANGE[BROS[p.bro].weapon.kind] || 60) - 8), dC = fb ? fb.x + fb.w / 2 - (p.x + p.w / 2) : 0;
    if (fb && dC > rg) { /* keep walking in until it is in range */ }
    else if (fb){ b.right = false; b.run = false; want = false; if (dC < Math.max(30, rg - 26)) b.left = true; if (!b.left && p.facing < 0 && G.frame % 6 === 0) b.right = true;
      const sp = bolts.find(o => o.fuse && !o.mine && o.x - (p.x + p.w) > -4 && o.x - (p.x + p.w) < 12); if (grounded && sp){ want = true; hold = 30; } }
    const bg = enemies.find(e => e.type === 'bagel' && !e.dead && !e.remove && (e.state === 'aim' || e.state === 'dive') && Math.abs(e.x + 6 - (p.x + 6)) < 110);
    if (bg){ const away = (bg.state === 'dive' ? bg.x + 6 + bg.vx * 12 : bg.x + 6) > p.x + 6 ? -1 : 1; b.right = away > 0; b.left = away < 0; b.run = true; if (edgeWait && away > 0){ b.right = false; } }
    if (grounded && !want && molds.some(m => m.x - fx < 10 + Math.max(0, p.vx) * 4 && m.x - fx > -4 && Math.abs(m.y - feet) < 3)){ want = true; hold = 14; }
  }
  // butter: walk, don't run (puddles are fine to run through)
  if (p.slick && p.slickKind !== 'puddle') b.run = false;
  if (inBumbo() && !G.escape){ const r = botBumbo(b, grounded, feet, fx, want, hold); want = r.want; hold = r.hold; } // v0.7 World 5
  if (inCrypt() && !G.escape){ const r = botCrypt(b, grounded, feet, fx, want, hold); want = r.want; hold = r.hold; } // v0.8 World 6
  if (inArcade() && !G.escape){ const r = botArcade(b, grounded, feet, fx, want, hold); want = r.want; hold = r.hold; } // v0.9 World 7
  botJump(b, want, hold);
  if (G.area === 'bonus' && lv.camLock){ const nearBricks = p.x + p.w > 3 * TS - 4 && p.x < 11 * TS; if (grounded && !bot.lastJump && nearBricks && p.y > 170){ b.jump = true; bot.hold = 0; bot.holdMax = 40; } }
  bot.lastJump = b.jump;
  return b;
}

// ---------------- loop ----------------
let acc = 0, last = 0;
function frame(){ readInput(); update(); }
function loop(ts){
  if (!last) last = ts;
  acc += Math.min(250, ts - last); last = ts;
  let n = 0;
  while (acc >= STEP && n < 5){ frame(); acc -= STEP; n++; }
  if (n === 5) acc = 0;
  render();
  requestAnimationFrame(loop);
}
window.TT = {
  G, S, get P(){ return P; }, get lv(){ return lv; }, get LV(){ return LV; }, get camX(){ return camX; }, get enemies(){ return enemies; }, get items(){ return items; },
  get plats(){ return plats; }, get ftoasts(){ return ftoasts; }, get bolts(){ return bolts; }, get patches(){ return patches; }, get BOSS(){ return BOSS; }, get save(){ return save; }, get rockets(){ return rockets; },
  get btn(){ return btn; }, danger(...a){ return danger(...a); }, coilState(r, f){ return coilState(r, f); },
  step(n, buttons){ forced = buttons || {}; for (let i = 0; i < (n || 1); i++) frame(); forced = null; return TT.snap(); },
  render, setForced(b){ forced = b; },
  snap(){ return { state: G.state, level: G.levelId, area: G.area, x: P ? +P.x.toFixed(2) : null, y: P ? +P.y.toFixed(2) : null, vx: P ? +P.vx.toFixed(4) : null, vy: P ? +P.vy.toFixed(4) : null, onGround: P ? P.onGround : null, size: P ? P.size : null, hp: P ? P.hp : null, ctrl: P ? P.ctrl : null, lives: G.lives, coins: G.coins, score: G.score, time: G.time, camX, enemies: enemies.length, deaths: G.deaths, boss: BOSS ? { kind: BOSS.kind, hp: BOSS.hp, state: BOSS.state, dead: BOSS.dead, dying: BOSS.dying, dents: BOSS.dents } : null, boost: P ? P.boost : 0, bro: P ? P.bro : G.curBro, spec: P ? P.spec : 0, rescued: G.rescued, escape: !!G.escape, wall: P ? P.wall : 0 }; },
  warp(tx, ty){ P.x = tx * TS + 2; P.y = (ty !== undefined ? ty : (function(){ if (!isSolid(tx, 14)) return surfaceRow(tx); let y = 14; while (y > 0 && isSolid(tx, y - 1)) y--; return y; })()) * TS - P.h; P.vx = 0; P.vy = 0; P.plat = null; camX = lv.camLock ? 0 : Math.max(0, Math.min(P.x - 100, lv.w * TS - W)); if (G.camLockX !== null) camX = Math.min(camX, G.camLockX); for (const s of lv.spawns) if (s.x * TS < camX) s.done = true; enemies = enemies.filter(e => e.x > camX); },
  give(size){ grow(size); P.morph = 0; }, hurt(){ hurt(); }, die(){ die(); }, get MAX_HP(){ return MAX_HP; },
  clearEnemies(){ enemies = []; for (const s of lv.spawns) s.done = true; },
  tileAt: (x, y) => tileAt(x, y),
  startLevel(id, size){ G.levelId = id; G.checkpoint = false; G.carrySize = size || 0; startLevel(); },
  newGame, writeSave, loadSave(){ save = loadSave(); return save; },
  spawn(type, tx, ty, extra){ const s = Object.assign({ type, x: tx, y: ty === undefined ? 12 : ty, done: false }, extra || {}); lv.spawns.push(s); spawnEnemies(); return enemies.length; },
  addItem(type, tx, ty){ const it = spawnItem(type, tx * TS, ty * TS); it.emerge = 0; return items.length; },
  get shots(){ return shots; }, get booms(){ return booms; }, get turrets(){ return turrets; },
  setBro(id){ swapBro(id); }, freeCage(tx, ty){ freeCage(tx, ty); }, boom(x, y, r, o){ boom(x, y, r, o); }, damageTile(tx, ty, pw){ return damageTile(tx, ty, pw); },
  unlockAll(){ save.unlocked = BRO_IDS.slice(); writeSave(); }, resetBros(){ save.unlocked = ['toasty']; save.startBro = 'toasty'; writeSave(); },
  setTile(tx, ty, c){ lv.t[ty][tx] = c; },
  // v0.5 World 3 hooks
  enterArea(n){ enterArea(n); }, breadHit(){ breadDamage('test'); }, forkSpark: (fk, f) => forkSpark(fk, f), reelState: (r, f) => reelState(r, f), get magCoins(){ return magCoins; },
  // v0.6 World 4 hooks
  // v0.7 World 5 hooks
  hiveHit(){ hiveDamage('test'); }, tideState: (f) => tideState(f), tidePerches: () => tidePerches(), get bumFx(){ return bumFx; },
  // v0.9 World 7
  vaultHit(){ const b = BOSS; if (b && b.kind === 'vault'){ b.flash = 0; vaultDamage('test'); } }, broFlashLines: (f) => broFlashLines(f), crtPhase: (gp, f) => crtPhase(gp, f), crtOn: (gp) => crtOn(gp),
  pusherState: (i, f) => { const q = plats.filter(pl => pl.axis === 'pusher')[i || 0]; return q ? Object.assign(pusherState(q, f), { x0: q.x0, w: q.w, y: q.y }) : null; },
  clawState: (i, f) => { const q = plats.filter(pl => pl.axis === 'claw')[i || 0]; return q ? Object.assign(clawState(q, f), { x0: q.x0, y0: q.y0, w: q.w }) : null; },
  get arcToks(){ return arcToks; }, giveStreak(){ P.streak = STREAK_TIME; },
  arcadeState(){ const b = BOSS && BOSS.kind === 'vault' ? BOSS : null; return { figs: G.figs || 0, tix: G.tix || 0, showers: G.showers || 0, tokens: G.tokens7 || 0, shoves: G.shoves || 0, pushRides: G.pushRides || 0, clawRides: G.clawRides || 0, clawGrabs: G.clawGrabs || 0, crtHops: G.crtHops || 0, streak: P ? (P.streak || 0) : 0, streaks: G.streaks || 0, crtT: lv ? (lv.crtT || 0) : 0, hasCrt: !!(lv && lv.hasCrt), vaultDown: !!G.vaultDown, vaultHits: G.vaultHits || 0, vaultWaves: G.vaultWaves || 0, vaultHaz: G.vaultHaz || 0, open: b ? b.open : 0, phase: b ? b.phase : 0, hp: b ? b.hp : null, nameCard: G.nameCard ? G.nameCard.text : null, ctrl: P ? P.ctrl : null, ride: P && P.plat ? (P.plat.axis || null) : null, onCrt: !!(P && P.onCrt), bigText: G.bigText ? G.bigText.text : null, drips: b ? b.drips.length : 0, dying: !!(b && b.dying), active: !!(b && b.active), state: b ? b.state : null }; },
  // v0.8 World 6
  quartzHit(){ quartzDamage('test'); }, get pops(){ return pops; }, isSolid: (x, y) => isSolid(x, y), broFlashHeld: () => broFlashHeld(), geyserState: (i, f) => { const q = plats.filter(pl => pl.axis === 'geyser')[i || 0]; return q ? Object.assign(geyserState(q, f), { x: q.x, w: q.w }) : null; }, rgbHit: (tx, ty) => rgbHit(tx, ty), get cryFx(){ return cryFx; },
  cryptState(){ return { portals: G.portals || 0, geyserRides: G.geyserRides || 0, rgbHits: G.rgbHits || 0, rgbT: lv ? (lv.rgbT || 0) : 0, sauce: P ? (P.sauce || 0) : 0, sauces: G.sauces || 0, quartzDown: !!G.quartzDown, quartzSlams: G.quartzSlams || 0, quartzHaz: G.quartzHaz || 0, nameCard: G.nameCard ? G.nameCard.text : null, bigText: G.bigText ? G.bigText.text : null, broFlash: G.broFlash ? { t: G.broFlash.t, held: broFlashHeld() } : null, onGeyser: !!(P && P.plat && P.plat.axis === 'geyser'), crown: BOSS && BOSS.kind === 'quartz' ? quartzCrown(BOSS) : null, king: BOSS && BOSS.kind === 'quartz' ? { hp: BOSS.hp, phase: BOSS.phase, state: BOSS.state, active: BOSS.active, dying: BOSS.dying, dead: BOSS.dead, drips: BOSS.drips.length, beams: BOSS.drips.filter(d => d.kind === 'beam').length } : null }; },
  bumboState(){ return { springs: G.springs || 0, tideY: G.tideY, tidePh: G.tidePh, foilMet: !!G.foilMet, foilCut: !!G.foilCut, hiveDown: !!G.hiveDown, nameCard: G.nameCard ? G.nameCard.text : null, curtain: !!G.curtain, shrieks: G.shrieks || 0, hiveSlams: G.hiveSlams || 0, mitt: !!(P && P.mitt), mittBlocks: G.mittBlocks || 0, honey: !!(P && P.honey) }; },
  cardState: (c, f) => cardState(c, f), get molds(){ return molds; }, calHit(){ calDamage('test'); }, flickerDark: (f) => flickerDark(f),
  dinerState(){ return { flipped: !!G.flipped, flipWarn: !!G.flipWarn, flips: G.flips || 0, freezeT: G.freezeT || 0, itsYou: !!G.itsYou, fuseBlown: !!G.fuseBlown, cancelled: !!G.rerunCancelled, hudNameMode: G.hudNameMode }; },
  bros(){ return { cur: P ? P.bro : G.curBro, reserve: G.reserve.slice(), rescued: G.rescued, unlocked: save.unlocked.slice(), spec: P ? P.spec : 0 }; },
};
if (!TEST) requestAnimationFrame(loop); else render();
})();
