// World 3: TOASTER PIT — a grimy basement under the toaster factory (lore: lore/pit.md). Original level designs.
'use strict';
LEVEL_ORDER.push('3-1', '3-2', '3-3', '3-4');

// ---------------- 3-1 Graffiti Basement (+ vending-fridge bonus room) ----------------
LEVELS['3-1'] = { id: '3-1', world: 3, num: 1, name: 'GRAFFITI BASEMENT', time: 300, music: 'w3_basement', start: { area: 'main', tx: 3 }, checkpoint: 108,
  build(){
    const W = 214, main = newArea('main', W, 'basement'), T = areaTools(main);
    T.fill(0, W - 1, 0, 1, 'G'); // low basement ceiling
    T.ground(0, 40); T.sign(5, 9, 'MIND THE CRUMBS', '#ff00c8');
    T.q(12, 9, 'power'); T.br(13, 9); T.q(14, 9, 'tray'); T.br(15, 9); T.q(14, 5);
    T.en('toast', 22); T.en('jamskull', 28); T.pipe(32, 2);
    T.coins(35, 38, 9);
    T.ground(43, 82); T.en('butterskull', 50); T.fridge(55); T.fridge(56); T.tank(56, 11);
    T.row(60, 64, 9); T.q(62, 9, 'power'); T.coins(60, 64, 5);
    T.en('jamskull', 66); T.en('toast', 72);
    T.pipe(77, 3, { enter: true, to: { area: 'fridge', mode: 'drop', tx: 2 } }); // the vending-fridge bonus room
    T.ground(85, 131); T.col(88, 1); T.en('butterskull', 94); T.en('jamskull', 99); T.col(103, 2);
    T.stairs(106, 3, true); T.plank(109, 113, 10); T.coins(109, 113, 9);
    T.en('toast', 116); T.hid(119, 9, '1up'); T.en('jamskull', 123);
    T.pipe(124, 2, { exitPipe: true });
    T.ground(133, W - 1); T.en('butterskull', 140); T.row(144, 147, 9); T.q(145, 9, 'star'); T.en('toast', 150);
    T.fridge(154); T.gas(155); T.fridge(155, 11); T.en('jamskull', 160); T.en('butterskull', 166);
    T.stairs(176, 8, true); T.col(184, 8);
    main.pole = { tx: 191 }; T.set(191, 12, 'S'); main.booth = { tx: 196, door: 199 };
    T.cage(18); T.cage(69); T.cage(136); T.cage(170);
    // vending-fridge bonus: a walk-in snack fridge full of skullz and mini fridges to pop
    const fridge = newArea('fridge', 16, 'fridge', { camLock: true, music: 'w3_basement' }), B = areaTools(fridge);
    B.ground(0, 15); B.fill(0, 0, 0, 12, 'S'); B.fill(0, 15, 0, 1, 'S');
    B.coins(3, 10, 6); B.coins(3, 10, 8); B.coins(4, 9, 4);
    B.row(3, 10, 10, 'U'); B.q(6, 10, 'tray'); B.fridge(3, 12); B.fridge(4, 12); B.fridge(4, 11); B.fridge(9, 12);
    B.fill(12, 15, 11, 12, 'p'); B.fill(14, 15, 0, 10, 'p');
    fridge.pipes.push({ x: 12, y: 11, dir: 'left', to: { area: 'main', mode: 'up', tx: 124, ty: 11 } });
    return { main, fridge };
  } };

// ---------------- 3-2 Toaster Wiring (hot coils + Fork in the Outlet sparks) ----------------
LEVELS['3-2'] = { id: '3-2', world: 3, num: 2, name: 'TOASTER WIRING', time: 300, music: 'w3_wiring', start: { area: 'main', tx: 3 }, checkpoint: 104,
  build(){
    const W = 212, main = newArea('main', W, 'wiring'), T = areaTools(main);
    T.fill(0, W - 1, 0, 2, 'G');
    T.ground(0, 34); T.sign(6, 9, 'HOT COILS: WAIT FOR BLUE', '#ff5a00');
    T.q(11, 9, 'power'); T.en('toast', 18);
    T.coil(22, 26, 13, 0); T.coins(22, 26, 9);
    T.en('jamskull', 31);
    T.ground(37, 76); T.fork(42, 12, 48, 12, 150, 0); T.coins(44, 46, 9);
    T.en('butterskull', 53); T.q(57, 9, 'tray'); T.br(56, 9); T.br(58, 9);
    T.coil(61, 65, 13, 60); T.en('toast', 70);
    T.fork(73, 6, 73, 12, 140, 30); // ceiling outlet -> floor outlet: a vertical zap
    T.fill(73, 73, 3, 5, 'S');
    T.ground(80, 124); T.en('jamskull', 84); T.coil(88, 91, 13, 100);
    T.row(94, 98, 9); T.q(96, 9, 'power'); T.fork(100, 12, 105, 12, 160, 80);
    T.en('butterskull', 110); T.tank(114); T.gas(115); T.fridge(115, 11); T.en('toast', 119);
    T.ground(128, 168); T.coil(131, 135, 13, 20); T.en('jamskull', 139); T.fork(143, 12, 149, 12, 150, 40);
    T.hid(146, 8, '1up'); T.en('toast', 154); T.coil(158, 162, 13, 140);
    T.ground(171, W - 1); T.en('butterskull', 174);
    T.stairs(178, 8, true); T.col(186, 8);
    main.pole = { tx: 192 }; T.set(192, 12, 'S'); main.booth = { tx: 197, door: 200 };
    T.cage(15); T.cage(67); T.cage(121); T.cage(165);
    return { main };
  } };

