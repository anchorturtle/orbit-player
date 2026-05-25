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

  // Generate a cosmic/glassmorphic SVG matching the site's aesthetic
  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06040f"/>
      <stop offset="100%" style="stop-color:#0a0620"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#7B2FFF"/>
      <stop offset="50%" style="stop-color:#2D5BFF"/>
      <stop offset="100%" style="stop-color:#00C896"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Subtle cosmic elements -->
  <circle cx="200" cy="150" r="80" fill="#7B2FFF" opacity="0.08"/>
  <circle cx="1000" cy="450" r="120" fill="#00C896" opacity="0.06"/>
  
  <!-- Glassmorphic card -->
  <rect x="80" y="120" width="1040" height="390" rx="24" ry="24" 
        fill="rgba(15,10,35,0.6)" stroke="rgba(123,47,255,0.25)" stroke-width="1"/>
  
  <!-- Accent line -->
  <rect x="120" y="200" width="6" height="220" rx="3" fill="url(#accent)"/>
  
  <!-- Title -->
  <text x="160" y="290" 
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-size="72" font-weight="800" fill="#e9e1de" letter-spacing="-1.5">
    ${escapeXml(track.title)}
  </text>
  
  <!-- Artist -->
  <text x="160" y="360" 
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-size="36" font-weight="600" fill="#00C896" letter-spacing="1">
    ${escapeXml(track.artist)}
  </text>
  
  <!-- Tagline -->
  <text x="160" y="430" 
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-size="22" fill="rgba(233,225,222,0.6)">
    AnchorTurtle • Cosmic High-Fidelity
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