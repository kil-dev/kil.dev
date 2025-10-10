import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import { themes } from '@/lib/themes'
import type { SecretConsoleCommand } from '@/types/secret-console'
import { hasThemeTapdanceAchievement } from '@/utils/achievements'
import { getActiveSeasonalThemes } from '@/utils/theme-runtime'
import { getAchievementSubcommands, getHintableAchievementNumbers, getShowableAchievementNumbers } from './achievements'
import { getConfettiSubcommands } from './confetti'
import { getAvailablePageNames } from './nav'

type CompletionContext = {
  commands: Readonly<Record<string, SecretConsoleCommand>>
  resolveCommand: (name: string) => string | undefined
  cwd: string
  list: (path: string) => { name: string; isDir: boolean }[]
  normalizePath: (path: string) => string
}

type CompletionResult = {
  value: string
  caret: number
  suggestions?: string[]
}

// helpers
function alphabeticalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' })
}

function longestCommonPrefix(arr: string[]): string {
  if (arr.length === 0) return ''
  let p = arr[0]!
  for (let i = 1; i < arr.length; i++) {
    const s = arr[i]!
    let j = 0
    while (j < p.length && j < s.length && p[j] === s[j]) j++
    p = p.slice(0, j)
    if (p.length === 0) break
  }
  return p
}

