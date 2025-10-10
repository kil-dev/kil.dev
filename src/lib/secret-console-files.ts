import type { VfsNode } from '@/types/secret-console'
import {
  binChildren,
  getAchievementProgressContent,
  getThemeCacheContent,
  getUnlockedAchievementFiles,
} from '@/utils/secret-console-vfs'

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
        fstab: {
          type: 'file',
          content:
            '# /etc/fstab: static file system information\n' +
            '# <file system> <mount point> <type> <options> <dump> <pass>\n' +
            '/dev/sda1 / ext4 defaults 0 1\n' +
            '/dev/sda2 /home ext4 defaults 0 2\n' +
            'tmpfs /tmp tmpfs defaults 0 0\n',
        },
        environment: {
          type: 'file',
          content: 'PATH="/usr/bin:/bin"\n' + 'EDITOR="cursor"\n' + 'LANG="en_US.UTF-8"\n',
        },
        profile: {
          type: 'file',
          content:
            '# /etc/profile: system-wide .profile file\n' +
            'export PATH="/usr/local/bin:/usr/bin:/bin"\n' +
            'export EDITOR="cursor"\n' +
            '# Set PS1 for interactive shells\n' +
            'if [ "$PS1" ]; then\n' +
            '  PS1="\\w $ "\n' +
            'fi\n',
        },
        shells: {
          type: 'file',
          content:
            '# /etc/shells: valid login shells\n' +
            '/bin/sh\n' +
            '/bin/bash\n' +
            '/bin/zsh\n' +
            '/bin/fish\n' +
            '/usr/bin/fish\n',
        },
        crontab: {
          type: 'file',
          content:
            '# /etc/crontab: system-wide crontab\n' +
            'SHELL=/bin/sh\n' +
            'PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n\n' +
            '# m h dom mon dow user command\n' +
            '0 * * * * root check-achievement-progress\n' +
            '*/5 * * * * root sync-themes\n' +
            '0 0 * * * root cleanup-temp-files\n' +
            '# Easter egg: check for konami codes\n' +
            '*/10 * * * * kil easter-egg-scanner\n',
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
              content:
                'export PS1="\\w $ "\n' + 'alias ach="achievements"\n' + 'alias "?"="help"\n' + 'alias b64="base64"\n',
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
            '.secrets': {
              type: 'dir',
              children: {
                'konami.txt': {
                  type: 'file',
                  content:
                    'The Konami Code is a classic.\n' +
                    'Up, Up, Down, Down, Left, Right, Left, Right, B, A\n\n' +
                    'Try it on the main page...\n',
                },
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
                'bookmarks.md': {
                  type: 'file',
                  content:
                    '# Technical Bookmarks\n\n' +
                    'A curated collection of useful resources.\n\n' +
                    '## Kubernetes & Cloud Native\n' +
                    '- [Kubernetes Documentation](https://kubernetes.io/docs/)\n' +
                    '- [CNCF Landscape](https://landscape.cncf.io/)\n' +
                    '- [FluxCD Docs](https://fluxcd.io/docs/)\n' +
                    '- [Talos Linux](https://www.talos.dev/)\n\n' +
                    '## DevOps & SRE\n' +
                    '- [SRE Books (Google)](https://sre.google/books/)\n' +
                    '- [The Twelve-Factor App](https://12factor.net/)\n' +
                    '- [DevOps Roadmap](https://roadmap.sh/devops)\n\n' +
                    '## Development\n' +
                    '- [Next.js Docs](https://nextjs.org/docs)\n' +
                    '- [shadcn/ui](https://ui.shadcn.com/)\n' +
                    '- [TypeScript Handbook](https://www.typescriptlang.org/docs/)\n\n' +
                    '## Tools\n' +
                    '- [Excalidraw](https://excalidraw.com/) - Diagrams\n' +
                    '- [regex101](https://regex101.com/) - Regex testing\n' +
                    '- [Crontab Guru](https://crontab.guru/) - Cron scheduler\n\n' +
                    '## Inspiration\n' +
                    '- Keep exploring!\n' +
                    '- Build cool things\n' +
                    '- Share knowledge\n',
                },
                'learning-notes.md': {
                  type: 'file',
                  content:
                    '# Learning Notes\n\n' +
                    '## Current Focus\n' +
                    '- Advanced React patterns\n' +
                    '- Kubernetes operators\n' +
                    '- Platform engineering best practices\n\n' +
                    '## React Server Components\n' +
                    '- RSC enables server-side rendering without client JS\n' +
                    "- Use 'use client' sparingly\n" +
                    '- Async components are powerful for data fetching\n' +
                    '- Great for performance optimization\n\n' +
                    '## Kubernetes Deep Dive\n' +
                    '- Custom Resource Definitions (CRDs)\n' +
                    '- Operator pattern for automation\n' +
                    '- Network policies for security\n' +
                    '- GitOps with FluxCD makes life easier\n\n' +
                    '## Platform Engineering\n' +
                    '- Developer experience is key\n' +
                    '- Self-service infrastructure\n' +
                    '- Observability from day one\n' +
                    '- Documentation is not optional\n\n' +
                    '## Random Thoughts\n' +
                    '- Easter eggs make websites more fun\n' +
                    '- Achievement systems increase engagement\n' +
                    '- Dark mode is not optional anymore\n' +
                    '- Testing in production (carefully!)\n\n' +
                    '## TODO\n' +
                    '- Finish Questnest\n' +
                    '- Update dotfiles wiki',
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
                      content:
                        '# kil.dev\n\n' +
                        "My personal portfolio website. You're looking at it right now!\n\n" +
                        '## Description\n' +
                        'This site. Next.js, Tailwind, shadcn/ui, deployed on Vercel.\n\n' +
                        '## Tech Stack\n' +
                        '- Next.js 15\n' +
                        '- TypeScript\n' +
                        '- Tailwind CSS\n' +
                        '- shadcn/ui\n' +
                        '- React\n' +
                        '- Vercel\n\n' +
                        '## Links\n' +
                        '- Live: https://kil.dev\n' +
                        '- Repo: https://github.com/kiliantyler/kil.dev\n\n' +
                        '## Features\n' +
                        '- Secret console (you found it!)\n' +
                        '- Achievement system\n' +
                        '- Multiple themes\n' +
                        '- Easter eggs hidden throughout\n',
                    },
                  },
                },
                tiaxslaughter: {
                  type: 'dir',
                  children: {
                    'README.md': {
                      type: 'file',
                      content:
                        '# tiaxslaughter\n\n' +
                        'A photography portfolio website for my sister.\n\n' +
                        '## Description\n' +
                        'A clean, modern photography portfolio showcasing professional work.\n' +
                        'Features a responsive gallery with optimized image loading.\n\n' +
                        '## Tech Stack\n' +
                        '- Next.js\n' +
                        '- TypeScript\n' +
                        '- Tailwind CSS\n' +
                        '- shadcn/ui\n' +
                        '- React\n' +
                        '- Vercel\n\n' +
                        '## Links\n' +
                        '- Live: https://tiaxslaughter.com\n\n' +
                        'Status: Live (2025)\n',
                    },
                  },
                },
                dotfiles: {
                  type: 'dir',
                  children: {
                    'README.md': {
                      type: 'file',
                      content:
                        '# dotfiles.wiki\n\n' +
                        'Dotfiles and a wiki for my macOS setup. Hosted on GitHub Pages.\n\n' +
                        '## Description\n' +
                        'My personal macOS configuration files and documentation.\n' +
                        'Includes setup scripts, app configs, and a comprehensive wiki\n' +
                        'explaining my development environment.\n\n' +
                        '## Tech Stack\n' +
                        '- Astro\n' +
                        '- TypeScript\n' +
                        '- Markdown\n' +
                        '- GitHub Pages\n\n' +
                        '## Features\n' +
                        '- Automated dotfile management\n' +
                        '- macOS configuration documentation\n' +
                        '- Development environment setup guides\n' +
                        '- Tool recommendations and workflows\n\n' +
                        '## Links\n' +
                        '- Live: https://dotfiles.wiki\n' +
                        '- Repo: https://github.com/kiliantyler/dotfiles\n\n' +
                        'Status: Work in Progress (2023)\n',
                    },
                  },
                },
                'home-k8s': {
                  type: 'dir',
                  children: {
                    'README.md': {
                      type: 'file',
                      content:
                        '# Home Kubernetes Cluster\n\n' +
                        'A Kubernetes cluster for my home. Large server rack in my basement.\n\n' +
                        '## Description\n' +
                        'Self-hosted Kubernetes cluster running on bare metal hardware.\n' +
                        'GitOps-based infrastructure management using FluxCD.\n' +
                        'Complete home lab setup for learning and experimentation.\n\n' +
                        '## Tech Stack\n' +
                        '- Kubernetes\n' +
                        '- FluxCD (GitOps)\n' +
                        '- Talos Linux\n' +
                        '- 1Password (secrets management)\n\n' +
                        '## Infrastructure\n' +
                        '- Multiple bare metal nodes\n' +
                        '- High availability control plane\n' +
                        '- Automated certificate management\n' +
                        '- Network policies and security hardening\n' +
                        '- Monitoring and observability stack\n\n' +
                        '## Links\n' +
                        '- Repo: https://github.com/shamubernetes/home-k8s\n\n' +
                        'Status: Live (since 2021)\n\n' +
                        '# Fun fact: This powers all my home services!\n',
                    },
                  },
                },
                questnest: {
                  type: 'dir',
                  children: {
                    'README.md': {
                      type: 'file',
                      content:
                        '# Questnest\n\n' +
                        'A web app for managing chores through gamification. Very WIP.\n\n' +
                        '## Description\n' +
                        'Turn household chores into quests! A gamified task management\n' +
                        'system that makes chores more engaging through RPG-like mechanics.\n\n' +
                        '## Tech Stack\n' +
                        '- Next.js\n' +
                        '- TypeScript\n' +
                        '- Tailwind CSS\n' +
                        '- shadcn/ui\n' +
                        '- Drizzle ORM\n' +
                        '- React\n' +
                        '- Vercel\n\n' +
                        '## Planned Features\n' +
                        '- Quest-based task system\n' +
                        '- XP and leveling mechanics\n' +
                        '- Reward system\n' +
                        '- Family/household management\n' +
                        '- Achievement tracking\n\n' +
                        'Status: Work in Progress (2025)\n\n' +
                        '// TODO: Actually finish this project\n',
                    },
                  },
                },
              },
            },
            'notes.txt': {
              type: 'file',
              content:
                'Something feels off lately... little glitches here and there.\n' +
                'If this keeps up, check the system logs — /var/log/syslog — for anything unusual.\n',
            },
          },
        },
      },
    },
    tmp: {
      type: 'dir',
      children: {
        '.burrow': {
          type: 'dir',
          children: {
            'trail.b64': {
              type: 'file',
              content:
                'Q3VyaW91c2VyIGFuZCBjdXJpb3VzZXIuLi4KCnVuaGV4IC92YXIvbGliL2xvb2tpbmctZ2xhc3MvcG9ja2V0d2F0Y2guaGV4Cg==',
            },
          },
        },
      },
    },
    var: {
      type: 'dir',
      children: {
        log: {
          type: 'dir',
          children: {
            syslog: {
              type: 'file',
              content:
                'Oct 10 04:20:00 kil-dev kernel: [0.000000] Booting secret console\n' +
                'Oct 10 04:20:01 kil-dev systemd[1]: Started user session.\n' +
                'Oct 10 04:20:02 kil-dev achievement-tracker[42]: Monitoring for easter eggs\n' +
                'Oct 10 04:20:03 kil-dev theme-manager[99]: Loaded 9 themes\n' +
                'Oct 10 04:20:07 kil-dev audit[451]: white_rabbit: hidden warren created at /tmp/.burrow\n',
            },
            'auth.log': {
              type: 'file',
              content:
                'Oct 10 04:20:05 kil-dev sshd[123]: Server listening on 0.0.0.0 port 22.\n' +
                'Oct 10 04:20:06 kil-dev sshd[123]: Accepted publickey for kil from 127.0.0.1\n',
            },
            dmesg: {
              type: 'file',
              content:
                '[    0.00] Secret console initialized.\n' +
                '[    0.42] Achievement system ready.\n' +
                '[    1.33] Theme engine loaded.\n' +
                '[    4.20] Easter eggs planted.\n',
            },
            'achievement.log': {
              type: 'file',
              content:
                'Oct 10 04:20:10 Achievement unlocked: Console Commander\n' +
                'Oct 10 04:21:33 Achievement progress: Theme Tapdance (5/7)\n' +
                'Oct 10 04:22:00 Easter egg discovered: Konami Code\n',
            },
          },
        },
        cache: {
          type: 'dir',
          children: {
            themes: {
              type: 'dir',
              children: {
                'theme-cache.json': {
                  type: 'file',
                  content: getThemeCacheContent,
                },
              },
            },
            achievements: { type: 'dir', children: getUnlockedAchievementFiles },
          },
        },
        lib: {
          type: 'dir',
          children: {
            'looking-glass': {
              type: 'dir',
              children: {
                'pocketwatch.hex': {
                  type: 'file',
                  content:
                    '49 74 27 73 20 6e 6f 20 75 73 65 20 67 6f 69 6e 67 20 62 61 63 6b 20 74 6f 20 79 65 73 74 65 72 64 61 79 2c 20 62 65 63 61 75 73 65 20 49 20 77 61 73 20 61 20 64 69 66 66 65 72 65 6e 74 20 70 65 72 73 6f 6e 20 74 68 65 6e 2e 0a 54 6f 20 77 61 6b 65 20 75 70 2c 20 73 65 74 20 79 6f 75 72 20 74 68 65 6d 65 20 74 6f 20 6d 61 74 72 69 78\n',
                },
              },
            },
            secrets: {
              type: 'dir',
              children: {
                'easter-eggs.db': {
                  type: 'file',
                  content: '# Easter egg database (binary)\n',
                  meta: { binary: true, executable: false },
                },
              },
            },
            achievements: {
              type: 'dir',
              children: {
                'progress.json': {
                  type: 'file',
                  content: getAchievementProgressContent,
                },
              },
            },
          },
        },
        tmp: {
          type: 'dir',
          children: {
            'session-12345.tmp': {
              type: 'file',
              content: 'User session data (temporary)\n',
            },
            'theme-preview.cache': {
              type: 'file',
              content: 'Cached theme preview data\n',
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
          content:
            'processor\t: 0\n' +
            'vendor_id\t: GenuineIntel\n' +
            'model name\t: Secret CPU @ 4.20GHz\n' +
            'cpu MHz\t\t: 4200.000\n' +
            'cache size\t: 16384 KB\n' +
            'flags\t\t: fpu vme de easter_egg achievement_unlock konami\n',
        },
        meminfo: {
          type: 'file',
          content:
            'MemTotal:       16777216 kB\n' +
            'MemFree:         8388608 kB\n' +
            'MemAvailable:   12582912 kB\n' +
            'Buffers:          524288 kB\n' +
            'Cached:          3145728 kB\n' +
            'SwapTotal:       4194304 kB\n' +
            'SwapFree:        4194304 kB\n',
        },
        uptime: {
          type: 'file',
          content: '1337.42 13337.00\n',
        },
        version: {
          type: 'file',
          content:
            'kilOS version 1.0.0-secret (kilian@kil-dev) (cursor 0.42.0) #1 SMP PREEMPT_DYNAMIC Thu Oct 10 04:20:00 UTC 2025\n',
        },
        loadavg: {
          type: 'file',
          content: '0.42 1.33 7.77 1/314 31337\n',
        },
        cmdline: {
          type: 'file',
          content:
            'BOOT_IMAGE=/vmlinuz root=/dev/sda1 ro quiet splash easter_eggs=enabled achievements=true themes=all\n',
        },
      },
    },
    sys: { type: 'dir', children: { kernel: { type: 'dir', children: {} }, devices: { type: 'dir', children: {} } } },
  },
}
