/* Carrega la base del lloc i, a la pàgina inicial, l'actualització del qüestionari de punt de partida. */
(() => {
  const loadScript = (src, onload) => {
    const script = document.createElement('script');
    script.src = src;
    if (onload) script.onload = onload;
    script.onerror = () => console.error(`No s’ha pogut carregar ${src}`);
    document.head.appendChild(script);
  };

  loadScript('app-base.js?v=20261031', () => {
    const start = () => {
      if (!document.getElementById('diagnostic-quiz-section')) return;
      loadScript('quiz-refresh.js?v=20261031', () => {
        loadScript('quiz-score-label.js?v=20261031');
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  });
})();
