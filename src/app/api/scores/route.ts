import { env } from '@/env'
import { validateScoreSubmissionBySession, verifySignedScoreSubmission } from '@/lib/game-validation'
import { addScoreToLeaderboard, getLeaderboard } from '@/lib/leaderboard'
import { checkRateLimit } from '@/lib/rate-limit'
import { sanitizeName, validateScoreSubmission } from '@/lib/score-validation'
import type { LeaderboardEntry, LeaderboardResponse, ScoreSubmissionResponse } from '@/types/leaderboard'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
}

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status })
}

async function handleValidatedSessionSubmission(args: {
  sessionId: string
  name: string
  score: number
  timestamp: number
  nonce: string
  signature: string
}): Promise<NextResponse> {
  const { sessionId, name, score, timestamp, nonce, signature } = args

  const typedVerify = verifySignedScoreSubmission as (params: {
    sessionId: string
    name: string
    score: number
    timestamp: number
    nonce: string
    signature: string
  }) => Promise<{ success: boolean; message?: string }>

  const sigCheck = await typedVerify({ sessionId, name, score, timestamp, nonce, signature })
  if (!sigCheck.success) return json(400, { success: false, message: 'Signature verification failed' })

  const gameValidation = await validateScoreSubmissionBySession(sessionId, score)
  if (!gameValidation.success) {
    return json(400, { success: false, message: 'Score validation failed', details: gameValidation.message })
  }

  const validatedScore = gameValidation.validatedScore
  if (validatedScore === undefined) throw new Error('Validated score is undefined despite successful validation')

  const entry: LeaderboardEntry = {
    id: uuidv4(),
    name: sanitizeName(name),
    score: validatedScore,
    timestamp: Date.now(),
  }

  const position = await addScoreToLeaderboard(entry)
  const leaderboard = await getLeaderboard()

  const response: ScoreSubmissionResponse = {
    success: true,
    position,
    leaderboard,
    message: `Score submitted! You're ranked #${position}`,
  }
  return json(201, response)
}

// POST /api/scores - Submit new score
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    if (!(await checkRateLimit(ip))) {
      return json(429, { success: false, message: 'Too many requests. Please try again later.' })
    }

    const body: unknown = await request.json()
    const validation = validateScoreSubmission(body)
    if (!validation.success) {
      return json(400, { success: false, message: 'Invalid score data', errors: validation.error.issues })
    }

    const { name, score, sessionId, timestamp, nonce, signature } = validation.data as {
      name: string
      score: number
      sessionId?: string
      timestamp?: number
      nonce?: string
      signature?: string
    }

    if (typeof sessionId !== 'string') {
      return json(400, {
        success: false,
        message: 'Missing session data. Score submissions must be validated.',
      })
    }

    if (timestamp === undefined || nonce === undefined || signature === undefined) {
      return json(400, { success: false, message: 'Missing signed fields (timestamp, nonce, signature)' })
    }

    // Use original name for signature verification (sanitization happens for storage only)
    return await handleValidatedSessionSubmission({ sessionId, name, score, timestamp, nonce, signature })
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

// GET /api/scores - Fetch current leaderboard
export async function GET() {
  try {
    const leaderboard = await getLeaderboard()

    const response: LeaderboardResponse = {
      success: true,
      leaderboard,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ success: false, message: 'Internal server error', leaderboard: [] }, { status: 500 })
  }
}
