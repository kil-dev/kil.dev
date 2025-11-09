'use client'

import { env } from '@/env'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { useMemo } from 'react'

// Lazy-loaded Convex provider - only initializes when snake game is opened
export function SnakeGameConvexProvider({ children }: { children: React.ReactNode }) {
  const convex = useMemo(() => {
    const convexUrl = env.NEXT_PUBLIC_CONVEX_URL

    // If Convex URL is not configured (e.g., in test environments), skip the provider
    if (!convexUrl || convexUrl.trim() === '') {
      return null
    }

    return new ConvexReactClient(convexUrl)
  }, [])

  // If Convex is not configured, render children without the provider
  if (!convex) {
    return <>{children}</>
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
