export async function onRequest(context) {
  const { slug } = context.params;

  // Track data (keep in sync with js/player.js or move to a shared source later)
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

  // Clean, high-contrast OG image matching the cosmic / glassmorphism aesthetic of the site.
  // Uses reliable system fonts (no external font loading for OG unfurl reliability).
  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="50%" style="stop-color:#e9e1de"/>
      <stop offset="100%" style="stop-color:#c8b3ff"/>
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#7B2FFF;stop-opacity:0.08"/>
      <stop offset="100%" style="stop-color:#2D5BFF;stop-opacity:0.03"/>
    </linearGradient>
  </defs>

  <!-- Deep cosmic background -->
  <rect width="1200" height="630" fill="#05040d"/>
  
  <!-- Very subtle vignette / space depth -->
  <rect width="1200" height="630" fill="url(#ringGrad)"/>
  
  <!-- Faint concentric rings (echo the planet visual in the app) -->
  <circle cx="1050" cy="320" r="260" fill="none" stroke="#7B2FFF" stroke-width="1" opacity="0.06"/>
  <circle cx="1050" cy="320" r="190" fill="none" stroke="#7B2FFF" stroke-width="1" opacity="0.09"/>
  <circle cx="1050" cy="320" r="130" fill="none" stroke="#2D5BFF" stroke-width="1" opacity="0.07"/>
  
  <!-- Tiny starfield dots for texture -->
  <circle cx="80" cy="80" r="1.5" fill="#fff" opacity="0.25"/>
  <circle cx="160" cy="140" r="1" fill="#fff" opacity="0.18"/>
  <circle cx="1120" cy="90" r="1.2" fill="#fff" opacity="0.22"/>
  <circle cx="180" cy="520" r="1" fill="#fff" opacity="0.15"/>
  <circle cx="1050" cy="540" r="1.3" fill="#fff" opacity="0.2"/>
  <circle cx="950" cy="110" r="0.8" fill="#fff" opacity="0.3"/>
  
  <!-- Song Title (prominent, slightly italic-leaning weight) -->
  <text 
    x="90" 
    y="265" 
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" 
    font-size="82" 
    font-weight="800" 
    letter-spacing="-0.02em"
    fill="url(#titleGrad)">
    ${escapeXml(track.title)}
  </text>
  
  <!-- Artist (accent green matching --jestr-green in app) -->
  <text 
    x="90" 
    y="340" 
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" 
    font-size="40" 
    font-weight="700" 
    letter-spacing="0.04em"
    fill="#00C896">
    ${escapeXml(track.artist)}
  </text>
  
  <!-- Subtle divider line + site badge (professional touch for link previews) -->
  <line x1="90" y1="380" x2="420" y2="380" stroke="#ffffff" stroke-width="1" opacity="0.12"/>
  <text 
    x="90" 
    y="415" 
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
    font-size="18" 
    font-weight="600" 
    letter-spacing="0.08em"
    fill="#7B2FFF">
    ANCHORTURTLE — HI-FI
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