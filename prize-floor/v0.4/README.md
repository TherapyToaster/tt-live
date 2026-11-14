# Toasty's Prize Floor: v0.4 (six wings, twenty-four machines)

Live copy: https://therapytoaster.github.io/tt-live/prize-floor/ (also on Toasty's ARTcade).
Play uses in-game Tokens and Stubs only. There is no real money and no crypto.

## Run
Serve this folder over HTTP, because ES modules don't load from file://.

    cd proto && python3 -m http.server 8000
    # open http://localhost:8000/

### URL flags
| Flag | Effect |
|---|---|
| `?reset` | Wipes the save. The save key is `tpf_v02`, and a v0.1 save migrates automatically. |
| `?rich` | Gives a test bankroll. |
| `?desktop` | Forces desktop controls. |
| `?q=low` / `?q=high` | Starts at that graphics quality. Press O to switch in game. |
| `?noauto` | Turns off the automatic drop to Low. That drop normally happens after 4 s under 35 fps. |
| `?noao` | Turns off the GTAO ambient occlusion pass on High. |
| `?lowenv` | Uses one shared environment map instead of one per wing. |
| `?shot` | Exposes the `window.TPF` / `__dbg` QA hooks. |
| `?noevents` | Turns off the timed floor events (Golden Hour, Card Frenzy, Ticket Rain). |
| `?norefl` | Turns off the reflective lobby floor on High. |
| `?nograin` | Turns off film grain. |
| `?bs= ?br= ?bt=` | Bloom strength, radius and threshold, for tuning. |

## Controls
- **Walk:** click to lock the mouse. WASD (or the arrow keys) walks, the mouse looks and Shift hurries. E or click uses whatever you're facing. Esc pauses.
- **New keys:** **C** opens the Card Binder and **O** toggles High/Low graphics.
- **Pushers (6):** move the mouse or press A/D to aim the dropper. Click or Space drops a token. T nudges the table on the Gold Shelf (15 s cooldown). E or Q steps you back.
- **Toast-O-Matic:** click to insert, then click to POP at golden.
- **Exit Drop:** click to drop when the carriage is over the static TV.
- **Lane Slide:** A/D or W/S picks a lane, click slides it, and W/S slides back. You get 8 moves per round.
- **Toaster Slot:** click or Space pulls the lever.
- **Monday Motors Rally:** A/D or the mouse steers. Click starts a race and then boosts (3 charges).
- **Repairman CRT:** A/D picks a slice, click plays it, and W peeks once (Butter Knife).
- **Burnt or Golden prompt:** press G or B.

### New in v0.4 (one new machine per wing)
| Machine | Type | Wing | Play | Skilled payout |
|---|---|---|---|---|
| Rerun Recall | memory (Simon) on 4 CRTs | No Signal Hall | 3 Tokens. Watch the channel sequence, repeat it with 1-4 (or A/D + click). Static decoys from length 5. | about 0.9 Stubs/Token |
| Crypt Critter Gallery | shooting gallery | Mr. Toasty's Crypt | 3 Tokens, 12 shots / 30 s. Aim with the mouse or WASD, click to zap bats, ghouls, skulls and the golden critter. Don't zap the smoke detectors. | about 1.2 |
| Monday Morning Derby | rhythm race | Monday Motors Garage | 3 Tokens. Click on the beat to push your truck past Mr. Toasty, Fat Coty and Yellow Blankey. 8 in a row = turbo. | about 1.3 |
| Crumb Capsule Crank | capsule (gacha) machine | Crumb Workshop | 2 Tokens. Crank three times, open a capsule: Stubs or one of six minis. Collect all six for a bonus and a card. | about 1.1 |
| Spatula Hockey | air hockey vs Cal | Burnt Offerings Diner | 2 Tokens. Mouse/WASD moves your spatula, click smashes. First to 5 or 75 s. | win 3 (+1 shutout) |
| Breadlord's Bell | high striker | The Toaster Pit | 2 Tokens. Mash click (or A/D) for 3 s, then stop the needle in the middle. Ring the bell for 6. | about 1.2 |

Also in v0.4: NPC arcade-goers, a jackpot siren seen across the floor, a Mr. Toasty PA ticker, floor events, music beds per wing, dust and flicker, hot streaks and BIG WIN banners, per-wing color grading, a reflective lobby floor (High), light beams, an arcade carpet, mirror balls and a few easter eggs. Exit Drop and Repairman CRT payouts were retuned to about 1.2 Stubs/Token.

