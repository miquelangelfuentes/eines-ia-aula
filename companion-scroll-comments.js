(() => {
  const READY_DELAY = 5900;
  const COMMENT_DURATION = 3000;
  const STORAGE_KEY = 'eines-ia:companion-scroll-comments-v3';
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
      'Això pot ser útil per convertir una necessitat docent en una primera idea de recurs.'
    ],
    'Google Antigravity pas a pas': [
      'Això pot ser útil per demanar canvis concrets a la web sense haver de començar pel codi.'
    ],
    'Configuració de GitHub': [
      'Això pot ser útil per publicar el recurs i conservar versions anteriors.'
    ],
    'Pages en comparació amb Google Sites': [
      'Això us pot ajudar a triar una manera de publicar segons el recurs que voleu crear.'
    ],
    'Llicències i codi obert': [
      'Això pot ser útil per decidir com podran reutilitzar el vostre material altres persones.'
    ],
    'Recursos visuals i citació': [
      'Això pot ajudar-vos a incorporar imatges i indicar-ne correctament l’origen.'
    ],
    "Bones pràctiques a l'aula": [
      'Això pot ser útil per revisar el recurs abans de fer-lo servir amb l’alumnat.'
    ],
    'Llista de verificació': [
      'Això us pot ajudar a fer una última revisió abans de compartir el recurs.'
    ],
    'Per continuar explorant: IA local': [
      'Això pot ser útil quan voleu tenir més control sobre les dades que feu servir.'
    ],
    'Crèdits i llicències': [
      'Això us pot ajudar a saber qui ha creat cada recurs i com el podeu reutilitzar.'
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
    if (explicit) return [explicit.replace(/[«»]/g, '')];

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
      if (image?.alt?.trim()) items.push('Aquest text alternatiu ajuda que més persones puguin entendre la imatge.');
      if (target.querySelector('figcaption')) items.push('Aquest peu ajuda a entendre d’on prové la imatge o què representa.');
    }

    if (target.classList?.contains('home-block-card')) {
      items.push(`Aquest bloc us pot ser útil si voleu aprofundir en ${title}.`);
    }

    if (target.classList?.contains('ordered-step-item')) {
      items.push('Això us pot ajudar a veure com un objectiu general es converteix en una tasca concreta.');
    }

    if (target.classList?.contains('pedagogical-highlight')) {
      items.push('Això pot ser útil per relacionar el contingut amb una decisió que podeu prendre a l’aula.');
    }

    if (target.classList?.contains('workshop-access-card')) {
      items.push('Això pot facilitar que el grup accedeixi al material durant la sessió.');
    }

    if (text.includes('github pages')) {
      items.push('Això pot ser útil per publicar una web a internet directament des del projecte.');
    }

    if (text.includes('index.html')) {
      items.push('Recordar index.html us pot ajudar: acostuma a ser el fitxer que s’obre primer en una web.');
    }

    if (text.includes('lucide')) {
      items.push('Això pot ser útil per afegir icones amb un estil visual coherent.');
    }

    if (text.includes('llicència') || text.includes('llicències')) {
      items.push('Això us pot ajudar a decidir què poden fer altres persones amb el recurs que compartiu.');
    }

    if (text.includes('privacitat') || text.includes('rgpd') || text.includes('dades personals')) {
      items.push('Això pot ser útil per decidir quines dades podeu introduir en una eina amb seguretat.');
    }

    if (text.includes('accessibilitat') || text.includes('dua')) {
      items.push('Això pot ajudar-vos a preparar un recurs que més persones puguin utilitzar amb comoditat.');
    }

    if (text.includes('indicació') || text.includes('prompt')) {
      items.push('Això pot ser útil per explicar a la IA amb més precisió què necessiteu crear o canviar.');
    }

    if (text.includes('git') && !text.includes('github pages')) {
      items.push('Això pot ser útil per recuperar una versió anterior si un canvi no funciona com esperàveu.');
    }

    if (text.includes('repositori')) {
      items.push('Penseu en el repositori com la carpeta del projecte que també conserva l’historial dels canvis.');
    }

    if (target.querySelector('input, select, textarea, button')) {
      items.push('Provar aquest element amb el teclat us pot ajudar a saber si es pot utilitzar sense ratolí.');
    }

    if (target.querySelector('code, pre')) {
      items.push('Si la IA modifica aquest codi, comprovar un canvi cada vegada us pot facilitar detectar errors.');
    }

    if (target.querySelector('a[target="_blank"]')) {
      items.push('Aquest enllaç us pot servir per ampliar la informació quan la necessiteu.');
    }

    if (target.querySelector('img') && !target.matches?.('figure')) {
      items.push('Aquesta imatge pot ajudar a veure un exemple del que s’explica aquí.');
    }

    if (!items.length && title) {
      items.push(`Aquest apartat us pot ajudar a situar ${title} dins del procés.`);
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
    const text = choose(key, comments).replace(/[«»]/g, '');
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

    const sanitize = () => {
      if (bubbleText.textContent.includes('«') || bubbleText.textContent.includes('»')) {
        bubbleText.textContent = bubbleText.textContent.replace(/[«»]/g, '');
      }
    };
    new MutationObserver(sanitize).observe(bubbleText, { childList: true, characterData: true, subtree: true });

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