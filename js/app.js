/* ============================================================
   app.js — Threat Brief Research Blog
   Handles: reading progress, mobile menu, engagement (like/clap),
            ToC highlight, smooth scroll, copy link, share tracking
   ============================================================ */

'use strict';

function getArticleKey() {
  if (document.body && document.body.dataset && document.body.dataset.articleId) {
    return 'threatbrief_' + document.body.dataset.articleId;
  }
  const path = window.location.pathname;
  if (path.includes('07') || window.location.search.includes('ep07')) {
    return 'threatbrief_ep07';
  }
  if (path.includes('06') || window.location.search.includes('ep06')) {
    return 'threatbrief_ep06';
  }
  if (path.includes('05') || window.location.search.includes('ep05')) {
    return 'threatbrief_ep05';
  }
  if (path.includes('04') || window.location.search.includes('ep04')) {
    return 'threatbrief_ep04';
  }
  if (path.includes('03') || window.location.search.includes('ep03')) {
    return 'threatbrief_ep03';
  }
  if (path.includes('02') || window.location.search.includes('ep02')) {
    return 'threatbrief_ep02';
  }
  return 'threatbrief_ep01';
}

/* ── TOAST ──────────────────────────────────────────────────── */
function showToast(msg, emoji = '✓') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast';
  for (const value of [emoji, msg]) {
    const span = document.createElement('span');
    span.textContent = value;
    t.appendChild(span);
  }
  c.appendChild(t);
  setTimeout(() => {
    t.style.cssText = 'opacity:0;transform:translateY(6px);transition:all .2s ease';
    setTimeout(() => t.remove(), 220);
  }, 2800);
}

/* ── READING PROGRESS ────────────────────────────────────────── */
function initProgress() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = h > 0 ? `${Math.min((window.scrollY / h) * 100, 100)}%` : '0%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── MOBILE MENU ─────────────────────────────────────────────── */
function initMobileMenu() {
  const btn = document.getElementById('mobileBtn') || document.getElementById('mBtn');
  const menu = document.getElementById('navLinks');
  if (!btn || !menu) return;
  btn.setAttribute('aria-controls', menu.id);
  const close = () => {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  };
  btn.addEventListener('click', () => {
    btn.setAttribute('aria-expanded', String(menu.classList.toggle('open')));
  });
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      close();
      btn.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!btn.contains(event.target) && !menu.contains(event.target)) close();
  });
}

/* ── SERIES FILTER ───────────────────────────────────────────── */
function initSeriesFilter() {
  const tabs = document.querySelectorAll('.series-tab-btn');
  const cards = document.querySelectorAll('.ep-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');
      const filter = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const isPublished = card.classList.contains('is-published');
        if (filter === 'all') {
          card.style.display = 'flex';
        } else if (filter === 'published') {
          card.style.display = isPublished ? 'flex' : 'none';
        } else if (filter === 'upcoming') {
          card.style.display = !isPublished ? 'flex' : 'none';
        }
      });
    });
  });
}

/* ── COPY LINK ───────────────────────────────────────────────── */
async function copyLink() {
  const canonical = document.querySelector('link[rel="canonical"]');
  const url = canonical ? canonical.href : window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard', '🔗');
  } catch (_) {
    showToast('Copy the page address from your browser', '📋');
  }
}

/* ── STORAGE HELPERS ─────────────────────────────────────────── */
const sessionData = new Map();
function getData() {
  try {
    const key = getArticleKey();
    let raw = localStorage.getItem(key);
    if (!raw && (key === 'threatbrief_ep01' || key === 'threatbrief_ai_scams_v3')) {
      raw = localStorage.getItem('threatbrief_ai_scams_v3') || localStorage.getItem('threatbrief_ep01');
      if (raw) localStorage.setItem(key, raw);
    }
    const saved = JSON.parse(raw || '{}');
    return sessionData.get(key) || (saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {});
  } catch (e) {
    return sessionData.get(getArticleKey()) || {};
  }
}

function saveData(patch) {
  const key = getArticleKey();
  const updated = { ...getData(), ...patch };
  sessionData.set(key, updated);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
    if (key === 'threatbrief_ep01' || key === 'threatbrief_ai_scams_v3') {
      localStorage.setItem('threatbrief_ai_scams_v3', JSON.stringify(updated));
      localStorage.setItem('threatbrief_ep01', JSON.stringify(updated));
    }
  } catch (e) {}
}

