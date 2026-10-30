import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3197",
    trace: "on-first-retry",
  },
  webServer: {
    env: { INSTRUO_BUILD_DIR: ".nuxt-e2e" },
    command: "pnpm dev --host 127.0.0.1 --port 3197",
    url: "http://127.0.0.1:3197",
    reuseExistingServer: false,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
