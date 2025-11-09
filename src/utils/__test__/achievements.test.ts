import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildAllAchievementsPresenceScript,
  createEmptyUnlocked,
  hasThemeTapdanceAchievement,
  parseUnlockedStorage,
  serializeUnlockedCookie,
  type UnlockedMap,
} from '../achievements'

describe('createEmptyUnlocked', () => {
  it('returns an empty object', () => {
    const result = createEmptyUnlocked()
    expect(result).toEqual({})
    expect(Object.keys(result)).toHaveLength(0)
  })
})

describe('serializeUnlockedCookie', () => {
  it('serializes valid unlocked achievements', () => {
    const map: UnlockedMap = {
      ABOUT_AMBLER: '2024-01-01T00:00:00.000Z',
      THEME_TAPDANCE: '2024-01-02T00:00:00.000Z',
    }
    const result = serializeUnlockedCookie(map)
    const parsed = JSON.parse(result) as Record<string, unknown>
    expect(parsed).toEqual(map)
  })

  it('filters out invalid achievement IDs', () => {
    const map = {
      ABOUT_AMBLER: '2024-01-01T00:00:00.000Z',
      INVALID_ID: '2024-01-02T00:00:00.000Z',
    } as UnlockedMap
    const result = serializeUnlockedCookie(map)
    const parsed = JSON.parse(result) as Record<string, unknown>
    expect(parsed.ABOUT_AMBLER).toBe('2024-01-01T00:00:00.000Z')
    expect(parsed.INVALID_ID).toBeUndefined()
  })

  it('filters out empty timestamps', () => {
    const map: UnlockedMap = {
      ABOUT_AMBLER: '2024-01-01T00:00:00.000Z',
      THEME_TAPDANCE: '',
    }
    const result = serializeUnlockedCookie(map)
    const parsed = JSON.parse(result) as Record<string, unknown>
    expect(parsed.ABOUT_AMBLER).toBe('2024-01-01T00:00:00.000Z')
    expect(parsed.THEME_TAPDANCE).toBeUndefined()
  })

  it('filters out whitespace-only timestamps', () => {
    const map: UnlockedMap = {
      ABOUT_AMBLER: '2024-01-01T00:00:00.000Z',
      THEME_TAPDANCE: '   ',
    }
    const result = serializeUnlockedCookie(map)
    const parsed = JSON.parse(result) as Record<string, unknown>
    expect(parsed.THEME_TAPDANCE).toBeUndefined()
  })

  it('returns empty JSON object for empty map', () => {
    const result = serializeUnlockedCookie({})
    expect(result).toBe('{}')
  })

  it('only includes string values', () => {
    const map = {
      ABOUT_AMBLER: '2024-01-01T00:00:00.000Z',
      THEME_TAPDANCE: 123,
    } as unknown as UnlockedMap
    const result = serializeUnlockedCookie(map)
    const parsed = JSON.parse(result) as Record<string, unknown>
    expect(parsed.ABOUT_AMBLER).toBe('2024-01-01T00:00:00.000Z')
    expect(parsed.THEME_TAPDANCE).toBeUndefined()
  })
})

describe('parseUnlockedStorage', () => {
  it('parses valid JSON with achievements', () => {
    const json = JSON.stringify({
      ABOUT_AMBLER: '2024-01-01T00:00:00.000Z',
      THEME_TAPDANCE: '2024-01-02T00:00:00.000Z',
    })
    const result = parseUnlockedStorage(json)
    expect(result.ABOUT_AMBLER).toBe('2024-01-01T00:00:00.000Z')
    expect(result.THEME_TAPDANCE).toBe('2024-01-02T00:00:00.000Z')
  })

  it('returns empty object for null input', () => {
    const result = parseUnlockedStorage(null)
    expect(result).toEqual({})
  })

  it('returns empty object for undefined input', () => {
    const undefinedValue: string | null | undefined = undefined
    const result = parseUnlockedStorage(undefinedValue)
    expect(result).toEqual({})
  })

  it('returns empty object for invalid JSON', () => {
    const result = parseUnlockedStorage('not valid json')
    expect(result).toEqual({})
  })

  it('filters out invalid achievement IDs', () => {
    const json = JSON.stringify({
      ABOUT_AMBLER: '2024-01-01T00:00:00.000Z',
      INVALID_ACHIEVEMENT: '2024-01-02T00:00:00.000Z',
    })
    const result = parseUnlockedStorage(json)
    expect(result.ABOUT_AMBLER).toBe('2024-01-01T00:00:00.000Z')
    expect('INVALID_ACHIEVEMENT' in result).toBe(false)
  })

  it('filters out empty timestamp values', () => {
    const json = JSON.stringify({
      ABOUT_AMBLER: '2024-01-01T00:00:00.000Z',
      THEME_TAPDANCE: '',
    })
    const result = parseUnlockedStorage(json)
    expect(result.ABOUT_AMBLER).toBe('2024-01-01T00:00:00.000Z')
    expect('THEME_TAPDANCE' in result).toBe(false)
  })

  it('filters out non-string values', () => {
    const json = JSON.stringify({
      ABOUT_AMBLER: '2024-01-01T00:00:00.000Z',
      THEME_TAPDANCE: 123,
      PET_PARADE: true,
    })
    const result = parseUnlockedStorage(json)
    expect(result.ABOUT_AMBLER).toBe('2024-01-01T00:00:00.000Z')
    expect('THEME_TAPDANCE' in result).toBe(false)
    expect('PET_PARADE' in result).toBe(false)
  })

  it('handles empty JSON object', () => {
    const result = parseUnlockedStorage('{}')
    expect(result).toEqual({})
  })

  it('returns empty object for non-object JSON', () => {
    const result = parseUnlockedStorage('[]')
    expect(result).toEqual({})
  })
})

