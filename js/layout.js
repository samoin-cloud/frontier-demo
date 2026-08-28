/* FRONTIER — shared chrome: announcement bar, nav + mega menu, mini-cart,
   search overlay, theme toggle, mobile drawer, footer, back-to-top, chat widget */
window.FRLAYOUT = (function () {
  'use strict';
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); }

  var THEMES = {
    get: function () {
      var saved = null;
      try { saved = localStorage.getItem('frontier-theme'); } catch (e) {}
      return saved || (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    },
    set: function (t) {
      document.documentElement.setAttribute('data-theme', t);
      try { localStorage.setItem('frontier-theme', t); } catch (e) {}
      qsa('[data-theme-ico]').forEach(function (b) { b.innerHTML = t === 'light' ? FR_ICON('moon', 18) : FR_ICON('sun', 18); });
    },
    toggle: function () { this.set(this.get() === 'dark' ? 'light' : 'dark'); }
  };

  /* ---------------- header ---------------- */
  function buildHeader() {
    var st = STORE.get();
    var page = document.body.dataset.page || '';
    var links = [
      ['index.html', 'Home'], ['shop.html', 'Shop'], ['categories.html', 'Categories'],
      ['blog.html', 'Blog'], ['about.html', 'About'], ['support.html', 'Support'], ['contact.html', 'Contact']
    ];
    var navHtml = links.map(function (l) {
      var active = location.pathname.split('/').pop() === l[0] ? ' active' : '';
      if (l[1] === 'Shop') {
        return '<li class="has-mega"><a class="top" href="' + l[0] + '"' + (active ? '' : '') + '>Shop ' + FR_ICON('chevDown', 14) + '</a>' + megaMenu() + '</li>';
      }
      return '<li><a class="top' + active + '" href="' + l[0] + '">' + l[1] + '</a></li>';
    }).join('');

    var userBtn = st.user
      ? '<button class="icon-btn" onclick="location.href=\'account.html\'" aria-label="My account">' + FR_ICON('user', 19) + '</button>'
      : '<a class="icon-btn" href="login.html" aria-label="Sign in">' + FR_ICON('user', 19) + '</a>';

    var header = '<a class="skip-link" href="#main">Skip to content</a>' +
      '<header class="site-header"><div class="announce" aria-label="Announcements"><div class="announce-track" data-announce></div></div>' +
      '<div class="bar-wrap"><div class="container nav-bar">' +
      '<button class="icon-btn hamburger" aria-label="Open menu" data-open-drawer>' + FR_ICON('menu', 20) + '</button>' +
      '<a class="logo" href="index.html" aria-label="FRONTIER home">' + window.FR_LOGO(30) + '<span>FRONTIER</span></a>' +
      '<nav aria-label="Main navigation"><ul class="nav-links">' + navHtml + '</ul></nav>' +
      '<div class="nav-actions">' +
      '<button class="icon-btn" data-open-search aria-label="Search products">' + FR_ICON('search', 19) + '</button>' +
      userBtn +
      '<a class="icon-btn" href="wishlist.html" aria-label="Wishlist" style="position:relative">' + FR_ICON('heart', 19) + '<span class="cart-badge wish-badge" style="background:var(--p)">0</span></a>' +
      '<div style="position:relative"><button class="icon-btn" id="cartBtn" aria-label="Cart" aria-haspopup="dialog">' + FR_ICON('cart', 19) + '<span class="cart-badge cart-count-badge">0</span></button>' +
      '<div class="mini-cart" role="dialog" aria-label="Mini cart"><div class="mini-cart-head">Your cart <span class="small text-dim mono" data-mc-count></span></div>' +
      '<div class="mini-cart-items"></div><div class="mc-foot"><div class="mc-subtotal">Subtotal <b data-mc-subtotal>—</b></div>' +
      '<a class="btn btn-secondary btn-sm btn-block" href="cart.html">View cart</a>' +
      '<a class="btn btn-primary btn-sm btn-block" href="checkout.html">Checkout ' + FR_ICON('arrowRight', 14) + '</a></div></div></div>' +
      '<button class="icon-btn" data-theme-ico aria-label="Toggle dark mode">' + FR_ICON(THEMES.get() === 'dark' ? 'sun' : 'moon', 19) + '</button>' +
      '</div></div></div></header>';

    document.body.insertAdjacentHTML('afterbegin', header);

    // announcement rotator
    var track = qs('[data-announce]');
    track.innerHTML = DATA.announcements.map(function (a) {
      return '<span class="announce-item">' + FR_ICON(a[0], 15) + a[1] + '<a class="mini-btn" href="shop.html">Shop now</a></span>';
    }).join('');
    rotateAnnounce(track);

    // badges
    updateBadges();
    STORE.subscribe(updateBadges);

    qsa('[data-theme-ico]').forEach(function (b) { b.addEventListener('click', function () { THEMES.toggle(); }); });

    // scrolled state
    var onScroll = UI.debounce(function () {
      qs('.site-header').classList.toggle('scrolled', window.scrollY > 50);
      backToTopUpdate();
    }, 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // search
    qs('[data-open-search]').addEventListener('click', openSearch);

    // drawer
    qs('[data-open-drawer]').addEventListener('click', openDrawer);
  }

  function megaMenu() {
    var cols = DATA.cats.map(function (c) {
      return '<div class="mega-links"><h4>' + c.name + '</h4>' +
        c.subs.map(function (s) {
          return '<a href="shop.html?cat=' + c.slug + '&sub=' + encodeURIComponent(s) + '">' + FR_ICON(DATA.subIcon[s] || c.icon, 14) + s + '</a>';
        }).join('') + '</div>';
    }).join('');
    return '<div class="mega"><div class="mega-grid">' + cols +
      '<div class="mega-feat"><strong>Quantum X Series</strong><span>Our new flagship audio line has landed.</span><a class="btn btn-sm" style="color:#111;background:#fff;border:none" href="shop.html?sale=1">Explore deals</a></div></div></div>';
  }

  var annTimer = null;
  function rotateAnnounce(track) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (it, i) { it.style.display = i === 0 ? 'flex' : 'none'; });
    var idx = 0;
    clearInterval(annTimer);
    annTimer = setInterval(function () {
      items[idx].style.opacity = '0';
      setTimeout(function () {
        items[idx].style.display = 'none';
        idx = (idx + 1) % items.length;
        items[idx].style.opacity = '0';
        items[idx].style.display = 'flex';
        requestAnimationFrame(function () { items[idx].style.opacity = '1'; });
      }, 380);
    }, 4200);
  }

  function updateBadges() {
    var count = STORE.cartCount();
    var wcount = STORE.get().wishlist.length;
    var cb = qs('.cart-count-badge'); if (cb) cb.textContent = count > 99 ? '99+' : count;
    var wb = qs('.wish-badge'); if (wb) wb.textContent = wcount;
    renderMiniCart();
  }

  /* ---------------- mini cart ---------------- */
  var mcOpen = false;
  function renderMiniCart() {
    var box = qs('.mini-cart'); if (!box) return;
    var lines = STORE.cartLines();
    var rawCart = STORE.get().cart;
    var rows = lines.slice(0, 4).map(function (l) {
      var idx = -1;
      for (var i = 0; i < rawCart.length; i++) { if (rawCart[i].id === l.product.id && rawCart[i].color === l.color) { idx = i; break; } }
      return '<div class="mc-row"><img src="' + DATA.img(l.product) + '" alt=""><div class="mc-row-info">' +
        '<div class="mc-row-name">' + l.product.name + '</div>' +
        '<div class="mc-row-meta">' + l.color + ' · Qty ' + l.qty + '</div></div>' +
        '<b class="mono small">' + UI.money(l.total) + '</b>' +
        '<button class="mc-remove icon-btn" data-mc-rm="' + idx + '" aria-label="Remove item">' + FR_ICON('trash', 14) + '</button></div>';
    });
    qs('.mini-cart-items').innerHTML = rows.length
      ? rows.join('') + (lines.length > 4 ? '<div class="tiny text-dim" style="text-align:center;padding:6px">+ ' + (lines.length - 4) + ' more item(s)</div>' : '')
      : '<div class="mc-empty">' + FR_ICON('cart', 34) + '<p class="small" style="margin-top:8px">Your cart is empty.<br>Treat yourself — you deserve it.</p></div>';
    qs('[data-mc-count]').textContent = lines.length ? lines.reduce(function (n, l) { return n + l.qty; }, 0) + ' items' : 'empty';
    qs('[data-mc-subtotal]').textContent = UI.money(STORE.totals().sub);
    qsa('[data-mc-rm]', box).forEach(function (btn) {
      btn.onclick = function () { STORE.removeAt(+btn.dataset.mcRm); };
    });
  }
  function bindMiniCart() {
    var btn = qs('#cartBtn'), box = qs('.mini-cart');
    if (!btn) return;
    var hideTimer = null;
    function show() { clearTimeout(hideTimer); box.classList.add('open'); }
    function scheduleHide() { hideTimer = setTimeout(function () { box.classList.remove('open'); }, 260); }
    btn.addEventListener('mouseenter', show); btn.addEventListener('mouseleave', scheduleHide);
    box.addEventListener('mouseenter', show); box.addEventListener('mouseleave', scheduleHide);
    btn.addEventListener('focus', show);
    btn.addEventListener('click', function () { if (!box.classList.contains('open')) show(); else location.href = 'cart.html'; });
  }

  /* ---------------- search overlay ---------------- */
  function openSearch() {
    var tpl = document.createElement('template');
    tpl.innerHTML = '<div class="search-overlay" id="searchOverlay"><div class="search-panel container">' +
      '<form role="search" data-search-form><div class="search-input-row">' + FR_ICON('search', 20) +
      '<input type="search" placeholder="Search 224 products… try “earbuds” or “drone”" aria-label="Search products" data-search-input>' +
      '<button type="submit" class="btn btn-primary btn-sm">Search</button>' +
      '<button type="button" class="icon-btn" aria-label="Voice search (demo)" title="Voice search demo">' + FR_ICON('mic', 18) + '</button>' +
      '</div></form><div data-suggest></div>' +
      '<div class="hot-searches text-dim tiny">Trending:' +
      ['wireless earbuds', 'smartwatch', 'mechanical keyboard', 'gaming console', '4k drone'].map(function (q) {
        return '<button class="chip" data-hot-q="' + q + '">' + q + '</button>';
      }).join('') + '</div></div></div>';
    var ov = tpl.content.firstElementChild;
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { qs('[data-search-input]', ov).focus(); });
    var inputEl = qs('[data-search-input]', ov);
    var suggest = qs('[data-suggest]', ov);
    inputEl.addEventListener('input', UI.debounce(function () {
      var q = inputEl.value.trim().toLowerCase();
      if (q.length < 2) { suggest.innerHTML = ''; return; }
      var res = DATA.products.filter(function (p) {
        return (p.name + ' ' + p.brand + ' ' + p.category + ' ' + p.subcategory).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 6);
      suggest.innerHTML = res.length ? '<div class="suggest-list">' + res.map(function (p) {
        return '<a href="product.html?id=' + p.id + '"><img src="' + DATA.img(p) + '" alt=""><span><b class="small">' + highlight(p.name, q) + '</b><br><span class="tiny text-dim">' + p.brand + ' · ' + DATA.money(p.price) + '</span></span><span style="margin-left:auto">' + FR_ICON('chevRight', 15) + '</span></a>';
      }).join('') + '</div><a class="btn btn-link btn-sm" style="margin-top:10px" href="search.html?q=' + encodeURIComponent(inputEl.value) + '">See all results →</a>'
        : '<div class="suggest-list" style="padding:20px;text-align:center;color:var(--dim)">No matches for “' + inputEl.value + '” — press Enter to see suggestions.</div>';
    }, 120));
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) closeSearch(); });
    qs('[data-search-form]', ov).addEventListener('submit', function (e) {
      e.preventDefault();
      if (!inputEl.value.trim()) return;
      closeSearch();
      location.href = 'search.html?q=' + encodeURIComponent(inputEl.value);
    });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { closeSearch(); document.removeEventListener('keydown', esc); } });
    qsa('[data-hot-q]', ov).forEach(function (b) { b.addEventListener('click', function () { location.href = 'search.html?q=' + encodeURIComponent(b.dataset.hotQ); }); });
  }
  function closeSearch() {
    var ov = qs('#searchOverlay');
    if (ov) ov.remove();
    document.body.style.overflow = '';
  }
  function highlight(text, q) {
    var i = text.toLowerCase().indexOf(q);
    if (i === -1) return text;
    return text.slice(0, i) + '<mark style="background:rgba(108,92,231,.3);border-radius:3px">' + text.slice(i, i + q.length) + '</mark>' + text.slice(i + q.length);
  }

  /* ---------------- mobile drawer ---------------- */
  function openDrawer() {
    var bd = document.createElement('div');
    bd.className = 'drawer-backdrop';
    var groups = DATA.cats.map(function (c) {
      return '<div class="md-group"><button class="md-toggle" aria-expanded="false">' + c.name + ' ' + FR_ICON('chevDown', 15) + '</button>' +
        '<div class="md-sub">' + c.subs.map(function (s) { return '<a href="shop.html?cat=' + c.slug + '&sub=' + encodeURIComponent(s) + '">' + s + '</a>'; }).join('') + '</div></div>';
    }).join('');
    var dr = document.createElement('div');
    dr.className = 'mobile-drawer';
    dr.innerHTML = '<div class="flex between center" style="margin-bottom:18px"><span class="logo" style="font-size:1rem">' + window.FR_LOGO(26) + ' FRONTIER</span><button class="icon-btn" aria-label="Close menu">' + FR_ICON('x', 20) + '</button></div>' +
      '<nav aria-label="Mobile navigation">' +
      [['index.html', 'Home'], ['shop.html', 'All Products'], ['categories.html', 'Categories'], ['blog.html', 'Blog'], ['about.html', 'About Us'], ['contact.html', 'Contact'], ['support.html', 'Help Center']].map(function (l) { return '<a href="' + l[0] + '">' + l[1] + '</a>'; }).join('') +
      '<div style="height:12px"></div><h4 class="tiny" style="text-transform:uppercase;color:var(--dim);letter-spacing:.12em;padding-left:10px">Categories</h4>' + groups + '</nav>' +
      '<div style="margin-top:20px;display:grid;gap:8px"><a class="btn btn-secondary btn-block" href="wishlist.html">Wishlist</a><a class="btn btn-primary btn-block" href="login.html">Sign in</a></div>';

    function closeIt() { bd.classList.remove('open'); dr.classList.remove('open'); setTimeout(function () { bd.remove(); dr.remove(); }, 320); document.removeEventListener('keydown', esc); document.body.style.overflow = ''; }
    function esc(e) { if (e.key === 'Escape') closeIt(); }
    bd.addEventListener('click', closeIt);
    qs('.icon-btn', dr).onclick = closeIt;
    qsa('.md-toggle', dr).forEach(function (t) { t.addEventListener('click', function () { t.parentElement.classList.toggle('open'); }); });
    dr.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeIt(); });
    document.body.appendChild(bd); document.body.appendChild(dr);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { bd.classList.add('open'); dr.classList.add('open'); });
    document.addEventListener('keydown', esc);
  }

  /* ---------------- payment brand marks ---------------- */
  var PAY_MARKS = {
    visa: '<svg viewBox="0 0 52 18" role="img" aria-label="Visa"><text x="26" y="14.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-style="italic" font-weight="900" letter-spacing="1.2" fill="currentColor">VISA</text></svg>',
    mastercard: '<svg viewBox="0 0 52 18" role="img" aria-label="Mastercard"><circle cx="21" cy="9" r="8.2" fill="#EB001B"/><circle cx="31" cy="9" r="8.2" fill="#F79E1B"/><path d="M26 3.1a8.2 8.2 0 0 1 0 11.8 8.2 8.2 0 0 1 0-11.8Z" fill="#FF5F00"/></svg>',
    amex: '<svg viewBox="0 0 52 18" role="img" aria-label="American Express"><rect x="2" y="0.5" width="48" height="17" rx="3" fill="#2E77BC"/><text x="26" y="12.6" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" letter-spacing="1" fill="#fff">AMEX</text></svg>',
    paypal: '<svg viewBox="0 0 52 18" role="img" aria-label="PayPal"><text x="26" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-style="italic" font-weight="900"><tspan fill="#003087">Pay</tspan><tspan fill="#009CDE">Pal</tspan></text></svg>',
    applepay: '<svg viewBox="0 0 58 18" role="img" aria-label="Apple Pay"><g fill="currentColor" transform="translate(1,-0.6) scale(0.8)"><path d="M17.05 12.54c-.03-2.89 2.36-4.27 2.47-4.34-1.35-1.97-3.44-2.24-4.18-2.27-1.78-.18-3.47 1.05-4.37 1.05-.9 0-2.29-1.02-3.77-1-1.94.03-3.72 1.13-4.72 2.86-2.01 3.49-.51 8.66 1.45 11.49.96 1.39 2.1 2.94 3.6 2.88 1.44-.06 1.99-.93 3.73-.93s2.23.93 3.76.9c1.56-.03 2.54-1.41 3.49-2.8 1.1-1.61 1.55-3.17 1.58-3.25-.03-.02-3.02-1.16-3.04-4.59Z"/><path d="M14.84 4.06c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.73-.74.86-1.39 2.24-1.22 3.56 1.29.1 2.6-.65 3.41-1.63Z"/></g><text x="24" y="14" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="currentColor">Pay</text></svg>',
    gpay: '<svg viewBox="0 0 58 18" role="img" aria-label="Google Pay"><text x="28" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-size="13.5" font-weight="600"><tspan fill="#4285F4" font-weight="700">G</tspan><tspan fill="currentColor"> Pay</tspan></text></svg>'
  };
  function payMark(kind) {
    return '<span class="pay-chip" title="' + kind + '">' + PAY_MARKS[kind] + '</span>';
  }

  /* ---------------- footer ---------------- */
  function buildFooter() {
    var year = new Date().getFullYear();
    var f = document.createElement('footer');
    f.className = 'site-footer';
    f.innerHTML = '<div class="container">' +
      '<div class="footer-grid">' +
      '<div class="footer-col footer-about"><a class="logo" href="index.html" style="font-size:1.05rem">' + window.FR_LOGO(26) + ' FRONTIER</a>' +
      '<p>Premium smart gadgets, obsessively curated. Since 2019 we have shipped 1.2M devices to tech lovers in 42 countries.</p>' +
      '<div class="social-row" aria-label="Social media">' +
      [['x', 'X (Twitter)'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['linkedin', 'LinkedIn']].map(function (s) {
        return '<a href="#" aria-label="' + s[1] + '" title="' + s[1] + '" onclick="UI.toast(\'info\',\'' + s[1] + '\',\'Social links are demo-only — plug in your profiles anytime.\');return false">' + FR_SOCIAL(s[0], 16) + '</a>';
      }).join('') + '</div></div>' +

      '<div class="footer-col"><h4>Shop</h4>' + [
        ['shop.html', 'All Products'], ['categories.html', 'Categories'], ['compare.html', 'Compare Tools'],
        ['gift-cards.html', 'Gift Cards'], ['shop.html?sale=1', 'Deals & Offers']
      ].map(linkList).join('') + '</div>' +

      '<div class="footer-col"><h4>Support</h4>' + [
        ['support.html', 'Help Center'], ['order-tracking.html', 'Track Order'], ['shipping-returns.html', 'Shipping & Returns'],
        ['warranty.html', 'Warranty Claims'], ['faq.html', 'FAQ'], ['contact.html', 'Contact Us']
      ].map(linkList).join('') + '</div>' +

      '<div class="footer-col"><h4>Company</h4>' + [
        ['about.html', 'About Us'], ['blog.html', 'FRONTIER Journal'], ['sitemap.html', 'Sitemap'],
        ['accessibility.html', 'Accessibility'], ['newsletter.html', 'Newsletter'], ['careers-note', 'Careers']
      ].map(linkList).join('') + '</div>' +

      '<div class="footer-col"><h4>Stay in the loop</h4><p class="small" style="color:var(--dim)">One weekly email. Drops, guides, zero spam.</p>' +
      '<form class="newsletter-mini" data-footer-news><input type="email" required placeholder="you@email.com" aria-label="Email address"><button class="btn btn-primary btn-sm" type="submit">Join</button></form>' +
      '<div class="trust-row" style="display:flex;gap:12px;margin-top:16px;color:var(--dim)">' + FR_ICON('lock', 15) + '<span class="tiny">SSL secured checkout</span></div></div>' +
      '</div>' +

      '<div class="footer-bottom"><span class="small text-dim">© ' + year + ' FRONTIER Technologies. All rights reserved.</span>' +
      '<div class="pay-badges" aria-label="Accepted payments">' + ['visa', 'mastercard', 'amex', 'paypal', 'applepay', 'gpay'].map(payMark).join('') + '</div>' +
      '<div class="footer-links-misc">' + [
        ['privacy.html', 'Privacy'], ['terms.html', 'Terms'], ['shipping-returns.html', 'Returns']
      ].map(function (l) { return '<a href="' + l[0] + '">' + l[1] + '</a>'; }).join('') + '</div></div></div>';
    document.body.appendChild(f);

    var form = qs('[data-footer-news]', f);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      UI.toast('success', 'Welcome aboard!', 'Check your inbox to confirm your subscription.');
      form.reset();
    });

    function linkList(l) {
      if (l[0] === 'careers-note') return '<a href="#" onclick="UI.toast(\'info\',\'We are hiring soon!\',\'Careers portal launches later this year.\');return false">Careers</a>';
      return '<a href="' + l[0] + '">' + l[1] + '</a>';
    }
  }

  /* ---------------- floating widgets ---------------- */
  function backToTopUpdate() {
    var b = qs('.back-to-top'); if (!b) return;
    var pct = Math.min(1, window.scrollY / (document.documentElement.scrollHeight - innerHeight || 1));
    qs('circle', b).style.strokeDashoffset = 163 - 163 * pct;
    b.classList.toggle('show', window.scrollY > 480);
  }
  function buildFloating() {
    var btt = UI.el('<button class="back-to-top" aria-label="Back to top">' +
      '<svg class="ring" width="54" height="54" viewBox="0 0 54 54"><circle cx="27" cy="27" r="26"/></svg>' + FR_ICON('arrowUp', 18) + '</button>');
    btt.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(btt);

    var chat = UI.el('<div class="chat-widget"><button class="chat-launcher" aria-label="Open live chat support">' + FR_ICON('chat', 24) + '</button>' +
      '<div class="chat-panel" role="dialog" aria-label="Live chat"><div class="chat-head">Nova — AI concierge <button class="icon-btn" aria-label="Close chat" style="color:#fff;width:30px;height:30px">' + FR_ICON('x', 15) + '</button></div>' +
      '<div class="chat-body"><div class="chat-msg bot">Hey! 👋 I can help with orders, shipping, returns or finding the perfect gadget. What brings you here?</div></div>' +
      '<div class="chat-quick">' + ['Track my order', 'Return policy?', 'Recommend headphones', 'Talk to human'].map(function (q) { return '<button>' + q + '</button>'; }).join('') + '</div>' +
      '<div class="chat-input-row"><input type="text" placeholder="Type a message…" aria-label="Chat message"><button class="icon-btn" aria-label="Send message" style="width:44px;height:auto">' + FR_ICON('send', 16) + '</button></div></div></div>');
    document.body.appendChild(chat);

    var launcher = qs('.chat-launcher', chat), panel = qs('.chat-panel', chat), bodyChat = qs('.chat-body', chat), inputC = qs('input', chat);
    launcher.addEventListener('click', function () { panel.classList.toggle('open'); if (panel.classList.contains('open')) inputC.focus(); });
    qs('[aria-label="Close chat"]', panel).addEventListener('click', function () { panel.classList.remove('open'); });
    function send(text) {
      if (!text.trim()) return;
      bodyChat.insertAdjacentHTML('beforeend', '<div class="chat-msg me"></div>');
      bodyChat.lastElementChild.textContent = text;
      inputC.value = '';
      setTimeout(function () {
        var reply = botReply(text);
        bodyChat.insertAdjacentHTML('beforeend', '<div class="chat-msg bot"></div>');
        bodyChat.lastElementChild.textContent = reply;
        bodyChat.scrollTop = bodyChat.scrollHeight;
      }, 700);
    }
    qs('[aria-label="Send message"]', panel).addEventListener('click', function () { send(inputC.value); });
    inputC.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(inputC.value); });
    qsa('.chat-quick button', panel).forEach(function (b) { b.addEventListener('click', function () { send(b.textContent); }); });

    function botReply(t) {
      t = t.toLowerCase();
      if (/track|where.*order/.test(t)) return 'You can track any order on our Tracking page with your order number + email. Would you like me to take you there? (Demo order FR-DEMO01 always works.) Try order-tracking.html';
      if (/return|refund/.test(t)) return 'We offer a no-questions 30-day return window with free domestic labels. Full details are on the Shipping & Returns page.';
      if (/headphone|earbud|audio|speaker/i.test(t)) return 'For music-first listeners I suggest “Orbit ANC Headphones Max”. Great call quality too — check the Audio category or tell me your budget!';
      if (/human|agent|person/.test(t)) return 'Connecting you to a human teammate… average wait is under 2 minutes (09:00–21:00 local). Meanwhile I am happy to help.';
      if (/ship|deliver/.test(t)) return 'Standard shipping is FREE over $99 and lands in 3–5 business days. Express arrives in 1–2 days for $12.95.';
      return 'Got it! For anything specific, the Help Center has 50+ answers, or ask me about orders, returns and product picks.';
    }
  }

  /* ---------------- preloader ---------------- */
  function preloader() {
    var seen = false;
    try { seen = sessionStorage.getItem('frontier-seen'); sessionStorage.setItem('frontier-seen', '1'); } catch (e) {}
    var isHome = document.body.dataset.page === 'home';
    if (seen && !isHome) return Promise.resolve();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
    var pl = UI.el('<div id="preloader" aria-hidden="true"><div class="pre-inner"><div class="pre-ring">' +
      '<svg width="104" height="104"><defs><linearGradient id="preGrad"><stop stop-color="#6C5CE7"/><stop offset="1" stop-color="#00D2FF"/></linearGradient></defs>' +
      '<circle class="pre-track" cx="52" cy="52" r="48"/><circle class="pre-bar" cx="52" cy="52" r="48"/></svg>' +
      '<div class="pre-mark"><span class="pre-logo">F·R</span></div></div><div class="pre-sub">Loading Frontier</div></div></div>');
    document.body.appendChild(pl);
    return new Promise(function (res) {
      setTimeout(function () { pl.classList.add('done'); setTimeout(function () { pl.remove(); res(); }, 520); }, 1150);
    });
  }

  function bottomTabBar() {
    var sp = document.createElement('div');
    sp.className = 'tabbar-spacer';
    document.querySelector('.site-footer').insertAdjacentElement('beforebegin', sp);
    var page = document.body.dataset.page;
    var tabs = [
      ['index.html', 'home', 'home', 'Home'],
      ['shop.html', 'shop', 'grid', 'Shop'],
      ['', 'search-tab', 'search', 'Search'],
      ['cart.html', 'cart', 'cart', 'Cart'],
      ['account.html', 'account', 'user', 'Account']
    ];
    var bar = document.createElement('nav');
    bar.className = 'mobile-tabbar';
    bar.setAttribute('aria-label', 'Quick navigation');
    bar.innerHTML = tabs.map(function (t) {
      if (t[0] === '') return '<a href="#" data-tab-search aria-label="Open search" class="' + (page === 'search' ? 'active' : '') + '">' + FR_ICON(t[2], 20) + t[3] + '</a>';
      return '<a href="' + t[0] + '" class="' + (page.indexOf(t[1]) === 0 || (t[1] === 'shop' && ['product', 'categories', 'compare', 'search'].indexOf(page) !== -1) ? 'active' : '') + '">' + FR_ICON(t[2], 20) + t[3] + '</a>';
    }).join('');
    document.body.appendChild(bar);
    qs('[data-tab-search]', bar).addEventListener('click', function (e) { e.preventDefault(); openSearch(); });
  }

  /* ---------------- boot ---------------- */
  function init(pageKey) {
    THEMES.set(THEMES.get());
    buildHeader();
    buildFooter();
    buildFloating();
    bottomTabBar();
    bindMiniCart();
    UI.renderCompareBar();
    UI.updateCompareBar();
    UI.bindRipples();
    preloader().then(function () {
      UI.initReveal();
      var fn = FPages[pageKey];
      if (fn) fn();
    });
    document.addEventListener('click', function () {}, true);
  }

  return { init: init, THEMES: THEMES, openSearch: openSearch };
})();
