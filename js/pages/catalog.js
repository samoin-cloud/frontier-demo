/* FRONTIER — categories · search · compare pages */
UI.FPages.categories = function () {
  var grid = qs('[data-cat-grid]');
  grid.innerHTML = DATA.cats.map(function (c, i) {
    var items = DATA.products.filter(function (p) { return p.category === c.slug; });
    var count = items.length;
    var subs = c.subs.map(function (s) {
      var sc = items.filter(function (p) { return p.subcategory === s; }).length;
      return '<a class="chip" href="shop.html?cat=' + c.slug + '&sub=' + encodeURIComponent(s) + '">' + s + ' <b class="mono" style="font-size:.7rem">' + sc + '</b></a>';
    }).join('');
    return '<article class="product-card reveal" data-delay="' + i % 6 + '" style="overflow:hidden">' +
      '<div style="aspect-ratio:16/7;background:linear-gradient(135deg,hsl(' + c.hue + ',70%,50%),hsl(' + ((c.hue + 55) % 360) + ',72%,40%));display:grid;place-items:center;color:#fff;position:relative">' +
      FR_ICON(c.icon, 52) + '<span class="badge sale" style="position:absolute;top:14px;right:14px">' + count + ' products</span></div>' +
      '<div class="pc-body"><h3 style="font-size:1.15rem">' + c.name + '</h3>' +
      '<p class="text-dim small">From <b class="price mono">$' + Math.min.apply(null, items.map(function (p) { return p.price; })).toFixed(0) + '</b> — everything ' + c.name.toLowerCase() + ', curated by our team.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' + subs + '</div>' +
      '<a class="btn btn-primary btn-sm" href="shop.html?cat=' + c.slug + '" style="margin-top:14px;align-self:flex-start">Shop ' + c.name + ' →</a></div></article>';
  }).join('');

  /* featured banner */
  var featured = DATA.cats[2];
  qs('[data-feat-banner]').innerHTML =
    '<div style="display:flex;align-items:center;gap:34px;flex-wrap:wrap;padding:clamp(24px,4vw,48px)">' +
    '<span style="width:92px;height:92px;border-radius:28px;background:rgba(255,255,255,.18);backdrop-filter:blur(6px);display:grid;place-items:center;color:#fff">' + FR_ICON(featured.icon, 44) + '</span>' +
    '<div style="flex:1;min-width:240px;color:#fff"><span class="badge limited">Category spotlight</span><h2 style="margin-top:10px;color:#fff">' + featured.name + ' week</h2>' +
    '<p style="opacity:.85;max-width:56ch;margin-top:6px">Up to 35% off flagship audio, bundles from $199, and a free desktop DAC with every order over $250. Ends Sunday midnight.</p>' +
    '<div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap"><a class="btn btn-lg" style="background:#fff;color:#151527;border:none" href="shop.html?cat=audio">Shop the event</a><a class="btn btn-ghost btn-lg" style="color:#fff;border-color:rgba(255,255,255,.4)" href="blog.html">Read our audio guide</a></div></div></div>';

  /* descriptions block (SEO) */
  qs('[data-seo-text]').innerHTML = DATA.cats.map(function (c) {
    return '<h3 style="font-size:.95rem">' + c.name + '</h3><p class="text-dim small">' + c.subs.join(' · ') + '. Every ' + c.name.toLowerCase() + ' purchase at FRONTIER ships free over $99 with our 2-year warranty and 30-day return promise.' + '</p>';
  }).join('<hr style="border:none;border-top:1px dashed var(--border);margin-block:16px">');

  UI.observeNew();
};

