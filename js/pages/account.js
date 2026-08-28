/* FRONTIER — login/register/forgot · account dashboard sections */
UI.FPages.login = function () {
  var pillBtns = qsa('[data-auth-tab]');
  var panels = { login: qs('#loginPanel'), register: qs('#registerPanel'), forgot: qs('#forgotPanel') };

  function show(name) {
    pillBtns.forEach(function (b) { b.classList.toggle('active', b.dataset.authTab === name); });
    Object.keys(panels).forEach(function (k) { panels[k].style.display = k === name ? '' : 'none'; });
    if (name === 'register') qs('#pwStrengthWrap').style.display = '';
    document.title = (name[0].toUpperCase() + name.slice(1)) + ' | FRONTIER';
  }
  pillBtns.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.authTab); }); });

  /* password visibility */
  qsa('[data-pw-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(btn.dataset.pwToggle);
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.innerHTML = FR_ICON(input.type === 'password' ? 'eye' : 'lock', 16);
      btn.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
    });
  });

  /* strength meter */
  var pwInput = qs('#regPassword');
  pwInput.addEventListener('input', function () {
    var v = pwInput.value, score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    qsa('#pwMeter i').forEach(function (seg, i) {
      seg.className = i < score ? 'on-' + score : '';
    });
    var labels = ['Too weak', 'Weak', 'Decent', 'Strong', 'Excellent'];
    qs('#pwScore').textContent = v ? labels[score] : '';
  });

  /* submit handlers — mock auth */
  qs('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = qs('#loginEmail').value.trim();
    if (!qs('#loginEmail').checkValidity() || !qs('#loginPassword').value) return;
    authGo(email.split('@')[0], email);
  });
  qs('#registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!this.reportValidity()) return;
    if (qs('#regPassword').value !== qs('#regPassword2').value) {
      UI.toast('error', 'Passwords do not match');
      return;
    }
    authGo(qs('#regName').value, qs('#regEmail').value);
    UI.toast('info', 'Verification link sent', '(Demo) we skipped the email hop for you.');
  });
  qs('#forgotForm').addEventListener('submit', function (e) {
    e.preventDefault();
    UI.toast('success', 'Reset link sent!', 'Check your inbox within a minute. (Demo)');
    show('login');
  });
  qsa('[data-social]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      UI.toast('success', 'Signed in with ' + btn.dataset.social + ' (demo)', 'Welcome back to FRONTIER.');
      authGo(btn.dataset.social === 'Google' ? 'Casey Rivera' : 'Sam Ortega', 'user@frontier.shop');
    });
  });

  function authGo(name, email) {
    STORE.login(name, email);
    var back = sessionStorage.getItem('frontier-login-back') || 'account.html';
    sessionStorage.removeItem('frontier-login-back');
    location.href = back;
  }
};

