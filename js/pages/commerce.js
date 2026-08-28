/* FRONTIER — cart · checkout · confirmation · tracking */
UI.FPages.cart = function () {
  var listEl = qs('[data-cart-list]');
  var sumEl = qs('[data-summary]');

  function render() {
    var lines = STORE.cartLines();
    if (!lines.length) {
      qs('[data-cart-page]').innerHTML =
        '<div class="empty-state"><div class="art" style="width:150px;height:150px">' + FR_ICON('cart', 56) + '</div>' +
        '<h2>Your cart is feeling light</h2><p class="text-dim">Free shipping unlocks at $99 — the good stuff is waiting.</p>' +
        '<a class="btn btn-primary btn-lg" href="shop.html">Continue shopping</a>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px">' + ['sale', 'audio', 'wearables'].map(function (f) {
          return f === 'sale' ? '<a class="chip" href="shop.html?sale=1">🔥 Today\'s deals</a>' : '<a class="chip" href="shop.html?cat=' + f + '">' + DATA.cats.filter(function (c) { return c.slug === f; })[0].name + '</a>';
        }).join('') + '</div></div>' + suggestedHtml();
      bindSuggested();
      return;
    }

    qs('[data-cart-page]').style.display = '';
    var t = STORE.totals();
    listEl.innerHTML = t.lines.map(function (l, idxRaw) {
      var i = STORE.get().cart.indexOf(STORE.get().cart.filter(function (x) { return x.id === l.product.id && x.color === l.color; })[0]);
      return '<article class="cart-item" data-ci="' + i + '">' +
        '<a href="product.html?id=' + l.product.id + '"><img src="' + (l.imgOverride || DATA.img(l.product)) + '" alt="' + l.product.name + '"></a>' +
        '<div style="flex:1;min-width:180px"><div class="flex between wrap" style="gap:6px">' +
        '<div><a class="ci-name" href="product.html?id=' + l.product.id + '">' + l.product.name + '</a>' +
        '<div class="ci-meta mono">' + l.product.brand + ' · Color: ' + l.color + '</div></div>' +
        '<b class="mono price ci-total">' + DATA.money(l.total) + '</b></div>' +
        '<div class="flex center between wrap" style="margin-top:12px;gap:10px">' +
        '<div class="qty-stepper" data-cq="' + i + '"><button data-step="-1" aria-label="Decrease quantity">' + FR_ICON('minus', 14) + '</button>' +
        '<span class="qty-val"><span>' + l.qty + '</span></span>' +
        '<button data-step="1" aria-label="Increase quantity">' + FR_ICON('plus', 14) + '</button></div>' +
        '<span class="small text-dim mono">' + DATA.money(l.unit) + ' each</span>' +
        '<button class="icon-btn" data-rm="' + i + '" aria-label="Remove from cart" style="color:var(--dim)">' + FR_ICON('trash', 16) + '</button>' +
        '</div></div></article>';
    }).join('');

    /* summary sidebar */
    sumEl.innerHTML =
      '<h3>Order summary</h3>' +
      (t.promoLabel ? '<div class="chip removable" style="margin-top:10px;background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.4);color:#22c55e" role="button" tabindex="0" id="killPromo">🎉 ' + STORE.get().promo + ' — ' + t.promoLabel + '<span class="x">' + FR_ICON('x', 10) + '</span></div>'
        : '<form class="promo-row" data-promo-form style="margin-top:10px"><input class="input" placeholder="Promo code (try FRONTIER10)" aria-label="Promo code" style="padding:9px 13px;font-size:.85rem;text-transform:uppercase"><button class="btn btn-secondary btn-sm" type="submit">Apply</button></form>') +
      '<div style="display:grid;gap:2px;margin-top:18px">' +
      kvRow('Subtotal', DATA.money(t.sub)) +
      (t.discount ? kvRow('Discount <span class="badge sale" style="font-size:.6rem">-' + Math.round(t.discount / t.sub * 100) + '%</span>', '-' + DATA.money(t.discount), true) : '') +
      kvRow('Shipping estimate', t.ship === 0 ? '<span style="color:#22c55e;font-weight:700">FREE</span>' : DATA.money(t.ship)) +
      kvRow('Estimated tax', DATA.money(t.tax)) +
      '<div class="kv-row" style="font-size:1.05rem;border-bottom:none;padding-top:14px"><b>Grand total</b><b class="price mono" style="font-size:1.25rem">' + DATA.money(t.total) + '</b></div></div>' +
      '<div class="progress" aria-hidden="true"><i style="width:' + Math.min(100, (t.sub - t.discount) / 99 * 100) + '%"></i></div>' +
      freeShipNote(t) +
      '<a class="btn btn-primary btn-lg btn-block" style="margin-top:18px" href="checkout.html">' + FR_ICON('lock', 16) + ' Proceed to checkout</a>' +
      '<div class="trust-ssl">' + FR_ICON('shield', 14) + ' SSL secured · Buyer protection included</div>';

    var kp = qs('#killPromo');
    if (kp) { kp.onclick = function () { STORE.clearPromo(); render(); UI.toast('info', 'Promo removed'); }; }
    var pf = qs('[data-promo-form]');
    if (pf) pf.addEventListener('submit', function (e) {
      e.preventDefault();
      var inputPf = pf.querySelector('input');
      var res = STORE.applyPromo(inputPf.value);
      if (res) UI.toast('success', 'Code applied!', res.label);
      else { UI.toast('error', 'Invalid code', 'Try FRONTIER10, WELCOME15 or FREESHIP.'); pf.classList.add('shake'); setTimeout(function () { pf.classList.remove('shake'); }, 420); }
      render();
    });

    qsa('.qty-stepper[data-cq]', listEl).forEach(function (st) {
      st.addEventListener('click', function (e) {
        var b = e.target.closest('[data-step]'); if (!b) return;
        var idx = +st.dataset.cq;
        var line = STORE.get().cart[idx];
        var newQ = line.qty + (+b.dataset.step);
        if (newQ <= 0) return;
        STORE.setQty(idx, newQ); // triggers re-render via subscribe
      });
    });
    qsa('[data-rm]', listEl).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.closest('.cart-item');
        row.classList.add('removing');
        var idx = +btn.dataset.rm;
        setTimeout(function () {
          var removed = STORE.removeAt(idx);
          if (removed) UI.toast('info', 'Removed from cart', DATA.productById(removed.id) && DATA.productById(removed.id).name, { UNDO: function () { STORE.addToCart(removed.id, { color: { name: removed.color }, qty: removed.qty }); } });
          render();
        }, 340);
      });
    });
  }

  function kvRow(k, v, dim) {
    return '<div class="kv-row' + (dim ? '' : '') + '"><span' + (dim ? '' : ' class="text-dim"') + '>' + k + '</span><b class="mono">' + v + '</b></div>';
  }
  function freeShipNote(t) {
    if (t.freeShipLeft > 0) return '<p class="free-ship-note">' + FR_ICON('truck', 15) + ' You are <b>' + DATA.money(t.freeShipLeft) + '</b> away from free shipping!</p>';
    return '<p class="free-ship-note" style="color:#22c55e">' + FR_ICON('checkCircle', 15) + ' This order ships <b>FREE</b> 🎉</p>';
  }
  function suggestedHtml() {
    var picks = DATA.bestSellers.slice(0, 8).map(function (p, i) { return UI.productCard(p, { variant: i % 3 }); }).join('');
    return '<section class="section" style="padding-top:24px;width:100%;text-align:left"><div class="section-head"><div><h2>Complete your setup</h2><p>Popular with shoppers like you.</p></div><a class="btn btn-link" href="shop.html">See all →</a></div>' +
      '<div class="products-grid">' + picks + '</div></section>';
  }
  function bindSuggested() { UI.bindRipples(); }

  STORE.subscribe(render);
  render();
};

