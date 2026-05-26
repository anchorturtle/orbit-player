/* ============================================
   ORBIT PLAYER — player.js
   Music player, tracklist, audio controls, drag-reorder, volume, etc.
   ============================================ */

const TRACKS = [
  {
    title: 'Geronimo',
    artist: 'jestR',
    slug: 'geronimo',
    file: '11 - Geronimo- jestR - 2020.mp3',
    year: 2020,
    description: 'Explosive opener with raw energy and sharp lyricism.',
    artwork: 'Jesterdaze.png'
  },
  {
    title: 'Spin Cycle',
    artist: 'jestR',
    slug: 'spin-cycle',
    file: 'Spin-Cycle_.mp3',
    year: 2025,
    description: '',
    artwork: null
  },
  {
    title: 'Mile High',
    artist: 'jestR',
    slug: 'mile-high',
    file: '3 - Mile High- jestR - 2020.mp3',
    year: 2020,
    description: 'Atmospheric and introspective with soaring melodies.',
    artwork: null
  },
  {
    title: 'Follow The Flow',
    artist: 'jestR',
    slug: 'follow-the-flow',
    file: 'Mp3-FollowTheFlow.mp3',
    year: 2021,
    description: 'Smooth, hypnotic groove exploring surrender and momentum.',
    artwork: null
  },
  {
    title: 'Soul Seer',
    artist: 'jestR',
    slug: 'soul-seer',
    file: 'Mp3-SoulSeer.mp3',
    year: 2021,
    description: 'Mystical and introspective journey through inner vision.',
    artwork: null
  },
  {
    title: 'Peace',
    artist: 'jestR',
    slug: 'peace',
    file: 'Peace.mp3',
    year: 2022,
    description: 'Minimal and meditative. A moment of stillness.',
    artwork: null
  },
  {
    title: 'Strider',
    artist: 'jestR',
    slug: 'strider',
    file: 'Strider.mp3',
    year: 2022,
    description: 'Dark, driving beat with determined, cinematic feel.',
    artwork: null
  },
  {
    title: 'Insane Membrane',
    artist: 'jestR',
    slug: 'insane-membrane',
    file: 'Insane_membrane.mp3',
    year: 2023,
    description: 'Chaotic, textured, and emotionally charged.',
    artwork: null
  },
  {
    title: 'Wavy',
    artist: 'jestR',
    slug: 'wavy',
    file: 'wavy.mp3',
    year: 2023,
    description: 'Liquid, dreamy production with fluid delivery.',
    artwork: 'wavy.mp3' // placeholder - can point to image later
  },
  {
    title: 'Boa Constrictor',
    artist: 'jestR',
    slug: 'boa-constrictor',
    file: 'boaconstrictor.mp3',
    year: 2024,
    description: 'Tense, coiled energy that slowly tightens.',
    artwork: null
  },
  {
    title: 'News',
    artist: 'jestR',
    slug: 'news',
    file: 'Newsss.mp3',
    year: 2024,
    description: 'Sharp commentary wrapped in heavy, distorted beats.',
    artwork: null
  },
  {
    title: 'Wheels',
    artist: 'jestR',
    slug: 'wheels',
    file: 'mp3Wheels-36.mp3',
    year: 2020,
    description: 'Cyclic, hypnotic rhythm. Motion without destination.',
    artwork: null
  },
  {
    title: 'Pop',
    artist: 'jestR',
    slug: 'pop',
    file: 'pop.mp3',
    year: 2024,
    description: 'Playful yet biting take on pop culture.',
    artwork: null
  },
  {
    title: 'The Sum Of Hippy Thoughts',
    artist: 'jestR',
    slug: 'the-sum-of-hippy-thoughts',
    file: 'the sum of hippy thoughts - Output - Stereo Out.mp3',
    year: 2025,
    description: 'Expansive, philosophical closer with lush textures.',
    artwork: null
  },
  {
    title: 'What Dreams May Come',
    artist: 'jestR',
    slug: 'what-dreams-may-come',
    file: 'what_dreams_may_comewavy.wav',
    year: 2020,
    description: 'Ethereal and cinematic. A dreamlike farewell.',
    artwork: 'wavy.mp3'
  }
];

