'use client'

import { CritterBody } from '@/components/layout/background/slime-critters'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Scroll cue, built into the footer: a critter pokes up out of the slime pool with an arrow on
 * its face whenever there is another page below. It ducks into the pool while the page is
 * scrolling and pops back up when it settles. Clicking it scrolls to the next page.
 */
export function ScrollCue() {
  const pathname = usePathname()
  const ref = useRef<HTMLButtonElement>(null)
  const next = useRef<Element | null>(null)

  useEffect(() => {
    const button = ref.current
    if (!button) return
    let settle: ReturnType<typeof setTimeout> | undefined

    const surface = () => {
      // The current page is the last one that has reached the upper part of the window
      // A page is anything that snaps to the top right now; some only do on small screens
      const pages = Array.from(document.querySelectorAll('main [class*="snap-start"]')).filter(page =>
        getComputedStyle(page).scrollSnapAlign.includes('start'),
      )
      const current = pages.findLastIndex(page => page.getBoundingClientRect().top < globalThis.innerHeight * 0.4)
      next.current = pages[current + 1] ?? null
      button.dataset.sunk = next.current ? 'false' : 'true'
    }
    const onScroll = () => {
      button.dataset.sunk = 'true'
      clearTimeout(settle)
      settle = setTimeout(surface, 180)
    }

    surface()
    globalThis.addEventListener('scroll', onScroll, { passive: true })
    globalThis.addEventListener('resize', onScroll)
    return () => {
      clearTimeout(settle)
      globalThis.removeEventListener('scroll', onScroll)
      globalThis.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  return (
    <div className="scroll-cue-well">
      <button
        ref={ref}
        type="button"
        data-sunk="true"
        aria-label="Scroll to the next section"
        className="scroll-cue"
        onClick={() => next.current?.scrollIntoView({ block: 'start' })}>
        <CritterBody arrow blinkDelay="-4.1s" className="block w-full" />
      </button>
    </div>
  )
}
