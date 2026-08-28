/* FRONTIER — HTML shell generator. Run: node tools/build-pages.mjs */
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* inline icon helper parsed from js/icons.js so static markup matches runtime */
const ICONS_SRC = readFileSync(join(ROOT, 'js/icons.js'), 'utf8');
const ICON_MAP = {};
for (const m of ICONS_SRC.matchAll(/^\s{4}(\w+): '((?:[^'\\]|\\.)*)'/gm)) {
  ICON_MAP[m[1]] = m[2].replace(/\\'/g, "'");
}
const I = (name, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_MAP[name] || ''}</svg>`;

const SHARED = ['icons.js', 'data.js', 'store.js', 'ui.js', 'layout.js'];
const PAGES_DIR = 'js/pages/';
/* pageKey -> page module(s) from js/pages/ that the shell must load */
const PAGE_MODULES = {
  home: ['home'], shop: ['shop'], product: ['product'], about: ['about'],
  blog: ['blog'], 'blog-post': ['blog'], contact: ['content'],
  cart: ['commerce'], checkout: ['commerce'], confirmation: ['commerce'], tracking: ['commerce'],
  wishlist: ['wishlist'], login: ['account'], account: ['account'],
  compare: ['catalog'], categories: ['catalog'], search: ['catalog'],
  faq: ['content'], 'gift-cards': ['content'], support: ['content'],
  privacy: ['misc'], terms: ['misc'], 'shipping-returns': ['misc'], warranty: ['misc'],
  '404': ['misc'], newsletter: ['misc'], sitemap: ['misc'], accessibility: ['misc']
};

const FAVICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="#6C5CE7"/><path d="M13 10h15l-2.6 5.4H18v4h6.8L22.2 25H18v7h-5V10Z" fill="#fff"/></svg>');
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">';

function page(file, title, desc, body, pageKey, pageScripts) {
  pageKey = pageKey || file.replace('.html', '').replace('404', '404');
  const mods = (pageScripts && pageScripts.length ? pageScripts : PAGE_MODULES[pageKey] || [])
    .map(s => s.endsWith('.js') ? s.slice(0, -3) : s);
  const scripts = [...SHARED, ...mods.map(m => PAGES_DIR + m + '.js'), 'main.js']
    .map(s => `<script src="js/${s.startsWith('js/') ? s.slice(3) : s}?v=22" defer></script>`).join('\n    ');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="${file === 'index.html' ? 'website' : 'page'}">
  <meta property="og:site_name" content="FRONTIER">
  <meta name="theme-color" content="#0A0A0F">
  <link rel="icon" href="${FAVICON}">
  ${FONTS}
  <link rel="stylesheet" href="css/base.css?v=22">
  <link rel="stylesheet" href="css/components.css?v=22">
  <link rel="stylesheet" href="css/pages.css?v=22">
</head>
<body data-page="${pageKey}">
<main id="main" class="page-enter">
${body}
</main>
    ${scripts}
</body>
</html>
`;
}

const W = {};
const add = (f, t, d, body, key, s) => { W[f] = page(f, t, d, body, key, s); };

/* ════════════════ HOME ════════════════ */
add('index.html', 'FRONTIER — Premium Smart Gadgets & Cutting-Edge Tech',
  'Discover 200+ curated smart gadgets: flagship phones, ANC audio, wearables, smart home, gaming and drones. Free shipping over $99 · 2-year warranty · 30-day returns.', `
<section class="hero mesh noise" aria-label="Featured products">
  <div id="particleHost" style="position:absolute;inset:0;overflow:hidden;z-index:-1"></div>
  <div class="container" style="position:relative;z-index:2;width:100%">
    <div data-hero-track></div>
  </div>
  <button class="hero-arrow prev" data-hero-prev aria-label="Previous slide">${I('chevLeft')}</button>
  <button class="hero-arrow next" data-hero-next aria-label="Next slide">${I('chevRight')}</button>
  <div class="hero-dots" role="tablist" aria-label="Hero slides"></div>
</section>

<section class="container" aria-label="Store highlights">
  <div class="trust-strip">
    <div class="trust-item reveal"><span class="t-ico">${I('truck')}</span><div><b>Free Shipping</b><span>On orders over $99</span></div></div>
    <div class="trust-item reveal" data-delay="1"><span class="t-ico">${I('shield')}</span><div><b>2-Year Warranty</b><span>On everything we sell</span></div></div>
    <div class="trust-item reveal" data-delay="2"><span class="t-ico">${I('refresh')}</span><div><b>30-Day Returns</b><span>No questions asked</span></div></div>
    <div class="trust-item reveal" data-delay="3"><span class="t-ico">${I('chat')}</span><div><b>24/7 Support</b><span>Humans + AI concierge</span></div></div>
  </div>
</section>

<section class="section container" aria-labelledby="catsH">
  <div class="section-head reveal in-view">
    <div><h2 id="catsH">Shop by category</h2><p>Eight worlds of technology, obsessively curated.</p></div>
    <a class="btn btn-secondary" href="categories.html">All categories ${I('arrowRight', 15)}</a>
  </div>
  <div class="grid grid-4" data-cat-cards></div>
</section>

<section class="section" style="background:var(--surface)" aria-labelledby="naH">
  <div class="container">
    <div class="section-head reveal in-view">
      <div><h2 id="naH">New arrivals</h2><p>Fresh drops from the last 45 days.</p></div>
      <a class="btn btn-link" href="shop.html">See all new →</a>
    </div>
    <div class="h-scroll-wrap">
      <button class="icon-btn h-arrow prev" data-scroll-btn="-1" aria-label="Scroll new arrivals left" style="background:var(--surface)">${I('chevLeft')}</button>
      <div class="h-scroll" data-new-arrivals></div>
      <button class="icon-btn h-arrow next" data-scroll-btn="1" aria-label="Scroll new arrivals right" style="background:var(--surface)">${I('chevRight')}</button>
    </div>
  </div>
</section>

<section class="section container" aria-labelledby="trH">
  <div class="section-head reveal in-view">
    <div><h2 id="trH">Trending now</h2><p>What the FRONTIER community is eyeing this week.</p></div>
    <a class="btn btn-link" href="shop.html?sort=popular">Most popular →</a>
  </div>
  <div class="products-grid grid grid-3" id="trendingGrid" data-trending></div>
</section>

<section class="section container" aria-label="Deal of the day">
  <div class="deal-card" data-deal-block></div>
</section>

<section class="section container" style="padding-block:36px" aria-label="Our brands">
  <p class="tiny text-dim mono center-text" style="text-align:center;letter-spacing:.22em;margin-bottom:22px">TRUSTED BY THE WORLD'S LEADING TECH BRANDS</p>
  <div class="marquee" data-marquee></div>
</section>

<section class="section" style="background:var(--surface)" aria-labelledby="whyH">
  <div class="container">
    <div class="section-head reveal in-view"><div><h2 id="whyH">Why choose FRONTIER?</h2><p>Premium retail is a craft. Here is ours.</p></div></div>
    <div class="grid grid-4">
      <div class="feature-block reveal"><div class="ico">${I('sparkles')}</div><h3 class="small" style="font-size:1rem;margin-bottom:8px">Curated, never cluttered</h3><p class="text-dim small">Every product passes a 40-point hands-on review before it earns a spot.</p></div>
      <div class="feature-block reveal" data-delay="1"><div class="ico">${I('truck')}</div><h3 class="small" style="font-size:1rem;margin-bottom:8px">Same-day dispatch</h3><p class="text-dim small">Order before 2pm and it leaves our warehouse today — tracked door to door.</p></div>
      <div class="feature-block reveal" data-delay="2"><div class="ico">${I('shield')}</div><h3 class="small" style="font-size:1rem;margin-bottom:8px">Double warranty</h3><p class="text-dim small">Two years standard on everything, with instant advance replacement.</p></div>
      <div class="feature-block reveal" data-delay="3"><div class="ico">${I('refresh')}</div><h3 class="small" style="font-size:1rem;margin-bottom:8px">Painless returns</h3><p class="text-dim small">30 days, free label in every box, refunds within two days of arrival.</p></div>
    </div>
  </div>
</section>

<section class="section container" aria-labelledby="tsH">
  <div class="section-head reveal in-view">
    <div><h2 id="tsH">Loved by 480,000+ customers</h2><p>Verified reviews across 42 countries — average rating 4.8★.</p></div>
    <a class="btn btn-link" href="faq.html#reviews">Read all reviews →</a>
  </div>
  <div class="testi-track" data-testimonials></div>
</section>

<section class="section" style="background:var(--surface)" aria-labelledby="blH">
  <div class="container">
    <div class="section-head reveal in-view">
      <div><h2 id="blH">From the FRONTIER Journal</h2><p>Honest reviews and guides that respect your intelligence.</p></div>
      <a class="btn btn-secondary" href="blog.html">All articles ${I('arrowRight', 15)}</a>
    </div>
    <div class="grid grid-3" data-blog-picks></div>
  </div>
</section>

<section class="section container" aria-label="Newsletter signup">
  <div class="news-band mesh reveal in-view">
    <h2 style="color:#fff">Join 130,000 insiders</h2>
    <p style="opacity:.9;max-width:44ch;margin:10px auto 0">Flash sales, launch invites and one genuinely good tech read per week. Unsubscribe anytime.</p>
    <form data-news-form novalidate="">
      <input type="email" required placeholder="you@email.com" aria-label="Email address">
      <button class="btn" type="submit" style="background:#fff;color:#151527;border:none">Subscribe ${I('arrowRight', 15)}</button>
    </form>
    <p class="tiny" style="opacity:.75;margin-top:14px">$10 welcome coupon after confirmation 🔒 No spam, ever</p>
  </div>
</section>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","name":"FRONTIER","url":"https://frontier.example","logo":"https://frontier.example/favicon.svg","sameAs":[],"contactPoint":{"@type":"ContactPoint","contactType":"customer support","availableLanguage":["en"]}}
</script>
`, 'home');

