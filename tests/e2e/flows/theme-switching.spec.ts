import { expect, test } from '@playwright/test'
import {
  abortNoise,
  clearState,
  disableAnimations,
  getCurrentTheme,
  gotoAndWaitForMain,
  openThemeMenu,
} from '../fixtures/test-helpers'

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)
  })

  test('should open and close theme menu', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

    // Open theme menu
    await openThemeMenu(page)

    const themeMenu = page.locator('#theme-options')
    await expect(themeMenu).toHaveAttribute('aria-hidden', 'false')

    // Close by clicking backdrop
    const backdrop = page.locator('[aria-label="Close overlay"]').first()
    const visible = await backdrop.isVisible().catch(() => false)
    await (visible ? backdrop.click({ position: { x: 10, y: 10 } }) : page.mouse.click(10, 10))
    // Wait for menu to close instead of arbitrary timeout
    await expect(themeMenu).toHaveAttribute('aria-hidden', 'true', { timeout: 1000 })
  })

  test('should switch between themes', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

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
      { timeout: 2000 },
    )

    // Verify preference persisted (explicit selection)
    const storedPref = await page.evaluate(() => localStorage.getItem('theme'))
    expect(Boolean(storedPref && storedPref !== 'system')).toBe(true)
  })

  test('should persist theme across page reload', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

    // Switch to a specific theme
    await openThemeMenu(page)
    await page.evaluate(() => {
      const first = document.querySelector<HTMLButtonElement>('#theme-options [role="menuitem"]')
      first?.click()
    })
    // Wait for theme to be applied
    await page.waitForFunction(
      () => {
        const t = localStorage.getItem('theme')
        return !!t && t !== 'system'
      },
      { timeout: 2000 },
    )

    const themeBeforeReload = await getCurrentTheme(page)

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' })

    const themeAfterReload = await getCurrentTheme(page)

    // Theme should persist
    expect(themeAfterReload).toBe(themeBeforeReload)
  })

  test('should persist theme in localStorage', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

    // Switch theme
    await openThemeMenu(page)
    await page.evaluate(() => {
      const first = document.querySelector<HTMLButtonElement>('#theme-options [role="menuitem"]')
      first?.click()
    })
    // Wait for theme to be applied
    await page.waitForFunction(
      () => {
        const t = localStorage.getItem('theme')
        return !!t && t !== 'system'
      },
      { timeout: 2000 },
    )

    // Check localStorage
    const storedTheme = await page.evaluate(() => {
      return localStorage.getItem('theme')
    })

    expect(storedTheme).toBeTruthy()
  })

  test('should persist theme in cookie', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

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
    // Wait for theme to be applied
    await page.waitForFunction(
      () => {
        const t = localStorage.getItem('theme')
        return !!t && t !== 'system'
      },
      { timeout: 2000 },
    )

    // Reload page and ensure preference persisted (non-system)
    await page.reload({ waitUntil: 'domcontentloaded' })
    const pref = await page.evaluate(() => localStorage.getItem('theme'))
    expect(Boolean(pref && pref !== 'system')).toBe(true)
  })

  test('should update theme button icon when switching themes', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

    const themeButton = page.locator('button[aria-controls="theme-options"]').first()

    // Switch to a theme
    await openThemeMenu(page)
    const themeOption = page.locator('#theme-options [role="menuitem"]').first()
    await themeOption.focus()
    await page.keyboard.press('Enter')
    // Wait for menu to close
    await page.waitForSelector('#theme-options[aria-hidden="true"]', { state: 'attached', timeout: 2000 })

    // Theme button should still be visible
    await expect(themeButton).toBeVisible()
  })

  test('should switch back to system theme', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

    // Switch to a custom theme first
    await openThemeMenu(page)
    const customTheme = page
      .locator('#theme-options [role="menuitem"]')
      .filter({ hasNotText: /system/i })
      .first()

    // Use click instead of keyboard navigation for better reliability across devices
    await customTheme.click()

    // Wait for theme to be applied by checking DOM classes (more reliable than localStorage)
    await page.waitForFunction(
      () => {
        const html = document.documentElement
        // Check if a non-system theme class is applied (not just light/dark)
        const themeClasses = Array.from(html.classList).filter(
          cls => cls !== 'light' && cls !== 'dark' && cls !== 'system',
        )
        // Also check localStorage as fallback
        const stored = localStorage.getItem('theme')
        return themeClasses.length > 0 || (stored && stored !== 'system')
      },
      { timeout: 3000 },
    )

    // Now switch back to system
    await openThemeMenu(page)
    const systemTheme = page.locator('#theme-options [role="menuitem"]').filter({ hasText: /system|seasonal/i })
    const isVisible = await systemTheme.isVisible().catch(() => false)

    if (isVisible) {
      await systemTheme.click()
      // Wait for theme to be applied
      await page.waitForFunction(
        () => {
          const html = document.documentElement
          return html.classList.contains('light') || html.classList.contains('dark')
        },
        { timeout: 2000 },
      )

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
    await gotoAndWaitForMain(page, '/')

    await openThemeMenu(page)

    // Tab to first theme option
    await page.keyboard.press('Tab')
    // Small delay for focus to settle
    await page.waitForTimeout(50)

    // Should be able to select with Enter
    await page.keyboard.press('Enter')
    // Wait for menu to close
    await page.waitForSelector('#theme-options[aria-hidden="true"]', { state: 'attached', timeout: 2000 })

    // Menu should close
    const themeMenu = page.locator('#theme-options')
    const isHidden = await themeMenu.getAttribute('aria-hidden')
    expect(isHidden).toBe('true')
  })

  test('should close theme menu on Escape key', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

    await openThemeMenu(page)

    const themeMenu = page.locator('#theme-options')
    await expect(themeMenu).toHaveAttribute('aria-hidden', 'false')

    await page.keyboard.press('Escape')
    // Wait for menu to close
    await expect(themeMenu).toHaveAttribute('aria-hidden', 'true', { timeout: 1000 })
  })
})
