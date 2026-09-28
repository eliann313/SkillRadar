/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createNotification } from "./notifications";
import { db } from "@/infrastructure/db";

vi.mock("@/infrastructure/mail", () => ({
    sendEmail: vi.fn(),
}));

const baseUser = {
    email: "dev@mail.com",
    emailNotifications: true,
    emailNewApplication: false,
    emailApplicationStatusChanged: false,
    emailContactUpdates: false,
    emailJobMatches: false,
};

describe("lib/notifications — createNotification", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(db.notification, "create").mockResolvedValue({ id: "n-1" } as never);
        vi.spyOn(db.user, "findUnique").mockResolvedValue({ ...baseUser } as never);
    });

    it("persiste la notificación con metadata y JsonNull por defecto", async () => {
        const { sendEmail } = await import("@/infrastructure/mail");

        const notif = await createNotification({
            userId: "user-1",
            type: "talent_alert",
            title: "Alerta",
            message: "Hay talento",
            link: "/dashboard",
        });

        expect(db.notification.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ userId: "user-1", type: "talent_alert" }),
        });
        expect(notif).toMatchObject({ id: "n-1" });
        // talent_alert no tiene flag de email → no envía
        expect(sendEmail).not.toHaveBeenCalled();
    });

    it("envía email cuando el tipo y la preferencia coinciden", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue({
            ...baseUser,
            emailNewApplication: true,
        } as any);
        const { sendEmail } = await import("@/infrastructure/mail");

        await createNotification({
            userId: "user-1",
            type: "new_application",
            title: "Nueva postulación",
            message: "<b>Hola</b>",
            link: "/dashboard/recruiter/postings/1/applications",
        });

        expect(sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({ to: "dev@mail.com", subject: "Nueva postulación" }),
        );
        const html = vi.mocked(sendEmail).mock.calls[0][0].html as string;
        // El mensaje se escapa (XSS) dentro del HTML
        expect(html).toContain("&lt;b&gt;Hola&lt;/b&gt;");
    });

    it("reemplaza links inseguros por /dashboard en el email", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue({ ...baseUser, emailJobMatches: true } as any);
        const { sendEmail } = await import("@/infrastructure/mail");

        await createNotification({
            userId: "user-1",
            type: "new_job_match",
            title: "Match",
            message: "Match 90%",
            link: "https://evil.com/phish",
        });

        const html = vi.mocked(sendEmail).mock.calls[0][0].html as string;
        expect(html).not.toContain("https://evil.com");
        expect(html).toContain("/dashboard");
    });

    it("no envía email si el usuario desactivó las notificaciones", async () => {
        vi.mocked(db.user.findUnique).mockResolvedValue({ ...baseUser, emailNotifications: false } as any);
        const { sendEmail } = await import("@/infrastructure/mail");

        await createNotification({
            userId: "user-1",
            type: "new_application",
            title: "T",
            message: "M",
            link: "/dashboard",
        });

        expect(sendEmail).not.toHaveBeenCalled();
    });

    it("re-lanza el error si falla la persistencia", async () => {
        vi.mocked(db.notification.create).mockRejectedValue(new Error("db caída"));

        await expect(
            createNotification({
                userId: "user-1",
                type: "talent_alert",
                title: "T",
                message: "M",
                link: "/dashboard",
            }),
        ).rejects.toThrow("db caída");
    });
});
