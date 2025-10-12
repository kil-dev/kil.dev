import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains } from '../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations } from '../fixtures/test-helpers'

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)
  })

  test('should render without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveTitle(/About.*Kilian Tyler/)
  })

  test('should have proper landmark structure', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    const header = page.getByRole('banner')
    await expect(header).toBeVisible()

    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
  })

  test('should display about me content', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    // Check for main content sections
    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    // Check for quick facts or similar sections
    await expect(page.locator('text=/location|birthday|pets/i').first()).toBeVisible()
  })

  test('should display pets section', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    // Scroll to pets section
    const petsHeading = page.getByText(/these are my pets/i)
    await petsHeading.scrollIntoViewIfNeeded()
    await expect(petsHeading).toBeVisible()

    // Check for pet cards
    const petCards = page.locator('[aria-label*="Toggle details for"]')
    const count = await petCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should unlock ABOUT_AMBLER achievement on visit', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    // Wait for achievement to be processed
    await page.waitForTimeout(1000)

    await expectAchievementCookieContains(page, 'ABOUT_AMBLER')
  })
})
