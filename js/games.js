/* ============================================
   ORBIT PLAYER — games.js
   Games library viewer (Spawn link-out cards)
   ============================================ */

const GAMES = [
  {
    slug: 'demoboy-the-madness-within',
    title: 'DemoBoy: The Madness Within',
    genre: 'Action / Adventure',
    platform: 'Spawn',
    description: 'Swing, grind, dive, and unleash beast mode across Arcadya.',
    cover: 'images/games/demoboy.svg',
    url: 'https://www.spawn.co/@anchorturtle/demoboy-the-madness-within',
    status: 'live'
  },
  {
    slug: 'paint-haven',
    title: 'Paint Haven',
    genre: 'Painting / Exploration',
    platform: 'Spawn',
    description: "A painter's easel on a windy chalk cliff — load your brush and paint the sea.",
    cover: 'images/games/paint-haven.svg',
    url: 'https://www.spawn.co/@anchorturtle/paint-haven',
    status: 'live'
  }
];
window.ORBIT_GAMES = GAMES;

function escapeGameHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderGames() {
  const list = document.getElementById('games-list');
  const countEl = document.getElementById('games-count');
  if (!list) return;

  if (countEl) {
    countEl.textContent = `${GAMES.length} ${GAMES.length === 1 ? 'game' : 'games'}`;
  }

  list.innerHTML = '';
  GAMES.forEach((game) => {
    const card = document.createElement('article');
    card.className = 'game-card';
    card.dataset.slug = game.slug;

    const hasUrl = Boolean(game.url);
    const metaText = [game.genre, game.platform].filter(Boolean).join(' · ');
    const coverHtml = hasUrl
      ? `<a class="game-card-cover-wrap" href="${escapeGameHtml(game.url)}" target="_blank" rel="noopener noreferrer" aria-label="Play ${escapeGameHtml(game.title)} on Spawn">
           <img class="game-card-cover" src="${escapeGameHtml(game.cover)}" alt="${escapeGameHtml(game.title)}" loading="lazy">
         </a>`
      : `<div class="game-card-cover-wrap">
           <img class="game-card-cover" src="${escapeGameHtml(game.cover)}" alt="${escapeGameHtml(game.title)}" loading="lazy">
         </div>`;

    const ctaHtml = hasUrl
      ? `<a class="game-play-btn" href="${escapeGameHtml(game.url)}" target="_blank" rel="noopener noreferrer">
           <span class="material-symbols-outlined">play_arrow</span>
           <span>Play on Spawn</span>
         </a>`
      : `<span class="game-coming-soon">Coming soon</span>`;

    card.innerHTML = `
      ${coverHtml}
      <div class="game-card-body">
        <div class="game-card-head">
          <div class="game-card-titles">
            <h3 class="game-card-title">${escapeGameHtml(game.title)}</h3>
            <p class="game-card-meta">${escapeGameHtml(metaText)}</p>
          </div>
          ${ctaHtml}
        </div>
        <p class="game-card-desc">${escapeGameHtml(game.description)}</p>
      </div>
    `;
    list.appendChild(card);
  });

  const note = document.createElement('p');
  note.className = 'games-footer-note';
  note.textContent = 'Opens in a new tab on Spawn.';
  list.appendChild(note);
}

window.renderGames = renderGames;
