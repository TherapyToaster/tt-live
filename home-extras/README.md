# Home extras (therapytoaster.com Home)

Loaded by the `<!-- tt-home-extras START -->` snippet at the end of the Home MAIN Code block, via jsDelivr pinned to a commit sha (GitHub Pages fallback).

- `extras.js` / `extras.css`: shake-to-glitch (phones) + double-click glitch (desktop), tilt / mouse parallax (CRT TV, graffiti wall, site title, floating skulls), Toasty app icon head tags (manifest, apple-touch-icon, theme-color, iOS launch images, installed-app splash), PLAY GAME on the CRT, phone bottom dock (Shop, ARTcade, NFTs, Twitter).
- `mini-game.js`: Toasty Bros 30-second Crumb Run teaser. Bundles the real `toasty-bros/js/font.js`, `worlds.js`, `sprites.js` (unchanged) inside one IIFE.
- `manifest.webmanifest` + `icons/`: icons composite the official neon logo (`mr-toasty-neon-logo-official-4x.png`) on black. Never redrawn.

All effects are off with prefers-reduced-motion. Source/build: /workspace/home-extras on the bot box.
