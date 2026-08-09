/* ============================================
   ORBIT PLAYER — player.js
   Music player, tracklist, audio controls, drag-reorder, volume, etc.
   ============================================ */

const TRACKS = [
  {
    title: 'Offers',
    artist: 'jestR',
    slug: 'offers',
    file: 'audio/Offers.mp3',
    year: 2026,
    description: '',
    category: 'instrumental'
  },
  {
    title: 'Thousand Dragon',
    artist: 'jestR',
    slug: 'thousand-dragon',
    file: 'audio/Thousand-Dragon-jestR.mp3',
    year: 2026,
    description: '',
    category: 'instrumental'
  },
  {
    title: 'K.O.',
    artist: 'jestR',
    slug: 'ko',
    file: 'audio/KO.mp3',
    year: 2026,
    description: '',
    category: 'instrumental'
  },
  {
    title: 'hyperdream.odyssey.exe',
    artist: 'jestR',
    slug: 'hyperdream-odyssey',
    file: 'audio/hyperdream-odyssey.mp3',
    year: 2026,
    description: '',
    category: 'instrumental'
  },
  {
    title: 'Soul Seer',
    artist: 'jestR',
    slug: 'soul-seer',
    file: 'audio/Mp3-SoulSeer.mp3',
    year: 2021,
    description: 'Mystical and introspective journey through inner vision.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Geronimo',
    artist: 'jestR',
    slug: 'geronimo',
    file: 'audio/11 - Geronimo- jestR - 2020.mp3',
    year: 2020,
    description: 'Explosive opener with raw energy and sharp lyricism.',
    artwork: 'images/Jesterdaze.png',
    category: 'instrumental'
  },
  {
    title: 'Spin Cycle',
    artist: 'jestR',
    slug: 'spin-cycle',
    file: 'audio/Spin-Cycle_.mp3',
    year: 2025,
    description: '',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Mile High',
    artist: 'jestR',
    slug: 'mile-high',
    file: 'audio/3 - Mile High- jestR - 2020.mp3',
    year: 2020,
    description: 'Atmospheric and introspective with soaring melodies.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Follow The Flow',
    artist: 'jestR',
    slug: 'follow-the-flow',
    file: 'audio/Mp3-FollowTheFlow.mp3',
    year: 2021,
    description: 'Smooth, hypnotic groove exploring surrender and momentum.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Peace',
    artist: 'jestR',
    slug: 'peace',
    file: 'audio/Peace.mp3',
    year: 2022,
    description: 'Minimal and meditative. A moment of stillness.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Strider',
    artist: 'jestR',
    slug: 'strider',
    file: 'audio/Strider.mp3',
    year: 2022,
    description: 'Dark, driving beat with determined, cinematic feel.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Insane Membrane',
    artist: 'jestR',
    slug: 'insane-membrane',
    file: 'audio/Insane_membrane.mp3',
    year: 2023,
    description: 'Chaotic, textured, and emotionally charged.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Wavy',
    artist: 'jestR',
    slug: 'wavy',
    file: 'audio/wavy.mp3',
    year: 2023,
    description: 'Liquid, dreamy production with fluid delivery.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Boa Constrictor',
    artist: 'jestR',
    slug: 'boa-constrictor',
    file: 'audio/boaconstrictor.mp3',
    year: 2024,
    description: 'Tense, coiled energy that slowly tightens.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'News',
    artist: 'jestR',
    slug: 'news',
    file: 'audio/Newsss.mp3',
    year: 2024,
    description: 'Sharp commentary wrapped in heavy, distorted beats.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Wheels',
    artist: 'jestR',
    slug: 'wheels',
    file: 'audio/mp3Wheels-36.mp3',
    year: 2020,
    description: 'Cyclic, hypnotic rhythm. Motion without destination.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Pop',
    artist: 'jestR',
    slug: 'pop',
    file: 'audio/pop.mp3',
    year: 2024,
    description: 'Playful yet biting take on pop culture.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'The Sum Of Hippy Thoughts',
    artist: 'jestR',
    slug: 'the-sum-of-hippy-thoughts',
    file: 'audio/the sum of hippy thoughts.mp3',
    year: 2025,
    description: 'Expansive, philosophical closer with lush textures.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'What Dreams May Come',
    artist: 'jestR',
    slug: 'what-dreams-may-come',
    file: 'audio/what_dreams_may_comewavy.wav',
    year: 2020,
    description: 'Ethereal and cinematic. A dreamlike farewell.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Jazzpot',
    artist: 'jestR',
    slug: 'jazzpot',
    file: 'audio/jazzpot3.mp3',
    year: 2026,
    description: 'Jazz pot session.',
    artwork: null,
    category: 'rap',
    // lyrics hardcoded for reliable loading (dynamic fetch often fails when opening index.html directly via file://)
    // To regenerate: run the sync script, then copy the array here (or serve the site with a web server for dynamic load)
    lyrics: [
      {"time":24.0,"text":"No stress when I flex"},
      {"time":25.59,"text":"Feel it in the back of ya necks"},
      {"time":27.179,"text":"Spit straight shots, I got next"},
      {"time":28.769,"text":"Wrist watches stop for this text"},
      {"time":30.359,"text":"The tip-top cream of the crop"},
      {"time":31.949,"text":"Swept off ya feet for this bop"},
      {"time":33.538,"text":"I split seven seas when I rock"},
      {"time":35.128,"text":"Cooking up steez like a crackshot"},
      {"time":36.718,"text":"I’m the mascot of hittin’ the jackpot"},
      {"time":38.308,"text":"A Sasquatch laughing his ass off"},
      {"time":39.897,"text":"A Mothman trippin’ off bath salts"},
      {"time":41.487,"text":"The sugar cane drippin’ on ya windowpane"},
      {"time":43.077,"text":"The profane finger point on both hands to stay sane"},
      {"time":44.667,"text":"Folks, it’s the ace in the hole"},
      {"time":46.256,"text":"The best-kept secret since Coke"},
      {"time":47.846,"text":"Slept on and treated like I’m slow"},
      {"time":49.436,"text":"’Cuz I take my time when I line up these flows"},
      {"time":51.026,"text":"As soon as it enters ya soul"},
      {"time":52.615,"text":"Everything shiny as gold"},
      {"time":54.205,"text":"Feelings that I can’t control"},
      {"time":55.795,"text":"No prophets have ever foretold"},
      {"time":57.385,"text":"The raps that shattered the mold"},
      {"time":58.974,"text":"Real talk that matters the most"},
      {"time":60.564,"text":"The worm inside of the host"},
      {"time":62.154,"text":"Make puppets out of holy ghosts"},
      {"time":63.744,"text":"’Cuz I swear that ya doing the most"},
      {"time":65.333,"text":"On the twos and the fours"},
      {"time":66.923,"text":"Ain’t looking for boos or applause"},
      {"time":68.513,"text":"Just tryna find who wit the cause"},
      {"time":70.103,"text":"Pursuit of the finest of awes"},
      {"time":71.692,"text":"My mind is a pilot, got mileage"},
      {"time":73.282,"text":"But they say that no man an island"},
      {"time":74.872,"text":"I feel like I died in asylum"},
      {"time":76.462,"text":"Came back and grew a new phylum"},
      {"time":78.051,"text":"Got fat off stacks"},
      {"time":79.641,"text":"And still I’m unrivaled"},
      {"time":81.231,"text":"Like hot wax spilling on vinyl"},
      {"time":82.821,"text":"Turn a black sheep into an albino"},
      {"time":84.41,"text":"Murder I reap, blood with the spinal"},
    {"time":86.0,"text":"And judgment is final"}
    ],
  },
  {
      title: 'Still Going Higher',
      artist: 'jestR',
      slug: 'still-going-higher',
      file: 'audio/Still_Going_Higher.mp3',
      year: 2026,
      description: 'Motivational rap track with driving energy.',
      category: 'rap',
      lyrics: []
    },
    {
      title: 'Fat Stacks',
      artist: 'jestR',
      slug: 'fat-stacks',
      file: 'audio/Fat Stacks.mp3',
      year: 2024,
      description: 'Rap track - fat stacks energy.',
      category: 'rap',
      lyrics: []
    },
    {
      title: 'Chokeslam',
      artist: 'jestR',
      slug: 'chokeslam',
      file: 'audio/Chokeslam.mp3',
      year: 2024,
      description: 'Rap track - chokeslam impact.',
      category: 'rap',
      lyrics: []
    }
  ];
  window.ORBIT_TRACKS = TRACKS;

