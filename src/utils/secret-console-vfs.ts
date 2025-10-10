import { ACHIEVEMENTS, type AchievementId } from '@/lib/achievements'
import { SECRET_CONSOLE_COMMANDS } from '@/lib/secret-console-commands'
import { LOCAL_STORAGE_KEYS } from '@/lib/storage-keys'
import type { VfsNode, VfsStat } from '@/types/secret-console'
import { parseUnlockedStorage } from '@/utils/achievements'
import { getAvailableThemes } from '@/utils/theme-runtime'

export function normalizePath(path: string): string {
  if (!path) return '/'

  // Expand ~ to /home/kil
  let expandedPath = path
  if (path === '~' || path.startsWith('~/')) {
    expandedPath = path.replace(/^~/, '/home/kil')
  }

  const parts = expandedPath.split('/').filter(Boolean)
  const stack: string[] = []
  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') {
      if (stack.length) stack.pop()
      continue
    }
    stack.push(part)
  }
  const joined = '/' + stack.join('/')
  return joined
}

function splitPath(path: string): string[] {
  const abs = normalizePath(path)
  return abs.split('/').filter(Boolean)
}

export function vfsResolve(root: VfsNode, path: string): VfsNode | undefined {
  const parts = splitPath(path)
  let node: VfsNode = root
  for (const part of parts) {
    if (node.type !== 'dir') return undefined
    const children = typeof node.children === 'function' ? node.children() : node.children
    const next = children[part]
    if (!next) return undefined
    node = next
  }
  return node
}

export function vfsList(root: VfsNode, path: string): { name: string; isDir: boolean }[] {
  const node = vfsResolve(root, path)
  if (!node) return []
  if (node.type === 'file') {
    const parts = splitPath(path)
    const name = parts.at(-1) ?? ''
    return [{ name, isDir: false }]
  }
  const children = typeof node.children === 'function' ? node.children() : node.children
  return Object.entries(children).map(([name, child]) => ({
    name: child.type === 'dir' ? `${name}/` : name,
    isDir: child.type === 'dir',
  }))
}

export function vfsRead(root: VfsNode, path: string): string | undefined {
  const node = vfsResolve(root, path)
  if (!node || node.type !== 'file') return undefined
  const content = node.content
  return typeof content === 'function' ? content() : content
}

export function vfsStat(root: VfsNode, path: string): VfsStat | undefined {
  const node = vfsResolve(root, path)
  if (!node) return undefined
  if (node.type === 'dir') {
    return { kind: 'dir', binary: false, executable: false, size: 0 }
  }
  const rawContent = node.content ?? ''
  const content = typeof rawContent === 'function' ? rawContent() : rawContent
  const size = new TextEncoder().encode(content).length
  const binary = node.meta?.binary === true
  const executable = node.meta?.executable === true
  return { kind: 'file', binary, executable, size }
}

function makeBinaryFile(): VfsNode {
  return {
    type: 'file',
    content: '\u0000ELF\n',
    meta: { binary: true, executable: true },
  } as VfsNode
}

export function getThemeCacheContent(): string {
  let activeTheme = 'system'
  try {
    if (typeof localStorage !== 'undefined') {
      activeTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) ?? 'system'
    }
  } catch {
    // localStorage not available
  }
  const availableThemes = getAvailableThemes()
  return (
    '{\n' +
    '  "cached": "' +
    new Date().toISOString() +
    '",\n' +
    '  "themes": ' +
    JSON.stringify(availableThemes) +
    ',\n' +
    '  "active": "' +
    activeTheme +
    '"\n' +
    '}\n'
  )
}

export function getUnlockedAchievementFiles(): Record<string, VfsNode> {
  const files: Record<string, VfsNode> = {}

  try {
    if (typeof localStorage === 'undefined') return files

    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENTS)
    const unlocked = parseUnlockedStorage(stored)

    for (const [achievementId, timestamp] of Object.entries(unlocked)) {
      if (achievementId in ACHIEVEMENTS) {
        const achievement = ACHIEVEMENTS[achievementId as AchievementId]
        const filename = `${achievementId.toLowerCase().replaceAll('_', '-')}.txt`

        files[filename] = {
          type: 'file',
          content: achievement.cardDescription + '\n' + `Unlocked: ${timestamp}\n`,
        }
      }
    }
  } catch {
    // If localStorage is not available or parsing fails, return empty
  }

  return files
}

export function getAchievementProgressContent(): string {
  let unlockedCount = 0

  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ACHIEVEMENTS)
      const unlocked = parseUnlockedStorage(stored)
      unlockedCount = Object.keys(unlocked).filter(id => id in ACHIEVEMENTS).length
    }
  } catch {
    // If localStorage is not available, count stays 0
  }

  const totalCount = Object.keys(ACHIEVEMENTS).length
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  let hint = 'Start exploring!'
  if (unlockedCount === 0) {
    hint = 'Start exploring to unlock achievements!'
  } else if (unlockedCount < totalCount / 2) {
    hint = "You're making progress! Keep going!"
  } else if (unlockedCount < totalCount) {
    hint = "You're over halfway there! Can you find them all?"
  } else {
    hint = 'Achievement master! You found them all!'
  }

  return (
    '{\n' +
    '  "total": ' +
    totalCount +
    ',\n' +
    '  "unlocked": ' +
    unlockedCount +
    ',\n' +
    '  "percentage": ' +
    percentage +
    ',\n' +
    '  "hint": "' +
    hint +
    '"\n' +
    '}\n'
  )
}

export const binChildren: Record<string, VfsNode> = Object.fromEntries(
  Object.keys(SECRET_CONSOLE_COMMANDS).map(name => [name, makeBinaryFile()]),
)
