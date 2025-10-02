'use client'

import { useAchievements } from '@/components/providers/achievements-provider'
import { useKonamiAnimation } from '@/components/providers/konami-animation-provider'
import { type AchievementId } from '@/lib/achievements'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useEffectEvent, useRef } from 'react'

export function KonamiCodeListener() {
  const { has, unlock } = useAchievements()
  const { triggerAnimation } = useKonamiAnimation()
  const sequenceRef = useRef<string[]>([])
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  const konamiSequence = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ] as const

  const shouldIgnoreTarget = useCallback((el: EventTarget | null): boolean => {
    if (!el || !(el as Element).closest) return false
    const element = el as Element
    if (element.closest('input, textarea, [contenteditable="true"], [role="textbox"]')) return true
    return false
  }, [])

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (!isHomepage) return
    if (shouldIgnoreTarget(e.target)) return

    // Normalize 'b'/'B' and 'a'/'A'
    let key = e.key
    if (key.toLowerCase() === 'b') key = 'b'
    else if (key.toLowerCase() === 'a') key = 'a'

    sequenceRef.current.push(key)

    // Keep only the last N keys
    if (sequenceRef.current.length > konamiSequence.length) {
      sequenceRef.current = sequenceRef.current.slice(-konamiSequence.length)
    }

    // Compare
    if (sequenceRef.current.length === konamiSequence.length) {
      const isMatch = sequenceRef.current.every((k, index) => k === konamiSequence[index])
      if (isMatch) {
        sequenceRef.current = []
        const id: AchievementId = 'KONAMI_KILLER'
        triggerAnimation()
        if (!has(id)) unlock(id)
      }
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKey])

  return null
}
