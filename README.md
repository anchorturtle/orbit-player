# 🪐 Orbit Player

> A trippy, analog hi-fi music player for the cosmos — built with pure vanilla web tech.

This one feels special.

Floating glassy windows over a deep starry field, a glowing planet right in the center, soft scanlines and grain, phosphor text, and controls that have a nice analog weight to them. You can drag and resize everything. It’s a real music player with a real playlist, real waveforms, download, and now lyrics that actually feel *alive*.

No install. No build step. No frameworks. Just open the folder and it works.

**The Lyrics Viewer is our current focus**

We’ve been putting a lot of love into the lyrics experience, especially for the Jazzpot track (more tracks with lyrics coming).

The lyrics follow the music in a smooth, natural way — but you’re always in charge.

- Drag or scroll anywhere in the lyrics list to freely look ahead or back
- Let go and it gently but quickly snaps right back to the line that’s playing and keeps following
- Hold on any line for a moment and the song jumps there
- On phones the current line sits a little higher so you can comfortably read what’s coming up
- Free scrolling with instant snap-back to current line on release (no persistent “NOW” button needed)

It feels responsive and alive instead of robotic. This has been the main thing we’ve been refining and it’s getting really good.

**Quick Resume Notes (for next time we pick this up)**

- **Lyrics viewer** is the active focus area.
- Recent wins (as of last session):
  - Smooth always-on autoscroll with drag-to-browse + instant snap-back on release.
  - Copy-text icon button added in the header (right of the track title).
  - Title + artist now properly centered on desktop and mobile (copy button is absolute-positioned to the right so it doesn’t break centering).
  - Left accent bar next to current lyric completely removed.
  - Currently playing lyric now correctly gets a slight +10% font-size bump (previous em-based rule had it rendering *smaller* than non-highlighted lines — fixed).
  - Lyrics scroll now uses the same custom styled scrollbar (`.no-scrollbar` purple gradient) as the tracklist and gallery.
  - The media player window itself no longer has internal scrolling — all buttons, transport, timeline, and bottom controls stay visible and properly spaced no matter how small you make the window.
- We still have work to do (polish, more tracks with lyrics, possible further refinements).
- Fastest way to test: open `index.html` (or run `npx serve .`), select the **Jazzpot** track, click the lyrics icon in the player header.
- Main files we’ve been touching: `css/styles.css`, `js/player.js`, `index.html`.

**We’ve also been quietly making everything feel more refined and nicer to use**

Lots of quality-of-life and UI polish has landed:

- The player window now tucks itself lower on desktop so the beautiful central planet and the big “NOW PLAYING” title get to be the hero instead of getting covered up.
- Close buttons, text sizes, spacing, and little details are finally consistent across the tracklist, player, gallery, lyrics, and song info windows.
- Windows have smarter defaults, remember where you left them during a session, and behave gracefully when you resize your browser or flip your phone.
- Mobile feels more at home with better layouts and less jank.
- Playlist drag-to-reorder is solid. Waveforms are drawn from the actual audio. Volume and mute work properly even on iOS. Dozens of tiny “that just feels better” improvements everywhere.

## What’s new (latest first)

