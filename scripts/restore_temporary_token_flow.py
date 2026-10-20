from pathlib import Path
import re


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"No s'ha trobat: {label}")
    return text.replace(old, new, 1)


p = Path("bloc3-github.html")
text = p.read_text(encoding="utf-8")

text = replace_once(
    text,
    '  <meta name="description" content="Configuració de GitHub per a docents: repositoris, autenticació segura amb GitHub CLI, primer push des d’Antigravity i publicació amb GitHub Pages.">',
    '  <meta name="description" content="Configuració de GitHub per a docents: repositoris, token temporal fine-grained, primera pujada des d’Antigravity i publicació amb GitHub Pages.">',
    "meta description",
)
text = replace_once(
    text,
    '  <meta property="og:description" content="Repositoris, autenticació segura i primer push des d’Antigravity abans de publicar amb GitHub Pages.">',
    '  <meta property="og:description" content="Repositoris, token temporal restringit i primera pujada des d’Antigravity abans de publicar amb GitHub Pages.">',
    "og description",
)
text = replace_once(
    text,
    '  <meta name="twitter:description" content="Repositoris, autenticació segura i primer push des d’Antigravity abans de publicar amb GitHub Pages.">',
    '  <meta name="twitter:description" content="Repositoris, token temporal restringit i primera pujada des d’Antigravity abans de publicar amb GitHub Pages.">',
    "twitter description",
)

old_card = '''        <div class="card-item">
          <div class="card-item-icon"><i data-lucide="log-in"></i></div>
          <h3>Autenticació segura</h3>
          <p>Per al taller, Git s’autentica amb <strong>GitHub CLI</strong> i el navegador. Així Antigravity pot fer <em>push</em> sense que cap token o contrasenya aparegui al xat de l’agent.</p>
        </div>'''
new_card = '''        <div class="card-item">
          <div class="card-item-icon"><i data-lucide="key-round"></i></div>
          <h3>Token temporal i restringit</h3>
          <p>Als equips PEDC no fem dependre la pràctica d’una instal·lació local de Git. Creareu un <em>fine-grained personal access token</em> limitat al repositori de la pràctica i el revocareu quan la pujada hagi acabat.</p>
        </div>'''
text = replace_once(text, old_card, new_card, "targeta d'autenticació")

old_step4 = '''        <div class="ordered-step-item">
          <div class="step-indicator">4</div>
          <div class="step-content">
            <h3>Autentiqueu GitHub una sola vegada</h3>
            <p>Obriu la terminal integrada d’Antigravity i comproveu primer que GitHub CLI està disponible.</p>
            <pre style="background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:.8rem 1rem;margin:.7rem 0;font-size:.85rem;overflow-x:auto;">gh --version</pre>
            <p>Si funciona, inicieu l’autenticació amb:</p>
            <pre style="background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:.8rem 1rem;margin:.7rem 0;font-size:.85rem;overflow-x:auto;">gh auth login</pre>
            <p>Seleccioneu <strong>GitHub.com</strong> i <strong>HTTPS</strong>. Accepteu autenticar Git amb les credencials de GitHub i trieu l’opció d’iniciar sessió amb el navegador. Completeu l’autorització al navegador i torneu a Antigravity.</p>
            <p>Finalment, comproveu l’estat i configureu Git perquè reutilitzi aquesta autenticació:</p>
            <pre style="background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:.8rem 1rem;margin:.7rem 0;font-size:.85rem;line-height:1.6;overflow-x:auto;">gh auth status
gh auth setup-git</pre>
            <span class="step-tip">Si <code>gh --version</code> no funciona, instal·leu <a href="https://cli.github.com/" target="_blank" rel="noopener">GitHub CLI des de la pàgina oficial</a> i repetiu aquest pas. No improviseu amb un token al xat.</span>
          </div>
        </div>'''
