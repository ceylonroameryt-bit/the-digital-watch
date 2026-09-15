/**
 * SYNTAX://DEFENSE - In-Browser Threat Post Editor & Markdown Parser
 * Allows authors to write, preview, save to localStorage, and export articles.
 */

const CyberEditor = {
  init: function () {
    this.bindEvents();
  },

  bindEvents: function () {
    const newPostBtn = document.getElementById('btn-new-post');
    const modal = document.getElementById('editor-modal');
    const closeBtn = document.getElementById('btn-close-editor');
    const saveBtn = document.getElementById('btn-save-post');
    const exportBtn = document.getElementById('btn-export-post');
    const contentInput = document.getElementById('editor-content');
    const previewArea = document.getElementById('editor-preview');

    if (newPostBtn && modal) {
      newPostBtn.addEventListener('click', () => {
        modal.classList.add('active');
        this.updatePreview();
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    if (contentInput && previewArea) {
      contentInput.addEventListener('input', () => {
        this.updatePreview();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.savePost();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportPost();
      });
    }

    const notebookLmBtn = document.getElementById('btn-notebooklm-post');
    if (notebookLmBtn) {
      notebookLmBtn.addEventListener('click', () => {
        this.copyForNotebookLM();
      });
    }
  },

  // Lightweight, robust Markdown to HTML parser for cybersecurity articles
  parseMarkdown: function (md) {
    if (!md) return "";

    let html = md;

    // Escape raw HTML tags (except code blocks)
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Code blocks with syntax copy button
    html = html.replace(/```([a-zA-Z0-9_\-]+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang ? lang.trim() : 'text';
      const cleanCode = code.trim();
      return `
        <div class="code-block-wrapper">
          <div class="code-header">
            <span class="code-lang"><span class="code-dot"></span>${language}</span>
            <button class="btn-copy-code" onclick="CyberApp.copyCode(this)" title="Copy Code">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </button>
          </div>
          <pre><code class="language-${language}">${cleanCode}</code></pre>
        </div>
      `;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Markdown Tables
    html = html.replace(/(\|.+\|\r?\n\|[-:| ]+\|\r?\n(?:\|.+\|\r?\n?)+)/g, (match) => {
      const rows = match.trim().split(/\r?\n/);
      if (rows.length < 3) return match;

      const headerCols = rows[0].split('|').slice(1, -1);
      let thead = '<thead><tr>' + headerCols.map(c => `<th>${c.trim()}</th>`).join('') + '</tr></thead>';

      let tbody = '<tbody>';
      for (let i = 2; i < rows.length; i++) {
        const rowCols = rows[i].split('|').slice(1, -1);
        tbody += '<tr>' + rowCols.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
      }
      tbody += '</tbody>';

      return `<div class="table-responsive"><table class="cyber-table">${thead}${tbody}</table></div>`;
    });

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 id="$1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 id="$1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 id="$1">$1</h1>');

    // Blockquotes / Alerts
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="cyber-quote">$1</blockquote>');

    // Horizontal Rules
    html = html.replace(/^---$/gim, '<hr class="cyber-divider" />');

    // Bold & Italics
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Ordered lists
    html = html.replace(/^[0-9]+\. (.*$)/gim, '<li class="ol-item">$1</li>');
    html = html.replace(/(<li class="ol-item">.*<\/li>)/gim, '<ol>$1</ol>');
    html = html.replace(/<\/ol>\s*<ol>/g, '');

    // Images with captions (must precede generic link regex)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="article-figure"><img src="$2" alt="$1" class="article-img" loading="lazy" /><figcaption>$1</figcaption></figure>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="cyber-link">$1 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>');

    // Paragraphs
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith('<h') || 
          trimmed.startsWith('<div') || 
          trimmed.startsWith('<ul') || 
          trimmed.startsWith('<ol') || 
          trimmed.startsWith('<table') || 
          trimmed.startsWith('<blockquote') ||
          trimmed.startsWith('<figure') ||
          trimmed.startsWith('<hr')) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    }).join('\n');

    return html;
  },

  updatePreview: function () {
    const title = document.getElementById('editor-title').value || "Untargeted Vulnerability Advisory";
    const subtitle = document.getElementById('editor-subtitle').value || "Draft Advisory Subtitle";
    const category = document.getElementById('editor-category').value;
    const cvss = document.getElementById('editor-cvss').value || "7.5 HIGH";
    const mitre = document.getElementById('editor-mitre').value || "T1059";
    const content = document.getElementById('editor-content').value;

    const previewArea = document.getElementById('editor-preview');
    if (!previewArea) return;

    previewArea.innerHTML = `
      <div class="article-header-preview">
        <div class="meta-row">
          <span class="badge ${this.getCatClass(category)}">${category}</span>
          <span class="badge badge-cvss">${cvss}</span>
          <span class="badge badge-mitre">MITRE ${mitre}</span>
        </div>
        <h1 class="preview-title">${this.escape(title)}</h1>
        <p class="preview-subtitle">${this.escape(subtitle)}</p>
      </div>
      <div class="article-body-preview markdown-body">
        ${this.parseMarkdown(content)}
      </div>
    `;
  },

  getCatClass: function (category) {
    if (category.includes("Red") || category.includes("Exploit")) return "cat-redteam";
    if (category.includes("Cloud")) return "cat-cloud";
    if (category.includes("Vuln")) return "cat-vuln";
    return "cat-ir";
  },

  escape: function (str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  savePost: function () {
    const title = document.getElementById('editor-title').value.trim();
    const subtitle = document.getElementById('editor-subtitle').value.trim();
    const category = document.getElementById('editor-category').value;
    const cvss = document.getElementById('editor-cvss').value.trim() || "8.5 HIGH";
    const mitreId = document.getElementById('editor-mitre').value.trim() || "T1059";
    const tagsRaw = document.getElementById('editor-tags').value.trim();
    const content = document.getElementById('editor-content').value.trim();

    if (!title || !content) {
      CyberApp.showToast("Title and Article Content are required!", "error");
      return;
    }

    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [category];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const newArticle = {
      id: slug,
      title: title,
      subtitle: subtitle || title,
      category: category,
      categoryClass: this.getCatClass(category),
      tags: tags,
      coverImage: "assets/images/zeroday_exploit.jpg",
      author: {
        name: "Security Researcher",
        handle: "@researcher_zero",
        role: "Offensive Security Lead",
        avatar: "SR"
      },
      publishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: Math.max(2, Math.ceil(content.split(/\s+/).length / 200)) + " min read",
      cvssScore: cvss,
      cvssClass: cvss.toLowerCase().includes("crit") ? "cvss-critical" : "cvss-high",
      mitreId: mitreId,
      mitreName: "Adversary Technique",
      featured: false,
      summary: subtitle || content.slice(0, 180) + "...",
      content: content
    };

    // Save to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('SYNTAX_CUSTOM_ARTICLES') || '[]');
      stored.unshift(newArticle);
      localStorage.setItem('SYNTAX_CUSTOM_ARTICLES', JSON.stringify(stored));

      // Add to running app list
      CyberApp.allArticles.unshift(newArticle);
      CyberApp.renderArticles();

      // Close modal & notify
      document.getElementById('editor-modal').classList.remove('active');
      CyberApp.showToast("Article published successfully to local storage!", "success");

      // Reset form
      document.getElementById('editor-title').value = '';
      document.getElementById('editor-subtitle').value = '';
      document.getElementById('editor-tags').value = '';
      document.getElementById('editor-content').value = '';
    } catch (e) {
      CyberApp.showToast("Storage error: " + e.message, "error");
    }
  },

  exportPost: function () {
    const title = document.getElementById('editor-title').value.trim() || "cyber-article";
    const content = document.getElementById('editor-content').value;
    const category = document.getElementById('editor-category').value;
    const cvss = document.getElementById('editor-cvss').value;
    const mitre = document.getElementById('editor-mitre').value;

    const fullMarkdown = `---
title: "${title}"
category: "${category}"
cvss: "${cvss}"
mitre: "${mitre}"
date: "${new Date().toISOString()}"
---

${content}
`;

    const blob = new Blob([fullMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    CyberApp.showToast("Exported as Markdown file", "info");
  },

  copyForNotebookLM: function () {
    const title = document.getElementById('editor-title').value.trim() || "Threat Advisory Research";
    const subtitle = document.getElementById('editor-subtitle').value.trim();
    const content = document.getElementById('editor-content').value;
    const category = document.getElementById('editor-category').value;
    const cvss = document.getElementById('editor-cvss').value;
    const mitre = document.getElementById('editor-mitre').value;

    const sourceText = `# ${title}
${subtitle ? `Subtitle: ${subtitle}\n` : ''}Category: ${category} | CVSS: ${cvss} | MITRE ATT&CK: ${mitre}
Date: ${new Date().toLocaleDateString()}

---

${content}
`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sourceText).then(() => {
        CyberApp.showToast("Copied draft! Opening Google NotebookLM...", "success");
        setTimeout(() => {
          window.open("https://notebooklm.google.com/", "_blank", "noopener,noreferrer");
        }, 600);
      }).catch(() => {
        CyberApp.showToast("Opening Google NotebookLM...", "info");
        window.open("https://notebooklm.google.com/", "_blank", "noopener,noreferrer");
      });
    } else {
      CyberApp.showToast("Opening Google NotebookLM...", "info");
      window.open("https://notebooklm.google.com/", "_blank", "noopener,noreferrer");
    }
  }
};

if (typeof window !== 'undefined') {
  window.CyberEditor = CyberEditor;
}
