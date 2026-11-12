# paste/2030 — Shopify header: drop ticker, new logo lockup (preview only)

Nothing in this folder has been installed on the live theme. Official shop name stays **Mr. Toasty's Shop**.

## Live header today

Horizon (theme 158584569910) has no `settings.logo` image, so `blocks/_header-logo.liquid` falls back to `shop.name` as Inter 600 text on the white header. The caution ticker is section `tt_ticker_banner` (type `tt-ticker`), first in `sections/header-group.json`. The old announcement bar `header_announcements_9jGBFp` ("Mr. Toasty's Skullz") is already disabled and should stay disabled. Current theme logo heights: desktop 36, mobile 28. Palette is white `#ffffff` / black `#000000`.

## Recommended approach

Upload a **custom header logo PNG** in Theme settings → Logo and favicon → Default logo. Horizon then renders the image at `logo_height` / `logo_height_mobile` instead of the plain shop-name text. No custom liquid is needed. Official shop name is unchanged (still used for alt text, emails, checkout, and the text fallback). Inverse logo is unused (transparent headers are off).

A custom liquid snippet is the worse option here: it would have to fight the header logo block, would be easier to overwrite in the theme editor, and is unnecessary once a logo image is set.

Because the header bar is white, both lockups sit on a black rounded pill with yellow `#FFD400` type so the brand colors stay readable.

Recommended sizes once a logo is uploaded:

- Desktop height: **44px** (current 36 is a bit tight for the skull and masks)
- Mobile height: **28px** (same as today; both lockups fit between the hamburger/search and account/cart icons)

Widths at those heights: variant A ≈ 221×44 desktop / 140×28 mobile; variant B ≈ 245×44 / 156×28.

## Variants

**A — recommended.** `logo-a-skull-neon.png` (1005×200, aspect 5.025)

COTY skull cutout + the neon **M® ToasTy** wordmark from the same art (comedy/tragedy masks already in the mark) + yellow **'s Shop**. This is his actual logo, not the unicode stand-in.

**B — typographic / emoji only.** `logo-b-type.png` (1118×200, aspect 5.59)

No skull photo. Yellow Inter text **Mr. Toasty's Shop** with the same 〽️®️ prefix used on the ticker, plus ☠️ and 🎭.

Source cutouts (if a lockup needs a tweak): `coty-skull-cutout.png`, `coty-neon-logo-cutout.png`.

Storefront mockups (ticker removed, logo swapped, menu reflowed) are in `/workspace/shopheader/`:

- `variant-a-desktop.png` / `variant-a-mobile.png` (+ `-header` crops)
- `variant-b-desktop.png` / `variant-b-mobile.png` (+ `-header` crops)

## How to apply (after Coty picks a variant)

Still preview-only until he says to install. Admin API cannot write live theme files; this is a theme-editor / code-editor job.

1. In the Horizon theme editor (or code editor), replace `sections/header-group.json` with `paste/2030/header-group.json`. That file removes `tt_ticker_banner` from `sections` and from `order`. `header_announcements_9jGBFp` stays present and `"disabled": true`. `header_section` is unchanged.
2. Theme settings → Logo and favicon → upload the chosen lockup (`logo-a-skull-neon.png` or `logo-b-type.png`) as the **Default logo**.
3. Set logo desktop height to 44 and mobile height to 28.
4. Do not change the official shop name, and do not re-enable the announcement bar.
5. The `sections/tt-ticker.liquid` file can be left in the theme (it simply will not be used). Delete it only if Coty wants it gone.

No other theme files need to change.
