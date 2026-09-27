import { describe, it, expect } from "vitest";
import { isGuestSession, GUEST_WRITE_ERROR } from "./guest-guard";

describe("guest-guard", () => {
    it("detecta sesiones guest por flag o por id compartido", () => {
        expect(isGuestSession(null)).toBe(false);
        expect(isGuestSession({ user: { id: "user-1" } })).toBe(false);
        expect(isGuestSession({ user: { id: "guest-recruiter-id", isGuest: true } })).toBe(true);
        expect(isGuestSession({ user: { id: "guest-recruiter-id" } })).toBe(true);
        expect(isGuestSession({ user: { id: "guest-developer-id", isGuest: true } })).toBe(true);
        expect(isGuestSession({ user: { id: "other", isGuest: true } })).toBe(true);
    });

    it("expone un mensaje de error claro", () => {
        expect(GUEST_WRITE_ERROR.length).toBeGreaterThan(10);
    });
});
