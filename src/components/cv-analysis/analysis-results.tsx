"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadialProgress } from "@/components/dashboard/radial-progress";
import type { CVAnalysis } from "@/lib/types";
import { Check, AlertTriangle, Lightbulb, Award } from "lucide-react";

interface AnalysisResultsProps {
    analysis: CVAnalysis;
}

const seniorityColors: Record<string, string> = {
    junior: "bg-indigo/10 text-indigo border-indigo/20",
    mid: "bg-primary/10 text-primary border-primary/20",
    senior: "bg-emerald/10 text-emerald border-emerald/20",
    lead: "bg-warning/10 text-warning border-warning/20",
};

export function getSeniorityColor(level: string) {
    const normalized = String(level).toLowerCase();
    switch (normalized) {
        case "junior":
            return seniorityColors.junior;
        case "mid":
            return seniorityColors.mid;
        case "senior":
            return seniorityColors.senior;
        case "lead":
            return seniorityColors.lead;
        default:
            return "";
    }
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Score and Seniority Header */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:justify-around">
                    {/* ATS Score */}
                    <div className="flex flex-col items-center gap-2">
                        <RadialProgress value={analysis.atsScore} size={120} strokeWidth={8}>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold text-foreground">{analysis.atsScore}</span>
                                <span className="text-xs text-muted-foreground">ATS Score</span>
                            </div>
                        </RadialProgress>
                        <p className="text-sm text-muted-foreground">
                            {analysis.atsScore >= 80
                                ? "Excellent"
                                : analysis.atsScore >= 60
                                  ? "Good"
                                  : analysis.atsScore >= 40
                                    ? "Needs Work"
                                    : "Poor"}
                        </p>
                    </div>

                    <Separator orientation="vertical" className="hidden h-24 sm:block" />
                    <Separator className="sm:hidden" />

                    {/* Estimated Seniority */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                            <Award className="size-8 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Estimated Level</p>
                            <Badge
                                variant="outline"
                                className={`mt-1 text-sm font-semibold capitalize ${getSeniorityColor(analysis.estimatedSeniority)}`}
                            >
                                {analysis.estimatedSeniority}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Keywords Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Detected Keywords */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Check className="size-5 text-emerald" />
                            Detected Keywords
                        </CardTitle>
                        <CardDescription>Skills and technologies found in your CV</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analysis.detectedKeywords.map((keyword) => (
                                <Badge key={keyword} className="bg-emerald/10 text-emerald hover:bg-emerald/20">
                                    {keyword}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Missing Keywords */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="size-5 text-warning" />
                            Missing Keywords
                        </CardTitle>
                        <CardDescription>Consider adding these to improve your score</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missingKeywords.map((keyword) => (
                                <Badge key={keyword} variant="outline" className="border-warning/30 text-warning">
                                    {keyword}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Suggestions */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Lightbulb className="size-5 text-primary" />
                        AI Suggestions
                    </CardTitle>
                    <CardDescription>Personalized recommendations to improve your CV</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="flex flex-col gap-3">
                        {analysis.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex gap-3 text-sm">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                    {index + 1}
                                </span>
                                <span className="text-muted-foreground">{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
