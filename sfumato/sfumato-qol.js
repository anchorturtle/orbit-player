/* Sfumato QoL (local holo-ready): eyedropper in the dock top bar, key R.
   Skin chrome is CSS-only under html.theme-holo. Does not touch Orbit glass. */
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

  function persistExplicitSkin() {
    try {
      var q = querySkin();
      if (q === 'holo' || q === 'live') localStorage.setItem(KEY, q);
    } catch (e) {}
  }

  function applyHolo() {
    var on = wantHolo();
    document.documentElement.classList.toggle('theme-holo', on);
    persistExplicitSkin();
    try {
      var theme = document.querySelector('meta[name="theme-color"]');
      if (theme) theme.setAttribute('content', on ? '#050608' : '#06040f');
    } catch (e) {}
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
    if (!btn) return false;
    btn.click();
    syncTop();
    return true;
  }

  function syncTop() {
    var on = pickOn();
    var root = document.documentElement;
    if (root.classList.contains('is-sfumato-pick') !== on) {
      root.classList.toggle('is-sfumato-pick', on);
    }
    var top = document.getElementById('sfumato-pick');
    if (!top) return;
    var pressed = on ? 'true' : 'false';
    if (top.classList.contains('is-on') !== on) top.classList.toggle('is-on', on);
    if (top.getAttribute('aria-pressed') !== pressed) top.setAttribute('aria-pressed', pressed);
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
        setTimeout(activatePick, 80);
      }
    });
    return btn;
  }

  function placeBar(bar) {
    var dock = document.querySelector('.studio-dock');
    var nav = dock && dock.querySelector('.dock-nav');
    if (!bar) return;
    if (nav) {
      var r = nav.getBoundingClientRect();
      bar.style.top = Math.max(6, r.top) + 'px';
      bar.style.left = Math.max(8, r.left) + 'px';
      return;
    }
    if (dock) {
      var d = dock.getBoundingClientRect();
      bar.style.top = Math.max(6, d.top + 6) + 'px';
      bar.style.left = Math.max(8, d.left + 118) + 'px';
    }
  }

  function ensureBar() {
    var bar = document.getElementById('sfumato-topbar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'sfumato-topbar';
      document.body.appendChild(bar);
    }
    var btn = document.getElementById('sfumato-pick');
    if (!btn) {
      btn = createPickButton();
      bar.appendChild(btn);
    } else if (btn.parentElement !== bar) {
      bar.appendChild(btn);
    }
    placeBar(bar);
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
    obs = new MutationObserver(function (records) {
      var i;
      for (i = 0; i < records.length; i++) {
        var rec = records[i];
        var t = rec.target;
        if (t && (t.id === 'sfumato-pick' || t.id === 'sfumato-topbar')) continue;
        if (rec.type === 'attributes' && t && t.getAttribute && t.getAttribute('aria-label') === 'Pick') {
          syncTop();
          return;
        }
      }
    });
    obs.observe(document.body, {
      subtree: true,
      childList: false,
      attributes: true,
      attributeFilter: ['aria-pressed']
    });
    window.addEventListener('resize', function () {
      placeBar(document.getElementById('sfumato-topbar'));
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
