(() => {
  const form = document.getElementById('license-quiz-form');
  if (!form) return;

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

  const officialSourcesHeading = [...document.querySelectorAll('.content-box h3')]
    .find(heading => heading.textContent.includes('Fonts oficials per comprovar les condicions'));
  if (officialSourcesHeading) {
    officialSourcesHeading.innerHTML = '<i data-lucide="external-link" class="lucide" style="width:16px;height:16px;color:var(--accent-secondary);"></i> Fonts oficials de les llicències';
    const sourceList = officialSourcesHeading.parentElement.querySelector('ul');
    if (sourceList) {
      sourceList.innerHTML = `
        <li><a href="https://creativecommons.org/cc-licenses/" target="_blank" rel="noopener">Creative Commons - llicències Creative Commons</a></li>
        <li><a href="https://www.gnu.org/licenses/licenses.html" target="_blank" rel="noopener">GNU - llicències de programari</a></li>
        <li><a href="https://www.mozilla.org/MPL/2.0/" target="_blank" rel="noopener">Mozilla - Mozilla Public License 2.0</a></li>
        <li><a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener">Apache Software Foundation - Apache License 2.0</a></li>
        <li><a href="https://opensource.org/license/MIT" target="_blank" rel="noopener">Open Source Initiative - MIT License</a></li>
        <li><a href="https://opensource.org/license/ISC" target="_blank" rel="noopener">Open Source Initiative - ISC License</a></li>`;
    }
  }

  const questions = {
    openness: {
      title: 'Si una altra persona modifica el vostre codi i el comparteix, què voldríeu que passés?',
      context: 'No penseu encara en noms de llicències. Trieu la situació que s’acosta més al que voleu permetre.',
      options: [
        ['strong', 'Vull que, si comparteix una versió modificada del programa, també hagi de compartir-ne el codi amb la mateixa llicència.'],
        ['files', 'Només vull que els fitxers del meu codi que modifiqui continuïn oberts.'],
        ['permissive', 'Prefereixo que pugui reutilitzar el codi amb poques obligacions, fins i tot dins d’un projecte que no sigui obert.'],
        ['unsure', 'No sé quin model em convé. Necessito una pregunta més concreta.']
      ]
    },
    priority: {
      title: 'Què us importa més quan una altra persona reutilitzi el vostre codi?',
      context: 'Aquesta pregunta només apareix si encara no heu decidit quin tipus de condicions voleu mantenir.',
      options: [
        ['keep-open', 'Que les millores que es comparteixin continuïn disponibles com a codi obert.'],
        ['easy-reuse', 'Que sigui fàcil reutilitzar el codi amb poques obligacions.'],
        ['still-unsure', 'Encara no tinc una preferència.']
      ]
    },
    strongKind: {
      title: 'Quin tipus de projecte esteu compartint?',
      context: 'Això ajuda a distingir què passa quan el codi es distribueix i quan funciona principalment en un servidor.',
      options: [
        ['distributed', 'Una aplicació o una web estàtica que altres persones poden copiar i executar.'],
        ['network', 'Un servei web en què una part important del programa s’executa al servidor.'],
        ['library', 'Una biblioteca o component pensat perquè altres programes el puguin incorporar.']
      ]
    },
    patents: {
      title: 'Voleu que la llicència inclogui també una autorització explícita sobre patents?',
      context: 'Si una persona aporta codi i té patents necessàries per utilitzar aquella aportació, Apache 2.0 concedeix als usuaris els drets de patent corresponents. En una web educativa senzilla, aquest criteri sovint no és determinant.',
      options: [
        ['yes', 'Sí. Prefereixo que aquesta protecció consti expressament a la llicència.'],
        ['no', 'No. No és un criteri important per al meu projecte.'],
        ['unsure', 'No sé si les patents poden ser rellevants en el meu cas.']
      ]
    },
    dependencies: {
      title: 'Heu incorporat codi que no heu escrit vosaltres?',
      context: 'Pot ser una biblioteca o un fragment d’un altre projecte. Aquest codi conserva la seva llicència original.',
      options: [
        ['reviewed', 'Sí, i n’he revisat la llicència.'],
        ['needs-review', 'Sí, però encara no n’he revisat les condicions.'],
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
    gpl: ['git-fork', 'GNU GPL v3', 'Us encaixa si voleu que qui distribueixi una versió modificada del programa hagi de mantenir la GPL i oferir el codi font corresponent.', 'https://www.gnu.org/licenses/gpl-3.0.html'],
    agpl: ['network', 'GNU AGPL v3', 'Us encaixa si el programa funciona com a servei en un servidor i voleu que una versió modificada ofereixi el codi font també a les persones que hi interactuen a través de la xarxa.', 'https://www.gnu.org/licenses/agpl-3.0.html'],
    mpl: ['files', 'MPL 2.0', 'Us encaixa si voleu que els fitxers del vostre codi que es modifiquin continuïn oberts, però permetre que el projecte inclogui altres fitxers sota condicions diferents.', 'https://www.mozilla.org/MPL/2.0/'],
    lgpl: ['blocks', 'GNU LGPL v3', 'Us encaixa especialment quan publiqueu una biblioteca que voleu mantenir oberta però que també ha de poder ser utilitzada des d’altres programes.', 'https://www.gnu.org/licenses/lgpl-3.0.html'],
    apache: ['shield-check', 'Apache License 2.0', 'Us encaixa si voleu una llicència permissiva que també deixi escrit què passa amb les patents relacionades amb les aportacions de codi. Si un contribuïdor té patents necessàries per utilitzar la seva aportació, la llicència concedeix als usuaris els drets de patent corresponents.', 'https://www.apache.org/licenses/LICENSE-2.0'],
    mit: ['unlock', 'MIT License', 'Us encaixa si voleu facilitar molt la reutilització amb poques obligacions. No exigeix que les versions modificades distribuïdes continuïn obertes.', 'https://opensource.org/license/MIT'],
    guided: ['compass', 'Dues opcions de partida segons la prioritat', 'Podeu valorar GNU GPL v3 si voleu que les versions modificades distribuïdes continuïn obertes, o MIT si preferiu facilitar la reutilització amb poques obligacions.', '']
  };

  function dependencyNote() {
    const value = answers.dependencies;
    if (value === 'needs-review') return ['triangle-alert', 'Abans de publicar, reviseu la llicència de cada biblioteca o fragment extern i conserveu els avisos que exigeixi.'];
    if (value === 'unclear') return ['triangle-alert', 'Abans de llicenciar el projecte, aclariu la procedència del codi que no podeu identificar. No el presenteu com a codi propi sota una llicència nova.'];
    if (value === 'reviewed') return ['badge-check', 'Heu indicat que el codi de tercers està identificat. Manteniu-ne els avisos i torneu a revisar-los quan actualitzeu les dependències.'];
    return ['badge-check', 'Heu indicat que no incorporeu codi de tercers. La recomanació es refereix al vostre codi propi.'];
  }

  function showResult() {
    if (path[current] !== 'dependencies' || !answers.dependencies) return;
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
      <div style="margin-top:1rem;padding:1rem 1.1rem;background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-md);display:flex;gap:.9rem;align-items:flex-start;">
        <i data-lucide="${note[0]}" aria-hidden="true" style="width:20px;height:20px;color:var(--accent-secondary);margin-top:.1rem;flex:0 0 auto;"></i>
        <div><strong style="display:block;margin-bottom:.35rem;">Codi de tercers</strong><span style="color:var(--text-muted);font-size:.9rem;line-height:1.6;">${note[1]}</span></div>
      </div>
      <p style="margin:.75rem 0 0;color:var(--text-dim);font-size:.825rem;line-height:1.55;">Si combineu codi amb llicències diferents, comproveu-ne la compatibilitat abans de distribuir el projecte.</p>`;
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
  if (window.lucide) window.lucide.createIcons();
})();