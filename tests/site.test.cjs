const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = ['index.html', 'article.html', 'article-02.html', 'article-03.html', 'article-04.html', 'article-05.html', 'article-06.html', 'article-07.html', 'article-08.html', 'article-09.html', 'article-10.html', 'behind-the-breach-01.html', 'behind-the-breach-02.html', 'behind-the-breach-03.html', 'behind-the-breach-04.html', 'series.html', 'security-in-5-minutes-01.html', 'security-in-5-minutes-02.html', 'security-in-5-minutes-03.html', 'security-in-5-minutes-04.html', 'security-in-5-minutes-05.html', 'security-in-5-minutes-06.html', 'security-in-5-minutes-07.html', 'security-in-5-minutes-08.html', 'security-in-5-minutes-09.html', 'security-in-5-minutes-10.html', 'threat-of-the-week-01.html', 'threat-of-the-week-02.html', 'threat-of-the-week-03.html', 'threat-of-the-week-04.html', 'threat-of-the-week-05.html', 'threat-of-the-week-06.html', 'threat-of-the-week-07.html', 'threat-of-the-week-08.html', 'threat-of-the-week-09.html', 'threat-of-the-week-10.html', 'playbook-monday-01.html', 'playbook-monday-02.html', 'playbook-monday-03.html', 'playbook-monday-04.html', 'playbook-monday-05.html', 'playbook-monday-06.html', 'playbook-monday-07.html', 'playbook-monday-08.html', 'playbook-monday-09.html', 'playbook-monday-10.html', 'myth-vs-reality-01.html', 'myth-vs-reality-02.html', 'myth-vs-reality-03.html', 'myth-vs-reality-04.html', 'myth-vs-reality-05.html', 'myth-vs-reality-06.html', 'myth-vs-reality-07.html', 'myth-vs-reality-08.html', 'myth-vs-reality-09.html'];

function boot(file, { stored = {}, sessionStored = {}, storageBlocked = false, search = '', hash = '', scripts } = {}) {
  const { document, window: dom } = parseHTML(read(file));
  document.cookie = '';
  const values = new Map(Object.entries(stored));
  const sessionValues = new Map(Object.entries(sessionStored));
  const location = { pathname: '/the-digital-watch/' + file, search, hash,
    hostname: 'example.test', href: 'https://example.test/the-digital-watch/' + file + search + hash,
    replace(url) { this.redirect = url; }, reload() { this.reloaded = true; } };
  const clipboard = [];
  const context = {
    document, location, URLSearchParams, console,
    Event: dom.Event,
    navigator: { clipboard: { writeText: async text => clipboard.push(text) } },
    localStorage: {
      getItem(key) { if (storageBlocked) throw Error('Storage denied'); return values.get(key) ?? null; },
      setItem(key, value) { if (storageBlocked) throw Error('Storage denied'); values.set(key, value); },
      removeItem(key) { if (storageBlocked) throw Error('Storage denied'); values.delete(key); }
    },
    sessionStorage: {
      getItem(key) { if (storageBlocked) throw Error('Storage denied'); return sessionValues.get(key) ?? null; },
      setItem(key, value) { if (storageBlocked) throw Error('Storage denied'); sessionValues.set(key, value); },
      removeItem(key) { if (storageBlocked) throw Error('Storage denied'); sessionValues.delete(key); }
    },
    history: { pushState(_state, _title, url) { location.hash = url; } },
    getComputedStyle: () => ({ getPropertyValue: () => '66' }),
    matchMedia: () => ({ matches: false }),
    setTimeout() { return 1; }, clearTimeout() {}, setInterval() { return 1; }, clearInterval() {},
    addEventListener() {}, scrollTo() {}, innerHeight: 800, scrollY: 0,
    IntersectionObserver: class { observe() {} }
  };
  context.window = context;
  vm.createContext(context);
  for (const script of document.querySelectorAll('script')) {
    if (script.type === 'application/ld+json') continue;
    const src = script.getAttribute('src');
    if (src && /^https?:/.test(src)) continue;
    const source = src ? (scripts?.[src.split('?')[0]] ?? read(src.split('?')[0])) : script.textContent;
    vm.runInContext(source, context, { filename: src || file + ':inline' });
  }
  document.dispatchEvent(new dom.Event('DOMContentLoaded'));
  return { document, context, location, values, sessionValues, clipboard,
    fire(node, type) { node.dispatchEvent(new dom.Event(type, { bubbles: true, cancelable: true })); } };
}

