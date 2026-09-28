"""Oleada 1: client-page.tsx / demo-client.tsx -> nombres screaming.

- 6 pantallas de un solo feature se mueven a
  src/features/<ctx>/presentation/<nombre>.client.tsx
- 2 composiciones multi-feature (applications = jobs+recruiter, demo = mocks)
  se renombran IN SITU dentro de app/ (la capa app puede componer features,
  los features no pueden importar entre si: .dependency-cruiser.cjs).
- Los page.tsx / layout reservados de Next quedan como adaptadores finos.

Uso: python scripts/refactor/oleada1_client_pages.py [--dry-run]
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# (origen, destino)
MOVES: list[tuple[str, str]] = [
    (
        "src/app/[locale]/dashboard/github/client-page.tsx",
        "src/features/github/presentation/github-dashboard.client.tsx",
    ),
    (
        "src/app/[locale]/dashboard/jobs/client-page.tsx",
        "src/features/jobs/presentation/jobs-board.client.tsx",
    ),
    (
        "src/app/[locale]/dashboard/recruiter/pipeline/client-page.tsx",
        "src/features/jobs/presentation/recruiter-pipeline.client.tsx",
    ),
    (
        "src/app/[locale]/dashboard/recruiter/postings/client-page.tsx",
        "src/features/jobs/presentation/recruiter-postings.client.tsx",
    ),
    (
        "src/app/[locale]/dashboard/recruiter/requests/client-page.tsx",
        "src/features/recruiter/presentation/recruiter-requests.client.tsx",
    ),
    (
        "src/app/[locale]/dashboard/recruiter/templates/client-page.tsx",
        "src/features/outreach-templates/presentation/outreach-templates.client.tsx",
    ),
    # Composiciones multi-feature: renombre in situ (siguen viviendo en app/).
    (
        "src/app/[locale]/dashboard/recruiter/postings/[id]/applications/client-page.tsx",
        "src/app/[locale]/dashboard/recruiter/postings/[id]/applications/job-applications.screen.tsx",
    ),
    (
        "src/app/[locale]/demo/demo-client.tsx",
        "src/app/[locale]/demo/demo-showcase.client.tsx",
    ),
]

# Post-reescritura de imports en los page.tsx hermanos (y demo).
IMPORT_REWRITES: list[tuple[str, str, str]] = [
    (
        "src/app/[locale]/dashboard/github/page.tsx",
        'from "./client-page"',
        'from "@/features/github/presentation/github-dashboard.client"',
    ),
    (
        "src/app/[locale]/dashboard/jobs/page.tsx",
        'from "./client-page"',
        'from "@/features/jobs/presentation/jobs-board.client"',
    ),
    (
        "src/app/[locale]/dashboard/recruiter/pipeline/page.tsx",
        'from "./client-page"',
        'from "@/features/jobs/presentation/recruiter-pipeline.client"',
    ),
    (
        "src/app/[locale]/dashboard/recruiter/postings/page.tsx",
        'from "./client-page"',
        'from "@/features/jobs/presentation/recruiter-postings.client"',
    ),
    (
        "src/app/[locale]/dashboard/recruiter/requests/page.tsx",
        'from "./client-page"',
        'from "@/features/recruiter/presentation/recruiter-requests.client"',
    ),
    (
        "src/app/[locale]/dashboard/recruiter/templates/page.tsx",
        'from "./client-page"',
        'from "@/features/outreach-templates/presentation/outreach-templates.client"',
    ),
    (
        "src/app/[locale]/dashboard/recruiter/postings/[id]/applications/page.tsx",
        'from "./client-page"',
        'from "./job-applications.screen"',
    ),
    (
        "src/app/[locale]/demo/page.tsx",
        'from "./demo-client"',
        'from "./demo-showcase.client"',
    ),
]

COMMENT_FIX = (
    "src/features/jobs/actions.ts",
    "ver handleSave en client-page.tsx",
    "ver handleSave en presentation/jobs-board.client.tsx",
)


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, cwd=ROOT, check=True)


def main() -> None:
    dry = "--dry-run" in sys.argv
    for src, dst in MOVES:
        s, d = ROOT / src, ROOT / dst
        assert s.exists(), f"origen inexistente: {src}"
        assert not d.exists(), f"destino ya existe: {dst}"
        print(("DRY " if dry else "") + f"git mv {src} -> {dst}")
        if not dry:
            d.parent.mkdir(parents=True, exist_ok=True)
            run(["git", "mv", src, dst])
    for path, old, new in IMPORT_REWRITES:
        p = ROOT / path
        text = p.read_text(encoding="utf-8")
        assert old in text, f"import no encontrado en {path}: {old}"
        print(("DRY " if dry else "") + f"rewrite {path}: {old} -> {new}")
        if not dry:
            p.write_text(text.replace(old, new), encoding="utf-8")
    p = ROOT / COMMENT_FIX[0]
    text = p.read_text(encoding="utf-8")
    if COMMENT_FIX[1] in text and not dry:
        p.write_text(text.replace(COMMENT_FIX[1], COMMENT_FIX[2]), encoding="utf-8")
        print(f"comment fix {COMMENT_FIX[0]}")
    print("OK oleada 1" + (" (dry-run)" if dry else ""))


if __name__ == "__main__":
    main()
