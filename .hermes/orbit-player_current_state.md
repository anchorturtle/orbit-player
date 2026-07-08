# Orbit Player — current state (Hermes)

**Updated:** 2026-07-02 — V2 zone planets: tap/drag fix, Material surface icons, print↔track sync

## V2 3D planet room (primary desktop `?v=2`)

- **Center:** audio-reactive hero planet (unchanged `space3d.js` core).
- **Zone planets** (replace floating windows): **catalog** (tracks), **archive** (gallery), **player** (full transport UI), plus on-demand **lyrics**, **songDetail**, **imageViewer**.
- **Orbit:** each zone planet **slowly orbits** `(0,0,0)` with independent radius/phase/inclination; **self-spin** on Y; drag **pauses** orbit until release (8px drag threshold — taps on yellow prints / gallery dots register without stealing drag).
- **Textures:** canvas **Warhol silkscreen** maps per type (halftone, op-art rings, waveform lines) on `MeshStandardMaterial`.
- **On-planet buttons:** **Material Symbols** on surface chips (`library_music`, `photo_library`, `play_circle`) — click toggles panels via `OrbitPlanetWorld`.
- **Catalog prints:** click yellow Warhol stacks → `loadTrack` + `selectCatalogPrint`; rail chips stay in sync; track changes from deck also highlight print.
- **Panels:** `js/orbit-planet-world.js` + `css/orbit-planet-panels.css` — glass HUD follows planet; **Esc** closes.

## Verify locally

`http://127.0.0.1:3456/?v=2` hard refresh.

Console: `Object.keys(__ZONE_PLANETS)` → `catalog`, `archive`, `player`; `__ZONE_PLANETS.catalog.userData.prints.length` → track count.

## Next

- Player transport merged onto player planet surface (deck still works).
- Mobile: keep legacy wins until 3D path tested.
- Perf pass with `?perf=1` after interaction changes.

## 2026-07-02 session (archive + breath)

- **Archive planet:** 47 golden-spiral gallery points (`galleryIdx`); click dot → `openImageWin` + `selectArchiveGalleryPoint` highlight; audio wobble on dots.
- **Living Orbit:** all zone planets get slow breath + audio-driven emissive (not only selected).