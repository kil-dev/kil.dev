import { describe, expect, it } from 'vitest'
import { computeSha256Hex } from '../crypto'

describe('computeSha256Hex', () => {
  it('computes SHA-256 hash for simple string', async () => {
    const result = await computeSha256Hex('hello')
    expect(result).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
  })

  it('computes SHA-256 hash for empty string', async () => {
    const result = await computeSha256Hex('')
    expect(result).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })

  it('computes SHA-256 hash for unicode characters', async () => {
    const result = await computeSha256Hex('Hello 🌍!')
    expect(result).toHaveLength(64) // SHA-256 produces 64 hex characters
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  it('produces different hashes for different inputs', async () => {
    const hash1 = await computeSha256Hex('test1')
    const hash2 = await computeSha256Hex('test2')
    expect(hash1).not.toBe(hash2)
  })

  it('produces consistent hashes for same input', async () => {
    const input = 'consistent test'
    const hash1 = await computeSha256Hex(input)
    const hash2 = await computeSha256Hex(input)
    expect(hash1).toBe(hash2)
  })

  it('produces lowercase hexadecimal output', async () => {
    const result = await computeSha256Hex('test')
    expect(result).toMatch(/^[0-9a-f]+$/)
    expect(result).not.toMatch(/[A-F]/)
  })

  it('produces exactly 64 characters', async () => {
    const result = await computeSha256Hex('any input')
    expect(result).toHaveLength(64)
  })

  it('handles long strings', async () => {
    const longString = 'a'.repeat(10000)
    const result = await computeSha256Hex(longString)
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  it('handles special characters', async () => {
    const result = await computeSha256Hex('!@#$%^&*()_+-=[]{}|;:,.<>?')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  it('handles newlines and whitespace', async () => {
    const result = await computeSha256Hex('line1\nline2\ttab')
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })
})
