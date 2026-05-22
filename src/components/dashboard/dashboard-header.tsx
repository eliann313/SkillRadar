"use client";

import { useAuth } from "@/lib/auth-context";

export function DashboardHeader() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const firstName = user?.name?.split(" ")[0] || "Developer";

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {getGreeting()}, {firstName}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{formatDate()}</p>
    </div>
  );
}
