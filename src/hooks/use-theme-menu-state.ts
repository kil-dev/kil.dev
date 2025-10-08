'use client'

import { useOverlayDismiss } from '@/hooks/use-overlay-dismiss'
import { injectCircleBlurTransitionStyles } from '@/utils/view-transition'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'

type UseThemeMenuStateResult = {
  open: boolean
  setOpen: (next: boolean | ((prev: boolean) => boolean)) => void
  openedViaKeyboard: boolean
  setOpenedViaKeyboard: (v: boolean) => void
  containerRef: React.MutableRefObject<HTMLDivElement | null>
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>
  optionsRef: React.MutableRefObject<HTMLDivElement | null>
  optionRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>
  overlayProps: {
    role: 'button'
    tabIndex: number
    'aria-label': string
    onClick: () => void
    onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => void
  }
  handleTriggerKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void
  buildMenuKeyDownHandler: (optionsCount: number) => (e: ReactKeyboardEvent<HTMLDivElement>) => void
  injectTransitionFromClick: (e?: { clientX?: number; clientY?: number }) => void
}

export function useThemeMenuState(): UseThemeMenuStateResult {
  const [open, setOpen] = useState(false)
  const [openedViaKeyboard, setOpenedViaKeyboard] = useState(false)

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const optionsRef = useRef<HTMLDivElement | null>(null)

  const {
    setOpen: setOverlayOpen,
    containerRef,
    overlayProps,
  } = useOverlayDismiss({
    enabled: true,
    onRequestClose: () => {
      setOpen(false)
      setOpenedViaKeyboard(false)
    },
  })

  // Keep overlay hook state in sync with local open state for correct tabIndex
  useEffect(() => {
    setOverlayOpen(open)
  }, [open, setOverlayOpen])

  // Prevent background scrolling when menu is open (all breakpoints)
  useEffect(() => {
    if (typeof globalThis === 'undefined') return
    if (open) {
      const prev = document.documentElement.style.overflow
      document.documentElement.style.overflow = 'hidden'
      return () => {
        document.documentElement.style.overflow = prev
      }
    }
  }, [open])

  // focus first option when opening via keyboard
  useEffect(() => {
    if (!open) return
    const id = globalThis.setTimeout(() => {
      if (openedViaKeyboard) optionRefs.current[0]?.focus()
    }, 0)
    return () => globalThis.clearTimeout(id)
  }, [open, openedViaKeyboard])

  const handleTriggerKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (open) {
          setOpen(false)
          setOpenedViaKeyboard(false)
        } else {
          setOpen(true)
          setOpenedViaKeyboard(true)
        }
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        setOpen(true)
        setOpenedViaKeyboard(true)
        // focus handled by effect
      }
    },
    [open],
  )

  const buildMenuKeyDownHandler = useCallback(
    (optionsCount: number) => (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const currentIndex = optionRefs.current.indexOf(document.activeElement as HTMLButtonElement | null)
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const nextIndex = currentIndex === -1 ? 0 : Math.min(optionsCount - 1, currentIndex + 1)
        optionRefs.current[nextIndex]?.focus()
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prevIndex = currentIndex < 0 ? 0 : Math.max(0, currentIndex - 1)
        optionRefs.current[prevIndex]?.focus()
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
      }
    },
    [],
  )

  const injectTransitionFromClick = useCallback((e?: { clientX?: number; clientY?: number }) => {
    // Guard for SSR – only run in the browser
    if (globalThis.window === undefined || globalThis.document === undefined) return

    const viewportWidth = globalThis.window.innerWidth || 1
    const viewportHeight = globalThis.window.innerHeight || 1
    const clickX = e?.clientX ?? viewportWidth / 2
    const clickY = e?.clientY ?? viewportHeight / 2
    const originXPercent = Math.max(0, Math.min(100, (clickX / viewportWidth) * 100))
    const originYPercent = Math.max(0, Math.min(100, (clickY / viewportHeight) * 100))

    // Set CSS variables used by global view-transition keyframes
    try {
      const root = document.documentElement
      root.style.setProperty('--vt-ox', `${originXPercent}%`)
      root.style.setProperty('--vt-oy', `${originYPercent}%`)
    } catch {}

    // Retain API compatibility with existing utility
    injectCircleBlurTransitionStyles(originXPercent, originYPercent, 'theme-transition')
  }, [])

  return {
    open,
    setOpen,
    openedViaKeyboard,
    setOpenedViaKeyboard,
    containerRef: containerRef as React.MutableRefObject<HTMLDivElement | null>,
    triggerRef,
    optionsRef,
    optionRefs,
    overlayProps,
    handleTriggerKeyDown,
    buildMenuKeyDownHandler,
    injectTransitionFromClick,
  }
}
