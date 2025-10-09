import { themes, type Theme } from '@/lib/themes'
import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'
import { maybeStartViewTransition } from '@/utils/view-transition'

// Get all themes available through the secret console
// Includes themes with hiddenFromMenu but excludes alwaysHidden themes
export function getConsoleAvailableThemes(): Theme[] {
  // Filter out only truly hidden themes (alwaysHidden), but include hiddenFromMenu themes
  const availableThemeNames = themes.filter(t => !('alwaysHidden' in t && t.alwaysHidden)).map(t => t.name)
  return ['system', ...availableThemeNames] as Theme[]
}

function executeTheme(args: string[], env: SecretConsoleEnv) {
  if (args.length === 0) {
    // Show current theme
    try {
      const stored = localStorage.getItem('theme')
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
    env.appendOutput(`Invalid or unavailable theme: ${requestedTheme}`)
    env.appendOutput(`Available themes: ${availableThemes.join(', ')}`)
    return
  }

  try {
    // Wrap theme change in a view transition for smooth animation
    const performThemeChange = () => {
      // Only write to localStorage - let the theme provider handle cookies
      // This ensures the theme provider remains the single source of truth
      localStorage.setItem('theme', requestedTheme)
      localStorage.setItem('theme_updatedAt', String(Date.now()))

      // Manually dispatch storage event to trigger theme provider update
      // (storage events don't fire in the same window that made the change)
      globalThis.dispatchEvent(
        new StorageEvent('storage', {
          key: 'theme',
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
  },
}
