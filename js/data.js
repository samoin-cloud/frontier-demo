/* FRONTIER — Data layer
   Deterministic generators: 224 products · 32 articles · 53 FAQs · 22 testimonials · 12 team.
   All randomness is seeded so the catalog is identical on every load. */
window.DATA = (function () {
  'use strict';

  /* seeded RNG */
  function hash(str) { var x = 2166136261; for (var i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rng(seedStr) { var t = typeof seedStr === 'number' ? seedStr : hash(seedStr); return function () { t += 0x6D2B79F5; var r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function intR(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }

  /* ---------- categories ---------- */
  var CATS = [
    { slug: 'smartphones', name: 'Smartphones', icon: 'smartphone', hue: 262, subs: ['Flagships', 'Mid-range', 'Foldables', 'Rugged'] },
    { slug: 'laptops', name: 'Laptops & Tablets', icon: 'laptop', hue: 205, subs: ['Ultrabooks', 'Gaming Laptops', 'Tablets', '2-in-1'] },
    { slug: 'audio', name: 'Audio', icon: 'headphones', hue: 320, subs: ['Headphones', 'Earbuds', 'Speakers', 'Hi-Fi DACs'] },
    { slug: 'wearables', name: 'Wearables', icon: 'watch', hue: 174, subs: ['Smartwatches', 'Fitness Bands', 'Smart Rings'] },
    { slug: 'smart-home', name: 'Smart Home', icon: 'home', hue: 145, subs: ['Hubs & Assistants', 'Lighting', 'Security Cameras', 'Plugs & Sensors'] },
    { slug: 'gaming', name: 'Gaming', icon: 'gamepad', hue: 15, subs: ['Consoles', 'Controllers', 'VR Headsets', 'Streaming Gear'] },
    { slug: 'cameras-drones', name: 'Cameras & Drones', icon: 'camera', hue: 45, subs: ['Mirrorless', 'Action Cams', 'Drones', 'Gimbal Stabilizers'] },
    { slug: 'accessories', name: 'Accessories', icon: 'zap', hue: 288, subs: ['Chargers & Power', 'Cables & Docks', 'Keyboards', 'Mice'] }
  ];

  var BRANDS = ['Nexora', 'Voltrix', 'Aurex Labs', 'Kinova', 'Zentra', 'Orbita', 'Helios', 'Quanta', 'FreeWave', 'Lumio', 'Stratos', 'Verdant', 'Polyxel', 'Mirage Audio', 'Ionik', 'Skyward', 'Nocturne', 'Veyra', 'Arcwave', 'TerraPulse', 'Fluxon', 'Andra', 'Pulsar Nine', 'OzoneKit', 'Marlowe', 'Cirrus', 'Delta Edge', 'Nimbus', 'Kairo', 'Solace Tech', 'Brightlink', 'Vertex One'];

  var COLORS = [
    { name: 'Midnight Black', hex: '#17171f' }, { name: 'Arctic White', hex: '#f2f4f8' },
    { name: 'Nebula Violet', hex: '#6C5CE7' }, { name: 'Ocean Cyan', hex: '#00b8d9' },
    { name: 'Sunset Coral', hex: '#FF6B6B' }, { name: 'Titanium Grey', hex: '#8a8f98' },
    { name: 'Forest Green', hex: '#2f7d5c' }, { name: 'Crimson Red', hex: '#c0392b' },
    { name: 'Sand Gold', hex: '#d3a24a' }, { name: 'Deep Blue', hex: '#2456a8' }
  ];
  var CONNECT = ['Bluetooth 5.3', 'Wi-Fi 6E', 'NFC', 'Qi Wireless', 'USB-C', 'Thread / Matter', '5G'];

  function catBySlug(s) { for (var i = 0; i < CATS.length; i++) if (CATS[i].slug === s) return CATS[i]; }

  /* ---------- product generation ---------- */
  var NAME_A = ['Quantum', 'Nova', 'Zenith', 'Orbit', 'Apex', 'Stellar', 'Nimbus', 'Prism', 'Vector', 'Aurora', 'Vertex', 'Echo', 'Halo', 'Titan'];
  var NAME_B = {
    smartphones: ['Pro 5G Phone', 'Fold Smartphone', 'Ultra Smartphone', 'Compact Phone'],
    laptops: ['Ultrabook Pro', 'Creator Laptop', 'Convertible Tablet', 'Book Air'],
    audio: ['ANC Headphones', 'True Wireless Earbuds', 'Smart Speaker', 'Portable Speaker', 'Studio Monitor'],
    wearables: ['Smartwatch', 'Fitness Band', 'Smart Ring', 'Sport Watch'],
    'smart-home': ['Smart Hub', 'Ambient Bulb', 'Indoor Camera', 'Video Doorbell', 'Smart Plug Mini'],
    gaming: ['Console X', 'Pro Controller', 'VR Headset', 'Capture Card', 'Wireless Headset'],
    'cameras-drones': ['Mirrorless Camera', 'Action Cam 4K', 'Cinematic Drone', 'Gimbal Stabilizer'],
    accessories: ['100W GaN Charger', 'USB-C Hub 8-in-1', 'Mechanical Keyboard', 'Ergo Wireless Mouse']
  };
  var SUFFIX = ['', '', 'Pro', 'Max', 'X2', 'Ultra', 'Lite', 'S'];
  var USE_CASE = [
    'Engineered for people who refuse to compromise.',
    'Built to disappear into your day while quietly outperforming everything near it.',
    'Designed around one belief: technology should feel like magic, not maintenance.',
    'The everyday companion you forget is smart — until it saves your day.',
    'Precision-tuned hardware wrapped in an impossibly thin silhouette.'
  ];

  var PRODUCTS = [];
  (function genProducts() {
    var id = 1;
    CATS.forEach(function (cat) {
      var brandPool = BRANDS.slice();
      // shuffle deterministically per category, take first 10 brands per category
      var r0 = rng(cat.slug + ':brands');
      for (var i = brandPool.length - 1; i > 0; i--) { var j = intR(r0, 0, i); var tmpB = brandPool[i]; brandPool[i] = brandPool[j]; brandPool[j] = tmpB; }
      brandPool = brandPool.slice(0, 11);
      var count = cat.slug === 'accessories' ? 36 : 28;
      var usedNames = {};
      for (var n = 0; n < count; n++) {
        var rr = rng(cat.slug + ':' + n);
        var brand = brandPool[n % brandPool.length];
        var base = pick(rr, NAME_B[cat.slug]);
        var nmA = pick(rr, NAME_A);
        var suf = pick(rr, SUFFIX);
        var name = nmA + ' ' + base;
        if (suf) name += ' ' + suf;
        if (usedNames[name]) { name += ' Gen' + intR(rr, 2, 4); }
        usedNames[name] = true;
        var tier = rr(); // price shaping
        var basePrice = { smartphones: [179, 1399], laptops: [449, 2899], audio: [39, 799], wearables: [59, 899], 'smart-home': [25, 449], gaming: [49, 999], 'cameras-drones': [199, 2799], accessories: [19, 249] }[cat.slug];
        var spread = tier * tier; // skew cheap
        var price = Math.round((basePrice[0] + (basePrice[1] - basePrice[0]) * spread) / 5) * 5 - 0.01;
        if (price < 14.99) price = 14.99;
        var onSale = rr() < 0.42 && price > 29;
        var discount = onSale ? [15, 20, 25, 30, 35, 40][intR(rr, 0, 5)] : 0;
        var oldPrice = onSale ? Math.round(price / (1 - discount / 100)) + 0 : null;
        var ratingRaw = 3.4 + rr() * 1.6 + (rr() < 0.3 ? 0.15 : 0);
        var rating = Math.min(5, ratingRaw);
        rating = Math.round(rating * 2) / 2; // halves
        var reviews = intR(rr, 18, 4800);
        var stockRoll = rr(); var stock = stockRoll < .8 ? 'in' : (stockRoll < .93 ? 'low' : 'out');
        var lowCount = intR(rr, 2, 7);
        var colorList = COLORS.filter(function () { return true; });
        var cStart = intR(rr, 0, COLORS.length - 3);
        var colors = colorList.slice(cStart, cStart + intR(rr, 2, 5));
        var daysAgo = intR(rr, 3, 400);
        var created = new Date(Date.now() - daysAgo * 86400000);
        var conn = []; var pool = CONNECT.slice();
        var nc = intR(rr, 2, 4);
        for (var c = 0; c < nc; c++) { var idx = intR(rr, 0, pool.length - 1); conn.push(pool.splice(idx, 1)[0]); }
        var battery = cat.slug === 'audio' || cat.slug === 'wearables' ? intR(rr, 6, 60) : (cat.slug === 'laptops' ? intR(rr, 8, 22) : intR(rr, 2, 30));
        var badges = [];
        if (daysAgo < 45) badges.push('new');
        if (rating >= 4.7 && reviews > 900) badges.push('hot');
        if (onSale) badges.push('sale');
        if (rr() < 0.08) badges.push('limited');
        var views = intR(rr, 140, 52000);
        var popularity = reviews * 0.6 + views * 0.004 + rating * 220 + rr() * 700;
        PRODUCTS.push({
          id: id,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          name: name, brand: brand, category: cat.slug, subcategory: pick(rr, cat.subs),
          price: price, oldPrice: oldPrice, discount: discount,
          rating: rating, reviews: reviews,
          badges: badges, stock: stock, lowCount: lowCount,
          colors: colors.map(function (cc) { return { name: cc.name, hex: cc.hex }; }),
          connectivity: conn, battery: battery,
          weight: (rr() * 2.4 + 0.15).toFixed(2),
          releasedDaysAgo: daysAgo,
          createdAt: created.toISOString().slice(0, 10),
          views: views, popularity: Math.round(popularity),
          featured: rr() < 0.22,
          descUseCase: pick(rr, USE_CASE),
          specs: buildSpecs(cat.slug, rr, name)
        });
        id++;
      }
    });
  })();

  function buildSpecs(slug, r, name) {
    var common = [['Warranty', '2-year FRONTIER care'], ['In the Box', 'Device, USB-C cable, quick start guide']];
    var byCat = {
      smartphones: [['Display', pick(r, ['6.1" LTPO OLED 120Hz', '6.7" AMOLED 144Hz', '6.4" P-OLED 120Hz'])], ['Chipset', pick(r, ['Helion X3 Octa 3.2GHz', 'Fusion 9 Gen2', 'TitanCore A78'])], ['RAM', pick(r, ['8GB', '12GB', '16GB'])], ['Storage', pick(r, ['128GB', '256GB', '512GB', '1TB'])], ['Battery', pick(r, ['4,500mAh', '5,000mAh', '5,300mAh'])], ['Camera', pick(r, ['50MP dual OIS', '108MP triple array', '200MP quad pixel'])], ['Weight', '—']],
      laptops: [['Display', pick(r, ['14" 2.8K OLED', '16" miniLED 165Hz', '13.6" Liquid Retina-class IPS', '15.6" QHD+ 240Hz'])], ['Processor', pick(r, ['Octane M3 12-core', 'Cobalt i9 H-series', 'Fusion X NPU chip'])], ['RAM', pick(r, ['16GB', '32GB', '64GB'])], ['Storage', pick(r, ['512GB NVMe', '1TB NVMe', '2TB NVMe'])], ['Graphics', pick(r, ['Integrated Arc', 'RTX-class discrete 8GB', 'Radeon-class 12GB'])], ['Ports', '2× Thunderbolt, USB-A, HDMI 2.1, SD'], ['Weight', '—']],
      audio: [['Drivers', pick(r, ['40mm graphene', '11mm titanium', 'Custom planar magnetic', 'Dual-array silk dome'])], ['ANC', pick(r, ['Adaptive hybrid ANC −42dB', 'Smart ANC with transparency', '6-mic beamforming ANC'])], ['Codecs', pick(r, ['LDAC, aptX Lossless, AAC', 'LC3+, AAC, SBC'])], ['Battery', pick(r, ['38h (case 60h)', '32h single charge', '12h + 34h case', '80h total runtime'])], ['Water resistance', pick(r, ['IPX4', 'IP57', 'IP68'])], ['Bluetooth', '5.3 multipoint'], ['Weight', '—']],
      wearables: [['Display', pick(r, ['1.4" AMOLED always-on', '1.9" LTPO sapphire', '2.0" microLED'])], ['Sensors', pick(r, ['HR, SpO₂, ECG, skin temp', 'HRV, EDA, barometer, GPS L1+L5', 'HR, sleep staging, compass'])], ['Battery', pick(r, ['Up to 14 days', '48h heavy use / 9 days normal', 'Up to 21 days saver mode'])], ['Water rating', pick(r, ['5ATM', '10ATM dive-ready', 'IP69'])], ['OS compatibility', 'iOS 15+ / Android 10+'], ['Weight', '—']],
      'smart-home': [['Connectivity', pick(r, ['Thread, Matter, BLE', 'Zigbee 3.0 + Wi-Fi 6', 'Wi-Fi 6E only'])], ['Resolution / Output', pick(r, ['2K HDR night vision', '1600 lumens tunable white + RGBWW', '4K with AI person detection', '180° FHD'])], ['Power', pick(r, ['Mains powered', 'Rechargeable 6-month battery', 'PoE'])], ['Storage', pick(r, ['Local microSD 256GB max', 'Encrypted cloud 90 days', 'On-device 8GB eMMC'])], ['Assistant support', 'Alexa · Google Home · HomeKit'], ['Weight', '—']],
      gaming: [['Performance', pick(r, ['4K@120fps ray tracing', '1440p@240fps', '8K upscaling ready'])], ['Storage', pick(r, ['1TB custom NVMe', '2TB expandable SSD', '512GB UFS 4.0'])], ['Latency', pick(r, ['1ms wireless (2.4GHz dongle)', 'Sub-8ms BT LE audio'])], ['Compatibility', pick(r, ['PC / Android / iOS / Switch', 'PC / PS5 / Xbox Series'])], ['Haptics', pick(r, ['HD rumble + adaptive triggers', 'Impulse triggers dual-stage'])], ['Weight', '—']],
      'cameras-drones': [['Sensor', pick(r, ['Full-frame 33MP BSI', '1-inch stacked CMOS 20MP', 'Micro 4/3 quad-pixel 26MP'])], ['Video', pick(r, ['8K30 / 4K120 10-bit LOG', '4K60 HDR vertical', '5.4K60 ProRes RAW'])], ['Stabilization', pick(r, ['IBIS 8 stops', 'HyperSmooth-class 6.0', '3-axis mechanical gimbal'])], ['Flight time / Battery', pick(r, ['46 minutes', '34 minutes', '135 min recording'])], ['Range', pick(r, ['18km O5 transmission', '12km LD 4.0', '20km O4+ dual-band'])], ['Weight', '—']],
      accessories: [['Output / Capability', pick(r, ['100W GaN III PD 3.1', '140W USB-C PD', '65W dual-port GaN'])], ['Ports', pick(r, ['2× USB-C, 1× USB-A', 'HDMI 2.1, DP, LAN, SD/microSD', '8× USB-C downstream'])], ['Material', pick(r, ['Anodized aluminium shell', 'Braided nylon jacket', 'PBT double-shot keycaps'])], ['Switches (keyboard)', pick(r, ['Hot-swap tactile brown', 'Optical linear red', 'Silent tactile — lubed'])], ['Polling / DPI', pick(r, ['8000Hz polling, 26K DPI', '1000Hz, 20K DPI'])], ['Weight', '—']]
    };
    var rows = (byCat[slug] || []).slice();
    rows[rows.length - 1] = rows[rows.length - 1]; // keep
    return rows.concat(common);
  }

  /* ---------- product art (procedural SVG thumbnails) ---------- */
  var SUB_ICON = { Flagships:'smartphone','Mid-range':'smartphone',Foldables:'smartphone',Rugged:'smartphone',Ultrabooks:'laptop','Gaming Laptops':'gamepad',Tablets:'laptop','2-in-1':'layers',Headphones:'headphones',Earbuds:'headphones',Speakers:'zap','Hi-Fi DACs':'battery',Smartwatches:'watch','Fitness Bands':'chart','Smart Rings':'sparkles','Hubs & Assistants':'home',Lighting:'sun','Security Cameras':'camera','Plugs & Sensors':'zap',Consoles:'gamepad',Controllers:'gamepad','VR Headsets':'eye','Streaming Gear':'send',Mirrorless:'camera','Action Cams':'camera',Drones:'drone','Gimbal Stabilizers':'layers','Chargers & Power':'zap','Cables & Docks':'link',Keyboards:'grid',Mice:'mapNav' };

  function art(p, variantIdx) {
    var cat = catBySlug(p.category) || { hue: 250 };
    variantIdx = variantIdx || 0;
    var r = rng('art:' + p.id + ':' + variantIdx);
    var h = cat.hue + intR(r, -14, 22);
    var h2 = (h + intR(r, 70, 150)) % 360;
    var rot = -18 + intR(r, 0, 36);
    var cx = 110 + intR(r, -16, 16), cy = 104 + intR(r, -12, 12);
    var iconName = p.icon || SUB_ICON[p.subcategory] || cat.icon;
    var path = FR_ICON_RAW[iconName] || FR_ICON_RAW.package;
    var dots = '';
    for (var d = 0; d < 5; d++) {
      dots += '<circle cx="' + intR(r, 6, 214) + '" cy="' + intR(r, 6, 190) + '" r="' + (r() * 2.6 + .8).toFixed(1) + '" fill="#fff" opacity=".14"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 200">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="hsl(' + h + ',72%,58%)"/><stop offset="1" stop-color="hsl(' + h2 + ',74%,40%)"/></linearGradient>' +
      '<radialGradient id="hl" cx=".72" cy=".24" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="230" height="200" fill="url(#g)"/><rect width="230" height="200" fill="url(#hl)"/>' +
      '<g stroke="#ffffff" stroke-opacity=".12" fill="none"><circle cx="' + cx + '" cy="' + cy + '" r="84"/><circle cx="' + cx + '" cy="' + cy + '" r="116" opacity=".7"/></g>' + dots +
      '<g transform="translate(47 40) scale(5.9)" fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="--sc:1">' + path + '</g></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------- lookups ---------- */
  var BY_ID = {}, BY_SLUG = {};
  PRODUCTS.forEach(function (p) { BY_ID[p.id] = p; BY_SLUG[p.slug] = p; });
  function byId(id) { return BY_ID[id] || null; }
  function bySlug(s) { return BY_SLUG[s] || null; }
  /* register synthetic catalogue items (gift cards, Care+ plans) on any page */
  function ensurePseudo(p) { if (!BY_ID[p.id]) { PRODUCTS.push(p); BY_ID[p.id] = p; BY_SLUG[p.slug] = p; } return BY_ID[p.id]; }
  function img(p, v) { return art(p, v || 0); }
  function money(n) { try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); } catch (e) { return '$' + n.toFixed(2); } }
  function faqless() {}

  /* trending/new/deal/hero picks */
  var TRENDING = PRODUCTS.slice().sort(function (a, b) { return b.popularity - a.popularity; }).slice(0, 8);
  var NEW_ARRIVALS = PRODUCTS.filter(function (p) { return p.stock !== 'out'; }).sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).slice(0, 10);
  var BEST_SELLERS = PRODUCTS.slice().sort(function (a, b) { return (b.reviews * b.rating) - (a.reviews * a.rating); }).slice(0, 12);

  var dealProduct = (function () {
    var audioDeals = PRODUCTS.filter(function (p) { return p.category === 'audio' && p.oldPrice && p.price > 80 && p.price < 320 && p.stock === 'in'; })
      .sort(function (a, b) { return b.discount - a.discount; });
    return audioDeals[0] ||
      PRODUCTS.filter(function (p) { return p.oldPrice && p.stock === 'in'; }).sort(function (a, b) { return b.discount - a.discount; })[0] ||
      PRODUCTS[2];
  })();

  var heroSlides = [
    { pid: byId(dealProduct.id) ? pickHero('audio') : null, kicker: 'LIMITED DROP', title: 'Hear every layer of silence.', sub: 'Flagship adaptive noise cancellation, lossless audio and marathon battery life — in the lightest frame we have ever built.', tone: 'from violet' },
    { pid: pickHero('smartphones'), kicker: 'NEW ARRIVAL', title: 'The phone that thinks ahead.', sub: 'On-device AI photography, an LTPO display that sips power, and all-day stamina in aerospace-grade titanium.', tone: '' },
    { pid: pickHero('gaming'), kicker: 'GAMING SEASON', title: 'Play beyond limits.', sub: 'Ray-traced worlds at 120fps with sub-1ms wireless response. Your squad will hear you coming — and losing.', tone: '' }
  ];
  function pickHero(slugish) {
    var list = PRODUCTS.filter(function (p) { return p.category === slugish && p.price > 150 && p.rating >= 4.5 && p.stock === 'in'; });
    list.sort(function (a, b) { return b.rating - a.rating; });
    return list[0];
  }
  heroSlides.forEach(function (s) { if (!s.pid) s.pid = TRENDING[0]; });

  /* ---------- blog ---------- */
  var BCATS = ['Tech News', 'Reviews', 'How-To', 'Buying Guides', 'Industry Trends'];
  var AUTHORS = [
    { name: 'Maya Chen', role: 'Senior Editor', bio: 'Ten years covering consumer tech. Believes good tech should feel invisible.' },
    { name: 'Diego Alvarez', role: 'Reviews Lead', bio: 'Benchmarks everything twice, owns more dongles than sense.' },
    { name: 'Aisha Okafor', role: 'Staff Writer', bio: 'Stories about how gadgets shape cities, homes, and commutes.' },
    { name: 'Tom Reinholt', role: 'Audio Specialist', bio: 'If it makes sound or cancels it, Tom has measured it.' },
    { name: 'Priya Raman', role: 'Contributor', bio: 'Explains hard specs in plain language. Ask her about batteries.' },
    { name: 'Leo Marchetti', role: 'Photography Editor', bio: 'Cameras old and new; pixels are pixels.' },
    { name: 'Sana Iqbal', role: 'How-To Editor', bio: 'Turns twelve-step tutorials into three.' },
    { name: 'Jonas Weber', role: 'Industry Analyst', bio: 'Reads supply-chain tea leaves so you do not have to.' }
  ];
  var BLOG_TITLES = {
    'Tech News': ['The Foldables Are Finally Getting Normal', 'USB-C Wins Everywhere: What Changes for You', 'Smart Home Standards Truce Is Real — We Tested It', 'Why Every 2026 Flagship Has an On-Device AI Chip', 'Satellite Messaging Goes Mainstream', 'The Repairability Report Card: Winners and Flops'],
    Reviews: ['We Wore 12 Smartwatches for a Month — Here Is the Verdict', 'This $99 DAC Embarrasses $500 Ones', 'Review: The Laptop That Lasts Two Workdays', 'Five Noise-Cancelling Headphones, One Subway Ride', 'Hands On With the Fastest Charging Phone Ever Sold', 'The Tiny Drone That Fits a Jacket Pocket — Full Test'],
    'How-To': ['Calibrate Your TV in Ten Minutes, No Gear Needed', 'Make Any Old Speaker a Smart Speaker for $20', 'Stop Ads Following You Across Devices: A Checklist', 'Extend Battery Lifespan: The Settings That Actually Matter', 'Set Up Matter Tonight Without Breaking Everything', 'Back Up Your Phone Like a Professional Does'],
    'Buying Guides': ['Every Kind of Earbud, Ranked by What You Actually Do', 'Which Smartwatch Tier Is Right for You?', 'Gaming Monitor Cheat Sheet: Refresh vs Resolution', 'Home Camera Buying Guide: Privacy First', 'Best Budget Phones That Do Not Feel Cheap', 'Keyboard Switches Explained Like You Have Five Minutes'],
    'Industry Trends': ['The Quiet Rise of Subscription Hardware', 'Chipmakers Bet Big on Efficient Cores', 'What the Repairability Laws Change by 2027', 'Audio Brands Are Racing to Lossless — Why Now', 'Retail After QR Codes: How We Shop Next', 'The Second Screen Economy Comes to Wearables']
  };
  var PARA_POOL = [
    'The short version: the gap between marketing claims and real-world behaviour keeps shrinking, but not evenly across categories, and the details are exactly where the value hides.',
    'We ran each scenario twice — once fresh out of the box, once after a week of daily use — because spec sheets never account for firmware settling and habit forming.',
    'What surprised us was not the headline number. It was consistency: doing the ordinary thing well, repeatedly, without thermal drama or software tantrums.',
    'There is a reason veterans wait for the second revision. Early units optimize benchmarks; mature units optimize mornings.',
    'Battery results below assume mixed use rather than looped video, which flatters nobody and matches nobody.',
    'If you only change one setting today, make it this one — the difference shows up in minutes, not months.',
    'Competitors will match the specs within two quarters. What they will not match as quickly is the fit-and-finish: hinge tension, haptic tuning, the way menus land where your thumb expects them.',
    'Our advice has not changed since last year, though we say it quieter now that more of you agree: buy for the platform, not the party trick.',
    'Under sustained load the numbers tell a familiar story — impressive sprints, honest marathons, and one outlier that refuses both.',
    'Two features arrived in the same firmware update; one is delightful and the other feels like an apology for the first. Users, as ever, keep both toggles close.'
  ];
  var BLOG = [];
  (function genBlog() {
    var k = 0;
    BCATS.forEach(function (bc) {
      BLOG_TITLES[bc].forEach(function (title, i) {
        var r = rng('blog:' + bc + ':' + i);
        var author = AUTHORS[k % AUTHORS.length];
        var days = 3 + (k * 4) % 130;
        var date = new Date(Date.now() - days * 86400000);
        var paras = [];
        paras.push(PARA_POOL[(hash(title)) % PARA_POOL.length]);
        paras.push(PARA_POOL[(hash(title) >> 3) % PARA_POOL.length]);
        var tags = [];
        var tp = ['audio', 'phones', 'laptops', 'wearables', 'smart-home', 'gaming', 'cameras', 'ai', 'privacy', 'batteries'];
        var tn = 2 + intR(r, 0, 2);
        for (var tI = 0; tI < tn; tI++) tags.push(tp[intR(r, 0, tp.length - 1)]);
        BLOG.push({
          id: k + 1,
          title: title, category: bc, tags: tags,
          author: author.name, authorRole: author.role, authorBio: author.bio,
          date: date.toISOString().slice(0, 10),
          readTime: intR(r, 4, 13),
          excerpt: paras[0].slice(0, 140) + '…',
          coverSeed: 'blogcover:' + (k + 1),
          body: buildArticle(paras, title)
        });
        k++;
      });
    });
    function buildArticle(paras, title) {
      var sections = ['The short answer', 'What changed under the hood', 'Real-world testing notes', 'Who should care'];
      var html = '<p class="lead">' + paras[0] + '</p>';
      sections.forEach(function (h, idx) {
        html += '<h2>' + h + '</h2><p>' + paras[(idx + 1) % paras.length] + '</p>';
        if (idx === 1) html += '<ul><li>Better thermals under sustained load</li><li>Double the offline capability</li><li>Standby drain cut roughly in half</li><li>One genuinely useful new gesture</li></ul>';
        if (idx === 2) html += '<blockquote>"' + title + ' might read like a niche story. It is not — every category eventually inherits whatever wins here." — The FRONTIER Editorial Desk</blockquote><p>' + paras[idx % paras.length] + '</p>';
      });
      return html;
    }
  })();
  var POPULAR_POSTS = BLOG.slice().sort(function (a, b) { return hash(b.title) % 97 - hash(a.title) % 97; }).slice(0, 5);

  /* ---------- testimonials ---------- */
  var QUOTES = [
    'Ordered Tuesday, unboxed Wednesday morning, and the packaging alone felt like a gift I had given myself.',
    'Support talked my dad through setup over chat for forty minutes. Who does that anymore? These folks do.',
    'I returned one model for another and the swap took four days door-to-door. Zero friction, zero guilt trip.',
    'The battery life claims turned out conservative, which honestly never happens.',
    'It is rare that a store curates instead of dumps. I bought three things and regret none.',
    'Checkout took under a minute and tracking updates actually arrive before I think to check.',
    'The bundle pricing made building my desk setup painless. Quality across every item is consistent.',
    'Got a personal note in the box asking if anything fell short. Nothing did, but I kept the note anyway.',
    'Their comparison tool saved me from buying the wrong laptop twice. Genuinely smarter than me.',
    'Exchanged a colour like trading cards as a kid — except faster and with free shipping labels.',
    'My smart home starter kit paired with literally every gadget I already owned. Thank you, standards.',
    'Prices beat everywhere else by enough that I checked twice whether they were grey imports. They were not.',
    'Customer service answered at 1am when my flight was boarding and saved my order. Superhuman hours.',
    'Warranty claim approved in an afternoon with prepaid pickup. This is what confidence looks like.',
    'Everything I own from here still looks new. Turns out quality control is a feature you can feel.',
    'Newsletter is worth staying subscribed to — one heads-up about a flash sale paid for itself instantly.',
    'They remembered my size... er, colour preference, from six months ago. Store felt human.',
    'Fourteen devices in this house now carry the same ecosystem. My Wi-Fi grid finally makes sense.',
    'Lost courier nightmare — support re-shipped before I even finished filing the complaint form.',
    'I test products for a living and still buy here, because they get returns and warranty right.',
    'Gift-wrapped, message included, delivered on her birthday despite ordering at 11pm the night before.',
    'The live chat bot escalated straight to a human exactly when it should. Modern retail, done respectfully.'
  ];
  var FIRST = ['Sarah', 'Marcus', 'Elena', 'James', 'Aiko', 'Noah', 'Fatima', 'Lucas', 'Grace', 'Andre', 'Yuki', 'Benjamin', 'Zara', 'Oliver', 'Mia', 'Carlos', 'Priya', 'Daniel', 'Nina', 'Victor', 'Leila', 'Sam'];
  var LAST = ['Whitfield', 'Grant', 'Petrova', 'Osei', 'Tanaka', 'Miller', 'Haddad', 'Silva', 'Novak', 'Laurent', 'Kim', 'Brooks', 'Aziz', 'Bennett', 'Costa', 'Reyes', 'Sharma', 'Wu', 'Kovacs', 'Duval', 'Amari', 'Taylor'];
  var TESTIMONIALS = QUOTES.map(function (q, i) {
    var r = rng('testi:' + i);
    var stars = r() < 0.75 ? 5 : 4;
    return { id: i + 1, name: FIRST[i] + ' ' + LAST[i], city: pick(r, ['Austin TX', 'Berlin', 'Toronto', 'Singapore', 'London', 'Sydney', 'Lisbon', 'Denver CO']), rating: stars, text: q, product: pick(r, PRODUCTS).id };
  });

  /* ---------- team ---------- */
  var TEAM_ROLES = ['Chief Executive Officer', 'Chief Technology Officer', 'Head of Product Design', 'VP Customer Experience', 'Logistics Director', 'Quality Assurance Lead', 'Head of Partnerships', 'Senior Firmware Engineer', 'UX Research Manager', 'Community Manager', 'Sustainability Officer', 'Data Platform Architect'];
  var TEAM_FIRST = ['Amara', 'Kenji', 'Sofia', 'Malik', 'Ingrid', 'Rafael', 'Chloe', 'Devansh', 'Freya', 'Mateo', 'Ling', 'Gabriel'];
  var TEAM_LAST = ['Okonkwo', 'Sato', 'Mendez', 'Farah', 'Larsen', 'Cardoso', 'Dubois', 'Menon', 'Schmidt', 'Vega', 'Zhou', 'Moretti'];
  var TEAM = TEAM_ROLES.map(function (role, i) {
    var r = rng('team:' + i);
    return { name: TEAM_FIRST[i] + ' ' + TEAM_LAST[i], role: role, hue: (i * 31) % 360, quote: pick(r, ['Great products begin with listening.', 'Details compound.', 'Ship less, polish more.', 'Kindness scales.', 'Data tells stories; we write endings.', 'Reliability is a love language.', 'Curiosity is the job description.', 'Bugs fear documentation.', 'Empathy beats personas.', 'Communities build brands.', 'Green is the default, not a feature.', 'Numbers breathe when visualized.']), city: pick(r, ['Berlin HQ', 'San Francisco', 'Taipei', 'London', 'Stockholm', 'Singapore']) };
  });

  /* ---------- FAQ (hand-written, grouped) ---------- */
  var FAQ_GROUPS = [
    { name: 'Orders', slug: 'orders', items: [
      ['Can I change or cancel my order after placing it?', 'You can modify or cancel any order while its status is "Processing" from Account → Orders → Order Details. Once an order ships it can no longer be edited, but our standard 30-day return window always applies.'],
      ['Do I need an account to order?', 'No — guest checkout is fully supported at checkout. An account simply gives you order history, saved addresses, wishlist syncing and faster repeat purchases.'],
      ['How do promo codes work?', 'Enter the code in the Discount field on the cart page and press Apply. Codes cannot be combined, and some exclude already-discounted items — the cart always shows the better available combination automatically.'],
      ['Can I buy a gift card with a gift card?', 'Yes, gift card balances may be used toward additional gift cards. Balances never expire and apply across the entire catalogue.'],
      ['Where do I find my invoice?', 'Every confirmed order includes a downloadable PDF invoice under Account → Orders → Order Details → Download Invoice. Guests receive the same link by email.'],
      ['I received the wrong item — what now?', 'Contact support within 48 hours via the Help Center ticket form or live chat. We ship the correct item immediately with a prepaid return label for the incorrect one; no waiting on receipt.'],
      ['Can I reserve an item that is out of stock?', 'Yes. Choose "Notify me at launch price" on any sold-out product page and you will get one email the moment inventory lands — no auto-charges, no obligation.'],
      ['Are prices shown including tax?', 'Prices are pre-tax by default. Estimated sales/VAT tax is calculated transparently at checkout based on your shipping address before payment.']
    ]},
    { name: 'Shipping', slug: 'shipping', items: [
      ['When does my order ship?', 'Orders placed before 2pm local warehouse time ship the same business day; after that, next business day. Weekends and public holidays add one day to handling.'],
      ['Is free shipping really free?', 'Yes — orders over $99 ship free on standard delivery in all domestic zones, tracked end-to-end. No membership, no minimum category mix.'],
      ['Which countries do you ship to?', 'We currently serve 42 countries across North America, Europe, Asia-Pacific and parts of South America. International duties and taxes are calculated and prepaid at checkout — no surprise invoices on delivery.'],
      ['Do you offer express delivery?', 'Express (1–2 business days) and Overnight options appear at checkout whenever your address supports them, with exact cutoff times shown live.'],
      ['Can I ship to a parcel locker?', 'Absolutely. Enter the locker address plus your locker ID at checkout; most lockers within supported carrier networks qualify for free standard shipping too.'],
      ['How is shipping cost calculated?', 'Standard rates start at $5.90 based on distance zone and dimensional weight. The final figure is always quoted in full on the checkout page before you pay.'],
      ['My tracking has not updated in days — help?', 'Carrier scans occasionally batch late, especially through customs. If there is no movement for 72 hours, open a ticket from the Tracking page and we will investigate with the carrier within one business day.'],
      ['Do shipments require a signature?', 'Only high-value orders (over $500) require signature-on-delivery by default. You can opt into signature protection free of charge during checkout.'],
      ['What are your delivery guarantees?', 'Standard deliveries carry a 95%+ on-time record; express services are guaranteed by the carrier — missed guaranteed windows trigger automatic partial refunds of shipping costs, no forms needed.']
    ]},
    { name: 'Returns & Warranty', slug: 'returns', items: [
      ['What is your return window?', '30 days from delivery for nearly everything, worn tech bands and opened ear tips included, provided the device itself is undamaged beyond normal evaluation use.'],
      ['How do refunds work?', 'Refunds are issued to your original payment method within 1–2 business days of our warehouse receiving your return; banks post them in a further 2–5 days. Gift card purchases refund to store credit instantly on scan-in.'],
      ['Is the return label free?', 'Domestic returns use a prepaid label included in every box, or printable from the Returns page. International exchanges split label costs 50/50 unless the item is faulty — then we cover everything.'],
      ['Do I need original packaging to return?', 'Not strictly. Include everything you reasonably can, especially cables and accessories; missing core accessories may deduct a small restocking percentage, stated upfront before you confirm.'],
      ['What does the 2-year warranty cover?', 'Manufacturing defects, component failures, and battery capacity dropping below 60% within the period. Accidental damage, water intrusion beyond rated IP level, and unauthorized modifications sit outside coverage.'],
      ['How long do warranty repairs take?', 'Most repairs complete within 7–10 business days including transit. Express replacement ships instantly for in-stock items with a deposit-free hold on your card until the faulty unit arrives back.'],
      ['Does opening the box void the warranty?', 'Never — evaluating a product is expected. Only physical disassembly or third-party repair marks affect coverage, and even then only for the affected part.'],
      ['Can I extend my warranty?', 'Yes — FRONTIER Care+ adds accidental damage protection and battery service for 1, 2, or 3 extra years. Add it at product checkout or within 60 days of purchase from the Warranty page.'],
      ['How do I register a product for warranty?', 'Registration is automatic when you order signed-in. For gifts, register a serial at Warranty → Register Product and warranty starts from delivery date regardless of who bought it.']
    ]},
    { name: 'Payments', slug: 'payments', items: [
      ['Which payment methods do you accept?', 'Major credit/debit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, Google Pay, gift cards, and buy-now-pay-later partners where available. Crypto checkout is offered in select regions.'],
      ['Is my payment information secure?', 'PCI-DSS Level 1 tokenized processing, TLS 1.3 everywhere, and zero card data stored on our servers. We see only issuer-approved tokens, same as you would find inside major banking apps.'],
      ['When am I charged?', 'At order placement for in-stock items; authorization releases instantly for cancelled lines. Pre-orders charge at ship-out — you will be reminded 48 hours prior either way.'],
      ['Why was my card declined?', 'Issuer-side security rules cause most declines — many vanish on retry or after verifying with your bank. Alternative methods at checkout work immediately; contact us if issues persist and we can escalate to the processor.'],
      ['Do you support split payments?', 'Yes — combine gift card balance with any other method at checkout automatically; the remaining balance settles to whichever method you select first.'],
      ['Can I get a price adjustment after a sale starts?', 'Within 7 days of your purchase we will refund the difference to your original payment method if our own price drops. Chat "price match me" with your order number.'],
      ['Are installments interest free?', 'BNPL plans shown at checkout are 0% APR for standard 4-pay schedules; longer terms carry clearly displayed fixed fees before confirmation. Always.'],
      ['How do gift cards work?', 'Digital gift cards deliver by email in minutes with your message. At checkout enter the 16-character code; balances apply per-order and persist indefinitely for the remainder.']
    ]},
    { name: 'Products', slug: 'products', items: [
      ['Are your products authentic and region-compliant?', 'Every unit is sourced directly from manufacturers or authorized regional distributors, with local plugs, radios and warranty eligibility. Serials verify against maker databases.'],
      ['What does "Certified Refurbished" mean here?', 'Factory or authorized-lab refurbished units with new batteries, current firmware, cosmetic grading published per-device, and the same 2-year warranty as new — priced 15–35% lower.'],
      ['Will this work in my country?', 'Each product page lists radio certifications and plug types under Specifications → Connectivity. The Shipping Estimator also flags any regional limitation before checkout.'],
      ['How accurate are the spec tables?', 'Manufacturer-published specifications, verified against retail units where we physically stock them. Where sources conflict we publish both and mark the discrepancy.'],
      ['Do phones ship unlocked?', 'All devices ship factory-unlocked for global GSM networks. Specific 5G band support varies by model — check the bands table under Specs.'],
      ['Is stock information live?', 'Warehouse counts sync every 15 minutes. "Low stock" means fewer than eight units remain; reservations are honoured 90 minutes past add-to-cart time-outs during promotions.'],
      ['Can I request a product you do not list?', 'Yes — the Support Center accepts sourcing requests. Popular ones graduate into our catalogue within weeks, with priority notification to everyone who asked.'],
      ['Do bundles save money?', 'Consistently 8–15% versus separate items. Builder tools on compatible categories construct valid bundles automatically and show savings live.'],
      ['What comes in the box?', 'Full contents list appears on each product page under Specifications → In the Box — including region-specific adapter variants when applicable.']
    ]},
    { name: 'Account & Privacy', slug: 'account', items: [
      ['How do I delete my account?', 'Account → Settings → Danger Zone → Delete Account requests permanent removal. We email a final confirmation link, then erase personal data within 30 days minus legally required records.'],
      ['What data do you collect?', 'Order fulfilment essentials, device/browser basics for site functionality, and optional preference signals. The full ledger lives in our Privacy Policy — written plainly, not lawyerly.'],
      ['Do you sell my data?', 'No. Analytics are aggregated and anonymized; marketing emails require explicit opt-in. Ad interactions are limited to contextual signals, never cross-site profiles.'],
      ['How do I enable two-factor authentication?', 'Settings → Security → Enable 2FA supports TOTP apps (Authy, Google Authenticator) and hardware keys. Recovery codes print once — store them somewhere analog.'],
      ['I forgot my password — now what?', 'Use Forgot Password on the login page. Reset links expire in 60 minutes and invalidate once used; sessions on other devices optionally sign out simultaneously.'],
      ['Can I merge duplicate accounts?', 'Yes — Support handles merges preserving orders, wishlist items and loyalty status from both accounts onto whichever email you nominate.'],
      ['How do notification preferences sync?', 'Email/SMS/push switches in Settings → Notifications control transactional depth separately from marketing. Transactional messages (receipts, shipping alerts) always remain opt-out-safe.'],
      ['Is my wishlist visible to others?', 'Private by default. Shared wishlists expose only titles and images — never your email, address, or purchase history.'],
      ['Children using the store?', 'Accounts require 16+. Purchases flow through verified adult payment instruments; our privacy policy contains a dedicated children’s section with parental contact details.']
    ]}
  ];
  var FAQ_COUNT = FAQ_GROUPS.reduce(function (n, g) { return n + g.items.length; }, 0);

  /* announcement + footer misc */
  var ANNOUNCEMENTS = [
    ['truck', 'Free shipping on orders over $99'],
    ['tag', 'Code <b>FRONTIER10</b> — 10% off your first order'],
    ['sparkles', 'New arrivals: Quantum X Series just landed'],
    ['refresh', '30-day money-back guarantee on everything']
  ];

  return {
    cats: CATS, brands: BRANDS, colors: COLORS, connect: CONNECT,
    products: PRODUCTS, productById: byId, productBySlug: bySlug, img: img, money: money,
    ensurePseudo: ensurePseudo,
    trending: TRENDING, newArrivals: NEW_ARRIVALS, bestSellers: BEST_SELLERS,
    deal: dealProduct, heroSlides: heroSlides, subIcon: SUB_ICON,
    blogCats: BCATS, posts: BLOG, popularPosts: POPULAR_POSTS, authors: AUTHORS,
    testimonials: TESTIMONIALS, team: TEAM,
    faqGroups: FAQ_GROUPS, faqCount: FAQ_COUNT,
    announcements: ANNOUNCEMENTS, rng: rng
  };
})();
