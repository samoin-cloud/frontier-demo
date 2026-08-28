/* FRONTIER — 404 · newsletter · legal/TOC helper · warranty tools · sitemap filter */
UI.FPages['404'] = function () {
  document.title = '404 — Lost in space | FRONTIER';
  var secs = 20;
  var el = qs('[data-redirect-count]');
  qs('#cancelRedirect').addEventListener('click', function () {
    clearInterval(iv);
    qs('[data-redirect-row]').innerHTML = '<span class="tiny text-dim">Auto-redirect cancelled. Take your time exploring.</span>';
  });
  var iv = setInterval(function () {
    secs--;
    if (el) el.textContent = secs;
    if (secs <= 0) { clearInterval(iv); location.href = 'index.html'; }
  }, 1000);

  /* popular products rescue */
  qs('[data-nf-products]').innerHTML = DATA.bestSellers.slice(0, 4).map(function (p, i) { return UI.productCard(p, { variant: i }); }).join('');
  UI.observeNew();

  var nfSearch = qs('[data-nf-search]');
  nfSearch.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') location.href = 'search.html?q=' + encodeURIComponent(nfSearch.value);
  });
};

UI.FPages.newsletter = function () {
  var perks = ['Early access to flash sales', 'Exclusive subscriber-only bundles', 'Deep-dive guides before anyone else', '$10 welcome coupon after confirm', 'Zero spam — one email, max weekly'];
  qs('[data-perk-list]').innerHTML = perks.map(function (p) {
    return '<li style="display:flex;gap:12px;align-items:center;padding:9px 0"><span style="width:26px;height:26px;border-radius:50%;background:var(--grad-brand);display:grid;place-items:center;color:#fff;flex-shrink:0">' + FR_ICON('check', 13) + '</span>' + p + '</li>';
  }).join('');
  var form = qs('#newsletterMain');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Subscribing…';
    setTimeout(function () {
      btn.disabled = false;
      btn.innerHTML = 'Subscribe ' + FR_ICON('arrowRight', 15);
      form.reset();
      UI.toast('success', 'Almost there!', 'Check your inbox to confirm — coupon lands right after.');
    }, 900);
  });
};

/* generic TOC + scroll-spy for legal-style docs */
window.FR_LEGAL_DOC = function (sel) {
  var doc = qs(sel);
  if (!doc) return;
  var headings = qsa('h2[id]', doc);
  var tocHost = qs('[data-doc-toc]');
  if (!tocHost || !headings.length) return;
  tocHost.innerHTML = headings.map(function (h) {
    return '<a href="#' + h.id + '" data-toc="' + h.id + '">' + h.textContent + '</a>';
  }).join('');
  var links = qsa('[data-toc]', tocHost);
  var spy = function () {
    var cur = '';
    headings.forEach(function (h) { if (h.getBoundingClientRect().top < 140) cur = h.id; });
    links.forEach(function (l) { l.classList.toggle('current', l.dataset.toc === cur); });
  };
  window.addEventListener('scroll', UI.debounce(spy, 60));
  spy();
};

/* privacy extras */
UI.FPages.privacy = function () {
  document.title = 'Privacy Policy | FRONTIER';
  window.FR_LEGAL_DOC('#privacyDoc');
  qs('[data-doc-print]').addEventListener('click', function () { window.print(); });
};

UI.FPages.terms = function () {
  document.title = 'Terms & Conditions | FRONTIER';
  window.FR_LEGAL_DOC('#termsDoc');
  qs('[data-doc-print]').addEventListener('click', function () { window.print(); });
  var acceptBtn = qs('#acceptTerms');
  if (acceptBtn) acceptBtn.addEventListener('click', function () {
    try { localStorage.setItem('frontier-terms-ok', new Date().toISOString()); } catch (e) {}
    UI.toast('success', 'Thanks!', 'Your acceptance has been recorded.');
  });
};

UI.FPages['shipping-returns'] = function () {
  document.title = 'Shipping & Returns | FRONTIER';
  window.FR_LEGAL_DOC('#shipDoc');
  qs('[data-doc-print]').addEventListener('click', function () { window.print(); });
  /* shipping progress demo */
  var cartVal = STORE.totals().sub;
  qs('[data-ship-progress]').innerHTML =
    '<div class="progress" style="max-width:420px;margin-top:14px"><i style="width:' + Math.min(100, cartVal / 99 * 100) + '%"></i></div>' +
    '<p class="small text-dim" style="margin-top:8px">' + (cartVal >= 99 ? 'Current cart ships free! 🎉' : 'Add ' + DATA.money(Math.max(0, 99 - cartVal)) + ' more to your cart and standard shipping is on us.') + '</p>';
};

