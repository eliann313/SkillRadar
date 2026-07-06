/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    applyToJobPostingAction,
    updateApplicationStatusAction,
    createReportAction,
    extendJobPostingExpirationAction,
} from "./actions";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mockear modulos externos de Next.js y auth
vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/headers", () => ({
    headers: vi.fn().mockReturnValue(new Map()),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("Módulo 20 — Tests de Seguridad & Hardening (Job Board)", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // Evitar que Prisma intente conectarse a Neon real durante los tests
        vi.spyOn(db.user, "findUnique").mockResolvedValue({
            id: "some-user-id",
            geminiApiKey: null,
            groqApiKey: null,
            openrouterApiKey: null,
            openaiApiKey: null,
            anthropicApiKey: null,
        } as any);

        // Blindo el test por problemas de caché de tipos de Vitest sobre Prisma
        if (!(db as any).contentReport) {
            (db as any).contentReport = {
                findUnique: () => {},
                create: () => {},
                count: () => {},
            };
        }
    });

    describe("Tarjeta 20.1 — Auditoría IDOR", () => {
        it("debe denegar el acceso a un reclutador A que intente cambiar el estado de una postulación de una oferta del reclutador B", async () => {
            // Configurar sesión de Reclutador A
            const mockSession = {
                user: {
                    id: "recruiter-a-id",
                    role: "recruiter",
                },
            };
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            // Simular postulación y oferta del Reclutador B
            const mockApplication = {
                id: "application-123",
                jobPostingId: "job-b-id",
                jobPosting: {
                    id: "job-b-id",
                    recruiterId: "recruiter-b-id", // Pertenece a B, no a A
                },
            };

            // Mockear la query a base de datos
            vi.spyOn(db.jobPostingApplication, "findUnique").mockResolvedValue(mockApplication as any);

            // Intentar mutar
            const result = await updateApplicationStatusAction("application-123", "shortlisted");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("No eres el propietario");
            }
        });

        it("debe denegar el acceso a un desarrollador que intente aplicar a una oferta que no existe o no está publicada", async () => {
            const mockSession = {
                user: {
                    id: "dev-id",
                    role: "developer",
                },
            };
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            // Oferta en estado borrador (draft)
            const mockDraftJob = {
                id: "job-draft",
                status: "draft",
            };

            vi.spyOn(db.jobPosting, "findUnique").mockResolvedValue(mockDraftJob as any);
            vi.spyOn(db.jobPostingApplication, "findUnique").mockResolvedValue(null);

            const result = await applyToJobPostingAction("job-draft");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("No puedes postularte a esta oferta");
            }
        });

        it("debe permitir a un reclutador modificar el estado de una postulación si es el dueño de la oferta asociada", async () => {
            // Configurar sesión de Reclutador A
            const mockSession = {
                user: {
                    id: "recruiter-a-id",
                    role: "recruiter",
                },
            };
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            const mockApplication = {
                id: "application-123",
                jobPostingId: "job-a-id",
                developerId: "dev-123",
                jobPosting: {
                    id: "job-a-id",
                    recruiterId: "recruiter-a-id", // Es el dueño
                    title: "Puesto de Prueba",
                    company: "Empresa de Prueba",
                },
            };

            const mockUpdatedApplication = {
                ...mockApplication,
                status: "shortlisted",
                developer: {
                    name: "John Doe",
                },
            };

            // Mockear Prisma
            vi.spyOn(db.jobPostingApplication, "findUnique").mockResolvedValue(mockApplication as any);
            vi.spyOn(db.jobPostingApplication, "update").mockResolvedValue(mockUpdatedApplication as any);
            vi.spyOn(db.notification, "create").mockResolvedValue({} as any);

            const result = await updateApplicationStatusAction("application-123", "shortlisted");

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.status).toBe("shortlisted");
            }
        });
    });

    describe("Tarjeta 20.3 — Moderación por Reportes", () => {
        it("debe permitir a un usuario autenticado reportar una oferta y acumular reportes", async () => {
            const mockSession = {
                user: {
                    id: "user-reporter-id",
                    role: "developer",
                },
            };
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            const mockReport = {
                id: "report-123",
                reporterId: "user-reporter-id",
                targetType: "job_posting",
                targetId: "job-123",
                reason: "Contenido spam",
            };

            vi.spyOn(db.contentReport, "findUnique").mockResolvedValue(null);
            vi.spyOn(db.contentReport, "create").mockResolvedValue(mockReport as any);

            // Supongamos que ya tiene 2 reportes (éste será el 3ero)
            vi.spyOn(db.contentReport, "count").mockResolvedValue(3);
            const spyUpdateJob = vi.spyOn(db.jobPosting, "update").mockResolvedValue({} as any);

            const result = await createReportAction({
                targetType: "job_posting",
                targetId: "job-123",
                reason: "Contenido spam",
            });

            expect(result.success).toBe(true);
            expect(spyUpdateJob).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: "job-123" },
                    data: { status: "under_review" },
                }),
            );
        });
    });

    describe("Tarjeta 20.4 — Expiración de Ofertas", () => {
        it("debe permitir extender la fecha de expiración si el usuario es el dueño de la oferta", async () => {
            const mockSession = {
                user: {
                    id: "recruiter-id",
                    role: "recruiter",
                },
            };
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            const mockJob = {
                id: "job-123",
                recruiterId: "recruiter-id",
                status: "published",
                expiresAt: new Date(),
            };

            vi.spyOn(db.jobPosting, "findUnique").mockResolvedValue(mockJob as any);
            const spyUpdate = vi.spyOn(db.jobPosting, "update").mockResolvedValue({
                ...mockJob,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            } as any);

            const result = await extendJobPostingExpirationAction("job-123");

            expect(result.success).toBe(true);
            expect(spyUpdate).toHaveBeenCalled();
        });

        it("debe impedir la extensión de expiración de una oferta de otro reclutador", async () => {
            const mockSession = {
                user: {
                    id: "recruiter-a-id",
                    role: "recruiter",
                },
            };
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            const mockJob = {
                id: "job-123",
                recruiterId: "recruiter-b-id", // Dueño B
                status: "published",
            };

            vi.spyOn(db.jobPosting, "findUnique").mockResolvedValue(mockJob as any);

            const result = await extendJobPostingExpirationAction("job-123");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("No eres el propietario");
            }
        });
    });
});
