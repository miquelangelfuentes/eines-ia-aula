/* Carrega la funcionalitat compartida del lloc. */
(() => {
  /* Numeració automàtica per a la impressió i l'exportació a PDF.
     Els navegadors Chromium moderns admeten caixes de marge dins de @page. */
  const printPageNumberStyle = document.createElement('style');
  printPageNumberStyle.id = 'print-page-numbering';
  printPageNumberStyle.media = 'print';
  printPageNumberStyle.textContent = `
    @page {
      @bottom-right {
        content: counter(page);
        color: #94a3b8;
        font-family: Arial, sans-serif;
        font-size: 9pt;
        font-weight: 400;
      }
    }
  `;
  document.head.appendChild(printPageNumberStyle);

  const sectionHeadingIconRules = [
    [/accés|material del taller/i, 'smartphone'],
    [/qüestionari|diagnòstic|coneixements previs/i, 'clipboard-list'],
    [/objectiu/i, 'target'],
    [/bloc|estructura|recorregut|índex/i, 'layout-grid'],
    [/com funciona|configuraci|instal·laci/i, 'settings'],
    [/primera web|web funcional|recurs web|recursos web/i, 'monitor'],
    [/indicaci|plantilla|generador/i, 'message-square-code'],
    [/ampliació|pdf|descarrega/i, 'download'],
    [/antigravity.*github|github.*antigravity/i, 'workflow'],
    [/github/i, 'git-branch'],
    [/google sites|\bsites\b/i, 'panel-left'],
    [/pages|publica|despleg|web pública/i, 'globe'],
    [/comparaci|alternatives|diferències/i, 'columns-2'],
    [/llic[eè]nc|creative commons|copyright|drets/i, 'scale'],
    [/imatg|icona|visual/i, 'image'],
    [/accessibilitat|\bdua\b/i, 'accessibility'],
    [/bones pràctiques|criteri|seguretat|privacitat|responsable/i, 'shield-check'],
    [/verific|comprov|prova|revisa/i, 'search'],
    [/ia local|models locals|offline|\blocal\b/i, 'hard-drive'],
    [/cr[eè]dit|autoria|font|refer[eè]nc/i, 'info'],
    [/continuar|explorar|tutorial|vídeo|recursos/i, 'book-open'],
  ];

  const iconForSectionHeading = (text) => {
    const match = sectionHeadingIconRules.find(([pattern]) => pattern.test(text));
    return match?.[1] ?? 'sparkles';
  };

  const addSectionHeadingIcons = () => {
    document.querySelectorAll('h2').forEach((heading) => {
      if (heading.closest('.print-source-heading')) return;
      if (heading.querySelector('[data-lucide]')) return;

      const text = heading.textContent.trim();
      if (!text) return;

      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', iconForSectionHeading(text));
      icon.setAttribute('aria-hidden', 'true');
      icon.style.width = '24px';
      icon.style.height = '24px';
      icon.style.color = 'var(--accent-primary)';
      icon.style.flex = '0 0 24px';

      heading.style.display = 'flex';
      heading.style.alignItems = 'center';
      heading.style.gap = '0.6rem';
      heading.prepend(icon);
    });
  };

  const script = document.createElement('script');
  script.src = 'site-core.js?v=3';
  script.onload = () => {
    const start = () => {
      initSite();
      addSectionHeadingIcons();
      window.lucide?.createIcons();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  };
  script.onerror = () => console.error('No s’ha pogut carregar la funcionalitat compartida del lloc');
  document.head.appendChild(script);
})();