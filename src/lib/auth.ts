import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getClientIp, checkLoginRateLimit } from "@/lib/rate-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    debug: true,
    ...authConfig,
    providers: [
        ...authConfig.providers,
        Credentials({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // 1. Control de fuerza bruta por IP (Upstash Redis)
                try {
                    const ip = await getClientIp();
                    const rateResult = await checkLoginRateLimit(ip);
                    if (!rateResult.success) {
                        throw new Error("RATE_LIMIT_EXCEEDED");
                    }
                } catch (limitError: unknown) {
                    if (limitError instanceof Error && limitError.message === "RATE_LIMIT_EXCEEDED") {
                        throw limitError;
                    }
                    console.warn(
                        "⚠️ [Auth] Falló validación de rate limit para login, omitiendo por seguridad:",
                        limitError,
                    );
                }

                const email = String(credentials.email).toLowerCase().trim();
                const password = String(credentials.password);

                try {
                    const user = await db.user.findUnique({
                        where: { email },
                    });

                    if (!user || !user.passwordHash) return null;

                    const isValid = await bcrypt.compare(password, user.passwordHash);
                    if (!isValid) return null;

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                        isGuest: false,
                    };
                } catch (error) {
                    console.error("[Auth] Error en authorize credentials:", error);
                    return null;
                }
            },
        }),
    ],
});
