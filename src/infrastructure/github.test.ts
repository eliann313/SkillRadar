/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GitHubConnector } from "./github";
import { db } from "@/infrastructure/db";

describe("lib/github — GitHubConnector", () => {
    const realFetch = globalThis.fetch;

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        globalThis.fetch = realFetch;
        delete process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    });

    describe("getOAuthToken", () => {
        it("retorna el access_token de la cuenta github", async () => {
            vi.spyOn(db.account, "findFirst").mockResolvedValue({ access_token: "gho_123" } as any);
            await expect(GitHubConnector.getOAuthToken("user-1")).resolves.toBe("gho_123");
        });

        it("retorna null sin cuenta y null ante error de DB", async () => {
            vi.spyOn(db.account, "findFirst").mockResolvedValue(null);
            await expect(GitHubConnector.getOAuthToken("user-1")).resolves.toBeNull();

            vi.spyOn(db.account, "findFirst").mockRejectedValue(new Error("db caída"));
            await expect(GitHubConnector.getOAuthToken("user-1")).resolves.toBeNull();
        });
    });

    describe("getPublicRepos", () => {
        const apiRepo = {
            name: "skill-radar",
            description: "desc",
            stargazers_count: 10,
            language: "TypeScript",
            languages_url: "https://api.github.com/repos/u/r/languages",
            html_url: "https://github.com/u/r",
        };

        it("mapea la respuesta de la API al DTO interno", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve([apiRepo]),
            }) as any;

            const repos = await GitHubConnector.getPublicRepos("octocat");
            expect(repos).toEqual([
                {
                    name: "skill-radar",
                    description: "desc",
                    stars: 10,
                    language: "TypeScript",
                    languagesUrl: "https://api.github.com/repos/u/r/languages",
                    url: "https://github.com/u/r",
                },
            ]);
        });

        it("envía Bearer con token OAuth y usa el PAT como fallback", async () => {
            const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
            globalThis.fetch = fetchMock as any;

            await GitHubConnector.getPublicRepos("octocat", "gho_123");
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining("/users/octocat/repos"),
                expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer gho_123" }) }),
            );

            process.env.GITHUB_PERSONAL_ACCESS_TOKEN = "pat_456";
            await GitHubConnector.getPublicRepos("octocat");
            expect(fetchMock).toHaveBeenLastCalledWith(
                expect.any(String),
                expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer pat_456" }) }),
            );
        });

        it("lanza error 404 con mensaje claro y error genérico con otro status", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as any;
            await expect(GitHubConnector.getPublicRepos("nadie")).rejects.toThrow("no fue encontrado");

            globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as any;
            await expect(GitHubConnector.getPublicRepos("octocat")).rejects.toThrow("status: 500");
        });
    });

    describe("getRepoLanguages", () => {
        it("retorna el mapa de lenguajes y {} ante error o status no-ok", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ TypeScript: 100 }),
            }) as any;
            await expect(GitHubConnector.getRepoLanguages("https://x")).resolves.toEqual({ TypeScript: 100 });

            globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 }) as any;
            await expect(GitHubConnector.getRepoLanguages("https://x")).resolves.toEqual({});

            globalThis.fetch = vi.fn().mockRejectedValue(new Error("red caída")) as any;
            await expect(GitHubConnector.getRepoLanguages("https://x")).resolves.toEqual({});
        });
    });
});
