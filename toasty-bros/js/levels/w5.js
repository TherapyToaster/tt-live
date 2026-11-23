// World 5: SKULLZ BUMBO — a haunted toaster-kitchen underworld staged as a cardboard puppet theater (lore: lore/bumbo.md).
// Original level designs. Floors end at a giant static TV you walk into. Jam is always grape purple. No real brands, no money, no gore.
'use strict';
LEVEL_ORDER.push('5-1', '5-2', '5-3', '5-4');

// ---------------- 5-1 Crumb Hatch (Pop-Up Springs: bounce over walls too tall to jump) ----------------
LEVELS['5-1'] = { id: '5-1', world: 5, num: 1, name: 'CRUMB HATCH', time: 300, music: 'w5_hatch', start: { area: 'main', tx: 3 }, checkpoint: 108,
  build(){
    const W = 208, main = newArea('main', W, 'hatch'), T = areaTools(main);
    T.ground(0, 36); T.decor('bunting', 1, 2, { w: 12 }); T.sign(5, 7, 'POP-UP SPRINGS: BOUNCE OVER!', '#FFD400'); T.decor('jars', 10, 8); T.decor('cutout', 15, 13, { v: 0 });
    T.en('gremlin', 16); T.q(19, 9, 'mitt'); T.coins(18, 21, 6); T.en('gremlin', 24);
    T.spring(29); T.col(30, 6); T.col(31, 6); T.coins(29, 31, 4); // wall #1: too tall to jump, the spring vaults it
    T.decor('stagelamp', 34, 2);
    T.ground(37, 62); T.en('bbat', 42, 8); T.decor('tvcut', 44, 13); T.en('slime', 48); T.br(51, 9); T.q(52, 9, 'power'); T.br(53, 9); T.cage(56); T.gas(60);
    T.ground(66, 102); T.decor('cutout', 67, 13, { v: 1 }); T.en('gremlin', 70); T.spring(74); T.col(75, 6); T.col(76, 6); T.coins(73, 76, 3); T.decor('bunting', 70, 2, { w: 10 });
    T.en('snake', 82); T.decor('jars', 84, 8); T.q(88, 9, 'jam'); T.en('bbat', 92, 7); T.en('gremlin', 96); T.tank(100);
    T.ground(106, 150); T.decor('stagelamp', 107, 2); T.spring(112); T.plank(114, 118, 6); T.cage(116, 5); T.coins(114, 118, 4); // a high paper shelf: spring up for a caged bro
    T.en('slime', 120); T.en('gremlin', 126); T.decor('cutout', 128, 13, { v: 2 }); T.en('bbat', 134, 8); T.br(136, 9, 'coin'); T.br(137, 9); T.q(138, 9, 'mitt');
    T.spring(143); T.col(144, 6); T.col(145, 6); T.coins(142, 145, 3);
    T.ground(146, W - 1); T.en('gremlin', 152); T.en('snake', 158); T.cage(162); T.decor('tvcut', 165, 13); T.en('slime', 168);
    T.stairs(172, 6, true); T.col(178, 6);
    main.pole = { tx: 184 }; T.set(184, 12, 'S'); main.booth = { tx: 189, door: 192 };
    T.cage(12);
    return { main };
  } };

