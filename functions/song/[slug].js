export async function onRequest(context) {
  const { slug } = context.params;

  // Track data - keep this in sync with your TRACKS in js/player.js
  const tracks = {
    'offers': { title: 'Offers', artist: 'jestR' },
    'hyperdream-odyssey': { title: 'hyperdream.odyssey.exe', artist: 'jestR' },
    'thousand-dragon': { title: 'Thousand Dragon', artist: 'jestR' },
    'ko': { title: 'K.O.', artist: 'jestR' },
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
    'jazzpot': { title: 'Jazzpot', artist: 'jestR' },
    'still-going-higher': { title: 'Still Going Higher', artist: 'jestR' },
    'fat-stacks': { title: 'Fat Stacks', artist: 'jestR' },
    'chokeslam': { title: 'Chokeslam', artist: 'jestR' },
    'grateful-sharpie': { title: 'Grateful Sharpie', artist: 'jestR' },
    'tomb-of-the-creator': { title: 'Tomb of the Creator ft. Tevin Page', artist: 'jestR' },
    'blockbuster': { title: 'Blockbuster ft. Tevin Page', artist: 'jestR' },
    'what-is-it-now': { title: 'What Is it Now?', artist: 'jestR' },
    'got-nun': { title: 'got nun?', artist: 'jestR' },
    'sublime-beginnings': { title: 'Sublime Beginnings', artist: 'jestR' },
    'space-radio': { title: 'Space Radio', artist: 'jestR' },
    'exploding-galaxies': { title: 'Exploding Galaxies', artist: 'jestR' },
    'acid-rain': { title: 'Acid Rain', artist: 'jestR' },
    'four-twenty': { title: '420', artist: 'jestR' },
    'jungle-fever': { title: 'Jungle Fever', artist: 'jestR' },
    'get': { title: 'Get', artist: 'jestR' },
    'winning': { title: '"Winning"', artist: 'jestR' },
    'my-anthem': { title: 'My Anthem', artist: 'jestR' },
    'nonnin': { title: 'Nonnin', artist: 'jestR' },
    'whoiam2u': { title: 'WHOiAM2u', artist: 'jestR' },
    'free-dumb': { title: 'free(dumb)', artist: 'jestR' },
    'death-of-jestr': { title: 'death of jestR', artist: 'jestR' },
  };

  const track = tracks[slug] || { title: 'Track', artist: 'jestR' };

  const url = new URL(context.request.url);
  const siteUrl = `${url.protocol}//${url.host}`;
  const imageUrl = `${siteUrl}/images/og/song/${slug}.jpg`;
  const appUrl = `${siteUrl}/#song/${slug}`;

  const title = `${track.title} - ${track.artist}`;
  const description = `Listen on AnchorTurtle`;

  // Return a clean HTML document with proper meta tags for social previews.
  // This approach is more reliable for link unfurling than heavy string replacement.
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | AnchorTurtle</title>

  <!-- Favicon for previews / bookmarks -->
  <link rel="icon" type="image/png" sizes="256x256" href="${siteUrl}/images/at-sea-trans-256.png">
  <link rel="apple-touch-icon" href="${siteUrl}/images/at-sea-trans-256.png">

  <!-- Open Graph tags for rich link previews -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${siteUrl}/song/${slug}">
  <meta property="og:type" content="music.song">
  <meta property="og:site_name" content="AnchorTurtle">

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">

  <!-- Redirect users to the actual app experience -->
  <meta http-equiv="refresh" content="0;url=${appUrl}">
</head>
<body>
  <p>Redirecting to AnchorTurtle...</p>
  <script>
    // Client-side fallback redirect
    setTimeout(() => {
      window.location.href = '${appUrl}';
    }, 100);
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}