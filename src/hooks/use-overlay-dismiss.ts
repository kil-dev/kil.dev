import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'

type OverlayDismissOptions = {
  /** When true, listeners are attached; when false, they are removed */
  enabled?: boolean
  /** Called when an outside click or Escape should close the overlay */
  onRequestClose?: () => void
}

type OverlayDismissResult<T extends HTMLElement = HTMLElement> = {
  open: boolean
  setOpen: (next: boolean | ((prev: boolean) => boolean)) => void
  containerRef: React.RefObject<T | null>
  overlayProps: {
    role: 'button'
    tabIndex: number
    'aria-label': string
    onClick: () => void
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
  }
}

export function useOverlayDismiss<T extends HTMLElement = HTMLElement>(
  options: OverlayDismissOptions = {},
): OverlayDismissResult<T> {
  const { enabled = true, onRequestClose } = options
  const [open, setOpen] = useState(false)
  const containerRef = useRef<T | null>(null)

  const close = useCallback(() => {
    setOpen(false)
    if (onRequestClose) onRequestClose()
  }, [onRequestClose])

  // Outside click and Escape via Effect Events to keep handlers stable
  const onDocumentMouseDown = useEffectEvent((e: PointerEvent) => {
    if (!open) return
    const target = e.target as Node | null
    const container = containerRef.current
    if (container && target && !container.contains(target)) close()
  })

  const onDocumentKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (!open) return
    if (e.key === 'Escape') {
      e.stopPropagation()
      close()
    }
  })

  // Attach listeners only when enabled and open
  useEffect(() => {
    if (!enabled || !open) return
    globalThis.addEventListener('pointerdown', onDocumentMouseDown)
    globalThis.addEventListener('keydown', onDocumentKeyDown)
    return () => {
      globalThis.removeEventListener('pointerdown', onDocumentMouseDown)
      globalThis.removeEventListener('keydown', onDocumentKeyDown)
    }
  }, [enabled, open, onDocumentMouseDown, onDocumentKeyDown])

  const handleOverlayClick = useCallback(() => {
    close()
  }, [close])

  const handleOverlayKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        close()
      }
    },
    [close],
  )

  return {
    open,
    setOpen,
    containerRef,
    overlayProps: {
      role: 'button' as const,
      tabIndex: open ? 0 : -1,
      'aria-label': 'Close overlay',
      onClick: handleOverlayClick,
      onKeyDown: handleOverlayKeyDown,
    },
  }
}
