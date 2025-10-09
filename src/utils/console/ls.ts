import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function executeLs(args: string[], env: SecretConsoleEnv) {
  const path = args[0] ?? env.pwd()
  const names = env.list(path).map(e => e.name)
  env.appendOutput(names.join('  '))
}

export const ls: SecretConsoleCommand = {
  usage: 'ls [path]',
  help: 'ls [path] — list files in a path (default: current directory)',
  completion: { args: 'paths', maxPositionalArgs: 1 },
  execute: executeLs,
}