/* ================= ACCOUNT ================= */
UI.FPages.account = function () {
  var st = STORE.get();
  if (!st.user) { location.href = 'login.html'; return; }
  var u = st.user;
  document.title = 'My account | FRONTIER';

  qs('[data-user-initials]').textContent = initials(u.name);
  qs('[data-user-name]').textContent = u.name;
  qs('[data-user-email]').textContent = u.email;
  var helloEl = qs('[data-hello-name]');
  if (helloEl) helloEl.textContent = u.name.split(' ')[0];

  function initials(n) { return n.split(/\s+/).map(function (x) { return x[0]; }).slice(0, 2).join('').toUpperCase(); }

  /* ------- section switching ------- */
  var navLinks = qsa('[data-acct-nav]');
  var sections = qsa('.acct-section');
  function activate(id) {
    navLinks.forEach(function (a) { a.classList.toggle('active', a.dataset.acctNav === id); });
    sections.forEach(function (s) { s.classList.toggle('active', s.id === id); });
    location.hash = id;
  }
  navLinks.forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); activate(a.dataset.acctNav); }); });
  var hashTargets = ['overview', 'orders', 'addresses', 'payments', 'settings', 'notifications'];
  activate(hashTargets.indexOf(location.hash.replace('#', '')) !== -1 ? location.hash.slice(1) : 'overview');

  qs('#logoutBtn').addEventListener('click', function () {
    STORE.logout();
    location.href = 'index.html';
  });

  /* ------- overview ------- */
  renderOverview();
  function renderOverview() {
    var orders = STORE.orders();
    qs('[data-recent-orders]').innerHTML = orders.length
      ? orders.slice(0, 3).map(orderRow).join('')
      : '<div class="empty-state" style="padding:34px"><div class="art">' + FR_ICON('package', 30) + '</div><p class="small text-dim">No orders yet.</p><a class="btn btn-primary btn-sm" href="shop.html">Start shopping</a></div>';
    qs('[data-stat-orders]').textContent = orders.length;
    var spent = orders.reduce(function (n, o) { return n + o.totals.total; }, 0);
    qs('[data-stat-spent]').textContent = DATA.money(spent);
    qs('[data-stat-wishes]').textContent = STORE.get().wishlist.length;
  }

  /* ------- orders table ------- */
  function orderRow(o) {
    return '<tr><td class="mono"><a href="#" data-view-order="' + o.id + '">' + o.id + '</a></td>' +
      '<td>' + new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</td>' +
      '<td><span class="status-pill confirmed">' + statusOf(o) + '</span></td>' +
      '<td class="mono">' + DATA.money(o.totals.total) + '</td>' +
      '<td style="text-align:right"><button class="btn btn-secondary btn-sm" data-detail="' + o.id + '">Details</button></td></tr>';
  }
  function statusOf(o) {
    if (o.demo) return 'Shipped';
    return new Date(o.date) > Date.now() - 86400000 ? 'Confirmed' : 'Processing';
  }
  function renderOrders() {
    qs('[data-orders-tbody]').innerHTML = STORE.orders().map(orderRow).join('') ||
      '<tr><td colspan="5"><div class="empty-state" style="padding:26px"><p class="small text-dim">No orders yet — your future gadgets await.</p><a class="btn btn-secondary btn-sm" href="shop.html">Browse shop</a></div></td></tr>';
    bindOrderButtons();
  }
  renderOrders();

  function bindOrderButtons() {
    qsa('[data-detail]').forEach(function (b) { b.addEventListener('click', function () { openOrderDetail(b.dataset.detail); }); });
    qsa('[data-view-order]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); openOrderDetail(a.dataset.viewOrder); });
    });
  }

  function openOrderDetail(id) {
    var order = STORE.orderById(id);
    if (!order) return;
    var stages = ['Ordered', 'Processing', 'Shipped', 'Delivered'];
    var si = order.demo ? 2 : Math.min(1, Math.floor((Date.now() - new Date(order.date)) / 172800000));
    UI.openModal(
      '<div style="padding:28px">' +
      '<div class="flex between center wrap"><h3 id="dlg-title">Order ' + order.id + '</h3><span class="status-pill shipped">' + statusOf(order) + '</span></div>' +
      '<p class="tiny text-dim mono">Placed ' + new Date(order.date).toLocaleString() + ' · via ' + order.carrier + ' ' + order.trackingNo + '</p>' +
      '<ul class="timeline" style="margin-block:18px">' + stages.map(function (s, i) {
        return '<li class="tl-item ' + (i <= si ? 'done' : '') + '"><span class="tl-dot">' + (i <= si ? FR_ICON('check', 12) : '') + '</span><div class="tl-title small">' + s + '</div><div class="tl-meta tiny">' + new Date(new Date(order.date).getTime() + i * 129600000).toLocaleDateString() + '</div></li>';
      }).join('') + '</ul>' +
      '<div style="max-height:200px;overflow:auto;margin-bottom:14px">' +
      order.items.map(function (it) {
        return '<div class="osl-item" style="margin-bottom:10px"><img src="' + it.img + '" width="44" height="44" style="border-radius:8px;background:var(--surface-2)" alt=""><div style="flex:1"><b class="tiny">' + it.name + '</b><br><span class="tiny text-dim">' + it.color + '</span></div><span class="mono tiny">×' + it.qty + ' · ' + DATA.money(it.price * it.qty) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="kv-row"><span class="text-dim small">Total paid</span><b class="price mono">' + DATA.money(order.totals.total) + '</b></div>' +
      '<div class="kv-row"><span class="text-dim small">Ship to</span><b class="small">' + order.address.line1 + ', ' + order.address.city + '</b></div>' +
      '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">' +
      '<button class="btn btn-secondary btn-sm" onclick="window.print()">Download invoice</button>' +
      '<a class="btn btn-primary btn-sm" href="order-tracking.html?order=' + order.id + '&email=' + encodeURIComponent(order.contact.email || '') + '">Track package</a></div>' +
      '</div>', {});
  }

  /* ------- addresses ------- */
  function renderAddresses() {
    qs('[data-address-list]').innerHTML = (STORE.get().addresses.length ? STORE.get().addresses : []).map(function (a) {
      return '<article class="co-panel" style="position:relative;padding:22px">' +
        (a.def ? '<span class="badge new" style="position:absolute;top:14px;right:14px">Default</span>' : '') +
        '<b>' + a.label + ' · <span class="mono small">' + escHtml(a.name) + '</span></b>' +
        '<p class="small text-dim" style="margin-top:6px">' + escHtml(a.line1) + '<br>' + escHtml(a.city) + ' ' + escHtml(a.zip) + ', ' + escHtml(a.country) + '<br>' + escHtml(a.phone) + '</p>' +
        '<div style="display:flex;gap:8px;margin-top:14px">' +
        (!a.def ? '<button class="btn btn-link btn-sm" data-defaddr="' + a.id + '">Set default</button>' : '') +
        '<button class="btn btn-danger btn-sm" style="margin-left:auto;background:none;color:var(--accent)" data-rmaddr="' + a.id + '">' + FR_ICON('trash', 14) + ' Remove</button></div></article>';
    }).join('');
    qsa('[data-defaddr]').forEach(function (b) { b.addEventListener('click', function () { STORE.setDefaultAddress(+b.dataset.defaddr); renderAddresses(); }); });
    qsa('[data-rmaddr]').forEach(function (b) { b.addEventListener('click', function () { STORE.removeAddress(+b.dataset.rmaddr); renderAddresses(); }); });
  }
  function escHtml(s) { return String(s).replace(/</g, '&lt;'); }
  renderAddresses();
  qs('#addrForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    STORE.addAddress({ label: f.querySelector('[name=label]').value || 'Custom', name: f.querySelector('[name=name]').value, line1: f.querySelector('[name=line1]').value, city: f.querySelector('[name=city]').value, zip: f.querySelector('[name=zip]').value, country: f.querySelector('[name=country]').value, phone: f.querySelector('[name=phone]').value, def: false });
    f.reset(); renderAddresses();
    UI.toast('success', 'Address saved');
  });

  /* ------- payment methods ------- */
  function renderCards() {
    qs('[data-cards-list]').innerHTML = STORE.get().cards.map(function (c) {
      return '<article class="co-panel flex center between" style="padding:18px;gap:14px"><div class="flex center" style="gap:14px">' +
        '<span class="pay-badge" style="font-size:.72rem;padding:9px 13px">' + c.brand + '</span>' +
        '<div><b class="mono small">•••• •••• •••• ' + c.last4 + '</b><br><span class="tiny text-dim">Exp ' + c.exp + (c.def ? ' · Default' : '') + '</span></div></div>' +
        '<div class="flex" style="gap:6px">' + (!c.def ? '<button class="btn btn-link btn-sm" data-defcard="' + c.id + '">Make default</button>' : '') +
        '<button class="icon-btn" data-rmcard="' + c.id + '" aria-label="Remove card" style="width:36px;height:36px">' + FR_ICON('trash', 15) + '</button></div></article>';
    }).join('');
    qsa('[data-defcard]').forEach(function (b) { b.addEventListener('click', function () { STORE.setDefaultCard(+b.dataset.defcard); renderCards(); }); });
    qsa('[data-rmcard]').forEach(function (b) { b.addEventListener('click', function () { STORE.removeCard(+b.dataset.rmcard); renderCards(); }); });
  }
  renderCards();
  qs('#cardForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var num = f.querySelector('[name=cnum]').value.replace(/\D/g, '');
    if (num.length < 15) { UI.toast('error', 'Card number looks short'); return; }
    STORE.addCard({ brand: num[0] === '4' ? 'VISA' : num[0] === '5' ? 'MC' : 'AMEX', last4: num.slice(-4), exp: f.querySelector('[name=cexp]').value || '—/—', def: false });
    f.reset(); renderCards();
    UI.toast('success', 'Card added securely', 'Encrypted and tokenized — we never store raw numbers.');
  });

  /* ------- settings ------- */
  qs('#settingsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    st.user.name = qs('#setName').value;
    st.user.email = qs('#setEmail').value;
    STORE.save();
    renderOverview();
    UI.toast('success', 'Profile updated');
  });
  qs('#avatarPick').addEventListener('click', function () {
    var hues = [2, 205, 145, 262, 320];
    var h = hues[Math.floor(Math.random() * hues.length)];
    qs('[data-user-avatar-big]').style.background = 'linear-gradient(135deg,hsl(' + h + ',70%,55%),hsl(' + ((h + 60) % 360) + ',70%,45%))';
    UI.toast('success', 'New avatar look!');
  });
  qs('#pwChangeForm').addEventListener('submit', function (e) {
    e.preventDefault();
    UI.toast('success', 'Password changed', 'You will stay signed in on this device.');
    this.reset();
  });

  /* ------- notifications ------- */
  var NOTIF_KEY = ['email', 'sms', 'push'];
  qsa('#notifications .switch input').forEach(function (sw, i) {
    sw.checked = !!st.notif[NOTIF_KEY[i]];
    sw.addEventListener('change', function () {
      st.notif[NOTIF_KEY[i]] = sw.checked;
      STORE.save();
      UI.toast('success', sw.checked ? 'Subscribed ✓' : 'Unsubscribed');
    });
  });

  /* recently viewed */
  var rvHost = qs('[data-acct-recent]');
  rvHost.innerHTML = STORE.get().recent.slice(0, 8).length
    ? STORE.get().recent.slice(0, 8).map(function (id) { return DATA.productById(id); }).filter(Boolean)
      .map(function (p) { return UI.productCard(p); }).join('')
    : '<p class="small text-dim">Products you view will appear here for quick access.</p>';

  document.addEventListener('cart:changed', renderOverview);
};
