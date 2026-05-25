export async function onRequest(context) {
  const { slug } = context.params;

  // Track data (keep in sync with js/player.js or move to a shared source later)
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

  // Simple but appealing OG image - dark cosmic background with strong readable text
  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06040f"/>
      <stop offset="100%" style="stop-color:#0a0620"/>
    </linearGradient>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#d4c3ff"/>
    </linearGradient>
  </defs>

  <!-- Dark background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Subtle purple glow behind text area for better contrast -->
  <rect x="60" y="160" width="1080" height="280" rx="20" fill="#1a1035" opacity="0.75"/>
  
  <!-- Song Title - large and prominent -->
  <text 
    x="100" 
    y="280" 
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
    font-size="82" 
    font-weight="800" 
    fill="url(#titleGrad)" 
    letter-spacing="-1.5">
    ${escapeXml(track.title)}
  </text>
  
  <!-- Artist - clean and readable -->
  <text 
    x="100" 
    y="365" 
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
    font-size="46" 
    font-weight="600" 
    fill="#00C896">
    ${escapeXml(track.artist)}
  </text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
  });
}