import { expect, test, type Page } from '@playwright/test'
import { createBoard, reveal } from '../../../../src/utils/minesweeper'
import { expectAchievementCookieContains } from '../../fixtures/achievement-helpers'
import { abortNoise, clearState, disableAnimations, gotoAndWaitForMain } from '../../fixtures/test-helpers'

const COLUMNS = 8
const ROWS = 8
const MINES = 10
/** Fed to the game in place of Math.random while it lays the mines, so the test knows where they are. */
const RANDOM = [0.05, 0.9, 0.4, 0.7, 0.2, 0.55, 0.85, 0.3, 0.65, 0.15]

/** A first click that leaves the Beginner board in play, with one of its mines and its still-closed safe cells. */
function planGame() {
  for (let first = 0; first < COLUMNS * ROWS; first += 1) {
    let calls = 0
    const board = reveal(createBoard(COLUMNS, ROWS), first, MINES, () => RANDOM[calls++ % RANDOM.length]!)
    if (board.status !== 'playing') continue
    return {
      first,
      mine: board.cells.findIndex(cell => cell.mine),
      closedSafeCells: board.cells.flatMap((cell, index) => (!cell.mine && !cell.revealed ? [index] : [])),
    }
  }
  throw new Error('No first click leaves the board in play')
}

const game = planGame()
const cell = (page: Page, index: number) => page.locator(`[data-cell="${index}"]`)

/** Opens the planned first cell with the game's randomness swapped for RANDOM. */
async function openFirstCell(page: Page) {
  await page.evaluate(sequence => {
    const random = Math.random
    let calls = 0
    Math.random = () => sequence[calls++ % sequence.length]!
    setTimeout(() => {
      Math.random = random
    }, 500)
  }, RANDOM)
  await cell(page, game.first).click()
}

test.describe('TIME_TURNER Achievement', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)
  })

  test('should bring in the help critter after three lost games, then travel once the board is cleared', async ({
    page,
  }) => {
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Turn back time' }).click()
    const face = page.getByRole('button', { name: /start a new game/i })
    const help = page
      .getByRole('dialog')
      .getByRole('status')
      .filter({ hasText: /flag|help|square/i })

    // Three games lost on a mine: none of them travels, and the helper stays away until the third
    for (let lost = 1; lost <= 3; lost += 1) {
      await expect(help).toHaveCount(0)
      await openFirstCell(page)
      await cell(page, game.mine).click()
      await expect(face).toHaveAttribute('data-face', 'lost')
      if (lost < 3) await face.click()
    }
    await expect(page.locator('html')).not.toHaveClass(/dotcom/)

    // Help mode: the critter introduces itself on the third lost board
    await expect(help).toContainText('I am going to help')

    // Popping the helper sends it away and counts as a pop; the next lost game brings it back
    await page.getByRole('button', { name: /pop the helper/i }).click()
    await expect(help).toHaveCount(0)
    expect(await page.evaluate(() => localStorage.getItem('kd_bubbles_popped'))).toBe('1')
    await face.click()
    await openFirstCell(page)
    await cell(page, game.mine).click()
    await expect(help).toContainText('I am going to help')

    // With the helper there, the first click of the next game flags every mine
    await face.click()
    await openFirstCell(page)
    await expect(page.locator('[data-cell]').filter({ hasText: '🚩' })).toHaveCount(MINES)

    // Opening the remaining safe cells clears the board and travels to 1999
    for (const index of game.closedSafeCells) {
      if ((await cell(page, index).getAttribute('data-open')) === 'false') await cell(page, index).click()
    }
    await expect(page.locator('html')).toHaveClass(/dotcom/)
    await expectAchievementCookieContains(page, 'TIME_TURNER')

    // Having travelled once, clearing a board again is just a win: the game stays open
    await page.getByRole('button', { name: 'Turn back time' }).click()
    await openFirstCell(page)
    for (const index of game.closedSafeCells) {
      if ((await cell(page, index).getAttribute('data-open')) === 'false') await cell(page, index).click()
    }
    await expect(face).toHaveAttribute('data-face', 'won')
    await page.waitForTimeout(1500)
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('should offer the Windows 98 board sizes to play', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Turn back time' }).click()
    const cells = page.locator('[data-cell]')
    const minesLeft = page.getByRole('dialog').getByRole('status').first()

    await expect(cells).toHaveCount(8 * 8)
    await expect(minesLeft).toHaveText('010')
    await page.getByRole('radio', { name: 'Intermediate' }).click()
    await expect(cells).toHaveCount(16 * 16)
    await expect(minesLeft).toHaveText('040')
    await page.getByRole('radio', { name: 'Expert' }).click()
    await expect(cells).toHaveCount(30 * 16)
    await expect(minesLeft).toHaveText('099')
  })
})
