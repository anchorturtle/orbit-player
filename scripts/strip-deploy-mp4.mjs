import fs from 'fs';
import path from 'path';

/** Cloudflare rejects assets > 25 MiB. Full MP4 stays in git/LFS; prod plays via GitHub media in gallery.js */
const ROOT = process.cwd();
const CANDIDATES = ['videos/jazzpotwax.mp4', 'videos/*.mp4'];

for (const rel of CANDIDATES) {
  if (rel.includes('*')) {
    const dir = path.join(ROOT, path.dirname(rel));
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('.mp4')) continue;
      const full = path.join(dir, name);
      try {
        const { size } = fs.statSync(full);
        if (size > 24 * 1024 * 1024) {
          fs.unlinkSync(full);
          console.log(`[orbit deploy] removed ${path.relative(ROOT, full)} (${Math.round(size / 1024 / 1024)} MiB) — served from GitHub media on prod`);
        }
      } catch (_) { /* ignore */ }
    }
    continue;
  }
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  try {
    const { size } = fs.statSync(full);
    if (size > 24 * 1024 * 1024) fs.unlinkSync(full);
  } catch (_) { /* ignore */ }
}