"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

interface NextActionProps {
    type: "upload-cv" | "job-match" | "mock-interview" | string;
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
}

export function NextAction({ type, title, description, ctaText, ctaLink }: NextActionProps) {
    // Seleccionar icono según el tipo
    const getIcon = () => {
        switch (type) {
            case "upload-cv":
                return <FileUp className="size-6 text-primary animate-bounce" />;
            case "job-match":
                return <Sparkles className="size-6 text-accent animate-pulse" />;
            case "mock-interview":
                return <MessageSquare className="size-6 text-primary" />;
            default:
                return <Sparkles className="size-6 text-primary" />;
        }
    };

    // Color del borde según el tipo para un look premium personalizado
    const getBorderClass = () => {
        switch (type) {
            case "upload-cv":
                return "hover:border-primary/40 hover:shadow-primary/5";
            case "job-match":
                return "hover:border-accent/40 hover:shadow-accent/5";
            case "mock-interview":
                return "hover:border-primary/40 hover:shadow-primary/5";
            default:
                return "hover:border-primary/40";
        }
    };

    return (
        <Card
            className={`border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md col-span-full ${getBorderClass()}`}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-muted/50 flex items-center justify-center">{getIcon()}</div>
                    <div>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            Next Recommended Action
                        </CardTitle>
                        <CardDescription>Siguiente paso para optimizar tu perfil profesional</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-foreground mb-1">{title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
                </div>
                <Link href={ctaLink} className="w-full md:w-auto shrink-0">
                    <Button
                        variant="default"
                        size="sm"
                        className="w-full md:w-auto gap-1.5 shadow-md shadow-primary/10"
                    >
                        {ctaText}
                        <ArrowRight className="size-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
