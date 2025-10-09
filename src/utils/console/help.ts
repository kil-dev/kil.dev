import { resolveSecretConsoleCommand } from '@/lib/secret-console-commands'
import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'
import { Commands } from '@/utils/console'

function executeHelp(args: string[], env: SecretConsoleEnv) {
  const name = args[0]
  if (!name) {
    env.appendOutput('usage: help [command]')
    return
  }
  const resolved = resolveSecretConsoleCommand(name)
  if (!resolved) {
    env.appendOutput(`help: ${name}: No such command`)
    return
  }
  env.appendOutput(`${resolved}: ${Commands[resolved].usage}`)
}

export const help: SecretConsoleCommand = {
  usage: 'help [command]',
  execute: executeHelp,
}
