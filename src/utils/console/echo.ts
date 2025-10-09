import type { SecretConsoleEnv } from '@/lib/secret-console-commands'

export function executeEcho(args: string[], env: SecretConsoleEnv) {
  env.appendOutput(args.join(' '))
}
