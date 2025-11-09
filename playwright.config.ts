import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 15000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
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
      // Spread existing env so Next.js can read .env.local automatically
      ...process.env,
      // Override specific values for test environment
      SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION ?? '1',
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_PUBLIC_POSTHOG_DISABLED: '1',
      // Ensure PostHog env vars are set (even if dummy values) to avoid validation errors
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? 'test-key',
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'test-host',
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
