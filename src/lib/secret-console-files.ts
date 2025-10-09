import type { VfsNode } from '@/utils/secret-console-vfs'

export const SECRET_CONSOLE_VFS: VfsNode = {
  type: 'dir',
  children: {
    home: {
      type: 'dir',
      children: {
        'readme.txt': {
          type: 'file',
          content: 'Welcome to the hidden console. Try `ls`, `cat /home/readme.txt`, or `exit`.\n',
        },
        docs: {
          type: 'dir',
          children: {
            'about.md': { type: 'file', content: '# About\nThis is a pretend file rendered in the console.\n' },
          },
        },
      },
    },
    etc: {
      type: 'dir',
      children: {
        'todo.txt': { type: 'file', content: '- explore\n- build\n- ship\n' },
      },
    },
  },
}
