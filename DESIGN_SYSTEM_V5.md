# rizet ngan. — Design & Interaction System V5

**Concept:** The Product Atelier (Architectural Private Gallery × Working Product Studio)  
**Visual Style:** Warm Architectural Minimalism (`Precision Sketch → Material Reality`)  
**Interaction Model:** Mode A `Guided Explore` (default) + Mode B `Mini Explore` (third-person sculptural character)

## Color Tokens

| Token | Hex | Role |
|---|---|---|
| `--ivory` | `#F2F0EB` | Primary canvas, paper surfaces, editorial reading panels |
| `--ink` | `#202321` | Wordmark, headings, primary controls, dark hardware |
| `--terra` | `#A04D3E` | Brand accent period, active indicators, character lapel, mount/lift markers |
| `--stone` | `#E4E0D7` | Mineral plaster walls, limestone slabs, plinths |
| `--walnut` | `#8E715F` | Prototype Bench slab, exhibit frames, library shelves |
| `--graphite` | `#77756F` | Architectural `EdgesGeometry` drafting lines, secondary metadata |

## Typography

- **Display / Brand:** `Instrument Serif` (with `Noto Serif SC` / `Georgia` fallback); brand mark always `rizet ngan.` with terracotta period.
- **UI / Body:** `Instrument Sans` (with system Chinese sans-serif fallback); reading line measure capped at `640px` with `1.85` line height.

## Interaction State Machine (`app.js`)

States: `GUIDED` · `MINI_WALKING` · `AUTO_TRAVERSAL` · `OBJECT_PREVIEW` · `READING` · `TRANSITIONING`.

- **Position Inheritance:** Pressing `F` inherits the visitor's spatial zone between Guided chapters and Mini Explore safe floor anchors.
- **Auto Mount:** Requires entering the front bench mount zone (`|x| <= 1.55, z ∈ [1.15, 2.15]`) + sustained forward intent (`>= 0.18s`) to prevent accidental triggers when walking past.
- **Wall Lift:** Triggered only at configured Work Archive exhibits (`actape`, `snug`) with sustained directional intent (`dot > 0.58`, `>= 0.22s`), followed by a `1.1s` post-descent cooldown to prevent oscillation loops.
- **Safe Recovery:** `Esc` unwinds cleanly (`Help → Reading → Wall Lift / Traversal → Mini Explore → Guided`); blur clears pressed keys; AABB + pillar sliding prevents getting stuck inside furniture; `prefers-reduced-motion` is respected.
