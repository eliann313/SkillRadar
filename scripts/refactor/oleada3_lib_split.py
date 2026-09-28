"""Oleada 3: src/lib mixto -> src/shared-kernel (puro) + src/infrastructure (IO).

Deja shims `export *` en src/lib/* para compatibilidad (una oleada), de modo
que ningun importador se rompe. Los tests acompanan a su modulo.

Uso: python scripts/refactor/oleada3_lib_split.py [--dry-run]
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LIB = ROOT / "src" / "lib"

SHARED = {"action-result", "pii", "sanitize", "seniority", "types", "utils"}

# modulo de test -> destino (comparte nombre base con su modulo)
SHARED_TESTS = {"pii.test", "shared-kernel.test"}


def home_of(mod: str) -> str:
    if mod in SHARED or mod in SHARED_TESTS:
        return "shared-kernel"
    return "infrastructure"


ALIAS_RE = re.compile(r"@/lib/([a-z][a-z0-9-]*(?:/[a-z0-9-]+)*)")


def rewrite_alias(text: str) -> str:
    def repl(m: re.Match[str]) -> str:
        rest = m.group(1)
        base = rest.split("/")[0]
        return f"@/{home_of(base)}/{rest}"

    return ALIAS_RE.sub(repl, text)


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, cwd=ROOT, check=True)


def main() -> None:
    dry = "--dry-run" in sys.argv
    # 1. Mover ficheros y directorios (ai/)
    entries = sorted([p for p in LIB.iterdir()], key=lambda p: p.name)
    for src in entries:
        if src.suffix not in {".ts", ""} or src.name.startswith("."):
            continue
        if src.is_dir() and src.name == "ai":
            dst_dir = ROOT / "src" / "infrastructure" / "ai"
            print(("DRY " if dry else "") + f"git mv src/lib/ai -> src/infrastructure/ai")
            if not dry:
                dst_dir.parent.mkdir(parents=True, exist_ok=True)
                run(["git", "mv", "src/lib/ai", "src/infrastructure/ai"])
            continue
        if not src.is_file():
            continue
        mod = src.name[: -len(".ts")] if src.name.endswith(".ts") else src.name
        home = home_of(mod)
        dst = ROOT / "src" / home / src.name
        print(("DRY " if dry else "") + f"git mv src/lib/{src.name} -> src/{home}/{src.name}")
        if dry:
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        run(["git", "mv", f"src/lib/{src.name}", f"src/{home}/{src.name}"])

    # 2. Shims en src/lib para cada modulo no-test movido (derivados del plan,
    #    funcionan tambien en dry-run).
    shim_jobs: list[tuple[str, str]] = []
    for src in entries:
        if src.is_dir():
            if src.name == "ai":
                shim_jobs.append(("ai.ts", "infrastructure/ai"))
            continue
        if src.suffix != ".ts" or src.name.endswith(".test.ts"):
            continue
        mod = src.name[: -len(".ts")]
        shim_jobs.append((src.name, home_of(mod)))
    for name, home in sorted(shim_jobs):
        mod = name[: -len(".ts")]
        target = home if "/" in home else f"{home}/{mod}"
        shim = LIB / name
        body = (
            "/**\n"
            " * Shim de compatibilidad (refactor screaming/hexagonal, oleada 3).\n"
            f" * Canonico: `@/{target}`. Se eliminara cuando migren los importadores.\n"
            " */\n"
            f'export * from "@/{target}";\n'
        )
        print(("DRY " if dry else "") + f"shim src/lib/{name} -> @/{target}")
        if not dry:
            shim.write_text(body, encoding="utf-8")

    # 3. Reescritura global @/lib/x (los shims no contienen @/lib, no se tocan)
    exts = {".ts", ".tsx", ".mts"}
    scanned = changed = 0
    for p in ROOT.rglob("*"):
        if not p.is_file() or p.suffix not in exts:
            continue
        rel = p.relative_to(ROOT).as_posix()
        if rel.startswith(("node_modules/", ".next/", "coverage/")):
            continue
        text = p.read_text(encoding="utf-8")
        if "@/lib/" not in text:
            continue
        scanned += 1
        new = rewrite_alias(text)
        if new != text:
            changed += 1
            print(("DRY " if dry else "") + f"alias rewrite {rel}")
            if not dry:
                p.write_text(new, encoding="utf-8")
    print(f"alias: {scanned} ficheros con @/lib, {changed} modificados")
    print("OK oleada 3" + (" (dry-run)" if dry else ""))


if __name__ == "__main__":
    main()
