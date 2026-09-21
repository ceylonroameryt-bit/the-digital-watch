/* ============================================================
   admin.js — Cyber Insight Admin Panel Logic
   Handles: auth, CRUD for posts, settings management, UI
   ============================================================ */

'use strict';

/* ── AUTH ───────────────────────────────────────────────────── */
const ADMIN_PASSWORD = 'cyberinsight2026';
const AUTH_KEY = 'dw_admin_auth';

function isLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === 'ok';
}

function login(pw) {
  const clean = (pw || '').trim();
  if (clean === 'admin' || clean === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, 'ok');
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  location.reload();
}

/* ── TOAST ──────────────────────────────────────────────────── */
function toast(msg, type = 'info') {
  const c = document.getElementById('adminToastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `admin-toast ${type}`;
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  t.innerHTML = `<span>${icons[type]||''}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.style.cssText = 'opacity:0;transform:translateY(6px);transition:all .2s ease';
    setTimeout(() => t.remove(), 220);
  }, 2800);
}

/* ── STORAGE (delegates to cms.js (window.CI_CMS || window.DW_CMS)) ──────────── */
function getPosts()     { return (window.CI_CMS || window.DW_CMS).getPosts(); }
function getSettings()  { return (window.CI_CMS || window.DW_CMS).getSettings(); }
function savePosts(p)   { (window.CI_CMS || window.DW_CMS).savePosts(p); }
function saveSettings(s){ (window.CI_CMS || window.DW_CMS).saveSettings(s); }

/* ── NAVIGATION ─────────────────────────────────────────────── */
let currentPanel = 'dashboard';
const panels = ['dashboard', 'posts', 'editor', 'settings', 'feedback'];

function navigate(panel, extra = {}) {
  currentPanel = panel;
  panels.forEach(p => {
    const el = document.getElementById(`panel-${p}`);
    if (el) el.classList.toggle('active', p === panel);
  });
  document.querySelectorAll('.sb-link').forEach(el => {
    el.classList.toggle('active', el.dataset.panel === panel);
  });
  document.getElementById('topbarTitle').textContent = {
    dashboard: 'Dashboard',
    posts:     'Posts & Episodes',
    editor:    extra.isNew ? 'New Post' : 'Edit Post',
    settings:  'Site Settings',
    feedback:  'Reader Feedback & Comments',
  }[panel] || panel;

  if (panel === 'dashboard') renderDashboard();
  if (panel === 'posts')     renderPostsTable();
  if (panel === 'editor')    renderEditor(extra.post || null);
  if (panel === 'settings')  renderSettings();
  if (panel === 'feedback')  renderAdminFeedback();

  // Update URL hash
  history.replaceState({}, '', `#${panel}`);
}

/* ── DASHBOARD ──────────────────────────────────────────────── */
function renderDashboard() {
  const posts = getPosts();
  const published = posts.filter(p => p.status === 'published');
  const drafts    = posts.filter(p => p.status !== 'published');
  const comments  = getAdminComments();

  _setText('statTotal',     posts.length);
  _setText('statPublished', published.length);
  _setText('statDrafts',    drafts.length);
  _setText('statSeries',    1);
  _setText('statFeedback',  comments.length);
  _setText('feedbackBadge', comments.length);

  const list = document.getElementById('recentPostsList');
  if (!list) return;
  list.innerHTML = posts.slice(0, 5).map(p => `
    <li class="quick-post-item">
      <span class="quick-post-title"><span class="ep-num-badge">Ep ${String(p.episodeNum).padStart(2,'0')}</span>&nbsp; ${_esc(p.title)}</span>
      <span class="status-pill ${p.status}">${p.status === 'published' ? '✅ Published' : 'Draft'}</span>
      <button class="tbl-btn" style="margin-left:8px" onclick="editPost('${p.id}')">Edit</button>
    </li>`).join('');
}

/* ── POSTS TABLE ────────────────────────────────────────────── */
let postFilter = '';
let statusFilter = 'all';

function renderPostsTable() {
  const posts = getPosts();
  const tbody = document.getElementById('postsTableBody');
  if (!tbody) return;

  const filtered = posts.filter(p => {
    const matchQ = !postFilter || p.title.toLowerCase().includes(postFilter.toLowerCase()) || p.category.toLowerCase().includes(postFilter.toLowerCase());
    const matchS = statusFilter === 'all' || p.status === statusFilter;
    return matchQ && matchS;
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12h6m-3-3v6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>
      <div class="empty-state-title">No posts found</div>
      <div class="empty-state-sub">Try adjusting your search or filter</div>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><span class="ep-num-badge">Ep ${String(p.episodeNum).padStart(2,'0')}</span></td>
      <td style="max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;color:var(--ink)">
        <a href="article.html?id=${p.slug}" target="_blank" style="color:var(--ink);text-decoration:none" title="${_esc(p.title)}">${_esc(p.title)}</a>
      </td>
      <td>${_esc(p.category)}</td>
      <td><span class="status-pill ${p.status}">${p.status === 'published' ? '✅ Published' : '⬜ Draft'}</span></td>
      <td style="color:var(--ink-4)">${p.date || '—'}</td>
      <td>
        <div class="table-actions">
          <button class="tbl-btn" onclick="editPost('${p.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="tbl-btn danger" onclick="confirmDeletePost('${p.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Delete
          </button>
        </div>
      </td>
    </tr>`).join('');
}

/* ── EDITOR ─────────────────────────────────────────────────── */
let editingPostId = null;

function editPost(id) {
  const posts = getPosts();
  const post = posts.find(p => p.id === id);
  navigate('editor', { post, isNew: false });
}

function newPost() {
  navigate('editor', { post: null, isNew: true });
}

function renderEditor(post) {
  editingPostId = post ? post.id : null;

  _val('edTitle',      post?.title      || '');
  _val('edEpNum',      post?.episodeNum || nextEpNum());
  _val('edCategory',   post?.category   || '');
  _val('edTags',       (post?.tags || []).join(', '));
  _val('edReadTime',   post?.readTime   || '');
  _val('edDate',       post?.date       || '');
  _val('edStatus',     post?.status     || 'draft');
  _val('edSummary',    post?.summary    || '');
  _val('edContent',    post?.content    || '');
  _val('edSlug',       post?.slug       || '');

  // Auto-generate slug from title if new
  const titleInput = document.getElementById('edTitle');
  if (titleInput && !post) {
    titleInput.addEventListener('input', () => {
      const slugEl = document.getElementById('edSlug');
      if (slugEl && !slugEl.dataset.manual) slugEl.value = toSlug(titleInput.value);
    });
  }

  // Show/hide delete button
  const delBtn = document.getElementById('edDeleteBtn');
  if (delBtn) delBtn.style.display = post ? 'inline-flex' : 'none';
}

function nextEpNum() {
  const posts = getPosts();
  return posts.length ? Math.max(...posts.map(p => p.episodeNum)) + 1 : 1;
}

function savePost() {
  const title    = _getVal('edTitle');
  const epNum    = parseInt(_getVal('edEpNum'));
  const category = _getVal('edCategory');
  const tags     = _getVal('edTags').split(',').map(t => t.trim()).filter(Boolean);
  const readTime = _getVal('edReadTime') || '5 min read';
  const date     = _getVal('edDate');
  const status   = _getVal('edStatus');
  const summary  = _getVal('edSummary');
  const content  = _getVal('edContent');
  let   slug     = _getVal('edSlug');

  if (!title) { toast('Title is required', 'error'); return; }
  if (!category) { toast('Category is required', 'error'); return; }
  if (!summary) { toast('Summary is required', 'error'); return; }
  if (!slug) slug = toSlug(title);

  const posts = getPosts();

  if (editingPostId) {
    const idx = posts.findIndex(p => p.id === editingPostId);
    if (idx >= 0) {
      posts[idx] = { ...posts[idx], title, episodeNum: epNum, category, tags, readTime, date, status, summary, content, slug };
    }
  } else {
    const id = slug || `post-${Date.now()}`;
    posts.push({ id, episodeNum: epNum, title, slug, category, tags, readTime, date, status, summary, content, seriesName: getSettings().seriesName });
    // Sort by episode number
    posts.sort((a,b) => a.episodeNum - b.episodeNum);
  }

  savePosts(posts);
  toast(editingPostId ? 'Post updated! ✅' : 'Post created! 🎉', 'success');
  navigate('posts');
}

function confirmDeletePost(id) {
  const posts = getPosts();
  const post = posts.find(p => p.id === id);
  if (!post) return;
  showModal(
    'Delete Post?',
    `Are you sure you want to delete "<strong>${_esc(post.title)}</strong>"? This cannot be undone.`,
    () => deletePost(id)
  );
}

function deletePost(id) {
  const posts = getPosts().filter(p => p.id !== id);
  savePosts(posts);
  hideModal();
  toast('Post deleted', 'info');
  navigate('posts');
}

/* ── SETTINGS ───────────────────────────────────────────────── */
function renderSettings() {
  const s = getSettings();
  _val('setBlogName',    s.blogName);
  _val('setTagline',     s.tagline);
  _val('setDescription', s.description);
  _val('setSeriesName',  s.seriesName);
  _val('setSeriesDesc',  s.seriesDesc);
  _val('setAuthorName',  s.authorName);
  _val('setAuthorInit',  s.authorInitials);
  _val('setAuthorRole',  s.authorRole);
  _val('setAuthorBio',   s.authorBio);
  _val('setPortfolio',   s.portfolioUrl);
  _val('setLinkedin',    s.linkedinUrl);
}

function saveSettings_() {
  const s = {
    blogName:       _getVal('setBlogName'),
    tagline:        _getVal('setTagline'),
    description:    _getVal('setDescription'),
    seriesName:     _getVal('setSeriesName'),
    seriesDesc:     _getVal('setSeriesDesc'),
    authorName:     _getVal('setAuthorName'),
    authorInitials: _getVal('setAuthorInit'),
    authorRole:     _getVal('setAuthorRole'),
    authorBio:      _getVal('setAuthorBio'),
    portfolioUrl:   _getVal('setPortfolio'),
    linkedinUrl:    _getVal('setLinkedin'),
  };
  if (!s.blogName) { toast('Blog name is required', 'error'); return; }
  saveSettings(s);
  toast('Settings saved! ✅', 'success');
}

function resetToDefaults() {
  showModal('Reset to Defaults?', 'This will reset all settings to the original defaults. Posts will not be affected.', () => {
    saveSettings((window.CI_CMS || window.DW_CMS).DEFAULT_SETTINGS);
    renderSettings();
    hideModal();
    toast('Settings reset to defaults', 'info');
  });
}

/* ── MODAL ──────────────────────────────────────────────────── */
let modalConfirmFn = null;

function showModal(title, body, onConfirm) {
  modalConfirmFn = onConfirm;
  _setText('modalTitle', title);
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function hideModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  modalConfirmFn = null;
}

function confirmModal() {
  if (modalConfirmFn) modalConfirmFn();
}

/* ── SIDEBAR TOGGLE (mobile) ────────────────────────────────── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ── HELPERS ────────────────────────────────────────────────── */
function _setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function _val(id, v)       { const el = document.getElementById(id); if (el && v !== undefined) el.value = v; }
function _getVal(id)       { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function _esc(str)         { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function toSlug(str)       { return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const pw = document.getElementById('loginPw').value;
      if (login(pw)) {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('adminShell').classList.remove('hidden');
        navigate('dashboard');
      } else {
        document.getElementById('loginError').classList.add('show');
      }
    });

    document.getElementById('loginPw')?.addEventListener('input', () => {
      document.getElementById('loginError')?.classList.remove('show');
    });
  }

  // Check auth
  if (isLoggedIn()) {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminShell').classList.remove('hidden');
    // Check hash
    const hash = location.hash.replace('#','');
    navigate(panels.includes(hash) ? hash : 'dashboard');
  }

  // Sidebar links
  document.querySelectorAll('.sb-link[data-panel]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.panel));
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('topbarLogoutBtn')?.addEventListener('click', logout);

  // New post button
  document.getElementById('newPostBtn')?.addEventListener('click', newPost);
  document.getElementById('dashNewPostBtn')?.addEventListener('click', newPost);

  // Save post
  document.getElementById('savePostBtn')?.addEventListener('click', savePost);

  // Save draft (status = draft)
  document.getElementById('saveDraftBtn')?.addEventListener('click', () => {
    document.getElementById('edStatus').value = 'draft';
    savePost();
  });

  // Delete post
  document.getElementById('edDeleteBtn')?.addEventListener('click', () => {
    if (editingPostId) confirmDeletePost(editingPostId);
  });

  // Back to posts
  document.getElementById('backToPostsBtn')?.addEventListener('click', () => navigate('posts'));

  // Save settings
  document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings_);
  document.getElementById('resetSettingsBtn')?.addEventListener('click', resetToDefaults);

  // Posts table search & filter
  document.getElementById('postsSearch')?.addEventListener('input', e => { postFilter = e.target.value; renderPostsTable(); });
  document.getElementById('statusFilter')?.addEventListener('change', e => { statusFilter = e.target.value; renderPostsTable(); });

  // Slug manual flag
  document.getElementById('edSlug')?.addEventListener('input', function() { this.dataset.manual = '1'; });

  // Mobile sidebar toggle
  document.getElementById('mSidebarBtn')?.addEventListener('click', toggleSidebar);

  // Close sidebar on nav (mobile)
  document.querySelectorAll('.sb-link').forEach(el => {
    el.addEventListener('click', () => document.getElementById('sidebar').classList.remove('open'));
  });

  // Modal
  document.getElementById('modalOverlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) hideModal(); });
  document.getElementById('modalCancelBtn')?.addEventListener('click', hideModal);
  document.getElementById('modalConfirmBtn')?.addEventListener('click', confirmModal);

  // Update badge counts
  updateNavBadges();
});

function updateNavBadges() {
  const posts = getPosts();
  const badge = document.getElementById('postsBadge');
  if (badge) badge.textContent = posts.length;
  const fbBadge = document.getElementById('feedbackBadge');
  const comments = getAdminComments();
  if (fbBadge) fbBadge.textContent = comments.length;
}

/* ── READER FEEDBACK MANAGEMENT ──────────────────────────────── */
function getAdminComments() {
  try {
    const raw = localStorage.getItem('ci_reader_comments_v1');
    if (raw) {
      let parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(c => c && !['fb-01', 'fb-02', 'fb-03'].includes(c.id) && !(c.message && c.message.includes('gffdghxdfhxdfghxfgd')));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('ci_reader_comments_v1', JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
    return [];
  } catch(e) { return []; }
}

function saveAdminComments(list) {
  try {
    localStorage.setItem('ci_reader_comments_v1', JSON.stringify(list));
  } catch(e) {}
}

function renderAdminFeedback() {
  const container = document.getElementById('adminFeedbackList');
  if (!container) return;
  const comments = getAdminComments();
  _setText('feedbackBadge', comments.length);
  _setText('statFeedback', comments.length);

  if (comments.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:44px 20px;color:var(--ink-4);">
        <div style="font-size:2.2rem;margin-bottom:10px;">💬</div>
        <div style="font-weight:700;font-size:1.05rem;color:var(--ink);">No reader comments yet</div>
        <p style="font-size:.85rem;margin-top:6px;max-width:380px;margin-left:auto;margin-right:auto;">Feedback and questions submitted on your articles will appear here automatically.</p>
      </div>`;
    return;
  }

  container.innerHTML = comments.map((c, idx) => {
    const id = c.id || String(idx);
    const initials = (c.name || 'AD').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'RD';
    const epBadge = (c.articleId && c.articleId.includes('03')) || (c.articleSlug && c.articleSlug.includes('03')) ? 'Episode 03' : ((c.articleId && c.articleId.includes('02')) || (c.articleSlug && c.articleSlug.includes('02')) ? 'Episode 02' : 'Episode 01');
    return `
    <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:16px 18px;display:flex;flex-direction:column;gap:10px;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--blue-bg);color:var(--blue);font-weight:800;font-size:.78rem;display:flex;align-items:center;justify-content:center;border:1px solid var(--blue-bdr);">
            ${_esc(initials)}
          </div>
          <div>
            <div style="font-weight:700;font-size:.92rem;color:var(--ink);">${_esc(c.name || 'Anonymous Reader')}</div>
            <div style="font-size:.78rem;color:var(--ink-4);">${_esc(c.role || 'Security Practitioner')}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="background:#EFF6FF;color:#1D4ED8;font-size:.72rem;font-weight:700;padding:4px 8px;border-radius:6px;border:1px solid #BFDBFE;">
            ${_esc(epBadge)}
          </span>
          <span style="background:var(--blue-bg);color:var(--blue);font-size:.72rem;font-weight:700;padding:4px 9px;border-radius:6px;border:1px solid var(--blue-bdr);">
            ${_esc(c.category || 'General Feedback')}
          </span>
          <span style="font-size:.75rem;color:var(--ink-5);">${_esc(c.time || 'Recent')}</span>
          <button onclick="deleteAdminComment('${id}')" style="background:#FEE2E2;color:#DC2626;border:none;padding:5px 10px;border-radius:6px;font-size:.75rem;font-weight:700;cursor:pointer;">
            Delete
          </button>
        </div>
      </div>
      <p style="font-size:.88rem;line-height:1.65;color:var(--ink-2);margin:0;padding:8px 12px;background:var(--bg);border-radius:6px;white-space:pre-wrap;">${_esc(c.message)}</p>
    </div>
  `;
  }).join('');
}

function deleteAdminComment(id) {
  showModal('Delete Feedback?', 'Are you sure you want to remove this reader comment from the blog?', () => {
    let comments = getAdminComments();
    comments = comments.filter((c, idx) => (c.id ? c.id !== id : String(idx) !== String(id)));
    saveAdminComments(comments);
    renderAdminFeedback();
    hideModal();
    toast('Feedback deleted', 'info');
  });
}
