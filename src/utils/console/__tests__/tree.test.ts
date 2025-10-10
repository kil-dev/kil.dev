import { describe, expect, it } from 'vitest'
import { tree } from '../tree'
import { createMockEnv } from './test-utils'

describe('tree', () => {
  it('should display directory tree for current directory', () => {
    const { env, output } = createMockEnv()

    tree.execute(['.'], env)

    expect(output.length).toBeGreaterThan(0)
    expect(output[0]).toBe('/home/kil')
  })

  it('should show tree structure with box-drawing characters', () => {
    const { env, output } = createMockEnv()

    tree.execute(['/etc'], env)

    const treeLines = output.slice(1, -2) // Skip header and summary

    // Should have some tree structure characters
    const hasTreeChars = treeLines.some(line => line.includes('├──') || line.includes('└──'))
    expect(hasTreeChars).toBe(true)
  })

  it('should display summary with directory and file counts', () => {
    const { env, output } = createMockEnv()

    tree.execute(['/etc'], env)

    const summary = output.at(-1)!
    expect(summary).toMatch(/\d+ (directory|directories), \d+ (file|files)/)
  })

  it('should respect -L depth flag', () => {
    const { env, output } = createMockEnv()

    tree.execute(['-L', '1', '/home/kil'], env)

    // With depth 1, should only show immediate children
    // All lines should not have double indentation (should be shallow)
    const treeLines = output.slice(1, -2)
    const hasDeepIndent = treeLines.some(line => line.includes('│   │'))
    expect(hasDeepIndent).toBe(false)
  })

  it('should respect -d flag to show directories only', () => {
    const { env, output } = createMockEnv()

    tree.execute(['-d', '/home/kil'], env)

    const summary = output.at(-1)!
    // Should only mention directories, not files
    expect(summary).toMatch(/^\d+ (directory|directories)$/)
  })

  it('should handle non-existent path', () => {
    const { env, output } = createMockEnv()

    tree.execute(['/nonexistent'], env)

    expect(output).toHaveLength(1)
    expect(output[0]).toContain('No such file or directory')
  })

  it('should handle file path (not directory)', () => {
    const { env, output } = createMockEnv()

    tree.execute(['/etc/hostname'], env)

    expect(output).toHaveLength(1)
    expect(output[0]).toContain('Not a directory')
  })

  it('should combine -L and -d flags', () => {
    const { env, output } = createMockEnv()

    tree.execute(['-L', '2', '-d', '/home/kil'], env)

    const summary = output.at(-1)!
    expect(summary).toMatch(/^\d+ (directory|directories)$/)
  })

  it('should default to current directory when no path given', () => {
    const { env, output } = createMockEnv()

    tree.execute([], env)

    expect(output[0]).toBe('/home/kil')
  })
})
