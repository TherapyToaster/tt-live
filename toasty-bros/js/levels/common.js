// Level-building helpers shared by every world. Levels are data: areas made of a tile grid plus entity lists.
'use strict';
// Tiles: . empty  G ground  B brick  ? CRT block  U used  S solid block  p pipe  H hidden block  o coin  D dark wall
//        > < conveyor (push right/left)  R butter barrel  A acid puddle (hurts)  M mimic block  b bridge
//        = one-way plank (land from above, hold DOWN to drop through)  K crumble plank (drops after you stand on it)
//        X tombstone / junk block (solid, themed)
//        C rescue cage (break it to free a bro)  T toaster tank / F gas can (explosive, chain-react)
//        Q hot coil floor (World 3, glows on a cycle and burns)  O wall outlet (Fork in the Outlet sparks jump between them)
//        W mini fridge (World 3 explosive)  Y Pop-Up toaster slot (World 4)
//        J Pop-Up Spring (World 5: solid; landing on it bounces you high)
//        m magenta RGB block (World 6: solid until the RGB switch runs)  c cyan RGB block (solid only while it runs)  Z RGB switch (solid)
//        n / N CRT platform, group A / B (World 7: solid only while that group's screens are on)  g mini figure capsule (pickup)  k prize tickets (pickup)
const SOLID_TILES = new Set(['G', 'B', '?', 'U', 'S', 'p', 'D', '>', '<', 'R', 'M', 'b', 'K', 'X', 'C', 'T', 'F', 'Q', 'O', 'W', 'Y', 'J', 'Z']);
// Level registry: each world file adds its levels and appends to LEVEL_ORDER in play order.
const LEVELS = {};
const LEVEL_ORDER = [];
function newArea(name, w, theme, opts){
  const A = Object.assign({ name, w, h: 15, theme, t: Array.from({ length: 15 }, () => Array(w).fill('.')),
    contents: {}, pipes: [], spawns: [], plats: [], firebars: [], beams: [], signs: [], bumps: {}, multi: {},
    pole: null, booth: null, boss: null, music: null, camLock: false, patchesInit: [], boosts: [], decor: [],
    coils: [], forks: [], reels: [], cards: [], toasters: [], flicker: null, tide: null }, opts || {});
  return A;
}
function areaTools(A){
  const set = (x, y, c) => { if (x >= 0 && x < A.w && y >= 0 && y < A.h) A.t[y][x] = c; };
  const T = {
    set,
    ground: (a, b) => { for (let x = a; x <= b; x++){ set(x, 13, 'G'); set(x, 14, 'G'); } },
    roof: (a, b, top) => { for (let x = a; x <= b; x++) for (let y = top; y <= 14; y++) set(x, y, 'G'); },
    fill: (a, b, y0, y1, c) => { for (let x = a; x <= b; x++) for (let y = y0; y <= y1; y++) set(x, y, c); },
    q: (x, y, c) => { set(x, y, '?'); A.contents[x + ',' + y] = c || 'coin'; },
    br: (x, y, c) => { set(x, y, 'B'); if (c) A.contents[x + ',' + y] = c; },
    row: (a, b, y, c) => { for (let x = a; x <= b; x++) set(x, y, c || 'B'); },
    hid: (x, y, c) => { set(x, y, 'H'); A.contents[x + ',' + y] = c; },
    coin: (x, y) => set(x, y, 'o'),
    coins: (a, b, y) => { for (let x = a; x <= b; x++) set(x, y, 'o'); },
    pipe: (x, hgt, opt, base) => { const bottom = base === undefined ? 12 : base; const top = bottom - hgt + 1; for (let y = top; y <= bottom; y++){ set(x, y, 'p'); set(x + 1, y, 'p'); } A.pipes.push(Object.assign({ x, y: top, h: hgt, dir: 'up' }, opt || {})); },
    stairs: (x, n, up, base) => { const b = base === undefined ? 12 : base; for (let i = 0; i < n; i++){ const hh = up ? i + 1 : n - i; for (let y = b - hh + 1; y <= b; y++) set(x + i, y, 'S'); } },
    col: (x, hh, base) => { const b = base === undefined ? 12 : base; for (let y = b - hh + 1; y <= b; y++) set(x, y, 'S'); },
    en: (type, x, y, extra) => A.spawns.push(Object.assign({ type, x, y: y === undefined ? 12 : y, done: false }, extra || {})),
    conv: (a, b, y, dir) => { for (let x = a; x <= b; x++) set(x, y, dir > 0 ? '>' : '<'); },
    barrel: (x, y) => set(x, y, 'R'),
    acid: (a, b, y) => { for (let x = a; x <= b; x++) set(x, y, 'A'); },
    mimic: (x, y) => set(x, y, 'M'),
    // moving platform: tx,ty top-left in tiles, w in tiles, axis 'x'|'y', range in tiles, speed (radians/frame)
    mplat: (tx, ty, w, axis, range, speed, phase) => A.plats.push({ kind: 'move', tx, ty, w, axis, range, speed, phase: phase || 0 }),
    fplat: (tx, ty, w) => A.plats.push({ kind: 'fall', tx, ty, w }),
    firebar: (tx, ty, len, speed, phase) => { set(tx, ty, 'U'); A.firebars.push({ tx, ty, len, speed, phase: phase || 0 }); },
    beam: (tx, y0, y1, period, phase) => A.beams.push({ tx, y0, y1, period: period || 180, phase: phase || 0 }),
    sign: (tx, ty, text, color) => A.signs.push({ tx, ty, text, color }),
    // World 2 helpers
    plank: (a, b, y) => { for (let x = a; x <= b; x++) set(x, y, '='); },
    crumble: (a, b, y) => { for (let x = a; x <= b; x++) set(x, y, 'K'); },
    puddle: (a, b, row) => A.patchesInit.push({ kind: 'puddle', a, b, row: row === undefined ? 13 : row }),
    butter: (a, b, row) => A.patchesInit.push({ kind: 'butter', a, b, row: row === undefined ? 13 : row }),
    boost: (tx, row) => A.boosts.push({ tx, row: row === undefined ? 13 : row }),
    decor: (kind, tx, row, extra) => A.decor.push(Object.assign({ kind, tx, row: row === undefined ? 13 : row }, extra || {})),
    // TOAST TRUCK parking spot (v0.9). Reusable for World 10's moon stretch later.
    rideTruck: (tx, ty) => { (A.toastTrucks = A.toastTrucks || []).push({ tx, ty }); },
    stone: (x, y) => set(x, y, 'X'),
    // v0.4 Bro helpers
    surface: (x) => { for (let y = 3; y < A.h; y++) if (A.t[y][x] !== '.' && A.t[y][x] !== 'o') return y; return A.h; },
    cage: (x, y) => { if (y === undefined){ y = T.surface(x) - 1; } set(x, y, 'C'); (A.cages = A.cages || []).push({ x, y }); },
    tank: (x, y) => set(x, y === undefined ? T.surface(x) - 1 : y, 'T'),
    gas: (x, y) => set(x, y === undefined ? T.surface(x) - 1 : y, 'F'),
    keg: (x, y) => set(x, y === undefined ? T.surface(x) - 1 : y, 'R'),
    // v0.5 World 3 helpers
    fridge: (x, y) => set(x, y === undefined ? T.surface(x) - 1 : y, 'W'),
    // hot coil floor run a..b on row (default 13); burns while glowing. period/phase in frames
    coil: (a, b, row, phase, period) => { const r = row === undefined ? 13 : row; for (let x = a; x <= b; x++) set(x, r, 'Q'); A.coils.push({ a, b, row: r, phase: phase || 0, period: period || 210 }); },
    // Fork in the Outlet: two outlets; a spark rests on one, then jumps along an arc to the other
    fork: (ax, ay, bx, by, period, phase) => { set(ax, ay, 'O'); set(bx, by, 'O'); A.forks.push({ ax, ay, bx, by, period: period || 150, phase: phase || 0 }); },
    // slot-reel platform (2 tiles wide) at tile tx,ty: shows a face, spins, lands on the next face
    reel: (tx, ty, faces, phase, show) => A.reels.push({ tx, ty, faces: faces || ['safe', 'bounce', 'safe', 'spike'], phase: phase || 0, show: show || 150 }),
    // v0.6 World 4 helpers
    // giant playing-card platform (2 tiles wide): face-up (solid) for `up` frames, flips face-down (fall through), flips back. period/phase in frames
    card: (tx, ty, phase, period, up, suit) => A.cards.push({ tx, ty, phase: phase || 0, period: period || 300, up: up || 190, suit: suit === undefined ? (tx % 4) : suit }),
    // Pop-Up toaster slot block (solid): launches a Pop-Up toward the bro every `period` frames when close
    toaster: (x, y, period, phase) => { const yy = y === undefined ? 12 : y; set(x, yy, 'Y'); A.toasters.push({ tx: x, ty: yy, period: period || 180, phase: phase || 0 }); },
    grease: (a, b, row) => A.patchesInit.push({ kind: 'grease', a, b, row: row === undefined ? 13 : row }),
    // grease vat a..b: fryer oil on row 13 over a steel floor (touch = hurt)
    vat: (a, b) => { for (let x = a; x <= b; x++){ set(x, 13, 'A'); set(x, 14, 'G'); } },
    // fryer basket: a moving platform that dips up and down over a vat
    basket: (tx, ty, w, range, speed, phase) => A.plats.push({ kind: 'move', tx, ty, w: w || 2, axis: 'y', range: range || 2, speed: speed || 0.03, phase: phase || 0, look: 'basket' }),
    stool: (x, y) => { set(x, y === undefined ? 10 : y, '='); A.decor.push({ kind: 'stool', tx: x, row: 13 }); },
    // diner booth: two vinyl seat blocks with a table (one-way) between them
    booth: (x) => { set(x, 12, 'X'); set(x + 3, 12, 'X'); set(x + 1, 11, '='); set(x + 2, 11, '='); A.decor.push({ kind: 'boothback', tx: x, row: 12 }); A.decor.push({ kind: 'boothback', tx: x + 3, row: 12 }); A.decor.push({ kind: 'stool', tx: x + 1, row: 13 }); },
    // v0.7 World 5 helpers
    // Pop-Up Spring: a solid paper-plate spring tile; landing on it launches you high (hold jump for more)
    spring: (x, y) => set(x, y === undefined ? T.surface(x) - 1 : y, 'J'),
    // cardboard crate (solid, safe perch above the butter tide)
    crate: (x, y) => set(x, y, 'X'),
    // puppet-string swing plank: hangs from a pivot (tx,ty top-left at rest), swings like a pendulum. len in px, amp in radians
    swing: (tx, ty, w, len, amp, speed, phase) => A.plats.push({ kind: 'move', tx, ty, w: w || 2, axis: 'swing', range: 0, len: len || 48, amp: amp || 0.6, speed: speed || 0.03, phase: phase || 0, look: 'swing' }),
    // melted-butter tide (World 5): floods from row `low` up to `high` on a cycle: calm, warn, rise, high, fall. frames
    tide: (opts) => { A.tide = Object.assign({ low: 15.2, high: 11, period: 600, calm: 260, warn: 90, rise: 70, hold: 110, phase: 0 }, opts || {}); },
    // v0.8 World 6 helpers
    // Glitch Door: walk into the magenta door at column ax, come out of the cyan door at column bx (by = row you stand on - 1, default: its floor)
    portal: (ax, bx, by) => (A.portals = A.portals || []).push(by === undefined ? { ax, bx } : { ax, bx, by }),
    // jam geyser: a w-tile column of grape jam in a bottomless pit; top row ty while it holds. Cycle in frames: idle, warn, rise, hold, sink
    geyser: (tx, w, ty, phase, cyc) => { const z = Object.assign({ idle: 70, warn: 40, rise: 24, hold: 150, sink: 30 }, cyc || {}); z.period = z.idle + z.warn + z.rise + z.hold + z.sink; A.pitFill = true;
      A.plats.push({ kind: 'move', tx, ty, w: w || 3, axis: 'geyser', range: 0, speed: 0, phase: phase || 0, gz: z }); },
    // RGB switch blocks: magenta walls (drop while the switch runs), cyan bridges (appear while it runs), the switch itself
    rgbM: (a, b, y0, y1) => { for (let x = a; x <= b; x++) for (let y = y0; y <= (y1 === undefined ? y0 : y1); y++) set(x, y, 'm'); },
    rgbC: (a, b, y0, y1) => { for (let x = a; x <= b; x++) for (let y = y0; y <= (y1 === undefined ? y0 : y1); y++) set(x, y, 'c'); },
    rgbSwitch: (x, y) => { set(x, y, 'Z'); A.hasSwitch = true; },
    // tells the autopilot: columns a..b need the switch running, and the switch for them is at column sw
    rgbZone: (a, b, sw) => (A.rgbZones = A.rgbZones || []).push({ a, b, sw }),
    // v0.9 World 7 helpers
    // Pusher shelf: a w-tile chrome shelf (top row ty) that slides right by `travel` tiles and back, with a dwell at each end (frames). It shoves you
    pusher: (tx, w, ty, travel, phase, cyc) => { const z = Object.assign({ dwell: 80, move: 100 }, cyc || {}); z.travel = travel * 16; z.period = 2 * (z.dwell + z.move); A.pitFill7 = true;
      A.plats.push({ kind: 'move', tx, ty, w: w || 3, axis: 'pusher', range: 0, speed: 0, phase: phase || 0, pz: z }); },
    // Claw crane: a prize tray hanging from a crane claw (top row ty at rest). It lifts `lift` tiles, carries you `travel` tiles right, lowers, and comes back
    claw: (tx, w, ty, lift, travel, phase, cyc) => { const z = Object.assign({ dwell: 90, up: 50, move: 110, down: 50 }, cyc || {}); z.lift = lift * 16; z.travel = travel * 16; z.period = 2 * (z.dwell + z.up + z.move + z.down);
      A.plats.push({ kind: 'move', tx, ty, w: w || 3, axis: 'claw', range: 0, speed: 0, phase: phase || 0, cz: z }); },
    // CRT platforms: a row of CRT screens (group 0 = magenta 'n', group 1 = cyan 'N'); solid only while that group's screens are on
    crt: (a, b, y, grp) => { A.hasCrt = true; for (let x = a; x <= b; x++) set(x, y, grp ? 'N' : 'n'); },
    // tells the autopilot: columns a..b are crossed on CRT platforms
    crtZone: (a, b) => (A.crtZones = A.crtZones || []).push({ a, b }),
    // a token shower from the ceiling when you pass column tx (tokens = score only)
    shower: (tx) => (A.showers = A.showers || []).push({ tx, done: false }),
    fig: (x, y) => set(x, y, 'g'), tix: (a, b, y) => { for (let x = a; x <= b; x++) set(x, y, 'k'); },
    // v1.0 World 8 helpers
    goo: (a, b, ty) => (A.goo = A.goo || []).push({ a, b, ty: ty === undefined ? 13 : ty }),
    cool: (a, b, ty, phase) => (A.coolPlates = A.coolPlates || []).push({ a, b, ty: ty === undefined ? 13 : ty, phase: phase || 0 }),
    belt: (tx, w, ty, dir, speed) => A.plats.push({ kind: 'move', tx, ty, w: w || 3, axis: 'belt', dir: dir || 1, bsp: speed || 0.85, range: 0, speed: 0, phase: 0, look: 'belt' }),
    beltZone: (a, b) => (A.beltZones = A.beltZones || []).push({ a, b }),
    crave: (x, y, kind) => (A.craves = A.craves || []).push({ x, y, kind, spawned: false }),
    // v1.1 World 9: Final Bite
    gold: (x, y, kind) => (A.golds = A.golds || []).push({ x, y, kind: kind || 'pat', spawned: false }),
    grill: (a, b, ty, phase) => (A.grills = A.grills || []).push({ a, b, ty: ty === undefined ? 13 : ty, phase: phase || 0 }),
    strike: (tx, period, phase) => (A.strikes = A.strikes || []).push({ tx, period: period || 150, phase: phase || 0 }),
    // v1.2 World 10: TherapyToaster to Mars
    fuel: (x, y) => (A.fuels = A.fuels || []).push({ x, y, spawned: false }),
    vent: (tx, period, phase, h) => (A.vents = A.vents || []).push({ tx, period: period || 160, phase: phase || 0, h: h || 4 }),
    meteor: (tx, period, phase) => (A.meteors = A.meteors || []).push({ tx, period: period || 170, phase: phase || 0 }),
    comm: (tx, text) => (A.comms = A.comms || []).push({ tx, text, done: false }),
    sep: (warnTx, sepTx) => { A.sep = { warnTx, sepTx, state: 'idle', t: 0 }; },
    brawl: (tx, waves) => (A.brawls = A.brawls || []).push({ tx, waves, wave: -1, active: false, done: false, t: 0, ids: [] }),
  };
  return T;
}
