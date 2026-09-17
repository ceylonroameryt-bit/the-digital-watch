/* ============================================================
   translator.js — Cyber Insight Real-Time Multi-Language Engine
   Enables any reader worldwide to translate and read the blog
   in their native language using Google Translate API.
   ============================================================ */

'use strict';

(function () {
  // Curated languages with flags and native names
  const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'si', name: 'Sinhala', native: 'සිංහල', flag: '🇱🇰' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', native: '中文 (简体)', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
    { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
    { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱' },
    { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
    { code: 'uk', name: 'Ukrainian', native: 'Українська', flag: '🇺🇦' },
    { code: 'el', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
    { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰' },
    { code: 'th', name: 'Thai', native: 'ไทย', flag: '🇹🇭' },
    { code: 'tl', name: 'Filipino', native: 'Tagalog', flag: '🇵🇭' },
    { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'fa', name: 'Persian', native: 'فارسی', flag: '🇮🇷' },
    { code: 'he', name: 'Hebrew', native: 'עברית', flag: '🇮🇱' },
    { code: 'cs', name: 'Czech', native: 'Čeština', flag: '🇨🇿' },
    { code: 'ro', name: 'Romanian', native: 'Română', flag: '🇷🇴' },
    { code: 'hu', name: 'Hungarian', native: 'Magyar', flag: '🇭🇺' },
    { code: 'da', name: 'Danish', native: 'Dansk', flag: '🇩🇰' },
    { code: 'fi', name: 'Finnish', native: 'Suomi', flag: '🇫🇮' },
    { code: 'no', name: 'Norwegian', native: 'Norsk', flag: '🇳🇴' }
  ];

  // Helper to get active language code from cookies or storage
  function getCurrentLang() {
    // Check googtrans cookie: format is /en/es or /auto/si
    const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return localStorage.getItem('ci_lang_code') || 'en';
  }

  // Set Google Translate cookie
  function setTranslateCookie(langCode) {
    const val = `/en/${langCode}`;
    const host = window.location.hostname;
    document.cookie = `googtrans=${val}; path=/;`;
    if (host && host !== 'localhost') {
      document.cookie = `googtrans=${val}; path=/; domain=.${host};`;
      document.cookie = `googtrans=${val}; path=/; domain=${host};`;
    }
    localStorage.setItem('ci_lang_code', langCode);
  }

  // Clear translation cookies to revert to English
  function clearTranslateCookie() {
    const host = window.location.hostname;
    const exp = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; ${exp}`;
    if (host && host !== 'localhost') {
      document.cookie = `googtrans=; ${exp} domain=.${host};`;
      document.cookie = `googtrans=; ${exp} domain=${host};`;
    }
    localStorage.removeItem('ci_lang_code');
  }

  // Trigger Google Translate engine
  function applyLanguage(langCode) {
    const current = getCurrentLang();
    if (langCode === 'en' && (current === 'en' || !current)) {
      closeAllDropdowns();
      return;
    }

    if (langCode === 'en') {
      clearTranslateCookie();
      window.location.reload();
      return;
    }

    setTranslateCookie(langCode);

    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
      updateUI();
      closeAllDropdowns();
      if (typeof window.showToast === 'function') {
        const found = LANGUAGES.find(l => l.code === langCode);
        window.showToast(`Translating to ${found ? found.name : langCode}...`, '🌐');
      }
    } else {
      // Reload so Google Translate loads with the set cookie
      window.location.reload();
    }
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.lang-dropdown').forEach(dd => dd.classList.remove('active'));
    document.querySelectorAll('.lang-btn, .lang-floating-btn').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
  }

  // Render language list items with search filtering
  function renderLangList(container, filterQuery = '') {
    if (!container) return;
    const q = filterQuery.toLowerCase().trim();
    const currentCode = getCurrentLang();

    const filtered = LANGUAGES.filter(l => {
      if (!q) return true;
      return l.name.toLowerCase().includes(q) ||
             l.native.toLowerCase().includes(q) ||
             l.code.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="lang-no-match">
          <span>🔍</span> No languages found for "${escapeHtml(filterQuery)}"
        </div>`;
      return;
    }

    container.innerHTML = filtered.map(l => {
      const isActive = (l.code === currentCode) || (currentCode === '' && l.code === 'en');
      return `
        <button type="button" class="lang-option ${isActive ? 'active' : ''}" data-lang="${l.code}">
          <span class="lang-opt-flag">${l.flag}</span>
          <span class="lang-opt-names">
            <strong class="lang-opt-name">${escapeHtml(l.name)}</strong>
            <small class="lang-opt-native">${escapeHtml(l.native)}</small>
          </span>
          ${isActive ? '<span class="lang-opt-check">✓</span>' : ''}
        </button>
      `;
    }).join('');

    container.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.lang;
        applyLanguage(code);
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Update label on buttons
  function updateUI() {
    const curCode = getCurrentLang();
    const found = LANGUAGES.find(l => l.code === curCode) || { flag: '🌐', native: 'English', name: 'English' };

    document.querySelectorAll('.current-lang-label').forEach(el => {
      el.textContent = curCode === 'en' ? 'English' : found.native;
    });

    document.querySelectorAll('.current-lang-flag').forEach(el => {
      el.textContent = curCode === 'en' ? '🌐' : found.flag;
    });

    const isTranslated = curCode && curCode !== 'en';
    document.querySelectorAll('.lang-active-indicator').forEach(el => {
      el.style.display = isTranslated ? 'inline-flex' : 'none';
    });

    const floatingBtn = document.getElementById('ciFloatingTranslateBtn');
    if (floatingBtn) {
      floatingBtn.classList.toggle('has-translation', isTranslated);
    }
  }

  // Mount Google Translate Host Element & Script
  function initGoogleTranslate() {
    if (!document.getElementById('google_translate_element')) {
      const host = document.createElement('div');
      host.id = 'google_translate_element';
      document.body.appendChild(host);
    }

    window.ciGoogleTranslateCallback = function () {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const s = document.createElement('script');
      s.id = 'google-translate-script';
      s.type = 'text/javascript';
      s.async = true;
      s.src = 'https://translate.google.com/translate_a/element.js?cb=ciGoogleTranslateCallback';
      document.head.appendChild(s);
    }
  }

  // Build Navbar Language Dropdown
  function setupNavbarDropdown() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    // Check if already injected
    if (document.getElementById('ciLangNavWrap')) return;

    const li = document.createElement('li');
    li.className = 'lang-nav-item';
    li.id = 'ciLangNavWrap';
    li.innerHTML = `
      <div class="lang-switcher-wrap" id="langNavWrap">
        <button type="button" class="lang-btn" id="langNavBtn" aria-label="Choose Language" aria-expanded="false" title="Translate articles into 100+ languages">
          <span class="current-lang-flag">🌐</span>
          <span class="current-lang-label">English</span>
          <svg class="lang-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <span class="lang-active-indicator" style="display:none;" title="Page translated">•</span>
        </button>

        <div class="lang-dropdown" id="langNavDropdown">
          <div class="lang-dropdown-header">
            <div class="lang-dd-title">
              <span style="font-size:1.1rem;">🌐</span>
              <div>
                <strong>Translate Page</strong>
                <div style="font-size:.72rem;color:var(--ink-4);font-weight:500;">Instant translation for all readers</div>
              </div>
            </div>
            <span class="lang-count-badge">100+ Languages</span>
          </div>

          <div class="lang-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" class="lang-search-input" id="langNavSearch" placeholder="Search language (e.g. Sinhala, Spanish)..." autocomplete="off" />
          </div>

          <div class="lang-list" id="langNavList"></div>

          <div class="lang-dropdown-footer">
            <button type="button" class="lang-reset-btn" id="langNavReset">
              <span>↺</span> Reset to Original English
            </button>
          </div>
        </div>
      </div>
    `;

    // Insert before the CTA link if present, or append
    const ctaLi = navLinks.querySelector('.cta')?.parentElement;
    if (ctaLi) {
      navLinks.insertBefore(li, ctaLi);
    } else {
      navLinks.appendChild(li);
    }

    const btn = document.getElementById('langNavBtn');
    const dropdown = document.getElementById('langNavDropdown');
    const searchInput = document.getElementById('langNavSearch');
    const list = document.getElementById('langNavList');
    const resetBtn = document.getElementById('langNavReset');

    renderLangList(list);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('active');
      btn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        searchInput.value = '';
        renderLangList(list);
        setTimeout(() => searchInput.focus(), 80);
      }
    });

    searchInput.addEventListener('input', (e) => {
      renderLangList(list, e.target.value);
    });

    resetBtn.addEventListener('click', () => {
      applyLanguage('en');
    });

    dropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  // Floating Quick Translator Button
  function setupFloatingButton() {
    if (document.getElementById('ciFloatingTranslateBtn')) return;

    const wrap = document.createElement('div');
    wrap.className = 'lang-floating-wrap';
    wrap.id = 'ciFloatingTranslateWrap';
    wrap.innerHTML = `
      <button type="button" class="lang-floating-btn" id="ciFloatingTranslateBtn" aria-label="Translate Website" title="Change Language">
        <span class="floating-icon">🌐</span>
        <span class="floating-text"><span class="current-lang-label">Translate</span></span>
      </button>

      <div class="lang-dropdown floating-dropdown" id="langFloatDropdown">
        <div class="lang-dropdown-header">
          <div class="lang-dd-title">
            <span style="font-size:1.1rem;">🌐</span>
            <div>
              <strong>Instant Translation</strong>
              <div style="font-size:.72rem;color:var(--ink-4);font-weight:500;">Select your native language</div>
            </div>
          </div>
          <button type="button" class="lang-close-float" id="langCloseFloat" aria-label="Close">✕</button>
        </div>

        <div class="lang-search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" class="lang-search-input" id="langFloatSearch" placeholder="Search language..." autocomplete="off" />
        </div>

        <div class="lang-list" id="langFloatList"></div>

        <div class="lang-dropdown-footer">
          <button type="button" class="lang-reset-btn" id="langFloatReset">
            <span>↺</span> Reset to Original English
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);

    const btn = document.getElementById('ciFloatingTranslateBtn');
    const dropdown = document.getElementById('langFloatDropdown');
    const searchInput = document.getElementById('langFloatSearch');
    const list = document.getElementById('langFloatList');
    const resetBtn = document.getElementById('langFloatReset');
    const closeBtn = document.getElementById('langCloseFloat');

    renderLangList(list);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('active');
      btn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        searchInput.value = '';
        renderLangList(list);
        setTimeout(() => searchInput.focus(), 80);
      }
    });

    closeBtn?.addEventListener('click', () => {
      dropdown.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    });

    searchInput.addEventListener('input', (e) => {
      renderLangList(list, e.target.value);
    });

    resetBtn.addEventListener('click', () => {
      applyLanguage('en');
    });

    dropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  // Global click to close dropdowns
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  // Initialize
  function init() {
    initGoogleTranslate();
    setupNavbarDropdown();
    setupFloatingButton();
    updateUI();

    // Check if Google Translate iframe modifies body top offset, lock it to 0
    setInterval(() => {
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global controller
  window.CITranslator = {
    setLanguage: applyLanguage,
    reset: () => applyLanguage('en'),
    getLanguages: () => LANGUAGES,
    getCurrent: getCurrentLang
  };
})();
