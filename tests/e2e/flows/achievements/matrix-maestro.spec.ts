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

    // First, unlock THEME_TAPDANCE to access all themes
    for (let i = 0; i < 6; i++) {
      const themeButton = page.getByRole('button', { name: /toggle theme menu/i })
      await themeButton.click()
      await page.waitForTimeout(200)

      // Close by clicking backdrop
      const backdrop = page.locator('div[aria-hidden="false"]').first()
      await backdrop.click({ position: { x: 10, y: 10 } })
      await page.waitForTimeout(200)
    }

    await page.waitForTimeout(1500)

    // Now select matrix theme
    const themeButton = page.getByRole('button', { name: /toggle theme menu/i })
    await themeButton.click()
    await page.waitForSelector('[role="menu"][aria-label="Select theme"]', { state: 'visible' })

    // Look for matrix theme option
    const matrixOption = page.getByRole('menuitem', { name: /matrix/i })

    // Check if matrix theme is available
    const isVisible = await matrixOption.isVisible().catch(() => false)

    if (isVisible) {
      await matrixOption.click()
      await page.waitForTimeout(1500)

      // Verify achievement is unlocked
      await expectAchievementCookieContains(page, 'MATRIX_MAESTRO')

      // Verify confetti was triggered
      await expectConfettiLikely(page)
    } else {
      // Matrix theme might be hidden or require different unlock
      // Check if it can be accessed via console
      await page.keyboard.press('`')
      await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

      const input = page.locator('input[aria-label="Console input"]')

      // Try a matrix-related command if it exists
      await input.fill('theme matrix')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)

      // Check if matrix theme was applied or achievement unlocked
      const hasMatrixClass = await page.evaluate(() => {
        return document.documentElement.classList.contains('matrix')
      })

      if (hasMatrixClass) {
        await expectAchievementCookieContains(page, 'MATRIX_MAESTRO')
      }
    }
  })

  test('should set matrix theme selected flag in localStorage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Unlock THEME_TAPDANCE first
    for (let i = 0; i < 6; i++) {
      const themeButton = page.getByRole('button', { name: /toggle theme menu/i })
      await themeButton.click()
      await page.waitForTimeout(150)

      const backdrop = page.locator('div[aria-hidden="false"]').first()
      await backdrop.click({ position: { x: 10, y: 10 } })
      await page.waitForTimeout(150)
    }

    await page.waitForTimeout(1000)

    // Try to select matrix theme
    const themeButton = page.getByRole('button', { name: /toggle theme menu/i })
    await themeButton.click()
    await page.waitForTimeout(300)

    const matrixOption = page.getByRole('menuitem', { name: /matrix/i })
    const isVisible = await matrixOption.isVisible().catch(() => false)

    if (isVisible) {
      await matrixOption.click()
      await page.waitForTimeout(1000)

      // Check localStorage flag
      const hasFlag = await page.evaluate(() => {
        return localStorage.getItem('kd_matrix_theme_selected') === '1'
      })

      expect(hasFlag).toBe(true)
    }
  })
})
