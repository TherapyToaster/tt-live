# Site header: OOK glitch background (v4)

The My One of a Kind glitch-background canvas, behind the nav tabs. Same animation family as `ashley-header/header-bg.js`, with a site-matched palette.

It paints inside `.header-announcement-bar-wrapper` and does not change header height, tab borders, the soft yellow glow, or the caution bar. No underlines are added. `prefers-reduced-motion: reduce` gets a single static glitch frame.

## v4

Every page with the site header, except Home, uses the **NFT-tab banner treatment**: the neon MR. TOASTY shutter photo (`nft-banner-2400` / `1200`) behind the tabs, with the v3-palette glitch overlay on top at the same intensity as `/skullz`.

**Home is unchanged.** It keeps the `#tt-topwall` graffiti mural from the top through Daily Glitch, with the calmer v3 overlay under the tabs.

**ARTcade** (`/arcade`) is no longer excluded. This script overrides `artcade-header/header-bg-v2.css` (the neon-sign header) from the footer tag: higher-specificity `#header` rules plus an inline `!important` background on the wrap so the computed style wins on first paint. The arcade page block does not need an edit.

**Ashley Savvie** is included via this same footer script. Do not edit her page Code block.

`/mr-toastys-merch` 404s; if it returns, it also gets the banner.

## Palette

#FFD400 core yellow, #DEBC13 neon gold, #F6392E graffiti red, #0C87CC NFT-banner blue. No default RGB cyan/magenta.

## Modes

- **Banner** (every non-Home page): photo + glitch under the tabs.
- **Home overlay** (`/` and `/home`): transparent glitch over the graffiti mural. Does not touch the Tag Wall, the embed, or `#ttpw-root`.

This script replaces the Ashley-only tag. Do not leave both tags in Footer Code Injection. The script also destroys leftover `#tt-ashley-ook-cv` nodes if the old file is still loaded. Safe under Squarespace soft navigation: the canvas is not duplicated.

## One-line tag (sitewide Footer Code Injection)

```html
<script src="https://therapytoaster.github.io/tt-live/site-header/header-bg.js?c=SHORTSHA" defer></script>
```

Do not load this folder as a page.
