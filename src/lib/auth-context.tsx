"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  User,
  UserRole,
  DeveloperProfile,
  RecruiterProfile,
  AccountLimits,
} from "@/lib/types";

interface AuthContextType {
  user: DeveloperProfile | RecruiterProfile | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  loginWithProvider: (provider: "github" | "google") => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  accountLimits: AccountLimits;
}

const defaultLimits: AccountLimits = {
  cvAnalysis: { used: 2, limit: 5 },
  jobMatch: { used: 1, limit: 3 },
  mockInterview: { used: 0, limit: 2 },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DeveloperProfile | RecruiterProfile | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [accountLimits] = useState<AccountLimits>(defaultLimits);

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    // Simulate magic link auth
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    // In real app, this would send magic link email
  }, []);

  const loginWithProvider = useCallback(
    async (provider: "github" | "google") => {
      setIsLoading(true);
      // Simulate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const setRole = useCallback((role: UserRole) => {
    const baseUser: User = {
      id: crypto.randomUUID(),
      email: "user@example.com",
      name: "Demo User",
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
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
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
