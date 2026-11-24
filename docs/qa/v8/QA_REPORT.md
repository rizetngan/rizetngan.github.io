# V8.1 — High-fidelity art pass, real-time baseline

**Scope**: build on restoration revision 377ca8741c1f7e3e4a9eeddb641573d0ec980989. app.js, index.html, styles.css remain Git-blob identical. One live Three.js scene, all six chapters, no pre-rendered substitutes. This is an incremental art checkpoint, not a claim of matching the original concept image.

## Implemented
- GPU Cycles AO and diffuse-indirect bake. Captured 225 visible static scene mesh bounds from actual hardware WebGL. Proxy AABB meshes simplify the scene; omitted oversized arch/rafter approximations and rebuilt a simple open arch proxy. 3 receiver surfaces (floor, desk, rear gallery wall), 2 passes each. All six actual data textures are applied through UV2, aoMap and lightMap to the floor, two rugs, desk, rear wall and two bay panels. Direct dynamic shadows remain enabled. This is NOT a full per-mesh scene bake or complete global illumination.
- Real CC0 Poly Haven potted_plant_04, book_encyclopedia_set_01, binder_notebook (1K PBR), original download MD5 verified; fitted in existing footprints. Exact author, URL and runtime SHA256 recorded in assets/v8/source-manifest.json.
- New real Actape monitor in archive uses prior tevy CC0 geometry and decoded full PBR with genuine screenshot. Retain original frames and lift targets, refine cabinet fronts and labels.
- Material-matched walnut shelving, cloth book spine graphics, slimmer wood joinery, window sill and jambs, skirting, slab joints, arch masonry seams, fluted stone pedestal and monogram relief.
- Roof material handling fixed to avoid repeated shared-material multiplication. Matte walnut tabletop and controlled environment reflections.
- New runtime geometry kept within the old interaction envelopes; controller unchanged.

## Actual final QA
- Chrome ANGLE NVIDIA RTX 3050 D3D11 WebGL2; all 18 asset readiness flags true.
- Full existing keyboard/drag regression: mount at y=1.02, dismount at y=0, F resume, near Actape without auto lift, E lift/read, S restore, mobile screenshot. No Runtime.exceptionThrown.
- Existing real DOM UI regression: entry, corridor, wheel advance with actual camera movement, Lab, Work, Notes, About, brand return, direct Work. No Runtime.exceptionThrown.
- Headless Chrome uses drag fallback; native OS Pointer Lock 360-degree test and physical mobile not repeated for this revision. No frame rate guarantee.
- Concept-level fidelity remains unmet: miniature's basic silhouette, large greybox desk proportions, character skin/animation, per-mesh GI and fine detailed architecture need further work. Do not equate functional QA with final visual approval.

## Evidence
[All 12 views](screenshots.jpg) · [Baked maps](baked-maps.jpg) · [Entrance comparison](compare-01-entrance.jpg) · [Lab comparison](compare-02-lab.jpg) · [Archive comparison](compare-03-archive.jpg) · [Notes comparison](compare-ui-notes.jpg) · [About comparison](compare-ui-about.jpg)

Source: tools/bake-v8-lighting.py with assets/v8/bake-proxies.json and Blender bpy 5.1.2, Pillow, numpy. tools/download-v8-assets.py records real asset extraction. Editable proxy Blender file remains on authorized computer under Downloads/rizet-v8-bake.blend.
