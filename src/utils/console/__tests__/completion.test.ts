import { beforeEach, describe, expect, it, vi } from 'vitest'
import { normalizePath } from '../../secret-console-vfs'
import { computeTabCompletion } from '../completion'
import { Commands } from '../index'
import { createMockEnv } from './test-utils'

describe('tab completion', () => {
  const commands = Commands

  beforeEach(() => {
    // Ensure any globals used by completion are deterministic between tests
    vi.restoreAllMocks()
  })

  it('completes first token (command names) with common prefix', () => {
    const { env } = createMockEnv()
    const value = 'e'
    const caret = value.length
    const res = computeTabCompletion(value, caret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    // Multiple commands start with 'e' (echo, exit), so it should extend to common prefix 'e' or provide suggestions
    expect(res.value.startsWith('e')).toBe(true)
    expect(res.caret).toBeGreaterThan(0)
    // Either suggestions or completed to a longer common prefix like 'e'
  })

  it('completes first token to a single command', () => {
    const { env } = createMockEnv()
    const value = 'pw'
    const caret = value.length
    const res = computeTabCompletion(value, caret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    expect(res.value).toBe('pwd ')
    expect(res.caret).toBe(4)
  })

  it('shows command suggestions when caret on first empty token', () => {
    const { env } = createMockEnv()
    const value = ''
    const caret = 0
    const res = computeTabCompletion(value, caret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    expect(res.caret).toBe(0)
    expect(Array.isArray(res.suggestions)).toBe(true)
    expect(res.suggestions?.length).toBeGreaterThan(0)
    expect(res.suggestions).toContain('ls')
    expect(res.suggestions).toContain('echo')
  })

  it('completes flags for commands that define them', () => {
    const { env } = createMockEnv()
    const value = 'head -'
    const caret = value.length
    const res = computeTabCompletion(value, caret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    // head supports -n
    expect(res.value).toBe('head -n')
    expect(res.caret).toBe('head -n'.length)
  })

  it('completes VFS paths for file arguments (files mode)', () => {
    const { env } = createMockEnv()
    // cd to /home to test relative completion
    env.chdir('/home')
    const value = 'cat RE'
    const caret = value.length
    const res = computeTabCompletion(value, caret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    // Should extend token toward README.md
    expect(res.value.startsWith('cat RE')).toBe(true)
    expect(res.value.includes('README')).toBe(true)
    expect(res.caret).toBeGreaterThan('cat RE'.length)
  })

  it('completes folders for folder arguments (folders mode)', () => {
    const { env } = createMockEnv()
    // cd uses folders mode
    const value = 'cd /home/ab'
    const caret = value.length
    const res = computeTabCompletion(value, caret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    // Should complete toward /home/about/
    expect(res.value).toBe('cd /home/about/')
    expect(res.caret).toBe('cd /home/about/'.length)
  })

  it('does not complete a second positional arg when maxPositionalArgs=1 (e.g., "ls docs/ <tab>")', () => {
    const { env } = createMockEnv({
      list: path => {
        const n = normalizePath(path)
        if (n === '/home') {
          return [
            { name: 'docs/', isDir: true },
            { name: 'downloads/', isDir: true },
          ]
        }
        if (n === '/home/docs') {
          return [
            { name: 'readme.md', isDir: false },
          ]
        }
        return []
      },
    })
    env.chdir('/home')

    // First complete the directory name
    const firstValue = 'ls doc'
    const firstRes = computeTabCompletion(firstValue, firstValue.length, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    // Should have advanced toward 'docs/'
    expect(firstRes.value.startsWith('ls ')).toBe(true)
    expect(firstRes.value.includes('docs/')).toBe(true)

    // Now simulate user has completed to 'ls docs/' and presses Tab again
    const secondValue = 'ls docs/ '
    const secondRes = computeTabCompletion(secondValue, secondValue.length, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    // Should not suggest another positional completion (max 1 positional arg)
    expect(secondRes.value).toBe(secondValue)
    expect(secondRes.caret).toBe(secondValue.length)
  })

  it('lists suggestions when multiple folder matches', () => {
    const { env } = createMockEnv({
      list: path => {
        if (normalizePath(path) === '/home') {
          return [
            { name: 'alpha/', isDir: true },
            { name: 'about/', isDir: true },
            { name: 'projects/', isDir: true },
          ]
        }
        return []
      },
    })
    const value = 'cd a'
    const caret = value.length
    const res = computeTabCompletion(value, caret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    expect(Array.isArray(res.suggestions)).toBe(true)
    expect(res.suggestions).toContain('about/')
    expect(res.suggestions).toContain('alpha/')
  })

  it('completes command arguments when args: commands', () => {
    const { env } = createMockEnv()
    const value = 'help c'
    const caret = value.length
    const res = computeTabCompletion(value, caret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    // Should extend toward commands like cat, cd, commands
    expect(res.value.startsWith('help c')).toBe(true)
    // Should at least narrow the prefix or provide suggestions
    if (res.suggestions) {
      expect(res.suggestions.some(s => s.startsWith('c'))).toBe(true)
    }
  })

  it('completes themes for theme command', () => {
    // Mock localStorage and seasonal filtering used by completion
    const { env } = createMockEnv()
    globalThis.window = {} as Window & typeof globalThis
    const stored: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: vi.fn((k: string) => stored[k] ?? null),
      setItem: vi.fn((k: string, v: string) => {
        stored[k] = v
      }),
      removeItem: vi.fn((k: string) => {
        delete stored[k]
      }),
      clear: vi.fn(() => {
        for (const k of Object.keys(stored)) delete stored[k]
      }),
      key: vi.fn(),
      length: 0,
    }

    const value = 'theme s'
    const caret = value.length
    const res = computeTabCompletion(value, caret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })

    // Should complete towards 'system '
    expect(res.value.startsWith('theme ')).toBe(true)
    expect(res.value.includes('system')).toBe(true)
  })

  it('stops auto-completing after a theme is selected', () => {
    const { env } = createMockEnv()
    globalThis.window = {} as Window & typeof globalThis
    const stored: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: vi.fn((k: string) => stored[k] ?? null),
      setItem: vi.fn((k: string, v: string) => {
        stored[k] = v
      }),
      removeItem: vi.fn((k: string) => {
        delete stored[k]
      }),
      clear: vi.fn(() => {
        for (const k of Object.keys(stored)) delete stored[k]
      }),
      key: vi.fn(),
      length: 0,
    }

    // First completion selects a single theme (e.g., system) and appends a trailing space
    const initialValue = 'theme s'
    const initialCaret = initialValue.length
    const first = computeTabCompletion(initialValue, initialCaret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    expect(first.value).toContain('theme ')
    expect(first.value.endsWith(' ')).toBe(true)

    // Second completion should not change value or caret (no further selection to make)
    const second = computeTabCompletion(first.value, first.caret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    expect(second.value).toBe(first.value)
    expect(second.caret).toBe(first.caret)
  })

  it('does not complete a second token for theme (e.g., "theme system d<tab>")', () => {
    const { env } = createMockEnv()
    globalThis.window = {} as Window & typeof globalThis
    const stored: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: vi.fn((k: string) => stored[k] ?? null),
      setItem: vi.fn((k: string, v: string) => {
        stored[k] = v
      }),
      removeItem: vi.fn((k: string) => {
        delete stored[k]
      }),
      clear: vi.fn(() => {
        for (const k of Object.keys(stored)) delete stored[k]
      }),
      key: vi.fn(),
      length: 0,
    }

    const value = 'theme system d'
    const caret = value.length
    const res = computeTabCompletion(value, caret, {
      commands,
      resolveCommand: name => (name in commands ? name : undefined),
      cwd: env.pwd(),
      list: path => env.list(path),
      normalizePath,
    })
    // Should not change since theme accepts only one argument
    expect(res.value).toBe(value)
    expect(res.caret).toBe(caret)
  })
})
