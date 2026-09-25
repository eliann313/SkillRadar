import type { CVAnalysis, JobMatch } from "@/lib/types";

/**
 * Datos 100% ficticios para la demo pública (/demo) y la landing.
 * No tocan DB, no llaman a IA, no requieren sesión.
 */
export const demoCvAnalysis: CVAnalysis = {
    id: "demo-cv",
    userId: "demo",
    atsScore: 78,
    technicalScore: 71,
    credibilityScore: 84,
    technicalExplanation:
        "Perfil sólido en React, TypeScript y Node.js con evidencia en 3 proyectos. Falta profundidad en testing y CI/CD para el tramo senior.",
    credibilityExplanation:
        "Stack coherente con la trayectoria declarada. Sin señales de keyword stuffing: cada tecnología aparece en contexto de proyecto.",
    detectedKeywords: ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "Git"],
    missingKeywords: ["CI/CD", "Docker", "Testing"],
    estimatedSeniority: "mid",
    suggestions: [
        "Cuantifica impacto con métricas (usuarios, latencia, conversión) usando metodología STAR.",
        "Agrega un proyecto con pipeline CI/CD (GitHub Actions) y deploy automático.",
        "Incluye sección de testing (Jest/Vitest) con cobertura en un repo público.",
    ],
    createdAt: new Date("2026-08-10T12:00:00Z"),
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
    isSimulated: true,
    explainability: {
        justification:
            "78 = contacto 11 + secciones 18 + legibilidad 20 + contexto 18 + cuantificación 11. Base sólida de mid con techo en métricas y DevOps.",
        evidenceFound: ["React", "TypeScript", "Next.js"],
        missingEvidence: ["CI/CD", "Docker", "Testing"],
    },
};

export const demoJobMatch: JobMatch = {
    id: "demo-match",
    userId: "demo",
    jobTitle: "Frontend Senior — React/Next.js",
    company: "Demo Corp",
    matchScore: 76,
    alignedSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Git"],
    missingSkills: ["CI/CD", "Testing", "Docker"],
    createdAt: new Date("2026-08-12T12:00:00Z"),
    recommendations: [
        "Destaca tu experiencia con Server Components en el CV.",
        "Agrega testing con Vitest a tu repo principal antes de postularte.",
    ],
    explainability: {
        justification:
            "Fuerte alineación en el core frontend (5/8 skills con evidencia en proyectos). Brechas concentradas en DevOps y testing.",
        evidenceFound: ["React", "TypeScript", "Next.js"],
        missingEvidence: ["CI/CD", "Testing", "Docker"],
    },
    actionPlan: [
        {
            skill: "CI/CD",
            steps: ["Lee la doc de GitHub Actions", "Agrega un workflow de test+lint", "Conecta deploy automático"],
        },
        { skill: "Testing", steps: ["Instala Vitest", "Cubre utils críticos", "Agrega badge de cobertura al README"] },
    ],
};

export const demoGithubLanguages: Record<string, number> = {
    TypeScript: 420000,
    JavaScript: 180000,
    CSS: 60000,
    Python: 40000,
    Dockerfile: 8000,
};

export const demoGithubSignals = {
    strengths: [
        "Señal: READMEs con instrucciones de instalación en 4 repos.",
        "Señal: TypeScript como lenguaje principal con tipado estricto.",
        "Señal: Actividad sostenida en los últimos 6 meses.",
    ],
    weaknesses: [
        "Señal: sin workflows de CI/CD visibles en descripciones.",
        "Señal: pocos tests detectables por nombre de archivo.",
    ],
    suggestions: [
        "Agrega badges de CI y cobertura a tus READMEs.",
        "Publica un template con Dockerfile + compose para tus APIs.",
    ],
};
