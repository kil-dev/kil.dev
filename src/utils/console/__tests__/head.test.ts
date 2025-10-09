import { describe, expect, it } from 'vitest'
import { formatHeadNoSuchFile, head } from '../head'
import { createMockEnv } from './test-utils'

describe('head command', () => {
  it('outputs first 10 lines by default', () => {
    const { env, output } = createMockEnv()
    head.execute(['/home/README.md'], env)
    expect(output).toEqual([
      'Welcome to kil.dev\nThis is a test file.\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10',
    ])
  })

  it('respects -n flag for custom line count', () => {
    const { env, output } = createMockEnv()
    head.execute(['-n', '3', '/home/README.md'], env)
    expect(output).toEqual(['Welcome to kil.dev\nThis is a test file.\nLine 3'])
  })

  it('handles -n flag with count larger than file', () => {
    const { env, output } = createMockEnv()
    head.execute(['-n', '100', '/home/about/bio.txt'], env)
    expect(output).toEqual(['Software engineer and web developer.'])
  })

  it('shows usage when no path provided', () => {
    const { env, output } = createMockEnv()
    head.execute([], env)
    expect(output).toEqual([`usage: ${head.usage}`])
  })

  it('shows error when file not found', () => {
    const { env, output } = createMockEnv()
    head.execute(['/nonexistent.txt'], env)
    expect(output).toEqual([formatHeadNoSuchFile('/nonexistent.txt')])
  })

  it('handles invalid -n value', () => {
    const { env, output } = createMockEnv()
    head.execute(['-n', 'invalid', '/home/README.md'], env)
    // When -n value is invalid, it treats the rest as a path
    expect(output).toEqual([formatHeadNoSuchFile('-n invalid /home/README.md')])
  })

  it('handles -n with zero or negative value', () => {
    const { env, output } = createMockEnv()
    head.execute(['-n', '0', '/home/README.md'], env)
    // When -n value is invalid (0), it treats the rest as a path
    expect(output).toEqual([formatHeadNoSuchFile('-n 0 /home/README.md')])
  })
})
