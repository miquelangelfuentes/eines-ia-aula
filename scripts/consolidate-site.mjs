import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';

const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, c) => fs.writeFileSync(path.join(root, p), c, 'utf8');
const fixes = read('site-content-fixes.js');
const overrides = read('site-content-overrides.js');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

function heading(doc, selector, start) {
  return [...doc.querySelectorAll(selector)].find(el => el.textContent.trim().startsWith(start));
}

function addOrientation(doc, file) {
  if (!['bloc2-antigravity.html', 'bloc3-github.html'].includes(file)) return;
  const main = doc.querySelector('main#contingut-principal');
  if (!main || main.querySelector('.usage-paths')) return;
  const boxes = [...main.querySelectorAll(':scope > .content-box')];
  if (!boxes.length) return;
  boxes[0].id ||= 'guia-consulta';
  const practicalHeading = [...doc.querySelectorAll('h2,h3')].find(h => /pràctica|pràctic/i.test(h.textContent));
  const practicalTarget = practicalHeading?.closest('.content-box') || boxes[Math.min(1, boxes.length - 1)];
  practicalTarget.id ||= 'practica-taller';
  const nav = doc.createElement('nav');
  nav.className = 'usage-paths';
  nav.setAttribute('aria-label', 'Orientació d’ús del bloc');
  nav.innerHTML = `
    <a class="usage-path" href="#${practicalTarget.id}">
      <strong>Durant el taller</strong>
      <span>Prioritzeu els passos guiats i les activitats pràctiques. Si una configuració us encalla, continueu amb el grup i torneu-hi després.</span>
    </a>
    <a class="usage-path" href="#${boxes[0].id}">
      <strong>Per consultar després</strong>
      <span>Feu servir la pàgina com a guia per repetir el procés amb calma i recuperar els detalls que no cal memoritzar durant la sessió.</span>
    </a>`;
  main.insertBefore(nav, main.firstChild);
}

function addDependencyDecision(doc, file) {
  if (file !== 'bloc7-bones-practiques.html') return;
  const h = heading(doc, 'h3', 'Decidir quins recursos convé desar en local');
  const body = h?.closest('.vibe-body');
  if (!body || body.querySelector('.dependency-decision')) return;
  const box = doc.createElement('div');
  box.className = 'dependency-decision';
  box.innerHTML = `
    <strong>Pregunta de decisió</strong>
    <div><span>Si aquest servei falla, l’activitat deixa de funcionar?</span><b>Prioritzeu una còpia local quan la llicència ho permeti.</b></div>
    <div><span>Si falla, només perdeu una ampliació o un enllaç de consulta?</span><b>La dependència externa pot ser assumible.</b></div>`;
  body.appendChild(box);
}

function addNoScript(doc) {
  if (doc.querySelector('.noscript-notice')) return;
  const body = doc.body;
  if (!body) return;
  const ns = doc.createElement('noscript');
  ns.innerHTML = '<div class="noscript-notice"><strong>JavaScript està desactivat.</strong> Podeu llegir el contingut del material, però algunes funcions interactives, com el qüestionari, el generador d’indicacions o la llista de verificació, no estaran disponibles.</div>';
  const skip = body.querySelector('.skip-link');
  if (skip?.nextSibling) body.insertBefore(ns, skip.nextSibling); else body.insertBefore(ns, body.firstChild);
}

