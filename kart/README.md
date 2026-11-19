# CyberToaster Kart v0.4.0

A free, just-for-fun cartoon kart racer. Drive Mr. Toasty's Cybertruck on Monday Errands, Toaster Tide Run, or Skullz Graveyard, drift, fire items, smash the Monday Motors dealership, and jump Toasty Lake.

Open `index.html` in a desktop browser (no server required). The game is a single self-contained file.

## Controls

- **Steer / accelerate / brake:** Arrow keys or WASD
- **Drift:** Space
- **Use item:** X
- **Start / confirm:** Enter
- **Quality:** Q (high / low)

## Tracks

- **Monday Errands** — suburb loop, a dealership shortcut, a ramp jump over Toasty Lake, graffiti walls, and a sky that moves from day to sunset during the race
- **Toaster Tide Run** — Surf City loop from one roundabout over the high-rise bridge to the other and back, with a boardwalk shortcut
- **Skullz Graveyard** — purple dirt, RIP stones, and jumps

## Changelog

### v0.4.0

- Graphics pass: punchier 3-band cel shading, thicker navy outlines, a cheap bloom on bright pixels, a richer day sky with chunkier clouds, and sparkly Tide water
- Cartoon motion: a soft contact blob under each kart (shrinks and fades in the air), stronger squash and stretch, tier-colored drift sparks, boost flames, speed lines, and dust, sand, and puddle splash
- HUD now calls out MINI, SUPER, and ULTRA boosts
- Denser Monday Errands tufts and palms, and a fuller Skullz Graveyard
- Toaster Tide Run: trapezoid jersey barriers, dressed roundabout infields, water-only pier footings, tucked cap beams, and no low pylon shafts in the grass
- Physics pass: three-tier drift at 0.28 / 0.72 / 1.28s, tighter grip, milder off-road, stronger gravity, a landing bounce with an optional clean-landing boost and air trick, stick-to-ground on the Tide crest, capped mass bumps, and a wall glance that keeps most of your speed
- AI stays competitive
- Fixed the dark half-disc smear under the truck during jumps — only the soft blob remains
- Removed the flat olive rectangle from Tide Run's mainland grass

### v0.3.2

- Fixed mobile and touch controls: on-screen steer, gas, brake, drift, and item buttons on touch devices, 44px+ thumb targets, and working multi-touch
- Short taps now start the race and select a track; audio unlocks on the first tap
- Optional tilt steering, a dismissible how-to-play overlay, pinch/zoom/callout locks, and a portrait rotate hint
- Desktop keyboard controls are unchanged
- Title screen keeps the 3D truck visible in the letterbox on phones

### v0.3.1

- Toaster Tide Run: taller (crest 180) and longer bridge, bigger roundabouts, and a 2-lap race
- Slim jersey-barrier median, Tide Tower and marina visible from the race camera, a cleaned-up boardwalk, and a wide title shot

### v0.3.0

- Cel-shaded cartoon look: hard 3-band lighting, navy outlines, and colored shadows
- Monday Errands sky now moves from day to golden hour to sunset during the race
- New track: Toaster Tide Run — island and mainland roundabouts, a high-rise coastal bridge, and a boardwalk shortcut

### v0.2.1

- Mario Kart-style higher, pulled-back chase camera
- Camera ducks under the graffiti underpass, pulls in when a wall sits between camera and truck, and adds a modest boost FOV kick

### v0.2.0

- Ink and glitch art-direction overhaul (comic poster style, more polished)
- Graffiti walls on Monday Errands
- Rebuilt Cybertruck from Coty's photos: faceted stainless body, brushed metal with a sun highlight, charcoal cap, one-plane sloped bed, and the yellow THERAPY TOASTER plate

### v0.1.0

- First ARTcade release: two tracks, items, dealership shortcut, and the Toasty Lake jump

A dated snapshot of this build lives in `v0.4.0/`. Previous snapshots are kept in `v0.3.2/`, `v0.3.1/`, `v0.3.0/`, `v0.2.1/`, `v0.2.0/` and `v0.1.0/`. To put the card on the ARTcade page, add:

```html
<script src="https://therapytoaster.github.io/tt-live/kart/arcade-card.js"></script>
```