let currentTracklistCategory = 'all';

const audio = document.getElementById('audio-player');

let audioContext = null;
let gainNode = null;
let sourceNode = null;

let bgAudioKeepAlive = null;
let silentBackgroundSource = null;

let currentIndex = 0, isPlaying = false, isShuffle = false, repeatMode = 0;
let seekOnReady = null, isSeeking = false, durationPollTimer = null;
let isMuted = false, premuteVolume = 100;
let currentWaveform = null;
let waveformCanvas = null;
let waveformCache = {}; // per-slug real waveform peaks cache

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
    gainNode.gain.value = (premuteVolume || 100) / 100;

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
    if (document.visibilityState === 'visible') {
      // User unlocked screen / returned to the page
      if (isIOS() && iosBackgroundAudio) {
        // We were using native background playback — sync back
        exitIOSNativeBackgroundPlayback();

        // Resume our main player + Web Audio (GainNode)
        if (audio) {
          audio.play().catch(() => {});
        }
        ensureAudioContextRunning();
      } else {
        ensureAudioContextRunning();
        stopBackgroundAudioKeepAlive();
      }
    } else {
      // Screen locked or app went to background
      if (isIOS()) {
        // Switch to native audio playback so it survives screen lock (like QuickTime does)
        enterIOSNativeBackgroundPlayback();
      } else {
        startBackgroundAudioKeepAlive();
      }
    }
  } else {
    stopBackgroundAudioKeepAlive();
    if (isIOS()) {
      exitIOSNativeBackgroundPlayback();
      exitIOSBackgroundAudioMode();
    }
  }
});
window.addEventListener('focus', ensureAudioContextRunning);
document.addEventListener('pageshow', ensureAudioContextRunning);
document.addEventListener('pagehide', () => {
  if (isPlaying && isIOS()) {
    enterIOSNativeBackgroundPlayback();
  }
});

// Also stop everything if the user pauses
function pauseAndStopBackground() {
  // Mark not-playing first so a teardown `ended` (clearing bg src) cannot advance tracks
  isPlaying = false;

  // Stop all background handoff / keep-alive logic first
  stopBackgroundAudioKeepAlive();

  if (isIOS() && iosBackgroundAudio) {
    try {
      iosBackgroundAudio.pause();
      iosBackgroundAudio.src = '';
    } catch (e) {}
    iosBackgroundAudio = null;
  }

  if (isIOS() && precreatedIOSBackgroundAudio) {
    try {
      precreatedIOSBackgroundAudio.src = '';
    } catch (e) {}
    precreatedIOSBackgroundAudio = null;
  }

  if (isIOS()) {
    exitIOSBackgroundAudioMode();
  }

  // Final authoritative pause
  if (audio) {
    audio.pause();
  }

  updatePlayUI();
}

function startBackgroundAudioKeepAlive() {
  if (!isIOS() || bgAudioKeepAlive) return;

  ensureAudioContextRunning();

  // Create the long silent looping source (this is what actually keeps the context alive)
  try {
    if (audioContext && !silentBackgroundSource) {
      const bufferLength = Math.floor(audioContext.sampleRate * 5);
      const buffer = audioContext.createBuffer(1, bufferLength, audioContext.sampleRate);
      silentBackgroundSource = audioContext.createBufferSource();
      silentBackgroundSource.buffer = buffer;
      silentBackgroundSource.loop = true;

      const dest = gainNode || audioContext.destination;
      silentBackgroundSource.connect(dest);
      silentBackgroundSource.start();
    }
  } catch (e) {}

  // Simple fast loop — just resume the context and keep the audio element alive.
  // This pattern was working before the more complex versions.
  function keepAliveLoop() {
    if (!isPlaying) {
      stopBackgroundAudioKeepAlive();
      return;
    }

    ensureAudioContextRunning();

    if (audio.paused) {
      audio.play().catch(() => {});
    }

    bgAudioKeepAlive = setTimeout(keepAliveLoop, 300);
  }

  bgAudioKeepAlive = setTimeout(keepAliveLoop, 0);
}

function stopBackgroundAudioKeepAlive() {
  stopSilentBackgroundSource();

  if (bgAudioKeepAlive) {
    clearTimeout(bgAudioKeepAlive);
    bgAudioKeepAlive = null;
  }
}

function stopSilentBackgroundSource() {
  if (silentBackgroundSource) {
    try {
      silentBackgroundSource.stop();
      silentBackgroundSource.disconnect();
    } catch (e) {}
    silentBackgroundSource = null;
  }
}

/* 
  iOS Background Audio Bypass Strategy:
  When the screen locks on iOS, Safari is very aggressive about suspending AudioContexts.
  Even with silent sources, the GainNode path often stops outputting sound while the <audio> element keeps advancing time.

  Solution: On iOS when going to background while playing, temporarily bypass the GainNode entirely.
  Connect the MediaElementSource directly to the AudioContext destination.
  This lets the native audio playback path handle background audio (which iOS respects better for lock screen / background).

  When the page returns to foreground, we reconnect through the GainNode so volume control works again.
*/
let isUsingDirectAudioPath = false;
let iosBackgroundAudio = null; // temporary native audio element used for iOS background playback
let precreatedIOSBackgroundAudio = null; // pre-warmed native element for faster handoff on iOS

function enterIOSBackgroundAudioMode() {
  if (!isIOS() || !audioContext || !sourceNode || isUsingDirectAudioPath) return;

  try {
    // Disconnect from GainNode if currently connected
    sourceNode.disconnect(gainNode);
  } catch (e) {}

  try {
    // Connect directly to destination (bypass GainNode for background)
    sourceNode.connect(audioContext.destination);
    isUsingDirectAudioPath = true;

    // Make sure context stays awake
    ensureAudioContextRunning();
  } catch (e) {}
}

function exitIOSBackgroundAudioMode() {
  if (!isIOS() || !audioContext || !sourceNode || !isUsingDirectAudioPath) return;

  try {
    // Disconnect direct path
    sourceNode.disconnect(audioContext.destination);
  } catch (e) {}

  try {
    // Reconnect through GainNode for normal volume control
    sourceNode.connect(gainNode);
    isUsingDirectAudioPath = false;

    ensureAudioContextRunning();
  } catch (e) {}
}

/* 
  Proper iOS Background Playback using Native Audio (the reliable way)

  Observation: When the user clicks "download", the file opens in QuickTime 
  and continues playing with the screen locked. This proves native media 
  playback works fine in background on iOS.

  Strategy:
  - When going to background on iOS while playing:
    - Pause our main audio + Web Audio setup.
    - Create a hidden <audio> element pointing at the same file.
    - Seek it to current position and play it natively (no AudioContext).
    - This native element survives screen lock like QuickTime does.
  - When returning to foreground:
    - Pause the background element.
    - Seek our main audio to the background element's currentTime.
    - Resume our main player + Web Audio (GainNode) so volume works again.
*/
/* Keep <audio>.loop in sync with repeat-one so a track restarts natively
   without waiting on JS — required for lock-screen / screen-off replay. */
