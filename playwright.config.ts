import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: "http://127.0.0.1:3000",
    // CI installs Playwright's Chromium. Local runs reuse the system Chrome.
    ...(process.env.CI ? {} : { channel: "chrome" as const }),
  },
  webServer: {
    command: "pnpm exec next start -p 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
