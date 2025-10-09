import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

export function formatCdNotDirectory(path: string): string {
  return `cd: ${path}: Not a directory`
}

export function formatCdNoSuchDirectory(path: string): string {
  return `cd: ${path}: No such directory`
}

function executeCd(args: string[], env: SecretConsoleEnv) {
  const raw = args[0] ?? '/home'
  const result = env.chdir(raw)
  if (!result.ok) {
    if (result.reason === 'not_dir') env.appendOutput(formatCdNotDirectory(raw))
    else env.appendOutput(formatCdNoSuchDirectory(raw))
  }
}

export const cd: SecretConsoleCommand = {
  usage: 'cd [path]',
  help: 'cd [path] — change directory',
  completion: { args: 'folders' },
  execute: executeCd,
}
