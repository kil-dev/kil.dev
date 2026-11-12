'use client'

import { useAchievements } from '@/components/providers/achievements-provider'
import type { AchievementId } from '@/lib/achievements'
import { useEffect, useRef } from 'react'

/** Unlocks once its position is scrolled into the upper part of the viewport, so sections on the home page count only when reached. */
export function UnlockOnMount({ id }: { id: AchievementId }) {
  const { has, unlock } = useAchievements()
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (has(id) || !ref.current) return
    const observer = new IntersectionObserver(entries => entries.some(entry => entry.isIntersecting) && unlock(id), {
      rootMargin: '0px 0px -40% 0px',
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [has, unlock, id])

  return <span ref={ref} aria-hidden className="absolute size-px" />
}
