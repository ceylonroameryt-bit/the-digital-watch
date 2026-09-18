/* ============================================================
   cms.js — Cyber Insight CMS Bridge
   Reads posts & settings from localStorage and renders them
   dynamically on the public-facing pages (index.html, article.html)
   ============================================================ */

'use strict';

const DW_KEYS = {
  posts:    'dw_posts',
  settings: 'dw_settings',
  series:   'dw_series',
};
const CI_KEYS = DW_KEYS;

/* ── DEFAULT SEED DATA ─────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  blogName:    'Cyber Insight',
  tagline:     'Clear insight into the digital world.',
  description: 'Everyone talks about cybersecurity in technical terms. Cyber Insight breaks down what\'s actually happening online — simply, honestly, and in plain language. No jargon required.',
  authorName:  'Poorna Sujampathi Rathnayaka',
  authorInitials: 'PS',
  authorRole:  'Writer · Cyber Insight · Digital Literacy',
  authorBio:   'I started Cyber Insight because everywhere online people only talk about cybersecurity in technical terms — and most people are left without a proper understanding of how the digital world works. I work in cybersecurity, but I write here for everyone. No jargon. Just clear, honest explanations.',
  portfolioUrl: 'https://sujampathirathnayaka.com/',
  linkedinUrl:  'https://www.linkedin.com/in/sujampathi-rathnayaka-304a752a9/',
  seriesName:   'Cybersecurity for Everyone',
  seriesDesc:   'A 10-part series that cuts through the technical noise. Each episode takes one real topic — phishing, data breaches, fake recruiters, deepfakes — and explains what\'s actually going on, why it matters, and what you can do about it. Written for anyone who uses the internet.',
};

const DEFAULT_POSTS = [
  {
    id: 'ep01-can-you-still-trust',
    episodeNum: 1,
    title: 'Can You Still Trust What You See and Hear Online?',
    slug: 'ep01-can-you-still-trust',
    category: 'Digital Safety',
    tags: ['AI & Deepfakes', 'Voice Cloning'],
    readTime: '7 min read',
    date: 'September 15, 2026',
    status: 'published',
    summary: 'AI can now clone a voice from 3 seconds of audio and generate a realistic video of someone who never existed. In this episode, we look at what that actually means for ordinary people online — and how to start thinking differently about what you see and hear.',
    content: '',
    seriesName: 'Cybersecurity for Everyone',
  },
  { id:'ep02-someone-has-your-email', episodeNum:2, title:'Someone Has Your Email Address. Now What?', slug:'ep02-someone-has-your-email', category:'Identity Recon', tags:['Account Takeover','Phishing','MFA'], readTime:'7 min read', date:'September 18, 2026', status:'published', summary:'Your email address is the primary anchor of your digital footprint. What automated crawlers, credential stuffing bots, and spear-phishers do once it leaks, and how to lockdown your perimeter.', content:'', seriesName:'Cybersecurity for Everyone' },
  { id:'ep03-clicked-phishing-link', episodeNum:3, title:'I Clicked a Phishing Link. What Should I Do?', slug:'ep03-clicked-phishing-link', category:'Phishing', tags:['Phishing','Quick Action'], readTime:'5 min read', date:'', status:'draft', summary:'A step-by-step guide for the moments right after you realise you may have clicked something you shouldn\'t have.', content:'', seriesName:'Cybersecurity for Everyone' },
  { id:'ep04-session-was-stolen', episodeNum:4, title:'Your Password Wasn\'t Hacked. Your Session Was Stolen.', slug:'ep04-session-was-stolen', category:'Account Security', tags:['Session Hijacking','Cookies'], readTime:'7 min read', date:'', status:'draft', summary:'Changing your password doesn\'t always help. Here\'s how attackers steal your login session without ever knowing your password.', content:'', seriesName:'Cybersecurity for Everyone' },
  { id:'ep05-padlock-doesnt-mean-safe', episodeNum:5, title:'Why the Padlock Doesn\'t Mean a Website Is Safe', slug:'ep05-padlock-doesnt-mean-safe', category:'Web Safety', tags:['HTTPS','Scam Websites'], readTime:'5 min read', date:'', status:'draft', summary:'The padlock icon in your browser means the connection is encrypted — not that the website is trustworthy. Here\'s what to actually look for.', content:'', seriesName:'Cybersecurity for Everyone' },
  { id:'ep06-are-passkeys-killing-passwords', episodeNum:6, title:'Are Passkeys Finally Going to Kill Passwords?', slug:'ep06-are-passkeys-killing-passwords', category:'Authentication', tags:['Passkeys','Passwords'], readTime:'6 min read', date:'', status:'draft', summary:'Passkeys are being called the end of passwords. But what are they, how do they work, and should you actually switch?', content:'', seriesName:'Cybersecurity for Everyone' },
  { id:'ep07-fake-recruiter-linkedin', episodeNum:7, title:'The Fake Recruiter in Your LinkedIn Inbox', slug:'ep07-fake-recruiter-linkedin', category:'Social Engineering', tags:['LinkedIn','Fake Recruiters'], readTime:'6 min read', date:'', status:'draft', summary:'Not everyone who messages you on LinkedIn is who they say they are. Here\'s how to spot fake recruiters and what they\'re actually after.', content:'', seriesName:'Cybersecurity for Everyone' },
  { id:'ep08-what-scammer-learns-in-10-minutes', episodeNum:8, title:'How Much Can a Scammer Learn About You in 10 Minutes?', slug:'ep08-what-scammer-learns-in-10-minutes', category:'Digital Privacy', tags:['OSINT','Digital Footprint'], readTime:'7 min read', date:'', status:'draft', summary:'With just your name and email address, an attacker can piece together a surprisingly detailed profile. Here\'s exactly how — and how to limit what\'s out there.', content:'', seriesName:'Cybersecurity for Everyone' },
  { id:'ep09-your-bank-is-calling', episodeNum:9, title:'Your Bank Is Calling. Or Is It?', slug:'ep09-your-bank-is-calling', category:'Scam Calls', tags:['Vishing','Caller ID Spoofing'], readTime:'6 min read', date:'', status:'draft', summary:'Scammers can fake your bank\'s phone number and sound completely professional. Here\'s how these calls work and how to handle them.', content:'', seriesName:'Cybersecurity for Everyone' },
  { id:'ep10-after-data-breach', episodeNum:10, title:'What Happens to Your Information After a Data Breach?', slug:'ep10-after-data-breach', category:'Data Breaches', tags:['Dark Web','Credential Stuffing'], readTime:'8 min read', date:'', status:'draft', summary:'When a company is breached, your data doesn\'t just disappear. Here\'s the journey from stolen record to identity fraud — and what you can actually do about it.', content:'', seriesName:'Cybersecurity for Everyone' },
];

/* ── STORAGE HELPERS ────────────────────────────────────────── */
function getPosts() {
  try {
    const raw = localStorage.getItem(DW_KEYS.posts);
    if (!raw) return DEFAULT_POSTS;
    const list = JSON.parse(raw);
    const ep2 = list.find(p => p.id === 'ep02-someone-has-your-email' || p.episodeNum === 2);
    if (ep2 && ep2.status !== 'published') {
      ep2.status = 'published';
      ep2.date = 'September 18, 2026';
      ep2.readTime = '7 min read';
      savePosts(list);
    }
    return list;
  } catch(e) { return DEFAULT_POSTS; }
}

