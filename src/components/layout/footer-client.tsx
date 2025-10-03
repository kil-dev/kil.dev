'use client'

import { useConfetti } from '@/components/providers/confetti-provider'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'

export function FooterClient() {
  const { triggerConfettiFromCorners, triggerConfettiCelebration, triggerConfettiChaos } = useConfetti()
  const clickCountRef = useRef(0)

  const handleClick = useCallback(() => {
    const next = clickCountRef.current + 1
    if (next === 5) {
      triggerConfettiCelebration()
    }
    if (next === 10) {
      toast("If you don't stop we might have a problem...", { duration: 5000, closeButton: false })
    }
    if (next === 15) {
      toast('Seriously, stop. I am not playing anymore.', { duration: 5000, closeButton: false })
    }
    if (next === 20) {
      triggerConfettiChaos()
    }
    triggerConfettiFromCorners()
    clickCountRef.current = next
  }, [triggerConfettiFromCorners, triggerConfettiCelebration, triggerConfettiChaos])

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
