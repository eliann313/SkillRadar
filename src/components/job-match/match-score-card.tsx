"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { JobMatch } from "@/lib/types";
import { Check, X, Target, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchScoreCardProps {
  match: JobMatch;
}

export function MatchScoreCard({ match }: MatchScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Partial Match";
    return "Low Match";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald";
    if (score >= 60) return "bg-primary";
    if (score >= 40) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-primary" />
              Match Results
            </CardTitle>
            <CardDescription className="mt-1">
              {match.jobTitle}
              {match.company && ` at ${match.company}`}
            </CardDescription>
          </div>
          <div className="text-right">
            <span className={cn("text-4xl font-bold", getScoreColor(match.matchScore))}>
              {match.matchScore}%
            </span>
            <p className="text-sm text-muted-foreground">{getScoreLabel(match.matchScore)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Progress bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Compatibility Score</span>
            <span className="font-medium">{match.matchScore}/100</span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full transition-all duration-500",
                getProgressColor(match.matchScore)
              )}
              style={{ width: `${match.matchScore}%` }}
            />
          </div>
        </div>

        <Separator />

        {/* Skills breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Aligned Skills */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald/10">
                <Check className="size-4 text-emerald" />
              </div>
              <div>
                <p className="font-medium text-foreground">Aligned Skills</p>
                <p className="text-xs text-muted-foreground">
                  {match.alignedSkills.length} skills match
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {match.alignedSkills.map((skill) => (
                <Badge
                  key={skill}
                  className="bg-emerald/10 text-emerald hover:bg-emerald/20"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
                <X className="size-4 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">Skill Gaps</p>
                <p className="text-xs text-muted-foreground">
                  {match.missingSkills.length} skills to learn
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {match.missingSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="border-destructive/30 text-destructive"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Recommendation */}
        <div className="flex gap-3 rounded-lg bg-muted/50 p-4">
          {match.matchScore >= 70 ? (
            <>
              <TrendingUp className="size-5 shrink-0 text-emerald" />
              <div>
                <p className="font-medium text-foreground">Strong Candidate</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your profile aligns well with this position. Consider applying and
                  highlighting your {match.alignedSkills.slice(0, 3).join(", ")} experience.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="size-5 shrink-0 text-warning" />
              <div>
                <p className="font-medium text-foreground">Consider Upskilling</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Focus on learning {match.missingSkills.slice(0, 2).join(" and ")} to
                  improve your match score for similar positions.
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
