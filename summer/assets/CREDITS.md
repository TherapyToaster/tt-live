# Credits — Toaster Summer CC0 assets (summer20)

All third-party assets below are licensed **CC0 1.0 Universal** (public domain dedication).
No paid or brand-logo assets are included. Photoscanned Poly Haven tree *meshes* were not
shipped (they are 50–900 MB each); only lightweight game-ready / low-poly meshes were used.

## Grass005 (lawn / grass)
- Source: https://ambientcg.com/a/Grass005
- License: CC0 1.0
- Author: ambientCG
- Packed as: `assets/tex/{high,low}/lawn_*.jpg`

## Sand 01 (dry beach sand)
- Source: https://polyhaven.com/a/sand_01
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/sand_*.jpg`

## Damp Beach Sand 02 (wet sand)
- Source: https://polyhaven.com/a/damp_beach_sand_02
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/wet_sand_*.jpg`

## Asphalt 04 (asphalt road)
- Source: https://polyhaven.com/a/asphalt_04
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/asphalt_*.jpg`

## Concrete Pavement 03 (concrete sidewalk)
- Source: https://polyhaven.com/a/concrete_pavement_03
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/concrete_*.jpg`

## Gravel Floor 02 (gravel driveway)
- Source: https://polyhaven.com/a/gravel_floor_02
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/gravel_*.jpg`

## Wood Floor Deck (wood deck planks)
- Source: https://polyhaven.com/a/wood_floor_deck
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/deck_*.jpg`

## White Planks Clean (tintable plank siding)
- Source: https://polyhaven.com/a/white_planks_clean
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/siding_*.jpg`

## Corrugated Iron 02 (metal roof normals / roughness)
- Source: https://polyhaven.com/a/corrugated_iron_02
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/metal_roof_*.jpg`

## Roof 07 (asphalt shingles)
- Source: https://polyhaven.com/a/roof_07
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/shingles_*.jpg`

## Bark Brown 01 (tree bark)
- Source: https://polyhaven.com/a/bark_brown_01
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/bark_*.jpg`

## Palm Bark (palm bark)
- Source: https://polyhaven.com/a/palm_bark
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/palm_bark_*.jpg`

## Island Tree 01 (leaf textures, unused on Quaternius meshes)
- Source: https://polyhaven.com/a/island_tree_01
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/tex/{high,low}/leaves*.png` and `leaves_*.jpg`
- Note: Photoscanned leaf atlas is packed but not applied to Quaternius trees; those meshes have generated UVs that do not match the atlas.

## Kloofendal 43d Clear Puresky (HDRI sky)
- Source: https://polyhaven.com/a/kloofendal_43d_clear_puresky
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/hdri/sky_high.hdr` (2K), `assets/hdri/sky_low.hdr` (1K)

## Shrub 03, Grass Bermuda 01, Grass Medium 01, Rock 09
- Source: https://polyhaven.com/a/shrub_03, https://polyhaven.com/a/grass_bermuda_01, https://polyhaven.com/a/grass_medium_01, https://polyhaven.com/a/rock_09
- License: CC0 1.0
- Author: Poly Haven
- Packed as: `assets/models/{high,low}/{shrub,grass_bermuda,grass_medium,rock}.glb`

## Ultimate Nature Pack (selected palms, common trees, pines, bushes, grass, wheat)
- Source: https://opengameart.org/content/low-poly-nature-pack-1
- Files: https://opengameart.org/sites/default/files/ultimate_nature_pack_by_quaternius_1.zip
- License: CC0 1.0
- Author: Quaternius
- Packed as: `assets/models/{high,low}/{palm,oak,pine,bush,grass,dune}_*.glb`
- Note: UVs were generated (cylindrical trunks, projected leaves). Original pack is untextured low-poly OBJ/FBX.

## Water normal (tiling Gerstner-style map)
- Source: original to this game
- License: CC0 1.0 (as part of Toaster Summer)
- Packed as: `assets/tex/{high,low}/water_*.jpg`
- Note: No photoscanned CC0 ocean normal was available from ambientCG or Poly Haven at build time (the ambientCG water zips returned 404).

## Engine loaders
- [three.js](https://threejs.org/) r160.1 (MIT), including `GLTFLoader` and `RGBELoader`.

Existing game credits (truck photos, OSM, etc.) remain in the repo-root `CREDITS.md`.

## Kenney Car Kit (sedan, SUV, van, pickup — no brand marks)
- Source: https://kenney.nl/assets/car-kit and https://opengameart.org/content/car-kit
- License: CC0 1.0
- Author: Kenney (www.kenney.nl)
- Packed as: `assets/models/{high,low}/car_{sedan,suv,van,truck}.glb` plus `Textures/colormap.png`
- Note: Emergency / taxi / police liveries were not included. Models have no real car brand logos.

## Beach umbrella (Beach Surf and Paddle Kit)
- Source: https://3dassets.dev/assets/beach-surf-and-paddle-kit-beach-umbrella-fb839e7d
- License: CC0 1.0 Universal
- Packed as: `assets/models/{high,low}/umbrella.glb`

## Tree stand-ins (coastal NC species, existing Quaternius / Poly Haven meshes)
- Live oak: `oak_1`–`oak_3` (Quaternius Ultimate Nature Pack)
- Palmetto / sabal palm: `palm_1`–`palm_3` (same pack)
- Loblolly pine: `pine_1`–`pine_3` (same pack)
- Wax myrtle: `bush_1`, `bush_2`, `shrub` (Quaternius bushes + Poly Haven shrub_03)
- Distant trees use camera-facing impostors (LOD) beyond about 90 m from the house; near trees stay instanced meshes.

## Audio
- All sound (engine, surf, wind, gulls, tools, garage radio) is synthesized at
  runtime with the Web Audio API in `src/11-summer-audio.js`. No recorded
  audio files are used.
