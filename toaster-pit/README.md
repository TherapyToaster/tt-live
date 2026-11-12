# Toaster Pit v0.4.0

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

Each of the seven symbols is one of Coty's own skull NFTs, shown as a high-res 512px card with a tier-colored frame, a corner gem, and a small label. Payouts and odds are unchanged from v0.3.

- **Plain Toast** (common, bone frame) — SkulRz PFP #4049
- **Butter Skull** (mid, cyan frame) — SkulRz PFP #4356
- **Jam Skull** (mid, magenta frame) — SkulRz PFP #4429
- **Avocado Toast** (mid, cyan frame) — SkulRz PFP #4553
- **Golden Skull** (rare, gold frame, shimmer) — Messed and Mixed #124 (Pay to Win gold mask)
- **Toasty Skull** (top, yellow frame, pulsing glow) — Mr. Toasty's Skulls #75
- **Burnt Toast** (cursed, glitch-red frame, ember and static) — SkulRz PFP #4340 (flaming skull)

Three Burnt Toast in a line is a Burn: that pull's winnings are wiped, unless a Smoke Detector blocks the first Burn of the session. Lines of 3 or more pay on rows, columns, and diagonals. Sources are in `assets/nfts/SOURCES.md`.

## 15 starter charms

Crumb Tray, Butter Knife, Rubber Skull, Smoke Detector, Pop-Up Timer, Therapy Couch, Glitch Filter, Crust Collector, Extension Cord, World's Okayest Mug, Fork in the Outlet, Sourdough Starter, Triggered Button, Jam Session, Golden Crumbs.

Crossover charms from Kart, Crypt, and Skullz are waiting on Coty's picks and are not in this prototype.

## Graphics (v0.4)

The camera is still a locked, straight-on, centered front view — no sway, bob, dolly, or camera shake. Slot icons are 512px NFT face crops with linear filtering, mipmaps, and anisotropy, so they stay sharp at the locked camera. Each card has a tier frame (bone, cyan/magenta, gold, yellow, or glitch red), a corner gem, an idle shine, a holographic sheen on the rare tiers, a gold shimmer on Golden Skull, a pulsing yellow glow on Toasty Skull, and ember-and-static flicker on Burnt Toast. Winning-line tiles pop, scale, and glow. Q drops bloom, shadows, shafts, floor reflection, and some FX for a lighter laptop mode, targeting 60fps by default.

The v0.3 room is unchanged: chrome cabinet, PMREM env, neon tubes, light shafts, reflective floor. Eight of Coty's skull NFTs hang on the back wall as glowing framed screens (live CRT / glitch / scanline). Mr. Toasty's Skulls #75 and Messed and Mixed #124 moved to the reels, so the wall now shows SkulRz PFP #4211 and #4289 in their place, plus Messed and Mixed #58, #74 and #186, and SkulRz PFP #4076, #4173 and #4493. Nothing repeats between the wall and the symbols. Other artists' work is not used.

## Art

Shared Mr. Toasty palette, all on black: yellow `#FFD400`, magenta `#ff00c8`, cyan `#00f0ff`, glitch red `#ff0040`, gold `#e3b303`, bone `#cbbcd9`, toast orange `#ff5a00`. Butter gold, burnt orange, and black are the base; magenta and cyan are glitch accents. RGB-split text is used for headings, Mr. Toasty's lines, and Burn alerts. A hint of sickly green lives only in the basement ambience.

Slot symbols are Coty's NFT portraits in framed cards (linear, mipmapped). Charm icons stay crisp, outlined, 4-tone pixel art, drawn with `imageSmoothingEnabled=false` and nearest-neighbor textures. Tone is jam and crumbs, never blood or gore. Mr. Toasty's lines have no politics and no crude humor.

The room is a PS1-style low-poly basement in Three.js, with a cracked monitor Mr. Toasty sits on, a vending fridge for the shop, and the Breadlord (a moldy bread box) on a shelf.
