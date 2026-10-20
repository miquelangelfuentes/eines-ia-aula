from pathlib import Path

path = Path("bloc2-antigravity.html")
text = path.read_text(encoding="utf-8")

replacements = {
    "L'objectiu és obtenir una pàgina petita que funcioni, provar-la i fer-hi una primera millora.":
        "L'objectiu és obtenir una pàgina petita que funcioni i, després de provar-la, fer-hi una primera millora.",
    "Podeu canviar el contingut de la pregunta, millorar el contrast o demanar un altre ajust concret.":
        "Podeu canviar el contingut de la pregunta o millorar el contrast. Si preferiu un altre ajust, demaneu-lo de manera concreta.",
}

for old, new in replacements.items():
    if old not in text:
        raise SystemExit(f"No s'ha trobat el text esperat: {old}")
    text = text.replace(old, new, 1)

path.write_text(text, encoding="utf-8")
