import * as Headshots from '@/images/headshot'
import type { ThemeConfig } from '@/types/themes'
import { Clover, Ghost, Gift, Globe, Leaf, Moon, Rainbow, Sun, Terminal, Zap } from 'lucide-react'

export const themes = [
  {
    name: 'light',
    icon: Sun,
    headshotImage: Headshots.Headshot,
    baseColor: 'light',
    darkModeNote: '(why are you in light mode?)',
  },
  {
    name: 'dark',
    icon: Moon,
    headshotImage: Headshots.Headshot,
    baseColor: 'dark',
    darkModeNote: '(good choice)',
  },
  {
    name: 'dotcom',
    icon: Globe,
    headshotImage: Headshots.Dotcom,
    baseColor: 'light',
    darkModeNote: '(circa 1999)',
    disableGridLights: true,
    hiddenFromMenu: true,
  },
  {
    name: 'cyberpunk',
    icon: Zap,
    headshotImage: Headshots.Cyberpunk,
    darkModeNote: '(cyberpunk is cool, too)',
    baseColor: 'dark',
  },
  {
    name: 'matrix',
    icon: Terminal,
    headshotImage: Headshots.Matrix,
    baseColor: 'dark',
    darkModeNote: '',
    disableGridLights: true,
    hiddenFromMenu: true,
  },
  {
    name: 'st-patricks',
    icon: Clover,
    headshotImage: Headshots.Birthday,
    baseColor: 'dark',
    darkModeNote: "(It's my birthday!)",
    timeRange: { start: { month: 3, day: 17 }, end: { month: 3, day: 18 } },
    alwaysHidden: true,
  },
  {
    name: 'pride',
    icon: Rainbow,
    headshotImage: Headshots.Pride,
    baseColor: 'dark',
    darkModeNote: '(Be yourself 🌈)',
    timeRange: { start: { month: 6, day: 1 }, end: { month: 7, day: 1 } },
  },
  {
    name: 'halloween',
    icon: Ghost,
    headshotImage: Headshots.Halloween,
    baseColor: 'dark',
    darkModeNote: '(Spooky Season!)',
    timeRange: { start: { month: 10, day: 15 }, end: { month: 11, day: 1 } },
  },
  {
    name: 'thanksgiving',
    icon: Leaf,
    headshotImage: Headshots.Thanksgiving,
    baseColor: 'dark',
    darkModeNote: '(Happy Thanksgiving!)',
    timeRange: { start: { month: 11, day: 15 }, end: { month: 11, day: 30 } },
  },
  {
    name: 'christmas',
    icon: Gift,
    headshotImage: Headshots.Christmas,
    baseColor: 'dark',
    darkModeNote: '(Merry Christmas!)',
    disableGridLights: true,
    enableSnow: true,
    timeRange: { start: { month: 12, day: 1 }, end: { month: 12, day: 26 } },
  },
  {
    name: 'april-fools',
    icon: Zap,
    headshotImage: Headshots.Headshot,
    baseColor: 'dark',
    darkModeNote: '',
    timeRange: { start: { month: 4, day: 1 }, end: { month: 4, day: 2 } },
    alwaysHidden: true,
  },
] as const satisfies ReadonlyArray<ThemeConfig>

export type ThemeEntry = (typeof themes)[number]
export type ThemeName = ThemeEntry['name']
export type Theme = ThemeName | 'system'
