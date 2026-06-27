"use server";

import { auth } from "@/lib/auth";
import { GithubAnalysisService } from "./service";
import { revalidatePath } from "next/cache";

export async function analyzeGithubUserAction(githubUser: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado. Por favor inicia sesión." };
    }

    try {
        const result = await GithubAnalysisService.analyzeUser(session.user.id, githubUser);
        revalidatePath("/dashboard/github");
        return { success: true, data: result };
    } catch (error: unknown) {
        console.error("[analyzeGithubUserAction] Error:", error);
        const message = error instanceof Error ? error.message : "Error inesperado al analizar el perfil de GitHub.";
        return { success: false, error: message };
    }
}
