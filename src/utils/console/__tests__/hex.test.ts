import { describe, expect, it } from 'vitest'
import { hex } from '../hex'
import { createMockEnv } from './test-utils'

describe('hex command', () => {
  it('encodes file content to hex bytes', () => {
    const { env, output } = createMockEnv()
    hex.execute(['/etc/hostname'], env)
    expect(output).toHaveLength(1)
    // "kil-dev\n" → 6b 69 6c 2d 64 65 76 0a
    expect(output[0]).toMatch(/^6b 69 6c 2d 64 65 76 0a$/)
  })

  it('errors on missing file', () => {
    const { env, output } = createMockEnv()
    hex.execute(['/no/such/file'], env)
    expect(output[0]).toMatch(/No such file/)
  })
})
