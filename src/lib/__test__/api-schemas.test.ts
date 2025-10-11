import { describe, expect, it } from 'vitest'
import {
  CheckScoreResponseSchema,
  GameEndRequestSchema,
  LeaderboardResponseSchema,
  SubmitScoreResponseSchema,
} from '../api-schemas'

describe('CheckScoreResponseSchema', () => {
  it('validates valid check score response', () => {
    const result = CheckScoreResponseSchema.safeParse({
      qualifies: true,
      currentThreshold: 100,
    })
    expect(result.success).toBe(true)
  })

  it('validates response without optional currentThreshold', () => {
    const result = CheckScoreResponseSchema.safeParse({
      qualifies: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing qualifies field', () => {
    const result = CheckScoreResponseSchema.safeParse({
      currentThreshold: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-boolean qualifies', () => {
    const result = CheckScoreResponseSchema.safeParse({
      qualifies: 'true',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-number currentThreshold', () => {
    const result = CheckScoreResponseSchema.safeParse({
      qualifies: true,
      currentThreshold: '100',
    })
    expect(result.success).toBe(false)
  })
})

describe('LeaderboardResponseSchema', () => {
  it('validates valid leaderboard response', () => {
    const result = LeaderboardResponseSchema.safeParse({
      success: true,
      leaderboard: [
        { name: 'ABC', score: 100, timestamp: 1234567890, id: 'id1' },
        { name: 'DEF', score: 90, timestamp: 1234567891, id: 'id2' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('validates empty leaderboard', () => {
    const result = LeaderboardResponseSchema.safeParse({
      success: true,
      leaderboard: [],
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing success field', () => {
    const result = LeaderboardResponseSchema.safeParse({
      leaderboard: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing leaderboard field', () => {
    const result = LeaderboardResponseSchema.safeParse({
      success: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects leaderboard entry without name', () => {
    const result = LeaderboardResponseSchema.safeParse({
      success: true,
      leaderboard: [
        { score: 100, timestamp: 1234567890, id: 'id1' },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('rejects leaderboard entry without score', () => {
    const result = LeaderboardResponseSchema.safeParse({
      success: true,
      leaderboard: [
        { name: 'ABC', timestamp: 1234567890, id: 'id1' },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('rejects leaderboard entry without timestamp', () => {
    const result = LeaderboardResponseSchema.safeParse({
      success: true,
      leaderboard: [
        { name: 'ABC', score: 100, id: 'id1' },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('rejects leaderboard entry without id', () => {
    const result = LeaderboardResponseSchema.safeParse({
      success: true,
      leaderboard: [
        { name: 'ABC', score: 100, timestamp: 1234567890 },
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe('SubmitScoreResponseSchema', () => {
  it('validates successful submission with leaderboard', () => {
    const result = SubmitScoreResponseSchema.safeParse({
      success: true,
      message: 'Score submitted',
      leaderboard: [
        { name: 'ABC', score: 100, timestamp: 1234567890, id: 'id1' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('validates successful submission without leaderboard', () => {
    const result = SubmitScoreResponseSchema.safeParse({
      success: true,
      message: 'Score submitted',
    })
    expect(result.success).toBe(true)
  })

  it('validates failed submission', () => {
    const result = SubmitScoreResponseSchema.safeParse({
      success: false,
      message: 'Invalid score',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing success field', () => {
    const result = SubmitScoreResponseSchema.safeParse({
      message: 'Score submitted',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing message field', () => {
    const result = SubmitScoreResponseSchema.safeParse({
      success: true,
    })
    expect(result.success).toBe(false)
  })
})

describe('GameEndRequestSchema', () => {
  it('validates complete game end request', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: 'sig123',
      finalScore: 100,
      events: [
        { t: 100, k: 'UP' },
        { t: 200, k: 'DOWN' },
      ],
      foods: [
        { t: 150, g: false },
        { t: 250, g: true },
      ],
      durationMs: 1000,
    })
    expect(result.success).toBe(true)
  })

  it('provides defaults for optional fields', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: 'sig123',
      finalScore: 100,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.events).toEqual([])
      expect(result.data.foods).toEqual([])
      expect(result.data.durationMs).toBe(0)
    }
  })

  it('rejects empty sessionId', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: '',
      signature: 'sig123',
      finalScore: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty signature', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: '',
      finalScore: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing finalScore', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: 'sig123',
    })
    expect(result.success).toBe(false)
  })

  it('validates all direction types', () => {
    const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT']
    for (const direction of directions) {
      const result = GameEndRequestSchema.safeParse({
        sessionId: 'session123',
        signature: 'sig123',
        finalScore: 100,
        events: [{ t: 100, k: direction }],
      })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid direction', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: 'sig123',
      finalScore: 100,
      events: [{ t: 100, k: 'INVALID' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative durationMs', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: 'sig123',
      finalScore: 100,
      durationMs: -100,
    })
    expect(result.success).toBe(false)
  })

  it('validates food event with isGolden true', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: 'sig123',
      finalScore: 100,
      foods: [{ t: 100, g: true }],
    })
    expect(result.success).toBe(true)
  })

  it('validates food event with isGolden false', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: 'sig123',
      finalScore: 100,
      foods: [{ t: 100, g: false }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects event without timestamp', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: 'sig123',
      finalScore: 100,
      events: [{ k: 'UP' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects event without direction', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: 'sig123',
      finalScore: 100,
      events: [{ t: 100 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects food without timestamp', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: 'sig123',
      finalScore: 100,
      foods: [{ g: true }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects food without isGolden flag', () => {
    const result = GameEndRequestSchema.safeParse({
      sessionId: 'session123',
      signature: 'sig123',
      finalScore: 100,
      foods: [{ t: 100 }],
    })
    expect(result.success).toBe(false)
  })
})
