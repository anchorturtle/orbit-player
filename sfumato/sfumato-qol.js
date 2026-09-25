/* Sfumato QoL: holo skin from Orbit, eyedropper in the top bar, key R. */
(function () {
  'use strict';

  function wantHolo() {
    try {
      var q = new URLSearchParams(location.search).get('skin');
      if (q === 'holo') return true;
      if (q === 'live') return false;
      var stored = localStorage.getItem('orbitSkin');
      if (stored === 'holo') return true;
      if (stored === 'live') return false;
    } catch (e) {}
    try {
      if (document.referrer && /[?&]skin=holo\b/.test(document.referrer)) return true;
    } catch (e2) {}
    return false;
  }

  function applyHolo() {
    var on = wantHolo();
    document.documentElement.classList.toggle('theme-holo', on);
    try {
      var theme = document.querySelector('meta[name="theme-color"]');
      if (theme) theme.setAttribute('content', on ? '#050608' : '#06040f');
    } catch (e) {}
  }

  function nativePick() {
    return document.querySelector('.mix-toolbar [aria-label="Pick"], button[aria-label="Pick"]');
  }

  function pickOn() {
    var btn = nativePick();
    return !!(btn && (btn.getAttribute('aria-pressed') === 'true' || btn.classList.contains('is-on')));
  }

  function activatePick() {
    var btn = nativePick();
    if (btn) {
      btn.click();
      syncTop();
      return true;
    }
    return false;
  }

  function syncTop() {
    var top = document.getElementById('sfumato-pick');
    if (top) top.classList.toggle('is-on', pickOn());
  }

  function ensureBar() {
    if (document.getElementById('sfumato-topbar')) {
      syncTop();
      return;
    }
    var bar = document.createElement('div');
    bar.id = 'sfumato-topbar';
    bar.innerHTML =
      '<a href="/?skin=' + (wantHolo() ? 'holo' : 'live') + '">Orbit</a>' +
      '<button type="button" id="sfumato-pick" aria-label="Eyedropper" title="Eyedropper (R)">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
          '<path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12"/>' +
          '<path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z"/>' +
        '</svg>' +
        '<span>Pick</span>' +
      '</button>' +
      '<span id="sfumato-pick-hint">R</span>';
    document.body.appendChild(bar);
    document.getElementById('sfumato-pick').addEventListener('click', function (e) {
      e.preventDefault();
      activatePick();
    });
    syncTop();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'r' && e.key !== 'R') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault();
    activatePick();
  }, true);

  var obs = null;
  function watch() {
    ensureBar();
    syncTop();
    if (obs || !document.body) return;
    obs = new MutationObserver(function () { syncTop(); });
    obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'class'] });
  }

  applyHolo();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyHolo();
      watch();
    });
  } else {
    watch();
  }
  window.addEventListener('load', watch);
  setTimeout(watch, 400);
  setTimeout(watch, 1200);
})();
