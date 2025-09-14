import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["src/**/*.{test,spec}.ts"],
    globals: true,
    coverage: { provider: "v8" }
  }
});
