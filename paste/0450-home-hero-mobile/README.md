Home hero mobile images (preview, not live). Do not paste until Coty approves.

Assets (already on tt-live, commit 7879a26e6b8f6d966c7ab32e6f93654c684b10ba):
  assets/home-graffiti/mr-toasty-wall-828.webp  (828x388, 75.7 KB)
  assets/home-graffiti/mr-toasty-wall-1200.webp (1200x562, 107.6 KB)
  plus jpg fallbacks. Full-frame scales of mr-toasty-wall-3200 (phones already use background-size: 100% auto).

Three places to paste, all rebuilt from live v538 / live Custom CSS / live head:

1. Custom CSS (full file): remove the two background-image declarations that forced
   mr-toasty-wall-3200 on max-width:767px with !important. Size and position are unchanged.
   This is the rule that made phones download the 406 KB desktop image.
2. Head Code Injection — the HOME FIRST PAINT block only (from the 3200 preload through
   <!-- /TT HOME FIRST PAINT v1 -->). Desktop preload is unchanged. Mobile preload uses
   imagesrcset for the 828/1200 webps. Boot JS picks 1200 on retina, 828 otherwise, 3200 on desktop.
3. Home MAIN block 6140 (home.txt, 2259 lines, based on v538): the 3200 background-image
   is wrapped in @media (min-width:768px) so phones never see it. The max-width:767px rule
   uses the new 828/1200 images as a no-JS fallback (look/position 50% 30% kept).

The painted hero on phones and desktop is still home-wall-v2 from header-bg.js. These
changes only stop the wasted 3200 (and old portrait mobile.webp) download on phones.
Do not write /workspace/homepage-code-v539.txt until MAIN is live.
