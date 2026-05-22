"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TalentCard } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Search, Users, Award, TrendingUp, Clock, Eye } from "lucide-react";

interface TalentDashboardProps {
  talents?: TalentCard[];
}

const mockTalents: TalentCard[] = [
  {
    id: "1",
    anonymousId: "DEV-7842",
    estimatedSeniority: "senior",
    averageScore: 92,
    topSkills: ["React", "TypeScript", "Node.js", "AWS"],
    languages: ["JavaScript", "Python"],
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "2",
    anonymousId: "DEV-3156",
    estimatedSeniority: "mid",
    averageScore: 78,
    topSkills: ["Vue.js", "PHP", "Laravel", "MySQL"],
    languages: ["JavaScript", "PHP"],
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "3",
    anonymousId: "DEV-9423",
    estimatedSeniority: "lead",
    averageScore: 95,
    topSkills: ["System Design", "Go", "Kubernetes", "PostgreSQL"],
    languages: ["Go", "Python", "Rust"],
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "4",
    anonymousId: "DEV-5271",
    estimatedSeniority: "junior",
    averageScore: 65,
    topSkills: ["React", "CSS", "HTML", "JavaScript"],
    languages: ["JavaScript"],
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: "5",
    anonymousId: "DEV-8034",
    estimatedSeniority: "senior",
    averageScore: 88,
    topSkills: ["Next.js", "GraphQL", "MongoDB", "Docker"],
    languages: ["TypeScript", "Python"],
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "6",
    anonymousId: "DEV-2198",
    estimatedSeniority: "mid",
    averageScore: 72,
    topSkills: ["Angular", "Java", "Spring Boot", "Redis"],
    languages: ["Java", "TypeScript"],
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
];

const seniorityColors: Record<string, string> = {
  junior: "bg-indigo/10 text-indigo border-indigo/20",
  mid: "bg-primary/10 text-primary border-primary/20",
  senior: "bg-emerald/10 text-emerald border-emerald/20",
  lead: "bg-warning/10 text-warning border-warning/20",
};

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-emerald";
  if (score >= 75) return "text-primary";
  if (score >= 60) return "text-warning";
  return "text-muted-foreground";
};

const formatLastActive = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export function TalentDashboard({
  talents = mockTalents,
}: TalentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTalents = talents.filter((talent) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      talent.topSkills.some((skill) => skill.toLowerCase().includes(query)) ||
      talent.languages.some((lang) => lang.toLowerCase().includes(query)) ||
      talent.estimatedSeniority.toLowerCase().includes(query) ||
      talent.anonymousId.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Talent Pool
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse anonymous developer profiles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {talents.length}
            </p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by skill (e.g., Next.js, React, Python)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Talent Grid */}
      {filteredTalents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-16">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Search className="size-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">No matches found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTalents.map((talent) => (
            <Card
              key={talent.id}
              className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-mono text-sm text-muted-foreground">
                      {talent.anonymousId}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-2 capitalize",
                        seniorityColors[talent.estimatedSeniority],
                      )}
                    >
                      <Award className="mr-1 size-3" />
                      {talent.estimatedSeniority}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="size-4 text-muted-foreground" />
                      <span
                        className={cn(
                          "text-2xl font-bold",
                          getScoreColor(talent.averageScore),
                        )}
                      >
                        {talent.averageScore}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Avg. Score</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Skills */}
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Top Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {talent.topSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Languages
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {talent.languages.map((lang) => (
                      <Badge
                        key={lang}
                        className="bg-indigo/10 text-indigo hover:bg-indigo/20 text-xs"
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span>{formatLastActive(talent.lastActive)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Eye className="size-3" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
