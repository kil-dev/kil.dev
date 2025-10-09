import type { SecretConsoleCommand, SecretConsoleEnv } from '@/lib/secret-console-commands'

function executeDate(_args: string[], env: SecretConsoleEnv) {
  env.appendOutput(new Date().toString())
}

export const date: SecretConsoleCommand = {
  usage: 'date — current date/time',
  execute: executeDate,
}
