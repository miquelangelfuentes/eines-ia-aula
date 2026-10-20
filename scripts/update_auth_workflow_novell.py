from pathlib import Path
import re


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"No s'ha trobat el fragment esperat: {label}")
    return text.replace(old, new, 1)


# Bloc 3 - GitHub
p = Path("bloc3-github.html")
text = p.read_text(encoding="utf-8")

# Metadades: el PAT deixa de ser el recorregut principal.
text = replace_once(
    text,
    '  <meta name="description" content="Configuració de GitHub per a docents: repositoris, com crear el token PAT, activació de GitHub Pages en tres clics i particularitats del fitxer index.html.">',
    '  <meta name="description" content="Configuració de GitHub per a docents: repositoris, autenticació segura amb GitHub CLI, primer push des d’Antigravity i publicació amb GitHub Pages.">',
    "meta description",
)
text = replace_once(
    text,
    '  <meta property="og:description" content="Repositoris, token d\'accés (PAT) i publicació web a GitHub Pages per a docents.">',
    '  <meta property="og:description" content="Repositoris, autenticació segura i primer push des d’Antigravity abans de publicar amb GitHub Pages.">',
    "og description",
)
text = replace_once(
    text,
    '  <meta name="twitter:description" content="Repositoris, token d\'accés (PAT) i publicació web a GitHub Pages per a docents.">',
    '  <meta name="twitter:description" content="Repositoris, autenticació segura i primer push des d’Antigravity abans de publicar amb GitHub Pages.">',
    "twitter description",
)

# Targeta conceptual: autenticació segura en lloc de token com a concepte central.
old_card = '''        <div class="card-item">
          <div class="card-item-icon"><i data-lucide="key-round"></i></div>
          <h3>El token d’accés fine-grained</h3>
          <p>Quan una eina externa necessita autenticar-se a GitHub, podeu utilitzar un <em>Fine-grained Personal Access Token</em>. Aquesta credencial permet limitar l’accés a un repositori concret i donar només els permisos necessaris.</p>
        </div>'''
new_card = '''        <div class="card-item">
          <div class="card-item-icon"><i data-lucide="log-in"></i></div>
          <h3>Autenticació segura</h3>
          <p>Per al taller, Git s’autentica amb <strong>GitHub CLI</strong> i el navegador. Així Antigravity pot fer <em>push</em> sense que cap token o contrasenya aparegui al xat de l’agent.</p>
        </div>'''
text = replace_once(text, old_card, new_card, "targeta d'autenticació")

# Inserim l'autenticació única després de tornar a Antigravity i abans de connectar el projecte.
old_step4 = '''        <div class="ordered-step-item">
          <div class="step-indicator">4</div>
          <div class="step-content">
            <h3>Demaneu a Antigravity que connecti el projecte</h3>
            <p>Enganxeu l'adreça del repositori dins de la indicació següent. Manteniu <strong>Request Review</strong> perquè pugueu revisar les ordres abans que s'executin.</p>
          </div>
        </div>'''
new_step4 = '''        <div class="ordered-step-item">
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
            <span class="step-tip">Si <code>gh --version</code> no funciona, no improviseu amb un token al xat. Consulteu la secció d’incidències més avall per instal·lar GitHub CLI o utilitzar una alternativa segura.</span>
          </div>
        </div>

        <div class="ordered-step-item">
          <div class="step-indicator">5</div>
          <div class="step-content">
            <h3>Demaneu a Antigravity que connecti el projecte</h3>
            <p>Enganxeu l’adreça del repositori dins de la indicació següent. Manteniu <strong>Request Review</strong> perquè pugueu revisar les ordres abans que s’executin.</p>
          </div>
        </div>'''
text = replace_once(text, old_step4, new_step4, "pas d'autenticació")

