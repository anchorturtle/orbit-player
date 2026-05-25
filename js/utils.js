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
  if (w) w.style.zIndex = _zBase + 10;
}

/* ── MOBILE HEIGHT HELPERS ── */
function updateMobPlayerHeight() {
  if (!isMob()) return;
  const pl = document.getElementById('player-win');
  const dock = document.getElementById('mobile-dock');
  const dockH = dock ? (dock.offsetHeight || 70) : 70;
  const plH = (pl && pl.style.display === 'flex' ? (pl.offsetHeight || 0) : 0) || 190;
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