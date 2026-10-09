import type { CVAnalysis, JobMatch, TalentCard } from "@/shared-kernel/types";

/**
 * Datos 100% ficticios para la demo pública (/demo) y la landing.
 * No tocan DB, no llaman a IA, no requieren sesión.
 * Los textos se localizan en el cliente vía next-intl (namespace Home);
 * aquí solo van números, keywords y estructura.
 */
export const demoCvNumbers = {
    atsScore: 78,
    technicalScore: 71,
    credibilityScore: 84,
    detectedKeywords: ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "Git"],
    missingKeywords: ["CI/CD", "Docker", "Testing"],
    atsBreakdown: {
        contacto: 11,
        secciones: 18,
        legibilidad: 20,
        keywordsContexto: 18,
        cuantificacion: 11,
    },
    evidenceQuotes: [
        "4 años construyendo SPAs con React + TypeScript",
        "API REST con Node.js y PostgreSQL en producción",
    ],
};

export function buildDemoCvAnalysis(t: (key: string) => string): CVAnalysis {
    return {
        id: "demo-cv",
        userId: "demo",
        atsScore: demoCvNumbers.atsScore,
        technicalScore: demoCvNumbers.technicalScore,
        credibilityScore: demoCvNumbers.credibilityScore,
        technicalExplanation: t("demoCvTech"),
        credibilityExplanation: t("demoCvCred"),
        detectedKeywords: demoCvNumbers.detectedKeywords,
        missingKeywords: demoCvNumbers.missingKeywords,
        estimatedSeniority: "mid",
        suggestions: [t("demoCvSug1"), t("demoCvSug2"), t("demoCvSug3")],
        createdAt: new Date("2026-08-10T12:00:00Z"),
        atsBreakdown: demoCvNumbers.atsBreakdown,
        evidenceQuotes: demoCvNumbers.evidenceQuotes,
        isSimulated: true,
        explainability: {
            justification: t("demoCvJust"),
            evidenceFound: demoCvNumbers.detectedKeywords.slice(0, 3),
            missingEvidence: demoCvNumbers.missingKeywords.slice(0, 3),
        },
    };
}

export function buildDemoJobMatch(t: (key: string) => string): JobMatch {
    return {
        id: "demo-match",
        userId: "demo",
        jobTitle: "Frontend Senior — React/Next.js",
        company: "Demo Corp",
        matchScore: 76,
        alignedSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Git"],
        missingSkills: ["CI/CD", "Testing", "Docker"],
        createdAt: new Date("2026-08-12T12:00:00Z"),
        recommendations: [t("demoMatchRec1"), t("demoMatchRec2")],
        explainability: {
            justification: t("demoMatchJust"),
            evidenceFound: ["React", "TypeScript", "Next.js"],
            missingEvidence: ["CI/CD", "Testing", "Docker"],
        },
        actionPlan: [
            {
                skill: "CI/CD",
                steps: ["Lee la doc de GitHub Actions", "Agrega un workflow de test+lint", "Conecta deploy automático"],
            },
            {
                skill: "Testing",
                steps: ["Instala Vitest", "Cubre utils críticos", "Agrega badge de cobertura al README"],
            },
        ],
    };
}

export const demoGithubLanguages: Record<string, number> = {
    TypeScript: 420000,
    JavaScript: 180000,
    CSS: 60000,
    Python: 40000,
    Dockerfile: 8000,
};

export function buildDemoGithubSignals(t: (key: string) => string) {
    return {
        strengths: [t("demoGhS1"), t("demoGhS2"), t("demoGhS3")],
        weaknesses: [t("demoGhW1"), t("demoGhW2")],
        suggestions: [t("demoGhSug1"), t("demoGhSug2")],
    };
}

/**
 * Talent Pool 100% ficticio para el guest recruiter (modo demo / solo lectura).
 * Sin PII real, sin DB, sin verificación: igual que el dev demo.
 * Los IDs anonimizados siguen el formato DEV-XXXX del doble ciego.
 */
export const demoTalentPool: TalentCard[] = [
    {
        id: "demo-talent-1",
        anonymousId: "DEV-9B1C27",
        estimatedSeniority: "senior",
        averageScore: 87,
        topSkills: ["React", "TypeScript", "Next.js", "Node.js"],
        languages: ["TypeScript", "JavaScript"],
        lastActive: new Date("2026-09-28T12:00:00Z"),
        name: null,
        email: null,
        githubUsername: null,
        image: null,
        contactStatus: "none",
        justification: "Perfil senior con 6 años en frontend React. Evidencia sólida en TypeScript y Next.js.",
        isShortlisted: false,
    },
    {
        id: "demo-talent-2",
        anonymousId: "DEV-4F2A91",
        estimatedSeniority: "mid",
        averageScore: 76,
        topSkills: ["Node.js", "PostgreSQL", "Docker", "TypeScript"],
        languages: ["TypeScript", "SQL"],
        lastActive: new Date("2026-09-25T12:00:00Z"),
        name: null,
        email: null,
        githubUsername: null,
        image: null,
        contactStatus: "none",
        justification: "Backend mid con experiencia en APIs REST y PostgreSQL en producción.",
        isShortlisted: false,
    },
    {
        id: "demo-talent-3",
        anonymousId: "DEV-77C0E4",
        estimatedSeniority: "junior",
        averageScore: 64,
        topSkills: ["React", "JavaScript", "Tailwind CSS", "Git"],
        languages: ["JavaScript", "CSS"],
        lastActive: new Date("2026-09-20T12:00:00Z"),
        name: null,
        email: null,
        githubUsername: null,
        image: null,
        contactStatus: "none",
        justification: "Perfil junior con fundamentos sólidos en React y ganas de crecer.",
        isShortlisted: false,
    },
];