const audio = document.getElementById('audio-player');

let audioContext = null;
let gainNode = null;
let sourceNode = null;

let bgAudioKeepAlive = null;

let currentIndex = 0, isPlaying = false, isShuffle = false, repeatMode = 0;
let seekOnReady = null, isSeeking = false, durationPollTimer = null;
let isMuted = false, premuteVolume = 80;

function initAudioContext() {
  if (audioContext) {
    // Resume context if it was suspended (required on iOS after user gesture)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    return;
  }

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    sourceNode = audioContext.createMediaElementSource(audio);
    gainNode = audioContext.createGain();

    sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set initial gain from current volume setting
    gainNode.gain.value = (premuteVolume || 80) / 100;

  } catch (e) {
    console.warn('Web Audio API not supported or failed to initialize. Falling back to native volume.', e);
    audioContext = null;
    gainNode = null;
  }
}

/* ── Keep Web Audio context alive for background / screen-off playback on iOS ── */
function ensureAudioContextRunning() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
}

// Resume context aggressively for background playback (screen off, app switch)
document.addEventListener('visibilitychange', () => {
  if (isPlaying) {
    ensureAudioContextRunning();

    if (document.visibilityState === 'visible') {
      // User unlocked screen or returned to app
      setTimeout(ensureAudioContextRunning, 30);
      setTimeout(ensureAudioContextRunning, 150);
      setTimeout(ensureAudioContextRunning, 400);
      stopBackgroundAudioKeepAlive();
    } else {
      // Screen locked or app went to background → start the keep-alive immediately
      startBackgroundAudioKeepAlive();
    }
  } else {
    stopBackgroundAudioKeepAlive();
  }
});
window.addEventListener('focus', ensureAudioContextRunning);
document.addEventListener('pageshow', ensureAudioContextRunning);
document.addEventListener('pagehide', () => {
  if (isPlaying) {
    startBackgroundAudioKeepAlive();
  }
});

function startBackgroundAudioKeepAlive() {
  if (!isIOS() || bgAudioKeepAlive) return;

  // Aggressive keep-alive for iOS screen-off / background playback.
  // This combination (fast resume + silent buffer) is the most reliable way
  // to prevent AudioContext suspension when using GainNode on iOS.
  bgAudioKeepAlive = setInterval(() => {
    if (!isPlaying) {
      stopBackgroundAudioKeepAlive();
      return;
    }

    ensureAudioContextRunning();

    // Nudge the <audio> element
    if (audio.paused) {
      audio.play().catch(() => {});
    }

    // Play a tiny silent buffer through the context.
    // This keeps the AudioContext "active" in background on iOS.
    try {
      if (audioContext && audioContext.state === 'running') {
        const buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        if (gainNode) {
          source.connect(gainNode);
        } else {
          source.connect(audioContext.destination);
        }
        source.start(0);
      }
    } catch (e) {}
  }, 350); // 350ms is aggressive but necessary for reliable background on iOS
}

function stopBackgroundAudioKeepAlive() {
  if (bgAudioKeepAlive) {
    clearInterval(bgAudioKeepAlive);
    bgAudioKeepAlive = null;
  }
}

function tryUpdateDuration() {
  const dur = audio.duration;
  if (isGoodDuration(dur)) {
    document.getElementById('time-total').textContent = fmt(dur);
    return true;
  }
  return false;
}

function startDurationPoll() {
  if (durationPollTimer) { clearInterval(durationPollTimer); durationPollTimer = null; }
  const deadline = Date.now() + 30000;
  durationPollTimer = setInterval(() => {
    if (tryUpdateDuration()) { clearInterval(durationPollTimer); durationPollTimer = null; }
    else if (Date.now() >= deadline) { clearInterval(durationPollTimer); durationPollTimer = null; }
  }, 500);
}

function applySavedSeek() {
  if (seekOnReady !== null && audio.readyState >= 1 && isGoodDuration(audio.duration)) {
    audio.currentTime = seekOnReady * audio.duration;
    seekOnReady = null;
    tryUpdateDuration();
  }
}