function addImageDimensions(doc) {
  for (const img of doc.querySelectorAll('img[src]')) {
    const src = img.getAttribute('src');
    if (!src || /^(https?:|data:|\/\/)/i.test(src)) continue;
    const clean = src.split(/[?#]/)[0];
    const disk = path.join(root, clean);
    if (!fs.existsSync(disk)) continue;
    try {
      const info = execFileSync('file', ['-b', disk], { encoding: 'utf8' });
      const m = info.match(/(\d+)\s*x\s*(\d+)/i);
      if (m) {
        img.setAttribute('width', m[1]);
        img.setAttribute('height', m[2]);
      }
    } catch {}
    if (img.closest('.hero-image-banner')) {
      img.removeAttribute('loading');
      img.setAttribute('fetchpriority', 'high');
    } else {
      img.setAttribute('loading', 'lazy');
    }
  }
}

function bumpAssets(doc) {
  for (const link of doc.querySelectorAll('link[rel="stylesheet"][href^="styles.css"]')) link.setAttribute('href', 'styles.css?v=9');
  for (const s of doc.querySelectorAll('script[src^="app.js"]')) s.setAttribute('src', 'app.js?v=5');
}

for (const file of htmlFiles) {
  const dom = new JSDOM(read(file), { runScripts: 'outside-only' });
  const { window } = dom;
  window.eval(fixes);
  window.eval(overrides);
  if (typeof window.applyContentCorrections === 'function') window.applyContentCorrections();
  if (typeof window.applyLateContentCorrections === 'function') window.applyLateContentCorrections();
  const doc = window.document;
  addOrientation(doc, file);
  addDependencyDecision(doc, file);
  addNoScript(doc);
  addImageDimensions(doc);
  bumpAssets(doc);
  write(file, dom.serialize().replace(/^<!DOCTYPE html>/i, '<!DOCTYPE html>'));
}

// JavaScript d’entrada: només funcionalitat, sense correccions de contingut.
write('app.js', `/* Carrega la funcionalitat compartida del lloc. */\n(() => {\n  const script = document.createElement('script');\n  script.src = 'site-core.js?v=2';\n  script.onload = () => {\n    const start = () => initSite();\n    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });\n    else start();\n  };\n  script.onerror = () => console.error('No s’ha pogut carregar la funcionalitat compartida del lloc');\n  document.head.appendChild(script);\n})();\n`);

// Millores d’accessibilitat i robustesa de la funcionalitat compartida.
let core = read('site-core.js');
core = `const prefersReducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;\nfunction scrollToElement(el){if(el)el.scrollIntoView({behavior:prefersReducedMotion()?'auto':'smooth',block:'start'})}\nfunction ensureLiveRegion(){let el=document.getElementById('site-live-region');if(!el){el=document.createElement('div');el.id='site-live-region';el.className='visually-hidden';el.setAttribute('aria-live','polite');el.setAttribute('aria-atomic','true');document.body.appendChild(el)}return el}\nfunction announce(message){const el=ensureLiveRegion();el.textContent='';setTimeout(()=>{el.textContent=message},20)}\n` + core;
core = core.replace('function initSite(){initTheme();initLucide();initPrintMenu();initKeyboardNavigation();initCopyButtons();initPromptGenerator();initChecklist();initDiagnosticQuiz()}', 'function initSite(){ensureLiveRegion();initTheme();initLucide();initPrintMenu();initKeyboardNavigation();initCopyButtons();initPromptGenerator();initChecklist();initDiagnosticQuiz()}');
core = core.replace("function initKeyboardNavigation(){const p=document.querySelector('link[rel=\"prev\"]')||document.querySelector('.btn-pagination[data-nav=\"prev\"]'),n=document.querySelector('link[rel=\"next\"]')||document.querySelector('.btn-pagination[data-nav=\"next\"]');addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;if(e.key==='ArrowRight'&&n)location.href=n.href;if(e.key==='ArrowLeft'&&p)location.href=p.href})}", "function initKeyboardNavigation(){const p=document.querySelector('link[rel=\"prev\"]')||document.querySelector('.btn-pagination[data-nav=\"prev\"]'),n=document.querySelector('link[rel=\"next\"]')||document.querySelector('.btn-pagination[data-nav=\"next\"]');addEventListener('keydown',e=>{const t=e.target;if(['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(t?.tagName)||t?.isContentEditable)return;if(e.key==='ArrowRight'&&n)location.href=n.href;if(e.key==='ArrowLeft'&&p)location.href=p.href})}");
core = core.replace("function initCopyButtons(){document.querySelectorAll('.copy-btn').forEach(b=>b.addEventListener('click',async()=>{const e=document.getElementById(b.dataset.target);if(!e)return;await navigator.clipboard.writeText(e.innerText.trim());const o=b.innerText;b.innerText='✓ Copiat!';setTimeout(()=>b.innerText=o,2000)}))}", "function initCopyButtons(){document.querySelectorAll('.copy-btn').forEach(b=>b.addEventListener('click',async()=>{const e=document.getElementById(b.dataset.target);if(!e)return;try{await navigator.clipboard.writeText(e.innerText.trim());const o=b.innerText;b.innerText='✓ Copiat!';announce('Contingut copiat al porta-retalls');setTimeout(()=>b.innerText=o,2000)}catch{announce('No s’ha pogut copiar el contingut')}}))}");
core = core.replace('5. Independència: evita dependències externes fràgils i mantén els recursos necessaris dins del projecte quan sigui possible.', '5. Recursos i dependències: mantén dins del projecte els recursos essencials quan la llicència ho permeti. Si deixes una dependència externa, assegura que la seva absència no impedeixi completar l’activitat.');
core = core.replaceAll("c.scrollIntoView({behavior:'smooth',block:'start'})", 'scrollToElement(c)');
core = core.replaceAll("r.scrollIntoView({behavior:'smooth',block:'start'})", 'scrollToElement(r)');
core = core.replace("b.textContent=i+1;b.title=`Pregunta ${i+1}`;b.addEventListener('click',()=>go(i+1));", "b.textContent=i+1;b.title=`Pregunta ${i+1}`;b.setAttribute('aria-label',`Pregunta ${i+1}`);b.addEventListener('click',()=>go(i+1));");
core = core.replace("b.classList.toggle('active',i+1===step);b.classList.toggle('answered',!!qs[i].querySelector('input[type=\"radio\"]:checked'))", "b.classList.toggle('active',i+1===step);b.toggleAttribute('aria-current',i+1===step);b.classList.toggle('answered',!!qs[i].querySelector('input[type=\"radio\"]:checked'))");
core = core.replace("await navigator.clipboard.writeText(r.textContent);const o=b.innerText;b.innerText='✓ Indicació copiada!';setTimeout(()=>b.innerText=o,2000)", "try{await navigator.clipboard.writeText(r.textContent);const o=b.innerText;b.innerText='✓ Indicació copiada!';announce('Indicació copiada al porta-retalls');setTimeout(()=>b.innerText=o,2000)}catch{announce('No s’ha pogut copiar la indicació')}");
write('site-core.js', core);

let css = read('styles.css');
if (!css.includes('ACCESSIBILITAT I RESILIÈNCIA 2026')) {
  css += `\n\n/* ==========================================================================\n   ACCESSIBILITAT I RESILIÈNCIA 2026\n   ========================================================================== */\n:where(a, button, input, select, textarea, [tabindex]):focus-visible {\n  outline: 3px solid var(--border-focus);\n  outline-offset: 3px;\n}\n\n.quiz-option-card:focus-within {\n  outline: 3px solid var(--border-focus);\n  outline-offset: 2px;\n}\n\n.visually-hidden {\n  position: absolute !important;\n  width: 1px !important;\n  height: 1px !important;\n  padding: 0 !important;\n  margin: -1px !important;\n  overflow: hidden !important;\n  clip: rect(0, 0, 0, 0) !important;\n  white-space: nowrap !important;\n  border: 0 !important;\n}\n\n.noscript-notice {\n  max-width: var(--max-width);\n  margin: 1rem auto;\n  padding: 0.85rem 1rem;\n  background: var(--accent-warm-light);\n  border: 1px solid var(--accent-warm);\n  border-radius: var(--radius-md);\n  color: var(--text-main);\n  font-size: 0.9rem;\n}\n\n.usage-paths {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1rem;\n  margin-bottom: 1.5rem;\n}\n\n.usage-path {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n  padding: 1rem 1.1rem;\n  background: var(--bg-surface);\n  border: 1px solid var(--border-color);\n  border-radius: var(--radius-md);\n  color: var(--text-main);\n  text-decoration: none;\n  box-shadow: var(--shadow-sm);\n}\n\n.usage-path:hover, .usage-path:focus-visible {\n  border-color: var(--accent-primary);\n}\n\n.usage-path span {\n  color: var(--text-muted);\n  font-size: 0.875rem;\n  line-height: 1.5;\n}\n\n.dependency-decision {\n  margin-top: 0.85rem;\n  padding: 0.75rem;\n  background: var(--bg-subtle);\n  border: 1px solid var(--border-color);\n  border-radius: var(--radius-sm);\n}\n\n.dependency-decision > strong {\n  display: block;\n  margin-bottom: 0.5rem;\n  color: var(--text-main);\n}\n\n.dependency-decision div {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);\n  gap: 0.75rem;\n  padding: 0.45rem 0;\n  font-size: 0.8rem;\n  line-height: 1.45;\n}\n\n.dependency-decision div + div {\n  border-top: 1px solid var(--border-color);\n}\n\n@media (max-width: 768px) {\n  .usage-paths, .dependency-decision div { grid-template-columns: 1fr; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html { scroll-behavior: auto !important; }\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    transition-delay: 0ms !important;\n  }\n}\n`;
}
write('styles.css', css);

let readme = read('README.md');
readme = readme.replace('- **Accessibilitat:** disseny adaptat a pantalles de qualsevol mida, amb un contrast òptim segons les pautes DUA.', '- **Accessibilitat web:** disseny adaptable, navegació amb teclat, focus visible i reducció de moviment segons les preferències del sistema, prenent WCAG com a referència tècnica.\n- **DUA:** criteris de disseny de l’aprenentatge orientats a detectar barreres i incorporar suports útils per a la participació.');
if (!readme.includes('## Robustesa i dependències')) {
  readme += `\n\n---\n\n## Robustesa i dependències\n\nEls recursos essencials per mostrar o fer funcionar el material es conserven dins del repositori quan la seva llicència permet la redistribució. Les dependències externes es mantenen quan tenen una funció deliberada, com ara documentació oficial o serveis de consulta, i la seva indisponibilitat no impedeix utilitzar el recurs principal.\n\nLes fotografies utilitzades pel lloc es desen a \`assets/images/unsplash/\` i mantenen els crèdits visibles. Lucide es distribueix localment a \`assets/vendor/lucide/\` amb la llicència corresponent. Consulteu \`THIRD_PARTY_NOTICES.md\` per a la traçabilitat dels recursos de tercers.\n\n## Verificació abans del desplegament\n\nEl flux de GitHub Pages executa \`python scripts/validate_site.py\` abans de publicar. La comprovació detecta enllaços i recursos locals inexistents, identificadors duplicats, imatges sense text alternatiu o dimensions, scripts externs essencials i alguns problemes bàsics d’accessibilitat estructural. Aquesta comprovació automàtica complementa, però no substitueix, la revisió manual del recurs i les proves amb teclat.\n`;
}
write('README.md', readme);

// Genera avisos de tercers a partir dels crèdits visibles de les pàgines.
const credits = new Map();
for (const file of htmlFiles) {
  const dom = new JSDOM(read(file));
  for (const img of dom.window.document.querySelectorAll('img[src^="assets/images/unsplash/"]')) {
    const src = img.getAttribute('src');
    if (credits.has(src)) continue;
    const cap = img.closest('figure')?.querySelector('figcaption');
    const links = cap ? [...cap.querySelectorAll('a[href]')].map(a => a.href) : [];
    credits.set(src, { text: cap?.textContent.trim().replace(/\s+/g, ' ') || 'Crèdit visible al lloc', links });
  }
}
let notices = `# Recursos de tercers\n\nAquest fitxer documenta els recursos de tercers que el lloc conserva localment perquè continuï funcionant sense dependre d’un CDN o d’un servidor d’imatges extern. Els crèdits també es mantenen visibles a les pàgines on apareixen.\n\n## Lucide\n\n- **Versió:** 1.59.0\n- **Llicència:** ISC\n- **Fitxer local:** \`assets/vendor/lucide/lucide.min.js\`\n- **Text de llicència:** \`assets/vendor/lucide/LICENSE\`\n- **Projecte:** https://lucide.dev/\n\n## Fotografies d’Unsplash\n\nLes còpies locals següents es distribueixen d’acord amb la llicència d’Unsplash. L’atribució no és un requisit general de la llicència, però es manté com a bona pràctica educativa i per preservar la traçabilitat de cada recurs.\n\n`;
for (const [src, info] of [...credits].sort()) {
  const original = info.links.find(u => /unsplash\.com\/photos\//.test(u)) || info.links.find(u => /unsplash\.com\/@/.test(u)) || '';
  notices += `- **${path.basename(src)}** - ${info.text}${original ? ` - ${original}` : ''}\n`;
}
notices += `\nLlicència d’Unsplash: https://unsplash.com/license\n`;
write('THIRD_PARTY_NOTICES.md', notices);

// Validador sense dependències externes per al CI.
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
write('scripts/validate_site.py', `#!/usr/bin/env python3\nfrom __future__ import annotations\nfrom html.parser import HTMLParser\nfrom pathlib import Path\nfrom urllib.parse import unquote, urlsplit\nimport re\nimport sys\n\nROOT = Path(__file__).resolve().parents[1]\nHTML_FILES = sorted(ROOT.glob('*.html'))\nERRORS: list[str] = []\n\nclass PageParser(HTMLParser):\n    def __init__(self, file: Path):\n        super().__init__(convert_charrefs=True)\n        self.file = file\n        self.ids: list[str] = []\n        self.refs: list[tuple[str, str]] = []\n        self.images: list[dict[str, str]] = []\n        self.external_scripts: list[str] = []\n        self.blank_targets: list[dict[str, str]] = []\n        self.lang = None\n        self.has_title = False\n        self.button_depth = 0\n        self.button_attrs: list[dict[str, str]] = []\n        self.button_text: list[str] = []\n\n    def handle_starttag(self, tag, attrs):\n        a = dict(attrs)\n        if tag == 'html': self.lang = a.get('lang')\n        if tag == 'title': self.has_title = True\n        if 'id' in a: self.ids.append(a['id'])\n        if tag in ('a', 'link') and a.get('href'): self.refs.append(('href', a['href']))\n        if tag in ('script', 'img', 'source') and a.get('src'): self.refs.append(('src', a['src']))\n        if tag == 'img': self.images.append(a)\n        if tag == 'script' and re.match(r'https?://', a.get('src', '')): self.external_scripts.append(a['src'])\n        if tag == 'a' and a.get('target') == '_blank': self.blank_targets.append(a)\n        if tag == 'button':\n            self.button_depth += 1\n            self.button_attrs.append(a)\n            self.button_text.append('')\n\n    def handle_endtag(self, tag):\n        if tag == 'button' and self.button_depth:\n            attrs = self.button_attrs[-1]\n            text = self.button_text[-1].strip()\n            if not text and not attrs.get('aria-label') and not attrs.get('title'):\n                ERRORS.append(f'{self.file.name}: botó sense nom accessible')\n            self.button_depth -= 1\n\n    def handle_data(self, data):\n        if self.button_depth and self.button_text:\n            self.button_text[-1] += data\n\nparsers: dict[Path, PageParser] = {}\nfor file in HTML_FILES:\n    p = PageParser(file)\n    p.feed(file.read_text(encoding='utf-8'))\n    parsers[file] = p\n    if p.lang != 'ca': ERRORS.append(f'{file.name}: falta lang=\"ca\"')\n    if not p.has_title: ERRORS.append(f'{file.name}: falta <title>')\n    for duplicated in sorted({x for x in p.ids if p.ids.count(x) > 1}):\n        ERRORS.append(f'{file.name}: id duplicat #{duplicated}')\n    for img in p.images:\n        src = img.get('src', '')\n        if 'alt' not in img: ERRORS.append(f'{file.name}: imatge sense alt: {src}')\n        if not re.match(r'https?://|data:', src) and (not img.get('width') or not img.get('height')):\n            ERRORS.append(f'{file.name}: imatge local sense width/height: {src}')\n    for src in p.external_scripts:\n        ERRORS.append(f'{file.name}: script essencial extern: {src}')\n    for a in p.blank_targets:\n        rel = set((a.get('rel') or '').split())\n        if 'noopener' not in rel:\n            ERRORS.append(f'{file.name}: target=_blank sense rel=noopener: {a.get(\"href\", \"\")}')\n\nall_ids = {f: set(p.ids) for f, p in parsers.items()}\nfor file, p in parsers.items():\n    for kind, raw in p.refs:\n        if not raw or raw.startswith(('http://','https://','mailto:','tel:','javascript:','data:','//')):\n            continue\n        parts = urlsplit(raw)\n        target_path = unquote(parts.path)\n        target = file if not target_path else (file.parent / target_path).resolve()\n        try:\n            target.relative_to(ROOT.resolve())\n        except ValueError:\n            ERRORS.append(f'{file.name}: referència fora del projecte: {raw}')\n            continue\n        if target_path and not target.exists():\n            ERRORS.append(f'{file.name}: recurs local inexistent: {raw}')\n            continue\n        if parts.fragment and target.suffix.lower() == '.html' and target in all_ids and parts.fragment not in all_ids[target]:\n            ERRORS.append(f'{file.name}: àncora inexistent: {raw}')\n\nfor obsolete in ('site-content-fixes.js', 'site-content-overrides.js'):\n    if (ROOT / obsolete).exists(): ERRORS.append(f'Fitxer temporal encara present: {obsolete}')\nfor file in HTML_FILES + [ROOT / 'app.js']:\n    text = file.read_text(encoding='utf-8')\n    if 'site-content-fixes.js' in text or 'site-content-overrides.js' in text:\n        ERRORS.append(f'{file.name}: encara referencia una capa de correcció dinàmica')\nfor required in ('THIRD_PARTY_NOTICES.md', 'assets/vendor/lucide/LICENSE', 'assets/vendor/lucide/lucide.min.js'):\n    if not (ROOT / required).exists(): ERRORS.append(f'Falta el recurs requerit: {required}')\n\nif ERRORS:\n    print('VALIDACIÓ FALLIDA')\n    for e in ERRORS: print(f'- {e}')\n    sys.exit(1)\nprint(f'Validació correcta: {len(HTML_FILES)} pàgines revisades.')\n`);

// Afegeix la validació al workflow de Pages.
let pages = read('.github/workflows/pages.yml');
if (!pages.includes('Validate site')) {
  pages = pages.replace('      - name: Setup Pages\n', '      - name: Validate site\n        run: python scripts/validate_site.py\n      - name: Setup Pages\n');
}
write('.github/workflows/pages.yml', pages);

// Les capes temporals deixen de ser necessàries.
for (const obsolete of ['site-content-fixes.js', 'site-content-overrides.js']) {
  const p = path.join(root, obsolete);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

console.log('Consolidació completada.');
