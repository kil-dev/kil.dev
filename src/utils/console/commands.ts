import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'
import { Commands } from '@/utils/console'

function executeCommands(_args: string[], env: SecretConsoleEnv) {
  env.appendOutput(Object.keys(Commands).join('  '))
}

export const commands: SecretConsoleCommand = {
  usage: 'commands',
  execute: executeCommands,
}
