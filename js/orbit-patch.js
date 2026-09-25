/* ============================================
   ORBIT v3 — Patchwork room
   Collage living room + per-song funky plates.
   Decorative type is only "jestR" or "quarters".
   ============================================ */
(function () {
  'use strict';

  var html = document.documentElement;
  var room = null;
  var plate = null;
  var plateWrap = null;
  var seedVid = null;
  var scraps = [];
  var raf = 0;
  var lastSlug = '';
  var reduce = false;
  var imgCache = {};
  var plateCache = {};

  /* Opt-in finished stills. Add 'slug': 'assets/patch/songs/<slug>.jpg'
     when a unique AI plate is ready — avoids 404s on every track. */
  var SONG_STILLS = {};

  var MOTIFS = [
    { src: 'assets/patch/patch-vitruvian-jester.png', kind: 'vitruvian' },
    { src: 'assets/patch/patch-coin-anchor-turtle.png', kind: 'coins' },
    { src: 'assets/patch/patch-neon-skull-jester.png', kind: 'skull' },
    { src: 'videos/quarters-poster.jpg', kind: 'clay' },
    { src: 'images/zbuild_blocks_album.jpg', kind: 'blocks' },
    { src: 'images/Jesterdaze.png', kind: 'daze' },
    { src: 'images/joker-bang.png', kind: 'bang' },
    { src: 'images/quarters-cover.jpg', kind: 'cover' }
  ];

  var WARHOL = [
    ['#E8B84A', '#C43B9A', '#1F8A7A', '#E85A4F'],
    ['#00C2CB', '#FFE66D', '#4B1F7A', '#E85A4F'],
    ['#C43B9A', '#F6E7C1', '#1A1020', '#E8B84A'],
    ['#1F8A7A', '#E85A4F', '#FFE66D', '#4B1F7A']
  ];

  var QUARTERS_MP4 = 'https://media.githubusercontent.com/media/anchorturtle/orbit-player/media-store/videos/quarters.mp4';

  function isPatch() {
    return html.classList.contains('theme-patch');
  }

  function hashStr(s) {
    var h = 2166136261;
    s = String(s || '');
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rng(seed) {
    var x = seed >>> 0;
    return function () {
      x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
      return x / 4294967296;
    };
  }

  function loadImg(src) {
    if (imgCache[src]) return imgCache[src];
    imgCache[src] = new Promise(function (resolve) {
      var im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = function () { resolve(im); };
      im.onerror = function () { resolve(null); };
      im.src = src;
    });
    return imgCache[src];
  }

  function currentTrack() {
    if (typeof window.__ORBIT_CURRENT_TRACK__ === 'function') {
      try { return window.__ORBIT_CURRENT_TRACK__() || null; } catch (e) {}
    }
    var tracks = window.ORBIT_TRACKS || window.TRACKS;
    if (tracks && tracks[0]) return tracks[0];
    return { slug: 'quarters', title: 'Quarters', artist: 'jestR' };
  }

  function ensureRoom() {
    if (room) return room;
    room = document.getElementById('patch-room');
    if (!room) {
      room = document.createElement('div');
      room.id = 'patch-room';
      room.setAttribute('aria-hidden', 'true');
      document.body.appendChild(room);
    }
    room.innerHTML = '';

    var sky = document.createElement('div');
    sky.className = 'patch-sky';
    room.appendChild(sky);

    var hills = document.createElement('div');
    hills.className = 'patch-hills';
    room.appendChild(hills);

    var tone = document.createElement('div');
    tone.className = 'patch-halftone';
    room.appendChild(tone);

    scraps = [];
    var scrapSrc = [
      'assets/patch/patch-vitruvian-jester.png',
      'assets/patch/patch-coin-anchor-turtle.png',
      'assets/patch/patch-neon-skull-jester.png',
      'images/zbuild_blocks_album.jpg',
      'videos/quarters-poster.jpg'
    ];
    var places = [
      { t: '8%', l: '4%', w: 110, rot: -12 },
      { t: '14%', r: '5%', w: 96, rot: 8 },
      { t: '38%', l: '2%', w: 84, rot: 16 },
      { t: '42%', r: '3%', w: 120, rot: -7 }
    ];
    for (var i = 0; i < places.length; i++) {
      var sc = document.createElement('div');
      sc.className = 'patch-scrap';
      var p = places[i];
      sc.style.top = p.t;
      if (p.l) sc.style.left = p.l;
      if (p.r) sc.style.right = p.r;
      sc.style.width = p.w + 'px';
      sc.style.height = Math.round(p.w * 0.92) + 'px';
      sc.style.backgroundImage = 'url("' + scrapSrc[i % scrapSrc.length] + '")';
      sc.dataset.baseRot = String(p.rot);
      sc.style.transform = 'rotate(' + p.rot + 'deg)';
      room.appendChild(sc);
      scraps.push(sc);
    }

    var stampA = document.createElement('div');
    stampA.className = 'patch-stamp';
    stampA.textContent = 'jestR';
    stampA.style.top = '10%';
    stampA.style.right = '8%';
    stampA.style.transform = 'rotate(12deg)';
    room.appendChild(stampA);

    var stampB = document.createElement('div');
    stampB.className = 'patch-stamp';
    stampB.textContent = 'quarters';
    stampB.style.bottom = '22%';
    stampB.style.left = '7%';
    stampB.style.transform = 'rotate(-8deg)';
    room.appendChild(stampB);

    var tv = document.createElement('div');
    tv.className = 'patch-tv';
    seedVid = document.createElement('video');
    seedVid.id = 'patch-seed-video';
    seedVid.muted = true;
    seedVid.loop = true;
    seedVid.playsInline = true;
    seedVid.setAttribute('webkit-playsinline', '');
    seedVid.preload = 'metadata';
    seedVid.poster = 'videos/quarters-poster.jpg';
    seedVid.src = QUARTERS_MP4;
    seedVid.setAttribute('aria-hidden', 'true');
    tv.appendChild(seedVid);
    room.appendChild(tv);

    return room;
  }

  function ensurePlate() {
    var host = document.querySelector('.focal-orbit');
    if (!host) return null;
    plateWrap = document.getElementById('patch-plate-wrap');
    if (!plateWrap) {
      plateWrap = document.createElement('div');
      plateWrap.id = 'patch-plate-wrap';
      plateWrap.setAttribute('aria-hidden', 'true');
      plate = document.createElement('canvas');
      plate.id = 'patch-plate';
      plate.width = 720;
      plate.height = 720;
      plateWrap.appendChild(plate);
      host.insertBefore(plateWrap, host.firstChild);
    } else {
      plate = document.getElementById('patch-plate');
    }
    return plate;
  }

  function fillTint(ctx, w, h, hex, alpha) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = alpha == null ? 0.55 : alpha;
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawCover(ctx, img, x, y, w, h) {
    if (!img) return;
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    var s = Math.max(w / iw, h / ih);
    var dw = iw * s;
    var dh = ih * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function stampWord(ctx, word, x, y, size, ang, fill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.font = '700 ' + size + 'px Bungee, Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2, size / 16);
    ctx.strokeStyle = '#1A1020';
    ctx.fillStyle = fill || '#FFE66D';
    ctx.strokeText(word, 0, 0);
    ctx.fillText(word, 0, 0);
    ctx.restore();
  }

  function paintPlate(track) {
    if (!plate) return;
    var slug = (track && track.slug) || 'quarters';
    var ctx = plate.getContext('2d');
    var W = plate.width;
    var H = plate.height;
    var seed = hashStr(slug);
    var rnd = rng(seed);
    var recipe = seed % 6;
    var pal = WARHOL[seed % WARHOL.length];
    var word = slug === 'quarters' ? 'quarters' : 'jestR';

    var picks = MOTIFS.slice();
    // shuffle copy
    for (var i = picks.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = picks[i]; picks[i] = picks[j]; picks[j] = tmp;
    }

    var stillSrc = SONG_STILLS[slug] || '';
    Promise.all([stillSrc ? loadImg(stillSrc) : Promise.resolve(null)].concat(picks.map(function (m) { return loadImg(m.src); }))).then(function (all) {
      if (!isPatch()) return;
      var dedicated = all[0];
      var imgs = all.slice(1).filter(Boolean);
      if (!imgs.length && !dedicated) return;
      if (dedicated) {
        ctx.fillStyle = pal[0];
        ctx.fillRect(0, 0, W, H);
        drawCover(ctx, dedicated, 0, 0, W, H);
        stampWord(ctx, word, W * 0.5, H * 0.86, 48, -0.08, pal[0]);
        lastSlug = slug;
        plateCache[slug] = true;
        syncPlayerArt(track);
        return;
      }
      ctx.fillStyle = pal[0];
      ctx.fillRect(0, 0, W, H);

      if (recipe === 0) {
        // Warhol 4-up
        var cells = [0, 1, 2, 3];
        for (var c = 0; c < 4; c++) {
          var cx = (c % 2) * (W / 2);
          var cy = Math.floor(c / 2) * (H / 2);
          var im = imgs[c % imgs.length];
          ctx.save();
          ctx.beginPath();
          ctx.rect(cx, cy, W / 2, H / 2);
          ctx.clip();
          drawCover(ctx, im, cx, cy, W / 2, H / 2);
          fillTint(ctx, W, H, pal[c], 0.62);
          ctx.restore();
          ctx.strokeStyle = '#1A1020';
          ctx.lineWidth = 10;
          ctx.strokeRect(cx + 5, cy + 5, W / 2 - 10, H / 2 - 10);
        }
      } else if (recipe === 1) {
        // Vitruvian ring + clay center
        ctx.fillStyle = pal[2];
        ctx.fillRect(0, 0, W, H);
        drawCover(ctx, imgs[0], 0, 0, W, H);
        fillTint(ctx, W, H, pal[1], 0.35);
        ctx.strokeStyle = '#1A1020';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, W * 0.42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, W * 0.30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = pal[3];
        ctx.beginPath();
        ctx.moveTo(W * 0.18, H * 0.18);
        ctx.lineTo(W * 0.82, H * 0.82);
        ctx.moveTo(W * 0.82, H * 0.18);
        ctx.lineTo(W * 0.18, H * 0.82);
        ctx.stroke();
      } else if (recipe === 2) {
        // Magazine spread tiles
        ctx.fillStyle = '#F6E7C1';
        ctx.fillRect(0, 0, W, H);
        for (var t = 0; t < 7; t++) {
          var im2 = imgs[t % imgs.length];
          var tw = 180 + rnd() * 220;
          var th = 160 + rnd() * 200;
          var tx = rnd() * (W - tw);
          var ty = rnd() * (H - th);
          ctx.save();
          ctx.translate(tx + tw / 2, ty + th / 2);
          ctx.rotate((rnd() - 0.5) * 0.7);
          ctx.beginPath();
          ctx.rect(-tw / 2, -th / 2, tw, th);
          ctx.clip();
          drawCover(ctx, im2, -tw / 2, -th / 2, tw, th);
          ctx.restore();
          ctx.save();
          ctx.translate(tx + tw / 2, ty + th / 2);
          ctx.rotate((rnd() - 0.5) * 0.7);
          ctx.strokeStyle = '#1A1020';
          ctx.lineWidth = 6;
          ctx.strokeRect(-tw / 2, -th / 2, tw, th);
          ctx.restore();
        }
      } else if (recipe === 3) {
        // Stencil poster
        drawCover(ctx, imgs[0], 0, 0, W, H);
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = pal[1];
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = pal[0];
        ctx.fillRect(0, 0, W, H * 0.18);
        ctx.fillStyle = pal[3];
        ctx.fillRect(0, H * 0.82, W, H * 0.18);
      } else if (recipe === 4) {
        // Claymation still + blocks
        drawCover(ctx, imgs.find(Boolean) || imgs[0], 0, 0, W, H);
        fillTint(ctx, W, H, pal[2], 0.28);
        var block = imgs[4] || imgs[1];
        if (block) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(W * 0.78, H * 0.78, 110, 0, Math.PI * 2);
          ctx.clip();
          drawCover(ctx, block, W * 0.78 - 110, H * 0.78 - 110, 220, 220);
          ctx.restore();
          ctx.lineWidth = 8;
          ctx.strokeStyle = '#1A1020';
          ctx.beginPath();
          ctx.arc(W * 0.78, H * 0.78, 110, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        // Pop diptych
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W / 2, H);
        ctx.clip();
        drawCover(ctx, imgs[0], 0, 0, W / 2, H);
        fillTint(ctx, W, H, pal[0], 0.5);
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.rect(W / 2, 0, W / 2, H);
        ctx.clip();
        drawCover(ctx, imgs[1] || imgs[0], W / 2, 0, W / 2, H);
        fillTint(ctx, W, H, pal[1], 0.5);
        ctx.restore();
        ctx.strokeStyle = '#1A1020';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.stroke();
      }

      // Registration offset (screen-print grit)
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = pal[3];
      ctx.fillRect(6, -4, W, H);
      ctx.restore();

      stampWord(ctx, word, W * (0.28 + rnd() * 0.44), H * (0.78 + rnd() * 0.1), 42 + rnd() * 22, (rnd() - 0.5) * 0.4, pal[0]);

      lastSlug = slug;
      plateCache[slug] = true;
      syncPlayerArt(track);
    });
  }

  function syncPlayerArt(track) {
    if (!isPatch() || !plate) return;
    var art = document.getElementById('fp-art');
    if (!art) return;
    try {
      var url = plate.toDataURL('image/jpeg', 0.72);
      art.innerHTML = '';
      var im = document.createElement('img');
      im.alt = (track && track.title) || 'patch plate';
      im.src = url;
      art.appendChild(im);
    } catch (e) {}
  }

  function restorePlayerArt() {
    var art = document.getElementById('fp-art');
    if (art) art.innerHTML = '<span class="material-symbols-outlined">music_note</span>';
  }

  function playSeed() {
    if (!seedVid || !isPatch()) return;
    var p = seedVid.play();
    if (p && p.catch) p.catch(function () {});
  }

  function pauseSeed() {
    if (seedVid) {
      try { seedVid.pause(); } catch (e) {}
    }
  }

  var t0 = 0;
  function tick(now) {
    raf = 0;
    if (!isPatch()) return;
    if (!reduce) {
      var t = (now || 0) * 0.001;
      // Claymation step: quantize time so scraps hop, not glide
      var step = Math.floor(t * 6);
      if (step !== t0) {
        t0 = step;
        for (var i = 0; i < scraps.length; i++) {
          var base = parseFloat(scraps[i].dataset.baseRot || '0');
          var wob = ((step + i * 3) % 5) - 2;
          scraps[i].style.transform = 'rotate(' + (base + wob) + 'deg) translateY(' + (wob * 1.2) + 'px)';
        }
        if (plateWrap) {
          var kick = 0;
          try { kick = (window.__ORBIT_AUDIO__ && window.__ORBIT_AUDIO__.bass) || 0; } catch (e2) {}
          var s = 1 + kick * 0.04;
          plateWrap.style.transform = 'scale(' + s.toFixed(3) + ') rotate(' + ((step % 2) ? 0.4 : -0.4) + 'deg)';
        }
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function applyTrack(track) {
    track = track || currentTrack();
    ensurePlate();
    paintPlate(track);
  }

  function applySkin() {
    reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (isPatch()) {
      ensureRoom();
      ensurePlate();
      applyTrack(currentTrack());
      playSeed();
      if (!raf) raf = requestAnimationFrame(tick);
    } else {
      pauseSeed();
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      restorePlayerArt();
      if (plateWrap) plateWrap.style.transform = '';
    }
  }

  window.addEventListener('orbit-skin-change', applySkin);
  window.addEventListener('orbit-track-change', function (ev) {
    if (!isPatch()) return;
    applyTrack(ev && ev.detail && ev.detail.track);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySkin);
  } else {
    applySkin();
  }

  window.__ORBIT_PATCH_PAINT__ = applyTrack;
})();
