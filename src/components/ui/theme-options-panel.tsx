'use client'

import { useTheme } from '@/components/providers/theme-provider'
import { Switch as MotionSwitch } from '@/components/ui/motion-switch'
import { themes, type Theme } from '@/lib/themes'
import type { ThemeConfig } from '@/types/themes'
import { getDefaultThemeForNow } from '@/utils/theme-runtime'
import { AnimatePresence, motion } from 'motion/react'

export function ThemeOptionsPanel({ open, align = 'right' }: { open: boolean; align?: 'right' | 'center' }) {
  const {
    seasonalOverlaysEnabled,
    setSeasonalOverlaysEnabled,
    disableSnow,
    setDisableSnow,
    disableCodeRain,
    setDisableCodeRain,
    disableGridLights,
    setDisableGridLights,
    disableThemeHeadshot,
    setDisableThemeHeadshot,
    theme,
    resolvedTheme,
    systemTheme,
  } = useTheme()

  const currentPreference: Theme = theme ?? 'system'

  const containerPosClass =
    align === 'right'
      ? 'absolute right-0 top-full mt-2 w-[200px]'
      : 'absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[min(92vw,200px)]'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="theme-options-panel"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.3 }}
          className={`${containerPosClass} text-xs z-10 text-right`}
          aria-hidden={!open}>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground text-right">Theme Options</div>
          <motion.div
            className="p-2 flex flex-col gap-2"
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
              hidden: { opacity: 0, y: -2 },
              show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
              exit: { opacity: 0, y: -2 },
            }}>
            <motion.label
              htmlFor="theme-panel-seasonal-overlays"
              variants={{ hidden: { opacity: 0, y: -2 }, show: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -2 } }}
              className="flex items-center justify-between gap-2 select-none w-full">
              <span>Seasonal overlays</span>
              <MotionSwitch
                id="theme-panel-seasonal-overlays"
                checked={seasonalOverlaysEnabled}
                onCheckedChange={setSeasonalOverlaysEnabled}
                aria-label="Seasonal overlays"
                size="md"
              />
            </motion.label>
            <motion.label
              htmlFor="theme-panel-headshot"
              variants={{ hidden: { opacity: 0, y: -2 }, show: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -2 } }}
              className="flex items-center justify-between gap-2 select-none w-full">
              <span>Themed headshot</span>
              <MotionSwitch
                id="theme-panel-headshot"
                checked={!disableThemeHeadshot}
                onCheckedChange={v => setDisableThemeHeadshot(!v)}
                aria-label="Themed headshot"
                size="md"
              />
            </motion.label>
            {(() => {
              const seasonalDefault = getDefaultThemeForNow()
              let visualTheme: Theme
              if (currentPreference === 'system') {
                visualTheme =
                  seasonalDefault === 'system'
                    ? ((systemTheme ?? (resolvedTheme === 'dark' ? 'dark' : 'light')) as Theme)
                    : (seasonalDefault as Theme)
              } else {
                visualTheme = currentPreference
              }
              return (
                <>
                  {visualTheme === 'christmas' && (
                    <motion.label
                      htmlFor="theme-panel-snow"
                      variants={{
                        hidden: { opacity: 0, y: -2 },
                        show: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: -2 },
                      }}
                      className="flex items-center justify-between gap-2 select-none w-full">
                      <span>Snow</span>
                      <MotionSwitch
                        id="theme-panel-snow"
                        checked={!disableSnow}
                        onCheckedChange={v => setDisableSnow(!v)}
                        aria-label="Snow"
                        size="md"
                      />
                    </motion.label>
                  )}
                  {visualTheme === 'matrix' && (
                    <motion.label
                      htmlFor="theme-panel-code-rain"
                      variants={{
                        hidden: { opacity: 0, y: -2 },
                        show: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: -2 },
                      }}
                      className="flex items-center justify-between gap-2 select-none w-full">
                      <span>Code rain</span>
                      <MotionSwitch
                        id="theme-panel-code-rain"
                        checked={!disableCodeRain}
                        onCheckedChange={v => setDisableCodeRain(!v)}
                        aria-label="Code rain"
                        size="md"
                      />
                    </motion.label>
                  )}
                  {(() => {
                    const entry = themes.find(t => t.name === visualTheme) as ThemeConfig | undefined
                    const themeHasGrid = entry ? !('disableGridLights' in entry && entry.disableGridLights) : true
                    return (
                      themeHasGrid && (
                        <motion.label
                          htmlFor="theme-panel-grid-lights"
                          variants={{
                            hidden: { opacity: 0, y: -2 },
                            show: { opacity: 1, y: 0 },
                            exit: { opacity: 0, y: -2 },
                          }}
                          className="flex items-center justify-between gap-2 select-none w-full">
                          <span>Grid lights</span>
                          <MotionSwitch
                            id="theme-panel-grid-lights"
                            checked={!disableGridLights}
                            onCheckedChange={v => setDisableGridLights(!v)}
                            aria-label="Grid lights"
                            size="md"
                          />
                        </motion.label>
                      )
                    )
                  })()}
                </>
              )
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Static/inline version suitable for mobile drawers
export function ThemeOptionsSheet() {
  const {
    seasonalOverlaysEnabled,
    setSeasonalOverlaysEnabled,
    disableSnow,
    setDisableSnow,
    disableCodeRain,
    setDisableCodeRain,
    disableGridLights,
    setDisableGridLights,
    disableThemeHeadshot,
    setDisableThemeHeadshot,
    theme,
    resolvedTheme,
    systemTheme,
  } = useTheme()

  const currentPreference: Theme = theme ?? 'system'

  return (
    <div className="w-full text-xs text-right">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground text-right">Theme Options</div>
      <div className="p-2 flex flex-col gap-2">
        <label htmlFor="theme-seasonal-overlays" className="flex items-center justify-between gap-2 select-none w-full">
          <span>Seasonal overlays</span>
          <MotionSwitch
            id="theme-seasonal-overlays"
            checked={seasonalOverlaysEnabled}
            onCheckedChange={setSeasonalOverlaysEnabled}
            aria-label="Seasonal overlays"
            size="md"
          />
        </label>
        <label htmlFor="theme-headshot" className="flex items-center justify-between gap-2 select-none w-full">
          <span>Themed headshot</span>
          <MotionSwitch
            id="theme-headshot"
            checked={!disableThemeHeadshot}
            onCheckedChange={v => setDisableThemeHeadshot(!v)}
            aria-label="Themed headshot"
            size="md"
          />
        </label>
        {(() => {
          const seasonalDefault = getDefaultThemeForNow()
          let visualTheme: Theme
          if (currentPreference === 'system') {
            visualTheme =
              seasonalDefault === 'system'
                ? ((systemTheme ?? (resolvedTheme === 'dark' ? 'dark' : 'light')) as Theme)
                : (seasonalDefault as Theme)
          } else {
            visualTheme = currentPreference
          }
          return (
            <>
              {visualTheme === 'christmas' && (
                <label htmlFor="theme-snow" className="flex items-center justify-between gap-2 select-none w-full">
                  <span>Snow</span>
                  <MotionSwitch
                    id="theme-snow"
                    checked={!disableSnow}
                    onCheckedChange={v => setDisableSnow(!v)}
                    aria-label="Snow"
                    size="md"
                  />
                </label>
              )}
              {visualTheme === 'matrix' && (
                <label htmlFor="theme-code-rain" className="flex items-center justify-between gap-2 select-none w-full">
                  <span>Code rain</span>
                  <MotionSwitch
                    id="theme-code-rain"
                    checked={!disableCodeRain}
                    onCheckedChange={v => setDisableCodeRain(!v)}
                    aria-label="Code rain"
                    size="md"
                  />
                </label>
              )}
              {(() => {
                const entry = themes.find(t => t.name === visualTheme) as ThemeConfig | undefined
                const themeHasGrid = entry ? !('disableGridLights' in entry && entry.disableGridLights) : true
                return (
                  themeHasGrid && (
                    <label
                      htmlFor="theme-grid-lights"
                      className="flex items-center justify-between gap-2 select-none w-full">
                      <span>Grid lights</span>
                      <MotionSwitch
                        id="theme-grid-lights"
                        checked={!disableGridLights}
                        onCheckedChange={v => setDisableGridLights(!v)}
                        aria-label="Grid lights"
                        size="md"
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
  )
}
