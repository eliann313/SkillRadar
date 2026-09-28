import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecruiterService } from "./recruiter.service";
import { db } from "@/infrastructure/db";

describe("RecruiterService — funciones puras (simulación offline)", () => {
    describe("sanitize (wrapper del kernel)", () => {
        it("escapa XSS básico", () => {
            expect(RecruiterService.sanitize("<img src=x onerror=alert(1)>")).toBe(
                "&lt;img src=x onerror=alert(1)&gt;",
            );
        });

        it("retorna vacío con input vacío", () => {
            expect(RecruiterService.sanitize("")).toBe("");
        });
    });

    describe("generateSimulatedPoolMatch", () => {
        const resume = "Senior React Developer con TypeScript, Node y PostgreSQL. 6 años de experiencia.";
        const jd = "Buscamos Senior React con TypeScript y Node para equipo de producto.";

        it("calcula score por intersección de tecnologías", () => {
            const match = RecruiterService.generateSimulatedPoolMatch(resume, jd);
            expect(match.matchScore).toBeGreaterThan(0);
            expect(match.matchScore).toBeLessThanOrEqual(98);
            expect(match.justification).toContain("Match estimado");
            expect(match.justification.toLowerCase()).toContain("react");
        });

        it("detecta seniority desde el texto del CV", () => {
            expect(RecruiterService.generateSimulatedPoolMatch(resume, jd).seniority).toBe("senior");
            expect(
                RecruiterService.generateSimulatedPoolMatch("Junior dev con git", "Se busca junior con git").seniority,
            ).toBe("junior");
            expect(RecruiterService.generateSimulatedPoolMatch("Lead architect", "Lead con aws").seniority).toBe(
                "lead",
            );
        });

        it("clampa el score entre 15 y 98 sin tecnologías en común", () => {
            const match = RecruiterService.generateSimulatedPoolMatch("Panadero artesanal", "Se busca rust");
            expect(match.matchScore).toBeGreaterThanOrEqual(15);
            expect(match.matchScore).toBeLessThanOrEqual(98);
        });

        it("reporta tecnologías faltantes como exploración técnica", () => {
            const match = RecruiterService.generateSimulatedPoolMatch("Dev React", "Se busca react y kubernetes");
            expect(match.technicalObservations?.some((o) => o.category === "technical_exploration")).toBe(true);
        });

        it("marca CV conciso como punto de verificación", () => {
            const match = RecruiterService.generateSimulatedPoolMatch("Dev React", "Se busca react");
            expect(match.technicalObservations?.some((o) => o.category === "verification_point")).toBe(true);
        });
    });

    describe("generateSimulatedSearchMatch", () => {
        it("bonifica si el ATS base supera el umbral del query", () => {
            const base = RecruiterService.generateSimulatedSearchMatch("Dev react senior", "react", 80);
            const boosted = RecruiterService.generateSimulatedSearchMatch(
                "Dev react senior",
                "react con score mayor a 70",
                80,
            );
            expect(boosted.matchScore).toBeGreaterThanOrEqual(base.matchScore);
        });

        it("penaliza si el ATS base no llega al umbral", () => {
            const penalized = RecruiterService.generateSimulatedSearchMatch(
                "Dev react senior",
                "react con score mayor a 90",
                40,
            );
            expect(penalized.matchScore).toBeLessThan(100);
        });

        it("penaliza mismatch de seniority pedida vs detectada", () => {
            const ok = RecruiterService.generateSimulatedSearchMatch("Dev react junior", "react junior", 80);
            const mismatch = RecruiterService.generateSimulatedSearchMatch("Dev react junior", "react senior", 80);
            expect(mismatch.matchScore).toBeLessThanOrEqual(ok.matchScore);
        });
    });
});

