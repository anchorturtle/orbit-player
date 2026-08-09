"""1200x630 link-preview card: per-song gradient + song title.

Generates one images/og/song/<slug>.jpg per track. Gradient colors come from
the SAME palette table + hash as js/space3d.js (PALETTES, hashStr) so the
share card matches the song's planet world.

USAGE: python scripts/make_song_og.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

TARGET = (1200, 630)
TITLE_FONT = "C:/Windows/Fonts/BebasNeue-Regular.ttf"
SUB_FONT = "C:/Windows/Fonts/Montserrat-Medium.ttf"

# Keep in sync with the track maps in functions/song/[slug].js + functions/og/song/[slug].js
SLUGS = [
    "offers", "thousand-dragon", "ko", "geronimo", "mile-high",
    "follow-the-flow", "soul-seer", "peace", "strider", "insane-membrane",
    "wavy", "boa-constrictor", "news", "wheels", "pop",
    "the-sum-of-hippy-thoughts", "what-dreams-may-come", "spin-cycle",
    "jazzpot", "still-going-higher", "fat-stacks", "chokeslam",
]

TITLES = {
    "offers": "Offers", "thousand-dragon": "Thousand Dragon", "ko": "K.O.",
    "geronimo": "Geronimo", "mile-high": "Mile High", "follow-the-flow": "Follow The Flow",
    "soul-seer": "Soul Seer", "peace": "Peace", "strider": "Strider",
    "insane-membrane": "Insane Membrane", "wavy": "Wavy", "boa-constrictor": "Boa Constrictor",
    "news": "News", "wheels": "Wheels", "pop": "Pop",
    "the-sum-of-hippy-thoughts": "The Sum Of Hippy Thoughts", "what-dreams-may-come": "What Dreams May Come",
    "spin-cycle": "Spin Cycle", "jazzpot": "Jazzpot", "still-going-higher": "Still Going Higher",
    "fat-stacks": "Fat Stacks", "chokeslam": "Chokeslam",
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


def make_card(slug, title, out_path):
    palette = PALETTES[hash_str(slug) % len(PALETTES)]
    surf, swirl, energy = (hex_to_rgb(c) for c in palette)

    # Diagonal gradient: top-left surface -> bottom-right energy, swirl mid-stop.
    # Deep + dark so white title text pops (matches planet world, not neon-flat).
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

    # Very subtle vignette depth (keeps edges from looking flat)
    for i, alpha in ((0, 18), (90, 12), (180, 8)):
        draw.rectangle([i, i, W - i, H - i], outline=(0, 0, 0, alpha), width=1)

    # Title (BebasNeue, big, centered, white)
    title_font = ImageFont.truetype(TITLE_FONT, 148)
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (W - tw) // 2 - bbox[0]
    ty = (H - th) // 2 - bbox[1] - 20
    draw.text((tx, ty), title, font=title_font, fill=(255, 255, 255, 255))

    # Tiny site wordmark (bottom center)
    sub_font = ImageFont.truetype(SUB_FONT, 26)
    sub = "A N C H O R T U R T L E"
    bbox2 = draw.textbbox((0, 0), sub, font=sub_font)
    sw = bbox2[2] - bbox2[0]
    draw.text(((W - sw) // 2 - bbox2[0], H - 74), sub, font=sub_font, fill=(255, 255, 255, 130))

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
