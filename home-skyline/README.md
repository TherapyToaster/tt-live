# home-skyline

High-detail futuristic neon city backdrop for the therapytoaster.com Home page.
Loaded from the Home MAIN Code block snippet `tt-home-skyline` (jsDelivr pin, GitHub Pages fallback).

- Desktop (>=1024px): one `#tt-skyline` canvas, z-index 0 (behind `#siteWrapper`, under the floating skulls), side-gutter city unchanged from v2.
- Mobile/tablet (<1024px): a plaza canvas behind `#ttps` (Choose your path) with a reserved sign rail above the cabinet so every neon sign (TOASTED, MR.TOASTY, THERAPY TOASTER, PROUDLY VETERAN-OWNED, ARTCADE, BURNT OFFERINGS, Twitter, x_x) stays fully in bounds, plus a thin outline-only horizon band (`#tt-skyline-band`, mix-blend-mode:screen, no dark overlay) above the phone dock that does not dim scrolling buttons. pointer-events none, no horizontal overflow. Animation pauses when the plaza is offscreen or the tab is hidden. DPR/FPS caps are tighter than desktop. `prefers-reduced-motion`: static frame. Tilt parallax reuses extras' `ttx-px` opt-in.
- 3 pre-rendered parallax layers (sky/scanline sun/far, mid towers/haze, near brick/glass towers, fire escapes, water tanks, HVAC, graffiti, caution cards, neon tube signs, wet-street reflections) + live actors (Cybertruck with headlight beam, holographic toast, rain, embers, steam vents, window flickers, RGB glitch slice).
- Official Mr. Toasty logo is composited from `mr-toasty-neon-logo-official.png` (never redrawn). Visible sign text says "Twitter", never "X".
- Preview / apply tooling lives in `/workspace/home-skyline/`.
