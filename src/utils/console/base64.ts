import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function usage(env: SecretConsoleEnv) {
  env.appendOutput(`usage: ${base64.usage}`)
}

function toBase64Utf8(str: string): string {
  try {
    if (typeof globalThis.btoa === 'function') {
      const bytes = new TextEncoder().encode(str)
      let binary = ''
      for (const byte of bytes) binary += String.fromCodePoint(byte)
      return globalThis.btoa(binary)
    }
  } catch {}
  // Fallback for test env (Node)
  return Buffer.from(str, 'utf8').toString('base64')
}

function fromBase64Utf8(b64: string): string {
  try {
    if (typeof globalThis.atob === 'function') {
      const binary = globalThis.atob(b64)
      const bytes = new Uint8Array(binary.length)
      for (const [i, char] of [...binary].entries()) {
        bytes[i] = char.codePointAt(0) ?? 0
      }
      return new TextDecoder().decode(bytes)
    }
  } catch {}
  // Fallback for test env (Node)
  return Buffer.from(b64, 'base64').toString('utf8')
}

function executeB64(args: string[], env: SecretConsoleEnv) {
  if (args.length === 0) {
    usage(env)
    return
  }

  const flags = new Set(args.filter(a => a.startsWith('-')))
  const path = args.filter(a => !a.startsWith('-')).join(' ')

  if (!path) {
    usage(env)
    return
  }

  const isDecode = flags.has('-d')
  const isEncode = flags.has('-e')

  if ((isDecode && isEncode) || (!isDecode && !isEncode)) {
    usage(env)
    return
  }

  const content = env.read(path)
  if (content === undefined) {
    env.appendOutput(`b64: ${path}: No such file`)
    return
  }

  try {
    if (isDecode) {
      const trimmed = content.trim()
      const decoded = fromBase64Utf8(trimmed)
      env.appendOutput(decoded)
      return
    }

    const output = toBase64Utf8(content)
    env.appendOutput(output)
  } catch (err) {
    env.appendOutput(`b64: failed: ${err instanceof Error ? err.message : 'unknown error'}`)
  }
}

export const base64: SecretConsoleCommand = {
  usage: 'base64 (-d|-e) <path>',
  help: 'base64 — encode (-e) or decode (-d) a file\nusage: base64 (-d|-e) <path>',
  aliases: ['b64'],
  completion: { args: 'files', maxPositionalArgs: 2, flags: ['-d', '-e'] },
  execute: executeB64,
}
