"""Bake last-frame poster into 1200x630 OG card with play + VIDEO badge."""
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
r = 72
draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(3, 2, 10, 150), outline=(233, 225, 222, 220), width=4)
tri = [(cx - 22, cy - 38), (cx - 22, cy + 38), (cx + 42, cy)]
draw.polygon(tri, fill=(126, 200, 227, 255))
draw.rounded_rectangle((36, target[1] - 72, 210, target[1] - 28), radius=16, fill=(123, 47, 255, 210))
draw.text((52, target[1] - 62), "VIDEO", fill=(233, 225, 222, 255))

im.save(out, quality=88)
print("wrote", out, os.path.getsize(out))