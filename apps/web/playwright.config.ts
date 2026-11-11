import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        env: {
          NEXT_PUBLIC_USE_MOCKS: "true",
          MOCK_SESSION_SECRET: process.env.MOCK_SESSION_SECRET ?? "tempo-e2e-local-only-secret-key-32",
        },
      },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
  },
});
