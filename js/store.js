/* FRONTIER — client state: cart · wishlist · compare · orders · auth (localStorage) */
window.STORE = (function () {
  'use strict';
  var KEY = 'frontier:v1';
  var subs = [];
  var state = load();

  function defaults() {
    return { cart: [], wishlist: [], compare: [], recent: [], orders: [], user: null, addresses: [], cards: [], notif: { email: true, sms: false, push: true }, promo: null, settings: { currency: 'USD' } };
  }
  function load() {
    try { var raw = localStorage.getItem(KEY); if (!raw) return defaults(); var s = JSON.parse(raw); var d = defaults(); for (var k in d) if (s[k] === undefined) s[k] = d[k]; return s; }
    catch (e) { return defaults(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} subs.forEach(function (f) { f(state); }); }
  function subscribe(fn) { subs.push(fn); }

  /* ---------- cart ---------- */
  function findLine(pid, color) { for (var i = 0; i < state.cart.length; i++) { var l = state.cart[i]; if (l.id === pid && l.color === color) return l; } return null; }
  function addToCart(pid, opts, srcEl) {
    opts = opts || {};
    var qty = opts.qty || 1;
    var p = DATA.productById(pid);
    if (!p || p.stock === 'out') return false;
    var colorName = opts.color ? opts.color.name : (p.colors[0] && p.colors[0].name) || 'Default';
    var line = findLine(pid, colorName);
    var snap = { name: p.name, img: DATA.img(p), price: p.price, brand: p.brand, subcategory: p.subcategory || '' };
    if (line) { line.qty += qty; if (opts.unitPrice != null) { line.unitPrice = opts.unitPrice; snap.price = opts.unitPrice; } line.snap = snap; }
    else state.cart.push({ id: pid, color: colorName, qty: Math.min(qty, 20), unitPrice: opts.unitPrice != null ? opts.unitPrice : p.price, snap: snap, addedAt: Date.now() });
    save();
    if (typeof UI !== 'undefined') { UI.flyToCart(srcEl); UI.toast('success', 'Added to cart', p.name + (opts.qty > 1 ? ' ×' + opts.qty : '')); }
    document.dispatchEvent(new CustomEvent('cart:changed'));
    return true;
  }
  function setQty(idx, qty) {
    if (!state.cart[idx]) return;
    state.cart[idx].qty = Math.max(1, Math.min(20, qty));
    save(); document.dispatchEvent(new CustomEvent('cart:changed'));
  }
  function removeAt(idx) { var line = state.cart[idx]; state.cart.splice(idx, 1); save(); document.dispatchEvent(new CustomEvent('cart:changed')); return line; }
  function cartCount() { return state.cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function cartLines() {
    return state.cart.map(function (l) {
      var p = DATA.productById(l.id) || (l.snap ? {
        id: l.id, name: l.snap.name, brand: l.snap.brand || 'FRONTIER', subcategory: l.snap.subcategory || '',
        stock: 'in', colors: [], connectivity: []
      } : null);
      if (!p) return null;
      var unit = l.unitPrice != null ? l.unitPrice : (p.price != null ? p.price : (l.snap && l.snap.price) || 0);
      var line = { product: p, color: l.color, qty: l.qty, unit: unit, total: +(unit * l.qty).toFixed(2) };
      if (!DATA.productById(l.id)) { p.img = function () { return (l.snap && l.snap.img) || ''; }; line.imgOverride = l.snap && l.snap.img; }
      return line;
    }).filter(Boolean);
  }

  var PROMOS = {
    'FRONTIER10': { kind: 'percent', value: 10, label: '10% off your order' },
    'WELCOME15': { kind: 'percent', value: 15, label: '15% welcome discount' },
    'FREESHIP': { kind: 'ship', value: 0, label: 'Free standard shipping' }
  };
  function applyPromo(code) {
    code = (code || '').trim().toUpperCase();
    if (!PROMOS[code]) return false;
    state.promo = code; save(); return PROMOS[code];
  }
  function clearPromo() { state.promo = null; save(); }

  var FREE_SHIP_AT = 99, SHIP_STD = 5.9, TAX_RATE = 0.0825;
  function totals(opts) {
    opts = opts || {};
    var lines = cartLines();
    var sub = lines.reduce(function (n, l) { return n + l.total; }, 0);
    var promo = state.promo && PROMOS[state.promo];
    var discount = promo && promo.kind === 'percent' ? sub * promo.value / 100 : 0;
    var shipMethod = opts.ship || 'standard';
    var baseShip = sub - discount >= FREE_SHIP_AT || sub === 0 ? 0 : SHIP_STD;
    if (shipMethod === 'express') baseShip += 12.95;
    if (shipMethod === 'overnight') baseShip += 24.5;
    var freeShipPromo = promo && promo.kind === 'ship';
    if (freeShipPromo) baseShip = 0;
    var tax = +( (sub - discount) * TAX_RATE ).toFixed(2);
    var grand = +(sub - discount + baseShip + tax).toFixed(2);
    return { lines: lines, sub: +sub.toFixed(2), discount: +discount.toFixed(2), promoLabel: promo ? promo.label : null,
      ship: +baseShip.toFixed(2), tax: tax, total: grand, freeShipLeft: Math.max(0, FREE_SHIP_AT - (sub - discount)) };
  }

  /* ---------- wishlist ---------- */
  function inWishlist(pid) { return state.wishlist.indexOf(pid) !== -1; }
  function toggleWishlist(pid) {
    var added = !inWishlist(pid);
    if (added) state.wishlist.unshift(pid);
    else state.wishlist = state.wishlist.filter(function (x) { return x !== pid; });
    save();
    var p = DATA.productById(pid);
    if (typeof UI !== 'undefined' && p) UI.toast(added ? 'success' : 'info', added ? 'Saved to wishlist ♥' : 'Removed from wishlist', p.name);
    document.dispatchEvent(new CustomEvent('wishlist:changed'));
    return added;
  }

  /* ---------- compare ---------- */
  var COMPARE_MAX = 4;
  function toggleCompare(pid) {
    var i = state.compare.indexOf(pid);
    if (i !== -1) { state.compare.splice(i, 1); save(); return { active: false }; }
    if (state.compare.length >= COMPARE_MAX) { UI.toast('warning', 'Compare is full', 'Up to ' + COMPARE_MAX + ' products — remove one first.'); return { active: false, full: true }; }
    state.compare.push(pid); save(); return { active: true };
  }

  /* ---------- recently viewed ---------- */
  function trackRecent(pid) {
    state.recent = [pid].concat(state.recent.filter(function (x) { return x !== pid; })).slice(0, 12);
    save();
  }

  /* ---------- auth ---------- */
  function login(name, email) { state.user = { name: name, email: email, joined: new Date().toISOString().slice(0, 10) }; save();
    // seed a couple of saved addresses/cards once
    if (!state.addresses.length) seedAccount();
  }
  function logout() { state.user = null; save(); }
  function seedAccount() {
    state.addresses.push({ id: 1, label: 'Home', name: state.user.name, line1: '228 Quantum Lane', city: 'Austin', zip: '78701', country: 'United States', phone: '+1 512 555 0147', def: true },
      { id: 2, label: 'Work', name: state.user.name, line1: '18 Pioneer Plaza, Suite 900', city: 'Dallas', zip: '75201', country: 'United States', phone: '+1 214 555 0198', def: false });
    state.cards.push({ id: 1, brand: 'VISA', last4: '4242', exp: '08/28', def: true }, { id: 2, brand: 'MC', last4: '8210', exp: '11/27', def: false });
  }
  function addAddress(a) { a.id = Date.now(); a.def = !state.addresses.some(function (x) { return x.def; }); state.addresses.push(a); save(); }
  function removeAddress(id) { state.addresses = state.addresses.filter(function (a) { return a.id !== id; }); save(); }
  function setDefaultAddress(id) { state.addresses.forEach(function (a) { a.def = a.id === id; }); save(); }
  function addCard(c) { c.id = Date.now(); c.def = !state.cards.some(function (x) { return x.def; }); state.cards.push(c); save(); }
  function removeCard(id) { state.cards = state.cards.filter(function (c) { return c.id !== id; }); save(); }
  function setDefaultCard(id) { state.cards.forEach(function (c) { c.def = c.id === id; }); save(); }

  /* ---------- orders ---------- */
  function genOrderId() {
    var s = ''; var A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    for (var i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)];
    return 'FR-' + s;
  }
  function placeOrder(details) {
    var t = totals(details);
    var order = {
      id: genOrderId(), date: new Date().toISOString(),
      items: t.lines.map(function (l) { return { id: l.product.id, name: l.product.name, img: DATA.img(l.product), price: l.unit, qty: l.qty, color: l.color }; }),
      totals: { sub: t.sub, discount: t.discount, ship: t.ship, tax: t.tax, total: t.total },
      contact: details.contact, address: details.address,
      shipMethod: details.shipMethod, payment: details.payment,
      status: 'confirmed',
      etaDate: new Date(Date.now() + (details.shipMethod === 'overnight' ? 1 : details.shipMethod === 'express' ? 2 : 4) * 86400000).toISOString().slice(0, 10),
      carrier: ['UPS', 'FedEx', 'DHL'][Math.floor(Math.random() * 3)],
      trackingNo: '1Z' + String(Math.floor(Math.random() * 1e10)).padStart(10, '0')
    };
    state.orders.unshift(order);
    state.cart = []; state.promo = null;
    save();
    return order;
  }
  function orderById(id) { id = String(id).toUpperCase(); return state.orders.filter(function (o) { return o.id.toUpperCase() === id; })[0] || null; }
  var DEMO_ORDER = { id: 'FR-DEMO01', date: new Date(Date.now() - 3 * 86400000).toISOString(),
    items: [{ id: 105, name: 'Quantum ANC Headphones Pro', price: 249.99, qty: 1 }],
    totals: { sub: 249.99, discount: 0, ship: 0, tax: 20.62, total: 270.61 },
    contact: { name: 'Demo Customer', email: 'demo@frontier.shop' }, address: { name: 'Demo Customer', line1: '228 Quantum Lane', city: 'Austin', zip: '78701', country: 'US' },
    shipMethod: 'standard', payment: 'VISA •••• 4242', status: 'shipped', etaDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    carrier: 'UPS', trackingNo: '1Z0994826310', demo: true };

  function demoOrder() { return JSON.parse(JSON.stringify(DEMO_ORDER)); }

  /* gift card balance mock */
  var GIFT_CODES = { 'GIFT-FR2K9X': 75, 'GIFT-HOLIDAY': 50, 'GIFT-8JQ41B': 120.45 };
  function giftBalance(code) { code = (code || '').trim().toUpperCase(); var v = GIFT_CODES[code]; return v === undefined ? null : v; }

  return {
    get: function () { return state; }, save: save, subscribe: subscribe,
    addToCart: addToCart, setQty: setQty, removeAt: removeAt, cartCount: cartCount, cartLines: cartLines,
    applyPromo: applyPromo, clearPromo: clearPromo, totals: totals,
    inWishlist: inWishlist, toggleWishlist: toggleWishlist, toggleCompare: toggleCompare, trackRecent: trackRecent,
    login: login, logout: logout, addAddress: addAddress, removeAddress: removeAddress, setDefaultAddress: setDefaultAddress,
    addCard: addCard, removeCard: removeCard, setDefaultCard: setDefaultCard,
    placeOrder: placeOrder, orderById: orderById, orders: function () { return state.orders; }, demoOrder: demoOrder,
    giftBalance: giftBalance, FREE_SHIP_AT: FREE_SHIP_AT, MAX_COMPARE: COMPARE_MAX
  };
})();
