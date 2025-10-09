import type { SecretConsoleCommand } from '@/types/secret-console'
import { cat } from './cat'
import { cd } from './cd'
import { commands } from './commands'
import { date } from './date'
import { echo } from './echo'
import { exit } from './exit'
import { head } from './head'
import { help } from './help'
import { ls } from './ls'
import { pwd } from './pwd'
import { tail } from './tail'
import { theme } from './theme'
import { uname } from './uname'
import { wc } from './wc'

export const Commands = {
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
  commands,
  help,
  theme,
} as const satisfies Record<string, SecretConsoleCommand>
