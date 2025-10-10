import { ACHIEVEMENTS } from '@/lib/achievements'
import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import { themes, type Theme } from '@/lib/themes'
import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'
import { hasThemeTapdanceAchievement } from '@/utils/achievements'
import { isMatrixThemeUnlocked } from '@/utils/matrix-unlock'
import { getActiveSeasonalThemes } from '@/utils/theme-runtime'
import { maybeStartViewTransition } from '@/utils/view-transition'

// Get all themes available through the secret console
// Respects THEME_TAPDANCE achievement for seasonal theme access
function getConsoleAvailableThemes(): string[] {
  const hasAchievement = hasThemeTapdanceAchievement()

  // Get currently active seasonal themes (based on current date)
  const activeSeasonalThemes = new Set(getActiveSeasonalThemes().map(st => st.theme))

  // Filter themes based on achievement status
  const hasUnlockedMatrix = isMatrixThemeUnlocked()

  const availableThemeNames = themes
    .filter(t => {
      // Always exclude alwaysHidden themes
      if ('alwaysHidden' in t && t.alwaysHidden) return false

      // If theme is seasonal (has timeRange)
      if ('timeRange' in t) {
        // Show if currently active OR user has achievement
        return activeSeasonalThemes.has(t.name) || hasAchievement
      }

      // Exclude matrix until unlocked
      if (t.name === 'matrix' && !hasUnlockedMatrix) return false

      return true
    })
    .map(t => t.name)

  return ['system', ...availableThemeNames]
}

// Display the current theme and available themes
function showCurrentTheme(env: SecretConsoleEnv) {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME)
    const current = stored ?? 'system'
    env.appendOutput(`Current theme: ${current}`)

    const available = getConsoleAvailableThemes()
    env.appendOutput(`Available themes: ${available.join(', ')}`)
  } catch {
    env.appendOutput('Unable to read current theme')
  }
}

// Get current theme state from localStorage and DOM
interface ThemeState {
  currentTheme: string
  root: HTMLElement
  seasonalDefault: string | undefined
  appliedTheme: string | undefined
  seasonalOverlaysEnabled: boolean
}

function getCurrentThemeState(): ThemeState | null {
  try {
    const currentTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) ?? 'system'
    const root = document.documentElement
    const seasonalDefault = root.dataset.seasonalDefault
    const appliedTheme = root.dataset.appliedTheme
    const seasonalOverlaysEnabled = root.dataset.seasonalOverlaysEnabled !== '0'

    return {
      currentTheme,
      root,
      seasonalDefault,
      appliedTheme,
      seasonalOverlaysEnabled,
    }
  } catch {
    return null
  }
}

// Check if switching from system to explicit theme with same visual appearance
function isSystemToExplicitWithSameVisual(state: ThemeState, requestedTheme: Theme): boolean {
  if (state.currentTheme !== 'system') return false

  // If seasonal overlay is active, it's a visual change
  if (state.seasonalDefault && state.seasonalDefault.length > 0) {
    return false
  }

  // Check if the requested theme is already visually active
  // classList might not be available in all environments (e.g., some tests)
  if (!state.root.classList) return false

  const isThemeVisuallyActive = state.root.classList.contains(requestedTheme)
  return isThemeVisuallyActive && state.appliedTheme === requestedTheme
}

// Check if switching from explicit theme to system with same visual appearance
function isExplicitToSystemWithSameVisual(state: ThemeState, requestedTheme: Theme): boolean {
  if (requestedTheme !== 'system') return false
  if (state.currentTheme !== 'light' && state.currentTheme !== 'dark') return false

  // Check if seasonal theme would activate when switching to system
  const activeSeasonalThemes = getActiveSeasonalThemes()
  const wouldHaveSeasonal = activeSeasonalThemes.length > 0 && state.seasonalOverlaysEnabled

  if (wouldHaveSeasonal) {
    return false
  }

  // Check if system preference matches current explicit theme
  const systemPrefersDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  const systemTheme = systemPrefersDark ? 'dark' : 'light'
  return systemTheme === state.currentTheme
}

