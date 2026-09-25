/* Sfumato live QoL: Pick + R eyedropper on linen and mix. No Orbit/holo chrome. */
(function () {
  'use strict';

  var PICK_SVG =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12"/>' +
      '<path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z"/>' +
    '</svg>';

  var lastMix = 'Drop';
  var injecting = false;

  function isOn(el) {
    return !!(el && (el.getAttribute('aria-pressed') === 'true' || el.classList.contains('is-on')));
  }

  function nativePick() {
    return document.querySelector('.mix-toolbar [aria-label="Pick"]');
  }

  function nativeSample() {
    return document.querySelector('.focus-hud [aria-label="Sample"], .tool-menu-grid button.is-on, button[aria-label="Sample"]');
  }

  function sampleOn() {
    var hud = document.querySelector('.focus-hud [aria-label="Sample"]');
    if (isOn(hud)) return true;
    var labeled = document.querySelector('button[aria-label="Sample"]');
    return isOn(labeled);
  }

  function pickOn() {
    return isOn(nativePick()) || sampleOn();
  }

  function rememberMix() {
    var on = document.querySelector('.mix-toolbar [aria-pressed="true"], .mix-toolbar .mix-tool.is-on');
    if (on) {
      var label = on.getAttribute('aria-label');
      if (label && label !== 'Pick') lastMix = label;
    }
  }

  function clickMix(label) {
    var btn = document.querySelector('.mix-toolbar [aria-label="' + label + '"]');
    if (btn) btn.click();
    return !!btn;
  }

  function activatePick() {
    var mix = nativePick();
    if (!mix) return false;
    if (isOn(mix)) {
      clickMix(lastMix || 'Drop');
    } else {
      rememberMix();
      mix.click();
      var sample = document.querySelector('.focus-hud [aria-label="Sample"]');
      if (sample && !isOn(sample)) sample.click();
    }
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
      document.body.appendChild(bar);
    }
    if (btn.parentElement !== bar) bar.appendChild(btn);
    placeBar(bar);
    syncTop();
  }

  function replayWithAlt(e) {
    if (injecting || e.altKey) return;
    if (!document.documentElement.classList.contains('is-sfumato-pick')) return;
    if (!e.target || !e.target.closest || !e.target.closest('[data-paint-canvas]')) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    injecting = true;
    try {
      var ctor = e.constructor || window.PointerEvent;
      var ev = new ctor(e.type, {
        bubbles: true,
        cancelable: true,
        pointerId: e.pointerId,
        pointerType: e.pointerType,
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        button: e.button,
        buttons: e.buttons,
        pressure: e.pressure,
        altKey: true,
        isPrimary: e.isPrimary
      });
      e.target.dispatchEvent(ev);
    } finally {
      injecting = false;
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'r' && e.key !== 'R') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault();
    if (!activatePick()) ensureBar();
  }, true);

  document.addEventListener('pointerdown', replayWithAlt, true);
  document.addEventListener('pointermove', replayWithAlt, true);

  var obs = null;
  function watch() {
    ensureBar();
    syncTop();
    if (obs || !document.body) return;
    obs = new MutationObserver(function (records) {
      var i;
      for (i = 0; i < records.length; i++) {
        var rec = records[i];
        var t = rec.target;
        if (t && (t.id === 'sfumato-pick' || t.id === 'sfumato-topbar')) continue;
        if (rec.type === 'attributes') {
          syncTop();
          return;
        }
      }
      ensureBar();
      syncTop();
    });
    obs.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-pressed', 'class']
    });
    window.addEventListener('resize', function () {
      placeBar(document.getElementById('sfumato-topbar'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watch);
  } else {
    watch();
  }
  window.addEventListener('load', watch);
  setTimeout(watch, 400);
  setTimeout(watch, 1200);
})();
