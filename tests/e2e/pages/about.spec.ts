import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains } from '../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations, gotoAndWaitForMain } from '../fixtures/test-helpers'

test.describe('About Page', () => {
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

    await gotoAndWaitForMain(page, '/about')

    expect(errors).toHaveLength(0)
  })

  test('should have proper landmark structure', async ({ page }) => {
    await gotoAndWaitForMain(page, '/about')

    const header = page.getByRole('banner')
    await expect(header).toBeVisible()

    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
  })

  test('should display about me content', async ({ page }) => {
    await gotoAndWaitForMain(page, '/about')

    // Check for main content sections
    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    // The quick facts, inside the About section (the nav has a "Pets" item of its own)
    await expect(
      page
        .locator('#about')
        .getByText(/location|birthday|pets/i)
        .first(),
    ).toBeVisible()
  })

  test('should display pets section', async ({ page }) => {
    await gotoAndWaitForMain(page, '/about')

    // Scroll to pets section
    const petsHeading = page.getByText(/these are my pets/i)
    await petsHeading.scrollIntoViewIfNeeded()
    await expect(petsHeading).toBeVisible()

    // Check for pet select buttons
    const petCards = page.getByRole('group', { name: 'Choose a pet' }).getByRole('radio')
    const count = await petCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should unlock ABOUT_AMBLER achievement on visit', async ({ page }) => {
    await gotoAndWaitForMain(page, '/about')

    // Wait for achievement to be processed by checking for cookie
    await page
      .waitForFunction(
        () => {
          const cookies = document.cookie.split(';')
          return cookies.some(c => c.includes('kil.dev_achievements_v1'))
        },
        { timeout: 3000 },
      )
      .catch(() => {
        // If cookie check fails, wait a bit more for achievement processing
        return page.waitForTimeout(500)
      })

    await expectAchievementCookieContains(page, 'ABOUT_AMBLER')
  })

  test('should step through pets when the detail is swiped sideways', async ({ page }) => {
    await gotoAndWaitForMain(page, '/about')
    const pets = page.getByRole('group', { name: 'Choose a pet' }).getByRole('radio')
    await expect(pets.nth(0)).toBeChecked()

    /** A touch that starts on the pet detail and ends `dx`, `dy` pixels away. */
    const swipe = (dx: number, dy = 0) =>
      page.evaluate(
        ([moveX, moveY]) => {
          const detail = document.querySelector('#pets fieldset ~ div')!
          const box = detail.getBoundingClientRect()
          const at = (x: number, y: number) => new Touch({ identifier: 1, target: detail, clientX: x, clientY: y })
          const start = at(box.left + box.width / 2, box.top + 40)
          const end = at(box.left + box.width / 2 + moveX!, box.top + 40 + moveY!)
          detail.dispatchEvent(
            new TouchEvent('touchstart', { bubbles: true, touches: [start], changedTouches: [start] }),
          )
          detail.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [end] }))
        },
        [dx, dy],
      )

    await swipe(-120)
    await expect(pets.nth(1)).toBeChecked()

    // A mostly vertical drag is a scroll, not a swipe
    await swipe(-60, 200)
    await expect(pets.nth(1)).toBeChecked()

    await swipe(120)
    await expect(pets.nth(0)).toBeChecked()
  })
})
