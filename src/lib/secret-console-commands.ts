export type SecretConsoleEnv = {
  appendOutput: (text: string) => void
  pwd: () => string
  list: (path: string) => { name: string; isDir: boolean }[]
  read: (path: string) => string | undefined
  chdir: (path: string) => { ok: true } | { ok: false; reason: 'not_found' | 'not_dir' }
  requestClose: () => void
}

import { Command } from '@/utils/console'

type SecretConsoleCommand = {
  usage: string
  execute: (args: string[], env: SecretConsoleEnv) => void
  aliases?: readonly string[]
}

export const SECRET_CONSOLE_COMMANDS = {
  ls: {
    usage: 'list files in a path (default: current directory)',
    execute: Command.ls,
  },
  cd: {
    usage: 'change directory (cd [path])',
    execute: Command.cd,
  },
  echo: {
    usage: 'echo [args…] — print arguments',
    execute: Command.echo,
  },
  pwd: {
    usage: 'print working directory',
    execute: Command.pwd,
  },
  cat: {
    usage: 'cat <path>',
    execute: Command.cat,
  },
  head: {
    usage: 'head [-n N] <path> — first N lines (default 10)',
    execute: Command.head,
  },
  tail: {
    usage: 'tail [-n N] <path> — last N lines (default 10)',
    execute: Command.tail,
  },
  wc: {
    usage: 'wc <path> — line, word, byte counts',
    execute: Command.wc,
  },
  date: {
    usage: 'date — current date/time',
    execute: Command.date,
  },
  uname: {
    usage: 'uname — system name',
    execute: Command.uname,
  },
  exit: {
    usage: 'exit',
    execute: executeExit,
  },
  commands: {
    usage: 'commands',
    execute: executeCommands,
  },
  help: {
    usage: 'help [command]',
    aliases: ['?'],
    execute: executeHelp,
  },
} as const satisfies Record<string, SecretConsoleCommand>

type SecretConsoleCommandName = keyof typeof SECRET_CONSOLE_COMMANDS

function isSecretConsoleCommandName(name: string): name is SecretConsoleCommandName {
  return name in SECRET_CONSOLE_COMMANDS
}

export function resolveSecretConsoleCommand(name: string): SecretConsoleCommandName | undefined {
  if (isSecretConsoleCommandName(name)) return name
  const entries = Object.entries(SECRET_CONSOLE_COMMANDS) as Array<[SecretConsoleCommandName, SecretConsoleCommand]>
  for (const [cmd, def] of entries) {
    if (def.aliases?.includes(name)) return cmd
  }
  return undefined
}

function executeExit(_args: string[], env: SecretConsoleEnv) {
  env.requestClose()
}

function executeHelp(args: string[], env: SecretConsoleEnv) {
  const name = args[0]
  if (!name) {
    env.appendOutput('usage: help [command]')
    return
  }
  const resolved = resolveSecretConsoleCommand(name)
  if (!resolved) {
    env.appendOutput(`help: ${name}: No such command`)
    return
  }
  env.appendOutput(`${resolved}: ${SECRET_CONSOLE_COMMANDS[resolved].usage}`)
}

function executeCommands(_args: string[], env: SecretConsoleEnv) {
  env.appendOutput(Object.keys(SECRET_CONSOLE_COMMANDS).join('  '))
}
