import { expect, test } from '@playwright/test'
import {
  expectAchievementCookieContains,
  expectConfettiLikely,
  flipAllPetCards,
} from '../../fixtures/achievement-helpers'
import { abortNoise, clearState } from '../../fixtures/test-helpers'

test.describe('PET_PARADE Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    // Do not fully disable animations here; confetti requires motion
  })

  test('should unlock PET_PARADE after flipping all pet cards', async ({ page }) => {
    await flipAllPetCards(page)

    // Wait for achievement to process
    await page.waitForTimeout(1500)

    // Verify achievement is unlocked
    await expectAchievementCookieContains(page, 'PET_PARADE')

    // Verify confetti was triggered (pet parade has confetti)
    await expectConfettiLikely(page)
  })

  test('should make pet gallery nav link visible after PET_PARADE', async ({ page }) => {
    await flipAllPetCards(page)

    await page.waitForTimeout(1500)

    // Navigate to home to check for pet gallery link
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Pet gallery link should now be visible
    const petGalleryLink = page.locator('.js-pet-gallery-nav')
    await expect(petGalleryLink).toBeVisible()
  })

  test('should set data-has-pet-gallery attribute after unlock', async ({ page }) => {
    await flipAllPetCards(page)

    await page.waitForTimeout(1500)

    const hasAttribute = await page.evaluate(() => {
      return Object.hasOwn(document.documentElement.dataset, 'hasPetGallery')
    })

    expect(hasAttribute).toBe(true)
  })

  test('should require all pets to be flipped', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    // Scroll to pets section
    const petsSection = page.getByText('These are my pets')
    await petsSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)

    // Flip only some pet cards (not all)
    const petCards = page.locator('[aria-label*="Toggle details for"]')
    const count = await petCards.count()

    // Flip only half
    for (let i = 0; i < Math.floor(count / 2); i++) {
      const card = petCards.nth(i)
      await card.scrollIntoViewIfNeeded()
      await card.click()
      await page.waitForTimeout(400)
    }

    await page.waitForTimeout(1000)

    // Should NOT be unlocked yet
    const cookies = await page.context().cookies()
    const achievementCookie = cookies.find(c => c.name === 'kil.dev_achievements_v1')

    if (achievementCookie) {
      const decoded = decodeURIComponent(achievementCookie.value)
      const parsed = JSON.parse(decoded) as Record<string, unknown>
      expect(parsed).not.toHaveProperty('PET_PARADE')
    }
  })
})
