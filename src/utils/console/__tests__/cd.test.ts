import { describe, expect, it } from 'vitest'
import { cd, formatCdNoSuchDirectory, formatCdNotDirectory } from '../cd'
import { createMockEnv } from './test-utils'

describe('cd command', () => {
  it('changes to specified directory successfully', () => {
    const { env, output } = createMockEnv()
    cd.execute(['/home/about'], env)
    expect(output).toEqual([])
    expect(env.pwd()).toBe('/home/about')
  })

  it('defaults to /home when no argument provided', () => {
    const { env, output } = createMockEnv()
    cd.execute([], env)
    expect(output).toEqual([])
    expect(env.pwd()).toBe('/home')
  })

  it('shows error when directory not found', () => {
    const { env, output } = createMockEnv()
    cd.execute(['/nonexistent'], env)
    expect(output).toEqual([formatCdNoSuchDirectory('/nonexistent')])
  })

  it('shows error when target is not a directory', () => {
    const { env, output } = createMockEnv()
    cd.execute(['/home/README.md'], env)
    expect(output).toEqual([formatCdNotDirectory('/home/README.md')])
  })
})
