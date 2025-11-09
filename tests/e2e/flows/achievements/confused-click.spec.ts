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
    // This will trigger a hashchange event
    await page.evaluate(() => {
      globalThis.window.location.hash = '#YouWereAlreadyHere'
    })

    // Wait for hashchange event to be processed and useHash hook to update
    // Also wait for React to re-render with the new hash value
    await page.waitForFunction(
      () => {
        // Check if hash is present
        if (globalThis.window.location.hash !== '#YouWereAlreadyHere') return false
        // Check if the ProfileImage component has processed the hash
        // The component sets useConfused when hash === '#YouWereAlreadyHere' and mounted === true
        // We can't directly check React state, but we can wait a bit for the effect to run
        return true
      },
      { timeout: 3000 },
    )

    // Give React time to process the hashchange and run the useEffect that unlocks the achievement
    await page.waitForTimeout(100)

    // Some clients fire hashchange-based logic post-hydration; poll cookie to avoid flakes
    await waitForAchievementCookie(page, 'CONFUSED_CLICK', 7000)
    await expectAchievementCookieContains(page, 'CONFUSED_CLICK')
  })
})
