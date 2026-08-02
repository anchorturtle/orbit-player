"""1200x630 link-preview: clean video frame + baby-blue glass disc + white play.

Generates one -og.jpg per video from its -poster.jpg (center crop to 1200x630).
"""
from PIL import Image, ImageDraw
import os

BABY = (126, 200, 227)
WHITE = (255, 255, 255)

ROOT = os.path.join(os.path.dirname(__file__), "..", "videos")
TARGET = (1200, 630)

VIDEOS = [
    ("jazzpotwax", "jazzpotwax-poster.jpg"),
    ("thousand-dragon", "thousand-dragon-poster.jpg"),
    ("ko", "ko-poster.jpg"),
]

for slug, poster in VIDEOS:
    src = os.path.join(ROOT, poster)
    out = os.path.join(ROOT, f"{slug}-og.jpg")

    im = Image.open(src).convert("RGB")
    w, h = im.size
    scale = max(TARGET[0] / w, TARGET[1] / h)
    nw, nh = int(w * scale), int(h * scale)
    im = im.resize((nw, nh), Image.LANCZOS)
    left = (nw - TARGET[0]) // 2
    top = (nh - TARGET[1]) // 2
    im = im.crop((left, top, left + TARGET[0], top + TARGET[1]))

    draw = ImageDraw.Draw(im, "RGBA")
    cx, cy = TARGET[0] // 2, TARGET[1] // 2
    r = 62

    # Soft radial edge (no boxy rectangles)
    for spread, alpha in ((92, 22), (78, 38), (r, 88)):
        draw.ellipse(
            (cx - spread, cy - spread, cx + spread, cy + spread),
            fill=(*BABY, alpha),
        )

    # Glass rim + specular highlight
    draw.ellipse(
        (cx - r, cy - r, cx + r, cy + r),
        fill=(*BABY, 95),
        outline=(220, 242, 250, 230),
        width=3,
    )
    draw.ellipse(
        (cx - r * 0.72, cy - r * 0.92, cx + r * 0.72, cy - r * 0.05),
        fill=(255, 255, 255, 55),
    )

    # White play triangle
    tri = [(cx - 15, cy - 28), (cx - 15, cy + 28), (cx + 30, cy)]
    draw.polygon(tri, fill=(*WHITE, 252))

    im.save(out, quality=90)
    print("wrote", out, os.path.getsize(out))
