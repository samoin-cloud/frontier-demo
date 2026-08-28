/* FRONTIER — wishlist page */
UI.FPages.wishlist = function () {
  var st = STORE.get();
  /* shared wishlist via ?ids=1,2,3 shows those items read-only */
  var sharedIds = UI.getParam('ids').split(',').map(function (x) { return parseInt(x, 10); }).filter(function (x) { return DATA.productById(x); });
  var own = st.user ? st.wishlist : st.wishlist;
  var ids = Array.from(new Set(sharedIds.concat(own)));
  document.title = 'My Wishlist | FRONTIER';

  function render() {
    var host = qs('[data-wish-grid]');
    var items = ids.map(DATA.productById).filter(Boolean);
    qs('[data-wish-count]').textContent = items.length;
    var bulkBtn = qs('[data-bulk-cart]');
    var shareBtn = qs('[data-share]');
    [bulkBtn, shareBtn].forEach(function (b) { b.style.display = items.length && !sharedIds.length ? '' : 'none'; });

    if (!items.length) {
      host.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="art" style="width:150px;height:150px;color:var(--accent);animation:heartPulse 2.4s infinite">' + FR_ICON('heart', 60) + '</div>' +
        '<h2>' + (sharedIds.length ? 'This shared list is empty' : 'Nothing saved yet') + '</h2>' +
        '<p class="text-dim">Tap the ♥ on any product to park it here for later.</p>' +
        '<style>@keyframes heartPulse{0%,100%{transform:scale(1)}12%{transform:scale(1.15)}24%{transform:scale(1)}36%{transform:scale(1.08)}48%{transform:scale(1)}}</style>' +
        '<a class="btn btn-primary btn-lg" href="shop.html">Discover gadgets</a></div>';
      return;
    }
    host.innerHTML = items.map(function (p, i) {
      var card = UI.productCard(p, { variant: i % 3 });
      var alertOn = localStorage.getItem('fr-alert-' + p.id) === '1';
      return card.replace('<div class="pc-body">', '<div class="pc-body">');
    }).join('');

    /* inject price-alert row + move-to-cart into each card footer */
    qsa('.product-card', host).forEach(function (cardEl, idx) {
      var p = items[idx];
      var alertOn = localStorage.getItem('fr-alert-' + p.id) === '1';
      cardEl.insertAdjacentHTML('beforeend',
        '<div style="display:flex;gap:8px;padding:0 16px 16px;margin-top:auto">' +
        '<button class="btn btn-secondary btn-sm" data-move="' + p.id + '" ' + (p.stock === 'out' ? 'disabled' : '') + '>→ Cart</button>' +
        '<button class="btn btn-ghost btn-sm" data-alert="' + p.id + '" aria-pressed="' + alertOn + '">' + FR_ICON('bell', 13) + (alertOn ? ' Alert on' : 'Price drop alert') + '</button>' +
        '</div>');
    });

    qsa('[data-move]', host).forEach(function (b) {
      b.addEventListener('click', function () {
        STORE.addToCart(+b.dataset.move, {}, b);
      });
    });
    qsa('[data-alert]', host).forEach(function (b) {
      b.addEventListener('click', function () {
        var key = 'fr-alert-' + b.dataset.alert;
        var on = localStorage.getItem(key) === '1';
        localStorage.setItem(key, on ? '0' : '1');
        render();
        UI.toast(on ? 'info' : 'success', on ? 'Alert removed' : 'We will watch this price 👀', on ? '' : 'You will get an email the moment it drops.');
      });
    });
    UI.observeNew(host);
  }

  qs('[data-share]').addEventListener('click', function () {
    var url = location.origin + location.pathname + '?ids=' + STORE.get().wishlist.join(',');
    navigator.clipboard && navigator.clipboard.writeText(url);
    UI.toast('success', 'Shareable link copied!', url.slice(0, 64) + '…');
  });

  qs('[data-bulk-cart]').addEventListener('click', function (e) {
    var movable = STORE.get().wishlist.map(DATA.productById).filter(function (p) { return p && p.stock !== 'out'; });
    if (!movable.length) { UI.toast('warning', 'All saved items are sold out'); return; }
    movable.forEach(function (p) { STORE.addToCart(p.id, {}, e.currentTarget); });
    UI.toast('success', movable.length + ' item(s) added', 'Everything available is now in your cart.');
  });

  /* clear list */
  var clr = qs('[data-clear-all]');
  if (clr) clr.addEventListener('click', function () {
    var backup = STORE.get().wishlist.slice();
    STORE.get().wishlist.length = 0;
    STORE.save();
    render();
    UI.toast('info', 'Wishlist cleared', '', { UNDO: function () { backup.forEach(function (id) { STORE.get().wishlist.push(id); }); STORE.save(); } });
  });

  render();
};
