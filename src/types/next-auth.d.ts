import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            isGuest?: boolean;
            isSuspended?: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        role?: string;
        isGuest?: boolean;
        isSuspended?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        isGuest?: boolean;
        isSuspended?: boolean;
    }
}
