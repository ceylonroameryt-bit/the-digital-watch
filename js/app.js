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

/* ── STORAGE HELPERS ─────────────────────────────────────────── */
function getData() {
  try {
    const key = getArticleKey();
    let raw = localStorage.getItem(key);
    if (!raw && (key === 'threatbrief_ep01' || key === 'threatbrief_ai_scams_v3')) {
      raw = localStorage.getItem('threatbrief_ai_scams_v3') || localStorage.getItem('threatbrief_ep01');
      if (raw) localStorage.setItem(key, raw);
    }
    return JSON.parse(raw || '{}');
  } catch (e) {
    return {};
  }
}

function saveData(patch) {
  try {
    const key = getArticleKey();
    const s = getData();
    const updated = { ...s, ...patch };
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
  const count = s.likeCnt !== undefined ? s.likeCnt : 0;
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
  let count = s.likeCnt !== undefined ? s.likeCnt : 0;
  count = liked ? count + 1 : Math.max(0, count - 1);
  saveData({ liked, likeCnt: count });
  renderLike(liked, count);
  if (liked) showToast('Thanks for the like! ❤️', '❤️');
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
      btn.title = 'Applaud this research';
    }
  });
  document.querySelectorAll('.clap-count').forEach(cnt => {
    cnt.textContent = claps >= 1000 ? `${(claps / 1000).toFixed(1)}k` : claps;
  });
}

