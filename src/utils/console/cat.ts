import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function executeCat(args: string[], env: SecretConsoleEnv) {
  const target = args.join(' ')
  if (!target) {
    env.appendOutput('usage: cat <path>')
    return
  }
  const content = env.read(target)
  if (content === undefined) {
    env.appendOutput(`cat: ${target}: No such file`)
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
