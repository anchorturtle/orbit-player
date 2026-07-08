export async function onRequest(context) {
  const { slug } = context.params;

  const videos = {
    'jazzpotwax': {
      title: 'Jazzpot Wax',
      poster: '/videos/jazzpotwax-og.jpg',
      description: 'jestR · AnchorTurtle',
    },
  };

  const video = videos[slug] || { title: 'Video', poster: '/images/at-sea-trans-256.png', description: 'Watch on AnchorTurtle' };

  const url = new URL(context.request.url);
  const siteUrl = `${url.protocol}//${url.host}`;
  const imageUrl = `${siteUrl}${video.poster}`;
  const appUrl = `${siteUrl}/#video/${slug}`;

  const title = video.title;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | AnchorTurtle</title>

  <link rel="icon" type="image/png" sizes="256x256" href="${siteUrl}/images/at-sea-trans-256.png">
  <link rel="apple-touch-icon" href="${siteUrl}/images/at-sea-trans-256.png">

  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${video.description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${siteUrl}/video/${slug}">
  <meta property="og:type" content="video.other">
  <meta property="og:site_name" content="AnchorTurtle">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${video.description}">
  <meta name="twitter:image" content="${imageUrl}">

  <meta http-equiv="refresh" content="0;url=${appUrl}">
</head>
<body>
  <p>Redirecting to AnchorTurtle video…</p>
  <script>setTimeout(() => { window.location.href = '${appUrl}'; }, 100);</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}