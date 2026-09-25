/* Sfumato QoL: holo skin from Orbit, eyedropper in the dock top bar, key R. */
(function () {
  'use strict';

  var KEY = 'orbitSkin';
  var PICK_SVG =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12"/>' +
      '<path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z"/>' +
    '</svg>';

  function querySkin() {
    try {
      return new URLSearchParams(location.search).get('skin') || '';
    } catch (e) {
      return '';
    }
  }

  function wantHolo() {
    try {
      var q = querySkin();
      if (q === 'holo') return true;
      if (q === 'live') return false;
      if (localStorage.getItem(KEY) === 'live') return false;
    } catch (e) {}
    return true;
  }

  function persistSkin(on) {
    try {
      var q = querySkin();
      if (q === 'holo' || q === 'live') localStorage.setItem(KEY, q);
      else localStorage.setItem(KEY, on ? 'holo' : 'live');
    } catch (e) {}
  }

  function applyHolo() {
    var on = wantHolo();
    document.documentElement.classList.toggle('theme-holo', on);
    persistSkin(on);
    try {
      var theme = document.querySelector('meta[name="theme-color"]');
      if (theme) theme.setAttribute('content', on ? '#050608' : '#06040f');
    } catch (e) {}
    retargetOrbitLinks(on);
  }

  function orbitHref(on) {
    return '/?skin=' + (on ? 'holo' : 'live');
  }

  function retargetOrbitLinks(on) {
    var href = orbitHref(on);
    document.querySelectorAll('a.dock-logo-wrap, a[aria-label="Orbit home"], a[href="https://www.anchorturtle.com/"], a[href="https://www.anchorturtle.com"]').forEach(function (a) {
      a.setAttribute('href', href);
    });
    var home = document.getElementById('sfumato-orbit-home');
    if (home) home.setAttribute('href', href);
  }

  function nativePick() {
    return document.querySelector('.mix-toolbar [aria-label="Pick"]');
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
    if (!top) return;
    var on = pickOn();
    top.classList.toggle('is-on', on);
    top.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function createPickButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'sfumato-pick';
    btn.className = 'sfumato-pick analog-btn analog-chip';
    btn.setAttribute('aria-label', 'Eyedropper');
    btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Eyedropper (R)';
    btn.innerHTML = PICK_SVG + '<span>Pick</span><kbd id="sfumato-pick-hint">R</kbd>';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!activatePick()) {
        btn.classList.add('is-wait');
        setTimeout(function () {
          btn.classList.remove('is-wait');
          activatePick();
        }, 80);
      }
    });
    return btn;
  }

  function ensureBar() {
    var dock = document.querySelector('.studio-dock');
    var nav = dock && dock.querySelector('.dock-nav');
    var btn = document.getElementById('sfumato-pick');
    if (!btn) btn = createPickButton();

    if (nav) {
      if (btn.parentElement !== nav) nav.insertBefore(btn, nav.firstChild);
      var leftover = document.getElementById('sfumato-topbar');
      if (leftover) leftover.remove();
      syncTop();
      return;
    }

    var bar = document.getElementById('sfumato-topbar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'sfumato-topbar';
      var home = document.createElement('a');
      home.id = 'sfumato-orbit-home';
      home.textContent = 'Orbit';
      home.href = orbitHref(wantHolo());
      bar.appendChild(home);
      document.body.appendChild(bar);
    }
    if (btn.parentElement !== bar) bar.appendChild(btn);
    syncTop();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'r' && e.key !== 'R') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault();
    if (!activatePick()) ensureBar();
  }, true);

  var obs = null;
  function watch() {
    applyHolo();
    ensureBar();
    syncTop();
    if (obs || !document.body) return;
    obs = new MutationObserver(function () {
      ensureBar();
      syncTop();
      retargetOrbitLinks(wantHolo());
    });
    obs.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-pressed', 'class']
    });
  }

  applyHolo();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watch);
  } else {
    watch();
  }
  window.addEventListener('load', watch);
  setTimeout(watch, 400);
  setTimeout(watch, 1200);
})();
