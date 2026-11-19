# Toaster Pit v0.7.0

A Mr. Toasty slot-machine roguelike. You're in the basement for a therapy session, and you owe crumbs to the Breadlord. Pull the cursed 3×5 Toaster Slot, buy charms from the vending fridge, and pay each deadline — or get burnt.

Open `index.html` in desktop Chrome (double-click works; no server or CDN), or on a phone. Mouse, keyboard, and touch all work.

Rebuild after editing `src/` or `vendor/`:

    python3 build.py

CloverPit is a gameplay-loop reference only. Every name, symbol, charm, and line is original. This is not real-money gambling.

## v0.7.0 — tap the machine

Coty asked for on-screen clickables with real purpose. Every one has a cost, a cooldown or limited uses, so you have to choose. Hover for a tooltip on desktop; tap to use and long-press for an info card on a phone (all hit areas are at least 44px).

- **Stickers (3 on the cabinet):** peel once per deadline, with new ones every deadline. Possible stickers: Gold Leaf, Jam Jar, Avo Smash and X Eyes (that symbol is 2x as likely next pull), Cooling Rack (Burnt Toast is 1/3 as likely), Hot Crust (next pull pays 1.5x), Extra Pop (+1 pull now) and Crumb Bomb (+6 crumbs into the tray).
- **Butter Dial:** tap to cycle through Off, Butter, Jam, Avocado, Golden and Toasty. The next pull spends 1 butter pat (2 for Golden or Toasty) to make that symbol 2.5x as likely. You start with 3 pats and get +2 each deadline; Butter Skull lines earn more. The Butter Knife charm adds +2 pats.
- **Smack plate:** a free hit after a pull, once per pull, 3 per session. There's a 55% chance one reel re-rolls, 25% nothing happens, and 20% a tile turns to Burnt Toast. The Triggered Button charm adds +1 smack.
- **Crumb tray:** gains +1 crumb a pull, plus 1 per paying line. Cash it in anytime for the pile plus a bonus of pile²/24. A Burn spills the whole tray. The Crumb Tray charm adds +1 crumb a pull.
- **Crumb Foam extinguisher:** 2 charges, refilled every deadline. Spraying it turns every Burnt Toast on the reels into Plain Toast and re-scores the pull. The Smoke Detector charm adds +1 charge.
- **Toasty TV:** double or nothing on the last pull's payout, a 50/50 bet, once per session. After a bet you can't smack or foam that pull.
- **Reel holds:** tap a reel to keep it for the next pull. You get 2 holds a session, with at most 2 reels held at once. The Pop-Up Timer charm adds +1 hold.
- **Skull NFT frames:** one frame glows each session. Tapping it gives +3 crumbs and makes Golden and Toasty Skulls 1.6x as likely next pull. The other frames just react when tapped.

The HUD shows a tools strip with butter, holds, smacks, foam, tray and what the next pull carries. The rules are in `src/21-tools.js` and the props are in `src/36-interact.js`. Shots are in `shots/v0.7/`.

## v0.6.3 — less glare

Coty asked for less light glare. Bloom strength 0.58→0.40, threshold 0.68→0.76, radius 0.62→0.48, bloom pulses ×0.85→×0.6; tone-mapping exposure 1.22→1.15; CRT lift 1.06→1.03. Lights, neon tubes, bezels, marquee, wall-paint glow and light shafts trimmed about 25–30%. Win and jackpot flashes softened (big win 0.4→0.28, jackpot 0.7→0.48, Scene jackpot 0.48→0.34) and the win-tile glow 0.72→0.5. Colors, neon outlines, locked camera, audio, VFX and touch controls are unchanged. Before/after shots are in `shots/v0.6.3/`.

## v0.6.2 — mobile and touch controls

Players reported broken mobile controls. A touch-emulated audit (375×667 and 390×844, portrait and landscape, 2–3× DPR) found tiny 16–24px buttons, taps hitting stale buttons, keyboard-only actions (quality, CRT, fridge, restart), no way to read charm or symbol info on a phone, overlapping HUD panels in portrait, a blurry 1× HUD on hi-DPI screens, incomplete gesture blocking, and no rotation handling. The full audit is in `tests/MOBILE-AUDIT-v0.6.2.md`.

