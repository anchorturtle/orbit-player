/* ============================================================
   PLANET SWIPE — drag turns the cake-stand plate (touch + desktop).
   Soft-start + velocity / flick-commit; 3D side eases + coasts.
   Hold still 1s to play / pause.
   ============================================================ */
(function () {
  'use strict';

  var layer = document.getElementById('planet-swipe-layer');
  if (!layer) return;

  var planetBg = document.getElementById('planet-bg');
  var htmlEl = document.documentElement;

  var HOLD_MS = 1000;
  var HOLD_MOVE = 6;
  var startX = 0, startY = 0, dx = 0, dy = 0;
  var active = false, swiping = false, lock = false, holdFired = false;
  var holdTimer = null, chargeRaf = 0, holdStarted = 0;
  var samples = [];
  var activePointer = null;

  function spanPx() {
    return Math.min(window.innerWidth, window.innerHeight);
  }

  function deadzonePx() {
    return Math.max(6, Math.round(spanPx() * 0.01));
  }

  function commitPx() {
    return Math.max(48, Math.round(spanPx() * 0.055));
  }

  /* Soft knee through 2×deadzone so the globe starts turning immediately
     instead of sticking, then matches 1:1 minus the residual offset. */
  function effectiveDx(raw) {
    var z = deadzonePx();
    var a = Math.abs(raw);
    if (a <= 0.5) return 0;
    var knee = z * 2;
    var mag;
    if (a >= knee) {
      mag = a - z;
    } else {
      var t = a / knee;
      mag = t * t * (3 - 2 * t) * (knee - z);
    }
    return raw > 0 ? mag : -mag;
  }

  function pushSample(x, y) {
    var now = performance.now();
    samples.push({ t: now, x: x, y: y });
    while (samples.length > 1 && now - samples[0].t > 90) samples.shift();
  }

  function velocityX() {
    if (samples.length < 2) return 0;
    var a = samples[0], b = samples[samples.length - 1];
    var dt = b.t - a.t;
    if (dt < 10) return 0;
    return (b.x - a.x) / dt;
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

  function setPressing(on) {
    layer.classList.toggle('pressing', on);
    if (planetBg) planetBg.classList.toggle('pressing', on);
    htmlEl.classList.toggle('planet-pressing', on);
  }

  function setSwiping(on) {
    layer.classList.toggle('swiping', on);
    if (planetBg) planetBg.classList.toggle('swiping', on);
    htmlEl.classList.toggle('planet-dragging', on);
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
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest && e.target.closest('.win, .mob-btn, .dock, button, a, input, .ctrl-btn, .taskbar-btn')) return;
    if (document.documentElement.classList.contains('orbit-v2')) return;
    if (typeof TRACKS === 'undefined' || typeof currentIndex === 'undefined' || !TRACKS.length) return;
    startX = e.clientX; startY = e.clientY; dx = 0; dy = 0;
    active = true; swiping = false; holdFired = false;
    activePointer = e.pointerId;
    samples.length = 0;
    pushSample(e.clientX, e.clientY);
    setPressing(true);
    holdStarted = performance.now();
    holdTimer = setTimeout(fireHold, HOLD_MS);
    chargeRaf = requestAnimationFrame(chargeLoop);
    try { layer.setPointerCapture(e.pointerId); } catch (err) {}
  }

  function moveSwipe(e) {
    if (!active || holdFired) return;
    if (activePointer != null && e.pointerId !== activePointer) return;
    var nx = e.clientX - startX, ny = e.clientY - startY;
    dx = nx; dy = ny;
    pushSample(e.clientX, e.clientY);
    var dist = Math.hypot(nx, ny);
    if (dist < HOLD_MOVE) return;
    if (!swiping) {
      clearHold();
      if (window.__PLANET_HOLD_CANCEL__) window.__PLANET_HOLD_CANCEL__();
      swiping = true;
      setSwiping(true);
    }
    var ex = effectiveDx(dx);
    if (window.__PLANET_SWIPE_SET__) window.__PLANET_SWIPE_SET__(ex, dy, dx);
  }

  function shouldCommit(vx) {
    var dist = Math.abs(dx);
    if (dist >= commitPx()) return true;
    var sameDir = !dx || (vx < 0) === (dx < 0);
    return sameDir && Math.abs(vx) >= 0.7 && dist >= commitPx() * 0.3;
  }

  function endSwipe(e) {
    if (!active) return;
    if (e && activePointer != null && e.pointerId !== activePointer) return;
    var vx = velocityX();
    active = false;
    activePointer = null;
    clearHold();
    setPressing(false);
    if (holdFired) {
      finishSwipeUi();
      return;
    }
    if (window.__PLANET_HOLD_CANCEL__) window.__PLANET_HOLD_CANCEL__();
    if (!swiping) return;
    var dir = dx < 0 ? 1 : -1;
    var commit = shouldCommit(vx);
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
      if (window.__PLANET_SWIPE_RELEASE__) window.__PLANET_SWIPE_RELEASE__(true, dir, vx);
    } else {
      if (window.__PLANET_SWIPE_RELEASE__) window.__PLANET_SWIPE_RELEASE__(false, dir, vx);
      setTimeout(finishSwipeUi, 420);
    }
  }

  function finishSwipeUi() {
    setSwiping(false);
    setPressing(false);
  }

  function onCancel(e) {
    if (!active) return;
    if (e && activePointer != null && e.pointerId !== activePointer) return;
    active = false;
    activePointer = null;
    clearHold();
    setPressing(false);
    if (holdFired) { finishSwipeUi(); return; }
    if (window.__PLANET_HOLD_CANCEL__) window.__PLANET_HOLD_CANCEL__();
    if (swiping) {
      if (window.__PLANET_SWIPE_RELEASE__) window.__PLANET_SWIPE_RELEASE__(false, 0, 0);
      finishSwipeUi();
    }
  }

  layer.addEventListener('pointerdown', beginSwipe, { passive: true });
  layer.addEventListener('pointermove', moveSwipe, { passive: true });
  layer.addEventListener('pointerup', endSwipe, { passive: true });
  layer.addEventListener('pointercancel', onCancel);
  layer.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  // iOS Firefox: long-press hold-to-pause must not open text-select / callout UI
  layer.addEventListener('selectstart', function (e) { e.preventDefault(); });
  document.addEventListener('selectstart', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault();
  }, true);
})();
