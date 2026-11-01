import { auth } from "@/infrastructure/auth";
import { isGuestSession } from "@/infrastructure/guest-guard";
import { safeParseJson } from "@/shared-kernel/pii";
import {
    DashboardHeader,
    MetricsGrid,
    NextAction,
    HistoricalChart,
    ContactRequestsList,
    PrivacyCard,
} from "@/components/dashboard";
import { TalentDashboard } from "@/components/recruiter/talent-dashboard";
import { GuestRecruiterPreview } from "@/features/recruiter/presentation/guest-recruiter-preview";
import { RecruiterVerificationGate } from "@/features/recruiter/presentation/recruiter-verification-gate";
import { redirect } from "next/navigation";
import { db } from "@/infrastructure/db";
import { getTranslations, getLocale } from "next-intl/server";
import { getUserQuotaUsage } from "@/infrastructure/rate-limit";

export default async function DashboardPage() {
    const locale = await getLocale();
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    // Recruiter dashboard
    if (session.user.role === "recruiter") {
        // Modo Guest: igual que el dev demo — solo lectura con mocks, sin
        // verificación, sin DB, sin interacción real (ver guest-guard).
        if (isGuestSession(session)) {
            return <GuestRecruiterPreview />;
        }

        const recruiter = await db.user.findUnique({
            where: { id: session.user.id },
            select: { recruiterVerified: true, verificationRequestedAt: true },
        });
        if (!recruiter?.recruiterVerified) {
            return <RecruiterVerificationGate requested={!!recruiter?.verificationRequestedAt} />;
        }

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
                    parsedAnalysis = safeParseJson<{
                        keywords?: string[];
                        estimatedSeniority?: "junior" | "mid" | "senior" | "lead";
                    }>(resume.analysis, null);
                }

                // Filtrar proactivamente keywords para que sólo se muestren las presentes en el texto del CV
                const rawText = resume.rawText || "";
                const filteredSkills = (parsedAnalysis?.keywords || []).filter((kw) =>
                    rawText.toLowerCase().includes(kw.toLowerCase()),
                );

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
                    topSkills: filteredSkills,
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
    const latestResume =
        (await db.resume.findFirst({
            where: { userId, isActive: true },
            select: {
                id: true,
                fileName: true,
                atsScore: true,
                createdAt: true,
            },
        })) ||
        (await db.resume.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                fileName: true,
                atsScore: true,
                createdAt: true,
            },
        }));

    // 2. Obtener el último Job Match
    const latestJobMatchPromise = db.jobMatch.findFirst({
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
    const resumesHistoryPromise = db.resume.findMany({
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

    // Formatear el historial para el gráfico (tras el Promise.all de abajo)
    const formatHistoricalScores = (history: Array<{ createdAt: Date; atsScore: number | null; fileName: string }>) =>
        history.map((r) => ({
            date: new Date(r.createdAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                month: "short",
                day: "numeric",
            }),
            score: r.atsScore || 0,
            name: r.fileName,
        }));

    // 4. Calcular el uso de límites y cuotas reales
    const userKeysPromise = db.user.findUnique({
        where: { id: userId },
        select: {
            geminiApiKey: true,
            groqApiKey: true,
            openrouterApiKey: true,
            openaiApiKey: true,
            anthropicApiKey: true,
        },
    });

    const [latestJobMatch, resumesHistory, userKeys, userQuotas, totalResumes, totalMatches] = await Promise.all([
        latestJobMatchPromise,
        resumesHistoryPromise,
        userKeysPromise,
        getUserQuotaUsage(userId),
        db.resume.count({ where: { userId } }),
        db.jobMatch.count({ where: { userId } }),
    ]);

    const isByok = !!(
        userKeys?.geminiApiKey ||
        userKeys?.groqApiKey ||
        userKeys?.openrouterApiKey ||
        userKeys?.openaiApiKey ||
        userKeys?.anthropicApiKey
    );

    const cvQuota = userQuotas.find((q) => q.key === "cv-analysis");
    const matchQuota = userQuotas.find((q) => q.key === "job-match");
    const chatQuota = userQuotas.find((q) => q.key === "ai-chat");

    const limits = {
        isByok,
        cvAnalysis: {
            remaining: isByok ? 999 : (cvQuota?.remaining ?? 5),
            limit: cvQuota?.limit ?? 5,
        },
        jobMatch: {
            remaining: isByok ? 999 : (matchQuota?.remaining ?? 10),
            limit: matchQuota?.limit ?? 10,
        },
        mockInterview: {
            remaining: isByok ? 999 : (chatQuota?.remaining ?? 20),
            limit: chatQuota?.limit ?? 20,
        },
    };

    // 5. Determinar la acción recomendada dinámicamente
    const t = await getTranslations("Dashboard");

    let nextAction = {
        type: "upload-cv",
        title: t("uploadCvTitle"),
        description: t("uploadCvDesc"),
        ctaText: t("uploadCvCta"),
        ctaLink: "/dashboard/cv-analysis",
    };

    if (totalResumes > 0 && totalMatches === 0) {
        nextAction = {
            type: "job-match",
            title: t("jobMatchTitle"),
            description: t("jobMatchDesc"),
            ctaText: t("jobMatchCta"),
            ctaLink: "/dashboard/job-match",
        };
    } else if (totalResumes > 0 && totalMatches > 0) {
        nextAction = {
            type: "mock-interview",
            title: t("mockInterviewTitle"),
            description: t("mockInterviewDesc"),
            ctaText: t("mockInterviewCta"),
            ctaLink: "/dashboard/interview",
        };
    }

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
            <PrivacyCard pendingCount={contactRequests.length} />
            {contactRequests.length > 0 && <ContactRequestsList requests={contactRequests} />}
            <NextAction {...nextAction} />
            <MetricsGrid latestResume={latestResume} latestJobMatch={latestJobMatch} limits={limits} />
            <HistoricalChart scores={formatHistoricalScores(resumesHistory)} />
        </div>
    );
}
