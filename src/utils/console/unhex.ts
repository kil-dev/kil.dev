import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function parseHexToUtf8(input: string): string {
  // Remove 0x/0X prefixes, spaces, and newlines
  const cleaned = input
    .replaceAll(/0[xX]/gi, ' ')
    .replaceAll(/[^0-9a-fA-F]/g, '')
    .toLowerCase()

  if (cleaned.length === 0) return ''
  if (cleaned.length % 2 !== 0) throw new Error('invalid hex length')

  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) {
    const byte = Number.parseInt(cleaned.slice(i, i + 2), 16)
    if (Number.isNaN(byte)) throw new Error('invalid hex byte')
    bytes[i / 2] = byte
  }
  return Buffer.from(bytes).toString('utf8')
}

function executeUnhex(args: string[], env: SecretConsoleEnv) {
  const target = args.join(' ')
  if (!target) {
    env.appendOutput(`usage: ${unhex.usage}`)
    return
  }

  const content = env.read(target)
  if (content === undefined) {
    env.appendOutput(`unhex: ${target}: No such file`)
    return
  }

  try {
    const decoded = parseHexToUtf8(content)
    env.appendOutput(decoded)
  } catch (err) {
    env.appendOutput(`unhex: failed: ${err instanceof Error ? err.message : 'unknown error'}`)
  }
}

export const unhex: SecretConsoleCommand = {
  usage: 'unhex <path>',
  help: 'unhex <path> — decode hexadecimal bytes into UTF-8 text',
  completion: { args: 'files', maxPositionalArgs: 1 },
  execute: executeUnhex,
}
