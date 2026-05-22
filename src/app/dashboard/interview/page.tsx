"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DashboardShell } from "@/components/layout";
import { MockInterviewChat } from "@/components/interview";
import { redirect } from "next/navigation";

function InterviewContent() {
  const { user } = useAuth();

  if (!user) {
    redirect("/");
  }

  if (user.role !== "developer") {
    redirect("/dashboard");
  }

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Mock Interview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Practice your interview skills with our AI interviewer
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <MockInterviewChat />
      </div>
    </DashboardShell>
  );
}

export default function InterviewPage() {
  return (
    <AuthProvider>
      <InterviewContent />
    </AuthProvider>
  );
}
