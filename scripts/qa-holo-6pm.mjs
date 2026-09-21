import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const out = path.join(process.cwd(), 'tmp-qa-holo-6pm');
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
await page.goto('http://localhost:3456/?qa=h40', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2200);

const metrics = await page.evaluate(() => {
  const html = document.documentElement;
  const tubes = document.getElementById('holo-tubes');
  const plates = document.getElementById('holo-plates');
  const dock = document.getElementById('dock-win');
  const pl = document.getElementById('player-win');
  const cs = (el) => el ? getComputedStyle(el) : null;
  const glass = tubes ? [...tubes.querySelectorAll('path.holo-tube-glass')] : [];
  const plasma = tubes ? tubes.querySelectorAll('path.holo-tube-plasma').length : 0;
  const sway = cs(document.querySelector('.ctrl-btn'));
  return {
    holo: html.classList.contains('theme-holo'),
    tubesVer: tubes && tubes.getAttribute('data-holo-tubes'),
    plates: !!plates,
    glass: glass.length,
    plasma,
    ember: tubes ? tubes.querySelectorAll('circle.holo-tube-ember').length : 0,
    hud: document.querySelectorAll('#holo-hud .holo-hud-wave').length,
    winTransform: cs(pl) && cs(pl).transform,
    dockClip: dock && (dock.style.clipPath || ''),
    playerClip: pl && (pl.style.clipPath || '').slice(0, 40),
    glassStroke: glass[0] ? cs(glass[0]).strokeWidth : null,
    plasmaFill: tubes && tubes.querySelector('.holo-tube-plasma')
      ? cs(tubes.querySelector('.holo-tube-plasma')).fill
      : null,
    btnRotate: sway && sway.transform
  };
});
console.log('METRICS', JSON.stringify(metrics, null, 2));
console.log('ERRORS', errors);

await page.screenshot({ path: path.join(out, '01-home.png') });

const player = page.locator('#player-win');
const pbox = await player.boundingBox();
if (pbox) {
  await page.screenshot({
    path: path.join(out, '02-player.png'),
    clip: {
      x: Math.max(0, pbox.x - 24),
      y: Math.max(0, pbox.y - 24),
      width: Math.min(1440, pbox.width + 48),
      height: Math.min(900, pbox.height + 48)
    }
  });
}

const dock = page.locator('#dock-win');
const dbox = await dock.boundingBox();
if (dbox) {
  await page.screenshot({
    path: path.join(out, '03-dock.png'),
    clip: {
      x: Math.max(0, dbox.x - 24),
      y: Math.max(0, dbox.y - 24),
      width: Math.min(1440, dbox.width + 48),
      height: Math.min(900, dbox.height + 48)
    }
  });
}

await browser.close();
if (errors.length) process.exitCode = 1;
