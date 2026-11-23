# rizet ngan. — The Product Atelier

> A personal creative space for products, thinking and independent experiments.

**Live site:** https://rizetngan.github.io  
**Status:** CSS-3D interaction prototype. The final visual design and WebGL experience are **not** implemented yet.

## Read this first (Gemini / contributors)

- [GEMINI_HANDOFF.md](./GEMINI_HANDOFF.md) — **current, authoritative creative direction**: architectural gallery × product atelier; Precision Sketch → Material Reality; ITOM-inspired exploration.
- [DESIGN_SYSTEM_V4.md](./DESIGN_SYSTEM_V4.md) — warm stone / terracotta palette and visual foundations.
- [QA_REPORT.md](./QA_REPORT.md) — interaction prototype verification.

## Existing prototype

The current page is a no-build proof of concept for camera/navigation/reading behavior, not the final look.

- Default Guided mode: scroll or click to explore, navigation jumps to sections.
- Free Roam: **F** to toggle; **WASD** to move; mouse to look; **E** to interact; **Esc** to leave.
- Reading panels are ordinary HTML and take over scrolling.
- Mobile visitors get a simplified guided experience.

Files: `index.html`, `styles.css`, `script.js`.

To preview locally, open `index.html` or serve the repository folder with `python -m http.server 8080`.

## Final design goal

**rizet ngan.** is a long-term personal maker brand, not a job résumé. The approved direction is **The Product Atelier**, an explorable architectural corridor and personal workspace. Interaction and art direction must be one coherent language: **Precision Sketch → Material Reality** with medium-strength sketch-to-finished-object reveal.

Colors: Ivory `#F2F0EB` · Ink `#202321` · Terracotta `#A04D3E` · Stone `#E4E0D7` · Walnut `#8E715F` · Graphite `#77756F`.

The old CSS graybox is intentionally replaceable. Future work can use Astro, TypeScript, React Three Fiber, Drei and GSAP, but must keep static GitHub Pages deployment and readable content routes.

## References

- [ITOM portfolio](https://itomdev.com/) · [source](https://github.com/ITomPoland/portfolio-itom)
- [Henry Heffernan](https://github.com/henryjeff/portfolio-website)
- [MelodyZ](https://github.com/ZouYue123321/nihao)
- Real projects: [Actape](https://github.com/rizetngan/Actape) · [Snug for Windows](https://github.com/rizetngan/snug-for-windows)

Third-party personal assets (models, illustrations, music, textures, copy) require appropriate permission. Do not reuse ITOM's original art.

---
Maintained by rizet ngan.
