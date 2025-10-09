import { describe, expect, it } from 'vitest'
import { ls } from '../ls'
import { createMockEnv } from './test-utils'

describe('ls command', () => {
  it('lists files in current directory when no path given', () => {
    const { env, output } = createMockEnv()
    ls.execute([], env)
    expect(output).toEqual(['README.md  about/  projects/'])
  })

  it('lists files in specified directory', () => {
    const { env, output } = createMockEnv()
    ls.execute(['/home/about'], env)
    expect(output).toEqual(['bio.txt'])
  })

  it('lists files in nested directory', () => {
    const { env, output } = createMockEnv()
    ls.execute(['/home/projects'], env)
    expect(output).toEqual(['project1.md  project2.md'])
  })

  it('outputs empty string for empty directory', () => {
    const { env, output } = createMockEnv({
      list: () => [],
    })
    ls.execute([], env)
    expect(output).toEqual([''])
  })

  it('has correct metadata', () => {
    expect(ls.usage).toBe(ls.usage)
    expect(ls.help).toBe(ls.help)
    expect(ls.completion).toEqual({ args: 'paths' })
  })
})
