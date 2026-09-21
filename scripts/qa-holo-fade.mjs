import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const out = path.join(process.cwd(), 'tmp-qa-holo-fade');
fs.mkdirSync(out, { recursive: true });
const chrome = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((p) => fs.existsSync(p));
if (!chrome) throw new Error('No Chrome/Edge found');

const browser = await chromium.launch({ headless: true, executablePath: chrome });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('page: ' + String(e)));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push('cons: ' + msg.text()); });
await page.addInitScript(() => localStorage.setItem('orbitSkin', 'holo'));
await page.goto('http://localhost:3456/?qa=holo-fade-before', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2200);

async function probe() {
  return page.evaluate(() => {
    const tubes = document.getElementById('holo-tubes');
    const wins = [...document.querySelectorAll('.win')].filter((el) => {
      const st = getComputedStyle(el);
      return st.display !== 'none' && st.visibility !== 'hidden' && el.offsetWidth > 12;
    });
    const csTubes = tubes ? getComputedStyle(tubes) : null;
    const hides = tubes ? [...tubes.querySelectorAll('.holo-tube-cornerhide, .holo-tube-cornerhide-core')] : [];
    return {
      holo: document.documentElement.classList.contains('theme-holo'),
      htmlClass: document.documentElement.className,
      tubes: tubes && {
        z: csTubes.zIndex,
        display: csTubes.display,
        pointer: csTubes.pointerEvents,
        w: tubes.getAttribute('width'),
        h: tubes.getAttribute('height'),
        viewBox: tubes.getAttribute('viewBox'),
        filter: !!tubes.querySelector('#holo-corner-fade'),
        hideCount: hides.length,
        hideFill: hides[0] && getComputedStyle(hides[0]).fill,
        hideRule: hides[0] && hides[0].getAttribute('fill-rule'),
        hideDLen: hides[0] && (hides[0].getAttribute('d') || '').length,
        hideFilter: hides.find((p) => p.classList.contains('holo-tube-cornerhide')) &&
          getComputedStyle(hides.find((p) => p.classList.contains('holo-tube-cornerhide'))).filter
      },
      wins: wins.map((el) => {
        const r = el.getBoundingClientRect();
        const sl = el.style.left;
        const st = el.style.top;
        const left = (sl && sl.indexOf('px') !== -1) ? parseFloat(sl) : NaN;
        const top = (st && st.indexOf('px') !== -1) ? parseFloat(st) : NaN;
        const box = {
          left: Number.isFinite(left) ? left : (el.offsetLeft || 0),
          top: Number.isFinite(top) ? top : (el.offsetTop || 0),
          width: el.offsetWidth || 0,
          height: el.offsetHeight || 0
        };
        const cs = getComputedStyle(el);
        return {
          id: el.id,
          vis: { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
          box,
          dx: +(r.left - box.left).toFixed(1),
          dy: +(r.top - box.top).toFixed(1),
          dw: +(r.width - box.width).toFixed(1),
          dh: +(r.height - box.height).toFixed(1),
          radius: cs.borderRadius,
          overflow: cs.overflow,
          bg: cs.backgroundColor,
          z: cs.zIndex,
          transform: cs.transform,
          contain: cs.contain
        };
      })
    };
  });
}

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

const home = await probe();
console.log('HOME', JSON.stringify(home, null, 2));
await page.screenshot({ path: path.join(out, '01-home.png') });
await shotCorners('01');

await page.locator('#btn-player').click({ force: true });
await page.waitForTimeout(500);
const player = await probe();
console.log('PLAYER', JSON.stringify(player.wins, null, 2));
await page.screenshot({ path: path.join(out, '02-player.png') });
await shotCorners('02');

await page.locator('#btn-gallery').click({ force: true });
await page.waitForTimeout(500);
const gallery = await probe();
console.log('GALLERY', JSON.stringify(gallery.wins, null, 2));
await page.screenshot({ path: path.join(out, '03-gallery.png') });
await shotCorners('03');

await page.locator('#btn-tracklist').click({ force: true });
await page.waitForTimeout(500);
const tracks = await probe();
console.log('TRACKS', JSON.stringify(tracks.wins, null, 2));
await page.screenshot({ path: path.join(out, '04-tracks.png') });
await shotCorners('04');

console.log('ERRORS', JSON.stringify(errors, null, 2));
await browser.close();
