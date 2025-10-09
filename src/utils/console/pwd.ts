import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function executePwd(_args: string[], env: SecretConsoleEnv) {
  env.appendOutput(env.pwd())
}

export const pwd: SecretConsoleCommand = {
  usage: 'print working directory',
  execute: executePwd,
}
