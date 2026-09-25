/* Holo environment: full-viewport music-reactive world.
   Each track is a different pop-art / two-tone room. Waves + energy
   come from the analyser (bass / mid / high / kick). If the tap is
   quiet while audio is playing, a fallback pulse keeps the room alive. */
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
  var lastSlug = '';
  var lastTones = null;
  var ownAnalyser = null;
  var ownFreq = null;
  var reduce = false;
  var quietFrames = 0;

  /* [void, neon, grit] — trippy / pop-art / two-tone. Shared with space3d. */
  var WORLDS = {
    'quarters':               { pal: ['#050608', '#1A58E8', '#C41422'], mode: 'waves',   pair: 'blue-red' },
    'offers':                 { pal: ['#000000', '#F4F0FF', '#7B2FFF'], mode: 'split',   pair: 'bw-purple' },
    'thousand-dragon':        { pal: ['#1A0A00', '#FFD100', '#FF1A1A'], mode: 'dots',    pair: 'gold-red' },
    'ko':                     { pal: ['#001410', '#00FFC2', '#FF2D6A'], mode: 'chevron', pair: 'mint-magenta' },
    'hyperdream-odyssey':     { pal: ['#0A0030', '#FF4DFF', '#3D7BFF'], mode: 'tunnel',  pair: 'magenta-blue' },
    'soul-seer':              { pal: ['#001408', '#B8FF00', '#2D6BFF'], mode: 'lattice', pair: 'lime-blue' },
    'geronimo':               { pal: ['#140000', '#FF3300', '#FFE8D0'], mode: 'shards',  pair: 'red-cream' },
    'spin-cycle':             { pal: ['#000814', '#7EF0FF', '#FF2A5A'], mode: 'scan',    pair: 'cyan-red' },
    'mile-high':              { pal: ['#000000', '#2D6BFF', '#FFFFFF'], mode: 'split',   pair: 'bw-blue' },
    'follow-the-flow':        { pal: ['#001820', '#00FFD0', '#1A58E8'], mode: 'waves',   pair: 'teal-blue' },
    'peace':                  { pal: ['#0A0614', '#FFFFFF', '#C9B8FF'], mode: 'dots',    pair: 'white-lavender' },
    'strider':                { pal: ['#120800', '#FF7A00', '#1A58E8'], mode: 'shards',  pair: 'orange-blue' },
    'insane-membrane':        { pal: ['#120018', '#FF0099', '#00E5FF'], mode: 'checker', pair: 'pink-cyan' },
    'wavy':                   { pal: ['#001028', '#00E5FF', '#FF3366'], mode: 'waves',   pair: 'cyan-pink' },
    'boa-constrictor':        { pal: ['#051400', '#66FF00', '#FF0044'], mode: 'chevron', pair: 'lime-red' },
    'news':                   { pal: ['#000000', '#FFFFFF', '#1A58E8'], mode: 'bars',    pair: 'bw-blue' },
    'wheels':                 { pal: ['#140A00', '#FFB000', '#FF2200'], mode: 'scan',    pair: 'gold-red' },
    'pop':                    { pal: ['#1A0030', '#FF00AA', '#FFF000'], mode: 'dots',    pair: 'warhol' },
    'the-sum-of-hippy-thoughts': { pal: ['#0A1800', '#D4FF00', '#9B30FF'], mode: 'lattice', pair: 'lime-purple' },
    'what-dreams-may-come':   { pal: ['#0A0020', '#B48CFF', '#00FFC8'], mode: 'tunnel',  pair: 'violet-mint' },
    'jazzpot':                { pal: ['#180810', '#FF6A00', '#2D6BFF'], mode: 'bars',    pair: 'orange-blue' },
    'fat-stacks':             { pal: ['#001400', '#00FF66', '#FFD100'], mode: 'bars',    pair: 'money' },
    'chokeslam':              { pal: ['#100000', '#FFFFFF', '#C41422'], mode: 'split',   pair: 'bw-red' },
    'grateful-sharpie':       { pal: ['#000814', '#00A3FF', '#FF4D00'], mode: 'shards',  pair: 'blue-orange' },
    'my-anthem':              { pal: ['#140010', '#FF0055', '#00F0FF'], mode: 'checker', pair: 'red-cyan' },
    'sublime-beginnings':     { pal: ['#001010', '#FFEE00', '#FF00AA'], mode: 'dots',    pair: 'yellow-magenta' },
    'nonnin':                 { pal: ['#000000', '#7B2FFF', '#FFFFFF'], mode: 'split',   pair: 'bw-purple' },
    'whoiam2u':               { pal: ['#0C0018', '#FF66FF', '#00FF88'], mode: 'tunnel',  pair: 'pink-mint' },
    'still-going-higher':     { pal: ['#000818', '#4D7CFF', '#FFE14D'], mode: 'waves',   pair: 'blue-gold' },
    'tomb-of-the-creator':    { pal: ['#0A0A00', '#C8A000', '#8B0000'], mode: 'lattice', pair: 'gold-blood' },
    'what-is-it-now':         { pal: ['#180000', '#FF2200', '#00FFDD'], mode: 'chevron', pair: 'red-teal' },
    'four-twenty':            { pal: ['#0A1400', '#66FF00', '#FF00AA'], mode: 'dots',    pair: 'lime-magenta' },
    'get':                    { pal: ['#000000', '#FFEE00', '#FF0066'], mode: 'bars',    pair: 'yellow-pink' },
    'death-of-jestr':         { pal: ['#000000', '#FFFFFF', '#7B2FFF'], mode: 'split',   pair: 'bw-purple' },
    'blockbuster':            { pal: ['#100000', '#FF0044', '#FFE14D'], mode: 'shards',  pair: 'red-gold' },
    'got-nun':                { pal: ['#000000', '#E8E8E8', '#C41422'], mode: 'scan',    pair: 'bw-red' },
    'space-radio':            { pal: ['#000818', '#39FF14', '#FF00FF'], mode: 'scan',    pair: 'terminal' },
    'exploding-galaxies':     { pal: ['#080010', '#FF00FF', '#00FFFF'], mode: 'tunnel',  pair: 'magenta-cyan' },
    'acid-rain':              { pal: ['#001408', '#CCFF00', '#FF00CC'], mode: 'checker', pair: 'acid' }
  };
  var FALLBACK_MODES = ['waves', 'chevron', 'dots', 'split', 'tunnel', 'bars', 'lattice', 'scan', 'shards', 'checker'];
  window.__HOLO_WORLDS__ = WORLDS;

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
  function currentSlug() {
    var a = window.__ORBIT_AUDIO__;
    if (a && a.slug) return String(a.slug);
    try {
      if (typeof TRACKS !== 'undefined' && typeof currentIndex !== 'undefined' && TRACKS[currentIndex]) {
        return TRACKS[currentIndex].slug || '';
      }
    } catch (e) {}
    return lastSlug || 'quarters';
  }
  function hashStr(s) {
    var h = 0, i;
    s = String(s || '');
    for (i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function worldFor(slug) {
    if (slug && WORLDS[slug]) return WORLDS[slug];
    var h = hashStr(slug || 'quarters');
    return {
      pal: [
        '#050608',
        ['#1A58E8', '#7B2FFF', '#00E5A8', '#FF2D9A', '#FFD100', '#FFFFFF'][h % 6],
        ['#C41422', '#FFFFFF', '#FF2D6A', '#00FFFF', '#FFE14D', '#7B2FFF'][(h >> 3) % 6]
      ],
      mode: FALLBACK_MODES[h % FALLBACK_MODES.length],
      pair: 'hash'
    };
  }

  function hexToRgb(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (!isFinite(n)) return { r: 26, g: 88, b: 232 };
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgba(c, a) {
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }
  function tonesFrom(world) {
    var pal = world.pal;
    return {
      a: hexToRgb(pal[0]),
      b: hexToRgb(pal[1]),
      c: hexToRgb(pal[2])
    };
  }

  function applyWorld(slug) {
    var w = worldFor(slug);
    lastSlug = slug || lastSlug;
    html.setAttribute('data-holo-world', lastSlug || 'quarters');
    html.setAttribute('data-holo-mode', w.mode);
    html.setAttribute('data-holo-pair', w.pair);
    html.style.setProperty('--holo-tone-a', w.pal[0]);
    html.style.setProperty('--holo-tone-b', w.pal[1]);
    html.style.setProperty('--holo-tone-c', w.pal[2]);
    html.style.setProperty('--track-a', w.pal[0]);
    html.style.setProperty('--track-b', w.pal[1]);
    html.style.setProperty('--track-c', w.pal[2]);
    return w;
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
    if (!ctx) ctx = canvas.getContext('2d', { alpha: true });
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

  function audioGraph() {
    var ctx0 = window.__ORBIT_AUDIO_CTX__;
    var gain = window.__ORBIT_GAIN__;
    if (!ctx0 && typeof audioContext !== 'undefined') ctx0 = audioContext;
    if (!gain && typeof gainNode !== 'undefined') gain = gainNode;
    return { ctx: ctx0, gain: gain };
  }

  function hookOwnAnalyser() {
    if (ownAnalyser) return;
    var g = audioGraph();
    if (!g.ctx || !g.gain) return;
    try {
      ownAnalyser = g.ctx.createAnalyser();
      ownAnalyser.fftSize = 256;
      ownAnalyser.smoothingTimeConstant = 0.55;
      g.gain.connect(ownAnalyser);
      ownFreq = new Uint8Array(ownAnalyser.frequencyBinCount);
    } catch (e) {}
  }

  function readOwn() {
    hookOwnAnalyser();
    if (!ownAnalyser || !ownFreq) return null;
    try {
      ownAnalyser.getByteFrequencyData(ownFreq);
      var n = ownFreq.length;
      var b = 0, m = 0, h = 0, all = 0, i;
      var bb = Math.min(10, n), me = Math.min(40, n);
      for (i = 1; i < bb; i++) b += ownFreq[i];
      for (i = bb; i < me; i++) m += ownFreq[i];
      for (i = me; i < n; i += 2) h += ownFreq[i];
      for (i = 0; i < n; i += 2) all += ownFreq[i];
      return {
        bass: b / Math.max(1, bb - 1) / 255,
        mid: m / Math.max(1, me - bb) / 255,
        high: h / Math.max(1, Math.ceil((n - me) / 2)) / 255,
        level: all / Math.max(1, n / 2) / 255,
        spec: ownFreq
      };
    } catch (e) {
      return null;
    }
  }

  function bands(t) {
    var a = window.__ORBIT_AUDIO__ || {};
    var own = readOwn();
    var bass = Math.max(Number(a.bass) || 0, own ? own.bass : 0);
    var mid = Math.max(Number(a.mid) || 0, own ? own.mid : 0);
    var high = Math.max(Number(a.high) || 0, own ? own.high : 0);
    var level = Math.max(Number(a.level) || 0, own ? own.level : 0);
    var kick = Number(a.kick) || 0;
    var snare = Number(a.snare) || 0;
    var hat = Number(a.hat) || 0;
    /* Punch analyser values so a real mix is unmistakable. */
    bass = Math.min(1, bass * 1.85);
    mid = Math.min(1, mid * 1.7);
    high = Math.min(1, high * 1.6);
    level = Math.min(1, level * 1.75);
    kick = Math.max(kick, bass * 0.72);
    snare = Math.max(snare, mid * 0.65);
    hat = Math.max(hat, high * 0.55);
    if (playing() && level < 0.03 && bass < 0.03) {
      quietFrames++;
      if (quietFrames > 12) {
        var pulse = 0.42 + 0.38 * Math.abs(Math.sin(t * 5.2));
        var hatP = 0.28 + 0.4 * Math.abs(Math.sin(t * 11.0));
        bass = Math.max(bass, pulse * 0.85);
        mid = Math.max(mid, pulse * 0.55);
        high = Math.max(high, hatP);
        level = Math.max(level, pulse * 0.7);
        kick = Math.max(kick, pulse * 0.8);
        snare = Math.max(snare, pulse * 0.4);
        hat = Math.max(hat, hatP);
      }
    } else {
      quietFrames = 0;
    }
    var stim = Math.min(1, bass * 0.5 + mid * 0.28 + level * 0.22);
    return {
      bass: bass, mid: mid, high: high, level: level, stim: stim,
      kick: Math.min(1, kick), snare: Math.min(1, snare), hat: Math.min(1, hat),
      spec: (a.spec && a.spec.length) ? a.spec : (own && own.spec)
    };
  }

  function paintWash(b, live) {
    if (!wash) return;
    var bloom = still() ? 0.15 : (0.55 + b.stim * 1.15 + b.kick * 1.35);
    var sat = still() ? 0.85 : (1.25 + b.stim * 0.7);
    wash.style.setProperty('--holo-env-bloom', bloom.toFixed(3));
    wash.style.setProperty('--holo-env-sat', sat.toFixed(3));
    wash.style.opacity = live ? String(Math.min(1, 0.72 + b.stim * 0.28)) : '0.32';
    var tb = lastTones || { b: { r: 26, g: 88, b: 232 }, c: { r: 196, g: 20, b: 34 } };
    wash.style.background =
      'radial-gradient(ellipse 100% 80% at 50% 46%,' + rgba(tb.b, live ? (0.28 + b.kick * 0.5) : 0.1) + ' 0%,transparent 68%),' +
      'radial-gradient(ellipse 90% 60% at 50% 90%,' + rgba(tb.c, live ? (0.22 + b.bass * 0.45) : 0.08) + ' 0%,transparent 74%),' +
      'radial-gradient(ellipse 48% 36% at 14% 24%,' + rgba(tb.b, live ? (0.14 + b.hat * 0.32) : 0.05) + ' 0%,transparent 70%),' +
      'radial-gradient(ellipse 44% 34% at 86% 20%,' + rgba(tb.c, live ? (0.12 + b.snare * 0.34) : 0.05) + ' 0%,transparent 70%)';
  }

  function spawnRing(kind) {
    rings.push({
      r: 50 + Math.random() * 30,
      life: 1,
      w: kind === 'kick' ? 8 : 4.5,
      kind: kind
    });
    if (rings.length > 22) rings.shift();
  }

  function drawWaves(col, b, t, live, amp) {
    var layers = 7;
    var li, x, y, y0, freq, speed;
    for (li = 0; li < layers; li++) {
      y0 = H * (0.18 + li * 0.11);
      freq = 0.005 + b.mid * 0.016 + li * 0.0015;
      speed = t * (1.4 + li * 0.4 + b.high * 2.2);
      ctx.beginPath();
      ctx.lineWidth = (li === 3 ? 4.2 : 2.2) + b.stim * 3.2;
      ctx.strokeStyle = rgba(li % 2 ? col.c : col.b, live ? (0.42 + b.stim * 0.5) : 0.12);
      for (x = 0; x <= W; x += 5) {
        y = y0
          + Math.sin(x * freq + speed) * amp * (0.6 + li * 0.1)
          + Math.sin(x * freq * 2.4 - speed * 0.7 + li) * amp * 0.32 * b.mid
          + Math.sin(x * 0.02 + t * 3.4 + li * 2) * (10 + b.hat * 36);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function drawChevron(col, b, t, live, amp) {
    var rows = 9;
    var r, x, y, step, ph;
    step = 36 + b.mid * 28;
    for (r = 0; r < rows; r++) {
      y = H * (0.12 + r * 0.1) + Math.sin(t * 1.6 + r) * amp * 0.25;
      ph = (t * (0.8 + b.high) + r * 0.4) * (r % 2 ? 1 : -1);
      ctx.beginPath();
      ctx.lineWidth = 3 + b.stim * 4;
      ctx.strokeStyle = rgba(r % 2 ? col.c : col.b, live ? (0.5 + b.kick * 0.4) : 0.12);
      for (x = -step; x <= W + step; x += step) {
        var xx = x + ((ph * 40) % step);
        var peak = y - (18 + amp * 0.35);
        if (x <= -step) ctx.moveTo(xx, y);
        else {
          ctx.lineTo(xx + step * 0.5, peak);
          ctx.lineTo(xx + step, y);
        }
      }
      ctx.stroke();
    }
  }

  function drawDots(col, b, t, live) {
    var gap = 28 + (1 - b.mid) * 16;
    var x, y, n, rad, pulse;
    for (y = gap * 0.5; y < H; y += gap) {
      for (x = gap * 0.5; x < W; x += gap) {
        n = Math.sin(x * 0.02 + t * 2.4) * Math.cos(y * 0.018 - t * 1.7);
        pulse = 0.45 + 0.55 * n + b.bass * 0.6;
        rad = (3 + pulse * 10 + b.kick * 8) * (live ? 1 : 0.35);
        ctx.fillStyle = rgba(((x / gap + y / gap) | 0) % 2 ? col.b : col.c, live ? (0.35 + pulse * 0.45) : 0.08);
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawSplit(col, b, t, live) {
    var cut = W * (0.42 + Math.sin(t * 0.7 + b.mid * 2) * 0.08 + (b.bass - 0.4) * 0.12);
    ctx.fillStyle = rgba(col.b, live ? (0.22 + b.stim * 0.28) : 0.08);
    ctx.fillRect(0, 0, cut, H);
    ctx.fillStyle = rgba(col.c, live ? (0.22 + b.kick * 0.3) : 0.08);
    ctx.fillRect(cut, 0, W - cut, H);
    ctx.strokeStyle = rgba(col.b, live ? 0.95 : 0.3);
    ctx.lineWidth = 4 + b.kick * 10;
    ctx.beginPath();
    ctx.moveTo(cut, 0);
    ctx.lineTo(cut, H);
    ctx.stroke();
    var i, y;
    for (i = 0; i < 14; i++) {
      y = ((t * (40 + b.high * 80) + i * H / 14) % H);
      ctx.fillStyle = rgba(i % 2 ? col.c : col.b, live ? 0.18 : 0.05);
      ctx.fillRect(0, y, W, 3 + b.hat * 8);
    }
  }

  function drawTunnel(col, b, t, live, cx, cy) {
    var i, r, a;
    for (i = 22; i >= 0; i--) {
      r = 20 + i * (22 + b.bass * 18) + (t * (80 + b.high * 120)) % 22;
      a = live ? (0.12 + (1 - i / 22) * 0.55 + b.kick * 0.2) : 0.06;
      ctx.strokeStyle = rgba(i % 2 ? col.c : col.b, a);
      ctx.lineWidth = 2 + b.stim * 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * (1.15 + b.mid * 0.25), r * 0.72, t * 0.15, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawLattice(col, b, t, live) {
    var gap = 34 + b.mid * 20;
    var o = (t * (30 + b.high * 50)) % gap;
    var x, y;
    ctx.lineWidth = 1.6 + b.stim * 2.4;
    ctx.strokeStyle = rgba(col.b, live ? (0.4 + b.bass * 0.4) : 0.1);
    ctx.beginPath();
    for (x = -gap + o; x < W + gap; x += gap) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x + H * 0.25 * Math.sin(t + b.mid), H);
    }
    ctx.stroke();
    ctx.strokeStyle = rgba(col.c, live ? (0.35 + b.kick * 0.4) : 0.08);
    ctx.beginPath();
    for (y = -gap + o; y < H + gap; y += gap) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y + 18 * Math.sin(t * 1.4 + y * 0.01));
    }
    ctx.stroke();
  }

  function drawScan(col, b, t, live) {
    var i, y, hgt;
    for (i = 0; i < 18; i++) {
      y = ((t * (50 + b.bass * 140) + i * H / 18) % (H + 40)) - 20;
      hgt = 6 + b.kick * 28 + (i % 3) * 4;
      ctx.fillStyle = rgba(i % 2 ? col.b : col.c, live ? (0.28 + b.stim * 0.4) : 0.08);
      ctx.fillRect(0, y, W, hgt);
    }
  }

  function drawShards(col, b, t, live, amp) {
    var i, x0, y0;
    for (i = 0; i < 16; i++) {
      x0 = (W * 0.15) + (i / 15) * W * 0.7;
      y0 = H * 0.2 + Math.sin(t * 1.8 + i) * amp;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + 40 + b.mid * 50, y0 + 90 + b.bass * 80);
      ctx.lineTo(x0 - 16, y0 + 70 + b.kick * 40);
      ctx.closePath();
      ctx.fillStyle = rgba(i % 2 ? col.b : col.c, live ? (0.22 + b.stim * 0.35) : 0.06);
      ctx.fill();
    }
  }

  function drawChecker(col, b, t, live) {
    var cell = 42 + b.mid * 24;
    var ox = (t * (20 + b.high * 40)) % (cell * 2);
    var x, y, xi, yi;
    for (y = -cell; y < H + cell; y += cell) {
      for (x = -cell; x < W + cell; x += cell) {
        xi = ((x + ox) / cell) | 0;
        yi = (y / cell) | 0;
        if ((xi + yi) % 2) {
          ctx.fillStyle = rgba((xi + yi) % 4 ? col.b : col.c, live ? (0.2 + b.bass * 0.28) : 0.06);
          ctx.fillRect(x + ox, y, cell, cell);
        }
      }
    }
  }

  function drawBars(col, b, t, live) {
    var bars = 56;
    var bw = W / bars;
    var spec = b.spec;
    var i, v, bh;
    ctx.lineWidth = Math.max(3, bw * 0.55);
    for (i = 0; i < bars; i++) {
      if (spec && spec.length) v = (spec[i % spec.length] || 0) / 255;
      else {
        v = 0.18
          + b.bass * Math.exp(-i / 12) * 1.1
          + b.mid * Math.exp(-Math.abs(i - 22) / 9) * 0.85
          + b.high * Math.exp(-Math.abs(i - 44) / 8) * 0.7
          + 0.1 * Math.sin(t * 9 + i * 0.35);
      }
      bh = (16 + v * 160 + b.kick * 28) * (live ? 1 : 0.25);
      ctx.strokeStyle = rgba(i % 3 === 0 ? col.c : col.b, live ? (0.45 + v * 0.5) : 0.1);
      ctx.beginPath();
      ctx.moveTo((i + 0.5) * bw, H - 4);
      ctx.lineTo((i + 0.5) * bw, H - 4 - bh);
      ctx.stroke();
    }
  }

  function draw(ts) {
    raf = requestAnimationFrame(draw);
    if (!isHolo()) {
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (wash) wash.style.opacity = '0';
      rings.length = 0;
      html.removeAttribute('data-holo-world');
      html.removeAttribute('data-holo-mode');
      html.removeAttribute('data-holo-pair');
      return;
    }
    ensureDom();
    size();
    if (!ctx) return;

    var t = (ts || 0) * 0.001;
    var slug = currentSlug();
    var world = applyWorld(slug);
    var col = tonesFrom(world);
    var b = bands(t);
    var live = !still() && playing();
    paintWash(b, live);
    html.classList.toggle('holo-env-live', live);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    var cx = W * 0.5;
    var cy = H * 0.46;
    lastTones = col;
    var amp = live ? (48 + b.bass * 160 + b.stim * 70) : 14;
    var kickEdge = b.kick - lastKick;
    var snareEdge = b.snare - lastSnare;
    if (live && (kickEdge > 0.07 || (b.kick > 0.4 && kickEdge > 0.015))) spawnRing('kick');
    if (live && (snareEdge > 0.08 || (b.snare > 0.36 && snareEdge > 0.02))) spawnRing('snare');
    lastKick = b.kick;
    lastSnare = b.snare;

    /* Room fill — obvious color field, not a whisper. */
    ctx.globalCompositeOperation = 'source-over';
    var bloomR = 180 + b.bass * 340 + b.kick * 220;
    var g = ctx.createRadialGradient(cx, cy, 10, cx, cy, bloomR);
    g.addColorStop(0, rgba(col.b, live ? (0.28 + b.kick * 0.5 + b.stim * 0.22) : 0.06));
    g.addColorStop(0.4, rgba(col.c, live ? (0.18 + b.bass * 0.38) : 0.04));
    g.addColorStop(1, rgba(col.a, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    switch (world.mode) {
      case 'chevron': drawChevron(col, b, t, live, amp); break;
      case 'dots': drawDots(col, b, t, live); break;
      case 'split': drawSplit(col, b, t, live); break;
      case 'tunnel': drawTunnel(col, b, t, live, cx, cy); break;
      case 'lattice': drawLattice(col, b, t, live); break;
      case 'scan': drawScan(col, b, t, live); break;
      case 'shards': drawShards(col, b, t, live, amp); break;
      case 'checker': drawChecker(col, b, t, live); break;
      case 'bars': drawWaves(col, b, t, live, amp * 0.55); break;
      default: drawWaves(col, b, t, live, amp); break;
    }
    drawWaves(col, b, t, live, amp * (world.mode === 'waves' ? 1 : 0.35));

    /* Kick / snare rings */
    var i, r;
    for (i = rings.length - 1; i >= 0; i--) {
      r = rings[i];
      r.r += (live ? 10 : 2) + b.bass * 18 + (r.kind === 'kick' ? 8 : 4);
      r.life -= 0.014 + b.level * 0.012;
      if (r.life <= 0 || r.r > Math.max(W, H) * 0.95) {
        rings.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.lineWidth = r.w * (0.6 + r.life);
      ctx.strokeStyle = rgba(r.kind === 'kick' ? col.b : col.c, r.life * (0.75 + b.stim * 0.25));
      ctx.arc(cx, cy, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* Floor grid that breathes */
    var vanishY = H * 0.52;
    var floorTop = H * 0.58;
    var pulse = live ? (1 + b.bass * 0.7 + b.kick * 0.4) : 1;
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = rgba(col.b, live ? (0.28 + b.stim * 0.35) : 0.08);
    ctx.beginPath();
    var gLine, gx, gy, k, yy, half;
    for (gLine = -8; gLine <= 8; gLine++) {
      gx = cx + gLine * (W * 0.11) * pulse;
      ctx.moveTo(cx, vanishY);
      ctx.lineTo(gx, H + 8);
    }
    for (gy = 0; gy < 9; gy++) {
      k = gy / 8;
      yy = floorTop + Math.pow(k, 1.55) * (H - floorTop);
      half = (W * 0.08 + k * W * 0.55) * pulse;
      ctx.moveTo(cx - half, yy);
      ctx.lineTo(cx + half, yy);
    }
    ctx.stroke();

    drawBars(col, b, t, live);

    ctx.globalCompositeOperation = 'source-over';
    html.style.setProperty('--holo-env-on', live ? '1' : '0');
    html.style.setProperty('--holo-bass', b.bass.toFixed(4));
    html.style.setProperty('--holo-stim', b.stim.toFixed(4));
    html.style.setProperty('--holo-kick', b.kick.toFixed(4));
    html.style.setProperty('--holo-snare', b.snare.toFixed(4));
    html.style.setProperty('--holo-hat', b.hat.toFixed(4));
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
    document.addEventListener('DOMContentLoaded', function () {
      ensureDom();
      applyWorld(currentSlug());
    });
  } else {
    ensureDom();
    applyWorld(currentSlug());
  }
  raf = requestAnimationFrame(draw);
})();
