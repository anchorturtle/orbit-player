# anchorturtle.com = this Worker (orbit-player)

**Problem you hit:** Git deploy succeeded on Worker `orbit-player`, but **www.anchorturtle.com was still an old site** because the custom domain was never attached to that Worker.

**Proof (internal):** `https://orbit-player.jwals94.workers.dev/` serves the new build (AI videos tab, ~29KB `gallery.js`). `https://www.anchorturtle.com/` was still the old ~8KB `gallery.js`.

## What we fixed in repo

- `wrangler.jsonc` → `routes` with `custom_domain: true` for `www.anchorturtle.com` and `anchorturtle.com`
- `_headers` → don’t cache `index.html` forever
- Video MP4 → `ORBIT_MEDIA_CDN` points at GitHub media (file too big for Worker assets)

## One-time Cloudflare cleanup (you, ~2 minutes)

1. **Workers & Pages** → find any **old Pages** project still using **www.anchorturtle.com** → **Custom domains** → **Remove** `www` (and apex if listed).
2. Open Worker **orbit-player** (Git-connected) → **Deployments** → confirm latest **Success** after this push.
3. Worker **orbit-player** → **Settings** → **Domains & Routes** → you should see `www.anchorturtle.com` and `anchorturtle.com` after deploy. If not, **Add** → Custom domain → `www.anchorturtle.com`, repeat for apex.
4. **Caching** → **Purge Everything** for zone anchorturtle.com.
5. Hard refresh: Ctrl+Shift+R on https://www.anchorturtle.com/

**Pass:** Gallery tab says **AI videos**; `view-source:` shows `video-ai-badge`.