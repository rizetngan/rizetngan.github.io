# G5-R: original Blender/Cycles asset study

**ART GATE: NOT YET APPROVED.**

This study materially improves licensed geometry, materials and proportion but does not meet the approved G5 high fidelity concept. It is deliberately not merged or deployed.

## Actual evidence
- [Baseline versus new art proof](production-comparison.jpg)
- [New real Cycles render — primary composition](workbench-v4-editorial.jpg)
- [Close-up](workbench-v4-closeup.jpg)
- [Earlier full-size desk rejected](workbench-v2-wide.jpg)
- [Intermediate scaled model with blank screen rejected](workbench-v3-cinema.jpg)

## Verified technical findings
- Previous authored desk was implausibly 4.6m wide, causing a distorted model. Scale now about 2.53m in the production study.
- MD5-verified Poly Haven PBR/HDRI and 5 professionally modeled assets; source provenance in asset register.
- tevy CC0 display, keyboard and office-chair geometry downloaded, SHA256 verified, optimized for Blender import. Its compressed source PBR textures were NOT preserved in the Blender import; placeholder tevy textures limit visible quality.
- Initial separate display plane lacked UVs. Actual Actape screenshot appears on corrected monitor plane only after UV regeneration.
- Visual problems remain: generic olive wall, comparatively basic desk/floor/cup, no convincing indirect daylight rhythm or refined industrial product camera staging, and less detailed materials than the approved imagery.

## Decision
Keep G5 preview, production homepage and Mini untouched. Next art sprint should replace remaining primitive desk/architecture, develop a stronger signature camera shot, bring full authored tevy materials (KTX2 transcoding or equivalent) and bake material-aware lightmaps before considering real-time import.

All art proof photos are from the local Blender Cycles run on RTX 3050, not synthetic high-fidelity concepts. Editable packed .blend preserved on Windows authorized build machine, not committed because local sources exceed typical repo size.