/* ════════════════ SHOP ════════════════ */
add('shop.html', 'Shop All Products | FRONTIER', 'Filter and sort 224 premium smart gadgets by category, price, brand, rating, connectivity and battery life.', `
<div class="container">
  <nav class="breadcrumb" aria-label="Breadcrumb" data-breadcrumb></nav>
  <header style="margin-bottom:26px" class="reveal in-view">
    <h1>All products</h1>
    <p class="text-dim">224 gadgets · updated daily · only what passed our lab tests.</p>
  </header>
  <div class="shop-layout">
    <aside class="filter-sidebar" aria-label="Product filters">
      <div class="filter-group"><button class="filter-head" type="button">Category ${I('chevDown', 15)}</button>
        <div class="filter-body" data-filter-cats></div></div>
      <div class="filter-group"><div class="filter-head">Price range</div>
        <input type="range" class="range" data-price-role="min" data-price-min min="0" max="3000" value="0" aria-label="Minimum price">
        <input type="range" class="range" data-price-role="max" data-price-max min="0" max="3000" value="3000" aria-label="Maximum price">
        <div class="range-values" data-price-labels></div></div>
      <div class="filter-group"><div class="filter-head">Brand</div>
        <div class="filter-body" data-filter-brands></div></div>
      <div class="filter-group"><div class="filter-head">Rating</div>
        <div class="filter-body" data-filter-rating></div></div>
      <div class="filter-group"><div class="filter-head">Availability</div>
        <div class="filter-body flex center" id="stockGroup" data-filter-stock></div></div>
      <div class="filter-group"><div class="filter-head">Color</div>
        <div class="flex wrap" style="gap:10px;padding-top:12px" data-filter-colors></div></div>
      <div class="filter-group"><div class="filter-head">Connectivity</div>
        <div class="filter-body" data-filter-connect></div></div>
      <div class="filter-group" style="border:none"><div class="filter-head">Battery life</div>
        <div class="filter-body" data-filter-battery></div></div>
    </aside>
    <div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px" data-sub-list></div>
      <div class="shop-toolbar">
        <button class="btn btn-secondary btn-sm mobile-filter-btn" data-open-filters>${I('filter', 15)} Filters</button>
        <span class="small text-dim" data-counter>Showing products…</span>
        <div style="margin-left:auto;display:flex;gap:12px;align-items:center">
          <label class="tiny text-dim" for="sortSel" style="display:flex;align-items:center;gap:8px">Sort
            <select class="input" id="sortSel" data-sort style="padding:8px 34px 8px 13px;font-size:.85rem">
              <option value="popular">Most popular</option><option value="newest">Newest</option>
              <option value="price-asc">Price: low → high</option><option value="price-desc">Price: high → low</option>
              <option value="rating">Best rated</option><option value="sale">Biggest discount</option>
            </select></label>
          <div class="view-toggle" role="group" aria-label="View mode">
            <button class="active" data-view="grid" aria-label="Grid view">${I('grid', 16)}</button>
            <button data-view="list" aria-label="List view">${I('list', 16)}</button>
          </div>
        </div>
      </div>
      <div style="min-height:34px;display:flex;gap:8px;flex-wrap:wrap;align-items:center" data-active-chips></div>
      <div class="products-grid" data-results aria-live="polite"></div>
      <div style="display:grid;place-items:center;margin-top:34px">
        <button class="btn btn-ghost btn-lg" data-load-more>Load more products</button>
      </div>
    </div>
  </div>
</div>`, 'shop');

/* ════════════════ PRODUCT ════════════════ */
const rateStars = Array.from({ length: 5 }, (_, i) => `<button type="button" data-rate="${i + 1}" aria-label="${i + 1} star${i ? 's' : ''}">${I('star', 26)}</button>`).reverse().join('');
add('product.html', 'Product | FRONTIER', 'Full specifications, gallery, verified reviews and instant checkout.', `
<div id="pdRoot"></div>
<div class="container section" data-pd-tabs data-tabs-scope>
  <div class="tabs-bar" role="tablist">
    <button class="tab-btn active" data-tab="desc" role="tab" aria-selected="true">Description</button>
    <button class="tab-btn" data-tab="specs" role="tab" aria-selected="false">Specifications</button>
    <button class="tab-btn" data-tab="reviews" role="tab" aria-selected="false" id="reviews">Reviews</button>
    <button class="tab-btn" data-tab="shipping" role="tab" aria-selected="false">Shipping & returns</button>
    <span class="tab-indicator"></span>
  </div>
  <div class="tab-panel active" data-panel="desc">
    <div class="legal-doc" id="pdDescTab"></div>
  </div>
  <div class="tab-panel" data-panel="specs">
    <div class="table-wrap"><table class="tbl spec-table" id="pdSpecsTable"><tbody></tbody></table></div>
  </div>
  <div class="tab-panel" data-panel="reviews">
    <div class="review-bar">
      <div style="text-align:center;background:var(--surface);border:1px solid var(--border-soft);border-radius:var(--r-lg);padding:24px">
        <div class="rb-avg" id="pdAvgRating">—</div>
        <div style="margin:8px 0" id="pdAvgStars"></div>
        <span class="tiny text-dim" id="pdAvgCount"></span>
      </div>
      <div style="display:grid;gap:9px" data-rev-bars></div>
    </div>
    <div data-rev-list></div>
    <form class="co-panel" data-review-form style="margin-top:30px">
      <h3>Write a review</h3>
      <p class="small text-dim">Share the honest details other shoppers crave.</p>
      <div class="field"><label>Your rating</label><div class="rate-input">${rateStars}</div></div>
      <div class="field"><label for="rvTitle">Review headline</label><input class="input" id="rvTitle" required maxlength="60" placeholder="Sums it up in a sentence"></div>
      <div class="field"><label for="rvBody">Your experience</label><textarea class="input" id="rvBody" required placeholder="What worked, what didn't, who it's for…"></textarea></div>
      <button class="btn btn-primary" type="submit">Submit review</button>
    </form>
  </div>
  <div class="tab-panel" data-panel="shipping">
    <div class="grid grid-3">
      <div class="stat-card">${I('truck')}<b class="small">Free over $99</b><p class="text-dim tiny" style="margin-top:6px">Standard 3–5 business days, fully tracked.</p></div>
      <div class="stat-card">${I('zap')}<b class="small">Express options</b><p class="text-dim tiny" style="margin-top:6px">1–2 day express or overnight where available.</p></div>
      <div class="stat-card">${I('refresh')}<b class="small">30-day returns</b><p class="text-dim tiny" style="margin-top:6px">Prepaid label in every box, quick refunds.</p></div>
    </div>
    <a class="btn btn-primary" style="margin-top:22px" href="shipping-returns.html">Full shipping policy ${I('arrowRight', 15)}</a>
  </div>
</div>
<section class="section container" aria-labelledby="relH">
  <div class="section-head reveal in-view"><div><h2 id="relH">You may also like</h2><p>Hand-picked companions at similar price points.</p></div>
  <a class="btn btn-link" href="shop.html">Browse all →</a></div>
  <div class="products-grid grid grid-4" data-related></div>
</section>
<aside class="recently-viewed" aria-label="Recently viewed products"><div class="container rv-inner"></div></aside>
<div class="sticky-atc"><div class="container sticky-atc-inner"></div></div>`, 'product');

/* ════════════════ ABOUT ════════════════ */
add('about.html', 'About Us | FRONTIER', 'The story, values, team and milestones behind the internet\'s most obsessive smart gadget store.', `
<header class="section mesh noise" style="text-align:center">
  <div class="container" style="position:relative;z-index:1">
    <span class="badge hot">Since 2019</span>
    <h1 style="margin-top:16px;max-width:20ch;margin-inline:auto">Technology retail, treated as a <span class="grad-text">craft</span>.</h1>
    <p class="text-dim" style="max-width:56ch;margin:18px auto 0;font-size:1.05rem">We are 74 people in four offices united by one rule: if we would not gift it to our own mother, it does not go on the shelf. That filter has survived hundreds of product launches — and killed thousands of pitches.</p>
  </div>
</header>
<section class="container section" aria-label="Company statistics" data-stat-counters></section>
<section class="section" style="background:var(--surface)" aria-labelledby="valsH">
  <div class="container">
    <div class="section-head reveal in-view"><div><h2 id="valsH">Core values</h2><p>Serious enough to print on the wall.</p></div></div>
    <div class="grid grid-4">
      <div class="feature-block reveal"><div class="ico">${I('cpu')}</div><h3 class="small" style="margin-bottom:8px">Innovation</h3><p class="text-dim small">We back underdog engineering when it beats incumbents on substance.</p></div>
      <div class="feature-block reveal" data-delay="1"><div class="ico">${I('shield')}</div><h3 class="small" style="margin-bottom:8px">Quality</h3><p class="text-dim small">Forty-point lab checks on real units — never datasheets alone.</p></div>
      <div class="feature-block reveal" data-delay="2"><div class="ico">${I('checkCircle')}</div><h3 class="small" style="margin-bottom:8px">Integrity</h3><p class="text-dim small">Honest specs, honest pricing, honest reviews — even about us.</p></div>
      <div class="feature-block reveal" data-delay="3"><div class="ico">${I('heart')}</div><h3 class="small" style="margin-bottom:8px">Customer first</h3><p class="text-dim small">Policy written as a promise: the burden of proof sits on us, not you.</p></div>
    </div>
  </div>
</section>
<section class="container section" aria-labelledby="teamH">
  <div class="section-head reveal in-view"><div><h2 id="teamH">Meet the team</h2><p>The people answering your tickets and testing your gadgets.</p></div></div>
  <div class="grid grid-4" data-team-grid></div>
</section>
<section class="section" style="background:var(--surface)" aria-labelledby="msH">
  <div class="container">
    <div class="section-head reveal in-view"><div><h2 id="msH">Milestones</h2><p>Seven years, condensed.</p></div></div>
    <ul class="ms-timeline" data-milestones></ul>
  </div>
</section>
<section class="section container" aria-labelledby="partH">
  <div class="section-head reveal in-view"><div><h2 id="partH">Partners & friends</h2><p>We ship what they build — together.</p></div></div>
  <div class="marquee" data-marquee-partners></div>
</section>
<section class="container section" style="text-align:center;padding-top:12px">
  <div class="news-band mesh reveal in-view" style="max-width:760px;margin-inline:auto">
    <h2 style="color:#fff">Join our journey</h2>
    <p style="opacity:.9;margin-top:10px">Be first to meet the gadgets that pass next month's gauntlet.</p>
    <a class="btn btn-lg" style="background:#fff;color:#151527;border:none;margin-top:20px" href="newsletter.html">Become an insider</a>
  </div>
</section>`, 'about');

