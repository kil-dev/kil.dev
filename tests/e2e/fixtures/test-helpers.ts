import type { Page } from '@playwright/test'

/**
 * Clear all state (localStorage, sessionStorage, cookies) to ensure test isolation
 * Note: This should be called after navigating to a page, or it will navigate to base URL first
 */
export async function clearState(page: Page) {
  await page.context().clearCookies()

  // Navigate to base URL if not already on a page (to access localStorage)
  const currentUrl = page.url()
  if (!currentUrl || currentUrl === 'about:blank' || currentUrl === '') {
    try {
      await page.goto('/')
    } catch {
      // Retry once after a short delay if server isn't ready yet
      await page.waitForTimeout(300)
      try {
        await page.goto('/')
      } catch {}
    }
  }

  // Now clear storage (wrapping in try-catch for safety)
  await page.evaluate(() => {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {
      // Ignore if localStorage is not accessible
    }
  })
}

/**
 * Disable animations and transitions for more stable and faster tests
 */
export async function disableAnimations(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  })
}

/**
 * Block analytics and external noise to keep tests hermetic
 */
export async function abortNoise(page: Page) {
  // Instead of aborting (which logs console errors), fulfill with 204 to keep console clean
  const fulfillNoContent = async (route: {
    fulfill: (opts: { status: number; body: string; headers: Record<string, string> }) => Promise<void>
    abort: () => Promise<void>
  }) => {
    try {
      await route.fulfill({ status: 204, body: '', headers: { 'content-type': 'text/plain' } })
    } catch {
      try {
        await route.abort()
      } catch {}
    }
  }
  await page.route('https://app.posthog.com/**', fulfillNoContent)
  await page.route('**/vibecheck/**', fulfillNoContent)
  await page.route('https://cdn.**', fulfillNoContent)
}

/**
 * Wait for page to be idle (useful after navigation or animation-heavy actions)
 */
export async function waitForIdle(page: Page, timeout = 500) {
  await page.waitForTimeout(timeout)
}

/**
 * Open the theme menu
 */
export async function openThemeMenu(page: Page) {
  // Select by aria-controls as the button has no accessible name
  const themeButton = page.locator('button[aria-controls="theme-options"]')
  await themeButton.first().click()
  await page.waitForSelector('[role="menu"][aria-label="Select theme"]', { state: 'visible' })
}

/**
 * Close the theme menu if it's open
 */
export async function closeThemeMenu(page: Page) {
  // Prefer closing via the trigger button to ensure the app's toggle-close logic runs
  // This increments the internal open/close counter used for THEME_TAPDANCE
  const menuOpen = await page
    .locator('#theme-options[aria-hidden="false"]')
    .isVisible()
    .catch(() => false)

  if (!menuOpen) return

  const trigger = page.locator('button[aria-controls="theme-options"]').first()
  await trigger.click()
  await page.waitForTimeout(300)
}

/**
 * Toggle to a specific theme
 */
export async function toggleTheme(page: Page, themeName: string) {
  await openThemeMenu(page)
  const themeOption = page.getByRole('menuitem', { name: themeName })
  await themeOption.click()
  await page.waitForTimeout(500)
}

/**
 * Get current theme from HTML class
 */
export async function getCurrentTheme(page: Page): Promise<string> {
  return page.evaluate(() => {
    const html = document.documentElement
    // Prefer explicit applied theme reported by runtime
    const applied = html.dataset.appliedTheme
    if (applied && applied !== 'light' && applied !== 'dark') return applied
    const pref = html.dataset.themePref
    if (pref && pref !== 'system') return pref
    if (html.classList.contains('dark')) return 'dark'
    if (html.classList.contains('light')) return 'light'
    return 'light'
  })
}
