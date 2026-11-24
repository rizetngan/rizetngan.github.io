# G5-R professional asset register

Poly Haven source assets were independently MD5-verified on download. All 5 mesh assets plus HDRI licensed CC0. Original 2K files and editable Blender project remain on authorized computer, excluded from public site.

| Poly Haven asset | Artist(s) | Polygons | Source resolution |
|---|---|---:|---|
| [Modern Arm Chair 01](https://polyhaven.com/a/modern_arm_chair_01) | Vibrant Nordic | 8916 | 2k |
| [Desk Lamp Arm 01](https://polyhaven.com/a/desk_lamp_arm_01) | Yann Kervran, Kuutti Siitonen | 25710 | 2k |
| [Modern Wooden Cabinet](https://polyhaven.com/a/modern_wooden_cabinet) | Patrik Pangerl | 24976 | 2k |
| [Mid Century Lounge Chair](https://polyhaven.com/a/mid_century_lounge_chair) | Kuutti Siitonen | 6148 | 2k |
| [Ceramic Vase 01](https://polyhaven.com/a/ceramic_vase_01) | James Ray Cock | 2548 | 2k |
| [Poly Haven Studio](https://polyhaven.com/a/poly_haven_studio) | Greg Zaal | HDRI | 4k |

## Primary display objects: tevy CC0 GLBs

Official source: https://tevy.dev/models (license CC0 1.0). Each came from a pinned v1 path /models/ASSET/v1/lod0.glb and was SHA256 verified:
- Desktop Monitor: 9ebf01e10c083652f30c5e4bce298ebdeed0b46f846dcef7dae8b5827e9f09ac
- Mechanical Keyboard: 7ec66fc1fe5ac62e35edeb98f0298a1d6f0fd45f0274c26c9a1abb2cb7389b30
- Office Chair: afb893f580fc71bcec661f0da12e5899c04c40786ee5c877bc7ef7c8d4de4087

Original geometry uses Meshopt and KHR_texture_basisu. To accommodate Blender 5.1, geometry was decoded using glTF Transform 4.3.0 and tevy compressed textures substituted with 4px neutral PNGs. Therefore this proof retains detailed tevy model geometry BUT NOT their original PBR texture fidelity; Poly Haven PBR albedo, normal, roughness and HDRI retained. This limitation matters for the final art quality.

The Actape interface displayed in G5-R v4 is the original project screenshot. The imported screen lacked UVs, so correct physical-plane UV coordinates were authored before attaching the screenshot in Blender.

## Reproduction, not production deployment

1. Run tools/download-g5-r-assets.py and tools/download-g5-r-pbr.py with internet.
2. Run tools/download-tevy.py to retrieve tevy pinned model GLBs.
3. With Node 22+, install @gltf-transform/cli@4.3.0 in art-assets/g5-r/tevy, then run gltf-transform copy source.glb source-uncompressed.glb for each source, and run npm install --prefix tools/g5r-node and then, while working from art-assets/g5-r/tevy, node ../../../tools/g5r-node/convert.mjs.
4. Execute tools/build-g5-r-proof.py using Blender bpy 5.1.2, then tools/build-g5-r-proportions.py, then tools/finish-g5-r-proof.py. Reuse editable G5 Blender base assets/g5/atelier-g5.blend on developer machine.

The scripts produce local editable .blend files and selected actual Cycles photos. They do not modify the public website.
