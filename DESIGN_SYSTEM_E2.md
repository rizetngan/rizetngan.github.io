# E2 Illustrated Atelier — art production and source register

## Locked art language
European clear-line architecture, editorial muted mineral colors, tangible miniature lighting. One connected atelier, visual mezzanine only, single-level floor navigation. Workbench first. Hero images are art references, not production screenshots.

## Production contract
Metre-scale world; retain 1.02m bench top and existing collision anchors. Hero assets use glTF with applied transforms, matte roughness, UVs, sRGB albedo; runtime collisions use separate simple bounds. Reuse repeated meshes, target 512–1024px textures, local files, no remote runtime dependence. Character target 6.5–7 heads and 40–45% bench height; final rigged character still required. Test camera at 5–10, 23 and 65–70 degrees and 360 degrees, native desktop mouse capture, real traversal input, mobile direct content, frame pacing. Static concepts are not a release gate substitute.

## Source research
ITomPoland/portfolio-itom README: baked global tint/lighting, prewarming, adaptive device tiers and hand-authored art pipeline. Keep compatible local Three r128 for now; do not copy its art assets. nihao README: decoupled content and direct article reading; preserve DOM reading and direct links. henryjeff/portfolio-website and camera-controls README fetch not available through connector, not claimed inspected. Three.js r128 GLTFLoader copied exactly from mrdoob/three.js, MIT (vendor/three-LICENSE.txt). Use official loader rather than write custom parser.

## Assets (local, no external network at runtime)
Poly Haven CC0:
- https://polyhaven.com/a/painted_plaster_wall — Amal Kumar; diffuse 1K, MD5 15ba8c1f63a5ab412b1eabe31728540a. Resampled to 768px, grayscale tonal remap toward warm plaster.
- https://polyhaven.com/a/smoked_walnut_veneer — Jenelle van Heerden; diffuse 1K MD5 8a89a2a623c61af870f1b1c5d2a877b3. 768px tonal remap.
- https://polyhaven.com/a/painted_wooden_chair_01 — painted chair model, 1024 vertices, 724 triangles; original bin MD5 7fd011acaef4730770108a7932191768. Original diffuse MD5 94c34f4a211eec5bd30017564e09be4c, resampled to 512px and desaturated; simplified matte glTF material. Model hidden fallback only after successful load.
- User's Actape and Snug project images from V7 retained. Monitor now displays Actape reference rather than slogan.
This increment is a textured vertical slice, not completed Blender asset set or final E2 visual approval.
