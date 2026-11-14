# ARTcade header background

Neon "THERAPY TOASTER" sign (behind blinds) used as the nav-tab background on the Squarespace ARTcade page only (`/arcade`, collection `6ad5b63914df0c0376bddf45`).

## v2 (desktop zoom fix, not live until the ARTcade block link is swapped)

- `header-bg-v2.css` — drop-in replacement for `header-bg.css`
- `header-desktop-v2.jpg` / `header-desktop-v2.webp` — 3600×1000 composite: the original 2400×793 photo centered with blinds smeared and faded into `#05070d`. Used with `background-size: cover` so the full sign stays in frame at 1280, 1440 and 1920. The 0.42 dark overlay is unchanged.
- Mobile still uses `header-mobile.jpg` / `.webp` and is unchanged (the v2 CSS only overrides the desktop image).

Load with a cache-buster, e.g. `https://therapytoaster.github.io/tt-live/artcade-header/header-bg-v2.css?c=<shortsha>`.

## v1 (currently live)

- `header-bg.css`
- `header-2400.jpg` / `header-2400.webp` — 2400px wide, full frame
- `header-mobile.jpg` / `header-mobile.webp` — 1200px wide, slightly tighter vertical crop around the lettering

The original CSS snippet also lives in `/workspace/artcade-tabs-bg/artcade-header-bg-v1.html`. Do not load this folder as a page.
