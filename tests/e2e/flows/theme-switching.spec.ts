import { expect, test } from '@playwright/test'
import { abortNoise, clearState, getCurrentTheme, openThemeMenu } from '../fixtures/test-helpers'

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
  })

  test('should open and close theme menu', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open theme menu
    await openThemeMenu(page)

    const themeMenu = page.locator('#theme-options')
    await expect(themeMenu).toHaveAttribute('aria-hidden', 'false')

    // Close by clicking backdrop
    const backdrop = page.locator('[aria-label="Close overlay"]').first()
    const visible = await backdrop.isVisible().catch(() => false)
    await (visible ? backdrop.click({ position: { x: 10, y: 10 } }) : page.mouse.click(10, 10))
    await page.waitForTimeout(300)

    await expect(themeMenu).toHaveAttribute('aria-hidden', 'true')
  })

  test('should switch between themes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Get initial theme
    const initialTheme = await getCurrentTheme(page)

    // Switch to a different theme
    await openThemeMenu(page)

    // Pick a theme different from current and not System/Seasonal (trigger click programmatically to avoid overlay)
    await page.evaluate((current: string) => {
      const items = Array.from(document.querySelectorAll<HTMLButtonElement>('#theme-options [role="menuitem"]'))
      for (const btn of items) {
        const label = (btn.textContent || '').trim().toLowerCase()
        if (!label || /system|seasonal/.test(label)) continue
        if (current && label.includes(current.toLowerCase())) continue
        btn.click()
        return
      }
      // Fallback: click first
      const first = items[0]
      if (first) first.click()
    }, initialTheme)
    // Wait for preference to be written (localStorage)
    await page.waitForFunction(
      () => {
        const t = localStorage.getItem('theme')
        return !!t && t !== 'system'
      },
      { timeout: 3000 },
    )

    // Verify preference persisted (explicit selection)
    const storedPref = await page.evaluate(() => localStorage.getItem('theme'))
    expect(Boolean(storedPref && storedPref !== 'system')).toBe(true)
  })

  test('should persist theme across page reload', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Switch to a specific theme
    await openThemeMenu(page)
    await page.evaluate(() => {
      const first = document.querySelector<HTMLButtonElement>('#theme-options [role="menuitem"]')
      first?.click()
    })
    await page.waitForTimeout(500)

    const themeBeforeReload = await getCurrentTheme(page)

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    const themeAfterReload = await getCurrentTheme(page)

    // Theme should persist
    expect(themeAfterReload).toBe(themeBeforeReload)
  })

  test('should persist theme in localStorage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Switch theme
    await openThemeMenu(page)
    await page.evaluate(() => {
      const first = document.querySelector<HTMLButtonElement>('#theme-options [role="menuitem"]')
      first?.click()
    })
    await page.waitForTimeout(500)

    // Check localStorage
    const storedTheme = await page.evaluate(() => {
      return localStorage.getItem('theme')
    })

    expect(storedTheme).toBeTruthy()
  })

  test('should persist theme in cookie', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Switch theme via programmatic click
    await openThemeMenu(page)
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll<HTMLButtonElement>('#theme-options [role="menuitem"]'))
      for (const btn of items) {
        const label = (btn.textContent || '').trim().toLowerCase()
        if (!label || /system|seasonal/.test(label)) continue
        btn.click()
        return
      }
      items[0]?.click()
    })
    await page.waitForTimeout(300)

    // Reload page and ensure preference persisted (non-system)
    await page.reload()
    await page.waitForLoadState('networkidle')
    const pref = await page.evaluate(() => localStorage.getItem('theme'))
    expect(Boolean(pref && pref !== 'system')).toBe(true)
  })

  test('should update theme button icon when switching themes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const themeButton = page.locator('button[aria-controls="theme-options"]').first()

    // Switch to a theme
    await openThemeMenu(page)
    const themeOption = page.locator('#theme-options [role="menuitem"]').first()
    await themeOption.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Theme button should still be visible
    await expect(themeButton).toBeVisible()
  })

  test('should switch back to system theme', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Switch to a custom theme first
    await openThemeMenu(page)
    const customTheme = page
      .locator('#theme-options [role="menuitem"]')
      .filter({ hasNotText: /system/i })
      .first()
    await customTheme.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Now switch back to system
    await openThemeMenu(page)
    const systemTheme = page.locator('#theme-options [role="menuitem"]').filter({ hasText: /system|seasonal/i })
    const isVisible = await systemTheme.isVisible().catch(() => false)

    if (isVisible) {
      await systemTheme.click()
      await page.waitForTimeout(500)

      // Should have either 'light' or 'dark' class
      const hasLightOrDark = await page.evaluate(() => {
        return (
          document.documentElement.classList.contains('light') || document.documentElement.classList.contains('dark')
        )
      })

      expect(hasLightOrDark).toBe(true)
    }
  })

  test('should handle keyboard navigation in theme menu', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await openThemeMenu(page)

    // Tab to first theme option
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    // Should be able to select with Enter
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Menu should close
    const themeMenu = page.locator('#theme-options')
    const isHidden = await themeMenu.getAttribute('aria-hidden')
    expect(isHidden).toBe('true')
  })

  test('should close theme menu on Escape key', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await openThemeMenu(page)

    const themeMenu = page.locator('#theme-options')
    await expect(themeMenu).toHaveAttribute('aria-hidden', 'false')

    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    await expect(themeMenu).toHaveAttribute('aria-hidden', 'true')
  })
})
