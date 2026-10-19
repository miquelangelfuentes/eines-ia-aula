# Eines d'intel·ligència artificial per a l'aula

> **Guia pràctica per a la creació i publicació de materials educatius oberts.**  
> **Servei Educatiu del Vallès Occidental II. Centre de Recursos Pedagògics (CRP), Octubre, 2026.**

Aquest repositori conté el lloc web de suport al taller docent. El material està organitzat en pàgines independents per blocs i incorpora també una vista continuada per imprimir. La proposta combina una seqüència pensada per seguir durant la sessió amb continguts que poden servir després com a guia de consulta.

🌐 **Lloc web de la guia:** [https://miquelangelfuentes.github.io/eines-ia-aula/](https://miquelangelfuentes.github.io/eines-ia-aula/)

---

## Punt de partida del taller

La pàgina inicial incorpora un **qüestionari diagnòstic de 6 preguntes** sobre creació de recursos web amb IA, Google Antigravity, GitHub, llicències i criteris de protecció de dades. El perfil només es genera quan s'han respost totes les preguntes i serveix per orientar quins blocs poden requerir més atenció durant la sessió.

Les respostes es desen únicament al navegador mitjançant `localStorage` i es poden reiniciar des de la mateixa interfície.

---

## Estructura de la web

| Pàgina | Títol | Contingut principal |
| :--- | :--- | :--- |
| [`index.html`](index.html) | **Pàgina d'inici** | Presentació del recurs, qüestionari inicial i accés directe als blocs. |
| [`bloc1-marc.html`](bloc1-marc.html) | **1. De consultar un xat a crear les nostres eines** | Canvi de perspectiva: de demanar respostes a construir recursos interactius al navegador mitjançant *vibe coding* o programació per intenció. |
| [`bloc2-antigravity.html`](bloc2-antigravity.html) | **2. Google Antigravity** | Instal·lació, carpetes de treball, permisos a Windows, tria de models, previsualització, assistent d'indicacions i pràctica d'automatització amb documents PDF. |
| [`bloc3-github.html`](bloc3-github.html) | **3. Configuració de GitHub** | Creació del repositori, autenticació amb *fine-grained token* quan cal, publicació amb GitHub Pages i resolució d'errors habituals. |
| [`bloc4-pages-sites.html`](bloc4-pages-sites.html) | **4. Pages en comparació amb Sites** | Comparació dels dos entorns segons el tipus de recurs, la col·laboració i el grau de control sobre els fitxers. |
| [`bloc5-llicencies.html`](bloc5-llicencies.html) | **5. Llicències i codi obert** | Creative Commons per al contingut i llicències de programari aplicables al codi. |
| [`bloc6-recursos-visuals.html`](bloc6-recursos-visuals.html) | **6. Recursos visuals i citació** | Selecció d'imatges, atribució, patró TASL i criteris per conservar recursos dins del projecte quan la llicència ho permet. |
| [`bloc7-bones-practiques.html`](bloc7-bones-practiques.html) | **7. Bones pràctiques d'aula** | Supervisió docent, protecció de dades, accessibilitat web, DUA, dependències externes i transparència en l'ús d'IA. |
| [`bloc8-verificacio.html`](bloc8-verificacio.html) | **8. Llista de verificació** | Checklist interactiva amb memòria local per revisar el recurs abans de compartir-lo. |
| [`bloc9-per-continuar-explorant.html`](bloc9-per-continuar-explorant.html) | **9. Per continuar explorant** | Models executats al dispositiu, diferències respecte als serveis al núvol i criteris per valorar privadesa i control de dades. |
| [`imprimir-tot.html`](imprimir-tot.html) | **Dossier complet per imprimir** | Vista continuada dels continguts preparada per a impressió o exportació a PDF. |
| [`credits.html`](credits.html) | **Crèdits i autoria** | Marc institucional, autoria i referències del material. |

---

## Durant el taller i per consultar després

Els blocs més densos incorporen accessos diferenciats per ajudar a gestionar el temps de la sessió:

- **Durant el taller** prioritza els passos guiats i les activitats que convé fer amb el grup.
- **Per consultar després** conserva configuracions i explicacions que no cal memoritzar durant la formació.

Aquesta separació permet continuar avançant encara que una configuració concreta requereixi més temps en un dispositiu determinat.

---

## Característiques del recurs

- **Navegació per teclat i botons seqüencials:** les fletxes dreta i esquerra permeten avançar o retrocedir entre blocs quan el focus no és dins d'un control interactiu.
- **Assistent d'indicacions integrat:** el bloc 2 genera una primera indicació per crear recursos web amb criteris docents, accessibilitat i control de dependències.
- **Pràctica d'automatització amb agent:** exercici guiat per localitzar i descarregar documents PDF des d'una pàgina pública cap a una carpeta de Documents, revisant els permisos abans d'autoritzar l'acció.
- **Videotutorials de suport:** recursos complementaris per a processos que poden requerir una demostració visual.
- **Llista de verificació interactiva:** el bloc 8 desa el progrés localment al navegador.
- **Dossier per imprimir:** `imprimir-tot.html` ofereix una versió continuada del material.
- **Mode clar i fosc:** disponible des de la capçalera del lloc.
- **Accessibilitat web:** disseny adaptable, navegació amb teclat, focus visible i reducció de moviment segons les preferències del sistema, prenent WCAG com a referència tècnica.
- **DUA:** criteris de disseny de l'aprenentatge orientats a detectar barreres i incorporar suports útils per a la participació.

---

## Arquitectura del projecte

El contingut pedagògic forma part directament dels fitxers HTML. Això permet que les pàgines continuïn sent llegibles encara que JavaScript no estigui disponible i evita dependre de scripts que reescriguin el contingut després de carregar la pàgina.

La funcionalitat interactiva es concentra principalment en:

- [`app.js`](app.js), que carrega la funcionalitat compartida.
- [`site-core.js`](site-core.js), que gestiona el tema visual, la navegació, les còpies al porta-retalls, el generador d'indicacions, la checklist i el qüestionari inicial.
- [`styles.css`](styles.css), que conté el sistema visual compartit, els estats de focus i les adaptacions per a moviment reduït.

Els avisos associats a accions com copiar contingut utilitzen una regió `aria-live` perquè la retroacció no depengui només d'un canvi visual.

---

## Robustesa i dependències

Els recursos essencials per mostrar o fer funcionar el material es conserven dins del repositori quan la seva llicència permet la redistribució. Les dependències externes es mantenen quan tenen una funció deliberada i la seva indisponibilitat no impedeix completar l'activitat principal.

Una pregunta de decisió útil és aquesta: **si el servei extern deixa d'estar disponible, l'alumnat pot continuar fent l'activitat?** Si la resposta és no, convé valorar una còpia local quan la llicència ho permet. Si només es perd una ampliació o un enllaç de consulta, la dependència externa pot ser assumible.

Les fotografies utilitzades pel lloc es desen a `assets/images/unsplash/` i mantenen els crèdits visibles. Lucide es distribueix localment a `assets/vendor/lucide/` amb la seva llicència. Consulteu [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) per a la versió, l'origen i la traçabilitat dels recursos de tercers.

---

## Verificació abans del desplegament

El workflow de GitHub Pages executa automàticament:

```bash
python scripts/validate_site.py
```

La mateixa ordre es pot executar manualment abans de fer un `push`.

La comprovació revisa, entre altres aspectes:

- enllaços, àncores i recursos locals inexistents;
- identificadors HTML duplicats;
- imatges locals sense `alt` o sense dimensions intrínseques;
- scripts essencials carregats des de serveis externs;
- enllaços amb `target="_blank"` sense `rel="noopener"`;
- presència dels fitxers locals i avisos de tercers requerits pel projecte.

Si la validació falla, el desplegament de GitHub Pages s'atura. Aquesta comprovació automàtica complementa la revisió manual del contingut i les proves d'interacció amb teclat.

---

## Llicències i referències

- **Contingut pedagògic:** [Creative Commons Reconeixement-CompartirIgual 4.0 Internacional (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/deed.ca).
- **Codi font:** [Llicència MIT](https://opensource.org/license/mit).
- **Guia de referència:** recomanacions de [*vibe coding* responsable](https://vibe-coding-educativo.github.io/vibe-responsable/ca/guia.html) de De Haro (2026).
- **Criteri terminològic:** *vibe coding* es presenta també com a **programació per intenció**, d'acord amb la proposta terminològica del [TERMCAT](https://www.termcat.cat/ca/cercaterm/fitxa/NDg4MDA2NA%3D%3D).
- **Citació de recursos:** patró [TASL d'Open Washington / Creative Commons](https://www.openwa.org/citar-recursos-oberts/).
- **Recursos de tercers allotjats localment:** documentats a [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