audio.addEventListener('loadedmetadata', () => { tryUpdateDuration(); applySavedSeek(); });
audio.addEventListener('canplay', () => { tryUpdateDuration(); applySavedSeek(); });
audio.addEventListener('durationchange', () => { tryUpdateDuration(); applySavedSeek(); });

// Critical for keeping music alive in background / when screen turns off on mobile
audio.addEventListener('playing', ensureAudioContextRunning);
audio.addEventListener('play', ensureAudioContextRunning);

function setProgress(pct) {
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-thumb').style.left = pct + '%';
}

function seekToPct(pct) {
  pct = Math.max(0, Math.min(1, pct));
  setProgress(pct * 100);
  if (audio.readyState >= 1 && isGoodDuration(audio.duration)) {
    audio.currentTime = pct * audio.duration;
    seekOnReady = null;
  } else {
    seekOnReady = pct;
  }
}

function skip(sec) {
  if (audio.readyState >= 1 && isGoodDuration(audio.duration)) {
    audio.currentTime = Math.max(0, Math.min(audio.duration, (audio.currentTime || 0) + sec));
  }
}

function clientXToFraction(clientX, rail) {
  const r = rail.getBoundingClientRect();
  return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
}

/* ── PROGRESS SCRUBBER ── */
(function () {
  const rail = document.getElementById('progress-rail');
  let active = false;

  function apply(e) {
    isSeeking = true;
    seekToPct(clientXToFraction(e.clientX, rail));
  }

  rail.addEventListener('pointerdown', e => {
    active = true;
    rail.setPointerCapture(e.pointerId);
    rail.classList.add('dragging');
    apply(e);
    e.preventDefault();
  }, { passive: false });

  rail.addEventListener('pointermove', e => { if (!active) return; apply(e); }, { passive: false });
  rail.addEventListener('pointerup', () => { active = false; rail.classList.remove('dragging'); setTimeout(() => isSeeking = false, 80); });
  rail.addEventListener('pointercancel', () => { active = false; rail.classList.remove('dragging'); isSeeking = false; });
})();

audio.addEventListener('timeupdate', () => {
  if (isSeeking) return;
  const dur = audio.duration, cur = audio.currentTime;
  if (isGoodDuration(dur) && cur >= 0) {
    setProgress((cur / dur) * 100);
    document.getElementById('time-current').textContent = fmt(cur);
  }

  // Critical for iOS background/screen-off playback.
  if (isPlaying) {
    ensureAudioContextRunning();

    // If we're in background and the keep-alive isn't running yet, start it.
    if (document.visibilityState !== 'visible' && isIOS() && !bgAudioKeepAlive) {
      startBackgroundAudioKeepAlive();
    }
  }
});

audio.addEventListener('ended', () => {
  if (repeatMode === 2) { audio.currentTime = 0; audio.play(); return; }
  if (isShuffle) {
    let ni; do { ni = Math.floor(Math.random() * TRACKS.length); } while (TRACKS.length > 1 && ni === currentIndex);
    loadTrack(ni, true);
  } else if (currentIndex < TRACKS.length - 1) {
    loadTrack(currentIndex + 1, true);
  } else if (repeatMode === 1) {
    loadTrack(0, true);
  } else {
    isPlaying = false;
    stopBackgroundAudioKeepAlive();
    updatePlayUI();
  }
});

function updatePlayUI() {
  const playBtn = document.getElementById('btn-play');
  if (playBtn) {
    const icon = playBtn.querySelector('#play-icon');
    playBtn.classList.toggle('playing', isPlaying);

    if (icon) {
      if (isPlaying) {
        icon.textContent = 'pause';
        icon.classList.add('material-symbols-outlined');
        icon.style.fontSize = '28px';
      } else {
        icon.textContent = '';
        icon.classList.remove('material-symbols-outlined');
        icon.style.fontSize = '';
      }
    }
  }

  // On iOS, the mute icon state is tied to playback (soft mute = paused)
  if (isIOS() && isMuted) {
    updateVolumeIcon();
  }

  // Tell the system the current state (helps background / lock screen)
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }
}

