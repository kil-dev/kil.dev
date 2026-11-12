'use client'

import { CritterBody } from '@/components/layout/background/slime-critters'
import { Button } from '@/components/ui/button'
import { useThemeTransition } from '@/components/ui/theme-toggle'
import { useActivePath } from '@/hooks/use-active-path'
import { useIsClient } from '@/hooks/use-is-client'
import { usePresenceGates } from '@/hooks/use-presence-gates'
import { NAVIGATION } from '@/lib/navmenu'
import type { NavigationItem } from '@/types/navigation-item'
import { cn } from '@/utils/utils'
import { injectCircleBlurTransitionStyles } from '@/utils/view-transition'
import { MenuIcon, PawPrint, Trophy } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const ACHIEVEMENTS: NavigationItem = { label: 'Achievements', href: '/achievements' as Route, icon: Trophy }
const PET_GALLERY: NavigationItem = { label: 'Pet Gallery', href: '/pet-gallery' as Route, icon: PawPrint }

/**
 * The menu below the nav breakpoint: a critter in the header slime opens a sheet of the same
 * slime that stretches down out of the header. On a phone the header's theme and social buttons
 * sit in the sheet's first row (see `.header-actions`).
 */
export function MobileNav() {
  const pathname = usePathname()
  const activePath = useActivePath()
  const router = useRouter()
  const { startTransition } = useThemeTransition()
  const isClient = useIsClient()
  const { allowAchievements, allowPetGallery } = usePresenceGates()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const openedWithKeyboard = useRef(false)

  // A gated page stays listed while it is the page being viewed
  const items = [
    ...NAVIGATION,
    ...(isClient && (allowAchievements || pathname === '/achievements') ? [ACHIEVEMENTS] : []),
    ...(isClient && (allowPetGallery || pathname === '/pet-gallery') ? [PET_GALLERY] : []),
  ]

  useEffect(() => {
    if (!open) return
    if (openedWithKeyboard.current) listRef.current?.querySelector('a')?.focus()

    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'

    const close = () => setOpen(false)
    const onKeyDown = (event: KeyboardEvent) => {
      // Escape closes the theme menu first when that is open on top of this one
      if (event.key !== 'Escape' || document.querySelector('#theme-options[aria-hidden="false"]')) return
      close()
      triggerRef.current?.focus()
    }
    // The menu does not exist on a wide window, so it cannot stay open (and scroll-locked) there
    const wide = globalThis.matchMedia('(min-width: 1240px)')
    globalThis.addEventListener('keydown', onKeyDown)
    wide.addEventListener('change', close)
    return () => {
      root.style.overflow = previousOverflow
      globalThis.removeEventListener('keydown', onKeyDown)
      wide.removeEventListener('change', close)
    }
  }, [open])

  function handleListKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const links = Array.from(event.currentTarget.querySelectorAll('a'))
    const next = links.indexOf(document.activeElement as HTMLAnchorElement) + step
    links[Math.max(0, Math.min(links.length - 1, next))]?.focus()
  }

  function handleSelect(event: React.MouseEvent<HTMLAnchorElement>, href: Route) {
    setOpen(false)
    // A section of the page already open: the link scrolls there by itself
    if (pathname === '/' && (href === '/' || href.startsWith('/#'))) return
    event.preventDefault()
    const button = triggerRef.current?.getBoundingClientRect()
    if (button) {
      injectCircleBlurTransitionStyles(
        ((button.left + button.width / 2) / globalThis.innerWidth) * 100,
        ((button.top + button.height / 2) / globalThis.innerHeight) * 100,
        'nav-transition',
      )
    }
    startTransition(() => router.push(href))
  }

  return (
    <div className="nav:hidden">
      <Button
        ref={triggerRef}
        id="mobile-nav-trigger"
        variant="onPrimary"
        size="icon"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="size-10"
        onClick={event => {
          // A click with no pointer behind it came from Enter or Space
          openedWithKeyboard.current = event.detail === 0
          setOpen(previous => !previous)
        }}
        onKeyDown={event => {
          if (event.key !== 'ArrowDown') return
          event.preventDefault()
          openedWithKeyboard.current = true
          setOpen(true)
        }}>
        {/* A face in the header slime: two bars for a mouth, which opens when the menu does */}
        <span className="mobile-nav-critter block origin-[50%_72%] scale-150">
          <CritterBody className="size-9" blinkDelay="-2.3s">
            <g className="text-primary-foreground" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
              <path className="mobile-nav-bar" d="M36 63h28" />
              <path className="mobile-nav-bar" d="M36 73h28" />
              <ellipse className="mobile-nav-mouth" cx="50" cy="68" rx="9" ry="7" fill="currentColor" stroke="none" />
            </g>
          </CritterBody>
        </span>
        {/* Windows 98 has no critters */}
        <MenuIcon className="mobile-nav-plain size-5" aria-hidden />
      </Button>

      <div className={cn('mobile-nav-sheet', open && 'is-open')} inert={!open}>
        <div className="mobile-nav-goo">
          <ul
            ref={listRef}
            id="mobile-nav"
            role="menu"
            aria-label="Mobile navigation"
            onKeyDown={handleListKeyDown}
            className="grid max-h-[calc(100dvh-var(--frame-top)-2rem)] grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-1 overflow-y-auto px-3 pt-2 pb-3 max-sm:pt-13 sm:px-6 [@media(max-width:639px)_and_(min-height:501px)]:grid-cols-1">
            {items.map(item => (
              <li key={item.href} role="none">
                <Link
                  role="menuitem"
                  href={item.href}
                  aria-current={item.href === activePath ? 'page' : undefined}
                  onClick={event => handleSelect(event, item.href)}
                  className="slime-wobble flex min-h-11 items-center gap-3 rounded-full px-4 text-sm display-text text-primary-foreground outline-none hover:bg-primary-foreground/15 focus-visible:bg-primary-foreground/15 aria-[current=page]:bg-background aria-[current=page]:text-foreground">
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <svg aria-hidden className="absolute top-full left-0 h-5 w-full text-primary">
            <rect width="100%" height="20" fill="url(#header-drip)" />
          </svg>
        </div>
      </div>

      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          'absolute inset-x-0 top-full -z-10 h-dvh bg-black/40 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
    </div>
  )
}
