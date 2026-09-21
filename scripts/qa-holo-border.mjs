import { chromium } from 'playwright-core';
import fs from 'fs';

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
page.on('console', (m) => { if (m.type() === 'error') errors.push('console:' + m.text()); });
await page.emulateMedia({ reducedMotion: 'no-preference' });
await page.addInitScript(() => localStorage.setItem('orbitSkin', 'holo'));
await page.goto('http://localhost:3456/?v=20260824h39', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  const b = document.getElementById('btn-player');
  if (b) b.click();
});
await page.waitForTimeout(800);

const info = await page.evaluate(() => {
  const html = document.documentElement;
  const tubes = document.getElementById('holo-tubes');
  const draw = tubes && tubes.querySelector('#holo-tube-draw');
  const st = tubes ? getComputedStyle(tubes) : null;
  const glass = tubes ? tubes.querySelectorAll('.holo-tube-glass') : [];
  const paths = tubes ? tubes.querySelectorAll('path') : [];
  const wins = [...document.querySelectorAll('.win')].map((el) => ({
    id: el.id,
    display: el.style.display || '(empty)',
    computed: getComputedStyle(el).display,
    w: el.offsetWidth,
    h: el.offsetHeight,
    left: el.style.left,
    top: el.style.top,
    clip: el.style.clipPath ? el.style.clipPath.slice(0, 80) : ''
  }));
  return {
    holo: html.classList.contains('theme-holo'),
    inner: [window.innerWidth, window.innerHeight],
    tubes: tubes ? {
      tag: tubes.tagName,
      ns: tubes.namespaceURI,
      data: tubes.getAttribute('data-holo-tubes'),
      viewBox: tubes.getAttribute('viewBox'),
      attrW: tubes.getAttribute('width'),
      attrH: tubes.getAttribute('height'),
      display: st.display,
      vis: st.visibility,
      z: st.zIndex,
      top: st.top,
      left: st.left,
      width: st.width,
      height: st.height,
      overflow: st.overflow,
      child: tubes.childElementCount,
      drawKids: draw ? draw.childElementCount : 0,
      paths: paths.length,
      glass: glass.length,
      glassD: glass[0] ? String(glass[0].getAttribute('d')).slice(0, 120) : null,
      glassStroke: glass[0] ? getComputedStyle(glass[0]).stroke : null,
      glassWidth: glass[0] ? getComputedStyle(glass[0]).strokeWidth : null,
      glassDisp: glass[0] ? getComputedStyle(glass[0]).display : null
    } : null,
    wins
  };
});

fs.mkdirSync('tmp-qa-holo-border', { recursive: true });
await page.screenshot({ path: 'tmp-qa-holo-border/01-player.png' });
console.log(JSON.stringify({ errors, info }, null, 2));
await browser.close();
