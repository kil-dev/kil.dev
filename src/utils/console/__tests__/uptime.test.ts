import { describe, expect, it } from 'vitest'
import { uptime } from '../uptime'
import { createMockEnv } from './test-utils'

describe('uptime', () => {
  it('should display uptime information', () => {
    const { env, output } = createMockEnv()

    uptime.execute([], env)

    expect(output).toHaveLength(1)
    expect(output[0]).toMatch(/^up .+, load average: .+$/)
  })

  it('should parse load average from /proc/loadavg', () => {
    const { env, output } = createMockEnv()

    uptime.execute([], env)

    expect(output).toHaveLength(1)
    expect(output[0]).toContain('load average: 0.42, 1.33, 7.77')
  })

  it('should format uptime with minutes for short durations', () => {
    const { env, output } = createMockEnv()

    uptime.execute([], env)

    expect(output).toHaveLength(1)
    // Should have some uptime value
    expect(output[0]).toMatch(/up \d+ (minute|minutes|hour|hours|day|days)/)
  })

  it('should handle missing /proc/loadavg gracefully', () => {
    const { env, output } = createMockEnv({
      read: (_path: string) => {
        return
      },
    })

    uptime.execute([], env)

    expect(output).toHaveLength(1)
    // Should fall back to default load average
    expect(output[0]).toContain('load average: 0.00, 0.00, 0.00')
  })
})