function applyRepeatLoopFlag() {
  const one = (repeatMode === 2);
  try { if (audio) audio.loop = one; } catch (e) {}
  try { if (iosBackgroundAudio) iosBackgroundAudio.loop = one; } catch (e) {}
  try { if (precreatedIOSBackgroundAudio) precreatedIOSBackgroundAudio.loop = one; } catch (e) {}
}

/* Shared end-of-track routing (main player + iOS screen-off handoff player). */
function handleTrackEnded() {
  // Ignore teardown (pause / clear src) and mid-handoff races
  if (!isPlaying) return;

  // repeat-one: prefer native .loop; this is a fallback if ended still fires
  if (repeatMode === 2) {
    try {
      if (iosBackgroundAudio) {
        iosBackgroundAudio.currentTime = 0;
        iosBackgroundAudio.play().catch(() => {});
        return;
      }
    } catch (e) {}
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (e) {}
    return;
  }

  if (isShuffle) {
    let ni;
    do { ni = Math.floor(Math.random() * TRACKS.length); } while (TRACKS.length > 1 && ni === currentIndex);
    loadTrack(ni, true);
  } else if (currentIndex < TRACKS.length - 1) {
    loadTrack(currentIndex + 1, true);
  } else if (repeatMode === 1) {
    // repeat all: wrap playlist
    loadTrack(0, true);
  } else {
    pauseAndStopBackground();
  }
}

function wireIOSBackgroundTrackEvents(el) {
  if (!el || el._orbitEndedWired) return;
  el._orbitEndedWired = true;
  el.addEventListener('ended', handleTrackEnded);
}

function enterIOSNativeBackgroundPlayback() {
  if (!isIOS() || !isPlaying || iosBackgroundAudio) return;

  stopBackgroundAudioKeepAlive(); // make sure old keep-alive is dead

  try {
    // Prefer a pre-created element if we have one (much faster handoff)
    if (precreatedIOSBackgroundAudio) {
      iosBackgroundAudio = precreatedIOSBackgroundAudio;
      precreatedIOSBackgroundAudio = null;
      iosBackgroundAudio.currentTime = audio.currentTime || 0;
    } else {
      // Fallback: create on the fly
      iosBackgroundAudio = new Audio();
      iosBackgroundAudio.src = audio.src;
      iosBackgroundAudio.currentTime = audio.currentTime || 0;
      iosBackgroundAudio.preload = 'auto';
      iosBackgroundAudio.playsInline = true;
    }

    // Repeat modes must work with screen off: loop + ended on the BG player
    applyRepeatLoopFlag();
    wireIOSBackgroundTrackEvents(iosBackgroundAudio);

    // Start the native background player
    iosBackgroundAudio.play().catch(() => {});

    // Use a short fixed overlap instead of waiting for 'playing' event.
    // This makes the audible gap consistently small (~120-180ms) instead of variable.
    setTimeout(() => {
      if (audio && isPlaying && iosBackgroundAudio) {
        audio.pause();
      }
    }, 150);

  } catch (e) {
    iosBackgroundAudio = null;
  }
}

