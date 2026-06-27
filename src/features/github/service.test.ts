import { describe, it, expect, vi, beforeEach } from "vitest";
import { GithubAnalysisService } from "./service";
import { GitHubConnector } from "@/lib/github";
import { GithubAnalysisRepository } from "./repository";
import { db } from "@/lib/db";

describe("GithubAnalysisService", () => {
    const userId = "test-user-id";
    const githubUser = "testuser";

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("debe fallar si el nombre de usuario de GitHub es inválido (SSRF check)", async () => {
        await expect(GithubAnalysisService.analyzeUser(userId, "invalid user name! @ssrf")).rejects.toThrow(
            "El usuario de GitHub solo puede contener letras, números y guiones.",
        );
    });

    it("debe realizar el análisis de GitHub correctamente usando simulación o fallback", async () => {
        const mockRepos = [
            {
                name: "project-react",
                description: "A React and TypeScript project",
                stars: 5,
                language: "TypeScript",
                languagesUrl: "https://api.github.com/repos/testuser/project-react/languages",
                url: "https://github.com/testuser/project-react",
            },
        ];

        const mockLanguages = { TypeScript: 5000 };

        const mockAnalysisResult = {
            id: "analysis-123",
            userId,
            githubUser,
            profileScore: 85,
            languages: mockLanguages,
            repos: mockRepos,
            analysis: {
                strengths: ["Uso de TypeScript."],
                weaknesses: ["Pocas estrellas."],
                suggestions: ["Subir demostraciones."],
            },
            createdAt: new Date(),
        };

        // Mocks de los conectores
        const spyGetToken = vi.spyOn(GitHubConnector, "getOAuthToken").mockResolvedValue(null);
        const spyGetRepos = vi.spyOn(GitHubConnector, "getPublicRepos").mockResolvedValue(mockRepos);
        const spyGetLangs = vi.spyOn(GitHubConnector, "getRepoLanguages").mockResolvedValue(mockLanguages);
        vi.spyOn(db.user, "findUnique").mockResolvedValue(null);
        const spyCreateOrUpdate = vi
            .spyOn(GithubAnalysisRepository, "createOrUpdate")
            .mockResolvedValue(
                mockAnalysisResult as unknown as Awaited<ReturnType<typeof GithubAnalysisRepository.createOrUpdate>>,
            );

        const result = await GithubAnalysisService.analyzeUser(userId, githubUser);

        expect(spyGetToken).toHaveBeenCalledWith(userId);
        expect(spyGetRepos).toHaveBeenCalledWith(githubUser, null);
        expect(spyGetLangs).toHaveBeenCalledWith(mockRepos[0].languagesUrl, null);
        expect(spyCreateOrUpdate).toHaveBeenCalled();

        expect(result).toBeDefined();
        expect(result.githubUser).toBe(githubUser);
        expect(result.profileScore).toBe(85);
    });
});
