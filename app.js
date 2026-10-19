/* Carrega els mòduls compartits del lloc. */
(() => {
  const load = (src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  Promise.all([
    load("site-content-fixes.js?v=1"),
    load("site-content-overrides.js?v=1"),
    load("site-core.js?v=1")
  ]).then(() => {
    const start = () => {
      applyContentCorrections();
      applyLateContentCorrections();
      initSite();
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }
  }).catch((error) => console.error("No s'han pogut carregar els scripts compartits", error));
})();
