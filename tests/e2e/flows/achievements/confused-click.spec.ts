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

    // Wait for ProfileImage component to mount (it uses useIsClient which needs hydration)
    await page.waitForFunction(
      () => {
        // Check that main content is present and page is hydrated
        return document.querySelector('main') !== null
      },
      { timeout: 3000 },
    )

    // Set hash after page loads to ensure it's detected by useHash hook
    // Setting location.hash automatically triggers a hashchange event
    await page.evaluate(() => {
      globalThis.window.location.hash = '#YouWereAlreadyHere'
    })

    // Wait for hashchange event to be processed and useHash hook to update
    // The useHash hook uses requestAnimationFrame and hashchange listener
    // We need to wait for React to process the hashchange and re-render
    await page.waitForFunction(
      () => {
        // Check if hash is present
        if (globalThis.window.location.hash !== '#YouWereAlreadyHere') return false
        // Wait for React to process - check if the achievement data attribute is set
        // This is a reliable indicator that the achievement was unlocked
        return document.documentElement.dataset.achievementConfusedClick === 'true'
      },
      { timeout: 5000 },
    )

    // Some clients fire hashchange-based logic post-hydration; poll cookie to avoid flakes
    await waitForAchievementCookie(page, 'CONFUSED_CLICK', 7000)
    await expectAchievementCookieContains(page, 'CONFUSED_CLICK')
  })
})
