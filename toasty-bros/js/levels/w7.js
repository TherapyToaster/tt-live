// World 7: TOASTY ARCADE: Mr. Toasty's neon after-hours arcade, 3 AM, cozy and slightly haunted (lore: lore/arcade.md).
// Original level designs. One gimmick per level, all built from arcade machines: pusher shelves (7-1), claw cranes (7-2),
// CRT screens that flicker on and off (7-3); the Jackpot Vault waits in 7-4. Tokens and prize tickets are score only:
// no cash, no betting, no wallets. Jam is always grape purple. No real brands, no gore.
'use strict';
LEVEL_ORDER.push('7-1', '7-2', '7-3', '7-4');

// ---------------- 7-1 The Lobby (pusher shelves: ride the sliding shelves over the token pits; token showers from the ceiling) ----------------
LEVELS['7-1'] = { id: '7-1', world: 7, num: 1, name: 'THE LOBBY', time: 300, music: 'w7_lobby', start: { area: 'main', tx: 3 }, checkpoint: 100,
  build(){
    const W = 216, main = newArea('main', W, 'arclobby'), T = areaTools(main);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.ground(0, W - 1);
    T.rideTruck(0); T.sign(0, 8, 'TOAST TRUCK  -  DOWN TO RIDE', '#FFD400');
    T.sign(5, 7, 'RIDE THE PUSHER SHELVES!', '#FFD400'); T.decor('neon7', 4, 3, { text: 'TOASTY ARCADE' }); T.decor('cabinet', 11, 13, { v: 0 }); T.decor('mirrorball', 20, 4);
    T.en('ttoken', 16); T.q(20, 9, 'streak'); T.decor('pusherbox', 22, 13); T.tix(14, 18, 11); T.fig(20, 5); // a mini figure on top of the first prize machine's bump
    pit(30, 36); T.pusher(30, 3, 13, 4, 0); // pusher pit #1
    T.decor('ticker', 40, 3, { w: 120, v: 0 }); T.en('ccrab', 44); T.br(48, 9); T.q(49, 9, 'power'); T.br(50, 9); T.shower(52); T.cage(55); T.en('ttoken', 60); T.en('tsnake', 63); T.decor('cabinet', 66, 13, { v: 1 }); T.tank(57);
    pit(75, 81); T.pusher(75, 3, 13, 4, 90); // pusher pit #2
    T.decor('mirrorball', 86, 4); T.en('ttoken', 88); T.br(92, 9); T.q(93, 9, 'star'); T.br(94, 9); T.fig(93, 8); T.q(96, 9, 'jam'); T.cage(99); T.gas(103); T.decor('pusherbox', 105, 13); T.en('ccrab', 104); T.en('tsnake', 114); T.tix(116, 120, 11);
    pit(129, 135); T.pusher(129, 3, 13, 4, 45); // pusher pit #3
    T.decor('beams', 138, 0); T.shower(140); T.en('ttoken', 144); T.decor('cabinet', 146, 13, { v: 2 }); T.q(150, 9, 'streak'); T.en('ccrab', 156); T.cage(160); T.tank(164); T.q(167, 9, 'card');
    T.plank(168, 170, 6); T.fig(169, 5); // the third mini figure, on a shelf above the spare play card
    T.decor('bulbs', 172, 4, { w: 60 }); T.stairs(176, 6, true); T.col(182, 6);
    main.pole = { tx: 184 }; T.set(184, 12, 'S'); main.booth = { tx: 189, door: 192 };
    T.cage(12);
    return { main };
  } };

