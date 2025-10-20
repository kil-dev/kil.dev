import { expect, test } from '@playwright/test'
import { abortNoise, clearState, disableAnimations, disableSeasonalOverlays } from '../fixtures/test-helpers'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await disableSeasonalOverlays(page)
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

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Kilian Tyler/)
  })

  test('should have proper landmark structure', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for header
    const header = page.getByRole('banner')
    await expect(header).toBeVisible()

    // Check for main content
    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    // Check for footer
    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
  })

  test('should display hero content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for main heading
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()

    // Check for profile image
    const profileImage = page.getByAltText(/kilian/i).nth(1)
    await expect(profileImage).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check for navigation menu
    const nav = page.getByRole('navigation', { name: /primary/i })
    await expect(nav).toBeVisible()

    // Check for key nav links
    const aboutLink = page.getByRole('menuitem', { name: 'About' })
    await expect(aboutLink).toBeVisible()
  })

  test('should display theme toggle button', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const themeToggle = page.getByRole('button', { name: /toggle theme menu/i })
    await expect(themeToggle).toBeVisible()
  })

  test('should display social links', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const githubLink = page.getByRole('link', { name: /github/i })
    await expect(githubLink).toBeVisible()

    const linkedinLink = page.getByRole('link', { name: /linkedin/i })
    await expect(linkedinLink).toBeVisible()
  })
})
