import { describe, expect, it } from 'vitest'
import { Commands } from '../index'
import { createMockEnv } from './test-utils'

const commands = Commands.commands

describe('commands command', () => {
  it('lists all available commands', () => {
    const { env, output } = createMockEnv()
    commands?.execute([], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('ls')
    expect(output[0]).toContain('cd')
    expect(output[0]).toContain('echo')
    expect(output[0]).toContain('pwd')
    expect(output[0]).toContain('cat')
    expect(output[0]).toContain('theme')
  })

  it('ignores any arguments', () => {
    const { env, output } = createMockEnv()
    commands?.execute(['ignored'], env)
    expect(output).toHaveLength(1)
  })

  it('has correct metadata', () => {
    expect(commands?.usage).toBe('commands')
    expect(commands?.help).toBe('commands — list all commands')
  })
})
