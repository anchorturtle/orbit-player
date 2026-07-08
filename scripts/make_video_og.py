"""1200x630 link-preview card: video frame + orbit glass play (no VIDEO badge)."""
from PIL import Image, ImageDraw
import os

src = os.path.join(os.path.dirname(__file__), "..", "videos", "jazzpotwax-poster.jpg")
out = os.path.join(os.path.dirname(__file__), "..", "videos", "jazzpotwax-og.jpg")
target = (1200, 630)

im = Image.open(src).convert("RGB")
w, h = im.size
scale = max(target[0] / w, target[1] / h)
nw, nh = int(w * scale), int(h * scale)
im = im.resize((nw, nh), Image.LANCZOS)
left = (nw - target[0]) // 2
top = (nh - target[1]) // 2
im = im.crop((left, top, left + target[0], top + target[1]))

draw = ImageDraw.Draw(im, "RGBA")
cx, cy = target[0] // 2, target[1] // 2

# Soft vignette (readability, still shows the frame)
for i in range(8):
    pad = i * 18
    alpha = int(12 + i * 4)
    draw.rectangle(
        (pad, pad, target[0] - pad, target[1] - pad),
        outline=(3, 2, 10, alpha),
        width=2,
    )

# Glass play: outer glow ring (baby-blue, not purple)
r_outer = 78
draw.ellipse(
    (cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer),
    fill=(126, 200, 227, 28),
    outline=(126, 200, 227, 90),
    width=2,
)

# Frosted disc
r = 64
draw.ellipse(
    (cx - r, cy - r, cx + r, cy + r),
    fill=(255, 255, 255, 38),
    outline=(233, 225, 222, 200),
    width=3,
)
draw.ellipse(
    (cx - r + 6, cy - r + 6, cx + r - 6, cy - r + 6),
    fill=(3, 2, 10, 120),
    outline=None,
)

# Play triangle (baby-blue)
tri = [(cx - 18, cy - 32), (cx - 18, cy + 32), (cx + 34, cy)]
draw.polygon(tri, fill=(126, 200, 227, 245))

im.save(out, quality=90)
print("wrote", out, os.path.getsize(out))