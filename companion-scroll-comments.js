(() => {
  const READY_DELAY = 6200;
  const MIN_COMMENT_DURATION = 6500;
  const MAX_COMMENT_DURATION = 9500;
  const MIN_REPLACE_GAP = 5200;

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


  // Notes editorialment vinculades a títols de secció, eines i passos concrets.
  // Quan no hi ha una nota pertinent, l'acompanyant resta en silenci.
  const contextualComments = {
  "index.html": {
    "Accés al material del taller": [
      "El QR i l’adreça curta obren el mateix material. És una bona manera d’oferir dues vies d’accés durant una formació.",
      "Una curiositat: el QR codifica l’adreça web. Si canvia l’adreça de destinació, cal revisar també el codi que es projecta."
    ],
    "Qüestionari de coneixements previs per a docents": [
      "Les respostes es desen al navegador. Si canvieu de dispositiu, el qüestionari no recuperarà automàticament la vostra selecció.",
      "La diagnosi orienta cap als blocs que us poden ser més útils. Podeu consultar qualsevol bloc encara que no us el recomani."
    ],
    "Creació de recursos web i ús de la intel·ligència artificial": [
      "Crear un exercici interactiu també implica decidir què passa quan l’alumnat s’equivoca. La retroacció forma part del disseny pedagògic.",
      "Una pregunta per a aquesta diagnosi: ja heu demanat alguna vegada a una IA que modifiqui una pàgina que havíeu creat?"
    ],
    "Google Antigravity i eines al dispositiu docent": [
      "Un agent de programació pot treballar sobre una carpeta concreta. Saber quina carpeta té oberta és tan important com redactar la indicació.",
      "El mateix recurs pot passar per diverses revisions sense començar de zero: l’agent modifica els fitxers existents."
    ],
    "GitHub com a repositori educatiu": [
      "GitHub desa versions del projecte. Aquesta història de canvis pot ser molt útil quan cal recuperar una activitat que funcionava.",
      "El repositori conté els fitxers; GitHub Pages els pot convertir en una web pública. Són funcions diferents."
    ],
    "Estructura web: el fitxer index.html i les rutes relatives": [
      "El nom index.html té una funció particular: acostuma a ser el document que el servidor obre per defecte dins d’una carpeta.",
      "Una ruta relativa com images/foto.png depèn del lloc on és el fitxer HTML. Això explica molts errors d’imatges en publicar una web."
    ],
    "Llicències de continguts (Creative Commons) i de codi (MIT)": [
      "La mateixa web pot necessitar dues llicències: una per als materials educatius i una altra per al programari que els fa funcionar.",
      "Creative Commons ofereix opcions per a obres creatives; MIT és una llicència de programari. La distinció ajuda a compartir amb criteri."
    ],
    "Protecció de dades i IA local": [
      "Un model local pot executar les consultes al dispositiu, però l’aplicació encara pot utilitzar Internet per descarregar models o actualitzacions.",
      "Quan valoreu una eina local per al centre, mireu també on es desen les converses i qui pot accedir al dispositiu."
    ],
    "Marc: de consultar a crear": [
      "En aquest bloc es passa d’obtenir respostes a construir recursos que es poden provar i revisar. Penseu en una activitat que voldríeu transformar.",
      "Un recurs HTML senzill pot funcionar directament al navegador. Aquesta és una de les raons per començar per projectes web petits."
    ],
    "Google Antigravity pas a pas": [
      "L’agent pot modificar fitxers; la revisió del que ha canviat continua sent una decisió docent.",
      "Per a la primera prova, una activitat amb un resultat observable facilita valorar si la indicació s’ha interpretat bé."
    ],
    "Configuració de GitHub": [
      "Un commit registra un estat del projecte; un push envia els commits locals al repositori remot.",
      "El token de la pràctica pot restringir-se a un sol repositori. Així l’autorització és proporcional a la tasca."
    ],
    "Pages en comparació amb Google Sites": [
      "Google Sites permet editar visualment. GitHub Pages publica fitxers web: aquesta diferència condiciona com podreu mantenir el material.",
      "Abans de triar plataforma, penseu qui actualitzarà el recurs quan l’hagi d’utilitzar un altre docent."
    ],
    "Llicències i codi obert": [
      "Compartir el codi fa possible adaptar la lògica de l’activitat, com el sistema de puntuació o la retroacció.",
      "Una llicència visible resol una pregunta important per a qui reutilitza el recurs: quines modificacions estan permeses?"
    ],
    "Recursos visuals i citació": [
      "El text alternatiu descriu la funció informativa d’una imatge per a qui no la pot veure.",
      "En una citació TASL, la S és la font: l’enllaç a l’obra original facilita comprovar’n les condicions."
    ],
    "Bones pràctiques a l'aula": [
      "Penseu en la primera persona que provarà el recurs: podrà completar l’activitat sense la vostra ajuda?",
      "Una bona prova d’aula inclou també què passa quan una resposta és incorrecta o quan falla una connexió."
    ],
    "Llista de verificació": [
      "La llista combina decisions pedagògiques amb comprovacions tècniques. Cada casella hauria de correspondre a una prova feta.",
      "Podeu conservar aquesta llista com a rutina de publicació per als recursos que creeu més endavant."
    ],
    "Per continuar explorant: IA local": [
      "El català també és un criteri de selecció de models: un model gran no és necessàriament el que millor respon en aquesta llengua.",
      "El funcionament fora de línia depèn tant del model triat com dels serveis que activa l’aplicació."
    ]
  },
  "bloc1-marc.html": {
    "D'una resposta a un projecte": [
      "Una resposta d’IA desapareix entre converses; un fitxer HTML conserva una versió que podeu obrir i seguir modificant.",
      "Quan una activitat es converteix en una web, podeu provar el seu comportament com ho faria l’alumnat."
    ],
    "Entendre el recurs sense escriure'l tot a mà": [
      "Saber localitzar on hi ha el text, l’estil i les interaccions us ajuda a demanar canvis amb més precisió.",
      "Una pregunta pràctica per a qualsevol web: què passa si un enllaç o un botó no funciona?"
    ],
    "Google Antigravity": [
      "Antigravity treballa amb els fitxers del projecte. Un canvi a l’HTML modifica el recurs que després obriu al navegador.",
      "L’accés a la carpeta és una autorització important: reviseu quin projecte esteu posant a disposició de l’agent."
    ],
    "GitHub": [
      "GitHub pot conservar el codi de l’activitat i l’historial de versions. GitHub Pages s’encarrega de fer visible la web.",
      "Una curiositat: un recurs pot tenir una adreça pública de Pages i, alhora, una altra adreça per consultar-ne el codi."
    ]
  },
  "bloc2-antigravity.html": {
    "Instal·lació de l'aplicació al dispositiu": [
      "En un ordinador administrat pel centre, els permisos d’instal·lació poden determinar si aquesta pràctica és viable.",
      "Després d’instal·lar Antigravity, fixeu-vos en la carpeta que obre: és l’espai on llegirà i modificarà els fitxers."
    ],
    "La carpeta de treball (workspace)": [
      "Workspace vol dir espai de treball. Si obriu només la carpeta del projecte, delimiteu quins fitxers pot consultar l’agent.",
      "Una carpeta ben delimitada també fa més fàcil detectar quins fitxers ha creat o modificat l’eina."
    ],
    "Tria del model d'intel·ligència artificial": [
      "Els models disponibles poden variar segons el compte i el servei. El criteri és comprovar quin resol la tasca que teniu.",
      "Per comparar models, proveu la mateixa indicació amb el mateix fitxer inicial: així podreu observar diferències."
    ],
    "Com demanar recursos a l’agent: criteris docents": [
      "Incloure el nivell educatiu i el tipus de retroacció que voleu canvia molt el resultat d’una activitat generada.",
      "Una indicació útil descriu què ha de poder fer l’alumnat amb el recurs, més enllà del seu aspecte visual."
    ],
    "Opcions de configuració recomanades per a docents que no l'han obert mai": [
      "Les opcions de revisió indiquen quan l’agent demana permís abans d’actuar. Afecten directament el control que manteniu.",
      "Reviseu aquestes opcions sobretot si treballeu en una carpeta on ja teniu materials que voleu conservar."
    ],
    "Plan Review Policy (Política de revisió del pla)": [
      "La revisió del pla permet veure les accions que l’agent preveu fer abans que modifiqui el projecte.",
      "És una oportunitat per detectar una interpretació equivocada de la indicació abans d’haver de desfer canvis."
    ],
    "Permisos a Windows - configuració recomanada": [
      "Els permisos de l’eina són independents dels permisos del vostre usuari de Windows. Les restriccions del centre continuen vigents.",
      "Si un agent demana executar una ordre, llegiu què farà i a quina carpeta afectarà abans d’autoritzar-la."
    ],
    "Model Selection & Thinking (Model i raonament)": [
      "La configuració de raonament pot canviar el temps i els recursos que dedica el model a una tasca.",
      "Una activitat senzilla és una bona prova per observar si necessiteu una configuració més exigent."
    ],
    "Artifacts & Browser Preview (Previsualització en viu)": [
      "La vista prèvia permet detectar errors de mida, alineació o interacció abans de publicar.",
      "Obriu també la web fora de la vista prèvia: us ajudarà a comprovar que funciona com un recurs independent."
    ],
    "Assistent per redactar la vostra primera indicació": [
      "Aquest assistent estructura la petició. La decisió important és descriure què hauria de fer l’alumnat quan utilitzi la web.",
      "Després de copiar la indicació, podeu ajustar les instruccions sobre nivell de dificultat o retroacció."
    ],
    "Creeu un microrecurs": [
      "Un microrecurs dona un resultat que podeu provar ràpidament, com una pregunta amb retroacció immediata.",
      "Abans d’ampliar-lo, comproveu què passa amb una resposta encertada i amb una d’equivocada."
    ],
    "Indicació per començar": [
      "Si demaneu una activitat interactiva, detalleu també què passarà després que l’alumnat respongui.",
      "Una indicació curta amb un resultat esperat verificable pot ser més útil que una petició extensa i ambigua."
    ],
    "Comproveu que funciona": [
      "Proveu els botons com ho faria l’alumnat. Una web pot semblar acabada i tenir interaccions que no responen.",
      "Una prova útil és recarregar la pàgina i comprovar si l’activitat conserva el comportament esperat."
    ],
    "Demaneu una sola millora": [
      "Modificar una cosa cada vegada facilita atribuir un error al canvi que l’ha provocat.",
      "Podeu demanar una millora pedagògica concreta, com variar la retroacció després de cada resposta."
    ],
    "Mireu què ha creat l'agent": [
      "Busqueu el fitxer HTML principal i observeu com es relaciona amb els estils i els scripts.",
      "Si més endavant canvieu d’eina, entendre aquesta estructura us ajudarà a continuar treballant sobre el mateix projecte."
    ],
    "Bons hàbits mentre treballeu amb l'agent": [
      "Una versió que ja funciona és un bon punt de recuperació abans d’experimentar amb canvis més amplis.",
      "Reviseu el recurs amb el teclat: alguns errors d’interacció passen desapercebuts quan només s’utilitza el ratolí."
    ],
    "Trieu la pàgina web d'origen i la carpeta de destinació": [
      "La carpeta de destinació és part de la indicació. Així podeu comprovar on han anat a parar els PDF descarregats.",
      "Abans de descarregar en massa, verifiqueu que la pàgina permet l’accés als documents que voleu utilitzar."
    ],
    "Envieu la indicació a l'assistent de Google Antigravity": [
      "Aquí l’agent ha d’identificar enllaços a PDF i desar els fitxers. És una tasca diferent de crear una pàgina web.",
      "Demaneu que mantingui noms de fitxer comprensibles; després serà més fàcil localitzar cada document."
    ],
    "Reviseu el pla i comproveu la carpeta al vostre ordinador": [
      "Compareu el nombre d’enllaços detectats amb el nombre de PDF desats. És una comprovació concreta del resultat.",
      "Si hi ha fitxers repetits, demaneu a l’agent que expliqui com els identifica abans d’eliminar-los."
    ],
    "Pàgines d'accés obert": [
      "L’accés públic a una pàgina no implica permís per redistribuir els PDF que conté.",
      "Conservar l’enllaç original de cada document ajuda a revisar-ne l’autoria i les condicions d’ús."
    ],
    "Carpeta neta i sense duplicats": [
      "Dos PDF poden tenir noms diferents i ser el mateix document. El nom del fitxer és només una pista.",
      "Una comprovació de duplicats pot comparar el contingut dels fitxers quan cal una identificació més fiable."
    ],
    "Per què s'ha triat Google Antigravity per a aquesta formació?": [
      "El taller parteix d’una interfície que permet veure el projecte mentre s’hi apliquen canvis.",
      "Aquest criteri és pedagògic: facilita observar el procés i discutir el resultat amb altres docents."
    ],
    "I si ja es fa servir Codex o Claude Code?": [
      "Els projectes web són portables: podeu continuar editant els mateixos fitxers HTML amb altres eines compatibles.",
      "Compareu sobretot com cada agent mostra els canvis i demana autorització abans d’aplicar-los."
    ]
  },
  "bloc3-github.html": {
    "El repositori (repo)": [
      "Un repositori és la carpeta del projecte amb un historial de canvis. La web publicada pot mostrar-ne només el resultat.",
      "Fixeu-vos en la diferència entre l’enllaç al repositori i l’enllaç a la pàgina web."
    ],
    "Pujada i versions": [
      "Commit i push són accions diferents: el primer registra una versió i el segon envia els canvis al repositori remot.",
      "Un missatge de commit com «Afegeix retroacció a les preguntes» ajuda a trobar un canvi mesos després."
    ],
    "Token temporal i restringit": [
      "Un token funciona com una credencial amb permisos definits. El de la pràctica només necessita accés al repositori escollit.",
      "Una data de caducitat breu limita el temps durant el qual la credencial continua sent vàlida."
    ],
    "Abans de publicar un repositori públic": [
      "Un repositori públic mostra el codi i els fitxers que hi heu pujat. Reviseu-lo per detectar dades que havien de quedar privades.",
      "Esborrar un secret en un commit posterior no el fa desaparèixer necessàriament de l’historial."
    ],
    "Creeu un repositori buit a GitHub": [
      "Crear primer el repositori permet restringir el token exactament a aquest projecte.",
      "Un nom curt i descriptiu ajuda a identificar l’adreça que després tindrà el repositori."
    ],
    "Copieu l'adreça HTTPS del repositori": [
      "L’adreça HTTPS identifica el repositori remot. L’agent la necessita per saber on enviarà el projecte.",
      "Comproveu que l’adreça pertany al compte i al repositori que acabeu de crear."
    ],
    "Torneu a la mateixa carpeta a Antigravity": [
      "Si obriu una altra carpeta, podeu acabar publicant un projecte diferent. Aquí és útil revisar la ruta del workspace.",
      "Conservar la mateixa carpeta també manté a mà els fitxers que ja heu provat al navegador."
    ],
    "Creeu un token temporal per a aquest repositori": [
      "Els fine-grained tokens de GitHub permeten seleccionar repositoris concrets i permisos limitats.",
      "Revocar el token al final de la pràctica evita mantenir una credencial de publicació que ja no utilitzeu."
    ],
    "Demaneu a Antigravity que connecti el projecte": [
      "L’agent ha de vincular la carpeta local amb el repositori remot. Comproveu el nom del repositori abans d’autoritzar la pujada.",
      "Podeu demanar que us mostri quins fitxers inclourà la primera pujada."
    ],
    "Reviseu què s'enviarà abans d'aprovar-ho": [
      "Aquesta és la revisió més important abans del primer push: el repositori pot ser públic.",
      "Busqueu dades personals, credencials o fitxers temporals que no formen part del recurs docent."
    ],
    "Comproveu la pujada i revoqueu el token": [
      "Obriu el repositori al navegador per comprovar que hi són els fitxers esperats.",
      "Després de revocar el token, la web publicada continua accessible; el que es tanca és aquella credencial d’accés."
    ],
    "Per què utilitzem un token temporal?": [
      "Un token temporal redueix la finestra d’exposició d’una credencial que dona permisos d’escriptura.",
      "Un únic repositori i els permisos estrictament necessaris són una configuració fàcil de justificar."
    ],
    "Obriu Fine-grained tokens": [
      "Fine-grained vol dir que la credencial pot tenir un abast més concret que un token general.",
      "La configuració del token determina què podrà fer l’agent amb GitHub."
    ],
    "Limiteu-lo al repositori de la pràctica": [
      "Aquesta selecció evita autoritzar accidentalment altres projectes del mateix compte.",
      "Reviseu el nom del repositori a la pantalla de permisos abans de generar el token."
    ],
    "Doneu només el permís necessari": [
      "Per pujar fitxers, el permís de continguts amb escriptura és el que cal revisar.",
      "Els permisos administratius no formen part de la tasca de publicar els fitxers d’aquesta pràctica."
    ],
    "Utilitzeu-lo només per a aquesta pujada": [
      "Un token és una credencial; si l’enganxeu en un fitxer públic, també l’exposeu a terceres persones.",
      "Després de la pujada, podeu comprovar el resultat directament al repositori."
    ],
    "Revoqueu-lo en acabar": [
      "La revocació impedeix tornar a autenticar-se amb aquella credencial.",
      "La publicació del projecte es manté; només cal generar una altra credencial si més endavant voleu fer una operació que la requereixi."
    ],
    "Entreu a Settings del repositori": [
      "Pages es configura dins del repositori. Activar-lo aquí associa la web pública amb aquest projecte concret.",
      "Podeu consultar l’estat de la publicació des de la configuració del mateix repositori."
    ],
    "Feu clic a Pages": [
      "GitHub Pages serveix fitxers HTML estàtics. Un exercici amb JavaScript al navegador pot funcionar-hi sense servidor propi.",
      "Una funció que necessiti guardar informació al servidor requeriria una arquitectura diferent."
    ],
    "Trieu la branca principal i premeu Save": [
      "La branca seleccionada indica a Pages d’on ha de llegir els fitxers publicats.",
      "Després d’un push, la nova versió pot necessitar un breu procés de desplegament abans d’aparèixer a la web."
    ],
    "Veieu un 404?": [
      "En una pàgina de projecte, l’adreça acostuma a incloure el nom del repositori. Ometre’l pot donar un error 404.",
      "També convé comprovar que hi ha un fitxer index.html a la ubicació publicada."
    ],
    "1. La pàgina principal d'usuari (User site)": [
      "Una pàgina d’usuari s’associa a un repositori amb el patró usuari.github.io.",
      "És una adreça diferent de les pàgines de projecte, que afegeixen el nom del repositori."
    ],
    "2. Les pàgines de projecte (Project sites)": [
      "La ruta de projecte inclou el nom del repositori; per això les rutes relatives són tan importants.",
      "Una imatge que funciona en local pot fallar a Pages si la ruta comença al directori arrel equivocat."
    ],
    "1. El fitxer principal s'ha de dir `index.html`": [
      "index.html és el document d’entrada habitual quan visiteu una carpeta d’una web estàtica.",
      "Les majúscules importen en alguns entorns: Index.html i index.html poden ser fitxers diferents."
    ],
    "2. Les rutes han de ser relatives": [
      "Una ruta com ./imatges/foto.png es resol a partir de la ubicació del document actual.",
      "Les rutes que comencen amb / apunten a l’arrel del domini i poden fallar dins d’un projecte de GitHub Pages."
    ],
    "3. El repositori ha de ser públic": [
      "Aquesta pràctica planteja un repositori públic perquè el codi sigui consultable i reutilitzable.",
      "Abans de fer-lo públic, confirmeu que no conté fitxers amb dades de l’alumnat."
    ],
    "Quan fer servir GitHub (web)?": [
      "Al web de GitHub podeu revisar commits, gestionar el repositori i consultar els fitxers des de qualsevol navegador.",
      "També és el lloc on configureu la publicació amb GitHub Pages."
    ],
    "Quan fer servir GitHub Desktop?": [
      "GitHub Desktop permet revisar els fitxers modificats i preparar commits des d’una interfície gràfica.",
      "La finestra de canvis és útil per veure què s’ha modificat abans d’enviar-ho al repositori."
    ]
  },
  "bloc4-pages-sites.html": {
    "Google Gemini": [
      "Aquí Gemini genera l’artefacte web. És útil comprovar les interaccions abans d’enviar-lo al lloc on es publicarà.",
      "Un artefacte pot mostrar-se correctament dins de l’editor i necessitar alguna revisió en el lloc final."
    ],
    "Google Sites": [
      "Google Sites facilita el manteniment visual del material, una característica útil quan hi han de col·laborar diversos docents.",
      "Les opcions d’edició de Sites són diferents de les d’un projecte amb fitxers HTML propis."
    ],
    "Quan té sentit fer servir cadascuna?": [
      "La pregunta que marca la diferència és qui editarà el recurs quan ja estigui en ús al centre.",
      "GitHub Pages afavoreix el control del codi; Sites facilita l’edició des de la interfície visual."
    ],
    "Feu servir Google Sites quan...": [
      "Sites pot encaixar en materials que diverses persones han de revisar des del navegador.",
      "Comproveu quines possibilitats d’interacció necessiteu abans de triar una plataforma visual."
    ],
    "Feu servir GitHub Pages amb IA quan...": [
      "Pages permet publicar el JavaScript que dona comportament a una activitat interactiva.",
      "Tenir els fitxers al repositori facilita portar el projecte a un altre allotjament si més endavant ho necessiteu."
    ]
  },
  "bloc5-llicencies.html": {
    "Contingut pedagògic": [
      "Les instruccions d’una activitat i els textos explicatius formen part del contingut que pot tenir llicència Creative Commons.",
      "Penseu en una fitxa que un altre docent voldria adaptar: la llicència li indica les condicions."
    ],
    "Codi font": [
      "El codi controla comportaments com la correcció de respostes o la navegació d’una activitat.",
      "Una llicència de programari regula com es pot copiar i modificar aquesta part del projecte."
    ],
    "Per què no una sola llicència?": [
      "Les llicències de continguts i les de programari estan pensades per a tipus d’obra diferents.",
      "Una web educativa pot combinar-les i documentar cada part al repositori."
    ],
    "I el que no heu creat vosaltres?": [
      "Que un recurs sigui gratuït no significa que es pugui redistribuir lliurement. Consulteu-ne la llicència d’origen.",
      "Logotips i marques poden tenir condicions diferents de les del text pedagògic del vostre projecte."
    ],
    "Com queda en aquest projecte?": [
      "Aquest lloc documenta per separat la llicència del contingut i la del codi. Podeu utilitzar-lo com a exemple de declaració.",
      "Llegiu també els avisos de tercers: una biblioteca d’icones pot conservar la seva pròpia llicència."
    ],
    "Model de declaració per a un recurs web": [
      "Incloure la llicència al repositori i al peu de pàgina ajuda a localitzar-la des de qualsevol de les dues entrades.",
      "Si feu servir imatges de tercers, la seva atribució s’ha de mantenir encara que el projecte tingui una llicència general."
    ],
    "Per a continguts": [
      "En CC BY s’exigeix reconèixer l’autoria. En CC BY-SA, les adaptacions han de compartir-se sota la mateixa llicència o una de compatible.",
      "Trieu segons com voleu que circulin les adaptacions dels vostres materials pedagògics."
    ],
    "Per al codi": [
      "MIT és una llicència permissiva; GPL inclou obligacions de compartir el codi derivat quan es distribueix programari en determinades condicions.",
      "Podeu tenir codi obert amb models de reutilització diferents: la paraula «obert» no descriu totes les obligacions."
    ]
  },
  "bloc6-recursos-visuals.html": {
    "Emoji i icones vectorials: quan convé utilitzar-los": [
      "Els emoji es dibuixen segons el sistema operatiu; una icona SVG del projecte manté una forma més estable.",
      "Per a un botó important, el text accessible continua sent necessari encara que la icona sigui familiar."
    ],
    "Infografies pedagògiques amb HTML i icones": [
      "Construir una infografia en HTML permet corregir el text abans d’exportar-la com a imatge.",
      "Les icones Lucide són SVG: es poden escalar sense perdre nitidesa."
    ],
    "Com verificar una resposta d'IA": [
      "Aquesta mostra visualitza un procediment de verificació. Observeu si cada pas indica una acció que es pot comprovar.",
      "Una infografia pedagògica és més útil quan el text continua sent comprensible sense dependre només de les icones."
    ],
    "Model d'indicació per crear l'HTML": [
      "Podeu demanar a la IA que conservi el text literal mentre modifica només la composició visual.",
      "Aquest és un bon lloc per especificar que la infografia s’ha de llegir en mode clar i fosc."
    ],
    "Model d'indicació després de revisar el contingut": [
      "La conversió a PNG arriba després de revisar el text; així s’evita fixar errors dins d’una imatge.",
      "Un PNG transparent es pot reutilitzar en diapositives, però reviseu el contrast amb el fons de destinació."
    ],
    "Bancs d'imatges reals creades per persones": [
      "La disponibilitat d’una fotografia no determina automàticament si en podeu fer una adaptació.",
      "Una fitxa d’imatge amb autoria i llicència us estalvia haver de reconstruir-ne la procedència més endavant."
    ],
    "Com atribuir una imatge: el mètode TASL": [
      "TASL resumeix Títol, Autoria, Font i Llicència. Serveix com a recordatori per revisar una atribució.",
      "La font és especialment útil quan algú vol consultar els termes originals de reutilització."
    ],
    "Exemple visual d'una atribució completa": [
      "Una atribució ben enllaçada permet arribar fins a l’obra original i a les condicions d’ús.",
      "Podeu copiar l’estructura d’aquesta citació i substituir-la per les dades de la imatge que utilitzeu."
    ]
  },
  "bloc7-bones-practiques.html": {
    "Revisar el contingut sense delegar-lo a la IA": [
      "Un qüestionari pot tenir una resposta marcada com a correcta i, tanmateix, contenir un error conceptual. Proveu-lo com a docent.",
      "La comprovació també inclou la retroacció que rebrà l’alumnat després d’una resposta incorrecta."
    ],
    "No enviar dades personals de l'alumnat": [
      "Podeu provar un recurs amb dades fictícies abans de valorar-ne l’ús amb informació del centre.",
      "Un camp de nom o correu pot ser innecessari si l’activitat funciona directament al navegador."
    ],
    "Entendre què fa el material": [
      "Demaneu una explicació dels fitxers principals i de què passa en clicar cada botó. Això facilita el manteniment.",
      "Si una activitat calcula una puntuació, convé saber on és aquesta regla al codi."
    ],
    "Decidir quins recursos convé desar en local": [
      "Una biblioteca carregada des d’un servidor extern pot impedir que una activitat funcioni sense connexió.",
      "Desar els recursos essencials al projecte és útil quan la llicència permet la redistribució."
    ],
    "Separar accessibilitat web i DUA": [
      "L’accessibilitat web permet comprovar aspectes com l’ús del teclat. El DUA orienta el disseny de l’experiència d’aprenentatge.",
      "Un recurs pot complir requisits tècnics i encara necessitar més bastides pedagògiques per a l’alumnat."
    ],
    "Citar l'autoria del que es pren d'altres persones": [
      "Una citació també pot convertir-se en una oportunitat per ensenyar com seguir la pista d’una font original.",
      "En una fotografia, anoteu l’enllaç a l’obra concreta: la portada del banc d’imatges acostuma a ser insuficient."
    ],
    "Guardar el rastre de com es va fer": [
      "El README pot explicar per què vau triar una activitat o un format. Aquesta informació és valuosa per al docent que la reutilitzarà.",
      "Guardar decisions del procés evita haver de reconstruir-les quan toqueu el recurs el curs següent."
    ],
    "Declarar l'ús d'IA i el que s'ha comprovat": [
      "Una declaració concreta pot indicar què ha generat la IA i quina revisió docent s’ha fet.",
      "La transparència ajuda altres persones a interpretar millor el procés de creació del material."
    ],
    "Publicar amb una llicència lliure a la vista": [
      "Fer visible la llicència al peu de la web facilita trobar les condicions de reutilització.",
      "Si el projecte conté codi i materials pedagògics, comproveu que cada part tingui documentada la seva llicència."
    ],
    "Oferir el codi perquè altres persones l'adaptin": [
      "Compartir el repositori facilita que un altre docent canviï exemples o afegeixi activitats sense reconstruir tota la web.",
      "Una URL de Pages mostra el resultat; l’enllaç al repositori permet consultar com està fet."
    ]
  },
  "bloc8-verificacio.html": {
    "Comprovació ràpida del material": [
      "Cada casella de la llista hauria de respondre a una prova concreta. Per exemple, fer tota l’activitat com ho faria l’alumnat.",
      "Les comprovacions es conserven al navegador. Podeu reiniciar-les quan reviseu una nova versió del recurs."
    ]
  },
  "bloc9-per-continuar-explorant.html": {
    "Què és la intel·ligència artificial local i per què és rellevant a l'escola?": [
      "Una curiositat: «local» descriu on s’executa el model, no la llicència ni la qualitat de les respostes.",
      "La privacitat també depèn de l’aplicació que envolta el model, dels registres que desa i de les connexions que activa."
    ],
    "Més control sobre les dades": [
      "Executar el model al centre pot evitar enviar consultes a un servidor extern. Cal revisar igualment on guarda els historials l’aplicació.",
      "Un ordinador compartit mereix tanta atenció com el servei: qui pot obrir els fitxers i les converses locals?"
    ],
    "Autonomia i funcionament fora de línia": [
      "Moltes eines locals necessiten Internet per descarregar el model, però després poden respondre sense connexió.",
      "Provar una sessió amb la xarxa desactivada és una manera directa de comprovar què funciona fora de línia."
    ],
    "Sobirania digital i continuïtat pedagògica": [
      "Guardar els models i els recursos necessaris al centre pot reduir la dependència d’un servei remot.",
      "La continuïtat també implica conservar una manera de reinstal·lar l’eina quan es renova l’equip."
    ],
    "Sessió divulgativa de Jordi Mas (Softcatalà)": [
      "La ponència de Jordi Mas aporta una mirada pràctica als models locals i al català.",
      "Mentre l’escolteu, distingiu les limitacions del model de les limitacions de l’ordinador que l’executa."
    ],
    "Què aporta executar el model al dispositiu": [
      "La resposta es genera al mateix equip, però això no garanteix que totes les funcions de l’aplicació siguin fora de línia.",
      "Una manera de posar-ho a prova és observar el comportament de l’eina amb Internet desconnectat."
    ],
    "Com ajustar el model a la tasca i al maquinari": [
      "Un model petit pot ser suficient per classificar textos breus, mentre que altres tasques exigeixen més capacitat.",
      "La memòria disponible i la longitud del context influeixen en el rendiment que notareu."
    ],
    "1. El context i el \"moment Linux\"": [
      "La comparació amb Linux apunta a una idea interessant: una tecnologia pot guanyar autonomia quan existeix un ecosistema d’eines obertes.",
      "Penseu com canviaria la feina del centre si poguéssiu executar una part de les eines sense dependre d’un servei remot."
    ],
    "2. Què vol dir executar IA en local": [
      "Un model descarregat encara necessita un programa que el carregui i l’executi. Les dues peces fan funcions diferents.",
      "«Al vostre ordinador» pot voler dir també un servidor del centre, segons qui controli el dispositiu."
    ],
    "3. IA local, pesos oberts i IA lliure": [
      "Poder descarregar els pesos d’un model no equival necessàriament a tenir permís per entrenar-lo o redistribuir-lo sense condicions.",
      "La llicència del model és una pregunta diferent de la ubicació on s’executa."
    ],
    "4. Tasques desateses i usos interactius": [
      "Transcriure un lot d’àudios és diferent de mantenir una conversa en temps real. El temps de resposta admissible canvia.",
      "Una tasca desatesa pot aprofitar un model més lent perquè el docent no necessita veure la resposta immediatament."
    ],
    "5. Maquinari i rendiment": [
      "La RAM i la memòria de la targeta gràfica condicionen el model que podreu carregar.",
      "Dos equips amb memòria semblant poden respondre a velocitats diferents segons el processador i l’acceleració disponible."
    ],
    "6. Com triar un model i per què importa la quantització": [
      "La quantització redueix la memòria necessària per guardar els pesos del model, tot i que pot afectar-ne el rendiment.",
      "Si un model no cap a la memòria disponible, una versió quantitzada pot fer viable la prova."
    ],
    "7. Eines per començar i criteris per al català": [
      "Per valorar un model en català, proveu-hi textos semblants als que faríeu servir al centre.",
      "Softcatalà publica comparacions de models en català que poden orientar la tria."
    ],
    "8. Transcripció i treball amb documents": [
      "La transcripció local pot ser interessant per treballar amb àudio sense enviar-lo a un servei remot.",
      "Quan consulteu documents amb un model local, comproveu si cita passatges reals del fitxer o genera una resposta sense referències."
    ],
    "Recursos en català per treballar amb IA local": [
      "Una comparació específica en català pot revelar diferències que no es veuen en classificacions generals de models.",
      "El Projecte Aina i Softcatalà tenen funcions complementàries: recursos lingüístics i orientacions per avaluar models."
    ],
    "IA local i models en català (Softcatalà)": [
      "Softcatalà publica proves de models en tasques en català. És un punt de partida més pertinent que una classificació només en anglès.",
      "Podeu fer una prova pròpia amb indicacions del vostre àmbit i comparar-les amb les recomanacions publicades."
    ],
    "Projecte Aina": [
      "El Projecte Aina posa a disposició recursos lingüístics i models per impulsar tecnologia en català.",
      "Una curiositat: els conjunts de dades són tan importants com els models per desenvolupar noves eines lingüístiques."
    ],
    "Com executar models locals al vostre ordinador": [
      "Aquestes aplicacions són interfícies o motors per executar models. La tria de l’aplicació i la tria del model són decisions diferents.",
      "Abans de començar, mireu si necessiteu consultar fitxers, conversar amb un model o connectar-lo a una altra eina."
    ],
    "Rebost (opció guiada per treballar amb fitxers)": [
      "Rebost permet vincular carpetes locals per consultar documents amb un model executat al dispositiu. Podeu començar per una carpeta de prova.",
      "El mode Online és opcional. Comproveu-lo si voleu assegurar-vos que la consulta es manté dins de l’entorn local."
    ],
    "LM Studio (interfície visual per triar i provar models)": [
      "LM Studio permet descarregar un model i després carregar-lo des de la interfície gràfica. Una descàrrega i una conversa local són operacions diferents.",
      "Si busqueu funcionament fora de línia, comproveu que heu seleccionat un model local i que els components necessaris ja són al dispositiu."
    ],
    "Ollama (motor local amb aplicació i API)": [
      "L’API local d’Ollama permet que altres aplicacions del mateix ordinador facin consultes al model.",
      "Ollama també ofereix models al núvol. El nom i la configuració del model indiquen on es processarà la consulta."
    ],
    "Trieu el model a partir de la memòria disponible": [
      "La quantització pot reduir els gigabytes necessaris per carregar un model. Per això dues versions del mateix model poden tenir requisits diferents.",
      "La longitud del context també consumeix memòria. Si una prova falla amb documents llargs, aquesta variable pot ser rellevant."
    ]
  },
  "credits.html": {
    "Servei Educatiu del Vallès Occidental II": [
      "Aquest apartat situa el material en el context de la formació per a docents.",
      "Conèixer l’origen institucional d’un recurs facilita valorar per a quin públic i quina finalitat es va crear."
    ],
    "Autoria i manteniment": [
      "Fer visible qui manté un projecte facilita comunicar-hi correccions o propostes de millora.",
      "Quan reutilitzeu una web d’un altre docent, és útil conservar-ne l’atribució original."
    ],
    "Vibe coding educatiu responsable (VCER)": [
      "Les guies de pràctica responsable poden ajudar a revisar una activitat abans que arribi a l’alumnat.",
      "Una pauta útil és transformar recomanacions generals en proves concretes que es puguin repetir."
    ],
    "CEDEC - seLIA": [
      "Aquestes referències connecten el projecte amb altres recursos educatius sobre IA.",
      "Consultar la font original permet veure quines orientacions són aplicables al vostre context."
    ],
    "Softcatalà": [
      "Softcatalà contribueix a disposar de recursos i criteris d’avaluació per a models que treballen en català.",
      "Un model amb bon resultat en anglès pot tenir comportaments diferents quan li demaneu una activitat en català."
    ],
    "Projecte Aina": [
      "Aina impulsa recursos lingüístics que poden reutilitzar investigadors i desenvolupadors de tecnologia en català.",
      "En IA, els conjunts de dades també són una part del recurs que convé documentar i citar."
    ],
    "Rebost": [
      "Rebost és una de les eines que apareixen al bloc d’IA local per treballar amb fitxers del dispositiu.",
      "Les eines obertes poden canviar de versió: conservar-ne l’enllaç oficial facilita revisar-ne les funcions."
    ],
    "TERMCAT": [
      "La terminologia tecnològica en català evoluciona. TERMCAT és una font útil per revisar com anomenem conceptes tècnics.",
      "Triar una terminologia coherent ajuda els lectors a relacionar el material amb altres recursos en català."
    ]
  }
};
  for (const [page, byTitle] of Object.entries(contextualComments)) {
    Object.assign(specificCommentsByPage[page] ||= {}, byTitle);
  }

  // Cobertura complementària dels blocs: passos, eines i materials de consulta.
  const supplementaryComments = {
  "index.html": {
    "Objectius de la sessió": [
      "Els objectius inclouen crear un recurs web que després podreu mantenir. És una manera concreta de passar d’una prova d’IA a un material d’aula."
    ],
    "Creació d'activitats interactives amb IA (Google Antigravity)": [
      "Una activitat interactiva necessita una regla de correcció. Penseu com explicaríeu a l’agent què ha de passar després d’una resposta incorrecta."
    ],
    "Publicació lliure i sobirania digital (GitHub Pages)": [
      "La URL de GitHub Pages és pública, mentre que el repositori conserva els fitxers originals. Podeu compartir tots dos enllaços segons el destinatari."
    ],
    "Criteris ètics i llicències d'ús (vibe coding responsable)": [
      "La revisió docent inclou comprovar les respostes que l’alumnat rebrà automàticament: un error al sistema de correcció es pot repetir moltes vegades."
    ]
  },
  "bloc1-marc.html": {
    "Feu créixer una idea en forma de recurs web": [
      "Una pàgina HTML pot començar amb una sola activitat i créixer conservant la mateixa adreça. Això facilita introduir millores a partir de les proves d’aula."
    ],
    "Per què s'ha triat Google Antigravity i GitHub?": [
      "El projecte es construeix en una carpeta local; després es publica des de GitHub. Aquesta separació permet continuar editant encara que canvieu d’eina."
    ],
    "Enllaços de referència d'aquest bloc:": [
      "Els enllaços d’aquesta secció permeten aprofundir en les eines escollides i consultar-ne la documentació quan torneu al projecte."
    ]
  },
  "bloc2-antigravity.html": {
    "Com funciona Google Antigravity?": [
      "Un agent pot crear fitxers nous dins del projecte. Reviseu-ne la llista abans de publicar: alguns poden ser auxiliars o no formar part del recurs final."
    ],
    "La vostra primera web funcional": [
      "El primer objectiu és disposar d’una web que pugueu provar. Si una interacció falla, podeu descriure a l’agent el resultat exacte que heu observat."
    ],
    "Ampliació: descàrrega massiva de documents PDF d'un lloc web a Documents": [
      "Aquesta pràctica fa servir l’agent per reunir documents. Comproveu que el nombre de fitxers descarregats coincideixi amb els enllaços esperats."
    ],
    "Comparació: Google Antigravity, OpenAI Codex i Claude Code d'Anthropic": [
      "La diferència més útil per al taller és com cada agent mostra les modificacions i demana autorització. El fitxer HTML final es pot conservar al marge de l’eina."
    ],
    "Plantilla d'indicació llesta per copiar i fer servir a Antigravity:": [
      "Canvieu la URL d’origen i la carpeta de destinació abans d’executar la plantilla. És la part que defineix on trobarà i on desarà els documents."
    ],
    "Per què Antigravity simplifica l'accés al taller?": [
      "El taller es planteja per a comptes XTEC i dispositius docents. Això fa important comprovar l’accés disponible abans de seguir una guia pensada per a altres entorns."
    ],
    "Videotutorials oficials de Google Antigravity": [
      "Els vídeos mostren operacions que poden canviar amb les actualitzacions. Si la interfície és diferent, busqueu la funció equivalent en lloc de repetir els clics literalment."
    ],
    "Google Antigravity 2.0: Guia oficial d'inici": [
      "Aquest vídeo és útil per veure el flux de treball complet abans de seguir les instruccions del taller."
    ],
    "Introducció a les habilitats dels agents (Agent Skills)": [
      "Una habilitat reutilitzable evita haver d’escriure cada vegada la mateixa explicació per a tasques repetides."
    ],
    "Demostració de control remot i supervisió d'agents": [
      "Fixeu-vos en quin moment la persona supervisora pot revisar les accions proposades per l’agent abans d’autoritzar-les."
    ],
    "Quina modalitat d'Antigravity triar per a la docència?": [
      "La modalitat escollida determina des d’on superviseu el treball de l’agent. Comproveu si necessiteu una vista directa dels fitxers del projecte."
    ],
    "Creació d'eines d'automatització personalitzades": [
      "Connectar un agent amb un servei extern afegeix permisos i dependències. Convé saber quines accions podrà executar abans d’activar la connexió."
    ],
    "Canal oficial de Google Antigravity": [
      "El canal oficial és una font per identificar canvis d’interfície posteriors a les captures del taller."
    ]
  },
  "bloc3-github.html": {
    "GitHub explicat per a docents principiants": [
      "Una URL de repositori identifica el projecte i les seves versions; la URL de Pages obre la web publicada. Aquesta distinció ajuda quan compartiu un recurs amb un altre docent."
    ],
    "Pràctica guiada: del projecte local al primer push": [
      "Un push envia a GitHub el que ja heu registrat localment. Si falta un fitxer, reviseu si s’ha inclòs al commit."
    ],
    "Indicació per connectar el projecte i fer la primera pujada": [
      "Abans de copiar la indicació, substituïu el nom del repositori i comproveu que correspon al projecte que teniu obert a Antigravity."
    ],
    "Per què creem el token després del repositori?": [
      "Crear primer el repositori permet limitar la credencial exactament al projecte de la pràctica. Aquest és l’avantatge principal de l’ordre proposat."
    ],
    "Per què activem GitHub Pages després de pujar el projecte?": [
      "Pages necessita uns fitxers per publicar. Primer els enviem al repositori i després indiquem quina branca ha de servir la web."
    ],
    "Tipus de llocs web a GitHub Pages: pàgina d'usuari i pàgines de projectes": [
      "Una pàgina de projecte incorpora el nom del repositori a la URL. Això afecta les rutes de les imatges i dels fulls d’estil."
    ],
    "Tres particularitats indispensables per no tenir errors:": [
      "Quan una web es veu bé en local però falla a Pages, revisar l’arxiu index.html i les rutes dels recursos és un primer diagnòstic útil."
    ],
    "Alternativa opcional: GitHub Desktop": [
      "GitHub Desktop deixa veure quins fitxers han canviat abans de fer un commit. És una alternativa visual al mateix flux de versions."
    ],
    "Instal·lació en els portàtils del PEDC": [
      "En un equip gestionat pel centre, l’experiència d’instal·lació pot dependre de les polítiques del dispositiu. Consulteu les instruccions del PEDC si hi ha restriccions."
    ],
    "Comparació entre GitHub i GitHub Desktop": [
      "GitHub és el servei on s’allotja el repositori; Desktop és una aplicació per gestionar-ne la còpia local i sincronitzar-la."
    ],
    "Pàgines d'ajuda oficials i documentació de referència:": [
      "Si canvia un menú de GitHub, la documentació oficial és un bon punt de partida per identificar el procediment actual."
    ],
    "Ordinadors docents del PEDC": [
      "La guia del PEDC ajuda a entendre quines instal·lacions i configuracions s’admeten als equips docents."
    ],
    "GitHub Desktop oficial": [
      "La web oficial permet descarregar l’aplicació i consultar els passos per vincular una carpeta amb un repositori."
    ],
    "Guia de GitHub Pages": [
      "La guia oficial inclou els ajustos de desplegament i les comprovacions útils si la pàgina retorna un error."
    ],
    "Gestió de tokens personals (PAT)": [
      "Les credencials de GitHub es poden limitar per repositori i revocar. Comproveu sempre la data de caducitat."
    ],
    "Videotutorials recomanats de GitHub i GitHub Pages": [
      "Els vídeos d’aquest apartat mostren procediments diferents. Trieu el que correspongui a l’eina que voleu utilitzar: navegador o Desktop."
    ],
    "Tutorial oficial: Com crear el vostre primer repositori a GitHub": [
      "Aquest vídeo se centra en la creació del repositori, abans de connectar-hi el projecte local."
    ],
    "Tutorial oficial de GitHub: Getting started with GitHub Pages": [
      "Aquí podeu observar on s’activa Pages i com s’obté l’adreça pública després del desplegament."
    ],
    "Com crear un fine-grained personal access token": [
      "Fixeu-vos en l’opció de seleccionar repositoris: és la que permet evitar donar accés a tot el compte."
    ],
    "Canviar la visibilitat del repositori (de privat a públic)": [
      "Fer públic un repositori significa que qualsevol persona pot consultar-ne els fitxers; cal revisar-los abans del canvi."
    ],
    "Com crear la vostra web gratuïta a GitHub Pages (en castellà)": [
      "Aquest tutorial segueix la publicació des del navegador i pot ajudar si preferiu veure els clics abans de fer la pràctica."
    ],
    "Rutes absolutes i relatives a HTML (Kiko Palomares)": [
      "La ruta relativa d’una imatge es calcula des del document que la crida. És una causa habitual de recursos que no carreguen a Pages."
    ],
    "GitHub Desktop + GitHub Pages (en anglès / subtitulat)": [
      "Una ruta alternativa: fer els commits amb Desktop i configurar la publicació a GitHub Pages."
    ],
    "Publicar la vostra web a GitHub Pages per a principiants": [
      "Aquest recorregut permet veure el procés sencer de publicació i comparar-lo amb els passos del taller."
    ],
    "Canal oficial de GitHub a YouTube": [
      "Per consultar funcions que hagin canviat, els materials recents del canal poden complementar els tutorials del taller."
    ]
  },
  "bloc4-pages-sites.html": {
    "De Gemini a Google Sites sense copiar codi": [
      "Un artefacte creat amb Gemini pot traslladar-se a Sites amb el flux disponible a l’eina. Després convé provar si conserva les interaccions esperades."
    ],
    "Una comparació des de la pràctica d'aula": [
      "La diferència de manteniment és rellevant: a Sites editeu visualment i a GitHub Pages actualitzeu els fitxers del projecte."
    ],
    "Enllaços i documentació oficial:": [
      "L’enllaç a la comunicació oficial permet consultar els requisits i l’abast de la funció de publicació des de Gemini."
    ]
  },
  "bloc5-llicencies.html": {
    "Per què cal distingir entre contingut i codi?": [
      "En una activitat interactiva, els textos i les preguntes són contingut pedagògic; la lògica que comprova respostes és programari."
    ],
    "Quina llicència de codi encaixa amb el vostre projecte?": [
      "L’orientador es basa en què voleu permetre a qui adapti el programa. Podeu contrastar la proposta amb el text complet de la llicència."
    ],
    "Llicències recomanades per a docents": [
      "La compatibilitat entre llicències depèn de les condicions de cada obra incorporada. Llegiu també els avisos de biblioteques i imatges de tercers."
    ],
    "Fonts oficials de les llicències": [
      "Consulteu la versió original de cada llicència quan necessiteu comprovar una condició concreta de reutilització."
    ]
  },
  "bloc6-recursos-visuals.html": {
    "Imatges generades amb IA: percepció i criteri pedagògic": [
      "Una mateixa il·lustració pot percebre’s de manera diferent quan s’explica com s’ha produït. És una pregunta interessant per obrir un debat sobre transparència."
    ],
    "Autenticitat percebuda i transparència": [
      "La informació sobre l’origen d’una imatge pot influir en com la valorem. A l’aula podeu comparar dues presentacions de la mateixa obra."
    ],
    "Funció pedagògica abans que decoració": [
      "El principi de coherència multimèdia suggereix evitar detalls visuals que competeixin amb la informació que volem ensenyar."
    ],
    "Emoji per a senyals breus i informals": [
      "El mateix emoji pot tenir formes diferents a Windows i a un mòbil. Per això un control important també necessita text."
    ],
    "Icones SVG per a un sistema visual coherent": [
      "Un SVG és vectorial i es pot ampliar sense perdre nitidesa. En un botó, una etiqueta accessible explica l’acció a qui utilitza un lector de pantalla."
    ],
    "Prepareu el contingut abans del disseny": [
      "Si una infografia encara té frases massa llargues, és més senzill corregir-les abans de pensar en les icones."
    ],
    "Construïu la infografia en HTML": [
      "Mantenir la infografia en HTML permet fer canvis de text i provar el contrast en mode fosc abans d’exportar-la."
    ],
    "Reviseu-la en pantalla": [
      "Proveu també una finestra estreta: una infografia que funciona en una pantalla gran pot perdre llegibilitat al mòbil."
    ],
    "Exporteu el component a PNG": [
      "Exportar un component concret evita els marges blancs de capturar tota la pàgina. Comproveu també que la transparència es conserva."
    ],
    "Mostra inserida directament amb HTML i Lucide": [
      "Aquesta mostra continua sent HTML editable. Si detecteu una errada, es pot corregir sense regenerar una imatge sencera."
    ],
    "Wikimedia Commons": [
      "Cada fitxer de Commons té una fitxa pròpia amb les condicions d’ús. Dos fitxers del mateix banc poden tenir llicències diferents."
    ],
    "Unsplash (secció gratuïta)": [
      "La llicència d’Unsplash permet molts usos, però convé consultar les limitacions abans de redistribuir fotografies dins d’un paquet de recursos."
    ],
    "Pexels": [
      "La gratuïtat de Pexels té condicions específiques. Conserveu l’enllaç de la fotografia concreta per revisar-les en el futur."
    ],
    "Pixabay": [
      "Pixabay utilitza una llicència pròpia; «gratuït» i «sense condicions» no són sinònims."
    ],
    "T - Títol (Title)": [
      "El títol identifica l’obra que citeu. Si no en té, una descripció breu pot ajudar a reconèixer-la."
    ],
    "A - Autoria (Author)": [
      "Enllaçar l’autoria permet reconèixer qui ha creat l’obra i localitzar-ne l’origen."
    ],
    "S - Font (Source)": [
      "La font és preferiblement l’adreça de la pàgina original de la imatge, no només la del banc que l’allotja."
    ],
    "L - Llicència (License)": [
      "L’enllaç a la llicència permet comprovar quins usos i adaptacions estan autoritzats."
    ]
  },
  "bloc7-bones-practiques.html": {
    "Consells abans de publicar": [
      "Proveu l’activitat com un alumne que no ha rebut instruccions addicionals. Aquesta simulació pot revelar passos implícits."
    ],
    "Guies i recursos recomanats de bones pràctiques:": [
      "Les guies vinculades permeten convertir les recomanacions en criteris concrets per revisar un material abans de compartir-lo."
    ]
  },
  "bloc8-verificacio.html": {
    "Pàgines d'ajuda oficials i enllaços de referència:": [
      "Aquests enllaços amplien les comprovacions de la llista amb documentació oficial sobre eines i publicació."
    ]
  },
  "bloc9-per-continuar-explorant.html": {
    "Ponència recomanada: Models d'intel·ligència artificial en local, de Jordi Mas": [
      "Aquesta ponència relaciona la IA local amb decisions de maquinari i models en català. Podeu comparar les recomanacions amb el vostre equip."
    ],
    "Enllaços de referència": [
      "Les referències permeten provar les eines descrites i consultar recursos en català des de les pàgines oficials."
    ]
  },
  "credits.html": {
    "Autoria i marc institucional": [
      "El context de creació ajuda a entendre per què el lloc prioritza activitats web per a docents i materials reutilitzables."
    ],
    "Projectes i fonts de referència": [
      "Els recursos citats aquí permeten tornar a les fonts que han inspirat les decisions pedagògiques del lloc."
    ],
    "Recursos de tercers i marques": [
      "Una biblioteca d’icones o un logotip pot tenir condicions pròpies. Els avisos de tercers indiquen què cal respectar en reutilitzar el projecte."
    ],
    "Llicències del projecte": [
      "La declaració de llicències separa els drets del contingut pedagògic dels drets del codi font."
    ],
    "Contingut pedagògic - CC BY-SA 4.0": [
      "CC BY-SA exigeix reconèixer l’autoria i compartir les adaptacions sota la mateixa llicència o una de compatible."
    ],
    "Codi font - GNU GPL v3": [
      "La GPL v3 permet estudiar i modificar el codi, amb obligacions quan es distribueixen versions derivades cobertes per la llicència."
    ]
  }
};
  for (const [page, byTitle] of Object.entries(supplementaryComments)) {
    Object.assign(specificCommentsByPage[page] ||= {}, byTitle);
  }

  // Missatges complementaris revisats per completar les tres observacions de cada apartat.
  const rotationExtras = {
  "index.html": {
    "Accés al material del taller": [
      "Si projecteu l’adreça curta, tothom pot accedir-hi també des d’un ordinador sense càmera."
    ],
    "Qüestionari de coneixements previs per a docents": [
      "Un qüestionari diagnòstic és més útil quan orienta la lectura que quan simplement dona una puntuació."
    ],
    "Creació de recursos web i ús de la intel·ligència artificial": [
      "Un exercici interactiu pot adaptar la següent pregunta a partir de la resposta anterior. És una opció que requereix dissenyar les regles."
    ],
    "Google Antigravity i eines al dispositiu docent": [
      "Una carpeta de treball acotada ajuda a saber exactament sobre quins materials pot actuar l’agent."
    ],
    "GitHub com a repositori educatiu": [
      "Un commit permet identificar quin canvi va introduir una versió nova de l’activitat."
    ],
    "Estructura web: el fitxer index.html i les rutes relatives": [
      "Quan traslladeu una web a un altre servidor, les rutes relatives acostumen a ser més portables que les rutes que comencen amb /."
    ],
    "Llicències de continguts (Creative Commons) i de codi (MIT)": [
      "Una icona incorporada des d’una biblioteca externa també pot tenir avisos de llicència independents."
    ],
    "Protecció de dades i IA local": [
      "Desconnectar la xarxa durant una prova permet observar quines funcions són realment disponibles sense Internet."
    ],
    "Marc: de consultar a crear": [
      "Una activitat HTML pot distribuir-se amb els fitxers del projecte i reutilitzar-se sense mantenir la conversa original amb la IA."
    ],
    "Google Antigravity pas a pas": [
      "Demanar una explicació dels canvis ajuda a decidir si la nova versió manté el propòsit pedagògic."
    ],
    "Configuració de GitHub": [
      "Un repositori privat protegeix l’accés als fitxers, però també cal revisar què passa si després es fa públic."
    ],
    "Pages en comparació amb Google Sites": [
      "Una pàgina que utilitza JavaScript propi dona més marge per crear interaccions personalitzades, sempre que l’allotjament ho permeti."
    ],
    "Llicències i codi obert": [
      "La llicència del codi ha de tenir en compte també les dependències que s’hi incorporen."
    ],
    "Recursos visuals i citació": [
      "Si una imatge transmet una dada, el seu text alternatiu ha de fer arribar aquella dada a qui no pot veure-la."
    ],
    "Bones pràctiques a l'aula": [
      "Una prova amb el teclat pot revelar errors de navegació que no apareixen en fer servir el ratolí."
    ],
    "Llista de verificació": [
      "Després d’una modificació important, convé repetir les comprovacions que podrien haver quedat afectades."
    ],
    "Per continuar explorant: IA local": [
      "La quantització permet executar versions més compactes d’alguns models en dispositius amb menys memòria."
    ],
    "Objectius de la sessió": [
      "Podeu identificar quin objectiu del taller correspon a una necessitat del vostre departament.",
      "Un bon resultat de la sessió és disposar d’un recurs que un altre docent pugui revisar i adaptar."
    ],
    "Creació d'activitats interactives amb IA (Google Antigravity)": [
      "La pregunta «Què passa si l’alumnat torna enrere?» pot descobrir comportaments que no apareixen en una prova ràpida.",
      "Les bastides de suport també poden formar part del codi, per exemple amb pistes progressives."
    ],
    "Publicació lliure i sobirania digital (GitHub Pages)": [
      "Si els fitxers són estàtics, es poden traslladar a altres allotjaments compatibles amb HTML.",
      "Un repositori públic permet compartir el procés de construcció del recurs amb altres docents."
    ],
    "Criteris ètics i llicències d'ús (vibe coding responsable)": [
      "Una dada fictícia permet provar formularis sense haver d’utilitzar informació de l’alumnat.",
      "El text del peu del recurs pot explicar com s’ha utilitzat la IA i qui ha revisat el contingut."
    ]
  },
  "bloc1-marc.html": {
    "D'una resposta a un projecte": [
      "Un fitxer HTML es pot tornar a obrir i modificar independentment de l’eina d’IA que el va generar."
    ],
    "Entendre el recurs sense escriure'l tot a mà": [
      "Si una activitat té una puntuació, saber on es calcula us ajuda a corregir-ne el comportament."
    ],
    "Google Antigravity": [
      "Podeu sol·licitar que l’agent expliqui els canvis abans d’acceptar-los."
    ],
    "GitHub": [
      "Amb un historial de commits és possible comparar una versió nova amb l’anterior."
    ],
    "Feu créixer una idea en forma de recurs web": [
      "Una versió inicial pot incloure una sola pregunta; les proves poden revelar quin tipus de retroacció falta.",
      "Conservar la versió inicial permet comparar si les ampliacions han fet l’activitat més útil."
    ],
    "Per què s'ha triat Google Antigravity i GitHub?": [
      "Podeu canviar d’editor sense haver de canviar el format HTML del projecte.",
      "Tenir el recurs en fitxers propis facilita fer-ne una còpia de seguretat independent."
    ],
    "Enllaços de referència d'aquest bloc:": [
      "La documentació oficial és útil quan un menú canvia de nom en una actualització.",
      "Guardar la referència original facilita revisar els passos quan repreneu la pràctica."
    ]
  },
  "bloc8-verificacio.html": {
    "Comprovació ràpida del material": [
      "Si la web és interactiva, també s’ha de revisar què passa quan una resposta és errònia."
    ],
    "Pàgines d'ajuda oficials i enllaços de referència:": [
      "Els enllaços oficials són útils per resoldre dubtes tècnics que no es poden confirmar només amb la llista.",
      "Quan detecteu una incidència, anoteu la prova exacta que ha fallat abans de demanar una correcció."
    ]
  },
  "bloc9-per-continuar-explorant.html": {
    "Què és la intel·ligència artificial local i per què és rellevant a l'escola?": [
      "Un ordinador del centre també pot allotjar models per a altres dispositius de la xarxa local; caldria gestionar-ne els accessos."
    ],
    "Més control sobre les dades": [
      "Si una aplicació conserva els xats, cal valorar també els permisos de la carpeta on els desa."
    ],
    "Autonomia i funcionament fora de línia": [
      "Un model ja descarregat pot continuar funcionant sense la xarxa, mentre no depengui de serveis remots."
    ],
    "Sobirania digital i continuïtat pedagògica": [
      "Conservar els fitxers del model i les instruccions d’instal·lació ajuda a recuperar el servei després d’un canvi d’equip."
    ],
    "Sessió divulgativa de Jordi Mas (Softcatalà)": [
      "La comparació de models en català és una oportunitat per observar errors de comprensió que poden passar desapercebuts en proves en anglès."
    ],
    "Què aporta executar el model al dispositiu": [
      "Una consulta local evita el viatge al servidor de la resposta, però el processament continua depenent de la potència de l’equip."
    ],
    "Com ajustar el model a la tasca i al maquinari": [
      "Fer la mateixa prova amb dos models permet comparar qualitat i velocitat sobre el vostre ordinador."
    ],
    "1. El context i el \"moment Linux\"": [
      "L’analogia amb Linux convida a pensar en ecosistemes que es poden instal·lar i mantenir sense un únic proveïdor."
    ],
    "2. Què vol dir executar IA en local": [
      "El programa que executa el model pot tenir llicència diferent de la dels pesos del model."
    ],
    "3. IA local, pesos oberts i IA lliure": [
      "Un model amb pesos descarregables pot imposar limitacions de reutilització: la llicència és el document que cal llegir."
    ],
    "4. Tasques desateses i usos interactius": [
      "Per transcriure una carpeta d’àudios, potser importa més acabar correctament el lot que respondre en pocs segons."
    ],
    "5. Maquinari i rendiment": [
      "La quantitat de memòria limita quins models caben; el tipus de processador influeix en la rapidesa de generació."
    ],
    "6. Com triar un model i per què importa la quantització": [
      "Quan compareu descàrregues del mateix model, mireu si canvia la precisió dels pesos i la memòria requerida."
    ],
    "7. Eines per començar i criteris per al català": [
      "Feu la prova en català amb exemples del vostre àmbit, com correccions o resums de materials didàctics."
    ],
    "8. Transcripció i treball amb documents": [
      "Una transcripció automàtica s’ha de revisar amb l’àudio original, sobretot quan hi ha noms propis o termes tècnics."
    ],
    "Recursos en català per treballar amb IA local": [
      "Un model que respon bé preguntes generals pot tenir dificultats amb varietats lingüístiques o terminologia específica."
    ],
    "IA local i models en català (Softcatalà)": [
      "Una classificació de models és una fotografia de les proves disponibles; convé consultar-ne la data i el mètode."
    ],
    "Projecte Aina": [
      "Els corpus i altres dades lingüístiques poden servir per entrenar o avaluar models en català."
    ],
    "Com executar models locals al vostre ordinador": [
      "La interfície no determina per si sola la qualitat lingüística: aquesta depèn sobretot del model escollit."
    ],
    "Rebost (opció guiada per treballar amb fitxers)": [
      "Per provar Rebost, és preferible començar amb documents no sensibles i comprovar què pot respondre sobre els fitxers vinculats."
    ],
    "LM Studio (interfície visual per triar i provar models)": [
      "El fet de descarregar un model no implica que estigui carregat a la memòria: LM Studio permet gestionar aquests dos passos."
    ],
    "Ollama (motor local amb aplicació i API)": [
      "Una API local pot connectar una activitat pròpia amb un model, sempre que configureu els permisos i el servei."
    ],
    "Trieu el model a partir de la memòria disponible": [
      "Un model quantitzat pot cabre on la versió original no cabria; la finestra de context encara condiciona la memòria consumida."
    ],
    "Ponència recomanada: Models d'intel·ligència artificial en local, de Jordi Mas": [
      "La ponència ajuda a distingir què depèn de l’aplicació i què depèn del model instal·lat.",
      "Podeu prendre nota d’un model esmentat i comprovar després si existeix una avaluació del seu rendiment en català."
    ],
    "Enllaços de referència": [
      "La guia de Softcatalà permet contrastar els requisits amb el vostre maquinari.",
      "Els enllaços a Rebost i al Projecte Aina us porten a recursos amb finalitats diferents dins de l’ecosistema local."
    ]
  },
  "credits.html": {
    "Servei Educatiu del Vallès Occidental II": [
      "El marc institucional explica a qui s’adreça el material formatiu."
    ],
    "Autoria i manteniment": [
      "Una adreça de contacte o un repositori accessible faciliten comunicar errades trobades durant l’ús."
    ],
    "Vibe coding educatiu responsable (VCER)": [
      "Les recomanacions de la guia es poden convertir en proves concretes abans de publicar un recurs."
    ],
    "CEDEC - seLIA": [
      "Les fonts educatives permeten contrastar les orientacions amb altres experiències de creació de materials."
    ],
    "Softcatalà": [
      "En una comparació de models, el tipus de prova en català pot importar tant com la puntuació final."
    ],
    "Projecte Aina": [
      "A més de models, el desenvolupament d’eines en català depèn de corpus i dades lingüístiques."
    ],
    "Rebost": [
      "Una aplicació local també necessita manteniment; les actualitzacions poden afectar com es descarreguen els models."
    ],
    "TERMCAT": [
      "Una cerca terminològica pot aclarir si dos noms tècnics es refereixen al mateix concepte."
    ],
    "Autoria i marc institucional": [
      "Indicar la procedència facilita contextualitzar la reutilització del recurs.",
      "Les dades de manteniment ajuden a saber a qui comunicar un enllaç trencat."
    ],
    "Projectes i fonts de referència": [
      "Citar la pàgina original facilita comprovar si una recomanació s’ha actualitzat.",
      "Les fonts també poden ajudar altres docents a crear variants del material per al seu centre."
    ],
    "Recursos de tercers i marques": [
      "La llicència del projecte no canvia automàticament les llicències dels recursos que incorpora.",
      "Conservar els avisos de tercers és rellevant si es distribueix una còpia del lloc."
    ],
    "Llicències del projecte": [
      "Una persona que vulgui reutilitzar la web necessita saber quina llicència correspon al codi.",
      "La separació permet adaptar material didàctic i programari amb les condicions que pertoquen a cadascun."
    ],
    "Contingut pedagògic - CC BY-SA 4.0": [
      "L’enllaç a la llicència explica les condicions d’atribució i d’adaptació.",
      "L’obligació de compartir igual s’aplica a les adaptacions en els termes que estableix la llicència."
    ],
    "Codi font - GNU GPL v3": [
      "La GPL regula els drets i les obligacions de qui redistribueix el programari cobert.",
      "Per reutilitzar el projecte, convé revisar les condicions del codi propi i dels components de tercers."
    ]
  }
};
  Object.assign(rotationExtras, {
  "bloc2-antigravity.html": {
    "Instal·lació de l'aplicació al dispositiu": [
      "Si el centre gestiona els ordinadors, confirmeu la ruta de descàrrega i les restriccions del dispositiu abans de començar."
    ],
    "La carpeta de treball (workspace)": [
      "Una carpeta anomenada per projecte és més fàcil de reconèixer quan l’agent demana permisos d’accés."
    ],
    "Tria del model d'intel·ligència artificial": [
      "Per comparar resultats, manteniu la mateixa indicació i canvieu només el model."
    ],
    "Com demanar recursos a l’agent: criteris docents": [
      "Descripcions com «alumnat de 2n d’ESO» i «pista després del segon intent» concreten millor la interacció."
    ],
    "Opcions de configuració recomanades per a docents que no l'han obert mai": [
      "La configuració inicial determina quan l’agent pot actuar directament sobre els fitxers."
    ],
    "Plan Review Policy (Política de revisió del pla)": [
      "La revisió del pla és útil per detectar si l’agent vol crear arxius en una carpeta equivocada."
    ],
    "Permisos a Windows - configuració recomanada": [
      "Un canvi de configuració no elimina les restriccions establertes per l’administració del dispositiu."
    ],
    "Model Selection & Thinking (Model i raonament)": [
      "Podeu comparar el resultat d’un retoc senzill amb dues configuracions i valorar si compensa la diferència de temps."
    ],
    "Artifacts & Browser Preview (Previsualització en viu)": [
      "La vista prèvia és una prova visual; obrir després el fitxer HTML al navegador permet detectar dependències externes."
    ],
    "Assistent per redactar la vostra primera indicació": [
      "Reviseu la indicació generada i comproveu que explica la resposta esperada quan l’alumnat s’equivoca."
    ],
    "Creeu un microrecurs": [
      "Una pregunta amb correcció immediata és una unitat petita que permet avaluar el funcionament de la web."
    ],
    "Indicació per començar": [
      "Especifiqueu si voleu mostrar pistes abans o després de revelar la resposta correcta."
    ],
    "Comproveu que funciona": [
      "Un botó «Torna-ho a provar» també hauria de reiniciar l’estat de l’activitat de manera coherent."
    ],
    "Demaneu una sola millora": [
      "Si la nova millora afecta la retroacció, proveu tant la resposta correcta com la incorrecta."
    ],
    "Mireu què ha creat l'agent": [
      "Comproveu si el projecte conté fitxers externs al document HTML i si cal mantenir-los en publicar."
    ],
    "Bons hàbits mentre treballeu amb l'agent": [
      "Quan un canvi falla, descriure els passos per reproduir l’error ajuda més que dir només «no funciona»."
    ],
    "Trieu la pàgina web d'origen i la carpeta de destinació": [
      "No tots els enllaços d’una pàgina porten directament a PDF. Cal comprovar quin tipus de fitxer es descarrega."
    ],
    "Envieu la indicació a l'assistent de Google Antigravity": [
      "Una indicació de descàrrega pot especificar com tractar fitxers amb el mateix nom."
    ],
    "Reviseu el pla i comproveu la carpeta al vostre ordinador": [
      "Obriu algun PDF descarregat per confirmar que el contingut és llegible, més enllà de comprovar-ne l’existència."
    ],
    "Pàgines d'accés obert": [
      "Un PDF accessible públicament pot tenir drets de reproducció reservats; reviseu-ne les condicions."
    ],
    "Carpeta neta i sense duplicats": [
      "Si dos documents tenen el mateix títol, la data o l’editor poden ajudar a distingir-ne les versions."
    ],
    "Per què s'ha triat Google Antigravity per a aquesta formació?": [
      "La previsualització dins l’editor permet comentar una modificació amb criteris pedagògics mentre s’està fent."
    ],
    "I si ja es fa servir Codex o Claude Code?": [
      "La portabilitat del projecte facilita comparar agents sense reconstruir el recurs des de zero."
    ],
    "Com funciona Google Antigravity?": [
      "L’agent pot modificar el mateix fitxer més d’una vegada; l’historial de canvis és important per entendre’n l’evolució.",
      "Un canvi visual pot venir de CSS, mentre que una nova interacció acostuma a requerir JavaScript."
    ],
    "La vostra primera web funcional": [
      "La primera versió ha de contenir una acció que es pugui provar, com comprovar una resposta.",
      "Un cop funciona, podeu millorar-ne el text o l’accessibilitat sense refer tota l’activitat."
    ],
    "Ampliació: descàrrega massiva de documents PDF d'un lloc web a Documents": [
      "Demanar que l’agent mostri la llista d’enllaços abans de descarregar-los facilita detectar documents que no corresponen.",
      "La carpeta Documents és una destinació fàcil de comprovar manualment en acabar la descàrrega."
    ],
    "Comparació: Google Antigravity, OpenAI Codex i Claude Code d'Anthropic": [
      "Compareu com cada entorn presenta el pla de treball abans de modificar fitxers.",
      "Una pregunta concreta: podeu veure el diff i decidir quins canvis accepteu?"
    ],
    "Plantilla d'indicació llesta per copiar i fer servir a Antigravity:": [
      "La plantilla pot demanar un informe final amb els noms i les ubicacions dels arxius desats.",
      "Indiqueu també com voleu que es gestionin els errors d’accés a algun document."
    ],
    "Per què Antigravity simplifica l'accés al taller?": [
      "L’accés disponible amb comptes institucionals pot variar segons la configuració del servei.",
      "La mateixa pràctica pot ser viable amb altres agents si permeten treballar sobre fitxers locals."
    ],
    "Videotutorials oficials de Google Antigravity": [
      "Comproveu la data dels vídeos quan busqueu una opció de configuració.",
      "Un videotutorial pot mostrar una versió diferent de la instal·lada al vostre ordinador."
    ],
    "Google Antigravity 2.0: Guia oficial d'inici": [
      "Fixeu-vos en com l’agent crea el primer projecte a partir de la indicació.",
      "Podeu aturar el vídeo al pas de la previsualització i comparar-lo amb el vostre editor."
    ],
    "Introducció a les habilitats dels agents (Agent Skills)": [
      "Una habilitat modular pot documentar passos que voleu repetir en diversos projectes.",
      "Reviseu quins permisos requereix una habilitat abans d’activar-la."
    ],
    "Demostració de control remot i supervisió d'agents": [
      "La supervisió és més efectiva quan les accions de l’agent queden visibles.",
      "Comproveu si la demostració inclou una etapa d’aprovació abans d’aplicar canvis."
    ],
    "Quina modalitat d'Antigravity triar per a la docència?": [
      "La modalitat amb interfície de fitxers pot facilitar entendre l’estructura d’un projecte web.",
      "Si voleu supervisar l’agent a distància, reviseu quines accions es poden autoritzar."
    ],
    "Creació d'eines d'automatització personalitzades": [
      "Una automatització reutilitzable pot ajudar amb tasques repetitives del mateix projecte.",
      "Les connexions amb serveis externs s’han de revisar també des de la perspectiva de les dades que s’hi envien."
    ],
    "Canal oficial de Google Antigravity": [
      "Podeu cercar-hi anuncis sobre funcions que no apareixen a les captures del taller.",
      "El canal pot complementar la documentació textual quan necessiteu veure una interacció."
    ]
  }
});

  Object.assign(rotationExtras, {
  "bloc3-github.html": {
    "El repositori (repo)": [
      "Una web publicada des de Pages pot continuar funcionant encara que l’usuari no obri mai el repositori."
    ],
    "Pujada i versions": [
      "El nom d’un commit us ajuda a localitzar en quin moment vau introduir una nova funció."
    ],
    "Token temporal i restringit": [
      "Revocar una credencial després de la pràctica és compatible amb mantenir el repositori publicat."
    ],
    "Abans de publicar un repositori públic": [
      "Reviseu els noms dels fitxers i el seu contingut: a vegades una carpeta temporal conserva informació que no s’hauria de compartir."
    ],
    "Creeu un repositori buit a GitHub": [
      "Començar amb un repositori buit evita haver de combinar fitxers inicials amb els del projecte local."
    ],
    "Copieu l'adreça HTTPS del repositori": [
      "L’URL HTTPS acostuma a acabar amb el nom del repositori i es pot copiar des de l’apartat Code de GitHub."
    ],
    "Torneu a la mateixa carpeta a Antigravity": [
      "Si el projecte funciona localment, aquesta és la carpeta que interessa publicar, amb els mateixos fitxers."
    ],
    "Creeu un token temporal per a aquest repositori": [
      "La data de caducitat del token pot ser breu perquè només s’utilitza durant la pràctica."
    ],
    "Demaneu a Antigravity que connecti el projecte": [
      "Un enllaç remot configurat incorrectament pot enviar els fitxers a un repositori diferent del previst."
    ],
    "Reviseu què s'enviarà abans d'aprovar-ho": [
      "Un fitxer amb claus d’API o dades personals no hauria d’entrar mai en un repositori públic."
    ],
    "Comproveu la pujada i revoqueu el token": [
      "Revocar el token no elimina els commits que ja s’han publicat a GitHub."
    ],
    "Per què utilitzem un token temporal?": [
      "Un accés d’escriptura permanent seria innecessari per a una única publicació."
    ],
    "Obriu Fine-grained tokens": [
      "Distingiu la pantalla de creació del token de la configuració de permisos del repositori."
    ],
    "Limiteu-lo al repositori de la pràctica": [
      "Comproveu que el selector de repositoris no hagi quedat en una opció més àmplia del que necessiteu."
    ],
    "Doneu només el permís necessari": [
      "La revisió de permisos és una mesura de seguretat perquè la credencial pugui fer només allò previst."
    ],
    "Utilitzeu-lo només per a aquesta pujada": [
      "Una credencial no ha d’aparèixer a les captures de pantalla que compartiu del taller."
    ],
    "Revoqueu-lo en acabar": [
      "La revocació és una operació que es fa des del compte de GitHub, independent del contingut del repositori."
    ],
    "Entreu a Settings del repositori": [
      "La configuració de Pages és pròpia de cada repositori; activar-la en un projecte no la configura en els altres."
    ],
    "Feu clic a Pages": [
      "GitHub Pages pot publicar HTML, CSS i JavaScript que s’executa al navegador."
    ],
    "Trieu la branca principal i premeu Save": [
      "Si Pages no mostra la versió nova, comproveu si el desplegament ha acabat."
    ],
    "Veieu un 404?": [
      "La ruta és sensible al nom exacte del repositori, incloent-hi guions i majúscules segons el context."
    ],
    "1. La pàgina principal d'usuari (User site)": [
      "El nom del repositori de pàgina d’usuari segueix el patró del compte github.io."
    ],
    "2. Les pàgines de projecte (Project sites)": [
      "Una ruta que comença per / pot ignorar el subdirectori del projecte i deixar de carregar imatges."
    ],
    "1. El fitxer principal s'ha de dir `index.html`": [
      "Un fitxer HTML amb un altre nom també pot publicar-se, però caldrà indicar-ne explícitament l’adreça."
    ],
    "2. Les rutes han de ser relatives": [
      "Fer servir ./ al principi de la ruta és una manera de deixar explícita la ubicació relativa."
    ],
    "3. El repositori ha de ser públic": [
      "Revisar la llicència del projecte ajuda altres docents a saber quines adaptacions poden fer."
    ],
    "Quan fer servir GitHub (web)?": [
      "La pestanya de commits permet veure les versions del repositori sense instal·lar cap programa."
    ],
    "Quan fer servir GitHub Desktop?": [
      "Des de Desktop podeu seleccionar un fitxer modificat i consultar-ne les diferències abans del commit."
    ],
    "GitHub explicat per a docents principiants": [
      "El repositori pot incloure un README amb instruccions de funcionament per als docents que el reutilitzin.",
      "L’historial ajuda a trobar una versió anterior quan una modificació perjudica l’activitat."
    ],
    "Pràctica guiada: del projecte local al primer push": [
      "El primer push estableix la còpia remota a partir del projecte que ja teniu.",
      "Comproveu que el repositori de destí és el que voleu fer servir per publicar."
    ],
    "Indicació per connectar el projecte i fer la primera pujada": [
      "La petició pot incloure la instrucció de mostrar els fitxers abans d’enviar-los.",
      "Després de pujar-los, reviseu si el repositori conté els mateixos recursos que funcionaven en local."
    ],
    "Per què creem el token després del repositori?": [
      "El nom del repositori apareix al selector quan el token es crea amb permisos restringits.",
      "L’ordre proposat fa més senzill evitar donar accés a projectes aliens a la pràctica."
    ],
    "Per què activem GitHub Pages després de pujar el projecte?": [
      "Pages publica una branca o una font configurada, no necessàriament tots els fitxers de totes les branques.",
      "El primer desplegament permet comprovar que el fitxer d’entrada és accessible."
    ],
    "Tipus de llocs web a GitHub Pages: pàgina d'usuari i pàgines de projectes": [
      "Una mateixa persona pot tenir una pàgina principal i diverses pàgines de projecte.",
      "La forma de la URL ajuda a entendre per què les rutes relatives són rellevants."
    ],
    "Tres particularitats indispensables per no tenir errors:": [
      "Una imatge que no apareix pot tenir un nom amb majúscules diferents del que figura al codi.",
      "Reviseu l’arrel del projecte quan funcionen algunes pàgines però fallen d’altres."
    ],
    "Alternativa opcional: GitHub Desktop": [
      "Desktop conserva la lògica de commit i push, però presenta els passos amb controls gràfics.",
      "Pot ser una bona via per revisar canvis manuals fets fora d’Antigravity."
    ],
    "Instal·lació en els portàtils del PEDC": [
      "Una aplicació pot estar permesa però requerir un procediment d’instal·lació específic del centre.",
      "El portal de suport institucional pot ajudar si Windows bloqueja una instal·lació."
    ],
    "Comparació entre GitHub i GitHub Desktop": [
      "GitHub Desktop necessita una connexió amb GitHub per sincronitzar, però permet preparar commits localment.",
      "Un repositori ja existent es pot clonar i obrir des de Desktop."
    ],
    "Pàgines d'ajuda oficials i documentació de referència:": [
      "Quan un videotutorial és antic, la documentació oficial pot confirmar el nom actual d’un menú.",
      "Val la pena guardar l’enllaç de la guia més rellevant per recuperar-lo després del taller."
    ],
    "Ordinadors docents del PEDC": [
      "La documentació del PEDC permet distingir problemes d’instal·lació de problemes del projecte Git.",
      "Les polítiques del dispositiu poden explicar per què un instal·lador funciona en un ordinador personal i no al del centre."
    ],
    "GitHub Desktop oficial": [
      "Descarregar Desktop des del web oficial redueix el risc d’instal·lar una còpia modificada.",
      "Un cop configurat, podeu obrir un repositori i revisar-ne l’historial amb la interfície gràfica."
    ],
    "Guia de GitHub Pages": [
      "Els errors 404 poden venir de la configuració del desplegament o de la ruta del fitxer HTML.",
      "La documentació de Pages explica com vincular la branca publicada amb una URL."
    ],
    "Gestió de tokens personals (PAT)": [
      "Una credencial restringida a un repositori no s’ha de confondre amb la contrasenya general del compte.",
      "Guardeu només el temps necessari les credencials temporals que feu servir al taller."
    ],
    "Videotutorials recomanats de GitHub i GitHub Pages": [
      "La creació d’un repositori i la publicació amb Pages són processos diferents; els vídeos es poden consultar per separat.",
      "Comproveu si el tutorial treballa amb la web de GitHub o amb Desktop abans de seguir-lo."
    ],
    "Tutorial oficial: Com crear el vostre primer repositori a GitHub": [
      "Un repositori buit és el punt de partida de la pràctica, abans d’enviar els fitxers d’Antigravity.",
      "Vegeu com s’estableix el nom del repositori, perquè serà visible a l’adreça pública."
    ],
    "Tutorial oficial de GitHub: Getting started with GitHub Pages": [
      "El vídeo mostra l’activació del desplegament; comproveu els menús si la interfície ha canviat.",
      "Després de publicar, obriu la URL de Pages per validar les rutes dels recursos."
    ],
    "Com crear un fine-grained personal access token": [
      "El permís de continguts s’assigna dins de l’àmbit de repositoris seleccionats.",
      "Quan el token ja no és necessari, el podeu revocar des del compte de GitHub."
    ],
    "Canviar la visibilitat del repositori (de privat a públic)": [
      "Reviseu l’historial abans de canviar a públic un repositori que ha contingut secrets.",
      "La visibilitat pública pot facilitar la reutilització del codi per altres docents."
    ],
    "Com crear la vostra web gratuïta a GitHub Pages (en castellà)": [
      "Les captures de tutorials poden mostrar una interfície diferent; busqueu la secció Pages dins de Settings.",
      "Fixeu-vos en la URL final que genera el repositori de projecte."
    ],
    "Rutes absolutes i relatives a HTML (Kiko Palomares)": [
      "Les rutes que comencen per / es resolen des de l’arrel del domini.",
      "Un projecte allotjat dins d’un subdirectori acostuma a necessitar rutes relatives per als recursos."
    ],
    "GitHub Desktop + GitHub Pages (en anglès / subtitulat)": [
      "Desktop facilita preparar el commit, mentre que Pages s’activa dins de la configuració web de GitHub.",
      "El tutorial pot servir per comparar els passos amb l’agent i fer-los manualment."
    ],
    "Publicar la vostra web a GitHub Pages per a principiants": [
      "L’ordre de crear el repositori i triar la font de publicació ajuda a comprendre el desplegament.",
      "Després del tutorial, proveu d’actualitzar una línia de text i observar quan apareix a la web."
    ],
    "Canal oficial de GitHub a YouTube": [
      "La documentació del canal es pot consultar per veure funcions noves de Pages o Desktop.",
      "Compareu la data del vídeo amb la versió que utilitzeu."
    ]
  }
});

  Object.assign(rotationExtras, {
  "bloc4-pages-sites.html": {
    "Google Gemini": [
      "Després d’exportar, obriu la pàgina publicada en una finestra diferent per comprovar com la veu el lector."
    ],
    "Google Sites": [
      "L’edició visual de Sites pot simplificar canvis en els textos que altres docents han de mantenir."
    ],
    "Quan té sentit fer servir cadascuna?": [
      "Les necessitats d’interacció, com corregir respostes automàticament, poden influir en la plataforma més adequada."
    ],
    "Feu servir Google Sites quan...": [
      "Un equip docent pot preferir una eina amb permisos d’edició compartida per mantenir un recurs conjunt."
    ],
    "Feu servir GitHub Pages amb IA quan...": [
      "Conservar el JavaScript propi permet modificar després les regles d’una activitat interactiva."
    ],
    "De Gemini a Google Sites sense copiar codi": [
      "La publicació és també una prova de compatibilitat: comproveu que els botons continuïn funcionant.",
      "Un canvi a l’artefacte original pot requerir revisar la versió ja publicada a Sites."
    ],
    "Una comparació des de la pràctica d'aula": [
      "Si el recurs canviarà sovint, el sistema d’edició pot ser més determinant que la primera publicació.",
      "La possibilitat d’exportar o conservar els fitxers també influeix en la continuïtat del projecte."
    ],
    "Enllaços i documentació oficial:": [
      "Les funcions de publicació poden tenir condicions d’accés segons el compte.",
      "La comunicació oficial ajuda a confirmar quin tipus d’artefactes s’admeten."
    ]
  },
  "bloc5-llicencies.html": {
    "Contingut pedagògic": [
      "La mateixa llicència pot acompanyar un text que un altre docent tradueixi o adapti."
    ],
    "Codi font": [
      "Una llicència de programari cobreix també adaptacions del codi que canvien les interaccions."
    ],
    "Per què no una sola llicència?": [
      "La separació facilita que una persona reutilitzi només els continguts sense copiar el programa."
    ],
    "I el que no heu creat vosaltres?": [
      "Una fotografia pot tenir requisits d’atribució encara que el lloc on la poseu sigui de creació pròpia."
    ],
    "Com queda en aquest projecte?": [
      "Els avisos sobre recursos de tercers eviten confondre les seves condicions amb les del codi propi."
    ],
    "Model de declaració per a un recurs web": [
      "Una declaració hauria d’indicar també on trobar el text complet de cada llicència."
    ],
    "Per a continguts": [
      "Podeu comparar CC BY i CC BY-SA segons el tractament que voleu donar a les adaptacions."
    ],
    "Per al codi": [
      "La distribució de versions modificades pot activar obligacions diferents segons la llicència de programari."
    ],
    "Per què cal distingir entre contingut i codi?": [
      "En una web d’exercicis, el text de les preguntes es pot reutilitzar separat de la lògica de correcció.",
      "Els fitxers de llicència del repositori ajuden a fer visible aquesta distinció."
    ],
    "Quina llicència de codi encaixa amb el vostre projecte?": [
      "L’orientador és una ajuda per pensar les condicions, i les podeu contrastar amb el text oficial.",
      "Valoreu si voleu exigir que les versions distribuïdes del programari mantinguin certes llibertats."
    ],
    "Llicències recomanades per a docents": [
      "La llicència de les imatges que incorporeu pot ser diferent de la del conjunt del recurs.",
      "Per a materials que altres docents adaptaran, l’atribució ha de continuar sent localitzable."
    ],
    "Fonts oficials de les llicències": [
      "Una traducció resumida pot ajudar a entendre la llicència, però el text oficial és la referència jurídica.",
      "Consulteu també la versió concreta: les obligacions poden canviar entre llicències o versions."
    ]
  },
  "bloc6-recursos-visuals.html": {
    "Emoji i icones vectorials: quan convé utilitzar-los": [
      "Un emoji pot tenir colors diferents a cada plataforma; un SVG manté les formes definides al projecte."
    ],
    "Infografies pedagògiques amb HTML i icones": [
      "Les capses HTML permeten conservar el text seleccionable i editable mentre reviseu la infografia."
    ],
    "Com verificar una resposta d'IA": [
      "Una seqüència visual de verificació pot recordar al lector quan cal consultar la font original."
    ],
    "Model d'indicació per crear l'HTML": [
      "Especifiqueu l’amplada màxima del component per evitar que la infografia quedi massa extensa."
    ],
    "Model d'indicació després de revisar el contingut": [
      "Abans de renderitzar, demaneu que es mantinguin els textos validats sense introduir-ne de nous."
    ],
    "Bancs d'imatges reals creades per persones": [
      "La fitxa de l’obra és més important que la reputació general del banc a l’hora de revisar-ne l’ús."
    ],
    "Com atribuir una imatge: el mètode TASL": [
      "Una atribució completa permet que qui rep el material comprovi la procedència sense haver de preguntar-vos-la."
    ],
    "Exemple visual d'una atribució completa": [
      "Enllaçar la font de l’obra facilita identificar-ne l’autoria i verificar-ne la llicència."
    ],
    "Imatges generades amb IA: percepció i criteri pedagògic": [
      "En una activitat docent, el context d’ús pot canviar el valor d’una imatge.",
      "Podeu analitzar què fa que una fotografia sigui una font documental i quan una imatge sintètica compleix una funció diferent."
    ],
    "Autenticitat percebuda i transparència": [
      "Un peu explicatiu pot indicar l’origen sintètic de la imatge quan és rellevant.",
      "Aquesta transparència permet discutir com influeix l’etiqueta en la interpretació d’una obra."
    ],
    "Funció pedagògica abans que decoració": [
      "Una imatge que acompanya una definició pot ajudar a situar-la o bé competir amb la lectura.",
      "La pregunta útil és quina informació s’entendria pitjor si retiréssiu la imatge."
    ],
    "Emoji per a senyals breus i informals": [
      "L’emoji no és un substitut fiable d’una etiqueta quan serveix per activar una funció.",
      "Podeu fer una prova visual comparant el mateix símbol al mòbil i a l’ordinador."
    ],
    "Icones SVG per a un sistema visual coherent": [
      "Una sola biblioteca facilita mantenir mides i gruixos de traç semblants.",
      "Les icones decoratives poden marcar-se perquè els lectors de pantalla les ignorin."
    ],
    "Prepareu el contingut abans del disseny": [
      "Escriure un títol breu per a cada idea ajuda a definir l’estructura abans de maquetar.",
      "Si una idea necessita molt de text, podeu separar-ne l’explicació de la representació visual."
    ],
    "Construïu la infografia en HTML": [
      "Les icones Lucide són elements vectorials que podeu ajustar amb CSS.",
      "Un avantatge de l’HTML és que el text es pot corregir sense haver de generar una imatge nova."
    ],
    "Reviseu-la en pantalla": [
      "El mode fosc pot revelar capses sense prou contrast.",
      "Comproveu si les icones continuen tenint sentit quan el text del costat ocupa dues línies."
    ],
    "Exporteu el component a PNG": [
      "Un PNG amb transparència pot sobreposar-se a fons diferents; reviseu si el text hi conserva el contrast.",
      "Exportar només el component evita espais buits que dificulten reutilitzar-lo."
    ],
    "Mostra inserida directament amb HTML i Lucide": [
      "El text d’aquesta mostra es pot seleccionar perquè forma part del document.",
      "Una versió PNG es pot utilitzar en diapositives, però s’ha de regenerar si després corregiu l’HTML."
    ],
    "Wikimedia Commons": [
      "No totes les obres de Commons comparteixen exactament les mateixes condicions.",
      "La fitxa de cada imatge acostuma a indicar la procedència i les dades d’autoria."
    ],
    "Unsplash (secció gratuïta)": [
      "Les fotografies d’Unsplash tenen una llicència pròpia, diferent de Creative Commons.",
      "Conservar la URL original facilita comprovar-ne les condicions abans d’una nova publicació."
    ],
    "Pexels": [
      "Cal revisar la llicència si es vol redistribuir un conjunt gran d’imatges.",
      "Una atribució voluntària pot reconèixer l’autoria fins i tot quan no és obligatòria."
    ],
    "Pixabay": [
      "Els usos comercials o la redistribució de contingut sense modificar poden tenir condicions particulars.",
      "La informació de l’autor i la font de cada imatge és útil per documentar el recurs."
    ],
    "T - Títol (Title)": [
      "Quan l’obra no té un títol formal, una descripció identificativa pot fer aquest paper.",
      "El títol ajuda a distingir dues obres que provenen de la mateixa pàgina."
    ],
    "A - Autoria (Author)": [
      "Algunes imatges indiquen una persona creadora concreta; d’altres tenen informació d’autoria més complexa.",
      "Si hi ha un perfil oficial, enllaçar-lo pot facilitar trobar l’obra original."
    ],
    "S - Font (Source)": [
      "Una URL a la fitxa concreta és més informativa que una URL a la pàgina principal del banc.",
      "La font és el camí que permet comprovar de nou les dades d’una atribució."
    ],
    "L - Llicència (License)": [
      "El nom de la llicència hauria de correspondre a la versió aplicable a l’obra.",
      "Un enllaç als termes complets ajuda a entendre si s’admet una adaptació."
    ]
  },
  "bloc7-bones-practiques.html": {
    "Revisar el contingut sense delegar-lo a la IA": [
      "Una resposta incorrecta que es marca com a encertada pot passar desapercebuda si només proveu la primera pregunta."
    ],
    "No enviar dades personals de l'alumnat": [
      "Una activitat que no demana identificació és més senzilla de desplegar sense gestionar comptes."
    ],
    "Entendre què fa el material": [
      "Saber on es guarden les dades de l’activitat permet explicar què passarà en tancar el navegador."
    ],
    "Decidir quins recursos convé desar en local": [
      "Si un recurs extern falla, la web hauria de seguir mostrant les parts essencials de l’activitat."
    ],
    "Separar accessibilitat web i DUA": [
      "Un selector utilitzable amb teclat és una comprovació tècnica; donar opcions de participació respon a decisions didàctiques."
    ],
    "Citar l'autoria del que es pren d'altres persones": [
      "Documentar la URL d’origen de cada fotografia evita perdre la referència quan es mouen els fitxers."
    ],
    "Guardar el rastre de com es va fer": [
      "Un README pot registrar decisions didàctiques que el codi per si sol no explica."
    ],
    "Declarar l'ús d'IA i el que s'ha comprovat": [
      "Explicar com s’ha verificat la correcció del material ajuda a valorar-lo abans de reutilitzar-lo."
    ],
    "Publicar amb una llicència lliure a la vista": [
      "El peu de pàgina és un lloc fàcil de trobar per enllaçar les condicions de reutilització."
    ],
    "Oferir el codi perquè altres persones l'adaptin": [
      "Un altre docent pot modificar les preguntes si té accés als fitxers que generen l’activitat."
    ],
    "Consells abans de publicar": [
      "Provar en una pantalla de mòbil pot revelar problemes de maquetació que no es veuen a l’ordinador.",
      "Una comprovació final inclou l’estat dels botons quan una pregunta ja s’ha respost."
    ],
    "Guies i recursos recomanats de bones pràctiques:": [
      "Una guia pot donar suport a un criteri que després incorporeu a la llista de verificació.",
      "Quan documenteu una decisió, conservar la font original permet tornar a consultar-la."
    ]
  }
});

  for (const [page, notes] of Object.entries(rotationExtras)) {
    for (const [title, additions] of Object.entries(notes)) {
      const existing = specificCommentsByPage[page]?.[title] || [];
      if (!existing.length) continue;
      specificCommentsByPage[page][title] = [...new Set([...existing, ...additions])].slice(0, 3);
    }
  }

  const checklistComments = [
    ['Revisió docent:', 'La prova final és completar l’activitat com ho faria l’alumnat. Comproveu també la retroacció de cada resposta.'],
    ['Privacitat (RGPD):', 'Una activitat que funciona sense identificar l’alumnat evita recollir dades que potser no necessiteu.'],
    ['Codi entès:', 'Saber on es calcula la puntuació o com es mostra la retroacció facilita corregir el recurs després.'],
    ['Recursos i dependències:', 'Una web pot carregar biblioteques o imatges externes. Comproveu què passa si es perd la connexió.'],
    ['Accessibilitat:', 'Proveu la navegació amb la tecla Tab i el contrast en mode fosc. Són comprovacions observables.'],
    ['Autoria i crèdits:', 'Un enllaç a la fotografia original ajuda més que citar només la portada d’un banc d’imatges.'],
    ['Rastre guardat:', 'Un README amb les decisions docents explica per què el recurs funciona com funciona.'],
    ["Declaració d'ús d'IA:", 'Una declaració útil indica què ha fet la IA i què ha comprovat personalment el docent.'],
    ['Llicència visible:', 'Les condicions del contingut pedagògic i les del codi poden ser diferents.'],
    ['Codi obert:', 'La pàgina publicada mostra el resultat; el repositori permet que un altre docent estudiï i adapti el codi.']
  ];

  const STORAGE_VERSION = 'eines-ia:companion-context-v9';
  function currentPage() {
    return location.pathname.split('/').pop() || 'index.html';
  }

  function currentState() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_VERSION) || '{}');
    } catch {
      return {};
    }
  }

  function saveState(state) {
    try {
      sessionStorage.setItem(STORAGE_VERSION, JSON.stringify(state));
    } catch {}
  }

  function choose(key, items) {
    if (!items.length) return '';
    const state = currentState();
    state.indexes ||= {};
    const current = Number.isInteger(state.indexes[key])
      ? state.indexes[key] : Math.floor(Math.random() * items.length);
    const text = items[current % items.length];
    state.indexes[key] = (current + 1) % items.length;
    saveState(state);
    return text;
  }

  function cleanVisibleText(text) {
    return (text || '')
      .replace(/[«»]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,:;.!?])/g, '$1')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .trim();
  }

  function titleFor(target) {
    if (target.matches?.('h2, h3, h4, .home-card-title, .quiz-q-title')) {
      return cleanVisibleText(target.textContent || '').slice(0, 140);
    }
    const heading = target.querySelector?.('h2, h3, h4, .home-card-title, .quiz-q-title, .step-content h3');
    return cleanVisibleText(heading?.textContent || '').slice(0, 140);
  }

  function fingerprintFor(target) {
    return [titleFor(target), target.id || '', cleanVisibleText(target.textContent || '').slice(0, 50)].join('::');
  }

  function unique(items) {
    return [...new Set(items.map(cleanVisibleText).filter(Boolean))];
  }

  function commentsFor(target) {
    const explicit = target.getAttribute?.('data-companion-comment');
    if (explicit) return [cleanVisibleText(explicit)];

    const page = currentPage();
    const title = titleFor(target);
    const curated = specificCommentsByPage[page]?.[title];
    if (curated?.length) return unique(curated);

    // La llista de verificació no té cap títol dins de cada casella.
    if (page === 'bloc8-verificacio.html' && target.classList?.contains('check-item')) {
      const text = cleanVisibleText(target.textContent || '');
      const note = checklistComments.find(([label]) => text.includes(label));
      return note ? [note[1]] : [];
    }

    // El peu de figura és una dada verificable; evitem deduccions sobre la imatge.
    if (page === 'bloc6-recursos-visuals.html' && target.matches?.('figure')) {
      const caption = cleanVisibleText(target.querySelector('figcaption')?.textContent || '');
      if (caption && target.querySelector('figcaption a[href]')) {
        return ['El peu d’aquesta imatge inclou un enllaç a la font. Podeu obrir-lo per consultar-ne l’autoria i la llicència.'];
      }
    }

    return [];
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

  // Els h3/h4 que són dins d'una capsa llarga també tenen la seva pròpia
  // franja de lectura, fins a l'encapçalament següent. Així una observació
  // sobre quantització apareix mentre es llegeix aquell paràgraf, no en un altre.
  function activeSubheading(anchorY) {
    const main = document.getElementById('contingut-principal') || document.querySelector('main');
    if (!main) return null;

    const itemSelector = [
      '.ordered-step-item', '.home-block-card', '.quiz-question-card',
      '.comparison-card', '.tool-card', '.card-item', '.vibe-card',
      '.check-item', '.license-box', '.conference-visual',
      '.infographic-prompt-box', '.pedagogy-infographic'
    ].join(',');

    let active = null;
    for (const heading of main.querySelectorAll('h3, h4')) {
      if (heading.closest(itemSelector) || !commentsFor(heading).length) continue;
      const box = heading.closest('.content-box');
      if (!box) continue;

      const rect = heading.getBoundingClientRect();
      const container = box.getBoundingClientRect();
      if (rect.height < 12 || rect.top > anchorY || container.bottom <= anchorY) continue;

      const later = [...box.querySelectorAll('h3, h4')].find((next) => {
        if (next === heading || !(heading.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING)) return false;
        const nextRect = next.getBoundingClientRect();
        return nextRect.height >= 12 && nextRect.top > rect.top + 1;
      });
      const bottom = later ? Math.min(container.bottom, later.getBoundingClientRect().top) : container.bottom;
      if (anchorY >= rect.top && anchorY < bottom) active = heading;
    }

    return active;
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
      if (!commentsFor(node).length) return;
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

    // Una targeta concreta al punt de lectura té preferència sobre un
    // subtítol general situat més amunt dins la mateixa capsa.
    if (best && bestDistance === 0 && !best.classList?.contains('content-box')) return best;
    return activeSubheading(anchorY) || best;
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
    if (!comments.length) return;
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
    if (!force && Date.now() < readyAt) return;

    const companion = document.getElementById('reading-companion');
    if (!companion || companion.hidden) return;

    const target = activeCandidate();
    if (!target) return;
    if (!force && target === lastTarget) return;

    // Si no hi ha cap observació específica, retirem la bafarada anterior.
    if (!commentsFor(target).length) {
      clearTimeout(hideTimer);
      bubble?.classList.remove('is-visible');
      if (bubble) bubble.hidden = true;
      lastTarget = target;
      return;
    }

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
    window.addEventListener('companion:request-comment', () => {
      const target = activeCandidate();
      if (!target) return;
      if (!commentsFor(target).length) return;
      showComment(target);
      window.announce?.(bubbleText.textContent);
    });

    setTimeout(() => evaluate({ force: true }), READY_DELAY + 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
