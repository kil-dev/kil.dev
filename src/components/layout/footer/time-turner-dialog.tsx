'use client'

import { CapacitorBars } from '@/components/layout/footer/time-turner/capacitor-bars'
import { FluxKnob } from '@/components/layout/footer/time-turner/flux-knob'
import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import { startDotcomTransition } from '@/utils/dotcom-transition'
import { cn } from '@/utils/utils'
import * as Dialog from '@radix-ui/react-dialog'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export function TimeTurnerDialog({
  year,
  initialIsDotcom: _initialIsDotcom = false,
}: Readonly<{ year: number; initialIsDotcom?: boolean }>) {
  const { setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  // Flux capacitor: rotary knob + three charge bars
  const [totalCharge, setTotalCharge] = useState(0) // 0..300
  const [ready, setReady] = useState(false)
  const triggeredRef = useRef(false)
  const targetYear = 1999
  const [accessibleYear, setAccessibleYear] = useState<number>(_initialIsDotcom ? targetYear : year)
  const yearDisplay = useMemo(() => {
    const span = year - targetYear
    if (span <= 0) return targetYear
    const pct = Math.min(1, totalCharge / 300)
    const delta = Math.round(span * pct)
    return Math.max(targetYear, year - delta)
  }, [year, totalCharge])

  useEffect(() => {
    let id: number | null = null
    try {
      const isDot = document?.documentElement?.classList?.contains('dotcom')
      const next = isDot ? targetYear : yearDisplay
      id = requestAnimationFrame(() => {
        setAccessibleYear(next)
      })
    } catch {
      const fallback = yearDisplay
      id = requestAnimationFrame(() => {
        setAccessibleYear(fallback)
      })
    }
    return () => {
      if (id !== null) cancelAnimationFrame(id)
    }
  }, [yearDisplay])

  const commitUnlock = useCallback(() => {
    if (triggeredRef.current || !ready) return
    triggeredRef.current = true
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DOTCOM_THEME_UNLOCKED, '1')
    } catch {}
    try {
      globalThis.window?.dispatchEvent?.(
        new CustomEvent('kd:unlock-achievement', { detail: { achievementId: 'TIME_TURNER' } }),
      )
    } catch {}
    startDotcomTransition(() => {
      setTheme('dotcom')
    })
    setAccessibleYear(targetYear)
    setOpen(false)
  }, [ready, setTheme])

  const handleRotateClockwise = useCallback((deltaDegrees: number) => {
    const added = (deltaDegrees / 360) * 100
    setTotalCharge(prev => {
      const next = Math.min(300, prev + added)
      if (next >= 300) setReady(true)
      return next
    })
  }, [])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label="Turn back time"
          className={cn('hover:opacity-80')}
          onClick={() => {
            setOpen(true)
            setTotalCharge(0)
            setReady(false)
            triggeredRef.current = false
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpen(true)
              setTotalCharge(0)
              setReady(false)
              triggeredRef.current = false
            }
          }}>
          {/* SSR-safe: render both and toggle with dotcom variant classes */}
          <span aria-hidden="true" className="hidden dotcom:inline">
            1999
          </span>
          <span aria-hidden="true" className="inline dotcom:hidden">
            {year}
          </span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg',
          )}>
          <div className={cn('flex flex-col gap-2 text-center sm:text-left')}>
            <Dialog.Title className={cn('text-lg font-semibold')}>Turn back time</Dialog.Title>
            <Dialog.Description className={cn('text-sm text-muted-foreground')}>
              Spin the flux knob clockwise to charge all three capacitors. When full, press Engage to travel.
            </Dialog.Description>
          </div>
          <div className="mt-1 text-center font-mono text-2xl" aria-live="polite" aria-atomic>
            {/* SSR-safe: render both and toggle with dotcom variant classes */}
            <span aria-hidden="true" className="hidden dotcom:inline">
              1999
            </span>
            <span aria-hidden="true" className="inline dotcom:hidden">
              {yearDisplay}
            </span>
            {/* Screen-reader only value that matches the visible year */}
            <span className="sr-only" aria-live="polite" aria-atomic>
              {accessibleYear}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-[auto_auto] items-center justify-center gap-6">
            <CapacitorBars total={totalCharge} />
            <FluxKnob onRotateClockwise={handleRotateClockwise} />
          </div>
          <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end')}>
            <Button
              type="button"
              onClick={commitUnlock}
              disabled={!ready}
              aria-disabled={!ready}
              aria-label={ready ? 'Engage time travel' : 'Charge capacitors to engage'}>
              Engage
            </Button>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost">
                Close
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
