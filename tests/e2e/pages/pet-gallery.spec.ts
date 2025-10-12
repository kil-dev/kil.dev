import { expect, test } from '@playwright/test'
import { abortNoise, clearState, disableAnimations } from '../fixtures/test-helpers'

test.describe('Pet Gallery Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)

    // Unlock PET_PARADE so we can access the pet gallery page
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem(
        'kil.dev/achievements/v1',
        JSON.stringify({
          PET_PARADE: new Date().toISOString(),
        }),
      )
      document.documentElement.dataset.hasPetGallery = 'true'
    })
  })

  test('should render without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/pet-gallery')
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/pet-gallery')
    await expect(page).toHaveTitle(/Pet Gallery.*Kilian Tyler/)
  })

  test('should have proper landmark structure', async ({ page }) => {
    await page.goto('/pet-gallery')
    await page.waitForLoadState('networkidle')

    const header = page.getByRole('banner')
    await expect(header).toBeVisible()

    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
  })

  test('should display pet gallery heading', async ({ page }) => {
    await page.goto('/pet-gallery')
    await page.waitForLoadState('networkidle')

    // There are multiple matches (nav + heading); assert the heading text specifically
    await expect(page.locator('main').getByText('Pet gallery', { exact: true })).toBeVisible()
  })

  test('should display gallery images', async ({ page }) => {
    await page.goto('/pet-gallery')
    await page.waitForLoadState('networkidle')

    // Wait for images to load
    await page.waitForTimeout(1000)

    // Check for gallery images
    // Count gallery items in server or client album containers
    // Try react-photo-album rendered images (NextImage renders img tags)
    const albumImages = page.locator('main img[alt]')
    const count = await albumImages.count().catch(() => 0)
    expect(count).toBeGreaterThan(0)
  })
})