- **Lyrics viewer font-size fix**: Highlighted/current lyric now correctly renders ~10% larger than non-highlighted lines (previous implementation had it backwards / smaller due to `em` unit resolving against parent instead of the base size).
- **Lyrics autoscroll is now always on by default.** Grab and drag anywhere in the lyrics list to freely browse. On release it instantly snaps back to the current playing line and smooth following resumes right away. The behavior is now strictly tied to your active drag gesture (no lingering timeouts). All the mobile top-bias and prior smoothness improvements are kept.
- Lyrics viewer refinements: autoscroll always computes the ideal position live. The visual follow uses a gentle delayed float (~950ms) after you stop interacting so it feels floaty rather than stiff. Opens already snapped to the current line. Mobile current line is biased toward the top of the viewport. Hold-to-seek updated.
- More lyrics viewer polish: always-on autoscroll with a smooth delay after you stop scrolling so you can freely look around. Gentler lerp for a softer feel. Mobile gets current line biased to the top + full-height layout (minus nav bar). Desktop lyrics window is a bit narrower by default. Softer transitions and feedback across the board.
- “Master the lyrics viewer” update: proper mobile full-screen experience (respects the bottom nav bar), truly free scrolling without the auto fighting you, deliberate hold-to-seek on lines. Desktop default window made narrower. Smoother floaty motion, softer seek feedback. Mobile lyrics text sized for comfort. Lots of close icon and text size homogenization. (The floating “NOW” button was later removed in favor of a simple copy-text button in the header.)
- Homogenize + QC pass: standardized close buttons to a consistent ~66% icon size, unified text sizes across the whole interface, cleaned up and finalized the Jazzpot lyrics (proper punctuation/casing, 40 lines), improved default window positioning so lyrics is centered-top-tall-narrow and doesn’t auto-show on refresh, added the Jazzpot track with its synced lyrics and the sync script.

## Features

- **Premium Player** — Full transport (shuffle, repeat modes including repeat-one, ±10s), drag-to-reorder the playlist, search, download, and volume with real mute on iOS.
- **Beautiful Floating Windows** — Tracklist, player, gallery, lyrics, and song detail windows are all fully draggable and resizable with proper stacking and a mobile dock.
- **Cosmic Gallery** — Touch-friendly image viewer with edge navigation.
- **Shareable & Social Ready** — Clean per-song links that look great when shared, with dynamic pages and custom preview images.
- **Mobile That Actually Works** — Real background playback on iOS (screen off + lock screen controls), thoughtful layouts, and an especially nice lyrics viewer on phones.
- **Zero Fuss** — Pure vanilla web. Open index.html and you’re listening.

## Getting Started

```bash
# Clone and run locally
git clone https://github.com/anchorturtle/orbit-player.git
cd orbit-player

# Option 1: Just open index.html in your browser
# Option 2: Use a local server if you prefer
npx serve .
# or
python -m http.server 8000
```

## Under the hood

### Project Structure

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

### Tech notes

- Pure vanilla JavaScript (no frameworks, no bundlers)
- Web Audio API + GainNode for proper iOS volume and mute control
- Cloudflare Pages Functions for dynamic song pages and social preview images
- Sophisticated CSS glassmorphism + analog bevels + cosmic effects
- Responsive design with desktop windowing + mobile-first dock

### The trickier parts we solved

**iOS Background / Screen-Off Audio**  
Web Audio (needed for real volume control on iOS) gets suspended when the screen locks. We intelligently hand off to a plain native `<audio>` element on visibility changes so music keeps playing with the screen off, then seamlessly sync back to the main player + GainNode when you return.

**Web Audio + Mobile Volume**  
Native `audio.volume` is ignored on iOS Safari. We run a full Web Audio pipeline (MediaElementSource → GainNode) with robust context resume logic so mute and volume actually work.

**Dynamic Social Previews**  
Hash-based routing doesn’t play nice with link unfurling. Cloudflare Functions generate beautiful per-song SVG Open Graph images and serve proper meta tags at clean `/song/slug` routes.

## Deployment

Deploy anywhere static hosting works (GitHub Pages, Netlify, Vercel, etc.).

**Recommended: Cloudflare Pages**  
- Push to GitHub → connect the repo in Cloudflare Pages.  
- The `functions/` directory is automatically used for dynamic routes and OG image generation.  
- Custom domain + free SSL included.

## Contributing

This project is intentionally kept simple and hackable. Feel free to fork and experiment. The modular structure (separate `player.js`, `gallery.js`, `main.js`) makes it easy to work on individual pieces.

---

Built with obsession for the perfect balance of **trippy cosmic visuals** and **tactile analog controls**.

If you love beautiful, hand-crafted web experiences that push the boundaries of what vanilla tech can do — this one’s for you.

🎧✨🪐

*“A music player that feels like it belongs on a spaceship dashboard.”*