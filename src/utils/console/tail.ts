import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

export function formatTailNoSuchFile(path: string): string {
  return `tail: ${path}: No such file`
}

function parseCountFlag(args: string[]): { count: number; pathStart: number } | undefined {
  let count = 10
  let i = 0
  if (args[0] === '-n') {
    const n = Number(args[1])
    if (!Number.isFinite(n) || n <= 0) return undefined
    count = Math.floor(n)
    i = 2
  }
  return { count, pathStart: i }
}

function executeTail(args: string[], env: SecretConsoleEnv) {
  const parsed = parseCountFlag(args)
  if (args[0] === '-n' && !parsed) {
    env.appendOutput('tail: invalid line count')
    env.appendOutput(`usage: ${tail.usage}`)
    return
  }
  const i = parsed ? parsed.pathStart : 0
  const n = parsed ? parsed.count : 10
  const target = args.slice(i).join(' ')
  if (!target) {
    env.appendOutput(`usage: ${tail.usage}`)
    return
  }
  const stat = env.stat(target)
  if (stat && stat.kind === 'file' && stat.binary) {
    env.appendOutput(`tail: ${target}: Is a binary file`)
    return
  }
  const content = env.read(target)
  if (content === undefined) {
    env.appendOutput(formatTailNoSuchFile(target))
    return
  }
  const parts = content.split('\n')
  const lines = parts.slice(Math.max(0, parts.length - n)).join('\n')
  env.appendOutput(lines)
}

export const tail: SecretConsoleCommand = {
  usage: 'tail [-n N] <path>',
  help: 'tail [-n N] <path> — last N lines (default 10)',
  completion: { args: 'files', flags: ['-n'], maxPositionalArgs: 1 },
  execute: executeTail,
}
