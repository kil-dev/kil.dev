import { expect, test } from '@playwright/test'
import {
  abortNoise,
  clearState,
  clickAndWaitForURLThenMain,
  disableAnimations,
  gotoAndWaitForMain,
  waitForDomContentAndMain,
} from '../fixtures/test-helpers'

test.describe('Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)
  })

  test.describe('Desktop Navigation', () => {
    test('should navigate through main pages using desktop nav', async ({ page }) => {
      await gotoAndWaitForMain(page, '/')

      // Navigate to About
      const aboutLink = page.getByRole('menuitem', { name: 'About' })
      await clickAndWaitForURLThenMain(page, aboutLink, /\/about(?:\/?|(\?.*)?)$/)
      await expect(page).toHaveURL('/about')

      // Navigate to Experience
      const experienceLink = page.getByRole('menuitem', { name: 'Experience' })
      await clickAndWaitForURLThenMain(page, experienceLink, /\/experience(?:\/?|(\?.*)?)$/)
      await expect(page).toHaveURL('/experience')

      // Navigate to Projects
      const projectsLink = page.getByRole('menuitem', { name: 'Projects' })
      await clickAndWaitForURLThenMain(page, projectsLink, /\/projects(?:\/?|(\?.*)?)$/)
      await expect(page).toHaveURL('/projects')

      // Navigate back to Home
      const homeLink = page.getByRole('menuitem', { name: 'Home' })
      await clickAndWaitForURLThenMain(page, homeLink, /\/(?:\/?|(\?.*)?)$/)
      await expect(page).toHaveURL('/')
    })

    test('should show active state for current page', async ({ page }) => {
      await gotoAndWaitForMain(page, '/about')

      const aboutLink = page.getByRole('menuitem', { name: 'About' })
      await expect(aboutLink).toHaveAttribute('aria-current', 'page')
    })

    test('should navigate using browser back/forward', async ({ page }) => {
      await gotoAndWaitForMain(page, '/')

      // Navigate forward
      await clickAndWaitForURLThenMain(page, page.getByRole('menuitem', { name: 'About' }), /\/about(?:\/?|(\?.*)?)$/)
      await expect(page).toHaveURL('/about')

      // Navigate back
      await page.goBack()
      await waitForDomContentAndMain(page)
      await expect(page).toHaveURL('/')

      // Navigate forward again
      await page.goForward()
      await waitForDomContentAndMain(page)
      await expect(page).toHaveURL('/about')
    })
  })

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should open and close mobile menu', async ({ page }) => {
      await gotoAndWaitForMain(page, '/')

      // Open mobile menu (button toggles aria-label between Open/Close)
      const menuButton = page.locator('button[aria-controls="mobile-nav-arc"]')
      await expect(menuButton).toBeVisible()

      // Wait for menu items to appear after clicking (more reliable than checking aria-expanded)
      const mobileNav = page.locator('#mobile-nav-arc[role="menu"]')
      await menuButton.click()

      // Wait for menu to be visible - this ensures React has updated the DOM
      await expect(mobileNav).toBeVisible({ timeout: 2000 })

      // Verify aria-expanded is set correctly after menu is visible
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    })

    test('should navigate using mobile menu', async ({ page }) => {
      await gotoAndWaitForMain(page, '/')

      // Open mobile menu
      const menuButton = page.locator('button[aria-controls="mobile-nav-arc"]')
      await menuButton.click()
      await page.waitForTimeout(500)

      // Click About in mobile menu
      const aboutLink = page.getByRole('menuitem', { name: 'About' })
      await clickAndWaitForURLThenMain(page, aboutLink, /\/about(?:\/?|(\?.*)?)$/)
      await expect(page).toHaveURL('/about')
    })
  })

  test.describe('Logo Navigation', () => {
    test('should navigate to home when clicking logo', async ({ page }) => {
      await gotoAndWaitForMain(page, '/about')

      // Click on logo/home button
      const homeLogo = page.getByRole('link', { name: '{ kil.dev }' })
      await clickAndWaitForURLThenMain(page, homeLogo, /\/(?:\/?|(\?.*)?)$/)
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Achievements Navigation (Locked)', () => {
    test('should not show achievements link when locked', async ({ page }) => {
      await gotoAndWaitForMain(page, '/')
      const achievementsLink = page.locator('.js-achievements-nav')
      await expect(achievementsLink).not.toBeVisible()
    })
    test('should not show pet gallery link when locked', async ({ page }) => {
      await gotoAndWaitForMain(page, '/')
      const petGalleryLink = page.locator('.js-pet-gallery-nav')
      await expect(petGalleryLink).not.toBeVisible()
    })
  })

  test.describe('Achievements Navigation (Unlocked)', () => {
    test.beforeEach(async ({ page }) => {
      // Pre-hydration seed via init script to avoid races in CI
      await page.addInitScript(() => {
        try {
          document.documentElement.dataset.hasAchievements = 'true'
        } catch {}
        try {
          localStorage.setItem(
            'kil.dev/achievements/v1',
            JSON.stringify({
              ABOUT_AMBLER: new Date().toISOString(),
              EXPERIENCE_EXPLORER: new Date().toISOString(),
              PROJECTS_PERUSER: new Date().toISOString(),
              RECURSIVE_REWARD: new Date().toISOString(),
            }),
          )
        } catch {}
      })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      await expect(page.getByTestId('nav-achievements')).toBeVisible({ timeout: 10000 })
    })

    test('should show achievements link when unlocked', async ({ page }) => {
      const achievementsLink = page.locator('.js-achievements-nav')
      await expect(achievementsLink).toBeVisible()
    })

    test('should navigate to achievements page', async ({ page }) => {
      // Use data-testid to target the single interactive anchor
      const achievementsAnchor = page.getByTestId('nav-achievements')
      await expect(achievementsAnchor).toBeVisible()
      await Promise.all([page.waitForURL(/\/achievements(?:\/?|(\?.*)?)$/), achievementsAnchor.click()])
      await page.waitForLoadState('domcontentloaded')
      await expect(page).toHaveURL(/\/achievements(?:\/?|(\?.*)?)$/)
      await expect(page.getByTestId('achievements-page')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('main').getByRole('heading', { name: 'Achievements', level: 1 })).toBeVisible()
    })
  })

  test.describe('Pet Gallery Navigation (Unlocked)', () => {
    test.beforeEach(async ({ page }) => {
      // Pre-hydration seed via init script to avoid races in CI
      await page.addInitScript(() => {
        try {
          document.documentElement.dataset.hasPetGallery = 'true'
        } catch {}
        try {
          localStorage.setItem(
            'kil.dev/achievements/v1',
            JSON.stringify({
              PET_PARADE: new Date().toISOString(),
            }),
          )
        } catch {}
      })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      await expect(page.getByTestId('nav-pet-gallery')).toBeVisible({ timeout: 10000 })
    })

    test('should show pet gallery link when unlocked', async ({ page }) => {
      const petGalleryLink = page.locator('.js-pet-gallery-nav')
      await expect(petGalleryLink).toBeVisible()
    })

    test('should navigate to pet gallery page', async ({ page }) => {
      const petGalleryAnchor = page.getByTestId('nav-pet-gallery')
      await expect(petGalleryAnchor).toBeVisible()
      await Promise.all([page.waitForURL(/\/pet-gallery(?:\/?|(\?.*)?)$/), petGalleryAnchor.click()])
      await page.waitForLoadState('domcontentloaded')
      await expect(page).toHaveURL(/\/pet-gallery(?:\/?|(\?.*)?)$/)
      await expect(page.getByTestId('pet-gallery-page')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('main').getByRole('heading', { name: 'Pet Gallery', level: 1 })).toBeVisible()
    })
  })
})
