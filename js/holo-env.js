/* Holo environment: full-viewport music-reactive world.
   Solid graphic palettes (Ōkami / Samurai Jack). Motion follows a
   smoothed mid/high melody envelope — slow drift, no kick punches. */
(function () {
  'use strict';

  var html = document.documentElement;
  var canvas = null;
  var ctx = null;
  var wash = null;
  var W = 1, H = 1, dpr = 1;
  var raf = 0;
  var lastSlug = '';
  var lastTones = null;
  var ownAnalyser = null;
  var ownFreq = null;
  var reduce = false;
  var melodySm = 0;
  var midSm = 0;
  var highSm = 0;

  /* Solid ink worlds — void + two punches. Ōkami / Samurai Jack graphic. */
  var WORLDS = {
    'quarters':               { pal: ['#000000', '#FFFFFF', '#E10600'], mode: 'waves', pair: 'okami' },
    'offers':                 { pal: ['#000000', '#FFFFFF', '#6B2BFF'], mode: 'waves', pair: 'bw-purple' },
    'thousand-dragon':        { pal: ['#000000', '#FFD100', '#E10600'], mode: 'waves', pair: 'gold-red' },
    'ko':                     { pal: ['#000000', '#00E5A0', '#FF2D6A'], mode: 'waves', pair: 'mint-magenta' },
    'hyperdream-odyssey':     { pal: ['#000000', '#FF2BD6', '#2D5BFF'], mode: 'waves', pair: 'magenta-blue' },
    'soul-seer':              { pal: ['#000000', '#C8FF00', '#1A58E8'], mode: 'waves', pair: 'lime-blue' },
    'geronimo':               { pal: ['#000000', '#FF2A00', '#FFFFFF'], mode: 'waves', pair: 'red-white' },
    'spin-cycle':             { pal: ['#000000', '#00E5FF', '#FF2A5A'], mode: 'waves', pair: 'cyan-red' },
    'mile-high':              { pal: ['#000000', '#1A58E8', '#FFFFFF'], mode: 'waves', pair: 'bw-blue' },
    'follow-the-flow':        { pal: ['#000000', '#00FFC8', '#1A58E8'], mode: 'waves', pair: 'teal-blue' },
    'peace':                  { pal: ['#000000', '#FFFFFF', '#7B2FFF'], mode: 'waves', pair: 'bw-purple' },
    'strider':                { pal: ['#000000', '#FF7A00', '#1A58E8'], mode: 'waves', pair: 'orange-blue' },
    'insane-membrane':        { pal: ['#000000', '#FF0099', '#00E5FF'], mode: 'waves', pair: 'pink-cyan' },
    'wavy':                   { pal: ['#000000', '#00E5FF', '#FF003C'], mode: 'waves', pair: 'cyan-red' },
    'boa-constrictor':        { pal: ['#000000', '#66FF00', '#FF003C'], mode: 'waves', pair: 'lime-red' },
    'news':                   { pal: ['#000000', '#FFFFFF', '#1A58E8'], mode: 'waves', pair: 'bw-blue' },
    'wheels':                 { pal: ['#000000', '#FFB000', '#E10600'], mode: 'waves', pair: 'gold-red' },
    'pop':                    { pal: ['#000000', '#FF00AA', '#FFF000'], mode: 'waves', pair: 'warhol' },
    'the-sum-of-hippy-thoughts': { pal: ['#000000', '#D4FF00', '#7B2FFF'], mode: 'waves', pair: 'lime-purple' },
    'what-dreams-may-come':   { pal: ['#000000', '#7B2FFF', '#00FFC8'], mode: 'waves', pair: 'violet-mint' },
    'jazzpot':                { pal: ['#000000', '#FF6A00', '#1A58E8'], mode: 'waves', pair: 'orange-blue' },
    'fat-stacks':             { pal: ['#000000', '#00FF66', '#FFD100'], mode: 'waves', pair: 'money' },
    'chokeslam':              { pal: ['#000000', '#FFFFFF', '#E10600'], mode: 'waves', pair: 'okami' },
    'grateful-sharpie':       { pal: ['#000000', '#00A3FF', '#FF4D00'], mode: 'waves', pair: 'blue-orange' },
    'my-anthem':              { pal: ['#000000', '#FF0055', '#00F0FF'], mode: 'waves', pair: 'red-cyan' },
    'sublime-beginnings':     { pal: ['#000000', '#FFEE00', '#FF00AA'], mode: 'waves', pair: 'yellow-magenta' },
    'nonnin':                 { pal: ['#000000', '#7B2FFF', '#FFFFFF'], mode: 'waves', pair: 'bw-purple' },
    'whoiam2u':               { pal: ['#000000', '#FF2BD6', '#00FF88'], mode: 'waves', pair: 'pink-mint' },
    'still-going-higher':     { pal: ['#000000', '#1A58E8', '#FFE14D'], mode: 'waves', pair: 'blue-gold' },
    'tomb-of-the-creator':    { pal: ['#000000', '#C8A000', '#E10600'], mode: 'waves', pair: 'gold-blood' },
    'what-is-it-now':         { pal: ['#000000', '#FF2200', '#00FFDD'], mode: 'waves', pair: 'red-teal' },
    'four-twenty':            { pal: ['#000000', '#66FF00', '#FF00AA'], mode: 'waves', pair: 'lime-magenta' },
    'get':                    { pal: ['#000000', '#FFEE00', '#FF0066'], mode: 'waves', pair: 'yellow-pink' },
    'death-of-jestr':         { pal: ['#000000', '#FFFFFF', '#7B2FFF'], mode: 'waves', pair: 'bw-purple' },
    'blockbuster':            { pal: ['#000000', '#FF0044', '#FFE14D'], mode: 'waves', pair: 'red-gold' },
    'got-nun':                { pal: ['#000000', '#FFFFFF', '#E10600'], mode: 'waves', pair: 'okami' },
    'space-radio':            { pal: ['#000000', '#39FF14', '#FF00FF'], mode: 'waves', pair: 'terminal' },
    'exploding-galaxies':     { pal: ['#000000', '#FF00FF', '#00FFFF'], mode: 'waves', pair: 'magenta-cyan' },
    'acid-rain':              { pal: ['#000000', '#CCFF00', '#FF00CC'], mode: 'waves', pair: 'acid' }
  };
  var FALLBACK_MODES = ['waves'];
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
        '#000000',
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
    var mid = Math.max(Number(a.mid) || 0, own ? own.mid : 0);
    var high = Math.max(Number(a.high) || 0, own ? own.high : 0);
    var level = Math.max(Number(a.level) || 0, own ? own.level : 0);
    if (playing() && mid < 0.02 && high < 0.02) {
      mid = Math.max(mid, 0.18 + 0.08 * Math.sin(t * 0.31));
      high = Math.max(high, 0.12 + 0.06 * Math.sin(t * 0.47 + 1.2));
      level = Math.max(level, 0.16);
    }
    var target = Math.min(1, mid * 0.58 + high * 0.42);
    /* Heavy smoothing — melody envelope, never a kick transient. */
    var k = 0.032;
    melodySm += (target - melodySm) * k;
    midSm += (mid - midSm) * 0.028;
    highSm += (high - highSm) * 0.024;
    window.__HOLO_MELODY__ = melodySm;
    return {
      bass: 0,
      mid: midSm,
      high: highSm,
      level: level,
      stim: melodySm,
      melody: melodySm,
      kick: 0,
      snare: 0,
      hat: highSm,
      spec: (a.spec && a.spec.length) ? a.spec : (own && own.spec)
    };
  }

  function paintWash() {
    if (!wash) return;
    wash.style.opacity = '0';
    wash.style.background = 'transparent';
  }

  function drawWaves(col, b, t, live, amp) {
    var layers = 5;
    var li, x, y, y0, freq, speed, m;
    m = b.melody || b.stim || 0;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    for (li = 0; li < layers; li++) {
      y0 = H * (0.22 + li * 0.12);
      freq = 0.0042 + midSm * 0.004 + li * 0.0009;
      speed = t * (0.22 + li * 0.05 + highSm * 0.08);
      ctx.beginPath();
      ctx.lineWidth = (li === 2 ? 2.4 : 1.35);
      ctx.strokeStyle = rgba(li % 2 ? col.c : col.b, live ? (0.84 + m * 0.16) : 0.28);
      for (x = 0; x <= W; x += 6) {
        y = y0
          + Math.sin(x * freq + speed + li * 0.7) * amp * (0.7 + li * 0.08)
          + Math.sin(x * freq * 1.7 - speed * 0.45 + li) * amp * 0.22 * (0.35 + midSm);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function dockClearY(floorTop) {
    var d = document.getElementById('dock-win');
    var gap = 12;
    if (!d) return Math.max(floorTop + 8, H - 110);
    var r = d.getBoundingClientRect();
    return Math.max(floorTop + 8, r.top - gap);
  }

  function drawFloor(col, b, t, live) {
    /* Existing perspective floor only — ink gradient + hatch. No extra verts.
       Clamp above #dock-win so the plate cannot tile a red/blue strip under chrome. */
    var cx = W * 0.5;
    var vanishY = H * 0.52;
    var floorTop = H * 0.58;
    var floorBot = Math.min(H, dockClearY(floorTop));
    if (floorBot <= floorTop + 4) return;
    var m = b.melody || 0;
    var pulse = 1 + m * 0.05;
    var g, k, yy, half, gLine, gx, gy, hx, hs;

    g = ctx.createLinearGradient(0, floorTop, 0, floorBot);
    g.addColorStop(0, rgba(col.a, 0));
    g.addColorStop(0.26, rgba(col.c, live ? 0.18 : 0.07));
    g.addColorStop(0.70, rgba(col.a, live ? 0.58 : 0.22));
    g.addColorStop(1, rgba(col.a, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, floorTop, W, floorBot - floorTop);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, floorTop, W, floorBot - floorTop);
    ctx.clip();
    ctx.strokeStyle = rgba(col.b, live ? 0.14 : 0.06);
    ctx.lineWidth = 1;
    hs = 8;
    for (hx = -H; hx < W + H; hx += hs) {
      ctx.beginPath();
      ctx.moveTo(hx, floorTop);
      ctx.lineTo(hx + (floorBot - floorTop), floorBot);
      ctx.stroke();
    }
    ctx.restore();

    ctx.lineCap = 'square';
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = rgba(col.b, live ? (0.46 + m * 0.2) : 0.14);
    ctx.beginPath();
    for (gLine = -8; gLine <= 8; gLine++) {
      gx = cx + gLine * (W * 0.11) * pulse;
      ctx.moveTo(cx, vanishY);
      ctx.lineTo(gx, floorBot);
    }
    for (gy = 0; gy < 9; gy++) {
      k = (gy + (t * 0.07 % 1)) / 8;
      if (k > 1) k -= 1;
      yy = floorTop + Math.pow(k, 1.55) * (floorBot - floorTop);
      if (yy >= floorBot - 1) continue;
      half = (W * 0.08 + k * W * 0.55) * pulse;
      ctx.moveTo(cx - half, yy);
      ctx.lineTo(cx + half, yy);
    }
    ctx.stroke();
  }

  function draw(ts) {
    raf = requestAnimationFrame(draw);
    if (!isHolo()) {
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (wash) wash.style.opacity = '0';
      html.removeAttribute('data-holo-world');
      html.removeAttribute('data-holo-mode');
      html.removeAttribute('data-holo-pair');
      window.__HOLO_MELODY__ = 0;
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
    paintWash();
    html.classList.toggle('holo-env-live', live);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    lastTones = col;
    /* Existing env waves only — no extra vertex/point geometry. */
    var amp = live ? (9 + b.melody * 16) : 6;
    drawFloor(col, b, t, live);
    drawWaves(col, b, t, live, amp);

    html.style.setProperty('--holo-env-on', live ? '1' : '0');
    html.style.setProperty('--holo-bass', '0');
    html.style.setProperty('--holo-stim', b.melody.toFixed(4));
    html.style.setProperty('--holo-kick', '0');
    html.style.setProperty('--holo-snare', '0');
    html.style.setProperty('--holo-hat', highSm.toFixed(4));
    html.style.setProperty('--holo-melody', b.melody.toFixed(4));
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