/* ── LIKE ────────────────────────────────────────────────────── */
function renderLike(liked, count) {
  document.querySelectorAll('.btn-like').forEach(btn => {
    btn.classList.toggle('liked', liked);
    btn.setAttribute('aria-pressed', String(liked));
    btn.title = 'Your like on this device';
    const heart = btn.querySelector('.like-heart');
    if (heart) heart.textContent = liked ? '❤️' : '🤍';
  });
  document.querySelectorAll('.like-count').forEach(cnt => {
    cnt.textContent = count;
  });
}

function initLike() {
  const s = getData();
  const liked = !!s.liked;
  const count = s.liked ? 1 : 0;
  renderLike(liked, count);

  document.querySelectorAll('.btn-like').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleLike();
    };
  });
}

function toggleLike(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
    e.stopPropagation();
  }
  const s = getData();
  const liked = !s.liked;
  let count = s.liked ? 1 : 0;
  count = liked ? count + 1 : Math.max(0, count - 1);
  saveData({ liked, likeCnt: count });
  renderLike(liked, count);
  if (liked) showToast('Liked on this device', '❤️');
}
window.toggleLike = toggleLike;

/* ── CLAP ────────────────────────────────────────────────────── */
function renderClap(claps, myClaps) {
  const MAX = 50;
  document.querySelectorAll('.btn-clap').forEach(btn => {
    btn.classList.toggle('clapped', myClaps > 0);
    if (myClaps >= MAX) {
      btn.disabled = true;
      btn.title = 'Max claps reached (50)!';
    } else {
      btn.disabled = false;
      btn.title = 'Your claps on this device';
    }
  });
  document.querySelectorAll('.clap-count').forEach(cnt => {
    cnt.textContent = claps >= 1000 ? `${(claps / 1000).toFixed(1)}k` : claps;
  });
}

function initClap() {
  const s = getData();
  const claps = Math.min(50, Math.max(0, Number(s.myClaps) || 0));
  const myClaps = Math.min(50, Math.max(0, Number(s.myClaps) || 0));
  renderClap(claps, myClaps);

  document.querySelectorAll('.btn-clap').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      addClap();
    };
  });
}

