import { describe, it, expect, vi } from "vitest";
import type { User } from "@prisma/client";
import { encrypt, decrypt } from "./crypto";
import { db } from "./db";

describe("Criptosistema AES-256-GCM (Tarjeta 7.3)", () => {
    it("debe generar textos cifrados diferentes para llamadas consecutivas con el mismo texto plano (IVs únicos)", () => {
        const plainText = "mi-super-secreta-api-key-123";
        const encrypted1 = encrypt(plainText);
        const encrypted2 = encrypt(plainText);

        expect(encrypted1).toBeDefined();
        expect(encrypted2).toBeDefined();
        expect(encrypted1).not.toBe("");
        expect(encrypted2).not.toBe("");

        // Deben ser diferentes debido a que usan IVs aleatorios únicos generados por crypto.randomBytes
        expect(encrypted1).not.toBe(encrypted2);

        // Ambos deben desencriptarse correctamente al mismo texto plano
        expect(decrypt(encrypted1)).toBe(plainText);
        expect(decrypt(encrypted2)).toBe(plainText);
    });

    it("debe fallar al desencriptar de forma segura (retornando cadena vacía) si el texto cifrado fue alterado", () => {
        const plainText = "clave-de-prueba";
        const encrypted = encrypt(plainText);

        // El formato de encrypted es ivHex:authTagHex:encryptedTextHex
        const parts = encrypted.split(":");
        expect(parts.length).toBe(3);

        const [iv, tag, ciphertext] = parts;

        // Ocultar temporalmente los console.error esperados durante este test
        const spyError = vi.spyOn(console, "error").mockImplementation(() => {});

        // 1. Alterar el ciphertext (cambiar el último carácter hexadecimal)
        const alteredCiphertext = ciphertext.slice(0, -1) + (ciphertext.slice(-1) === "a" ? "b" : "a");
        const corruptedEncrypted1 = `${iv}:${tag}:${alteredCiphertext}`;

        // Debe fallar de forma controlada capturando el error del Auth Tag y retornar cadena vacía
        expect(decrypt(corruptedEncrypted1)).toBe("");

        // 2. Alterar el Auth Tag
        const alteredTag = tag.slice(0, -1) + (tag.slice(-1) === "a" ? "b" : "a");
        const corruptedEncrypted2 = `${iv}:${alteredTag}:${ciphertext}`;
        expect(decrypt(corruptedEncrypted2)).toBe("");

        // 3. Alterar el IV
        const alteredIv = iv.slice(0, -1) + (iv.slice(-1) === "a" ? "b" : "a");
        const corruptedEncrypted3 = `${alteredIv}:${tag}:${ciphertext}`;
        expect(decrypt(corruptedEncrypted3)).toBe("");

        // Restaurar el console.error original
        spyError.mockRestore();
    });

    it("debe realizar el ciclo completo de encriptación y desencriptación con éxito", () => {
        const plainText = "sk-proj-1234567890abcdefghijklmnopqrstuvwxyz";
        const encrypted = encrypt(plainText);
        const decrypted = decrypt(encrypted);

        expect(decrypted).toBe(plainText);
    });

    it("debe simular o ejecutar la persistencia de datos cifrados de forma segura en Postgres/Neon", async () => {
        const testEmail = `test-crypto-${Date.now()}@example.com`;
        const plainKey = "gemini-api-key-secreta-999";
        const encryptedKey = encrypt(plainKey);

        // Detectar si tenemos DATABASE_URL configurada en el entorno
        const hasDatabaseUrl = !!process.env.DATABASE_URL;

        if (hasDatabaseUrl) {
            console.warn(
                "🔌 [Crypto Test] Conexión real a base de datos Neon detectada. Ejecutando test de persistencia real...",
            );

            try {
                // 1. Crear un usuario temporal de prueba
                const testUser = await db.user.create({
                    data: {
                        email: testEmail,
                        name: "Crypto Test User",
                        geminiApiKey: encryptedKey,
                    },
                });

                expect(testUser.id).toBeDefined();

                // 2. Recuperar el usuario y validar los datos en base de datos
                const retrievedUser = await db.user.findUnique({
                    where: { id: testUser.id },
                });

                expect(retrievedUser).not.toBeNull();
                expect(retrievedUser?.geminiApiKey).toBe(encryptedKey);

                // Verificar el formato cifrado
                const parts = retrievedUser!.geminiApiKey!.split(":");
                expect(parts.length).toBe(3); // iv:tag:ciphertext

                // 3. Desencriptar la clave recuperada y comparar
                const decryptedKey = decrypt(retrievedUser!.geminiApiKey);
                expect(decryptedKey).toBe(plainKey);

                // 4. Limpieza de datos (Borrar el usuario de prueba)
                await db.user.delete({
                    where: { id: testUser.id },
                });

                console.warn(
                    "✅ [Crypto Test] Test de persistencia real en Neon Postgres completado y limpio con éxito.",
                );
            } catch (dbError) {
                console.error("❌ [Crypto Test] Falló la persistencia real, procediendo con mock validation:", dbError);
                throw dbError; // Si está configurado el URL pero falla, queremos que falle el test
            }
        } else {
            console.warn(
                "ℹ️ [Crypto Test] No se detectó DATABASE_URL en el entorno. Ejecutando simulación segura mediante Mocking de Prisma...",
            );

            // Crear mocks simulando el comportamiento de Prisma
            const mockUser: User = {
                id: "test-cuid-12345",
                email: testEmail,
                name: "Mock Crypto User",
                emailVerified: null,
                image: null,
                passwordHash: null,
                geminiApiKey: encryptedKey,
                groqApiKey: null,
                openrouterApiKey: null,
                openaiApiKey: null,
                anthropicApiKey: null,
                role: "developer",
                passwordResetToken: null,
                passwordResetExpires: null,
                defaultAiProvider: "gemini",
                defaultAiModel: "gemini-2.5-flash",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const spyCreate = vi.spyOn(db.user, "create").mockResolvedValue(mockUser);
            const spyFindUnique = vi.spyOn(db.user, "findUnique").mockResolvedValue(mockUser);
            const spyDelete = vi.spyOn(db.user, "delete").mockResolvedValue(mockUser);

            // 1. Crear el usuario mockeado
            const testUser = await db.user.create({
                data: {
                    email: testEmail,
                    name: "Crypto Test User",
                    geminiApiKey: encryptedKey,
                },
            });

            expect(spyCreate).toHaveBeenCalled();
            expect(testUser.id).toBe("test-cuid-12345");

            // 2. Recuperar el usuario mockeado
            const retrievedUser = await db.user.findUnique({
                where: { id: testUser.id },
            });

            expect(spyFindUnique).toHaveBeenCalled();
            expect(retrievedUser?.geminiApiKey).toBe(encryptedKey);

            // Verificar formato del mock
            const parts = retrievedUser!.geminiApiKey!.split(":");
            expect(parts.length).toBe(3);

            // 3. Desencriptar clave
            const decryptedKey = decrypt(retrievedUser!.geminiApiKey);
            expect(decryptedKey).toBe(plainKey);

            // 4. Eliminar el usuario mockeado
            await db.user.delete({
                where: { id: testUser.id },
            });

            expect(spyDelete).toHaveBeenCalled();

            // Restaurar mocks originales
            vi.restoreAllMocks();
            console.warn("✅ [Crypto Test] Simulación de persistencia Prisma completada y verificada exitosamente.");
        }
    });
});
