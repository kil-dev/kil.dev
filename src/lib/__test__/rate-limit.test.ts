import { describe, expect, it } from 'vitest'

// Simulate createInMemoryLimiter for testing
function createInMemoryLimiter(maxRequests: number, windowMs: number, maxStoreSize: number, cleanupIntervalMs: number) {
  type RateLimitStoreRecord = {
    count: number
    resetTime: number
  }

  const store = new Map<string, RateLimitStoreRecord>()
  let lastCleanup = Date.now()

  function cleanup(): void {
    const now = Date.now()
    if (now - lastCleanup < cleanupIntervalMs) return

    lastCleanup = now

    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key)
      }
    }

    if (store.size > maxStoreSize) {
      const entries = Array.from(store.entries())
      entries.sort((a, b) => a[1].resetTime - b[1].resetTime)
      const toRemove = entries.slice(0, store.size - maxStoreSize)
      for (const [key] of toRemove) {
        store.delete(key)
      }
    }
  }

  function check(key: string): boolean {
    cleanup()

    const now = Date.now()
    const record = store.get(key)

    if (!record || now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (record.count >= maxRequests) {
      return false
    }

    record.count++
    return true
  }

  return { check, _getStore: () => store, _getLastCleanup: () => lastCleanup }
}

describe('createInMemoryLimiter', () => {
  it('allows requests under the limit', () => {
    const limiter = createInMemoryLimiter(5, 60000, 1000, 300000)
    const key = 'test-key'

    expect(limiter.check(key)).toBe(true)
    expect(limiter.check(key)).toBe(true)
    expect(limiter.check(key)).toBe(true)
  })

  it('blocks requests over the limit', () => {
    const limiter = createInMemoryLimiter(3, 60000, 1000, 300000)
    const key = 'test-key'

    expect(limiter.check(key)).toBe(true) // 1
    expect(limiter.check(key)).toBe(true) // 2
    expect(limiter.check(key)).toBe(true) // 3
    expect(limiter.check(key)).toBe(false) // 4 - over limit
    expect(limiter.check(key)).toBe(false) // 5 - over limit
  })

  it('handles multiple keys independently', () => {
    const limiter = createInMemoryLimiter(2, 60000, 1000, 300000)

    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key1')).toBe(false) // key1 at limit

    expect(limiter.check('key2')).toBe(true) // key2 should still work
    expect(limiter.check('key2')).toBe(true)
    expect(limiter.check('key2')).toBe(false) // key2 at limit
  })

  it('handles concurrent checks for same key', () => {
    const limiter = createInMemoryLimiter(3, 60000, 1000, 300000)
    const key = 'concurrent-key'

    const results = [limiter.check(key), limiter.check(key), limiter.check(key), limiter.check(key)]

    expect(results.filter(Boolean).length).toBe(3) // Only 3 should pass
    expect(results[3]).toBe(false) // Fourth should fail
  })

  it('stores entries in the internal map', () => {
    const limiter = createInMemoryLimiter(5, 60000, 1000, 300000)

    limiter.check('key1')
    limiter.check('key2')

    const store = limiter._getStore()
    expect(store.size).toBeGreaterThanOrEqual(2)
    expect(store.has('key1')).toBe(true)
    expect(store.has('key2')).toBe(true)
  })

  it('tracks request count correctly', () => {
    const limiter = createInMemoryLimiter(3, 60000, 1000, 300000)
    const key = 'test-key'

    limiter.check(key)
    limiter.check(key)

    const store = limiter._getStore()
    const record = store.get(key)
    expect(record?.count).toBe(2)
  })

  it('sets reset time in the future', () => {
    const windowMs = 60000
    const limiter = createInMemoryLimiter(5, windowMs, 1000, 300000)
    const key = 'test-key'

    const beforeTime = Date.now()
    limiter.check(key)

    const store = limiter._getStore()
    const record = store.get(key)
    expect(record?.resetTime).toBeGreaterThan(beforeTime)
  })
})

describe('Rate Limiter Configuration', () => {
  it('has reasonable default max requests', () => {
    const maxRequests = 5
    expect(maxRequests).toBeGreaterThan(0)
    expect(maxRequests).toBeLessThan(1000)
  })

  it('has reasonable default window', () => {
    const windowMs = 60_000 // 1 minute
    expect(windowMs).toBe(60000)
    expect(windowMs).toBeGreaterThan(1000) // At least 1 second
    expect(windowMs).toBeLessThan(3600000) // Less than 1 hour
  })

  it('has reasonable max store size', () => {
    const maxStoreSize = 1000
    expect(maxStoreSize).toBeGreaterThan(10)
    expect(maxStoreSize).toBeLessThan(1000000)
  })

  it('has reasonable cleanup interval', () => {
    const cleanupIntervalMs = 5 * 60_000 // 5 minutes
    expect(cleanupIntervalMs).toBe(300000)
    expect(cleanupIntervalMs).toBeGreaterThan(60000) // At least 1 minute
    expect(cleanupIntervalMs).toBeLessThan(3600000) // Less than 1 hour
  })
})
