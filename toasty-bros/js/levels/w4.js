// World 4: TOASTER CARDS — a grimy 24-hour diner at 3 a.m. (lore: lore/cards.md, game: BURNT OFFERINGS). Original level designs.
// Jam is always grape purple. No real brands, no money, no gore.
'use strict';
LEVEL_ORDER.push('4-1', '4-2', '4-3', '4-4');

// ---------------- 4-1 Diner Floor (fluorescents flicker the room dark in rhythm) ----------------
LEVELS['4-1'] = { id: '4-1', world: 4, num: 1, name: 'DINER FLOOR', time: 300, music: 'w4_diner', start: { area: 'main', tx: 3 }, checkpoint: 98,
  build(){
    const W = 206, main = newArea('main', W, 'diner'), T = areaTools(main);
    main.flicker = { period: 420, dark: 100 };
    T.ground(0, 44); T.decor('neon24', 6, 13); T.decor('window', 17, 4); T.decor('clock', 26, 3); T.decor('lamp', 30, 1, { lit: true });
    T.sign(4, 6, 'NOW SERVING: CRUMBS', '#ff37cf');
    T.en('rat', 16); T.stool(20); T.stool(22); T.stool(24); T.q(22, 6, 'jam'); T.coins(20, 24, 8);
    T.en('crouton', 29); T.decor('jukebox', 32, 13); T.en('rat', 36); T.booth(38);
    T.ground(48, 92); T.decor('mop', 50, 13); T.en('mold', 57); T.decor('window', 58, 4); T.booth(62);
    T.en('crouton', 68); T.br(69, 9); T.q(70, 9, 'power'); T.br(71, 9); T.decor('cert', 72, 4);
    T.en('rat', 76); T.decor('crumbomat', 79, 13); T.fridge(84); T.en('mold', 88); T.cage(90);
    T.ground(96, 150); T.decor('payphone', 98, 13); T.decor('lamp', 100, 1, { lit: true }); T.en('mold', 105); T.stool(108); T.stool(110);
    T.en('crouton', 113); T.row(116, 119, 9); T.q(117, 9, 'bell'); T.decor('window', 120, 4);
    T.en('rat', 123); T.en('rat', 127); T.booth(130); T.decor('jukebox', 136, 13); T.en('mold', 140); T.gas(144); T.cage(147);
    T.ground(154, W - 1); T.stool(151, 11); T.en('crouton', 160); T.en('rat', 165); T.decor('norefunds', 167, 6); T.en('crouton', 170);
    T.stairs(174, 6, true); T.col(180, 6);
    main.pole = { tx: 186 }; T.set(186, 12, 'S'); main.booth = { tx: 191, door: 194 };
    T.cage(14);
    return { main };
  } };

// ---------------- 4-2 Kitchen + Grease Trap (grease vats, slick floors, fryer baskets, Pop-Ups, Toast Ghosts) ----------------
LEVELS['4-2'] = { id: '4-2', world: 4, num: 2, name: 'KITCHEN + GREASE TRAP', time: 300, music: 'w4_kitchen', start: { area: 'main', tx: 3 }, checkpoint: 104,
  build(){
    const W = 210, main = newArea('main', W, 'kitchen'), T = areaTools(main);
    T.ground(0, 30); T.sign(4, 7, 'STAFF ONLY: HOT GREASE', '#ffd400'); T.decor('ticket', 6, 3);
    T.toaster(14, 12, 200, 60); T.grease(18, 24); T.en('ghost', 26, 8); T.decor('fryer', 27, 13);
    T.vat(31, 33); T.ground(34, 70);
    T.toaster(42, 12, 180, 40); T.en('cook', 50); T.grease(53, 59); T.q(56, 9, 'jam'); T.en('ghost', 62, 8); T.decor('fryer', 64, 13);
    T.vat(71, 76); T.basket(72, 11, 2, 2, 0.035, 0); T.coins(72, 73, 7);
    T.ground(77, 120); T.toaster(84, 12, 170, 0); T.cage(90); T.toaster(96, 12, 170, 85); T.decor('ticket', 98, 3);
    T.en('cook', 104); T.en('ghost', 108, 8); T.grease(110, 116); T.gas(118);
    T.vat(121, 124); T.basket(122, 11, 2, 2, 0.03, 1.5);
    T.ground(125, 170); T.en('rat', 130); T.toaster(136, 12, 160, 30); T.en('ghost', 144, 7); T.br(147, 9); T.q(148, 9, 'power'); T.br(149, 9);
    T.grease(152, 158); T.en('cook', 162); T.decor('fryer', 165, 13);
    T.vat(171, 175); T.basket(172, 11, 2, 2, 0.035, 0.8);
    T.ground(176, W - 1); T.cage(178); T.stairs(180, 5, true); T.col(185, 5);
    main.pole = { tx: 190 }; T.set(190, 12, 'S'); main.booth = { tx: 195, door: 198 };
    return { main };
  } };

