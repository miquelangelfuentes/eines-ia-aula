/* ==========================================================================
   EINES D'INTEL·LIGÈNCIA ARTIFICIAL PER A L'AULA
   Lògica interactiva: modes de visualització, eines docents i verificació
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initViewMode();
  initStepwiseNavigation();
  initCopyButtons();
  initPromptGenerator();
  initChecklist();
});

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
  icon.textContent = theme === "dark" ? "☀️" : "🌙";
}

/* 2. Selector de mode (document complet vs. pas a pas per no sobrecarregar) */
let currentMode = "guide"; // 'guide' (complet) | 'stepwise' (pas a pas)
let currentStepIndex = 0;
const sections = [];

function initViewMode() {
  const btnModeGuide = document.getElementById("btn-mode-guide");
  const btnModeStepwise = document.getElementById("btn-mode-stepwise");
  const cards = document.querySelectorAll(".block-card");

  cards.forEach((card) => {
    sections.push(card);
  });

  const savedMode = localStorage.getItem("eines-ia:mode") || "guide";
  setMode(savedMode);

  if (btnModeGuide && btnModeStepwise) {
    btnModeGuide.addEventListener("click", () => setMode("guide"));
    btnModeStepwise.addEventListener("click", () => setMode("stepwise"));
  }
}

function setMode(mode) {
  currentMode = mode;
  localStorage.setItem("eines-ia:mode", mode);
  const btnModeGuide = document.getElementById("btn-mode-guide");
  const btnModeStepwise = document.getElementById("btn-mode-stepwise");

  if (mode === "stepwise") {
    document.body.classList.add("mode-stepwise");
    btnModeStepwise?.classList.add("active");
    btnModeGuide?.classList.remove("active");
    showStep(currentStepIndex);
  } else {
    document.body.classList.remove("mode-stepwise");
    btnModeGuide?.classList.add("active");
    btnModeStepwise?.classList.remove("active");
    sections.forEach(card => card.classList.remove("step-active"));
  }
}

/* 3. Navegació del mode pas a pas */
function initStepwiseNavigation() {
  const btnPrev = document.getElementById("btn-step-prev");
  const btnNext = document.getElementById("btn-step-next");

  btnPrev?.addEventListener("click", () => navigateStep(-1));
  btnNext?.addEventListener("click", () => navigateStep(1));

  window.addEventListener("keydown", (e) => {
    if (currentMode !== "stepwise") return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;

    if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      navigateStep(1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      navigateStep(-1);
    }
  });
}

function navigateStep(delta) {
  const target = currentStepIndex + delta;
  if (target >= 0 && target < sections.length) {
    showStep(target);
  }
}

function showStep(index) {
  if (sections.length === 0) return;
  currentStepIndex = index;

  sections.forEach((sec, i) => {
    if (i === index) {
      sec.classList.add("step-active");
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      sec.classList.remove("step-active");
    }
  });

  const counter = document.getElementById("stepwise-counter-display");
  if (counter) {
    counter.textContent = `Secció ${index + 1} de ${sections.length}`;
  }

  const btnPrev = document.getElementById("btn-step-prev");
  const btnNext = document.getElementById("btn-step-next");
  if (btnPrev) btnPrev.disabled = index === 0;
  if (btnNext) btnNext.disabled = index === sections.length - 1;

  const stepNavItems = document.querySelectorAll(".step-nav-item");
  stepNavItems.forEach((item, i) => {
    if (i === index) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

/* 4. Copiar fragments de text o codi */
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

/* 5. Generador de prompts educatius per a Antigravity */
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
      btnCopy.innerText = "✓ Prompt copiat!";
      setTimeout(() => {
        btnCopy.innerText = "Copiar prompt per a Google Antigravity";
      }, 2000);
    });
  });
}

/* 6. Llista de verificació interactiva de bones pràctiques */
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
  const counterEl = document.getElementById("checklist-progress-text");
  if (counterEl) {
    counterEl.textContent = `${checked} de ${total} punts verificats`;
  }
}