function exitIOSNativeBackgroundPlayback() {
  if (!iosBackgroundAudio) return;

  try {
    const bgTime = iosBackgroundAudio.currentTime || 0;

    // Stop the background player
    iosBackgroundAudio.pause();
    iosBackgroundAudio.src = '';
    iosBackgroundAudio = null;

    // Clean up any pre-created element too
    if (precreatedIOSBackgroundAudio) {
      precreatedIOSBackgroundAudio.src = '';
      precreatedIOSBackgroundAudio = null;
    }

    // Sync our main audio element back to where the background one was
    if (audio) {
      audio.currentTime = bgTime;
    }
  } catch (e) {
    iosBackgroundAudio = null;
    precreatedIOSBackgroundAudio = null;
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

let _waveDrawRaf = 0;
let _waveDrawPct = 0;
function setProgress(pct) {
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-thumb').style.left = pct + '%';
  // Waveform redraw is expensive (many bars + shadowBlur) - coalesce to one paint/frame
  if (!currentWaveform) return;
  _waveDrawPct = pct / 100;
  if (_waveDrawRaf) return;
  _waveDrawRaf = requestAnimationFrame(() => {
    _waveDrawRaf = 0;
    drawWaveform(_waveDrawPct);
  });
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

/* ── COOL SOUNDCLOUD-STYLE WAVEFORM (peaks from audio decode) ── */
async function generateWaveform(track) {
  if (waveformCache[track.slug]) {
    return waveformCache[track.slug];
  }
  try {
    // Use a dedicated AudioContext just for decoding (more reliable, doesn't depend on main player context/gesture)
    const decodeCtx = new (window.AudioContext || window.webkitAudioContext)();
    // encode to handle spaces/special chars in filenames like "the sum of hippy thoughts..."
    const fileUrl = encodeURI(track.file);
    const resp = await fetch(fileUrl, { cache: 'force-cache' });
    if (!resp.ok) throw new Error('fetch failed');
    const arrBuf = await resp.arrayBuffer();
    const audioBuf = await decodeCtx.decodeAudioData(arrBuf);
    // close the temp context to free resources
    if (decodeCtx.state !== 'closed') decodeCtx.close().catch(() => {});
    const data = audioBuf.getChannelData(0); // first channel for peaks
    const numPeaks = 160; // more detail for actual waveform
    const blockSize = Math.floor(data.length / numPeaks);
    const peaks = new Array(numPeaks).fill(0);
    for (let i = 0; i < numPeaks; i++) {
      let sum = 0;
      let count = 0;
      for (let j = 0; j < blockSize; j++) {
        const idx = i * blockSize + j;
        if (idx < data.length) {
          sum += Math.abs(data[idx]);
          count++;
        }
      }
      peaks[i] = count > 0 ? sum / count : 0;
    }
    const maxPeak = Math.max(...peaks) || 1;
    const normalized = peaks.map(p => Math.min(1, p / maxPeak));
    waveformCache[track.slug] = normalized;
    return normalized;
  } catch (e) {
    console.warn('[Waveform] real decode failed for', track.slug, e, '- using fallback (check if served via http, not file://)');
    // Make fallback unique and "song-like" per track using slug hash for variation (so they don't look identical)
    const len = 160;
    let hash = 0;
    for (let i = 0; i < track.slug.length; i++) {
      hash = (hash * 31 + track.slug.charCodeAt(i)) | 0;
    }
    const baseFreq = 7 + (Math.abs(hash) % 9); // 7-15
    const modFreq = 30 + (Math.abs(hash >> 8) % 15); // 30-44
    const noiseAmp = 0.05 + (Math.abs(hash >> 16) % 10) / 100; // small variation
    const fb = Array.from({length: len}, (_, i) => {
      const t = i / len;
      const main = Math.sin(t * baseFreq * 2 * Math.PI) * 0.35;
      const mod = Math.sin(t * modFreq * 2 * Math.PI) * 0.18;
      const noise = (Math.sin((hash + i) * 12.9898) * 43758.5453 % 1 - 0.5) * noiseAmp * 2;
      // envelope to make it more wave-like, not flat
      const env = 0.3 + Math.sin(t * Math.PI * 3) * 0.2 + Math.abs(Math.sin(t * Math.PI * 7)) * 0.15;
      return Math.max(0, Math.min(1, 0.15 + (main + mod + noise) * env ));
    });
    waveformCache[track.slug] = fb;
    return fb;
  }
}

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
function hexToRgba(hex, a) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  if (isNaN(n)) return `rgba(140,80,255,${a})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function roundBar(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(r, h / 2, w / 2));
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
}

function drawWaveform(playedFrac = 0) {
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas || !currentWaveform || currentWaveform.length === 0) return;
  waveformCanvas = canvas;

  // size the backing buffer to the CSS layout box (CSS owns layout — never
  // fight it with inline styles; this is what kept mis-sizing the waveform)
  const rect = canvas.getBoundingClientRect();
  // Waveform is soft bars — full retina DPR rarely helps and burns 2D canvas time.
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const cssW = Math.max(48, rect.width || 300);
  const cssH = Math.max(14, rect.height || 28);
  const bufW = Math.round(cssW * dpr);
  const bufH = Math.round(cssH * dpr);
  if (canvas.width !== bufW || canvas.height !== bufH) {
    canvas.width = bufW;
    canvas.height = bufH;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const peaks = currentWaveform;
  // adaptive bar count: bars stay chunky and readable at any width,
  // and the layout always fills the rail exactly (no overflow / clipping)
  const numBars = Math.max(36, Math.min(peaks.length, Math.floor(cssW / 3.4)));
  const step = cssW / numBars;
  const barW = Math.max(1.4, step * 0.62);

  // per-song palette (set by the 3D scene) so the wave rides the theme.
  // B = mid-brightness swirl color (readable when unplayed), C = bright accent.
  const colB = cssVar('--track-b', '#7B2FFF');
  const colC = cssVar('--track-c', '#00DCAA');

  const centerY = cssH * 0.42;            // asymmetric: tape-style reflection below
  const maxAmp = cssH * 0.40;
  const playedX = playedFrac * cssW;

  for (let i = 0; i < numBars; i++) {
    // bucket max keeps transients punchy when downsampling
    const a0 = Math.floor(i * peaks.length / numBars);
    const a1 = Math.max(a0 + 1, Math.floor((i + 1) * peaks.length / numBars));
    let pk = 0;
    for (let j = a0; j < a1; j++) pk = Math.max(pk, peaks[j]);
    const barH = Math.max(1.5, pk * maxAmp);
    const x = i * step + (step - barW) / 2;
    const played = (x + barW * 0.5) <= playedX;

    // main bar — played glows in the song's accent, rest sits back in the haze
    if (played) {
      // No per-bar shadowBlur (GPU tax); glow via brighter fill instead
      ctx.shadowBlur = 0;
      ctx.fillStyle = hexToRgba(colC, 0.95);
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = hexToRgba(colB, 0.55);
    }
    roundBar(ctx, x, centerY - barH, barW, barH, barW / 2);
    ctx.shadowBlur = 0;

    // mirrored reflection — dimmer and shorter, analog tape-deck feel
    ctx.fillStyle = played ? hexToRgba(colC, 0.30) : hexToRgba(colB, 0.20);
    roundBar(ctx, x, centerY + 1.5, barW, barH * 0.55, barW / 2);
  }

  // glowing playhead needle at the play boundary
  if (playedFrac > 0.001 && playedFrac < 0.999) {
    ctx.shadowBlur = 7;
    ctx.shadowColor = hexToRgba(colC, 0.9);
    ctx.fillStyle = 'rgba(245,250,255,.92)';
    ctx.fillRect(playedX - 0.6, 1, 1.2, cssH - 2);
    ctx.shadowBlur = 0;
  }
}

/* ── PROGRESS SCRUBBER ── */
(function () {
  const rail = document.getElementById('progress-rail');
  const preview = document.getElementById('seek-preview');
  let active = false;

  function apply(e) {
    isSeeking = true;
    seekToPct(clientXToFraction(e.clientX, rail));
  }

  function showPreview(e) {
    if (!preview) return;
    const frac = clientXToFraction(e.clientX, rail);
    const dur = audio.duration;
    let txt = '--:--';
    if (isGoodDuration(dur)) {
      txt = fmt(frac * dur);
    }
    preview.textContent = txt;
    const r = rail.getBoundingClientRect();
    preview.style.display = 'block';
    // clamp so the tooltip (centered via translateX(-50%)) never clips at the rail ends
    const half = (preview.offsetWidth || 36) / 2;
    const x = Math.max(half, Math.min(r.width - half, e.clientX - r.left));
    preview.style.left = x + 'px';
  }

  function hidePreview() {
    if (preview) preview.style.display = 'none';
  }

  rail.addEventListener('pointerdown', e => {
    active = true;
    rail.setPointerCapture(e.pointerId);
    rail.classList.add('dragging');
    apply(e);
    showPreview(e);
    e.preventDefault();
  }, { passive: false });

  rail.addEventListener('pointermove', e => {
    if (active) {
      apply(e);
      showPreview(e);
    } else {
      // hover preview
      showPreview(e);
    }
  }, { passive: false });

  rail.addEventListener('pointerup', () => {
    active = false;
    rail.classList.remove('dragging');
    setTimeout(() => isSeeking = false, 80);
    // keep preview a moment or hide on leave
  });
  rail.addEventListener('pointercancel', () => {
    active = false;
    rail.classList.remove('dragging');
    isSeeking = false;
    hidePreview();
  });

  rail.addEventListener('mouseleave', () => {
    if (!active) hidePreview();
  });

  // also show on simple mousemove (for non-pointer)
  rail.addEventListener('mousemove', e => {
    if (!active) showPreview(e);
  });
  rail.addEventListener('mouseleave', hidePreview);
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

audio.addEventListener('ended', handleTrackEnded);

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

  // Sync the play icon in the open song detail window if it's visible
  syncDetailPlayIcon();
}

function syncDetailPlayIcon() {
  const playBtn = document.getElementById('song-detail-play');
  const win = document.getElementById('song-detail-win');
  if (!playBtn || !win || win.style.display !== 'flex' || !currentSongSlug) return;
  const detailIdx = findTrackBySlug(currentSongSlug);
  if (detailIdx === -1) return;
  playBtn.classList.toggle('playing', currentIndex === detailIdx && isPlaying);
  const icon = playBtn.querySelector('#song-detail-play-icon');
  if (icon) {
    if (currentIndex === detailIdx && isPlaying) {
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

function softBreakTitle(title) {
  // Zero-width space BEFORE dots/underscores so long tokens wrap at word
  // boundaries with the separator leading the next line:
  //   hyperdream.odyssey.exe -> hyperdream / .odyssey / .exe
  // (instead of CSS breaking mid-token).
  return String(title).replace(/[._]/g, (m) => '\u200b' + m);
}

function loadTrack(idx, autoplay) {
  currentIndex = idx;
  const t = TRACKS[idx];
  audio.src = t.file;
  audio.load();
  document.getElementById('fp-title').textContent = t.title;
  document.getElementById('fp-artist').textContent = t.artist;
  document.getElementById('focal-title').textContent = softBreakTitle(t.title);
  document.getElementById('focal-artist').textContent = t.artist;

  // Lyrics button only for rap category tracks (more intuitive)
  const lyricsBtn = document.getElementById('btn-lyrics');
  if (lyricsBtn) {
    lyricsBtn.style.display = (t.category === 'rap') ? 'flex' : 'none';
  }
  document.getElementById('time-total').textContent = '0:00';
  document.getElementById('time-current').textContent = '0:00';
  setProgress(0);
  seekOnReady = null;
  startDurationPoll();

  // always use default music symbol in the small player header art (uniform/cleaner for now)
  const artDiv = document.getElementById('fp-art');
  if (artDiv) {
    artDiv.innerHTML = '<span class="material-symbols-outlined">music_note</span>';
  }

  // async load waveform for this track (non-blocking)
  currentWaveform = null;
  generateWaveform(t).then(wf => {
    currentWaveform = wf;
    // draw initial (will be updated by timeupdate/setProgress)
    const initialPct = (audio.duration && isGoodDuration(audio.duration)) ? (audio.currentTime / audio.duration) : 0;
    drawWaveform(initialPct);
  }).catch(() => {});

  document.querySelectorAll('.track-item').forEach(el => {
    el.classList.toggle('active', +el.dataset.idx === idx);
  });

  // If the song detail/info window is open, update its content in real-time to the new song
  const detailWin = document.getElementById('song-detail-win');
  if (detailWin && detailWin.style.display === 'flex') {
    populateSongDetail(currentIndex);
    // also ensure the detail play icon reflects any autoplay state change
    syncDetailPlayIcon();
  }

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
        if (isIOS() && iosBackgroundAudio) {
          iosBackgroundAudio.play().catch(() => {});
        } else if (audio.paused) {
          initAudioContext();
          audio.play().then(() => { isPlaying = true; updatePlayUI(); }).catch(() => {});
        }
        isPlaying = true;
        updatePlayUI();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (isIOS() && iosBackgroundAudio) {
          iosBackgroundAudio.pause();
        } else {
          audio.pause();
        }
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

  applyRepeatLoopFlag();

  if (isIOS() && iosBackgroundAudio) {
    // We're currently in iOS native background handoff mode.
    // Update the background player to the new track instead of the main one.
    // (repeat-all / next advance while screen is locked land here)
    try {
      iosBackgroundAudio.pause();
      iosBackgroundAudio.src = t.file;
      iosBackgroundAudio.currentTime = 0;
      applyRepeatLoopFlag();
      wireIOSBackgroundTrackEvents(iosBackgroundAudio);
      iosBackgroundAudio.play().catch(() => {});
      isPlaying = true;
      updatePlayUI();
    } catch (e) {}
  } else if (autoplay) {
    initAudioContext();
    ensureAudioContextRunning();
    audio.play().then(() => { isPlaying = true; updatePlayUI(); }).catch(() => { isPlaying = false; updatePlayUI(); });

    // On iOS, pre-warm a background audio element so the handoff when the user locks the screen is much faster (less gap)
    if (isIOS()) {
      try {
        if (precreatedIOSBackgroundAudio) {
          precreatedIOSBackgroundAudio.src = '';
          precreatedIOSBackgroundAudio._orbitEndedWired = false;
        }
        precreatedIOSBackgroundAudio = new Audio();
        precreatedIOSBackgroundAudio.src = t.file;
        precreatedIOSBackgroundAudio.preload = 'auto';
        precreatedIOSBackgroundAudio.playsInline = true;
        applyRepeatLoopFlag();
        wireIOSBackgroundTrackEvents(precreatedIOSBackgroundAudio);
        precreatedIOSBackgroundAudio.load(); // start loading early
      } catch (e) {}
    }
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
    pauseAndStopBackground();
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
  // Immediate — screen-off player must pick up loop without waiting for unlock
  applyRepeatLoopFlag();
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

volSlider.addEventListener('pointerdown', () => {
  volSlider.closest('.volume-module')?.classList.add('slider-active');
});
const clearMainVolActive = () => volSlider.closest('.volume-module')?.classList.remove('slider-active');
volSlider.addEventListener('pointerup', clearMainVolActive);
volSlider.addEventListener('pointercancel', clearMainVolActive);

document.getElementById('vol-icon-wrap').addEventListener('click', () => {
  initAudioContext();
  ensureAudioContextRunning();

  if (isMuted) {
    // Unmute
    isMuted = false;
    setVolume(premuteVolume || 100);
    volIcon.classList.remove('muted');
    updateVolumeIcon();
  } else {
    // Mute (this now works properly even on iOS via GainNode)
    isMuted = true;
    premuteVolume = +volSlider.value || 100;

    if (gainNode) {
      gainNode.gain.value = 0;
    } else {
      audio.volume = 0;
    }

    volIcon.textContent = 'volume_off';
    volIcon.classList.add('muted');
  }
});

setVolume(100);
updateVolumeIcon();

// Full volume slider is now enabled on mobile thanks to Web Audio GainNode.
// It provides the best possible volume control the browser allows (including proper muting on iOS).

/* ── KEYBOARD + SCROLL QoL (YouTube / X-style polish) ── */
(function initPlayerKeyboardQoL() {
  function mediaWinsOpen() {
    const img = document.getElementById('image-win');
    const vid = document.getElementById('video-win');
    return (img && img.style.display === 'flex') || (vid && vid.style.display === 'flex');
  }

  function playerIsRelevant() {
    const pw = document.getElementById('player-win');
    return (pw && pw.style.display === 'flex') || isPlaying || !!(audio.src && audio.src !== window.location.href);
  }

  function togglePlayFromKeys() {
    initAudioContext();
    ensureAudioContextRunning();
    if (!audio.src || audio.src === window.location.href) {
      if (TRACKS.length) loadTrack(0, true);
      return;
    }
    if (isPlaying) pauseAndStopBackground();
    else {
      ensureAudioContextRunning();
      audio.play().then(() => { isPlaying = true; }).catch(() => { isPlaying = false; });
      isPlaying = true;
    }
    updatePlayUI();
  }

  function toggleMuteFromKeys() {
    initAudioContext();
    ensureAudioContextRunning();
    const wrap = document.getElementById('vol-icon-wrap');
    if (wrap) wrap.click();
  }

  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
    if (mediaWinsOpen() || !playerIsRelevant()) return;

    if (e.key === ' ') {
      e.preventDefault();
      togglePlayFromKeys();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      skip(-5);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      skip(5);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isMuted) toggleMuteFromKeys();
      setVolume(+volSlider.value + 5);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setVolume(+volSlider.value - 5);
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      toggleMuteFromKeys();
    } else if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      loadTrack((currentIndex + 1) % TRACKS.length, isPlaying);
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      if (audio.currentTime > 3) { audio.currentTime = 0; return; }
      loadTrack((currentIndex - 1 + TRACKS.length) % TRACKS.length, isPlaying);
    }
  });

  const volMod = document.querySelector('#player-win .volume-module');
  if (volMod) {
    volMod.addEventListener('wheel', (e) => {
      e.preventDefault();
      initAudioContext();
      ensureAudioContextRunning();
      if (isMuted) {
        isMuted = false;
        volIcon.classList.remove('muted');
      }
      const delta = e.deltaY > 0 ? -4 : 4;
      setVolume(+volSlider.value + delta);
      updateVolumeIcon();
    }, { passive: false });
  }
})();

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
  let items = TRACKS.map((t, i) => ({ t, origIdx: i }));

  // Apply category filter (tabs)
  if (currentTracklistCategory && currentTracklistCategory !== 'all') {
    items = items.filter(({ t }) => (t.category || 'instrumental') === currentTracklistCategory);
  }

  // Apply search filter
  items = items.filter(({ t }) => !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));

  document.getElementById('track-count').textContent = `${items.length}/${TRACKS.length}`;

  items.forEach(({ t, origIdx }) => {
    const el = document.createElement('div');
    el.className = 'track-item' + (origIdx === currentIndex ? ' active' : '');
    el.dataset.idx = origIdx;
    el.innerHTML = `
      <div class="drag-handle" title="Drag to reorder"><span class="material-symbols-outlined" style="font-size:16px;pointer-events:none">drag_indicator</span></div>
      <div style="flex:1;min-width:0">
        <p class="track-title" style="font-weight:700;color:rgba(233,225,222,.82);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</p>
        <p class="track-artist" style="font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(0,200,150,.5);margin:0">${t.artist}</p>
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

/* ── TRACKLIST CATEGORY TABS ── */
document.querySelectorAll('#tracklist-win .tracklist-tabs .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#tracklist-win .tracklist-tabs .tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTracklistCategory = tab.dataset.category || 'all';
    renderTracklist(document.getElementById('search-input').value);
  });
});