// ---------------- 5-2 Butter Drain (melted butter tide rises and falls: climb a crate before it floods) ----------------
LEVELS['5-2'] = { id: '5-2', world: 5, num: 2, name: 'BUTTER DRAIN', time: 300, music: 'w5_drain', start: { area: 'main', tx: 3 }, checkpoint: 104,
  build(){
    const W = 214, main = newArea('main', W, 'drain'), T = areaTools(main);
    T.tide({ low: 15.4, high: 11.5, period: 600, calm: 280, warn: 90, rise: 60, hold: 110, phase: 0 });
    const perch = (x, h) => { for (let k = 0; k < (h || 2); k++){ T.crate(x, 12 - k); T.crate(x + 1, 12 - k); } };
    T.ground(0, 40); T.sign(5, 7, 'BUTTER TIDE: CLIMB A CRATE!', '#FFD400'); T.decor('drainpipe', 8, 9); perch(12); T.en('slime', 18); perch(22); T.coins(22, 23, 9);
    T.decor('jars', 26, 8); T.en('gremlin', 28); perch(32); T.q(33, 8, 'mitt'); T.en('snake', 37);
    T.acid(41, 43, 13); T.set(41, 14, 'G'); T.set(42, 14, 'G'); T.set(43, 14, 'G'); // a puddle of hot butter (hurts): hop it
    T.ground(44, 76); perch(46); T.en('bbat', 50, 8); T.decor('drainpipe', 52, 8); perch(56); T.en('slime', 60); T.cage(63); perch(66); T.br(67, 8); T.q(68, 8, 'power'); T.en('gremlin', 70); perch(73);
    T.ground(80, 120); perch(82); T.en('snake', 86); T.decor('tvcut', 88, 13); perch(91); T.en('slime', 95); T.gas(98); perch(100); T.coins(100, 101, 8);
    T.en('bbat', 104, 7); perch(108); T.en('gremlin', 112); T.decor('drainpipe', 114, 9); perch(116);
    T.ground(124, 170); perch(125); T.en('slime', 130); perch(134); T.q(135, 8, 'jam'); T.en('snake', 139); perch(143); T.cage(147); T.en('bbat', 150, 8); perch(152); T.fridge(156); T.en('slime', 158); perch(161); T.en('gremlin', 166); perch(168);
    T.ground(174, W - 1); perch(176); T.en('snake', 181); T.stairs(184, 5, true); T.col(189, 5);
    main.pole = { tx: 194 }; T.set(194, 12, 'S'); main.booth = { tx: 199, door: 202 };
    T.cage(15);
    return { main };
  } };

// ---------------- 5-3 Cutlery Crypt (puppet-string swing planks over the pits) ----------------
LEVELS['5-3'] = { id: '5-3', world: 5, num: 3, name: 'CUTLERY CRYPT', time: 300, music: 'w5_crypt', start: { area: 'main', tx: 3 }, checkpoint: 98,
  build(){
    const W = 216, main = newArea('main', W, 'cutlery'), T = areaTools(main);
    T.ground(0, 30); T.sign(5, 7, 'RIDE THE SWINGING PLANKS', '#FFD400'); T.decor('forkrack', 9, 13, { n: 3 }); T.en('ghoul', 16); T.decor('cutout', 19, 13, { v: 1 }); T.en('gremlin', 24); T.q(26, 9, 'mitt');
    T.swing(34, 11, 2, 72, 0.66, 0.03, 0); // pit 31..38 (8 tiles)
    T.ground(39, 72); T.en('bbat', 44, 8); T.decor('forkrack', 46, 13, { n: 2 }); T.en('ghoul', 50); T.br(53, 9); T.q(54, 9, 'power'); T.br(55, 9); T.cage(58); T.en('snake', 63); T.tank(68); T.decor('clock5', 60, 3);
    T.swing(76, 11, 2, 72, 0.66, 0.032, 1.6); // pit 73..80
    T.ground(81, 120); T.en('ghoul', 88); T.decor('cutout', 90, 13, { v: 0 }); T.en('gremlin', 94); T.q(97, 9, 'jam'); T.en('bbat', 102, 7); T.decor('forkrack', 104, 13, { n: 3 }); T.en('ghoul', 110); T.cage(114); T.gas(106);
    T.swing(123.5, 11, 2, 72, 0.62, 0.03, 0); T.swing(130.5, 11, 2, 72, 0.62, 0.03, Math.PI); // a double pit 121..134: the planks swing toward each other
    T.ground(135, W - 1); T.en('snake', 140); T.en('ghoul', 146); T.decor('forkrack', 150, 13, { n: 2 }); T.en('bbat', 154, 8); T.q(157, 9, 'mitt'); T.en('gremlin', 160); T.cage(164);
    T.stairs(176, 6, true); T.col(182, 6);
    main.pole = { tx: 188 }; T.set(188, 12, 'S'); main.booth = { tx: 193, door: 196 };
    T.cage(12);
    return { main };
  } };

