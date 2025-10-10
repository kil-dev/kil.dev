import { describe, expect, it } from 'vitest'
import { formatWcNoSuchFile, wc } from '../wc'
import { createMockEnv } from './test-utils'

describe('wc command', () => {
  it('counts lines, words, and bytes correctly', () => {
    const { env, output } = createMockEnv()
    wc.execute(['/home/kil/.bashrc'], env)
    expect(output).toHaveLength(1)
    const parts = output[0]!.split(' ')
    expect(parts).toHaveLength(4) // lines, words, bytes, filename
    expect(parts[3]).toBe('/home/kil/.bashrc')
  })

  it('handles single line file', () => {
    const { env, output } = createMockEnv()
    wc.execute(['/home/kil/.profile'], env)
    expect(output).toHaveLength(1)
    const parts = output[0]!.split(' ')
    expect(parts).toHaveLength(4) // lines, words, bytes, filename
    expect(parts[3]).toBe('/home/kil/.profile')
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
