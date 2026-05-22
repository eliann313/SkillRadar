"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";
import { Code2, Users, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const roles: {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}[] = [
  {
    id: "developer",
    title: "Developer",
    description: "Analyze your CV, match with jobs, and practice interviews",
    icon: <Code2 className="size-6" />,
    features: [
      "CV & ATS Score Analysis",
      "Job Offer Matching",
      "AI Mock Interviews",
      "Skills Gap Detection",
    ],
  },
  {
    id: "recruiter",
    title: "Recruiter",
    description: "Find and filter talent based on skills and experience",
    icon: <Users className="size-6" />,
    features: [
      "Anonymous Talent Pool",
      "Skill-Based Search",
      "Seniority Filtering",
      "Candidate Scoring",
    ],
  },
];

export function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { setRole } = useAuth();

  const handleContinue = () => {
    if (selectedRole) {
      void setRole(selectedRole);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
            Welcome to SkillRadar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us about yourself to personalize your experience
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={cn(
                "cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80",
                selectedRole === role.id &&
                  "border-primary bg-primary/5 ring-1 ring-primary/20",
              )}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-lg transition-colors",
                      selectedRole === role.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {role.icon}
                  </div>
                  {selectedRole === role.id && (
                    <div className="flex size-6 items-center justify-center rounded-full bg-primary">
                      <Check className="size-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <CardTitle className="mt-4">{role.title}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2">
                  {role.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="size-1.5 rounded-full bg-primary/60" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            disabled={!selectedRole}
            onClick={handleContinue}
            className="gap-2"
          >
            Continue
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  );
}
