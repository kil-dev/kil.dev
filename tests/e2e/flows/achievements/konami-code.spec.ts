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
    // Ensure the Konami listener is attached - wait for page to be interactive
    await page.waitForLoadState('domcontentloaded')

    // Simulate Konami code
    await simulateKonamiCode(page)

    // Wait for achievement to process by checking for cookie
    // Use a polling approach that handles page closure gracefully
    try {
      await page.waitForFunction(
        () => {
          const cookies = document.cookie.split(';')
          return cookies.some(c => c.includes('kil.dev_achievements_v1') && c.includes('KONAMI_KILLER'))
        },
        { timeout: 3000 },
      )
    } catch (error) {
      // If page closes, try to check cookies from context, but handle context errors gracefully
      if (page.isClosed()) {
        try {
          const cookies = await page.context().cookies()
          const achievementCookie = cookies.find(c => c.name === 'kil.dev_achievements_v1')
          if (achievementCookie) {
            const decoded = decodeURIComponent(achievementCookie.value)
            const parsed = JSON.parse(decoded) as Record<string, unknown>
            if (parsed.KONAMI_KILLER) {
              // Achievement was unlocked before page closed, continue
              return
            }
          }
        } catch {
          // Context might be invalid, but achievement might still be set
          // Check if we can verify achievement was unlocked before timeout
          // If not, rethrow original error
        }
      }
      throw error
    }

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
