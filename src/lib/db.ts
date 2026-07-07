import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

const connectionString = process.env.DATABASE_URL!;

// Determinar si es un entorno de test unitario (Vitest)
const isUnitTest = process.env.VITEST === "true" || process.env.NODE_ENV === "test";

// Determinar si se debe usar el adaptador de Neon WebSockets
// Se activa en tests unitarios o si la URL apunta a Neon (neon.tech)
const useNeon = isUnitTest || (process.env.USE_NEON_WEBSOCKETS !== "false" && connectionString?.includes("neon.tech"));

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
