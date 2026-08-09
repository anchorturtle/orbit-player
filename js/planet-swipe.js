/* ============================================================
   PLANET SWIPE — touch: swipe the planet to change track.
   Mobile/tablet (coarse pointer) only. Carousel title animation:
   current title follows the finger, incoming title slides in,
   track change fires the existing planet shockwave + palette lerp.
   ============================================================ */
(function () {
  'use strict';

  var layer = document.getElementById('planet-swipe-layer');
  if (!layer) return;
  var coarse = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)');
  if (!coarse || !coarse.matches) return; // desktop mouse — planet stays a pure visual

  var curEl = document.getElementById('swipe-title-current');
  var nextEl = document.getElementById('swipe-title-next');
  var planetBg = document.getElementById('planet-bg');

  var THRESHOLD = 64;        // px of horizontal travel to commit
  var MAX_TRAVEL = 170;      // visual drag limit
  var startX = 0, startY = 0, dx = 0;
  var active = false, swiping = false, lock = false;
  var hasWAAPI = typeof curEl.animate === 'function';

  function titleFor(idx) {
    var t = TRACKS[(idx + TRACKS.length) % TRACKS.length];
    if (!t) return '';
    return (typeof softBreakTitle === 'function') ? softBreakTitle(t.title) : t.title;
  }

  function applyDrag(offset) {
    var travel = Math.max(-MAX_TRAVEL, Math.min(MAX_TRAVEL, offset));
    var dir = travel >= 0 ? 1 : -1;
    var fade = Math.max(0, 1 - Math.abs(offset) / 260);
    curEl.style.transform = 'translateX(' + travel + 'px) rotate(' + (travel * 0.025) + 'deg)';
    curEl.style.opacity = String(fade);
    var inX = travel + dir * 46;
    nextEl.style.transform = 'translateX(' + inX + 'px) rotate(' + (inX * 0.025) + 'deg)';
    nextEl.style.opacity = String(Math.min(1, Math.abs(offset) / 260));
  }

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
      var nextIdx = nx < 0 ? currentIndex + 1 : currentIndex - 1;
      curEl.textContent = titleFor(currentIndex);
      nextEl.textContent = titleFor(nextIdx);
      nextEl.style.transform = 'translateX(' + (nx < 0 ? 1 : -1) * 46 + 'px)';
      nextEl.style.opacity = '0';
    }
    dx = nx;
    applyDrag(dx);
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
      if (window.__ORBIT_PLANETS_SWAP__) window.__ORBIT_PLANETS_SWAP__(dir, target);   // parabola swap: out planet arcs away, in planet arcs in
      if (hasWAAPI) {
        var curT = curEl.style.transform, curO = curEl.style.opacity;
        curEl.animate(
          [{ transform: curT, opacity: curO }, { transform: 'translateX(' + (dir * 190) + 'px) rotate(' + (dir * 5) + 'deg)', opacity: 0 }],
          { duration: 240, easing: 'cubic-bezier(.22,.9,.36,1)' }
        );
        nextEl.animate(
          [{ transform: 'translateX(' + (-dir * 190) + 'px) rotate(' + (-dir * 5) + 'deg)', opacity: 0 }, { transform: 'translateX(0px) rotate(0deg)', opacity: 1 }],
          { duration: 340, easing: 'cubic-bezier(.22,.9,.36,1)' }
        );
      }
      setTimeout(function () {
        curEl.style.transform = ''; curEl.style.opacity = '0';
        nextEl.style.transform = ''; nextEl.style.opacity = '0';
        finishSwipeUi();
        // swap track as the incoming planet lands (watchTrack picks the slug up
        // within one 0.4s poll => palette lerp + shockwave fire right on landing)
        if (typeof loadTrack === 'function') loadTrack(target, isPlaying);
        lock = false;
      }, 340);
    } else {
      if (window.__PLANET_SWIPE_RELEASE__) window.__PLANET_SWIPE_RELEASE__(false, dir); // spring back to center
      if (hasWAAPI) {
        curEl.animate(
          [{ transform: curEl.style.transform, opacity: curEl.style.opacity }, { transform: 'translateX(0px)', opacity: 0 }],
          { duration: 240, easing: 'ease-out' }
        );
        nextEl.animate(
          [{ transform: nextEl.style.transform, opacity: nextEl.style.opacity }, { transform: 'translateX(0px)', opacity: 0 }],
          { duration: 240, easing: 'ease-out' }
        );
      }
      setTimeout(finishSwipeUi, 240);
    }
  }

  function finishSwipeUi() {
    curEl.style.transform = ''; curEl.style.opacity = '0';
    nextEl.style.transform = ''; nextEl.style.opacity = '0';
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
