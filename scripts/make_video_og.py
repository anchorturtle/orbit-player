"""1200x630 link-preview: clean video frame + baby-blue glass disc + white play."""
from PIL import Image, ImageDraw
import os

BABY = (126, 200, 227)
WHITE = (255, 255, 255)

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