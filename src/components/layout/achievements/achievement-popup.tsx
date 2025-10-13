'use client'

import { ACHIEVEMENTS, type AchievementId } from '@/lib/achievements'
import { useEffect, useMemo, useRef, useState } from 'react'

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
    // Slightly slower overall; title/description stay much longer
    // spawn -> enter (pop in as circle)
    const t0 = globalThis.window.setTimeout(() => setPhase('enter'), 10)
    // hold as circle briefly (longer)
    const t1 = globalThis.window.setTimeout(() => setPhase('hold'), 10 + 300)
    // expand to panel (slower)
    const t2 = globalThis.window.setTimeout(
      () => {
        setPhase('expand')
        try {
          onVisibleRef.current?.()
        } catch {}
      },
      10 + 300 + 300,
    )
    // show title (after expand completes)
    const t3 = globalThis.window.setTimeout(() => setPhase('title'), 10 + 300 + 300 + 400)
    // flip to description (title stays much longer)
    const t4 = globalThis.window.setTimeout(() => setPhase('flip'), 10 + 300 + 300 + 400 + 2500)
    // show description (flip a bit slower)
    const t5 = globalThis.window.setTimeout(() => setPhase('description'), 10 + 300 + 300 + 400 + 2500 + 450)
    // collapse back to circle (description stays much longer)
    const t6 = globalThis.window.setTimeout(() => setPhase('collapse'), 10 + 300 + 300 + 400 + 2500 + 450 + 3000)
    // hold collapsed circle briefly (slightly longer)
    const t7 = globalThis.window.setTimeout(
      () => setPhase('holdCollapse'),
      10 + 300 + 300 + 400 + 2500 + 450 + 3000 + 350,
    )
    // slide down and fade (slightly slower)
    const t8 = globalThis.window.setTimeout(
      () => setPhase('exit'),
      10 + 300 + 300 + 400 + 2500 + 450 + 3000 + 350 + 250,
    )
    // complete
    const t9 = globalThis.window.setTimeout(
      () => {
        try {
          onDoneRef.current?.()
        } catch {}
      },
      10 + 300 + 300 + 400 + 2500 + 450 + 3000 + 350 + 250 + 150,
    )

    timeoutsRef.current.push(t0, t1, t2, t3, t4, t5, t6, t7, t8, t9)
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
            isCircle ? 'opacity-100 w-14 h-14' : 'opacity-0 w-0 h-0 overflow-hidden',
          ].join(' ')}>
          <div className="text-2xl" aria-hidden="true">
            {def?.icon ?? '🏆'}
          </div>
        </div>

        {/* Expanded content */}
        <div
          className={[
            'grid grid-cols-[auto_1fr] items-center gap-3',
            isCircle ? 'opacity-0 pointer-events-none h-0 w-0 overflow-hidden' : 'opacity-100',
            'transition-opacity duration-150',
            'h-14',
          ].join(' ')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-muted)] self-center">
            <span className="text-xl" aria-hidden="true">
              {def?.icon ?? '🏆'}
            </span>
          </div>

          <div className="min-w-0 h-14 flex flex-col justify-center">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-0 leading-none">
              Achievement Gained
            </div>
            {/* Flip card */}
            <div className="relative perspective-near h-9">
              <div
                className={[
                  'absolute inset-0 transform-3d transition-transform duration-300',
                  phase === 'flip' ? 'rotate-x-180' : phase === 'description' ? 'rotate-x-180' : 'rotate-x-0',
                ].join(' ')}>
                <div className="absolute inset-0 backface-hidden flex items-center leading-none">
                  <div className="truncate font-semibold text-[15px] leading-none">
                    {def?.title ?? 'Achievement Unlocked'}
                  </div>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-x-180 flex items-center leading-none">
                  <div className="truncate text-[13px] text-muted-foreground leading-none">
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
