# rizet ngan. — The Product Atelier

> 一座可以探索的产品创作工坊 — Warm Architectural Minimalism × WebGL 3D × Third-Person Mini Explore.

**Live site:** https://rizetngan.github.io  
**Status:** Production WebGL 3D Atelier + Dual Exploration Modes (`Guided Explore` & `Mini Explore`).

## Architecture & Visual Direction

- **Style:** Warm Architectural Minimalism (`Ivory #F2F0EB`, `Ink #202321`, `Terracotta #A04D3E`, `Stone #E4E0D7`, `Walnut #8E715F`, `Sketch Graphite #77756F`).
- **Visual Language:** **Precision Sketch → Material Reality** — architectural linework (`EdgesGeometry`) and muted ivory surfaces progressively develop into tactile limestone, plaster, smoked walnut, and UI screens as visitors approach, while preserving explored areas subtly.
- **Zero-Build Static Deployment:** Runs natively on GitHub Pages (`index.html`, `styles.css`, `atelier-scene.js`, `app.js`, Three.js r128).

## Spatial Zones

1. **Entrance** — Quiet travertine foyer, architectural portal ribs, and editorial brand mark.
2. **The Corridor** — Rhythmic open gallery spine leading toward the studio core.
3. **Prototype Bench (Lab)** — Smoked walnut drafting desk, studio monitor, mobile prototype stand, drafting sketchpad, desk lamp, and terracotta mug.
4. **Work Archive** — Recessed gallery wall featuring **Actape** and **Snug for Windows**.
5. **Notes Library** — Floor-to-ceiling walnut & limestone bookcase and reading lectern.
6. **About Corner** — Fluted plinth with sculptural `r.n` monogram, wall manifesto, and indoor olive tree.

## Dual Interaction Modes

### Mode A: Guided Explore (Default & Mobile)
- Mouse wheel advances smoothly along 6 curated architectural camera viewpoints (interruptible damping).
- Direct 3D click on any object focuses or opens its accessible HTML reading panel.
- Top navigation (`Work`, `Lab`, `Notes`, `About`) and direct hash links (`#work`, `#actape`, `#snug`, `#lab`, `#notes`, `#about`) work without keyboard controls.
- Reading panels take over vertical scrolling cleanly and restore the exact prior space state on close (`Esc`).

### Mode B: Mini Explore (Press `F` or Click Mode Toggle)
- Spawns an original **abstract sculptural human figure** (graphite coat, ivory head/collar, minimal terracotta lapel accent) with 6 procedural animation states (`Idle`, `Walk`, `Turn`, `Auto Mount`, `Float / Hover`, `Land`).
- **Controls:** `WASD` / Arrow keys for eased movement; mouse drag for oblique top-down (`34°–51°`) third-person camera orbit (no forced pointer lock); click floor or objects to auto-walk; `E` to open details; `Esc` to step back or exit.
- **Contextual Actions (User chooses direction, system handles complex motion):**
  - **Auto Mount:** Approach the front of the Prototype Bench with sustained forward intent to gracefully arc onto the walnut desktop, explore the monitor/phone/sketchpad, and step off the edge back to the studio floor.
  - **Wall Lift:** Approach configured Work Archive exhibits (**Actape** / **Snug for Windows**) with sustained intent to gently float upward into an exhibit preview framing, complete local sketch-to-material reveal, and open full details (`E`) or descend cleanly (`S` / `Esc`).
  - **Object Focus:** Gentle camera shift and restrained prompt when nearing Notes Library, About Corner, or desktop devices.

## Real Works Featured

- [Actape](https://github.com/rizetngan/Actape) — Cross-platform macOS & Windows macro recording, editing, and replay tool.
- [Snug for Windows](https://github.com/rizetngan/snug-for-windows) — Community-maintained Windows port of Snug for portrait mobile remote control.

## Documentation

- [DESIGN_SYSTEM_V5.md](./DESIGN_SYSTEM_V5.md) — Locked visual tokens, typography, and Mini Explore interaction specification.
- [GEMINI_HANDOFF.md](./GEMINI_HANDOFF.md) — Updated architectural handoff and implementation notes.
- [QA_REPORT.md](./QA_REPORT.md) — Visual and interaction verification summary.

## V6.1 — Crafted Maquette direction

The V6.1 update refines the model-gallery visual system, strengthens the miniature character scale and replaces the restricted high-angle mini camera with a free orbit / raycast collision boom. The full criteria are in [DESIGN_SYSTEM_V6.md](./DESIGN_SYSTEM_V6.md).

Mini keyboard/mouse: `F` mode, WASD move, **left/right mouse drag** to orbit, **wheel** to zoom, `R` reset view, `E` interact, `Esc` back. Guided mouse wheel still advances the six chapters. Neither mode depends on pointer lock.

This release still uses the uploaded WebGL implementation and procedural product presentation art. Replacing mock art with verified product screenshots and advancing detailed 3D asset modeling are intentional follow-up improvements, not claims of completed photorealistic art.

## V7 — Editorial Maquette (development branch)

This branch contains the immersive Mini control pass, locally vendored Three.js, original project imagery, and first editorial material/prop iteration. See [QA_REPORT_V7.md](QA_REPORT_V7.md) for the tested revision, actual screenshots and remaining release gates. V7 is not yet approved for production.

### V7.2 — Sculpted Atelier

See [QA_REPORT_V72.md](QA_REPORT_V72.md) for the new cutaway architecture, authored furniture, camera composition and actual WebGL screenshots. Main is unchanged.

### E2 — Illustrated Atelier

[Production standards and source register](DESIGN_SYSTEM_E2.md) · [Real-input QA and screenshots](QA_REPORT_E2.md). Native pointer capture verified in headed Chrome. Final visual approval and release remain pending.

### E2.3 — Blender production

[Original Blender asset generator](tools/build-e2-models.py) · [E2.3 QA with actual render evidence](QA_REPORT_E23.md). Native 360° and rear-wall sweep verified; main unchanged.
