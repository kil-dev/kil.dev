'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'

import { cn } from '@/utils/utils'

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    if (typeof document === 'undefined') return

    const ensureContainer = (): HTMLElement => {
      const existing = document.querySelector('[data-april-fools-tooltip-portal]')
      if (existing instanceof HTMLElement) return existing
      const el = document.createElement('div')
      el.dataset.aprilFoolsTooltipPortal = ''
      el.style.position = 'fixed'
      el.style.inset = '0'
      el.style.transform = 'rotate(-180deg)'
      el.style.transformOrigin = '50% 50%'
      el.style.pointerEvents = 'none'
      if (globalThis.window !== undefined) {
        const computed = globalThis.window.getComputedStyle(document.body)
        const bodyFont = computed?.fontFamily
        if (bodyFont) el.style.fontFamily = bodyFont
      }
      el.style.zIndex = '2147483646'
      document.body.append(el)
      return el
    }

    const updateFromClass = () => {
      const active = document.documentElement.classList.contains('april-fools')
      if (active) {
        setPortalContainer(ensureContainer())
        return
      }
      const existing = document.querySelector('[data-april-fools-tooltip-portal]')
      if (existing instanceof HTMLElement) existing.remove()
      setPortalContainer(null)
    }

    updateFromClass()

    // Observe theme class changes so this reacts without a full refresh
    const observer = new MutationObserver(updateFromClass)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const content = (
    <TooltipPrimitive.Content
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      className={cn(
        'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[200] w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance overflow-visible relative',
        className,
      )}
      {...props}>
      <div className="kd-tooltip-inner">{children}</div>
      <TooltipPrimitive.Arrow className="bg-primary fill-primary z-0 pointer-events-none size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
    </TooltipPrimitive.Content>
  )

  return portalContainer ? (
    <TooltipPrimitive.Portal container={portalContainer}>{content}</TooltipPrimitive.Portal>
  ) : (
    <TooltipPrimitive.Portal>{content}</TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
