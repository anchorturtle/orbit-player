/**
 * Orbit 2.0 flag — must run after utils.js, before main.js (prevents v1 layout flash).
 * Default: v2 on localhost; production until cutover uses v1 unless ?v=2 or stored preference.
 */
(function () {
  var params = new URLSearchParams(window.location.search);
  var host = window.location.hostname;
  var local = host === 'localhost' || host === '127.0.0.1' || host === '';
  var stored = null;
  try {
    stored = localStorage.getItem('orbitExperience');
  } catch (_) {}

  if (params.get('v') === '1' || stored === '1') {
    document.documentElement.classList.add('orbit-v1');
    return;
  }

  var enable =
    params.get('v') === '2' ||
    params.get('experience') === '2' ||
    stored === '2' ||
    (local && stored !== '1');

  if (!enable) return;

  document.documentElement.classList.add('orbit-v2', 'orbit-v2-3d');
  if (stored !== '2') {
    try {
      localStorage.setItem('orbitExperience', '2');
    } catch (_) {}
  }
})();