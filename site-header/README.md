# Site header: OOK glitch background (v6)

v6 = v3 (7a86faa) behavior plus overlay-only glitch on pages that have their own header art, plus a new Home wallpaper. The v4/v5 NFT-banner-on-every-tab change is gone.

- **/skullz, /mr-toastys-nft-wall:** unchanged from v3 (NFT banner photo + glitch under the tabs).
- **Default pages** (Shop, Ashley, About, Food Reviews, ...): unchanged from v3 (dark OOK field + glitch).
- **Pages with their own header art** (/arcade neon sign, /mr-toastys-merch if it returns, or any page whose header wrap already has a background image / canvas / video): ONLY a calm transparent glitch canvas over their own header (`html.tt-site-ook-ovl`). Their background is not replaced, hidden or recolored.
- **Home:** `#tt-topwall .tw-img` picture swapped from this footer file to `home-wall-v2-2400/1200` (neon "Hello my name is Mr. Toasty" shutter wall), shown whole (fit to width, `100% auto`) over a dark blurred fill of the same picture (`home-wall-v2-fill`). The calm glitch canvas is mounted inside `#tt-topwall`, so it covers the whole wallpaper area under all content and tabs. Hourly Home code-block rebuilds do not undo this. Tune position with CSS vars `--tt-wall-y` (desktop, default 50%) / `--tt-wall-y-m` (mobile, default 72%).

Palette: #FFD400, #DEBC13, #F6392E, #0C87CC. `prefers-reduced-motion: reduce` gets one static frame. Canvas and veil are `pointer-events:none`.

## One-line tag (sitewide Footer Code Injection)

```html
<script src="https://therapytoaster.github.io/tt-live/site-header/header-bg.js?c=SHORTSHA" defer></script>
```

Do not load this folder as a page.
