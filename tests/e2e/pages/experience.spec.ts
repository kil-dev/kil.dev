import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains } from '../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations, gotoAndWaitForMain } from '../fixtures/test-helpers'

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
        const text = msg.text()
        // Filter out expected environment variable validation errors in test environment
        if (!text.includes('Invalid environment variables')) {
          errors.push(text)
        }
      }
    })

    await gotoAndWaitForMain(page, '/experience')

    expect(errors).toHaveLength(0)
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/experience', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveTitle(/Experience.*Kilian Tyler/)
  })

  test('should have proper landmark structure', async ({ page }) => {
    await gotoAndWaitForMain(page, '/experience')

    const header = page.getByRole('banner')
    await expect(header).toBeVisible()

    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
  })

  test('should display work history', async ({ page }) => {
    await gotoAndWaitForMain(page, '/experience')

    // Check for content sections
    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    // Should have work history section label present
    await expect(page.getByText('Where I’ve been', { exact: true })).toBeVisible()
  })

  test('should unlock EXPERIENCE_EXPLORER achievement on visit', async ({ page }) => {
    await gotoAndWaitForMain(page, '/experience')

    // Wait for achievement to be processed
    await page.waitForTimeout(1000)

    await expectAchievementCookieContains(page, 'EXPERIENCE_EXPLORER')
  })
})
