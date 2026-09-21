import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const out = path.join(process.cwd(), 'tmp-qa-holo-nav-beam');
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
await page.goto('http://localhost:3456/?v=20260824h28', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2200);

const probe = await page.evaluate(() => {
  const dock = document.getElementById('dock-win');
  const tubes = document.getElementById('holo-tubes');
  const r = dock.getBoundingClientRect();
  const dcs = getComputedStyle(dock);
  const logos = dock.querySelector('.dock-logo-main, .dock-logo-wrap');
  const lr = logos ? logos.getBoundingClientRect() : null;
  return {
    holo: document.documentElement.classList.contains('theme-holo'),
    tubesVer: tubes && tubes.getAttribute('data-holo-tubes'),
    dock: {
      id: dock.id,
      clip: dock.style.clipPath || '(none)',
      overflow: dcs.overflow,
      contain: dcs.contain,
      x: r.x, y: r.y, w: r.width, h: r.height,
      bottom: r.bottom,
      vh: window.innerHeight
    },
    logo: lr && { x: lr.x, y: lr.y, w: lr.width, h: lr.height, topGap: lr.top - r.top, botGap: r.bottom - lr.bottom },
    classes: {
      plasma: !!tubes.querySelector('.holo-tube-plasma'),
      trail: !!tubes.querySelector('.holo-tube-trail'),
      filters: [...(tubes.querySelectorAll('filter') || [])].map((f) => f.id)
    }
  };
});
console.log(JSON.stringify({ probe, errors }, null, 2));

await page.screenshot({ path: path.join(out, '01-home.png') });

const dockBox = await page.evaluate(() => {
  const r = document.getElementById('dock-win').getBoundingClientRect();
  return {
    x: Math.max(0, r.x - 24),
    y: Math.max(0, r.y - 24),
    width: r.width + 48,
    height: r.height + 48
  };
});
await page.screenshot({
  path: path.join(out, '02-dock.png'),
  clip: { x: dockBox.x, y: dockBox.y, width: dockBox.width, height: dockBox.height }
});
await page.screenshot({
  path: path.join(out, '02-dock-nw.png'),
  clip: { x: dockBox.x, y: dockBox.y, width: 120, height: 90 }
});
await page.screenshot({
  path: path.join(out, '02-dock-ne.png'),
  clip: { x: dockBox.x + dockBox.width - 120, y: dockBox.y, width: 120, height: 90 }
});

const playerBox = await page.evaluate(() => {
  const el = document.getElementById('player-win');
  const r = el.getBoundingClientRect();
  return {
    x: Math.max(0, r.x - 16),
    y: Math.max(0, r.y - 16),
    width: Math.min(420, r.width + 32),
    height: 110
  };
});
await page.screenshot({
  path: path.join(out, '03-player-beam.png'),
  clip: playerBox
});

await page.waitForTimeout(420);
await page.screenshot({
  path: path.join(out, '03b-player-beam-later.png'),
  clip: playerBox
});

await browser.close();
console.log('wrote', out);
