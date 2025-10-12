import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains, expectConfettiLikely } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, closeThemeMenu, openThemeMenu } from '../../fixtures/test-helpers'

test.describe('THEME_TAPDANCE Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    // Don't disable animations for this test as we need to test the menu interaction
  })

  test('should not show all seasonal themes before THEME_TAPDANCE', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await openThemeMenu(page)

    const menu = page.locator('#theme-options')
    const names = ['Pride', 'Halloween', 'Thanksgiving', 'Christmas']
    const counts = await Promise.all(names.map(n => menu.getByRole('menuitem', { name: n }).count()))
    const total = counts.reduce((a, b) => a + b, 0)
    // Before unlocking, the menu should not show all seasonal themes at once
    expect(total).toBeLessThan(4)
  })

  test('should reset counter if theme is selected', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open and close 3 times
    for (let i = 0; i < 3; i++) {
      await openThemeMenu(page)
      await page.waitForTimeout(200)
      await page.locator('button[aria-controls="theme-options"]').first().click()
      await page.waitForTimeout(200)
    }

    // Open menu and actually select a theme
    await openThemeMenu(page)
    // Scope to the theme menu so we don't hit unrelated nav menuitems behind the overlay
    await page.waitForSelector('#theme-options [role="menuitem"]', { state: 'visible' })
    const themeOption = page.locator('#theme-options').getByRole('menuitem').first()
    await themeOption.click()
    await page.waitForTimeout(500)

    // Now open/close 6 more times (counter should have reset)
    for (let i = 0; i < 6; i++) {
      await openThemeMenu(page)
      await page.waitForTimeout(200)
      await page.locator('button[aria-controls="theme-options"]').first().click()
      await page.waitForTimeout(200)
    }

    // Wait for achievement
    await page.waitForTimeout(1500)

    // Should now be unlocked
    await expectAchievementCookieContains(page, 'THEME_TAPDANCE')
  })

  test('should unlock THEME_TAPDANCE after opening/closing theme menu 6 times', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open and close theme menu 6 times
    for (let i = 0; i < 6; i++) {
      await openThemeMenu(page)
      await page.waitForTimeout(200)
      // Close by toggling the button again, which is how the counter increments
      await page.locator('button[aria-controls="theme-options"]').first().click()
      await page.waitForTimeout(200)
    }

    // Wait for achievement to process
    await page.waitForTimeout(1500)

    // Verify achievement is unlocked
    await expectAchievementCookieContains(page, 'THEME_TAPDANCE')

    // Verify confetti was triggered (theme tapdance has confetti)
    await expectConfettiLikely(page)
  })

  test('should unlock all seasonal themes after THEME_TAPDANCE', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Unlock THEME_TAPDANCE by opening/closing menu 6 times
    for (let i = 0; i < 6; i++) {
      await openThemeMenu(page)
      await page.waitForTimeout(200)
      await closeThemeMenu(page)
      await page.waitForTimeout(200)
    }

    await page.waitForTimeout(1500)

    // Verify data attribute is set
    const hasAttribute = await page.evaluate(() => {
      return Object.hasOwn(document.documentElement.dataset, 'hasThemeTapdance')
    })
    expect(hasAttribute).toBe(true)
  })
})