function addClap(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
    e.stopPropagation();
  }
  const s = getData();
  let claps   = Math.min(50, Math.max(0, Number(s.myClaps) || 0));
  let myClaps = Math.min(50, Math.max(0, Number(s.myClaps) || 0));
  const MAX   = 50;

  if (myClaps >= MAX) {
    showToast('Max claps reached (50)! 👏', '👏');
    return;
  }
  claps++;
  myClaps++;
  saveData({ claps, myClaps });
  renderClap(claps, myClaps);
  document.querySelectorAll('.btn-clap').forEach(btn => {
    btn.style.transform = 'scale(1.2) rotate(-6deg)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  });
}
window.addClap = addClap;

/* ── LINKEDIN SHARE ──────────────────────────────────────────── */
function trackShare() {
  showToast('Opening LinkedIn…', '🔗');
}

/* ── TOC & SIDE LINE SCROLL TRACKER ─────────────────────────── */
function initToc() {
  const sidebar = document.querySelector('.art-toc-sidebar');
  const tocLinks = document.querySelectorAll('.toc-list a');
  if (!sidebar || !tocLinks.length) return;

  const progressFill = document.getElementById('tocLineProgress');
  const percentText = document.getElementById('tocPercent');
  const tocHeader = sidebar.querySelector('.toc-header');
  const targets = [];

  // Mobile accordion drawer toggling
  if (tocHeader) {
    const toggleMobileOutline = (e) => {
      if (window.innerWidth <= 1024) {
        if (e && e.type === 'click') e.preventDefault();
        const isOpen = sidebar.classList.toggle('is-open');
        tocHeader.setAttribute('aria-expanded', String(isOpen));
      }
    };

    tocHeader.addEventListener('click', toggleMobileOutline);
    tocHeader.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMobileOutline(e);
      }
    });
  }

  // Auto-close mobile drawer when any TOC section link is tapped
  tocLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove('is-open');
        if (tocHeader) tocHeader.setAttribute('aria-expanded', 'false');
      }
    });

    const hash = link.getAttribute('href');
    if (!hash || !hash.startsWith('#')) return;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (target) {
      targets.push({ link, target, id });
    }
  });

  if (!targets.length) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 66;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docH > 0 ? Math.min(Math.max((scrollY / docH) * 100, 0), 100) : 0;

    if (percentText) {
      percentText.textContent = `${Math.round(progress)}%`;
    }
    if (progressFill) {
      progressFill.style.height = `${progress}%`;
    }

    // Determine current active section
    let currentIdx = 0;
    for (let i = 0; i < targets.length; i++) {
      const top = targets[i].target.getBoundingClientRect().top;
      if (top <= navH + 80) {
        currentIdx = i;
      } else {
        break;
      }
    }

    targets.forEach((item, idx) => {
      if (idx === currentIdx) {
        item.link.classList.add('active');
        item.link.classList.add('passed');
        item.link.setAttribute('aria-current', 'location');
        // Keep active link visible in scrollable sidebar on desktop only
        if (window.innerWidth > 1024) {
          const sidebarRect = sidebar.getBoundingClientRect();
          const linkRect = item.link.getBoundingClientRect();
          if (linkRect.top < sidebarRect.top + 30 || linkRect.bottom > sidebarRect.bottom - 30) {
            if (typeof item.link.scrollIntoView === 'function') {
              item.link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }
        }
      } else if (idx < currentIdx) {
        item.link.classList.remove('active');
        item.link.classList.add('passed');
        item.link.removeAttribute('aria-current');
      } else {
        item.link.classList.remove('active');
        item.link.classList.remove('passed');
        item.link.removeAttribute('aria-current');
      }
    });
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(update);
      } else {
        update();
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ── SMOOTH SCROLL & HASH NAVIGATION ─────────────────────────── */
function initScroll() {
  const scrollToTargetId = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
    ) || 66;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - navH - 16,
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  };

  // If page loaded with a hash in URL (e.g. index.html#behind-the-breach)
  if (window.location.hash && window.location.hash.length > 1) {
    try {
      const initialId = decodeURIComponent(window.location.hash.slice(1));
      setTimeout(() => scrollToTargetId(initialId), 100);
    } catch (_) {}
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash && window.location.hash.length > 1) {
      try {
        const id = decodeURIComponent(window.location.hash.slice(1));
        scrollToTargetId(id);
      } catch (_) {}
    }
  });

  document.querySelectorAll('a[href*="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const rawHref = a.getAttribute('href');
      if (!rawHref) return;
      const hashIdx = rawHref.indexOf('#');
      if (hashIdx === -1) return;
      const filePart = rawHref.slice(0, hashIdx);
      const isSelf = !filePart || filePart === window.location.pathname.split('/').pop() || (filePart === 'index.html' && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')));
      if (!isSelf) return;

      const hash = rawHref.slice(hashIdx);
      if (!hash || hash === '#') return;
      let id;
      try { id = decodeURIComponent(hash.slice(1)); } catch (_) { return; }
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      scrollToTargetId(id);
      history.pushState(null, '', hash);
    });
  });
}

