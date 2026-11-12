import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains, getUnlockedAchievementCount } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, gotoAndWaitForMain } from '../../fixtures/test-helpers'

async function expectUnlockedAchievementCount(page: Page, count: number) {
  await expect.poll(() => getUnlockedAchievementCount(page), { timeout: 5000 }).toBe(count)
}

test.describe('RECURSIVE_REWARD Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
  })

  test('should unlock RECURSIVE_REWARD after unlocking 3 other achievements', async ({ page }) => {
    // First visit home to mount provider properly
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(500)

    await expectUnlockedAchievementCount(page, 0)

    // Visit About page - unlock first achievement
    await gotoAndWaitForMain(page, '/about')
    await page.waitForTimeout(500)

    await expectUnlockedAchievementCount(page, 1)

    // Visit Experience page - unlock second achievement
    await gotoAndWaitForMain(page, '/experience')
    await page.waitForTimeout(500)

    await expectUnlockedAchievementCount(page, 2)

    // Visit Projects page - unlock third achievement
    await gotoAndWaitForMain(page, '/projects')
    await page.waitForTimeout(1000) // Wait a bit longer for RECURSIVE_REWARD to trigger

    // Should now have 4 achievements (3 + RECURSIVE_REWARD)
    await expectUnlockedAchievementCount(page, 4)

    // Verify RECURSIVE_REWARD is unlocked
    await expectAchievementCookieContains(page, 'RECURSIVE_REWARD')
  })

  test('should make achievements nav link visible after RECURSIVE_REWARD', async ({ page }) => {
    if ((page.viewportSize()?.width ?? 0) < 1240) {
      test.skip(true, 'Desktop topbar is hidden below the nav breakpoint')
    }

    // First visit home to mount provider
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(500)

    // Unlock 3 achievements to trigger RECURSIVE_REWARD
    await gotoAndWaitForMain(page, '/about')
    await page.waitForTimeout(500)

    await gotoAndWaitForMain(page, '/experience')
    await page.waitForTimeout(500)

    await gotoAndWaitForMain(page, '/projects')
    await page.waitForTimeout(1000)

    // Navigate to home to check for achievements link
    await gotoAndWaitForMain(page, '/')

    // Achievements link should now be visible
    const achievementsLink = page.locator('.js-achievements-nav')
    await expect(achievementsLink).toBeVisible()
  })

  test('should animate desktop nav layout when achievements link appears', async ({ page }) => {
    if ((page.viewportSize()?.width ?? 0) < 1240) {
      test.skip(true, 'Desktop topbar is hidden below the nav breakpoint')
    }

    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(500)

    // Everything is measured inside the page, one sample per animation frame, starting before the
    // unlock. Sampling from the test process on a timer missed the half-second reveal under load.
    const run = await page.evaluate(async () => {
      const link = document.querySelector<HTMLElement>('.js-achievements-nav')!
      const home = document.querySelector<HTMLElement>('nav[aria-label="Primary"] a[href="/"]')!
      const projects = document.querySelector<HTMLElement>('nav[aria-label="Primary"] a[href="/#projects"]')!
      const indicator = document.querySelector<HTMLElement>('nav[aria-label="Primary"] div > span:nth-child(2)')!
      const read = () => ({
        width: link.getBoundingClientRect().width,
        pointerEvents: getComputedStyle(link).pointerEvents,
        projectsX: projects.getBoundingClientRect().left,
      })
      const initial = read()
      const samples: Array<ReturnType<typeof read>> = []
      let sampling = true
      const sample = () => {
        samples.push(read())
        if (sampling) requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)

      // Three achievements unlock RECURSIVE_REWARD, which reveals the nav link
      for (const achievementId of ['ABOUT_AMBLER', 'EXPERIENCE_EXPLORER', 'PROJECTS_PERUSER']) {
        globalThis.dispatchEvent(new CustomEvent('kd:unlock-achievement', { detail: { achievementId } }))
      }
      await new Promise<void>(resolve => {
        const check = () =>
          document.documentElement.dataset.hasAchievements === 'true' ? resolve() : requestAnimationFrame(check)
        check()
      })
      await new Promise(resolve => setTimeout(resolve, 1500))
      sampling = false

      const centre = (element: HTMLElement) => {
        const box = element.getBoundingClientRect()
        return box.left + box.width / 2
      }
      return { initial, samples, settled: read(), indicatorOffHome: Math.abs(centre(indicator) - centre(home)) }
    })

    const { initial, samples, settled } = run
    expect(initial.width).toBe(0)
    expect(settled.width).toBeGreaterThan(40)
    // The link grows through in-between widths, and its neighbours slide over, instead of jumping
    expect(samples.some(sample => sample.width > 8 && sample.width < settled.width - 8)).toBe(true)
    expect(
      samples.some(sample => sample.projectsX < initial.projectsX - 4 && sample.projectsX > settled.projectsX + 4),
    ).toBe(true)
    // It cannot be clicked while it is still appearing
    expect(samples.some(sample => sample.width > 0 && sample.pointerEvents === 'none')).toBe(true)
    // The active-page indicator follows its link to the new position
    expect(run.indicatorOffHome).toBeLessThan(20)
  })
})
