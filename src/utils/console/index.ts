import type { SecretConsoleCommand } from '@/types/secret-console'
import { achievements } from './achievements'
import { cat } from './cat'
import { cd } from './cd'
import { clear } from './clear'
import { createCommandsCommand } from './commands'
import { confetti } from './confetti'
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
import { tree } from './tree'
import { uname } from './uname'
import { uptime } from './uptime'
import { wc } from './wc'

// Build Commands with a getter that allows help and commands to access the registry
export const Commands = (() => {
  const registry: Record<string, SecretConsoleCommand> = {
    ls,
    cd,
    clear,
    echo,
    pwd,
    cat,
    head,
    tail,
    tree,
    wc,
    date,
    uname,
    uptime,
    exit,
    nav,
    // Placeholder - will be replaced below
    commands: {} as SecretConsoleCommand,
    help: {} as SecretConsoleCommand,
    achievements,
    theme,
    confetti,
  }

  // Now create help and commands with access to the full registry
  registry.commands = createCommandsCommand(() => registry)
  registry.help = createHelpCommand(() => registry)

  return registry as Readonly<typeof registry>
})()