describe("RecruiterService — shortlist, contacto y market intelligence (DB mockeada)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("createContactRequest", () => {
        it("sanitiza el mensaje y crea la solicitud pendiente", async () => {
            vi.spyOn(db.user, "findUnique").mockResolvedValue({ id: "dev-1", role: "developer" } as never);
            vi.spyOn(db.contactRequest, "findFirst").mockResolvedValue(null);
            const createSpy = vi.spyOn(db.contactRequest, "create").mockResolvedValue({ id: "cr-1" } as never);

            await RecruiterService.createContactRequest({
                recruiterId: "rec-1",
                developerId: "dev-1",
                message: "<script>x</script> Hola, me interesa tu perfil",
            });

            expect(createSpy).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    recruiterId: "rec-1",
                    developerId: "dev-1",
                    status: "pending",
                }),
            });
            const saved = createSpy.mock.calls[0][0].data.message as string;
            expect(saved).not.toContain("<script>");
            expect(saved).toContain("Hola, me interesa tu perfil");
        });

        it("rechaza destinatario inexistente o no-developer", async () => {
            vi.spyOn(db.user, "findUnique").mockResolvedValue(null);

            await expect(
                RecruiterService.createContactRequest({ recruiterId: "rec-1", developerId: "x", message: "hola" }),
            ).rejects.toThrow("Candidato inválido");

            vi.mocked(db.user.findUnique).mockResolvedValue({ id: "x", role: "recruiter" } as never);
            await expect(
                RecruiterService.createContactRequest({ recruiterId: "rec-1", developerId: "x", message: "hola" }),
            ).rejects.toThrow("Candidato inválido");
        });

        it("rechaza solicitudes duplicadas", async () => {
            vi.spyOn(db.user, "findUnique").mockResolvedValue({ id: "dev-1", role: "developer" } as never);
            vi.spyOn(db.contactRequest, "findFirst").mockResolvedValue({ id: "cr-1" } as never);

            await expect(
                RecruiterService.createContactRequest({ recruiterId: "rec-1", developerId: "dev-1", message: "h" }),
            ).rejects.toThrow("Ya has enviado");
        });
    });

    describe("toggleShortlist / getShortlistedCandidates", () => {
        it("agrega cuando no existe y remueve cuando existe", async () => {
            vi.spyOn(db.shortlist, "findUnique").mockResolvedValue(null);
            const createSpy = vi.spyOn(db.shortlist, "create").mockResolvedValue({} as never);
            const deleteSpy = vi.spyOn(db.shortlist, "delete").mockResolvedValue({} as never);

            await expect(
                RecruiterService.toggleShortlist({ recruiterId: "rec-1", developerId: "dev-1" }),
            ).resolves.toBe(true);
            expect(createSpy).toHaveBeenCalled();
            expect(deleteSpy).not.toHaveBeenCalled();

            vi.mocked(db.shortlist.findUnique).mockResolvedValue({ id: "s-1" } as never);
            await expect(
                RecruiterService.toggleShortlist({ recruiterId: "rec-1", developerId: "dev-1" }),
            ).resolves.toBe(false);
            expect(deleteSpy).toHaveBeenCalled();
        });

        it("lista los IDs guardados", async () => {
            vi.spyOn(db.shortlist, "findMany").mockResolvedValue([
                { developerId: "dev-1" },
                { developerId: "dev-2" },
            ] as never);

            await expect(RecruiterService.getShortlistedCandidates({ recruiterId: "rec-1" })).resolves.toEqual([
                "dev-1",
                "dev-2",
            ]);
        });
    });

    describe("getMarketIntelligenceData", () => {
        it("agrega oferta y demanda por skill con fallback mid", async () => {
            vi.spyOn(db.resume, "findMany").mockResolvedValue([
                { analysis: JSON.stringify({ keywords: ["react", "node"], estimatedSeniority: "senior" }) },
                { analysis: JSON.stringify({ keywords: ["react"] }) },
                { analysis: null },
                { analysis: "{corrupto" },
            ] as never);
            vi.spyOn(db.jobPosting, "findMany").mockResolvedValue([
                { requiredSkills: ["React", "Kubernetes"] },
            ] as never);

            const data = await RecruiterService.getMarketIntelligenceData();

            const react = (data.skillsData as { name: string; supply: number }[]).find((s) => s.name === "React");
            expect(react?.supply).toBe(2);
            const byName = Object.fromEntries(
                (data.seniorityData as { name: string; value: number }[]).map((s) => [s.name, s.value]),
            );
            expect(byName.SENIOR).toBe(1);
            expect(byName.MID).toBe(1);
        });
    });
});