// ---------------- 4-3 The Last Booth (giant cards flip face-up / face-down on a timer) ----------------
LEVELS['4-3'] = { id: '4-3', world: 4, num: 3, name: 'THE LAST BOOTH', time: 300, music: 'w4_booth', start: { area: 'main', tx: 3 }, checkpoint: 86,
  build(){
    const W = 214, main = newArea('main', W, 'booth'), T = areaTools(main);
    T.ground(0, 30); T.sign(4, 7, 'FACE-DOWN CARDS WONT HOLD YOU', '#ff37cf'); T.decor('lamp', 10, 1, { lit: true });
    T.en('knight', 18); T.en('slice', 26);
    T.card(32, 11, 40, 300, 210); T.card(35, 11, 0, 300, 210);
    T.ground(38, 75); T.q(46, 9, 'jam'); T.en('bagel', 50, 8); T.en('knight', 56); T.en('knight', 59); T.en('cook', 68); T.cage(72);
    T.card(77, 11, 110, 300, 210); T.card(80, 10, 70, 300, 210); T.card(83, 11, 30, 300, 210); // the wave flips left-to-right: it chases you
    T.ground(86, 125); T.en('slice', 92); T.en('bagel', 100, 8); T.br(102, 9); T.q(103, 9, 'bell'); T.br(104, 9); T.en('knight', 108); T.tank(114); T.en('cook', 120);
    T.card(127, 11, 100, 320, 220); T.card(130, 11, 55, 320, 220); T.card(133, 11, 10, 320, 220);
    T.ground(136, W - 1); T.en('slice', 144); T.en('bagel', 150, 8); T.en('knight', 158); T.en('knight', 161); T.q(164, 9, 'power'); T.cage(168);
    T.stairs(176, 6, true); T.col(182, 6);
    main.pole = { tx: 188 }; T.set(188, 12, 'S'); main.booth = { tx: 193, door: 196 };
    T.cage(12);
    return { main };
  } };

// ---------------- 4-4 The Repairman's Shop: THE FUSE BOX (mini-boss) + CAL'S EVIL RERUN ----------------
LEVELS['4-4'] = { id: '4-4', world: 4, num: 4, name: "THE REPAIRMAN'S SHOP", time: 300, music: 'w4_repair', start: { area: 'main', tx: 2 }, checkpoint: 108,
  build(){
    const W = 226, main = newArea('main', W, 'repair'), T = areaTools(main);
    T.fill(0, W - 1, 0, 2, 'G');
    T.ground(0, 40); T.sign(5, 9, 'REPAIRS: NO REFUNDS', '#ffd400'); T.decor('crts', 9, 13, { n: 3 }); T.en('knight', 16); T.en('slice', 24); T.toaster(30, 12, 200, 0); T.en('ghost', 36, 8);
    T.decor('bench', 18, 13);
    T.ground(44, 105); T.en('cook', 50); T.en('bagel', 58, 8); T.en('rat', 62); T.q(66, 9, 'jam'); T.decor('crts', 70, 13, { n: 4 }); T.en('crouton', 74);
    T.card(80, 11, 0, 300, 200, 3); T.ground(82, 105); T.set(78, 13, '.'); T.set(79, 13, '.'); T.set(78, 14, '.'); T.set(79, 14, '.'); T.set(80, 13, '.'); T.set(81, 13, '.'); T.set(80, 14, '.'); T.set(81, 14, '.');
    T.decor('crts', 86, 13, { n: 2 });
    // THE FUSE BOX: mounted on a steel gate; blow it to open the way. While it lives the picture flips left/right on a timer
    T.fill(104, 105, 3, 12, 'S'); T.en('fusebox', 102, 12, { gate: { x0: 104, x1: 105, y0: 3, y1: 12 } });
    T.ground(106, 158); T.cage(110); T.en('knight', 118); T.en('slice', 126); T.decor('crts', 128, 13, { n: 3 }); T.en('cook', 134); T.q(140, 9, 'power'); T.en('bagel', 146, 8); T.decor('bench', 150, 13);
    T.ground(159, W - 1);
    // boss arena (one screen, camera locks at tx 160)
    T.fill(176, 177, 3, 12, 'S'); main.escapeWall = { x0: 176, x1: 177, y0: 3, y1: 12 };
    T.decor('crts', 160, 13, { n: 4 }); T.decor('crts', 172, 13, { n: 3 });
    T.fridge(184); T.gas(185); T.tank(190); T.row(194, 198, 9, 'B'); T.fridge(202); T.tank(203); T.gas(207);
    main.exitTx = 216; T.sign(216, 9, 'EXIT', '#00ff66');
    T.cage(20); T.cage(92); T.cage(154);
    main.boss = { kind: 'repairman', tx: 171, deckRow: 13, trigger: 161, lockTx: 160, bounds: [160, 175],
      line1: "YOU'RE NOT CAL. YOU'RE A RERUN,", line2: 'AND ALL REPAIRS ARE FINAL!!!',
      calLine1: "WAIT... THAT'S MY FACE?!", calLine2: 'NOBODY RERUNS CAL!!!' };
    return { main };
  } };
