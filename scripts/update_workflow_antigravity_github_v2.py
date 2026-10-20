from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"No s'ha trobat el fragment esperat: {label}")
    return text.replace(old, new, 1)


# Bloc 2 - Antigravity
p = Path("bloc2-antigravity.html")
text = p.read_text(encoding="utf-8")
text = replace_once(
    text,
    "Ja teniu una web que funciona dins d'una carpeta. Manteniu-la localitzada perquè continuareu amb aquest mateix projecte al bloc següent.",
    "Ja teniu una web que funciona dins d'una carpeta. Al bloc següent creareu un repositori buit a GitHub i, després, tornareu a Antigravity per connectar-hi aquesta mateixa carpeta i fer-ne la primera pujada.",
    "pont final d'Antigravity",
)
p.write_text(text, encoding="utf-8")


# Bloc 3 - GitHub
p = Path("bloc3-github.html")
text = p.read_text(encoding="utf-8")
text = replace_once(
    text,
    "Recupereu la mateixa carpeta que acabeu de crear amb Antigravity. No comenceu cap projecte nou. Localitzeu-la i comproveu que <code>index.html</code> continua dins: aquesta és la carpeta que convertireu en repositori durant aquest bloc.",
    "Manteniu localitzada la mateixa carpeta que acabeu de crear amb Antigravity. Primer creareu un repositori buit a GitHub. Després tornareu a Antigravity, connectareu la carpeta local amb aquell repositori i demanareu a l'agent que hi faci la primera pujada.",
    "capsa de continuïtat de GitHub",
)
text = replace_once(
    text,
    '<!-- Secció: GitHub Desktop i portàtils del PEDC -->\n    <div class="content-box" id="practica-taller">',
    '<!-- Secció opcional: GitHub Desktop i portàtils del PEDC -->\n    <div class="content-box" id="github-desktop-opcional">',
    "id de GitHub Desktop",
)

