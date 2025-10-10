import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function executeClear(_args: string[], env: SecretConsoleEnv) {
  env.clearOutput()
}

export const clear: SecretConsoleCommand = {
  usage: 'clear',
  help: 'clear — clear the terminal screen',
  completion: { args: 'none', maxPositionalArgs: 0 },
  aliases: ['cls'],
  execute: executeClear,
}
