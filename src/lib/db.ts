import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/placeholder";

// Determinar si es un entorno de test unitario (Vitest)
const isUnitTest = process.env.VITEST === "true" || process.env.NODE_ENV === "test";

// Usamos el adaptador Neon WebSockets si:
// 1. Estamos en tests unitarios (para compatibilidad con los mocks de la base de datos).
// 2. No se provee una variable de entorno DATABASE_URL real.
// 3. La URL de conexión apunta explícitamente a un servidor Neon (contiene neon.tech).
const useNeon =
    isUnitTest ||
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.trim() === "" ||
    (process.env.USE_NEON_WEBSOCKETS !== "false" && connectionString.includes("neon.tech"));

let prismaInstance: PrismaClient;

if (useNeon) {
    neonConfig.webSocketConstructor = ws;
    const adapter = new PrismaNeon({ connectionString });
    prismaInstance = new PrismaClient({ adapter });
} else {
    prismaInstance = new PrismaClient();
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
