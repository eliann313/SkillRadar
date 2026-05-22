"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadialProgress } from "./radial-progress";
import { useAuth } from "@/lib/auth-context";
import { FileText, Briefcase, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MetricsGrid() {
  const { user, accountLimits } = useAuth();

  const developerUser = user?.role === "developer" ? user : null;
  const atsScore = developerUser?.lastAtsScore ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* ATS Score Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">ATS Score</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Last analysis
            </Badge>
          </div>
          <CardDescription>Your CV optimization score</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pt-4">
          <RadialProgress value={atsScore} size={140} strokeWidth={10}>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">{atsScore}</span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
          </RadialProgress>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="size-4 text-emerald" />
            <span className="text-muted-foreground">
              <span className="font-medium text-emerald">+5</span> from last week
            </span>
          </div>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/dashboard/cv-analysis">Improve Score</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Job Match Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Job Match</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Latest
            </Badge>
          </div>
          <CardDescription>Recent offer compatibility</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Senior Frontend Dev</span>
              <span className="text-2xl font-bold text-foreground">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge className="bg-emerald/10 text-emerald hover:bg-emerald/20 text-xs">
              React
            </Badge>
            <Badge className="bg-emerald/10 text-emerald hover:bg-emerald/20 text-xs">
              TypeScript
            </Badge>
            <Badge className="bg-emerald/10 text-emerald hover:bg-emerald/20 text-xs">
              Next.js
            </Badge>
            <Badge className="bg-warning/10 text-warning hover:bg-warning/20 text-xs">
              +2 gaps
            </Badge>
          </div>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/dashboard/job-match">New Match</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Account Limits Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Account Limits</CardTitle>
            <Badge variant="outline" className="text-xs">
              Free Plan
            </Badge>
          </div>
          <CardDescription>Monthly usage remaining</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          {/* CV Analysis */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">CV Analysis</span>
              </div>
              <span className="font-medium">
                {accountLimits.cvAnalysis.used}/{accountLimits.cvAnalysis.limit}
              </span>
            </div>
            <Progress
              value={(accountLimits.cvAnalysis.used / accountLimits.cvAnalysis.limit) * 100}
              className="h-1.5"
            />
          </div>

          {/* Job Match */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Job Match</span>
              </div>
              <span className="font-medium">
                {accountLimits.jobMatch.used}/{accountLimits.jobMatch.limit}
              </span>
            </div>
            <Progress
              value={(accountLimits.jobMatch.used / accountLimits.jobMatch.limit) * 100}
              className="h-1.5"
            />
          </div>

          {/* Mock Interview */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Mock Interview</span>
              </div>
              <span className="font-medium">
                {accountLimits.mockInterview.used}/{accountLimits.mockInterview.limit}
              </span>
            </div>
            <Progress
              value={
                (accountLimits.mockInterview.used / accountLimits.mockInterview.limit) * 100
              }
              className="h-1.5"
            />
          </div>

          <Button variant="default" size="sm" className="mt-2 w-full">
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
