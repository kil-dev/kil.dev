import { TimeTurnerDialog } from './time-turner-dialog'

async function getCurrentYear() {
  'use cache'
  return new Date().getFullYear()
}

export async function FooterYear() {
  return <TimeTurnerDialog year={await getCurrentYear()} />
}
