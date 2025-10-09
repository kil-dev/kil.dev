import type { SecretConsoleEnv } from '@/lib/secret-console-commands'

export function executeCat(args: string[], env: SecretConsoleEnv) {
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
