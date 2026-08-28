/* FRONTIER — product detail: gallery+zoom · variants · tabs · reviews · sticky ATC · related */
UI.FPages.product = function () {
  var pid = parseInt(UI.getParam('id'), 10);
  var p = DATA.productById(pid);
  var root = qs('#pdRoot');
  if (!p) { location.href = '404.html'; return; }
  STORE.trackRecent(p.id);
  document.title = p.name + ' | FRONTIER';
  var wishOn = STORE.inWishlist(p.id) ? 'on' : '';
  var artOf = function (i) { return DATA.img(p, i); };

  /* reviews generated deterministically */
  var REVIEWS = (function () {
    var r = DATA.rng('rev:' + p.id);
    var n = 4 + Math.floor(r() * 4);
    var names = ['Ella Fitzgerald Jr.', 'Marcus Wong', 'Anja Keller', 'Ope Adeyemi', 'Ravi Nair', 'Bethany Cole', 'Hugo Martins'];
    var titles = ['Exceeded expectations', 'Worth every cent', 'Great, with one caveat', 'My daily driver now', 'Almost perfect', 'Gifted twice already', 'Solid build quality'];
    var bodies = [
      'Setup took two minutes and the app walked me through everything. Performance matches the listing specs honestly.',
      'Three weeks of heavy use and no complaints — battery still hits the advertised numbers.',
      'Only note: the case is a fingerprint magnet. Everything else, including sound and comfort, is superb.',
      'Comparison-shopped for a month before buying here. This was the best value by a clear margin.',
      'Does exactly what the marketing says, which is rarer than it should be. Recommended to coworkers.',
      'Kids dropped it twice already — zero damage. Build quality feels a tier above the price.'
    ];
    return Array.apply(null, Array(n)).map(function (_, i) {
      var stars = Math.min(5, Math.max(3, Math.round(p.rating + (r() * 1.4 - 0.7))));
      return {
        name: names[Math.floor(r() * names.length)],
        title: titles[i % titles.length],
        body: bodies[i % bodies.length],
        stars: stars,
        days: 2 + Math.floor(r() * 120),
        verified: r() < 0.82,
        helpful: Math.floor(r() * 140)
      };
    });
  })();

  /* ---------- layout render ---------- */
  root.innerHTML =
    '<nav class="breadcrumb container" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">/</span>' +
    '<a href="shop.html?cat=' + p.category + '">' + catName(p.category) + '</a><span class="sep">/</span>' +
    '<a href="shop.html?cat=' + p.category + '&sub=' + encodeURIComponent(p.subcategory) + '">' + p.subcategory + '</a>' +
    '<span class="sep">/</span><span class="current">' + p.name + '</span></nav>' +

    '<div class="container pd-layout page-enter">' +
    '<div class="pd-gallery">' +
    '<div class="pd-main-img" id="pdMain">' +
    '<img src="' + artOf(0) + '" alt="' + p.name + ' gallery image 1" id="pdMainImg">' +
    '<div class="zoom-lens" id="pdLens"></div>' +
    '<span style="position:absolute;left:14px;top:14px;display:flex;gap:6px">' + p.badges.slice(0, 2).map(function (b) {
      if (b === 'sale') return '<span class="badge sale">-' + p.discount + '%</span>';
      if (b === 'new') return '<span class="badge new">New</span>';
      if (b === 'hot') return '<span class="badge hot">Hot</span>';
      if (b === 'limited') return '<span class="badge limited">Limited run</span>';
      return '';
    }).join('') + '</span>' +
    '</div>' +
    '<div class="pd-thumbs" id="pdThumbs">' + [0, 1, 2, 3].map(function (i) {
      return '<button class="pd-thumb' + (i === 0 ? ' active' : '') + '" data-thumb="' + i + '" aria-label="View image ' + (i + 1) + '"><img src="' + artOf(i) + '" alt=""></button>';
    }).join('') + '</div>' +
    '</div>' +

    '<div class="pd-info">' +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><a class="chip" href="shop.html?q=' + encodeURIComponent(p.brand) + '">' + p.brand + '</a>' + (p.ageLabel ? '<span class="badge new" style="font-size:.66rem">' + p.ageLabel + '</span>' : '') + '</div>' +
    '<h1 style="font-size:clamp(1.5rem,2.8vw,2.2rem);line-height:1.15">' + p.name + '</h1>' +
    '<div class="pc-rating" style="margin-top:10px">' + UI.stars(p.rating) + '<b>' + p.rating.toFixed(1) + '</b>' +
    '<a href="#reviews" class="btn-link small">(' + UI.fmtCount(p.reviews) + ' reviews)</a>' +
    '<span class="tiny mono text-dim">SKU FR-' + String(p.id).padStart(4, '0') + '-' + p.brand.slice(0, 2).toUpperCase() + '</span></div>' +

    '<div class="pd-price-row"><span class="price" style="font-size:2rem">' + DATA.money(p.price) + '</span>' +
    (p.oldPrice ? '<span class="price-old" style="font-size:1rem">' + DATA.money(p.oldPrice) + '</span><span class="badge sale">Save ' + p.discount + '%</span>' : '') +
    stockNoteHtml() + '</div>' +

    '<p class="text-dim" style="max-width:56ch">' + UI.shortDesc(p) + '</p>' +
    '<div class="pd-options">' +
    '<div><h3 class="tiny" style="text-transform:uppercase;letter-spacing:.1em;margin-bottom:9px">Color — <span id="colorLabel" class="mono">' + (p.colors[0] ? p.colors[0].name : '') + '</span></h3>' +
    '<div class="swatches" id="pdSwatches">' + p.colors.map(function (c, i) {
      return '<button class="swatch' + (i === 0 ? ' active' : '') + '" style="background:' + c.hex + '" data-swatch="' + c.name.replace(/"/g, '') + '" data-tip="' + c.name + '" aria-label="' + c.name + '" aria-pressed="' + (i === 0) + '"></button>';
    }).join('') + '</div></div>' +
    '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
    '<div class="qty-stepper" id="pdQty"><button data-step="-1" aria-label="Decrease quantity">' + FR_ICON('minus', 15) + '</button><span class="qty-val"><span>1</span></span><button data-step="1" aria-label="Increase quantity">' + FR_ICON('plus', 15) + '</button></div>' +
    '<span class="tiny text-dim">' + (p.stock !== 'out' ? FR_ICON('zap', 13) + ' <b class="stock-note ' + (p.stock === 'low' ? 'low' : 'in') + '">' + (p.stock === 'low' ? 'Hurry — only ' + p.lowCount + ' left!' : 'In stock & ships today') + '</b>' : '') + '</span>' +
    '</div></div>' +

    '<div class="pd-cta-row">' +
    '<button class="btn btn-primary btn-lg" id="pdAddBtn" style="flex:1;min-width:220px" ' + (p.stock === 'out' ? 'disabled' : '') + '>' + FR_ICON('cart', 18) + (p.stock === 'out' ? 'Sold out' : 'Add to cart — ' + DATA.money(p.price)) + '</button>' +
    '<button class="btn btn-secondary btn-lg" id="pdBuyBtn" ' + (p.stock === 'out' ? 'disabled' : '') + '>⚡ Buy now</button>' +
    '<button class="pc-fav ' + wishOn + '" id="pdWish" aria-label="Toggle wishlist" style="width:52px;height:52px;border:1px solid var(--border)">' + FR_ICON('heart', 22) + '</button>' +
    '<button class="pc-fav" id="pdShare" aria-label="Share product" style="width:52px;height:52px;border:1px solid var(--border)">' + FR_ICON('share', 20) + '</button>' +
    '</div>' +

    '<div class="ship-estimator"><div class="input-wrap" style="flex:1">' + FR_ICON('pin', 17, 'lead') +
    '<input class="input has-lead" id="zipInput" inputmode="numeric" maxlength="10" placeholder="ZIP code for delivery estimate"></div>' +
    '<button class="btn btn-ghost" id="zipCheck">Estimate</button></div><div class="small text-dim" id="zipOut" aria-live="polite"></div>' +

    '<div class="pd-trust">' +
    ['shield|2-year warranty', 'refresh|30-day free returns', 'truck|Free shipping over $99'].map(function (t) {
      var kv = t.split('|');
      return '<div>' + FR_ICON(kv[0], 17) + kv[1] + '</div>';
    }).join('') + '</div>' +
    '</div></div>';

  function stockNoteHtml() {
    if (p.stock === 'low') return '<span class="stock-note low">Low stock — ' + p.lowCount + ' left</span>';
    if (p.stock === 'out') return '<span class="stock-note out">Out of stock</span>';
    return '<span class="stock-note in">In stock</span>';
  }
  function catName(slug) {
    var c = DATA.cats.filter(function (x) { return x.slug === slug; })[0];
    return c ? c.name : slug;
  }

  /* ---------- tabs content: description · specs · review summary ---------- */
  var featureBits = [
    p.connectivity[0] + ' with multipoint pairing',
    'Up to ' + p.battery + 'h of real-world battery life',
    p.colors.length + ' finishes including ' + p.colors[0].name,
    '2-year FRONTIER Care included at no extra cost'
  ];
  qs('#pdDescTab').innerHTML =
    '<h2 style="font-size:1.3rem;margin-bottom:12px">Why the ' + p.name + '?</h2>' +
    '<p>' + p.descUseCase + ' The ' + p.subcategory.toLowerCase() + ' sits in ' + p.brand + '\'s ' + (p.oldPrice ? 'best-value tier' : 'flagship tier') + ', and our lab notes single out its build quality and day-to-day consistency.</p>' +
    '<p>' + UI.shortDesc(p) + '</p>' +
    '<h2 style="font-size:1.1rem;margin-top:26px">Highlights</h2><ul>' +
    featureBits.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' +
    '<blockquote>"We test every claim on a retail unit for two weeks. This one passed without a asterisk." — FRONTIER Lab</blockquote>';

  qs('#pdSpecsTable tbody').innerHTML = p.specs.map(function (row) {
    return '<tr><td>' + row[0] + '</td><td>' + row[1] + '</td></tr>';
  }).join('');

  qs('#pdAvgRating').textContent = p.rating.toFixed(1);
  qs('#pdAvgStars').innerHTML = UI.stars(p.rating, 18);
  qs('#pdAvgCount').textContent = UI.fmtCount(p.reviews) + ' verified reviews';

  /* ---------- gallery ---------- */
  var thumbs = qsa('[data-thumb]');
  thumbs.forEach(function (t) {
    t.addEventListener('click', function () {
      thumbs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      qs('#pdMainImg').src = artOf(+t.dataset.thumb);
      qs('#pdMainImg').style.transform = '';
    });
  });
  var mainImgBox = qs('#pdMain'), lens = qs('#pdLens');
  mainImgBox.addEventListener('mousemove', function (e) {
    var r = mainImgBox.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    lens.style.left = (x - 60) + 'px'; lens.style.top = (y - 60) + 'px';
    qs('#pdMainImg').style.transformOrigin = x / r.width * 100 + '% ' + y / r.height * 100 + '%';
    qs('#pdMainImg').style.transform = 'scale(1.75)';
  });
  mainImgBox.addEventListener('mouseleave', function () { qs('#pdMainImg').style.transform = ''; });

  /* ---------- variant + qty ---------- */
  var chosenColor = p.colors[0] || null;
  var qty = 1;
  qsa('#pdSwatches .swatch').forEach(function (sw) {
    sw.addEventListener('click', function () {
      qsa('#pdSwatches .swatch').forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
      sw.classList.add('active'); sw.setAttribute('aria-pressed', 'true');
      chosenColor = sw.dataset.swatch;
      qs('#colorLabel').textContent = chosenColor;
      qs('#pdMainImg').src = artOf(p.colors.map(function (c) { return c.name; }).indexOf(chosenColor) % 4);
    });
  });
  qs('#pdQty').addEventListener('click', function (e) {
    var b = e.target.closest('[data-step]'); if (!b) return;
    qty = Math.max(1, Math.min(20, qty + (+b.dataset.step)));
    qs('#pdQty .qty-val span').textContent = qty;
  });

  qs('#pdAddBtn').addEventListener('click', function () {
    STORE.addToCart(p.id, { color: colorObj(), qty: qty }, this);
  });
  qs('#pdBuyBtn').addEventListener('click', function () {
    STORE.addToCart(p.id, { color: colorObj(), qty: qty });
    location.href = 'checkout.html';
  });
  function colorObj() {
    for (var i = 0; i < (p.colors || []).length; i++) if (p.colors[i].name === chosenColor) return p.colors[i];
    return undefined;
  }
  qs('#pdWish').addEventListener('click', function () {
    var added = STORE.toggleWishlist(p.id);
    this.classList.toggle('on', added);
  });
  qs('#pdShare').addEventListener('click', function () {
    var url = location.href.split('?')[0] + '?id=' + p.id;
    if (navigator.share) { navigator.share({ title: p.name, url: url }).catch(function () {}); return; }
    navigator.clipboard && navigator.clipboard.writeText(url);
    UI.toast('success', 'Link copied', 'Product link is ready to paste anywhere.');
  });

  /* ---------- zip estimator ---------- */
  qs('#zipCheck').addEventListener('click', function () {
    var zip = qs('#zipInput').value.trim();
    var out = qs('#zipOut');
    if (!/^[0-9]{5}(-[0-9]{4})?$/.test(zip)) {
      out.innerHTML = '<span style="color:var(--accent)">' + FR_ICON('alert', 13) + ' Please enter a valid 5-digit ZIP.</span>';
      return;
    }
    var days = 2 + (parseInt(zip[0], 10) % 4);
    out.innerHTML = '<span style="color:#22c55e">' + FR_ICON('truck', 13) + ' Estimated delivery: <b>' + new Date(Date.now() + days * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + '</b> via standard shipping (free over $99).</span>';
  });

  /* ---------- tabs ---------- */
  var tabRoot = qs('[data-pd-tabs]');
  var r = DATA.rng('dist:' + p.id);
  var starCounts = [5, 4, 3, 2, 1].map(function (st) {
    var base = st === Math.round(p.rating) ? .48 : [0.05, 0.06, 0.08, 0.08, 0.09][Math.abs(st - 5)];
    var v = Math.max(.02, base * (0.7 + r() * 0.6));
    return Math.round(v * 100) / 100;
  });
  var sum = starCounts.reduce(function (a, b) { return a + b; }, 0);

  qs('[data-rev-bars]').innerHTML = starCounts.map(function (v, i) {
    var pct = Math.round(v / sum * 100);
    return '<div class="rb-row"><span>' + (5 - i) + '★</span><div class="progress"><i style="width:' + pct + '%"></i></div><span class="mono">' + pct + '%</span></div>';
  }).join('');

  qs('[data-rev-list]').innerHTML = REVIEWS.map(function (rv) {
    return '<article class="review-item"><div class="flex between center wrap"><div class="flex center" style="gap:10px"><span class="avatar sm">' + rv.name[0] + '</span><b class="small">' + rv.name + '</b>' +
      (rv.verified ? '<span class="badge soft" style="font-size:.62rem">' + FR_ICON('checkCircle', 11) + ' Verified purchase</span>' : '') + '</div>' +
      '<time class="tiny text-dim mono" datetime="' + new Date(Date.now() - rv.days * 86400000).toISOString().slice(0, 10) + '">' + rv.days + ' days ago</time></div>' +
      '<div style="display:flex;gap:10px;align-items:center">' + UI.stars(rv.stars, 13) + '<b style="font-size:.92rem">' + rv.title + '</b></div>' +
      '<p class="small text-dim">' + rv.body + '</p>' +
      '<div class="flex" style="gap:14px"><button class="btn btn-link tiny" data-helpful>' + FR_ICON('thumbUp', 13) + ' Helpful (<span>' + rv.helpful + '</span>)</button>' +
      '<button class="btn btn-link tiny" onclick="UI.toast(\'info\',\'Thanks!\',\'Our moderation team takes every report seriously.\')">Report</button></div></article>';
  }).join('');
  qsa('[data-helpful]').forEach(function (b) {
    b.addEventListener('click', function () {
      var num = b.querySelector('span:last-child span');
      num.textContent = (+num.textContent) + 1;
      b.disabled = true; b.style.opacity = '.6';
    });
  });

  qs('[data-review-form]').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target;
    if (!form.reportValidity()) return;
    UI.toast('success', 'Review submitted!', 'Thanks for helping other shoppers.');
    form.reset();
    var inp = form.querySelector('.rate-input button.on');
  });

  /* interactive star input — DOM order is reversed via CSS row-reverse,
     so adding .on to a button lights every sibling BEFORE it in the DOM (visually to its right) */
  qsa('.rate-input button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      qsa('.rate-input button').forEach(function (o) { o.classList.remove('on'); });
      btn.classList.add('on');
    });
  });

  /* related products */
  var related = DATA.products.filter(function (x) { return x.category === p.category && x.id !== p.id && x.stock !== 'out'; })
    .sort(function (a, b) { return Math.abs(a.price - p.price) - Math.abs(b.price - p.price); }).slice(0, 8);
  qs('[data-related]').innerHTML = related.map(function (rp, i) { return UI.productCard(rp, { variant: i % 3 }); }).join('');

  /* recently viewed bar (skip IDs that no longer exist in the catalogue) */
  var recentIds = STORE.get().recent.filter(function (x) { return x !== p.id; })
    .map(function (x) { return DATA.productById(x); }).filter(Boolean).slice(0, 8)
    .map(function (rp) { return rp.id; });
  var rvBar = qs('.recently-viewed');
  if (recentIds.length) {
    rvBar.classList.add('show');
    qs('.rv-inner', rvBar).innerHTML = '<span class="tiny text-dim mono" style="flex-shrink:0;padding-right:6px">RECENTLY VIEWED →</span>' +
      recentIds.map(function (rid) {
        var rp = DATA.productById(rid);
        return '<a class="rv-item" href="product.html?id=' + rp.id + '"><img src="' + DATA.img(rp) + '" alt=""><span>' + rp.name.split(' ').slice(0, 3).join(' ') + '<br><b class="mono price" style="font-size:.72rem">' + DATA.money(rp.price) + '</b></span></a>';
      }).join('');
  }

  /* sticky ATC */
  var sticky = qs('.sticky-atc');
  qs('.sticky-atc-inner', sticky).innerHTML =
    '<img src="' + artOf(0) + '" style="width:46px;height:46px;border-radius:10px;background:var(--surface-2)" alt=""><b class="small">' + p.name + '</b>' +
    '<span class="price">' + DATA.money(p.price) + '</span>' +
    '<button class="btn btn-primary" id="stickyAtcBtn">' + FR_ICON('cart', 15) + (p.stock === 'out' ? 'Sold out' : 'Add to cart') + '</button>';
  var infoEl = qs('.pd-info');
  window.addEventListener('scroll', UI.debounce(function () {
    var past = window.scrollY > infoEl.offsetTop + infoEl.offsetHeight - 500;
    sticky.classList.toggle('show', past && !(qs('.modal-backdrop')));
  }, 30));
  document.addEventListener('click', function (e) {
    if (e.target.closest('#stickyAtcBtn')) STORE.addToCart(p.id, { color: colorObj(), qty: qty }, qs('#stickyAtcBtn'));
  });

  /* JSON-LD structured data */
  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.name, brand: { '@type': 'Brand', name: p.brand },
    description: UI.shortDesc(p),
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
    offers: { '@type': 'Offer', priceCurrency: 'USD', price: p.price.toFixed(2), availability: p.stock === 'out' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' }
  });
  document.head.appendChild(ld);

  UI.observeNew();
  UI.bindRipples();
};
