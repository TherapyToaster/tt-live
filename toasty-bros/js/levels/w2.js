// World 2: TOASTER KART — four original levels (lore: /workspace/toasty-bros/lore/kart.md).
// Saturday-morning cartoon look. All place names are parodies; no real businesses or brands.
'use strict';
LEVEL_ORDER.push('2-1', '2-2', '2-3', '2-4');

// ---------------- 2-1 Monday Errands Suburb (day drifts to sunset) ----------------
LEVELS['2-1'] = { id: '2-1', world: 2, num: 1, name: 'MONDAY ERRANDS', time: 300, music: 'w2_suburb', start: { area: 'main', tx: 9 }, checkpoint: 118,
  build(){
    const W = 212, main = newArea('main', W, 'suburb'), T = areaTools(main);
    T.ground(0, 62); T.ground(66, 112); T.ground(116, 162); T.ground(166, W - 1);
    T.decor('truck', 0); // Coty's Toaster Truck, parked at the curb (plate: THERAPY TOASTER)
    T.q(14, 9); T.br(17, 9); T.q(18, 9, 'power'); T.br(19, 9); T.q(20, 9); T.br(21, 9); T.q(19, 5, 'coin');
    T.boost(25); T.en('crumb', 30); T.en('crumb', 33);
    T.decor('sign', 37, 13, { text: 'NO TRUCKS ON MONDAYS', color: '#FFD400' });
    T.en('truck', 45); T.puddle(48, 52);
    T.pipe(55, 2); T.en('crumb', 59);
    T.coin(63, 10); T.coin(64, 9); T.coin(65, 10);
    T.row(70, 76, 9); T.br(71, 9, 'multi'); T.q(73, 9, 'lightbar'); T.coins(71, 75, 5);
    T.en('truck', 86); T.boost(92); T.col(98, 1);
    T.puddle(101, 105); T.en('crumb', 103); T.en('crumb', 107); T.hid(108, 9, '1up');
    T.boost(109);
    T.col(121, 1); T.en('truck', 127); T.col(135, 1);
    T.puddle(138, 143); T.en('crumb', 141);
    T.row(146, 149, 9); T.q(147, 9, 'power'); T.en('truck', 156);
    T.en('crumb', 170); T.en('crumb', 172); T.puddle(174, 176);
    T.stairs(180, 8, true); T.col(188, 8);
    main.pole = { tx: 194 }; T.set(194, 12, 'S'); main.booth = { tx: 199, door: 202 };
    // v0.4: cages, gas cans by the curb, Rival Truck gunners
    T.cage(40); T.cage(95); T.cage(133);
    T.gas(80); T.gas(81); T.keg(81, 11); T.gas(132);
    T.en('gunner', 168);
    return { main };
  } };

// ---------------- 2-2 Toaster Tide Run (boardwalk, pier, under the pier) ----------------
LEVELS['2-2'] = { id: '2-2', world: 2, num: 2, name: 'TOASTER TIDE RUN', time: 300, music: 'w2_tide', start: { area: 'main', tx: 2 }, checkpoint: 132,
  build(){
    const W = 224, main = newArea('main', W, 'tide', { waterFloor: true }), T = areaTools(main);
    T.ground(0, 48);
    T.decor('shack', 5); // the bait shack (parody name: BAIT 'N' TOAST)
    T.en('crumb', 17); T.q(20, 9, 'power'); T.coins(22, 25, 9);
    T.butter(27, 31); T.en('truck', 38); T.en('crumb', 45);
    // Crumble Pier: one-way planks and planks that drop when you stand on them
    T.decor('sign', 49, 13, { text: 'CRUMBLE PIER', color: '#ffb3c8' });
    T.plank(49, 54, 13); T.crumble(58, 61, 13); T.plank(64, 70, 13); T.en('crumb', 68);
    T.plank(66, 69, 9); T.coins(66, 69, 8);
    T.crumble(73, 75, 12);
    T.ground(78, 96); T.q(82, 9); T.br(83, 9); T.q(84, 9, 'coin'); T.br(85, 9); T.en('crumb', 87); T.butter(89, 92);
    T.pipe(94, 2, { enter: true, botDown: true, to: { area: 'under', mode: 'drop', tx: 2 } });
    T.sign(98, 9, 'PIER CLOSED: GO UNDER', '#1b2a4a');
    // broken pier 97..127: only the under-pier route gets across
    T.ground(128, 150); T.pipe(129, 2, { exitPipe: true });
    T.en('crumb', 136); T.en('truck', 146);
    T.plank(151, 156, 13); T.en('crumb', 154); T.crumble(159, 162, 13);
    T.plank(165, 168, 13); T.plank(165, 168, 10); T.coins(165, 168, 9); T.crumble(171, 174, 13);
    T.ground(177, W - 1); T.q(181, 9); T.hid(183, 9, '1up'); T.butter(185, 189); T.en('truck', 193);
    T.stairs(198, 6, true); T.col(204, 6);
    main.pole = { tx: 210 }; T.set(210, 12, 'S'); main.booth = { tx: 214, door: 217 };
    T.cage(12); T.cage(140); T.cage(180); T.keg(34); T.keg(35); T.gas(35, 11); T.en('gunner', 186);
    // under the pier
    const under = newArea('under', 64, 'pier', { waterFloor: true, music: 'w2_under' }), U = areaTools(under);
    U.fill(0, 63, 0, 2, 'G'); U.fill(0, 0, 3, 12, 'G');
    U.ground(0, 10); U.coins(4, 8, 10);
    U.crumble(12, 15, 13); U.ground(17, 24); U.en('crumb', 24);
    U.crumble(26, 29, 13); U.plank(27, 31, 10); U.coins(27, 31, 8);
    U.ground(32, 45); U.q(34, 9, 'lightbar'); U.en('crumb', 45);
    U.crumble(47, 50, 13);
    U.ground(52, 63); U.fill(63, 63, 3, 12, 'G');
    U.pipe(58, 2, { enter: true, botDown: true, to: { area: 'main', mode: 'up', tx: 129, ty: 11 } });
    return { main, under };
  } };

