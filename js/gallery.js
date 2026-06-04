/* ============================================
   ORBIT PLAYER — gallery.js
   Gallery data, rendering, image viewer (lightbox / enlarged viewer) + navigation
   ============================================ */

const GALLERY = [
  {src: 'images/19800879_207324159793930_1257706135595812184_o.jpg'},
  {src: 'images/1facethefear.png'},
  {src: 'images/2fullmandala.png'},
  {src: 'images/3mandala.jpg'},
  {src: 'images/4jestr-untitled.png'},
  {src: 'images/5JESTR-SQUARE.jpg'},
  {src: 'images/6jestr_earth_banner.png'},
  {src: 'images/7color2.jpg'},
  {src: 'images/8stimulus.gif'},
  {src: 'images/9brain.gif'},
  {src: 'images/alldogsdreams.png'},
  {src: 'images/boyvector.png'},
  {src: 'images/camo.png'},
  {src: 'images/CCITW2.png'},
  {src: 'images/collectivity-future3.png'},
  {src: 'images/Coolest-charity-logo.png'},
  {src: 'images/disinform.png'},
  {src: 'images/doomed-color.PNG'},
  {src: 'images/dream1hd.png'},
  {src: 'images/dream2hd.png'},
  {src: 'images/dsnatbb_calt.png'},
  {src: 'images/eyemonster.jpg'},
  {src: 'images/File_000.png'},
  {src: 'images/FRB-logo-black-outline-orange-with-river.png'},
  {src: 'images/goatfacepng.png'},
  {src: 'images/hippie-jesus-b-&-w.png'},
  {src: 'images/Jesterdaze.png'},
  {src: 'images/jestr dollar.jpg'},
  {src: 'images/JeStR.PNG'},
  {src: 'images/jestr-square.png'},
  {src: 'images/joker-bang.png'},
  {src: 'images/jstar.png'},
  {src: 'images/jstr.jpg'},
  {src: 'images/lightning-2020square.png'},
  {src: 'images/Majesticpng.png'},
  {src: 'images/murica.png'},
  {src: 'images/p4K.jpg'},
  {src: 'images/scratchyjstr.jpg'},
  {src: 'images/TL1turn-on-to-it.png'},
  {src: 'images/TL2tune-in-to-it.png'},
  {src: 'images/TL3drop-out.png'},
  {src: 'images/uninc_revision.png'},
  {src: 'images/uninc_revision3.png'},
  {src: 'images/uninc_revision8.png'},
  {src: 'images/zbanana2.jpg'},
  {src: 'images/zbuild_blocks_album.jpg'},
  {src: 'images/zbuildingblocks.jpg'},
];

/* FIX: removed the early-exit guard so gallery always re-renders when opened.
   This ensures it fills correctly after being hidden/shown on mobile. */
function renderGallery() {
  const grid = document.getElementById('gw-grid');
  if (!grid) return;
  grid.innerHTML = GALLERY.map((g, i) =>
    `<div class="gallery-item" data-gi="${i}"><img src="${g.src}" alt="" loading="lazy"/><button class="gallery-view-btn" title="Open in Viewer"><span class="material-symbols-outlined">zoom_in</span></button></div>`
  ).join('');

  grid.querySelectorAll('.gallery-item').forEach(el => {
    const idx = +el.dataset.gi;

    /* FIX: TAP_MIN_MS reduced to 30ms — registers a quick intentional tap
       without being so fast it fires accidentally when starting a scroll.
       MOVE_TOL stays at 12px to cancel if the finger drifts while browsing. */
    const TAP_MIN_MS = 30;
    const TAP_MAX_MS = 700;
    const MOVE_TOL = 12;
    let ts = 0, sx = 0, sy = 0, moved = false;

    el.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') {
        ts = performance.now(); sx = e.clientX; sy = e.clientY; moved = false;
      }
    });
    el.addEventListener('pointermove', e => {
      if (!ts) return;
      if (Math.abs(e.clientX - sx) > MOVE_TOL || Math.abs(e.clientY - sy) > MOVE_TOL) { moved = true; }
    });
    el.addEventListener('pointerup', e => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') { openImageWin(idx); return; }
      if (!ts) return;
      const dt = performance.now() - ts;
      ts = 0;
      if (!moved && dt >= TAP_MIN_MS && dt <= TAP_MAX_MS) { openImageWin(idx); }
    });
    el.addEventListener('pointercancel', () => { ts = 0; });
  });
}

let _imgIdx = 0;

