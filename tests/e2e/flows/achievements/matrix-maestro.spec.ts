import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains, expectConfettiLikely } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState } from '../../fixtures/test-helpers'

test.describe('MATRIX_MAESTRO Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
  })

  test('should unlock MATRIX_MAESTRO when selecting matrix theme', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Use the developer console to activate the Matrix theme directly
    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    const input = page.locator('input[aria-label="Console input"]')
    await input.fill('theme matrix')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1200)

    const hasMatrixClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('matrix')
    })
    expect(hasMatrixClass, 'Console command should apply the matrix theme').toBe(true)

    // Verify achievement is unlocked and confetti likely triggered
    await expectAchievementCookieContains(page, 'MATRIX_MAESTRO')
    await expectConfettiLikely(page)
  })

  test('should set matrix theme selected flag in localStorage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Activate Matrix theme via developer console
    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })
    const input = page.locator('input[aria-label="Console input"]')
    await input.fill('theme matrix')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1000)

    // Check localStorage flag
    const hasFlag = await page.evaluate(() => {
      return localStorage.getItem('kd_matrix_theme_selected') === '1'
    })

    expect(hasFlag).toBe(true)

    // Also ensure the achievement is recorded so it appears in the list
    await expectAchievementCookieContains(page, 'MATRIX_MAESTRO')
  })
})
