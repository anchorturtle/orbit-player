import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const out = path.join(process.cwd(), 'tmp-qa-holo-fade');
fs.mkdirSync(out, { recursive: true });
const chrome = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].find((p) => fs.existsSync(p));

const browser = await chromium.launch({ headless: true, executablePath: chrome });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => localStorage.setItem('orbitSkin', 'holo'));
await page.goto('http://localhost:3456/?qa=holo-fade-diag', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1800);

const diag = await page.evaluate(() => {
  const tubes = document.getElementById('holo-tubes');
  const core = tubes && tubes.querySelector('.holo-tube-cornerhide-core');
  const hide = tubes && tubes.querySelector('.holo-tube-cornerhide');
  const win = document.getElementById('tracklist-win');
  const r = win.getBoundingClientRect();
  const cs = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      fill: s.fill,
      fillRule: s.fillRule,
      fillOpacity: s.fillOpacity,
      opacity: s.opacity,
      display: s.display,
      visibility: s.visibility,
      filter: s.filter,
      mixBlend: s.mixBlendMode,
      z: s.zIndex,
      ns: el.namespaceURI,
      tag: el.tagName
    };
  };
  function hit(el, x, y) {
    if (!el || !el.isPointInFill) return null;
    try {
      return el.isPointInFill(new DOMPoint(x, y));
    } catch (e) {
      return 'err:' + e.message;
    }
  }
  let bbox = null;
  try { bbox = core && core.getBBox(); } catch (e) { bbox = String(e); }
  const d = core ? core.getAttribute('d') : '';
  return {
    tubesParent: tubes && tubes.parentElement && tubes.parentElement.id + '/' + tubes.parentElement.tagName,
    tubesCS: cs(tubes),
    coreCS: cs(core),
    hideCS: cs(hide),
    bbox: bbox && bbox.width ? { x: bbox.x, y: bbox.y, w: bbox.width, h: bbox.height } : bbox,
    win: { x: r.left, y: r.top, w: r.width, h: r.height },
    hits: {
      corner: hit(core, r.left + 2, r.top + 2),
      inset: hit(core, r.left + 20, r.top + 20),
      center: hit(core, r.left + r.width / 2, r.top + r.height / 2),
      outside: hit(core, r.left - 6, r.top - 6),
      far: hit(core, 10, 10)
    },
    dHead: d.slice(0, 180),
    dTail: d.slice(-80),
    pathCount: tubes ? tubes.querySelectorAll('path').length : 0
  };
});
console.log(JSON.stringify(diag, null, 2));

await page.evaluate(() => {
  document.querySelectorAll('.holo-tube-cornerhide-core').forEach((p) => {
    p.style.fill = '#00ff00';
    p.style.fillOpacity = '0.85';
    p.style.filter = 'none';
  });
  document.querySelectorAll('.holo-tube-cornerhide').forEach((p) => {
    p.style.display = 'none';
  });
});
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(out, 'diag-lime-core.png') });

await page.evaluate(() => {
  document.querySelectorAll('.holo-tube-cornerhide-core').forEach((p) => {
    p.style.fill = '#ff00ff';
    p.setAttribute('fill-rule', 'evenodd');
    p.style.fillRule = 'evenodd';
  });
});
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(out, 'diag-magenta-evenodd.png') });

await page.evaluate(() => {
  document.querySelectorAll('.holo-tube-cornerhide-core').forEach((p) => {
    p.setAttribute('fill-rule', 'nonzero');
    p.style.fillRule = 'nonzero';
    p.style.fill = '#ffff00';
    p.style.fillOpacity = '0.45';
  });
});
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(out, 'diag-yellow-nonzero.png') });

await browser.close();
