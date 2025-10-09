import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

// Factory function to create commands command with access to the commands registry
export function createCommandsCommand(
  getCommandsRegistry: () => Record<string, SecretConsoleCommand>,
): SecretConsoleCommand {
  function executeCommands(_args: string[], env: SecretConsoleEnv) {
    const Commands = getCommandsRegistry()
    env.appendOutput(Object.keys(Commands).join('  '))
  }

  return {
    usage: 'commands',
    help: 'commands — list all commands',
    execute: executeCommands,
  }
}