# Indicació: mai secrets al xat; l'autenticació es completa fora de la conversa.
old_prompt = '''Connecta aquesta carpeta local al repositori de GitHub següent:
[ENGANXEU AQUÍ L'ADREÇA HTTPS DEL REPOSITORI]

Abans d'executar cap ordre, explica'm breument què faràs i deixa'm revisar les accions.

Comprova quins fitxers hi ha dins del projecte i no incloguis cap credencial ni fitxer que no formi part del recurs. Si la carpeta encara no és un repositori Git, inicialitza-la i utilitza main com a branca principal. Configura el repositori de GitHub com a origin.

Abans del primer commit, mostra'm quins fitxers s'hi inclouran i atura't perquè els pugui revisar. Quan ho aprovi, crea el commit amb el missatge "Primera versió del recurs" i fes push a origin/main.

Si GitHub necessita autenticació, atura't perquè la pugui completar jo. No desis ni escriguis cap token o contrasenya dins dels fitxers del projecte.'''
new_prompt = '''Connecta aquesta carpeta local al repositori de GitHub següent:
[ENGANXEU AQUÍ L'ADREÇA HTTPS DEL REPOSITORI]

Abans d'executar cap ordre, explica'm breument què faràs i deixa'm revisar les accions.

Comprova quins fitxers hi ha dins del projecte i no incloguis cap credencial ni fitxer que no formi part del recurs. Si la carpeta encara no és un repositori Git, inicialitza-la i utilitza main com a branca principal. Configura el repositori de GitHub com a origin.

Abans del primer commit, mostra'm quins fitxers s'hi inclouran i atura't perquè els pugui revisar. Quan ho aprovi, crea el commit amb el missatge "Primera versió del recurs" i fes push a origin/main.

No em demanis cap contrasenya ni token d'accés al xat. Si GitHub indica que falta autenticació, atura't i digues-m'ho perquè jo la completi des de la terminal integrada amb GitHub CLI i el navegador. Després podràs tornar a intentar el push.'''
text = replace_once(text, old_prompt, new_prompt, "indicació del primer push")

# Renumeració dels passos posteriors.
text = replace_once(
    text,
    '''          <div class="step-indicator">5</div>
          <div class="step-content">
            <h3>Reviseu les accions abans d'aprovar-les</h3>''',
    '''          <div class="step-indicator">6</div>
          <div class="step-content">
            <h3>Reviseu les accions abans d'aprovar-les</h3>''',
    "renumeració revisió",
)
text = replace_once(
    text,
    '''          <div class="step-indicator">6</div>
          <div class="step-content">
            <h3>Comproveu el resultat a GitHub</h3>''',
    '''          <div class="step-indicator">7</div>
          <div class="step-content">
            <h3>Comproveu el resultat a GitHub</h3>''',
    "renumeració comprovació",
)

# Avís d'autenticació durant la revisió: PAT fora del recorregut principal.
text = text.replace(
    '''            <span class="step-tip">En el primer <em>push</em>, GitHub pot demanar autenticació. Prioritzeu el flux del navegador o el gestor de credencials del sistema quan estigui disponible. Si necessiteu un token, feu servir un <em>fine-grained personal access token</em> com s'explica més avall i no l'enganxeu al xat.</span>''',
    '''            <span class="step-tip">Si el <em>push</em> encara demana autenticació, no proporcioneu cap secret al xat. Torneu a la terminal integrada, executeu <code>gh auth status</code> i, si cal, repetiu <code>gh auth login</code> abans de continuar.</span>''',
    1,
)

# La guia extensa del token queda clarament com a incidència i no com a pas del taller.
text = text.replace(
    '''          Guia de credencials per a docents que entren per primer cop''',
    '''          Si l’autenticació amb navegador no funciona''',
    1,
)
text = text.replace(
    '''Un <strong>Fine-grained Personal Access Token</strong> és una credencial específica per autenticar operacions amb GitHub quan no disposeu d'un flux de navegador o d'un gestor de credencials compatible. Podeu limitar-la a un sol repositori i revocar-la sense canviar la contrasenya del compte. Si el primer <em>push</em> us permet autenticar-vos de manera segura al navegador, no cal crear cap token.''',
    '''El recorregut principal del taller utilitza <strong>GitHub CLI i el navegador</strong>. Un <em>Fine-grained Personal Access Token</em> queda com a alternativa d’incidència quan aquest flux no està disponible. Tracteu-lo com una contrasenya i no l’enganxeu mai al xat d’un agent.''',
    1,
)
text = text.replace(
    '''GitHub recomana els <em>fine-grained personal access tokens</em> quan són compatibles amb la tasca. Per a aquest taller, creeu primer el repositori i limiteu el token a aquell repositori. Utilitzeu-lo només si el vostre entorn no us ofereix un flux segur d'autenticació al navegador o mitjançant el gestor de credencials del sistema.''',
    '''Si excepcionalment necessiteu un token, utilitzeu un <em>fine-grained personal access token</em> limitat al repositori necessari i amb els permisos mínims. Introduïu-lo només en un mecanisme d’autenticació destinat a credencials. Si l’heu enganxat en un xat, revoqueu-lo i genereu-ne un de nou.''',
    1,
)

