# Site header: OOK glitch background (v5)

The My One of a Kind glitch-background canvas, behind the nav tabs. Same animation family as `ashley-header/header-bg.js`, with a site-matched palette.

It paints inside `.header-announcement-bar-wrapper` and does not change header height, tab borders, the soft yellow glow, or the caution bar. No underlines are added. `prefers-reduced-motion: reduce` gets a single static glitch frame.

## v5

Every page with the site header, **including Home**, uses the **NFT-tab banner treatment**: the neon MR. TOASTY shutter photo (`nft-banner-2400` / `1200`) behind the tabs, with the v3-palette glitch overlay on top at the same intensity as `/skullz`.

**On Home, only the header area changes.** `#tt-topwall` stays as the page background from under the header through the Daily Glitch. This is applied from the footer script only — do not edit the Home code block (hourly Home rebuilds will not revert the header). Does not touch the Tag Wall, the embed, or `#ttpw-root`.

Home's own `#tt-topwall-css` tints the header wrap (`background: rgba(0,0,0,.18)`). This script beats that with higher-specificity `#header` / `html.tt-topwall` rules plus an inline `!important` background.

**ARTcade** (`/arcade`) is included the same way as v4 (overrides `artcade-header/header-bg-v2.css` from the footer tag; no arcade page-block edit).

**Ashley Savvie** is included via this same footer script. Do not edit her page Code block.

`/mr-toastys-merch` 404s; if it returns, it also gets the banner.

## Palette

#FFD400 core yellow, #DEBC13 neon gold, #F6392E graffiti red, #0C87CC NFT-banner blue. No default RGB cyan/magenta.

## Mode

- **Banner** (every page with the site header, including Home): photo + glitch under the tabs.

The unused `home-overlay` path (transparent glitch over the graffiti in the header) remains in the file but is not selected.

This script replaces the Ashley-only tag. Do not leave both tags in Footer Code Injection. The script also destroys leftover `#tt-ashley-ook-cv` nodes if the old file is still loaded. Safe under Squarespace soft navigation: the canvas is not duplicated.

## One-line tag (sitewide Footer Code Injection)

```html
<script src="https://therapytoaster.github.io/tt-live/site-header/header-bg.js?c=SHORTSHA" defer></script>
```

Do not load this folder as a page.
