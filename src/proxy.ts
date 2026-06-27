import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export const proxy = NextAuth(authConfig).auth;

export const config = {
    // Include root path so the callbackUrl sanitization guard in the authorized
    // callback can fire and prevent infinitely nested ?callbackUrl= parameters.
    matcher: ["/", "/login", "/dashboard/:path*"],
};