/* ════════════════ BLOG ════════════════ */
add('blog.html', 'FRONTIER Journal — Tech News, Reviews & Guides', 'Deep reviews, buying guides and industry analysis from the team that tests everything twice.', `
<header class="section container" style="padding-bottom:10px">
  <span class="badge soft">FRONTIER JOURNAL</span>
  <h1 style="margin-top:12px">News you can actually use</h1>
  <div class="flex between center wrap" style="margin-top:20px;gap:14px">
    <div class="pill-tabs" role="group" aria-label="Blog categories">
      ${['All', ...['Tech News', 'Reviews', 'How-To', 'Buying Guides', 'Industry Trends']].map(c => `<button class="pt" data-blog-cat="${c}">${c}</button>`).join('')}
    </div>
    <div class="input-wrap" style="min-width:min(280px,100%)">${I('search', 17, 'lead')}
      <input class="input has-lead" data-blog-search placeholder="Search articles…" aria-label="Search articles"></div>
  </div>
</header>
<section class="container" style="margin-bottom:34px" aria-label="Featured article" data-feat-article></section>
<main class="container" style="display:grid;grid-template-columns:1fr 300px;gap:48px;align-items:start">
  <div class="products-grid grid-3" data-blog-grid style="--cols:2"></div>
  <aside style="position:sticky;top:96px;display:grid;gap:22px">
    <div class="co-panel"><h3 class="small" style="margin-bottom:8px">Popular this week</h3><nav data-popular-posts></nav></div>
    <div class="co-panel"><h3 class="small" style="margin-bottom:10px">Tags</h3><div class="faq-tags" data-tag-cloud></div></div>
    <div class="news-band" style="padding:26px;text-align:left"><h3 class="small" style="color:#fff">Never miss a story</h3>
      <form data-news-form style="margin-top:12px;background:rgba(255,255,255,.16);max-width:none"><input type="email" required placeholder="Email" aria-label="Email address"><button class="btn btn-sm" style="background:#fff;color:#151527" type="submit">Join</button></form></div>
  </aside>
</main>
<nav class="pagination container" data-blog-pager aria-label="Blog pages"></nav>
<style>@media(max-width:900px){main[style*='1fr 300px']{grid-template-columns:1fr!important}}</style>`, 'blog');

add('blog-post.html', 'Article | FRONTIER Journal', 'A deep dive from the FRONTIER Journal.', `<div class="container" data-article style="padding-top:10px"></div>`, 'blog-post');

/* ════════════════ CONTACT ════════════════ */
add('contact.html', 'Contact Us | FRONTIER', "Questions, feedback or partnership ideas — we'd love to hear from you.", `
<header class="section container mesh noise" style="text-align:center;border-radius:var(--r-xl)">
  <div style="position:relative;z-index:1"><h1>We'd love to hear from you</h1>
  <p class="text-dim" style="max-width:52ch;margin:14px auto 0">Average first reply: under 2 hours on weekdays. Real humans, no script theatre.</p></div>
</header>
<section class="container section" style="padding-top:34px">
  <div class="grid grid-4" style="margin-bottom:48px">
    <a class="stat-card reveal" href="#" onclick="UI.toast('info','Flagship store','132 Frontier Ave, Austin TX 78701');return false"><div class="ico">${I('pin')}</div><b class="small">Visit us</b><p class="tiny text-dim" style="margin-top:6px">132 Frontier Ave,<br>Austin TX 78701</p></a>
    <a class="stat-card reveal" data-delay="1" href="tel:+18005550199"><div class="ico">${I('phone')}</div><b class="small">Call us</b><p class="tiny text-dim" style="margin-top:6px">+1 (800) 555-0199<br>Mon–Sat, 9–21 CT</p></a>
    <a class="stat-card reveal" data-delay="2" href="mailto:hello@frontier.example"><div class="ico">${I('mail')}</div><b class="small">Email</b><p class="tiny text-dim" style="margin-top:6px">hello@frontier.example<br>Replies in ~2 hours</p></a>
    <a class="stat-card reveal" data-delay="3" href="#" onclick="document.querySelector('.chat-launcher').click();return false"><div class="ico">${I('chat')}</div><b class="small">Live chat</b><p class="tiny text-dim" style="margin-top:6px">Tap the bubble,<br>or press here ✨</p></a>
  </div>
  <div style="display:grid;grid-template-columns:1.2fr .8fr;gap:44px;align-items:start">
    <form class="co-panel" data-contact-form novalidate>
      <h2>Send a message</h2>
      <div class="form-row" style="margin-top:18px">
        <div class="field"><label for="ctName">Name *</label><input class="input" id="ctName" required placeholder="Ada Lovelace"></div>
        <div class="field"><label for="ctMail">Email *</label><input class="input" type="email" id="ctMail" required placeholder="ada@example.com"></div>
      </div>
      <div class="field"><label for="ctSubject">Subject</label>
        <select class="input" id="ctSubject"><option>Order support</option><option>Product question</option><option>Returns & warranty</option><option>Press / partnerships</option><option>Something delightful</option></select></div>
      <div class="field"><label for="ctMsg">Message *</label><textarea class="input" id="ctMsg" required minlength="20" placeholder="Tell us everything… (order numbers help!)"></textarea></div>
      <div class="field"><label for="ctFile">Attachment (optional)</label><input class="input" type="file" id="ctFile"></div>
      <button class="btn btn-primary btn-lg" type="submit">${I('send', 16)} Send message</button>
      <p class="tiny text-dim" style="margin-top:10px">By sending you agree to our <a class="btn-link" href="privacy.html">privacy policy</a>.</p>
    </form>
    <div>
      <iframe title="Map to FRONTIER HQ" width="100%" height="230" style="border:0;border-radius:var(--r-lg);filter:${'invert(.92) hue-rotate(180deg)'}" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=-97.76%2C30.25%2C-97.72%2C30.28&amp;layer=mapnik"></iframe>
      <div class="co-panel" style="margin-top:22px">
        <h3 class="small" style="margin-bottom:10px">Business hours</h3>
        <table class="tbl" style="border:none"><tbody>
          ${[['Mon – Fri', '9:00 – 21:00'], ['Saturday', '10:00 – 18:00'], ['Sunday', 'Chat bot only'], ['Holidays', 'Reduced hours']].map(r => `<tr><td class="small text-dim" style="border:none;padding:7px 10px 7px 0">${r[0]}</td><td class="mono small" style="border:none;padding:7px 0">${r[1]}</td></tr>`).join('')}
        </tbody></table>
      </div>
    </div>
  </div>
</section>
<section class="section container" aria-labelledby="cfqH">
  <div class="section-head reveal in-view"><div><h2 id="cfqH">Quick answers</h2><p>The questions we field most before lunchtime.</p></div>
  <a class="btn btn-link" href="faq.html">Full FAQ →</a></div>
  <div data-contact-faq style="max-width:860px"></div>
</section>`, 'contact');

/* ════════════════ CART ════════════════ */
add('cart.html', 'Your Cart | FRONTIER', 'Review your cart, apply promo codes and check out securely.', `
<div class="container section" data-cart-page>
  <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">/</span><span class="current">Cart</span></nav>
  <h1 style="margin-bottom:26px">Shopping cart</h1>
  <div class="cart-layout">
    <div class="co-panel" style="padding-block:8px 20px"><div data-cart-list></div></div>
    <aside class="summary-card" data-summary aria-live="polite"></aside>
  </div>
</div>`, 'cart');

