'use client'

import { useConfetti } from '@/components/providers/confetti-provider'
import { useCallback } from 'react'

export function FooterClient() {
  const { triggerConfettiFromCorners } = useConfetti()

  const handleClick = useCallback(() => {
    triggerConfettiFromCorners()
  }, [triggerConfettiFromCorners])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick],
  )

  return (
    <button aria-label="Trigger confetti" onClick={handleClick} onKeyDown={handleKeyDown} className="hover:opacity-80">
      Kilian Tyler
    </button>
  )
}
