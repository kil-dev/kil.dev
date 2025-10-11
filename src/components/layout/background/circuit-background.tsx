'use client'

import { LIGHT_GRID } from '@/lib/light-grid'
import { themes } from '@/lib/themes'
import { useEffect, useState } from 'react'

export function CircuitBackground() {
  const [shouldLoadLights, setShouldLoadLights] = useState(false)
  const [GridLights, setGridLights] = useState<React.ComponentType | null>(null)

  // Check if grid lights should be loaded
  useEffect(() => {
    if (typeof document === 'undefined') return

    const prefersReducedMotion = globalThis.window?.matchMedia('(prefers-reduced-motion: reduce)')?.matches
    if (prefersReducedMotion) return

    const root = document.documentElement
    const userDisabled = root.dataset.disableGridLights === '1'
    if (userDisabled) return

    // Check if current theme disables grid lights
    const themeNames = themes.map(t => t.name)
    const activeName = themeNames.find(n => root.classList.contains(n))
    const cfg = themes.find(t => t.name === activeName)
    const themeDisablesLights = cfg && 'disableGridLights' in cfg ? Boolean(cfg.disableGridLights) : false

    if (themeDisablesLights) return

    // Defer loading until browser is idle
    const loadLights = () => {
      setShouldLoadLights(true)
      import('./grid-lights')
        .then(mod => {
          setGridLights(() => mod.GridLights)
        })
        .catch(() => {
          // Silently fail if module can't load
        })
    }

    if ('requestIdleCallback' in globalThis) {
      const id = requestIdleCallback(loadLights, { timeout: 2000 })
      return () => cancelIdleCallback(id)
    }

    const timeoutId = setTimeout(loadLights, 1000)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div
      className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)]"
      style={{
        backgroundSize: `${LIGHT_GRID.GRID_SIZE_PX}px ${LIGHT_GRID.GRID_SIZE_PX}px`,
        backgroundPosition: `${LIGHT_GRID.GRID_OFFSET_PX}px ${LIGHT_GRID.GRID_OFFSET_PX}px`,
      }}
      aria-hidden>
      {shouldLoadLights && GridLights && <GridLights />}
    </div>
  )
}
