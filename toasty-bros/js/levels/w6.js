// World 6: MR. TOASTY'S CRYPT: a haunted glitch crypt under Toast Town, half tomb and half busted server room (lore: lore/crypt.md).
// Original level designs. One gimmick per level: Glitch Doors (6-1), jam geysers (6-2), the RGB switch (6-3); the Quartz King waits in 6-4.
// Floors end at a mausoleum gate you walk into. Jam is always grape purple. No real brands, no money, no gore.
'use strict';
LEVEL_ORDER.push('6-1', '6-2', '6-3', '6-4');

// ---------------- 6-1 Crypt Halls (Glitch Doors: sealed walls you can't jump; step into the magenta door, out of the cyan one) ----------------
LEVELS['6-1'] = { id: '6-1', world: 6, num: 1, name: 'CRYPT HALLS', time: 300, music: 'w6_halls', start: { area: 'main', tx: 3 }, checkpoint: 100,
  build(){
    const W = 212, main = newArea('main', W, 'cryhall'), T = areaTools(main);
    T.fill(0, W - 1, 0, 2, 'G'); T.ground(0, W - 1);
    const wall = (x0, x1) => T.fill(x0, x1, 3, 12, 'S');
    T.sign(5, 6, 'GLITCH DOORS: STEP IN!', '#FFD400'); T.decor('cobweb', 0, 3); T.decor('portrait', 9, 5, { v: 0 }); T.decor('candles', 13, 13);
    T.en('bend', 18); T.decor('crts', 21, 13, { n: 3 }); T.q(24, 9, 'sauce'); T.en('rtoast', 30); T.decor('chains', 33, 6);
    wall(40, 41); T.portal(39, 42); // door #1
    T.decor('portrait', 45, 5, { v: 1 }); T.en('glitchl', 50); T.br(53, 9); T.q(54, 9, 'power'); T.br(55, 9); T.cage(58); T.tank(62); T.en('bend', 66); T.decor('vend', 69, 13);
    T.set(72, 13, '.'); T.set(72, 14, '.'); T.set(73, 13, '.'); T.set(73, 14, '.'); // a little floor gap
    T.en('sskull', 78, 8); T.decor('candles', 80, 13); T.en('rtoast', 86);
    wall(92, 93); T.portal(91, 95, 7); T.fill(95, 101, 8, 8, 'S'); T.cage(99, 7); T.coins(96, 98, 7); // door #2 drops you on a high crypt shelf (a caged bro waits up there)
    T.decor('portrait', 104, 5, { v: 2 }); T.en('bend', 108); T.en('glitchl', 114); T.q(118, 9, 'jam'); T.gas(122); T.decor('crts', 125, 13, { n: 2 }); T.en('bblob', 130);
    T.set(134, 13, '.'); T.set(134, 14, '.'); T.set(135, 13, '.'); T.set(135, 14, '.'); T.set(136, 13, '.'); T.set(136, 14, '.');
    wall(142, 143); T.portal(141, 144); // door #3
    T.en('sskull', 150, 7); T.en('rtoast', 156); T.decor('banner6', 158, 4, { w: 64, text: 'THE CRYPT' }); T.cage(162); T.en('glitchl', 168); T.decor('chains', 170, 6);
    T.stairs(176, 6, true); T.col(182, 6);
    main.pole = { tx: 188 }; T.set(188, 12, 'S'); main.booth = { tx: 193, door: 196 };
    T.cage(12);
    return { main };
  } };