function loadTrack(idx, autoplay) {
  currentIndex = idx;
  const t = TRACKS[idx];
  audio.src = t.file;
  audio.load();
  document.getElementById('fp-title').textContent = t.title;
  document.getElementById('fp-artist').textContent = t.artist;
  document.getElementById('focal-title').textContent = t.title;
  document.getElementById('focal-artist').textContent = t.artist;
  document.getElementById('time-total').textContent = '0:00';
  document.getElementById('time-current').textContent = '0:00';
  setProgress(0);
  seekOnReady = null;
  startDurationPoll();

  document.querySelectorAll('.track-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });

  // Media Session API — makes it behave like a real music player on mobile
  // (lock screen controls, background playback, screen off, notification)
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title,
        artist: t.artist || 'jestR',
        album: 'AnchorTurtle',
        artwork: [
          { src: (t.artwork || 'images/at-sea-trans-256.png'), sizes: '256x256', type: 'image/png' }
        ]
      });

      // Set action handlers (only need to do this once, but safe to re-set)
      navigator.mediaSession.setActionHandler('play', () => {
        if (audio.paused) {
          initAudioContext();
          audio.play().then(() => { isPlaying = true; updatePlayUI(); }).catch(() => {});
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audio.pause();
        isPlaying = false;
        updatePlayUI();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        loadTrack((currentIndex + 1) % TRACKS.length, true);
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (audio.currentTime > 3) {
          audio.currentTime = 0;
        } else {
          loadTrack((currentIndex - 1 + TRACKS.length) % TRACKS.length, true);
        }
      });
    } catch (e) {}
  }

  if (autoplay) {
    initAudioContext();
    ensureAudioContextRunning();
    audio.play().then(() => { isPlaying = true; updatePlayUI(); }).catch(() => { isPlaying = false; updatePlayUI(); });
  } else {
    isPlaying = false; updatePlayUI();
  }
}

/* ── PLAYER CONTROLS ── */
document.getElementById('btn-play').addEventListener('click', () => {
  initAudioContext();
  ensureAudioContextRunning();

  if (!audio.src || audio.src === window.location.href) { if (TRACKS.length) loadTrack(0, true); return; }
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    stopBackgroundAudioKeepAlive();
  } else {
    ensureAudioContextRunning();
    audio.play().then(() => { isPlaying = true; }).catch(() => { isPlaying = false; });
    isPlaying = true;
  }
  updatePlayUI();
});

document.getElementById('btn-prev').addEventListener('click', () => {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  loadTrack((currentIndex - 1 + TRACKS.length) % TRACKS.length, isPlaying);
});
document.getElementById('btn-next').addEventListener('click', () => loadTrack((currentIndex + 1) % TRACKS.length, isPlaying));
document.getElementById('btn-back10').addEventListener('click', () => skip(-10));
document.getElementById('btn-fwd10').addEventListener('click', () => skip(10));

document.getElementById('btn-shuffle').addEventListener('click', function () {
  isShuffle = !isShuffle;
  this.classList.toggle('active-state', isShuffle);
});

document.getElementById('btn-repeat').addEventListener('click', function () {
  repeatMode = (repeatMode + 1) % 3;
  const icon = document.getElementById('repeat-icon');
  if (repeatMode === 0) { this.classList.remove('active-state'); icon.textContent = 'repeat'; }
  else if (repeatMode === 1) { this.classList.add('active-state'); icon.textContent = 'repeat'; }
  else { this.classList.add('active-state'); icon.textContent = 'repeat_one'; }
});

/* ── VOLUME ── */
const volSlider = document.getElementById('vol-slider');
const volIcon = document.getElementById('vol-icon');

function setVolume(v) {
  v = Math.max(0, Math.min(100, v));

  // Prefer Web Audio GainNode (works for real mute on iOS)
  if (gainNode) {
    gainNode.gain.value = v / 100;
  } else {
    // Fallback to native volume (doesn't work on iOS)
    audio.volume = v / 100;
  }

  volSlider.value = v;
  volSlider.style.setProperty('--vol-pct', v + '%');
  document.getElementById('vol-pct').textContent = v + '%';

  if (!isMuted) {
    updateVolumeIcon();
    volIcon.classList.remove('muted');
  }
}

