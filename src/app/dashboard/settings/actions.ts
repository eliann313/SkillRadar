"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

export interface ApiKeysInput {
    geminiApiKey?: string;
    groqApiKey?: string;
    openrouterApiKey?: string;
    openaiApiKey?: string;
    anthropicApiKey?: string;
}

export interface InferencePreferencesInput {
    defaultAiProvider: string;
    defaultAiModel: string;
}

const PRESET_PLACEHOLDER = "__API_KEY_PRESET__";

/**
 * Guarda las claves API personales del usuario de forma cifrada en la base de datos.
 */
export async function saveUserApiKeysAction(input: ApiKeysInput) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado. Inicie sesión." };
        }

        const userId = session.user.id;

        // Buscar el registro de usuario actual
        const currentUser = await db.user.findUnique({
            where: { id: userId },
        });

        if (!currentUser) {
            return { success: false, error: "Usuario no encontrado." };
        }

        const updateData: {
            geminiApiKey?: string | null;
            groqApiKey?: string | null;
            openrouterApiKey?: string | null;
            openaiApiKey?: string | null;
            anthropicApiKey?: string | null;
        } = {};

        if (input.geminiApiKey !== undefined) {
            if (input.geminiApiKey === "") {
                updateData.geminiApiKey = null;
            } else if (input.geminiApiKey !== PRESET_PLACEHOLDER) {
                updateData.geminiApiKey = encrypt(input.geminiApiKey);
            }
        }

        if (input.groqApiKey !== undefined) {
            if (input.groqApiKey === "") {
                updateData.groqApiKey = null;
            } else if (input.groqApiKey !== PRESET_PLACEHOLDER) {
                updateData.groqApiKey = encrypt(input.groqApiKey);
            }
        }

        if (input.openrouterApiKey !== undefined) {
            if (input.openrouterApiKey === "") {
                updateData.openrouterApiKey = null;
            } else if (input.openrouterApiKey !== PRESET_PLACEHOLDER) {
                updateData.openrouterApiKey = encrypt(input.openrouterApiKey);
            }
        }

        if (input.openaiApiKey !== undefined) {
            if (input.openaiApiKey === "") {
                updateData.openaiApiKey = null;
            } else if (input.openaiApiKey !== PRESET_PLACEHOLDER) {
                updateData.openaiApiKey = encrypt(input.openaiApiKey);
            }
        }

        if (input.anthropicApiKey !== undefined) {
            if (input.anthropicApiKey === "") {
                updateData.anthropicApiKey = null;
            } else if (input.anthropicApiKey !== PRESET_PLACEHOLDER) {
                updateData.anthropicApiKey = encrypt(input.anthropicApiKey);
            }
        }

        if (Object.keys(updateData).length > 0) {
            await db.user.update({
                where: { id: userId },
                data: updateData,
            });
        }

        revalidatePath("/dashboard/settings");

        return {
            success: true,
            message: "Claves de API personales actualizadas correctamente.",
        };
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Error al actualizar las claves de API.";
        console.error("[saveUserApiKeysAction] Error guardando llaves:", errMessage);
        return {
            success: false,
            error: errMessage,
        };
    }
}

/**
 * Guarda las preferencias de inferencia por defecto para el usuario.
 */
export async function saveUserInferencePreferencesAction(input: InferencePreferencesInput) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        const userId = session.user.id;

        await db.user.update({
            where: { id: userId },
            data: {
                defaultAiProvider: input.defaultAiProvider,
                defaultAiModel: input.defaultAiModel,
            },
        });

        revalidatePath("/dashboard/settings");

        return {
            success: true,
            message: "Preferencias de inferencia actualizadas con éxito.",
        };
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Error al guardar preferencias.";
        console.error("[saveUserInferencePreferencesAction] Error guardando preferencias:", errMessage);
        return {
            success: false,
            error: errMessage,
        };
    }
}

/**
 * Obtiene el estado de las llaves API del usuario (booleano) y sus preferencias de inferencia.
 * Blindado para jamás enviar el ciphertext real al cliente.
 */
export async function getUserApiKeysStatusAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        const userId = session.user.id;

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                geminiApiKey: true,
                groqApiKey: true,
                openrouterApiKey: true,
                openaiApiKey: true,
                anthropicApiKey: true,
                defaultAiProvider: true,
                defaultAiModel: true,
            },
        });

        if (!user) {
            return { success: false, error: "Usuario no encontrado." };
        }

        return {
            success: true,
            data: {
                hasGeminiKey: !!user.geminiApiKey,
                hasGroqKey: !!user.groqApiKey,
                hasOpenrouterKey: !!user.openrouterApiKey,
                hasOpenaiKey: !!user.openaiApiKey,
                hasAnthropicKey: !!user.anthropicApiKey,
                defaultAiProvider: user.defaultAiProvider,
                defaultAiModel: user.defaultAiModel,
            },
        };
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Error al obtener estado de llaves.";
        console.error("[getUserApiKeysStatusAction] Error recuperando estado:", errMessage);
        return {
            success: false,
            error: errMessage,
        };
    }
}

export interface PublicProfileSettingsInput {
    isPublicProfile: boolean;
    publicUsername?: string | null;
    showSkills: boolean;
    showGithub: boolean;
    showSeniority: boolean;
}

/**
 * Obtiene la configuración del perfil público del usuario.
 */
export async function getUserPublicProfileSettingsAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        const userId = session.user.id;

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                isPublicProfile: true,
                publicUsername: true,
                showSkills: true,
                showGithub: true,
                showSeniority: true,
            },
        });

        if (!user) {
            return { success: false, error: "Usuario no encontrado." };
        }

        return {
            success: true,
            data: user,
        };
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Error al obtener perfil público.";
        console.error("[getUserPublicProfileSettingsAction] Error:", errMessage);
        return { success: false, error: errMessage };
    }
}

/**
 * Actualiza la configuración del perfil público del usuario.
 */
export async function updateUserPublicProfileSettingsAction(input: PublicProfileSettingsInput) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado." };
        }

        const userId = session.user.id;

        // Si se define un username, validar que sea único en la base de datos
        if (input.publicUsername) {
            // Limpiar el username: minúsculas, números, guiones
            const cleanedUsername = input.publicUsername
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, "");
            if (cleanedUsername.length < 3) {
                return {
                    success: false,
                    error: "El nombre de usuario debe tener al menos 3 caracteres alfanuméricos.",
                };
            }

            const existingUser = await db.user.findUnique({
                where: { publicUsername: cleanedUsername },
                select: { id: true },
            });

            if (existingUser && existingUser.id !== userId) {
                return { success: false, error: "El nombre de usuario ya está en uso." };
            }
            input.publicUsername = cleanedUsername;
        } else if (input.isPublicProfile) {
            return { success: false, error: "Debes configurar un nombre de usuario público para activar el perfil." };
        }

        await db.user.update({
            where: { id: userId },
            data: {
                isPublicProfile: input.isPublicProfile,
                publicUsername: input.publicUsername || null,
                showSkills: input.showSkills,
                showGithub: input.showGithub,
                showSeniority: input.showSeniority,
            },
        });

        revalidatePath("/dashboard/settings");

        return {
            success: true,
            message: "Configuración de perfil público actualizada correctamente.",
        };
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Error al actualizar perfil público.";
        console.error("[updateUserPublicProfileSettingsAction] Error:", errMessage);
        return { success: false, error: errMessage };
    }
}
