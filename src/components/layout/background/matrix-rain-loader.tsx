'use client'

import * as React from 'react'

// Client-only loader that mounts MatrixRain when the matrix theme is active.
// Ensures the heavy code and external font are only downloaded for users who select Matrix.
export function MatrixRainLoader() {
  const [active, setActive] = React.useState(false)
  const [Component, setComponent] = React.useState<React.ComponentType | null>(null)

  React.useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const themeNames = ['matrix']

    const ensureFontLoaded = () => {
      // Avoid duplicate injection
      const existing = document.getElementById('matrix-font-css')
      if (existing) return
      // CSS provided by cdnfonts.com for "Matrix Code NFI"
      const link = document.createElement('link')
      link.id = 'matrix-font-css'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.cdnfonts.com/css/matrix-code-nfi'
      link.media = 'all'
      document.head.append(link)
    }

    const update = () => {
      const isThemeActive = themeNames.some(n => root.classList.contains(n))
      const userDisabled = root.dataset.disableCodeRain === '1'
      const isActive = isThemeActive && !userDisabled
      setActive(isActive)
      if (isActive) {
        ensureFontLoaded()
        // Dynamically import the renderer only when needed
        import('./matrix-rain')
          .then(mod => setComponent(() => mod.MatrixRain))
          .catch(() => {
            /* empty */
          })
      }
    }

    update()
    const observer = new MutationObserver(() => update())
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-disable-code-rain'] })
    return () => observer.disconnect()
  }, [])

  if (!active || !Component) return null
  return <Component />
}
