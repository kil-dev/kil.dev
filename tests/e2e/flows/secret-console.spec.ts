import { expect, test } from '@playwright/test'
import { abortNoise, clearState, disableAnimations } from '../fixtures/test-helpers'

test.describe('Secret Console', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
    await disableAnimations(page)
  })

  test('should open console with backtick key', async ({ page }) => {
    await page.goto('/')
    // Wait for the console key listener to be attached, avoiding brittle networkidle
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)))
      .toBe(true)

    await page.keyboard.press('`')

    const console = page.locator('dialog[aria-label="Developer console"]')
    await expect(console).toBeVisible({ timeout: 5000 })
  })

  test('should close console with Escape key', async ({ page }) => {
    await page.goto('/')
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)))
      .toBe(true)

    // Open console
    // Avoid first-open toast stealing focus in tests
    await page.evaluate(() => localStorage.setItem('kd_console_opened', '1'))
    await page.keyboard.press('Backquote')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    // Ensure input is ready and focused before sending Escape
    const input = page.locator('input[aria-label="Console input"]')
    await expect(input).toBeVisible()
    await expect(input).toBeFocused()

    // Close console
    await page.keyboard.press('Escape')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'detached' })
  })

  test('should display MOTD on first open', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)))
      .toBe(true)

    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    // Should have some content (MOTD)
    const consoleContent = page.locator('dialog[aria-label="Developer console"]')
    await expect(consoleContent).toContainText(/welcome|kilian|console/i)
  })

  test('should have input field for commands', async ({ page }) => {
    await page.goto('/')

    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)))
      .toBe(true)

    // Avoid first-open toast stealing focus in tests
    await page.evaluate(() => localStorage.setItem('kd_console_opened', '1'))
    await page.keyboard.press('Backquote')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })
    const input = page.locator('input[aria-label="Console input"]')
    await expect(input).toBeVisible()
    await input.focus()
    await expect(input).toBeFocused()
  })

  test('should execute simple commands', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)))
      .toBe(true)

    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    const input = page.locator('input[aria-label="Console input"]')

    // Try 'help' command
    await input.fill('help')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Should display help output
    const consoleOutput = page.locator('dialog[aria-label="Developer console"]')
    await expect(consoleOutput).toContainText(/help|commands|available/i)
  })

  test('should navigate with pwd and ls commands', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)))
      .toBe(true)

    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    const input = page.locator('input[aria-label="Console input"]')

    // Check current directory
    await input.fill('pwd')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Should show current directory
    const consoleOutput = page.locator('dialog[aria-label="Developer console"]')
    await expect(consoleOutput).toContainText(/\/home\/kil|~/)

    // List files
    await input.fill('ls')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Should show some files
    await expect(consoleOutput).toContainText(/\.|\w/)
  })

  test('should handle clear command', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)))
      .toBe(true)

    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    const input = page.locator('input[aria-label="Console input"]')

    // Run some commands first
    await input.fill('help')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    await input.fill('pwd')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Clear the console
    await input.fill('clear')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Console output should be minimal (just the clear command)
    const outputLines = page.locator('dialog[aria-label="Developer console"] > div > div > div')
    const count = await outputLines.count()
    expect(count).toBeLessThan(3) // Should be mostly empty
  })

  test('should persist console history across opens', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)))
      .toBe(true)

    // Open console and run a command
    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    const input = page.locator('input[aria-label="Console input"]')
    await input.fill('pwd')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Close console
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Reopen console
    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    // History should still be there
    const consoleOutput = page.locator('dialog[aria-label="Developer console"]')
    await expect(consoleOutput).toContainText('pwd')
  })

  test('should support command history navigation with arrow keys', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)))
      .toBe(true)

    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    const input = page.locator('input[aria-label="Console input"]')

    // Run a few commands
    await input.fill('pwd')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(200)

    await input.fill('ls')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(200)

    // Now press up arrow to recall previous command
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(100)

    // Input should show 'ls'
    const inputValue = await input.inputValue()
    expect(inputValue).toBe('ls')

    // Press up again
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(100)

    // Input should show 'pwd'
    const inputValue2 = await input.inputValue()
    expect(inputValue2).toBe('pwd')
  })

  test('should have resize handle', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect
      .poll(async () =>
        page.evaluate(() => Boolean((globalThis as unknown as { kdConsoleReady?: boolean }).kdConsoleReady)))
      .toBe(true)

    await page.keyboard.press('`')
    await page.waitForSelector('dialog[aria-label="Developer console"]', { state: 'visible' })

    const resizeHandle = page.locator('[data-resize-handle]')
    await expect(resizeHandle).toBeVisible()
  })
})