### New in v0.3 (six new game types)
| Machine | Type | Game | Where | Play |
|---|---|---|---|---|
| Grave Grabber | claw crane | Mr. Toasty's Crypt | lobby, north wall left | 3 Tokens. Click stops the claw across, click stops it deep, it drops and grabs. A/D nudge. |
| Whack-a-Glitch | whack-a-mole | No Signal Hall | Signal wing, left | 3 Tokens, 25 s. Mouse/A-D or 1-5 to whack glitch skullz; skip TEST PATTERNS. |
| Lake Jump Lanes | skee-ball roll lane | Cybertoaster Kart | Kart wing, left | 3 Tokens, 9 balls. Mouse/A-D aim, click at the power you want. |
| Crumb Stacker | timing stacker | Skullz: Crumb Dungeon | Crumb wing, left | 2 Tokens. Click to drop each row; 8 rows = MINOR (S/A to take 5), 12 = MAJOR 24. |
| Tip Jar Toss | coin toss (Rapier physics) | Burnt Offerings | Diner wing, right | 1 Token per toss. Mouse/A-D aim, click at the power shown. |
| Breadlord's Wheel | ticket wheel | Toaster Pit | Pit wing, left | 2 Tokens. Click to grab, click to let it rip. |
- **Touch:** the left thumb walks and the right thumb looks or aims. The on-screen USE/NUDGE/BACK buttons and lane/steer arrows appear at screen machines.

## Floor layout
The lobby holds the Prize Counter, the haul shelves, the Stub Toaster (counts Stubs into tickets), Uncle Crust's change machine, the Swap Fridge and the Card Binder kiosk. Six marquee doorways lead off it:

| Wing | Pusher | Second machine |
|---|---|---|
| Mr. Toasty's Crypt | Gold Shelf | Toast-O-Matic |
| No Signal Hall | Static Shelf (S-I-G-N-A-L letters) | Exit Drop |
| Crumb Workshop | Hive Dozer (Wild Skull drops) | Lane Slide |
| The Toaster Pit | Debt Dozer (Burnt Toast curse) | Toaster Slot (3x5) |
| Monday Motors Garage | Drift Dozer (toy-truck pusher) | Monday Motors Rally |
| Burnt Offerings Diner | Slice Shelf (card chips) | Repairman CRT |

Each wing has its own prizes and a 5-card set. A full set unlocks that wing's plush.

## Files
- `index.html` is the whole game. `src/build.sh` generates it from `src/head.html` and `src/*.js`:
  - `01-core.js`: state/save, audio, HUD, renderer and post-processing, and the materials/textures
  - `02-world.js` and `02b-lobby.js`: the lobby, prizes and cards, and the lobby fixtures
  - `03-wings.js`: the six wing shells, their decor and the per-wing lighting (`ZSPEC`)
  - `04-pusher.js`: the shared Pusher class and its six variants
  - `05-machines.js`: the six v0.2 screen and skill machines
  - `05b-games.js`: the six v0.3 game types
  - `05c-v04a.js` / `05c-v04b.js`: the six v0.4 machines and their prizes
  - `06b-alive.js`: NPCs, siren, PA, floor events, ambience, dust and easter eggs
  - `06c-gfx.js`: grading, reflections, beams, carpet, mirror balls, light pools and win juice
  - `06-player.js`: modals, the prize counter, the fridge and the binder
  - `07-main.js`: input, zones, the main loop and the QA hooks
- `qa/` holds the headless Playwright runner, the step generators and the v0.2 QA logs.
- `vendor/three.module.js` is three.js r170, and `vendor/jsm/` holds its post-processing and environment addons. `vendor/rapier.es.js` is Rapier3d-compat 0.14 with the WASM inlined. Everything runs offline.
- `assets/`: Coty's art, copied (never edited) from the studio folders:
  - `nft-atlas.webp`, `photo/` and `art/skz-*` come from the Crypt and Skullz builds.
  - `art/pit-*` comes from the Toaster Pit.
  - `sym/` holds the slot symbols.
  - `poster/` holds the wing posters, built from the bumbo screenshots and the live kart/burnt-offerings thumbs.
- `shots/v0.2/`, `shots/v0.3/` and `shots/v0.4/` hold the headless QA screenshots. `qa/gen_v03.py` and `qa/gen_v04.py` build the bot runs.
