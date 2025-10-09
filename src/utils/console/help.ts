import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

export function formatNoSuchCommand(name: string): string {
  return `help: ${name}: No such command`
}

// Resolve command name or alias to actual command name
function resolveCommand(name: string, commands: Record<string, SecretConsoleCommand>): string | undefined {
  // Check if it's a direct command name
  if (name in commands) return name

  // Check if it's an alias
  for (const [cmd, def] of Object.entries(commands)) {
    if (def.aliases?.includes(name)) return cmd
  }

  return undefined
}

// Factory function to create help command with access to the commands registry
export function createHelpCommand(
  getCommandsRegistry: () => Record<string, SecretConsoleCommand>,
): SecretConsoleCommand {
  function executeHelp(args: string[], env: SecretConsoleEnv) {
    const name = args[0]
    if (!name) {
      env.appendOutput(helpCommand.help)
      return
    }
    const Commands = getCommandsRegistry()
    const resolved = resolveCommand(name, Commands)
    if (!resolved) {
      env.appendOutput(formatNoSuchCommand(name))
      return
    }
    const command = Commands[resolved]
    if (!command) {
      env.appendOutput(formatNoSuchCommand(name))
      return
    }

    // Build output with aliases if present
    let output = `${resolved}: ${command.help}`
    if (command.aliases && command.aliases.length > 0) {
      const aliasesText = command.aliases.join(', ')
      output += `\nAliases: ${aliasesText}`
    }

    env.appendOutput(output)
  }

  const helpCommand: SecretConsoleCommand = {
    usage: 'help [command]',
    help: 'help [command] — show help for a command',
    completion: { args: 'commands', maxPositionalArgs: 1 },
    aliases: ['?'],
    execute: executeHelp,
  }

  return helpCommand
}
