"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signIn, useSession } from "next-auth/react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Mail, Loader2, Bot, Users } from "lucide-react";
import { RoleSelector } from "./role-selector";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const { data: session, status } = useSession();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsAuthLoading(true);
    try {
      await signIn("resend", { email, redirect: false });
      setEmailSent(true);
    } catch (err) {
      console.error("Magic link error:", err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleProviderLogin = async (provider: "github" | "google") => {
    setIsAuthLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error("Provider login error:", err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGuestLogin = async (role: "developer" | "recruiter") => {
    setIsAuthLoading(true);
    try {
      await signIn("credentials", { role, callbackUrl: "/dashboard" });
    } catch (err) {
      console.error("Guest login error:", err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // If authenticated but role hasn't been chosen yet, render the selector
  if (session && !session.user.role) {
    return <RoleSelector />;
  }

  const isLoading = status === "loading" || isAuthLoading;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10 glow-emerald">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-8 text-primary"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SkillRadar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-powered developer profile analysis
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to analyze your profile or find talent
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Social buttons */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => void handleProviderLogin("github")}
                disabled={isLoading}
              >
                <GitHubLogoIcon data-icon="inline-start" />
                Continue with GitHub
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => void handleProviderLogin("google")}
                disabled={isLoading}
              >
                <svg
                  data-icon="inline-start"
                  viewBox="0 0 24 24"
                  className="size-4"
                >
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <Button
                  variant="secondary"
                  className="w-full gap-2 text-xs"
                  onClick={() => void handleGuestLogin("developer")}
                  disabled={isLoading}
                >
                  <Bot className="size-4 shrink-0 text-primary animate-pulse" />
                  Dev Demo
                </Button>
                <Button
                  variant="secondary"
                  className="w-full gap-2 text-xs"
                  onClick={() => void handleGuestLogin("recruiter")}
                  disabled={isLoading}
                >
                  <Users className="size-4 shrink-0 text-indigo-500 animate-pulse" />
                  Recruiter Demo
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            {/* Magic link form */}
            {emailSent ? (
              <div className="flex flex-col items-center gap-3 rounded-lg bg-primary/5 p-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="size-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Check your email
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We sent a magic link to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEmailSent(false)}
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  void handleMagicLink(e);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading || !email}>
                  {isLoading ? (
                    <>
                      <Loader2
                        data-icon="inline-start"
                        className="animate-spin"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail data-icon="inline-start" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </form>
            )}

            <p className="text-center text-xs text-zinc-400">
              By continuing, you agree to our{" "}
              <a
                href="#"
                className="text-primary underline hover:text-primary/80"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-primary underline hover:text-primary/80"
              >
                Privacy Policy
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
