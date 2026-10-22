#!/usr/bin/env python3
from __future__ import annotations

from collections import Counter
from html import escape
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "imprimir-tot.html"

SOURCES = [
    ("inici", "Inici", "index.html"),
    ("bloc1", "Bloc 1", "bloc1-marc.html"),
    ("bloc2", "Bloc 2", "bloc2-antigravity.html"),
    ("bloc3", "Bloc 3", "bloc3-github.html"),
    ("bloc4", "Bloc 4", "bloc4-pages-sites.html"),
    ("bloc5", "Bloc 5", "bloc5-llicencies.html"),
    ("bloc6", "Bloc 6", "bloc6-recursos-visuals.html"),
    ("bloc7", "Bloc 7", "bloc7-bones-practiques.html"),
    ("bloc8", "Bloc 8", "bloc8-verificacio.html"),
    ("bloc9", "Bloc 9", "bloc9-per-continuar-explorant.html"),
    ("credits", "Crèdits", "credits.html"),
]

MAIN_RE = re.compile(
    r'<main\b[^>]*\bid=["\']contingut-principal["\'][^>]*>(.*?)</main>',
    re.IGNORECASE | re.DOTALL,
)
H1_RE = re.compile(r'<h1\b[^>]*>(.*?)</h1>', re.IGNORECASE | re.DOTALL)
ID_RE = re.compile(r'\bid=(["\'])([^"\']+)\1', re.IGNORECASE)
PAGE_PAGINATION_RE = re.compile(
    r'<nav\b[^>]*class=["\'][^"\']*\bpage-pagination\b[^"\']*["\'][^>]*>.*?</nav>',
    re.IGNORECASE | re.DOTALL,
)
LAZY_LOADING_RE = re.compile(r'\bloading=(["\'])lazy\1', re.IGNORECASE)
TAG_RE = re.compile(r'<[^>]+>')


def extract_source(path: Path) -> tuple[str, str]:
    text = path.read_text(encoding="utf-8")
    main_match = MAIN_RE.search(text)
    if not main_match:
        raise SystemExit(f"No s'ha trobat <main id=\"contingut-principal\"> a {path.name}")

    content = main_match.group(1).strip()
    content = PAGE_PAGINATION_RE.sub("", content).strip()

    h1_match = H1_RE.search(text)
    title = path.stem
    if h1_match:
        title = TAG_RE.sub("", h1_match.group(1)).strip()
    return title, content


def prepare_print_content(content: str) -> str:
    """Evita que les imatges del dossier quedin fora de la cua de càrrega en imprimir."""
    return LAZY_LOADING_RE.sub(lambda match: f'loading={match.group(1)}eager{match.group(1)}', content)


def namespace_duplicate_ids(content: str, key: str, duplicate_ids: set[str]) -> str:
    ids_here = {match.group(2) for match in ID_RE.finditer(content)}
    mapping = {
        old: f"dossier-{key}-{old}"
        for old in ids_here
        if old in duplicate_ids
    }
    if not mapping:
        return content

    def replace_id(match: re.Match[str]) -> str:
        quote, old = match.group(1), match.group(2)
        return f'id={quote}{mapping.get(old, old)}{quote}'

    content = ID_RE.sub(replace_id, content)

    for old, new in mapping.items():
        content = re.sub(
            rf'\bhref=(["\'])#{re.escape(old)}\1',
            lambda m: f'href={m.group(1)}#{new}{m.group(1)}',
            content,
            flags=re.IGNORECASE,
        )
        content = re.sub(
            rf'\bdata-target=(["\']){re.escape(old)}\1',
            lambda m: f'data-target={m.group(1)}{new}{m.group(1)}',
            content,
            flags=re.IGNORECASE,
        )
        content = re.sub(
            rf'\bfor=(["\']){re.escape(old)}\1',
            lambda m: f'for={m.group(1)}{new}{m.group(1)}',
            content,
            flags=re.IGNORECASE,
        )
        for attr in ("aria-controls", "aria-labelledby", "aria-describedby"):
            content = re.sub(
                rf'\b{attr}=(["\']){re.escape(old)}\1',
                lambda m, a=attr: f'{a}={m.group(1)}{new}{m.group(1)}',
                content,
                flags=re.IGNORECASE,
            )
    return content


