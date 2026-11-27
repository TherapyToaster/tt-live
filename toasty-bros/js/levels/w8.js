// World 8: FEED FAT COTY — a futuristic neon diner (lore: lore/originals.md).
// Original level designs. Front room (8-1), stainless kitchen with belts and cooled-off plates (8-2),
// craving-line combos and goo (8-3); Fat Coty waits in the Too Full! booth (8-4).
// Every hazard costs 1 heart. No real brands, no gore, no wallets. Jam is always grape purple.
'use strict';
LEVEL_ORDER.push('8-1', '8-2', '8-3', '8-4');

// ---------------- 8-1 The Front Room (neon diner floor, snack pests, a parked TOAST TRUCK left of start) ----------------
LEVELS['8-1'] = { id: '8-1', world: 8, num: 1, name: 'THE FRONT ROOM', time: 300, music: 'w8_front', start: { area: 'main', tx: 3 }, checkpoint: 100,
  build(){
    const W = 208, main = newArea('main', W, 'feedfront'), T = areaTools(main);
    T.ground(0, W - 1);
    T.rideTruck(0); T.sign(0, 8, 'TOAST TRUCK  -  DOWN TO RIDE', '#FFD400');
    T.sign(5, 7, 'FEED THE SNACK HE IS CRAVING!', '#ff3d9a'); T.decor('neon8', 4, 3, { text: 'FEED FAT COTY' }); T.decor('ledring', 18, 2); T.decor('ovalwin', 24, 4);
    T.decor('stool8', 11, 12); T.decor('counter8', 14, 12, { w: 40 }); T.en('spest', 16); T.crave(20, 9, 'burger'); T.q(22, 9, 'power'); T.en('spest', 28);
    T.decor('lamp8', 32, 8); T.br(36, 9); T.q(37, 9, 'jam'); T.br(38, 9); T.cage(42); T.en('spest', 48); T.goo(52, 54, 13); T.sign(56, 8, 'WATCH THE GOO', '#b8e04a');
    T.decor('booth8', 60, 12); T.en('spest', 66); T.crave(70, 9, 'pizza'); T.cage(74); T.tank(78); T.decor('ovalwin', 82, 4); T.en('spest', 86);
    T.goo(90, 93, 13); T.br(98, 9); T.q(99, 9, 'star'); T.br(100, 9); T.cage(104); T.gas(108); T.decor('ledring', 112, 2); T.en('spest', 114);
    T.crave(118, 9, 'taco'); T.decor('neon8', 122, 3, { text: 'CHAIN COMBOS', col: '#ffc43a' }); T.en('spest', 128); T.goo(132, 134, 13);
    T.stairs(140, 5, true); T.col(146, 6); T.q(150, 9, 'card'); T.cage(12);
    T.decor('banner8', 154, 3, { w: 72, text: 'FRONT ROOM' }); T.en('spest', 160); T.crave(164, 9, 'donut'); T.tank(168);
    main.pole = { tx: 176 }; T.set(176, 12, 'S'); main.booth = { tx: 181, door: 184 };
    T.decor('stool8', 188, 12); T.decor('lamp8', 192, 8);
    return { main };
  } };

// ---------------- 8-2 The Stainless Kitchen (conveyor belts over pits, cooled-off plates that bite when they go cold) ----------------
LEVELS['8-2'] = { id: '8-2', world: 8, num: 2, name: 'THE STAINLESS KITCHEN', time: 300, music: 'w8_kitchen', start: { area: 'main', tx: 3 }, checkpoint: 104,
  build(){
    const W = 216, main = newArea('main', W, 'feedkitchen'), T = areaTools(main);
    const pit = (a, b) => { for (let x = a; x <= b; x++){ T.set(x, 13, '.'); T.set(x, 14, '.'); } };
    T.ground(0, W - 1);
    T.sign(4, 7, 'RIDE THE BELTS. WATCH THE PLATES!', '#ffc43a'); T.decor('vents8', 8, 3); T.decor('griddle', 12, 12); T.en('spest', 16);
    T.crave(20, 9, 'fries'); T.q(22, 9, 'power'); T.decor('fridge8', 26, 12); T.cool(30, 34, 13, 0); T.sign(32, 8, 'HOT NOW - COLD HURTS', '#7ad0ff'); T.en('spest', 38);
    pit(46, 56); T.belt(46, 11, 13, 1, 0.85); T.beltZone(46, 56); // belt spans the pit
    T.decor('griddle', 60, 12); T.en('spest', 64); T.br(68, 9); T.q(69, 9, 'jam'); T.br(70, 9); T.cage(74); T.tank(78);
    T.cool(82, 88, 13, 40); T.en('spest', 92); T.crave(96, 9, 'soda'); T.decor('vents8', 100, 3);
    pit(108, 120); T.belt(108, 13, 13, 1, 0.9); T.belt(112, 4, 10, 1, 0.7); T.beltZone(108, 120); // floor belt plus a high shelf
    T.cage(124); T.en('spest', 128); T.q(132, 9, 'star'); T.gas(136); T.cool(140, 146, 13, 80); T.decor('fridge8', 150, 12);
    T.crave(154, 9, 'chk'); T.en('spest', 158); T.cage(12);
    T.stairs(164, 5, true); T.col(170, 6); T.q(174, 9, 'card');
    T.decor('banner8', 178, 3, { w: 80, text: 'STAINLESS LINE' });
    main.pole = { tx: 188 }; T.set(188, 12, 'S'); main.booth = { tx: 193, door: 196 };
    return { main };
  } };

