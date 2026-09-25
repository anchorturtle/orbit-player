# Write 48x48 round HUD icon cursors. Hotspots noted in each file.
from pathlib import Path

OUT = Path(r"C:\Users\james\orbit-player\assets\holo-cursors")

HEAD = '''<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
'''
TAIL = "</svg>\n"

def dual_path(d, fill="none"):
    fill_attr = f' fill="{fill}"' if fill != "none" else ' fill="none"'
    return (
        f'  <path{fill_attr} stroke="#050508" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" d="{d}"/>\n'
        f'  <path{fill_attr} stroke="#1A58E8" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" d="{d}"/>\n'
    )

def dual_circle(cx, cy, r, fill="#0A0A0C"):
    return (
        f'  <circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="#050508" stroke-width="3.4"/>\n'
        f'  <circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="#1A58E8" stroke-width="2.1"/>\n'
    )

def dual_rect(x, y, w, h, rx, fill="#0A0A0C"):
    return (
        f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="#050508" stroke-width="3.2"/>\n'
        f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="#1A58E8" stroke-width="2"/>\n'
    )

files = {}

# default — round-tip teardrop. hotspot 10 8
files["default.svg"] = HEAD + "  <!-- hotspot 10 8 — round tip -->\n" + dual_path(
    "M10 8 C12.2 5.6 16.5 7.2 18.5 13.2 C22.2 24.5 26.5 33.5 20.2 38.2 C16.4 40.4 14.2 32.2 12.2 22.4 C8.4 24.6 6.2 20.2 10 8 Z",
    fill="#0A0A0C",
) + TAIL

# pointer — rounded pointing-hand icon. hotspot 11 6
files["pointer.svg"] = HEAD + "  <!-- hotspot 11 6 — fingertip -->\n" + (
    dual_rect(8.2, 4.6, 6.2, 20.5, 3.1) +
    dual_rect(15.0, 12.2, 5.4, 13.2, 2.7) +
    dual_rect(21.0, 14.4, 5.0, 11.4, 2.5) +
    dual_rect(26.6, 16.4, 4.6, 9.8, 2.3) +
    dual_rect(3.4, 20.6, 8.2, 5.2, 2.6) +
    dual_rect(8.2, 22.4, 22.4, 18.6, 6.4)
) + TAIL

# pressed — bunched round hand. hotspot 11 8
files["pressed.svg"] = HEAD + "  <!-- hotspot 11 8 — press tip -->\n" + (
    dual_rect(8.2, 6.4, 6.2, 14.8, 3.1) +
    dual_rect(15.0, 14.2, 5.4, 10.2, 2.7) +
    dual_rect(20.8, 15.8, 5.0, 9.0, 2.5) +
    dual_rect(26.2, 17.4, 4.6, 7.8, 2.3) +
    dual_rect(3.6, 19.4, 8.0, 5.0, 2.5) +
    dual_rect(8.2, 20.8, 22.2, 18.4, 6.2)
) + TAIL

# grab — open round pads. hotspot 24 24
files["grab.svg"] = HEAD + "  <!-- hotspot 24 24 -->\n" + (
    dual_circle(24, 24, 5.2) +
    dual_circle(24, 10.5, 4.4) +
    dual_circle(24, 37.5, 4.4) +
    dual_circle(10.5, 24, 4.4) +
    dual_circle(37.5, 24, 4.4)
) + TAIL

# grabbing — closed round cluster. hotspot 24 24
files["grabbing.svg"] = HEAD + "  <!-- hotspot 24 24 -->\n" + (
    dual_circle(24, 24, 9.5) +
    dual_circle(24, 14.8, 5.0) +
    dual_circle(15.6, 26.5, 4.6) +
    dual_circle(32.4, 26.5, 4.6)
) + TAIL

# text — rounded I-beam. hotspot 24 24
files["text.svg"] = HEAD + "  <!-- hotspot 24 24 -->\n" + (
    dual_rect(14, 7, 20, 5.2, 2.6) +
    dual_rect(21.4, 9, 5.2, 30, 2.6) +
    dual_rect(14, 35.8, 20, 5.2, 2.6)
) + TAIL

# ns — round-headed vertical. hotspot 24 24
files["ns.svg"] = HEAD + "  <!-- hotspot 24 24 -->\n" + (
    dual_rect(21.4, 10, 5.2, 28, 2.6) +
    dual_circle(24, 8.5, 5.0) +
    dual_circle(24, 39.5, 5.0)
) + TAIL

# ew — round-headed horizontal. hotspot 24 24
files["ew.svg"] = HEAD + "  <!-- hotspot 24 24 -->\n" + (
    dual_rect(10, 21.4, 28, 5.2, 2.6) +
    dual_circle(8.5, 24, 5.0) +
    dual_circle(39.5, 24, 5.0)
) + TAIL

# nesw — diagonal round heads. hotspot 24 24
files["nesw.svg"] = HEAD + "  <!-- hotspot 24 24 -->\n" + dual_path(
    "M12 36 L36 12"
) + dual_circle(36, 12, 5.0) + dual_circle(12, 36, 5.0) + TAIL

# nwse
files["nwse.svg"] = HEAD + "  <!-- hotspot 24 24 -->\n" + dual_path(
    "M12 12 L36 36"
) + dual_circle(12, 12, 5.0) + dual_circle(36, 36, 5.0) + TAIL

# not-allowed — circle + round slash
files["not-allowed.svg"] = HEAD + "  <!-- hotspot 24 24 -->\n" + dual_circle(
    24, 24, 14.5, fill="#0A0A0C"
) + dual_path("M14.2 14.2 L33.8 33.8") + TAIL

# wait — round clock
files["wait.svg"] = HEAD + "  <!-- hotspot 24 24 -->\n" + dual_circle(
    24, 24, 14.5, fill="#0A0A0C"
) + dual_path("M24 14.5 V24 L31.5 28.2") + TAIL

# help — teardrop + round badge
files["help.svg"] = HEAD + "  <!-- hotspot 10 8 -->\n" + dual_path(
    "M10 8 C12.2 5.6 16.5 7.2 18.5 13.2 C22.2 24.5 26.5 33.5 20.2 38.2 C16.4 40.4 14.2 32.2 12.2 22.4 C8.4 24.6 6.2 20.2 10 8 Z",
    fill="#0A0A0C",
) + dual_circle(35, 35, 8.2) + dual_path(
    "M32.4 33.2 C32.4 31.4 33.8 30.2 35.2 30.2 C36.6 30.2 38 31.4 38 33 C38 34.8 35.2 35.4 35.2 37.2"
) + dual_circle(35.2, 40.2, 1.35, fill="#1A58E8") + TAIL

for name, body in files.items():
    (OUT / name).write_text(body, encoding="utf-8")
    print("wrote", name, "bytes", len(body))
print("ok", len(files))
