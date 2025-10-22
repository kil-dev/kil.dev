import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains } from '../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations, gotoAndWaitForMain } from '../fixtures/test-helpers'

test.describe('Projects Page', () => {
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

    await gotoAndWaitForMain(page, '/projects')

    expect(errors).toHaveLength(0)
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveTitle(/Projects.*Kilian Tyler/)
  })

  test('should have proper landmark structure', async ({ page }) => {
    await gotoAndWaitForMain(page, '/projects')

    const header = page.getByRole('banner')
    await expect(header).toBeVisible()

    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
  })

  test('should display projects content', async ({ page }) => {
    await gotoAndWaitForMain(page, '/projects')

    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    // Should have projects heading or content (target the content heading specifically)
    await expect(page.getByText("Some projects I've worked on", { exact: true })).toBeVisible()
  })

  test('should unlock PROJECTS_PERUSER achievement on visit', async ({ page }) => {
    await gotoAndWaitForMain(page, '/projects')

    // Wait for achievement to be processed
    await page.waitForTimeout(1000)

    await expectAchievementCookieContains(page, 'PROJECTS_PERUSER')
  })
})
