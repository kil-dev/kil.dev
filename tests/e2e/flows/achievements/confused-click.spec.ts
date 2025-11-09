import { test } from '@playwright/test'
import { expectAchievementCookieContains, waitForAchievementCookie } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations, waitForHydration } from '../../fixtures/test-helpers'

test.describe('CONFUSED_CLICK Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)
  })

  test('unlocks when visiting the homepage with #YouWereAlreadyHere hash', async ({ page }) => {
    // Navigate to homepage first, then set hash to ensure it's preserved
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    // Set hash after page loads to ensure it's detected by useHash hook
    await page.evaluate(() => {
      globalThis.window.location.hash = '#YouWereAlreadyHere'
    })

    // Wait for hash to be processed and component to mount
    // The useHash hook and useIsClient need time to detect the hash
    await page.waitForFunction(
      () => {
        // Check if hash is present and component has mounted
        return globalThis.window.location.hash === '#YouWereAlreadyHere' && document.querySelector('main') !== null
      },
      { timeout: 3000 },
    )

    // Some clients fire hashchange-based logic post-hydration; poll cookie to avoid flakes
    await waitForAchievementCookie(page, 'CONFUSED_CLICK', 7000)
    await expectAchievementCookieContains(page, 'CONFUSED_CLICK')
  })
})
