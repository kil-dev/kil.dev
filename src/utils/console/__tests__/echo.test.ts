import { describe, expect, it } from 'vitest'
import { echo } from '../echo'
import { createMockEnv } from './test-utils'

describe('echo command', () => {
  it('outputs arguments joined by spaces', () => {
    const { env, output } = createMockEnv()
    echo.execute(['hello', 'world'], env)
    expect(output).toEqual(['hello world'])
  })

  it('outputs empty string when no arguments provided', () => {
    const { env, output } = createMockEnv()
    echo.execute([], env)
    expect(output).toEqual([''])
  })

  it('outputs single argument', () => {
    const { env, output } = createMockEnv()
    echo.execute(['test'], env)
    expect(output).toEqual(['test'])
  })

  it('preserves multiple spaces between arguments', () => {
    const { env, output } = createMockEnv()
    echo.execute(['one', 'two', 'three'], env)
    expect(output).toEqual(['one two three'])
  })
})
