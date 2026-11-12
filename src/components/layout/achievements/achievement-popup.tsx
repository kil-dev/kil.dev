'use client'

import { AchievementBadge } from '@/components/layout/achievements/achievement-badge'
import { ACHIEVEMENTS, type AchievementId } from '@/lib/achievements'
import { useEffect, useMemo, useRef, useState } from 'react'

// Timeline delays/durations (ms)
const SPAWN_DELAY = 10
const ENTER_DURATION = 300
const HOLD_DURATION = 300
const EXPAND_DURATION = 400
const TITLE_DURATION = 2500
const FLIP_DELAY = 450
const DESCRIPTION_DURATION = 3000
const COLLAPSE_DURATION = 350
const EXIT_DURATION = 250
const COMPLETE_DELAY = 150

/**
 * Lobes on the edge of the splat, then droplets that landed clear of it. Sizes in px, places in %.
 * Nothing reaches more than 2rem past the panel: the panel's width leaves 2.5rem a side for it.
 */
const SPLAT: React.CSSProperties[] = [
  { left: -15, top: '18%', width: 30, height: 30 },
  { left: '10%', top: -11, width: 28, height: 28 },
  { left: '36%', top: -7, width: 20, height: 20 },
  { left: '68%', top: -13, width: 32, height: 32 },
  { left: '89%', top: -6, width: 18, height: 18 },
  { right: -13, top: '34%', width: 28, height: 28 },
  { left: '20%', bottom: -12, width: 30, height: 30 },
  { left: '53%', bottom: -8, width: 22, height: 22 },
  { left: '81%', bottom: -13, width: 28, height: 28 },
  { left: -30, top: '62%', width: 14, height: 14 },
  { left: '29%', top: -31, width: 13, height: 13 },
  { right: -28, top: '4%', width: 12, height: 12 },
  { left: '63%', bottom: -33, width: 14, height: 14 },
  { right: '12%', bottom: -29, width: 11, height: 11 },
]

type AchievementPopupProps = {
  id: AchievementId
  onVisible?: () => void
  onDone: () => void
}

type Phase =
  | 'spawn' // offscreen seed, immediately transitions to 'enter' for pop-in
  | 'enter' // circle rises into view
  | 'hold' // pause as a circle before expanding
  | 'expand' // expand to panel
  | 'title'
  | 'flip'
  | 'description'
  | 'collapse' // collapse back to circle
  | 'holdCollapse' // pause as a circle before exiting
  | 'exit' // slide down and fade out

