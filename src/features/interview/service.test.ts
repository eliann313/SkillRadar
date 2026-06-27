import { describe, it, expect, vi, beforeEach } from "vitest";
import { InterviewService } from "./service";
import { db } from "@/lib/db";
import { InterviewRepository } from "./repository";

describe("InterviewService", () => {
    const userId = "test-user-id";
    const sessionId = "session-123";

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("debe iniciar una sesión de entrevista asociando el último CV", async () => {
        const mockResume = { id: "resume-123", userId, createdAt: new Date() };
        const mockJobMatch = { id: "match-123", userId, createdAt: new Date() };
        const mockSession = { id: sessionId, userId, resumeId: "resume-123", jobMatchId: "match-123", messages: [] };

        const spyResume = vi
            .spyOn(db.resume, "findFirst")
            .mockResolvedValue(mockResume as unknown as Awaited<ReturnType<typeof db.resume.findFirst>>);
        const spyMatch = vi
            .spyOn(db.jobMatch, "findFirst")
            .mockResolvedValue(mockJobMatch as unknown as Awaited<ReturnType<typeof db.jobMatch.findFirst>>);
        const spyCreate = vi
            .spyOn(InterviewRepository, "create")
            .mockResolvedValue(mockSession as unknown as Awaited<ReturnType<typeof InterviewRepository.create>>);

        const result = await InterviewService.startSession(userId);

        expect(spyResume).toHaveBeenCalled();
        expect(spyMatch).toHaveBeenCalled();
        expect(spyCreate).toHaveBeenCalledWith(userId, "resume-123", "match-123");
        expect(result).toBeDefined();
        expect(result.id).toBe(sessionId);
    });

    it("debe completar la entrevista y generar el debrief con fallback simulado", async () => {
        const mockSession = {
            id: sessionId,
            userId,
            messages: [
                { role: "assistant", content: "Pregunta 1" },
                { role: "user", content: "Respuesta 1 del desarrollador sobre React y patrones de diseño." },
            ],
        };

        const spyFind = vi
            .spyOn(InterviewRepository, "findById")
            .mockResolvedValue(mockSession as unknown as Awaited<ReturnType<typeof InterviewRepository.findById>>);
        vi.spyOn(db.user, "findUnique").mockResolvedValue(null);
        const spySave = vi
            .spyOn(InterviewRepository, "saveDebrief")
            .mockResolvedValue({} as unknown as Awaited<ReturnType<typeof InterviewRepository.saveDebrief>>);

        const debrief = await InterviewService.finishAndDebrief(sessionId, userId);

        expect(spyFind).toHaveBeenCalledWith(sessionId, userId);
        expect(spySave).toHaveBeenCalled();
        expect(debrief).toBeDefined();
        expect(debrief.score).toBeGreaterThanOrEqual(50);
        expect(debrief.strengths.length).toBeGreaterThan(0);
    });
});
