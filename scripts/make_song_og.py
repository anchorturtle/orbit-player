"""1200x630 link-preview card: per-song gradient + song title (bottom-right, serif).

Generates one images/og/song/<slug>.jpg per track. Gradient colors come from
the SAME palette table + hash as js/space3d.js (PALETTES, hashStr) so the
share card matches the song's planet world.

Design (james 2026-08-09): just the song name, bottom-right of the gradient,
modern serif. No artist, no wordmark.

USAGE: python scripts/make_song_og.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

TARGET = (1200, 630)
# Modern serif. Swap path to change look (e.g. AGaramondPro-Bold.otf for classic).
TITLE_FONT = "C:/Windows/Fonts/HenriDidot.otf"

# Keep in sync with the track maps in functions/song/[slug].js + functions/og/song/[slug].js
SLUGS = [
    "offers", "thousand-dragon", "ko", "hyperdream-odyssey", "geronimo", "mile-high",
    "follow-the-flow", "soul-seer", "peace", "strider", "insane-membrane",
    "wavy", "boa-constrictor", "news", "wheels", "pop",
    "the-sum-of-hippy-thoughts", "what-dreams-may-come", "spin-cycle",
    "jazzpot", "still-going-higher", "fat-stacks", "chokeslam",
    "grateful-sharpie", "tomb-of-the-creator", "blockbuster", "what-is-it-now",
    "got-nun", "sublime-beginnings", "space-radio", "exploding-galaxies",
    "acid-rain", "four-twenty", "get", "my-anthem",
    "nonnin", "whoiam2u", "free-dumb", "death-of-jestr",
]

TITLES = {
    "offers": "Offers", "thousand-dragon": "Thousand Dragon", "ko": "K.O.",
    "hyperdream-odyssey": "hyperdream.odyssey.exe",
    "geronimo": "Geronimo", "mile-high": "Mile High", "follow-the-flow": "Follow The Flow",
    "soul-seer": "Soul Seer", "peace": "Peace", "strider": "Strider",
    "insane-membrane": "Insane Membrane", "wavy": "Wavy", "boa-constrictor": "Boa Constrictor",
    "news": "News", "wheels": "Wheels", "pop": "Pop",
    "the-sum-of-hippy-thoughts": "The Sum Of Hippy Thoughts", "what-dreams-may-come": "What Dreams May Come",
    "spin-cycle": "Spin Cycle", "jazzpot": "Jazzpot", "still-going-higher": "Still Going Higher",
    "fat-stacks": "Fat Stacks", "chokeslam": "Chokeslam",
    "grateful-sharpie": "Grateful Sharpie",
    "tomb-of-the-creator": "Tomb of the Creator ft. Tevin Page", "blockbuster": "Blockbuster ft. Tevin Page",
    "what-is-it-now": "What Is it Now?", "got-nun": "got nun?",
    "sublime-beginnings": "Sublime Beginnings", "space-radio": "Space Radio",
    "exploding-galaxies": "Exploding Galaxies", "acid-rain": "Acid Rain",
    "four-twenty": "420", "get": "Get",
    "my-anthem": "My Anthem", "nonnin": "Nonnin",
    "whoiam2u": "WHOiAM2u", "free-dumb": "free(dumb)",
    "death-of-jestr": "death of jestR",
}

# Mirrors js/space3d.js PALETTES (surface, swirl, energy)
PALETTES = [
    ("#7B2FFF", "#2D5BFF", "#00C896"),
    ("#6E1230", "#B02458", "#FF4D88"),
    ("#0A5C6E", "#1240A0", "#19E3C2"),
    ("#4A1B7A", "#8A2BE2", "#FF3D9A"),
    ("#5C0F2E", "#7B2FFF", "#C2275A"),
    ("#16216E", "#4D6BFF", "#B14DFF"),
    ("#0B3B4C", "#0E7C7B", "#06D6A0"),
    ("#3B0E45", "#A2196E", "#FF6FB7"),
    ("#241054", "#5B1FA8", "#19B8E3"),
    ("#54123B", "#933B8B", "#E84FBF"),
    ("#4C0E22", "#A8324A", "#FF7A6E"),
    ("#06343C", "#0F8A6E", "#7FFFC9"),
    ("#33104F", "#C23B8A", "#5BD0FF"),
    ("#1B0B3A", "#6E2FB8", "#FF9ECF"),
]

MARGIN_R = 84   # title block distance from right edge
MARGIN_B = 66   # title block distance from bottom edge
MAX_W = 1010    # max title width before auto-shrink
MAX_FONT = 132


def hash_str(s):
    h = 0
    for ch in s:
        h = (h * 31 + ord(ch)) & 0xFFFFFFFF
    return h


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lerp(c1, c2, t):
    return tuple(int(round(a + (b - a) * t)) for a, b in zip(c1, c2))


def fit_font(draw, title, max_w, max_font):
    size = max_font
    while size > 40:
        f = ImageFont.truetype(TITLE_FONT, size)
        bbox = draw.textbbox((0, 0), title, font=f)
        if bbox[2] - bbox[0] <= max_w:
            return f, bbox
        size -= 4
    f = ImageFont.truetype(TITLE_FONT, 40)
    return f, draw.textbbox((0, 0), title, font=f)


def make_card(slug, title, out_path):
    palette = PALETTES[hash_str(slug) % len(PALETTES)]
    surf, swirl, energy = (hex_to_rgb(c) for c in palette)

    # Diagonal gradient: top-left surface -> bottom-right energy, swirl mid-stop.
    img = Image.new("RGB", TARGET)
    px = img.load()
    W, H = TARGET
    for y in range(H):
        for x in range(W):
            t = (x + y) / (W + H)  # 0 top-left -> 1 bottom-right
            if t < 0.5:
                c = lerp(surf, swirl, t * 2)
            else:
                c = lerp(swirl, energy, (t - 0.5) * 2)
            px[x, y] = c

    draw = ImageDraw.Draw(img, "RGBA")

    # Song title only — bottom-right, modern serif, white.
    f, bbox = fit_font(draw, title, MAX_W, MAX_FONT)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    # Right-align: text ends MARGIN_R from right edge, baseline sits MARGIN_B up.
    tx = W - MARGIN_R - tw - bbox[0]
    ty = H - MARGIN_B - th - bbox[1]
    draw.text((tx, ty), title, font=f, fill=(255, 255, 255, 255))

    img.save(out_path, quality=92)


def main():
    root = os.path.join(os.path.dirname(__file__), "..", "images", "og", "song")
    os.makedirs(root, exist_ok=True)
    for slug in SLUGS:
        out = os.path.join(root, f"{slug}.jpg")
        make_card(slug, TITLES[slug], out)
        print("wrote", out)


if __name__ == "__main__":
    main()
