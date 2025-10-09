import type { SecretConsoleCommand, SecretConsoleEnv } from '@/lib/secret-console-commands'

function executeWc(args: string[], env: SecretConsoleEnv) {
  const target = args.join(' ')
  if (!target) {
    env.appendOutput('usage: wc <path>')
    return
  }
  const content = env.read(target)
  if (content === undefined) {
    env.appendOutput(`wc: ${target}: No such file`)
    return
  }
  const lineCount = content.length === 0 ? 0 : content.split('\n').length
  const wordCount = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length
  const byteCount = content.length
  env.appendOutput(`${lineCount} ${wordCount} ${byteCount} ${target}`)
}

export const wc: SecretConsoleCommand = {
  usage: 'wc <path> — line, word, byte counts',
  execute: executeWc,
}
