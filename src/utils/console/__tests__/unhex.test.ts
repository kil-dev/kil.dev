import { describe, expect, it } from 'vitest'
import { unhex } from '../unhex'
import { createMockEnv } from './test-utils'

describe('unhex command', () => {
  it('decodes hex bytes to text', () => {
    const { env, output } = createMockEnv()
    unhex.execute(['/var/lib/looking-glass/pocketwatch.hex'], env)
    expect(output).toHaveLength(1)
    const text = output[0]
    expect(text).toContain("It's no use going back to yesterday")
    expect(text).toContain('To wake up, set your theme to matrix')
  })

  it('tolerates 0x prefixes and whitespace', () => {
    const { env, output } = createMockEnv({
      read: () => '0x74 68 65 6d 65 20 6d 61 74 72 69 78',
    })
    unhex.execute(['/tmp/fake.hex'], env)
    expect(output[0]).toBe('theme matrix')
  })

  it('errors on missing file', () => {
    const { env, output } = createMockEnv()
    unhex.execute(['/nope'], env)
    expect(output[0]).toMatch(/No such file/)
  })
})
