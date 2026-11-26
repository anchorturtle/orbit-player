/* ============================================
   ORBIT PLAYER — demoboy-btn.js
   Purple lightning that circles the DemoBoy dock buttons.
   One tiny canvas per visible button, ~20 fps, pauses when the tab is hidden.
   prefers-reduced-motion: a single faint static ring, no animation.
   ============================================ */
(function () {
  var PAD = 6;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [];

  function rr(w, h, r) { // perimeter point lookup for a rounded rect (clockwise from top-left corner end)
    var s = Math.max(0, w - 2 * r), v = Math.max(0, h - 2 * r), q = Math.PI * r / 2;
    var L = 2 * s + 2 * v + 4 * q;
    return {
      L: L,
      at: function (d) {
        d = ((d % L) + L) % L;
        var x, y, nx, ny;
        if (d < s) { x = r + d; y = 0; nx = 0; ny = -1; return { x: x, y: y, nx: nx, ny: ny }; }
        d -= s;
        if (d < q) { var a = d / r - Math.PI / 2; return { x: r + s + r * Math.cos(a), y: r + r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) }; }
        d -= q;
        if (d < v) return { x: w, y: r + d, nx: 1, ny: 0 };
        d -= v;
        if (d < q) { var b = d / r; return { x: r + s + r * Math.cos(b), y: r + v + r * Math.sin(b), nx: Math.cos(b), ny: Math.sin(b) }; }
        d -= q;
        if (d < s) return { x: r + s - d, y: h, nx: 0, ny: 1 };
        d -= s;
        if (d < q) { var c = d / r + Math.PI / 2; return { x: r + r * Math.cos(c), y: r + v + r * Math.sin(c), nx: Math.cos(c), ny: Math.sin(c) }; }
        d -= q;
        if (d < v) return { x: 0, y: r + v - d, nx: -1, ny: 0 };
        d -= v;
        var e = d / r + Math.PI; return { x: r + r * Math.cos(e), y: r + r * Math.sin(e), nx: Math.cos(e), ny: Math.sin(e) };
      }
    };
  }

  function make(btn) {
    var cv = document.createElement('canvas');
    cv.className = 'demoboy-bolt';
    cv.setAttribute('aria-hidden', 'true');
    btn.appendChild(cv);
    var it = { btn: btn, cv: cv, ctx: cv.getContext('2d'), w: 0, h: 0, dpr: 1, path: null, seg: null, t0: Math.random() * 1000 };
    items.push(it);
    return it;
  }

  function size(it) {
    var w = it.btn.offsetWidth, h = it.btn.offsetHeight;
    if (!w || !h) { it.w = 0; return false; }
    if (w === it.w && h === it.h) return true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    it.w = w; it.h = h; it.dpr = dpr;
    it.cv.style.width = (w + 2 * PAD) + 'px'; it.cv.style.height = (h + 2 * PAD) + 'px';
    it.cv.style.left = (-PAD - 1) + 'px'; it.cv.style.top = (-PAD - 1) + 'px'; // -1 = button border
    it.cv.width = Math.round((w + 2 * PAD) * dpr); it.cv.height = Math.round((h + 2 * PAD) * dpr);
    it.path = rr(w, h, 10);
    return true;
  }

  function bolt(ctx, path, start, len, amp, seed) {
    var n = Math.max(10, Math.round(len / 4)), pts = [], i, p, j;
    for (i = 0; i <= n; i++) {
      p = path.at(start + len * i / n);
      j = (i === 0 || i === n) ? 0 : (Math.random() * 2 - 1) * amp;
      var fade = Math.sin(Math.PI * i / n); // thin tails, strong middle
      pts.push({ x: p.x + PAD + p.nx * (j + 0.8), y: p.y + PAD + p.ny * (j + 0.8), f: fade });
    }
    function stroke(width, style, blur) {
      ctx.beginPath();
      for (i = 0; i < pts.length; i++) { if (i) ctx.lineTo(pts[i].x, pts[i].y); else ctx.moveTo(pts[i].x, pts[i].y); }
      ctx.lineWidth = width; ctx.strokeStyle = style; ctx.shadowBlur = blur; ctx.shadowColor = 'rgba(150,90,255,.95)';
      ctx.stroke();
    }
    stroke(3.2, 'rgba(123,47,255,.35)', 8);
    stroke(1.5, 'rgba(180,140,255,.9)', 4);
    stroke(0.7, 'rgba(255,255,255,.95)', 0);
    // occasional short fork
    if (Math.random() < 0.45) {
      var k = 2 + Math.floor(Math.random() * (pts.length - 4)), a = pts[k], dir = Math.random() < .5 ? 1 : -1;
      var q = path.at(start + len * k / n);
      ctx.beginPath(); ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + q.nx * 5 * dir + (Math.random() * 4 - 2), a.y + q.ny * 5 * dir + (Math.random() * 4 - 2));
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(200,170,255,.8)'; ctx.shadowBlur = 3; ctx.stroke();
    }
  }

  function draw(it, now, still) {
    if (!size(it)) return;
    var ctx = it.ctx, path = it.path;
    ctx.setTransform(it.dpr, 0, 0, it.dpr, 0, 0);
    ctx.clearRect(0, 0, it.cv.width, it.cv.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (still) { // reduced motion: faint static ring
      ctx.beginPath();
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(167,123,255,.45)'; ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(123,47,255,.8)';
      var s = 40, i, p;
      for (i = 0; i <= s; i++) { p = path.at(path.L * i / s); if (i) ctx.lineTo(p.x + PAD, p.y + PAD); else ctx.moveTo(p.x + PAD, p.y + PAD); }
      ctx.stroke();
      return;
    }
    var t = (now + it.t0) / 1000, head = (t * 0.32 % 1) * path.L; // ~3s per lap
    var len = path.L * 0.30;
    bolt(ctx, path, head, len, 2.6);
    bolt(ctx, path, head + path.L / 2, len * 0.8, 2.2);
    ctx.shadowBlur = 0;
  }

  function init() {
    ['btn-demoboy', 'btn-mob-demoboy'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) make(b);
    });
    if (!items.length) return;
    if (reduce) { items.forEach(function (it) { draw(it, 0, true); }); window.addEventListener('resize', function () { items.forEach(function (it) { it.w = 0; draw(it, 0, true); }); }); return; }
    var last = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden || now - last < 48) return; // ~20 fps
      last = now;
      for (var i = 0; i < items.length; i++) draw(items[i], now, false);
    }
    requestAnimationFrame(frame);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
