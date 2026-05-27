# GitHub Professional Setup Guide

Complete setup checklist for the AI developer profiling platform repo.

---

## 1. Copy files into your repo

```
your-repo/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              ← Lint, type-check, test, build
│   │   ├── stale.yml           ← Auto-close stale issues/PRs
│   │   └── release.yml         ← GitHub Releases from tags
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug-report.yml
│   │   └── feature-request.yml
│   │   └── pull_request_template.md
│   ├── CODEOWNERS              ← Auto-assign reviewers
│   └── copilot-instructions.md ← GitHub Copilot context
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── .cursorrules                ← Cursor AI context
├── .env.example
├── .eslintrc.json
├── .gitleaks.toml
├── .gitignore
├── CONTRIBUTING.md
└── SECURITY.md
```

---

## 2. GitHub Secrets to configure

Go to **Settings → Secrets and variables → Actions → New repository secret**:

_(No secrets required for the basic free setup at this stage. Later you may add keys for UploadThing, DB, etc.)_

---

## 3. Branch protection rules

Go to **Settings → Branches → Add branch ruleset** and configure `main`:

- [x] Require pull request before merging
    - Required approvals: **1**
    - [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass before merging
    - Add: `Code Quality`, `Tests`, `Build` (from ci.yml)
    - Add: `CodeQL Analysis` (from security.yml)
- [x] Require conversation resolution before merging
- [x] Require linear history (enforces squash/rebase)
- [x] Block force pushes
- [x] Do not allow deletions

Repeat for `develop` with the same rules (except possibly 0 required approvals if solo).

---

## 4. Enable GitHub features (Settings → General)

- [x] Issues
- [x] Projects (for kanban)
- [x] Discussions (optional, for community)
- [x] Dependabot alerts — **Settings → Security → Dependabot alerts**
- [x] Dependabot security updates — same page
- [x] Secret scanning — **Settings → Security → Secret scanning**
- [x] Push protection (blocks commits with secrets) — same page
- [x] Code scanning — set up via CodeQL in security.yml

---

## 5. Enable GitHub Copilot (free tier)

GitHub Copilot Free is available at **github.com/features/copilot** — no credit card needed.
The `.github/copilot-instructions.md` file is automatically picked up by Copilot in VS Code.

---

## 6. Add package.json scripts

Make sure these scripts exist in your `package.json`:

```json
{
    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "lint:fix": "next lint --fix",
        "type-check": "tsc --noEmit",
        "format": "prettier --write .",
        "format:check": "prettier --check .",
        "test": "vitest run",
        "test:watch": "vitest"
    }
}
```

---

## 7. Install dev dependencies

```bash
npm install -D \
  prettier \
  eslint-config-prettier \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-plugin-security \
  vitest
```

---

## 8. Labels to create

Go to **Issues → Labels** and create:

| Label              | Color   | Purpose                        |
| ------------------ | ------- | ------------------------------ |
| `bug`              | #d73a4a | Confirmed bug                  |
| `enhancement`      | #a2eeef | New feature request            |
| `security`         | #e11d48 | Security issue                 |
| `dependencies`     | #0075ca | Dependency updates             |
| `automated`        | #cfd3d7 | Bot-generated PR/issue         |
| `in-progress`      | #f9d0c4 | Someone is working on this     |
| `blocked`          | #e4e669 | Waiting on external dependency |
| `stale`            | #e4e669 | Inactive, scheduled to close   |
| `needs-triage`     | #ededed | Needs a maintainer look        |
| `good first issue` | #7057ff | Great for new contributors     |

---

## 9. Recommended GitHub Apps (free)

All free for public repos and/or free tier:

| App                 | Purpose                   | Install                  |
| ------------------- | ------------------------- | ------------------------ |
| **Codecov**         | Coverage reports on PRs   | codecov.io               |
| **Renovate**        | Alternative to Dependabot | github.com/apps/renovate |
| **AllContributors** | Recognition in README     | allcontributors.org      |

---

## 10. Commit signing (recommended)

Signed commits display a "Verified" badge and prove authenticity:

```bash
# Generate a GPG key
gpg --full-generate-key

# Get your key ID
gpg --list-secret-keys --keyid-format LONG

# Tell Git to use it
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# Add to GitHub: Settings → SSH and GPG keys → New GPG key
gpg --armor --export YOUR_KEY_ID
```

---

## Summary of what you get

| Feature                 | Tool                     | Cost |
| ----------------------- | ------------------------ | ---- |
| CI (lint, test, build)  | GitHub Actions           | Free |
| SAST security scanning  | CodeQL                   | Free |
| Secret detection        | Gitleaks + GitHub native | Free |
| Dependency updates      | Dependabot               | Free |
| Copilot code completion | GitHub Copilot Free      | Free |
| Supply chain scoring    | OSSF Scorecard           | Free |
| Stale management        | actions/stale            | Free |
