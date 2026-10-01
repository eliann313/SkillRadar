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
        // Piso anti-regresión = baseline medido Fase 0 (líneas ~40%,
        // funciones 42.71%, ramas 33.19%, sentencias 40.1%).
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            thresholds: {
                lines: 39,
                functions: 42,
                branches: 33,
                statements: 40,
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
