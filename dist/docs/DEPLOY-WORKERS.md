# Deploying to Cloudflare Workers (orbit-player)

## Asset size limit

Workers uploads everything under `wrangler.jsonc` → `assets.directory` (repo root). **Each file must be ≤ 25 MiB.**

`videos/jazzpotwax.mp4` (~211 MiB) is listed in **`.assetsignore`** so deploys succeed. Posters and OG images still deploy normally.

## Host the MP4 on R2 (recommended)

1. **R2** → Create bucket (e.g. `anchorturtle-media`).
2. Upload `videos/jazzpotwax.mp4` as `videos/jazzpotwax.mp4` (or `jazzpotwax.mp4`).
3. Enable **public access** (R2 custom domain or `r2.dev` public URL).
4. In **`index.html`**, set the CDN base **before** `js/gallery.js` loads:

```html
<script>
  window.ORBIT_MEDIA_CDN = 'https://YOUR-R2-PUBLIC-ORIGIN';
</script>
```

The player resolves `videos/jazzpotwax.mp4` → `{ORBIT_MEDIA_CDN}/videos/jazzpotwax.mp4`.

Leave `ORBIT_MEDIA_CDN` unset for **local** dev (`npm run start`) — files are read from `./videos/`.

## Redeploy

Push to `main` (Git-connected Workers/Pages) or:

```bash
npx wrangler deploy
```

After a green deploy, purge Cloudflare cache for `/js/gallery.js` if the browser shows an old build.