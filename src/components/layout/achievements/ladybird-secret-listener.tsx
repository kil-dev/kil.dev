'use client'

import { useAchievements } from '@/components/providers/achievements-provider'
import { type AchievementId } from '@/lib/achievements'
import { useCallback, useEffect, useEffectEvent, useRef } from 'react'

export function LadybirdSecretListener() {
  const { has, unlock } = useAchievements()
  const bufferRef = useRef('')
  const target = 'ladybird!'

  const shouldIgnoreTarget = useCallback((el: EventTarget | null): boolean => {
    if (!el || !(el as Element).closest) return false
    const element = el as Element
    if (element.closest('input, textarea, [contenteditable="true"], [role="textbox"]')) return true
    return false
  }, [])

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (shouldIgnoreTarget(e.target)) return
    const key = e.key
    if (key?.length !== 1) return

    const normalized = key.toLowerCase()
    bufferRef.current = (bufferRef.current + normalized).slice(-target.length)

    if (bufferRef.current === target) {
      bufferRef.current = ''
      const id = 'LADYBIRD_LANDING' as AchievementId
      if (!has(id)) {
        unlock(id)
      }
    }
  })

  useEffect(() => {
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [])

  return null
}
