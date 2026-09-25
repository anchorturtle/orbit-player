import { chromium } from 'playwright-core';
import fs from 'fs';

const chrome = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((p) => fs.existsSync(p));
if (!chrome) throw new Error('No Chrome/Edge found');

const browser = await chromium.launch({ headless: true, executablePath: chrome });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, hasTouch: false });
page.on('pageerror', (e) => console.log('PAGEERROR', String(e)));
await page.emulateMedia({ reducedMotion: 'no-preference' });
await page.addInitScript(() => localStorage.setItem('orbitSkin', 'holo'));
await page.goto('http://localhost:3456/?v=20260824h20', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(900);

async function cur(sel) {
  const loc = page.locator(sel).first();
  await loc.waitFor({ state: 'visible', timeout: 15000 });
  const box = await loc.boundingBox();
  await page.mouse.move(box.x + Math.min(6, box.width / 2), box.y + Math.min(6, box.height / 2));
  return page.evaluate((s) => {
    const t = document.querySelector(s);
    const c = t ? getComputedStyle(t).cursor : null;
    return { sel: s, cursor: c };
  }, sel);
}

const checks = [];
for (const s of ['#btn-play', '.taskbar-btn', '.track-item', '.win-close', '#player-bar', '#search-input', '.win-resize.se']) {
  checks.push(await cur(s));
}

const play = page.locator('#btn-play').first();
const pb = await play.boundingBox();
await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2);
await page.mouse.down();
await page.waitForTimeout(25);
const down = await page.evaluate(() => ({
  press: document.documentElement.classList.contains('holo-cursor-press'),
  ring: !!(document.getElementById('holo-click-ring') && document.getElementById('holo-click-ring').classList.contains('is-on')),
  cursor: getComputedStyle(document.querySelector('#btn-play')).cursor,
  follower: (function () {
    const el = document.getElementById('holo-cursor');
    return el ? getComputedStyle(el).display : 'none';
  })()
}));
await page.mouse.up();

await page.click('#btn-orbit-mode');
await page.waitForTimeout(120);
const live = await page.evaluate(() => ({
  holo: document.documentElement.classList.contains('theme-holo'),
  playCursor: getComputedStyle(document.querySelector('#btn-play')).cursor
}));

console.log(JSON.stringify({ checks, down, live }, null, 2));
await browser.close();
