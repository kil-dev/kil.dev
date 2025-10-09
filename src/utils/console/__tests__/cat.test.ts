import { describe, expect, it } from 'vitest'
import { cat, formatCatNoSuchFile } from '../cat'
import { createMockEnv } from './test-utils'

describe('cat command', () => {
  it('outputs file contents', () => {
    const { env, output } = createMockEnv()
    cat.execute(['/home/README.md'], env)
    expect(output).toEqual([
      'Welcome to kil.dev\nThis is a test file.\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10\nLine 11\nLine 12',
    ])
  })

  it('shows usage when no path provided', () => {
    const { env, output } = createMockEnv()
    cat.execute([], env)
    expect(output).toEqual([`usage: ${cat.usage}`])
  })

  it('shows error when file not found', () => {
    const { env, output } = createMockEnv()
    cat.execute(['/nonexistent.txt'], env)
    expect(output).toEqual([formatCatNoSuchFile('/nonexistent.txt')])
  })

  it('joins multiple args as path (with spaces)', () => {
    const { env, output } = createMockEnv({
      read: path => (path === '/home/file with spaces.txt' ? 'content' : undefined),
    })
    cat.execute(['/home/file', 'with', 'spaces.txt'], env)
    expect(output).toEqual(['content'])
  })

  it('has correct metadata', () => {
    expect(cat.usage).toBe(cat.usage)
    expect(cat.help).toBe(cat.help)
    expect(cat.completion).toEqual({ args: 'files' })
  })
})
