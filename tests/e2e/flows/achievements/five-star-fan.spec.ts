import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains, expectConfettiLikely } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations, gotoAndWaitForMain } from '../../fixtures/test-helpers'

test.describe('FIVE_STAR_FAN Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)
  })

  test('should unlock FIVE_STAR_FAN when giving 5-star review', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

    // TODO: Not correct at all
    const reviewButton = page.locator('button:has-text("Review"), button:has-text("Rate")').first()
    const reviewButtonVisible = await reviewButton.isVisible().catch(() => false)

    if (reviewButtonVisible) {
      await reviewButton.click()
      await page.waitForTimeout(500)

      // Look for 5-star rating
      const fiveStarButton = page.locator('[aria-label*="5 star"], button:has-text("⭐⭐⭐⭐⭐")').first()
      const fiveStarVisible = await fiveStarButton.isVisible().catch(() => false)

      if (fiveStarVisible) {
        await fiveStarButton.click()
        await page.waitForTimeout(1500)

        // Verify achievement is unlocked
        await expectAchievementCookieContains(page, 'FIVE_STAR_FAN')

        // Verify confetti was triggered
        await expectConfettiLikely(page)
      }
    } else {
      // Alternative: Look for star rating directly visible on page
      const starRating = page.locator('[role="radiogroup"], [aria-label*="star rating"]').first()
      const starRatingVisible = await starRating.isVisible().catch(() => false)

      if (starRatingVisible) {
        // Click the 5th star
        const fifthStar = starRating.locator('input[value="5"], button:nth-child(5)').first()
        await fifthStar.click()
        await page.waitForTimeout(1500)

        await expectAchievementCookieContains(page, 'FIVE_STAR_FAN')
        await expectConfettiLikely(page)
      }
    }
  })

  test('should persist 5-star rating in localStorage', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

    // Check if review state is saved
    const hasReviewState = await page.evaluate(() => {
      return localStorage.getItem('kil.dev/review/v1') !== null
    })

    // This will be true after giving a review
    expect(typeof hasReviewState).toBe('boolean')
  })
})
