// Theme initialization runtime (browser)
// This file is compiled and minified at build-time into an IIFE that exposes
// a global object `ThemeRuntime` with a named export function `initTheme`.

export type CompactDate = { m: number; d: number }

export type SeasonalEntry = {
  theme: string
  start: CompactDate
  end: CompactDate
  hidden?: boolean
}

export type ThemeScriptConfig = {
  base: string[]
  seasonal: SeasonalEntry[]
}

function validateConfig(config: ThemeScriptConfig): void {
  if (!config || !Array.isArray(config.base) || !Array.isArray(config.seasonal)) {
    throw new Error('Invalid theme runtime config shape')
  }

  const nameRe = /^[a-z][a-z0-9-]{0,31}$/

  for (const name of config.base) {
    if (typeof name !== 'string' || !nameRe.test(name)) {
      throw new Error(`Invalid base theme name: ${String(name)}`)
    }
  }

  for (const s of config.seasonal) {
    if (!s || typeof s.theme !== 'string' || !nameRe.test(s.theme)) {
      const bad =
        s && (s as { theme?: unknown }).theme !== undefined ? String((s as { theme?: unknown }).theme) : 'undefined'
      throw new Error(`Invalid seasonal theme name: ${bad}`)
    }
    const fields: Array<['start' | 'end', CompactDate]> = [
      ['start', s.start],
      ['end', s.end],
    ]
    for (const [label, val] of fields) {
      if (!val || typeof val.m !== 'number' || typeof val.d !== 'number') {
        throw new Error(`Invalid seasonal ${label} for theme ${s.theme}`)
      }
      if (val.m < 1 || val.m > 12 || val.d < 1 || val.d > 31) {
        throw new Error(`Out of range seasonal ${label} for theme ${s.theme}`)
      }
    }
  }
}

function inRange(dt: Date, s: CompactDate, e: CompactDate): boolean {
  const y = dt.getFullYear()
  const m = dt.getMonth() + 1
  const d = dt.getDate()

  const crosses = e.m < s.m || (e.m === s.m && e.d < s.d)
  const onOrAfterStart = m > s.m || (m === s.m && d >= s.d)
  const sy = crosses ? (onOrAfterStart ? y : y - 1) : y
  const ey = crosses ? sy + 1 : sy
  const sd = new Date(sy, s.m - 1, s.d)
  const ed = new Date(ey, e.m - 1, e.d)
  return dt >= sd && dt < ed
}

function getCookieTheme(): string | null {
  try {
    const re = /(?:^|;\s*)theme=([^;]+)/
    const m = re.exec(document.cookie)
    return m ? decodeURIComponent(m[1]!) : null
  } catch {
    return null
  }
}

function getLocalStorageTheme(): string | null {
  try {
    return localStorage.getItem('theme')
  } catch {
    return null
  }
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)]
}

function addDisableTransitionStyle(): HTMLStyleElement | null {
  try {
    const style = document.createElement('style')
    style.id = '__disable-theme-transitions'
    style.append(document.createTextNode('*,*::before,*::after{transition:none !important;animation:none !important}'))
    document.head.append(style)
    return style
  } catch {
    return null
  }
}

function removeElementSoon(el: HTMLElement | null): void {
  try {
    const rm = () => {
      el?.remove()
    }
    if (typeof globalThis.window.requestAnimationFrame === 'function') {
      globalThis.window.requestAnimationFrame(() => rm())
    } else {
      setTimeout(rm, 0)
    }
  } catch {}
}

function overlaysEnabledFromStorage(): boolean {
  try {
    const match = /(?:^|;\s*)seasonalOverlaysEnabled=([^;]+)/.exec(document.cookie)
    if (match?.[1] === '0') return false
    if (match?.[1] === '1') return true
  } catch {}
  try {
    const stored = localStorage.getItem('seasonalOverlaysEnabled')
    if (stored === '0') return false
    if (stored === '1') return true
  } catch {}
  return true
}

function detectHasThemeTapdance(root: HTMLElement): boolean {
  try {
    if (Object.hasOwn(root.dataset, 'hasThemeTapdance')) return true
  } catch {}
  try {
    const cookieRegex = /(?:^|;\s*)kil\.dev_achievements_v1=([^;]+)/
    const cookieMatch = cookieRegex.exec(document.cookie)
    const cookieValue = cookieMatch?.[1] ? decodeURIComponent(cookieMatch[1]) : ''
    return cookieValue.includes('THEME_TAPDANCE')
  } catch {}
  return false
}

function applyThemeDomChanges(
  root: HTMLElement,
  knownClasses: string[],
  targetClasses: string[],
  overlaysEnabled: boolean,
  pref: string,
  overlay: string | null,
  explicit: string | null,
  baseClass: string,
): void {
  try {
    root.dataset.seasonalOverlaysEnabled = overlaysEnabled ? '1' : '0'
  } catch {}

  for (const cls of knownClasses) {
    if (!targetClasses.includes(cls)) {
      try {
        root.classList.remove(cls)
      } catch {}
    }
  }

  for (const cls of targetClasses) {
    try {
      root.classList.add(cls)
    } catch {}
  }

  try {
    root.dataset.themePref = pref ?? ''
    root.dataset.seasonalDefault = overlay ?? ''
    root.dataset.appliedTheme = explicit ?? baseClass ?? ''
  } catch {}
}

