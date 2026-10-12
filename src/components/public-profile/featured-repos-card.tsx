import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitFork, Star, ExternalLink, Code2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export interface FeaturedRepo {
    name: string;
    description: string | null;
    stars: number;
    language: string | null;
    url: string;
}

interface FeaturedReposCardProps {
    repos: FeaturedRepo[];
    locale: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: "bg-blue-500",
    JavaScript: "bg-yellow-400",
    Python: "bg-emerald-500",
    Rust: "bg-orange-600",
    Go: "bg-cyan-500",
    HTML: "bg-rose-500",
    CSS: "bg-indigo-500",
    Java: "bg-amber-600",
    "C#": "bg-purple-600",
    PHP: "bg-indigo-400",
};

export async function FeaturedReposCard({ repos, locale }: FeaturedReposCardProps) {
    const t = await getTranslations({ locale, namespace: "PublicProfile" });

    if (!repos || repos.length === 0) return null;

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Code2 className="size-5 text-indigo-400" />
                    {t("featuredReposTitle", { default: "Proyectos Públicos Destacados" })}
                </CardTitle>
                <CardDescription>
                    {t("featuredReposDesc", {
                        default: "Repositorios de código abierto validados desde su perfil de GitHub.",
                    })}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-1">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {repos.slice(0, 3).map((repo) => {
                        const langColor = repo.language
                            ? LANGUAGE_COLORS[repo.language] || "bg-primary"
                            : "bg-muted-foreground";

                        return (
                            <a
                                key={repo.name}
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex flex-col justify-between p-3.5 rounded-lg border border-border/40 bg-card/80 hover:bg-card hover:border-primary/40 transition-all hover:shadow-xs"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-1">
                                        <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1 truncate">
                                            <GitFork className="size-3.5 text-muted-foreground shrink-0" />
                                            <span className="truncate">{repo.name}</span>
                                        </h4>
                                        <ExternalLink className="size-3 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                        {repo.description || "Repositorio público de código abierto."}
                                    </p>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-border/20 flex items-center justify-between text-[11px] text-muted-foreground">
                                    {repo.language ? (
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <span className={`size-2 rounded-full ${langColor}`} />
                                            {repo.language}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground/60">—</span>
                                    )}

                                    {repo.stars > 0 && (
                                        <span className="flex items-center gap-1 font-mono text-xs">
                                            <Star className="size-3 text-amber-400 fill-amber-400" />
                                            {repo.stars}
                                        </span>
                                    )}
                                </div>
                            </a>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
