/* Carrega la funcionalitat compartida del lloc. */
(() => {
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