'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { env } from '@/env'
import type { ThemeName } from '@/lib/themes'
import type { UnlockedMap } from '@/utils/achievements'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { AchievementsProvider } from './achievements-provider'
import { ConfettiProvider } from './confetti-provider'
import { PostHogProvider } from './posthog-provider'
import { ReviewProvider } from './review-provider'
import { SnowProvider } from './snow-provider'
import { ThemeProvider } from './theme-provider'

// Create Convex client for client-side usage
const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL)

export function Providers({
  children,
  initialAppliedTheme,
  initialUnlocked,
}: {
  children: React.ReactNode
  initialAppliedTheme?: ThemeName
  initialUnlocked?: UnlockedMap
}) {
  return (
    <ConvexProvider client={convex}>
      <PostHogProvider>
        <ThemeProvider initialAppliedTheme={initialAppliedTheme}>
          <ConfettiProvider>
            <SnowProvider>
              <TooltipProvider>
                <AchievementsProvider initialUnlocked={initialUnlocked}>
                  <ReviewProvider>{children}</ReviewProvider>
                </AchievementsProvider>
              </TooltipProvider>
            </SnowProvider>
          </ConfettiProvider>
        </ThemeProvider>
      </PostHogProvider>
    </ConvexProvider>
  )
}
