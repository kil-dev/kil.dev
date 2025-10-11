import { test } from '@playwright/test'
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

    // Look for profile image or avatar
    const profileImage = page.locator('img[alt*="kilian" i], img[alt*="headshot" i]').first()
    const isVisible = await profileImage.isVisible().catch(() => false)

    if (isVisible) {
      // Click the profile image (may cycle through variants)
      await profileImage.click()
      await page.waitForTimeout(500)

      // Multiple clicks may be needed to cycle to grumpy variant
      for (let i = 0; i < 15; i++) {
        await profileImage.click()
        await page.waitForTimeout(200)

        // Check if grumpy achievement is unlocked
        const cookies = await page.context().cookies()
        const achievementCookie = cookies.find(c => c.name === 'kil.dev_achievements_v1')

        if (achievementCookie) {
          const decoded = decodeURIComponent(achievementCookie.value)
          const parsed = JSON.parse(decoded) as Record<string, unknown>
          if (parsed.GRUMPY_GLIMPSE) {
            // Achievement unlocked!
            await expectAchievementCookieContains(page, 'GRUMPY_GLIMPSE')
            return
          }
        }
      }
    }
  })
})
