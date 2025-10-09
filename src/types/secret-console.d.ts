export type SecretConsoleEnv = {
  appendOutput: (text: string) => void
  pwd: () => string
  list: (path: string) => { name: string; isDir: boolean }[]
  read: (path: string) => string | undefined
  chdir: (path: string) => { ok: true } | { ok: false; reason: 'not_found' | 'not_dir' }
  requestClose: () => void
}

export type SecretConsoleCommand = {
  usage: string
  help: string
  execute: (args: string[], env: SecretConsoleEnv) => void
  aliases?: readonly string[]
}
