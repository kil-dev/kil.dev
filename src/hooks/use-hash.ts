import { useCallback, useEffect, useState } from 'react'

export function useHash() {
  const [hash, setHash] = useState(() =>
    typeof globalThis.window === 'undefined' ? '' : globalThis.window.location.hash,
  )

  const readHash = useCallback(() => {
    if (typeof globalThis.window === 'undefined') return
    setHash(globalThis.window.location.hash)
  }, [])

  useEffect(() => {
    readHash()
    const onHashChange = () => readHash()
    const onPopState = () => readHash()
    globalThis.window.addEventListener('hashchange', onHashChange, { passive: true })
    globalThis.window.addEventListener('popstate', onPopState)
    return () => {
      globalThis.window.removeEventListener('hashchange', onHashChange)
      globalThis.window.removeEventListener('popstate', onPopState)
    }
  }, [readHash])

  // Catch Next.js router navigations (pushState/replaceState) that won't trigger hashchange
  useEffect(() => {
    if (typeof globalThis.window === 'undefined') return

    const originalPushState = globalThis.window.history.pushState.bind(globalThis.window.history)
    const originalReplaceState = globalThis.window.history.replaceState.bind(globalThis.window.history)

    const patchedPushState: History['pushState'] = (...args) => {
      const result = originalPushState(...args)
      setTimeout(() => {
        readHash()
      }, 0)
      return result
    }

    const patchedReplaceState: History['replaceState'] = (...args) => {
      const result = originalReplaceState(...args)
      setTimeout(() => {
        readHash()
      }, 0)
      return result
    }

    globalThis.window.history.pushState = patchedPushState
    globalThis.window.history.replaceState = patchedReplaceState

    return () => {
      globalThis.window.history.pushState = originalPushState
      globalThis.window.history.replaceState = originalReplaceState
    }
  }, [readHash])

  return hash
}