function updateVolumeIcon() {
  if (!volIcon || isMuted) return;
  const v = +volSlider.value;
  volIcon.textContent = v === 0 ? 'volume_off' : v < 50 ? 'volume_down' : 'volume_up';
}

volSlider.addEventListener('input', () => {
  initAudioContext();
  ensureAudioContextRunning();

  if (isMuted) { isMuted = false; volIcon.classList.remove('muted'); }
  premuteVolume = +volSlider.value;
  setVolume(+volSlider.value);
  updateVolumeIcon();
});

document.getElementById('vol-icon-wrap').addEventListener('click', () => {
  initAudioContext();
  ensureAudioContextRunning();

  if (isMuted) {
    // Unmute
    isMuted = false;
    setVolume(premuteVolume || 80);
    volIcon.classList.remove('muted');
    updateVolumeIcon();
  } else {
    // Mute (this now works properly even on iOS via GainNode)
    isMuted = true;
    premuteVolume = +volSlider.value || 80;

    if (gainNode) {
      gainNode.gain.value = 0;
    } else {
      audio.volume = 0;
    }

    volIcon.textContent = 'volume_off';
    volIcon.classList.add('muted');
  }
});

setVolume(80);
updateVolumeIcon();

// Full volume slider is now enabled on mobile thanks to Web Audio GainNode.
// It provides the best possible volume control the browser allows (including proper muting on iOS).

/* ── DOWNLOAD ── */
document.getElementById('btn-download').addEventListener('click', () => {
  const t = TRACKS[currentIndex]; if (!t) return;
  const a = document.createElement('a'); a.href = t.file; a.download = t.file; a.click();
});

/* ── TRACKLIST RENDER + DRAG-REORDER ── */
function renderTracklist(filter) {
  const container = document.getElementById('sidebar-tracklist');
  /* preserve drop-line element */
  const dropLine = document.getElementById('drop-line');
  /* clear all track items but keep drop-line */
  Array.from(container.children).forEach(el => { if (el.id !== 'drop-line') el.remove(); });

  const q = (filter || '').toLowerCase();
  const items = TRACKS.map((t, i) => ({ t, origIdx: i }))
    .filter(({ t }) => !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));

  document.getElementById('track-count').textContent = `${items.length}/${TRACKS.length}`;

  items.forEach(({ t, origIdx }) => {
    const el = document.createElement('div');
    el.className = 'track-item' + (origIdx === currentIndex ? ' active' : '');
    el.dataset.idx = origIdx;
    el.innerHTML = `
      <div class="drag-handle" title="Drag to reorder"><span class="material-symbols-outlined" style="font-size:16px;pointer-events:none">drag_indicator</span></div>
      <div style="flex:1;min-width:0">
        <p class="track-title" style="font-size:11px;font-weight:700;color:rgba(233,225,222,.82);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</p>
        <p class="track-artist" style="font-size:8px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(0,200,150,.5);margin:0">${t.artist}</p>
      </div>
      <span class="material-symbols-outlined" style="font-size:13px;color:rgba(150,100,255,.3);flex-shrink:0;font-variation-settings:'FILL' 1">music_note</span>`;
    el.addEventListener('click', e => { 
      if (e.target.closest('.drag-handle')) return; 
      loadTrack(origIdx, true); 
    });

    container.appendChild(el);
  });
}

