'use client'

import { cn } from '@/utils/utils'
import { useCallback, useRef, useState } from 'react'

type FluxKnobProps = {
  onRotateClockwise?: (deltaDegrees: number) => void
}

export function FluxKnob({ onRotateClockwise }: Readonly<FluxKnobProps>) {
  const [angle, setAngle] = useState(0)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const draggingRef = useRef(false)
  const lastAngleRef = useRef<number | null>(null)
  const pillCount = 18

  const computeAngleAt = useCallback((clientX: number, clientY: number): number => {
    const el = btnRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    const rad = Math.atan2(dy, dx)
    const deg = (rad * 180) / Math.PI
    return (deg + 450) % 360 // 0 at top
  }, [])

  const handleDelta = useCallback(
    (delta: number) => {
      // Only count clockwise rotation as charge (positive delta)
      if (delta > 0 && onRotateClockwise) onRotateClockwise(delta)
    },
    [onRotateClockwise],
  )

  const onPointerMove = useCallback(
    (clientX: number, clientY: number) => {
      const next = computeAngleAt(clientX, clientY)
      const prev = lastAngleRef.current ?? next
      let delta = next - prev
      if (delta < -180) delta += 360
      else if (delta > 180) delta -= 360
      handleDelta(delta)
      lastAngleRef.current = next
      setAngle(next)
    },
    [computeAngleAt, handleDelta],
  )

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current) return
      onPointerMove(e.clientX, e.clientY)
    },
    [onPointerMove],
  )

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!draggingRef.current) return
      const t = e.touches[0]
      if (!t) return
      onPointerMove(t.clientX, t.clientY)
    },
    [onPointerMove],
  )

  const endDrag = useCallback(
    function onEndDrag() {
      draggingRef.current = false
      globalThis.removeEventListener('mousemove', onMouseMove)
      globalThis.removeEventListener('mouseup', onEndDrag)
      globalThis.removeEventListener('touchmove', onTouchMove)
      globalThis.removeEventListener('touchend', onEndDrag)
    },
    [onMouseMove, onTouchMove],
  )

  const beginDrag = useCallback(
    (clientX: number, clientY: number) => {
      draggingRef.current = true
      lastAngleRef.current = computeAngleAt(clientX, clientY)
      setAngle(lastAngleRef.current)
      globalThis.addEventListener('mousemove', onMouseMove, { passive: true })
      globalThis.addEventListener('mouseup', endDrag, { passive: true })
      globalThis.addEventListener('touchmove', onTouchMove, { passive: true })
      globalThis.addEventListener('touchend', endDrag, { passive: true })
    },
    [computeAngleAt, endDrag, onMouseMove, onTouchMove],
  )

  return (
    <button
      ref={btnRef}
      type="button"
      role="slider"
      aria-label="Time flux knob"
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={Math.round(angle)}
      className={cn(
        'relative h-24 w-24 rounded-full ring-1 ring-border shadow-md outline-offset-2 focus:outline-none',
        'bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklch,white_12%,var(--card)),color-mix(in_oklch,black_10%,var(--card))_70%)]',
      )}
      style={{ transform: `rotate(${angle}deg)` }}
      onMouseDown={e => beginDrag(e.clientX, e.clientY)}
      onTouchStart={e => {
        const t = e.touches[0]
        if (t) beginDrag(t.clientX, t.clientY)
      }}
      onKeyDown={e => {
        switch (e.key) {
          case 'ArrowRight': {
            e.preventDefault()
            setAngle(a => {
              const next = (a + 15) % 360
              handleDelta(15)
              return next
            })

            break
          }
          case 'PageDown':
          case 'End': {
            e.preventDefault()
            setAngle(a => {
              const next = (a + 60) % 360
              handleDelta(60)
              return next
            })

            break
          }
          case 'ArrowLeft': {
            e.preventDefault()
            setAngle(a => (a + 345) % 360)

            break
          }
          case 'PageUp':
          case 'Home': {
            e.preventDefault()
            setAngle(a => (a + 300) % 360)

            break
          }
          // No default
        }
      }}>
      {Array.from({ length: pillCount }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ transform: `rotate(${(360 / pillCount) * i}deg)` }}>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-2 h-3 w-1 -translate-x-1/2 rounded bg-foreground/40"
          />
        </span>
      ))}
      <span
        id="flux-knob-handle"
        className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 h-3 w-1 rounded bg-foreground/70"
      />
    </button>
  )
}
