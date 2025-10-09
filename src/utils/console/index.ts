import type { SecretConsoleCommand } from '@/types/secret-console'
import { cat } from './cat'
import { cd } from './cd'
import { createCommandsCommand } from './commands'
import { date } from './date'
import { echo } from './echo'
import { exit } from './exit'
import { head } from './head'
import { createHelpCommand } from './help'
import { ls } from './ls'
import { nav } from './nav'
import { pwd } from './pwd'
import { tail } from './tail'
import { theme } from './theme'
import { uname } from './uname'
import { wc } from './wc'

// Build Commands with a getter that allows help and commands to access the registry
export const Commands = (() => {
  const registry: Record<string, SecretConsoleCommand> = {
    ls,
    cd,
    echo,
    pwd,
    cat,
    head,
    tail,
    wc,
    date,
    uname,
    exit,
    nav,
    // Placeholder - will be replaced below
    commands: {} as SecretConsoleCommand,
    help: {} as SecretConsoleCommand,
    theme,
  }

  // Now create help and commands with access to the full registry
  registry.commands = createCommandsCommand(() => registry)
  registry.help = createHelpCommand(() => registry)

  return registry as Readonly<typeof registry>
})()
