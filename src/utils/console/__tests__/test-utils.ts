import type { SecretConsoleEnv, VfsNode } from '@/types/secret-console'
import { vfsList, vfsRead, vfsResolve, vfsStat } from '@/utils/secret-console-vfs'

const mockVfs: VfsNode = {
  type: 'dir',
  children: {
    home: {
      type: 'dir',
      children: {
        'README.md': {
          type: 'file',
          content:
            'Welcome to kil.dev\nThis is a test file.\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10\nLine 11\nLine 12',
        },
        about: {
          type: 'dir',
          children: {
            'bio.txt': {
              type: 'file',
              content: 'Software engineer and web developer.',
            },
          },
        },
        projects: {
          type: 'dir',
          children: {
            'project1.md': {
              type: 'file',
              content: 'Project 1 description',
            },
            'project2.md': {
              type: 'file',
              content: 'Project 2 description',
            },
          },
        },
      },
    },
  },
}

export function createMockEnv(overrides?: Partial<SecretConsoleEnv>): {
  env: SecretConsoleEnv
  output: string[]
  getCloseRequested: () => boolean
} {
  const output: string[] = []
  const state = { closeRequested: false }
  let currentDir = '/home'

  const env: SecretConsoleEnv = {
    appendOutput: (text: string) => {
      output.push(text)
    },
    pwd: () => currentDir,
    list: (path: string) => {
      const absolutePath = path.startsWith('/') ? path : `${currentDir}/${path}`
      return vfsList(mockVfs, absolutePath)
    },
    read: (path: string) => {
      const absolutePath = path.startsWith('/') ? path : `${currentDir}/${path}`
      return vfsRead(mockVfs, absolutePath)
    },
    stat: (path: string) => {
      const absolutePath = path.startsWith('/') ? path : `${currentDir}/${path}`
      return vfsStat(mockVfs, absolutePath)
    },
    chdir: (path: string) => {
      const absolutePath = path.startsWith('/') ? path : `${currentDir}/${path}`
      const target = vfsResolve(mockVfs, absolutePath)

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