# GitHub web: el PAT deixa de ser una tasca principal.
text = text.replace(
    '''            <li>Per generar i gestionar el vostre token d'accés personal (PAT).</li>''',
    '''            <li>Per revisar la configuració del repositori i gestionar-ne l’accés quan sigui necessari.</li>''',
    1,
)

p.write_text(text, encoding="utf-8")


# README
p = Path("README.md")
readme = p.read_text(encoding="utf-8")
readme = readme.replace(
    "| [`bloc3-github.html`](bloc3-github.html) | **3. Configuració de GitHub** | Creació d'un repositori buit, connexió del projecte local des d'Antigravity i primer <em>commit/push</em>. Inclou autenticació, GitHub Pages i GitHub Desktop com a alternativa opcional. |",
    "| [`bloc3-github.html`](bloc3-github.html) | **3. Configuració de GitHub** | Creació d'un repositori buit, autenticació amb GitHub CLI i navegador, connexió del projecte local des d'Antigravity i primer <em>push</em>. Inclou GitHub Pages i alternatives per resoldre incidències. |",
    1,
)
readme = readme.replace(
    "El recorregut pràctic prioritari parteix d'una primera web funcional creada amb Antigravity. A GitHub es crea un repositori buit. Tot seguit, es torna a Antigravity per connectar-hi la mateixa carpeta i fer la primera pujada del codi.",
    "El recorregut pràctic prioritari parteix d'una primera web funcional creada amb Antigravity. A GitHub es crea un repositori buit. En tornar a Antigravity, el docent autentica Git amb GitHub CLI i el navegador abans de demanar a l'agent que connecti la mateixa carpeta i faci la primera pujada del codi.",
    1,
)
readme = readme.replace(
    "- **Continuïtat Antigravity-GitHub-Antigravity:** la carpeta creada durant la primera pràctica es connecta a un repositori buit de GitHub i el primer <em>push</em> es demana directament a l'agent.",
    "- **Continuïtat Antigravity-GitHub-Antigravity:** la carpeta creada durant la primera pràctica es connecta a un repositori buit de GitHub. Abans del primer <em>push</em>, Git s'autentica amb GitHub CLI i el navegador perquè l'agent no necessiti rebre cap secret al xat.",
    1,
)
old_auth = '''## Autenticació amb GitHub

En el primer <em>push</em> des d'Antigravity, es prioritza l'autenticació segura que ofereixi el navegador o el gestor de credencials del sistema. Si l'entorn requereix un token, el material treballa amb **fine-grained personal access tokens**, limitats al repositori necessari i amb els permisos mínims requerits per la tasca. El token no s'ha d'enganxar al xat d'Antigravity ni desar-se als fitxers del projecte.

El taller no recomana crear *personal access tokens (classic)*. El bloc 3 enllaça directament la documentació oficial de GitHub per crear un *fine-grained personal access token*.'''
new_auth = '''## Autenticació amb GitHub

El recorregut principal del taller utilitza **GitHub CLI** des de la terminal integrada d'Antigravity. El docent executa `gh auth login`, completa l'inici de sessió al navegador i després executa `gh auth setup-git` perquè Git pugui reutilitzar aquesta autenticació. A partir d'aquí, Antigravity pot fer <em>push</em> sense que cap contrasenya o token aparegui al xat.

Si l'autenticació amb navegador no està disponible, el bloc 3 conserva alternatives per resoldre la incidència. Els **fine-grained personal access tokens** queden com a recurs de suport i no formen part del recorregut principal. No s'han d'enganxar al xat d'un agent. Si un token s'hi ha introduït accidentalment, s'ha de revocar i substituir.'''
if old_auth not in readme:
    raise SystemExit("No s'ha trobat la secció d'autenticació del README")
readme = readme.replace(old_auth, new_auth, 1)
p.write_text(readme, encoding="utf-8")
