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
  icon.textContent = theme === "dark" ? "☀️" : "🌙";
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