/* ── PREMIUM LYRICS VIEWER ── */
const LYRICS_RESUME_MS = 1500;
let lyricsRafId = null;
let lyricsDesiredScroll = 0;
let lyricsCurrentScroll = 0;
let lyricsUserBrowsing = false;
let lyricsResumeTimer = null;
let lyricsSuppressScrollUntil = 0;
let lyricsScrollHandlersWired = false;

function setLyricsScrollTop(top) {
  const scrollEl = document.getElementById('lyrics-scroll');
  if (!scrollEl) return;
  lyricsSuppressScrollUntil = performance.now() + 64;
  scrollEl.scrollTop = top;
  lyricsCurrentScroll = top;
}

function pauseLyricsFollow() {
  const win = document.getElementById('lyrics-win');
  if (!win || win.style.display !== 'flex') return;
  const scrollEl = document.getElementById('lyrics-scroll');
  if (scrollEl) lyricsCurrentScroll = scrollEl.scrollTop;
  lyricsUserBrowsing = true;
  clearTimeout(lyricsResumeTimer);
  lyricsResumeTimer = setTimeout(() => resumeLyricsFollow(false), LYRICS_RESUME_MS);
}

function resumeLyricsFollow(immediate) {
  lyricsUserBrowsing = false;
  clearTimeout(lyricsResumeTimer);
  syncLyrics();
  if (immediate) setLyricsScrollTop(lyricsDesiredScroll);
}

