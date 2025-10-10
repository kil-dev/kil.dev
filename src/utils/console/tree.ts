import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

type TreeOptions = {
  maxDepth: number
  dirsOnly: boolean
}

function parseTreeArgs(args: string[]): { path: string; options: TreeOptions } {
  const options: TreeOptions = {
    maxDepth: 3,
    dirsOnly: false,
  }

  let path = '.'
  let i = 0

  while (i < args.length) {
    const arg = args[i]!

    if (arg === '-L' && i + 1 < args.length) {
      const depth = Number.parseInt(args[i + 1]!, 10)
      if (!Number.isNaN(depth) && depth > 0) {
        options.maxDepth = depth
      }
      i += 2
      continue
    }

    if (arg === '-d') {
      options.dirsOnly = true
      i += 1
      continue
    }

    // Treat as path if it doesn't start with -
    if (!arg.startsWith('-')) {
      path = arg
    }

    i += 1
  }

  return { path, options }
}

function buildTree(
  env: SecretConsoleEnv,
  path: string,
  prefix: string,
  isLast: boolean,
  currentDepth: number,
  options: TreeOptions,
  stats: { dirs: number; files: number },
): string[] {
  const lines: string[] = []

  // Check if path exists and is accessible
  const stat = env.stat(path)
  if (!stat) {
    return lines
  }

  // Get children
  const children = env.list(path)
  if (!children || children.length === 0) {
    return lines
  }

  // Filter children based on options
  const filteredChildren = options.dirsOnly ? children.filter(c => c.isDir) : children

  // Sort: directories first, then alphabetically
  filteredChildren.sort((a, b) => {
    if (a.isDir && !b.isDir) return -1
    if (!a.isDir && b.isDir) return 1
    return a.name.localeCompare(b.name)
  })

  for (const [index, child] of filteredChildren.entries()) {
    const isLastChild = index === filteredChildren.length - 1
    const connector = isLastChild ? '└── ' : '├── '
    const childPrefix = prefix + (isLast ? '    ' : '│   ')

    // Display the child
    lines.push(prefix + connector + child.name)

    // Update stats
    if (child.isDir) {
      stats.dirs += 1
    } else {
      stats.files += 1
    }

    // Recurse into directories if within depth limit
    if (child.isDir && currentDepth < options.maxDepth) {
      const childPath = path === '/' ? `/${child.name.replace(/\/$/, '')}` : `${path}/${child.name.replace(/\/$/, '')}`
      const childLines = buildTree(env, childPath, childPrefix, isLastChild, currentDepth + 1, options, stats)
      lines.push(...childLines)
    }
  }

  return lines
}

function executeTree(args: string[], env: SecretConsoleEnv) {
  const { path, options } = parseTreeArgs(args)

  // Resolve the path
  const absolutePath = path === '.' ? env.pwd() : path

  // Check if the path exists
  const stat = env.stat(absolutePath)
  if (!stat) {
    env.appendOutput(`tree: ${path}: No such file or directory`)
    return
  }

  if (stat.kind !== 'dir') {
    env.appendOutput(`tree: ${path}: Not a directory`)
    return
  }

  // Display the root
  env.appendOutput(absolutePath)

  // Build and display the tree
  const stats = { dirs: 0, files: 0 }
  const lines = buildTree(env, absolutePath, '', true, 1, options, stats)

  for (const line of lines) {
    env.appendOutput(line)
  }

  // Display summary
  if (options.dirsOnly) {
    env.appendOutput('')
    env.appendOutput(`${stats.dirs} ${stats.dirs === 1 ? 'directory' : 'directories'}`)
  } else {
    env.appendOutput('')
    env.appendOutput(
      `${stats.dirs} ${stats.dirs === 1 ? 'directory' : 'directories'}, ${stats.files} ${stats.files === 1 ? 'file' : 'files'}`,
    )
  }
}

export const tree: SecretConsoleCommand = {
  usage: 'tree [-L depth] [-d] [path]',
  help: 'tree [-L depth] [-d] [path] — display directory tree structure',
  completion: { args: 'paths', flags: ['-L', '-d'] },
  execute: executeTree,
}