// ---------------- 3-3 Reel Tunnels (spinning slot-reel platforms, Smoke Detectors, Rubber Skulls, Crust Goons) ----------------
LEVELS['3-3'] = { id: '3-3', world: 3, num: 3, name: 'REEL TUNNELS', time: 300, music: 'w3_reels', start: { area: 'main', tx: 3 }, checkpoint: 110,
  build(){
    const W = 216, main = newArea('main', W, 'reels'), T = areaTools(main);
    T.fill(0, W - 1, 0, 3, 'G'); // tunnel ceiling (smoke detectors hang from row 4)
    T.ground(0, 30); T.sign(5, 9, 'REELS: LAND ON SAFE', '#FFD400');
    T.q(10, 9, 'power'); T.en('rubber', 17); T.en('smoke', 20, 4);
    T.ground(26, 30);
    T.reel(32, 13, ['safe', 'bounce', 'safe', 'spike'], 0); // reel over a pit
    T.ground(35, 66); T.en('goon', 44); T.en('smoke', 50, 4); T.coins(48, 52, 9); T.en('rubber', 57);
    T.row(60, 63, 9); T.q(61, 9, 'tray');
    T.reel(68, 13, ['safe', 'spike', 'safe', 'bounce'], 60); T.reel(71, 13, ['safe', 'bounce', 'safe', 'spike'], 120);
    T.ground(74, 112); T.en('smoke', 80, 4); T.en('rubber', 86); T.en('goon', 95); T.col(99, 1);
    T.reel(102, 10, ['bounce', 'safe', 'spike', 'safe'], 30); T.coins(102, 103, 6);
    T.en('smoke', 107, 4); T.tank(109); T.fridge(110); T.gas(110, 11);
    T.reel(114, 13, ['safe', 'spike', 'safe', 'bounce'], 90);
    T.ground(117, 160); T.en('rubber', 122); T.en('goon', 130); T.q(134, 9, 'power'); T.en('smoke', 138, 4);
    T.reel(142, 10, ['safe', 'safe', 'spike', 'bounce'], 10); T.hid(146, 7, '1up'); T.en('rubber', 150); T.en('smoke', 155, 4);
    T.reel(162, 13, ['safe', 'bounce', 'safe', 'spike'], 45); T.reel(165, 13, ['safe', 'spike', 'safe', 'bounce'], 140);
    T.ground(168, W - 1); T.en('goon', 172);
    T.stairs(182, 6, true); T.col(188, 6); // low tunnel ceiling: short staircase
    main.pole = { tx: 194 }; T.set(194, 12, 'S'); main.booth = { tx: 199, door: 202 };
    T.cage(14); T.cage(90); T.cage(126); T.cage(176);
    return { main };
  } };

// ---------------- 3-4 Breadlord's Crumb Vault + THE BREADLORD ----------------
LEVELS['3-4'] = { id: '3-4', world: 3, num: 4, name: "BREADLORD'S CRUMB VAULT", time: 300, music: 'w3_vault', start: { area: 'main', tx: 2 }, checkpoint: 84,
  build(){
    const W = 222, main = newArea('main', W, 'vault'), T = areaTools(main);
    T.fill(0, W - 1, 0, 2, 'G');
    T.ground(0, 38); T.sign(5, 9, 'PAY IN CRUMBS', '#e3b303'); T.en('goon', 16); T.q(20, 9, 'power');
    T.coil(25, 29, 13, 0); T.en('jamskull', 34);
    T.ground(41, 80); T.fork(45, 12, 51, 12, 150, 20); T.en('rubber', 56); T.en('smoke', 60, 3);
    T.reel(63, 10, ['safe', 'bounce', 'safe', 'spike'], 0); T.coins(63, 64, 7);
    T.en('butterskull', 68); T.en('goon', 75); T.fridge(78); T.tank(79);
    T.reel(82, 13, ['safe', 'spike', 'safe', 'bounce'], 50);
    T.ground(85, 126); T.en('toast', 92); T.q(96, 9, 'tray'); T.coil(100, 104, 13, 80); T.en('jamskull', 108);
    T.fork(112, 12, 118, 12, 160, 100); T.en('goon', 122);
    T.ground(129, W - 1); T.en('rubber', 134); T.q(139, 9, 'power'); T.en('smoke', 143, 3);
    // boss arena (one screen, camera locks at tx 150)
    T.fill(166, 167, 3, 12, 'S'); main.escapeWall = { x0: 166, x1: 167, y0: 3, y1: 12 };
    T.fridge(176); T.gas(177); T.tank(182); T.row(186, 190, 9, 'B'); T.fridge(194); T.tank(195); T.gas(200);
    main.exitTx = 210; T.sign(210, 9, 'EXIT', '#00ff66');
    T.cage(10); T.cage(72); T.cage(124); T.cage(146);
    main.boss = { kind: 'breadlord', tx: 160, deckRow: 13, trigger: 151, lockTx: 150, bounds: [150, 165],
      line1: 'MY DEBT IS ART THERAPY,', line2: 'AND THERAPY IS FREE!!!' };
    return { main };
  } };
