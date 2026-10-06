import { describe, it, expect, vi, afterEach } from "vitest";
import { isGuestSession, rejectGuestWrite, GUEST_WRITE_ERROR } from "./guest-guard";

describe("guest-guard", () => {
    it("detecta sesiones guest por flag o por id compartido", () => {
        expect(isGuestSession(null)).toBe(false);
        expect(isGuestSession({ user: { id: "user-1" } })).toBe(false);
        expect(isGuestSession({ user: { id: "guest-recruiter-id", isGuest: true } })).toBe(true);
        expect(isGuestSession({ user: { id: "guest-recruiter-id" } })).toBe(true);
        expect(isGuestSession({ user: { id: "guest-developer-id", isGuest: true } })).toBe(true);
        expect(isGuestSession({ user: { id: "other", isGuest: true } })).toBe(true);
    });

    it("detecta JWT forjado: id compartido sin flag sigue siendo guest", () => {
        expect(isGuestSession({ user: { id: "guest-developer-id", isGuest: false } })).toBe(true);
    });

    it("expone un mensaje de error claro", () => {
        expect(GUEST_WRITE_ERROR.length).toBeGreaterThan(10);
    });

    it("rejectGuestWrite bloquea guests y deja pasar usuarios reales", () => {
        const blocked = rejectGuestWrite({ user: { id: "guest-recruiter-id" } });
        expect(blocked).toEqual({ success: false, error: GUEST_WRITE_ERROR });
        expect(rejectGuestWrite({ user: { id: "user-1" } })).toBeNull();
        expect(rejectGuestWrite(null)).toBeNull();
    });
});

describe("isGuestLoginEnabled", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("habilitado por defecto; solo 'false' lo desactiva", async () => {
        const { isGuestLoginEnabled } = await import("./auth.config");
        vi.stubEnv("ENABLE_GUEST_LOGIN", "false");
        expect(isGuestLoginEnabled()).toBe(false);
        vi.stubEnv("ENABLE_GUEST_LOGIN", "true");
        expect(isGuestLoginEnabled()).toBe(true);
        vi.stubEnv("ENABLE_GUEST_LOGIN", "");
        expect(isGuestLoginEnabled()).toBe(true);
    });
});
