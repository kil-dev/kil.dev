import { COOKIE_KEYS } from '@/lib/storage-keys'
import { cookies } from 'next/headers'
import { TimeTurnerDialog } from './time-turner-dialog'

async function getCurrentYear() {
  'use cache'
  return new Date().getFullYear()
}

export async function FooterYear() {
  const year = await getCurrentYear()
  let initialIsDotcom = false
  try {
    const cookieStore = await cookies()
    const themeCookie = cookieStore.get(COOKIE_KEYS.THEME)?.value
    initialIsDotcom = themeCookie === 'dotcom'
  } catch {}
  return <TimeTurnerDialog year={year} initialIsDotcom={initialIsDotcom} />
}
