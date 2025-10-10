import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

type ConfettiType = 'default' | 'corners' | 'top' | 'center'

// Get available confetti subcommands for completion
export function getConfettiSubcommands(): string[] {
  return ['default', 'corners', 'top', 'center']
}

// Show available confetti types
function showAvailableTypes(env: SecretConsoleEnv) {
  env.appendOutput('Available confetti types:')
  env.appendOutput('  default  - Basic confetti burst from center-bottom')
  env.appendOutput('  corners  - Confetti from bottom left and right corners')
  env.appendOutput('  top      - Confetti falling from the top')
  env.appendOutput('  center   - 360° burst from center of screen')
}

function executeConfetti(args: string[], env: SecretConsoleEnv) {
  // Show available types if no arguments
  if (args.length === 0) {
    showAvailableTypes(env)
    return
  }

  const type = args[0] as ConfettiType
  const validTypes = getConfettiSubcommands()

  // Validate confetti type
  if (!validTypes.includes(type)) {
    env.appendOutput(`Invalid confetti type: ${type}`)
    showAvailableTypes(env)
    return
  }

  env.appendOutput(`Triggering ${type} confetti...`)

  // Dispatch custom event for client-side confetti trigger
  if (globalThis.window !== undefined && typeof globalThis.CustomEvent === 'function') {
    globalThis.window.dispatchEvent(
      new CustomEvent('kd:trigger-confetti', {
        detail: { type },
      }),
    )
  }
}

export const confetti: SecretConsoleCommand = {
  usage: 'confetti [type]',
  help: 'confetti [type] — trigger confetti animations (default, corners, top, center)',
  execute: executeConfetti,
  completion: {
    args: 'confetti-subcommands',
    maxPositionalArgs: 1,
  },
}
