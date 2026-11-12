'use client'

import { BUBBLE_POPPED_EVENT, recordBubblePop } from '@/utils/bubble-pops'
import { cn } from '@/utils/utils'
import { useEffect, useRef, useState } from 'react'

const PUPIL_REACH = 4.5 // viewBox units a pupil can travel from the middle of its eye
const REGROW_AFTER_MS = 900

type CritterBodyProps = {
  /** Hangs off the header slime instead of sitting on the footer pool. */
  hanging?: boolean
  /** Draws a small down arrow under the eyes, for the critter that is the scroll cue. */
  arrow?: boolean
  className?: string
  /** Offsets this critter's blink so they do not blink together. */
  blinkDelay?: string
}

/**
 * One blob of slime with eyes: the pool (or the header drip) bulging into a little creature.
 * Its pupils follow the mouse wherever it is drawn, as long as <SlimeCritters> is mounted.
 */
export function CritterBody({ hanging = false, arrow = false, className, blinkDelay }: CritterBodyProps) {
  const eyeY = hanging ? 36 : 44
  return (
    <svg
      viewBox="0 0 100 80"
      className={cn('slime-critter text-primary', hanging ? 'origin-top' : 'origin-bottom', className)}>
      <path
        fill="currentColor"
        d={hanging ? 'M4 0C4 40 22 72 50 72S96 40 96 0Z' : 'M4 80C4 40 22 8 50 8s46 32 46 72Z'}
      />
      <ellipse
        cx="27"
        cy={hanging ? 14 : 28}
        rx="7"
        ry="4"
        fill="white"
        opacity="0.45"
        transform={`rotate(-30 27 ${hanging ? 14 : 28})`}
      />
      {[36, 64].map(x => (
        <g key={x} className="slime-critter-eye" style={{ animationDelay: blinkDelay }}>
          <circle cx={x} cy={eyeY} r="10" fill="white" />
          <circle data-pupil data-home={`${x},${eyeY}`} cx={x} cy={eyeY} r="4.5" fill="#0f172a" />
        </g>
      ))}
      {arrow && (
        <path
          d="M41 62l9 8 9-8"
          fill="none"
          stroke="#0f172a"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

/** A critter you can pop: it bursts in a splash of slime, then grows back out of the pool. */
function PoppableCritter({ className, ...body }: CritterBodyProps) {
  const [state, setState] = useState<'idle' | 'popped' | 'regrowing'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => clearTimeout(timer.current ?? undefined), [])

  const pop = () => {
    if (state !== 'idle') return
    setState('popped')
    recordBubblePop()
    // With reduced motion there is no regrow animation to wait for, so it simply reappears
    const still = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
    timer.current = setTimeout(() => setState(still ? 'idle' : 'regrowing'), REGROW_AFTER_MS)
  }

  return (
    <span
      className={cn(
        'critter-seat pointer-events-auto absolute cursor-pointer',
        body.hanging && 'critter-seat-hanging',
        className,
      )}
      onClick={pop}
      onAnimationEnd={event => {
        if (event.animationName === 'kd-critter-regrow') setState('idle')
      }}>
      {state === 'popped' && <span className="slime-splash" />}
      <CritterBody
        {...body}
        className={cn(
          'block w-full',
          state === 'popped' && 'invisible',
          state === 'regrowing' && 'slime-critter-regrow',
        )}
      />
    </span>
  )
}

/**
 * The fun in the background: a few slime critters poke out of the footer pool and hang off the
 * header. Their eyes follow the mouse; they blink, breathe, wobble when hovered, pop when clicked,
 * duck while the page scrolls, jump for achievements and startle at popped bubbles.
 */
export function SlimeCritters() {
  // Every critter on the page, including the scroll cue in the footer, looks at the pointer
  useEffect(() => {
    let raf = 0
    const onPointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        for (const pupil of document.querySelectorAll<SVGCircleElement>('[data-pupil]')) {
          const eye = pupil.previousElementSibling?.getBoundingClientRect()
          const [homeX = 0, homeY = 0] = (pupil.dataset.home ?? '').split(',').map(Number)
          if (!eye || eye.width === 0) continue
          const dx = event.clientX - (eye.left + eye.width / 2)
          const dy = event.clientY - (eye.top + eye.height / 2)
          const distance = Math.hypot(dx, dy) || 1
          // Look straight at nearby things, and to the edge of the eye at anything further away
          const reach = Math.min(PUPIL_REACH, distance / 12)
          pupil.setAttribute('cx', String(homeX + (dx / distance) * reach))
          pupil.setAttribute('cy', String(homeY + (dy / distance) * reach))
        }
      })
    }

    globalThis.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      globalThis.removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  // Moods: the critters duck while the page scrolls, jump when an achievement appears, and
  // go wide-eyed when a bubble pops. The mood is a data attribute on <html>, so the scroll cue
  // critter in the footer reacts too; CSS does the rest.
  useEffect(() => {
    const root = document.documentElement
    let timer: ReturnType<typeof setTimeout> | undefined
    const feel = (mood: 'duck' | 'cheer' | 'startled', ms: number) => {
      // Ducking never interrupts a cheer
      if (mood === 'duck' && root.dataset.critterMood === 'cheer') return
      root.dataset.critterMood = mood
      clearTimeout(timer)
      timer = setTimeout(() => delete root.dataset.critterMood, ms)
    }
    const onScroll = () => feel('duck', 260)
    const onAchievement = () => feel('cheer', 1400)
    const onPop = () => feel('startled', 450)
    globalThis.addEventListener('scroll', onScroll, { passive: true })
    globalThis.addEventListener('kd:achievement-shown', onAchievement)
    globalThis.addEventListener(BUBBLE_POPPED_EVENT, onPop)
    return () => {
      clearTimeout(timer)
      delete root.dataset.critterMood
      globalThis.removeEventListener('scroll', onScroll)
      globalThis.removeEventListener('kd:achievement-shown', onAchievement)
      globalThis.removeEventListener(BUBBLE_POPPED_EVENT, onPop)
    }
  }, [])

  return (
    <div aria-hidden className="slime-critters pointer-events-none fixed inset-0 z-30">
      <PoppableCritter className="bottom-[2.6rem] left-[3%] w-12 sm:w-20" blinkDelay="-1s" />
      <PoppableCritter className="right-[7%] bottom-[2.6rem] hidden w-14 sm:block" blinkDelay="-3.4s" />
      <PoppableCritter hanging className="top-[4.3rem] right-[20%] hidden w-11 lg:block" blinkDelay="-2.2s" />
    </div>
  )
}