/* ════════════════ CHECKOUT ════════════════ */
function step(n, label) {
  return `<div class="step${n === 1 ? ' active' : ''}"><span class="step-num">${n}</span><span class="step-label">${label}</span></div>${n < 4 ? '<span class="step-line"></span>' : ''}`;
}
const CO_STEPS = [step(1, 'Contact'), step(2, 'Shipping'), step(3, 'Payment'), step(4, 'Review')].join('');
add('checkout.html', 'Secure Checkout | FRONTIER', 'Four-step secure checkout with guest option, saved addresses and multiple payment methods.', `
<div class="container section" style="padding-top:34px">
  <h1>Checkout</h1>
  <div class="steps" style="margin-block:26px 12px">${CO_STEPS}</div>
  <div class="progress" aria-hidden="true" style="max-width:560px;margin-bottom:34px"><i data-steps-fill style="width:0%"></i></div>
  <div class="checkout-layout">
    <div>
      <!-- STEP 1 -->
      <section class="co-step active co-panel" data-step="1">
        <h2 style="font-size:1.25rem">Contact & shipping address</h2>
        <p class="tiny text-dim" style="margin-top:4px">🔒 Encrypted end-to-end. We never share your details.</p>
        <div class="form-row" style="margin-top:18px">
          <div class="field"><label for="co-name">Full name *</label><input class="input" id="co-name" required autocomplete="name" placeholder="Ada Lovelace"></div>
          <div class="field"><label for="co-email">Email *</label><input class="input" id="co-email" type="email" required autocomplete="email" placeholder="ada@example.com"></div>
        </div>
        <div class="field"><label for="co-phone">Phone (for delivery updates)</label><input class="input" id="co-phone" type="tel" autocomplete="tel" placeholder="+1 555 000 1234"></div>
        <div class="field"><label for="co-line1">Street address *</label><input class="input" id="co-line1" required autocomplete="street-address" placeholder="228 Quantum Lane, Apt 4"></div>
        <div class="form-row thirds">
          <div class="field"><label for="co-city">City *</label><input class="input" id="co-city" required autocomplete="address-level2" placeholder="Austin"></div>
          <div class="field"><label for="co-zip">ZIP code *</label><input class="input" id="co-zip" required inputmode="numeric" autocomplete="postal-code" placeholder="78701"></div>
          <div class="field"><label for="co-country">Country *</label>
            <select class="input" id="co-country">${['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'Singapore'].map(c => `<option>${c}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label for="co-shipname">Recipient name (if different)</label><input class="input" id="co-shipname" autocomplete="off" placeholder="Leave empty if same as above"></div>
        <label class="checkbox"><input type="checkbox" id="asGuest" checked><span class="checkmark">${I('check', 11)}</span>Continue as guest</label>
        <div class="acc-body" id="acctFields" style="max-height:0;overflow:hidden;transition:max-height .3s ease">
          <div style="padding-top:12px"><div class="field"><label for="acctPassword">Create password (optional account)</label><input class="input" id="acctPassword" type="password" placeholder="••••••••" minlength="8"></div></div>
        </div>
        <button class="btn btn-primary btn-lg" data-next>Continue to shipping ${I('arrowRight', 16)}</button>
      </section>
      <!-- STEP 2 -->
      <section class="co-step co-panel" data-step="2">
        <h2 style="font-size:1.25rem">Shipping method</h2>
        <div class="pay-method" id="shipMethods" style="margin-top:18px">
          ${[
            ['standard', '🚚 Standard', '3–5 business days · FREE over $99'],
            ['express', '⚡ Express', '1–2 business days · $12.95'],
            ['overnight', '🌙 Overnight', 'Next business day before 5pm · $24.50']
          ].map((m, i) => `
          <label class="pay-option${i === 0 ? ' selected' : ''}"><input type="radio" name="shipMethod" value="${m[0]}" style="accent-color:var(--p)" ${i === 0 ? 'checked' : ''}>
            <div><b class="small">${m[1]}</b><br><span class="tiny text-dim">${m[2]}</span></div></label>`).join('')}
        </div>
        <p class="small" id="shipEtaNote" style="margin-top:14px;color:var(--dim)">ETA: <b data-ship-eta>Standard delivery in 3–5 business days</b></p>
        <div class="flex" style="gap:12px;margin-top:22px"><button class="btn btn-ghost" data-back>${I('chevLeft', 15)} Back</button>
        <button class="btn btn-primary btn-lg" data-next>Continue to payment ${I('arrowRight', 16)}</button></div>
      </section>
      <!-- STEP 3 -->
      <section class="co-step co-panel" data-step="3">
        <h2 style="font-size:1.25rem">Payment</h2>
        <div class="pay-method" id="payMethods" style="margin-top:18px">
          <label class="pay-option" data-pay="card"><input type="radio" name="payMethod" checked style="accent-color:var(--p)">
            ${I('card', 22)}<b class="small">Credit / debit card</b>
            <span class="card-logos"><span class="pay-badge">VISA</span><span class="pay-badge">MC</span><span class="pay-badge">AMEX</span></span></label>
          <div id="cardFields" style="padding:6px 4px 0">
            <div class="field"><label for="cardNum">Card number *</label><input class="input mono" id="cardNum" inputmode="numeric" autocomplete="cc-number" required placeholder="4242 4242 4242 4242"></div>
            <div class="form-row thirds">
              <div class="field" style="grid-column:span 2"><label for="cardExp">Expiry *</label><input class="input mono" id="cardExp" inputmode="numeric" autocomplete="cc-exp" required placeholder="MM/YY"></div>
              <div class="field"><label for="cardCvc">CVC *</label><input class="input mono" id="cardCvc" inputmode="numeric" autocomplete="cc-csc" required placeholder="123"></div>
            </div>
          </div>
          <label class="pay-option" data-pay="paypal"><input type="radio" name="payMethod" style="accent-color:var(--p)"> 💠<b class="small">PayPal</b><span class="tiny text-dim card-logos">Redirect login</span></label>
          <label class="pay-option" data-pay="wallet"><input type="radio" name="payMethod" style="accent-color:var(--p)"> 🍎<b class="small">Apple Pay / Google Pay</b><span class="tiny text-dim card-logos">One-tap</span></label>
          <label class="pay-option" data-pay="crypto"><input type="radio" name="payMethod" style="accent-color:var(--p)"> 🪙<b class="small">Crypto</b><span class="tiny text-dim card-logos">USDC · BTC · ETH</span></label>
        </div>
        <p class="small text-dim" data-pay-note style="margin-top:12px"></p>
        <div class="flex" style="gap:12px;margin-top:22px"><button class="btn btn-ghost" data-back>${I('chevLeft', 15)} Back</button>
        <button class="btn btn-primary btn-lg" data-next>Review order ${I('arrowRight', 16)}</button></div>
      </section>
      <!-- STEP 4 -->
      <section class="co-step co-panel" data-step="4">
        <h2 style="font-size:1.25rem">Review & place order</h2>
        <div class="kv-row" style="margin-top:16px"><span class="text-dim">Ship to</span><b class="small" data-co-review-addr>—</b></div>
        <p class="tiny text-dim">You can still edit previous steps — totals update live on the right.</p>
        <label class="checkbox" style="margin-top:14px"><input type="checkbox" id="agreeTerms" required><span class="checkmark">${I('check', 11)}</span>I agree to the <a class="btn-link" href="terms.html">Terms</a> & <a class="btn-link" href="privacy.html">Privacy Policy</a> *</label>
        <button class="btn btn-hot btn-lg btn-block" data-place-order style="margin-top:18px">${I('lock', 17)} Place order — secure</button>
        <p class="trust-ssl">${I('shield', 14)} PCI-DSS Level 1 · TLS 1.3 · Zero card storage</p>
        <button class="btn btn-ghost btn-sm btn-block" data-back style="margin-top:10px">${I('chevLeft', 14)} Back</button>
      </section>
    </div>
    <aside class="summary-card" aria-live="polite">
      <h3>Order summary</h3>
      <div class="order-summary-list" data-co-items style="margin-block:16px"></div>
      <div data-co-totals></div>
      <p class="tiny text-dim" style="margin-top:14px">🎁 Have a code? Apply it on the cart page — discounts carry over automatically.</p>
      <div class="trust-ssl">${I('lock', 14)} 256-bit SSL secured checkout</div>
    </aside>
  </div>
</div>`, 'checkout');

/* ════════════════ CONFIRMATION ════════════════ */
add('order-confirmation.html', 'Order Confirmed | FRONTIER', 'Thank you — your order is confirmed and on its way.', `
<section class="container section">
  <canvas class="confetti-canvas" hidden></canvas>
  <div class="success-card reveal in-view">
    <div class="success-check">
      <svg width="54" height="54" viewBox="0 0 54 54"><path d="M14 28 L24 38 L40 18" fill="none" stroke="#22c55e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <h1 style="margin-top:24px">Thank you! Order confirmed 🎉</h1>
    <p class="text-dim" style="margin-top:10px">We've emailed your receipt to the address used at checkout.</p>
    <div class="flex center" style="justify-content:center;gap:12px;margin-top:20px;flex-wrap:wrap">
      <span class="tiny text-dim">ORDER NUMBER</span>
      <b class="mono price" style="font-size:1.3rem" data-order-num>—</b>
      <button class="copy-btn" id="copyOrderBtn">${I('clipboard', 15)} Copy</button>
    </div>
    <div class="addr-cards">
      <div class="co-panel" style="text-align:left"><h3 class="small" style="margin-bottom:8px">${I('pin', 15)} Shipping to</h3><div data-conf-address></div></div>
      <div class="co-panel" style="text-align:left"><h3 class="small" style="margin-bottom:8px">${I('card', 15)} Payment & method</h3><div data-conf-pay></div></div>
    </div>
    <div class="co-panel" style="text-align:left">
      <h3 class="small" style="margin-bottom:12px">Items in this order</h3>
      <div class="order-summary-list" data-conf-items></div>
      <hr style="border:none;border-top:1px dashed var(--border);margin-block:16px">
      <div class="kv-row"><span class="text-dim">Placed on</span><b class="mono small" data-conf-date></b></div>
      <div class="kv-row"><span class="text-dim">${I('clock', 13)} Estimated delivery</span><b class="mono small" style="color:#22c55e" data-conf-eta></b></div>
    </div>
    <div class="flex center wrap" style="justify-content:center;gap:12px;margin-top:26px">
      <a class="btn btn-primary btn-lg" data-track-href href="order-tracking.html">${I('mapNav', 17)} Track order</a>
      <a class="btn btn-ghost btn-lg" href="shop.html">Continue shopping</a>
    </div>
    <p class="tiny text-dim" style="margin-top:18px">📬 A confirmation email is waiting in your inbox — it doubles as your receipt.</p>
  </div>
</section>`, 'confirmation');

/* ════════════════ TRACKING ════════════════ */
add('order-tracking.html', 'Track Your Order | FRONTIER', 'Live order tracking with carrier timeline, delivery ETA and SMS updates.', `
<header class="container section" style="padding-bottom:0;text-align:center">
  <span class="badge soft">PACKAGE TRACKING</span>
  <h1 style="margin-top:12px">Where's my stuff?</h1>
  <p class="text-dim" style="margin:12px auto 0;max-width:50ch">Enter your order number and email. Every milestone lands here the moment it happens.</p>
  <form class="co-panel" data-track-form style="max-width:640px;margin:28px auto 0;display:grid;grid-template-columns:1fr 1fr auto auto;gap:12px;text-align:left">
    <div class="field" style="margin:0"><label for="tOrder">Order number</label><input class="input mono" id="tOrder" data-track-order placeholder="FR-XXXXXX" required style="text-transform:uppercase"></div>
    <div class="field" style="margin:0"><label for="tMail">Email used</label><input class="input" id="tMail" data-track-email type="email" placeholder="you@email.com"></div>
    <button class="btn btn-primary" type="submit" style="align-self:end">${I('search', 16)} Track</button>
    <a class="btn btn-ghost" style="align-self:end" href="#" onclick="qs('[data-track-order]').value='FR-DEMO01';qs('[data-track-email]').value='demo@frontier.shop';this.closest('form').requestSubmit();return false" title="Fill demo tracking">Try demo</a>
  </form>
</header>
<div class="container section" style="padding-top:10px" data-track-result></div>`, 'tracking');

/* ════════════════ WISHLIST ════════════════ */
add('wishlist.html', 'My Wishlist | FRONTIER', 'Saved gadgets, ready when you are — plus price-drop alerts.', `
<div class="container section">
  <div class="flex between center wrap" style="gap:16px">
    <div><h1>Wishlist <span class="badge soft" data-wish-count>0</span></h1>
      <p class="text-dim small">Heart something today, own it someday. Alerts watch prices for you.</p></div>
    <div class="flex" style="gap:10px;flex-wrap:wrap">
      <button class="btn btn-secondary btn-sm" data-share>${I('share', 14)} Share list</button>
      <button class="btn btn-primary btn-sm" data-bulk-cart>${I('cart', 14)} Add all to cart</button>
      <button class="btn btn-danger btn-sm" data-clear-all style="background:none;color:var(--accent)">${I('trash', 14)}</button>
    </div>
  </div>
  <div class="products-grid grid grid-3 section" style="padding-block:26px 80px" data-wish-grid></div>
</div>`, 'wishlist');

/* ════════════════ LOGIN ════════════════ */
add('login.html', 'Sign In / Register | FRONTIER', 'Welcome back — sign in, create an account or reset your password.', `
<div class="auth-layout">
  <div class="auth-hero">
    <div style="max-width:46ch;animation:fadeUp .6s ease backwards">
      <span class="mono" style="letter-spacing:.3em;font-weight:700;font-size:.8rem;opacity:.85">FRONTIER MEMBERS</span>
      <h2 style="margin-top:14px;color:#fff">The best part of shopping here is coming back.</h2>
      <ul style="margin-top:22px;display:grid;gap:12px;opacity:.95">
        ${['Order history & lightning re-orders', 'Wishlist synced across devices', 'Early access to flash sales', '$10 birthday coupon — on us'].map(x => `<li style="display:flex;gap:10px;font-size:.92rem">${I('checkCircle', 17)} ${x}</li>`).join('')}
      </ul>
    </div>
  </div>
  <div class="auth-form-col">
    <div class="auth-box">
      <div class="pill-tabs" style="margin-bottom:26px" role="tablist">
        <button class="pt active" data-auth-tab="login">Sign in</button>
        <button class="pt" data-auth-tab="register">Register</button>
        <button class="pt" data-auth-tab="forgot">Forgot</button>
      </div>
      <div id="loginPanel">
        <form id="loginForm" novalidate>
          <h1 style="font-size:1.7rem">Welcome back 👋</h1>
          <p class="small text-dim" style="margin:6px 0 22px">Good to see you again. Your gadgets missed you.</p>
          <div class="float-field"><input id="loginEmail" type="email" required placeholder=" " autocomplete="email"><label for="loginEmail">Email address</label></div>
          <div class="float-field"><input id="loginPassword" type="password" required placeholder=" " autocomplete="current-password"><label for="loginPassword">Password</label>
            <button type="button" class="pw-toggle" data-pw-toggle="loginPassword" aria-label="Show password">${I('eye', 16)}</button></div>
          <div class="flex between center" style="margin:6px 0 20px">
            <label class="checkbox"><input type="checkbox" checked><span class="checkmark">${I('check', 11)}</span><span class="small">Remember me</span></label>
            <button type="button" class="btn btn-link small" onclick="qs('[data-auth-tab=forgot]').click()">Forgot password?</button>
          </div>
          <button class="btn btn-primary btn-lg btn-block" type="submit">${I('lock', 16)} Sign in securely</button>
        </form>
        <div class="divider-line">or continue with</div>
        <div class="social-btns">
          <button class="social-btn" data-social="Google">🔍 Google</button>
          <button class="social-btn" data-social="Facebook">📘 Facebook</button>
          <button class="social-btn" data-social="Apple">🍎 Apple</button>
        </div>
      </div>
      <div id="registerPanel" style="display:none">
        <form id="registerForm" novalidate>
          <h1 style="font-size:1.7rem">Create account ✨</h1>
          <p class="small text-dim" style="margin:6px 0 22px">$10 welcome coupon lands right after verification.</p>
          <div class="field"><label for="regName">Full name</label><input class="input" id="regName" required autocomplete="name"></div>
          <div class="field"><label for="regEmail">Email address</label><input class="input" id="regEmail" type="email" required autocomplete="email"></div>
          <div class="field"><label for="regPassword">Password</label><input class="input" id="regPassword" type="password" required minlength="8" autocomplete="new-password">
            <div id="pwStrengthWrap" style="display:flex;align-items:center;gap:10px;margin-top:8px">
              <div class="pw-meter" id="pwMeter" style="flex:1"><i></i><i></i><i></i><i></i></div><span class="tiny" id="pwScore"></span></div></div>
          <div class="field"><label for="regPassword2">Confirm password</label><input class="input" id="regPassword2" type="password" required autocomplete="new-password"></div>
          <label class="checkbox" style="margin-bottom:18px"><input type="checkbox" required><span class="checkmark">${I('check', 11)}</span><span class="small">I agree to the <a class="btn-link" href="terms.html">Terms</a> and <a class="btn-link" href="privacy.html">Privacy Policy</a></span></label>
          <button class="btn btn-primary btn-lg btn-block" type="submit">Create my account</button>
        </form>
      </div>
      <div id="forgotPanel" style="display:none">
        <form id="forgotForm">
          <h1 style="font-size:1.7rem">Reset password 🔑</h1>
          <p class="small text-dim" style="margin:6px 0 22px">Enter your email and we'll send a magic link valid for 60 minutes.</p>
          <div class="field"><label for="fpEmail">Email address</label><input class="input" id="fpEmail" type="email" required></div>
          <button class="btn btn-primary btn-lg btn-block" type="submit">Send reset link</button>
          <button class="btn btn-link btn-block" type="button" style="margin-top:10px" onclick="qs('[data-auth-tab=login]').click()">Back to sign in</button>
        </form>
      </div>
    </div>
  </div>
</div>`, 'login');

/* ════════════════ ACCOUNT ════════════════ */
const ACCT_NAV = [
  ['overview', 'home', 'Overview'], ['orders', 'package', 'My orders'], ['addresses', 'pin', 'Addresses'],
  ['payments', 'card', 'Payment methods'], ['settings', 'settings', 'Profile settings'], ['notifications', 'bell', 'Notifications']
];
add('account.html', 'My Account | FRONTIER', 'Orders, addresses, payment methods and preferences — all in one dashboard.', `
<div class="container section">
  <header class="flex between center wrap" style="margin-bottom:30px;gap:14px">
    <div class="flex center" style="gap:16px">
      <span class="avatar lg" data-user-avatar-big data-user-initials>··</span>
      <div><h1 style="font-size:1.5rem">Hey, <span data-user-name>friend</span> 👋</h1>
        <span class="small text-dim mono" data-user-email>—</span></div>
    </div>
    <button class="btn btn-ghost btn-sm" id="logoutBtn">${I('logout', 15)} Sign out</button>
  </header>
  <div class="account-layout">
    <nav class="account-nav" aria-label="Account sections">
      ${ACCT_NAV.map(n => `<a href="#${n[0]}" data-acct-nav="${n[0]}">${I(n[1], 17)} ${n[2]}</a>`).join('')}
    </nav>
    <div>
      <!-- overview -->
      <section class="acct-section active co-panel" id="overview">
        <h2 style="font-size:1.2rem">Quick glance</h2>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin-block:18px">
          <div class="stat-card"><div class="big-stat" data-stat-orders>0</div><span class="tiny text-dim">Total orders</span></div>
          <div class="stat-card"><div class="big-stat" data-stat-spent>$0</div><span class="tiny text-dim">Lifetime spend</span></div>
          <div class="stat-card"><div class="big-stat" data-stat-wishes>0</div><span class="tiny text-dim">Wishlist items</span></div>
        </div>
        <h3 class="small" style="margin-bottom:10px">Recent orders</h3>
        <table class="tbl"><thead><tr><th>Order #</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr></thead>
        <tbody data-recent-orders></tbody></table>
        <h3 class="small" style="margin:26px 0 10px">Recently viewed</h3>
        <div class="h-scroll" data-acct-recent></div>
      </section>
      <!-- orders -->
      <section class="acct-section co-panel" id="orders">
        <h2 style="font-size:1.2rem">All orders</h2>
        <div class="table-wrap" style="margin-top:16px"><table class="tbl"><thead><tr><th>Order #</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr></thead>
        <tbody data-orders-tbody></tbody></table></div>
      </section>
      <!-- addresses -->
      <section class="acct-section" id="addresses">
        <h2 style="font-size:1.2rem;margin-bottom:16px">Address book</h2>
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr));margin-bottom:22px" data-address-list></div>
        <form class="co-panel" id="addrForm" style="max-width:560px">
          <h3 class="small" style="margin-bottom:14px">Add a new address</h3>
          <div class="form-row">
            <div class="field"><label>Label</label><input class="input" name="label" placeholder="Home / Gym / Granny"></div>
            <div class="field"><label>Recipient</label><input class="input" name="name" required></div>
          </div>
          <div class="field"><label>Street address</label><input class="input" name="line1" required></div>
          <div class="form-row thirds">
            <div class="field"><label>City</label><input class="input" name="city" required></div>
            <div class="field"><label>ZIP</label><input class="input" name="zip" required></div>
            <div class="field"><label>Country</label><input class="input" name="country" value="United States"></div>
          </div>
          <div class="field"><label>Phone</label><input class="input" name="phone" type="tel"></div>
          <button class="btn btn-primary btn-sm" type="submit">${I('plus', 14)} Save address</button>
        </form>
      </section>
      <!-- payments -->
      <section class="acct-section" id="payments">
        <h2 style="font-size:1.2rem;margin-bottom:16px">Saved cards</h2>
        <div class="grid" style="gap:14px;margin-bottom:22px" data-cards-list></div>
        <form class="co-panel" id="cardForm" style="max-width:420px">
          <h3 class="small" style="margin-bottom:14px">Add a card</h3>
          <div class="field"><label>Card number</label><input class="input mono" name="cnum" inputmode="numeric" required placeholder="4242 4242 4242 4242"></div>
          <div class="form-row">
            <div class="field"><label>Expiry</label><input class="input mono" name="cexp" placeholder="MM/YY"></div>
          </div>
          <button class="btn btn-primary btn-sm" type="submit">${I('plus', 14)} Add card</button>
          <p class="tiny text-dim" style="margin-top:10px">${I('lock', 12)} Tokenized via our PCI Level 1 processor.</p>
        </form>
      </section>
      <!-- settings -->
      <section class="acct-section" id="settings">
        <h2 style="font-size:1.2rem;margin-bottom:16px">Profile settings</h2>
        <div class="flex center" style="gap:18px;margin-bottom:20px">
          <span class="avatar lg" style="width:70px;height:70px;font-size:1.4rem" data-user-avatar-big>${'FR'}</span>
          <button class="btn btn-secondary btn-sm" id="avatarPick">${I('sparkles', 15)} Shuffle avatar color</button>
        </div>
        <form class="co-panel" id="settingsForm" style="max-width:480px;margin-bottom:22px">
          <div class="field"><label for="setName">Display name</label><input class="input" id="setName"></div>
          <div class="field"><label for="setEmail">Email</label><input class="input" id="setEmail" type="email"></div>
          <button class="btn btn-primary btn-sm" type="submit">Save profile</button>
        </form>
        <form class="co-panel" id="pwChangeForm" style="max-width:480px">
          <h3 class="small" style="margin-bottom:14px">Change password</h3>
          <div class="field"><label>Current password</label><input class="input" type="password" required></div>
          <div class="field"><label>New password</label><input class="input" type="password" required minlength="8"></div>
          <button class="btn btn-secondary btn-sm" type="submit">Update password</button>
        </form>
      </section>
      <!-- notifications -->
      <section class="acct-section co-panel" id="notifications">
        <h2 style="font-size:1.2rem">Notification channels</h2>
        <p class="small text-dim" style="margin:6px 0 18px">Receipts & security alerts always arrive regardless of these toggles.</p>
        <div style="display:grid;gap:16px;max-width:460px">
          <label class="flex between center"><span><b class="small">Email digests</b><br><span class="tiny text-dim">Weekly drop news, price alerts</span></span><span class="switch"><input type="checkbox"><span class="track"></span></span></label>
          <label class="flex between center"><span><b class="small">SMS updates</b><br><span class="tiny text-dim">Delivery-day texts (carrier rates may apply)</span></span><span class="switch"><input type="checkbox"><span class="track"></span></span></label>
          <label class="flex between center"><span><b class="small">Push notifications</b><br><span class="tiny text-dim">Flash sale early access on mobile app</span></span><span class="switch"><input type="checkbox"><span class="track"></span></span></label>
        </div>
      </section>
    </div>
  </div>
