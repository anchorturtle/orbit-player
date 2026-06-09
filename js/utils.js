/* ============================================
   ORBIT PLAYER — utils.js
   Shared helpers used across modules
   ============================================ */

function isMob() {
  return window.innerWidth < 768;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/* ── Z-INDEX MANAGEMENT ── */
let _zBase = 300;

function bringToFront(winId) {
  _zBase++;
  const w = document.getElementById(winId);
  if (w) {
    let z = _zBase + 10;
    // On mobile, the tracklist element is now full-height to the nav bar (to give "entire screen").
    // Always keep it below the player sheet in z-order. This stops the tracklist from
    // randomly coming to the front when tapping the (overlaid) media player, and ensures
    // clicks cannot pass through / hit the wrong window.
    if (isMob() && winId === 'tracklist-win') {
      const pl = document.getElementById('player-win');
      if (pl && pl.style.display === 'flex') {
        const pz = parseInt(pl.style.zIndex) || 600;
        z = Math.max(300, pz - 5); // stay below player
      }
    }
    w.style.zIndex = z;
  }
}

/* ── MOBILE HEIGHT HELPERS ── */
function updateMobPlayerHeight() {
  if (!isMob()) return;
  const pl = document.getElementById('player-win');
  const dock = document.getElementById('mobile-dock');
  const dockH = dock ? (dock.offsetHeight || 70) : 70;
  const plH = (pl && pl.style.display === 'flex' ? (pl.offsetHeight || 0) : 0) || 160;
  document.documentElement.style.setProperty('--mob-player-h', plH + 'px');
  document.documentElement.style.setProperty('--mob-dock-h', dockH + 'px');
}

/* ── TIME FORMATTER ── */
function fmt(s) {
  if (s === null || s === undefined || isNaN(s) || !isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

function isGoodDuration(d) {
  return typeof d === 'number' && isFinite(d) && d > 0 && d < 18000;
}

/* ── MATH ── */
function clamp(v, mn, mx) {
  return Math.max(mn, Math.min(mx, v));
}

/* ── MOBILE ACTIVE STATE ── */
function setMobActive(id, on) {
  const b = document.getElementById(id);
  if (b) on ? b.classList.add('active') : b.classList.remove('active');
}

/* ── SMART WINDOW POSITIONING HELPERS (fixes info window + better defaults) ── */
function clampWindowToViewport(win, margin = 8) {
  if (!win) return;
  const rect = win.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = rect.left;
  let top = rect.top;
  let w = rect.width || win.offsetWidth || 320;
  let h = rect.height || win.offsetHeight || 380;
  // also shrink if the window itself is now larger than the viewport (after browser resize)
  const maxW = vw - margin * 2;
  const maxH = vh - margin * 2;
  if (w > maxW) w = maxW;
  if (h > maxH) h = maxH;
  if (left < margin) left = margin;
  if (top < margin) top = margin;
  if (left + w > vw - margin) left = Math.max(margin, vw - w - margin);
  if (top + h > vh - margin) top = Math.max(margin, vh - h - margin);
  win.style.left = Math.round(left) + 'px';
  win.style.top = Math.round(top) + 'px';
  win.style.width = Math.round(w) + 'px';
  win.style.height = Math.round(h) + 'px';
  win.style.bottom = '';
  win.style.right = '';
}

/* ── PERSIST USER WINDOW POSITIONS (localStorage) ──
   So that when you close a window and reopen it (or reload the page),
   it comes back where you left it instead of resetting to the default
   left-corner stack on desktop.
*/
function saveWindowPosition(winId) {
  const w = document.getElementById(winId);
  if (!w || w.dataset.userPositioned !== 'true') return;
  const pos = {
    left: w.style.left,
    top: w.style.top,
    width: w.style.width,
    height: w.style.height
  };
  if (pos.left && pos.top) {
    localStorage.setItem('orbit_winpos_' + winId, JSON.stringify(pos));
  }
}

function restoreSavedWindowPosition(winId) {
  const w = document.getElementById(winId);
  if (!w) return;
  const saved = localStorage.getItem('orbit_winpos_' + winId);
  if (!saved) return;
  try {
    const pos = JSON.parse(saved);
    if (pos.left && pos.top) {
      w.style.left = pos.left;
      w.style.top = pos.top;
      if (pos.width) w.style.width = pos.width;
      if (pos.height) w.style.height = pos.height;
      w.style.bottom = '';
      w.style.right = '';
      w.dataset.userPositioned = 'true';
    }
  } catch (e) {
    localStorage.removeItem('orbit_winpos_' + winId);
  }
}

function restoreSavedWindowPositions() {
  ['tracklist-win', 'gallery-win', 'player-win'].forEach(restoreSavedWindowPosition);
}

function positionDetailWindow(win) {
  if (!win) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const player = document.getElementById('player-win');
  // sensible default width for the info panel (adapts to screen)
  const targetW = Math.min(420, Math.max(320, Math.floor(vw * 0.30)));
  win.style.width = targetW + 'px';
  // height left auto (content-sized; CSS min-height + max-height apply)
  let left, top;
  if (player && player.style.display === 'flex') {
    const pr = player.getBoundingClientRect();
    // prefer to the right of the player window
    left = pr.right + 16;
    top = Math.max(30, pr.top - 10);
    if (left + targetW + 12 > vw) {
      // not enough room right → try left of player
      left = Math.max(10, pr.left - targetW - 16);
    }
    if (left < 10 || left + targetW + 12 > vw) {
      // final fallback: center
      left = Math.max(16, Math.floor((vw - targetW) / 2));
    }
    // prevent bottom overflow (estimate needed height)
    const estH = Math.min(520, Math.max(340, vh * 0.58));
    if (top + estH > vh - 16) {
      top = Math.max(16, vh - estH - 16);
    }
  } else {
    left = Math.max(24, Math.floor((vw - targetW) / 2));
    top = Math.max(40, Math.floor((vh - 400) / 2.5));
  }
  win.style.left = left + 'px';
  win.style.top = top + 'px';
  win.style.bottom = '';
  win.style.right = '';
  win.style.transform = '';
}