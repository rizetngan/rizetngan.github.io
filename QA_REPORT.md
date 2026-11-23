# V6.1 Quality Gate — Crafted Maquette

## Completed source-level verification

- [x] Full Gemini WebGL code from the user-provided ZIP restored as the implementation baseline, rather than the older remote CSS graybox.
- [x] Unified V6 art system includes an architectural plinth, shadow edge, gallery joints, softer lighting, restrained linework, an original small sculpture figure and simplified editorial HUD.
- [x] Mini camera pitch range changed to 4–75°, 360° yaw; mouse left/right drag and wheel zoom; R resets to default follow angle.
- [x] Camera boom collision now tests architectural meshes by raycast; requested zoom and collided distance are independent; enter/exit exhibit respects camera orbit state.
- [x] `node --check app.js` and `node --check atelier-scene.js` passed.
- [x] `git diff --check` passed. Upload blob SHAs matched local `git hash-object` exactly.
- [x] Branch `feat/crafted-maquette-v6` created and cloned on connected Windows computer.

## Browser QA status

- [ ] **Full visual WebGL and interaction screenshot suite is not yet verified.** The isolated local Chromium session cannot reach the remote Three.js CDN; the remote Windows headless Chrome attempt did not produce a screenshot. Do not treat source checks as proof of 3D frame quality.
- [ ] Run the actual walkthrough: guided chapter scroll; mini orbit at 5/25/70 degrees; 360° right drag; zoom; wall boom; auto mount/dismount; wall lift; HTML reading return; mobile guide.
- [ ] Replace illustrative Actape/Snug graphics with screenshots verified against original products, if available.

## Remaining limitations

- Legacy Three.js r128 via cdnjs is still an online runtime dependency, not vendored.
- Current scene still uses procedural meshes rather than fully authored GLB hero assets; V6.1 improves the visual design and framing, but should not be mistaken for a photoreal 3D asset production.
- Automatic traversal uses authored routes rather than Rapier physics and should be visually checked before expanding the world.
