# Toaster Pit v0.6.0

A Mr. Toasty slot-machine roguelike. You're in the basement for a therapy session, and you owe crumbs to the Breadlord. Pull the cursed 3×5 Toaster Slot, buy charms from the vending fridge, and pay each deadline — or get burnt.

Open `index.html` in desktop Chrome (double-click works; no server or CDN). Mouse, keyboard, and touch all work.

Rebuild after editing `src/` or `vendor/`:

    python3 build.py

CloverPit is a gameplay-loop reference only. Every name, symbol, charm, and line is original. This is not real-money gambling.

## v0.6 — gritty graffiti look

The basement got tagged, using the @skulrzworld (SkulRz World) X account as the style reference: London street walls, puff throw-ups, drips, stencils, sticker bombs, wheatpaste, and grime. Every piece of art is procedural canvas art with our own words. No photos, logos, or lettering from the account are copied or shipped, and the reference notes stay out of the build.

- **Walls:** tagged brick with a raw concrete band and buffed roller patches, all on one unique 2048px canvas per wall. The canvases carry wet-paint throw-ups (TOASTY, PIT, CRUMBS, BREADLORD), handstyle tags with crowns and arrows, stencils of our toast-crowned X-eye skull and toast, wheatpaste posters ("FEED THE BREADLORD", "ITS ART THERAPY"), sticker-bomb clusters, spray scribbles, drips, damp stains, soot, and cracks. The brick has relief and a little emissive so the paint reads in the dark. The floor has spray splats and a faded stencil.
- **Cabinet:** a spray-painted, scuffed, stickered skin sits over the gold bezels: overspray fades, a drippy magenta/cyan outline around the pay window, tags on the bottom bezel, die-cut and holo stickers on the sides, and scratches. The pay window stays clear. The marquee is now a wet-paint throw-up.
- **Symbol frames:** each NFT card gets a rough spray-paint outline in its tier color, drips into the frame band, grit and scratches, and a tiny tag. The portraits themselves are untouched.
- **HUD:** all lettering uses a stencil face. Big headings use a dripping wet-paint face. Panels get rough spray borders, drips, and tape. Buttons look like die-cut stickers. The layout is the same as v0.5.
- **Unchanged:** the locked camera, v0.5 music, SFX and VFX, the Q low-quality toggle, NFT icons, payouts, and odds.

Fonts are embedded in `index.html` as ASCII subsets, both under the SIL Open Font License 1.1: **Saira Stencil One** (© 2019 The Saira Stencil Project Authors) and **Rubik Wet Paint** (© 2020 The Rubik Filtered Project Authors). License texts are in `vendor/fonts/` and in the zip under `licenses/`.

## Controls

- **Pull:** Space, Enter, or the PULL button
- **Re-pull:** T or R (if you have the Triggered Button charm, once per deadline)
- **Shop / fridge:** X or E after a session, or the FRIDGE button
- **Confirm / bank / pay / continue:** Enter or Space
- **CRT scanlines:** C
- **Quality:** Q (high / low)
- **Mute / volume:** M, or the AUDIO / MUTED button

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

## Graphics (v0.5)

An original looping soundtrack is generated in the WebAudio API — a creepy lo-fi basement synth in the Mr. Toasty vibe, with no third-party audio files. Music starts after the first click or key and swells on the final pulls before a deadline. M or the AUDIO button mutes it. SFX are also procedural: lever clunk, reel whir and per-reel stop thunks, small/medium/big win jingles, a coin-counter tick, a Burnt Toast curse (sizzle, low drone, glitch), shop buy, charm blips, a debt-paid fanfare, and a game-over sigh.

Wins shake the HUD and the post-process (the camera never moves), with crumb, butter-spark, and coin bursts, glow pulses and an animated tracer on paying lines, payout number pops, and a vertical smear on spinning reels. A Burn brings smoke, an RGB-split glitch, a red vignette, and charred-edge flicker. A jackpot is a full-screen flash plus a crumb-and-confetti rain. Dust motes and flickering lights stay as idle ambience. Q still drops particles and post-processing.

## Graphics (v0.4)

The camera is still a locked, straight-on, centered front view — no sway, bob, dolly, or camera shake. Slot icons are 512px NFT face crops with linear filtering, mipmaps, and anisotropy, so they stay sharp at the locked camera. Each card has a tier frame (bone, cyan/magenta, gold, yellow, or glitch red), a corner gem, an idle shine, a holographic sheen on the rare tiers, a gold shimmer on Golden Skull, a pulsing yellow glow on Toasty Skull, and ember-and-static flicker on Burnt Toast. Winning-line tiles pop, scale, and glow. Q drops bloom, shadows, shafts, floor reflection, and some FX for a lighter laptop mode, targeting 60fps by default.

The v0.3 room is unchanged: chrome cabinet, PMREM env, neon tubes, light shafts, reflective floor. Eight of Coty's skull NFTs hang on the back wall as glowing framed screens (live CRT / glitch / scanline). Mr. Toasty's Skulls #75 and Messed and Mixed #124 moved to the reels, so the wall now shows SkulRz PFP #4211 and #4289 in their place, plus Messed and Mixed #58, #74 and #186, and SkulRz PFP #4076, #4173 and #4493. Nothing repeats between the wall and the symbols. Other artists' work is not used.

## Art

Shared Mr. Toasty palette, all on black: yellow `#FFD400`, magenta `#ff00c8`, cyan `#00f0ff`, glitch red `#ff0040`, gold `#e3b303`, bone `#cbbcd9`, toast orange `#ff5a00`. Butter gold, burnt orange, and black are the base; magenta and cyan are glitch accents. RGB-split text is used for headings, Mr. Toasty's lines, and Burn alerts. A hint of sickly green lives only in the basement ambience.

Slot symbols are Coty's NFT portraits in framed cards (linear, mipmapped). Charm icons stay crisp, outlined, 4-tone pixel art, drawn with `imageSmoothingEnabled=false` and nearest-neighbor textures. Tone is jam and crumbs, never blood or gore. Mr. Toasty's lines have no politics and no crude humor.

The room is a PS1-style low-poly basement in Three.js, with a cracked monitor Mr. Toasty sits on, a vending fridge for the shop, and the Breadlord (a moldy bread box) on a shelf.
