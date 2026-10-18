/* ==========================================================================
   EINES IA PER A L'AULA - Lògica interactiva de la presentació
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initViewMode();
  initSlidesNavigation();
  initSpeakerTimer();
  initCopyButtons();
  initPromptGenerator();
  initChecklist();
});

/* 1. Gestió del Tema (Clar / Fosc) */
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

/* 2. Selector de Mode (Diapositives vs Guia Completa) */
let currentMode = "guide"; // 'guide' | 'slides'
let currentSlideIndex = 0;
const slides = [];

function initViewMode() {
  const btnModeGuide = document.getElementById("btn-mode-guide");
  const btnModeSlides = document.getElementById("btn-mode-slides");
  const cards = document.querySelectorAll(".block-card");

  cards.forEach((card, idx) => {
    slides.push(card);
  });

  const savedMode = localStorage.getItem("eines-ia:mode") || "guide";
  setMode(savedMode);

  if (btnModeGuide && btnModeSlides) {
    btnModeGuide.addEventListener("click", () => setMode("guide"));
    btnModeSlides.addEventListener("click", () => setMode("slides"));
  }
}

function setMode(mode) {
  currentMode = mode;
  localStorage.setItem("eines-ia:mode", mode);
  const btnModeGuide = document.getElementById("btn-mode-guide");
  const btnModeSlides = document.getElementById("btn-mode-slides");

  if (mode === "slides") {
    document.body.classList.add("mode-slides");
    btnModeSlides?.classList.add("active");
    btnModeGuide?.classList.remove("active");
    showSlide(currentSlideIndex);
  } else {
    document.body.classList.remove("mode-slides");
    btnModeGuide?.classList.add("active");
    btnModeSlides?.classList.remove("active");
    slides.forEach(card => card.classList.remove("slide-active"));
  }
}

/* 3. Navegació de Diapositives */
function initSlidesNavigation() {
  const btnPrev = document.getElementById("btn-slide-prev");
  const btnNext = document.getElementById("btn-slide-next");

  btnPrev?.addEventListener("click", () => navigateSlide(-1));
  btnNext?.addEventListener("click", () => navigateSlide(1));

  // Teclat per avançar/retrocedir
  window.addEventListener("keydown", (e) => {
    if (currentMode !== "slides") return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;

    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault();
      navigateSlide(1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      navigateSlide(-1);
    }
  });
}

function navigateSlide(delta) {
  const target = currentSlideIndex + delta;
  if (target >= 0 && target < slides.length) {
    showSlide(target);
  }
}

function showSlide(index) {
  if (slides.length === 0) return;
  currentSlideIndex = index;

  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.add("slide-active");
      slide.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      slide.classList.remove("slide-active");
    }
  });

  const counter = document.getElementById("slides-counter-display");
  if (counter) {
    counter.textContent = `Bloc ${index + 1} de ${slides.length}`;
  }

  const btnPrev = document.getElementById("btn-slide-prev");
  const btnNext = document.getElementById("btn-slide-next");
  if (btnPrev) btnPrev.disabled = index === 0;
  if (btnNext) btnNext.disabled = index === slides.length - 1;

  // Actualitzar pas a la barra de temps
  const timelineSteps = document.querySelectorAll(".timeline-step");
  timelineSteps.forEach((step, i) => {
    if (i === index) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });
}

/* 4. Temporitzador de la Ponència (2 hores / 120 min) */
let timerSeconds = 0;
let timerInterval = null;
let isTimerRunning = false;

function initSpeakerTimer() {
  const timerDisplay = document.getElementById("timer-display");
  const btnToggleTimer = document.getElementById("btn-timer-toggle");
  const btnResetTimer = document.getElementById("btn-timer-reset");

  if (!timerDisplay) return;

  btnToggleTimer?.addEventListener("click", () => {
    if (isTimerRunning) {
      clearInterval(timerInterval);
      isTimerRunning = false;
      btnToggleTimer.textContent = "▶️";
      btnToggleTimer.title = "Començar temporitzador";
    } else {
      timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
      }, 1000);
      isTimerRunning = true;
      btnToggleTimer.textContent = "⏸️";
      btnToggleTimer.title = "Pausar";
    }
  });

  btnResetTimer?.addEventListener("click", () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerSeconds = 0;
    updateTimerDisplay();
    if (btnToggleTimer) {
      btnToggleTimer.textContent = "▶️";
    }
  });
}

