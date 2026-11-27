// World 10: THERAPYTOASTER TO MARS (v1.2, the final world). Lore: lore/originals.md (flight + landing) blended with
// platforming. 10-1 Launch Pad (platformer against a timed launch window), 10-2 Moonbase (a TOAST TRUCK drive: Moon
// first), 10-3 Board the Ship (docking, then the ship interior and the booster separation), 10-4 Mars (a graded
// landing, then the Mars castle and the final boss YELLOW BLANKEY / CYBER_BOY). ACID is mission control.
// Every hazard costs 1 heart; pits and the timer stay instant. No agency or rocket-company names or logos.
'use strict';
LEVEL_ORDER.push('10-1', '10-2', '10-3', '10-4');

// ---------------- 10-1 Launch Pad (gulf coast at dusk; the level timer is the launch window) ----------------
LEVELS['10-1'] = { id: '10-1', world: 10, num: 1, name: 'LAUNCH PAD', time: 240, launchWindow: true, music: 'w10_pad', start: { area: 'main', tx: 3 }, checkpoint: 104,
  build(){
    const W = 204, main = newArea('main', W, 'mpad'), T = areaTools(main);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.ground(0, W - 1);
    T.decor('acid10', 0, 12); T.comm(2, "ACID: LAUNCH WINDOW IS OPEN. DON'T BE LATE.");
    T.decor('dish10', 7, 12); T.sign(5, 7, 'LAUNCH PAD. BEAT THE WINDOW.', '#d7c36a');
    T.en('crawl10', 16); T.q(19, 9, 'power'); T.fuel(22, 10); T.en('drone10', 26, 9);
    T.decor('tower10', 30, 12, { h: 120 }); T.col(32, 3); T.fuel(32, 8);
    T.sign(35, 8, 'VENTS: WAIT FOR THE PUFF', '#ece8e1'); T.vent(38, 160, 0);
    T.br(42, 9); T.q(43, 9, 'jam'); T.br(44, 9); T.cage(47); T.en('crawl10', 50);
    pit(54, 56); T.fuel(55, 9);
    T.en('drone10', 60, 8); T.stairs(64, 3, true); T.stairs(67, 3, false);
    T.vent(72, 160, 60); T.vent(76, 160, 110);
    T.comm(78, 'ACID: FUEL CANS = MORE BURN FOR THE LANDING.');
    T.en('crawl10', 84); T.q(88, 9, 'star'); T.decor('fuelTank10', 90, 12); T.en('drone10', 94, 9);
    pit(98, 100); T.fuel(99, 9);
    T.decor('tower10', 108, 12, { h: 150 }); T.col(110, 3); T.en('crawl10', 116);
    T.vent(120, 140, 0); T.cage(124); T.en('drone10', 128, 8); T.vent(132, 140, 70); T.fuel(136, 10);
    T.br(140, 9); T.q(141, 9, 'power'); T.br(142, 9); T.en('crawl10', 146);
    T.comm(150, "ACID: MOON FIRST, THEN THE SHIP. I'LL BE HERE IF YOU MISS.");
    T.stairs(158, 5, true); T.col(164, 6); T.q(168, 9, 'card');
    T.decor('banner10', 166, 3, { w: 72, text: 'LAUNCH PAD' });
    main.pole = { tx: 176 }; T.set(176, 12, 'S'); main.booth = { tx: 181, door: 184 };
    T.decor('tower10', 188, 12, { h: 170 }); T.decor('rocket10', 191, 12, { h: 160, steam: true });
    T.cage(12);
    return { main };
  } };

