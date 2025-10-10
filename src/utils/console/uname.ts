import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function executeUname(args: string[], env: SecretConsoleEnv) {
  const showAll = args.includes('-a')

  // Read from fake OS files in VFS (no fallbacks)
  const osReleaseContent = env.read('/etc/os-release') ?? ''
  const osReleaseMap = (() => {
    const map: Record<string, string> = {}
    for (const raw of osReleaseContent.split('\n')) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq)
      const rawVal = line.slice(eq + 1)
      const val = rawVal.startsWith('"') && rawVal.endsWith('"') ? rawVal.slice(1, -1) : rawVal
      map[key] = val
    }
    return map
  })()

  const sysname = osReleaseMap.NAME ?? ''
  const release = osReleaseMap.VERSION ?? ''
  const version = osReleaseMap.PRETTY_NAME ?? ''
  const nodename = (env.read('/etc/hostname') ?? '').trim()
  const machine = (() => {
    if (typeof navigator === 'undefined') return ''
    const nav: Navigator & { userAgentData?: { platform?: string } } = navigator
    const platform = nav.userAgentData?.platform ?? nav.platform ?? ''
    const p = platform.toLowerCase()
    return p.includes('mac') || p.includes('arm') ? 'aarch64' : 'x86_64'
  })()

  if (!sysname) return

  if (showAll) {
    env.appendOutput(`${sysname} ${nodename} ${release} ${version} ${machine}`)
    return
  }

  env.appendOutput(sysname)
}
export const uname: SecretConsoleCommand = {
  usage: 'uname [-a]',
  help: 'uname [-a] — show system information',
  completion: { args: 'none', flags: ['-a'], maxPositionalArgs: 0 },
  execute: executeUname,
}
