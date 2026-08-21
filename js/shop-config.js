/* ============================================
   ORBIT PLAYER — shop config (Fourthwall)
   Only options we preview: Bella+Canvas 3001–style
   tee (front DTG), Mugz WGM78 white mug, unframed poster.
   ============================================ */

const SHOP_CONFIG = {
  title: 'Merch',
  artist: 'jestR',
  provider: 'fourthwall',
  signupUrl: 'https://fourthwall.com/',
  storeUrl: 'https://anchorturtle.fourthwall.com',

  kinds: [
    { id: 'tee', label: 'Tee', icon: 'checkroom', sku: 'Bella+Canvas 3001', print: 'Front DTG chest' },
    { id: 'mug', label: 'Mug', icon: 'coffee', sku: 'Mugz WGM78', print: 'Front panel' },
    { id: 'poster', label: 'Poster', icon: 'wallpaper', sku: 'Unframed art print', print: 'Full face' },
  ],

  /** Typical Bella+Canvas 3001 garment colors — not a custom picker. */
  teeColors: [
    { id: 'white', label: 'White', hex: '#f4f1ea' },
    { id: 'black', label: 'Black', hex: '#1a1716' },
    { id: 'navy', label: 'Navy', hex: '#1b365d' },
    { id: 'red', label: 'Red', hex: '#c41e3a' },
    { id: 'heather', label: 'Athletic Heather', hex: '#9a9b9d' },
    { id: 'royal', label: 'Royal', hex: '#1d4f91' },
  ],

  /** Separate catalog mugs — not tints of WGM78. */
  mugColors: [
    { id: 'wgm78-white', label: 'White glossy', sku: 'Mugz WGM78', hex: '#f6f4f0' },
    { id: 'black-glossy', label: 'Black glossy', sku: 'Black glossy mug', hex: '#161412' },
  ],

  names: {
    'images/Jesterdaze.png': 'Jesterdaze',
    'images/jestr-square.png': 'JeStR Square',
    'images/5JESTR-SQUARE.jpg': 'Signal Square',
    'images/JeStR.PNG': 'JeStR',
    'images/goatfacepng.png': 'Goatface',
    'images/jstar.png': 'J-Star',
    'images/boyvector.png': 'Boy Vector',
    'images/camo.png': 'Camo',
    'images/jestr-gradient.PNG': 'Gradient',
    'images/demoboypeace.PNG': 'Peace',
    'images/1facethefear.png': 'Face the Fear',
    'images/2fullmandala.png': 'Mandala',
    'images/lightning-2020square.png': 'Lightning',
    'images/Majesticpng.png': 'Majestic',
  },

  featured: [
    'images/Jesterdaze.png',
    'images/jestr-square.png',
    'images/5JESTR-SQUARE.jpg',
    'images/JeStR.PNG',
    'images/goatfacepng.png',
    'images/jstar.png',
    'images/boyvector.png',
    'images/camo.png',
  ],

  products: {},

  exclude: [
    'images/Coolest-charity-logo.png',
    'images/FRB-logo-black-outline-orange-with-river.png',
  ],

  supportUrl: '',
  supportLabel: 'Tip the lab',
  ethicalAdsPublisher: '',
};
