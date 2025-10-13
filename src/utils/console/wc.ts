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
  const stat = env.stat(target)
  if (stat?.kind === 'file' && stat.binary) {
    env.appendOutput(`wc: ${target}: Is a binary file`)
    return
  }
  const content = env.read(target)
  if (content === undefined) {
    env.appendOutput(formatWcNoSuchFile(target))
    return
  }
  const lineCount = (content.match(/\n/g) ?? []).length
  const wordCount = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length
  const byteCount = new TextEncoder().encode(content).length
  env.appendOutput(`${lineCount} ${wordCount} ${byteCount} ${target}`)
}

export const wc: SecretConsoleCommand = {
  usage: 'wc <path>',
  help: 'wc <path> — line, word, byte counts',
  completion: { args: 'files', maxPositionalArgs: 1 },
  execute: executeWc,
}
