/**
 * Vitest configuration for the Day 30 frontend test suite.
 * CONCEPT: Comprehensive tests - jsdom lets component tests run like a browser.
 */
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  esbuild: {
    jsx: "automatic"
  }
});
