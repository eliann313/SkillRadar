/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getNotificationsAction, markAsReadAction, markAllAsReadAction } from "./actions";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("Notifications Actions", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe("getNotificationsAction", () => {
        it("debe retornar error si no hay sesión activa", async () => {
            vi.mocked(auth).mockResolvedValue(null as any);

            const result = await getNotificationsAction();

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("No autorizado");
            }
        });

        it("debe retornar las notificaciones del usuario de forma paginada", async () => {
            const mockSession = {
                user: { id: "user-123" },
            };
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            const mockNotifications = [{ id: "notif-1", userId: "user-123", read: false, text: "Nueva postulación" }];

            const spyFindMany = vi.spyOn(db.notification, "findMany").mockResolvedValue(mockNotifications as any);
            const spyCountUnread = vi.spyOn(db.notification, "count").mockResolvedValue(1 as any);

            const result = await getNotificationsAction(1, 10);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.notifications).toHaveLength(1);
                expect(result.data.unreadCount).toBe(1);
            }

            expect(spyFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: "user-123" },
                    skip: 0,
                    take: 10,
                }),
            );
            expect(spyCountUnread).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: "user-123", read: false },
                }),
            );
        });
    });

    describe("markAsReadAction", () => {
        it("debe retornar error si la notificación no existe", async () => {
            const mockSession = {
                user: { id: "user-123" },
            };
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            vi.spyOn(db.notification, "findUnique").mockResolvedValue(null);

            const result = await markAsReadAction("non-existent");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("Notificación no encontrada");
            }
        });

        it("debe retornar error de acceso si la notificación pertenece a otro usuario", async () => {
            const mockSession = {
                user: { id: "user-123" },
            };
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            const mockNotification = {
                id: "notif-1",
                userId: "user-other", // Diferente de user-123
                read: false,
            };
            vi.spyOn(db.notification, "findUnique").mockResolvedValue(mockNotification as any);

            const result = await markAsReadAction("notif-1");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("Acceso denegado");
            }
        });

        it("debe marcar como leída la notificación si pertenece al usuario activo", async () => {
            const mockSession = {
                user: { id: "user-123" },
            };
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            const mockNotification = {
                id: "notif-1",
                userId: "user-123",
                read: false,
            };
            vi.spyOn(db.notification, "findUnique").mockResolvedValue(mockNotification as any);
            const spyUpdate = vi
                .spyOn(db.notification, "update")
                .mockResolvedValue({ ...mockNotification, read: true } as any);

            const result = await markAsReadAction("notif-1");

            expect(result.success).toBe(true);
            expect(spyUpdate).toHaveBeenCalledWith({
                where: { id: "notif-1" },
                data: { read: true },
            });
        });
    });

    describe("markAllAsReadAction", () => {
        it("debe marcar todas las notificaciones del usuario como leídas", async () => {
            const mockSession = {
                user: { id: "user-123" },
            };
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            const spyUpdateMany = vi.spyOn(db.notification, "updateMany").mockResolvedValue({ count: 5 } as any);

            const result = await markAllAsReadAction();

            expect(result.success).toBe(true);
            expect(spyUpdateMany).toHaveBeenCalledWith({
                where: { userId: "user-123", read: false },
                data: { read: true },
            });
        });
    });
});
