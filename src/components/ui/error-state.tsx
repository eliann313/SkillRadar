import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/shared-kernel/utils";

interface ErrorStateProps {
    title: string;
    description?: string;
    retryLabel?: string;
    onRetry?: () => void;
    className?: string;
}

/** Estado de error recuperable (Fase 4): mensaje + reintento opcional. */
export function ErrorState({ title, description, retryLabel, onRetry, className }: ErrorStateProps) {
    return (
        <div
            role="alert"
            className={cn(
                "col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
                className,
            )}
        >
            <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-destructive/10">
                <TriangleAlert className="size-5 text-destructive" />
            </div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description ? <p className="max-w-md text-xs text-muted-foreground">{description}</p> : null}
            {onRetry ? (
                <Button onClick={onRetry} variant="outline" size="sm" className="mt-2">
                    {retryLabel ?? "Reintentar"}
                </Button>
            ) : null}
        </div>
    );
}
