// World 1: NO SIGNAL SKULLZ — four original levels.
'use strict';
LEVEL_ORDER.push('1-1', '1-2', '1-3', '1-4');

// ---------------- 1-1 Skull Wall Office (overworld) ----------------
LEVELS['1-1'] = { id: '1-1', world: 1, num: 1, name: 'SKULL WALL OFFICE', time: 300, music: 'w1_over', start: { area: 'main', tx: 3 }, checkpoint: 100,
  build(){
    const W = 246, O = 40; // O = length of the extra "cubicle" section added in v0.2
    const main = newArea('main', W, 'overworld'), T = areaTools(main);
    T.ground(0, 68); T.ground(71, 86); T.ground(90, 129); T.ground(133, 149); T.ground(153, 165); T.ground(168, 159 + O); T.ground(162 + O, W - 1);
    T.q(16, 9); T.en('crumb', 25);
    T.br(20, 9); T.q(21, 9, 'power'); T.br(22, 9); T.q(23, 9); T.br(24, 9); T.q(22, 5);
    T.pipe(30, 2); T.pipe(39, 3); T.pipe(48, 4, { enter: true, to: { area: 'bonus', mode: 'drop', tx: 2 } });
    T.en('crumb', 36); T.en('crumb', 44); T.en('crumb', 46);
    T.hid(57, 9, '1up'); T.coin(60, 9); T.coin(61, 8); T.coin(62, 8); T.coin(63, 9);
    T.en('toast', 67);
    T.br(74, 9); T.q(75, 9, 'power'); T.br(76, 9);
    T.row(78, 85, 5); T.q(82, 5, 'coin'); T.br(80, 5, 'multi');
    T.en('toast', 82); T.en('crumb', 85);
    T.coin(87, 9); T.coin(88, 8); T.coin(89, 9);
    T.br(94, 9, 'multi'); T.br(95, 9);
    T.br(100, 9); T.br(101, 9, 'star'); T.br(102, 9);
    T.en('crumb', 105); T.en('crumb', 107);
    T.q(110, 9); T.q(113, 9, 'power'); T.q(116, 9); T.q(113, 5);
    T.en('crumb', 112); T.en('toast', 120);
    T.stairs(122, 4, true); T.col(126, 4); T.col(127, 4); T.col(128, 4); T.col(129, 4);
    T.row(130, 132, 9); T.stairs(133, 4, false); T.en('crumb', 131, 8);
    // NEW: cubicle maze (138..177)
    T.col(140, 2); T.col(147, 2); T.en('crumb', 143); T.en('crumb', 145);
    T.coin(150, 9); T.coin(151, 8); T.coin(152, 9);
    T.row(154, 158, 9); T.q(156, 9, 'power'); T.row(159, 163, 5); T.q(161, 5, 'coin');
    T.en('toast', 160); T.en('crumb', 170); T.en('crumb', 172); T.col(174, 3); T.col(175, 3);
    // original finale, shifted by O
    T.pipe(142 + O, 2, { exitPipe: true });
    T.br(146 + O, 9); T.br(147 + O, 9); T.q(148 + O, 9); T.br(149 + O, 9); T.q(148 + O, 5, 'coin');
    T.en('crumb', 151 + O); T.en('crumb', 153 + O); T.en('toast', 158 + O);
    T.en('crumb', 166 + O); T.en('crumb', 168 + O);
    T.stairs(170 + O, 8, true); T.col(178 + O, 8);
    main.pole = { tx: 186 + O }; T.set(186 + O, 12, 'S');
    main.booth = { tx: 191 + O, door: 194 + O };
    // v0.4 BRO EDITION: rescue cages, an explosive cluster and Antenna Skull riflemen
    T.cage(27); T.cage(97); T.cage(164); T.cage(190);
    T.tank(52); T.keg(53); T.keg(53, 11); T.gas(54); T.en('rifle', 78);
    T.en('rifle', 118); T.en('rifle', 166);
    const bonus = newArea('bonus', 16, 'bonus', { camLock: true }), B = areaTools(bonus);
    B.ground(0, 15); B.fill(0, 0, 0, 12, 'D'); B.fill(4, 13, 0, 1, 'D');
    B.row(4, 10, 11); B.row(4, 10, 12); B.coins(4, 10, 9); B.coins(4, 10, 7); B.coins(5, 9, 5);
    B.fill(12, 15, 11, 12, 'p'); B.fill(14, 15, 0, 10, 'p');
    bonus.pipes.push({ x: 12, y: 11, dir: 'left', to: { area: 'main', mode: 'up', tx: 142 + O, ty: 11 } });
    bonus.painting = true;
    return { main, bonus };
  } };

