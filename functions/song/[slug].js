export async function onRequest(context) {
  const { slug } = context.params;
  
  // Simple track lookup (in production you could fetch from KV or D1)
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
  const siteUrl = 'https://orbit.anchorturtle.com'; // Update this to your actual domain
  const imageUrl = `${siteUrl}/og/song/${slug}.svg`;

  const title = `${track.title} - ${track.artist} | AnchorTurtle`;
  const description = `Listen to ${track.title} by ${track.artist} on Orbit — Cosmic High-Fidelity Music Player.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <!-- Open Graph -->
  <meta property="og:title" content="${track.title} - ${track.artist}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${siteUrl}/song/${slug}">
  <meta property="og:type" content="music.song">
  <meta property="og:site_name" content="AnchorTurtle">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${track.title} - ${track.artist}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <meta http-equiv="refresh" content="0;url=/#song/${slug}">
  <style>
    body { 
      background: #06040f; 
      color: #e9e1de; 
      font-family: system-ui, -apple-system, sans-serif; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      margin: 0;
    }
  </style>
</head>
<body>
  <p>Redirecting to Orbit...</p>
  <script>
    // Fallback redirect
    setTimeout(() => {
      window.location.href = '/#song/${slug}';
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