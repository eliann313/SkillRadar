<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:authjs-agent-rules -->

# Auth.js v5 (NextAuth v5 beta) Breaking Changes

The API is completely different from v4:

- Do NOT import from `next-auth/client` or use outdated hooks.
- Route protection is configured via `src/lib/auth.config.ts` and intercepted by `src/proxy.ts` as the named export `proxy` (replacing `middleware.ts`).
- Read the docs in `node_modules/next-auth/dist/` before writing auth functions.

<!-- END:authjs-agent-rules -->

<!-- BEGIN:baseui-agent-rules -->

# Base UI v1 (`@base-ui/react`) Trigger Properties

Base UI v1 has deprecated the use of `asChild`:

- Use the `render={}` prop instead of wrapping elements with `asChild`.
- Example: `<Tooltip.Trigger render={<button className="..." />} />`
- Read the reference in `node_modules/@base-ui/react/README.md` for detail.

<!-- END:baseui-agent-rules -->

<!-- BEGIN:skillradar-security-rules -->

# SkillRadar Cryptographic Security & Secure Authentication Rules

These mandatory rules govern any code edits to files inside this repository. Always follow them:

- **AES-256-GCM Cifrado:** Keys must be stored in the DB strictly as `ivHex:authTagHex:encryptedTextHex`. Never send ciphertext or IV to the client. Only expose boolean checks like `hasKey`. Decrypt strictly in server memory.
- **Premium Hybrid Auth:** Standard Email/Password + Google/GitHub OAuth + Passkeys (biometrics) is our authentication standard. Relegate Magic Links strictly to Password Reset ("Forgot Password") via Resend.
- **Bcrypt Hashing:** Passwords must be hashed via `bcryptjs` (min 10-12 salt rounds). Zod schema must require min 8 chars, uppercase, lowercase, and a number. Protect login with Upstash rate-limiting.
- **CV File Privacy:** Protect UploadThing routers with active sessions. Never expose raw URLs in the client; use `getSignedFileUrlAction` for short-lived (1h) signed URLs.
- **SSRF Prevention:** For all fetch calls to user-supplied URLs, validate hostnames against an allow-list (`utfs.io`, `ufs.sh`), check `https:` protocol, extract and validate the `fileKey` against `/^[a-zA-Z0-9\-_.]+$/`, and reconstruct the URL using static strings on the server.
- **Doble Ciego:** Strip PII fields (`name`, `email`, `githubUsername`, `image`) on the server for perfiles where `status !== "accepted"`. Never send them to the client. Sanitizer recruiter pitches against XSS.

<!-- END:skillradar-security-rules -->
