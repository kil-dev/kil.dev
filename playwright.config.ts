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
    command: 'bun run preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_PUBLIC_POSTHOG_DISABLED: '1',
      // Provide a dummy Convex URL in CI to satisfy client construction.
      // Tests do not hit Convex endpoints.
      NEXT_PUBLIC_CONVEX_URL: 'http://127.0.0.1:3999',
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
