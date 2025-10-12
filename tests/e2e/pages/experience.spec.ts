import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains } from '../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations } from '../fixtures/test-helpers'

test.describe('Experience Page', () => {
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

    await page.goto('/experience')
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/experience')
    await expect(page).toHaveTitle(/Experience.*Kilian Tyler/)
  })

  test('should have proper landmark structure', async ({ page }) => {
    await page.goto('/experience')
    await page.waitForLoadState('networkidle')

    const header = page.getByRole('banner')
    await expect(header).toBeVisible()

    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
  })

  test('should display work history', async ({ page }) => {
    await page.goto('/experience')
    await page.waitForLoadState('networkidle')

    // Check for content sections
    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    // Should have work history section label present
    await expect(page.getByText('Where I’ve been', { exact: true })).toBeVisible()
  })

  test('should unlock EXPERIENCE_EXPLORER achievement on visit', async ({ page }) => {
    await page.goto('/experience')
    await page.waitForLoadState('networkidle')

    // Wait for achievement to be processed
    await page.waitForTimeout(1000)

    await expectAchievementCookieContains(page, 'EXPERIENCE_EXPLORER')
  })
})
