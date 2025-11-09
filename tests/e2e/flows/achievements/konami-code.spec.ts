import { expect, test } from '@playwright/test'
import {
  expectAchievementCookieContains,
  expectConfettiLikely,
  simulateKonamiCode,
  waitForAchievementCookie,
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
    // Ensure the Konami listener is attached - wait for page to be interactive
    await page.waitForLoadState('domcontentloaded')

    // Wait for React to hydrate and KonamiCodeListener component to mount
    // The listener attaches a keydown event listener, so we need to ensure it's ready
    await page.waitForTimeout(500)

    // Simulate Konami code
    await simulateKonamiCode(page)

    // Wait for achievement to process by checking for cookie
    // waitForAchievementCookie polls until KONAMI_KILLER is present in the cookie
    await waitForAchievementCookie(page, 'KONAMI_KILLER', 10000)

    // Verify achievement is unlocked
    await expectAchievementCookieContains(page, 'KONAMI_KILLER')

    // Verify confetti was triggered
    await expectConfettiLikely(page)
  })

  test('should trigger snake game animation on Konami code', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    // Ensure React has hydrated and Konami listener is attached
    // Wait for main content and give React time to mount client components
    const main = page.getByRole('main')
    await expect(main).toBeVisible({ timeout: 2000 })
    await page.waitForTimeout(500) // Allow React to hydrate and mount KonamiCodeListener

    // Simulate Konami code
    await simulateKonamiCode(page)

    // The simulateKonamiCode already waits for sessionStorage, so just verify it
    const hasAnimation = await page.evaluate(() => sessionStorage.getItem('konami-animated') === 'true')
    expect(hasAnimation).toBe(true)
  })

  test('should only work on home page', async ({ page }) => {
    // Try Konami code on About page (should not work)
    await gotoAndWaitForMain(page, '/about')
    // Ensure page is interactive
    await page.waitForLoadState('domcontentloaded')

    await simulateKonamiCode(page)
    // Wait a bit for any potential processing, but don't wait too long
    await page.waitForTimeout(500)

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
    // Ensure the Konami listener is attached - wait for page to be interactive
    await page.waitForLoadState('domcontentloaded')

    // Enter incomplete Konami code (missing last few keys)
    const partialSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft']

    for (const key of partialSequence) {
      await page.keyboard.press(key)
      // Small delay between key presses to simulate real typing
      await page.waitForTimeout(50)
    }

    // Wait a bit for any potential processing
    await page.waitForTimeout(500)

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
