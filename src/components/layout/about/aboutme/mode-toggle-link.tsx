'use client'

import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { useThemeTransition } from '@/components/ui/theme-toggle'
import { captureDarkModeEasterEgg } from '@/hooks/posthog'
import { themes } from '@/lib/themes'
import { buildPerThemeVariantCss } from '@/utils/theme-css'
import { isSafari } from '@/utils/utils'
import { injectCircleBlurTransitionStyles } from '@/utils/view-transition'
import { useCallback, useMemo } from 'react'

export function ModeToggleNote() {
  const noteCss = useMemo(() => {
    return buildPerThemeVariantCss({
      baseSelector: '.mode-note',
      variantAttr: 'data-theme',
      display: 'inline',
    })
  }, [])

  return (
    <span className="text-xs font-normal text-muted-foreground">
      <style>{noteCss}</style>
      {themes.map(t => (
        <span className="mode-note" data-theme={t.name} key={t.name}>
          {'darkModeNote' in t ? (t.darkModeNote ?? '') : ''}
        </span>
      ))}
    </span>
  )
}

export function ModeToggleLink() {
  const { resolvedTheme, setTheme } = useTheme()
  const { startTransition } = useThemeTransition()

  const injectCircleBlur = useCallback((originXPercent: number, originYPercent: number) => {
    if (isSafari()) return
    injectCircleBlurTransitionStyles(originXPercent, originYPercent, 'theme-transition')
  }, [])

  const handleClick = useCallback(
    (event?: React.MouseEvent<HTMLButtonElement>) => {
      if (resolvedTheme === 'dark') return

      const viewportWidth = globalThis.window.innerWidth ?? 1
      const viewportHeight = globalThis.window.innerHeight ?? 1
      const clickX = event?.clientX ?? viewportWidth / 2
      const clickY = event?.clientY ?? viewportHeight / 2
      const originXPercent = Math.max(0, Math.min(100, (clickX / viewportWidth) * 100))
      const originYPercent = Math.max(0, Math.min(100, (clickY / viewportHeight) * 100))

      injectCircleBlur(originXPercent, originYPercent)
      startTransition(() => {
        setTheme('dark')
        captureDarkModeEasterEgg()
      })
    },
    [injectCircleBlur, resolvedTheme, setTheme, startTransition],
  )

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <Button
      type="button"
      variant="ghostLink"
      size="sm"
      className="h-auto p-0 px-0"
      onClick={handleClick}
      onKeyDown={handleKeyDown}>
      Dark mode
    </Button>
  )
}
