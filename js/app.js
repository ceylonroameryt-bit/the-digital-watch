/* ============================================================
   app.js — Threat Brief Research Blog
   Handles: reading progress, mobile menu, engagement (like/clap),
            ToC highlight, smooth scroll, copy link, share tracking
   ============================================================ */

'use strict';

const ARTICLE_KEY = 'threatbrief_ai_scams_v3';

/* ── TOAST ──────────────────────────────────────────────────── */
function showToast(msg, emoji = '✓') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${emoji}</span><span>${msg}</span>`;
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
  const btn  = document.getElementById('mobileBtn') || document.getElementById('mBtn');
  const menu = document.getElementById('navLinks');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── SERIES FILTER ───────────────────────────────────────────── */
function initSeriesFilter() {
  const tabs = document.querySelectorAll('.series-tab-btn');
  const cards = document.querySelectorAll('.ep-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
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
function copyLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => showToast('Link copied to clipboard', '🔗'))
    .catch(() => showToast('Copy the URL from your browser', '📋'));
}

/* ── LIKE ────────────────────────────────────────────────────── */
function initLike() {
  const s = getData();
  let liked = s.liked || false;
  let count = s.likeCnt !== undefined ? s.likeCnt : 0;

  const render = () => {
    document.querySelectorAll('.btn-like').forEach(btn => {
      btn.classList.toggle('liked', liked);
      const heart = btn.querySelector('.like-heart');
      if (heart) heart.textContent = liked ? '❤️' : '🤍';
    });
    document.querySelectorAll('.like-count').forEach(cnt => {
      cnt.textContent = count;
    });
  };

  render();

  document.querySelectorAll('.btn-like').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      liked = !liked;
      count = liked ? count + 1 : count - 1;
      saveData({ liked, likeCnt: count });
      render();
      if (liked) showToast('Thanks for the like! ❤️', '❤️');
    });
  });
}

function toggleLike() {
  const first = document.querySelector('.btn-like');
  if (first) first.click();
}

/* ── CLAP ────────────────────────────────────────────────────── */
function initClap() {
  const s = getData();
  let claps   = s.claps   !== undefined ? s.claps   : 0;
  let myClaps = s.myClaps !== undefined ? s.myClaps : 0;
  const MAX   = 50;

  const render = () => {
    document.querySelectorAll('.btn-clap').forEach(btn => {
      btn.classList.toggle('clapped', myClaps > 0);
      if (myClaps >= MAX) { btn.disabled = true; btn.title = 'Max claps reached!'; }
    });
    document.querySelectorAll('.clap-count').forEach(cnt => {
      cnt.textContent = claps >= 1000 ? `${(claps / 1000).toFixed(1)}k` : claps;
    });
  };

  render();

  document.querySelectorAll('.btn-clap').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (myClaps >= MAX) return;
      claps++; myClaps++;
      saveData({ claps, myClaps });
      render();
      btn.style.transform = 'scale(1.2) rotate(-6deg)';
      setTimeout(() => { btn.style.transform = ''; }, 200);
    });
  });
}

function addClap() {
  const first = document.querySelector('.btn-clap');
  if (first) first.click();
}

/* ── LINKEDIN SHARE ──────────────────────────────────────────── */
function trackShare() {
  showToast('Opening LinkedIn…', '🔗');
}

/* ── STORAGE HELPERS ─────────────────────────────────────────── */
function getData() {
  try { return JSON.parse(localStorage.getItem(ARTICLE_KEY) || '{}'); }
  catch { return {}; }
}

function saveData(patch) {
  try {
    const s = getData();
    localStorage.setItem(ARTICLE_KEY, JSON.stringify({ ...s, ...patch }));
  } catch {}
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
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 66;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 16, behavior: 'smooth' });
    });
  });
}

/* ── FEEDBACK & DISCUSSION ───────────────────────────────────── */
function initFeedback() {
  const fbContainer = document.getElementById('feedback');
  if (!fbContainer) return;

  // 1. Reactions handling
  const reactionButtons = fbContainer.querySelectorAll('.fb-react-btn');
  const storedReactions = JSON.parse(localStorage.getItem('threatbrief_fb_reactions_v3') || '{}');

  reactionButtons.forEach(btn => {
    const key = btn.getAttribute('data-reaction');
    const countEl = btn.querySelector('.fb-cnt');
    if (!countEl) return;
    let count = parseInt(countEl.textContent, 10) || 0;
    
    if (storedReactions[key]) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      const isActive = btn.classList.toggle('active');
      storedReactions[key] = isActive;
      count = isActive ? count + 1 : Math.max(0, count - 1);
      countEl.textContent = count;
      localStorage.setItem('threatbrief_fb_reactions', JSON.stringify(storedReactions));
      
      const label = btn.getAttribute('data-label') || 'reaction';
      showToast(isActive ? `Marked as: ${label}!` : `Removed: ${label}`, isActive ? '👍' : 'ℹ️');
    });
  });

  // 2. Chip selector
  const chips = fbContainer.querySelectorAll('.fb-chip-opt');
  let selectedCategory = 'General Feedback';
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedCategory = chip.getAttribute('data-category') || chip.textContent.trim();
    });
  });

  // 3. User comments storage & render
  const readerStream = fbContainer.querySelector('#fbReaderComments') || fbContainer.querySelector('#fbCommentsList');
  const emptyState = fbContainer.querySelector('#fbEmptyState');
  const COMMENTS_KEY = 'ci_reader_comments_v1';

  function isSpamOrTest(c) {
    if (!c) return true;
    if (['fb-01', 'fb-02', 'fb-03'].includes(c.id)) return true;
    const msg = (c.message || '').toLowerCase();
    if (msg.includes('gffdghxdfhxdfghxfgd')) return true;
    return false;
  }

  function getComments() {
    try {
      const stored = localStorage.getItem(COMMENTS_KEY);
      if (stored) {
        let parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(c => !isSpamOrTest(c));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(COMMENTS_KEY, JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
      
      // Check legacy keys for any real user comments
      const oldKeys = ['threatbrief_user_comments_v3', 'threatbrief_user_comments_v2', 'threatbrief_user_comments', 'dw_user_comments'];
      for (const k of oldKeys) {
        const oldRaw = localStorage.getItem(k);
        if (oldRaw) {
          try {
            let oldList = JSON.parse(oldRaw);
            if (Array.isArray(oldList)) {
              oldList = oldList.filter(c => !isSpamOrTest(c));
              if (oldList.length > 0) {
                localStorage.setItem(COMMENTS_KEY, JSON.stringify(oldList));
                localStorage.removeItem(k);
                return oldList;
              }
            }
          } catch(e) {}
          localStorage.removeItem(k);
        }
      }

      return [];
    } catch(e) {
      return [];
    }
  }

  function saveComments(list) {
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(list));
    } catch(e) {}
  }

  function renderComment(c, prepend = false, isNew = false) {
    if (!readerStream) return;
    if (emptyState) emptyState.style.display = 'none';

    const card = document.createElement('div');
    card.className = `fb-comment ${isNew ? 'is-new' : ''}`;
    card.setAttribute('data-id', c.id || '');
    const initials = (c.name || 'AD').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'RD';
    
    card.innerHTML = `
      <div class="fb-c-top">
        <div class="fb-c-user">
          <div class="fb-c-av">${initials}</div>
          <div>
            <div class="fb-c-name">${escapeHtml(c.name || 'Reader')}</div>
            <div class="fb-c-role">${escapeHtml(c.role || 'Security Practitioner')}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="fb-c-badge">${escapeHtml(c.category || 'General Feedback')}</span>
          <span class="fb-c-time">${escapeHtml(c.time || 'Recent')}</span>
        </div>
      </div>
      <p class="fb-c-body">${escapeHtml(c.message)}</p>
    `;

    if (prepend) {
      readerStream.prepend(card);
    } else {
      readerStream.appendChild(card);
    }
    return card;
  }

  // Load and display comments
  const savedComments = getComments();
  if (savedComments.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    savedComments.forEach(c => renderComment(c, false, false));
  }

  // Expose global helper for admin panel
  window.CI_FEEDBACK = {
    getComments,
    saveComments,
    deleteComment: (id) => {
      const all = getComments().filter(item => item.id !== id);
      saveComments(all);
      return all;
    }
  };

  // 4. Form submit handling
  const form = fbContainer.querySelector('#fbForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = form.querySelector('#fbName');
      const roleInput = form.querySelector('#fbRole');
      const msgInput  = form.querySelector('#fbMessage');

      const message = msgInput ? msgInput.value.trim() : '';
      if (!message) {
        showToast('Please enter your feedback before submitting', '⚠️');
        if (msgInput) msgInput.focus();
        return;
      }

      const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Anonymous Defender';
      const role = (roleInput && roleInput.value.trim()) ? roleInput.value.trim() : 'Practitioner';
      
      const newComment = {
        id: 'fb-' + Date.now(),
        name,
        role,
        category: selectedCategory,
        message,
        time: 'Just now'
      };

      const current = getComments();
      current.unshift(newComment);
      saveComments(current);

      const renderedCard = renderComment(newComment, true, true);
      if (renderedCard) {
        renderedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Reset form
      if (msgInput) msgInput.value = '';
      if (nameInput) nameInput.value = '';
      if (roleInput) roleInput.value = '';

      showToast('Thank you! Your feedback has been posted.', '✅');
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
});