// ---------------- 1-2 Toast Factory (underground) ----------------
LEVELS['1-2'] = { id: '1-2', world: 1, num: 2, name: 'TOAST FACTORY', time: 300, music: 'w1_under', start: { area: 'main', tx: 2 }, checkpoint: 88,
  build(){
    const W = 200, main = newArea('main', W, 'factory'), T = areaTools(main);
    T.ground(0, 61); T.ground(64, 127); T.ground(134, W - 1);
    T.row(6, W - 12, 2); // brick ceiling
    T.q(10, 9); T.q(11, 9, 'power'); T.q(12, 9);
    T.conv(16, 23, 13, 1); T.conv(16, 23, 14, 1);
    T.en('crumb', 21); T.en('crumb', 23);
    T.barrel(26, 12); T.barrel(27, 12); T.barrel(27, 11);
    T.row(35, 40, 9); T.en('antenna', 38, 8);
    T.coins(35, 40, 7);
    T.conv(44, 51, 13, -1); T.conv(44, 51, 14, -1);
    T.en('bomber', 50, 5);
    [[55, 1], [56, 2], [57, 3]].forEach(([x, h]) => { for (let i = 0; i < h; i++) T.barrel(x, 12 - i); });
    T.coin(62, 8); T.coin(63, 8);
    T.row(66, 74, 9); T.br(70, 9, 'multi'); T.row(70, 80, 6); T.q(77, 6, 'coin');
    T.en('crumb', 72); T.en('crumb', 76); T.en('toast', 84);
    T.pipe(92, 2); T.en('antenna', 96, 12);
    T.hid(99, 9, '1up');
    T.en('bomber', 104, 4); T.en('bomber', 112, 4);
    for (let x = 113; x <= 115; x++){ T.barrel(x, 12); T.barrel(x, 11); }
    T.en('antenna', 114, 10);
    // the secret: this pipe has no hint light, but it IS enterable
    T.pipe(120, 3, { enter: true, secret: true, to: { area: 'warp', mode: 'drop', tx: 2 } });
    T.coin(119, 6); T.coin(120, 5); T.coin(121, 5); T.coin(122, 6);
    T.conv(127, 135, 10, 1); T.en('crumb', 131, 9);
    T.row(142, 146, 9); T.br(144, 9, 'star'); T.en('toast', 156); T.en('crumb', 160); T.en('crumb', 162);
    T.row(163, 166, 8); T.en('antenna', 165, 7);
    T.stairs(170, 4, true); T.col(174, 4); T.col(175, 4);
    T.en('crumb', 178); T.en('bomber', 182, 4);
    // exit: big sideways pipe out to the street
    T.fill(186, 189, 11, 12, 'p'); T.fill(188, 189, 3, 10, 'p');
    main.pipes.push({ x: 186, y: 11, dir: 'left', to: { area: 'exit', mode: 'up', tx: 2, ty: 11 } });
    T.fill(190, W - 1, 2, 12, 'G');
    // warp zone
    const warp = newArea('warp', 16, 'factory', { camLock: true, music: 'w1_under' }), Wp = areaTools(warp);
    Wp.ground(0, 15); Wp.fill(0, 0, 2, 12, 'B'); Wp.fill(15, 15, 2, 12, 'B'); Wp.row(0, 15, 2);
    [[4, 2], [8, 3], [12, 4]].forEach(([x, w]) => Wp.pipe(x - 1, 3, { enter: true, warp: w }));
    Wp.pipe(13, 2, { enter: true, warp: 5 }); // v0.7: channel 5 (SKULLZ BUMBO), a short pipe tucked against the right wall
    Wp.pipe(5, 2, { enter: true, warp: 6 }); // v0.8: channel 6 (MR. TOASTY'S CRYPT), a short pipe between channels 2 and 3 (the drop-in spot at tx 2 stays clear)
    if (WORLDS[7].built) Wp.pipe(9, 2, { enter: true, warp: 7 }); // v0.9: channel 7 (TOASTY ARCADE), a short pipe between channels 3 and 4
    Wp.sign(7.5, 4, 'WARP ZONE: PICK A CHANNEL', '#00e5ff');
    // exit street with the Channel Pole
    const exit = newArea('exit', 30, 'overworld', { music: 'w1_over' }), E = areaTools(exit);
    E.ground(0, 29); E.pipe(2, 2, {}); E.stairs(8, 3, true);
    exit.pole = { tx: 16 }; E.set(16, 12, 'S'); exit.booth = { tx: 21, door: 24 };
    T.cage(14); T.cage(101); T.cage(152);
    T.gas(112); T.gas(58); T.en('rifle', 88); T.en('rifle', 140);
    return { main, warp, exit };
  } };

