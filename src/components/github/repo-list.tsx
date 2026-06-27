"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, ExternalLink } from "lucide-react";

interface Repo {
    name: string;
    description: string | null;
    stars: number;
    language: string | null;
    url: string;
}

interface RepoListProps {
    repos: Repo[];
}

export function RepoList({ repos }: RepoListProps) {
    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader>
                <CardTitle className="text-lg">Proyectos Públicos</CardTitle>
                <CardDescription>Repositorios analizados en el perfil</CardDescription>
            </CardHeader>
            <CardContent>
                {repos.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        No se encontraron repositorios públicos.
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {repos.map((repo, idx) => (
                            <div
                                key={idx}
                                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm text-foreground truncate">{repo.name}</h4>
                                        {repo.language && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                {repo.language}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">
                                        {repo.description || "Sin descripción."}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0 text-muted-foreground text-xs">
                                    <div className="flex items-center gap-1">
                                        <Star className="size-3.5 text-amber-500 fill-amber-500" />
                                        <span>{repo.stars}</span>
                                    </div>
                                    <a
                                        href={repo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-primary transition-colors p-1"
                                    >
                                        <ExternalLink className="size-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
