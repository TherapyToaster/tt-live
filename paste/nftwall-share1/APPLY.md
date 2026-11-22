# NFT wall share pack (nftwall-share1) — not published

Recommended share link: **https://www.therapytoaster.com/nft-wall**
(slug is currently a live 404; page still needs to be created and published.)

Fallback: https://therapytoaster.github.io/tt-live/nft-wall/

## Squarespace — new Not Linked page

1. Pages → Not Linked → add a new **Blank** or regular page (not in the navigation).
2. Page title: `Mr. Toasty's NFT Wall`
3. Settings (gear) → URL slug: `nft-wall`  → saved URL is `/nft-wall`.
4. Navigation: keep it in **Not Linked** (do not add it to the header).
5. Delete any default text blocks / extra sections so the page has one section and one **Code** block.
6. Page settings → Advanced → Page Header Code Injection: paste `01-nft-wall-page-header.html` (hides header, footer, injected TV/sparks/footer band so they do not flash).
7. Open the Code block and paste `00-nft-wall-standalone.html`.
8. SEO / social (page settings, and/or Settings → Marketing → this page’s social image):
   - SEO title: `Mr. Toasty's NFT Wall`
   - SEO / social description: `Every NFT I own on one giant wall. Drag to look around, pinch or scroll to zoom, and tap any tile to see where it came from.`
   - Social / OG image: upload `nft-wall/og.jpg` (1200×630, wall-specific card). share-v4.png is the sitewide fallback if you prefer the skull card.
9. Save, then publish this page only (the rest of the site can stay as-is).

## Link it from the NFT pages

The nav item labeled **Mr. Toasty's NFTs** is `/skullz` — that is the header “NFT” tab. `/mr-toastys-nft-wall` is already a Not Linked page with a long slug and full site chrome.

- Paste `10-nft-wall-456-v6-h1-share.html` into `/mr-toastys-nft-wall` Code block `block-yui_3_17_2_1_1794559913087_456` (replaces the current v6 wall paste). Adds “Open full-screen” + “Share the wall” above the wall.
- Paste `09b-skullz-853-nft-wall-v6-share.html` into `/skullz` Code block `block-yui_3_17_2_1_1794560432673_853` if you want the same buttons on the actual nav NFT tab. (Recommended, because that is the tab people already click.)

Publish the `/nft-wall` page first so the buttons do not 404.

Do not paste these into the Home main block (6140) or the Home wall block (3118) unless asked.
