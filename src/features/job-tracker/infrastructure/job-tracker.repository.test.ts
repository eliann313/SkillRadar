/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { defaultJobTrackerStore } from "./job-tracker.repository";
import { db } from "@/infrastructure/db";

describe("defaultJobTrackerStore — adaptador del puerto JobTrackerStore", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("listByUserId delega ordenando por creacion descendente", async () => {
        vi.spyOn(db.jobApplication, "findMany").mockResolvedValue([{ id: "a" }] as any);
        const res = await defaultJobTrackerStore.listByUserId("u-1");
        expect(db.jobApplication.findMany).toHaveBeenCalledWith({
            where: { userId: "u-1" },
            orderBy: { createdAt: "desc" },
        });
        expect(res).toEqual([{ id: "a" }]);
    });

    it("create aplica defaults url=null y status=to_apply", async () => {
        vi.spyOn(db.jobApplication, "create").mockResolvedValue({ id: "b" } as any);
        await defaultJobTrackerStore.create({ userId: "u-1", title: "Dev", company: "Acme" });
        expect(db.jobApplication.create).toHaveBeenCalledWith({
            data: { userId: "u-1", title: "Dev", company: "Acme", url: null, status: "to_apply" },
        });
    });

    it("updateStatus y delete propagan id+userId (IDOR a nivel query)", async () => {
        vi.spyOn(db.jobApplication, "update").mockResolvedValue({ id: "c" } as any);
        vi.spyOn(db.jobApplication, "delete").mockResolvedValue({ id: "c" } as any);
        await defaultJobTrackerStore.updateStatus("c", "u-1", "applied");
        await defaultJobTrackerStore.delete("c", "u-1");
        expect(db.jobApplication.update).toHaveBeenCalledWith({
            where: { id: "c", userId: "u-1" },
            data: { status: "applied" },
        });
        expect(db.jobApplication.delete).toHaveBeenCalledWith({ where: { id: "c", userId: "u-1" } });
    });
});
