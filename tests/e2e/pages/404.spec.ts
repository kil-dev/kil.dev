import { expect, test } from '@playwright/test'
import { abortNoise, clearState, disableAnimations } from '../fixtures/test-helpers'

test.describe('404 Not Found Page', () => {
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

    await page.goto('/this-page-does-not-exist', { waitUntil: 'domcontentloaded' })
    const heading = page.getByRole('heading', { name: '404' })
    await expect(heading).toBeVisible()

    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatch(/404|not found/i)
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')
    await expect(page).toHaveTitle(/404.*not found/i)
  })

  test('should display 404 error message', async ({ page }) => {
    await page.goto('/this-page-does-not-exist', { waitUntil: 'domcontentloaded' })

    // Check for 404 heading
    const heading = page.getByRole('heading', { name: '404' })
    await expect(heading).toBeVisible()

    // Check for error message
    await expect(page.getByText(/page not found/i)).toBeVisible()
  })

  test('should have link to go home', async ({ page }) => {
    await page.goto('/this-page-does-not-exist', { waitUntil: 'domcontentloaded' })

    const homeLink = page.getByRole('link', { name: /home page/i })
    await expect(homeLink).toBeVisible()
    await expect(homeLink).toHaveAttribute('href', '/')
  })
})