</div>`, 'account');

/* ════════════════ COMPARE ════════════════ */
add('compare.html', 'Compare Products | FRONTIER', 'Side-by-side comparison of up to 4 gadgets — highlight only the differences that matter.', `
<div class="container section">
  <h1>Compare gadgets ⚖️</h1>
  <p class="text-dim" style="margin-bottom:26px">Pick up to four products in the shop ("Compare" checkbox on any card) and they appear here instantly.</p>
  <div data-compare-zone></div>
  <section class="section" style="padding-bottom:20px"><div class="section-head"><div><h2>Trending picks worth comparing</h2></div></div>
  <div class="products-grid grid grid-4" data-compare-picks></div></section>
</div>`, 'compare');

/* ════════════════ CATEGORIES ════════════════ */
add('categories.html', 'Categories | FRONTIER', 'Explore eight worlds of technology: phones, laptops, audio, wearables, smart home, gaming, cameras and accessories.', `
<header class="container section" style="padding-bottom:0;text-align:center">
  <span class="badge soft">BROWSE EVERYTHING</span>
  <h1 style="margin-top:12px">All categories</h1>
  <p class="text-dim" style="margin:12px auto 0;max-width:52ch">Every category is a rabbit hole we happily maintain: sub-collections, spec tables and honest recommendations included.</p>
