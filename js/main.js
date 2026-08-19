/* ============================================
   ORBIT PLAYER — main.js
   Core UI: stars background, window drag/resize, toggles,
   desktop & mobile layout, initialization
   ============================================ */

/* ── STARS CANVAS ── */
(function () {
  // On the clay site we use Three.js blobs instead
  if (window.__CLAY_MODE) return;
  // The 3D WebGL background (space3d.js) owns the sky when available;
  // this 2D canvas is only the offline / no-WebGL fallback.
  if (window.__SPACE3D_ACTIVE) return;

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

/* ── PLAYER: never scroll — window height always matches chrome ── */
function fitPlayerWindow() {
  const pl = document.getElementById('player-win');
  if (!pl || pl.style.display === 'none') return;
  const body = pl.querySelector('.win-body');
  if (body) {
    body.style.overflow = 'hidden';
    body.style.overflowY = 'hidden';
    body.scrollTop = 0;
  }
  pl.scrollTop = 0;
  if (typeof isMob === 'function' && isMob()) {
    pl.style.height = 'auto';
    if (typeof updateMobPlayerHeight === 'function') updateMobPlayerHeight();
    return;
  }
  const keepTop = pl.style.top;
  const keepLeft = pl.style.left;
  const keepW = pl.style.width;
  pl.style.height = 'auto';
  const bar = document.getElementById('player-bar');
  const needed = Math.ceil(
    (bar ? bar.getBoundingClientRect().height : 36) +
    (body ? Math.max(body.scrollHeight, body.offsetHeight) : 220)
  );
  pl.style.height = needed + 'px';
  if (keepW) pl.style.width = keepW;
  if (keepLeft) pl.style.left = keepLeft;
  if (keepTop) pl.style.top = keepTop;
}
window.fitPlayerWindow = fitPlayerWindow;

/* ── DESKTOP LAYOUT (auto-position windows) — tuned for good visual alignment around the central planet.
   Player is intentionally compact + low so the big glowing planet + overlaid "NOW PLAYING" focal
   title/artist remain the hero visual and are not covered by the media player. */
function applyDesktopLayout() {
  if (isMob()) return;

  const vw = window.innerWidth, vh = window.innerHeight;
  const dock = document.getElementById('dock-win');
  const dockH = dock ? dock.offsetHeight : 70;
  const usableH = vh - dockH - 20;
  const cx = vw / 2, cy = usableH / 2;
  // Larger clearance to ensure windows (tracklist, gallery, player) do not overlap the central planet glow or focal "NOW PLAYING" text by default.
  // Previous values were too tight, causing visual overlap in the screenshot.
  const PLANET_CLEARANCE = 205, PAD = 20;

  const tl = document.getElementById('tracklist-win');
  const g = document.getElementById('gallery-win');
  const pl = document.getElementById('player-win');

  // More generous side panels on wide screens, player much more compact by default
  // so it doesn't dominate or cover the central planet + "NOW PLAYING" focal title.
  const tlW = Math.min(280, Math.max(220, (cx - PLANET_CLEARANCE - PAD) * 0.92));
  const tlH = Math.min(560, usableH - 2 * PAD);
  const gW = Math.min(300, Math.max(220, (vw - cx - PLANET_CLEARANCE - PAD) * 0.92));
  const gH = Math.min(620, usableH - 2 * PAD);
  const plW = Math.min(420, Math.max(380, Math.floor(vw * 0.30)));

  // Only force sizes/positions for windows the user hasn't manually dragged or resized
  if (tl.dataset.userPositioned !== 'true') {
    tl.style.width = tlW + 'px'; tl.style.height = tlH + 'px';
    tl.style.left = Math.max(PAD, cx - PLANET_CLEARANCE - tlW - 20) + 'px';
    tl.style.top = Math.max(PAD, cy - tlH / 2 - 20) + 'px';
    tl.style.bottom = ''; tl.style.right = '';
  }

  if (g.dataset.userPositioned !== 'true') {
    g.style.width = gW + 'px'; g.style.height = gH + 'px';
    g.style.left = Math.min(vw - gW - PAD, cx + PLANET_CLEARANCE + 20) + 'px';
    g.style.top = Math.max(PAD, cy - gH / 2 - 20) + 'px';
    g.style.bottom = ''; g.style.right = '';
  }

  if (pl.dataset.userPositioned !== 'true') {
    pl.style.width = plW + 'px';
    pl.style.height = 'auto';
    pl.style.left = Math.max(PAD, cx - plW / 2) + 'px';
    pl.style.bottom = ''; pl.style.right = '';
    if (typeof fitPlayerWindow === 'function') fitPlayerWindow();
    const plH = pl.offsetHeight || 260;
    pl.style.top = Math.max(PAD + 20, Math.min(usableH - plH - PAD - 10, cy + 300)) + 'px';
  }

  // Lyrics viewer: center top middle. Default 15% narrower. Leaves room at bottom for media player.
  const ly = document.getElementById('lyrics-win');
  if (ly && ly.dataset.userPositioned !== 'true') {
    const lyW = Math.min(410, Math.max(300, vw * 0.345)); // 15% narrower default
    const lyH = Math.min(520, usableH * 0.62);
    ly.style.width = lyW + 'px';
    ly.style.height = lyH + 'px';
    ly.style.left = Math.max(PAD, (vw - lyW) / 2) + 'px';
    ly.style.top = Math.max(24, Math.floor(vh * 0.04)) + 'px';
    ly.style.bottom = '';
    ly.style.right = '';
  }
}

/* ── WINDOW DRAG + RESIZE ── */
function makeWindowDraggable(winId, barId) {
  const win = document.getElementById(winId), bar = document.getElementById(barId);
  let mode = null, sx, sy, sl, st, sw, sh;
  let moveRaf = 0;
  let lastMoveE = null;

  function pin() {
    if (isMob()) return;
    const r = win.getBoundingClientRect();
    win.style.left = r.left + 'px'; win.style.top = r.top + 'px';
    win.style.width = r.width + 'px'; win.style.height = (r.height || win.offsetHeight) + 'px';
    win.style.bottom = ''; win.style.right = '';
    win.dataset.userPositioned = 'true';  // prevent applyDesktopLayout from overriding user positions on zoom/resize
    if (typeof saveWindowPosition === 'function') {
      saveWindowPosition(winId);
    }
  }

  function startOp(e, m) {
    if (isMob()) return;
    pin();
    const r = win.getBoundingClientRect();
    mode = m; sx = e.clientX; sy = e.clientY; sl = r.left; st = r.top; sw = r.width; sh = r.height;
    e.preventDefault(); if (e.stopPropagation) e.stopPropagation();
    document.documentElement.classList.add('orbit-resizing');
    bringToFront(winId);
  }

  function applyMove(e) {
    if (!mode) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    const mw = (winId === 'player-win' ? 380 : winId === 'video-win' ? 300 : 240),
      mh = (winId === 'player-win' ? 270 : winId === 'video-win' ? 260 : 200);
    const vw = window.innerWidth, vh = window.innerHeight;
    const margin = 8;

    if (mode === 'drag') {
      win.style.left = clamp(sl + dx, margin, vw - sw - margin) + 'px';
      win.style.top = clamp(st + dy, margin, vh - sh - margin) + 'px';
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

      // Prevent the window from going off-screen or causing cut-off during live resize.
      // Shrink size on the far edges rather than shifting the opposite edge unexpectedly.
      l = Math.max(margin, l);
      t = Math.max(margin, t);
      if (l + w > vw - margin) w = vw - margin - l;
      if (t + h > vh - margin) h = vh - margin - t;
      w = Math.max(mw, Math.min(w, vw - 2 * margin));
      h = Math.max(mh, Math.min(h, vh - 2 * margin));
      win.style.left = l + 'px'; win.style.top = t + 'px'; win.style.width = w + 'px'; win.style.height = h + 'px';
    }
  }

  // Coalesce mousemove layout writes to one rAF — N windows × raw mousemove was a jank source.
  function onMove(e) {
    if (!mode) return;
    lastMoveE = e;
    if (moveRaf) return;
    moveRaf = requestAnimationFrame(() => {
      moveRaf = 0;
      if (lastMoveE) applyMove(lastMoveE);
    });
  }

  function onUp() {
    if (moveRaf) {
      cancelAnimationFrame(moveRaf);
      moveRaf = 0;
    }
    if (lastMoveE && mode) applyMove(lastMoveE);
    lastMoveE = null;
    mode = null;
    document.documentElement.classList.remove('orbit-resizing');
    if (typeof syncWindowGlassTiers === 'function') syncWindowGlassTiers();
    // Ensure scrollbars recalculate properly after the window has been resized
    const scrollers = win.querySelectorAll('.win-body, #sidebar-tracklist');
    scrollers.forEach(el => {
      if (winId === 'player-win' || el.closest('#player-win')) {
        el.style.overflow = 'hidden';
        el.style.overflowY = 'hidden';
        return;
      }
      const prev = el.style.overflowY;
      el.style.overflowY = 'hidden';
      void el.offsetHeight;
      el.style.overflowY = prev || 'auto';
    });
    if (winId === 'player-win' && typeof fitPlayerWindow === 'function') fitPlayerWindow();

    // Clamp after manual resize/drag so the window can't end up partially off-screen or cut off.
    if (typeof clampWindowToViewport === 'function') {
      clampWindowToViewport(win, 4);
    }

    // Persist the final user position so close/reopen (and page reloads) restore it
    // instead of defaulting to the left-corner auto layout.
    if (typeof saveWindowPosition === 'function') {
      saveWindowPosition(winId);
    }

    // For the player, force a waveform + progress refresh immediately after resize so the
    // canvas and bars match the new width right away (otherwise looks stretched/cut off
    // until the next audio timeupdate).
    if (winId === 'player-win') {
      const prog = document.getElementById('progress');
      if (prog && typeof setProgress === 'function') {
        const val = parseFloat(prog.value) || 0;
        setProgress(val);
      }
    }
    if (winId === 'video-win' && typeof nudgeVideoPaint === 'function') {
      nudgeVideoPaint(document.getElementById('video-win-player'));
    }
    if (winId === 'video-win' && typeof captureVideoWinGeometry === 'function') {
      captureVideoWinGeometry(win);
    }
  }

  bar.addEventListener('mousedown', e => {
    if (e.target.closest('.win-close, button')) return;
    startOp(e, 'drag');
  });
  bar.addEventListener('touchstart', e => {
    if (isMob()) return;
    if (e.target.closest('.win-close, button')) return;
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
    if (!isMob() && typeof saveSessionWindowPosition === 'function') {
      saveSessionWindowPosition(winId);
    }
    win.style.display = 'none'; btn.classList.remove('win-open');
  } else {
    win.style.display = 'flex'; btn.classList.add('win-open');
    if (!isMob() && typeof restoreSessionWindowPosition === 'function') {
      // Restore the position from when this window was last closed in this session.
      // This makes nav-bar close/reopen remember the exact location.
      // On full page refresh we do NOT restore (standard layout is applied in init).
      restoreSessionWindowPosition(winId);
    }
    bringToFront(winId);
    if (winId === 'gallery-win') {
      renderGallery();
      // Gallery now uses the same native scroller as tracklist — no custom update needed
    }

    // Same aggressive bring-to-front retries for reliability (desktop dock clicks)
    const doBring = () => bringToFront(winId);
    requestAnimationFrame(doBring);
    setTimeout(doBring, 80);
    setTimeout(doBring, 200);
  }
}

function closeWin(winId, dockId, mobId) {
  const w = document.getElementById(winId);
  if (w) {
    if (!isMob() && typeof saveSessionWindowPosition === 'function') {
      saveSessionWindowPosition(winId);
    }
    w.style.display = 'none';
  }
  if (dockId) { const b = document.getElementById(dockId); if (b) b.classList.remove('win-open'); }
  if (mobId) setMobActive(mobId, false);
  if (isMob()) updateMobPlayerHeight();
  if (typeof syncWindowGlassTiers === 'function') syncWindowGlassTiers();
  if (window.orbitDock) orbitDock.sync(winId);
}

const DOCK_META = {
  'lyrics-win': { label: 'Lyrics', icon: 'lyrics' },
  'song-detail-win': { label: 'Info', icon: 'info' },
  'image-win': { label: 'Image', icon: 'image' },
  'video-win': { label: 'Video', icon: 'movie' },
  'album-win': { label: 'Album', icon: 'album' },
};

window.orbitDock = {
  show(winId, meta) {
    const rail = document.getElementById('dock-overflow');
    const split = document.querySelector('.dock-overflow-split');
    const mob = document.getElementById('mob-overflow');
    if (!rail) return;
    meta = Object.assign({}, DOCK_META[winId] || { label: 'Window', icon: 'web_asset' }, meta || {});
    let btn = rail.querySelector(`[data-dock-win="${winId}"]`);
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'taskbar-btn';
      btn.dataset.dockWin = winId;
      btn.innerHTML = `<span class="material-symbols-outlined">${meta.icon}</span><span></span><div class="taskbar-dot"></div>`;
      btn.addEventListener('click', () => {
        const w = document.getElementById(winId);
        if (!w) return;
        if (w.style.display === 'flex') {
          if (winId === 'album-win' && typeof closeAlbumWindow === 'function') closeAlbumWindow();
          else if (winId === 'lyrics-win' && typeof closeLyricsViewer === 'function') closeLyricsViewer();
          else if (winId === 'video-win' && typeof closeVideoWin === 'function') closeVideoWin();
          else if (winId === 'image-win' && typeof closeImageWin === 'function') closeImageWin();
          else { w.style.display = 'none'; orbitDock.hide(winId); }
        } else {
          w.style.display = 'flex';
          if (typeof bringToFront === 'function') bringToFront(winId);
          btn.classList.add('win-open');
        }
      });
      rail.appendChild(btn);
    }
    btn.querySelector('span:not(.material-symbols-outlined)').textContent = meta.label;
    btn.classList.add('win-open');
    rail.hidden = false;
    if (split) split.hidden = false;
    document.getElementById('dock-win')?.classList.add('has-temp-tabs');
    if (mob) {
      let mbtn = mob.querySelector(`[data-dock-win="${winId}"]`);
      if (!mbtn) {
        mbtn = document.createElement('button');
        mbtn.className = 'mob-btn active';
        mbtn.dataset.dockWin = winId;
        mbtn.innerHTML = `<span class="material-symbols-outlined">${meta.icon}</span><span></span><div class="mob-dot"></div>`;
        mbtn.addEventListener('click', () => btn.click());
        mob.appendChild(mbtn);
      }
      mbtn.querySelector('span:not(.material-symbols-outlined)').textContent = meta.label;
      mbtn.classList.add('active');
      mob.hidden = false;
    }
  },
  hide(winId) {
    const rail = document.getElementById('dock-overflow');
    const split = document.querySelector('.dock-overflow-split');
    const mob = document.getElementById('mob-overflow');
    rail?.querySelector(`[data-dock-win="${winId}"]`)?.remove();
    mob?.querySelector(`[data-dock-win="${winId}"]`)?.remove();
    if (rail && !rail.children.length) {
      rail.hidden = true;
      if (split) split.hidden = true;
      document.getElementById('dock-win')?.classList.remove('has-temp-tabs');
    }
    if (mob && !mob.children.length) mob.hidden = true;
  },
  sync(winId) {
    const w = document.getElementById(winId);
    if (!w || w.style.display !== 'flex') this.hide(winId);
    else this.show(winId);
  }
};

(function wireDockWheel() {
  const rail = document.getElementById('dock-overflow');
  if (!rail) return;
  rail.addEventListener('wheel', (e) => {
    if (!rail.children.length) return;
    rail.scrollLeft += e.deltaY + e.deltaX;
    e.preventDefault();
  }, { passive: false });
})();

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
      // Gallery now uses the same native scroller as tracklist — no custom update needed
    }

    // Aggressive retries for gallery (and any window) on mobile for bringToFront reliability.
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
document.getElementById('close-album')?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (typeof closeAlbumWindow === 'function') closeAlbumWindow();
});
document.getElementById('close-album')?.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
});
document.getElementById('close-song-detail').addEventListener('click', () => {
  const w = document.getElementById('song-detail-win');
  if (w) w.style.display = 'none';
  // Clean up mobile backdrop if present
  const bd = document.getElementById('song-detail-backdrop');
  if (bd && bd.parentNode) bd.parentNode.removeChild(bd);
  document.title = 'AnchorTurtle'; // Reset title when closing song detail
  if (window.orbitDock) orbitDock.hide('song-detail-win');
});

