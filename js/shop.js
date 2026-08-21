/* ============================================
   ORBIT PLAYER — shop.js
   Centered 4:3 merch window + Fourthwall-safe
   Tee / Mug / Poster preview.
   ============================================ */

const SHOP_STORE_KEY = 'orbit-shop-store-url';
const SHOP_SETUP_KEY = 'orbit-shop-setup-open';

let _shopSrc = '';
let _shopProduct = 'tee';
let _shopTeeColor = 'black';
let _shopMugColor = 'wgm78-white';

function shopBasename(src) {
  const part = String(src || '').split('/').pop() || 'artwork';
  return part.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
}

function shopDisplayName(src) {
  const cfg = window.SHOP_CONFIG || {};
  return (cfg.names && cfg.names[src]) || shopBasename(src);
}

function shopIsGif(src) {
  return /\.gif$/i.test(src || '');
}

function shopIsSellable(src) {
  const cfg = window.SHOP_CONFIG || {};
  const skip = (cfg.exclude || []).map(s => s.toLowerCase());
  if (!src) return false;
  if (shopIsGif(src)) return false;
  if (skip.includes(String(src).toLowerCase())) return false;
  return true;
}

function shopLatestSrc() {
  if (typeof GALLERY === 'undefined') return '';
  for (let i = GALLERY.length - 1; i >= 0; i--) {
    if (shopIsSellable(GALLERY[i].src)) return GALLERY[i].src;
  }
  return '';
}

function shopCatalog() {
  if (typeof GALLERY === 'undefined') return [];
  return GALLERY.filter(g => shopIsSellable(g.src)).slice().reverse();
}

function shopNormalizeUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  try {
    const u = new URL(s.includes('://') ? s : 'https://' + s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
    return u.href.replace(/\/+$/, '');
  } catch (e) {
    return '';
  }
}

function shopConfiguredStoreUrl() {
  const cfg = window.SHOP_CONFIG || {};
  try {
    const local = shopNormalizeUrl(localStorage.getItem(SHOP_STORE_KEY) || '');
    if (local) return local;
  } catch (e) { /* ignore */ }
  return shopNormalizeUrl(cfg.storeUrl);
}

function shopSaveStoreUrl(raw) {
  const url = shopNormalizeUrl(raw);
  try {
    if (url) localStorage.setItem(SHOP_STORE_KEY, url);
    else localStorage.removeItem(SHOP_STORE_KEY);
  } catch (e) { /* private mode */ }
  return url;
}

function shopProductUrl() {
  const cfg = window.SHOP_CONFIG || {};
  const map = cfg.products && cfg.products[_shopSrc];
  if (typeof map === 'string' && map) return map;
  if (map && typeof map === 'object') {
    return map[_shopProduct] || map.tee || map.default || '';
  }
  return shopConfiguredStoreUrl();
}

function shopKindMeta() {
  const cfg = window.SHOP_CONFIG || {};
  return (cfg.kinds || []).find(k => k.id === _shopProduct) || { id: 'tee', label: 'Tee', sku: 'Bella+Canvas 3001', print: 'Front DTG chest' };
}

function shopSetupOpen() {
  try { return localStorage.getItem(SHOP_SETUP_KEY) === '1'; } catch (e) { return false; }
}

function applyShopLayout() {
  if (typeof isMob === 'function' && isMob()) return;
  const win = document.getElementById('shop-win');
  if (!win || win.dataset.userPositioned === 'true') return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const dock = document.getElementById('dock-win');
  const dockH = dock ? dock.offsetHeight : 70;
  const maxW = Math.min(720, vw - 40);
  const maxH = Math.max(280, vh - dockH - 28);
  let w = Math.min(820, vw - 40);
  let h = w * 0.72;
  if (h > maxH) {
    h = maxH;
    w = Math.min(maxW, h / 0.72);
  }
  w = Math.max(520, w);
  h = Math.max(360, h);
  win.style.width = Math.round(w) + 'px';
  win.style.height = Math.round(h) + 'px';
  win.style.left = Math.round((vw - w) / 2) + 'px';
  win.style.top = Math.round(Math.max(12, (vh - dockH - h) / 2)) + 'px';
  win.style.bottom = '';
  win.style.right = '';
}

function shopSync3D() {
  const api = window.OrbitShop3D;
  if (!api) return;
  api.setProduct(_shopProduct);
  api.setArt(_shopSrc);
  const cfg = window.SHOP_CONFIG || {};
  if (_shopProduct === 'tee') {
    const c = (cfg.teeColors || []).find(x => x.id === _shopTeeColor) || (cfg.teeColors || [])[0];
    if (c) api.setTeeColor(c.hex);
  }
  if (_shopProduct === 'mug') {
    const c = (cfg.mugColors || []).find(x => x.id === _shopMugColor) || (cfg.mugColors || [])[0];
    if (c) api.setMugColor(c.hex);
  }
}

function openShop(src) {
  const win = document.getElementById('shop-win');
  if (!win) return;
  if (src && shopIsSellable(src)) _shopSrc = src;
  if (!_shopSrc) _shopSrc = shopLatestSrc();
  win.style.display = 'flex';
  if (typeof bringToFront === 'function') bringToFront('shop-win');
  document.getElementById('btn-shop')?.classList.add('win-open');
  document.getElementById('btn-mob-shop')?.classList.add('active');
  if (!isMob() && win.dataset.userPositioned !== 'true') applyShopLayout();
  renderShop();
  const canvas = document.getElementById('shop-3d-canvas');
  if (window.OrbitShop3D && canvas) {
    OrbitShop3D.start(canvas);
    shopSync3D();
    requestAnimationFrame(() => OrbitShop3D.resize());
  }
  if (typeof clampWindowToViewport === 'function') clampWindowToViewport(win, 8);
}