</header>
<section class="container" style="padding-top:30px"><div class="mesh deal-card" style="grid-template-columns:1fr;background:linear-gradient(115deg,#6C5CE7,#0aa6c9)" data-feat-banner></div></section>
<section class="container section" style="padding-top:40px"><div class="grid grid-3" data-cat-grid></div></section>
<section class="section container legal-doc" aria-label="Category descriptions"><h2 class="sr-only" style="position:absolute;left:-9999px">Descriptions</h2><div data-seo-text style="columns:2;column-gap:48px" class="small"></div></section>
<style>@media(max-width:800px){.legal-doc [data-seo-text]{columns:1}}</style>`, 'categories');

/* ════════════════ SEARCH ════════════════ */
add('search.html', 'Search Results | FRONTIER', 'Find exactly the gadget you meant — fuzzy search across names, brands and categories.', `
<div class="container section" style="padding-top:40px">
  <header>
    <h1>Results for <span class="grad-text" data-q-display>"…"</span></h1>
    <p class="text-dim small" data-search-count style="margin-top:8px"></p>
  </header>
  <div class="input-wrap" style="max-width:520px;margin-top:22px">${I('search', 18, 'lead')}
    <input class="input has-lead" data-q-input placeholder="Refine your search…" aria-label="Search query"></div>
  <div class="flex wrap" style="gap:8px;margin-top:16px"><span class="tiny text-dim">Related:</span><span data-related-searches class="flex wrap" style="gap:8px"></span></div>
  <div class="products-grid grid grid-3 section" style="padding-block:30px 60px" data-search-results aria-live="polite"></div>
</div>`, 'search');

/* ════════════════ FAQ ════════════════ */
add('faq.html', 'FAQ | FRONTIER Help Center', '52+ answers on orders, shipping, returns, payments, products and accounts — searchable instantly.', `
<div id="faqPage">
<header class="container section" style="padding-bottom:0;text-align:center">
  <span class="badge soft">KNOWLEDGE BASE</span>
  <h1 style="margin-top:12px">Frequently asked questions</h1>
  <div class="input-wrap" style="max-width:520px;margin:24px auto 0">${I('search', 18, 'lead')}
    <input class="input has-lead" data-faq-search placeholder="Search the answers… try “refunds”" aria-label="Search FAQs"></div>
  <div class="faq-tags" style="justify-content:center" data-faq-cats></div>
</header>
<div class="container section" style="padding-top:8px;max-width:900px" data-faq-list aria-live="polite"></div>
<section class="container section" style="padding-top:0;text-align:center">
  <div class="news-band mesh reveal in-view" style="max-width:700px;margin-inline:auto">
    <h2 style="color:#fff">Still have questions?</h2>
    <p style="opacity:.9;margin-top:8px">Humans stand by seven days a week — median reply time is minutes.</p>
    <div class="flex center wrap" style="justify-content:center;gap:12px;margin-top:20px">
      <a class="btn" style="background:#fff;color:#151527;border:none" href="contact.html">Contact support</a>
      <button class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.4)" onclick="document.querySelector('.chat-launcher').click()">Open live chat</button>
    </div>
  </div>
</section>
</div>`, 'faq');

/* ════════════════ LEGAL DOCS ════════════════ */
const LEGAL_CSS_NOTE = '';
function tocAside() {
  return `<div class="legal-layout">
  <nav class="toc-nav" data-doc-toc aria-label="Document contents"></nav>
  <article class="legal-doc co-panel`;
}
add('privacy.html', 'Privacy Policy | FRONTIER', 'How FRONTIER collects, uses and protects your data — plainly written.', (() => {
  const S = [
    ['info-collect', 'Information we collect', `We collect what an order requires: contact details, shipping address, payment tokens (never raw card numbers), and basic device/browser metadata that keeps the site functioning. Optional extras — wishlists, reviews, notification preferences — exist only because you chose them.`],
    ['use', 'How we use information', `Three jobs only: fulfil orders, prevent fraud, improve the store. Analytics are aggregated and anonymized; nobody inside FRONTIER browses through profiles for fun, and our tooling makes that difficult by design.`],
    ['cookies', 'Cookies & similar tech', `Essential cookies keep carts alive and sessions secure. Preference cookies remember theme and language. Marketing cookies are off until you explicitly allow them in the footer banner — declining costs you nothing but personalized ads.`],
    ['sharing', 'Third-party sharing', `Carriers receive the address on the label. Payment processors receive amount + token. Nobody else receives anything else. We do not sell data, full stop — including "anonymized partner insights", which is usually selling with extra steps.`],
    ['security', 'Data security', `TLS 1.3 everywhere, AES-256 at rest, least-privilege access with hardware-key 2FA for staff, annual third-party pentests, and a public post-mortem policy within 72 hours of any confirmed incident.`],
    ['rights', 'Your rights', `Access, export, correct, delete, restrict, object. Settings covers most of it instantly; everything else happens via privacy@frontier.example within 30 days, no ID-theatre questions.`],
    ['children', "Children's privacy", `Accounts require ages 16+. If we learn of an account beyond that boundary we close it and purge associated data promptly. Concerns from parents route straight to a human specialist.`],
    ['updates', 'Policy updates', `Material changes trigger an email 14 days before taking effect, with a plain-language diff at the top. Continued use implies acceptance; closing your account is always honoured.`]
  ];
  return `<div class="legal-layout">
  <nav class="toc-nav" data-doc-toc aria-label="Document contents"></nav>
  <article class="legal-doc co-panel" id="privacyDoc" style="padding:clamp(22px,4vw,44px)">
    <span class="badge soft mono">LAST UPDATED: JANUARY 15, 2026</span>
    <h1 style="margin-top:14px">Privacy Policy</h1>
    <p class="text-dim">Written by humans, readable without aspirin.</p>
    ${S.map(s => `<h2 id="${s[0]}">${s[1]}</h2><p>${s[2]}</p>`).join('')}
    <div class="flex wrap" style="gap:12px;margin-top:34px">
      <button class="btn btn-secondary" data-doc-print>${I('download', 15)} Download PDF</button>
      <a class="btn btn-ghost" href="mailto:privacy@frontier.example">Contact privacy team</a>
    </div>
  </article></div>`;
})(), 'privacy');

add('terms.html', 'Terms & Conditions | FRONTIER', 'The ground rules of shopping at FRONTIER — fair, short and readable.', (() => {
  const S = [
    ['acceptance', 'Acceptance of terms', `Using the store means agreeing to these terms. If any clause truly breaks things for you, say so — several began as customer feedback.`],
    ['products', 'Product information', `Specs come from manufacturers and our own measurement bench; images may include prototype units where noted. Errors get corrected transparently with dated changelogs.`],
    ['pricing', 'Pricing & availability', `Prices exclude tax unless shown otherwise. A €0.01 listing error does not bind us once flagged — but genuine mistakes discovered before shipping are honoured if you act fast.`],
    ['payment', 'Payment', `Cards, wallets, BNPL and crypto where supported. Charges occur at order placement for in-stock items; pre-orders charge at ship-out.`],
    ['shipping', 'Shipping risk & title', `Loss/damage risk transfers at delivery scan, not warehouse exit. Couriers are our choice and responsibility until then.`],
    ['returns', 'Returns & cancellation', `30 days, prepaid label domestic, refund in 1–2 days of warehouse scan. Cancellations remain possible until courier pickup.`],
    ['warranty', 'Warranty', `2 years minimum per device plus statutory rights wherever stronger. Care+ extends accidental coverage optionally.`],
    ['liability', 'Liability', `Liability caps at purchase price except where law forbids caps. We keep goodwill gestures out of contracts deliberately — they stay discretionary.`],
    ['ip', 'Intellectual property', `Site design, copy and imagery belong to FRONTIER; brand names on products belong to their owners and appear with permission or nominative reference.`],
    ['law', 'Governing law', `Texas law governs; consumer-protection rights in your residence country always win where they conflict, as required by EU 593/2008 et al.`]
  ];
  return `<div class="legal-layout">
  <nav class="toc-nav" data-doc-toc aria-label="Document contents"></nav>
  <article class="legal-doc co-panel" id="termsDoc" style="padding:clamp(22px,4vw,44px)">
    <span class="badge soft mono">LAST UPDATED: FEBRUARY 1, 2026</span>
    <h1 style="margin-top:14px">Terms & Conditions</h1>
    ${S.map(s => `<h2 id="${s[0]}">${s[1]}</h2><p>${s[2]}</p>`).join('')}
    <div class="flex wrap" style="gap:12px;margin-top:34px">
      <button class="btn btn-primary" id="acceptTerms">Accept terms</button>
      <button class="btn btn-ghost" onclick="location.href='index.html'" >Decline & leave</button>
      <button class="btn btn-secondary" data-doc-print>${I('download', 15)} PDF</button>
    </div>
  </article></div>`;
})(), 'terms');