practice = '''    <!-- Pràctica principal: Antigravity -> GitHub -> Antigravity -> push -->
    <div class="content-box" id="practica-taller">
      <h2>Pràctica guiada: del projecte local al primer <em>push</em></h2>
      <p class="lead-desc">Creeu el repositori a GitHub, connecteu-hi el projecte local i demaneu a Antigravity que hi pugi la primera versió</p>

      <div class="pedagogical-highlight">
        En aquesta pràctica mantindreu el mateix projecte que heu creat al bloc anterior. El recorregut és <strong>Antigravity → GitHub → connexió del projecte → primera pujada</strong>. GitHub prepara l'espai al núvol. Després torneu a Antigravity per revisar el projecte i sincronitzar-lo.
      </div>

      <div class="ordered-steps">
        <div class="ordered-step-item">
          <div class="step-indicator">1</div>
          <div class="step-content">
            <h3>Creeu un repositori buit a GitHub</h3>
            <p>Des de GitHub, creeu un repositori nou amb un nom breu relacionat amb el recurs i configureu-lo com a <strong>públic</strong>. Com que els fitxers ja són al vostre ordinador, deixeu el repositori buit. No hi afegiu README ni <code>.gitignore</code> en aquest moment, i deixeu la llicència per al pas corresponent del taller.</p>
          </div>
        </div>

        <div class="ordered-step-item">
          <div class="step-indicator">2</div>
          <div class="step-content">
            <h3>Copieu l'adreça HTTPS del repositori</h3>
            <p>GitHub mostrarà una adreça semblant a <code>https://github.com/el-vostre-usuari/nom-del-repositori.git</code>. Copieu-la. Antigravity la necessitarà per saber on ha de sincronitzar el projecte.</p>
          </div>
        </div>

        <div class="ordered-step-item">
          <div class="step-indicator">3</div>
          <div class="step-content">
            <h3>Torneu a la mateixa carpeta a Antigravity</h3>
            <p>No creeu cap projecte nou. Manteniu oberta la carpeta del microrecurs que heu provat al bloc anterior i comproveu que <code>index.html</code> continua al directori principal.</p>
          </div>
        </div>

        <div class="ordered-step-item">
          <div class="step-indicator">4</div>
          <div class="step-content">
            <h3>Demaneu a Antigravity que connecti el projecte</h3>
            <p>Enganxeu l'adreça del repositori dins de la indicació següent. Manteniu <strong>Request Review</strong> perquè pugueu revisar les ordres abans que s'executin.</p>
          </div>
        </div>
      </div>

      <div style="margin-top:1rem;background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:1.35rem 1.5rem;">
        <h3 style="font-size:1rem;margin-bottom:.5rem;display:flex;align-items:center;gap:.45rem;">
          <i data-lucide="git-branch" style="width:18px;height:18px;color:var(--accent-primary);"></i>
          Indicació per connectar el projecte i preparar la primera pujada
        </h3>
        <pre id="github-first-push-prompt" style="background:var(--bg-card);padding:1rem 1.15rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:.85rem;line-height:1.6;white-space:pre-wrap;word-break:break-word;color:var(--text-main);margin:0;">Connecta aquesta carpeta local al repositori de GitHub següent:
[ENGANXEU AQUÍ L'ADREÇA HTTPS DEL REPOSITORI]

Abans d'executar cap ordre, explica'm breument què faràs i deixa'm revisar les accions.

Comprova quins fitxers hi ha dins del projecte i no incloguis cap credencial ni fitxer que no formi part del recurs. Si la carpeta encara no és un repositori Git, inicialitza-la i utilitza main com a branca principal. Configura el repositori de GitHub com a origin.

Abans del primer commit, mostra'm quins fitxers s'hi inclouran i atura't perquè els pugui revisar. Quan ho aprovi, crea el commit amb el missatge "Primera versió del recurs" i fes push a origin/main.

Si GitHub necessita autenticació, atura't perquè la pugui completar jo. No desis ni escriguis cap token o contrasenya dins dels fitxers del projecte.</pre>
        <button class="copy-btn btn-primary-action" data-target="github-first-push-prompt" type="button" style="margin-top:.85rem;font-size:.85rem;padding:.55rem 1rem;">
          Copiar indicació per a Antigravity
        </button>
      </div>

      <div class="ordered-steps" style="margin-top:1.5rem;">
        <div class="ordered-step-item">
          <div class="step-indicator">5</div>
          <div class="step-content">
            <h3>Reviseu les accions abans d'aprovar-les</h3>
            <p>Antigravity pot inicialitzar Git i configurar el repositori remot des de la terminal integrada. També pot preparar el primer commit. El panell de control de versions permet revisar els fitxers modificats abans d'enviar-los. No cal memoritzar les ordres: l'objectiu és reconèixer què farà l'agent abans d'autoritzar-ho.</p>
            <span class="step-tip">En el primer <em>push</em>, GitHub pot demanar autenticació. Prioritzeu el flux del navegador o el gestor de credencials del sistema quan estigui disponible. Si necessiteu un token, feu servir un <em>fine-grained personal access token</em> com s'explica més avall i no l'enganxeu al xat.</span>
          </div>
        </div>

        <div class="ordered-step-item">
          <div class="step-indicator">6</div>
          <div class="step-content">
            <h3>Comproveu el resultat a GitHub</h3>
            <p>Torneu al repositori al navegador i actualitzeu la pàgina. Hi hauríeu de veure <code>index.html</code> i la resta de fitxers del projecte. A partir d'aquest moment, Antigravity podrà continuar modificant el projecte local i enviar-ne noves versions al mateix repositori.</p>
          </div>
        </div>
      </div>

      <div style="margin-top:1.5rem;padding:1rem 1.15rem;background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-md);font-size:.9rem;color:var(--text-muted);line-height:1.6;">
        <strong style="color:var(--text-main);">Què està passant per sota?</strong><br>
        L'agent utilitza Git per preparar una versió del projecte i connectar-la amb el repositori remot. En una configuració habitual pot proposar ordres com <code>git init</code>, <code>git remote add origin</code>, <code>git add</code>, <code>git commit</code> i <code>git push</code>. Les reviseu abans d'autoritzar-les; no cal escriure-les manualment durant el taller.
      </div>
    </div>

'''
marker = "      <!-- Guia detallada de tokens per a docents principiants -->"
text = replace_once(text, marker, practice + marker, "inserció de la pràctica principal")

