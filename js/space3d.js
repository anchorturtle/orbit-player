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
    // MSAA off: full-viewport soft shaders + additive particles hide jaggies;
    // antialias:true often costs 20–40% fill rate for almost no visible gain here.
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
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
  // Cap DPR: planet/aurora are foggy; extra retina pixels rarely read as quality.
  const DPR_CAP = MOBILE ? 1.25 : 1.5;

  // ── Adaptive resolution governor ──
  // Holds 60fps by trading render resolution (it's mostly fog and glow, so
  // a softer buffer is invisible; dropped frames are not).
  let renderScale = 1.0;
  const SCALE_MIN = 0.5, SCALE_MAX = 1.0;
  function effectiveDPR() {
    return Math.min(window.devicePixelRatio || 1, DPR_CAP) * renderScale;
  }
  function applyRenderScale() {
    renderer.setPixelRatio(effectiveDPR());
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  let perfAccum = 0, perfFrames = 0, perfWindow = 0;
  let fpsAtFullScale = 0, floorStrikes = 0, governorOff = false;
  function governFps(dt) {
    if (governorOff) return;
    // ignore stalls (tab switches, decode hitches) so one spike doesn't downscale
    if (dt > 0.25) return;
    perfAccum += dt; perfFrames++; perfWindow += dt;
    if (perfWindow < 0.8) return;
    const avgFps = perfFrames / perfAccum;
    perfAccum = 0; perfFrames = 0; perfWindow = 0;
    if (avgFps < 55 && renderScale > SCALE_MIN) {
      if (renderScale === SCALE_MAX) fpsAtFullScale = avgFps;
      renderScale = Math.max(SCALE_MIN, renderScale * 0.88);
      applyRenderScale();
    } else if (avgFps < 55 && renderScale <= SCALE_MIN) {
      // bottomed out and STILL slow → we're not fill-rate bound (e.g. a
      // compositor-throttled webview or vsync cap). Blurring buys nothing,
      // so give the pixels back and stop governing.
      if (++floorStrikes >= 3 && (!fpsAtFullScale || avgFps < fpsAtFullScale * 1.25)) {
        renderScale = SCALE_MAX;
        applyRenderScale();
        governorOff = true;
      }
    } else if (avgFps > 58.5 && renderScale < SCALE_MAX) {
      // climb back slowly so we don't oscillate
      floorStrikes = 0;
      renderScale = Math.min(SCALE_MAX, renderScale * 1.05);
      applyRenderScale();
    } else {
      floorStrikes = 0;
    }
  }

  renderer.setPixelRatio(effectiveDPR());
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  // Cheaper path: no MSAA, no auto object sort thrash on static-ish scene graph
  renderer.sortObjects = false;

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

  /* ── CPU value-noise + fbm (used to BAKE static noise fields once at
     startup, so big background layers don't run fbm per-pixel per-frame) ── */
  function makeNoise2D(seed) {
    function h(ix, iy) {
      let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed | 0, 144269504);
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
    }
    return function (x, y) {
      const ix = Math.floor(x), iy = Math.floor(y);
      const fx = x - ix, fy = y - iy;
      const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      return h(ix, iy) * (1 - ux) * (1 - uy) + h(ix + 1, iy) * ux * (1 - uy) +
             h(ix, iy + 1) * (1 - ux) * uy + h(ix + 1, iy + 1) * ux * uy;
    };
  }
  function fbm2(noise, x, y, oct) {
    let v = 0, a = 0.5;
    for (let i = 0; i < oct; i++) {
      v += a * noise(x, y);
      x = x * 2.07 + 11.3; y = y * 2.07 + 7.7;
      a *= 0.5;
    }
    return v;
  }
  // Bakes two independent fbm fields into R/G of a texture.
  function bakeFbmTexture(w, h, sx1, sy1, sx2, sy2, seed) {
    const n1 = makeNoise2D(seed), n2 = makeNoise2D(seed + 71);
    const data = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / w, v = y / h;
        const a = fbm2(n1, u * sx1 + 10, v * sy1 + 10, 4);
        const b = fbm2(n2, u * sx2 + 20 + a, v * sy2 + 20, 4); // warped by first field
        const i = (y * w + x) * 4;
        data[i] = Math.round(a * 255);
        data[i + 1] = Math.round(b * 255);
        data[i + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.wrapS = THREE.MirroredRepeatWrapping;
    tex.wrapT = THREE.MirroredRepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  /* ════════════════ AUDIO TEXTURES ════════════════
     Live time-domain waveform + frequency spectrum, uploaded every frame
     and fed to the aurora shell — light, not geometry. */
  const WAVE_W = 64;
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
  const BAND_R = 1.85;      // title band radius (between outer aurora shell 1.51 and rings 1.98)
  const BAND_H = 0.42;      // title band height
  const planetUniforms = {
    uTime:    { value: 0 },
    uAudio:   { value: 0 },
    uBass:    { value: 0 },
    uColA:    { value: palA },
    uColB:    { value: palB },
    uColC:    { value: palC }
  };

  // Segment counts tuned for shader-driven surfaces (noise hides tessellation).
  const PLANET_SEG_W = MOBILE ? 48 : 64;
  const PLANET_SEG_H = MOBILE ? 32 : 48;
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_R, PLANET_SEG_W, PLANET_SEG_H),
    new THREE.ShaderMaterial({
      uniforms: planetUniforms,
      defines: { FBM_OCT: 2 },
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
    const aSegW = MOBILE ? 36 : 48;
    const aSegH = MOBILE ? 24 : 32;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(PLANET_R * radiusMul, aSegW, aSegH),
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
    makeAuroraShell(1.07, 0.0, 0.72, 1.0, 2),  // dense inner fog (2 octaves — quality preserved via soft additive)
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
  const atmoSeg = MOBILE ? 32 : 40;
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_R * 1.5, atmoSeg, atmoSeg),
    new THREE.ShaderMaterial({
      uniforms: atmoUniforms,
      defines: { FBM_OCT: 2 },
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

  const RING_COUNT = MOBILE ? 260 : 480;
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

  /* ════════════════ ORBIT PLANET POOL (per-song planets) ════════════════
     Each song gets its own planet view (core + aurora + atmosphere + ring).
     The hero view is the original objects wrapped in a group; clones are
     built on demand with STATIC per-song palette uniforms (shaders/geoms shared).
     On swipe commit the current view arcs OUT on a parabola while the next
     view arcs IN — both visible and spinning; the incoming view is promoted. */
  const heroGroup = new THREE.Group();
  scene.add(heroGroup);
  scene.remove(planet); heroGroup.add(planet);
  scene.remove(atmosphere); heroGroup.add(atmosphere);
  scene.remove(ringGroup); heroGroup.add(ringGroup);
  for (const s of auroraShells) { scene.remove(s.mesh); heroGroup.add(s.mesh); }

  const heroTitleBand = makeTitleBand('');
  heroGroup.add(heroTitleBand.wrap);
  const heroView = { group: heroGroup, core: planet, shells: auroraShells, atmo: atmosphere, ringU: ringUniforms, ringP: ringPoints, hero: true, titleBand: heroTitleBand, titleSlug: null };
  let planetViews = [heroView];
  let currentView = heroView;
  let arcAnim = null; // {out, in, t, dur, dir}

  function freshMaterial(srcMat, paletteHex) {
    const cols = paletteHex.map(h => new THREE.Color(h));
    const m = srcMat.clone();
    const u = {};
    for (const k in srcMat.uniforms) {
      const v = srcMat.uniforms[k].value;
      if (k === 'uColA') u[k] = { value: cols[0] };
      else if (k === 'uColB') u[k] = { value: cols[1] };
      else if (k === 'uColC') u[k] = { value: cols[2] };
      else if (v && v.isTexture) u[k] = { value: v }; // share audio textures
      else if (v && typeof v.clone === 'function') u[k] = { value: v.clone() };
      else u[k] = { value: v };
    }
    m.uniforms = u;
    return m;
  }

  function buildPlanetClone(paletteHex, title) {
    const group = new THREE.Group();
    const core = planet.clone();
    core.material = freshMaterial(planet.material, paletteHex);
    group.add(core);
    const shells = auroraShells.map(s => {
      const mesh = s.mesh.clone();
      mesh.material = freshMaterial(s.mesh.material, paletteHex);
      group.add(mesh);
      return { mesh: mesh, u: mesh.material.uniforms };
    });
    const atmo = atmosphere.clone();
    atmo.material = freshMaterial(atmosphere.material, paletteHex);
    group.add(atmo);
    const rg = ringGroup.clone(true);
    let ringP = null, ringU = null;
    rg.traverse(o => {
      if (o.material && o.material.uniforms) {
        o.material = freshMaterial(o.material, paletteHex);
        if (!ringU) { ringU = o.material.uniforms; }
      }
      if (o.isPoints) ringP = o;
    });
    group.add(rg);
    const titleBand = makeTitleBand(title || '');
    group.add(titleBand.wrap);
    group.visible = false;
    scene.add(group);
    return { group: group, core: core, shells: shells, atmo: atmo, ringU: ringU, ringP: ringP, hero: false, titleBand: titleBand, titleSlug: null };
  }

  function disposeView(v) {
    v.group.traverse(o => {
      if (o.material) {
        if (o.material.map) o.material.map.dispose();
        o.material.dispose();
      }
    });
    scene.remove(v.group);
  }

  /* ── per-planet title BAND: text wrapped around the globe like a slider ── */
  function makeTitleBand(title) {
    const wrap = new THREE.Group();
    // Sash tilt: steep enough that the readable front arc crosses the planet
    // and the bottom arc hides behind it (no upside-down letters), gentle
    // enough to read like a band. Text SLIDES via texture offset (marquee).
    wrap.rotation.x = 0.5;
    wrap.rotation.y = 0.0;
    const canvas = document.createElement('canvas');
    canvas.width = 2048; canvas.height = 256;
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; // seamless marquee offset
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.FrontSide });
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(BAND_R, BAND_R, BAND_H, 96, 1, true), mat);
    mesh.renderOrder = 5;
    wrap.add(mesh);
    updateTitleBand(mesh, title);
    return { wrap: wrap, mesh: mesh, tex: tex };
  }

  function updateTitleBand(mesh, title) {
    const tex = mesh.material.map;
    const canvas = tex.image;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const unit = String(title || '').toUpperCase() + '   •   ';
    let size = 150;
    const fontFor = s => '900 ' + s + 'px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    while (size > 40) {
      ctx.font = fontFor(size);
      if (ctx.measureText(unit).width * 3 <= canvas.width) break;
      size -= 4;
    }
    ctx.font = fontFor(size);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(3,2,10,0.95)';
    ctx.shadowBlur = 22;
    ctx.fillStyle = '#f2ece6';
    let x = 0;
    while (x < canvas.width) {
      ctx.fillText(unit, x, canvas.height / 2);
      x += ctx.measureText(unit).width;
    }
    tex.needsUpdate = true;
  }

  function quadBezier(k, p0x, p0y, p1x, p1y, p2x, p2y) {
    const a = 1 - k;
    return {
      x: a * a * p0x + 2 * a * k * p1x + k * k * p2x,
      y: a * a * p0y + 2 * a * k * p1y + k * k * p2y
    };
  }

  // Swap hook: build the incoming song's planet and start the parabola arcs.
  window.__ORBIT_PLANETS_SWAP__ = function (dir, targetIdx) {
    let slug = null, title = null;
    try {
      const t = TRACKS[targetIdx];
      slug = t && t.slug;
      title = t ? t.title : null;
    } catch (e) {}
    const palette = slug ? paletteFor(slug) : PALETTES[0];
    const inView = buildPlanetClone(palette, title);
    inView.titleSlug = slug;
    const outView = currentView;
    arcAnim = { out: outView, in: inView, t: 0, dur: 0.72, dir: dir };
    // Incoming enters from the OPPOSITE side of the swipe, from deep behind.
    inView.group.position.set(dir * 3.4 * PLANET_R, 0.5 * PLANET_R, -1.8);
    inView.group.rotation.z = -dir * 0.8;
    inView.group.scale.setScalar(0.7);
    inView.group.visible = true;
  };


  /* ════════════════ STARFIELD (deep parallax, twinkle) ════════════════ */
  const STAR_COUNT = MOBILE ? 1100 : 2200;
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

  /* ════════════════ GALAXY BAND (far depth layer) ════════════════
     Noise field baked once — per-pixel cost is now a single texture tap. */
  const galaxyTex = bakeFbmTexture(256, 64, 9, 26, 9, 26, 37);
  const galaxyU = {
    uTime: { value: 0 },
    uTex: { value: galaxyTex },
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
        uniform sampler2D uTex;
        uniform vec3 uC1;
        uniform vec3 uC2;
        varying vec2 vUv;
        void main(){
          vec2 q = vUv - 0.5;
          float n = texture2D(uTex, vUv + vec2(uTime * 0.0004, 0.0)).r;
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
  // Each nebula's two fbm fields are baked once; the shader animates by
  // slowly counter-scrolling two taps of the same texture (living clouds,
  // ~16x cheaper per pixel than live fbm).
  const NEB_FRAG = `
    uniform float uTime;
    uniform float uAudio;
    uniform sampler2D uTex;
    uniform vec3 uC1;
    uniform vec3 uC2;
    uniform float uOpacity;
    varying vec2 vUv;
    void main(){
      vec2 q = vUv - 0.5;
      float dist = length(q);
      float t = uTime * 0.0012;
      float n  = texture2D(uTex, vUv + vec2(t, -t * 0.6)).r;
      float n2 = texture2D(uTex, vUv * 0.85 - vec2(t * 1.4, t * 0.5)).g;
      float cloud = smoothstep(0.25, 0.85, n * 0.7 + n2 * 0.5);
      float falloff = smoothstep(0.5, 0.08, dist);
      vec3 col = mix(uC1, uC2, n2);
      float a = cloud * falloff * uOpacity * (1.0 + uAudio * 0.5);
      gl_FragColor = vec4(col, a);
    }
  `;
  const nebulae = [];
  NEB_DEFS.slice(0, MOBILE ? 3 : 4).forEach((d, i) => {
    const u = {
      uTime: { value: 0 },
      uAudio: { value: 0 },
      uTex: { value: bakeFbmTexture(192, 192, 3, 3, 6.5, 6.5, 100 + i * 17) },
      uC1: { value: d.c1.clone() },
      uC2: { value: d.c2.clone() },
      uOpacity: { value: d.o }
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
        fragmentShader: NEB_FRAG
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

    // bright nucleus + softer coma halo
    const head = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xeaf8ff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    head.scale.setScalar(1.1);
    scene.add(head);
    const coma = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0x86c8ef, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    coma.scale.setScalar(2.6);
    scene.add(coma);

    // straight blue ion tail (gas, pushed directly anti-sunward)
    const TAIL_N = 26;
    const tailGeo = new THREE.BufferGeometry();
    tailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TAIL_N * 3), 3));
    const tail = new THREE.Line(tailGeo, new THREE.LineBasicMaterial({
      color: 0x9fd8ff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    scene.add(tail);

    // curved dust tail: shimmering particles strewn behind the nucleus
    const DUST_N = 70;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(DUST_N * 3);
    const dustSz = new Float32Array(DUST_N);
    const dustJit = [];
    for (let i = 0; i < DUST_N; i++) {
      dustSz[i] = 1.0 - (i / DUST_N) * 0.8;
      dustJit.push({
        x: (Math.random() - 0.5) * 0.5 * (1 + i * 0.05),
        y: (Math.random() - 0.5) * 0.5 * (1 + i * 0.05),
        p: Math.random() * Math.PI * 2
      });
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('aSize', new THREE.BufferAttribute(dustSz, 1));
    const dustU = { uOpacity: { value: 0 }, uScale: { value: window.innerHeight * 0.5 } };
    const dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({
      uniforms: dustU,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSize;
        uniform float uScale;
        varying float vA;
        void main(){
          vA = aSize;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 5.5 * (uScale / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying float vA;
        void main(){
          vec2 d = gl_PointCoord - 0.5;
          float a = smoothstep(0.5, 0.0, length(d)) * vA * uOpacity;
          gl_FragColor = vec4(0.85, 0.78, 0.62, a); // warm dust vs cold ion tail
        }
      `
    }));
    scene.add(dust);

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
        coma.position.copy(p);
        const fade = Math.sin(Math.min(1, k) * Math.PI);
        head.material.opacity = fade * 0.95;
        coma.material.opacity = fade * 0.4;
        coma.scale.setScalar(2.6 + Math.sin(t0 * 1.7) * 0.25); // breathing coma

        hist.unshift(p.clone());
        if (hist.length > TAIL_N) hist.pop();
        const back = vel.clone().normalize();
        const a = tailGeo.attributes.position.array;
        for (let i = 0; i < TAIL_N; i++) {
          const hp = hist[Math.min(i, hist.length - 1)] || p;
          a[i * 3] = hp.x - back.x * i * 0.34;
          a[i * 3 + 1] = hp.y - back.y * i * 0.34 + i * 0.05;
          a[i * 3 + 2] = hp.z;
        }
        tailGeo.attributes.position.needsUpdate = true;
        tail.material.opacity = fade * 0.5;

        // dust: trails the nucleus on a wider, lazier curve with twinkle-jitter
        const dp = dustGeo.attributes.position.array;
        for (let i = 0; i < DUST_N; i++) {
          const j = dustJit[i];
          const lag = i * 0.22;
          dp[i * 3] = p.x - back.x * lag + j.x + Math.sin(t0 * 2.0 + j.p) * 0.06;
          dp[i * 3 + 1] = p.y - back.y * lag + j.y + lag * 0.11 + Math.cos(t0 * 1.6 + j.p) * 0.06;
          dp[i * 3 + 2] = p.z + Math.sin(j.p) * 0.4;
        }
        dustGeo.attributes.position.needsUpdate = true;
        dustU.uOpacity.value = fade * 0.55;
        return true;
      },
      dispose() {
        scene.remove(head); scene.remove(coma); scene.remove(tail); scene.remove(dust);
        head.material.dispose(); coma.material.dispose();
        tail.material.dispose(); tailGeo.dispose();
        dust.material.dispose(); dustGeo.dispose();
      }
    };
  }

  /* — Rogue moon: cratered, regolith-textured body drifting behind the planet.
       Small on screen, so per-pixel fbm here is essentially free. — */
  function spawnMoon() {
    const dirLeft = Math.random() < 0.5;
    const r = 0.22 + Math.random() * 0.22;
    const tintH = 0.7 + Math.random() * 0.12;
    const baseCol = new THREE.Color().setHSL(tintH, 0.10, 0.5);
    const moonU = {
      uSeed: { value: Math.random() * 40 },
      uCol: { value: baseCol }
    };
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(r, 24, 16),
      new THREE.ShaderMaterial({
        uniforms: moonU,
        vertexShader: `
          varying vec3 vN;
          varying vec3 vP;
          void main(){
            vN = normalize(normalMatrix * normal);
            vP = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uSeed;
          uniform vec3 uCol;
          varying vec3 vN;
          varying vec3 vP;
          ${NOISE_GLSL}
          void main(){
            vec3 n = normalize(vP);
            // regolith: fine grain + broad albedo patches (maria)
            float grain = fbm(n * 26.0 + uSeed);
            float maria = fbm(n * 2.3 + uSeed * 0.7);
            // craters: thresholded mid-frequency noise -> rims + dark floors
            float c = noise3(n * 9.0 + uSeed);
            float crater = smoothstep(0.68, 0.78, c);
            float rim = smoothstep(0.60, 0.68, c) - crater;
            vec3 col = uCol * (0.62 + grain * 0.5);
            col *= 1.0 - smoothstep(0.45, 0.75, maria) * 0.38;  // dark maria
            col *= 1.0 - crater * 0.45;                          // crater floors
            col += vec3(1.0) * rim * 0.22;                       // bright rims
            // lighting: same key as the planet + soft terminator
            vec3 L = normalize(vec3(-0.55, 0.5, 0.7));
            float diff = clamp(dot(normalize(vN), L), 0.0, 1.0);
            col *= 0.16 + smoothstep(0.0, 0.55, diff) * 1.05;
            // faint cold rim against the void
            float fr = pow(1.0 - clamp(dot(normalize(vN), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 3.0);
            col += vec3(0.45, 0.5, 0.65) * fr * 0.12;
            gl_FragColor = vec4(col, 1.0);
          }
        `
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

  /* — Asteroid: lumpy coherent-noise rock with rocky surface detail
       and faint ore veins glinting in the song's accent color — */
  function spawnAsteroid() {
    const geo = new THREE.IcosahedronGeometry(0.28 + Math.random() * 0.3, 3);
    const pa = geo.attributes.position;
    // coherent displacement (smooth lumps + sharp ridges), not per-vertex jitter
    const nse = makeNoise2D((Math.random() * 1e6) | 0);
    const v = new THREE.Vector3();
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i);
      const d = v.clone().normalize();
      const lump = fbm2(nse, d.x * 1.8 + d.z * 0.7 + 5, d.y * 1.8 - d.z * 0.6 + 5, 4) - 0.5;
      const ridge = Math.abs(fbm2(nse, d.x * 4.5 + 30, d.y * 4.5 + d.z * 2.0 + 30, 3) - 0.5);
      v.multiplyScalar(1.0 + lump * 0.55 - ridge * 0.35);
      pa.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const rockU = {
      uSeed: { value: Math.random() * 40 },
      uVein: { value: palC }
    };
    const rock = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      uniforms: rockU,
      vertexShader: `
        varying vec3 vN;
        varying vec3 vP;
        void main(){
          vN = normalize(normalMatrix * normal);
          vP = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uSeed;
        uniform vec3 uVein;
        varying vec3 vN;
        varying vec3 vP;
        ${NOISE_GLSL}
        void main(){
          vec3 n = normalize(vP);
          // layered rock: base grit + darker fracture bands
          float grit = fbm(vP * 22.0 + uSeed);
          float bands = fbm(vP * 5.0 - uSeed);
          vec3 col = vec3(0.16, 0.13, 0.21) * (0.7 + grit * 0.6);
          col *= 1.0 - smoothstep(0.55, 0.8, bands) * 0.4;
          // thin mineral veins catching the song's accent
          float vein = smoothstep(0.495, 0.5, abs(fract(fbm(vP * 8.0 + uSeed * 2.0) * 3.0) - 0.5));
          col += uVein * vein * 0.30;
          vec3 L = normalize(vec3(-0.55, 0.5, 0.7));
          float diff = clamp(dot(normalize(vN), L), 0.0, 1.0);
          col *= 0.18 + diff * 1.1;
          gl_FragColor = vec4(col, 1.0);
        }
      `
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

  /* — Supernova: white-hot core, colored ejecta halo, and an expanding
       shockwave ring that outruns the light — */
  function spawnSupernova() {
    const pos = new THREE.Vector3((Math.random() - 0.5) * 90, (Math.random() - 0.3) * 50, -(60 + Math.random() * 60));
    const core = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xffffff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    core.position.copy(pos);
    scene.add(core);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: new THREE.Color().copy(palC).lerp(new THREE.Color('#ffffff'), 0.25),
      transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    halo.position.copy(pos);
    scene.add(halo);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.93, 1.0, 64),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().copy(palB).lerp(new THREE.Color('#ffffff'), 0.4),
        transparent: true, opacity: 0, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    ring.position.copy(pos);
    scene.add(ring);
    const dur = 8;
    let t0 = 0;
    return {
      update(dt) {
        t0 += dt;
        if (t0 >= dur) return false;
        const k = t0 / dur;
        // fast violent attack, long elegant decay
        const env = k < 0.07 ? (k / 0.07) : Math.pow(1 - (k - 0.07) / 0.93, 1.8);
        core.material.opacity = env * 0.95;
        core.scale.setScalar(2 + env * 8 + k * 2);
        // halo expands slower and lingers (the ejecta cloud)
        const envH = k < 0.12 ? (k / 0.12) : Math.pow(1 - (k - 0.12) / 0.88, 1.2);
        halo.material.opacity = envH * 0.5;
        halo.scale.setScalar(3 + k * 16);
        // shockwave ring races outward and thins away
        ring.scale.setScalar(0.5 + k * 26);
        ring.material.opacity = Math.max(0, env - k * 0.5) * 0.5;
        ring.lookAt(camera.position);
        return true;
      },
      dispose() {
        scene.remove(core); scene.remove(halo); scene.remove(ring);
        core.material.dispose(); halo.material.dispose();
        ring.material.dispose(); ring.geometry.dispose();
      }
    };
  }

  /* — Satellite: tiny craft (bus + solar wings) catching sun glints,
       with its blinking beacon, gliding across the upper sky — */
  function spawnSatellite() {
    const craft = new THREE.Group();
    const busMat = new THREE.MeshStandardMaterial({
      color: 0x8a8fa8, roughness: 0.35, metalness: 0.9
    });
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x16245e, roughness: 0.25, metalness: 0.7,
      emissive: 0x0a1340, emissiveIntensity: 0.6
    });
    const bus = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.16), busMat);
    craft.add(bus);
    const panelGeo = new THREE.BoxGeometry(0.34, 0.005, 0.12);
    const pL = new THREE.Mesh(panelGeo, panelMat); pL.position.x = -0.24; craft.add(pL);
    const pR = new THREE.Mesh(panelGeo, panelMat); pR.position.x =  0.24; craft.add(pR);
    const dish = new THREE.Mesh(
      new THREE.ConeGeometry(0.045, 0.05, 10, 1, true), busMat
    );
    dish.position.set(0, 0.07, 0); dish.rotation.x = Math.PI;
    craft.add(dish);

    const beacon = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xff5560, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    beacon.scale.setScalar(0.35);
    craft.add(beacon);
    const glint = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xffffff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    glint.scale.setScalar(0.5);
    craft.add(glint);

    const dirLeft = Math.random() < 0.5;
    const y = 6 + Math.random() * 12;
    craft.position.set(dirLeft ? 30 : -30, y, -(20 + Math.random() * 14));
    craft.rotation.z = (Math.random() - 0.5) * 0.5;
    scene.add(craft);
    const speed = (dirLeft ? -1 : 1) * (1.1 + Math.random() * 0.7);
    const tumble = 0.10 + Math.random() * 0.18;
    const dur = 60 / Math.abs(speed) * 0.55;
    let t0 = 0;
    return {
      update(dt, t) {
        t0 += dt;
        if (t0 >= dur) return false;
        craft.position.x += speed * dt;
        craft.position.y += Math.sin(t0 * 0.18) * 0.004;
        craft.rotation.y += tumble * dt;
        craft.rotation.x += tumble * 0.4 * dt;
        const fade = Math.sin(Math.min(1, t0 / dur) * Math.PI);
        // red nav beacon: short sharp blips
        const blink = Math.pow(0.5 + 0.5 * Math.sin(t * 2.4), 8.0);
        beacon.material.opacity = fade * blink * 0.9;
        // solar panel glint: rare bright flash as the panels sweep the key light
        const sweep = Math.sin(craft.rotation.y * 2.0 + 0.7);
        glint.material.opacity = fade * Math.pow(Math.max(0, sweep), 24.0) * 0.95;
        return true;
      },
      dispose() {
        scene.remove(craft);
        bus.geometry.dispose(); panelGeo.dispose(); dish.geometry.dispose();
        busMat.dispose(); panelMat.dispose();
        beacon.material.dispose(); glint.material.dispose();
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
    ring.rotation.x = currentView.ringGroup.rotation.x;
    ring.rotation.y = currentView.ringGroup.rotation.y;
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

  /* ════════════════ PLANET SWIPE DRIVE (touch drag moves the whole planet) ════════════════
     planet-swipe.js drives these hooks: drag = camera pans so the planet + rings +
     atmosphere follow the finger with the title; commit = fly out then spring back
     (easeOutBack) while the new song's palette lerps in + shockwave fires. */
  let swipeOffset = 0;          // current camera x offset (world units)
  let swipeOffsetTarget = 0;    // drag target
  let swipeDragging = false;
  let worldPerPx = 0.009;

  function refreshWorldPerPx() {
    worldPerPx = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * baseZ) / window.innerHeight;
  }

  window.__PLANET_SWIPE_SET__ = function (dxPx) {
    swipeDragging = true;
    // Planet follows the pointer: drag left (dx<0) => camera pans right (offset>0)
    swipeOffsetTarget = -dxPx * worldPerPx * 0.92;
  };

  window.__PLANET_SWIPE_RELEASE__ = function (commit, dir) {
    swipeDragging = false; // commit arcs run via __ORBIT_PLANETS_SWAP__; cancel eases home
  };

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
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        gainNode.connect(analyser); // parallel tap, does not affect output
        freqData = new Uint8Array(analyser.frequencyBinCount);
        timeData = new Uint8Array(analyser.fftSize);
      }
    } catch (e) { /* audio graph not ready yet */ }
  }

  let _audioTexFrame = 0;
  function sampleAudio() {
    if (!analyser) { tryHookAudio(); return; }
    try {
      analyser.getByteFrequencyData(freqData);

      let bass = 0, all = 0;
      const bassBins = Math.min(10, freqData.length);
      for (let i = 1; i < bassBins; i++) bass += freqData[i];
      // Coarse mean: sample every 2nd bin (same visual energy, half the reads)
      for (let i = 0; i < freqData.length; i += 2) all += freqData[i];
      bass = bass / Math.max(1, bassBins - 1) / 255;
      all = all / Math.max(1, (freqData.length / 2)) / 255;
      bassSm += (bass - bassSm) * 0.18;
      levelSm += (all - levelSm) * 0.12;

      // GPU texture uploads at ~30Hz — aurora still reads smooth due to shader lerp
      _audioTexFrame++;
      if ((_audioTexFrame & 1) === 0) return;

      analyser.getByteTimeDomainData(timeData);

      // upload live waveform → aurora phase/shimmer texture
      const step = timeData.length / WAVE_W;
      for (let i = 0; i < WAVE_W; i++) {
        waveArr[i * 4] = timeData[Math.floor(i * step)];
      }
      // feather the seam so the wrap point doesn't crack the shell
      const FE = 6;
      for (let i = 0; i < FE; i++) {
        const k = i / FE;
        const idx = (WAVE_W - FE + i) * 4;
        waveArr[idx] = Math.round(waveArr[idx] * (1 - k) + waveArr[0] * k);
      }
      waveTex.needsUpdate = true;

      // upload spectrum → aurora curtain energy (low bins = most musical info)
      const nFreq = Math.min(FREQ_W, freqData.length);
      for (let i = 0; i < nFreq; i++) {
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
    refreshWorldPerPx();
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
  const htmlEl = document.documentElement;
  const videoWinElCached = document.getElementById('video-win');
  const imageWinElCached = document.getElementById('image-win');
  // Reused temps — avoid Vector3.clone() GC in the hot shooter path
  const _shootHead = new THREE.Vector3();
  const _shootTail = new THREE.Vector3();
  const _projPlanet = new THREE.Vector3();

  function frame() {
    rafId = requestAnimationFrame(frame);
    const rawDt = clock.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;

    governFps(rawDt);
    if (htmlEl.classList.contains('orbit-resizing')) return;
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (videoWinElCached && fsEl === videoWinElCached) return;
    if (imageWinElCached && fsEl === imageWinElCached) return;
    sampleAudio();
    watchTrack(dt);

    // smooth palette flow (planet melts from one song's world to the next)
    palA.lerp(tgtA, 0.022);
    palB.lerp(tgtB, 0.022);
    palC.lerp(tgtC, 0.022);

    // uniforms — every visible planet view (hero + in-flight clones)
    for (let vi = 0; vi < planetViews.length; vi++) {
      const v = planetViews[vi];
      if (v.group && !v.group.visible) continue;
      v.core.material.uniforms.uTime.value = t;
      v.core.material.uniforms.uAudio.value = levelSm;
      v.core.material.uniforms.uBass.value = bassSm;
      for (let ai = 0; ai < v.shells.length; ai++) {
        v.shells[ai].u.uTime.value = t;
        v.shells[ai].u.uAudio.value = levelSm;
        v.shells[ai].u.uBass.value = bassSm;
      }
      v.atmo.material.uniforms.uTime.value = t;
      v.atmo.material.uniforms.uBass.value = bassSm;
      v.atmo.material.uniforms.uAudio.value = levelSm;
      v.ringU.uTime.value = t;
      v.ringU.uAudio.value = levelSm;
    }
    starUniforms.uTime.value = t;
    starUniforms.uAudio.value = levelSm;
    galaxyU.uTime.value = t;
    for (let ni = 0; ni < nebulae.length; ni++) {
      const n = nebulae[ni];
      n.u.uTime.value = t;
      n.u.uAudio.value = levelSm;
      n.mesh.rotation.z += n.rs * dt;
      if (n.tint) {
        // the two nearest nebulae slowly absorb the song's palette
        n.u.uC1.value.lerp(tgtA, 0.004);
        n.u.uC2.value.lerp(tgtB, 0.004);
      }
    }

    // motion — the settled planet only (in-flight views are arc-animated below)
    currentView.core.rotation.y += dt * (0.045 + bassSm * 0.08);
    currentView.core.rotation.x = Math.sin(t * 0.02) * 0.04; // slow axis precession
    // fog layers counter-drift for parallax depth
    currentView.shells[0].mesh.rotation.y -= dt * 0.016;
    currentView.shells[0].mesh.rotation.z = Math.sin(t * 0.013) * 0.06;
    currentView.shells[1].mesh.rotation.y += dt * 0.010;
    currentView.shells[1].mesh.rotation.x = Math.sin(t * 0.009 + 2.0) * 0.05;
    currentView.ringP.rotation.y += dt * (0.05 + levelSm * 0.1);
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

    // ── planet swipe: camera pans so the whole planet follows the finger ──
    if (swipeDragging) {
      swipeOffset = swipeOffsetTarget; // snappy 1:1 during drag
      camera.rotation.z += swipeOffset * 0.045; // subtle tilt with the drag
    } else {
      // idle / release: ease back to center (spring feel)
      swipeOffset += (0 - swipeOffset) * Math.min(1, dt * 5);
      camera.rotation.z += swipeOffset * 0.045;
    }
    camera.position.x += swipeOffset;

    // ── orbit planet swap — parabola arcs, both planets visible + spinning ──
    if (arcAnim) {
      arcAnim.t += dt;
      const k = Math.min(1, arcAnim.t / arcAnim.dur);
      const dir = arcAnim.dir;
      // Outgoing: exits on the SWIPE side (left for next), arcing down and away,
      // drifting slightly TOWARD camera (near side of the orbital exchange).
      const out = quadBezier(k, 0, 0, -dir * 1.7 * PLANET_R, -1.4 * PLANET_R, -dir * 3.4 * PLANET_R, -0.2 * PLANET_R);
      // Incoming: enters from the OPPOSITE side, high and far BEHIND, arcing
      // down into center — depth separation means it never crosses the outgoing.
      const inn = quadBezier(k, dir * 3.4 * PLANET_R, 0.5 * PLANET_R, dir * 1.5 * PLANET_R, 1.6 * PLANET_R, 0, 0);
      if (arcAnim.out.group) {
        arcAnim.out.group.position.set(out.x, out.y, 0.5 * k);
        arcAnim.out.group.rotation.z = -dir * k * 2.2;  // spins out with the swipe
        arcAnim.out.group.scale.setScalar(1 - 0.14 * k);
      }
      if (arcAnim.in.group) {
        arcAnim.in.group.position.set(inn.x, inn.y, -1.8 + 1.8 * k); // from deep behind → center
        arcAnim.in.group.rotation.z = -dir * k * 1.8;  // counter-spins in
        arcAnim.in.group.scale.setScalar(0.7 + 0.3 * k);
      }
      if (k >= 1) {
        const promoted = arcAnim.in;
        disposeView(arcAnim.out);
        currentView = promoted;
        planetViews = [promoted];
        arcAnim = null;
      }
    }

    // ── each planet's title BAND slides around the globe (marquee, letters stay upright) ──
    for (let vi = 0; vi < planetViews.length; vi++) {
      const v = planetViews[vi];
      if (v.group && !v.group.visible) continue;
      // live title sync: tracklist clicks update the current planet's band too
      let curSlug = null;
      try { curSlug = (typeof TRACKS !== 'undefined' && TRACKS[currentIndex]) ? TRACKS[currentIndex].slug : null; } catch (e) {}
      if (curSlug && v.titleSlug !== curSlug) {
        v.titleSlug = curSlug;
        try { updateTitleBand(v.titleBand.mesh, TRACKS[currentIndex].title); } catch (e) {}
      }
      v.titleBand.tex.offset.x += dt * 0.02; // marquee around the planet (texture slides, geometry stays)
    }

    // ── glue the DOM focal title to the planet's projected screen position ──
    // (keeps the text centered ON the planet even while the camera drifts)
    const planetBgEl = document.getElementById('planet-bg');
    if (planetBgEl && planetBgEl.style.display !== 'none') {
      _projPlanet.set(0, 0, 0).project(camera);
      const tx = (_projPlanet.x * 0.5 + 0.5) * window.innerWidth - window.innerWidth / 2;
      const ty = (-_projPlanet.y * 0.5 + 0.5) * window.innerHeight - window.innerHeight / 2;
      planetBgEl.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px)';
    }

    // shooting stars
    nextShoot -= dt;
    if (nextShoot <= 0) {
      const free = shooters.find(s => !s.active);
      if (free) spawnShooter(free);
      nextShoot = 8 + Math.random() * 14;
    }
    for (let si = 0; si < shooters.length; si++) {
      const s = shooters[si];
      if (!s.active) continue;
      s.t += dt;
      const k = s.t / s.dur;
      if (k >= 1) {
        s.active = false;
        s.line.material.opacity = 0;
        continue;
      }
      _shootHead.copy(s.from).addScaledVector(s.dir, k);
      _shootTail.copy(s.from).addScaledVector(s.dir, Math.max(0, k - 0.07));
      const a = s.line.geometry.attributes.position.array;
      a[0] = _shootTail.x; a[1] = _shootTail.y; a[2] = _shootTail.z;
      a[3] = _shootHead.x; a[4] = _shootHead.y; a[5] = _shootHead.z;
      s.line.geometry.attributes.position.needsUpdate = true;
      s.line.material.opacity = Math.sin(k * Math.PI) * 0.85;
    }

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
