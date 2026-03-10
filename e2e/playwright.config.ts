import { defineConfig, devices } from '@playwright/test'

/**
 * Wiki.js 3 E2E tests.
 * Run against a local server: start with `node server` from repo root, then run `pnpm test`.
 * Traces and videos are recorded on first retry and on failure for "watch back" debugging.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.WIKI_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: [/full-app\.spec\.ts/] },
    {
      name: 'logged-in',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      testMatch: /full-app\.spec\.ts/,
    },
  ],
  globalSetup: require.resolve('./global-setup.ts'),
  timeout: 30_000,
  expect: { timeout: 10_000 },
})
