# SkillRadar 🎯

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.x-2C3E50?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Postgres-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-5A29E4?style=for-the-badge&logo=next.js)](https://authjs.dev/)

🌎 [Leer en Español](./docs/README.es.md)

SkillRadar is a modern, enterprise-grade developer platform designed for **talent assessment, resume parsing, and Applicant Tracking System (ATS) optimization**. The application leverages state-of-the-art Generative AI to extract structured skills, estimate technical seniority, audit LinkedIn profiles, and compute deep alignment metrics against job descriptions.

Built with a focus on security hardening, performance, and internationalization, SkillRadar showcases advanced engineering patterns including cryptographic encryption, double-blind privacy, and locale-agnostic middleware route protection.

---

## 🏗️ System Architecture & Data Flow

Below is the high-level architecture diagram detailing how resume uploads, AI analysis, double-blind moderation, and client-server interactions are secured and structured:

```mermaid
graph TD
    subgraph Client [Client Layer - React 19]
        C[Developer Candidate] -->|1. Upload PDF CV| BLOB[Vercel Blob client upload]
        C -->|3. In-App AI Interview| UT
        R[Recruiter / Admin] -->|7. View Candidate Profile| DBV[Double-Blind Sanitizer]
    end

    subgraph Security [Security Gateways]
        UT -->|2. Webhook Callback| SSRF[SSRF Validation & Protocol Check]
        DBV -->|Verify application status| DB_Sec{Is Application Accepted?}
    end

    subgraph Service [Application Services]
        SSRF -->|Signed URL 1h expire| AI[AI CV Analysis Service]
        AI -->|4. Structured Request via Zod| VSDK[Vercel AI SDK]
        VSDK -->|Primary/BYOK API Key| LLM["Multi-Provider Engine: Gemini 3.8 Flash / Groq gpt-oss / OpenRouter / Custom BYOK (OpenAI GPT-6, Claude, etc.)"]
        VSDK -->|Offline Fallback| MOCK[Local Keywords & Seniority Mock Engine]
        AI -->|5. Structured Resume JSON| Prisma[Prisma Client Pooler]
    end

    subgraph DB [Database Layer - Neon Postgres]
        Prisma -->|6. Persist| PGDB[(Postgres DB)]
        DB_Sec -->|If NOT accepted: strip PII| R
        DB_Sec -->|If accepted: expose full profile| R
    end

    style Security fill:#f9f2f4,stroke:#3a1a1a,stroke-width:1px
    style DB fill:#eef9f2,stroke:#1a3a2a,stroke-width:1px
```

Domain logic lives in `src/features/*` as hexagonal modules (`domain/` types + ports, `application/` services + use-cases, `infrastructure/` repositories, `presentation/` client screens). Next route files (`page|layout|error|loading|route`) are reserved names and stay as thin adapters delegating to `features/*/presentation`. Cross-cutting pure contracts live in the shared kernel (`src/shared-kernel/action-result.ts`, `sanitize.ts`, `seniority.ts`, `pii.ts`); IO adapters live in `src/infrastructure/` (`db`, `auth`, `ai/`, `crypto`, `file-storage`): **no feature ever imports from another feature** — hexagonal boundaries are enforced in CI by dependency-cruiser (see `docs/adr/`, ADR-003).

---

## 🚀 Key Features

- **ATS Structured Resume Parsing**: Uploads resumes in PDF format via secure gateways and instantly receives structured feedback powered by **Google Gemini 3.8 Flash** (selected for optimal balance of cost, speed, and precision).
- **Hybrid Multi-Model Engine & Dynamic Chat Selection**: Uses **Gemini 3.8 Flash** as the primary cost-effective system model. For interactive chat features (Career Copilot & AI Interview), candidates and recruiters can dynamically select their preferred provider and model (Google Gemini, Groq `openai/gpt-oss-120b`, OpenAI GPT-6, Anthropic Claude, OpenRouter, or custom model IDs) using encrypted **Bring Your Own Key (BYOK)** to bypass system rate limits.
- **Cascading Multi-Tier Fallback Mechanism**: System attempts structured inference using the user's preferred provider/model first and seamlessly falls back through system free tiers (Gemini → Groq → OpenRouter) upon API timeouts or rate limits, guaranteeing high availability.
- **Guest Demo Isolation**: Anonymous demo sessions (`guest-developer-id` / `guest-recruiter-id`) never persist to the real database; all writes are blocked server-side.
- **Recruiter Verification**: Recruiter accounts require admin verification (`recruiterVerified`) before accessing sourcing tools; pending accounts get a dedicated gate with re-request flow.
- **Custom Pipeline Stages**: Each job posting defines its own hiring stages; the pipeline board renders per-posting columns with funnel + conversion analytics.
- **Talent Alerts & Bulk Outreach**: Daily cron (`/api/cron/talent-alerts`) notifies matching developers; recruiters can message shortlisted candidates in bulk with per-recipient sent/skipped reporting.
- **Double-Blind Recruiter Privacy**: Strict server-side sanitization. Sensitive PII fields (`name`, `email`, `githubUsername`, `image`) are automatically stripped for profiles in a non-accepted state (`status !== "accepted"`), preventing bias during the sourcing phase.
- **Job Board Moderation**: Content reports with auto `under_review` at 3 reports, IDOR ownership checks on every mutation, and expiration handling.
- **In-App Interactive AI Interview**: Simulates technical interviews using LLMs with dynamically generated follow-up questions based on the candidate's CV and generates a detailed performance debrief.
- **Active SSRF & CV Privacy Mitigations**: Protects CV document URLs via active session controls, resolving uploads through transient (1-hour expiry) signed URLs. Prevents Server-Side Request Forgery by validating hostnames and enforcing `https:` protocols on server fetches.
- **Cryptographic Database Encryption (AES-256-GCM)**: Multi-tenant and user-supplied API keys (OpenAI, Claude, Gemini, Groq, OpenRouter) are encrypted at rest in PostgreSQL. Keys are stored as `ivHex:authTagHex:encryptedTextHex`, decrypted strictly in server memory, and never exposed to the client.
- **Combined i18n & NextAuth Middleware**: A custom proxy middleware (`src/proxy.ts`) combines route protection from **Auth.js v5** with locale-prefixed routing from **next-intl**, ensuring seamless redirections (e.g. `/es/dashboard`).
- **State-of-the-Art Visual Aesthetics**: Premium dark/light themes, sleek glassmorphic UI elements using Tailwind CSS v4, smooth animations, and a responsive custom localized Language Switcher built on Radix/Base UI v1 (`render` props instead of deprecated `asChild`).

---

## 🛠️ Tech Stack & Versioning

- **Frontend**: Next.js ^16.3 (App Router utilizing Turbopack) & React 19.2.
- **Language**: TypeScript 6.0 (primary `tsc`) + TypeScript 7 side-by-side compat check (`npm run type-check:ts7`, enforced in CI).
- **Styling**: Tailwind CSS v4.3 & shadcn/ui.
- **Dynamic Components**: `@base-ui/react` ^1.6.0 (Base UI v1).
- **ORM**: Prisma 7.8.0.
- **Database**: Neon PostgreSQL Serverless (configured with custom transaction pooling).
- **Authentication**: Auth.js v5 (NextAuth `5.0.0-beta`) utilizing secure JWT strategy.
- **Security & Hashing**: `bcryptjs` for password hashing, `jose` for cryptographically signing session JWTs.
- **Rate Limiting**: Upstash Redis Web SDK (`@upstash/ratelimit`).
- **AI Orchestration & Multi-Model LLMs**: Vercel AI SDK (`ai` v7 / `@ai-sdk` v4) supporting Google Gemini, OpenAI, Anthropic Claude, Groq and OpenRouter with automatic cascading fallback.
- **Internationalization**: `next-intl` ^4.x.
- **Unit Testing**: Vitest 4.x & `@testing-library/react` (135 tests, ~40% line coverage with anti-regression floor).
- **E2E Testing**: Playwright ^1.61.0.
- **Architecture & Dead Code**: dependency-cruiser 18 (hexagonal gates) + Knip.

---

## 📁 Directory Structure

```text
├── .dependency-cruiser.cjs      # Hexagonal gates (error severity in CI)
├── .github/                     # CI/CD Workflows and PR/Issue templates
├── docs/adr/                    # Architecture Decision Records (see ADR-003 screaming/hexagonal)
├── knip.json                    # Dead-code / dependency audit config
├── messages/                    # Translation dictionary JSON files (es.json, en.json)
├── prisma/                      # Database schema definition and migration files
├── scripts/
│   ├── audit-high.mjs           # npm audit gate (high/critical + allowlist)
│   └── refactor/                # One-shot screaming/hexagonal rename scripts (ADR-003)
├── src/
│   ├── app/                     # Next.js App Router: thin adapters (page/layout/error/loading/route are reserved)
│   │   └── [locale]/
│   │       ├── dashboard/       # Protected routes delegating to features/*/presentation
│   │       ├── legal/           # Privacy policy and terms of service pages
│   │       ├── login/           # Locale-aware Login and Signup Form page
│   │       └── page.tsx         # Localized Marketing/Landing Page
│   ├── components/              # Reusable UI (ui/ generic + domain components used by presentation)
│   │   ├── auth/                # Login & Register forms
│   │   ├── layout/              # Sidebar, Navbar, LanguageSwitcher and ThemeToggle
│   │   └── ui/                  # Shadcn/ui core components
│   ├── features/                # Hexagonal domains: domain/ application/ infrastructure/ presentation/
│   │   │                        # Naming: <context>.<layer>.ts (e.g. github.use-cases.ts, jobs.ports.ts)
│   │   ├── cv-analysis/         # AI Resume Parsing + ResumeStore port
│   │   ├── github/              # Signals, seniority + presentation/github-dashboard.client.tsx
│   │   ├── jobs/                # Board, postings, pipeline screens + domain/jobs.ports.ts (MatchProvider)
│   │   ├── job-match/           # ATS Matching algorithm + JobMatchStore port
│   │   └── recruiter/           # Sourcing, requests screen, Double-Blind sanitizers
│   ├── shared-kernel/           # Pure cross-cutting contracts (action-result, sanitize, seniority, pii, types, utils)
│   ├── infrastructure/          # IO adapters (db, auth, ai/, crypto, file-storage, mail, rate-limit, guards)
│   ├── i18n/                    # next-intl configuration, routing and request handlers
│   └── proxy.ts                 # App Router combined middleware hook (Auth + next-intl)
├── tests/
│   └── e2e/                     # Playwright end-to-end user flows (developer, recruiter)
└── vitest.config.ts             # Vitest config with coverage anti-regression thresholds
```

---

## 📦 Getting Started

### 1. Clone the repository and configure environment variables

Duplicate the template environment file:

```bash
cp .env.example .env
```

Fill in the required variables (see `.env.example` for the full list of ~30 vars):

```ini
# Database Connection (Neon Postgres)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DATABASE_URL_UNPOOLED=""

# Auth.js Config + AES-256-GCM override (falls back to AUTH_SECRET)
AUTH_SECRET="your-super-long-generated-secret-key"
NEXTAUTH_SECRET="your-super-shared-secret-key"
ENCRYPTION_KEY="your-secure-32-character-crypto-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Vercel Blob (CV file storage)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
BLOB_STORE_ID=""

# AI Provider API Keys (global or per-user BYOK)
GEMINI_API_KEY="your_gemini_api_key"
OPENROUTER_API_KEY="your_openrouter_api_key"
GROQ_API_KEY="your_groq_api_key"
OPENAI_API_KEY="your_openai_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"

# Transactional email (password reset) + talent-alerts cron
RESEND_API_KEY=""
CRON_SECRET=""

# Guest demo + Neon flags
ENABLE_GUEST_LOGIN="false"
USE_NEON_WEBSOCKETS="true"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://...upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

### 2. Sincronize the Database Schema

Install dependencies and synchronize Prisma with your remote Postgres database:

```bash
cmd /c npm install
npx prisma db push
```

### 3. Start Local Development

Spin up the local Next.js server (runs under Turbopack):

```bash
cmd /c npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the running app.

---

## 🧪 Testing, Code Quality & QA

Quality gates run locally and in CI (`quality` → `test` + `arch` → `build` + `e2e`):

```bash
# Typecheck
cmd /c npm run type-check

# Code formatting validation (Prettier)
cmd /c npm run format:check

# Static analysis and linter (ESLint + React Compiler)
cmd /c npm run lint

# Run Unit & Integration tests with coverage floor (Vitest, 135 tests / ~40% lines)
cmd /c npm run test -- --coverage

# Hexagonal architecture gates (dependency-cruiser, error severity)
cmd /c npm run arch

# Dead code & unused dependencies (Knip)
cmd /c npm run knip

# Dependency audit: high/critical with documented allowlist
cmd /c npm run audit:high

# Static security scan (Semgrep)
cmd /c npm run security:scan

# Run End-to-End Tests (Playwright)
cmd /c npx playwright test

# Verify production Next.js compilation
cmd /c npm run build
```

---

## 🛡️ Git Workflow & Pre-commit Automation

Atomic branches from `develop` (`feature/*`, `bugfix/*`, `docs/*`, `chore/*`, `test/*`); PRs target `develop` — never push directly to `main`/`develop`. Before push: `npm run type-check` + `npm run test`.

Every `git commit` runs via **Husky** + **lint-staged**: `eslint --fix`, `prettier --write`, React Doctor (errors block), and a local Semgrep scan. If any check fails, the commit is safely aborted, preventing broken commits from reaching remote pull requests.
