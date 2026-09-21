from pathlib import Path
OUT = Path(r"C:\Users\james\orbit-player\assets\holo-cursors")

files = {
"default.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20">
  <!-- hotspot 1 1 — tip. Classic OS pointer, slight-right body. -->
  <path fill="#0A0A0C" stroke="#050508" stroke-width="1.7" stroke-linejoin="miter"
    d="M1 1 L2.7 15.4 L6 12.2 L8.6 18.8 L11 17.7 L8.2 11.1 L14.4 10.6 Z"/>
  <path fill="#0A0A0C" stroke="#1A58E8" stroke-width="1.15" stroke-linejoin="miter"
    d="M1 1 L2.7 15.4 L6 12.2 L8.6 18.8 L11 17.7 L8.2 11.1 L14.4 10.6 Z"/>
</svg>
''',
"pointer.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
  <!-- hotspot 6 1 — index fingertip, ready (extended). -->
  <g fill="#0A0A0C" stroke="#050508" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">
    <rect x="4.6" y="1.05" width="3.1" height="11.4" rx="1.5"/>
    <rect x="8" y="6.15" width="2.75" height="6.6" rx="1.3"/>
    <rect x="11" y="7.2" width="2.55" height="6" rx="1.2"/>
    <rect x="13.8" y="8.35" width="2.35" height="5.4" rx="1.15"/>
    <rect x="1.15" y="10.7" width="4.4" height="2.85" rx="1.4" transform="rotate(-32 3.35 12.1)"/>
    <rect x="4.6" y="11.7" width="11.4" height="10.15" rx="2.5"/>
  </g>
  <g fill="#0A0A0C" stroke="#1A58E8" stroke-width="1.15" stroke-linejoin="round" stroke-linecap="round">
    <rect x="4.6" y="1.05" width="3.1" height="11.4" rx="1.5"/>
    <rect x="8" y="6.15" width="2.75" height="6.6" rx="1.3"/>
    <rect x="11" y="7.2" width="2.55" height="6" rx="1.2"/>
    <rect x="13.8" y="8.35" width="2.35" height="5.4" rx="1.15"/>
    <rect x="1.15" y="10.7" width="4.4" height="2.85" rx="1.4" transform="rotate(-32 3.35 12.1)"/>
    <rect x="4.6" y="11.7" width="11.4" height="10.15" rx="2.5"/>
  </g>
</svg>
''',
"pressed.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
  <!-- hotspot 6 1 — same fingertip; hand bunches up (press). -->
  <g fill="#0A0A0C" stroke="#050508" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">
    <rect x="4.6" y="1.05" width="3.1" height="8.2" rx="1.5"/>
    <rect x="8" y="7.35" width="2.75" height="5.5" rx="1.3"/>
    <rect x="11" y="8.15" width="2.55" height="5.1" rx="1.2"/>
    <rect x="13.8" y="9.05" width="2.35" height="4.6" rx="1.15"/>
    <rect x="1.35" y="9.7" width="4.2" height="2.7" rx="1.35" transform="rotate(-18 3.45 11.05)"/>
    <rect x="4.6" y="9.35" width="11.4" height="11.3" rx="2.5"/>
  </g>
  <g fill="#0A0A0C" stroke="#1A58E8" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
    <rect x="4.6" y="1.05" width="3.1" height="8.2" rx="1.5"/>
    <rect x="8" y="7.35" width="2.75" height="5.5" rx="1.3"/>
    <rect x="11" y="8.15" width="2.55" height="5.1" rx="1.2"/>
    <rect x="13.8" y="9.05" width="2.35" height="4.6" rx="1.15"/>
    <rect x="1.35" y="9.7" width="4.2" height="2.7" rx="1.35" transform="rotate(-18 3.45 11.05)"/>
    <rect x="4.6" y="9.35" width="11.4" height="11.3" rx="2.5"/>
  </g>
</svg>
''',
"grab.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20">
  <!-- hotspot 10 10 -->
  <path fill="none" stroke="#050508" stroke-width="1.7" stroke-linecap="square"
    d="M5 8.2V5h3.2M15 8.2V5h-3.2M5 11.8V15h3.2M15 11.8V15h-3.2"/>
  <path fill="none" stroke="#1A58E8" stroke-width="1.15" stroke-linecap="square"
    d="M5 8.2V5h3.2M15 8.2V5h-3.2M5 11.8V15h3.2M15 11.8V15h-3.2"/>
  <rect x="9" y="9" width="2" height="2" fill="#0A0A0C" stroke="#1A58E8" stroke-width="1.1"/>
</svg>
''',
"grabbing.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20">
  <!-- hotspot 10 10 -->
  <path fill="none" stroke="#050508" stroke-width="1.7" stroke-linecap="square"
    d="M6.2 8.2V6.2h2M13.8 8.2V6.2h-2M6.2 11.8V13.8h2M13.8 11.8V13.8h-2"/>
  <path fill="none" stroke="#1A58E8" stroke-width="1.15" stroke-linecap="square"
    d="M6.2 8.2V6.2h2M13.8 8.2V6.2h-2M6.2 11.8V13.8h2M13.8 11.8V13.8h-2"/>
  <rect x="7.4" y="7.4" width="5.2" height="5.2" fill="#0A0A0C" stroke="#1A58E8" stroke-width="1.15"/>
</svg>
''',
"text.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20">
  <!-- hotspot 10 10 -->
  <path fill="none" stroke="#050508" stroke-width="1.7" stroke-linecap="square"
    d="M10 3v14M6.4 3h7.2M6.4 17h7.2"/>
  <path fill="none" stroke="#1A58E8" stroke-width="1.15" stroke-linecap="square"
    d="M10 3v14M6.4 3h7.2M6.4 17h7.2"/>
</svg>
''',
"ns.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20">
  <!-- hotspot 10 10 -->
  <path fill="none" stroke="#050508" stroke-width="1.7" stroke-linecap="square" stroke-linejoin="miter"
    d="M10 2.4v15.2M10 2.4L7.2 5.2M10 2.4l2.8 2.8M10 17.6L7.2 14.8M10 17.6l2.8-2.8"/>
  <path fill="none" stroke="#1A58E8" stroke-width="1.15" stroke-linecap="square" stroke-linejoin="miter"
    d="M10 2.4v15.2M10 2.4L7.2 5.2M10 2.4l2.8 2.8M10 17.6L7.2 14.8M10 17.6l2.8-2.8"/>
</svg>
''',
"ew.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20">
  <!-- hotspot 10 10 -->
  <path fill="none" stroke="#050508" stroke-width="1.7" stroke-linecap="square" stroke-linejoin="miter"
    d="M2.4 10h15.2M2.4 10L5.2 7.2M2.4 10L5.2 12.8M17.6 10L14.8 7.2M17.6 10L14.8 12.8"/>
  <path fill="none" stroke="#1A58E8" stroke-width="1.15" stroke-linecap="square" stroke-linejoin="miter"
    d="M2.4 10h15.2M2.4 10L5.2 7.2M2.4 10L5.2 12.8M17.6 10L14.8 7.2M17.6 10L14.8 12.8"/>
</svg>
''',
"nesw.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20">
  <!-- hotspot 10 10 -->
  <path fill="none" stroke="#050508" stroke-width="1.7" stroke-linecap="square" stroke-linejoin="miter"
    d="M4.6 15.4L15.4 4.6M15.4 4.6h-3.2M15.4 4.6v3.2M4.6 15.4h3.2M4.6 15.4v-3.2"/>
  <path fill="none" stroke="#1A58E8" stroke-width="1.15" stroke-linecap="square" stroke-linejoin="miter"
    d="M4.6 15.4L15.4 4.6M15.4 4.6h-3.2M15.4 4.6v3.2M4.6 15.4h3.2M4.6 15.4v-3.2"/>
</svg>
''',
"nwse.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20">
  <!-- hotspot 10 10 -->
  <path fill="none" stroke="#050508" stroke-width="1.7" stroke-linecap="square" stroke-linejoin="miter"
    d="M4.6 4.6l10.8 10.8M4.6 4.6h3.2M4.6 4.6v3.2M15.4 15.4h-3.2M15.4 15.4v-3.2"/>
  <path fill="none" stroke="#1A58E8" stroke-width="1.15" stroke-linecap="square" stroke-linejoin="miter"
    d="M4.6 4.6l10.8 10.8M4.6 4.6h3.2M4.6 4.6v3.2M15.4 15.4h-3.2M15.4 15.4v-3.2"/>
</svg>
''',
"not-allowed.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20">
  <!-- hotspot 10 10 -->
  <circle cx="10" cy="10" r="6.4" fill="#0A0A0C" stroke="#050508" stroke-width="1.7"/>
  <circle cx="10" cy="10" r="6.4" fill="#0A0A0C" stroke="#1A58E8" stroke-width="1.15"/>
  <path fill="none" stroke="#050508" stroke-width="1.7" stroke-linecap="square" d="M6 6l8 8"/>
  <path fill="none" stroke="#1A58E8" stroke-width="1.15" stroke-linecap="square" d="M6 6l8 8"/>
</svg>
''',
"wait.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20">
  <!-- hotspot 10 10 -->
  <circle cx="10" cy="10" r="6.4" fill="#0A0A0C" stroke="#050508" stroke-width="1.7"/>
  <circle cx="10" cy="10" r="6.4" fill="#0A0A0C" stroke="#1A58E8" stroke-width="1.15"/>
  <path fill="none" stroke="#050508" stroke-width="1.7" stroke-linecap="square" d="M10 6.4v3.6l2.5 1.5"/>
  <path fill="none" stroke="#1A58E8" stroke-width="1.15" stroke-linecap="square" d="M10 6.4v3.6l2.5 1.5"/>
</svg>
''',
"help.svg": '''<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20">
  <!-- hotspot 1 1 -->
  <path fill="#0A0A0C" stroke="#1A58E8" stroke-width="1.15" stroke-linejoin="miter"
    d="M1 1 L2.4 12.2 L5 10 L7.2 15.2 L9.2 14.3 L6.8 9.1 L11.6 8.8 Z"/>
  <circle cx="14.4" cy="14.4" r="3.3" fill="#0A0A0C" stroke="#1A58E8" stroke-width="1.1"/>
  <path fill="none" stroke="#1A58E8" stroke-width="1.1" stroke-linecap="square"
    d="M13.2 13.6c0-.7.5-1.2 1.2-1.2s1.2.5 1.2 1.15c0 .65-1.2.85-1.2 1.6"/>
  <rect x="13.8" y="16.6" width="1.2" height="1.2" fill="#1A58E8"/>
</svg>
''',
}

for name, body in files.items():
    (OUT / name).write_text(body, encoding="utf-8")
print("restored", len(files))
