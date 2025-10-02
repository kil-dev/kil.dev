'use client'

import { useCallback } from 'react'
import { useConfetti } from '../providers/confetti-provider'

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
