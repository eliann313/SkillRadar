import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const authMiddleware = NextAuth(authConfig).auth;

export const proxy = authMiddleware((req) => {
    return intlMiddleware(req);
});

export const config = {
    // Match all internationalized paths and auth paths except static files, assets, and api
    matcher: ["/((?!api|_next|.*\\..*).*)"],
};