// ---------------- 6-2 Jam Kitchen Pits (jam geysers erupt on a cycle: ride the grape jam over the bottomless pits) ----------------
LEVELS['6-2'] = { id: '6-2', world: 6, num: 2, name: 'JAM KITCHEN PITS', time: 300, music: 'w6_jam', start: { area: 'main', tx: 3 }, checkpoint: 104,
  build(){
    const W = 220, main = newArea('main', W, 'cryjam'), T = areaTools(main);
    T.sign(5, 7, 'RIDE THE JAM GEYSERS!', '#FFD400'); T.decor('jamjar', 10, 13); T.decor('cobweb', 0, 3);
    T.ground(0, 30); T.en('bblob', 16); T.q(20, 9, 'sauce'); T.en('bend', 25); T.decor('candles', 27, 13);
    T.geyser(33, 4, 12, 0); // pit 31..38
    T.ground(39, 70); T.en('rtoast', 46); T.decor('jamjar', 49, 13); T.br(52, 9); T.q(53, 9, 'power'); T.br(54, 9); T.tank(59); T.cage(62); T.en('bblob', 65);
    T.geyser(73, 4, 12, 160); // pit 71..78
    T.ground(79, 114); T.en('bend', 86); T.en('fbun', 92); T.decor('vend', 95, 13); T.cage(97); T.q(99, 9, 'jam'); T.gas(102); T.en('bblob', 106);
    T.geyser(117, 4, 12, 0); T.geyser(123, 4, 12, -80); // a double pit 115..128: the second geyser goes up while you ride the first
    T.ground(129, W - 1); T.en('rtoast', 136); T.decor('jamjar', 140, 13); T.en('bend', 146); T.q(150, 9, 'sauce'); T.en('bblob', 156); T.cage(160); T.en('fbun', 166); T.decor('candles', 168, 13);
    T.stairs(176, 6, true); T.col(182, 6);
    main.pole = { tx: 188 }; T.set(188, 12, 'S'); main.booth = { tx: 193, door: 196 };
    T.cage(12);
    return { main };
  } };

// ---------------- 6-3 Glitch Mainframe (the RGB switch: cyan bridges switch on and magenta walls drop, for a few seconds) ----------------
LEVELS['6-3'] = { id: '6-3', world: 6, num: 3, name: 'GLITCH MAINFRAME', time: 300, music: 'w6_frame', start: { area: 'main', tx: 3 }, checkpoint: 98,
  build(){
    const W = 214, main = newArea('main', W, 'cryframe'), T = areaTools(main);
    T.fill(0, W - 1, 0, 2, 'G'); T.ground(0, W - 1);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, 'c'); T.set(x, 14, '.'); } }; // a cyan bridge over a bottomless gap
    T.sign(4, 6, 'HIT THE RGB SWITCH!', '#FFD400'); T.decor('server', 8, 13, { h: 5 }); T.decor('cables', 12, 3);
    T.en('glitchl', 18); T.q(21, 9, 'sauce'); T.decor('crts', 24, 13, { n: 3 });
    T.rgbSwitch(30, 12); pit(34, 41); T.rgbZone(34, 41, 30); T.decor('server', 43, 13, { h: 4 }); // bridge #1
    T.en('sskull', 48, 7); T.br(51, 9); T.q(52, 9, 'power'); T.br(53, 9); T.cage(56); T.en('glitchl', 60); T.tank(63);
    T.rgbSwitch(66, 12); T.rgbM(70, 70, 3, 12); T.rgbZone(70, 70, 66); // a magenta firewall
    T.decor('cables', 74, 3); T.en('rtoast', 80); T.decor('server', 84, 13, { h: 5 }); T.q(88, 9, 'jam'); T.en('sskull', 92, 7); T.gas(94); T.cage(97);
    T.rgbSwitch(102, 12); T.rgbM(106, 106, 3, 12); pit(110, 117); T.rgbZone(106, 117, 102); // firewall + bridge on one switch
    T.en('glitchl', 122); T.decor('crts', 125, 13, { n: 2 }); T.en('bend', 130); T.q(134, 9, 'sauce');
    T.rgbSwitch(138, 12); pit(142, 147); T.rgbC(149, 152, 10); T.cage(151, 9); T.rgbZone(142, 147, 138); // a cyan shelf (with a caged bro) only exists while the switch runs
    T.en('sskull', 156, 7); T.en('rtoast', 160); T.decor('server', 164, 13, { h: 4 }); T.cage(168);
    T.stairs(174, 6, true); T.col(180, 6);
    main.pole = { tx: 186 }; T.set(186, 12, 'S'); main.booth = { tx: 191, door: 194 };
    T.cage(12);
    return { main };
  } };