text = replace_once(
    text,
    "Un <strong>Fine-grained Personal Access Token</strong> és una credencial específica per a eines externes que necessiten autenticar-se a GitHub. Podeu limitar-la a un sol repositori i revocar-la sense canviar la contrasenya del compte. Si utilitzeu GitHub Desktop amb l’autenticació al navegador, no cal crear cap token.",
    "Un <strong>Fine-grained Personal Access Token</strong> és una credencial específica per autenticar operacions amb GitHub quan no disposeu d'un flux de navegador o d'un gestor de credencials compatible. Podeu limitar-la a un sol repositori i revocar-la sense canviar la contrasenya del compte. Si el primer <em>push</em> us permet autenticar-vos de manera segura al navegador, no cal crear cap token.",
    "explicació general del token",
)
text = replace_once(
    text,
    "GitHub recomana els <em>fine-grained personal access tokens</em> quan són compatibles amb la tasca. Per a aquest taller, creeu primer el repositori i limiteu el token a aquell repositori. Si feu servir GitHub Desktop i l’autenticació al navegador, no cal crear cap token.",
    "GitHub recomana els <em>fine-grained personal access tokens</em> quan són compatibles amb la tasca. Per a aquest taller, creeu primer el repositori i limiteu el token a aquell repositori. Utilitzeu-lo només si el vostre entorn no us ofereix un flux segur d'autenticació al navegador o mitjançant el gestor de credencials del sistema.",
    "configuració recomanada del token",
)
text = replace_once(
    text,
    "<h2>GitHub Desktop i portàtils docents del PEDC</h2>\n      <p class=\"lead-desc\">Com gestionar els repositoris sense comandes de consola i consideracions sobre els equips escolars</p>",
    "<h2>Alternativa opcional: GitHub Desktop</h2>\n      <p class=\"lead-desc\">Una via gràfica alternativa per sincronitzar el projecte quan no vulgueu fer el <em>push</em> des d'Antigravity</p>",
    "títol de GitHub Desktop",
)
text = replace_once(
    text,
    "Per als docents que s'inicien i prefereixen una aplicació gràfica d'escriptori, <a href=\"https://desktop.github.com/\" target=\"_blank\" rel=\"noopener\">GitHub Desktop</a> és una eina gratuïta molt recomanable. Permet gestionar carpetes locals i publicar canvis a GitHub Pages amb un sol clic.",
    "El recorregut principal del taller fa la primera pujada des d'<strong>Antigravity</strong>. Si en un altre context preferiu separar la creació del recurs de la gestió de Git, <a href=\"https://desktop.github.com/\" target=\"_blank\" rel=\"noopener\">GitHub Desktop</a> ofereix una interfície gràfica per revisar commits i sincronitzar el repositori sense treballar directament amb la terminal.",
    "introducció de GitHub Desktop",
)
text = replace_once(
    text,
    "<td>On afegiu la carpeta del vostre recurs per pujar-hi els fitxers generats amb Antigravity en un sol clic.</td>",
    "<td>Via alternativa per sincronitzar la carpeta local si preferiu no utilitzar el control de versions integrat d'Antigravity.</td>",
    "fila de complementarietat de Desktop",
)
text = replace_once(
    text,
    "<li>Per enllaçar la carpeta de treball local del vostre ordinador amb el repositori.</li>\n            <li>Per revisar quins fitxers ha creat o modificat Google Antigravity.</li>\n            <li>Per enviar les actualitzacions al núvol amb el botó <em>Push origin</em> en un segon.</li>",
    "<li>Quan vulgueu una interfície gràfica separada d'Antigravity per gestionar Git.</li>\n            <li>Quan necessiteu revisar commits o sincronitzar manualment una carpeta local.</li>\n            <li>Com a alternativa si el flux de Git integrat a Antigravity no és adequat per al vostre dispositiu.</li>\n            <li>Per treballar amb repositoris que no formen part de la pràctica principal del taller.</li>",
    "usos de GitHub Desktop",
)
p.write_text(text, encoding="utf-8")


