// World 9: FINAL BITE — an old-school street brawl on toast avenue (lore: lore/originals.md, "Bake & Rise").
// Original level designs. Crumb Street (9-1), the pink-neon Diner kitchen with grill plates (9-2), Toast Avenue
// under a storm with lightning strikes (9-3); THE THERAPY TOASTER waits in the Toaster Lot (9-4).
// BRAWL zones lock the screen until the wave is cleared ("CLEAR!"). Every hazard costs 1 heart.
// No real brands, no gore, no wallets. Jam is always grape purple.
'use strict';
LEVEL_ORDER.push('9-1', '9-2', '9-3', '9-4');

// ---------------- 9-1 Crumb Street (night brick shops, neon toast, a parked TOAST TRUCK left of start) ----------------
LEVELS['9-1'] = { id: '9-1', world: 9, num: 1, name: 'CRUMB STREET', time: 300, music: 'w9_street', start: { area: 'main', tx: 3 }, checkpoint: 100,
  build(){
    const W = 208, main = newArea('main', W, 'bitestreet'), T = areaTools(main);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.ground(0, W - 1);
    T.rideTruck(0); T.sign(0, 8, 'TOAST TRUCK  -  DOWN TO RIDE', '#FFD400');
    T.sign(6, 7, 'CRUMB STREET. FIGHT TO THE LOT.', '#ff2d8a'); T.decor('neon9', 6, 3, { text: 'TOAST 24H' }); T.decor('shop9', 10, 12, { text: 'BAKERY' });
    T.en('punk', 16); T.gold(19, 10, 'pat'); T.q(21, 9, 'power'); T.gold(23, 10, 'pat'); T.decor('lamp9', 24, 12); T.en('punk', 28);
    T.br(31, 9); T.q(32, 9, 'jam'); T.br(33, 9); T.cage(36); T.decor('trash9', 39, 12); T.en('butter', 42);
    pit(46, 48); T.gold(47, 9, 'pat');
    T.sign(52, 8, 'BRAWL! CLEAR THE BLOCK', '#ff2d8a'); T.decor('shop9', 54, 12, { text: 'PIZZA', w: 72 }); T.decor('winToaster9', 60, 11);
    T.brawl(58, [['punk', 'punk'], ['butter']]); T.decor('puddle9', 66, 12);
    T.tank(78); T.en('bpunk', 82); T.gold(85, 10, 'bar'); pit(88, 90); T.en('punk', 95);
    T.br(98, 9); T.q(99, 9, 'star'); T.br(100, 9); T.cage(104); T.gas(108); T.decor('lamp9', 110, 12); T.en('butter', 114); T.gold(117, 10, 'pat');
    T.decor('neon9', 124, 3, { text: 'BAGELS', col: '#f5c14a' }); T.decor('shop9', 126, 12, { text: 'TOAST', w: 72 }); T.decor('winToaster9', 133, 11);
    T.brawl(128, [['punk', 'bpunk'], ['punk', 'butter']]);
    T.en('punk', 150); T.gold(153, 10, 'pat'); T.cage(12);
    T.stairs(158, 5, true); T.col(164, 6); T.q(168, 9, 'card');
    T.decor('banner9', 166, 3, { w: 72, text: 'CRUMB STREET' });
    main.pole = { tx: 176 }; T.set(176, 12, 'S'); main.booth = { tx: 181, door: 184 };
    T.decor('lamp9', 190, 12); T.decor('cone9', 194, 12);
    return { main };
  } };

// ---------------- 9-2 The Diner (industrial kitchen, pink neon, grill plates that flare up, gold bars) ----------------
LEVELS['9-2'] = { id: '9-2', world: 9, num: 2, name: 'THE DINER', time: 300, music: 'w9_diner', start: { area: 'main', tx: 3 }, checkpoint: 104,
  build(){
    const W = 216, main = newArea('main', W, 'bitediner'), T = areaTools(main);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.ground(0, W - 1);
    T.sign(4, 7, 'THE DINER. WATCH THE GRILL!', '#ff2d8a'); T.decor('grillhood9', 8, 3, { w: 64 }); T.decor('burger9', 12, 11);
    T.en('punk', 16); T.q(20, 9, 'power'); T.gold(22, 10, 'pat'); T.grill(26, 30, 13, 0); T.sign(28, 8, 'GRILL ON = OUCH', '#ff8a3a'); T.en('punk', 34);
    T.br(38, 9); T.q(39, 9, 'jam'); T.br(40, 9); T.cage(44); T.en('butter', 48); T.gold(51, 10, 'bar');
    pit(54, 56); T.grill(60, 65, 13, 60); T.decor('goldstack9', 68, 12); T.en('bpunk', 70);
    T.sign(74, 8, 'BRAWL IN THE KITCHEN!', '#f5c14a'); T.brawl(78, [['punk', 'butter'], ['bpunk', 'punk']]); T.decor('grillhood9', 80, 3, { w: 80 });
    T.tank(98); T.en('punk', 102); T.grill(106, 112, 13, 30); T.gold(109, 9, 'pat'); T.cage(116); T.en('butter', 120);
    pit(124, 126); T.br(130, 9); T.q(131, 9, 'star'); T.br(132, 9); T.gas(136); T.grill(140, 146, 13, 90); T.en('bpunk', 150); T.gold(153, 10, 'bar');
    T.decor('burger9', 156, 11); T.en('punk', 158); T.cage(12);
    T.stairs(164, 5, true); T.col(170, 6); T.q(174, 9, 'card');
    T.decor('banner9', 176, 3, { w: 64, text: 'THE DINER' });
    main.pole = { tx: 188 }; T.set(188, 12, 'S'); main.booth = { tx: 193, door: 196 };
    return { main };
  } };

