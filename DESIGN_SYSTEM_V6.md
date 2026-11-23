# rizet ngan. — Crafted Maquette V6.1

## Art direction

**Architectural Maquette Atelier**. A tactile architectural-scale-model gallery with a genuinely used creator's workbench, not a CAD box or a stylized game world. Keep The Product Atelier brand, real product content, six zones and both exploration modes.

- Ivory `#F2F0EB` / ink `#202321` / terracotta `#A04D3E` / mineral stone `#E4E0D7` / walnut `#8E715F` / drafting graphite `#77756F`.
- Physical architectural model **plinth** with shadow gap; layered plaster walls with joints; smoked walnut bench; few graphite details and tactile grain.
- Sketch → material remains **medium strength** and attached to spatial discoveries. Do not outline every triangle or re-color the whole world.
- The miniature sculptural explorer is **~0.68×** the previous figurine, roughly 40% of desk height; no animated cartoon face, combat or jumping minigame.
- Editorial typography outside the canvas. Fewer floating cards, status pills and explanations. Retain discoverable main actions and accessibility labels.

## Interactive camera contract

- Guided view retains scrolling chapter anchors and direct clickable content; Mini can be entered via F / top control.
- Mini default pitch **~23°**, user-adjustable **4–75°** above horizon with a true 360° azimuth.
- Left-click = select / walk; left-drag empty canvas or right-drag = orbit, no default pointer-lock requirement.
- Scroll-wheel = Mini zoom with desired boom length **1.9–5.8 world units**; R resets to character-follow angle, 23° pitch and 3.85 length.
- WASD relative to camera's current yaw; angle does not silently recenter during free walking.
- Boom raycasts against architectural collision meshes. Shrink promptly near walls; extend gradually after retreat. Keep intended zoom separate from collision-limited distance.
- Wall Lift takes over framing while active, then returns to saved user camera orientation and desired distance.
- Reading overlays capture scroll, stop movement and preserve mode on return. Reduced-motion preference respected.

## Acceptance views / functional testing

1. Desktop entrance full scene, no permanently covering UI cards; editorial title aligned to the room.
2. Mini near desk, normal camera. Mini near desk at 5–10° and 65–70° pitch. Confirm visibly different pitches.
3. Full 360° horizontal camera turn without flip or abrupt yaw snap.
4. Wheel zoom 1.9–5.8, no Guided chapter movement in Mini.
5. Approach a solid wall while orbiting behind character: no camera-through-wall, no uncontrolled snap; retreat smoothly restores preferred zoom.
6. Ground → auto mount → desk → dismount; wall lift → preview → reading → return to original camera angle.
7. Mobile Guided entrance, navigation, Work/Notes/Lab reading and no forced joystick.
8. Browser console free of runtime exceptions; live deployment tested on the actual HTML, CSS and JS build.

## Implementation scope

V6.1 is a **code-first refinement of Gemini's uploaded static WebGL code** (Three.js r128), not a new R3F rewrite. Keep runtime lightweight; swap to R3F/CameraControls only when it demonstrably improves the user experience and has been smoke-tested. The external Three.js CDN remains a runtime dependency of this release.
