#!/usr/bin/env python3
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob('*.html'))
ERRORS: list[str] = []

class PageParser(HTMLParser):
    def __init__(self, file: Path):
        super().__init__(convert_charrefs=True)
        self.file = file
        self.ids: list[str] = []
        self.refs: list[tuple[str, str]] = []
        self.images: list[dict[str, str]] = []
        self.external_scripts: list[str] = []
        self.blank_targets: list[dict[str, str]] = []
        self.lang = None
        self.has_title = False
        self.button_depth = 0
        self.button_attrs: list[dict[str, str]] = []
        self.button_text: list[str] = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = a.get('lang')
        if tag == 'title': self.has_title = True
        if 'id' in a: self.ids.append(a['id'])
        if tag in ('a', 'link') and a.get('href'): self.refs.append(('href', a['href']))
        if tag in ('script', 'img', 'source') and a.get('src'): self.refs.append(('src', a['src']))
        if tag == 'img': self.images.append(a)
        if tag == 'script' and re.match(r'https?://', a.get('src', '')): self.external_scripts.append(a['src'])
        if tag == 'a' and a.get('target') == '_blank': self.blank_targets.append(a)
        if tag == 'button':
            self.button_depth += 1
            self.button_attrs.append(a)
            self.button_text.append('')

    def handle_endtag(self, tag):
        if tag == 'button' and self.button_depth:
            attrs = self.button_attrs[-1]
            text = self.button_text[-1].strip()
            if not text and not attrs.get('aria-label') and not attrs.get('title'):
                ERRORS.append(f'{self.file.name}: botó sense nom accessible')
            self.button_depth -= 1

    def handle_data(self, data):
        if self.button_depth and self.button_text:
            self.button_text[-1] += data

parsers: dict[Path, PageParser] = {}
for file in HTML_FILES:
    p = PageParser(file)
    p.feed(file.read_text(encoding='utf-8'))
    parsers[file] = p
    if p.lang != 'ca': ERRORS.append(f'{file.name}: falta lang="ca"')
    if not p.has_title: ERRORS.append(f'{file.name}: falta <title>')
    for duplicated in sorted({x for x in p.ids if p.ids.count(x) > 1}):
        ERRORS.append(f'{file.name}: id duplicat #{duplicated}')
    for img in p.images:
        src = img.get('src', '')
        if 'alt' not in img: ERRORS.append(f'{file.name}: imatge sense alt: {src}')
        if not re.match(r'https?://|data:', src) and (not img.get('width') or not img.get('height')):
            ERRORS.append(f'{file.name}: imatge local sense width/height: {src}')
    for src in p.external_scripts:
        ERRORS.append(f'{file.name}: script essencial extern: {src}')
    for a in p.blank_targets:
        rel = set((a.get('rel') or '').split())
        if 'noopener' not in rel:
            ERRORS.append(f'{file.name}: target=_blank sense rel=noopener: {a.get("href", "")}')

all_ids = {f: set(p.ids) for f, p in parsers.items()}
for file, p in parsers.items():
    for kind, raw in p.refs:
        if not raw or raw.startswith(('http://','https://','mailto:','tel:','javascript:','data:','//')):
            continue
        parts = urlsplit(raw)
        target_path = unquote(parts.path)
        target = file if not target_path else (file.parent / target_path).resolve()
        try:
            target.relative_to(ROOT.resolve())
        except ValueError:
            ERRORS.append(f'{file.name}: referència fora del projecte: {raw}')
            continue
        if target_path and not target.exists():
            ERRORS.append(f'{file.name}: recurs local inexistent: {raw}')
            continue
        if parts.fragment and target.suffix.lower() == '.html' and target in all_ids and parts.fragment not in all_ids[target]:
            ERRORS.append(f'{file.name}: àncora inexistent: {raw}')

for obsolete in ('site-content-fixes.js', 'site-content-overrides.js'):
    if (ROOT / obsolete).exists(): ERRORS.append(f'Fitxer temporal encara present: {obsolete}')
for file in HTML_FILES + [ROOT / 'app.js']:
    text = file.read_text(encoding='utf-8')
    if 'site-content-fixes.js' in text or 'site-content-overrides.js' in text:
        ERRORS.append(f'{file.name}: encara referencia una capa de correcció dinàmica')
for required in ('THIRD_PARTY_NOTICES.md', 'assets/vendor/lucide/LICENSE', 'assets/vendor/lucide/lucide.min.js'):
    if not (ROOT / required).exists(): ERRORS.append(f'Falta el recurs requerit: {required}')

if ERRORS:
    print('VALIDACIÓ FALLIDA')
    for e in ERRORS: print(f'- {e}')
    sys.exit(1)
print(f'Validació correcta: {len(HTML_FILES)} pàgines revisades.')
