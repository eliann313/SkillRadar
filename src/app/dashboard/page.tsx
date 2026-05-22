"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DashboardShell } from "@/components/layout";
import { DashboardHeader, MetricsGrid } from "@/components/dashboard";
import { TalentDashboard } from "@/components/recruiter";
import { redirect } from "next/navigation";

function DashboardContent() {
  const { user } = useAuth();

  if (!user) {
    redirect("/");
  }

  // Recruiter dashboard
  if (user.role === "recruiter") {
    return (
      <DashboardShell>
        <TalentDashboard />
      </DashboardShell>
    );
  }

  // Developer dashboard
  return (
    <DashboardShell>
      <DashboardHeader />
      <MetricsGrid />
    </DashboardShell>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
