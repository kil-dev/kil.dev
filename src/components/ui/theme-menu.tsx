'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/utils'
import { motion } from 'motion/react'
import { useMemo } from 'react'

type IconComponent = React.ComponentType<{ className?: string }>

export type ThemeMenuOption = {
  label: string
  value: string
  Icon: IconComponent
}

export function ThemeMenu({
  open,
  options,
  optionsWidthCh,
  optionRefs,
  optionsRef,
  onOptionClick,
  onKeyDown,
  leftSlot,
  bottomSlot,
}: {
  open: boolean
  options: ThemeMenuOption[]
  optionsWidthCh: number
  optionRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>
  optionsRef: React.MutableRefObject<HTMLDivElement | null>
  onOptionClick: (value: string, e: React.MouseEvent<HTMLButtonElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
  leftSlot?: React.ReactNode
  bottomSlot?: React.ReactNode
}) {
  const menuVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: -4 },
      show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
    }),
    [],
  )

  return (
    <div
      id="theme-options"
      ref={optionsRef}
      suppressHydrationWarning
      role="menu"
      aria-label="Select theme"
      aria-hidden={!open}
      inert={!open}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={cn(
        'absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[120]',
        'flex flex-col items-stretch gap-3',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}>
      <fieldset
        className={cn(
          'p-3 pt-8 transition-all duration-200 ease-out relative',
          open ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible -translate-y-2 scale-95',
        )}
        style={{ width: `min(92vw, ${optionsWidthCh}ch)` }}>
        <legend className="sr-only">Theme controls</legend>

        <div className="flex items-start gap-2">
          {leftSlot ? <div className="shrink-0 pt-1 relative">{leftSlot}</div> : null}
          <div className="max-h-[48vh] overflow-hidden flex-1">
            <motion.div
              className="overflow-y-auto overflow-x-hidden no-scrollbar pr-1 flex flex-col gap-1"
              initial="hidden"
              animate={open ? 'show' : 'hidden'}
              variants={menuVariants}>
              {options.map(opt => (
                <motion.div key={opt.value} variants={{ hidden: { opacity: 0, y: -4 }, show: { opacity: 1, y: 0 } }}>
                  <Button
                    ref={el => {
                      const idx = options.findIndex(o => o.value === opt.value)
                      optionRefs.current[idx] = el
                    }}
                    onClick={e => onOptionClick(opt.value, e)}
                    role="menuitem"
                    aria-label={opt.label}
                    title={opt.label}
                    variant="ghost"
                    size="sm"
                    className={cn('flex w-full hover:bg-accent/70 justify-start gap-2 rounded-md')}>
                    <span className="grid size-7 place-items-center shrink-0">
                      <opt.Icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium text-foreground/90">{opt.label}</span>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {bottomSlot}
      </fieldset>
    </div>
  )
}
