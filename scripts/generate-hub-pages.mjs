// Generates the hub pages (home, series, episodes, GRC, investigations,
// shorts, about, search) from scripts/site-content.json so every listing,
// header and footer stays in step. Article pages are hand-written and are
// not touched. Run: node scripts/generate-hub-pages.mjs
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const content = JSON.parse(await readFile(new URL('scripts/site-content.json', root), 'utf8'));
const { series, investigations, shorts } = content;
const SITE = 'https://thecyberinsight.online/';
const YT = 'https://www.youtube.com/@CyberPocket26';
const V = '1';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = n => String(n).padStart(2, '0');
const fmtDate = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/* ── Icons (24px line icons, drawn for this site) ── */
const ICONS = {
  shield: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z M9 12l2 2 4-4',
  lock: 'M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3 M12 15v2',
  target: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 11.9v.2',
  book: 'M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z',
  scales: 'M12 4v16 M7 20h10 M5 7h14 M5 7l-3 7a3 3 0 0 0 6 0z M19 7l-3 7a3 3 0 0 0 6 0z',
  wrench: 'M15 5a4 4 0 0 0-4.6 5.4L4 16.8V20h3.2l6.4-6.4A4 4 0 0 0 19 9l-2.5 2.5-2.5-.5-.5-2.5L16 6z',
  wifi: 'M4 10a12 12 0 0 1 16 0 M7 13.5a7.5 7.5 0 0 1 10 0 M10 17a3 3 0 0 1 4 0 M12 20v.1',
  mail: 'M4 6h16v12H4z M4 7l8 6 8-6',
  alert: 'M12 4l9 16H3z M12 10v4 M12 17v.1',
  key: 'M8 15a4 4 0 1 1 3.9-5H21v3h-2v2h-3v-2h-4.1A4 4 0 0 1 8 15z M8 11v.1',
  phone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M11 18h2',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20 20l-4-4',
  user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M4 20a8 8 0 0 1 16 0',
  database: 'M5 6c0-1.7 3-3 7-3s7 1.3 7 3-3 3-7 3-7-1.3-7-3z M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6 M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6',
  plane: 'M3 12l18-8-6 16-3.5-6.5z M11.5 13.5L21 4',
  code: 'M8 8l-4 4 4 4 M16 8l4 4-4 4 M13 5l-2 14',
  bag: 'M5 8h14l-1 12H6z M9 8V6a3 3 0 0 1 6 0v2',
  cpu: 'M8 8h8v8H8z M10 4v4 M14 4v4 M10 16v4 M14 16v4 M4 10h4 M4 14h4 M16 10h4 M16 14h4',
  layers: 'M12 3l9 5-9 5-9-5z M3 12l9 5 9-5 M3 16l9 5 9-5',
  doc: 'M7 3h10v18H7z M10 8h4 M10 12h4 M10 16h2',
  building: 'M3 20h18 M6 20V10 M10 20V10 M14 20V10 M18 20V10 M3 10l9-6 9 6z',
  play: 'M9 7l8 5-8 5z',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 8v4l3 2',
  calendar: 'M5 6h14v14H5z M5 10h14 M9 4v4 M15 4v4',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  check: 'M5 12l5 5 9-10',
  chevron: 'M6 9l6 6 6-6',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  video: 'M4 7h11v10H4z M15 10l5-3v10l-5-3',
  refresh: 'M19 8a8 8 0 1 0 1 6 M19 4v4h-4',
  trash: 'M5 7h14 M9 7V4h6v3 M7 7l1 13h8l1-13',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  star: 'M12 4l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z'
};
const used = new Set();
const ic = (name, cls = '') => { used.add(name); return `<svg class="ic${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`; };
const sprite = () => `<svg class="sprite" aria-hidden="true">${[...used].map(n => `<symbol id="i-${n}" viewBox="0 0 24 24">${ICONS[n].split(' M').map((d, i) => `<path d="${i ? 'M' : ''}${d}"/>`).join('')}</symbol>`).join('')}</svg>`;