function initLyricsScrollHandlers() {
  if (lyricsScrollHandlersWired) return;
  const scrollEl = document.getElementById('lyrics-scroll');
  if (!scrollEl) return;
  lyricsScrollHandlersWired = true;

  scrollEl.addEventListener('wheel', pauseLyricsFollow, { passive: true });

  scrollEl.addEventListener('pointerdown', (e) => {
    if (e.target === scrollEl) pauseLyricsFollow();
  }, { passive: true });

  let touchY = null;
  scrollEl.addEventListener('touchstart', (e) => {
    touchY = e.touches[0].clientY;
  }, { passive: true });
  scrollEl.addEventListener('touchmove', (e) => {
    if (touchY !== null && Math.abs(e.touches[0].clientY - touchY) > 10) pauseLyricsFollow();
  }, { passive: true });
  scrollEl.addEventListener('touchend', () => { touchY = null; }, { passive: true });

  scrollEl.addEventListener('scroll', () => {
    if (lyricsUserBrowsing) {
      lyricsCurrentScroll = scrollEl.scrollTop;
      clearTimeout(lyricsResumeTimer);
      lyricsResumeTimer = setTimeout(() => resumeLyricsFollow(false), LYRICS_RESUME_MS);
      return;
    }
    if (performance.now() < lyricsSuppressScrollUntil) return;
    if (Math.abs(scrollEl.scrollTop - lyricsCurrentScroll) > 3) {
      pauseLyricsFollow();
    }
  }, { passive: true });
}

function attachHoldToSeek(lineEl) {
  let holdTimer = null;
  lineEl.addEventListener('pointerdown', (e) => {
    clearTimeout(holdTimer);
    const startY = e.clientY;
    holdTimer = setTimeout(() => {
      // User held long enough on this specific line → deliberate seek
      const idx = parseInt(lineEl.dataset.index || '0');
      const track = TRACKS[currentIndex];
      const lxs = track && track.lyrics ? track.lyrics : [];
      if (!lxs[idx]) return;

      const targetTime = lxs[idx].time;
      if (audio) audio.currentTime = targetTime;

      // subtle non-jarring visual confirmation
      lineEl.classList.add('seek-flash');
      setTimeout(() => lineEl.classList.remove('seek-flash'), 420);

      // optional tiny indicator at tap point
      const ind = document.createElement('div');
      ind.className = 'click-indicator';
      const r = lineEl.getBoundingClientRect();
      const frac = (e.clientY - r.top) / Math.max(1, r.height);
      ind.style.top = `${lineEl.offsetTop + (frac * lineEl.offsetHeight) - 1}px`;
      ind.style.height = '1.5px';
      ind.style.opacity = '0.55';
      const container = document.getElementById('lyrics-lines');
      if (container) container.appendChild(ind);
      setTimeout(() => { if (ind.parentNode) ind.parentNode.removeChild(ind); }, 480);

      // after deliberate seek, immediately resume follow
      resumeLyricsFollow(true);
    }, 185);
  }, { passive: true });

  const cancelHold = () => clearTimeout(holdTimer);
  lineEl.addEventListener('pointerup', cancelHold, { once: true });
  lineEl.addEventListener('pointercancel', cancelHold, { once: true });
  lineEl.addEventListener('pointerleave', cancelHold, { once: true });
}

async function openLyricsViewer() {
  const win = document.getElementById('lyrics-win');
  if (!win) return;
  win.style.display = 'flex';
  bringToFront('lyrics-win');
  // Ensure centered top + tall layout on desktop (if user hasn't manually dragged it yet).
  // This also re-clamps on open/resize scenarios.
  if (typeof applyDesktopLayout === 'function') {
    applyDesktopLayout();
  }
  await updateLyricsViewer();
  initLyricsScrollHandlers();
  startLyricsSyncLoop();

  // On open, snap to current line then follow playback
  requestAnimationFrame(() => {
    resumeLyricsFollow(true);
  });
}

function closeLyricsViewer() {
  const win = document.getElementById('lyrics-win');
  if (win) win.style.display = 'none';
  clearTimeout(lyricsResumeTimer);
  stopLyricsSyncLoop();
}

