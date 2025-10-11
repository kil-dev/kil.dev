import { expect, type Page } from '@playwright/test'

const ACHIEVEMENTS_COOKIE_NAME = 'kil.dev_achievements_v1'

/**
 * Check if an achievement is unlocked by reading the cookie
 */
export async function expectAchievementCookieContains(page: Page, achievementId: string) {
  const cookies = await page.context().cookies()
  const achievementCookie = cookies.find(c => c.name === ACHIEVEMENTS_COOKIE_NAME)
  expect(achievementCookie, `Achievement cookie should exist`).toBeDefined()

  if (achievementCookie) {
    const decoded = decodeURIComponent(achievementCookie.value)
    const parsed = JSON.parse(decoded) as Record<string, unknown>
    expect(parsed, `Achievement ${achievementId} should be in cookie`).toHaveProperty(achievementId)
    expect(typeof parsed[achievementId], `Achievement ${achievementId} should have timestamp`).toBe('string')
  }
}

/**
 * Check if an achievement is unlocked in localStorage
 */
export async function expectAchievementInLocalStorage(page: Page, achievementId: string) {
  const hasAchievement = await page.evaluate(id => {
    const stored = localStorage.getItem('kil.dev/achievements/v1')
    if (!stored) return false
    try {
      const parsed = JSON.parse(stored) as Record<string, unknown>
      return Boolean(parsed[id])
    } catch {
      return false
    }
  }, achievementId)

  expect(hasAchievement, `Achievement ${achievementId} should be in localStorage`).toBe(true)
}

/**
 * Check if an achievement data attribute is set on the HTML element
 */
export async function expectAchievementDataAttribute(page: Page, achievementId: string) {
  const kebabId = achievementId.toLowerCase().replaceAll('_', '-')
  const hasAttribute = await page.evaluate(id => {
    return document.documentElement.hasAttribute(`data-achievement-${id}`)
  }, kebabId)

  expect(hasAttribute, `Achievement data-achievement-${kebabId} attribute should be set`).toBe(true)
}

/**
 * Simulate the Konami code sequence: ↑↑↓↓←→←→BA
 */
export async function simulateKonamiCode(page: Page) {
  const sequence = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ]

  for (const key of sequence) {
    await page.keyboard.press(key)
    await page.waitForTimeout(50)
  }

  // Wait for animation to trigger
  await page.waitForTimeout(500)
}

/**
 * Check if confetti is likely playing (heuristic: canvas element presence)
 */
export async function expectConfettiLikely(page: Page) {
  // Confetti library adds canvas elements to the body
  const hasCanvas = await page.locator('body > canvas').count()
  expect(hasCanvas, 'Confetti canvas should be present').toBeGreaterThan(0)
}

/**
 * Check if achievement toast notification appeared
 */
export async function expectAchievementToast(page: Page, achievementTitle: string) {
  const toast = page.locator('[data-sonner-toast]').filter({ hasText: achievementTitle })
  await expect(toast).toBeVisible({ timeout: 5000 })
}

/**
 * Wait for any achievement toast to appear and disappear
 */
export async function waitForAchievementToast(page: Page) {
  // Wait for toast to appear
  await page.waitForSelector('[data-sonner-toast]', { state: 'visible', timeout: 5000 })
  // Wait for it to disappear or timeout
  await page.waitForTimeout(4500)
}

/**
 * Get the count of unlocked achievements from localStorage
 */
export async function getUnlockedAchievementCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const stored = localStorage.getItem('kil.dev/achievements/v1')
    if (!stored) return 0
    try {
      const parsed = JSON.parse(stored) as Record<string, unknown>
      return Object.keys(parsed).length
    } catch {
      return 0
    }
  })
}

/**
 * Flip all pet cards on the About page to trigger PET_PARADE achievement
 */
export async function flipAllPetCards(page: Page) {
  // Navigate to about page
  await page.goto('/about')
  await page.waitForLoadState('networkidle')

  // Scroll to pets section
  const petsSection = page.getByText('These are my pets')
  await petsSection.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)

  // Find all pet cards and flip them
  const petCards = page.locator('[aria-label*="Toggle details for"]')
  const count = await petCards.count()

  for (let i = 0; i < count; i++) {
    const card = petCards.nth(i)
    await card.scrollIntoViewIfNeeded()
    await card.click()
    await page.waitForTimeout(400) // Wait for flip animation
  }

  await page.waitForTimeout(500)
}
