import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function executeUname(args: string[], env: SecretConsoleEnv) {
  const showAll = args.includes('-a')

  const sysname = 'kil-web' // a playful system name
  const nodename = 'kil.dev'
  const release = 'v1'
  const version = new Date().toISOString()
  let machine = 'x86_64'

  let platform = 'web'
  let engine = 'web'
  if (typeof navigator !== 'undefined') {
    const nav: Navigator & { userAgentData?: { platform?: string } } = navigator
    platform = nav.userAgentData?.platform ?? nav.platform ?? 'web'
    const lowerPlat = platform.toLowerCase()
    machine = lowerPlat.includes('mac') ? 'aarch64' : 'x86_64'
    const ua = nav.userAgent ?? ''
    engine =
      ua.includes('Chrome') || ua.includes('Chromium')
        ? 'blink'
        : ua.includes('Safari')
          ? 'webkit'
          : ua.includes('Firefox')
            ? 'gecko'
            : 'web'
  }

  if (showAll) {
    env.appendOutput(`${sysname} ${nodename} ${release} ${version} ${machine} ${platform} ${engine}`)
    return
  }

  env.appendOutput(sysname)
}
export const uname: SecretConsoleCommand = {
  usage: 'uname [-a]',
  help: 'uname [-a] — show system information',
  completion: { args: 'none', flags: ['-a'] },
  execute: executeUname,
}
