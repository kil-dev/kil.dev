'use client'

import { isDev } from '@/utils/utils'
import { useEffect, useState } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const canCapture = !isDev() && !!posthogKey
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!canCapture || isInitialized) return

    // Defer PostHog initialization until after page is interactive
    const initPostHog = () => {
      import('posthog-js')
        .then(({ default: posthog }) => {
          posthog.init(posthogKey, {
            api_host: '/vibecheck',
            ui_host: 'https://us.posthog.com',
            defaults: '2025-05-24',
            capture_exceptions: true,
            debug: false,
            // Additional performance optimizations
            loaded: () => {
              setIsInitialized(true)
            },
          })
        })
        .catch(err => {
          console.error('Failed to load PostHog:', err)
        })
    }

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in globalThis) {
      requestIdleCallback(initPostHog, { timeout: 2000 })
    } else {
      setTimeout(initPostHog, 2000)
    }
  }, [canCapture, posthogKey, isInitialized])

  return <>{children}</>
}
