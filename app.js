/* Carrega la base del lloc, l'acompanyant visual i, a la pàgina inicial, l'actualització del qüestionari de punt de partida. */
(() => {
  const loadScript = (src, onload) => {
    const script = document.createElement('script');
    script.src = src;
    if (onload) script.onload = onload;
    script.onerror = () => console.error(`No s’ha pogut carregar ${src}`);
    document.head.appendChild(script);
  };

  const loadStyle = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  loadStyle('companion.css?v=20261102d');

  loadScript('app-base.js?v=20261031', () => {
    loadScript('companion-core.js?v=20261102b', () => {
      loadScript('companion-scroll-comments.js?v=20261102f');
    });

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