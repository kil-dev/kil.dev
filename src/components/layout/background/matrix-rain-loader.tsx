'use client'

import * as React from 'react'

const MATRIX_THEME_NAMES = ['matrix'] as const

function isMatrixThemeActive(root: HTMLElement) {
  const isThemeActive = MATRIX_THEME_NAMES.some(n => root.classList.contains(n))
  const userDisabled = root.dataset.disableCodeRain === '1'
  return isThemeActive && !userDisabled
}

function ensureMatrixFontLoaded(doc: Document) {
  const existing = doc.getElementById('matrix-font-css')
  if (existing) return
  const link = doc.createElement('link')
  link.id = 'matrix-font-css'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.cdnfonts.com/css/matrix-code-nfi'
  link.media = 'all'
  doc.head.append(link)
}

// Client-only loader that mounts MatrixRain when the matrix theme is active.
// Ensures the heavy code and external font are only downloaded for users who select Matrix.
export function MatrixRainLoader() {
  const [active, setActive] = React.useState(false)
  const [Component, setComponent] = React.useState<React.ComponentType | null>(null)

  React.useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const themeNames = ['matrix']
    let disposed = false

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
      if (disposed) return
      const isThemeActive = themeNames.some(n => root.classList.contains(n))
      const userDisabled = root.dataset.disableCodeRain === '1'
      const isActive = isThemeActive && !userDisabled
      if (disposed) return
      setActive(isActive)
      if (isActive) {
        ensureFontLoaded()
        // Dynamically import the renderer only when needed
        import('./matrix-rain')
          .then(mod => {
            if (disposed) return
            setComponent(() => mod.MatrixRain)
          })
          .catch(() => {
            /* empty */
          })
      }
    }

    update()
    const observer = new MutationObserver(() => {
      if (disposed) return
      update()
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-disable-code-rain'] })
    return () => {
      disposed = true
      observer.disconnect()
    }
  }, [])

  if (!active || !Component) return null
  return <Component />
}
