import { JobMatchRepository } from "./repository";
import { db } from "@/lib/db";
import type { JobMatchAnalysis } from "./types";

export class JobMatchService {
    /**
     * Crea un registro de Job Match vinculándolo a un CV y ejecuta el análisis simulado de matching.
     * En la tarjeta 3.2 integraremos la inferencia estructurada de Gemini/Groq.
     */
    static async createJobMatch(params: { userId: string; resumeId: string; jobOfferText: string }) {
        // 1. Verificar que el resume pertenezca al usuario
        const resume = await db.resume.findUnique({
            where: { id: params.resumeId, userId: params.userId },
        });

        if (!resume) {
            throw new Error("El CV seleccionado no existe o no te pertenece.");
        }

        // 2. Crear registro inicial en la base de datos
        const jobMatch = await JobMatchRepository.create({
            userId: params.userId,
            resumeId: params.resumeId,
            jobOfferText: params.jobOfferText,
        });

        try {
            // 3. Ejecutar análisis simulado de matching (Será reemplazado en la Tarjeta 3.2 por IA real)
            const simulatedAnalysis: JobMatchAnalysis = {
                requiredSkills: ["React", "TypeScript", "Node.js", "Docker"],
                missingSkills: ["Docker"],
                seniority: "mid",
                recommendations: [
                    "Enriquece tu experiencia laboral agregando proyectos donde hayas implementado contenedores Docker.",
                    "Destaca más habilidades de Backend como bases de datos relacionales en tu descripción principal.",
                ],
            };
            const simulatedScore = 75;

            // 4. Actualizar registro en base de datos con los resultados del análisis
            const updated = await JobMatchRepository.updateAnalysis(
                jobMatch.id,
                params.userId,
                simulatedScore,
                simulatedAnalysis,
            );

            return updated;
        } catch (error) {
            console.error("[JobMatchService] Error durante la fase de análisis de matching:", error);
            return jobMatch;
        }
    }

    static async getJobMatchDetails(id: string, userId: string) {
        return await JobMatchRepository.findById(id, userId);
    }

    static async getJobMatchesHistory(userId: string) {
        return await JobMatchRepository.listByUserId(userId);
    }

    static async deleteJobMatch(id: string, userId: string) {
        return await JobMatchRepository.delete(id, userId);
    }
}
