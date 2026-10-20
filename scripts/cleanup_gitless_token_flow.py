from pathlib import Path

p = Path("bloc3-github.html")
text = p.read_text(encoding="utf-8")

repls = [
('''        <div class="card-item">
          <div class="card-item-icon"><i data-lucide="git-commit"></i></div>
          <h3>Commit i push</h3>
          <p>
            Fer un <strong>commit</strong> és desar una còpia de seguretat dels canvis amb una petita descripció (com ara "afegides 10 preguntes noves"). Fer un <strong>push</strong> consisteix a pujar aquesta còpia des del vostre ordinador cap al repositori de GitHub.
          </p>
        </div>''', '''        <div class="card-item">
          <div class="card-item-icon"><i data-lucide="upload-cloud"></i></div>
          <h3>Pujada i versions</h3>
          <p>Quan envieu el projecte a GitHub, els fitxers queden desats al repositori i els canvis posteriors poden quedar registrats com a noves versions. Durant el taller, Antigravity s'encarregarà de fer aquesta pujada.</p>
        </div>'''),
('''          Indicació per connectar el projecte i preparar la primera pujada''', '''          Indicació per connectar el projecte i fer la primera pujada'''),
('''Connecta aquesta carpeta local al repositori de GitHub següent:
[ENGANXEU AQUÍ L'ADREÇA HTTPS DEL REPOSITORI]

Abans d'executar cap ordre, explica'm breument què faràs i deixa'm revisar les accions.

Comprova quins fitxers hi ha dins del projecte i no incloguis cap credencial ni fitxer que no formi part del recurs. Si la carpeta encara no és un repositori Git, inicialitza-la i utilitza main com a branca principal. Configura el repositori de GitHub com a origin.

Abans del primer commit, mostra'm quins fitxers s'hi inclouran i atura't perquè els pugui revisar. Quan ho aprovi, crea el commit amb el missatge "Primera versió del recurs" i fes push a origin/main.

Quan GitHub necessiti autenticació, demana'm el token temporal que he creat per a aquest repositori. Utilitza'l només per completar aquesta pujada. No el desis, no l'escriguis en cap fitxer del projecte i no el reutilitzis per a cap altra finalitat.''', '''Puja els fitxers d'aquesta carpeta al repositori de GitHub següent:
[ENGANXEU AQUÍ L'ADREÇA HTTPS DEL REPOSITORI]

Abans de fer la pujada, explica'm breument què faràs i deixa'm revisar les accions.

Comprova quins fitxers formen part del projecte. No enviïs cap credencial ni cap fitxer que no formi part del recurs. Mostra'm quins fitxers pujaràs i atura't perquè els pugui revisar.

Quan ho aprovi, envia la primera versió del recurs al repositori. Si GitHub necessita autenticació, demana'm el token temporal que he creat només per a aquest repositori. Utilitza'l únicament per completar aquesta pujada. No el desis, no l'escriguis en cap fitxer del projecte i no el reutilitzis per a cap altra finalitat.'''),
('''            <h3>Reviseu les accions abans d'aprovar-les</h3>
            <p>Antigravity pot inicialitzar Git i configurar el repositori remot des de la terminal integrada. També pot preparar el primer commit. El panell de control de versions permet revisar els fitxers modificats abans d'enviar-los. No cal memoritzar les ordres: l'objectiu és reconèixer què farà l'agent abans d'autoritzar-ho.</p>''', '''            <h3>Reviseu què s'enviarà abans d'aprovar-ho</h3>
            <p>Antigravity us ha de mostrar quins fitxers vol enviar al repositori abans de completar la pujada. Reviseu que només hi hagi els fitxers del recurs i que no s'hi incloguin credencials ni documents que no vulgueu publicar.</p>'''),
('''        <strong style="color:var(--text-main);">Què està passant per sota?</strong><br>
        Antigravity gestiona la connexió amb el repositori i utilitza la credencial temporal per completar la pujada. En els equips PEDC no fem dependre aquesta pràctica d’una instal·lació local de Git. El criteri que sí mantenim és revisar què s’enviarà al repositori abans d’autoritzar l’acció.''', '''        <strong style="color:var(--text-main);">Què està passant per sota?</strong><br>
        Antigravity utilitza l'accés temporal que li proporcioneu per enviar els fitxers al repositori. El taller no exigeix que conegueu ni instal·leu eines locals de control de versions: el que heu de revisar és quins fitxers s'enviaran i revocar la credencial quan l'acció hagi acabat.'''),
]

for old, new in repls:
    if old not in text:
        raise SystemExit("No s'ha trobat un fragment esperat per a la neteja final")
    text = text.replace(old, new, 1)

# La pràctica principal no ha de pressuposar ordres Git locals.
for forbidden in ["git init", "git remote add", "origin/main", "gh auth", "credential-manager", "PortableGit"]:
    if forbidden in text:
        raise SystemExit(f"Encara hi ha una referència tècnica antiga al bloc 3: {forbidden}")

p.write_text(text, encoding="utf-8")
print("Neteja final de la pràctica aplicada.")
