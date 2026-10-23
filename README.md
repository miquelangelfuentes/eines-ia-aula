# Eines d'intel·ligència artificial per a l'aula

> **Guia pràctica per a la creació i publicació de materials educatius oberts.**  
> **Servei Educatiu del Vallès Occidental II. Centre de Recursos Pedagògics (CRP), octubre de 2026.**

Aquest repositori conté el lloc web de suport al taller docent. El material està organitzat en pàgines independents per blocs i incorpora també un dossier continu per imprimir. La proposta combina una seqüència pensada per seguir durant la sessió amb continguts que poden servir després com a guia de consulta.

El recorregut principal mostra com passar d'una necessitat docent a un recurs web interactiu que es conserva com a fitxers estàndard. La pràctica utilitza Google Antigravity per crear i revisar el projecte al dispositiu i GitHub per conservar-lo i publicar-lo. El bloc dedicat a la publicació incorpora també una via alternativa amb Google Gemini i Google Sites, mentre que el darrer bloc amplia la proposta cap als models d'intel·ligència artificial executats en local.

El dossier imprimible no es manté com una còpia manual del contingut. `scripts/build_print.py` el genera a partir dels blocs actuals abans de cada desplegament, de manera que la versió publicada es manté alineada amb les pàgines originals. El fitxer `imprimir-tot.html` queda exclòs del control de versions i només existeix com a artefacte generat durant la construcció del lloc.