/* ── TRACKLIST DRAG REORDER ── */
(function () {
  const container = document.getElementById('sidebar-tracklist');
  const dropLine = document.getElementById('drop-line');
  let dragging = null, dragOrigIdx = -1, insertBefore = null, dragMoved = false;

  function getTrackItems() { return Array.from(container.querySelectorAll('.track-item')); }

  function getInsertTarget(clientY) {
    const items = getTrackItems();
    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) return items[i];
    }
    return null;
  }

  function positionDropLine(targetEl) {
    const contRect = container.getBoundingClientRect();
    if (targetEl) {
      const r = targetEl.getBoundingClientRect();
      const y = r.top - contRect.top + container.scrollTop - 2;
      dropLine.style.top = y + 'px';
    } else {
      const items = getTrackItems();
      if (items.length) {
        const last = items[items.length - 1].getBoundingClientRect();
        dropLine.style.top = (last.bottom - contRect.top + container.scrollTop + 1) + 'px';
      } else {
        dropLine.style.top = '0px';
      }
    }
    dropLine.style.left = '4px';
    dropLine.style.right = '4px';
    dropLine.style.display = 'block';
  }

  function startDrag(handle, e) {
    const item = handle.closest('.track-item');
    if (!item) return;
    dragOrigIdx = +item.dataset.idx;
    dragging = item;
    dragMoved = false;
    item.classList.add('is-dragging');
    handle.classList.add('grabbing');
    e.preventDefault();
  }

  function onMove(clientY) {
    if (!dragging) return;
    dragMoved = true;
    insertBefore = getInsertTarget(clientY);
    positionDropLine(insertBefore);
  }

  function endDrag() {
    if (!dragging) { dropLine.style.display = 'none'; return; }
    dragging.classList.remove('is-dragging');
    dragging.querySelector('.drag-handle')?.classList.remove('grabbing');
    dropLine.style.display = 'none';

    // Only reorder if the user actually dragged (moved the mouse while holding the handle)
    if (dragMoved) {
      if (insertBefore !== dragging && insertBefore !== null) {
        const targetIdx = +insertBefore.dataset.idx;
        const moved = TRACKS.splice(dragOrigIdx, 1)[0];
        const newIdx = targetIdx > dragOrigIdx ? targetIdx - 1 : targetIdx;
        TRACKS.splice(newIdx, 0, moved);
        if (currentIndex === dragOrigIdx) currentIndex = newIdx;
        else if (dragOrigIdx < currentIndex && newIdx >= currentIndex) currentIndex--;
        else if (dragOrigIdx > currentIndex && newIdx <= currentIndex) currentIndex++;
      } else if (insertBefore === null && dragging) {
        /* dropped at end (after actual drag) */
        const moved = TRACKS.splice(dragOrigIdx, 1)[0];
        TRACKS.push(moved);
        if (currentIndex === dragOrigIdx) currentIndex = TRACKS.length - 1;
        else if (dragOrigIdx < currentIndex) currentIndex--;
      }
    }
    // If no movement happened, do nothing (just a click on the handle)

    dragging = null; dragOrigIdx = -1; insertBefore = null; dragMoved = false;
    renderTracklist(document.getElementById('search-input').value);
  }

  container.addEventListener('mousedown', e => {
    const handle = e.target.closest('.drag-handle');
    if (handle) startDrag(handle, e);
  });
  container.addEventListener('touchstart', e => {
    const handle = e.target.closest('.drag-handle');
    if (handle) { startDrag(handle, e.touches[0]); }
  }, { passive: false });

  window.addEventListener('mousemove', e => { if (dragging) onMove(e.clientY); });
  window.addEventListener('touchmove', e => { if (dragging) { e.preventDefault(); onMove(e.touches[0].clientY); } }, { passive: false });
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);
})();

document.getElementById('search-input').addEventListener('input', function () {
  renderTracklist(this.value);
});

/* ── SONG DETAIL / SHARE SYSTEM ── */
let currentSongSlug = null;

function findTrackBySlug(slug) {
  return TRACKS.findIndex(t => t.slug === slug);
}

