import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const out = path.join(process.cwd(), 'tmp-qa-holo-trail');
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
page.on('pageerror', (e) => errors.push(String(e)));
await page.addInitScript(() => localStorage.setItem('orbitSkin', 'holo'));
await page.goto('http://localhost:3456/?qa=h42', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1800);

const idle = await page.evaluate(() => {
  const tubes = document.getElementById('holo-tubes');
  const dock = document.getElementById('dock-win');
  const btn = document.getElementById('btn-player');
  const d = dock.getBoundingClientRect();
  const b = btn.getBoundingClientRect();
  return {
    ticks: tubes.querySelectorAll('.holo-tube-tick').length,
    grads: tubes.querySelectorAll('radialGradient').length,
    ember: tubes.querySelectorAll('.holo-tube-ember').length,
    dockClip: dock.style.clipPath || getComputedStyle(dock).clipPath,
    dockOverflow: getComputedStyle(dock).overflow,
    bodyOverflow: getComputedStyle(dock.querySelector('.win-body')).overflow,
    btnInside:
      b.left >= d.left - 1 &&
      b.right <= d.right + 1 &&
      b.top >= d.top - 1 &&
      b.bottom <= d.bottom + 1,
    btnPadTop: b.top - d.top,
    btnPadBot: d.bottom - b.bottom,
    btnPadLeft: b.left - d.left
  };
});
console.log('IDLE', JSON.stringify(idle, null, 2));

await page.screenshot({ path: path.join(out, '01-home.png') });

const dock = page.locator('#dock-win');
const dbox = await dock.boundingBox();
if (dbox) {
  await page.screenshot({
    path: path.join(out, '02-dock.png'),
    clip: {
      x: Math.max(0, dbox.x - 28),
      y: Math.max(0, dbox.y - 28),
      width: Math.min(1440, dbox.width + 56),
      height: Math.min(900, dbox.height + 56)
    }
  });
}

await page.locator('#player-win').hover();
await page.waitForTimeout(200);
const hovered = await page.evaluate(() => {
  const tubes = document.getElementById('holo-tubes');
  return {
    ticks: tubes.querySelectorAll('.holo-tube-tick').length,
    grads: tubes.querySelectorAll('radialGradient').length
  };
});
console.log('HOVER PLAYER', hovered);

const pbox = await page.locator('#player-win').boundingBox();
if (pbox) {
  await page.screenshot({
    path: path.join(out, '03-player-hover.png'),
    clip: {
      x: Math.max(0, pbox.x - 28),
      y: Math.max(0, pbox.y - 28),
      width: Math.min(1440, pbox.width + 56),
      height: Math.min(900, pbox.height + 56)
    }
  });
}

await page.locator('#btn-tracklist').hover({ force: true, timeout: 3000 });
await page.waitForTimeout(200);
const dockHover = await page.evaluate(() => {
  const dock = document.getElementById('dock-win');
  const btn = document.getElementById('btn-tracklist');
  const d = dock.getBoundingClientRect();
  const b = btn.getBoundingClientRect();
  return {
    ticks: document.querySelectorAll('#holo-tubes .holo-tube-tick').length,
    btnInside:
      b.left >= d.left - 2 &&
      b.right <= d.right + 2 &&
      b.top >= d.top - 2 &&
      b.bottom <= d.bottom + 2,
    scale: getComputedStyle(btn).transform
  };
});
console.log('HOVER DOCK BTN', dockHover);
if (dbox) {
  await page.screenshot({
    path: path.join(out, '04-dock-hover.png'),
    clip: {
      x: Math.max(0, dbox.x - 28),
      y: Math.max(0, dbox.y - 28),
      width: Math.min(1440, dbox.width + 56),
      height: Math.min(900, dbox.height + 56)
    }
  });
}

console.log('ERRORS', errors);
await browser.close();
if (errors.length) process.exitCode = 1;
