/**
 * Catálogo de caminos profesionales para el Career Copilot.
 *
 * SkillRadar sirve a cualquier profesión, no solo IT: el usuario elige un
 * camino (o escribe uno libre) y la IA razona sobre ese camino para devolver
 * oportunidades, tecnologías/habilidades, ruta de aprendizaje y proyectos.
 */

export interface CareerPathOption {
    value: string;
    labelEs: string;
    labelEn: string;
    category: "tech" | "data" | "design" | "business" | "science" | "social" | "other";
}

export const CAREER_PATHS: CareerPathOption[] = [
    // Programación / Software
    { value: "programacion", labelEs: "Programación", labelEn: "Programming", category: "tech" },
    {
        value: "ingenieria-software",
        labelEs: "Ingeniería de Software",
        labelEn: "Software Engineering",
        category: "tech",
    },
    {
        value: "arquitectura-software",
        labelEs: "Arquitectura de Software",
        labelEn: "Software Architecture",
        category: "tech",
    },
    { value: "devops-cloud", labelEs: "DevOps / Cloud", labelEn: "DevOps / Cloud", category: "tech" },
    { value: "ciberseguridad", labelEs: "Ciberseguridad", labelEn: "Cybersecurity", category: "tech" },
    { value: "desarrollo-movil", labelEs: "Desarrollo Móvil", labelEn: "Mobile Development", category: "tech" },
    { value: "desarrollo-web", labelEs: "Desarrollo Web", labelEn: "Web Development", category: "tech" },
    // Datos / IA
    { value: "ciencia-datos", labelEs: "Ciencia de Datos", labelEn: "Data Science", category: "data" },
    { value: "machine-learning", labelEs: "Machine Learning / IA", labelEn: "Machine Learning / AI", category: "data" },
    { value: "analisis-datos", labelEs: "Análisis de Datos", labelEn: "Data Analytics", category: "data" },
    { value: "ingenieria-datos", labelEs: "Ingeniería de Datos", labelEn: "Data Engineering", category: "data" },
    // Diseño / Producto
    { value: "diseno-ux-ui", labelEs: "Diseño UX/UI", labelEn: "UX/UI Design", category: "design" },
    { value: "producto", labelEs: "Gestión de Producto", labelEn: "Product Management", category: "design" },
    // Negocios
    { value: "marketing-digital", labelEs: "Marketing Digital", labelEn: "Digital Marketing", category: "business" },
    {
        value: "administracion",
        labelEs: "Administración / Negocios",
        labelEn: "Business Administration",
        category: "business",
    },
    { value: "finanzas", labelEs: "Finanzas", labelEn: "Finance", category: "business" },
    { value: "emprendimiento", labelEs: "Emprendimiento", labelEn: "Entrepreneurship", category: "business" },
    // Ciencias / Social / Otros (no IT)
    { value: "sociologia", labelEs: "Sociología", labelEn: "Sociology", category: "social" },
    { value: "psicologia", labelEs: "Psicología", labelEn: "Psychology", category: "social" },
    { value: "educacion", labelEs: "Educación", labelEn: "Education", category: "social" },
    { value: "derecho", labelEs: "Derecho", labelEn: "Law", category: "social" },
    { value: "medicina-salud", labelEs: "Medicina / Salud", labelEn: "Medicine / Health", category: "science" },
    { value: "ingenieria-civil", labelEs: "Ingeniería Civil", labelEn: "Civil Engineering", category: "science" },
    { value: "otra", labelEs: "Otra (especificar)", labelEn: "Other (specify)", category: "other" },
];

export const MAX_CAREER_PATH_LENGTH = 80;

/** Normaliza el input libre del usuario (trim + tope de longitud). */
export function normalizeCareerPath(input: unknown): string | null {
    if (typeof input !== "string") return null;
    const trimmed = input.trim().replace(/\s+/g, " ").slice(0, MAX_CAREER_PATH_LENGTH);
    if (trimmed.length < 2) return null;
    return trimmed;
}

/** Resuelve la etiqueta a mostrar para un valor del catálogo o un texto libre. */
export function resolveCareerPathLabel(value: string, locale: string): string {
    const found = CAREER_PATHS.find((p) => p.value === value);
    if (found) return locale === "en" ? found.labelEn : found.labelEs;
    return value;
}
