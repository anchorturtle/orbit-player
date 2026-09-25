/* Holo FX: comet window tubes + non-layout HUD field.
   Never sizes windows. Never transforms .win. Never draws globe strings. */
(function () {
  'use strict';

  var html = document.documentElement;
  var mx = 0.5;
  var my = 0.42;
  var fxTimer = 0;
  var FX = ['chroma', 'trail', 'melt', 'pulse', 'well'];
  var TRIP = ['warp', 'melt', 'chroma', 'grain', 'flare', 'fall', 'orbit', 'pulse', 'well', 'drift'];
  var tripTimer = 0;
  var tripOn = [];
  var lastTripKey = '';
  var MOB = 768;
  var tubes = null;
  var hud = null;
  var ns = 'http://www.w3.org/2000/svg';
  var winPhase = {};
  var lastLetterMove = 0;
  var letterWrapAt = 0;
  var letterFlipAt = 0;
  var letterMode = 'fuse';
  var lettersBooted = false;
  var LETTER_SEL = '#fp-title, #focal-title, .player-title, #focal-artist, .player-artist';
  var tubeAt = 0;
  var idleGlow = null;
  var idlePing = null;
  var pointerSeen = false;
  var IDLE_MS = 480;

  function unwrapLetters() {
    document.querySelectorAll('[data-holo-ch="1"]').forEach(function (el) {
      var src = el.getAttribute('data-holo-src');
      el.removeAttribute('data-holo-ch');
      el.removeAttribute('data-holo-src');
      el.textContent = src != null ? src : el.textContent;
    });
  }

  function wrapOneLetters(el) {
    if (!el) return;
    var live = el.textContent || '';
    if (!live) return;
    if (live.length > 120) return;
    if (el.getAttribute('data-holo-ch') === '1' && el.getAttribute('data-holo-src') === live) return;
    el.setAttribute('data-holo-src', live);
    el.setAttribute('data-holo-ch', '1');
    el.style.setProperty('--n', String(Math.max(1, live.length)));
    if (el.id === 'focal-title') {
      el.classList.add('holo-title-bg');
      el.classList.remove('holo-title-pl');
    } else if (el.id === 'fp-title' || el.classList.contains('player-title')) {
      el.classList.add('holo-title-pl');
      el.classList.remove('holo-title-bg');
    }
    el.textContent = '';
    var i = 0;
    var parts = live.split(/(\s+)/);
    var p, word, span, j, ch;
    for (p = 0; p < parts.length; p++) {
      if (!parts[p]) continue;
      if (/^\s+$/.test(parts[p])) {
        span = document.createElement('span');
        span.className = 'holo-sp';
        span.textContent = ' ';
        el.appendChild(span);
        continue;
      }
      word = document.createElement('span');
      word.className = 'holo-word';
      for (j = 0; j < parts[p].length; j++) {
        ch = parts[p].charAt(j);
        span = document.createElement('span');
        span.className = 'holo-ch';
        span.style.setProperty('--i', String(i));
        span.textContent = ch;
        word.appendChild(span);
        i++;
      }
      el.appendChild(word);
    }
  }

  function wrapLetters() {
    if (!isHolo()) return;
    if (!lettersBooted) {
      unwrapLetters();
      lettersBooted = true;
    }
    document.querySelectorAll(LETTER_SEL).forEach(wrapOneLetters);
  }

  function tickLetters(nowMs) {
    if (nowMs > letterWrapAt) {
      letterWrapAt = nowMs + 900;
      wrapLetters();
    }
    var moving = (nowMs - lastLetterMove) < 500;
    html.classList.toggle('holo-letter-clear', moving);
    html.classList.toggle('holo-letter-drift', !moving);
    tickTrip(nowMs);
    if (!moving && playing()) {
      if (nowMs > letterFlipAt) {
        letterMode = letterMode === 'fuse' ? 'melt' : 'fuse';
        letterFlipAt = nowMs + 8000;
      }
      html.classList.toggle('holo-letter-fuse', letterMode === 'fuse');
      html.classList.toggle('holo-letter-melt', letterMode === 'melt');
    } else {
      html.classList.remove('holo-letter-fuse');
      html.classList.remove('holo-letter-melt');
    }
  }

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
    if (!tubes.querySelector('#holo-tube-draw') || tubes.getAttribute('data-holo-tubes') !== 'h32') {
      tubes.setAttribute('data-holo-tubes', 'h32');
      tubes.innerHTML =
        '<defs>' +
          '<filter id="holo-plasma-soft" x="-120%" y="-120%" width="340%" height="340%" color-interpolation-filters="sRGB">' +
            '<feGaussianBlur in="SourceGraphic" stdDeviation="7.2" result="b"/>' +
            '<feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1.3 0 0  0 0 0 1.15 0" result="g"/>' +
            '<feMerge><feMergeNode in="g"/><feMergeNode in="g"/></feMerge>' +
          '</filter>' +
          '<filter id="holo-plasma-glow" x="-90%" y="-90%" width="280%" height="280%" color-interpolation-filters="sRGB">' +
            '<feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="b"/>' +
            '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
          '</filter>' +
          '<filter id="holo-plasma-core" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">' +
            '<feGaussianBlur in="SourceGraphic" stdDeviation="1.1" result="b"/>' +
            '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
          '</filter>' +
        '</defs>' +
        '<g id="holo-tube-draw"></g>';
    }
    return tubes;
  }

  function stripWinTubes() {
    document.querySelectorAll('svg.holo-win-tube').forEach(function (svg) {
      if (svg.parentNode) svg.parentNode.removeChild(svg);
    });
  }

  function ensureWinTube(el) {
    var svg = el.querySelector(':scope > svg.holo-win-tube');
    if (!svg) {
      svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('class', 'holo-win-tube');
      svg.setAttribute('aria-hidden', 'true');
      el.insertBefore(svg, el.firstChild);
    }
    return svg;
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
    var p = document.getElementById('holo-plates');
    if (p && p.parentNode) p.parentNode.removeChild(p);
  }

  function layoutBox(el) {
    /* Overlay + clip-path only. Never write this back onto .win.
       Clipped windows cannot use getBoundingClientRect (it shrinks next frame).
       Dock is not clipped and is centered via CSS (left:0;right:0;margin:auto),
       so offsetLeft is 0 — must read the painted box. */
    if (el.id === 'dock-win') {
      var br = el.getBoundingClientRect();
      return { left: br.left, top: br.top, width: br.width, height: br.height };
    }
    var sl = el.style.left;
    var st = el.style.top;
    var left = (sl && sl.indexOf('px') !== -1) ? parseFloat(sl) : NaN;
    var top = (st && st.indexOf('px') !== -1) ? parseFloat(st) : NaN;
    return {
      left: Number.isFinite(left) ? left : (el.offsetLeft || 0),
      top: Number.isFinite(top) ? top : (el.offsetTop || 0),
      width: el.offsetWidth || 0,
      height: el.offsetHeight || 0
    };
  }

  function offsetPath(d, dx, dy) {
    return d.replace(/(-?[\d.]+),(-?[\d.]+)/g, function (_, px, py) {
      return (parseFloat(px) + dx).toFixed(2) + ',' + (parseFloat(py) + dy).toFixed(2);
    });
  }

  function smoothClosed(pts) {
    var n = pts.length;
    if (n < 3) return '';
    function at(i) {
      return pts[(i + n) % n];
    }
    var d = 'M' + pts[0].x.toFixed(2) + ',' + pts[0].y.toFixed(2);
    var i, p0, p1, p2, p3;
    for (i = 0; i < n; i++) {
      p0 = at(i - 1);
      p1 = at(i);
      p2 = at(i + 1);
      p3 = at(i + 2);
      d += 'C' +
        (p1.x + (p2.x - p0.x) / 6).toFixed(2) + ',' + (p1.y + (p2.y - p0.y) / 6).toFixed(2) + ' ' +
        (p2.x - (p3.x - p1.x) / 6).toFixed(2) + ',' + (p2.y - (p3.y - p1.y) / 6).toFixed(2) + ' ' +
        p2.x.toFixed(2) + ',' + p2.y.toFixed(2);
    }
    return d + 'Z';
  }

  function clipWin(el, dLocal) {
    if (!dLocal) {
      el.style.clipPath = '';
      el.style.webkitClipPath = '';
      return;
    }
    var v = 'path("' + dLocal + '")';
    el.style.clipPath = v;
    el.style.webkitClipPath = v;
  }

  function clearAllWinClips() {
    document.querySelectorAll('.win').forEach(function (el) {
      clipWin(el, '');
    });
  }

  function audioStim() {
    if (still()) return 0;
    var melody = Number(window.__HOLO_MELODY__);
    if (isFinite(melody)) return Math.max(0, Math.min(1, melody));
    var a = window.__ORBIT_AUDIO__ || { mid: 0, high: 0, stim: 0 };
    if (typeof a.mid === 'number' || typeof a.high === 'number') {
      return Math.max(0, Math.min(1, (Number(a.mid) || 0) * 0.58 + (Number(a.high) || 0) * 0.42));
    }
    return 0;
  }

  function edgePoint(x, y, w, h, u) {
    var peri = 2 * (w + h);
    var t = ((u % peri) + peri) % peri;
    var r = Math.min(22, w * 0.2, h * 0.2);
    var s, th, cx, cy;
    if (r >= 7) {
      if (t <= r || t >= peri - r) {
        s = (t <= r) ? (t + r) / (2 * r) : (t - (peri - r)) / (2 * r);
        th = Math.PI + s * (Math.PI / 2);
        cx = x + r;
        cy = y + r;
        return { x: cx + r * Math.cos(th), y: cy + r * Math.sin(th), nx: Math.cos(th), ny: Math.sin(th) };
      }
      if (t >= w - r && t <= w + r) {
        s = (t - (w - r)) / (2 * r);
        th = -Math.PI / 2 + s * (Math.PI / 2);
        cx = x + w - r;
        cy = y + r;
        return { x: cx + r * Math.cos(th), y: cy + r * Math.sin(th), nx: Math.cos(th), ny: Math.sin(th) };
      }
      if (t >= w + h - r && t <= w + h + r) {
        s = (t - (w + h - r)) / (2 * r);
        th = s * (Math.PI / 2);
        cx = x + w - r;
        cy = y + h - r;
        return { x: cx + r * Math.cos(th), y: cy + r * Math.sin(th), nx: Math.cos(th), ny: Math.sin(th) };
      }
      if (t >= 2 * w + h - r && t <= 2 * w + h + r) {
        s = (t - (2 * w + h - r)) / (2 * r);
        th = Math.PI / 2 + s * (Math.PI / 2);
        cx = x + r;
        cy = y + h - r;
        return { x: cx + r * Math.cos(th), y: cy + r * Math.sin(th), nx: Math.cos(th), ny: Math.sin(th) };
      }
    }
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
    return Math.min(1, min / 28);
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

  function rubberAmp(ph, near, music) {
    if (ph.amp == null) {
      ph.amp = 0.45;
      ph.vel = 0;
      ph.music = 0;
      ph.mvel = 0;
    }
    var target = still() ? 0 : (0.35 + near * 5.6);
    ph.vel = ph.vel * 0.7 + (target - ph.amp) * 0.18;
    ph.amp += ph.vel;
    if (ph.amp < 0) ph.amp = 0;
    var mt = still() ? 0 : music * 2.1;
    ph.mvel = ph.mvel * 0.52 + (mt - ph.music) * 0.38;
    ph.music += ph.mvel;
    if (ph.music < 0) ph.music = 0;
    return ph;
  }

  function wavePoint(x, y, w, h, t, winIdx, idleAmp, punch, extraIn, slim, u, minOut) {
    var peri = 2 * (w + h);
    var uu = ((u % peri) + peri) % peri;
    var p = edgePoint(x, y, w, h, uu);
    var px = mx * window.innerWidth;
    var py = my * window.innerHeight;
    var dx = p.x - px;
    var dy = p.y - py;
    var local = 1 / (1 + (dx * dx + dy * dy) * 0.000014);
    var corner = cornerDamp(uu, peri, w, h);
    var wave = Math.sin(uu * 0.05 + t * (0.48 + winIdx * 0.07) + winIdx * 1.4);
    wave += 0.2 * Math.sin(uu * 0.11 + t * 0.9 + winIdx);
    var mag = idleAmp * corner * (0.5 + local * 1.15);
    mag += (punch || 0) * (0.28 + local * 1.7);
    if (slim) mag *= 0.28;
    extraIn = extraIn || 0;
    /* Light corner ease so the stroke can turn — not a hard L-notch / CAD anchor. */
    var disp = wave * mag - extraIn;
    if (!slim) disp -= (1 - corner) * 1.6;
    if (slim) {
      disp = Math.max(Math.min(disp, 2.2), -1.2);
    } else if (minOut == null) {
      /* Tube/comet sit on the plate edge. Never carve into title/buttons. */
      disp = Math.max(disp, -3);
    }
    if (minOut != null) disp = Math.max(disp, minOut);
    return {
      x: p.x + p.nx * disp,
      y: p.y + p.ny * disp,
      nx: p.nx,
      ny: p.ny,
      peri: peri
    };
  }

  function wavyRect(x, y, w, h, t, winIdx, idleAmp, punch, extraIn, slim, minOut) {
    var peri = 2 * (w + h);
    var n = Math.max(96, Math.min(240, (peri / 4) | 0));
    var pts = [];
    var i;
    for (i = 0; i < n; i++) {
      pts.push(wavePoint(x, y, w, h, t, winIdx, idleAmp, punch, extraIn, slim, (i / n) * peri, minOut));
    }
    return smoothClosed(pts);
  }

  function cometRibbon(x, y, w, h, t, winIdx, idleAmp, punch, slim, headU, halfW, tailLen, dir) {
    var n = 40;
    var left = [];
    var right = [];
    var i, s, wp, hw, env;
    dir = dir < 0 ? -1 : 1;
    for (i = 0; i < n; i++) {
      /* s=0 at the leading head, s=1 at the fading tail — always opposite velocity. */
      s = i / (n - 1);
      wp = wavePoint(x, y, w, h, t, winIdx, idleAmp, punch, 0, slim, headU - dir * s * tailLen);
      env = Math.pow(1 - s, 1.65);
      hw = halfW * env;
      left.push((wp.x + wp.nx * hw).toFixed(2) + ',' + (wp.y + wp.ny * hw).toFixed(2));
      right.push((wp.x - wp.nx * hw).toFixed(2) + ',' + (wp.y - wp.ny * hw).toFixed(2));
    }
    return 'M' + left.join('L') + 'L' + right.reverse().join('L') + 'Z';
  }

  function cometGradient(id, hx, hy, r) {
    return '<radialGradient id="' + id + '" gradientUnits="userSpaceOnUse" cx="' +
      hx.toFixed(2) + '" cy="' + hy.toFixed(2) + '" r="' + r.toFixed(1) + '">' +
      '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>' +
      '<stop offset="6%" stop-color="#F4F8FF" stop-opacity="0.98"/>' +
      '<stop offset="16%" stop-color="#B8D0FF" stop-opacity="0.78"/>' +
      '<stop offset="38%" stop-color="#4A8CFF" stop-opacity="0.32"/>' +
      '<stop offset="70%" stop-color="#1A58E8" stop-opacity="0.1"/>' +
      '<stop offset="100%" stop-color="#1A58E8" stop-opacity="0"/>' +
      '</radialGradient>';
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
      stripWinTubes();
      clearAllWinClips();
      return;
    }
    ensureTubes();
    var gGlobal = tubes.querySelector('#holo-tube-draw');
    if (gGlobal) gGlobal.innerHTML = '';
    var t = performance.now() * 0.001;
    var stim = audioStim();
    var winIdx = 0;
    var PAD = 48;
    document.querySelectorAll('.win').forEach(function (el) {
      var st = window.getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') {
        clipWin(el, '');
        var dead = el.querySelector(':scope > svg.holo-win-tube');
        if (dead) {
          dead.innerHTML = '';
          dead.style.display = 'none';
        }
        return;
      }
      var r = layoutBox(el);
      if (r.width < 12 || r.height < 12) {
        clipWin(el, '');
        return;
      }
      var isDock = el.id === 'dock-win';
      /* Local coords so each window owns its chrome in its own stacking context.
         A back window's wire cannot paint through a front window / video / dock. */
      var inset = isDock ? -10 : 0;
      var x = inset;
      var y = inset;
      var rw = Math.max(2, r.width - inset * 2);
      var rh = Math.max(2, r.height - inset * 2);
      var ph = phaseFor(el, winIdx);
      rubberAmp(ph, mouseNearBox(r), stim);
      var slim = isDock || r.height < 88;
      var d = wavyRect(x, y, rw, rh, t, winIdx, ph.amp, ph.music, 0, slim);
      if (slim) {
        clipWin(el, '');
      } else {
        clipWin(el, wavyRect(x, y, rw, rh, t, winIdx, ph.amp, ph.music, -8, false, 8));
      }
      var peri = 2 * (rw + rh);
      var headU = still()
        ? ph.seed * peri
        : (((t * ph.speed * 0.55 * ph.dir + ph.seed * peri) % peri) + peri) % peri;
      var tail = Math.max(64, peri * (slim ? 0.2 : 0.14));
      var flickW = still() ? 1 : (0.9 + 0.1 * Math.sin(t * 18 + ph.seed * 8));
      var head = wavePoint(x, y, rw, rh, t, winIdx, ph.amp, ph.music, 0, slim, headU);
      var gid = 'holo-cg-' + (el.id || winIdx);
      var plasmaW = slim ? 5.2 : 8.5;
      var svg = ensureWinTube(el);
      svg.style.display = '';
      svg.setAttribute('viewBox', (-PAD) + ' ' + (-PAD) + ' ' + (r.width + PAD * 2) + ' ' + (r.height + PAD * 2));
      svg.innerHTML =
        '<defs>' + cometGradient(gid, head.x, head.y, tail * 0.88) + '</defs>' +
        '<path class="holo-tube-glass" d="' + d + '"/>' +
        '<path class="holo-tube-plasma" d="' + cometRibbon(x, y, rw, rh, t, winIdx, ph.amp, ph.music, slim, headU, plasmaW * flickW, tail, ph.dir) + '" filter="url(#holo-plasma-soft)" style="fill:url(#' + gid + ')"/>' +
        '<path class="holo-tube-trail" d="' + cometRibbon(x, y, rw, rh, t, winIdx, ph.amp, ph.music, slim, headU, (slim ? 2.6 : 3.8) * flickW, tail * 0.72, ph.dir) + '" filter="url(#holo-plasma-glow)" style="fill:url(#' + gid + ')"/>' +
        '<path class="holo-tube-hot" d="' + cometRibbon(x, y, rw, rh, t, winIdx, ph.amp, ph.music, slim, headU, (slim ? 1.15 : 1.55) * flickW, tail * 0.38, ph.dir) + '" filter="url(#holo-plasma-core)" style="fill:url(#' + gid + ')"/>' +
        '<circle class="holo-tube-ember" cx="' + head.x.toFixed(2) + '" cy="' + head.y.toFixed(2) + '" r="' + ((slim ? 1.7 : 2.45) * flickW).toFixed(2) + '"/>';
      winIdx++;
    });
  }

  function drawHud() {
    if (hud) hud.innerHTML = '';
  }

  function clearTrip() {
    if (tripTimer) {
      clearTimeout(tripTimer);
      tripTimer = 0;
    }
    TRIP.forEach(function (n) {
      html.classList.remove('holo-trip-' + n);
    });
    html.classList.remove('holo-trip');
    tripOn = [];
    var disp = document.getElementById('holo-wrap-filter') && document.querySelector('#holo-wrap-filter feDisplacementMap');
    if (disp) disp.setAttribute('scale', '4');
  }

  function pickTrip() {
    var pool = TRIP.slice();
    var n = 2 + ((Math.random() * 2) | 0);
    var picked = [];
    var i, k;
    while (picked.length < n && pool.length) {
      i = (Math.random() * pool.length) | 0;
      picked.push(pool.splice(i, 1)[0]);
    }
    k = picked.slice().sort().join('+');
    if (k === lastTripKey && TRIP.length > 3) return pickTrip();
    lastTripKey = k;
    return picked;
  }

  function ensureFlare() {
    var el = document.getElementById('holo-flare');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'holo-flare';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  }

  function runTrip() {
    if (!isHolo() || still() || !desktop()) return;
    TRIP.forEach(function (n) { html.classList.remove('holo-trip-' + n); });
    tripOn = pickTrip();
    html.classList.add('holo-trip');
    tripOn.forEach(function (n) { html.classList.add('holo-trip-' + n); });
    ensureFlare();
    tripTimer = setTimeout(runTrip, 3200 + Math.random() * 5200);
  }

  function tickTrip(nowMs) {
    if (html.classList.contains('holo-trip') || tripTimer) clearTrip();
    var flare = document.getElementById('holo-flare');
    if (flare && flare.parentNode) flare.parentNode.removeChild(flare);
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
    fxTimer = setTimeout(runPulse, 2800 + Math.random() * 4200);
  }

  function tick() {
    requestAnimationFrame(tick);
    if (!isHolo()) {
      html.classList.remove('holo-playing', 'holo-letter-clear', 'holo-letter-drift', 'holo-letter-fuse', 'holo-letter-melt');
      unwrapLetters();
      if (tubes) {
        var g = tubes.querySelector('#holo-tube-draw');
        if (g) g.innerHTML = '';
        tubes.style.transform = '';
      }
      if (hud) hud.innerHTML = '';
      clearAllWinClips();
      killIdleGlow();
      return;
    }
    killStrings();
    html.classList.toggle('holo-playing', !still() && playing());
    var stim = audioStim();
    html.style.setProperty('--holo-bass', '0');
    html.style.setProperty('--holo-stim', stim.toFixed(4));
    html.style.setProperty('--holo-kick', '0');
    html.style.setProperty('--holo-snare', '0');
    html.style.setProperty('--holo-hat', stim.toFixed(4));
    html.style.setProperty('--holo-bounce-y', '0px');
    html.style.setProperty('--holo-bounce-s', '1');
    html.style.setProperty('--holo-ui-scale', '1');
    html.style.setProperty('--holo-ui-scale-soft', '1');
    html.style.setProperty('--holo-px', mx.toFixed(4));
    html.style.setProperty('--holo-py', my.toFixed(4));
    html.style.setProperty('--holo-mx', (mx * window.innerWidth).toFixed(1) + 'px');
    html.style.setProperty('--holo-my', (my * window.innerHeight).toFixed(1) + 'px');
    var now = performance.now() * 0.001;
    var flick = still() ? 1 : (0.86 + 0.14 * Math.abs(Math.sin(now * 37) * Math.sin(now * 11.3)));
    if (!still() && Math.random() < 0.012) flick *= 0.55;
    html.style.setProperty('--holo-flick', flick.toFixed(3));
    html.style.setProperty('--holo-sat', still() ? '1' : (0.78 + stim * 0.16).toFixed(3));
    tickLetters(performance.now());
    if (tubeAt === 0 || performance.now() - tubeAt > 33) {
      tubeAt = performance.now();
      drawTubes();
    }
    drawHud();
    tickIdlePing(performance.now(), kick, stim);
  }

  /* Click ring only — OS draws the cursor via CSS url(). Never moves a fake arrow. */
  var clickRing = null;
  var clickRingT = 0;

  function clickRingOk() {
    if (!isHolo() || still()) return false;
    try {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    } catch (e) {
      return false;
    }
    return true;
  }

  function fireClickRing(x, y) {
    if (!clickRingOk()) return;
    if (!clickRing) {
      clickRing = document.createElement('div');
      clickRing.id = 'holo-click-ring';
      clickRing.setAttribute('aria-hidden', 'true');
      document.body.appendChild(clickRing);
    }
    clickRing.style.left = x + 'px';
    clickRing.style.top = y + 'px';
    clickRing.classList.remove('is-on');
    void clickRing.offsetWidth;
    clickRing.classList.add('is-on');
    if (clickRingT) clearTimeout(clickRingT);
    clickRingT = setTimeout(function () {
      if (clickRing) clickRing.classList.remove('is-on');
    }, 100);
  }

  function killIdleGlow() {
    var dead = document.getElementById('holo-idle-glow');
    if (dead && dead.parentNode) dead.parentNode.removeChild(dead);
    idleGlow = null;
    if (!idlePing) return;
    idlePing.style.display = 'none';
    idlePing.style.opacity = '0';
  }

  function idleGlowOk() {
    if (!pointerSeen || !isHolo() || still() || !desktop()) return false;
    try {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    } catch (e) {
      return false;
    }
    return true;
  }

  function ensureIdlePing() {
    if (idlePing && idlePing.parentNode) return idlePing;
    idlePing = document.getElementById('holo-idle-ping');
    if (!idlePing) {
      idlePing = document.createElement('div');
      idlePing.id = 'holo-idle-ping';
      idlePing.setAttribute('aria-hidden', 'true');
      document.body.appendChild(idlePing);
    }
    idlePing.style.cssText =
      'position:fixed;left:var(--holo-mx,50%);top:var(--holo-my,42%);' +
      'width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;' +
      'pointer-events:none;z-index:2147482990;display:none;' +
      'background:none;box-shadow:none;mix-blend-mode:normal;' +
      'border:1px solid rgba(26,88,232,0.55);';
    return idlePing;
  }

  function tickIdlePing(nowMs, kick, stim) {
    killIdleGlow();
  }

  var nearEl = null;
  var NEAR_SEL = 'a,button,.ctrl-btn,.taskbar-btn,.tab,.mob-btn,.orbit-mode-btn,.track-item,.gallery-item,.win-close,.album-head';

  document.addEventListener('pointermove', function (e) {
    mx = e.clientX / Math.max(1, window.innerWidth);
    my = e.clientY / Math.max(1, window.innerHeight);
    lastLetterMove = performance.now();
    pointerSeen = true;
    killIdleGlow();
    if (!isHolo() || still()) return;
    var el = e.target && e.target.closest ? e.target.closest(NEAR_SEL) : null;
    if (el && (el.classList.contains('play-btn') || el.id === 'btn-play')) el = null;
    if (nearEl && nearEl !== el) {
      nearEl.style.removeProperty('--holo-nx');
      nearEl.style.removeProperty('--holo-ny');
      nearEl.classList.remove('holo-near');
    }
    nearEl = el;
    if (el) {
      var box = el.getBoundingClientRect();
      var nx = Math.max(-5, Math.min(5, (e.clientX - (box.left + box.width / 2)) / 16));
      var ny = Math.max(-4, Math.min(4, (e.clientY - (box.top + box.height / 2)) / 18));
      var st = el._holoBtn || (el._holoBtn = { x: 0, y: 0 });
      st.x += (nx - st.x) * 0.14;
      st.y += (ny - st.y) * 0.14;
      el.style.setProperty('--holo-nx', st.x.toFixed(2) + 'px');
      el.style.setProperty('--holo-ny', st.y.toFixed(2) + 'px');
      el.classList.add('holo-near');
    }
    var list = document.getElementById('sidebar-tracklist');
    if (list) {
      var items = list.querySelectorAll('.track-item');
      var i, row, r, dx, dy, d, fall, tx, ty, ns, maxFall = 0;
      for (i = 0; i < items.length; i++) {
        row = items[i];
        r = row.getBoundingClientRect();
        dx = e.clientX - (r.left + r.width * 0.5);
        dy = e.clientY - (r.top + r.height * 0.5);
        d = Math.sqrt(dx * dx + dy * dy);
        fall = Math.exp(-d / 64);
        if (fall > maxFall) maxFall = fall;
        tx = (dx / 22) * fall;
        ty = (dy / 26) * fall;
        if (tx > 6) tx = 6; if (tx < -6) tx = -6;
        if (ty > 4) ty = 4; if (ty < -4) ty = -4;
        ns = row._holoN || (row._holoN = { x: 0, y: 0 });
        ns.x += (tx - ns.x) * 0.15;
        ns.y += (ty - ns.y) * 0.15;
        row.style.setProperty('--holo-tnx', ns.x.toFixed(2) + 'px');
        row.style.setProperty('--holo-tny', ns.y.toFixed(2) + 'px');
      }
      var disp = document.getElementById('holo-text-disp');
      if (disp) disp.setAttribute('scale', (maxFall * 2.8).toFixed(2));
    }
  }, { passive: true });

  document.addEventListener('pointerdown', function (e) {
    if (!isHolo()) return;
    var t = e.target && e.target.closest ? e.target : null;
    var drag = false;
    if (t) {
      var bar = t.closest('.win-bar');
      if (bar && !t.closest('.win-close, button, a, input, [role="button"]')) {
        var win = bar.closest('.win');
        if (win) win.classList.add('holo-dragging');
        drag = true;
      }
      if (t.closest('.win-resize') || t.closest('.drag-handle')) drag = true;
    }
    if (!drag && e.pointerType !== 'touch') {
      fireClickRing(e.clientX, e.clientY);
      var hit =
        'a,button,.ctrl-btn,.play-btn,.tab,.taskbar-btn,.mob-btn,.orbit-mode-btn,' +
        '.track-item,.gallery-item,.album-head,.win-close,[role="button"],' +
        '.progress-wrap,.gallery-view-btn,.orbit-image-enlarge-btn,.img-nav,' +
        '.lyrics-copy-btn,.lyric-line,.video-ai-badge,.m-tab,#vol-icon-wrap,' +
        '#video-vol-icon-wrap,#vol-slider,#video-vol-slider,#video-win-player,#video-seek,' +
        'input[type="button"],input[type="submit"],input[type="range"],input[type="checkbox"]';
      if (t && t.closest(hit)) html.classList.add('holo-cursor-press');
    }
  }, true);

  function endDrag() {
    document.querySelectorAll('.win.holo-dragging').forEach(function (w) {
      w.classList.remove('holo-dragging');
    });
    html.classList.remove('holo-cursor-press');
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
    html.classList.remove('holo-cursor-press');
    if (!isHolo()) {
      html.classList.remove('holo-playing', 'holo-letter-clear', 'holo-letter-drift', 'holo-letter-fuse', 'holo-letter-melt');
      unwrapLetters();
      clearFx();
      killStrings();
      clearAllWinClips();
      stripWinTubes();
      if (tubes) {
        var g = tubes.querySelector('#holo-tube-draw');
        if (g) g.innerHTML = '';
        tubes.style.display = 'none';
      }
      if (hud) {
        hud.innerHTML = '';
        hud.style.display = 'none';
      }
      killIdleGlow();
    } else {
      if (tubes) tubes.style.display = '';
      if (hud) hud.style.display = '';
      if (playing()) schedule();
    }
  });

  requestAnimationFrame(tick);
})();
