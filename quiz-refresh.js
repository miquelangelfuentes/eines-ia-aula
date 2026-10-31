(() => {
  'use strict';

  const VERSION = '2026-10-31';
  let initAttempts = 0;
  const STORAGE_KEY = 'eines-ia:diagnostic-quiz-v3';
  const SCORE = { A: 1, B: 2, C: 3, D: 4 };

  const questions = [
    {
      selector: '[data-q="1"]',
      title: 'De la consulta a un projecte web',
      context: 'Quan penseu a crear un recurs web amb IA, quin punt descriu millor el vostre punt de partida?',
      options: {
        A: 'Fins ara he utilitzat sobretot la IA per consultar idees o preparar materials, i aquest taller serà una primera aproximació a convertir una idea en un recurs web.',
        B: 'He generat alguna pàgina o algun fragment de codi des d’un xat, però acostumo a copiar el resultat i encara no treballo sobre un projecte organitzat en fitxers.',
        C: 'Ja he creat algun recurs web amb IA, reconec el paper d’index.html i entenc com s’organitzen les carpetes i les rutes relatives, tot i que encara necessito revisar-les amb ajuda.',
        D: 'Treballo amb projectes web assistits per IA, entenc com s’organitzen els fitxers i puc revisar o ajustar el resultat amb autonomia.'
      }
    },
    {
      selector: '[data-q="2"]',
      title: 'Google Antigravity i control sobre l’agent',
      context: 'Com descriuríeu la vostra experiència amb agents que poden treballar directament sobre una carpeta del vostre ordinador?',
      options: {
        A: 'Encara no he treballat amb un agent que pugui actuar sobre una carpeta del meu ordinador; vull conèixer aquest tipus d’entorn des del principi.',
        B: 'He provat assistents de codi o agents, però encara no tinc un criteri estable per triar la carpeta de treball i revisar els permisos abans d’aprovar-los.',
        C: 'Sé treballar amb una carpeta de projecte i acostumo a revisar els plans o permisos que proposa l’agent, encara que de vegades necessito orientació.',
        D: 'Configuro l’agent perquè treballi en un espai acotat i reviso els plans i els permisos abans d’autoritzar canvis.'
      }
    },
    {
      selector: '[data-q="4"]',
      title: 'GitHub, GitHub Pages i portabilitat',
      context: 'Quina experiència teniu amb GitHub com a espai per conservar i publicar un recurs web?',
      options: {
        A: 'Encara no he utilitzat GitHub per publicar materials educatius; m’interessa veure com un projecte local pot convertir-se en un web accessible mitjançant un enllaç.',
        B: 'He consultat GitHub o sé què és un repositori, però encara no he publicat un projecte propi amb GitHub Pages.',
        C: 'Ja he publicat algun recurs amb GitHub Pages i puc actualitzar els fitxers, tot i que necessito suport quan apareixen errors de ruta o de publicació.',
        D: 'Gestiono repositoris i GitHub Pages amb autonomia, i entenc el valor de conservar el recurs en fitxers web oberts i portables.'
      }
    },
    {
      selector: '[data-q="6"]',
      title: 'Llicències i atribució de recursos',
      context: 'Quan publiqueu un recurs educatiu, com gestioneu les llicències del projecte i els materials de tercers que hi incorporeu?',
      options: {
        A: 'Quan comparteixo materials, acostumo a centrar-me en el contingut pedagògic i aquest taller m’ajudarà a incorporar de manera més conscient les llicències i les atribucions.',
        B: 'Conec Creative Commons i acostumo a citar recursos de tercers, però encara no diferencio la llicència del contingut de la llicència del codi.',
        C: 'Diferencio les llicències de contingut i de programari, i sé aplicar atribucions a recursos visuals, tot i que de vegades necessito comprovar-ne els requisits.',
        D: 'Diferencio la llicència del contingut de la del codi i sé per què aquest projecte utilitza CC BY-SA 4.0 i GNU GPL v3. També atribueixo els recursos de tercers amb criteris com TASL quan és aplicable.'
      }
    },
    {
      selector: '[data-q="7"]',
      title: 'Disseny responsable abans de publicar',
      context: 'Quin tipus de revisió feu abans de compartir amb l’alumnat una activitat digital creada amb ajuda d’IA?',
      options: {
        A: 'Acostumo a revisar sobretot si el contingut i la mecànica funcionen; el taller m’ajudarà a ampliar aquesta revisió a altres criteris.',
        B: 'Ja tinc en compte aspectes com la privacitat o l’accessibilitat, però encara no segueixo una pauta estable per revisar el recurs abans de publicar-lo.',
        C: 'Reviso el contingut i la privacitat, i distingeixo entre accessibilitat web i DUA, encara que no sempre ho sistematitzo.',
        D: 'Aplico una revisió sistemàtica que combina criteris pedagògics amb protecció de dades. També reviso l’accessibilitat web i el DUA de manera diferenciada.'
      }
    },
    {
      selector: '[data-q="10"]',
      title: 'Verificació i IA local',
      context: 'Com encaixen en la vostra pràctica la verificació final dels recursos i la possibilitat d’executar models d’IA al dispositiu?',
      options: {
        A: 'Aquest taller serà la meva primera aproximació a una llista de verificació per revisar recursos creats amb IA i també al concepte d’IA local.',
        B: 'Faig comprovacions abans de compartir un recurs, però depenen de cada projecte i encara no he explorat gaire què implica executar models al dispositiu.',
        C: 'Utilitzo criteris de verificació abans de publicar i conec la diferència general entre serveis al núvol i models locals, tot i que no ho he incorporat de manera habitual.',
        D: 'Faig una verificació sistemàtica abans de publicar i puc valorar quan un model local aporta més control sobre les dades o permet treballar fora de línia.'
      }
    }
  ];

  const recommendations = {
    q1: '<strong><a href="bloc1-marc.html">Bloc 1 · Marc</a></strong>: passar de la consulta en un xat a un projecte web que queda sota control docent.',
    q2: '<strong><a href="bloc2-antigravity.html">Bloc 2 · Antigravity</a></strong>: treballar amb una carpeta de projecte i revisar els permisos de l’agent abans d’autoritzar canvis.',
    q4: '<strong><a href="bloc3-github.html">Bloc 3 · GitHub</a></strong> i <a href="bloc4-pages-sites.html">bloc 4 · Pages i Sites</a>: publicar el projecte i entendre què implica conservar-lo en fitxers web oberts.',
    q6: '<strong><a href="bloc5-llicencies.html">Bloc 5 · Llicències</a></strong> i <a href="bloc6-recursos-visuals.html">bloc 6 · Imatges i icones</a>: diferenciar la llicència del contingut de la del codi i aplicar l’atribució dels recursos de tercers.',
    q7: '<strong><a href="bloc7-bones-practiques.html">Bloc 7 · Bones pràctiques</a></strong> i <a href="bloc8-verificacio.html">bloc 8 · Verificació</a>: incorporar criteris responsables i convertir-los en una revisió sistemàtica.',
    q10: '<strong><a href="bloc8-verificacio.html">Bloc 8 · Verificació</a></strong> i <a href="bloc9-per-continuar-explorant.html">bloc 9 · IA local</a>: consolidar la comprovació final i entendre quan l’execució local pot aportar més control sobre les dades.'
  };

  const routeText = (average) => {
    if (average < 2.2) {
      return {
        className: 'inicial',
        title: 'Recorregut suggerit: començar pel procés complet',
        description: 'El taller està pensat perquè pugueu seguir el procés des del principi. Us pot ser útil avançar en l’ordre dels blocs i dedicar temps a les pràctiques guiades abans de publicar el primer recurs.',
        use: 'Seguiu els blocs en ordre i utilitzeu els exemples com a model de treball. Quan una part ja us resulti familiar, podeu avançar directament a la pràctica següent.'
      };
    }
    if (average < 3.2) {
      return {
        className: 'intermedi',
        title: 'Recorregut suggerit: consolidar el flux de treball',
        description: 'Ja teniu experiències que us permetran avançar amb agilitat. La diagnosi us assenyala els blocs on pot valer la pena aturar-vos per connectar millor la creació del recurs amb la manera de publicar-lo i revisar-lo.',
        use: 'Prioritzeu els blocs que apareixen a la diagnosi i passeu més ràpidament pels procediments que ja domineu. La llista de verificació del bloc 8 us pot servir com a fil conductor.'
      };
    }
    return {
      className: 'avancat',
      title: 'Recorregut suggerit: aprofundir en la revisió',
      description: 'Podeu dedicar menys temps als passos mecànics i concentrar-vos en les decisions que donen més control sobre el recurs. Els blocs de bones pràctiques i verificació poden ser el centre del vostre recorregut.',
      use: 'Podeu prioritzar els blocs 7 i 8. El bloc 9 queda com a ampliació per explorar què aporta executar models al dispositiu.'
    };
  };

  const readAnswers = (form) => {
    const answers = {};
    form.querySelectorAll('.quiz-question-card').forEach((card) => {
      const checked = card.querySelector('input[type="radio"]:checked');
      if (checked) answers[checked.name] = checked.value;
    });
    return answers;
  };

  const saveAnswers = (form) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readAnswers(form)));
  };

  const restoreAnswers = (form) => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    form.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.checked = saved[input.name] === input.value;
    });
  };

  const syncSelectionClasses = (form) => {
    const cards = [...form.querySelectorAll('.quiz-question-card')];
    cards.forEach((card) => {
      const checked = card.querySelector('input[type="radio"]:checked');
      card.classList.toggle('answered', Boolean(checked));
      card.querySelectorAll('.quiz-option-card').forEach((label) => {
        label.classList.toggle('selected', label.querySelector('input')?.checked === true);
      });
    });

    document.querySelectorAll('#quiz-stepper-pills .quiz-step-btn').forEach((button, index) => {
      button.classList.toggle('answered', Boolean(cards[index]?.querySelector('input[type="radio"]:checked')));
    });
  };

  const syncProgress = (form) => {
    const total = form.querySelectorAll('.quiz-question-card').length;
    const count = form.querySelectorAll('input[type="radio"]:checked').length;
    const percent = Math.round((count / total) * 100);
    const fill = document.getElementById('quiz-progress-fill');
    const percentText = document.getElementById('quiz-progress-percent');
    const progressText = document.getElementById('quiz-progress-text');
    const finish = document.getElementById('quiz-finish-btn');

    if (fill) fill.style.width = `${percent}%`;
    if (percentText) percentText.textContent = `${percent}% completat`;
    if (progressText) progressText.textContent = count === total
      ? `${count} de ${total} preguntes respostes · completat`
      : `${count} de ${total} preguntes respostes`;
    if (finish) finish.style.display = count === total ? 'inline-flex' : 'none';

    return { count, total };
  };

  const renderResults = (form, panel) => {
    const answers = readAnswers(form);
    const names = Object.keys(answers);
    const total = form.querySelectorAll('.quiz-question-card').length;
    if (names.length !== total) {
      panel.style.display = 'none';
      return;
    }

    const average = names.reduce((sum, name) => sum + SCORE[answers[name]], 0) / total;
    const route = routeText(average);
    const priorityKeys = names.filter((name) => SCORE[answers[name]] <= 2);
    const priorityItems = priorityKeys.length
      ? priorityKeys.map((name) => `<li>${recommendations[name]}</li>`).join('')
      : '<li>Les respostes indiquen que ja podeu moure-us amb força autonomia pel recorregut. Utilitzeu la diagnosi per decidir on voleu aprofundir més.</li>';

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem">
        <span class="quiz-profile-badge ${route.className}"><i data-lucide="route" style="width:16px;height:16px"></i>${route.title}</span>
        <span style="font-size:.85rem;color:var(--text-muted);font-weight:600">Diagnosi orientativa</span>
      </div>
      <p style="margin:.85rem 0 1.25rem;font-size:.95rem;line-height:1.6;color:var(--text-main)">${route.description}</p>
      <div class="quiz-recommendations-grid">
        <div class="quiz-rec-card">
          <div>
            <h4>Blocs a prioritzar</h4>
            <ul>${priorityItems}</ul>
          </div>
        </div>
        <div class="quiz-rec-card">
          <div>
            <h4>Com aprofitar el recorregut</h4>
            <p>${route.use}</p>
          </div>
        </div>
      </div>
      <div class="pedagogical-highlight" style="margin-top:1rem;margin-bottom:0">
        La diagnosi serveix per orientar el recorregut del taller. Podeu obrir qualsevol bloc independentment del resultat i tornar al qüestionari quan vulgueu.
      </div>`;

    panel.style.display = 'block';
    if (window.lucide?.createIcons) window.lucide.createIcons();
  };

  const updateQuestionContent = (form) => {
    questions.forEach((question) => {
      const card = form.querySelector(question.selector);
      if (!card) return;
      const title = card.querySelector('.quiz-q-title');
      const context = card.querySelector('.quiz-q-context');
      if (title) title.textContent = question.title;
      if (context) context.textContent = question.context;
      Object.entries(question.options).forEach(([value, text]) => {
        const optionText = card.querySelector(`input[value="${value}"]`)?.closest('.quiz-option-card')?.querySelector('.quiz-opt-text');
        if (optionText) optionText.textContent = text;
      });
    });
  };

  const initialise = () => {
    const section = document.getElementById('diagnostic-quiz-section');
    const form = document.getElementById('diagnostic-quiz-form');
    const panel = document.getElementById('quiz-results-panel');
    if (!section || !form || !panel) return;
    if (section.dataset.quizRefreshVersion === VERSION) return;

    if (!section.classList.contains('is-wizard')) {
      initAttempts += 1;
      if (initAttempts < 200) window.setTimeout(initialise, 30);
      return;
    }

    section.dataset.quizRefreshVersion = VERSION;

    const heading = section.querySelector('.quiz-header-content h2');
    const intro = section.querySelector('.quiz-header-content p');
    if (heading) heading.textContent = 'Qüestionari de punt de partida';
    if (intro) intro.textContent = 'Respongueu aquestes 6 preguntes per identificar quins blocs us poden ser més útils. El resultat és orientatiu i serveix per adaptar el recorregut del taller al vostre punt de partida.';

    updateQuestionContent(form);
    restoreAnswers(form);
    syncSelectionClasses(form);
    const progress = syncProgress(form);

    form.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        window.setTimeout(() => {
          saveAnswers(form);
          syncSelectionClasses(form);
          const current = syncProgress(form);
          if (current.count === current.total) renderResults(form, panel);
          else panel.style.display = 'none';
        }, 0);
      });
    });

    document.getElementById('quiz-finish-btn')?.addEventListener('click', () => {
      window.setTimeout(() => renderResults(form, panel), 0);
    });

    document.getElementById('btn-reset-quiz')?.addEventListener('click', () => {
      window.setTimeout(() => {
        localStorage.removeItem(STORAGE_KEY);
        form.querySelectorAll('input[type="radio"]').forEach((input) => { input.checked = false; });
        syncSelectionClasses(form);
        syncProgress(form);
        panel.style.display = 'none';
      }, 0);
    });

    if (progress.count === progress.total) renderResults(form, panel);
    else panel.style.display = 'none';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})();
