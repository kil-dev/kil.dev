'use client'

import type { Route } from 'next'
import Link from 'next/link'
import * as React from 'react'

import type { IconComponent } from '@/types/themes'
import { cn } from '@/utils/utils'

type Position = { x: number; y: number }

interface MobileNavButtonProps {
  href: Route
  label: string
  Icon: IconComponent
  isActive: boolean
  open: boolean
  closing: boolean
  position: Position
  transitionDelayMs: number
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

export const MobileNavButton = React.forwardRef<HTMLAnchorElement, MobileNavButtonProps>(function MobileNavButton(
  { href, label, Icon, isActive, open, closing, position, transitionDelayMs, onClick },
  ref,
) {
  const { x, y } = position
  const openTransform = `translate(${Math.round(x)}px, ${Math.round(y)}px) rotate(0deg) scale(1)`
  const closedTransform = 'translate(-6px, -6px) rotate(-6deg) scale(0.9)'

  return (
    <li role="none" className="relative">
      <Link
        ref={ref}
        role="menuitem"
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          open || closing ? 'pointer-events-auto' : 'pointer-events-none',
          'group grid grid-cols-[2rem_auto] items-center gap-1 overflow-hidden rounded-full px-2 py-2 whitespace-nowrap backface-hidden',
          'bg-background/95 shadow-xs ring-1 ring-border',
          'transition-[transform,opacity,background-color,color] ease-in-out will-change-transform',
          closing ? 'duration-200' : 'duration-300',
          'hover:bg-accent/70 hover:text-accent-foreground focus:bg-accent/70 focus:text-accent-foreground',
          isActive ? 'bg-accent/80 text-accent-foreground' : 'text-muted-foreground',
        )}
        style={{
          transform: closing ? closedTransform : open ? openTransform : closedTransform,
          opacity: closing ? 0 : open ? 1 : 0,
          transitionDelay: `${transitionDelayMs}ms`,
          willChange: 'transform, opacity',
          transformOrigin: 'left top',
        }}
        onClick={e => {
          e.preventDefault()
          if (onClick) onClick(e)
        }}>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/20 text-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="pr-2 text-sm font-medium tracking-wide">{label}</span>
      </Link>
    </li>
  )
})
