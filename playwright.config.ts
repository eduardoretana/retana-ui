import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    trace: "off",
  },
  webServer: {
    command: "pnpm dev --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