/* ================= CHECKOUT ================= */
UI.FPages.checkout = function () {
  if (!STORE.cartCount()) { location.href = 'cart.html'; return; }
  var step = 1, TOTAL_STEPS = 4, shipMethod = 'standard';
  var barFill = qs('[data-steps-fill]');
  var stepsEl = qsa('.step');
  var panels = qsa('.co-step');

  function go(n) {
    step = n;
    stepsEl.forEach(function (s, i) {
      s.classList.toggle('active', i + 1 === n);
      s.classList.toggle('done', i + 1 < n || n === TOTAL_STEPS && i + 1 < TOTAL_STEPS);
    });
    panels.forEach(function (pn, i) { pn.classList.toggle('active', i + 1 === n); });
    barFill.style.width = ((n - 1) / (TOTAL_STEPS - 1) * 100) + '%';
    if (n === TOTAL_STEPS) {
      var rv = qs('[data-co-review-addr]');
      if (rv) rv.textContent = [qs('#co-name').value, qs('#co-line1').value, qs('#co-city').value, qs('#co-zip').value].filter(Boolean).join(', ');
    }
    var firstInput = qs('.co-step.active .input');
    if (firstInput) firstInput.focus({ preventScroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* prefill from store */
  var user = STORE.get().user;
  if (user) {
    qs('#co-name').value = user.name;
    qs('#co-email').value = user.email;
  }

  /* validation helpers */
  function validateStep(n) {
    var ok = true;
    var scope = qs('.co-step[data-step="' + n + '"]');
    if (!scope) return true;
    qsa('[required]', scope).forEach(function (inp) {
      var field = inp.closest('.field') || inp.parentElement;
      field.classList.remove('invalid');
      if (!inp.checkValidity()) {
        ok = false;
        field.classList.add('invalid');
        inp.focus();
      } else {
        field.classList.add('valid');
      }
    });
    if (n === 3 && !qs('input[name=payMethod]:checked')) {
      UI.toast('warning', 'Choose a payment method');
      ok = false;
    }
    return ok;
  }

  qsa('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (validateStep(step)) go(Math.min(TOTAL_STEPS, step + 1));
      else UI.toast('error', 'Hold on…', 'Please fix the highlighted fields.');
    });
  });
  qsa('[data-back]').forEach(function (b) { b.addEventListener('click', function () { go(Math.max(1, step - 1)); }); });

  /* shipping methods recalc totals */
  qsa('input[name=shipMethod]').forEach(function (r) {
    r.addEventListener('change', function () {
      shipMethod = r.value;
      renderSummary();
      qs('[data-ship-eta]').textContent = etaText(shipMethod);
    });
  });

  function etaText(m) {
    if (m === 'overnight') return 'Arrives tomorrow before 5pm — ' + new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (m === 'express') return 'Arrives in 1–2 business days';
    return 'Standard delivery in 3–5 business days';
  }

  /* payment options */
  var chosenPay = 'card';
  qsa('#payMethods .pay-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      qsa('#payMethods .pay-option').forEach(function (o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
      chosenPay = opt.dataset.pay;
      qs('#cardFields').style.display = chosenPay === 'card' ? '' : 'none';
      qs('[data-pay-note]').textContent = chosenPay === 'paypal' ? 'You will be redirected to PayPal to authorize payment.'
        : chosenPay === 'wallet' ? 'Confirm with Face ID / fingerprint on your device.'
          : chosenPay === 'crypto' ? 'Choose USDC, BTC or ETH at the next screen. Payments confirm in ~15s.'
            : '';
      renderSummary();
    });
  });

  /* card formatting */
  var cardNum = qs('#cardNum'), cardExp = qs('#cardExp'), cardCvc = qs('#cardCvc');
  cardNum.addEventListener('input', function () {
    cardNum.value = cardNum.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  });
  cardExp.addEventListener('input', function () {
    var v = cardExp.value.replace(/\D/g, '').slice(0, 4);
    cardExp.value = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
  });
  cardCvc.addEventListener('input', function () { cardCvc.value = cardCvc.value.replace(/\D/g, '').slice(0, 4); });

  /* guest/account toggle */
  qs('#asGuest').addEventListener('change', function () {
    qs('#acctFields').classList.toggle('open', !this.checked);
  });

  /* summary sidebar */
  function renderSummary() {
    var t = STORE.totals({ ship: shipMethod });
    qs('[data-co-items]').innerHTML = t.lines.map(function (l) {
      return '<div class="osl-item"><img src="' + (l.imgOverride || DATA.img(l.product)) + '" alt=""><div style="flex:1;min-width:0"><b class="tiny" style="display:block">' + l.product.name + '</b><span class="tiny text-dim">' + l.color + '</span></div><span class="ssl-count tiny">×' + l.qty + ' · ' + DATA.money(l.total) + '</span></div>';
    }).join('');
    qs('[data-co-totals]').innerHTML =
      '<div class="kv-row"><span class="text-dim">Subtotal</span><b class="mono">' + DATA.money(t.sub) + '</b></div>' +
      (t.discount ? '<div class="kv-row" style="color:#22c55e"><span>Discount (' + STORE.get().promo + ')</span><b class="mono">-' + DATA.money(t.discount) + '</b></div>' : '') +
      '<div class="kv-row"><span class="text-dim">Shipping (' + shipMethod + ')</span><b class="mono">' + (t.ship === 0 ? 'FREE' : DATA.money(t.ship)) + '</b></div>' +
      '<div class="kv-row"><span class="text-dim">Tax (est.)</span><b class="mono">' + DATA.money(t.tax) + '</b></div>' +
      '<div class="kv-row" style="font-size:1.05rem;border:none"><b>Total</b><b class="price mono" style="font-size:1.3rem">' + DATA.money(t.total) + '</b></div>';
    var stickyBtn = qs('[data-place-order]');
    if (stickyBtn && step === TOTAL_STEPS) { /* label refresh */ }
  }
  renderSummary();

  /* place order */
  qs('[data-place-order]').addEventListener('click', function () {
    var agree = qs('#agreeTerms');
    if (!agree.checked) { UI.toast('warning', 'One more thing…', 'Please accept the Terms to continue.'); return; }
    if (!validateStep(1)) { go(1); UI.toast('error', 'Contact details missing', 'Complete step 1 to place your order.'); return; }
    var last4 = cardNum.value.replace(/\D/g, '').slice(-4);
    var payLabelMap = {
      card: (chosenCardBrand(last4)) + ' •••• ' + (last4 || '••••'),
      paypal: 'PayPal', wallet: 'Apple/Google Pay', crypto: 'Crypto wallet'
    };
    var btn = this;
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Processing securely…';
    setTimeout(function () {
      var order = STORE.placeOrder({
        contact: { name: qs('#co-name').value, email: qs('#co-email').value, phone: qs('#co-phone').value },
        address: { name: qs('#co-shipname').value || qs('#co-name').value, line1: qs('#co-line1').value, city: qs('#co-city').value, zip: qs('#co-zip').value, country: qs('#co-country').value },
        shipMethod: shipMethod,
        payment: payLabelMap[chosenPay],
        contactEmail: qs('#co-email').value
      });
      sessionStorage.setItem('frontier-last-order', order.id);
      location.href = 'order-confirmation.html?id=' + order.id;
    }, 1400);
  });
  function chosenCardBrand(l4) {
    if (!l4) return 'CARD';
    return ['VISA', 'MC', 'AMEX'][l4.charCodeAt(0) % 3];
  }

  qsa('input[name=shipMethod][value=standard]')[0].checked = true;
  qsa('#payMethods .pay-option')[0].click();
  go(1);
};

