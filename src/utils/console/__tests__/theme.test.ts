import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theme } from '../theme'
import { createMockEnv } from './test-utils'

// Mock StorageEvent for tests
class MockStorageEvent extends Event {
  key: string | null
  newValue: string | null
  oldValue: string | null
  storageArea: Storage | null
  url: string

  constructor(type: string, init?: StorageEventInit) {
    super(type, init)
    this.key = init?.key ?? null
    this.newValue = init?.newValue ?? null
    this.oldValue = init?.oldValue ?? null
    this.storageArea = init?.storageArea ?? null
    this.url = init?.url ?? ''
  }
}

describe('theme command', () => {
  let mockLocalStorage: Record<string, string>
  let mockEvents: Event[]

  beforeEach(() => {
    mockLocalStorage = {}
    mockEvents = []

    // Mock localStorage
    globalThis.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key]
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {}
      }),
      key: vi.fn(),
      length: 0,
    }

    // Mock window
    globalThis.window = {} as Window & typeof globalThis

    // Mock StorageEvent
    globalThis.StorageEvent = MockStorageEvent as unknown as typeof StorageEvent

    // Mock globalThis.dispatchEvent
    globalThis.dispatchEvent = vi.fn((event: Event) => {
      mockEvents.push(event)
      return true
    })

    // Mock document
    globalThis.document = {
      documentElement: {
        dataset: {
          seasonalDefault: '',
          appliedTheme: 'light',
          seasonalOverlaysEnabled: '1',
        },
      },
    } as unknown as Document

    // Mock matchMedia
    globalThis.matchMedia = vi.fn(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof matchMedia
  })

  it('shows current theme and available themes when no arguments', () => {
    mockLocalStorage.theme = 'dark'
    const { env, output } = createMockEnv()
    theme.execute([], env)

    expect(output).toHaveLength(2)
    expect(output[0]).toBe(`Current theme: dark`)
    expect(output[1]).toContain('Available themes:')
    expect(output[1]).toContain('system')
  })

  it('shows system as current theme when nothing stored', () => {
    const { env, output } = createMockEnv()
    theme.execute([], env)

    expect(output[0]).toBe('Current theme: system')
  })

  it('changes theme to valid theme', () => {
    const { env, output } = createMockEnv()
    theme.execute(['dark'], env)

    expect(mockLocalStorage.theme).toBe('dark')
    expect(output).toContain('Theme changed to: dark')
  })

  it('rejects invalid theme', () => {
    const { env, output } = createMockEnv()
    theme.execute(['invalid-theme'], env)

    expect(output[0]).toContain('Invalid theme: invalid-theme')
    expect(output[1]).toContain('Available themes:')
  })

  it('does not allow dotcom before unlock', () => {
    const { env, output } = createMockEnv()
    theme.execute(['dotcom'], env)
    expect(output[0]).toContain('Invalid theme: dotcom')
  })

  it('allows dotcom after unlock flag is set', () => {
    const { env, output } = createMockEnv()
    mockLocalStorage.kd_dotcom_theme_unlocked = '1'
    theme.execute(['dotcom'], env)
    expect(mockLocalStorage.theme).toBe('dotcom')
    expect(output).toContain('Theme changed to: dotcom')
  })

  it('shows message when theme is already set', () => {
    mockLocalStorage.theme = 'dark'
    const { env, output } = createMockEnv()
    theme.execute(['dark'], env)

    expect(output).toEqual(['Theme is already set to: dark'])
  })

  it('dispatches storage event when changing theme', () => {
    const { env } = createMockEnv()
    theme.execute(['dark'], env)

    const storageEvent = mockEvents.find(e => e instanceof MockStorageEvent)
    expect(storageEvent).toBeDefined()
    if (storageEvent instanceof MockStorageEvent) {
      expect(storageEvent.key).toBe('theme')
      expect(storageEvent.newValue).toBe('dark')
    }
  })

  it('sets theme_updatedAt timestamp', () => {
    const { env } = createMockEnv()
    const before = Date.now()
    theme.execute(['dark'], env)
    const after = Date.now()

    const timestamp = Number(mockLocalStorage.theme_updatedAt)
    expect(timestamp).toBeGreaterThanOrEqual(before)
    expect(timestamp).toBeLessThanOrEqual(after)
  })

  it('handles localStorage errors gracefully', () => {
    globalThis.localStorage.getItem = vi.fn(() => {
      throw new Error('Storage error')
    })

    const { env, output } = createMockEnv()
    theme.execute([], env)

    expect(output).toEqual(['Unable to read current theme'])
  })

  it('handles theme change errors gracefully', () => {
    globalThis.localStorage.setItem = vi.fn(() => {
      throw new Error('Storage error')
    })

    const { env, output } = createMockEnv()
    theme.execute(['dark'], env)

    expect(output[0]).toContain('Failed to change theme:')
  })

  it('does not incorrectly report theme as visually active when classList does not contain it', () => {
    // Setup: user is on system theme, appliedTheme data says 'matrix' but classList doesn't contain it
    mockLocalStorage.theme = 'system'
    const mockClassList = {
      contains: vi.fn(() => false), // matrix is NOT in classList
      add: vi.fn(),
      remove: vi.fn(),
    }
    globalThis.document = {
      documentElement: {
        dataset: {
          seasonalDefault: '', // No seasonal theme active
          appliedTheme: 'matrix', // Stale data attribute from previous session
          seasonalOverlaysEnabled: '1',
        },
        classList: mockClassList,
      },
    } as unknown as Document

    const { env, output } = createMockEnv()
    theme.execute(['matrix'], env)

    // Should NOT say "Theme is already visually matrix" because classList doesn't contain it
    expect(output.some(line => line.includes('already visually matrix'))).toBe(false)
    expect(output).toContain('Theme changed to: matrix')
  })

  it('unlocks matrix achievement when switching to matrix for first time', () => {
    mockLocalStorage.theme = 'system'
    const mockClassList = {
      contains: vi.fn(() => false),
      add: vi.fn(),
      remove: vi.fn(),
    }
    globalThis.document = {
      documentElement: {
        dataset: {
          seasonalDefault: '',
          appliedTheme: 'light',
          seasonalOverlaysEnabled: '1',
        },
        classList: mockClassList,
      },
    } as unknown as Document

    const { env } = createMockEnv()
    theme.execute(['matrix'], env)

    // Check that achievement unlock event was dispatched
    const achievementEvent = mockEvents.find(e => e.type === 'kd:unlock-achievement')
    expect(achievementEvent).toBeDefined()
    if (achievementEvent instanceof CustomEvent) {
      expect(achievementEvent.detail).toBeDefined()
      expect(achievementEvent.detail).toHaveProperty('achievementId', 'MATRIX_MAESTRO')
    }
    // Check that localStorage flag was set
    expect(mockLocalStorage.kd_matrix_theme_selected).toBe('1')
  })

  it('unlocks matrix achievement even when theme is already visually matrix', () => {
    // Scenario: user reset achievements but theme is already visually matrix
    mockLocalStorage.theme = 'system'
    // Note: kd_matrix_theme_selected is NOT set (was cleared by reset)
    const mockClassList = {
      contains: vi.fn((cls: string) => cls === 'matrix'), // matrix IS in classList
      add: vi.fn(),
      remove: vi.fn(),
    }
    globalThis.document = {
      documentElement: {
        dataset: {
          seasonalDefault: '',
          appliedTheme: 'matrix',
          seasonalOverlaysEnabled: '1',
        },
        classList: mockClassList,
      },
    } as unknown as Document

    const { env, output } = createMockEnv()
    theme.execute(['matrix'], env)

    // Should report theme is already visual (early return path)
    expect(output.some(line => line.includes('already visually matrix'))).toBe(true)

    // But should STILL unlock achievement
    const achievementEvent = mockEvents.find(e => e.type === 'kd:unlock-achievement')
    expect(achievementEvent).toBeDefined()
    if (achievementEvent instanceof CustomEvent) {
      expect(achievementEvent.detail).toBeDefined()
      expect(achievementEvent.detail).toHaveProperty('achievementId', 'MATRIX_MAESTRO')
    }
    expect(mockLocalStorage.kd_matrix_theme_selected).toBe('1')
  })

  it('does not unlock matrix achievement if already selected before', () => {
    mockLocalStorage.theme = 'system'
    mockLocalStorage.kd_matrix_theme_selected = '1' // Already selected before
    const mockClassList = {
      contains: vi.fn(() => false),
      add: vi.fn(),
      remove: vi.fn(),
    }
    globalThis.document = {
      documentElement: {
        dataset: {
          seasonalDefault: '',
          appliedTheme: 'light',
          seasonalOverlaysEnabled: '1',
        },
        classList: mockClassList,
      },
    } as unknown as Document

    const { env } = createMockEnv()
    theme.execute(['matrix'], env)

    // Should NOT dispatch achievement event
    const achievementEvent = mockEvents.find(e => e.type === 'kd:unlock-achievement')
    expect(achievementEvent).toBeUndefined()
  })
})