/* Pick an icon for an episode from the words in its title. */
const KEYWORDS = [
  [/wi-?fi|router|travel|network|nmap|wireshark|ddos/i, 'wifi'], [/passkey|password|credential|login|secret|key/i, 'key'],
  [/email|phish|recruiter|oauth|quish|bec\b|business email/i, 'mail'], [/phone|sim |call|mfa|bank/i, 'phone'],
  [/breach|data|backup|ransomware|deleting|pwned/i, 'database'], [/deepfake|trust what|scammer|incognito|anonymous/i, 'eye'],
  [/update|offboard/i, 'refresh'], [/malware|infostealer|antivirus|infected|virustotal|yara|sysmon|wazuh/i, 'alert'],
  [/supply|repository|zap|web app|living off|process|cyberchef|session/i, 'code'], [/padlock|https|vpn|lock/i, 'lock'],
  [/laptop|tabletop|playbook|checklist|triage/i, 'doc']
];
const epIcon = (title, fallback) => (KEYWORDS.find(([re]) => re.test(title)) || [0, fallback])[1];

const allEpisodes = series.flatMap(s => s.eps.map(e => ({ ...e, series: s })));
const latest = series[0].eps[9];

/* ── Shared chrome ── */
const NAV = [['index.html', 'Home', 'home'], ['series.html', 'New Series', 'series'], ['grc.html', 'GRC', 'grc'], ['investigations.html', 'Investigations', 'investigations'], ['shorts.html', 'Shorts', 'shorts'], ['about.html', 'About', 'about']];
const logo = `<svg class="brand-logo" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M18 3l12 4.5v8.2c0 8-5 14.2-12 17.3C11 29.900 6 23.700 6 15.700V7.500L18 3z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M12.500 17.500l4 4 7.500-8.500" stroke="#2563EB" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const brand = `<a class="brand" href="index.html" aria-label="Cyber Insight home">${logo}<span><span class="brand-name">Cyber Insight</span><span class="brand-sub">Cybersecurity in Plain English</span></span></a>`;

function header(active) {
  const links = NAV.map(([href, label, key]) => {
    if (key !== 'series') return `<a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`;
    return `<div class="nav-dd series-dropdown-wrapper${active === 'series' ? ' current' : ''}">
        <button type="button" class="series-dropdown-trigger" aria-haspopup="true" aria-expanded="false">New Series ${ic('chevron')}</button>
        <div class="dd-menu">
          ${series.map(s => `<a href="series.html#${s.id}">${ic(s.icon)}${esc(s.name)}</a>`).join('\n          ')}
          <a class="dd-all" href="series.html">All series ${ic('arrow')}</a>
          <a href="episodes.html">All episodes ${ic('arrow')}</a>
        </div>
      </div>`;
  }).join('\n      ');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header" id="top-bar">
  <div class="wrap bar">
    ${brand}
    <nav class="nav" id="navLinks" aria-label="Main">
      ${links}
    </nav>
    <div class="tools">
      <a class="icon-btn" href="search.html" aria-label="Search Cyber Insight"${active === 'search' ? ' aria-current="page"' : ''}>${ic('search')}</a>
      <a class="btn btn-primary btn-sm sub-btn" href="${YT}?sub_confirmation=1" target="_blank" rel="noopener noreferrer">Subscribe</a>
      <button class="icon-btn menu-btn" id="mBtn" type="button" aria-expanded="false" aria-controls="navLinks" aria-label="Menu">${ic('menu')}</button>
    </div>
  </div>
</header>`;
}

const footer = () => `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        ${brand}
        <p class="foot-desc">An independent publication that explains online threats in plain language, for everyone.</p>
      </div>
      <div>
        <p class="foot-title">Explore</p>
        <ul class="foot-list">
          <li><a href="series.html">All series</a></li>
          <li><a href="episodes.html">Episode archive</a></li>
          <li><a href="investigations.html">Investigations</a></li>
          <li><a href="grc.html">Governance, risk and compliance</a></li>
          <li><a href="shorts.html">Cyber Pocket Shorts</a></li>
          <li><a href="about.html">About the author</a></li>
        </ul>
      </div>
      <div>
        <p class="foot-title">Get in touch</p>
        <ul class="foot-list">
          <li><a href="about.html#feedback">Send feedback or questions</a></li>
          <li><a href="${YT}" target="_blank" rel="noopener noreferrer">Cyber Pocket (YouTube Shorts) ↗</a></li>
          <li><a href="https://sujampathirathnayaka.com/" rel="noopener">Portfolio</a></li>
          <li><a href="https://www.linkedin.com/in/sujampathi-rathnayaka-304a752a9/" rel="noopener">LinkedIn</a></li>
          <li><a href=".well-known/security.txt">Report a vulnerability</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-base">
      <p class="legal">Research and educational disclaimer: content published on Cyber Insight is written by Poorna Sujampathi Rathnayaka for non-commercial educational, threat-awareness, and digital literacy purposes. All third-party trademarks, company names, CVE IDs, and security advisories referenced belong to their respective owners. Fair-use citations for educational security awareness are permitted with direct attribution and a canonical link. © 2026 Poorna Sujampathi Rathnayaka. All rights reserved.</p>
      <button class="theme-toggle-btn" type="button" aria-label="Switch colour theme">${ic('sun')}Light / dark</button>
    </div>
  </div>
</footer>`;