new_step4 = '''        <div class="ordered-step-item">
          <div class="step-indicator">4</div>
          <div class="step-content">
            <h3>Creeu un token temporal per a aquest repositori</h3>
            <p>Obriu <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener"><strong>Fine-grained personal access tokens</strong></a> i genereu un token nou. Limiteu-lo només al repositori que acabeu de crear i definiu una data de caducitat curta.</p>
            <p>A <em>Repository permissions</em>, configureu <strong>Contents - Read and write</strong>. No afegiu altres permisos si no són necessaris per a la pràctica.</p>
            <span class="step-tip">Copieu el token i manteniu-lo només mentre feu aquesta pràctica. Com que Antigravity el pot demanar al xat, el considerarem una credencial temporal que s’ha de revocar en acabar.</span>
          </div>
        </div>'''
text = replace_once(text, old_step4, new_step4, "pas 4 amb CLI")

old_prompt_tail = '''No em demanis cap contrasenya ni token d'accés al xat. Si GitHub indica que falta autenticació, atura't i digues-m'ho perquè jo la completi des de la terminal integrada amb GitHub CLI i el navegador. Després podràs tornar a intentar el push.'''
new_prompt_tail = '''Quan GitHub necessiti autenticació, demana'm el token temporal que he creat per a aquest repositori. Utilitza'l només per completar aquesta pujada. No el desis, no l'escriguis en cap fitxer del projecte i no el reutilitzis per a cap altra finalitat.'''
text = replace_once(text, old_prompt_tail, new_prompt_tail, "final de la indicació")

old_step6_tip = '''            <span class="step-tip">Si el <em>push</em> encara demana autenticació, no proporcioneu cap secret al xat. Torneu a la terminal integrada, executeu <code>gh auth status</code> i, si cal, repetiu <code>gh auth login</code> abans de continuar.</span>'''
new_step6_tip = '''            <span class="step-tip">Si Antigravity demana el token, enganxeu només el token temporal creat per a aquest repositori. En entrar al xat de l’agent, el tractarem com una credencial exposada i el revocarem després de comprovar la pujada.</span>'''
text = replace_once(text, old_step6_tip, new_step6_tip, "avís del pas 6")

old_step7 = '''        <div class="ordered-step-item">
          <div class="step-indicator">7</div>
          <div class="step-content">
            <h3>Comproveu el resultat a GitHub</h3>
            <p>Torneu al repositori al navegador i actualitzeu la pàgina. Hi hauríeu de veure <code>index.html</code> i la resta de fitxers del projecte. A partir d'aquest moment, Antigravity podrà continuar modificant el projecte local i enviar-ne noves versions al mateix repositori.</p>
          </div>
        </div>'''
new_step7 = '''        <div class="ordered-step-item">
          <div class="step-indicator">7</div>
          <div class="step-content">
            <h3>Comproveu la pujada i revoqueu el token</h3>
            <p>Torneu al repositori al navegador i actualitzeu la pàgina. Comproveu que <code>index.html</code> i la resta de fitxers del projecte hi són. Tot seguit, torneu a <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener">Fine-grained personal access tokens</a> i revoqueu el token utilitzat durant la pràctica.</p>
            <span class="step-tip">Si més endavant necessiteu una nova pujada des d’un entorn que torni a demanar una credencial, creeu un token nou i restringit. No reutilitzeu el token compartit amb l’agent.</span>
          </div>
        </div>'''
text = replace_once(text, old_step7, new_step7, "pas 7")

old_under = '''        L'agent utilitza Git per preparar una versió del projecte i connectar-la amb el repositori remot. En una configuració habitual pot proposar ordres com <code>git init</code>, <code>git remote add origin</code>, <code>git add</code>, <code>git commit</code> i <code>git push</code>. Les reviseu abans d'autoritzar-les; no cal escriure-les manualment durant el taller.'''
new_under = '''        Antigravity gestiona la connexió amb el repositori i utilitza la credencial temporal per completar la pujada. En els equips PEDC no fem dependre aquesta pràctica d’una instal·lació local de Git. El criteri que sí mantenim és revisar què s’enviarà al repositori abans d’autoritzar l’acció.'''
text = replace_once(text, old_under, new_under, "què passa per sota")

