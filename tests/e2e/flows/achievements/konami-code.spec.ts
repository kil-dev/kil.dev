import { expect, test } from '@playwright/test'
import {
  expectAchievementCookieContains,
  expectConfettiLikely,
  simulateKonamiCode,
} from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, gotoAndWaitForMain } from '../../fixtures/test-helpers'

test.describe('KONAMI_KILLER Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    // Don't fully disable animations as we need to see the snake game
  })

  test('should unlock KONAMI_KILLER when entering Konami code on home page', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    // Ensure the Konami listener is attached post-hydration
    await page.waitForTimeout(300)

    // Simulate Konami code
    await simulateKonamiCode(page)

    // Wait for achievement to process
    await page.waitForTimeout(1500)

    // Verify achievement is unlocked
    await expectAchievementCookieContains(page, 'KONAMI_KILLER')

    // Verify confetti was triggered
    await expectConfettiLikely(page)
  })

  test('should trigger snake game animation on Konami code', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(300)

    // Simulate Konami code
    await simulateKonamiCode(page)

    // Wait for animation to start
    await page.waitForTimeout(1000)

    // Check if CRT animation or snake game is visible
    // The animation is controlled by startCrtAnimation state
    const hasAnimation = await page.evaluate(() => sessionStorage.getItem('konami-animated') === 'true')

    expect(hasAnimation).toBe(true)
  })

  test('should only work on home page', async ({ page }) => {
    // Try Konami code on About page (should not work)
    await gotoAndWaitForMain(page, '/about')
    await page.waitForTimeout(300)

    await simulateKonamiCode(page)
    await page.waitForTimeout(1500)

    // Check that achievement was NOT unlocked
    const cookies = await page.context().cookies()
    const achievementCookie = cookies.find(c => c.name === 'kil.dev_achievements_v1')

    if (achievementCookie) {
      const decoded = decodeURIComponent(achievementCookie.value)
      const parsed = JSON.parse(decoded) as Record<string, unknown>
      expect(parsed).not.toHaveProperty('KONAMI_KILLER')
    }
  })

  test('should not unlock on incomplete sequence', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(300)

    // Enter incomplete Konami code (missing last few keys)
    const partialSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft']

    for (const key of partialSequence) {
      await page.keyboard.press(key)
      await page.waitForTimeout(50)
    }

    await page.waitForTimeout(1000)

    // Should not be unlocked
    const cookies = await page.context().cookies()
    const achievementCookie = cookies.find(c => c.name === 'kil.dev_achievements_v1')

    if (achievementCookie) {
      const decoded = decodeURIComponent(achievementCookie.value)
      const parsed = JSON.parse(decoded) as Record<string, unknown>
      expect(parsed).not.toHaveProperty('KONAMI_KILLER')
    }
  })
})
