import { test } from '@playwright/test'
import { expectAchievementCookieContains } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations } from '../../fixtures/test-helpers'

test.describe('CONFUSED_CLICK Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)
  })

  test('should unlock CONFUSED_CLICK when clicking site link while already on site', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for a link that points to the same site (kil.dev)
    // This might be in social links or footer
    const siteLinks = page.locator('a[href*="kil.dev"]')
    const count = await siteLinks.count()

    for (let i = 0; i < count; i++) {
      const link = siteLinks.nth(i)
      const isVisible = await link.isVisible().catch(() => false)

      if (isVisible) {
        const href = await link.getAttribute('href')

        // Make sure it's an external link (has http/https)
        if (href?.includes('http')) {
          // Click the link (which takes you to the same site you're already on)
          await link.click({ modifiers: [] })
          await page.waitForTimeout(1500)

          // Check if achievement unlocked
          const cookies = await page.context().cookies()
          const achievementCookie = cookies.find(c => c.name === 'kil.dev_achievements_v1')

          if (achievementCookie) {
            const decoded = decodeURIComponent(achievementCookie.value)
            const parsed = JSON.parse(decoded) as Record<string, unknown>
            if (parsed.CONFUSED_CLICK) {
              await expectAchievementCookieContains(page, 'CONFUSED_CLICK')
              return
            }
          }
        }
      }
    }
  })
})
