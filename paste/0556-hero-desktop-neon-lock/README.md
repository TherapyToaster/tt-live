Home desktop hero: neon not on the painted words (fix 0556)

Cause (not the 0450 mobile-hero change): home-extras mouse parallax (extras.js, live in Home MAIN since v517)
moves and scales the wall picture .tw-img (translate up to 14x10 px, scale 1.06) on the first mouse move.
The neon overlay #tt-neon (header-bg.js) is a sibling of .tw-img, so it stayed put (header-bg.js place() also
re-positions it from the transformed rect but never scales it). Glow and tubes then sit 30-45 px off the words.
Headless/no-mouse renders (and v39 CSS / v538 MAIN / old head group) look identical to live; only a moving mouse shows it.

Fix: paste target = Home MAIN only. home.txt = live v540 + the tt-neon-lock snippet before <!-- tt-home-extras END -->.
Rebuild from whatever MAIN is live at paste time:  python3 apply.py <live-main.txt> home.txt   (idempotent)

Rollback: rollback/home-v540-before-neon-lock.txt (removes only the snippet). Full 0450 rollback (not needed for this bug):
rollback/home-v538.txt (MAIN) and rollback/header-first-paint-old.html (Head Injection HOME FIRST PAINT group, replace
from the 3200 preload link through <!-- /TT HOME FIRST PAINT v1 -->; Custom CSS rollback is v39 = paste/0518-css-fix2 minus the 0450 change).
