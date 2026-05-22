"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { updateUserRole } from "@/lib/auth-actions";
import type {
  User,
  UserRole,
  DeveloperProfile,
  RecruiterProfile,
  AccountLimits,
} from "@/lib/types";

interface AuthContextType {
  user: DeveloperProfile | RecruiterProfile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  loginWithProvider: (provider: "github" | "google") => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => Promise<void>;
  accountLimits: AccountLimits;
}

const defaultLimits: AccountLimits = {
  cvAnalysis: { used: 2, limit: 5 },
  jobMatch: { used: 1, limit: 3 },
  mockInterview: { used: 0, limit: 2 },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<DeveloperProfile | RecruiterProfile | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [accountLimits] = useState<AccountLimits>(defaultLimits);

  // Reset loading state when the page becomes visible again or gets focus
  // (e.g., if the user went back from OAuth redirect or cancelled)
  useEffect(() => {
    const handleReset = () => {
      setIsLoading(false);
    };

    window.addEventListener("visibilitychange", handleReset);
    window.addEventListener("focus", handleReset);
    return () => {
      window.removeEventListener("visibilitychange", handleReset);
      window.removeEventListener("focus", handleReset);
    };
  }, []);

  // Sync session and status with context user
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (session?.user) {
      const userId = session.user.id || "default_id";
      const savedRole = session.user.role as UserRole | null;

      if (savedRole) {
        const baseUser: User = {
          id: userId,
          email: session.user.email || "user@example.com",
          name: session.user.name || "Demo User",
          avatarUrl: session.user.image || undefined,
          role: savedRole,
          createdAt: new Date(),
        };

        if (savedRole === "developer") {
          setUser({
            ...baseUser,
            role: "developer",
            skills: ["TypeScript", "React", "Next.js", "Node.js"],
            seniority: "mid",
            lastAtsScore: 78,
            cvAnalysisCount: 2,
            jobMatchCount: 1,
            mockInterviewCount: 0,
          });
        } else {
          setUser({
            ...baseUser,
            role: "recruiter",
            company: "TechCorp",
            talentSearchCount: 5,
          });
        }
      } else {
        // User has a session but hasn't selected a role yet
        setUser(null);
      }
    } else {
      setUser(null);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [session]);

  const login = useCallback(async (_email: string) => {
    setIsLoading(true);
    // In this portfolio version, we focus on GitHub OAuth.
    // We can simulate magic link success or show alert.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const loginWithProvider = useCallback(
    async (provider: "github" | "google") => {
      setIsLoading(true);
      try {
        // Always pass an explicit callbackUrl to prevent NextAuth from using
        // the current URL (which may already contain a callbackUrl param),
        // which would lead to infinitely nested callbackUrl query strings.
        await signIn(provider, { callbackUrl: "/" });
      } catch (err) {
        console.error("Provider login error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    void signOut();
  }, []);

  const setRole = useCallback(
    async (role: UserRole) => {
      if (!session?.user) return;

      const userId = session.user.id || "default_id";

      // Guardar en base de datos vía Server Action
      const result = await updateUserRole(role);
      if (!result.success) {
        console.error("Error updating user role in DB:", result.error);
        return;
      }

      // Forzar actualización del JWT y sesión en cliente
      await update({ role });

      const baseUser: User = {
        id: userId,
        email: session.user.email || "user@example.com",
        name: session.user.name || "Demo User",
        avatarUrl: session.user.image || undefined,
        role,
        createdAt: new Date(),
      };

      if (role === "developer") {
        setUser({
          ...baseUser,
          role: "developer",
          skills: ["TypeScript", "React", "Next.js", "Node.js"],
          seniority: "mid",
          lastAtsScore: 78,
          cvAnalysisCount: 2,
          jobMatchCount: 1,
          mockInterviewCount: 0,
        });
      } else {
        setUser({
          ...baseUser,
          role: "recruiter",
          company: "TechCorp",
          talentSearchCount: 5,
        });
      }
    },
    [session, update],
  );

  const isSessionLoading = status === "loading" || isLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading: isSessionLoading,
        login,
        loginWithProvider,
        logout,
        setRole,
        accountLimits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