// ---------------- 7-2 Prize Shelves (claw cranes: ride a prize tray over walls of stacked capsules and over the pits) ----------------
LEVELS['7-2'] = { id: '7-2', world: 7, num: 2, name: 'PRIZE SHELVES', time: 300, music: 'w7_prize', start: { area: 'main', tx: 3 }, checkpoint: 104,
  build(){
    const W = 224, main = newArea('main', W, 'arcprize'), T = areaTools(main);
    const wall = (x0, x1) => T.fill(x0, x1, 6, 12, 'X'); // a wall of stacked capsules, too tall to jump
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.ground(0, W - 1);
    T.sign(5, 7, 'RIDE THE CLAW CRANES!', '#FFD400'); T.decor('prizeshelf', 9, 12, { w: 48 }); T.decor('gacha', 16, 13);
    T.en('ccrab', 14); T.q(19, 9, 'streak'); T.tix(10, 13, 11);
    T.claw(24, 3, 12, 6.5, 7, 0); wall(29, 30); T.fig(29, 5); T.fig(30, 5); // claw #1 over capsule wall #1 (the mini figures sit on top of the stack)
    T.decor('prizeshelf', 36, 12, { w: 36 }); T.en('ttoken', 40); T.br(44, 9); T.q(45, 9, 'power'); T.br(46, 9); T.cage(49); T.en('clawd', 54, 3, { back: 34 }); T.decor('gacha', 58, 13); T.tank(60); T.en('ccrab', 64);
    T.claw(71, 3, 12, 2, 12, 120); pit(75, 84); // claw #2 carries you across the pit
    T.decor('prizeshelf', 90, 12, { w: 48 }); T.en('tsnake', 94); T.q(98, 9, 'jam'); T.cage(102); T.gas(106); T.en('ttoken', 110); T.tix(108, 112, 11); T.en('clawd', 114, 3, { back: 90 });
    T.claw(122, 3, 12, 6.5, 7, 60); wall(127, 128); T.fig(128, 5); // claw #3 over capsule wall #2
    T.en('ccrab', 138); T.decor('gacha', 140, 13); T.q(144, 9, 'streak'); T.en('tsnake', 150); T.cage(156); T.tank(160); T.en('ttoken', 164); T.q(167, 9, 'card');
    T.decor('bulbs', 170, 4, { w: 60 }); T.stairs(176, 6, true); T.col(182, 6);
    main.pole = { tx: 188 }; T.set(188, 12, 'S'); main.booth = { tx: 193, door: 196 };
    T.cage(12);
    return { main };
  } };

// ---------------- 7-3 No Signal Hall (CRT screens: magenta and cyan screens take turns being solid; Static Ghosts only exist while they're on) ----------------
LEVELS['7-3'] = { id: '7-3', world: 7, num: 3, name: 'NO SIGNAL HALL', time: 300, music: 'w7_static', start: { area: 'main', tx: 3 }, checkpoint: 98,
  build(){
    const W = 214, main = newArea('main', W, 'arcstatic'), T = areaTools(main);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.fill(0, W - 1, 0, 2, 'G'); T.ground(0, W - 1);
    T.sign(4, 6, 'WAIT FOR THE SIGNAL!', '#FFD400'); T.decor('crtwall', 9, 13, { n: 3 }); T.en('ttoken', 18); T.q(21, 9, 'streak'); T.tix(14, 17, 11);
    // CRT zone 1: four screens over a bottomless gap, magenta / cyan / magenta / cyan
    pit(32, 44); T.crt(33, 34, 13, 0); T.crt(36, 37, 13, 1); T.crt(39, 40, 13, 0); T.crt(42, 43, 13, 1); T.crtZone(32, 44);
    T.en('sghost', 52, 8); T.br(55, 9); T.q(56, 9, 'power'); T.br(57, 9); T.cage(60); T.decor('crtwall', 63, 13, { n: 2 }); T.en('tsnake', 68); T.tank(72); T.fig(56, 5);
    // CRT zone 2: a staircase of screens up and back down
    pit(80, 94); T.crt(81, 82, 12, 0); T.crt(84, 85, 11, 1); T.crt(87, 88, 11, 0); T.crt(90, 91, 12, 1); T.crtZone(80, 94); T.fig(86, 7);
    T.en('sghost', 102, 7); T.decor('crtwall', 104, 13, { n: 3 }); T.q(108, 9, 'jam'); T.cage(112); T.en('ccrab', 116); T.gas(120); T.en('tsnake', 124);
    // CRT zone 3: five screens, quicker swaps between magenta and cyan
    pit(131, 146); T.crt(132, 133, 13, 0); T.crt(135, 136, 13, 1); T.crt(138, 139, 12, 0); T.crt(141, 142, 13, 1); T.crt(144, 145, 13, 0); T.crtZone(131, 146);
    T.en('sghost', 154, 8); T.decor('crtwall', 157, 13, { n: 2 }); T.q(160, 9, 'card'); T.hid(158, 9, 'star'); T.cage(163); T.en('ttoken', 166); T.tank(169); T.fig(172, 9); T.tix(150, 153, 11);
    T.stairs(176, 6, true); T.col(182, 6);
    main.pole = { tx: 188 }; T.set(188, 12, 'S'); main.booth = { tx: 193, door: 196 };
    T.cage(12);
    return { main };
  } };

