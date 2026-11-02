(() => {
  const READY_DELAY = 5900;
  const COMMENT_DURATION = 3200;
  const STORAGE_KEY = 'eines-ia:companion-scroll-comments-v6';

  let readyAt = Date.now() + READY_DELAY;
  let lastTarget = null;
  let hideTimer = null;
  let frame = 0;
  let bubble;
  let bubbleText;

  const specificCommentsByPage = {
    'index.html': {
      'Accés al material del taller': [
        'Amb el codi QR, el grup pot obrir el material directament des del mòbil.',
        'Projectar l’adreça curta evita haver de copiar una URL llarga.'
      ],
      'Qüestionari de coneixements previs per a docents': [
        'No sabeu per on començar? Aquest qüestionari us orienta cap als blocs més adients.',
        'El resultat us pot ajudar a decidir quina part del taller voleu prioritzar.'
      ],
      'Objectius de la sessió': [
        'Una mirada ràpida als objectius us ajuda a anticipar què podreu posar en pràctica.',
        'Què us agradaria endur-vos de la sessió? Els objectius us poden ajudar a situar-ho.'
      ]
    },
    'bloc1-marc.html': {
      'Feu créixer una idea en forma de recurs web': [
        'Comenceu amb una funció petita. Després ja podreu decidir com fer créixer el recurs.',
        'Una primera versió senzilla permet provar la idea abans d’invertir-hi més temps.'
      ],
      "Per què s'ha triat Google Antigravity i GitHub?": [
        'Aquí cada eina resol una part diferent del procés: crear el recurs i conservar-lo publicat.',
        'Fixeu-vos en la separació de funcions. Ajuda a entendre què depèn de cada eina.'
      ]
    },
    'bloc2-antigravity.html': {
      'Com funciona Google Antigravity?': [
        'Penseu-hi com una eina que pot treballar directament dins la carpeta del vostre projecte.',
        'La diferència important és que pot modificar fitxers del vostre ordinador després que li doneu accés.'
      ],
      'La vostra primera web funcional': [
        'L’objectiu aquí és comprovar que la idea funciona abans d’afegir-hi més coses.',
        'Una prova petita us permet veure de seguida si la indicació ha produït el resultat esperat.'
      ],
      "Ampliació: descàrrega massiva de documents PDF d'un lloc web a Documents": [
        'Aquest exemple mostra que un agent també pot automatitzar tasques repetitives amb fitxers.',
        'Us pot donar idees per a processos mecànics que ara feu manualment al navegador.'
      ],
      "Comparació: Google Antigravity, OpenAI Codex i Claude Code d'Anthropic": [
        'La millor eina dependrà del vostre flux de treball. Aquí es prioritza una experiència visual i guiada.',
        'No cal memoritzar les diferències. Fixeu-vos en quin tipus de supervisió us resulta més còmode.'
      ]
    },
    'bloc3-github.html': {
      'GitHub explicat per a docents principiants': [
        'Podeu imaginar GitHub com una carpeta del projecte que també conserva l’historial dels canvis.',
        'Si GitHub us resulta nou, quedeu-vos primer amb aquesta idea: desa el projecte i en permet la publicació.'
      ],
      'Pràctica guiada: del projecte local al primer push': [
        'Aquí fareu el pas de tenir el recurs al vostre ordinador a conservar-ne una còpia a GitHub.',
        'Penseu en el push com l’acció d’enviar la versió actual del projecte a GitHub.'
      ],
      'Per què creem el token després del repositori?': [
        'Crear el repositori primer permet limitar l’accés temporal només al projecte que necessiteu.',
        'El token funciona com una credencial temporal. Convé revocar-lo quan ja ha complert la seva funció.'
      ],
      'Per què activem GitHub Pages després de pujar el projecte?': [
        'GitHub Pages necessita que els fitxers ja siguin al repositori abans de convertir-los en una web.',
        'Quan activeu Pages, GitHub publica la versió que ja heu pujat al projecte.'
      ],
      'Alternativa opcional: GitHub Desktop': [
        'GitHub Desktop ofereix una via gràfica per sincronitzar el projecte.',
        'Aquesta opció pot resultar còmoda si preferiu veure els canvis abans d’enviar-los a GitHub.'
      ]
    },
    'bloc4-pages-sites.html': {
      'De Gemini a Google Sites sense copiar codi': [
        'Aquesta via és pràctica si ja treballeu dins de Google Workspace i voleu publicar ràpidament.',
        'Fixeu-vos que Gemini pot enviar l’artefacte a Sites directament. Després el podeu contextualitzar dins del lloc.'
      ],
      "Una comparació des de la pràctica d'aula": [
        'Què necessiteu més: edició visual o control directe dels fitxers? Aquesta pregunta us pot orientar.',
        'La tria depèn del tipus de recurs que voleu mantenir i de com el voleu actualitzar.'
      ]
    },
    'bloc5-llicencies.html': {
      'Per què cal distingir entre contingut i codi?': [
        'El text d’una activitat i el programa que la fa funcionar poden tenir llicències diferents.',
        'Separar contingut i codi evita aplicar una llicència inadequada a una part del projecte.'
      ],
      'Quina llicència de codi encaixa amb el vostre projecte?': [
        'No cal saber els noms de les llicències d’entrada. Primer decidiu què voleu permetre.',
        'Aquest orientador tradueix decisions pràctiques en una proposta de llicència de programari.'
      ],
      'Llicències recomanades per a docents': [
        'Quan compartiu un recurs, la llicència explica a altres docents què en poden fer.',
        'Fixeu-vos primer en el tipus d’obra que compartiu. Això redueix molt les opcions.'
      ]
    },
    'bloc6-recursos-visuals.html': {
      'Imatges generades amb IA: percepció i criteri pedagògic': [
        'Una pregunta útil és aquesta: què aporta la imatge a l’aprenentatge?',
        'La funció pedagògica de la imatge és un criteri més útil que el seu impacte visual.'
      ]
    },
    'bloc7-bones-practiques.html': {
      'Consells abans de publicar': [
        'Aquesta pàgina funciona bé com a revisió final d’un recurs que ja heu creat.',
        'Podeu comparar cada recomanació amb una activitat vostra i detectar millores concretes.'
      ]
    },
    'bloc8-verificacio.html': {
      'Comprovació ràpida del material': [
        'Aquesta llista converteix les bones pràctiques en comprovacions que podeu marcar una a una.',
        'Feu-la servir quan el recurs estigui gairebé a punt per compartir amb l’alumnat.'
      ]
    },
    'bloc9-per-continuar-explorant.html': {
      "Què és la intel·ligència artificial local i per què és rellevant a l'escola?": [
        'En una configuració local, el model pot funcionar al mateix dispositiu del centre.',
        'La IA local pot ser interessant quan voleu tenir més control sobre on es processen les dades.'
      ],
      "Ponència recomanada: Models d'intel·ligència artificial en local, de Jordi Mas": [
        'Aquesta ponència és una bona entrada si voleu entendre la IA local amb exemples pràctics.',
        'No cal començar amb un equip potent. La proposta és triar una tasca i buscar un model que hi encaixi.'
      ],
      'Recursos en català per treballar amb IA local': [
        'Softcatalà us pot ajudar a comparar models des del punt de vista d’un usuari catalanoparlant.',
        'El Projecte Aina és una bona porta d’entrada als recursos lingüístics oberts en català.'
      ],
      'Com executar models locals al vostre ordinador': [
        'Les eines d’escriptori redueixen la configuració tècnica necessària per començar.',
        'Abans de descarregar un model, comproveu quanta memòria té disponible l’ordinador.'
      ]
    },
    'credits.html': {
      'Autoria i marc institucional': [
        'Aquesta secció identifica qui manté el material i en quin context s’ha creat.',
        'Quan compartiu recursos propis, indicar autoria i context ajuda a mantenir-ne la traçabilitat.'
      ],
      'Projectes i fonts de referència': [
        'Aquí podeu veure quins projectes han orientat decisions del material.',
        'Les fonts de referència us poden servir per aprofundir en un tema quan el necessiteu.'
      ],
      'Recursos de tercers i marques': [
        'Aquesta taula ajuda a distingir què és propi i què prové d’altres projectes.',
        'Documentar els recursos externs facilita revisar-ne les condicions d’ús més endavant.'
      ],
      'Llicències del projecte': [
        'El material pedagògic i el codi tenen condicions de reutilització diferents.',
        'Aquesta separació pot servir de model quan publiqueu un recurs web propi.'
      ]
    }
  };

  const pageFallbacks = {
    'bloc1-marc.html': [
      'Penseu com aquesta idea podria encaixar en una necessitat docent que ja teniu.',
      'Aquí l’important és entendre el procés abans d’entrar en la part tècnica.'
    ],
    'bloc2-antigravity.html': [
      'Proveu primer amb un projecte petit. Us serà més fàcil veure què modifica l’agent.',
      'Quan una instrucció no dona el resultat esperat, concreteu el canvi que voleu veure.'
    ],
    'bloc3-github.html': [
      'Si apareix un terme nou, relacioneu-lo amb una acció concreta del projecte.',
      'GitHub sembla més tècnic al principi, però moltes accions corresponen a desar i publicar fitxers.'
    ],
    'bloc4-pages-sites.html': [
      'La millor opció és la que encaixa amb la manera com voleu mantenir el recurs després.',
      'Penseu qui haurà d’editar aquest material d’aquí a uns mesos.'
    ],
    'bloc5-llicencies.html': [
      'Davant d’una llicència, pregunteu-vos què voleu permetre a qui reutilitzi el material.',
      'No cal memoritzar sigles. El més útil és entendre les condicions que impliquen.'
    ],
    'bloc6-recursos-visuals.html': [
      'Una imatge pot orientar la lectura o explicar una idea. Aquesta funció hauria de justificar-ne l’ús.',
      'Fixeu-vos també en l’autoria: el material pot modelar bones pràctiques per a l’alumnat.'
    ],
    'bloc7-bones-practiques.html': [
      'Us passa això en algun recurs que ja utilitzeu? Pot ser una bona ocasió per revisar-lo.',
      'Una comprovació petita abans de publicar pot evitar incidències durant la classe.'
    ],
    'bloc8-verificacio.html': [
      'Marcar un punt obliga a comprovar-lo. Això fa que la llista sigui útil com a rutina docent.',
      'Podeu reutilitzar aquesta comprovació amb altres recursos creats durant el curs.'
    ],
    'bloc9-per-continuar-explorant.html': [
      'En IA local, el maquinari disponible condiciona molt la tria del model.',
      'Comenceu per una tasca concreta. Després podreu valorar si el model local us resulta útil.'
    ],
    'credits.html': [
      'Una bona pàgina de crèdits facilita reutilitzar el material amb criteri.',
      'Documentar les fonts ara us estalvia dubtes quan actualitzeu el recurs més endavant.'
    ]
  };

  function currentPage() {
    const name = location.pathname.split('/').pop();
    return name || 'index.html';
  }

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
    const heading = target.querySelector?.('h2, h3, h4, .home-card-title, .quiz-q-title, .step-content h3');
    return (heading?.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
  }

  function hasImageCredit(target) {
    if (!target.matches?.('figure')) return false;
    const caption = target.querySelector('figcaption');
    if (!caption) return false;
    const text = caption.textContent.toLowerCase();
    const links = caption.querySelectorAll('a[href]');
    return links.length > 0 && /fotografia de|imatge de|foto:|font:|llicència|unsplash|wikimedia|flickr/.test(text);
  }

  function addByText(items, text) {
    if (/dades personals|rgpd|privacitat/.test(text)) {
      items.push('Abans d’introduir informació en una eina, comproveu si conté dades personals de l’alumnat.');
      items.push('Una activitat que funciona sense comptes personals sol simplificar la gestió de dades.');
    }

    if (/accessibilitat|wcag|teclat|dua/.test(text)) {
      items.push('Proveu aquest recurs amb el teclat: és una manera ràpida de detectar algunes barreres.');
      items.push('Pregunteu-vos si tot l’alumnat podrà entendre i utilitzar aquesta part amb comoditat.');
    }

    if (/llicència|llicències|creative commons|gnu gpl|mit\b/.test(text)) {
      items.push('La llicència explica què pot fer una altra persona amb el recurs que compartiu.');
      items.push('Si reutilitzeu un recurs, comproveu les condicions abans d’incorporar-lo al vostre material.');
    }

    if (/github pages/.test(text)) {
      items.push('GitHub Pages converteix els fitxers del projecte en una web que podeu compartir amb un enllaç.');
      items.push('Després de publicar, proveu l’enllaç en una finestra nova per comprovar què veurà l’alumnat.');
    }

    if (/index\.html/.test(text)) {
      items.push('Curiositat: index.html acostuma a ser el fitxer que una web obre primer.');
      items.push('Si la pàgina inicial no apareix, revisar el nom index.html és un bon primer pas.');
    }

    if (/repositori/.test(text)) {
      items.push('Imagineu el repositori com la carpeta del projecte amb un historial dels canvis.');
      items.push('El repositori us permet conservar els fitxers encara que després canvieu d’eina d’IA.');
    }

    if (/token|credencial/.test(text)) {
      items.push('Una credencial temporal hauria de tenir només els permisos que necessiteu per a aquesta acció.');
      items.push('Quan acabeu la pràctica, revocar el token redueix el temps durant el qual pot donar accés.');
    }

    if (/indicació|prompt/.test(text)) {
      items.push('Expliqueu a la IA quin canvi voleu veure en el resultat. Una petició concreta facilita la revisió.');
      items.push('Si la resposta no us serveix, reformuleu la petició a partir del que falta al resultat.');
    }

    if (/model local|ia local|intel·ligència artificial local|ollama|lm studio|rebost/.test(text)) {
      items.push('En local, el model pot executar-se al mateix ordinador. El maquinari disponible condiciona la mida que podeu utilitzar.');
      items.push('Per començar amb IA local, trieu una tasca petita i comproveu si el vostre equip la resol amb fluïdesa.');
    }

    if (/imatge|fotografia|icona|emoji|lucide/.test(text)) {
      items.push('Fixeu-vos si aquest recurs visual ajuda a entendre alguna cosa. Aquesta és una bona pregunta abans d’afegir-lo.');
      items.push('Quan una imatge prové d’una altra persona, el peu pot deixar-ne l’autoria ben documentada.');
    }

    if (/verific|comprov|revis/.test(text)) {
      items.push('Feu aquesta comprovació com si fóssiu una persona que obre el recurs per primera vegada.');
      items.push('Una revisió breu abans de classe pot detectar problemes que durant l’edició passen desapercebuts.');
    }

    if (/alumnat|aula|activitat|docent/.test(text)) {
      items.push('Penseu en una activitat vostra: en quin moment us podria ajudar aquesta idea?');
      items.push('El criteri útil és si aquesta proposta resol una necessitat de la vostra pràctica docent.');
    }
  }

  function commentsFor(target) {
    const explicit = target.getAttribute?.('data-companion-comment');
    if (explicit) return [cleanVisibleText(explicit)];

    const title = titleFor(target);
    const page = currentPage();
    const specific = specificCommentsByPage[page]?.[title];
    if (specific?.length) return specific;

    const text = (target.textContent || '').toLowerCase();
    const items = [];

    if (hasImageCredit(target)) {
      return [
        'Aquesta imatge està correctament citada!',
        'Fixeu-vos en el peu: és un bon model per citar imatges en materials propis.',
        'Aquí podeu veure autoria i font sense haver de buscar-les en una altra pàgina.'
      ];
    }

    if (target.matches?.('figure')) {
      const image = target.querySelector('img');
      if (image?.alt?.trim()) {
        items.push('El text alternatiu permet transmetre la informació de la imatge a qui no la pot veure.');
        items.push('Bona pràctica: aquesta imatge incorpora una descripció per a tecnologies d’assistència.');
      }
      if (target.querySelector('figcaption')) {
        items.push('El peu aporta context i ajuda a identificar l’origen de la imatge.');
      }
    }

    if (target.classList?.contains('home-block-card')) {
      items.push(`Us interessa aquest tema? ${title} us permet aprofundir-hi de manera guiada.`);
      items.push(`Podeu tornar a ${title} quan us aparegui una necessitat relacionada.`);
    }

    if (target.classList?.contains('ordered-step-item')) {
      items.push('Aquest pas està pensat perquè pugueu provar una acció concreta i veure’n el resultat.');
      items.push('Si us perdeu, concentreu-vos en què hauria de passar al final d’aquest pas.');
    }

    if (target.classList?.contains('vibe-card')) {
      items.push('Aquesta recomanació es pot convertir en una pregunta de revisió abans de publicar.');
      items.push('Compareu aquesta pauta amb un recurs vostre: hi faríeu algun canvi?');
    }

    if (target.classList?.contains('check-item')) {
      items.push('Aquest punt està formulat perquè el pugueu comprovar directament en el vostre recurs.');
      items.push('Si no podeu marcar-lo amb seguretat, ja teniu una possible millora per revisar.');
    }

    if (target.classList?.contains('license-box')) {
      if (/contingut pedagògic/.test(text)) {
        items.push('Aquesta part tracta el material que llegeixen o utilitzen les persones que aprenen.');
      }
      if (/codi font/.test(text)) {
        items.push('Aquí parlem del programa que fa funcionar el recurs, no del contingut didàctic que es mostra.');
      }
    }

    if (target.classList?.contains('card-item')) {
      items.push('Aquesta targeta resumeix una idea que podeu recuperar després sense rellegir tot l’apartat.');
    }

    if (target.classList?.contains('pedagogical-highlight')) {
      items.push('Aquesta idea pot servir com a criteri quan reviseu una activitat pròpia.');
      items.push('Atureu-vos un moment aquí: és una decisió que pot tenir conseqüències en l’ús a l’aula.');
    }

    if (target.classList?.contains('workshop-access-card')) {
      items.push('Aquest accés està pensat per entrar al material ràpidament durant la sessió.');
    }

    if (target.classList?.contains('conference-visual')) {
      items.push('Aquest esquema resumeix visualment la idea del text que l’acompanya.');
      items.push('Podeu llegir primer l’esquema i tornar al text si necessiteu més detall.');
    }

    if (target.classList?.contains('conference-summary')) {
      items.push('Aquest resum és opcional: podeu desplegar-lo quan vulgueu aprofundir en la ponència.');
    }

    if (target.querySelector('input, select, textarea, button')) {
      items.push('Proveu aquest element amb Tab: és una comprovació ràpida d’accessibilitat.');
      items.push('Si podeu arribar-hi amb el teclat i activar-lo, ja heu fet una primera prova útil.');
    }

    if (target.querySelector('code, pre')) {
      items.push('Quan la IA modifica codi, revisar un canvi cada vegada facilita trobar l’origen d’un error.');
      items.push('No cal entendre tot el codi per comprovar si el resultat final fa el que necessiteu.');
    }

    addByText(items, text);

    if (target.querySelector('a[target="_blank"]')) {
      items.push('Aquest enllaç porta a una font externa que podeu guardar per consultar més endavant.');
    }

    if (target.querySelector('img') && !target.matches?.('figure')) {
      items.push('Mireu la imatge com un exemple del que s’explica en aquest punt.');
    }

    const fallback = pageFallbacks[page] || [];
    items.push(...fallback);

    if (!items.length && title) {
      items.push(`Si ${title} us resulta nou, quedeu-vos primer amb la funció que té dins del procés.`);
      items.push(`Us serviria ${title} per resoldre alguna necessitat que ja teniu al centre?`);
    }

    if (!items.length) {
      items.push('Penseu si aquesta idea encaixa amb alguna activitat que ja feu.');
      items.push('Potser us resultarà útil recuperar aquesta part quan creeu un recurs propi.');
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
      '.card-item',
      '.vibe-card',
      '.check-item',
      '.license-box',
      '.prompt-box',
      '.comparison-card',
      '.tool-card',
      '.conference-visual',
      '.conference-summary',
      'figure',
      '[data-companion-comment]'
    ].join(', ');

    return [...new Set(main.querySelectorAll(selector))].filter((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.height > 45 && style.display !== 'none' && style.visibility !== 'hidden' && !node.closest('[hidden]');
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
    const key = `${location.pathname}::${titleFor(target) || target.id || target.className || target.tagName}`;
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
      if (clean !== bubbleText.textContent) bubbleText.textContent = clean;
    };

    new MutationObserver(sanitize).observe(bubbleText, {
      childList: true,
      characterData: true,
      subtree: true
    });

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