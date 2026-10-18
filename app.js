/* ==========================================================================
   EINES D'INTEL·LIGÈNCIA ARTIFICIAL PER A L'AULA
   Lògica per al lloc web multipàgina: tema, dreceres de teclat i eines
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initLucide();
  initPrintMenu();
  initKeyboardNavigation();
  initCopyButtons();
  initPromptGenerator();
  initChecklist();
  initDiagnosticQuiz();
});

function initLucide() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

/* 1. Gestió del tema (clar o fosc) */
function initTheme() {
  const themeToggle = document.getElementById("btn-toggle-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("eines-ia:theme") || (prefersDark ? "dark" : "light");

  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("eines-ia:theme", next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("theme-icon");
  if (!icon) return;
  icon.innerHTML = theme === "dark" 
    ? '<i data-lucide="sun"></i>' 
    : '<i data-lucide="moon"></i>';
  initLucide();
}

/* 2. Navegació amb tecles de fletxa entre blocs (ideal per a la xerrada) */
function initKeyboardNavigation() {
  const linkPrev = document.querySelector('link[rel="prev"]') || document.querySelector('.btn-pagination[data-nav="prev"]');
  const linkNext = document.querySelector('link[rel="next"]') || document.querySelector('.btn-pagination[data-nav="next"]');

  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;

    if (e.key === "ArrowRight" && linkNext) {
      window.location.href = linkNext.getAttribute("href");
    } else if (e.key === "ArrowLeft" && linkPrev) {
      window.location.href = linkPrev.getAttribute("href");
    }
  });
}

/* 3. Copiar fragments de codi o textos */
function initCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const codeId = btn.getAttribute("data-target");
      const targetEl = document.getElementById(codeId);
      if (!targetEl) return;

      navigator.clipboard.writeText(targetEl.innerText.trim()).then(() => {
        const orig = btn.innerText;
        btn.innerText = "✓ Copiat!";
        btn.style.background = "#0f766e";
        setTimeout(() => {
          btn.innerText = orig;
          btn.style.background = "";
        }, 2000);
      });
    });
  });
}

/* 4. Formulari generador d'indicacions per a Antigravity */
function initPromptGenerator() {
  const form = document.getElementById("prompt-generator-form");
  const resultBox = document.getElementById("generated-prompt-text");
  const btnCopy = document.getElementById("btn-copy-prompt");

  if (!form || !resultBox) return;

  function generatePrompt() {
    const materia = document.getElementById("prompt-materia")?.value || "Llengua catalana";
    const nivell = document.getElementById("prompt-nivell")?.value || "1r d'ESO";
    const tipus = document.getElementById("prompt-tipus")?.value || "Activitat autocorrectiva";
    const dua = document.getElementById("prompt-dua")?.value || "Accessibilitat alta";
    const objectiu = document.getElementById("prompt-objectiu")?.value || "practicar el contingut";

    const prompt = `Actua com a dissenyador tecnològic i expert en pedagogia.
Vull crear un recurs web educatiu d'una sola pàgina (HTML, CSS i JavaScript integrats o en fitxers senzills) per a l'aula.

Context i nivell: ${nivell} — matèria: ${materia}
Tipus de recurs: ${tipus}
Objectiu pedagògic: ${objectiu}

Requisits de bones pràctiques i accessibilitat (DUA):
1. Protecció de dades: l'alumnat no s'ha d'identificar ni registrar. Tot s'executa al navegador en local.
2. Accessibilitat: ${dua}. Colors amb alt contrast (WCAG AA) i bona navegació per teclat o mòbils.
3. Rigor: contingut exacte, sense invencions de dades, amb retroacció explicativa quan l'alumne s'equivoca.
4. Independència: sense enllaços externs a imatges fràgils; utilitzar estils CSS nets o icones SVG bàsiques.
5. Codi obert: codi net i ben comentat, amb peu de pàgina de transparència d'ús d'IA i llicència Creative Commons BY-SA per al contingut i llicència MIT per al codi.

Genera el codi complet i llest per desar a la carpeta local i publicar a GitHub Pages.`;

    resultBox.textContent = prompt;
  }

  form.addEventListener("input", generatePrompt);
  form.addEventListener("change", generatePrompt);
  generatePrompt();

  btnCopy?.addEventListener("click", () => {
    navigator.clipboard.writeText(resultBox.textContent).then(() => {
      btnCopy.innerText = "✓ Indicació copiada!";
      setTimeout(() => {
        btnCopy.innerText = "Copiar indicació per a Google Antigravity";
      }, 2000);
    });
  });
}

