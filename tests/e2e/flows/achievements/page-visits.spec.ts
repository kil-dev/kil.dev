import { expect, test } from '@playwright/test'
import {
  expectAchievementCookieContains,
  expectAchievementInLocalStorage,
  getUnlockedAchievementCount,
} from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, gotoAndWaitForMain } from '../../fixtures/test-helpers'

test.describe('Page Visit Achievements', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
  })

  test('should unlock ABOUT_AMBLER on first visit to About page', async ({ page }) => {
    // First visit home page to ensure provider mounts properly (fixes race condition)
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(2000) // Wait for full React hydration

    // Now visit About page
    await gotoAndWaitForMain(page, '/about')
    await page.waitForTimeout(2000) // Wait for achievement to unlock

    // Verify achievement is unlocked
    // Note: Toast notifications are not tested because Sonner's <Toaster /> component
    // doesn't render in Next.js production builds within Playwright test environment.
    // Achievements still unlock correctly (verified via cookies/localStorage).
    await expectAchievementCookieContains(page, 'ABOUT_AMBLER')
    await expectAchievementInLocalStorage(page, 'ABOUT_AMBLER')
  })

  test('should unlock EXPERIENCE_EXPLORER on first visit to Experience page', async ({ page }) => {
    // First visit home page to ensure provider mounts properly
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(2000)

    // Now visit Experience page
    await gotoAndWaitForMain(page, '/experience')
    await page.waitForTimeout(2000)

    await expectAchievementCookieContains(page, 'EXPERIENCE_EXPLORER')
    await expectAchievementInLocalStorage(page, 'EXPERIENCE_EXPLORER')
  })

  test('should unlock PROJECTS_PERUSER on first visit to Projects page', async ({ page }) => {
    // First visit home page to ensure provider mounts properly
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(2000)

    // Now visit Projects page
    await gotoAndWaitForMain(page, '/projects')
    await page.waitForTimeout(2000)

    await expectAchievementCookieContains(page, 'PROJECTS_PERUSER')
    await expectAchievementInLocalStorage(page, 'PROJECTS_PERUSER')
  })

  test('should not unlock achievements on subsequent visits', async ({ page }) => {
    // First visit home to mount provider
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(2000)

    // First visit to About
    await gotoAndWaitForMain(page, '/about')
    await page.waitForTimeout(2000)

    const count1 = await getUnlockedAchievementCount(page)
    expect(count1).toBe(1)

    // Second visit to About
    await gotoAndWaitForMain(page, '/')
    await gotoAndWaitForMain(page, '/about')
    await page.waitForTimeout(2000)

    const count2 = await getUnlockedAchievementCount(page)

    // Should have same count
    expect(count2).toBe(count1)
  })
})
