'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true after the component mounts on the client.
 * Useful to avoid hydration mismatches when DOM/APIs are required.
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setIsClient(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])
  return isClient
}
