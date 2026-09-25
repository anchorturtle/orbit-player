/* ============================================
   ORBIT PLAYER — visual mode switch
   Toggles html.theme-holo. Does not change features.
   ============================================ */
(function () {
  'use strict';

  var KEY = 'orbitSkin';
  var html = document.documentElement;
  /* Locked names: glass | holo | patch. live is a glass alias. patch is v3 elsewhere. */

  function canonSkin(raw) {
    var s = String(raw || '').toLowerCase();
    if (s === 'live' || s === 'main') return 'glass';
    if (s === 'holo' || s === 'hologram') return 'holo';
    if (s === 'patch' || s === 'patchwork') return 'patch';
    return '';
  }

  function isHolo() {
    return html.classList.contains('theme-holo');
  }

  function syncButtons(on) {
    document.querySelectorAll('.orbit-mode-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.classList.toggle('is-holo', on);
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
    pauseWrapAnims(!isHolo() || reduce);
  }

  function apply(on, persist) {
    on = !!on;
    html.classList.toggle('theme-holo', on);
    html.classList.toggle('theme-glass', !on);
    html.setAttribute('data-orbit-skin', on ? 'holo' : 'glass');
    html.classList.add('orbit-skin-xfade');
    if (window.__orbitSkinXfadeT) clearTimeout(window.__orbitSkinXfadeT);
    window.__orbitSkinXfadeT = setTimeout(function () {
      html.classList.remove('orbit-skin-xfade');
    }, 520);
    if (persist !== false) {
      try { localStorage.setItem(KEY, on ? 'holo' : 'glass'); } catch (e) {}
      try {
        var u = new URL(location.href);
        u.searchParams.set('skin', on ? 'holo' : 'glass');
        if (history.replaceState) history.replaceState({}, '', u);
      } catch (e2) {}
    }
    syncButtons(on);
    syncMotion();
    if (typeof window.__ORBIT_SKIN_APPLY__ === 'function') {
      try { window.__ORBIT_SKIN_APPLY__(on); } catch (e) {}
    }
    window.dispatchEvent(new CustomEvent('orbit-skin-change', { detail: { holo: on, skin: on ? 'holo' : 'glass' } }));
  }

  function toggle() {
    apply(!isHolo());
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
    var bootQ = canonSkin(new URLSearchParams(location.search).get('skin'));
    if (bootQ === 'holo') apply(true, true);
    else if (bootQ === 'glass' || bootQ === 'patch') apply(false, true);
    else apply(isHolo(), false);
  } catch (e) {
    apply(isHolo(), false);
  }

  window.__ORBIT_SKIN_TOGGLE__ = toggle;
  window.__ORBIT_SKIN_SET__ = apply;
})();