// ---------------- 1-3 Acid Rain Alley (rooftops) ----------------
LEVELS['1-3'] = { id: '1-3', world: 1, num: 3, name: 'ACID RAIN ALLEY', time: 300, music: 'w1_sky', start: { area: 'main', tx: 2 }, checkpoint: 91,
  build(){
    const W = 192, main = newArea('main', W, 'rooftop'), T = areaTools(main);
    T.roof(0, 14, 12);
    T.mplat(15, 11, 2, 'x', 2, 0.02);
    T.roof(19, 28, 10); T.acid(23, 24, 9); T.en('crumb', 27, 9);
    T.fplat(30, 10, 2); T.fplat(33, 10, 2);
    T.roof(36, 46, 11); T.q(38, 7, 'power'); T.br(39, 7); T.mimic(40, 7); T.br(41, 7); T.en('toast', 45, 10);
    T.mplat(48, 9, 2, 'y', 4, 0.025);
    T.roof(52, 59, 8); T.en('antenna', 55, 7); T.coins(52, 55, 5);
    T.roof(60, 67, 12); T.acid(64, 65, 11); T.coins(64, 65, 8);
    T.mplat(68, 10, 2, 'x', 2, 0.022); T.mplat(71, 8, 2, 'x', 2, 0.022, Math.PI);
    T.roof(75, 87, 10); T.mimic(79, 6); T.q(81, 6, 'coin'); T.hid(84, 6, '1up'); T.en('crumb', 83, 9); T.en('bomber', 86, 3);
    T.fplat(89, 9, 2); T.fplat(92, 9, 2);
    T.roof(95, 104, 11); T.br(98, 7); T.br(99, 7, 'star'); T.br(100, 7); T.en('toast', 103, 10);
    T.mplat(106, 9, 2, 'y', 3, 0.03);
    T.roof(110, 117, 9); T.en('antenna', 115, 8);
    T.fplat(119, 9, 2);
    T.roof(122, 135, 12); T.acid(127, 129, 11); T.row(123, 133, 8); T.q(125, 8, 'power'); T.mimic(130, 8); T.en('crumb', 131, 11); T.en('crumb', 133, 11);
    T.mplat(136, 10, 2, 'x', 3, 0.02);
    T.roof(142, 152, 10); T.en('toast', 148, 9); T.en('crumb', 150, 9);
    T.fplat(154, 9, 2);
    T.roof(157, W - 1, 12);
    T.stairs(163, 8, true, 11); T.col(171, 8, 11);
    main.pole = { tx: 179 }; T.set(179, 11, 'S'); main.booth = { tx: 184, door: 187 };
    T.cage(42); T.cage(102); T.cage(146);
    T.gas(57); T.gas(58); T.tank(133); T.en('rifle', 77, 9); T.en('rifle', 160, 11);
    return { main };
  } };

