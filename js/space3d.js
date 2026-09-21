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
  const HOLO_DPR_CAP = MOBILE ? 1.5 : 2;

  // ── Adaptive resolution governor ──
  // Holds 60fps by trading render resolution (it's mostly fog and glow, so
  // a softer buffer is invisible; dropped frames are not).
  let holoOn = false;
  let renderScale = 1.0;
  const SCALE_MIN = 0.5, SCALE_MAX = 1.0;
  function effectiveDPR() {
    const cap = holoOn ? HOLO_DPR_CAP : DPR_CAP;
    const scale = holoOn ? Math.max(renderScale, 0.88) : renderScale;
    return Math.min(window.devicePixelRatio || 1, cap) * scale;
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
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1200);

  // Soft lighting only for physical props (asteroids / moons)
  const keyLight = new THREE.DirectionalLight(0xd9ccff, 0.95);
  keyLight.position.set(-5, 4, 7);
  scene.add(keyLight);
  const ambientLight = new THREE.AmbientLight(0x241a3a, 1.1);
  scene.add(ambientLight);

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
  const PALETTES_HOLO = [
    ['#050608', '#1A58E8', '#C41422'],
    ['#07080A', '#C41422', '#1A58E8'],
    ['#030407', '#2D6BFF', '#9A1018'],
    ['#0A0C10', '#A01018', '#1A58E8'],
    ['#050608', '#0E3AA8', '#C41422'],
    ['#080406', '#E82830', '#2D6BFF'],
    ['#040508', '#2D6BFF', '#C41422'],
    ['#06070A', '#8A0C14', '#1A4AD0'],
    ['#050608', '#1A58E8', '#D41424'],
    ['#0A0808', '#C41422', '#2450D8'],
    ['#04060A', '#1A58E8', '#B01018'],
    ['#08090C', '#E01828', '#2D6BFF'],
    ['#050608', '#1238A8', '#C41422'],
    ['#07080B', '#9A0C14', '#1A58E8']
  ];
  let lastSlug = null;
  function paletteFor(slug) {
    const set = holoOn ? PALETTES_HOLO : PALETTES;
    if (!slug) return set[0];
    return set[hashStr(slug) % set.length];
  }

  /* Live palette state (lerped smoothly toward targets on track change) */
  const palA = COL_PURPLE.clone(), palB = COL_BLUE.clone(), palC = COL_GREEN.clone();
  const tgtA = palA.clone(), tgtB = palB.clone(), tgtC = palC.clone();

  function applyHoloSeed(seed) {
    const s = seed || 0;
    if (planetUniforms && planetUniforms.uSeed) planetUniforms.uSeed.value = s;
    for (let i = 0; i < planetViews.length; i++) {
      const u = planetViews[i].core && planetViews[i].core.material && planetViews[i].core.material.uniforms;
      if (u && u.uSeed) u.uSeed.value = s;
    }
  }

  function setPaletteTargets(p) {
    tgtA.set(p[0]); tgtB.set(p[1]); tgtC.set(p[2]);
    // Bleed the song color into the UI (focal glow, progress fill)
    try {
      const root = document.documentElement.style;
      if (holoOn) {
        root.setProperty('--track-a', '#0A1020');
        root.setProperty('--track-b', '#1A58E8');
        root.setProperty('--track-c', '#C41422');
        root.setProperty('--jestr-green', '#1A58E8');
        root.setProperty('--jestr-blue', '#1A58E8');
        root.setProperty('--jestr-red', '#C41422');
        applyHoloSeed(lastSlug ? (hashStr(lastSlug) % 997) / 997 : 0.37);
      } else {
        root.setProperty('--track-a', p[0]);
        root.setProperty('--track-b', p[1]);
        root.setProperty('--track-c', p[2]);
      }
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
  const HOLO_PLANET_SCALE = 1.72;
  const planetUniforms = {
    uTime:     { value: 0 },
    uAudio:    { value: 0 },
    uBass:     { value: 0 },
    uColA:     { value: palA },
    uColB:     { value: palB },
    uColC:     { value: palC },
    uFade:     { value: 1 },
    uHolo:     { value: 0 },
    uHoloFlow: { value: 1 },
    uSpin:     { value: 0 },
    uSeed:     { value: 0.37 },
    uPulse:    { value: 0 }
  };

  // Segment counts tuned for shader-driven surfaces (noise hides tessellation).
  const PLANET_SEG_W = MOBILE ? 64 : 96;
  const PLANET_SEG_H = MOBILE ? 48 : 72;
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_R, PLANET_SEG_W, PLANET_SEG_H),
    new THREE.ShaderMaterial({
      uniforms: planetUniforms,
      defines: { FBM_OCT: 4 },
      extensions: { derivatives: true },
      transparent: true, // live fade uses alpha; holo attachWire forces opaque
      depthWrite: true,
      depthTest: true,
      side: THREE.FrontSide,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        varying vec3 vView;
        varying vec3 vWorld;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
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
        uniform float uFade;
        uniform float uHolo;
        uniform float uHoloFlow;
        uniform float uSpin;
        uniform float uSeed;
        uniform float uPulse;
        varying vec3 vNormal;
        varying vec3 vPos;
        varying vec3 vView;
        varying vec3 vWorld;
        ${NOISE_GLSL}
        void main(){
          vec3 n = normalize(vPos);

          if (uHolo > 0.5) {
            /* Opaque off-black body. Red/black fbm mountains. Grid lives on a sibling cage. */
            vec3 body = vec3(0.0196, 0.0235, 0.0314);
            vec3 ink = vec3(0.7686, 0.0784, 0.1333);
            float seed = uSeed;
            float stormS = mix(0.8, 2.2, fract(seed * 5.91));
            float ht = uTime * 0.022 * uHoloFlow;

            float climate = fbm(n * stormS + vec3(seed * 17.0, ht, -seed * 9.0));
            float bands = fbm(n * vec3(1.2, 3.8, 1.2) + vec3(ht * 0.7, seed * 8.0, -ht * 0.4));
            float ridge = 1.0 - abs(fbm(n * mix(2.4, 5.0, fract(seed * 6.1))
                              + vec3(ht * 0.25, seed * 5.0, -ht * 0.15)) * 2.0 - 1.0);
            float height = mix(climate, bands, 0.45);
            height = mix(height, ridge, 0.4);
            height = clamp(height + uBass * 0.10 * smoothstep(0.45, 0.8, height), 0.0, 1.0);

            float basin = 1.0 - smoothstep(0.22, 0.42, height);
            float mountain = smoothstep(0.48, 0.78, height);
            vec3 topo = mix(body, body * 0.22, basin);
            topo = mix(topo, ink * 0.18, smoothstep(0.32, 0.52, height) * (1.0 - mountain));
            topo = mix(topo, ink, mountain * (0.55 + height * 0.45));
            topo = mix(topo, ink * 1.15, ridge * mountain * 0.45);

            /* Idle = full topo. uPulse 0..1 is a slow south→north refresh wave. */
            float lat01 = clamp(n.y * 0.5 + 0.5, 0.0, 1.0);
            float pulseOn = step(0.002, uPulse) * uHoloFlow;
            float dist = abs(lat01 - uPulse);
            float band = (1.0 - smoothstep(0.0, 0.13, dist)) * pulseOn;
            float wake = (1.0 - smoothstep(0.0, 0.40, uPulse - lat01)) * step(lat01, uPulse) * pulseOn;
            vec3 col = mix(topo, mix(topo * 1.35, ink, 0.28), max(band, wake * 0.32));

            gl_FragColor = vec4(col, 1.0);
            return;
          }

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

          gl_FragColor = vec4(col, uFade);
        }
      `
    })
  );
  planet.rotation.z = 0.18;
  scene.add(planet);
  const sphereGeo = planet.geometry;

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
    uniform float uFade;
    uniform float uHolo;
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
      curtain = pow(curtain, 1.55 + 1.2 * (1.0 - fMid));
      float ribbonPhase2 = (lon - warp2 * 0.3) * 11.0 - uTime * 0.32 - wave * 3.0;
      float curtain2 = pow(0.5 + 0.5 * sin(ribbonPhase2), 2.2);

      float belt = exp(-pow((abs(lat) - 0.28) * 1.55, 2.0));
      float polar = smoothstep(0.42, 0.92, abs(lat));

      // ── ethereal mist (cosmic fog, breathes with the music) ──
      float mist = fbm(n * 3.3 + vec3(-t * 1.2, t * 0.9, t * 0.6) + wave * 0.7 + warp * 0.8);
      mist = smoothstep(0.12, 0.92, mist);

      // ── limb weighting: fog hugs the edge of the planet ──
      float ndv = abs(dot(normalize(vNormal), normalize(vView)));
      float fres = pow(1.0 - ndv, 1.7);

      // ── energy mix — ribbons bloom hardest at the limb, like rays of light
      //    standing off the planet's edge ──
      float limbBoost = 0.45 + fres * 1.1;
      float energy =
          curtain  * belt * (0.10 + fLow * 1.15) * limbBoost +
          curtain2 * belt * (0.08 + fMid * 0.85) * limbBoost +
          polar * (0.04 + fHigh * 0.55) * (0.5 + 0.5 * curtain) +
          mist * (0.22 + uAudio * 1.05);

      // analog shimmer — faint scan-flicker riding the high end
      energy *= 0.88 + 0.12 * sin(uTime * 1.7 + lon * 60.0 + wave * 8.0 + warp2 * 4.0);

      // 3D depth: outward-vibrating lumps glow hotter, valleys fall dark
      energy *= 0.55 + smoothstep(-0.06, 0.16, vDisp) * 1.5;

      float a = energy * (0.10 + fres * 0.72) * (0.38 + uAudio * 0.95 + uBass * 0.28) * uGain;
      a *= 0.62;

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

      if (uHolo > 0.01) {
        vec3 holoMix = mix(uColA, uColB, curtain);
        holoMix = mix(holoMix, uColC, curtain2 * 0.35);
        col = mix(col, holoMix, uHolo * 0.42);
      }

      gl_FragColor = vec4(col * 1.12, clamp(a, 0.0, 0.42) * uFade);
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
      disp *= uPuff * 1.35;
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
      uColC:    { value: palC },
      uFade:    { value: 1 },
      uHolo:    { value: 0 }
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
    makeAuroraShell(1.22, 0.0, 1.15, 0.62, 2),
    makeAuroraShell(1.62, 7.3, 2.05, 0.38, 2)
  ];

  /* Outer halo — soft glow with frequency-driven aurora rays bleeding outward */
  const atmoUniforms = {
    uTime: { value: 0 },
    uBass: { value: 0 },
    uAudio: { value: 0 },
    uFreqTex: { value: freqTex },
    uColA: { value: palA },
    uColB: { value: palB },
    uFade: { value: 1 }
  };
  const atmoSeg = MOBILE ? 32 : 40;
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_R * 1.85, atmoSeg, atmoSeg),
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
        uniform float uFade;
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
          gl_FragColor = vec4(col, glow * haze * rays * (0.18 + uBass * 0.3 + uAudio * 0.18) * uFade);
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
    uScale: { value: window.innerHeight * 0.5 },
    uFade:  { value: 1 }
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
    uniform float uFade;
    void main(){
      vec2 d = gl_PointCoord - 0.5;
      float a = smoothstep(0.5, 0.05, length(d));
      gl_FragColor = vec4(vColor * vTw, a * 0.55 * uFade);
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

  const heroView = { group: heroGroup, core: planet, shells: auroraShells, atmo: atmosphere, ringU: ringUniforms, ringP: ringPoints, ringGroup: ringGroup, hero: true };
  let planetViews = [heroView];
  let currentView = heroView;
  let arcAnim = null; // {out, in, t, dur, dir}

  /* Inception bowl: the GROUND they like, curved up toward the camera.
     Plane maps onto a sphere sitting above the floor so xz stays a grid
     and the horizon lifts into a dish — not a cube, not a full sky sphere. */
  const HOLO_FLOOR_Y = -(PLANET_R * HOLO_PLANET_SCALE + 0.38);
  /* Locked Inception bowl: ground folds to a horizon. R~48, ang cap ~1.0
     so the dish never wraps over the camera (that read as "below the room"). */
  const HOLO_BOWL_R = 48;
  const HOLO_CAM_Y = 3.55;
  const HOLO_LOOK_Y = 0.12;
  const HOLO_CAM_Z_MUL = 0.82;
  const HOLO_GRID_VERT = `
    uniform float uTime;
    uniform float uBass;
    uniform vec3 uMouse;
    uniform float uHasMouse;
    uniform float uFloorY;
    uniform float uBowlR;
    uniform float uRipR;
    varying vec3 vWorld;
    varying vec2 vXZ;
    varying float vWave;
    varying float vFall;
    vec3 bowlPos(vec2 xz){
      float dist = length(xz);
      float ang = min(dist / max(0.001, uBowlR), 1.02);
      vec2 dir = dist > 0.0008 ? xz / dist : vec2(0.0, 1.0);
      float rad = uBowlR * sin(ang);
      return vec3(dir.x * rad, uBowlR * (1.0 - cos(ang)), dir.y * rad);
    }
    vec3 bowlN(vec2 xz){
      float dist = length(xz);
      float ang = min(dist / max(0.001, uBowlR), 1.02);
      vec2 dir = dist > 0.0008 ? xz / dist : vec2(0.0, 1.0);
      return normalize(vec3(dir.x * cos(ang), sin(ang), dir.y * cos(ang)));
    }
    void main(){
      vec2 xz = vec2(position.x, position.z);
      vXZ = xz;
      vec3 local = bowlPos(xz);
      vec3 nrm = bowlN(xz);
      float rd = length(xz - uMouse.xz);
      float rr = max(10.0, uRipR);
      float fall = uHasMouse * (1.0 - smoothstep(0.0, rr, rd));
      float k = 6.2832 / max(4.0, rr * 0.55);
      float env = exp(-rd / max(1.0, rr * 0.7));
      float ring = sin(rd * k - uTime * 0.52);
      float ring2 = sin(rd * k * 0.5 - uTime * 0.26);
      float dip = fall * env * (ring * 0.85 + ring2 * 0.32);
      dip -= fall * (1.0 - smoothstep(0.0, rr * 0.3, rd)) * 0.22;
      float weave = sin(xz.x * 0.14 + uTime * 0.22) * sin(xz.y * 0.12 - uTime * 0.18);
      dip += weave * 0.018;
      dip *= (1.0 + uBass * 0.12);
      vWave = ring * fall * env;
      vFall = fall;
      local += nrm * dip;
      vec4 w = modelMatrix * vec4(local, 1.0);
      vWorld = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w;
    }
  `;
  const HOLO_GRID_FRAG = `
    uniform float uTime;
    uniform float uBass;
    uniform vec3 uMouse;
    uniform float uHasMouse;
    uniform float uFloorY;
    uniform float uBowlR;
    uniform float uRipR;
    varying vec3 vWorld;
    varying vec2 vXZ;
    varying float vWave;
    varying float vFall;
    void main(){
      vec2 uv = vXZ;
      vec2 md = uv - uMouse.xz;
      float mdlen = length(md);
      vec2 radial = mdlen > 0.001 ? md / mdlen : vec2(0.0);
      uv += radial * vWave * 0.55;
      float cell = 4.0;
      vec2 gv = uv / cell;
      float fw = max(fwidth(gv.x), fwidth(gv.y));
      vec2 g = abs(fract(gv) - 0.5);
      float line = 1.0 - smoothstep(0.0, max(fw, 0.002) * 1.15, min(g.x, g.y));
      vec2 gvm = uv / (cell * 4.0);
      float fwm = max(fwidth(gvm.x), fwidth(gvm.y));
      vec2 gm = abs(fract(gvm) - 0.5);
      float major = 1.0 - smoothstep(0.0, max(fwm, 0.0015) * 1.05, min(gm.x, gm.y));
      float crest = pow(1.0 - abs(vWave), 3.5) * vFall;
      float L = max(max(line * 0.78, major * 1.0), crest * 0.42);
      vec3 ink = vec3(0.14, 0.42, 0.98);
      vec3 col = ink * (0.22 + L * 1.15);
      col += ink * (crest * 0.18 + vFall * 0.08);
      col *= 1.0 + uBass * 0.14;
      float riseAng = length(vXZ) / max(0.001, uBowlR);
      float fade = 1.0 - smoothstep(0.70, 1.00, riseAng);
      float alpha = (0.05 + L * 0.62 + crest * 0.16) * fade * (0.7 + uBass * 0.16);
      gl_FragColor = vec4(col, alpha);
    }
  `;
  function makeHoloGridMat(uniforms) {
    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      side: THREE.DoubleSide,
      vertexShader: HOLO_GRID_VERT,
      fragmentShader: HOLO_GRID_FRAG
    });
  }
  const holoTimeU = { value: 0 };
  const holoBassU = { value: 0 };
  const holoGridUniforms = {
    uTime: holoTimeU,
    uBass: holoBassU,
    uMouse: { value: new THREE.Vector3(0, HOLO_FLOOR_Y, 0) },
    uHasMouse: { value: 0 },
    uFloorY: { value: HOLO_FLOOR_Y },
    uBowlR: { value: HOLO_BOWL_R },
    uRipR: { value: 8 }
  };
  const holoGridGeo = new THREE.PlaneGeometry(128, 128, 48, 48);
  holoGridGeo.rotateX(-Math.PI / 2);
  const holoGrid = new THREE.Mesh(holoGridGeo, makeHoloGridMat(holoGridUniforms));
  holoGrid.position.set(0, HOLO_FLOOR_Y, 0);
  holoGrid.visible = false;
  holoGrid.renderOrder = 2;
  scene.add(holoGrid);
  const holoRoom = [holoGrid];
  const _holoRay = new THREE.Raycaster();
  const _holoFloor = new THREE.Plane(new THREE.Vector3(0, 1, 0), -HOLO_FLOOR_Y);
  const _holoSphere = new THREE.Sphere(new THREE.Vector3(0, HOLO_FLOOR_Y + HOLO_BOWL_R, 0), HOLO_BOWL_R);
  const _holoNdc = new THREE.Vector2();
  const _holoHit = new THREE.Vector3();
  const _holoMouseSm = new THREE.Vector3(0, HOLO_FLOOR_Y, 0);
  const _holoMouseT = new THREE.Vector3(0, HOLO_FLOOR_Y, 0);
  let holoMouseAmt = 0;
  const HOLO_CLOUD_N = MOBILE ? 1800 : 4200;
  const holoCloudGeo = new THREE.BufferGeometry();
  {
    const pos = new Float32Array(HOLO_CLOUD_N * 3);
    const col = new Float32Array(HOLO_CLOUD_N * 3);
    const sz = new Float32Array(HOLO_CLOUD_N);
    const ph = new Float32Array(HOLO_CLOUD_N);
    const kind = new Float32Array(HOLO_CLOUD_N);
    const pr = PLANET_R * HOLO_PLANET_SCALE;
    const BLUE = [0.10, 0.34, 0.91];
    const RED = [0.77, 0.08, 0.13];
    const BLACK = [0.02, 0.024, 0.03];
    const minR = pr * 2.8;
    for (let i = 0; i < HOLO_CLOUD_N; i++) {
      const roll = Math.random();
      let knd, span, lift;
      if (roll < 0.34) {
        knd = 0;
        span = 14;
        lift = 8;
        sz[i] = 0.7 + Math.random() * 1.1;
      } else if (roll < 0.7) {
        knd = 1;
        span = 26;
        lift = 13;
        sz[i] = 0.5 + Math.random() * 0.85;
      } else {
        knd = 2;
        span = 42;
        lift = 18;
        sz[i] = 0.28 + Math.random() * 0.5;
      }
      let x = (Math.random() * 2 - 1) * span;
      let z = (Math.random() * 2 - 1) * span;
      let y = HOLO_FLOOR_Y + 0.8 + Math.random() * lift;
      let d2 = x * x + y * y + z * z;
      if (d2 < minR * minR) {
        const s = minR / Math.sqrt(Math.max(d2, 1e-5));
        x *= s; y *= s; z *= s;
      }
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      kind[i] = knd;
      const ink = Math.random();
      const c = ink < 0.12 ? RED : ink < 0.55 ? BLUE : BLACK;
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
      ph[i] = Math.random() * Math.PI * 2;
    }
    holoCloudGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    holoCloudGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    holoCloudGeo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    holoCloudGeo.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
    holoCloudGeo.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
  }
  const holoCloudUniforms = {
    uTime: { value: 0 },
    uAudio: { value: 0 },
    uBass: { value: 0 },
    uBeat: { value: 0 },
    uBpm: { value: 108 },
    uBeatPhase: { value: 0 },
    uScale: { value: window.innerHeight * 0.5 }
  };
  const holoCloud = new THREE.Points(holoCloudGeo, new THREE.ShaderMaterial({
    uniforms: holoCloudUniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      attribute float aKind;
      uniform float uTime;
      uniform float uAudio;
      uniform float uBass;
      uniform float uBeat;
      uniform float uBpm;
      uniform float uBeatPhase;
      uniform float uScale;
      varying vec3 vColor;
      varying float vG;
      varying float vHot;
      varying float vBri;
      void main(){
        float inner = 1.0 - step(0.5, aKind);
        float far = step(1.5, aKind);
        vec3 p = position;
        float t = uTime;
        float flow = t * 0.22 + aPhase;
        p.x += sin(flow * 0.71 + p.z * 0.055 + p.y * 0.04) * mix(0.35, 1.85, far);
        p.z += cos(flow * 0.63 + p.x * 0.05 - p.y * 0.03) * mix(0.35, 1.85, far);
        p.y += sin(flow * 0.41 + aPhase * 2.0) * mix(0.22, 1.15, far);
        p.y += uBeatPhase * mix(0.06, 0.55, far) * (0.4 + fract(aPhase));
        p.y += uBass * mix(0.08, 0.45, far);
        float flick = pow(abs(sin(uBeatPhase * 1.4 + aPhase * 6.0)), 5.0);
        vHot = clamp(uBass * 0.35 + uAudio * 0.25 + uBeat * 0.2 + flick * 0.15, 0.0, 1.0);
        vColor = aColor;
        vG = (0.55 + 0.45 * (0.5 + 0.5 * sin(t * 0.7 + aPhase)))
           * mix(1.0, 0.72, far)
           * (0.65 + uAudio * 0.55 + uBass * 0.5);
        float music = clamp(uBass * 0.5 + uAudio * 0.35 + uBeat * 0.25, 0.0, 1.0);
        float wavy = 0.5 + 0.5 * sin(t * 0.9 + aPhase * 2.2 + p.x * 0.12 + p.z * 0.1);
        float rip = 0.5 + 0.5 * sin(length(p.xz) * 0.18 - t * 0.65);
        vBri = 0.5 * music * wavy * rip;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float size = aSize * (2.2 + uBass * 1.1 + uAudio * 0.7) * mix(1.8, 2.6, far);
        gl_PointSize = size * uScale * 0.085 / max(0.12, -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vG;
      varying float vHot;
      varying float vBri;
      void main(){
        vec2 d = gl_PointCoord - 0.5;
        float r = length(d);
        float smoke = smoothstep(0.5, 0.0, r);
        smoke *= smoothstep(0.5, 0.04, r);
        float grain = fract(sin(dot(gl_PointCoord * 23.0, vec2(12.9898, 78.233))) * 43758.5453);
        float a = smoke * (0.34 + grain * 0.2) * vG * (0.2 + vBri * 1.6);
        if (a < 0.012) discard;
        vec3 col = vColor * (0.35 + vBri);
        gl_FragColor = vec4(col, clamp(a, 0.0, 0.7));
      }
    `
  }));
  holoCloud.visible = false;
  holoCloud.renderOrder = 3;
  holoCloud.frustumCulled = false;
  scene.add(holoCloud);

  /* 80s cyberspace layer — Tron floor already exists; this fills the room
     with wire objects, lights, and orbiting junk. Live cosmic stays intact. */
  const HOLO_BLUE = 0x1A58E8;
  const holoSpace = new THREE.Group();
  holoSpace.visible = false;
  scene.add(holoSpace);

  const holoKey = new THREE.PointLight(0x2D6BFF, 0, 48, 2);
  holoKey.position.set(3.6, 5.2, 6.2);
  holoSpace.add(holoKey);
  const holoFill = new THREE.PointLight(0xC81830, 0, 32, 2);
  holoFill.position.set(-6.2, 0.6, 2.4);
  holoSpace.add(holoFill);
  const holoRim = new THREE.DirectionalLight(0x1A58E8, 0);
  holoRim.position.set(1.5, -2.2, -7);
  holoSpace.add(holoRim);

  const holoLine = new THREE.LineBasicMaterial({
    color: HOLO_BLUE, transparent: true, opacity: 0.72, depthWrite: false, depthTest: true
  });
  const holoLineDim = new THREE.LineBasicMaterial({
    color: HOLO_BLUE, transparent: true, opacity: 0.38, depthWrite: false, depthTest: true
  });
  const holoLineRed = new THREE.LineBasicMaterial({
    color: 0xE02040, transparent: true, opacity: 0.55, depthWrite: false, depthTest: true
  });

  function wireMesh(geo, mat) {
    return new THREE.LineSegments(new THREE.WireframeGeometry(geo), mat);
  }

  /* Floor grid is holoGrid. No standing pillars / rectangle beacons. */

  if (window.HoloProps && typeof window.HoloProps.spawn === 'function') {
    window.HoloProps.spawn(THREE, holoSpace, { planetR: PLANET_R * HOLO_PLANET_SCALE });
  }

  function tickHoloSpace(t, dt, bass) {
    if (!holoOn) return;
    const music = reduceMotion.matches ? 0 : bass;
    holoKey.intensity = 1.55 + music * 0.18;
    holoFill.intensity = 0.5 + music * 0.12;
    holoRim.intensity = 0.65 + music * 0.08;
    if (window.HoloProps && typeof window.HoloProps.tick === 'function') {
      window.HoloProps.tick(t, dt, music);
    }
  }

  function forceOpaquePlanet(mat, mesh) {
    if (!mat) return;
    mat.transparent = false;
    mat.opacity = 1;
    mat.alphaTest = 0;
    mat.depthWrite = true;
    mat.depthTest = true;
    mat.blending = THREE.NoBlending;
    mat.side = THREE.FrontSide;
    mat.polygonOffset = false;
    if ('colorWrite' in mat) mat.colorWrite = true;
    mat.needsUpdate = true;
    if (mesh) {
      mesh.renderOrder = 1;
      mesh.frustumCulled = false;
    }
  }

  function ensureOccluder(view) {
    if (!view || !view.core) return;
    const host = view.group || view.core;
    const staleChild = view.core.getObjectByName('holoOccluder');
    if (staleChild && staleChild.parent === view.core) view.core.remove(staleChild);
    let occ = host.getObjectByName && host.getObjectByName('holoOccluder');
    if (holoOn) {
      if (!occ) {
        occ = new THREE.Mesh(
          sphereGeo,
          new THREE.MeshBasicMaterial({
            color: 0x050608,
            transparent: false,
            opacity: 1,
            depthWrite: true,
            depthTest: true,
            blending: THREE.NoBlending,
            side: THREE.FrontSide,
            fog: false
          })
        );
        occ.name = 'holoOccluder';
        occ.renderOrder = 0;
        occ.frustumCulled = false;
        host.add(occ);
      }
      occ.visible = true;
      occ.position.copy(view.core.position);
      occ.scale.copy(view.core.scale);
      occ.scale.multiplyScalar(0.998);
      occ.material.transparent = false;
      occ.material.opacity = 1;
      occ.material.depthWrite = true;
      occ.material.depthTest = true;
      occ.material.blending = THREE.NoBlending;
      occ.material.colorWrite = true;
    } else if (occ) {
      occ.visible = false;
    }
  }

  function makeHoloCage() {
    const r = PLANET_R * 1.018;
    const pos = [];
    const meridians = 24;
    const segs = 112;
    for (let m = 0; m < meridians; m++) {
      const lon = (m / meridians) * Math.PI * 2;
      for (let i = 0; i < segs; i++) {
        const t0 = (i / segs) * Math.PI;
        const t1 = ((i + 1) / segs) * Math.PI;
        pos.push(
          Math.sin(t0) * Math.cos(lon) * r, Math.cos(t0) * r, Math.sin(t0) * Math.sin(lon) * r,
          Math.sin(t1) * Math.cos(lon) * r, Math.cos(t1) * r, Math.sin(t1) * Math.sin(lon) * r
        );
      }
    }
    const parallels = 14;
    for (let p = 0; p < parallels; p++) {
      const lat = -0.88 + (p / (parallels - 1)) * 1.76;
      const y = Math.sin(lat) * r;
      const rr = Math.cos(lat) * r;
      for (let i = 0; i < segs; i++) {
        const a0 = (i / segs) * Math.PI * 2;
        const a1 = ((i + 1) / segs) * Math.PI * 2;
        pos.push(
          Math.cos(a0) * rr, y, Math.sin(a0) * rr,
          Math.cos(a1) * rr, y, Math.sin(a1) * rr
        );
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const cage = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      color: 0x1A58E8,
      transparent: false,
      opacity: 1,
      depthTest: true,
      depthWrite: false
    }));
    cage.name = 'holoCage';
    cage.renderOrder = 2;
    cage.frustumCulled = false;
    window.__HOLO_QA__ = {
      cageColor: '#1A58E8',
      meridians: meridians,
      parallels: parallels,
      segs: segs,
      floorPillars: 0
    };
    return cage;
  }

  function attachWire(view) {
    if (!view || !view.core) return;
    const host = view.group || view.core;
    const stale = (host.getObjectByName && host.getObjectByName('holoWire'))
      || view.core.getObjectByName('holoWire')
      || view.wire;
    if (stale && stale.parent) stale.parent.remove(stale);
    const staleInner = view.core.getObjectByName('holoInner');
    if (staleInner && staleInner.parent) staleInner.parent.remove(staleInner);
    const staleCage = host.getObjectByName && host.getObjectByName('holoCage');
    if (staleCage && staleCage.parent) staleCage.parent.remove(staleCage);
    view.wire = null;
    view.cage = null;
    view.core.geometry = sphereGeo;
    view.core.scale.setScalar(holoOn ? HOLO_PLANET_SCALE : 1);
    if (view.core.material) {
      if (holoOn) {
        forceOpaquePlanet(view.core.material, view.core);
      } else {
        view.core.material.polygonOffset = false;
        view.core.material.depthWrite = true;
        view.core.material.depthTest = true;
        view.core.material.transparent = true;
        view.core.material.blending = THREE.NormalBlending;
        view.core.material.side = THREE.FrontSide;
        view.core.material.needsUpdate = true;
        view.core.renderOrder = 0;
      }
    }
    if (holoOn) {
      view.cage = makeHoloCage();
      view.cage.scale.setScalar(HOLO_PLANET_SCALE);
      host.add(view.cage);
    }
    ensureOccluder(view);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let holoPulseWait = 20 + Math.random() * 10;
  let holoPulseAge = -1;
  const HOLO_PULSE_DUR = 6.2;

  function applyHoloPulse(k) {
    if (planetUniforms.uPulse) planetUniforms.uPulse.value = k;
    for (let i = 0; i < planetViews.length; i++) {
      const u = planetViews[i].core && planetViews[i].core.material && planetViews[i].core.material.uniforms;
      if (u && u.uPulse) u.uPulse.value = k;
    }
  }

  function tickHoloPulse(dt) {
    if (!holoOn || reduceMotion.matches) {
      applyHoloPulse(0);
      return;
    }
    if (holoPulseAge < 0) {
      holoPulseWait -= dt;
      if (holoPulseWait <= 0) holoPulseAge = 0;
    } else {
      holoPulseAge += dt;
      applyHoloPulse(Math.min(1, holoPulseAge / HOLO_PULSE_DUR));
      if (holoPulseAge >= HOLO_PULSE_DUR) {
        holoPulseAge = -1;
        holoPulseWait = 20 + Math.random() * 10;
        applyHoloPulse(0);
      }
    }
  }

  function setHoloFlag(on) {
    const v = on ? 1 : 0;
    if (planetUniforms.uHolo) planetUniforms.uHolo.value = v;
    for (let i = 0; i < auroraShells.length; i++) {
      if (auroraShells[i].u.uHolo) auroraShells[i].u.uHolo.value = v;
    }
    for (let i = 0; i < planetViews.length; i++) {
      const view = planetViews[i];
      if (view.core.material.uniforms.uHolo) view.core.material.uniforms.uHolo.value = v;
      for (let s = 0; s < view.shells.length; s++) {
        if (view.shells[s].u.uHolo) view.shells[s].u.uHolo.value = v;
      }
    }
  }

  function applyHoloSkin(on) {
    holoOn = !!on;
    holoRoom.forEach(function (m) { m.visible = holoOn; });
    holoCloud.visible = holoOn;
    setHoloFlag(holoOn);
    for (let i = 0; i < planetViews.length; i++) {
      const view = planetViews[i];
      attachWire(view);
      if (view.shells) {
        for (let s = 0; s < view.shells.length; s++) {
          if (view.shells[s].mesh) view.shells[s].mesh.visible = !holoOn;
        }
      }
      if (view.atmo) view.atmo.visible = !holoOn;
      if (view.ringGroup) view.ringGroup.visible = !holoOn;
    }
    applyRenderScale();
    holoSpace.visible = holoOn;
    if (starUniforms.uHolo) starUniforms.uHolo.value = holoOn ? 1 : 0;
    for (let i = 0; i < nebulae.length; i++) {
      const n = nebulae[i];
      if (holoOn) {
        n.u.uC1.value.set('#1A58E8');
        n.u.uC2.value.set('#C41422');
        n.u.uOpacity.value = n.baseO * 0.35;
      } else {
        n.u.uC1.value.copy(n.origC1);
        n.u.uC2.value.copy(n.origC2);
        n.u.uOpacity.value = n.baseO;
      }
    }
    if (holoOn) {
      keyLight.color.set('#1A58E8');
      keyLight.intensity = 1.45;
      ambientLight.color.set('#081018');
      ambientLight.intensity = 0.55;
      holoKey.intensity = 1.55;
      holoFill.intensity = 0.5;
      holoRim.intensity = 0.7;
      renderer.setClearColor(0x07090E, 1);
      renderer.sortObjects = true;
      holoGrid.position.set(0, HOLO_FLOOR_Y, 0);
      galaxyU.uC1.value.set('#1A4A88');
      galaxyU.uC2.value.set('#7A1020');
      holoRoom.forEach(function (m) {
        m.material.depthTest = true;
        m.material.depthWrite = false;
        m.material.transparent = true;
        m.renderOrder = 2;
      });
      [holoLine, holoLineDim, holoLineRed].forEach(function (m) {
        m.depthTest = true;
        m.depthWrite = false;
        m.transparent = true;
      });
      stars.material.depthTest = true;
      galaxy.material.depthTest = true;
      for (let i = 0; i < planetViews.length; i++) {
        const v = planetViews[i];
        const auraS0 = HOLO_PLANET_SCALE;
        if (v.shells) {
          for (let s = 0; s < v.shells.length; s++) {
            const m = v.shells[s].mesh;
            if (!m) continue;
            m.scale.setScalar(auraS0);
            if (m.material) { m.material.depthTest = true; m.material.depthWrite = false; }
          }
        }
        if (v.atmo) {
          v.atmo.scale.setScalar(auraS0);
          if (v.atmo.material) { v.atmo.material.depthTest = true; v.atmo.material.depthWrite = false; }
        }
        if (v.ringGroup) {
          v.ringGroup.scale.setScalar(auraS0);
          v.ringGroup.traverse(function (o) {
            if (!o.material) return;
            o.material.depthTest = true;
            o.material.depthWrite = false;
          });
        }
      }
      for (let ni = 0; ni < nebulae.length; ni++) nebulae[ni].mesh.material.depthTest = true;
      holoSpace.traverse(function (o) {
        if (!o.material) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (let mi = 0; mi < mats.length; mi++) {
          mats[mi].depthTest = true;
          if (o.isLine || o.isLineSegments || o.isPoints) mats[mi].depthWrite = false;
        }
      });
    } else {
      holoPulseAge = -1;
      holoPulseWait = 20 + Math.random() * 10;
      applyHoloPulse(0);
      keyLight.color.set('#d9ccff');
      keyLight.intensity = 0.95;
      ambientLight.color.set('#241a3a');
      ambientLight.intensity = 1.1;
      holoKey.intensity = 0;
      holoFill.intensity = 0;
      holoRim.intensity = 0;
      renderer.setClearColor(0x000000, 0);
      renderer.sortObjects = false;
      galaxyU.uC1.value.copy(COL_PURPLE).multiplyScalar(0.8);
      galaxyU.uC2.value.copy(COL_BABY).multiplyScalar(0.7);
      for (let i = 0; i < planetViews.length; i++) {
        const v = planetViews[i];
        if (v.shells) {
          for (let s = 0; s < v.shells.length; s++) {
            if (v.shells[s].mesh) v.shells[s].mesh.scale.setScalar(1);
          }
        }
        if (v.atmo) v.atmo.scale.setScalar(1);
        if (v.ringGroup) v.ringGroup.scale.setScalar(1);
      }
    }
    fitCamera();
    setPaletteTargets(paletteFor(lastSlug));
    window.__HOLO_ON__ = holoOn;
    window.__HOLO_DBG__ = function () {
      const occ = (heroGroup.getObjectByName && heroGroup.getObjectByName('holoOccluder'))
        || planet.getObjectByName('holoOccluder');
      return {
        transparent: planet.material.transparent,
        depthWrite: planet.material.depthWrite,
        blending: planet.material.blending,
        opacity: planet.material.opacity,
        renderOrder: planet.renderOrder,
        occ: !!(occ && occ.visible),
        occParent: occ && occ.parent && occ.parent.type,
        occTW: occ && occ.material.transparent,
        occDW: occ && occ.material.depthWrite,
        sortObjects: renderer.sortObjects,
        gridDT: holoGrid.material.depthTest,
        starDT: stars.material.depthTest
      };
    };
  }
  window.__ORBIT_SKIN_APPLY__ = applyHoloSkin;

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

  function buildPlanetClone(paletteHex, slug) {
    const group = new THREE.Group();
    const core = planet.clone();
    core.material = freshMaterial(planet.material, paletteHex);
    if (core.material.uniforms.uSeed) {
      core.material.uniforms.uSeed.value = slug ? (hashStr(slug) % 997) / 997 : 0.37;
    }
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
    group.visible = false;
    scene.add(group);
    const view = { group: group, core: core, shells: shells, atmo: atmo, ringU: ringU, ringP: ringP, ringGroup: rg, hero: false };
    if (holoOn) attachWire(view);
    return view;
  }

  function disposeClone(v) {
    if (!v || v.hero) return;
    v.group.traverse(o => {
      if (o.material && o.material.isMaterial) {
        // Shared audio/wave textures stay alive on the hero.
        o.material.dispose();
      }
    });
    scene.remove(v.group);
  }

  let swipePreviewK = 0;
  let swipePreviewDir = 1;
  let swipeOrbitHome = false;
  let swipeDragging = false;
  let swipeNudgeX = 0;
  let swipeNudgeY = 0;

  function easeInOutCubic(k) {
    return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  }

  // Cake-stand turntable: planets sit upright on an invisible plate.
  // The plate rotates in 3D (lazy Susan) — no flying paths, no mechanisms.
  const PLATE_R = PLANET_R * 5.35;
  const PLATE_ELEV = 0.48;
  const PLATE_SLOT = 1.22;
  const PLATE_FADE_IN = PLATE_SLOT * 0.52;

  function plateFade(angle) {
    const a = Math.abs(angle);
    if (a <= PLATE_FADE_IN) return 1;
    return THREE.MathUtils.clamp(1 - (a - PLATE_FADE_IN) / Math.max(0.001, PLATE_SLOT - PLATE_FADE_IN), 0, 1);
  }

  function platePose(angle) {
    const x = PLATE_R * Math.sin(angle);
    const zFlat = PLATE_R * (Math.cos(angle) - 1);
    const sE = Math.sin(PLATE_ELEV), cE = Math.cos(PLATE_ELEV);
    const y = -zFlat * sE;
    const z = zFlat * cE;
    const recede = 1 - Math.cos(angle);
    const s = Math.max(0.42, 1 - 0.28 * recede);
    return { x, y, z, s, fade: plateFade(angle) };
  }

  function setViewFade(view, fade) {
    const apply = (mat) => {
      if (mat && mat.uniforms && mat.uniforms.uFade) mat.uniforms.uFade.value = fade;
    };
    if (view.core) {
      apply(view.core.material);
      if (view.core.material) {
        if (holoOn) {
          forceOpaquePlanet(view.core.material, view.core);
        } else {
          view.core.material.depthWrite = fade > 0.85;
        }
      }
    }
    if (view.atmo) apply(view.atmo.material);
    if (view.shells) {
      for (let i = 0; i < view.shells.length; i++) apply(view.shells[i].mesh.material);
    }
    if (view.ringP) apply(view.ringP.material);
    if (view.group) view.group.visible = fade > 0.025;
  }

  function applyPose(view, pose) {
    if (!view || !view.group || !pose) return;
    view.group.position.set(pose.x, pose.y, pose.z);
    view.group.scale.setScalar(pose.s);
    view.group.rotation.set(0, 0, 0);
    setViewFade(view, pose.fade == null ? 1 : pose.fade);
  }

  window.__ORBIT_PLANETS_SWAP__ = function (dir, targetIdx, onDone) {
    swipeOrbitHome = false;
    let slug = null;
    try {
      const t = TRACKS[targetIdx];
      slug = t && t.slug;
    } catch (e) {}
    const palette = slug ? paletteFor(slug) : PALETTES[0];
    const inView = buildPlanetClone(palette, slug);
    const outView = currentView;
    const outFrom = THREE.MathUtils.clamp(swipePreviewK, 0, 0.4) * -dir * PLATE_SLOT;
    const outTo = -dir * PLATE_SLOT;
    const inFrom = dir * PLATE_SLOT;
    applyPose(inView, platePose(inFrom));
    inView.group.visible = true;
    planetViews = [outView, inView];
    arcAnim = {
      out: outView,
      in: inView,
      t: 0,
      dur: 1.05,
      dir: dir,
      outFrom: outFrom,
      outTo: outTo,
      inFrom: inFrom,
      inTo: 0,
      palette: palette,
      onDone: onDone
    };
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
    uScale: { value: window.innerHeight * 0.5 },
    uHolo:  { value: 0 }
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
      uniform float uHolo;
      varying vec3 vColor;
      varying float vTw;
      void main(){
        vColor = mix(aColor, vec3(0.10, 0.34, 0.91), uHolo);
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
    nebulae.push({
      mesh: m, u, rs: (Math.random() - 0.5) * 0.0035, tint: i < 2,
      origC1: d.c1.clone(), origC2: d.c2.clone(), baseO: d.o
    });
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
    ring.rotation.copy((currentView.ringGroup || ringGroup).rotation);
    ring.scale.setScalar(PLANET_R * 1.15);
    (currentView.group || scene).add(ring);
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
        if (ring.parent) ring.parent.remove(ring);
        ring.geometry.dispose(); ring.material.dispose();
      }
    };
  }

  /* ════════════════ PLANET SWIPE DRIVE ════════════════
     Drag turns the cake-stand plate. Commit finishes the slot rotation. */
  window.__PLANET_SWIPE_SET__ = function (dxPx, dyPx, dxRaw) {
    swipeDragging = true;
    swipeOrbitHome = false;
    const hx = (dxRaw != null ? dxRaw : dxPx) || 0;
    const hy = dyPx || 0;
    swipePreviewDir = hx < 0 ? 1 : -1;
    swipePreviewK = THREE.MathUtils.clamp(Math.abs(dxPx) / 240, 0, 0.4);
    const span = Math.min(window.innerWidth, window.innerHeight);
    const pull = Math.min(1, Math.hypot(hx, hy) / Math.max(1, span * 0.35));
    const ang = Math.atan2(-hy, hx === 0 ? 0.0001 : hx);
    const planetPx = Math.min(360, window.innerHeight * 0.46);
    const wpp = (PLANET_R * 2) / Math.max(1, planetPx);
    const maxN = span * 0.018 * wpp;
    swipeNudgeX = Math.cos(ang) * pull * maxN;
    swipeNudgeY = Math.sin(ang) * pull * maxN;
  };

  window.__PLANET_SWIPE_RELEASE__ = function (commit) {
    swipeDragging = false;
    if (!commit) swipeOrbitHome = true;
  };

  let holdRumble = 0;
  let holdCharging = false;
  window.__PLANET_HOLD_TICK__ = function (p) {
    holdCharging = true;
    holdRumble = 0.2 + 0.55 * p;
  };
  window.__PLANET_HOLD_FIRE__ = function () {
    holdCharging = false;
    holdRumble = 1;
  };
  window.__PLANET_HOLD_CANCEL__ = function () {
    holdCharging = false;
    if (holdRumble > 0.2) holdRumble = 0.12;
  };

  /* ════════════════ AUDIO REACTIVITY ════════════════
     Taps the player's existing Web Audio graph (gainNode) with an analyser.
     player.js loads after this file; bindings exist by the time the loop runs. */
  let analyser = null, freqData = null, timeData = null;
  let levelSm = 0, bassSm = 0, midSm = 0, highSm = 0;
  let kickPrev = 0, snarePrev = 0, hatPrev = 0;
  let kickEnv = 0, snareEnv = 0, hatEnv = 0;
  let bpmSm = 108, lastOnset = 0, beatPhase = 0, beatPulse = 0;
  const onsetIoi = [];

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

      let bass = 0, mid = 0, high = 0, all = 0;
      const n = freqData.length;
      const bassBins = Math.min(10, n);
      const midEnd = Math.min(40, n);
      for (let i = 1; i < bassBins; i++) bass += freqData[i];
      for (let i = bassBins; i < midEnd; i++) mid += freqData[i];
      for (let i = midEnd; i < n; i += 2) high += freqData[i];
      for (let i = 0; i < n; i += 2) all += freqData[i];
      bass = bass / Math.max(1, bassBins - 1) / 255;
      mid = mid / Math.max(1, midEnd - bassBins) / 255;
      high = high / Math.max(1, Math.ceil((n - midEnd) / 2)) / 255;
      all = all / Math.max(1, (n / 2)) / 255;
      bassSm += (bass - bassSm) * 0.18;
      midSm += (mid - midSm) * 0.16;
      highSm += (high - highSm) * 0.14;
      levelSm += (all - levelSm) * 0.12;
      let kick = 0, snare = 0, hat = 0;
      const kEnd = Math.min(6, n);
      const s0 = Math.min(8, n), s1 = Math.min(28, n);
      for (let i = 1; i < kEnd; i++) kick += freqData[i];
      for (let i = s0; i < s1; i++) snare += freqData[i];
      for (let i = Math.min(48, n); i < n; i += 2) hat += freqData[i];
      kick = kick / Math.max(1, kEnd - 1) / 255;
      snare = snare / Math.max(1, s1 - s0) / 255;
      hat = hat / Math.max(1, Math.ceil((n - Math.min(48, n)) / 2)) / 255;
      const kickFlux = Math.max(0, kick - kickPrev);
      const snareFlux = Math.max(0, snare - snarePrev);
      const hatFlux = Math.max(0, hat - hatPrev);
      kickPrev = kick; snarePrev = snare; hatPrev = hat;
      kickEnv = Math.max(kick * 0.28 + kickFlux * 3.4, kickEnv * 0.78);
      snareEnv = Math.max(snare * 0.22 + snareFlux * 2.8, snareEnv * 0.70);
      hatEnv = Math.max(hat * 0.18 + hatFlux * 2.2, hatEnv * 0.62);
      if (kickEnv > 1) kickEnv = 1;
      if (snareEnv > 1) snareEnv = 1;
      if (hatEnv > 1) hatEnv = 1;
      const nowA = performance.now() * 0.001;
      if (kickFlux > 0.07 && kick > 0.11 && (nowA - lastOnset) > 0.23) {
        if (lastOnset > 0.1) {
          const ioi = nowA - lastOnset;
          if (ioi > 0.25 && ioi < 1.2) {
            onsetIoi.push(ioi);
            if (onsetIoi.length > 8) onsetIoi.shift();
            const sorted = onsetIoi.slice().sort(function (a, b) { return a - b; });
            const med = sorted[(sorted.length / 2) | 0];
            bpmSm += ((60 / med) - bpmSm) * 0.2;
            if (bpmSm < 62) bpmSm = 62;
            if (bpmSm > 188) bpmSm = 188;
          }
        }
        lastOnset = nowA;
        beatPulse = 1;
      }
      const stim = bassSm * 0.5 + midSm * 0.28 + levelSm * 0.22;
      window.__ORBIT_AUDIO__ = {
        bass: bassSm, mid: midSm, high: highSm, level: levelSm, stim: stim,
        kick: kickEnv, snare: snareEnv, hat: hatEnv,
        bpm: bpmSm, beat: beatPulse, beatPhase: beatPhase
      };

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
          onsetIoi.length = 0;
          lastOnset = 0;
          bpmSm = 108;
          if (!first) spawnShockwave(); // tactile pulse when the song changes
        }
      }
    } catch (e) {}
  }

  /* ════════════════ CAMERA + DRIFT ════════════════ */
  const mouse = { x: 0, y: 0, has: false, cx: 0, cy: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.cx = e.clientX;
    mouse.cy = e.clientY;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    mouse.has = true;
  }, { passive: true, capture: true });

  function syncHoloRoomMouse(dt) {
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(1, rect.width);
    const cssH = Math.max(1, rect.height);
    const nx = ((mouse.cx - rect.left) / cssW) * 2 - 1;
    const ny = -((mouse.cy - rect.top) / cssH) * 2 + 1;
    mouse.x = nx;
    mouse.y = -ny;
    _holoNdc.set(nx, ny);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    _holoRay.setFromCamera(_holoNdc, camera);
    let want = 0;
    if (mouse.has) {
      const sph = _holoRay.ray.intersectSphere(_holoSphere, _holoHit);
      if (sph && sph.y < HOLO_CAM_Y + 1.5) {
        const lx = sph.x;
        const lz = sph.z;
        const ly = sph.y - HOLO_FLOOR_Y;
        const ang = Math.acos(THREE.MathUtils.clamp(1 - ly / Math.max(0.001, HOLO_BOWL_R), -1, 1));
        const rad = Math.hypot(lx, lz);
        const dist = HOLO_BOWL_R * ang;
        const inv = rad > 1e-5 ? dist / rad : 0;
        _holoMouseT.set(lx * inv, HOLO_FLOOR_Y, lz * inv);
        want = 1;
      } else {
        const hit = _holoRay.ray.intersectPlane(_holoFloor, _holoHit);
        if (hit) {
          _holoMouseT.copy(hit);
          want = 1;
        } else {
          const o = _holoRay.ray.origin;
          const d = _holoRay.ray.direction;
          if (Math.abs(d.y) > 1e-4) {
            const tt = (HOLO_FLOOR_Y - o.y) / d.y;
            if (tt > 0) {
              _holoMouseT.set(o.x + d.x * tt, HOLO_FLOOR_Y, o.z + d.z * tt);
              want = 1;
            }
          }
        }
      }
    }
    holoMouseAmt += (want - holoMouseAmt) * (1 - Math.exp(-dt * 14));
    const dist = _holoMouseSm.distanceTo(_holoMouseT);
    const rate = 12 + Math.min(8, dist * 0.12);
    _holoMouseSm.lerp(_holoMouseT, 1 - Math.exp(-dt * rate));
    holoGridUniforms.uMouse.value.set(_holoMouseSm.x, HOLO_FLOOR_Y, _holoMouseSm.z);
    holoGridUniforms.uHasMouse.value = mouse.has ? Math.max(holoMouseAmt, 0.85) : holoMouseAmt;
    const dCam = Math.max(0.6, camera.position.distanceTo(_holoMouseSm));
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * dCam;
    holoGridUniforms.uRipR.value = Math.max(12, visH * 0.2);
  }

  let baseZ = 8;
  function fitCamera() {
    const h = window.innerHeight;
    const pr = holoOn ? PLANET_R * HOLO_PLANET_SCALE : PLANET_R;
    const targetPx = holoOn ? Math.min(300, h * 0.38) : Math.min(360, h * 0.46);
    const z = (pr * h) / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * targetPx);
    baseZ = holoOn ? Math.max(9.2, Math.min(18, z)) : Math.max(6.2, Math.min(13, z));
    if (holoOn) camera.position.set(0, HOLO_CAM_Y, baseZ * HOLO_CAM_Z_MUL);
    else camera.position.z = baseZ;
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
    holoCloudUniforms.uScale.value = h * 0.5;
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
    beatPulse *= Math.exp(-dt * 8.5);
    beatPhase += dt * (bpmSm / 60) * Math.PI * 2;

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
      if (v.core.material.uniforms.uHoloFlow) {
        v.core.material.uniforms.uHoloFlow.value = (holoOn && !reduceMotion.matches) ? 1 : 0;
      }
      if (v.core.material.uniforms.uSpin) {
        v.core.material.uniforms.uSpin.value = v.core.rotation.y;
      }
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
      if (n.tint && !holoOn) {
        // the two nearest nebulae slowly absorb the song's palette
        n.u.uC1.value.lerp(tgtA, 0.004);
        n.u.uC2.value.lerp(tgtB, 0.004);
      }
    }

    // motion — the settled planet only (in-flight views are arc-animated below)
    /* Holo fill spins slowly; blue meridian cage is a sibling and turns slower. */
    currentView.core.rotation.y += dt * (holoOn ? (0.09 + bassSm * 0.11) : (0.045 + bassSm * 0.08));
    currentView.core.rotation.x = Math.sin(t * 0.02) * (holoOn ? 0.012 : 0.04);
    if (holoOn) {
      tickHoloPulse(dt);
      if (currentView.cage && !reduceMotion.matches) {
        currentView.cage.rotation.y += dt * (0.032 + bassSm * 0.045);
        currentView.cage.scale.setScalar(HOLO_PLANET_SCALE);
      }
      currentView.core.scale.setScalar(HOLO_PLANET_SCALE);
      const auraS = HOLO_PLANET_SCALE * (1 + (reduceMotion.matches ? 0 : bassSm) * 0.08 + levelSm * 0.04);
      if (currentView.shells) {
        for (let s = 0; s < currentView.shells.length; s++) {
          if (currentView.shells[s].mesh) currentView.shells[s].mesh.scale.setScalar(auraS);
        }
      }
      if (currentView.atmo) currentView.atmo.scale.setScalar(auraS * 1.02);
      if (currentView.ringGroup) currentView.ringGroup.scale.setScalar(auraS);
      holoTimeU.value = t;
      holoBassU.value = reduceMotion.matches ? 0 : bassSm;
      if (currentView.core.material.uniforms.uSpin) {
        currentView.core.material.uniforms.uSpin.value = currentView.core.rotation.y;
      }
      document.documentElement.style.setProperty('--holo-spin', currentView.core.rotation.y.toFixed(4));
      holoCloudUniforms.uTime.value = t;
      holoCloudUniforms.uAudio.value = reduceMotion.matches ? 0 : levelSm;
      holoCloudUniforms.uBass.value = reduceMotion.matches ? 0 : bassSm;
      holoCloudUniforms.uBeat.value = reduceMotion.matches ? 0 : beatPulse;
      holoCloudUniforms.uBpm.value = bpmSm;
      holoCloudUniforms.uBeatPhase.value = beatPhase;
      if (currentView.group) holoCloud.position.copy(currentView.group.position);
      holoCloud.rotation.y += dt * 0.09;
      tickHoloSpace(t, dt, bassSm);
    }
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
    const mx = mouse.has ? mouse.x * (holoOn ? 0.12 : 0.5) : 0;
    const my = mouse.has ? -mouse.y * (holoOn ? 0.08 : 0.3) : 0;
    const isoX = 0;
    const isoY = holoOn ? HOLO_CAM_Y : 0;
    const isoZ = holoOn ? baseZ * HOLO_CAM_Z_MUL : baseZ;
    const dX = holoOn ? driftX * 0.12 : driftX;
    const dY = holoOn ? driftY * 0.12 : driftY;
    const camK = holoOn ? 0.06 : 0.012;
    camera.position.x += ((isoX + dX + mx) - camera.position.x) * camK;
    camera.position.y += ((isoY + dY + my) - camera.position.y) * camK;
    camera.position.z += ((isoZ + Math.sin(t * 0.013) * 0.45) - camera.position.z) * (holoOn ? 0.05 : 0.008);
    camera.lookAt(
      0,
      holoOn ? HOLO_LOOK_Y : 0,
      0
    );
    if (holoOn) syncHoloRoomMouse(dt);

    // ── drag / cancel: preview the recede-arc ──
    if (!arcAnim && (swipeDragging || swipeOrbitHome)) {
      if (!swipeDragging) {
        swipePreviewK += (0 - swipePreviewK) * Math.min(1, dt * 7);
        if (swipePreviewK < 0.004) {
          swipePreviewK = 0;
          swipeOrbitHome = false;
        }
      }
      applyPose(currentView, platePose(-swipePreviewDir * swipePreviewK * PLATE_SLOT));
      if (!swipeDragging) {
        swipeNudgeX += (0 - swipeNudgeX) * Math.min(1, dt * 7);
        swipeNudgeY += (0 - swipeNudgeY) * Math.min(1, dt * 7);
      }
      currentView.group.position.x += swipeNudgeX;
      currentView.group.position.y += swipeNudgeY;
    }

    // ── commit: plate rotates one slot; cakes stay upright ──
    if (arcAnim) {
      arcAnim.t += dt;
      const u = Math.min(1, arcAnim.t / arcAnim.dur);
      const k = easeInOutCubic(u);
      const ot = arcAnim.outFrom + (arcAnim.outTo - arcAnim.outFrom) * k;
      const it = arcAnim.inFrom + (arcAnim.inTo - arcAnim.inFrom) * k;
      applyPose(arcAnim.out, platePose(ot));
      applyPose(arcAnim.in, platePose(it));
      if (u >= 1) {
        const done = arcAnim.onDone;
        if (arcAnim.palette) {
          setPaletteTargets(arcAnim.palette);
          palA.copy(tgtA); palB.copy(tgtB); palC.copy(tgtC);
        }
        heroView.group.position.set(0, 0, 0);
        heroView.group.rotation.set(0, 0, 0);
        heroView.group.scale.setScalar(1);
        setViewFade(heroView, 1);
        heroView.group.visible = true;
        disposeClone(arcAnim.in);
        if (arcAnim.out && arcAnim.out !== heroView) disposeClone(arcAnim.out);
        currentView = heroView;
        planetViews = [heroView];
        swipePreviewK = 0;
        swipeNudgeX = 0;
        swipeNudgeY = 0;
        swipeOrbitHome = false;
        arcAnim = null;
        if (typeof done === 'function') done();
      }
    }

    if (holdRumble > 0.002 && currentView && currentView.group && !arcAnim) {
      if (!holdCharging) holdRumble *= Math.exp(-dt * 6.5);
      const amp = 0.015 * holdRumble;
      currentView.group.position.x += Math.sin(t * 50) * amp;
      currentView.group.position.y += Math.cos(t * 61) * amp * 0.62;
      currentView.group.scale.multiplyScalar(1 + Math.sin(t * 27) * 0.011 * holdRumble);
    }

    // ── keep DOM #focal-title glued to the planet's projected screen position ──
    // (stationary white title centered ON the planet while camera drifts on drag)
    const planetBgEl = document.getElementById('planet-bg');
    if (planetBgEl && planetBgEl.style.display !== 'none') {
      const follow = (arcAnim && arcAnim.in && arcAnim.in.group) ? arcAnim.in.group : currentView.group;
      _projPlanet.copy(follow.position).project(camera);
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

    if (holoOn) {
      renderHoloScene();
    } else {
      renderer.autoClear = true;
      renderer.render(scene, camera);
    }
  }

  function setHoloFxVisible(on) {
    holoRoom.forEach(function (m) { m.visible = on; });
    holoCloud.visible = on && holoOn;
    holoSpace.visible = on;
    stars.visible = on;
    galaxy.visible = on;
    for (let ni = 0; ni < nebulae.length; ni++) nebulae[ni].mesh.visible = on;
    for (let i = 0; i < planetViews.length; i++) {
    const v = planetViews[i];
    if (v.shells) {
      for (let s = 0; s < v.shells.length; s++) {
        if (v.shells[s].mesh) v.shells[s].mesh.visible = on && !holoOn;
      }
    }
    if (v.atmo) v.atmo.visible = on && !holoOn;
    if (v.ringGroup) v.ringGroup.visible = on && !holoOn;
    }
  }

  function setHoloGlobeVisible(on) {
    for (let i = 0; i < planetViews.length; i++) {
      const v = planetViews[i];
      if (v.core) v.core.visible = on;
      if (v.cage) v.cage.visible = on && holoOn;
      const host = v.group || v.core;
      const occ = host && host.getObjectByName && host.getObjectByName('holoOccluder');
      if (occ) occ.visible = on && holoOn;
    }
  }

  function renderHoloScene() {
    /* Globe first (opaque depth). Then room/props depth-test against it:
       fly-throughs in front of the disc show; behind hide; floor never leaks. */
    setHoloGlobeVisible(true);
    setHoloFxVisible(false);
    renderer.autoClear = true;
    renderer.autoClearColor = true;
    renderer.autoClearDepth = true;
    renderer.render(scene, camera);

    setHoloGlobeVisible(false);
    setHoloFxVisible(true);
    renderer.autoClear = false;
    renderer.autoClearColor = false;
    renderer.autoClearDepth = false;
    renderer.render(scene, camera);

    setHoloGlobeVisible(true);
    renderer.autoClear = true;
    renderer.autoClearColor = true;
    renderer.autoClearDepth = true;
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

  if (document.documentElement.classList.contains('theme-holo')) {
    applyHoloSkin(true);
  }

  frame();
})();
