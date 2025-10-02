'use client'

import { useConfetti } from '@/components/providers/confetti-provider'
import { useCallback } from 'react'

export function FooterClient() {
  const { triggerConfettiFromCorners } = useConfetti()

  const handleClick = useCallback(() => {
    triggerConfettiFromCorners()
  }, [triggerConfettiFromCorners])

  return (
    <button
      aria-label="Trigger confetti"
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') handleClick()
      }}>
      Kilian Tyler
    </button>
  )
}
