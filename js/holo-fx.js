/* Holo FX: comet window tubes + non-layout HUD field.
   Never sizes windows. Never transforms .win. Never draws globe strings. */
(function () {
  'use strict';

  var html = document.documentElement;
  var mx = 0.5;
  var my = 0.42;
  var fxTimer = 0;
  var FX = ['chroma', 'trail', 'melt', 'pulse', 'well'];
  var MOB = 768;
  var tubes = null;
  var hud = null;
  var ns = 'http://www.w3.org/2000/svg';
  var winPhase = {};

  function isHolo() {
    return html.classList.contains('theme-holo');
  }
  function still() {
    return html.classList.contains('holo-still');
  }
  function audioEl() {
    return document.getElementById('audio-player');
  }
  function playing() {
    var a = audioEl();
    return !!(a && !a.paused && !a.ended);
  }
  function desktop() {
    return window.innerWidth >= MOB;
  }

  function ensureTubes() {
    tubes = document.getElementById('holo-tubes');
    if (!tubes) {
      tubes = document.createElementNS(ns, 'svg');
      tubes.id = 'holo-tubes';
      tubes.setAttribute('aria-hidden', 'true');
      document.body.appendChild(tubes);
    }
    if (!tubes.querySelector('#holo-tube-draw')) {
      tubes.innerHTML =
        '<defs>' +
          '<filter id="holo-comet-glow" x="-40%" y="-40%" width="180%" height="180%">' +
            '<feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="b"/>' +
            '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
          '</filter>' +
          '<filter id="holo-corner-fade" x="-12%" y="-12%" width="124%" height="124%">' +
            '<feGaussianBlur in="SourceGraphic" stdDeviation="1.8"/>' +
          '</filter>' +
        '</defs>' +
        '<g id="holo-tube-draw"></g>';
    }
    return tubes;
  }

  function ensureHud() {
    hud = document.getElementById('holo-hud');
    if (hud) return hud;
    hud = document.createElementNS(ns, 'svg');
    hud.id = 'holo-hud';
    hud.setAttribute('aria-hidden', 'true');
    document.body.appendChild(hud);
    return hud;
  }

  function killStrings() {
    var s = document.getElementById('holo-strings');
    if (s && s.parentNode) s.parentNode.removeChild(s);
  }

  function layoutBox(el) {
    /* Overlay draw only. Never write this back onto .win. */
    var left = parseFloat(el.style.left);
    var top = parseFloat(el.style.top);
    return {
      left: Number.isFinite(left) ? left : (el.offsetLeft || 0),
      top: Number.isFinite(top) ? top : (el.offsetTop || 0),
      width: el.offsetWidth || 0,
      height: el.offsetHeight || 0
    };
  }

  function edgePoint(x, y, w, h, u) {
    var peri = 2 * (w + h);
    var t = ((u % peri) + peri) % peri;
    if (t < w) return { x: x + t, y: y, nx: 0, ny: -1 };
    t -= w;
    if (t < h) return { x: x + w, y: y + t, nx: 1, ny: 0 };
    t -= h;
    if (t < w) return { x: x + w - t, y: y + h, nx: 0, ny: 1 };
    t -= w;
    return { x: x, y: y + h - t, nx: -1, ny: 0 };
  }

  function cornerDamp(u, peri, w, h) {
    var t = ((u % peri) + peri) % peri;
    var corners = [0, w, w + h, 2 * w + h];
    var i, d, min = 9999;
    for (i = 0; i < 4; i++) {
      d = Math.abs(t - corners[i]);
      d = Math.min(d, peri - d);
      if (d < min) min = d;
    }
    return Math.min(1, min / 18);
  }

  function mouseNearBox(r) {
    var px = mx * window.innerWidth;
    var py = my * window.innerHeight;
    var dx = 0;
    var dy = 0;
    if (px < r.left) dx = r.left - px;
    else if (px > r.left + r.width) dx = px - (r.left + r.width);
    if (py < r.top) dy = r.top - py;
    else if (py > r.top + r.height) dy = py - (r.top + r.height);
    return Math.exp(-Math.sqrt(dx * dx + dy * dy) / 72);
  }

  function rubberAmp(ph, near) {
    if (ph.amp == null) {
      ph.amp = 0.45;
      ph.vel = 0;
    }
    var target = still() ? 0 : (0.35 + near * 5.6);
    ph.vel = ph.vel * 0.7 + (target - ph.amp) * 0.18;
    ph.amp += ph.vel;
    if (ph.amp < 0) ph.amp = 0;
    return ph.amp;
  }

  function wavyRect(x, y, w, h, t, winIdx, amp) {
    var peri = 2 * (w + h);
    var n = Math.max(64, Math.min(180, (peri / 6) | 0));
    var d = '';
    var i, u, p, wave, px, py, dx, dy, local, mag, corner;
    px = mx * window.innerWidth;
    py = my * window.innerHeight;
    for (i = 0; i <= n; i++) {
      u = (i / n) * peri;
      p = edgePoint(x, y, w, h, u);
      dx = p.x - px;
      dy = p.y - py;
      local = 1 / (1 + (dx * dx + dy * dy) * 0.000018);
      corner = cornerDamp(u, peri, w, h);
      wave = Math.sin(u * 0.07 + t * (0.55 + winIdx * 0.09) + winIdx * 1.4);
      wave += 0.35 * Math.sin(u * 0.16 + t * 1.15 + winIdx);
      mag = amp * corner * (0.55 + local * 1.2);
      if (i === 0) d += 'M';
      else d += 'L';
      d += (p.x + p.nx * wave * mag).toFixed(2) + ',' + (p.y + p.ny * wave * mag).toFixed(2);
    }
    return d + 'Z';
  }

  function tickMarks(x, y, w, h) {
    var ch = 2.6;
    function L(cx, cy, armH, armV, sx, sy) {
      return '<polyline class="holo-tube-tick" points="' +
        (cx + armH * sx).toFixed(1) + ',' + cy.toFixed(1) + ' ' +
        (cx + ch * sx).toFixed(1) + ',' + cy.toFixed(1) + ' ' +
        cx.toFixed(1) + ',' + (cy + ch * sy).toFixed(1) + ' ' +
        cx.toFixed(1) + ',' + (cy + armV * sy).toFixed(1) + '"/>';
    }
    return L(x, y, 20, 10, 1, 1) +
      L(x + w, y, 10, 22, -1, 1) +
      L(x + w, y + h, 18, 12, -1, -1) +
      L(x, y + h, 12, 24, 1, -1);
  }

  function phaseFor(el, idx) {
    var id = el.id || ('w' + idx);
    if (!winPhase[id]) {
      winPhase[id] = {
        seed: (idx * 0.618 + id.length * 0.17) % 1,
        dir: (idx % 2 === 0) ? 1 : -1,
        speed: 20 + (idx % 9) * 7 + (id.length % 5) * 2
      };
    }
    return winPhase[id];
  }

  function drawTubes() {
    if (!isHolo() || !desktop()) {
      if (tubes) {
        var g0 = tubes.querySelector('#holo-tube-draw');
        if (g0) g0.innerHTML = '';
        tubes.style.transform = '';
      }
      return;
    }
    ensureTubes();
    var w = window.innerWidth;
    var h = window.innerHeight;
    tubes.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    tubes.setAttribute('width', String(w));
    tubes.setAttribute('height', String(h));
    var t = performance.now() * 0.001;
    var htmlStr = '';
    var winIdx = 0;
    document.querySelectorAll('.win').forEach(function (el) {
      var st = window.getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return;
      var r = layoutBox(el);
      if (r.width < 12 || r.height < 12) return;
      var x = r.left + 1.2;
      var y = r.top + 1.2;
      var rw = Math.max(2, r.width - 2.4);
      var rh = Math.max(2, r.height - 2.4);
      var ph = phaseFor(el, winIdx);
      var amp = rubberAmp(ph, mouseNearBox(r));
      var pulse = still()
        ? 0.32
        : (0.26 + 0.38 * (0.5 + 0.5 * Math.sin(t * (0.42 + winIdx * 0.08) + ph.seed * 6.2832)));
      var off = still() ? ph.seed * 1000 : -(t * ph.speed * ph.dir + ph.seed * 1000);
      var d = wavyRect(x, y, rw, rh, t, winIdx, amp);
      var hx = (r.left - 1).toFixed(1);
      var hy = (r.top - 1).toFixed(1);
      var hw = (r.width + 2).toFixed(1);
      var hh = (r.height + 2).toFixed(1);
      htmlStr += '<path class="holo-tube-cornerhide" fill-rule="evenodd" d="M' +
        hx + ',' + hy + 'h' + hw + 'v' + hh + 'h-' + hw + 'Z ' + d + '"/>';
      htmlStr += '<path class="holo-tube-glass" d="' + d + '" pathLength="1000" style="stroke-opacity:' + pulse.toFixed(3) + '"/>';
      htmlStr += '<path class="holo-tube-ghost" d="' + d + '" pathLength="1000" stroke-dasharray="400 600" stroke-dashoffset="' + (off + 48).toFixed(1) + '"/>';
      htmlStr += '<path class="holo-tube-wake" d="' + d + '" pathLength="1000" stroke-dasharray="240 760" stroke-dashoffset="' + (off + 22).toFixed(1) + '"/>';
      htmlStr += '<path class="holo-tube-trail" d="' + d + '" pathLength="1000" stroke-dasharray="130 870" stroke-dashoffset="' + (off + 8).toFixed(1) + '"/>';
      htmlStr += '<path class="holo-tube-hot" d="' + d + '" pathLength="1000" stroke-dasharray="42 958" stroke-dashoffset="' + off.toFixed(1) + '"/>';
      htmlStr += '<path class="holo-tube-ember" d="' + d + '" pathLength="1000" stroke-dasharray="8 992" stroke-dashoffset="' + (off - 4).toFixed(1) + '"/>';
      htmlStr += tickMarks(x, y, rw, rh);
      winIdx++;
    });
    tubes.querySelector('#holo-tube-draw').innerHTML = htmlStr;
    tubes.style.transform = '';
  }

  function drawHud() {
    if (!isHolo() || !desktop() || still()) {
      if (hud) hud.innerHTML = '';
      return;
    }
    ensureHud();
    var w = window.innerWidth;
    var h = window.innerHeight;
    hud.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    hud.setAttribute('width', String(w));
    hud.setAttribute('height', String(h));
    var t = performance.now() * 0.001;
    var audio = window.__ORBIT_AUDIO__ || { bass: 0, level: 0 };
    var bass = Number(audio.bass) || 0;
    var px = mx * w;
    var py = my * h;
    var i, x, y, s, dx, dy, pull, d, n, k;
    var holeR = Math.min(w, h) * 0.28;
    var htmlStr = '<defs><mask id="holo-hud-hole"><rect width="' + w + '" height="' + h + '" fill="#fff"/>' +
      '<ellipse cx="' + (w * 0.5).toFixed(1) + '" cy="' + (h * 0.46).toFixed(1) + '" rx="' + holeR.toFixed(1) + '" ry="' + (holeR * 0.92).toFixed(1) + '" fill="#000"/></mask></defs>' +
      '<g mask="url(#holo-hud-hole)">';
    for (i = 0; i < 6; i++) {
      y = h * (0.14 + i * 0.13);
      d = '';
      n = 28;
      for (k = 0; k <= n; k++) {
        x = (k / n) * w;
        dx = x - px;
        dy = y - py;
        pull = Math.exp(-(dx * dx + dy * dy) / (w * w * 0.18));
        s = Math.sin(x * 0.012 + t * (0.35 + i * 0.05) + i) * (7 + bass * 10);
        s += pull * (py - y) * 0.22;
        if (k === 0) d += 'M';
        else d += 'L';
        d += x.toFixed(1) + ',' + (y + s).toFixed(1);
      }
      htmlStr += '<path class="holo-hud-wave" d="' + d + '" style="opacity:' + (0.08 + (i % 2) * 0.04 + bass * 0.06).toFixed(3) + '"/>';
    }
    for (i = 0; i < 4; i++) {
      x = w * (0.18 + i * 0.22);
      d = '';
      n = 22;
      for (k = 0; k <= n; k++) {
        y = (k / n) * h;
        dx = x - px;
        dy = y - py;
        pull = Math.exp(-(dx * dx + dy * dy) / (h * h * 0.22));
        s = Math.sin(y * 0.014 + t * 0.28 + i * 1.3) * 6;
        s += pull * (px - x) * 0.18;
        if (k === 0) d += 'M';
        else d += 'L';
        d += (x + s).toFixed(1) + ',' + y.toFixed(1);
      }
      htmlStr += '<path class="holo-hud-wave" d="' + d + '" style="opacity:' + (0.06 + bass * 0.05).toFixed(3) + '"/>';
    }
    hud.innerHTML = htmlStr + '</g>';
    hud.style.transform = 'translate3d(' + ((mx - 0.5) * 10).toFixed(2) + 'px,' + ((my - 0.5) * 7).toFixed(2) + 'px,0)';
  }

  function clearFx() {
    if (fxTimer) {
      clearTimeout(fxTimer);
      fxTimer = 0;
    }
    FX.forEach(function (n) {
      html.classList.remove('holo-fx-' + n);
    });
  }

  function runPulse() {
    if (!isHolo() || !playing() || still() || !desktop()) return;
    var name = FX[(Math.random() * FX.length) | 0];
    html.classList.add('holo-fx-' + name);
    fxTimer = setTimeout(function () {
      html.classList.remove('holo-fx-' + name);
      schedule();
    }, 1600 + Math.random() * 2000);
  }

  function schedule() {
    if (fxTimer) clearTimeout(fxTimer);
    if (!isHolo() || !playing() || still()) return;
    fxTimer = setTimeout(runPulse, 6500 + Math.random() * 10000);
  }

  function tick() {
    requestAnimationFrame(tick);
    if (!isHolo()) {
      html.classList.remove('holo-playing');
      if (tubes) {
        var g = tubes.querySelector('#holo-tube-draw');
        if (g) g.innerHTML = '';
        tubes.style.transform = '';
      }
      if (hud) hud.innerHTML = '';
      return;
    }
    killStrings();
    html.classList.toggle('holo-playing', !still() && playing());
    var audio = window.__ORBIT_AUDIO__ || { bass: 0, level: 0 };
    html.style.setProperty('--holo-bass', String(audio.bass || 0));
    html.style.setProperty('--holo-px', mx.toFixed(4));
    html.style.setProperty('--holo-py', my.toFixed(4));
    drawTubes();
    drawHud();
  }

  document.addEventListener('pointermove', function (e) {
    mx = e.clientX / Math.max(1, window.innerWidth);
    my = e.clientY / Math.max(1, window.innerHeight);
  }, { passive: true });

  document.addEventListener('pointerdown', function (e) {
    if (!isHolo()) return;
    var bar = e.target && e.target.closest && e.target.closest('.win-bar');
    var win = bar && bar.closest('.win');
    if (win) win.classList.add('holo-dragging');
  }, true);

  function endDrag() {
    document.querySelectorAll('.win.holo-dragging').forEach(function (w) {
      w.classList.remove('holo-dragging');
    });
  }
  document.addEventListener('pointerup', endDrag, true);
  document.addEventListener('pointercancel', endDrag, true);

  document.addEventListener('play', function () {
    if (isHolo()) {
      html.classList.add('holo-playing');
      schedule();
    }
  }, true);
  document.addEventListener('pause', function () {
    html.classList.remove('holo-playing');
    clearFx();
  }, true);
  document.addEventListener('ended', function () {
    html.classList.remove('holo-playing');
    clearFx();
  }, true);

  window.addEventListener('orbit-skin-change', function () {
    if (!isHolo()) {
      html.classList.remove('holo-playing');
      clearFx();
      killStrings();
      if (tubes) {
        var g = tubes.querySelector('#holo-tube-draw');
        if (g) g.innerHTML = '';
      }
      if (hud) hud.innerHTML = '';
    } else if (playing()) {
      schedule();
    }
  });

  requestAnimationFrame(tick);
})();
