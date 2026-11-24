# G5-R Real Browser QA

Release candidate: new independent preview directory preview/g5r/, existing official homepage and G5.1 previews preserved.

## Art production
- CC0 professional assets: five Poly Haven models with 2K PBR and studio HDRI, plus tevy desktop monitor, mechanical keyboard and office chair.
- Khronos official KTX 4.4.2 transcodes tevy original compressed normal, color and ORM maps. Meshopt original geometry fully preserved.
- 2.45m studio walnut worktable, original authored mineral architecture, detailed working lamp, actual Actape and Snug interface textures.
- Blender/Cycles OptiX on RTX 3050 produced the original offline images. Packed editable Blender master remains in gitignored local art-assets folder.
- Runtime GLB reduced from 31,301,868 bytes to 7,722,720 bytes with 115 semantic meshes.
- Guided intentionally displays actual Cycles renders, not a realtime free camera. Mini intentionally displays realtime Three.js with actual free third-person controls. Lighting quality is lower in Mini; do not claim parity.

## Actual Chrome tests
- Chrome RTX 3050 ANGLE Direct3D11 WebGL2.
- Four photo assets decoded; main homepage and both product detail pages loaded.
- Responsive homepage 390x844 has no horizontal overflow. Desktop 1440x900 accepted.
- Runtime asset status: all flags true, studio GLB loaded, no Runtime.exceptionThrown.
- True W and S auto mount/dismount to measured y=0.79 and y=0 respectively, F resume yaw and position preserved. Orbit and zoom tested.
- New photo Guided overlay confirmed visible (naturalWidth 1680); F switched to realtime Mini render.
- Snug product lift, E reading overlay and return verified.
- Native OS Pointer Lock and physical phone touch were not rerun for the exact new G5-R revision. Old coordinate-specific Actape walking test was obsolete and intentionally replaced by new scene-oriented tests.
- Further art iteration recommended for Mini and full indirect-light parity.

## Evidence
- [Homepage](home.jpg)
- [Guided Cycles shot](guided.jpg)
- [Real Mini WebGL](mini.jpg)
- [Mobile homepage](mobile.jpg)
- [Product reading](reading.jpg)
- [Collage of six screenshots](screenshots.jpg)
