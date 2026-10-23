(() => {
  const form = document.getElementById('license-quiz-form');
  if (!form) return;

  const codeChoiceTable = [...document.querySelectorAll('.clean-table')]
    .find(table => table.querySelector('th')?.textContent.trim() === 'Si voleu...');
  if (codeChoiceTable) {
    codeChoiceTable.querySelectorAll('tbody td:first-child > strong').forEach(strong => {
      strong.replaceWith(...strong.childNodes);
    });
  }

  [...document.querySelectorAll('.card-item h3')]
    .find(heading => heading.textContent.trim() === "Casos que no cal comparar d'entrada")
    ?.closest('.card-item')
    ?.remove();

  const ccIcons = {
    'https://creativecommons.org/licenses/by/4.0/deed.ca': ['assets/images/licenses/cc-by.svg', 'Icona CC BY 4.0'],
    'https://creativecommons.org/licenses/by-sa/4.0/deed.ca': ['assets/images/licenses/cc-by-sa.svg', 'Icona CC BY-SA 4.0'],
    'https://creativecommons.org/licenses/by-nc/4.0/deed.ca': ['assets/images/licenses/cc-by-nc.svg', 'Icona CC BY-NC 4.0'],
    'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ca': ['assets/images/licenses/cc-by-nc-sa.svg', 'Icona CC BY-NC-SA 4.0']
  };

  Object.entries(ccIcons).forEach(([href, [src, alt]]) => {
    const link = [...document.querySelectorAll('a[href]')].find(anchor => anchor.href === href);
    if (!link || link.parentElement.querySelector('.cc-license-local-icon')) return;
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.className = 'cc-license-local-icon';
    img.loading = 'lazy';
    img.style.display = 'block';
    img.style.height = '32px';
    img.style.width = 'auto';
    img.style.marginTop = '.45rem';
    link.insertAdjacentElement('afterend', img);
  });

  const questionHost = document.getElementById('license-quiz-question');
  const stepper = document.getElementById('license-quiz-stepper');
  const progressFill = document.getElementById('license-quiz-progress-fill');
  const progressText = document.getElementById('license-quiz-progress-text');
  const progressPercent = document.getElementById('license-quiz-progress-percent');
  const prevBtn = document.getElementById('license-quiz-prev');
  const nextBtn = document.getElementById('license-quiz-next');
  const resultBtn = document.getElementById('license-quiz-result');
  const resetBtn = document.getElementById('license-quiz-reset');
  const results = document.getElementById('license-quiz-results');

  const questions = {
    openness: {
      title: 'Si una altra persona modifica el vostre codi i el comparteix, què voldríeu que passés?',
      context: 'No penseu encara en noms de llicències. Trieu la situació que s\'acosta més al que voleu permetre.',
      options: [
        ['strong', 'Vull que la versió derivada coberta continuï oberta amb les mateixes condicions.'],
        ['files', 'Només necessito que els fitxers meus que es modifiquin continuïn oberts.'],
        ['permissive', 'Prefereixo permetre una reutilització molt àmplia, encara que la versió modificada utilitzi altres condicions.'],
        ['unsure', 'No sé quin model em convé. Necessito una pregunta més concreta.']
      ]
    },
    priority: {
      title: 'Què us importa més quan una altra persona reutilitzi el vostre codi?',
      context: 'Aquesta pregunta només apareix si encara no heu decidit quin grau d\'obertura voleu mantenir.',
      options: [
        ['keep-open', 'Que les millores compartides continuïn disponibles com a codi obert.'],
        ['easy-reuse', 'Que sigui fàcil reutilitzar el codi amb poques obligacions.'],
        ['still-unsure', 'Encara no tinc una preferència.']
      ]
    },
    strongKind: {
      title: 'Quin tipus de projecte esteu compartint?',
      context: 'La forma del projecte ajuda a diferenciar llicències que mantenen obert el codi de maneres diferents.',
      options: [
        ['distributed', 'Una aplicació, una web estàtica o un programa que altres persones poden copiar i executar.'],
        ['network', 'Un servei web en què una part important del programa s\'executa al servidor.'],
        ['library', 'Una biblioteca o component pensat perquè altres programes el puguin incorporar.']
      ]
    },
    patents: {
      title: 'Us importa que la llicència inclogui una concessió explícita de patents dels contribuïdors?',
      context: 'En molts projectes educatius aquest no serà el criteri principal. Si no sabeu què implica, podeu indicar-ho.',
      options: [
        ['yes', 'Sí. Vull que aquesta concessió aparegui expressament a la llicència.'],
        ['no', 'No és un criteri determinant per al meu projecte.'],
        ['unsure', 'No sé si les patents són rellevants en el meu cas.']
      ]
    },
    dependencies: {
      title: 'Heu incorporat codi que no heu escrit vosaltres?',
      context: 'Pot ser una biblioteca o un fragment d\'un altre projecte. Aquest codi conserva la seva llicència original.',
      options: [
        ['reviewed', 'Sí, i n\'he revisat la llicència.'],
        ['needs-review', 'Sí, però encara no n\'he revisat les condicions.'],
        ['none', 'No. Tot el codi del projecte és propi.'],
        ['unclear', 'No ho sé amb seguretat o hi ha codi del qual desconec la procedència.']
      ]
    }
  };

  const path = [];
  const answers = {};
  let current = 0;
  let recommendation = null;

  function optionLabels(options) {
    return options.map((opt, index) => {
      const letter = String.fromCharCode(65 + index);
      return `<label class="quiz-option-card${answers[path[current]] === opt[0] ? ' selected' : ''}">
        <input type="radio" name="license-current" value="${opt[0]}" class="quiz-radio-hidden"${answers[path[current]] === opt[0] ? ' checked' : ''}>
        <span class="quiz-opt-badge">${letter}</span><span class="quiz-opt-text">${opt[1]}</span>
      </label>`;
    }).join('');
  }

  function renderQuestion() {
    const key = path[current];
    const q = questions[key];
    questionHost.innerHTML = `<div class="quiz-question-card active">
      <div class="quiz-question-header"><span class="quiz-q-num-pill">Pas ${current + 1}</span><h3 class="quiz-q-title">${q.title}</h3></div>
      <p class="quiz-q-context">${q.context}</p><div class="quiz-options-list">${optionLabels(q.options)}</div>
    </div>`;

    questionHost.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        answers[key] = input.value;
        questionHost.querySelectorAll('.quiz-option-card').forEach(label => label.classList.remove('selected'));
        input.closest('.quiz-option-card').classList.add('selected');
        results.hidden = true;
        nextBtn.disabled = false;
        resultBtn.disabled = false;
      });
    });

    stepper.innerHTML = path.map((_, index) => `<span class="quiz-step-btn${index === current ? ' active' : ''}${index < current ? ' answered' : ''}" aria-hidden="true">${index + 1}</span>`).join('');
    const estimated = Math.max(path.length + (key === 'dependencies' ? 0 : 1), 2);
    const percent = key === 'dependencies' ? 100 : Math.min(90, Math.round(((current + 1) / estimated) * 100));
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `Pas ${current + 1}`;
    progressPercent.textContent = key === 'dependencies' ? 'Última pregunta' : 'Orientació en curs';
    prevBtn.disabled = current === 0;
    nextBtn.hidden = key === 'dependencies';
    resultBtn.hidden = key !== 'dependencies';
    nextBtn.disabled = !answers[key];
    resultBtn.disabled = !answers[key];
    if (window.lucide) window.lucide.createIcons();
  }

  function chooseStrongRecommendation(value) {
    if (value === 'network') return 'agpl';
    if (value === 'library') return 'lgpl';
    return 'gpl';
  }

  function advance() {
    const key = path[current];
    const value = answers[key];
    if (!value) return;

    let next = null;
    if (key === 'openness') {
      if (value === 'strong') next = 'strongKind';
      else if (value === 'files') { recommendation = 'mpl'; next = 'dependencies'; }
      else if (value === 'permissive') next = 'patents';
      else next = 'priority';
    } else if (key === 'priority') {
      if (value === 'keep-open') next = 'strongKind';
      else if (value === 'easy-reuse') next = 'patents';
      else { recommendation = 'guided'; next = 'dependencies'; }
    } else if (key === 'strongKind') {
      recommendation = chooseStrongRecommendation(value);
      next = 'dependencies';
    } else if (key === 'patents') {
      recommendation = value === 'yes' ? 'apache' : 'mit';
      next = 'dependencies';
    }

    if (next) {
      path.splice(current + 1);
      path.push(next);
      current += 1;
      renderQuestion();
    }
  }

  const resultData = {
    gpl: ['git-fork', 'GNU GPL v3', 'Us encaixa si voleu que una obra derivada coberta que es distribueixi mantingui la GPL i ofereixi el codi font corresponent.', 'https://www.gnu.org/licenses/gpl-3.0.html'],
    agpl: ['network', 'GNU AGPL v3', 'Us encaixa si el programa funciona com a servei en un servidor i voleu que una versió modificada ofereixi el codi font també a les persones que hi interactuen a través de la xarxa.', 'https://www.gnu.org/licenses/agpl-3.0.html'],
    mpl: ['files', 'MPL 2.0', 'Us encaixa si voleu que els fitxers coberts que es modifiquin continuïn oberts, però permetre que es combinin amb altres fitxers sota condicions diferents.', 'https://www.mozilla.org/MPL/2.0/'],
    lgpl: ['blocks', 'GNU LGPL v3', 'Us encaixa especialment quan publiqueu una biblioteca que voleu mantenir oberta però que també ha de poder ser utilitzada des d\'altres programes.', 'https://www.gnu.org/licenses/lgpl-3.0.html'],
    apache: ['shield-check', 'Apache License 2.0', 'Us encaixa si voleu una llicència permissiva que incorpori una concessió explícita de patents dels contribuïdors.', 'https://www.apache.org/licenses/LICENSE-2.0'],
    mit: ['unlock', 'MIT License', 'Us encaixa si voleu facilitar molt la reutilització amb poques obligacions. No exigeix que les versions modificades distribuïdes continuïn obertes.', 'https://opensource.org/license/MIT'],
    guided: ['compass', 'Dues opcions de partida segons la prioritat', 'Si voleu que les versions derivades distribuïdes continuïn obertes, GNU GPL v3 és una opció de partida adequada. Si preferiu facilitar la reutilització amb poques obligacions, MIT és una opció permissiva habitual.', '']
  };

  function dependencyNote() {
    const value = answers.dependencies;
    if (value === 'needs-review') return ['triangle-alert', 'Abans de publicar, reviseu la llicència de cada biblioteca o fragment extern i conserveu els avisos que exigeixi.'];
    if (value === 'unclear') return ['triangle-alert', 'Abans de llicenciar el projecte, aclariu la procedència del codi que no podeu identificar. No el presenteu com a codi propi sota una llicència nova.'];
    if (value === 'reviewed') return ['badge-check', 'Heu indicat que el codi de tercers està identificat. Manteniu-ne els avisos i torneu a revisar-los quan actualitzeu les dependències.'];
    return ['badge-check', 'Heu indicat que no incorporeu codi de tercers. La recomanació es refereix al vostre codi propi.'];
  }

  function showResult() {
    const currentKey = path[current];
    if (currentKey !== 'dependencies' || !answers.dependencies) return;
    const data = resultData[recommendation || 'guided'];
    const note = dependencyNote();
    const link = data[3] ? `<a href="${data[3]}" target="_blank" rel="noopener" class="resource-pill" style="margin-top:.85rem;"><i data-lucide="external-link"></i> Obriu la font oficial</a>` : '';
    results.innerHTML = `
      <span class="quiz-profile-badge intermedi"><i data-lucide="compass" aria-hidden="true"></i> Orientació de llicència de codi</span>
      <h3 style="margin:0 0 .45rem;font-size:1.2rem;">Resultat orientatiu</h3>
      <p style="margin:0;color:var(--text-muted);font-size:.925rem;line-height:1.6;">La recomanació parteix de les decisions que heu pres, no del coneixement previ dels noms de les llicències.</p>
      <article class="quiz-rec-card" style="margin-top:1.25rem;justify-content:flex-start;">
        <h4 style="margin-bottom:.55rem;"><i data-lucide="${data[0]}" aria-hidden="true"></i>${data[1]}</h4>
        <p style="margin:0;color:var(--text-muted);font-size:.9rem;line-height:1.6;">${data[2]}</p>${link}
      </article>
      <div class="pedagogical-highlight" style="margin-top:1rem;margin-bottom:.75rem;"><strong style="display:inline-flex;align-items:center;gap:.4rem;"><i data-lucide="${note[0]}" style="width:17px;height:17px;"></i> Codi de tercers</strong><br>${note[1]}</div>
      <p style="margin:0;color:var(--text-dim);font-size:.825rem;line-height:1.55;">Si combineu codi amb llicències diferents, comproveu-ne la compatibilitat abans de distribuir el projecte.</p>`;
    results.hidden = false;
    progressFill.style.width = '100%';
    progressPercent.textContent = 'Completat';
    if (window.lucide) window.lucide.createIcons();
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  nextBtn.addEventListener('click', advance);
  resultBtn.addEventListener('click', showResult);
  prevBtn.addEventListener('click', () => {
    if (current === 0) return;
    current -= 1;
    path.splice(current + 1);
    recommendation = null;
    results.hidden = true;
    renderQuestion();
  });
  resetBtn.addEventListener('click', () => {
    Object.keys(answers).forEach(key => delete answers[key]);
    path.length = 0;
    path.push('openness');
    current = 0;
    recommendation = null;
    results.hidden = true;
    results.innerHTML = '';
    renderQuestion();
  });

  path.push('openness');
  renderQuestion();
})();
