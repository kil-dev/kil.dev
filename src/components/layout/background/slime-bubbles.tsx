'use client'

import { useAchievements } from '@/components/providers/achievements-provider'
import type { AchievementId } from '@/lib/achievements'
import { BUBBLE_POPPED_EVENT, readBubblePops, recordBubblePop } from '@/utils/bubble-pops'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const COUNT = 28
/** Pops, counted across visits, that unlock BUBBLE_BURSTER. */
const POPS_FOR_ACHIEVEMENT = 50
/** Pops after which the running count is shown, to egg people on. It never shows the target, and stays for good. */
const POPS_TO_SHOW_COUNT = 10

/**
 * Bubbles of slime drift up from the footer pool to the header, and pop when clicked.
 * Each has its own place, size, speed and sway, worked out from its index so the server and
 * the browser agree on them.
 */
export function SlimeBubbles() {
  const ref = useRef<HTMLDivElement>(null)
  const { has, unlock } = useAchievements()
  const [popped, setPopped] = useState(0)

  // Pops come from here and from the portrait; both announce the new total on window
  useEffect(() => {
    setPopped(readBubblePops())
    const onPopped = (event: Event) => {
      const total = (event as CustomEvent<number>).detail
      setPopped(total)
      if (total >= POPS_FOR_ACHIEVEMENT && !has('BUBBLE_BURSTER' satisfies AchievementId)) {
        unlock('BUBBLE_BURSTER' satisfies AchievementId)
      }
    }
    globalThis.addEventListener(BUBBLE_POPPED_EVENT, onPopped)
    return () => globalThis.removeEventListener(BUBBLE_POPPED_EVENT, onPopped)
  }, [has, unlock])

  useEffect(() => {
    const container = ref.current
    if (!container) return

    // The bubbles sit behind the page, so clicks never reach them directly. Listen on the
    // document and pop whichever bubble is under the pointer, unless a real control was clicked.
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element).closest('a, button, input, label, select, textarea, [role="button"]')) return
      for (const bubble of container.querySelectorAll<HTMLElement>('.slime-bubble-skin:not(.popped)')) {
        const box = bubble.getBoundingClientRect()
        const radius = box.width / 2
        if (Math.hypot(event.clientX - (box.left + radius), event.clientY - (box.top + radius)) > radius + 4) continue
        bubble.classList.add('popped')
        recordBubblePop()
        return
      }
    }
    // A popped bubble comes back when its trip up the page starts over
    const onLap = (event: AnimationEvent) => {
      ;(event.target as Element).firstElementChild?.classList.remove('popped')
    }

    document.addEventListener('click', onClick)
    container.addEventListener('animationiteration', onLap)
    return () => {
      document.removeEventListener('click', onClick)
      container.removeEventListener('animationiteration', onLap)
    }
  }, [])

  const showCount = popped >= POPS_TO_SHOW_COUNT

  return (
    <>
      {/* Portalled to the body: the background this lives in is hidden from assistive tech */}
      {showCount &&
        createPortal(
          <p
            role="status"
            className="slime-pop-count fixed right-4 bottom-[3.75rem] z-[45] flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm display-text text-primary-foreground sm:bottom-2.5">
            <span aria-hidden className="size-3 rounded-full bg-primary-foreground/70" />
            <span key={popped} className="animate-pop">
              {popped} popped
            </span>
          </p>,
          document.body,
        )}
      <div ref={ref} aria-hidden className="slime-bubbles pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {Array.from({ length: COUNT }, (_, i) => {
          const spread = (i * 0.618034) % 1 // golden-ratio steps: evenly spread, never in a row
          const size = 10 + ((i * 7) % 5) * 9 + (i % 3) * 4
          const duration = 24 + ((i * 11) % 9) * 4
          const progress = (i * 0.754878 + 0.31) % 1 // how far up it starts; a different step, so no diagonal
          return (
            <span
              key={i}
              className="slime-bubble"
              style={
                {
                  left: `${(spread * 96 + 2).toFixed(1)}%`,
                  width: size,
                  height: size,
                  animationDuration: `${duration}s`,
                  animationDelay: `${(-progress * duration).toFixed(1)}s`,
                  '--sway': `${(i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 9)}px`,
                  '--rest': `${Math.round(progress * 100)}`,
                } as React.CSSProperties
              }>
              <span className="slime-bubble-skin" />
            </span>
          )
        })}
      </div>
    </>
  )
}
