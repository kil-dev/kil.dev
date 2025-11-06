import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  scores: defineTable({
    name: v.string(),
    score: v.number(),
  }).index('by_score', ['score']),
  gameSessions: defineTable({
    secret: v.string(),
    seed: v.number(),
    createdAt: v.number(),
    expiresAt: v.number(), // Unix timestamp in milliseconds
    isActive: v.boolean(),
    validatedScore: v.optional(v.number()),
  }).index('by_expiresAt', ['expiresAt']),
})
