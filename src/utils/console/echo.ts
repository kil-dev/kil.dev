import type { SecretConsoleCommand, SecretConsoleEnv } from '@/lib/secret-console-commands'

function executeEcho(args: string[], env: SecretConsoleEnv) {
  env.appendOutput(args.join(' '))
}

export const echo: SecretConsoleCommand = {
  usage: 'echo [args…] — print arguments',
  execute: executeEcho,
}
