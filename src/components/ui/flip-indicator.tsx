'use client'

import { cn } from '@/utils/utils'
import { RefreshCcwIcon } from 'lucide-react'

interface FlipIndicatorProps {
  labelMobile?: string
  labelDesktop?: string
  className?: string
}

export function FlipIndicator({ labelMobile = 'Tap to flip', labelDesktop = 'Flip', className }: FlipIndicatorProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-2 right-2 z-20 inline-flex items-center gap-1 rounded-md bg-background/70 px-2 py-1 text-[10px] font-medium text-foreground/80 opacity-100 ring-1 ring-border transition-opacity md:text-xs md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100',
        className,
      )}>
      <RefreshCcwIcon className="size-3 opacity-80" />
      <span className="md:hidden">{labelMobile}</span>
      <span className="hidden md:inline">{labelDesktop}</span>
    </div>
  )
}
