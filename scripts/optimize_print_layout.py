#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "imprimir-tot.html"

MARKER = """      .print-source-heading p { display: none; }
"""

COMPACT_PRINT_CSS = """      .print-source-heading p { display: none; }

      /* Paginació compacta del dossier complet. */
      .print-block-section {
        page-break-before: auto;
        break-before: auto;
      }

      .print-block-section + .print-block-section {
        margin-top: 1.75rem;
      }

      .print-source-heading {
        page-break-after: avoid;
        break-after: avoid-page;
      }

      /* Els contenidors grans no han d'obligar a saltar una pàgina sencera. */
      .print-doc-wrapper .content-box {
        page-break-inside: auto !important;
        break-inside: auto !important;
        background: transparent !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin-bottom: 1.5rem !important;
      }

      .print-doc-wrapper .ordered-steps,
      .print-doc-wrapper .cards-grid,
      .print-doc-wrapper .clean-grid,
      .print-doc-wrapper .ordered-step-item {
        page-break-inside: auto !important;
        break-inside: auto !important;
      }

      /* Elements petits que convé mantenir sencers. */
      .print-doc-wrapper figure,
      .print-doc-wrapper .card-item,
      .print-doc-wrapper .pedagogical-highlight {
        page-break-inside: avoid;
        break-inside: avoid-page;
      }

      .print-doc-wrapper h2,
      .print-doc-wrapper h3,
      .print-doc-wrapper h4 {
        page-break-after: avoid;
        break-after: avoid-page;
      }

      .print-doc-wrapper p,
      .print-doc-wrapper li {
        orphans: 3;
        widows: 3;
      }
"""


def main() -> None:
    html = OUTPUT.read_text(encoding="utf-8")
    if COMPACT_PRINT_CSS in html:
        print("Paginació compacta ja aplicada.")
        return
    if MARKER not in html:
        raise SystemExit("No s'ha trobat el punt d'inserció dels estils d'impressió.")

    html = html.replace(MARKER, COMPACT_PRINT_CSS, 1)
    OUTPUT.write_text(html, encoding="utf-8")
    print("Paginació del dossier optimitzada per reduir espais buits.")


if __name__ == "__main__":
    main()
