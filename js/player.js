/* ============================================
   ORBIT PLAYER — player.js
   Music player, tracklist, audio controls, drag-reorder, volume, etc.
   ============================================ */

const TRACKS = [
  {
    title: 'Offers',
    artist: 'jestR',
    slug: 'offers',
    file: 'audio/singles/Offers.mp3',
    year: 2026,
    description: '',
    category: 'instrumental'
  },
  {
    title: 'Thousand Dragon',
    artist: 'jestR',
    slug: 'thousand-dragon',
    file: 'audio/singles/Thousand-Dragon-jestR.mp3',
    year: 2026,
    description: '',
    category: 'instrumental'
  },
  {
    title: 'K.O.',
    artist: 'jestR',
    slug: 'ko',
    file: 'audio/singles/KO.mp3',
    year: 2026,
    description: '',
    category: 'instrumental'
  },
  {
    title: 'hyperdream.odyssey.exe',
    artist: 'jestR',
    slug: 'hyperdream-odyssey',
    file: 'audio/singles/hyperdream-odyssey.mp3',
    year: 2026,
    description: '',
    category: 'instrumental'
  },
  {
    title: 'Soul Seer',
    artist: 'jestR',
    slug: 'soul-seer',
    file: 'audio/singles/Mp3-SoulSeer.mp3',
    year: 2021,
    description: 'Mystical and introspective journey through inner vision.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Geronimo',
    artist: 'jestR',
    slug: 'geronimo',
    file: 'audio/singles/11 - Geronimo- jestR - 2020.mp3',
    year: 2020,
    description: 'Explosive opener with raw energy and sharp lyricism.',
    artwork: 'images/Jesterdaze.png',
    category: 'instrumental'
  },
  {
    title: 'Spin Cycle',
    artist: 'jestR',
    slug: 'spin-cycle',
    file: 'audio/singles/Spin-Cycle_.mp3',
    year: 2025,
    description: '',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Mile High',
    artist: 'jestR',
    slug: 'mile-high',
    file: 'audio/singles/3 - Mile High- jestR - 2020.mp3',
    year: 2020,
    description: 'Atmospheric and introspective with soaring melodies.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Follow The Flow',
    artist: 'jestR',
    slug: 'follow-the-flow',
    file: 'audio/singles/Mp3-FollowTheFlow.mp3',
    year: 2021,
    description: 'Smooth, hypnotic groove exploring surrender and momentum.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Peace',
    artist: 'jestR',
    slug: 'peace',
    file: 'audio/singles/Peace.mp3',
    year: 2022,
    description: 'Minimal and meditative. A moment of stillness.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Strider',
    artist: 'jestR',
    slug: 'strider',
    file: 'audio/singles/Strider.mp3',
    year: 2022,
    description: 'Dark, driving beat with determined, cinematic feel.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Insane Membrane',
    artist: 'jestR',
    slug: 'insane-membrane',
    file: 'audio/singles/Insane_membrane.mp3',
    year: 2023,
    description: 'Chaotic, textured, and emotionally charged.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Wavy',
    artist: 'jestR',
    slug: 'wavy',
    file: 'audio/singles/wavy.mp3',
    year: 2023,
    description: 'Liquid, dreamy production with fluid delivery.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Boa Constrictor',
    artist: 'jestR',
    slug: 'boa-constrictor',
    file: 'audio/singles/boaconstrictor.mp3',
    year: 2024,
    description: 'Tense, coiled energy that slowly tightens.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'News',
    artist: 'jestR',
    slug: 'news',
    file: 'audio/singles/Newsss.mp3',
    year: 2024,
    description: 'Sharp commentary wrapped in heavy, distorted beats.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Wheels',
    artist: 'jestR',
    slug: 'wheels',
    file: 'audio/singles/mp3Wheels-36.mp3',
    year: 2020,
    description: 'Cyclic, hypnotic rhythm. Motion without destination.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Pop',
    artist: 'jestR',
    slug: 'pop',
    file: 'audio/singles/pop.mp3',
    year: 2024,
    description: 'Playful yet biting take on pop culture.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'The Sum Of Hippy Thoughts',
    artist: 'jestR',
    slug: 'the-sum-of-hippy-thoughts',
    file: 'audio/singles/the sum of hippy thoughts.mp3',
    year: 2025,
    description: 'Expansive, philosophical closer with lush textures.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'What Dreams May Come',
    artist: 'jestR',
    slug: 'what-dreams-may-come',
    file: 'audio/singles/what_dreams_may_comewavy.wav',
    year: 2020,
    description: 'Ethereal and cinematic. A dreamlike farewell.',
    artwork: null,
    category: 'instrumental'
  },
  {
    title: 'Jazzpot',
    artist: 'jestR',
    slug: 'jazzpot',
    file: 'audio/singles/jazzpot3.mp3',
    year: 2026,
    description: 'Jazz pot session.',
    artwork: null,
    category: 'rap',
    explicit: true,
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
      file: 'audio/singles/Still_Going_Higher.mp3',
      year: 2026,
      description: 'Motivational rap track with driving energy.',
      category: 'rap',
      explicit: true,
      lyrics: []
    },
    {
      title: 'Fat Stacks',
      artist: 'jestR',
      slug: 'fat-stacks',
      file: 'audio/singles/Fat Stacks.mp3',
      year: 2024,
      description: 'Rap track - fat stacks energy.',
      category: 'rap',
      explicit: true,
      lyrics: []
    },
    {
      title: 'Chokeslam',
      artist: 'jestR',
      slug: 'chokeslam',
      file: 'audio/singles/Chokeslam.mp3',
      year: 2024,
      description: 'Rap track - chokeslam impact.',
      category: 'rap',
      explicit: true,
      lyrics: []
    },
  {
    title: 'Grateful Sharpie',
    artist: 'jestR',
    slug: 'grateful-sharpie',
    file: 'audio/singles/Grateful_Sharpie.mp3',
    year: 2026,
    description: '',
    category: 'rap',
    explicit: true
  },

  ,
  {
    title: 'Tomb of the Creator ft. Tevin Page',
    artist: 'jestR',
    slug: 'tomb-of-the-creator',
    file: "audio/albums/jestR- act like your doing something cuz i see everything/1 - Tomb of the Creator- jestR - act like you're doing something cuz i see everything.mp3",
    year: 2018,
    description: '',
    category: 'rap',
    explicit: true,
    album: "act like you're doing something cuz i see everything",
    albumSlug: 'act-like-youre-doing-something',
    albumTrack: 1
  },
  {
    title: 'Blockbuster ft. Tevin Page',
    artist: 'jestR',
    slug: 'blockbuster',
    file: "audio/albums/jestR- act like your doing something cuz i see everything/2 - Blockbuster- jestR - act like you're doing something cuz i see everything.mp3",
    year: 2018,
    description: '',
    category: 'instrumental',
    album: "act like you're doing something cuz i see everything",
    albumSlug: 'act-like-youre-doing-something',
    albumTrack: 2
  },
  {
    title: 'What Is it Now?',
    artist: 'jestR',
    slug: 'what-is-it-now',
    file: "audio/albums/jestR- act like your doing something cuz i see everything/3 - What Is it Now- jestR - act like you're doing something cuz i see everything.mp3",
    year: 2018,
    description: '',
    category: 'rap',
    explicit: true,
    album: "act like you're doing something cuz i see everything",
    albumSlug: 'act-like-youre-doing-something',
    albumTrack: 3
  },
  {
    title: 'got nun?',
    artist: 'jestR',
    slug: 'got-nun',
    file: "audio/albums/jestR- act like your doing something cuz i see everything/4 - got nun- jestR - act like you're doing something cuz i see everything.mp3",
    year: 2018,
    description: '',
    category: 'instrumental',
    album: "act like you're doing something cuz i see everything",
    albumSlug: 'act-like-youre-doing-something',
    albumTrack: 4
  },
  {
    title: 'Sublime Beginnings',
    artist: 'jestR',
    slug: 'sublime-beginnings',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/Sublime Beginnings.mp3",
    year: 2017,
    description: '',
    category: 'rap',
    explicit: true,
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 12
  },
  {
    title: 'Space Radio',
    artist: 'jestR',
    slug: 'space-radio',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/Space Radio.mp3",
    year: 2017,
    description: '',
    category: 'instrumental',
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 9
  },
  {
    title: 'Exploding Galaxies',
    artist: 'jestR',
    slug: 'exploding-galaxies',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/Exploding Galaxies.mp3",
    year: 2017,
    description: '',
    category: 'instrumental',
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 10
  },
  {
    title: 'Acid Rain',
    artist: 'jestR',
    slug: 'acid-rain',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/Acid Rain.mp3",
    year: 2017,
    description: '',
    category: 'instrumental',
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 1
  },
  {
    title: '420',
    artist: 'jestR',
    slug: 'four-twenty',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/420.mp3",
    year: 2017,
    description: '',
    category: 'rap',
    explicit: true,
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 4
  },
  {
    title: 'Jungle Fever',
    artist: 'jestR',
    slug: 'jungle-fever',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/Jungle Fever.mp3",
    year: 2017,
    description: '',
    category: 'rap',
    explicit: true,
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 5
  },
  {
    title: 'Get',
    artist: 'jestR',
    slug: 'get',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/Get.mp3",
    year: 2017,
    description: '',
    category: 'rap',
    explicit: true,
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 11
  },
  {
    title: '"Winning"',
    artist: 'jestR',
    slug: 'winning',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/Winning.mp3",
    year: 2017,
    description: '',
    category: 'instrumental',
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 6
  },
  {
    title: 'My Anthem',
    artist: 'jestR',
    slug: 'my-anthem',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/My Anthem.mp3",
    year: 2017,
    description: '',
    category: 'rap',
    explicit: true,
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 2
  },
  {
    title: 'Nonnin',
    artist: 'jestR',
    slug: 'nonnin',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/Nonnin.mp3",
    year: 2017,
    description: '',
    category: 'rap',
    explicit: true,
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 3
  },
  {
    title: 'WHOiAM2u',
    artist: 'jestR',
    slug: 'whoiam2u',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/WHOiAM2u.mp3",
    year: 2017,
    description: '',
    category: 'rap',
    explicit: true,
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 7
  },
  {
    title: 'free(dumb)',
    artist: 'jestR',
    slug: 'free-dumb',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/free(dumb).mp3",
    year: 2017,
    description: '',
    category: 'rap',
    explicit: true,
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 8
  },
  {
    title: 'death of jestR',
    artist: 'jestR',
    slug: 'death-of-jestr',
    file: "audio/albums/jestR- Don't Say Nothing About Them Building Blocks/death of jestR.mp3",
    year: 2017,
    description: '',
    category: 'rap',
    explicit: true,
    album: "Don't Say Nothing About Them Building Blocks",
    albumSlug: 'building-blocks',
    albumTrack: 13
  }
];
  window.ORBIT_TRACKS = TRACKS;

