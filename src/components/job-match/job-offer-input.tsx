"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Sparkles, Loader2, FileText } from "lucide-react";
import { Link } from "@/i18n/routing";

interface ResumeOption {
    id: string;
    fileName: string;
    createdAt: Date | string;
}

interface JobOfferInputProps {
    resumes: ResumeOption[];
    onMatch: (resumeId: string, offerText: string) => void;
    isLoading?: boolean;
}

export function JobOfferInput({ resumes, onMatch, isLoading = false }: JobOfferInputProps) {
    const [offerText, setOfferText] = useState("");
    const [selectedResumeId, setSelectedResumeId] = useState("");

    // Determinar de forma reactiva el ID del CV activo para evitar setState en un useEffect
    const activeResumeId = selectedResumeId || resumes[0]?.id || "";

    const handleMatch = () => {
        if (activeResumeId && offerText.trim()) {
            onMatch(activeResumeId, offerText);
        }
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="size-5 text-primary" />
                    Job Offer & CV Match
                </CardTitle>
                <CardDescription>
                    Select a resume from your history and paste the job description to match
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {/* Resume Selector */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="resume-select" className="flex items-center gap-1.5 font-medium">
                        <FileText className="size-4 text-primary" />
                        Select CV from History
                    </Label>
                    {resumes.length === 0 ? (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 text-sm text-amber-600 dark:text-amber-400">
                            No has subido ningún CV aún. Por favor ve a la sección de{" "}
                            <Link
                                href="/dashboard/cv-analysis"
                                className="underline font-semibold hover:text-amber-700"
                            >
                                CV Analysis
                            </Link>{" "}
                            para cargar tu primer currículum.
                        </div>
                    ) : (
                        <div className="relative">
                            <select
                                id="resume-select"
                                value={activeResumeId}
                                onChange={(e) => setSelectedResumeId(e.target.value)}
                                disabled={isLoading}
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground transition-all duration-200"
                            >
                                {resumes.map((resume) => (
                                    <option key={resume.id} value={resume.id} className="bg-background text-foreground">
                                        {resume.fileName} (subido el {new Date(resume.createdAt).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="job-offer">Job Description</Label>
                    <Textarea
                        id="job-offer"
                        placeholder="Paste the full job description here...

Example:
We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and Next.js. You will be responsible for building scalable web applications..."
                        value={offerText}
                        onChange={(e) => setOfferText(e.target.value)}
                        className="min-h-[200px] resize-none"
                        disabled={isLoading}
                    />
                </div>

                <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={handleMatch}
                    disabled={!offerText.trim() || !activeResumeId || isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 data-icon="inline-start" className="animate-spin" />
                            Analyzing Match...
                        </>
                    ) : (
                        <>
                            <Sparkles data-icon="inline-start" />
                            Analyze Match
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
