import { expect, test } from '@playwright/test'
import {
  abortNoise,
  clearState,
  disableAnimations,
  disableSeasonalOverlays,
  gotoAndWaitForMain,
  showHeaderActions,
} from '../fixtures/test-helpers'

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
        const text = msg.text()
        // Filter out expected environment variable validation errors in test environment
        if (!text.includes('Invalid environment variables')) {
          errors.push(text)
        }
      }
    })

    await gotoAndWaitForMain(page, '/')

    expect(errors).toHaveLength(0)
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveTitle(/Kilian Tyler/)
  })

  test('should have proper landmark structure', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

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
    await gotoAndWaitForMain(page, '/')

    // Check for main heading
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()

    // Check for profile image
    const profileImage = page.getByAltText(/kilian/i).nth(1)
    await expect(profileImage).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')

    // Check for navigation menu
    const nav = page.getByRole('navigation', { name: /primary/i })
    await expect(nav).toBeVisible()

    // Check for key nav links
    const aboutLink = page.getByRole('menuitem', { name: 'About' })
    await expect(aboutLink).toBeVisible()
  })

  test('should display theme toggle button', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await showHeaderActions(page)

    const themeToggle = page.getByRole('button', { name: /toggle theme menu/i })
    await expect(themeToggle).toBeVisible()
  })

  test('should display social links', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await showHeaderActions(page)

    const githubLink = page.getByRole('banner').getByRole('link', { name: /github/i })
    await expect(githubLink).toBeVisible()

    const linkedinLink = page.getByRole('banner').getByRole('link', { name: /linkedin/i })
    await expect(linkedinLink).toBeVisible()
  })
})

test.describe('Home Page critters', () => {
  test('should keep the cheering scroll cue critter whole and under the achievement popup', async ({ page }) => {
    await clearState(page)
    await disableSeasonalOverlays(page)
    await abortNoise(page)
    await gotoAndWaitForMain(page, '/')
    await expect(page.locator('.scroll-cue[data-sunk="false"]')).toBeVisible()

    // An achievement appears: hold the critter at the top of its cheer and measure it
    const { critterTop, wellTop, popupBottom } = await page.evaluate(async () => {
      document.documentElement.dataset.critterMood = 'cheer'
      const critter = document.querySelector('.scroll-cue .slime-critter')!
      // Let it finish rising out of the pool first
      await Promise.all(critter.parentElement!.getAnimations().map(animation => animation.finished))
      await new Promise(requestAnimationFrame)
      for (const animation of critter.getAnimations()) {
        animation.pause()
        animation.currentTime = 245
      }
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
      return {
        critterTop: critter.getBoundingClientRect().top,
        wellTop: document.querySelector('.scroll-cue-well')!.getBoundingClientRect().top,
        // The popup sits 7.75rem above the bottom of the screen
        popupBottom: innerHeight - 7.75 * rem,
      }
    })

    expect(critterTop).toBeGreaterThanOrEqual(wellTop)
    expect(critterTop).toBeGreaterThanOrEqual(popupBottom)
  })
})
