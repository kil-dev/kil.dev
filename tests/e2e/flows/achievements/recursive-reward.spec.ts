import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains, getUnlockedAchievementCount } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState } from '../../fixtures/test-helpers'

test.describe('RECURSIVE_REWARD Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
  })

  test('should unlock RECURSIVE_REWARD after unlocking 3 other achievements', async ({ page }) => {
    // First visit home to mount provider properly
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const initialCount = await getUnlockedAchievementCount(page)
    expect(initialCount).toBe(0)

    // Visit About page - unlock first achievement
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const count1 = await getUnlockedAchievementCount(page)
    expect(count1).toBe(1)

    // Visit Experience page - unlock second achievement
    await page.goto('/experience')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const count2 = await getUnlockedAchievementCount(page)
    expect(count2).toBe(2)

    // Visit Projects page - unlock third achievement
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait a bit longer for RECURSIVE_REWARD to trigger

    // Should now have 4 achievements (3 + RECURSIVE_REWARD)
    const finalCount = await getUnlockedAchievementCount(page)
    expect(finalCount).toBe(4)

    // Verify RECURSIVE_REWARD is unlocked
    await expectAchievementCookieContains(page, 'RECURSIVE_REWARD')
  })

  test('should make achievements nav link visible after RECURSIVE_REWARD', async ({ page }) => {
    // First visit home to mount provider
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Unlock 3 achievements to trigger RECURSIVE_REWARD
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.goto('/experience')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Navigate to home to check for achievements link
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Achievements link should now be visible
    const achievementsLink = page.locator('.js-achievements-nav')
    await expect(achievementsLink).toBeVisible()
  })
})
