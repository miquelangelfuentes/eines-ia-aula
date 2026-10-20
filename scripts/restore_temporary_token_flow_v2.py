from pathlib import Path

src = Path("scripts/restore_temporary_token_flow.py").read_text(encoding="utf-8")
src = src.replace(
    "Als dispositius PEDC, Git i GitHub CLI poden no estar instal·lats i la seva instal·lació pot requerir permisos que el docent no té.",
    "Als dispositius PEDC, les eines locals necessàries per autenticar GitHub poden no estar disponibles i instal·lar-les pot requerir permisos que el docent no té.",
)
src = src.replace(
    "Als dispositius PEDC, Git i GitHub CLI poden no estar disponibles i instal·lar-los pot requerir permisos d'administrador.",
    "Als dispositius PEDC, les eines locals necessàries per autenticar GitHub poden no estar disponibles i instal·lar-les pot requerir permisos d'administrador.",
)
exec(compile(src, "restore_temporary_token_flow.py", "exec"), {"__name__": "__main__"})
