"""Oleada 2: features planos -> capas hexagonales con nombres screaming.

    <ctx>/actions.ts        -> <ctx>/application/<ctx>.use-cases.ts
    <ctx>/service.ts        -> <ctx>/application/<ctx>.service.ts
    <ctx>/ai-service.ts     -> <ctx>/application/<ctx>.ai-service.ts (cv-analysis)
    <ctx>/repository.ts     -> <ctx>/infrastructure/<ctx>.repository.ts
    <ctx>/types.ts          -> <ctx>/domain/<ctx>.types.ts
    <ctx>/ports.ts          -> <ctx>/domain/<ctx>.ports.ts (jobs)
    *.test.ts acompanan a su objetivo.

Reescribe imports relativos (./x) y de alias (@/features/<ctx>/x) en todo el
repo. Los puertos nuevos (domain/*.ports.ts) y adaptadores se crean aparte.

Uso: python scripts/refactor/oleada2_hexagonal.py [--dry-run]
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

FEATURES = [
    "admin",
    "application-notes",
    "contact-thread",
    "cv-analysis",
    "developer-requests",
    "github",
    "interview",
    "job-match",
    "job-tracker",
    "jobs",
    "linkedin-audit",
    "notifications",
    "outreach-templates",
    "recruiter",
    "resume-builder",
    "roadmap",
    "saved-searches",
]

# nombre base de fichero por feature para la capa application/infrastructure
SUB = {"ai-service": "ai-service"}  # se prefija con ctx abajo

# (origen relativo a features/<ctx>, destino relativo a features/<ctx>)
LAYOUT = [
    ("actions.ts", "application/{ctx}.use-cases.ts"),
    ("actions.test.ts", "application/{ctx}.use-cases.test.ts"),
    ("service.ts", "application/{ctx}.service.ts"),
    ("service.test.ts", "application/{ctx}.service.test.ts"),
    ("ai-service.ts", "application/{ctx}.ai-service.ts"),
    ("ai-service.test.ts", "application/{ctx}.ai-service.test.ts"),
    ("repository.ts", "infrastructure/{ctx}.repository.ts"),
    ("types.ts", "domain/{ctx}.types.ts"),
    ("ports.ts", "domain/{ctx}.ports.ts"),
    ("ports.test.ts", "domain/{ctx}.ports.test.ts"),
]


def rewrite_relative(text: str, ctx: str, layer: str) -> str:
    """Reescribe imports ./x segun la capa destino del fichero."""

    def target(mod: str) -> str:
        if mod == "actions":
            return f"./{ctx}.use-cases" if layer == "application" else f"../application/{ctx}.use-cases"
        if mod == "service":
            return f"./{ctx}.service" if layer == "application" else f"../application/{ctx}.service"
        if mod == "ai-service":
            return f"./{ctx}.ai-service" if layer == "application" else f"../application/{ctx}.ai-service"
        if mod == "repository":
            return (
                f"./{ctx}.repository"
                if layer == "infrastructure"
                else f"../infrastructure/{ctx}.repository"
            )
        if mod == "types":
            return f"./{ctx}.types" if layer == "domain" else f"../domain/{ctx}.types"
        if mod == "ports":
            return f"./{ctx}.ports" if layer == "domain" else f"../domain/{ctx}.ports"
        return f"./{mod}"

    def repl(m: re.Match[str]) -> str:
        quote, mod = m.group(1), m.group(2)
        return f"from {quote}{target(mod)}{quote}"

    return re.sub(r'from (["\'])\./(actions|service|ai-service|repository|types|ports)\1', repl, text)


ALIAS_RE = re.compile(r"@/features/([a-z-]+)/(actions|service|ai-service|repository|types|ports)\b")


def rewrite_alias(text: str) -> str:
    def repl(m: re.Match[str]) -> str:
        ctx, mod = m.group(1), m.group(2)
        layer = (
            "application"
            if mod in ("actions", "service", "ai-service")
            else ("infrastructure" if mod == "repository" else "domain")
        )
        stem = {"actions": f"{ctx}.use-cases"}.get(mod, f"{ctx}.{mod}")
        return f"@/features/{ctx}/{layer}/{stem}"

    return ALIAS_RE.sub(repl, text)


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, cwd=ROOT, check=True)


def main() -> None:
    dry = "--dry-run" in sys.argv
    moves: list[tuple[Path, Path]] = []
    for ctx in FEATURES:
        base = ROOT / "src" / "features" / ctx
        for src_pat, dst_pat in LAYOUT:
            s = base / src_pat
            if s.exists():
                d = base / dst_pat.format(ctx=ctx)
                moves.append((s, d))
    print(f"{len(moves)} ficheros a mover")
    for s, d in moves:
        layer = d.parent.name
        print(("DRY " if dry else "") + f"git mv {s.relative_to(ROOT)} -> {d.relative_to(ROOT)}")
        if dry:
            continue
        d.parent.mkdir(parents=True, exist_ok=True)
        run(["git", "mv", str(s.relative_to(ROOT)), str(d.relative_to(ROOT))])
        # reescritura relativa inmediata sobre el fichero movido
        ctx = s.parent.name
        text = d.read_text(encoding="utf-8")
        new = rewrite_relative(text, ctx, layer)
        if new != text:
            d.write_text(new, encoding="utf-8")
            print(f"  relative imports fixed ({layer})")

    # Reescritura global de alias @/features/<ctx>/<plano>
    exts = {".ts", ".tsx", ".mts"}
    scanned = changed = 0
    for p in ROOT.rglob("*"):
        if not p.is_file() or p.suffix not in exts:
            continue
        rel = p.relative_to(ROOT).as_posix()
        if rel.startswith(("node_modules/", ".next/", "coverage/")):
            continue
        text = p.read_text(encoding="utf-8")
        if "@/features/" not in text:
            continue
        scanned += 1
        new = rewrite_alias(text)
        if new != text:
            changed += 1
            print(("DRY " if dry else "") + f"alias rewrite {rel}")
            if not dry:
                p.write_text(new, encoding="utf-8")
    print(f"alias: {scanned} ficheros con @/features, {changed} modificados")
    print("OK oleada 2" + (" (dry-run)" if dry else ""))


if __name__ == "__main__":
    main()
