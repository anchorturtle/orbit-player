/* ============================================
   ORBIT PLAYER — custom-library.js
   In-memory local audio. Cycles like the tracklist.
   Playlists live in RAM only. Never saved.
   ============================================ */
(function () {
  var library = [];
  var playlists = [];
  var activeId = null;
  var idSeq = 0;
  var plSeq = 0;
  var queueMode = 'all';
  var activePlaylistId = null;
  var hooked = false;

  var AUDIO_EXT = /\.(mp3|wav|flac)$/i;
  var AUDIO_MIME = /^(audio\/mpeg|audio\/mp3|audio\/wav|audio\/wave|audio\/x-wav|audio\/flac|audio\/x-flac)$/i;

  function audioEl() {
    return document.getElementById('audio-player');
  }

  function isAudioFile(file) {
    if (!file) return false;
    if (file.type && AUDIO_MIME.test(file.type)) return true;
    return AUDIO_EXT.test(file.name || '');
  }

  function displayName(file) {
    var raw = (file && (file.webkitRelativePath || file.name)) || 'audio';
    return String(raw).replace(/^.*[/\\]/, '');
  }

  function splitName(name) {
    var base = String(name || 'Custom').replace(/\.(mp3|wav|flac)$/i, '');
    var parts = base.split(/\s+-\s+/);
    if (parts.length >= 2) {
      return { artist: parts[0], title: parts.slice(1).join(' - ') };
    }
    return { artist: 'Custom', title: base };
  }

  function setPlaying(on) {
    if (typeof isPlaying !== 'undefined') isPlaying = !!on;
    if (typeof updatePlayUI === 'function') updatePlayUI();
  }

  function setTitles(title, artist) {
    var fpTitle = document.getElementById('fp-title');
    var fpArtist = document.getElementById('fp-artist');
    var focalTitle = document.getElementById('focal-title');
    var focalArtist = document.getElementById('focal-artist');
    var expEl = document.getElementById('fp-explicit');
    var lyricsBtn = document.getElementById('btn-lyrics');
    if (fpTitle) fpTitle.textContent = title || 'Custom';
    if (fpArtist) fpArtist.textContent = artist || 'Custom';
    if (focalTitle) {
      if (typeof softBreakTitle === 'function' && typeof focalPlainTitle === 'function') {
        focalTitle.textContent = softBreakTitle(focalPlainTitle(title || 'Custom'));
      } else {
        focalTitle.textContent = title || 'Custom';
      }
    }
    if (focalArtist) focalArtist.textContent = artist || 'Custom';
    if (expEl) expEl.hidden = true;
    if (lyricsBtn) lyricsBtn.style.display = 'none';
  }

  function findEntry(id) {
    for (var i = 0; i < library.length; i++) {
      if (library[i].id === id) return library[i];
    }
    return null;
  }

  function currentQueue() {
    var q = [];
    var i, p, j;
    if (queueMode === 'playlist' && activePlaylistId) {
      for (i = 0; i < playlists.length; i++) {
        if (playlists[i].id === activePlaylistId) {
          p = playlists[i];
          for (j = 0; j < p.trackIds.length; j++) {
            if (findEntry(p.trackIds[j])) q.push(p.trackIds[j]);
          }
          return q;
        }
      }
    }
    for (i = 0; i < library.length; i++) q.push(library[i].id);
    return q;
  }

  function searchNeedle() {
    var el = document.getElementById('custom-search');
    return ((el && el.value) || '').trim().toLowerCase();
  }

  function markActive(id) {
    activeId = id;
    var list = document.getElementById('custom-list');
    if (!list) return;
    var rows = list.querySelectorAll('.custom-item');
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle('active', rows[i].dataset.id === String(id));
    }
  }

  function clearActiveRows() {
    activeId = null;
    var list = document.getElementById('custom-list');
    if (!list) return;
    var rows = list.querySelectorAll('.custom-item.active');
    for (var i = 0; i < rows.length; i++) rows[i].classList.remove('active');
  }

  function loadBlob(entry, autoplay) {
    if (!entry || !entry.url) return;
    window.__ORBIT_CUSTOM_ACTIVE__ = true;
    var audio = audioEl();
    if (!audio) return;

    try { audio.pause(); } catch (e1) {}
    audio.src = entry.url;
    try { audio.load(); } catch (e2) {}

    var bits = splitName(entry.name);
    setTitles(bits.title, bits.artist);
    markActive(entry.id);

    var timeTotal = document.getElementById('time-total');
    var timeCurrent = document.getElementById('time-current');
    if (timeCurrent) timeCurrent.textContent = '0:00';
    if (timeTotal) timeTotal.textContent = '0:00';
    if (typeof setProgress === 'function') setProgress(0);
    if (typeof fitPlayerWindow === 'function') {
      requestAnimationFrame(function () { fitPlayerWindow(); });
    }

    if (autoplay) {
      if (typeof initAudioContext === 'function') initAudioContext();
      if (typeof ensureAudioContextRunning === 'function') ensureAudioContextRunning();
      audio.play().then(function () {
        setPlaying(true);
      }).catch(function () {
        setPlaying(false);
      });
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }

  function stepCustom(dir, opts) {
    opts = opts || {};
    var autoplay = opts.autoplay !== undefined ? opts.autoplay : (typeof isPlaying !== 'undefined' ? isPlaying : true);
    var wrap = opts.wrap !== false;
    var q = currentQueue();
    if (!q.length) return false;
    var pos = q.indexOf(activeId);
    if (pos < 0) pos = dir > 0 ? -1 : 0;
    var nextPos = pos + dir;
    if (nextPos < 0 || nextPos >= q.length) {
      if (!wrap) return false;
      nextPos = (nextPos + q.length) % q.length;
    }
    var entry = findEntry(q[nextPos]);
    if (!entry) return false;
    loadBlob(entry, autoplay);
    return true;
  }

  function endedCustom() {
    if (typeof isPlaying !== 'undefined' && !isPlaying) return;
    var rm = typeof repeatMode === 'number' ? repeatMode : 0;
    if (rm === 2) {
      var audio = audioEl();
      var cur = findEntry(activeId);
      if (cur) loadBlob(cur, true);
      else if (audio) {
        try { audio.currentTime = 0; audio.play().catch(function () {}); } catch (e) {}
      }
      return;
    }
    var q = currentQueue();
    if (!q.length) return;
    if (typeof isShuffle !== 'undefined' && isShuffle) {
      var ni = q[Math.floor(Math.random() * q.length)];
      var guard = 0;
      while (q.length > 1 && ni === activeId && guard++ < 8) {
        ni = q[Math.floor(Math.random() * q.length)];
      }
      var entry = findEntry(ni);
      if (entry) loadBlob(entry, true);
      return;
    }
    if (!stepCustom(1, { wrap: true, autoplay: true })) {
      if (typeof pauseAndStopBackground === 'function') pauseAndStopBackground();
      else setPlaying(false);
    }
  }

  window.__ORBIT_CUSTOM_STEP__ = stepCustom;
  window.__ORBIT_CUSTOM_ENDED__ = endedCustom;
  window.__ORBIT_PLAY_BLOB__ = function (opts) {
    opts = opts || {};
    var url = opts.url;
    if (!url) return;
    loadBlob({
      id: opts.id || 'external',
      name: opts.title || opts.name || 'Custom',
      url: url,
      file: opts.file || null
    }, opts.autoplay !== false);
  };

  function installPlayerHooks() {
    if (hooked) return;
    if (typeof attachMedia === 'function' && !attachMedia.__orbitCustom) {
      var origAttach = attachMedia;
      function wrappedAttach(t) {
        if (window.__ORBIT_CUSTOM_ACTIVE__) return;
        return origAttach(t);
      }
      wrappedAttach.__orbitCustom = true;
      attachMedia = wrappedAttach;
    }
    if (typeof loadTrack === 'function' && !loadTrack.__orbitCustom) {
      var origLoad = loadTrack;
      function wrappedLoad(idx, autoplay) {
        window.__ORBIT_CUSTOM_ACTIVE__ = false;
        clearActiveRows();
        return origLoad(idx, autoplay);
      }
      wrappedLoad.__orbitCustom = true;
      loadTrack = wrappedLoad;
    }
    if (typeof stepTrack === 'function' && !stepTrack.__orbitCustom) {
      var origStep = stepTrack;
      function wrappedStep(dir, opts) {
        if (window.__ORBIT_CUSTOM_ACTIVE__) return stepCustom(dir, opts);
        return origStep(dir, opts);
      }
      wrappedStep.__orbitCustom = true;
      stepTrack = wrappedStep;
    }
    var audio = audioEl();
    if (audio && !audio._orbitCustomEnded) {
      audio._orbitCustomEnded = true;
      audio.addEventListener('ended', function (e) {
        if (!window.__ORBIT_CUSTOM_ACTIVE__) return;
        try { e.stopImmediatePropagation(); } catch (err) {}
        endedCustom();
      }, true);
    }
    hooked = true;
  }

  function updateCount() {
    var el = document.getElementById('custom-count');
    if (el) el.textContent = library.length ? String(library.length) : '';
  }

  function renderPlaylists() {
    var host = document.getElementById('custom-pl-list');
    var allBtn = document.getElementById('custom-pl-all');
    if (allBtn) allBtn.classList.toggle('is-on', queueMode === 'all');
    if (!host) return;
    host.innerHTML = '';
    for (var i = 0; i < playlists.length; i++) {
      (function (pl) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'custom-pl-chip' + (queueMode === 'playlist' && activePlaylistId === pl.id ? ' is-on' : '');
        b.textContent = pl.name;
        b.title = pl.trackIds.length + ' tracks';
        b.addEventListener('click', function () {
          queueMode = 'playlist';
          activePlaylistId = pl.id;
          renderPlaylists();
          renderList();
        });
        host.appendChild(b);
      })(playlists[i]);
    }
  }

  function activePlaylist() {
    if (queueMode !== 'playlist' || !activePlaylistId) return null;
    for (var i = 0; i < playlists.length; i++) {
      if (playlists[i].id === activePlaylistId) return playlists[i];
    }
    return null;
  }

  function addToPlaylist(entryId) {
    var pl = activePlaylist();
    if (!pl) return;
    if (pl.trackIds.indexOf(entryId) === -1) pl.trackIds.push(entryId);
    renderPlaylists();
    renderList();
  }

  function renderList() {
    var list = document.getElementById('custom-list');
    if (!list) return;
    list.innerHTML = '';
    var needle = searchNeedle();
    var q = currentQueue();
    var shown = [];
    var i, entry;
    var source = (queueMode === 'playlist') ? q : (function () {
      var ids = [];
      for (i = 0; i < library.length; i++) ids.push(library[i].id);
      return ids;
    })();
    for (i = 0; i < source.length; i++) {
      entry = findEntry(source[i]);
      if (!entry) continue;
      if (needle && entry.name.toLowerCase().indexOf(needle) === -1) continue;
      shown.push(entry);
    }
    if (!shown.length) {
      var empty = document.createElement('p');
      empty.className = 'custom-empty';
      empty.textContent = library.length ? 'No matches' : 'Import a file or folder';
      list.appendChild(empty);
      updateCount();
      return;
    }
    var pl = activePlaylist();
    for (i = 0; i < shown.length; i++) {
      (function (ent) {
        var bits = splitName(ent.name);
        var row = document.createElement('div');
        row.className = 'custom-item' + (ent.id === activeId ? ' active' : '');
        row.dataset.id = String(ent.id);
        row.setAttribute('role', 'button');
        row.tabIndex = 0;

        var meta = document.createElement('div');
        meta.className = 'custom-item-meta';
        var name = document.createElement('p');
        name.className = 'custom-item-name';
        name.textContent = bits.title;
        var artist = document.createElement('p');
        artist.className = 'custom-item-artist';
        artist.textContent = bits.artist;
        meta.appendChild(name);
        meta.appendChild(artist);

        var playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'custom-item-play';
        playBtn.title = 'Play';
        playBtn.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
        playBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          loadBlob(ent, true);
        });

        row.appendChild(meta);
        if (pl) {
          var addBtn = document.createElement('button');
          addBtn.type = 'button';
          addBtn.className = 'custom-item-add';
          addBtn.title = pl.trackIds.indexOf(ent.id) >= 0 ? 'In playlist' : 'Add to playlist';
          addBtn.innerHTML = '<span class="material-symbols-outlined">' + (pl.trackIds.indexOf(ent.id) >= 0 ? 'check' : 'playlist_add') + '</span>';
          addBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            addToPlaylist(ent.id);
          });
          row.appendChild(addBtn);
        }
        row.appendChild(playBtn);
        row.addEventListener('click', function () {
          loadBlob(ent, true);
        });
        row.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            loadBlob(ent, true);
          }
        });
        list.appendChild(row);
      })(shown[i]);
    }
    updateCount();
  }

  function addFiles(fileList) {
    if (!fileList || !fileList.length) return;
    var added = 0;
    for (var i = 0; i < fileList.length; i++) {
      var file = fileList[i];
      if (!isAudioFile(file)) continue;
      var url = URL.createObjectURL(file);
      library.push({
        id: ++idSeq,
        name: displayName(file),
        url: url,
        file: file
      });
      added++;
    }
    if (added) {
      renderList();
      renderPlaylists();
    }
  }

  function newPlaylist() {
    var name = window.prompt('Playlist name', 'Playlist ' + (playlists.length + 1));
    if (name == null) return;
    name = String(name).trim();
    if (!name) return;
    var pl = { id: ++plSeq, name: name, trackIds: [] };
    playlists.push(pl);
    queueMode = 'playlist';
    activePlaylistId = pl.id;
    renderPlaylists();
    renderList();
  }

  function wipeLibrary() {
    var audio = audioEl();
    var currentSrc = audio ? (audio.currentSrc || audio.src || '') : '';
    for (var i = 0; i < library.length; i++) {
      try { URL.revokeObjectURL(library[i].url); } catch (e) {}
    }
    library = [];
    playlists = [];
    activeId = null;
    queueMode = 'all';
    activePlaylistId = null;
    window.__ORBIT_CUSTOM_ACTIVE__ = false;
    if (audio && currentSrc.indexOf('blob:') === 0) {
      try { audio.pause(); } catch (e2) {}
      try {
        audio.removeAttribute('src');
        audio.src = '';
        audio.load();
      } catch (e3) {}
      setPlaying(false);
      setTitles('—', 'Select a track');
      var fpTitle = document.getElementById('fp-title');
      if (fpTitle) fpTitle.textContent = 'No Track';
    }
    renderPlaylists();
    renderList();
  }

  function wireUi() {
    var fileBtn = document.getElementById('custom-file-btn');
    var folderBtn = document.getElementById('custom-folder-btn');
    var clearBtn = document.getElementById('custom-clear-btn');
    var fileInput = document.getElementById('custom-file-input');
    var folderInput = document.getElementById('custom-folder-input');
    var closeBtn = document.getElementById('close-custom');
    var search = document.getElementById('custom-search');
    var allBtn = document.getElementById('custom-pl-all');
    var newBtn = document.getElementById('custom-pl-new');

    if (folderInput) {
      folderInput.setAttribute('webkitdirectory', '');
      folderInput.setAttribute('directory', '');
      folderInput.multiple = true;
      try { folderInput.webkitdirectory = true; } catch (e) {}
    }

    if (fileBtn && fileInput) {
      fileBtn.addEventListener('click', function () { fileInput.click(); });
      fileInput.addEventListener('change', function () {
        addFiles(fileInput.files);
        fileInput.value = '';
      });
    }
    if (folderBtn && folderInput) {
      folderBtn.addEventListener('click', function () { folderInput.click(); });
      folderInput.addEventListener('change', function () {
        addFiles(folderInput.files);
        folderInput.value = '';
      });
    }
    if (clearBtn) clearBtn.addEventListener('click', wipeLibrary);
    if (search) {
      search.addEventListener('input', function () { renderList(); });
    }
    if (allBtn) {
      allBtn.addEventListener('click', function () {
        queueMode = 'all';
        activePlaylistId = null;
        renderPlaylists();
        renderList();
      });
    }
    if (newBtn) newBtn.addEventListener('click', newPlaylist);

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        if (typeof closeWin === 'function') {
          closeWin('custom-win', 'btn-custom', 'btn-mob-custom');
        } else {
          var w = document.getElementById('custom-win');
          if (w) w.style.display = 'none';
        }
      });
    }

    if (typeof makeWindowDraggable === 'function') {
      makeWindowDraggable('custom-win', 'custom-bar');
    }

    document.addEventListener('keydown', function (e) {
      if (!window.__ORBIT_CUSTOM_ACTIVE__) return;
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        e.stopPropagation();
        stepCustom(1, { wrap: true, autoplay: typeof isPlaying !== 'undefined' ? isPlaying : true });
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        e.stopPropagation();
        var a = audioEl();
        if (a && a.currentTime > 3) { a.currentTime = 0; return; }
        stepCustom(-1, { wrap: true, autoplay: typeof isPlaying !== 'undefined' ? isPlaying : true });
      }
    }, true);

    renderPlaylists();
    renderList();
  }

  function boot() {
    installPlayerHooks();
    wireUi();
  }

  window.addEventListener('pagehide', wipeLibrary);
  window.addEventListener('beforeunload', wipeLibrary);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