// ---------------- 2-3 Skullz Graveyard (purple graveyard, pink sky, sky-style platforming) ----------------
LEVELS['2-3'] = { id: '2-3', world: 2, num: 3, name: 'SKULLZ GRAVEYARD', time: 300, music: 'w2_grave', start: { area: 'main', tx: 2 }, checkpoint: 111,
  build(){
    const W = 208, main = newArea('main', W, 'grave', { mistFloor: true }), T = areaTools(main);
    T.ground(0, 26); T.stone(8, 12); T.stone(12, 12); T.stone(12, 11); T.en('skel', 20); T.q(21, 9, 'power'); T.en('crumb', 24);
    T.plank(30, 33, 10); T.en('skel', 32, 9);
    T.mplat(35, 9, 2, 'x', 3, 0.025); T.plank(35, 37, 11); // v0.5: a stepping plank under the lift so a mistimed hop isn't a free death
    T.ground(42, 60); T.stone(46, 12); T.en('rlaunch', 51); T.coins(53, 56, 9); T.stone(55, 12); T.en('skel', 58);
    T.plank(62, 63, 11);
    T.roof(65, 76, 11); T.en('crumb', 74, 10); T.hid(72, 7, '1up'); T.stone(75, 10);
    // sky section over the misty drop
    T.plank(78, 82, 10); T.mplat(84, 10, 2, 'x', 2, 0.03);
    T.plank(90, 94, 10); T.en('skel', 92, 9); T.coins(90, 94, 7); T.fplat(96, 10, 2);
    T.plank(99, 103, 10); T.coins(99, 103, 8);
    T.roof(107, 120, 11); T.stone(110, 10); T.q(113, 7, 'lightbar'); T.en('skel', 117, 10); T.en('crumb', 119, 10);
    T.fplat(121, 10, 2);
    T.ground(124, 160); T.stone(128, 12); T.en('rlaunch', 133); T.stone(137, 12); T.stone(138, 12); T.stone(138, 11);
    T.en('skel', 142); T.row(144, 147, 9); T.q(145, 9, 'power'); T.en('skel', 149); T.en('crumb', 153); T.en('crumb', 155);
    T.ground(164, W - 1); T.en('skel', 168); T.en('rlaunch', 174);
    T.stairs(180, 8, true); T.col(188, 8);
    main.pole = { tx: 194 }; T.set(194, 12, 'S'); main.booth = { tx: 198, door: 201 };
    T.cage(16); T.cage(70); T.cage(158); T.tank(130); T.gas(131); T.en('gunner', 191); // v0.5: moved off the gap's landing spot to guard the flag
    return { main };
  } };

// ---------------- 2-4 Toaster Fortress (junkyard on the high-rise bridge) + THE GRAND TOASTER ----------------
LEVELS['2-4'] = { id: '2-4', world: 2, num: 4, name: 'TOASTER FORTRESS', time: 300, music: 'w2_castle', start: { area: 'main', tx: 2 }, checkpoint: 78,
  build(){
    const W = 216, main = newArea('main', W, 'fortress', { waterFloor: true, flameVents: true }), T = areaTools(main);
    T.ground(0, 30); T.stone(8, 12); T.stone(12, 12); T.stone(12, 11); T.en('truck', 21); T.col(27, 1);
    T.mplat(31, 10, 2, 'x', 2, 0.03);
    T.ground(36, 70); T.beam(40, 10, 12, 150, 0); T.butter(44, 48); T.en('rlaunch', 52); T.stone(56, 12); T.stone(57, 12); T.stone(57, 11);
    T.en('crumb', 61); T.beam(64, 10, 12, 150, 75); T.q(67, 9, 'power');
    T.fplat(72, 10, 2);
    T.ground(76, 110); T.col(81, 1); T.en('truck', 87); T.col(93, 1); T.en('truck', 99); T.q(102, 9, 'lightbar'); T.beam(106, 10, 12, 160, 40);
    T.mplat(111, 10, 2, 'x', 3, 0.025);
    T.ground(117, 138); T.en('rlaunch', 123); T.butter(126, 130); T.stone(133, 12); T.en('crumb', 135);
    // boss arena (one screen, camera locks at tx 141)
    T.ground(139, W - 1);
    // v0.4: sealed wall behind the arena -> TOASTED! escape run to the exit
    T.fill(157, 158, 3, 12, 'S'); main.escapeWall = { x0: 157, x1: 158, y0: 3, y1: 12 };
    T.tank(164); T.gas(165); T.stone(170, 12); T.stone(171, 12); T.stone(171, 11); T.row(176, 181, 9, 'B'); T.tank(185); T.col(190, 1); T.stone(196, 12); T.gas(200);
    main.exitTx = 208; T.sign(208, 9, 'EXIT', '#00ff66');
    T.cage(5); T.cage(90); T.cage(120); T.tank(46); T.tank(47); T.gas(47, 11); T.en('gunner', 129);
    main.boss = { kind: 'toaster', tx: 151, deckRow: 13, trigger: 142, lockTx: 141, bounds: [141, 156],
      line1: 'NICE CHROME, BIG GUY.', line2: 'TIME FOR A RECALL!!!' };
    return { main };
  } };
