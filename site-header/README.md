# Site header: OOK glitch background

The My One of a Kind glitch-background canvas, behind the nav tabs on every page that does not already have its own header background. It is the same animation as `ashley-header/header-bg.js`, now sitewide with an exclusion list.

It paints inside `.header-announcement-bar-wrapper` and does not change header height, tab borders, the soft yellow glow, or the caution bar. No underlines are added. `prefers-reduced-motion: reduce` gets a single static glitch frame.

## Excluded pages

- Home (`/` and `/home`, collection `6a9884b8f61a583fee13721f`): the `#tt-topwall` graffiti mural stays visible through the transparent header.
- `/arcade` (collection `6ad5b63914df0c0376bddf45`): neon THERAPY TOASTER sign CSS.
- `/mr-toastys-merch`: kept in the exclusion list in case that page returns (it 404s as of 2026-11-14; the live graffiti header is on Home).
- Any page whose header wrap already has a non-none `background-image` from page CSS, `#tt-topwall` / `html.tt-topwall`, or a foreign canvas/video in the wrap.

Ashley Savvie (`/ashleysavvie`, collection `6aefb320e7defe1c4dfda59f`) keeps the same look, including the white-bar gap fix (`[data-section-id="6aefb3e0dd29691c2e41cf91"]`).

This script replaces the Ashley-only tag. Do not leave both tags in Footer Code Injection. The script also destroys leftover `#tt-ashley-ook-cv` nodes if the old file is still loaded. Safe under Squarespace soft navigation: the canvas is not duplicated and is removed on excluded pages.

## One-line tag (sitewide Footer Code Injection)

Replace the existing Ashley line:

```html
<script src="https://therapytoaster.github.io/tt-live/ashley-header/header-bg.js" defer></script>
```

with (use the commit short sha as the cache-buster):

```html
<script src="https://therapytoaster.github.io/tt-live/site-header/header-bg.js?c=SHORTSHA" defer></script>
```

Do not load this folder as a page.