// ---------------- 8-3 The Craving Line (glowing combo snacks, goo gauntlet, snack pests) ----------------
LEVELS['8-3'] = { id: '8-3', world: 8, num: 3, name: 'THE CRAVING LINE', time: 300, music: 'w8_line', start: { area: 'main', tx: 3 }, checkpoint: 108,
  build(){
    const W = 220, main = newArea('main', W, 'feedline'), T = areaTools(main);
    T.ground(0, W - 1);
    T.sign(4, 7, 'CHAIN COMBOS. DO NOT LET HIM FILL UP.', '#ff8ac4'); T.decor('neon8', 4, 3, { text: 'CRAVING LINE', col: '#ffc43a' }); T.decor('ledring', 16, 2);
    T.en('spest', 14); T.crave(18, 9, 'ice'); T.crave(22, 7, 'dog'); T.q(24, 9, 'power'); T.en('spest', 28);
    T.goo(32, 36, 13); T.crave(40, 9, 'cake'); T.cage(44); T.en('spest', 50); T.goo(54, 57, 13);
    T.br(62, 9); T.q(63, 9, 'jam'); T.br(64, 9); T.crave(68, 9, 'chips'); T.crave(72, 7, 'shake'); T.decor('ovalwin', 76, 4);
    T.en('spest', 80); T.goo(84, 90, 13); T.sign(86, 8, 'SPLAT!', '#b8e04a'); T.cage(96); T.tank(100);
    T.crave(104, 9, 'wrap'); T.en('spest', 108); T.q(112, 9, 'star'); T.goo(116, 119, 13); T.crave(124, 9, 'cookie');
    T.decor('banner8', 128, 3, { w: 72, text: 'COMBO RUSH' }); T.en('spest', 136); T.gas(140); T.crave(144, 9, 'pretzel'); T.cage(148);
    T.goo(152, 156, 13); T.crave(160, 9, 'rings'); T.en('spest', 164); T.cage(12);
    T.stairs(172, 5, true); T.col(178, 6); T.q(182, 9, 'card'); T.crave(186, 9, 'burger');
    main.pole = { tx: 192 }; T.set(192, 12, 'S'); main.booth = { tx: 197, door: 200 };
    T.decor('ledring', 204, 2);
    return { main };
  } };

// ---------------- 8-4 Too Full! Booth (Fat Coty, 9 HP, 3 phases; a TOAST TRUCK mid-level ride to the booth) ----------------
LEVELS['8-4'] = { id: '8-4', world: 8, num: 4, name: 'TOO FULL! BOOTH', time: 300, music: 'w8_castle', start: { area: 'main', tx: 2 }, checkpoint: 104,
  build(){
    const W = 232, main = newArea('main', W, 'feedbooth'), T = areaTools(main);
    T.fill(0, W - 1, 0, 1, 'G'); T.ground(0, W - 1);
    T.sign(5, 7, 'FAT COTY IS CRAVING. FEED HIM. DO NOT FILL HIM UP.', '#ff3d9a');
    T.decor('neon8', 2, 3, { text: 'TOO FULL!' }); T.decor('ledring', 16, 2); T.en('spest', 16); T.q(20, 9, 'jam'); T.en('spest', 24);
    T.goo(30, 33, 13); T.crave(38, 9, 'pizza'); T.cage(42); T.tank(46); T.cool(50, 56, 13, 20); T.en('spest', 60);
    T.decor('counter8', 66, 12, { w: 36 }); T.br(72, 9); T.q(73, 9, 'power'); T.br(74, 9); T.cage(80); T.en('spest', 86);
    T.goo(90, 94, 13); T.crave(100, 9, 'taco'); T.gas(104); T.decor('booth8', 108, 12);
    T.decor('banner8', 118, 4, { w: 80, text: 'TOO FULL! KITCHEN' }); T.rideTruck(122); T.sign(123, 8, 'RIDE TO THE BOOTH', '#00f0ff');
    T.en('spest', 130); T.q(136, 9, 'star'); T.cage(140); T.tank(146); T.goo(150, 152, 13);
    // boss arena (one screen, camera locks at tx 160)
    T.fill(176, 177, 2, 12, 'S'); main.escapeWall = { x0: 176, x1: 177, y0: 2, y1: 12 };
    T.decor('ledring', 164, 2); T.decor('neon8', 160, 3, { text: 'FAT COTY' }); T.decor('stool8', 162, 12); T.decor('booth8', 166, 12);
    T.fridge(184); T.gas(185); T.tank(190); T.row(194, 198, 9, 'B'); T.fridge(202); T.tank(203); T.gas(207);
    main.exitTx = 216; T.sign(216, 9, 'EXIT', '#00ff66');
    T.cage(12);
    main.boss = { kind: 'fatcoty', tx: 171, deckRow: 13, trigger: 161, lockTx: 160, bounds: [160, 175],
      line1: 'FEED THE SNACK HE IS CRAVING.', line2: "DON'T LET HIM FILL UP. TOASTED!",
      fcLine1: "HEY! THAT'S MY FACE!", fcLine2: 'NOBODY FEEDS ME BUT ME. TOASTED!' };
    return { main };
  } };