function getSettings() {
  try {
    let raw = localStorage.getItem(CI_KEYS.settings) || localStorage.getItem('dw_blog_settings');
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    if (parsed.blogName === 'The Digital Watch') parsed.blogName = DEFAULT_SETTINGS.blogName;
    if (parsed.authorRole && parsed.authorRole.includes('The Digital Watch')) {
      parsed.authorRole = parsed.authorRole.replace(/The Digital Watch/g, 'Cyber Insight');
    }
    if (parsed.authorBio && parsed.authorBio.includes('The Digital Watch')) {
      parsed.authorBio = parsed.authorBio.replace(/The Digital Watch/g, 'Cyber Insight');
    }
    return Object.assign({}, DEFAULT_SETTINGS, parsed);
  } catch(e) { return DEFAULT_SETTINGS; }
}

function savePosts(posts) {
  localStorage.setItem(DW_KEYS.posts, JSON.stringify(posts));
}

function saveSettings(settings) {
  localStorage.setItem(DW_KEYS.settings, JSON.stringify(settings));
}

/* ── PAGE RENDERER — INDEX ─────────────────────────────────── */
function renderIndex() {
  const posts = getPosts();
  const settings = getSettings();
  const published = posts.filter(p => p.status === 'published');

  // Update blog name & tagline
  _setAll('[data-cms="blog-name"]', settings.blogName);
  _setAll('[data-cms="tagline"]', settings.tagline);
  _setAll('[data-cms="description"]', settings.description);
  _setAll('[data-cms="series-name"]', settings.seriesName);
  _setAll('[data-cms="series-desc"]', settings.seriesDesc);
  _setAll('[data-cms="author-name"]', settings.authorName);
  _setAll('[data-cms="author-initials"]', settings.authorInitials);
  _setAll('[data-cms="author-bio"]', settings.authorBio);

  // Featured post (first published)
  const featured = published[0];
  if (featured) {
    const featCard = document.getElementById('featCard');
    if (featCard) {
      featCard.href = `article.html?id=${featured.slug}`;
      featCard.setAttribute('aria-label', `Read: ${featured.title}`);
    }
    _set('featTitle', featured.title);
    _set('featSummary', featured.summary);
    _set('featCategory', featured.category);
    _set('featDate', `Episode ${_pad(featured.episodeNum)} · ${featured.readTime} · Published ✅`);
  }

  // Series grid
  const grid = document.getElementById('seriesGrid');
  if (grid) {
    grid.innerHTML = posts.map(p => _renderEpCard(p)).join('');
  }

  // Progress tracker
  const progressFill = document.querySelector('.series-progress-fill');
  const progressText = document.querySelector('.series-tracker-top .stat');
  if (progressFill && progressText) {
    const pct = Math.round((published.length / posts.length) * 100);
    progressFill.style.width = pct + '%';
    progressText.textContent = `${pct}% Complete`;
  }
  const epReleased = document.querySelector('.series-tracker-top span:first-child .stat');
  if (epReleased) epReleased.textContent = `Episode ${_pad(published.length)} of ${posts.length} Released`;
}

