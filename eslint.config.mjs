import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactCompiler from "eslint-plugin-react-compiler";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    reactCompiler.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // ─────────────────────────────────────────
            // TypeScript Strict & Quality Rules
            // ─────────────────────────────────────────
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-misused-promises": "error",

            // ─────────────────────────────────────────
            // General Quality & Clean Code Rules
            // ─────────────────────────────────────────
            "no-console": "error",
            "no-debugger": "error",
            "prefer-const": "error",
            "no-var": "error",
            eqeqeq: ["error", "always"],
        },
    },
    globalIgnores([
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        "node_modules/**",
        "eslint.config.mjs",
        ".dependency-cruiser.cjs",
        "postcss.config.mjs",
        "vitest.config.ts",
        "next.config.ts",
    ]),
]);

export default eslintConfig;