function initClap() {
  const s = getData();
  const claps = s.claps !== undefined ? s.claps : 0;
  const myClaps = s.myClaps !== undefined ? s.myClaps : 0;
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
  let claps   = s.claps   !== undefined ? s.claps   : 0;
  let myClaps = s.myClaps !== undefined ? s.myClaps : 0;
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

  const currentArticleKey = getArticleKey();

  // 1. Reactions handling (stores user active state + reaction counts forever)
  const reactionButtons = fbContainer.querySelectorAll('.fb-react-btn');
  const REACTIONS_KEY = currentArticleKey + '_reactions';
  const REACTION_COUNTS_KEY = currentArticleKey + '_reaction_counts';

  let storedUserReactions = {};
  try {
    storedUserReactions = JSON.parse(
      localStorage.getItem(REACTIONS_KEY) || 
      (currentArticleKey.includes('ep01') || currentArticleKey.includes('ai_scams') ? localStorage.getItem('threatbrief_fb_reactions_v3') : null) || 
      '{}'
    );
  } catch (e) { storedUserReactions = {}; }

  let storedCounts = {};
  try {
    storedCounts = JSON.parse(localStorage.getItem(REACTION_COUNTS_KEY) || '{}');
  } catch (e) { storedCounts = {}; }

  reactionButtons.forEach(btn => {
    const key = btn.getAttribute('data-reaction');
    const countEl = btn.querySelector('.fb-cnt');
    if (!countEl) return;
    
    // Initial baseline count from HTML
    const htmlCount = parseInt(countEl.textContent, 10) || 0;
    if (storedCounts[key] === undefined) {
      storedCounts[key] = storedUserReactions[key] ? Math.max(htmlCount, 1) : htmlCount;
    }

    // Set count and active state
    countEl.textContent = storedCounts[key];
    if (storedUserReactions[key]) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.onclick = (e) => {
      e.preventDefault();
      const isActive = btn.classList.toggle('active');
      storedUserReactions[key] = isActive;
      storedCounts[key] = Math.max(0, (storedCounts[key] || 0) + (isActive ? 1 : -1));
      countEl.textContent = storedCounts[key];

      try {
        localStorage.setItem(REACTIONS_KEY, JSON.stringify(storedUserReactions));
        localStorage.setItem(REACTION_COUNTS_KEY, JSON.stringify(storedCounts));
        if (currentArticleKey.includes('ep01') || currentArticleKey.includes('ai_scams')) {
          localStorage.setItem('threatbrief_fb_reactions_v3', JSON.stringify(storedUserReactions));
        }
      } catch (e) {}

      const label = btn.getAttribute('data-label') || 'reaction';
      showToast(isActive ? `Marked as: ${label}!` : `Removed: ${label}`, isActive ? '👍' : 'ℹ️');
    };
  });

  // 2. Chip selector
  const chips = fbContainer.querySelectorAll('.fb-chip-opt');
  let selectedCategory = chips.length > 0 ? (chips[0].getAttribute('data-category') || chips[0].textContent.trim()) : 'General Feedback';
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
  const MAIN_COMMENTS_KEY = 'ci_reader_comments_v1';

  function isSpamOrTest(c) {
    if (!c || !c.message) return true;
    if (['fb-01', 'fb-02', 'fb-03'].includes(c.id)) return true;
    const msg = (c.message || '').toLowerCase();
    if (msg.includes('gffdghxdfhxdfghxfgd')) return true;
    return false;
  }

  function getAllComments() {
    try {
      let list = [];
      const stored = localStorage.getItem(MAIN_COMMENTS_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) list = parsed;
        } catch (e) {}
      }

      // Check legacy keys for any user comments and migrate them safely
      const oldKeys = [
        'threatbrief_user_comments_v3',
        'threatbrief_user_comments_v2',
        'threatbrief_user_comments',
        'dw_user_comments',
        'ci_reader_comments_threatbrief_ep01',
        'ci_reader_comments_threatbrief_ep02',
        'ci_reader_comments_threatbrief_ai_scams_v3'
      ];
      let migrated = false;
      for (const k of oldKeys) {
        const oldRaw = localStorage.getItem(k);
        if (oldRaw) {
          try {
            const oldList = JSON.parse(oldRaw);
            if (Array.isArray(oldList)) {
              oldList.forEach(c => {
                if (c && c.message && !isSpamOrTest(c)) {
                  const exists = list.some(item => item.id === c.id || (item.message === c.message && item.name === c.name));
                  if (!exists) {
                    list.push(c);
                    migrated = true;
                  }
                }
              });
            }
          } catch (e) {}
          // Clear legacy key so migrated/deleted comments are never resurrected
          localStorage.removeItem(k);
        }
      }

      const cleaned = list.filter(c => !isSpamOrTest(c));
      if (cleaned.length !== list.length || migrated) {
        localStorage.setItem(MAIN_COMMENTS_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (e) {
      return [];
    }
  }

  function saveAllComments(list) {
    try {
      localStorage.setItem(MAIN_COMMENTS_KEY, JSON.stringify(list));
      // Also mirror to article-specific key for backward compatibility
      localStorage.setItem('ci_reader_comments_' + currentArticleKey, JSON.stringify(getComments()));
    } catch (e) {}
  }

  function getComments() {
    const all = getAllComments();
    const isEp01 = currentArticleKey === 'threatbrief_ep01' || currentArticleKey === 'threatbrief_ai_scams_v3';
    return all.filter(c => {
      if (!c) return false;
      if (isEp01) {
        return !c.articleId || c.articleId === 'threatbrief_ep01' || c.articleId === 'threatbrief_ai_scams_v3' || c.articleId === 'ep01';
      }
      return c.articleId === currentArticleKey || (document.body.dataset.articleId && c.articleId === ('threatbrief_' + document.body.dataset.articleId));
    });
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
          <div class="fb-c-av">${escapeHtml(initials)}</div>
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

  // Expose global helper for admin panel and custom scripts
  window.CI_FEEDBACK = {
    getComments,
    getAllComments,
    saveComments: saveAllComments,
    deleteComment: (id) => {
      const all = getAllComments().filter(item => item.id !== id);
      saveAllComments(all);
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
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const newComment = {
        id: 'fb-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        articleId: currentArticleKey,
        articleSlug: window.location.pathname.includes('03') ? 'ep03-clicked-phishing-link' : window.location.pathname.includes('02') ? 'ep02-someone-has-your-email' : 'ep01-can-you-still-trust',
        articleTitle: document.querySelector('.art-h1')?.textContent?.trim() || document.querySelector('.art-title')?.textContent?.trim() || (currentArticleKey.includes('03') ? 'Episode 03: I Clicked a Phishing Link. What Should I Do?' : currentArticleKey.includes('02') ? 'Episode 02: Someone Has Your Email Address' : 'Episode 01: Can You Still Trust What You See'),
        name,
        role,
        category: selectedCategory,
        message,
        time: dateStr,
        createdAt: Date.now()
      };

      const all = getAllComments();
      all.unshift(newComment);
      saveAllComments(all);

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
