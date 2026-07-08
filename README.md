# SkillRadar 🎯

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
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
        C[Developer Candidate] -->|1. Upload PDF CV| UT[UploadThing Button]
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
        VSDK -->|Primary API Key| LLM[Google Gemini 2.5 Flash / OpenRouter]
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

---

## 🚀 Key Features

*   **ATS Structured Resume Parsing**: Uploads resumes in PDF format via secure gateways and instantly receives structured feedback powered by **Gemini 2.5 Flash** (identifying strengths, improvement items, formatting suggestions, ATS score, and seniority levels).
*   **Double-Blind Recruiter Privacy**: Strict server-side sanitization. Sensitive PII fields (`name`, `email`, `githubUsername`, `image`) are automatically stripped for profiles in a non-accepted state (`status !== "accepted"`), preventing bias during the sourcing phase.
*   **In-App Interactive AI Interview**: Simulates technical interviews using Gemini with dynamically generated follow-up questions based on the candidate's CV and generates a detailed performance debrief.
*   **Active SSRF & CV Privacy Mitigations**: Protects CV document URLs via active session controls, resolving uploads through transient (1-hour expiry) signed URLs. Prevents Server-Side Request Forgery by validating hostnames and enforcing `https:` protocols on server fetches.
*   **Cryptographic Database Encryption (AES-256-GCM)**: Multi-tenant and user-supplied API keys are encrypted at rest in PostgreSQL. Keys are stored as `ivHex:authTagHex:encryptedTextHex`, decrypted strictly in server memory, and never exposed to the client.
*   **Combined i18n & NextAuth Middleware**: A custom proxy middleware (`src/proxy.ts`) combines route protection from **Auth.js v5** with locale-prefixed routing from **next-intl**, ensuring seamless redirections (e.g. `/es/dashboard`).
*   **State-of-the-Art Visual Aesthetics**: Premium dark/light themes, sleek glassmorphic UI elements using Tailwind CSS v4, smooth animations, and a responsive custom localized Language Switcher built on Radix/Base UI v1 (`render` props instead of deprecated `asChild`).

---

## 🛠️ Tech Stack & Versioning

*   **Frontend**: Next.js 16.2.10 (App Router utilizing Turbopack) & React 19.0.0.
*   **Styling**: Tailwind CSS v4.0.0 & shadcn/ui.
*   **Dynamic Components**: `@base-ui/react` ^1.5.0 (Base UI v1).
*   **ORM**: Prisma ^7.8.0.
*   **Database**: Neon PostgreSQL Serverless (configured with custom transaction pooling).
*   **Authentication**: Auth.js v5 (NextAuth `5.0.0-beta`) utilizing secure JWT strategy.
*   **Security & Hashing**: `bcryptjs` for password hashing, `jose` for cryptographically signing session JWTs.
*   **Rate Limiting**: Upstash Redis Web SDK (`@upstash/ratelimit`).
*   **AI Orchestration**: Vercel AI SDK (`ai` v4) with `@google/generative-ai`.
*   **Internationalization**: `next-intl` ^3.x.
*   **Unit Testing**: Vitest ^3.0.0 & `@testing-library/react`.
*   **E2E Testing**: Playwright ^1.50.0.

---

## 📁 Directory Structure

```text
├── .agents/                    # Custom AI agent guidelines, instructions and rules
├── .github/                    # CI/CD Workflows and PR/Issue templates
├── messages/                   # Translation dictionary JSON files (es.json, en.json)
├── prisma/                     # Database schema definition and migration files
├── src/
│   ├── app/                    # Next.js App Router Pages (localized under [locale]/)
│   │   └── [locale]/
│   │       ├── dashboard/      # Protected dashboard routes (admin, settings, cv-analysis, etc.)
│   │       ├── legal/          # Privacy policy and terms of service pages
│   │       ├── login/          # Locale-aware Login and Signup Form page
│   │       └── page.tsx        # Localized Marketing/Landing Page
│   ├── components/             # Reusable UI Components
│   │   ├── auth/               # Login & Register forms
│   │   ├── layout/             # Sidebar, Navbar, LanguageSwitcher and ThemeToggle
│   │   └── ui/                 # Shadcn/ui core components
│   ├── features/               # Domain-Driven Feature Modules (business logic, services & actions)
│   │   ├── cv-analysis/        # AI Resume Parsing logic and tests
│   │   ├── job-match/          # ATS Matching algorithm
│   │   ├── jobs/               # Recruiter board, moderations and IDOR guards
│   │   └── recruiter/          # Sourcing, profiles and Double-Blind sanitizers
│   ├── i18n/                   # next-intl configuration, routing and request handlers
│   ├── lib/                    # Shared utilities (auth options, db poolers, rate limiters)
│   └── proxy.ts                # App Router combined middleware hook (Auth + next-intl)
├── tests/
│   └── e2e/                    # Playwright end-to-end user flows (developer, recruiter)
└── vitest.config.ts            # Unit & Integration test runner configuration
```

---

## 📦 Getting Started

### 1. Clone the repository and configure environment variables

Duplicate the template environment file:

```bash
cp .env.example .env
```

Fill in the required variables (database strings, secrets, and provider keys):

```ini
# Database Connection (Neon Postgres)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Auth.js Config
AUTH_SECRET="your-super-long-generated-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# UploadThing (CV upload storage)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your_uploadthing_app_id"

# AI Provider API Keys
GEMINI_API_KEY="your_gemini_api_key"
OPENROUTER_API_KEY="your_openrouter_api_key"
GROQ_API_KEY="your_groq_api_key"

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

This repository runs static analysis, style audits, unit tests, and browser automation locally and in CI:

```bash
# Typecheck
cmd /c npm run type-check

# Code formatting validation (Prettier)
cmd /c npm run format:check

# Static analysis and linter (ESLint)
cmd /c npm run lint

# Run Unit & Integration tests (Vitest)
cmd /c npm run test

# Run End-to-End Tests (Playwright)
cmd /c npx playwright test

# Verify production Next.js compilation
cmd /c npm run build
```

---

## 🛡️ Git Workflow & Pre-commit Automation

To keep the main branches clean and maintain strict quality standards, this project implements local git hooks using **Husky** and **lint-staged**.

Every time you run `git commit`, the following operations execute automatically:
1.  Filters staged files (`*.ts`, `*.tsx`, `*.js`).
2.  Runs `eslint --fix` to fix any syntax/linting warnings.
3.  Runs `prettier --write` to normalize file styles.
4.  Runs local static security scans to prevent secrets from leakages.

If any check fails, the commit is safely aborted on your machine, preventing broken commits from reaching remote pull requests.
