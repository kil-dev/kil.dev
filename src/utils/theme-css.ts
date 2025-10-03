import { themes, type ThemeName } from '@/lib/themes'

type DisplayValue = 'none' | 'block' | 'inline' | 'inline-block'

function getThemeNames(): ThemeName[] {
  return themes.map(t => t.name)
}

function getNonBaseThemes(): ThemeName[] {
  return getThemeNames().filter(n => n !== 'light' && n !== 'dark')
}

function buildNotChain(classes: string[]): string {
  if (!classes.length) return ''
  return classes.map(n => `:not(.${n})`).join('')
}

export function buildPerThemeVariantCss({
  baseSelector,
  variantAttr,
  display = 'block',
}: {
  baseSelector: string
  variantAttr: string
  display?: DisplayValue
}): string {
  const names = getThemeNames()
  const nonBase = getNonBaseThemes()
  const rules: string[] = []

  // Hide all by default
  rules.push(`${baseSelector}{display:none}`)

  // Non-base themes take precedence when their class is on <html>
  for (const n of nonBase) {
    rules.push(`html.${n} ${baseSelector}[${variantAttr}="${n}"]{display:${display}}`)
  }

  // Dark shows when .dark present and no non-base theme class is active
  if (names.includes('dark')) {
    const notNonBase = buildNotChain(nonBase)
    rules.push(`html.dark${notNonBase} ${baseSelector}[${variantAttr}="dark"]{display:${display}}`)
  }

  // Light shows when not dark and no non-base theme class is active
  if (names.includes('light')) {
    const notOthers = buildNotChain(['dark', ...nonBase])
    rules.push(`html${notOthers} ${baseSelector}[${variantAttr}="light"]{display:${display}}`)
  }

  return rules.join('')
}
