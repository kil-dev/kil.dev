import { expect, test } from '@playwright/test'
import { abortNoise, clearState } from '../fixtures/test-helpers'

test.describe('No FOUC with explicit seasonal theme (Halloween)', () => {
  test.beforeEach(async ({ page }) => {
    await clearState(page)
    await abortNoise(page)
  })

  test('applies halloween before first paint (no flash)', async ({ page }) => {
    // Preconfigure selected theme and install a first-frame probe before any page scripts run
    await page.addInitScript(() => {
      try {
        localStorage.setItem('theme', 'halloween')
      } catch {}

      // Ensure seasonal themes are allowed regardless of current date
      try {
        document.documentElement.dataset.hasThemeTapdance = '1'
      } catch {}
      try {
        // eslint-disable-next-line unicorn/no-document-cookie
        document.cookie = 'kil.dev/achievements/v1=' + encodeURIComponent('THEME_TAPDANCE') + '; path=/'
      } catch {}

      ;(
        globalThis as unknown as {
          __firstFrameData?: { classAtRAF: string; appliedAtRAF: string; themePrefAtRAF: string }
        }
      ).__firstFrameData = { classAtRAF: '', appliedAtRAF: '', themePrefAtRAF: '' }

      try {
        requestAnimationFrame(() => {
          const html = document.documentElement
          ;(
            globalThis as unknown as {
              __firstFrameData?: { classAtRAF: string; appliedAtRAF: string; themePrefAtRAF: string }
            }
          ).__firstFrameData = {
            classAtRAF: html.className,
            appliedAtRAF: html.dataset.appliedTheme ?? '',
            themePrefAtRAF: html.dataset.themePref ?? '',
          }
        })
      } catch {}
    })

    await page.goto('/')

    // Ensure our first-frame probe populated
    await page.waitForFunction(() => {
      const d = (
        globalThis as unknown as {
          __firstFrameData?: { classAtRAF: string; appliedAtRAF: string; themePrefAtRAF: string }
        }
      ).__firstFrameData
      return d && (d.appliedAtRAF.length > 0 || d.classAtRAF.length > 0)
    })
    const data = (await page.evaluate(() => {
      return (
        globalThis as unknown as {
          __firstFrameData?: { classAtRAF: string; appliedAtRAF: string; themePrefAtRAF: string }
        }
      ).__firstFrameData
    })) as { classAtRAF: string; appliedAtRAF: string; themePrefAtRAF: string }

    // Assert Halloween was applied by first frame (no flash of default styles)
    expect(data.appliedAtRAF).toBe('halloween')
    expect(data.classAtRAF.split(/\s+/).includes('halloween')).toBe(true)
  })
})
