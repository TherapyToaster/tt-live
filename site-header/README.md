# Site header: OOK glitch background (v3)

The My One of a Kind glitch-background canvas, behind the nav tabs on every page that does not already have its own header background. It is the same animation as `ashley-header/header-bg.js`, now sitewide with an exclusion list.

It paints inside `.header-announcement-bar-wrapper` and does not change header height, tab borders, the soft yellow glow, or the caution bar. No underlines are added. `prefers-reduced-motion: reduce` gets a single static glitch frame.

## v3

Home overlay is calmer: lower opacity, slower and rarer ticks, softer scanlines, no tears or strobing, so the graffiti mural stays readable. The glitch palette is now site yellow #FFD400, neon gold #DEBC13, graffiti red #F6392E, and NFT-banner blue #0C87CC (no default RGB cyan/magenta). NFT banner intensity is unchanged aside from that palette.

The full-page Home scroll glitch (`#tt-glitch-cv` / `#tt-glitch-fx`) lives in the Home code block, not this file. Tone-downs for that layer are in `/workspace/homepage-code-v451.txt`.

## v2 modes

- **NFT banner** on `/mr-toastys-nft-wall` and `/skullz` (the "Mr. Toasty's NFTs" nav tab). The banner picture is `nft-banner-2400.webp` / `.jpg` (1200 variants for small screens). The same glitch overlay paints on top of the photo, under the tabs.
- **Home overlay** on `/` and `/home`. The same glitch paints over the `#tt-topwall` graffiti wallpaper and under the nav tabs. The canvas is transparent so the mural stays visible. It does not touch the Tag Wall, the embed, or `#ttpw-root`.

## Excluded pages

- `/arcade` (collection `6ad5b63914df0c0376bddf45`): neon THERAPY TOASTER sign CSS.
- `/mr-toastys-merch`: kept in the exclusion list in case that page returns (it 404s as of 2026-11-14; the live graffiti header is on Home).
- Any other page whose header wrap already has a non-none `background-image` from page CSS, or a foreign canvas/video in the wrap.

Home is no longer excluded: it uses overlay mode. Ashley Savvie (`/ashleysavvie`, collection `6aefb320e7defe1c4dfda59f`) keeps the same default look, including the white-bar gap fix (`[data-section-id="6aefb3e0dd29691c2e41cf91"]`).

This script replaces the Ashley-only tag. Do not leave both tags in Footer Code Injection. The script also destroys leftover `#tt-ashley-ook-cv` nodes if the old file is still loaded. Safe under Squarespace soft navigation: the canvas is not duplicated and is removed on excluded pages.

## One-line tag (sitewide Footer Code Injection)

This is the only Squarespace edit for v2. Do not add anything to the Home code block (hourly rebuilds would wipe a Home-only tag). Replace the cache-buster on the existing line:

```html
<script src="https://therapytoaster.github.io/tt-live/site-header/header-bg.js?c=SHORTSHA" defer></script>
```

Do not load this folder as a page.