test('all public pages initialize when browser storage is denied or corrupted', () => {
  for (const file of pages) {
    for (const options of [{ storageBlocked: true }, { stored: { dw_posts: 'null', dw_settings: 'null', threatbrief_ep02: 'null' } }]) {
      const app = boot(file, options);
      assert.ok(app.document.querySelector('#ciFloatingTranslateBtn'));
      if (file !== 'index.html') assert.equal(app.document.querySelector('#fbForm').hidden, false);
    }
  }
});

test('old browser drafts cannot replace deployed article content', () => {
  const app = boot('article-03.html', { stored: {
    dw_posts: JSON.stringify([{ episodeNum: 3, slug: 'ep03-clicked-phishing-link', title: 'Stale draft', status: 'draft', tags: [] }]),
    dw_settings: JSON.stringify({ blogName: 'Outdated brand' })
  } });
  assert.match(app.document.title, /I Clicked a Phishing Link/);
  assert.match(app.document.title, /Cyber Insight/);
  assert.equal(app.context.CI_CMS.getPosts().filter(p => p.status === 'published').length, 10);
});

test('progress percentage and released-episode label update independently', () => {
  const { document } = boot('index.html');
  assert.equal(document.querySelector('#seriesReleased').textContent, 'Episode 10 of 10 Released');
  assert.equal(document.querySelector('#seriesCompletion').textContent, '100% Complete');
  assert.equal(document.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'), '100');
});

test('filters show the right cards and expose their selected state', () => {
  const app = boot('index.html');
  for (const [filter, count] of [['published', 10], ['upcoming', 0], ['all', 10]]) {
    const btn = app.document.querySelector(`[data-filter="${filter}"]`);
    app.fire(btn, 'click');
    assert.equal([...app.document.querySelectorAll('.ep-card')].filter(el => el.style.display !== 'none').length, count);
    assert.equal(btn.getAttribute('aria-pressed'), 'true');
    assert.equal(app.document.querySelectorAll('.series-tab-btn[aria-pressed="true"]').length, 1);
  }
});

test('article IDs resolve symmetrically and preserve feedback anchors', () => {
  const expected = [
    ['article.html', 'ep03-clicked-phishing-link', 'article-03.html#feedback'],
    ['article-03.html', 'ep01-can-you-still-trust', 'article.html#feedback'],
    ['article-03.html', 'ep02-someone-has-your-email', 'article-02.html#feedback'],
    ['article.html', 'missing-post', 'index.html#series'],
    ['article.html', 'ep04-session-was-stolen', 'article-04.html#feedback'],
    ['article.html', 'ep05-padlock-doesnt-mean-safe', 'article-05.html#feedback'],
    ['article.html', 'ep06-are-passkeys-killing-passwords', 'article-06.html#feedback'],
    ['article.html', 'ep07-fake-recruiter-linkedin', 'article-07.html#feedback'],
    ['article.html', 'ep08-what-scammer-learns-in-10-minutes', 'article-08.html#feedback'],
    ['article.html', 'ep09-your-bank-is-calling', 'article-09.html#feedback'],
    ['article.html', 'ep10-after-data-breach', 'article-10.html#feedback']
  ];
  for (const [file, id, target] of expected) {
    assert.equal(boot(file, { search: '?id=' + id, hash: '#feedback' }).location.redirect, target);
  }
});

test('mobile menu closes after navigation and Escape', () => {
  const app = boot('index.html');
  const btn = app.document.querySelector('#mBtn');
  app.fire(btn, 'click');
  assert.equal(btn.getAttribute('aria-expanded'), 'true');
  app.fire(app.document.querySelector('#navLinks a[href="#behind-the-breach"]'), 'click');
  assert.equal(btn.getAttribute('aria-expanded'), 'false');
  app.fire(btn, 'click');
  vm.runInContext("const escapeEvent = new Event('keydown'); escapeEvent.key = 'Escape'; document.dispatchEvent(escapeEvent);", app.context);
  assert.equal(btn.getAttribute('aria-expanded'), 'false');
});

test('feedback prepares an encoded draft without claiming delivery or losing text', async () => {
  const app = boot('article-02.html');
  app.document.querySelector('#fbName').value = 'Reader & Friend';
  app.document.querySelector('#fbMessage').value = 'Question: A & B? <script>test</script>\nNew line';
  app.fire(app.document.querySelector('#fbForm'), 'submit');
  const uri = new URL(app.document.querySelector('#fbEmailLink').getAttribute('href'));
  assert.equal(uri.protocol, 'mailto:');
  assert.equal(uri.pathname, 'sujampathirathnayaka@gmail.com');
  assert.match(uri.searchParams.get('body'), /Question: A & B\? <script>test<\/script>\nNew line/);
  assert.match(uri.searchParams.get('body'), /thecyberinsight\.online\/article-02\.html/);
  assert.match(app.document.querySelector('#fbStatus').textContent, /Nothing has been sent/);
  assert.match(app.document.querySelector('#fbMessage').value, /Question/);
  assert.equal(app.values.has('ci_reader_comments_v1'), false);
  app.fire(app.document.querySelector('#fbCopy'), 'click');
  await Promise.resolve();
  assert.match(app.clipboard[0], /Reader & Friend/);
  app.fire(app.document.querySelector('#fbMessage'), 'input');
  assert.equal(app.document.querySelector('#fbEmailPreview').hidden, true);
});

test('clipboard absence is handled without an exception or lost feedback', async () => {
  const app = boot('article.html');
  app.context.navigator = {};
  await app.context.copyLink();
  assert.match(app.document.querySelector('#toast-container').textContent, /Copy the page address/);
});

test('personal reactions still toggle with storage blocked', () => {
  const app = boot('article-02.html', { storageBlocked: true });
  app.context.toggleLike();
  assert.equal(app.document.querySelector('.btn-like').getAttribute('aria-pressed'), 'true');
  app.context.toggleLike();
  assert.equal(app.document.querySelector('.btn-like').getAttribute('aria-pressed'), 'false');
});

test('triage checkboxes survive switching scenarios', () => {
  const app = boot('article-03.html');
  const check = app.document.querySelector('#triageOutput input');
  check.checked = true;
  app.fire(check, 'change');
  app.fire(app.document.querySelector('[data-scenario="password"]'), 'click');
  assert.match(app.document.querySelector('#triageOutput').textContent, /Entered Account Password/);
  app.fire(app.document.querySelector('[data-scenario="only-clicked"]'), 'click');
  assert.equal(app.document.querySelector('#triageOutput input').hasAttribute('checked'), true);
  assert.equal(app.document.querySelectorAll('.triage-btn[aria-pressed="true"]').length, 1);
});

test('translation provider failures do not reload the page and discard drafts', () => {
  const app = boot('article-03.html', { storageBlocked: true });
  app.context.CITranslator.setLanguage('si');
  assert.equal(app.location.reloaded, undefined);
  assert.match(app.document.querySelector('#toast-container').textContent, /Translation is unavailable/);
});

test('all local links and assets exist; no broken fragment targets', () => {
  for (const file of pages) {
    const { document } = parseHTML(read(file));
    for (const el of document.querySelectorAll('a[href],link[href],script[src]')) {
      const href = el.getAttribute('href') || el.getAttribute('src');
      if (!href || /^(?:[a-z]+:|\/\/)/i.test(href)) continue;
      const [filePart, fragment] = href.split('#');
      const target = filePart.split('?')[0] || file;
      assert.ok(fs.existsSync(path.join(root, target)), `${file}: ${href}`);
      if (fragment) {
        const { document: targetDoc } = parseHTML(read(target));
        assert.ok(targetDoc.getElementById(decodeURIComponent(fragment)), `${file}: missing ${href}`);
      }
    }
  }
});

test('deployment contains public pages and security policy, excludes the local editor', () => {
  execFileSync(process.execPath, ['scripts/build-public.mjs'], { cwd: root });
  assert.ok(fs.existsSync(path.join(root, 'dist/.well-known/security.txt')));
  assert.ok(fs.existsSync(path.join(root, 'dist/.nojekyll')));
  assert.ok(fs.existsSync(path.join(root, 'dist/article-04.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/article-05.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/article-06.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/article-07.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/article-08.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/article-09.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/article-10.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/behind-the-breach-01.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/behind-the-breach-02.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/behind-the-breach-03.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/behind-the-breach-04.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/series.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/myth-vs-reality-09.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/myth-vs-reality-08.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/myth-vs-reality-07.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/myth-vs-reality-06.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/myth-vs-reality-05.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/myth-vs-reality-04.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/myth-vs-reality-03.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/myth-vs-reality-02.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/myth-vs-reality-01.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/playbook-monday-10.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/playbook-monday-09.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/playbook-monday-08.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/playbook-monday-07.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/playbook-monday-06.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/playbook-monday-05.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/playbook-monday-04.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/playbook-monday-03.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/playbook-monday-02.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/playbook-monday-01.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/threat-of-the-week-10.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/threat-of-the-week-09.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/threat-of-the-week-08.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/threat-of-the-week-07.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/threat-of-the-week-06.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/threat-of-the-week-05.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/threat-of-the-week-04.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/threat-of-the-week-03.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/threat-of-the-week-02.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/threat-of-the-week-01.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/security-in-5-minutes-10.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/security-in-5-minutes-09.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/security-in-5-minutes-08.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/security-in-5-minutes-07.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/security-in-5-minutes-06.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/security-in-5-minutes-05.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/security-in-5-minutes-04.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/security-in-5-minutes-03.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/security-in-5-minutes-02.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/security-in-5-minutes-01.html')));
  assert.ok(fs.existsSync(path.join(root, 'dist/sitemap.xml')));
  assert.ok(fs.existsSync(path.join(root, 'dist/CNAME')));
  for (const file of ['admin.html', 'js/admin.js', 'node_modules', 'tests', '.git']) {
    assert.equal(fs.existsSync(path.join(root, 'dist', file)), false, file);
  }
  assert.deepEqual(fs.readdirSync(path.join(root, '.github/workflows')), ['deploy.yml']);
});

test('local editor helpers do not recurse into the CMS delegates', () => {
  const app = boot('admin.html');
  assert.equal(app.context.getPosts().length, 10);
  assert.equal(app.context.getSettings().blogName, 'Cyber Insight');
});

test('unfinished feedback survives refresh and stays scoped to its article', () => {
  const app = boot('article-02.html');
  app.document.querySelector('#fbName').value = 'Reader';
  app.document.querySelector('#fbMessage').value = 'Keep my unfinished question';
  app.fire(app.document.querySelector('#fbMessage'), 'input');
  const sessionStored = Object.fromEntries(app.sessionValues);
  const refreshed = boot('article-02.html', { sessionStored });
  assert.equal(refreshed.document.querySelector('#fbMessage').value, 'Keep my unfinished question');
  assert.equal(refreshed.document.querySelector('#fbName').value, 'Reader');
  const otherArticle = boot('article-03.html', { sessionStored });
  assert.equal(otherArticle.document.querySelector('#fbMessage').value, '');
  assert.equal(app.values.has('threatbrief_ep02_feedback_draft'), false);
});

test('category changes invalidate prepared feedback and clear draft removes saved text', () => {
  const app = boot('article-02.html');
  app.document.querySelector('#fbMessage').value = 'A question';
  app.fire(app.document.querySelector('#fbForm'), 'submit');
  assert.equal(app.document.querySelector('#fbEmailPreview').hidden, false);
  app.fire(app.document.querySelector('#fbCategory'), 'change');
  assert.equal(app.document.querySelector('#fbEmailPreview').hidden, true);
  assert.equal(app.document.querySelector('#fbEmailLink').getAttribute('href'), null);
  app.fire(app.document.querySelector('#fbClear'), 'click');
  assert.equal(app.document.querySelector('#fbMessage').value, '');
  assert.equal(app.sessionValues.size, 0);
});

test('long feedback stays complete in the copy route instead of an oversized email link', () => {
  const app = boot('article-02.html');
  const message = 'Helpful article. '.repeat(110);
  app.document.querySelector('#fbMessage').value = message;
  app.fire(app.document.querySelector('#fbForm'), 'submit');
  assert.equal(app.document.querySelector('#fbEmailLink').hidden, true);
  assert.ok(app.document.querySelector('#fbEmailBody').value.endsWith(message.trim()));
  assert.match(app.document.querySelector('#fbStatus').textContent, /use Copy feedback/);
});

test('feedback works with denied storage and clipboard', async () => {
  const app = boot('article-02.html', { storageBlocked: true });
  app.context.navigator = {};
  app.document.querySelector('#fbMessage').value = 'Keep this question visible';
  app.fire(app.document.querySelector('#fbForm'), 'submit');
  assert.equal(app.document.querySelector('#fbEmailPreview').hidden, false);
  let selected = false;
  app.document.querySelector('#fbEmailBody').select = () => { selected = true; };
  app.fire(app.document.querySelector('#fbCopy'), 'click');
  await Promise.resolve();
  assert.equal(selected, true);
  assert.match(app.document.querySelector('#fbStatus').textContent, /Automatic copying is unavailable/);
  assert.match(app.document.querySelector('#fbDraftNote').textContent, /saving is unavailable/);
});

test('malformed saved feedback cannot disable the form', () => {
  for (const value of ['{broken', 'null', '[]', '{"message":{},"name":12}']) {
    const app = boot('article-02.html', { sessionStored: { threatbrief_ep02_feedback_draft: value } });
    app.document.querySelector('#fbMessage').value = 'New feedback';
    app.fire(app.document.querySelector('#fbForm'), 'submit');
    assert.equal(app.document.querySelector('#fbEmailPreview').hidden, false);
  }
});

test('table of contents sidebar panel is cleanly removed across all articles', () => {
  const articles = pages.filter(p => p.startsWith('article') || p.startsWith('behind-the-breach'));
  for (const file of articles) {
    const app = boot(file);
    const sidebar = app.document.querySelector('.art-toc-sidebar');
    const header = app.document.querySelector('.toc-header');
    const center = app.document.querySelector('.art-center');

    assert.equal(sidebar, null, `art-toc-sidebar should not exist in ${file}`);
    assert.equal(header, null, `toc-header should not exist in ${file}`);
    assert.ok(center, `art-center main content container exists in ${file}`);
  }
});

test('attack map node source links point to exact primary research and articles', () => {
  const app = boot('behind-the-breach-01.html');
  const node = app.document.querySelector('.am-node[data-node-id="customer-data-collection"]');
  assert.ok(node, 'customer-data-collection node exists');
  app.fire(node, 'click');
  const sourceLink = app.document.querySelector('#amDrawerSourceLink');
  assert.ok(sourceLink, 'drawer source link exists');
  assert.equal(sourceLink.getAttribute('href'), 'https://scotthelme.co.uk/no-hacking-required-manchester-airports-group-data-breach/');
  assert.match(sourceLink.textContent, /Scott Helme/);

  const hipaaSource = app.document.querySelector('#src-20 a');
  assert.ok(hipaaSource, 'src-20 link exists');
  assert.equal(hipaaSource.getAttribute('href'), 'https://www.hipaajournal.com/novo-nordisk-cyberattack/');
});

test('theme toggle switches and updates data-theme attribute', () => {
  const app = boot('behind-the-breach-01.html');
  assert.equal(app.document.documentElement.getAttribute('data-theme'), 'light');
  app.context.toggleTheme();
  assert.equal(app.document.documentElement.getAttribute('data-theme'), 'dark');
  app.context.toggleTheme();
  assert.equal(app.document.documentElement.getAttribute('data-theme'), 'light');
});

test('live news update feed renders dispatches and filters by category', () => {
  const app = boot('behind-the-breach-02.html');
  const feed = app.document.querySelector('#live-news-updates');
  assert.ok(feed, 'live-news-updates section exists');

  const items = app.document.querySelectorAll('.live-feed-item');
  assert.equal(items.length, 5, 'renders 5 live dispatches');

  const officialBtn = app.document.querySelector('.live-feed-filter-btn[data-filter="official"]');
  assert.ok(officialBtn, 'official filter button exists');
  app.fire(officialBtn, 'click');

  assert.equal(officialBtn.getAttribute('aria-pressed'), 'true');
  const visibleOfficial = [...app.document.querySelectorAll('.live-feed-item')].filter(el => el.style.display !== 'none');
  assert.equal(visibleOfficial.length, 1);

  const allBtn = app.document.querySelector('.live-feed-filter-btn[data-filter="all"]');
  app.fire(allBtn, 'click');
  assert.equal(allBtn.getAttribute('aria-pressed'), 'true');
  const visibleAll = [...app.document.querySelectorAll('.live-feed-item')].filter(el => el.style.display !== 'none');
  assert.equal(visibleAll.length, 5);
});

test('all public pages enforce nosniff and strict-origin referrer security policies', () => {
  for (const file of pages) {
    const { document } = parseHTML(read(file));
    const referrer = document.querySelector('meta[name="referrer"]');
    assert.ok(referrer, `${file} missing meta[name="referrer"]`);
    assert.equal(referrer.getAttribute('content'), 'strict-origin-when-cross-origin');

    const nosniff = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
    assert.ok(nosniff, `${file} missing meta[http-equiv="X-Content-Type-Options"]`);
    assert.equal(nosniff.getAttribute('content'), 'nosniff');
  }
});

test('behind-the-breach-04 renders Anthropic incident details, live dispatches, and defender checklist', () => {
  const app = boot('behind-the-breach-04.html');
  assert.equal(app.document.body.dataset.articleId, 'breach04');

  const card = app.document.querySelector('#incident-at-a-glance');
  assert.ok(card, 'incident-at-a-glance card exists');
  assert.match(card.textContent, /Cathedral/);
  assert.match(card.textContent, /Anthropic/);

  const stats = app.document.querySelectorAll('.stat-c');
  assert.equal(stats.length, 3, 'renders 3 key statistics');
  assert.match(stats[0].textContent, /< 12 Hours/);

  const feed = app.document.querySelector('#live-news-updates');
  assert.ok(feed, 'live-news-updates feed exists');
  const items = app.document.querySelectorAll('.live-feed-item');
  assert.equal(items.length, 5, 'renders 5 live dispatches');

  const anthropicBtn = app.document.querySelector('.live-feed-filter-btn[data-filter="anthropic"]');
  assert.ok(anthropicBtn, 'anthropic filter button exists');
  app.fire(anthropicBtn, 'click');
  assert.equal(anthropicBtn.getAttribute('aria-pressed'), 'true');
  const visibleAnthropic = [...app.document.querySelectorAll('.live-feed-item')].filter(el => el.style.display !== 'none');
  assert.equal(visibleAnthropic.length, 1);

  const checklist = app.document.querySelectorAll('#chkListContainer input[type="checkbox"]');
  assert.equal(checklist.length, 10, 'renders 10 defender checklist items');
});


test('series hub lists 5 Season 1 series of 10 episodes and every dropdown links to it', () => {
  const app = boot('series.html');
  const cards = app.document.querySelectorAll('.sh-card');
  assert.equal(cards.length, 5);
  for (const card of cards) assert.equal(card.querySelectorAll('.sh-eps li').length, 10, card.id);
  for (const file of pages.filter(p => p !== 'series.html' && p !== 'index.html')) {
    const { document } = parseHTML(read(file));
    const links = [...document.querySelectorAll('.series-drop-season-list a')].map(a => a.getAttribute('href'));
    assert.equal(links.length, 5, file);
    for (const href of links) assert.ok(app.document.getElementById(href.split('#')[1]), href);
  }
});
