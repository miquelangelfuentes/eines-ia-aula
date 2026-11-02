(() => {
  const READY_DELAY = 5900;
  const COMMENT_DURATION = 3000;
  const STORAGE_KEY = 'eines-ia:companion-scroll-comments-v5';
  let readyAt = Date.now() + READY_DELAY;
  let lastTarget = null;
  let hideTimer = null;
  let frame = 0;
  let bubble;
  let bubbleText;

  const specificComments = {
    'Accés al material del taller': [
      'Amb el codi QR, el grup pot obrir el material directament des del mòbil.',
      'Si projecteu l’adreça curta, tothom pot entrar al recurs sense copiar una URL llarga.'
    ],
    'Qüestionari de coneixements previs per a docents': [
      'No sabeu per on començar? Aquest qüestionari us orienta cap als blocs més adients.',
      'El resultat us pot servir per decidir quines parts del taller voleu prioritzar.'
    ],
    'Objectius de la sessió': [
      'Una mirada ràpida als objectius us ajuda a anticipar què podreu posar en pràctica.',
      'Aquí podeu situar el recorregut de la sessió abans d’entrar en els detalls.'
    ],
    'Marc: de consultar a crear': [
      'Penseu en una necessitat docent concreta: aquest bloc mostra com començar a convertir-la en un recurs.',
      'És un bon punt de partida per passar d’una idea general a una primera prova.'
    ],
    'Google Antigravity pas a pas': [
      'Proveu d’explicar el canvi que voleu amb paraules senzilles i reviseu què modifica l’agent.',
      'Aquí veureu com donar instruccions a una eina que pot editar els fitxers del projecte.'
    ],
    'Configuració de GitHub': [
      'Si un canvi no surt com esperàveu, l’historial us permet recuperar una versió anterior.',
      'GitHub us ajuda a conservar el projecte i seguir-ne l’evolució amb el temps.'
    ],
    'Pages en comparació amb Google Sites': [
      'Quina opció encaixa millor amb el recurs que voleu publicar? Aquesta comparació us ajuda a decidir.',
      'Fixeu-vos en la portabilitat: pot ser important si voleu conservar el control dels fitxers.'
    ],
    'Llicències i codi obert': [
      'Una llicència explica què permeteu fer amb el material que compartiu.',
      'Aquesta part us pot ajudar a reutilitzar recursos d’altres persones amb més seguretat.'
    ],
    'Recursos visuals i citació': [
      'Una imatge ben citada també ensenya una bona pràctica a qui consulta el material.',
      'Aquí trobareu una manera senzilla d’incorporar recursos visuals indicant-ne l’origen.'
    ],
    "Bones pràctiques a l'aula": [
      'Abans de portar un recurs a l’aula, aquesta secció us pot servir com a revisió pràctica.',
      'Podeu comparar aquestes pautes amb un material que ja feu servir i detectar possibles millores.'
    ],
    'Llista de verificació': [
      'Una comprovació final pot evitar petits problemes quan compartiu el recurs amb el grup.',
      'Feu servir aquesta llista quan el recurs ja estigui gairebé a punt per publicar.'
    ],
    'Per continuar explorant: IA local': [
      'Treballar amb IA local pot donar-vos més control sobre on es processen les dades.',
      'Aquest enfocament pot ser interessant si al centre us preocupa especialment la gestió de dades.'
    ],
    'Crèdits i llicències': [
      'Els crèdits permeten saber d’on prové cada recurs i com es pot reutilitzar.',
      'Quan creeu materials propis, aquesta secció us pot servir de model per documentar les fonts.'
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

  function cleanVisibleText(text) {
    return (text || '')
      .replace(/[«»]/g, '')
      .replace(/\bclau\b/gi, 'important')
      .trim();
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
    if (explicit) return [cleanVisibleText(explicit)];

    const title = titleFor(target);
    if (specificComments[title]) return specificComments[title];

    const text = (target.textContent || '').toLowerCase();
    const items = [];

    if (hasImageCredit(target)) {
      return [
        'Aquesta imatge està correctament citada!',
        'Fixeu-vos en el peu: és un bon model per citar imatges en materials propis.'
      ];
    }

    if (target.matches?.('figure')) {
      const image = target.querySelector('img');
      if (image?.alt?.trim()) {
        items.push('El text alternatiu fa que la informació de la imatge també sigui accessible sense veure-la.');
        items.push('Bona pràctica: aquesta imatge incorpora una descripció per a tecnologies d’assistència.');
      }
      if (target.querySelector('figcaption')) {
        items.push('El peu aporta context i ajuda a identificar l’origen de la imatge.');
      }
    }

    if (target.classList?.contains('home-block-card')) {
      items.push(`Us interessa aquest tema? El bloc ${title} us permet aprofundir-hi de manera guiada.`);
      items.push(`Podeu deixar ${title} per més endavant i tornar-hi quan us sigui útil.`);
    }

    if (target.classList?.contains('ordered-step-item')) {
      items.push('Aquest objectiu concreta una acció que podreu provar durant la sessió.');
      items.push('Pregunteu-vos com traslladaríeu aquest objectiu a una activitat vostra.');
    }

    if (target.classList?.contains('pedagogical-highlight')) {
      items.push('Aquesta idea us pot servir com a criteri quan reviseu una activitat pròpia.');
      items.push('Pot ser un bon moment per pensar si aquest criteri encaixa amb el vostre alumnat.');
    }

    if (target.classList?.contains('workshop-access-card')) {
      items.push('Aquest accés està pensat perquè pugueu entrar al material ràpidament durant la sessió.');
    }

    if (text.includes('github pages')) {
      items.push('GitHub Pages converteix els fitxers del projecte en una web que podeu compartir.');
      items.push('Una vegada publicat, el recurs es pot obrir amb un enllaç com qualsevol altra web.');
    }

    if (text.includes('index.html')) {
      items.push('Curiositat: index.html acostuma a ser el primer fitxer que obre una web.');
      items.push('Si la pàgina inicial no apareix, revisar index.html és un bon primer pas.');
    }

    if (text.includes('lucide')) {
      items.push('Lucide ofereix icones amb un estil coherent, útil quan voleu donar unitat visual al material.');
      items.push('Podeu reutilitzar aquestes icones en altres recursos mantenint el mateix llenguatge visual.');
    }

    if (text.includes('llicència') || text.includes('llicències')) {
      items.push('La llicència us diu què podeu fer amb un recurs abans de reutilitzar-lo.');
      items.push('Quan publiqueu material propi, indicar la llicència facilita que altres docents sàpiguen com el poden fer servir.');
    }

    if (text.includes('privacitat') || text.includes('rgpd') || text.includes('dades personals')) {
      items.push('Abans d’introduir informació en una eina, penseu si conté dades personals de l’alumnat.');
      items.push('Aquest criteri és especialment útil quan una activitat demana noms, treballs o informació de l’alumnat.');
    }

    if (text.includes('accessibilitat') || text.includes('dua')) {
      items.push('Una petita adaptació aquí pot fer que el recurs sigui més fàcil d’utilitzar per més alumnat.');
      items.push('Proveu de mirar aquest element des del punt de vista d’algú que navega amb teclat.');
    }

    if (text.includes('indicació') || text.includes('prompt')) {
      items.push('Què voleu que faci exactament la IA? Escriure aquesta intenció de manera concreta sol ajudar molt.');
      items.push('Una bona indicació explica el resultat esperat amb paraules senzilles i específiques.');
    }

    if (text.includes('git') && !text.includes('github pages')) {
      items.push('Git funciona com un historial del projecte: cada versió us permet veure com ha anat canviant.');
      items.push('Si experimenteu amb el recurs, l’historial us dona una xarxa de seguretat per tornar enrere.');
    }

    if (text.includes('repositori')) {
      items.push('Imagineu el repositori com la carpeta principal del projecte, amb l’historial dels canvis incorporat.');
      items.push('Quan busqueu un fitxer del projecte, el repositori és el primer lloc on mirar.');
    }

    if (target.querySelector('input, select, textarea, button')) {
      items.push('Proveu aquest element amb Tab: és una comprovació ràpida d’accessibilitat.');
      items.push('Si podeu arribar-hi amb el teclat i activar-lo, ja heu fet una primera prova útil.');
    }

    if (target.querySelector('code, pre')) {
      items.push('Quan la IA modifica codi, revisar un canvi cada vegada facilita trobar l’origen d’un error.');
      items.push('No cal entendre tot el codi per comprovar si el resultat final fa el que necessiteu.');
    }

    if (target.querySelector('a[target="_blank"]')) {
      items.push('Aquest enllaç us porta a una font externa per ampliar la informació.');
      items.push('Guardeu aquest recurs si penseu que us pot servir més endavant com a consulta.');
    }

    if (target.querySelector('img') && !target.matches?.('figure')) {
      items.push('Mireu la imatge com un exemple del que s’explica en aquest punt.');
      items.push('Pot ajudar-vos a visualitzar el resultat abans de provar-lo pel vostre compte.');
    }

    if (!items.length && title) {
      items.push(`Si ${title} us resulta nou, quedeu-vos primer amb la funció que té dins del procés.`);
      items.push(`Us serviria ${title} per resoldre alguna necessitat que ja teniu al centre?`);
      items.push('Podeu tornar a aquest apartat quan us trobeu amb una necessitat semblant en un recurs propi.');
      items.push('Una lectura ràpida ja us pot donar una idea de quan us podria ser útil aquest apartat.');
    }

    if (!items.length) {
      items.push('Penseu si aquesta idea encaixa amb alguna activitat que ja feu.');
      items.push('Potser us resulta més útil com a material de consulta per recuperar més endavant.');
    }

    return [...new Set(items.map(cleanVisibleText).filter(Boolean))];
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
    const text = cleanVisibleText(choose(key, comments));
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
      const clean = cleanVisibleText(bubbleText.textContent);
      if (bubbleText.textContent !== clean) bubbleText.textContent = clean;
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