import { describe, expect, it } from 'vitest'
import { ls } from '../ls'
import { createMockEnv } from './test-utils'

describe('ls command', () => {
  it('lists files in current directory when no path given', () => {
    const { env, output } = createMockEnv()
    ls.execute([], env)
    // Should list contents of /home/kil
    expect(output[0]).toContain('Documents/')
    expect(output[0]).toContain('projects/')
  })

  it('lists files in specified directory', () => {
    const { env, output } = createMockEnv()
    ls.execute(['/home/kil/Documents'], env)
    expect(output[0]).toContain('resume.txt')
    expect(output[0]).toContain('ideas.md')
  })

  it('lists files in nested directory', () => {
    const { env, output } = createMockEnv()
    ls.execute(['/home/kil/projects'], env)
    expect(output[0]).toContain('kil.dev/')
    expect(output[0]).toContain('dotfiles/')
  })

  it('outputs empty string for empty directory', () => {
    const { env, output } = createMockEnv({
      list: () => [],
    })
    ls.execute([], env)
    expect(output).toEqual([''])
  })
})
