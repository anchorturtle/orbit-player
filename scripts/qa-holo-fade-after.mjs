import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const out = path.join(process.cwd(), 'tmp-qa-holo-fade-after');
fs.mkdirSync(out, { recursive: true });
const chrome = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((p) => fs.existsSync(p));
if (!chrome) throw new Error('No Chrome/Edge found');

const browser = await chromium.launch({
  headless: true,
  executablePath: chrome,
  args: ['--disable-http-cache']
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('page: ' + String(e)));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push('cons: ' + msg.text()); });
await page.addInitScript(() => localStorage.setItem('orbitSkin', 'holo'));
await page.goto('http://localhost:3456/?v=20260824h25', { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate(() => location.reload(true));
await page.waitForTimeout(2500);

const probe = await page.evaluate(() => {
  const tubes = document.getElementById('holo-tubes');
  const hide = tubes && tubes.querySelector('.holo-tube-platehide');
  const wins = [...document.querySelectorAll('.win')].filter((el) => {
    const st = getComputedStyle(el);
    return st.display !== 'none' && st.visibility !== 'hidden' && el.offsetWidth > 12;
  });
  const win = document.getElementById('tracklist-win');
  const r = win.getBoundingClientRect();
  function hit(el, x, y) {
    if (!el || !el.isPointInFill) return null;
    try { return el.isPointInFill(new DOMPoint(x, y)); } catch (e) { return String(e); }
  }
  return {
    holo: document.documentElement.classList.contains('theme-holo'),
    version: tubes && tubes.getAttribute('data-holo-tubes'),
    css: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href).filter((h) => h.includes('holo')),
    js: [...document.querySelectorAll('script')].map((s) => s.src).filter((h) => h.includes('holo-fx')),
    hideCount: tubes ? tubes.querySelectorAll('.holo-tube-platehide').length : 0,
    blurFilter: !!(tubes && tubes.querySelector('#holo-corner-fade')),
    clips: wins.map((el) => ({ id: el.id, clip: (el.style.clipPath || '').slice(0, 48) })),
    hideCS: hide && {
      fill: getComputedStyle(hide).fill,
      filter: getComputedStyle(hide).filter,
      fillRule: getComputedStyle(hide).fillRule
    },
    hits: hide && {
      corner: hit(hide, r.left + 2, r.top + 2),
      center: hit(hide, r.left + r.width / 2, r.top + r.height / 2),
      outside14: hit(hide, r.left - 10, r.top + r.height / 2),
      far: hit(hide, 10, 10)
    },
    wins: wins.map((el) => el.id)
  };
});
console.log(JSON.stringify(probe, null, 2));

async function shotCorners(prefix) {
  const rects = await page.evaluate(() => {
    return [...document.querySelectorAll('.win')].flatMap((el) => {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || el.offsetWidth < 12) return [];
      const r = el.getBoundingClientRect();
      const pad = 28;
      const s = 86;
      return [
        { id: el.id, corner: 'nw', x: r.left - pad, y: r.top - pad, w: s, h: s },
        { id: el.id, corner: 'ne', x: r.right - s + pad, y: r.top - pad, w: s, h: s },
        { id: el.id, corner: 'sw', x: r.left - pad, y: r.bottom - s + pad, w: s, h: s },
        { id: el.id, corner: 'se', x: r.right - s + pad, y: r.bottom - s + pad, w: s, h: s }
      ];
    });
  });
  for (const c of rects) {
    const x = Math.max(0, Math.min(1440 - 10, c.x));
    const y = Math.max(0, Math.min(900 - 10, c.y));
    const w = Math.min(c.w, 1440 - x);
    const h = Math.min(c.h, 900 - y);
    if (w < 20 || h < 20) continue;
    await page.screenshot({
      path: path.join(out, `${prefix}-${c.id}-${c.corner}.png`),
      clip: { x, y, width: w, height: h }
    });
  }
}

await page.screenshot({ path: path.join(out, '01-home.png') });
await shotCorners('01');

async function showOnly(id) {
  await page.evaluate((keep) => {
    document.querySelectorAll('.win').forEach((w) => {
      if (w.id === 'dock-win') return;
      w.style.display = (w.id === keep) ? 'flex' : 'none';
    });
  }, id);
  await page.waitForTimeout(400);
}

await showOnly('player-win');
await page.screenshot({ path: path.join(out, '02-player.png') });
await shotCorners('02');

await showOnly('gallery-win');
await page.screenshot({ path: path.join(out, '03-gallery.png') });
await shotCorners('03');

await showOnly('tracklist-win');
await page.screenshot({ path: path.join(out, '04-tracks.png') });
await shotCorners('04');

console.log('ERRORS', JSON.stringify(errors, null, 2));
await browser.close();
