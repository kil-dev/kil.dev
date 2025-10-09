import { describe, expect, it } from 'vitest'
import { uname } from '../uname'
import { createMockEnv } from './test-utils'

describe('uname command', () => {
  it('outputs system name by default', () => {
    const { env, output } = createMockEnv()
    uname.execute([], env)
    expect(output).toEqual(['kil-web'])
  })

  it('outputs full system info with -a flag', () => {
    const { env, output } = createMockEnv()
    uname.execute(['-a'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toMatch(/^kil-web kil\.dev v1 /)
  })

  it('outputs system name even with other args', () => {
    const { env, output } = createMockEnv()
    uname.execute(['other'], env)
    expect(output).toEqual(['kil-web'])
  })

  it('has correct metadata', () => {
    expect(uname.usage).toBe(uname.usage)
    expect(uname.help).toBe(uname.help)
    expect(uname.completion).toEqual({ args: 'none', flags: ['-a'] })
  })
})
