'use client'

import { useEffect, useEffectEvent } from 'react'

type GameOverlayProps = {
  isPlaying: boolean
  gameOver: boolean
  showNameInput: boolean
  onRestart: () => void
  onEsc: () => void
  onNameInputKey: (e: KeyboardEvent) => void
}

export function GameOverlay({
  isPlaying,
  gameOver,
  showNameInput,
  onRestart,
  onEsc,
  onNameInputKey,
}: GameOverlayProps) {
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (showNameInput) return onNameInputKey(e)
    if (e.key === 'Escape') {
      e.preventDefault()
      onEsc()
      return
    }
    if (e.key === ' ') {
      if (gameOver || !isPlaying) onRestart()
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return null
}
