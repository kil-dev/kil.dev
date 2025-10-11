import { expect, test } from '@playwright/test'
import { abortNoise, clearState, disableAnimations } from '../fixtures/test-helpers'

test.describe('418 Teapot Page', () => {
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

    await page.goto('/418')
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/418')
    await expect(page).toHaveTitle(/418.*teapot/i)
  })

  test('should display teapot message', async ({ page }) => {
    await page.goto('/418')
    await page.waitForLoadState('networkidle')

    // Check for teapot message
    await expect(page.getByText(/i'm a teapot/i)).toBeVisible()

    await expect(page.getByText(/refuses to brew coffee/i)).toBeVisible()
  })

  test('should display teapot image', async ({ page }) => {
    await page.goto('/418')
    await page.waitForLoadState('networkidle')

    const teapotImage = page.getByAltText(/teapot/i)
    await expect(teapotImage).toBeVisible()
  })

  test('should have link to go home', async ({ page }) => {
    await page.goto('/418')
    await page.waitForLoadState('networkidle')

    const homeLink = page.getByRole('link', { name: /home page/i })
    await expect(homeLink).toBeVisible()
    await expect(homeLink).toHaveAttribute('href', '/')
  })

  test('should have shop tea link', async ({ page }) => {
    await page.goto('/418')
    await page.waitForLoadState('networkidle')

    const shopLink = page.getByRole('link', { name: /tea/i })
    await expect(shopLink).toBeVisible()
  })
})
