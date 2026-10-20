from pathlib import Path

p = Path('bloc3-github.html')
text = p.read_text(encoding='utf-8')

old_tip = '''            <span class="step-tip">Si <code>gh --version</code> no funciona, no improviseu amb un token al xat. Consulteu la secció d’incidències més avall per instal·lar GitHub CLI o utilitzar una alternativa segura.</span>'''
new_tip = '''            <span class="step-tip">Si <code>gh --version</code> no funciona, instal·leu <a href="https://cli.github.com/" target="_blank" rel="noopener">GitHub CLI des de la pàgina oficial</a> i repetiu aquest pas. No improviseu amb un token al xat.</span>'''
if old_tip not in text:
    raise SystemExit('No s’ha trobat l’avís de GitHub CLI')
text = text.replace(old_tip, new_tip, 1)

old_incident = '''        <p style="font-size: 0.9rem; margin-bottom: 0;">
          <strong>Drecera directa:</strong> podeu anar immediatament a la gestió de credencials a través d'aquest enllaç oficial: <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener"><strong>github.com/settings/personal-access-tokens</strong></a>.
        </p>'''
new_incident = '''        <p style="font-size: 0.9rem; margin-bottom: 0.65rem;">
          <strong>Si GitHub CLI no està instal·lat:</strong> descarregueu-lo des de <a href="https://cli.github.com/" target="_blank" rel="noopener"><strong>cli.github.com</strong></a> i torneu al pas d’autenticació del taller.
        </p>
        <p style="font-size: 0.9rem; margin-bottom: 0;">
          <strong>Només si no podeu utilitzar l’autenticació amb navegador:</strong> consulteu la gestió de <em>fine-grained personal access tokens</em> a <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener"><strong>github.com/settings/personal-access-tokens</strong></a>.
        </p>'''
if old_incident not in text:
    raise SystemExit('No s’ha trobat el bloc d’incidència')
text = text.replace(old_incident, new_incident, 1)

text = text.replace(
    '<h3 style="margin-top:2rem;margin-bottom:.75rem">Fine-grained token - configuració recomanada</h3>',
    '<h3 style="margin-top:2rem;margin-bottom:.75rem">Fine-grained token - només com a alternativa</h3>',
    1,
)

old_store = '''<div class="ordered-step-item"><div class="step-indicator">5</div><div class="step-content"><h3>Deseu-lo com una contrasenya</h3><p>Copieu el token en un gestor de contrasenyes i introduïu-lo només quan l’eina us demani autenticar-vos a GitHub. No l’enganxeu en fitxers del projecte, al README ni en cap repositori.</p><span class="step-tip">Si un token queda exposat, revoqueu-lo i genereu-ne un de nou.</span></div></div>'''
new_store = '''<div class="ordered-step-item"><div class="step-indicator">5</div><div class="step-content"><h3>Deseu-lo com una contrasenya</h3><p>Copieu el token en un gestor de contrasenyes i introduïu-lo només en un camp o diàleg d’autenticació destinat a credencials. No l’enganxeu al xat d’un agent ni el deseu dins del projecte.</p><span class="step-tip">Si un token s’ha compartit en un xat o ha quedat exposat, revoqueu-lo i genereu-ne un de nou.</span></div></div>'''
if old_store not in text:
    raise SystemExit('No s’ha trobat el pas de desament del token')
text = text.replace(old_store, new_store, 1)

text = text.replace('<!-- Guia detallada de tokens per a docents principiants -->', '<!-- Incidències d’autenticació i alternativa amb token -->', 1)

p.write_text(text, encoding='utf-8')