/* ── FEEDBACK & DISCUSSION ───────────────────────────────────── */
function buildFeedbackEmail({ title, url, name, category, message }) {
  const subject = `Cyber Insight feedback: ${title}`;
  const body = `Article: ${title}\n${url}\n\nFrom: ${name || 'Reader'}\nCategory: ${category}\n\n${message}`;
  return {
    body,
    href: `mailto:sujampathirathnayaka@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  };
}

function initFeedback() {
  const form = document.getElementById('fbForm');
  if (!form) return;
  form.hidden = false;
  const preview = document.getElementById('fbEmailPreview');
  const output = document.getElementById('fbEmailBody');
  const status = document.getElementById('fbStatus');
  const link = document.getElementById('fbEmailLink');
  const copy = document.getElementById('fbCopy');
  const nameInput = document.getElementById('fbName');
  const messageInput = document.getElementById('fbMessage');
  const categoryInput = document.getElementById('fbCategory');
  const note = document.getElementById('fbDraftNote');
  const clear = document.getElementById('fbClear');
  const draftKey = getArticleKey() + '_feedback_draft';
  const categories = [...categoryInput.options].map(option => option.value);

  function invalidatePreview() {
    preview.hidden = true;
    output.value = '';
    status.textContent = '';
    link.removeAttribute('href');
  }
  function saveDraft() {
    invalidatePreview();
    try {
      if (!nameInput.value && !messageInput.value) {
        sessionStorage.removeItem(draftKey);
      } else {
        sessionStorage.setItem(draftKey, JSON.stringify({
          name: nameInput.value, category: categoryInput.value, message: messageInput.value
        }));
      }
      note.textContent = 'Draft saved in this tab. It has not been sent.';
    } catch (_) {
      note.textContent = 'Draft saving is unavailable. Keep this page open or copy your text before leaving.';
    }
  }
  // Session-only drafts survive refresh without storing readers' feedback permanently.
  try {
    const saved = JSON.parse(sessionStorage.getItem(draftKey) || 'null');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      nameInput.value = typeof saved.name === 'string' ? saved.name.slice(0, 100) : '';
      messageInput.value = typeof saved.message === 'string' ? saved.message.slice(0, 2000) : '';
      if (categories.includes(saved.category)) {
        [...categoryInput.options].forEach(option => { option.selected = option.value === saved.category; });
      }
      note.textContent = 'Your unfinished draft was restored in this tab. It has not been sent.';
    }
  } catch (_) {
    // An unavailable or malformed stored draft must never disable the form.
  }
  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);
  clear.addEventListener('click', () => {
    nameInput.value = '';
    messageInput.value = '';
    [...categoryInput.options].forEach((option, index) => { option.selected = index === 0; });
    invalidatePreview();
    try { sessionStorage.removeItem(draftKey); } catch (_) {}
    note.textContent = 'Draft cleared.';
    messageInput.focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const message = messageInput.value.trim();
    if (!message) {
      invalidatePreview();
      status.textContent = 'Enter your feedback first.';
      messageInput.focus();
      return;
    }
    if (message.length > 2000 || nameInput.value.length > 100) {
      invalidatePreview();
      status.textContent = 'Keep feedback within 2,000 characters and your name within 100 characters.';
      messageInput.focus();
      return;
    }
    saveDraft();
    const draft = buildFeedbackEmail({
      title: document.querySelector('h1')?.textContent.trim() || document.title,
      url: document.querySelector('link[rel="canonical"]')?.href || window.location.href.split('#')[0],
      name: nameInput.value.trim(),
      category: categoryInput.value || 'General feedback',
      message
    });
    output.value = draft.body;
    // Email handlers vary in their URL length limits. Keep the full text in the
    // preview and use the copy route for longer drafts instead of risking truncation.
    const useCopy = draft.href.length > 1800;
    link.hidden = useCopy;
    if (!useCopy) link.setAttribute('href', draft.href);
    preview.hidden = false;
    status.textContent = useCopy
      ? 'Your draft is ready. For this longer message, use Copy feedback and paste it into an email to sujampathirathnayaka@gmail.com. Nothing has been sent yet.'
      : 'Your draft is ready. Open your email app, review it, and press Send there. Nothing has been sent yet.';
    preview.scrollIntoView?.({ behavior: 'auto', block: 'nearest' });
    (useCopy ? copy : link).focus();
  });
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = 'Copied. Paste into an email to sujampathirathnayaka@gmail.com and send it.';
    } catch (_) {
      output.focus();
      output.select();
      status.textContent = 'Automatic copying is unavailable. Select and copy the draft, then email it to sujampathirathnayaka@gmail.com.';
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/* ── ATTACK MAP (MAG EPISODE 01 EXCLUSIVE) ─────────────────────── */
const AM_NODE_DATA = {
  'mag-incident': {
    id: 'mag-incident',
    title: 'Manchester Airports Group Suffered a Cyber Incident',
    step: 'STEP 01 / INCIDENT DISCLOSURE',
    statusText: 'CONFIRMED ✓',
    statusClass: 'am-badge-confirmed',
    technical: 'On 27 August 2026, Manchester Airports Group (MAG) publicly confirmed an unauthorized cybersecurity incident involving customer-facing systems for Manchester, London Stansted, and East Midlands airports. Operational air traffic control, airfield safety, and baggage networks were not impacted.',
    simple: 'The airport operating company officially acknowledged that an unauthorized cybersecurity incident took place affecting systems that store customer information.',
    researcher: 'Manchester Airports Group Corporate Disclosure & Media Team',
    evidence: 'Official corporate incident notification published 27 August 2026; direct regulatory reporting to UK Information Commissioner\'s Office (ICO) & NCSC.',
    note: 'Operational flight control, radar, and aviation safety systems remained fully operational and isolated from the compromised marketing platforms.',
    sourceTitle: 'MAG Official Incident Statement & FAQs',
    sourceUrl: 'https://www.manchesterairport.co.uk/help/data-security-incident/',
    articleAnchor: 'what-actually-happened'
  },
  'airport-websites': {
    id: 'airport-websites',
    title: 'Manchester, Stansted & East Midlands Websites Contained Iterable Integrations',
    step: 'STEP 02 / WEB PROPERTIES',
    statusText: 'VERIFIED ✓',
    statusClass: 'am-badge-verified',
    technical: 'The commercial public websites serving MAG\'s three regional airports embedded client-side SDK integration tags connecting visitors to Iterable, a third-party cloud customer-communication and campaign management platform.',
    simple: 'All three airport public websites used an external cloud marketing tool (Iterable) to manage customer communication like parking confirmations and flight newsletters.',
    researcher: 'Scott Helme (Independent Technical Investigation)',
    evidence: 'Inspection of production client-side JavaScript assets and DOM script tags across magairports.com subdomains.',
    note: 'Commercial retail/parking portals were completely segregated from operational airfield networks, but shared common marketing orchestration tooling.',
    sourceTitle: 'Scott Helme — No Hacking Required: The MAG Data Breach',
    sourceUrl: 'https://scotthelme.co.uk/no-hacking-required-manchester-airports-group-data-breach/',
    articleAnchor: 'credentials-were-there'
  },
  'javascript-bundles': {
    id: 'javascript-bundles',
    title: 'JavaScript Bundles Shipped to All Visitors',
    step: 'STEP 03 / CLIENT-SIDE CODE',
    statusText: 'VERIFIED ✓',
    statusClass: 'am-badge-verified',
    technical: 'Production JavaScript application bundles (including Next.js and frontend framework compilation outputs) were served via public Content Delivery Networks (CDNs) directly to every browser visiting the booking portals.',
    simple: 'Modern websites send code directly to your web browser so the page runs quickly. Anyone visiting the website automatically downloads this code.',
    researcher: 'Scott Helme & CybelAngel',
    evidence: 'Publicly downloadable static JS files (e.g., framework bundles) inspectable using standard browser developer tools and curl.',
    note: 'Code delivered to web browsers is completely public by definition. Compiling secrets or API keys into client bundles renders them accessible to anyone.',
    sourceTitle: 'CybelAngel Brief — Breach Started in JS File, Not GitHub',
    sourceUrl: 'https://cybelangel.com/blog/cyber-roundup-week-of-august-31st/',
    articleAnchor: 'why-javascript-matters'
  },
  'iterable-credentials': {
    id: 'iterable-credentials',
    title: 'Three Airport-Specific Iterable API Credentials Exposed Client-Side',
    step: 'STEP 04 / EXPOSED CREDENTIALS',
    statusText: 'VERIFIED ✓',
    statusClass: 'am-badge-verified',
    technical: 'Security researcher Scott Helme independently identified three airport-specific 32-character Iterable API keys hardcoded in client-side JavaScript. Instead of restricted client-only write tokens, the scripts contained privileged API credentials.',
    simple: 'A powerful digital key that should have remained locked inside internal servers was accidentally pasted into website code that anyone could inspect.',
    researcher: 'Scott Helme (Credit: Original Technical Discovery)',
    evidence: 'De-obfuscated client-side JavaScript files matching FulcrumSec\'s description of three airport-specific API tokens.',
    note: 'Scott Helme proved zero exploitation of MAG internal networks, SQL injection, or server penetration was required to acquire the keys.',
    sourceTitle: 'Scott Helme — No Hacking Required: The MAG Data Breach',
    sourceUrl: 'https://scotthelme.co.uk/no-hacking-required-manchester-airports-group-data-breach/',
    articleAnchor: 'credentials-were-there'
  },
  'four-year-exposure': {
    id: 'four-year-exposure',
    title: 'Credentials Publicly Observable Since 2022 Until August 2026',
    step: 'STEP 05 / EXPOSURE WINDOW',
    statusText: 'VERIFIED ✓',
    statusClass: 'am-badge-verified',
    technical: 'Wayback Machine captures prove East Midlands credential appeared on 23 June 2022, Stansted on 28 June 2022, and Manchester on 11 July 2022. Stansted\'s key was observed removed/empty on 25 August 2026.',
    simple: 'Public web archives prove the keys sat out in the open on the websites for roughly four years before anyone removed them.',
    researcher: 'Scott Helme',
    evidence: 'Historical snapshot diffs of MAG static assets on the Internet Archive Wayback Machine.',
    note: 'CRITICAL DISTINCTION: This represents a credential EXPOSURE WINDOW. It is NOT proof that attackers discovered, held access, or exploited the keys for four years.',
    sourceTitle: 'Scott Helme — Technical Investigation & Archive Analysis',
    sourceUrl: 'https://scotthelme.co.uk/no-hacking-required-manchester-airports-group-data-breach/',
    articleAnchor: 'credentials-were-there'
  },
  'fulcrumsec-discovery': {
    id: 'fulcrumsec-discovery',
    title: 'FulcrumSec Discovers and Claims Use of Exposed Credentials',
    step: 'STEP 06 / THREAT ACTOR CLAIM',
    statusText: 'CLAIMED ⚠',
    statusClass: 'am-badge-claimed',
    technical: 'Cloud cyber-extortion group FulcrumSec posted on their dark web leak site claiming they harvested MAG credentials directly from public JavaScript files and utilized them to extract the database.',
    simple: 'The extortion group claimed they spotted the exposed digital keys on the website and used them to grab data.',
    researcher: 'Threat actor claim; profiled by MoxFive, Sysdig, and Searchlight Cyber.',
    evidence: 'FulcrumSec dark web leak publication (30 August 2026) and extortion announcements.',
    note: 'MAG has NOT officially confirmed that FulcrumSec was the threat actor, nor have they verified this claim as the definitive initial attack vector.',
    sourceTitle: 'MOXFIVE Threat Intel — FulcrumSec: Inside the Cloud Extortion Group',
    sourceUrl: 'https://www.moxfive.com/blog/who-is-fulcrumsec-inside-the-cloud-extortion-group-behind-21-victims-and-counting',
    articleAnchor: 'fulcrumsec-attribution'
  },
  'iterable-api-access': {
    id: 'iterable-api-access',
    title: 'Possible Authenticated Iterable API Access',
    step: 'STEP 07 / API EXPLOITATION',
    statusText: 'CLAIMED / TECHNICALLY SUPPORTED ⚠',
    statusClass: 'am-badge-claimed',
    technical: 'If the client-exposed keys had server-side permissions, an actor could invoke Iterable REST endpoints (/api/export/data.csv or /api/users) directly against Iterable\'s cloud infrastructure without touching MAG servers.',
    simple: 'Attackers could communicate directly with the third-party marketing cloud using the stolen keys, completely bypassing airport firewalls.',
    researcher: 'Scott Helme (Technical Feasibility Analysis)',
    evidence: 'Iterable API permission model, endpoint specification, and threat actor sample format.',
    note: 'This mechanism provides a coherent and verified technical hypothesis, but public forensic verification from MAG or Iterable server logs has not been released.',
    sourceTitle: 'Iterable — Official API Authentication & Endpoints Specification',
    sourceUrl: 'https://api.iterable.com/api/docs',
    articleAnchor: 'fulcrumsec-attribution'
  },
  'customer-data-collection': {
    id: 'customer-data-collection',
    title: 'Customer Data Collection / Export Matches Iterable Characteristics',
    step: 'STEP 08 / DATA CHARACTERISTICS',
    statusText: 'VERIFIED ✓',
    statusClass: 'am-badge-verified',
    technical: 'Scott Helme examined notifications and records associated with his own affected account and identified specific user attributes, custom schema properties, and metadata headers characteristic of Iterable user stores.',
    simple: 'The stolen records contained specific data labels and formatting tags unique to the Iterable marketing platform.',
    researcher: 'Scott Helme',
    evidence: 'Direct comparison of customer notification records against Iterable customer profile attributes.',
    note: 'This establishes that the compromised dataset originated from an Iterable marketing instance, reinforcing the credential leakage vector.',
    sourceTitle: 'Scott Helme — No Hacking Required: The MAG Data Breach',
    sourceUrl: 'https://scotthelme.co.uk/no-hacking-required-manchester-airports-group-data-breach/',
    articleAnchor: 'what-we-know'
  },
  'customer-data-stolen': {
    id: 'customer-data-stolen',
    title: 'Customer Information Obtained (Wi-Fi, Parking, Fast Track, Lounges)',
    step: 'STEP 09 / EXFILTRATION',
    statusText: 'CONFIRMED ✓',
    statusClass: 'am-badge-confirmed',
    technical: 'MAG confirmed that customer information collected through airport ancillary services (Wi-Fi registration, car parking, Fast Track, and executive lounge bookings) was obtained by unauthorized parties.',
    simple: 'Personal information entered by passengers when booking airport parking, using Wi-Fi, or reserving lounge passes was copied by attackers.',
    researcher: 'Manchester Airports Group',
    evidence: 'MAG Official Customer Advisory & ICO regulatory notification.',
    note: 'CONFIRMED: Payment card details and banking data were NOT stored in the affected system and were NOT compromised.',
    sourceTitle: 'MAG Official Incident Statement & FAQs',
    sourceUrl: 'https://www.manchesterairport.co.uk/help/data-security-incident/',
    articleAnchor: 'what-actually-happened'
  },
  'affected-customers': {
    id: 'affected-customers',
    title: 'Approximately 8.7–8.8 Million Customers Affected',
    step: 'STEP 10 / INCIDENT SCOPE',
    statusText: 'CONFIRMED ✓',
    statusClass: 'am-badge-confirmed',
    technical: 'Breach verification service Have I Been Pwned loaded 8,728,311 unique exposed customer email records, matching reporting across national and cybersecurity media outlets.',
    simple: 'Roughly 8.7 million customers who used MAG airport services were included in the database.',
    researcher: 'Troy Hunt / Have I Been Pwned',
    evidence: 'Have I Been Pwned breach catalog entry (8,728,311 records); media confirmations.',
    note: 'IMPORTANT CONTEXT: 8.7 million records does NOT mean every customer had every field (e.g., license plate or phone) populated or exposed.',
    sourceTitle: 'Troy Hunt (HIBP) — Weekly Update 521: Breach Perception v. Reality',
    sourceUrl: 'https://www.troyhunt.com/weekly-update-521/',
    articleAnchor: 'what-actually-happened'
  },
  'extortion-publication': {
    id: 'extortion-publication',
    title: 'Extortion Demand Refused; Data Published on Dark Web',
    step: 'STEP 11 / EXTORTION OUTCOME',
    statusText: 'CONFIRMED ✓',
    statusClass: 'am-badge-confirmed',
    technical: 'Following MAG\'s refusal to negotiate or pay extortion demands in compliance with UK law enforcement guidance, the threat actor leaked an 86 GB archive containing customer tables onto dark web forums.',
    simple: 'The hackers demanded a ransom payment, but the airport group refused to pay. The criminals then published the files on the dark web.',
    researcher: 'Threat Intelligence Reporting (BleepingComputer, MoxFive, SecurityWeek)',
    evidence: 'Dark web publication records, threat intelligence telemetry, and MAG advisories.',
    note: 'The primary continuing risk to passengers is secondary spear-phishing, spoofed parking notices, and vehicle-targeted social engineering.',
    sourceTitle: 'Bleeping Computer — FulcrumSec Claims Manchester Airports Hack, Theft of 86 GB',
    sourceUrl: 'https://www.bleepingcomputer.com/news/security/fulcrumsec-claims-manchester-airports-hack-theft-of-86-gb-of-data/',
    articleAnchor: 'second-attack'
  }
};

function initAttackMap() {
  const mapSection = document.getElementById('attack-map');
  if (!mapSection) return;

  // 1. Tab Switching
  const tabs = mapSection.querySelectorAll('.am-tab-btn');
  const panes = mapSection.querySelectorAll('.am-view-pane');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panes.forEach(p => p.classList.remove('is-active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const activePane = document.getElementById(`pane-${target}`);
      if (activePane) activePane.classList.add('is-active');
    });
  });

  // 2. Drawer / Bottom Sheet elements
  const drawer = document.getElementById('amDrawer');
  const overlay = document.getElementById('amDrawerOverlay');
  const closeBtn = document.getElementById('amDrawerClose');
  const drawerTitle = document.getElementById('amDrawerTitle');
  const drawerStep = document.getElementById('amDrawerStep');
  const drawerBadge = document.getElementById('amDrawerBadge');
  const drawerTech = document.getElementById('amDrawerTech');
  const drawerSimple = document.getElementById('amDrawerSimple');
  const drawerResearcher = document.getElementById('amDrawerResearcher');
  const drawerEvidence = document.getElementById('amDrawerEvidence');
  const drawerNote = document.getElementById('amDrawerNote');
  const drawerSourceLink = document.getElementById('amDrawerSourceLink');
  const drawerReadArticle = document.getElementById('amDrawerReadArticle');

  function openNode(nodeId) {
    const data = AM_NODE_DATA[nodeId];
    if (!data || !drawer) return;

    // Highlight node on map
    mapSection.querySelectorAll('.am-node').forEach(n => {
      n.classList.toggle('is-selected', n.dataset.nodeId === nodeId);
    });

    // Populate drawer
    if (drawerTitle) drawerTitle.textContent = data.title;
    if (drawerStep) drawerStep.textContent = data.step;
    if (drawerBadge) {
      drawerBadge.textContent = data.statusText;
      drawerBadge.className = `am-badge ${data.statusClass}`;
    }
    if (drawerTech) drawerTech.textContent = data.technical;
    if (drawerSimple) drawerSimple.textContent = data.simple;
    if (drawerResearcher) drawerResearcher.textContent = data.researcher;
    if (drawerEvidence) drawerEvidence.textContent = data.evidence;
    if (drawerNote) drawerNote.textContent = data.note;

    if (drawerSourceLink) {
      drawerSourceLink.href = data.sourceUrl;
      drawerSourceLink.textContent = `View Source: ${data.sourceTitle} ↗`;
      drawerSourceLink.target = '_blank';
      drawerSourceLink.rel = 'noopener noreferrer';
    }

    if (drawerReadArticle) {
      drawerReadArticle.href = `#${data.articleAnchor}`;
      drawerReadArticle.onclick = (e) => {
        e.preventDefault();
        closeDrawer();
        const targetEl = document.getElementById(data.articleAnchor);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetEl.style.transition = 'background-color 0.4s ease';
          const originalBg = targetEl.style.backgroundColor;
          targetEl.style.backgroundColor = '#EFF6FF';
          setTimeout(() => {
            targetEl.style.backgroundColor = originalBg;
          }, 1800);
        }
      };
    }

    // Open drawer
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('is-open');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.remove('is-open');
    mapSection.querySelectorAll('.am-node').forEach(n => n.classList.remove('is-selected'));
  }

  // Node Click Handlers
  mapSection.querySelectorAll('.am-node').forEach(node => {
    node.addEventListener('click', () => {
      openNode(node.dataset.nodeId);
    });
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openNode(node.dataset.nodeId);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // 3. Accordion Handler for "What We Still Don't Know"
  mapSection.querySelectorAll('.am-acc-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.am-acc-item');
      if (!item) return;
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      header.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // 4. Entry Point & In-Article cross links
  const entryBtn = document.getElementById('exploreAttackMapBtn');
  if (entryBtn) {
    entryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Cross-links in article pointing to specific nodes
  document.querySelectorAll('[data-open-node]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const nodeId = link.getAttribute('data-open-node');
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Ensure Map tab is active
      const mapTab = mapSection.querySelector('.am-tab-btn[data-tab="map"]');
      if (mapTab && !mapTab.classList.contains('active')) {
        mapTab.click();
      }

      setTimeout(() => {
        openNode(nodeId);
      }, 400);
    });
  });
}

