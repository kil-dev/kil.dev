import { describe, expect, it } from 'vitest'
import { sanitizeName, validateScoreSubmission } from '../score-validation'

describe('validateScoreSubmission', () => {
  it('validates a valid score submission', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: 100,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('ABC')
      expect(result.data.score).toBe(100)
    }
  })

  it('rejects name that is too short', () => {
    const result = validateScoreSubmission({
      name: '',
      score: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects name that is too long', () => {
    const result = validateScoreSubmission({
      name: 'ABCD',
      score: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects name with lowercase letters', () => {
    const result = validateScoreSubmission({
      name: 'abc',
      score: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects name with numbers', () => {
    const result = validateScoreSubmission({
      name: 'A1B',
      score: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects name with special characters', () => {
    const result = validateScoreSubmission({
      name: 'A@B',
      score: 100,
    })
    expect(result.success).toBe(false)
  })

  it('accepts maximum valid name length', () => {
    const result = validateScoreSubmission({
      name: 'AAA',
      score: 100,
    })
    expect(result.success).toBe(true)
  })

  it('rejects negative score', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: -1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects score that is too high', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: 10000,
    })
    expect(result.success).toBe(false)
  })

  it('accepts maximum valid score', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: 9999,
    })
    expect(result.success).toBe(true)
  })

  it('accepts minimum valid score', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: 0,
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-integer score', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: 100.5,
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional sessionId without signature fields', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: 100,
      sessionId: 'session123',
    })
    // Should fail because signature fields are required when sessionId is present
    expect(result.success).toBe(false)
  })

  it('validates sessionId with all required signature fields', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: 100,
      sessionId: 'session123',
      timestamp: 1234567890,
      signature: 'b'.repeat(64),
    })
    expect(result.success).toBe(true)
  })

  it('rejects sessionId with missing timestamp', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: 100,
      sessionId: 'session123',
      signature: 'b'.repeat(64),
    })
    expect(result.success).toBe(false)
  })

  it('rejects sessionId with missing signature', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: 100,
      sessionId: 'session123',
      timestamp: 1234567890,
    })
    expect(result.success).toBe(false)
  })

  it('rejects signature with wrong length', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: 100,
      sessionId: 'session123',
      timestamp: 1234567890,
      signature: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer timestamp', () => {
    const result = validateScoreSubmission({
      name: 'ABC',
      score: 100,
      sessionId: 'session123',
      timestamp: 123.45,
      signature: 'b'.repeat(64),
    })
    expect(result.success).toBe(false)
  })
})

describe('sanitizeName', () => {
  it('converts lowercase to uppercase', () => {
    expect(sanitizeName('abc')).toBe('ABC')
  })

  it('removes numbers', () => {
    expect(sanitizeName('A1B2C3')).toBe('ABC')
  })

  it('removes special characters', () => {
    expect(sanitizeName('A@B#C$')).toBe('ABC')
  })

  it('removes spaces', () => {
    expect(sanitizeName('A B C')).toBe('ABC')
  })

  it('truncates to 3 characters', () => {
    expect(sanitizeName('ABCDEF')).toBe('ABC')
  })

  it('pads short names with A', () => {
    expect(sanitizeName('A')).toBe('AAA')
    expect(sanitizeName('AB')).toBe('ABA')
  })

  it('handles empty string', () => {
    expect(sanitizeName('')).toBe('AAA')
  })

  it('handles string with only invalid characters', () => {
    expect(sanitizeName('123!@#')).toBe('AAA')
  })

  it('preserves valid uppercase letters', () => {
    expect(sanitizeName('XYZ')).toBe('XYZ')
  })

  it('handles mixed case with numbers', () => {
    expect(sanitizeName('a1B2c3')).toBe('ABC')
  })

  it('handles unicode characters', () => {
    expect(sanitizeName('A🎮B')).toBe('ABA')
  })

  it('handles whitespace', () => {
    expect(sanitizeName('   ')).toBe('AAA')
  })
})
