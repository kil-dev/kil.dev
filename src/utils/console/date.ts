import type { SecretConsoleEnv } from '@/lib/secret-console-commands'

export function executeDate(_args: string[], env: SecretConsoleEnv) {
  env.appendOutput(new Date().toString())
}