// Unlock matrix achievement if this is the first time selecting it
function unlockMatrixAchievementIfNeeded(requestedTheme: Theme): boolean {
  if (requestedTheme !== 'matrix') return false

  const hasSelectedMatrixBefore = isMatrixThemeUnlocked()
  if (hasSelectedMatrixBefore) return false

  localStorage.setItem(LOCAL_STORAGE_KEYS.MATRIX_THEME_SELECTED, '1')
  globalThis.dispatchEvent(
    new CustomEvent('kd:unlock-achievement', {
      detail: { achievementId: ACHIEVEMENTS.MATRIX_MAESTRO.id },
    }),
  )
  return true
}

// Update localStorage and dispatch storage event for theme change
function persistThemeChange(requestedTheme: Theme) {
  localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, requestedTheme)
  localStorage.setItem(LOCAL_STORAGE_KEYS.THEME_UPDATED_AT, String(Date.now()))

  globalThis.dispatchEvent(
    new StorageEvent('storage', {
      key: LOCAL_STORAGE_KEYS.THEME,
      newValue: requestedTheme,
      storageArea: localStorage,
    }),
  )
}

// Handle theme change when it's already visually active
function handleAlreadyVisualTheme(requestedTheme: Theme, state: ThemeState, env: SecretConsoleEnv): boolean {
  // Check for system -> explicit with same visual
  if (isSystemToExplicitWithSameVisual(state, requestedTheme)) {
    env.appendOutput(`Theme is already visually ${requestedTheme} (setting explicitly to ${requestedTheme})`)
    unlockMatrixAchievementIfNeeded(requestedTheme)
    persistThemeChange(requestedTheme)
    return true
  }

  // Check for explicit -> system with same visual
  if (isExplicitToSystemWithSameVisual(state, requestedTheme)) {
    env.appendOutput(`Theme is already visually ${state.currentTheme} (switching to system preference)`)
    persistThemeChange(requestedTheme)
    return true
  }

  return false
}

// Apply theme change with view transition
function applyThemeWithTransition(requestedTheme: Theme) {
  const performChange = () => {
    unlockMatrixAchievementIfNeeded(requestedTheme)
    persistThemeChange(requestedTheme)
  }

  // Try to use view transition, fallback to direct change
  const transitionUsed = maybeStartViewTransition(performChange, {
    originXPercent: 50,
    originYPercent: 50,
    styleIdPrefix: 'console-theme-transition',
  })

  if (!transitionUsed) {
    performChange()
  }
}

function executeTheme(args: string[], env: SecretConsoleEnv) {
  // Show current theme info if no arguments
  if (args.length === 0) {
    showCurrentTheme(env)
    return
  }

  const requestedTheme = args[0] as Theme

  // Validate theme (allow pre-unlock 'matrix' explicitly)
  const availableThemes = getConsoleAvailableThemes()
  const isMatrix = requestedTheme === 'matrix'
  const isValid = isMatrix || availableThemes.includes(requestedTheme)
  if (!isValid) {
    env.appendOutput(`Invalid theme: ${requestedTheme}`)
    env.appendOutput(`Available themes: ${availableThemes.join(', ')}`)
    return
  }

  // Get current theme state
  const state = getCurrentThemeState()

  // Check if theme is already explicitly set to the same value
  if (state && state.currentTheme === requestedTheme) {
    env.appendOutput(`Theme is already set to: ${requestedTheme}`)
    return
  }

  // Check if theme is already visually active (but stored preference is different)
  if (state && handleAlreadyVisualTheme(requestedTheme, state, env)) {
    return
  }

  // Apply theme change with transition
  try {
    applyThemeWithTransition(requestedTheme)
    env.appendOutput(`Theme changed to: ${requestedTheme}`)
    if (requestedTheme === 'matrix') {
      env.appendOutput('Through the looking-glass, you found your way. Welcome to the Matrix.')
    }
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