function _renderEpCard(post) {
  const isPub = post.status === 'published';
  const href = post.episodeNum === 1 ? 'article.html' : post.episodeNum === 2 ? 'article-02.html' : (isPub ? `article.html?id=${post.slug}` : '#');
  return `
  <${isPub ? 'a href="'+href+'"' : 'div'} class="ep-card ${isPub ? 'is-published' : ''}">
    <div class="ep-svg-thumb" style="background:linear-gradient(135deg,${_epGradient(post.episodeNum)});">
      <svg viewBox="0 0 280 155" width="280" height="155" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        ${_epSvgContent(post.episodeNum, isPub)}
      </svg>
      <span class="ep-badge-pill">Episode ${_pad(post.episodeNum)}</span>
    </div>
    <div class="ep-body">
      <div class="ep-header-meta">
        <span class="ep-num">Episode ${_pad(post.episodeNum)}</span>
        <span class="ep-topic">${post.category}</span>
      </div>
      <h3 class="ep-title">${_esc(post.title)}</h3>
      <p class="ep-summary">${_esc(post.summary)}</p>
      <div class="ep-foot">
        <span class="ep-status-tag ${isPub ? 'published' : 'upcoming'}">${isPub ? '✅ Published' : 'Coming Soon'}</span>
        <span>${post.readTime}</span>
      </div>
    </div>
  </${isPub ? 'a' : 'div'}>`;
}

function _epGradient(n) {
  const g = [
    '#EFF6FF 0%, #DBEAFE 100%',
    '#EFF6FF 0%, #DBEAFE 100%',
    '#FFFBEB 0%, #FEF3C7 100%',
    '#FFF1F2 0%, #FFE4E6 100%',
    '#F5F3FF 0%, #EDE9FE 100%',
    '#ECFEFF 0%, #CFFAFE 100%',
    '#FFF7ED 0%, #FFEDD5 100%',
    '#F8FAFC 0%, #F1F5F9 100%',
    '#EFF6FF 0%, #F0FDF4 100%',
    '#F8FAFC 0%, #E2E8F0 100%',
  ];
  return g[(n - 1) % g.length];
}

