# SkillRadar 🎯

🌎 [Leer en Español](./docs/README.es.md)

SkillRadar is a modern, production-ready developer platform designed for **talent assessment, resume parsing, and Applicant Tracking System (ATS) optimization**. The application leverages state-of-the-art Artificial Intelligence to extract structured skills, estimate technical seniority, and compute deep alignment metrics against job descriptions.

---

## 🚀 Key Features

- **ATS Structured Resume Parsing**: Upload resumes in PDF format and instantly receive structured feedback powered by **Gemini 2.5 Flash** (strengths, improvements, formatting issues, ATS score, and seniority).
- **Intelligent Offline Simulation**: When API keys are missing in the local environment, the platform automatically switches to a robust local analyzer that dynamically infers metrics and keywords without blocking development.
- **Secure File Privacy**: Fully protected UploadThing file routers with active sessions and short-lived (1h) signed URLs for developer resumes. Includes defensive validation barriers against SSRF.
- **Native Internationalization (i18n)**: Out-of-the-box multilingual support (English/Spanish) powered by **next-intl** using dynamic routing (`/[locale]`) and locale-agnostic route protection combined with NextAuth middleware.
- **Premium UX Theme & Language Selection**: Seamless toggle between Light/Dark mode and English/Spanish locales on the landing page, login forms (flawlessly handling query params for signup redirection), and dashboard.
- **Pre-commit Quality Gate**: Local Git hooks via **Husky** and **lint-staged** automatically format and lint staged files before any commit goes through.
- **Automatic PR Triage**: A robust GitHub Actions CI/CD flow automatically categorizes pull requests based on the modified layers and Conventional Commits title structure.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack) + React 19 + TypeScript (Strict Mode).
- **Styling & UI**: Tailwind CSS v4.0 + shadcn/ui + `@base-ui/react` (Base UI v1).
- **Database & ORM**: PostgreSQL (Neon Serverless Pooler) + Prisma ORM.
- **Authentication**: Auth.js v5 (NextAuth v5 beta) using secure JWT strategy.
- **Internationalization**: `next-intl` (native file-system routing & client/server translation keys).
- **AI Integration**: Vercel AI SDK (Gemini `gemini-2.5-flash` as primary, OpenRouter and Groq as manual fallbacks).

---

## 📦 Getting Started

### 1. Clone the repository and configure environment variables

Copy the template environment file to a new local configuration file:

```bash
cp .env.example .env
```

### 2. Set Up Free Artificial Intelligence API Keys

SkillRadar supports three AI providers with highly generous free tiers:

- **Google Gemini (Primary)**:
    1.  Go to [Google AI Studio](https://aistudio.google.com/).
    2.  Click **"Get API Key"** and generate a free key.
    3.  Copy and paste it into your local `.env` as `GEMINI_API_KEY`.
- **OpenRouter (Alternative/Fallback)**:
    1.  Create an account at [OpenRouter](https://openrouter.ai/).
    2.  Create an API Key. You can consume models marked as `:free` without providing any credit card information.
    3.  Copy the key into your local `.env` as `OPENROUTER_API_KEY`.
- **Groq (Ultra-fast Inference)**:
    1.  Register at [Groq Console](https://console.groq.com/).
    2.  Generate a free API Key instantly.
    3.  Copy the key into your local `.env` as `GROQ_API_KEY`.

### 3. Sincronize the Database

1.  Ensure your `DATABASE_URL` in `.env` points to your Neon PostgreSQL project.
2.  Generate the Prisma Client and apply migrations or push the schema:
    ```bash
    cmd /c npm install
    npx prisma db push
    ```

### 4. Run the Development Server

Fire up the local development server:

```bash
cmd /c npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the running application.

---

## 🧪 Testing & Verification

To run static analysis, formatting checks, unit tests, and Playwright E2E tests:

```bash
# Typecheck
cmd /c npm run type-check

# Format check
cmd /c npm run format:check

# Eslint check
cmd /c npm run lint

# Vitest Unit/Integration tests
cmd /c npm run test

# Playwright E2E tests
cmd /c npx playwright test

# Build production bundle
cmd /c npm run build
```

---

## 🛡️ Pre-commit Validation (Git Hooks)

To prevent code with formatting errors or linter warnings from reaching production, this repository enforces code quality via **Husky** and **lint-staged**.

Every time you run `git commit`, Husky intercepts the hook and runs:

- `eslint --fix` (Automatic React/TypeScript static analysis corrections).
- `prettier --write` (Automatic code styling and formatting).

If there is any unresolvable error (such as type mismatches or syntax errors), the commit will be safely aborted in your local machine, guaranteeing that your Pull Requests always pass in **green (success)** in GitHub.
