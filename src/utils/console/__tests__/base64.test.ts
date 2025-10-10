import { describe, expect, it } from 'vitest'
import { base64 } from '../base64'
import { createMockEnv } from './test-utils'

describe('b64 command', () => {
  it('decodes base64 files with -d flag', () => {
    const { env, output } = createMockEnv()
    base64.execute(['-d', '/tmp/.burrow/trail.b64'], env)
    const text = output.join('\n')
    expect(text).toContain('Curiouser and curiouser')
    expect(text).toContain('/var/lib/looking-glass/pocketwatch.hex')
  })

  it('encodes file contents with -e flag', () => {
    const { env, output } = createMockEnv()
    base64.execute(['-e', '/etc/hostname'], env)
    expect(output).toHaveLength(1)
    expect(output[0]).toBe('a2lsLWRldgo=')
  })

  it('errors on missing files', () => {
    const { env, output } = createMockEnv()
    base64.execute(['-d', '/no/such/file'], env)
    expect(output[0]).toMatch(/No such file/)
  })
})
