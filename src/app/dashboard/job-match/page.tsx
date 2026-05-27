"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { JobOfferInput, MatchScoreCard } from "@/components/job-match";
import type { JobMatch } from "@/lib/types";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const mockMatch: JobMatch = {
    id: "1",
    userId: "user-1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    matchScore: 85,
    alignedSkills: ["React", "TypeScript", "Next.js", "REST APIs", "Git", "Agile", "JavaScript", "Responsive Design"],
    missingSkills: ["GraphQL", "AWS", "Cypress", "Figma"],
    createdAt: new Date(),
};

export default function JobMatchPage() {
    const { data: session, status } = useSession();
    const [match, setMatch] = useState<JobMatch | null>(null);
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

    const handleMatch = async (_offer: string) => {
        setIsLoading(true);
        // Simulate AI matching
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setMatch(mockMatch);
        setIsLoading(false);
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Job Match</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Paste a job description to see how well your profile matches
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <JobOfferInput
                    onMatch={(offer) => {
                        void handleMatch(offer);
                    }}
                    isLoading={isLoading}
                />

                {match && <MatchScoreCard match={match} />}
            </div>
        </>
    );
}
