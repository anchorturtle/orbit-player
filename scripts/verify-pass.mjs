import { chromium } from 'playwright-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  const size = fs.statSync(file).size;
  const type = MIME[path.extname(file)] || 'application/octet-stream';
  const range = req.headers.range;
  if (range) {
    // Range support so <video> can seek (Chrome clamps seeks without it)
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m[1] ? parseInt(m[1], 10) : 0;
    const end = m[2] ? parseInt(m[2], 10) : size - 1;
    res.writeHead(206, {
      'content-type': type,
      'content-range': `bytes ${start}-${end}/${size}`,
      'content-length': end - start + 1,
      'accept-ranges': 'bytes',
    });
    fs.createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(200, { 'content-type': type, 'content-length': size, 'accept-ranges': 'bytes' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(3499, '127.0.0.1', r));

const browser = await chromium.launch({
  executablePath: 'C:/Users/james/AppData/Local/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe',
  args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

await page.goto('http://127.0.0.1:3499/', { waitUntil: 'load' });
await page.waitForTimeout(2500);

// 1. Sanity: no tailwind, windows laid out
const boot = await page.evaluate(() => ({
  tailwindGone: typeof window.tailwind === 'undefined',
  tracklistVisible: document.getElementById('tracklist-win')?.style.display,
  playerVisible: document.getElementById('player-win')?.style.display,
  trackRows: document.querySelectorAll('#sidebar-tracklist .track-item, #sidebar-tracklist > div').length,
}));
console.log('1 BOOT:', JSON.stringify(boot));

// 2. Glass tiers: open gallery too, click between windows, confirm classes + smooth overlay
const glass = await page.evaluate(() => {
  const gw = document.getElementById('gallery-win');
  gw.style.display = 'flex';
  bringToFront('gallery-win');
  const tl = document.getElementById('tracklist-win');
  const after = getComputedStyle(tl, '::after');
  return {
    galleryTier: gw.className.match(/win-glass-\w+/)?.[0],
    tracklistTier: tl.className.match(/win-glass-\w+/)?.[0],
    tracklistOverlayOpacity: after.opacity,
    overlayTransition: after.transitionDuration,
  };
});
console.log('2 GLASS:', JSON.stringify(glass));

// 3. Video: open, wait until playback passes 25s worth via seek, check natural caption
await page.evaluate(() => openVideoWin(0));
await page.waitForTimeout(2000);
await page.evaluate(() => { document.getElementById('video-win-player').currentTime = 26; });
await page.waitForTimeout(1500); // let timeupdate drive updateVideoCaptions naturally
const cap = await page.evaluate(() => {
  const line = document.getElementById('video-caption-line');
  const player = document.getElementById('video-win-player');
  return {
    time: Math.round(player.currentTime * 10) / 10,
    text: line.textContent,
    visibleOpacity: getComputedStyle(line).opacity,
    hostHidden: document.getElementById('video-captions').hidden,
  };
});
console.log('3 NATURAL CAPTION:', JSON.stringify(cap));
await page.screenshot({ path: 'scripts/verify-caption.png' });

// 4. CC toggle flash feedback
const flash = await page.evaluate(() => {
  document.getElementById('video-btn-cc').click();
  const line = document.getElementById('video-caption-line');
  return { textRightAfterToggle: line.textContent, on: _videoCaptionsOn };
});
await page.waitForTimeout(1400);
const afterFlash = await page.evaluate(() => {
  const host = document.getElementById('video-captions');
  return { hostHiddenAfterOffFlash: host.hidden, text: document.getElementById('video-caption-line').textContent };
});
const flashBack = await page.evaluate(() => {
  document.getElementById('video-btn-cc').click();
  return { text: document.getElementById('video-caption-line').textContent, on: _videoCaptionsOn };
});
console.log('4 CC TOGGLE:', JSON.stringify({ flash, afterFlash, flashBack }));

// 5. Settings panel opens
await page.waitForTimeout(1300);
const settings = await page.evaluate(() => {
  document.getElementById('video-btn-cc-settings').click();
  const panel = document.getElementById('video-caption-settings');
  const r = panel.getBoundingClientRect();
  return { hidden: panel.hidden, w: Math.round(r.width), h: Math.round(r.height) };
});
console.log('5 SETTINGS:', JSON.stringify(settings));

// 6. Mobile viewport: control row fits
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(800);
const mob = await page.evaluate(() => {
  const row = document.querySelector('#video-win .orbit-video-controls-row');
  const win = document.getElementById('video-win');
  return {
    rowScrollW: row.scrollWidth,
    rowClientW: row.clientWidth,
    fits: row.scrollWidth <= row.clientWidth + 1,
    winW: Math.round(win.getBoundingClientRect().width),
  };
});
console.log('6 MOBILE ROW:', JSON.stringify(mob));
await page.screenshot({ path: 'scripts/verify-mobile.png' });

console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close();
server.close();