🌐 **Lloc web de la guia:** [https://miquelangelfuentes.github.io/eines-ia-aula/](https://miquelangelfuentes.github.io/eines-ia-aula/)

---

## Punt de partida del taller

La pàgina inicial incorpora un **qüestionari diagnòstic de 6 preguntes** sobre creació de recursos web amb IA, Google Antigravity, GitHub, llicències i criteris de protecció de dades. El perfil només es genera quan s'han respost totes les preguntes i serveix per orientar quins blocs poden requerir més atenció durant la sessió.

Les respostes es desen únicament al navegador mitjançant `localStorage` i es poden reiniciar des de la mateixa interfície. En el mode pas a pas, seleccionar una resposta no canvia automàticament de pregunta: la navegació es fa amb els controls **Anterior**, **Següent** i **Veure resultats**.

---

## Estructura de la web

| Pàgina | Títol | Contingut principal |
| :--- | :--- | :--- |
| [`index.html`](index.html) | **Pàgina d'inici** | Presentació del recurs, qüestionari inicial i accés directe als blocs. |
| [`bloc1-marc.html`](bloc1-marc.html) | **1. De consultar un xat a crear les nostres eines** | Canvi de perspectiva: de demanar respostes a construir recursos interactius al navegador mitjançant *vibe coding* o programació per intenció. Explica també per què el taller combina Google Antigravity i GitHub. |
| [`bloc2-antigravity.html`](bloc2-antigravity.html) | **2. Google Antigravity** | Instal·lació i configuració, primera web funcional i preparació del projecte local que continuarà a GitHub. La descàrrega automatitzada de documents queda com a ampliació. |
| [`bloc3-github.html`](bloc3-github.html) | **3. Configuració de GitHub** | Creació d'un repositori buit, token temporal *fine-grained*, connexió del projecte des d'Antigravity i primera pujada. Inclou la revocació de la credencial i la publicació amb GitHub Pages. |
| [`bloc4-pages-sites.html`](bloc4-pages-sites.html) | **4. GitHub Pages en comparació amb Google Sites** | Presenta l'exportació directa d'aplicacions interactives de Gemini a Google Sites i després compara aquesta via amb GitHub Pages segons el grau de control sobre el recurs. Documenta també la limitació actual de l'exportació de Gemini: una nova exportació crea un Site privat nou i no actualitza l'artefacte del Site existent. |
| [`bloc5-llicencies.html`](bloc5-llicencies.html) | **5. Llicències i codi obert** | Separa les llicències de contingut i de codi. Inclou una comparació de Creative Commons i un orientador interactiu per triar una llicència de programari segons les condicions que es vulguin mantenir. |
| [`bloc6-recursos-visuals.html`](bloc6-recursos-visuals.html) | **6. Recursos visuals i citació** | Selecció d'imatges, iconografia oberta i atribució amb TASL. Inclou una pràctica extra per construir infografies pedagògiques en HTML i CSS amb Lucide, revisar-les abans de convertir-les i exportar-les fidelment a PNG. |
| [`bloc7-bones-practiques.html`](bloc7-bones-practiques.html) | **7. Bones pràctiques d'aula** | Supervisió docent, protecció de dades, accessibilitat web, DUA, dependències externes i transparència en l'ús d'IA. |
| [`bloc8-verificacio.html`](bloc8-verificacio.html) | **8. Llista de verificació** | Checklist interactiva amb memòria local per revisar el recurs abans de compartir-lo. |
| [`bloc9-per-continuar-explorant.html`](bloc9-per-continuar-explorant.html) | **9. Per continuar explorant: IA local** | Introducció als models executats al dispositiu, recursos de Softcatalà i Projecte Aina, i opcions d'execució local com Rebost, LM Studio o Ollama. |
| `imprimir-tot.html` | **Dossier complet per imprimir** | Artefacte generat automàticament a partir dels blocs 1-9 i la pàgina de crèdits abans de publicar el lloc. No es manté manualment al repositori. |
| [`credits.html`](credits.html) | **Crèdits i llicències** | Marc institucional, autoria, referències pedagògiques, recursos de tercers i condicions d'ús dels logotips de producte que apareixen al material. |

---

## Durant el taller i per consultar després

Els blocs més densos incorporen accessos diferenciats per ajudar a gestionar el temps de la sessió:

- **Durant el taller** prioritza els passos guiats i les activitats que convé fer amb el grup.
- **Per consultar després** conserva configuracions i explicacions que no cal memoritzar durant la formació.

El recorregut pràctic prioritari parteix d'una primera web funcional creada amb Antigravity. El projecte queda a la carpeta de Documents, de manera que continua sent accessible fora de l'assistent. A GitHub es crea un repositori buit i un token temporal limitat a aquell projecte. En tornar a Antigravity, l'agent utilitza aquesta credencial per completar la primera pujada. Quan els fitxers són al repositori, el token es revoca.

Aquesta combinació és intencionada: Antigravity assumeix la creació i revisió local, mentre que GitHub conserva els fitxers i els pot publicar amb GitHub Pages. El recurs final continua format per HTML, CSS i JavaScript i no queda lligat a l'assistent d'IA utilitzat per crear-lo.

El bloc 4 mostra una altra possibilitat de publicació. Una aplicació interactiva creada a Google Gemini es pot enviar directament a Google Sites amb **Export > Google Sites**, sense copiar-ne el codi. Google crea un Site privat nou amb l'artefacte incorporat, que després es pot contextualitzar i publicar dins de Workspace.

Aquesta via té una limitació rellevant a l'octubre de 2026: si l'artefacte es modifica a Gemini i es torna a exportar, es crea un altre Site privat. L'exportació no substitueix ni actualitza automàticament l'artefacte publicat anteriorment. En canvi, quan un projecte publicat amb GitHub Pages rep nous canvis al repositori, es pot actualitzar el mateix lloc mantenint-ne l'adreça.

---

## Característiques del recurs

- **Navegació per teclat i botons seqüencials:** les fletxes dreta i esquerra permeten avançar o retrocedir entre blocs quan el focus no és dins d'un control interactiu.
- **Assistent d'indicacions integrat:** el bloc 2 genera una primera indicació per crear recursos web amb criteris docents, accessibilitat i control de dependències.
- **Primera pràctica funcional amb Antigravity:** el bloc 2 proposa crear un microrecurs, comprovar-ne el funcionament i aplicar-hi una millora abans de continuar amb el mateix projecte a GitHub.
- **Continuïtat Antigravity-GitHub:** la carpeta creada durant la primera pràctica es connecta a un repositori buit. Als equips PEDC, la primera pujada utilitza un token temporal limitat al projecte, que es revoca després de comprovar el resultat.
- **Publicació alternativa amb Gemini i Google Sites:** el bloc 4 explica com exportar directament una aplicació interactiva de Gemini a un Site privat nou i en compara les implicacions amb GitHub Pages.
- **Automatització amb agent com a ampliació:** la descàrrega de documents des d'una pàgina pública mostra una tasca agentiva diferent de la generació de codi i manté la revisió de permisos abans d'autoritzar l'acció.
- **Infografies pedagògiques com a pràctica extra:** el bloc 6 mostra com construir i revisar una infografia editable en HTML i CSS amb icones Lucide. Quan està validada, es pot renderitzar fidelment a PNG amb fons transparent.
- **Recursos de suport:** guies oficials i videotutorials per a processos que poden requerir una demostració o una consulta posterior.
- **Llista de verificació interactiva:** el bloc 8 desa el progrés localment al navegador.
- **IA local com a ampliació:** el bloc 9 diferencia model i interfície, recull recursos en català i presenta opcions per executar models al dispositiu quan es vol reduir la dependència del núvol.
- **Dossier per imprimir:** el desplegament genera `imprimir-tot.html` a partir del contingut vigent dels blocs i dels crèdits.
- **Mode clar i fosc:** permet adaptar l'esquema de color a les preferències de visualització de l'usuari. Els dos modes han de mantenir la llegibilitat i els criteris d'accessibilitat del lloc.
- **Accessibilitat web:** disseny adaptable, navegació amb teclat, focus visible i reducció de moviment segons les preferències del sistema, prenent WCAG com a referència tècnica.
- **DUA:** criteris de disseny de l'aprenentatge orientats a detectar barreres i incorporar suports útils per a la participació.

---

## Autenticació amb GitHub

Als dispositius PEDC, les eines locals necessàries per autenticar GitHub poden no estar disponibles i instal·lar-les pot requerir permisos d'administrador. Per això, el recorregut principal del taller utilitza un **fine-grained personal access token temporal**, restringit al repositori de la pràctica i amb `Contents - Read and write` com a permís necessari per a la pujada.

Antigravity pot demanar aquesta credencial dins del xat per completar l'acció. Com que un token s'ha de tractar com una contrasenya, el taller assumeix que una credencial introduïda en una conversa amb l'agent no s'ha de conservar. Després de comprovar la pujada a GitHub, el docent revoca el token. Si cal tornar a autenticar una altra pujada, se'n crea un de nou amb el mateix criteri d'abast mínim.

---

## Gemini i Google Sites

Des d'octubre de 2026, Google Gemini permet exportar una aplicació interactiva directament a Google Sites. El flux utilitzat al material és:

1. Creeu i reviseu l'aplicació interactiva a Gemini.
2. Seleccioneu **Export > Google Sites**.
3. Google crea un Site privat nou amb l'artefacte incorporat.
4. Editeu el context del Site i publiqueu-lo amb els permisos adequats del vostre entorn Workspace.

Aquesta funció simplifica la publicació quan no es necessita gestionar directament el codi. Ara mateix, però, una nova exportació no actualitza l'artefacte d'un Site existent. Si el recurs canvia a Gemini, l'exportació genera un Site privat nou.

La comparació del bloc 4 posa aquesta diferència al costat del model de GitHub Pages, on el repositori conserva els fitxers i els canvis es poden desplegar sobre el mateix lloc publicat.

---

## IA local i recursos en català

El bloc 9 amplia el recorregut cap a models que poden executar-se al mateix dispositiu. L'objectiu no és presentar l'execució local com una garantia automàtica de privadesa, sinó mostrar què canvia quan el processament deixa de dependre necessàriament d'un servei remot.

El bloc incorpora recursos de **Softcatalà** per entendre la IA local i consultar avaluacions de models en català. També presenta el **Projecte Aina** com a font de recursos lingüístics i models en català.

La secció **Com executar models locals al vostre ordinador** incorpora **Rebost** com una opció guiada per treballar amb fitxers locals. També presenta LM Studio com a interfície visual i Ollama com a motor local amb aplicació i API, distingint en cada cas les funcions locals dels serveis opcionals al núvol.

---

## Arquitectura del projecte

El contingut pedagògic base forma part directament dels fitxers HTML, de manera que les pàgines continuen sent llegibles encara que JavaScript no estigui disponible. `app.js` i `site-core.js` hi afegeixen funcionalitat compartida i algunes millores de presentació o interacció després de la càrrega.

La funcionalitat compartida es concentra principalment en:

- [`app.js`](app.js), que carrega la funcionalitat del lloc.
- [`site-core.js`](site-core.js), que gestiona el tema visual, la navegació, les còpies al porta-retalls, el generador d'indicacions, la checklist i el qüestionari inicial.
- [`styles.css`](styles.css), que conté el sistema visual compartit, els estats de focus i les adaptacions per a moviment reduït.
- [`scripts/build_print.py`](scripts/build_print.py), que construeix el dossier continu a partir dels HTML dels blocs abans del desplegament.
- [`scripts/validate_site.py`](scripts/validate_site.py), que comprova l'estructura del lloc abans que GitHub Pages el publiqui.

Els avisos associats a accions com copiar contingut utilitzen una regió `aria-live` perquè la retroacció no depengui només d'un canvi visual.

### Dossier imprimible

`imprimir-tot.html` és un artefacte generat. No s'ha d'editar manualment ni és la font del contingut. El generador extreu el contingut principal de cada bloc, elimina la navegació entre pàgines i resol els identificadors que es repetirien en combinar diverses pàgines en un sol document.

El fitxer està inclòs a `.gitignore`, de manera que una generació local no crea canvis pendents al repositori.

Per generar-lo en local:

```bash
python scripts/build_print.py
```

---

## Robustesa i dependències

Els recursos essencials per mostrar o fer funcionar el material es conserven dins del repositori quan la seva llicència permet la redistribució. Les dependències externes es mantenen quan tenen una funció deliberada i la seva indisponibilitat no impedeix completar l'activitat principal.

Una pregunta de decisió útil és aquesta: **si el servei extern deixa d'estar disponible, l'alumnat pot continuar fent l'activitat?** Si la resposta és no, convé valorar una còpia local quan la llicència ho permet. Si només es perd una ampliació o un enllaç de consulta, la dependència externa pot ser assumible.

Les fotografies utilitzades pel lloc es desen a `assets/images/unsplash/` i mantenen els crèdits visibles. Lucide es distribueix localment a `assets/vendor/lucide/` amb la seva llicència.

Els logotips de **Google Gemini**, **Google Antigravity**, **Google Sites** i **GitHub** s'utilitzen amb finalitat identificativa. No formen part de la iconografia Lucide ni queden relicenciats per la llicència Creative Commons del material. La seva procedència i les condicions de marca corresponents es documenten a [`credits.html`](credits.html).

Consulteu també [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) per a la versió, l'origen i la traçabilitat dels recursos de tercers allotjats al projecte.

---

## Verificació abans del desplegament

El workflow de GitHub Pages segueix aquest ordre abans de publicar el lloc:

```bash
python scripts/build_print.py
python scripts/validate_site.py
```

Primer genera el dossier amb el contingut actual i després valida el conjunt del lloc, inclòs el fitxer acabat de generar. Només si la validació és correcta continua el desplegament a GitHub Pages.

Les mateixes ordres es poden executar manualment abans de fer un `push`.

La comprovació revisa, entre altres aspectes:

- enllaços, àncores i recursos locals inexistents;
- identificadors HTML duplicats;
- imatges locals sense `alt` o sense dimensions intrínseques;
- scripts essencials carregats des de serveis externs;
- enllaços amb `target="_blank"` sense `rel="noopener"`;
- presència dels fitxers de llicència, dels avisos de tercers i dels recursos locals requerits pel projecte.

Si la validació falla, el desplegament de GitHub Pages s'atura. Aquesta comprovació automàtica complementa la revisió manual del contingut i les proves d'interacció amb teclat.

---

## Llicències, marques i referències

- **Contingut pedagògic:** [Creative Commons Reconeixement-CompartirIgual 4.0 Internacional (CC BY-SA 4.0)](LICENSE-CONTENT.md). El fitxer delimita també què queda fora d'aquesta llicència.
- **Codi font propi:** [GNU General Public License v3.0](LICENSE-CODE), aplicada com a `GPL-3.0-only`.
- **Iconografia de la interfície:** [Lucide Icons](https://lucide.dev/license), sota llicència ISC.
- **Marques i logotips de producte:** Google Gemini, Google Antigravity, Google Sites i GitHub s'utilitzen únicament per identificar les eines esmentades. Els drets de marca continuen corresponent als seus titulars. La procedència concreta de cada actiu està documentada a [`credits.html`](credits.html).
- **Guia de referència:** recomanacions de [*vibe coding* responsable](https://vibe-coding-educativo.github.io/vibe-responsable/ca/guia.html) de De Haro (2026).
- **Criteri terminològic:** *vibe coding* es presenta també com a **programació per intenció**, d'acord amb la proposta terminològica del [TERMCAT](https://www.termcat.cat/ca/cercaterm/fitxa/NDg4MDA2NA%3D%3D).
- **Publicació Gemini > Google Sites:** el bloc 4 pren com a referència la [publicació oficial de Google Workspace Updates](https://workspaceupdates.googleblog.com/2026/10/publish-interactive-apps-from-gemini-app-to-Google-Sites.html).
- **Citació de recursos:** patró [TASL de Creative Commons](https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution).
- **Recursos de tercers allotjats localment:** documentats a [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).