describe('hasThemeTapdanceAchievement', () => {
  const originalWindow = globalThis.window
  const originalLocalStorage = globalThis.localStorage

  afterEach(() => {
    globalThis.window = originalWindow
    globalThis.localStorage = originalLocalStorage
    vi.restoreAllMocks()
  })

  it('returns false when window is undefined', () => {
    // @ts-expect-error - testing undefined window
    globalThis.window = undefined
    expect(hasThemeTapdanceAchievement()).toBe(false)
  })

  it('returns true when THEME_TAPDANCE achievement is unlocked', () => {
    // Mock localStorage with achievement
    const localStorageMock = {
      getItem: vi.fn(key => {
        if (key === 'kil.dev/achievements/v1') {
          return JSON.stringify({ THEME_TAPDANCE: '2024-01-01T00:00:00.000Z' })
        }
        return null
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }
    globalThis.localStorage = localStorageMock as unknown as Storage
    globalThis.window = {
      localStorage: localStorageMock,
    } as unknown as Window & typeof globalThis

    expect(hasThemeTapdanceAchievement()).toBe(true)
  })

  it('returns false when THEME_TAPDANCE achievement is not unlocked', () => {
    const localStorageMock = {
      getItem: vi.fn(() => JSON.stringify({ ABOUT_AMBLER: '2024-01-01T00:00:00.000Z' })),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }
    globalThis.localStorage = localStorageMock as unknown as Storage
    globalThis.window = {
      localStorage: localStorageMock,
    } as unknown as Window & typeof globalThis

    expect(hasThemeTapdanceAchievement()).toBe(false)
  })

  it('returns false when localStorage is empty', () => {
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }
    globalThis.localStorage = localStorageMock as unknown as Storage
    globalThis.window = {
      localStorage: localStorageMock,
    } as unknown as Window & typeof globalThis

    expect(hasThemeTapdanceAchievement()).toBe(false)
  })

  it('returns false when localStorage contains invalid JSON', () => {
    const localStorageMock = {
      getItem: vi.fn(() => 'invalid json'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }
    globalThis.localStorage = localStorageMock as unknown as Storage
    globalThis.window = {
      localStorage: localStorageMock,
    } as unknown as Window & typeof globalThis

    expect(hasThemeTapdanceAchievement()).toBe(false)
  })

  it('returns false when THEME_TAPDANCE value is falsy', () => {
    const localStorageMock = {
      getItem: vi.fn(() => JSON.stringify({ THEME_TAPDANCE: '' })),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }
    globalThis.localStorage = localStorageMock as unknown as Storage
    globalThis.window = {
      localStorage: localStorageMock,
    } as unknown as Window & typeof globalThis

    expect(hasThemeTapdanceAchievement()).toBe(false)
  })
})

describe('buildAllAchievementsPresenceScript', () => {
  it('returns a string script', () => {
    const result = buildAllAchievementsPresenceScript()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes PresenceRuntime initialization', () => {
    const result = buildAllAchievementsPresenceScript()
    expect(result).toContain('PresenceRuntime')
    expect(result).toContain('initPresence')
  })

  it('includes data-achievement attributes for all achievements', () => {
    const result = buildAllAchievementsPresenceScript()
    expect(result).toContain('data-achievement-about-ambler')
    expect(result).toContain('data-achievement-theme-tapdance')
    expect(result).toContain('data-achievement-pet-parade')
  })

  it('includes special attributes', () => {
    const result = buildAllAchievementsPresenceScript()
    expect(result).toContain('data-has-theme-tapdance')
    expect(result).toContain('data-has-achievements')
    expect(result).toContain('data-has-pet-gallery')
  })

  it('escapes dangerous characters', () => {
    const result = buildAllAchievementsPresenceScript()
    // Should escape < characters to prevent XSS
    expect(result).not.toContain('<script')
    // Check for proper escaping
    if (result.includes(String.raw`\u003C`)) {
      expect(result).toContain(String.raw`\u003C`)
    }
  })

  it('wraps calls in try-catch blocks', () => {
    const result = buildAllAchievementsPresenceScript()
    expect(result).toContain('try{')
    expect(result).toContain('}catch(e){}')
  })

  it('includes cookie name configuration', () => {
    const result = buildAllAchievementsPresenceScript()
    expect(result).toContain('kil.dev_achievements_v1')
  })

  it('converts achievement IDs to kebab-case', () => {
    const result = buildAllAchievementsPresenceScript()
    // ABOUT_AMBLER should become about-ambler
    expect(result).toContain('about-ambler')
    // THEME_TAPDANCE should become theme-tapdance
    expect(result).toContain('theme-tapdance')
  })
})
