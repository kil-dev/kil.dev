import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations } from '../../fixtures/test-helpers'

test.describe('GRUMPY_GLIMPSE Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)
  })

  test('should unlock GRUMPY_GLIMPSE when clicking grumpy profile variant', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Click the accessible profile toggle (wrapper around the image)
    const profileToggle = page.getByRole('button', { name: /toggle grumpy profile image/i })
    await expect(profileToggle).toBeVisible()
    await profileToggle.click()
    await page.waitForTimeout(500)

    // Verify achievement is unlocked
    await expectAchievementCookieContains(page, 'GRUMPY_GLIMPSE')
  })
})
