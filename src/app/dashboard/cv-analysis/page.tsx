"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CVUploadForm, AnalysisResults } from "@/components/cv-analysis";
import type { CVAnalysis } from "@/lib/types";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const mockAnalysis: CVAnalysis = {
  id: "1",
  userId: "user-1",
  atsScore: 78,
  detectedKeywords: [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "REST API",
    "Git",
    "Agile",
    "JavaScript",
    "CSS",
    "HTML",
  ],
  missingKeywords: [
    "CI/CD",
    "Docker",
    "AWS",
    "Testing",
    "Performance Optimization",
  ],
  estimatedSeniority: "mid",
  suggestions: [
    "Add specific metrics and achievements to quantify your impact (e.g., 'Improved page load time by 40%').",
    "Include experience with CI/CD pipelines and containerization technologies like Docker.",
    "Mention cloud platform experience (AWS, GCP, or Azure) even if basic.",
    "Add a dedicated 'Technical Skills' section with categorized skills for better ATS parsing.",
    "Include links to your GitHub profile or portfolio projects to showcase your work.",
  ],
  createdAt: new Date(),
};

export default function CVAnalysisPage() {
  const { data: session, status } = useSession();
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    redirect("/");
  }

  if (session.user.role !== "developer") {
    redirect("/dashboard");
  }

  const handleAnalyze = async (_content: string) => {
    setIsLoading(true);
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setAnalysis(mockAnalysis);
    setIsLoading(false);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          CV Analysis
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your CV and get AI-powered insights to improve your ATS score
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CVUploadForm
          onAnalyze={(content) => {
            void handleAnalyze(content);
          }}
          isLoading={isLoading}
        />

        {analysis && (
          <div className="lg:col-span-2">
            <AnalysisResults analysis={analysis} />
          </div>
        )}
      </div>
    </>
  );
}
