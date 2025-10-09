import type { SecretConsoleCommand, SecretConsoleEnv } from '@/lib/secret-console-commands'

function executeCd(args: string[], env: SecretConsoleEnv) {
  const raw = args[0] ?? '/home'
  const result = env.chdir(raw)
  if (!result.ok) {
    if (result.reason === 'not_dir') env.appendOutput(`cd: ${raw}: Not a directory`)
    else env.appendOutput(`cd: ${raw}: No such directory`)
  }
}

export const cd: SecretConsoleCommand = {
  usage: 'change directory (cd [path])',
  execute: executeCd,
}
