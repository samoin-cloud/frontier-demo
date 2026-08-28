/* FRONTIER — contact · support · faq · gift cards */
UI.FPages.contact = function () {
  var form = qs('[data-contact-form]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Sending…';
    setTimeout(function () {
      btn.disabled = false;
      btn.innerHTML = FR_ICON('send', 16) + ' Send message';
      form.reset();
      UI.toast('success', 'Message sent!', 'Our team replies within one business day — usually much faster.');
    }, 1200);
  });

  UI.buildAccordion('[data-contact-faq]', DATA.faqGroups[1].items.slice(0, 4).map(function (f) { return [f[0], f[1]]; }), { openFirst: true });
};

/* ---------------- support / help center ---------------- */
UI.FPages.support = function () {
  var QUICK = [
    ['package', 'Track an order', 'order-tracking.html', 'Live status & ETA'],
    ['refresh', 'Returns & refunds', 'shipping-returns.html', '30-day window'],
    ['truck', 'Shipping info', 'shipping-returns.html', 'Speeds & coverage'],
    ['shield', 'Warranty claims', 'warranty.html', '2-year coverage'],
    ['user', 'Account help', 'account.html', 'Login, settings, 2FA'],
    ['chat', 'Contact us', 'contact.html', 'We reply fast']
  ];
  qs('[data-support-links]').innerHTML = QUICK.map(function (q, i) {
    return '<a class="stat-card reveal" data-delay="' + i % 6 + '" href="' + q[2] + '">' +
      '<div class="ico">' + FR_ICON(q[0], 24) + '</div><b class="small" style="font-family:var(--font-display);font-size:.95rem">' + q[1] + '</b>' +
      '<span class="tiny text-dim">' + q[3] + '</span></a>';
  }).join('');

  qs('[data-popular-help]').innerHTML = [
    ['How long does a refund take?', 'faq.html'],
    ['Do phones ship unlocked?', 'faq.html'],
    ['What does the 2-year warranty cover?', 'faq.html'],
    ['Is free shipping available internationally?', 'faq.html'],
    ['Can I combine promo codes with sales?', 'faq.html']
  ].map(function (a) {
    return '<li style="border-bottom:1px dashed var(--border-soft)"><a class="flex center between" style="padding:11px 4px;gap:12px;font-size:.9rem" href="' + a[1] + '">' +
      '<span>' + a[0] + '</span><span style="color:var(--dim)">' + FR_ICON('chevRight', 14) + '</span></a></li>';
  }).join('');

  /* ticket form */
  qs('#ticketForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!this.reportValidity()) return;
    var btn = this.querySelector('[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating ticket…';
    setTimeout(function () {
      btn.disabled = false;
      btn.innerHTML = FR_ICON('clipboard', 15) + ' Create ticket';
      e.target.reset();
      UI.toast('success', 'Ticket #TCK-' + Math.floor(1000 + Math.random() * 9000) + ' created', 'A specialist will respond within 2 hours.');
    }, 1100);
  });

  /* business hours clock (local vs HQ) */
  qs('[data-hours-note]').textContent =
    'Support hours: Mon–Sat 9:00–21:00 local warehouse time. Live chat waits currently average under two minutes.';

  UI.observeNew();
};

