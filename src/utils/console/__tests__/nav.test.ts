import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAvailablePageNames, nav } from '../nav'
import { createMockEnv } from './test-utils'

describe('nav command', () => {
  let originalLocation: Location | undefined
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

    // Save original window.location
    originalLocation = globalThis.window?.location
    // Mock window.location
    const mockLocation = { href: '' } as Location
    Object.defineProperty(globalThis.window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    })

    // Mock window.dispatchEvent
    Object.defineProperty(globalThis.window, 'dispatchEvent', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })

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
    // Set localStorage on both window and globalThis to ensure they're the same reference
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
    // Restore window.location
    if (originalLocation && globalThis.window) {
      Object.defineProperty(globalThis.window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    }
    // Restore localStorage on both window and globalThis
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

  describe('execution without arguments', () => {
    it('should list all available pages when no achievements', () => {
      const { env, output } = createMockEnv()
      nav.execute([], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('Available pages:')
      expect(outputStr).toContain('home → /')
      expect(outputStr).toContain('about → /about')
      expect(outputStr).toContain('experience → /experience')
      expect(outputStr).toContain('projects → /projects')
      expect(outputStr).toContain('418 → /418')
      // Gated pages should not appear
      expect(outputStr).not.toContain('achievements')
      expect(outputStr).not.toContain('pet-gallery')
    })

    it('should list achievements page when RECURSIVE_REWARD is unlocked', () => {
      // Mock unlocked achievement
      globalThis.window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({ RECURSIVE_REWARD: '2024-01-01' }),
      )

      const { env, output } = createMockEnv()
      nav.execute([], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('achievements → /achievements')
      expect(outputStr).not.toContain('pet-gallery')
    })

    it('should list pet-gallery page when PET_PARADE is unlocked', () => {
      // Mock unlocked achievement
      globalThis.window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({ PET_PARADE: '2024-01-01' }),
      )

      const { env, output } = createMockEnv()
      nav.execute([], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('pet-gallery → /pet-gallery')
      expect(outputStr).not.toContain('achievements')
    })

    it('should list all pages when all achievements are unlocked', () => {
      // Mock unlocked achievements
      globalThis.window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({ RECURSIVE_REWARD: '2024-01-01', PET_PARADE: '2024-01-01' }),
      )

      const { env, output } = createMockEnv()
      nav.execute([], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('achievements → /achievements')
      expect(outputStr).toContain('pet-gallery → /pet-gallery')
    })
  })

  describe('execution with valid page argument', () => {
    it('should dispatch navigation event for home page', () => {
      const { env } = createMockEnv()
      vi.clearAllMocks()

      nav.execute(['home'], env)

      expect(globalThis.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'kd:console-navigate',
          detail: { route: '/' },
        }),
      )
    })

    it('should dispatch navigation event for about page', () => {
      const { env } = createMockEnv()
      vi.clearAllMocks()

      nav.execute(['about'], env)

      expect(globalThis.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'kd:console-navigate',
          detail: { route: '/about' },
        }),
      )
    })

    it('should dispatch navigation event for 418 page', () => {
      const { env } = createMockEnv()
      vi.clearAllMocks()

      nav.execute(['418'], env)

      expect(globalThis.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'kd:console-navigate',
          detail: { route: '/418' },
        }),
      )
    })
  })

  describe('execution with gated page argument', () => {
    it('should show generic error when navigating to achievements without achievement', () => {
      const { env, output } = createMockEnv()
      vi.clearAllMocks()

      nav.execute(['achievements'], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('nav: achievements: No such page')
      expect(globalThis.window.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should dispatch navigation event for achievements when RECURSIVE_REWARD is unlocked', () => {
      globalThis.window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({ RECURSIVE_REWARD: '2024-01-01' }),
      )

      const { env } = createMockEnv()
      vi.clearAllMocks()

      nav.execute(['achievements'], env)

      expect(globalThis.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'kd:console-navigate',
          detail: { route: '/achievements' },
        }),
      )
    })

    it('should show generic error when navigating to pet-gallery without achievement', () => {
      const { env, output } = createMockEnv()
      vi.clearAllMocks()

      nav.execute(['pet-gallery'], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('nav: pet-gallery: No such page')
      expect(globalThis.window.dispatchEvent).not.toHaveBeenCalled()
    })

    it('should dispatch navigation event for pet-gallery when PET_PARADE is unlocked', () => {
      globalThis.window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({ PET_PARADE: '2024-01-01' }),
      )

      const { env } = createMockEnv()
      vi.clearAllMocks()

      nav.execute(['pet-gallery'], env)

      expect(globalThis.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'kd:console-navigate',
          detail: { route: '/pet-gallery' },
        }),
      )
    })
  })

  describe('execution with invalid page argument', () => {
    it('should show error for non-existent page', () => {
      const { env, output } = createMockEnv()
      vi.clearAllMocks()

      nav.execute(['invalid-page'], env)

      const outputStr = output.join('\n')
      expect(outputStr).toContain('nav: invalid-page: No such page')
      expect(globalThis.window.dispatchEvent).not.toHaveBeenCalled()
    })
  })

  describe('getAvailablePageNames', () => {
    it('should return only non-gated pages when no achievements', () => {
      const pages = getAvailablePageNames()

      expect(pages).toContain('home')
      expect(pages).toContain('about')
      expect(pages).toContain('experience')
      expect(pages).toContain('projects')
      expect(pages).toContain('418')
      expect(pages).not.toContain('achievements')
      expect(pages).not.toContain('pet-gallery')
    })

    it('should include achievements when RECURSIVE_REWARD is unlocked', () => {
      globalThis.window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({ RECURSIVE_REWARD: '2024-01-01' }),
      )

      const pages = getAvailablePageNames()

      expect(pages).toContain('achievements')
      expect(pages).not.toContain('pet-gallery')
    })

    it('should include pet-gallery when PET_PARADE is unlocked', () => {
      globalThis.window.localStorage.setItem(
        LOCAL_STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({ PET_PARADE: '2024-01-01' }),
      )

      const pages = getAvailablePageNames()

      expect(pages).toContain('pet-gallery')
      expect(pages).not.toContain('achievements')
    })
  })
})
