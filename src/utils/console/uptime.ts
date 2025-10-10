import type { SecretConsoleCommand, SecretConsoleEnv } from '@/types/secret-console'

function formatUptime(uptimeMs: number): string {
  const uptimeSeconds = Math.floor(uptimeMs / 1000)
  const days = Math.floor(uptimeSeconds / 86400)
  const hours = Math.floor((uptimeSeconds % 86400) / 3600)
  const minutes = Math.floor((uptimeSeconds % 3600) / 60)
  const seconds = uptimeSeconds % 60

  const parts: string[] = []

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'day' : 'days'}`)
  }
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`)
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`)
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`)
  }

  return parts.join(', ')
}

function parseLoadAvg(loadavgContent: string): string[] {
  // Parse the first three values from loadavg (e.g. "0.42 1.33 7.77 1/314 31337")
  const parts = loadavgContent.trim().split(/\s+/)
  return parts.slice(0, 3)
}

function executeUptime(_args: string[], env: SecretConsoleEnv) {
  // Calculate real uptime since page load
  const uptimeMs = Date.now() - performance.timeOrigin
  const uptimeFormatted = formatUptime(uptimeMs)

  // Read fake load averages from /proc/loadavg
  const loadavgContent = env.read('/proc/loadavg')
  let loadavgFormatted = '0.00, 0.00, 0.00'

  if (loadavgContent) {
    const loadavgValues = parseLoadAvg(loadavgContent)
    if (loadavgValues.length >= 3) {
      loadavgFormatted = loadavgValues.join(', ')
    }
  }

  env.appendOutput(`up ${uptimeFormatted}, load average: ${loadavgFormatted}`)
}

export const uptime: SecretConsoleCommand = {
  usage: 'uptime',
  help: 'uptime — show how long the system has been running',
  completion: { args: 'none', maxPositionalArgs: 0 },
  execute: executeUptime,
}
