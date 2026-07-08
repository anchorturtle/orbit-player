import fs from 'fs';
import path from 'path';

/**
 * Cloudflare Pages: publish static site without files > 25 MiB.
 * Full MP4 stays in git/LFS for GitHub media + local dev; prod plays via gallery.js CDN URL.
 */
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'pages-dist');

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.hermes', '.wrangler', 'pages-dist', 'dist',
]);

const SKIP_FILE_RE = [
  /\.mp4$/i,
  /^\.env/i,
];

function shouldSkip(rel) {
  const norm = rel.replace(/\\/g, '/');
  const parts = norm.split('/');
  if (parts.some((p) => SKIP_DIRS.has(p))) return true;
  const base = parts[parts.length - 1];
  return SKIP_FILE_RE.some((re) => re.test(base));
}

function rmrf(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest, relBase = '') {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const rel = relBase ? `${relBase}/${name}` : name;
    if (shouldSkip(rel)) continue;
    const from = path.join(src, name);
    const to = path.join(dest, name);
    const st = fs.statSync(from);
    if (st.isDirectory()) copyDir(from, to, rel);
    else {
      if (st.size > 24 * 1024 * 1024) {
        console.log(`[pages build] skip large file ${rel} (${Math.round(st.size / 1024 / 1024)} MiB)`);
        continue;
      }
      fs.copyFileSync(from, to);
    }
  }
}

rmrf(OUT);
copyDir(ROOT, OUT);
console.log(`[pages build] wrote ${OUT} (no MP4; video via GitHub media on prod)`);