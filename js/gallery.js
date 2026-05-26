/* ============================================
   ORBIT PLAYER — gallery.js
   Gallery data, rendering, image viewer + navigation
   ============================================ */

const GALLERY = [
  {src: 'images/19800879_207324159793930_1257706135595812184_o.jpg'},
  {src: 'images/File_000.png'},
  {src: 'images/JESTR-SQUARE.jpg'},
  {src: 'images/Jesterdaze.png'},
  {src: 'images/Untitled-1.jpg'},
  {src: 'images/bitchesandfire.png'},
  {src: 'images/boyvector.png'},
  {src: 'images/brain.gif'},
  {src: 'images/build_blocks_album.jpg'},
  {src: 'images/buildingblocks.jpg'},
  {src: 'images/color2.jpg'},
  {src: 'images/dsnatbb_calt.png'},
  {src: 'images/facethefear.png'},
  {src: 'images/jestr dollar.jpg'},
  {src: 'images/jestr-square.png'},
  {src: 'images/jestr-untitled.png'},
  {src: 'images/jstar.png'},
  {src: 'images/jstr.jpg'},
  {src: 'images/lightning-2020square.png'},
  {src: 'images/mandala.jpg'},
  {src: 'images/scratchyjstr.jpg'},
];

/* FIX: removed the early-exit guard so gallery always re-renders when opened.
   This ensures it fills correctly after being hidden/shown on mobile. */
function renderGallery() {
  const grid = document.getElementById('gw-grid');
  if (!grid) return;
  grid.innerHTML = GALLERY.map((g, i) =>
    `<div class="gallery-item" data-gi="${i}"><img src="${g.src}" alt="" loading="lazy"/></div>`
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
let _imgWinPositioned = false;

/* ── IMAGE VIEWER ── */
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
  } else if (!_imgWinPositioned) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = Math.min(560, vw - 80), h = Math.min(520, vh - 120);
    win.style.width = w + 'px'; win.style.height = h + 'px';
    win.style.left = ((vw - w) / 2) + 'px'; win.style.top = ((vh - h) / 2) + 'px';
    win.style.bottom = ''; win.style.right = '';
    _imgWinPositioned = true;
  }
  win.style.display = 'flex';
  bringToFront('image-win');
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