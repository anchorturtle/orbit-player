/* ============================================
   ORBIT PLAYER — space3d.js
   Real-time 3D cosmic background (Three.js):
   • Living planet that is itself an audio visualizer — the live waveform
     physically ripples the sphere in sync with the sound
   • Per-song planet palettes (deep maroons, purples, turquoise, pinks)
     that bleed into the UI accent colors
   • Sparse, elegant orbiting dust (less is more)
   • Rare ambient events on long random timers — comets, rogue moons,
     tumbling asteroids, supernovae, satellites. The longer you drift
     on the site, the more you might witness.
   • Lazy drifting camera + deep parallax starfield + galaxy band
   Falls back silently to the classic 2D star canvas when WebGL or
   the Three.js CDN is unavailable (e.g. fully offline file:// open).
   ============================================ */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('space3d-canvas');
  if (!canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    return; // WebGL unavailable → 2D fallback in main.js stays active
  }

  // Signal to main.js that the 3D background owns the sky
  window.__SPACE3D_ACTIVE = true;
  document.documentElement.classList.add('space3d-on');

  const MOBILE = (typeof isMob === 'function') ? isMob() : (window.innerWidth < 768);
  const DPR_CAP = MOBILE ? 1.35 : 1.5;
  // Fill-rate budget: the fog shaders are heavy, so cap total rendered
  // pixels. Big windows render slightly soft (it's fog) but stay smooth.
  const PIXEL_BUDGET = MOBILE ? 1.0e6 : 1.35e6;
  function effectiveDPR() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const px = window.innerWidth * window.innerHeight * dpr * dpr;
    return px > PIXEL_BUDGET ? dpr * Math.sqrt(PIXEL_BUDGET / px) : dpr;
  }

  renderer.setPixelRatio(effectiveDPR());
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);

  // Soft lighting only for physical props (asteroids / moons)
  const keyLight = new THREE.DirectionalLight(0xd9ccff, 0.95);
  keyLight.position.set(-5, 4, 7);
  scene.add(keyLight);
  scene.add(new THREE.AmbientLight(0x241a3a, 1.1));

  /* Brand palette (matches CSS custom props) */
  const COL_PURPLE = new THREE.Color('#7B2FFF');
  const COL_BLUE   = new THREE.Color('#2D5BFF');
  const COL_GREEN  = new THREE.Color('#00C896');
  const COL_BABY   = new THREE.Color('#7EC8E3');

  /* ── PER-SONG PLANET PALETTES ──
     Deep, dark, psychedelic-but-precise. [surface, swirl, energy] */
  const PALETTES = [
    ['#7B2FFF', '#2D5BFF', '#00C896'], // royal violet (brand / default)
    ['#6E1230', '#B02458', '#FF4D88'], // void maroon → hot pink veins
    ['#0A5C6E', '#1240A0', '#19E3C2'], // deep turquoise abyss
    ['#4A1B7A', '#8A2BE2', '#FF3D9A'], // ultraviolet orchid
    ['#5C0F2E', '#7B2FFF', '#C2275A'], // wine nebula
    ['#16216E', '#4D6BFF', '#B14DFF'], // indigo abyss
    ['#0B3B4C', '#0E7C7B', '#06D6A0'], // abyssal teal
    ['#3B0E45', '#A2196E', '#FF6FB7'], // dark magenta dream
    ['#241054', '#5B1FA8', '#19B8E3'], // midnight iris
    ['#54123B', '#933B8B', '#E84FBF'], // plum haze
    ['#4C0E22', '#A8324A', '#FF7A6E'], // ember rose
    ['#06343C', '#0F8A6E', '#7FFFC9'], // abyss jade
    ['#33104F', '#C23B8A', '#5BD0FF'], // orchid voltage
    ['#1B0B3A', '#6E2FB8', '#FF9ECF']  // blood orchid dusk
  ];

  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function paletteFor(slug) {
    if (!slug) return PALETTES[0];
    return PALETTES[hashStr(slug) % PALETTES.length];
  }

  /* Live palette state (lerped smoothly toward targets on track change) */
  const palA = COL_PURPLE.clone(), palB = COL_BLUE.clone(), palC = COL_GREEN.clone();
  const tgtA = palA.clone(), tgtB = palB.clone(), tgtC = palC.clone();

  function setPaletteTargets(p) {
    tgtA.set(p[0]); tgtB.set(p[1]); tgtC.set(p[2]);
    // Bleed the song color into the UI (focal glow, progress fill)
    try {
      const root = document.documentElement.style;
      root.setProperty('--track-a', p[0]);
      root.setProperty('--track-b', p[1]);
      root.setProperty('--track-c', p[2]);
    } catch (e) {}
  }

  /* ── Shared GLSL noise (compact 3D value-noise + fbm) ── */
  const NOISE_GLSL = `
    float hash13(vec3 p){
      p = fract(p * 0.3183099 + .1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise3(vec3 x){
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hash13(i+vec3(0,0,0)), hash13(i+vec3(1,0,0)), f.x),
                     mix(hash13(i+vec3(0,1,0)), hash13(i+vec3(1,1,0)), f.x), f.y),
                 mix(mix(hash13(i+vec3(0,0,1)), hash13(i+vec3(1,0,1)), f.x),
                     mix(hash13(i+vec3(0,1,1)), hash13(i+vec3(1,1,1)), f.x), f.y), f.z);
    }
    #ifndef FBM_OCT
    #define FBM_OCT 4
    #endif
    float fbm(vec3 p){
      float v = 0.0, a = 0.5;
      for (int i = 0; i < FBM_OCT; i++){
        v += a * noise3(p);
        p = p * 2.07 + vec3(11.3, 7.7, 5.1);
        a *= 0.5;
      }
      return v;
    }
  `;

  /* ════════════════ AUDIO TEXTURES ════════════════
     Live time-domain waveform + frequency spectrum, uploaded every frame
     and fed to the aurora shell — light, not geometry. */
  const WAVE_W = 128;
  const waveArr = new Uint8Array(WAVE_W * 4);
  for (let i = 0; i < WAVE_W; i++) waveArr[i * 4] = 128; // silence = center
  const waveTex = new THREE.DataTexture(waveArr, WAVE_W, 1, THREE.RGBAFormat);
  waveTex.magFilter = THREE.LinearFilter;
  waveTex.minFilter = THREE.LinearFilter;
  waveTex.needsUpdate = true;

  const FREQ_W = 64;
  const freqArr = new Uint8Array(FREQ_W * 4);
  const freqTex = new THREE.DataTexture(freqArr, FREQ_W, 1, THREE.RGBAFormat);
  freqTex.magFilter = THREE.LinearFilter;
  freqTex.minFilter = THREE.LinearFilter;
  freqTex.needsUpdate = true;

  /* ════════════════ PLANET (calm solid body — the aurora does the dancing) ════════════════ */
  const PLANET_R = 1.25;
  const planetUniforms = {
    uTime:    { value: 0 },
    uAudio:   { value: 0 },
    uBass:    { value: 0 },
    uColA:    { value: palA },
    uColB:    { value: palB },
    uColC:    { value: palC }
  };

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_R, 96, 64),
    new THREE.ShaderMaterial({
      uniforms: planetUniforms,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        varying vec3 vView;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uAudio;
        uniform float uBass;
        uniform vec3 uColA;
        uniform vec3 uColB;
        uniform vec3 uColC;
        varying vec3 vNormal;
        varying vec3 vPos;
        varying vec3 vView;
        ${NOISE_GLSL}
        void main(){
          vec3 n = normalize(vPos);

          // slow drifting storm bands + swirl
          float t = uTime * 0.045;
          vec3 p1 = n * vec3(1.6, 4.2, 1.6) + vec3(t, -t * 0.6, t * 0.3);
          float bands = fbm(p1);
          vec3 p2 = n * 3.4 + vec3(-t * 0.8, t * 0.4, t);
          float swirl = fbm(p2 + bands * 1.4);
          float storms = fbm(n * 7.0 - vec3(0.0, t * 2.2, 0.0) + swirl * 2.0);

          // deep-space base → surface → swirl, energy veins on the peaks
          vec3 col = mix(vec3(0.012, 0.006, 0.04), uColA * 0.62, smoothstep(0.18, 0.62, bands));
          col = mix(col, uColB * 0.68, smoothstep(0.42, 0.85, swirl) * 0.8);
          col += uColC * smoothstep(0.68, 0.95, storms) * (0.30 + uAudio * 0.85);
          col += uColA * smoothstep(0.75, 1.0, swirl) * 0.4;

          // simple key light from upper-left + soft terminator
          vec3 L = normalize(vec3(-0.55, 0.5, 0.7));
          float diff = clamp(dot(normalize(vNormal), L), 0.0, 1.0);
          col *= 0.30 + diff * 0.9;

          // fresnel rim — electric atmosphere edge, audio-charged
          float fr = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0), 2.6);
          col += mix(uColA, uColB, 0.4) * fr * (0.85 + uBass * 0.9);

          gl_FragColor = vec4(col, 1.0);
        }
      `
    })
  );
  planet.rotation.z = 0.18;
  scene.add(planet);

  /* ════════════════ AURORA VISUALIZER SHELLS ════════════════
     The audio visualizer: misty, luminous aurora wrapping the planet.
     The shells themselves VIBRATE IN 3D — audio + rolling noise displace
     the fog volumetrically, so the light has real lumpy depth instead of
     a smooth bubble. Two counter-drifting layers give parallax.
     The planet itself never deforms. */
  const AURORA_FRAG = `
    uniform float uTime;
    uniform float uAudio;
    uniform float uBass;
    uniform float uSeed;
    uniform float uGain;
    uniform sampler2D uWaveTex;
    uniform sampler2D uFreqTex;
    uniform vec3 uColA;
    uniform vec3 uColB;
    uniform vec3 uColC;
    varying vec3 vNormal;
    varying vec3 vPos;
    varying vec3 vView;
    varying float vDisp;
    ${NOISE_GLSL}
    void main(){
      vec3 n = normalize(vPos);
      float lon = atan(n.z, n.x) / 6.2831853 + 0.5;
      float lat = n.y;

      // ── live audio samples ──
      // waveform around the sphere (seam feathered in the data)
      float wave  = texture2D(uWaveTex, vec2(lon, 0.5)).r - 0.502;
      // spectrum: mirrored coordinate so the wrap point never cracks
      float fc1 = abs(fract(lon + uTime * 0.008) * 2.0 - 1.0);
      float fc2 = abs(fract(lon * 2.0 - uTime * 0.005) * 2.0 - 1.0);
      float fLow  = texture2D(uFreqTex, vec2(fc1 * 0.4, 0.5)).r;        // bass region
      float fMid  = texture2D(uFreqTex, vec2(0.2 + fc2 * 0.5, 0.5)).r;  // mids
      float fHigh = texture2D(uFreqTex, vec2(0.65 + fc1 * 0.3, 0.5)).r; // air

      // ── domain-warped flow (the "wind" the light rides on) ──
      float t = uTime * 0.05;
      float warp  = fbm(n * 2.3 + vec3(t, -t * 0.7, t * 0.4));
      float warp2 = fbm(n * 4.1 - vec3(t * 1.3, t * 0.5, -t * 0.8) + warp * 1.6);

      // ── aurora curtains: ribbons of light flowing around the planet,
      //    phase-danced by the live waveform, lit by the spectrum ──
      float ribbonPhase = (lon + warp * 0.45) * 24.0 + uTime * 0.5 + wave * 5.0;
      float curtain = 0.5 + 0.5 * sin(ribbonPhase);
      curtain = pow(curtain, 3.0 + 3.0 * (1.0 - fMid)); // crisper ribbons when quiet, wider blooms when loud
      float ribbonPhase2 = (lon - warp2 * 0.3) * 11.0 - uTime * 0.32 - wave * 3.0;
      float curtain2 = pow(0.5 + 0.5 * sin(ribbonPhase2), 4.0);

      // curtains live in two soft belts; mist covers everywhere
      float belt = exp(-pow((abs(lat) - 0.40) * 2.6, 2.0));
      float polar = smoothstep(0.55, 0.95, abs(lat)); // faint polar crown

      // ── ethereal mist (cosmic fog, breathes with the music) ──
      float mist = fbm(n * 3.3 + vec3(-t * 1.2, t * 0.9, t * 0.6) + wave * 0.7 + warp * 0.8);
      mist = smoothstep(0.25, 0.95, mist);

      // ── limb weighting: fog hugs the edge of the planet ──
      float ndv = abs(dot(normalize(vNormal), normalize(vView)));
      float fres = pow(1.0 - ndv, 1.7);

      // ── energy mix — ribbons bloom hardest at the limb, like rays of light
      //    standing off the planet's edge ──
      float limbBoost = 0.45 + fres * 1.1;
      float energy =
          curtain  * belt * (0.18 + fLow * 1.7) * limbBoost +
          curtain2 * belt * (0.10 + fMid * 1.2) * limbBoost +
          polar * (0.05 + fHigh * 0.8) * (0.5 + 0.5 * curtain) +
          mist * (0.10 + uAudio * 0.85);

      // analog shimmer — faint scan-flicker riding the high end
      energy *= 0.88 + 0.12 * sin(uTime * 1.7 + lon * 60.0 + wave * 8.0 + warp2 * 4.0);

      // 3D depth: outward-vibrating lumps glow hotter, valleys fall dark
      energy *= 0.55 + smoothstep(-0.06, 0.16, vDisp) * 1.5;

      float a = energy * (0.16 + fres * 1.05) * (0.45 + uAudio * 1.25 + uBass * 0.35) * uGain;

      // ── luminous color: deep palette with iridescent play, never neon-flat ──
      // each band carries its own color family
      vec3 col = mix(uColA, uColB, curtain);             // bass curtains: surface ↔ swirl
      col = mix(col, mix(uColB, uColC, 0.6), curtain2);  // mid ribbons drift toward energy
      col = mix(col, uColA, mist * 0.45);
      col += uColC * fHigh * 0.55 * curtain;
      col += mix(uColC, uColA, 0.5) * polar * 0.4;

      // spectral iridescence — hue shimmer flowing through the fog,
      // scaled by the palette so it stays deep and dark, not rainbow-hippy
      vec3 iri = 0.5 + 0.5 * cos(6.2831 * (mist * 0.7 + curtain * 0.35 + lat * 0.25 + uTime * 0.016 + uSeed + vec3(0.0, 0.33, 0.67)));
      col = mix(col, col * (0.55 + iri * 1.1), 0.4);

      gl_FragColor = vec4(col * 1.5, clamp(a, 0.0, 0.85));
    }
  `;
  const AURORA_VERT = `
    uniform float uTime;
    uniform float uAudio;
    uniform float uBass;
    uniform float uSeed;
    uniform float uPuff;
    uniform sampler2D uWaveTex;
    uniform sampler2D uFreqTex;
    varying vec3 vNormal;
    varying vec3 vPos;
    varying vec3 vView;
    varying float vDisp;
    ${NOISE_GLSL}
    void main(){
      vec3 n = normalize(position);
      float lon = atan(n.z, n.x) / 6.2831853 + 0.5;

      // live audio at this longitude
      float wave = texture2D(uWaveTex, vec2(lon, 0.5)).r - 0.502;
      float fc = abs(fract(lon) * 2.0 - 1.0);
      float f = texture2D(uFreqTex, vec2(fc * 0.5, 0.5)).r;

      // ── 3D VIBRATION ──
      // slow rolling volumetric lumps + spectrum punching the fog outward
      // + the raw waveform rippling the equator + bass breathing the whole shell
      float t = uTime * 0.07 + uSeed;
      float lump = fbm(n * 2.6 + vec3(t, -t * 0.6, t * 0.45)) - 0.5;
      float disp =
          lump * (0.10 + uAudio * 0.18) +
          f * 0.17 * (0.35 + abs(lump) * 1.8) +
          wave * 0.12 * exp(-n.y * n.y * 3.0) +
          uBass * 0.05;
      disp *= uPuff;
      vDisp = disp;

      vec3 p = position + normal * disp;
      vNormal = normalize(normalMatrix * normal);
      vPos = position;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vView = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `;
  // Two counter-drifting shells: a dense inner fog and a wilder, fainter
  // outer veil — the offset lumps between them read as true 3D depth.
  function makeAuroraShell(radiusMul, seed, puff, gain, octaves) {
    const u = {
      uTime:    { value: 0 },
      uAudio:   { value: 0 },
      uBass:    { value: 0 },
      uSeed:    { value: seed },
      uPuff:    { value: puff },
      uGain:    { value: gain },
      uWaveTex: { value: waveTex },
      uFreqTex: { value: freqTex },
      uColA:    { value: palA },
      uColB:    { value: palB },
      uColC:    { value: palC }
    };
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_R * radiusMul, 80, 56),
      new THREE.ShaderMaterial({
        uniforms: u,
        defines: { FBM_OCT: octaves },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: AURORA_VERT,
        fragmentShader: AURORA_FRAG
      })
    );
    scene.add(mesh);
    return { mesh, u };
  }
  const auroraShells = [
    makeAuroraShell(1.07, 0.0, 0.72, 1.0, 3),  // dense inner fog (planet stays the anchor)
    makeAuroraShell(1.21, 7.3, 1.45, 0.5, 2)   // wild outer veil, cheap noise (it's faint)
  ];

  /* Outer halo — soft glow with frequency-driven aurora rays bleeding outward */
  const atmoUniforms = {
    uTime: { value: 0 },
    uBass: { value: 0 },
    uAudio: { value: 0 },
    uFreqTex: { value: freqTex },
    uColA: { value: palA },
    uColB: { value: palB }
  };
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_R * 1.5, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: atmoUniforms,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uBass;
        uniform float uAudio;
        uniform sampler2D uFreqTex;
        uniform vec3 uColA;
        uniform vec3 uColB;
        varying vec3 vNormal;
        varying vec3 vPos;
        ${NOISE_GLSL}
        void main(){
          vec3 n = normalize(vPos);
          float lon = atan(n.z, n.x) / 6.2831853 + 0.5;
          float fc = abs(fract(lon + uTime * 0.006) * 2.0 - 1.0);
          float f = texture2D(uFreqTex, vec2(fc * 0.6, 0.5)).r;
          // far softer falloff + noise breakup so it reads as haze, not a shield
          float glow = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, -1.0)), 4.6);
          float haze = 0.55 + 0.45 * fbm(n * 3.0 + vec3(uTime * 0.03, -uTime * 0.02, 0.0));
          float rays = 0.85 + 0.3 * f + 0.08 * sin(lon * 40.0 + uTime * 0.7);
          vec3 col = mix(uColA, uColB, 0.5 + 0.5 * sin(uTime * 0.12));
          gl_FragColor = vec4(col, glow * haze * rays * (0.18 + uBass * 0.3 + uAudio * 0.18));
        }
      `
    })
  );
  scene.add(atmosphere);

  /* ════════════════ SPARSE ORBITING DUST (less is more) ════════════════ */
  const ringGroup = new THREE.Group();
  ringGroup.rotation.x = Math.PI * 0.46;
  ringGroup.rotation.y = -0.22;
  scene.add(ringGroup);

  const RING_COUNT = MOBILE ? 320 : 620;
  const ringGeo = new THREE.BufferGeometry();
  {
    const pos = new Float32Array(RING_COUNT * 3);
    const col = new Float32Array(RING_COUNT * 3);
    const sz  = new Float32Array(RING_COUNT);
    const ph  = new Float32Array(RING_COUNT);
    const tmp = new THREE.Color();
    for (let i = 0; i < RING_COUNT; i++) {
      const band = Math.random();
      const base = band < 0.62 ? 1.98 : 2.7;
      const spread = band < 0.62 ? 0.26 : 0.16;
      const r = base + (Math.random() + Math.random() + Math.random() - 1.5) * spread;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3]     = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
      pos[i * 3 + 2] = Math.sin(a) * r;
      tmp.copy(Math.random() < 0.6 ? COL_PURPLE : (Math.random() < 0.5 ? COL_BLUE : COL_BABY));
      tmp.multiplyScalar(0.45 + Math.random() * 0.5);
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      sz[i] = 0.4 + Math.random() * 1.1;
      ph[i] = Math.random() * Math.PI * 2;
    }
    ringGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    ringGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    ringGeo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    ringGeo.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
  }
  const ringUniforms = {
    uTime:  { value: 0 },
    uAudio: { value: 0 },
    uScale: { value: window.innerHeight * 0.5 }
  };
  const ringPoints = new THREE.Points(ringGeo, new THREE.ShaderMaterial({
    uniforms: ringUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uAudio;
      uniform float uScale;
      varying vec3 vColor;
      varying float vTw;
      void main(){
        vColor = aColor;
        vTw = 0.5 + 0.5 * sin(uTime * 1.1 + aPhase);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float size = aSize * (1.0 + uAudio * 0.6);
        gl_PointSize = size * uScale * 0.03 / max(0.1, -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vTw;
      void main(){
        vec2 d = gl_PointCoord - 0.5;
        float a = smoothstep(0.5, 0.05, length(d));
        gl_FragColor = vec4(vColor * vTw, a * 0.55);
      }
    `
  }));
  ringGroup.add(ringPoints);

  /* ════════════════ STARFIELD (deep parallax, twinkle) ════════════════ */
  const STAR_COUNT = MOBILE ? 1600 : 3200;
  const starGeo = new THREE.BufferGeometry();
  {
    const pos = new Float32Array(STAR_COUNT * 3);
    const col = new Float32Array(STAR_COUNT * 3);
    const sz  = new Float32Array(STAR_COUNT);
    const ph  = new Float32Array(STAR_COUNT);
    const tmp = new THREE.Color();
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 26 + Math.pow(Math.random(), 0.55) * 130;
      const th = Math.random() * Math.PI * 2;
      const cph = (Math.random() * 2 - 1);
      const sph = Math.sqrt(1 - cph * cph);
      pos[i * 3]     = r * sph * Math.cos(th);
      pos[i * 3 + 1] = r * cph * 0.8;
      pos[i * 3 + 2] = -Math.abs(r * sph * Math.sin(th)) - 4;
      const w = Math.random();
      if (w < 0.78)      tmp.setRGB(0.86, 0.84, 1.0);   // cool white
      else if (w < 0.88) tmp.copy(COL_BABY);
      else if (w < 0.95) tmp.copy(COL_PURPLE).lerp(new THREE.Color('#ffffff'), 0.55);
      else               tmp.copy(COL_GREEN).lerp(new THREE.Color('#ffffff'), 0.5);
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      sz[i] = 0.6 + Math.pow(Math.random(), 2.4) * 3.4;
      ph[i] = Math.random() * Math.PI * 2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    starGeo.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
  }
  const starUniforms = {
    uTime:  { value: 0 },
    uAudio: { value: 0 },
    uScale: { value: window.innerHeight * 0.5 }
  };
  const stars = new THREE.Points(starGeo, new THREE.ShaderMaterial({
    uniforms: starUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uAudio;
      uniform float uScale;
      varying vec3 vColor;
      varying float vTw;
      void main(){
        vColor = aColor;
        vTw = 0.5 + 0.5 * sin(uTime * (0.6 + fract(aPhase) * 1.7) + aPhase);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (0.8 + uAudio * 0.35) * uScale * 0.085 / max(0.1, -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vTw;
      void main(){
        vec2 d = gl_PointCoord - 0.5;
        float r = length(d);
        float core = smoothstep(0.5, 0.0, r);
        float spike = max(0.0, 1.0 - abs(d.x) * 14.0) + max(0.0, 1.0 - abs(d.y) * 14.0);
        float a = core * (0.35 + 0.65 * vTw) + spike * 0.10 * vTw;
        gl_FragColor = vec4(vColor, a);
      }
    `
  }));
  scene.add(stars);

  /* ════════════════ GALAXY BAND (far depth layer) ════════════════ */
  const galaxyU = {
    uTime: { value: 0 },
    uC1: { value: COL_PURPLE.clone().multiplyScalar(0.8) },
    uC2: { value: COL_BABY.clone().multiplyScalar(0.7) }
  };
  const galaxy = new THREE.Mesh(
    new THREE.PlaneGeometry(420, 110),
    new THREE.ShaderMaterial({
      uniforms: galaxyU,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uC1;
        uniform vec3 uC2;
        varying vec2 vUv;
        ${NOISE_GLSL}
        void main(){
          vec2 q = vUv - 0.5;
          float t = uTime * 0.004;
          float n = fbm(vec3(q.x * 9.0 + t, q.y * 26.0, 3.7));
          float lane = exp(-q.y * q.y * 26.0);
          float wisps = smoothstep(0.3, 0.9, n) * lane;
          float edge = smoothstep(0.5, 0.2, abs(q.x));
          vec3 col = mix(uC1, uC2, n);
          gl_FragColor = vec4(col, wisps * edge * 0.085);
        }
      `
    })
  );
  galaxy.position.set(0, 28, -150);
  galaxy.rotation.z = -0.35;
  scene.add(galaxy);

  /* ════════════════ NEBULA CLOUDS ════════════════ */
  const NEB_DEFS = [
    { x: -34, y:  14, z: -68, s: 95,  c1: COL_PURPLE, c2: COL_BLUE,  o: 0.22 },
    { x:  38, y: -10, z: -82, s: 110, c1: COL_BLUE,   c2: COL_GREEN, o: 0.17 },
    { x:   6, y:  30, z: -95, s: 120, c1: COL_PURPLE, c2: COL_GREEN, o: 0.14 },
    { x: -14, y: -30, z: -75, s: 85,  c1: COL_BLUE,   c2: COL_PURPLE, o: 0.17 }
  ];
  const nebulae = [];
  NEB_DEFS.slice(0, MOBILE ? 3 : 4).forEach((d, i) => {
    const u = {
      uTime: { value: 0 },
      uAudio: { value: 0 },
      uC1: { value: d.c1.clone() },
      uC2: { value: d.c2.clone() },
      uOpacity: { value: d.o },
      uSeed: { value: i * 13.7 + 3.1 }
    };
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(d.s, d.s),
      new THREE.ShaderMaterial({
        uniforms: u,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          varying vec2 vUv;
          void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uAudio;
          uniform vec3 uC1;
          uniform vec3 uC2;
          uniform float uOpacity;
          uniform float uSeed;
          varying vec2 vUv;
          ${NOISE_GLSL}
          void main(){
            vec2 q = vUv - 0.5;
            float dist = length(q);
            float t = uTime * 0.018;
            float n = fbm(vec3(q * 3.0 + uSeed, t));
            float n2 = fbm(vec3(q * 6.5 - uSeed, -t * 1.4 + n));
            float cloud = smoothstep(0.25, 0.85, n * 0.7 + n2 * 0.5);
            float falloff = smoothstep(0.5, 0.08, dist);
            vec3 col = mix(uC1, uC2, n2);
            float a = cloud * falloff * uOpacity * (1.0 + uAudio * 0.5);
            gl_FragColor = vec4(col, a);
          }
        `
      })
    );
    m.position.set(d.x, d.y, d.z);
    m.rotation.z = Math.random() * Math.PI;
    nebulae.push({ mesh: m, u, rs: (Math.random() - 0.5) * 0.0035, tint: i < 2 });
    scene.add(m);
  });

  /* ════════════════ SHOOTING STARS ════════════════ */
  const shooters = [];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const m = new THREE.Line(g, new THREE.LineBasicMaterial({
      color: 0xcfe6ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    scene.add(m);
    shooters.push({ line: m, active: false, t: 0, dur: 1, from: new THREE.Vector3(), dir: new THREE.Vector3() });
  }
  let nextShoot = 7;

  function spawnShooter(s) {
    s.active = true;
    s.t = 0;
    s.dur = 0.7 + Math.random() * 0.7;
    s.from.set((Math.random() - 0.2) * 50, 12 + Math.random() * 18, -30 - Math.random() * 30);
    s.dir.set(-(0.5 + Math.random()), -(0.35 + Math.random() * 0.4), 0).normalize().multiplyScalar(34 + Math.random() * 20);
  }

  /* ════════════════ SOFT GLOW SPRITE TEXTURE (for events) ════════════════ */
  function makeGlowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }
  const glowTex = makeGlowTexture();

  /* ════════════════ RARE AMBIENT EVENTS ════════════════
     Long randomized timers. Drift long enough and you might see:
     a comet, a rogue moon slipping behind the planet, a tumbling
     asteroid, a distant supernova, or a tiny blinking satellite. */
  const activeEvents = [];
  let nextEventAt = 16 + Math.random() * 22; // first encounter 16–38s in

  function scheduleNextEvent(t) {
    nextEventAt = t + 24 + Math.random() * 66; // then every 24–90s
  }

  /* — Comet: bright head + long fading tail, slow majestic crossing — */
  function spawnComet() {
    const dirLeft = Math.random() < 0.5;
    const z = -(26 + Math.random() * 30);
    const from = new THREE.Vector3(dirLeft ? 46 : -46, 6 + Math.random() * 20, z);
    const vel = new THREE.Vector3(dirLeft ? -1 : 1, -(0.12 + Math.random() * 0.2), 0).normalize()
      .multiplyScalar(2.6 + Math.random() * 2.2);
    const dur = 22 + Math.random() * 12;

    const head = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xd8f4ff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    head.scale.setScalar(1.7);
    scene.add(head);

    const TAIL_N = 26;
    const tailGeo = new THREE.BufferGeometry();
    tailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TAIL_N * 3), 3));
    const tail = new THREE.Line(tailGeo, new THREE.LineBasicMaterial({
      color: 0x9fd8ff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    scene.add(tail);

    const hist = [];
    let t0 = 0;
    return {
      update(dt) {
        t0 += dt;
        const k = t0 / dur;
        if (k >= 1) return false;
        const p = from.clone().addScaledVector(vel, t0);
        p.y += Math.sin(t0 * 0.4) * 0.6; // gentle arc
        head.position.copy(p);
        const fade = Math.sin(Math.min(1, k) * Math.PI);
        head.material.opacity = fade * 0.9;
        hist.unshift(p.clone());
        if (hist.length > TAIL_N) hist.pop();
        const a = tailGeo.attributes.position.array;
        for (let i = 0; i < TAIL_N; i++) {
          const hp = hist[Math.min(i, hist.length - 1)] || p;
          // tail stretches opposite to travel + slight solar-wind lift
          const back = vel.clone().normalize().multiplyScalar(-i * 0.34);
          a[i * 3] = hp.x + back.x;
          a[i * 3 + 1] = hp.y + back.y + i * 0.05;
          a[i * 3 + 2] = hp.z;
        }
        tailGeo.attributes.position.needsUpdate = true;
        tail.material.opacity = fade * 0.5;
        return true;
      },
      dispose() {
        scene.remove(head); scene.remove(tail);
        head.material.dispose(); tail.material.dispose(); tailGeo.dispose();
      }
    };
  }

  /* — Rogue moon: small pale sphere drifting behind the planet — */
  function spawnMoon() {
    const dirLeft = Math.random() < 0.5;
    const r = 0.22 + Math.random() * 0.22;
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(r, 32, 32),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.7 + Math.random() * 0.12, 0.12, 0.52),
        roughness: 0.95, metalness: 0.05
      })
    );
    const y = -1.2 + Math.random() * 2.6;
    const z = -(5.5 + Math.random() * 5);
    moon.position.set(dirLeft ? 13 : -13, y, z);
    const speed = (dirLeft ? -1 : 1) * (0.45 + Math.random() * 0.35);
    const dur = 28 / Math.abs(speed) ;
    scene.add(moon);
    let t0 = 0;
    return {
      update(dt) {
        t0 += dt;
        if (t0 >= dur) return false;
        moon.position.x += speed * dt;
        moon.position.y += Math.sin(t0 * 0.25) * 0.0035;
        moon.rotation.y += dt * 0.3;
        return true;
      },
      dispose() {
        scene.remove(moon);
        moon.geometry.dispose(); moon.material.dispose();
      }
    };
  }

  /* — Asteroid: dark jagged rock tumbling slowly past, mid-depth — */
  function spawnAsteroid() {
    const geo = new THREE.IcosahedronGeometry(0.28 + Math.random() * 0.3, 1);
    const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pa, i);
      v.multiplyScalar(0.78 + Math.random() * 0.45);
      pa.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const rock = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: 0x2c2438, roughness: 1, metalness: 0.12, flatShading: true
    }));
    const dirLeft = Math.random() < 0.5;
    rock.position.set(dirLeft ? 16 : -16, -4 + Math.random() * 9, -(9 + Math.random() * 9));
    const speed = (dirLeft ? -1 : 1) * (0.5 + Math.random() * 0.4);
    const spin = { x: (Math.random() - 0.5) * 0.7, y: (Math.random() - 0.5) * 0.7, z: (Math.random() - 0.5) * 0.4 };
    const dur = 34 / Math.abs(speed);
    scene.add(rock);
    let t0 = 0;
    return {
      update(dt) {
        t0 += dt;
        if (t0 >= dur) return false;
        rock.position.x += speed * dt;
        rock.rotation.x += spin.x * dt;
        rock.rotation.y += spin.y * dt;
        rock.rotation.z += spin.z * dt;
        return true;
      },
      dispose() {
        scene.remove(rock);
        rock.geometry.dispose(); rock.material.dispose();
      }
    };
  }

  /* — Supernova: a distant star blooms violently, then dies back down — */
  function spawnSupernova() {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: new THREE.Color().copy(palC).lerp(new THREE.Color('#ffffff'), 0.6),
      transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    sprite.position.set((Math.random() - 0.5) * 90, (Math.random() - 0.3) * 50, -(60 + Math.random() * 60));
    scene.add(sprite);
    const dur = 7;
    let t0 = 0;
    return {
      update(dt) {
        t0 += dt;
        if (t0 >= dur) return false;
        // fast violent attack, long elegant decay
        const k = t0 / dur;
        const env = k < 0.08 ? (k / 0.08) : Math.pow(1 - (k - 0.08) / 0.92, 1.8);
        sprite.material.opacity = env * 0.95;
        sprite.scale.setScalar(2 + env * 9 + k * 3);
        return true;
      },
      dispose() {
        scene.remove(sprite);
        sprite.material.dispose();
      }
    };
  }

  /* — Satellite: tiny blinking light gliding across the upper sky — */
  function spawnSatellite() {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xffffff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    const dirLeft = Math.random() < 0.5;
    const y = 6 + Math.random() * 12;
    sprite.position.set(dirLeft ? 30 : -30, y, -(20 + Math.random() * 14));
    sprite.scale.setScalar(0.5);
    scene.add(sprite);
    const speed = (dirLeft ? -1 : 1) * (1.1 + Math.random() * 0.7);
    const dur = 60 / Math.abs(speed) * 0.55;
    let t0 = 0;
    return {
      update(dt, t) {
        t0 += dt;
        if (t0 >= dur) return false;
        sprite.position.x += speed * dt;
        sprite.position.y += Math.sin(t0 * 0.18) * 0.004;
        const fade = Math.sin(Math.min(1, t0 / dur) * Math.PI);
        const blink = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * 2.4), 6.0);
        sprite.material.opacity = fade * blink * 0.85;
        return true;
      },
      dispose() {
        scene.remove(sprite);
        sprite.material.dispose();
      }
    };
  }

  const EVENT_POOL = [
    { fn: spawnComet,     w: 3 },
    { fn: spawnMoon,      w: 3 },
    { fn: spawnAsteroid,  w: 2.5 },
    { fn: spawnSupernova, w: 1.5 },
    { fn: spawnSatellite, w: 2 }
  ];
  function spawnRandomEvent() {
    const total = EVENT_POOL.reduce((s, e) => s + e.w, 0);
    let pick = Math.random() * total;
    for (const e of EVENT_POOL) {
      pick -= e.w;
      if (pick <= 0) { activeEvents.push(e.fn()); return; }
    }
  }

  /* ════════════════ TRACK-CHANGE SHOCKWAVE ════════════════ */
  let shockwave = null;
  function spawnShockwave() {
    if (shockwave) { shockwave.dispose(); shockwave = null; }
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.96, 1.0, 96),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().copy(tgtC),
        transparent: true, opacity: 0.65,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    ring.rotation.x = ringGroup.rotation.x;
    ring.rotation.y = ringGroup.rotation.y;
    ring.scale.setScalar(PLANET_R * 1.15);
    scene.add(ring);
    let t0 = 0;
    shockwave = {
      update(dt) {
        t0 += dt;
        const k = t0 / 1.5;
        if (k >= 1) return false;
        const s = PLANET_R * (1.15 + k * k * 5.2);
        ring.scale.setScalar(s);
        ring.material.opacity = 0.65 * (1 - k) * (1 - k);
        return true;
      },
      dispose() {
        scene.remove(ring);
        ring.geometry.dispose(); ring.material.dispose();
      }
    };
  }

  /* ════════════════ AUDIO REACTIVITY ════════════════
     Taps the player's existing Web Audio graph (gainNode) with an analyser.
     player.js loads after this file; bindings exist by the time the loop runs. */
  let analyser = null, freqData = null, timeData = null;
  let levelSm = 0, bassSm = 0;

  function tryHookAudio() {
    if (analyser) return;
    try {
      if (typeof audioContext !== 'undefined' && audioContext &&
          typeof gainNode !== 'undefined' && gainNode) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.78;
        gainNode.connect(analyser); // parallel tap, does not affect output
        freqData = new Uint8Array(analyser.frequencyBinCount);
        timeData = new Uint8Array(analyser.fftSize);
      }
    } catch (e) { /* audio graph not ready yet */ }
  }

  function sampleAudio() {
    if (!analyser) { tryHookAudio(); return; }
    try {
      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(timeData);

      let bass = 0, all = 0;
      const bassBins = 10;
      for (let i = 1; i < bassBins; i++) bass += freqData[i];
      for (let i = 0; i < freqData.length; i++) all += freqData[i];
      bass = bass / (bassBins - 1) / 255;
      all = all / freqData.length / 255;
      bassSm += (bass - bassSm) * 0.18;
      levelSm += (all - levelSm) * 0.12;

      // upload live waveform → aurora phase/shimmer texture
      const step = timeData.length / WAVE_W;
      for (let i = 0; i < WAVE_W; i++) {
        waveArr[i * 4] = timeData[Math.floor(i * step)];
      }
      // feather the seam so the wrap point doesn't crack the shell
      const FE = 9;
      for (let i = 0; i < FE; i++) {
        const k = i / FE;
        const idx = (WAVE_W - FE + i) * 4;
        waveArr[idx] = Math.round(waveArr[idx] * (1 - k) + waveArr[0] * k);
      }
      waveTex.needsUpdate = true;

      // upload spectrum → aurora curtain energy (low bins = most musical info)
      for (let i = 0; i < FREQ_W; i++) {
        // gentle temporal smoothing keeps the light analog, never strobing
        freqArr[i * 4] = Math.round(freqArr[i * 4] * 0.6 + freqData[i] * 0.4);
      }
      freqTex.needsUpdate = true;
    } catch (e) { /* context may be suspended */ }
  }

  /* ════════════════ PER-SONG PALETTE WATCHER ════════════════ */
  let lastSlug = null;
  let trackPollAcc = 0;
  function watchTrack(dt) {
    trackPollAcc += dt;
    if (trackPollAcc < 0.4) return;
    trackPollAcc = 0;
    try {
      if (typeof TRACKS !== 'undefined' && typeof currentIndex !== 'undefined' && TRACKS[currentIndex]) {
        const slug = TRACKS[currentIndex].slug;
        if (slug !== lastSlug) {
          const first = (lastSlug === null);
          lastSlug = slug;
          setPaletteTargets(paletteFor(slug));
          if (!first) spawnShockwave(); // tactile pulse when the song changes
        }
      }
    } catch (e) {}
  }

  /* ════════════════ CAMERA + DRIFT ════════════════ */
  const mouse = { x: 0, y: 0, has: false };
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    mouse.has = true;
  }, { passive: true });

  let baseZ = 8;
  function fitCamera() {
    const h = window.innerHeight;
    const targetPx = Math.min(360, h * 0.46);
    const z = (PLANET_R * h) / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * targetPx);
    baseZ = Math.max(6.2, Math.min(13, z));
    camera.position.z = baseZ;
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(effectiveDPR());
    renderer.setSize(w, h);
    camera.aspect = w / h;
    fitCamera();
    camera.updateProjectionMatrix();
    starUniforms.uScale.value = h * 0.5;
    ringUniforms.uScale.value = h * 0.5;
  }
  window.addEventListener('resize', resize);
  fitCamera();

  /* ════════════════ RENDER LOOP ════════════════ */
  const clock = new THREE.Clock();
  let rafId = null;

  function frame() {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    sampleAudio();
    watchTrack(dt);

    // smooth palette flow (planet melts from one song's world to the next)
    palA.lerp(tgtA, 0.022);
    palB.lerp(tgtB, 0.022);
    palC.lerp(tgtC, 0.022);

    // uniforms
    planetUniforms.uTime.value = t;
    planetUniforms.uAudio.value = levelSm;
    planetUniforms.uBass.value = bassSm;
    auroraShells.forEach(s => {
      s.u.uTime.value = t;
      s.u.uAudio.value = levelSm;
      s.u.uBass.value = bassSm;
    });
    atmoUniforms.uTime.value = t;
    atmoUniforms.uBass.value = bassSm;
    atmoUniforms.uAudio.value = levelSm;
    ringUniforms.uTime.value = t;
    ringUniforms.uAudio.value = levelSm;
    starUniforms.uTime.value = t;
    starUniforms.uAudio.value = levelSm;
    galaxyU.uTime.value = t;
    nebulae.forEach(n => {
      n.u.uTime.value = t;
      n.u.uAudio.value = levelSm;
      n.mesh.rotation.z += n.rs * dt;
      if (n.tint) {
        // the two nearest nebulae slowly absorb the song's palette
        n.u.uC1.value.lerp(tgtA, 0.004);
        n.u.uC2.value.lerp(tgtB, 0.004);
      }
    });

    // motion
    planet.rotation.y += dt * (0.045 + bassSm * 0.08);
    planet.rotation.x = Math.sin(t * 0.02) * 0.04; // slow axis precession
    // fog layers counter-drift for parallax depth
    auroraShells[0].mesh.rotation.y -= dt * 0.016;
    auroraShells[0].mesh.rotation.z = Math.sin(t * 0.013) * 0.06;
    auroraShells[1].mesh.rotation.y += dt * 0.010;
    auroraShells[1].mesh.rotation.x = Math.sin(t * 0.009 + 2.0) * 0.05;
    ringPoints.rotation.y += dt * (0.05 + levelSm * 0.1);
    stars.rotation.y += dt * 0.0032;
    stars.rotation.z += dt * 0.001;

    // ── adrift: layered slow lissajous + very lazy mouse parallax ──
    const driftX = Math.sin(t * 0.031) * 0.55 + Math.sin(t * 0.011 + 2.0) * 0.35;
    const driftY = Math.cos(t * 0.023) * 0.34 + Math.sin(t * 0.017 + 1.0) * 0.22;
    const mx = mouse.has ? mouse.x * 0.5 : 0;
    const my = mouse.has ? -mouse.y * 0.3 : 0;
    camera.position.x += ((driftX + mx) - camera.position.x) * 0.012;
    camera.position.y += ((driftY + my) - camera.position.y) * 0.012;
    camera.position.z += ((baseZ + Math.sin(t * 0.013) * 0.45) - camera.position.z) * 0.008;
    camera.lookAt(0, 0, 0);

    // shooting stars
    nextShoot -= dt;
    if (nextShoot <= 0) {
      const free = shooters.find(s => !s.active);
      if (free) spawnShooter(free);
      nextShoot = 8 + Math.random() * 14;
    }
    shooters.forEach(s => {
      if (!s.active) return;
      s.t += dt;
      const k = s.t / s.dur;
      if (k >= 1) {
        s.active = false;
        s.line.material.opacity = 0;
        return;
      }
      const head = s.from.clone().addScaledVector(s.dir, k);
      const tail = s.from.clone().addScaledVector(s.dir, Math.max(0, k - 0.07));
      const a = s.line.geometry.attributes.position.array;
      a[0] = tail.x; a[1] = tail.y; a[2] = tail.z;
      a[3] = head.x; a[4] = head.y; a[5] = head.z;
      s.line.geometry.attributes.position.needsUpdate = true;
      s.line.material.opacity = Math.sin(k * Math.PI) * 0.85;
    });

    // rare ambient events — the longer you stay, the more you may see
    if (t > nextEventAt) {
      spawnRandomEvent();
      scheduleNextEvent(t);
    }
    for (let i = activeEvents.length - 1; i >= 0; i--) {
      if (!activeEvents[i].update(dt, t)) {
        activeEvents[i].dispose();
        activeEvents.splice(i, 1);
      }
    }

    // track-change shockwave
    if (shockwave && !shockwave.update(dt)) {
      shockwave.dispose();
      shockwave = null;
    }

    renderer.render(scene, camera);
  }

  // Pause rendering when the tab is hidden (battery + perf)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (!rafId) {
      clock.getDelta(); // swallow the gap
      frame();
    }
  });

  frame();
})();
