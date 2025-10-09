'use client'

import { ACHIEVEMENTS } from '@/lib/achievements'
import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import type { ComponentType } from 'react'
import { useEffect, useRef, useState } from 'react'

export function SecretConsoleLoader() {
  const [ConsoleComp, setConsoleComp] = useState<null | ComponentType<{ onRequestClose: () => void }>>(null)
  const [isOpen, setIsOpen] = useState(false)
  const isLoadingRef = useRef(false)

  useEffect(() => {
    function shouldIgnore(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false
      const tag = target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return true
      return false
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== 'Backquote' || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      if (shouldIgnore(e.target)) return
      if (isOpen) return
      // Prevent the backtick from being inserted into any focused field once we open
      e.preventDefault()
      e.stopPropagation()

      // Check if this is the first time opening the console
      const hasOpenedBefore = localStorage.getItem(LOCAL_STORAGE_KEYS.CONSOLE_OPENED) === '1'
      if (!hasOpenedBefore) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEYS.CONSOLE_OPENED, '1')
          // Unlock the Console Commander achievement
          globalThis.dispatchEvent(
            new CustomEvent('kd:unlock-achievement', {
              detail: { achievementId: ACHIEVEMENTS.CONSOLE_COMMANDER.id },
            }),
          )
        } catch {
          // Ignore localStorage errors
        }
      }

      if (!ConsoleComp && !isLoadingRef.current) {
        isLoadingRef.current = true
        void import('@/components/secret-console/secret-console')
          .then(mod => {
            setConsoleComp(() => mod.SecretConsole)
            setIsOpen(true)
          })
          .catch(() => {
            // noop: ignore dynamic import errors; console simply won't open
          })
          .finally(() => {
            isLoadingRef.current = false
          })
      } else {
        setIsOpen(true)
      }
    }

    globalThis.addEventListener('keydown', onKeyDown)
    return () => globalThis.removeEventListener('keydown', onKeyDown)
  }, [ConsoleComp, isOpen])

  if (!ConsoleComp || !isOpen) return null
  return <ConsoleComp onRequestClose={() => setIsOpen(false)} />
}