/* ---------------- search results page ---------------- */
UI.FPages.search = function () {
  var q = UI.getParam('q');
  var input = qs('[data-q-input]');
  input.value = q;
  document.title = (q ? 'Search: ' + q : 'Search') + ' | FRONTIER';
  qs('[data-q-display]').textContent = q ? '"' + q + '"' : 'everything';

  function run() {
    q = UI.getParam('q');
    input.value = q;
    qs('[data-q-display]').textContent = q ? '"' + q + '"' : 'everything';
    render();
  }
  window.addEventListener('popstate', run);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); history.pushState(null, '', 'search.html?q=' + encodeURIComponent(input.value)); run(); }
  });

  function matches() {
    if (!q.trim()) return [];
    var words = q.toLowerCase().split(/\s+/);
    return DATA.products.filter(function (p) {
      var hay = (p.name + ' ' + p.brand + ' ' + p.category + ' ' + p.subcategory).toLowerCase();
      return words.every(function (w) { return hay.indexOf(w) !== -1; });
    });
  }

  function render() {
    var res = matches();
    qs('[data-search-count]').innerHTML = q.trim()
      ? '<b>' + res.length + '</b> product' + (res.length === 1 ? '' : 's') + ' matched your search across names, brands and categories.'
      : 'Type what you are looking for, or explore trending searches below.';
    var host = qs('[data-search-results]');
    host.innerHTML = res.length
      ? res.map(function (p, i) { return UI.productCard(p, { variant: i % 3 }); }).slice(0, 24).join('')
      : '<div class="empty-state" style="grid-column:1/-1"><div class="art">' + FR_ICON('search', 40) + '</div>' +
        '<h3>No products found' + (q ? ' for “' + q + '”' : '') + '</h3>' +
        '<p class="text-dim small">Check spelling, try broader words — or let AI-suggestions spark something.</p>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:6px">' +
        ['wireless earbuds', 'smartwatch', 'gaming console', '4k drone'].map(function (t) {
          return '<button class="chip" data-rel-q="' + t + '">' + t + '</button>';
        }).join('') + '</div></div>';
    qsa('[data-rel-q]').forEach(function (b) { b.addEventListener('click', function () { location.href = 'search.html?q=' + encodeURIComponent(b.dataset.relQ); }); });
    UI.observeNew(host);
  }

  /* did-you-mean suggestions when few/no results */
  function relatedSearches() {
    var pool = ['smartphone under $500', 'best ANC headphones', 'ultralight laptop', 'fitness tracker with GPS', 'smart lighting starter kit', 'pro drone bundle'];
    qs('[data-related-searches]').innerHTML = pool.map(function (t) { return '<a class="chip" href="search.html?q=' + encodeURIComponent(t) + '">' + t + '</a>'; }).join('');
  }
  relatedSearches();
  render();
};

