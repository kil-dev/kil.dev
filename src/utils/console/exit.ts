import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function executeExit(_args: string[], env: SecretConsoleEnv) {
  env.requestClose()
}

export const exit: SecretConsoleCommand = {
  usage: 'exit',
  help: 'exit — exit the shell',
  execute: executeExit,
}
