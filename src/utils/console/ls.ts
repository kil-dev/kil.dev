import type { SecretConsoleEnv } from '@/lib/secret-console-commands'

export function executeLs(args: string[], env: SecretConsoleEnv) {
  const path = args[0] ?? env.pwd()
  const names = env.list(path).map(e => e.name)
  env.appendOutput(names.join('  '))
}