/* ---------------- compare page ---------------- */
UI.FPages.compare = function () {
  var ROWS = [
    ['Display / Key hardware', function (p) { return (p.specs[0] || ['', '—'])[1]; }],
    ['Processor / Chipset', function (p) { return specOf(p, 'Chipset') || specOf(p, 'Processor') || specOf(p, 'Performance') || specOf(p, 'Sensor') || specOf(p, 'Drivers') || '—'; }],
    ['Memory', function (p) { return specOf(p, 'RAM') || '—'; }],
    ['Storage', function (p) { return specOf(p, 'Storage') || 'Built-in'; }],
    ['Battery', function (p) { return p.battery + 'h typical'; }],
    ['Weight', function (p) { return p.weight + ' kg'; }],
    ['Connectivity', function (p) { return p.connectivity.join(', '); }],
    ['Colors available', function (p) { return p.colors.length + ' finishes'; }],
    ['Rating', function (p) { return p.rating.toFixed(1) + ' / 5 (' + UI.fmtCount(p.reviews) + ')'; }],
    ['Price', function (p) { return DATA.money(p.price); }]
  ];
  function specOf(p, key) {
    for (var i = 0; i < p.specs.length; i++) if (p.specs[i][0].indexOf(key) === 0) return p.specs[i][1];
    return '';
  }

  var wrap = qs('[data-compare-zone]');
  function render() {
    var ids = STORE.get().compare;
    if (!ids.length) {
      wrap.innerHTML = '<div class="empty-state"><div class="art">' + FR_ICON('scale', 40) + '</div>' +
        '<h3>Your comparison table is empty</h3><p class="text-dim small">Tick “Compare” on any product card in the shop, or add suggestions below.</p>' +
        '<a class="btn btn-primary" href="shop.html">Browse products</a></div>';
      qs('[data-compare-picks]').parentElement.style.display = '';
      renderPicks();
      return;
    }
    var prods = ids.map(DATA.productById).filter(Boolean).slice(0, STORE.MAX_COMPARE);
    var headCells = prods.map(function (p) {
      return '<th scope="col"><div class="compare-prod"><img src="' + DATA.img(p) + '" alt="' + p.name + '">' +
        '<a href="product.html?id=' + p.id + '"><b>' + p.name + '</b></a>' +
        '<div class="pc-rating small" style="justify-content:center">' + UI.stars(p.rating, 12) + '</div>' +
        '<span class="price mono" style="display:block;margin-top:4px">' + DATA.money(p.price) + '</span>' +
        '<button class="btn btn-primary btn-sm" data-cmp-atc="' + p.id + '">' + FR_ICON('cart', 13) + ' Add to cart</button>' +
        '<button class="icon-btn" data-cmp-rm="' + p.id + '" aria-label="Remove from comparison" style="margin-top:6px;width:34px;height:34px">' + FR_ICON('x', 14) + '</button></div></th>';
    }).join('');
    var bodyRows = ROWS.map(function (rowDef) {
      var vals = prods.map(function (p) { return rowDef[1](p); });
      var allSame = vals.every(function (v) { return v === vals[0]; });
      return '<tr data-row class="' + (allSame ? 'same-row' : '') + '"><th scope="row" class="small text-dim">' + rowDef[0] + '</th>' +
        vals.map(function (v) { return '<td class="small">' + v + '</td>'; }).join('') + '</tr>';
    }).join('');
    wrap.innerHTML =
      '<div class="flex between center wrap" style="margin-bottom:16px"><label class="checkbox" style="padding:0"><input type="checkbox" id="diffOnly"><span class="checkmark">' + FR_ICON('check', 11) + '</span>Only show differences</label>' +
      '<button class="btn btn-danger btn-sm" id="cmpClear">' + FR_ICON('trash', 14) + ' Clear comparison</button></div>' +
      '<div class="table-wrap compare-wrap"><table class="tbl" style="min-width:' + (280 * prods.length + 180) + 'px"><thead><tr><th style="min-width:160px;background:var(--surface)">Attribute</th>' + headCells + '</tr></thead><tbody id="cmpBody">' + bodyRows + '</tbody></table></div>' +
      '<p class="tiny text-dim" style="margin-top:12px">Scroll horizontally to see all products · specifications are manufacturer-published.</p>';

    qs('#diffOnly').addEventListener('change', function () { qs('#cmpBody').classList.toggle('diff-only-body', this.checked); applyDiff(this.checked); });
    qs('#cmpClear').addEventListener('click', function () { STORE.get().compare.length = 0; STORE.save(); render(); });
    qsa('[data-cmp-rm]', wrap).forEach(function (b) {
      b.addEventListener('click', function () { STORE.toggleCompare(+b.dataset.cmpRm); render(); });
    });
    qsa('[data-cmp-atc]', wrap).forEach(function (b) {
      b.addEventListener('click', function () { STORE.addToCart(+b.dataset.cmpAtc, {}, b); });
    });

    function applyDiff(onOff) {
      // for diff mode we hide rows where all values identical OR simply show only different ones
      qsa('#cmpBody tr').forEach(function (tr, i) {
        var same = tr.classList.contains('same-row');
        tr.style.display = onOff && same ? 'none' : '';
      });
    }
  }

  function renderPicks() {
    var host = qs('[data-compare-picks]');
    var picks = DATA.trending.slice(0, 4);
    host.innerHTML = picks.map(function (p, i) { return UI.productCard(p, { variant: i }); }).join('');
  }
  render();
  UI.observeNew();
};
