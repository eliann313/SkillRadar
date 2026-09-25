"use client";

import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResults } from "@/components/cv-analysis";
import { MatchScoreCard } from "@/components/job-match/match-score-card";
import { LanguageChart } from "@/components/github/language-chart";
import { AnalysisCards } from "@/components/github/analysis-cards";
import { demoCvAnalysis, demoJobMatch, demoGithubLanguages, demoGithubSignals } from "@/mocks/demo-data";
import { FlaskConical, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DemoPage() {
    const t = useTranslations("Home");

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto max-w-5xl px-6 py-10">
                <div className="mb-8 flex flex-col items-start gap-4">
                    <Badge variant="outline" className="gap-1.5 border-warning/40 text-warning">
                        <FlaskConical className="size-3.5" />
                        {t("demoBadge")}
                    </Badge>
                    <h1 className="text-3xl font-black tracking-tight md:text-4xl">{t("demoTitle")}</h1>
                    <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{t("demoSubtitle")}</p>
                </div>

                <Tabs defaultValue="cv" className="w-full">
                    <TabsList className="mb-6 grid w-full grid-cols-3">
                        <TabsTrigger value="cv">{t("demoTabCv")}</TabsTrigger>
                        <TabsTrigger value="match">{t("demoTabMatch")}</TabsTrigger>
                        <TabsTrigger value="github">{t("demoTabGithub")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="cv">
                        <AnalysisResults analysis={demoCvAnalysis} />
                    </TabsContent>
                    <TabsContent value="match">
                        <MatchScoreCard match={demoJobMatch} />
                    </TabsContent>
                    <TabsContent value="github" className="flex flex-col gap-6">
                        <LanguageChart languages={demoGithubLanguages} />
                        <AnalysisCards analysis={demoGithubSignals} />
                    </TabsContent>
                </Tabs>

                <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-border/40 bg-card/40 p-8 text-center">
                    <p className="text-sm text-muted-foreground">{t("demoCtaText")}</p>
                    <Link href="/login?register=true">
                        <Button size="lg" className="gap-2">
                            {t("startFree")}
                            <ArrowRight className="size-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
