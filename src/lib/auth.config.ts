import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

const providers: any[] = [
  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authConfig = {
  providers,
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      // Guard against infinitely nested callbackUrl parameters.
      // This can happen when the signIn page is "/" and NextAuth appends
      // the current URL (which already has ?callbackUrl=...) as the new callbackUrl.
      const rawCallback = nextUrl.searchParams.get("callbackUrl");
      if (rawCallback) {
        try {
          const decoded = decodeURIComponent(rawCallback);
          if (decoded.includes("callbackUrl")) {
            // Strip the nested callbackUrl and redirect to a clean root URL
            return Response.redirect(new URL("/", nextUrl.origin));
          }
        } catch {
          // If the callbackUrl is malformed, redirect to root as a safe fallback
          return Response.redirect(new URL("/", nextUrl.origin));
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
