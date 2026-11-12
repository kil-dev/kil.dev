import { expect, test, type Page } from '@playwright/test'
import { expectAchievementCookieContains } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations, gotoAndWaitForMain } from '../../fixtures/test-helpers'

/** Loads home with `alreadyPopped` bubbles on the counter, then pops one more. */
async function popOneBubbleAfter(page: Page, alreadyPopped: number) {
  await gotoAndWaitForMain(page, '/')
  await page.evaluate(count => localStorage.setItem('kd_bubbles_popped', String(count)), alreadyPopped)
  await page.reload()
  await expect(page.getByRole('main')).toBeVisible()
  await page.waitForTimeout(300)

  // Bubbles sit behind the page: find one whose centre is not under a link or button
  const bubble = await page.evaluate(() => {
    for (const skin of document.querySelectorAll('.slime-bubble-skin')) {
      const box = skin.getBoundingClientRect()
      const x = box.left + box.width / 2
      const y = box.top + box.height / 2
      if (y < 100 || y > window.innerHeight - 100) continue
      const top = document.elementFromPoint(x, y)
      if (top && !top.closest('a, button, input, label, [role="button"]')) return { x, y }
    }
    return null
  })
  expect(bubble, 'a bubble should be clickable on empty background').not.toBeNull()

  await page.mouse.click(bubble!.x, bubble!.y)
  await expect(page.locator('.slime-bubble-skin.popped')).toHaveCount(1)
}

test.describe('BUBBLE_BURSTER Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)
  })

  test('should unlock BUBBLE_BURSTER on the 50th popped bubble', async ({ page }) => {
    await popOneBubbleAfter(page, 49)

    await expectAchievementCookieContains(page, 'BUBBLE_BURSTER')
  })

  test('should show the running count from the 10th pop', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await expect(page.getByRole('status').filter({ hasText: 'popped' })).toHaveCount(0)

    await popOneBubbleAfter(page, 9)

    // The count is shown without its target, so the 50 stays a secret
    await expect(page.getByRole('status').filter({ hasText: 'popped' })).toHaveText('10 popped')
  })

  test('should count popping the portrait and keep counting past 50', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await page.evaluate(() => localStorage.setItem('kd_bubbles_popped', '50'))
    await page.reload()
    await page.waitForTimeout(300)

    await page.getByRole('button', { name: /toggle grumpy profile image/i }).click()

    await expect(page.getByRole('status').filter({ hasText: 'popped' })).toHaveText('51 popped')
  })
})
