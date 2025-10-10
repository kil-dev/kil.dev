import { describe, expect, it } from 'vitest'
import { formatHeadNoSuchFile, head } from '../head'
import { createMockEnv } from './test-utils'

describe('head command', () => {
  it('outputs first 10 lines by default', () => {
    const { env, output } = createMockEnv()
    head.execute(['/home/kil/Documents/bookmarks.md'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('# Technical Bookmarks')
    expect(output[0]).toContain('## Kubernetes & Cloud Native')
  })

  it('respects -n flag for custom line count', () => {
    const { env, output } = createMockEnv()
    head.execute(['-n', '3', '/home/kil/Documents/bookmarks.md'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('# Technical Bookmarks')
    const lines = output[0]?.split('\n')
    expect(lines?.length).toBeLessThanOrEqual(3)
  })

  it('handles -n flag with count larger than file', () => {
    const { env, output } = createMockEnv()
    head.execute(['-n', '1000', '/home/kil/.profile'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('export LANG=en_US.UTF-8')
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
    head.execute(['-n', 'invalid', '/home/kil/.bashrc'], env)
    // When -n value is invalid, it treats the rest as a path
    expect(output).toEqual([
      'head: invalid line count',
      `usage: ${head.usage}`,
    ])
  })

  it('handles -n with zero or negative value', () => {
    const { env, output } = createMockEnv()
    head.execute(['-n', '0', '/home/kil/.bashrc'], env)
    // When -n value is invalid (0), it treats the rest as a path
    expect(output).toEqual([
      'head: invalid line count',
      `usage: ${head.usage}`,
    ])
  })
})
