'use client'

import { useAchievements } from '@/components/providers/achievements-provider'
import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { captureThemeChanged } from '@/hooks/posthog'
import { themes, type Theme } from '@/lib/themes'
import type { ThemeConfig } from '@/types/themes'
import { buildPerThemeVariantCss } from '@/utils/theme-css'
import { getAvailableThemes, getDefaultThemeForNow } from '@/utils/theme-runtime'
import { getThemeIcon, getThemeLabel } from '@/utils/themes'
import { cn, isSafari } from '@/utils/utils'
import { injectCircleBlurTransitionStyles } from '@/utils/view-transition'
import { CalendarDays, Monitor, Settings } from 'lucide-react'
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type ComponentType } from 'react'

function SystemIcon({ className }: { className?: string }) {
  // Avoid hydration mismatch: default to Seasonal icon until mounted
  const { seasonalOverlaysEnabled } = useTheme()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const Icon = hydrated ? (seasonalOverlaysEnabled ? CalendarDays : Monitor) : CalendarDays
  return <Icon className={cn(className)} />
}

export function ThemeToggle() {
  const {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    seasonalOverlaysEnabled,
    setSeasonalOverlaysEnabled,
    disableSnow,
    setDisableSnow,
    disableCodeRain,
    setDisableCodeRain,
    disableGridLights,
    setDisableGridLights,
  } = useTheme()
  const { startTransition } = useThemeTransition()
  const { unlocked, has, unlock } = useAchievements()

  const currentPreference: Theme = theme ?? 'system'

  const [open, setOpen] = useState(false)
  const [openedViaKeyboard, setOpenedViaKeyboard] = useState(false)
  const [tooltipHold, setTooltipHold] = useState(false)
  const [toggleCount, setToggleCount] = useState(0)
  const [themeSelected, setThemeSelected] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const optionsRef = useRef<HTMLDivElement | null>(null)

  const [hydrated, setHydrated] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [showOptions, setShowOptions] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])

  // Force re-render after achievement state changes to ensure localStorage sync
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceUpdate(prev => prev + 1)

      // Check if current theme is still available after achievement reset
      // Add additional delay to ensure CSS attribute is synchronized
      setTimeout(() => {
        const availableThemes = getAvailableThemes() as readonly Theme[]
        if (currentPreference && !availableThemes.includes(currentPreference)) {
          // Current theme is no longer available, switch to system
          setTheme('system')
        }
      }, 50) // Additional delay for CSS attribute sync
    }, 100) // Small delay to ensure localStorage is updated
    return () => clearTimeout(timer)
  }, [unlocked.THEME_TAPDANCE, currentPreference, setTheme])

  // Build CSS that shows exactly one icon based on <html> theme classes
  const themeIconCss = useMemo(() => {
    return buildPerThemeVariantCss({
      baseSelector: '.theme-icon',
      variantAttr: 'data-theme',
      display: 'inline-block',
    })
  }, [])

  const showSystemOverlay = hydrated && open && currentPreference === 'system'
  const spinCss = `@keyframes kd-spin-trail{0%{transform:rotate(0deg) scale(1);filter:drop-shadow(0 0 0 rgba(0,0,0,0))}70%{transform:rotate(320deg) scale(1.1);filter:drop-shadow(0 0 0 rgba(0,0,0,0)) drop-shadow(0 0 6px color-mix(in oklch,var(--primary) 70%,transparent)) drop-shadow(0 0 12px color-mix(in oklch,var(--accent,var(--primary)) 50%,transparent))}100%{transform:rotate(360deg) scale(1);filter:drop-shadow(0 0 0 rgba(0,0,0,0))}}.theme-system-overlay-anim{animation:kd-spin-trail 260ms ease-out;will-change:transform,filter}`

  // Prevent background scrolling when menu is open (all breakpoints)
  useEffect(() => {
    if (typeof globalThis === 'undefined') return
    if (open) {
      const prev = document.documentElement.style.overflow
      document.documentElement.style.overflow = 'hidden'
      return () => {
        document.documentElement.style.overflow = prev
      }
    }
  }, [open])

  const injectCircleBlur = useCallback((originXPercent: number, originYPercent: number) => {
    injectCircleBlurTransitionStyles(originXPercent, originYPercent, 'theme-transition')
  }, [])

  const handleThemeChange = useCallback(
    (nextPref: Theme, event?: ReactMouseEvent) => {
      // Mark that a theme was selected (this will reset the counter)
      setThemeSelected(true)

      // Reset the counter immediately when a theme is selected
      setToggleCount(0)

      // Check if the theme is available
      const availableThemes = getAvailableThemes() as readonly Theme[]

      // Only proceed if the theme is available
      if (!availableThemes.includes(nextPref)) {
        setOpen(false)
        return
      }

      // Compute the visual (CSS) theme for current and next preferences,
      // treating the seasonal default as equivalent to explicitly selecting it.
      const seasonalDefault = getDefaultThemeForNow()
      const getVisualTheme = (pref: Theme): Theme => {
        if (pref === 'system') {
          if (seasonalDefault !== 'system') return seasonalDefault as Theme
          const sys = (systemTheme ?? (resolvedTheme === 'dark' ? 'dark' : 'light')) as Theme
          return sys
        }
        return pref
      }

      const currentVisual = getVisualTheme(currentPreference)
      const nextVisual = getVisualTheme(nextPref)

      // If the visual theme isn't changing (e.g., system seasonal -> explicit seasonal),
      // update without animation.
      if (currentVisual === nextVisual) {
        setTheme(nextPref)
        captureThemeChanged(nextPref)
        setOpen(false)
        return
      }

      const viewportWidth = globalThis.innerWidth || 1
      const viewportHeight = globalThis.innerHeight || 1
      const clickX = event?.clientX ?? viewportWidth / 2
      const clickY = event?.clientY ?? viewportHeight / 2
      const originXPercent = Math.max(0, Math.min(100, (clickX / viewportWidth) * 100))
      const originYPercent = Math.max(0, Math.min(100, (clickY / viewportHeight) * 100))

      injectCircleBlur(originXPercent, originYPercent)
      startTransition(() => {
        setTheme(nextPref)
        captureThemeChanged(nextPref)
      })
      setOpen(false)
    },
    [
      currentPreference,
      injectCircleBlur,
      resolvedTheme,
      setTheme,
      startTransition,
      systemTheme,
    ],
  )

  type IconComponent = ComponentType<{ className?: string }>
  type ThemeOption = { label: string; value: Theme; Icon: IconComponent }

  const iconByTheme = useMemo<Partial<Record<Theme, IconComponent>>>(() => ({ system: SystemIcon }), [])

  const allOptions: ThemeOption[] = useMemo(() => {
    const themeList: readonly Theme[] = getAvailableThemes() as readonly Theme[]
    const achievementUnlocked = has('THEME_TAPDANCE')
    const filteredList = themeList.filter(t => {
      if (t === 'system') return true
      const entry = themes.find(e => e.name === t) as ThemeConfig | undefined
      if (entry?.alwaysHidden) return false
      const gated = Boolean(entry?.requiresAchievement)
      return achievementUnlocked || !gated
    })
    return filteredList.map((t): ThemeOption => {
      const label: string = getThemeLabel(t)
      const resolvedIcon: IconComponent = iconByTheme[t] ?? getThemeIcon(t, SystemIcon)
      return { label, value: t, Icon: resolvedIcon }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iconByTheme, has, unlocked, forceUpdate, seasonalOverlaysEnabled])

  // Compute dynamic width based on the longest theme label (in ch units)
  const menuWidthCh = useMemo(() => {
    const longest = allOptions.reduce((max, o) => Math.max(max, o.label.length), 0)
    // Add room for icon + gaps; clamp to [18ch, 32ch]
    const ch = Math.max(18, Math.min(32, longest + 8))
    return ch
  }, [allOptions])

  const optionsToShow = useMemo(() => {
    const systemOpt = allOptions.find(opt => opt.value === 'system')
    const base = allOptions.filter(opt => {
      if (opt.value === 'system') return false
      const entry = themes.find(e => e.name === opt.value) as ThemeConfig | undefined
      return entry && !('timeRange' in entry)
    })
    const seasonalActiveNames = new Set((getAvailableThemes() as readonly Theme[]).filter(t => t !== 'system'))
    const seasonalActive = allOptions.filter(opt => {
      if (opt.value === 'system') return false
      const entry = themes.find(e => e.name === opt.value) as ThemeConfig | undefined
      return entry && 'timeRange' in entry && seasonalActiveNames.has(opt.value)
    })

    let list: ThemeOption[] = [...base, ...seasonalActive]
    if (systemOpt) list = [systemOpt, ...list]
    // Hide the currently selected preference to avoid no-op selection
    list =
      currentPreference === 'system'
        ? list.filter(opt => opt.value !== 'system')
        : list.filter(opt => opt.value !== currentPreference)
    return list
  }, [allOptions, currentPreference])

  const onDocClick = useEffectEvent((e: MouseEvent) => {
    const target = e.target as Node | null
    if (containerRef.current && target && !containerRef.current.contains(target)) {
      setOpen(false)
      setOpenedViaKeyboard(false)
      triggerRef.current?.focus()
    }
  })
  const onDocKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
      setOpenedViaKeyboard(false)
      triggerRef.current?.focus()
    }
  })
  useEffect(() => {
    if (!open) return
    globalThis.addEventListener('mousedown', onDocClick)
    globalThis.addEventListener('keydown', onDocKey)
    return () => {
      globalThis.removeEventListener('mousedown', onDocClick)
      globalThis.removeEventListener('keydown', onDocKey)
    }
  }, [open, onDocClick, onDocKey])

  // focus first option when opening
  useEffect(() => {
    if (!open) return
    const id = globalThis.setTimeout(() => {
      if (openedViaKeyboard) optionRefs.current[0]?.focus()
    }, 0)
    return () => globalThis.clearTimeout(id)
  }, [open, openedViaKeyboard])

  // Removed parent callbacks and md+ width reporting to avoid shifting header

  useEffect(() => {
    if (open) {
      setTooltipHold(false)
      return
    }
    setTooltipHold(true)
    const id = globalThis.setTimeout(() => setTooltipHold(false), 150)
    return () => globalThis.clearTimeout(id)
  }, [open])

  const handleTriggerKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (open) {
          setOpen(false)
          setOpenedViaKeyboard(false)
        } else {
          setOpen(true)
          setOpenedViaKeyboard(true)
        }
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        setOpen(true)
        setOpenedViaKeyboard(true)
        // focus handled by effect
      }
    },
    [open],
  )

  const handleMenuKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const currentIndex = optionRefs.current.indexOf(document.activeElement as HTMLButtonElement | null)
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const nextIndex = currentIndex === -1 ? 0 : Math.min(optionsToShow.length - 1, currentIndex + 1)
        optionRefs.current[nextIndex]?.focus()
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prevIndex = currentIndex < 0 ? 0 : Math.max(0, currentIndex - 1)
        optionRefs.current[prevIndex]?.focus()
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
      }
    },
    [optionsToShow.length],
  )

  return (
    <div ref={containerRef} className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={triggerRef}
            variant="ghost"
            size="icon"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="theme-options"
            onClick={() => {
              setOpen(o => {
                const next = !o

                // When opening the menu, reset theme selection tracking
                if (!o && next) {
                  setThemeSelected(false)
                }

                // When closing the menu, only increment if no theme was selected
                if (o && !next && !themeSelected) {
                  const newCount = toggleCount + 1
                  setToggleCount(newCount)

                  // Unlock achievement after 6 toggles
                  if (newCount >= 6 && !has('THEME_TAPDANCE')) {
                    unlock('THEME_TAPDANCE')
                    setToggleCount(0) // Reset counter after unlocking
                  }
                }

                // If a theme was selected, reset the counter
                if (o && !next && themeSelected) {
                  setToggleCount(0)
                }

                setOpenedViaKeyboard(false)
                return next
              })
            }}
            onKeyDown={handleTriggerKeyDown}
            className={cn(
              'relative hover:ring-accent hover:ring-1 hover:ring-offset-2 ring-offset-background',
              hydrated ? 'transition-[transform,opacity] duration-200 will-change-transform' : 'transition-none',
              open ? 'z-[120] ring-1 ring-accent ring-offset-2 scale-95 rotate-3' : 'z-[70]',
            )}>
            <span className="relative inline-block align-middle">
              <style>{themeIconCss}</style>
              <style>{spinCss}</style>
              {themes.map(t => {
                const IconComp = t.icon
                return (
                  <IconComp
                    key={t.name}
                    data-theme={t.name}
                    className={cn(
                      'theme-icon h-[1.2rem] w-[1.2rem] transition-opacity duration-200 ease-out',
                      showSystemOverlay ? 'opacity-0' : 'opacity-100',
                    )}
                  />
                )
              })}
              <span
                className={cn(
                  'absolute inset-0 grid place-items-center pointer-events-none transition-opacity duration-200 ease-out',
                  showSystemOverlay ? 'opacity-100' : 'opacity-0',
                )}>
                <SystemIcon className={cn('h-[1.2rem] w-[1.2rem]', showSystemOverlay && 'theme-system-overlay-anim')} />
              </span>
            </span>
            <span className="sr-only">Toggle theme menu</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {(() => {
            if (open || tooltipHold) {
              if (currentPreference === 'system') return seasonalOverlaysEnabled ? 'Seasonal' : 'System'
              return `${currentPreference.slice(0, 1).toUpperCase()}${currentPreference.slice(1)}`
            }
            return 'Theme Toggle'
          })()}
        </TooltipContent>
      </Tooltip>

      {/* Backdrop overlay (all breakpoints) */}
      <div
        aria-hidden={!open}
        role="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close theme menu"
        onClick={() => {
          setOpen(false)
          setOpenedViaKeyboard(false)
        }}
        onKeyDown={e => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(false)
            setOpenedViaKeyboard(false)
          }
        }}
        className={cn(
          'fixed inset-0 z-[115] transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
          // Subtle flashy backdrop: tint + blur + vignette-ish gradient
          'backdrop-blur-sm bg-black/15 dark:bg-black/40',
        )}
      />

      <div
        id="theme-options"
        ref={optionsRef}
        suppressHydrationWarning
        role="menu"
        aria-label="Select theme"
        aria-hidden={!open}
        inert={!open}
        tabIndex={-1}
        onKeyDown={handleMenuKeyDown}
        className={cn(
          'absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[120]',
          'flex flex-col items-stretch gap-3',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}>
        {hydrated && (
          <div
            className={cn(
              'p-3 pt-8 transition-all duration-200 ease-out relative',
              open ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible -translate-y-2 scale-95',
            )}
            style={{ width: `min(92vw, ${menuWidthCh}ch)` }}
            role="group"
            aria-label="Theme controls">
            {/* Cog moved next to the first theme item, not occupying header space */}

            {/* Options popover will render under the settings button */}

            <div className="flex items-start gap-2">
              <div className="shrink-0 pt-1 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-controls="theme-options-panel"
                  aria-expanded={showOptions}
                  onClick={() => setShowOptions(v => !v)}
                  aria-label={showOptions ? 'Hide options' : 'Show options'}
                  className="h-7 w-7">
                  <Settings className="size-4" />
                </Button>
                <div
                  id="theme-options-panel"
                  className={cn(
                    'absolute right-0 top-full mt-2 w-[200px] text-xs flex-col gap-2 z-10 items-stretch text-right',
                    showOptions ? 'flex' : 'hidden',
                  )}
                  aria-hidden={!showOptions}>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 text-right">
                    Theme Options
                  </div>
                  <label className="flex items-center justify-between gap-2 select-none w-full">
                    <span>Seasonal overlays</span>
                    <input
                      type="checkbox"
                      checked={seasonalOverlaysEnabled}
                      onChange={e => setSeasonalOverlaysEnabled(e.target.checked)}
                      aria-label="Seasonal overlays"
                      className="accent-primary"
                    />
                  </label>
                  {(() => {
                    const seasonalDefault = getDefaultThemeForNow()
                    const visualTheme =
                      currentPreference === 'system'
                        ? seasonalDefault === 'system'
                          ? ((systemTheme ?? (resolvedTheme === 'dark' ? 'dark' : 'light')) as Theme)
                          : (seasonalDefault as Theme)
                        : currentPreference
                    return (
                      <>
                        {visualTheme === 'christmas' && (
                          <label className="flex items-center justify-between gap-2 select-none w-full">
                            <span>Disable snow</span>
                            <input
                              type="checkbox"
                              checked={disableSnow}
                              onChange={e => setDisableSnow(e.target.checked)}
                              aria-label="Disable snow"
                              className="accent-primary"
                            />
                          </label>
                        )}
                        {visualTheme === 'matrix' && (
                          <label className="flex items-center justify-between gap-2 select-none w-full">
                            <span>Disable code rain</span>
                            <input
                              type="checkbox"
                              checked={disableCodeRain}
                              onChange={e => setDisableCodeRain(e.target.checked)}
                              aria-label="Disable code rain"
                              className="accent-primary"
                            />
                          </label>
                        )}
                        {(() => {
                          // Show grid lights toggle for themes that support grid lights by default
                          const entry = themes.find(t => t.name === visualTheme) as ThemeConfig | undefined
                          const themeHasGrid = entry ? !('disableGridLights' in entry && entry.disableGridLights) : true
                          return (
                            themeHasGrid && (
                              <label className="flex items-center justify-between gap-2 select-none w-full">
                                <span>Disable grid lights</span>
                                <input
                                  type="checkbox"
                                  checked={disableGridLights}
                                  onChange={e => setDisableGridLights(e.target.checked)}
                                  aria-label="Disable grid lights"
                                  className="accent-primary"
                                />
                              </label>
                            )
                          )
                        })()}
                      </>
                    )
                  })()}
                </div>
              </div>
              <div className="max-h-[48vh] overflow-hidden flex-1">
                <div className="overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-1">
                  {optionsToShow.map((opt, idx) => (
                    <Button
                      key={opt.value}
                      ref={el => {
                        optionRefs.current[idx] = el
                      }}
                      onClick={e => handleThemeChange(opt.value, e)}
                      role="menuitem"
                      aria-label={opt.label}
                      title={opt.label}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'flex w-full transition-[opacity,transform] duration-200 ease-out hover:bg-accent/70 justify-start gap-2 rounded-md',
                        open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95',
                      )}
                      style={{ transitionDelay: `${idx * 30}ms` }}>
                      <span className="grid size-7 place-items-center shrink-0">
                        <opt.Icon className="size-4" />
                      </span>
                      <span className="text-sm font-medium text-foreground/90">{opt.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const useThemeTransition = () => {
  const startTransition = useCallback((updateFn: () => void) => {
    // Disable view transitions in Safari due to 3D animation performance issues
    if ('startViewTransition' in document && !isSafari()) {
      document.startViewTransition(updateFn)
    } else {
      updateFn()
    }
  }, [])
  return { startTransition }
}
