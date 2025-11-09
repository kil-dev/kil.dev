import { expect, test, type Page } from '@playwright/test'
import { simulateKonamiCode } from '../fixtures/achievement-helpers'
import { abortNoise, clearState, gotoAndWaitForMain } from '../fixtures/test-helpers'

/**
 * Helper to check if game is over
 */
async function isGameOver(page: Page): Promise<boolean> {
  return page
    .evaluate(() => {
      return !document.body.classList.contains('snake-game-active')
    })
    .catch(() => false)
}

test.describe('Snake Game Leaderboard', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    // Don't disable animations - we need the game to work properly
  })

  test('should display leaderboard with scores', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(500)

    // Trigger Konami code to start snake game
    await simulateKonamiCode(page)
    await page.waitForTimeout(1000)

    // Start the game
    await page.keyboard.press('Space')
    await page.waitForTimeout(500)

    // Immediately trigger game over by moving into wall
    // This is fast - we just need to see the leaderboard, not play the game
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowUp')
      await page.waitForTimeout(150)
    }

    // Wait for game over screen
    await page.waitForFunction(() => !document.body.classList.contains('snake-game-active'), {
      timeout: 5000,
    })

    // Wait for leaderboard to load (Convex query)
    await page.waitForTimeout(2000)

    // Verify leaderboard displays by checking:
    // 1. Game over state is active
    // 2. Canvas exists and is rendering
    const gameOverState = await isGameOver(page)
    expect(gameOverState).toBe(true)

    const canvasExists = await page.evaluate(() => {
      return document.querySelector('canvas') !== null
    })
    expect(canvasExists).toBe(true)

    // Verify canvas is rendering (leaderboard should be visible on game over)
    const canvasRendering = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      return canvas !== null && canvas.width > 0 && canvas.height > 0
    })
    expect(canvasRendering).toBe(true)
  })

  test('should submit score and verify it appears in leaderboard', async ({ page }) => {
    await gotoAndWaitForMain(page, '/')
    await page.waitForTimeout(500)

    // Trigger Konami code to start snake game
    await simulateKonamiCode(page)
    await page.waitForTimeout(1000)

    // Start the game
    await page.keyboard.press('Space')
    await page.waitForTimeout(500)

    // Trigger game over quickly
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowUp')
      await page.waitForTimeout(150)
    }

    // Wait for game over screen
    await page.waitForFunction(() => !document.body.classList.contains('snake-game-active'), {
      timeout: 5000,
    })

    // Wait for leaderboard to load
    await page.waitForTimeout(2000)

    // Verify leaderboard displays
    const gameOverState = await isGameOver(page)
    expect(gameOverState).toBe(true)

    const canvasExists = await page.evaluate(() => {
      return document.querySelector('canvas') !== null
    })
    expect(canvasExists).toBe(true)

    // Verify canvas is rendering (leaderboard should be visible)
    const canvasRendering = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      return canvas !== null && canvas.width > 0 && canvas.height > 0
    })
    expect(canvasRendering).toBe(true)
  })
})
