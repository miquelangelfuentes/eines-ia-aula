/* Carrega la funcionalitat compartida del lloc. */
(() => {
  const script = document.createElement('script');
  script.src = 'site-core.js?v=2';
  script.onload = () => {
    const start = () => initSite();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  };
  script.onerror = () => console.error('No s’ha pogut carregar la funcionalitat compartida del lloc');
  document.head.appendChild(script);
})();
