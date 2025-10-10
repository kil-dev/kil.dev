import { SECRET_CONSOLE_VFS } from '@/lib/secret-console-files'
import type { SecretConsoleEnv } from '@/types/secret-console'
import { normalizePath, vfsList, vfsRead, vfsResolve, vfsStat } from '@/utils/secret-console-vfs'

export function createMockEnv(overrides?: Partial<SecretConsoleEnv>): {
  env: SecretConsoleEnv
  output: string[]
  getCloseRequested: () => boolean
} {
  const output: string[] = []
  const state = { closeRequested: false }
  let currentDir = '/home/kil'

  const resolvePath = (localPath: string): string => {
    return normalizePath(
      localPath.startsWith('/') || localPath.startsWith('~') ? localPath : `${currentDir}/${localPath}`,
    )
  }

  const env: SecretConsoleEnv = {
    appendOutput: (text: string) => {
      output.push(text)
    },
    clearOutput: () => {
      output.length = 0
    },
    pwd: () => currentDir,
    list: (path: string) => {
      const absolutePath = resolvePath(path)
      return vfsList(SECRET_CONSOLE_VFS, absolutePath)
    },
    read: (path: string) => {
      const absolutePath = resolvePath(path)
      return vfsRead(SECRET_CONSOLE_VFS, absolutePath)
    },
    stat: (path: string) => {
      const absolutePath = resolvePath(path)
      return vfsStat(SECRET_CONSOLE_VFS, absolutePath)
    },
    chdir: (path: string) => {
      const absolutePath = resolvePath(path)
      const target = vfsResolve(SECRET_CONSOLE_VFS, absolutePath)

      if (target === undefined) {
        return { ok: false, reason: 'not_found' }
      }

      if (target.type !== 'dir') {
        return { ok: false, reason: 'not_dir' }
      }

      currentDir = absolutePath
      return { ok: true }
    },
    requestClose: () => {
      state.closeRequested = true
    },
    ...overrides,
  }

  return { env, output, getCloseRequested: () => state.closeRequested }
}
