import { expect, test } from '@playwright/test'
import { expectAchievementCookieContains, expectConfettiLikely } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, gotoAndWaitForMain } from '../../fixtures/test-helpers'

test.describe('CONSOLE_COMMANDER Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
  })

  test('should unlock CONSOLE_COMMANDER on first console open', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)),
      )
      .toBe(true)

    // Press backtick to open console
    await page.keyboard.press('`')

    // Wait for console to load and appear
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible', timeout: 5000 })

    // Wait for achievement to process
    await page.waitForTimeout(1500)

    // Verify achievement is unlocked
    await expectAchievementCookieContains(page, 'CONSOLE_COMMANDER')

    // Verify confetti was triggered
    await expectConfettiLikely(page)
  })

  test('should set localStorage flag after first open', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)),
      )
      .toBe(true)

    // Open console
    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    await page.waitForTimeout(500)

    // Check localStorage flag
    const hasFlag = await page.evaluate(() => {
      return localStorage.getItem('kd_console_opened') === '1'
    })

    expect(hasFlag).toBe(true)
  })

  test('should not unlock on subsequent opens', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)),
      )
      .toBe(true)

    // First open
    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })
    await page.waitForTimeout(1000)

    // Capture cookie after first unlock
    const cookiesBefore = await page.context().cookies()
    const achievementCookieBefore = cookiesBefore.find(c => c.name === 'kil.dev_achievements_v1')
    expect(achievementCookieBefore, 'Achievement cookie should exist after first open').toBeDefined()
    const cookieValueBefore = achievementCookieBefore?.value

    // Close console (Escape)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Second open
    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })
    await page.waitForTimeout(1000)

    // Should NOT unlock again: cookie should be unchanged
    const cookiesAfter = await page.context().cookies()
    const achievementCookieAfter = cookiesAfter.find(c => c.name === 'kil.dev_achievements_v1')
    expect(achievementCookieAfter, 'Achievement cookie should still exist after second open').toBeDefined()
    expect(achievementCookieAfter?.value, 'Achievement cookie should be unchanged on second open').toBe(
      cookieValueBefore,
    )
  })
})
