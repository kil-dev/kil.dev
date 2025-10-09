import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

export function formatHeadNoSuchFile(path: string): string {
  return `head: ${path}: No such file`
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

function executeHead(args: string[], env: SecretConsoleEnv) {
  const parsed = parseCountFlag(args)
  const i = parsed ? parsed.pathStart : 0
  const n = parsed ? parsed.count : 10
  const target = args.slice(i).join(' ')
  if (!target) {
    env.appendOutput(`usage: ${head.usage}`)
    return
  }
  const content = env.read(target)
  if (content === undefined) {
    env.appendOutput(formatHeadNoSuchFile(target))
    return
  }
  const lines = content.split('\n').slice(0, n).join('\n')
  env.appendOutput(lines)
}

export const head: SecretConsoleCommand = {
  usage: 'head [-n N] <path>',
  help: 'head [-n N] <path> — first N lines (default 10)',
  completion: { args: 'files', flags: ['-n'] },
  execute: executeHead,
}
