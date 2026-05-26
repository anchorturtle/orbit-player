/* ============================================
   ORBIT PLAYER — main.js
   Core UI: stars background, window drag/resize, toggles,
   desktop & mobile layout, initialization
   ============================================ */

/* ── STARS CANVAS ── */
(function () {
  const c = document.getElementById('stars-canvas'), ctx = c.getContext('2d');
  let W, H, stars = [];

  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }

  function mkStars() {
    stars = [];
    const n = Math.floor((W * H) / 2800);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.2 + .15,
        a: Math.random(), da: (Math.random() - .5) * .005,
        speed: Math.random() * .035 + .004
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.a += s.da; if (s.a <= 0 || s.a >= 1) s.da *= -1;
      s.y += s.speed; if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,210,255,${Math.max(0, Math.min(1, s.a))})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize(); mkStars(); draw();
  window.addEventListener('resize', () => { resize(); mkStars(); });
})();

/* ── DESKTOP LAYOUT (auto-position windows) — tuned for good visual alignment around the central planet */
function applyDesktopLayout() {
  if (isMob()) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const dock = document.getElementById('dock-win');
  const dockH = dock ? dock.offsetHeight : 70;
  const usableH = vh - dockH - 20;
  const cx = vw / 2, cy = usableH / 2;
  // Match the visual planet size in index.html (~320-340px diameter area)
  const PLANET_R = 220, PAD = 18;

  const tl = document.getElementById('tracklist-win');
  const g = document.getElementById('gallery-win');
  const pl = document.getElementById('player-win');

  // Balanced sizes — player more prominent (respects the 420px CSS min-width)
  const tlW = Math.min(260, Math.max(230, (cx - PLANET_R - PAD) * 0.95));
  const tlH = Math.min(540, usableH - 2 * PAD);
  const gW = Math.min(280, Math.max(230, (vw - cx - PLANET_R - PAD) * 0.95));
  const gH = Math.min(480, usableH - 2 * PAD);
  const plW = Math.min(460, Math.max(420, vw * 0.32));
  const plH = Math.max(300, Math.min(360, usableH * 0.42));

  tl.style.width = tlW + 'px'; tl.style.height = tlH + 'px';
  g.style.width = gW + 'px'; g.style.height = gH + 'px';
  pl.style.width = plW + 'px'; pl.style.height = plH + 'px';

  // Nicely balanced around the planet focal point with consistent breathing room
  tl.style.left = Math.max(PAD, cx - PLANET_R - tlW - 14) + 'px';
  tl.style.top = Math.max(PAD, cy - tlH / 2 - 10) + 'px';
  g.style.left = Math.min(vw - gW - PAD, cx + PLANET_R + 14) + 'px';
  g.style.top = Math.max(PAD, cy - gH / 2 - 10) + 'px';
  pl.style.left = Math.max(PAD, cx - plW / 2) + 'px';
  pl.style.top = Math.max(PAD, Math.min(usableH - plH - PAD - 8, cy + PLANET_R - 10)) + 'px';

  tl.style.bottom = g.style.bottom = pl.style.bottom = '';
  tl.style.right = g.style.right = pl.style.right = '';

  renderGallery();

  // Initial z-order so everything feels aligned and player (main UI) is prominent
  // (user clicks will still bring any window to front via the existing handlers)
  requestAnimationFrame(() => {
    bringToFront('player-win');
    bringToFront('gallery-win');
    bringToFront('tracklist-win');
  });
}

