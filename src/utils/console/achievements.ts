import { ACHIEVEMENTS, type AchievementId } from '@/lib/achievements'
import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

type AchievementEntry = {
  id: AchievementId
  index: number
  unlocked: boolean
  timestamp?: string
}

// Helper to get unlocked achievements from localStorage
function getUnlockedAchievements(): Record<string, string> {
  if (globalThis.window === undefined) return {}
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENTS)
    if (!stored) return {}
    return JSON.parse(stored) as Record<string, string>
  } catch {
    return {}
  }
}

// Build ordered list of all achievements with unlock status
function buildAchievementsList(): AchievementEntry[] {
  const unlocked = getUnlockedAchievements()
  const entries: AchievementEntry[] = []

  let index = 1
  for (const [id] of Object.entries(ACHIEVEMENTS)) {
    const achievementId = id as AchievementId
    const timestamp = unlocked[achievementId]
    entries.push({
      id: achievementId,
      index,
      unlocked: Boolean(timestamp),
      timestamp,
    })
    index++
  }

  return entries
}

// Get available subcommands for tab completion
export function getAchievementSubcommands(): string[] {
  return ['list', 'hint', 'show']
}

// Get available achievement numbers for hint (locked achievements)
export function getHintableAchievementNumbers(): string[] {
  const entries = buildAchievementsList()
  return entries.filter(e => !e.unlocked).map(e => e.index.toString())
}

// Get available achievement numbers for show (unlocked achievements)
export function getShowableAchievementNumbers(): string[] {
  const entries = buildAchievementsList()
  return entries.filter(e => e.unlocked).map(e => e.index.toString())
}

function executeList(env: SecretConsoleEnv) {
  const entries = buildAchievementsList()
  const unlockedEntries = entries.filter(e => e.unlocked)
  const lockedEntries = entries.filter(e => !e.unlocked)

  env.appendOutput(`Achievements: ${unlockedEntries.length}/${entries.length} unlocked`)

  if (unlockedEntries.length > 0) {
    const unlockedList = unlockedEntries
      .map(entry => {
        const def = ACHIEVEMENTS[entry.id]
        return `${entry.index}:${def.icon}`
      })
      .join(' ')
    env.appendOutput(`Unlocked: ${unlockedList}`)
  }

  if (lockedEntries.length > 0) {
    const lockedList = lockedEntries.map(entry => `${entry.index}:?`).join(' ')
    env.appendOutput(`Locked: ${lockedList}`)
  }

  env.appendOutput("Use 'hint <n>' or 'show <n>' for details")
}

function executeHint(args: string[], env: SecretConsoleEnv) {
  if (args.length === 0) {
    env.appendOutput('Usage: achievements hint <n>')
    return
  }

  const num = Number.parseInt(args[0]!, 10)
  if (Number.isNaN(num) || num < 1) {
    env.appendOutput(`Invalid achievement number: ${args[0]}`)
    return
  }

  const entries = buildAchievementsList()
  const entry = entries.find(e => e.index === num)

  if (!entry) {
    env.appendOutput(`Achievement ${num} does not exist (valid range: 1-${entries.length})`)
    return
  }

  if (entry.unlocked) {
    const def = ACHIEVEMENTS[entry.id]
    env.appendOutput(`Achievement ${num} is already unlocked: ${def.icon} ${def.title}`)
    env.appendOutput("Use 'achievements show <n>' to see full details")
    return
  }

  const def = ACHIEVEMENTS[entry.id]
  env.appendOutput(`Hint: ${def.unlockHint}`)
}

function executeShow(args: string[], env: SecretConsoleEnv) {
  if (args.length === 0) {
    env.appendOutput('Usage: achievements show <n>')
    return
  }

  const num = Number.parseInt(args[0]!, 10)
  if (Number.isNaN(num) || num < 1) {
    env.appendOutput(`Invalid achievement number: ${args[0]}`)
    return
  }

  const entries = buildAchievementsList()
  const entry = entries.find(e => e.index === num)

  if (!entry) {
    env.appendOutput(`Achievement ${num} does not exist (valid range: 1-${entries.length})`)
    return
  }

  if (!entry.unlocked) {
    env.appendOutput(`Achievement ${num} is locked`)
    env.appendOutput("Use 'achievements hint <n>' to get a hint")
    return
  }

  const def = ACHIEVEMENTS[entry.id]
  env.appendOutput(`${def.icon} ${def.title}`)
  env.appendOutput('')
  env.appendOutput(def.cardDescription)

  if (entry.timestamp) {
    try {
      const date = new Date(entry.timestamp)
      env.appendOutput('')
      env.appendOutput(`Unlocked: ${date.toLocaleString()}`)
    } catch {
      // Invalid timestamp, skip
    }
  }
}

function executeAchievements(args: string[], env: SecretConsoleEnv) {
  if (args.length === 0) {
    // Default to list when no subcommand provided
    executeList(env)
    return
  }

  const subcommand = args[0]
  const subArgs = args.slice(1)

  switch (subcommand) {
    case 'list':
      executeList(env)
      break
    case 'hint':
      executeHint(subArgs, env)
      break
    case 'show':
      executeShow(subArgs, env)
      break
    default:
      env.appendOutput(`Unknown subcommand: ${subcommand}`)
      env.appendOutput('Usage: achievements [list|hint <n>|show <n>]')
  }
}

export const achievements: SecretConsoleCommand = {
  usage: 'achievements [list|hint <n>|show <n>]',
  help: 'achievements — view and explore your achievements',
  execute: executeAchievements,
  aliases: ['ach'],
  completion: {
    args: 'achievement-subcommands',
  },
}
