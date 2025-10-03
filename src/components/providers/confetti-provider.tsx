'use client'

import type confettiImport from 'canvas-confetti'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'

type ConfettiFn = typeof confettiImport

let confettiPromise: Promise<ConfettiFn> | null = null
function getConfetti(): Promise<ConfettiFn> {
  return (confettiPromise ??= import('canvas-confetti').then(m => m.default))
}

type ConfettiContextValue = {
  triggerConfetti: () => void
  triggerConfettiFromCorners: () => void
  triggerConfettiFromTop: () => void
  triggerConfettiFromCenter: () => void
  triggerConfettiCelebration: () => void
  triggerConfettiChaos: () => void
}

const ConfettiContext = createContext<ConfettiContextValue | null>(null)

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const pendingConfettiRef = useRef<Set<string>>(new Set())
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>[]>>(new Map())
  const rafIdsRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    const mapAtMount = timeoutsRef.current
    const rafMapAtMount = rafIdsRef.current
    return () => {
      for (const timers of mapAtMount.values()) {
        for (const id of timers) clearTimeout(id)
      }
      mapAtMount.clear()
      for (const id of rafMapAtMount.values()) cancelAnimationFrame(id)
      rafMapAtMount.clear()
    }
  }, [])

  const triggerConfetti = useCallback(() => {
    if (globalThis.window?.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    void getConfetti().then(confetti => {
      void confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 50,
      })
    })
  }, [])

  const triggerConfettiFromCorners = useCallback(() => {
    if (globalThis.window?.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const confettiId = 'corners'

    // Prevent multiple confetti triggers in quick succession
    if (pendingConfettiRef.current.has(confettiId)) return
    pendingConfettiRef.current.add(confettiId)

    // Create confetti from bottom corners
    const leftCorner = {
      x: 0,
      y: 1,
      angle: 45,
      startVelocity: 55,
      spread: 90,
      particleCount: 50,
      origin: { x: 0, y: 1 },
    }

    const rightCorner = {
      x: 1,
      y: 1,
      angle: 135,
      startVelocity: 55,
      spread: 90,
      particleCount: 50,
      origin: { x: 1, y: 1 },
    }

    // Fire from both corners with slight delay
    void getConfetti().then(confetti => {
      void confetti({ ...leftCorner, zIndex: 50 })
      void confetti({ ...rightCorner, zIndex: 50 })
    })

    // Clean up the confetti pending flag after animation completes
    setTimeout(() => pendingConfettiRef.current.delete(confettiId), 1000)
  }, [])

  const triggerConfettiFromTop = useCallback(() => {
    if (globalThis.window?.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const confettiId = 'top'

    if (pendingConfettiRef.current.has(confettiId)) return
    pendingConfettiRef.current.add(confettiId)

    void getConfetti().then(confetti => {
      void confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0 },
        angle: 270,
        startVelocity: 45,
        zIndex: 50,
      })
    })

    setTimeout(() => pendingConfettiRef.current.delete(confettiId), 1000)
  }, [])

  const triggerConfettiFromCenter = useCallback(() => {
    if (globalThis.window?.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const confettiId = 'center'

    if (pendingConfettiRef.current.has(confettiId)) return
    pendingConfettiRef.current.add(confettiId)

    void getConfetti().then(confetti => {
      void confetti({
        particleCount: 200,
        spread: 360,
        origin: { x: 0.5, y: 0.5 },
        startVelocity: 30,
        zIndex: 50,
      })
    })

    setTimeout(() => pendingConfettiRef.current.delete(confettiId), 1000)
  }, [])

  const triggerConfettiCelebration = useCallback(() => {
    if (globalThis.window?.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const confettiId = 'celebration'

    if (pendingConfettiRef.current.has(confettiId)) return
    pendingConfettiRef.current.add(confettiId)

    toast("You must love confetti! Here's some more", { duration: 5000, closeButton: false })

    // Fire an initial top burst
    void getConfetti().then(confetti => {
      void confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0 },
        angle: 270,
        startVelocity: 45,
        zIndex: 50,
      })

      // Then run a short fireworks loop from both sides using requestAnimationFrame
      const duration = 2000
      const end = Date.now() + duration

      const frame = () => {
        // Fire a few particles from the left and right sides each frame
        void confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, zIndex: 50 })
        void confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, zIndex: 50 })

        if (Date.now() < end) {
          const rafId = requestAnimationFrame(frame)
          rafIdsRef.current.set(confettiId, rafId)
          return
        }

        // Cleanup after celebration ends
        pendingConfettiRef.current.delete(confettiId)
        const rafToCancel = rafIdsRef.current.get(confettiId)
        if (rafToCancel) {
          cancelAnimationFrame(rafToCancel)
          rafIdsRef.current.delete(confettiId)
        }
      }

      const startRaf = requestAnimationFrame(frame)
      rafIdsRef.current.set(confettiId, startRaf)
    })
  }, [])

  const triggerConfettiChaos = useCallback(() => {
    if (globalThis.window?.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const confettiId = 'chaos'

    if (pendingConfettiRef.current.has(confettiId)) return
    pendingConfettiRef.current.add(confettiId)

    toast("Okay... you asked for this. Don't say I didn't warn you.", { duration: 15000, closeButton: false })

    // Schedule follow-up warning toast after 15s
    const existing = timeoutsRef.current.get(confettiId) ?? []
    existing.push(
      setTimeout(() => {
        toast("It won't stop. You have to reload the page", { duration: 15000, closeButton: false })
      }, 15000),
      setTimeout(() => {
        toast("I mean, if that's what you're into, fine. Here's some more.", { duration: 15000, closeButton: false })
      }, 30000),
      setTimeout(() => {
        toast('I hope your browser is lagging.', { duration: 15000, closeButton: false })
      }, 45000),
      setTimeout(() => {
        toast('This is my last message to you. Enjoy your confetti, freak.', {
          duration: 5000,
          closeButton: false,
        })
      }, 60000),
    )
    timeoutsRef.current.set(confettiId, existing)

    void getConfetti().then(confetti => {
      let overdrive = false

      const frame = () => {
        // Randomized fireworks-like continuous cannons
        void confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0 }, zIndex: 50 })
        void confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1 }, zIndex: 50 })
        void confetti({
          particleCount: 2,
          spread: 360,
          origin: { x: Math.random(), y: Math.random() * 0.3 },
          zIndex: 50,
        })
        // Top and bottom cannons
        void confetti({
          particleCount: 5,
          angle: 270,
          spread: 80,
          origin: { x: Math.random(), y: 0 },
          startVelocity: 45,
          zIndex: 50,
        })
        void confetti({
          particleCount: 5,
          angle: 90,
          spread: 80,
          origin: { x: Math.random(), y: 1 },
          startVelocity: 55,
          zIndex: 50,
        })

        if (overdrive) {
          // Heavier side cannons
          void confetti({ particleCount: 10, angle: 60, spread: 90, origin: { x: 0 }, startVelocity: 60, zIndex: 50 })
          void confetti({ particleCount: 10, angle: 120, spread: 90, origin: { x: 1 }, startVelocity: 60, zIndex: 50 })

          // Corner cannons (top and bottom)
          void confetti({
            particleCount: 6,
            angle: 315,
            spread: 70,
            origin: { x: 0, y: 0 },
            startVelocity: 55,
            zIndex: 50,
          })
          void confetti({
            particleCount: 6,
            angle: 225,
            spread: 70,
            origin: { x: 1, y: 0 },
            startVelocity: 55,
            zIndex: 50,
          })
          void confetti({
            particleCount: 6,
            angle: 45,
            spread: 70,
            origin: { x: 0, y: 1 },
            startVelocity: 55,
            zIndex: 50,
          })
          void confetti({
            particleCount: 6,
            angle: 135,
            spread: 70,
            origin: { x: 1, y: 1 },
            startVelocity: 55,
            zIndex: 50,
          })

          // Massive random explosions across the viewport
          for (let i = 0; i < 3; i++) {
            void confetti({
              particleCount: 20,
              spread: 360,
              origin: { x: Math.random(), y: Math.random() },
              startVelocity: 65,
              zIndex: 50,
            })
          }
        }

        const rafId = requestAnimationFrame(frame)
        rafIdsRef.current.set(confettiId, rafId)
      }

      const startRaf = requestAnimationFrame(frame)
      rafIdsRef.current.set(confettiId, startRaf)

      // Escalate after 30s to overdrive mode (sync with the third toast)
      const timers = timeoutsRef.current.get(confettiId) ?? []
      const escalateId = setTimeout(() => {
        overdrive = true
        // Initial overdrive blast
        void confetti({ particleCount: 300, spread: 360, origin: { x: 0.5, y: 0.2 }, startVelocity: 70, zIndex: 50 })
        void confetti({ particleCount: 300, spread: 360, origin: { x: 0.5, y: 0.8 }, startVelocity: 70, zIndex: 50 })
      }, 30000)
      timers.push(escalateId)
      timeoutsRef.current.set(confettiId, timers)
    })
  }, [])

  const value = useMemo<ConfettiContextValue>(
    () => ({
      triggerConfetti,
      triggerConfettiFromCorners,
      triggerConfettiFromTop,
      triggerConfettiFromCenter,
      triggerConfettiCelebration,
      triggerConfettiChaos,
    }),
    [
      triggerConfetti,
      triggerConfettiFromCorners,
      triggerConfettiFromTop,
      triggerConfettiFromCenter,
      triggerConfettiCelebration,
      triggerConfettiChaos,
    ],
  )

  return <ConfettiContext.Provider value={value}>{children}</ConfettiContext.Provider>
}

export function useConfetti() {
  const ctx = useContext(ConfettiContext)
  if (!ctx) throw new Error('useConfetti must be used within ConfettiProvider')
  return ctx
}
