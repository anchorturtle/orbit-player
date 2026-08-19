/* ============================================================
   PLANET SWIPE — drag turns the cake-stand plate (touch + desktop).
   Hold still 1s to play / pause. 5% viewport deadzone before rotate.
   ============================================================ */
(function () {
  'use strict';

  var layer = document.getElementById('planet-swipe-layer');
  if (!layer) return;

  var planetBg = document.getElementById('planet-bg');

  var HOLD_MS = 1000;
  var HOLD_MOVE = 10;
  var startX = 0, startY = 0, dx = 0, dy = 0;
  var active = false, swiping = false, lock = false, holdFired = false;
  var holdTimer = null, chargeRaf = 0, holdStarted = 0;

  function deadzonePx() {
    return Math.max(10, Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.025));
  }

  function commitPx() {
    return deadzonePx() + Math.max(40, Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.045));
  }

  function effectiveDx(raw) {
    var z = deadzonePx();
    if (Math.abs(raw) <= z) return 0;
    return raw > 0 ? raw - z : raw + z;
  }

  function targetFromDir(dir) {
    if (typeof tracklistPlayOrder === 'function') {
      var order = tracklistPlayOrder();
      if (order && order.length) {
        var pos = order.indexOf(currentIndex);
        if (pos < 0) pos = 0;
        return order[(pos + dir + order.length) % order.length];
      }
    }
    return ((currentIndex + dir) + TRACKS.length) % TRACKS.length;
  }

  function clearHold() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    if (chargeRaf) { cancelAnimationFrame(chargeRaf); chargeRaf = 0; }
  }

  function chargeLoop() {
    if (!active || swiping || holdFired) return;
    var p = Math.min(1, (performance.now() - holdStarted) / HOLD_MS);
    if (p > 0.2 && window.__PLANET_HOLD_TICK__) window.__PLANET_HOLD_TICK__(p);
    if (p < 1) chargeRaf = requestAnimationFrame(chargeLoop);
  }

  function fireHold() {
    if (!active || swiping || holdFired || lock) return;
    holdFired = true;
    clearHold();
    if (window.__PLANET_HOLD_FIRE__) window.__PLANET_HOLD_FIRE__();
    var btn = document.getElementById('btn-play');
    if (btn) btn.click();
  }

  function beginSwipe(e) {
    if (lock) return;
    if (e.target.closest && e.target.closest('.win, .mob-btn, .dock, button, a, input, .ctrl-btn, .taskbar-btn')) return;
    if (document.documentElement.classList.contains('orbit-v2')) return;
    if (typeof TRACKS === 'undefined' || typeof currentIndex === 'undefined' || !TRACKS.length) return;
    startX = e.clientX; startY = e.clientY; dx = 0; dy = 0;
    active = true; swiping = false; holdFired = false;
    holdStarted = performance.now();
    holdTimer = setTimeout(fireHold, HOLD_MS);
    chargeRaf = requestAnimationFrame(chargeLoop);
  }

  function moveSwipe(e) {
    if (!active || holdFired) return;
    var nx = e.clientX - startX, ny = e.clientY - startY;
    dx = nx; dy = ny;
    var dist = Math.hypot(nx, ny);
    if (dist < HOLD_MOVE) return;
    if (!swiping) {
      clearHold();
      if (window.__PLANET_HOLD_CANCEL__) window.__PLANET_HOLD_CANCEL__();
      swiping = true;
      layer.classList.add('swiping');
      if (planetBg) planetBg.classList.add('swiping');
    }
    var ex = effectiveDx(dx);
    if (window.__PLANET_SWIPE_SET__) window.__PLANET_SWIPE_SET__(ex, dy, dx);
  }

  function endSwipe() {
    if (!active) return;
    active = false;
    clearHold();
    if (holdFired) {
      finishSwipeUi();
      return;
    }
    if (window.__PLANET_HOLD_CANCEL__) window.__PLANET_HOLD_CANCEL__();
    if (!swiping) return;
    var commit = Math.abs(dx) >= commitPx();
    var dir = dx < 0 ? 1 : -1;
    if (commit) {
      lock = true;
      var target = targetFromDir(dir);
      if (window.__ORBIT_PLANETS_SWAP__) {
        window.__ORBIT_PLANETS_SWAP__(dir, target, function () {
          finishSwipeUi();
          if (typeof loadTrack === 'function') loadTrack(target, isPlaying);
          lock = false;
        });
      } else {
        if (typeof loadTrack === 'function') loadTrack(target, isPlaying);
        finishSwipeUi();
        lock = false;
      }
      if (window.__PLANET_SWIPE_RELEASE__) window.__PLANET_SWIPE_RELEASE__(true, dir);
    } else {
      if (window.__PLANET_SWIPE_RELEASE__) window.__PLANET_SWIPE_RELEASE__(false, dir);
      setTimeout(finishSwipeUi, 180);
    }
  }

  function finishSwipeUi() {
    layer.classList.remove('swiping');
    if (planetBg) planetBg.classList.remove('swiping');
  }

  layer.addEventListener('pointerdown', beginSwipe, { passive: true });
  layer.addEventListener('pointermove', moveSwipe, { passive: true });
  layer.addEventListener('pointerup', endSwipe, { passive: true });
  layer.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  // iOS Firefox: long-press hold-to-pause must not open text-select / callout UI
  layer.addEventListener('selectstart', function (e) { e.preventDefault(); });
  document.addEventListener('selectstart', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault();
  }, true);
  layer.addEventListener('pointercancel', function () {
    if (!active) return;
    active = false;
    clearHold();
    if (holdFired) { finishSwipeUi(); return; }
    if (window.__PLANET_HOLD_CANCEL__) window.__PLANET_HOLD_CANCEL__();
    if (swiping) {
      if (window.__PLANET_SWIPE_RELEASE__) window.__PLANET_SWIPE_RELEASE__(false, 0);
      finishSwipeUi();
    }
  });
})();