const ALBUMS = [
  {
    slug: 'building-blocks',
    title: "Don't Say Nothing About Them Building Blocks",
    artist: 'jestR',
    artwork: 'images/zbuild_blocks_album.jpg',
    year: 2017
  },
  {
    slug: 'act-like-youre-doing-something',
    title: "act like you're doing something cuz i see everything",
    artist: 'jestR',
    artwork: 'images/albums/act-like-youre-doing-something.jpg',
    year: 2018
  }
];
window.ORBIT_ALBUMS = ALBUMS;


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
        // We were using native background playback — sync track + time back
        resumeFromIOSNativeBackgroundPlayback();
      } else {
        ensureAudioContextRunning();
        stopBackgroundAudioKeepAlive();
        // Defensive: UI index and <audio> src can drift after long background
        if (isIOS() && TRACKS[currentIndex] && !mediaIsFor(TRACKS[currentIndex])) {
          ensureMediaReady(TRACKS[currentIndex], { waveform: false });
        }
        if (audio && audio.paused) audio.play().catch(() => {});
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
  iosHandoffGuard = true;

  // Stop all background handoff / keep-alive logic first
  stopBackgroundAudioKeepAlive();

  if (isIOS() && iosBackgroundAudio) {
    teardownIOSBgEl(iosBackgroundAudio);
    iosBackgroundAudio = null;
  }

  if (isIOS() && precreatedIOSBackgroundAudio) {
    teardownIOSBgEl(precreatedIOSBackgroundAudio);
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
  setTimeout(() => { iosHandoffGuard = false; }, 120);
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
/* Blocks ended→next while tearing down the bg player (clearing src can fire `ended`). */
let iosHandoffGuard = false;

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
function tracklistPlayOrder() {
  const container = document.getElementById('sidebar-tracklist');
  const fromList = container
    ? [...container.querySelectorAll('.track-item')]
        .map(el => +el.dataset.idx)
        .filter(i => Number.isInteger(i) && TRACKS[i])
    : [];
  return fromList.length ? fromList : TRACKS.map((_, i) => i);
}

function stepTrack(dir, { wrap = true, autoplay = isPlaying } = {}) {
  const order = tracklistPlayOrder();
  if (!order.length) return false;
  let pos = order.indexOf(currentIndex);
  if (pos < 0) pos = dir > 0 ? -1 : 0;
  const nextPos = pos + dir;
  if (nextPos < 0 || nextPos >= order.length) {
    if (!wrap) return false;
    loadTrack(order[(nextPos + order.length) % order.length], autoplay);
    return true;
  }
  loadTrack(order[nextPos], autoplay);
  return true;
}

function handleTrackEnded() {
  // Ignore teardown (pause / clear src), mid-handoff races, and unlock sync
  if (!isPlaying || iosHandoffGuard) return;

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

  const order = tracklistPlayOrder();
  if (isShuffle) {
    let ni;
    do { ni = order[Math.floor(Math.random() * order.length)]; } while (order.length > 1 && ni === currentIndex);
    loadTrack(ni, true);
  } else if (stepTrack(1, { wrap: repeatMode === 1, autoplay: true })) {
    return;
  } else {
    pauseAndStopBackground();
  }
}

function wireIOSBackgroundTrackEvents(el) {
  if (!el || el._orbitEndedWired) return;
  el._orbitEndedWired = true;
  el.addEventListener('ended', handleTrackEnded);
}

function bgElMatchesTrack(el, t) {
  if (!el || !t) return false;
  const src = el.currentSrc || el.src || '';
  if (!src) return false;
  return src.includes(t.file) || src.includes(encodeURI(t.file));
}

function teardownIOSBgEl(el) {
  if (!el) return;
  try {
    el.pause();
    if (el._orbitEndedWired) {
      el.removeEventListener('ended', handleTrackEnded);
      el._orbitEndedWired = false;
    }
    el.removeAttribute('src');
    el.src = '';
    el.load();
  } catch (e) {}
}

function enterIOSNativeBackgroundPlayback() {
  if (!isIOS() || !isPlaying || iosBackgroundAudio) return;

  stopBackgroundAudioKeepAlive(); // make sure old keep-alive is dead

  try {
    const t = TRACKS[currentIndex];
    const mainTime = audio ? (audio.currentTime || 0) : 0;

    // Prefer a pre-created element if we have one (much faster handoff)
    if (precreatedIOSBackgroundAudio) {
      iosBackgroundAudio = precreatedIOSBackgroundAudio;
      precreatedIOSBackgroundAudio = null;
      // Pre-warm can be stale if the track advanced before lock
      if (t && !bgElMatchesTrack(iosBackgroundAudio, t)) {
        iosBackgroundAudio.src = encodeURI(t.file);
      }
      try { iosBackgroundAudio.currentTime = mainTime; } catch (e) {}
    } else {
      // Fallback: create on the fly
      iosBackgroundAudio = new Audio();
      iosBackgroundAudio.src = t ? encodeURI(t.file) : (audio ? audio.src : '');
      try { iosBackgroundAudio.currentTime = mainTime; } catch (e) {}
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

/* Sync main <audio> to whatever actually played while locked (track + time). */
function syncMainAudioToTrackAt(track, bgTime) {
  if (!audio || !track) return Promise.resolve();
  attachMedia(track);
  applyRepeatLoopFlag();

  const applyTime = () => {
    try {
      const t = Math.max(0, bgTime || 0);
      if (isGoodDuration(audio.duration)) {
        audio.currentTime = Math.min(t, Math.max(0, audio.duration - 0.05));
      } else {
        audio.currentTime = t;
      }
    } catch (e) {}
  };

  if (mediaIsFor(track) && audio.readyState >= 1) {
    applyTime();
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      audio.removeEventListener('loadedmetadata', finish);
      audio.removeEventListener('canplay', finish);
      applyTime();
      resolve();
    };
    audio.addEventListener('loadedmetadata', finish);
    audio.addEventListener('canplay', finish);
    // If src was already correct and metadata cached
    if (audio.readyState >= 1) finish();
    else setTimeout(finish, 900);
  });
}

function exitIOSNativeBackgroundPlayback() {
  if (!iosBackgroundAudio) return Promise.resolve();

  iosHandoffGuard = true;
  const track = TRACKS[currentIndex];
  let bgTime = 0;
  try {
    bgTime = iosBackgroundAudio.currentTime || 0;
  } catch (e) {}

  const bg = iosBackgroundAudio;
  iosBackgroundAudio = null;
  teardownIOSBgEl(bg);

  if (precreatedIOSBackgroundAudio) {
    teardownIOSBgEl(precreatedIOSBackgroundAudio);
    precreatedIOSBackgroundAudio = null;
  }

  return syncMainAudioToTrackAt(track, bgTime).finally(() => {
    // Keep guard briefly so a late `ended` from teardown cannot advance tracks
    setTimeout(() => { iosHandoffGuard = false; }, 120);
  });
}

function resumeFromIOSNativeBackgroundPlayback() {
  const stillPlaying = isPlaying;
  exitIOSNativeBackgroundPlayback().then(() => {
    if (!stillPlaying || !isPlaying) return;
    if (TRACKS[currentIndex]) ensureMediaReady(TRACKS[currentIndex]);
    ensureAudioContextRunning();
    if (audio) {
      audio.play().then(() => {
        isPlaying = true;
        updatePlayUI();
      }).catch(() => {});
    }
  });
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

function mediaIsFor(t) {
  if (!t) return false;
  const src = audio.currentSrc || audio.src || '';
  if (!src || src === window.location.href) return false;
  return src.includes(t.file) || src.includes(encodeURI(t.file));
}

function attachMedia(t) {
  if (!t || mediaIsFor(t)) return;
  audio.src = encodeURI(t.file);
  audio.load();
}

function requestWaveform(t) {
  if (!t) return;
  if (waveformCache[t.slug] && currentWaveform === waveformCache[t.slug]) return;
  generateWaveform(t).then(wf => {
    if (!TRACKS[currentIndex] || TRACKS[currentIndex].slug !== t.slug) return;
    currentWaveform = wf;
    const initialPct = (audio.duration && isGoodDuration(audio.duration))
      ? (audio.currentTime / audio.duration) : 0;
    drawWaveform(initialPct);
  }).catch(() => {});
}

function ensureMediaReady(t, { waveform = true } = {}) {
  if (!t) return;
  attachMedia(t);
  if (waveform) requestWaveform(t);
}

function seekToPct(pct) {
  pct = Math.max(0, Math.min(1, pct));
  setProgress(pct * 100);
  if (TRACKS[currentIndex]) ensureMediaReady(TRACKS[currentIndex]);
  if (audio.readyState >= 1 && isGoodDuration(audio.duration)) {
    audio.currentTime = pct * audio.duration;
    seekOnReady = null;
  } else {
    seekOnReady = pct;
  }
}

function skip(sec) {
  if (TRACKS[currentIndex]) ensureMediaReady(TRACKS[currentIndex]);
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
    // Never start keep-alive while the native handoff element owns playback —
    // that would revive the main element on a stale track.
    if (document.visibilityState !== 'visible' && isIOS() && !bgAudioKeepAlive && !iosBackgroundAudio) {
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

function focalPlainTitle(title) {
  return String(title).replace(/\s+ft\.\s+.+$/i, '');
}

function loadTrack(idx, autoplay) {
  currentIndex = idx;
  const t = TRACKS[idx];
  document.getElementById('fp-title').textContent = t.title;
  document.getElementById('fp-artist').textContent = t.artist;
  document.getElementById('focal-title').textContent = softBreakTitle(focalPlainTitle(t.title));
  document.getElementById('focal-artist').textContent = t.artist;
  const expEl = document.getElementById('fp-explicit');
  if (expEl) expEl.hidden = !trackIsExplicit(t);

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

  currentWaveform = waveformCache[t.slug] || null;
  if (currentWaveform) drawWaveform(0);

  document.querySelectorAll('.track-item').forEach(el => {
    el.classList.toggle('active', +el.dataset.idx === idx);
  });
  if (window.OrbitTrackRotary) OrbitTrackRotary.syncToIndex(idx);

  // If the song detail/info window is open, update its content in real-time to the new song
  const detailWin = document.getElementById('song-detail-win');
  if (detailWin && detailWin.style.display === 'flex') {
    populateSongDetail(currentIndex);
    // also ensure the detail play icon reflects any autoplay state change
    syncDetailPlayIcon();
  }

  if (typeof fitPlayerWindow === 'function') {
    requestAnimationFrame(() => fitPlayerWindow());
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
        stepTrack(1, { wrap: true, autoplay: true });
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        const cur = (isIOS() && iosBackgroundAudio)
          ? (iosBackgroundAudio.currentTime || 0)
          : (audio.currentTime || 0);
        if (cur > 3) {
          if (isIOS() && iosBackgroundAudio) {
            try { iosBackgroundAudio.currentTime = 0; } catch (e) {}
          } else {
            audio.currentTime = 0;
          }
        } else {
          stepTrack(-1, { wrap: true, autoplay: true });
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
      // Keep main <audio> src in lockstep (paused) so unlock cannot restore the old song
      attachMedia(t);
      try { audio.pause(); } catch (e) {}
      iosBackgroundAudio.pause();
      iosBackgroundAudio.src = encodeURI(t.file);
      try { iosBackgroundAudio.currentTime = 0; } catch (e) {}
      applyRepeatLoopFlag();
      wireIOSBackgroundTrackEvents(iosBackgroundAudio);
      iosBackgroundAudio.play().catch(() => {});
      isPlaying = true;
      updatePlayUI();
    } catch (e) {}
  } else if (autoplay) {
    ensureMediaReady(t);
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
        precreatedIOSBackgroundAudio.src = encodeURI(t.file);
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

  if (currentIndex < 0 || !TRACKS[currentIndex]) {
    if (TRACKS.length) loadTrack(0, true);
    return;
  }
  ensureMediaReady(TRACKS[currentIndex]);
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
  stepTrack(-1, { wrap: true, autoplay: isPlaying });
});
document.getElementById('btn-next').addEventListener('click', () => stepTrack(1, { wrap: true, autoplay: isPlaying }));
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
  const pctEl = document.getElementById('vol-pct');
  if (pctEl) pctEl.textContent = v + '%';

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
    if (currentIndex < 0 || !TRACKS[currentIndex]) {
      if (TRACKS.length) loadTrack(0, true);
      return;
    }
    ensureMediaReady(TRACKS[currentIndex]);
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

const EXPLICIT_TIP = 'Warning! Parental Advisory: explicit language may be used in this content.';

function trackIsExplicit(t) {
  return !!(t && (t.category === 'rap' || t.slug === 'mile-high' || t.slug === 'winning' || t.slug === 'exploding-galaxies'));
}

function explicitChipHTML(compact) {
  const text = compact ? 'E' : 'EXPLICIT';
  return `<span class="explicit-badge" title="${EXPLICIT_TIP}" aria-label="${EXPLICIT_TIP}">${text}</span>`;
}

function makeTrackRow(t, origIdx) {
  const el = document.createElement('div');
  el.className = 'track-item' + (origIdx === currentIndex ? ' active' : '');
  el.dataset.idx = origIdx;
  const eBadge = trackIsExplicit(t) ? explicitChipHTML(true) : '';
  el.innerHTML = `
      <div class="drag-handle" title="Drag to reorder"><span class="material-symbols-outlined" style="font-size:16px;pointer-events:none">drag_indicator</span></div>
      <div style="flex:1;min-width:0">
        <div class="track-title-row">
          <p class="track-title" style="font-weight:700;color:rgba(233,225,222,.82);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</p>
          ${eBadge}
        </div>
        <p class="track-artist" style="font-weight:600;letter-spacing:.06em;text-transform:none;color:rgba(0,200,150,.5);margin:0">${t.artist}</p>
      </div>
      <span class="material-symbols-outlined" style="font-size:13px;color:rgba(150,100,255,.3);flex-shrink:0;font-variation-settings:'FILL' 1">music_note</span>`;
  el.addEventListener('click', e => {
    if (e.target.closest('.drag-handle')) return;
    loadTrack(origIdx, true);
  });
  return el;
}

/* ── TRACKLIST RENDER + DRAG-REORDER ── */
function renderTracklist(filter) {
  const container = document.getElementById('sidebar-tracklist');
  Array.from(container.children).forEach(el => { if (el.id !== 'drop-line') el.remove(); });

  const q = (filter || '').toLowerCase();
  let items = TRACKS.map((t, i) => ({ t, origIdx: i }));

  if (currentTracklistCategory === 'albums') {
    items = items.filter(({ t }) => !!t.albumSlug);
  } else if (currentTracklistCategory && currentTracklistCategory !== 'all') {
    items = items.filter(({ t }) => (t.category || 'instrumental') === currentTracklistCategory);
  }

  items = items.filter(({ t }) => !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || (t.album || '').toLowerCase().includes(q));

  document.getElementById('track-count').textContent = `${items.length}/${TRACKS.length}`;

  if (currentTracklistCategory === 'albums') {
    (ALBUMS || []).forEach(album => {
      const groupItems = items
        .filter(({ t }) => t.albumSlug === album.slug)
        .sort((a, b) => (a.t.albumTrack || 0) - (b.t.albumTrack || 0));
      if (!groupItems.length) return;
      const group = document.createElement('div');
      group.className = 'album-group';
      const years = groupItems.map(({ t }) => t.year).filter(Boolean);
      const yearLabel = years.length ? (Math.min(...years) === Math.max(...years) ? String(Math.min(...years)) : `${Math.min(...years)}–${Math.max(...years)}`) : '';
      group.innerHTML = `
        <div class="album-head" role="button" tabindex="0">
          <img class="album-head-art" src="${album.artwork}" alt="">
          <div style="min-width:0">
            <p class="album-head-title">${album.title}</p>
            <p class="album-head-meta">${album.artist}${yearLabel ? ' · ' + yearLabel : ''} · ${groupItems.length} tracks</p>
          </div>
        </div>`;
      group.querySelector('.album-head').addEventListener('click', () => openAlbumWindow(album.slug));
      groupItems.forEach(({ t, origIdx }) => group.appendChild(makeTrackRow(t, origIdx)));
      container.appendChild(group);
    });
    if (window.OrbitTrackRotary) OrbitTrackRotary.refresh();
    return;
  }

  items.forEach(({ t, origIdx }) => container.appendChild(makeTrackRow(t, origIdx)));
  if (window.OrbitTrackRotary) OrbitTrackRotary.refresh();
}

function fmtDur(sec) {
  if (!sec || !isFinite(sec)) return '';
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function probeTrackDuration(t) {
  if (t.duration && isFinite(t.duration)) return Promise.resolve(t.duration);
  return new Promise(resolve => {
    const a = new Audio();
    a.preload = 'metadata';
    a.src = encodeURI(t.file);
    const done = (v) => { a.src = ''; resolve(v); };
    a.onloadedmetadata = () => { t.duration = a.duration; done(t.duration); };
    a.onerror = () => done(null);
    setTimeout(() => done(t.duration || null), 8000);
  });
}

function albumTracks(slug) {
  return TRACKS
    .map((t, i) => ({ t, origIdx: i }))
    .filter(({ t }) => t.albumSlug === slug)
    .sort((a, b) => (a.t.albumTrack || 0) - (b.t.albumTrack || 0));
}

function renderAlbumTrackList(slug) {
  const list = document.getElementById('album-win-tracks');
  if (!list) return;
  list.innerHTML = '';
  albumTracks(slug).forEach(({ t, origIdx }) => {
    const el = document.createElement('div');
    el.className = 'track-item' + (origIdx === currentIndex ? ' active' : '');
    el.dataset.idx = origIdx;
    const bits = [t.year, t.category, fmtDur(t.duration)].filter(Boolean);
    const eBadge = trackIsExplicit(t) ? explicitChipHTML(true) : '';
    el.innerHTML = `
      <span class="album-track-num">${t.albumTrack || ''}</span>
      <div style="flex:1;min-width:0">
        <div class="track-title-row">
          <p class="track-title" style="font-weight:700;color:rgba(233,225,222,.82);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</p>
          ${eBadge}
        </div>
        <p class="album-track-meta">${bits.join(' · ')}</p>
      </div>`;
    el.addEventListener('click', () => loadTrack(origIdx, true));
    list.appendChild(el);
  });
}

function openAlbumWindow(slug) {
  const album = (ALBUMS || []).find(a => a.slug === slug);
  if (!album) return;
  const tracks = albumTracks(slug);
  const years = tracks.map(({ t }) => t.year).filter(Boolean);
  const yearLabel = years.length ? (Math.min(...years) === Math.max(...years) ? String(Math.min(...years)) : `${Math.min(...years)}–${Math.max(...years)}`) : '';
  const win = document.getElementById('album-win');
  const titleBar = document.getElementById('album-win-title');
  const nameEl = document.getElementById('album-win-name');
  const artistEl = document.getElementById('album-win-artist');
  const statsEl = document.getElementById('album-win-stats');
  const artEl = document.getElementById('album-win-art');
  const descEl = document.getElementById('album-win-desc');
  if (titleBar) titleBar.textContent = album.title;
  if (nameEl) nameEl.textContent = album.title;
  if (artistEl) artistEl.textContent = album.artist;
  if (statsEl) statsEl.textContent = [yearLabel, `${tracks.length} tracks`].filter(Boolean).join(' · ');
  if (artEl) { artEl.src = album.artwork; artEl.alt = album.title; }
  if (descEl) {
    const d = (album.description || '').trim();
    descEl.hidden = !d;
    descEl.textContent = d;
  }
  renderAlbumTrackList(slug);
  if (win) {
    win.style.display = 'flex';
    if (!isMob() && win.dataset.userPositioned !== 'true') {
      const vw = window.innerWidth, vh = window.innerHeight;
      const w = Math.min(380, vw - 40), h = Math.min(520, vh - 120);
      win.style.width = w + 'px';
      win.style.height = h + 'px';
      win.style.left = Math.max(16, (vw - w) / 2) + 'px';
      win.style.top = Math.max(16, (vh - h) / 2 - 20) + 'px';
    }
    if (typeof bringToFront === 'function') bringToFront('album-win');
  }
  if (window.orbitDock) {
    orbitDock.show('album-win', { label: 'Album', icon: 'album' });
  }
  tracks.forEach(({ t }) => {
    probeTrackDuration(t).then(() => {
      if (document.getElementById('album-win')?.style.display === 'flex') renderAlbumTrackList(slug);
    });
  });
}

function closeAlbumWindow() {
  const win = document.getElementById('album-win');
  if (win) win.style.display = 'none';
  if (window.orbitDock) orbitDock.hide('album-win');
}
window.closeAlbumWindow = closeAlbumWindow;
window.openAlbumWindow = openAlbumWindow;

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
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
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

  function onHandlePointerDown(e) {
    const handle = e.target.closest && e.target.closest('.drag-handle');
    if (!handle || !container.contains(handle)) return;
    if (e.button != null && e.button !== 0) return;
    startDrag(handle, e);
    try { handle.setPointerCapture(e.pointerId); } catch (err) {}
  }

  container.addEventListener('pointerdown', onHandlePointerDown);
  container.addEventListener('mousedown', e => {
    const handle = e.target.closest('.drag-handle');
    if (handle) startDrag(handle, e);
  });
  container.addEventListener('touchstart', e => {
    const handle = e.target.closest('.drag-handle');
    if (handle) { startDrag(handle, e.touches[0]); e.preventDefault(); }
  }, { passive: false });

  window.addEventListener('pointermove', e => { if (dragging) onMove(e.clientY); });
  window.addEventListener('mousemove', e => { if (dragging) onMove(e.clientY); });
  window.addEventListener('touchmove', e => { if (dragging) { e.preventDefault(); onMove(e.touches[0].clientY); } }, { passive: false });
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);
})();

document.getElementById('search-input').addEventListener('input', function () {
  renderTracklist(this.value);
});

/* ── MOBILE TRACK ROTARY (slide up/down · snap · bubbly haptic) ── */
window.OrbitTrackRotary = (function () {
  const SLOT = 56;
  /* Focus band sits above true center (25% from top) */
  const FOCUS_Y = 0.25;
  let items = [];
  let pos = 0;
  let sel = 0;
  let lastTick = -1;
  let dragging = false;
  let moved = false;
  let ptrId = null;
  let startY = 0;
  let startPos = 0;
  let lastY = 0;
  let lastT = 0;
  let vy = 0;
  let wired = false;
  let raf = 0;
  let startItem = null;

  function enabled() {
    return window.matchMedia('(max-width: 767px)').matches;
  }
  function root() { return document.getElementById('track-rotary'); }
  function list() { return document.getElementById('sidebar-tracklist'); }
  function lens() { return root() && root().querySelector('.track-rotary-lens'); }

  function collect() {
    const c = list();
    if (!c) return [];
    return Array.from(c.querySelectorAll('.track-item'));
  }

  function tickFeel() {
    try {
      if (navigator.vibrate) navigator.vibrate(9);
    } catch (e) {}
    const el = lens();
    if (!el) return;
    el.classList.remove('tick');
    // force reflow for re-trigger
    void el.offsetWidth;
    el.classList.add('tick');
  }

  function layout() {
    const c = list();
    const r = root();
    if (!c) return;

    if (!enabled()) {
      if (r) r.classList.remove('is-on', 'is-dragging');
      c.classList.remove('rotary-on');
      collect().forEach(el => {
        el.style.transform = '';
        el.style.opacity = '';
        el.style.zIndex = '';
        el.classList.remove('rotary-center');
      });
      return;
    }

    if (r) r.classList.add('is-on');
    c.classList.add('rotary-on');
    items = collect();
    if (!items.length) return;

    const n = items.length;
    pos = Math.max(0, Math.min(n - 1, pos));
    sel = Math.round(pos);
    sel = Math.max(0, Math.min(n - 1, sel));
    const mid = c.clientHeight * FOCUS_Y;

    items.forEach((el, i) => {
      const y = (i - pos) * SLOT + mid - SLOT / 2;
      // Straight rows — no scale indent
      el.style.transform = `translate3d(0,${y}px,0)`;
      el.style.opacity = '1';
      el.style.zIndex = String(20 + (i === Math.round(pos) ? 10 : 0));
      el.classList.toggle('rotary-center', i === sel);
      el.classList.toggle('active', +el.dataset.idx === currentIndex);
    });
  }

  function scheduleLayout() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      layout();
    });
  }

  function commit(autoplay) {
    items = collect();
    if (!items.length) return;
    sel = Math.max(0, Math.min(items.length - 1, Math.round(pos)));
    pos = sel;
    lastTick = sel;
    layout();
    const idx = +items[sel].dataset.idx;
    if (!Number.isInteger(idx) || !TRACKS[idx]) return;
    if (idx !== currentIndex) {
      loadTrack(idx, autoplay !== false);
    } else if (autoplay) {
      // re-tap center / snap same track → ensure playing
      if (!isPlaying) {
        const btn = document.getElementById('btn-play');
        if (btn) btn.click();
      }
    }
  }

  function refresh() {
    items = collect();
    if (!enabled()) {
      layout();
      return;
    }
    const i = items.findIndex(el => +el.dataset.idx === currentIndex);
    pos = i >= 0 ? i : 0;
    sel = Math.round(pos);
    lastTick = sel;
    layout();
  }

  function syncToIndex(trackIdx) {
    if (!enabled() || dragging) return;
    items = collect();
    const i = items.findIndex(el => +el.dataset.idx === trackIdx);
    if (i < 0) return;
    pos = i;
    sel = i;
    lastTick = i;
    layout();
  }

  function onDown(e) {
    if (!enabled()) return;
    if (e.button != null && e.button !== 0) return;
    const c = list();
    const r = root();
    if (!c || !r || !r.classList.contains('is-on')) return;
    // don't steal search / tabs / reorder handle
    if (e.target.closest && e.target.closest('input, button, a, .tracklist-tabs, .drag-handle')) return;

    ptrId = e.pointerId;
    dragging = true;
    moved = false;
    startY = lastY = e.clientY;
    startPos = pos;
    lastT = performance.now();
    vy = 0;
    lastTick = Math.round(pos);
    startItem = e.target.closest ? e.target.closest('.track-item') : null;
    r.classList.add('is-dragging');
    try { r.setPointerCapture(e.pointerId); } catch (err) {}
  }

  function onMove(e) {
    if (!dragging || ptrId == null || e.pointerId !== ptrId) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    vy = (e.clientY - lastY) / dt;
    lastY = e.clientY;
    lastT = now;

    const dy = e.clientY - startY;
    if (Math.abs(dy) > 8) moved = true;

    // finger up → earlier tracks (pos decreases)
    const n = Math.max(1, collect().length);
    pos = startPos - dy / SLOT;
    pos = Math.max(0, Math.min(n - 1, pos));

    const tickAt = Math.round(pos);
    if (tickAt !== lastTick) {
      lastTick = tickAt;
      tickFeel();
    }
    scheduleLayout();
  }

  function onUp(e) {
    if (!dragging || (e && e.pointerId != null && e.pointerId !== ptrId)) return;
    dragging = false;
    ptrId = null;
    const r = root();
    if (r) {
      r.classList.remove('is-dragging');
      try { if (e && e.pointerId != null) r.releasePointerCapture(e.pointerId); } catch (err) {}
    }

    items = collect();
    const n = Math.max(1, items.length);

    // Tap a visible row → jump to that song
    if (!moved && startItem && items.includes(startItem)) {
      const i = items.indexOf(startItem);
      if (i >= 0) {
        pos = i;
        tickFeel();
        commit(true);
        startItem = null;
        moved = false;
        return;
      }
    }

    // light inertia after a slide
    let target = pos - vy * 80 / SLOT;
    target = Math.max(0, Math.min(n - 1, target));
    pos = Math.round(target);
    tickFeel();
    commit(true);
    startItem = null;
    moved = false;
  }

  function wire() {
    if (wired) return;
    wired = true;
    const r = root();
    if (!r) return;
    r.addEventListener('pointerdown', onDown);
    r.addEventListener('pointermove', onMove);
    r.addEventListener('pointerup', onUp);
    r.addEventListener('pointercancel', onUp);
    window.addEventListener('resize', () => {
      if (enabled()) refresh();
      else layout();
    });
  }

  // boot after DOM ready (player.js is at end of body)
  wire();

  return { refresh, syncToIndex, layout, enabled };
})();

/* ── TRACKLIST CATEGORY TABS ── */
/* Tap a tab, drag-scrub the bar, flick the bar, or swipe the tracklist
   body horizontally (not the drag handle) to change category.
   On phone the bar is a vertical rail on the right — scrub axis follows. */
(function wireTracklistTabs() {
  const bar = document.querySelector('#tracklist-win .tracklist-tabs');
  const list = document.getElementById('sidebar-tracklist');
  if (!bar) return;
  const tabs = () => Array.from(bar.querySelectorAll('.tab'));
  const railVertical = () => window.matchMedia('(max-width: 767px)').matches;

  function activateTab(tab) {
    if (!tab) return;
    if (tab.classList.contains('active')) return;
    tabs().forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTracklistCategory = tab.dataset.category || 'all';
    const search = document.getElementById('search-input');
    renderTracklist(search ? search.value : '');
  }

  function tabAtPoint(clientX, clientY) {
    // Geometry hit-test (pointer capture breaks elementFromPoint on iOS)
    const listTabs = tabs();
    for (let i = 0; i < listTabs.length; i++) {
      const r = listTabs[i].getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return listTabs[i];
      }
    }
    // Axis fallback while scrubbing slightly off the rail
    if (railVertical()) {
      for (let i = 0; i < listTabs.length; i++) {
        const r = listTabs[i].getBoundingClientRect();
        if (clientY >= r.top && clientY <= r.bottom) return listTabs[i];
      }
    } else {
      for (let i = 0; i < listTabs.length; i++) {
        const r = listTabs[i].getBoundingClientRect();
        if (clientX >= r.left && clientX <= r.right) return listTabs[i];
      }
    }
    return null;
  }

  function stepTab(dir) {
    const listTabs = tabs();
    if (!listTabs.length) return;
    const i = listTabs.findIndex(t => t.classList.contains('active'));
    const next = listTabs[Math.max(0, Math.min(listTabs.length - 1, (i < 0 ? 0 : i) + dir))];
    activateTab(next);
  }

  /* ── Tab bar: tap + scrub + flick ── */
  let barPtr = null;
  let barStartX = 0, barStartY = 0, barLastX = 0, barLastY = 0, barLastT = 0, barVx = 0, barVy = 0;
  let barScrubbing = false, barMoved = false, barStartTab = null;

  bar.addEventListener('pointerdown', (e) => {
    if (e.button != null && e.button !== 0) return;
    const tab = e.target.closest && e.target.closest('.tab');
    if (!tab) return;
    barPtr = e.pointerId;
    barStartTab = tab;
    barStartX = barLastX = e.clientX;
    barStartY = barLastY = e.clientY;
    barLastT = performance.now();
    barVx = 0;
    barVy = 0;
    barScrubbing = false;
    barMoved = false;
    try { bar.setPointerCapture(e.pointerId); } catch (_) {}
  });

  bar.addEventListener('pointermove', (e) => {
    if (barPtr == null || e.pointerId !== barPtr) return;
    const now = performance.now();
    const dt = Math.max(1, now - barLastT);
    barVx = (e.clientX - barLastX) / dt;
    barVy = (e.clientY - barLastY) / dt;
    barLastX = e.clientX;
    barLastY = e.clientY;
    barLastT = now;

    const adx = Math.abs(e.clientX - barStartX);
    const ady = Math.abs(e.clientY - barStartY);
    if (!barMoved && adx < 8 && ady < 8) return;
    barMoved = true;

    const vert = railVertical();
    const alongRail = vert ? ady >= adx : adx >= ady;
    if (alongRail) {
      barScrubbing = true;
      const under = tabAtPoint(e.clientX, e.clientY);
      if (under) activateTab(under);
    }
  });

  function endBarPtr(e) {
    if (barPtr == null || (e && e.pointerId != null && e.pointerId !== barPtr)) return;
    const cx = e && e.clientX != null ? e.clientX : barLastX;
    const cy = e && e.clientY != null ? e.clientY : barLastY;
    const totalDx = cx - barStartX;
    const totalDy = cy - barStartY;
    const vert = railVertical();
    const mainDelta = vert ? totalDy : totalDx;
    const crossDelta = vert ? totalDx : totalDy;
    const mainV = vert ? barVy : barVx;
    const flick = Math.abs(mainV) > 0.45 || Math.abs(mainDelta) > 28;

    if (!barMoved) {
      activateTab(barStartTab);
    } else if (barScrubbing) {
      const under = tabAtPoint(cx, cy);
      if (under) activateTab(under);
    } else if (flick && Math.abs(mainDelta) > Math.abs(crossDelta) * 1.1) {
      // Vertical rail: swipe up = next (down the list visually after 180° spine),
      // keep same mental model as horizontal (negative main axis → next).
      stepTab(mainDelta < 0 ? 1 : -1);
    }

    barPtr = null;
    barScrubbing = false;
    barMoved = false;
    barStartTab = null;
    try { if (e && e.pointerId != null) bar.releasePointerCapture(e.pointerId); } catch (_) {}
  }

  bar.addEventListener('pointerup', endBarPtr);
  bar.addEventListener('pointercancel', endBarPtr);

  tabs().forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab(tab);
    });
  });

  /* ── Tracklist body: horizontal swipe changes category (not on drag handle) ── */
  if (!list) return;

  let listPtr = null;
  let listStartX = 0, listStartY = 0, listLastX = 0, listLastT = 0, listVx = 0;
  let listAxis = null; // null | 'h' | 'v'
  let listIgnore = false;

  list.addEventListener('pointerdown', (e) => {
    if (e.button != null && e.button !== 0) return;
    // Mobile rotary owns vertical gestures on the list
    if (window.OrbitTrackRotary && OrbitTrackRotary.enabled && OrbitTrackRotary.enabled()) {
      listIgnore = true;
      listPtr = null;
      return;
    }
    if (e.target.closest && e.target.closest('.drag-handle')) {
      listIgnore = true;
      listPtr = null;
      return;
    }
    listIgnore = false;
    listPtr = e.pointerId;
    listStartX = listLastX = e.clientX;
    listStartY = e.clientY;
    listLastT = performance.now();
    listVx = 0;
    listAxis = null;
  }, { passive: true });

  list.addEventListener('pointermove', (e) => {
    if (listIgnore || listPtr == null || e.pointerId !== listPtr) return;
    const now = performance.now();
    const dt = Math.max(1, now - listLastT);
    listVx = (e.clientX - listLastX) / dt;
    listLastX = e.clientX;
    listLastT = now;

    const adx = Math.abs(e.clientX - listStartX);
    const ady = Math.abs(e.clientY - listStartY);
    if (listAxis == null && (adx > 10 || ady > 10)) {
      listAxis = adx > ady * 1.15 ? 'h' : 'v';
      if (listAxis === 'h') {
        try { list.setPointerCapture(e.pointerId); } catch (_) {}
      }
    }
  }, { passive: true });

  function endListPtr(e) {
    if (listIgnore) {
      listIgnore = false;
      return;
    }
    if (listPtr == null || (e && e.pointerId != null && e.pointerId !== listPtr)) return;

    const totalDx = (e && e.clientX != null ? e.clientX : listLastX) - listStartX;
    const totalDy = (e && e.clientY != null ? e.clientY : listStartY) - listStartY;
    const flick = Math.abs(listVx) > 0.4 || Math.abs(totalDx) > 40;

    if (listAxis === 'h' && flick && Math.abs(totalDx) > Math.abs(totalDy) * 1.05) {
      stepTab(totalDx < 0 ? 1 : -1);
    }

    try { if (e && e.pointerId != null) list.releasePointerCapture(e.pointerId); } catch (_) {}
    listPtr = null;
    listAxis = null;
  }

  list.addEventListener('pointerup', endListPtr);
  list.addEventListener('pointercancel', endListPtr);
})();

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
  if (window.orbitDock) orbitDock.show('lyrics-win');

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
  if (window.orbitDock) orbitDock.hide('lyrics-win');
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
    if (window.orbitDock) orbitDock.show('song-detail-win');
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