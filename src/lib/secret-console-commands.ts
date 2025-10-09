export type SecretConsoleEnv = {
  appendOutput: (text: string) => void
  pwd: () => string
  list: (path: string) => { name: string; isDir: boolean }[]
  read: (path: string) => string | undefined
  chdir: (path: string) => { ok: true } | { ok: false; reason: 'not_found' | 'not_dir' }
  requestClose: () => void
}

type SecretConsoleCommand = {
  usage: string
  execute: (args: string[], env: SecretConsoleEnv) => void
}

export const SECRET_CONSOLE_COMMANDS = {
  ls: {
    usage: 'list files in a path (default: current directory)',
    execute: executeLs,
  },
  cd: {
    usage: 'change directory (cd [path])',
    execute: executeCd,
  },
  pwd: {
    usage: 'print working directory',
    execute: executePwd,
  },
  cat: {
    usage: 'cat <path>',
    execute: executeCat,
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
    execute: executeHelp,
  },
} as const satisfies Record<string, SecretConsoleCommand>

type SecretConsoleCommandName = keyof typeof SECRET_CONSOLE_COMMANDS

export function isSecretConsoleCommandName(name: string): name is SecretConsoleCommandName {
  return name in SECRET_CONSOLE_COMMANDS
}

// Command implementations
function executeLs(args: string[], env: SecretConsoleEnv) {
  const path = args[0] ?? env.pwd()
  const names = env.list(path).map(e => e.name)
  env.appendOutput(names.join('  '))
}

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

function executeCd(args: string[], env: SecretConsoleEnv) {
  const raw = args[0] ?? '/home'
  const result = env.chdir(raw)
  if (!result.ok) {
    if (result.reason === 'not_dir') {
      env.appendOutput(`cd: ${raw}: Not a directory`)
    } else {
      env.appendOutput(`cd: ${raw}: No such directory`)
    }
  }
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
  if (!isSecretConsoleCommandName(name)) {
    env.appendOutput(`help: ${name}: No such command`)
    return
  }
  env.appendOutput(`${name}: ${SECRET_CONSOLE_COMMANDS[name].usage}`)
}

function executeCommands(_args: string[], env: SecretConsoleEnv) {
  env.appendOutput(Object.keys(SECRET_CONSOLE_COMMANDS).join('  '))
}

function executePwd(_args: string[], env: SecretConsoleEnv) {
  env.appendOutput(env.pwd())
}
