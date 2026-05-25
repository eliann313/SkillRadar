"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function JobMatchError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Job Match Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center animate-fade-in">
      <div className="relative mb-6 flex size-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
        <AlertOctagon className="size-8" />
        <div className="absolute inset-0 size-16 rounded-2xl bg-indigo-500/5 blur-xl animate-pulse" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Error en Job Match
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        No se pudo completar la comparación con la oferta laboral. Esto puede
        deberse a que el formato de la descripción de trabajo es demasiado largo
        o complejo, o a una interrupción con los servicios de IA de SkillRadar.
      </p>

      {error.message && (
        <div className="mt-5 max-w-md rounded-xl border border-border/40 bg-muted/30 p-4 text-left backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Causa del fallo:
          </p>
          <p className="mt-1 font-mono text-xs font-semibold text-indigo-400/90 break-words leading-normal">
            {error.message}
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <Button
          onClick={() => reset()}
          size="default"
          className="gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 font-medium"
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
