# GitHub Copilot Instructions

# These are loaded by GitHub Copilot in VS Code / JetBrains automatically.

## Project context

AI-powered developer profiling and ATS optimization platform.
Stack: Next.js 16 (App Router), TypeScript (strict), Tailwind CSS v4, shadcn/ui + Base UI v1.

## Coding standards

- **TypeScript**: strict mode always. No `any`. Prefer `unknown` + type narrowing.
- **React**: server components by default. Add `"use client"` only when needed (event handlers, hooks, browser APIs).
- **Imports**: absolute imports via `@/` alias. Group: external → internal → types.
- **Naming**: PascalCase for components/types, camelCase for functions/variables, SCREAMING_SNAKE for env vars.
- **Error handling**: never swallow errors silently. Use typed error objects. Surface meaningful messages to the user.
- **Async**: prefer `async/await` over `.then()` chains. Always handle rejections.

## Patterns to follow

```typescript
// ✅ Server Action pattern
"use server";
export async function myAction(data: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.flatten() };
  // ...
}

// ✅ API Route pattern (Next.js App Router)
export async function GET(request: Request) {
  try {
    // logic
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
```

## Security

- Never trust client-side input — always validate server-side with Zod.
- Sanitise any user content before rendering (DOMPurify or `next/sanitize`).
- Never log or expose API keys, tokens, or PII.
- Use `next/headers` `cookies()` for auth tokens — never `localStorage` on the server.

## What NOT to suggest

- `var` declarations
- Class components
- Direct DOM manipulation (`document.getElementById`, etc.)
- `console.log` in production code (use a logger)
- Hardcoded secrets or connection strings
