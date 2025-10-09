import { describe, expect, it } from 'vitest'
import { date } from '../date'
import { createMockEnv } from './test-utils'

describe('date command', () => {
  it('outputs current date as string', () => {
    const { env, output } = createMockEnv()
    date.execute([], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toMatch(/^\w{3} \w{3} \d{2} \d{4}/)
  })

  it('ignores any arguments', () => {
    const { env, output } = createMockEnv()
    date.execute(['ignored', 'args'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toMatch(/^\w{3} \w{3} \d{2} \d{4}/)
  })

  it('has correct metadata', () => {
    expect(date.usage).toBe(date.usage)
    expect(date.help).toBe(date.help)
    expect(date.completion).toEqual({ args: 'none' })
  })
})
