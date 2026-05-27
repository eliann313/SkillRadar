import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        // Use the unpooled direct URL for CLI commands (db push, migrate, etc.)
        // This uses the raw IP proxy which bypasses port 5432 restrictions in some networks.
        url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
    },
});