// ---------------- 5-4 Chrome Hall + Hive Broadcast: CHROME SCREAMER (FOIL PUPPET, mid-boss) + THE HIVE SKULL ----------------
// Lore: the real Chrome Screamer is one of your bros. The Hive Skull built a foil-and-cardboard string puppet of him to guard
// the Chrome Hall. Cut its strings and the gate opens.
LEVELS['5-4'] = { id: '5-4', world: 5, num: 4, name: 'CHROME HALL', time: 300, music: 'w5_chrome', start: { area: 'main', tx: 2 }, checkpoint: 110,
  build(){
    const W = 228, main = newArea('main', W, 'chrome'), T = areaTools(main);
    T.fill(0, W - 1, 0, 2, 'G');
    T.ground(0, 40); T.sign(5, 9, 'THE HIVE IS ON THE AIR', '#FFD400'); T.decor('curtain', 2, 9, { side: 'l' }); T.en('gremlin', 16); T.en('ghoul', 22); T.decor('tvcut', 25, 13); T.en('bbat', 30, 8); T.q(34, 9, 'mitt'); T.en('slime', 37);
    T.ground(44, 70); T.en('snake', 48); T.spring(53); T.col(54, 6, 12); T.col(55, 6, 12); T.en('gremlin', 60); T.cage(64); T.decor('combs', 66, 4); T.q(68, 9, 'jam');
    T.swing(74, 11, 2, 72, 0.66, 0.03, 0.8); // pit 71..78
    T.ground(79, 105); T.en('ghoul', 84); T.decor('puppetsign', 86, 4, { text: 'CHROME HALL', w: 64 }); T.en('slime', 92);
    // CHROME SCREAMER (FOIL PUPPET): dangles on strings in front of a cardboard-and-foil gate; cut its strings to open the way
    T.fill(104, 105, 3, 12, 'S'); T.en('foil', 99, 12, { gate: { x0: 104, x1: 105, y0: 3, y1: 12 } });
    T.ground(106, 158); T.cage(110); T.en('gremlin', 118); T.en('bbat', 124, 8); T.decor('tvcut', 128, 13); T.en('ghoul', 134); T.q(140, 9, 'power'); T.en('snake', 146); T.decor('combs', 150, 4); T.tank(127);
    T.ground(159, W - 1);
    // boss arena (one screen, camera locks at tx 160): the Hive Broadcast stage
    T.fill(176, 177, 3, 12, 'S'); main.escapeWall = { x0: 176, x1: 177, y0: 3, y1: 12 };
    T.decor('curtain', 160, 12, { side: 'l' }); T.decor('combs', 164, 4); T.decor('clock5', 167, 3); T.decor('combs', 170, 4); T.decor('stagelamp', 162, 3); T.decor('stagelamp', 172, 3);
    T.fridge(184); T.gas(185); T.tank(190); T.row(194, 198, 9, 'B'); T.fridge(202); T.tank(203); T.gas(207);
    main.exitTx = 216; T.sign(216, 9, 'EXIT', '#00ff66');
    T.cage(20); T.cage(94); T.cage(152);
    main.boss = { kind: 'hive', tx: 168, deckRow: 13, trigger: 161, lockTx: 160, bounds: [160, 175],
      line1: 'BZZT! LIVE FROM THE HIVE: YOU!', line2: 'TONIGHT: YOU GET TOASTED!!!',
      scrLine1: 'MY FOIL PUPPET OF YOU... CUT!', scrLine2: "FINE. YOU'LL DANCE FOR REAL!!!" };
    return { main };
  } };
