# Home v471 — Active Wear tagline + current crew PFPs

Built on live Home main v470 (paste/1250). Not pasted live.

## Card text
- @InsiderThreadsX description: `No insider threat.` → `Active Wear`
- Handle and link already were `@InsiderThreadsX` / `https://x.com/InsiderThreadsX` (unchanged)
- Visible platform wording is still "Twitter", never "X"

## PFPs
Hosted at tt-live `assets/pfp/<handle>.jpg` commit `e8b82bf912c1730e03973e13865c038f8e33cdf5`.
Card img src: `https://cdn.jsdelivr.net/gh/TherapyToaster/tt-live@e8b82bf912c1730e03973e13865c038f8e33cdf5/assets/pfp/<handle>.jpg?c=<12-char sha256>`

Changed vs the Nov 11 hosted images:
- @TherapyToaster — new (selfie, yellow visor, red neon ring). Was the graffiti COTY / skull graphic.
- @InsiderThreadsX — new (illustrated hoodie, "INSIDER THREADS ACTIVE WEAR"). Was the skull-astronaut "TRUST EVERYONE. BE MEAN." art. Filename is now insiderthreadsx.jpg, not insidernothreat.jpg.
Unchanged (byte-identical to pfp-20261111): @ToastyCoty, @FatCoty, @TriggeredCoty, @YellowBlankey. All six cards now point at assets/pfp anyway.

No @AshleySavvie card on Home (six crew cards only).

## Paste target
Squarespace Home main Code block `yui_3_17_2_1_1792196864022_6140`.
File: paste/activewear1/home-main-v471.txt
1321 lines (same as v470). First line: `<style id="ttlive-css">/* ttlive-bar v1: LIVE on Twitter Spaces */`
Last line: `})();</script><!-- ttbgm-home-music END -->`

## Routine
Source the hourly rebuild should use:
  python3 /workspace/activewear/apply_activewear.py $N $N
AFTER handle-rename/apply_handle.py and BEFORE speed/apply_speed_v1.py (speed stays last).
Idempotent. Leaves the one TherapyToaster/status/ link and TT48 markers alone.
apply_handle.py still does not rewrite the tagline; this script does.

## Other occurrences checked (not edited)
- Footer injection (footerband1 / d1bf943): no card, no "No insider threat."
- Header injection / site-header / site-pages: no hits
- Historical homepage-code-v* and paste/ history: old text remains in old versions only
- Skullz/crypt game flavor text ("insider threat" taunts): left alone
- Ashley's page and Coty's Space: not touched
- paste/homeneon1 and header-bg.js: not touched (other worker)
