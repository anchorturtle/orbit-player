import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const out = path.join(process.cwd(), 'tmp-qa-holo-corners');
fs.mkdirSync(out, { recursive: true });
const chrome = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((p) => fs.existsSync(p));
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => localStorage.setItem('orbitSkin', 'holo'));
await page.goto('http://localhost:3456/?qa=h48', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1600);
const idle = await page.evaluate(() => document.querySelectorAll('#holo-tubes .holo-tube-tick').length);
console.log('IDLE TICKS', idle);
await page.screenshot({ path: path.join(out, '01-idle.png') });
const pbox = await page.locator('#player-win').boundingBox();
if (pbox) {
  await page.mouse.move(pbox.x + pbox.width / 2, pbox.y + pbox.height / 2);
  await page.waitForTimeout(100);
  console.log('HOVER CENTER TICKS', await page.evaluate(() => document.querySelectorAll('#holo-tubes .holo-tube-tick').length));
  await page.screenshot({
    path: path.join(out, '02-player-nw.png'),
    clip: { x: Math.max(0, pbox.x - 16), y: Math.max(0, pbox.y - 16), width: 180, height: 140 }
  });
}
await browser.close();
