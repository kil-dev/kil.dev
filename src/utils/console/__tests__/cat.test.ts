import { describe, expect, it } from 'vitest'
import { cat, formatCatNoSuchFile } from '../cat'
import { createMockEnv } from './test-utils'

describe('cat command', () => {
  it('outputs file contents', () => {
    const { env, output } = createMockEnv()
    cat.execute(['/home/kil/.bashrc'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('export PS1')
    expect(output[0]).toContain('alias ach="achievements"')
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
})
