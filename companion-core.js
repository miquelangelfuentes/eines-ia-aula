(() => {
  const PREF_KEY = 'eines-ia:companion-enabled-v1';
  const SESSION_KEY = 'eines-ia:companion-core-v2';
  const RIGHT_GAP = 12;
  const VIEWPORT_GAP = 12;


  const controlReminders = [
    'Podeu mostrar-me o amagar-me amb el botó del cursor de la barra superior.',
    'El botó del cursor de la barra superior controla si em voleu veure.'
  ];

  const clickTips = [
  "Comenceu amb una funció petita del recurs. Quan funcioni, podreu decidir quina millora us interessa.",
  "Si la IA us dona una dada important, contrasteu-la amb una font fiable abans d’utilitzar-la amb l’alumnat.",
  "Després de modificar una web, proveu l’activitat sencera com si fóssiu un alumne que l’obre per primera vegada.",
  "Proveu de recórrer el recurs amb la tecla Tab. Així sabreu si els controls es poden fer servir amb el teclat.",
  "Guardeu una versió que funcioni abans de fer un canvi important. Tindreu un punt de retorn si alguna cosa falla.",
  "Una bona indicació explica què voleu canviar i quin resultat espereu veure a la pantalla.",
  "Si una imatge desapareix, reviseu-ne el nom i la ruta. Sovint el problema és al camí del fitxer.",
  "Abans de publicar el recurs, comproveu que els textos i les retroaccions siguin adequats per al vostre grup.",
  "Si una eina necessita dades de l’alumnat, valoreu si podeu fer la prova amb dades inventades.",
  "Conservar l’enllaç a la font original us facilitarà citar imatges i revisar-ne les condicions d’ús."
];

  let enabled = readPreference();
  let root;
  let avatar;
  let bubble;
  let bubbleText;
  let toggle;
  let activeTarget = null;
  let positionFrame = 0;
  let messageTimer = null;
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

  function takeFromDeck(key, items) {
    const state = getSession();
    state.decks ||= {};
    const deck = state.decks[key] || { queue: [], last: '' };

    if (!deck.queue.length) {
      deck.queue = shuffled(items);
      if (deck.last && deck.queue.length > 1 && deck.queue[0] === deck.last) {
        [deck.queue[0], deck.queue[1]] = [deck.queue[1], deck.queue[0]];
      }
    }

    const next = deck.queue.shift();
    deck.last = next;
    state.decks[key] = deck;
    saveSession(state);
    return next;
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
    root.className = 'reading-companion is-right';
    root.setAttribute('aria-label', 'Acompanyant de lectura');

    avatar = document.createElement('button');
    avatar.type = 'button';
    avatar.className = 'companion-avatar';
    avatar.setAttribute('aria-label', 'Llegir un consell de l’acompanyant');
    avatar.innerHTML = '<i data-lucide="mouse-pointer-2" aria-hidden="true"></i><span class="companion-status-dot" aria-hidden="true"></span>';
    avatar.addEventListener('click', handleClick);
    // Les observacions contextuals gestionen la seva pròpia durada.
    window.addEventListener('companion:comment-show', () => clearTimeout(messageTimer));

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
    window.addEventListener('companion:refresh-position', schedulePosition);
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

  function showMessage(text, duration = 7000, announceText = false) {
    if (!enabled || !text) return;

    clearTimeout(messageTimer);
    bubbleText.textContent = text;
    bubble.hidden = false;
    bubble.classList.remove('is-visible');

    requestAnimationFrame(() => {
      bubble.classList.add('is-visible');
      schedulePosition();
    });

    if (announceText) announce(text);
    messageTimer = setTimeout(hideMessage, duration);
  }

  function hideMessage() {
    clearTimeout(messageTimer);
    if (!bubble) return;
    bubble.classList.remove('is-visible');
    setTimeout(() => {
      if (!bubble.classList.contains('is-visible')) {
        bubble.hidden = true;
        schedulePosition();
      }
    }, 180);
  }

  function showIntro() {
    if (!enabled || introShown) return;
    introShown = true;
    showMessage('Hola! Soc l’acompanyant. El botó del cursor em mostra o m’amaga. Feu-me clic per llegir un consell; mentre avanceu, us comentaré els apartats del taller.', 7200, true);
  }

  function setEnabled(next, userAction = false) {
    enabled = next;
    localStorage.setItem(PREF_KEY, String(enabled));
    if (root) root.hidden = !enabled;
    updateToggle();

    if (!enabled) {
      hideMessage();
      if (userAction) announce('Acompanyant de lectura amagat');
      return;
    }

    schedulePosition();
    if (userAction) {
      if (!introShown) showIntro();
      else showMessage('Ja torno a ser aquí. El botó del cursor em torna a amagar.', 5200, true);
      announce('Acompanyant de lectura activat');
    }
  }

  function handleClick() {
    if (!enabled) return;
    const reminder = takeFromDeck('controls-v3', controlReminders);
    const tip = takeFromDeck('tips-v3', clickTips);
    const duration = 11500;
    window.dispatchEvent(new CustomEvent('companion:manual-tip', { detail: { duration } }));
    showMessage(`${reminder} ${tip}`, duration, true);

    avatar.classList.remove('is-reacting');
    void avatar.offsetWidth;
    avatar.classList.add('is-reacting');
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
      '.quiz-question-card',
      '.quiz-results-panel',
      '.hero-impact-headline',
      'figure',
      '.prompt-box',
      '.comparison-card',
      '.tool-card',
      '.card-item',
      '.vibe-card',
      '.check-item',
      '.license-box',
      '.conference-visual',
      '.table-responsive',
      '.pedagogical-highlight',
      '.workshop-access-card',
      '.infographic-prompt-box',
      '.pedagogy-infographic',
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

  function updateActiveTarget() {
    const contextual = window.companionResolveActiveTarget?.();
    if (contextual) {
      activeTarget = contextual;
      return;
    }
    const nodes = candidates();
    if (!nodes.length) return;

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

    if (best) activeTarget = best;
  }

  function positionCompanion() {
    if (!enabled || !root) return;
    if (!activeTarget) updateActiveTarget();
    if (!activeTarget) return;

    if (root.parentElement !== document.body) document.body.appendChild(root);
    root.classList.remove('is-inline', 'is-left');
    root.classList.add('is-right');

    const main = document.getElementById('contingut-principal') || document.querySelector('main');
    const mainRect = main?.getBoundingClientRect();
    const targetRect = activeTarget.getBoundingClientRect();
    if (!mainRect) return;

    const rootWidth = Math.max(44, root.getBoundingClientRect().width || 186);
    const idealLeft = mainRect.right + RIGHT_GAP;
    const maxLeft = window.innerWidth - rootWidth - VIEWPORT_GAP;
    const left = Math.max(VIEWPORT_GAP, Math.min(idealLeft, maxLeft));

    const minTop = Math.max(72, headerBottom() + 16);
    const rootHeight = Math.max(44, root.getBoundingClientRect().height);
    const maxTop = Math.max(minTop, window.innerHeight - rootHeight - 20);

    const visibleTop = Math.max(targetRect.top, minTop);
    const visibleBottom = Math.min(targetRect.bottom, window.innerHeight - 20);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    let preferredTop = minTop + (window.innerHeight - minTop) * 0.42;
    if (visibleHeight > 20) {
      const targetAnchor = visibleTop + Math.min(72, Math.max(22, visibleHeight * 0.28));
      preferredTop = targetAnchor - 22;
    }

    const top = Math.min(maxTop, Math.max(minTop, preferredTop));
    root.style.top = `${Math.round(top)}px`;
    root.style.left = `${Math.round(left)}px`;
    root.style.right = 'auto';
  }

  function schedulePosition() {
    if (positionFrame) return;
    positionFrame = requestAnimationFrame(() => {
      positionFrame = 0;
      updateActiveTarget();
      positionCompanion();
    });
  }

  function init() {
    if (document.getElementById('reading-companion')) return;
    buildUI();
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