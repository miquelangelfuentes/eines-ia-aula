(() => {
  const PREF_KEY = 'eines-ia:companion-enabled-v1';
  const SESSION_KEY = 'eines-ia:companion-session-v2';
  const INTRO_KEY = 'eines-ia:companion-intro-v2';
  const AUTO_MIN_GAP = 18000;
  const GUTTER_MIN = 252;
  const GAP = 18;

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
  let activeIndex = 0;
  let activeKey = '';
  let messageTimer = null;
  let lastAutoAt = Date.now();
  let sectionChanges = 0;
  let observer = null;
  let footerObserver = null;
  let root;
  let avatar;
  let bubble;
  let bubbleText;
  let toggle;
  let introDone = sessionStorage.getItem(INTRO_KEY) === 'seen';

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

    let nodes = [...main.querySelectorAll(':scope > .content-box, :scope > section, :scope > .diagnostic-quiz-box, :scope > figure, :scope > .pedagogical-highlight')];
    if (nodes.length < 2) nodes = [...main.querySelectorAll('.content-box, section')];

    return nodes.filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.height > 110 && !node.closest('[hidden]');
    });
  }

  function sectionPhrases(target, index) {
    const title = titleFor(target, index);
    const specific = pagePhrases[currentPage()]?.[title];
    if (specific?.length) return { title, items: specific };
    return { title, items: genericSectionPhrases.map((makePhrase) => makePhrase({ title })) };
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

    window.addEventListener('resize', positionCompanion, { passive: true });
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
    return 'Hola! Soc l’acompanyant de lectura. Em mouré per la pàgina i, de tant en tant, em fixaré en algun detall. Podeu mostrar-me o amagar-me amb el botó del cursor de la barra superior. També em podeu fer clic quan vulgueu llegir un comentari.';
  }

  function showIntro() {
    if (!enabled || introDone) return;
    introDone = true;
    sessionStorage.setItem(INTRO_KEY, 'seen');
    lastAutoAt = Date.now();
    showMessage(introText(), { duration: 12000, force: true });
  }

  function setEnabled(next, userAction = false) {
    enabled = next;
    localStorage.setItem(PREF_KEY, String(enabled));
    if (root) root.hidden = !enabled;
    if (!enabled) hideMessage(true);
    updateToggle();

    if (!userAction) return;
    if (enabled) {
      positionCompanion();
      if (!introDone) showIntro();
      else showMessage('Ja torno a ser aquí. Em mouré amb la lectura. Si em feu clic, us deixaré algun comentari.', { duration: 6500, force: true });
      announce('Acompanyant de lectura activat');
    } else {
      announce('Acompanyant de lectura amagat');
    }
  }

  function handleCompanionClick() {
    if (!enabled) return;
    const text = takeFromDeck('click', clickPhrases);
    showMessage(text, { duration: 7600, force: true });
    avatar.classList.remove('is-reacting');
    void avatar.offsetWidth;
    avatar.classList.add('is-reacting');
  }

  function showMessage(text, { duration = 5600, force = false } = {}) {
    if (!enabled || !text) return;
    clearTimeout(messageTimer);
    bubbleText.textContent = text;
    bubble.hidden = false;
    bubble.classList.remove('is-visible');
    requestAnimationFrame(() => bubble.classList.add('is-visible'));
    if (force) announce(text);
    messageTimer = setTimeout(() => hideMessage(), duration);
  }

  function hideMessage(immediate = false) {
    clearTimeout(messageTimer);
    if (!bubble) return;
    bubble.classList.remove('is-visible');
    if (immediate) bubble.hidden = true;
    else setTimeout(() => {
      if (!bubble.classList.contains('is-visible')) bubble.hidden = true;
    }, 180);
  }

  function placeInline() {
    if (!root || !activeTarget) return;
    root.classList.add('is-inline');
    root.classList.remove('is-left', 'is-right');
    root.style.removeProperty('top');
    root.style.removeProperty('left');
    const heading = activeTarget.querySelector?.(':scope > h2, :scope > h3');
    if (heading) heading.insertAdjacentElement('afterend', root);
    else if (activeTarget.firstElementChild) activeTarget.insertBefore(root, activeTarget.firstElementChild);
    else activeTarget.appendChild(root);
  }

  function positionCompanion() {
    if (!enabled || !root || !activeTarget) return;

    if (root.parentElement !== document.body) document.body.appendChild(root);
    root.classList.remove('is-inline', 'is-left', 'is-right');

    const rect = activeTarget.getBoundingClientRect();
    const rootWidth = 232;
    const rightSpace = window.innerWidth - rect.right;
    const leftSpace = rect.left;
    const canRight = rightSpace >= GUTTER_MIN;
    const canLeft = leftSpace >= GUTTER_MIN;

    if (!canRight && !canLeft) {
      placeInline();
      return;
    }

    const side = canRight && (!canLeft || rightSpace >= leftSpace) ? 'right' : 'left';
    const docTop = window.scrollY + rect.top;
    const targetOffset = Math.min(86, Math.max(34, rect.height * 0.12));
    const top = Math.max(110, docTop + targetOffset);
    const left = side === 'right'
      ? window.scrollX + rect.right + GAP
      : window.scrollX + rect.left - rootWidth - GAP;

    root.classList.add(side === 'right' ? 'is-right' : 'is-left');
    root.style.top = `${Math.round(top)}px`;
    root.style.left = `${Math.round(Math.max(8, left))}px`;
  }

  function activateSection(target, index, { silent = false } = {}) {
    if (!target || target === activeTarget) return;
    activeTarget = target;
    activeIndex = index;
    const { title, items } = sectionPhrases(target, index);
    activeKey = `${currentPage()}::${title}`;
    sectionChanges += 1;
    positionCompanion();

    if (!enabled || silent || !introDone) return;
    const now = Date.now();
    const enoughTime = now - lastAutoAt >= AUTO_MIN_GAP;
    const shouldComment = sectionChanges % 2 === 0;
    if (!enoughTime || !shouldComment) return;

    const text = takeFromDeck(`section:${activeKey}`, items);
    if (text) {
      lastAutoAt = now;
      showMessage(text, { duration: 5200 });
    }
  }

  function observeSections(sections) {
    if (!sections.length) return;

    observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          const aDistance = Math.abs(a.boundingClientRect.top - window.innerHeight * 0.38);
          const bDistance = Math.abs(b.boundingClientRect.top - window.innerHeight * 0.38);
          return aDistance - bDistance;
        });

      if (!visible.length) return;
      const target = visible[0].target;
      activateSection(target, sections.indexOf(target));
    }, {
      rootMargin: '-16% 0px -46% 0px',
      threshold: [0.02, 0.15, 0.4]
    });

    sections.forEach((section) => observer.observe(section));
  }

  function observeFooter() {
    const footer = document.querySelector('.footer, footer');
    if (!footer || !root) return;
    footerObserver = new IntersectionObserver(([entry]) => {
      root.classList.toggle('near-footer', entry.isIntersecting);
    }, { threshold: 0.05 });
    footerObserver.observe(footer);
  }

  function init() {
    if (document.getElementById('reading-companion')) return;
    buildUI();

    const sections = candidates();
    if (sections.length) {
      activeTarget = sections[0];
      activeIndex = 0;
      const { title } = sectionPhrases(activeTarget, 0);
      activeKey = `${currentPage()}::${title}`;
    } else {
      activeTarget = document.getElementById('contingut-principal') || document.querySelector('main');
    }

    setEnabled(enabled, false);
    positionCompanion();
    observeSections(sections);
    observeFooter();

    if (enabled && !introDone) setTimeout(showIntro, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
