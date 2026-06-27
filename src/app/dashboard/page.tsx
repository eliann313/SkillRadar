import { auth } from "@/lib/auth";
import { DashboardHeader, MetricsGrid, NextAction, HistoricalChart } from "@/components/dashboard";
import { TalentDashboard } from "@/components/recruiter";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const DEFAULT_LIMITS = {
    cvAnalysis: 5,
    jobMatch: 3,
    mockInterview: 2,
};

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    // Recruiter dashboard
    if (session.user.role === "recruiter") {
        return <TalentDashboard />;
    }

    const userId = session.user.id;

    // 1. Obtener el último CV subido por el usuario
    const latestResume = await db.resume.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            fileName: true,
            atsScore: true,
            createdAt: true,
        },
    });

    // 2. Obtener el último Job Match
    const latestJobMatch = await db.jobMatch.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            matchScore: true,
            createdAt: true,
            analysis: true,
        },
    });

    // 3. Obtener el historial de CVs con score para el gráfico de progreso
    const resumesHistory = await db.resume.findMany({
        where: {
            userId,
            atsScore: { not: null },
        },
        orderBy: { createdAt: "asc" },
        take: 7,
        select: {
            createdAt: true,
            atsScore: true,
            fileName: true,
        },
    });

    // Formatear el historial para el gráfico
    const historicalScores = resumesHistory.map((r) => ({
        date: new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        score: r.atsScore || 0,
        name: r.fileName,
    }));

    // 4. Calcular el uso de límites del mes en curso
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const cvMonthCount = await db.resume.count({
        where: {
            userId,
            createdAt: { gte: startOfMonth },
        },
    });

    const jobMatchMonthCount = await db.jobMatch.count({
        where: {
            userId,
            createdAt: { gte: startOfMonth },
        },
    });

    const interviewMonthCount = await db.interviewSession.count({
        where: {
            userId,
            createdAt: { gte: startOfMonth },
        },
    });

    // 5. Determinar la acción recomendada dinámicamente
    const totalResumes = await db.resume.count({ where: { userId } });
    const totalMatches = await db.jobMatch.count({ where: { userId } });

    let nextAction = {
        type: "upload-cv",
        title: "Subir Currículum",
        description:
            "Diagnostica y optimiza tu perfil con IA. Sube tu currículum en formato PDF o TXT para calcular tu puntuación ATS inicial.",
        ctaText: "Subir CV",
        ctaLink: "/dashboard/cv-analysis",
    };

    if (totalResumes > 0 && totalMatches === 0) {
        nextAction = {
            type: "job-match",
            title: "Comparar con Oferta de Trabajo",
            description:
                "Analiza la afinidad de tu currículum con ofertas laborales reales. Copia y pega una descripción de empleo para que la IA evalúe los gaps.",
            ctaText: "Crear Job Match",
            ctaLink: "/dashboard/job-match",
        };
    } else if (totalResumes > 0 && totalMatches > 0) {
        nextAction = {
            type: "mock-interview",
            title: "Practicar Entrevista Técnica",
            description:
                "Entrena tus respuestas. Genera una sesión de entrevista interactiva basada en los stacks y las deficiencias de tu perfil.",
            ctaText: "Iniciar Simulación",
            ctaLink: "/dashboard/interview",
        };
    }

    const limits = {
        cvAnalysis: { used: cvMonthCount, limit: DEFAULT_LIMITS.cvAnalysis },
        jobMatch: { used: jobMatchMonthCount, limit: DEFAULT_LIMITS.jobMatch },
        mockInterview: { used: interviewMonthCount, limit: DEFAULT_LIMITS.mockInterview },
    };

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader />
            <NextAction {...nextAction} />
            <MetricsGrid latestResume={latestResume} latestJobMatch={latestJobMatch} limits={limits} />
            <HistoricalChart scores={historicalScores} />
        </div>
    );
}
