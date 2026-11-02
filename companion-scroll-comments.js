(() => {
  const READY_DELAY = 5900;
  const COMMENT_DURATION = 3000;
  const STORAGE_KEY = 'eines-ia:companion-scroll-comments-v1';
  let readyAt = Date.now() + READY_DELAY;
  let lastTarget = null;
  let hideTimer = null;
  let frame = 0;
  let bubble;
  let bubbleText;

  const specificComments = {
    'Accés al material del taller': [
      'El codi QR i l’adreça curta porten al mateix recurs.',
      'Aquest accés està pensat per entrar-hi ràpidament des de qualsevol dispositiu.'
    ],
    'Qüestionari de coneixements previs per a docents': [
      'Les respostes d’aquest qüestionari es desen al navegador.',
      'Aquest qüestionari ajuda a situar el punt de partida.'
    ],
    'Objectius de la sessió': [
      'Aquí es concreta què es treballarà durant la sessió.'
    ],
    'Marc: de consultar a crear': [
      'Aquest bloc obre el pas de consultar IA a crear recursos amb IA.'
    ],
    'Google Antigravity pas a pas': [
      'Aquí comença el treball pràctic amb un agent que pot editar fitxers.'
    ],
    'Configuració de GitHub': [
      'GitHub conserva l’historial dels canvis del projecte.'
    ],
    'Pages en comparació amb Google Sites': [
      'Aquí es compara la portabilitat dels recursos publicats.'
    ],
    'Llicències i codi obert': [
      'El contingut i el codi poden requerir llicències diferents.'
    ],
    'Recursos visuals i citació': [
      'Aquí la citació forma part del disseny del recurs.'
    ],
    "Bones pràctiques a l'aula": [
      'Aquest bloc porta els criteris tècnics a decisions docents.'
    ],
    'Llista de verificació': [
      'Aquesta llista ajuda a revisar el recurs abans de compartir-lo.'
    ],
    'Per continuar explorant: IA local': [
      'La IA local pot funcionar sense enviar dades a un servei extern.'
    ],
    'Crèdits i llicències': [
      'Aquí podeu consultar l’autoria i les condicions d’ús del material.'
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
        'La font i la llicència queden visibles al peu de la imatge.'
      ];
    }

    if (target.matches?.('figure')) {
      const image = target.querySelector('img');
      if (image?.alt?.trim()) items.push('Aquesta imatge incorpora text alternatiu.');
      if (target.querySelector('figcaption')) items.push('Aquesta imatge incorpora un peu explicatiu.');
    }

    if (target.classList?.contains('home-block-card')) {
      items.push(`Aquest accés obre «${title}».`);
    }

    if (target.classList?.contains('ordered-step-item')) {
      items.push('Aquest objectiu concreta una part del recorregut del taller.');
    }

    if (target.classList?.contains('pedagogical-highlight')) {
      items.push('Aquesta capsa destaca una idea pedagògica clau.');
    }

    if (target.classList?.contains('workshop-access-card')) {
      items.push('El codi QR facilita l’accés des del mòbil.');
    }

    if (text.includes('github pages')) {
      items.push('GitHub Pages publica fitxers web des del repositori.');
    }

    if (text.includes('index.html')) {
      items.push('index.html acostuma a ser la pàgina d’entrada del lloc.');
    }

    if (text.includes('lucide')) {
      items.push('Lucide ajuda a mantenir un estil d’icones coherent.');
    }

    if (text.includes('llicència') || text.includes('llicències')) {
      items.push('Aquí s’explica com es pot reutilitzar el recurs.');
    }

    if (text.includes('privacitat') || text.includes('rgpd')) {
      items.push('Aquí la privacitat forma part del disseny del recurs.');
    }

    if (text.includes('accessibilitat')) {
      items.push('Aquí l’accessibilitat es tracta com un criteri de disseny.');
    }

    if (target.querySelector('input, select, textarea, button')) {
      items.push('Aquest element també es pot provar amb el teclat.');
    }

    if (target.querySelector('code, pre')) {
      items.push('Aquí convé comprovar cada canvi abans de continuar.');
    }

    if (target.querySelector('a[target="_blank"]')) {
      items.push('Aquest apartat inclou un recurs extern.');
    }

    if (target.querySelector('img') && !target.matches?.('figure')) {
      items.push('Aquesta imatge acompanya l’explicació del contingut.');
    }

    if (!items.length && title) {
      items.push(`Aquest apartat se centra en «${title}».`);
    }

    if (!items.length) {
      items.push('Aquest element forma part del recorregut del taller.');
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
