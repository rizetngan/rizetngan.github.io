# H5 production gate 02 — exact geometry and lightmap transfer

Status: **technical pilot passed; H5 art gate NOT passed.** Not a new website or deployment.

## Protected baseline
V8.1: 39b1e91338a1601e3e255e8e61312a2328e46c3e. Actual Git blob comparison confirms index.html, app.js, styles.css and atelier-scene.js unchanged. Separate tooling/evidence only.

## Verified pipeline
1. Export actual visible static standard-material scene meshes from Chromium using official Three.js r128 GLTFExporter. Real triangle geometry, world matrices, normals, UVs and source material relationships. Exclude skinned meshes, translucent helper surfaces, invisible objects and non-standard-material surfaces. Normalize quantized/interleaved attributes into compatible float arrays.
2. Export and Blender import: 463 meshes, 219,329 triangles, 16,301,324 bytes. RTX 3050 OptiX Cycles.
3. Real DeskSurface (828 triangles) welded redundant vertices without changing world bounds; original UV retained and independent H5_LIGHTMAP authored using smart projection. AO and diffuse indirect separately baked at 512 x 512. Float EXR and linear PNG. Actual meshes, not AABB proxies.
4. Browser loads exact desktop with TEXCOORD_0 and TEXCOORD_1 and separate maps. Max world bounding-box endpoint error 2.3960770657571697e-7 units. UV attribute counts 1732 each. Both maps 512 x 512. Zero runtime exceptions. All original 18 asset flags true.
5. Static desk only. No full-scene lightmap validation, post-replacement interaction test, or aesthetic parity claim. PNG clips values above one; EXR retained. Final H5 needs linear HDR transfer, final mesh atlas, material/camera QA and dynamic character lighting.

## Evidence
[Actual browser before/after](exact-uv-comparison.jpg). [AO](exact-desk-ao.png). [Indirect](exact-desk-indirect.png). [Mesh](exact-desk.glb).
Packed Blender master Downloads/rizet-h5-art/h5-exact-bake-pilot.blend and exact reference GLB stay on authorized machine. Checksums in build-manifest.json.

## Reproduction
tools/rizet-h5-export.py and tools/rizet-h5-pilot-qa.py are local probes. Create local h5-local.html from baseline index.html by injecting official Three r128 examples/js/exporters/GLTFExporter.js and a wrapper around createAtelierWorld exposing returned world as window.__h5world before app.js. Serve only localhost. Copy three proof files to h5-pilot-local for QA. Run Blender bpy 5.1.2 tools/h5-exact-bake-pilot.py and tools/h5-pilot-export.py. Outputs under Downloads/rizet-h5-art.

## Art decision
Old V8 visual geometry is not accepted as final art. Three approved H5 concept images remain the visual gate. Replace building silhouette, desk styling, visible shelves and figure. Use warm mineral plaster/stone, brown walnut, graphite metal, terracotta accents, directional afternoon daylight. Concept's apparent upper floor does not authorize new gameplay levels. Preserve original spatial anchor contract. Entrance and workbench must pass actual Cycles comparison before final mesh baking. No still-image Guided mode.
