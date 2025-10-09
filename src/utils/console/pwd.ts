import type { SecretConsoleEnv } from '@/lib/secret-console-commands'

export function executePwd(_args: string[], env: SecretConsoleEnv) {
  env.appendOutput(env.pwd())
}
