"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts";

export interface MarketData {
    skillsData: Array<{ name: string; supply: number; demand: number }>;
    seniorityData: Array<{ name: string; value: number }>;
    salaryData: Array<{ name: string; min: number; max: number; avg: number }>;
}

interface TalentMarketTabProps {
    marketData: MarketData | null;
    isLoading: boolean;
}

/** Vista Market Intelligence (ex bloque del dashboard monolítico). */
export function TalentMarketTab({ marketData, isLoading }: TalentMarketTabProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                        <BarChart3 className="size-5 text-primary" />
                        Market Intelligence Dashboard
                    </CardTitle>
                    <CardDescription>
                        Analíticas dinámicas en tiempo real de oferta y demanda de habilidades, distribución de
                        seniority y estimaciones salariales basadas en datos de la plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p className="text-sm text-muted-foreground">Procesando estadísticas de base de datos...</p>
                        </div>
                    ) : !marketData ? (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                            No hay currículums analizados en el Talent Pool para compilar estadísticas de mercado.
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Oferta vs Demanda de Stack Técnico */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                                    <TrendingUp className="size-4 text-primary" />
                                    Oferta vs Demanda de Stack Técnico (Top 10 Habilidades)
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Comparativa entre la cantidad de desarrolladores que dominan una habilidad (Oferta)
                                    y la cantidad de vacantes que la solicitan (Demanda).
                                </p>
                                <div className="h-[300px] w-full pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={marketData.skillsData}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                className="stroke-border/20"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="name"
                                                stroke="var(--muted-foreground)"
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="var(--muted-foreground)"
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: "transparent" }}
                                                contentStyle={{
                                                    backgroundColor: "var(--popover)",
                                                    borderColor: "var(--border)",
                                                    borderRadius: "var(--radius)",
                                                    color: "var(--popover-foreground)",
                                                    fontSize: "12px",
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="top"
                                                height={36}
                                                wrapperStyle={{ fontSize: "11px" }}
                                            />
                                            <Bar
                                                dataKey="supply"
                                                name="Oferta (Talent Pool)"
                                                fill="var(--primary)"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="demand"
                                                name="Demanda (Ofertas de Trabajo)"
                                                fill="#10b981"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-[10px] text-muted-foreground/80 italic mt-2 text-right">
                                    * Nota: Al no detectarse ofertas locales publicadas en el Job Board, los valores de
                                    demanda se estiman proporcionalmente con base en tendencias promedio del mercado
                                    global.
                                </p>
                            </div>

                            {/* Distribución de Seniority y Salarios */}
                            <div className="grid gap-6 md:grid-cols-2 border-t border-border pt-6">
                                {/* Distribución de Seniority */}
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                                        <Users className="size-4 text-primary" />
                                        Distribución de Seniority en el Talent Pool
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Proporción de candidatos activos clasificados por nivel de experiencia estimado.
                                    </p>
                                    <div className="h-[250px] w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={marketData.seniorityData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) =>
                                                        `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : "0"}%`
                                                    }
                                                >
                                                    {marketData.seniorityData.map((entry, index) => {
                                                        const COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b"];
                                                        return (
                                                            <Cell
                                                                key={entry.name}
                                                                fill={COLORS[index % COLORS.length]}
                                                            />
                                                        );
                                                    })}
                                                </Pie>
                                                <Tooltip
                                                    cursor={{ fill: "transparent" }}
                                                    contentStyle={{
                                                        backgroundColor: "var(--popover)",
                                                        borderColor: "var(--border)",
                                                        borderRadius: "var(--radius)",
                                                        color: "var(--popover-foreground)",
                                                        fontSize: "12px",
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Salarios Estimados */}
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                                        <TrendingUp className="size-4 text-emerald-500" />
                                        Rangos Salariales Estimados (Mercado Anual EUR)
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Curva salarial de referencia basada en la compensación promedio observada en
                                        ofertas de trabajo publicadas.
                                    </p>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={marketData.salaryData}
                                                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                            >
                                                <defs>
                                                    <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    className="stroke-border/20"
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    stroke="var(--muted-foreground)"
                                                    fontSize={11}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="var(--muted-foreground)"
                                                    fontSize={11}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(v) => `${v / 1000}k`}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "var(--popover)",
                                                        borderColor: "var(--border)",
                                                        borderRadius: "var(--radius)",
                                                        color: "var(--popover-foreground)",
                                                        fontSize: "12px",
                                                    }}
                                                    formatter={(value) => [`€${Number(value).toLocaleString()}`, ""]}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    height={36}
                                                    wrapperStyle={{ fontSize: "11px" }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="avg"
                                                    name="Salario Promedio"
                                                    stroke="#10b981"
                                                    fillOpacity={1}
                                                    fill="url(#salaryGradient)"
                                                    strokeWidth={2.5}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="min"
                                                    name="Mínimo Estimado"
                                                    stroke="#3b82f6"
                                                    fill="none"
                                                    strokeWidth={1.5}
                                                    strokeDasharray="3 3"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="max"
                                                    name="Máximo Estimado"
                                                    stroke="#f59e0b"
                                                    fill="none"
                                                    strokeWidth={1.5}
                                                    strokeDasharray="3 3"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
