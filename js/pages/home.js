/* FRONTIER — home page: hero slider, categories, trending, deal, marquee, testimonials, blog */
UI.FPages.home = function () {
  var heroSlides = DATA.heroSlides;

  /* ---- particles ---- */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var host = qs('#particleHost');
    for (var i = 0; i < 14; i++) {
      var s = 4 + Math.random() * 8;
      var dot = UI.el('<span class="particle"></span>');
      dot.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + s + 'px;height:' + s + 'px;' +
        'bottom:-20px;animation-duration:' + (9 + Math.random() * 14) + 's;animation-delay:' + (-Math.random() * 18) + 's;opacity:' + (.2 + Math.random() * .4);
      host.appendChild(dot);
    }
  }

  /* ---- hero slider ---- */
  var track = qs('[data-hero-track]');
  track.innerHTML = heroSlides.map(function (sl, idx) {
    var p = sl.pid;
    return '<div class="hero-slide' + (idx === 0 ? ' active' : '') + '" data-hero="' + idx + '">' +
      '<div class="container flex center wrap" style="gap:40px">' +
      '<div class="hero-copy">' +
      '<span class="hero-kicker mono">' + sl.kicker + '</span>' +
      '<h1 class="hero-title" data-title-anim>' + sl.title.split(' ').map(function (w, wi) { return '<span class="word" style="animation-delay:' + (wi * 0.05) + 's">' + w + '</span>'; }).join(' ') + '</h1>' +
      '<p class="hero-sub">' + sl.sub + '</p>' +
      '<div class="hero-ctas"><a href="product.html?id=' + p.id + '" class="btn btn-primary btn-lg">Shop now — ' + DATA.money(p.price) + '</a>' +
      '<a href="shop.html?cat=' + p.category + '" class="btn btn-ghost btn-lg">Browse category</a></div></div>' +
      '<div class="hero-visual mesh"><span class="hero-glowring"></span>' +
      '<img class="hero-art" src="' + DATA.img(p, 1) + '" alt="' + p.name + '"></div>' +
      '</div></div>';
  }).join('');

  var dots = qs('.hero-dots');
  dots.innerHTML = heroSlides.map(function (_, i) { return '<button class="hero-dot' + (i === 0 ? ' active' : '') + '" data-goto="' + i + '" aria-label="Go to slide ' + (i + 1) + '"></button>'; }).join('');
  var cur = 0, timer = null;
  function goTo(n) {
    cur = (n + heroSlides.length) % heroSlides.length;
    qsa('.hero-slide').forEach(function (s, i) { s.classList.toggle('active', i === cur); });
    qsa('.hero-dot').forEach(function (d, i) { d.classList.toggle('active', i === cur); });
    restart();
  }
  function restart() { clearInterval(timer); timer = setInterval(function () { goTo(cur + 1); }, 6000); }
  qs('[data-hero-next]').addEventListener('click', function () { goTo(cur + 1); });
  qs('[data-hero-prev]').addEventListener('click', function () { goTo(cur - 1); });
  qsa('[data-goto]').forEach(function (d) { d.addEventListener('click', function () { goTo(+d.dataset.goto); }); });
  restart();

  /* ---- trust counters etc rendered statically in HTML ---- */

  /* ---- featured categories ---- */
  qs('[data-cat-cards]').innerHTML = DATA.cats.map(function (c, i) {
    var count = DATA.products.filter(function (p) { return p.category === c.slug; }).length;
    return '<a class="cat-card reveal" data-delay="' + (i % 6) + '" href="shop.html?cat=' + c.slug + '">' +
      '<span class="cat-orb" style="background:linear-gradient(135deg,hsl(' + c.hue + ',75%,55%),hsl(' + ((c.hue + 60) % 360) + ',70%,45%))">' + FR_ICON(c.icon, 34) + '</span>' +
      '<b>' + c.name + '</b><span>' + count + ' products</span></a>';
  }).join('');

  /* ---- new arrivals scroller ---- */
  qs('[data-new-arrivals]').innerHTML = DATA.newArrivals.slice(0, 10).map(function (p, i) { return UI.productCard(p, { variant: i % 3 }); }).join('');

  /* ---- smooth, state-aware horizontal scroller arrows ---- */
  qsa('.h-scroll-wrap').forEach(function (wrap) {
    var row = wrap.querySelector('.h-scroll');
    var prev = wrap.querySelector('.h-arrow.prev');
    var next = wrap.querySelector('.h-arrow.next');
    if (!row || !prev || !next) return;
    function cardStep() {
      var card = row.querySelector('.product-card');
      return (card ? card.getBoundingClientRect().width + 24 : 300) * 2;
    }
    function update() {
      var max = row.scrollWidth - row.clientWidth - 1;
      prev.disabled = row.scrollLeft <= 6;
      next.disabled = row.scrollLeft >= max - 6;
      wrap.classList.toggle('no-overflow', row.scrollWidth <= row.clientWidth + 1);
    }
    prev.addEventListener('click', function () { row.scrollBy({ left: -cardStep(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { row.scrollBy({ left: cardStep(), behavior: 'smooth' }); });
    row.addEventListener('scroll', UI.debounce(update, 60), { passive: true });
    window.addEventListener('resize', UI.debounce(update, 150));
    update();
    setTimeout(update, 400); // after images/fonts settle
  });

  /* ---- trending grid with live view counts ---- */
  qs('[data-trending]').innerHTML = DATA.trending.map(function (p, i) { return UI.productCard(p, { variant: i % 3 }); }).join('');
  var viewers = {};
  DATA.trending.forEach(function (p) { viewers[p.id] = Math.max(3, Math.round(p.views / 900)); });
  qsa('#trendingGrid .pc-rating').forEach(function (row, i) {
    row.insertAdjacentHTML('beforeend', '<span class="badge soft live-badge mono" style="font-size:.62rem;margin-left:auto">' + FR_ICON('eye', 10) + ' <span>' + viewers[DATA.trending[i].id] + '</span>&nbsp;viewing</span>');
  });
  setInterval(function () {
    if (document.hidden) return;
    var i = Math.floor(Math.random() * DATA.trending.length);
    var p = DATA.trending[i];
    viewers[p.id] += Math.floor(Math.random() * 3) - 1;
    viewers[p.id] = Math.max(2, viewers[p.id]);
    var badge = qsAllSafe('.live-badge span', qs('#trendingGrid').children[i]);
    if (badge) badge.textContent = viewers[p.id];
  }, 2600);
  function qsAllSafe(sel, root) { try { return root ? root.querySelector(sel) : null; } catch (e) { return null; } }

  /* ---- deal of the day ---- */
  var deal = DATA.deal;
  qs('[data-deal-block]').innerHTML =
    '<div class="deal-info reveal in-view">' +
    '<span class="badge hot" style="align-self:flex-start">⚡ Deal of the day</span>' +
    '<h3 style="font-size:clamp(1.5rem,2.6vw,2.1rem)">Save ' + deal.discount + '% on ' + deal.name + '</h3>' +
    '<p class="text-dim small" style="max-width:44ch">' + UI.shortDesc(deal) + '</p>' +
    '<div style="display:flex;align-items:baseline;gap:12px"><span class="price" style="font-size:1.7rem">' + DATA.money(deal.price) + '</span>' +
    '<span class="price-old" style="font-size:1rem">' + DATA.money(deal.oldPrice) + '</span></div>' +
    '<div><div class="countdown" data-deal-countdown role="timer" aria-label="Time left at this price">' +
    ['d', 'h', 'm', 's'].map(function (u) { return '<div class="cd-unit"><span class="cd-num mono" data-cd="' + u + '">00</span><span class="cd-lbl">' + ({ d: 'Days', h: 'Hrs', m: 'Min', s: 'Sec' })[u] + '</span></div>'; }).join('') + '</div></div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn-hot btn-lg" data-deal-atc>Grab this deal</button>' +
    '<a class="btn btn-ghost btn-lg" href="product.html?id=' + deal.id + '">Details</a></div></div>' +
    '<div class="deal-media mesh"><span class="badge sale deal-pct" style="font-size:.95rem;padding:9px 16px">-' + deal.discount + '%</span>' +
    '<img src="' + DATA.img(deal, 2) + '" alt="' + deal.name + '"></div>';

  var midnight = new Date(); midnight.setHours(24, 0, 0, 0);
  UI.countdown('[data-deal-countdown]', midnight);
  qs('[data-deal-atc]').addEventListener('click', function () { STORE.addToCart(deal.id, {}, this); });

  /* ---- brand marquee ---- */
  var logos = DATA.brands.slice(0, 16).map(function (b) { return '<span class="brand-logo">' + b + '</span>'; }).join('');
  qs('[data-marquee]').innerHTML = '<div class="marquee-track">' + logos + logos + '</div>';

  /* ---- testimonials ---- */
  qs('[data-testimonials]').innerHTML = DATA.testimonials.slice(0, 14).map(function (t) {
    var p = DATA.productById(t.product);
    return '<figure class="testi-card"><div class="testi-quote-row">' + UI.stars(t.rating, 15) +
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" opacity=".12" aria-hidden="true"><path d="M4.6 11.2c0-3.9 2.4-6.9 5.9-8.2l1 1.9c-2 .8-3.3 2.2-3.6 4h2.7v8.3H4.6v-6Zm9.4 0c0-3.9 2.4-6.9 5.9-8.2l1 1.9c-2 .8-3.3 2.2-3.6 4h2.7v8.3H14v-6Z"/></svg></div>' +
      '<blockquote class="testi-text">“' + t.text + '”</blockquote>' +
      '<figcaption class="testi-who"><span class="avatar sm">' + t.name[0] + '</span><div><b>' + t.name + '</b><span>' + t.city + ' · bought ' + p.subcategory.toLowerCase() + '</span></div></figcaption></figure>';
  }).join('');

  /* auto-scroll testimonial row */
  var tRow = qs('[data-testimonials]');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var paused = false;
    tRow.addEventListener('mouseenter', function () { paused = true; });
    tRow.addEventListener('mouseleave', function () { paused = false; });
    setInterval(function () {
      if (paused || document.hidden) return;
      if (tRow.scrollLeft + tRow.clientWidth >= tRow.scrollWidth - 8) tRow.scrollTo({ left: 0, behavior: 'smooth' });
      else tRow.scrollBy({ left: 396, behavior: 'smooth' });
    }, 3500);
  }

  /* ---- blog highlights ---- */
  qs('[data-blog-picks]').innerHTML = DATA.posts.filter(function (b) { return b.category === 'Reviews'; }).slice(0, 3).map(function (post, i) { return blogCard(post, i); }).join('');

  function blogCard(post, i) {
    var r = DATA.rng(post.coverSeed);
    var h = (i * 74 + 205) % 360;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h + ',65%,52%)"/><stop offset="1" stop-color="hsl(' + ((h + 80) % 360) + ',70%,38%)"/></linearGradient></defs><rect width="320" height="180" fill="url(#bg)"/><circle cx="' + (240 + r() * 40) + '" cy="' + (30 + r() * 30) + '" r="70" fill="#fff" opacity=".08"/><path d="M40 140 L90 90 L130 120 L190 55 L240 100 L280 70" stroke="#fff" stroke-width="5" fill="none" opacity=".85" stroke-linecap="round"/><rect width="320" height="180" fill="#000" opacity=".08"/></svg>';
    return '<article class="blog-card reveal" data-delay="' + (i + 1) + '"><div class="blog-thumb"><img src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '" alt="" loading="lazy"><span class="badge soft blog-cat-badge">' + post.category + '</span></div>' +
      '<div class="blog-body"><h3 style="font-size:1.06rem"><a href="blog-post.html?id=' + post.id + '">' + post.title + '</a></h3>' +
      '<p class="blog-excerpt">' + post.excerpt + '</p>' +
      '<div class="blog-meta"><span class="avatar sm" title="' + post.author + '">' + post.author[0] + '</span><span>' + post.author + '</span><span aria-hidden="true">·</span><time datetime="' + post.date + '">' + new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</time><span aria-hidden="true">·</span><span>' + post.readTime + ' min read</span></div></div></article>';
  }

  /* newsletter handled via shared handler (HTML binds it) */

  // re-observe late-inserted reveal nodes
  UI.observeNew();
  UI.bindRipples();
};
