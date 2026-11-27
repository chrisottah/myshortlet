// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "prisma/**/*.test.ts"],
    pool: "forks",
    testTimeout: 20_000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
});