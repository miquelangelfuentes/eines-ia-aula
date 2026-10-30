/* Carrega la funcionalitat compartida del lloc. */
(() => {
  /* Numeració automàtica per a la impressió i l'exportació a PDF.
     Els navegadors Chromium moderns admeten caixes de marge dins de @page. */
  const printPageNumberStyle = document.createElement('style');
  printPageNumberStyle.id = 'print-page-numbering';
  printPageNumberStyle.media = 'print';
  printPageNumberStyle.textContent = `
    @page {
      @bottom-right {
        content: counter(page);
        color: #94a3b8;
        font-family: Arial, sans-serif;
        font-size: 9pt;
        font-weight: 400;
      }
    }
  `;
  document.head.appendChild(printPageNumberStyle);

  const currentPageName = () => window.location.pathname.split('/').pop() || 'index.html';

  const sectionHeadingIconRules = [
    [/accés|material del taller/i, 'smartphone'],
    [/qüestionari|diagnòstic|coneixements previs/i, 'clipboard-list'],
    [/objectiu/i, 'target'],
    [/bloc|estructura|recorregut|índex/i, 'layout-grid'],
    [/com funciona|configuraci|instal·laci/i, 'settings'],
    [/primera web|web funcional|recurs web|recursos web/i, 'monitor'],
    [/indicaci|plantilla|generador/i, 'message-square-code'],
    [/ampliació|pdf|descarrega/i, 'download'],
    [/antigravity.*github|github.*antigravity/i, 'workflow'],
    [/github/i, 'git-branch'],
    [/google sites|\bsites\b/i, 'panel-left'],
    [/pages|publica|despleg|web pública/i, 'globe'],
    [/comparaci|alternatives|diferències/i, 'columns-2'],
    [/citar|citaci[oó]|tasl/i, 'quote'],
    [/llic[eè]nc|creative commons|copyright|drets/i, 'scale'],
    [/bancs|fotograf/i, 'camera'],
    [/imatg|icona|visual/i, 'image'],
    [/accessibilitat|\bdua\b/i, 'accessibility'],
    [/bones pràctiques|criteri|seguretat|privacitat|responsable/i, 'shield-check'],
    [/verific|comprov|prova|revisa/i, 'search'],
    [/ia local|models locals|offline|\blocal\b/i, 'hard-drive'],
    [/cr[eè]dit|autoria|font|refer[eè]nc/i, 'info'],
    [/continuar|explorar|tutorial|vídeo|recursos/i, 'book-open'],
  ];

  const fallbackHeadingIcons = [
    'file-text', 'compass', 'layers', 'pencil-ruler', 'folder-tree', 'braces',
    'code-2', 'mouse-pointer-click', 'rocket', 'settings-2', 'file-code-2',
    'folder-code', 'badge-check', 'cloud', 'link', 'key-round', 'upload',
    'history', 'share-2', 'network', 'file-check-2', 'library', 'palette',
    'shapes', 'eye', 'keyboard', 'contrast', 'circle-check-big', 'list-checks',
    'scan-search', 'microscope', 'database', 'cpu', 'server', 'laptop',
    'package-open', 'boxes', 'plug', 'circle-help',
  ];

  const preferredIconForSectionHeading = (text) => {
    const match = sectionHeadingIconRules.find(([pattern]) => pattern.test(text));
    return match?.[1] ?? 'file-text';
  };

  const nextUnusedIcon = (preferred, usedIcons) => {
    if (preferred && !usedIcons.has(preferred)) return preferred;
    return fallbackHeadingIcons.find((icon) => !usedIcons.has(icon)) ?? preferred ?? 'file-text';
  };

  const styleSectionHeading = (heading) => {
    heading.style.display = 'flex';
    heading.style.alignItems = 'center';
    heading.style.gap = '0.6rem';
  };

  const setText = (element, text) => {
    if (element) element.textContent = text;
  };

  const setHtml = (element, html) => {
    if (element) element.innerHTML = html;
  };

  const normalizeVisibleWording = (text) => {
    if (!text) return text;
    return text
      .replace(/M'amoïna la privacitat dels alumnes/g, "M'amoïna la privacitat de l'alumnat")
      .replace(/com si fóssiu un alumne/g, "des de la perspectiva de l'alumnat")
      .replace(/d'un alumne/g, "de l'alumnat")
      .replace(/d’una alumna/g, "de l'alumnat")
      .replace(/de l'alumne/g, "de l'alumnat")
      .replace(/de l’alumne/g, "de l'alumnat")
      .replace(/als alumnes/g, "a l'alumnat")
      .replace(/dels alumnes/g, "de l'alumnat")
      .replace(/els alumnes poden/g, "l'alumnat pot")
      .replace(/els alumnes necessiten/g, "l'alumnat necessita")
      .replace(/els alumnes practiquen/g, "l'alumnat practica")
      .replace(/els alumnes/g, "l'alumnat")
      .replace(/les alumnes/g, "l'alumnat")
      .replace(/un alumne/g, "l'alumnat")
      .replace(/una alumna/g, "l'alumnat")
      .replace(/l'alumne/g, "l'alumnat")
      .replace(/l’alumne/g, "l'alumnat")
      .replace(/\balumnes\b/g, 'alumnat')
      .replace(/\balumne\b/g, 'alumnat')
      .replace(/\balumnas\b/g, 'alumnat')
      .replace(/\balumna\b/g, 'alumnat')
      .replace(/\bComparativa\b/g, 'Comparació')
      .replace(/\bcomparativa\b/g, 'comparació')
      .replace(/\bChecklist\b/g, 'Llista de verificació')
      .replace(/\bchecklist\b/g, 'llista de verificació')
      .replace(/Obriu Google Antigravity per seguir la pràctica del bloc\./g, 'Tingueu Google Antigravity a mà durant la pràctica del bloc.')
      .replace(/Obriu GitHub per seguir la configuració i la publicació del recurs\./g, 'Necessitareu GitHub durant la configuració i la publicació del recurs.')
      .replace(/Ves a Google Antigravity/g, 'Obriu Google Antigravity')
      .replace(/Ves a GitHub/g, 'Obriu GitHub')
      .replace(/Octubre, 2026/g, 'Octubre de 2026')
      .replace(/\s—\s/g, ' - ');
  };

  const normalizeGlobalTerminology = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    nodes.forEach((textNode) => {
      const parent = textNode.parentElement;
      if (!parent || ['SCRIPT', 'STYLE'].includes(parent.tagName)) return;
      const normalized = normalizeVisibleWording(textNode.nodeValue);
      if (normalized !== textNode.nodeValue) textNode.nodeValue = normalized;
    });

    document.querySelectorAll('[alt], [title], [aria-label], [placeholder]').forEach((element) => {
      ['alt', 'title', 'aria-label', 'placeholder'].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const value = element.getAttribute(attribute);
        const normalized = normalizeVisibleWording(value);
        if (normalized !== value) element.setAttribute(attribute, normalized);
      });
    });
  };

  const normalizeFooter = () => {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    const footerText = footer.querySelector('.footer-inner > p');
    if (footerText) {
      footerText.innerHTML = footerText.innerHTML
        .replace(/\s—\s/g, ' - ')
        .replace(/Octubre, 2026/g, 'Octubre de 2026');
    }

    const licenseLink = [...footer.querySelectorAll('.footer-links a')]
      .find((link) => /Llicència CC BY-SA 4\.0/i.test(link.textContent));
    if (licenseLink) {
      licenseLink.textContent = 'Llicències del projecte';
      licenseLink.href = 'credits.html#llicencies-projecte';
      licenseLink.removeAttribute('target');
      licenseLink.removeAttribute('rel');
    }
  };

  const normalizeHomeContent = () => {
    if (currentPageName() !== 'index.html') return;

    setHtml(
      document.querySelector('.hero-impact-headline span'),
      'Amb el <em>vibe coding</em> no es guanya temps, però permet elevar els resultats.'
    );

    const objectiveTwo = [...document.querySelectorAll('#objectius-sessio .ordered-step-item')]
      .find((item) => item.querySelector('.step-indicator')?.textContent.trim() === 'II');
    if (objectiveTwo) {
      setText(objectiveTwo.querySelector('h3'), 'Publicació amb formats oberts i portabilitat (GitHub Pages)');
      setText(
        objectiveTwo.querySelector('p'),
        "Publicar els materials a GitHub Pages conservant-los en formats web oberts i reduint la dependència d'un editor o d'un format propietari."
      );
    }

    const licenseQuestion = document.querySelector('.quiz-question-card[data-q="7"]');
    if (licenseQuestion) {
      setText(licenseQuestion.querySelector('.quiz-q-title'), 'Llicències de continguts i de codi');
      const optionC = licenseQuestion.querySelector('input[value="C"]')?.closest('.quiz-option-card')?.querySelector('.quiz-opt-text');
      const optionD = licenseQuestion.querySelector('input[value="D"]')?.closest('.quiz-option-card')?.querySelector('.quiz-opt-text');
      setText(optionC, 'Conec bé les llicències CC BY i CC BY-SA per al contingut educatiu, però desconec per què el codi informàtic necessita una llicència de programari diferent.');
      setText(optionD, 'Diferencio la llicència del contingut pedagògic de la del codi i sé que aquest projecte aplica CC BY-SA 4.0 al contingut i GNU GPL v3 al codi font.');
    }

    const setCardDescription = (href, html) => {
      const card = document.querySelector(`.home-block-card[href="${href}"] .home-card-desc`);
      setHtml(card, html);
    };

    setCardDescription(
      'bloc4-pages-sites.html',
      'Comparació entre GitHub Pages i Google Sites segons el grau de control, la portabilitat dels fitxers i la manera d’actualitzar el recurs.'
    );
    setCardDescription(
      'bloc5-llicencies.html',
      'Com separar les llicències del contingut i del codi. En aquest projecte, CC BY-SA 4.0 s’aplica al contingut pedagògic i GNU GPL v3 al codi propi.'
    );
    setCardDescription(
      'bloc6-recursos-visuals.html',
      'Criteris per triar recursos visuals segons la funció pedagògica, mantenir una iconografia coherent i atribuir els recursos de tercers. Inclou una pràctica amb HTML i Lucide.'
    );
    setCardDescription(
      'bloc7-bones-practiques.html',
      'Deu recomanacions de <em>vibe coding</em> responsable per revisar el recurs abans de publicar-lo, amb accessibilitat web i DUA tractats de manera diferenciada.'
    );
    setCardDescription(
      'bloc8-verificacio.html',
      'Llista de verificació interactiva dels deu punts, amb memòria local, per revisar qualsevol activitat abans de portar-la al grup classe.'
    );
    setCardDescription(
      'bloc9-per-continuar-explorant.html',
      'Més control sobre les dades i possibilitat de treballar fora de línia amb models executats al dispositiu i recursos en català.'
    );
    setCardDescription(
      'credits.html',
      'Marc institucional, referències del material i llicències del projecte: CC BY-SA 4.0 per al contingut i GNU GPL v3 per al codi.'
    );
  };

  const normalizeBloc2PromptForm = () => {
    if (currentPageName() !== 'bloc2-antigravity.html') return;
    const form = document.getElementById('prompt-generator-form');
    const duaSelect = document.getElementById('prompt-dua');
    const duaGroup = duaSelect?.closest('.form-group');
    if (!form || !duaSelect || !duaGroup) return;

    const duaLabel = duaGroup.querySelector('label');
    setText(duaLabel, "Suport per a l'aprenentatge (DUA):");
    duaSelect.innerHTML = `
      <option value="Exemples i bastides que facilitin la comprensió sense reduir l’objectiu d’aprenentatge">Exemples i bastides</option>
      <option value="Llenguatge clar i instruccions segmentades, amb el vocabulari clau visible quan calgui">Llenguatge clar</option>
      <option value="Ritme flexible i absència de límits de temps innecessaris quan no formen part de l’objectiu">Ritme flexible</option>
    `;

    if (!document.getElementById('prompt-accessibilitat')) {
      const group = document.createElement('div');
      group.className = 'form-group';
      group.innerHTML = `
        <label for="prompt-accessibilitat">Accessibilitat de la interfície:</label>
        <select id="prompt-accessibilitat">
          <option value="Contrast suficient, focus visible i navegació per teclat">Contrast i teclat</option>
          <option value="Text llegible, estructura semàntica i controls amb etiquetes accessibles">Lectura i etiquetes</option>
          <option value="Disseny adaptable a pantalles petites i ampliació de text sense pèrdua de contingut">Pantalles i ampliació</option>
        </select>
      `;
      duaGroup.before(group);
    }
  };

  const normalizeBloc4Comparison = () => {
    if (currentPageName() !== 'bloc4-pages-sites.html') return;
    document.querySelectorAll('.clean-table .badge-feature').forEach((badge) => {
      badge.classList.remove('badge-positive', 'badge-negative');
      badge.style.background = 'var(--bg-subtle)';
      badge.style.border = '1px solid var(--border-color)';
      badge.style.color = 'var(--text-main)';
    });
  };

  const normalizeBloc6Language = () => {
    if (currentPageName() !== 'bloc6-recursos-visuals.html') return;
    [...document.querySelectorAll('h2, h3')].forEach((heading) => {
      if (heading.textContent.trim() === "Bancs d'imatges reals creades per persones") {
        heading.textContent = "Bancs de fotografies d'autoria humana";
      }
    });
  };

  const normalizeBloc7Language = () => {
    if (currentPageName() !== 'bloc7-bones-practiques.html') return;
    const intro = [...document.querySelectorAll('.pedagogical-highlight')]
      .find((box) => box.textContent.includes('quatre fases'));
    if (intro) {
      intro.innerHTML = intro.innerHTML.replace(
        'estableix deu pautes essencials estructurades en quatre fases:',
        'recull deu pautes essencials per revisar el procés abans de publicar:'
      );
    }
  };

  const normalizeBloc8Checklist = () => {
    if (currentPageName() !== 'bloc8-verificacio.html') return;
    const setCheck = (id, html) => {
      const text = document.getElementById(id)?.closest('.check-item')?.querySelector('.check-text');
      setHtml(text, html);
    };

    setCheck('chk-5', '<strong>5. Accessibilitat web i DUA:</strong> he comprovat que la interfície és llegible i navegable, i he revisat si l’activitat crea barreres o necessita suports perquè l’alumnat hi pugui participar.');
    setCheck('chk-6', '<strong>6. Autoria i crèdits:</strong> s’indiquen l’autoria, la font i la llicència dels recursos de tercers quan correspon.');
    setCheck('chk-8', '<strong>8. Declaració d’ús d’IA:</strong> s’explica quina eina ha assistit la creació i quines comprovacions ha dut a terme el professorat responsable.');
    setCheck('chk-9', '<strong>9. Llicències visibles:</strong> es diferencia la llicència del contingut de la del codi. En aquest projecte, CC BY-SA 4.0 s’aplica al contingut i GNU GPL v3 al codi.');

    const mitLink = document.querySelector('a[href="https://opensource.org/license/mit"]');
    if (mitLink) {
      mitLink.href = 'https://www.gnu.org/licenses/gpl-3.0.html';
      mitLink.textContent = 'GNU General Public License v3.0 (GNU)';
    }
  };

  const normalizeBloc9Language = () => {
    if (currentPageName() !== 'bloc9-per-continuar-explorant.html') return;
    const tag = document.querySelector('.page-hero .page-category-tag');
    setText(tag, 'Bloc 9 - ampliació');

    const offlineCard = [...document.querySelectorAll('.card-item')]
      .find((card) => card.querySelector('h3')?.textContent.includes('Autonomia i funcionament fora de línia'));
    if (offlineCard) {
      setText(
        offlineCard.querySelector('p'),
        'Un cop el model i els components necessaris són al dispositiu, moltes configuracions locals poden funcionar sense connexió. Això redueix la dependència de la xarxa del centre durant l’activitat.'
      );
    }
  };

  const normalizeSiteConsistency = () => {
    normalizeHomeContent();
    normalizeBloc2PromptForm();
    normalizeBloc4Comparison();
    normalizeBloc6Language();
    normalizeBloc7Language();
    normalizeBloc8Checklist();
    normalizeBloc9Language();
    normalizeFooter();
    normalizeGlobalTerminology();
  };

  const normalizeBloc2SectionHeadings = () => {
    if (currentPageName() !== 'bloc2-antigravity.html') return;
    document.querySelectorAll('main#contingut-principal h2').forEach((heading) => {
      if (heading.textContent.trim() === "Ampliació: descàrrega massiva de documents PDF d'un lloc web a Documents") {
        heading.textContent = "Ampliació: descàrrega massiva de documents d'un lloc web";
      }
    });
  };

  const normalizeBloc9SectionHeadings = () => {
    if (currentPageName() !== 'bloc9-per-continuar-explorant.html') return;
    document.querySelectorAll('main#contingut-principal > .content-box > h2').forEach((heading) => {
      heading.textContent = heading.textContent.replace(/^\s*\d+\.\s*/, '');
    });
  };

  const addSectionHeadingIcons = () => {
    const usedIcons = new Set();
    document.querySelectorAll('h2').forEach((heading) => {
      if (heading.closest('.print-source-heading')) return;
      const text = heading.textContent.trim();
      if (!text) return;

      const existingIcon = heading.querySelector('[data-lucide]');
      if (existingIcon) {
        const currentIcon = existingIcon.getAttribute('data-lucide');
        if (currentIcon && !usedIcons.has(currentIcon)) {
          usedIcons.add(currentIcon);
          styleSectionHeading(heading);
          return;
        }
        const replacement = nextUnusedIcon(preferredIconForSectionHeading(text), usedIcons);
        existingIcon.setAttribute('data-lucide', replacement);
        usedIcons.add(replacement);
        styleSectionHeading(heading);
        return;
      }

      const iconName = nextUnusedIcon(preferredIconForSectionHeading(text), usedIcons);
      usedIcons.add(iconName);
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', iconName);
      icon.setAttribute('aria-hidden', 'true');
      icon.style.width = '24px';
      icon.style.height = '24px';
      icon.style.color = 'var(--accent-primary)';
      icon.style.flex = '0 0 24px';
      styleSectionHeading(heading);
      heading.prepend(icon);
    });
  };

  const addBlockOverviewNavigation = () => {
    const pageName = currentPageName();
    const isBlockPage = /^bloc[1-9]-.*\.html$/i.test(pageName);
    const isHomePage = pageName === 'index.html';
    const isCreditsPage = pageName === 'credits.html';
    if (!isBlockPage && !isHomePage && !isCreditsPage) return;

    const main = document.querySelector('main#contingut-principal');
    if (!main || main.querySelector(':scope > .block-overview')) return;

    const sectionHeadings = isHomePage
      ? [...main.querySelectorAll('h2')].filter((heading) =>
          !heading.closest('.workshop-access-card') && !heading.closest('.block-overview'))
      : [...main.querySelectorAll(':scope > .content-box > h2, :scope > section.content-box > h2')]
          .filter((heading) => !heading.closest('.block-overview'));
    if (!sectionHeadings.length) return;

    if (!document.getElementById('block-overview-styles')) {
      const style = document.createElement('style');
      style.id = 'block-overview-styles';
      style.textContent = `
        .block-overview .block-overview-intro { margin:-0.15rem 0 1rem; color:var(--text-muted); }
        .block-overview-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0.75rem; }
        .block-overview-link { display:grid; grid-template-columns:38px minmax(0,1fr) auto; align-items:center; gap:0.75rem; min-width:0; padding:0.78rem 0.9rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-subtle); color:var(--text-main); text-decoration:none; line-height:1.35; transition:border-color .16s ease,background .16s ease,transform .16s ease; }
        .block-overview-link:hover { border-color:var(--accent-primary); background:var(--accent-light); transform:translateY(-1px); }
        .block-overview-link:focus-visible { outline:3px solid var(--accent-primary); outline-offset:2px; }
        .block-overview-icon { width:38px; height:38px; display:inline-flex; align-items:center; justify-content:center; border-radius:var(--radius-md); background:var(--accent-light); color:var(--accent-primary); }
        .block-overview-icon svg { width:19px; height:19px; }
        .block-overview-label { min-width:0; font-weight:650; }
        .block-overview-chevron { display:inline-flex; color:var(--text-muted); transition:transform .16s ease,color .16s ease; }
        .block-overview-chevron svg { width:18px; height:18px; }
        .block-overview-link:hover .block-overview-chevron { color:var(--accent-primary); transform:translateX(2px); }
        @media (max-width:720px) { .block-overview-list { grid-template-columns:1fr; } }
        @media print { .block-overview-link { break-inside:avoid; } }
      `;
      document.head.appendChild(style);
    }

    const usedIds = new Set([...document.querySelectorAll('[id]')].map((element) => element.id).filter(Boolean));
    const slugify = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const sections = sectionHeadings.map((heading, index) => {
      const text = heading.textContent.trim();
      let id = heading.id?.trim();
      if (!id) {
        const baseId = `seccio-${slugify(text) || index + 1}`;
        id = baseId;
        let suffix = 2;
        while (usedIds.has(id)) {
          id = `${baseId}-${suffix}`;
          suffix += 1;
        }
        heading.id = id;
        usedIds.add(id);
      }
      heading.style.scrollMarginTop = '9rem';
      const iconName = heading.querySelector('[data-lucide]')?.getAttribute('data-lucide') || preferredIconForSectionHeading(text);
      return { id, text, iconName };
    });

    const overview = document.createElement('nav');
    overview.className = 'content-box block-overview';
    overview.setAttribute('aria-labelledby', 'block-overview-title');

    const title = document.createElement('h2');
    title.id = 'block-overview-title';
    styleSectionHeading(title);
    const titleIcon = document.createElement('i');
    titleIcon.setAttribute('data-lucide', 'list');
    titleIcon.setAttribute('aria-hidden', 'true');
    titleIcon.style.width = '24px';
    titleIcon.style.height = '24px';
    titleIcon.style.color = 'var(--accent-primary)';
    titleIcon.style.flex = '0 0 24px';
    const titleText = document.createElement('span');
    titleText.textContent = 'En aquest bloc...';
    title.append(titleIcon, titleText);

    const intro = document.createElement('p');
    intro.className = 'block-overview-intro';
    intro.textContent = 'Accediu directament a les seccions principals.';

    const list = document.createElement('div');
    list.className = 'block-overview-list';
    sections.forEach(({ id, text, iconName }) => {
      const link = document.createElement('a');
      link.className = 'block-overview-link';
      link.href = `#${id}`;
      const iconWrap = document.createElement('span');
      iconWrap.className = 'block-overview-icon';
      iconWrap.setAttribute('aria-hidden', 'true');
      iconWrap.innerHTML = `<i data-lucide="${iconName}"></i>`;
      const label = document.createElement('span');
      label.className = 'block-overview-label';
      label.textContent = text;
      const chevron = document.createElement('span');
      chevron.className = 'block-overview-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = '<i data-lucide="chevron-right"></i>';
      link.append(iconWrap, label, chevron);
      list.appendChild(link);
    });

    overview.append(title, intro, list);
    if (isHomePage) {
      const workshopAccess = main.querySelector('.workshop-access-card');
      if (workshopAccess) workshopAccess.after(overview);
      else main.prepend(overview);
    } else {
      main.prepend(overview);
    }
  };

  const enhanceHomeGuideHighlight = () => {
    const highlight = [...document.querySelectorAll('.pedagogical-highlight')]
      .find((box) => box.textContent.trim().startsWith('Aquesta guia està organitzada en pàgines independents'));
    if (!highlight || highlight.querySelector('[data-home-guide-icon]')) return;

    highlight.style.display = 'grid';
    highlight.style.gridTemplateColumns = 'auto 1fr';
    highlight.style.alignItems = 'start';
    highlight.style.gap = '0.8rem';
    const iconWrap = document.createElement('span');
    iconWrap.setAttribute('data-home-guide-icon', '');
    iconWrap.setAttribute('aria-hidden', 'true');
    iconWrap.style.width = '36px';
    iconWrap.style.height = '36px';
    iconWrap.style.display = 'inline-flex';
    iconWrap.style.alignItems = 'center';
    iconWrap.style.justifyContent = 'center';
    iconWrap.style.borderRadius = 'var(--radius-md)';
    iconWrap.style.background = 'var(--accent-light)';
    iconWrap.style.color = 'var(--accent-primary)';
    iconWrap.innerHTML = '<i data-lucide="map"></i>';
    const textWrap = document.createElement('span');
    while (highlight.firstChild) textWrap.appendChild(highlight.firstChild);
    highlight.append(iconWrap, textWrap);
  };

  const enhanceBloc6InfographicPractice = () => {
    const practice = document.querySelector('.infographic-workflow');
    if (!practice) return;

    const sourceBox = practice.closest('.content-box');
    if (sourceBox && practice.parentElement === sourceBox) {
      const trailingBox = document.createElement('div');
      trailingBox.className = 'content-box';
      let node = practice.nextSibling;
      while (node) {
        const next = node.nextSibling;
        trailingBox.appendChild(node);
        node = next;
      }
      const firstTrailingElement = trailingBox.firstElementChild;
      if (firstTrailingElement) firstTrailingElement.style.marginTop = '0';
      sourceBox.after(practice);
      practice.after(trailingBox);
    }

    practice.classList.add('content-box');
    practice.style.marginTop = '0';

    if (!document.getElementById('bloc6-extra-practice-styles')) {
      const style = document.createElement('style');
      style.id = 'bloc6-extra-practice-styles';
      style.textContent = `
        .infographic-workflow .practice-heading-with-icon { display:flex; align-items:center; gap:.6rem; }
        .infographic-workflow .practice-heading-with-icon > svg { width:24px; height:24px; flex:0 0 24px; color:var(--accent-primary); }
        .infographic-workflow h4.practice-heading-with-icon > svg { width:20px; height:20px; flex-basis:20px; }
        .infographic-workflow .pedagogy-infographic__grid { display:grid!important; grid-template-columns:minmax(0,1fr) 26px minmax(0,1fr) 26px minmax(0,1fr) 26px minmax(0,1fr)!important; gap:.45rem!important; align-items:stretch; }
        .infographic-workflow .pedagogy-infographic__card { display:flex!important; flex-direction:column; align-items:flex-start; gap:.65rem!important; min-width:0; padding:.85rem!important; }
        .infographic-workflow .pedagogy-infographic__icon { width:38px; height:38px; flex:0 0 38px; }
        .infographic-workflow .pedagogy-infographic__icon svg { width:19px; height:19px; }
        .infographic-workflow .pedagogy-infographic__card h5 { margin:0 0 .28rem; font-size:.88rem; line-height:1.3; }
        .infographic-workflow .pedagogy-infographic__card p { font-size:.76rem; line-height:1.45; }
        .infographic-workflow .pedagogy-infographic__arrow { display:flex; align-items:center; justify-content:center; color:var(--accent-primary); }
        .infographic-workflow .pedagogy-infographic__arrow svg { width:20px; height:20px; }
        .infographic-workflow .pedagogy-infographic__card:nth-of-type(even) .pedagogy-infographic__icon { color:var(--accent-secondary); background:var(--accent-secondary-light); }
        .pedagogical-highlight.pedagogical-highlight-with-icon { display:grid; grid-template-columns:auto 1fr; align-items:start; gap:.8rem; }
        .pedagogical-highlight-icon { width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border-radius:var(--radius-md); background:var(--accent-light); color:var(--accent-primary); }
        .pedagogical-highlight-icon svg { width:20px; height:20px; }
        @media (max-width:760px) {
          .infographic-workflow .pedagogy-infographic__grid { grid-template-columns:1fr!important; gap:.5rem!important; }
          .infographic-workflow .pedagogy-infographic__card { display:grid!important; grid-template-columns:38px 1fr; align-items:start; }
          .infographic-workflow .pedagogy-infographic__arrow { height:22px; transform:rotate(90deg); }
        }
      `;
      document.head.appendChild(style);
    }

    practice.querySelector('.extra-practice-label')?.remove();
    let mainHeading = practice.querySelector('#infografies-html-title');
    if (mainHeading) {
      if (mainHeading.tagName !== 'H2') {
        const h2 = document.createElement('h2');
        h2.id = mainHeading.id;
        h2.className = mainHeading.className;
        mainHeading.replaceWith(h2);
        mainHeading = h2;
      }
      mainHeading.textContent = 'Pràctica extra: infografies pedagògiques amb HTML i icones';
      mainHeading.classList.add('practice-heading-with-icon');
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'layout-template');
      icon.setAttribute('aria-hidden', 'true');
      mainHeading.prepend(icon);
      if (!practice.querySelector(':scope > .lead-desc')) {
        const lead = document.createElement('p');
        lead.className = 'lead-desc';
        lead.textContent = 'Una pràctica opcional per convertir contingut pedagògic revisat en una infografia visual reutilitzable';
        mainHeading.after(lead);
      }
    }

    const promoteBloc6SectionHeading = (texts) => {
      const accepted = Array.isArray(texts) ? texts : [texts];
      const heading = [...document.querySelectorAll('h3')]
        .find((item) => accepted.includes(item.textContent.trim()));
      if (!heading) return;
      const h2 = document.createElement('h2');
      h2.id = heading.id;
      h2.className = heading.className;
      h2.style.cssText = heading.style.cssText;
      while (heading.firstChild) h2.appendChild(heading.firstChild);
      heading.replaceWith(h2);
    };

    promoteBloc6SectionHeading(["Bancs d'imatges reals creades per persones", "Bancs de fotografies d'autoria humana"]);
    promoteBloc6SectionHeading("Com citar adequadament a peu d'imatge: la regla TASL");

    const note = practice.querySelector('.infographic-note');
    if (note) {
      note.classList.remove('infographic-note');
      note.classList.add('pedagogical-highlight');
      note.style.marginTop = '1.25rem';
    }

    const sampleHeading = [...practice.querySelectorAll('h4')]
      .find((heading) => heading.textContent.includes('Mostra inserida directament amb HTML i Lucide'));
    if (sampleHeading && !sampleHeading.querySelector('[data-lucide]')) {
      sampleHeading.classList.add('practice-heading-with-icon');
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'code-2');
      icon.setAttribute('aria-hidden', 'true');
      sampleHeading.prepend(icon);
    }

    const infographicGrid = practice.querySelector('.pedagogy-infographic__grid');
    if (infographicGrid && !infographicGrid.querySelector('.pedagogy-infographic__arrow')) {
      const cards = [...infographicGrid.querySelectorAll('.pedagogy-infographic__card')];
      cards.slice(0, -1).forEach((card) => {
        const arrow = document.createElement('span');
        arrow.className = 'pedagogy-infographic__arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.innerHTML = '<i data-lucide="arrow-right"></i>';
        card.after(arrow);
      });
    }

    const promptBoxes = practice.querySelectorAll('.infographic-prompt-box');
    const promptHeadings = [...practice.querySelectorAll('h4')]
      .filter((heading) => heading.textContent.includes("Model d'indicació"));
    if (promptHeadings[0]) promptHeadings[0].textContent = "Model d'indicació per copiar i enganxar";
    if (promptBoxes[0]) {
      const title = promptBoxes[0].querySelector('.infographic-prompt-head strong');
      const pre = promptBoxes[0].querySelector('pre');
      if (title) title.textContent = 'Indicació - de l’HTML revisable al PNG';
      if (pre) {
        pre.id = 'infographic-prompt-html';
        pre.textContent = `Crea una infografia pedagògica sobre [CONTINGUT] a partir exclusivament de la informació que t'adjunto.

Construeix-la primer en HTML i CSS editable. Utilitza icones Lucide coherents amb el significat de cada bloc i evita elements purament decoratius. Organitza el contingut amb una jerarquia visual clara i textos breus. La composició ha de continuar sent llegible en pantalles petites.

No inventis dades ni completis buits pel teu compte. Si detectes una afirmació dubtosa, una simplificació excessiva o un contingut que caldria verificar, assenyala-ho abans de donar la infografia per tancada.

El component ha de tenir el fons exterior transparent. Les capses, el text i les icones han de conservar prou contrast perquè funcioni tant sobre un fons clar com sobre un fons fosc.

Mostra'm primer el resultat en HTML i CSS i atura't aquí. Vull revisar el contingut i la composició abans de convertir-lo en imatge.

Quan et confirmi que la versió està validada i et demani l'exportació, no redissenyis ni reinterpretis la infografia. Renderitza fidelment l'HTML i el CSS aprovats, incloses les icones SVG de Lucide. Exporta només el component de la infografia a PNG amb transparència real, sense marges innecessaris ni text tallat.`;
      }
    }
    if (promptHeadings[1]) promptHeadings[1].remove();
    if (promptBoxes[1]) promptBoxes[1].remove();
  };

  const script = document.createElement('script');
  script.src = 'site-core.js?v=4';
  script.onload = () => {
    const start = () => {
      normalizeBloc2SectionHeadings();
      normalizeBloc9SectionHeadings();
      enhanceHomeGuideHighlight();
      enhanceBloc6InfographicPractice();
      normalizeSiteConsistency();
      addSectionHeadingIcons();
      addBlockOverviewNavigation();
      initSite();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  };
  script.onerror = () => console.error('No s’ha pogut carregar la funcionalitat compartida del lloc');
  document.head.appendChild(script);
})();