add('shipping-returns.html', 'Shipping & Returns | FRONTIER', 'Delivery speeds, international coverage, and a genuinely painless 30-day return process.', (() => {
  const RSTEPS = [['package', 'Start online', 'Account → Orders → Return, pick items & reason'], ['printer', 'Print nothing*', '*every box ships with a prepaid label already inside'], ['truck', 'Drop off', 'Any partner point — or doorstep pickup on request'], ['credit-card', 'Refunded', 'Within 1–2 business days of warehouse scan']];
  return `<div class="legal-layout">
  <nav class="toc-nav" data-doc-toc aria-label="Document contents"></nav>
  <article class="legal-doc co-panel" id="shipDoc" style="padding:clamp(22px,4vw,44px)">
    <h1>Shipping & Returns</h1>
    <h2 id="options">Shipping options</h2>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>Method</th><th>Speed</th><th>Cost</th><th>Coverage</th></tr></thead><tbody>
      <tr><td>Standard</td><td>3–5 business days</td><td>$5.90 · FREE ≥ $99</td><td>All 42 countries</td></tr>
      <tr><td>Express</td><td>1–2 business days</td><td>$12.95</td><td>National zones</td></tr>
      <tr><td>Overnight</td><td>Next day by 5pm</td><td>$24.50</td><td>Select metros</td></tr>
    </tbody></table></div>
    <div data-ship-progress></div>
    <h2 id="international">International shipping</h2>
    <p>Duties and taxes are calculated and prepaid at checkout — the price you confirm is final, with zero customs surprises. Current direct-serve regions: US/CA/MX, UK/EU/EEA, JP/KR/SG/AU/NZ, BR/CL select metros. Everywhere else falls back to trusted freight partners with identical guarantees.</p>
    <h2 id="process">Return process</h2>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-top:18px">
      ${RSTEPS.map((s, i) => `<div class="stat-card"><div class="ico">${I(s[0], 22)}</div><b class="small">${i + 1}. ${s[1]}</b><p class="tiny text-dim" style="margin-top:6px">${s[2]}</p></div>`).join('')}
    </div>
    <h2 id="refunds">Refund timeline & exchanges</h2>
    <ul><li>Warehouse receives return → refund initiated same day</li><li>Card refunds post in 2–5 banking days; wallets often instantly</li><li>Exchanges ship before your return arrives for in-stock items (deposit-free)</li><li>Gift purchases refund to original buyer or convert to store credit — your choice</li></ul>
    <div class="flex wrap" style="gap:12px;margin-top:30px">
      <button class="btn btn-secondary" data-doc-print>Download PDF</button>
      <button class="btn btn-primary" data-rma-demo onclick="UI.toast('success','Return started!','Demo label generated: RMA-'+Math.floor(Math.random()*9e5+1e5))">Start a return now</button>
      <a class="btn btn-ghost" href="faq.html">Read return FAQ</a>
    </div>
  </article></div>`;
})(), 'shipping-returns');

add('warranty.html', 'Warranty & Care+ | FRONTIER', 'Every gadget carries a 2-year warranty — extendable with FRONTIER Care+ accident protection.', `
<div class="container section">
  <header style="text-align:center;max-width:60ch;margin-inline:auto">
    <span class="badge hot">${I('shield', 14)} SIGNATURE PROMISE</span>
    <h1 style="margin-top:14px">2-year warranty. On everything. Always.</h1>
    <p class="text-dim" style="margin-top:12px">It started in 2021 when competitors moved to 90 days and we doubled down instead. It remains the loudest quality signal a retailer can send.</p>
  </header>
  <div class="grid grid-2 section" style="padding-block:40px">
    <div class="co-panel"><h3 class="small">${I('checkCircle', 16)} What's covered</h3>
      <ul class="legal-doc" style="margin-top:10px"><li>Manufacturing defects & component failure</li><li>Battery capacity below 60% within term</li><li>Firmware bricks — reinstated free forever</li><li>Shipping damage reported within 48h</li></ul></div>
    <div class="co-panel"><h3 class="small">${I('xCircle', 16)} What isn't</h3>
      <ul class="legal-doc" style="margin-top:10px"><li>Liquid beyond the device's IP rating</li><li>Unauthorized repairs or third-party parts</li><li>Cosmetic wear that doesn't affect function</li><li>Voltage events outside rated chargers*</li><li class="tiny">*unless you added Care+, which forgives almost everything</li></ul></div>
  </div>
  <div class="section-head"><div><h2>Care+ extended plans</h2><p>Accidental damage & battery service on top of base warranty. Id="carePlus"</p></div></div>
  <div class="grid grid-3" id="carePlus" style="scroll-margin-top:100px">
    ${[['Care+ 12mo', 29.99, 'One extra year + one accident claim'], ['Care+ 24mo', 49.99, 'Two extra years · unlimited battery swaps — Most popular', true], ['Care+ 36mo', 69.99, 'Three extra years · two accidents + loaners']].map(p => `
    <article class="co-panel stat-card" style="text-align:left${p[3] ? ';border-color:rgba(108,92,231,.6)' : ''}">
      ${p[3] ? '<span class="badge hot">MOST POPULAR</span>' : ''}
      <h3 class="small" style="margin-top:8px">${p[0]}</h3>
      <div class="price mono" style="font-size:1.5rem;margin-block:6px">$${p[1]}</div>
      <p class="tiny text-dim">${p[2]}</p>
      <button class="btn btn-primary btn-sm" data-care-buy style="margin-top:14px">${I('cart', 13)} Add plan</button>
    </article>`).join('')}
  </div>
  <div class="grid grid-2 section" style="padding-block:40px">
    <form class="co-panel" id="serialForm">
      <h3 class="small">Check warranty status</h3>
      <p class="tiny text-dim" style="margin:6px 0 14px">Serial formats look like <b class="mono">FR-2024-K9XQ</b>. Try any valid pattern!</p>
      <div class="promo-row"><input class="input mono" id="serialInput" placeholder="FR-2024-K9XQ" style="text-transform:uppercase"><button class="btn btn-secondary" type="submit">Check</button></div>
      <div id="serialOut" style="display:none;margin-top:16px"></div>
    </form>
    <form class="co-panel" id="registerForm2">
      <h3 class="small">Register a gift / manual serial</h3>
      <div class="field" style="margin-top:10px"><label>Your name</label><input class="input" required></div>
      <div class="field"><label>Email</label><input class="input" type="email" required></div>
      <div class="field"><label>Serial number</label><input class="input mono" required placeholder="FR-2025-A1B2" style="text-transform:uppercase"></div>
      <div class="field"><label>Purchase date</label><input class="input" type="date" required></div>
      <button class="btn btn-primary btn-sm" type="submit">Register product</button>
    </form>
  </div>
</div>`, 'warranty');

/* ════════════════ GIFT CARDS ════════════════ */
add('gift-cards.html', 'Gift Cards | FRONTIER', 'Give the joy of choosing — digital or physical FRONTIER gift cards from $25 to $2,000.', `
<div class="container section">
  <header style="text-align:center">
    <span class="badge soft">THE EASY GIFT</span>
    <h1 style="margin-top:12px">FRONTIER Gift Cards</h1>
    <p class="text-dim" style="margin:12px auto 0;max-width:52ch">For the person whose gadget taste outruns your knowledge. Digital arrives in minutes; physical cards are heavy engraved metal and feel incredible.</p>
  </header>
  <div class="cart-layout section" style="padding-block:36px 0">
    <div class="co-panel">
      <h3 class="small" style="margin-bottom:12px">1 · Choose an amount</h3>
      <div class="flex wrap" style="gap:10px" data-gift-amounts></div>
      <h3 class="small" style="margin:22px 0 12px">2 · Pick a design</h3>
      <div class="gift-designs" data-gift-designs></div>
      <div class="gift-preview mesh" style="margin-top:20px">
        <div style="text-align:center;position:relative;z-index:1">
          <span class="mono tiny" style="opacity:.85;letter-spacing:.25em">FRONTIER</span>
          <div style="font-family:var(--font-display);font-weight:700;font-size:clamp(2.4rem,6vw,3.6rem);line-height:1" data-preview-amt>$50</div>
          <span class="tiny" data-preview-name>Nebula design</span>
        </div>
      </div>
      <form data-gift-form class="section" style="padding-block:26px 0" >
        <h3 class="small" style="margin-bottom:12px">3 · Who's the lucky one?</h3>
        <div class="form-row">
          <div class="field"><label>Recipient name *</label><input class="input" required placeholder="Sam Rivera"></div>
          <div class="field"><label>Recipient email *</label><input class="input" type="email" required placeholder="sam@example.com"></div>
        </div>
        <div class="field"><label>Personal message</label><textarea class="input" maxlength="300" placeholder="May your cables never tangle."></textarea></div>
        <div style="display:grid;gap:10px">
          <label class="radio-row"><input type="radio" name="giftDelivery" value="email" checked><span class="radio-dot"></span><span class="small"><b>Email delivery</b> · arrives in ~2 minutes</span></label>
          <label class="radio-row"><input type="radio" name="giftDelivery" value="physical"><span class="radio-dot"></span><span class="small"><b>Physical metal card</b> · $9.90 tracked shipping, engraving included</span></label>
        </div>
        <p class="tiny text-dim" id="physicalNotice" style="display:none;margin-top:8px">📦 Ships in 1 business day with a magnetic presentation case.</p>
        <button class="btn btn-primary btn-lg btn-block" type="submit" data-gift-add style="margin-top:20px">${I('cart', 17)} Add gift card to cart</button>
      </form>
    </div>
    <aside style="display:grid;gap:22px;align-self:start">
      <div class="co-panel">
        <h3 class="small" style="margin-bottom:10px">${I('clipboard', 15)} Balance checker</h3>
        <form id="balanceForm" class="promo-row"><input class="input mono" id="balanceInput" placeholder="GIFT-FR2K9X" style="text-transform:uppercase"><button class="btn btn-secondary" type="submit">Check</button></form>
        <div id="balanceOut" style="display:none;margin-top:14px"></div>
      </div>
      <div class="co-panel legal-doc">
        <h3 class="small">Fine print, painlessly</h3>
        <ul style="margin-top:8px"><li>Valid on everything, forever</li><li>No fees — dormant cards never shrink</li><li>Combine balances freely with other payments</li><li>Regret-proof: refundable unused within 30 days</li></ul>
      </div>
      <div class="co-panel" style="text-align:center">
        <div style="font-size:2rem">🎁</div><b class="small">Bulk corporate gifting?</b>
        <p class="tiny text-dim" style="margin-top:6px">50+ cards get volume pricing & custom designs.</p>
        <a class="btn btn-link small" href="contact.html">Talk to us →</a>
      </div>
    </aside>
  </div>
</div>`, 'gift-cards');

