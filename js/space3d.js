/* ============================================
   ORBIT PLAYER — space3d.js
   Real-time 3D cosmic background (Three.js):
   • Shader-driven living planet w/ swirling nebula surface + atmosphere
   • Tilted orbiting particle ring system
   • Deep parallax starfield (thousands of stars, twinkle, depth)
   • Volumetric-style nebula clouds
   • Shooting stars
   • Audio-reactive: the whole scene breathes with the music
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
  const DPR_CAP = MOBILE ? 1.5 : 1.75;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 400);

  /* Brand palette (matches CSS custom props) */
  const COL_PURPLE = new THREE.Color('#7B2FFF');
  const COL_BLUE   = new THREE.Color('#2D5BFF');
  const COL_GREEN  = new THREE.Color('#00C896');
  const COL_BABY   = new THREE.Color('#7EC8E3');

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
    float fbm(vec3 p){
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++){
        v += a * noise3(p);
        p = p * 2.07 + vec3(11.3, 7.7, 5.1);
        a *= 0.5;
      }
      return v;
    }
  `;

  /* ════════════════ PLANET ════════════════ */
  const PLANET_R = 1.25;
  const planetUniforms = {
    uTime:  { value: 0 },
    uAudio: { value: 0 },
    uBass:  { value: 0 },
    uColA:  { value: COL_PURPLE },
    uColB:  { value: COL_BLUE },
    uColC:  { value: COL_GREEN }
  };

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_R, 96, 96),
    new THREE.ShaderMaterial({
      uniforms: planetUniforms,
      vertexShader: `
        uniform float uBass;
        varying vec3 vNormal;
        varying vec3 vPos;
        varying vec3 vView;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          // subtle breathing with the low end
          vec3 p = position * (1.0 + uBass * 0.025);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
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

          // deep-space base → purple → blue, green energy veins on the peaks
          vec3 col = mix(vec3(0.015, 0.008, 0.05), uColA * 0.7, smoothstep(0.18, 0.62, bands));
          col = mix(col, uColB * 0.75, smoothstep(0.42, 0.85, swirl) * 0.8);
          col += uColC * smoothstep(0.68, 0.95, storms) * (0.35 + uAudio * 0.85);
          col += uColA * smoothstep(0.75, 1.0, swirl) * 0.45;

          // simple key light from upper-left + soft terminator
          vec3 L = normalize(vec3(-0.55, 0.5, 0.7));
          float diff = clamp(dot(normalize(vNormal), L), 0.0, 1.0);
          col *= 0.32 + diff * 0.9;

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

  /* Atmosphere glow shell */
  const atmoUniforms = {
    uTime: { value: 0 },
    uBass: { value: 0 },
    uColA: { value: COL_PURPLE },
    uColB: { value: COL_BLUE }
  };
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(PLANET_R * 1.32, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: atmoUniforms,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec3 vNormal;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uBass;
        uniform vec3 uColA;
        uniform vec3 uColB;
        varying vec3 vNormal;
        void main(){
          float glow = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, -1.0)), 3.4);
          vec3 col = mix(uColA, uColB, 0.5 + 0.5 * sin(uTime * 0.12));
          gl_FragColor = vec4(col, glow * (0.55 + uBass * 0.65));
        }
      `
    })
  );
  scene.add(atmosphere);

  /* ════════════════ ORBITING PARTICLE RINGS ════════════════ */
  const ringGroup = new THREE.Group();
  ringGroup.rotation.x = Math.PI * 0.46;
  ringGroup.rotation.y = -0.22;
  scene.add(ringGroup);

  const RING_COUNT = MOBILE ? 1100 : 2200;
  const ringGeo = new THREE.BufferGeometry();
  {
    const pos = new Float32Array(RING_COUNT * 3);
    const col = new Float32Array(RING_COUNT * 3);
    const sz  = new Float32Array(RING_COUNT);
    const ph  = new Float32Array(RING_COUNT);
    const tmp = new THREE.Color();
    for (let i = 0; i < RING_COUNT; i++) {
      const band = Math.random();
      // two main bands with a visible gap, gaussian-ish thickness
      const base = band < 0.62 ? 1.95 : 2.65;
      const spread = band < 0.62 ? 0.34 : 0.22;
      const r = base + (Math.random() + Math.random() + Math.random() - 1.5) * spread;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3]     = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      pos[i * 3 + 2] = Math.sin(a) * r;
      tmp.copy(Math.random() < 0.6 ? COL_PURPLE : (Math.random() < 0.5 ? COL_BLUE : COL_GREEN));
      tmp.multiplyScalar(0.55 + Math.random() * 0.6);
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      sz[i] = 0.5 + Math.random() * 1.6;
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
        vTw = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float size = aSize * (1.0 + uAudio * 0.8);
        gl_PointSize = size * uScale * 0.035 / max(0.1, -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vTw;
      void main(){
        vec2 d = gl_PointCoord - 0.5;
        float a = smoothstep(0.5, 0.05, length(d));
        gl_FragColor = vec4(vColor * vTw, a * 0.9);
      }
    `
  }));
  ringGroup.add(ringPoints);

  /* ════════════════ STARFIELD (deep, 3 layers in one buffer) ════════════════ */
  const STAR_COUNT = MOBILE ? 1600 : 3200;
  const starGeo = new THREE.BufferGeometry();
  {
    const pos = new Float32Array(STAR_COUNT * 3);
    const col = new Float32Array(STAR_COUNT * 3);
    const sz  = new Float32Array(STAR_COUNT);
    const ph  = new Float32Array(STAR_COUNT);
    const tmp = new THREE.Color();
    for (let i = 0; i < STAR_COUNT; i++) {
      // random point in a thick spherical shell biased behind the planet
      const r = 26 + Math.pow(Math.random(), 0.55) * 120;
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
        // 4-point diffraction sparkle on the brighter twinkle phase
        float spike = max(0.0, 1.0 - abs(d.x) * 14.0) + max(0.0, 1.0 - abs(d.y) * 14.0);
        float a = core * (0.35 + 0.65 * vTw) + spike * 0.10 * vTw;
        gl_FragColor = vec4(vColor, a);
      }
    `
  }));
  scene.add(stars);

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
      uC1: { value: d.c1 },
      uC2: { value: d.c2 },
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
    nebulae.push({ mesh: m, u, rs: (Math.random() - 0.5) * 0.0035 });
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
  let nextShoot = 4;

  function spawnShooter(s) {
    s.active = true;
    s.t = 0;
    s.dur = 0.7 + Math.random() * 0.7;
    s.from.set((Math.random() - 0.2) * 50, 12 + Math.random() * 18, -30 - Math.random() * 30);
    s.dir.set(-(0.5 + Math.random()), -(0.35 + Math.random() * 0.4), 0).normalize().multiplyScalar(34 + Math.random() * 20);
  }

  /* ════════════════ AUDIO REACTIVITY ════════════════ */
  // Taps the player's existing Web Audio graph (gainNode) with an analyser.
  // player.js loads after this file; bindings exist by the time the loop runs.
  let analyser = null, freqData = null;
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
      }
    } catch (e) { /* audio graph not ready yet */ }
  }

  function sampleAudio() {
    if (!analyser) { tryHookAudio(); return; }
    try {
      analyser.getByteFrequencyData(freqData);
      let bass = 0, all = 0;
      const bassBins = 9;
      for (let i = 1; i < bassBins; i++) bass += freqData[i];
      for (let i = 0; i < freqData.length; i++) all += freqData[i];
      bass = bass / (bassBins - 1) / 255;
      all = all / freqData.length / 255;
      bassSm += (bass - bassSm) * 0.18;
      levelSm += (all - levelSm) * 0.12;
    } catch (e) { /* context may be suspended */ }
  }

  /* ════════════════ CAMERA + PARALLAX ════════════════ */
  const mouse = { x: 0, y: 0, has: false };
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    mouse.has = true;
  }, { passive: true });

  function fitCamera() {
    const h = window.innerHeight;
    // Match the apparent planet size to the DOM focal circle (~340px, capped on small screens)
    const targetPx = Math.min(360, h * 0.46);
    const z = (PLANET_R * h) / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * targetPx);
    camera.position.z = Math.max(6.2, Math.min(13, z));
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
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

    // uniforms
    planetUniforms.uTime.value = t;
    planetUniforms.uAudio.value = levelSm;
    planetUniforms.uBass.value = bassSm;
    atmoUniforms.uTime.value = t;
    atmoUniforms.uBass.value = bassSm;
    ringUniforms.uTime.value = t;
    ringUniforms.uAudio.value = levelSm;
    starUniforms.uTime.value = t;
    starUniforms.uAudio.value = levelSm;
    nebulae.forEach(n => {
      n.u.uTime.value = t;
      n.u.uAudio.value = levelSm;
      n.mesh.rotation.z += n.rs * dt * 60 * 0.016;
    });

    // motion
    planet.rotation.y += dt * (0.045 + bassSm * 0.08);
    ringPoints.rotation.y += dt * (0.06 + levelSm * 0.12);
    stars.rotation.y += dt * 0.0035;
    stars.rotation.z += dt * 0.0012;

    // parallax: mouse on desktop, gentle auto-drift otherwise
    let px, py;
    if (mouse.has) {
      px = mouse.x * 0.6;
      py = -mouse.y * 0.38;
    } else {
      px = Math.sin(t * 0.07) * 0.25;
      py = Math.cos(t * 0.05) * 0.16;
    }
    camera.position.x += (px - camera.position.x) * 0.03;
    camera.position.y += (py - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    // shooting stars
    nextShoot -= dt;
    if (nextShoot <= 0) {
      const free = shooters.find(s => !s.active);
      if (free) spawnShooter(free);
      nextShoot = 5 + Math.random() * 9;
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
