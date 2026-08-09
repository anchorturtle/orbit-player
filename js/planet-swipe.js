/* ============================================================
   PLANET SWIPE — drag the planet to change track (touch + desktop).
   Each song's planet carries its own orbiting title text (space3d.js),
   so the swipe just:
   drag = whole planet follows the pointer (camera pan),
   commit = current planet arcs OUT on a parabola while the next
   song's planet arcs IN (both visible + spinning, own text onboard).
   ============================================================ */
(function () {
  'use strict';

  var layer = document.getElementById('planet-swipe-layer');
  if (!layer) return;

  var planetBg = document.getElementById('planet-bg');

  var THRESHOLD = 64;        // px of horizontal travel to commit
  var startX = 0, startY = 0, dx = 0;
  var active = false, swiping = false, lock = false;

  function beginSwipe(e) {
    if (lock) return;
    if (e.target.closest && e.target.closest('.win, .mob-btn, .dock, button, a, input, .ctrl-btn, .taskbar-btn')) return;
    if (document.documentElement.classList.contains('orbit-v2')) return; // v2 owns planet interactions
    if (typeof TRACKS === 'undefined' || typeof currentIndex === 'undefined' || !TRACKS.length) return;
    startX = e.clientX; startY = e.clientY; dx = 0;
    active = true; swiping = false;
  }

  function moveSwipe(e) {
    if (!active) return;
    var nx = e.clientX - startX, ny = e.clientY - startY;
    if (!swiping && Math.abs(nx) < 12 && Math.abs(ny) < 12) return;
    if (!swiping && Math.abs(ny) > Math.abs(nx) * 1.4) { active = false; return; } // vertical wins → let it scroll
    if (!swiping) {
      swiping = true;
      layer.classList.add('swiping');
      if (planetBg) planetBg.classList.add('swiping');
    }
    dx = nx;
    if (window.__PLANET_SWIPE_SET__) window.__PLANET_SWIPE_SET__(dx); // whole planet follows
  }

  function endSwipe() {
    if (!active) return;
    active = false;
    if (!swiping) return;
    var commit = Math.abs(dx) >= THRESHOLD;
    var dir = dx < 0 ? 1 : -1;
    if (commit) {
      lock = true;
      var target = ((currentIndex + dir) + TRACKS.length) % TRACKS.length;
      if (window.__PLANET_SWIPE_RELEASE__) window.__PLANET_SWIPE_RELEASE__(false, dir); // end drag pan
      if (window.__ORBIT_PLANETS_SWAP__) window.__ORBIT_PLANETS_SWAP__(dir, target);   // parabola swap: out arcs away, in arcs in (own text onboard)
      setTimeout(function () {
        finishSwipeUi();
        // swap track as the incoming planet lands (watchTrack picks the slug up
        // within one 0.4s poll => palette lerp + shockwave fire right on landing)
        if (typeof loadTrack === 'function') loadTrack(target, isPlaying);
        lock = false;
      }, 340);
    } else {
      if (window.__PLANET_SWIPE_RELEASE__) window.__PLANET_SWIPE_RELEASE__(false, dir); // spring back to center
      setTimeout(finishSwipeUi, 120);
    }
  }

  function finishSwipeUi() {
    layer.classList.remove('swiping');
    if (planetBg) planetBg.classList.remove('swiping');
  }

  layer.addEventListener('pointerdown', beginSwipe, { passive: true });
  layer.addEventListener('pointermove', moveSwipe, { passive: true });
  layer.addEventListener('pointerup', endSwipe, { passive: true });
  layer.addEventListener('pointercancel', function () {
    if (!active) return;
    active = false;
    if (swiping) {
      if (window.__PLANET_SWIPE_RELEASE__) window.__PLANET_SWIPE_RELEASE__(false, 0);
      finishSwipeUi();
    }
  });
})();
