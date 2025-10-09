import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

export function formatCatNoSuchFile(path: string): string {
  return `cat: ${path}: No such file`
}

function executeCat(args: string[], env: SecretConsoleEnv) {
  const target = args.join(' ')
  if (!target) {
    env.appendOutput(`usage: ${cat.usage}`)
    return
  }
  const content = env.read(target)
  if (content === undefined) {
    env.appendOutput(formatCatNoSuchFile(target))
    return
  }
  env.appendOutput(content)
}

export const cat: SecretConsoleCommand = {
  usage: 'cat <path>',
  help: 'cat <path> — print the contents of a file',
  completion: { args: 'files' },
  execute: executeCat,
}
