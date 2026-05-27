"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileWarning, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function CVAnalysisError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("CV Analysis Error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center animate-fade-in">
            <div className="relative mb-6 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                <FileWarning className="size-8" />
                <div className="absolute inset-0 size-16 rounded-2xl bg-amber-500/5 blur-xl animate-pulse" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Error en el Análisis de CV
            </h1>

            <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
                No se pudo completar el análisis del currículum. Esto puede deberse a un formato incompatible, problemas
                de red con el motor de IA, o a que el archivo está protegido.
            </p>

            {error.message && (
                <div className="mt-5 max-w-md rounded-xl border border-border/40 bg-muted/30 p-4 text-left backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Causa del fallo:
                    </p>
                    <p className="mt-1 font-mono text-xs font-semibold text-amber-500/90 break-words leading-normal">
                        {error.message}
                    </p>
                </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Button
                    onClick={() => reset()}
                    size="default"
                    className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 font-medium"
                >
                    <RefreshCw className="size-4 shrink-0" />
                    <span>Intentar de nuevo</span>
                </Button>

                <Link href="/dashboard">
                    <Button
                        variant="ghost"
                        size="default"
                        className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4 shrink-0" />
                        <span>Volver al Dashboard</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