// ---------------- 6-4 Toaster-Core Castle: THE QUARTZ KING ----------------
// Lore: deep under the crypt, a magma toaster core. The Quartz King (a weathered stone skull with a crown of pink quartz points,
// from the top shelf of the skull collection) rules from his slab. Every hit snaps a point off his crown.
LEVELS['6-4'] = { id: '6-4', world: 6, num: 4, name: 'TOASTER-CORE CASTLE', time: 300, music: 'w6_core', start: { area: 'main', tx: 2 }, checkpoint: 104,
  build(){
    const W = 228, main = newArea('main', W, 'crycore'), T = areaTools(main);
    T.fill(0, W - 1, 0, 2, 'G');
    const magma = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, 'A'); T.set(x, 14, 'G'); } };
    T.ground(0, 38); T.sign(5, 7, 'THE QUARTZ KING AWAITS', '#FFD400'); T.decor('coilglow', 9, 13); T.en('fbun', 16); T.en('rtoast', 22); T.q(25, 9, 'sauce'); T.decor('chains', 28, 6); magma(30, 31); T.en('bend', 34);
    T.fill(38, 39, 3, 12, 'S'); T.portal(37, 40); // a Glitch Door through the core wall
    T.ground(40, 66); T.en('sskull', 46, 7); T.br(49, 9); T.q(50, 9, 'power'); T.br(51, 9); T.cage(54); T.en('fbun', 58); magma(61, 62); T.tank(65);
    T.geyser(69, 4, 12, 0); // a magma-jam geyser over pit 67..74
    T.ground(75, 104); T.en('glitchl', 82); T.decor('coilglow', 85, 13); T.en('bblob', 90); T.q(94, 9, 'jam'); T.gas(96); T.cage(99);
    T.rgbSwitch(104, 12); T.rgbM(108, 108, 3, 12); T.rgbZone(108, 108, 104); // the core's firewall
    T.ground(105, 158); T.en('rtoast', 114); T.decor('chains', 118, 6); T.en('fbun', 124); T.en('sskull', 130, 7); magma(134, 135); T.q(140, 9, 'sauce'); T.en('bend', 146); T.decor('coilglow', 150, 13); T.tank(127);
    T.ground(159, W - 1);
    // boss arena (one screen, camera locks at tx 160): the Quartz King's slab room
    T.fill(176, 177, 3, 12, 'S'); main.escapeWall = { x0: 176, x1: 177, y0: 3, y1: 12 };
    T.decor('chains', 162, 5); T.decor('chains', 173, 5); T.decor('banner6', 164, 5, { w: 56, text: 'THE SLAB' }); T.decor('candles', 160, 13); T.decor('candles', 171, 13);
    T.fridge(184); T.gas(185); T.tank(190); T.row(194, 198, 9, 'B'); T.fridge(202); T.tank(203); T.gas(207);
    main.exitTx = 216; T.sign(216, 9, 'EXIT', '#00ff66');
    T.cage(20); T.cage(88); T.cage(152);
    main.boss = { kind: 'quartz', tx: 168, deckRow: 13, trigger: 161, lockTx: 160, bounds: [160, 175],
      line1: 'A SKULL WITH A QUARTZ CROWN?!', line2: 'TIME TO MAKE A POINT. TOASTED!',
      fcLine1: 'MY QUARTZ SKULL?! OFF THE SHELF?!', fcLine2: 'BACK IN THE DISPLAY CASE. NOW!' };
    return { main };
  } };