/* ── SECURITY ENFORCEMENT & OUTBOUND LINKS ────────────────────── */
function initSecurityDefenses() {
  // Ensure all outbound links explicitly enforce rel="noopener noreferrer"
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    const rel = (a.getAttribute('rel') || '').toLowerCase();
    if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Accessible dropdown toggling for keyboard/mobile
  const dropdown = document.querySelector('.nav-dropdown');
  const trigger = document.querySelector('.nav-dropdown .cta-split');
  if (dropdown && trigger) {
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!expanded));
      }
    });
  }
}

/* ── THEME (DARK / LIGHT) ────────────────────────────────────── */
function getSystemTheme() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (_) {
    return 'light';
  }
}

function getStoredTheme() {
  try {
    return localStorage.getItem('ci_theme');
  } catch (_) {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem('ci_theme', theme);
  } catch (_) {}
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  try {
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    const icon = btn.querySelector('.theme-icon') || btn.querySelector('.theme-icon-dark');
    const label = btn.querySelector('.theme-label');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    if (label) label.textContent = isDark ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });

  document.querySelectorAll('.fb-theme-toggle').forEach(btn => {
    const icon = btn.querySelector('.fb-theme-icon');
    const text = btn.querySelector('.fb-theme-text');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    if (text) text.textContent = isDark ? 'Light mode' : 'Dark mode';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setStoredTheme(next);
  applyTheme(next);
  showToast(next === 'dark' ? 'Dark mode enabled' : 'Light mode enabled', next === 'dark' ? '🌙' : '☀️');
}
window.toggleTheme = toggleTheme;

function initTheme() {
  const stored = getStoredTheme();
  const initial = stored || getSystemTheme();
  applyTheme(initial);

  document.querySelectorAll('.theme-toggle-btn, .fb-theme-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  });

  try {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!getStoredTheme()) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  } catch (_) {}
}

/* ── INIT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initProgress();
  initMobileMenu();
  initLike();
  initClap();
  initToc();
  initScroll();
  initSeriesFilter();
  initFeedback();
  initAttackMap();
  initSecurityDefenses();
});

