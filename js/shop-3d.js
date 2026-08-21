/* ============================================
   ORBIT PLAYER — shop-3d.js
   Default sculpt quality inspired by C2-Renderer:
   dense geometry, multi-octave cloth folds,
   fabric micro-bump, sheen PBR, studio env lighting.
   (Rasterized Three.js — not a path tracer.)
   ============================================ */

(function () {
  'use strict';

  const ATLAS = 512;
  const IDLE = 0;

  let renderer, scene, camera, pivot, raf, running = false;
  let fabricMat, mugMat, mugPrintMat, mugInnerMat, boardMat;
  let teeGroup, mugGroup, posterGroup;
  let product = 'tee';
  let dragging = false;
  let lastX = 0, lastY = 0;
  let yaw = 0.38, pitch = 0.08, zoom = 2.75;
  let canvasEl, ro;
  let atlasCanvas, atlasTex;

  function fabricHex() { return 0xf4f1ea; }

  function hash2(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  }
  function noise2(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash2(ix, iy), b = hash2(ix + 1, iy);
    const c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
  }
  function fbm(x, y, oct) {
    let v = 0, a = 0.5, f = 1;
    for (let i = 0; i < oct; i++) {
      v += a * noise2(x * f, y * f);
      a *= 0.52;
      f *= 2.03;
    }
    return v;
  }

  function makeRenderer(canvas) {
    const r = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.setClearColor(0x000000, 0);
    if (r.outputEncoding !== undefined) r.outputEncoding = THREE.sRGBEncoding;
    if (r.physicallyCorrectLights !== undefined) r.physicallyCorrectLights = true;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    return r;
  }

  function weaveBump() {
    const s = 512;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(s, s);
    const d = img.data;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const wx = Math.sin(x * 1.15);
        const wy = Math.sin(y * 1.15);
        const weave = (wx * wy * 0.35 + wx * 0.2 + wy * 0.2) * 0.5 + 0.5;
        const n = fbm(x * 0.085, y * 0.085, 5);
        const stitch = Math.pow(Math.abs(Math.sin(y * 0.42)), 8) * 0.25;
        const v = Math.max(0, Math.min(255, (weave * 0.38 + n * 0.5 + stitch) * 255));
        const i = (y * s + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(22, 26);
    tex.anisotropy = 8;
    return tex;
  }

  function cloth(hex) {
    const bump = weaveBump();
    const m = new THREE.MeshPhysicalMaterial({
      color: hex,
      roughness: 0.96,
      metalness: 0.0,
      roughnessMap: bump,
      bumpMap: bump,
      bumpScale: 0.042,
      envMapIntensity: 0.08,
      side: THREE.DoubleSide,
      flatShading: false,
    });
    if (m.specularIntensity !== undefined) m.specularIntensity = 0.12;
    if (m.ior !== undefined) m.ior = 1.46;
    if (m.sheen !== undefined) {
      m.sheen = 0.85;
      m.sheenRoughness = 0.88;
      m.sheenColor = new THREE.Color(hex).lerp(new THREE.Color(0xe8e0d4), 0.4);
    }
    return m;
  }

  function ceramic(hex, opts) {
    return new THREE.MeshPhysicalMaterial(Object.assign({
      color: hex,
      roughness: 0.12,
      metalness: 0.0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
    }, opts || {}));
  }

  function paper(hex) {
    return new THREE.MeshStandardMaterial({
      color: hex,
      roughness: 0.78,
      metalness: 0,
    });
  }

  function shirtShape() {
    const sh = new THREE.Shape();
    // A-line tee: wider hem, dropped sleeves, soft collar.
    sh.moveTo(-0.58, 0.02);
    sh.bezierCurveTo(-0.62, -0.04, -0.66, 0.01, -0.64, 0.14);
    sh.bezierCurveTo(-0.62, 0.52, -0.56, 0.82, -0.54, 0.94);
    sh.bezierCurveTo(-0.82, 0.90, -1.08, 0.74, -1.18, 0.66);
    sh.bezierCurveTo(-1.28, 0.86, -1.22, 1.10, -1.08, 1.22);
    sh.bezierCurveTo(-0.90, 1.34, -0.58, 1.36, -0.40, 1.37);
    sh.lineTo(-0.18, 1.44);
    sh.bezierCurveTo(-0.14, 1.28, -0.07, 1.20, 0.0, 1.205);
    sh.bezierCurveTo(0.07, 1.20, 0.14, 1.28, 0.18, 1.44);
    sh.lineTo(0.40, 1.37);
    sh.bezierCurveTo(0.58, 1.36, 0.90, 1.34, 1.08, 1.22);
    sh.bezierCurveTo(1.22, 1.10, 1.28, 0.86, 1.18, 0.66);
    sh.bezierCurveTo(1.08, 0.74, 0.82, 0.90, 0.54, 0.94);
    sh.bezierCurveTo(0.56, 0.82, 0.62, 0.52, 0.64, 0.14);
    sh.bezierCurveTo(0.66, 0.01, 0.62, -0.04, 0.58, 0.02);
    sh.bezierCurveTo(0.22, -0.06, -0.22, -0.06, -0.58, 0.02);
    return sh;
  }

  function subdivideOnce(geo) {
    const pos = geo.attributes.position;
    const src = pos.array;
    const tri = pos.count / 3;
    const out = new Float32Array(tri * 12 * 3);
    let w = 0;
    function mid(ia, ib, o) {
      o[0] = (src[ia] + src[ib]) * 0.5;
      o[1] = (src[ia + 1] + src[ib + 1]) * 0.5;
      o[2] = (src[ia + 2] + src[ib + 2]) * 0.5;
    }
    const A = [0, 0, 0], B = [0, 0, 0], C = [0, 0, 0];
    const D = [0, 0, 0], E = [0, 0, 0], F = [0, 0, 0];
    function push(p) {
      out[w++] = p[0]; out[w++] = p[1]; out[w++] = p[2];
    }
    function triPush(p, q, r) { push(p); push(q); push(r); }
    for (let t = 0; t < tri; t++) {
      const i = t * 9;
      A[0] = src[i]; A[1] = src[i + 1]; A[2] = src[i + 2];
      B[0] = src[i + 3]; B[1] = src[i + 4]; B[2] = src[i + 5];
      C[0] = src[i + 6]; C[1] = src[i + 7]; C[2] = src[i + 8];
      mid(i, i + 3, D);
      mid(i + 3, i + 6, E);
      mid(i + 6, i, F);
      triPush(A, D, F);
      triPush(D, B, E);
      triPush(F, E, C);
      triPush(D, E, F);
    }
    const ng = new THREE.BufferGeometry();
    ng.setAttribute('position', new THREE.BufferAttribute(out, 3));
    return ng;
  }

  function crease(dist, width) {
    const t = Math.max(0, 1 - Math.abs(dist) / width);
    return t * t * (3 - 2 * t);
  }

  function captureRest(geo) {
    const pos = geo.attributes.position;
    const n = pos.count;
    const rest = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      rest[i * 3] = pos.getX(i);
      rest[i * 3 + 1] = pos.getY(i);
      rest[i * 3 + 2] = pos.getZ(i);
    }
    geo.setAttribute('restPos', new THREE.BufferAttribute(rest, 3));
  }

  function sculptShirt(geo, depth) {
    const pos = geo.attributes.position;
    const rest = geo.attributes.restPos;
    for (let i = 0; i < pos.count; i++) {
      const x = rest.getX(i);
      const y = rest.getY(i);
      const z = rest.getZ(i);
      const ax = Math.abs(x);
      const ny = Math.max(0, Math.min(1, (y - 0.02) / 1.40));
      const body = ax < 0.62 && y > 0.04 && y < 1.24;
      const sleeve = ax > 0.64;
      const collar = y > 1.24 && ax < 0.32;
      const hem = y < 0.22;
      const side = z > depth * 0.42 ? 1 : -1;

      // Barrel + gravity drape (A-line, not a rigid slab).
      let puff = Math.cos((x / 0.62) * 0.85) * Math.sin(ny * Math.PI) * 0.11;
      puff += (fbm(x * 1.35 + 2.1, y * 1.2, 6) - 0.48) * 0.072;
      puff += Math.sin((ax - 0.12) * 9.4 + y * 3.1) * Math.sin(ny * 2.2) * 0.018;
      puff += crease(ax - 0.52, 0.09) * Math.sin(y * 6.4 + x * 2) * 0.028;
      puff += crease(Math.hypot(ax - 0.48, y - 0.92), 0.20) * 0.034;
      puff -= Math.pow(1 - ny, 1.4) * 0.028;
      puff += Math.sin(x * 2.4 + 0.7) * (1 - ny) * 0.02;

      if (sleeve) {
        const along = (y - 0.72);
        puff = 0.045 + (fbm(x * 4.2, y * 3.6, 5) - 0.5) * 0.05;
        puff += Math.sin(along * 14 + ax * 5) * 0.018;
        puff -= along * 0.04;
      }
      if (collar) {
        puff = 0.018 + Math.sin(Math.atan2(x, y - 1.22) * 12) * 0.01;
      }
      if (!body && !sleeve && !collar) puff *= 0.22;

      const flare = 1 + (1 - ny) * 0.14 + ny * 0.02;
      let nx = x * flare;
      let ny2 = y - Math.pow(1 - ny, 1.6) * 0.045;
      if (sleeve) {
        ny2 -= (ax - 0.64) * 0.16;
        nx *= 1 - (0.72 - Math.min(y, 0.72)) * 0.08;
      }
      let nz = z + puff * side;
      nz += (fbm(x * 8.5, y * 7.8, 5) - 0.5) * 0.012 * side;
      if (hem) {
        nz += Math.sin(x * 8.8 + 0.4) * 0.032;
        ny2 -= 0.028 * (1 - ax * 0.25) + Math.abs(Math.sin(x * 5.5)) * 0.012;
      }
      pos.setXYZ(i, nx, ny2, nz);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }

  function addChestPrintAttrs(geo, depth) {
    const rest = geo.attributes.restPos;
    const pos = geo.attributes.position;
    const n = pos.count;
    const uv = new Float32Array(n * 2);
    const mask = new Float32Array(n);
    const x0 = -0.30, x1 = 0.30, y0 = 0.46, y1 = 1.10;
    const sm = (t) => {
      const x = Math.max(0, Math.min(1, t));
      return x * x * (3 - 2 * x);
    };
    for (let i = 0; i < n; i++) {
      const rx = rest.getX(i), ry = rest.getY(i), rz = rest.getZ(i);
      const z = pos.getZ(i);
      // Rest-space UVs so the print stretches with cloth folds instead of a flat stamp.
      const u = (rx - x0) / (x1 - x0);
      const v = (ry - y0) / (y1 - y0);
      uv[i * 2] = u;
      uv[i * 2 + 1] = v;
      const front = rz > depth * 0.34 && z > 0 ? 1 : 0;
      const inBox = u > -0.08 && u < 1.08 && v > -0.08 && v < 1.08;
      const edge = sm(u / 0.16) * sm((1 - u) / 0.16) * sm(v / 0.14) * sm((1 - v) / 0.14);
      mask[i] = front * (inBox ? edge : 0);
    }
    geo.setAttribute('printUv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('printMask', new THREE.BufferAttribute(mask, 1));
  }

  function addCylinderPrintAttrs(geo) {
    const uvIn = geo.attributes.uv;
    const n = uvIn.count;
    const uv = new Float32Array(n * 2);
    const mask = new Float32Array(n);
    const sm = (t) => {
      const x = Math.max(0, Math.min(1, t));
      return x * x * (3 - 2 * x);
    };
    for (let i = 0; i < n; i++) {
      const u0 = uvIn.getX(i);
      const v0 = uvIn.getY(i);
      const u = (u0 - 0.32) / 0.36;
      const v = (v0 - 0.18) / 0.64;
      uv[i * 2] = u;
      uv[i * 2 + 1] = v;
      mask[i] = sm(u / 0.12) * sm((1 - u) / 0.12) * sm(v / 0.1) * sm((1 - v) / 0.1);
    }
    geo.setAttribute('printUv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('printMask', new THREE.BufferAttribute(mask, 1));
  }

  const printMats = [];
  function bindPrintShader(mat) {
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.printMap = { value: atlasTex };
      mat.userData.shader = shader;
      shader.vertexShader = shader.vertexShader
        .replace(
          'void main() {',
          'attribute vec2 printUv;\nattribute float printMask;\nvarying vec2 vPrintUv;\nvarying float vPrintMask;\nvoid main() {'
        )
        .replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\n vPrintUv = printUv;\n vPrintMask = printMask;'
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          'void main() {',
          'uniform sampler2D printMap;\nvarying vec2 vPrintUv;\nvarying float vPrintMask;\nvoid main() {'
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
           vec4 pcol = texture2D(printMap, vPrintUv);
           float pm = vPrintMask * pcol.a;
           pm *= step(0.0, vPrintUv.x) * step(vPrintUv.x, 1.0) * step(0.0, vPrintUv.y) * step(vPrintUv.y, 1.0);
           diffuseColor.rgb = mix(diffuseColor.rgb, pcol.rgb * 0.94, clamp(pm, 0.0, 1.0));`
        );
    };
    mat.customProgramCacheKey = () => 'orbit-print-v1';
    printMats.push(mat);
  }

  function buildTee() {
    const g = new THREE.Group();
    fabricMat = cloth(fabricHex());
    bindPrintShader(fabricMat);
    const depth = 0.042;
    let geo = new THREE.ExtrudeGeometry(shirtShape(), {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.036,
      bevelSize: 0.022,
      bevelOffset: -0.004,
      bevelSegments: 10,
      curveSegments: 80,
      steps: 3,
    });
    geo = subdivideOnce(geo);
    geo = subdivideOnce(geo);
    captureRest(geo);
    sculptShirt(geo, depth);
    addChestPrintAttrs(geo, depth);
    geo.computeVertexNormals();
    geo.center();
    const mesh = new THREE.Mesh(geo, fabricMat);
    g.add(mesh);
    g.position.y = 0.06;
    return g;
  }

  function buildMug() {
    const g = new THREE.Group();
    mugMat = ceramic(0xf6f4f0, { roughness: 0.22, clearcoat: 0.42, clearcoatRoughness: 0.18, envMapIntensity: 0.55 });
    mugPrintMat = ceramic(0xf6f4f0, { roughness: 0.34, clearcoat: 0.18, clearcoatRoughness: 0.28, envMapIntensity: 0.32 });
    mugInnerMat = ceramic(0xe8e2d8, { roughness: 0.4, clearcoat: 0.15, envMapIntensity: 0.3 });
    mugInnerMat.side = THREE.BackSide;
    const wallGeo = new THREE.CylinderGeometry(0.42, 0.4, 0.82, 96, 12, true);
    addCylinderPrintAttrs(wallGeo);
    bindPrintShader(mugPrintMat);
    const wall = new THREE.Mesh(wallGeo, mugPrintMat);
    g.add(wall);
    const inside = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.35, 0.78, 48, 4, true), mugInnerMat);
    g.add(inside);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.4, 48), mugMat);
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = -0.41;
    g.add(bottom);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.028, 12, 64), mugMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.41;
    g.add(rim);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.042, 12, 48, Math.PI * 1.15), mugMat);
    handle.rotation.y = Math.PI / 2;
    handle.position.set(0.48, 0, 0);
    g.add(handle);
    g.position.y = -0.05;
    return g;
  }

  function buildPoster() {
    const g = new THREE.Group();
    boardMat = paper(0xf7f4ee);
    boardMat.map = atlasTex || null;
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.22, 1.54, 0.03), boardMat);
    g.add(board);
    return g;
  }

  function showProduct(id) {
    product = id;
    teeGroup.visible = id === 'tee';
    mugGroup.visible = id === 'mug';
    posterGroup.visible = id === 'poster';
    zoom = id === 'poster' ? 3.05 : id === 'mug' ? 2.55 : 2.55;
  }

  function paintAtlas(img) {
    if (!atlasCanvas) {
      atlasCanvas = document.createElement('canvas');
      atlasCanvas.width = ATLAS;
      atlasCanvas.height = ATLAS;
    }
    const ctx = atlasCanvas.getContext('2d');
    ctx.clearRect(0, 0, ATLAS, ATLAS);
    if (!img || !img.width) return;
    const ir = img.width / img.height;
    const pad = 36;
    const box = ATLAS - pad * 2;
    let dw, dh;
    if (ir >= 1) { dw = box; dh = box / ir; }
    else { dh = box; dw = box * ir; }
    const dx = (ATLAS - dw) / 2;
    const dy = (ATLAS - dh) / 2;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, dx, dy, dw, dh);
    if (!atlasTex) {
      atlasTex = new THREE.CanvasTexture(atlasCanvas);
      if (atlasTex.encoding !== undefined) atlasTex.encoding = THREE.sRGBEncoding;
      atlasTex.minFilter = THREE.LinearFilter;
      atlasTex.magFilter = THREE.LinearFilter;
      atlasTex.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;
      printMats.forEach((m) => {
        if (m.userData.shader) m.userData.shader.uniforms.printMap.value = atlasTex;
        m.needsUpdate = true;
      });
      if (boardMat) {
        boardMat.map = atlasTex;
        boardMat.needsUpdate = true;
      }
    } else {
      atlasTex.needsUpdate = true;
    }
  }

  function loadArt(src) {
    if (!src) return;
    const img = new Image();
    img.onload = () => paintAtlas(img);
    img.src = src;
  }

  function setTeeColor(hex) {
    if (!fabricMat) return;
    fabricMat.color.set(hex);
    if (fabricMat.sheenColor) {
      fabricMat.sheenColor.copy(fabricMat.color).lerp(new THREE.Color(0xffffff), 0.22);
    }
  }

  function setMugColor(hex) {
    if (mugMat) mugMat.color.set(hex);
    if (mugPrintMat) mugPrintMat.color.set(hex);
    if (mugInnerMat) {
      const c = new THREE.Color(hex);
      c.multiplyScalar(1.1);
      mugInnerMat.color.copy(c);
    }
  }

  function fit() {
    if (!renderer || !canvasEl) return;
    const w = Math.max(2, canvasEl.clientWidth);
    const h = Math.max(2, canvasEl.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function applyOrbit() {
    pitch = Math.max(-0.5, Math.min(0.55, pitch));
    camera.position.set(
      Math.sin(yaw) * Math.cos(pitch) * zoom,
      Math.sin(pitch) * zoom + 0.12,
      Math.cos(yaw) * Math.cos(pitch) * zoom
    );
    camera.lookAt(0, 0.02, 0);
  }

  function tick() {
    if (!running) return;
    if (!dragging) yaw += IDLE;
    applyOrbit();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  function onDown(e) {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvasEl.setPointerCapture(e.pointerId);
  }
  function onMove(e) {
    if (!dragging) return;
    yaw -= (e.clientX - lastX) * 0.008;
    pitch += (e.clientY - lastY) * 0.006;
    lastX = e.clientX;
    lastY = e.clientY;
  }
  function onUp(e) {
    dragging = false;
    try { canvasEl.releasePointerCapture(e.pointerId); } catch (err) {}
  }
  function onWheel(e) {
    e.preventDefault();
    zoom = Math.max(1.85, Math.min(4.6, zoom + e.deltaY * 0.0025));
  }

  function bind() {
    canvasEl.addEventListener('pointerdown', onDown);
    canvasEl.addEventListener('pointermove', onMove);
    canvasEl.addEventListener('pointerup', onUp);
    canvasEl.addEventListener('pointercancel', onUp);
    canvasEl.addEventListener('wheel', onWheel, { passive: false });
  }

  function addStudioEnv() {
    const envScene = new THREE.Scene();
      const bg = new THREE.Mesh(
      new THREE.SphereGeometry(8, 24, 16),
      new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        color: 0xd8d2c8,
      })
    );
    envScene.add(bg);
    const key = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 5),
      new THREE.MeshBasicMaterial({ color: 0xfff6ea, side: THREE.DoubleSide })
    );
    key.position.set(2.2, 4.2, 5);
    key.lookAt(0, 0, 0);
    envScene.add(key);
    const fill = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 4),
      new THREE.MeshBasicMaterial({ color: 0xe7ebf0, side: THREE.DoubleSide })
    );
    fill.position.set(-4.0, 1.8, 2.2);
    fill.lookAt(0, 0, 0);
    envScene.add(fill);
    const bounce = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ color: 0xcfc8bc, side: THREE.DoubleSide })
    );
    bounce.position.set(0, -3.2, 0);
    bounce.rotation.x = Math.PI / 2;
    envScene.add(bounce);
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const envMap = pmrem.fromScene(envScene, 0.04).texture;
      scene.environment = envMap;
      pmrem.dispose();
    } catch (e) { /* older three without PMREM */ }
  }

  function start(canvas) {
    if (typeof THREE === 'undefined' || !canvas) return;
    canvasEl = canvas;
    if (!renderer) {
      renderer = makeRenderer(canvas);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(32, 1, 0.08, 40);
      addStudioEnv();
      scene.add(new THREE.HemisphereLight(0xf7f1e8, 0x6a6358, 1.15));
      const key = new THREE.DirectionalLight(0xfff6ec, 0.32);
      key.position.set(1.15, 4.4, 2.2);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xdde3ea, 0.42);
      fill.position.set(-2.8, 1.6, 1.8);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xfffaf4, 0.18);
      rim.position.set(-0.4, 2.2, -2.8);
      scene.add(rim);
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(2.4, 64),
        new THREE.MeshStandardMaterial({
          color: 0xb9b2a6,
          roughness: 0.95,
          metalness: 0.0,
          envMapIntensity: 0.15,
        })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.78;
      scene.add(ground);
      pivot = new THREE.Group();
      scene.add(pivot);
      teeGroup = buildTee();
      mugGroup = buildMug();
      posterGroup = buildPoster();
      mugGroup.visible = false;
      posterGroup.visible = false;
      pivot.add(teeGroup, mugGroup, posterGroup);
      bind();
    }
    running = true;
    fit();
    applyOrbit();
    if (ro) ro.disconnect();
    ro = new ResizeObserver(fit);
    ro.observe(canvasEl);
    cancelAnimationFrame(raf);
    tick();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
    if (ro) { ro.disconnect(); ro = null; }
    if (renderer && renderer.setAnimationLoop) renderer.setAnimationLoop(null);
  }

  function setPose(y, p) {
    if (typeof y === 'number') yaw = y;
    if (typeof p === 'number') pitch = p;
    applyOrbit();
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  window.OrbitShop3D = {
    start,
    stop,
    setArt: loadArt,
    setProduct: showProduct,
    setTeeColor,
    setMugColor,
    resize: fit,
    setPose,
  };
})();