/* ════════════════ 404 ════════════════ */
add('404.html', 'Page Not Found (404)', 'This page drifted out of orbit. Let us navigate you home.', `
<div class="nf-page mesh noise">
  <div style="position:relative;z-index:1;max-width:720px">
    <div class="robo" aria-hidden="true">
      <svg viewBox="0 0 170 170" width="170" height="170">
        <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6C5CE7"/><stop offset="1" stop-color="#00D2FF"/></linearGradient></defs>
        <g fill="none" stroke="url(#rg)" stroke-width="4" stroke-linecap="round">
          <rect x="35" y="42" width="100" height="86" rx="18"/>
          <circle cx="66" cy="80" r="7" fill="#FF6B6B" stroke="none"/>
          <path d="M104 76 l14 8 -14 8" />
          <path d="M62 108 h46"/>
          <path d="M85 42 v-18 M85 20 h12 M85 24 l12 8 -12 6z" stroke="#00D2FF" stroke-width="3" fill="#00D2FF33"/>
        </g>
        <path class="zap-bolt" d="M138 118 l-12 20 8 0 -4 16 16 -24 -8 0 z" fill="#00D2FF"/>
      </svg>
    </div>
    <h1 style="font-size:clamp(2.6rem,7vw,4.6rem)" class="grad-text">404</h1>
    <h2 style="margin-top:6px">This page lost signal.</h2>
    <p class="text-dim" style="margin:14px auto 0;max-width:46ch">Even our robot got disconnected looking for it. Try searching — or grab one of the crowd favourites below while you're here.</p>
    <div class="promo-row" style="max-width:420px;margin:22px auto 0">
      <input class="input" data-nf-search placeholder="Search 224 products…" aria-label="Site search">
      <button class="btn btn-primary" onclick="if(qs('[data-nf-search]').value.trim())location.href='search.html?q='+encodeURIComponent(qs('[data-nf-search]').value)">Search</button>
    </div>
    <div class="flex center wrap" style="justify-content:center;gap:10px;margin-top:22px">
      ${[['index.html', 'Home'], ['shop.html', 'Shop'], ['support.html', 'Help center'], ['faq.html', 'FAQ']].map(l => `<a class="chip" href="${l[0]}">${l[1]}</a>`).join('')}
    </div>
    <div class="products-grid grid grid-4 section" style="padding-block:36px 0" data-nf-products></div>
    <p data-redirect-row class="tiny text-dim" style="margin-top:30px">Teleporting you home in <b class="mono" data-redirect-count>20</b>s · <button class="btn btn-link tiny" id="cancelRedirect">stay & explore</button></p>
  </div>
</div>`, '404');

/* ════════════════ SUPPORT ════════════════ */
add('support.html', 'Help Center | FRONTIER Support', 'Track orders, start returns, file claims and reach humans fast — welcome to the Help Center.', `
<header class="container section mesh noise" style="text-align:center;border-radius:0 0 var(--r-xl) var(--r-xl)">
  <div style="position:relative;z-index:1">
    <h1>How can we help you today?</h1>
    <div class="promo-row" style="max-width:480px;margin:24px auto 0">
      <input class="input" placeholder="Search help articles… e.g. “refund”" aria-label="Search help"
        onkeydown="if(event.key==='Enter')location.href='faq.html'">
      <a class="btn btn-primary" href="faq.html">Search</a>
    </div>
    <p class="tiny text-dim" style="margin-top:12px" data-hours-note></p>
  </div>
</header>
<section class="container section">
  <div class="grid grid-3" data-support-links></div>
</section>
<div class="cart-layout container" style="padding-bottom:40px">
  <section>
    <div class="section-head"><div><h2>Popular support articles</h2></div><a class="btn btn-link" href="faq.html">All 52 answers →</a></div>
    <div class="co-panel"><ul data-popular-help></ul></div>
    <div class="co-panel news-band" style="margin-top:22px;padding:30px;text-align:left">
      <h3 class="small" style="color:#fff">Status snapshot</h3>
      <div class="flex wrap" style="gap:14px;margin-top:12px;color:#fff">
        <span class="status-pill delivered">All systems operational</span>
        <span class="status-pill shipped">Carriers: normal flow</span>
        <span class="status-pill processing">Holiday volume: mild delay ±1 day</span>
      </div>
    </div>
  </section>
  <aside class="co-panel">
    <h3 class="small">Create a support ticket</h3>
    <p class="tiny text-dim" style="margin:6px 0 16px">Priority queue with SLA under 2 hours.</p>
    <form id="ticketForm">
      <div class="field"><label>Email *</label><input class="input" type="email" required></div>
      <div class="field"><label>Topic *</label><select class="input" required><option>Order issue</option><option>Technical problem</option><option>Return / exchange</option><option>Warranty claim</option><option>Billing question</option><option>Feedback</option></select></div>
      <div class="field"><label>Describe it *</label><textarea class="input" required minlength="20" placeholder="What happened, what you expected, order number if any…"></textarea></div>
      <div class="field"><label>Attach evidence (optional)</label><input class="input" type="file"></div>
      <button class="btn btn-primary btn-block" type="submit">${I('clipboard', 15)} Create ticket</button>
    </form>
  </aside>
</div>`, 'support');

/* ════════════════ NEWSLETTER ════════════════ */
add('newsletter.html', 'Newsletter | FRONTIER Insiders', 'One email a week packed with drops, deals and the best tech writing on the net.', `
<div class="cart-layout container section" style="align-items:center">
  <div>
    <span class="badge hot">INSIDERS CLUB</span>
    <h1 style="margin-top:16px">130,000 people open this email every Thursday.</h1>
    <p class="text-dim" style="margin-top:14px;max-width:50ch">Not another promo blast: one issue, hand-assembled, containing exactly the three things worth knowing this week in gadgets.</p>
    <ul class="legal-doc" data-perk-list style="margin-top:18px;list-style:none;padding-left:0"></ul>
  </div>
  <div class="news-band mesh" style="padding:44px">
    <h2 style="color:#fff">Take me in 💌</h2>
    <form id="newsletterMain" style="flex-direction:column;display:grid;gap:12px;margin-top:20px;background:none;border:none;backdrop-filter:none;-webkit-backdrop-filter:none;padding:0">
      <input class="input" type="email" required placeholder="you@email.com" style="background:rgba(255,255,255,.94);color:#151527;border-radius:14px;border:none" aria-label="Email address">
      <label class="checkbox" style="color:#fff;justify-content:center"><input type="checkbox" required><span class="checkmark">${I('check', 11)}</span><span class="tiny">Consent to weekly email (that's the whole ask)</span></label>
      <button class="btn btn-lg" type="submit" style="background:#151527;color:#fff;border:none">Subscribe ${I('arrowRight', 16)}</button>
    </form>
    <p class="tiny" style="opacity:.8;margin-top:14px">$10 coupon appears immediately after confirmation 🔓</p>
  </div>
</div>`, 'newsletter');

/* ════════════════ SITEMAP ════════════════ */
add('sitemap.html', 'HTML Sitemap | FRONTIER', 'Every public page and category collection on FRONTIER, linked and searchable.', `
<div class="container section">
  <h1>Sitemap</h1>
  <div class="input-wrap" style="max-width:400px;margin-top:18px">${I('search', 16, 'lead')}
    <input class="input has-lead" data-sitemap-filter placeholder="Filter pages…" aria-label="Filter sitemap pages"></div>
  <div class="grid" style="grid-template-columns:1fr 320px;gap:52px;align-items:start;margin-top:34px">
    <div>
      <h3 class="small" style="margin-bottom:12px">Pages</h3>
      <ul class="map-cols legal-doc small" data-sitemap-pages style="padding-left:0;list-style:none"></ul>
      <h3 class="small" style="margin:30px 0 12px">Categories & subcollections</h3>
      <ul class="legal-doc" data-sitemap-cats style="padding-left:0"></ul>
      <p class="tiny text-dim" style="margin-top:26px">Machine-readable versions: <a class="btn-link mono" href="robots.txt">robots.txt</a> · <a class="btn-link mono" href="sitemap.xml">sitemap.xml</a></p>
    </div>
    <aside class="co-panel" style="position:sticky;top:96px">
      <h3 class="small">Sitemap trivia</h3>
      <ul class="kv-row-group" style="margin-top:10px">
        <div class="kv-row"><span class="text-dim small">Public pages</span><b class="mono">28</b></div>
        <div class="kv-row"><span class="text-dim small">Categories</span><b class="mono">8 (+30 subs)</b></div>
        <div class="kv-row"><span class="text-dim small">Products indexed</span><b class="mono">224</b></div>
        <div class="kv-row"><span class="text-dim small">Journal articles</span><b class="mono">32</b></div>
      </ul>
      <style>.kv-row-group .kv-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed var(--border-soft)}</style>
    </aside>
  </div>
</div>`, 'sitemap');

/* ════════════════ ACCESSIBILITY ════════════════ */
add('accessibility.html', 'Accessibility Statement | FRONTIER', 'WCAG 2.1 AA commitments, keyboard map, motion preferences and how to report barriers.', `
<div class="container section" style="max-width:860px">
  <header style="text-align:center">
    <span class="badge soft">INCLUSION IS A SPEC</span>
    <h1 style="margin-top:12px">Accessibility statement</h1>
    <p class="text-dim" style="margin-top:12px">Last audited March 2026 against WCAG 2.1 AA · independent audit by TechAbility Labs.</p>
  </header>
  <article class="legal-doc co-panel section" style="padding-block:28px">
    <h2 id="compliance">Conformance</h2>
    <p>This site targets WCAG 2.1 Level AA throughout and AAA for contrast in body copy. Known exceptions (legacy map embed, third-party payment redirect frames) are documented in each audit note.</p>
    <h2 id="keyboard">Keyboard map</h2>
    <div class="table-wrap"><table class="tbl"><thead><tr><th>Action</th><th>Keys</th></tr></thead><tbody>
      <tr><td>Skip to content</td><td class="mono">Tab (first focus)</td></tr>
      <tr><td>Open search</td><td class="mono">Click search icon or navigate to it</td></tr>
      <tr><td>Close modal / drawer</td><td class="mono">Esc</td></tr>
      <tr><td>Trap release inside dialogs</td><td class="mono">Tab / Shift+Tab cycle</td></tr>
      <tr><td>Mega menu</td><td class="mono">Focus enters via Tab; hover optional</td></tr>
    </tbody></table></div>
    <h2 id="motion">Motion preferences</h2>
    <p>All decorative animation — hero particles, marquees, parallax, preloader — honours <b class="mono">prefers-reduced-motion</b> and collapses to static states automatically.</p>
    <h2 id="contrast-check">Live contrast checker</h2>
    <p class="tiny text-dim">One of the tools our designers must pass before shipping any palette change.</p>
    <form id="contrastDemo" class="flex wrap" style="gap:16px;margin-top:14px;align-items:end" oninput="">
      <div class="field" style="margin:0"><label for="contrastFg">Text color</label><input type="color" id="contrastFg" value="#F5F5F7" style="width:64px;height:44px;border-radius:10px;border:1px solid var(--border);background:var(--surface-2)"></div>
      <div class="field" style="margin:0"><label for="contrastBg">Background</label><input type="color" id="contrastBg" value="#16161E" style="width:64px;height:44px;border-radius:10px;border:1px solid var(--border);background:var(--surface-2)"></div>
      <div><output class="big-stat" id="contrastOut">—</output> <span class="status-pill delivered" id="contrastBadge">AA ✓</span></div>
    </form>
    <h2 id="reporting">Found a barrier?</h2>
    <p>Email <a class="btn-link" href="mailto:access@frontier.example">access@frontier.example</a> — a named owner replies within 2 business days, fixes carry sprint priority, and recurring reports feed directly into design system tickets.</p>
  </article>
</div>`, 'accessibility');

/* ── emit ── */
let n = 0;
for (const [f, html] of Object.entries(W)) { writeFileSync(join(ROOT, f), html); n++; }
console.log(`Emitted ${n} HTML shells.`);
