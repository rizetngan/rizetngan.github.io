# Real-time restoration — QA

Base revision: 9440edfefbaf19060a9779b5d5edeff938117f50 (E2.4). app.js, index.html, styles.css are unchanged from that commit; only the 3D art layer was modified, with new assets. All 6 chapters remain in a single realtime Three.js scene. No still-image Guided mode or separate portfolio entry.

## Art
Full original PBR material channels for CC0 tevy monitor, keyboard, chair and Poly Haven articulated lamp. Actual Actape screenshot retained, fitted onto source screen plane. Surface albedo, normal and roughness maps for walnut and plaster. HDRI-derived PMREM environment, shadow contrast and stronger proximity-dependent color transition. Art meshes fit the existing movement and camera envelope; old assets remain as load-failure fallback. The desk walk height remains 1.02. No claim of baked Cycles lighting or concept-render fidelity.

## Actual tests
- Chrome WebGL2, ANGLE RTX 3050 D3D11, 1440x900: all 13 readiness flags true.
- Original E2 full keyboard regression exit 0, 42.71 s: orbit, zoom, mount/dismount, F preserves position/yaw, approach Actape without auto lift, E lift/read, S return, reading image loaded, 390x844 mobile emulated screenshot. No runtime exceptions.
- Real DOM click and wheel regression exit 0, 24.19 s: Enter -> corridor; wheel -> Lab with camera movement; Work, Notes, About nav links; brand returns to entrance; direct work link. All 6 chapters. No runtime exceptions.
- Native headed mouse test: pointer lock acquired, then isolated Chrome lost foreground or capture before native relative movement; safety guard stopped test. Full physical 360-degree sweep not verified in this revision. No physical phone touch testing.
- The full interaction controller and original markup/CSS are byte-identical to E2.4 Git blobs (line endings normalized by Git).

## Assets
tevy CC0 source models (v1): https://tevy.dev/models/desktop-monitor ; https://tevy.dev/models/mechanical-keyboard ; https://tevy.dev/models/office-chair . Original compressed textures decoded with Khronos KTX in G5-R; no neutral placeholder textures. Poly Haven CC0 https://polyhaven.com/a/desk_lamp_arm_01 , https://polyhaven.com/a/smoked_walnut_veneer , https://polyhaven.com/a/painted_plaster_wall , https://polyhaven.com/a/poly_haven_studio . Source material texture maps resized to <=1024 pixels; original geometry preserved. See asset manifest for runtime SHA256 hashes. Original large source cache retained on development machine, not redistributed unnecessarily.

## Evidence
[All screenshot views](screenshots.jpg) | [Entrance](01-entrance.jpg) | [Workbench](02-lab.jpg) | [Mini](04-mini.jpg) | [Desk](06-desk.jpg) | [Notes](ui-notes.jpg) | [About](ui-about.jpg).
