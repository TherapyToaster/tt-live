# Proudly Veteran-Owned — apply plan (NOT live yet)

Nothing in this folder has been published. Do not paste, push to Shopify, or change the live footer `header-bg.js` line until Coty taps Publish.

Replacement wording everywhere this applies: exactly `Proudly Veteran-Owned`.

## Leave unchanged (not "Veteran Owned")

- Home bio: `U.S Army Veteran and Father of 4`
- Person JSON-LD and SEO descriptions: `U.S. Army veteran...`
- About SEO title: `About Coty Lake (Mr. Toasty) | Army Veteran & Artist | ...`
- About story line: `the veteran community work`
- Shop meta description: `...a U.S. Army veteran. Printed on demand...`
- Official logo: `/workspace/brand/mr-toasty-neon-logo-official.png` (no veteran wording)
- Ashley's page Code block (never edit). The sitewide footer change will update the label on her page without opening that block.
- Coty's Space page content (retired). Do not edit that page.
- Live footer script line (`header-bg.js?c=6e254d3&neon=A&sparks=1&nav=D&tv=1&bio=1` as of the 7:08 AM ET scan). This wording change does not need a new hash or flag.

## Squarespace apply steps (after approval)

1. Pause both routines. Confirm no hourly Home refresh is mid-run.
2. Header Code Injection: replace all of it with `01-header-injection.html` (speed1 header plus the Organization JSON-LD wording change only). If the speed-up has already pasted speed1's header, this file still applies on top of that base. If the speed-up has not pasted yet, paste this file instead of speed1's `01-header-injection.html`.
3. Sitewide footer text block `block-5a494580313222096fa8` (section `fe-6a988533c6d1d146aaea1e54`): change the text from `Disabled Veteran Owned and Operated` to `Proudly Veteran-Owned`. One edit updates every page.
4. SEO Settings:
   - Home title: `Mr. Toasty's Therapy Toaster | Proudly Veteran-Owned`
   - /shop page SEO title: `Proudly Veteran-Owned Art Tees | Mr. Toasty's Shop | Mr. Toasty's Therapy Toaster`
5. Share image (baked-in text, separate approval): the live social image `therapytoaster-share-v3.png` still shows a yellow badge reading `DISABLED VETERAN OWNED AND OPERATED`. Do not overwrite it until a new image is composed and Coty approves it. Then upload and set it as the site share/OG image. Historical unused files with the same badge: `ogimg/therapytoaster-share-dvoo.png` and `therapytoaster-share-dvoo-v2.png`. `ogimg/compose.py` still defaults the badge to `DISABLED VETERAN OWNED AND OPERATED`.
6. Resume both routines. No Home-chain script patch is required: `homepage-code-v466-speed.txt`, `site-pages/home-v1.js`, `shop-v1.js`, and `header-bg.js` do not contain this wording, so the hourly Home rebuild will not undo it. Do not let a later paste restore the pre-wording speed1 header.

## Shopify apply steps (Mr. Toasty's Shop only, after approval)

Store: Mr. Toasty's Shop (`therapytoaster.myshopify.com`).

Do not `theme_commit` / `theme_publish`. Theme files, ticker, policies, pages, collections, and the store name have no "Veteran Owned" text.

Update `descriptionHtml` on these 9 ACTIVE Insider Threads products only, replacing `Disabled Veteran Owned and Operated` with `Proudly Veteran-Owned` (see `shopify/product-description-edits.json` for full before/after HTML):

- gid://shopify/Product/9782387572790 insider-threads-x-tank
- gid://shopify/Product/9782400286774 insider-threads-x-performance-tee
- gid://shopify/Product/9782407364662 insider-threads-x-hoodie
- gid://shopify/Product/9782589161526 insider-threads-x-athletic-shorts
- gid://shopify/Product/9782600073270 insider-threads-x-leggings
- gid://shopify/Product/9782610329654 insider-threads-x-sports-bra
- gid://shopify/Product/9782629924918 insider-threads-x-gym-sack
- gid://shopify/Product/9782637854774 insider-threads-x-gym-towel
- gid://shopify/Product/9782650929206 insider-threads-x-bottle

## Verify

- curl Home, Shop, Arcade: footer text and JSON-LD Organization description.
- Browser tab titles for `/` and `/shop`.
- One Insider Threads product page description.
- Confirm `header-bg.js` query string is unchanged.
