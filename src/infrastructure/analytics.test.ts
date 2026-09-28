/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { trackServerEvent } from "./analytics";
import { db } from "@/infrastructure/db";

vi.mock("@vercel/analytics/server", () => ({
    track: vi.fn(),
}));

describe("lib/analytics — trackServerEvent (anonimato + PII)", () => {
    beforeEach(() => {
        // clear (no restore): también limpia el historial del vi.fn() de @vercel/analytics
        vi.clearAllMocks();
    });

    it("persiste el evento con hash anónimo en vez del userId", async () => {
        const createSpy = vi.spyOn(db.analyticsEvent, "create").mockResolvedValue({} as any);

        await trackServerEvent("cv_uploaded", "user-1");

        expect(createSpy).toHaveBeenCalledWith({
            data: expect.objectContaining({ name: "cv_uploaded" }),
        });
        const savedHash = createSpy.mock.calls[0][0].data.userHash as string;
        expect(savedHash).toBeTruthy();
        expect(savedHash).not.toContain("user-1");
    });

    it("filtra claves PII de las properties y conserva las seguras", async () => {
        vi.spyOn(db.analyticsEvent, "create").mockResolvedValue({} as any);
        const { track } = await import("@vercel/analytics/server");

        await trackServerEvent("job_match_completed", "user-1", {
            name: "Juan",
            email: "juan@mail.com",
            matchScore: 82,
        });

        expect(track).toHaveBeenCalledWith(
            "job_match_completed",
            expect.objectContaining({ matchScore: 82, userHash: expect.any(String) }),
        );
        const payload = vi.mocked(track).mock.calls[0][1] as Record<string, unknown>;
        expect(payload).not.toHaveProperty("name");
        expect(payload).not.toHaveProperty("email");
    });

    it("usa userHash anonymous sin userId y no lanza si la DB falla", async () => {
        vi.spyOn(db.analyticsEvent, "create").mockRejectedValue(new Error("db caída"));
        const { track } = await import("@vercel/analytics/server");

        await expect(trackServerEvent("user_registered")).resolves.toBeUndefined();
        expect(track).not.toHaveBeenCalled();
    });
});