function page({ file, key, title, description, main, dataPage = 'hub' }) {
  const url = SITE + (file === 'index.html' ? '' : file);
  const head = header(key), foot = footer();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="Poorna Sujampathi Rathnayaka">
  <meta name="copyright" content="© 2026 Poorna Sujampathi Rathnayaka. All rights reserved.">
  <link rel="author" href="https://sujampathirathnayaka.com/">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..800&display=swap" rel="stylesheet">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36' fill='none'><path d='M18 3l12 4.500v8.200c0 8-5 14.200-12 17.300C11 29.900 6 23.700 6 15.700V7.500L18 3z' fill='%230B2D5B'/><path d='M12.500 17.500l4 4 7.500-8.500' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/></svg>">
  <script>document.documentElement.classList.add('js');try{var t=localStorage.getItem('ci_theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
  <link rel="stylesheet" href="styles/insight.css?v=${V}">
  <link rel="stylesheet" href="styles/translate.css?v=${V}">
</head>
<body data-page="${dataPage}">
${sprite()}
${head}

<main id="main">
${main}
</main>

${foot}

<div id="toast-container" role="status" aria-live="polite"></div>
<div id="google_translate_element"></div>
<script src="js/cms.js?v=17"></script>
<script src="js/app.js?v=17"></script>
<script src="js/site.js?v=${V}"></script>
<script src="js/translator.js?v=17"></script>
<script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
</body>
</html>
`;
}

/* ── Pieces ── */
const thumb = (icon, tone, extra = '') => `<div class="thumb tone-${tone}" aria-hidden="true">${ic(icon)}${extra}</div>`;
const metaLine = (e, withDate) => `<p class="meta">${withDate ? `<span>${ic('calendar')}${fmtDate(e.date)}</span>` : ''}<span>${ic('clock')}${e.min} min read</span></p>`;
const searchText = (...parts) => esc(parts.join(' ').toLowerCase());

const epCard = e => `<li class="ep-card ep-item" data-series="${e.series.id}" data-min="${e.min}" data-date="${e.date}" data-text="${searchText(e.title, e.series.name, e.topic || '', e.desc)}">
          ${thumb(epIcon(e.title, e.series.icon), e.series.tone)}
          <div class="ep-body">
            <p class="ep-line">Episode ${pad(e.n)}</p>
            <h3><a href="${e.file}" data-read>${esc(e.title)}</a></h3>
            <span class="tag">${esc(e.series.name)}</span>
            ${metaLine(e, false)}
          </div>
        </li>`;

const invRow = (c, type = '') => `<li class="row${type ? ' result' : ''}" data-tags="${c.tags.join(' ')}"${type ? ` data-type="investigations" data-text="${searchText(c.title, c.sector, c.summary, c.desc, 'behind the breach investigation')}"` : ''}>
          ${thumb(c.icon, 'navy')}
          <div>
            <p class="ep-line">Case ${pad(c.n)} · ${esc(c.sector)}</p>
            <h3><a href="${c.file}" data-read>${esc(c.title)}</a></h3>
            <p>${esc(c.summary)}</p>
            ${metaLine(c, true)}
          </div>
          ${ic('arrow', 'go')}
        </li>`;

/* ── Home ── */
const home = () => page({
  file: 'index.html', key: 'home', dataPage: 'index',
  title: 'Cyber Insight — Cybersecurity in Plain English',
  description: 'Real threats, real cases and practical guidance to help you stay safer in a digital world. Written by Poorna Sujampathi Rathnayaka.',
  main: `  <div class="wrap">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="kicker">Learn<i></i>Investigate<i></i>Understand<i></i>Stay safe</p>
          <h1 id="hero-title">Cybersecurity in Plain English</h1>
          <p class="lede">Real threats, real cases and practical guidance to help you stay safer in a digital world.</p>
          <div class="cta-row">
            <a class="btn btn-primary" href="series.html">Explore Series ${ic('arrow', 'arrow')}</a>
            <a class="btn btn-secondary" href="${latest.file}">Latest Episode</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="thumb hero-art tone-blue" aria-hidden="true">${ic('lock')}</div>
          <article class="latest">
            <span class="tag">Latest Episode</span>
            <p class="ep-line">Episode ${pad(latest.n)} · ${esc(series[0].name)}</p>
            <h2><a href="${latest.file}" data-read>${esc(latest.title)}</a></h2>
            ${metaLine(latest, true)}
            <span class="go" aria-hidden="true">${ic('play')}</span>
          </article>
        </div>
      </div>
    </section>

    <ul class="features" aria-label="What you will find here">
      <li><a href="series.html">${ic('shield')}<span><b>New Series</b><span>Structured learning with 10 episodes each</span></span></a></li>
      <li><a href="investigations.html">${ic('layers')}<span><b>Investigations</b><span>Real incidents and what we can learn</span></span></a></li>
      <li><a href="grc.html">${ic('building')}<span><b>GRC</b><span>Governance, risk and compliance explained</span></span></a></li>
      <li><a href="shorts.html">${ic('video')}<span><b>Cyber Pocket</b><span>Quick, practical tips under 30 seconds</span></span></a></li>
    </ul>

    <section class="section" id="series" aria-labelledby="series-title">
      <div class="section-head">
        <h2 id="series-title">Our Series</h2>
        <a class="link-more" href="series.html">View All Series ${ic('arrow')}</a>
      </div>
      <ul class="series-cards">
        ${series.map(s => `<li class="s-card tone-${s.tone}">
          ${ic(s.icon)}
          <h3><a href="series.html#${s.id}">${esc(s.name)}</a></h3>
          <p>${esc(s.desc)}</p>
          <div class="s-foot"><span class="tag">${s.eps.length} Episodes</span>${ic('arrow')}</div>
        </li>`).join('\n        ')}
      </ul>
    </section>

    <section class="section" id="behind-the-breach" aria-labelledby="inv-title">
      <div class="section-head">
        <h2 id="inv-title">Latest Investigations</h2>
        <a class="link-more" href="investigations.html">View All ${ic('arrow')}</a>
      </div>
      <ul class="teasers">
        ${[...investigations].reverse().slice(0, 2).map(c => invRow(c)).join('\n        ')}
      </ul>
    </section>

    <section class="band" aria-labelledby="band-title">
      <div>
        <h2 id="band-title">Something confusing, or a topic you want explained?</h2>
        <p>Tell me what to explain next.</p>
      </div>
      <a class="btn" href="about.html#feedback">Send feedback ${ic('arrow', 'arrow')}</a>
    </section>
  </div>`
});

/* ── Series (index + one detail per series, shown by URL fragment) ── */
const kinds = [...new Set(series.map(s => s.kind))];
const seriesPage = () => page({
  file: 'series.html', key: 'series', dataPage: 'series',
  title: 'New Series — Cyber Insight',
  description: 'Structured cybersecurity series of ten episodes each: Security in 5 Minutes, Threat of the Week, Playbook Monday, Myth vs Reality and Tool Spotlight.',
  main: `  <div class="wrap" id="seriesHub">
    <div class="series-index" data-filter-scope>
      <header class="page-hero">
        <div class="ph-row">
          <div>
            <h1>New Series</h1>
            <p>Explore our core series — structured content that turns complex cybersecurity topics into practical, real-world knowledge.</p>
          </div>
          <div class="ph-art" aria-hidden="true">${ic('layers')}</div>
        </div>
      </header>
      <div class="chips" role="group" aria-label="Filter series" style="margin:22px 0 18px">
        <button class="chip" type="button" data-chip="all" aria-pressed="true">All Series (${series.length})</button>
        ${kinds.map(k => `<button class="chip" type="button" data-chip="${k.toLowerCase()}" aria-pressed="false">${k}</button>`).join('\n        ')}
      </div>
      <ul class="rows">
        ${series.map(s => `<li class="row" data-tags="${s.kind.toLowerCase()}" data-progress-for="${s.id}">
          ${thumb(s.icon, s.tone)}
          <div>
            <h3><a href="#${s.id}">${esc(s.name)}</a></h3>
            <p>${esc(s.desc)}</p>
          </div>
          <div class="row-side">
            <div class="progress">
              <b>${s.eps.length} Episodes</b>
              <div class="p-line"><span class="p-bar" role="progressbar" aria-label="Episodes of ${esc(s.name)} you have opened" aria-valuemin="0" aria-valuemax="${s.eps.length}" aria-valuenow="0"><i></i></span><span class="p-text">0 / ${s.eps.length} read</span></div>
            </div>
            ${ic('arrow', 'go')}
          </div>
        </li>`).join('\n        ')}
      </ul>
      <p class="empty" data-empty hidden><b>No series in this group yet</b>Choose another filter to see the rest.</p>
    </div>

    ${series.map((s, i) => `<section class="series-detail${i ? ' sh-card' : ''}" id="${s.id}" aria-labelledby="${s.id}-h">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>${ic('chevron')}<a href="series.html">Series</a>${ic('chevron')}<span>${esc(s.name)}</span></nav>
      <div class="sd-head">
        <div>
          <h2 id="${s.id}-h">${ic(s.icon)}${esc(s.name)}</h2>
          <p>${esc(s.desc)}</p>
        </div>
        ${thumb(s.icon, s.tone)}
      </div>
      <ul class="sd-stats">
        <li>${ic('play')}${s.eps.length} Episodes</li>
        <li>${ic('star')}Plain English</li>
        <li>${ic('clock')}${Math.min(...s.eps.map(e => e.min))}–${Math.max(...s.eps.map(e => e.min))} min each</li>
      </ul>
      <div class="sd-list-head">
        <h3>Episodes in This Series</h3>
        <span class="tag done" data-progress-label="${s.id}">0 / ${s.eps.length} read</span>
      </div>
      <ol class="sh-eps">
        ${[...s.eps].reverse().map(e => `<li class="row" data-episode="${e.n}">
          ${thumb(epIcon(e.title, s.icon), s.tone)}
          <div>
            <p class="ep-line">Episode ${pad(e.n)}</p>
            <h3><a href="${e.file}" data-read>${esc(e.title)}</a></h3>
          </div>
          <div class="row-side"><span class="row-min">${e.min} min</span><span class="read-mark" aria-hidden="true">${ic('check')}</span></div>
        </li>`).join('\n        ')}
      </ol>
      <p style="margin-top:22px"><a class="link-more" href="series.html">${ic('arrow')}All series</a></p>
    </section>`).join('\n\n    ')}
  </div>`
});

/* ── Episode archive ── */
const episodesPage = () => page({
  file: 'episodes.html', key: 'series',
  title: 'All Episodes — Cyber Insight',
  description: `Browse all ${allEpisodes.length} Cyber Insight episodes across every series. Search by topic and filter by series or reading time.`,
  main: `  <div class="wrap">
    <header class="page-hero">
      <h1>All Episodes</h1>
      <p>Browse all episodes across our series.</p>
    </header>
    <div class="toolbar" id="epToolbar">
      <div class="field"><label class="sr-only" for="epSearch">Search episodes</label><input id="epSearch" type="search" placeholder="Search episodes, topics or keywords..." autocomplete="off">${ic('search')}</div>
      <label class="sr-only" for="fSeries">Series</label>
      <select class="select" id="fSeries"><option value="">All Series</option>${series.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select>
      <label class="sr-only" for="fDuration">Reading time</label>
      <select class="select" id="fDuration"><option value="">All Durations</option><option value="0-7">7 min or less</option><option value="8-9">8–9 min</option><option value="10-99">10 min or more</option></select>
      <label class="sr-only" for="fSort">Sort order</label>
      <select class="select" id="fSort"><option value="series">By Series</option><option value="short">Shortest First</option><option value="long">Longest First</option></select>
    </div>
    <p class="count-line" id="epCount" role="status">${allEpisodes.length} episodes</p>
    <ul class="ep-grid" id="epGrid">
        ${allEpisodes.map(epCard).join('\n        ')}
    </ul>
    <p class="empty" id="epEmpty" hidden><b>No episodes match</b>Try a different word, or clear the filters.</p>
  </div>`
});

/* ── GRC ── */
const grcPage = () => page({
  file: 'grc.html', key: 'grc',
  title: 'GRC (Governance, Risk and Compliance) — Cyber Insight',
  description: 'A practical look at how organisations manage security, risk and compliance in the real world, without the jargon.',
  main: `  <div class="wrap">
    <header class="page-hero">
      <h1>GRC (Governance, Risk and Compliance)</h1>
      <p>A practical look at how organisations manage security, risk and compliance in the real world.</p>
    </header>
    <ul class="pillars">
      <li class="pillar">${ic('building')}<h3>Governance</h3><p>Who decides, who is accountable, and which policies everyone follows.</p></li>
      <li class="pillar">${ic('alert')}<h3>Risk</h3><p>What could go wrong, how likely it is, and what to fix first.</p></li>
      <li class="pillar">${ic('shield')}<h3>Compliance</h3><p>Meeting the standards and laws that apply, and being able to prove it.</p></li>
    </ul>
    <section class="section" aria-labelledby="grc-latest">
      <div class="section-head"><h2 id="grc-latest">Latest GRC Articles</h2><span class="tag soon">Coming soon</span></div>
      <div class="empty">
        <b>The first guides are being written</b>
        Security is not only about attackers. It is also about who makes the decisions, which risks matter most, and how an organisation shows it is doing the right thing. This section will explain that side of the work without the jargon.
        <p style="margin-top:16px"><a class="btn btn-secondary btn-sm" href="playbook-monday-05.html">Meanwhile: what to do when a supplier is breached</a></p>
      </div>
    </section>
  </div>`
});

/* ── Investigations ── */
const invTags = [['data-breach', 'Data Breach'], ['third-party', 'Third Party'], ['vulnerability', 'Vulnerability']];
const investigationsPage = () => page({
  file: 'investigations.html', key: 'investigations',
  title: 'Behind the Breach: Investigations — Cyber Insight',
  description: 'In-depth investigations into real cybersecurity incidents: what happened, how it worked, and the key lessons.',
  main: `  <div class="wrap" data-filter-scope>
    <header class="page-hero">
      <div class="ph-row">
        <div>
          <h1>Behind the Breach</h1>
          <p>In-depth investigations into real cybersecurity incidents — what happened, how it worked and the key lessons.</p>
        </div>
        <div class="ph-art" aria-hidden="true">${ic('search')}</div>
      </div>
    </header>
    <div class="chips" role="group" aria-label="Filter investigations" style="margin:22px 0 18px">
      <button class="chip" type="button" data-chip="all" aria-pressed="true">All Investigations</button>
      ${invTags.map(([k, l]) => `<button class="chip" type="button" data-chip="${k}" aria-pressed="false">${l}</button>`).join('\n      ')}
    </div>
    <ul class="rows">
        ${[...investigations].reverse().map(c => invRow(c)).join('\n        ')}
    </ul>
    <p class="empty" data-empty hidden><b>No investigations in this group yet</b>Choose another filter to see the rest.</p>
  </div>`
});

/* ── Shorts ── */
const shortCard = s => `<li class="short">
        <div class="short-frame"><iframe src="https://www.youtube.com/embed/${s.id}?rel=0&modestbranding=1" title="Cyber Pocket — ${esc(s.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
        <div class="short-body">
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.desc)} Companion to <a href="${s.companion.file}">${esc(s.companion.label)}</a></p>
          <a class="btn btn-secondary btn-sm" href="https://youtube.com/shorts/${s.id}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
        </div>
      </li>`;
const shortsPage = () => page({
  file: 'shorts.html', key: 'shorts',
  title: 'Cyber Pocket Shorts — Cyber Insight',
  description: 'Quick, bite-sized cybersecurity insights in under 30 seconds, from the Cyber Pocket YouTube channel.',
  main: `  <div class="wrap">
    <header class="page-hero">
      <div class="ph-row">
        <div>
          <h1>Cyber Pocket Shorts</h1>
          <p>Quick, bite-sized cybersecurity insights — under 30 seconds.</p>
        </div>
        <a class="btn btn-primary" href="${YT}?sub_confirmation=1" target="_blank" rel="noopener noreferrer">Subscribe on YouTube</a>
      </div>
    </header>
    <ul class="shorts-grid" style="margin-top:26px">
      ${shorts.map(shortCard).join('\n      ')}
      <li class="channel">
        <div class="channel-top"><span class="avatar" aria-hidden="true">CP</span><div><h3>Cyber Pocket</h3><p>@CyberPocket26 · YouTube channel</p></div></div>
        <p>Cyber Pocket is our dedicated video series bringing cybersecurity awareness to everyone in under 30 seconds. Plain language, visual demonstrations, zero technical jargon.</p>
        <ul class="checks">
          <li>${ic('check')}<span><b>Under 30 seconds.</b> Quick threat breakdowns and red-flag alerts that respect your time.</span></li>
          <li>${ic('check')}<span><b>Tied to the research.</b> Each short connects to an in-depth Cyber Insight article.</span></li>
          <li>${ic('check')}<span><b>Shareable with anyone.</b> Easy to pass on to family, colleagues and friends.</span></li>
        </ul>
        <p><a class="link-more" href="${YT}" target="_blank" rel="noopener noreferrer">Explore @CyberPocket26 ${ic('arrow')}</a></p>
      </li>
    </ul>
  </div>`
});

/* ── About ── */
const aboutPage = () => page({
  file: 'about.html', key: 'about',
  title: 'About Cyber Insight',
  description: 'Cyber Insight is a plain-language cybersecurity publication by Poorna Sujampathi Rathnayaka that helps you understand today’s digital threats and stay safer online.',
  main: `  <div class="wrap">
    <header class="page-hero">
      <h1>About Cyber Insight</h1>
      <p>A plain-language cybersecurity publication that helps you understand today’s digital threats, real incidents and practical ways to stay safer online.</p>
    </header>
    <div class="about-grid">
      <div>
        <div class="author">
          <span class="avatar" aria-hidden="true">PS</span>
          <div>
            <h2>Poorna Sujampathi Rathnayaka</h2>
            <p class="role">Editor &amp; Researcher, Cyber Insight</p>
            <div class="chips">
              <a class="btn btn-primary btn-sm" href="https://sujampathirathnayaka.com/" rel="noopener">View Profile ${ic('arrow', 'arrow')}</a>
              <a class="btn btn-secondary btn-sm" href="https://www.linkedin.com/in/sujampathi-rathnayaka-304a752a9/" rel="noopener">LinkedIn</a>
            </div>
          </div>
        </div>
        <p class="quote">I started this blog because everywhere online people only talk about cybersecurity in technical terms, and most people are left with no real idea of how the digital world actually works. This is my attempt to fix that. I work in cybersecurity, but I write here for everyone.</p>
      </div>
      <ul class="facts">
        <li>${ic('target')}<span><b>Our Mission</b><span>Make cybersecurity knowledge accessible to everyone.</span></span></li>
        <li>${ic('layers')}<span><b>Our Approach</b><span>Real incidents, clear explanations and practical takeaways.</span></span></li>
        <li>${ic('mail')}<span><b>Get in Touch</b><span>Have a question, feedback or a topic you’d like covered? <a href="#feedback">Send feedback</a>.</span></span></li>
      </ul>
    </div>

    <section class="feedback-section" id="feedback" aria-label="Reader feedback">
      <div class="fb-header">
        <h2 class="fb-title">Send feedback to Poorna</h2>
        <p class="fb-sub">Have a question or a suggestion? Prepare an email below. Feedback is private and is sent only when you press Send in your email app.</p>
      </div>
      <div class="fb-form-box">
        <p>You can also <a href="mailto:sujampathirathnayaka@gmail.com">email Poorna directly</a>.</p>
        <p id="fbDraftNote" class="fb-draft-note">Your feedback stays private. Nothing is sent from this page automatically.</p>
        <form id="fbForm" hidden>
          <label for="fbName">Name (optional)</label>
          <input class="fb-input" id="fbName" maxlength="100" autocomplete="name" aria-describedby="fbDraftNote">
          <label for="fbCategory">Feedback category</label>
          <select class="fb-input" id="fbCategory">
            <option>General feedback</option><option>Question</option><option>Correction</option><option>Topic suggestion</option>
          </select>
          <label for="fbMessage">Your feedback</label>
          <textarea class="fb-textarea" id="fbMessage" aria-describedby="fbDraftNote fbLimit" required maxlength="2000" placeholder="Share your question or suggestion..."></textarea>
          <p id="fbLimit" class="fb-draft-note">Maximum 2,000 characters.</p>
          <div class="fb-form-foot">
            <button type="submit" class="fb-submit-btn">Prepare email</button>
            <button type="button" class="fb-clear-btn" id="fbClear">Clear draft</button>
          </div>
        </form>
        <div id="fbEmailPreview" class="fb-preview" hidden>
          <p id="fbStatus" class="fb-status" role="status">Prepared. Review and send:</p>
          <a id="fbEmailLink" class="fb-email-link" href="#" target="_blank" rel="noopener noreferrer">Open email app</a>
          <div class="fb-preview-field">
            <label for="fbEmailTo">To</label>
            <input id="fbEmailTo" class="fb-input" readonly value="sujampathirathnayaka@gmail.com">
          </div>
          <div class="fb-preview-field">
            <label for="fbEmailSubject">Subject</label>
            <input id="fbEmailSubject" class="fb-input" readonly>
          </div>
          <div class="fb-preview-field">
            <label for="fbEmailBody">Body</label>
            <textarea id="fbEmailBody" class="fb-textarea" readonly rows="8"></textarea>
          </div>
          <button type="button" class="fb-copy-btn" id="fbCopy">Copy feedback</button>
        </div>
      </div>
    </section>
  </div>`
});

/* ── Search ── */
const searchPage = () => {
  const epRows = allEpisodes.map(e => `<li class="row result" data-type="episodes" data-text="${searchText(e.title, e.series.name, e.topic || '', e.desc)}">
          ${thumb(epIcon(e.title, e.series.icon), e.series.tone)}
          <div>
            <h3><a href="${e.file}" data-read>${esc(e.title)}</a></h3>
            <p class="meta" style="margin-top:6px"><span class="tag">Episode ${pad(e.n)} · ${esc(e.series.name)}</span><span>${ic('clock')}${e.min} min</span></p>
          </div>
          ${ic('arrow', 'go')}
        </li>`);
  const shortRows = shorts.map(s => `<li class="row result" data-type="shorts" data-text="${searchText(s.title, s.desc, 'cyber pocket short video youtube')}">
          ${thumb('video', 'red')}
          <div>
            <h3><a href="https://youtube.com/shorts/${s.id}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></h3>
            <p>${esc(s.desc)}</p>
            <p class="meta"><span class="tag">Cyber Pocket Short</span></p>
          </div>
          ${ic('arrow', 'go')}
        </li>`);
  return page({
    file: 'search.html', key: 'search',
    title: 'Search — Cyber Insight',
    description: 'Search every Cyber Insight episode, investigation and Cyber Pocket short.',
    main: `  <div class="wrap">
    <header class="page-hero">
      <h1>Search Cyber Insight</h1>
    </header>
    <form class="toolbar" id="searchForm" role="search" action="search.html" method="get">
      <div class="field"><label class="sr-only" for="q">Search</label><input id="q" name="q" type="search" placeholder="Try “data breach”, “passkeys” or “phishing”" autocomplete="off"><button type="submit" aria-label="Search">${ic('search')}</button></div>
    </form>
    <div class="chips" id="searchTabs" role="group" aria-label="Result type" style="margin:8px 0 16px">
      <button class="chip" type="button" data-type="all" aria-pressed="true">All (<span data-count="all">${allEpisodes.length + investigations.length + shorts.length}</span>)</button>
      <button class="chip" type="button" data-type="episodes" aria-pressed="false">Episodes (<span data-count="episodes">${allEpisodes.length}</span>)</button>
      <button class="chip" type="button" data-type="investigations" aria-pressed="false">Investigations (<span data-count="investigations">${investigations.length}</span>)</button>
      <button class="chip" type="button" data-type="shorts" aria-pressed="false">Shorts (<span data-count="shorts">${shorts.length}</span>)</button>
    </div>
    <ul class="rows" id="results">
        ${[...[...investigations].reverse().map(c => invRow(c, 'result')), ...epRows, ...shortRows].join('\n        ')}
    </ul>
    <p class="empty" id="searchEmpty" hidden><b>No results</b>Try a shorter or different word, or <a href="episodes.html">browse all episodes</a>.</p>
  </div>`
  });
};

const pages = { 'index.html': home, 'series.html': seriesPage, 'episodes.html': episodesPage, 'grc.html': grcPage, 'investigations.html': investigationsPage, 'shorts.html': shortsPage, 'about.html': aboutPage, 'search.html': searchPage };
for (const [file, build] of Object.entries(pages)) {
  used.clear();
  // First pass collects the icons the page uses; the second emits the sprite with exactly those.
  build();
  for (const n of ['chevron', 'arrow', 'search', 'menu', 'sun', ...series.map(s => s.icon)]) used.add(n);
  await writeFile(new URL(file, root), build());
}
console.log(`Generated ${Object.keys(pages).length} hub pages`);