function completeFirstTokenCommands(
  token: string,
  before: string,
  after: string,
  commands: Readonly<Record<string, SecretConsoleCommand>>,
): CompletionResult | null {
  const names = new Set<string>()
  for (const [name, def] of Object.entries(commands)) {
    names.add(name)
    if (def.aliases) for (const a of def.aliases) names.add(a)
  }
  const candidates = [...names].toSorted(alphabeticalCompare)
  const filtered = candidates.filter(name => name.startsWith(token))
  if (filtered.length === 0) return { value: `${before}${token}${after}`, caret: (before + token).length }
  if (filtered.length === 1) {
    const completed = filtered[0]!
    const nextToken = `${completed} `
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  if (token.length === 0) {
    return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
  }
  const common = longestCommonPrefix(filtered)
  if (common && common.length > token.length) {
    const nextToken = common
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
}

function completeFlags(
  token: string,
  before: string,
  after: string,
  flags: readonly string[],
): CompletionResult | null {
  if (!token.startsWith('-') || flags.length === 0) return null
  const filtered = flags.filter(f => f.startsWith(token))
  if (filtered.length === 0) return { value: `${before}${token}${after}`, caret: (before + token).length }
  if (filtered.length === 1) {
    const completed = filtered[0]!
    const nextToken = completed
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  if (token.length === 0)
    return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
  const common = longestCommonPrefix(filtered)
  if (common && common.length > token.length) {
    const nextToken = common
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
}

function completeArgCommands(
  token: string,
  before: string,
  after: string,
  commands: Readonly<Record<string, SecretConsoleCommand>>,
): CompletionResult | null {
  const names = new Set<string>()
  for (const [name, def] of Object.entries(commands)) {
    names.add(name)
    if (def.aliases) for (const a of def.aliases) names.add(a)
  }
  const candidates = [...names].toSorted(alphabeticalCompare)
  const matches = candidates.filter(n => n.startsWith(token))
  if (matches.length === 0) return { value: `${before}${token}${after}`, caret: (before + token).length }
  if (matches.length === 1) {
    const completed = matches[0]!
    const nextToken = completed
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  if (token.length === 0)
    return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: matches }
  const common = longestCommonPrefix(matches)
  if (common && common.length > token.length) {
    const nextToken = common
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: matches }
}

function completeVfs(
  token: string,
  before: string,
  after: string,
  ctx: CompletionContext,
  mode: 'files' | 'folders' | 'paths',
): CompletionResult | null {
  let dirPath = ctx.cwd
  let prefix = ''
  if (token.length > 0) {
    const pathLike = token
    const base = pathLike.startsWith('/') ? pathLike : `${ctx.cwd}/${pathLike}`
    const normalized = ctx.normalizePath(base)
    if (pathLike.endsWith('/')) {
      dirPath = normalized
      prefix = ''
    } else {
      const lastSlash = normalized.lastIndexOf('/')
      dirPath = lastSlash > 0 ? normalized.slice(0, lastSlash) : '/'
      prefix = normalized.slice(lastSlash + 1)
    }
  }
  const entries = ctx.list(dirPath)
  const candidates = entries
    .filter(e => {
      if (mode === 'files') return true // Show both files and directories for path navigation
      // For 'folders' and 'paths', only complete directories
      return e.isDir
    })
    .map(e => (e.isDir ? (e.name.endsWith('/') ? e.name : `${e.name}/`) : e.name))
  const filtered = candidates.filter(name => name.startsWith(prefix))
  if (filtered.length === 0) return { value: `${before}${token}${after}`, caret: (before + token).length }
  if (filtered.length === 1) {
    const completed = filtered[0]!
    // Preserve already-typed path head and append the completed segment
    const tokenHead = token.slice(0, Math.max(0, token.length - prefix.length))
    const nextToken = `${tokenHead}${completed}`
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  if (prefix.length === 0)
    return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
  const common = longestCommonPrefix(filtered)
  if (common && common.length > prefix.length) {
    const tokenHead = token.slice(0, Math.max(0, token.length - prefix.length))
    const nextToken = `${tokenHead}${common}`
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
}

function completeThemes(token: string, before: string, after: string): CompletionResult | null {
  const hasAchievement = hasThemeTapdanceAchievement()

  // Get currently active seasonal themes (based on current date)
  const activeSeasonalThemes = new Set(getActiveSeasonalThemes().map(st => st.theme))

  // Get available themes based on achievement status
  const hasUnlockedMatrix =
    typeof localStorage !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEYS.MATRIX_THEME_SELECTED) === '1'

  const availableThemeNames: string[] = themes
    .filter(t => {
      // Always exclude alwaysHidden themes
      if ('alwaysHidden' in t && t.alwaysHidden) return false

      // If theme is seasonal (has timeRange)
      if ('timeRange' in t) {
        // Show if currently active OR user has achievement
        return activeSeasonalThemes.has(t.name) || hasAchievement
      }

      // Exclude matrix from completion until unlocked
      if (t.name === 'matrix' && !hasUnlockedMatrix) return false

      return true
    })
    .map(t => t.name)

  const allThemes: string[] = ['system', ...availableThemeNames]
  const filtered: string[] = allThemes.filter(t => t.startsWith(token))

  if (filtered.length === 0) return { value: `${before}${token}${after}`, caret: (before + token).length }
  if (filtered.length === 1) {
    const completed = filtered[0]!
    const nextToken = `${completed} `
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  if (token.length === 0)
    return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
  const common = longestCommonPrefix(filtered)
  if (common && common.length > token.length) {
    const nextToken = common
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
}

function completePages(token: string, before: string, after: string): CompletionResult | null {
  const availablePages = getAvailablePageNames()
  const filtered = availablePages.filter(p => p.startsWith(token))

  if (filtered.length === 0) return { value: `${before}${token}${after}`, caret: (before + token).length }
  if (filtered.length === 1) {
    const completed = filtered[0]!
    const nextToken = `${completed} `
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  if (token.length === 0)
    return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
  const common = longestCommonPrefix(filtered)
  if (common && common.length > token.length) {
    const nextToken = common
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
}

function completeAchievementSubcommands(token: string, before: string, after: string): CompletionResult | null {
  const subcommands = getAchievementSubcommands()
  const filtered = subcommands.filter(s => s.startsWith(token))

  if (filtered.length === 0) return { value: `${before}${token}${after}`, caret: (before + token).length }
  if (filtered.length === 1) {
    const completed = filtered[0]!
    const nextToken = `${completed} `
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  if (token.length === 0)
    return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
  const common = longestCommonPrefix(filtered)
  if (common && common.length > token.length) {
    const nextToken = common
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
}

function completeConfettiSubcommands(token: string, before: string, after: string): CompletionResult | null {
  const subcommands = getConfettiSubcommands()
  const filtered = subcommands.filter(s => s.startsWith(token))

  if (filtered.length === 0) return { value: `${before}${token}${after}`, caret: (before + token).length }
  if (filtered.length === 1) {
    const completed = filtered[0]!
    const nextToken = `${completed} `
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  if (token.length === 0)
    return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
  const common = longestCommonPrefix(filtered)
  if (common && common.length > token.length) {
    const nextToken = common
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
}

function completeFromList(token: string, before: string, after: string, items: string[]): CompletionResult | null {
  const filtered = items.filter(item => item.startsWith(token))

  if (filtered.length === 0) return { value: `${before}${token}${after}`, caret: (before + token).length }
  if (filtered.length === 1) {
    const completed = filtered[0]!
    const nextToken = `${completed} `
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  if (token.length === 0)
    return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
  const common = longestCommonPrefix(filtered)
  if (common && common.length > token.length) {
    const nextToken = common
    const nextValue = `${before}${nextToken}${after}`
    const nextCaret = (before + nextToken).length
    return { value: nextValue, caret: nextCaret }
  }
  return { value: `${before}${token}${after}`, caret: (before + token).length, suggestions: filtered }
}

function completeAchievementArgs(token: string, before: string, after: string): CompletionResult | null {
  // Parse tokens before the current position to determine what subcommand was used
  const tokensBefore = before.trim().split(/\s+/).filter(Boolean)
  const numArgsSupplied = Math.max(0, tokensBefore.length - 1) // exclude the command itself

  // If we're on the second argument and first arg is 'hint' or 'show', complete numbers
  if (numArgsSupplied >= 1) {
    const subcommand = tokensBefore[1] // First argument after 'achievements'
    if (subcommand === 'hint') {
      const numbers = getHintableAchievementNumbers()
      return completeFromList(token, before, after, numbers)
    } else if (subcommand === 'show') {
      const numbers = getShowableAchievementNumbers()
      return completeFromList(token, before, after, numbers)
    }
  }

  // Otherwise complete subcommands
  return completeAchievementSubcommands(token, before, after)
}

function handleMaxPositionalArgs(
  token: string,
  before: string,
  after: string,
  value: string,
  caret: number,
  maxPositionalArgs: number | undefined,
  flags: readonly string[],
): CompletionResult | null {
  // If no max is specified, don't stop completion
  if (typeof maxPositionalArgs !== 'number') return null

  // Check how many positional arguments have been supplied
  const tokensBefore = before.trim().split(/\s+/).filter(Boolean)
  const numArgsSupplied = Math.max(0, tokensBefore.length - 1) // exclude the command itself

  // If we've reached the max, only allow flag completion
  if (numArgsSupplied >= maxPositionalArgs) {
    // Try flag completion first; if not applicable, return unchanged
    const flagRes = completeFlags(token, before, after, flags)
    if (flagRes) return flagRes
    return { value, caret }
  }

  // Haven't reached max yet, continue with normal positional completion
  return null
}

export function computeTabCompletion(value: string, caret: number, ctx: CompletionContext): CompletionResult {
  // Identify token under caret
  let start = caret
  while (start > 0 && value[start - 1] !== ' ') start--
  let end = caret
  while (end < value.length && value[end] !== ' ') end++

  const token = value.slice(start, end)
  const before = value.slice(0, start)
  const after = value.slice(end)
  const isFirstToken = before.trim().length === 0

  if (isFirstToken) {
    return completeFirstTokenCommands(token, before, after, ctx.commands) ?? { value, caret }
  }

  const maybeFirst = before.trim().split(/\s+/).find(Boolean)
  const firstToken = typeof maybeFirst === 'string' ? maybeFirst : ''
  const resolved = ctx.resolveCommand(firstToken)
  const mode = resolved ? (ctx.commands[resolved]?.completion?.args ?? 'paths') : 'paths'
  const flags = resolved ? (ctx.commands[resolved]?.completion?.flags ?? []) : []
  const maxPositionalArgs = resolved ? ctx.commands[resolved]?.completion?.maxPositionalArgs : undefined

  // Check if we've reached max positional args; if so, only complete flags or return unchanged
  const maxPosResult = handleMaxPositionalArgs(token, before, after, value, caret, maxPositionalArgs, flags)
  if (maxPosResult) return maxPosResult

  // Try flag completion
  const flagRes = completeFlags(token, before, after, flags)
  if (flagRes) return flagRes
  if (mode === 'commands') return completeArgCommands(token, before, after, ctx.commands) ?? { value, caret }
  if (mode === 'themes') return completeThemes(token, before, after) ?? { value, caret }
  if (mode === 'pages') return completePages(token, before, after) ?? { value, caret }
  if (mode === 'achievement-subcommands') return completeAchievementArgs(token, before, after) ?? { value, caret }
  if (mode === 'confetti-subcommands') return completeConfettiSubcommands(token, before, after) ?? { value, caret }
  const vfsMode = mode === 'none' ? 'paths' : mode
  return completeVfs(token, before, after, ctx, vfsMode) ?? { value, caret }
}