// ---------------- 10-2 Moonbase (a TOAST TRUCK drive across the Moon; the truck stays at the Moon dock) ----------------
LEVELS['10-2'] = { id: '10-2', world: 10, num: 2, name: 'MOONBASE', time: 300, startTruck: true, music: 'w10_moon', start: { area: 'main', tx: 4 }, checkpoint: 104,
  build(){
    const W = 220, main = newArea('main', W, 'mmoon'), T = areaTools(main);
    const crater = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.ground(0, W - 1);
    T.rideTruck(2); T.comm(3, 'ACID: THE MARS BASE DOES NOT TAKE TRUCKS. MOON FIRST. I MADE A SIGN.');
    T.decor('sign10', 9, 12, { text: 'MARS BASE: NO TRUCKS. MOON FIRST.' }); T.decor('hab10', 16, 12, { w: 48, text: 'MOONBASE' });
    crater(24, 26); T.decor('crater10', 32, 12, { w: 40 }); T.comm(28, 'ACID: PRETTY CRATER. USELESS CRATER.');
    T.en('crawl10', 40); T.meteor(46, 170, 0); T.en('drone10', 52, 10); T.fuel(55, 9);
    crater(60, 63); T.en('crawl10', 70); T.decor('dish10', 72, 12); T.meteor(78, 170, 60);
    T.decor('crater10', 84, 12, { w: 32 }); T.en('crawl10', 90); crater(96, 99);
    T.en('drone10', 108, 10); T.meteor(112, 150, 30); T.fuel(115, 9); T.en('crawl10', 120);
    crater(130, 133); T.decor('hab10', 138, 12, { w: 64 }); T.meteor(150, 150, 90); T.en('crawl10', 156); T.en('drone10', 162, 10);
    crater(168, 170); T.decor('crater10', 174, 12, { w: 32 });
    T.comm(176, 'ACID: PARK IT AT THE DOCK. THE TRUCK STAYS ON THE MOON.');
    T.decor('sign10', 180, 12, { text: 'MOON DOCK: TRUCKS PARK HERE' });
    main.pole = { tx: 190 }; T.set(190, 12, 'S'); main.booth = { tx: 195, door: 198 };
    T.decor('rocket10', 205, 12, { h: 150 }); T.decor('tower10', 202, 12, { h: 160 });
    T.cage(12);
    return { main };
  } };

// ---------------- 10-3 Board the Ship (dock the capsule, cross the ship, beat the booster separation) ----------------
LEVELS['10-3'] = { id: '10-3', world: 10, num: 3, name: 'BOARD THE SHIP', time: 300, music: 'w10_ship', start: { area: 'dock', tx: 2 }, cpArea: 'main', checkpoint: 96,
  build(){
    // docking (one locked screen): fly around the debris and ease into the port, slowly
    const dock = newArea('dock', 16, 'morbit', { camLock: true, music: 'w10_flight' }), D = areaTools(dock);
    D.fill(0, 15, 0, 0, 'X'); D.fill(0, 15, 14, 14, 'X'); D.fill(0, 0, 0, 14, 'X');
    D.fill(14, 15, 1, 13, 'S'); D.set(14, 6, '.'); D.set(14, 7, '.'); // ship hull with the docking port at rows 6-7
    D.fill(7, 7, 3, 9, 'X'); // drifting debris
    dock.flight = { mode: 'dock', sx: 2 * 16 + 2, sy: 7 * 16, fuel: 100, port: { tx: 14, ty0: 6, ty1: 7 }, next: 'main', exitTx: 3,
      way: [[4 * 16, 11 * 16], [10 * 16, 11 * 16], [11 * 16, 6 * 16 + 8], [14 * 16 + 8, 6 * 16 + 8]] };
    // the ship interior
    const W = 196, main = newArea('main', W, 'mship'), T = areaTools(main);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.ground(0, W - 1); T.fill(0, W - 1, 0, 1, 'S');
    T.comm(3, 'ACID: DOCKED. NOW GET TO THE FRONT OF THE SHIP.');
    T.decor('console10', 6, 12); T.decor('window10', 10, 5, { view: 'earth' });
    T.en('drone10', 16, 9); T.fuel(19, 10); T.q(21, 9, 'power'); T.en('crawl10', 26); T.vent(30, 160, 0);
    T.br(34, 9); T.q(35, 9, 'jam'); T.br(36, 9); T.cage(40); T.en('crawl10', 44);
    pit(48, 50); T.decor('window10', 54, 5, { view: 'earth' }); T.vent(58, 160, 50); T.vent(62, 160, 100); T.en('drone10', 66, 8); T.fuel(70, 10);
    T.stairs(74, 3, true); T.stairs(77, 3, false); T.en('crawl10', 84); T.q(88, 9, 'star');
    T.en('drone10', 100, 9); T.vent(104, 140, 0); T.cage(108); T.en('crawl10', 112); T.fuel(116, 10);
    pit(120, 122); T.en('drone10', 126, 9); T.decor('console10', 130, 12); T.decor('window10', 132, 5, { view: 'mars' });
    T.comm(134, 'ACID: BOOSTER SEP COMING. STAY AHEAD OF THE LINE.');
    T.sep(140, 148); T.decor('lights10', 145, 12, { w: 48 }); T.sign(146, 7, 'STAGE LINE', '#d7c36a');
    T.stairs(158, 5, true); T.col(164, 6); T.q(168, 9, 'card');
    main.pole = { tx: 176 }; T.set(176, 12, 'S'); main.booth = { tx: 181, door: 184 };
    T.cage(12);
    return { dock, main };
  } };

