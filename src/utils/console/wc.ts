import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

export function formatWcNoSuchFile(path: string): string {
  return `wc: ${path}: No such file`
}

function executeWc(args: string[], env: SecretConsoleEnv) {
  const target = args.join(' ')
  if (!target) {
    env.appendOutput(`usage: ${wc.usage}`)
    return
  }
  const content = env.read(target)
  if (content === undefined) {
    env.appendOutput(formatWcNoSuchFile(target))
    return
  }
  const lineCount = content.length === 0 ? 0 : content.split('\n').length
  const wordCount = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length
  const byteCount = content.length
  env.appendOutput(`${lineCount} ${wordCount} ${byteCount} ${target}`)
}

export const wc: SecretConsoleCommand = {
  usage: 'wc <path>',
  help: 'wc <path> — line, word, byte counts',
  completion: { args: 'files' },
  execute: executeWc,
}
