/* FRONTIER — blog listing · blog detail (with comments) */
(function () {
  function coverArt(post, w, h) {
    w = w || 320; h = h || 180;
    var r = DATA.rng(post.coverSeed);
    var hue = 190 + Math.floor(r() * 150);
    var shapes = '';
    for (var i = 0; i < 3; i++) {
      shapes += '<circle cx="' + Math.floor(r() * w) + '" cy="' + Math.floor(r() * h) + '" r="' + Math.floor(18 + r() * 46) + '" fill="#fff" opacity=".1"/>';
    }
    var pathD = 'M0 ' + (h * .8) + ' ' +
      Array.apply(null, Array(5)).map(function (_, k) {
        return 'L' + (k * w / 4 + w / 8).toFixed(0) + ' ' + (h * (.25 + r() * .45)).toFixed(0);
      }).join(' ') + ' L' + w + ' ' + h + ' L0 ' + h + ' Z';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + hue + ',62%,50%)"/><stop offset="1" stop-color="hsl(' + ((hue + 70) % 360) + ',68%,36%)"/></linearGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#bg)"/>' + shapes +
      '<path d="' + pathD + '" fill="#fff" opacity=".14"/>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  window.BLOG_COVER = coverArt;
})();

UI.FPages.blog = function () {
  document.title = 'FRONTIER Journal | Tech news, reviews & guides';
  var state = { cat: 'All', q: '', page: 1, per: 6 };

  /* featured hero article */
  var feat = DATA.posts[DATA.posts.length - 1];
  qs('[data-feat-article]').innerHTML =
    '<article class="blog-card reveal in-view" style="grid-template-columns:1fr 1fr;display:grid">' +
    '<div class="blog-thumb" style="aspect-ratio:auto;min-height:300px"><img src="' + BLOG_COVER(feat, 720, 420) + '" alt=""><span class="badge hot blog-cat-badge">Featured · ' + feat.category + '</span></div>' +
    '<div class="blog-body" style="justify-content:center;padding:clamp(20px,4vw,40px)"><h2 style="font-size:clamp(1.4rem,2.6vw,2rem)"><a href="blog-post.html?id=' + feat.id + '">' + feat.title + '</a></h2>' +
    '<p class="text-dim">' + feat.excerpt + '</p>' +
    '<div class="blog-meta"><span class="avatar sm">' + feat.author[0] + '</span><div><b class="small">' + feat.author + '</b><br><time datetime="' + feat.date + '" class="tiny">' + new Date(feat.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' · ' + feat.readTime + ' min read</time></div>' +
    '<a class="btn btn-primary btn-sm" style="margin-left:auto" href="blog-post.html?id=' + feat.id + '">Read story</a></div></div></article>';

  /* sidebar popular */
  qs('[data-popular-posts]').innerHTML = DATA.popularPosts.map(function (p) {
    return '<a href="blog-post.html?id=' + p.id + '" class="flex" style="gap:12px;padding:10px;border-radius:12px;align-items:center;transition:background .15s" onmouseover="this.style.background=\'var(--surface-2)\'" onmouseout="this.style.background=\'\'">' +
      '<b class="mono grad-text" style="font-size:1.4rem;width:26px;flex-shrink:0">' + String(p.id).padStart(2, '0') + '</b>' +
      '<div><b class="small" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + p.title + '</b><span class="tiny text-dim">' + p.readTime + ' min · ' + p.category + '</span></div></a>';
  }).join('');

  qs('[data-tag-cloud]').innerHTML = ['audio', 'phones', 'ai', 'privacy', 'laptops', 'wearables', 'smart-home', 'gaming', 'cameras', 'batteries'].map(function (t) {
    return '<button class="chip" data-tagq="' + t + '">' + t + '</button>';
  }).join('');

  function render(keepScroll) {
    var list = DATA.posts.filter(function (p) {
      if (state.cat !== 'All' && p.category !== state.cat) return false;
      if (state.q && (p.title + ' ' + p.excerpt + ' ' + p.tags.join(' ')).toLowerCase().indexOf(state.q.toLowerCase()) === -1) return false;
      return true;
    });
    var pages = Math.max(1, Math.ceil(list.length / state.per));
    if (state.page > pages) state.page = pages;
    var slice = list.slice((state.page - 1) * state.per, state.page * state.per);

    qs('[data-blog-grid]').innerHTML = slice.length ? slice.map(function (p, i) {
      return '<article class="blog-card reveal" data-delay="' + i % 4 + '">' +
        '<div class="blog-thumb"><img src="' + BLOG_COVER(p) + '" alt="" loading="lazy"><span class="badge soft blog-cat-badge">' + p.category + '</span></div>' +
        '<div class="blog-body"><h3 style="font-size:1.04rem;line-height:1.35"><a href="blog-post.html?id=' + p.id + '">' + p.title + '</a></h3>' +
        '<p class="blog-excerpt">' + p.excerpt + '</p>' +
        '<div class="blog-meta"><span class="avatar sm">' + p.author[0] + '</span><span>' + p.author.split(' ')[0] + '</span><span aria-hidden="true">·</span>' +
        '<time datetime="' + p.date + '">' + new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</time><span aria-hidden="true">·</span><span>' + p.readTime + ' min</span></div></div></article>';
    }).join('') : '<div class="empty-state" style="grid-column:1/-1"><div class="art">' + FR_ICON('search', 38) + '</div><h3>No articles found</h3><p class="text-dim small">Try another category or search term.</p></div>';

    /* pagination */
    qs('[data-blog-pager]').innerHTML = pages > 1
      ? '<button class="page-btn" data-bp="prev" aria-label="Previous page"' + (state.page === 1 ? ' disabled' : '') + '>' + FR_ICON('chevLeft', 15) + '</button>' +
        Array.apply(null, Array(pages)).map(function (_, i) {
          return '<button class="page-btn' + (i + 1 === state.page ? ' active' : '') + '" data-bp="' + (i + 1) + '">' + (i + 1) + '</button>';
        }).join('') +
        '<button class="page-btn" data-bp="next" aria-label="Next page"' + (state.page === pages ? ' disabled' : '') + '>' + FR_ICON('chevRight', 15) + '</button>'
      : '';

    UI.observeNew();
    if (!keepScroll) window.scrollTo({ top: qs('.section-head').offsetTop - 120, behavior: 'smooth' });
  }

  qsa('[data-blog-cat]').forEach(function (chip) {
    chip.classList.toggle('active', chip.dataset.blogCat === 'All');
    chip.addEventListener('click', function () {
      state.cat = chip.dataset.blogCat; state.page = 1;
      qsa('[data-blog-cat]').forEach(function (c) { c.classList.toggle('active', c === chip); });
      render();
    });
  });

  qs('[data-blog-search]').addEventListener('input', UI.debounce(function (e) {
    state.q = e.target.value; state.page = 1; render(true);
  }, 200));

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tagq]');
    if (t) { state.q = t.dataset.tagq; qs('[data-blog-search]').value = state.q; render(); }
    var bp = e.target.closest('[data-bp]');
    if (bp && !bp.disabled) {
      if (bp.dataset.bp === 'prev') state.page--;
      else if (bp.dataset.bp === 'next') state.page++;
      else state.page = +bp.dataset.bp;
      render();
    }
  });

  render(true);
};

