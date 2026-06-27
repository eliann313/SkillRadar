import { db } from "@/lib/db";

export interface GitHubRepoInfo {
    name: string;
    description: string | null;
    stars: number;
    language: string | null;
    languagesUrl: string;
    url: string;
}

export class GitHubConnector {
    /**
     * Obtiene el token de OAuth de GitHub para un usuario, si existe.
     */
    static async getOAuthToken(userId: string): Promise<string | null> {
        try {
            const account = await db.account.findFirst({
                where: {
                    userId,
                    provider: "github",
                },
            });
            return account?.access_token || null;
        } catch (error) {
            console.error("[GitHubConnector] Error al buscar token OAuth:", error);
            return null;
        }
    }

    /**
     * Consulta los repositorios públicos de un usuario en GitHub.
     * Si se provee un token OAuth, se usa para autenticar la petición y obtener mayor cuota.
     */
    static async getPublicRepos(username: string, oauthToken?: string | null): Promise<GitHubRepoInfo[]> {
        const headers: HeadersInit = {
            Accept: "application/vnd.github.v3+json",
        };

        if (oauthToken) {
            headers.Authorization = `Bearer ${oauthToken}`;
        } else if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
            headers.Authorization = `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`;
        }

        const url = `https://api.github.com/users/${username}/repos?per_page=50&sort=updated`;
        const res = await fetch(url, { headers });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error(`El usuario de GitHub "${username}" no fue encontrado.`);
            }
            throw new Error(`Error de la API de GitHub (status: ${res.status}).`);
        }

        const data = (await res.json()) as Array<{
            name: string;
            description: string | null;
            stargazers_count: number;
            language: string | null;
            languages_url: string;
            html_url: string;
        }>;

        return data.map((repo) => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            language: repo.language,
            languagesUrl: repo.languages_url,
            url: repo.html_url,
        }));
    }

    /**
     * Obtiene los bytes de lenguajes de un repositorio específico.
     */
    static async getRepoLanguages(languagesUrl: string, oauthToken?: string | null): Promise<Record<string, number>> {
        const headers: HeadersInit = {
            Accept: "application/vnd.github.v3+json",
        };

        if (oauthToken) {
            headers.Authorization = `Bearer ${oauthToken}`;
        } else if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
            headers.Authorization = `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`;
        }

        try {
            const res = await fetch(languagesUrl, { headers });
            if (!res.ok) return {};
            return (await res.json()) as Record<string, number>;
        } catch {
            return {};
        }
    }
}
