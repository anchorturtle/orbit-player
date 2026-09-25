/* ============================================
   Sfumato orbit-deck — shared Orbit catalog + gapless-ish switches
   Takes over the baked-in dock player so it cannot drift from ORBIT_TRACKS.
   Single <audio> only (no dual-element iOS handoff / Web Audio).
   ============================================ */
(function () {
  const LIVE_ORIGIN = 'https://www.anchorturtle.com/';
  const STORAGE_KEY = 'sfumato:orbit-deck';
  const ICON = {
    play: '<svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>',
    pause: '<svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="14" y="4" width="4" height="16" rx="1"></rect><rect x="6" y="4" width="4" height="16" rx="1"></rect></svg>'
  };

  let audio = null;
  let warmer = null;
  let host = null;
  let titleEl = null;
  let playBtn = null;
  let picker = null;
  let idx = 0;
  let wantPlay = false;
  let resumeTime = 0;
  let adopted = false;
  let persistTimer = 0;

  function catalog() {
    const list = window.ORBIT_TRACKS;
    return Array.isArray(list) ? list : [];
  }

  function audioUrl(file) {
    if (!file) return '';
    const encoded = String(file).split('/').map(encodeURIComponent).join('/');
    try {
      return new URL(encoded, LIVE_ORIGIN).href;
    } catch (e) {
      return '/' + encoded;
    }
  }

  function current() {
    return catalog()[idx] || null;
  }

  function findIndex(slug, fallback) {
    const list = catalog();
    const i = list.findIndex((t) => t && t.slug === slug);
    if (i >= 0) return i;
    if (Number.isInteger(fallback) && fallback >= 0 && fallback < list.length) return fallback;
    return 0;
  }

  function readStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw || typeof raw !== 'object') return { i: 0, t: 0 };
      const t = typeof raw.t === 'number' && raw.t > 0 ? raw.t : 0;
      return { i: findIndex(raw.slug, raw.i), t: t };
    } catch (e) {
      return { i: 0, t: 0 };
    }
  }

  function writeStore(time) {
    const t = current();
    if (!t) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        slug: t.slug,
        i: idx,
        t: Math.floor(typeof time === 'number' ? time : (audio && audio.currentTime) || 0)
      }));
    } catch (e) {}
  }

  function schedulePersist() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => writeStore(), 400);
  }

  function prefetchAround() {
    const list = catalog();
    if (!list.length) return;
    const around = [
      list[idx],
      list[(idx + 1) % list.length],
      list[(idx - 1 + list.length) % list.length]
    ];
    around.forEach((t) => {
      if (!t || !t.file) return;
      const href = audioUrl(t.file);
      const key = t.slug || href;
      if (document.querySelector(`link[data-orbit-prefetch="${key}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'audio';
      link.href = href;
      link.crossOrigin = 'anonymous';
      link.setAttribute('data-orbit-prefetch', key);
      document.head.appendChild(link);
    });
    const next = list[(idx + 1) % list.length];
    if (next && warmer) {
      const href = audioUrl(next.file);
      if (warmer.src !== href) {
        warmer.preload = 'auto';
        warmer.src = href;
      }
    }
  }

  function setPlayingUI(on) {
    if (!playBtn) return;
    playBtn.classList.toggle('is-on', !!on);
    playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
    playBtn.innerHTML = on ? ICON.pause : ICON.play;
  }

  function setTitle() {
    const t = current();
    if (!titleEl || !t) return;
    titleEl.textContent = t.title;
    titleEl.title = `${t.title} — ${t.artist || 'jestR'}`;
    titleEl.dataset.slug = t.slug || '';
    renderPicker();
  }

  function mediaIsFor(t) {
    if (!audio || !t) return false;
    const src = audio.currentSrc || audio.src || '';
    if (!src) return false;
    return src.includes(t.file) || src.includes(encodeURI(t.file)) || src.includes(audioUrl(t.file));
  }

  function load(nextIdx, { play, fromStart, savedTime } = {}) {
    const list = catalog();
    if (!list.length || !audio) return;
    idx = ((nextIdx % list.length) + list.length) % list.length;
    const t = list[idx];
    const href = audioUrl(t.file);
    const shouldPlay = play == null ? wantPlay : !!play;
    wantPlay = shouldPlay;
    const startAt = fromStart ? 0 : (typeof savedTime === 'number' ? savedTime : 0);
    resumeTime = startAt > 1 ? startAt : 0;

    if (!mediaIsFor(t)) {
      audio.src = href;
      audio.load();
    } else if (fromStart) {
      try { audio.currentTime = 0; } catch (e) {}
    }
    setTitle();
    writeStore(resumeTime);
    prefetchAround();
    if (shouldPlay) {
      const p = audio.play();
      if (p) p.then(() => setPlayingUI(true)).catch(() => setPlayingUI(false));
    } else {
      setPlayingUI(false);
    }
  }

  function applyResume() {
    if (!audio || !(resumeTime > 1)) return;
    try {
      const dur = audio.duration;
      if (Number.isFinite(dur) && dur > 0) {
        audio.currentTime = Math.min(resumeTime, Math.max(0, dur - 0.05));
      } else {
        audio.currentTime = resumeTime;
      }
    } catch (e) {}
    resumeTime = 0;
  }

  function togglePlay() {
    if (!audio) return;
    if (audio.paused) {
      wantPlay = true;
      if (!audio.src) load(idx, { play: true });
      const p = audio.play();
      if (p) p.then(() => setPlayingUI(true)).catch(() => setPlayingUI(false));
      else setPlayingUI(true);
    } else {
      wantPlay = false;
      audio.pause();
      setPlayingUI(false);
      writeStore();
    }
  }

  function step(dir) {
    // Always start the next file at 0 — never carry the previous track's time.
    load(idx + dir, { play: wantPlay || !audio.paused, fromStart: true });
  }

  function renderPicker() {
    if (!picker) return;
    const list = catalog();
    picker.innerHTML = '';
    const tabs = document.createElement('div');
    tabs.className = 'orbit-deck-picker-tabs';
    ['all', 'instrumental', 'rap'].forEach((cat) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'orbit-tab' + (picker.dataset.cat === cat || (!picker.dataset.cat && cat === 'all') ? ' is-on' : '');
      b.textContent = cat === 'all' ? 'All' : (cat === 'rap' ? 'Raps' : 'Instr.');
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        picker.dataset.cat = cat;
        renderPicker();
      });
      tabs.appendChild(b);
    });
    picker.appendChild(tabs);
    const ul = document.createElement('div');
    ul.className = 'orbit-deck-picker-list';
    const cat = picker.dataset.cat || 'all';
    list.forEach((t, i) => {
      if (cat !== 'all' && t.category && t.category !== cat) return;
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'orbit-deck-picker-row' + (i === idx ? ' is-on' : '');
      row.textContent = t.title;
      row.title = `${t.title} — ${t.artist || 'jestR'}`;
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        load(i, { play: true, fromStart: true });
        picker.hidden = true;
      });
      ul.appendChild(row);
    });
    picker.appendChild(ul);
  }

  function togglePicker() {
    if (!picker) return;
    picker.hidden = !picker.hidden;
    if (!picker.hidden) {
      renderPicker();
      placePicker();
    }
  }

  function bindControls(root) {
    const buttons = [...root.querySelectorAll('.orbit-deck-btn')];
    const prev = buttons.find((b) => b.getAttribute('aria-label') === 'Previous track') || buttons[0];
    const play = buttons.find((b) => b.classList.contains('orbit-deck-play')) || buttons[1];
    const next = buttons.find((b) => b.getAttribute('aria-label') === 'Next track') || buttons[2];
    playBtn = play;
    titleEl = root.querySelector('.orbit-deck-title');

    const swallow = (fn) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      fn();
    };

    if (prev) {
      prev.addEventListener('click', swallow(() => step(-1)), true);
      prev.addEventListener('pointerdown', (e) => e.stopPropagation(), true);
    }
    if (next) {
      next.addEventListener('click', swallow(() => step(1)), true);
      next.addEventListener('pointerdown', (e) => e.stopPropagation(), true);
    }
    if (play) {
      play.addEventListener('click', swallow(togglePlay), true);
      play.addEventListener('pointerdown', (e) => e.stopPropagation(), true);
    }
    if (titleEl) {
      titleEl.setAttribute('role', 'button');
      titleEl.tabIndex = 0;
      titleEl.addEventListener('click', swallow(togglePicker), true);
      titleEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          togglePicker();
        }
      });
    }
  }

  function ensurePicker(root) {
    picker = document.getElementById('orbit-deck-picker');
    if (!picker) {
      picker = document.createElement('div');
      picker.id = 'orbit-deck-picker';
      picker.className = 'orbit-deck-picker orbit-win';
      picker.hidden = true;
      picker.dataset.cat = 'all';
      document.body.appendChild(picker);
    }
    if (picker.dataset.wired === '1') return;
    picker.dataset.wired = '1';
    document.addEventListener('click', (e) => {
      if (!picker || picker.hidden) return;
      if (picker.contains(e.target) || (host && host.contains(e.target))) return;
      picker.hidden = true;
    });
    window.addEventListener('resize', () => placePicker());
  }

  function placePicker() {
    if (!picker || picker.hidden || !host) return;
    const r = host.getBoundingClientRect();
    const width = Math.min(280, Math.max(220, r.width));
    picker.style.width = width + 'px';
    picker.style.left = Math.max(8, Math.min(window.innerWidth - width - 8, r.left)) + 'px';
    const spaceBelow = window.innerHeight - r.bottom;
    if (spaceBelow < 220 && r.top > spaceBelow) {
      picker.style.top = 'auto';
      picker.style.bottom = (window.innerHeight - r.top + 8) + 'px';
    } else {
      picker.style.bottom = 'auto';
      picker.style.top = (r.bottom + 8) + 'px';
    }
  }

  function adopt(root) {
    if (!root || root.dataset.orbitSync === '1') return false;
    if (audio) {
      try { audio.pause(); audio.removeAttribute('src'); } catch (e) {}
    }
    host = root;
    root.dataset.orbitSync = '1';

    const baked = root.querySelector('audio');
    if (baked) {
      try {
        baked.pause();
        baked.removeAttribute('src');
        baked.preload = 'none';
        baked.muted = true;
      } catch (e) {}
    }

    audio = document.createElement('audio');
    audio.preload = 'auto';
    audio.playsInline = true;
    audio.setAttribute('playsinline', '');
    audio.setAttribute('webkit-playsinline', '');
    root.insertBefore(audio, root.firstChild);

    warmer = document.createElement('audio');
    warmer.preload = 'auto';
    warmer.muted = true;
    warmer.setAttribute('aria-hidden', 'true');

    audio.addEventListener('ended', () => {
      if (wantPlay) step(1);
    });
    audio.addEventListener('play', () => setPlayingUI(true));
    audio.addEventListener('pause', () => {
      if (!wantPlay) setPlayingUI(false);
    });
    audio.addEventListener('loadedmetadata', applyResume);
    audio.addEventListener('canplay', () => {
      applyResume();
      if (wantPlay && audio.paused) {
        const p = audio.play();
        if (p) p.catch(() => {});
      }
    });
    audio.addEventListener('timeupdate', () => {
      const t = audio.currentTime || 0;
      if ((t | 0) % 5 === 0) schedulePersist();
    });

    bindControls(root);
    ensurePicker(root);

    const saved = readStore();
    idx = saved.i;
    load(idx, { play: false, savedTime: saved.t });
    adopted = true;
    return true;
  }

  function scan() {
    const el = document.querySelector('.orbit-deck');
    if (el) adopt(el);
  }

  function boot() {
    scan();
    const obs = new MutationObserver(() => {
      const el = document.querySelector('.orbit-deck');
      if (el && el.dataset.orbitSync !== '1') adopt(el);
      if (titleEl && current() && titleEl.textContent !== current().title) setTitle();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