/* ================= BLOG DETAIL ================= */
UI.FPages['blog-post'] = function () {
  var id = parseInt(UI.getParam('id'), 10);
  var post = DATA.posts.filter(function (p) { return p.id === id; })[0] || DATA.posts[0];
  document.title = post.title + ' | FRONTIER Journal';

  qs('[data-article]').innerHTML =
    '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">/</span><a href="blog.html">Journal</a><span class="sep">/</span><span class="current">' + post.title.slice(0, 42) + '…</span></nav>' +
    '<div class="pd-layout" style="margin-top:6px">' +
    '<article class="legal-doc">' +
    '<span class="badge hot">' + post.category + '</span>' +
    '<h1 style="margin-top:14px;font-size:clamp(1.7rem,3.4vw,2.6rem);line-height:1.15">' + post.title + '</h1>' +
    '<div class="blog-meta" style="border:none;padding-block:14px;font-size:.85rem"><span class="avatar sm">' + post.author[0] + '</span>' +
    '<div><b class="small">' + post.author + '</b> <span class="tiny text-dim">· ' + post.authorRole + '</span></div>' +
    '<time datetime="' + post.date + '">' + new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '</time>' +
    '<span class="tiny mono">' + FR_ICON('clock', 13) + ' ' + post.readTime + ' min</span>' +
    '<button class="icon-btn tooltip-host" id="copyLinkBtn" aria-label="Copy article link" style="width:34px;height:34px">' + FR_ICON('link', 15) + '<span class="tip">Copy link</span></button></div>' +
    '<img src="' + BLOG_COVER(post, 900, 480) + '" alt="Article illustration" style="border-radius:var(--r-lg);width:100%;aspect-ratio:16/9;object-fit:cover">' +
    '<div style="margin-top:26px;max-width:72ch">' + post.body + '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:30px">' + post.tags.map(function (t) { return '<a class="chip removable" href="search.html?q=' + encodeURIComponent(t) + '"> #' + t + '</a>'; }).join('') + '</div>' +

    '<aside class="co-panel" style="display:flex;gap:16px;margin-top:38px;align-items:center">' +
    '<span class="avatar lg">' + post.author[0] + '</span><div><b>' + post.author + '</b><br><span class="small text-dim">' + post.authorBio + '</span>' +
    '<div style="display:flex;gap:8px;margin-top:10px">' + ['X', 'IG', 'YT'].map(function (s) { return '<span class="pay-badge">' + s + '</span>'; }).join('') + '</div></div></aside>' +

    '<section id="comments" style="margin-top:44px"><h2>Comments <span class="badge soft" data-c-count>2</span></h2>' +
    '<div class="review-item" style="display:flex;gap:14px"><span class="avatar">R</span><div><b>Riley Kim</b> <span class="tiny text-dim">2 days ago</span>' +
    '<p class="small text-dim" style="margin-top:6px">The thermal notes match my experience exactly — sustained workloads are where the marketing photos end.</p>' +
    '<div style="display:flex;gap:12px;margin-top:8px"><button class="btn btn-link tiny" onclick="UI.toast(\'info\',\'Liked!\')">♥ Like (24)</button><button class="btn btn-link tiny" onclick="document.getElementById(\'commentFormMessage\').focus()">Reply</button></div></div></div>' +
    '<div class="review-item" style="display:flex;gap:14px;border-bottom:none"><span class="avatar" style="background:var(--grad-hot)">T</span><div><b>Tomas Vrba</b> <span class="tiny text-dim">5 hours ago</span>' +
    '<p class="small text-dim" style="margin-top:6px">Anyone tested this alongside last year’s model? Curious if the upgrade math works.</p>' +
    '<div style="display:flex;gap:12px;margin-top:8px"><button class="btn btn-link tiny" onclick="UI.toast(\'info\',\'Liked!\')">♥ Like (7)</button><button class="btn btn-link tiny" onclick="document.getElementById(\'commentFormMessage\').focus()">Reply</button></div></div></div>' +
    '<form class="co-panel" id="cform" style="margin-top:22px"><h3 class="small">Leave a comment</h3>' +
    '<div class="field" style="margin-top:12px"><label for="cname">Name</label><input class="input" id="cname" required placeholder="Display name"></div>' +
    '<div class="field"><label for="cmail">Email <span class="text-dim tiny">(not published)</span></label><input class="input" type="email" id="cmail" required placeholder="you@email.com"></div>' +
    '<div class="field"><label for="commentFormMessage">Comment</label><textarea class="input" id="commentFormMessage" required placeholder="Be kind. Be curious."></textarea></div>' +
    '<button class="btn btn-primary" type="submit">Post comment</button></form></section>' +
    '</article>' +

    '<aside style="position:sticky;top:96px;display:grid;gap:22px;align-self:start">' +
    '<div class="co-panel"><h3 class="small" style="margin-bottom:10px">Share this story</h3><div class="social-btns">' +
    [['X / Twitter', 'share'], ['Copy link', 'link']].map(function (s, i) {
      return '<button class="social-btn" ' + (i === 1 ? 'id="shareCopy"' : '') + '>' + FR_ICON(s[1], 16) + s[0] + '</button>';
    }).join('') + '</div></div>' +
    '<div class="co-panel"><h3 class="small" style="margin-bottom:10px">Related articles</h3>' +
    relatedHtml(post) + '</div>' +
    '<div class="news-band" style="padding:28px"><h3 style="font-size:1.05rem;color:#fff">Get stories like this weekly</h3>' +
    '<form data-inline-news style="max-width:none;margin-top:16px;background:rgba(255,255,255,.16)"><input type="email" required placeholder="Email address" aria-label="Email"><button class="btn btn-sm" style="background:#fff;color:#151527" type="submit">Join</button></form></div>' +
    '</aside></div>';

  function relatedHtml(post) {
    return DATA.posts.filter(function (x) { return x.id !== post.id && (x.category === post.category || x.tags.some(function (t) { return post.tags.indexOf(t) !== -1; })); })
      .slice(0, 3).map(function (rp) {
        return '<a class="flex" style="gap:11px;padding:9px 0;border-bottom:1px dashed var(--border-soft)" href="blog-post.html?id=' + rp.id + '">' +
          '<img src="' + BLOG_COVER(rp, 90, 60) + '" style="width:74px;height:52px;border-radius:8px;object-fit:cover;flex-shrink:0" alt="">' +
          '<span class="small" style="-webkit-line-clamp:2;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden">' + rp.title + '</span></a>';
      }).join('');
  }

  qs('#cform').addEventListener('submit', function (e) {
    e.preventDefault();
    UI.toast('success', 'Comment posted!', '(Demo moderation approves kind comments instantly.)');
    e.target.reset();
  });
  function copyStory(url) {
    navigator.clipboard && navigator.clipboard.writeText(url);
    UI.toast('success', 'Copied!', url);
  }
  qs('#copyLinkBtn').addEventListener('click', function () { copyStory(location.href); });
  qs('#shareCopy').addEventListener('click', function () { copyStory(location.href); });

  var inlineNews = qs('[data-inline-news]');
  inlineNews.addEventListener('submit', function (e) {
    e.preventDefault();
    UI.toast('success', 'You are in!', 'First digest arrives Thursday.');
    inlineNews.reset();
  });
};
