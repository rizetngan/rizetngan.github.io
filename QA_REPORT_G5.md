# G5.1 — Cinematic Product Atelier preview

Tested source: 993a0496cc63115f3a397a4aa56549ee1e16622a. Deployment: f6dd8ca8789c776e7ca3108d348d70bf17f132ac, changes limited to /preview/g5/. Live preview https://rizetngan.github.io/preview/g5/.

## Art and implementation
Blender 5.1.2, Cycles OptiX on RTX 3050, original shared studio, 4 JPEG photographs, real project images letterboxed on authored display carriers. 53 semantic runtime meshes, 2,760,664-byte GLB. Editable packed .blend on the build device; reproduce via tools/build-g5.py. Static portfolio and individual product pages independent of WebGL; Mini controller migrated from E2. Actual renders, not concept art. Offline Cycles lighting remains richer than the browser approximation; no baked indirect light or KTX2 yet.

## Verified
- Source JavaScript syntax checks and diff check.
- Hardware Chrome ANGLE NVIDIA RTX 3050 D3D11, 1440x900 and 390x844 emulation. All home and detail images decoded, mobile homepage no horizontal overflow. Nine asset flags true, live studio GLB loaded.
- Earlier unbatched software renderer test timed out mid-dismount; final batched hardware full regression exit 0 (93.46s), no Runtime.exceptionThrown. W mount at y=1.02, S dismount y=0, F same-chapter resume, approach Actape stays walking, E lift and E reading, return yaw restored, mobile studio rendered.
- Headed hardware native test exit 0 (32.17s), no Runtime.exceptionThrown. True Pointer Lock, Escape release and re-acquire, two actual 360.16-degree event-tracked sweeps. Rear wall character z=-4.55; sampled minimum camera z=-5.2563, in front of wall inner face.
- Three-second RAF samples: Guided 60.07 FPS, Mini 60.12 FPS, both p95 16.8 ms. Short samples on this GPU only; not a sustained cross-device performance benchmark.
- Public G5 routes, CSS, JS, hero, GLB and Three vendor returned HTTP 200 and exact bytes matching deployed files. Main and E2 tracked files not modified by deployment.
- No real-phone gesture test or final user visual approval. Mini character uses the E2 skin, no new G5 character asset. No claim that concept image quality is fully matched.

[Actual screenshots](docs/qa/g5/g5-qa.jpg) · [Live portfolio](https://rizetngan.github.io/preview/g5/).

