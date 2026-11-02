(() => {
  const READY_DELAY = 5900;
  const COMMENT_DURATION = 3200;
  const STORAGE_KEY = 'eines-ia:companion-scroll-comments-v7';

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
        'Projectar l’adreça curta evita haver de copiar una URL llarga.',
        'Aquest accés ràpid és pràctic quan voleu començar una activitat amb tot el grup alhora.'
      ],
      'Qüestionari de coneixements previs per a docents': [
        'Aquest qüestionari us orienta cap als blocs que encaixen millor amb el vostre punt de partida.',
        'El resultat us pot ajudar a decidir quina part del taller voleu prioritzar.',
        'Responeu segons el que feu ara; així l’orientació serà més útil.'
      ],
      'Objectius de la sessió': [
        'Una mirada ràpida als objectius us ajuda a anticipar què podreu posar en pràctica.',
        'Què us agradaria endur-vos de la sessió? Els objectius us poden ajudar a situar-ho.',
        'Llegir els objectius abans de començar facilita relacionar cada activitat amb el propòsit del taller.'
      ]
    },
    'bloc1-marc.html': {
      'Feu créixer una idea en forma de recurs web': [
        'Comenceu amb una funció petita. Després ja podreu decidir com fer créixer el recurs.',
        'Una primera versió senzilla permet provar la idea abans d’invertir-hi més temps.',
        'Aquest enfocament us pot ajudar a convertir una necessitat docent en una prova concreta.'
      ],
      "Per què s'ha triat Google Antigravity i GitHub?": [
        'Cada eina resol una part diferent del procés: una ajuda a crear i l’altra conserva el projecte.',
        'Fixeu-vos en la separació de funcions. Ajuda a entendre què depèn de cada eina.',
        'Entendre el paper de cada servei us facilitarà substituir-lo més endavant si canvieu d’eina.'
      ]
    },
    'bloc2-antigravity.html': {
      'Com funciona Google Antigravity?': [
        'Penseu-hi com una eina que pot treballar directament dins la carpeta del vostre projecte.',
        'Pot modificar fitxers del vostre ordinador després que li doneu accés a la carpeta de treball.',
        'Aquesta manera de treballar redueix la necessitat de copiar codi entre finestres.'
      ],
      'La vostra primera web funcional': [
        'L’objectiu aquí és comprovar que la idea funciona abans d’afegir-hi més elements.',
        'Una prova petita us permet veure de seguida si la indicació ha produït el resultat esperat.',
        'Quan la primera versió funciona, podeu decidir amb més criteri quin serà el canvi següent.'
      ],
      "Ampliació: descàrrega massiva de documents PDF d'un lloc web a Documents": [
        'Aquest exemple mostra que un agent també pot automatitzar tasques repetitives amb fitxers.',
        'Us pot donar idees per a processos mecànics que ara feu manualment al navegador.',
        'Abans d’automatitzar una descàrrega, comproveu que els documents es poden obtenir i reutilitzar.'
      ],
      "Comparació: Google Antigravity, OpenAI Codex i Claude Code d'Anthropic": [
        'La tria d’eina depèn del tipus de supervisió que us resulti més còmode.',
        'Fixeu-vos en la manera de treballar de cada eina, més que en el nom del producte.',
        'En aquesta formació s’ha prioritzat una experiència visual i guiada.'
      ]
    },
    'bloc3-github.html': {
      'GitHub explicat per a docents principiants': [
        'Podeu imaginar GitHub com una carpeta del projecte que també conserva l’historial dels canvis.',
        'Si GitHub us resulta nou, quedeu-vos primer amb aquesta idea: desa el projecte i en permet la publicació.',
        'Veure el repositori com una carpeta compartida ajuda a entendre molts dels passos següents.'
      ],
      'Pràctica guiada: del projecte local al primer push': [
        'Aquí fareu el pas de tenir el recurs al vostre ordinador a conservar-ne una còpia a GitHub.',
        'Penseu en el push com l’acció d’enviar la versió actual del projecte a GitHub.',
        'Revisar els fitxers abans de la pujada us ajuda a comprovar què quedarà publicat al repositori.'
      ],
      'Per què creem el token després del repositori?': [
        'Crear el repositori primer permet limitar l’accés temporal al projecte que necessiteu.',
        'El token funciona com una credencial temporal; revoqueu-lo quan la pujada hagi acabat.',
        'Limitar els permisos redueix l’abast de la credencial si es comparteix per error.'
      ],
      'Per què activem GitHub Pages després de pujar el projecte?': [
        'GitHub Pages necessita que els fitxers siguin al repositori abans de convertir-los en un lloc web.',
        'Quan activeu Pages, GitHub publica la versió que ja heu pujat al projecte.',
        'Aquest ordre facilita comprovar primer els fitxers i publicar-los després.'
      ],
      'Alternativa opcional: GitHub Desktop': [
        'GitHub Desktop ofereix una via gràfica per sincronitzar el projecte.',
        'Aquesta opció pot resultar còmoda si preferiu veure els canvis abans d’enviar-los a GitHub.',
        'La interfície gràfica us pot ajudar a entendre quins fitxers han canviat entre dues versions.'
      ]
    },
    'bloc4-pages-sites.html': {
      'De Gemini a Google Sites sense copiar codi': [
        'Aquesta via és pràctica si ja treballeu dins de Google Workspace i voleu publicar ràpidament.',
        'Gemini pot enviar l’artefacte a Sites directament i després el podeu contextualitzar dins del lloc.',
        'Aquesta opció redueix els passos tècnics quan el recurs acabarà integrat en un Google Site.'
      ],
      "Una comparació des de la pràctica d'aula": [
        'Què necessiteu més: edició visual o control directe dels fitxers? Aquesta pregunta us pot orientar.',
        'La tria depèn de qui mantindrà el recurs i de com l’actualitzareu.',
        'Google Sites simplifica l’edició visual; GitHub Pages dona més control sobre els fitxers web.'
      ]
    },
    'bloc5-llicencies.html': {
      'Per què cal distingir entre contingut i codi?': [
        'El text d’una activitat i el programa que la fa funcionar poden tenir llicències diferents.',
        'Separar contingut i codi ajuda a aplicar la llicència adequada a cada part del projecte.',
        'Aquesta distinció us pot servir quan publiqueu recursos interactius creats amb IA.'
      ],
      'Quina llicència de codi encaixa amb el vostre projecte?': [
        'Podeu començar decidint què voleu permetre abans de mirar el nom de cada llicència.',
        'Aquest orientador tradueix decisions pràctiques en una proposta de llicència de programari.',
        'Pensar en la reutilització futura us ajudarà a respondre les preguntes de l’orientador.'
      ],
      'Llicències recomanades per a docents': [
        'Quan compartiu un recurs, la llicència explica a altres docents què en poden fer.',
        'Fixeu-vos primer en el tipus d’obra que compartiu; això redueix molt les opcions.',
        'Una llicència ben indicada facilita que el material es reutilitzi amb les condicions que heu triat.'
      ]
    },
    'bloc6-recursos-visuals.html': {
      'Imatges generades amb IA: percepció i criteri pedagògic': [
        'Una pregunta útil és aquesta: què aporta la imatge a l’aprenentatge?',
        'La funció pedagògica de la imatge és un criteri més útil que el seu impacte visual.',
        'Abans d’afegir una imatge, penseu quina informació ajuda a comprendre.'
      ],
      'Autenticitat percebuda i transparència': [
        'Explicar l’origen d’una imatge pot ser rellevant quan aquest origen afecta la manera d’interpretar-la.',
        'La transparència sobre l’ús d’IA ajuda a situar millor el recurs davant de l’alumnat.',
        'Aquest criteri és útil quan la procedència de la imatge forma part del missatge educatiu.'
      ],
      'Funció pedagògica abans que decoració': [
        'Una imatge té més sentit quan ajuda a comprendre o contextualitzar una idea.',
        'Si la imatge respon a una funció concreta, és més fàcil justificar-ne la presència al material.',
        'Preguntar què aporta cada recurs visual ajuda a reduir elements que distreuen.'
      ],
      'Emoji per a senyals breus i informals': [
        'Els emoji poden funcionar bé com a senyals breus dins d’un material informal.',
        'La forma d’un emoji pot canviar entre sistemes, així que el text ha de conservar el significat principal.',
        'Per a una acció important, és preferible que l’emoji vagi acompanyat d’una etiqueta escrita.'
      ],
      'Icones SVG per a un sistema visual coherent': [
        'Una mateixa família d’icones ajuda a mantenir unitat visual entre les pàgines.',
        'Les icones SVG es poden adaptar al tema clar o fosc sense perdre qualitat.',
        'Quan una icona comunica una acció, convé que el control tingui també una etiqueta accessible.'
      ],
      'Prepareu el contingut abans del disseny': [
        'Començar pel contingut us ajuda a decidir què necessita una representació visual.',
        'Un bloc breu amb una sola idea acostuma a ser més fàcil de convertir en infografia.',
        'Definir primer què ha d’aprendre l’alumnat evita que el disseny marqui el contingut.'
      ],
      'Construïu la infografia en HTML': [
        'L’HTML manté el text editable i facilita revisar-lo abans d’exportar-lo.',
        'Fer servir Lucide permet mantenir el mateix estil d’icones que la resta del lloc.',
        'Aquesta via us permet ajustar el contingut sense haver de regenerar tota la imatge.'
      ],
      'Reviseu-la en pantalla': [
        'Comproveu el text abans de convertir la infografia en una imatge final.',
        'Veure-la en mode clar i fosc us ajuda a detectar problemes de contrast.',
        'Revisar la composició en pantalla facilita detectar text tallat o massa dens.'
      ],
      'Exporteu el component a PNG': [
        'L’exportació arriba al final, quan el contingut ja està revisat.',
        'Demanar una renderització fidel ajuda a conservar el disseny que heu validat.',
        'La transparència exterior facilita inserir la infografia sobre fons diferents.'
      ],
      'Wikimedia Commons': [
        'Wikimedia Commons és útil quan necessiteu imatges amb informació detallada sobre autoria i llicència.',
        'Cada fitxer pot tenir condicions diferents; reviseu sempre la fitxa concreta.',
        'Aquest repositori és especialment pràctic per a materials curriculars amb fonts documentals.'
      ],
      'Unsplash (secció gratuïta)': [
        'Unsplash ofereix fotografies contemporànies que poden ajudar a contextualitzar activitats.',
        'La seva llicència té condicions pròpies, així que convé consultar-la abans de redistribuir una fotografia.',
        'Reconèixer l’autoria pot convertir la citació en una bona pràctica educativa encara que la plataforma no l’exigeixi.'
      ],
      'Pexels': [
        'Pexels pot ser útil quan necessiteu fotografies o vídeos per contextualitzar una activitat.',
        'La llicència de Pexels permet molts usos educatius i també estableix restriccions de redistribució.',
        'Abans de publicar el material, reviseu si l’ús que en feu encaixa amb les condicions de la plataforma.'
      ],
      'Pixabay': [
        'Pixabay reuneix imatges i vídeos que es poden reutilitzar sota la seva llicència pròpia.',
        'La plataforma limita alguns usos del contingut sense modificar; reviseu les condicions si el voleu redistribuir.',
        'Consultar la llicència abans de publicar evita confondre ús gratuït amb absència de condicions.'
      ],
      'T - Títol (Title)': [
        'El títol ajuda a identificar l’obra quan feu una atribució.',
        'Si la font no dona un títol, podeu fer servir una descripció breu que identifiqui la imatge.',
        'Aquest camp facilita que la persona lectora entengui quina obra esteu citant.'
      ],
      'A - Autoria (Author)': [
        'Indicar l’autoria reconeix la persona creadora de la imatge.',
        'Quan és possible, enllaçar el nom amb el perfil facilita localitzar l’obra original.',
        'Aquesta dada converteix la citació en un model de respecte per l’autoria.'
      ],
      'S - Font (Source)': [
        'La font permet tornar a la pàgina d’on s’ha obtingut l’obra.',
        'Un enllaç directe facilita comprovar la procedència de la imatge.',
        'Conservar la font ajuda a revisar les condicions d’ús més endavant.'
      ],
      'L - Llicència (License)': [
        'La llicència explica quines condicions s’apliquen a la reutilització de l’obra.',
        'Enllaçar la llicència facilita consultar-ne els termes complets.',
        'Aquest camp ajuda a distingir què està permès quan compartiu el material.'
      ]
    },
    'bloc7-bones-practiques.html': {
      'Consells abans de publicar': [
        'Aquesta pàgina funciona bé com a revisió final d’un recurs que ja heu creat.',
        'Podeu comparar cada recomanació amb una activitat vostra i detectar millores concretes.',
        'Fer aquesta revisió abans de compartir el recurs pot evitar incidències durant la classe.'
      ]
    },
    'bloc8-verificacio.html': {
      'Comprovació ràpida del material': [
        'Aquesta llista converteix les bones pràctiques en comprovacions que podeu marcar una a una.',
        'Feu-la servir quan el recurs estigui gairebé a punt per compartir amb l’alumnat.',
        'Si un punt us genera dubtes, ja teniu un aspecte concret per revisar abans de publicar.'
      ]
    },
    'bloc9-per-continuar-explorant.html': {
      "Què és la intel·ligència artificial local i per què és rellevant a l'escola?": [
        'En una configuració local, el model pot funcionar al mateix dispositiu del centre.',
        'La IA local pot ser interessant quan voleu tenir més control sobre on es processen les dades.',
        'Aquest enfocament també redueix la dependència d’una connexió permanent a serveis externs.'
      ],
      "Ponència recomanada: Models d'intel·ligència artificial en local, de Jordi Mas": [
        'Aquesta ponència és una bona entrada si voleu entendre la IA local amb exemples pràctics.',
        'Podeu començar amb el maquinari que ja teniu i buscar un model que hi encaixi.',
        'La idea més útil és triar primer una tasca concreta i valorar després quin model la resol millor.'
      ],
      'Recursos en català per treballar amb IA local': [
        'Softcatalà us pot ajudar a comparar models des del punt de vista d’una persona catalanoparlant.',
        'El Projecte Aina és una bona porta d’entrada als recursos lingüístics oberts en català.',
        'Aquestes fonts us poden orientar quan el rendiment en català és un criteri important.'
      ],
      'Com executar models locals al vostre ordinador': [
        'Les eines d’escriptori redueixen la configuració tècnica necessària per començar.',
        'Abans de descarregar un model, comproveu quanta memòria té disponible l’ordinador.',
        'Començar amb un model petit facilita comprovar si la tasca funciona bé al vostre equip.'
      ]
    },
    'credits.html': {
      'Autoria i marc institucional': [
        'Aquesta secció identifica qui manté el material i en quin context s’ha creat.',
        'Quan compartiu recursos propis, indicar autoria i context ajuda a mantenir-ne la traçabilitat.',
        'Aquest model us pot servir per explicar qui és responsable d’un material formatiu.'
      ],
      'Projectes i fonts de referència': [
        'Aquí podeu veure quins projectes han orientat decisions del material.',
        'Les fonts de referència us poden servir per aprofundir en un tema quan el necessiteu.',
        'Documentar aquestes influències ajuda a entendre d’on provenen alguns criteris del lloc.'
      ],
      'Recursos de tercers i marques': [
        'Aquesta taula ajuda a distingir què és propi i què prové d’altres projectes.',
        'Documentar els recursos externs facilita revisar-ne les condicions d’ús més endavant.',
        'Aquesta pràctica és útil quan un projecte incorpora biblioteques o imatges de procedències diverses.'
      ],
      'Llicències del projecte': [
        'El material pedagògic i el codi tenen condicions de reutilització diferents.',
        'Aquesta separació pot servir de model quan publiqueu un recurs web propi.',
        'Fer visibles les llicències ajuda altres docents a saber com poden reutilitzar el projecte.'
      ]
    }
  };

  const pageFallbacks = {
    'index.html': [
      'Aquest punt us pot ajudar a situar el recorregut abans de continuar.',
      'Quina part d’aquest apartat us resulta més útil per a la sessió?',
      'Podeu tornar-hi més endavant si necessiteu recuperar aquesta informació.'
    ],
    'bloc1-marc.html': [
      'Penseu com aquesta idea podria encaixar en una necessitat docent que ja teniu.',
      'Entendre el procés us facilitarà seguir els blocs més tècnics.',
      'Relacioneu aquest punt amb un recurs que ja feu servir a l’aula.'
    ],
    'bloc2-antigravity.html': [
      'Proveu primer amb un projecte petit; us serà més fàcil veure què modifica l’agent.',
      'Quan una indicació s’allunya del resultat esperat, concreteu el canvi que voleu veure.',
      'Revisar cada pas us ajuda a entendre què ha fet l’eina sobre els fitxers.'
    ],
    'bloc3-github.html': [
      'Si apareix un terme nou, relacioneu-lo amb una acció concreta del projecte.',
      'Moltes accions de GitHub corresponen a desar fitxers o publicar-los.',
      'Penseu en quin moment del procés esteu: preparar el projecte, conservar-lo o publicar-lo.'
    ],
    'bloc4-pages-sites.html': [
      'La millor opció és la que encaixa amb la manera com voleu mantenir el recurs.',
      'Penseu qui haurà d’editar aquest material d’aquí a uns mesos.',
      'El grau de control que necessiteu sobre els fitxers pot orientar la tria.'
    ],
    'bloc5-llicencies.html': [
      'Davant d’una llicència, pregunteu-vos què voleu permetre a qui reutilitzi el material.',
      'Entendre les condicions és més útil que memoritzar les sigles.',
      'Penseu si esteu compartint contingut pedagògic o codi abans de triar la llicència.'
    ],
    'bloc6-recursos-visuals.html': [
      'Una imatge pot orientar la lectura o explicar una idea; la seva funció hauria de justificar-ne l’ús.',
      'Fixeu-vos també en l’autoria: el material pot modelar bones pràctiques per a l’alumnat.',
      'Pregunteu-vos si aquest recurs visual ajuda a comprendre millor el contingut.'
    ],
    'bloc7-bones-practiques.html': [
      'Us passa això en algun recurs que ja feu servir? Pot ser una bona ocasió per revisar-lo.',
      'Una comprovació breu abans de publicar pot evitar incidències durant la classe.',
      'Penseu com aplicaríeu aquesta pauta a una activitat que ja tingueu preparada.'
    ],
    'bloc8-verificacio.html': [
      'Marcar un punt obliga a comprovar-lo i converteix la llista en una rutina útil.',
      'Podeu reutilitzar aquesta comprovació amb altres recursos creats durant el curs.',
      'Un dubte en aquesta llista pot indicar quin aspecte convé revisar abans de compartir el recurs.'
    ],
    'bloc9-per-continuar-explorant.html': [
      'En IA local, el maquinari disponible condiciona molt la tria del model.',
      'Comenceu per una tasca concreta i valoreu després quin model hi encaixa.',
      'Aquest apartat us pot servir com a referència si més endavant voleu provar eines locals.'
    ],
    'credits.html': [
      'Una bona pàgina de crèdits facilita reutilitzar el material amb criteri.',
      'Documentar les fonts ara us estalvia dubtes quan actualitzeu el recurs més endavant.',
      'Aquest apartat pot servir de model per preparar els crèdits d’un projecte propi.'
    ]
  };

  const universalFallbacks = [
    'Quina idea d’aquest apartat us podria ser útil en una activitat vostra?',
    'Aquest punt pot servir com a referència quan prepareu un recurs semblant.',
    'Si el concepte és nou, relacioneu-lo amb una necessitat concreta de l’aula.'
  ];

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
      .replace(/\s+/g, ' ')
      .trim();
  }

  function titleFor(target) {
    const heading = target.querySelector?.('h2, h3, h4, .home-card-title, .quiz-q-title, .step-content h3');
    return cleanVisibleText(heading?.textContent || '').slice(0, 140);
  }

  function fingerprintFor(target) {
    const title = titleFor(target);
    if (title) return title;
    if (target.id) return target.id;
    return cleanVisibleText(target.textContent || '').slice(0, 90) || target.className || target.tagName;
  }

  function hasImageCredit(target) {
    if (!target.matches?.('figure')) return false;
    const caption = target.querySelector('figcaption');
    if (!caption) return false;
    const text = caption.textContent.toLowerCase();
    const links = caption.querySelectorAll('a[href]');
    return links.length > 0 && /fotografia de|imatge de|foto:|font:|llicència|unsplash|wikimedia|flickr/.test(text);
  }

  function unique(items) {
    return [...new Set(items.map(cleanVisibleText).filter(Boolean))];
  }

  function ensureThree(items, target) {
    const page = currentPage();
    const fallbacks = pageFallbacks[page] || universalFallbacks;
    const title = titleFor(target);
    const titleOptions = title
      ? [
          `Quina utilitat podria tenir ${title} en una activitat vostra?`,
          `Aquest apartat sobre ${title} us pot servir com a referència quan prepareu un recurs semblant.`,
          `Si ${title} us resulta nou, relacioneu-lo amb una necessitat concreta de l’aula.`
        ]
      : universalFallbacks;

    return unique([...items, ...fallbacks, ...titleOptions, ...universalFallbacks]).slice(0, 3);
  }

  function commentsFor(target) {
    const explicit = target.getAttribute?.('data-companion-comment');
    if (explicit) {
      return ensureThree([
        explicit,
        'Aquest comentari destaca una decisió que convé tenir present mentre reviseu el recurs.',
        'Podeu recuperar aquesta idea quan adapteu el material al vostre context.'
      ], target);
    }

    const page = currentPage();
    const title = titleFor(target);
    const specific = specificCommentsByPage[page]?.[title];
    if (specific) return ensureThree(specific, target);

    const text = cleanVisibleText(target.textContent || '').toLowerCase();
    const items = [];

    if (hasImageCredit(target)) {
      return ensureThree([
        'Aquesta imatge està citada amb autoria i procedència visibles.',
        'Fixeu-vos en el peu: us pot servir de model per citar imatges en materials propis.',
        'La citació permet que altres docents localitzin l’origen de la imatge.'
      ], target);
    }

    if (target.matches?.('figure')) {
      const image = target.querySelector('img');
      if (image?.alt?.trim()) {
        items.push(
          'Aquesta imatge incorpora text alternatiu per descriure’n el contingut.',
          'El text alternatiu ajuda a accedir a la informació visual amb tecnologies d’assistència.',
          'Quan una imatge aporta informació, descriure-la millora l’accessibilitat del recurs.'
        );
      }
      if (target.querySelector('figcaption')) {
        items.push(
          'El peu ajuda a identificar la procedència de la imatge.',
          'Un peu ben redactat pot aportar context sense carregar el cos principal del text.',
          'Fer visible l’origen de la imatge facilita revisar-ne l’ús més endavant.'
        );
      }
    }

    if (target.classList?.contains('home-block-card')) {
      items.push(
        'Aquesta targeta us permet entrar directament en un bloc concret del taller.',
        'Podeu prioritzar aquest bloc si respon a una necessitat que ja teniu al centre.',
        'El resum de la targeta us ajuda a decidir si aquest contingut us convé ara o més endavant.'
      );
    }

    if (target.classList?.contains('ordered-step-item')) {
      items.push(
        'Aquest pas concreta una acció que podeu provar mentre avanceu.',
        'Si us perdeu, fixeu-vos primer en quin resultat hauria de quedar al final d’aquest pas.',
        'Completar el pas i comprovar-ne el resultat ajuda a detectar errors abans de continuar.'
      );
    }

    if (target.classList?.contains('vibe-card')) {
      items.push(
        'Compareu aquesta pauta amb un recurs vostre: hi faríeu algun canvi?',
        'Aquest criteri pot servir com a revisió abans de portar el material a l’aula.',
        'Aplicar aquesta pauta en un recurs propi us ajudarà a veure si és prou pràctica.'
      );
    }

    if (target.classList?.contains('check-item')) {
      items.push(
        'Si podeu marcar aquest punt amb seguretat, el recurs ja ha superat una comprovació útil.',
        'Un dubte aquí indica un aspecte concret que convé revisar abans de publicar.',
        'Podeu reutilitzar aquesta mateixa comprovació en altres materials digitals.'
      );
    }

    if (target.classList?.contains('license-box')) {
      items.push(
        'Aquesta capsa separa les condicions del contingut de les del codi.',
        'Fixeu-vos en quin tipus de material regula aquesta llicència.',
        'Aquesta distinció us pot servir quan publiqueu un recurs interactiu propi.'
      );
    }

    if (target.classList?.contains('conference-visual')) {
      items.push(
        'Aquest esquema resumeix visualment la idea que s’acaba d’explicar.',
        'Podeu llegir primer el flux visual i tornar al text si necessiteu més detall.',
        'Aquest tipus d’esquema pot ser útil per sintetitzar conceptes complexos en una formació.'
      );
    }

    if (target.classList?.contains('table-responsive')) {
      items.push(
        'La taula permet comparar opcions sense haver de llegir cada apartat per separat.',
        'Fixeu-vos en el criteri que més s’ajusta a la vostra necessitat docent.',
        'Una lectura per files us pot ajudar a prendre una decisió concreta.'
      );
    }

    if (target.classList?.contains('pedagogical-highlight')) {
      items.push(
        'Aquesta capsa destaca una idea que podeu aplicar en la pràctica docent.',
        'Penseu si aquest criteri encaixa amb un material que ja feu servir.',
        'Pot ser un bon punt per decidir quin canvi faríeu en un recurs propi.'
      );
    }

    if (target.classList?.contains('workshop-access-card')) {
      items.push(
        'Aquest accés està pensat perquè pugueu obrir el material ràpidament durant la sessió.',
        'Compartir una entrada curta facilita que el grup arribi al mateix recurs.',
        'Podeu reutilitzar aquest sistema d’accés en altres tallers o activitats amb el grup.'
      );
    }

    if (target.classList?.contains('infographic-prompt-box')) {
      items.push(
        'Aquesta indicació es pot copiar i adaptar al contingut que vulgueu representar.',
        'Reviseu el text generat abans de convertir la infografia en una imatge final.',
        'Conservar l’HTML editable us facilita corregir el contingut més endavant.'
      );
    }

    if (target.classList?.contains('pedagogy-infographic')) {
      items.push(
        'Aquesta infografia està construïda amb HTML i icones, de manera que el text continua sent editable.',
        'Fixeu-vos en la jerarquia visual: cada bloc comunica una idea concreta.',
        'Aquest format us pot servir quan voleu una infografia que pugueu revisar abans d’exportar.'
      );
    }

    if (target.classList?.contains('quiz-question-card')) {
      items.push(
        'Responeu segons la vostra pràctica actual perquè el resultat sigui útil.',
        'Aquesta pregunta serveix per situar el vostre punt de partida dins del recorregut.',
        'El qüestionari orienta la navegació i podeu tornar a qualsevol bloc més endavant.'
      );
    }

    if (text.includes('github pages')) {
      items.push(
        'GitHub Pages publica els fitxers del repositori com un lloc web.',
        'Quan actualitzeu els fitxers publicats, GitHub Pages pot reflectir la versió nova.',
        'Aquesta opció és útil quan voleu conservar els fitxers web del projecte.'
      );
    }

    if (text.includes('google sites')) {
      items.push(
        'Google Sites facilita mantenir el recurs des d’un editor visual.',
        'És una opció pràctica quan el centre ja treballa amb Google Workspace.',
        'L’edició visual pot simplificar el manteniment quan diverses persones han d’actualitzar el recurs.'
      );
    }

    if (text.includes('index.html')) {
      items.push(
        'index.html acostuma a ser el fitxer d’entrada d’un lloc web.',
        'Si la portada falla, revisar index.html és un bon primer pas.',
        'Reconèixer index.html us ajuda a identificar on comença l’estructura del lloc.'
      );
    }

    if (text.includes('lucide')) {
      items.push(
        'Lucide manté un estil coherent entre les icones del recurs.',
        'Fer servir una mateixa família d’icones ajuda a donar unitat visual al material.',
        'Les icones decoratives convé ocultar-les als lectors de pantalla.'
      );
    }

    if (text.includes('llicència') || text.includes('llicències')) {
      items.push(
        'La llicència indica què podeu permetre quan compartiu un recurs propi.',
        'Abans de reutilitzar un recurs, consulteu les condicions de la llicència.',
        'Fer visible la llicència facilita que altres docents reutilitzin el material amb criteri.'
      );
    }

    if (text.includes('privacitat') || text.includes('rgpd') || text.includes('dades personals')) {
      items.push(
        'Abans d’introduir informació en una eina, comproveu si conté dades personals de l’alumnat.',
        'Aquest criteri us pot ajudar a decidir quina informació convé deixar fora d’un servei extern.',
        'Treballar amb les dades mínimes necessàries simplifica la gestió de la privacitat.'
      );
    }

    if (text.includes('accessibilitat') || text.includes('dua')) {
      items.push(
        'Proveu aquest element amb el teclat: és una comprovació ràpida d’accessibilitat.',
        'El contrast i la mida del text influeixen directament en la facilitat de lectura.',
        'Pensar en diferents maneres d’accedir al recurs ajuda a detectar barreres abans de portar-lo a l’aula.'
      );
    }

    if (text.includes('indicació') || text.includes('prompt')) {
      items.push(
        'Una indicació concreta descriu el canvi que espereu veure al recurs.',
        'Quan la resposta s’allunya del que necessiteu, reformular la indicació pot orientar millor l’eina.',
        'Podeu indicar a la IA quin element voleu modificar i quin resultat espereu.'
      );
    }

    if (text.includes('git') && !text.includes('github pages')) {
      items.push(
        'Git conserva l’historial dels canvis del projecte.',
        'L’historial facilita recuperar una versió anterior si una prova falla.',
        'Desar canvis en versions petites facilita entendre què ha canviat.'
      );
    }

    if (text.includes('repositori')) {
      items.push(
        'Podeu imaginar el repositori com la carpeta principal del projecte a GitHub.',
        'El repositori reuneix els fitxers que formen el recurs publicat.',
        'Revisar el repositori us ajuda a comprovar què esteu compartint públicament.'
      );
    }

    if (text.includes('ia local') || text.includes('model local') || text.includes('models locals')) {
      items.push(
        'En IA local, el model s’executa al mateix ordinador o en un equip sota el vostre control.',
        'La memòria disponible condiciona quins models podreu executar amb comoditat.',
        'Per començar, trieu una tasca concreta i comproveu quin model hi respon millor.'
      );
    }

    if (target.querySelector?.('input, select, textarea, button')) {
      items.push(
        'Proveu aquest control amb la tecla Tab per comprovar si és accessible amb teclat.',
        'Un control entenedor ha de comunicar bé què passarà quan l’activeu.',
        'Una prova breu amb teclat pot descobrir barreres abans que l’activitat arribi a l’alumnat.'
      );
    }

    if (target.querySelector?.('code, pre')) {
      items.push(
        'Quan la IA modifica codi, revisar el resultat després de cada canvi facilita detectar errors.',
        'Podeu demanar una explicació senzilla del fragment abans de continuar editant-lo.',
        'Entendre què fa cada part important del recurs facilita mantenir-lo més endavant.'
      );
    }

    if (target.querySelector?.('a[target="_blank"]')) {
      items.push(
        'Aquest enllaç porta a una font externa que amplia la informació.',
        'Conservar l’enllaç a la font facilita revisar la informació més endavant.',
        'Quan la decisió depèn d’una condició d’ús, la font original és el millor lloc per comprovar-la.'
      );
    }

    if (target.querySelector?.('img') && !target.matches?.('figure')) {
      items.push(
        'Aquesta imatge ajuda a visualitzar el que s’explica en aquest punt.',
        'Fixeu-vos en quin paper té la imatge dins del contingut.',
        'Una imatge útil hauria d’ajudar a comprendre o orientar la lectura.'
      );
    }

    return ensureThree(items, target);
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
    const key = `${location.pathname}::${fingerprintFor(target)}`;
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

    const sanitize = () => {
      const current = bubbleText.textContent || '';
      const cleaned = cleanVisibleText(current);
      if (cleaned !== current) bubbleText.textContent = cleaned;
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