def build() -> str:
    sections: list[dict[str, str]] = []
    id_counts: Counter[str] = Counter()

    for key, label, filename in SOURCES:
        title, content = extract_source(ROOT / filename)
        sections.append({
            "key": key,
            "label": label,
            "filename": filename,
            "title": title,
            "content": content,
        })
        id_counts.update(match.group(2) for match in ID_RE.finditer(content))

    duplicate_ids = {value for value, count in id_counts.items() if count > 1}

    section_html: list[str] = []
    for section in sections:
        content = namespace_duplicate_ids(section["content"], section["key"], duplicate_ids)
        content = prepare_print_content(content)

        source_heading = ""
        if section["key"] != "inici":
            source_heading = f'''      <div class="print-source-heading">
        <span class="page-category-tag">{escape(section["label"])}</span>
        <h2>{escape(section["title"])}</h2>
        <p>Contingut sincronitzat automàticament des de <a href="{escape(section["filename"])}">{escape(section["filename"])}</a>.</p>
      </div>\n'''

        section_html.append(
            f'''    <section class="print-block-section" id="dossier-{section["key"]}">
{source_heading}      {content}
    </section>'''
        )

    joined_sections = '\n\n    <hr class="print-section-divider">\n\n'.join(section_html)

    return f'''<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dossier complet per a impressió | Eines d'IA per a l'aula</title>
  <meta name="description" content="Dossier complet i sincronitzat de la formació d'eines d'intel·ligència artificial per a l'aula, preparat per imprimir o desar en PDF.">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://miquelangelfuentes.github.io/eines-ia-aula/imprimir-tot.html">
  <meta property="og:title" content="Dossier complet per a impressió | Eines d'IA per a l'aula">
  <meta property="og:description" content="Dossier complet i sincronitzat de la formació preparat per imprimir o desar en PDF.">
  <meta property="og:image" content="https://miquelangelfuentes.github.io/eines-ia-aula/assets/images/unsplash/inici-taller.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Dossier complet per a impressió | Eines d'IA per a l'aula">
  <meta name="twitter:description" content="Dossier complet i sincronitzat de la formació preparat per imprimir o desar en PDF.">
  <meta name="twitter:image" content="https://miquelangelfuentes.github.io/eines-ia-aula/assets/images/unsplash/inici-taller.jpg">
  <link rel="stylesheet" href="styles.css?v=9">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="alternate icon" type="image/png" href="favicon.png">
  <link rel="apple-touch-icon" href="favicon.png">
  <style>
    @media screen {{
      .print-doc-wrapper {{ max-width: 900px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }}
      .print-section-divider {{ margin: 3.5rem 0 2.5rem; border: 0; border-top: 2px dashed var(--border-color); }}
      .print-source-heading {{ margin: 0 0 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }}
      .print-source-heading h2 {{ margin: .65rem 0 .35rem; }}
      .print-source-heading p {{ margin: 0; color: var(--text-muted); font-size: .85rem; }}
    }}
    @media print {{
      .print-doc-wrapper {{ max-width: 100%; margin: 0; padding: 0; }}
      .print-section-divider {{ display: none; }}
      .print-block-section {{ page-break-before: always; }}
      .print-block-section:first-of-type {{ page-break-before: avoid; }}
      .print-source-heading p {{ display: none; }}
    }}
  </style>
</head>
<body>
  <!-- Fitxer generat automàticament amb scripts/build_print.py. No l'editeu manualment. -->
  <a href="#contingut-principal" class="skip-link">Salta directament al contingut</a>
  <noscript><div class="noscript-notice"><strong>JavaScript està desactivat.</strong> El dossier continua sent llegible i imprimible, però els controls interactius no estaran disponibles.</div></noscript>

  <aside class="print-banner-actions" aria-label="Accions d'impressió">
    <div class="print-banner-inner">
      <div class="print-banner-info">
        <i data-lucide="printer" style="width:20px;height:20px;color:var(--accent-secondary);"></i>
        <span>Dossier complet sincronitzat amb els blocs del web</span>
      </div>
      <div class="print-banner-buttons">
        <button type="button" class="btn-primary-action" onclick="window.print()" style="padding:.45rem .95rem;font-size:.875rem;">
          <i data-lucide="printer" style="width:16px;height:16px;margin-right:4px;"></i>
          <span>Imprimir o desar en PDF</span>
        </button>
        <a href="index.html" class="btn-pagination" style="padding:.45rem .85rem;font-size:.875rem;text-decoration:none;">
          <i data-lucide="chevron-left" style="width:15px;height:15px;margin-right:4px;"></i>
          <span>Tornar a l'inici</span>
        </a>
      </div>
    </div>
  </aside>

  <div class="print-doc-wrapper">
    <header class="page-hero" style="border-radius:var(--radius-lg);margin-bottom:2rem;">
      <div class="page-hero-inner">
        <span class="page-category-tag">Dossier docent de la formació - Servei Educatiu del Vallès Occidental II - Octubre, 2026</span>
        <h1 style="margin-top:.5rem;font-size:2.2rem;">Eines d'intel·ligència artificial per a l'aula</h1>
        <div class="hero-impact-headline">
          <i data-lucide="trending-up" class="lucide" style="width:20px;height:20px;color:var(--accent-secondary);flex-shrink:0;"></i>
          <span>Amb el <em>vibe coding</em> no es guanya temps, però permet elevar els resultats.</span>
        </div>
        <p class="page-hero-subtitle" style="font-size:1.05rem;line-height:1.6;">
          De la idea docent a la publicació d'un recurs web interactiu amb <strong>Google Antigravity</strong> i <strong>GitHub Pages</strong>, amb criteris de <strong><em>vibe coding</em> responsable</strong>, accessibilitat web i DUA.
        </p>
        <p style="margin-top:1rem;color:var(--text-muted);font-size:.9rem;">
          Aquesta versió es genera a partir dels blocs del lloc abans de cada desplegament per mantenir el dossier alineat amb el contingut publicat.
        </p>
      </div>
    </header>

    <main id="contingut-principal">
{joined_sections}
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <p>Dossier generat automàticament a partir de les pàgines del taller.</p>
        <p><a href="index.html">Tornar al lloc web</a></p>
      </div>
    </footer>
  </div>

  <script src="assets/vendor/lucide/lucide.min.js"></script>
  <script src="app.js?v=5"></script>
  <script>
    const waitForPrintableImages = () => {{
      const images = Array.from(document.images);
      images.forEach((img) => {{ img.loading = 'eager'; }});

      return Promise.all(images.map((img) => {{
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {{
          img.addEventListener('load', resolve, {{ once: true }});
          img.addEventListener('error', resolve, {{ once: true }});
        }});
      }}));
    }};

    const printWhenReady = async () => {{
      const imageWait = waitForPrintableImages();
      const fontWait = document.fonts?.ready ?? Promise.resolve();
      const timeout = new Promise((resolve) => window.setTimeout(resolve, 8000));

      await Promise.race([
        Promise.all([imageWait, fontWait]),
        timeout,
      ]);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      window.print();
    }};

    if (new URLSearchParams(window.location.search).get('print') === '1') {{
      if (document.readyState === 'complete') {{
        printWhenReady();
      }} else {{
        window.addEventListener('load', printWhenReady, {{ once: true }});
      }}
    }}
  </script>
</body>
</html>
'''


def main() -> None:
    OUTPUT.write_text(build(), encoding="utf-8")
    print(f"Dossier generat: {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
