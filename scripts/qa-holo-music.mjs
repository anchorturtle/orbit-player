import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const out = path.join(process.cwd(), 'tmp-qa-holo-music');
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
await page.goto('http://localhost:3456/?v=20260824h19', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2800);

const metrics = await page.evaluate(() => {
  const html = document.documentElement;
  const tubes = document.getElementById('holo-tubes');
  const dock = document.getElementById('dock-win');
  const gal = document.getElementById('gallery-win');
  const pl = document.getElementById('player-win');
  const cs = (el) => el ? getComputedStyle(el) : null;
  const play = document.querySelector('#btn-play');
  const handle = gal && gal.querySelector('.win-resize.e');
  return {
    holo: html.classList.contains('theme-holo'),
    winTransform: cs(pl) && cs(pl).transform,
    perspective: cs(document.body) && cs(document.body).perspective,
    tubesZ: tubes && cs(tubes).zIndex,
    tubesPe: tubes && cs(tubes).pointerEvents,
    dockZ: dock && cs(dock).zIndex,
    galZ: gal && cs(gal).zIndex,
    handlePe: handle && cs(handle).pointerEvents,
    handleW: handle && cs(handle).width,
    handleDisp: handle && cs(handle).display,
    playRadius: play && cs(play).borderRadius,
    playBorder: play && cs(play).border,
    playSize: play && { w: play.offsetWidth, h: play.offsetHeight },
    uiScale: html.style.getPropertyValue('--holo-ui-scale'),
    paths: tubes ? tubes.querySelectorAll('path.holo-tube-glass').length : 0,
    hide: tubes ? tubes.querySelectorAll('path.holo-tube-cornerhide').length : 0,
    core: tubes ? tubes.querySelectorAll('path.holo-tube-cornerhide-core').length : 0
  };
});
console.log('METRICS', JSON.stringify(metrics, null, 2));

await page.screenshot({ path: path.join(out, '01-home.png') });

const player = page.locator('#player-win');
const pbox = await player.boundingBox();
if (pbox) {
  await page.screenshot({
    path: path.join(out, '02-player.png'),
    clip: {
      x: Math.max(0, pbox.x - 16),
      y: Math.max(0, pbox.y - 16),
      width: Math.min(1440, pbox.width + 32),
      height: Math.min(900, pbox.height + 32)
    }
  });
}

const gal = page.locator('#gallery-win');
const gbox = await gal.boundingBox();
if (gbox) {
  await page.screenshot({
    path: path.join(out, '03-gallery.png'),
    clip: {
      x: Math.max(0, gbox.x - 16),
      y: Math.max(0, gbox.y - 16),
      width: Math.min(1440, gbox.width + 32),
      height: Math.min(900, gbox.height + 32)
    }
  });
}

const dock = page.locator('#dock-win');
const dbox = await dock.boundingBox();
if (dbox) {
  await page.screenshot({
    path: path.join(out, '04-nav.png'),
    clip: {
      x: Math.max(0, dbox.x - 24),
      y: Math.max(0, dbox.y - 24),
      width: Math.min(1440, dbox.width + 48),
      height: Math.min(200, dbox.height + 48)
    }
  });
}

const beforeW = await page.evaluate(() => document.getElementById('gallery-win').offsetWidth);
const handle = page.locator('#gallery-win .win-resize.e');
const hbox = await handle.boundingBox();
console.log('HANDLE', JSON.stringify(hbox), 'beforeW', beforeW);
if (hbox) {
  await page.mouse.move(hbox.x + hbox.width / 2, hbox.y + hbox.height / 2);
  await page.mouse.down();
  await page.mouse.move(hbox.x + 70, hbox.y + hbox.height / 2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(200);
}
const afterW = await page.evaluate(() => document.getElementById('gallery-win').offsetWidth);
console.log('RESIZE', JSON.stringify({ beforeW, afterW, delta: afterW - beforeW }));

await page.evaluate(() => {
  window.__ORBIT_AUDIO__ = { bass: 0.92, level: 0.78, stim: 0.88 };
});
await page.waitForTimeout(350);
const stim = await page.evaluate(() => ({
  scale: document.documentElement.style.getPropertyValue('--holo-ui-scale'),
  soft: document.documentElement.style.getPropertyValue('--holo-ui-scale-soft'),
  stim: document.documentElement.style.getPropertyValue('--holo-stim')
}));
console.log('STIM', JSON.stringify(stim));
await page.screenshot({ path: path.join(out, '05-music-stim.png') });

console.log('ERRORS', JSON.stringify(errors, null, 2));
await browser.close();
