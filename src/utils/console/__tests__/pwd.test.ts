import { describe, expect, it } from 'vitest'
import { pwd } from '../pwd'
import { createMockEnv } from './test-utils'

describe('pwd command', () => {
  it('outputs the current working directory', () => {
    const { env, output } = createMockEnv()
    pwd.execute([], env)
    expect(output).toEqual(['/home'])
  })

  it('ignores any arguments', () => {
    const { env, output } = createMockEnv()
    pwd.execute(['ignored', 'args'], env)
    expect(output).toEqual(['/home'])
  })
})
