(() => {
  const READY_DELAY = 5900;
  const COMMENT_DURATION = 3000;
  const STORAGE_KEY = 'eines-ia:companion-scroll-comments-v4';
  let readyAt = Date.now() + READY_DELAY;
  let lastTarget = null;
  let hideTimer = null;
  let frame = 0;
  let bubble;
  let bubbleText;

  const specificComments = {
    'Accés al material del taller': [
      'El codi QR facilita l’accés al material des del mòbil.',
      'L’adreça curta és pràctica quan compartiu el recurs a la pissarra.'
    ],
    'Qüestionari de coneixements previs per a docents': [
      'Us orienta cap als blocs que poden encaixar millor amb el vostre punt de partida.',
      'Les respostes queden desades al navegador i podeu reprendre el recorregut més endavant.'
    ],
    'Objectius de la sessió': [
      'Aquí podeu veure què treballareu i amb quin propòsit.'
    ],
    'Marc: de consultar a crear': [
      'Aquí veureu com una necessitat docent es pot transformar en una primera idea de recurs.'
    ],
    'Google Antigravity pas a pas': [
      'Podeu demanar canvis concrets amb llenguatge natural i comprovar-ne el resultat.'
    ],
    'Configuració de GitHub': [
      'L’historial de versions us permet recuperar una versió anterior quan la necessiteu.'
    ],
    'Pages en comparació amb Google Sites': [
      'Aquesta comparació us ajuda a triar una forma de publicació adequada al recurs que voleu crear.'
    ],
    'Llicències i codi obert': [
      'La llicència indica com voleu que altres persones puguin reutilitzar el material.'
    ],
    'Recursos visuals i citació': [
      'Aquí trobareu criteris per incorporar imatges amb una atribució adequada.'
    ],
    "Bones pràctiques a l'aula": [
      'Podeu utilitzar aquests criteris com a revisió abans de portar el recurs a l’aula.'
    ],
    'Llista de verificació': [
      'Aquesta llista és útil com a última comprovació abans de compartir el recurs.'
    ],
    'Per continuar explorant: IA local': [
      'La IA local pot ser interessant quan voleu tenir més control sobre les dades.'
    ],
    'Crèdits i llicències': [
      'Aquí podeu comprovar l’autoria dels recursos i les condicions d’ús.'
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
    const current = Number.isInteger(state.indexes[key])
      ? state.indexes[key]
      : Math.floor(Math.random() * items.length);
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
        'Fixeu-vos en el peu: pot servir de model quan citeu imatges als vostres recursos.'
      ];
    }

    if (target.matches?.('figure')) {
      const image = target.querySelector('img');
      if (image?.alt?.trim()) {
        items.push('El text alternatiu permet transmetre la informació de la imatge a qui no la pot veure.');
      }
      if (target.querySelector('figcaption')) {
        items.push('El peu de la imatge ajuda a identificar-ne l’origen o a explicar què mostra.');
      }
    }

    if (target.classList?.contains('home-block-card')) {
      items.push(`Si aquest tema us resulta nou, el bloc ${title} us permet començar-hi de manera guiada.`);
    }

    if (target.classList?.contains('ordered-step-item')) {
      items.push('Aquest objectiu concreta què podreu posar en pràctica durant la sessió.');
    }

    if (target.classList?.contains('pedagogical-highlight')) {
      items.push('Podeu fer servir aquesta idea com a criteri quan adapteu el recurs a la vostra aula.');
    }

    if (target.classList?.contains('workshop-access-card')) {
      items.push('Aquest accés us permet obrir el material ràpidament durant la sessió.');
    }

    if (text.includes('github pages')) {
      items.push('GitHub Pages us serveix per convertir els fitxers del projecte en una web pública.');
    }

    if (text.includes('index.html')) {
      items.push('Recordeu index.html: acostuma a ser el fitxer que una web obre primer.');
    }

    if (text.includes('lucide')) {
      items.push('Lucide és una biblioteca d’icones que ajuda a mantenir un estil visual coherent.');
    }

    if (text.includes('llicència') || text.includes('llicències')) {
      items.push('La llicència explica quins usos autoritzeu quan compartiu el recurs.');
    }

    if (text.includes('privacitat') || text.includes('rgpd') || text.includes('dades personals')) {
      items.push('Aquí convé pensar quines dades introduïu abans de fer servir una eina amb alumnat.');
    }

    if (text.includes('accessibilitat') || text.includes('dua')) {
      items.push('Aquest criteri us ajuda a preparar un recurs que pugui utilitzar més alumnat.');
    }

    if (text.includes('indicació') || text.includes('prompt')) {
      items.push('Una indicació concreta ajuda la IA a entendre millor quin resultat espereu.');
    }

    if (text.includes('git') && !text.includes('github pages')) {
      items.push('Git conserva l’historial dels canvis i us permet tornar a una versió anterior.');
    }

    if (text.includes('repositori')) {
      items.push('Podeu imaginar el repositori com la carpeta del projecte amb l’historial dels canvis incorporat.');
    }

    if (target.querySelector('input, select, textarea, button')) {
      items.push('Provar aquest element amb el teclat és una manera senzilla de revisar-ne l’accessibilitat.');
    }

    if (target.querySelector('code, pre')) {
      items.push('Quan modifiqueu codi amb IA, comprovar cada canvi us facilita detectar on apareix un error.');
    }

    if (target.querySelector('a[target="_blank"]')) {
      items.push('Aquest enllaç amplia la informació quan necessiteu aprofundir-hi.');
    }

    if (target.querySelector('img') && !target.matches?.('figure')) {
      items.push('Aquesta imatge mostra un exemple del que s’explica en aquest apartat.');
    }

    if (!items.length && title) {
      items.push(`Aquest apartat explica per a què serveix ${title} dins del procés.`);
    }

    if (!items.length) {
      items.push('Penseu com podríeu aplicar aquesta idea en un recurs que ja feu servir.');
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