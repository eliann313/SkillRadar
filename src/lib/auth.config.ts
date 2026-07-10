import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const enableGuestLogin = process.env.ENABLE_GUEST_LOGIN !== "false";

const providers: NextAuthConfig["providers"] = [
    GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
    }),
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
    }),
    ...(enableGuestLogin
        ? [
              Credentials({
                  id: "guest",
                  name: "Guest Session",
                  credentials: {
                      role: { label: "Role", type: "text" },
                  },
                  async authorize(credentials) {
                      const isRecruiter = credentials?.role === "recruiter";
                      return {
                          id: isRecruiter ? "guest-recruiter-id" : "guest-developer-id",
                          name: isRecruiter ? "Demo Recruiter" : "Demo Developer",
                          email: isRecruiter ? "recruiter-guest@skillradar.dev" : "developer-guest@skillradar.dev",
                          image: null,
                          role: isRecruiter ? "recruiter" : "developer",
                          isGuest: true,
                      };
                  },
              }),
          ]
        : []),
];

export const authConfig = {
    providers,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;
            // Strip locale prefix if present (e.g. /es/dashboard -> /dashboard)
            const basePage = pathname.replace(/^\/(?:es|en)(?=\/|$)/, "") || "/";
            const isOnDashboard = basePage.startsWith("/dashboard");

            // Guard against infinitely nested callbackUrl parameters.
            // This can happen when the signIn page is "/login" and NextAuth appends
            // the current URL (which already has ?callbackUrl=...) as the new callbackUrl.
            const rawCallback = nextUrl.searchParams.get("callbackUrl");
            if (rawCallback) {
                try {
                    const decoded = decodeURIComponent(rawCallback);
                    if (decoded.includes("callbackUrl")) {
                        // Strip the nested callbackUrl and redirect to a clean login URL
                        return Response.redirect(new URL("/login", nextUrl.origin));
                    }
                } catch {
                    // If the callbackUrl is malformed, redirect to login as a safe fallback
                    return Response.redirect(new URL("/login", nextUrl.origin));
                }
            }

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id || "";
                token.role = user.role || "developer";
                token.isGuest = user.isGuest || false;
                token.isSuspended = user.isSuspended || false;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.isGuest = token.isGuest as boolean;
                session.user.isSuspended = token.isSuspended as boolean;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