// ---------------- 7-4 Castle Jackpot Vault (all three machines, then the Jackpot Vault: an overgrown token pusher with a CRT face) ----------------
LEVELS['7-4'] = { id: '7-4', world: 7, num: 4, name: 'CASTLE JACKPOT VAULT', time: 300, music: 'w7_vault', start: { area: 'main', tx: 2 }, checkpoint: 104,
  build(){
    const W = 232, main = newArea('main', W, 'arcvault'), T = areaTools(main);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.fill(0, W - 1, 0, 1, 'G'); T.ground(0, W - 1);
    T.sign(5, 7, 'THE JACKPOT VAULT AWAITS', '#FFD400'); T.decor('bulbs', 2, 3, { w: 80 }); T.en('ttoken', 16); T.q(20, 9, 'streak'); T.en('ccrab', 24); T.fig(20, 5);
    pit(30, 36); T.pusher(30, 3, 13, 4, 0); // a pusher pit
    T.en('tsnake', 44); T.br(48, 9); T.q(49, 9, 'power'); T.br(50, 9); T.cage(53); T.tank(57); T.decor('pusherbox', 60, 13);
    T.claw(64, 3, 12, 6.5, 7, 40); T.fill(69, 70, 6, 12, 'X'); T.fig(70, 5); // a claw crane over a vault-steel wall
    T.en('ttoken', 80); T.decor('crtwall', 82, 13, { n: 2 }); T.q(88, 9, 'jam'); T.cage(92); T.en('sghost', 96, 8);
    pit(102, 112); T.crt(103, 104, 13, 0); T.crt(106, 107, 13, 1); T.crt(109, 110, 13, 0); T.crtZone(102, 112); // a CRT crossing
    T.en('tsnake', 120); T.decor('banner7', 124, 4, { w: 64, text: 'JACKPOT VAULT' }); T.rideTruck(122); T.sign(123, 8, 'RIDE TO THE VAULT', '#00f0ff');
    T.en('ccrab', 130); T.q(136, 9, 'streak'); T.gas(140); T.en('ttoken', 146); T.cage(150); T.fig(152, 9); T.tank(154);
    // boss arena (one screen, camera locks at tx 160): the vault floor
    T.fill(176, 177, 2, 12, 'S'); main.escapeWall = { x0: 176, x1: 177, y0: 2, y1: 12 };
    T.decor('mirrorball', 164, 4); T.decor('bulbs', 160, 3, { w: 96 }); T.decor('beams', 166, 0);
    T.fridge(184); T.gas(185); T.tank(190); T.row(194, 198, 9, 'B'); T.fridge(202); T.tank(203); T.gas(207);
    main.exitTx = 216; T.sign(216, 9, 'EXIT', '#00ff66');
    T.cage(12);
    main.boss = { kind: 'vault', tx: 171, deckRow: 13, trigger: 161, lockTx: 160, bounds: [160, 175],
      line1: 'THE PRIZE FLOOR... IT HAS A FACE?!', line2: 'TIME TO HIT THE PAYOUT BUTTON. TOASTED!',
      calLine1: 'THAT MACHINE IS WAY PAST WARRANTY!', calLine2: 'OUT OF ORDER. PERMANENTLY. TOASTED!' };
    return { main };
  } };
