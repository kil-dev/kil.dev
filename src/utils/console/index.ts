import { executeCat } from './cat'
import { executeCd } from './cd'
import { executeDate } from './date'
import { executeEcho } from './echo'
import { executeHead } from './head'
import { executeLs } from './ls'
import { executePwd } from './pwd'
import { executeTail } from './tail'
import { executeUname } from './uname'
import { executeWc } from './wc'

export const Command = {
  ls: executeLs,
  cd: executeCd,
  echo: executeEcho,
  pwd: executePwd,
  cat: executeCat,
  head: executeHead,
  tail: executeTail,
  wc: executeWc,
  date: executeDate,
  uname: executeUname,
}
