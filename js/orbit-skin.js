/* ============================================
   ORBIT PLAYER — visual mode switch
   Three living rooms: glass (live) | holo (v2) | patch (v3 Patchwork).
   Does not change features.
   ============================================ */
(function () {
  'use strict';

  var KEY = 'orbitSkin';
  var SKINS = ['glass', 'holo', 'patch'];
  var html = document.documentElement;
  var current = 'holo';

  function normalize(raw) {
    var s = String(raw == null ? '' : raw).toLowerCase().trim();
    if (s === 'live' || s === 'glass') return 'glass';
    if (s === 'holo' || s === 'hermes') return 'holo';
    if (s === 'patch' || s === 'patchwork' || s === 'v3') return 'patch';
    return '';
  }

  function readStored() {
    try {
      return normalize(localStorage.getItem(KEY));
    } catch (e) {
      return '';
    }
  }

  function detect() {
    if (html.classList.contains('theme-patch')) return 'patch';
    if (html.classList.contains('theme-holo')) return 'holo';
    return 'glass';
  }

  function isHolo() {
    return current === 'holo';
  }

  function labelFor(skin) {
    if (skin === 'patch') return 'Patch';
    if (skin === 'holo') return 'Holo';
    return 'Glass';
  }

  function titleFor(skin) {
    if (skin === 'patch') return 'Patchwork — collage / pop-art living room';
    if (skin === 'holo') return 'Holo — Hermes wire + light';
    return 'Glass — live analog look';
  }

  function syncButtons(skin) {
    document.querySelectorAll('.orbit-mode-btn').forEach(function (btn) {
      btn.setAttribute('data-skin', skin);
      btn.setAttribute('aria-pressed', skin !== 'glass' ? 'true' : 'false');
      btn.classList.toggle('is-holo', skin === 'holo');
      btn.classList.toggle('is-patch', skin === 'patch');
      btn.classList.toggle('is-glass', skin === 'glass');
      btn.title = titleFor(skin) + ' (click to cycle)';
      btn.setAttribute('aria-label', 'Visual mode: ' + labelFor(skin) + '. Click to change.');
      var lab = btn.querySelector('.orbit-mode-label');
      if (lab) lab.textContent = labelFor(skin);
    });
  }

  function pauseWrapAnims(pause) {
    document.querySelectorAll('#holo-svg-defs animate').forEach(function (a) {
      try {
        if (pause) a.endElement();
        else a.beginElement();
      } catch (e) {}
    });
  }

  function syncMotion() {
    var reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {}
    html.classList.toggle('holo-still', reduce);
    html.classList.toggle('patch-still', reduce);
    pauseWrapAnims(current !== 'holo' || reduce);
  }

  function apply(next, persist) {
    var skin = normalize(next);
    if (!skin) {
      if (next === true || next === 1) skin = 'holo';
      else if (next === false || next === 0) skin = 'glass';
      else skin = detect();
    }
    current = skin;
    html.classList.toggle('theme-holo', skin === 'holo');
    html.classList.toggle('theme-patch', skin === 'patch');
    html.classList.add('orbit-skin-xfade');
    if (window.__orbitSkinXfadeT) clearTimeout(window.__orbitSkinXfadeT);
    window.__orbitSkinXfadeT = setTimeout(function () {
      html.classList.remove('orbit-skin-xfade');
    }, 520);
    if (persist !== false) {
      try { localStorage.setItem(KEY, skin); } catch (e) {}
      try {
        var u = new URL(location.href);
        u.searchParams.set('skin', skin);
        if (history.replaceState) history.replaceState({}, '', u);
      } catch (e2) {}
    }
    syncButtons(skin);
    syncMotion();
    if (typeof window.__ORBIT_SKIN_APPLY__ === 'function') {
      try { window.__ORBIT_SKIN_APPLY__(skin === 'holo'); } catch (e) {}
    }
    window.dispatchEvent(new CustomEvent('orbit-skin-change', {
      detail: { skin: skin, holo: skin === 'holo', patch: skin === 'patch', glass: skin === 'glass' }
    }));
  }

  function toggle() {
    var i = SKINS.indexOf(current);
    if (i < 0) i = 0;
    apply(SKINS[(i + 1) % SKINS.length]);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('.orbit-mode-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    toggle();
  }, true);

  document.addEventListener('pointerover', function (e) {
    if (!isHolo()) return;
    var el = e.target && e.target.closest && e.target.closest('.ctrl-btn, .taskbar-btn, .mob-btn, .win, .play-btn, .tab, .orbit-mode-btn');
    if (!el) return;
    var r = el.getBoundingClientRect();
    var x = (e.clientX - r.left) / Math.max(1, r.width);
    var y = (e.clientY - r.top) / Math.max(1, r.height);
    var ang = Math.atan2(y - 0.5, x - 0.5) * 180 / Math.PI + 90;
    el.style.setProperty('--pour-angle', ang + 'deg');
    el.style.setProperty('--pour-x', (x * 100) + '%');
    el.style.setProperty('--pour-y', (y * 100) + '%');
  }, true);

  try {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.addEventListener) mq.addEventListener('change', syncMotion);
    else if (mq.addListener) mq.addListener(syncMotion);
  } catch (e) {}

  try {
    var bootQ = normalize(new URLSearchParams(location.search).get('skin'));
    if (bootQ) apply(bootQ, true);
    else apply(readStored() || detect(), false);
  } catch (e) {
    apply(detect(), false);
  }

  window.__ORBIT_SKIN_TOGGLE__ = toggle;
  window.__ORBIT_SKIN_SET__ = apply;
  window.__ORBIT_SKIN_GET__ = function () { return current; };
  window.__ORBIT_SKINS__ = SKINS.slice();
})();
