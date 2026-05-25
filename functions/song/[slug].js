export async function onRequest(context) {
  const { slug } = context.params;
  const env = context.env;

  // Track data - keep this in sync with your TRACKS in js/player.js
  const tracks = {
    'geronimo': { title: 'Geronimo', artist: 'jestR' },
    'mile-high': { title: 'Mile High', artist: 'jestR' },
    'follow-the-flow': { title: 'Follow The Flow', artist: 'jestR' },
    'soul-seer': { title: 'Soul Seer', artist: 'jestR' },
    'peace': { title: 'Peace', artist: 'jestR' },
    'strider': { title: 'Strider', artist: 'jestR' },
    'insane-membrane': { title: 'Insane Membrane', artist: 'jestR' },
    'wavy': { title: 'Wavy', artist: 'jestR' },
    'boa-constrictor': { title: 'Boa Constrictor', artist: 'jestR' },
    'news': { title: 'News', artist: 'jestR' },
    'wheels': { title: 'Wheels', artist: 'jestR' },
    'pop': { title: 'Pop', artist: 'jestR' },
    'the-sum-of-hippy-thoughts': { title: 'The Sum Of Hippy Thoughts', artist: 'jestR' },
    'what-dreams-may-come': { title: 'What Dreams May Come', artist: 'jestR' },
    'spin-cycle': { title: 'Spin Cycle', artist: 'jestR' },
  };

  const track = tracks[slug] || { title: 'Track', artist: 'jestR' };

  // Use the request URL to determine the correct origin (works for custom domains + preview deployments)
  const url = new URL(context.request.url);
  const siteUrl = `${url.protocol}//${url.host}`;

  const imageUrl = `${siteUrl}/og/song/${slug}.svg`;
  const appUrl = `${siteUrl}/#song/${slug}`;

  const title = `${track.title} - ${track.artist}`;
  const description = `AnchorTurtle`;

  // Fetch the real index.html and inject dynamic meta tags
  let html = await context.env.ASSETS.fetch('/index.html').then(r => r.text());

  const metaTags = `
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${siteUrl}/song/${slug}">
  <meta property="og:type" content="music.song">
  <meta property="og:site_name" content="AnchorTurtle">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  `;

  // Inject the meta tags right before </head>
  html = html.replace('</head>', `${metaTags}\n</head>`);

  // Make sure the SPA loads the correct song
  html = html.replace(
    '</body>',
    `<script>window.location.replace('${appUrl}');</script>\n</body>`
  );

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}