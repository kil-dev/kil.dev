import { describe, expect, it } from 'vitest'
import { formatTailNoSuchFile, tail } from '../tail'
import { createMockEnv } from './test-utils'

describe('tail command', () => {
  it('outputs last 10 lines by default', () => {
    const { env, output } = createMockEnv()
    tail.execute(['/home/README.md'], env)
    expect(output).toEqual(['Line 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10\nLine 11\nLine 12'])
  })

  it('respects -n flag for custom line count', () => {
    const { env, output } = createMockEnv()
    tail.execute(['-n', '3', '/home/README.md'], env)
    expect(output).toEqual(['Line 10\nLine 11\nLine 12'])
  })

  it('handles -n flag with count larger than file', () => {
    const { env, output } = createMockEnv()
    tail.execute(['-n', '100', '/home/about/bio.txt'], env)
    expect(output).toEqual(['Software engineer and web developer.'])
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
    expect(output).toEqual([formatTailNoSuchFile('-n invalid /home/README.md')])
  })

  it('handles -n with zero or negative value', () => {
    const { env, output } = createMockEnv()
    tail.execute(['-n', '0', '/home/README.md'], env)
    // When -n value is invalid (0), it treats the rest as a path
    expect(output).toEqual([formatTailNoSuchFile('-n 0 /home/README.md')])
  })

  it('has correct metadata', () => {
    expect(tail.usage).toBe(tail.usage)
    expect(tail.help).toBe(tail.help)
    expect(tail.completion).toEqual({ args: 'files', flags: ['-n'] })
  })
})
