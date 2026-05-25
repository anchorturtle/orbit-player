/* ============================================
   ORBIT PLAYER — player.js
   Music player, tracklist, audio controls, drag-reorder, volume, etc.
   ============================================ */

const TRACKS = [
  {title:'Geronimo',                  artist:'jestR', file:'11 - Geronimo- jestR - 2020.mp3'},
  {title:'Mile High',                 artist:'jestR', file:'3 - Mile High- jestR - 2020.mp3'},
  {title:'Follow The Flow',           artist:'jestR', file:'Mp3-FollowTheFlow.mp3'},
  {title:'Soul Seer',                 artist:'jestR', file:'Mp3-SoulSeer.mp3'},
  {title:'Peace',                     artist:'jestR', file:'Peace.mp3'},
  {title:'Strider',                   artist:'jestR', file:'Strider.mp3'},
  {title:'Insane Membrane',           artist:'jestR', file:'Insane_membrane.mp3'},
  {title:'Wavy',                      artist:'jestR', file:'wavy.mp3'},
  {title:'Boa Constrictor',           artist:'jestR', file:'boaconstrictor.mp3'},
  {title:'News',                      artist:'jestR', file:'Newsss.mp3'},
  {title:'Wheels',                    artist:'jestR', file:'mp3Wheels-36.mp3'},
  {title:'Pop',                       artist:'jestR', file:'pop.mp3'},
  {title:'The Sum Of Hippy Thoughts', artist:'jestR', file:'the sum of hippy thoughts - Output - Stereo Out.mp3'},
  {title:'What Dreams May Come',      artist:'jestR', file:'what_dreams_may_comewavy.wav'},
];

const audio = document.getElementById('audio-player');
let currentIndex = 0, isPlaying = false, isShuffle = false, repeatMode = 0;
let seekOnReady = null, isSeeking = false, durationPollTimer = null;
let isMuted = false, premuteVolume = 80;

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
    isPlaying = false; updatePlayUI();
  }
});

function updatePlayUI() {
  document.getElementById('play-icon').textContent = isPlaying ? 'pause' : 'play_arrow';
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

  if (autoplay) {
    audio.play().then(() => { isPlaying = true; updatePlayUI(); }).catch(() => { isPlaying = false; updatePlayUI(); });
  } else {
    isPlaying = false; updatePlayUI();
  }
}

/* ── PLAYER CONTROLS ── */
document.getElementById('btn-play').addEventListener('click', () => {
  if (!audio.src || audio.src === window.location.href) { if (TRACKS.length) loadTrack(0, true); return; }
  if (isPlaying) { audio.pause(); isPlaying = false; }
  else { audio.play().then(() => { isPlaying = true; }).catch(() => { isPlaying = false; }); isPlaying = true; }
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
  audio.volume = v / 100;
  volSlider.value = v;
  volSlider.style.setProperty('--vol-pct', v + '%');
  document.getElementById('vol-pct').textContent = v + '%';
  if (!isMuted) {
    volIcon.textContent = v === 0 ? 'volume_off' : v < 50 ? 'volume_down' : 'volume_up';
    volIcon.classList.toggle('muted', false);
  }
}

volSlider.addEventListener('input', () => {
  if (isMuted) { isMuted = false; volIcon.classList.remove('muted'); }
  premuteVolume = +volSlider.value;
  setVolume(+volSlider.value);
});

document.getElementById('vol-icon-wrap').addEventListener('click', () => {
  if (isMuted) { isMuted = false; setVolume(premuteVolume || 80); volIcon.classList.remove('muted'); }
  else { premuteVolume = +volSlider.value || 80; isMuted = true; audio.volume = 0; volIcon.textContent = 'volume_off'; volIcon.classList.add('muted'); }
});

setVolume(80);

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
    el.addEventListener('click', e => { if (e.target.closest('.drag-handle')) return; loadTrack(origIdx, true); });
    container.appendChild(el);
  });
}

/* ── TRACKLIST DRAG REORDER ── */
(function () {
  const container = document.getElementById('sidebar-tracklist');
  const dropLine = document.getElementById('drop-line');
  let dragging = null, dragOrigIdx = -1, insertBefore = null;

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
    item.classList.add('is-dragging');
    handle.classList.add('grabbing');
    e.preventDefault();
  }

  function onMove(clientY) {
    if (!dragging) return;
    insertBefore = getInsertTarget(clientY);
    positionDropLine(insertBefore);
  }

  function endDrag() {
    if (!dragging) { dropLine.style.display = 'none'; return; }
    dragging.classList.remove('is-dragging');
    dragging.querySelector('.drag-handle')?.classList.remove('grabbing');
    dropLine.style.display = 'none';

    if (insertBefore !== dragging && insertBefore !== null) {
      const targetIdx = +insertBefore.dataset.idx;
      const moved = TRACKS.splice(dragOrigIdx, 1)[0];
      const newIdx = targetIdx > dragOrigIdx ? targetIdx - 1 : targetIdx;
      TRACKS.splice(newIdx, 0, moved);
      if (currentIndex === dragOrigIdx) currentIndex = newIdx;
      else if (dragOrigIdx < currentIndex && newIdx >= currentIndex) currentIndex--;
      else if (dragOrigIdx > currentIndex && newIdx <= currentIndex) currentIndex++;
    } else if (insertBefore === null && dragging) {
      /* dropped at end */
      const moved = TRACKS.splice(dragOrigIdx, 1)[0];
      TRACKS.push(moved);
      if (currentIndex === dragOrigIdx) currentIndex = TRACKS.length - 1;
      else if (dragOrigIdx < currentIndex) currentIndex--;
    }

    dragging = null; dragOrigIdx = -1; insertBefore = null;
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