function openSongDetail(slug) {
  const idx = findTrackBySlug(slug);
  if (idx === -1) {
    console.warn('[Song Detail] Track not found for slug:', slug);
    return;
  }

  const track = TRACKS[idx];
  currentSongSlug = slug;

  try {
    // Basic info
    const titleEl = document.getElementById('song-detail-title');
    const artistEl = document.getElementById('song-detail-artist');
    const titleBarEl = document.getElementById('song-detail-title-bar');
    const yearEl = document.getElementById('song-detail-year');

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (titleBarEl) titleBarEl.textContent = track.title;
    if (yearEl) yearEl.textContent = track.year ? track.year : '';

    // Artwork
    const artContainer = document.getElementById('song-detail-art');
    if (artContainer) {
      artContainer.innerHTML = '';
      if (track.artwork) {
        const img = document.createElement('img');
        img.src = track.artwork;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:14px;';
        artContainer.appendChild(img);
      } else {
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.style.cssText = 'font-size:42px;color:var(--jestr-purple);font-variation-settings:"FILL" 1';
        icon.textContent = 'music_note';
        artContainer.appendChild(icon);
      }
    }

    // Description
    const descEl = document.getElementById('song-detail-description');
    if (descEl) {
      descEl.textContent = track.description || 'No description available.';
    }

    // Meta / Credits
    const metaEl = document.getElementById('song-detail-meta');
    if (metaEl) {
      metaEl.innerHTML = `
        <div><strong>Track</strong> ${idx + 1} / ${TRACKS.length}</div>
        ${track.year ? `<div><strong>Year</strong> ${track.year}</div>` : ''}
        <div style="flex:1 1 100%; height:1px; background:rgba(255,255,255,0.06); margin:4px 0;"></div>
        <div style="opacity:0.6;">Dedicated link ready to share</div>
      `;
    }

    // Show the window
    const win = document.getElementById('song-detail-win');
    if (win) {
      win.style.display = 'flex';
      // Aggressively bring to front, especially important for hash links on initial load
      const bring = () => {
        if (typeof bringToFront === 'function') {
          bringToFront('song-detail-win');
        }
      };
      bring();
      requestAnimationFrame(bring);
      setTimeout(bring, 50);
      setTimeout(bring, 150);
    } else {
      console.error('[Song Detail] #song-detail-win not found in DOM');
    }

    // Update browser tab / bookmark title — clean "Title - Artist" format for song shares
    document.title = `${track.title} - ${track.artist}`;

    // Wire dynamic buttons inside the window
    const playBtn = document.getElementById('song-detail-play');
    const downloadBtn = document.getElementById('song-detail-download');
    const shareBtn = document.getElementById('song-detail-share');

    if (playBtn) {
      function syncPlayIcon() {
        playBtn.classList.toggle('playing', currentIndex === idx && isPlaying);

        const icon = playBtn.querySelector('#song-detail-play-icon');
        if (icon) {
          if (currentIndex === idx && isPlaying) {
            icon.textContent = 'pause';
            icon.classList.add('material-symbols-outlined');
            icon.style.fontSize = '32px';
          } else {
            icon.textContent = '';
            icon.classList.remove('material-symbols-outlined');
            icon.style.fontSize = '';
          }
        }
      }
      syncPlayIcon();

      playBtn.onclick = () => {
        if (currentIndex === idx && isPlaying) {
          document.getElementById('audio-player').pause();
          isPlaying = false;
          updatePlayUI();
        } else {
          loadTrack(idx, true);
        }
        syncPlayIcon();
      };
    }

    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = track.file;
        a.download = track.file;
        a.click();
      };
    }

    if (shareBtn) {
      // SHARE inside detail = copy only + inline Copied anim. Does NOT re-open or toggle.
      shareBtn.onclick = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        const url = `${location.origin}/song/${slug}`;
        navigator.clipboard.writeText(url).then(() => {
          const originalHTML = shareBtn.innerHTML;
          shareBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:17px">check</span><span style="font-size:11px; margin-left:6px;">Copied</span>`;
          
          setTimeout(() => {
            shareBtn.innerHTML = originalHTML;
          }, 1600);
        }).catch(() => {
          prompt('Copy this link:', url);
        });
      };
    }

  } catch (err) {
    console.error('[Song Detail] Error opening song detail:', err);
  }
}

