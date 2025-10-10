import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function executeLs(args: string[], env: SecretConsoleEnv) {
  const flags = args.filter(a => a.startsWith('-'))
  const pathArg = args.find(a => !a.startsWith('-')) ?? env.pwd()
  const showAll = flags.includes('-a')

  const names = env
    .list(pathArg)
    .map(e => e.name)
    .filter(name => (showAll ? true : !name.startsWith('.')))

  env.appendOutput(names.join('  '))
}

export const ls: SecretConsoleCommand = {
  usage: 'ls [-a] [path]',
  help: 'ls [-a] [path] — list files (hide dotfiles by default; use -a to show all)',
  completion: { args: 'paths', maxPositionalArgs: 2, flags: ['-a'] },
  execute: executeLs,
}
