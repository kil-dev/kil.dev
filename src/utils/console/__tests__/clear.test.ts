import { describe, expect, it } from 'vitest'
import { clear } from '../clear'
import { createMockEnv } from './test-utils'

describe('clear', () => {
  it('should clear the output', () => {
    const { env, output } = createMockEnv()

    // Add some output first
    env.appendOutput('line 1')
    env.appendOutput('line 2')
    env.appendOutput('line 3')

    expect(output).toHaveLength(3)

    // Execute clear
    clear.execute([], env)

    expect(output).toHaveLength(0)
  })

  it('should ignore any arguments', () => {
    const { env, output } = createMockEnv()

    env.appendOutput('test')
    expect(output).toHaveLength(1)

    clear.execute(['arg1', 'arg2'], env)

    expect(output).toHaveLength(0)
  })
})
