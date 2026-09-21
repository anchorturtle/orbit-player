import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const out = path.join(process.cwd(), 'tmp-qa-holo-fade-after');
const chrome = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((p) => fs.existsSync(p));

const browser = await chromium.launch({
  headless: true,
  executablePath: chrome,
  args: ['--disable-http-cache']
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => localStorage.setItem('orbitSkin', 'holo'));
await page.goto('http://localhost:3456/?v=20260824h25', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2000);

const clipInfo = await page.evaluate(() => {
  const el = document.getElementById('tracklist-win');
  const cs = getComputedStyle(el);
  return {
    clip: cs.clipPath.slice(0, 80),
    overflow: cs.overflow,
    contain: cs.contain,
    radius: cs.borderRadius,
    transform: cs.transform,
    bg: cs.backgroundColor
  };
});
console.log('CLIP_CS', JSON.stringify(clipInfo, null, 2));

await page.evaluate(() => {
  document.documentElement.style.setProperty('background', '#ff00ff', 'important');
  document.body.style.setProperty('background', '#ff00ff', 'important');
  ['space3d-canvas', 'planet-bg', 'stars-canvas', 'holo-hud'].forEach((id) => {
    var el = document.getElementById(id);
    if (el) el.style.setProperty('display', 'none', 'important');
  });
  document.querySelectorAll('.grain-overlay, .vignette').forEach((el) => {
    el.style.setProperty('display', 'none', 'important');
  });
});
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(out, 'diag-magenta-home.png') });

const r = await page.evaluate(() => {
  const el = document.getElementById('tracklist-win');
  const b = el.getBoundingClientRect();
  return { x: b.left, y: b.top, w: b.width, h: b.height, clip: el.style.clipPath.slice(0, 60) };
});
await page.screenshot({
  path: path.join(out, 'diag-magenta-track-nw.png'),
  clip: { x: Math.max(0, r.x - 20), y: Math.max(0, r.y - 20), width: 90, height: 90 }
});
console.log('TRACK_NW', JSON.stringify(r));
await browser.close();
