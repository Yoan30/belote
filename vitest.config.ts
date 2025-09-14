import { defineConfig } from "vitest/config"
export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts", "src/**/__tests__/**/*.ts"],
  },
})
