import { SECRET_CONSOLE_COMMANDS } from '@/lib/secret-console-commands'
import type { VfsNode } from '@/types/secret-console'

function makeBinaryFile(): VfsNode {
  return {
    type: 'file',
    content: '\u0000ELF\n',
    meta: { binary: true, executable: true },
  } as VfsNode
}

const binChildren: Record<string, VfsNode> = Object.fromEntries(
  Object.keys(SECRET_CONSOLE_COMMANDS).map(name => [name, makeBinaryFile()]),
)

export const SECRET_CONSOLE_VFS: VfsNode = {
  type: 'dir',
  children: {
    bin: {
      type: 'dir',
      children: binChildren,
    },
    etc: {
      type: 'dir',
      children: {
        hostname: { type: 'file', content: 'kil-dev\n' },
        hosts: {
          type: 'file',
          content: '127.0.0.1 localhost\n::1       localhost ip6-localhost ip6-loopback\n',
        },
        passwd: {
          type: 'file',
          content: 'root:x:0:0:root:/root:/bin/sh\nkil:x:1000:1000:Kilian:/home/kil:/bin/sh\n',
        },
        group: {
          type: 'file',
          content: 'root:x:0:\nusers:x:100:\nkil:x:1000:kil\n',
        },
        'os-release': {
          type: 'file',
          content: 'NAME="kilOS"\nVERSION="1.0"\nID=kilos\nPRETTY_NAME="kilOS 1.0 (secret)"\n',
        },
        'resolv.conf': {
          type: 'file',
          content: 'nameserver 1.1.1.1\nnameserver 8.8.8.8\n',
        },
        motd: {
          type: 'file',
          content: 'Welcome to the secret console. Type `commands` to see available commands.\n',
        },
        ssh: {
          type: 'dir',
          children: {
            sshd_config: {
              type: 'file',
              content:
                '# Simplified sshd_config (non-functional)\nPort 22\nPermitRootLogin no\nPasswordAuthentication no\n',
            },
          },
        },
      },
    },
    home: {
      type: 'dir',
      children: {
        kil: {
          type: 'dir',
          children: {
            '.bashrc': {
              type: 'file',
              content: 'export PS1="$ "\n' + 'alias ach="achievements"\n' + 'alias "?"="help"',
            },
            '.profile': {
              type: 'file',
              content: 'export LANG=en_US.UTF-8\n',
            },
            '.gitconfig': {
              type: 'file',
              content:
                '[user]\n' +
                '  name = Kilian\n' +
                '  email = kilian@kil.dev\n' +
                '[core]\n' +
                '  editor = cursor --wait',
            },
            '.ssh': {
              type: 'dir',
              children: {
                authorized_keys: {
                  type: 'file',
                  content: '# no real keys stored here\n',
                },
                known_hosts: { type: 'file', content: '' },
              },
            },
            Documents: {
              type: 'dir',
              children: {
                'resume.txt': {
                  type: 'file',
                  content:
                    'Kilian — Senior Site Reliability Engineer\n' +
                    'Skills: DevOps, Kubernetes, Terraform, CI/CD, Observability\n' +
                    'About: I build reliable, scalable platforms and smooth developer experiences for teams shipping to the cloud.\n' +
                    'Check out my website: https://kil.dev',
                },
                'ideas.md': {
                  type: 'file',
                  content: '# Ideas\n- New theme concept\n- Arcade mini-game improvements\n',
                },
              },
            },
            Downloads: { type: 'dir', children: {} },
            Pictures: {
              type: 'dir',
              children: {
                'headshot.webp': {
                  type: 'file',
                  content: '\u0000ELF\n',
                  meta: { binary: true, executable: false },
                },
              },
            },
            projects: {
              type: 'dir',
              children: {
                'kil.dev': {
                  type: 'dir',
                  children: {
                    'README.md': {
                      type: 'file',
                      content: '# kil.dev\nLocal notes for the personal site. See the real source for more.\n',
                    },
                  },
                },
              },
            },
            'notes.txt': {
              type: 'file',
              content: 'Todo:\n- Polish animations\n- Add more virtual files\n- Hide an easter egg\n',
            },
          },
        },
      },
    },
    tmp: { type: 'dir', children: {} },
    var: {
      type: 'dir',
      children: {
        log: {
          type: 'dir',
          children: {
            syslog: {
              type: 'file',
              content:
                'Oct  9 12:00:00 kil-dev kernel: [0.000000] Booting secret console\nOct  9 12:00:01 kil-dev systemd[1]: Started user session.\n',
            },
            'auth.log': {
              type: 'file',
              content: 'Oct  9 12:00:05 kil-dev sshd[123]: Server listening on 0.0.0.0 port 22.\n',
            },
            dmesg: {
              type: 'file',
              content: '[    0.00] Secret console initialized.\n',
            },
          },
        },
      },
    },
    usr: {
      type: 'dir',
      children: {
        bin: { type: 'dir', children: {} },
        lib: { type: 'dir', children: {} },
        share: { type: 'dir', children: {} },
      },
    },
    opt: { type: 'dir', children: { acme: { type: 'dir', children: {} } } },
    dev: {
      type: 'dir',
      children: {
        null: { type: 'file', content: '', meta: { binary: true, executable: false } },
        random: { type: 'file', content: '', meta: { binary: true, executable: false } },
        urandom: { type: 'file', content: '', meta: { binary: true, executable: false } },
      },
    },
    proc: {
      type: 'dir',
      children: {
        cpuinfo: {
          type: 'file',
          content: 'vendor_id\t: GenuineIntel\nmodel name\t: Secret CPU\n',
        },
        meminfo: {
          type: 'file',
          content: 'MemTotal:       16384 kB\nMemFree:        8192 kB\n',
        },
      },
    },
    sys: { type: 'dir', children: { kernel: { type: 'dir', children: {} }, devices: { type: 'dir', children: {} } } },
  },
}
