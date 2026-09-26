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

/* ── TOC HIGHLIGHT ───────────────────────────────────────────── */
function initToc() {
  const headings = document.querySelectorAll('.art-body h2[id]');
  const tocLinks = document.querySelectorAll('.toc-list a');
  if (!headings.length || !tocLinks.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tocLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`);
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(h => obs.observe(h));
}

/* ── SMOOTH SCROLL ───────────────────────────────────────────── */
function initScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;
      let id;
      try { id = decodeURIComponent(hash.slice(1)); } catch (_) { return; }
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 66;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 16, behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
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

/* ── INIT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initProgress();
  initMobileMenu();
  initLike();
  initClap();
  initToc();
  initScroll();
  initSeriesFilter();
  initFeedback();
  initSecurityDefenses();
});
