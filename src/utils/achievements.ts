import { type AchievementId, ACHIEVEMENTS, ACHIEVEMENTS_COOKIE_NAME } from '@/lib/achievements'
import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import { PRESENCE_RUNTIME_BUNDLE } from '@/utils/presence-bundle'

export type UnlockedMap = Partial<Record<AchievementId, string>>

/**
 * Check if user has unlocked the THEME_TAPDANCE achievement
 * @returns true if the achievement is unlocked, false otherwise
 */
export function hasThemeTapdanceAchievement(): boolean {
  if (globalThis.window === undefined) return false
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENTS)
    if (!stored) return false
    const unlocked = JSON.parse(stored) as Record<string, unknown>
    return Boolean(unlocked.THEME_TAPDANCE)
  } catch {
    return false
  }
}

export function createEmptyUnlocked(): UnlockedMap {
  return {}
}

function isValidAchievementId(id: string): id is AchievementId {
  return Object.hasOwn(ACHIEVEMENTS, id)
}

export function serializeUnlockedCookie(map: UnlockedMap): string {
  // Persist only unlocked achievements with non-empty timestamps
  const payload: Record<string, string> = {}
  for (const [key, value] of Object.entries(map)) {
    if (isValidAchievementId(key) && typeof value === 'string' && value.trim().length > 0) {
      payload[key] = value
    }
  }
  return JSON.stringify(payload)
}

function sanitizeUnlockedRecord(obj: unknown): UnlockedMap {
  if (!obj || typeof obj !== 'object') return createEmptyUnlocked()
  const result: UnlockedMap = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (isValidAchievementId(key) && typeof value === 'string' && value.trim().length > 0) {
      result[key] = value
    }
  }
  return result
}

export function parseUnlockedStorage(raw: string | null | undefined): UnlockedMap {
  if (!raw) return createEmptyUnlocked()
  try {
    const parsed = JSON.parse(raw) as unknown
    return sanitizeUnlockedRecord(parsed)
  } catch {
    return createEmptyUnlocked()
  }
}

export function buildAllAchievementsPresenceScript(): string {
  const cookieName = ACHIEVEMENTS_COOKIE_NAME

  function toKebabCase(id: string): string {
    return id.toLowerCase().replaceAll('_', '-')
  }

  const calls: string[] = []

  // Generic attribute for every achievement: data-achievement-<kebab-id>
  for (const id of Object.keys(ACHIEVEMENTS)) {
    const attribute = `data-achievement-${toKebabCase(id)}`
    const cfg = { cookieName, key: id, attribute }
    const serializedCfg = JSON.stringify(cfg)
      .replaceAll('<', String.raw`\u003C`)
      .replaceAll('\u2028', String.raw`\u2028`)
      .replaceAll('\u2029', String.raw`\u2029`)
    calls.push(`;try{window.PresenceRuntime&&window.PresenceRuntime.initPresence(${serializedCfg})}catch(e){}`)
  }

  // Maintain existing special-case flags used for CSS-gated UI
  const special: Array<{ key: keyof typeof ACHIEVEMENTS; attribute: string }> = [
    { key: 'THEME_TAPDANCE', attribute: 'data-has-theme-tapdance' },
    { key: 'RECURSIVE_REWARD', attribute: 'data-has-achievements' },
    { key: 'PET_PARADE', attribute: 'data-has-pet-gallery' },
  ]
  for (const { key, attribute } of special) {
    if (!Object.hasOwn(ACHIEVEMENTS, key)) continue
    const cfg = { cookieName, key, attribute }
    const serializedCfg = JSON.stringify(cfg)
      .replaceAll('<', String.raw`\u003C`)
      .replaceAll('\u2028', String.raw`\u2028`)
      .replaceAll('\u2029', String.raw`\u2029`)
    calls.push(`;try{window.PresenceRuntime&&window.PresenceRuntime.initPresence(${serializedCfg})}catch(e){}`)
  }

  return PRESENCE_RUNTIME_BUNDLE + calls.join('')
}