/* 5. Llista de verificació interactiva de bones pràctiques */
function initChecklist() {
  const checkboxes = document.querySelectorAll(".vibe-checklist-input");
  const savedChecks = JSON.parse(localStorage.getItem("eines-ia:checklist") || "{}");

  checkboxes.forEach((cb) => {
    const id = cb.id;
    if (savedChecks[id]) {
      cb.checked = true;
      cb.closest(".check-item")?.classList.add("checked");
    }

    cb.addEventListener("change", () => {
      savedChecks[id] = cb.checked;
      localStorage.setItem("eines-ia:checklist", JSON.stringify(savedChecks));
      if (cb.checked) {
        cb.closest(".check-item")?.classList.add("checked");
      } else {
        cb.closest(".check-item")?.classList.remove("checked");
      }
      updateChecklistProgress();
    });
  });

  updateChecklistProgress();

  document.getElementById("btn-reset-checklist")?.addEventListener("click", () => {
    checkboxes.forEach(cb => {
      cb.checked = false;
      cb.closest(".check-item")?.classList.remove("checked");
    });
    localStorage.removeItem("eines-ia:checklist");
    updateChecklistProgress();
  });
}

function updateChecklistProgress() {
  const total = document.querySelectorAll(".vibe-checklist-input").length;
  const checked = document.querySelectorAll(".vibe-checklist-input:checked").length;
  const countEl = document.getElementById("checklist-progress-count");
  const counterEl = document.getElementById("checklist-progress-text");
  if (countEl) {
    countEl.textContent = `${checked} de ${total} punts verificats`;
  } else if (counterEl) {
    counterEl.textContent = `${checked} de ${total} punts verificats`;
  }
}