/* ================= CONFIRMATION ================= */
UI.FPages.confirmation = function () {
  var oid = UI.getParam('id');
  var order = STORE.orderById(oid);
  if (!order) { location.href = 'index.html'; return; }
  document.title = 'Order ' + order.id + ' confirmed | FRONTIER';

  confettiBurst();

  qs('[data-order-num]').textContent = order.id;
  qs('#copyOrderBtn').addEventListener('click', function () {
    navigator.clipboard && navigator.clipboard.writeText(order.id);
    UI.toast('success', 'Copied!', 'Order number ' + order.id + ' is on your clipboard.');
  });

  qs('[data-conf-items]').innerHTML = order.items.map(function (it) {
    return '<div class="osl-item"><img src="' + it.img + '" alt=""><div style="flex:1"><b class="tiny">' + it.name + '</b><br><span class="tiny text-dim">' + it.color + ' · Qty ' + it.qty + '</span></div><b class="mono small">' + DATA.money(it.price * it.qty) + '</b></div>';
  }).join('');
  qs('[data-conf-address]').innerHTML =
    '<b class="small">' + esc(order.address.name) + '</b><br><span class="small text-dim">' + esc(order.address.line1) + '<br>' +
    esc(order.address.city) + ' ' + esc(order.address.zip) + '<br>' + esc(order.address.country) + '</span>';
  qs('[data-conf-pay]').innerHTML =
    '<b class="small">' + order.shipMethod + ' shipping</b><br><span class="small text-dim">' + esc(order.payment) + '<br>Paid in full · receipt emailed</span>';
  qs('[data-conf-date]').textContent = new Date(order.date).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  qs('[data-conf-eta]').textContent = new Date(order.etaDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  qs('[data-track-href]').href = 'order-tracking.html?order=' + order.id + '&email=' + encodeURIComponent(order.contact.email);

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function confettiBurst() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = innerWidth; canvas.height = innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var pieces = Array.apply(null, Array(130)).map(function () {
      return { x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height * .6, r: 3 + Math.random() * 6,
        c: ['#6C5CE7', '#00D2FF', '#FF6B6B', '#FFD166', '#22c55e'][Math.floor(Math.random() * 5)],
        vy: 1.8 + Math.random() * 3, vx: -.6 + Math.random() * 1.2, a: Math.random() * Math.PI, va: -.12 + Math.random() * .24 };
    });
    var frames = 0;
    (function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      });
      if (++frames < 320) requestAnimationFrame(loop);
      else canvas.remove();
    })();
  }
};

