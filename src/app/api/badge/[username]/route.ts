import { db } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    // 1. Cargar datos del usuario
    const user = await db.user.findUnique({
        where: { publicUsername: username },
        include: {
            resumes: {
                where: { atsScore: { not: null } },
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    // 2. Retornar 404 si el perfil no existe o es privado
    if (!user || !user.isPublicProfile) {
        return new Response("Not Found", { status: 404 });
    }

    const latestResume = user.resumes[0] || null;

    // Extraer datos
    let seniority = "Developer";
    let skills: string[] = ["React", "TypeScript", "Node.js"]; // Default fallback

    if (latestResume) {
        const analysis = latestResume.analysis as { estimatedSeniority?: string; keywords?: string[] } | null;
        if (analysis?.estimatedSeniority) {
            seniority = analysis.estimatedSeniority.charAt(0).toUpperCase() + analysis.estimatedSeniority.slice(1);
            if (seniority === "Semi-senior") seniority = "Mid-level";
            seniority = `${seniority} Developer`;
        }
        if (Array.isArray(analysis?.keywords) && analysis.keywords.length > 0) {
            // Capitalizar skills y filtrar únicos
            skills = Array.from(
                new Set(
                    analysis.keywords.map((s: string) => {
                        if (s.toLowerCase() === "typescript") return "TypeScript";
                        if (s.toLowerCase() === "javascript") return "JavaScript";
                        if (s.toLowerCase() === "nextjs" || s.toLowerCase() === "next.js") return "Next.js";
                        if (s.toLowerCase() === "nodejs" || s.toLowerCase() === "node.js") return "Node.js";
                        if (s.toLowerCase() === "react") return "React";
                        if (s.toLowerCase() === "vue") return "Vue";
                        if (s.toLowerCase() === "docker") return "Docker";
                        if (s.toLowerCase() === "aws") return "AWS";
                        return s.charAt(0).toUpperCase() + s.slice(1);
                    }),
                ),
            ).slice(0, 3) as string[];
        }
    }

    const displayName = user.name || username;

    // 3. Calcular dimensiones de píldoras dinámicamente para evitar solapamientos
    const pill1Width = Math.max(65, skills[0].length * 8 + 22);
    const pill2Width = skills[1] ? Math.max(65, skills[1].length * 8 + 22) : 0;
    const pill3Width = skills[2] ? Math.max(65, skills[2].length * 8 + 22) : 0;

    const pill1X = 30;
    const pill2X = pill1X + pill1Width + 12;
    const pill3X = pill2X + pill2Width + 12;

    // 4. Generar el SVG en crudo con template literals
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="540" height="180" viewBox="0 0 540 180" fill="none">
        <style>
            .title { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 20px; fill: #ffffff; }
            .subtitle { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 500; font-size: 13px; fill: #94a3b8; letter-spacing: 0.5px; }
            .label { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 9px; fill: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .pill-text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; font-size: 11px; fill: #818cf8; }
            .branding { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 11px; fill: #818cf8; letter-spacing: 0.5px; }
        </style>

        <!-- Fondo de tarjeta oscura premium con borde sutil -->
        <rect width="540" height="180" rx="14" fill="#0b0f19" stroke="#1e293b" stroke-width="1.5" />
        
        <!-- Efecto glow del logo en la esquina -->
        <circle cx="500" cy="40" r="100" fill="#4f46e5" opacity="0.15" filter="blur(35px)" />
        <circle cx="40" cy="140" r="80" fill="#6366f1" opacity="0.1" filter="blur(30px)" />

        <!-- Branding Logo (Esquina Superior Derecha) -->
        <g transform="translate(415, 20)">
            <rect width="95" height="26" rx="6" fill="#111827" stroke="#1f2937" stroke-width="1" />
            <circle cx="15" cy="13" r="4" fill="#6366f1" />
            <text x="25" y="17" class="branding">SkillRadar</text>
        </g>

        <!-- Información del Desarrollador -->
        <text x="30" y="52" class="title">${displayName}</text>
        <text x="30" y="74" class="subtitle">${seniority}</text>

        <!-- Sección de Habilidades -->
        <text x="30" y="112" class="label">Top Skills</text>
        
        <!-- Píldoras de Skills Dinámicas -->
        <g transform="translate(0, 122)">
            <!-- Skill 1 -->
            <rect x="${pill1X}" width="${pill1Width}" height="24" rx="12" fill="#1e1b4b" stroke="#312e81" stroke-width="1" />
            <text x="${pill1X + pill1Width / 2}" y="15" text-anchor="middle" class="pill-text">${skills[0]}</text>
            
            ${
                skills[1]
                    ? `
            <!-- Skill 2 -->
            <rect x="${pill2X}" width="${pill2Width}" height="24" rx="12" fill="#1e1b4b" stroke="#312e81" stroke-width="1" />
            <text x="${pill2X + pill2Width / 2}" y="15" text-anchor="middle" class="pill-text">${skills[1]}</text>
            `
                    : ""
            }

            ${
                skills[2]
                    ? `
            <!-- Skill 3 -->
            <rect x="${pill3X}" width="${pill3Width}" height="24" rx="12" fill="#1e1b4b" stroke="#312e81" stroke-width="1" />
            <text x="${pill3X + pill3Width / 2}" y="15" text-anchor="middle" class="pill-text">${skills[2]}</text>
            `
                    : ""
            }
        </g>
    </svg>
    `.trim();

    // 5. Retornar con el tipo de contenido e instrucciones de cacheo correctas
    return new Response(svg, {
        headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600",
        },
    });
}
