"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Registrar el error para observabilidad
    console.error("Dashboard Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center animate-fade-in">
      <div className="relative mb-6 flex size-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-lg shadow-destructive/5">
        <AlertTriangle className="size-10 animate-bounce" />
        <div className="absolute inset-0 size-20 rounded-2xl bg-destructive/5 blur-xl animate-pulse" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl bg-gradient-to-r from-red-400 via-rose-500 to-indigo-500 bg-clip-text text-transparent">
        Algo salió mal en el Dashboard
      </h1>

      <p className="mt-4 max-w-md text-base text-muted-foreground">
        Ha ocurrido un error inesperado al renderizar esta sección. No te
        preocupes, tus datos están a salvo.
      </p>

      {error.message && (
        <div className="mt-6 max-w-lg rounded-xl border border-border/40 bg-muted/40 p-4 text-left backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Detalle Técnico:
          </p>
          <p className="mt-1 font-mono text-xs font-medium text-rose-400/90 break-words leading-relaxed">
            {error.message}
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-[10px] text-muted-foreground/60">
              ID de rastreo: {error.digest}
            </p>
          )}
        </div>
      )}

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
        <Button
          onClick={() => reset()}
          size="lg"
          className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/10 font-semibold"
        >
          <RefreshCw className="size-4 shrink-0" />
          <span>Reintentar</span>
        </Button>

        <Link href="/dashboard">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-border/80 text-foreground hover:bg-muted/50 font-semibold"
          >
            <Home className="size-4 shrink-0" />
            <span>Volver al Panel</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
