'use client'

import { CapacitorBars } from '@/components/layout/footer/time-turner/capacitor-bars'
import { FluxKnob } from '@/components/layout/footer/time-turner/flux-knob'
import { useAchievements } from '@/components/providers/achievements-provider'
import { useTheme } from '@/components/providers/theme-provider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import { startDotcomTransition } from '@/utils/dotcom-transition'
import { cn } from '@/utils/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export function TimeTurnerDialog({
  year,
  initialIsDotcom: _initialIsDotcom = false,
}: Readonly<{ year: number; initialIsDotcom?: boolean }>) {
  const { unlock } = useAchievements()
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
    try {
      const isDot = document?.documentElement?.classList?.contains('dotcom')
      setAccessibleYear(isDot ? targetYear : yearDisplay)
    } catch {
      setAccessibleYear(yearDisplay)
    }
  }, [yearDisplay])

  const commitUnlock = useCallback(() => {
    if (triggeredRef.current || !ready) return
    triggeredRef.current = true
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DOTCOM_THEME_UNLOCKED, '1')
    } catch {}
    unlock('TIME_TURNER')
    startDotcomTransition(() => {
      setTheme('dotcom')
    })
    setAccessibleYear(targetYear)
    setOpen(false)
  }, [ready, setTheme, unlock])

  const handleRotateClockwise = useCallback((deltaDegrees: number) => {
    const added = (deltaDegrees / 360) * 100
    setTotalCharge(prev => {
      const next = Math.min(300, prev + added)
      if (next >= 300) setReady(true)
      return next
    })
  }, [])

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
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
          <span aria-hidden="true" className="dotcom:inline hidden">
            1999
          </span>
          <span aria-hidden="true" className="dotcom:hidden inline">
            {year}
          </span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Turn back time</AlertDialogTitle>
          <AlertDialogDescription>
            Spin the flux knob clockwise to charge all three capacitors. When full, press Engage to travel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-1 text-2xl font-mono text-center" aria-live="polite" aria-atomic>
          {/* SSR-safe: render both and toggle with dotcom variant classes */}
          <span aria-hidden="true" className="dotcom:inline hidden">
            1999
          </span>
          <span aria-hidden="true" className="dotcom:hidden inline">
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
        <AlertDialogFooter>
          <Button
            type="button"
            onClick={commitUnlock}
            disabled={!ready}
            aria-disabled={!ready}
            aria-label={ready ? 'Engage time travel' : 'Charge capacitors to engage'}>
            Engage
          </Button>
          <AlertDialogAction asChild>
            <Button type="button" variant="ghost">
              Close
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