export function initTheme(config: ThemeScriptConfig): void {
  validateConfig(config)

  // Internal evaluator: computes allowed themes and applies classes
  const evaluateAndApply = (allowAnimation = true): void => {
    const now = new Date()
    const active = config.seasonal.filter(s => inRange(now, s.start, s.end))
    const root = document.documentElement

    const hasThemeTapdance = detectHasThemeTapdance(root)
    const overlaysEnabled = overlaysEnabledFromStorage()
    const allowed = hasThemeTapdance
      ? uniqueStrings([...config.base, ...config.seasonal.filter(s => !s.hidden).map(s => s.theme)])
      : uniqueStrings([...config.base, ...active.filter(s => !s.hidden).map(s => s.theme)])

    const defaultTheme = hasThemeTapdance
      ? (active[0]?.theme ?? null) // Only use active seasonal themes, even when unlocked
      : (active[0]?.theme ?? null)

    const isAllowed = (t: unknown): t is string => typeof t === 'string' && allowed.includes(t)

    const cookieTheme = getCookieTheme()
    const lsTheme = getLocalStorageTheme()
    const sysDark = !!globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches

    const pref = isAllowed(lsTheme) ? lsTheme : isAllowed(cookieTheme) ? cookieTheme : 'system'

    const baseClass = sysDark ? 'dark' : ''

    let explicit: string | null = null
    let overlay: string | null = null

    if (pref === 'system') {
      overlay = overlaysEnabled ? (defaultTheme ?? null) : null
    } else if (isAllowed(pref)) {
      explicit = pref
    } else if (defaultTheme) {
      explicit = defaultTheme
    } else {
      explicit = baseClass
    }

    const oldOverlay = root.dataset.seasonalDefault ?? ''
    const oldApplied = root.dataset.appliedTheme ?? ''

    const targetClasses: string[] = []
    if (explicit) {
      targetClasses.push(explicit)
    } else {
      if (baseClass) targetClasses.push(baseClass)
      if (overlay) targetClasses.push(overlay)
    }

    const known = uniqueStrings([...config.base, ...config.seasonal.map(s => s.theme), 'dark'])

    const applyDomChanges = () => {
      try {
        root.dataset.seasonalOverlaysEnabled = overlaysEnabled ? '1' : '0'
      } catch {}
      for (const cls of known) {
        if (!targetClasses.includes(cls)) {
          try {
            root.classList.remove(cls)
          } catch {}
        }
      }

      for (const cls of targetClasses) {
        try {
          root.classList.add(cls)
        } catch {}
      }

      try {
        root.dataset.themePref = pref ?? ''
        root.dataset.seasonalDefault = overlay ?? ''
        root.dataset.appliedTheme = explicit ?? baseClass ?? ''
      } catch {}
    }

    const overlayChanged = (overlay ?? '') !== oldOverlay
    const appliedAfter = explicit ?? baseClass ?? ''
    const appliedChanged = appliedAfter !== oldApplied
    const shouldAnimate = pref === 'system' ? overlayChanged : appliedChanged

    if (allowAnimation && 'startViewTransition' in document && shouldAnimate && !isSafari()) {
      injectCircleBlurTransitionStyles()
      ;(document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(applyDomChanges)
    } else {
      const disable = addDisableTransitionStyle()
      applyDomChanges()
      removeElementSoon(disable)
    }
  }

  // Initial apply
  evaluateAndApply(false)

  // Re-evaluate on visibility/focus and page show (e.g., after BFCache restore or wake)
  try {
    const onVis = () => {
      if (document.visibilityState === 'visible') evaluateAndApply()
    }
    const onShow = () => evaluateAndApply()
    const onFocus = () => evaluateAndApply()
    document.addEventListener('visibilitychange', onVis)
    globalThis.addEventListener?.('pageshow', onShow)
    globalThis.addEventListener?.('focus', onFocus)

    // Lightweight minute ticker to catch date rollovers while tab is visible
    let lastDay = new Date().getDate()
    const interval = globalThis.setInterval?.(() => {
      const now = new Date()
      const d = now.getDate()
      if (d !== lastDay) {
        lastDay = d
        evaluateAndApply()
      }
    }, 60000)

    // Exact midnight trigger (more precise than minute ticker)
    const msUntilNextMidnight = () => {
      const now = new Date()
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
      return Math.max(250, next.getTime() - now.getTime())
    }
    let midnightTimeout: number | undefined
    const scheduleMidnight = () => {
      const ms = msUntilNextMidnight()
      midnightTimeout = globalThis.setTimeout?.(() => {
        try {
          evaluateAndApply()
        } finally {
          scheduleMidnight()
        }
      }, ms) as unknown as number
    }
    scheduleMidnight()

    // Clean up listeners when the script is re-run (defensive)
    ;(globalThis as unknown as { __kd_cleanup_theme_listeners__?: () => void }).__kd_cleanup_theme_listeners__ = () => {
      try {
        document.removeEventListener('visibilitychange', onVis)
        globalThis.removeEventListener?.('pageshow', onShow)
        globalThis.removeEventListener?.('focus', onFocus)
        if (typeof interval === 'number') globalThis.clearInterval?.(interval)
        if (typeof midnightTimeout === 'number') globalThis.clearTimeout?.(midnightTimeout)
      } catch {}
    }
  } catch {}
}

export default initTheme
