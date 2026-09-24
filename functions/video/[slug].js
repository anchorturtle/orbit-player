export async function onRequest(context) {
  const { slug } = context.params;

  // width/height must match the actual -og.jpg files. iMessage / Applebot
  // will ignore or crop badly if og:image:width/height are wrong.
  const videos = {
    'thousand-dragon': {
      title: 'Thousand Dragon',
      poster: '/videos/thousand-dragon-og.jpg',
      description: 'jestR · AnchorTurtle',
      width: 1200,
      height: 630,
    },
    'ko': {
      title: 'K.O.',
      poster: '/videos/ko-og.jpg',
      description: 'jestR · AnchorTurtle',
      width: 1200,
      height: 630,
    },
    'jazzpotwax': {
      title: 'Jazzpot Wax',
      poster: '/videos/jazzpotwax-og.jpg',
      description: 'jestR · AnchorTurtle',
      width: 1200,
      height: 630,
    },
    'quarters': {
      title: 'Quarters',
      poster: '/videos/quarters-og.jpg',
      description: 'jestR · AnchorTurtle',
      width: 1080,
      height: 1920,
    },
  };

  const video = videos[slug] || {
    title: 'Video',
    poster: '/images/at-sea-trans-256.png',
    description: 'Watch on AnchorTurtle',
    width: 256,
    height: 256,
  };

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
  <meta property="og:image:width" content="${video.width}">
  <meta property="og:image:height" content="${video.height}">
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