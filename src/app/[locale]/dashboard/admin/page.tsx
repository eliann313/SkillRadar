"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, AlertTriangle, ArrowRight, BarChart3, TrendingUp, ShieldAlert, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getFunnelDataAction, getPendingReportsAction } from "@/features/admin/actions";

interface FunnelData {
    registered: number;
    uploadedCv: number;
    matchedJob: number;
    appliedOrContacted: number;
}

export default function AdminDashboardPage() {
    const [funnel, setFunnel] = useState<FunnelData | null>(null);
    const [pendingReportsCount, setPendingReportsCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
        try {
            // Ya es true por defecto
            const funnelRes = await getFunnelDataAction();
            const reportsRes = await getPendingReportsAction();

            if (funnelRes.success) {
                setFunnel(funnelRes.data);
            } else {
                toast.error(funnelRes.error || "No se pudieron obtener métricas del funnel.");
            }

            if (reportsRes.success) {
                setPendingReportsCount(reportsRes.data.length);
            } else {
                toast.error(reportsRes.error || "No se pudieron obtener los reportes.");
            }
        } catch (err) {
            console.error("Error cargando dashboard:", err);
            toast.error("Error al recuperar datos globales del panel.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            void loadDashboardData();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    if (loading || !funnel) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-6">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Cargando métricas de administración...</p>
                </div>
            </div>
        );
    }

    // Calcular conversiones
    const cvRate = funnel.registered > 0 ? Math.round((funnel.uploadedCv / funnel.registered) * 100) : 0;
    const matchRate = funnel.uploadedCv > 0 ? Math.round((funnel.matchedJob / funnel.uploadedCv) * 100) : 0;
    const applyRate = funnel.matchedJob > 0 ? Math.round((funnel.appliedOrContacted / funnel.matchedJob) * 100) : 0;
    const totalConversion =
        funnel.registered > 0 ? Math.round((funnel.appliedOrContacted / funnel.registered) * 100) : 0;

    return (
        <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
                        <ShieldAlert className="size-4" />
                        PANEL DE ADMINISTRACIÓN GENERAL
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        SkillRadar Control Center
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Monitorea la conversión del funnel de usuarios, audita reportes de contenido y gestiona el
                        sistema.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm">
                            Volver al Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            <Separator className="border-border/50" />

            {/* Quick Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Usuarios</CardTitle>
                        <Users className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{funnel.registered}</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Usuarios activos en la plataforma</p>
                    </CardContent>
                </Card>

                <Card
                    className={`border-border/50 bg-card/40 backdrop-blur-sm shadow-md transition-all duration-300 ${
                        pendingReportsCount > 0 ? "ring-1 ring-destructive/30" : ""
                    }`}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Reportes Pendientes</CardTitle>
                        <AlertTriangle
                            className={`size-4 ${pendingReportsCount > 0 ? "text-destructive animate-pulse" : "text-muted-foreground"}`}
                        />
                    </CardHeader>
                    <CardContent className="flex justify-between items-end">
                        <div>
                            <div className="text-2xl font-bold text-foreground">{pendingReportsCount}</div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Contenido reportado por usuarios</p>
                        </div>
                        {pendingReportsCount > 0 && (
                            <Link href="/dashboard/admin/reports">
                                <Button size="sm" variant="destructive" className="h-7 text-xs font-semibold px-2">
                                    Moderar
                                    <ArrowRight className="size-3 ml-1" />
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Conversión Funnel</CardTitle>
                        <TrendingUp className="size-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{totalConversion}%</div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            Conversión final de registro a aplicación
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Funnel Section */}
            <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-lg overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4 bg-muted/20">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="size-5 text-primary" />
                        <div>
                            <CardTitle className="text-lg">Funnel de Conversión del Producto</CardTitle>
                            <CardDescription className="text-xs">
                                Porcentaje de usuarios que avanzan en cada fase del ciclo de SkillRadar
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8">
                    {/* Visual Funnel Blocks */}
                    <div className="space-y-6">
                        {/* Step 1: Registro */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="flex items-center gap-1.5">
                                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                        1
                                    </span>
                                    Usuarios Registrados
                                </span>
                                <span className="text-foreground">
                                    {funnel.registered}{" "}
                                    <span className="text-xs text-muted-foreground font-normal">(100%)</span>
                                </span>
                            </div>
                            <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>

                        {/* Step 2: CV Subido */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="flex items-center gap-1.5">
                                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                        2
                                    </span>
                                    Currículum Subido y Analizado
                                </span>
                                <span className="text-foreground">
                                    {funnel.uploadedCv}{" "}
                                    <span className="text-xs text-muted-foreground font-normal">({cvRate}%)</span>
                                </span>
                            </div>
                            <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${cvRate}%` }}
                                />
                            </div>
                        </div>

                        {/* Step 3: Primer Match */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="flex items-center gap-1.5">
                                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                        3
                                    </span>
                                    Job Match Calculado (Pro / Demo)
                                </span>
                                <span className="text-foreground">
                                    {funnel.matchedJob}{" "}
                                    <span className="text-xs text-muted-foreground font-normal">({matchRate}%)</span>
                                </span>
                            </div>
                            <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${matchRate}%` }}
                                />
                            </div>
                        </div>

                        {/* Step 4: Contacto / Aplicación */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="flex items-center gap-1.5">
                                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                        4
                                    </span>
                                    Postulación o Contacto Enviado
                                </span>
                                <span className="text-foreground">
                                    {funnel.appliedOrContacted}{" "}
                                    <span className="text-xs text-muted-foreground font-normal">({applyRate}%)</span>
                                </span>
                            </div>
                            <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${applyRate}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-border/40 text-center">
                        <div className="p-3 bg-muted/10 rounded-lg">
                            <p className="text-xs text-muted-foreground font-medium">Conversión de Registro a CV</p>
                            <p className="text-lg font-bold text-foreground mt-0.5">{cvRate}%</p>
                        </div>
                        <div className="p-3 bg-muted/10 rounded-lg">
                            <p className="text-xs text-muted-foreground font-medium">Conversión de CV a Match</p>
                            <p className="text-lg font-bold text-foreground mt-0.5">{matchRate}%</p>
                        </div>
                        <div className="p-3 bg-muted/10 rounded-lg">
                            <p className="text-xs text-muted-foreground font-medium">
                                Conversión de Match a Aplicación
                            </p>
                            <p className="text-lg font-bold text-foreground mt-0.5">{applyRate}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <div className="flex justify-center gap-4">
                <Link href="/dashboard/admin/reports">
                    <Button variant="outline" className="gap-2 border-border/50 hover:bg-muted py-6 px-6 font-semibold">
                        <AlertTriangle className="size-5 text-amber-500" />
                        Ver Reportes y Moderar
                    </Button>
                </Link>
            </div>
        </div>
    );
}
