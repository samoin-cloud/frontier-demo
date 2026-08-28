/* FRONTIER — about page */
UI.FPages.about = function () {
  /* animated stat counters */
  var stats = [
    [1240000, 'Products shipped', '+'],
    [480000, 'Happy customers', '+'],
    [42, 'Countries served', ''],
    [7, 'Years pushing the frontier', '']
  ];
  var host = qs('[data-stat-counters]');
  var r = DATA.rng('aboutstats');
  host.innerHTML = stats.map(function (s, i) {
    return '<div class="stat-card reveal" data-delay="' + i + '" data-countto="' + s[0] + '" data-prefix="' + s[2] + '">' +
      '<div class="big-stat" data-countval>0</div><div class="text-dim small">' + s[1] + '</div></div>';
  }).join('');

  var counted = false;
  window.addEventListener('scroll', UI.debounce(function () {
    if (counted || !inView(host)) return;
    counted = true;
    qsa('[data-countto]').forEach(function (card) {
      UI.countUp(card.querySelector('[data-countval]'), +card.dataset.countto, 1600, card.dataset.prefix);
    });
  }, 60));

  function inView(el) {
    var box = el.getBoundingClientRect();
    return box.top < innerHeight * .9 && box.bottom > 0;
  }

  /* team flip cards */
  qs('[data-team-grid]').innerHTML = DATA.team.map(function (m, i) {
    return '<article class="flip-card reveal" data-delay="' + i % 6 + '">' +
      '<div class="flip-inner">' +
      '<div class="flip-face flip-front" style="justify-content:end">' +
      '<span style="position:absolute;inset:0;background:linear-gradient(160deg,hsl(' + m.hue + ',62%,48%),hsl(' + ((m.hue + 80) % 360) + ',55%,32%));display:grid;place-items:center"><span class="avatar lg" style="width:84px;height:84px;font-size:1.6rem;background:rgba(255,255,255,.2)">' + m.name.split(' ').map(function (x) { return x[0]; }).join('') + '</span></span>' +
      '<div style="position:relative;background:linear-gradient(transparent,rgba(8,8,14,.85));color:#fff;padding:56px 18px 16px;width:100%">' +
      '<b class="small mono">' + m.role + '</b><h3 style="font-size:1.05rem;margin-top:4px;color:#fff">' + m.name + '</h3><span class="tiny" style="opacity:.75">📍 ' + m.city + '</span></div></div>' +
      '<div class="flip-face flip-back"><svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" opacity=".35"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/></svg>' +
      '<p style="font-weight:600;font-family:var(--font-display)">“' + m.quote + '”</p>' +
      '<b>' + m.name + '</b><span class="tiny" style="opacity:.85">' + m.role + '</span></div>' +
      '</div></article>';
  }).join('');

  /* milestones timeline */
  var MILESTONES = [
    ['2019', 'The garage era', 'Two engineers, one 3D-printed phone stand, and a decision: only stock things we would use ourselves.'],
    ['2020', 'First warehouse', 'Orders hit 100/day. We moved from a living room to a real logistics floor in Austin.'],
    ['2021', 'Warranty 2.0', 'We doubled warranty coverage industry-wide to 2 years on everything. It became our signature promise.'],
    ['2022', 'Going global', 'EU & APAC fulfillment centers opened. 42 countries within reach of free express upgrades.'],
    ['2023', 'Carbon-neutral shipping', 'Every parcel offset by default — 100% renewable last-mile partners across all regions.'],
    ['2024', '10 million reviews', 'Customer voices became our product roadmap: wishlist-driven sourcing launched.'],
    ['2025', 'FRONTIER Care+', 'Accidental-damage plans and instant advance replacement arrive, removing the last worry from buying tech online.'],
    ['2026', 'AI concierge Nova', 'Nova starts answering pre-sales questions in six languages, cutting average decision time in half.']
  ];
  qs('[data-milestones]').innerHTML = MILESTONES.map(function (m, i) {
    return '<li class="ms-item reveal' + '" data-delay="' + i % 4 + '"><b class="ms-year mono">' + m[0] + '</b>' +
      '<div><b class="tl-title" style="font-family:var(--font-display)">' + m[1] + '</b><p class="text-dim small" style="margin-top:4px">' + m[2] + '</p></div></li>';
  }).join('');

  UI.observeNew();
};
