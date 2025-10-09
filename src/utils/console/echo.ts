import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function executeEcho(args: string[], env: SecretConsoleEnv) {
  env.appendOutput(args.join(' '))
}

export const echo: SecretConsoleCommand = {
  usage: 'echo [args…]',
  help: 'echo [args…] — print arguments',
  execute: executeEcho,
}
