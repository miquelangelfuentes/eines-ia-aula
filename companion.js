(() => {
  const PREF_KEY = 'eines-ia:companion-enabled-v1';
  const SESSION_KEY = 'eines-ia:companion-session-v5';
  const GUTTER_MIN = 252;
  const GAP = 18;
  const COMMENT_DURATION = 3600;

  const controlReminders = [
    'Botó del cursor: em podeu mostrar o amagar.',
    'Em podeu amagar o recuperar amb el botó del cursor.'
  ];

  const clickTips = [
    'Consell: proveu primer els canvis en un recurs petit.',
    'Consell: comproveu sempre una dada que sembli important.',
    'Consell: reviseu el resultat després de cada canvi important.',
    'Consell: proveu la pàgina també amb el teclat.',
    'Consell: conserveu una versió que ja funcioni abans d’un canvi gran.',
    'Consell: una eina també es pot descartar si no aporta prou valor pedagògic.',
    'Consell: reviseu amb cura el contingut que arribarà a l’alumnat.',
    'Consell: reviseu les rutes si una imatge desapareix.',
    'Consell: penseu què passarà si un servei extern deixa de respondre.',
    'Consell: comproveu també el contrast en mode fosc.',
    'Consell: una indicació més concreta sol ser més útil que una de més llarga.',
    'Consell: procureu que el recurs s’entengui sense haver de llegir-ne el codi.'
  ];

  const pagePhrases = {
    'index.html': {
      'Accés al material del taller': [
        'El codi QR i l’adreça curta porten al mateix lloc.',
        'Aquí podeu triar la forma d’accés que us sigui més còmoda.'
      ],
      'Qüestionari de coneixements previs per a docents': [
        'Les respostes d’aquest qüestionari es desen al navegador.',
        'Aquest qüestionari només vol situar el punt de partida.'
      ],
      'Creació d’activitats interactives amb IA (Google Antigravity)': [
        'Aquí el focus és passar d’una necessitat docent a un recurs web.'
      ],
      'Publicació lliure i sobirania digital (GitHub Pages)': [
        'GitHub Pages permet publicar el recurs des del mateix repositori.'
      ],
      'Criteris ètics i llicències d’ús (vibe coding responsable)': [
        'Aquest objectiu posa el focus en un ús responsable del recurs.'
      ],
      'Marc: de consultar a crear': [
        'Aquest bloc marca el pas de consultar IA a crear amb IA.'
      ],
      'Google Antigravity pas a pas': [
        'Aquí comença el treball pràctic amb l’agent.'
      ],
      'Configuració de GitHub': [
        'GitHub conserva l’historial dels canvis del projecte.'
      ],
      'Pages en comparació amb Google Sites': [
        'Aquí es compara la portabilitat dels dos entorns.'
      ],
      'Llicències i codi obert': [
        'El contingut i el codi poden necessitar llicències diferents.'
      ],
      'Recursos visuals i citació': [
        'Aquí la citació forma part del disseny del recurs.'
      ],
      "Bones pràctiques a l'aula": [
        'Aquest bloc trasllada els criteris tècnics a la pràctica docent.'
      ],
      'Llista de verificació': [
        'Aquesta llista ajuda a revisar el recurs abans de compartir-lo.'
      ],
      'Per continuar explorant: IA local': [
        'La IA local pot funcionar sense enviar dades a un servei extern.'
      ],
      'Crèdits i llicències': [
        'Aquí podeu consultar l’autoria i les llicències del material.'
      ]
    },
    'bloc1-marc.html': {
      'Feu créixer una idea en forma de recurs web': [
        'Una primera versió funcional ja permet començar a provar.',
        'El mateix projecte pot anar creixent amb cada revisió.'
      ],
      "Per què s'ha triat Google Antigravity i GitHub?": [
        'Aquí cada eina té una funció diferent dins del procés.',
        'Separar creació i publicació ajuda a entendre millor el flux de treball.'
      ]
    }
  };

  let enabled = readPreference();
  let activeTarget = null;
  let activeKey = '';
  let messageTimer = null;
  let root;
  let avatar;
  let bubble;
  let bubbleText;
  let toggle;
  let introShown = false;
  let introUntil = 0;
  let sections = [];
  let positionFrame = 0;

  function readPreference() {
    const saved = localStorage.getItem(PREF_KEY);
    return saved === null ? true : saved === 'true';
  }

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveSession(state) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch {}
  }

  function shuffled(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function takeFromDeck(deckKey, items) {
    if (!items.length) return '';
    const state = getSession();
    state.decks ||= {};
    const deck = state.decks[deckKey] || { queue: [], last: '' };

    if (!deck.queue.length) {
      deck.queue = shuffled(items);
      if (deck.last && deck.queue.length > 1 && deck.queue[0] === deck.last) {
        [deck.queue[0], deck.queue[1]] = [deck.queue[1], deck.queue[0]];
      }
    }

    const next = deck.queue.shift();
    deck.last = next;
    state.decks[deckKey] = deck;
    saveSession(state);
    return next;
  }

  function currentPage() {
    const name = location.pathname.split('/').pop();
    return name || 'index.html';
  }

  function cleanTitle(text) {
    return (text || '')
      .replace(/\s+/g, ' ')
      .replace(/^\d+[.)]?\s*/, '')
      .trim()
      .slice(0, 100);
  }

  function titleFor(target, index) {
    const heading = target.querySelector?.('h2, h3, .home-card-title, .quiz-q-title, .step-content h3');
    const label = cleanTitle(heading?.textContent);
    if (label) return label;
    if (target.id) return cleanTitle(target.id.replace(/[-_]/g, ' '));
    if (target.matches?.('figure')) return `Imatge ${index + 1}`;
    return `Apartat ${index + 1}`;
  }

  function candidates() {
    const main = document.getElementById('contingut-principal') || document.querySelector('main');
    if (!main) return [];

    const selector = [
      ':scope > .content-box',
      ':scope > section',
      ':scope > .diagnostic-quiz-box',
      ':scope > figure',
      ':scope > .pedagogical-highlight',
      '.home-block-card',
      '.ordered-step-item',
      'figure',
      '.prompt-box',
      '.comparison-card',
      '.tool-card',
      '[data-companion-comment]'
    ].join(', ');

    const nodes = [...new Set(main.querySelectorAll(selector))];
    return nodes.filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.height > 70 && !node.closest('[hidden]');
    });
  }

  function hasProperImageCredit(target) {
    const figure = target.matches?.('figure') ? target : null;
    if (!figure) return false;
    const caption = figure.querySelector('figcaption');
    if (!caption) return false;
    const text = caption.textContent.toLowerCase();
    const links = caption.querySelectorAll('a[href]');
    const hasCreditWords = /fotografia de|imatge de|font:|llicència|unsplash|wikimedia|flickr/.test(text);
    return hasCreditWords && links.length >= 1;
  }

  function contextualPhrases(target, title) {
    const explicit = target.getAttribute?.('data-companion-comment');
    if (explicit) return [explicit];

    const text = (target.textContent || '').toLowerCase();
    const items = [];

    if (hasProperImageCredit(target)) {
      items.push('Aquesta imatge està correctament citada!');
      items.push('Aquí la font de la imatge queda visible al peu.');
      return items;
    }

    if (target.matches?.('figure')) {
      const image = target.querySelector('img');
      if (image?.alt?.trim()) items.push('Aquesta imatge incorpora text alternatiu.');
      if (target.querySelector('figcaption')) items.push('Aquesta imatge incorpora un peu explicatiu.');
    }

    if (target.classList?.contains('home-block-card')) {
      items.push(`Aquest accés porta directament a «${title}».`);
    }

    if (target.classList?.contains('ordered-step-item')) {
      items.push(`Aquest és un dels objectius de la sessió: «${title}».`);
    }

    if (target.classList?.contains('pedagogical-highlight')) {
      items.push('Aquesta capsa destaca una idea pedagògica clau.');
    }

    if (text.includes('github pages')) {
      items.push('GitHub Pages publica fitxers web directament des d’un repositori.');
    }

    if (text.includes('index.html')) {
      items.push('index.html sol actuar com a pàgina d’entrada del lloc.');
    }

    if (text.includes('lucide')) {
      items.push('Lucide permet mantenir un estil d’icones coherent.');
    }

    if (text.includes('llicència') || text.includes('llicencies') || text.includes('llicències')) {
      items.push('Aquí es concreta com es pot reutilitzar el recurs.');
    }

    if (target.querySelector('input, select, textarea')) {
      items.push('Aquest element es pot provar també amb el teclat.');
    }

    if (target.querySelector('code, pre')) {
      items.push('Aquí convé provar els canvis d’un en un.');
    }

    if (target.querySelector('a[target="_blank"]')) {
      items.push('Aquest apartat inclou un recurs extern.');
    }

    if (target.querySelector('img') && !target.matches?.('figure')) {
      items.push('Aquí la imatge acompanya l’explicació.');
    }

    if (!items.length) {
      items.push(`Fixeu-vos en «${title}».`);
      items.push('Aquest punt prepara el pas següent.');
    }

    return [...new Set(items)];
  }

  function sectionPhrases(target, index) {
    const title = titleFor(target, index);
    const specific = pagePhrases[currentPage()]?.[title];
    if (specific?.length) return { title, items: specific };
    return { title, items: contextualPhrases(target, title) };
  }

  function announce(message) {
    if (typeof window.announce === 'function') {
      window.announce(message);
      return;
    }

    let region = document.getElementById('companion-live-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'companion-live-region';
      region.className = 'visually-hidden';
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }

    region.textContent = '';
    setTimeout(() => { region.textContent = message; }, 20);
  }

  function refreshLucide() {
    window.lucide?.createIcons?.();
  }

  function buildUI() {
    const controls = document.querySelector('.controls-group');

    if (controls && !document.getElementById('btn-toggle-companion')) {
      toggle = document.createElement('button');
      toggle.id = 'btn-toggle-companion';
      toggle.className = 'btn-icon companion-toggle';
      toggle.type = 'button';
      toggle.innerHTML = '<i data-lucide="mouse-pointer-2" aria-hidden="true"></i>';
      const themeButton = document.getElementById('btn-toggle-theme');
      controls.insertBefore(toggle, themeButton || null);
      toggle.addEventListener('click', () => setEnabled(!enabled, true));
    } else {
      toggle = document.getElementById('btn-toggle-companion');
    }

    root = document.createElement('aside');
    root.id = 'reading-companion';
    root.className = 'reading-companion';
    root.setAttribute('aria-label', 'Acompanyant de lectura');

    avatar = document.createElement('button');
    avatar.type = 'button';
    avatar.className = 'companion-avatar';
    avatar.setAttribute('aria-label', 'Llegir un consell de l’acompanyant');
    avatar.innerHTML = '<i data-lucide="mouse-pointer-2" aria-hidden="true"></i><span class="companion-status-dot" aria-hidden="true"></span>';
    avatar.addEventListener('click', handleCompanionClick);

    bubble = document.createElement('div');
    bubble.className = 'companion-bubble';
    bubble.hidden = true;

    bubbleText = document.createElement('p');
    bubbleText.className = 'companion-bubble-text';
    bubble.appendChild(bubbleText);

    root.append(avatar, bubble);
    document.body.appendChild(root);

    window.addEventListener('scroll', schedulePosition, { passive: true });
    window.addEventListener('resize', schedulePosition, { passive: true });
    refreshLucide();
  }

  function updateToggle() {
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.classList.toggle('is-active', enabled);
    const action = enabled ? 'Amagar' : 'Mostrar';
    toggle.setAttribute('aria-label', `${action} l’acompanyant de lectura`);
    toggle.title = `${action} l’acompanyant de lectura`;
  }

  function introText() {
    return 'Hola! Soc l’acompanyant. Podeu mostrar-me o amagar-me amb el botó del cursor. Feu-me clic per veure un consell.';
  }

  function showIntro() {
    if (!enabled || introShown) return;
    introShown = true;
    introUntil = Date.now() + 5600;
    schedulePosition();
    showMessage(introText(), { duration: 5600, force: true });
  }

  function setEnabled(next, userAction = false) {
    enabled = next;
    localStorage.setItem(PREF_KEY, String(enabled));

    if (root) root.hidden = !enabled;
    if (!enabled) hideMessage(true);
    updateToggle();

    if (!userAction) return;

    if (enabled) {
      schedulePosition();
      if (!introShown) showIntro();
      else showMessage('Ja torno a ser aquí. El botó del cursor em torna a amagar.', { duration: 3600, force: true });
      announce('Acompanyant de lectura activat');
    } else {
      announce('Acompanyant de lectura amagat');
    }
  }

  function handleCompanionClick() {
    if (!enabled) return;
    const reminder = takeFromDeck('controls', controlReminders);
    const tip = takeFromDeck('click-tips', clickTips);
    showMessage(`${reminder} ${tip}`, { duration: 6200, force: true });

    avatar.classList.remove('is-reacting');
    void avatar.offsetWidth;
    avatar.classList.add('is-reacting');
  }

  function showMessage(text, { duration = COMMENT_DURATION, force = false } = {}) {
    if (!enabled || !text) return;

    clearTimeout(messageTimer);
    bubbleText.textContent = text;
    bubble.hidden = false;
    bubble.classList.remove('is-visible');

    requestAnimationFrame(() => {
      bubble.classList.add('is-visible');
      schedulePosition();
    });

    if (force) announce(text);
    messageTimer = setTimeout(() => hideMessage(), duration);
  }

  function hideMessage(immediate = false) {
    clearTimeout(messageTimer);
    if (!bubble) return;

    bubble.classList.remove('is-visible');

    if (immediate) {
      bubble.hidden = true;
      schedulePosition();
      return;
    }

    setTimeout(() => {
      if (!bubble.classList.contains('is-visible')) {
        bubble.hidden = true;
        schedulePosition();
      }
    }, 180);
  }

  function placeInline() {
    if (!root || !activeTarget) return;

    root.classList.add('is-inline');
    root.classList.remove('is-left', 'is-right');
    root.style.removeProperty('top');
    root.style.removeProperty('left');

    const grid = activeTarget.closest?.('.home-blocks-grid');
    if (grid && activeTarget.parentElement === grid) {
      activeTarget.insertAdjacentElement('beforebegin', root);
      return;
    }

    const heading = activeTarget.querySelector?.(':scope > h2, :scope > h3');
    if (heading) heading.insertAdjacentElement('afterend', root);
    else if (activeTarget.firstElementChild) activeTarget.insertBefore(root, activeTarget.firstElementChild);
    else activeTarget.appendChild(root);
  }

  function headerBottom() {
    const topBar = document.querySelector('.top-bar');
    const rect = topBar?.getBoundingClientRect();
    if (!rect || rect.bottom <= 0) return 0;
    return rect.bottom;
  }

  function updateActiveTarget() {
    if (!sections.length) return;

    const minY = Math.max(0, headerBottom());
    const anchorY = minY + (window.innerHeight - minY) * 0.4;
    let best = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestHeight = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom <= minY || rect.top >= window.innerHeight) return;

      let distance = 0;
      if (anchorY < rect.top) distance = rect.top - anchorY;
      else if (anchorY > rect.bottom) distance = anchorY - rect.bottom;

      const betterDistance = distance < bestDistance - 1;
      const moreSpecific = Math.abs(distance - bestDistance) <= 1 && rect.height < bestHeight;

      if (betterDistance || moreSpecific) {
        bestDistance = distance;
        bestHeight = rect.height;
        best = { section, index };
      }
    });

    if (best && best.section !== activeTarget) {
      activateSection(best.section, best.index);
    }
  }

  function positionCompanion() {
    if (!enabled || !root || !activeTarget) return;

    const main = document.getElementById('contingut-principal') || document.querySelector('main');
    const mainRect = main?.getBoundingClientRect();
    const targetRect = activeTarget.getBoundingClientRect();
    if (!mainRect) return;

    const rootWidth = 232;
    const rightSpace = window.innerWidth - mainRect.right;
    const leftSpace = mainRect.left;
    const canRight = rightSpace >= GUTTER_MIN;
    const canLeft = leftSpace >= GUTTER_MIN;

    if (!canRight && !canLeft) {
      placeInline();
      return;
    }

    if (root.parentElement !== document.body) document.body.appendChild(root);
    root.classList.remove('is-inline', 'is-left', 'is-right');

    const side = canRight && (!canLeft || rightSpace >= leftSpace) ? 'right' : 'left';
    const left = side === 'right'
      ? mainRect.right + GAP
      : mainRect.left - rootWidth - GAP;

    const minTop = Math.max(72, headerBottom() + 16);
    const rootHeight = Math.max(44, root.getBoundingClientRect().height);
    const maxTop = Math.max(minTop, window.innerHeight - rootHeight - 24);
    const visibleTop = Math.max(targetRect.top, minTop);
    const visibleBottom = Math.min(targetRect.bottom, window.innerHeight - 24);

    let preferredTop = minTop + (window.innerHeight - minTop) * 0.4;
    if (visibleBottom > visibleTop + 20) {
      preferredTop = visibleTop + Math.min(72, Math.max(18, (visibleBottom - visibleTop) * 0.26));
    }

    const top = Math.min(maxTop, Math.max(minTop, preferredTop));

    root.classList.add(side === 'right' ? 'is-right' : 'is-left');
    root.style.top = `${Math.round(top)}px`;
    root.style.left = `${Math.round(Math.max(8, left))}px`;
  }

  function schedulePosition() {
    if (positionFrame) return;

    positionFrame = requestAnimationFrame(() => {
      positionFrame = 0;
      updateActiveTarget();
      positionCompanion();
    });
  }

  function activateSection(target, index) {
    if (!target || target === activeTarget) return;

    activeTarget = target;
    const { title, items } = sectionPhrases(target, index);
    activeKey = `${currentPage()}::${title}`;
    positionCompanion();

    if (!enabled || !introShown || Date.now() < introUntil) return;

    const text = takeFromDeck(`section:${activeKey}`, items);
    if (text) showMessage(text, { duration: COMMENT_DURATION });
  }

  function init() {
    if (document.getElementById('reading-companion')) return;

    buildUI();
    sections = candidates();
    activeTarget = sections[0] || document.getElementById('contingut-principal') || document.querySelector('main');

    if (activeTarget) {
      const index = Math.max(0, sections.indexOf(activeTarget));
      const { title } = sectionPhrases(activeTarget, index);
      activeKey = `${currentPage()}::${title}`;
    }

    setEnabled(enabled, false);
    schedulePosition();

    if (enabled) setTimeout(showIntro, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