UI.FPages.warranty = function () {
  document.title = 'Warranty | FRONTIER';
  window.FR_LEGAL_DOC && null;
  var SERIAL_OK = /^FR-\d{4}-[A-Z0-9]{4}$/;

  qs('#serialForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = qs('#serialInput').value.trim().toUpperCase();
    var out = qs('#serialOut');
    out.style.display = '';
    if (!SERIAL_OK.test(v)) {
      out.innerHTML = '<b style="color:var(--accent)">' + FR_ICON('alert', 16) + ' Format not recognised</b><p class="small text-dim" style="margin-top:6px">Serials look like <b class="mono">FR-2024-K9XQ</b> — printed on the box label or under Settings → About on your device.</p>';
      return;
    }
    var year = parseInt(v.slice(3, 7), 10);
    var monthsIn = (new Date().getFullYear() - year) * 12 + new Date().getMonth();
    var left = Math.max(0, 24 - monthsIn);
    out.innerHTML = left > 0
      ? '<div class="co-panel" style="border-color:rgba(34,197,94,.45);background:rgba(34,197,94,.06)"><b style="color:#22c55e">' + FR_ICON('shield', 18) + ' Active warranty</b><p class="small text-dim" style="margin-top:6px">' + left + ' months of FRONTIER Care remain on ' + v + '. File a claim any time from your account.</p></div>'
      : '<div class="co-panel" style="border-color:var(--border)"><b>' + FR_ICON('clock', 18) + ' Standard coverage ended</b><p class="small text-dim" style="margin-top:6px">Extend protection with FRONTIER Care+ below — accidental damage plans accept devices up to 90 days past expiry.</p><button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="location.href=\'#carePlus\'">Explore Care+</button></div>';
  });

  qs('#registerForm2').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!this.reportValidity()) return;
    this.reset();
    UI.toast('success', 'Product registered 🎉', 'Warranty now runs from delivery date even as a gift.');
  });

  qsa('[data-care-buy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      STORE.addToCart(900002, { unitPrice: 49.99 }, btn);
    });
  });
  (function registerCarePseudo() {
    DATA.ensurePseudo({ id: 900002, slug: 'frontier-care-plus', name: 'FRONTIER Care+ Plan', brand: 'FRONTIER', category: 'accessories', subcategory: 'Warranty Plans', price: 49.99, oldPrice: null, discount: 0, rating: 4.8, reviews: 2103, badges: [], stock: 'in', lowCount: 0, colors: [{ name: 'Digital', hex: '#6C5CE7' }], connectivity: [], battery: 0, weight: 0, releasedDaysAgo: 999, createdAt: '', views: 0, popularity: 5e5, featured: false, descUseCase: 'Accidental damage & battery service, up to 3 extra years.', specs: [['Term options', '12 · 24 · 36 months'], ['Claims', 'Unlimited within term']] });
  })();
};

UI.FPages.sitemap = function () {
  document.title = 'Sitemap | FRONTIER';
  var PAGES = [
    ['Home', 'index.html'], ['Shop all products', 'shop.html'], ['Categories overview', 'categories.html'],
    ['Deals & offers', 'shop.html?sale=1'], ['Compare products', 'compare.html'], ['Search', 'search.html?q=smartwatch'],
    ['Shopping cart', 'cart.html'], ['Checkout', 'checkout.html'], ['Order confirmation sample', 'order-tracking.html'],
    ['Wishlist', 'wishlist.html'], ['Login / Register', 'login.html'], ['Account dashboard', 'account.html'],
    ['Order tracking', 'order-tracking.html'], ['Gift cards', 'gift-cards.html'], ['Blog journal', 'blog.html'],
    ['About us', 'about.html'], ['Contact', 'contact.html'], ['Support center', 'support.html'], ['FAQ', 'faq.html'],
    ['Newsletter', 'newsletter.html'], ['Privacy policy', 'privacy.html'], ['Terms & conditions', 'terms.html'],
    ['Shipping & returns', 'shipping-returns.html'], ['Warranty', 'warranty.html'], ['Accessibility statement', 'accessibility.html'],
    ['404 error page', '404-page-demo']
  ];
  var listEl = qs('[data-sitemap-pages]');
  function render(filterText) {
    listEl.innerHTML = PAGES.filter(function (p) { return !filterText || p[0].toLowerCase().indexOf(filterText.toLowerCase()) !== -1; })
      .map(function (p) {
        if (p[1] === '404-page-demo') return '<li><a href="#" onclick="location.href=\'404.html\'">' + p[0] + ' ↗</a></li>';
        return '<li><a href="' + p[1] + '">' + p[0] + '</a></li>';
      }).join('');
  }
  render('');
  qs('[data-sitemap-filter]').addEventListener('input', UI.debounce(function (e) { render(e.target.value); }, 120));

  /* category deep links */
  qs('[data-sitemap-cats]').innerHTML = DATA.cats.map(function (c) {
    return '<li><details open style="padding:6px 0"><summary style="cursor:pointer;font-weight:600;font-size:.95rem">' + c.name + '</summary>' +
      '<ul style="margin-left:18px">' +
      c.subs.map(function (s) { return '<li><a href="shop.html?cat=' + c.slug + '&sub=' + encodeURIComponent(s) + '">' + s + '</a></li>'; }).join('') +
      '</ul></summary></details></li>';
  }).join('');
};

UI.FPages.accessibility = function () {
  document.title = 'Accessibility Statement | FRONTIER';
  /* live contrast checker demo */
  qs('#contrastDemo').addEventListener('input', function () {
    var fg = qs('#contrastFg').value, bgT = qs('#contrastBg').value;
    var ratio = contrastRatio(fg, bgT);
    qs('#contrastOut').textContent = ratio.toFixed(2) + ':1';
    var passAA = ratio >= 4.5, passAAA = ratio >= 7;
    qs('#contrastBadge').className = 'status-pill ' + (passAAA ? 'delivered' : passAA ? 'shipped' : '');
    qs('#contrastBadge').textContent = passAAA ? 'AAA ✓' : passAA ? 'AA ✓' : 'Fails AA ✕';
    function lum(hex) {
      var rgb = [1, 3, 5].map(function (i) {
        var v = parseInt(hex.slice(i, i + 2), 16) / 255;
        return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
      });
      return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    }
    function contrastRatio(a, b) {
      var l1 = lum(a), l2 = lum(b);
      var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
      return (hi + .05) / (lo + .05);
    }
  });
};
