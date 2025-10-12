import { test } from '@playwright/test'
import { expectAchievementCookieContains } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations } from '../../fixtures/test-helpers'

test.describe('CONFUSED_CLICK Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)
  })

  test('unlocks when visiting the homepage with #YouWereAlreadyHere hash', async ({ page }) => {
    await page.goto('/#YouWereAlreadyHere')
    await page.waitForLoadState('networkidle')

    // Validate achievement
    await expectAchievementCookieContains(page, 'CONFUSED_CLICK')
  })
})