/* 6. Qüestionari de coneixements previs per a docents */
function initDiagnosticQuiz() {
  const container = document.getElementById("diagnostic-quiz-section");
  const form = document.getElementById("diagnostic-quiz-form");
  const resultsPanel = document.getElementById("quiz-results-panel");
  const progressText = document.getElementById("quiz-progress-text");
  const progressPercent = document.getElementById("quiz-progress-percent");
  const progressFill = document.getElementById("quiz-progress-fill");
  const stepperPills = document.getElementById("quiz-stepper-pills");
  const btnPrev = document.getElementById("quiz-prev-btn");
  const btnNext = document.getElementById("quiz-next-btn");
  const btnFinish = document.getElementById("quiz-finish-btn");
  const btnToggleView = document.getElementById("btn-toggle-view");
  const btnReset = document.getElementById("btn-reset-quiz");
  const statusEl = document.getElementById("quiz-nav-status");

  if (!container || !form || !resultsPanel) return;

  const storageKey = "eines-ia:diagnostic-quiz";
  const savedAnswers = JSON.parse(localStorage.getItem(storageKey) || "{}");
  const questions = Array.from(form.querySelectorAll(".quiz-question-card"));
  const totalQ = questions.length;
  let currentStep = 1;
  let isWizard = true;

  container.classList.add("is-wizard");

  // Crear o inicialitzar les pastilles de navegació (1..10)
  if (stepperPills && stepperPills.children.length === 0) {
    for (let i = 1; i <= totalQ; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `quiz-step-btn ${i === 1 ? "active" : ""}`;
      btn.dataset.step = i;
      btn.textContent = i;
      btn.title = `Anar a la pregunta ${i}`;
      btn.setAttribute("aria-label", `Anar a la pregunta ${i}`);
      btn.addEventListener("click", () => {
        goToStep(i);
      });
      stepperPills.appendChild(btn);
    }
  }

  // Restaurar respostes desades prèviament
  Object.keys(savedAnswers).forEach((qName) => {
    const val = savedAnswers[qName];
    const radio = form.querySelector(`input[name="${qName}"][value="${val}"]`);
    if (radio) {
      radio.checked = true;
      const card = radio.closest(".quiz-question-card");
      card?.classList.add("answered");
      const optCard = radio.closest(".quiz-option-card");
      optCard?.classList.add("selected");
    }
  });

  function updateWizardView() {
    questions.forEach((card, idx) => {
      const qNum = idx + 1;
      if (qNum === currentStep) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });

    const stepBtns = stepperPills?.querySelectorAll(".quiz-step-btn") || [];
    stepBtns.forEach((btn, idx) => {
      const stepNum = idx + 1;
      if (stepNum === currentStep) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    if (statusEl) {
      statusEl.textContent = `Pregunta ${currentStep} de ${totalQ}`;
    }

    if (btnPrev) {
      btnPrev.disabled = (currentStep === 1);
    }

    if (btnNext) {
      btnNext.style.display = (currentStep === totalQ) ? "none" : "inline-flex";
    }

    if (btnFinish) {
      btnFinish.style.display = (currentStep === totalQ || countAnswered() >= 3) ? "inline-flex" : "none";
    }
  }

  function goToStep(step) {
    if (step < 1) step = 1;
    if (step > totalQ) step = totalQ;
    currentStep = step;
    updateWizardView();
    if (isWizard) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function countAnswered() {
    return form.querySelectorAll('input[type="radio"]:checked').length;
  }

  function calculateAndRender(scrollToResult = false) {
    let answeredCount = 0;
    let scoreSum = 0;
    const currentAnswers = {};
    const weakAreas = [];

    questions.forEach((card, index) => {
      const qNum = index + 1;
      const qName = `q${qNum}`;
      const checked = card.querySelector(`input[name="${qName}"]:checked`);
      const stepBtn = stepperPills?.querySelector(`.quiz-step-btn[data-step="${qNum}"]`);

      if (checked) {
        answeredCount++;
        card.classList.add("answered");
        if (stepBtn) stepBtn.classList.add("answered");

        const val = checked.value;
        currentAnswers[qName] = val;

        const valScore = val === "A" ? 1 : val === "B" ? 2 : val === "C" ? 3 : 4;
        scoreSum += valScore;

        if (valScore <= 2) {
          weakAreas.push(qNum);
        }
      } else {
        card.classList.remove("answered");
        if (stepBtn) stepBtn.classList.remove("answered");
      }
    });

    localStorage.setItem(storageKey, JSON.stringify(currentAnswers));

    const percent = Math.round((answeredCount / totalQ) * 100);
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressPercent) progressPercent.textContent = `${percent}%`;

    if (progressText) {
      if (answeredCount === totalQ) {
        progressText.innerHTML = `<strong>10 de 10 preguntes respostes</strong> (completat)`;
      } else {
        progressText.textContent = `${answeredCount} de ${totalQ} preguntes respostes`;
      }
    }

    if (btnFinish) {
      btnFinish.style.display = (answeredCount >= 3 || currentStep === totalQ) ? "inline-flex" : "none";
    }

    if (answeredCount === 0) {
      resultsPanel.style.display = "none";
      return;
    }

    // Calcular perfil i recomanacions
    const avgScore = scoreSum / answeredCount;
    let profileKey = "inicial";
    let profileTitle = "Perfil inicial: descoberta i primers passos pràctics";
    let profileDesc = "Teniu una gran oportunitat per davant. Aquesta sessió us permetrà perdre la por al codi i descobrir que podeu crear eines interactives de gran valor educatiu sense haver après programació clàssica.";
    let recommendedModules = [];
    let reinforcementPoints = [];
    let extensionPoints = [];

    if (avgScore < 2.2) {
      profileKey = "inicial";
      profileTitle = "Perfil inicial: descoberta i primers passos pràctics";
      profileDesc = "Teniu una gran oportunitat per davant. Aquesta sessió us permetrà perdre la por al codi i descobrir que podeu crear eines interactives de gran valor educatiu sense haver après programació clàssica.";

      recommendedModules = [
        `<strong><a href="bloc1-marc.html">Bloc 1: marc (de consultar a crear)</a></strong>: per comprendre la filosofia de treball i el paper de l'agent com a assistent de disseny.`,
        `<strong><a href="bloc2-antigravity.html">Bloc 2: Google Antigravity pas a pas</a></strong>: guia d'instal·lació al vostre ordinador (inclòs el portàtil del PEDC) i ús de l'assistent interactiu d'indicacions.`,
        `<strong><a href="bloc3-github.html">Bloc 3: configuració de GitHub</a></strong>: com crear el vostre primer repositori i activar GitHub Pages en tres clics sense comandes de terminal.`,
        `<strong><a href="bloc4-pages-sites.html">Bloc 4: Pages i Google Sites</a></strong>: per veure per què les pàgines obertes són molt més àgils i interactives que Google Sites.`
      ];

      reinforcementPoints = [
        `Reviseu per què el fitxer principal s'ha d'anomenar <code>index.html</code> i com escriure rutes relatives a <a href="bloc3-github.html">bloc 3 (GitHub)</a>.`,
        `Feu servir la llista de verificació de 10 punts abans d'enviar el recurs al grup classe a <a href="bloc8-verificacio.html">bloc 8 (verificació)</a>.`
      ];

      extensionPoints = [
        `Quan tingueu la vostra primera activitat publicada, consulteu <a href="bloc5-llicencies.html">bloc 5 (llicències)</a> per conèixer com compartir amb Creative Commons i llicència MIT.`,
        `Exploreu alternatives visuals lliures per no dependre de generadors d'imatges a <a href="bloc6-recursos-visuals.html">bloc 6 (imatges i icones)</a>.`
      ];
    } else if (avgScore < 3.2) {
      profileKey = "intermedi";
      profileTitle = "Perfil intermedi: consolidació de bones pràctiques i autonomia";
      profileDesc = "Compteu amb una bona base digital. La sessió us aportarà el rigor tècnic i metodològic que us falta per deixar enrere plataformes tancades i dissenyar recursos oberts i accessibles.";

      recommendedModules = [
        `<strong><a href="bloc4-pages-sites.html">Bloc 4: GitHub Pages i Google Sites</a></strong>: anàlisi detallada dels avantatges d'independència i reutilització real.`,
        `<strong><a href="bloc5-llicencies.html">Bloc 5: llicències (Creative Commons i codi)</a></strong>: com combinar la llicència MIT per al codi font amb CC BY-SA 4.0 per als continguts pedagògics.`,
        `<strong><a href="bloc6-recursos-visuals.html">Bloc 6: imatges i icones en comptes d'IA</a></strong>: la regla TASL per citar fotografies de bancs lliures i l'ús d'icones Lucide sense carregar la pàgina.`,
        `<strong><a href="bloc7-bones-practiques.html">Bloc 7: bones pràctiques i privacitat a l'aula</a></strong>: criteris de privacitat estricta (sense registre de l'alumnat) i pautes del DUA.`
      ];

      reinforcementPoints = [
        `Si preferiu gestionar carpetes sense tocar la terminal, reviseu l'apartat de GitHub Desktop a <a href="bloc3-github.html">bloc 3 (GitHub)</a>.`,
        `Auditeu qualsevol material creat passant la llista de comprovació a <a href="bloc8-verificacio.html">bloc 8 (verificació)</a>.`
      ];

      extensionPoints = [
        `Exploreu els models d'intel·ligència artificial que s'executen en local i en català (Ollama, LM Studio, Rebost.ai, Projecte AINA) a <a href="bloc9-per-continuar-explorant.html">bloc 9 (IA local)</a>.`
      ];
    } else {
      profileKey = "avancat";
      profileTitle = "Perfil avançat: disseny educatiu obert i exploració d'IA local";
      profileDesc = "Teniu una trajectòria àmplia i domini dels entorns digitals. Aquesta ponència us permetrà perfeccionar el vostre flux de creació i explorar fronteres com la IA local.";

      recommendedModules = [
        `<strong><a href="bloc6-recursos-visuals.html">Bloc 6: imatges i icones</a></strong> i <strong><a href="bloc7-bones-practiques.html">Bloc 7: bones pràctiques</a></strong>: rigor en la citació TASL i compliment de pautes DUA.`,
        `<strong><a href="bloc8-verificacio.html">Bloc 8: llista de verificació</a></strong>: model d'auditoria transferible a altres docents del vostre departament o claustre.`,
        `<strong><a href="bloc9-per-continuar-explorant.html">Bloc 9: per continuar explorant (IA local)</a></strong>: eines d'IA que funcionen 100% en local a l'ordinador (Ollama, LM Studio), models en català de Projecte AINA i Rebost.ai.`
      ];

      reinforcementPoints = [
        `Reviseu el generador guiat d'indicacions per a Google Antigravity a <a href="bloc2-antigravity.html">bloc 2 (Antigravity)</a> per optimitzar l'estructura pedagògica de les vostres indicacions.`,
        `Assegureu la doble llicència (MIT per codi i CC BY-SA 4.0 per a continguts) explicada a <a href="bloc5-llicencies.html">bloc 5 (llicències)</a>.`
      ];

      extensionPoints = [
        `Creació de plantilles de repositoris reutilitzables per a tot el centre educatiu i muntatge d'activitats sense connexió per a aules sense xarxa a Internet.`
      ];
    }

    if (weakAreas.includes(1) || weakAreas.includes(2)) {
      reinforcementPoints.push(`Instal·lació sense privilegis d'administració: consulteu com instal·lar Google Antigravity al vostre portàtil del PEDC al <a href="bloc2-antigravity.html">bloc 2</a>.`);
    }
    if (weakAreas.includes(3)) {
      reinforcementPoints.push(`Redacció d'indicacions pedagògiques: feu servir l'assistent interactiu i les quatre pautes docents al <a href="bloc2-antigravity.html">bloc 2</a>.`);
    }
    if (weakAreas.includes(4) || weakAreas.includes(5) || weakAreas.includes(6)) {
      reinforcementPoints.push(`Desplegament web: reviseu com activar GitHub Pages i la regla del fitxer <code>index.html</code> al <a href="bloc3-github.html">bloc 3</a>.`);
    }
    if (weakAreas.includes(7)) {
      reinforcementPoints.push(`Diferenciació legal: distingiu les llicències per a contingut docent (Creative Commons) de les de codi (MIT) al <a href="bloc5-llicencies.html">bloc 5</a>.`);
    }
    if (weakAreas.includes(8) || weakAreas.includes(9)) {
      reinforcementPoints.push(`Cultura visual i citació: practiqueu la regla TASL i descobriu com utilitzar icones vectorials lliures al <a href="bloc6-recursos-visuals.html">bloc 6</a>.`);
    }
    if (weakAreas.includes(10)) {
      reinforcementPoints.push(`Privacitat i IA local: consulteu com executar models al vostre propi equip sense enviar dades al núvol al <a href="bloc9-per-continuar-explorant.html">bloc 9</a>.`);
    }

    resultsPanel.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
        <span class="quiz-profile-badge ${profileKey}">
          <i data-lucide="award" style="width: 16px; height: 16px;"></i>
          ${profileTitle}
        </span>
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
          Puntuació mitjana: ${avgScore.toFixed(1)} / 4.0 (${answeredCount} de ${totalQ} respostes)
        </span>
      </div>

      <p style="margin: 0.85rem 0 1.25rem 0; font-size: 0.95rem; line-height: 1.6; color: var(--text-main);">
        ${profileDesc}
      </p>

      <div class="quiz-recommendations-grid">
        <div class="quiz-rec-card">
          <div>
            <h4><i data-lucide="book-marked" style="width: 18px; height: 18px; color: var(--accent-secondary);"></i>Mòduls més rellevants</h4>
            <ul>
              ${recommendedModules.map(m => `<li>${m}</li>`).join("")}
            </ul>
          </div>
        </div>

        <div class="quiz-rec-card">
          <div>
            <h4><i data-lucide="check-circle" style="width: 18px; height: 18px; color: var(--accent-primary);"></i>Reforços recomanats</h4>
            <ul>
              ${reinforcementPoints.map(r => `<li>${r}</li>`).join("")}
            </ul>
          </div>
        </div>

        <div class="quiz-rec-card">
          <div>
            <h4><i data-lucide="sparkles" style="width: 18px; height: 18px; color: var(--accent-warm);"></i>Opcions d'ampliació</h4>
            <ul>
              ${extensionPoints.map(e => `<li>${e}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding-top: 1rem; border-top: 1px solid var(--border-color);">
        <button type="button" id="btn-revisit-quiz" class="quiz-nav-btn">
          <i data-lucide="edit-3"></i> Modificar respostes
        </button>
        <a href="${profileKey === 'inicial' ? 'bloc1-marc.html' : profileKey === 'intermedi' ? 'bloc4-pages-sites.html' : 'bloc6-recursos-visuals.html'}" class="quiz-nav-btn primary">
          <span>Començar l'itinerari recomanat</span> ▶
        </a>
      </div>
    `;

    resultsPanel.style.display = "block";
    initLucide();

    document.getElementById("btn-revisit-quiz")?.addEventListener("click", () => {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    if (scrollToResult) {
      resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Canvis en seleccionar opcions
  form.addEventListener("change", (e) => {
    if (e.target.matches('input[type="radio"]')) {
      const card = e.target.closest(".quiz-question-card");
      card?.classList.add("answered");

      const optCards = card.querySelectorAll(".quiz-option-card");
      optCards.forEach(l => l.classList.remove("selected"));
      e.target.closest(".quiz-option-card")?.classList.add("selected");

      calculateAndRender(false);

      // Si estem en mode pas a pas i no és l'última, avançar suaument
      if (isWizard && currentStep < totalQ) {
        setTimeout(() => {
          goToStep(currentStep + 1);
        }, 320);
      } else if (currentStep === totalQ) {
        if (btnFinish) btnFinish.style.display = "inline-flex";
      }
    }
  });

  // Botons de navegació pas a pas
  btnPrev?.addEventListener("click", () => {
    goToStep(currentStep - 1);
  });

  btnNext?.addEventListener("click", () => {
    goToStep(currentStep + 1);
  });

  btnFinish?.addEventListener("click", () => {
    calculateAndRender(true);
  });

  // Commutador de mode (pas a pas o totes les preguntes)
  btnToggleView?.addEventListener("click", () => {
    isWizard = !isWizard;
    if (isWizard) {
      container.classList.add("is-wizard");
      btnToggleView.innerHTML = '<i data-lucide="layout-list"></i> <span>Desplegar totes les preguntes</span>';
      goToStep(currentStep);
    } else {
      container.classList.remove("is-wizard");
      btnToggleView.innerHTML = '<i data-lucide="layers"></i> <span>Mode pas a pas</span>';
    }
    initLucide();
  });

  // Botó de reinici
  btnReset?.addEventListener("click", () => {
    form.reset();
    form.querySelectorAll(".quiz-option-card").forEach(l => l.classList.remove("selected"));
    form.querySelectorAll(".quiz-question-card").forEach(c => {
      c.classList.remove("answered");
    });
    stepperPills?.querySelectorAll(".quiz-step-btn").forEach(b => {
      b.classList.remove("answered");
    });
    localStorage.removeItem(storageKey);
    resultsPanel.style.display = "none";
    goToStep(1);
    calculateAndRender(false);
  });

  // Inicialització inicial
  updateWizardView();
  calculateAndRender(false);
}

/* ==========================================================================
   8. Menú d'impressió (pàgina actual o presentació completa)
   ========================================================================== */
function initPrintMenu() {
  const btnPrintMenu = document.getElementById("btn-print-menu");
  const dropdown = document.getElementById("print-dropdown");
  const btnPrintPage = document.getElementById("btn-print-page");

  if (!btnPrintMenu || !dropdown) return;

  function toggleDropdown(show) {
    const isExpanded = show !== undefined ? show : !dropdown.classList.contains("show");
    dropdown.classList.toggle("show", isExpanded);
    btnPrintMenu.setAttribute("aria-expanded", isExpanded ? "true" : "false");
  }

  btnPrintMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  if (btnPrintPage) {
    btnPrintPage.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDropdown(false);
      window.print();
    });
  }

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== btnPrintMenu) {
      toggleDropdown(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toggleDropdown(false);
    }
  });

  // Si és la pàgina imprimir-tot.html amb paràmetre print=1, activar la impressió automàtica
  if (window.location.pathname.includes("imprimir-tot.html") && window.location.search.includes("print=1")) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        window.print();
      }, 700);
    });
  }
}