/**
 * Previews 100% ficticios para que el guest recruiter pueda navegar
 * Ofertas / Seguimiento / Bandeja / Plantillas sin DB ni escrituras.
 * Todo es solo lectura con CTA a crear cuenta (igual que el dev demo,
 * que sí puede entrar a progreso, análisis de CV, etc.).
 */
export interface DemoPosting {
    id: string;
    title: string;
    company: string;
    location: string;
    remoteType: string;
    seniorityLevel: string;
    status: "draft" | "published" | "closed";
    requiredSkills: string[];
    applications: number;
    createdAt: string;
}

export const demoPostings: DemoPosting[] = [
    {
        id: "demo-posting-1",
        title: "Frontend Senior — React/Next.js",
        company: "Demo Corp",
        location: "Remoto · LATAM",
        remoteType: "remote",
        seniorityLevel: "senior",
        status: "published",
        requiredSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        applications: 12,
        createdAt: "2026-09-10T12:00:00Z",
    },
    {
        id: "demo-posting-2",
        title: "Backend Mid — Node.js/PostgreSQL",
        company: "Demo Corp",
        location: "Híbrido · Buenos Aires",
        remoteType: "hybrid",
        seniorityLevel: "mid",
        status: "published",
        requiredSkills: ["Node.js", "PostgreSQL", "Docker"],
        applications: 8,
        createdAt: "2026-09-18T12:00:00Z",
    },
    {
        id: "demo-posting-3",
        title: "Fullstack Jr — Práctica supervisada",
        company: "Demo Corp",
        location: "Remoto",
        remoteType: "remote",
        seniorityLevel: "junior",
        status: "draft",
        requiredSkills: ["React", "Node.js", "Git"],
        applications: 0,
        createdAt: "2026-09-25T12:00:00Z",
    },
];

export interface DemoPipelineItem {
    id: string;
    anonymousId: string;
    postingTitle: string;
    status: string;
    matchScore: number;
}

export const demoPipelineItems: DemoPipelineItem[] = [
    {
        id: "demo-app-1",
        anonymousId: "DEV-9B1C27",
        postingTitle: "Frontend Senior — React/Next.js",
        status: "shortlisted",
        matchScore: 87,
    },
    {
        id: "demo-app-2",
        anonymousId: "DEV-4F2A91",
        postingTitle: "Backend Mid — Node.js/PostgreSQL",
        status: "interview",
        matchScore: 76,
    },
    {
        id: "demo-app-3",
        anonymousId: "DEV-77C0E4",
        postingTitle: "Frontend Senior — React/Next.js",
        status: "reviewed",
        matchScore: 64,
    },
    {
        id: "demo-app-4",
        anonymousId: "DEV-77C0E4",
        postingTitle: "Fullstack Jr — Práctica supervisada",
        status: "submitted",
        matchScore: 61,
    },
];

export const demoPipelineColumns = ["submitted", "reviewed", "shortlisted", "interview", "offer", "hired"];

export interface DemoInboxRequest {
    id: string;
    anonymousId: string;
    message: string;
    status: "pending" | "accepted" | "declined";
    messageCount: number;
    lastMessageAt: string;
}

export const demoInboxRequests: DemoInboxRequest[] = [
    {
        id: "demo-req-1",
        anonymousId: "DEV-9B1C27",
        message: "Hola, nos gustó tu perfil senior en React. ¿Te interesa una charla de 20 min?",
        status: "pending",
        messageCount: 1,
        lastMessageAt: "2026-09-28T12:00:00Z",
    },
    {
        id: "demo-req-2",
        anonymousId: "DEV-4F2A91",
        message: "Vimos tu experiencia backend con PostgreSQL en producción. Te compartimos la propuesta.",
        status: "accepted",
        messageCount: 4,
        lastMessageAt: "2026-09-26T12:00:00Z",
    },
];

export interface DemoTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
}

export const demoTemplates: DemoTemplate[] = [
    {
        id: "demo-tpl-1",
        name: "Primer contacto senior",
        subject: "Oportunidad {{puesto}} en {{empresa}}",
        body: "Hola, vi tu perfil y tu experiencia con React/TypeScript. En {{empresa}} buscamos {{puesto}} remoto LATAM. ¿Te interesa una charla de 20 min esta semana?",
    },
    {
        id: "demo-tpl-2",
        name: "Seguimiento amable",
        subject: "Seguimiento — {{puesto}}",
        body: "Hola de nuevo, retomo contacto por la posición de {{puesto}} en {{empresa}}. Si te interesa, coordinamos una llamada breve.",
    },
];
