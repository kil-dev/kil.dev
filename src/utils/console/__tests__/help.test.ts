import { describe, expect, it } from 'vitest'
import { formatNoSuchCommand } from '../help'
import { Commands } from '../index'
import { createMockEnv } from './test-utils'

const help = Commands.help

describe('help command', () => {
  it('shows general help message when no command specified', () => {
    const { env, output } = createMockEnv()
    help?.execute([], env)
    expect(output).toEqual([help?.help])
  })

  it('shows help for specific command', () => {
    const { env, output } = createMockEnv()
    help?.execute(['echo'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('echo')
    expect(output[0]).toContain('print arguments')
  })

  it('shows error for non-existent command', () => {
    const { env, output } = createMockEnv()
    help?.execute(['nonexistent'], env)
    expect(output).toEqual([formatNoSuchCommand('nonexistent')])
  })

  it('shows help for pwd command', () => {
    const { env, output } = createMockEnv()
    help?.execute(['pwd'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('pwd')
    expect(output[0]).toContain('print working directory')
  })

  it('shows aliases when command has them', () => {
    const { env, output } = createMockEnv()
    help?.execute(['achievements'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('achievements')
    expect(output[0]).toContain('Aliases: ach')
  })

  it('does not show aliases when command has none', () => {
    const { env, output } = createMockEnv()
    help?.execute(['echo'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('echo')
    expect(output[0]).not.toContain('Aliases')
  })

  it('resolves alias to command and shows aliases', () => {
    const { env, output } = createMockEnv()
    help?.execute(['ach'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('achievements')
    expect(output[0]).toContain('Aliases: ach')
  })

  it('shows aliases for help command itself', () => {
    const { env, output } = createMockEnv()
    help?.execute(['help'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('help')
    expect(output[0]).toContain('Aliases: ?')
  })

  it('resolves ? alias to help and shows aliases', () => {
    const { env, output } = createMockEnv()
    help?.execute(['?'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toContain('help')
    expect(output[0]).toContain('Aliases: ?')
  })
})
