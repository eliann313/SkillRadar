import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/cypress/**",
            "**/.{idea,git,cache,output,temp}/**",
            "**/{karma,rollup,webpack,vite,vitest}.config.*",
            "**/tests/e2e/**",
        ],
        // Piso anti-regresión = baseline medido 2026-09-27 (líneas 28.08%,
        // funciones 35.27%, ramas 21.15%, sentencias 27.4%).
        // F4.3 sube el piso hacia 40% con tests P0/P1+E2E.
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            thresholds: {
                lines: 27,
                functions: 34,
                branches: 20,
                statements: 26,
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./src"),
            "next/server": path.resolve(import.meta.dirname, "./node_modules/next/server.js"),
            "next/navigation": path.resolve(import.meta.dirname, "./node_modules/next/navigation.js"),
        },
    },
    ssr: {
        noExternal: ["next-auth"],
    },
});
