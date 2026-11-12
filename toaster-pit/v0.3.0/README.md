# Toaster Pit v0.3.0

A Mr. Toasty slot-machine roguelike. You're in the basement for a therapy session, and you owe crumbs to the Breadlord. Pull the cursed 3×5 Toaster Slot, buy charms from the vending fridge, and pay each deadline — or get burnt.

Open `index.html` in desktop Chrome (double-click works; no server or CDN). Mouse, keyboard, and touch all work.

Rebuild after editing `src/` or `vendor/`:

    python3 build.py

CloverPit is a gameplay-loop reference only. Every name, symbol, charm, and line is original. This is not real-money gambling.

## Controls

- **Pull:** Space, Enter, or the PULL button
- **Re-pull:** T or R (if you have the Triggered Button charm, once per deadline)
- **Shop / fridge:** X or E after a session, or the FRIDGE button
- **Confirm / bank / pay / continue:** Enter or Space
- **CRT scanlines:** C
- **Quality:** Q (high / low)
- **Mute:** M

## The loop

3 sessions per deadline, 7 pulls per session (8 with Pop-Up Timer). Loose crumbs can be spent on charms at the humming vending fridge; what's left is banked and earns a little therapy interest each session. Debts climb: 75, 200, 500, 1,200, 3,000, then higher. Pay the Breadlord or the run ends burnt.

## Symbols

Plain Toast, Butter Pat, Jam Jar (purple-magenta, never red), Avocado Toast, Golden Toast, Skull (bone, toast crown, X eyes), and cursed Burnt Toast. Three Burnt Toast in a line is a Burn: that pull's winnings are wiped, unless a Smoke Detector blocks the first Burn of the session. Lines of 3 or more pay on rows, columns, and diagonals.

## 15 starter charms

Crumb Tray, Butter Knife, Rubber Skull, Smoke Detector, Pop-Up Timer, Therapy Couch, Glitch Filter, Crust Collector, Extension Cord, World's Okayest Mug, Fork in the Outlet, Sourdough Starter, Triggered Button, Jam Session, Golden Crumbs.

Crossover charms from Kart, Crypt, and Skullz are waiting on Coty's picks and are not in this prototype.

## Graphics (v0.3)

The camera is a locked, straight-on, centered front view of the Toaster Slot — no sway, bob, dolly, or camera shake. Big-win punch comes from a screen flash, HUD shake, and particles instead. The cabinet has more chrome bevels, rivets, emissive trim, and a marquee with chaser lights; glass over the reels picks up a PMREM room environment. Bloom is tuned for neon and gold. The back wall is richer brick (bump and roughness) with neon tubes and pipes, volumetric-looking light shafts and dust, and a wide reflective floor. Symbol textures are 128px, still crisp nearest-neighbor. Q drops bloom, shadows, shafts, and the floor reflection for a lighter laptop mode, targeting 60fps by default.

Eight of Coty's own skull NFTs hang on the back wall as glowing framed screens with live CRT / glitch / scanline animation: Mr. Toasty's Skulls #75 (Mr. Toasty's Skullz), Messed and Mixed #58, #74, #124 and #186, and SkulRz PFP #4076, #4173 and #4493. Sources are documented in `assets/nfts/SOURCES.md`. Other artists' work is not used.

## Art

Shared Mr. Toasty palette, all on black: yellow `#FFD400`, magenta `#ff00c8`, cyan `#00f0ff`, glitch red `#ff0040`, gold `#e3b303`, bone `#cbbcd9`, toast orange `#ff5a00`. Butter gold, burnt orange, and black are the base; magenta and cyan are glitch accents. RGB-split text is used for headings, Mr. Toasty's lines, and Burn alerts. A hint of sickly green lives only in the basement ambience.

Symbol and charm icons are crisp, outlined, 4-tone pixel art, drawn with `imageSmoothingEnabled=false` and nearest-neighbor textures. Tone is jam and crumbs, never blood or gore. Mr. Toasty's lines have no politics and no crude humor.

The room is a PS1-style low-poly basement in Three.js, with a cracked monitor Mr. Toasty sits on, a vending fridge for the shop, and the Breadlord (a moldy bread box) on a shelf.
