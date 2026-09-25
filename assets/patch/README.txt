Orbit v3 Patchwork stills
=========================

Authored plates (this PR):
  patch-vitruvian-jester.png   — Vitruvian dancing jester collage
  patch-coin-anchor-turtle.png — quarters-coin anchor + clay-block turtle
  patch-neon-skull-jester.png  — neon stencil jester skull
  patch-purple-hills.png       — high-contrast purple hills backdrop

Per-song plates are painted live in js/orbit-patch.js (hash of slug → recipe).
To replace a song with a finished still:
  1. Save assets/patch/songs/<slug>.jpg
  2. Add it to SONG_STILLS in js/orbit-patch.js
     e.g. SONG_STILLS['quarters'] = 'assets/patch/songs/quarters.jpg';

Do not add extra decorative words — only "jestR" and "quarters".
