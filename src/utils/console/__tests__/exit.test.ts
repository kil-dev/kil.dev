import { describe, expect, it } from 'vitest'
import { exit } from '../exit'
import { createMockEnv } from './test-utils'

describe('exit command', () => {
  it('requests console to close', () => {
    const { env, getCloseRequested } = createMockEnv()
    expect(getCloseRequested()).toBe(false)
    exit.execute([], env)
    expect(getCloseRequested()).toBe(true)
  })

  it('ignores any arguments', () => {
    const { env, getCloseRequested } = createMockEnv()
    exit.execute(['ignored'], env)
    expect(getCloseRequested()).toBe(true)
  })

  it('has correct metadata', () => {
    expect(exit.usage).toBe(exit.usage)
    expect(exit.help).toBe(exit.help)
  })
})