# README
p = Path("README.md")
text = p.read_text(encoding="utf-8")
text = replace_once(
    text,
    "| [`bloc2-antigravity.html`](bloc2-antigravity.html) | **2. Google Antigravity** | Instal·lació i configuració de l'entorn, primera web funcional i treball iteratiu amb l'agent. La descàrrega automatitzada de documents PDF es manté com a ampliació. |",
    "| [`bloc2-antigravity.html`](bloc2-antigravity.html) | **2. Google Antigravity** | Instal·lació i configuració, primera web funcional i preparació del projecte local que continuarà a GitHub. La descàrrega automatitzada de PDF queda com a ampliació. |",
    "fila README bloc 2",
)
text = replace_once(
    text,
    "| [`bloc3-github.html`](bloc3-github.html) | **3. Configuració de GitHub** | Continuïtat amb el projecte creat a Antigravity, creació del repositori i autenticació. Inclou la publicació amb GitHub Pages i la resolució d'errors habituals. |",
    "| [`bloc3-github.html`](bloc3-github.html) | **3. Configuració de GitHub** | Creació d'un repositori buit, connexió del projecte local des d'Antigravity i primer <em>commit/push</em>. Inclou autenticació, GitHub Pages i GitHub Desktop com a alternativa opcional. |",
    "fila README bloc 3",
)
text = replace_once(
    text,
    "El recorregut pràctic prioritari parteix d'una primera web funcional creada amb Antigravity. El mateix projecte local continua després al bloc de GitHub, on la carpeta es converteix en repositori abans de preparar-ne la publicació.",
    "El recorregut pràctic prioritari parteix d'una primera web funcional creada amb Antigravity. A GitHub es crea un repositori buit. Tot seguit, es torna a Antigravity per connectar-hi la mateixa carpeta i fer la primera pujada del codi.",
    "recorregut prioritari del README",
)
text = replace_once(
    text,
    "- **Continuïtat Antigravity-GitHub:** la carpeta creada durant la primera pràctica es recupera al bloc 3 i es converteix en el repositori que s'utilitza durant la resta del recorregut de publicació.",
    "- **Continuïtat Antigravity-GitHub-Antigravity:** la carpeta creada durant la primera pràctica es connecta a un repositori buit de GitHub i el primer <em>push</em> es demana directament a l'agent.",
    "característica de continuïtat",
)
text = replace_once(
    text,
    "Quan una eina admet l'autenticació de GitHub mitjançant el navegador, aquesta és l'opció preferent i no cal crear cap token manualment. Si una integració requereix un token, el material treballa amb **fine-grained personal access tokens**, limitats al repositori necessari i amb els permisos mínims requerits per la tasca.",
    "En el primer <em>push</em> des d'Antigravity, es prioritza l'autenticació segura que ofereixi el navegador o el gestor de credencials del sistema. Si l'entorn requereix un token, el material treballa amb **fine-grained personal access tokens**, limitats al repositori necessari i amb els permisos mínims requerits per la tasca. El token no s'ha d'enganxar al xat d'Antigravity ni desar-se als fitxers del projecte.",
    "autenticació GitHub del README",
)
p.write_text(text, encoding="utf-8")
