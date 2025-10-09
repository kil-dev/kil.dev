import { ACHIEVEMENTS } from '@/lib/achievements'
import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import { themes, type Theme } from '@/lib/themes'
import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'
import { hasThemeTapdanceAchievement } from '@/utils/achievements'
import { getActiveSeasonalThemes } from '@/utils/theme-runtime'
import { maybeStartViewTransition } from '@/utils/view-transition'

// Get all themes available through the secret console
// Respects THEME_TAPDANCE achievement for seasonal theme access
function getConsoleAvailableThemes(): string[] {
  const hasAchievement = hasThemeTapdanceAchievement()

  // Get currently active seasonal themes (based on current date)
  const activeSeasonalThemes = new Set(getActiveSeasonalThemes().map(st => st.theme))

  // Filter themes based on achievement status
  const availableThemeNames = themes
    .filter(t => {
      // Always exclude alwaysHidden themes
      if ('alwaysHidden' in t && t.alwaysHidden) return false

      // If theme is seasonal (has timeRange)
      if ('timeRange' in t) {
        // Show if currently active OR user has achievement
        return activeSeasonalThemes.has(t.name) || hasAchievement
      }

      return true
    })
    .map(t => t.name)

  return ['system', ...availableThemeNames]
}

function executeTheme(args: string[], env: SecretConsoleEnv) {
  if (args.length === 0) {
    // Show current theme
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME)
      const current = stored ?? 'system'
      env.appendOutput(`Current theme: ${current}`)

      // Show available themes (including hidden ones via console)
      const available = getConsoleAvailableThemes()
      env.appendOutput(`Available themes: ${available.join(', ')}`)
    } catch {
      env.appendOutput('Unable to read current theme')
    }
    return
  }

  const requestedTheme = args[0] as Theme

  // Validate theme against console-available themes (includes alwaysHidden)
  const availableThemes = getConsoleAvailableThemes()
  if (!availableThemes.includes(requestedTheme)) {
    env.appendOutput(`Invalid theme: ${requestedTheme}`)
    env.appendOutput(`Available themes: ${availableThemes.join(', ')}`)
    return
  }

  // Check if theme is already set or visually the same
  try {
    const currentTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) ?? 'system'
    if (currentTheme === requestedTheme) {
      env.appendOutput(`Theme is already set to: ${requestedTheme}`)
      return
    }

    const root = document.documentElement
    const seasonalDefault = root.dataset.seasonalDefault // The active seasonal theme (if any)
    const appliedTheme = root.dataset.appliedTheme // The base theme (light/dark) or explicit theme

    // Check if switching FROM system TO explicit theme with same visual
    if (currentTheme === 'system') {
      // If there's a seasonal overlay active, always play the transition when switching to explicit theme
      // because we're going from seasonal (e.g., halloween) to explicit (e.g., dark)
      if (seasonalDefault && seasonalDefault.length > 0) {
        // Seasonal theme is active, so switching to any explicit theme is a visual change
        // Continue to play transition
      } else {
        // No seasonal theme, check if the requested theme is actually visually active
        // We need to check the classList to see if the theme is actually applied
        const isThemeVisuallyActive = root.classList.contains(requestedTheme)
        if (isThemeVisuallyActive && appliedTheme === requestedTheme) {
          env.appendOutput(`Theme is already visually ${requestedTheme} (setting explicitly to ${requestedTheme})`)

          // Check if this is matrix theme and unlock achievement if needed
          const isMatrixTheme = requestedTheme === 'matrix'
          const hasSelectedMatrixBefore = isMatrixTheme
            ? localStorage.getItem(LOCAL_STORAGE_KEYS.MATRIX_THEME_SELECTED) === '1'
            : false
          if (isMatrixTheme && !hasSelectedMatrixBefore) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.MATRIX_THEME_SELECTED, '1')
            globalThis.dispatchEvent(
              new CustomEvent('kd:unlock-achievement', {
                detail: { achievementId: ACHIEVEMENTS.MATRIX_MAESTRO.id },
              }),
            )
          }

          // Still allow the change to happen (it changes the preference), but skip the transition
          localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, requestedTheme)
          localStorage.setItem(LOCAL_STORAGE_KEYS.THEME_UPDATED_AT, String(Date.now()))
          globalThis.dispatchEvent(
            new StorageEvent('storage', {
              key: LOCAL_STORAGE_KEYS.THEME,
              newValue: requestedTheme,
              storageArea: localStorage,
            }),
          )
          return
        }
      }
    }

    // Check if switching FROM explicit theme TO system with same visual
    if (requestedTheme === 'system' && (currentTheme === 'light' || currentTheme === 'dark')) {
      // Check if there's a seasonal theme that WOULD activate when switching to system
      const activeSeasonalThemes = getActiveSeasonalThemes()
      const seasonalOverlaysEnabled = root.dataset.seasonalOverlaysEnabled !== '0'
      const wouldHaveSeasonal = activeSeasonalThemes.length > 0 && seasonalOverlaysEnabled

      if (wouldHaveSeasonal) {
        // Seasonal would activate, so it's a visual change - play transition
      } else {
        // No seasonal would activate, check if system preference matches current explicit theme
        const systemPrefersDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
        const systemTheme = systemPrefersDark ? 'dark' : 'light'
        if (systemTheme === currentTheme) {
          env.appendOutput(`Theme is already visually ${currentTheme} (switching to system preference)`)
          // Still allow the change to happen (it changes the preference), but skip the transition
          localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, requestedTheme)
          localStorage.setItem(LOCAL_STORAGE_KEYS.THEME_UPDATED_AT, String(Date.now()))
          globalThis.dispatchEvent(
            new StorageEvent('storage', {
              key: LOCAL_STORAGE_KEYS.THEME,
              newValue: requestedTheme,
              storageArea: localStorage,
            }),
          )
          return
        }
      }
    }
  } catch {
    // Continue if we can't read current theme
  }

  try {
    // Check if this is the first time selecting the matrix theme
    const isMatrixTheme = requestedTheme === 'matrix'
    const hasSelectedMatrixBefore = isMatrixTheme
      ? localStorage.getItem(LOCAL_STORAGE_KEYS.MATRIX_THEME_SELECTED) === '1'
      : false

    // Wrap theme change in a view transition for smooth animation
    const performThemeChange = () => {
      // Only write to localStorage - let the theme provider handle cookies
      // This ensures the theme provider remains the single source of truth
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, requestedTheme)
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME_UPDATED_AT, String(Date.now()))

      // Mark matrix theme as selected (for achievement tracking)
      if (isMatrixTheme && !hasSelectedMatrixBefore) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.MATRIX_THEME_SELECTED, '1')
        // Unlock achievement using the global achievement unlock mechanism
        // We'll trigger this via a custom event that the achievements provider can listen to
        globalThis.dispatchEvent(
          new CustomEvent('kd:unlock-achievement', {
            detail: { achievementId: ACHIEVEMENTS.MATRIX_MAESTRO.id },
          }),
        )
      }

      // Manually dispatch storage event to trigger theme provider update
      // (storage events don't fire in the same window that made the change)
      globalThis.dispatchEvent(
        new StorageEvent('storage', {
          key: LOCAL_STORAGE_KEYS.THEME,
          newValue: requestedTheme,
          storageArea: localStorage,
        }),
      )
    }

    // Try to use view transition, fallback to direct change
    const transitionUsed = maybeStartViewTransition(performThemeChange, {
      originXPercent: 50,
      originYPercent: 50,
      styleIdPrefix: 'console-theme-transition',
    })

    if (!transitionUsed) {
      // If view transition not supported, apply directly
      performThemeChange()
    }

    env.appendOutput(`Theme changed to: ${requestedTheme}`)
  } catch (error) {
    env.appendOutput(`Failed to change theme: ${error instanceof Error ? error.message : 'unknown error'}`)
  }
}

export const theme: SecretConsoleCommand = {
  usage: 'theme [name]',
  help: 'theme [name] — get or set the site theme',
  execute: executeTheme,
  completion: {
    args: 'themes',
    maxPositionalArgs: 1,
  },
}