/* ── IMAGE VIEWER (enlarged / lightbox) ── */
function openImageWin(idx) {
  const win = document.getElementById('image-win');
  _imgIdx = idx;
  document.getElementById('image-win-img').src = GALLERY[idx].src;

  if (isMob()) {
    /* FIX: on mobile force true full-screen dimensions via inline style
       (CSS already handles it via @media but inline ensures no leftover
       desktop sizing from a previous desktop session bleeds through). */
    win.style.width = '100vw';
    win.style.height = '100dvh';
    win.style.left = '0';
    win.style.top = '0';
    win.style.bottom = '';
    win.style.right = '';
  } else if (win.dataset.userPositioned !== 'true') {
    /* Auto-center for current viewport size. This keeps the enlarged viewer
       nicely "front and center" even after browser zoom or window resize.
       Only skipped if user explicitly dragged/resized it (userPositioned flag set by drag logic). */
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = Math.min(560, vw - 80), h = Math.min(520, vh - 120);
    win.style.width = w + 'px'; win.style.height = h + 'px';
    win.style.left = ((vw - w) / 2) + 'px'; win.style.top = ((vh - h) / 2) + 'px';
    win.style.bottom = ''; win.style.right = '';
  }
  win.style.display = 'flex';
  bringToFront('image-win');

  // Always clamp (brings back on-screen if zoom/resize made previous pos invalid) and ensure front.
  // For non-user-positioned it will have just been centered; for user ones it just safety-clamps.
  if (!isMob() && typeof clampWindowToViewport === 'function') {
    requestAnimationFrame(() => clampWindowToViewport(win, 8));
  }
}

document.getElementById('close-image-win').addEventListener('click', () =>
  document.getElementById('image-win').style.display = 'none'
);

/* ── IMAGE NAV ── */
function imgNavGo(dir) {
  _imgIdx = (_imgIdx + dir + GALLERY.length) % GALLERY.length;
  document.getElementById('image-win-img').src = GALLERY[_imgIdx].src;
}

document.getElementById('img-nav-prev').addEventListener('click', () => imgNavGo(-1));
document.getElementById('img-nav-next').addEventListener('click', () => imgNavGo(1));
document.getElementById('img-nav-prev').addEventListener('touchend', e => { e.preventDefault(); imgNavGo(-1); }, { passive: false });
document.getElementById('img-nav-next').addEventListener('touchend', e => { e.preventDefault(); imgNavGo(1); }, { passive: false });

/* Edge hover navigation visibility */
(function () {
  const winEl = document.getElementById('image-win');
  const prevBtn = document.getElementById('img-nav-prev');
  const nextBtn = document.getElementById('img-nav-next');
  const EDGE = 72;
  let leaveTimer = null;

  function show(btn) { if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; } btn.classList.add('edge-visible'); }
  function hideAll() { leaveTimer = setTimeout(() => { prevBtn.classList.remove('edge-visible'); nextBtn.classList.remove('edge-visible'); }, 320); }

  winEl.addEventListener('mousemove', e => {
    const r = winEl.getBoundingClientRect(); const x = e.clientX - r.left; const w = r.width;
    if (x < EDGE) { show(prevBtn); nextBtn.classList.remove('edge-visible'); }
    else if (x > w - EDGE) { show(nextBtn); prevBtn.classList.remove('edge-visible'); }
    else { hideAll(); }
  });
  winEl.addEventListener('mouseleave', hideAll);
  [prevBtn, nextBtn].forEach(btn => {
    btn.addEventListener('mouseenter', () => { if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; } });
    btn.addEventListener('mouseleave', hideAll);
  });
})();

/* ── SWIPE NAV IN IMAGE VIEWER (MOBILE / TABLET) ── */
(function () {
  const img = document.getElementById('image-win-img');
  let startX = 0, startY = 0, startTime = 0;
  const SWIPE_DIST = 50;
  const SWIPE_TIME = 600;

  img.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY; startTime = performance.now();
  }, { passive: true });

  img.addEventListener('touchend', e => {
    if (e.changedTouches.length !== 1) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const dt = performance.now() - startTime;
    if (dt <= SWIPE_TIME && Math.abs(dx) >= SWIPE_DIST && Math.abs(dy) < 40) {
      if (dx < 0) imgNavGo(1); else imgNavGo(-1);
    }
  }, { passive: true });
})();

/* ── KEYBOARD GALLERY ── */
document.addEventListener('keydown', e => {
  const win = document.getElementById('image-win');
  if (win.style.display !== 'flex') return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); imgNavGo(-1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); imgNavGo(1); }
  else if (e.key === 'Escape') { win.style.display = 'none'; }
});

/* Gallery now uses the same native scroller as the tracklist (see .no-scrollbar in CSS + matching HTML structure).
   No custom DOM scrollbar or JS updates needed anymore. */