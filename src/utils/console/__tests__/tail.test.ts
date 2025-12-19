import { describe, expect, it } from 'vitest'
import { formatTailNoSuchFile, tail } from '../tail'
import { createMockEnv } from './test-utils'

describe('tail command', () => {
  it('outputs last 10 lines by default', () => {
    const { env, output } = createMockEnv()
    tail.execute(['/home/kil/Documents/bookmarks.md'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('Inspiration')
    expect(output[0]).toContain('Share knowledge')
  })

  it('respects -n flag for custom line count', () => {
    const { env, output } = createMockEnv()
    tail.execute(['-n', '3', '/home/kil/Documents/bookmarks.md'], env)
    expect(output).toHaveLength(1)
    const lines = output[0]?.split('\n')
    expect(lines?.length).toBeLessThanOrEqual(3)
  })

  it('handles -n flag with count larger than file', () => {
    const { env, output } = createMockEnv()
    tail.execute(['-n', '1000', '/home/kil/.profile'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('export LANG=en_US.UTF-8')
  })

  it('shows usage when no path provided', () => {
    const { env, output } = createMockEnv()
    tail.execute([], env)
    expect(output).toEqual([`usage: ${tail.usage}`])
  })

  it('shows error when file not found', () => {
    const { env, output } = createMockEnv()
    tail.execute(['/nonexistent.txt'], env)
    expect(output).toEqual([formatTailNoSuchFile('/nonexistent.txt')])
  })

  it('handles invalid -n value', () => {
    const { env, output } = createMockEnv()
    tail.execute(['-n', 'invalid', '/home/README.md'], env)
    // When -n value is invalid, it treats the rest as a path
    expect(output).toEqual(['tail: invalid line count', `usage: ${tail.usage}`])
  })

  it('handles -n with zero or negative value', () => {
    const { env, output } = createMockEnv()
    tail.execute(['-n', '0', '/home/README.md'], env)
    // When -n value is invalid (0), it treats the rest as a path
    expect(output).toEqual(['tail: invalid line count', `usage: ${tail.usage}`])
  })
})
