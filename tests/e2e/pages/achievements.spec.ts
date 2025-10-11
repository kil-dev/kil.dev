import { expect, test } from '@playwright/test'
import { abortNoise, clearState, disableAnimations } from '../fixtures/test-helpers'

test.describe('Achievements Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)

    // Unlock RECURSIVE_REWARD so we can access the achievements page
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem(
        'kil.dev/achievements/v1',
        JSON.stringify({
          ABOUT_AMBLER: new Date().toISOString(),
          EXPERIENCE_EXPLORER: new Date().toISOString(),
          PROJECTS_PERUSER: new Date().toISOString(),
          RECURSIVE_REWARD: new Date().toISOString(),
        }),
      )
      document.documentElement.dataset.hasAchievements = 'true'
    })
  })

  test('should render without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/achievements')
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })

  test('should have proper landmark structure', async ({ page }) => {
    await page.goto('/achievements')
    await page.waitForLoadState('networkidle')

    const header = page.getByRole('banner')
    await expect(header).toBeVisible()

    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
  })

  test('should display achievement cards', async ({ page }) => {
    await page.goto('/achievements')
    await page.waitForLoadState('networkidle')

    // Check for achievements heading
    await expect(page.getByText(/dopamine hits/i)).toBeVisible()

    // Check for achievement cards (there should be multiple)
    const achievementCards = page.locator('[id^="ach-card-"]')
    const count = await achievementCards.count()
    expect(count).toBeGreaterThan(5)
  })

  test('should show unlocked achievements with unlock indicator', async ({ page }) => {
    await page.goto('/achievements')
    await page.waitForLoadState('networkidle')

    // Find an unlocked achievement card
    const unlockedCard = page.locator('[id="ach-card-about-ambler"]')
    await expect(unlockedCard).toBeVisible()
  })

  test('should have reset button', async ({ page }) => {
    await page.goto('/achievements')
    await page.waitForLoadState('networkidle')

    const resetButton = page.getByRole('button', { name: /reset/i })
    await expect(resetButton).toBeVisible()
  })
})
