import { auth } from "@/lib/auth";
import { DashboardHeader, MetricsGrid, NextAction, HistoricalChart, ContactRequestsList } from "@/components/dashboard";
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
        const [developers, shortlists] = await Promise.all([
            db.user.findMany({
                where: { role: "developer" },
                include: {
                    resumes: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                    receivedRequests: {
                        where: { recruiterId: session.user.id },
                    },
                },
            }),
            db.shortlist.findMany({
                where: { recruiterId: session.user.id },
                select: { developerId: true },
            }),
        ]);

        const shortlistedSet = new Set(shortlists.map((s) => s.developerId));

        const pool = developers
            .filter((dev) => dev.resumes.length > 0)
            .map((dev) => {
                const resume = dev.resumes[0];
                const request = dev.receivedRequests[0];
                const contactStatus = (request?.status || "none") as "none" | "pending" | "accepted" | "declined";

                let parsedAnalysis: {
                    keywords?: string[];
                    estimatedSeniority?: "junior" | "mid" | "senior" | "lead";
                } | null = null;
                if (resume.analysis) {
                    parsedAnalysis = (
                        typeof resume.analysis === "string" ? JSON.parse(resume.analysis) : resume.analysis
                    ) as { keywords?: string[]; estimatedSeniority?: "junior" | "mid" | "senior" | "lead" };
                }

                return {
                    id: dev.id,
                    anonymousId: `DEV-${dev.id.slice(-4).toUpperCase()}`,
                    name: contactStatus === "accepted" ? dev.name : null,
                    email: contactStatus === "accepted" ? dev.email : null,
                    githubUsername:
                        contactStatus === "accepted"
                            ? dev.image?.includes("githubusercontent")
                                ? "GitHub Revelado"
                                : "github_user"
                            : null,
                    image: contactStatus === "accepted" ? dev.image : null,
                    estimatedSeniority: (parsedAnalysis?.estimatedSeniority || "mid") as
                        "junior" | "mid" | "senior" | "lead",
                    averageScore: resume.atsScore || 0,
                    topSkills: parsedAnalysis?.keywords || [],
                    languages: [],
                    lastActive: new Date(resume.createdAt),
                    contactStatus,
                    requestId: request?.id,
                    isShortlisted: shortlistedSet.has(dev.id),
                };
            });

        return <TalentDashboard talents={pool} />;
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

    // Consultar solicitudes de contacto pendientes (Doble Ciego)
    const contactRequests = await db.contactRequest.findMany({
        where: {
            developerId: userId,
            status: "pending",
        },
        include: {
            recruiter: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader />
            {contactRequests.length > 0 && <ContactRequestsList requests={contactRequests} />}
            <NextAction {...nextAction} />
            <MetricsGrid latestResume={latestResume} latestJobMatch={latestJobMatch} limits={limits} />
            <HistoricalChart scores={historicalScores} />
        </div>
    );
}
