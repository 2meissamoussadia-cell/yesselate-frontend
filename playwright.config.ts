/**
 * Playwright E2E — Next.js (port 4001)
 * Lancement : npm run test:e2e (ou npx playwright test)
 * Dev : lancer `npm run dev` puis `npm run test:e2e` (reuseExistingServer: true en local)
 */

import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT ?? 4001;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: process.env.CI ? `npm run build && npx next start -p ${PORT}` : `npm run dev`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
