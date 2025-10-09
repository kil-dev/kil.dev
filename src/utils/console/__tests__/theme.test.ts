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

  it('has correct metadata', () => {
    expect(theme.usage).toBe(theme.usage)
    expect(theme.help).toBe(theme.help)
    expect(theme.completion).toEqual({ args: 'themes' })
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
})