export function AchievementPopup({ id, onVisible, onDone }: AchievementPopupProps) {
  const def = ACHIEVEMENTS[id]

  const timeoutsRef = useRef<number[]>([])
  const clearTimers = () => {
    for (const t of timeoutsRef.current) {
      clearTimeout(t)
    }
    timeoutsRef.current = []
  }

  useEffect(() => clearTimers, [])

  const [phase, setPhase] = useState<Phase>('spawn')

  // Keep latest callbacks without retriggering the animation timeline
  const onVisibleRef = useRef<typeof onVisible>(onVisible)
  const onDoneRef = useRef<typeof onDone>(onDone)
  useEffect(() => {
    onVisibleRef.current = onVisible
  }, [onVisible])
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    // Build an ordered timeline: each entry waits "delay" ms from the previous one
    const steps: Array<{ phase?: Phase; delay: number; callback?: () => void }> = [
      { phase: 'enter', delay: SPAWN_DELAY },
      { phase: 'hold', delay: ENTER_DURATION },
      {
        phase: 'expand',
        delay: HOLD_DURATION,
        callback: () => {
          onVisibleRef.current?.()
          // The critters cheer when an achievement appears
          globalThis.dispatchEvent(new Event('kd:achievement-shown'))
        },
      },
      { phase: 'title', delay: EXPAND_DURATION },
      { phase: 'flip', delay: TITLE_DURATION },
      { phase: 'description', delay: FLIP_DELAY },
      { phase: 'collapse', delay: DESCRIPTION_DURATION },
      { phase: 'holdCollapse', delay: COLLAPSE_DURATION },
      { phase: 'exit', delay: EXIT_DURATION },
      { delay: COMPLETE_DELAY, callback: () => onDoneRef.current?.() },
    ]

    let at = 0
    for (const step of steps) {
      at += step.delay
      const timerId = globalThis.window.setTimeout(() => {
        if (step.phase) setPhase(step.phase)
        if (step.callback) {
          try {
            step.callback()
          } catch (err) {
            console.error('achievement-popup callback error', err)
          }
        }
      }, at)
      timeoutsRef.current.push(timerId)
    }
    return clearTimers
  }, [])

  const isCircle =
    phase === 'enter' || phase === 'hold' || phase === 'collapse' || phase === 'holdCollapse' || phase === 'exit'

  const containerClasses = useMemo(() => {
    // Sits just above the scroll critter, so it reads as slime welling up out of the footer pool
    const base = 'pointer-events-none fixed left-1/2 bottom-[7.75rem] z-50 translate-x-[-50%]'
    return base
  }, [])

  const panelClasses = useMemo(() => {
    const base = [
      'relative',
      // A blob of the same slime as the header and footer: it swells up, splats out wide with a
      // jelly overshoot, and pulls back into a blob before sinking away. The slime itself is
      // drawn by the splat layer behind the text.
      'text-primary-foreground will-change-transform will-change-opacity',
      'transition-all ease-jelly',
    ]

    // Size/shape timeline
    switch (phase) {
      case 'spawn': {
        base.push('w-14 h-14 scale-90 opacity-0 translate-y-full')
        break
      }
      case 'enter': {
        base.push('w-14 h-14 scale-100 opacity-100 translate-y-0')
        break
      }
      case 'hold': {
        base.push('w-14 h-14 opacity-100 translate-y-0')
        break
      }
      case 'expand': {
        base.push('w-[min(calc(100vw-5rem),560px)] h-14 px-4 opacity-100 translate-y-0')
        break
      }
      case 'title':
      case 'flip':
      case 'description': {
        base.push('w-[min(calc(100vw-5rem),560px)] h-14 px-4 opacity-100 translate-y-0')
        break
      }
      case 'collapse': {
        base.push('w-14 h-14 px-0 py-0')
        break
      }
      case 'holdCollapse': {
        base.push('w-14 h-14')
        break
      }
      case 'exit': {
        base.push('w-14 h-14 translate-y-full opacity-0')
        break
      }
    }

    // Durations per phase
    if (phase === 'spawn') base.push('duration-0')
    if (phase === 'enter') base.push('duration-300')
    if (phase === 'hold') base.push('duration-0')
    if (phase === 'expand') base.push('duration-400')
    if (phase === 'title') base.push('duration-1200')
    if (phase === 'flip') base.push('duration-450')
    if (phase === 'description') base.push('duration-1200')
    if (phase === 'collapse') base.push('duration-350')
    if (phase === 'holdCollapse') base.push('duration-0')
    if (phase === 'exit') base.push('duration-200')

    return base.join(' ')
  }, [phase])

  return (
    <div className={containerClasses} aria-live="polite" role="status">
      <div
        className={panelClasses}
        data-achievement-popup
        data-phase={phase}
        aria-label={def?.title ? `Achievement unlocked: ${def.title}` : 'Achievement unlocked'}>
        {/* The splat: the body, lobes bulging out of its edges, and droplets flung clear of it.
            The goo filter fuses whatever touches into one outline. */}
        <div aria-hidden className="slime-splat absolute inset-0 filter-[url(#slime-splat-goo)]">
          <span className="absolute inset-0 rounded-[1.75rem] bg-primary" />
          {SPLAT.map((blob, i) => (
            <span
              key={i}
              className={[
                'absolute rounded-full bg-primary transition-[scale] duration-500 ease-jelly',
                isCircle ? 'scale-0' : 'scale-100',
              ].join(' ')}
              style={{ ...blob, transitionDelay: isCircle ? '0ms' : `${(i % 5) * 45}ms` }}
            />
          ))}
          <svg className="absolute size-0">
            <filter id="slime-splat-goo" x="-20%" y="-100%" width="140%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
            </filter>
          </svg>
        </div>
        {/* Circle content when small */}
        <div
          className={[
            'relative flex items-center justify-center',
            'transition-opacity duration-150',
            isCircle ? 'h-14 w-14 opacity-100' : 'h-0 w-0 overflow-hidden opacity-0',
          ].join(' ')}>
          {/* While it is a blob it is a critter: two eyes, like the ones in the pool */}
          <div className="flex gap-1.5" aria-hidden="true">
            {[0, 1].map(eye => (
              <span key={eye} className="grid size-4 place-items-center rounded-full bg-white">
                <span className="size-2 rounded-full bg-slate-900" />
              </span>
            ))}
          </div>
        </div>

        {/* Expanded content */}
        <div
          className={[
            'relative grid grid-cols-[auto_1fr] items-center gap-3',
            isCircle ? 'pointer-events-none h-0 w-0 overflow-hidden opacity-0' : 'opacity-100',
            'transition-opacity duration-150',
            'h-14',
          ].join(' ')}>
          {def ? (
            <AchievementBadge
              image={def.imageSrc}
              alt=""
              size={40}
              className="w-10 shadow-[0_0_0_2px_var(--primary-foreground)]"
            />
          ) : (
            <span className="text-xl" aria-hidden="true">
              🏆
            </span>
          )}

          <div className="flex h-14 min-w-0 flex-col justify-center">
            <div className="mb-0 text-xs leading-none display-text text-primary-foreground/75">Achievement Gained</div>
            {/* Flip card */}
            <div className="relative h-9 perspective-near">
              <div
                className={[
                  'absolute inset-0 transition-transform duration-300 transform-3d',
                  phase === 'flip' || phase === 'description' ? 'rotate-x-180' : 'rotate-x-0',
                ].join(' ')}>
                <div
                  className={[
                    'absolute inset-0 flex items-center leading-none transition-opacity duration-300 backface-hidden',
                    phase === 'flip' || phase === 'description' ? 'opacity-0' : 'opacity-100',
                  ].join(' ')}
                  aria-hidden={phase === 'flip' || phase === 'description'}>
                  <div className="truncate text-[15px] leading-snug font-semibold">
                    {def?.title ?? 'Achievement Unlocked'}
                  </div>
                </div>
                <div
                  className={[
                    'absolute inset-0 flex rotate-x-180 items-center leading-none transition-opacity duration-300 backface-hidden',
                    phase === 'flip' || phase === 'description' ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                  aria-hidden={!(phase === 'flip' || phase === 'description')}>
                  <div className="truncate text-[13px] leading-snug text-primary-foreground/85">
                    {def?.description ?? ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
