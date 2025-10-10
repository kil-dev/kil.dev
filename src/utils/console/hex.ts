import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function executeHex(args: string[], env: SecretConsoleEnv) {
  const target = args.join(' ')
  if (!target) {
    env.appendOutput(`usage: ${hex.usage}`)
    return
  }

  const content = env.read(target)
  if (content === undefined) {
    env.appendOutput(`hex: ${target}: No such file`)
    return
  }

  const bytes = Buffer.from(content, 'utf8')
  const parts: string[] = []
  for (const byte of bytes) {
    parts.push(byte.toString(16).padStart(2, '0'))
  }
  env.appendOutput(parts.join(' '))
}

export const hex: SecretConsoleCommand = {
  usage: 'hex <path>',
  help: 'hex <path> — encode file contents as hexadecimal bytes',
  completion: { args: 'files', maxPositionalArgs: 1 },
  execute: executeHex,
}
