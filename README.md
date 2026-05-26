# 🪐 Orbit Player

> A trippy, analog hi-fi music player for the cosmos — built with pure vanilla web tech.

**Orbit Player** is a beautiful, fully functional web music experience that blends **glassmorphism**, **cosmic visuals**, and **analog hi-fi controls** into one cohesive, draggable interface. No build step. No frameworks. Just pure craft.

It features a complete music player, draggable/resizable windows, a photo gallery, and sophisticated sharing with dynamic Open Graph images — all while solving real-world mobile audio challenges on iOS.

[Live Demo](https://your-cloudflare-or-github-pages-url-here) • [Source](https://github.com/anchorturtle/orbit-player)

![Cosmic player interface](images/at-sea-trans-256.png)

## Project Structure (Clean & Organized)

```
orbit-player/
├── index.html                 # Minimal shell (layout, windows, dock)
├── audio/                     # All music tracks (.mp3, .wav)
├── images/                    # Artwork, favicons, and visual assets
├── css/
│   └── styles.css             # Full glassmorphism + analog + cosmic styling
├── js/
│   ├── utils.js               # Helpers (mobile detection, z-index, formatting…)
│   ├── main.js                # Window system, drag/resize, stars, layout, init
│   ├── player.js              # Full audio engine, playlist, controls, MediaSession
│   └── gallery.js             # Image gallery + viewer
├── functions/                 # Cloudflare Pages Functions
│   ├── song/[slug].js         # Dynamic song pages + OG metadata
│   └── og/song/[slug].js      # Dynamic social preview images (SVG)
├── wrangler.jsonc
└── README.md
```

**Zero build tools required.** Works great on GitHub Pages or Cloudflare Pages.

## Why This Project Stands Out

- **Stunning trippy space + analog hi-fi aesthetic** — glassmorphism windows, cosmic gradients, grain, scanlines, phosphor text, and tactile analog controls.
- **No build step** — pure vanilla HTML/CSS/JS. Open `index.html` and it just works.
- **Real engineering depth** — solves hard mobile audio problems (iOS background playback with Web Audio), dynamic social sharing via Cloudflare Functions, and a polished draggable window system.
- **Shareable & social-ready** — every song has beautiful dynamic Open Graph images and metadata so links look incredible when shared.

## Features

- **Premium Player** — Full transport (shuffle, repeat modes, ±10s), drag-to-reorder playlist, search, download, volume with real mute on iOS via GainNode.
- **Beautiful Windows** — Fully draggable and resizable windows with proper z-ordering and mobile dock.
- **Cosmic Gallery** — Touch-friendly image viewer with keyboard and edge navigation.
- **Advanced Sharing** — Dynamic `/song/slug` pages + custom SVG Open Graph images generated at the edge.
- **Mobile Excellence** — Works great with screen off on iOS (native audio handoff) and has thoughtful lock screen integration.
- **Zero Dependencies** — Tailwind via CDN + Google Fonts + Material Symbols only.

## Tech Stack & Highlights

- Pure vanilla JavaScript (no frameworks, no bundlers)
- Web Audio API + GainNode for proper iOS volume/mute control
- Cloudflare Pages Functions for dynamic song pages and social previews
- Sophisticated CSS glassmorphism + analog bevels + cosmic effects
- Responsive design with desktop windowing + mobile-first dock

## Getting Started

```bash
# Clone and run locally
git clone https://github.com/anchorturtle/orbit-player.git
cd orbit-player

# Option 1: Just open index.html in your browser
# Option 2: Use a local server
npx serve .
# or
python -m http.server 8000
```

## Deployment

Deploy anywhere static hosting works (GitHub Pages, Netlify, Vercel, etc.).

**Recommended: Cloudflare Pages**
- Push to GitHub → connect repo in Cloudflare Pages.
- The `functions/` directory is automatically used for dynamic routes and OG image generation.
- Custom domain + free SSL included.

## Known Challenges & Solutions

This project documents real engineering work, not just pretty UI:

**iOS Background / Screen-Off Audio**
- **Problem**: Web Audio (required for volume on iOS) gets suspended when the screen locks. Time continues but sound mutes.
- **Solution**: Intelligent handoff to a plain native `<audio>` element on `visibilitychange` + `pagehide`. This mirrors how direct file playback (QuickTime) works and allows true background playback. On return to foreground we seamlessly sync back to the main player + GainNode.
- **Result**: Music plays with screen off. Lock screen controls (play/pause/next/prev) work correctly.

**Web Audio + Mobile Volume**
- Native `audio.volume` is ignored on iOS Safari.
- **Solution**: Full Web Audio pipeline (MediaElementSource → GainNode) with robust context resume logic.

**Dynamic Social Previews**
- Hash-based routing doesn't work well for link unfurling.
- **Solution**: Cloudflare Functions generate beautiful per-song SVG Open Graph images and serve proper meta tags at clean `/song/slug` routes.

## Contributing

This project is intentionally kept simple and hackable. Feel free to fork and experiment. The modular structure (separate `player.js`, `gallery.js`, `main.js`) makes it easy to work on individual pieces.

---

Built with obsession for the perfect balance of **trippy cosmic visuals** and **tactile analog controls**.

If you love beautiful, hand-crafted web experiences that push the boundaries of what vanilla tech can do — this one’s for you.

🎧✨🪐

*“A music player that feels like it belongs on a spaceship dashboard.”*