/* ---------------- FAQ page ---------------- */
UI.FPages.faq = function () {
  document.title = 'FAQ | FRONTIER Help Center';
  var all = [];
  DATA.faqGroups.forEach(function (g) {
    g.items.forEach(function (item) { all.push({ group: g.name, q: item[0], a: item[1] }); });
  });
  var state = { q: '', cat: '' };
  var counts = DATA.faqGroups.map(function (g) { return g.name + '(' + g.items.length + ')'; }).join(', ');
  console.info('FAQ knowledge base:', all.length, 'entries:', counts);

  var chipsHost = qs('[data-faq-cats]');
  chipsHost.innerHTML = ['', 'orders', 'shipping', 'returns', 'payments', 'products', 'account'].map(function (slug, i) {
    var label = i === 0 ? 'All questions' : DATA.faqGroups.filter(function (g) { return g.slug === slug; })[0].name;
    return '<button class="chip' + (i === 0 ? ' active' : '') + '" data-faqcat="' + slug + '">' + label + '</button>';
  }).join('');

  chipsHost.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-faqcat]'); if (!chip) return;
    state.cat = chip.dataset.faqcat; state.page = 1;
    qsa('.chip', chipsHost).forEach(function (c) { c.classList.toggle('active', c === chip); });
    render();
  });

  qs('[data-faq-search]').addEventListener('input', UI.debounce(function (e) { state.q = e.target.value.toLowerCase(); render(); }, 150));

  function render() {
    var groups = DATA.faqGroups.filter(function (g) { return !state.cat || g.slug === state.cat; })
      .map(function (g) {
        var items = g.items.filter(function (it) { return !state.q || (it[0] + ' ' + it[1]).toLowerCase().indexOf(state.q) !== -1; });
        if (!items.length) return null;
        return '<section class="section" style="padding-block:26px"><h3 class="flex center" style="gap:10px;margin-bottom:16px"><span class="badge soft">' + items.length + '</span>' + g.name + '</h3>' +
          '<div data-acc-group></div></section>';
      }).filter(Boolean);
    qs('[data-faq-list]').innerHTML =
      groups.length ? groups.join('') : '<div class="empty-state"><div class="art">' + FR_ICON('search', 36) + '</div><h3>No answers match “' + escHtml(state.q) + '”</h3><p class="text-dim small">Try broader wording or ask us directly — humans answer in minutes.</p><a class="btn btn-primary" href="contact.html">Ask support</a></div>';

    // build accordions per group
    qsa('#faqPage section').forEach(function (sec, gi) {
      var gName = sec.querySelector('h3 span.badge');
      var group = DATA.faqGroups.filter(function (g) {
        return (!state.cat || g.slug === state.cat);
      })[gi];
      if (!group) return;
      var items = group.items.filter(function (it) { return !state.q || (it[0] + ' ' + it[1]).toLowerCase().indexOf(state.q) !== -1; });
      var wrapEl = sec.querySelector('[data-acc-group]');
      wrapEl.innerHTML = items.map(function (it, i) {
        return '<div class="accordion-item"><button class="acc-head" aria-expanded="false"><span>' + it[0] + '</span><span class="chev">' + FR_ICON('chevDown', 17) + '</span></button>' +
          '<div class="acc-body"><div class="acc-inner">' + it[1] +
          '<div class="flex center" style="gap:12px;margin-top:14px;padding-top:12px;border-top:1px dashed var(--border-soft)"><span class="tiny text-dim">Was this helpful?</span>' +
          '<button class="icon-btn tooltip-host" data-vote-up style="width:32px;height:32px;color:#22c55e">' + FR_ICON('thumbUp', 14) + '<span class="tip">Yes!</span></button>' +
          '<button class="icon-btn tooltip-host" data-vote-down style="width:32px;height:32px;color:var(--accent)">' + FR_ICON('thumbDown', 14) + '<span class="tip">Not really</span></button></div>' +
          '</div></div></div>';
      }).join('');
      UI.bindAccordion(wrapEl);
      qsa('[data-vote-up]', sec).forEach(function (b) { b.addEventListener('click', function () { UI.toast('success', 'Thanks for the feedback! 💚'); b.disabled = true; }); });
      qsa('[data-vote-down]', sec).forEach(function (b) { b.addEventListener('click', function () { UI.toast('info', 'Noted — we will improve this answer.'); b.disabled = true; }); });
    });
  }
  function escHtml(s) { return String(s == null ? '' : s).replace(/</g, '&lt;'); }
  render();
};

