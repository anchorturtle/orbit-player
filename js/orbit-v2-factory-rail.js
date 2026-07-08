/**
 * Orbit 2.0 Factory — visible UI replacement (not hidden morph sheets).
 * Catalog/archive = 3D zone planets + horizontal chip rail only.
 */
(function () {
  const html = document.documentElement;
  if (!html.classList.contains('orbit-v2')) return;

  function ensureRail() {
    let el = document.getElementById('orbit-factory-rail');
    if (!el) {
      el = document.createElement('div');
      el.id = 'orbit-factory-rail';
      el.setAttribute('aria-label', 'Factory rail');
      document.body.appendChild(el);
    }
    return el;
  }

  function setBanner(text) {
    let b = document.getElementById('orbit-factory-banner');
    if (!b) {
      b = document.createElement('div');
      b.id = 'orbit-factory-banner';
      document.body.appendChild(b);
    }
    b.textContent = text;
    b.hidden = !text;
  }

  function hide() {
    html.classList.remove('orbit-v2-factory-active');
    const rail = document.getElementById('orbit-factory-rail');
    if (rail) {
      rail.innerHTML = '';
      rail.className = '';
    }
    setBanner('');
  }

  function showCatalog() {
    const rail = ensureRail();
    rail.className = 'orbit-factory-rail orbit-factory-rail--catalog';
    rail.innerHTML = '';
    if (typeof TRACKS === 'undefined' || !TRACKS.length) {
      rail.textContent = 'No tracks loaded';
      return;
    }
    TRACKS.forEach((t, i) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'orbit-factory-chip';
      chip.textContent = t.title || t.name || 'Track ' + (i + 1);
      chip.addEventListener('click', () => {
        if (typeof loadTrack === 'function') loadTrack(i, true);
        rail.querySelectorAll('.orbit-factory-chip').forEach((c, j) => {
          c.classList.toggle('is-active', j === i);
        });
      });
      if (typeof currentIndex !== 'undefined' && i === currentIndex) chip.classList.add('is-active');
      rail.appendChild(chip);
    });
    html.classList.add('orbit-v2-factory-active');
    setBanner('CATALOG PLANET — pick a print · drag the purple sphere');
  }

  function showArchive() {
    const rail = ensureRail();
    rail.className = 'orbit-factory-rail orbit-factory-rail--archive';
    rail.innerHTML = '';
    const list = typeof GALLERY !== 'undefined' ? GALLERY : [];
    if (!list.length) {
      rail.textContent = 'Gallery loading…';
      if (typeof renderGallery === 'function') renderGallery();
      return;
    }
    list.forEach((g, i) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'orbit-factory-chip orbit-factory-chip--art';
      const thumb = document.createElement('img');
      thumb.src = g.thumb || g.src;
      thumb.alt = '';
      thumb.loading = 'lazy';
      chip.appendChild(thumb);
      chip.addEventListener('click', () => {
        if (typeof openGalleryImage === 'function') openGalleryImage(i);
        else if (typeof showImage === 'function') showImage(i);
      });
      rail.appendChild(chip);
    });
    html.classList.add('orbit-v2-factory-active');
    setBanner('ARCHIVE PLANET — Op-Art press · tap thumbs');
  }

  window.OrbitFactoryRail = {
    show: function (zone) {
      if (zone === 'catalog') showCatalog();
      else if (zone === 'archive') showArchive();
    },
    hide: hide,
    refreshCatalog: showCatalog
  };
})();