# Substitueix tota la secció d'incidències + guia compacta del token per una explicació única i coherent.
pattern = re.compile(r'''\n      <!-- Incidències d’autenticació i alternativa amb token -->.*?<h3 style="margin-top: 2rem; margin-bottom: 0.75rem;">Com activar GitHub Pages en 3 clics:</h3>''', re.S)
replacement = '''
      <!-- Token temporal per al taller -->
      <div style="margin-top: 2rem; background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.35rem 1.5rem;">
        <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="shield-check" class="lucide" style="width: 20px; height: 20px; color: var(--accent-secondary);"></i>
          Per què utilitzem un token temporal?
        </h3>
        <p style="font-size: 0.925rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 0.85rem;">Als dispositius PEDC, Git i GitHub CLI poden no estar instal·lats i la seva instal·lació pot requerir permisos que el docent no té. Per mantenir la pràctica viable, utilitzem un <strong>fine-grained personal access token</strong> limitat al repositori del taller.</p>
        <p style="font-size: 0.9rem; margin-bottom: 0;">Un token s’ha de tractar com una contrasenya. Com que en aquest recorregut Antigravity el pot demanar dins del xat, <strong>no el conservem com a credencial permanent</strong>: el restringim, l’utilitzem per a la pujada i el revoquem immediatament després.</p>
      </div>

      <div data-content-fix="fine-grained-only">
        <h3 style="margin-top:2rem;margin-bottom:.75rem">Token fine-grained temporal - configuració del taller</h3>
        <p style="color:var(--text-muted);font-size:.925rem;line-height:1.6">Creeu el token després d’haver creat el repositori. Això permet limitar-ne l’accés al projecte concret que utilitzareu durant la pràctica.</p>
        <div class="ordered-steps">
          <div class="ordered-step-item"><div class="step-indicator">1</div><div class="step-content"><h3>Obriu Fine-grained tokens</h3><p>Aneu a <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener"><strong>Settings &gt; Developer settings &gt; Personal access tokens &gt; Fine-grained tokens</strong></a> i premeu <em>Generate new token</em>.</p></div></div>
          <div class="ordered-step-item"><div class="step-indicator">2</div><div class="step-content"><h3>Limiteu-lo al repositori de la pràctica</h3><p>A <em>Repository access</em>, trieu <strong>Only select repositories</strong> i seleccioneu només el repositori que acabeu de crear. Definiu també una data de caducitat curta.</p></div></div>
          <div class="ordered-step-item"><div class="step-indicator">3</div><div class="step-content"><h3>Doneu només el permís necessari</h3><p>A <em>Repository permissions</em>, configureu <strong>Contents - Read and write</strong>. No cal donar permís de Pages si l’activareu manualment des de la configuració del repositori.</p></div></div>
          <div class="ordered-step-item"><div class="step-indicator">4</div><div class="step-content"><h3>Utilitzeu-lo només per a aquesta pujada</h3><p>Copieu el token i proporcioneu-lo a Antigravity només quan el demani per autenticar l’accés al repositori. No l’escriviu dins del projecte ni el reutilitzeu en altres serveis.</p></div></div>
          <div class="ordered-step-item"><div class="step-indicator">5</div><div class="step-content"><h3>Revoqueu-lo en acabar</h3><p>Quan hàgiu comprovat que els fitxers han arribat a GitHub, torneu a la gestió de tokens i revoqueu-lo. Si necessiteu repetir la pràctica més endavant, creeu-ne un de nou.</p><span class="step-tip">La revocació forma part de la pràctica, no és un pas opcional.</span></div></div>
        </div>
      </div>

      <h3 style="margin-top: 2rem; margin-bottom: 0.75rem;">Com activar GitHub Pages en 3 clics:</h3>'''
text, n = pattern.subn(replacement, text, count=1)
if n != 1:
    raise SystemExit("No s'ha pogut substituir la secció d'autenticació")

# Neteja de terminologia del recorregut principal.
for forbidden in ["GitHub CLI", "gh auth login", "gh auth setup-git", "gh auth status", "cli.github.com", "credential-manager", "PortableGit"]:
    if forbidden in text:
        raise SystemExit(f"Encara hi ha una referència antiga a bloc3-github.html: {forbidden}")

