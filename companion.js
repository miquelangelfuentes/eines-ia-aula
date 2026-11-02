(() => {
  const PREF_KEY = 'eines-ia:companion-enabled-v1';
  const SESSION_KEY = 'eines-ia:companion-session-v3';
  const AUTO_MIN_GAP = 14000;
  const GUTTER_MIN = 252;
  const GAP = 18;

  const controlReminders = [
    'Recordatori: podeu mostrar-me o amagar-me amb el botó del cursor de la barra superior.',
    'Si em voleu amagar o tornar a mostrar, feu servir el botó del cursor de la barra superior.'
  ];

  const clickTips = [
    'Proveu una idea amb un recurs petit abans d’aplicar-la a una activitat important.',
    'Quan una resposta d’IA sembli convincent, busqueu algun detall que pugueu comprovar per una altra via.',
    'Si un agent modifica una web, comproveu el resultat després de cada canvi important.',
    'Abans de publicar, navegueu una estona només amb el teclat: sovint fa visibles problemes d’accessibilitat.',
    'Abans d’un canvi important, conserveu una versió que ja funcioni. Git us permet recuperar-la si alguna cosa es trenca.',
    'Si una eina no aporta prou valor pedagògic, descartar-la també és una decisió útil.',
    'Quan adapteu un recurs generat amb IA, reviseu primer el contingut que afectarà directament l’alumnat.',
    'En una web educativa, un petit error en una ruta pot fer desaparèixer una imatge encara que el fitxer existeixi.',
    'Si una funció depèn d’un servei extern, penseu què veurà l’usuari quan aquell servei no estigui disponible.',
    'Una prova en mode fosc pot revelar problemes de contrast que passen desapercebuts en el tema clar.',
    'Quan una indicació no dona el resultat esperat, sovint ajuda més concretar el criteri de revisió que allargar-la.',
    'Si compartiu un recurs amb altres docents, procureu que en puguin entendre el funcionament sense haver de llegir el codi.'
  ];

  const pagePhrases = {
    'index.html': {
      'Qüestionari de coneixements previs per a docents': [
        'Curiositat: les respostes d’aquest qüestionari es desen al navegador i no s’envien a cap servidor.',
        'Consell: respongueu segons el que feu ara. El resultat serveix per orientar el recorregut pel material.'
      ],
      'Accés al material del taller': [
        'Consell: l’adreça curta i el codi QR porten al mateix lloc. Trieu l’opció que us sigui més còmoda durant la sessió.',
        'Curiositat: un codi QR no conté la pàgina web, sinó l’adreça que el dispositiu ha d’obrir.'
      ]
    },
    'bloc1-marc.html': {
      'Feu créixer una idea en forma de recurs web': [
        'Consell: és preferible començar amb una primera versió que funcioni i ampliar-la després de provar-la.',
        'Curiositat: treballar sobre el mateix projecte permet comparar canvis successius sense començar de zero.'
      ],
      "Per què s'ha triat Google Antigravity i GitHub?": [
        'Fixeu-vos en la funció de cada eina dins del recorregut. Aquest criteri també es pot aplicar a altres eines.',
        'Consell: separar l’edició local de la publicació ajuda a identificar on cal revisar quan apareix un problema.'
      ]
    }
  };

  let enabled = readPreference();
  let activeTarget = null;
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
  let introShown = false;

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

  function contextualPhrases(target, title) {
    const text = (target.textContent || '').toLowerCase();
    const items = [];

    if (text.includes('github pages')) {
      items.push('Curiositat: GitHub Pages publica fitxers web estàtics directament des d’un repositori.');
      items.push('Consell: a GitHub Pages, una ruta relativa incorrecta pot fer que un recurs deixi de funcionar encara que el fitxer sigui al repositori.');
    }
    if (text.includes('index.html')) {
      items.push('Curiositat: molts servidors web busquen index.html com a pàgina d’entrada per defecte.');
      items.push('Consell: en publicar, reviseu les majúscules i minúscules dels noms de fitxer perquè el servidor pot distingir-les.');
    }
    if (text.includes('llicència') || text.includes('llicencies') || text.includes('llicències')) {
      items.push('Curiositat: una llicència no elimina els drets d’autor; indica quins usos autoritza la persona titular.');
    }
    if (target.querySelector('img')) {
      items.push('Consell: el text alternatiu d’una imatge ha de transmetre la informació rellevant que aporta al contingut.');
    }
    if (target.querySelector('input, select, textarea, button')) {
      items.push('Consell: proveu aquest element amb Tab i Enter. És una comprovació ràpida per detectar barreres de navegació.');
    }
    if (target.querySelector('code, pre')) {
      items.push('Consell: quan reviseu codi generat, canvieu una sola cosa cada vegada i comproveu el resultat abans de continuar.');
    }
    if (target.querySelector('a[target="_blank"]')) {
      items.push('Consell: els recursos externs poden canviar. Si són essencials per a l’activitat, convé preveure una alternativa.');
    }

    if (!items.length) {
      items.push(`Consell: després de «${title}», proveu de resumir en una frase quina idea podríeu aplicar en un recurs propi.`);
      items.push('Fixeu-vos en quina decisió pràctica us emporteu d’aquest apartat. La resta pot quedar com a material de consulta.');
    }

    return items;
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

    bubble = document.createElement('div');
    bubble.className = 'companion-bubble';
    bubble.hidden = true;

    bubbleText = document.createElement('p');
    bubbleText.className = 'companion-bubble-text';
    bubble.appendChild(bubbleText);

    avatar = document.createElement('button');
    avatar.type = 'button';
    avatar.className = 'companion-avatar';
    avatar.setAttribute('aria-label', 'Llegir un consell de l’acompanyant');
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
    return 'Hola! Soc l’acompanyant. Podeu mostrar-me o amagar-me amb el botó del cursor de la barra. Feu clic sobre l’acompanyant per veure un consell.';
  }

  function showIntro() {
    if (!enabled || introShown) return;
    introShown = true;
    lastAutoAt = Date.now();
    positionCompanion();
    showMessage(introText(), { duration: 7200, force: true });
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
      if (!introShown) showIntro();
      else showMessage('Ja torno a ser aquí. Podeu amagar-me de nou amb el botó del cursor.', { duration: 4800, force: true });
      announce('Acompanyant de lectura activat');
    } else {
      announce('Acompanyant de lectura amagat');
    }
  }

  function handleCompanionClick() {
    if (!enabled) return;
    const reminder = takeFromDeck('controls', controlReminders);
    const tip = takeFromDeck('click-tips', clickTips);
    showMessage(`${reminder} ${tip}`, { duration: 7800, force: true });
    avatar.classList.remove('is-reacting');
    void avatar.offsetWidth;
    avatar.classList.add('is-reacting');
  }

  function showMessage(text, { duration = 5400, force = false } = {}) {
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

  function activateSection(target, index) {
    if (!target || target === activeTarget) return;
    activeTarget = target;
    const { title, items } = sectionPhrases(target, index);
    activeKey = `${currentPage()}::${title}`;
    sectionChanges += 1;
    positionCompanion();

    if (!enabled || !introShown) return;
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
      const { title } = sectionPhrases(activeTarget, 0);
      activeKey = `${currentPage()}::${title}`;
    } else {
      activeTarget = document.getElementById('contingut-principal') || document.querySelector('main');
    }

    setEnabled(enabled, false);
    positionCompanion();
    observeSections(sections);
    observeFooter();

    if (enabled) setTimeout(showIntro, 350);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();