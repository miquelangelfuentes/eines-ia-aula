(() => {
  const READY_DELAY = 5900;
  const COMMENT_DURATION = 3000;
  const STORAGE_KEY = 'eines-ia:companion-scroll-comments-v2';
  let readyAt = Date.now() + READY_DELAY;
  let lastTarget = null;
  let hideTimer = null;
  let frame = 0;
  let bubble;
  let bubbleText;

  const specificComments = {
    'Accés al material del taller': [
      'Això pot ser útil per compartir el material amb el grup de manera ràpida.',
      'El codi QR us pot facilitar l’accés al recurs des del mòbil.'
    ],
    'Qüestionari de coneixements previs per a docents': [
      'Això pot ajudar-vos a identificar quins blocs us poden aportar més.',
      'Les respostes es desen al navegador i us permeten reprendre el punt de partida.'
    ],
    'Objectius de la sessió': [
      'Això us pot ajudar a situar què treballareu durant la sessió.'
    ],
    'Marc: de consultar a crear': [
      'Això pot ser útil per passar d’una necessitat docent a una primera idea de recurs.'
    ],
    'Google Antigravity pas a pas': [
      'Això pot ser útil per convertir una idea docent en canvis concrets al projecte.'
    ],
    'Configuració de GitHub': [
      'Això pot ser útil per publicar el recurs i conservar-ne l’historial de canvis.'
    ],
    'Pages en comparació amb Google Sites': [
      'Això us pot ajudar a triar una opció de publicació segons el tipus de recurs.'
    ],
    'Llicències i codi obert': [
      'Això pot ser útil per decidir com voleu compartir el contingut i el codi.'
    ],
    'Recursos visuals i citació': [
      'Això pot ajudar-vos a incorporar recursos visuals amb una citació adequada.'
    ],
    "Bones pràctiques a l'aula": [
      'Això pot ser útil per revisar el recurs abans de portar-lo a l’aula.'
    ],
    'Llista de verificació': [
      'Això us pot ajudar a fer una última revisió abans de compartir el recurs.'
    ],
    'Per continuar explorant: IA local': [
      'Això pot ser útil quan necessiteu més control sobre les dades que processeu.'
    ],
    'Crèdits i llicències': [
      'Això us pot ajudar a identificar l’autoria i les condicions d’ús del material.'
    ]
  };

  function currentState() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveState(state) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function choose(key, items) {
    if (!items.length) return '';
    const state = currentState();
    state.indexes ||= {};
    const current = Number.isInteger(state.indexes[key]) ? state.indexes[key] : Math.floor(Math.random() * items.length);
    const text = items[current % items.length];
    state.indexes[key] = (current + 1) % items.length;
    saveState(state);
    return text;
  }

  function titleFor(target) {
    const heading = target.querySelector?.('h2, h3, .home-card-title, .quiz-q-title, .step-content h3');
    return (heading?.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);
  }

  function hasImageCredit(target) {
    if (!target.matches?.('figure')) return false;
    const caption = target.querySelector('figcaption');
    if (!caption) return false;
    const text = caption.textContent.toLowerCase();
    const links = caption.querySelectorAll('a[href]');
    return links.length > 0 && /fotografia de|imatge de|font:|llicència|unsplash|wikimedia|flickr/.test(text);
  }

  function commentsFor(target) {
    const explicit = target.getAttribute?.('data-companion-comment');
    if (explicit) return [explicit];

    const title = titleFor(target);
    if (specificComments[title]) return specificComments[title];

    const text = (target.textContent || '').toLowerCase();
    const items = [];

    if (hasImageCredit(target)) {
      return [
        'Aquesta imatge està correctament citada!',
        'Això pot servir de model per citar imatges als vostres recursos.'
      ];
    }

    if (target.matches?.('figure')) {
      const image = target.querySelector('img');
      if (image?.alt?.trim()) items.push('Aquest text alternatiu ajuda a fer la imatge més accessible.');
      if (target.querySelector('figcaption')) items.push('Aquest peu pot ajudar a donar context a la imatge.');
    }

    if (target.classList?.contains('home-block-card')) {
      items.push(`Això pot ser útil si voleu aprofundir en «${title}».`);
    }

    if (target.classList?.contains('ordered-step-item')) {
      items.push('Això us pot ajudar a entendre com aquest objectiu es tradueix en una tasca concreta.');
    }

    if (target.classList?.contains('pedagogical-highlight')) {
      items.push('Això pot ser útil per connectar el contingut amb una decisió docent concreta.');
    }

    if (target.classList?.contains('workshop-access-card')) {
      items.push('Això pot facilitar que el grup accedeixi al material durant la sessió.');
    }

    if (text.includes('github pages')) {
      items.push('Això pot ser útil per publicar un recurs web des del mateix repositori.');
    }

    if (text.includes('index.html')) {
      items.push('Recordar aquest nom us pot ajudar quan prepareu la pàgina d’entrada del lloc.');
    }

    if (text.includes('lucide')) {
      items.push('Això pot ser útil per mantenir un estil d’icones coherent al recurs.');
    }

    if (text.includes('llicència') || text.includes('llicències')) {
      items.push('Això us pot ajudar a decidir com voleu permetre la reutilització del recurs.');
    }

    if (text.includes('privacitat') || text.includes('rgpd')) {
      items.push('Això pot ser útil per revisar quines dades pot gestionar el recurs.');
    }

    if (text.includes('accessibilitat')) {
      items.push('Això pot ajudar-vos a detectar barreres abans de compartir el recurs.');
    }

    if (text.includes('indicació') || text.includes('prompt')) {
      items.push('Això pot ser útil per convertir una necessitat docent en una petició més precisa.');
    }

    if (target.querySelector('input, select, textarea, button')) {
      items.push('Provar aquest element amb el teclat us pot ajudar a detectar problemes d’ús.');
    }

    if (target.querySelector('code, pre')) {
      items.push('Això pot ser útil per comprovar què ha canviat abans de continuar editant.');
    }

    if (target.querySelector('a[target="_blank"]')) {
      items.push('Aquest recurs extern us pot servir per ampliar el contingut de l’apartat.');
    }

    if (target.querySelector('img') && !target.matches?.('figure')) {
      items.push('Aquesta imatge pot ajudar a situar visualment el que s’explica aquí.');
    }

    if (!items.length && title) {
      items.push(`Això pot ser útil per situar «${title}» dins del recorregut.`);
    }

    if (!items.length) {
      items.push('Això pot ser útil per connectar aquesta part amb la vostra pràctica docent.');
    }

    return [...new Set(items)];
  }

  function candidates() {
    const main = document.getElementById('contingut-principal') || document.querySelector('main');
    if (!main) return [];

    const selector = [
      ':scope > .workshop-access-card',
      ':scope > .pedagogical-highlight',
      ':scope > .content-box',
      ':scope > section',
      ':scope > figure',
      '.ordered-step-item',
      '.home-block-card',
      '.quiz-question-card.active',
      'figure',
      '.prompt-box',
      '.comparison-card',
      '.tool-card',
      '[data-companion-comment]'
    ].join(', ');

    return [...new Set(main.querySelectorAll(selector))].filter((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.height > 55 && style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  function headerBottom() {
    const rect = document.querySelector('.top-bar')?.getBoundingClientRect();
    return rect && rect.bottom > 0 ? rect.bottom : 0;
  }

  function activeCandidate() {
    const nodes = candidates();
    if (!nodes.length) return null;

    const minY = Math.max(0, headerBottom());
    const anchorY = minY + (window.innerHeight - minY) * 0.42;
    let best = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestHeight = Number.POSITIVE_INFINITY;

    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.bottom <= minY || rect.top >= window.innerHeight) return;

      let distance = 0;
      if (anchorY < rect.top) distance = rect.top - anchorY;
      if (anchorY > rect.bottom) distance = anchorY - rect.bottom;

      const better = distance < bestDistance - 1;
      const moreSpecific = Math.abs(distance - bestDistance) <= 1 && rect.height < bestHeight;
      if (better || moreSpecific) {
        best = node;
        bestDistance = distance;
        bestHeight = rect.height;
      }
    });

    return best;
  }

  function showComment(target) {
    if (!bubble || !bubbleText || !target) return;
    const comments = commentsFor(target);
    const key = `${location.pathname}::${titleFor(target) || target.className || target.tagName}`;
    const text = choose(key, comments);
    if (!text) return;

    clearTimeout(hideTimer);
    bubbleText.textContent = text;
    bubble.hidden = false;
    bubble.classList.remove('is-visible');

    requestAnimationFrame(() => {
      bubble.classList.add('is-visible');
      window.dispatchEvent(new Event('scroll'));
    });

    hideTimer = setTimeout(() => {
      bubble.classList.remove('is-visible');
      setTimeout(() => {
        if (!bubble.classList.contains('is-visible')) bubble.hidden = true;
      }, 180);
    }, COMMENT_DURATION);
  }

  function evaluate({ force = false } = {}) {
    if (Date.now() < readyAt) return;
    const companion = document.getElementById('reading-companion');
    if (!companion || companion.hidden) return;

    const target = activeCandidate();
    if (!target) return;
    if (!force && target === lastTarget) return;

    lastTarget = target;
    showComment(target);
  }

  function scheduleEvaluate() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      evaluate();
    });
  }

  function init() {
    bubble = document.querySelector('#reading-companion .companion-bubble');
    bubbleText = document.querySelector('#reading-companion .companion-bubble-text');

    if (!bubble || !bubbleText) {
      setTimeout(init, 120);
      return;
    }

    window.addEventListener('scroll', scheduleEvaluate, { passive: true });
    window.addEventListener('resize', scheduleEvaluate, { passive: true });

    setTimeout(() => evaluate({ force: true }), READY_DELAY + 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();