p.write_text(text, encoding="utf-8")


# README
p = Path("README.md")
readme = p.read_text(encoding="utf-8")
readme = readme.replace(
    "| [`bloc3-github.html`](bloc3-github.html) | **3. Configuració de GitHub** | Creació d'un repositori buit, autenticació amb GitHub CLI i navegador, connexió del projecte local des d'Antigravity i primer <em>push</em>. Inclou GitHub Pages i alternatives per resoldre incidències. |",
    "| [`bloc3-github.html`](bloc3-github.html) | **3. Configuració de GitHub** | Creació d'un repositori buit, token temporal fine-grained, connexió del projecte des d'Antigravity i primera pujada. Inclou la revocació de la credencial i la publicació amb GitHub Pages. |",
    1,
)
readme = readme.replace(
    "El recorregut pràctic prioritari parteix d'una primera web funcional creada amb Antigravity. A GitHub es crea un repositori buit. En tornar a Antigravity, el docent autentica Git amb GitHub CLI i el navegador abans de demanar a l'agent que connecti la mateixa carpeta i faci la primera pujada del codi.",
    "El recorregut pràctic prioritari parteix d'una primera web funcional creada amb Antigravity. A GitHub es crea un repositori buit i un token temporal limitat a aquell projecte. En tornar a Antigravity, l'agent utilitza aquesta credencial per completar la primera pujada. Quan els fitxers són al repositori, el token es revoca.",
    1,
)
readme = readme.replace(
    "- **Continuïtat Antigravity-GitHub-Antigravity:** la carpeta creada durant la primera pràctica es connecta a un repositori buit de GitHub. Abans del primer <em>push</em>, Git s'autentica amb GitHub CLI i el navegador perquè l'agent no necessiti rebre cap secret al xat.",
    "- **Continuïtat Antigravity-GitHub-Antigravity:** la carpeta creada durant la primera pràctica es connecta a un repositori buit. Als equips PEDC, la primera pujada utilitza un token temporal limitat al projecte, que es revoca després de comprovar el resultat.",
    1,
)
old_auth = '''## Autenticació amb GitHub

El recorregut principal del taller utilitza **GitHub CLI** des de la terminal integrada d'Antigravity. El docent executa `gh auth login`, completa l'inici de sessió al navegador i després executa `gh auth setup-git` perquè Git pugui reutilitzar aquesta autenticació. A partir d'aquí, Antigravity pot fer <em>push</em> sense que cap contrasenya o token aparegui al xat.

Si l'autenticació amb navegador no està disponible, el bloc 3 conserva alternatives per resoldre la incidència. Els **fine-grained personal access tokens** queden com a recurs de suport i no formen part del recorregut principal. No s'han d'enganxar al xat d'un agent. Si un token s'hi ha introduït accidentalment, s'ha de revocar i substituir.'''
new_auth = '''## Autenticació amb GitHub

Als dispositius PEDC, Git i GitHub CLI poden no estar disponibles i instal·lar-los pot requerir permisos d'administrador. Per això, el recorregut principal del taller utilitza un **fine-grained personal access token temporal**, restringit al repositori de la pràctica i amb `Contents - Read and write` com a permís necessari per a la pujada.

Antigravity pot demanar aquesta credencial dins del xat per completar l'acció. Com que un token s'ha de tractar com una contrasenya, el taller assumeix que una credencial introduïda en una conversa amb l'agent no s'ha de conservar. Després de comprovar la pujada a GitHub, el docent revoca el token. Si cal tornar a autenticar una altra pujada, se'n crea un de nou amb el mateix criteri d'abast mínim.'''
if old_auth not in readme:
    raise SystemExit("No s'ha trobat la secció d'autenticació del README")
readme = readme.replace(old_auth, new_auth, 1)
for forbidden in ["GitHub CLI", "gh auth login", "gh auth setup-git", "credential-manager", "PortableGit"]:
    if forbidden in readme:
        raise SystemExit(f"Encara hi ha una referència antiga al README: {forbidden}")
p.write_text(readme, encoding="utf-8")

print("Flux temporal amb token restaurat i contingut anterior netejat.")
