import { describe, expect, it } from 'vitest'
import { uname } from '../uname'
import { createMockEnv } from './test-utils'

describe('uname command', () => {
  it('outputs system name by default', () => {
    const { env, output } = createMockEnv()
    uname.execute([], env)
    expect(output).toEqual(['kilOS'])
  })

  it('outputs full system info with -a flag', () => {
    const { env, output } = createMockEnv()
    uname.execute(['-a'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toMatch(/^kilOS kil-dev 1\.0 /)
  })

  it('outputs system name even with other args', () => {
    const { env, output } = createMockEnv()
    uname.execute(['other'], env)
    expect(output).toEqual(['kilOS'])
  })
})