function updateTimerDisplay() {
  const display = document.getElementById("timer-display");
  if (!display) return;

  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const padMins = String(mins).padStart(2, "0");
  const padSecs = String(secs).padStart(2, "0");

  display.textContent = `${padMins}:${padSecs} / 120:00`;

  // Indicació visual de temps passat
  if (mins >= 120) {
    display.style.color = "var(--accent-danger)";
  } else if (mins >= 100) {
    display.style.color = "var(--accent-warm)";
  } else {
    display.style.color = "var(--accent-primary)";
  }
}

/* 5. Copiar fragments de codi */
function initCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const codeId = btn.getAttribute("data-target");
      const targetEl = document.getElementById(codeId);
      if (!targetEl) return;

      navigator.clipboard.writeText(targetEl.innerText.trim()).then(() => {
        const orig = btn.innerText;
        btn.innerText = "✓ Copiat!";
        btn.style.background = "#059669";
        setTimeout(() => {
          btn.innerText = orig;
          btn.style.background = "";
        }, 2000);
      });
    });
  });
}

/* 6. Generador de Prompts Educatius Interactiu */
function initPromptGenerator() {
  const form = document.getElementById("prompt-generator-form");
  const resultBox = document.getElementById("generated-prompt-text");
  const btnCopy = document.getElementById("btn-copy-prompt");

  if (!form || !resultBox) return;

  function generatePrompt() {
    const materia = document.getElementById("prompt-materia")?.value || "Llengua";
    const nivell = document.getElementById("prompt-nivell")?.value || "1r d'ESO";
    const tipus = document.getElementById("prompt-tipus")?.value || "Activitat autocorrectiva";
    const dua = document.getElementById("prompt-dua")?.value || "Accessibilitat alta";
    const objectiu = document.getElementById("prompt-objectiu")?.value || "practicar el tema";

    const prompt = `Actua com a dissenyador tecnològic i expert en pedagogia.
Vull crear un recurs web educatiu d'una sola pàgina (HTML, CSS i JavaScript integrats o en fitxers senzills) per a l'aula.

🎯 **Context i Nivell:** ${nivell} - Matèria: ${materia}
🧩 **Tipus de Recurs:** ${tipus}
🎯 **Objectiu d'aprenentatge:** ${objectiu}

📋 **Requisits de Vibe Coding Responsable i DUA:**
1. **Zero dades personals:** L'alumnat no s'ha d'identificar ni registrar. Tot s'executa al navegador en local (Client-side).
2. **Accessibilitat (DUA):** ${dua}. Colors amb alt contrast (WCAG AA), text gran i llegible, navegable per teclat i compatible amb mòbil/tauleta.
3. **Pedagogia rigorosa:** Contingut exacte, sense al·lucinacions, amb retroacció explicativa quan l'alumne s'equivoca.
4. **Independència tecnològica:** Sense enllaços externs a imatges fràgils; utilitza icones SVG inline o estils CSS purs.
5. **Codi obert:** Deixa el codi net, ben comentat i inclou una declaració d'ús d'IA i llicència Creative Commons BY-SA al peu.

Si us plau, genera el codi complet llest per provar i publicar directament a GitHub Pages.`;

    resultBox.textContent = prompt;
  }

  form.addEventListener("input", generatePrompt);
  form.addEventListener("change", generatePrompt);
  generatePrompt();

  btnCopy?.addEventListener("click", () => {
    navigator.clipboard.writeText(resultBox.textContent).then(() => {
      btnCopy.innerText = "✓ Prompt copiat!";
      setTimeout(() => {
        btnCopy.innerText = "📋 Copiar Prompt per a Google Antigravity";
      }, 2000);
    });
  });
}

/* 7. Checklist interactiva de Vibe Coding Responsable */
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
    counterEl.textContent = `${checked} de ${total} recomanacions complertes`;
  }
}