// ---------------- 1-4 NO SIGNAL broadcast tower (castle) ----------------
LEVELS['1-4'] = { id: '1-4', world: 1, num: 4, name: 'BROADCAST TOWER', time: 300, music: 'w1_castle', start: { area: 'main', tx: 2 }, checkpoint: 88,
  build(){
    const W = 200, main = newArea('main', W, 'tower', { voidFloor: true }), T = areaTools(main);
    T.row(0, W - 1, 2, 'S');
    T.roof(0, 17, 10); T.fill(0, 12, 3, 4, 'S');
    T.firebar(15, 7, 6, 0.04);
    T.roof(21, 34, 11); T.firebar(27, 8, 5, -0.045); T.beam(33, 3, 10, 180, 0);
    T.mplat(35, 10, 2, 'x', 2, 0.025);
    T.roof(39, 60, 11); T.fill(42, 50, 3, 6, 'S'); T.firebar(45, 7, 4, 0.05); T.firebar(53, 8, 7, 0.022); T.col(57, 2, 10); T.en('antenna', 57, 8);
    T.fplat(62, 10, 2);
    T.roof(65, 80, 11); T.q(68, 7, 'power'); T.mimic(70, 7); T.q(72, 7, 'coin'); T.firebar(77, 7, 5, 0.035); T.firebar(77, 7, 5, 0.035, Math.PI); // v0.5: 1 tile further from the block row
    T.mplat(82, 10, 2, 'y', 3, 0.03);
    T.roof(86, 103, 11); T.beam(90, 3, 10, 160, 40); T.en('crumb', 93, 10); T.beam(96, 3, 10, 160, 120); T.en('toast', 99, 10);
    // NEW (W2 milestone): "dead air" gauntlet before the boss bridge — falling platforms, a firebar, a beam and an antenna skull
    const O = 20;
    T.fplat(105, 10, 2); T.fplat(108, 10, 2);
    T.roof(111, 115, 11); T.firebar(114, 7, 5, 0.04); T.coins(111, 112, 9); // v0.5: firebar moved 1 tile right so the landing from the falling plats is clear
    T.mplat(116, 10, 2, 'x', 1, 0.03);
    T.roof(119, 121, 11); T.beam(120, 3, 10, 150, 60);
    // boss arena: bridge over the glitch void + unplug switch (shifted by O)
    T.roof(102 + O, 105 + O, 10); T.row(106 + O, 118 + O, 10, 'b'); T.roof(119 + O, W - 1, 10);
    main.boss = { tx: 114 + O, ty: 8, trigger: 103 + O, bridge: [106 + O, 118 + O], bridgeRow: 10, switchTx: 120 + O, switchTy: 8, bounds: [106 + O, 118 + O] };
    T.sign(121 + O, 6, 'UNPLUG', '#ff2a3a');
    // v0.4: cages, a rifleman, and the TOASTED! escape corridor behind a sealed wall (blown open when the Glitch goes down)
    T.cage(30); T.cage(66); T.cage(100); T.en('rifle', 88, 10);
    T.fill(146, 147, 3, 9, 'S'); main.escapeWall = { x0: 146, x1: 147, y0: 3, y1: 9 };
    T.br(152, 7); T.br(153, 7); T.br(154, 7); T.col(158, 1, 9); T.gas(163, 9); T.tank(164, 9);
    T.row(168, 173, 6, 'B'); T.col(176, 2, 9); T.br(180, 7); T.gas(184, 9); T.col(188, 1, 9);
    main.exitTx = 194; T.sign(194, 7, 'EXIT', '#00ff66');
    return { main };
  } };
