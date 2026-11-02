(() => {
  const PREF_KEY = 'eines-ia:companion-enabled-v1';
  const SESSION_KEY = 'eines-ia:companion-session-v1';
  const INTRO_KEY = 'eines-ia:companion-intro-v1';
  const AUTO_MIN_GAP = 18000;
  const DESKTOP_QUERY = '(min-width: 1180px)';

  const clickPhrases = [
    'No cal retenir-ho tot ara. Aquest material també està pensat per tornar-hi quan us sigui útil.',
    'Podeu quedar-vos amb la idea principal i recuperar els detalls quan els necessiteu.',
    'Si una eina no encaixa amb la vostra manera de treballar, també és una conclusió útil.',
    'Provar una idea amb un recurs petit pot ajudar a decidir si val la pena continuar-hi.',
    'Potser aquesta part ja us és familiar. Podeu centrar-vos només en allò que us aporti alguna cosa nova.',
    'Quan una prova no surt com esperàveu, sovint dona pistes sobre què convé ajustar.',
    'Podeu avançar al vostre ritme. El recorregut està pensat perquè cada apartat es pugui reprendre més endavant.',
    'Una pregunta útil aquí és si això respon a una necessitat que ja teníeu a l’aula.',
    'No totes les possibilitats han d’acabar convertides en una pràctica habitual.',
    'Si esteu fent proves mentre llegiu, segurament ja esteu descobrint matisos que el text no pot anticipar.',
    'Podeu adaptar la proposta al vostre context abans de decidir si us resulta útil.',
    'Tenir criteri per descartar una opció també forma part del procés de treball amb aquestes eines.',
    'Si aquest apartat us obre una pregunta nova, ja està fent una part important de la seva feina.',
    'Podeu tornar a una idea anterior sempre que us ajudi a entendre millor el que esteu provant.'
  ];

  const genericSectionPhrases = [
    ({ title }) => `Aquest apartat, «${title}», pot ser un bon punt per aturar-vos un moment.`,
    ({ title }) => `Aquí pot ser útil pensar com encaixaria «${title}» en la vostra pràctica.`,
    () => 'Aquest és un d’aquells punts que pot guanyar sentit quan el proveu amb un cas propi.',
    () => 'Podeu llegir aquesta part amb calma i quedar-vos només amb el que us sigui útil ara.',
    () => 'Aquí hi ha una idea que pot valer la pena recuperar quan comenceu a fer proves.',
    () => 'Potser aquesta idea ja us és familiar. Fixeu-vos en el matís que us resulti més rellevant.'
  ];

  const pagePhrases = {
    'index.html': {
      'Qüestionari de coneixements previs per a docents': [
        'Aquest qüestionari serveix per situar el punt de partida. No és cap examen.',
        'Podeu respondre segons el que feu ara mateix, sense pensar en el que creieu que hauríeu de saber.',
        'El resultat només vol orientar el recorregut pel material.'
      ],
      'Accés al material del taller': [
        'Aquí teniu dues maneres d’entrar al mateix material durant la sessió.',
        'Si compartiu el recurs amb altres docents, aquesta entrada curta pot facilitar-ne l’accés.'
      ]
    },
    'bloc1-marc.html': {
      'Feu créixer una idea en forma de recurs web': [
        'Aquesta idea és central: el recurs pot evolucionar a mesura que el proveu.',
        'No cal decidir-ho tot al principi. Una primera versió ja us dona informació per continuar.',
        'Aquí el valor és poder revisar el mateix projecte després de cada prova.'
      ],
      "Per què s'ha triat Google Antigravity i GitHub?": [
        'Aquesta tria respon al recorregut del taller. Podeu aplicar el mateix criteri amb altres eines.',
        'Fixeu-vos en la funció de cada eina dins del procés, més que en el nom concret del producte.',
        'Aquest apartat pot ajudar a separar què feu al dispositiu del que després publiqueu.'
      ]
    }
  };

  let enabled = readPreference();
  let activeTarget = null;
  let activeKey = '';
  let messageTimer = null;
  let lastAutoAt = 0;
  let sectionChanges = 0;
  let observer = null;
  let footerObserver = null;
  let root;
  let avatar;
  let bubble;
  let bubbleText;
  let inlineMessage;
  let toggle;
  let mediaQuery;

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
      .slice(0, 90);
  }

  function titleFor(target, index) {
    const heading = target.querySelector?.('h2, h3, .home-card-title, .quiz-q-title');
    const label = cleanTitle(heading?.textContent);
    if (label) return label;
    if (target.id) return cleanTitle(target.id.replace(/[-_]/g, ' '));
    return `Apartat ${index + 1}`;
  }

  function candidates() {
    const main = document.getElementById('contingut-principal') || document.querySelector('main');
    if (!main) return [];

    let nodes = [...main.querySelectorAll(':scope > .content-box, :scope > section, :scope > .diagnostic-quiz-box')];
    if (nodes.length < 2) {
      nodes = [...main.querySelectorAll('.content-box, section')];
    }

    return nodes.filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.height > 120 && !node.closest('[hidden]');
    });
  }

  function sectionPhrases(target, index) {
    const title = titleFor(target, index);
    const specific = pagePhrases[currentPage()]?.[title];
    if (specific?.length) return { title, items: specific };
    return {
      title,
      items: genericSectionPhrases.map((makePhrase) => makePhrase({ title }))
    };
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

    bubble = document.createElement('div');
    bubble.className = 'companion-bubble';
    bubble.hidden = true;

    bubbleText = document.createElement('p');
    bubbleText.className = 'companion-bubble-text';
    bubble.appendChild(bubbleText);

    avatar = document.createElement('button');
    avatar.type = 'button';
    avatar.className = 'companion-avatar';
    avatar.setAttribute('aria-label', 'Fer clic a l’acompanyant de lectura');
    avatar.innerHTML = '<i data-lucide="mouse-pointer-2" aria-hidden="true"></i><span class="companion-status-dot" aria-hidden="true"></span>';
    avatar.addEventListener('click', handleCompanionClick);

    root.append(bubble, avatar);
    document.body.appendChild(root);

    inlineMessage = document.createElement('div');
    inlineMessage.className = 'companion-inline-message';
    inlineMessage.hidden = true;
    inlineMessage.setAttribute('role', 'status');
    inlineMessage.setAttribute('aria-live', 'polite');

    mediaQuery = window.matchMedia(DESKTOP_QUERY);
    mediaQuery.addEventListener?.('change', handleLayoutChange);
    window.addEventListener('resize', positionCompanion, { passive: true });
    refreshLucide();
  }

  function updateToggle() {
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.classList.toggle('is-active', enabled);
    const action = enabled ? 'Desactivar' : 'Activar';
    toggle.setAttribute('aria-label', `${action} l’acompanyant de lectura`);
    toggle.title = `${action} l’acompanyant de lectura`;
  }

  function setEnabled(next, userAction = false) {
    enabled = next;
    localStorage.setItem(PREF_KEY, String(enabled));
    document.body.classList.toggle('companion-enabled', enabled);
    root?.classList.toggle('is-disabled', !enabled);
    if (root) root.hidden = !enabled;
    if (!enabled) hideMessage(true);
    updateToggle();

    if (userAction) {
      if (enabled) {
        showMessage('Ja torno a ser aquí. Si em feu clic, us deixaré algun comentari mentre exploreu el material.', { duration: 6500, force: true });
        announce('Acompanyant de lectura activat');
      } else {
        announce('Acompanyant de lectura desactivat');
      }
    }
  }

  function handleCompanionClick() {
    if (!enabled) return;
    const text = takeFromDeck('click', clickPhrases);
    showMessage(text, { duration: 7500, force: true });
    avatar.classList.remove('is-reacting');
    void avatar.offsetWidth;
    avatar.classList.add('is-reacting');
  }

  function placeInlineMessage() {
    if (!inlineMessage || mediaQuery.matches) return;
    const target = activeTarget || document.getElementById('contingut-principal') || document.querySelector('main');
    if (!target) return;

    const heading = target.querySelector?.(':scope > h2, :scope > h3');
    if (heading) {
      heading.insertAdjacentElement('afterend', inlineMessage);
    } else if (target.firstElementChild) {
      target.insertBefore(inlineMessage, target.firstElementChild);
    } else {
      target.appendChild(inlineMessage);
    }
  }

  function showMessage(text, { duration = 5600, force = false } = {}) {
    if (!enabled || !text) return;
    clearTimeout(messageTimer);

    if (mediaQuery.matches) {
      bubbleText.textContent = text;
      bubble.hidden = false;
      bubble.classList.remove('is-visible');
      requestAnimationFrame(() => bubble.classList.add('is-visible'));
    } else {
      placeInlineMessage();
      inlineMessage.textContent = text;
      inlineMessage.hidden = false;
      inlineMessage.classList.add('is-visible');
    }

    if (force) announce(text);
    messageTimer = setTimeout(() => hideMessage(), duration);
  }

  function hideMessage(immediate = false) {
    clearTimeout(messageTimer);
    if (bubble) {
      bubble.classList.remove('is-visible');
      if (immediate) bubble.hidden = true;
      else setTimeout(() => { if (!bubble.classList.contains('is-visible')) bubble.hidden = true; }, 180);
    }
    if (inlineMessage) {
      inlineMessage.classList.remove('is-visible');
      if (immediate) inlineMessage.hidden = true;
      else setTimeout(() => { if (!inlineMessage.classList.contains('is-visible')) inlineMessage.hidden = true; }, 180);
    }
  }

  function positionCompanion() {
    if (!enabled || !root || !mediaQuery.matches || !activeTarget) return;
    const rect = activeTarget.getBoundingClientRect();
    const preferred = rect.top + Math.min(rect.height * 0.35, 180);
    const top = Math.max(175, Math.min(window.innerHeight - 125, preferred));
    root.style.setProperty('--companion-top', `${top}px`);
  }

  function activateSection(target, index) {
    if (!target || target === activeTarget) return;
    activeTarget = target;
    const { title, items } = sectionPhrases(target, index);
    activeKey = `${currentPage()}::${title}`;
    sectionChanges += 1;
    positionCompanion();

    if (!enabled) return;
    const now = Date.now();
    const enoughTime = now - lastAutoAt >= AUTO_MIN_GAP;
    const shouldComment = sectionChanges === 1 || sectionChanges % 2 === 0;
    if (!enoughTime || !shouldComment) return;

    const text = takeFromDeck(`section:${activeKey}`, items);
    if (text) {
      lastAutoAt = now;
      showMessage(text, { duration: 5200 });
    }
  }

  function observeSections() {
    const sections = candidates();
    if (!sections.length) return;

    observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          const aDistance = Math.abs(a.boundingClientRect.top - window.innerHeight * 0.36);
          const bDistance = Math.abs(b.boundingClientRect.top - window.innerHeight * 0.36);
          return aDistance - bDistance;
        });

      if (!visible.length) return;
      const target = visible[0].target;
      activateSection(target, sections.indexOf(target));
    }, {
      rootMargin: '-18% 0px -48% 0px',
      threshold: [0.02, 0.15, 0.4]
    });

    sections.forEach((section) => observer.observe(section));
    activateSection(sections[0], 0);
  }

  function observeFooter() {
    const footer = document.querySelector('.footer, footer');
    if (!footer || !root) return;
    footerObserver = new IntersectionObserver(([entry]) => {
      root.classList.toggle('near-footer', entry.isIntersecting);
    }, { threshold: 0.05 });
    footerObserver.observe(footer);
  }

  function handleLayoutChange() {
    hideMessage(true);
    positionCompanion();
  }

  function showIntroIfNeeded() {
    if (!enabled) return;
    if (sessionStorage.getItem(INTRO_KEY) === 'seen') return;
    sessionStorage.setItem(INTRO_KEY, 'seen');
    setTimeout(() => {
      showMessage('Hola! Soc l’acompanyant de lectura. Em podeu activar o desactivar amb el botó del cursor de la barra superior. Si em feu clic, us deixaré algun comentari mentre exploreu el material.', { duration: 10500, force: true });
    }, 650);
  }

  function init() {
    if (document.getElementById('reading-companion')) return;
    buildUI();
    setEnabled(enabled, false);
    observeSections();
    observeFooter();
    positionCompanion();
    showIntroIfNeeded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
