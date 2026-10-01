"""Fase 0 (a): componentes single-owner -> features/*/presentation/.

Las composiciones multi-feature (talent-dashboard, candidate-workspace,
match-score-card, dashboard/*, auth, landing, layout, ui) quedan en
src/components por el gate hex-no-feature-to-feature.

Uso: python scripts/refactor/fase0_presentations.py [--dry-run]
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

MOVES: list[tuple[str, str]] = [
    ("src/components/cv-analysis/cv-upload-form.tsx", "src/features/cv-analysis/presentation/cv-upload-form.tsx"),
    ("src/components/cv-analysis/analysis-results.tsx", "src/features/cv-analysis/presentation/analysis-results.tsx"),
    ("src/components/cv-analysis/resume-diff.tsx", "src/features/cv-analysis/presentation/resume-diff.tsx"),
    ("src/components/cv-analysis/index.ts", "src/features/cv-analysis/presentation/index.ts"),
    ("src/components/github/analysis-cards.tsx", "src/features/github/presentation/analysis-cards.tsx"),
    ("src/components/github/language-chart.tsx", "src/features/github/presentation/language-chart.tsx"),
    ("src/components/github/repo-list.tsx", "src/features/github/presentation/repo-list.tsx"),
    ("src/components/interview/mock-interview-chat.tsx", "src/features/interview/presentation/mock-interview-chat.tsx"),
    ("src/components/interview/interview-history.tsx", "src/features/interview/presentation/interview-history.tsx"),
    ("src/components/interview/index.ts", "src/features/interview/presentation/index.ts"),
    ("src/components/job-match/job-offer-input.tsx", "src/features/job-match/presentation/job-offer-input.tsx"),
    ("src/components/job-tracker/kanban-board.tsx", "src/features/job-tracker/presentation/kanban-board.tsx"),
    (
        "src/components/recruiter/candidate-detail-modal.tsx",
        "src/features/recruiter/presentation/candidate-detail-modal.tsx",
    ),
    ("src/components/recruiter/candidate-compare.tsx", "src/features/recruiter/presentation/candidate-compare.tsx"),
    (
        "src/components/recruiter/recruiter-verification-gate.tsx",
        "src/features/recruiter/presentation/recruiter-verification-gate.tsx",
    ),
    (
        "src/components/recruiter/contact-thread.tsx",
        "src/features/contact-thread/presentation/contact-thread.panel.tsx",
    ),
]

# (fichero, viejo, nuevo) — reescrituras exactas de imports
REWRITES: list[tuple[str, str, str]] = [
    (
        "src/features/github/presentation/github-dashboard.client.tsx",
        'from "@/components/github/language-chart"',
        'from "./language-chart"',
    ),
    (
        "src/features/github/presentation/github-dashboard.client.tsx",
        'from "@/components/github/repo-list"',
        'from "./repo-list"',
    ),
    (
        "src/features/github/presentation/github-dashboard.client.tsx",
        'from "@/components/github/analysis-cards"',
        'from "./analysis-cards"',
    ),
    (
        "src/app/[locale]/demo/demo-showcase.client.tsx",
        'from "@/components/cv-analysis"',
        'from "@/features/cv-analysis/presentation"',
    ),
    (
        "src/app/[locale]/demo/demo-showcase.client.tsx",
        'from "@/components/github/language-chart"',
        'from "@/features/github/presentation/language-chart"',
    ),
    (
        "src/app/[locale]/demo/demo-showcase.client.tsx",
        'from "@/components/github/analysis-cards"',
        'from "@/features/github/presentation/analysis-cards"',
    ),
    (
        "src/app/[locale]/dashboard/cv-analysis/page.tsx",
        'from "@/components/cv-analysis"',
        'from "@/features/cv-analysis/presentation"',
    ),
    (
        "src/app/[locale]/dashboard/settings/resumes/page.tsx",
        'from "@/components/cv-analysis"',
        'from "@/features/cv-analysis/presentation"',
    ),
    (
        "src/app/[locale]/dashboard/interview/page.tsx",
        'from "@/components/interview"',
        'from "@/features/interview/presentation"',
    ),
    (
        "src/app/[locale]/dashboard/job-tracker/page.tsx",
        'from "@/components/job-tracker/kanban-board"',
        'from "@/features/job-tracker/presentation/kanban-board"',
    ),
    (
        "src/app/[locale]/dashboard/job-match/page.tsx",
        'from "@/components/job-match"',
        'from "@/features/job-match/presentation/job-offer-input";\nimport { MatchScoreCard } from "@/components/job-match/match-score-card"',
    ),
    (
        "src/app/[locale]/dashboard/page.tsx",
        'from "@/components/recruiter"',
        'from "@/components/recruiter/talent-dashboard";\nimport { RecruiterVerificationGate } from "@/features/recruiter/presentation/recruiter-verification-gate"',
    ),
    (
        "src/components/dashboard/contact-requests-list.tsx",
        'from "@/components/recruiter/contact-thread"',
        'from "@/features/contact-thread/presentation/contact-thread.panel"',
    ),
    (
        "src/features/recruiter/presentation/recruiter-requests.client.tsx",
        'from "@/components/recruiter/contact-thread"',
        'from "@/features/contact-thread/presentation/contact-thread.panel"',
    ),
    (
        "src/components/recruiter/talent-dashboard.tsx",
        'from "./candidate-detail-modal"',
        'from "@/features/recruiter/presentation/candidate-detail-modal"',
    ),
    (
        "src/components/recruiter/talent-dashboard.tsx",
        'from "./candidate-compare"',
        'from "@/features/recruiter/presentation/candidate-compare"',
    ),
]

# Barrels de components/ que quedan vacios y se eliminan (tras el mv)
DELETE_BARRELS = [
    "src/components/job-match/index.ts",
    "src/components/recruiter/index.ts",
]


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
    for path, old, new in REWRITES:
        p = ROOT / path
        text = p.read_text(encoding="utf-8")
        # job-match/page y dashboard/page: el import viejo trae 2 simbolos
        if path.endswith("job-match/page.tsx"):
            old_full = 'import { JobOfferInput, MatchScoreCard } from "@/components/job-match";'
            new_full = (
                'import { JobOfferInput } from "@/features/job-match/presentation/job-offer-input";\n'
                'import { MatchScoreCard } from "@/components/job-match/match-score-card";'
            )
            assert old_full in text, f"import no encontrado en {path}"
            print(("DRY " if dry else "") + f"rewrite {path} (split barrel)")
            if not dry:
                p.write_text(text.replace(old_full, new_full), encoding="utf-8")
            continue
        if path.endswith("dashboard/page.tsx"):
            old_full = 'import { TalentDashboard, RecruiterVerificationGate } from "@/components/recruiter";'
            new_full = (
                'import { TalentDashboard } from "@/components/recruiter/talent-dashboard";\n'
                'import { RecruiterVerificationGate } from "@/features/recruiter/presentation/recruiter-verification-gate";'
            )
            assert old_full in text, f"import no encontrado en {path}"
            print(("DRY " if dry else "") + f"rewrite {path} (split barrel)")
            if not dry:
                p.write_text(text.replace(old_full, new_full), encoding="utf-8")
            continue
        assert old in text, f"import no encontrado en {path}: {old}"
        print(("DRY " if dry else "") + f"rewrite {path}")
        if not dry:
            p.write_text(text.replace(old, new), encoding="utf-8")
    for b in DELETE_BARRELS:
        print(("DRY " if dry else "") + f"git rm {b}")
        if not dry:
            run(["git", "rm", "-q", b])
    print("OK fase0-presentations" + (" (dry-run)" if dry else ""))


if __name__ == "__main__":
    main()