async function updateLyricsViewer() {
  const titleEl = document.getElementById('lyrics-title');
  const artistEl = document.getElementById('lyrics-artist');
  const linesEl = document.getElementById('lyrics-lines');

  if (!titleEl || !artistEl || !linesEl) return;

  if (currentIndex < 0 || !TRACKS[currentIndex]) {
    titleEl.textContent = '—';
    artistEl.textContent = '';
    linesEl.innerHTML = '';
    const copyBtnEmpty = document.getElementById('btn-copy-lyrics');
    if (copyBtnEmpty) copyBtnEmpty.style.display = 'none';
    return;
  }

  const track = TRACKS[currentIndex];
  titleEl.textContent = track.title || '—';
  artistEl.textContent = track.artist || '';

  // Wire copy lyrics button (near title, right side)
  const copyBtn = document.getElementById('btn-copy-lyrics');
  if (copyBtn) {
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      const t = TRACKS[currentIndex];
      if (!t || !t.lyrics || t.lyrics.length === 0) return;
      const text = t.lyrics.map(l => l.text).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        const orig = copyBtn.innerHTML;
        const origColor = copyBtn.style.color;
        copyBtn.innerHTML = '<span class="material-symbols-outlined">check</span>';
        copyBtn.style.color = 'rgba(0,200,150,0.95)';
        setTimeout(() => {
          copyBtn.innerHTML = orig;
          copyBtn.style.color = origColor || '';
        }, 1400);
      }).catch(() => {
        // fallback for older browsers / file://
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
        const orig = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="material-symbols-outlined">check</span>';
        setTimeout(() => { copyBtn.innerHTML = orig; }, 1200);
      });
    };
  }

  // Support dynamic load from lyricsFile (for the workflow: run script -> json -> auto load)
  if (track.lyricsFile && !track.lyrics) {
    try {
      const resp = await fetch(track.lyricsFile);
      track.lyrics = await resp.json();
    } catch (e) {
      console.warn('Could not load lyrics json via fetch (common when opening index.html directly as file:// — CORS). Lyrics should be hardcoded in TRACKS for local use. Error:', e);
    }
  }

  linesEl.innerHTML = '';

  const lyrics = track.lyrics || [];
  if (lyrics.length === 0) {
    if (copyBtn) copyBtn.style.display = 'none';
    return;
  }
  if (copyBtn) copyBtn.style.display = '';

  const lyricsData = lyrics; // for closure in click handler

  lyrics.forEach((line, idx) => {
    const div = document.createElement('div');
    div.className = 'lyric-line';
    div.textContent = line.text || ' ';
    div.dataset.time = line.time;
    div.dataset.index = idx;

    // Hold-to-seek on individual lines (deliberate action, not accidental during scroll)
    attachHoldToSeek(div);

    linesEl.appendChild(div);
  });

  // Attach smart click handler to the lines container for "click any part to seek"
  // Supports interpolation between lines for precise playback control.
  // Shows subtle precision indicator animation at click location.
  linesEl.onclick = function(e) {
    if (!audio || !lyricsData || lyricsData.length === 0) return;

    const containerRect = linesEl.getBoundingClientRect();
    const clickY = e.clientY - containerRect.top + document.getElementById('lyrics-scroll').scrollTop;

    const lineEls = linesEl.querySelectorAll('.lyric-line');
    let targetTime = 0;
    let clickedLineEl = null;

    for (let i = 0; i < lineEls.length; i++) {
      const el = lineEls[i];
      const elTop = el.offsetTop;
      const elBottom = elTop + el.offsetHeight;

      if (clickY >= elTop && clickY <= elBottom) {
        // Direct hit on a line
        const idx = parseInt(el.dataset.index);
        targetTime = lyricsData[idx].time;
        clickedLineEl = el;
        break;
      } else if (clickY < elTop) {
        // Clicked in the space before this line - interpolate with previous
        if (i > 0) {
          const prevEl = lineEls[i - 1];
          const prevIdx = parseInt(prevEl.dataset.index);
          const prevTop = prevEl.offsetTop;
          const frac = (clickY - prevTop) / (elTop - prevTop);
          targetTime = lyricsData[prevIdx].time + frac * (lyricsData[i].time - lyricsData[prevIdx].time);
        } else {
          targetTime = lyricsData[0].time;
        }
        clickedLineEl = lineEls[i];
        break;
      }
    }

    if (clickedLineEl === null && lineEls.length > 0) {
      // Clicked after the last line
      const lastIdx = parseInt(lineEls[lineEls.length - 1].dataset.index);
      targetTime = lyricsData[lastIdx].time;
      clickedLineEl = lineEls[lineEls.length - 1];
    }

    // Seek
    audio.currentTime = Math.max(0, targetTime);

    // Subtle, precise click location indicator (not invasive)
    if (clickedLineEl) {
      const indicator = document.createElement('div');
      indicator.className = 'click-indicator';
      // Position relative to the clicked line for precision feel
      const lineRect = clickedLineEl.getBoundingClientRect();
      const clickOffsetInLine = (e.clientY - lineRect.top) / lineRect.height;
      indicator.style.top = `${clickedLineEl.offsetTop + (clickOffsetInLine * clickedLineEl.offsetHeight) - 1}px`;
      indicator.style.height = '2px';
      linesEl.appendChild(indicator);

      // Flash the line itself for extra subtle feedback
      clickedLineEl.classList.add('seek-flash');
      setTimeout(() => {
        clickedLineEl.classList.remove('seek-flash');
        if (indicator.parentNode) indicator.parentNode.removeChild(indicator);
      }, 520);
    }

    // Immediate visual update + resume follow at new position
    syncLyrics();
    resumeLyricsFollow(true);
  };

  // initial sync
  syncLyrics();
}

function syncLyrics() {
  if (!audio || currentIndex < 0) return;
  const track = TRACKS[currentIndex];
  const lyrics = track.lyrics || [];
  if (lyrics.length === 0) return;

  const time = audio.currentTime;
  let currentIdx = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (time >= lyrics[i].time) currentIdx = i;
    else break;
  }

  const lineEls = document.querySelectorAll('#lyrics-lines .lyric-line');
  lineEls.forEach((el, i) => {
    el.classList.remove('current', 'past', 'future');
    const dist = i - currentIdx;
    if (i === currentIdx) {
      el.classList.add('current');
    } else if (i < currentIdx) {
      el.classList.add('past');
    } else {
      el.classList.add('future');
    }
    // depth
    const absDist = Math.abs(dist);
    el.style.opacity = (i === currentIdx) ? '1' : Math.max(0.22, 1 - absDist * 0.22);
  });

  // set desired scroll for continuous smooth follow
  // Use fractional position between current and next line for perfect continuous sync.
  // On mobile we bias the current line towards the top of the viewport so upcoming lines are easy to read.
  // Autoscroll is always "on" (desired is always computed from playback), but we delay applying the
  // actual scroll until the user has stopped interacting for a short while.
  const currentLine = lineEls[currentIdx];
  const scrollEl = document.getElementById('lyrics-scroll');
  if (currentLine && scrollEl) {
    let targetScroll;
    if (currentIdx < lyrics.length - 1) {
      const nextLine = lineEls[currentIdx + 1];
      const progress = (time - lyrics[currentIdx].time) / (lyrics[currentIdx + 1].time - lyrics[currentIdx].time);
      const currTop = currentLine.offsetTop;
      const nextTop = nextLine.offsetTop;
      const lineCenterOffset = currentLine.offsetHeight / 2;

      let topBias;
      if (typeof isMob === 'function' && isMob()) {
        // On mobile: keep current line near the top (easy to see while reading ahead)
        topBias = Math.min(110, scrollEl.clientHeight * 0.18);
      } else {
        // Desktop: gentle center with slight top preference
        topBias = scrollEl.clientHeight * 0.42;
      }
      targetScroll = currTop + progress * (nextTop - currTop) - topBias + lineCenterOffset;
    } else {
      const lineCenter = currentLine.offsetTop + (currentLine.offsetHeight / 2);
      targetScroll = lineCenter - (scrollEl.clientHeight * 0.42);
    }

    lyricsDesiredScroll = targetScroll;
  }
}

function startLyricsSyncLoop() {
  stopLyricsSyncLoop();
  const scrollEl = document.getElementById('lyrics-scroll');
  if (!scrollEl) return;

  lyricsUserBrowsing = false;
  lyricsCurrentScroll = scrollEl.scrollTop;
  lyricsDesiredScroll = lyricsCurrentScroll;

  const tick = () => {
    if (scrollEl) {
      if (!lyricsUserBrowsing) {
        const actual = scrollEl.scrollTop;
        if (Math.abs(actual - lyricsCurrentScroll) > 4) {
          pauseLyricsFollow();
        } else {
          lyricsCurrentScroll += (lyricsDesiredScroll - lyricsCurrentScroll) * 0.038;
          setLyricsScrollTop(lyricsCurrentScroll);
        }
      } else {
        lyricsCurrentScroll = scrollEl.scrollTop;
      }
    }
    syncLyrics();
    lyricsRafId = requestAnimationFrame(tick);
  };
  lyricsRafId = requestAnimationFrame(tick);
}

