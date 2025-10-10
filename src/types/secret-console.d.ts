export type SecretConsoleEnv = {
  appendOutput: (text: string) => void
  clearOutput: () => void
  pwd: () => string
  list: (path: string) => { name: string; isDir: boolean }[]
  read: (path: string) => string | undefined
  stat: (path: string) => VfsStat | undefined
  chdir: (path: string) => { ok: true } | { ok: false; reason: 'not_found' | 'not_dir' }
  requestClose: () => void
}

export type SecretConsoleCommand = {
  usage: string
  help: string
  execute: (args: string[], env: SecretConsoleEnv) => void
  aliases?: readonly string[]
  completion?: {
    // What to complete for positional args (non-flag tokens)
    args:
      | 'none'
      | 'commands'
      | 'files'
      | 'folders'
      | 'paths'
      | 'themes'
      | 'pages'
      | 'achievement-subcommands'
      | 'confetti-subcommands'
    // Supported flags for this command (e.g. ['-a','-n'])
    flags?: readonly string[]
    // Maximum number of positional arguments this command accepts.
    // If omitted, positional arguments are considered unlimited.
    maxPositionalArgs?: number
  }
}

export type VfsFileNode = {
  type: 'file'
  content: string | (() => string)
  meta?: {
    binary?: boolean
    executable?: boolean
  }
}

export type VfsDirNode = { type: 'dir'; children: Record<string, VfsNode> | (() => Record<string, VfsNode>) }

export type VfsNode = VfsDirNode | VfsFileNode

export type VfsStat = {
  kind: 'file' | 'dir'
  binary: boolean
  executable: boolean
  size: number
}
