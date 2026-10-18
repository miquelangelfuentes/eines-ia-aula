/* ==========================================================================
   EINES D'INTEL·LIGÈNCIA ARTIFICIAL PER A L'AULA
   Lògica per al lloc web multipàgina: tema, dreceres de teclat i eines
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initLucide();
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
2. Accessibilitat: ${dua}. Colors amb alt contrast (WCAG AA), text gran i llegible, navegable per teclat i adaptable a mòbils.
3. Rigor: contingut exacte, sense invencions de dades, amb retroacció explicativa quan l'alumne s'equivoca.
4. Independència: sense enllaços externs a imatges fràgils; utilitza estils CSS nets o icones SVG bàsiques.
5. Codi obert: codi net, ben estructurat i comentat, amb peu de pàgina de transparència d'ús d'IA i llicència Creative Commons BY-SA per al contingut i llicència MIT per al codi.

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
  const form = document.getElementById("diagnostic-quiz-form");
  const resultsPanel = document.getElementById("quiz-results-panel");
  const progressText = document.getElementById("quiz-progress-text");
  const btnReset = document.getElementById("btn-reset-quiz");

  if (!form || !resultsPanel) return;

  const storageKey = "eines-ia:diagnostic-quiz";
  const savedAnswers = JSON.parse(localStorage.getItem(storageKey) || "{}");

  // Restaurar respostes guardades prèviament
  Object.keys(savedAnswers).forEach((qName) => {
    const val = savedAnswers[qName];
    const radio = form.querySelector(`input[name="${qName}"][value="${val}"]`);
    if (radio) {
      radio.checked = true;
      radio.closest(".quiz-option-label")?.classList.add("selected");
      radio.closest(".quiz-question-card")?.classList.add("answered");
    }
  });

  function calculateAndRender() {
    const questions = form.querySelectorAll(".quiz-question-card");
    const totalQ = questions.length;
    let answeredCount = 0;
    let scoreSum = 0;
    const currentAnswers = {};
    const weakAreas = [];

    questions.forEach((card, index) => {
      const qNum = index + 1;
      const qName = `q${qNum}`;
      const checked = card.querySelector(`input[name="${qName}"]:checked`);

      if (checked) {
        answeredCount++;
        const val = checked.value;
        currentAnswers[qName] = val;

        const valScore = val === "A" ? 1 : val === "B" ? 2 : val === "C" ? 3 : 4;
        scoreSum += valScore;

        if (valScore <= 2) {
          weakAreas.push(qNum);
        }
      }
    });

    localStorage.setItem(storageKey, JSON.stringify(currentAnswers));

    if (progressText) {
      if (answeredCount === totalQ) {
        progressText.innerHTML = `<strong>10 de 10 preguntes respostes</strong> (completat)`;
      } else {
        progressText.textContent = `${answeredCount} de ${totalQ} preguntes respostes`;
      }
    }

    if (answeredCount === 0) {
      resultsPanel.style.display = "none";
      return;
    }

    resultsPanel.style.display = "block";

    const avgScore = scoreSum / answeredCount;
    let profileKey = "inicial";
    let profileTitle = "Perfil inicial: descoberta i primers passos pràctics";
    let profileDesc = "Tens una gran oportunitat per davant. Aquesta sessió et permetrà perdre la por al codi i descobrir que pots crear eines interactives de gran valor educatiu sense haver après programació clàssica.";
    let recommendedModules = [];
    let reinforcementPoints = [];
    let extensionPoints = [];

    if (avgScore < 2.2) {
      profileKey = "inicial";
      profileTitle = "Perfil inicial: descoberta i primers passos pràctics";
      profileDesc = "Tens una gran oportunitat per davant. Aquesta sessió et permetrà perdre la por al codi i descobrir que pots crear eines interactives de gran valor educatiu sense haver après programació clàssica.";

      recommendedModules = [
        `<strong><a href="bloc1-marc.html">Bloc 1: marc (de consultar a crear)</a></strong>: per comprendre la filosofia de treball i el paper de l'agent com a assistent de disseny.`,
        `<strong><a href="bloc2-antigravity.html">Bloc 2: Google Antigravity pas a pas</a></strong>: guia d'instal·lació al teu ordinador (inclòs el portàtil del PEDC) i ús de l'assistent interactiu d'indicacions.`,
        `<strong><a href="bloc3-github.html">Bloc 3: configuració de GitHub</a></strong>: com crear el teu primer repositori i activar GitHub Pages en tres clics sense comandes de terminal.`,
        `<strong><a href="bloc4-pages-sites.html">Bloc 4: Pages i Google Sites</a></strong>: per veure per què les pàgines obertes són molt més àgils i interactives que Google Sites.`
      ];

      reinforcementPoints = [
        `Revisa per què el fitxer principal s'ha d'anomenar <code>index.html</code> i com escriure rutes relatives a <a href="bloc3-github.html">bloc 3 (GitHub)</a>.`,
        `Fes servir la llista de verificació de 10 punts abans d'enviar el recurs al grup classe a <a href="bloc8-verificacio.html">bloc 8 (verificació)</a>.`
      ];

      extensionPoints = [
        `Quan tinguis la teva primera activitat publicada, consulta <a href="bloc5-llicencies.html">bloc 5 (llicències)</a> per conèixer com compartir amb Creative Commons i llicència MIT.`,
        `Explora alternatives visuals lliures per no dependre de generadors d'imatges a <a href="bloc6-recursos-visuals.html">bloc 6 (imatges i icones)</a>.`
      ];
    } else if (avgScore < 3.2) {
      profileKey = "intermedi";
      profileTitle = "Perfil intermedi: consolidació de bones pràctiques i autonomia";
      profileDesc = "Comptes amb una bona base digital. La sessió t'aportarà el rigor tècnic i metodològic que et falta per deixar enrere plataformes tancades, aplicar llicències obertes i dissenyar recursos accessibles.";

      recommendedModules = [
        `<strong><a href="bloc4-pages-sites.html">Bloc 4: GitHub Pages i Google Sites</a></strong>: anàlisi detallada dels avantatges d'independència, velocitat i reutilització real.`,
        `<strong><a href="bloc5-llicencies.html">Bloc 5: llicències (Creative Commons i codi)</a></strong>: com combinar la llicència MIT per al codi font amb CC BY-SA 4.0 per als continguts pedagògics.`,
        `<strong><a href="bloc6-recursos-visuals.html">Bloc 6: imatges i icones en comptes d'IA</a></strong>: la regla TASL per citar fotografies de bancs lliures i l'ús d'icones Lucide sense carregar la pàgina.`,
        `<strong><a href="bloc7-bones-practiques.html">Bloc 7: bones pràctiques i privacitat a l'aula</a></strong>: criteris de privacitat estricta (sense registre de l'alumnat) i pautes del DUA.`
      ];

      reinforcementPoints = [
        `Si prefereixes gestionar carpetes sense tocar la terminal, revisa l'apartat de GitHub Desktop a <a href="bloc3-github.html">bloc 3 (GitHub)</a>.`,
        `Audita qualsevol material creat passant la llista de comprovació a <a href="bloc8-verificacio.html">bloc 8 (verificació)</a>.`
      ];

      extensionPoints = [
        `Explora els models d'intel·ligència artificial que s'executen en local i en català (Ollama, LM Studio, Rebost.ai, Projecte AINA) a <a href="bloc9-per-continuar-explorant.html">bloc 9 (IA local)</a>.`
      ];
    } else {
      profileKey = "avancat";
      profileTitle = "Perfil avançat: disseny educatiu obert i exploració d'IA local";
      profileDesc = "Tens una trajectòria àmplia i domini dels entorns digitals. Aquesta ponència et permetrà perfeccionar el teu flux de creació, assegurar l'ètica i accessibilitat dels materials i explorar noves fronteres com la IA local.";

      recommendedModules = [
        `<strong><a href="bloc6-recursos-visuals.html">Bloc 6: imatges i icones</a></strong> i <strong><a href="bloc7-bones-practiques.html">Bloc 7: bones pràctiques</a></strong>: rigor en la citació TASL, accessibilitat DUA i transparència en l'ús d'IA.`,
        `<strong><a href="bloc8-verificacio.html">Bloc 8: llista de verificació</a></strong>: model d'auditoria transferible a altres docents del teu departament o claustre.`,
        `<strong><a href="bloc9-per-continuar-explorant.html">Bloc 9: per continuar explorant (IA local)</a></strong>: eines d'IA que funcionen 100% en local a l'ordinador (Ollama, LM Studio), models en català de Projecte AINA i Rebost.ai.`
      ];

      reinforcementPoints = [
        `Revisa el generador guiat d'indicacions per a Google Antigravity a <a href="bloc2-antigravity.html">bloc 2 (Antigravity)</a> per optimitzar l'estructura pedagògica de les teves peticions.`,
        `Assegura la doble llicència (MIT per codi i CC BY-SA 4.0 per a continguts) explicada a <a href="bloc5-llicencies.html">bloc 5 (llicències)</a>.`
      ];

      extensionPoints = [
        `Creació de plantilles de repositoris reutilitzables per a tot el centre educatiu i muntatge d'activitats sense connexió per a aules sense xarxa a Internet.`
      ];
    }

    // Reforços específics per preguntes amb respostes A o B
    if (weakAreas.includes(1) || weakAreas.includes(2)) {
      reinforcementPoints.push(`Instal·lació sense privilegis d'administració: consulta com instal·lar Google Antigravity al teu portàtil del PEDC al <a href="bloc2-antigravity.html">bloc 2</a>.`);
    }
    if (weakAreas.includes(4) || weakAreas.includes(5) || weakAreas.includes(6)) {
      reinforcementPoints.push(`Desplegament web: revisa com activar GitHub Pages i la regla del fitxer <code>index.html</code> al <a href="bloc3-github.html">bloc 3</a>.`);
    }
    if (weakAreas.includes(7)) {
      reinforcementPoints.push(`Diferenciació legal: distingeix les llicències per a contingut docent (Creative Commons) de les de codi (MIT) al <a href="bloc5-llicencies.html">bloc 5</a>.`);
    }
    if (weakAreas.includes(8) || weakAreas.includes(9)) {
      reinforcementPoints.push(`Cultura visual i citació: practica la regla TASL i descobreix com utilitzar icones vectorials lliures al <a href="bloc6-recursos-visuals.html">bloc 6</a>.`);
    }
    if (weakAreas.includes(10)) {
      reinforcementPoints.push(`Privacitat i IA local: consulta com executar models al teu propi equip sense enviar dades al núvol al <a href="bloc9-per-continuar-explorant.html">bloc 9</a>.`);
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

      <p style="margin: 0.75rem 0 1.25rem 0; font-size: 0.95rem; line-height: 1.6; color: var(--text-main);">
        ${profileDesc}
      </p>

      <div class="quiz-recommendations-grid">
        <div class="quiz-rec-card">
          <div>
            <h4><i data-lucide="book-marked" style="width: 18px; height: 18px; color: var(--accent-secondary);"></i>Mòduls més rellevants per a tu</h4>
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
    `;

    initLucide();
  }

  form.addEventListener("change", (e) => {
    if (e.target.matches('input[type="radio"]')) {
      const card = e.target.closest(".quiz-question-card");
      card?.classList.add("answered");

      const labels = card.querySelectorAll(".quiz-option-label");
      labels.forEach(l => l.classList.remove("selected"));
      e.target.closest(".quiz-option-label")?.classList.add("selected");

      calculateAndRender();
    }
  });

  btnReset?.addEventListener("click", () => {
    form.reset();
    form.querySelectorAll(".quiz-option-label").forEach(l => l.classList.remove("selected"));
    form.querySelectorAll(".quiz-question-card").forEach(c => c.classList.remove("answered"));
    localStorage.removeItem(storageKey);
    calculateAndRender();
  });

  if (Object.keys(savedAnswers).length > 0) {
    calculateAndRender();
  }
}