// ---------------- 10-4 Mars (graded landing, the Mars castle, YELLOW BLANKEY / CYBER_BOY: 12 HP, 3 phases) ----------------
LEVELS['10-4'] = { id: '10-4', world: 10, num: 4, name: 'MARS', time: 400, music: 'w10_mars', start: { area: 'land', tx: 1 }, cpArea: 'main', checkpoint: 104,
  build(){
    // the landing (one locked screen): TEXTBOOK / PINPOINT / HARD LANDING / DEAD STICK
    const land = newArea('land', 16, 'mland', { camLock: true, music: 'w10_flight' }), L = areaTools(land);
    L.fill(0, 15, 13, 14, 'G'); L.fill(0, 0, 0, 12, 'X'); L.fill(0, 15, 0, 0, 'X');
    L.fill(15, 15, 7, 12, 'S'); L.fill(14, 14, 10, 12, 'S'); // a tower at the right edge
    L.decor('crater10', 3, 12, { w: 40 }); L.decor('pad10', 9, 12, { w: 48 }); L.decor('icecap10', 11, 2);
    land.flight = { mode: 'land', sx: 1 * 16 + 4, sy: 1 * 16 + 2, svx: 0.6, fuel: 70, g: 0.035, pad: { a: 9, b: 11 }, crater: { a: 3, b: 5 }, next: 'main', exitTx: 3 };
    // the Mars castle
    const W = 232, main = newArea('main', W, 'mcastle'), T = areaTools(main);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.fill(0, W - 1, 0, 1, 'G'); T.ground(0, W - 1);
    T.comm(3, 'ACID: YOU ARE ON MARS. SOMETHING YELLOW IS WAITING IN THE CASTLE.'); T.decor('flag10', 1, 12);
    T.en('crawl10', 14); T.vent(20, 150, 0); T.q(24, 9, 'power'); T.en('drone10', 28, 9); T.fuel(31, 10);
    T.br(36, 9); T.q(37, 9, 'jam'); T.br(38, 9); T.cage(42); T.en('crawl10', 46); pit(50, 52);
    T.vent(56, 150, 40); T.vent(60, 150, 90); T.en('drone10', 64, 8); T.decor('torch10', 66, 8);
    T.stairs(70, 3, true); T.stairs(73, 3, false); T.en('crawl10', 80); T.q(84, 9, 'star');
    pit(88, 90); T.en('drone10', 96, 9);
    T.vent(108, 140, 0); T.cage(112); T.en('crawl10', 116); T.decor('torch10', 118, 8); T.fuel(120, 10); T.en('drone10', 124, 8);
    T.vent(130, 140, 60); T.br(136, 9); T.q(137, 9, 'jam'); T.br(138, 9); T.en('crawl10', 142); pit(146, 148);
    T.comm(150, 'ACID: LAST DOOR. TOUGHEST ONE YET. WATCH THE TELLS.');
    // boss arena (one screen, camera locks at tx 160)
    T.fill(176, 177, 2, 12, 'S'); main.escapeWall = { x0: 176, x1: 177, y0: 2, y1: 12 };
    T.decor('banner10', 162, 3, { w: 96, text: 'YELLOW BLANKEY' }); T.decor('torch10', 161, 8); T.decor('torch10', 174, 8);
    T.fridge(184); T.gas(185); T.tank(190); T.row(194, 198, 9, 'B'); T.fridge(202); T.tank(203); T.gas(207);
    main.exitTx = 216; T.sign(216, 9, 'EXIT', '#00ff66');
    T.cage(12);
    main.boss = { kind: 'blankey', tx: 171, deckRow: 13, trigger: 161, lockTx: 160, bounds: [160, 175],
      line1: 'WELCOME TO MARS. I GOT HERE FIRST.', line2: 'BLANKEY UP. CYBER_BOY ONLINE. TOASTED!',
      fcLine1: 'A BLANKET? I WILL NAP AFTER THIS.', fcLine2: 'TUCK THIS IN. TOASTED!' };
    return { land, main };
  } };