/* Make all windows draggable/resizable */
makeWindowDraggable('tracklist-win', 'tracklist-bar');
makeWindowDraggable('gallery-win', 'gallery-bar');
makeWindowDraggable('player-win', 'player-bar');
makeWindowDraggable('album-win', 'album-bar');
makeWindowDraggable('image-win', 'image-win-bar');
makeWindowDraggable('video-win', 'video-win-bar');
makeWindowDraggable('song-detail-win', 'song-detail-bar');
makeWindowDraggable('lyrics-win', 'lyrics-bar');

/* ── INIT ── */
(function init() {
  // Player module must be loaded first so TRACKS + renderTracklist exist
  renderTracklist();

  // Make TRACKS[0] chrome-ready on normal visits (titles/focal/active row).
  // loadTrack(..., false) does not set audio.src or fetch/decode the MP3.
  // We deliberately skip this for /song/ or #song/ links so the share target loads clean (no wrong-track flash).
  const isDirectShare = window.location.pathname.startsWith('/song/') ||
                        window.location.pathname.startsWith('/video/') ||
                        (location.hash && (location.hash.startsWith('#song/') || location.hash.startsWith('#video/')));
  if (!isDirectShare && typeof loadTrack === 'function' && typeof TRACKS !== 'undefined' && TRACKS.length) {
    loadTrack(0, false);
  }

  if (!isMob()) {
    // Always apply the standard/default layout on fresh load or refresh.
    // Do NOT restore from localStorage here — user wants standard alignment after refresh.
    // (Session close/reopen via nav bar will restore the position from when it was closed.)
    applyDesktopLayout();
    ['tracklist-win', 'gallery-win', 'player-win'].forEach(id => {
      const w = document.getElementById(id);
      if (w) {
        w.style.display = 'flex';
        w.style.visibility = 'visible';
        w.style.opacity = '1';
      }
      let btnId;
      if (id === 'tracklist-win') btnId = 'btn-tracklist';
      else if (id === 'gallery-win') btnId = 'btn-gallery';
      else if (id === 'player-win') btnId = 'btn-player';
      if (btnId) {
        const b = document.getElementById(btnId);
        if (b) b.classList.add('win-open');
      }
    });
    requestAnimationFrame(() => {
      applyDesktopLayout();
      setTimeout(applyDesktopLayout, 80);
    });
    // Ensure lyrics-win starts hidden (only shown via button click, never on refresh/load)
    const lyricsW = document.getElementById('lyrics-win');
    if (lyricsW) {
      lyricsW.style.display = 'none';
      lyricsW.style.visibility = '';
      lyricsW.style.opacity = '';
    }
    const lyricsBtn = document.getElementById('btn-lyrics');
    if (lyricsBtn) lyricsBtn.classList.remove('win-open');
    renderGallery();  // populate gallery grid on initial desktop layout
    if (typeof syncWindowGlassTiers === 'function') syncWindowGlassTiers();
  } else {
    ['tracklist-win', 'player-win'].forEach(id => {
      const w = document.getElementById(id); if (w) w.style.display = 'flex';
    });
    setMobActive('btn-mob-tracks', true);
    setMobActive('btn-mob-player', true);
    updateMobPlayerHeight();
    // Ensure player sheet starts above the full-height tracklist (prevents z fighting / click-through on mobile).
    if (typeof bringToFront === 'function') bringToFront('player-win');
    if (typeof syncWindowGlassTiers === 'function') syncWindowGlassTiers();
  }

  window.addEventListener('resize', () => {
    if (!isMob()) applyDesktopLayout();

    // If we crossed from mobile to desktop (or rotated), clean up any detail backdrop
    if (!isMob()) {
      const bd = document.getElementById('song-detail-backdrop');
      if (bd && bd.parentNode) bd.parentNode.removeChild(bd);
    }

    // Keep song detail nicely placed on resizes/rotates if user hasn't manually positioned it.
    const sd = document.getElementById('song-detail-win');
    if (sd && sd.style.display === 'flex' && sd.dataset.userPositioned !== 'true') {
      if (isMob()) {
        sd.style.left = '4vw';
        sd.style.top = '5vh';
        sd.style.width = '92vw';
        sd.style.maxWidth = '460px';
        sd.style.height = 'auto';
        sd.style.maxHeight = 'min(82dvh, 620px)';
        sd.style.bottom = '';
        sd.style.right = '';
        sd.style.transform = '';
        if (typeof clampWindowToViewport === 'function') {
          requestAnimationFrame(() => clampWindowToViewport(sd, 6));
        }
      } else if (typeof positionDetailWindow === 'function') {
        positionDetailWindow(sd);
      } else if (typeof clampWindowToViewport === 'function') {
        clampWindowToViewport(sd, 10);
      }
    }

    // Image Viewer (enlarged gallery lightbox): keep front + center on zoom/resize.
    // If user never dragged it, re-center with good size. Always clamp to stay fully visible.
    // Skip while native fullscreen (geometry is owned by the FS restore path).
    const iw = document.getElementById('image-win');
    if (iw && iw.style.display === 'flex' && !isImageFullscreenActive?.()) {
      if (iw.dataset.userPositioned !== 'true') {
        const vw = window.innerWidth, vh = window.innerHeight;
        const w = Math.min(560, vw - 80), h = Math.min(520, vh - 120);
        iw.style.width = w + 'px';
        iw.style.height = h + 'px';
        iw.style.left = ((vw - w) / 2) + 'px';
        iw.style.top = ((vh - h) / 2) + 'px';
        iw.style.bottom = ''; iw.style.right = '';
      }
      if (typeof clampWindowToViewport === 'function') {
        requestAnimationFrame(() => clampWindowToViewport(iw, 8));
      }
    }

    const vwWin = document.getElementById('video-win');
    if (vwWin && vwWin.style.display === 'flex' && !isVideoFullscreenActive?.()) {
      if (vwWin.dataset.userPositioned !== 'true' && typeof layoutVideoWinDefault === 'function') {
        layoutVideoWinDefault(vwWin);
      }
      if (typeof clampWindowToViewport === 'function') {
        requestAnimationFrame(() => clampWindowToViewport(vwWin, 8));
      }
    }

    // Clamp only non-user-positioned core windows on browser/viewport resize (incl. zoom).
    // This prevents the gallery (or tracklist/player) from getting moved around when you
    // have manually positioned it (userPositioned=true). Auto-positioned ones still follow
    // the layout. User windows stay exactly where you left them (may overhang on heavy zoom-in;
    // re-drag if desired).
    ['tracklist-win', 'gallery-win', 'player-win'].forEach(id => {
      const w = document.getElementById(id);
      if (w && w.style.display === 'flex' && w.dataset.userPositioned !== 'true') {
        if (typeof clampWindowToViewport === 'function') {
          requestAnimationFrame(() => clampWindowToViewport(w, 8));
        }
      }
    });

    // For *user-positioned* windows (e.g. gallery you dragged): never change their
    // left/top on zoom/resize (so it doesn't "get moved around"). But cap size if the
    // viewport shrunk a lot, so it doesn't become bigger than the screen.
    ['tracklist-win', 'gallery-win', 'player-win'].forEach(id => {
      const w = document.getElementById(id);
      if (w && w.style.display === 'flex' && w.dataset.userPositioned === 'true') {
        const rect = w.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let newW = rect.width;
        let newH = rect.height;
        const minW = (id === 'player-win' ? 380 : 240);
        const minH = (id === 'player-win' ? (w.offsetHeight || 200) : 200);
        const maxW = Math.max(minW, vw - 16);
        const maxH = Math.max(minH, vh - 16);
        let changed = false;
        if (newW > maxW) { newW = maxW; changed = true; }
        if (newH > maxH) { newH = maxH; changed = true; }
        if (changed) {
          w.style.width = Math.round(newW) + 'px';
          w.style.height = Math.round(newH) + 'px';
          if (typeof saveWindowPosition === 'function') {
            saveWindowPosition(id);
          }
        }
      }
    });

    // Refresh player waveform after browser resize (layout or clamp may have changed width)
    const pl = document.getElementById('player-win');
    if (pl && pl.style.display === 'flex') {
      const prog = document.getElementById('progress');
      if (prog && typeof setProgress === 'function') {
        const val = parseFloat(prog.value) || 0;
        setProgress(val);
      }
    }

    // On mobile, re-measure player height (which is now relative vh) so the
    // tracklist/gallery bottom calc updates on rotate/resize/zoom.
    if (isMob() && typeof updateMobPlayerHeight === 'function') {
      updateMobPlayerHeight();
    }
  });
})();