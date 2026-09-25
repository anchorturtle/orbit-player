import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const out = path.join(process.cwd(), 'tmp-qa-holo-mobile');
fs.mkdirSync(out, { recursive: true });
const chrome = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((p) => fs.existsSync(p));
if (!chrome) throw new Error('No Chrome/Edge found');

const browser = await chromium.launch({ headless: true, executablePath: chrome });
const errors = [];

async function metrics(page) {
  return page.evaluate(() => {
    const tubes = document.getElementById('holo-tubes');
    const dock = document.getElementById('dock-win');
    const mob = document.getElementById('mobile-dock');
    const pl = document.getElementById('player-win');
    const play = document.getElementById('btn-play');
    const transport = document.querySelector('.player-transport');
    const cs = (el) => el ? getComputedStyle(el) : null;
    const box = (el) => el ? el.getBoundingClientRect() : null;
    const pb = box(pl);
    const tb = box(transport);
    const playb = box(play);
    const mb = box(mob);
    return {
      w: innerWidth,
      h: innerHeight,
      ticks: tubes ? tubes.querySelectorAll('.holo-tube-tick').length : 0,
      dockZ: dock && cs(dock).zIndex,
      tubesZ: tubes && cs(tubes).zIndex,
      dockOverflow: dock && cs(dock).overflow,
      playW: play && play.offsetWidth,
      playMargin: play && cs(play).margin,
      transportW: transport && transport.scrollWidth,
      transportClient: transport && transport.clientWidth,
      transportOverflows: transport ? transport.scrollWidth > transport.clientWidth + 1 : null,
      playerClip: pl && (pl.style.clipPath || cs(pl).clipPath),
      playerOverflow: pl && cs(pl).overflow,
      playerBottom: pb && pb.bottom,
      dockTop: mb && mb.top,
      playerCoversDock: pb && mb ? pb.bottom > mb.top + 4 : null,
      playInsideTransport: playb && tb
        ? playb.left >= tb.left - 2 && playb.right <= tb.right + 2
        : null,
      ctrlW: document.querySelector('.player-transport .ctrl-btn')
        && document.querySelector('.player-transport .ctrl-btn').offsetWidth,
      mobBtnClip: mob ? cs(mob).overflow : null,
      playerDisplay: pl && cs(pl).display,
      modeRight: box(document.getElementById('btn-orbit-mode-mob'))?.right,
      modeClipped: (() => {
        const b = box(document.getElementById('btn-orbit-mode-mob'));
        return b ? b.right > innerWidth + 1 : null;
      })()
    };
  });
}

const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
desk.on('pageerror', (e) => errors.push('desk: ' + e));
await desk.addInitScript(() => localStorage.setItem('orbitSkin', 'holo'));
await desk.goto('http://localhost:3456/?qa=h45', { waitUntil: 'networkidle', timeout: 60000 });
await desk.waitForTimeout(1600);
const idle = await metrics(desk);
console.log('DESK IDLE', JSON.stringify(idle, null, 2));
await desk.screenshot({ path: path.join(out, '01-desk-home.png') });

const pbox = await desk.locator('#player-win').boundingBox();
if (pbox) {
  await desk.mouse.move(pbox.x + 8, pbox.y + 8);
  await desk.waitForTimeout(120);
  console.log('DESK CORNER', await desk.evaluate(() =>
    document.querySelectorAll('#holo-tubes .holo-tube-tick').length));
  await desk.screenshot({
    path: path.join(out, '02-desk-corner.png'),
    clip: { x: Math.max(0, pbox.x - 20), y: Math.max(0, pbox.y - 20), width: 220, height: 160 }
  });
  await desk.mouse.move(pbox.x + pbox.width / 2, pbox.y + pbox.height / 2);
  await desk.waitForTimeout(120);
  console.log('DESK CENTER', await desk.evaluate(() =>
    document.querySelectorAll('#holo-tubes .holo-tube-tick').length));
}

const dbox = await desk.locator('#dock-win').boundingBox();
if (dbox) {
  await desk.screenshot({
    path: path.join(out, '03-desk-dock.png'),
    clip: {
      x: Math.max(0, dbox.x - 24),
      y: Math.max(0, dbox.y - 24),
      width: Math.min(1440, dbox.width + 48),
      height: Math.min(900, dbox.height + 48)
    }
  });
}
await desk.close();

const mob = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true
});
mob.on('pageerror', (e) => errors.push('mob: ' + e));
await mob.addInitScript(() => localStorage.setItem('orbitSkin', 'holo'));
await mob.goto('http://localhost:3456/?qa=h45m', { waitUntil: 'networkidle', timeout: 60000 });
await mob.waitForTimeout(1800);
await mob.evaluate(() => {
  const pl = document.getElementById('player-win');
  if (pl && pl.style.display !== 'flex') {
    const btn = document.getElementById('btn-mob-player');
    if (btn) btn.click();
  }
});
await mob.waitForTimeout(600);
const m1 = await metrics(mob);
console.log('MOB PLAYER', JSON.stringify(m1, null, 2));
await mob.screenshot({ path: path.join(out, '04-mob-player.png') });

const plb = await mob.locator('#player-win').boundingBox();
if (plb) {
  await mob.screenshot({
    path: path.join(out, '05-mob-player-crop.png'),
    clip: {
      x: 0,
      y: Math.max(0, plb.y - 8),
      width: 390,
      height: Math.min(844 - Math.max(0, plb.y - 8), plb.height + 80)
    }
  });
}
const dockb = await mob.locator('#mobile-dock').boundingBox();
if (dockb) {
  await mob.screenshot({
    path: path.join(out, '06-mob-dock.png'),
    clip: {
      x: 0,
      y: Math.max(0, dockb.y - 12),
      width: 390,
      height: Math.min(844 - Math.max(0, dockb.y - 12), dockb.height + 24)
    }
  });
}

console.log('ERRORS', errors);
await mob.close();
await browser.close();
if (errors.length) process.exitCode = 1;
