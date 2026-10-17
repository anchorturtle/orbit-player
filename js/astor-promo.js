/* ============================================
   ORBIT PLAYER — astor-promo.js
   Desktop-only Astor Academy promo card. Overlays (no layout shift, no dim),
   X or Esc closes, stays dismissed for the session.
   ============================================ */
(function () {
  var KEY = 'astorPromoDismissed';
  function dismissed() { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function mobile() { return (typeof isMob === 'function') ? isMob() : window.innerWidth < 768; }
  if (dismissed() || mobile()) return;

  function build() {
    if (dismissed() || mobile() || document.getElementById('astor-promo')) return;
    var card = document.createElement('div');
    card.id = 'astor-promo';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Astor Academy');
    card.innerHTML =
      '<button class="astor-promo-close" type="button" aria-label="Close" title="Close">' +
        '<span class="material-symbols-outlined">close</span></button>' +
      '<img class="astor-promo-mark" src="images/astor/astor-wordmark.svg" alt="Astor Academy" width="190" height="56">' +
      '<p class="astor-promo-line">A narrative-driven learning experience</p>' +
      '<a class="astor-promo-cta" href="https://astor.academy" target="_blank" rel="noopener">Visit Astor Academy</a>';
    document.body.appendChild(card);

    function close() {
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
      card.classList.remove('show');
      document.removeEventListener('keydown', onKey, true);
      setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 400);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    card.querySelector('.astor-promo-close').addEventListener('click', close);
    card.querySelector('.astor-promo-cta').addEventListener('click', function () { setTimeout(close, 0); });
    document.addEventListener('keydown', onKey, true);
    requestAnimationFrame(function () { requestAnimationFrame(function () { card.classList.add('show'); }); });
  }

  function start() { setTimeout(build, 1500); }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
})();
