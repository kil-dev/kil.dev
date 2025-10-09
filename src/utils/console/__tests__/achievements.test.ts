import { ACHIEVEMENTS } from '@/lib/achievements'
import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  achievements,
  getAchievementSubcommands,
  getHintableAchievementNumbers,
  getShowableAchievementNumbers,
} from '../achievements'
import { createMockEnv } from './test-utils'

describe('achievements command', () => {
  let originalLocalStorage: Storage | undefined

  beforeEach(() => {
    // Setup window if it doesn't exist
    if (globalThis.window === undefined) {
      Object.defineProperty(globalThis, 'window', {
        value: {},
        writable: true,
        configurable: true,
      })
    }

    // Save and mock localStorage
    originalLocalStorage = globalThis.window?.localStorage
    const storage: Record<string, string> = {}
    const mockLocalStorage = {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key]
      }),
      clear: vi.fn(() => {
        for (const key of Object.keys(storage)) delete storage[key]
      }),
      key: vi.fn((index: number) => Object.keys(storage)[index] ?? null),
      get length() {
        return Object.keys(storage).length
      },
    } as unknown as Storage
    Object.defineProperty(globalThis.window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    // Restore localStorage
    if (originalLocalStorage && globalThis.window) {
      Object.defineProperty(globalThis.window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      })
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      })
    }
    vi.clearAllMocks()
  })

  describe('getAchievementSubcommands', () => {
    it('should return available subcommands', () => {
      const subcommands = getAchievementSubcommands()
      expect(subcommands).toEqual(['list', 'hint', 'show'])
    })
  })

  describe('no arguments (defaults to list)', () => {
    it('should show no achievements when none are unlocked', () => {
      const { env, output } = createMockEnv()
      achievements.execute([], env)

      const outputStr = output.join('\n')
      const totalAchievements = Object.keys(ACHIEVEMENTS).length
      expect(outputStr).toContain(`Achievements: 0/${totalAchievements} unlocked`)
      expect(outputStr).toContain('Locked:')
      expect(outputStr).not.toContain('Unlocked:')
      expect(outputStr).toContain("Use 'hint <n>' or 'show <n>' for details")
    })

    it('should show unlocked achievements when some are unlocked', () => {
      // Mock some unlocked achievements
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({
          ABOUT_AMBLER: '2024-01-15T10:00:00.000Z',
          KONAMI_KILLER: '2024-01-16T12:00:00.000Z',
        }),
      )

      const { env, output } = createMockEnv()
      achievements.execute([], env)

      const outputStr = output.join('\n')
      const totalAchievements = Object.keys(ACHIEVEMENTS).length
      expect(outputStr).toContain(`Achievements: 2/${totalAchievements} unlocked`)
      expect(outputStr).toContain('Unlocked:')
      expect(outputStr).toContain('Locked:')
      // Should show achievement numbers with emojis
      expect(outputStr).toMatch(/1:👋/)
      expect(outputStr).toMatch(/\d+:\?/)
    })

    it('should show all achievements when all are unlocked', () => {
      // Mock all achievements unlocked
      const allUnlocked: Record<string, string> = {}
      for (const id of Object.keys(ACHIEVEMENTS)) {
        allUnlocked[id] = '2024-01-15T10:00:00.000Z'
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(allUnlocked))

      const { env, output } = createMockEnv()
      achievements.execute([], env)

      const outputStr = output.join('\n')
      const totalAchievements = Object.keys(ACHIEVEMENTS).length
      expect(outputStr).toContain(`Achievements: ${totalAchievements}/${totalAchievements} unlocked`)
      expect(outputStr).toContain('Unlocked:')
      expect(outputStr).not.toContain('Locked:')
    })
  })

  describe('list subcommand', () => {
    it('should list achievements with compact format', () => {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({
          ABOUT_AMBLER: '2024-01-15T10:00:00.000Z',
        }),
      )

      const { env, output } = createMockEnv()
      achievements.execute(['list'], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('Achievements:')
      expect(outputStr).toContain('Unlocked:')
      expect(outputStr).toContain('Locked:')
    })
  })

  describe('hint subcommand', () => {
    it('should show usage when no argument provided', () => {
      const { env, output } = createMockEnv()
      achievements.execute(['hint'], env)

      expect(output[0]).toContain('Usage: achievements hint <n>')
    })

    it('should show hint for locked achievement', () => {
      const { env, output } = createMockEnv()
      // Achievement 1 (ABOUT_AMBLER) is locked
      achievements.execute(['hint', '1'], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('Hint:')
      expect(outputStr).toContain(ACHIEVEMENTS.ABOUT_AMBLER.unlockHint)
    })

    it('should show error when trying to get hint for unlocked achievement', () => {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({
          ABOUT_AMBLER: '2024-01-15T10:00:00.000Z',
        }),
      )

      const { env, output } = createMockEnv()
      achievements.execute(['hint', '1'], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('already unlocked')
      expect(outputStr).toContain('About Ambler')
      expect(outputStr).toContain("Use 'achievements show <n>' to see full details")
    })

    it('should show error for invalid achievement number', () => {
      const { env, output } = createMockEnv()
      achievements.execute(['hint', 'invalid'], env)

      expect(output[0]).toContain('Invalid achievement number: invalid')
    })

    it('should show error for achievement number out of range', () => {
      const { env, output } = createMockEnv()
      const totalAchievements = Object.keys(ACHIEVEMENTS).length
      achievements.execute(['hint', String(totalAchievements + 1)], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('does not exist')
      expect(outputStr).toContain(`valid range: 1-${totalAchievements}`)
    })

    it('should show error for zero or negative numbers', () => {
      const { env, output } = createMockEnv()
      achievements.execute(['hint', '0'], env)

      expect(output[0]).toContain('Invalid achievement number: 0')
    })
  })

  describe('show subcommand', () => {
    it('should show usage when no argument provided', () => {
      const { env, output } = createMockEnv()
      achievements.execute(['show'], env)

      expect(output[0]).toContain('Usage: achievements show <n>')
    })

    it('should show full details for unlocked achievement', () => {
      const timestamp = '2024-01-15T10:30:00.000Z'
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({
          ABOUT_AMBLER: timestamp,
        }),
      )

      const { env, output } = createMockEnv()
      achievements.execute(['show', '1'], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('About Ambler')
      expect(outputStr).toContain(ACHIEVEMENTS.ABOUT_AMBLER.cardDescription)
      expect(outputStr).toContain('Unlocked:')
      // Should format the timestamp
      expect(outputStr).toMatch(/Unlocked:.*2024/)
    })

    it('should show error when trying to show locked achievement', () => {
      const { env, output } = createMockEnv()
      achievements.execute(['show', '1'], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('Achievement 1 is locked')
      expect(outputStr).toContain("Use 'achievements hint <n>' to get a hint")
    })

    it('should show error for invalid achievement number', () => {
      const { env, output } = createMockEnv()
      achievements.execute(['show', 'abc'], env)

      expect(output[0]).toContain('Invalid achievement number: abc')
    })

    it('should show error for achievement number out of range', () => {
      const { env, output } = createMockEnv()
      const totalAchievements = Object.keys(ACHIEVEMENTS).length
      achievements.execute(['show', '999'], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('does not exist')
      expect(outputStr).toContain(`valid range: 1-${totalAchievements}`)
    })

    it('should handle achievements with invalid timestamps gracefully', () => {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({
          ABOUT_AMBLER: 'invalid-date',
        }),
      )

      const { env, output } = createMockEnv()
      achievements.execute(['show', '1'], env)

      const outputStr = output.join('\n')
      // Should still show the achievement, just without the timestamp
      expect(outputStr).toContain('About Ambler')
      expect(outputStr).toContain(ACHIEVEMENTS.ABOUT_AMBLER.cardDescription)
    })
  })

  describe('unknown subcommand', () => {
    it('should show error for unknown subcommand', () => {
      const { env, output } = createMockEnv()
      achievements.execute(['unknown'], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('Unknown subcommand: unknown')
      expect(outputStr).toContain('Usage: achievements [list|hint <n>|show <n>]')
    })
  })

  describe('getHintableAchievementNumbers', () => {
    it('should return numbers for locked achievements', () => {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({
          ABOUT_AMBLER: '2024-01-15T10:00:00.000Z',
          EXPERIENCE_EXPLORER: '2024-01-16T10:00:00.000Z',
        }),
      )

      const hintable = getHintableAchievementNumbers()
      expect(hintable).not.toContain('1') // ABOUT_AMBLER is unlocked
      expect(hintable).not.toContain('2') // EXPERIENCE_EXPLORER is unlocked
      expect(hintable.length).toBeGreaterThan(0)
      expect(hintable.every(n => !Number.isNaN(Number(n)))).toBe(true)
    })

    it('should return all numbers when no achievements unlocked', () => {
      const hintable = getHintableAchievementNumbers()
      const totalAchievements = Object.keys(ACHIEVEMENTS).length
      expect(hintable.length).toBe(totalAchievements)
      expect(hintable).toContain('1')
    })

    it('should return empty array when all achievements unlocked', () => {
      const allUnlocked: Record<string, string> = {}
      for (const id of Object.keys(ACHIEVEMENTS)) {
        allUnlocked[id] = '2024-01-15T10:00:00.000Z'
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(allUnlocked))

      const hintable = getHintableAchievementNumbers()
      expect(hintable.length).toBe(0)
    })
  })

  describe('getShowableAchievementNumbers', () => {
    it('should return numbers for unlocked achievements', () => {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({
          ABOUT_AMBLER: '2024-01-15T10:00:00.000Z',
          EXPERIENCE_EXPLORER: '2024-01-16T10:00:00.000Z',
        }),
      )

      const showable = getShowableAchievementNumbers()
      expect(showable).toContain('1') // ABOUT_AMBLER is unlocked
      expect(showable).toContain('2') // EXPERIENCE_EXPLORER is unlocked
      expect(showable.length).toBe(2)
    })

    it('should return empty array when no achievements unlocked', () => {
      const showable = getShowableAchievementNumbers()
      expect(showable.length).toBe(0)
    })

    it('should return all numbers when all achievements unlocked', () => {
      const allUnlocked: Record<string, string> = {}
      for (const id of Object.keys(ACHIEVEMENTS)) {
        allUnlocked[id] = '2024-01-15T10:00:00.000Z'
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(allUnlocked))

      const showable = getShowableAchievementNumbers()
      const totalAchievements = Object.keys(ACHIEVEMENTS).length
      expect(showable.length).toBe(totalAchievements)
    })
  })

  describe('command metadata', () => {
    it('should have correct usage', () => {
      expect(achievements.usage).toBe('achievements [list|hint <n>|show <n>]')
    })

    it('should have correct help text', () => {
      expect(achievements.help).toContain('achievements')
      expect(achievements.help).toContain('view')
    })

    it('should have ach alias', () => {
      expect(achievements.aliases).toContain('ach')
    })

    it('should have achievement-subcommands completion mode', () => {
      expect(achievements.completion?.args).toBe('achievement-subcommands')
    })
  })
})
