import { Badge } from "@/components/ui/badge";

/** Badges de la pantalla de postulaciones (ex helpers del screen monolítico). */

export function getScoreColor(score: number): string {
    if (score >= 85) return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    if (score >= 70) return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
    if (score >= 50) return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
    return "bg-muted text-muted-foreground border border-muted-foreground/10";
}

export function getStatusBadge(status: string) {
    switch (status) {
        case "reviewed":
            return (
                <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">
                    En Revisión
                </Badge>
            );
        case "shortlisted":
            return (
                <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                    Preseleccionado
                </Badge>
            );
        case "rejected":
            return (
                <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-200">
                    No Seleccionado
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                    Recibida
                </Badge>
            );
    }
}

export function getContactBadge(status: string) {
    switch (status) {
        case "accepted":
            return (
                <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Contacto Revelado
                </Badge>
            );
        case "pending":
            return (
                <Badge className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    Contacto Pendiente
                </Badge>
            );
        case "declined":
            return <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20">Contacto Rechazado</Badge>;
        default:
            return <Badge className="bg-muted text-muted-foreground border border-border">Doble Ciego Activo</Badge>;
    }
}