/* ---------------- gift cards ---------------- */
UI.FPages['gift-cards'] = function () {
  var designs = [
    { name: 'Nebula', css: 'linear-gradient(135deg,#6C5CE7,#00D2FF)' },
    { name: 'Sunset', css: 'linear-gradient(135deg,#FF6B6B,#FFD166)' },
    { name: 'Forest', css: 'linear-gradient(135deg,#2f7d5c,#8ee27a)' },
    { name: 'Midnight', css: 'linear-gradient(135deg,#17171f,#3a3a55)' },
    { name: 'Aurora', css: 'linear-gradient(135deg,#7F53AC,#64B5F6 60%,#66ffc2)' }
  ];
  var sel = { amount: 50, design: 0 };

  qs('[data-gift-designs]').innerHTML = designs.map(function (d, i) {
    return '<button class="gift-design' + (i === 0 ? ' selected' : '') + '" style="background:' + d.css + '" data-design="' + i + '" aria-label="' + d.name + ' design">' + d.name + '</button>';
  }).join('');

  var amounts = [25, 50, 100, 250, 500];
  qs('[data-gift-amounts]').innerHTML = amounts.map(function (a, i) {
    return '<button class="chip' + (a === 50 ? ' active' : '') + '" data-amt="' + a + '">$' + a + '</button>';
  }).join('') + '<label class="chip" style="cursor:pointer">Custom <input id="amtCustom" type="number" min="10" max="2000" placeholder="$?" style="width:70px;background:none;border:none;outline:none;margin-left:6px;font-family:var(--font-mono)"></label>';

  var previewAmt = qs('[data-preview-amt]'), previewName = qs('[data-preview-name]');
  function updatePreview() {
    previewAmt.textContent = '$' + (sel.amountCustom || sel.amount);
    previewName.textContent = designs[sel.design].name + ' design';
    qs('.gift-preview').style.background = designs[sel.design].css;
  }

  qs('[data-gift-amounts]').addEventListener('click', function (e) {
    var c = e.target.closest('[data-amt]'); if (!c) return;
    sel.amount = +c.dataset.amt; delete sel.amountCustom;
    qsa('[data-amt]', this).forEach(function (x) { x.classList.toggle('active', x === c); });
    qs('#amtCustom').closest('.chip').classList.remove('active');
    updatePreview();
  });
  qs('#amtCustom').addEventListener('input', UI.debounce(function () {
    var v = Math.max(10, Math.min(2000, +this.value || 0));
    sel.amountCustom = v || undefined;
    qsa('[data-amt]').forEach(function (x) { x.classList.remove('active'); });
    this.closest('.chip').classList.add('active');
    updatePreview();
  }, 220));

  qs('[data-gift-designs]').addEventListener('click', function (e) {
    var d = e.target.closest('[data-design]'); if (!d) return;
    sel.design = +d.dataset.design;
    qsa('.gift-design').forEach(function (x) { x.classList.toggle('selected', x === d); });
    updatePreview();
  });

  /* add to cart as pseudo product via direct cart push */
  var formEl = qs('[data-gift-form]');
  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!formEl.reportValidity()) return;
    STORE.addToCart(giftProductId(), { qty: 1 }, qs('[data-gift-add]'));
  });

  /* register a per-amount SKU so cart/checkout pages can resolve it too */
  function giftProductId() {
    var amt = Math.round(+(sel.amountCustom || sel.amount));
    var p = DATA.ensurePseudo({
      id: 900000 + amt, slug: 'frontier-gift-card-' + amt, name: 'FRONTIER Gift Card — $' + amt,
      brand: 'FRONTIER', category: 'accessories', subcategory: 'Gift Cards',
      price: amt, oldPrice: null, discount: 0, rating: 5, reviews: 12480,
      badges: ['hot'], stock: 'in', lowCount: 99,
      colors: [{ name: designs[sel.design].name, hex: '#7b6cf0' }],
      connectivity: ['Email delivery'], battery: 0, weight: 0,
      releasedDaysAgo: 999, createdAt: '', views: 0, popularity: 1e9, featured: true,
      descUseCase: 'The perfect present for people hard to shop for.',
      specs: [['Delivery', 'Email within minutes'], ['Balance never expires']]
    });
    p.colors[0] = { name: designs[sel.design].name, hex: '#7b6cf0' };
    return p.id;
  }

  /* balance checker */
  qs('#balanceForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var code = qs('#balanceInput').value.trim();
    var out = qs('#balanceOut');
    var bal = STORE.giftBalance(code);
    if (bal !== null) {
      out.style.display = '';
      out.innerHTML = '<div class="co-panel" style="border-color:rgba(34,197,94,.45);display:flex;align-items:center;gap:14px;background:rgba(34,197,94,.07)">' +
        FR_ICON('checkCircle', 26) + '<div><b>Valid card</b><br><span class="small text-dim">Code <b class="mono">' + code.toUpperCase() + '</b> holds a balance of</span> <b class="price mono" style="font-size:1.2rem">$' + bal.toFixed(2) + '</b></div></div>';
    } else {
      out.style.display = '';
      out.innerHTML = '<div class="co-panel" style="border-color:rgba(255,107,107,.45);background:rgba(255,107,107,.06)"><b>' + FR_ICON('xCircle', 18) + ' Code not found</b><p class="small text-dim" style="margin-top:6px">Double-check for typos — codes are 8–12 characters. Demo codes you can try: <b class="mono">GIFT-FR2K9X</b>, <b class="mono">GIFT-HOLIDAY</b>.</p></div>';
    }
  });

  /* deliver method toggle visual only */
  qsa('input[name=giftDelivery]').forEach(function (r) {
    r.addEventListener('change', function () {
      qs('#physicalNotice').style.display = r.value === 'physical' && r.checked ? '' : 'none';
    });
  });

  updatePreview();
};
