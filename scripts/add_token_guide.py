from pathlib import Path

path = Path('bloc3-github.html')
text = path.read_text(encoding='utf-8')
needle = '''      </div>\n\n      <h3 style="margin-top: 2rem; margin-bottom: 0.75rem;">Com activar GitHub Pages en 3 clics:</h3>'''
replacement = '''      </div>\n\n      <div style="margin-top: 1rem; margin-bottom: 2rem; padding: 0.85rem 1.15rem; background: var(--bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">\n        <span style="font-size: 0.875rem; color: var(--text-main); display: inline-flex; align-items: center; gap: 0.45rem;">\n          <i data-lucide="book-open-check" style="width: 17px; height: 17px; color: var(--accent-primary);"></i>\n          <span><strong>Necessiteu veure els passos amb més detall?</strong> Guia oficial de GitHub per crear un <em>fine-grained personal access token</em>, limitar-lo al repositori de la pràctica i configurar-ne els permisos.</span>\n        </span>\n        <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token" target="_blank" rel="noopener" style="font-size: 0.825rem; font-weight: 600; color: var(--accent-primary); text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">\n          <span>Obrir la guia oficial de GitHub</span> ↗\n        </a>\n      </div>\n\n      <h3 style="margin-top: 2rem; margin-bottom: 0.75rem;">Com activar GitHub Pages en 3 clics:</h3>'''
if needle not in text:
    raise SystemExit('No s’ha trobat el punt d’inserció esperat')
text = text.replace(needle, replacement, 1)
path.write_text(text, encoding='utf-8')
