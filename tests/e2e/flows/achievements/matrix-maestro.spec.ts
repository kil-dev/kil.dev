import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains, expectConfettiLikely } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, gotoAndWaitForMain } from '../../fixtures/test-helpers'

test.describe('MATRIX_MAESTRO Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
  })

  test('should unlock MATRIX_MAESTRO when selecting matrix theme', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    // Wait a tick for console listener and theme runtime to mount
    await page.waitForTimeout(300)

    // Use the developer console to activate the Matrix theme directly
    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    const input = page.locator('input[aria-label="Console input"]')
    await input.fill('theme matrix')
    await page.keyboard.press('Enter')

    // Wait for the matrix class to be applied to documentElement
    await page.waitForFunction(() => document.documentElement.classList.contains('matrix'), { timeout: 2000 })

    // Wait for achievement to be unlocked (it's triggered when matrix theme is first selected)
    await page.waitForFunction(
      () => {
        const cookies = document.cookie.split(';')
        return cookies.some(c => c.includes('kil.dev_achievements_v1') && c.includes('MATRIX_MAESTRO'))
      },
      { timeout: 3000 },
    )

    // Verify achievement is unlocked and confetti likely triggered
    await expectAchievementCookieContains(page, 'MATRIX_MAESTRO')
    await expectConfettiLikely(page)
  })

  test('should set matrix theme selected flag in localStorage', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(300)

    // Activate Matrix theme via developer console
    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })
    const input = page.locator('input[aria-label="Console input"]')
    await input.fill('theme matrix')
    await page.keyboard.press('Enter')

    // Wait for the matrix class to be applied
    await page.waitForFunction(() => document.documentElement.classList.contains('matrix'), { timeout: 2000 })

    // Check localStorage flag
    const hasFlag = await page.evaluate(() => {
      return localStorage.getItem('kd_matrix_theme_selected') === '1'
    })

    expect(hasFlag).toBe(true)

    // Also ensure the achievement is recorded so it appears in the list
    await expectAchievementCookieContains(page, 'MATRIX_MAESTRO')
  })
})
