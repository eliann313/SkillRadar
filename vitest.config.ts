import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Add coverage configurations if needed
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "next/server": path.resolve(
        import.meta.dirname,
        "./node_modules/next/server.js",
      ),
    },
  },
  ssr: {
    noExternal: ["next-auth"],
  },
});
