import { Button } from '@/components/ui/button'
import { themes } from '@/lib/themes'
import { buildPerThemeVariantCss } from '@/utils/theme-css'

export function ThemeToggleFallback() {
  const themeIconCss = buildPerThemeVariantCss({
    baseSelector: '.theme-icon',
    variantAttr: 'data-theme',
    display: 'inline-block',
  })

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Theme toggle"
      aria-disabled
      tabIndex={-1}
      className="pointer-events-none relative cursor-default select-none">
      <span className="relative inline-block align-middle">
        <style>{themeIconCss}</style>
        {themes.map(t => {
          const IconComp = t.icon
          return <IconComp key={t.name} data-theme={t.name} className="theme-icon h-[1.2rem] w-[1.2rem]" />
        })}
      </span>
      <span className="sr-only">Theme Toggle</span>
    </Button>
  )
}
