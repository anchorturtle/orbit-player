#!/usr/bin/env node
/**
 * Cloudflare Pages / Workers static bundle (repo root is too large for direct upload).
 * Respects .assetsignore — keeps jazzpotwax.mp4 out of the 25 MiB Worker asset limit.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');

const IGNORE_FILES = new Set(['.gitignore', '.assetsignore', 'package-lock.json']);
const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  '.hermes',
  '.wrangler',
  'dist',
  'orbit-v2',
]);

function loadAssetsIgnore() {
  const p = path.join(root, '.assetsignore');
  if (!fs.existsSync(p)) return [];
  return fs
    .readFileSync(p, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

function globMatch(relPosix, pattern) {
  const re = new RegExp(
    '^' +
      pattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '§§')
        .replace(/\*/g, '[^/]*')
        .replace(/§§/g, '.*') +
      '$'
  );
  return re.test(relPosix);
}

function shouldSkip(relPosix, patterns) {
  for (const pat of patterns) {
    if (globMatch(relPosix, pat)) return true;
  }
  return false;
}

function rmrf(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyTree(src, dest, relBase, patterns) {
  const ent = fs.readdirSync(src, { withFileTypes: true });
  for (const e of ent) {
    const srcPath = path.join(src, e.name);
    const rel = path.posix.join(relBase, e.name);
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      if (shouldSkip(rel + '/', patterns) || shouldSkip(rel, patterns)) continue;
      fs.mkdirSync(path.join(dest, e.name), { recursive: true });
      copyTree(srcPath, path.join(dest, e.name), rel, patterns);
    } else {
      if (IGNORE_FILES.has(e.name)) continue;
      if (shouldSkip(rel, patterns)) continue;
      fs.mkdirSync(path.dirname(path.join(dest, e.name)), { recursive: true });
      fs.copyFileSync(srcPath, path.join(dest, e.name));
    }
  }
}

const patterns = loadAssetsIgnore();
rmrf(out);
fs.mkdirSync(out, { recursive: true });
copyTree(root, out, '', patterns);

// Pages Functions stay at repo root; static site lives in dist.
const manifest = {
  builtAt: new Date().toISOString(),
  commit: process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || null,
};
fs.writeFileSync(path.join(out, 'build-id.json'), JSON.stringify(manifest, null, 2));
console.log('prepare-dist: wrote', out, manifest);