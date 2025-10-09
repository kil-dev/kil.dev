import type { AchievementId } from '@/lib/achievements'
import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'
import type { Route } from 'next'

type PageDefinition = {
  route: Route
  name: string
  requiresAchievement?: AchievementId
}

// Define all navigable pages on the site
const PAGES: PageDefinition[] = [
  { route: '/', name: 'home' },
  { route: '/about', name: 'about' },
  { route: '/experience', name: 'experience' },
  { route: '/projects', name: 'projects' },
  { route: '/418', name: '418' },
  { route: '/achievements', name: 'achievements', requiresAchievement: 'RECURSIVE_REWARD' },
  { route: '/pet-gallery', name: 'pet-gallery', requiresAchievement: 'PET_PARADE' },
]

// Helper to check if user has a specific achievement
function hasAchievement(achievementId: AchievementId): boolean {
  if (globalThis.window === undefined) return false
  try {
    const stored = globalThis.localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENTS)
    if (!stored) return false
    const unlocked = JSON.parse(stored) as Record<string, unknown>
    return Boolean(unlocked[achievementId])
  } catch {
    return false
  }
}

// Get pages that are available to the user based on achievements
function getAvailablePages(): PageDefinition[] {
  return PAGES.filter(page => {
    if (!page.requiresAchievement) return true
    return hasAchievement(page.requiresAchievement)
  })
}

// Get page names for completion
export function getAvailablePageNames(): string[] {
  return getAvailablePages().map(page => page.name)
}

function executeNav(args: string[], env: SecretConsoleEnv) {
  const pageName = args[0]

  // If no argument, show available pages
  if (!pageName) {
    const available = getAvailablePages()
    if (available.length === 0) {
      env.appendOutput('No pages available')
      return
    }
    env.appendOutput('Available pages:')
    for (const page of available) {
      env.appendOutput(`  ${page.name} → ${page.route}`)
    }
    return
  }

  // Find the requested page among available pages only
  // This treats locked pages as if they don't exist
  const page = getAvailablePages().find(p => p.name === pageName)

  if (!page) {
    env.appendOutput(`nav: ${pageName}: No such page`)
    return
  }

  // Dispatch custom event for client-side navigation
  // This allows the console to stay mounted and preserve history
  if (globalThis.window !== undefined) {
    globalThis.window.dispatchEvent(
      new CustomEvent('kd:console-navigate', {
        detail: { route: page.route },
      }),
    )
  }
}

export const nav: SecretConsoleCommand = {
  usage: 'nav [page]',
  help: 'nav [page] — navigate to a page on the site',
  completion: { args: 'pages', maxPositionalArgs: 1 },
  execute: executeNav,
}