// Simple toast system
function showToast(message, duration = 1800) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `
      position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
      background:rgba(10,6,30,.92); color:#e9e1de; padding:8px 16px;
      border-radius:8px; font-size:11px; font-weight:600; letter-spacing:.5px;
      border:1px solid rgba(123,47,255,.25); z-index:9999; backdrop-filter:blur(12px);
      box-shadow:0 4px 20px rgba(0,0,0,.4);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

// Wire player header buttons (desktop + mobile) using event delegation on the stable .win-body.
// This is robust against resize handles, win mousedown capture for bringToFront, narrow window layouts,
// and any stacking/pointer quirks that only appear on desktop windowed player.
const playerWinBody = document.querySelector('#player-win .win-body');
if (playerWinBody) {
  playerWinBody.addEventListener('click', (e) => {
    // SHARE: copy link + inline "Copied" animation ONLY. Never opens details.
    const shareBtn = e.target.closest('#btn-share');
    if (shareBtn) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (currentIndex >= 0 && TRACKS[currentIndex]) {
        const slug = TRACKS[currentIndex].slug;
        const url = `${location.origin}/song/${slug}`;

        navigator.clipboard.writeText(url).then(() => {
          // Liked behavior: temporary "Copied" state directly on the .ctrl-btn (matches mobile/desktop)
          const originalHTML = shareBtn.innerHTML;
          shareBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:15px">check</span><span style="font-size:11px; margin-left:4px;">Copied</span>`;
          
          setTimeout(() => {
            shareBtn.innerHTML = originalHTML;
          }, 1600);
        }).catch(() => {
          prompt('Copy this link:', url);
        });
      }
      return;
    }

    // INFO: opens the song details window (separate concern from Share)
    const infoBtn = e.target.closest('#btn-info');
    if (infoBtn) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (currentIndex >= 0 && TRACKS[currentIndex]) {
        openSongDetail(TRACKS[currentIndex].slug);
      }
      return;
    }
  });
}

// Belt-and-suspenders: also attach directly to the Share button itself.
// Combined with the large right padding (see CSS), this guarantees the click
// fires on desktop even if any stacking/resize edge case remains.
const directShareBtn = document.getElementById('btn-share');
if (directShareBtn) {
  directShareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (currentIndex >= 0 && TRACKS[currentIndex]) {
      const slug = TRACKS[currentIndex].slug;
      const url = `${location.origin}/song/${slug}`;

      navigator.clipboard.writeText(url).then(() => {
        const originalHTML = directShareBtn.innerHTML;
        directShareBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:15px">check</span><span style="font-size:11px; margin-left:4px;">Copied</span>`;
        setTimeout(() => {
          directShareBtn.innerHTML = originalHTML;
        }, 1600);
      }).catch(() => {
        prompt('Copy this link:', url);
      });
    }
  });
}

// Make player title/artist clickable to open details
const fpTitle = document.getElementById('fp-title');
const fpArtist = document.getElementById('fp-artist');
if (fpTitle) fpTitle.style.cursor = 'pointer';
if (fpArtist) fpArtist.style.cursor = 'pointer';

function openCurrentSongDetail() {
  if (currentIndex >= 0 && TRACKS[currentIndex]) {
    openSongDetail(TRACKS[currentIndex].slug);
  }
}
if (fpTitle) fpTitle.addEventListener('click', openCurrentSongDetail);
if (fpArtist) fpArtist.addEventListener('click', openCurrentSongDetail);



// Handle routing for direct song links (dedicated shareable links)
function handleSongRouting() {
  let slug = null;

  // Support clean paths: /song/geronimo
  if (window.location.pathname.startsWith('/song/')) {
    slug = window.location.pathname.replace('/song/', '').replace(/\/$/, '');
    // Update to hash version for SPA consistency
    history.replaceState(null, '', `/#song/${slug}`);
  } 
  // Support old hash links: #song/geronimo
  else if (location.hash.startsWith('#song/')) {
    slug = location.hash.replace('#song/', '');
  }

  if (slug) {
    // Multiple attempts for reliability on initial load.
    // IMPORTANT: Only load/select the track so it plays. Do NOT open the song details window.
    // Desktop: shows normal 3-window layout. Mobile: shows normal tracklist + player.
    const tryOpen = (delay) => {
      setTimeout(() => {
        const idx = findTrackBySlug(slug);
        if (idx !== -1) {
          loadTrack(idx, true);  // true = autoplay the shared song
        }
      }, delay);
    };
    tryOpen(150);
    tryOpen(400);
    tryOpen(800);
    tryOpen(1400);
  }
}

window.addEventListener('hashchange', handleSongRouting);
window.addEventListener('load', handleSongRouting);

// NOTE: handleSongRouting handles /song/slug and #song/slug paths.
// It only does loadTrack(..., true) now — the song plays but the details window is never opened.