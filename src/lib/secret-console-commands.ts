import { Commands } from '@/utils/console'

export const SECRET_CONSOLE_COMMANDS = Commands

type SecretConsoleCommandName = keyof typeof SECRET_CONSOLE_COMMANDS

function isSecretConsoleCommandName(name: string): name is SecretConsoleCommandName {
  return Object.hasOwn(SECRET_CONSOLE_COMMANDS, name)
}

export function resolveSecretConsoleCommand(name: string): SecretConsoleCommandName | undefined {
  if (isSecretConsoleCommandName(name)) return name
  for (const [cmd, def] of Object.entries(SECRET_CONSOLE_COMMANDS)) {
    if (def.aliases?.includes(name)) return cmd
  }
  return undefined
}