function _epSvgContent(n, isPub) {
  if (isPub && n === 1) {
    // Eye / deepfake illustration for ep01
    return `<path d="M70 78 Q140 44 210 78 Q140 112 70 78 Z" fill="white" stroke="#1D4ED8" stroke-width="1.5"/>
      <circle cx="140" cy="78" r="18" fill="#EEF2FF" stroke="#1D4ED8" stroke-width="1.2"/>
      <circle cx="140" cy="78" r="10" fill="#1D4ED8"/>
      <circle cx="136" cy="74" r="3" fill="white" opacity=".6"/>
      <text x="140" y="132" text-anchor="middle" fill="#94A3B8" font-family="DM Sans,system-ui" font-size="11">Can you still trust what you see?</text>`;
  }
  if (n === 2) {
    // Envelope / OSINT illustration for ep02
    return `<rect x="70" y="45" width="105" height="70" rx="9" fill="white" stroke="#1D4ED8" stroke-width="2"/>
      <path d="M70 54 L122.5 88 L175 54" stroke="#1D4ED8" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <circle cx="196" cy="62" r="26" stroke="#EF4444" stroke-width="1.2" opacity=".3"/>
      <circle cx="196" cy="62" r="6" fill="#EF4444"/>
      <line x1="196" y1="36" x2="196" y2="88" stroke="#EF4444" stroke-width="1" stroke-dasharray="3 2" opacity=".5"/>
      <text x="140" y="132" text-anchor="middle" fill="#94A3B8" font-family="DM Sans,system-ui" font-size="11">Identity Exposure &amp; OSINT</text>`;
  }
  // Generic episode SVG with episode number
  return `<circle cx="140" cy="68" r="38" fill="white" stroke="#CBD5E1" stroke-width="1.5" opacity=".8"/>
    <text x="140" y="62" text-anchor="middle" fill="#94A3B8" font-family="DM Sans,system-ui" font-size="11" font-weight="600">Episode</text>
    <text x="140" y="85" text-anchor="middle" fill="#1D4ED8" font-family="DM Sans,system-ui" font-size="28" font-weight="800">${String(n).padStart(2,'0')}</text>
    <text x="140" y="132" text-anchor="middle" fill="#CBD5E1" font-family="DM Sans,system-ui" font-size="10">Coming soon</text>`;
}

/* ── PAGE RENDERER — ARTICLE ────────────────────────────────── */
function renderArticle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || (window.location.pathname.includes('02') ? 'ep02-someone-has-your-email' : 'ep01-can-you-still-trust');
  if (id === 'ep02-someone-has-your-email' && !window.location.pathname.includes('02')) {
    window.location.replace('article-02.html');
    return;
  }
  const posts = getPosts();
  const settings = getSettings();
  const post = posts.find(p => p.slug === id || p.id === id) || posts[0];
  if (!post) return;

  // Update static fields from settings
  _setAll('[data-cms="author-name"]',     settings.authorName);
  _setAll('[data-cms="author-initials"]', settings.authorInitials);
  _setAll('[data-cms="author-role"]',     settings.authorRole);
  _setAll('[data-cms="author-bio"]',      settings.authorBio);
  _setAll('[data-cms="series-name"]',     settings.seriesName);

  // Article header fields
  _setAll('[data-cms="art-title"]',    post.title);
  _setAll('[data-cms="art-category"]', post.category);
  _setAll('[data-cms="art-date"]',     post.date || 'Coming Soon');
  _setAll('[data-cms="art-readtime"]', post.readTime);
  _setAll('[data-cms="art-ep"]',       `Episode ${_pad(post.episodeNum)}`);

  // Update page title
  document.title = `${post.title} — ${settings.blogName}`;

  // Update series nav
  const seriesNavGrid = document.getElementById('seriesNavGrid');
  if (seriesNavGrid) {
    const allPosts = posts;
    seriesNavGrid.innerHTML = allPosts.map(p => {
      const isActive = p.slug === post.slug;
      const isPub = p.status === 'published';
      const epHref = p.episodeNum === 1 ? 'article.html' : p.episodeNum === 2 ? 'article-02.html' : `article.html?id=${p.slug}`;
      return `<${isPub ? 'a href="'+epHref+'"' : 'span'} class="series-nav-item ${isActive ? 'active' : ''}">
        <span class="series-nav-num">${_pad(p.episodeNum)}</span>
        <span>${_esc(p.title)}</span>
      </${isPub ? 'a' : 'span'}>`;
    }).join('');
  }
}

/* ── HELPERS ────────────────────────────────────────────────── */
function _set(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function _setAll(selector, text) {
  document.querySelectorAll(selector).forEach(el => el.textContent = text);
}
function _pad(n) { return String(n).padStart(2, '0'); }
function _esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Seed defaults if first visit
  if (!localStorage.getItem(DW_KEYS.posts)) savePosts(DEFAULT_POSTS);
  if (!localStorage.getItem(DW_KEYS.settings)) saveSettings(DEFAULT_SETTINGS);

  const page = document.body.dataset.page;
  if (page === 'index') renderIndex();
  if (page === 'article') renderArticle();
});

// Expose for admin use
window.CI_CMS = { getPosts, getSettings, savePosts, saveSettings, CI_KEYS, DW_KEYS: CI_KEYS, DEFAULT_POSTS, DEFAULT_SETTINGS };
window.DW_CMS = window.CI_CMS;
