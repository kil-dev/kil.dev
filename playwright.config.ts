import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: process.env.CI ? 3 : 0,
  workers: undefined,
  reporter: process.env.CI ? 'blob' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    locale: 'en-US',
    colorScheme: 'dark',
  },
  webServer: {
    command: 'bunx convex dev --once --run-sh "bun run preview"',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_PUBLIC_POSTHOG_DISABLED: '1',
    },
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices.DesktopChrome } },
    {
      name: 'chromium-mobile',
      use: { ...devices.Pixel5, viewport: devices.Pixel5?.viewport },
    },
  ],
})
