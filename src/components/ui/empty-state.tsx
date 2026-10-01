import type { ReactNode } from "react";
import { cn } from "@/shared-kernel/utils";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

/** Estado vacío consistente (Fase 4): icono + título + descripción + acción opcional. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                "col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-12 text-center",
                className,
            )}
        >
            {icon ? (
                <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-muted">{icon}</div>
            ) : null}
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description ? <p className="max-w-md text-xs text-muted-foreground">{description}</p> : null}
            {action ? <div className="mt-2">{action}</div> : null}
        </div>
    );
}
