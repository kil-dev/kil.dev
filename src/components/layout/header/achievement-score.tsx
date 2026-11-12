'use client'

import { useAchievements } from '@/components/providers/achievements-provider'
import { useIsClient } from '@/hooks/use-is-client'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { StarIcon } from 'lucide-react'
import Link from 'next/link'

const TOTAL = Object.keys(ACHIEVEMENTS).length

function useAchievementCount() {
  const { unlocked } = useAchievements()
  // Unlocks live in browser storage, so the server render and first client render both show 0.
  const isClient = useIsClient()
  return isClient ? Object.keys(unlocked).length : 0
}

/** HUD score. Hidden until the Achievements page is unlocked, like its nav link. */
export function AchievementScore() {
  const found = useAchievementCount()

  return (
    <Link
      href="/achievements"
      aria-label={`${found} of ${TOTAL} achievements found`}
      className="js-achievements-score items-center gap-1.5 px-2 py-1 text-sm display-text text-primary-foreground outline-none hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary-foreground">
      <StarIcon className="size-4 fill-current" aria-hidden />
      <span key={found} className="animate-pop">
        {found}/{TOTAL}
      </span>
    </Link>
  )
}

/** One segment per achievement, filled as they are found. */
export function AchievementProgress() {
  const found = useAchievementCount()

  return (
    <div
      role="progressbar"
      aria-label="Achievements found"
      aria-valuemin={0}
      aria-valuemax={TOTAL}
      aria-valuenow={found}
      className="flex items-center gap-3">
      {/* A tube that fills with slime */}
      <div className="h-4 w-44 overflow-hidden rounded-full bg-muted ring-2 ring-primary/40 sm:w-64">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-jelly"
          style={{ width: `${(found / TOTAL) * 100}%` }}
        />
      </div>
      <span className="text-sm display-text text-coin">
        {found}/{TOTAL}
      </span>
    </div>
  )
}