function closeShop() {
  if (window.OrbitShop3D) OrbitShop3D.stop();
  closeWin('shop-win', 'btn-shop', 'btn-mob-shop');
}

function renderShop() {
  const cfg = window.SHOP_CONFIG || {};
  const catalog = shopCatalog();
  if (!_shopSrc) _shopSrc = shopLatestSrc();

  const title = document.getElementById('shop-win-title');
  if (title) title.textContent = cfg.title || 'Merch';
  const count = document.getElementById('shop-art-count');
  if (count) count.textContent = catalog.length ? catalog.length + '/' + catalog.length : '';

  const kind = shopKindMeta();
  const nameEl = document.getElementById('shop-design-name');
  const skuEl = document.getElementById('shop-sku');
  if (nameEl) nameEl.textContent = _shopSrc ? shopDisplayName(_shopSrc) : 'Pick a drop';
  if (skuEl) skuEl.textContent = `${kind.sku} · ${kind.print}`;

  const kindsEl = document.getElementById('shop-kinds');
  if (kindsEl) {
    kindsEl.innerHTML = (cfg.kinds || []).map(k => {
      const on = k.id === _shopProduct ? ' active' : '';
      const icon = k.icon || 'checkroom';
      return `<button type="button" class="tab${on}" data-kind="${k.id}">
        <span class="material-symbols-outlined">${icon}</span>
        <span>${k.label}</span>
      </button>`;
    }).join('');
    kindsEl.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => {
        _shopProduct = btn.dataset.kind;
        renderShop();
        shopSync3D();
      });
    });
  }

  const colorsEl = document.getElementById('shop-colors');
  const colorWrap = document.getElementById('shop-colors-wrap');
  if (_shopProduct === 'poster') {
    if (colorWrap) colorWrap.hidden = true;
  } else {
    if (colorWrap) colorWrap.hidden = false;
    const list = _shopProduct === 'mug' ? (cfg.mugColors || []) : (cfg.teeColors || []);
    const cur = _shopProduct === 'mug' ? _shopMugColor : _shopTeeColor;
    if (colorsEl) {
      colorsEl.innerHTML = list.map(c => {
        const on = c.id === cur ? ' is-selected' : '';
        return `<button type="button" class="shop-swatch${on}" data-color="${c.id}" title="${c.label}${c.sku ? ' · ' + c.sku : ''}" style="--sw:${c.hex}"></button>`;
      }).join('');
      colorsEl.querySelectorAll('.shop-swatch').forEach(btn => {
        btn.addEventListener('click', () => {
          if (_shopProduct === 'mug') _shopMugColor = btn.dataset.color;
          else _shopTeeColor = btn.dataset.color;
          renderShop();
          shopSync3D();
        });
      });
    }
  }

  const order = document.getElementById('shop-order-btn');
  const url = shopProductUrl();
  if (order) {
    order.disabled = !url || !_shopSrc;
    order.innerHTML = `<span class="material-symbols-outlined">open_in_new</span> Open ${kind.label.toLowerCase()} in Fourthwall`;
  }

  const setup = document.getElementById('shop-setup');
  if (setup) setup.hidden = !shopSetupOpen();
  const urlInput = document.getElementById('shop-url-input');
  if (urlInput && !urlInput.matches(':focus')) urlInput.value = shopConfiguredStoreUrl();

  const rail = document.getElementById('shop-rail');
  if (rail) {
    const artist = cfg.artist || 'jestR';
    rail.innerHTML = catalog.map(g => {
      const on = g.src === _shopSrc ? ' active' : '';
      const name = shopDisplayName(g.src);
      return `<button type="button" class="track-item shop-art-item${on}" data-src="${g.src.replace(/"/g, '&quot;')}">
        <img class="album-head-art" src="${g.src}" alt="" loading="lazy"/>
        <div class="shop-art-copy">
          <p class="track-title">${name}</p>
          <p class="track-artist">${artist}</p>
        </div>
      </button>`;
    }).join('');
    rail.querySelectorAll('.shop-art-item').forEach(btn => {
      btn.addEventListener('click', () => {
        _shopSrc = btn.dataset.src;
        renderShop();
        shopSync3D();
      });
    });
  }
}

function shopCheckout() {
  const url = shopProductUrl();
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function shopFromHash() {
  const h = (location.hash || '').replace(/^#/, '');
  if (h === 'shop') { openShop(); return; }
  if (h.startsWith('shop/')) openShop(decodeURIComponent(h.slice(5)));
}

window.openShop = openShop;
window.closeShop = closeShop;
window.shopIsSellable = shopIsSellable;
window.renderShop = renderShop;
window.applyShopLayout = applyShopLayout;

document.getElementById('close-shop')?.addEventListener('click', closeShop);
document.getElementById('shop-order-btn')?.addEventListener('click', shopCheckout);
document.getElementById('shop-setup-toggle')?.addEventListener('click', () => {
  const next = !shopSetupOpen();
  try { localStorage.setItem(SHOP_SETUP_KEY, next ? '1' : '0'); } catch (e) {}
  renderShop();
});
document.getElementById('shop-url-save')?.addEventListener('click', () => {
  const input = document.getElementById('shop-url-input');
  shopSaveStoreUrl(input ? input.value : '');
  renderShop();
});
document.getElementById('shop-url-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('shop-url-save')?.click();
  }
});
shopFromHash();
