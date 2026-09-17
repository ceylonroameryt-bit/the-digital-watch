/* ============================================================
   translator.js — Cyber Insight Real-Time Multi-Language Engine
   Enables any reader worldwide to translate and read the blog
   in their native language using Google Translate API.
   ============================================================ */

'use strict';

(function () {
  // Comprehensive 106+ curated languages with flags, native scripts, and regions
  const LANGUAGES = [
    // Popular / Major
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', region: 'popular' },
    { code: 'si', name: 'Sinhala', native: 'සිංහල', flag: '🇱🇰', region: 'popular' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', region: 'popular' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', region: 'popular' },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', region: 'popular' },
    { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', region: 'popular' },
    { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', region: 'popular' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', native: '中文 (简体)', flag: '🇨🇳', region: 'popular' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', native: '中文 (繁體)', flag: '🇹🇼', region: 'popular' },
    { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', region: 'popular' },
    { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', region: 'popular' },
    { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', region: 'popular' },
    { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺', region: 'popular' },
    { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹', region: 'popular' },
    { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', region: 'popular' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩', region: 'popular' },

    // Asia & Pacific
    { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩', region: 'asia' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', region: 'asia' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', region: 'asia' },
    { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰', region: 'asia' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', region: 'asia' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'asia' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', region: 'asia' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', region: 'asia' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली', flag: '🇳🇵', region: 'asia' },
    { code: 'my', name: 'Burmese (Myanmar)', native: 'မြန်မာစာ', flag: '🇲🇲', region: 'asia' },
    { code: 'km', name: 'Khmer (Cambodian)', native: 'ភាសាខ្មែរ', flag: '🇰🇭', region: 'asia' },
    { code: 'lo', name: 'Lao', native: 'ພາສາລາວ', flag: '🇱🇦', region: 'asia' },
    { code: 'th', name: 'Thai', native: 'ไทย', flag: '🇹🇭', region: 'asia' },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳', region: 'asia' },
    { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾', region: 'asia' },
    { code: 'tl', name: 'Filipino (Tagalog)', native: 'Tagalog', flag: '🇵🇭', region: 'asia' },
    { code: 'ceb', name: 'Cebuano', native: 'Bisaya', flag: '🇵🇭', region: 'asia' },
    { code: 'jv', name: 'Javanese', native: 'Basa Jawa', flag: '🇮🇩', region: 'asia' },
    { code: 'su', name: 'Sundanese', native: 'Basa Sunda', flag: '🇮🇩', region: 'asia' },
    { code: 'hmn', name: 'Hmong', native: 'Hmoob', flag: '🌏', region: 'asia' },
    { code: 'mn', name: 'Mongolian', native: 'Монгол', flag: '🇲🇳', region: 'asia' },
    { code: 'sd', name: 'Sindhi', native: 'سنڌي', flag: '🇵🇰', region: 'asia' },
    { code: 'ps', name: 'Pashto', native: 'پښتو', flag: '🇦🇫', region: 'asia' },
    { code: 'tg', name: 'Tajik', native: 'Тоҷикӣ', flag: '🇹🇯', region: 'asia' },
    { code: 'uz', name: 'Uzbek', native: 'Oʻzbekcha', flag: '🇺🇿', region: 'asia' },
    { code: 'kk', name: 'Kazakh', native: 'Қазақ тілі', flag: '🇰🇿', region: 'asia' },
    { code: 'ky', name: 'Kyrgyz', native: 'Кыргызча', flag: '🇰🇬', region: 'asia' },
    { code: 'tk', name: 'Turkmen', native: 'Türkmençe', flag: '🇹🇲', region: 'asia' },
    { code: 'ug', name: 'Uyghur', native: 'ئۇيغۇرچە', flag: '🌙', region: 'asia' },
    { code: 'mi', name: 'Maori', native: 'Te Reo Māori', flag: '🇳🇿', region: 'asia' },
    { code: 'sm', name: 'Samoan', native: 'Gagana Sāmoa', flag: '🇼🇸', region: 'asia' },
    { code: 'haw', name: 'Hawaiian', native: 'ʻŌlelo Hawaiʻi', flag: '🌺', region: 'asia' },

    // Europe
    { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱', region: 'europe' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', region: 'europe' },
    { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱', region: 'europe' },
    { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪', region: 'europe' },
    { code: 'uk', name: 'Ukrainian', native: 'Українська', flag: '🇺🇦', region: 'europe' },
    { code: 'el', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷', region: 'europe' },
    { code: 'cs', name: 'Czech', native: 'Čeština', flag: '🇨🇿', region: 'europe' },
    { code: 'ro', name: 'Romanian', native: 'Română', flag: '🇷🇴', region: 'europe' },
    { code: 'hu', name: 'Hungarian', native: 'Magyar', flag: '🇭🇺', region: 'europe' },
    { code: 'da', name: 'Danish', native: 'Dansk', flag: '🇩🇰', region: 'europe' },
    { code: 'fi', name: 'Finnish', native: 'Suomi', flag: '🇫🇮', region: 'europe' },
    { code: 'no', name: 'Norwegian', native: 'Norsk', flag: '🇳🇴', region: 'europe' },
    { code: 'be', name: 'Belarusian', native: 'Беларуская', flag: '🇧🇾', region: 'europe' },
    { code: 'bg', name: 'Bulgarian', native: 'Български', flag: '🇧🇬', region: 'europe' },
    { code: 'bs', name: 'Bosnian', native: 'Bosanski', flag: '🇧🇦', region: 'europe' },
    { code: 'ca', name: 'Catalan', native: 'Català', flag: '🇪🇸', region: 'europe' },
    { code: 'hr', name: 'Croatian', native: 'Hrvatski', flag: '🇭🇷', region: 'europe' },
    { code: 'et', name: 'Estonian', native: 'Eesti', flag: '🇪🇪', region: 'europe' },
    { code: 'gl', name: 'Galician', native: 'Galego', flag: '🇪🇸', region: 'europe' },
    { code: 'is', name: 'Icelandic', native: 'Íslenska', flag: '🇮🇸', region: 'europe' },
    { code: 'ga', name: 'Irish', native: 'Gaeilge', flag: '🇮🇪', region: 'europe' },
    { code: 'lv', name: 'Latvian', native: 'Latviešu', flag: '🇱🇻', region: 'europe' },
    { code: 'lt', name: 'Lithuanian', native: 'Lietuvių', flag: '🇱🇹', region: 'europe' },
    { code: 'lb', name: 'Luxembourgish', native: 'Lëtzebuergesch', flag: '🇱🇺', region: 'europe' },
    { code: 'mk', name: 'Macedonian', native: 'Македонски', flag: '🇲🇰', region: 'europe' },
    { code: 'mt', name: 'Maltese', native: 'Malti', flag: '🇲🇹', region: 'europe' },
    { code: 'sk', name: 'Slovak', native: 'Slovenčina', flag: '🇸🇰', region: 'europe' },
    { code: 'sl', name: 'Slovenian', native: 'Slovenščina', flag: '🇸🇮', region: 'europe' },
    { code: 'sr', name: 'Serbian', native: 'Српски', flag: '🇷🇸', region: 'europe' },
    { code: 'sq', name: 'Albanian', native: 'Shqip', flag: '🇦🇱', region: 'europe' },
    { code: 'eu', name: 'Basque', native: 'Euskara', flag: '🇪🇸', region: 'europe' },
    { code: 'cy', name: 'Welsh', native: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', region: 'europe' },
    { code: 'gd', name: 'Scots Gaelic', native: 'Gàidhlig', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', region: 'europe' },
    { code: 'fy', name: 'Frisian', native: 'Frysk', flag: '🇳🇱', region: 'europe' },
    { code: 'co', name: 'Corsican', native: 'Corsu', flag: '🇫🇷', region: 'europe' },
    { code: 'la', name: 'Latin', native: 'Latina', flag: '🏛️', region: 'europe' },
    { code: 'eo', name: 'Esperanto', native: 'Esperanto', flag: '🌍', region: 'europe' },
    { code: 'yi', name: 'Yiddish', native: 'ייִדיש', flag: '✡️', region: 'europe' },

    // Middle East & Africa
    { code: 'fa', name: 'Persian (Farsi)', native: 'فارسی', flag: '🇮🇷', region: 'mideast_africa' },
    { code: 'he', name: 'Hebrew', native: 'עברית', flag: '🇮🇱', region: 'mideast_africa' },
    { code: 'ku', name: 'Kurdish', native: 'Kurdî', flag: '☀️', region: 'mideast_africa' },
    { code: 'hy', name: 'Armenian', native: 'Հայերեն', flag: '🇦🇲', region: 'mideast_africa' },
    { code: 'az', name: 'Azerbaijani', native: 'Azərbaycan', flag: '🇦🇿', region: 'mideast_africa' },
    { code: 'ka', name: 'Georgian', native: 'ქართული', flag: '🇬🇪', region: 'mideast_africa' },
    { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', region: 'mideast_africa' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', region: 'mideast_africa' },
    { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬', region: 'mideast_africa' },
    { code: 'ig', name: 'Igbo', native: 'Asụsụ Igbo', flag: '🇳🇬', region: 'mideast_africa' },
    { code: 'yo', name: 'Yoruba', native: 'Èdè Yorùbá', flag: '🇳🇬', region: 'mideast_africa' },
    { code: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦', region: 'mideast_africa' },
    { code: 'xh', name: 'Xhosa', native: 'isiXhosa', flag: '🇿🇦', region: 'mideast_africa' },
    { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', region: 'mideast_africa' },
    { code: 'so', name: 'Somali', native: 'Soomaali', flag: '🇸🇴', region: 'mideast_africa' },
    { code: 'st', name: 'Sesotho', native: 'Sesotho', flag: '🇱🇸', region: 'mideast_africa' },
    { code: 'sn', name: 'Shona', native: 'chiShona', flag: '🇿🇼', region: 'mideast_africa' },
    { code: 'ny', name: 'Chichewa', native: 'ChiCheŵa', flag: '🇲🇼', region: 'mideast_africa' },
    { code: 'mg', name: 'Malagasy', native: 'Malagasy', flag: '🇲🇬', region: 'mideast_africa' },

    // Americas
    { code: 'ht', name: 'Haitian Creole', native: 'Kreyòl Ayisyen', flag: '🇭🇹', region: 'americas' }
  ];

  // Current filter state
  let currentRegionFilter = 'all';

  // Helper to get active language code from cookies or storage
  function getCurrentLang() {
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
      window.location.reload();
    }
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.lang-dropdown').forEach(dd => dd.classList.remove('active'));
    document.querySelectorAll('.lang-btn, .lang-floating-btn').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
  }

  // Render language list items with search filtering & category tabs
  function renderLangList(container, filterQuery = '', region = 'all') {
    if (!container) return;
    const q = filterQuery.toLowerCase().trim();
    const currentCode = getCurrentLang();

    const filtered = LANGUAGES.filter(l => {
      // Region filter (unless user is searching)
      if (!q && region !== 'all') {
        if (region === 'popular' && l.region !== 'popular') return false;
        if (region === 'asia' && l.region !== 'asia' && !(l.region === 'popular' && ['si','ta','hi','zh-CN','zh-TW','ja','ko','id'].includes(l.code))) return false;
        if (region === 'europe' && l.region !== 'europe' && !(l.region === 'popular' && ['en','es','fr','de','it','pt','ru'].includes(l.code))) return false;
        if (region === 'mideast_africa' && l.region !== 'mideast_africa' && !(l.region === 'popular' && ['ar'].includes(l.code))) return false;
      }

      if (!q) return true;
      return l.name.toLowerCase().includes(q) ||
             l.native.toLowerCase().includes(q) ||
             l.code.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="lang-no-match">
          <span style="font-size:1.4rem;display:block;margin-bottom:6px;">🔍</span>
          No language matching "<strong>${escapeHtml(filterQuery)}</strong>"<br>
          <small style="color:var(--ink-5);margin-top:4px;display:inline-block;">Try searching by country or native script</small>
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

    if (document.getElementById('ciLangNavWrap')) return;

    const li = document.createElement('li');
    li.className = 'lang-nav-item';
    li.id = 'ciLangNavWrap';
    li.innerHTML = `
      <div class="lang-switcher-wrap" id="langNavWrap">
        <button type="button" class="lang-btn" id="langNavBtn" aria-label="Choose Language" aria-expanded="false" title="Translate articles into 106+ languages">
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
              <span style="font-size:1.15rem;">🌐</span>
              <div>
                <strong>Translate Page</strong>
                <div style="font-size:.72rem;color:var(--ink-4);font-weight:500;">Instant translation for all readers</div>
              </div>
            </div>
            <span class="lang-count-badge">106+ Languages</span>
          </div>

          <!-- Region Pills -->
          <div class="lang-region-chips">
            <button type="button" class="lang-chip active" data-region="all">All (${LANGUAGES.length})</button>
            <button type="button" class="lang-chip" data-region="popular">⭐ Popular</button>
            <button type="button" class="lang-chip" data-region="asia">🌏 Asia/Pacific</button>
            <button type="button" class="lang-chip" data-region="europe">🌍 Europe</button>
            <button type="button" class="lang-chip" data-region="mideast_africa">🕌 MidEast & Africa</button>
          </div>

          <div class="lang-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" class="lang-search-input" id="langNavSearch" placeholder="Search language (Sinhala, Tamil, Spanish...)" autocomplete="off" />
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
    const chips = dropdown.querySelectorAll('.lang-chip');

    let navRegion = 'all';
    renderLangList(list, '', navRegion);

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        navRegion = chip.dataset.region;
        searchInput.value = '';
        renderLangList(list, '', navRegion);
      });
    });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('active');
      btn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        searchInput.value = '';
        renderLangList(list, '', navRegion);
        setTimeout(() => searchInput.focus(), 80);
      }
    });

    searchInput.addEventListener('input', (e) => {
      renderLangList(list, e.target.value, navRegion);
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
            <span style="font-size:1.15rem;">🌐</span>
            <div>
              <strong>Instant Translation</strong>
              <div style="font-size:.72rem;color:var(--ink-4);font-weight:500;">Select your native language</div>
            </div>
          </div>
          <button type="button" class="lang-close-float" id="langCloseFloat" aria-label="Close">✕</button>
        </div>

        <!-- Region Pills -->
        <div class="lang-region-chips">
          <button type="button" class="lang-chip active" data-region="all">All (${LANGUAGES.length})</button>
          <button type="button" class="lang-chip" data-region="popular">⭐ Popular</button>
          <button type="button" class="lang-chip" data-region="asia">🌏 Asia/Pacific</button>
          <button type="button" class="lang-chip" data-region="europe">🌍 Europe</button>
          <button type="button" class="lang-chip" data-region="mideast_africa">MidEast/Africa</button>
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
    const chips = dropdown.querySelectorAll('.lang-chip');

    let floatRegion = 'all';
    renderLangList(list, '', floatRegion);

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        floatRegion = chip.dataset.region;
        searchInput.value = '';
        renderLangList(list, '', floatRegion);
      });
    });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('active');
      btn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        searchInput.value = '';
        renderLangList(list, '', floatRegion);
        setTimeout(() => searchInput.focus(), 80);
      }
    });

    closeBtn?.addEventListener('click', () => {
      dropdown.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    });

    searchInput.addEventListener('input', (e) => {
      renderLangList(list, e.target.value, floatRegion);
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

    // Lock body top offset if Google Translate injects styles
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

  // Global API
  window.CITranslator = {
    setLanguage: applyLanguage,
    reset: () => applyLanguage('en'),
    getLanguages: () => LANGUAGES,
    getCurrent: getCurrentLang
  };
})();
