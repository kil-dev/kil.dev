'use client'

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
        callback: () => onVisibleRef.current?.(),
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
    const base = 'pointer-events-none fixed left-1/2 bottom-[15vh] z-50 translate-x-[-50%]'
    return base
  }, [])

  const panelClasses = useMemo(() => {
    const base = [
      'relative',
      'bg-[var(--color-popover)] text-[var(--color-popover-foreground)] border border-[var(--color-border)]',
      'shadow-2xl will-change-transform will-change-opacity',
      'transition-all ease-out',
    ]

    // Size/shape timeline
    switch (phase) {
      case 'spawn': {
        base.push('w-14 h-14 rounded-full scale-90 opacity-0 translate-y-full')
        break
      }
      case 'enter': {
        base.push('w-14 h-14 rounded-full scale-100 opacity-100 translate-y-0')
        break
      }
      case 'hold': {
        base.push('w-14 h-14 rounded-full opacity-100 translate-y-0')
        break
      }
      case 'expand': {
        base.push('w-[min(92vw,560px)] h-14 rounded-full px-4 opacity-100 translate-y-0')
        break
      }
      case 'title':
      case 'flip':
      case 'description': {
        base.push('w-[min(92vw,560px)] h-14 rounded-full px-4 opacity-100 translate-y-0')
        break
      }
      case 'collapse': {
        base.push('w-14 h-14 rounded-full px-0 py-0')
        break
      }
      case 'holdCollapse': {
        base.push('w-14 h-14 rounded-full')
        break
      }
      case 'exit': {
        base.push('w-14 h-14 rounded-full translate-y-full opacity-0')
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
        {/* Circle content when small */}
        <div
          className={[
            'flex items-center justify-center',
            'transition-opacity duration-150',
            isCircle ? 'h-14 w-14 opacity-100' : 'h-0 w-0 overflow-hidden opacity-0',
          ].join(' ')}>
          <div className="text-2xl" aria-hidden="true">
            {def?.icon ?? '🏆'}
          </div>
        </div>

        {/* Expanded content */}
        <div
          className={[
            'grid grid-cols-[auto_1fr] items-center gap-3',
            isCircle ? 'pointer-events-none h-0 w-0 overflow-hidden opacity-0' : 'opacity-100',
            'transition-opacity duration-150',
            'h-14',
          ].join(' ')}>
          <div className="flex h-10 w-10 items-center justify-center self-center rounded-full bg-[var(--color-muted)]">
            <span className="text-xl" aria-hidden="true">
              {def?.icon ?? '🏆'}
            </span>
          </div>

          <div className="flex h-14 min-w-0 flex-col justify-center">
            <div className="mb-0 text-[10px] leading-none font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Achievement Gained
            </div>
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
                  <div className="truncate text-[15px] leading-none font-semibold">
                    {def?.title ?? 'Achievement Unlocked'}
                  </div>
                </div>
                <div
                  className={[
                    'absolute inset-0 flex rotate-x-180 items-center leading-none transition-opacity duration-300 backface-hidden',
                    phase === 'flip' || phase === 'description' ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                  aria-hidden={!(phase === 'flip' || phase === 'description')}>
                  <div className="truncate text-[13px] leading-none text-muted-foreground">
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
