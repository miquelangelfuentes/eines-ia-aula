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
    [/llic[eè]nc|creative commons|copyright|drets/i, 'scale'],
    [/imatg|icona|visual/i, 'image'],
    [/accessibilitat|\bdua\b/i, 'accessibility'],
    [/bones pràctiques|criteri|seguretat|privacitat|responsable/i, 'shield-check'],
    [/verific|comprov|prova|revisa/i, 'search'],
    [/ia local|models locals|offline|\blocal\b/i, 'hard-drive'],
    [/cr[eè]dit|autoria|font|refer[eè]nc/i, 'info'],
    [/continuar|explorar|tutorial|vídeo|recursos/i, 'book-open'],
  ];

  const fallbackHeadingIcons = [
    'file-text',
    'compass',
    'layers',
    'pencil-ruler',
    'folder-tree',
    'braces',
    'code-2',
    'mouse-pointer-click',
    'rocket',
    'settings-2',
    'file-code-2',
    'folder-code',
    'badge-check',
    'cloud',
    'link',
    'key-round',
    'upload',
    'history',
    'share-2',
    'network',
    'file-check-2',
    'library',
    'palette',
    'shapes',
    'eye',
    'keyboard',
    'contrast',
    'circle-check-big',
    'list-checks',
    'scan-search',
    'microscope',
    'database',
    'cpu',
    'server',
    'laptop',
    'package-open',
    'boxes',
    'plug',
    'circle-help',
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

      sourceBox.after(practice);
      practice.after(trailingBox);
    }

    practice.classList.add('content-box');
    practice.style.marginTop = '0';

    const style = document.createElement('style');
    style.id = 'bloc6-extra-practice-styles';
    style.textContent = `
      .infographic-workflow .practice-heading-with-icon {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      .infographic-workflow .practice-heading-with-icon > svg {
        width: 24px;
        height: 24px;
        flex: 0 0 24px;
        color: var(--accent-primary);
      }
      .infographic-workflow h4.practice-heading-with-icon > svg {
        width: 20px;
        height: 20px;
        flex-basis: 20px;
      }
      .pedagogical-highlight.pedagogical-highlight-with-icon {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: start;
        gap: 0.8rem;
      }
      .pedagogical-highlight-icon {
        width: 36px;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        background: var(--accent-light);
        color: var(--accent-primary);
      }
      .pedagogical-highlight-icon svg {
        width: 20px;
        height: 20px;
      }
    `;
    document.head.appendChild(style);

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

    const note = practice.querySelector('.infographic-note');
    if (note) {
      note.classList.remove('infographic-note');
      note.classList.add('pedagogical-highlight');
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

    const promptBoxes = practice.querySelectorAll('.infographic-prompt-box');
    const promptHeadings = [...practice.querySelectorAll('h4')]
      .filter((heading) => heading.textContent.includes("Model d'indicació"));

    if (promptHeadings[0]) {
      promptHeadings[0].textContent = "Model d'indicació per copiar i enganxar";
    }

    if (promptBoxes[0]) {
      const title = promptBoxes[0].querySelector('.infographic-prompt-head strong');
      const pre = promptBoxes[0].querySelector('pre');
      if (title) title.textContent = 'Indicació - de l’HTML revisable al PNG';
      if (pre) {
        pre.id = 'infographic-prompt-html';
        pre.textContent = `Crea una infografia pedagògica sobre [CONTINGUT] a partir exclusivament de la informació que t'adjunto.

Construeix-la primer en HTML i CSS editable. Utilitza icones Lucide coherents amb el significat de cada bloc i evita elements purament decoratius. Organitza el contingut amb una jerarquia visual clara, textos breus i una composició que continuï sent llegible en pantalles petites.

No inventis dades ni completis buits pel teu compte. Si detectes una afirmació dubtosa, una simplificació excessiva o un contingut que caldria verificar, assenyala-ho abans de donar la infografia per tancada.

El component ha de tenir el fons exterior transparent. Les capses, el text i les icones han de conservar prou contrast perquè funcioni tant sobre un fons clar com sobre un fons fosc.

Mostra'm primer el resultat en HTML i CSS i atura't aquí. Vull revisar el contingut, la jerarquia i la composició abans de convertir-lo en imatge.

Quan et confirmi que la versió està validada i et demani l'exportació, no redissenyis ni reinterpretis la infografia. Renderitza fidelment l'HTML i el CSS aprovats, incloses les icones SVG de Lucide. Exporta només el component de la infografia a PNG amb transparència real, sense marges innecessaris, text tallat ni solapaments.`;
      }
    }

    if (promptHeadings[1]) promptHeadings[1].remove();
    if (promptBoxes[1]) promptBoxes[1].remove();

    const attributionHighlight = [...document.querySelectorAll('.pedagogical-highlight')]
      .find((box) => box.textContent.includes('aprenen per imitació el valor del treball dels altres'));
    if (attributionHighlight && !attributionHighlight.querySelector('.pedagogical-highlight-icon')) {
      attributionHighlight.classList.add('pedagogical-highlight-with-icon');
      const iconWrap = document.createElement('span');
      iconWrap.className = 'pedagogical-highlight-icon';
      iconWrap.setAttribute('aria-hidden', 'true');
      iconWrap.innerHTML = '<i data-lucide="graduation-cap"></i>';

      const textWrap = document.createElement('span');
      while (attributionHighlight.firstChild) {
        textWrap.appendChild(attributionHighlight.firstChild);
      }
      attributionHighlight.append(iconWrap, textWrap);
    }
  };

  const script = document.createElement('script');
  script.src = 'site-core.js?v=3';
  script.onload = () => {
    const start = () => {
      /* Afegim i dedupliquem les icones abans que initSite() executi Lucide.
         D'aquesta manera els <i data-lucide> existents encara es poden detectar
         i no es crea una segona icona al mateix títol. */
      enhanceBloc6InfographicPractice();
      addSectionHeadingIcons();
      initSite();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  };
  script.onerror = () => console.error('No s’ha pogut carregar la funcionalitat compartida del lloc');
  document.head.appendChild(script);
})();
