import type { SecretConsoleCommand } from '@/types/secret-console'
import { Commands } from '@/utils/console'

export const SECRET_CONSOLE_COMMANDS = Commands

type SecretConsoleCommandName = keyof typeof SECRET_CONSOLE_COMMANDS

function isSecretConsoleCommandName(name: string): name is SecretConsoleCommandName {
  return name in SECRET_CONSOLE_COMMANDS
}

export function resolveSecretConsoleCommand(name: string): SecretConsoleCommandName | undefined {
  if (isSecretConsoleCommandName(name)) return name
  const entries = Object.entries(SECRET_CONSOLE_COMMANDS) as Array<[SecretConsoleCommandName, SecretConsoleCommand]>
  for (const [cmd, def] of entries) {
    if (def.aliases?.includes(name)) return cmd
  }
  return undefined
}
