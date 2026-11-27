# Mr. Toasty: Toasty Bros — Worlds 1-8 (v1.0 FEED FAT COTY)
Original platformer by Coty Lake. SMB is a mechanics reference only; all art, audio, names and layouts are original and
procedural (pixel arrays + canvas + WebAudio). No external assets, no CDN, no build step. Jam is grape purple.

## Run
Open `index.html` directly (file:// works), or `python3 -m http.server` in this folder.
- Keyboard: Arrows/WASD move · Z/Space/K jump · X/Shift/J run + fire (hold = auto-fire) · F fire only · C/L special ·
  V/I melee · Down crouch / enter pipe · Enter start/pause.
- Gamepad (standard mapping): D-pad/left stick, A jump, B run+fire, X special, Y melee, Start.
- Touch (v0.5 hardened, see **Mobile controls** below): left 8-way D-pad, right A (jump) / B (run+fire) / S (special, OUT while in the TOAST TRUCK) / M (melee)
  + START, only on touch devices (force with `?touch`).
- Title menu: NEW GAME · CONTINUE x-x · BRO ROSTER · LEVEL SELECT (only with `?debug`).
- Save: `localStorage['toastyBros.save.v1']` = { furthest, hi, worldsCleared, unlocked, startBro } (older saves load fine).

## v1.0 FEED FAT COTY (World 8)
- **World 8 "Feed Fat Coty" is open** (8-1 THE FRONT ROOM → 8-2 THE STAINLESS KITCHEN → 8-3 THE CRAVING LINE → 8-4 TOO FULL! BOOTH).
  Warp pipe 8 from the 1-2 warp zone (the zone is widened so the drop-in at tx 2 stays clear), level select, and a World 7
  clear all lead here. The 7-4 end card teases "FEED FAT COTY: NEXT CHANNEL...". World 9 "Final Bite" stays a stub.
- A futuristic neon diner: white curved walls, red neon, stainless kitchen, oval windows, glossy floor, round blue LED ceiling.
  Distinct from World 4's classic diner. Tagline: feed the snack Fat Coty is craving, chain combos, don't let him fill up.
- **Hazards cost 1 heart:** snack pests (stompable), cooled-off plates (hurt only while cold; they telegraph), lime/gold goo
  splat patches. Conveyor belts in the kitchen carry you over pits. Glowing craving snacks chain a combo meter.
- **FAT COTY** (9 HP, 3 phases) is the 8-4 boss, using the same look as the playable bro (goatee, gold-mirror shades, black
  ACID cap, black tee with a blue streak, silver chains), just scaled up. Shots and snacks only count while he is craving
  (his open window). Telegraphed belly flops, flying plates and goo drips. "Coty will be right back. A little rounder."
  then "Too full!". Defeat is "TOO FULL!" then the TOASTED! escape. Autopilot (all 8 bros, including SkulRz's short roll)
  can beat him fairly — not a pushover, and no free armor on the way.
- A TOAST TRUCK is parked left of the 8-1 start and mid-level in 8-4 for a ride to the booth.
- Tests: `test_w8.py` (content, autopilot 8-1..8-4, 1-heart hazards, combo snacks, 8-bro Fat Coty, warp pipe 8, 7-4→8-1,
  mobile, no console errors). Every earlier suite stays green.

## v0.9 TOASTY ARCADE (World 7 + TOAST TRUCK)
- **World 7 "Toasty Arcade" is open** (7-1 THE LOBBY → 7-2 PRIZE SHELVES → 7-3 NO SIGNAL HALL → 7-4 CASTLE JACKPOT VAULT).
  Warp pipe 7 from the 1-2 warp zone, level select, and a World 6 clear all lead here. The 6-4 end card teases
  "TOASTY ARCADE: NEXT CHANNEL...". World 8 "Feed Fat Coty" is open as of v1.0.
- **JACKPOT VAULT** (9 HP, 3 phases): shots only count while the payout button glows. Token waves, claw slams and
  ticket drips are the hazards. Autopilot (including SkulRz's short roll and Fat Coty's snack spray) can beat it
  fairly — telegraphs and open windows were tuned; the boss is not a pushover and there is no free armor to get there.
- **3-hit health still applies in World 7.** Arcade hazards cost 1 heart. Pits and CRT screens that switch off stay instant.
- **TOAST TRUCK**: an original angular stainless-steel electric pickup with a bed-mounted minigun (unbranded parody;
  no real auto marks). Parked in 2-1, the 7-1 lobby, and a 7-4 run to the vault. Down while overlapping a pickup boards
  you; you ride in the bed as gunner and a roster co-driver sits in the cab. Left/right have momentum either way, jump
  hops small gaps, fire or run shoots with spin-up, shell casings and a light overheat, up/down (touch d-pad too) aim
  about ±30°. The truck crushes small enemies, smashes destructible tiles, and has its own 6-hit bar. A wreck ejects
  you with your 3 hearts intact; pits still kill. Special or the touch OUT button dismounts. Tagged reusable for
  World 10's moon stretch later.
- Polish: stomp hit-stop and a little screen shake, a short in-level title plaque, factory steam parallax, and a taller
  dim band under big phase banners so the level sign behind them no longer clashes with the letters.
- Tests: `test_w7.py` (79 checks, including the 8-bro Vault and 1-heart hazard checks) and new `test_truck.py` (28 checks:
  board, drive, aim, fire, crush, smash, wreck/eject, pits, touch).

## v0.8.1 3-HIT HEALTH (live on the ARTcade)
- **Every bro has 3 health.** Each enemy, projectile, hazard or boss hit costs 1 pip, with a 2-second invulnerability flash and a
  small knockback hop (ground hits only, so a mid-air hit never shoves you into a pit). The 3rd hit costs a life, or brings in the
  reserve bro, as before.
- Health refills to 3 on a new life, on every level start, and when you free a caged bro.
- Toast Armor, the Jam Packet's armor and the Oven Mitt stay extra shields on top of the 3 (they're used up first).
- Still instant: falling in a pit (jam/magma pits included), the TOASTED! blast front, and the level timer. Acid puddles cost 1 pip
  and bounce you out.
- HUD: 3 small toast-red hearts under the special pips (x 4..26, y 31..37), clear of the name slot, FREED and the armor icon.
  The lost pip blinks white. About 10 CSS px per heart on an iPhone in landscape.
- Fix: respawning at a checkpoint never drops you over a pit (1-3's checkpoint sat above falling platforms and killed you on respawn).
- World 7 was still gated in this drop (`WORLDS[7].built = false`). Opened in v0.9.
- Tests: new `test_health.py` (22 checks). `test_w5.py` chain needs 1+ Hive slam (the 3-hit autopilot can win faster).

## v0.8 MR. TOASTY'S CRYPT
- **Fix: the persona line clears on a bro switch.** "THAT'S A FOIL KNOCKOFF OF ME!" (and any other line tied to a bro's persona) is
  tagged with that bro and removed as soon as you swap to another bro.
- **Fix: BRO FREED waits for boss name cards.** While a boss name card or a big phase banner is on screen, the BRO FREED banner is
  held (its timer is frozen) and shows right after, so it never covers the name.
- **World 6 "Mr. Toasty's Crypt"** (6-1 → 6-4, boss THE QUARTZ KING). See the World 6 section below.
- New world pickup from the lore: **Hot Sauce** (relic). For 10 seconds you fire about twice as fast, and shots glow hot. A bar
  sits at the bottom left. It comes out of `?` blocks in World 6.
- Warp pipe 6 (a short pipe between channels 2 and 3 in the 1-2 warp zone) → "CHANNEL 6" → 6-1. Clearing 5-4 now leads to 6-1.
  Level select and saves cover 6-1..6-4.
- `staticFill()` (TV snow on cards and transitions) no longer reads pixels back from the main canvas, which removes a Chrome
  `willReadFrequently` console warning.
- Autopilot: walks to the RGB switch when the timer won't last through the next section (hopping other blocks, never the switch),
  times jam-geyser boardings (brakes at the lip, jumps on hold/rise, waits at the far edge for the next geyser), takes Glitch Doors,
  backs off lit Fuse Buns, and fights the Quartz King with the Hive-style boss logic (slam waves, spikes, prism beams, shard minions).

## v0.7 SKULLZ BUMBO
- **World 5 "Skullz Bumbo"** (5-1 → 5-4, mid-boss CHROME SCREAMER (FOIL PUPPET), boss THE HIVE SKULL). See the World 5 section below.
- New world pickup from the lore: **Oven Mitt** (blocks the next hit, then it's used up). It comes out of `?` gift boxes in World 5.
- Warp pipe 5 (a short pipe against the right wall of the 1-2 warp zone) → "CHANNEL 5" → 5-1. Clearing 4-4 now leads to 5-1.
  Level select and saves cover 5-1..5-4.
- Boss death-throes pops (Hive Skull and The Repairman) are now visual only (`owner: 'fx'`); before, they could hurt you during
  the dying animation.
- Autopilot: rides Pop-Up Springs (its stuck/back-up rule no longer fires mid-bounce), waits out the butter tide on crate perches,
  side-steps butter globs, takes full hops over hot butter puddles, times swing-plank boardings and jumps off at the far end,
  brakes before a swing pit, cuts the foil puppet's strings from range, and in the Hive fight hops slam waves straight up,
  never walks into the Hive, escapes honey drips to one side and turns to shoot Buzz Crumbs.

## v0.6 TOASTER CARDS
- **HUD fix**: a long bro name (BREADLORD) used to run into the SKULLZ label. The name now sits in a fixed-width slot (x 24..71;
  SKULLZ starts at x 76). `drawFit()` in `js/font.js` draws the name at full size when it fits. If not, it switches to a
  3x5 tiny font, and if that still doesn't fit it truncates with a dot. All 8 bros and two stress names are pixel-checked in `test_w4.py`.
  BREADLORD uses the tiny font, and the rest stay full size. The score line under the name is back too (a v0.6 HUD edit had swallowed it).
- **World 4 "Toaster Cards"** (4-1 → 4-4, game: BURNT OFFERINGS, boss THE REPAIRMAN: CAL'S EVIL RERUN). See the World 4
  section below.
- New items: **Jam Packet** (grape purple #b54e8c: armor, or +1 special if you already have it) and **Diner Bell** (freezes
  every enemy for 3 s, "ORDER UP!").
- Warp pipe 4 now goes to World 4 (4-1). Level select and saves cover 4-1..4-4.
- Sprite outlines read pixels through a throwaway `willReadFrequently` canvas (`readPixels()` in sprites.js). This stops the
  Canvas2D readback console warning.
- Autopilot: it times giant-card hops and settles on the face-up card below, holds weapon range at the Fuse Box and hops its floor sparks, runs from
  aiming/diving Burnt Bagels, hops mold patches, and in the boss fight dodges card-zap columns, hops low wrenches and sidesteps Reflections.

## v0.5 TOASTER PIT
- **World 3 "Toaster Pit"** (3-1 → 3-4, boss THE BREADLORD), built with bros, cages, destructibles and explosions from the
  start. See the World 3 section below.
- **Mobile controls hardening pass** (see Mobile controls below).
- Fixes: (a) explosion popup labels no longer overlap or garble: popups that would land on top of each other stack upward,
  and repeated labels merge into one with a count ("CHAIN X4"). (b) The 1-4 firebar spots (tiles ~18, 27, 74, 111, 115): the 76 and 113 bars moved one tile
  (77 / 114) to clear the block row and the falling-plat landing. The autopilot cuts a jump short instead of rising into a
  sweep and never backs up into a firebar or beam. (c) The `G.deathCause` stack-trace capture only runs with
  `?debug`. (d) World 1's `shots/w1/boss.mp4` was re-recorded against the current 1-4 (warp tx 122).
- World 2 fairness tweaks found by the new per-bro runs: the 2-3 Rival Truck gunner moved off the gap's landing spot (now
  guards the flag at tile 191), and a stepping plank (35-37) sits under the 2-3 lift.
- Autopilot: the bot waits out a Jam Skull mid-hop, hops or outruns ground shockwaves, outruns bullets that chase it, can take
  a jump over an edge when a landing is within 5 tiles, and avoids coils, forks and spike reels with a shared `danger()` check.

## Mobile controls (v0.5)
- **Layout**: left 8-way virtual D-pad (one zone with a knob: slide your thumb between directions). On the right are
  A = jump, B = run/fire (hold = auto-fire), S = special and M = melee, plus START (pause). Every control is at least 44 CSS
  px (D-pad 132–176 px, A/B 60–76 px, S/M ≥ 48 px, START 72x44). They are semi-transparent with a pressed state.
- **True multi-touch**: each finger is tracked by its touch identifier. The whole control state is rebuilt from the live touch
  list on every event, so nothing sticks. A finger on the action side can roll from B onto A (run-jump). Taps shorter than a
  frame still register: there is a one-frame latch, so a tap is a short hop and a held A is a full jump (variable jump).
- **No browser gestures**:
  - The viewport meta has `user-scalable=no, maximum-scale=1, viewport-fit=cover`.
  - `touch-action:none` is set on html/body/canvas/controls. Touch callout, text selection, tap highlight and overscroll are off.
  - touchstart/move/end listeners are `passive:false` and call `preventDefault()`.
  - The dblclick, gesturestart/gesturechange, contextmenu and selectstart events are blocked.
- **Audio** unlocks on the first tap: `resume()` runs inside the gesture (also on touchend for iOS) and also recovers from
  'interrupted'. A one-time silent buffer plays.
- **Fit**:
  - Landscape centres the screen between the thumb gutters. Scaling is an integer when it's within 84% of the available space,
    otherwise quarter steps (844x390 → 1.5x). Pixels stay square.
  - Portrait puts the screen on top and the controls below, with a "ROTATE FOR A BIGGER SCREEN" hint.
  - Layout respects safe-area insets (`env(safe-area-inset-*)`) and re-lays out on resize, orientationchange and
    visualViewport resize.
- **Lifecycle**: the game auto-pauses when the page is hidden or on pagehide ("PAUSED / TAP START TO RESUME"). All touches and
  keys are released on blur, pagehide, visibilitychange and touchcancel. The title screen shows touch control hints on touch
  devices.

## v0.4 BRO EDITION (Worlds 1 + 2)
The platformer core stays: stomping, "?" blocks, skullz (coins) and the Channel Pole all work as before. On top of that:
- **8 original bros** (`js/bros.js`, data + pixel frames, same 12x15 hitbox): each has a gun, a melee move and a special
  (3 per life; an **ammo crate** dropped by gun enemies refills them).

| Bro | Gun | Melee | Special |
|---|---|---|---|
| Mr. Toasty | toast-rocket gun (small blast) | toaster jab | crumb burst (ring blast) |
| Fat Coty | snack spray (short, rapid) | bite (heals: gives Toast Armor) | body slam (jump + ground pound blast) |
| Toaster Truck Skeleton | butter blaster (5-pellet spread, breaks bricks) | bony jab | truck-ram dash (smashes through terrain) |
| Acid | long shot (piercing sniper) | elbow | jetpack hover |
| Breadlord Jr. | IOU spread (3 paper notes) | loaf slap | debt curse (freezes every enemy on screen, "IOU ALL OF YOU") |
| Chrome Screamer | shriek cone (passes through enemies, breaks bricks/crates/barrels) | crystal bonk | mirror shield (reflects bolts and bullets) |
| Cal the Repairman | static zapper (fast) | wrench (breaks ground) | TV turret (auto-fires for 10 s) |
| Skulrz Skull | roll dash (bonks enemies) | headbutt | bone bomb (thrown, big blast) |

- **Rescue cages** (2–4 per level, 'C' tiles): shoot, punch or blow one up → "BRO FREED!" banner, you swap into a random other
  bro, +1 life and +1 reserve bro. Freeing a cage unlocks the next locked bro permanently (saved). When you die you come back
  as the next reserve bro (or a random unlocked one). **BRO ROSTER** (title menu) shows unlocks and sets your starting bro.
- **Destructible terrain**: ground/bricks/stone/crates take damage with 3 crack stages (TILE_HP: ground 3, brick 2, stone 4,
  crates/barrels 1). The bottom row is bedrock, the level borders, the Channel Pole area and boss arenas can't break.
  Collision updates live (dig a crater, fall in).
- **Explosions** (one radius system): grape-jam barrels, propane-style tanks and gas cans chain-react with a short delay; screen
  shake + hit-stop; sparks, crumbs, smoke and grape-purple jam (no gore). Your own blasts don't hurt you; barrel blasts do.
- **Wall-slide + wall-jump**: press into a wall in the air to slide slowly; jump to kick off. Grabbing a ledge just above you
  pops you up onto it.
- **Run-and-gun enemies**: World 1 **Antenna Skull riflemen** (red band, laser sight, 3-round burst); World 2 **Rival Truck
  gunners** (roof turret, 4-round burst). Enemies have HP, flash when hit and get knocked back. **Toast Armor** (the old grow
  power-up) is now an extra hit instead of growing.
- **TOASTED! castle escape**: after THE GLITCH (1-4) and THE GRAND TOASTER (2-4) a sealed wall blows open, a wall of
  explosions chases you from the left ("RUN! EXIT >>>"), and you sprint to the green EXIT door for the world-clear card.
- **Autopilot combat mode** (`?autoplay`): the bot still navigates the platforming, and now aims (never fires rockets/shrieks
  toward nearby barrels), shoots cages, melees, uses safe specials, wall-jumps out of pits and runs the escape.
- URL flags: `?debug` level select (worlds 1–3 playable, 4–10 listed as COMING SOON; X cycles starting size) · `?autoplay` demo bot ·
  `?test` stepped mode for headless tests (`window.TT` hooks) · `?touch` force touch UI.

## World 1 — No Signal Skullz
| Level | Name | Theme / new stuff |
|---|---|---|
| 1-1 | Skull Wall Office | v0.1 level + 40-tile cubicle section (246 tiles), bonus pipe room, Channel Pole |
| 1-2 | Toast Factory | underground: conveyors, butter barrels, Antenna Skull (slow signal bolts), Butter Bomber (dive → slippery butter patch), hidden Spare Play Card, secret no-hint pipe at tile 120 → WARP ZONE (2/3/4) |
| 1-3 | Acid Rain Alley | night rooftops: moving + falling platforms, wide gaps, acid puddles, Mimic blocks (fake CRT "?" blocks that bite) |
| 1-4 | Broadcast Tower | castle: rotating static bars, static beams, glitch void floor, v0.3 extra gauntlet before the boss bridge (falling plats, firebar roof, moving plat, beam), boss THE GLITCH |

Progression 1-1 → 1-4 carries score, skullz, lives and power-up size; every level opens with a "WORLD 1-x" card + lives.
Warp zone: pipe 2 → "CHANNEL 2: TOASTER KART / SIGNAL FOUND!" → 2-1. Pipes to unbuilt worlds show COMING SOON and retune to the
first level of the latest built world (2-1). Clearing 1-4 → World 1 clear card → START → 2-1.

**THE GLITCH**: crossing onto the bridge freezes play for Mr. Toasty's line "I AM THE INSIDER THREAT TO THE GLITCH!!!", the
camera locks, then a readable loop: walk (hops) → charge (eyes flash) → volley (alternating LOW bolts = jump, HIGH bolts =
duck or stay small; 3 shots, 5 when HP ≤ 2) → leap toward you (run underneath) → recover. Win by touching the UNPLUG switch
behind it (bridge collapses into the void, boss falls) or by 5 toast-rocket hits (then unplug to end). World-clear card
teases "TOASTER KART: NEXT CHANNEL…".

## World 2 — Toaster Kart (lore: ../lore/kart.md)
Saturday-morning cartoon look (`js/toon.js`): thick navy outlines, flat bright colors, 3-step shading. Surf-rock chiptune per
level (`w2_suburb`, `w2_tide`, `w2_under`, `w2_grave`, `w2_castle`) + rumbly `w2_boss` (tremolo lead, spring echo, tom fills).
Coty's truck is "the Toaster Truck" (original wedge pickup) and its plate always reads THERAPY TOASTER. Surf City shops are
parodies (CRUMB CORNER, JAM DROP CLEANERS, CRUST WASH, BUTTER UP BARBER, BAIT 'N' TOAST, TIDE TOWER).

| Level | Name | Theme / new stuff |
|---|---|---|
| 2-1 | Monday Errands | suburb, sky shifts day → sunset; Rival Trucks (rev + honk, then charge; stomp the cab or dodge; they stall on walls); puddles (slide); boost pads (speed burst) |
| 2-2 | Toaster Tide Run | boardwalk over the marsh: pastel stilt cottages, water tower, bait shack; Crumble Pier (one-way planks you can drop through with DOWN, crumble planks that fall ~0.5 s after you stand on them and grow back); butter slicks; broken pier → pipe to the under-pier section |
| 2-3 | Skullz Graveyard | purple graveyard under a pink sky; ground platforming + a sky section; Graveyard Skeletons (stomp → bone pile → reassemble), crossover Crumblings, homing Toast Rocket launchers (stomp a rocket to pop it) |
| 2-4 | Toaster Fortress | junkyard on a high-rise bridge, flame vents, trucks, launchers; boss THE GRAND TOASTER |

Optional **850HP Lightbar** item (blocks in 2-1, 2-2 under-pier, 2-3, 2-4): long speed boost + lightbar on Mr. Toasty's head.

**THE GRAND TOASTER**: intro line "NICE CHROME, BIG GUY. / TIME FOR A RECALL!!!", camera locks, then a loop of pop (flaming
toast arcs that burn where they land) → rev + ram the lane (revs up over ~20 frames; jump onto its roof) → butter the deck →
ram. Win 3 ways: 3 bounces on the lever on its roof (it bucks you off and immediately revs), reflected Toast Rockets (at 1 HP it
fires one before the butter run; stomp it: RETURN TO SENDER), or Toast Launcher rockets (3 dents = 1 HP). Defeat animation
(sparks, smoke, DING) → World 2 clear card teasing "TOASTER PIT: NEXT CHANNEL...". All boss behaviour is deterministic.

## World 3 — Toaster Pit (lore: ../lore/pit.md)
A grimy PS1-ish basement translated to pixel art (`js/pit.js`):
- Look: wet concrete, pipes and graffiti tags (TOASTY, PIT, CRUMBS, BREADLORD), posters ('FEED THE BREADLORD', 'ITS ART THERAPY')
  and neon magenta/cyan trim.
- Post-fx: bloom (a blurred 'lighter' pass), glitch bands, scanlines and a vignette that turns red during the curse.
- Jam is always grape purple (#8a3fd1). There are no slot/gambling names, no cash and no wallets. The "reels" are art-therapy
  symbol wheels (skull / jam / crumb / burnt toast).

Music is D-minor lo-fi:
- `w3_basement`: 84 bpm, vinyl crackle, pad
- `w3_wiring`: 112 bpm, mains-hum ostinato, clanks
- `w3_reels`: 124 bpm walking bass, arp
- `w3_vault`: 96 bpm, drone and tremolo
- Boss `w3_boss`: 150 bpm, tritone bass D/G#, rumble

| Level | Name | Theme / new stuff |
|---|---|---|
| 3-1 | Graffiti Basement | Jam Skulls (hop, drip grape jam), Butter Skulls (slide, leave butter), mini fridges (explosive, chain into tanks), Crumb Tray "?" block, exit pipe → fridge bonus room (camera-locked, pipe back to tile 124), 4 cages |
| 3-2 | Toaster Wiring | toaster coils in the floor (dark → orange WARN → glowing ON on a fixed cycle), fork-and-outlet sparks (an arcing spark jumps between outlets; one vertical ceiling→floor zap), 4 cages |
| 3-3 | Reel Tunnels | low tunnel ceiling; spinning reel platforms (stop on SAFE = stand, BOUNCE = spring up, SPIKE = hurt); ceiling Smoke Detectors (beep, then drop a shock pulse that makes a floor wave); Rubber Skulls (bounce toward you); Crust Goons (gun variant: aim, then two 3-way spreads; drop ammo) |
| 3-4 | Breadlord's Crumb Vault | everything mixed, crumb piles, boss THE BREADLORD, TOASTED! escape |

- **Crumb Tray** (new item): 9 s skull(coin) magnet with a cyan/magenta orbit; it flashes "TRAY FADING" near the end.
- **THE BREADLORD**: Mr. Toasty's line "MY DEBT IS ART THERAPY, / AND THERAPY IS FREE!!!", then the camera locks. He sits
  behind a ledger table (6 HP; hit him with guns, rockets or specials).
  - Phase 1 cycles: slices (arcing toast that bounces), IOU notes (alternating low = jump, high = stay low), table slam (a floor
    shockwave to hop).
  - Phase 2 (HP ≤ 3, "THE REELS ARE SPINNING"): adds the reels window. Three symbols resolve into effects: a skull spawns a Jam
    Skull, jam drops a puddle, crumbs rain and burnt toast fires a slice.
  - The first phase-2 spin (and every third after) is **three Burnt Toasts → "BURNT x3: CURSED!"**: the arena dims red and two
    waves of crumb lanes fall (gaps are telegraphed).
  - At 0 HP the screen reads **"DEBT PAID"**. The ledger burns and pages fly, and the Breadlord crumbles to crumbs. Then the
    sealed wall blows and the **TOASTED!** escape runs to the EXIT door.
  - The World 3 clear card shows the burnt table + PAID stamp and teases **"TOASTER CARDS: NEXT CHANNEL..."** (World 4).
- Progression: clearing 2-4 → World 2 card → START → 3-1. Warp-zone pipe 3 → "CHANNEL 3" → 3-1 (since v0.6, pipe 4 → 4-1). Level select lists 3-1..3-4. Saves record `furthest`/`worldsCleared` for World 3.

## World 4 — Toaster Cards (lore: ../lore/cards.md, game: BURNT OFFERINGS)
A grimy 24-hour diner at 3 a.m. (`js/diner.js`):
- **Look**: dim, lo-fi and buzzing. Props include a neon "OPEN 24 HRS / TOAST" sign, the TOAST TUNES jukebox, the CRUMB-O-MAT, a payphone,
  chrome stools, a mop bucket, a "NO REFUNDS" sign and night windows with blinds. Fluorescent tubes flicker. The level also has
  checker / diamond-plate floors, subway tile and hazard stripes.
- **Post-fx**: bloom, scanlines, tape hiss, glitch bands and a vignette. Enemies and cards glitch with an RGB split (magenta/cyan).
- **Content rules**: jam is always grape purple (#b54e8c). There are no names, art or text from other card games, no gore, drugs,
  crude jokes, money or real brands. Explosions are sparks, crumbs, smoke and grape jam.

Music is a late-night jukebox gone wrong. These are original doo-wop-style progressions with a lounge organ, tape-wow warble, hiss and fluorescent buzz:
- `w4_diner`: C, I-vi-IV-V, 112 bpm
- `w4_kitchen`: D, 132 bpm, fryer clatter
- `w4_booth`: Am-F-C-G, 96 bpm
- `w4_repair`: the diner tune in minor, with CRT whine
- Boss `w4_boss`: the same diner tune slowed to 84 bpm, pitched down, distorted through a waveshaper and warbling

| Level | Name | Theme / new stuff |
|---|---|---|
| 4-1 | Diner Floor | Crumb Rats, Crouton Swarms (a hit splits one into 3 crumbits), Moldy Loaves (slow walkers that leave mold patches: the patch slows you, then drains armor if you stand in it). Booths and stools are platforms. The fluorescents flicker the room dark in rhythm (a 420-frame cycle with a stutter warning; a little light stays around the bro and the neon) |
| 4-2 | Kitchen + Grease Trap | grease vats (deadly), slippery grease floors, rising fryer-basket platforms, Pop-Ups that launch out of toaster slots (the slot glows first), Toast Ghosts (fade out when hit, come back once as "BOO-RERUN!", then stay down), Short-Order Cooks |
| 4-3 | The Last Booth | giant playing-card platforms that flip face-down and back on a timer, with a shake + color-fringe warning. The flip wave runs left to right, so it chases you. Rye Knights (crust shields block shots for themselves and anything up to ~3 tiles behind them; explosions and stomps get through), Static Slices (teleport next to you), Burnt Bagels (hover, aim, dive and explode), Short-Order Cook (the W4 gun enemy: two grease pellets, drops ammo) |
| 4-4 | The Repairman's Shop | a back-room repair shop full of CRTs. Mini-boss **The Fuse Box**: every ~7 s it mirrors the whole picture left/right (controls stay the same; the bottom of the screen says so) and fires low floor sparks. Blow it to open the gate. Then boss **THE REPAIRMAN**, TOASTED! escape |

- **THE REPAIRMAN: CAL'S EVIL RERUN**: a CRT head with an animated static face, overalls with a CAL patch, a tool belt and a
  wrench. The intro reads "YOU'RE NOT CAL. YOU'RE A RERUN, / AND ALL REPAIRS ARE FINAL!!!", then the camera locks. He has 9 HP.
  - Phase 1: thrown wrenches (low = jump, high = stay put, they boomerang back) and face-down cards slid across the floor.
    The cards flip into zap columns, and one of them is always a dud you can stand on.
  - Phase 2 "THE LEAN" (HP ≤ 6): he leans in, everything gets faster and attacks come in pairs. The music speeds up.
  - Phase 3 "IT'S YOU" (HP ≤ 3): he spawns **Reflections**, mirror copies of whichever bro you're playing that copy your
    moves from across the arena. They fade in before they can touch you.
  - At 0 HP: **"CANCELLED"**. The CRT shuts off, then the TOASTED! escape runs to the EXIT.
  - Lore: this is a static clone, **Cal's Evil Rerun**. The real Cal was on break. Cal is still a playable bro. If you fight
    the rerun as Cal, the lines change to "WAIT... THAT'S MY FACE?!" / "NOBODY RERUNS CAL!!!".
  - The World 4 clear card says "THE RERUN IS CANCELLED / THE REAL CAL WAS ON BREAK". It shows the dead NO SIGNAL CRT,
    the real Cal with his coffee and your bro, and teases **"SKULLZ BUMBO: NEXT CHANNEL..."** (World 5).
- Progression: clearing 3-4 → World 3 card → START → 4-1. Warp pipe 4 → 4-1. Level select lists 4-1..4-4, and saves record World 4.

## World 5 — Skullz Bumbo (lore: ../lore/bumbo.md)
A haunted toaster-kitchen underworld staged as a **cardboard puppet theater** (`js/bumbo.js`):
- **Look**: hand-drawn cutouts with scribbly marker outlines, masking tape, corrugated cardboard edges and wobbling paper hinges.
  Every floor ends at a giant static TV booth you walk into. Lore palette: kraft #c4a06a/#e0c894, dark kraft #6a4a28, paper #f3ead4,
  ink #14100c, tape #dcc888, stage #100e0c, bone #e6d5b8, ember #c45e28/#e07830, yellow #FFD400, jam #b54e8c. Post-fx: paper grain,
  warm tint, dust, vignette and a stage spotlight.
- **Content rules**: no Legend of Bum-bo or Binding of Isaac names, art or text; no TSTK art; no specific SkulRz tokens; no weed-leaf
  bandana pieces; no gore, money or real brands. Jam is always grape purple.
- **Enemies**: Crust Gremlin (scurries, hops at you), Butter Slime (lobs arcing butter globs that leave a slick), Fork Ghoul (winds up
  and lunges), Burnt Bagel Bat (hovers, swoops), Cord Snake (slithers, sparks, then zaps a ring around itself), Chrome Screamer
  (foil puppet, mid-boss) and Buzz Crumbs (the Hive's minions).

Music is an original creepy-cute puppet-show march (pizzicato pluck, toy piano, kazoo with a bassoon double, woodblock and cardboard-box percussion, oom-pah bass):
- `w5_hatch` 5-1, `w5_drain` 5-2, `w5_crypt` 5-3, `w5_chrome` 5-4 (the march pitched down)
- Boss `w5_boss`: the same march with a buzzing distorted sawtooth, a hive hum and a tick-tock clock

| Level | Name | Gimmick |
|---|---|---|
| 5-1 | Crumb Hatch | **Pop-Up Springs**: walls too tall to jump; hop onto the spring to bounce over (one spring leads to a paper shelf with a cage) |
| 5-2 | Butter Drain | **The butter tide**: melted butter floods the floor on a timer (calm → "BUTTER RISING!" warning → rise → high → drain). Wait it out on crate perches; touching it hurts ("BUTTERED!") |
| 5-3 | Cutlery Crypt | **Swing planks**: planks on puppet strings swing like pendulums over wide pits; the last pit has two planks swinging toward each other |
| 5-4 | Chrome Hall | springs + a swing pit, then the **foil puppet** gate, then the Hive Broadcast stage: **THE HIVE SKULL**, TOASTED! escape |

- **Chrome Screamer, handled like Cal's Rerun**: the real Chrome Screamer is one of your bros. The Hive Skull built a foil-and-cardboard
  **string puppet** of him to guard the Chrome Hall ("FOIL PUPPET" card). It hovers on strings, drops to the boards and shrieks ground
  waves both ways (twice when it's low). Shoot it down: "STRINGS CUT!", it crumples and the gate opens. If you play as Chrome Screamer
  he says "THAT'S A FOIL KNOCKOFF OF ME!", and the Hive's lines change to "MY FOIL PUPPET OF YOU... CUT!" / "FINE. YOU'LL DANCE FOR REAL!!!".
- **THE HIVE SKULL**: a yellow-and-black honeycomb skull worked on strings from the flies. Spotlight intro, then its name card slams down. 9 HP.
  - Phase 1: hops at you and floor-slams (shockwaves both ways), honey drips with a warning shadow that leave sticky puddles (slow you).
  - Phase 2 "THE HIVE STIRS" (HP ≤ 6): double slams, faster, Buzz Crumbs.
  - Phase 3 "SWARM TIME!" (HP ≤ 3): faster again, three drips, more Buzz Crumbs.
  - At 0 HP: **"CURTAIN!"**, the stage curtains close, then the TOASTED! escape.
  - World 5 clear card: "THE HIVE SKULL TAKES A BOW / SKULLZ BUMBO: CURTAIN CALL!", with the Hive bowing on its strings and a little
    cardboard TV flashing CH 6, teasing **"MR. TOASTY'S CRYPT: NEXT CHANNEL..."** (World 6).
- Progression: clearing 4-4 → World 4 card → START → 5-1. Warp pipe 5 → 5-1. Level select lists 5-1..5-4; saves record World 5.

## World 6 — Mr. Toasty's Crypt (lore: ../lore/crypt.md)
A haunted glitch crypt under Toast Town, half tomb and half busted server room (`js/crypt.js`):
- **Look**: crisp pixel stone with RGB split, scanlines and CRT glow. Skull portraits in gold frames, CRTs, server racks, cables,
  candles, smoke and static. The Toast-O-Matic vending machine is decor only ("OUT OF ORDER"). Lore palette: ink #0b0a0f,
  bone #f4f1e8, ash #b9b2a2, toast gold #ffd400, crust #c8862a, burnt #8a5a12, magenta #ff2bd6, cyan #00f0ff, alarm red #ff2045,
  deep crimson #8a0f25 (used only for trim), and jam #b54e8c. Pits are jam (6-2) and magma (6-4); 6-3 has an RGB grid background.
- **Content rules (the lore's do-not-use list)**: no goats; no real brand or IP names (no Binding of Isaac or Undertale names, art or
  text); nothing crude or political; no pay-to-win, token, wallet, coin or shop mechanics; Coty personas only as main bosses. No gore.
  Jam is always grape purple.
- **Enemies (from the lore)**: Rage Toaster (sees you, revs, charges, pops toast), Burnt End (splits into two crumbs that crumble
  away), Butter Blob (slow, leaves a slippery trail), Static Skull (floats, static-blinks so shots pass through, fires a 3-shot RGB
  burst), Glitchling (teleports next to you), Fuse Bun (waddles up, lights its fuse, pops) and Quartz Shards (the King's minions).

Music is original procedural glitch chiptune: minor-key dungeon loops through a bitcrusher, with bitcrushed minor stabs and stutter fills.
- `w6_halls` 6-1, `w6_jam` 6-2, `w6_frame` 6-3, `w6_core` 6-4 (the halls loop pitched down with a rumble)
- Boss `w6_boss`: the same loop, faster (150 bpm) and distorted

| Level | Name | Gimmick |
|---|---|---|
| 6-1 | Crypt Halls | **Glitch Doors**: walls sealed floor to ceiling; walk into the magenta IN door and come out of the cyan OUT door past the wall (one leads up to a shelf with a cage) |
| 6-2 | Jam Kitchen Pits | **Jam geysers**: grape-jam columns over jam pits (idle → bubbling warning → rise → hold → sink). Ride them across, and get off before they sink |
| 6-3 | Glitch Mainframe | **RGB switch**: bump or shoot the switch and, for 8 seconds, cyan bridges turn solid and magenta firewalls drop (the timer bar is at the bottom). Four sections |
| 6-4 | Toaster-Core Castle | a Glitch Door, a geyser and an RGB firewall over magma, then THE SLAB: **THE QUARTZ KING**, TOASTED! escape |

- **THE QUARTZ KING** (Coty's pick, based on his real quartz skull collection): a crystal skull with a quartz crown. Intro dialog, then
  its name card. 9 HP.
  - Phase 1: hop-slams that send crystal shock waves both ways, and quartz spikes that erupt under you after a warning glint.
  - Phase 2 "PRISM MODE" (HP ≤ 6): crown points snap off, prism beams strike from the ceiling, a Quartz Shard minion joins.
  - Phase 3 "FULL FACET" (HP ≤ 3): faster, more beams and spikes.
  - At 0 HP: **"CROWNLESS!"**, then the TOASTED! escape.
  - Playing as Fat Coty changes the lines to "MY QUARTZ SKULL?! OFF THE SHELF?!" / "BACK IN THE DISPLAY CASE. NOW!".
  - World 6 clear card: "THE QUARTZ KING IS CROWNLESS / MR. TOASTY'S CRYPT: CLEARED!", with the crownless King on his slab and an
    arcade cabinet showing CH 7, teasing **"TOASTY ARCADE: NEXT CHANNEL... WORLD 7 - COMING SOON"**.
- Progression: clearing 5-4 → World 5 card → START → 6-1. Warp pipe 6 → 6-1. Level select lists 6-1..6-4; saves record World 6.

World 10 is named **THERAPYTOASTER TO MARS** (display "TherapyToaster to Mars"), set only in `js/worlds.js`.

## Code layout (data-driven, ready for 10 worlds)
- `js/font.js` pixel font · `js/touch.js` touch controls · `js/audio.js` WebAudio songs (`w1_over`, `w1_under`, `w1_sky`,
  `w1_castle`, `w1_boss`) + SFX; `startMusic(name)` is the per-world music hook.
- `js/worlds.js` — `WORLDS[1..10]` (name, built flag, level ids, palette, enemy roster, boss, music) and `THEMES`
  (tileset palettes + background kind). Worlds 7–10 are stubbed with their lore palettes/rosters/bosses.
- `js/sprites.js` — sprites + `buildTileset(theme)` (themed ground/brick/CRT/conveyor/barrel/acid/bridge tiles).
- `js/levels/common.js` — tile legend + `newArea()` / `areaTools()` builders (pipes, stairs, platforms, firebars, beams, signs).
- `js/toon.js` — World 2 cartoon tiles/sprites (trucks, skeletons, launchers, Toaster Truck + plate font, Grand Toaster).
- `js/diner.js` — World 4 palette, diner tiles (checker floors, subway tile, chrome counters, stools, booths, grease vats, toaster slots), sprites (rats, croutons, mold, Pop-Ups, ghosts, Rye Knights, Static Slices, bagels, cooks, Fuse Box, Jam Packet, Diner Bell, wrench, cards, Cal's rerun), `drawCalFace()`, giant cards, diner decor and background layers.
- `js/bumbo.js` — World 5 palette, cardboard tiles (corrugated floors, taped boxes, `?` gift boxes, butter goo, Pop-Up Springs), sprites (gremlin, slime + globs, Fork Ghoul, bagel bat, Cord Snake, foil puppet, Hive Skull, honey, Buzz Crumbs, Oven Mitt), the static TV booth, puppet-theater decor/backgrounds and post-fx.
- `js/crypt.js` — World 6 palette, crypt tiles (stone, server racks, RGB switch, cyan bridge / magenta firewall blocks, jam and magma), sprites (Rage Toaster, Burnt End + crumbs, Butter Blob, Static Skull, Glitchling, Fuse Bun, Quartz Shard, Quartz King, Hot Sauce), Glitch Doors, jam geysers, the CRT gate, decor, background layers and RGB-split/scanline post-fx.
- `js/pit.js` — World 3 palette, tiles (coils, outlets, fridges, neon trim), sprites (skulls, smoke detector, goon, tray, IOU, slice, Breadlord), ledger table, graffiti/poster/background layers.
- `js/levels/w1.js` … `js/levels/w6.js` — `LEVELS[...]`, pushed onto `LEVEL_ORDER` (defined in common.js). Add a world = new `js/levels/wN.js` + `built: true` in worlds.js
  + a `<script>` tag.
- `js/bros.js` — `BROS` / `BRO_IDS` roster data + `buildBroSprites()` (bro frames, portraits, cage, tank, gas can).
- `js/game.js` — engine (v0.4 bro system block: terrain HP, booms, shots, melee, specials, cages, escape): physics, multi-area runtime (each area keeps its own enemies/items/platforms, so the main level is
  unchanged when you come back from a bonus room), entities, boss, states, rendering, autopilot, `window.TT` test hooks.

## Tests (Playwright, from ../tests, server on 127.0.0.1:18923)
- `test_w6.py` — 61 v0.8 checks:
  - Content rules: banned names/words in World 6 strings (lore do-not-use list, no Binding of Isaac / Undertale), lore palette,
    jam #b54e8c, glitch-chiptune songs + boss variant, no coin/shop/wallet mechanics, local scripts only.
  - The autopilot clears 6-1 → 6-4 → World 6 clear (all 3 Glitch Doors, geysers ridden over every pit, every RGB section crossed with the
    switch live, QUARTZ KING 9 → 0 through all 3 phases with slams and crystal hazards, CROWNLESS!, TOASTED! escape, save).
  - Mechanics: Glitch Door, geyser cycle + riding + sinking, RGB switch (bump, shoot, time out), every enemy's move, Hot Sauce,
    a direct Quartz King run (name card, slams, spikes, PRISM MODE, beams + shard, FULL FACET, CROWNLESS!, escape, Fat Coty's lines).
  - The King beaten by the autopilot as each of the 8 bros.
  - Progression: 5-4 → 6-1, the World 7 tease card, warp pipe 6 → 6-1, save, level select, warp zone pipes 2-6.
  - The two v0.8 fixes (persona line cleared on swap; BRO FREED held behind the name card). Mobile: touch UI fits, d-pad walks
    through a Glitch Door. No console errors or warnings. Writes shots/w6/.
- `test_w5.py` — 57 v0.7 checks:
  - Content rules: banned names/words in World 5 strings, lore palette, jam #b54e8c, march songs + buzzing boss variant, local scripts only.
  - The autopilot clears 5-1 → 5-4 → World 5 clear (springs used, tide risen, foil puppet shrieks + strings cut, HIVE SKULL 9 → 0 through
    all 3 phases with slams, CURTAIN!, TOASTED! escape, save).
  - Mechanics: spring launch over a wall, tide cycle + perches + tide damage, swing planks sweep and carry you, every enemy's move,
    globs, Oven Mitt, foil puppet shriek + gate, Chrome Screamer's own lines, a direct Hive run (slams, drips, phases, Buzz Crumbs, CURTAIN!, escape).
  - The Hive beaten by the autopilot as each of the 8 bros (each starts the fight with one grape-jam armor, like the castle's jam box).
  - Progression: 4-4 → 5-1, World 5 end card, warp pipe 5 → 5-1, save, level select. Mobile: touch UI fits, d-pad + A ride a spring.
  - No console errors. Writes shots/w5/.
- `test_w4.py` — 52 v0.6 checks:
  - HUD: every bro name (+ stress names) is pixel-checked inside the slot. The in-game mode is checked for each of the 8 bros.
  - The autopilot clears 4-1 → 4-4 → World 4 clear. The Fuse Box flips and is blown, and THE REPAIRMAN goes 9 → 0 HP through all 3
    phases, then CANCELLED, TOASTED! escape and world clear.
  - A direct boss run checks the intro, wrenches + zap cards, THE LEAN, IT'S YOU, Reflections mirroring the bro,
    CANCELLED → escape, and Cal's own lines.
  - Mechanics: flicker rhythm, mold slow/drain, crouton split, Pop-Ups, ghost returns once, Rye Knight shielding a neighbor,
    Static Slice teleport, Burnt Bagel dive + boom, cook pellets + ammo, card solidity, Jam Packet, Diner Bell freeze, and the Fuse Box flip + gate.
  - Progression: 3-4 → 4-1, warp pipe 4 → 4-1, save, level select.
  - Content rules: banned names/words, jam #b54e8c, the W4 songs, local scripts only.
  - Mobile (iPhone landscape): touch UI, screen fits, and the d-pad still moves right while the picture is mirrored.
  - No console errors. Writes shots/w4/.
- `test_w3.py` — 42 v0.5 checks:
  - The autopilot clears 3-1 → 3-4 → World 3 clear; the fridge bonus room is visited.
  - THE BREADLORD: 6 HP → 0 by the autopilot, phase 2, reels, curse, DEBT PAID, TOASTED! escape, world-clear tease.
  - A direct boss run checks the dialog, phase 2 and that the first phase-2 spin gives the curse.
  - Mechanics: coil cycle, fork spark, reel faces (safe/bounce/spike), the three skulls, smoke pulse, goon spread + ammo,
    Crumb Tray magnet, explosive mini fridge chain.
  - Progression: 2-4 clear → 3-1, warp pipe 3 → 3-1, level select, save.
  - Content rules: grape jam, no banned words in level/UI text, local scripts only. No console errors.
  - Writes shots/w3/.
- `test_mobile.py` — 119 checks over iPhone-13-ish 844x390 / 390x844 and Pixel-7-ish 915x412 / 412x915 (`hasTouch`, `isMobile`):
  - Setup: viewport meta, touch-action, select and tap-highlight CSS; ≥44 px controls that don't overlap; integer/quarter scaling;
    landscape gutters; portrait layout and hint.
  - Audio is running after the first tap, and after an iOS-style suspend + tap.
  - CDP `Input.dispatchTouchEvent` multi-touch holds right + run + jump at once, keeps right+run after lifting the jump finger,
    and slides the D-pad from right to left.
  - Variable jump on touch: tap 19 px < short press 25 px < hold 62 px.
  - Release: touchcancel and blur release everything.
  - No scroll or zoom after swipe, pinch, double-tap and synthesized pinch/scroll gestures. Every touch event is cancelable and
    defaultPrevented.
  - START pauses and resumes; the game auto-pauses when hidden.
  - Rotation re-lays out; safe-area insets are respected (CDP `Emulation.setSafeAreaInsetsOverride`). No console errors.
  - Writes shots/mobile/ (landscape.png, portrait.png, paused.png, pixel-*.png).
- `test_bro.py` — 42 v0.4 checks: roster data + 8 distinct sprites/weapons/specials, every bro's gun/melee/special, 3 specials
  + ammo refill, auto-fire, hit flash + knockback, cages (swap, +life, reserve, save, reload, respawn as next bro), tile HP/cracks,
  craters, bedrock + borders, chain reaction, shake/hit-stop, own-blast safety, wall-slide/jump, riflemen + gunners + ammo drop,
  Toast Armor, roster screen, TOASTED! escape, combat autopilot clears all 8 W1/W2 levels, no console errors; writes shots/bro/.
- `test_game.py` — 27 core-feel checks (physics, blocks, items, pipes, damage, autopilot 1-1 clear).
- `test_w2.py` — 42 checks: autopilot 2-1 → 2-4 → world clear (≤3 deaths), Grand Toaster → TOASTED! escape, under-pier visit, Grand Toaster cycle +
  all three win paths + autopilot 3/3, planks, crumbles (+ regrow), puddles, butter, boost, Lightbar, trucks, skeletons,
  launchers/rockets, W1 → 2-1, warp pipe 2 → 2-1, level select, World 10 name, local scripts only, no console errors.
- `test_w1.py` — 49 checks (incl. ammo crate, Glitch → escape → world clear, combat autopilot): autopilot title → world clear, intro cards, carry-over, save/continue/hi score, debug select,
  Glitch Filter / Spare Play Card / Toast Launcher collected in-game, bonus persistence, conveyors, butter, new enemies,
  warp zone, acid, platforms, mimic, hazards, boss both ways (+ autopilot with rockets), touch on/off, no console errors.
- `autoplay.py [levels]` per-level bot runs · `boss_clip.py [size] [out] [level] [warpTx]` real-time boss recording (`0 boss.mp4 2-4 136` → shots/w2/boss.mp4, `0 boss.mp4 3-4 140` → shots/w3/boss.mp4, `0 boss.mp4 4-4 152` → shots/w4/boss.mp4, `0 boss.mp4 5-4 150` → shots/w5/boss.mp4, `0 boss.mp4 6-4 150` → shots/w6/boss.mp4) · `realtime_and_clip.py`.
