# E2E Testing with Playwright

This directory contains end-to-end tests for kil.dev using Playwright.

## Setup

### Install Dependencies

```bash
bun install
```

### Install Playwright Browsers

```bash
bunx playwright install chromium
```

## Running Tests

### Run all tests (headless)

```bash
bun run test:e2e
```

### Run tests with UI mode

```bash
bun run test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
bun run test:e2e:headed
```

### Run tests in debug mode

```bash
bun run test:e2e:debug
```

### View test report

```bash
bun run test:e2e:report
```

### Run only specific test file

```bash
bunx playwright test tests/e2e/pages/home.spec.ts
```

### Run tests on specific project (desktop/mobile)

```bash
bunx playwright test --project=chromium-desktop
bunx playwright test --project=chromium-mobile
```

## Test Structure

```
tests/e2e/
├── fixtures/           # Test helpers and utilities
│   ├── test-helpers.ts          # General test helpers
│   └── achievement-helpers.ts   # Achievement-specific helpers
├── pages/             # Page-level tests
│   ├── home.spec.ts
│   ├── about.spec.ts
│   ├── experience.spec.ts
│   ├── projects.spec.ts
│   ├── achievements.spec.ts
│   ├── pet-gallery.spec.ts
│   ├── 404.spec.ts
│   └── 418.spec.ts
└── flows/             # User flow tests
    ├── navigation.spec.ts
    ├── theme-switching.spec.ts
    ├── secret-console.spec.ts
    └── achievements/   # Achievement unlock flows
        ├── page-visits.spec.ts
        ├── theme-tapdance.spec.ts
        ├── konami-code.spec.ts
        ├── pet-parade.spec.ts
        ├── console-commander.spec.ts
        ├── matrix-maestro.spec.ts
        ├── five-star-fan.spec.ts
        ├── recursive-reward.spec.ts
        ├── grumpy-glimpse.spec.ts
        └── confused-click.spec.ts
```

## Writing Tests

### Test Helpers

Use the provided test helpers for consistent, stable tests:

```typescript
import { clearState, disableAnimations, abortNoise } from '../fixtures/test-helpers'

test.beforeEach(async ({ page }) => {
  await clearState(page) // Clear localStorage, sessionStorage, cookies
  await disableAnimations(page) // Disable animations for faster tests
  await abortNoise(page) // Block analytics and external requests
})
```

### Achievement Helpers

For testing achievement unlocks:

```typescript
import {
  expectAchievementCookieContains,
  expectAchievementToast,
  simulateKonamiCode,
  flipAllPetCards,
} from '../fixtures/achievement-helpers'

// Check if achievement is unlocked
await expectAchievementCookieContains(page, 'ABOUT_AMBLER')

// Check for achievement toast notification
await expectAchievementToast(page, 'About Ambler')

// Simulate Konami code
await simulateKonamiCode(page)

// Flip all pet cards
await flipAllPetCards(page)
```

### Selectors

Prefer accessible selectors over test IDs:

```typescript
// ✅ Good - Accessible selectors
page.getByRole('button', { name: /toggle theme menu/i })
page.getByRole('menuitem', { name: 'About' })
page.getByText('Page Not Found')

// ⚠️ Use sparingly - Only when no accessible alternative
page.locator('[data-testid="some-element"]')

// ❌ Avoid - Brittle and non-semantic
page.locator('.some-class')
page.locator('#some-id')
```

### Waiting

Use appropriate waits:

```typescript
// Wait for navigation
await page.waitForLoadState('networkidle')

// Wait for selector
await page.waitForSelector('[role="menu"]', { state: 'visible' })

// Wait for timeout (use sparingly)
await page.waitForTimeout(500)
```

## Testing Achievements

### Guidelines

1. **Isolation**: Each test should start with `clearState(page)` to ensure no previous achievements affect the test
2. **Timing**: Allow time for achievement processing (typically 1000-1500ms after trigger)
3. **Verification**: Check both cookie and localStorage for achievement state
4. **Confetti**: Use `expectConfettiLikely(page)` for achievements that trigger confetti
5. **Toasts**: Use `expectAchievementToast(page, title)` to verify notification appeared

### Example Achievement Test

```typescript
test('should unlock ABOUT_AMBLER on first visit', async ({ page }) => {
  await clearState(page)
  await abortNoise(page)
  await disableAnimations(page)

  await page.goto('/about')
  await page.waitForLoadState('networkidle')

  await expectAchievementToast(page, 'About Ambler')
  await expectAchievementCookieContains(page, 'ABOUT_AMBLER')
})
```

## Debugging Tests

### Debug Mode

Run a specific test in debug mode:

```bash
bunx playwright test tests/e2e/pages/home.spec.ts --debug
```

### Headed Mode

See the browser while tests run:

```bash
bunx playwright test --headed
```

### Traces

Traces are captured on first retry. View them with:

```bash
bunx playwright show-trace test-results/.../trace.zip
```

### Screenshots and Videos

Screenshots are taken on failure. Videos are retained on failure.
Find them in `test-results/` directory.

## CI/CD

Tests run automatically on:

- Push to `main` branch
- Pull requests to `main` branch

The workflow runs on Ubuntu with Chromium only. Test artifacts (reports, screenshots, traces) are uploaded on failure.

## Configuration

Test configuration is in `playwright.config.ts` at the project root:

- **Timeout**: 30 seconds per test
- **Retries**: 2 retries in CI, 0 locally
- **Workers**: 2 in CI, unlimited locally
- **Projects**: Desktop Chrome and Mobile (Pixel 5)
- **Web Server**: Automatically starts with `bun run preview`

## Troubleshooting

### Tests are flaky

1. Add more explicit waits: `await page.waitForLoadState('networkidle')`
2. Use `disableAnimations(page)` to speed up tests
3. Increase timeout for specific assertions
4. Check if external services are being blocked with `abortNoise(page)`

### Achievements not unlocking

1. Verify `clearState(page)` is called in `beforeEach`
2. Add more wait time after trigger: `await page.waitForTimeout(1500)`
3. Check if the achievement requires multiple steps
4. Verify localStorage and cookie are being read correctly

### Console errors in tests

1. Check if `abortNoise(page)` is blocking necessary requests
2. Verify external dependencies are available
3. Check browser console output in headed mode

### Timeout errors

1. Increase timeout for specific test: `test.setTimeout(60000)`
2. Check if `webServer` is starting correctly
3. Verify network requests aren't being blocked unnecessarily

## Best Practices

1. **Hermetic Tests**: Each test should be independent and not rely on state from other tests
2. **Stable Selectors**: Use accessible selectors (roles, labels) over brittle CSS selectors
3. **Clear Intent**: Test names should clearly describe what behavior is being tested
4. **Minimal Waits**: Avoid hardcoded `waitForTimeout` when possible; prefer `waitForSelector` or `waitForLoadState`
5. **Reuse Helpers**: Use fixtures and helpers for common operations
6. **Clean Up**: Clear state before each test to prevent flakiness
7. **Descriptive Assertions**: Use clear assertion messages to aid debugging

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

