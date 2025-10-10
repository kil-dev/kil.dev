import type { VfsNode, VfsStat } from '@/types/secret-console'

export function normalizePath(path: string): string {
  if (!path) return '/'
  const parts = path.split('/').filter(Boolean)
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
    const next = node.children[part]
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
  return Object.entries(node.children).map(([name, child]) => ({
    name: child.type === 'dir' ? `${name}/` : name,
    isDir: child.type === 'dir',
  }))
}

export function vfsRead(root: VfsNode, path: string): string | undefined {
  const node = vfsResolve(root, path)
  if (!node || node.type !== 'file') return undefined
  return node.content
}

export function vfsStat(root: VfsNode, path: string): VfsStat | undefined {
  const node = vfsResolve(root, path)
  if (!node) return undefined
  if (node.type === 'dir') {
    return { kind: 'dir', binary: false, executable: false, size: 0 }
  }
  const content = node.content ?? ''
  const size = new TextEncoder().encode(content).length
  const binary = node.meta?.binary === true
  const executable = node.meta?.executable === true
  return { kind: 'file', binary, executable, size }
}
