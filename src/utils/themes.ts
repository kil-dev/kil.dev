import Headshot from '@/images/headshot/headshot.webp'
import type { ThemeEntry, ThemeName } from '@/lib/themes'
import { themes, type Theme } from '@/lib/themes'
import type { BaseColor, IconComponent } from '@/types/themes'
import { Sun } from 'lucide-react'
import type { StaticImageData } from 'next/image'

export function getThemeLabel(theme: Theme): string {
  if (theme === 'system') {
    try {
      // If seasonal overlays are disabled, show 'System' instead of 'Seasonal'
      const overlaysEnabled =
        typeof document === 'undefined' ? true : document.documentElement.dataset.seasonalOverlaysEnabled !== '0'
      return overlaysEnabled ? 'Seasonal' : 'System'
    } catch {
      return 'Seasonal'
    }
  }
  const s = `${theme}`
  return s
    .split('-')
    .filter(Boolean)
    .map(w => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(' ')
}
const THEME_BY_NAME = new Map<ThemeName, ThemeEntry>(themes.map(t => [t.name, t] as const))

export function getThemeIcon(theme: Theme, systemIcon: IconComponent): IconComponent {
  if (theme === 'system') return systemIcon
  const entry = THEME_BY_NAME.get(theme)
  return entry?.icon ?? Sun
}

export function getThemeHeadshot(theme: ThemeName): StaticImageData {
  const entry = THEME_BY_NAME.get(theme)
  return entry?.headshotImage ?? Headshot
}

export function getThemeBaseColor(theme: ThemeName): BaseColor {
  const entry = THEME_BY_NAME.get(theme)
  return entry?.baseColor ?? 'light'
}
