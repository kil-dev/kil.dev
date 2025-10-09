import { themes } from '@/lib/themes'
import type { SecretConsoleCommand } from '@/types/secret-console'

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
  const candidates = [...names].toSorted()
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
  const candidates = [...names].toSorted()
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
  // Get available themes including alwaysHidden ones for secret console
  // Filter out only truly hidden themes (alwaysHidden), but include hiddenFromMenu themes
  const availableThemeNames: string[] = themes.filter(t => !('alwaysHidden' in t && t.alwaysHidden)).map(t => t.name)
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

  const flagRes = completeFlags(token, before, after, flags)
  if (flagRes) return flagRes
  if (mode === 'commands') return completeArgCommands(token, before, after, ctx.commands) ?? { value, caret }
  if (mode === 'themes') return completeThemes(token, before, after) ?? { value, caret }
  const vfsMode = mode === 'none' ? 'paths' : mode
  return completeVfs(token, before, after, ctx, vfsMode) ?? { value, caret }
}