// ---------------- 9-3 Toast Avenue (storm sky, lightning strikes, frozen butters, burnt punks) ----------------
LEVELS['9-3'] = { id: '9-3', world: 9, num: 3, name: 'TOAST AVENUE', time: 300, music: 'w9_ave', start: { area: 'main', tx: 3 }, checkpoint: 108,
  build(){
    const W = 220, main = newArea('main', W, 'biteave'), T = areaTools(main);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.ground(0, W - 1);
    T.sign(4, 7, 'STORM ON THE AVENUE. WAIT FOR THE FLASH.', '#f4e8ff'); T.decor('neon9', 4, 3, { text: 'TOAST AVE', col: '#f5c14a' });
    T.en('bpunk', 14); T.gold(17, 10, 'pat'); T.q(20, 9, 'power'); T.strike(24, 150, 0); T.en('punk', 28);
    T.decor('fence9', 30, 12, { w: 48 }); T.en('fbutter', 34); T.gold(37, 10, 'pat'); T.strike(40, 150, 50); T.cage(44);
    pit(48, 50); T.br(54, 9); T.q(55, 9, 'jam'); T.br(56, 9); T.en('bpunk', 60); T.strike(64, 150, 100);
    T.sign(68, 8, 'BRAWL ON THE AVENUE!', '#ff2d8a'); T.brawl(72, [['bpunk', 'punk'], ['fbutter']]); T.decor('lotTruck9', 76, 12);
    T.tank(92); T.en('punk', 96); T.strike(100, 150, 25); T.gold(103, 9, 'bar'); T.cage(106); T.en('fbutter', 110);
    pit(114, 116); T.strike(120, 150, 75); T.en('bpunk', 124); T.br(128, 9); T.q(129, 9, 'star'); T.br(130, 9); T.gas(134);
    T.brawl(140, [['punk', 'bpunk', 'punk'], ['fbutter', 'butter']]); T.decor('fence9', 142, 12, { w: 64 });
    T.strike(162, 150, 40); T.gold(165, 10, 'pat'); T.cage(12);
    T.stairs(172, 5, true); T.col(178, 6); T.q(182, 9, 'card'); T.gold(186, 10, 'pat');
    main.pole = { tx: 192 }; T.set(192, 12, 'S'); main.booth = { tx: 197, door: 200 };
    T.decor('cone9', 204, 12);
    return { main };
  } };

// ---------------- 9-4 Toaster Lot (THE THERAPY TOASTER, 9 HP, 3 phases; a TOAST TRUCK mid-level ride to the lot) ----------------
LEVELS['9-4'] = { id: '9-4', world: 9, num: 4, name: 'TOASTER LOT', time: 300, music: 'w9_lot', start: { area: 'main', tx: 2 }, checkpoint: 104,
  build(){
    const W = 232, main = newArea('main', W, 'bitelot'), T = areaTools(main);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.fill(0, W - 1, 0, 1, 'G'); T.ground(0, W - 1);
    T.sign(5, 7, 'THE GRAND PRIZE IS IN THE LOT. GO EAT IT.', '#ff2d8a');
    T.decor('neon9', 2, 3, { text: 'TOASTER LOT' }); T.en('punk', 16); T.q(20, 9, 'jam'); T.en('bpunk', 24);
    T.strike(30, 150, 0); T.gold(34, 10, 'pat'); T.cage(38); T.en('butter', 42); T.decor('fence9', 44, 12, { w: 48 }); T.grill(50, 54, 13, 20);
    T.sign(58, 8, 'LAST BRAWL!', '#f5c14a'); T.brawl(62, [['punk', 'bpunk'], ['butter', 'fbutter']]); T.decor('lotTruck9', 66, 12);
    T.br(84, 9); T.q(85, 9, 'power'); T.br(86, 9); T.cage(90); T.en('fbutter', 94); pit(98, 100); T.gold(99, 9, 'bar');
    T.strike(104, 150, 60); T.decor('banner9', 108, 4, { w: 80, text: 'TOASTER LOT' }); T.en('punk', 112);
    T.rideTruck(122); T.sign(123, 8, 'RIDE TO THE GRAND PRIZE', '#00f0ff');
    T.en('bpunk', 132); T.q(136, 9, 'star'); T.cage(140); T.tank(146); T.gold(150, 10, 'pat');
    // boss arena (one screen, camera locks at tx 160)
    T.fill(176, 177, 2, 12, 'S'); main.escapeWall = { x0: 176, x1: 177, y0: 2, y1: 12 };
    T.decor('neon9', 161, 3, { text: 'GRAND PRIZE', col: '#f5c14a' }); T.decor('fence9', 160, 12, { w: 64 }); T.decor('cone9', 162, 12);
    T.fridge(184); T.gas(185); T.tank(190); T.row(194, 198, 9, 'B'); T.fridge(202); T.tank(203); T.gas(207);
    main.exitTx = 216; T.sign(216, 9, 'EXIT', '#00ff66');
    T.cage(12);
    main.boss = { kind: 'ttruck', tx: 171, deckRow: 13, trigger: 161, lockTx: 160, bounds: [160, 175],
      line1: 'THE GRAND PRIZE IS A TRUCK?!', line2: 'HIT THE TOASTER WHEN IT STALLS. TOASTED!',
      fcLine1: 'A TOASTER WITH WHEELS? DESSERT.', fcLine2: 'I CALL SHOTGUN. TOASTED!' };
    return { main };
  } };
