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

const VIDEOS = [
  {
    slug: 'jazzpotwax',
    src: 'videos/jazzpotwax.mp4',
    title: 'Jazzpot Wax',
    poster: 'videos/jazzpotwax-poster.jpg',
  },
];

/** Full MP4 on branch media-store (too large for Pages). Local dev uses videos/jazzpotwax.mp4. */
const ORBIT_VIDEO_MEDIA_BRANCH = 'media-store';
const ORBIT_VIDEO_REPO = 'anchorturtle/orbit-player';

function videoSrcForEntry(v) {
  const rel = String(v.src || '').replace(/^\//, '');
  if (/^https?:\/\//i.test(rel)) return rel;
  const host = typeof location !== 'undefined' ? location.hostname : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  if (isLocal) return rel;
  if (/\.mp4$/i.test(rel)) {
    return `https://media.githubusercontent.com/media/${ORBIT_VIDEO_REPO}/${ORBIT_VIDEO_MEDIA_BRANCH}/${rel}`;
  }
  return rel;
}

function findVideoBySlug(slug) {
  return VIDEOS.findIndex(v => v.slug === slug);
}

function videoShareUrl(slug) {
  return `${location.origin}/video/${slug}`;
}

let currentGalleryTab = 'images';

function setGalleryTab(tab) {
  currentGalleryTab = tab;
  document.querySelectorAll('.gallery-tabs .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.galleryTab === tab);
  });
  const imgPanel = document.getElementById('gallery-panel-images');
  const vidPanel = document.getElementById('gallery-panel-videos');
  if (imgPanel) imgPanel.hidden = tab !== 'images';
  if (vidPanel) vidPanel.hidden = tab !== 'videos';
}

document.querySelectorAll('.gallery-tabs .tab').forEach(tab => {
  tab.addEventListener('click', () => setGalleryTab(tab.dataset.galleryTab));
});

function renderGalleryImages() {
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

function renderGalleryVideos() {
  const grid = document.getElementById('gw-videos-grid');
  if (!grid) return;
  grid.innerHTML = VIDEOS.map((v, i) => {
    const poster = v.poster || v.src;
    return `<div class="gallery-item gallery-item-video" data-vi="${i}">
      <img class="gallery-video-thumb" src="${poster}" alt="${v.title || 'Video'}" loading="lazy"/>
      <div class="gallery-video-hover-play" aria-hidden="true">
        <span class="gallery-video-glass-play"><span class="material-symbols-outlined">play_arrow</span></span>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.gallery-item-video').forEach(el => {
    const idx = +el.dataset.vi;
    const open = () => openVideoWin(idx);
    el.addEventListener('click', () => open());
  });
}

/* FIX: removed the early-exit guard so gallery always re-renders when opened. */
function renderGallery() {
  renderGalleryImages();
  renderGalleryVideos();
  setGalleryTab(currentGalleryTab);
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

/* ── VIDEO VIEWER ── */
function fmtTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

let _videoIdx = 0;
let _videoPreFsRect = null;
let _videoUiRaf = 0;

function scheduleSyncVideoUi() {
  if (_videoUiRaf) return;
  _videoUiRaf = requestAnimationFrame(() => {
    _videoUiRaf = 0;
    syncVideoUi();
  });
}

/** Pin + remember window box before native fullscreen (exit FS must not leave 100vw inline). */
function captureVideoWinGeometry(win) {
  if (!win || isMob()) return;
  const r = win.getBoundingClientRect();
  _videoPreFsRect = {
    left: Math.round(r.left) + 'px',
    top: Math.round(r.top) + 'px',
    width: Math.round(r.width) + 'px',
    height: Math.round(r.height) + 'px',
    userPositioned: win.dataset.userPositioned === 'true',
  };
  win.style.left = _videoPreFsRect.left;
  win.style.top = _videoPreFsRect.top;
  win.style.width = _videoPreFsRect.width;
  win.style.height = _videoPreFsRect.height;
  win.style.bottom = '';
  win.style.right = '';
  win.style.maxWidth = '';
  win.style.maxHeight = '';
}

function restoreVideoWinAfterFullscreen() {
  const win = document.getElementById('video-win');
  if (!win || win.style.display !== 'flex' || isMob()) return;
  const rect = _videoPreFsRect;
  const apply = () => {
    if (rect) {
      win.style.left = rect.left;
      win.style.top = rect.top;
      win.style.width = rect.width;
      win.style.height = rect.height;
      win.style.bottom = '';
      win.style.right = '';
      win.style.maxWidth = '';
      win.style.maxHeight = '';
      if (rect.userPositioned) win.dataset.userPositioned = 'true';
    } else if (win.dataset.userPositioned !== 'true') {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.min(720, vw - 80);
      const h = Math.min(540, vh - 120);
      win.style.width = w + 'px';
      win.style.height = h + 'px';
      win.style.left = ((vw - w) / 2) + 'px';
      win.style.top = ((vh - h) / 2) + 'px';
      win.style.bottom = '';
      win.style.right = '';
    }
    if (typeof clampWindowToViewport === 'function') clampWindowToViewport(win, 8);
    if (typeof syncWindowGlassTiers === 'function') syncWindowGlassTiers();
    nudgeVideoPaint(document.getElementById('video-win-player'));
  };
  requestAnimationFrame(() => requestAnimationFrame(apply));
}

function layoutVideoWinDefault(win) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(720, vw - 80);
  const h = Math.min(540, vh - 120);
  win.style.width = w + 'px';
  win.style.height = h + 'px';
  win.style.left = ((vw - w) / 2) + 'px';
  win.style.top = ((vh - h) / 2) + 'px';
  win.style.bottom = '';
  win.style.right = '';
}

/** Fix Chrome frozen video frame after window resize (audio keeps going). */
function nudgeVideoPaint(player) {
  if (!player || !player.src || player.paused) return;
  const t = player.currentTime;
  requestAnimationFrame(() => {
    if (!player || player.paused) return;
    try {
      player.pause();
      void player.offsetHeight;
      player.currentTime = t;
      player.play().catch(() => {});
    } catch (_) {}
    syncVideoUi();
  });
}

function toggleVideoPlayback() {
  const player = document.getElementById('video-win-player');
  if (!player) return;
  if (player.paused || player.ended) {
    if (player.ended) player.currentTime = 0;
    player.play().catch(() => {});
  } else {
    player.pause();
  }
  syncVideoUi();
}

function syncVideoFullscreenUi() {
  const win = document.getElementById('video-win');
  const icon = document.getElementById('video-fullscreen-icon');
  const btn = document.getElementById('video-btn-fullscreen');
  const activeEl = document.fullscreenElement || document.webkitFullscreenElement;
  const on = !!(win && activeEl === win);
  if (icon) icon.textContent = on ? 'fullscreen_exit' : 'fullscreen';
  if (btn) {
    btn.classList.toggle('active', on);
    btn.title = on ? 'Exit fullscreen' : 'Fullscreen';
  }
  if (on && !_videoFsWasActive) onVideoFullscreenEnter();
  else if (!on && _videoFsWasActive) onVideoFullscreenLeave();
  _videoFsWasActive = on;
}

const VIDEO_FS_CHROME_IDLE_MS = 3000;
/** Bottom 15% of viewport (y >= 85% height) */
const VIDEO_FS_BOTTOM_ZONE = 0.85;
let _videoFsHideTimer = null;
let _videoFsGraceTimer = null;
let _videoFsChromeBound = false;
let _videoFsWasActive = false;
let _videoFsPostGrace = false;
let _videoFsChromeOpen = false;

function isVideoFullscreenActive() {
  const win = document.getElementById('video-win');
  const active = document.fullscreenElement || document.webkitFullscreenElement;
  return !!(win && active === win);
}

function videoFsPointerInBottomZone(clientY) {
  const h = window.innerHeight || document.documentElement.clientHeight || 1;
  return clientY >= h * VIDEO_FS_BOTTOM_ZONE;
}

function setVideoFsChromeHidden(hidden) {
  const win = document.getElementById('video-win');
  if (!win) return;
  win.classList.toggle('video-fs-chrome-hidden', !!hidden);
}

function clearVideoFsChromeTimers() {
  if (_videoFsHideTimer) {
    clearTimeout(_videoFsHideTimer);
    _videoFsHideTimer = null;
  }
  if (_videoFsGraceTimer) {
    clearTimeout(_videoFsGraceTimer);
    _videoFsGraceTimer = null;
  }
}

function closeVideoFsChrome() {
  setVideoFsChromeHidden(true);
  _videoFsChromeOpen = false;
  document.getElementById('video-ai-disclaimer')?.classList.remove('open');
  document.getElementById('video-ai-badge')?.setAttribute('aria-expanded', 'false');
  if (_videoFsHideTimer) {
    clearTimeout(_videoFsHideTimer);
    _videoFsHideTimer = null;
  }
}

function openVideoFsChrome() {
  setVideoFsChromeHidden(false);
  _videoFsChromeOpen = true;
}

/** Hide chrome after mouse stops moving for 3s (while chrome is open). */
function bumpVideoFsMouseIdle() {
  if (_videoFsHideTimer) {
    clearTimeout(_videoFsHideTimer);
    _videoFsHideTimer = null;
  }
  if (!isVideoFullscreenActive() || !_videoFsChromeOpen) return;
  _videoFsHideTimer = setTimeout(() => {
    _videoFsHideTimer = null;
    if (!isVideoFullscreenActive()) return;
    closeVideoFsChrome();
  }, VIDEO_FS_CHROME_IDLE_MS);
}

function onVideoFullscreenPointerMove(e) {
  if (!isVideoFullscreenActive()) return;
  const win = document.getElementById('video-win');
  if (!win) return;

  const inZone = videoFsPointerInBottomZone(e.clientY);
  win.classList.toggle('video-fs-pointer-in-zone', inZone);

  if (!_videoFsPostGrace) return;

  if (inZone) {
    openVideoFsChrome();
    bumpVideoFsMouseIdle();
    return;
  }

  if (_videoFsChromeOpen) {
    bumpVideoFsMouseIdle();
  }
}

function onVideoFullscreenPointerActivity(e) {
  if (!isVideoFullscreenActive() || !_videoFsPostGrace) return;
  const inZone = videoFsPointerInBottomZone(e.clientY);
  if (inZone) {
    openVideoFsChrome();
    bumpVideoFsMouseIdle();
  } else if (_videoFsChromeOpen) {
    bumpVideoFsMouseIdle();
  }
}

function onVideoFullscreenEnter() {
  const win = document.getElementById('video-win');
  if (!win) return;
  bindVideoFsChromeListeners();
  _videoFsPostGrace = false;
  _videoFsChromeOpen = true;
  win.classList.remove('video-fs-pointer-in-zone');
  setVideoFsChromeHidden(false);
  clearVideoFsChromeTimers();

  _videoFsGraceTimer = setTimeout(() => {
    _videoFsGraceTimer = null;
    _videoFsPostGrace = true;
    if (!isVideoFullscreenActive()) return;
    closeVideoFsChrome();
  }, VIDEO_FS_CHROME_IDLE_MS);
}

function onVideoFullscreenLeave() {
  clearVideoFsChromeTimers();
  _videoFsPostGrace = false;
  _videoFsChromeOpen = false;
  const win = document.getElementById('video-win');
  if (win) {
    win.classList.remove('video-fs-pointer-in-zone', 'video-fs-chrome-hidden');
  }
  restoreVideoWinAfterFullscreen();
}

function bindVideoFsChromeListeners() {
  if (_videoFsChromeBound) return;
  _videoFsChromeBound = true;
  document.addEventListener('pointermove', onVideoFullscreenPointerMove, { passive: true });
  document.addEventListener('pointerdown', onVideoFullscreenPointerActivity, { passive: true });
}

function toggleVideoFullscreen() {
  const win = document.getElementById('video-win');
  const player = document.getElementById('video-win-player');
  if (!win) return;
  const doc = document;
  const active = doc.fullscreenElement || doc.webkitFullscreenElement;
  if (active) {
    const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
    if (exit) exit.call(doc);
    return;
  }
  captureVideoWinGeometry(win);
  const req = win.requestFullscreen || win.webkitRequestFullscreen;
  if (req) {
    req.call(win)
      .then(() => syncVideoFullscreenUi())
      .catch(() => {
        if (player && player.webkitEnterFullscreen) player.webkitEnterFullscreen();
      });
  } else if (player && player.webkitEnterFullscreen) {
    player.webkitEnterFullscreen();
  }
}

function tryAutoplayVideo(player) {
  if (!player || !player.src) return;
  player.preload = 'auto';
  const attempt = () => {
    if (!player.src) return;
    player.play().then(() => syncVideoUi()).catch(() => {
      player.muted = true;
      player.play().then(() => {
        player.muted = false;
        syncVideoUi();
      }).catch(() => syncVideoUi());
    });
  };
  if (player.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) attempt();
  else {
    player.addEventListener('canplay', attempt, { once: true });
    player.load();
  }
}

function openVideoWin(idx) {
  const entry = VIDEOS[idx];
  if (!entry) return;
  _videoIdx = idx;
  const win = document.getElementById('video-win');
  const player = document.getElementById('video-win-player');
  const titleEl = document.getElementById('video-win-title');
  if (!win || !player) return;

  titleEl.textContent = entry.title || 'Video';
  document.title = (entry.title || 'Video') + ' | AnchorTurtle';

  const mediaSrc = videoSrcForEntry(entry);
  const nextSrc = /^https?:\/\//i.test(mediaSrc)
    ? mediaSrc
    : new URL(mediaSrc, window.location.href).href;
  const hadSrc = !!(player.currentSrc || player.getAttribute('src'));
  const sameSrc = hadSrc && (player.currentSrc === nextSrc || player.src === nextSrc);

  if (!sameSrc) {
    player.src = mediaSrc;
    if (entry.poster) player.setAttribute('poster', entry.poster);
    else player.removeAttribute('poster');
    player.currentTime = 0;
    player.load();
  } else if (player.readyState < HTMLMediaElement.HAVE_METADATA) {
    player.load();
  }

  if (isMob()) {
    win.style.width = '100vw';
    win.style.height = '100dvh';
    win.style.left = '0';
    win.style.top = '0';
    win.style.bottom = '';
    win.style.right = '';
  } else {
    if (typeof restoreSessionWindowPosition === 'function') {
      restoreSessionWindowPosition('video-win');
    }
    if (win.dataset.userPositioned !== 'true') {
      layoutVideoWinDefault(win);
    }
  }

  win.style.display = 'flex';
  bringToFront('video-win');
  requestAnimationFrame(() => bringToFront('video-win'));
  tryAutoplayVideo(player);
  syncVideoUi();

  if (!isMob() && typeof clampWindowToViewport === 'function') {
    requestAnimationFrame(() => clampWindowToViewport(win, 8));
  }
}

function closeVideoWin() {
  const win = document.getElementById('video-win');
  const player = document.getElementById('video-win-player');
  const doc = document;
  const active = doc.fullscreenElement || doc.webkitFullscreenElement;
  const finishClose = () => {
    if (!isMob() && win && typeof saveSessionWindowPosition === 'function') {
      saveSessionWindowPosition('video-win');
    }
    if (player) player.pause();
    if (win) win.style.display = 'none';
    document.title = 'AnchorTurtle';
    syncVideoFullscreenUi();
  };
  if (active) {
    const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
    if (exit) {
      exit.call(doc).then(finishClose).catch(finishClose);
      return;
    }
  }
  finishClose();
}

function syncVideoUi() {
  const player = document.getElementById('video-win-player');
  const playBtn = document.getElementById('video-btn-play');
  const playIcon = document.getElementById('video-play-icon');
  const volIcon = document.getElementById('video-vol-icon');
  const volSlider = document.getElementById('video-vol-slider');
  const volPct = document.getElementById('video-vol-pct');
  const timeCur = document.getElementById('video-time-current');
  const timeTot = document.getElementById('video-time-total');
  const seek = document.getElementById('video-seek');
  const fill = document.getElementById('video-progress-fill');
  const thumb = document.getElementById('video-progress-thumb');
  if (!player) return;

  const playing = !player.paused && !player.ended;
  if (playBtn) playBtn.classList.toggle('playing', playing);
  if (playIcon) {
    if (playing) {
      playIcon.textContent = 'pause';
      playIcon.classList.add('material-symbols-outlined');
    } else {
      playIcon.textContent = '';
      playIcon.classList.remove('material-symbols-outlined');
    }
  }

  const volPctNum = Math.round((player.muted ? 0 : player.volume) * 100);
  if (volSlider) {
    volSlider.value = String(volPctNum);
    volSlider.style.setProperty('--vol-pct', volPctNum + '%');
  }
  if (volPct) volPct.textContent = volPctNum + '%';
  if (volIcon) {
    const muted = player.muted || player.volume === 0;
    volIcon.classList.toggle('muted', muted);
    volIcon.textContent = muted ? 'volume_off' : volPctNum < 50 ? 'volume_down' : 'volume_up';
  }

  const dur = player.duration;
  const cur = player.currentTime;
  if (timeCur) timeCur.textContent = fmtTime(cur);
  if (timeTot) timeTot.textContent = isFinite(dur) ? fmtTime(dur) : '0:00';
  if (seek && isFinite(dur) && dur > 0) {
    const pct = cur / dur;
    const pct100 = pct * 100;
    seek.value = String(Math.round(pct * 1000));
    if (fill) fill.style.width = pct100 + '%';
    if (thumb) thumb.style.left = pct100 + '%';
  }
}

let _videoPremuteVol = 100;
let _videoUserMuted = false;

function setVideoVolume(pct) {
  const player = document.getElementById('video-win-player');
  const volSlider = document.getElementById('video-vol-slider');
  if (!player) return;
  pct = Math.max(0, Math.min(100, pct));
  player.volume = pct / 100;
  player.muted = pct === 0;
  _videoUserMuted = pct === 0;
  if (volSlider) volSlider.style.setProperty('--vol-pct', pct + '%');
  syncVideoUi();
}

(function initVideoPlayer() {
  const player = document.getElementById('video-win-player');
  const body = document.querySelector('#video-win .win-body');
  const seek = document.getElementById('video-seek');
  const volSlider = document.getElementById('video-vol-slider');
  const closeBtn = document.getElementById('close-video-win');
  const playBtnEl = document.getElementById('video-btn-play');
  const progressRail = document.getElementById('video-progress-rail');
  if (!player || !body) return;

  if (closeBtn) closeBtn.addEventListener('click', closeVideoWin);

  const aiBadge = document.getElementById('video-ai-badge');
  const aiDisclaimer = document.getElementById('video-ai-disclaimer');
  if (aiBadge && aiDisclaimer) {
    aiBadge.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = aiDisclaimer.classList.toggle('open');
      aiBadge.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (!aiDisclaimer.classList.contains('open')) return;
      if (e.target.closest('#video-ai-badge') || e.target.closest('#video-ai-disclaimer')) return;
      aiDisclaimer.classList.remove('open');
      aiBadge.setAttribute('aria-expanded', 'false');
    });
  }

  if (playBtnEl) {
    playBtnEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleVideoPlayback();
    });
  }

  player.addEventListener('play', syncVideoUi);
  player.addEventListener('pause', syncVideoUi);
  player.addEventListener('timeupdate', scheduleSyncVideoUi);
  player.addEventListener('loadedmetadata', syncVideoUi);
  player.addEventListener('volumechange', syncVideoUi);
  player.addEventListener('ended', syncVideoUi);

  const videoWin = document.getElementById('video-win');
  if (videoWin && typeof ResizeObserver !== 'undefined') {
    let roTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(roTimer);
      roTimer = setTimeout(() => nudgeVideoPaint(player), 100);
    });
    ro.observe(videoWin);
  }

  player.addEventListener('click', (e) => {
    if (e.target !== player) return;
    toggleVideoPlayback();
  });

  if (seek) {
    const setSeekDrag = (on) => {
      if (progressRail) progressRail.classList.toggle('dragging', on);
    };
    seek.addEventListener('pointerdown', () => setSeekDrag(true));
    seek.addEventListener('pointerup', () => setSeekDrag(false));
    seek.addEventListener('pointercancel', () => setSeekDrag(false));
    seek.addEventListener('input', () => {
      const dur = player.duration;
      if (isFinite(dur) && dur > 0) {
        player.currentTime = (parseInt(seek.value, 10) / 1000) * dur;
      }
      syncVideoUi();
    });
  }

  if (volSlider) {
    volSlider.addEventListener('input', () => {
      _videoUserMuted = false;
      setVideoVolume(parseInt(volSlider.value, 10));
    });
    volSlider.addEventListener('pointerdown', () => {
      volSlider.closest('.volume-module')?.classList.add('slider-active');
    });
    const clearVolActive = () => volSlider.closest('.volume-module')?.classList.remove('slider-active');
    volSlider.addEventListener('pointerup', clearVolActive);
    volSlider.addEventListener('pointercancel', clearVolActive);
  }

  document.addEventListener('fullscreenchange', syncVideoFullscreenUi);
  document.addEventListener('webkitfullscreenchange', syncVideoFullscreenUi);

  body.addEventListener('click', (e) => {
    if (e.target.closest('#video-btn-play')) return;

    const volWrap = e.target.closest('#video-vol-icon-wrap');
    if (volWrap) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (_videoUserMuted || player.muted || player.volume === 0) {
        _videoUserMuted = false;
        player.muted = false;
        setVideoVolume(_videoPremuteVol || 80);
      } else {
        _videoPremuteVol = Math.round(player.volume * 100) || 80;
        _videoUserMuted = true;
        player.muted = true;
        syncVideoUi();
      }
      return;
    }

    const shareBtn = e.target.closest('#video-btn-share');
    if (shareBtn) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      const entry = VIDEOS[_videoIdx];
      const slug = entry?.slug;
      if (!slug) return;
      const url = videoShareUrl(slug);
      const originalHTML = shareBtn.innerHTML;
      const copy = () => {
        shareBtn.classList.add('copied');
        shareBtn.innerHTML = '<span style="font-size:11px;margin-right:4px;">Copied</span><span class="material-symbols-outlined" style="font-size:15px">check</span>';
        setTimeout(() => {
          shareBtn.innerHTML = originalHTML;
          shareBtn.classList.remove('copied');
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(copy).catch(() => prompt('Copy this link:', url));
      } else {
        prompt('Copy this link:', url);
      }
      return;
    }

    const fsBtn = e.target.closest('#video-btn-fullscreen');
    if (fsBtn) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggleVideoFullscreen();
      return;
    }
  });

  document.addEventListener('keydown', e => {
    const win = document.getElementById('video-win');
    if (!win || win.style.display !== 'flex') return;
    if (e.key === 'Escape') {
      e.preventDefault();
      const active = document.fullscreenElement || document.webkitFullscreenElement;
      if (active) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) exit.call(document);
      } else {
        closeVideoWin();
      }
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleVideoPlayback();
    }
  });

  setVideoVolume(100);
})();

/* ── VIDEO SHARE LINKS (/video/slug, #video/slug) ── */
function handleVideoRouting() {
  let slug = null;

  if (window.location.pathname.startsWith('/video/')) {
    slug = window.location.pathname.replace('/video/', '').replace(/\/$/, '');
    history.replaceState(null, '', `/#video/${slug}`);
  } else if (location.hash.startsWith('#video/')) {
    slug = location.hash.replace('#video/', '');
  }

  if (!slug) return;

  const openShared = () => {
    const idx = findVideoBySlug(slug);
    if (idx === -1) return;
    setGalleryTab('videos');
    const gw = document.getElementById('gallery-win');
    if (gw && gw.style.display !== 'flex') {
      gw.style.display = 'flex';
      const btn = document.getElementById('btn-gallery');
      if (btn) btn.classList.add('win-open');
    }
    openVideoWin(idx);
  };

  openShared();
  setTimeout(openShared, 280);
}

window.addEventListener('hashchange', handleVideoRouting);
window.addEventListener('load', handleVideoRouting);

/* Gallery now uses the same native scroller as the tracklist (see .no-scrollbar in CSS + matching HTML structure).
   No custom DOM scrollbar or JS updates needed anymore. */