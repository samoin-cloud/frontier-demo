/* FRONTIER — UI primitives: money, toasts, modals, tabs, accordions, sliders, misc widgets */
window.UI = (function () {
  'use strict';
  var FPages = (window.FPages = window.FPages || {});

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); var a = arguments; t = setTimeout(function () { fn.apply(null, a); }, ms || 250); }; }

  function money(n) { return DATA.money(n); }

  function stars(rating, size) {
    size = size || 14;
    var out = '<span class="stars" role="img" aria-label="Rated ' + rating + ' of 5">';
    for (var i = 1; i <= 5; i++) {
      var on = rating >= i - 0.25;
      out += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true" fill="' + (on ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linejoin="round"' + (on ? '' : ' style="opacity:.38"') + '>' + FR_ICON_RAW.star + '</svg>';
    }
    return out + '</span>';
  }

  function toast(type, title, text, actions, ms) {
    var host = qs('.toast-host');
    if (!host) return;
    var icons = { success: 'check', error: 'x', info: 'info', warning: 'alert' };
    var node = el('<div class="toast ' + type + '" role="status"><span class="toast-ico">' + FR_ICON(icons[type] || 'info', 13) + '</span>' +
      '<div style="flex:1"><div class="toast-title">' + title + '</div>' + (text ? '<div class="toast-text">' + text + '</div>' : '') +
      (actions ? '<div class="toast-actions"></div>' : '') + '</div>' +
      '<button class="toast-x icon-btn" aria-label="Dismiss notification" style="width:28px;height:28px">' + FR_ICON('x', 14) + '</button>' +
      '<i class="toast-progress" style="animation-duration:' + (ms || 4200) + 'ms"></i></div>');
    if (actions) {
      var row = qs('.toast-actions', node);
      Object.keys(actions).forEach(function (label) {
        var b = document.createElement('button'); b.textContent = label;
        b.onclick = function () { actions[label](); kill(); };
        row.appendChild(b);
      });
    }
    function kill() { node.classList.add('out'); setTimeout(function () { node.remove(); }, 320); }
    qs('.toast-x', node).onclick = kill;
    host.appendChild(node);
    setTimeout(kill, ms || 4200);
  }

  /* modal with focus trap */
  var lastFocus = null;
  function openModal(html, opts) {
    opts = opts || {};
    closeModal();
    lastFocus = document.activeElement;
    var bd = el('<div class="modal-backdrop" role="dialog" aria-modal="true"><div class="modal-card ' + (opts.narrow ? 'narrow' : '') + '">' + html + '</div></div>');
    qs('.modal-card', bd).insertAdjacentHTML('afterbegin', '<button class="icon-btn modal-close" aria-label="Close dialog">' + FR_ICON('x', 18) + '</button>');
    document.body.style.overflow = 'hidden';
    document.body.appendChild(bd);
    qs('.modal-close', bd).onclick = closeModal;
    bd.addEventListener('mousedown', function (e) { if (e.target === bd) closeModal(); });
    document.addEventListener('keydown', escClose);
    // focus trap
    var focusables = function () { return qsa('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])', bd).filter(function (x) { return !x.disabled && x.offsetParent !== null; }); };
    bd.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    setTimeout(function () { var fi = focusables()[0]; if (fi && !opts.noAutoFocus) fi.focus(); }, 60);
    return { root: bd, close: closeModal };
  }
  function escClose(e) { if (e.key === 'Escape') closeModal(); }
  function closeModal() {
    var existing = qs('.modal-backdrop');
    if (existing) existing.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', escClose);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} lastFocus = null; }
  }

  /* flying dot add-to-cart animation */
  function flyToCart(srcEl) {
    var cartBtn = qs('#cartBtn');
    if (!cartBtn || typeof srcEl === 'undefined' || !srcEl) { bumpCart(); return; }
    try {
      var s = srcEl.getBoundingClientRect(), d = cartBtn.getBoundingClientRect();
      var dot = el('<span class="fly-dot"></span>');
      document.body.appendChild(dot);
      var x0 = s.left + s.width / 2 - 7, y0 = s.top + s.height / 2 - 7;
      var x1 = d.left + d.width / 2 - 7, y1 = d.top + d.height / 2 - 7;
      var cxp = Math.min(x0, x1) + Math.abs(x1 - x0) / 2, cy = Math.min(y0, y1) - 90;
      var start = null, dur = 720;
      dot.animate([
        { transform: 'translate(' + x0 + 'px,' + y0 + 'px)', opacity: 1 },
        { transform: 'translate(' + cxp + 'px,' + cy + 'px)', opacity: 1, offset: .45 },
        { transform: 'translate(' + x1 + 'px,' + y1 + 'px)', opacity: .85 }
      ], { duration: dur, easing: 'cubic-bezier(.3,.6,.4,1)' }).onfinish = function () { dot.remove(); bumpCart(); };
    } catch (e) { bumpCart(); }
  }
  function bumpCart() {
    var b = qs('#cartBtn'); if (!b) return;
    b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    var badge = qs('.cart-badge', b); if (badge) { badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop'); }
  }

  /* reveal-on-scroll */
  var ro = null;
  function initReveal() {
    if (ro) return;
    if (!('IntersectionObserver' in window)) { qsa('.reveal').forEach(function (x) { x.classList.add('in-view'); }); return; }
    ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in-view'); ro.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    qsa('.reveal:not(.in-view)').forEach(function (x) { ro.observe(x); });
  }
  function observeNew(scope) { if (!ro) initReveal(); else qsa('.reveal:not(.in-view)', scope || document).forEach(function (x) { ro.observe(x); }); }

  /* ripple binder */
  function bindRipples(scope) {
    qsa('.btn', scope || document).forEach(bindRipple);
  }
  function bindRipple(btn) {
    if (btn.dataset.rippleBound) return; btn.dataset.rippleBound = '1';
    btn.addEventListener('click', function (e) {
      var r = btn.getBoundingClientRect();
      var rip = document.createElement('span');
      var size = Math.max(r.width, r.height);
      rip.className = 'ripple';
      rip.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) + 'px;top:' + (e.clientY - r.top - size / 2) + 'px;';
      btn.appendChild(rip);
      setTimeout(function () { rip.remove(); }, 600);
    });
  }

  /* tabs */
  function initTabs(rootSel) {
    qsa(rootSel || '.tabs-bar').forEach(function (bar) {
      if (bar.dataset.bound) return; bar.dataset.bound = '1';
      var btns = qsa('.tab-btn', bar);
      var ind = bar.querySelector('.tab-indicator');
      var scopeDoc = bar.closest('[data-tabs-scope]') || document;
      function move(btn) {
        if (ind) { ind.style.left = btn.offsetLeft + 'px'; ind.style.width = btn.offsetWidth + 'px'; }
      }
      function activate(name) {
        btns.forEach(function (b) { b.classList.toggle('active', b.dataset.tab === name); b.setAttribute('aria-selected', b.dataset.tab === name ? 'true' : 'false'); });
        qsa('.tab-panel', scopeDoc).forEach(function (p) { p.classList.toggle('active', p.dataset.panel === name); });
        var act = btns.filter(function (b) { return b.dataset.tab === name; })[0]; if (act) move(act);
      }
      btns.forEach(function (b) { b.addEventListener('click', function () { activate(b.dataset.tab); }); });
      var initial = bar.querySelector('.tab-btn.active') || btns[0];
      if (initial) activate(initial.dataset.tab);
      requestAnimationFrame(function () { move(initial); });
      window.addEventListener('resize', debounce(function () { var a = bar.querySelector('.tab-btn.active'); if (a) move(a); }, 150));
    });
  }

  /* accordion */
  function buildAccordion(target, items, opts) {
    opts = opts || {};
    var wrap = qs(target); if (!wrap) return;
    wrap.innerHTML = items.map(function (it, idx) {
      return '<div class="accordion-item' + (opts.openFirst && idx === 0 ? ' open' : '') + '">' +
        '<button class="acc-head" aria-expanded="' + (opts.openFirst && idx === 0 ? 'true' : 'false') + '"><span>' + it[0] + '</span><span class="chev">' + FR_ICON('chevDown', 17) + '</span></button>' +
        '<div class="acc-body"><div class="acc-inner">' + it[1] + '</div></div></div>';
    }).join('');
    bindAccordion(wrap);
  }
  function bindAccordion(wrap) {
    qsa('.acc-head', wrap).forEach(function (head) {
      head.addEventListener('click', function () {
        var item = head.parentElement;
        var body = qs('.acc-body', item);
        var open = item.classList.toggle('open');
        head.setAttribute('aria-expanded', open);
        body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
      });
      var item0 = head.parentElement;
      if (item0.classList.contains('open')) qs('.acc-body', item0).style.maxHeight = qs('.acc-body', item0).scrollHeight + 'px';
    });
  }

  /* countdown with flip-ish tick */
  function countdown(rootSel, endTime, onEnd) {
    var root = qs(rootSel); if (!root) return;
    function setUnit(cell, val) {
      val = String(val).padStart(2, '0');
      if (cell.textContent !== val) {
        cell.textContent = val;
        cell.classList.remove('tick'); void cell.offsetWidth; cell.classList.add('tick');
      }
    }
    function tick() {
      var diff = new Date(endTime) - Date.now();
      if (diff <= 0) { diff = 0; clearInterval(iv); if (onEnd) onEnd(); }
      var d = Math.floor(diff / 86400000), h = Math.floor(diff % 86400000 / 3600000), m = Math.floor(diff % 3600000 / 60000), s = Math.floor(diff % 60000 / 1000);
      var dd = qs('[data-cd="d"]', root), hh = qs('[data-cd="h"]', root), mm = qs('[data-cd="m"]', root), ss = qs('[data-cd="s"]', root);
      if (dd) setUnit(dd, d < 100 ? d : 99);
      if (hh) setUnit(hh, h); if (mm) setUnit(mm, m); if (ss) setUnit(ss, s);
    }
    tick();
    var iv = setInterval(tick, 1000);
  }

  /* count-up numbers */
  function countUp(elm, target, ms, prefix) {
    ms = ms || 1400;
    var start = performance.now();
    function frame(now) {
      var p = Math.min(1, (now - start) / ms);
      p = 1 - Math.pow(1 - p, 3);
      elm.textContent = (prefix || '') + Math.round(target * p).toLocaleString();
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* lazy image observe */
  var imgObs = null;
  function lazyImg(imgEl) {
    if (!imgObs) imgObs = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { var im = en.target; im.src = im.dataset.src; delete im.dataset.src; imgObs.unobserve(im); } });
    }, { rootMargin: '300px' });
    imgObs.observe(imgEl);
  }

  /* product card renderer — used everywhere */
  function productCard(p, opts) {
    opts = opts || {};
    var badgeHtml = '';
    if (p.stock === 'out') badgeHtml += '<span class="badge oos">Out of stock</span>';
    p.badges.slice(0, 2).forEach(function (b) {
      if (b === 'sale') badgeHtml = '<span class="badge sale">-' + p.discount + '%</span>' + badgeHtml;
      else if (b === 'new') badgeHtml += '<span class="badge new">New</span>';
      else if (b === 'hot') badgeHtml += '<span class="badge hot">Hot</span>';
      else if (b === 'limited') badgeHtml += '<span class="badge limited">Limited</span>';
    });
    var stockNote = p.stock === 'low' ? '<span class="stock-note low">Only ' + p.lowCount + ' left</span>'
      : p.stock === 'out' ? '<span class="stock-note out">Currently unavailable</span>' : '';
    var wishOn = STORE.inWishlist(p.id) ? 'on' : '';
    var inCompare = STORE.get().compare.indexOf(p.id) !== -1 ? 'checked' : '';
    var artSrc = DATA.img(p, opts.variant || 0);
    var desc = shortDesc(p);
    return '<article class="product-card' + (opts.listClass || '') + '">' +
      '<div class="pc-media"><a href="product.html?id=' + p.id + '" aria-label="' + p.name + '">' +
      '<img src="' + artSrc + '" alt="' + p.name + '" loading="lazy" data-variant="v' + (opts.variant || 0) + '"></a>' +
      '<div class="pc-badges">' + badgeHtml + '</div>' +
      '<div class="pc-favs"><button class="pc-fav ' + wishOn + '" data-wish="' + p.id + '" aria-label="Toggle wishlist for ' + p.name + '">' + FR_ICON('heart', 16) + '</button></div>' +
      '<label class="checkbox compare-check" title="Add to compare"><input type="checkbox" data-compare="' + p.id + '" ' + inCompare + '><span class="checkmark">' + FR_ICON('check', 11) + '</span><span class="tiny" style="margin-left:-4px;color:var(--dim)">Compare</span></label>' +
      '<div class="pc-actions">' +
      '<button class="btn btn-secondary" data-qview="' + p.id + '">' + FR_ICON('eye', 15) + ' Quick view</button>' +
      '<button class="btn btn-primary" data-atc="' + p.id + '" ' + (p.stock === 'out' ? 'disabled' : '') + '>' + FR_ICON('cart', 15) + (p.stock === 'out' ? ' Sold out' : ' Add') + '</button></div>' +
      '</div>' +
      '<div class="pc-body">' +
      '<div style="display:flex;align-items:center;gap:6px"><span class="pc-brand">' + p.brand + '</span>' + (p.ageLabel ? '<span class="badge soft" style="margin-left:auto;font-size:.6rem">' + p.ageLabel + '</span>' : '') + '</div>' +
      '<a class="pc-name" href="product.html?id=' + p.id + '">' + p.name + '</a>' +
      '<div class="pc-rating">' + stars(p.rating) + '<span>' + p.rating.toFixed(1) + '</span><span>(' + fmtCount(p.reviews) + ')</span></div>' +
      (opts.showDesc ? '<p class="pc-desc">' + desc + '</p>' : '') +
      '<div class="pc-price-row"><span class="price">' + money(p.price) + '</span>' + (p.oldPrice ? '<span class="price-old">' + money(p.oldPrice) + '</span>' : '') + stockNote + '</div>' +
      '</div></article>';
  }
  function fmtCount(n) { return n >= 1000 ? (n / 1000).toFixed(n >= 9500 ? 0 : 1).replace(/\.0$/, '') + 'k' : n; }
  function shortDesc(p) {
    return p.descUseCase + ' The ' + p.subcategory.toLowerCase() + ' pick from ' + p.brand + ', rated ' + p.rating.toFixed(1) + '/5 by ' + p.reviews + '+ owners.';
  }

  /* global delegated handlers for card buttons */
  function initDelegates() {
    document.addEventListener('click', function (e) {
      var atc = e.target.closest('[data-atc]');
      if (atc) { STORE.addToCart(+atc.dataset.atc, {}, atc); return; }
      var wsh = e.target.closest('[data-wish]');
      if (wsh) {
        var added = STORE.toggleWishlist(+wsh.dataset.wish);
        qsa('[data-wish="' + wsh.dataset.wish + '"]').forEach(function (btn) { btn.classList.toggle('on', added); });
        document.dispatchEvent(new CustomEvent('wishlist:changed'));
        return;
      }
      var cmp = e.target.closest('input[data-compare]');
      if (cmp) {
        var res = STORE.toggleCompare(+cmp.dataset.compare);
        if (!res.active && !res.full) cmp.checked = false;
        if (res.full) cmp.checked = false;
        updateCompareBar();
        return;
      }
      var qv = e.target.closest('[data-qview]');
      if (qv) { quickView(+qv.dataset.qview); return; }
    });
  }

  /* quick view modal */
  function quickView(pid) {
    var p = DATA.productById(pid); if (!p) return;
    var mod = openModal('<div class="qv-grid"><img class="qv-img" src="' + DATA.img(p, 1) + '" alt="' + p.name + '">' +
      '<div><span class="badge soft mono">' + p.brand + '</span><h3 id="dlg-title" style="margin-top:10px">' + p.name + '</h3>' +
      '<div class="pc-rating" style="margin-top:8px">' + stars(p.rating) + '<span>' + p.rating.toFixed(1) + ' (' + fmtCount(p.reviews) + ' reviews)</span></div>' +
      '<div class="pd-price-row"><span class="price" style="font-size:1.5rem">' + money(p.price) + '</span>' + (p.oldPrice ? '<span class="price-old">' + money(p.oldPrice) + '</span><span class="badge sale">-' + p.discount + '%</span>' : '') + '</div>' +
      '<p class="text-dim small">' + shortDesc(p) + '</p>' +
      '<div class="qv-options"><div><h4 class="tiny" style="text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Color · <span data-qv-color>' + (p.colors[0] && p.colors[0].name) + '</span></h4><div class="swatches">' +
      p.colors.map(function (c, i) { return '<button class="swatch ' + (i === 0 ? 'active' : '') + '" style="background:' + c.hex + '" data-tip="' + c.name + '" data-swatch-name="' + c.name + '" aria-label="' + c.name + '"></button>'; }).join('') +
      '</div></div></div>' +
      '<div class="pd-cta-row"><button class="btn btn-primary btn-lg" data-qv-atc="' + p.id + '" ' + (p.stock === 'out' ? 'disabled' : '') + '>' + FR_ICON('cart', 17) + (p.stock === 'out' ? 'Sold out' : 'Add to Cart') + '</button>' +
      '<a class="btn btn-ghost" href="product.html?id=' + p.id + '">Full details ' + FR_ICON('arrowRight', 16) + '</a></div>' +
      '<div class="kv-row" style="margin-top:18px;border:none"><span class="text-dim small">' + FR_ICON('shield', 14) + ' 2-year warranty</span><span class="text-dim small">' + FR_ICON('refresh', 14) + ' 30-day returns</span><span class="text-dim small">' + FR_ICON('truck', 14) + ' Ships today</span></div>' +
      '</div></div>', {});
    var chosenColor = p.colors[0] ? p.colors[0].name : null;
    qsa('.swatch', mod.root).forEach(function (sw) {
      sw.addEventListener('click', function () {
        qsa('.swatch', mod.root).forEach(function (x) { x.classList.remove('active'); });
        sw.classList.add('active'); chosenColor = sw.dataset.swatchName;
        qs('[data-qv-color]', mod.root).textContent = chosenColor;
      });
    });
    var atcBtn = qs('[data-qv-atc]', mod.root);
    if (atcBtn) atcBtn.addEventListener('click', function () { STORE.addToCart(p.id, { color: p.colors.find(function (c) { return c.name === chosenColor; }), qty: 1 }); closeModal(); });
  }

  /* compare floating bar */
  function updateCompareBar() {
    var bar = qs('.compare-bar');
    if (!bar) { renderCompareBar(); bar = qs('.compare-bar'); }
    var ids = STORE.get().compare;
    if (!bar) return;
    bar.classList.toggle('show', ids.length >= 2);
    if (ids.length >= 2) {
      qs('.compare-thumbs', bar).innerHTML = ids.map(function (id) {
        var p = DATA.productById(id);
        return '<img src="' + DATA.img(p) + '" alt="' + p.name + '">';
      }).join('');
      qs('[data-compare-count]', bar).textContent = ids.length;
    }
  }
  function renderCompareBar() {
    if (qs('.compare-bar')) return;
    var bar = el('<div class="compare-bar" role="region" aria-label="Compare products toolbar"><div class="compare-thumbs"></div>' +
      '<span class="small text-dim"><b data-compare-count>0</b> selected</span>' +
      '<a class="btn btn-primary btn-sm" href="compare.html">Compare now ' + FR_ICON('scale', 14) + '</a>' +
      '<button class="icon-btn" data-clear-compare aria-label="Clear comparison list" style="width:34px;height:34px">' + FR_ICON('trash', 15) + '</button></div>');
    document.body.appendChild(bar);
    qs('[data-clear-compare]', bar).onclick = function () { STORE.get().compare.length = 0; STORE.save(); qsa('input[data-compare]').forEach(function (c) { c.checked = false; }); updateCompareBar(); };
    STORE.subscribe(updateCompareBar);
  }

  function getParam(name) { return new URLSearchParams(location.search).get(name) || ''; }

  // global aliases used by page modules
  window.qs = qs; window.qsa = qsa;

  return {
    FPages: FPages, qs: qs, qsa: qsa, el: el, debounce: debounce, money: money, stars: stars,
    toast: toast, openModal: openModal, closeModal: closeModal, flyToCart: flyToCart, bumpCart: bumpCart,
    initReveal: initReveal, observeNew: observeNew, bindRipples: bindRipples, bindRipple: bindRipple,
    initTabs: initTabs, buildAccordion: buildAccordion, bindAccordion: bindAccordion,
    countdown: countdown, countUp: countUp, productCard: productCard, quickView: quickView,
    initDelegates: initDelegates,
    updateCompareBar: updateCompareBar, renderCompareBar: renderCompareBar,
    getParam: getParam, fmtCount: fmtCount, shortDesc: shortDesc
  };
})();
