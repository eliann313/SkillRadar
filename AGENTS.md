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
