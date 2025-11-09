'use client'

import { env } from '@/env'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { useMemo } from 'react'

// Lazy-loaded Convex provider - only initializes when snake game is opened
export function SnakeGameConvexProvider({ children }: { children: React.ReactNode }) {
  const convex = useMemo(
    () =>
      new ConvexReactClient(
        env.NEXT_PUBLIC_CONVEX_URL ??
          (() => {
            throw new Error('NEXT_PUBLIC_CONVEX_URL is required. Ensure it is set in your environment variables.')
          }),
      ),
    [],
  )

  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}