/* ── WINDOW DRAG + RESIZE ── */
function makeWindowDraggable(winId, barId) {
  const win = document.getElementById(winId), bar = document.getElementById(barId);
  let mode = null, sx, sy, sl, st, sw, sh;

  function pin() {
    if (isMob()) return;
    const r = win.getBoundingClientRect();
    win.style.left = r.left + 'px'; win.style.top = r.top + 'px';
    win.style.width = r.width + 'px'; win.style.height = (r.height || win.offsetHeight) + 'px';
    win.style.bottom = ''; win.style.right = '';
  }

  function startOp(e, m) {
    if (isMob()) return;
    pin();
    const r = win.getBoundingClientRect();
    mode = m; sx = e.clientX; sy = e.clientY; sl = r.left; st = r.top; sw = r.width; sh = r.height;
    e.preventDefault(); if (e.stopPropagation) e.stopPropagation();
    bringToFront(winId);
  }

  function onMove(e) {
    if (!mode) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    const mw = (winId === 'player-win' ? 420 : 240), mh = (winId === 'player-win' ? 270 : 200);
    const vw = window.innerWidth, vh = window.innerHeight;

    if (mode === 'drag') {
      win.style.left = clamp(sl + dx, 0, vw - sw) + 'px';
      win.style.top = clamp(st + dy, 0, vh - sh) + 'px';
    } else {
      let l = sl, t = st, w = sw, h = sh;
      if (mode === 'se') { w = clamp(sw + dx, mw, 1200); h = clamp(sh + dy, mh, 900); }
      else if (mode === 'sw') { const nw = clamp(sw - dx, mw, 1200); l = sl + sw - nw; w = nw; h = clamp(sh + dy, mh, 900); }
      else if (mode === 'ne') { w = clamp(sw + dx, mw, 1200); const nh = clamp(sh - dy, mh, 900); t = st + sh - nh; h = nh; }
      else if (mode === 'nw') { const nw = clamp(sw - dx, mw, 1200); l = sl + sw - nw; w = nw; const nh = clamp(sh - dy, mh, 900); t = st + sh - nh; h = nh; }
      else if (mode === 'n') { const nh = clamp(sh - dy, mh, 900); t = st + sh - nh; h = nh; }
      else if (mode === 's') { h = clamp(sh + dy, mh, 900); }
      else if (mode === 'e') { w = clamp(sw + dx, mw, 1200); }
      else if (mode === 'w') { const nw = clamp(sw - dx, mw, 1200); l = sl + sw - nw; w = nw; }
      win.style.left = l + 'px'; win.style.top = t + 'px'; win.style.width = w + 'px'; win.style.height = h + 'px';
    }
  }

  function onUp() {
    mode = null;
    // Ensure scrollbars recalculate properly after the window has been resized
    const scrollers = win.querySelectorAll('.win-body, #sidebar-tracklist');
    scrollers.forEach(el => {
      const prev = el.style.overflowY;
      el.style.overflowY = 'hidden';
      // force reflow
      void el.offsetHeight;
      el.style.overflowY = prev || 'auto';
    });
  }

  bar.addEventListener('mousedown', e => startOp(e, 'drag'));
  bar.addEventListener('touchstart', e => {
    if (isMob()) return;
    const t = e.touches[0];
    startOp({ clientX: t.clientX, clientY: t.clientY, preventDefault: () => e.preventDefault(), stopPropagation: () => {} }, 'drag');
  }, { passive: false });

  win.querySelectorAll('.win-resize').forEach(el => {
    el.addEventListener('mousedown', e => startOp(e, el.dataset.dir));
    el.addEventListener('touchstart', e => {
      const t = e.touches[0];
      startOp({ clientX: t.clientX, clientY: t.clientY, preventDefault: () => e.preventDefault(), stopPropagation: () => e.stopPropagation() }, el.dataset.dir);
    }, { passive: false });
  });

  win.addEventListener('mousedown', () => bringToFront(winId), { capture: true });
  win.addEventListener('touchstart', () => bringToFront(winId), { capture: true, passive: true });

  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', e => {
    if (mode) { e.preventDefault(); const t = e.touches[0]; onMove({ clientX: t.clientX, clientY: t.clientY }); }
  }, { passive: false });
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);
}

/* ── TOGGLE / CLOSE (Desktop + Mobile) ── */
function toggleWin(winId, btnId) {
  const win = document.getElementById(winId), btn = document.getElementById(btnId);
  if (!win || !btn) return;
  if (win.style.display === 'flex') {
    win.style.display = 'none'; btn.classList.remove('win-open');
  } else {
    win.style.display = 'flex'; btn.classList.add('win-open');
    bringToFront(winId);
    if (winId === 'gallery-win') {
      renderGallery();
      if (window.updateGalleryScrollbar) window.updateGalleryScrollbar();
    }

    // Same aggressive bring-to-front retries for reliability (desktop dock clicks)
    const doBring = () => bringToFront(winId);
    requestAnimationFrame(doBring);
    setTimeout(doBring, 80);
    setTimeout(doBring, 200);
  }
}