- **Control bar:** a bottom bar on every device, inside the safe area: SOUND, ? (how to play), the main action (SIT DOWN / PULL / FRIDGE / BANK + GO / PAY or GET BURNT / NEXT / AGAIN), and MENU. Every button is at least 44px; most are 48px.
- **Menu:** quality (the Q toggle), CRT scanlines, sound, how to play, and restart run.
- **Info on tap or long-press:** tap or long-press a charm, a shop offer, or a reel symbol to see what it does. Shop offers open an info card with a BUY button, so a stray tap never spends crumbs. Tapping the lever pulls.
- **Pointer Events:** mouse, touch, and pen share one input path. Actions fire on release, a finger that slides off a button cancels, and stale taps from a previous screen are ignored, so nothing double-fires.
- **No scrolling or zooming:** `touch-action:none`, `overscroll-behavior:none`, no callout, selection, double-tap zoom, pinch, or context menu; touchstart and touchmove are blocked with non-passive listeners; safe-area insets are respected.
- **Audio** unlocks on the first tap, with the WebAudio context resumed on pointerup and touchend for iOS.
- **Fit:** the HUD is drawn at device resolution, and it re-lays-out on resize, rotation, and visualViewport changes. In portrait the stats sit in one full-width panel, the shop is a single column, and small screens render the 3D scene a little denser so the reels stay readable.
- **How to play:** shows on the first touch launch and reopens from the ? button (or ? / H on a keyboard).
- **Desktop:** all keys still work. New ones: Esc opens or closes the menu, and 1–4 buy shop offers.
- **Bug fix:** after the first fridge visit, the main button stayed on FRIDGE and kept reopening the shop, so session 2 couldn't be played. It now goes back to PULL.
- **Tested:** a taps-only Playwright playtest (`tests/touch_playtest.py`) at 390×844, 844×390 after a mid-run rotation, 375×667 and 667×375 passes 0 fails with 0 console errors; the desktop playtest (`tests/playtest.py`) still passes.

## v0.6.1 — wider shot, louder art

- **Camera:** pulled back from z 5.15 to 5.6, with the look-at point at y 1.48 (it was 1.42) and the camera at y 1.6 (it was 1.58). The FOV is 44° on 16:9 (it was 42°), 48° on 4:3, and 52° on squarer screens. On portrait phones the FOV widens until the full cabinet and lever fit. The camera is still fully locked and straight-on.
- **Graffiti:** pieces were rearranged to the spots the camera can actually see. BREADLORD and TOASTY sit in the top band on either side of the monitor. PIT moved to the left gutter, out from behind the lever. CRUMBS and a magenta skull are on the right strip, and a big bone skull is on the left. The side walls show in the back corners with a vertical PIT, a vertical TOASTY and skull stencils. The pieces are bolder and more saturated with neon glow passes, and their paint-only glow map catches the bloom while the bricks stay dark and gritty. Magenta and cyan corner uplights and a warm top rim wash the walls. The wall behind the cabinet is dimmed so the reels keep their contrast.

## v0.6 — gritty graffiti look

The basement got tagged, using the @skulrzworld (SkulRz World) X account as the style reference: London street walls, puff throw-ups, drips, stencils, sticker bombs, wheatpaste, and grime. Every piece of art is procedural canvas art with our own words. No photos, logos, or lettering from the account are copied or shipped, and the reference notes stay out of the build.

- **Walls:** tagged brick with a raw concrete band and buffed roller patches, all on one unique 2048px canvas per wall. The canvases carry wet-paint throw-ups (TOASTY, PIT, CRUMBS, BREADLORD), handstyle tags with crowns and arrows, stencils of our toast-crowned X-eye skull and toast, wheatpaste posters ("FEED THE BREADLORD", "ITS ART THERAPY"), sticker-bomb clusters, spray scribbles, drips, damp stains, soot, and cracks. The brick has relief and a little emissive so the paint reads in the dark. The floor has spray splats and a faded stencil.
- **Cabinet:** a spray-painted, scuffed, stickered skin sits over the gold bezels: overspray fades, a drippy magenta/cyan outline around the pay window, tags on the bottom bezel, die-cut and holo stickers on the sides, and scratches. The pay window stays clear. The marquee is now a wet-paint throw-up.
- **Symbol frames:** each NFT card gets a rough spray-paint outline in its tier color, drips into the frame band, grit and scratches, and a tiny tag. The portraits themselves are untouched.
- **HUD:** all lettering uses a stencil face. Big headings use a dripping wet-paint face. Panels get rough spray borders, drips, and tape. Buttons look like die-cut stickers. The layout is the same as v0.5.
- **Unchanged:** the locked camera, v0.5 music, SFX and VFX, the Q low-quality toggle, NFT icons, payouts, and odds.

Fonts are embedded in `index.html` as ASCII subsets, both under the SIL Open Font License 1.1: **Saira Stencil One** (© 2019 The Saira Stencil Project Authors) and **Rubik Wet Paint** (© 2020 The Rubik Filtered Project Authors). License texts are in `vendor/fonts/` and in the zip under `licenses/`.

## Controls

Touch: tap the big button in the bottom bar (or the lever) to pull. Tap or long-press anything for info. MENU has quality, CRT, sound, help, and restart.

- **Pull:** Space, Enter, the PULL button, or the lever
- **Re-pull:** T or R (if you have the Triggered Button charm, once per deadline), or the RE-PULL button
- **Shop / fridge:** X or E after a session, or the FRIDGE button; 1–4 buy offers
- **Confirm / bank / pay / continue:** Enter or Space
- **Menu:** Esc or MENU · **How to play:** ? or H
- **CRT scanlines:** C
- **Quality:** Q (high / low), or MENU → QUALITY
- **Mute / volume:** M, or the SOUND / MUTED button

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
