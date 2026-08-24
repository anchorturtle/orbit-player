import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const out = path.join(process.cwd(), 'tmp-qa-holo');
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
await page.goto('http://localhost:3456/?v=20260824h15', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2800);

const info = await page.evaluate(() => {
  const play = document.querySelector('.play-btn');
  const close = document.querySelector('.win-close');
  const dock = document.getElementById('dock-win');
  const grid = document.getElementById('holo-iso-grid');
  const cs = (el) => el ? getComputedStyle(el) : null;
  const p = play ? cs(play) : null;
  const c = close ? cs(close) : null;
  const d = dock ? cs(dock) : null;
  const g = grid ? cs(grid) : null;
  const playBox = play ? play.getBoundingClientRect() : null;
  const trans = document.querySelector('.player-transport');
  const face = document.querySelector('.player-faceplate');
  return {
    htmlClass: document.documentElement.className,
    holo: document.documentElement.classList.contains('theme-holo'),
    playRadius: p && p.borderRadius,
    playSize: playBox && { w: playBox.width, h: playBox.height },
    closeRadius: c && c.borderRadius,
    closeSize: close && { w: close.offsetWidth, h: close.offsetHeight },
    dockOverflow: d && d.overflow,
    gridDisplay: g && g.display,
    transOverflow: trans && cs(trans).overflow,
    faceOverflow: face && cs(face).overflow,
    space3d: document.documentElement.classList.contains('space3d-on'),
    holoOn: window.__HOLO_ON__,
    canvas: (function () {
      var c = document.getElementById('space3d-canvas');
      if (!c) return null;
      var r = c.getBoundingClientRect();
      return { w: c.width, h: c.height, cw: r.width, ch: r.height, display: getComputedStyle(c).display, opacity: getComputedStyle(c).opacity };
    })(),
    strings: !!document.getElementById('holo-strings'),
    hud: !!document.getElementById('holo-hud'),
    tubes: !!document.getElementById('holo-tubes'),
    qa: window.__HOLO_QA__ || null
  };
});
console.log(JSON.stringify(info, null, 2));
console.log('ERRORS', JSON.stringify(errors, null, 2));

await page.evaluate(() => {
  const hide = (el) => { if (el) el.style.setProperty('display', 'none', 'important'); };
  document.querySelectorAll('.win').forEach(hide);
  ['planet-bg', 'holo-tubes', 'holo-strings', 'holo-hud'].forEach((id) => hide(document.getElementById(id)));
  document.querySelectorAll('.grain-overlay, .vignette').forEach(hide);
});
await page.screenshot({ path: path.join(out, '00-3d-only.png') });
await page.waitForTimeout(1800);
await page.screenshot({ path: path.join(out, '00b-3d-later.png') });
await page.evaluate(() => {
  const show = (el) => { if (el) el.style.removeProperty('display'); };
  document.querySelectorAll('.win').forEach(show);
  ['planet-bg', 'holo-tubes', 'holo-strings', 'holo-hud'].forEach((id) => show(document.getElementById(id)));
  document.querySelectorAll('.grain-overlay, .vignette').forEach(show);
});

await page.screenshot({ path: path.join(out, '01-holo-home.png') });

{
  const playHome = page.locator('#player-win #btn-play, #btn-play').first();
  const box = await playHome.boundingBox();
  console.log('PLAY_BOX', JSON.stringify(box));
  if (box && box.width > 8 && box.height > 8) {
    await page.screenshot({
      path: path.join(out, '05-play-crop.png'),
      clip: { x: Math.max(0, box.x - 24), y: Math.max(0, box.y - 24), width: box.width + 48, height: box.height + 48 }
    });
  }
}

const colorProbe = await page.evaluate(() => {
  const leaks = [];
  const nodes = document.querySelectorAll('body, .phosphor, .tape-counter, .win-title, .player-title, .focal-title, .dock-logo-main, .ctrl-btn');
  nodes.forEach((el) => {
    const c = getComputedStyle(el).color;
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return;
    const r = +m[1], g = +m[2], b = +m[3];
    if (g > 90 && g > r + 25 && g > b) leaks.push((el.id || el.className || el.tagName) + ' ' + c);
  });
  const root = getComputedStyle(document.documentElement);
  return {
    jestrGreen: root.getPropertyValue('--jestr-green').trim(),
    trackC: root.getPropertyValue('--track-c').trim(),
    phosphor: (document.querySelector('.phosphor') && getComputedStyle(document.querySelector('.phosphor')).color),
    tape: (document.querySelector('.tape-counter') && getComputedStyle(document.querySelector('.tape-counter')).color),
    leaks: leaks.slice(0, 12)
  };
});
console.log('COLOR_PROBE', JSON.stringify(colorProbe, null, 2));

await page.evaluate(() => {
  document.querySelectorAll('.win').forEach((w) => { w.style.visibility = 'hidden'; });
});
await page.screenshot({ path: path.join(out, '07-planet-a.png') });
const items = page.locator('.track-item');
if (await items.count() > 2) {
  await items.nth(2).click({ force: true });
  await page.waitForTimeout(900);
}
await page.screenshot({ path: path.join(out, '08-planet-b.png') });
await page.evaluate(() => {
  document.querySelectorAll('.win').forEach((w) => { w.style.visibility = ''; });
});

await page.locator('#btn-tracklist').click({ force: true });
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(out, '02-tracks.png') });
await page.locator('#btn-player').click({ force: true });
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(out, '03-player.png') });

const play = page.locator('#btn-play');
if (await play.count()) {
  const box = await play.boundingBox();
  if (box && box.width > 8 && box.height > 8) {
    await page.screenshot({
      path: path.join(out, '05-play-crop.png'),
      clip: { x: Math.max(0, box.x - 24), y: Math.max(0, box.y - 24), width: box.width + 48, height: box.height + 48 }
    });
  }
}

await page.locator('#btn-gallery').click({ force: true });
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(out, '04-gallery.png') });

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, '06-mobile.png') });
console.log('ERRORS_END', JSON.stringify(errors, null, 2));
await browser.close();
