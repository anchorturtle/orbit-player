# 🪐 Orbit Planetary Player

> Cosmic High-Fidelity music player UI — now modular

A dark-mode, glassmorphism-styled music player built with plain HTML + Tailwind CSS CDN. **Zero build step required.**

## New Modular Structure

```
orbit-player/
├── index.html          # Lightweight shell (layout + containers only)
├── css/
│   └── styles.css      # All custom CSS (glassmorphism, windows, cosmic effects)
├── js/
│   ├── utils.js        # Shared helpers (isMob, bringToFront, fmt, clamp…)
│   ├── main.js         # Core UI, window drag/resize, desktop layout, stars, init
│   ├── player.js       # Audio engine, tracklist, controls, drag-reorder, volume
│   └── gallery.js      # Gallery data + image viewer with swipe/keyboard nav
├── gallery/            # Optional extra images (currently unused by array)
├── wrangler.jsonc
└── README.md
```

## Why this split?

- **index.html** is now tiny (~180 lines) — fast to edit even with AI
- Each concern lives in its own file (CSS / player logic / gallery / windowing)
- Still 100% static — works on GitHub Pages, Cloudflare Pages, etc.
- No bundler, no npm, no build step

## Quick Start (Local)

1. `cd orbit-player`
2. Open `index.html` directly in a browser, **or**
3. Run a simple static server:

```powershell
# PowerShell (Windows)
python -m http.server 8000
# or
npx serve .
```

Then visit http://localhost:8000

## Deployment

- **Cloudflare Pages / GitHub Pages**: Just push. The `css/` and `js/` folders are served automatically.
- The only config file needed is `wrangler.jsonc` (for Cloudflare).

## Editing Tips

- Work on **one file at a time** (e.g. tweak player behavior in `js/player.js`).
- The Tailwind CDN + custom `css/styles.css` gives you the full hi-fi aesthetic.
- Global functions (`toggleWin`, `loadTrack`, `renderGallery`, etc.) are intentional so the inline `onclick` handlers on the dock still work.

## Preserved Features

- Full glassmorphism + cosmic background (stars, grain, scanlines, vignette)
- Draggable + resizable windows (desktop)
- Smart mobile navigation dock with "tap again to close" behavior
- 14-track playlist with drag-to-reorder + search
- Full player: shuffle, repeat (all/one), ±10s, volume with mute memory, download
- Beautiful gallery with touch swipe + edge nav + keyboard arrows
- Focal planet visual that updates with current track
- Zero external dependencies besides Tailwind CDN + Google Fonts

## Original (pre-refactor)

Everything lived in one giant `index.html`. That file is now replaced by the modular version above. The visual design and all behavior are identical.

---

Built with love for the hi-fi cosmic aesthetic. Enjoy editing the pieces independently! 🎧✨