/* Hub-page behaviour: reading progress, chip filters, the episode archive
   and search. Menu, theme and feedback stay in app.js. Everything here works
   on markup that is already in the page, so the pages read fine without it. */
(function () {
  'use strict';
  var all = function (sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); };
  var fileOf = function (href) { return String(href || '').split('#')[0].split('?')[0].split('/').pop(); };

  /* ── Which episodes this reader has opened (kept on this device only) ── */
  var KEY = 'ci_read_files';
  var read = [];
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (Array.isArray(saved)) read = saved.filter(function (f) { return typeof f === 'string'; });
    // Earlier versions stored episode numbers of the original series.
    var old = JSON.parse(localStorage.getItem('ci-read') || '[]');
    if (Array.isArray(old)) old.forEach(function (n) {
      var f = n === 1 ? 'article.html' : 'article-' + (n < 10 ? '0' : '') + n + '.html';
      if (n >= 1 && n <= 10 && read.indexOf(f) < 0) read.push(f);
    });
  } catch (e) { read = []; }

  function paintRead() {
    all('a[data-read]').forEach(function (a) {
      var item = a.closest('.row, .ep-card');
      if (item) item.classList.toggle('is-read', read.indexOf(fileOf(a.getAttribute('href'))) > -1);
    });
    all('[data-progress-for]').forEach(function (row) {
      var id = row.getAttribute('data-progress-for');
      var detail = document.getElementById(id);
      if (!detail) return;
      var links = all('a[data-read]', detail);
      var done = links.filter(function (a) { return read.indexOf(fileOf(a.getAttribute('href'))) > -1; }).length;
      var label = done + ' / ' + links.length + ' read';
      var bar = row.querySelector('.p-bar'), text = row.querySelector('.p-text');
      if (bar) { bar.setAttribute('aria-valuenow', String(done)); if (bar.firstElementChild) bar.firstElementChild.style.width = (links.length ? done / links.length * 100 : 0) + '%'; }
      if (text) text.textContent = label;
      var tag = document.querySelector('[data-progress-label="' + id + '"]');
      if (tag) tag.textContent = label;
    });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-read]');
    if (!a) return;
    var f = fileOf(a.getAttribute('href'));
    if (f && read.indexOf(f) < 0) {
      read.push(f);
      try { localStorage.setItem(KEY, JSON.stringify(read)); } catch (err) { /* stays for this page view */ }
    }
  });
  window.addEventListener('pageshow', paintRead);
  paintRead();

  /* ── Chip filters (series list, investigations) ── */
  all('[data-filter-scope]').forEach(function (scope) {
    var chips = all('[data-chip]', scope), items = all('[data-tags]', scope), empty = scope.querySelector('[data-empty]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var want = chip.getAttribute('data-chip'), shown = 0;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        items.forEach(function (item) {
          var ok = want === 'all' || item.getAttribute('data-tags').split(' ').indexOf(want) > -1;
          item.hidden = !ok;
          if (ok) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  });

  /* ── Series hub: show the list, or the one series named in the address ── */
  var hub = document.getElementById('seriesHub');
  if (hub) {
    var details = all('.series-detail', hub), shownId = null;
    var showSeries = function () {
      var id = '';
      try { id = decodeURIComponent(String(location.hash || '').replace(/^.*#/, '')); } catch (e) { id = ''; }
      var open = details.filter(function (d) { return d.id === id; })[0] || null;
      details.forEach(function (d) { d.classList.toggle('is-open', d === open); });
      hub.classList.toggle('has-open', !!open);
      if ((open ? open.id : '') !== shownId) {
        if (shownId !== null) window.scrollTo(0, 0);
        shownId = open ? open.id : '';
      }
    };
    hub.classList.add('js-series');
    window.addEventListener('hashchange', showSeries);
    window.addEventListener('popstate', showSeries);
    // Other scripts move the address with pushState, which fires neither event.
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a[href]')) setTimeout(showSeries, 0);
    });
    showSeries();
  }

  var words = function (q) { return q.toLowerCase().split(/\s+/).filter(Boolean); };
  var matches = function (el, terms) {
    var text = el.getAttribute('data-text') || '';
    return terms.every(function (t) { return text.indexOf(t) > -1; });
  };

  /* ── Episode archive ── */
  var grid = document.getElementById('epGrid');
  if (grid) {
    var cards = all('.ep-item', grid);
    var q = document.getElementById('epSearch'), fs = document.getElementById('fSeries'),
      fd = document.getElementById('fDuration'), sort = document.getElementById('fSort'),
      count = document.getElementById('epCount'), none = document.getElementById('epEmpty');
    cards.forEach(function (c, i) { c.setAttribute('data-order', String(i)); });
    var apply = function () {
      var dur = fd.value || '', terms = words(q.value || ''), s = fs.value || '', d = dur.split('-'), shown = 0;
      cards.forEach(function (c) {
        var min = +c.getAttribute('data-min');
        var ok = matches(c, terms) && (!s || c.getAttribute('data-series') === s) && (!dur || (min >= +d[0] && min <= +d[1]));
        c.hidden = !ok;
        if (ok) shown++;
      });
      var by = sort.value || 'series';
      cards.slice().sort(function (a, b) {
        var diff = by === 'series' ? 0 : (+a.getAttribute('data-min') - +b.getAttribute('data-min')) * (by === 'long' ? -1 : 1);
        return diff || +a.getAttribute('data-order') - +b.getAttribute('data-order');
      }).forEach(function (c) { grid.appendChild(c); });
      count.textContent = shown === cards.length ? cards.length + ' episodes' : shown + ' of ' + cards.length + ' episodes';
      none.hidden = shown > 0;
    };
    q.addEventListener('input', apply);
    [fs, fd, sort].forEach(function (el) { el.addEventListener('change', apply); });
    try {
      var want = new URLSearchParams(location.search).get('series');
      if (want && all('option', fs).some(function (o) { return o.value === want; })) { fs.value = want; apply(); }
    } catch (e) { /* no query string support */ }
  }

  /* ── Search ── */
  var results = document.getElementById('results');
  if (results) {
    var rows = all('.result', results), input = document.getElementById('q'),
      tabs = all('#searchTabs [data-type]'), noResults = document.getElementById('searchEmpty'), type = 'all';
    var run = function () {
      var terms = words(input.value || ''), counts = { all: 0 }, shown = 0;
      rows.forEach(function (r) {
        var t = r.getAttribute('data-type'), hit = matches(r, terms);
        if (hit) { counts.all++; counts[t] = (counts[t] || 0) + 1; }
        var ok = hit && (type === 'all' || t === type);
        r.hidden = !ok;
        if (ok) shown++;
      });
      all('[data-count]').forEach(function (el) { el.textContent = String(counts[el.getAttribute('data-count')] || 0); });
      noResults.hidden = shown > 0;
    };
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        type = tab.getAttribute('data-type');
        tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t === tab)); });
        run();
      });
    });
    input.addEventListener('input', run);
    document.getElementById('searchForm').addEventListener('submit', function (e) { e.preventDefault(); run(); });
    try { input.value = new URLSearchParams(location.search).get('q') || ''; } catch (e) { /* ignore */ }
    run();
  }
})();
