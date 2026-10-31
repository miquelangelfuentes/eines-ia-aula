(() => {
  'use strict';

  const SCORE = { A: 1, B: 2, C: 3, D: 4 };
  const form = document.getElementById('diagnostic-quiz-form');
  const panel = document.getElementById('quiz-results-panel');
  if (!form || !panel) return;

  const updateScoreLabel = () => {
    const answers = [...form.querySelectorAll('.quiz-question-card')]
      .map((card) => card.querySelector('input[type="radio"]:checked')?.value)
      .filter(Boolean);
    const total = form.querySelectorAll('.quiz-question-card').length;
    if (answers.length !== total) return;

    const average = answers.reduce((sum, value) => sum + SCORE[value], 0) / total;
    const label = [...panel.querySelectorAll('span')].find((span) =>
      span.dataset.quizScoreLabel === 'true' || span.textContent.trim() === 'Diagnosi orientativa'
    );
    if (!label) return;

    label.dataset.quizScoreLabel = 'true';
    label.textContent = `Puntuació: ${average.toFixed(1).replace('.', ',')} / 4`;
  };

  const observer = new MutationObserver(updateScoreLabel);
  observer.observe(panel, { childList: true, subtree: true });
  form.addEventListener('change', () => window.setTimeout(updateScoreLabel, 0));
  document.getElementById('quiz-finish-btn')?.addEventListener('click', () => window.setTimeout(updateScoreLabel, 0));
  updateScoreLabel();
})();
