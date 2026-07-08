/**
 * Orbit V2 — attach legacy window bodies to 3D zone planets (screen-projected panels).
 * Buttons live on planet surfaces (space3d); panels show real tracklist/gallery/player DOM.
 */
(function () {
  const html = document.documentElement;
  if (!html.classList.contains('orbit-v2') || !html.classList.contains('orbit-v2-3d')) return;

  const WIN_MAP = {
    catalog: { winId: 'tracklist-win', bodyOnly: true },
    archive: { winId: 'gallery-win', bodyOnly: true },
    player: { winId: 'player-win', bodyOnly: true },
    lyrics: { winId: 'lyrics-win', bodyOnly: true },
    songDetail: { winId: 'song-detail-win', bodyOnly: true },
    imageViewer: { winId: 'image-win', bodyOnly: true },
  };

  const layer = document.getElementById('orbit-planet-panels-layer');
  const root = layer || (() => {
    const el = document.createElement('div');
    el.id = 'orbit-planet-panels-layer';
    document.body.appendChild(el);
    return el;
  })();

  const panels = {};

  function prepareWin(winId) {
    const win = document.getElementById(winId);
    if (!win) return null;
    win.classList.add('orbit-planet-source-win');
    win.style.display = 'none';
    win.style.visibility = 'hidden';
    const bar = win.querySelector('.win-bar');
    if (bar) bar.style.display = 'none';
    win.querySelectorAll('.win-resize').forEach((r) => { r.style.display = 'none'; });
    return win;
  }

  function mountPanel(type) {
    if (panels[type]) return panels[type];
    const cfg = WIN_MAP[type];
    if (!cfg) return null;
    const win = prepareWin(cfg.winId);
    if (!win) return null;

    const wrap = document.createElement('div');
    wrap.className = 'orbit-planet-panel';
    wrap.dataset.planetType = type;
    wrap.style.display = 'none';

    const body = win.querySelector('.win-body') || win;
    if (body.parentNode !== wrap) {
      wrap.appendChild(body);
    }

    root.appendChild(wrap);
    panels[type] = { el: wrap, winId: cfg.winId, open: false };
    return panels[type];
  }

  function openPanel(type) {
    const p = mountPanel(type) || panels[type];
    if (!p) return;
    p.open = true;
    p.el.style.display = 'flex';
    if (type === 'archive' && typeof renderGallery === 'function') renderGallery();
    if (type === 'catalog' && typeof renderTracklist === 'function') renderTracklist();
    html.classList.add('orbit-planet-panel-open');
    html.dataset.orbitPlanetPanel = type;
  }

  function closePanel(type) {
    const p = panels[type];
    if (!p) return;
    p.open = false;
    p.el.style.display = 'none';
    if (html.dataset.orbitPlanetPanel === type) {
      delete html.dataset.orbitPlanetPanel;
      if (!Object.values(panels).some((x) => x.open)) {
        html.classList.remove('orbit-planet-panel-open');
      }
    }
  }

  function togglePanel(type) {
    const p = panels[type];
    if (p && p.open) closePanel(type);
    else openPanel(type);
  }

  function worldToScreen(pos, camera, canvas) {
    const v = pos.clone();
    v.project(camera);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    return {
      x: (v.x * 0.5 + 0.5) * w,
      y: (-v.y * 0.5 + 0.5) * h,
      behind: v.z > 1,
    };
  }

  window.__orbitPlanetPanelsTick = function () {
    const cam = window.__SPACE3D_CAMERA;
    const canvas = document.getElementById('space3d-canvas');
    const zones = window.__ZONE_PLANETS;
    if (!cam || !canvas || !zones) return;

    Object.keys(panels).forEach((type) => {
      const panel = panels[type];
      if (!panel.open) return;
      const mesh = zones[type];
      if (!mesh) {
        panel.el.style.display = 'none';
        return;
      }
      const offset = (mesh.userData && mesh.userData.panelOffset)
        ? mesh.userData.panelOffset.clone()
        : new THREE.Vector3(0, 0.4, 0.9);
      const world = offset.clone();
      mesh.localToWorld(world);
      const scr = worldToScreen(world, cam, canvas);
      if (scr.behind) {
        panel.el.style.opacity = '0.35';
      } else {
        panel.el.style.opacity = '1';
      }
      const scale = mesh.userData.baseScale || 1;
      const w = Math.min(420, 280 + scale * 45);
      const h = Math.min(520, 320 + scale * 40);
      panel.el.style.width = w + 'px';
      panel.el.style.maxHeight = h + 'px';
      panel.el.style.left = scr.x + 'px';
      panel.el.style.top = scr.y + 'px';
    });
  };

  window.OrbitPlanetWorld = {
    mountPanel,
    openPanel,
    closePanel,
    togglePanel,
    onSurfaceButton(type) {
      if (!window.__ZONE_PLANETS || !window.__ZONE_PLANETS[type]) {
        if (typeof window.spawnZonePlanet === 'function') window.spawnZonePlanet(type);
      }
      togglePanel(type);
      if (typeof window.selectZonePlanet === 'function' && window.__ZONE_PLANETS[type]) {
        window.selectZonePlanet(window.__ZONE_PLANETS[type]);
      }
    },
    spawnAndOpen(type) {
      if (typeof window.spawnZonePlanet === 'function') window.spawnZonePlanet(type);
      setTimeout(() => openPanel(type), 120);
    },
  };

  window.__orbitPlanetOpenPanel = openPanel;
  window.__orbitPlanetClosePanel = closePanel;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && html.dataset.orbitPlanetPanel) {
      closePanel(html.dataset.orbitPlanetPanel);
    }
  });
})();