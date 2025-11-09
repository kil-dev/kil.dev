import { env } from '@/env'
import { validateScoreSubmissionBySession, verifySignedScoreSubmission } from '@/lib/game-validation'
import { addScoreToLeaderboard } from '@/lib/leaderboard'
import { sanitizeName, validateScoreSubmission } from '@/lib/score-validation'
import type { LeaderboardEntry, ScoreSubmissionResponse } from '@/types/leaderboard'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// POST /api/scores - Submit new score
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    const validation = validateScoreSubmission(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid score data', errors: validation.error.issues },
        { status: 400 },
      )
    }

    const {
      name,
      score,
      sessionId,
      timestamp,
      signature,
    }: {
      name: string
      score: number
      sessionId?: string
      timestamp?: number
      signature?: string
    } = validation.data
    const sanitizedName = sanitizeName(name)

    // If session data is provided, verify signature, then validate against stored validated score
    if (typeof sessionId === 'string') {
      if (timestamp === undefined || signature === undefined) {
        return NextResponse.json(
          { success: false, message: 'Missing signed fields (timestamp, signature)' },
          { status: 400 },
        )
      }
      const typedVerify = verifySignedScoreSubmission as (args: {
        sessionId: string
        name: string
        score: number
        timestamp: number
        signature: string
      }) => Promise<{ success: boolean; message?: string }>
      const sigCheck = await typedVerify({
        sessionId,
        name, // use original name for signature verification (not sanitized)
        score,
        timestamp,
        signature,
      })
      if (!sigCheck.success) {
        return NextResponse.json({ success: false, message: 'Signature verification failed' }, { status: 400 })
      }

      const gameValidation = await validateScoreSubmissionBySession(sessionId, score)
      if (!gameValidation.success) {
        return NextResponse.json(
          { success: false, message: 'Score validation failed', details: gameValidation.message },
          { status: 400 },
        )
      }
      // Use the validated score
      const validatedScore = gameValidation.validatedScore
      if (validatedScore === undefined) {
        throw new Error('Validated score is undefined despite successful validation')
      }

      // Create leaderboard entry with validated score
      // Note: timestamp will be set by Convex as _creationTime
      const entry: LeaderboardEntry = {
        id: uuidv4(),
        name: sanitizedName,
        score: validatedScore,
        timestamp: Date.now(), // Still included for type compatibility, but Convex uses _creationTime
      }

      // Add to leaderboard
      const position = await addScoreToLeaderboard(entry)

      // Leaderboard updates automatically via Convex subscriptions, no need to return it
      const response: ScoreSubmissionResponse = {
        success: true,
        position,
        message: `Score submitted! You're ranked #${position}`,
      }

      return NextResponse.json(response, { status: 201 })
    }

    // Reject unvalidated submissions if session data is missing
    return NextResponse.json(
      { success: false, message: 'Missing session data. Score submissions must be validated.' },
      { status: 400 },
    )
  } catch (error) {
    console.error('Error submitting score:', error)
    const payload = { success: false as const, message: 'Internal server error' as const }
    if (env.NODE_ENV !== 'production') {
      const details = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error)
      return NextResponse.json({ ...payload, details }, { status: 500 })
    }
    return NextResponse.json(payload, { status: 500 })
  }
}
