import { resolveSecretConsoleCommand } from '@/lib/secret-console-commands'
import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'
import { Commands } from '@/utils/console'

function executeHelp(args: string[], env: SecretConsoleEnv) {
  const name = args[0]
  if (!name) {
    env.appendOutput(help.help)
    return
  }
  const resolved = resolveSecretConsoleCommand(name)
  if (!resolved) {
    env.appendOutput(`help: ${name}: No such command`)
    return
  }
  env.appendOutput(`${resolved}: ${Commands[resolved].help}`)
}

export const help: SecretConsoleCommand = {
  usage: 'help [command]',
  help: 'help [command] — show help for a command',
  execute: executeHelp,
}
