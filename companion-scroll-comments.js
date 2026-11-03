(() => {
  const READY_DELAY = 6200;
  const MIN_COMMENT_DURATION = 6500;
  const MAX_COMMENT_DURATION = 9500;
  const MIN_REPLACE_GAP = 5200;
  const STORAGE_KEY = 'eines-ia:companion-scroll-comments-v8';

  let readyAt = Date.now() + READY_DELAY;
  let lastTarget = null;
  let hideTimer = null;
  let pendingTimer = null;
  let frame = 0;
  let shownAt = 0;
  let bubble;
  let bubbleText;

  const specificCommentsByPage = {
    'index.html': {
      'Accés al material del taller': [
        'Un codi QR pot contenir una adreça web. Aquí permet obrir el material sense haver d’escriure l’enllaç.',
        'L’adreça curta és pràctica quan el grup ha d’introduir l’enllaç manualment.',
        'Projectar el QR pot agilitzar l’inici d’una activitat quan tothom ha d’arribar al mateix recurs.'
      ],
      'Qüestionari de coneixements previs per a docents': [
        'Aquest qüestionari serveix per orientar el recorregut. No és una prova de coneixements.',
        'Respondre segons el que feu ara ajuda a identificar quins blocs us poden resultar més útils.',
        'El resultat és una proposta de recorregut: podeu començar pel bloc que respongui millor a la vostra necessitat.'
      ],
      'Objectius de la sessió': [
        'Llegir els objectius abans de començar ajuda a entendre per què es proposa cada activitat.',
        'Una pregunta útil és aquesta: quin dels objectius respon millor a una necessitat que ja teniu?',
        'Els objectius us permeten distingir què és una pràctica del taller i què us podeu endur després a l’aula.'
      ]
    },
    'bloc1-marc.html': {
      'Feu créixer una idea en forma de recurs web': [
        'Una web pot començar amb una funció molt petita. Quan funciona, ja teniu una base per fer-la créixer.',
        'Fer una primera versió senzilla ajuda a descobrir què necessiteu abans d’invertir temps en més detalls.',
        'Penseu en una necessitat docent concreta: pot convertir-se en la primera funció del vostre recurs.'
      ],
      "Per què s'ha triat Google Antigravity i GitHub?": [
        'Antigravity treballa sobre els fitxers del projecte. GitHub en conserva una còpia amb l’historial dels canvis.',
        'Entendre què fa cada eina és més útil que memoritzar-ne el nom: així podreu substituir-la si el vostre context canvia.',
        'Aquesta combinació separa la creació del recurs de la seva conservació i publicació.'
      ]
    },
    'bloc2-antigravity.html': {
      'Com funciona Google Antigravity?': [
        'Un agent pot treballar directament amb els fitxers de la carpeta que li autoritzeu.',
        'Quan l’agent modifica un projecte, reviseu els canvis abans de continuar. Així sabreu què ha fet sobre els fitxers.',
        'La diferència respecte d’un xat és pràctica: aquí l’eina pot aplicar els canvis al projecte que teniu a l’ordinador.'
      ],
      'La vostra primera web funcional': [
        'La primera fita és que una funció petita respongui com espereu. El disseny pot venir després.',
        'Una prova curta permet veure si la indicació s’ha entès abans de continuar ampliant el recurs.',
        'Si la primera versió funciona, el pas següent és més fàcil de decidir perquè ja teniu alguna cosa observable.'
      ],
      "Ampliació: descàrrega massiva de documents PDF d'un lloc web a Documents": [
        'Les tasques repetitives són bones candidates per a l’automatització quan el resultat es pot comprovar fàcilment.',
        'Aquest exemple mostra que un agent pot ajudar també amb fitxers, més enllà de crear una pàgina web.',
        'Abans d’automatitzar una descàrrega, comproveu les condicions d’accés i l’ús que fareu dels documents.'
      ],
      "Comparació: Google Antigravity, OpenAI Codex i Claude Code d'Anthropic": [
        'Aquestes eines evolucionen ràpidament. Fixeu-vos en la manera de treballar que ofereixen i en el control que us donen.',
        'Per començar, és útil triar una eina que us permeti veure què canvia abans d’acceptar el resultat.',
        'La comparació serveix per entendre formes de treball diferents; no cal aprendre totes les eines.'
      ]
    },
    'bloc3-github.html': {
      'GitHub explicat per a docents principiants': [
        'Podeu imaginar un repositori com la carpeta del projecte, amb l’afegit que conserva l’historial dels canvis.',
        'GitHub us permet guardar el projecte fora de l’ordinador i compartir-ne una versió amb altres persones.',
        'Si GitHub us resulta nou, quedeu-vos amb aquesta idea: els fitxers del recurs viuen dins d’un repositori.'
      ],
      'Pràctica guiada: del projecte local al primer push': [
        'Push és el nom que rep l’acció d’enviar a GitHub els canvis que teniu al vostre ordinador.',
        'Abans de fer un push, mireu quins fitxers han canviat. Aquesta revisió evita publicar coses que no volíeu compartir.',
        'Quan el push acaba, GitHub conserva aquella versió del projecte i la podeu consultar des del navegador.'
      ],
      'Per què creem el token després del repositori?': [
        'Un token és una credencial temporal amb permisos concrets. Aquí només necessita accés al projecte que esteu pujant.',
        'Limitar els permisos del token redueix què podria fer algú si aquella credencial es compartís per error.',
        'Quan ja no necessiteu el token, revocar-lo tanca aquell accés temporal.'
      ],
      'Per què activem GitHub Pages després de pujar el projecte?': [
        'GitHub Pages converteix els fitxers web del repositori en un lloc que es pot obrir amb una adreça pública.',
        'Primer pugem els fitxers perquè Pages necessita saber quina versió del projecte ha de publicar.',
        'Quan actualitzeu el repositori, GitHub Pages pot publicar també la versió nova del recurs.'
      ],
      'Alternativa opcional: GitHub Desktop': [
        'GitHub Desktop mostra els canvis amb una interfície gràfica i pot facilitar els primers passos amb Git.',
        'Veure els fitxers modificats abans d’enviar-los ajuda a entendre què està passant al projecte.',
        'Si preferiu una interfície visual, GitHub Desktop pot fer més accessible el procés de sincronització.'
      ]
    },
    'bloc4-pages-sites.html': {
      'De Gemini a Google Sites sense copiar codi': [
        'Aquesta via pot ser pràctica si el vostre centre ja treballa habitualment amb Google Workspace.',
        'Gemini pot enviar un artefacte a Google Sites i estalviar el pas de copiar manualment el codi.',
        'Google Sites facilita després l’edició visual del contingut per a persones que no treballen directament amb fitxers web.'
      ],
      "Una comparació des de la pràctica d'aula": [
        'Google Sites prioritza l’edició visual. GitHub Pages dona més control sobre els fitxers que formen el recurs.',
        'Penseu qui haurà de mantenir el material d’aquí a uns mesos: aquesta resposta pot orientar la tria.',
        'La millor opció depèn de com voleu actualitzar el recurs i de qui en serà responsable.'
      ]
    },
    'bloc5-llicencies.html': {
      'Per què cal distingir entre contingut i codi?': [
        'El text d’una activitat i el programa que la fa funcionar són obres diferents i poden tenir llicències diferents.',
        'Aquesta distinció és útil en recursos interactius: el contingut pedagògic pot tenir unes condicions i el codi unes altres.',
        'Separar les dues parts ajuda altres docents a saber què poden reutilitzar del vostre projecte.'
      ],
      'Quina llicència de codi encaixa amb el vostre projecte?': [
        'Podeu començar amb una pregunta senzilla: què voleu permetre a qui reutilitzi el vostre codi?',
        'L’orientador transforma decisions pràctiques en una proposta de llicència de programari.',
        'No cal memoritzar sigles. Entendre què permet cada llicència ja us dona criteri per triar.'
      ],
      'Llicències recomanades per a docents': [
        'Una llicència explica a altres persones què poden fer amb el recurs que compartiu.',
        'Fixeu-vos primer en quin tipus d’obra esteu publicant. Això ajuda a descartar opcions que no hi corresponen.',
        'Fer visible la llicència evita que altres docents hagin d’endevinar com poden reutilitzar el material.'
      ]
    },
    'bloc6-recursos-visuals.html': {
      'Imatges generades amb IA: percepció i criteri pedagògic': [
        'Una bona pregunta abans d’afegir una imatge és: què ajudarà a entendre millor?',
        'La mateixa imatge pot ser útil en una activitat i sobrera en una altra; la funció pedagògica marca la diferència.',
        'La recerca indica que saber que una imatge s’ha generat amb IA pot afectar com es valora. El context també hi influeix.'
      ],
      'Autenticitat percebuda i transparència': [
        'Explicar l’origen d’una imatge pot canviar com l’interpreta qui la veu.',
        'Quan l’origen sintètic és rellevant per al missatge, fer-lo visible ajuda a contextualitzar el material.',
        'A l’aula, la transparència també pot obrir una conversa sobre com es creen els recursos visuals.'
      ],
      'Funció pedagògica abans que decoració': [
        'Una imatge aporta més quan ajuda a explicar una idea o a situar-la en context.',
        'Si podeu explicar en una frase per què hi és, probablement ja teniu identificada la seva funció.',
        'Eliminar elements visuals que distreuen pot facilitar que l’atenció es mantingui en el contingut important.'
      ],
      'Emoji per a senyals breus i informals': [
        'Els emoji poden canviar d’aspecte segons el dispositiu. Per això el text ha de conservar el significat principal.',
        'Un emoji funciona bé com a senyal ràpid quan acompanya una paraula o una instrucció entenedora.',
        'Si el símbol activa una acció important, afegir-hi una etiqueta escrita millora la comprensió.'
      ],
      'Icones SVG per a un sistema visual coherent': [
        'Les icones SVG mantenen la qualitat encara que les feu més grans o més petites.',
        'Fer servir una sola família d’icones ajuda a donar continuïtat visual a tot el material.',
        'Quan una icona representa una acció, el control necessita una etiqueta accessible perquè el significat arribi també als lectors de pantalla.'
      ],
      'Prepareu el contingut abans del disseny': [
        'Una infografia funciona millor quan cada bloc conté una idea que es pot entendre de manera autònoma.',
        'Decidir primer què ha d’aprendre l’alumnat evita que el disseny acabi dirigint el contingut.',
        'Reduir el text abans de maquetar facilita detectar què necessita suport visual.'
      ],
      'Construïu la infografia en HTML': [
        'Treballar primer en HTML manté el text editable mentre encara esteu revisant el contingut.',
        'Les icones Lucide es poden adaptar al tema del lloc sense perdre qualitat.',
        'Si detecteu un error després, modificar l’HTML és més fàcil que tornar a generar tota la imatge.'
      ],
      'Reviseu-la en pantalla': [
        'Abans d’exportar, mireu si el text es llegeix bé i si la jerarquia visual ajuda a seguir les idees.',
        'Provar la infografia en mode fosc pot descobrir problemes de contrast que en mode clar passen desapercebuts.',
        'Una revisió en pantalla permet corregir el contingut mentre encara és editable.'
      ],
      'Exporteu el component a PNG': [
        'L’exportació arriba quan el contingut ja està revisat i la composició funciona.',
        'Demanar una renderització fidel ajuda a conservar exactament el disseny que heu validat.',
        'Un fons transparent facilita reutilitzar la infografia en diapositives o en altres materials digitals.'
      ],
      'Wikimedia Commons': [
        'Wikimedia Commons és útil quan necessiteu imatges amb informació detallada sobre autoria i condicions d’ús.',
        'Cada fitxer pot tenir una llicència diferent. Mireu sempre la fitxa de la imatge concreta.',
        'Per a continguts curriculars, Commons pot ser interessant perquè inclou molts recursos documentals i científics.'
      ],
      'Unsplash (secció gratuïta)': [
        'Unsplash és pràctic per trobar fotografia contemporània, però la seva llicència té condicions pròpies.',
        'Encara que l’atribució no sigui obligatòria, reconèixer l’autoria pot modelar una bona pràctica davant de l’alumnat.',
        'Si una fotografia serà part estable del recurs, guardar-ne una còpia al projecte evita dependre de l’enllaç extern.'
      ],
      'Pexels': [
        'Pexels ofereix fotografies i vídeos amb una llicència pròpia que permet molts usos educatius.',
        'Ús gratuït no vol dir absència de condicions: convé revisar les limitacions de redistribució.',
        'Si reutilitzeu una obra, conservar l’enllaç original us facilita revisar-ne la llicència més endavant.'
      ],
      'Pixabay': [
        'Pixabay permet reutilitzar molts recursos, però també estableix límits sobre alguns usos del contingut sense modificar.',
        'Quan una plataforma diu que un recurs és gratuït, encara convé mirar quines condicions d’ús s’hi apliquen.',
        'Guardar la procedència de la imatge us facilita comprovar les condicions si el material s’actualitza més endavant.'
      ],
      'T - Títol (Title)': [
        'El títol ajuda a identificar l’obra dins d’una atribució.',
        'Si l’obra no té títol, una descripció breu pot servir per identificar-la.',
        'Aquest camp permet saber ràpidament quina imatge o obra s’està citant.'
      ],
      'A - Autoria (Author)': [
        'Indicar l’autoria reconeix qui ha creat l’obra i facilita localitzar-ne altres treballs.',
        'Enllaçar el nom amb el perfil de la persona creadora pot fer la citació més útil.',
        'Fer visible l’autoria també ofereix a l’alumnat un model de respecte per les fonts.'
      ],
      'S - Font (Source)': [
        'La font és l’adreça que permet tornar a la pàgina original de l’obra.',
        'Un enllaç directe facilita comprovar d’on s’ha obtingut la imatge.',
        'Conservar la font és útil quan més endavant voleu revisar les condicions d’ús.'
      ],
      'L - Llicència (License)': [
        'La llicència explica quines condicions s’apliquen quan reutilitzeu una obra.',
        'Enllaçar la llicència permet consultar els termes complets sense carregar el peu de la imatge.',
        'Aquest camp ajuda altres docents a saber què poden fer amb el recurs compartit.'
      ]
    },
    'bloc7-bones-practiques.html': {
      'Consells abans de publicar': [
        'Una revisió breu abans de publicar pot detectar problemes que a l’editor passen desapercebuts.',
        'Proveu el recurs com ho faria una altra persona: aquesta mirada acostuma a descobrir passos poc evidents.',
        'Comparar aquestes pautes amb un material vostre pot convertir la llista en millores concretes.'
      ]
    },
    'bloc8-verificacio.html': {
      'Comprovació ràpida del material': [
        'Una llista de verificació converteix criteris generals en decisions que podeu revisar una per una.',
        'Si un punt us genera dubtes, ja heu localitzat un aspecte concret per revisar abans de compartir el recurs.',
        'Podeu reutilitzar aquesta comprovació com a rutina abans de publicar altres materials digitals.'
      ]
    },
    'bloc9-per-continuar-explorant.html': {
      "Què és la intel·ligència artificial local i per què és rellevant a l'escola?": [
        'En IA local, el model s’executa al mateix dispositiu o en un equip que controla el centre.',
        'Treballar en local pot donar més control sobre on es processen les dades.',
        'La contrapartida és tècnica: la memòria i la potència de l’ordinador condicionen quins models podeu executar.'
      ],
      "Ponència recomanada: Models d'intel·ligència artificial en local, de Jordi Mas": [
        'Aquesta ponència pot ser una bona entrada si voleu veure la IA local aplicada a situacions concretes.',
        'Per començar, penseu primer en una tasca. Després podeu buscar un model que la resolgui amb el vostre maquinari.',
        'No necessiteu entendre tots els models: és més útil observar què fan i quins recursos demanen.'
      ],
      'Recursos en català per treballar amb IA local': [
        'El rendiment en català pot variar força entre models, així que convé provar-los amb exemples propers al vostre ús.',
        'El Projecte Aina ofereix recursos lingüístics oberts pensats per reforçar la presència del català en tecnologies d’IA.',
        'Softcatalà pot ajudar-vos a comparar eines des de la perspectiva d’una persona catalanoparlant.'
      ],
      'Com executar models locals al vostre ordinador': [
        'Les aplicacions d’escriptori fan més accessible la prova de models locals perquè redueixen la configuració manual.',
        'Abans de descarregar un model, mireu quanta memòria té l’ordinador: és una de les dades que més condiciona l’experiència.',
        'Començar amb un model petit permet comprovar si la tasca us funciona abans de descarregar opcions més exigents.'
      ]
    },
    'credits.html': {
      'Autoria i marc institucional': [
        'Indicar qui manté un recurs facilita saber a qui correspon actualitzar-lo o resoldre dubtes.',
        'Afegir el context de creació ajuda a entendre per a quin ús es va preparar el material.',
        'Aquesta secció us pot servir de model quan publiqueu materials formatius propis.'
      ],
      'Projectes i fonts de referència': [
        'Mostrar les fonts de referència permet seguir el fil d’una idea i aprofundir-hi després.',
        'Aquest apartat explica d’on provenen alguns criteris del lloc i facilita comprovar-los.',
        'Quan un recurs evoluciona, conservar les fonts ajuda a revisar si les recomanacions continuen vigents.'
      ],
      'Recursos de tercers i marques': [
        'Documentar els recursos externs ajuda a distingir què és propi del projecte i què prové d’altres autories.',
        'Aquesta informació facilita revisar les condicions d’ús quan una biblioteca o un servei canvia.',
        'En projectes web, una part del material pot dependre de recursos creats per tercers; deixar-ne constància simplifica el manteniment.'
      ],
      'Llicències del projecte': [
        'El contingut pedagògic i el codi poden tenir condicions de reutilització diferents.',
        'Fer visibles les llicències permet que altres docents sàpiguen com poden reutilitzar el projecte.',
        'Aquesta separació pot servir de model si publiqueu un recurs interactiu propi.'
      ]
    }
  };

  const pageFallbacks = {
    'index.html': [
      'Si aquest apartat és nou, pregunteu-vos primer què us permet fer dins del taller.',
      'Relacioneu aquesta part amb una necessitat concreta de la sessió; així serà més fàcil recordar-la.',
      'Podeu tornar a aquest punt més endavant quan necessiteu recuperar-ne la funció.'
    ],
    'bloc1-marc.html': [
      'Penseu en una necessitat docent que ja tingueu i mireu com aquest concepte hi podria encaixar.',
      'Aquí és més important entendre el procés que memoritzar vocabulari tècnic.',
      'Relacionar aquesta idea amb un recurs que ja utilitzeu us pot ajudar a donar-li sentit.'
    ],
    'bloc2-antigravity.html': [
      'Quan proveu un agent, feu un canvi petit i observeu què ha modificat.',
      'Si un terme us resulta nou, busqueu quina acció concreta representa dins del projecte.',
      'Una prova curta us ajuda a entendre l’eina abans de confiar-li canvis més amplis.'
    ],
    'bloc3-github.html': [
      'Si apareix un terme nou, traduïu-lo mentalment a una acció: guardar, enviar o publicar.',
      'Moltes paraules de GitHub semblen tècniques, però descriuen passos que ja coneixeu d’altres eines.',
      'Quan tingueu dubtes, pregunteu-vos on són els fitxers ara i on voleu que acabin.'
    ],
    'bloc4-pages-sites.html': [
      'Penseu qui haurà d’editar aquest material després: aquesta dada pot orientar la plataforma que trieu.',
      'Una eina visual acostuma a facilitar el manteniment compartit; treballar amb fitxers dona més control tècnic.',
      'La pregunta pràctica és com voleu actualitzar el recurs quan el taller ja hagi acabat.'
    ],
    'bloc5-llicencies.html': [
      'Davant d’una llicència, comenceu per preguntar què voleu permetre a qui reutilitzi el material.',
      'Les sigles es poden consultar; entendre les condicions és el que us ajuda a prendre decisions.',
      'Abans de triar, identifiqueu si esteu compartint contingut pedagògic o codi.'
    ],
    'bloc6-recursos-visuals.html': [
      'Pregunteu-vos què ajuda a entendre aquest recurs visual. Aquesta resposta orienta millor que la decoració.',
      'Fer visible l’autoria pot convertir el mateix material en un model de bona pràctica per a l’alumnat.',
      'Quan trieu una imatge, penseu també com la podrà interpretar una persona que no conegui el context.'
    ],
    'bloc7-bones-practiques.html': [
      'Compareu aquesta pauta amb un recurs que ja utilitzeu i busqueu-hi un canvi concret.',
      'Una comprovació petita abans de publicar pot evitar una incidència durant la classe.',
      'Provar el recurs com si fóssiu una persona nova ajuda a descobrir instruccions poc evidents.'
    ],
    'bloc8-verificacio.html': [
      'Una llista de verificació és útil quan cada punt es pot comprovar amb una acció concreta.',
      'Si dubteu en marcar un element, ja heu trobat una part del recurs que mereix una revisió.',
      'Podeu convertir aquesta comprovació en una rutina per als materials que publiqueu més endavant.'
    ],
    'bloc9-per-continuar-explorant.html': [
      'En IA local, la pregunta pràctica és quina tasca voleu resoldre amb el maquinari que teniu.',
      'La memòria disponible condiciona molt l’experiència amb models locals.',
      'Començar amb una prova petita facilita veure si aquest enfocament encaixa amb el vostre centre.'
    ],
    'credits.html': [
      'Uns crèdits ben documentats faciliten saber d’on prové cada recurs i com es pot reutilitzar.',
      'Guardar les fonts ara simplifica molt les actualitzacions futures del material.',
      'Aquest apartat pot servir de model per documentar un projecte propi.'
    ]
  };

  const universalFallbacks = [
    'Si aquest terme és nou, busqueu primer què us permet fer abans d’intentar memoritzar-ne el nom.',
    'Una manera d’entendre aquest punt és relacionar-lo amb una tasca que ja feu a l’aula.',
    'Pregunteu-vos quin problema concret resol aquesta idea; la resposta ajuda a situar-ne la utilitat.'
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
          `Si ${title} us resulta nou, penseu primer què us permet fer en una activitat.`,
          `Podeu relacionar ${title} amb una necessitat concreta del vostre context docent.`,
          `Una pregunta útil aquí és com aplicaríeu ${title} en un recurs que ja coneixeu.`
        ]
      : universalFallbacks;

    return unique([...items, ...fallbacks, ...titleOptions, ...universalFallbacks]).slice(0, 3);
  }

  function commentsFor(target) {
    const explicit = target.getAttribute?.('data-companion-comment');
    if (explicit) {
      return ensureThree([
        explicit,
        'Penseu en quina decisió docent us ajuda a prendre aquesta idea.',
        'Relacionar aquest punt amb un material propi us pot ajudar a recordar-lo.'
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
        'Aquesta imatge està correctament citada: autoria i procedència queden visibles.',
        'Fixeu-vos en el peu: pot servir de model quan citeu imatges en materials propis.',
        'Una citació visible permet que altres persones localitzin l’origen de la imatge.'
      ], target);
    }

    if (target.matches?.('figure')) {
      const image = target.querySelector('img');
      if (image?.alt?.trim()) {
        items.push(
          'Aquesta imatge incorpora text alternatiu. Serveix perquè la informació visual també sigui accessible amb tecnologies d’assistència.',
          'El text alternatiu ha d’explicar allò que aporta la imatge al context, sense convertir-se en una descripció interminable.',
          'Quan una imatge conté informació important, descriure-la ajuda a fer el recurs més accessible.'
        );
      }
      if (target.querySelector('figcaption')) {
        items.push(
          'El peu pot explicar la procedència de la imatge i afegir context sense carregar el text principal.',
          'Fer visible l’origen d’una imatge facilita revisar-ne l’ús quan actualitzeu el material.',
          'Un bon peu pot ajudar a entendre què mostra la imatge i d’on prové.'
        );
      }
    }

    if (target.classList?.contains('home-block-card')) {
      items.push(
        'Aquesta targeta resumeix què trobareu al bloc i us ajuda a decidir si respon a una necessitat actual.',
        'Podeu saltar directament a aquest bloc si és el que més encaixa amb el vostre punt de partida.',
        'Llegir el resum abans d’entrar-hi és una manera ràpida de construir el vostre propi recorregut.'
      );
    }

    if (target.classList?.contains('ordered-step-item')) {
      items.push(
        'Si aquest pas us sembla tècnic, busqueu primer quin resultat visible hauríeu d’obtenir al final.',
        'Fer un pas i comprovar-ne el resultat abans de continuar ajuda a detectar errors aviat.',
        'Penseu en aquest pas com una prova petita: l’objectiu és veure què canvia al projecte.'
      );
    }

    if (target.classList?.contains('vibe-card')) {
      items.push(
        'Una pregunta útil és quin canvi concret aporta aquesta pauta a una activitat vostra.',
        'Compareu aquesta recomanació amb un recurs que ja utilitzeu; així serà més fàcil veure’n la utilitat.',
        'Aquest criteri pot convertir-se en una comprovació breu abans de portar el material a l’aula.'
      );
    }

    if (target.classList?.contains('check-item')) {
      items.push(
        'Si podeu marcar aquest punt amb seguretat, ja heu comprovat una part concreta del recurs.',
        'Un dubte aquí és útil: assenyala exactament què convé revisar abans de publicar.',
        'Aquesta mateixa comprovació es pot reutilitzar en altres materials digitals.'
      );
    }

    if (target.classList?.contains('license-box')) {
      items.push(
        'Fixeu-vos en quin tipus de material regula aquesta llicència: contingut pedagògic o codi.',
        'Una llicència serveix per deixar per escrit què permeteu a qui reutilitzi el vostre treball.',
        'Aquesta distinció evita que altres persones hagin d’endevinar quines condicions s’apliquen.'
      );
    }

    if (target.classList?.contains('conference-visual')) {
      items.push(
        'Aquest esquema transforma una explicació llarga en una relació visual entre idees.',
        'Llegir primer l’esquema pot ajudar-vos a situar el tema abans d’entrar en els detalls.',
        'Aquest tipus de resum visual pot ser útil en formacions quan voleu donar una visió general ràpida.'
      );
    }

    if (target.classList?.contains('table-responsive')) {
      items.push(
        'La taula és útil quan voleu comparar opcions amb el mateix criteri.',
        'Mireu primer la columna que respon a la vostra necessitat; després podeu completar la comparació.',
        'Una taula redueix la càrrega de memòria perquè manté les opcions visibles al mateix temps.'
      );
    }

    if (target.classList?.contains('pedagogical-highlight')) {
      items.push(
        'Aquesta capsa concentra una idea que pot orientar una decisió docent concreta.',
        'Proveu de relacionar aquesta idea amb un material que ja feu servir a l’aula.',
        'Si aquesta recomanació us sembla útil, penseu quin canvi petit podríeu provar en un recurs propi.'
      );
    }

    if (target.classList?.contains('workshop-access-card')) {
      items.push(
        'Aquest accés ràpid està pensat per reduir el temps d’entrada al material durant una sessió.',
        'Una adreça curta o un QR poden ser útils quan tot el grup ha d’arribar al mateix recurs.',
        'Aquest mateix sistema pot funcionar en una activitat d’aula si voleu compartir un recurs sense dictar una URL llarga.'
      );
    }

    if (target.classList?.contains('infographic-prompt-box')) {
      items.push(
        'Aquesta indicació es pot copiar i adaptar al contingut que vulgueu representar.',
        'Conservar l’HTML editable permet corregir el text abans de convertir la infografia en una imatge.',
        'Abans d’exportar, reviseu el contingut com revisaríeu qualsevol material que arribarà a l’alumnat.'
      );
    }

    if (target.classList?.contains('pedagogy-infographic')) {
      items.push(
        'Aquesta infografia continua sent HTML: el text es pot revisar i editar directament.',
        'La jerarquia visual ajuda a separar idees sense convertir-les en una imatge tancada.',
        'Aquest format és pràctic quan voleu revisar el contingut abans de generar una versió final en PNG.'
      );
    }

    if (target.classList?.contains('quiz-question-card')) {
      items.push(
        'Responeu segons la vostra pràctica actual; així el qüestionari pot orientar millor el recorregut.',
        'Aquesta pregunta serveix per situar el punt de partida, no per avaluar-vos.',
        'El qüestionari pot ajudar-vos a prioritzar blocs sense obligar-vos a seguir un ordre únic.'
      );
    }

    if (text.includes('github pages')) {
      items.push(
        'GitHub Pages publica els fitxers web del repositori com un lloc accessible amb una adreça.',
        'Quan actualitzeu el projecte a GitHub, Pages pot publicar també aquella versió nova.',
        'És útil quan voleu conservar el control directe dels fitxers que formen la web.'
      );
    }

    if (text.includes('google sites')) {
      items.push(
        'Google Sites permet editar visualment el recurs sense treballar directament amb els fitxers web.',
        'Pot ser pràctic en centres que ja treballen amb Google Workspace i necessiten edició compartida.',
        'Si diverses persones han de mantenir el material, una interfície visual pot simplificar les actualitzacions.'
      );
    }

    if (text.includes('index.html')) {
      items.push(
        'index.html acostuma a ser el fitxer que s’obre primer quan entreu en un lloc web.',
        'Si la portada d’una web no es carrega, revisar index.html és un bon punt de partida.',
        'Reconèixer aquest nom us ajuda a identificar on comença l’estructura principal del lloc.'
      );
    }

    if (text.includes('lucide')) {
      items.push(
        'Lucide és una biblioteca d’icones vectorials: totes comparteixen un estil visual coherent.',
        'Fer servir una sola família d’icones evita que el material sembli construït amb estils diferents.',
        'Les icones decoratives es poden ocultar als lectors de pantalla perquè no afegeixin soroll.'
      );
    }

    if (text.includes('llicència') || text.includes('llicències')) {
      items.push(
        'La llicència explica què es pot fer amb un recurs quan una altra persona el reutilitza.',
        'Abans de reutilitzar una obra, mireu les condicions de la llicència concreta.',
        'Fer visible la llicència facilita que altres docents reutilitzin el material amb criteri.'
      );
    }

    if (text.includes('privacitat') || text.includes('rgpd') || text.includes('dades personals')) {
      items.push(
        'Abans d’introduir informació en una eina, pregunteu-vos si conté dades personals de l’alumnat.',
        'Treballar només amb les dades necessàries redueix el risc quan feu servir serveis externs.',
        'Si una activitat funciona amb dades fictícies, aquesta opció pot simplificar molt la protecció de la privacitat.'
      );
    }

    if (text.includes('accessibilitat') || text.includes('dua')) {
      items.push(
        'Provar el recurs amb la tecla Tab és una manera ràpida de comprovar si es pot navegar sense ratolí.',
        'El contrast i la mida del text poden convertir un recurs entenedor en un recurs difícil de llegir.',
        'Pensar en diferents maneres d’accedir al material ajuda a detectar barreres abans de portar-lo a l’aula.'
      );
    }

    if (text.includes('indicació') || text.includes('prompt')) {
      items.push(
        'Una indicació concreta explica què voleu canviar i quin resultat espereu veure.',
        'Si la resposta s’allunya del que necessiteu, afegir context acostuma a orientar millor l’eina.',
        'Podeu descriure el canvi amb paraules docents: no cal conèixer vocabulari de programació per començar.'
      );
    }

    if (text.includes('git') && !text.includes('github pages')) {
      items.push(
        'Git guarda un historial dels canvis del projecte, semblant a tenir punts de recuperació.',
        'Treballar amb canvis petits facilita saber què ha provocat un problema si alguna cosa deixa de funcionar.',
        'L’historial permet tornar a una versió anterior quan una prova no dona el resultat esperat.'
      );
    }

    if (text.includes('repositori')) {
      items.push(
        'Podeu pensar en el repositori com la carpeta principal del projecte a GitHub.',
        'El repositori reuneix els fitxers que després poden formar el recurs publicat.',
        'Mirar el repositori us permet comprovar què esteu compartint públicament.'
      );
    }

    if (text.includes('ia local') || text.includes('model local') || text.includes('models locals')) {
      items.push(
        'En IA local, el model s’executa al vostre ordinador o en un equip que controleu.',
        'La memòria de l’ordinador és una de les dades que més condiciona quins models podreu utilitzar.',
        'Per començar, és més fàcil triar una tasca concreta i provar un model petit.'
      );
    }

    if (target.querySelector?.('input, select, textarea, button')) {
      items.push(
        'Proveu aquest control amb la tecla Tab: és una comprovació senzilla d’accessibilitat.',
        'Un control entenedor ha de deixar clar què passarà quan l’activeu.',
        'Fer una prova amb teclat pot revelar barreres que amb el ratolí passen desapercebudes.'
      );
    }

    if (target.querySelector?.('code, pre')) {
      items.push(
        'Quan la IA modifica codi, revisar el resultat després de cada canvi ajuda a detectar errors.',
        'Podeu demanar a la IA que expliqui amb llenguatge planer què fa aquest fragment abans de modificar-lo.',
        'Entendre la funció de les parts importants facilita mantenir el recurs quan torni a caldre actualitzar-lo.'
      );
    }

    if (target.querySelector?.('a[target="_blank"]')) {
      items.push(
        'Aquest enllaç obre una font externa que amplia la informació.',
        'Conservar l’enllaç original facilita comprovar la informació quan el material s’actualitza.',
        'Si una decisió depèn d’una condició d’ús, la font original és el lloc més segur per revisar-la.'
      );
    }

    if (target.querySelector?.('img') && !target.matches?.('figure')) {
      items.push(
        'Fixeu-vos en què aporta aquesta imatge al contingut que l’envolta.',
        'Una imatge útil acostuma a explicar una idea o a orientar la lectura.',
        'Si la imatge desaparegués, pregunteu-vos quina informació trobaríeu a faltar: això revela la seva funció.'
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

  function durationFor(text) {
    const words = cleanVisibleText(text).split(/\s+/).filter(Boolean).length;
    return Math.min(MAX_COMMENT_DURATION, Math.max(MIN_COMMENT_DURATION, 4300 + words * 170));
  }

  function hideCommentAfter(duration) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      bubble.classList.remove('is-visible');
      setTimeout(() => {
        if (!bubble.classList.contains('is-visible')) bubble.hidden = true;
      }, 180);
    }, duration);
  }

  function showComment(target) {
    if (!bubble || !bubbleText || !target) return;
    const comments = commentsFor(target);
    const key = `${location.pathname}::${fingerprintFor(target)}`;
    const text = choose(key, comments);
    if (!text) return;

    clearTimeout(pendingTimer);
    pendingTimer = null;
    bubbleText.textContent = text;
    bubble.hidden = false;
    bubble.classList.remove('is-visible');

    requestAnimationFrame(() => {
      bubble.classList.add('is-visible');
      window.dispatchEvent(new Event('scroll'));
    });

    shownAt = Date.now();
    lastTarget = target;
    hideCommentAfter(durationFor(text));
  }

  function queueLatestTarget(delay) {
    if (pendingTimer) return;
    pendingTimer = setTimeout(() => {
      pendingTimer = null;
      evaluate();
    }, Math.max(120, delay));
  }

  function evaluate({ force = false } = {}) {
    if (Date.now() < readyAt) return;

    const companion = document.getElementById('reading-companion');
    if (!companion || companion.hidden) return;

    const target = activeCandidate();
    if (!target) return;
    if (!force && target === lastTarget) return;

    const elapsed = Date.now() - shownAt;
    if (!force && shownAt && elapsed < MIN_REPLACE_GAP) {
      queueLatestTarget(MIN_REPLACE_GAP - elapsed);
      return;
    }

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
