'use client'

import type { MouseEvent } from 'react'
import { useCallback } from 'react'

type TrackFn = () => void

/**
 * Provides a click handler that invokes the provided tracking function when
 * an external link is activated. We only track on click to avoid double
 * captures from keydown + click for keyboard interactions.
 */
export function useTrackedExternalLink(track: TrackFn) {
  const handleClick = useCallback(
    (_: MouseEvent<HTMLElement>) => {
      track()
    },
    [track],
  )

  return { handleClick }
}