function stopLyricsSyncLoop() {
  if (lyricsRafId) {
    cancelAnimationFrame(lyricsRafId);
    lyricsRafId = null;
  }
  clearTimeout(lyricsResumeTimer);
}

// Wire lyrics button and close
document.getElementById('btn-lyrics').addEventListener('click', openLyricsViewer);
document.getElementById('close-lyrics').addEventListener('click', closeLyricsViewer);

initLyricsScrollHandlers();

// Keep lyrics in sync when track changes or audio events
const originalLoadTrackForLyrics = loadTrack;
loadTrack = async function(idx, autoplay) {
  const result = originalLoadTrackForLyrics.apply(this, arguments);
  const lyricsWin = document.getElementById('lyrics-win');
  if (lyricsWin && lyricsWin.style.display === 'flex') {
    await updateLyricsViewer();
  }
  return result;
};

if (audio) {
  audio.addEventListener('timeupdate', () => {
    const lyricsWin = document.getElementById('lyrics-win');
    if (lyricsWin && lyricsWin.style.display === 'flex') {
      syncLyrics();
    }
  });
  audio.addEventListener('seeked', () => {
    const lyricsWin = document.getElementById('lyrics-win');
    if (lyricsWin && lyricsWin.style.display === 'flex') {
      syncLyrics();
    }
  });
}

/* ── SONG DETAIL / SHARE SYSTEM ── */
let currentSongSlug = null;
let _songDetailBackdrop = null;

function findTrackBySlug(slug) {
  return TRACKS.findIndex(t => t.slug === slug);
}

function populateSongDetail(idx) {
  const track = TRACKS[idx];
  currentSongSlug = track.slug;

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

    // Update browser tab / bookmark title — clean "Title - Artist" format for song shares
    // (this will also update on live track change while window is open)
    document.title = `${track.title} - ${track.artist}`;

    // Wire dynamic buttons inside the window
    const playBtn = document.getElementById('song-detail-play');
    const downloadBtn = document.getElementById('song-detail-download');
    const shareBtn = document.getElementById('song-detail-share');

    if (playBtn) {
      syncDetailPlayIcon();

      playBtn.onclick = () => {
        if (currentIndex === idx && isPlaying) {
          document.getElementById('audio-player').pause();
          isPlaying = false;
          updatePlayUI();
        } else {
          loadTrack(idx, true);
        }
        syncDetailPlayIcon();
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
        const url = `${location.origin}/song/${track.slug}`;
        navigator.clipboard.writeText(url).then(() => {
          const originalHTML = shareBtn.innerHTML;
          shareBtn.classList.add('copied');
          // Text "Copied" to the left inside, then check icon. Button can grow naturally in the detail window.
          shareBtn.innerHTML = `<span style="font-size:11px; margin-right:4px;">Copied</span><span class="material-symbols-outlined" style="font-size:17px">check</span>`;
          
          setTimeout(() => {
            shareBtn.innerHTML = originalHTML;
            shareBtn.classList.remove('copied');
          }, 1600);
        }).catch(() => {
          prompt('Copy this link:', url);
        });
      };
    }

  } catch (err) {
    console.error('[Song Detail] Error populating song detail:', err);
  }
}

function openSongDetail(slug) {
  const idx = findTrackBySlug(slug);
  if (idx === -1) {
    console.warn('[Song Detail] Track not found for slug:', slug);
    return;
  }

  populateSongDetail(idx);

  // Show the window (only when explicitly opening; live updates via populate don't re-show/position)
  const win = document.getElementById('song-detail-win');
  if (win) {
    win.style.display = 'flex';
    win.style.bottom = '';
    win.style.right = '';

    if (isMob()) {
      // Mobile: centered card/overlay that fits nicely above player dock area
      win.style.left = '4vw';
      win.style.top = '5vh';
      win.style.width = '92vw';
      win.style.maxWidth = '460px';
      win.style.height = 'auto';
      win.style.maxHeight = 'min(82dvh, 620px)';
      win.style.transform = '';
      win.style.zIndex = '6200';

      // Add a dismissible backdrop (only while this win is the top modal)
      if (!_songDetailBackdrop || !_songDetailBackdrop.parentNode) {
        _songDetailBackdrop = document.createElement('div');
        _songDetailBackdrop.id = 'song-detail-backdrop';
        _songDetailBackdrop.style.cssText = 'position:fixed;inset:0;background:rgba(2,1,8,.52);z-index:6100;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);';
        _songDetailBackdrop.onclick = (e) => {
          e.stopPropagation();
          const w = document.getElementById('song-detail-win');
          if (w) w.style.display = 'none';
          if (_songDetailBackdrop && _songDetailBackdrop.parentNode) {
            _songDetailBackdrop.parentNode.removeChild(_songDetailBackdrop);
          }
          _songDetailBackdrop = null;
        };
        document.body.appendChild(_songDetailBackdrop);
      }

      // ensure fully on screen (handles very small phones / safe areas)
      requestAnimationFrame(() => {
        if (typeof clampWindowToViewport === 'function') clampWindowToViewport(win, 6);
      });
    } else {
      win.style.zIndex = '';
      const userMoved = win.dataset.userPositioned === 'true';
      if (userMoved) {
        if (typeof clampWindowToViewport === 'function') clampWindowToViewport(win, 10);
      } else {
        if (typeof positionDetailWindow === 'function') positionDetailWindow(win);
      }
    }

    // Aggressively bring to front (desktop dock clicks + initial loads)
    const bring = () => {
      if (typeof bringToFront === 'function') {
        bringToFront('song-detail-win');
      }
    };
    bring();
    requestAnimationFrame(bring);
    setTimeout(bring, 50);
    setTimeout(bring, 150);

    // Final safety clamp after content settles (long descriptions etc) so it never ends up offscreen
    setTimeout(() => {
      if (win && win.style.display === 'flex' && typeof clampWindowToViewport === 'function') {
        clampWindowToViewport(win, isMob() ? 6 : 12);
      }
    }, 180);
  } else {
    console.error('[Song Detail] #song-detail-win not found in DOM');
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
          const originalHTML = shareBtn.innerHTML;
          shareBtn.classList.add('copied');
          // "Copied" text to the left of the check icon (inside the button).
          // The .copied CSS expands the button width so it doesn't clip.
          shareBtn.innerHTML = `<span style="font-size:11px; margin-right:4px;">Copied</span><span class="material-symbols-outlined" style="font-size:15px">check</span>`;
          
          setTimeout(() => {
            shareBtn.innerHTML = originalHTML;
            shareBtn.classList.remove('copied');
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

// Note: direct listener on #btn-share removed to prevent double-firing with the delegated handler on .win-body.
// The delegated click handler above covers it reliably. If click area needs expansion in future, we can increase padding on the share button in .player-bottom-row.

// Title/artist in player no longer open song details (only the info icon does, per request).
// The elements remain for display only.



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
  // Note: default "Geronimo ready" (no autoplay) is handled early in main.js init()
  // for non-share visits so the player UI is populated before windows are shown.
}

window.addEventListener('hashchange', handleSongRouting);
window.addEventListener('load', handleSongRouting);

// NOTE: handleSongRouting handles /song/slug and #song/slug paths.
// It only does loadTrack(..., true) now — the song plays but the details window is never opened.