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

  const script = document.createElement('script');
  script.src = 'site-core.js?v=3';
  script.onload = () => {
    const start = () => {
      initSite();

      const accessTitle = document.getElementById('workshop-access-title');
      if (accessTitle && !accessTitle.querySelector('[data-lucide]')) {
        accessTitle.style.display = 'flex';
        accessTitle.style.alignItems = 'center';
        accessTitle.style.gap = '0.5rem';
        accessTitle.insertAdjacentHTML('afterbegin', '<i data-lucide="smartphone" aria-hidden="true" style="width:22px;height:22px;color:var(--accent-primary);flex:0 0 22px;"></i>');
        window.lucide?.createIcons();
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  };
  script.onerror = () => console.error('No s’ha pogut carregar la funcionalitat compartida del lloc');
  document.head.appendChild(script);
})();