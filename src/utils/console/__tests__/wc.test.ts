import { describe, expect, it } from 'vitest'
import { formatWcNoSuchFile, wc } from '../wc'
import { createMockEnv } from './test-utils'

describe('wc command', () => {
  it('counts lines, words, and bytes correctly', () => {
    const { env, output } = createMockEnv()
    wc.execute(['/home/README.md'], env)
    // "Welcome to kil.dev\nThis is a test file.\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10\nLine 11\nLine 12"
    // 11 new lines, 28 words, 112 bytes
    expect(output).toEqual(['11 28 112 /home/README.md'])
  })

  it('handles single line file', () => {
    const { env, output } = createMockEnv()
    wc.execute(['/home/about/bio.txt'], env)
    // "Software engineer and web developer."
    // 0 new lines, 5 words, 36 bytes
    expect(output).toEqual(['0 5 36 /home/about/bio.txt'])
  })

  it('handles empty file', () => {
    const { env, output } = createMockEnv({
      read: () => '',
    })
    wc.execute(['/home/empty.txt'], env)
    expect(output).toEqual(['0 0 0 /home/empty.txt'])
  })

  it('shows usage when no path provided', () => {
    const { env, output } = createMockEnv()
    wc.execute([], env)
    expect(output).toEqual([`usage: ${wc.usage}`])
  })

  it('shows error when file not found', () => {
    const { env, output } = createMockEnv()
    wc.execute(['/nonexistent.txt'], env)
    expect(output).toEqual([formatWcNoSuchFile('/nonexistent.txt')])
  })
})
