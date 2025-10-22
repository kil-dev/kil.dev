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
    await page.goto('/#YouWereAlreadyHere', { waitUntil: 'domcontentloaded' })
    await waitForHydration(page)

    // Some clients fire hashchange-based logic post-hydration; poll cookie to avoid flakes
    await waitForAchievementCookie(page, 'CONFUSED_CLICK', 7000)
    await expectAchievementCookieContains(page, 'CONFUSED_CLICK')
  })
})