function closeWin(winId, dockId, mobId) {
  const w = document.getElementById(winId); if (w) w.style.display = 'none';
  if (dockId) { const b = document.getElementById(dockId); if (b) b.classList.remove('win-open'); }
  if (mobId) setMobActive(mobId, false);
  if (isMob()) updateMobPlayerHeight();
}

/* Mobile toggle with smart "always bring to front + second tap to dismiss" behavior */
function mobToggle(winId, btnId) {
  const win = document.getElementById(winId);
  const vis = win.style.display === 'flex';

  const currentZ = parseInt(win.style.zIndex) || 0;
  const isOnTop = currentZ >= _zBase + 10;

  if (vis && isOnTop) {
    /* second tap on the front window → hide */
    win.style.display = 'none';
    setMobActive(btnId, false);
  } else {
    /* first tap, or window was behind others → always show + front */
    win.style.display = 'flex';
    setMobActive(btnId, true);
    bringToFront(winId);

    if (winId === 'gallery-win') {
      renderGallery();
      if (window.updateGalleryScrollbar) window.updateGalleryScrollbar();
    }

    // Aggressive retries for gallery (and any window) on mobile — layout + custom scrollbar + player height
    // can cause the first bringToFront z-index to not take effect immediately.
    const doBring = () => bringToFront(winId);
    requestAnimationFrame(doBring);
    requestAnimationFrame(() => requestAnimationFrame(doBring));
    setTimeout(doBring, 80);
    setTimeout(doBring, 220);
  }
  updateMobPlayerHeight();
}

/* Wire up close buttons */
document.getElementById('close-tracklist').addEventListener('click', () => closeWin('tracklist-win', 'btn-tracklist', 'btn-mob-tracks'));
document.getElementById('close-gallery').addEventListener('click', () => closeWin('gallery-win', 'btn-gallery', 'btn-mob-gallery'));
document.getElementById('close-player').addEventListener('click', () => closeWin('player-win', 'btn-player', 'btn-mob-player'));
document.getElementById('close-song-detail').addEventListener('click', () => {
  const w = document.getElementById('song-detail-win');
  if (w) w.style.display = 'none';
  document.title = 'AnchorTurtle'; // Reset title when closing song detail
});

/* Make all windows draggable/resizable */
makeWindowDraggable('tracklist-win', 'tracklist-bar');
makeWindowDraggable('gallery-win', 'gallery-bar');
makeWindowDraggable('player-win', 'player-bar');
makeWindowDraggable('image-win', 'image-win-bar');
makeWindowDraggable('song-detail-win', 'song-detail-bar');

/* ── INIT ── */
(function init() {
  // Player module must be loaded first so TRACKS + renderTracklist exist
  renderTracklist();

  if (!isMob()) {
    ['tracklist-win', 'gallery-win', 'player-win'].forEach(id => {
      const w = document.getElementById(id);
      if (w) w.style.display = 'flex';
      const btn = id === 'tracklist-win' ? 'btn-tracklist' : id === 'gallery-win' ? 'btn-gallery' : 'btn-player';
      const b = document.getElementById(btn); if (b) b.classList.add('win-open');
    });
    /* layout then gallery in one shot */
    requestAnimationFrame(() => requestAnimationFrame(applyDesktopLayout));
  } else {
    ['tracklist-win', 'player-win'].forEach(id => {
      const w = document.getElementById(id); if (w) w.style.display = 'flex';
    });
    setMobActive('btn-mob-tracks', true);
    setMobActive('btn-mob-player', true);
    updateMobPlayerHeight();
  }

  window.addEventListener('resize', () => { if (!isMob()) applyDesktopLayout(); });
})();