// Legacy handler was query-based. Keep a helpful message if hit.
import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ success: false, message: 'Use /api/scores/check/:score path' }, { status: 400 })
}
