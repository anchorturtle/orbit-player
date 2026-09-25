/* Holo environment: full-viewport music-reactive waves / rings / bloom.
   Reads window.__ORBIT_AUDIO__ (space3d analyser). Own tap if that is quiet. */
(function () {
  'use strict';

  var html = document.documentElement;
  var canvas = null;
  var ctx = null;
  var wash = null;
  var W = 1, H = 1, dpr = 1;
  var raf = 0;
  var rings = [];
  var lastKick = 0;
  var lastSnare = 0;
  var phase = 0;
  var ownAnalyser = null;
  var ownFreq = null;
  var reduce = false;

  function isHolo() {
    return html.classList.contains('theme-holo');
  }
  function still() {
    /* Reduced-motion only calms strobe — never hides the environment. */
    return false;
  }
  function playing() {
    var a = document.getElementById('audio-player');
    return !!(a && !a.paused && !a.ended);
  }

  function hexToRgb(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (!isFinite(n)) return { r: 26, g: 88, b: 232 };
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function cssTone(name, fallback) {
    try {
      var v = getComputedStyle(html).getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) {
      return fallback;
    }
  }
  function tones() {
    return {
      a: hexToRgb(cssTone('--holo-tone-a', cssTone('--track-a', '#050608'))),
      b: hexToRgb(cssTone('--holo-tone-b', cssTone('--track-b', '#1A58E8'))),
      c: hexToRgb(cssTone('--holo-tone-c', cssTone('--track-c', '#C41422')))
    };
  }
  function rgba(c, a) {
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }

  function ensureDom() {
    wash = document.getElementById('holo-env-wash');
    if (!wash) {
      wash = document.createElement('div');
      wash.id = 'holo-env-wash';
      wash.setAttribute('aria-hidden', 'true');
      var space = document.getElementById('space3d-canvas') || document.body.firstChild;
      if (space && space.parentNode) space.parentNode.insertBefore(wash, space.nextSibling);
      else document.body.appendChild(wash);
    }
    canvas = document.getElementById('holo-env-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'holo-env-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      wash.parentNode.insertBefore(canvas, wash.nextSibling);
    }
    ctx = canvas.getContext('2d', { alpha: true });
    size();
  }

  function size() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = Math.max(1, window.innerWidth);
    H = Math.max(1, window.innerHeight);
    var sw = Math.round(W * dpr);
    var sh = Math.round(H * dpr);
    if (canvas.width !== sw || canvas.height !== sh) {
      canvas.width = sw;
      canvas.height = sh;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
    }
  }

  function hookOwnAnalyser() {
    if (ownAnalyser) return;
    try {
      if (typeof audioContext === 'undefined' || !audioContext) return;
      if (typeof gainNode === 'undefined' || !gainNode) return;
      ownAnalyser = audioContext.createAnalyser();
      ownAnalyser.fftSize = 256;
      ownAnalyser.smoothingTimeConstant = 0.72;
      gainNode.connect(ownAnalyser);
      ownFreq = new Uint8Array(ownAnalyser.frequencyBinCount);
    } catch (e) {}
  }

  function bands() {
    var a = window.__ORBIT_AUDIO__ || {};
    var bass = Number(a.bass) || 0;
    var mid = Number(a.mid) || 0;
    var high = Number(a.high) || 0;
    var level = Number(a.level) || 0;
    var stim = Number(a.stim) || (bass * 0.55 + level * 0.45);
    var kick = Number(a.kick) || 0;
    var snare = Number(a.snare) || 0;
    var hat = Number(a.hat) || 0;
    if (playing() && level < 0.02 && bass < 0.02) {
      hookOwnAnalyser();
      if (ownAnalyser && ownFreq) {
        try {
          ownAnalyser.getByteFrequencyData(ownFreq);
          var n = ownFreq.length;
          var b = 0, m = 0, h = 0, all = 0;
          var bb = Math.min(10, n), me = Math.min(40, n);
          var i;
          for (i = 1; i < bb; i++) b += ownFreq[i];
          for (i = bb; i < me; i++) m += ownFreq[i];
          for (i = me; i < n; i += 2) h += ownFreq[i];
          for (i = 0; i < n; i += 2) all += ownFreq[i];
          bass = Math.max(bass, b / Math.max(1, bb - 1) / 255);
          mid = Math.max(mid, m / Math.max(1, me - bb) / 255);
          high = Math.max(high, h / Math.max(1, Math.ceil((n - me) / 2)) / 255);
          level = Math.max(level, all / Math.max(1, n / 2) / 255);
          stim = Math.max(stim, bass * 0.5 + mid * 0.3 + level * 0.2);
          kick = Math.max(kick, bass);
          snare = Math.max(snare, mid);
        } catch (e) {}
      }
    }
    return {
      bass: Math.max(0, Math.min(1, bass)),
      mid: Math.max(0, Math.min(1, mid)),
      high: Math.max(0, Math.min(1, high)),
      level: Math.max(0, Math.min(1, level)),
      stim: Math.max(0, Math.min(1, stim)),
      kick: Math.max(0, Math.min(1, kick)),
      snare: Math.max(0, Math.min(1, snare)),
      hat: Math.max(0, Math.min(1, hat))
    };
  }

  function paintWash(b, t) {
    if (!wash) return;
    var bloom = still() ? 0 : (0.22 + b.stim * 0.95 + b.kick * 1.15);
    var sat = still() ? 0.7 : (1.05 + b.stim * 0.55);
    wash.style.setProperty('--holo-env-bloom', bloom.toFixed(3));
    wash.style.setProperty('--holo-env-sat', sat.toFixed(3));
    wash.style.opacity = playing() ? String(Math.min(1, 0.62 + b.stim * 0.38)) : '0.28';
    var tb = tones();
    wash.style.background =
      'radial-gradient(ellipse 92% 72% at 50% 46%,' + rgba(tb.b, live ? (0.22 + b.kick * 0.45) : 0.08) + ' 0%,transparent 64%),' +
      'radial-gradient(ellipse 80% 55% at 50% 88%,' + rgba(tb.c, live ? (0.18 + b.bass * 0.4) : 0.06) + ' 0%,transparent 72%)';
  }

  function spawnRing(kind, b) {
    rings.push({
      r: 40 + Math.random() * 20,
      life: 1,
      w: kind === 'kick' ? 5.5 : 3.2,
      kind: kind,
      spin: (Math.random() - 0.5) * 0.4
    });
    if (rings.length > 18) rings.shift();
  }

  function draw(ts) {
    raf = requestAnimationFrame(draw);
    if (!isHolo()) {
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (wash) wash.style.opacity = '0';
      rings.length = 0;
      return;
    }
    ensureDom();
    size();
    if (!ctx) return;

    var b = bands();
    var t = (ts || 0) * 0.001;
    phase = t;
    paintWash(b, t);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    var col = tones();
    var cx = W * 0.5;
    var cy = H * 0.46;
    var live = playing();
    var amp = live ? (48 + b.bass * 160 + b.stim * 70) : 14;
    var kickEdge = b.kick - lastKick;
    var snareEdge = b.snare - lastSnare;
    if (live && (kickEdge > 0.08 || (b.kick > 0.42 && kickEdge > 0.02))) spawnRing('kick', b);
    if (live && (snareEdge > 0.1 || (b.snare > 0.38 && snareEdge > 0.03))) spawnRing('snare', b);
    lastKick = b.kick;
    lastSnare = b.snare;

    /* Center bloom — obvious pulse on the floor around the planet */
    var bloomR = 140 + b.bass * 260 + b.kick * 180;
    var g = ctx.createRadialGradient(cx, cy, 20, cx, cy, bloomR);
    g.addColorStop(0, rgba(col.b, live ? (0.08 + b.kick * 0.38 + b.stim * 0.18) : 0.03));
    g.addColorStop(0.42, rgba(col.c, live ? (0.06 + b.bass * 0.28) : 0.02));
    g.addColorStop(1, rgba(col.a, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    /* Horizon waves */
    var layers = 5;
    var li, x, y, y0, freq, speed;
    for (li = 0; li < layers; li++) {
      y0 = H * (0.28 + li * 0.11);
      freq = 0.006 + b.mid * 0.012 + li * 0.0018;
      speed = t * (1.2 + li * 0.35 + b.high * 1.6);
      ctx.beginPath();
      ctx.lineWidth = (li === 2 ? 3.6 : 2.1) + b.stim * 2.4;
      ctx.strokeStyle = rgba(li % 2 ? col.c : col.b, live ? (0.42 + b.stim * 0.5) : 0.14);
      for (x = 0; x <= W; x += 6) {
        y = y0
          + Math.sin(x * freq + speed) * amp * (0.55 + li * 0.12)
          + Math.sin(x * freq * 2.3 - speed * 0.7 + li) * amp * 0.28 * b.mid
          + Math.sin(x * 0.021 + t * 3 + li * 2) * (8 + b.hat * 22);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    /* Expanding kick / snare rings */
    var i, r;
    for (i = rings.length - 1; i >= 0; i--) {
      r = rings[i];
      r.r += (live ? 7 : 2) + b.bass * 14 + (r.kind === 'kick' ? 6 : 3);
      r.life -= 0.016 + b.level * 0.01;
      if (r.life <= 0 || r.r > Math.max(W, H) * 0.85) {
        rings.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.lineWidth = r.w * (0.5 + r.life);
      ctx.strokeStyle = rgba(r.kind === 'kick' ? col.b : col.c, r.life * (0.55 + b.stim * 0.35));
      ctx.arc(cx, cy, r.r, 0, Math.PI * 2);
      ctx.stroke();
      if (r.kind === 'kick') {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(col.c, r.life * 0.28);
        ctx.arc(cx, cy, r.r * 0.86, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    /* Floor perspective grid that breathes with bass */
    var vanishY = H * 0.52;
    var floorTop = H * 0.58;
    var pulse = live ? (1 + b.bass * 0.55 + b.kick * 0.35) : 1;
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = rgba(col.b, live ? (0.14 + b.stim * 0.28) : 0.05);
    ctx.beginPath();
    var gLine;
    for (gLine = -8; gLine <= 8; gLine++) {
      var gx = cx + gLine * (W * 0.11) * pulse;
      ctx.moveTo(cx, vanishY);
      ctx.lineTo(gx, H + 8);
    }
    var gy;
    for (gy = 0; gy < 9; gy++) {
      var k = gy / 8;
      var yy = floorTop + Math.pow(k, 1.55) * (H - floorTop);
      var half = (W * 0.08 + k * W * 0.55) * pulse;
      ctx.moveTo(cx - half, yy);
      ctx.lineTo(cx + half, yy);
    }
    ctx.stroke();

    /* Spectrum horizon ticks */
    if (live) {
      var bars = 48;
      var bw = W / bars;
      var spec = (window.__ORBIT_AUDIO__ && window.__ORBIT_AUDIO__.spec) || null;
      ctx.lineWidth = Math.max(2, bw * 0.42);
      for (i = 0; i < bars; i++) {
        var v;
        if (spec && spec.length) {
          v = (spec[i % spec.length] || 0) / 255;
        } else {
          v = 0.15
            + b.bass * Math.exp(-i / 10) * 0.9
            + b.mid * Math.exp(-Math.abs(i - 18) / 8) * 0.7
            + b.high * Math.exp(-Math.abs(i - 38) / 7) * 0.55
            + 0.08 * Math.sin(t * 8 + i * 0.4);
        }
        var bh = (10 + v * 90 + b.kick * 18) * (0.55 + 0.45 * Math.sin(t * 2 + i * 0.2));
        ctx.strokeStyle = rgba(i % 3 === 0 ? col.c : col.b, 0.28 + v * 0.5);
        ctx.beginPath();
        ctx.moveTo((i + 0.5) * bw, H - 6);
        ctx.lineTo((i + 0.5) * bw, H - 6 - bh);
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    html.style.setProperty('--holo-env-on', live ? '1' : '0');
  }

  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    var onMq = function () { reduce = mq.matches; };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);
  } catch (e) {}

  window.addEventListener('resize', size);
  window.addEventListener('orbit-skin-change', function () {
    if (!isHolo() && ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureDom);
  } else {
    ensureDom();
  }
  raf = requestAnimationFrame(draw);
})();