/* ================= TRACKING ================= */
UI.FPages.tracking = function () {
  var form = qs('[data-track-form]');
  var zone = qs('[data-track-result]');
  qs('[data-track-order]').value = UI.getParam('order');
  qs('[data-track-email]').value = UI.getParam('email');

  var STAGES = [
    ['Ordered', 'We received your order'],
    ['Processing', 'Packed with care in our warehouse'],
    ['Shipped', 'Handed to carrier'],
    ['Out for delivery', 'On the truck — keep an eye out!'],
    ['Delivered', 'Enjoy your new tech']
  ];

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var onum = qs('[data-track-order]').value.trim().toUpperCase();
    var omail = qs('[data-track-email]').value.trim().toLowerCase();
    if (!onum) return;
    var order = STORE.orderById(onum);
    if (!order) order = onum.indexOf('DEMO') !== -1 ? STORE.demoOrder() : null;
    if (!order || (omail && order.contact.email && order.contact.email.toLowerCase() !== omail && !order.demo)) {
      zone.innerHTML = '<div class="empty-state"><div class="art">' + FR_ICON('xCircle', 38) + '</div><h3>We couldn\'t find that order</h3>' +
        '<p class="text-dim small">Check the order ID (format FR-XXXXXX) and email combination.<br>Demo tip: use <button class="btn btn-link mono" type="button" id="fillDemo">FR-DEMO01 / demo@frontier.shop</button></p></div>';
      var fd = qs('#fillDemo');
      if (fd) fd.addEventListener('click', function () {
        qs('[data-track-order]').value = 'FR-DEMO01'; qs('[data-track-email]').value = 'demo@frontier.shop';
        form.dispatchEvent(new Event('submit'));
      });
      return;
    }
    renderTracking(order);
  });

  function stageIndex(order) {
    var map = { confirmed: 0, processing: 1, shipped: 3 };
    if (order.demo) return 3;
    return map[order.status] != null ? map[order.status] : 1;
  }

  function renderTracking(order) {
    var si = stageIndex(order);
    var filled = si / (STAGES.length - 1) * 100;
    var stagesHtml = STAGES.map(function (st, i) {
      return '<li class="tl-item ' + (i < si ? 'done' : i === si ? 'current done' : '') + '">' +
        '<span class="tl-dot">' + (i < si || i === si ? FR_ICON('check', 12) : '') + '</span>' +
        '<div class="tl-title">' + st[0] + '</div><div class="tl-meta">' + st[1] + '</div></li>';
    }).join('');
    zone.innerHTML =
      '<div class="grid grid-2 reveal in-view" style="align-items:start;margin-top:28px">' +
      '<div class="co-panel"><div class="flex between center wrap" style="margin-bottom:14px"><div>' +
      '<span class="status-pill shipped">Live tracking</span><h3 style="margin-top:8px">Order ' + order.id + '</h3>' +
      '<span class="small text-dim">' + STAGES[si][1] + (si >= 3 ? ' · arriving <b>' + new Date(order.etaDate).toDateString().slice(4) + '</b>' : '') + '</span></div>' +
      '<img alt="' + order.carrier + ' logo" width="86" height="34" style="background:var(--surface-2);border-radius:8px;padding:6px;display:inline-block;text-align:center;color:#fff;font-family:var(--font-display);font-weight:700" src="' + carrierArt(order.carrier) + '"></div>' +
      '<ul class="timeline"><i class="tl-progress" style="height:' + filled + '%"></i>' + stagesHtml + '</ul>' +
      '<div class="kv-row" style="margin-top:22px"><span class="text-dim">Carrier & tracking no.</span><b class="mono">' + order.carrier + ' · ' + order.trackingNo + '</b></div>' +
      '<div class="kv-row"><span class="text-dim">Items</span><b class="mono">' + order.items.reduce(function (n, x) { return n + x.qty; }, 0) + ' item(s) · ' + DATA.money(order.totals.total) + '</b></div>' +
      '<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">' +
      '<button class="btn btn-secondary btn-sm" data-sub-updates>' + FR_ICON('bell', 14) + ' Get SMS updates</button>' +
      '<a class="btn btn-ghost btn-sm" href="contact.html">Delivery issue?</a></div>' +
      '<div class="mini-map mesh" style="margin-top:18px;border-radius:var(--r-md);height:130px;display:grid;place-items:center;border:1px solid var(--border);position:relative;overflow:hidden">' +
      routeSvg() + '<span class="mono tiny" style="position:relative;z-index:1;background:var(--glass-strong);backdrop-filter:blur(6px);padding:5px 11px;border-radius:999px">🚚 Live location simulated for demo purposes</span></div>' +
      '</div>' +
      '<div class="co-panel">' +
      '<h3 style="margin-bottom:14px">In this shipment</h3>' +
      order.items.map(function (it) {
        return '<div class="osl-item" style="margin-bottom:12px"><img src="' + it.img + '" alt=""><div style="flex:1"><b class="tiny">' + it.name + '</b><br><span class="tiny text-dim">Qty ' + it.qty + '</span></div><b class="mono tiny">' + DATA.money(it.price * it.qty) + '</b></div>';
      }).join('') +
      (order.items[0].id && DATA.productById(order.items[0].id) ? '<a class="btn btn-primary btn-sm btn-block" style="margin-top:8px" href="product.html?id=' + order.items[0].id + '">Buy again</a>' : '') +
      '<hr style="border:none;border-top:1px dashed var(--border);margin-block:18px">' +
      '<h3 class="small" style="margin-bottom:10px">Shipping to</h3><p class="small text-dim">' + order.address.name + '<br>' + order.address.line1 + ', ' + order.address.city + ' ' + order.address.zip + '</p>' +
      '<button class="btn btn-ghost btn-sm btn-block" onclick="window.print()" style="margin-top:14px">' + FR_ICON('download', 14) + ' Print receipt</button>' +
      '</div></div>';
    qs('[data-sub-updates]').addEventListener('click', function () {
      UI.toast('success', 'SMS updates on!', 'Text status alerts will hit your phone at every milestone.');
      this.disabled = true;
    });
    window.scrollTo({ top: zone.offsetTop - 90, behavior: 'smooth' });
  }

  function carrierArt(name) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" rx="8" fill="#1d1d28"/><text x="60" y="25" font-family="Arial" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">' + name + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function routeSvg() {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 130" style="position:absolute;inset:0;width:100%;height:100%"><path d="M-20 90 C80 30 160 120 240 66 S360 40 430 70" stroke="url(#rt)" stroke-width="3" stroke-dasharray="7 8" fill="none"/><defs><linearGradient id="rt"><stop stop-color="#6C5CE7"/><stop offset="1" stop-color="#00D2FF"/></linearGradient></defs><circle cx="36" cy="72" r="9" fill="#6C5CE7"/><circle cx="330" cy="56" r="9" fill="#00D2FF"/><rect x="185" y="52" width="34" height="18" rx="4" fill="#fff"/><text x="202" y="65" font-size="12" text-anchor="middle">🚚</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // auto-run when arriving from confirmation page
  if (UI.getParam('order')) form.dispatchEvent(new Event('submit'));
};
