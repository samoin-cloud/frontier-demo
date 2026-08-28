/* FRONTIER — shop page: advanced filters · sort · view toggle · active chips · pagination */
UI.FPages.shop = function () {
  var params = new URLSearchParams(location.search);
  var F = {
    cat: params.get('cat') || '', sub: params.get('sub') || '',
    q: params.get('q') || '', sale: params.get('sale') === '1',
    brands: [], minPrice: null, maxPrice: null, rating: 0,
    inStockOnly: false, colors: [], connect: [], age: '',
    sort: 'popular', page: 1, perPage: 12, view: 'grid'
  };
  if (F.sub) F.cat = F.cat || '';
  var PER = [12];
  var resultsRoot = qs('[data-results]');
  var counterEl = qs('[data-counter]');

  /* ---------- build filter UI ---------- */
  var catListEl = qs('[data-filter-cats]');
  catListEl.innerHTML =
    '<label class="checkbox"><input type="radio" name="fcat" value="" ' + (!F.cat ? 'checked' : '') + '><span class="checkmark">' + FR_ICON('check', 11) + '</span>All products</label>' +
    DATA.cats.map(function (c) {
      var count = DATA.products.filter(function (p) { return p.category === c.slug; }).length;
      return '<label class="checkbox"><input type="radio" name="fcat" value="' + c.slug + '" ' + (F.cat === c.slug ? 'checked' : '') + '><span class="checkmark">' + FR_ICON('check', 11) + '</span>' + c.name + ' <span class="tiny text-dim" style="margin-left:auto">(' + count + ')</span></label>';
    }).join('');

  var brandPool = {};
  basePool().forEach(function (p) { brandPool[p.brand] = (brandPool[p.brand] || 0) + 1; });
  var topBrands = Object.keys(brandPool).sort(function (a, b) { return brandPool[b] - a; }).slice(0, 10);
  qs('[data-filter-brands]').innerHTML = topBrands.map(function (b) {
    return '<label class="checkbox"><input type="checkbox" value="' + b.replace(/"/g, '') + '" data-fbrand><span class="checkmark">' + FR_ICON('check', 11) + '</span>' + b + ' <span class="tiny text-dim" style="margin-left:auto">(' + brandPool[b] + ')</span></label>';
  }).join('');

  var priceBounds = bounds();
  qs('[data-price-min]').max = qs('[data-price-max]').max = priceBounds.max;
  qs('[data-price-min]').value = F.minPrice || priceBounds.min;
  qs('[data-price-max]').value = F.maxPrice || priceBounds.max;
  paintRange(qs('[data-price-min]'), priceBounds); paintRange(qs('[data-price-max]'), priceBounds);
  qs('[data-price-labels]').innerHTML = '<span class="mono" data-plabel-min>' + DATA.money(priceBounds.min) + '</span><span class="text-dim">—</span><span class="mono" data-plabel-max>' + DATA.money(priceBounds.max) + '</span>';

  qs('[data-filter-rating]').innerHTML = [[4.5, '4.5★ & up'], [4, '4★ & up'], [3.5, '3.5★ & up']].map(function (r) {
    return '<label class="checkbox"><input type="radio" name="frate" value="' + r[0] + '" ' + (+r[0] === 0 ? '' : '') + '><span class="checkmark">' + FR_ICON('check', 11) + '</span><span style="display:inline-flex;align-items:center;gap:6px">' + UI.stars(r[0], 11) + ' ' + r[1] + '</span></label>';
  }).join('');
  // add explicit "any" option at start
  var anyLbl = document.createElement('label');
  anyLbl.className = 'checkbox';
  anyLbl.innerHTML = '<input type="radio" name="frate" value="0" checked><span class="checkmark">' + FR_ICON('check', 11) + '</span>Any rating';
  var ratingHost = qs('[data-filter-rating]');
  ratingHost.insertBefore(anyLbl, ratingHost.firstChild);

  qs('[data-filter-stock]').innerHTML =
    '<label class="switch"><input type="checkbox" id="stockSwitch"><span class="track"></span></label> <span style="font-size:.9rem">In stock only</span>';

  qs('[data-filter-colors]').innerHTML = DATA.colors.slice(0, 8).map(function (c) {
    return '<button class="swatch" style="background:' + c.hex + '" data-color="' + c.name + '" data-tip="' + c.name + '" aria-label="' + c.name + '" aria-pressed="false"></button>';
  }).join('');

  qs('[data-filter-connect]').innerHTML = DATA.connect.map(function (ck) {
    return '<label class="checkbox"><input type="checkbox" value="' + ck + '" data-fconn><span class="checkmark">' + FR_ICON('check', 11) + '</span>' + ck + '</label>';
  }).join('');

  var AGE_BUCKETS = [['1-2', 'Ages 1–2', 1, 2], ['3-4', 'Ages 3–4', 3, 4], ['5-7', 'Ages 5–7', 5, 7], ['8-10', 'Ages 8–10', 8, 10]];
  qs('[data-filter-age]').innerHTML = '<label class="checkbox"><input type="radio" name="fage" value="" checked><span class="checkmark">' + FR_ICON('check', 11) + '</span>Any age</label>' +
    AGE_BUCKETS.map(function (b) {
      return '<label class="checkbox"><input type="radio" name="fage" value="' + b[0] + '"><span class="checkmark">' + FR_ICON('check', 11) + '</span>' + b[1] + '</label>';
    }).join('');

  qs('[data-sub-list]').innerHTML = F.cat ? (DATA.cats.filter(function (c) { return c.slug === F.cat; })[0] || { subs: [] }).subs.map(function (s) {
    return '<button class="chip' + (decodeURIComponent(F.sub) === s ? ' active' : '') + '" data-chip-sub="' + s + '">' + s + '</button>';
  }).join('') : '';

  function paintRange(input, boundsObj) {
    input.style.setProperty('--fill', ((input.value - boundsObj.min) / (boundsObj.max - boundsObj.min) * 100) + '%');
    var lab = qs('[data-plabel-' + (input.dataset.priceRole) + ']');
    if (lab) lab.textContent = DATA.money(+input.value);
  }

  /* ---------- filter pipeline ---------- */
  function basePool() {
    var pool = DATA.products;
    if (F.q) {
      var words = F.q.toLowerCase().split(/\s+/);
      pool = pool.filter(function (p) {
        var hay = (p.name + ' ' + p.brand + ' ' + p.category + ' ' + p.subcategory).toLowerCase();
        return words.every(function (w) { return hay.indexOf(w) !== -1; });
      });
    }
    if (F.sale) pool = pool.filter(function (p) { return !!p.oldPrice; });
    return pool;
  }
  function applyFilters() {
    var out = basePool();
    if (F.cat) out = out.filter(function (p) { return p.category === F.cat; });
    if (F.sub) out = out.filter(function (p) { return p.subcategory === decodeURIComponent(F.sub); });
    if (F.brands.length) out = out.filter(function (p) { return F.brands.indexOf(p.brand) !== -1; });
    if (F.minPrice != null) out = out.filter(function (p) { return p.price >= F.minPrice; });
    if (F.maxPrice != null) out = out.filter(function (p) { return p.price <= F.maxPrice; });
    if (F.rating > 0) out = out.filter(function (p) { return p.rating >= F.rating - .001; });
    if (F.inStockOnly) out = out.filter(function (p) { return p.stock !== 'out'; });
    if (F.colors.length) out = out.filter(function (p) { return p.colors.some(function (c) { return F.colors.indexOf(c.name) !== -1; }); });
    if (F.connect.length) out = out.filter(function (p) { return F.connect.some(function (cc) { return p.connectivity.indexOf(cc) !== -1; }); });
    if (F.age) {
      var bucket = null;
      AGE_BUCKETS.forEach(function (b) { if (b[0] === F.age) bucket = b; });
      if (bucket) out = out.filter(function (p) { return p.ageMax >= bucket[2] && p.ageMin <= bucket[3]; });
    }

    switch (F.sort) {
      case 'price-asc': out.sort(function (a, b) { return a.price - b.price; }); break;
      case 'price-desc': out.sort(function (a, b) { return b.price - a.price; }); break;
      case 'newest': out.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }); break;
      case 'rating': out.sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; }); break;
      case 'sale': out.sort(function (a, b) { return (b.discount || 0) - (a.discount || 0); }); break;
      default: out.sort(function (a, b) { return b.popularity - a.popularity; });
    }
    return out;
  }

  /* ---------- render ---------- */
  function render(appendMode) {
    var list = applyFilters();
    var sliceEnd = F.page * F.perPage;
    var shown = list.slice(0, appendMode ? sliceEnd : Math.min(sliceEnd, list.length));
    resultsRoot.className = F.view === 'list' ? 'products-grid products-list' : 'products-grid';
    resultsRoot.innerHTML = shown.map(function (p, i) {
      return UI.productCard(p, { variant: i % 4, showDesc: F.view === 'list', listClass: '' });
    }).join('') ||
      '<div class="empty-state" style="grid-column:1/-1"><div class="art">' + FR_ICON('search', 42) + '</div>' +
      '<h3>No products match your filters</h3><p class="text-dim small">Try removing a filter or two — there are 224 gadgets waiting.</p>' +
      '<button class="btn btn-primary" data-reset-all>Clear all filters</button></div>';

    counterEl.innerHTML = 'Showing <b>' + shown.length + '</b> of <b>' + list.length + '</b> product' + (list.length === 1 ? '' : 's') +
      (F.q ? ' for “<b>' + esc(F.q) + '</b>”' : '');

    var moreBtn = qs('[data-load-more]');
    moreBtn.style.display = shown.length < list.length && F.view === 'grid' ? '' : 'none';
    renderChips(list.length);
    UI.observeNew(resultsRoot);
    document.title = 'Shop' + (F.cat ? ' — ' + catName() : '') + (F.sale ? ' — Deals' : '') + ' | FRONTIER';
  }

  function esc(s) { return s.replace(/</g, '&lt;'); }
  function catName() {
    var c = DATA.cats.filter(function (x) { return x.slug === F.cat; })[0];
    return c ? c.name : '';
  }

  function bounds() {
    var pool = basePool();
    var min = Infinity, max = 0;
    pool.forEach(function (p) { if (p.price < min) min = p.price; if (p.price > max) max = p.price; });
    if (!isFinite(min)) { min = 0; max = 3000; }
    return { min: Math.floor(min), max: Math.ceil(max) };
  }

  /* ---------- active chips ---------- */
  function renderChips(totalCount) {
    var host = qs('[data-active-chips]');
    var chips = [];
    var add = function (label, killFn) { chips.push({ label: label, kill: killFn }); };
    if (F.q) add('Search: ' + F.q, function () { location.href = 'shop.html'; });
    if (F.cat) add(catName(), function () { location.href = 'shop.html'; });
    if (F.sub) add(F.sub, function () { F.sub = ''; syncUrl(); rerender(); });
    if (F.sale) add('On sale', function () { location.href = 'shop.html'; });
    F.brands.forEach(function (b) { add(b, function () { F.brands = F.brands.filter(function (x) { return x !== b; }); syncBrandBoxes(); rerender(); }); });
    if (F.rating > 0) add(F.rating + '★ & up', function () { F.rating = 0; qsa('input[name=frate]')[0].checked = true; rerender(); });
    if (F.inStockOnly) add('In stock', function () { F.inStockOnly = false; qs('#stockSwitch').checked = false; rerender(); });
    F.colors.forEach(function (c) { add(c, function () { F.colors = F.colors.filter(function (x) { return x !== c; }); syncSwatches(); rerender(); }); });
    F.connect.forEach(function (c) { add(c, function () { F.connect = F.connect.filter(function (x) { return x !== c; }); rerender(); }); });
    if (F.age) add(F.age.replace('-', '–') + ' yrs', function () { F.age = ''; qsa('input[name=fage]')[0].checked = true; rerender(); });

    host.innerHTML = chips.length
      ? chips.map(function (c, i) { return '<button class="chip removable" data-kill="' + i + '">' + c.label + '<span class="x">' + FR_ICON('x', 10) + '</span></button>'; }).join('')
        + '<span class="chip btn-link-like" style="border-style:dashed;color:var(--dim)" role="button" tabindex="0" data-reset-all2>Clear all ✕</span>'
      : totalCount != null && totalCount > 0 ? '<span class="small text-dim">Tip: use filters on the left to narrow down 200+ gadgets.</span>' : '';
    qsa('[data-kill]', host).forEach(function (btn) {
      btn.addEventListener('click', function () { chips[+btn.dataset.kill].kill(); });
    });
    var clr = qs('[data-reset-all2]', host);
    if (clr) clr.onclick = resetAll;
  }
  function syncBrandBoxes() { qsa('[data-fbrand]').forEach(function (b) { b.checked = F.brands.indexOf(b.value) !== -1; }); }
  function syncSwatches() { qsa('[data-color]').forEach(function (sw) { sw.classList.toggle('active', F.colors.indexOf(sw.dataset.color) !== -1); }); }

  /* ---------- events ---------- */
  catListEl.addEventListener('change', function (e) { if (e.target.name === 'fcat') { F.cat = e.target.value; F.sub = ''; syncUrl(); rebuildSubs(); qs('[data-price-min]').dispatchEvent(new Event('input')); rerenderAll(true); } });
  qs('[data-filter-brands]').addEventListener('change', function (e) {
    var v = e.target.value;
    if (e.target.checked && F.brands.indexOf(v) === -1) F.brands.push(v);
    if (!e.target.checked) F.brands = F.brands.filter(function (x) { return x !== v; });
    rerender();
  });
  qsa('.range').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var bd = bounds();
      if (inp.dataset.priceRole === 'min') F.minPrice = +inp.value; else F.maxPrice = +inp.value;
      paintRange(inp, bd);
      rerenderDebounced();
    });
  });
  var rerenderDebounced = UI.debounce(function () { F.page = 1; render(false); }, 220);
  qs('[data-filter-rating]').addEventListener('change', function (e) { if (e.target.name === 'frate') { F.rating = +e.target.value; rerender(); } });
  qs('#stockSwitch').addEventListener('change', function (e) { F.inStockOnly = e.target.checked; rerender(); });
  qs('[data-filter-colors]').addEventListener('click', function (e) {
    var sw = e.target.closest('[data-color]'); if (!sw) return;
    var cname = sw.dataset.color;
    sw.classList.toggle('active');
    if (sw.classList.contains('active')) F.colors.push(cname);
    else F.colors = F.colors.filter(function (x) { return x !== cname; });
    rerender();
  });
  qs('[data-filter-connect]').addEventListener('change', function (e) {
    var v = e.target.value;
    if (e.target.checked && F.connect.indexOf(v) === -1) F.connect.push(v);
    if (!e.target.checked) F.connect = F.connect.filter(function (x) { return x !== v; });
    rerender();
  });
  qs('[data-filter-age]').addEventListener('change', function (e) { if (e.target.name === 'fage') { F.age = e.target.value; rerender(); } });

  qs('[data-sort]').addEventListener('change', function (e) { F.sort = e.target.value; rerender(); });
  qsa('.view-toggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      F.view = b.dataset.view;
      qsa('.view-toggle button').forEach(function (x) { x.classList.toggle('active', x === b); });
      render(false);
    });
  });
  qs('[data-load-more]').addEventListener('click', function (e) {
    var btn = e.currentTarget;
    btn.innerHTML = '<span class="spinner"></span> Loading…';
    setTimeout(function () {
      F.page++;
      render(true);
      btn.innerHTML = 'Load more products';
    }, 450);
  });

  function resetAll() {
    location.href = 'shop.html';
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-reset-all], #data-reset-all2')) resetAll();
    var r = e.target.closest('[data-reset-all2]');
    if (r) resetAll();
  });

  function rerender() { F.page = 1; render(false); }
  function rerenderAll(resetPrice) {
    rerender();
    if (resetPrice) {
      var bd = bounds();
      var mn = qs('[data-price-min]'), mx = qs('[data-price-max]');
      mn.value = F.minPrice == null ? bd.min : Math.max(bd.min, F.minPrice);
      mx.value = F.maxPrice == null ? bd.max : Math.min(bd.max, F.maxPrice);
      paintRange(mn, bd); paintRange(mx, bd);
    }
  }
  function rebuildSubs() { location.reload(); }
  function syncUrl() {
    var usp = new URLSearchParams();
    if (F.cat) usp.set('cat', F.cat);
    if (F.sub) usp.set('sub', encodeURIComponent(F.sub));
    history.replaceState(null, '', location.pathname + (usp.toString() ? '?' + usp.toString() : ''));
  }

  /* breadcrumb */
  var bc = qs('[data-breadcrumb]');
  bc.innerHTML = '<a href="index.html">Home</a><span class="sep">/</span><a href="shop.html">Shop</a>' +
    (F.cat ? '<span class="sep">/</span><a href="shop.html?cat=' + F.cat + '">' + catName() + '</a>' : '') +
    (F.sub ? '<span class="sep">/</span><span class="current">' + F.sub + '</span>' :
      '<span class="sep">/</span><span class="current">' + (F.sale ? 'On sale' : F.q ? 'Search' : 'All products') + '</span>');

  /* mobile drawer */
  var sidebar = qs('.filter-sidebar');
  qs('[data-open-filters]').addEventListener('click', function () {
    document.body.appendChild(Object.assign(document.createElement('div'), { className: 'filter-drawer-backdrop open' }));
    sidebar.classList.add('open');
    var bd = qs('.filter-drawer-backdrop');
    bd.addEventListener('click', closeDrawer);
    function closeDrawer() { sidebar.classList.remove('open'); var b2 = qs('.filter-drawer-backdrop'); if (b2) b2.remove(); }
  });

  rerender();
};
