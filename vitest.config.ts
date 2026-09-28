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
        // Piso anti-regresión = baseline medido F4.3 (líneas 40.42%,
        // funciones 42.21%, ramas 33.11%, sentencias 39.94%).
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            thresholds: {
                lines: 39,
                functions: 41,
                branches: 32,
                statements: 38,
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
