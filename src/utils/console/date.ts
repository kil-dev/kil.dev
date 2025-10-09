import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function executeDate(_args: string[], env: SecretConsoleEnv) {
  env.appendOutput(new Date().toString())
}

export const date: SecretConsoleCommand = {
  usage: 'date',
  help: 'date — current date/time',
  execute: executeDate,
}
